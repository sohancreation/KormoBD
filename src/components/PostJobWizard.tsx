import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { generateJobDescriptionWithAI } from '../services/aiService';
import { WorkplaceType, EmploymentType, ScreeningQuestion } from '../types';
import { Sparkles, Plus, Trash2, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostJobWizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const PostJobWizard: React.FC<PostJobWizardProps> = ({ onSuccess, onCancel }) => {
  const { createJob } = useJobs();
  const { user, currentCompany } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [generatingWithAi, setGeneratingWithAi] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [industry, setIndustry] = useState('Software & IT');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>('Hybrid');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Full-time');
  const [openingsCount, setOpeningsCount] = useState(2);
  const [experienceLevel, setExperienceLevel] = useState<'Entry-level' | 'Junior' | 'Mid-level' | 'Senior' | 'Lead'>('Mid-level');
  const [educationRequired, setEducationRequired] = useState('Bachelor in Computer Science or equivalent');
  const [salaryMinBdt, setSalaryMinBdt] = useState(90000);
  const [salaryMaxBdt, setSalaryMaxBdt] = useState(150000);
  const [deadline, setDeadline] = useState('2026-11-30');

  // Descriptions & skills
  const [summary, setSummary] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [skillsText, setSkillsText] = useState('React, TypeScript, Node.js, Tailwind CSS');

  // Screening questions
  const [questions, setQuestions] = useState<ScreeningQuestion[]>([
    {
      id: 'q_years',
      question: 'How many years of professional experience do you have in this stack?',
      type: 'number',
      required: true
    },
    {
      id: 'q_portfolio',
      question: 'Share a link to your GitHub, project demo, or portfolio.',
      type: 'portfolio_url',
      required: true
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // AI Generator trigger
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGenerateWithAi = async () => {
    if (!title.trim()) {
      setValidationError('Please enter a Job Title first so AI can generate relevant specifications.');
      return;
    }
    setValidationError(null);
    setGeneratingWithAi(true);
    try {
      const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const generated = await generateJobDescriptionWithAI({
        title,
        industry,
        experienceLevel,
        keySkills: skillsArray.length > 0 ? skillsArray : ['React', 'TypeScript', 'Node.js']
      });

      setSummary(generated.summary);
      setResponsibilitiesText(generated.responsibilities.join('\n'));
      setRequirementsText(generated.requirements.join('\n'));
      setBenefitsText(generated.benefits.join('\n'));

      // Add generated screening questions
      const aiQuestions: ScreeningQuestion[] = generated.screeningQuestions.map((q: { question: string; type?: string; required?: boolean }, idx: number) => ({
        id: `ai_q_${Date.now()}_${idx}`,
        question: q.question,
        type: (q.type as ScreeningQuestion['type']) || 'short_answer',
        required: !!q.required
      }));
      setQuestions(aiQuestions);

      confetti({ particleCount: 30, spread: 40 });
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingWithAi(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        question: newQuestionText.trim(),
        type: 'short_answer',
        required: true
      }
    ]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handlePublishJob = async () => {
    if (!user) return;

    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const responsibilities = responsibilitiesText.split('\n').map(s => s.trim()).filter(Boolean);
    const requirements = requirementsText.split('\n').map(s => s.trim()).filter(Boolean);
    const benefits = benefitsText.split('\n').map(s => s.trim()).filter(Boolean);

    await createJob({
      recruiterId: user.uid,
      companyId: currentCompany?.id || `comp_${user.uid}`,
      companyName: currentCompany?.name || 'Hiring Enterprise',
      companyLogo: currentCompany?.logo || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&auto=format&fit=crop&q=80',
      title,
      department,
      industry,
      location,
      workplaceType,
      employmentType,
      openingsCount,
      experienceLevel,
      educationRequired,
      salaryMinBdt,
      salaryMaxBdt,
      summary: summary || `We are hiring a skilled ${title} to join our growing team.`,
      responsibilities: responsibilities.length > 0 ? responsibilities : ['Build robust features and collaborate with team members.'],
      requirements: requirements.length > 0 ? requirements : ['Demonstrated hands-on experience and solid technical acumen.'],
      benefits: benefits.length > 0 ? benefits : ['Competitive compensation, festival bonuses, and insurance.'],
      skills: skills.length > 0 ? skills : ['Engineering', 'Problem Solving'],
      questions,
      deadline,
      status: 'active'
    });

    confetti({ particleCount: 60, spread: 70 });
    onSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Wizard Header */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase">Recruiter Job Wizard</span>
            <h1 className="text-xl font-bold text-neutral-900 mt-0.5">Post a New Job Opportunity</h1>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold">
            <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}`}>
              1. Basic Info
            </span>
            <span className="text-neutral-300">/</span>
            <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}`}>
              2. AI Description
            </span>
            <span className="text-neutral-300">/</span>
            <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-500'}`}>
              3. Screening Questions
            </span>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="p-6 space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer (Go / Python)"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Core Engineering, Product, Design"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Workplace Type</label>
                  <select
                    value={workplaceType}
                    onChange={e => setWorkplaceType(e.target.value as WorkplaceType)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={e => setEmploymentType(e.target.value as EmploymentType)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={e => setExperienceLevel(e.target.value as typeof experienceLevel)}
                    className="w-full p-2.5 border rounded-lg bg-white"
                  >
                    <option value="Entry-level">Entry-level / Fresh</option>
                    <option value="Junior">Junior (1-2 yrs)</option>
                    <option value="Mid-level">Mid-level (3-5 yrs)</option>
                    <option value="Senior">Senior (5+ yrs)</option>
                    <option value="Lead">Lead / Architect</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Min Salary (BDT / month)</label>
                  <input
                    type="number"
                    value={salaryMinBdt}
                    onChange={e => setSalaryMinBdt(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Max Salary (BDT / month)</label>
                  <input
                    type="number"
                    value={salaryMaxBdt}
                    onChange={e => setSalaryMaxBdt(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full p-2.5 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Required Core Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  placeholder="e.g. React, TypeScript, GraphQL, Docker"
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
            </div>
          )}

          {/* STEP 2: AI Description & Requirements */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              {validationError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {validationError}
                </div>
              )}

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> AI Job Description Assistant
                  </h4>
                  <p className="text-emerald-700 text-[11px] mt-0.5">
                    Generate industry-grade job summary, responsibilities, requirements, and benefits with AI.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAi}
                  disabled={generatingWithAi}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {generatingWithAi ? 'Generating...' : '✨ Generate with AI'}
                </button>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Job Summary / Overview</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Outline the mission and scope of this role..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Key Responsibilities (one per line)</label>
                <textarea
                  rows={4}
                  value={responsibilitiesText}
                  onChange={e => setResponsibilitiesText(e.target.value)}
                  placeholder="Architect scalable microservices..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Candidate Requirements (one per line)</label>
                <textarea
                  rows={4}
                  value={requirementsText}
                  onChange={e => setRequirementsText(e.target.value)}
                  placeholder="4+ years of relevant industry experience..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Benefits & Perks (one per line)</label>
                <textarea
                  rows={3}
                  value={benefitsText}
                  onChange={e => setBenefitsText(e.target.value)}
                  placeholder="Two annual festival bonuses, provident fund, medical insurance..."
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Screening Questions */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Custom Screening Questions</h3>
                <p className="text-neutral-500">
                  Screen candidates effectively before reviewing full resumes. Applicants will be required to answer these.
                </p>
              </div>

              <div className="space-y-2.5">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 bg-neutral-50 rounded-xl border flex items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold text-neutral-800">
                        {idx + 1}. {q.question}
                      </span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5 capitalize">
                        Type: {q.type.replace('_', ' ')} • {q.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex gap-2">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  placeholder="Add custom question (e.g. Do you have experience with Kubernetes in production?)"
                  className="flex-1 p-2.5 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as 1 | 2)}
              className="px-4 py-2 border rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (!title) {
                  alert('Please provide a job title');
                  return;
                }
                setStep((step + 1) as 2 | 3);
              }}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublishJob}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Publish Job Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
