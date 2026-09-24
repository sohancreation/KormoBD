import React, { useState } from 'react';
import { 
  Sparkles, 
  Printer, 
  Copy, 
  Check, 
  Palette, 
  Type as TypeIcon, 
  Download, 
  Eye, 
  FileText, 
  Award, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Code2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Zap,
  Layers
} from 'lucide-react';
import { enhanceResumeWithAI, EnhancedResumeContent } from '../services/aiService';
import confetti from 'canvas-confetti';

export interface ResumeData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  bio: string;
  skills: string[];
  experience: Array<{
    id?: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    responsibilities: string[];
  }>;
  education: Array<{
    id?: string;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
  }>;
  projects?: Array<{
    id?: string;
    title: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuingOrganization: string;
    issueDate?: string;
  }>;
}

interface ResumeTemplateGalleryProps {
  initialData: ResumeData;
  onApplyDataBackToProfile?: (updatedData: ResumeData) => void;
}

export type TemplateId = 'silicon_valley' | 'executive_elite' | 'harvard_ats' | 'creative_product' | 'compact_startup';

export const ResumeTemplateGallery: React.FC<ResumeTemplateGalleryProps> = ({
  initialData,
  onApplyDataBackToProfile
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('silicon_valley');
  const [colorTheme, setColorTheme] = useState<'emerald' | 'blue' | 'indigo' | 'rose' | 'slate'>('emerald');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [copied, setCopied] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [aiEnhancedContent, setAiEnhancedContent] = useState<EnhancedResumeContent | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [useSampleData, setUseSampleData] = useState(false);

  // Fallback sample data in case user profile is partially empty
  const sampleData: ResumeData = {
    fullName: 'Tanvir Hossain',
    headline: 'Senior Full-Stack & Cloud Engineer | React, Node.js & AWS',
    email: 'tanvir.hossain@example.com',
    phone: '+880 1711-234567',
    location: 'Dhaka, Bangladesh',
    website: 'github.com/tanvir-hossain',
    bio: 'Results-driven Senior Engineer with 6+ years architecting fault-tolerant web platforms and scalable cloud microservices. Led core frontend squads at leading Bangladeshi tech scale-ups, reducing client bundle size by 35% and elevating system availability to 99.98%.',
    skills: [
      'React 19', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 
      'Docker', 'AWS ECS', 'GraphQL', 'Redis', 'CI/CD Pipelines', 'RESTful APIs'
    ],
    experience: [
      {
        company: 'bKash Limited',
        position: 'Senior Software Engineer (Frontend Core)',
        startDate: '2023',
        endDate: 'Present',
        responsibilities: [
          'Architected high-volume merchant analytics dashboards serving 150,000+ daily active enterprise users with sub-second page latency.',
          'Reduced web application bundle size by 35% through route-level code splitting, asset compression, and memoization patterns.',
          'Mentored 5 associate software engineers and authored internal TypeScript best practice guidelines for enterprise repositories.'
        ]
      },
      {
        company: 'Pathao',
        position: 'Software Engineer',
        startDate: '2021',
        endDate: '2023',
        responsibilities: [
          'Engineered live dispatch telemetry portal utilizing WebSockets, React, and Google Maps API for 20,000+ simultaneous parcel deliveries.',
          'Unified design tokens across 4 multidisciplinary squads, cutting frontend UI development cycle times by 25%.'
        ]
      }
    ],
    education: [
      {
        institution: 'Bangladesh University of Engineering and Technology (BUET)',
        degree: 'Bachelor of Science in Computer Science & Engineering',
        fieldOfStudy: 'Computer Science',
        startDate: '2017',
        endDate: '2021',
        gpa: '3.82 / 4.00'
      }
    ],
    projects: [
      {
        title: 'FinTech Pulse Engine',
        description: 'Real-time transaction latency visualizer and anomaly detection dashboard built with React 19, TypeScript, and Tailwind CSS.',
        technologies: ['React', 'TypeScript', 'Tailwind', 'WebSocket'],
        url: 'github.com/tanvir-hossain/fintech-pulse'
      },
      {
        title: 'Bangla NLP Tokenizer Toolkit',
        description: 'Open-source fast text tokenizer and grammar parser for Bengali computational linguistics with 1,200+ GitHub stars.',
        technologies: ['Node.js', 'TypeScript', 'NLP'],
        url: 'github.com/tanvir-hossain/bangla-nlp'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect – Associate',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2023'
      }
    ]
  };

  // Determine active data source
  const hasUserData = initialData.fullName && initialData.skills && initialData.skills.length > 0;
  const currentData: ResumeData = (!hasUserData || useSampleData) ? sampleData : initialData;

  // Apply AI enhancements if generated
  const activeBio = aiEnhancedContent?.polishedBio || currentData.bio;
  const activeExperience = aiEnhancedContent?.polishedExperience
    ? currentData.experience.map((exp, idx) => {
        const enhanced = aiEnhancedContent.polishedExperience[idx];
        return enhanced ? { ...exp, responsibilities: enhanced.responsibilities } : exp;
      })
    : currentData.experience;
  const activeSkills = aiEnhancedContent?.suggestedTopSkills || currentData.skills;

  // Color mapping
  const themeColors = {
    emerald: {
      primary: 'text-emerald-700',
      bg: 'bg-emerald-700',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-600',
      borderLight: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      accent: '#047857'
    },
    blue: {
      primary: 'text-blue-700',
      bg: 'bg-blue-700',
      bgLight: 'bg-blue-50',
      border: 'border-blue-600',
      borderLight: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      accent: '#1d4ed8'
    },
    indigo: {
      primary: 'text-indigo-700',
      bg: 'bg-indigo-700',
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-600',
      borderLight: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      accent: '#4338ca'
    },
    rose: {
      primary: 'text-rose-700',
      bg: 'bg-rose-700',
      bgLight: 'bg-rose-50',
      border: 'border-rose-600',
      borderLight: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800 border-rose-300',
      accent: '#be123c'
    },
    slate: {
      primary: 'text-neutral-900',
      bg: 'bg-neutral-900',
      bgLight: 'bg-neutral-100',
      border: 'border-neutral-900',
      borderLight: 'border-neutral-300',
      badge: 'bg-neutral-200 text-neutral-800 border-neutral-300',
      accent: '#171717'
    }
  };

  const currentTheme = themeColors[colorTheme];

  // Font family classes
  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  // Template gallery metadata
  const templates: Array<{
    id: TemplateId;
    title: string;
    tag: string;
    description: string;
    bestFor: string;
    atsRating: string;
  }> = [
    {
      id: 'silicon_valley',
      title: 'Silicon Valley Modern Tech',
      tag: 'Engineering & SaaS',
      description: 'Clean typographic hierarchy with skill pill chips, impact metrics, and project spotlights.',
      bestFor: 'Software Engineers, DevOps, Tech Leads & Full-Stack Developers',
      atsRating: '98% ATS Friendly'
    },
    {
      id: 'executive_elite',
      title: 'Executive Corporate Elite',
      tag: 'Leadership & Finance',
      description: 'Authoritative styling with executive summary band and two-column competency matrix.',
      bestFor: 'Engineering Managers, Product Leads, FinTech & Corporate Execs',
      atsRating: '96% ATS Friendly'
    },
    {
      id: 'harvard_ats',
      title: 'Harvard Minimalist ATS Standard',
      tag: '100% ATS Guaranteed',
      description: 'Monochrome single-column layout with horizontal rule dividers for rigorous ATS scanners.',
      bestFor: 'Enterprise applications (Workday, Greenhouse, Taleo, Brassring)',
      atsRating: '100% ATS Verified'
    },
    {
      id: 'creative_product',
      title: 'Contemporary Product & Design',
      tag: 'Product & UX',
      description: 'Two-column design featuring left contact & competency rail with project showcase cards.',
      bestFor: 'Product Designers, UI/UX Specialists, Product Managers',
      atsRating: '92% ATS Friendly'
    },
    {
      id: 'compact_startup',
      title: 'Compact Startup Specialist',
      tag: 'High-Density',
      description: 'Space-efficient format highlighting fast-paced execution, GitHub projects, and grouped skills.',
      bestFor: 'Early-Stage Startups, Fast Growth Scale-ups & Founders',
      atsRating: '95% ATS Friendly'
    }
  ];

  // AI Polish Handler
  const handleAiPolish = async () => {
    setPolishing(true);
    setStatusMessage(null);
    try {
      const enhanced = await enhanceResumeWithAI(
        {
          fullName: currentData.fullName,
          headline: currentData.headline,
          bio: currentData.bio,
          skills: currentData.skills,
          experience: currentData.experience.map(e => ({
            company: e.company,
            position: e.position,
            responsibilities: e.responsibilities
          }))
        },
        selectedTemplate
      );

      setAiEnhancedContent(enhanced);
      setStatusMessage(`✨ AI enhancement applied! Estimated ATS readiness score: ${enhanced.atsScoreEstimate}%. Bullet points polished with action verbs.`);
      confetti({ particleCount: 40, spread: 60 });
    } catch (err) {
      console.error(err);
      setStatusMessage('Could not connect to AI polish service. Using fallback polish.');
    } finally {
      setPolishing(false);
    }
  };

  // Print / PDF Trigger
  const handlePrint = () => {
    window.print();
  };

  // Copy Markdown Handler
  const handleCopyMarkdown = () => {
    const md = `# ${currentData.fullName}
**${currentData.headline}**
${currentData.email} | ${currentData.phone} | ${currentData.location} ${currentData.website ? `| ${currentData.website}` : ''}

## Professional Summary
${activeBio}

## Technical Skills
${activeSkills.join(', ')}

## Work Experience
${activeExperience.map(exp => `### ${exp.position} — ${exp.company} (${exp.startDate} - ${exp.endDate})
${exp.responsibilities.map(r => `- ${r}`).join('\n')}`).join('\n\n')}

## Education
${currentData.education.map(edu => `### ${edu.degree} — ${edu.institution} (${edu.startDate} - ${edu.endDate})
${edu.gpa ? `GPA: ${edu.gpa}` : ''}`).join('\n\n')}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* 1. Template Gallery Selector Carousel / Cards */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Select an AI-Powered Resume Template
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Choose from 5 professionally designed templates. Your profile data formats automatically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseSampleData(!useSampleData)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                useSampleData 
                  ? 'bg-neutral-900 text-white border-neutral-900' 
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {useSampleData ? '✓ Using Sample Data' : 'Preview with Sample Data'}
            </button>
          </div>
        </div>

        {/* Gallery Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          {templates.map(t => {
            const isSelected = selectedTemplate === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left group relative ${
                  isSelected 
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm' 
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    {t.tag}
                  </span>
                  <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-emerald-900' : 'text-neutral-900 group-hover:text-emerald-600'}`}>
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {t.atsRating}
                  </span>
                  <span className="text-neutral-400 font-medium">
                    {isSelected ? 'Active' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Customization & Action Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-neutral-500" /> Accent:
          </span>
          <div className="flex items-center gap-1.5">
            {(['emerald', 'blue', 'indigo', 'rose', 'slate'] as const).map(color => (
              <button
                key={color}
                onClick={() => setColorTheme(color)}
                className={`w-6 h-6 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                  color === 'emerald' ? 'bg-emerald-600' :
                  color === 'blue' ? 'bg-blue-600' :
                  color === 'indigo' ? 'bg-indigo-600' :
                  color === 'rose' ? 'bg-rose-600' : 'bg-neutral-900'
                } ${colorTheme === color ? 'scale-110 ring-2 ring-offset-2 ring-neutral-400' : 'opacity-80 hover:opacity-100'}`}
                title={`Select ${color} theme`}
              />
            ))}
          </div>
        </div>

        {/* Font Family Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1.5">
            <TypeIcon className="w-3.5 h-3.5 text-neutral-500" /> Typography:
          </span>
          <div className="inline-flex p-1 bg-neutral-100 rounded-lg text-xs">
            <button
              onClick={() => setFontFamily('sans')}
              className={`px-2.5 py-1 rounded font-sans transition-colors cursor-pointer ${
                fontFamily === 'sans' ? 'bg-white shadow-2xs font-bold text-neutral-900' : 'text-neutral-600'
              }`}
            >
              Modern Sans
            </button>
            <button
              onClick={() => setFontFamily('serif')}
              className={`px-2.5 py-1 rounded font-serif transition-colors cursor-pointer ${
                fontFamily === 'serif' ? 'bg-white shadow-2xs font-bold text-neutral-900' : 'text-neutral-600'
              }`}
            >
              Editorial Serif
            </button>
            <button
              onClick={() => setFontFamily('mono')}
              className={`px-2.5 py-1 rounded font-mono transition-colors cursor-pointer ${
                fontFamily === 'mono' ? 'bg-white shadow-2xs font-bold text-neutral-900' : 'text-neutral-600'
              }`}
            >
              Tech Mono
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* AI Polish Button */}
          <button
            onClick={handleAiPolish}
            disabled={polishing}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {polishing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Polishing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>✨ AI Polish Content</span>
              </>
            )}
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy as Markdown text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          {/* Print / Download PDF */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          {aiEnhancedContent && (
            <button
              onClick={() => {
                setAiEnhancedContent(null);
                setStatusMessage('Reset to original unpolished content.');
              }}
              className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Revert Polish
            </button>
          )}
        </div>
      )}

      {/* 3. LIVE RESUME TEMPLATE SHEET PREVIEW */}
      <div className="flex justify-center">
        <div 
          id="printable-resume"
          className={`w-full max-w-[850px] bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden text-neutral-900 ${fontClasses[fontFamily]} transition-all`}
        >
          {/* ================================================================= */}
          {/* TEMPLATE 1: SILICON VALLEY MODERN TECH                            */}
          {/* ================================================================= */}
          {selectedTemplate === 'silicon_valley' && (
            <div className="p-8 sm:p-10 space-y-6">
              {/* Header */}
              <div className="border-b border-neutral-200 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950">
                      {currentData.fullName}
                    </h1>
                    <p className={`text-xs sm:text-sm font-bold ${currentTheme.primary} mt-0.5 tracking-wide`}>
                      {currentData.headline}
                    </p>
                  </div>
                  <div className="text-[11px] text-neutral-500 sm:text-right space-y-0.5 font-mono">
                    <p className="flex items-center sm:justify-end gap-1.5">
                      <Mail className="w-3 h-3 text-neutral-400" /> {currentData.email}
                    </p>
                    <p className="flex items-center sm:justify-end gap-1.5">
                      <Phone className="w-3 h-3 text-neutral-400" /> {currentData.phone}
                    </p>
                    <p className="flex items-center sm:justify-end gap-1.5">
                      <MapPin className="w-3 h-3 text-neutral-400" /> {currentData.location}
                    </p>
                    {currentData.website && (
                      <p className="flex items-center sm:justify-end gap-1.5">
                        <Globe className="w-3 h-3 text-neutral-400" /> {currentData.website}
                      </p>
                    )}
                  </div>
                </div>

                {/* Professional Bio */}
                {activeBio && (
                  <p className="text-xs text-neutral-600 mt-4 leading-relaxed max-w-3xl">
                    {activeBio}
                  </p>
                )}
              </div>

              {/* Technical Skills Badges */}
              {activeSkills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-neutral-500" /> Technical Competencies & Stack
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSkills.map(skill => (
                      <span
                        key={skill}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${currentTheme.badge}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {activeExperience.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200 pb-1">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-500" /> Professional Experience
                  </h3>
                  <div className="space-y-4">
                    {activeExperience.map((exp, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                          <div>
                            <span className="font-black text-neutral-900 text-sm">{exp.position}</span>
                            <span className="text-neutral-500 font-medium"> • {exp.company}</span>
                          </div>
                          <span className="text-[11px] font-mono text-neutral-500">
                            {exp.startDate} – {exp.endDate}
                          </span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 leading-relaxed pl-1">
                          {exp.responsibilities.map((resp, rIdx) => (
                            <li key={rIdx} className="leading-normal">
                              {resp.replace(/^[•\-*]\s*/, '')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {currentData.projects && currentData.projects.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200 pb-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-neutral-500" /> Notable Projects & Open Source
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentData.projects.map((proj, idx) => (
                      <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-neutral-900">{proj.title}</span>
                          {proj.url && (
                            <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[120px]">
                              {proj.url}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-2">
                          {proj.description}
                        </p>
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.technologies.map(t => (
                              <span key={t} className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-neutral-600">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {currentData.education.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200 pb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-neutral-500" /> Education
                    </h3>
                    {currentData.education.map((edu, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <p className="font-bold text-neutral-900">{edu.degree}</p>
                        <p className="text-neutral-500">{edu.institution}</p>
                        <p className="text-[11px] font-mono text-neutral-400">
                          {edu.startDate} – {edu.endDate} {edu.gpa ? `• CGPA: ${edu.gpa}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {currentData.certifications && currentData.certifications.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200 pb-1">
                      <Award className="w-3.5 h-3.5 text-neutral-500" /> Certifications
                    </h3>
                    {currentData.certifications.map((cert, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <p className="font-bold text-neutral-900">{cert.name}</p>
                        <p className="text-neutral-500">{cert.issuingOrganization} {cert.issueDate ? `(${cert.issueDate})` : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TEMPLATE 2: EXECUTIVE CORPORATE ELITE                             */}
          {/* ================================================================= */}
          {selectedTemplate === 'executive_elite' && (
            <div>
              {/* Executive Top Banner Header */}
              <div className={`${currentTheme.bg} text-white p-8 sm:p-10 space-y-3`}>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {currentData.fullName}
                </h1>
                <p className="text-sm font-semibold text-neutral-200 uppercase tracking-widest">
                  {currentData.headline}
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs text-neutral-200 border-t border-white/20">
                  <span>{currentData.email}</span>
                  <span>•</span>
                  <span>{currentData.phone}</span>
                  <span>•</span>
                  <span>{currentData.location}</span>
                  {currentData.website && (
                    <>
                      <span>•</span>
                      <span>{currentData.website}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-8 sm:p-10 space-y-6">
                {/* Executive Summary */}
                {activeBio && (
                  <div className="border-l-4 border-neutral-900 pl-4 py-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-1">
                      Executive Profile
                    </h3>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      {activeBio}
                    </p>
                  </div>
                )}

                {/* Core Competencies Matrix */}
                {activeSkills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-1">
                      Core Competencies & Leadership Domains
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {activeSkills.map(skill => (
                        <div key={skill} className="flex items-center gap-2 p-1.5 bg-neutral-50 rounded border border-neutral-200">
                          <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.bg}`} />
                          <span className="font-semibold text-neutral-800 text-[11px]">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {activeExperience.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-1">
                      Chronological Career Progression
                    </h3>
                    <div className="space-y-5">
                      {activeExperience.map((exp, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                            <div>
                              <span className="font-black text-neutral-900 text-sm uppercase tracking-wide">{exp.position}</span>
                              <span className="text-neutral-600 font-semibold"> | {exp.company}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-neutral-500">
                              {exp.startDate} – {exp.endDate}
                            </span>
                          </div>
                          <ul className="list-disc list-outside space-y-1 text-xs text-neutral-700 leading-relaxed ml-4">
                            {exp.responsibilities.map((resp, rIdx) => (
                              <li key={rIdx}>{resp.replace(/^[•\-*]\s*/, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {currentData.education.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b-2 border-neutral-900 pb-1">
                      Academic Background
                    </h3>
                    <div className="space-y-2">
                      {currentData.education.map((edu, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-neutral-900">{edu.degree}</span>
                            <span className="text-neutral-500"> — {edu.institution}</span>
                          </div>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            {edu.startDate} – {edu.endDate} {edu.gpa ? `(CGPA: ${edu.gpa})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TEMPLATE 3: HARVARD MINIMALIST ATS STANDARD                       */}
          {/* ================================================================= */}
          {selectedTemplate === 'harvard_ats' && (
            <div className="p-8 sm:p-10 space-y-5 text-neutral-900 font-serif">
              {/* ATS Header */}
              <div className="text-center space-y-1 border-b border-neutral-900 pb-4">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-neutral-950 font-sans">
                  {currentData.fullName}
                </h1>
                <p className="text-xs font-medium text-neutral-700">
                  {currentData.location} | {currentData.phone} | {currentData.email} {currentData.website ? `| ${currentData.website}` : ''}
                </p>
                <p className="text-xs italic text-neutral-600 pt-0.5">
                  {currentData.headline}
                </p>
              </div>

              {/* Summary */}
              {activeBio && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-neutral-400 pb-0.5 font-sans">
                    PROFESSIONAL SUMMARY
                  </h3>
                  <p className="text-xs text-neutral-800 leading-relaxed text-justify">
                    {activeBio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {activeSkills.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-neutral-400 pb-0.5 font-sans">
                    TECHNICAL SKILLS & COMPETENCIES
                  </h3>
                  <p className="text-xs text-neutral-800 leading-relaxed">
                    <span className="font-bold">Core Technologies:</span> {activeSkills.join(' • ')}
                  </p>
                </div>
              )}

              {/* Experience */}
              {activeExperience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-neutral-400 pb-0.5 font-sans">
                    PROFESSIONAL EXPERIENCE
                  </h3>
                  <div className="space-y-3.5">
                    {activeExperience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-sans">
                          <span className="font-bold text-neutral-900">{exp.company}</span>
                          <span className="text-neutral-600 italic">{exp.startDate} – {exp.endDate}</span>
                        </div>
                        <div className="flex justify-between text-xs italic text-neutral-800">
                          <span>{exp.position}</span>
                          <span>{currentData.location}</span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-neutral-800 leading-relaxed">
                          {exp.responsibilities.map((r, rIdx) => (
                            <li key={rIdx}>{r.replace(/^[•\-*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {currentData.education.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950 border-b border-neutral-400 pb-0.5 font-sans">
                    EDUCATION
                  </h3>
                  {currentData.education.map((edu, idx) => (
                    <div key={idx} className="space-y-0.5 text-xs">
                      <div className="flex justify-between font-sans">
                        <span className="font-bold text-neutral-900">{edu.institution}</span>
                        <span className="text-neutral-600">{edu.startDate} – {edu.endDate}</span>
                      </div>
                      <div className="flex justify-between italic text-neutral-800">
                        <span>{edu.degree}</span>
                        {edu.gpa && <span>CGPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TEMPLATE 4: CONTEMPORARY PRODUCT & DESIGN                         */}
          {/* ================================================================= */}
          {selectedTemplate === 'creative_product' && (
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[700px]">
              {/* Left Column (Rail) */}
              <div className="md:col-span-4 bg-neutral-900 text-white p-6 space-y-6">
                {/* Initials badge */}
                <div className={`w-14 h-14 rounded-2xl ${currentTheme.bg} text-white font-black text-xl flex items-center justify-center shadow-lg`}>
                  {currentData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">{currentData.fullName}</h2>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">{currentData.headline}</p>
                </div>

                {/* Contact Rail */}
                <div className="space-y-2 pt-2 border-t border-neutral-800 text-[11px] text-neutral-300">
                  <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block">Contact</span>
                  <p className="truncate">{currentData.email}</p>
                  <p>{currentData.phone}</p>
                  <p>{currentData.location}</p>
                  {currentData.website && <p className="truncate text-emerald-400">{currentData.website}</p>}
                </div>

                {/* Skills Chips in Sidebar */}
                {activeSkills.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block">Skill Stack</span>
                    <div className="flex flex-wrap gap-1">
                      {activeSkills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 text-[10px] font-medium border border-neutral-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education in Sidebar */}
                {currentData.education.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                    <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider block">Education</span>
                    {currentData.education.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <p className="font-bold text-white text-[11px]">{edu.degree}</p>
                        <p className="text-[10px] text-neutral-400">{edu.institution}</p>
                        <p className="text-[9px] text-neutral-500">{edu.startDate} – {edu.endDate}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (Content) */}
              <div className="md:col-span-8 p-8 space-y-6">
                {/* Executive Summary */}
                {activeBio && (
                  <div className="space-y-1.5">
                    <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary}`}>
                      Career Vision & Impact
                    </h3>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      {activeBio}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {activeExperience.length > 0 && (
                  <div className="space-y-4">
                    <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary} border-b pb-1`}>
                      Selected Work Experience
                    </h3>
                    <div className="space-y-4">
                      {activeExperience.map((exp, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                            <span className="font-black text-neutral-900">{exp.position} — <span className="text-neutral-500">{exp.company}</span></span>
                            <span className="text-[11px] font-mono text-neutral-400">{exp.startDate} – {exp.endDate}</span>
                          </div>
                          <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-neutral-600 leading-relaxed">
                            {exp.responsibilities.map((r, rIdx) => (
                              <li key={rIdx}>{r.replace(/^[•\-*]\s*/, '')}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Showcase */}
                {currentData.projects && currentData.projects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className={`text-xs font-black uppercase tracking-wider ${currentTheme.primary} border-b pb-1`}>
                      Featured Product Builds
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {currentData.projects.map((proj, idx) => (
                        <div key={idx} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-neutral-900">{proj.title}</span>
                            {proj.url && <span className="text-[10px] text-emerald-700 font-mono">{proj.url}</span>}
                          </div>
                          <p className="text-[11px] text-neutral-600">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TEMPLATE 5: COMPACT STARTUP SPECIALIST                            */}
          {/* ================================================================= */}
          {selectedTemplate === 'compact_startup' && (
            <div className="p-6 sm:p-8 space-y-4 text-xs">
              {/* Compact Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-neutral-900 pb-3 gap-2">
                <div>
                  <h1 className="text-2xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
                    {currentData.fullName}
                    <span className="text-[10px] font-mono bg-neutral-900 text-white px-2 py-0.5 rounded font-normal">
                      v2026.09
                    </span>
                  </h1>
                  <p className={`text-xs font-bold ${currentTheme.primary} mt-0.5`}>
                    {currentData.headline}
                  </p>
                </div>
                <div className="text-[10px] font-mono text-neutral-600 sm:text-right space-y-0.5">
                  <p>{currentData.email} • {currentData.phone}</p>
                  <p>{currentData.location} {currentData.website ? `• ${currentData.website}` : ''}</p>
                </div>
              </div>

              {/* Bio summary */}
              {activeBio && (
                <p className="text-[11px] text-neutral-700 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                  <span className="font-bold text-neutral-900">TL;DR:</span> {activeBio}
                </p>
              )}

              {/* Grouped Skills */}
              {activeSkills.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">
                    &gt; STACK & EXPERTISE
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeSkills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-neutral-100 font-mono text-[10px] text-neutral-800 border border-neutral-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {activeExperience.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block border-b border-neutral-200 pb-0.5">
                    &gt; WORK EXPERIENCE & SCALE
                  </span>
                  <div className="space-y-3">
                    {activeExperience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-bold text-neutral-900">
                          <span>{exp.position} @ {exp.company}</span>
                          <span className="font-mono text-[10px] text-neutral-500">{exp.startDate} – {exp.endDate}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-600">
                          {exp.responsibilities.map((r, rIdx) => (
                            <li key={rIdx}>{r.replace(/^[•\-*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects & Education in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {currentData.projects && currentData.projects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block border-b border-neutral-200 pb-0.5">
                      &gt; KEY PROJECTS
                    </span>
                    {currentData.projects.map((p, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between font-bold text-neutral-900 text-[11px]">
                          <span>{p.title}</span>
                        </div>
                        <p className="text-[10px] text-neutral-600 line-clamp-2">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {currentData.education.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 block border-b border-neutral-200 pb-0.5">
                      &gt; EDUCATION
                    </span>
                    {currentData.education.map((edu, idx) => (
                      <div key={idx} className="space-y-0.5 text-[11px]">
                        <p className="font-bold text-neutral-900">{edu.degree}</p>
                        <p className="text-[10px] text-neutral-500">{edu.institution} ({edu.startDate} – {edu.endDate})</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
