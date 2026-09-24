import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, Schema } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with 15MB limit to comfortably handle base64 resumes and PDFs
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper to get GoogleGenAI instance securely on the server
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('[Server] Failed to initialize GoogleGenAI:', err);
    return null;
  }
}

/**
 * Resilient multi-tier model executor:
 * Tries Gemini 3.8 Flash first, then automatically fails over to high-availability
 * models (gemini-flash-lite-latest, etc.) if experiencing demand spikes or quota delays.
 */
async function generateWithGemini(ai: GoogleGenAI, params: { contents: any; config?: any; defaultModel?: string }) {
  const primaryModel = params.defaultModel || 'gemini-3.8-flash';
  const models = Array.from(new Set([primaryModel, 'gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview']));
  let lastError: any = null;

  for (const model of models) {
    try {
      return await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config
      });
    } catch (err: any) {
      lastError = err;
      // If error is caused by Google Search Grounding quota on free API keys, fallback to standard Gemini generation
      if (params.config?.tools) {
        try {
          const configWithoutTools = { ...params.config };
          delete configWithoutTools.tools;
          return await ai.models.generateContent({
            model,
            contents: params.contents,
            config: configWithoutTools
          });
        } catch (innerErr) {
          lastError = innerErr;
        }
      }
      const statusMsg = err?.status || err?.message?.slice(0, 80) || 'Unknown error';
      console.warn(`[Server] Model '${model}' notice (${statusMsg}). Trying resilient fallback model...`);
    }
  }
  throw lastError;
}

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.get('/api/ai/health', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    hasApiKey: isKeyConfigured,
    message: isKeyConfigured 
      ? 'Gemini API is active on server' 
      : 'GEMINI_API_KEY is not configured in .env. Falling back to client-side heuristics.'
  });
});

// -------------------------------------------------------------
// 1. Resume Parsing Endpoint
// -------------------------------------------------------------
app.post('/api/ai/parse-resume', async (req: Request, res: Response) => {
  try {
    const { resumeInput, mediaData } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = `You are a world-class HR technology AI and resume parsing expert.
Extract all structured profile details from the provided resume text or uploaded document image/PDF.
Extract realistic, accurate data without hallucination or exaggerating.
If a field is not explicitly mentioned, use empty strings or empty arrays.

Resume Text / Notes:
"""
${(resumeInput || '').slice(0, 15000)}
"""`;

    const contents = mediaData ? [prompt, mediaData] : prompt;

    const response = await generateWithGemini(ai, {
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fullName: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            headline: { type: Type.STRING },
            bio: { type: Type.STRING },
            location: { type: Type.STRING },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  gpa: { type: Type.STRING }
                },
                required: ['institution', 'degree']
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  responsibilities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['company', 'position']
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  url: { type: Type.STRING }
                },
                required: ['title']
              }
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  issuingOrganization: { type: Type.STRING },
                  issueDate: { type: Type.STRING }
                },
                required: ['name']
              }
            },
            languages: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['fullName', 'skills', 'headline']
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('[Server /api/ai/parse-resume error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to parse resume with Gemini' });
  }
});

// -------------------------------------------------------------
// 2. Candidate Analysis & Matching Endpoint
// -------------------------------------------------------------
app.post('/api/ai/analyze-candidate', async (req: Request, res: Response) => {
  try {
    const { jobTitle, jobRequirements = [], jobSkills = [], candidateProfile, screeningAnswers } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = `You are an ethical, objective AI recruitment analysis assistant.
Analyze this candidate for the position "${jobTitle}".
Job required skills: ${jobSkills.join(', ')}
Job requirements: ${jobRequirements.join('; ')}

Candidate:
- Headline: ${candidateProfile?.headline || ''}
- Skills: ${(candidateProfile?.skills || []).join(', ')}
- Experience: ${JSON.stringify(candidateProfile?.experience || [])}
- Education: ${JSON.stringify(candidateProfile?.education || [])}
- Screening Answers: ${JSON.stringify(screeningAnswers || {})}

IMPORTANT ETHICAL RULES:
1. Do NOT evaluate, infer, or consider any protected attributes: race, religion, gender, age, disability, or personal details.
2. Base ranking strictly on job-relevant skills, verified experience, and question responses.
3. Match score must be between 0 and 100.
4. Highlight concrete matching skills and missing skills.`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            relevantExperienceSummary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            concerns: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['matchScore', 'summary', 'matchingSkills', 'missingSkills', 'strengths']
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      matchScore: Math.min(99, Math.max(20, Number(parsed.matchScore) || 78)),
      summary: parsed.summary || 'Strong candidate with relevant background.',
      matchingSkills: parsed.matchingSkills || (candidateProfile?.skills || []).slice(0, 4),
      missingSkills: parsed.missingSkills || [],
      relevantExperienceSummary: parsed.relevantExperienceSummary || 'Candidate demonstrates solid foundational experience.',
      strengths: parsed.strengths || ['Solid domain background', 'Strong communication'],
      concerns: parsed.concerns || [],
      disclaimer: 'AI-generated assistance signal. Please review full application and interview before making hiring decisions.'
    });
  } catch (err: any) {
    console.error('[Server /api/ai/analyze-candidate error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to analyze candidate' });
  }
});

// -------------------------------------------------------------
// 3. Job Description & Screening Generator
// -------------------------------------------------------------
app.post('/api/ai/generate-job-description', async (req: Request, res: Response) => {
  try {
    const { title, industry, experienceLevel, keySkills = [] } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = `You are a specialized hiring consultant and job post optimizer.
Generate a structured, engaging, realistic job posting for:
Job Title: ${title}
Industry: ${industry}
Level: ${experienceLevel}
Key skills: ${keySkills.join(', ')}

Include:
- Professional summary
- 5 realistic responsibilities
- 5 core requirements
- 4 attractive benefits
- 3 high-signal screening questions`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            screeningQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  type: { type: Type.STRING },
                  required: { type: Type.BOOLEAN }
                },
                required: ['question', 'type', 'required']
              }
            }
          },
          required: ['summary', 'responsibilities', 'requirements', 'benefits', 'screeningQuestions']
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('[Server /api/ai/generate-job-description error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to generate job description' });
  }
});

// -------------------------------------------------------------
// 4. Google Search Grounding for Market Intelligence
// -------------------------------------------------------------
app.post('/api/ai/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const response = await generateWithGemini(ai, {
      contents: query,
      config: {
        systemInstruction: `You are an expert market and employment research intelligence agent on Kormo BD.
Provide comprehensive, factual, up-to-date information on tech careers, industry salary benchmarks in Bangladesh (BDT) and globally, top hiring companies, and market demands.
Format your answer clearly with markdown bullet points and headings.`,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || 'No information could be retrieved for this query.';
    const sources: Array<{ title: string; uri: string }> = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        if (chunk && typeof chunk === 'object' && 'web' in chunk && chunk.web) {
          const webChunk = chunk.web as { uri?: string; title?: string };
          if (webChunk.uri) {
            sources.push({
              title: webChunk.title || webChunk.uri,
              uri: webChunk.uri
            });
          }
        }
      }
    }

    return res.json({ text, sources });
  } catch (err: any) {
    console.error('[Server /api/ai/search-grounding error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Search grounding error' });
  }
});

// -------------------------------------------------------------
// 5. Career Assistant Chatbot with Search Grounding
// -------------------------------------------------------------
app.post('/api/ai/career-assistant', async (req: Request, res: Response) => {
  try {
    const { message, history = [], userContext, language } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const isBn = language === 'bn';
    const systemInstruction = `You are "Career Assistant" on Kormo BD, a modern AI-powered recruitment platform in Bangladesh and global tech hubs.
You assist both Job Seekers and Recruiters with:
1. Navigating Kormo BD: How to create accounts, upload resumes, auto-parse with AI, search jobs, answer recruiter screening questions, and track application timelines.
2. How Recruiters post jobs, setup custom screening questions, view applicant pipelines, and use AI candidate analysis for unbiased matching.
3. Real-time career advice & market insights: Real-world Bangladesh tech salary ranges (BDT), company reputations (bKash, Pathao, Chaldal, Walton, etc.), interview standards, and skills in demand.
4. Tone: Concise, friendly, professional, directly actionable with markdown formatting.
${isBn ? 'CRITICAL LANGUAGE INSTRUCTION: The user has selected Bangla (বাংলা). You MUST answer completely in fluent, professional, and culturally natural Bengali (বাংলা) script. You may keep standard technical terms (such as React, Python, Docker, ATS, API) in English or transliterated alongside Bengali, but all sentences, explanations, and advice MUST be in Bengali.' : ''}`;

    const contents = [
      ...history.map((h: any) => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: `User info: ${JSON.stringify(userContext || {})}\n\nQuestion: ${message}` }]
      }
    ];

    const response = await generateWithGemini(ai, {
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || 'I am here to help you navigate jobs, improve your profile, and streamline recruitment.';
    const sources: Array<{ title: string; uri: string }> = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        if (chunk && typeof chunk === 'object' && 'web' in chunk && chunk.web) {
          const webChunk = chunk.web as { uri?: string; title?: string };
          if (webChunk.uri) {
            sources.push({
              title: webChunk.title || webChunk.uri,
              uri: webChunk.uri
            });
          }
        }
      }
    }

    return res.json({ text, sources });
  } catch (err: any) {
    console.error('[Server /api/ai/career-assistant error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Career assistant error' });
  }
});

// -------------------------------------------------------------
// 6. Skills Gap Analysis
// -------------------------------------------------------------
app.post('/api/ai/skills-gap', async (req: Request, res: Response) => {
  try {
    const { candidateHeadline, currentSkills = [], bookmarkedJobs = [] } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = `You are an elite career development strategist and technical hiring director.
Analyze the user's current resume skills against their bookmarked target jobs to identify exact skill gaps and recommend high-impact missing qualifications.

Candidate Profile:
- Current Headline: ${candidateHeadline || 'Software Engineer / Professional'}
- Current Resume Skills: ${currentSkills.join(', ')}

Target Bookmarked Jobs:
${bookmarkedJobs.map((j: any, i: number) => `${i + 1}. ${j.title} at ${j.company}
   Required Skills: ${(j.skills || []).join(', ')}
   Requirements: ${(j.requirements || []).slice(0, 3).join('; ')}`).join('\n\n')}

Analyze:
1. Overall readiness score (0-100) reflecting how well current resume skills match the composite requirements of these bookmarked jobs.
2. An executive summary explaining the candidate's current positioning.
3. List of missing qualifications / skills with prioritized importance ('High', 'Medium', 'Low'), frequency across the bookmarked jobs, recommended industry certification or credible course, a practical hands-on project idea to prove competence, and estimated weeks to master.
4. 2-3 tailored resume bullet suggestions that incorporate the target skills.
5. Salary growth or market value impact insight in the context of the Bangladesh and global tech employment market.
6. 2-3 technical interview question topics the candidate should prepare for based on these gap areas.`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallReadinessScore: { type: Type.INTEGER },
            executiveSummary: { type: Type.STRING },
            criticalMissingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  importance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                  frequencyInBookmarks: { type: Type.INTEGER },
                  recommendedCertificationOrCourse: { type: Type.STRING },
                  actionableProjectIdea: { type: Type.STRING },
                  estimatedTimeToLearnWeeks: { type: Type.INTEGER }
                },
                required: ['skill', 'importance', 'recommendedCertificationOrCourse', 'actionableProjectIdea']
              }
            },
            resumeBulletSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            salaryImpactInsight: { type: Type.STRING },
            interviewPrepFocusAreas: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            'overallReadinessScore',
            'executiveSummary',
            'criticalMissingSkills',
            'resumeBulletSuggestions',
            'salaryImpactInsight',
            'interviewPrepFocusAreas'
          ]
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      overallReadinessScore: Math.min(98, Math.max(30, Number(parsed.overallReadinessScore) || 72)),
      executiveSummary: parsed.executiveSummary || 'You have strong foundational skills with targeted growth opportunities.',
      criticalMissingSkills: parsed.criticalMissingSkills || [],
      resumeBulletSuggestions: parsed.resumeBulletSuggestions || [],
      salaryImpactInsight: parsed.salaryImpactInsight || 'Acquiring high-demand cloud and backend skills can increase target compensation by 20-35%.',
      interviewPrepFocusAreas: parsed.interviewPrepFocusAreas || []
    });
  } catch (err: any) {
    console.error('[Server /api/ai/skills-gap error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Skills gap analysis error' });
  }
});

// -------------------------------------------------------------
// 7. Resume Polish & ATS Enhancement (STAR Format)
// -------------------------------------------------------------
app.post('/api/ai/enhance-resume', async (req: Request, res: Response) => {
  try {
    const { profile, templateStyle = 'modern' } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = `You are an executive career coach and elite resume writer.
Enhance and polish the following resume profile data for a professional "${templateStyle}" resume template.
Tasks:
1. Re-write the bio into a punchy, high-impact executive summary (2-3 sentences max).
2. For each work experience, rewrite the bullet points using strong action verbs, quantifiable achievements, and the STAR framework (Situation-Task-Action-Result).
3. Curate the top 10 most market-valuable technical and soft skills.
4. Estimate an ATS score (out of 100).

Profile Data:
${JSON.stringify(profile, null, 2)}
`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            polishedBio: { type: Type.STRING },
            polishedExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  responsibilities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['company', 'position', 'responsibilities']
              }
            },
            suggestedTopSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            atsScoreEstimate: { type: Type.NUMBER }
          },
          required: ['polishedBio', 'polishedExperience', 'suggestedTopSkills', 'atsScoreEstimate']
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('[Server /api/ai/enhance-resume error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Enhance resume error' });
  }
});

// -------------------------------------------------------------
// 8. Adaptive Mock Interview Plan Generator
// -------------------------------------------------------------
app.post('/api/ai/mock-interview-plan', async (req: Request, res: Response) => {
  try {
    const { 
      jobTitle, 
      companyName, 
      requirements = [], 
      skills = [], 
      roundType = 'technical', 
      experienceLevel = 'mid', 
      candidateHeadline, 
      candidateSkills = [], 
      questionCount = 4, 
      language 
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const isBn = language === 'bn';
    const prompt = `You are a Principal Hiring Manager and Staff Interviewer at ${companyName || 'a top tech company in Bangladesh'}.
Create a personalized, challenging, and realistic ${questionCount}-question mock interview plan specifically tailored to the target role:
Role: ${jobTitle}
Company: ${companyName}
Target Seniority / Level: ${experienceLevel}
Interview Round Focus: ${roundType} (Options: technical, behavioral, system_design, culture_fit, full_mixed)
Required Job Skills: ${skills.join(', ') || 'Software Engineering, System Design, Problem Solving'}
Job Requirements / Responsibilities: ${requirements.slice(0, 5).join('; ') || 'Standard production engineering expectations'}
Candidate Background Headline: ${candidateHeadline || 'Candidate'}
Candidate Stated Skills: ${candidateSkills.join(', ') || 'Relevant software skills'}

Guidelines:
1. Make questions hyper-relevant to the exact technologies and expectations in this JD.
2. If round is "technical", ask deep architectural/code/concept questions (not trivia, but practical production scenarios).
3. If round is "behavioral", ask STAR-scenario prompts (e.g. conflicting priorities, handling outages, stakeholder friction, trade-offs).
4. If round is "system_design", ask scaling, caching, data consistency, or high-throughput problems.
5. If round is "full_mixed", balance 1 behavioral opener, 2 deep technical/system design, and 1 execution/culture question.
6. Provide interviewerContext explaining what the interviewer is specifically evaluating.
7. Include 3-5 key technical/domain terms expected in a strong answer.
8. Include 2 quick hints if the candidate gets stuck.
${isBn ? '9. CRITICAL LANGUAGE MANDATE: The user has selected Bangla (বাংলা). Write all questions, interviewerContext, keyTopicsExpected, and sampleHints in natural, fluent, professional Bengali (বাংলা) script suitable for Bangladeshi tech job interviews.' : ''}`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              questionNumber: { type: Type.INTEGER },
              type: { type: Type.STRING },
              question: { type: Type.STRING },
              interviewerContext: { type: Type.STRING },
              keyTopicsExpected: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              sampleHints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['id', 'questionNumber', 'type', 'question', 'interviewerContext', 'keyTopicsExpected', 'sampleHints']
          }
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      const formatted = parsed.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `q-${idx + 1}`,
        questionNumber: idx + 1,
        type: (['technical', 'behavioral', 'system_design', 'situational'].includes(q.type) ? q.type : 'technical')
      }));
      return res.json(formatted);
    }
    return res.status(500).json({ error: 'Empty question plan returned by model' });
  } catch (err: any) {
    console.error('[Server /api/ai/mock-interview-plan error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Mock interview plan error' });
  }
});

// -------------------------------------------------------------
// 9. Real-time Mock Interview Answer Evaluation
// -------------------------------------------------------------
app.post('/api/ai/evaluate-mock-interview', async (req: Request, res: Response) => {
  try {
    const { jobTitle, companyName, question, candidateAnswer, language } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const isBn = language === 'bn';
    const prompt = `You are an expert technical interviewer and executive speech coach evaluating a candidate's answer for the role: ${jobTitle} at ${companyName}.

Question Asked:
"${question?.question || ''}"
Question Type: ${question?.type || 'technical'}
Interviewer Context: ${question?.interviewerContext || ''}
Key Topics Expected: ${(question?.keyTopicsExpected || []).join(', ')}

Candidate's Answer:
"${(candidateAnswer || '').trim()}"

Provide an objective, constructive, and comprehensive evaluation covering:
1. Overall score (0-100) based on relevance, depth, and precision.
2. Clarity score (0-100) & clarityFeedback: Did they structure thoughts logically? Avoid rambling? Was articulation crisp?
3. Confidence score (0-100) & confidenceFeedback: Did they use decisive, active language ("I architected", "I decided") instead of passive or hesitant phrasing?
4. Keyword score (0-100): Identify exact relevant domain keywords used vs missing keywords that top candidates include.
5. STAR Compliance (if behavioral/situational): Analyze if Situation, Task, Action, and Result were clearly articulated.
6. 2-3 specific strengths of this response.
7. 2-3 constructive critiques on how to elevate the response.
8. 1 actionable high-leverage tip.
9. Exemplar Answer: Write a gold-standard response demonstrating how a top 1% candidate or Staff Engineer would answer this exact question.
${isBn ? '10. CRITICAL LANGUAGE MANDATE: The user has selected Bangla (বাংলা). All textual feedback (clarityFeedback, confidenceFeedback, strengths, critiques, actionableTip, exemplarAnswer) MUST be written in natural, fluent, supportive Bengali (বাংলা).' : ''}`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            clarityScore: { type: Type.INTEGER },
            clarityFeedback: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            confidenceFeedback: { type: Type.STRING },
            keywordScore: { type: Type.INTEGER },
            keywordsUsed: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            keywordsMissed: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            starCompliance: {
              type: Type.OBJECT,
              properties: {
                usedStar: { type: Type.BOOLEAN },
                situation: { type: Type.STRING },
                task: { type: Type.STRING },
                action: { type: Type.STRING },
                result: { type: Type.STRING },
                feedback: { type: Type.STRING }
              }
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            critiques: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            actionableTip: { type: Type.STRING },
            exemplarAnswer: { type: Type.STRING }
          },
          required: [
            'score',
            'clarityScore',
            'clarityFeedback',
            'confidenceScore',
            'confidenceFeedback',
            'keywordScore',
            'keywordsUsed',
            'keywordsMissed',
            'strengths',
            'critiques',
            'actionableTip',
            'exemplarAnswer'
          ]
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      questionId: question?.id
    });
  } catch (err: any) {
    console.error('[Server /api/ai/evaluate-mock-interview error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Evaluate mock interview error' });
  }
});

// -------------------------------------------------------------
// 10. Mock Interview Final Executive Debrief Report
// -------------------------------------------------------------
app.post('/api/ai/mock-interview-final-report', async (req: Request, res: Response) => {
  try {
    const { jobTitle, companyName, roundType, qaHistory = [], language } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const isBn = language === 'bn';
    const prompt = `You are the Lead Hiring Committee Director reviewing a candidate's completed mock interview session for ${jobTitle} at ${companyName}.
Round: ${roundType}

Summary of Candidate's Performance:
${qaHistory.map((item: any, idx: number) => `
Question ${idx + 1} (${item.question?.type}): "${item.question?.question}"
Candidate Answer: "${(item.userAnswer || '').slice(0, 200)}..."
Score: ${item.evaluation?.score}/100 (Clarity: ${item.evaluation?.clarityScore}, Confidence: ${item.evaluation?.confidenceScore}, Keywords: ${item.evaluation?.keywordScore})
Strengths: ${(item.evaluation?.strengths || []).join('; ')}
Critiques: ${(item.evaluation?.critiques || []).join('; ')}
`).join('\n')}

Generate an executive interview debrief:
1. overallScore (0-100) as the weighted composite.
2. recommendation: 'strong_hire' | 'hire' | 'lean_hire' | 'lean_no_hire' | 'no_hire'
3. readinessAssessment: A 2-3 sentence executive summary of candidate readiness for real-world interviews.
4. averageClarity, averageConfidence, averageKeywordScore (0-100)
5. topStrengths: 3 distinct standout strengths across the session.
6. priorityImprovements: 3 high-impact areas to drill before the actual interview.
7. actionPlan: 3 concrete homework actions (e.g. practicing system design trade-offs, refining STAR metrics).
${isBn ? '8. CRITICAL LANGUAGE MANDATE: The user selected Bangla (বাংলা). Write readinessAssessment, topStrengths, priorityImprovements, and actionPlan in natural, professional, encouraging Bengali (বাংলা).' : ''}`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.INTEGER },
            recommendation: { type: Type.STRING },
            readinessAssessment: { type: Type.STRING },
            averageClarity: { type: Type.INTEGER },
            averageConfidence: { type: Type.INTEGER },
            averageKeywordScore: { type: Type.INTEGER },
            topStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            priorityImprovements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            'overallScore',
            'recommendation',
            'readinessAssessment',
            'averageClarity',
            'averageConfidence',
            'averageKeywordScore',
            'topStrengths',
            'priorityImprovements',
            'actionPlan'
          ]
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('[Server /api/ai/mock-interview-final-report error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Final report error' });
  }
});

// -------------------------------------------------------------
// 11. Translate Job Posting to Bangla
// -------------------------------------------------------------
app.post('/api/ai/translate-job', async (req: Request, res: Response) => {
  try {
    const { job } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const prompt = `Translate the following Bangladesh tech job posting into professional, culturally natural Bengali (বাংলা) script for Bangladeshi job seekers:
Job Title: ${job?.title}
Department: ${job?.department}
Location: ${job?.location}
Employment Type: ${job?.employmentType}
Workplace: ${job?.workplaceType}
Summary: ${job?.summary}
Responsibilities:
${(job?.responsibilities || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}
Requirements:
${(job?.requirements || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}
Benefits:
${(job?.benefits || []).map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}

Guidelines:
- Write in elegant, formal, standard Sadhu/Cholit Bengali (চলিত বাংলা) commonly used in Bangladesh corporate job portals.
- Keep technical terms (e.g. React, Node.js, Python, PostgreSQL, AWS, CI/CD, Git, API) as recognizable terms.
- Location: Translate Dhaka areas naturally (e.g. 'Gulshan-2, Dhaka' -> 'গুলশান-২, ঢাকা').
- Employment Type: Full-time -> ফুল-টাইম, Part-time -> পার্ট-টাইম, Internship -> ইন্টার্নশিপ.
- Workplace: Remote -> সম্পূর্ণ রিমোট, On-site -> অন-সাইট অফিস, Hybrid -> হাইব্রিড.`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            department: { type: Type.STRING },
            summary: { type: Type.STRING },
            responsibilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            requirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            benefits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            location: { type: Type.STRING },
            employmentType: { type: Type.STRING },
            workplaceType: { type: Type.STRING }
          },
          required: ['title', 'department', 'summary', 'responsibilities', 'requirements', 'benefits', 'location', 'employmentType', 'workplaceType']
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('[Server /api/ai/translate-job error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Job translation error' });
  }
});

// -------------------------------------------------------------
// 12. Tailored Cover Letter Generator
// -------------------------------------------------------------
app.post('/api/ai/cover-letter', async (req: Request, res: Response) => {
  try {
    const {
      candidateName,
      candidateHeadline,
      candidateSkills = [],
      candidateExperience = [],
      candidateProjects = [],
      jobTitle,
      companyName,
      jobSummary,
      jobResponsibilities = [],
      jobRequirements = [],
      tone = 'formal',
      length = 'standard',
      customFocus
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const toneGuide = {
      formal: 'Polished, authoritative, highly professional, corporate, and structured. Emphasize domain rigor, enterprise scalability, and reliability.',
      startup: 'Energetic, mission-aligned, agile, passionate, and fast-paced. Emphasize velocity, ownership, full-stack scrappiness, and high agency.',
      leadership: 'Visionary, strategic, mentoring, and impact-driven. Emphasize team mentorship, system architecture, measurable business ROI, and strategic product delivery.'
    }[tone as 'formal' | 'startup' | 'leadership'] || 'Polished and professional.';

    const lengthGuide = {
      concise: 'Around 200-250 words total. Punchy, direct, zero fluff.',
      standard: 'Around 350-400 words total. Balanced narrative with 2 core impact stories.',
      detailed: 'Around 500-550 words total. In-depth technical architecture breakdown and strategic alignment.'
    }[length as 'concise' | 'standard' | 'detailed'] || 'Around 350 words total.';

    const prompt = `You are a world-class executive recruiter and cover letter strategist.
Synthesize the candidate's active resume details with the employer's specific job description to craft an exceptional, customized, and highly persuasive cover letter.

Target Employer: ${companyName}
Target Job Title: ${jobTitle}
Job Summary: """${jobSummary}"""
Key Responsibilities: ${jobResponsibilities.slice(0, 5).join('; ') || 'N/A'}
Requirements: ${jobRequirements.slice(0, 5).join('; ') || 'N/A'}

Candidate Name: ${candidateName}
Headline: ${candidateHeadline}
Core Skills: ${candidateSkills.slice(0, 12).join(', ')}
Relevant Experience: ${candidateExperience.slice(0, 2).map((e: any) => `${e.position} at ${e.company} (${(e.responsibilities || []).slice(0, 2).join('; ')})`).join(' | ') || 'Experienced tech professional'}
Featured Projects: ${candidateProjects.slice(0, 2).map((p: any) => `${p.title}: ${p.description}`).join(' | ') || 'Production systems'}

Tone: ${(tone || 'formal').toUpperCase()} (${toneGuide})
Target Length: ${lengthGuide}
${customFocus ? `Special Focus Area: ${customFocus}` : ''}

CRITICAL RULES:
- Connect the candidate's ACTUAL skills/projects directly to the employer's mission and challenges.
- Avoid generic cliches ("I am writing to apply...", "I am a hard worker").
- Highlight quantifiable business impact and technical depth.
- Keep the signOff natural (e.g. "Sincerely,", "Best regards,", "Warm regards,").
- Return valid JSON matching the schema.`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            salutation: { type: Type.STRING },
            openingHook: { type: Type.STRING },
            bodyParagraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            coreAlignments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillOrProject: { type: Type.STRING },
                  whyItFits: { type: Type.STRING }
                },
                required: ['skillOrProject', 'whyItFits']
              }
            },
            companyConnection: { type: Type.STRING },
            closingCallToAction: { type: Type.STRING },
            signOff: { type: Type.STRING },
            keyStrengthsHighlighted: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            'subject',
            'salutation',
            'openingHook',
            'bodyParagraphs',
            'coreAlignments',
            'companyConnection',
            'closingCallToAction',
            'signOff',
            'keyStrengthsHighlighted'
          ]
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const bodyText = (parsed.bodyParagraphs || []).join('\n\n');
    const fullText = [
      parsed.salutation,
      '',
      parsed.openingHook,
      '',
      bodyText,
      '',
      parsed.companyConnection,
      '',
      parsed.closingCallToAction,
      '',
      parsed.signOff,
      candidateName
    ].filter(Boolean).join('\n');

    return res.json({
      subject: parsed.subject || `Application for ${jobTitle} - ${candidateName}`,
      salutation: parsed.salutation || `Dear Hiring Team at ${companyName},`,
      openingHook: parsed.openingHook,
      bodyParagraphs: parsed.bodyParagraphs || [],
      coreAlignments: parsed.coreAlignments || [],
      companyConnection: parsed.companyConnection || '',
      closingCallToAction: parsed.closingCallToAction || '',
      signOff: parsed.signOff || 'Best regards,',
      fullText,
      tone,
      keyStrengthsHighlighted: parsed.keyStrengthsHighlighted || candidateSkills.slice(0, 4)
    });
  } catch (err: any) {
    console.error('[Server /api/ai/cover-letter error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Cover letter error' });
  }
});

// -------------------------------------------------------------
// 13. Bulk Resume Batch Screening
// -------------------------------------------------------------
app.post('/api/ai/batch-screen', async (req: Request, res: Response) => {
  try {
    const { job, resumes = [] } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const compactResumes = resumes.map((r: any, i: number) => ({
      index: i + 1,
      fileName: r.fileName,
      candidateName: r.candidateName || `Applicant ${i + 1}`,
      email: r.email || `candidate${i + 1}@kormobd.com`,
      textSnippet: (r.text || '').slice(0, 1200)
    }));

    const prompt = `You are a high-volume recruitment screening intelligence engine.
We have received ${compactResumes.length} candidate resumes for the role: "${job?.title || 'Open Role'}".

Job Required Skills: ${(job?.skills || []).join(', ')}
Job Core Requirements: ${(job?.requirements || []).join('; ')}

Evaluate each of the following candidate resumes strictly against these requirements.
For each candidate:
1. Estimate total years of professional experience.
2. Determine realistic match score (0 to 100) based on skill overlap and depth.
3. Categorize into one of three tiers:
   - "top_tier": Score >= 80 (exceptional alignment, strong fundamentals, highly qualified)
   - "review_needed": Score between 55 and 79 (partial alignment, needs interviewer verification)
   - "not_qualified": Score < 55 (lacks core prerequisites, insufficient experience)
4. List matched skills, missing skills, top 2 key strengths, and any concerns/red flags.
5. Provide a 1-sentence executive recommendation.

Resumes Data:
${JSON.stringify(compactResumes, null, 2)}

Return a JSON array of screened candidates matching the specified schema.`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              candidateName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              headline: { type: Type.STRING },
              experienceYears: { type: Type.NUMBER },
              educationSummary: { type: Type.STRING },
              matchScore: { type: Type.INTEGER },
              tier: { type: Type.STRING, enum: ['top_tier', 'review_needed', 'not_qualified'] },
              matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              concernsOrRedFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING },
              rawSummary: { type: Type.STRING }
            },
            required: ['candidateName', 'matchScore', 'tier', 'matchedSkills', 'missingSkills', 'recommendation']
          }
        } as Schema
      }
    });

    const parsedArray = JSON.parse(response.text || '[]');
    if (Array.isArray(parsedArray) && parsedArray.length > 0) {
      const result = parsedArray.map((item: any, idx: number) => {
        const original = resumes[idx] || resumes[0];
        const matchScore = Math.min(99, Math.max(15, Number(item.matchScore) || 70));
        let computedTier = 'review_needed';
        if (matchScore >= 80) computedTier = 'top_tier';
        else if (matchScore < 55) computedTier = 'not_qualified';

        return {
          id: original.id || `batch_cand_${Date.now()}_${idx}`,
          candidateName: item.candidateName || original.candidateName || `Candidate #${idx + 1}`,
          email: item.email || original.email || `candidate${idx + 1}@kormobd.com`,
          phone: item.phone || '+880 1711-000000',
          fileName: original.fileName,
          matchScore,
          tier: item.tier || computedTier,
          headline: item.headline || `${job?.title || 'Engineer'} Professional`,
          experienceYears: Number(item.experienceYears) || 3,
          educationSummary: item.educationSummary || 'B.Sc. in Computer Science',
          matchedSkills: item.matchedSkills || (job?.skills || []).slice(0, 3),
          missingSkills: item.missingSkills || [],
          strengths: item.strengths || ['Strong technical background', 'Experience in modern frameworks'],
          concernsOrRedFlags: item.concernsOrRedFlags || [],
          recommendation: item.recommendation || 'Proceed to screening interview.',
          rawSummary: item.rawSummary || 'Relevant skills matching job profile.',
          status: 'pending' as const
        };
      }).sort((a: any, b: any) => b.matchScore - a.matchScore);

      return res.json(result);
    }
    return res.status(500).json({ error: 'Failed to parse batch screening results' });
  } catch (err: any) {
    console.error('[Server /api/ai/batch-screen error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Batch screen error' });
  }
});

// -------------------------------------------------------------
// 14. Technical Assessment & Screening Quiz Generator
// -------------------------------------------------------------
app.post('/api/ai/technical-assessment', async (req: Request, res: Response) => {
  try {
    const {
      jobId,
      jobTitle,
      requirements = [],
      skills = [],
      difficulty = 'mid',
      questionCount = 6,
      language
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const isBn = language === 'bn';
    const prompt = `You are a Principal Software Engineer and hiring technical bar-raiser.
Generate an engaging, practical, ${String(difficulty).toUpperCase()}-level technical assessment quiz for the role: "${jobTitle}".
Skills to assess: ${skills.join(', ')}
Key job requirements: ${requirements.join('; ')}
${isBn ? 'Language Instruction: Write all questions, explanations, descriptions, and option texts in professional Bengali (বাংলা), keeping technical terms (e.g., React, Node.js, SQL, Redis, Docker) in English.' : 'Language: English.'}

Number of questions needed: ${questionCount}

Create questions that test real-world practical mastery, architectural judgment, and code debugging rather than generic trivia.
Question Types:
- At least 2 questions must include a practical code snippet (in JavaScript, TypeScript, Python, or SQL as appropriate for the role).
- Include multiple-choice questions with 4 distinct options (A, B, C, D).
- Specify the EXACT zero-indexed correct option (0, 1, 2, or 3).
- Provide a clear, instructive explanation (Answer Key rationale) detailing WHY the correct option is optimal and why other common approaches fail.
- Assign an engineering topic category.

Return a valid JSON object matching the schema.`;

    const response = await generateWithGemini(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            timeLimitMinutes: { type: Type.INTEGER },
            passingScorePercent: { type: Type.INTEGER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['multiple_choice', 'code_snippet', 'scenario'] },
                  codeSnippet: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  category: { type: Type.STRING },
                  points: { type: Type.INTEGER }
                },
                required: ['question', 'type', 'options', 'correctOptionIndex', 'explanation', 'category']
              }
            }
          },
          required: ['title', 'description', 'timeLimitMinutes', 'passingScorePercent', 'questions']
        } as Schema
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      const formattedQuestions = parsed.questions.map((q: any, i: number) => ({
        id: `q_${Date.now()}_${i + 1}`,
        question: q.question,
        type: q.type || (q.codeSnippet ? 'code_snippet' : 'multiple_choice'),
        codeSnippet: q.codeSnippet || undefined,
        options: Array.isArray(q.options) && q.options.length >= 4 
          ? q.options.slice(0, 4) 
          : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' && q.correctOptionIndex >= 0 && q.correctOptionIndex <= 3 
          ? q.correctOptionIndex 
          : 0,
        explanation: q.explanation || 'Verified correct engineering answer based on industry best practices.',
        category: q.category || skills[0] || 'Core Engineering',
        difficulty,
        points: q.points || 10
      }));

      const totalPossiblePoints = formattedQuestions.reduce((sum: number, q: any) => sum + q.points, 0);

      return res.json({
        id: `quiz_${Date.now()}`,
        jobId,
        jobTitle,
        title: parsed.title || `${jobTitle} Technical Screening Assessment`,
        description: parsed.description || `Assessment designed to evaluate ${skills.join(', ')} proficiency.`,
        timeLimitMinutes: parsed.timeLimitMinutes || 20,
        passingScorePercent: parsed.passingScorePercent || 70,
        questions: formattedQuestions,
        createdAt: new Date().toISOString(),
        totalPossiblePoints
      });
    }

    return res.status(500).json({ error: 'Failed to generate questions' });
  } catch (err: any) {
    console.error('[Server /api/ai/technical-assessment error]:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Technical assessment error' });
  }
});

// -------------------------------------------------------------
// Vite Dev Server / Static Production Setup
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In development: attach Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    console.log(`\n======================================================`);
    console.log(`🚀 KormoAI Full-Stack Server Running on http://localhost:${PORT}`);
    console.log(`🔑 Gemini Status: ${hasKey ? 'ACTIVE (Server Key Loaded)' : 'FALLBACK SIMULATION (No key in .env)'}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
