import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { parseResumeWithAI, ParsedResumeResult } from '../services/aiService';
import { ResumeTemplateGallery, ResumeData } from './ResumeTemplateGallery';
import { 
  Sparkles, 
  UploadCloud, 
  Check, 
  FileText, 
  AlertCircle, 
  Edit2, 
  Plus, 
  Trash2, 
  Save, 
  ChevronRight,
  BrainCircuit,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProfileResumeBuilder: React.FC = () => {
  const { jobSeekerProfile, updateJobSeekerProfile } = useAuth();
  const [parsing, setParsing] = useState(false);
  const [rawResumeText, setRawResumeText] = useState('');
  const [extractedData, setExtractedData] = useState<ParsedResumeResult | null>(null);
  const [activeTab, setActiveTab] = useState<'ai_parser' | 'profile_editor' | 'template_gallery'>('ai_parser');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState(jobSeekerProfile?.fullName || '');
  const [headline, setHeadline] = useState(jobSeekerProfile?.headline || '');
  const [bio, setBio] = useState(jobSeekerProfile?.bio || '');
  const [phone, setPhone] = useState(jobSeekerProfile?.phone || '');
  const [location, setLocation] = useState(jobSeekerProfile?.location || 'Dhaka, Bangladesh');
  const [skills, setSkills] = useState<string[]>(jobSeekerProfile?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileData, setUploadedFileData] = useState<{ inlineData: { data: string; mimeType: string } } | null>(null);

  // Consolidated resume data for live templates
  const currentResumeData: ResumeData = {
    fullName: fullName || jobSeekerProfile?.fullName || '',
    headline: headline || jobSeekerProfile?.headline || '',
    email: jobSeekerProfile?.email || 'seeker@kormoai.bd',
    phone: phone || jobSeekerProfile?.phone || '',
    location: location || jobSeekerProfile?.location || 'Dhaka, Bangladesh',
    website: jobSeekerProfile?.website || jobSeekerProfile?.github || '',
    bio: bio || jobSeekerProfile?.bio || '',
    skills: skills.length > 0 ? skills : (jobSeekerProfile?.skills || []),
    experience: (jobSeekerProfile?.experience && jobSeekerProfile.experience.length > 0)
      ? jobSeekerProfile.experience
      : extractedData?.experience
      ? extractedData.experience.map(e => ({
          company: e.company,
          position: e.position,
          startDate: e.startDate || '2023',
          endDate: e.endDate || 'Present',
          responsibilities: e.responsibilities || []
        }))
      : [],
    education: (jobSeekerProfile?.education && jobSeekerProfile.education.length > 0)
      ? jobSeekerProfile.education
      : extractedData?.education
      ? extractedData.education.map(e => ({
          institution: e.institution,
          degree: e.degree,
          startDate: e.startDate || '2019',
          endDate: e.endDate || '2023',
          gpa: e.gpa || ''
        }))
      : [],
    projects: (jobSeekerProfile?.projects && jobSeekerProfile.projects.length > 0)
      ? jobSeekerProfile.projects
      : extractedData?.projects
      ? extractedData.projects.map(p => ({
          title: p.title,
          description: p.description,
          technologies: p.technologies || [],
          url: p.url
        }))
      : [],
    certifications: jobSeekerProfile?.certifications || []
  };

  // File Upload Handler (PDF, Image, Text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setStatusMessage(`File "${file.name}" selected. Click "Extract Profile with AI" to parse.`);

      const reader = new FileReader();
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          setUploadedFileData({
            inlineData: {
              data: base64String,
              mimeType: file.type || 'application/pdf'
            }
          });
          // Also generate a readable summary placeholder if text wasn't provided
          if (!rawResumeText.trim()) {
            setRawResumeText(`Uploaded Resume Document: ${file.name}\nFile size: ${Math.round(file.size / 1024)} KB\nType: ${file.type}`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // Plain text / markdown
        reader.onload = () => {
          setRawResumeText(reader.result as string);
          setUploadedFileData(null);
        };
        reader.readAsText(file);
      }
    }
  };

  // Trigger AI Resume Extraction
  const handleParseResume = async () => {
    if (!rawResumeText.trim() && !uploadedFileData) {
      setStatusMessage('Please paste your resume text or upload a PDF / image first.');
      return;
    }

    setParsing(true);
    setStatusMessage(null);

    try {
      const result = await parseResumeWithAI(
        rawResumeText || `Resume document: ${uploadedFileName}`,
        uploadedFileData || undefined
      );
      setExtractedData(result);
      setStatusMessage('Resume successfully parsed with AI! Review detected details below.');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error during resume parsing. Please check details.');
    } finally {
      setParsing(false);
    }
  };

  // Apply AI parsed information into profile state
  const handleAcceptAiData = async () => {
    if (!extractedData) return;

    setFullName(extractedData.fullName || fullName);
    setHeadline(extractedData.headline || headline);
    setBio(extractedData.bio || bio);
    if (extractedData.phone) setPhone(extractedData.phone);
    if (extractedData.location) setLocation(extractedData.location);

    const mergedSkills = Array.from(new Set([...skills, ...extractedData.skills]));
    setSkills(mergedSkills);

    await updateJobSeekerProfile({
      fullName: extractedData.fullName || fullName,
      headline: extractedData.headline || headline,
      bio: extractedData.bio || bio,
      phone: extractedData.phone || phone,
      location: extractedData.location || location,
      skills: mergedSkills,
      education: extractedData.education.map((e, idx) => ({
        id: `edu_${Date.now()}_${idx}`,
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy || 'Computer Science',
        startDate: e.startDate || '2019',
        endDate: e.endDate || '2023',
        gpa: e.gpa || ''
      })),
      experience: extractedData.experience.map((exp, idx) => ({
        id: `exp_${Date.now()}_${idx}`,
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate || '2023',
        endDate: exp.endDate || 'Present',
        responsibilities: exp.responsibilities || []
      })),
      projects: extractedData.projects.map((p, idx) => ({
        id: `proj_${Date.now()}_${idx}`,
        title: p.title,
        description: p.description,
        technologies: p.technologies || [],
        url: p.url
      })),
      resumeFileName: 'AI_Extracted_CV.pdf',
      resumeUpdatedAt: new Date().toISOString()
    });

    confetti({ particleCount: 50, spread: 50 });
    setActiveTab('template_gallery');
    setStatusMessage('🎉 Profile populated from AI resume data! Your data is automatically formatted into the 5 professional templates below.');
  };

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async () => {
    await updateJobSeekerProfile({
      fullName,
      headline,
      bio,
      phone,
      location,
      skills
    });
    setStatusMessage('Profile updated successfully!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Sample Resume template for 1-click testing
  const loadSampleResume = () => {
    setRawResumeText(`Tanvir Hossain
Dhaka, Bangladesh | +880 1711-234567 | tanvir.hossain@example.com | github.com/tanvir-dev

SUMMARY:
Results-driven Senior Frontend Engineer with 5+ years building scalable React & TypeScript FinTech web apps, design systems, and responsive user experiences.

TECHNICAL SKILLS:
React, TypeScript, Next.js, Tailwind CSS, GraphQL, Node.js, Zustand, Jest, PostgreSQL, Docker, Git

WORK EXPERIENCE:
Senior Software Engineer — bKash Limited (2023 - Present)
- Architected merchant web portals supporting 150k+ daily transactions with sub-second page loads.
- Reduced frontend bundle size by 35% through dynamic imports and image asset optimization.
- Mentored 4 associate engineers and authored internal TypeScript coding guidelines.

Frontend Developer — Pathao (2021 - 2023)
- Built real-time dispatch dashboard for ride delivery tracking using WebSockets and React.
- Standardized UI component library across 3 engineering squads using Tailwind CSS.

EDUCATION:
Bachelor of Science in Computer Science & Engineering (2017 - 2021)
Bangladesh University of Engineering and Technology (BUET) — CGPA: 3.82/4.00

PROJECTS:
Fintech Analytics Dashboard: High-frequency transaction tracker built with React 19, TypeScript, and Recharts.
OpenSource UI Toolkit: Accessible React components library with 1,200+ GitHub stars.`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-900">AI Profile & Resume Builder</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              AI Powered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Build, parse, or autofill your profile effortlessly with AI extraction.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setActiveTab('ai_parser')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ai_parser' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            1. AI Resume Parser
          </button>
          <button
            onClick={() => setActiveTab('profile_editor')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile_editor' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            2. Edit Profile Details
          </button>
          <button
            onClick={() => setActiveTab('template_gallery')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'template_gallery' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. AI Resume Templates</span>
            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
              5 Pro
            </span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* TAB 1: AI RESUME PARSER */}
      {activeTab === 'ai_parser' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Text / Upload */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              {/* File Upload Dropzone */}
              <div className="border border-dashed border-neutral-300 rounded-xl p-4 text-center hover:border-emerald-500 bg-neutral-50/50 transition-colors">
                <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-neutral-800">
                  {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Upload Resume Document or Image'}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Supports PDF, JPG, PNG, or TXT</p>
                <label className="mt-2.5 inline-block px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs cursor-pointer">
                  Browse File
                  <input
                    type="file"
                    accept=".pdf,image/*,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-3 text-[11px] text-neutral-400 font-medium">OR PASTE RESUME TEXT</span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                    Resume Text / CV Content
                  </h3>
                  <button
                    type="button"
                    onClick={loadSampleResume}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                  >
                    Load Sample Resume
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={rawResumeText}
                  onChange={e => setRawResumeText(e.target.value)}
                  placeholder="Paste the text from your PDF, Word doc, or LinkedIn summary here..."
                  className="w-full p-3 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-neutral-400">
                  Powered by Advanced AI • Structured Extraction
                </span>
                <button
                  onClick={handleParseResume}
                  disabled={parsing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {parsing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" /> Extract Profile with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI Extraction Confirmation Preview */}
          <div className="lg:col-span-6">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    AI Detected Information
                  </h3>
                  {extractedData && (
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Ready for Review
                    </span>
                  )}
                </div>

                {!extractedData ? (
                  <div className="py-16 text-center text-neutral-400">
                    <BrainCircuit className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-xs font-medium text-neutral-600">No extracted data yet</p>
                    <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
                      Paste your resume or click "Load Sample Resume" and press "Extract Profile with AI".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-medium">Full Name:</span>
                        <span className="font-semibold text-neutral-900">{extractedData.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-medium">Headline:</span>
                        <span className="font-semibold text-neutral-900 line-clamp-1">{extractedData.headline}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-medium">Email:</span>
                        <span className="font-semibold text-neutral-900">{extractedData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 font-medium">Location:</span>
                        <span className="font-semibold text-neutral-900">{extractedData.location}</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold text-neutral-700 block mb-1.5">
                        Extracted Skills ({extractedData.skills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedData.skills.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {extractedData.experience.length > 0 && (
                      <div>
                        <span className="font-semibold text-neutral-700 block mb-1">
                          Experience ({extractedData.experience.length})
                        </span>
                        <div className="space-y-1 text-neutral-600">
                          {extractedData.experience.slice(0, 2).map((exp, idx) => (
                            <div key={idx} className="p-2 bg-neutral-50 rounded-lg">
                              <span className="font-medium text-neutral-900">{exp.position}</span> at {exp.company}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {extractedData.education.length > 0 && (
                      <div>
                        <span className="font-semibold text-neutral-700 block mb-1">
                          Education ({extractedData.education.length})
                        </span>
                        <div className="p-2 bg-neutral-50 rounded-lg text-neutral-600">
                          <span className="font-medium text-neutral-900">{extractedData.education[0].degree}</span> — {extractedData.education[0].institution}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {extractedData && (
                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    onClick={() => setExtractedData(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 font-medium cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleAcceptAiData}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    Accept & Populate Profile <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE EDITOR */}
      {activeTab === 'profile_editor' && (
        <div className="mt-6 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer | React & TypeScript"
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 text-xs block mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full p-2.5 text-xs border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Skills Management */}
          <div>
            <label className="font-semibold text-neutral-700 text-xs block mb-2">
              Skills ({skills.length})
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill (e.g. Kubernetes, Python, Figma)"
                className="p-2 text-xs border border-neutral-300 rounded-lg w-64 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-800 rounded-lg text-xs font-medium border border-neutral-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={async () => {
                await handleSaveProfile();
                setActiveTab('template_gallery');
              }}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Format in AI Resume Templates →</span>
            </button>

            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" /> Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: AI RESUME TEMPLATE GALLERY */}
      {activeTab === 'template_gallery' && (
        <div className="mt-6">
          <ResumeTemplateGallery
            initialData={currentResumeData}
            onApplyDataBackToProfile={async (updatedData) => {
              setFullName(updatedData.fullName);
              setHeadline(updatedData.headline);
              setBio(updatedData.bio);
              setPhone(updatedData.phone);
              setLocation(updatedData.location);
              setSkills(updatedData.skills);
              await updateJobSeekerProfile({
                fullName: updatedData.fullName,
                headline: updatedData.headline,
                bio: updatedData.bio,
                phone: updatedData.phone,
                location: updatedData.location,
                skills: updatedData.skills
              });
              setStatusMessage('Profile synchronized with resume template customizations!');
            }}
          />
        </div>
      )}
    </div>
  );
};
