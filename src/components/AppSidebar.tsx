import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from './ThemeToggle';
import { 
  Briefcase, 
  Sparkles, 
  Users, 
  Building2, 
  Calendar, 
  FileText, 
  Bookmark, 
  CheckCircle2, 
  TrendingUp, 
  LogOut, 
  Layers, 
  PlusCircle, 
  Target, 
  BarChart3, 
  ShieldCheck, 
  User, 
  ArrowLeftRight,
  Bell,
  Mic,
  FileCheck2,
  FileSpreadsheet,
  PenTool,
  HelpCircle,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface AppSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { user, userProfile, logout, demoLoginAs } = useAuth();
  const { applications, savedJobIds, interviews, jobs } = useJobs();
  const { isBangla, language, setLanguage } = useLanguage();

  const role = userProfile?.role || 'jobseeker';

  const handleNav = (view: string) => {
    onNavigate(view);
    if (onCloseMobile) onCloseMobile();
  };

  // Computed metrics for sidebar badges
  const myApplicationsCount = applications.filter(a => a.candidateEmail === user?.email || a.candidateId === user?.uid).length || applications.length;
  const myInterviewsCount = interviews.filter(i => i.status !== 'cancelled').length;
  const savedCount = savedJobIds.length;
  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const candidateCount = applications.length;

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* 1. Brand & Role Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-850 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-neutral-950 flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
              K
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                Kormo <span className="text-emerald-400">BD</span>
              </span>
              <span className="text-[10px] block text-neutral-400 uppercase tracking-wider font-semibold -mt-0.5">
                {isBangla ? 'ট্যালেন্ট প্ল্যাটফর্ম' : 'Talent Platform'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Role Status Tag */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
              role === 'recruiter' 
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : role === 'admin'
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {role === 'recruiter' 
                ? (isBangla ? 'নিয়োগকারী' : 'Recruiter') 
                : role === 'admin' 
                ? (isBangla ? 'অ্যাডমিন' : 'Admin') 
                : (isBangla ? 'প্রার্থী' : 'Job Seeker')}
            </span>

            {/* Mobile Close Icon Button (min 44x44px touch area) */}
            {isMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="min-h-[44px] min-w-[44px] -mr-2 rounded-xl flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-850 active:bg-neutral-800 transition-colors cursor-pointer lg:hidden"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Role & Language Switcher Banner */}
        <div className="mt-3.5 pt-3 border-t border-neutral-850/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1 text-neutral-400 font-medium">
            <ArrowLeftRight className="w-3.5 h-3.5 text-neutral-400" /> {isBangla ? 'রোল বদল:' : 'Demo Switch:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { demoLoginAs('jobseeker'); if (onCloseMobile) onCloseMobile(); }}
              className={`px-2.5 py-1.5 min-h-[36px] rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center ${
                role === 'jobseeker'
                  ? 'bg-emerald-500 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
              title="Switch workspace view to Job Seeker"
            >
              {isBangla ? 'প্রার্থী' : 'Seeker'}
            </button>
            <button
              onClick={() => { demoLoginAs('recruiter'); if (onCloseMobile) onCloseMobile(); }}
              className={`px-2.5 py-1.5 min-h-[36px] rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center ${
                role === 'recruiter'
                  ? 'bg-blue-500 text-white font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
              title="Switch workspace view to Recruiter"
            >
              {isBangla ? 'নিয়োগকারী' : 'Recruiter'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Navigation Menu (Role-Specific) */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
        {role === 'recruiter' ? (
          /* ================= RECRUITER NAVIGATION ================= */
          <>
            <div>
              <span className="px-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isBangla ? 'নিয়োগ পাইপলাইন' : 'Recruitment Pipeline'}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('recruiter_dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'recruiter_dashboard'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span>{isBangla ? 'প্রার্থী পাইপলাইন' : 'Candidate Pipeline'}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentView === 'recruiter_dashboard' ? 'bg-blue-700 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {candidateCount}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('resume_screening')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'resume_screening'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'বাল্ক সিভি স্ক্রীনিং' : 'Batch Resume Screening'}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    Bulk AI
                  </span>
                </button>

                <button
                  onClick={() => handleNav('screening_quiz')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'screening_quiz'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>{isBangla ? 'টেকনিক্যাল কুইজ জেনারেটর' : 'Screening Quizzes'}</span>
                  </div>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    Quiz AI
                  </span>
                </button>

                <button
                  onClick={() => handleNav('interview_calendar')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'interview_calendar'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'ইন্টারভিউ ক্যালেন্ডার' : 'Interview Calendar'}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    {isBangla ? 'ক্যালেন্ডার' : 'Drag&Drop'}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('candidate_comparison')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'candidate_comparison'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>{isBangla ? 'টিম স্কোরকার্ড ও নোটস' : 'Candidate Matrix & Scorecards'}</span>
                  </div>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    {isBangla ? 'টিম' : 'Team'}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('offer_letter_builder')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'offer_letter_builder'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PenTool className="w-4 h-4 text-purple-400" />
                    <span>{isBangla ? 'অফার লেটার বিল্ডার' : 'Offer Letter & Sign'}</span>
                  </div>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                    BDT ৳
                  </span>
                </button>
              </div>
            </div>

            <div>
              <span className="px-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isBangla ? 'চাকরি ব্যবস্থাপনা' : 'Job Management'}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('post_job')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'post_job'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-emerald-400 hover:bg-neutral-850 hover:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'নতুন চাকরি পোস্ট করুন' : 'Post New Job'}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    AI Wizard
                  </span>
                </button>

                <button
                  onClick={() => handleNav('jobs_management')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'jobs_management'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span>{isBangla ? 'আমার পোস্ট করা চাকরি' : 'Active Job Postings'}</span>
                  </div>
                  <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-bold">
                    {activeJobsCount}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <span className="px-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isBangla ? 'সাধারণ এক্সপ্লোরেশন' : 'Explore & Market'}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('jobs')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'jobs'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>{isBangla ? 'সব চাকরির তালিকা' : 'Browse All Jobs'}</span>
                </button>

                <button
                  onClick={() => handleNav('market_intelligence')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'market_intelligence'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                  <span>{isBangla ? 'মার্কেট বেতন অ্যানালিটিক্স' : 'Salary Analytics'}</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ================= JOB SEEKER NAVIGATION ================= */
          <>
            <div>
              <span className="px-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isBangla ? 'ক্যারিয়ার হাব' : 'Career Hub'}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'dashboard'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{isBangla ? 'ড্যাশবোর্ড ও রিকমেন্ডেশন' : 'Overview & Match'}</span>
                </button>

                <button
                  onClick={() => handleNav('jobs')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'jobs'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'চাকরি খুঁজুন' : 'Explore Jobs'}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentView === 'jobs' ? 'bg-neutral-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {activeJobsCount}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('skills_gap')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'skills_gap'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'এআই স্কিলস গ্যাপ বিশ্লেষণ' : 'AI Skills Gap'}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    AI Match
                  </span>
                </button>

                <button
                  onClick={() => handleNav('mock_interview')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'mock_interview'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'এআই মক ইন্টারভিউ প্রস্তুতি' : 'AI Mock Interview'}</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    Voice AI
                  </span>
                </button>
              </div>
            </div>

            <div>
              <span className="px-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isBangla ? 'আমার অগ্রগতি' : 'My Activity'}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('applications')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'applications'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'আবেদন ট্র্যাকার' : 'Application Tracker'}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentView === 'applications' ? 'bg-neutral-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {myApplicationsCount}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('interviews')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'interviews'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'ইন্টারভিউ সময়সূচী' : 'Interviews'}</span>
                  </div>
                  {myInterviewsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
                      {myInterviewsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleNav('saved_jobs')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'saved_jobs'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-emerald-400" />
                    <span>{isBangla ? 'সংরক্ষিত চাকরি' : 'Saved Jobs'}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    currentView === 'saved_jobs' ? 'bg-neutral-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {savedCount}
                  </span>
                </button>

                <button
                  onClick={() => handleNav('profile_builder')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'profile_builder'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{isBangla ? 'সিভি ও প্রোফাইল বিল্ডার' : 'Resume & Profile Builder'}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="px-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                {isBangla ? 'মার্কেট ও ইনসাইট' : 'Explore Market'}
              </span>
              <div className="space-y-1">
                <button
                  onClick={() => handleNav('companies')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'companies'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>{isBangla ? 'প্রতিষ্ঠান ডিরেক্টরি' : 'Top Employers'}</span>
                </button>

                <button
                  onClick={() => handleNav('market_intelligence')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentView === 'market_intelligence'
                      ? 'bg-emerald-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                  <span>{isBangla ? 'বেতন মার্কেট ইনসাইট' : 'Salary Intelligence'}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Admin Navigation link if admin */}
        {role === 'admin' && (
          <div>
            <span className="px-2.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
              {isBangla ? 'সিস্টেম অ্যাডমিন' : 'System Admin'}
            </span>
            <button
              onClick={() => handleNav('admin')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-neutral-300 hover:bg-neutral-850 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>{isBangla ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. User Profile Card & Sign Out Footer */}
      <div className="p-3.5 border-t border-neutral-850 bg-neutral-950 space-y-2 shrink-0 pb-safe">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-neutral-400 font-medium">
            {isBangla ? 'থিম মুড:' : 'Theme Mode:'}
          </span>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-neutral-700">
              {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white truncate block">
                {user?.displayName || (isBangla ? 'সক্রিয় সদস্য' : 'Active Member')}
              </span>
              <span className="text-[10px] text-neutral-400 truncate block">
                {user?.email || 'authenticated'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { logout(); if (onCloseMobile) onCloseMobile(); }}
            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={isBangla ? 'লগআউট করুন' : 'Sign out of Kormo BD'}
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (lg and up) */}
      <aside className="hidden lg:flex w-64 lg:w-72 h-screen sticky top-0 flex-col bg-neutral-950 text-neutral-200 border-r border-neutral-800 shrink-0 z-30 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer (shown on mobile when isOpenMobile is true) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-over Drawer */}
          <aside className="relative w-80 max-w-[85vw] h-full bg-neutral-950 text-neutral-200 flex flex-col shadow-2xl border-r border-neutral-800 z-10 select-none animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
