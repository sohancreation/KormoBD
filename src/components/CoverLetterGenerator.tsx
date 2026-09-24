import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobListing, CoverLetterTone, CoverLetterLength, TailoredCoverLetterResult } from '../types';
import { generateTailoredCoverLetterWithAI } from '../services/aiService';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Send, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  Briefcase, 
  Building2, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoverLetterGeneratorProps {
  initialJob?: JobListing | null;
  onApplyWithCoverLetter?: (job: JobListing, coverLetter: string) => void;
  onNavigateToJobs?: () => void;
}

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({
  initialJob,
  onApplyWithCoverLetter,
  onNavigateToJobs
}) => {
  const { jobs, savedJobIds } = useJobs();
  const { user, jobSeekerProfile } = useAuth();

  // Target Job selection
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJob ? initialJob.id : 'custom');
  const [customJobTitle, setCustomJobTitle] = useState(initialJob?.title || 'Senior Full-Stack Software Engineer');
  const [customCompany, setCustomCompany] = useState(initialJob?.companyName || 'bKash Limited');
  const [customJD, setCustomJD] = useState(
    initialJob
      ? `${initialJob.summary}\n\nKey Responsibilities:\n${initialJob.responsibilities?.join('\n') || ''}`
      : 'Architect resilient web client applications using React, TypeScript, and distributed services. Lead high-impact engineering teams, maintain 99.9% uptime, and optimize transactional throughput.'
  );

  // Tone, Length & Focus options
  const [tone, setTone] = useState<CoverLetterTone>('formal');
  const [length, setLength] = useState<CoverLetterLength>('standard');
  const [customFocus, setCustomFocus] = useState<string>('Highlighting high-scale frontend architecture and team delivery');

  // Generator states
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<TailoredCoverLetterResult | null>(null);
  const [editableLetter, setEditableLetter] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Sync when initialJob prop changes
  useEffect(() => {
    if (initialJob) {
      setSelectedJobId(initialJob.id);
      setCustomJobTitle(initialJob.title);
      setCustomCompany(initialJob.companyName);
      setCustomJD(`${initialJob.summary}\n\nRequirements:\n${initialJob.requirements?.join('\n') || ''}`);
    }
  }, [initialJob]);

  // Handle selecting a predefined job
  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId === 'custom') return;
    const found = jobs.find(j => j.id === jobId);
    if (found) {
      setCustomJobTitle(found.title);
      setCustomCompany(found.companyName);
      setCustomJD(`${found.summary}\n\nKey Requirements:\n${found.requirements?.join('\n') || ''}`);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);

    const activeJob = jobs.find(j => j.id === selectedJobId);
    const candidateName = jobSeekerProfile?.fullName || 'Candidate';
    const candidateHeadline = jobSeekerProfile?.headline || 'Senior Software Engineer';
    const candidateSkills = (jobSeekerProfile?.skills && jobSeekerProfile.skills.length > 0)
      ? jobSeekerProfile.skills
      : ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'System Architecture'];

    try {
      const generated = await generateTailoredCoverLetterWithAI({
        candidateName,
        candidateEmail: jobSeekerProfile?.email || user?.email || '',
        candidatePhone: jobSeekerProfile?.phone,
        candidateHeadline,
        candidateSkills,
        candidateExperience: jobSeekerProfile?.experience?.map(e => ({
          company: e.company,
          position: e.position,
          responsibilities: e.responsibilities
        })),
        candidateProjects: jobSeekerProfile?.projects?.map(p => ({
          title: p.title,
          description: p.description,
          technologies: p.technologies
        })),
        jobTitle: activeJob ? activeJob.title : customJobTitle,
        companyName: activeJob ? activeJob.companyName : customCompany,
        jobSummary: activeJob ? activeJob.summary : customJD,
        jobResponsibilities: activeJob ? activeJob.responsibilities : undefined,
        jobRequirements: activeJob ? activeJob.requirements : undefined,
        tone,
        length,
        customFocus: customFocus.trim() || undefined
      });

      setResult(generated);
      setEditableLetter(generated.fullText);
      confetti({ particleCount: 45, spread: 60 });
    } catch (err) {
      console.error('Failed to generate cover letter:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!editableLetter) return;
    navigator.clipboard.writeText(editableLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    if (!editableLetter) return;
    const blob = new Blob([editableLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${customCompany.replace(/\s+/g, '_')}_${customJobTitle.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cover Letter - ${customJobTitle} at ${customCompany}</title>
          <style>
            body { font-family: 'Georgia', serif; line-height: 1.6; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; }
            h1 { font-size: 20px; font-family: sans-serif; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-bottom: 24px; color: #065f46; }
            p { margin-bottom: 16px; font-size: 15px; }
            .meta { font-family: sans-serif; font-size: 13px; color: #666; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <h1>Cover Letter</h1>
          <div class="meta">
            Target Role: <strong>${customJobTitle}</strong> | Company: <strong>${customCompany}</strong><br/>
            Applicant: <strong>${jobSeekerProfile?.fullName || 'Applicant'}</strong> (${jobSeekerProfile?.headline || ''})
          </div>
          ${editableLetter.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const wordCount = editableLetter ? editableLetter.trim().split(/\s+/).length : 0;
  const targetJob = jobs.find(j => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                1-Click AI Tailored Cover Letter Generator
              </span>
              <span className="text-xs text-neutral-400">AI Synthesizer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Turn Your Resume & Company JDs into Persuasive Cover Letters
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Dynamically maps your verified profile achievements to the employer's exact technical pain points with instant tone switching (Formal, Startup Enthusiastic, or Leadership).
            </p>
          </div>

          <div className="bg-neutral-800/80 backdrop-blur-xs p-4 rounded-xl border border-neutral-700/80 shrink-0 text-xs space-y-2 max-w-xs">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Active Candidate Profile
            </span>
            <p className="text-neutral-300 font-medium truncate">
              {jobSeekerProfile?.fullName || 'Candidate Profile Active'}
            </p>
            <p className="text-[11px] text-neutral-400">
              {jobSeekerProfile?.skills?.length || 5} Verified Skills • {jobSeekerProfile?.experience?.length || 2} Roles Loaded
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Target Job Selector Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              1. Target Company & Job
            </h3>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Select from Posted Jobs:
              </label>
              <select
                value={selectedJobId}
                onChange={e => handleJobSelect(e.target.value)}
                className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
              >
                <option value="custom">✏️ Custom Job (Paste JD Below)</option>
                <optgroup label="Featured Open Positions in BD">
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} • {j.companyName} {savedJobIds.includes(j.id) ? '★ Bookmarked' : ''}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={customCompany}
                  onChange={e => setCustomCompany(e.target.value)}
                  placeholder="e.g. bKash Limited"
                  className="w-full p-2 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Target Job Title</label>
                <input
                  type="text"
                  value={customJobTitle}
                  onChange={e => setCustomJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full p-2 text-xs border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Job Description / Key Requirements Snippet
              </label>
              <textarea
                rows={4}
                value={customJD}
                onChange={e => setCustomJD(e.target.value)}
                placeholder="Paste key responsibilities or tech stack requirements..."
                className="w-full p-2.5 text-xs border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Tone & Length Adjustment Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              2. Tone & Length Adjustments
            </h3>

            {/* Tone Selector */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-2">
                Persuasion Tone:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTone('formal')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === 'formal'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/50'
                  }`}
                >
                  <span className="text-xs font-bold block">👔 Formal</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block leading-tight">Corporate, polished, structured</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTone('startup')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === 'startup'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/50'
                  }`}
                >
                  <span className="text-xs font-bold block">🚀 Startup</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block leading-tight">Enthusiastic, agile, high agency</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTone('leadership')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tone === 'leadership'
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50/50'
                  }`}
                >
                  <span className="text-xs font-bold block">👑 Leadership</span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block leading-tight">Strategic, mentoring, ROI focused</span>
                </button>
              </div>
            </div>

            {/* Length Selector */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Target Length</label>
                <select
                  value={length}
                  onChange={e => setLength(e.target.value as CoverLetterLength)}
                  className="w-full text-xs p-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="concise">Concise (~220 words)</option>
                  <option value="standard">Standard (~380 words)</option>
                  <option value="detailed">In-Depth (~520 words)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Candidate Profile Focus</label>
                <input
                  type="text"
                  value={customFocus}
                  onChange={e => setCustomFocus(e.target.value)}
                  placeholder="e.g. Microservices, scale, mentorship"
                  className="w-full p-2 text-xs border border-neutral-200 rounded-lg focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !customJobTitle.trim()}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Cover Letter with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate 1-Click Tailored Letter</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Editor, Alignments & Action Toolbar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Tailored Cover Letter Output
                </h3>
                <span className="text-[11px] text-neutral-400">
                  {editableLetter ? `${wordCount} words • Edit directly in the box below` : 'Click Generate to draft your custom letter'}
                </span>
              </div>

              {editableLetter && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download as Text File"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>TXT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintPdf}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Print or Save to PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF / Print</span>
                  </button>
                </div>
              )}
            </div>

            {/* Main Editable Textarea */}
            <div className="relative">
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-10 rounded-xl">
                  <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-neutral-700 animate-pulse">
                    AI is matching your resume to {customCompany}...
                  </p>
                </div>
              )}

              {editableLetter ? (
                <textarea
                  rows={16}
                  value={editableLetter}
                  onChange={e => setEditableLetter(e.target.value)}
                  className="w-full p-4 font-serif text-xs sm:text-sm text-neutral-800 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed bg-neutral-50/30 font-normal"
                />
              ) : (
                <div className="py-20 text-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-800">Your Tailored Cover Letter Awaits</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                      Choose a target position, select your desired tone (Formal, Startup, or Leadership), and click Generate.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Generate Demo Letter
                  </button>
                </div>
              )}
            </div>

            {/* Strategic Synthesis Breakdown (AI Insights) */}
            {result && (
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-3">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI Synthesis & Match Alignment
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {result.coreAlignments.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-emerald-100 shadow-2xs space-y-1">
                      <span className="font-bold text-emerald-800 text-[11px] block">{item.skillOrProject}</span>
                      <p className="text-neutral-600 text-[11px] leading-snug">{item.whyItFits}</p>
                    </div>
                  ))}
                </div>

                {result.keyStrengthsHighlighted.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-semibold text-neutral-600">Highlighted in Letter:</span>
                    {result.keyStrengthsHighlighted.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions: Apply Directly with Cover Letter */}
            {editableLetter && (
              <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-neutral-500">
                  Ready to send? You can paste this directly or apply in 1-click.
                </div>

                {onApplyWithCoverLetter && targetJob ? (
                  <button
                    type="button"
                    onClick={() => onApplyWithCoverLetter(targetJob, editableLetter)}
                    className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Apply to {targetJob.companyName} with this Letter</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Copy Letter & Apply on Website</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
