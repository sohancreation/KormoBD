import React, { useState, useEffect } from 'react';
import { JobListing, Application } from '../types';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { generateTailoredCoverLetterWithAI } from '../services/aiService';
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Send, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  UploadCloud,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationModalProps {
  job: JobListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCoverLetter?: string;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
  initialCoverLetter
}) => {
  const { user, userProfile, jobSeekerProfile } = useAuth();
  const { submitApplication } = useJobs();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter || '');
  const [resumeName, setResumeName] = useState(jobSeekerProfile?.resumeFileName || 'Default_Profile_Resume.pdf');
  const [resumeSnippet, setResumeSnippet] = useState(
    `Applicant: ${jobSeekerProfile?.fullName || 'Candidate'}. Skills: ${jobSeekerProfile?.skills?.join(', ') || 'Full-stack development'}. Headline: ${jobSeekerProfile?.headline || ''}. Bio: ${jobSeekerProfile?.bio || ''}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingResume, setIsReadingResume] = useState(false);
  const [aiHelperActive, setAiHelperActive] = useState<string | null>(null);

  // In-modal AI Cover Letter Generator state
  const [isAiGeneratingCoverLetter, setIsAiGeneratingCoverLetter] = useState(false);
  const [modalTone, setModalTone] = useState<'formal' | 'startup' | 'leadership'>('formal');

  useEffect(() => {
    if (initialCoverLetter) {
      setCoverLetter(initialCoverLetter);
    }
  }, [initialCoverLetter]);

  if (!isOpen) return null;

  const handleAnswerChange = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeName(file.name);
      setIsReadingResume(true);

      const reader = new FileReader();
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.onload = () => {
          const text = (reader.result as string) || '';
          setResumeSnippet(text.slice(0, 3000));
          setIsReadingResume(false);
        };
        reader.readAsText(file);
      } else {
        // For PDF or images, capture document descriptor
        setTimeout(() => {
          setResumeSnippet(`Uploaded File: ${file.name} (${Math.round(file.size / 1024)} KB). Applicant: ${jobSeekerProfile?.fullName || 'Candidate'}. Skills: ${jobSeekerProfile?.skills?.join(', ')}.`);
          setIsReadingResume(false);
        }, 300);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await submitApplication({
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        companyLogo: job.companyLogo,
        candidateId: user.uid,
        candidateName: jobSeekerProfile?.fullName || userProfile?.displayName || 'Applicant',
        candidateEmail: jobSeekerProfile?.email || user.email || '',
        candidatePhone: jobSeekerProfile?.phone || '+880 1700-000000',
        candidateHeadline: jobSeekerProfile?.headline || 'Software Professional',
        candidateLocation: jobSeekerProfile?.location || 'Dhaka, Bangladesh',
        recruiterId: job.recruiterId,
        resumeFileName: resumeName,
        resumeTextSnippet: resumeSnippet,
        answers,
        coverLetter
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Job Application</span>
            <h2 className="text-lg font-bold text-neutral-900 line-clamp-1">{job.title}</h2>
            <p className="text-xs text-neutral-500">{job.companyName} • {job.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-neutral-100/50 border-b border-neutral-100 flex items-center justify-between text-xs font-medium text-neutral-500">
          <span className={step === 1 ? 'text-emerald-700 font-bold' : ''}>1. Personal Info</span>
          <span>→</span>
          <span className={step === 2 ? 'text-emerald-700 font-bold' : ''}>2. Resume Selection</span>
          <span>→</span>
          <span className={step === 3 ? 'text-emerald-700 font-bold' : ''}>3. Screening Questions</span>
          <span>→</span>
          <span className={step === 4 ? 'text-emerald-700 font-bold' : ''}>4. Review & Submit</span>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Confirm Your Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={jobSeekerProfile?.fullName || userProfile?.displayName || ''}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={jobSeekerProfile?.email || user?.email || ''}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    disabled
                    value={jobSeekerProfile?.phone || '+880 1712-345678'}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700"
                  />
                </div>
                <div>
                  <label className="font-medium text-neutral-700 block mb-1">Location</label>
                  <input
                    type="text"
                    disabled
                    value={jobSeekerProfile?.location || 'Dhaka, Bangladesh'}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <span className="font-semibold">Your profile is auto-attached.</span>
                  <p className="mt-0.5 text-emerald-700">
                    The hiring team will be able to review your skills ({jobSeekerProfile?.skills.length || 0} listed), experience, and verified portfolio.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Resume */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Select Resume</h3>
              <p className="text-xs text-neutral-500">
                Choose an existing resume from your profile or upload a tailored version for this application.
              </p>

              <div className="border-2 border-emerald-500 bg-emerald-50/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{resumeName}</h4>
                    <span className="text-[11px] text-neutral-500">Primary PDF • Attached to profile</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Selected
                </span>
              </div>

              <div className="border border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-neutral-400 transition-colors">
                <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-neutral-700">Upload a tailored resume (PDF or Image)</p>
                <p className="text-[11px] text-neutral-400 mt-1">PDF, PNG, JPG, or TXT up to 10MB</p>
                <input
                  type="file"
                  accept=".pdf,image/*,.txt"
                  onChange={handleFileUpload}
                  className="mt-3 block w-full text-xs text-neutral-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                />
                {isReadingResume && (
                  <p className="text-[11px] text-emerald-600 mt-2 font-medium">Processing file...</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-neutral-700 block">
                    Tailored Cover Note / Message to Recruiter
                  </label>

                  {/* 1-Click Generator Controls */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-neutral-400 font-medium">Tone:</span>
                    {(['formal', 'startup', 'leadership'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setModalTone(t)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                          modalTone === t
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={async () => {
                        setIsAiGeneratingCoverLetter(true);
                        try {
                          const res = await generateTailoredCoverLetterWithAI({
                            candidateName: jobSeekerProfile?.fullName || userProfile?.displayName || 'Applicant',
                            candidateHeadline: jobSeekerProfile?.headline || 'Software Engineer',
                            candidateSkills: jobSeekerProfile?.skills || ['React', 'TypeScript', 'Node.js'],
                            jobTitle: job.title,
                            companyName: job.companyName,
                            jobSummary: job.summary,
                            jobResponsibilities: job.responsibilities,
                            jobRequirements: job.requirements,
                            tone: modalTone,
                            length: 'standard'
                          });
                          setCoverLetter(res.fullText);
                          confetti({ particleCount: 35, spread: 50 });
                        } catch (e) {
                          console.error('Failed to generate cover note:', e);
                        } finally {
                          setIsAiGeneratingCoverLetter(false);
                        }
                      }}
                      disabled={isAiGeneratingCoverLetter}
                      className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs shrink-0"
                      title="Generate 1-click tailored cover letter using AI"
                    >
                      {isAiGeneratingCoverLetter ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-emerald-200" />
                          <span>1-Click AI Tailor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Click '1-Click AI Tailor' above to synthesize a customized cover letter for this role, or write your own..."
                  className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed bg-white"
                />
                {coverLetter && (
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{coverLetter.trim().split(/\s+/).length} words • Tailored for {job.companyName}</span>
                    <button
                      type="button"
                      onClick={() => setCoverLetter('')}
                      className="text-neutral-400 hover:text-red-500 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Screening Questions */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Recruiter Screening Questions</h3>
                  <p className="text-xs text-neutral-500">
                    The recruiter requires answers to evaluate your experience.
                  </p>
                </div>
                <span className="text-xs text-neutral-400">{job.questions.length} questions</span>
              </div>

              {job.questions.length === 0 ? (
                <div className="text-center py-6 text-neutral-400 text-xs">
                  No additional questions required for this position! Click Next to review.
                </div>
              ) : (
                job.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <label className="text-xs font-semibold text-neutral-800">
                        {idx + 1}. {q.question} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <button
                        type="button"
                        onClick={() => setAiHelperActive(aiHelperActive === q.id ? null : q.id)}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 cursor-pointer shrink-0"
                        title="AI Guidance on what recruiter seeks"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        AI Hint
                      </button>
                    </div>

                    {/* AI Guidance panel */}
                    {aiHelperActive === q.id && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] text-emerald-900">
                        <span className="font-semibold">AI Guidance:</span> Be transparent and highlight concrete achievements or metrics. If linking a portfolio, verify the URL is public.
                      </div>
                    )}

                    {q.type === 'short_answer' && (
                      <input
                        type="text"
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your response..."
                        className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}

                    {q.type === 'long_answer' && (
                      <textarea
                        rows={3}
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Provide details..."
                        className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}

                    {q.type === 'number' && (
                      <input
                        type="number"
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        placeholder="e.g. 4"
                        className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}

                    {q.type === 'yes_no' && (
                      <div className="flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value="Yes"
                            checked={answers[q.id] === 'Yes'}
                            onChange={() => handleAnswerChange(q.id, 'Yes')}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value="No"
                            checked={answers[q.id] === 'No'}
                            onChange={() => handleAnswerChange(q.id, 'No')}
                          />
                          No
                        </label>
                      </div>
                    )}

                    {q.type === 'portfolio_url' && (
                      <input
                        type="url"
                        required={q.required}
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        placeholder="https://github.com/... or https://portfolio.dev"
                        className="w-full p-2 text-xs bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Application Summary</h3>
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Applicant:</span>
                  <span className="font-semibold text-neutral-900">{jobSeekerProfile?.fullName || user?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Target Role:</span>
                  <span className="font-semibold text-neutral-900">{job.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Company:</span>
                  <span className="font-semibold text-neutral-900">{job.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Resume Attached:</span>
                  <span className="font-semibold text-neutral-900">{resumeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Screening Questions Answered:</span>
                  <span className="font-semibold text-neutral-900">{Object.keys(answers).length} / {job.questions.length}</span>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-100 rounded-xl text-xs text-neutral-600">
                By submitting this application, you agree to share your professional profile with <strong>{job.companyName}</strong>. You can withdraw or track the application status from your dashboard at any time.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step + 1) as 2 | 3 | 4)}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
