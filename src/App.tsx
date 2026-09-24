import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider, useJobs } from './context/JobContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeToggle } from './components/ThemeToggle';
import { PreSignupPage } from './components/PreSignupPage';
import { AppSidebar } from './components/AppSidebar';
import { JobWall } from './components/JobWall';
import { JobDetailsView } from './components/JobDetailsView';
import { JobSeekerDashboard } from './components/JobSeekerDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { ProfileResumeBuilder } from './components/ProfileResumeBuilder';
import { ApplicationTracker } from './components/ApplicationTracker';
import { PostJobWizard } from './components/PostJobWizard';
import { CareerChatbot } from './components/CareerChatbot';
import { AuthModal } from './components/AuthModal';
import { ApplicationModal } from './components/ApplicationModal';
import { AdminPanel } from './components/AdminPanel';
import { MarketIntelligence } from './components/MarketIntelligence';
import { SkillsGapAnalysis } from './components/SkillsGapAnalysis';
import { RecruiterCalendarScheduler } from './components/RecruiterCalendarScheduler';
import { CandidateComparisonTable } from './components/CandidateComparisonTable';
import { PostInterviewFeedbackModal } from './components/PostInterviewFeedbackModal';
import { MockInterviewSimulator } from './components/MockInterviewSimulator';
import { BatchResumeScreening } from './components/BatchResumeScreening';
import { TechnicalAssessmentQuiz } from './components/TechnicalAssessmentQuiz';
import { CollaborativeHiringScorecard } from './components/CollaborativeHiringScorecard';
import { OfferLetterBuilder } from './components/OfferLetterBuilder';
import { JobListing, Application, InterviewSchedule, UserRole } from './types';
import { 
  Bookmark, 
  Calendar, 
  Building2, 
  Sparkles, 
  Bell, 
  Users, 
  Layers, 
  PlusCircle, 
  Briefcase, 
  TrendingUp, 
  FileText,
  Target,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Mic,
  Globe,
  FileSpreadsheet,
  HelpCircle,
  PenTool,
  Menu
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, userProfile, demoLoginAs, instantGuestLogin } = useAuth();
  const { language, setLanguage, isBangla, t } = useLanguage();
  const { 
    jobs, 
    companies, 
    applications, 
    savedJobIds, 
    interviews, 
    notifications, 
    markNotificationAsRead,
    scheduleInterview,
    updateInterview,
    cancelInterview,
    updateApplicationStatus
  } = useJobs();

  const role = userProfile?.role || 'jobseeker';

  // Responsive mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'instant'>('instant');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('jobseeker');
  const [applyModalJob, setApplyModalJob] = useState<JobListing | null>(null);
  const [mockInterviewJob, setMockInterviewJob] = useState<JobListing | null>(null);

  // Feedback modal state (for recruiter views)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCandidate, setFeedbackCandidate] = useState<Application | null>(null);
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewSchedule | null>(null);

  // Notifications dropdown state
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const unreadNotifs = notifications.filter(n => !n.read);

  // Sync view when auth state or role changes
  useEffect(() => {
    if (!user) {
      setCurrentView('landing');
    } else {
      if (role === 'recruiter') {
        const recruiterViews = [
          'recruiter_dashboard', 
          'resume_screening',
          'screening_quiz',
          'collaborative_scorecards',
          'interview_calendar', 
          'candidate_comparison', 
          'offer_letter_builder',
          'post_job', 
          'jobs_management', 
          'market_intelligence',
          'companies',
          'admin'
        ];
        if (!recruiterViews.includes(currentView)) {
          setCurrentView('recruiter_dashboard');
        }
      } else {
        const seekerViews = [
          'dashboard', 
          'jobs', 
          'job_details', 
          'skills_gap', 
          'applications', 
          'interviews', 
          'saved_jobs', 
          'profile_builder', 
          'mock_interview',
          'market_intelligence',
          'companies',
          'admin'
        ];
        if (!seekerViews.includes(currentView)) {
          setCurrentView('dashboard');
        }
      }
    }
  }, [user, role]);

  const handleOpenAuth = (mode: 'login' | 'signup' | 'instant' = 'instant', initialRole: UserRole = 'jobseeker') => {
    setAuthModalMode(mode);
    setAuthModalRole(initialRole);
    setAuthModalOpen(true);
  };

  const handleSelectJob = (job: JobListing) => {
    setSelectedJob(job);
    setCurrentView('job_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyJob = (job: JobListing) => {
    if (!user) {
      handleOpenAuth('signup', 'jobseeker');
      return;
    }
    setApplyModalJob(job);
  };

  const handleStartMockInterview = (job?: JobListing | null) => {
    if (job) {
      setMockInterviewJob(job);
    }
    setCurrentView('mock_interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper for top header title
  const getViewTitle = (view: string) => {
    switch (view) {
      // Seeker views
      case 'dashboard':
        return { 
          title: isBangla ? 'ক্যারিয়ার ড্যাশবোর্ড ও ওভারভিউ' : 'Career Dashboard & Overview', 
          icon: Target 
        };
      case 'jobs':
        return { 
          title: isBangla ? 'চাকরির সুযোগ খুঁজুন' : 'Explore Job Opportunities', 
          icon: Briefcase 
        };
      case 'job_details':
        return { 
          title: selectedJob?.title || (isBangla ? 'চাকরির বিস্তারিত বিবরণ' : 'Job Details'), 
          icon: Briefcase 
        };
      case 'skills_gap':
        return { 
          title: isBangla ? 'এআই দক্ষতার ঘাটতি বিশ্লেষণ' : 'AI Skills Gap Analysis', 
          icon: Sparkles 
        };
      case 'applications':
        return { 
          title: isBangla ? 'আমার চাকরির আবেদনসমূহ' : 'My Job Applications', 
          icon: TrendingUp 
        };
      case 'interviews':
        return { 
          title: isBangla ? 'আমার নির্ধারিত ইন্টারভিউ' : 'My Scheduled Interviews', 
          icon: Calendar 
        };
      case 'saved_jobs':
        return { 
          title: isBangla ? 'সংরক্ষিত চাকরির বুকমার্ক' : 'Saved Job Bookmarks', 
          icon: Bookmark 
        };
      case 'profile_builder':
        return { 
          title: isBangla ? 'এআই সিভি ও প্রোফাইল বিল্ডার' : 'AI Resume & Profile Builder', 
          icon: FileText 
        };
      case 'mock_interview':
        return { 
          title: isBangla ? 'এআই মক ইন্টারভিউ সিমুলেটর ও ভয়েস প্রস্তুতি' : 'AI Mock Interview Simulator & Voice Prep', 
          icon: Mic 
        };

      // Recruiter views
      case 'recruiter_dashboard':
        return { 
          title: isBangla ? 'প্রার্থী পাইপলাইন ও এআই স্ক্রীনিং' : 'Candidate Pipeline & AI Scoring', 
          icon: Users 
        };
      case 'resume_screening':
        return { 
          title: isBangla ? 'বাল্ক রেজুমে স্ক্রীনিং ও র‍্যাংকিং' : 'Automated Resume Batch Screening & Ranking', 
          icon: FileSpreadsheet 
        };
      case 'screening_quiz':
        return { 
          title: isBangla ? 'এআই টেকনিক্যাল অ্যাসেসমেন্ট ও স্ক্রীনিং কুইজ' : 'AI-Generated Technical Assessment & Screening Quizzes', 
          icon: HelpCircle 
        };
      case 'collaborative_scorecards':
        return { 
          title: isBangla ? 'হায়ারিং টিম নোটস ও ইন্টারনাল স্কোরকার্ড' : 'Collaborative Hiring Team Notes & Internal Scorecards', 
          icon: Users 
        };
      case 'interview_calendar':
        return { 
          title: isBangla ? 'ইন্টারভিউ ক্যালেন্ডার ও ড্র্যাগ-অ্যান্ড-ড্রপ শিডিউলার' : 'Interview Calendar & Drag-and-Drop Scheduler', 
          icon: Calendar 
        };
      case 'candidate_comparison':
        return { 
          title: isBangla ? 'প্রার্থী বেঞ্চমার্ক ও টিম স্কোরকার্ড ম্যাট্রিক্স' : 'Candidate Benchmark & Comparison Matrix', 
          icon: Layers 
        };
      case 'offer_letter_builder':
        return { 
          title: isBangla ? 'অফার লেটার বিল্ডার ও ডিজিটাল স্বাক্ষর' : 'Offer Letter Builder & Digital Signature Workflow', 
          icon: PenTool 
        };
      case 'post_job':
        return { 
          title: isBangla ? 'নতুন চাকরি তৈরি ও প্রকাশ' : 'Create & Publish New Job', 
          icon: PlusCircle 
        };
      case 'jobs_management':
        return { 
          title: isBangla ? 'চলমান চাকরির পদ পরিচালনা' : 'Manage Active Job Postings', 
          icon: Briefcase 
        };

      // Shared views
      case 'market_intelligence':
        return { 
          title: isBangla ? 'ঢাকা মার্কেট বেতন ইনটেলিজেন্স' : 'Dhaka Market Salary Intelligence', 
          icon: BarChart3 
        };
      case 'companies':
        return { 
          title: isBangla ? 'যাচাইকৃত প্রতিষ্ঠান ডিরেক্টরি' : 'Verified Companies Directory', 
          icon: Building2 
        };
      case 'admin':
        return { 
          title: isBangla ? 'সিস্টেম অ্যাডমিনিস্ট্রেশন প্যানেল' : 'System Administration Panel', 
          icon: ShieldCheck 
        };
      default:
        return { 
          title: isBangla ? 'কর্ম বিডি পোর্টাল' : 'Kormo BD Portal', 
          icon: Sparkles 
        };
    }
  };

  const activeHeader = getViewTitle(currentView);
  const HeaderIcon = activeHeader.icon;
  const savedJobsList = jobs.filter(j => savedJobIds.includes(j.id));

  // =========================================================================
  // 1. BEFORE SIGNUP / UNASSIGNED (GUEST): FULLY DIFFERENT PUBLIC PAGE
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-emerald-500 selection:text-neutral-950">
        <PreSignupPage
          onOpenAuth={handleOpenAuth}
          onDemoLogin={(demoRole) => demoLoginAs(demoRole)}
          onInstantLogin={(instantRole, customName) => instantGuestLogin(instantRole, customName)}
        />

        {/* Global Auth Modal for Guest Visitors */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
          initialRole={authModalRole}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. AFTER SIGNUP: AUTHENTICATED WORKSPACE WITH ALWAYS-OPEN SIDEBAR
  // =========================================================================
  return (
    <div className="min-h-screen bg-neutral-950 flex font-sans selection:bg-emerald-500 selection:text-neutral-950">
      {/* ALWAYS-OPEN SIDEBAR (Desktop) + DRAWER (Mobile) */}
      <AppSidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 min-w-0 min-h-screen bg-neutral-50/70 dark:bg-neutral-950 overflow-x-hidden flex flex-col text-neutral-900 dark:text-neutral-100 transition-colors">
        {/* Workspace Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className={`p-1.5 sm:p-2 rounded-xl border shrink-0 ${
              role === 'recruiter' 
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            }`}>
              <HeaderIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-bold text-neutral-900 dark:text-white truncate flex items-center gap-2">
                {activeHeader.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Direct Shortcut Pill based on role */}
            {role === 'jobseeker' && (
              <button
                onClick={() => handleNavigate('skills_gap')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>AI Skills Gap</span>
              </button>
            )}

            {role === 'recruiter' && (
              <button
                onClick={() => handleNavigate('post_job')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post New Job</span>
              </button>
            )}

            {/* Dark and Night Mode Toggle */}
            <ThemeToggle variant="compact" />

            {/* Global Language Toggle (EN | বাংলা) */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                  language === 'bn'
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="বাংলা (Bangla)"
              >
                <span>বাংলা</span>
              </button>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white dark:ring-neutral-900 animate-pulse" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">Notifications</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{unreadNotifs.length} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-neutral-400 text-xs">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.link) handleNavigate(n.link.replace('/', ''));
                            setNotifDropdownOpen(false);
                          }}
                          className={`p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${
                            !n.read ? 'bg-emerald-50/50 dark:bg-emerald-950/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-neutral-900 dark:text-white text-xs">{n.title}</p>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />}
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-300 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active Role Tag */}
            <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
              role === 'recruiter' 
                ? 'bg-blue-50 text-blue-800 border-blue-200' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {role === 'recruiter' ? 'Recruiter' : 'Job Seeker'}
            </span>
          </div>
        </header>

        {/* =================================================================== */}
        {/* MAIN ROUTED CONTENT: TOTALLY DIFFERENT FOR JOB SEEKER VS RECRUITER  */}
        {/* =================================================================== */}
        <main className="flex-1 pb-24 lg:pb-8">
          {/* ================= JOB SEEKER EXCLUSIVE VIEWS ================= */}
          {role === 'jobseeker' && (
            <>
              {/* Seeker Dashboard */}
              {currentView === 'dashboard' && (
                <JobSeekerDashboard
                  onNavigate={handleNavigate}
                  onSelectJob={handleSelectJob}
                  onApplyJob={handleApplyJob}
                  initialTab="overview"
                />
              )}

              {/* Dedicated Skills Gap Analysis */}
              {currentView === 'skills_gap' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                    <div>
                      <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-emerald-600" />
                        AI Skills Gap Analysis
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">
                        Compare your resume skills against active requirements in your bookmarked jobs using AI.
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigate('jobs')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Browse More Jobs →
                    </button>
                  </div>
                  <SkillsGapAnalysis />
                </div>
              )}

              {/* Explore Jobs Feed */}
              {currentView === 'jobs' && (
                <JobWall
                  onSelectJob={handleSelectJob}
                  onApplyJob={handleApplyJob}
                />
              )}

              {/* Job Details View */}
              {currentView === 'job_details' && selectedJob && (
                <JobDetailsView
                  job={selectedJob}
                  onBack={() => handleNavigate('jobs')}
                  onApply={handleApplyJob}
                  onStartMockInterview={handleStartMockInterview}
                />
              )}

              {/* AI Mock Interview Simulator & Voice Prep */}
              {currentView === 'mock_interview' && (
                <MockInterviewSimulator
                  initialJob={mockInterviewJob}
                  onNavigateToJob={handleSelectJob}
                  onBackToJobs={() => handleNavigate('jobs')}
                />
              )}

              {/* My Applications Tracker */}
              {currentView === 'applications' && (
                <ApplicationTracker onStartMockInterview={handleStartMockInterview} />
              )}

              {/* AI Resume & Profile Builder */}
              {currentView === 'profile_builder' && (
                <ProfileResumeBuilder />
              )}

              {/* Saved Bookmarks */}
              {currentView === 'saved_jobs' && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                      <Bookmark className="w-6 h-6 text-emerald-600" /> Saved Job Bookmarks ({savedJobsList.length})
                    </h1>
                    {savedJobsList.length > 0 && (
                      <button
                        onClick={() => handleNavigate('skills_gap')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Analyze Skills Gap Against Bookmarks →
                      </button>
                    )}
                  </div>
                  {savedJobsList.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border text-center text-neutral-400 text-xs">
                      No jobs saved yet. Click the bookmark icon on any job card in Explore Jobs to save it for later.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {savedJobsList.map(job => (
                        <div key={job.id} className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-3 shadow-xs">
                          <h3 className="font-bold text-sm text-neutral-900">{job.title}</h3>
                          <p className="text-xs text-neutral-500">{job.companyName} • {job.location}</p>
                          <div className="pt-2 flex justify-between items-center">
                            <button
                              onClick={() => handleSelectJob(job)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => handleApplyJob(job)}
                              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Interviews Invites List */}
              {currentView === 'interviews' && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                  <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" /> Scheduled Interviews
                  </h1>
                  {interviews.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border text-center text-neutral-400 text-xs">
                      No interviews scheduled yet. Recruiters will send invites after reviewing your applications.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {interviews.map(item => (
                        <div key={item.id} className="p-5 bg-white rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                          <div>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">{item.type} Interview</span>
                            <h3 className="font-bold text-sm text-neutral-900 mt-0.5">{item.jobTitle}</h3>
                            <p className="text-xs text-neutral-500">{item.companyName} • Candidate: {item.candidateName}</p>
                            <div className="flex items-center gap-3 text-xs text-neutral-700 mt-2 font-medium">
                              <span>📅 {item.date}</span>
                              <span>⏰ {item.time}</span>
                            </div>
                          </div>
                          <div>
                            <a
                              href={item.meetingLinkOrLocation}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold inline-block shadow-xs"
                            >
                              Join Video Meeting
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ================= RECRUITER EXCLUSIVE VIEWS ================= */}
          {role === 'recruiter' && (
            <>
              {/* Recruiter Dashboard & Candidate Pipeline */}
              {currentView === 'recruiter_dashboard' && (
                <RecruiterDashboard
                  onNavigateToPostJob={() => handleNavigate('post_job')}
                />
              )}

              {/* Dedicated Drag & Drop Interview Calendar */}
              {currentView === 'interview_calendar' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                    <div>
                      <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Interview Calendar & Drag-and-Drop Scheduler
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">
                        Coordinate interview slots, avoid double bookings, and launch post-interview evaluations.
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigate('recruiter_dashboard')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      ← Back to Pipeline
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
                    <RecruiterCalendarScheduler
                      applications={applications}
                      interviews={interviews}
                      jobs={jobs}
                      recruiterId={user?.uid || 'recruiter_demo'}
                      companyName="Pathao"
                      onScheduleInterview={scheduleInterview}
                      onRescheduleInterview={updateInterview}
                      onCancelInterview={cancelInterview}
                      onOpenFeedback={(interview) => {
                        const matchedApp = applications.find(a => a.id === interview.applicationId);
                        if (matchedApp) {
                          setFeedbackCandidate(matchedApp);
                          setFeedbackInterview(interview);
                          setFeedbackModalOpen(true);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Dedicated Candidate Comparison Matrix */}
              {currentView === 'candidate_comparison' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
                    <div>
                      <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-amber-600" />
                        Candidate Benchmark & Feedback Matrix
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">
                        Benchmark candidates side-by-side with post-interview 5-star ratings and composite ranking scores.
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigate('recruiter_dashboard')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      ← Back to Pipeline
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
                    <CandidateComparisonTable
                      applications={applications}
                      jobs={jobs}
                      selectedIds={['app_sample_1', 'app_sample_3']}
                      onToggleSelect={() => {}}
                      onClearAll={() => {}}
                      onScheduleInterview={() => {}}
                      onUpdateStatus={updateApplicationStatus}
                      onOpenFeedback={(app) => {
                        const matchedInt = interviews.find(i => i.applicationId === app.id && i.status !== 'cancelled') || interviews.find(i => i.applicationId === app.id);
                        setFeedbackCandidate(app);
                        setFeedbackInterview(matchedInt || null);
                        setFeedbackModalOpen(true);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Post Job Multi-Step Wizard */}
              {currentView === 'post_job' && (
                <PostJobWizard
                  onSuccess={() => handleNavigate('recruiter_dashboard')}
                  onCancel={() => handleNavigate('recruiter_dashboard')}
                />
              )}

              {/* Automated Resume Batch Screening & Ranking */}
              {currentView === 'resume_screening' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        {isBangla ? 'বাল্ক রেজুমে স্ক্রীনিং ও র‍্যাংকিং' : 'Automated Resume Batch Screening & Ranking'}
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">
                        {isBangla 
                          ? 'একসাথে ১০–৫০ টি রেজুমে আপলোড করুন এবং এআই দিয়ে তাৎক্ষণিক র‍্যাঙ্কিং তৈরি করুন।' 
                          : 'Bulk screen 10-50 candidate resumes simultaneously with AI tiering and match scoring.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigate('recruiter_dashboard')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      {isBangla ? '← পাইপলাইনে ফিরে যান' : '← Back to Pipeline'}
                    </button>
                  </div>
                  <BatchResumeScreening
                    onScheduleCandidate={() => handleNavigate('interview_calendar')}
                    onSendQuiz={() => handleNavigate('screening_quiz')}
                  />
                </div>
              )}

              {/* AI-Generated Technical Assessment & Screening Quizzes */}
              {currentView === 'screening_quiz' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6 text-indigo-600" />
                        {isBangla ? 'এআই টেকনিক্যাল অ্যাসেসমেন্ট ও স্ক্রীনিং কুইজ' : 'AI-Generated Technical Assessment & Screening Quizzes'}
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">
                        {isBangla 
                          ? 'রোল-ভিত্তিক মাল্টিপল চয়েস ও কোডিং প্রশ্ন তৈরি করুন এবং স্বয়ংক্রিয় স্কোরিং পরিচালনা করুন।' 
                          : 'Generate role-tailored technical multiple-choice and coding tests with automated scoring.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigate('recruiter_dashboard')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      {isBangla ? '← পাইপলাইনে ফিরে যান' : '← Back to Pipeline'}
                    </button>
                  </div>
                  <TechnicalAssessmentQuiz
                    onAssignToCandidate={(_quiz, candId) => {
                      if (candId) {
                        updateApplicationStatus(candId, 'under_review');
                      }
                    }}
                  />
                </div>
              )}

              {/* Collaborative Hiring Team Notes & Internal Scorecards */}
              {currentView === 'collaborative_scorecards' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-amber-600" />
                        {isBangla ? 'টিম স্কোরকার্ড ও ইন্টারভিউ ডিব্রিফ' : 'Collaborative Hiring Team Notes & Internal Scorecards'}
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">
                        {isBangla 
                          ? 'টেক লিড, এইচআর এবং এক্সিকিউটিভদের যৌথ রেটিং, থাম্বস আপ/ডাউন এবং ডিব্রিফ সমন্বয় করুন।' 
                          : 'Multi-interviewer scorecards, committee debrief consensus, and hiring recommendations.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigate('recruiter_dashboard')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      {isBangla ? '← পাইপলাইনে ফিরে যান' : '← Back to Pipeline'}
                    </button>
                  </div>
                  <CollaborativeHiringScorecard
                    onProceedToOffer={() => handleNavigate('offer_letter_builder')}
                  />
                </div>
              )}

              {/* Offer Letter Builder & Digital Signature Workflow */}
              {currentView === 'offer_letter_builder' && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <PenTool className="w-6 h-6 text-purple-600" />
                        {isBangla ? 'অফার লেটার বিল্ডার ও ডিজিটাল স্বাক্ষর' : 'Offer Letter Builder & Digital Signature Workflow'}
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">
                        {isBangla 
                          ? 'টাকায় (BDT ৳) বেতন, উৎসব বোনাস, স্টক অপশনসহ কাস্টম অফার লেটার এবং ডিজিটাল সাইন।' 
                          : 'Fillable BDT salary contracts, festival bonus schedules, ESOPs, and printable PDF agreements.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNavigate('recruiter_dashboard')}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      {isBangla ? '← পাইপলাইনে ফিরে যান' : '← Back to Pipeline'}
                    </button>
                  </div>
                  <OfferLetterBuilder
                    onOfferSent={() => handleNavigate('recruiter_dashboard')}
                  />
                </div>
              )}

              {/* Manage Posted Jobs */}
              {currentView === 'jobs_management' && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-blue-600" /> Active Job Postings ({jobs.length})
                      </h1>
                      <p className="text-xs text-neutral-500 mt-1">Manage listings and candidate pipelines for your organization.</p>
                    </div>
                    <button
                      onClick={() => handleNavigate('post_job')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" /> Create New Job
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden shadow-xs">
                    {jobs.map(job => (
                      <div key={job.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                        <div>
                          <h3 className="font-bold text-sm text-neutral-900">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-neutral-500 mt-1">
                            <span>{job.department}</span>
                            <span>•</span>
                            <span>{job.location}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              ৳ {job.salaryMinBdt.toLocaleString()} - {job.salaryMaxBdt.toLocaleString()}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-neutral-800">{job.applicantsCount || 0} applicants</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            job.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {job.status.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleNavigate('recruiter_dashboard')}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            View Applicants
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= SHARED VIEWS ================= */}
          {/* Real-Time Market Intelligence */}
          {currentView === 'market_intelligence' && (
            <MarketIntelligence />
          )}

          {/* Companies Directory */}
          {currentView === 'companies' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">Verified Companies & Employers</h1>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  Explore leading organizations hiring in Bangladesh.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(comp => (
                  <div key={comp.id} className="p-6 bg-white rounded-2xl border border-neutral-200 space-y-4 shadow-xs">
                    <div className="flex items-center gap-4">
                      <img src={comp.logo} alt={comp.name} className="w-14 h-14 rounded-xl object-cover border" />
                      <div>
                        <h3 className="font-bold text-base text-neutral-900">{comp.name}</h3>
                        <span className="text-xs text-neutral-500">{comp.industry} • {comp.location}</span>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">{comp.description}</p>
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-xs text-neutral-400">{comp.companySize}</span>
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Visit Website →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Moderation Panel */}
          {currentView === 'admin' && (
            <AdminPanel />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
        <nav 
          className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 lg:hidden shadow-lg pb-safe"
          aria-label="Mobile workspace navigation"
        >
          <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
            {role === 'recruiter' ? (
              <>
                <button
                  onClick={() => handleNavigate('recruiter_dashboard')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors relative ${
                    currentView === 'recruiter_dashboard'
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <Users className="w-5 h-5" />
                    {applications.length > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] font-bold bg-blue-600 text-white rounded-full text-center">
                        {applications.length}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'পাইপলাইন' : 'Pipeline'}</span>
                </button>

                <button
                  onClick={() => handleNavigate('post_job')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors ${
                    currentView === 'post_job'
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'পোস্ট' : 'Post Job'}</span>
                </button>

                <button
                  onClick={() => handleNavigate('interview_calendar')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors ${
                    currentView === 'interview_calendar'
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'ক্যালেন্ডার' : 'Calendar'}</span>
                </button>

                <button
                  onClick={() => handleNavigate('candidate_comparison')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors ${
                    currentView === 'candidate_comparison'
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'ম্যাট্রিক্স' : 'Matrix'}</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex flex-col items-center justify-center min-h-[48px] py-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <Menu className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'মেনু' : 'Menu'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('jobs')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors ${
                    currentView === 'jobs'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'চাকরি' : 'Jobs'}</span>
                </button>

                <button
                  onClick={() => handleNavigate('dashboard')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors ${
                    currentView === 'dashboard'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'ড্যাশবোর্ড' : 'Overview'}</span>
                </button>

                <button
                  onClick={() => handleNavigate('skills_gap')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors ${
                    currentView === 'skills_gap'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'স্কিলস' : 'AI Skills'}</span>
                </button>

                <button
                  onClick={() => handleNavigate('applications')}
                  className={`flex flex-col items-center justify-center min-h-[48px] py-1 cursor-pointer transition-colors relative ${
                    currentView === 'applications'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <div className="relative">
                    <TrendingUp className="w-5 h-5" />
                    {applications.length > 0 && (
                      <span className="absolute -top-1 -right-2 px-1 py-0.2 min-w-[14px] text-[9px] font-bold bg-emerald-600 text-white rounded-full text-center">
                        {applications.length}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'আবেদন' : 'Applied'}</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex flex-col items-center justify-center min-h-[48px] py-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <Menu className="w-5 h-5" />
                  <span className="text-[10px] tracking-tight mt-1 font-medium">{isBangla ? 'মেনু' : 'Menu'}</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Persistent AI Career Chatbot */}
      <CareerChatbot />

      {/* Multi-step Application Modal */}
      {applyModalJob && (
        <ApplicationModal
          job={applyModalJob}
          isOpen={!!applyModalJob}
          onClose={() => setApplyModalJob(null)}
          onSuccess={() => {
            handleNavigate('applications');
          }}
        />
      )}

      {/* Post-Interview Feedback Modal (Recruiter) */}
      {feedbackModalOpen && feedbackCandidate && (
        <PostInterviewFeedbackModal
          application={feedbackCandidate}
          interview={feedbackInterview || undefined}
          onClose={() => {
            setFeedbackModalOpen(false);
            setFeedbackCandidate(null);
            setFeedbackInterview(null);
          }}
          onFeedbackSaved={() => {
            setFeedbackModalOpen(false);
            setFeedbackCandidate(null);
            setFeedbackInterview(null);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JobProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </JobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
