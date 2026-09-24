import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { JobListing, BatchScreenedCandidate, BatchScreeningTier, Application } from '../types';
import { batchScreenResumesWithAI } from '../services/aiService';
import { 
  Upload, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ArrowUpRight, 
  Download, 
  Filter, 
  Search, 
  Trash2, 
  PlusCircle, 
  Eye, 
  Send, 
  Calendar, 
  Award, 
  ChevronRight, 
  Check, 
  RefreshCw,
  SlidersHorizontal,
  FolderOpen,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BatchResumeScreeningProps {
  onScheduleCandidate?: (candidate: any) => void;
  onSendQuiz?: (candidate: any) => void;
}

// Sample realistic resume dataset for immediate 1-click bulk testing
const PRESET_RESUMES = [
  {
    fileName: 'Tanvir_Ahmed_Staff_FullStack.pdf',
    candidateName: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@devbd.org',
    text: `Tanvir Ahmed - Principal Full-Stack Engineer with 7+ years building enterprise SaaS and fintech platforms.
Skills: React, Next.js, TypeScript, Node.js, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, Tailwind CSS.
Experience:
- Lead Architect at Pathao (2022-Present): Scaled ride-hailing core services to 150k req/min, reduced latency by 35%. Mentored 8 engineers.
- Senior Software Engineer at TigerIT (2019-2022): Built identity biometric portals with high-throughput SQL query optimization.
Education: B.Sc. in Computer Science & Engineering from BUET (CGPA 3.88/4.0).`
  },
  {
    fileName: 'Farzana_Yasmin_Senior_Frontend.pdf',
    candidateName: 'Farzana Yasmin',
    email: 'farzana.yasmin@techbangla.io',
    text: `Farzana Yasmin - Senior Frontend Architect with 5.5 years of experience specialized in React, TypeScript, and Design Systems.
Skills: React, TypeScript, Next.js, Redux Toolkit, Tailwind CSS, Jest, Cypress, Webpack, Performance Profiling.
Experience:
- Senior Frontend Developer at Chaldal (2021-Present): Revamped checkout funnel, increasing mobile conversion by 18%.
- Frontend Engineer at Brain Station 23 (2019-2021): Built banking portal UI with strict accessibility (WCAG AA).
Education: B.Sc. in CSE from University of Dhaka (CGPA 3.82/4.0).`
  },
  {
    fileName: 'Nafis_Chowdhury_FullStack_ReactNode.pdf',
    candidateName: 'Nafis Chowdhury',
    email: 'nafis.chowdhury@cloudbd.net',
    text: `Nafis Chowdhury - Full-Stack Developer with 4 years hands-on experience in modern JavaScript/TypeScript ecosystems.
Skills: React, Node.js, Express, PostgreSQL, MongoDB, TypeScript, REST APIs, Git, Docker, Jest.
Experience:
- Software Engineer at Shohoz (2022-Present): Developed ticketing search microservice and partner integrations.
- Junior Developer at Kaz Software (2020-2022): Built client dashboards in React and Node.
Education: B.Sc. in CSE from BRAC University (CGPA 3.65/4.0).`
  },
  {
    fileName: 'Rohan_Karmakar_Backend_Specialist.pdf',
    candidateName: 'Rohan Karmakar',
    email: 'rohan.karmakar@codershub.com',
    text: `Rohan Karmakar - Backend Systems Engineer with 3.5 years in distributed systems, Go, and Node.js.
Skills: Node.js, Go, PostgreSQL, Redis, Kafka, Docker, Linux, System Architecture, gRPC.
Experience:
- Backend Engineer at bKash (2022-Present): Maintained core ledger sync jobs, zero downtime deployments.
- Software Engineer at Dcastalia (2021-2022): Created RESTful APIs for inventory tracking.
Education: B.Sc. in CSE from NSU (CGPA 3.50/4.0).`
  },
  {
    fileName: 'Tasneem_Rahman_Mid_Frontend.pdf',
    candidateName: 'Tasneem Rahman',
    email: 'tasneem.rahman@webcraft.bd',
    text: `Tasneem Rahman - Frontend Developer with 3 years experience crafting responsive React SPAs.
Skills: React, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Redux, RESTful APIs, Git.
Experience:
- Frontend Engineer at Sheba.xyz (2022-Present): Built customer booking workflow and admin UI.
- Intern to Junior Dev at Portonics (2021-2022): Maintained corporate landing sites.
Education: B.Sc. in CSE from AIUB (CGPA 3.45/4.0).`
  },
  {
    fileName: 'Sadia_Afrin_Junior_Dev.pdf',
    candidateName: 'Sadia Afrin',
    email: 'sadia.afrin@outlook.com',
    text: `Sadia Afrin - Junior Web Developer with 1.5 years experience in React and JavaScript.
Skills: React, JavaScript, HTML5, CSS3, Bootstrap, Git, Basic Node.js.
Experience:
- Junior Frontend Dev at SoftVessel (2023-Present): Developed marketing website components and bugfixes.
Education: B.Sc. in CSE from UIU (CGPA 3.35/4.0).`
  },
  {
    fileName: 'Arif_Hossain_Python_Data.pdf',
    candidateName: 'Arif Hossain',
    email: 'arif.hossain@datainsight.bd',
    text: `Arif Hossain - Python Data Engineer and ML enthusiast with 3 years experience.
Skills: Python, Django, Pandas, NumPy, Scikit-learn, SQL, Docker, FastAPI, PostgreSQL.
Experience:
- Data Analyst & Python Developer at Grameenphone (2022-Present): Built ETL pipelines and churn prediction models.
Education: B.Sc. in EEE from BUET (CGPA 3.60/4.0).`
  },
  {
    fileName: 'Mahmudul_Hasan_Senior_DevOps.pdf',
    candidateName: 'Mahmudul Hasan',
    email: 'mahmudul.hasan@infrapro.io',
    text: `Mahmudul Hasan - Senior DevOps & Cloud Architect with 6 years experience in AWS, Kubernetes, and CI/CD.
Skills: Kubernetes, Docker, Terraform, AWS, Jenkins, GitHub Actions, Prometheus, Linux, Bash, Go.
Experience:
- Lead DevOps Engineer at ShareTrip (2021-Present): Automated zero-downtime deployment pipelines for 30+ services.
Education: B.Sc. in CSE from IUT (CGPA 3.70/4.0).`
  },
  {
    fileName: 'Zubair_Khan_QA_Automation.pdf',
    candidateName: 'Zubair Khan',
    email: 'zubair.khan@testlab.bd',
    text: `Zubair Khan - QA Automation Engineer with 4 years testing modern web & mobile apps.
Skills: Selenium, Cypress, Playwright, JavaScript, Postman, JMeter, CI/CD, TestRail, Agile.
Experience:
- QA Lead at Selise Digital Platforms (2021-Present): Built end-to-end regression suites for fintech banking apps.
Education: B.Sc. in CSE from Daffodil International University (CGPA 3.40/4.0).`
  },
  {
    fileName: 'Priyanka_Ghosh_FullStack_React_Django.pdf',
    candidateName: 'Priyanka Ghosh',
    email: 'priyanka.ghosh@devstudio.com',
    text: `Priyanka Ghosh - Full Stack Engineer with 4.5 years in React, Python, Django, and PostgreSQL.
Skills: React, TypeScript, Python, Django, PostgreSQL, Docker, Redis, Celery, REST APIs.
Experience:
- Full Stack Engineer at Augmedix Bangladesh (2021-Present): Built clinical documentation tools and realtime sync.
Education: B.Sc. in CSE from CUET (CGPA 3.75/4.0).`
  },
  {
    fileName: 'Kazi_Shahed_Frontend_Vue_React.pdf',
    candidateName: 'Kazi Shahed',
    email: 'kazi.shahed@innovations.bd',
    text: `Kazi Shahed - Frontend Engineer with 2.5 years experience in Vue.js, React, and CSS animations.
Skills: Vue.js, React, JavaScript, CSS3, Tailwind CSS, Vite, Figma to Code, REST APIs.
Experience:
- Frontend Dev at Enosis Solutions (2022-Present): Implemented interactive dashboards for US healthcare clients.
Education: B.Sc. in CSE from AUST (CGPA 3.52/4.0).`
  },
  {
    fileName: 'Anika_Tabassum_WordPress_Designer.pdf',
    candidateName: 'Anika Tabassum',
    email: 'anika.tabassum@designhub.bd',
    text: `Anika Tabassum - Web Designer and WordPress Specialist with 2 years building client websites.
Skills: WordPress, Elementor, PHP, HTML5, CSS3, JavaScript basics, Graphic Design, Canva.
Experience:
- Freelance Web Designer (2022-Present): Delivered 25+ e-commerce and agency landing pages on WordPress.
Education: Diploma in Graphic Design & Web Development (CGPA 3.10/4.0).`
  }
];

export const BatchResumeScreening: React.FC<BatchResumeScreeningProps> = ({
  onScheduleCandidate,
  onSendQuiz
}) => {
  const { jobs, applications, updateApplicationStatus } = useJobs();
  const { currentCompany } = useAuth();
  const { isBangla } = useLanguage();

  // Selected job for batch screening
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Uploaded files / resumes
  const [resumesToScreen, setResumesToScreen] = useState<Array<{ fileName: string; text: string; candidateName?: string; email?: string }>>([]);

  // Screening processing state
  const [isScreening, setIsScreening] = useState(false);
  const [screeningProgress, setScreeningProgress] = useState(0);

  // Screened results
  const [screenedCandidates, setScreenedCandidates] = useState<BatchScreenedCandidate[]>([]);

  // Filtering & Search
  const [tierFilter, setTierFilter] = useState<'all' | BatchScreeningTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());

  // Inspect candidate modal
  const [inspectingCandidate, setInspectingCandidate] = useState<BatchScreenedCandidate | null>(null);

  // Load sample preset resumes
  const handleLoadPreset = (count: number) => {
    const subset = PRESET_RESUMES.slice(0, count);
    setResumesToScreen(subset);
    setScreenedCandidates([]);
    setSelectedCandidateIds(new Set());
  };

  // Handle local file uploads (multiple PDFs or txt)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newResumes: Array<{ fileName: string; text: string; candidateName?: string; email?: string }> = [];

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = (event.target?.result as string) || '';
        const nameGuess = file.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, '');
        
        newResumes.push({
          fileName: file.name,
          candidateName: nameGuess,
          email: `${nameGuess.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          text: textContent.length > 50 ? textContent : `Candidate ${nameGuess} resume text submitted via file upload ${file.name}. Experience in software development and technical project delivery.`
        });

        if (newResumes.length === files.length) {
          setResumesToScreen(prev => [...prev, ...newResumes]);
        }
      };
      reader.readAsText(file);
    });
  };

  // Run Gemini batch screening
  const handleRunBatchScreening = async () => {
    if (!targetJob || resumesToScreen.length === 0) return;

    setIsScreening(true);
    setScreeningProgress(15);

    try {
      const timer1 = setTimeout(() => setScreeningProgress(45), 600);
      const timer2 = setTimeout(() => setScreeningProgress(80), 1200);

      const results = await batchScreenResumesWithAI(
        {
          id: targetJob.id,
          title: targetJob.title,
          requirements: targetJob.requirements,
          skills: targetJob.skills,
          description: targetJob.summary || targetJob.requirements.join('\n')
        },
        resumesToScreen
      );

      clearTimeout(timer1);
      clearTimeout(timer2);
      setScreeningProgress(100);

      setScreenedCandidates(results);
      // Auto select top tier
      const topIds = results.filter(c => c.tier === 'top_tier').map(c => c.id);
      setSelectedCandidateIds(new Set(topIds));

      confetti({ particleCount: 50, spread: 70 });
    } catch (err) {
      console.error('Batch screening failed:', err);
    } finally {
      setIsScreening(false);
    }
  };

  // Toggle single candidate selection
  const toggleSelectCandidate = (id: string) => {
    const updated = new Set(selectedCandidateIds);
    if (updated.has(id)) updated.delete(id);
    else updated.add(id);
    setSelectedCandidateIds(updated);
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedCandidateIds.size === filteredCandidates.length) {
      setSelectedCandidateIds(new Set());
    } else {
      setSelectedCandidateIds(new Set(filteredCandidates.map(c => c.id)));
    }
  };

  // Batch action: Shortlist selected
  const handleBatchShortlist = () => {
    setScreenedCandidates(prev => 
      prev.map(c => selectedCandidateIds.has(c.id) ? { ...c, status: 'shortlisted' } : c)
    );
    confetti({ particleCount: 35, spread: 60 });
  };

  // Batch action: Reject selected
  const handleBatchReject = () => {
    setScreenedCandidates(prev => 
      prev.map(c => selectedCandidateIds.has(c.id) ? { ...c, status: 'rejected' } : c)
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Match Score', 'Tier', 'Experience Years', 'Status', 'Recommendation'];
    const rows = screenedCandidates.map(c => [
      `"${c.candidateName}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.matchScore}%"`,
      `"${c.tier}"`,
      `"${c.experienceYears}"`,
      `"${c.status}"`,
      `"${c.recommendation.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${targetJob?.title.replace(/\s+/g, '_')}_batch_shortlist.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered candidate list
  const filteredCandidates = screenedCandidates.filter(c => {
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.candidateName.toLowerCase().includes(q);
      const matchSkill = c.matchedSkills.some(s => s.toLowerCase().includes(q));
      const matchHeadline = c.headline.toLowerCase().includes(q);
      if (!matchName && !matchSkill && !matchHeadline) return false;
    }
    return true;
  });

  // Tiers breakdown
  const topTierCount = screenedCandidates.filter(c => c.tier === 'top_tier').length;
  const reviewNeededCount = screenedCandidates.filter(c => c.tier === 'review_needed').length;
  const notQualifiedCount = screenedCandidates.filter(c => c.tier === 'not_qualified').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-6 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                AI Bulk Intelligence
              </span>
              <span className="text-xs text-neutral-400">• {isBangla ? 'উচ্চ-গতির বাল্ক যাচাই' : 'High-Throughput Screening'}</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white">
              {isBangla ? 'স্বয়ংক্রিয় বাল্ক রেজুমে স্ক্রিনিং ও র‍্যাংকিং' : 'Automated Resume Batch Screening & Ranking'}
            </h1>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              {isBangla 
                ? 'একসাথে ১০–৫০টি রেজুমে আপলোড করুন। এআই একই সাথে সকল প্রার্থীর সিভি জবের প্রয়োজনীয়তার সাথে তুলনা করে বিশ্লেষণ করবে এবং তাৎক্ষণিক ৩টি স্তরে তালিকা তৈরি করবে।' 
                : 'Upload 10–50 candidate resumes simultaneously. AI evaluates all candidates concurrently against your job description, benchmarks technical competencies, and creates an instant tiered shortlist.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 bg-neutral-800/80 rounded-xl text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              {isBangla ? 'নির্দিষ্ট পদ:' : 'Target Role:'}
            </span>
            <select
              value={selectedJobId}
              onChange={e => {
                setSelectedJobId(e.target.value);
                setScreenedCandidates([]);
              }}
              className="bg-neutral-800 text-white text-xs border border-neutral-700 rounded-xl p-2 font-medium focus:ring-1 focus:ring-emerald-500"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.department})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Job Quick Specs */}
      {targetJob && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 text-sm">{targetJob.title}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-600">{targetJob.location}</span>
            <span className="text-neutral-400">•</span>
            <span className="text-emerald-700 font-semibold">৳ {targetJob.salaryMinBdt.toLocaleString()} - {targetJob.salaryMaxBdt.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-neutral-500 text-[11px] font-semibold">{isBangla ? 'প্রয়োজনীয় স্কিল:' : 'Required Skills:'}</span>
            {targetJob.skills.slice(0, 5).map(skill => (
              <span key={skill} className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium border border-neutral-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Bulk Upload & Presets Section */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              {isBangla ? '১. বাল্ক প্রসেসিংয়ের জন্য রেজুমে যোগ করুন (১০–৫০টি)' : '1. Add Resumes for Batch Processing (10–50 Resumes)'}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isBangla 
                ? 'আপনার কম্পিউটার থেকে ফাইল নির্বাচন করুন বা দ্রুত পরীক্ষার জন্য আমাদের নমুনা প্রি-সেট প্যাকেজ লোড করুন।' 
                : 'Select files from your machine or click one of our realistic pre-loaded applicant packages to test AI batch screening instantly.'}
            </p>
          </div>

          {/* Quick preset package buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-neutral-400 font-medium">{isBangla ? 'দ্রুত প্রি-সেট:' : 'Quick Presets:'}</span>
            <button
              type="button"
              onClick={() => handleLoadPreset(6)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
            >
              {isBangla ? '৬টি রেজুমে লোড' : 'Load 6 Resumes'}
            </button>
            <button
              type="button"
              onClick={() => handleLoadPreset(12)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 cursor-pointer"
            >
              {isBangla ? '১২ জন ফুল-স্ট্যাক ডেভেলপার' : 'Load 12 Full-Stack Devs'}
            </button>
            {resumesToScreen.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setResumesToScreen([]);
                  setScreenedCandidates([]);
                }}
                className="px-2 py-1 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-50 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> {isBangla ? 'মুছুন' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Drag and drop upload zone */}
        <label className="border-2 border-dashed border-neutral-300 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-emerald-50/30">
          <Upload className="w-8 h-8 text-neutral-400 mb-2" />
          <span className="text-xs font-bold text-neutral-800">
            {isBangla ? 'PDF, Word বা টেক্সট রেজুমে আপলোড করতে ক্লিক করুন অথবা টেনে আনুন' : 'Click to upload PDF, Word or Text Resumes, or drag files here'}
          </span>
          <span className="text-[11px] text-neutral-500 mt-0.5">
            {isBangla ? 'একসাথে সর্বোচ্চ ৫০টি ডকুমেন্টের বাল্ক প্রসেসিং সমর্থন করে।' : 'Supports batch processing up to 50 documents simultaneously.'}
          </span>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Queued Resumes Summary */}
        {resumesToScreen.length > 0 && (
          <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white">
                {resumesToScreen.length} {isBangla ? 'টি রেজুমে অপেক্ষারত' : 'Resumes Queued'}
              </span>
              <span className="text-xs text-neutral-500">
                {isBangla ? 'এআই সমান্তরাল বিশ্লেষণ ও র‍্যাংকিংয়ের জন্য প্রস্তুত' : 'Ready for AI concurrent parsing & ranking'}
              </span>
            </div>

            <button
              type="button"
              disabled={isScreening}
              onClick={handleRunBatchScreening}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isScreening ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBangla ? `প্রক্রিয়াকরণ হচ্ছে ${screeningProgress}%...` : `Processing ${screeningProgress}%...`}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isBangla ? `বাল্ক স্ক্রীনিং চালান (${resumesToScreen.length})` : `Run Batch Screening (${resumesToScreen.length})`}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Screened Shortlist & Tiered Ranking Results */}
      {screenedCandidates.length > 0 && (
        <div className="space-y-4 animate-in fade-in">
          {/* Tier Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Top 10% Match Tier */}
            <div 
              onClick={() => setTierFilter(tierFilter === 'top_tier' ? 'all' : 'top_tier')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                tierFilter === 'top_tier' 
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' 
                  : 'bg-white border-neutral-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-600" />
                  {isBangla ? 'শীর্ষ ১০% উপযুক্ত' : 'Top 10% Match'}
                </span>
                <span className="text-xl font-black text-emerald-700">{topTierCount}</span>
              </div>
              <h4 className="font-bold text-xs text-neutral-900 mt-2">
                {isBangla ? 'অসাধারণ প্রার্থী (≥ ৮০%)' : 'Exceptional Candidates (≥ 80%)'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                {isBangla 
                  ? 'জবের স্কিল ও অভিজ্ঞতার সাথে নিখুঁত মিল। দ্রুত ইন্টারভিউ নির্ধারণের জন্য সুপারিশকৃত।' 
                  : 'Strong skill match, required experience depth, recommended for fast-track interview scheduling.'}
              </p>
            </div>

            {/* Review Needed Tier */}
            <div 
              onClick={() => setTierFilter(tierFilter === 'review_needed' ? 'all' : 'review_needed')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                tierFilter === 'review_needed' 
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200' 
                  : 'bg-white border-neutral-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  {isBangla ? 'রিভিউ প্রয়োজন' : 'Review Needed'}
                </span>
                <span className="text-xl font-black text-amber-700">{reviewNeededCount}</span>
              </div>
              <h4 className="font-bold text-xs text-neutral-900 mt-2">
                {isBangla ? 'সম্ভাব্য উপযুক্ত (৫৫% - ৭৯%)' : 'Potential Fits (55% - 79%)'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                {isBangla 
                  ? 'কিছু স্কিল মিলেছে, টেকনিক্যাল কুইজ দিয়ে যাচাই করার সুপারিশ করা হচ্ছে।' 
                  : 'Partial skill overlap or adjacent background. Recommend assigning Technical Quiz to verify competencies.'}
              </p>
            </div>

            {/* Not Qualified Tier */}
            <div 
              onClick={() => setTierFilter(tierFilter === 'not_qualified' ? 'all' : 'not_qualified')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                tierFilter === 'not_qualified' 
                  ? 'bg-red-50 border-red-400 ring-2 ring-red-200' 
                  : 'bg-white border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-neutral-100 text-neutral-600 border border-neutral-200 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-neutral-400" />
                  {isBangla ? 'মানদণ্ডের নিচে' : 'Under Benchmark'}
                </span>
                <span className="text-xl font-black text-neutral-600">{notQualifiedCount}</span>
              </div>
              <h4 className="font-bold text-xs text-neutral-900 mt-2">
                {isBangla ? 'অনুপযুক্ত (< ৫৫%)' : 'Not Qualified (< 55%)'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                {isBangla 
                  ? 'মূল ফ্রেমওয়ার্ক বা প্রয়োজনীয় অভিজ্ঞতার ঘাটতি। এক ক্লিকে বাতিল করতে পারেন।' 
                  : 'Lacks required core frameworks or years of domain experience. Batch reject with 1 click.'}
              </p>
            </div>
          </div>

          {/* Action Toolbar & Filters */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Search & Tier filter pills */}
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isBangla ? 'প্রার্থী, স্কিল বা শিক্ষা দিয়ে খুঁজুন...' : 'Filter candidate, skill, education...'}
                  className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setTierFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    tierFilter === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {isBangla ? 'সকল' : 'All'} ({screenedCandidates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter('top_tier')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    tierFilter === 'top_tier' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {isBangla ? 'শীর্ষ ১০%' : 'Top 10%'} ({topTierCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter('review_needed')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    tierFilter === 'review_needed' ? 'bg-amber-600 text-white' : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {isBangla ? 'রিভিউ প্রয়োজন' : 'Review Needed'} ({reviewNeededCount})
                </button>
                <button
                  type="button"
                  onClick={() => setTierFilter('not_qualified')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    tierFilter === 'not_qualified' ? 'bg-neutral-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {isBangla ? 'মানদণ্ডের নিচে' : 'Under Benchmark'} ({notQualifiedCount})
                </button>
              </div>
            </div>

            {/* Right: Batch operations on selected */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 cursor-pointer"
              >
                {selectedCandidateIds.size === filteredCandidates.length 
                  ? (isBangla ? 'সব নির্বাচন বাতিল' : 'Deselect All') 
                  : (isBangla ? 'সব নির্বাচন' : 'Select All')}
              </button>

              <button
                type="button"
                disabled={selectedCandidateIds.size === 0}
                onClick={handleBatchShortlist}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-40"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isBangla ? `শর্টলিস্ট (${selectedCandidateIds.size})` : `Shortlist (${selectedCandidateIds.size})`}</span>
              </button>

              <button
                type="button"
                disabled={selectedCandidateIds.size === 0}
                onClick={handleBatchReject}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 border border-neutral-200 cursor-pointer disabled:opacity-40"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isBangla ? `প্রত্যাখ্যান (${selectedCandidateIds.size})` : `Reject (${selectedCandidateIds.size})`}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 flex items-center gap-1 cursor-pointer"
                title="Download CSV shortlist for hiring sync"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>{isBangla ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* Candidate Cards Grid */}
          <div className="space-y-3">
            {filteredCandidates.map((cand, idx) => {
              const isSelected = selectedCandidateIds.has(cand.id);

              return (
                <div
                  key={cand.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs space-y-3 ${
                    isSelected ? 'border-emerald-400 bg-emerald-50/20' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectCandidate(cand.id)}
                        className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-neutral-900">{cand.candidateName}</h4>
                          
                          {/* Tier Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            cand.tier === 'top_tier' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : cand.tier === 'review_needed' 
                              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                              : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                          }`}>
                            {cand.tier === 'top_tier' 
                              ? (isBangla ? 'শীর্ষ ১০% উপযুক্ত' : 'Top 10% Match') 
                              : cand.tier === 'review_needed' 
                              ? (isBangla ? 'রিভিউ প্রয়োজন' : 'Review Needed') 
                              : (isBangla ? 'মানদণ্ডের নিচে' : 'Under Benchmark')}
                          </span>

                          {/* Candidate status */}
                          {cand.status !== 'pending' && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              cand.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'
                            }`}>
                              ● {cand.status === 'shortlisted' ? (isBangla ? 'শর্টলিস্টেড' : 'shortlisted') : (isBangla ? 'বাতিল' : 'rejected')}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-neutral-500 mt-0.5">
                          {cand.headline} • {cand.experienceYears} {isBangla ? 'বছরের অভিজ্ঞতা' : 'Years Exp'} • {cand.educationSummary}
                        </p>
                      </div>
                    </div>

                    {/* Match Score & Actions */}
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="text-right">
                        <div className={`text-xl font-black ${
                          cand.matchScore >= 80 ? 'text-emerald-700' : cand.matchScore >= 55 ? 'text-amber-600' : 'text-neutral-500'
                        }`}>
                          {cand.matchScore}%
                        </div>
                        <span className="text-[10px] text-neutral-400 font-semibold block -mt-1">
                          {isBangla ? 'মিল স্কোর' : 'Match Score'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setInspectingCandidate(cand)}
                          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isBangla ? 'পর্যবেক্ষণ' : 'Inspect'}</span>
                        </button>

                        {onSendQuiz && (
                          <button
                            type="button"
                            onClick={() => onSendQuiz(cand)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer border border-indigo-200"
                            title="Assign Technical Assessment Quiz"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>{isBangla ? 'কুইজ দিন' : 'Assign Quiz'}</span>
                          </button>
                        )}

                        {onScheduleCandidate && (
                          <button
                            type="button"
                            onClick={() => onScheduleCandidate(cand)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{isBangla ? 'ইন্টারভিউ' : 'Interview'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Skills matching badges */}
                  <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-neutral-500">{isBangla ? 'যাচাইকৃত স্কিল:' : 'Verified Skills:'}</span>
                      {cand.matchedSkills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ {skill}
                        </span>
                      ))}

                      {cand.missingSkills.length > 0 && (
                        <span className="text-[10px] text-neutral-400 ml-1">
                          {isBangla ? 'অনুপস্থিত:' : 'Missing:'} {cand.missingSkills.slice(0, 3).join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-600 italic">
                      "{cand.recommendation}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inspect Candidate Drawer Modal */}
      {inspectingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-neutral-900">{inspectingCandidate.candidateName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    inspectingCandidate.tier === 'top_tier' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inspectingCandidate.matchScore}% {isBangla ? 'ম্যাচ' : 'Match'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {inspectingCandidate.email} • {inspectingCandidate.phone} • {inspectingCandidate.headline}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectingCandidate(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Recommendation summary */}
            <div className="p-3.5 rounded-xl bg-neutral-900 text-white text-xs space-y-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isBangla ? 'এআই মূল্যায়ন ও নিয়োগ সুপারিশ:' : 'AI Screening Evaluation & Recommendation:'}
              </span>
              <p className="text-neutral-200 leading-relaxed">
                {inspectingCandidate.recommendation}
              </p>
              <p className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                {inspectingCandidate.rawSummary}
              </p>
            </div>

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 block">{isBangla ? 'প্রধান শক্তিমত্তা:' : 'Demonstrated Strengths:'}</span>
                <ul className="list-disc list-inside text-emerald-950 space-y-0.5 text-[11px]">
                  {inspectingCandidate.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 block">{isBangla ? 'ঘাটতি / লক্ষণীয় দিক:' : 'Potential Gaps / Considerations:'}</span>
                <ul className="list-disc list-inside text-amber-950 space-y-0.5 text-[11px]">
                  {inspectingCandidate.concernsOrRedFlags.length > 0 ? (
                    inspectingCandidate.concernsOrRedFlags.map((c, i) => <li key={i}>{c}</li>)
                  ) : (
                    <li>{isBangla ? 'কোনো গুরুতর উদ্বেগের লক্ষণ নেই। নির্ভরযোগ্য উপযুক্ততা।' : 'No critical red flags identified. Good baseline fit.'}</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <span className="font-bold text-neutral-800 block">{isBangla ? 'কারিগরি দক্ষতার ম্যাপিং:' : 'Technical Competency Mapping:'}</span>
              <div className="flex flex-wrap gap-1.5">
                {inspectingCandidate.matchedSkills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    ✓ {s}
                  </span>
                ))}
                {inspectingCandidate.missingSkills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 text-[11px]">
                    ✕ {isBangla ? 'অনুপস্থিত:' : 'Missing:'} {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setInspectingCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                {isBangla ? 'বন্ধ করুন' : 'Close'}
              </button>
              {onScheduleCandidate && (
                <button
                  type="button"
                  onClick={() => {
                    onScheduleCandidate(inspectingCandidate);
                    setInspectingCandidate(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'ইন্টারভিউ নির্ধারণ' : 'Schedule Interview'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
