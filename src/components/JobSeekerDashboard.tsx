import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { JobListing } from '../types';
import { JobCard } from './JobCard';
import { SkillsGapAnalysis } from './SkillsGapAnalysis';
import { 
  Sparkles, 
  FileText, 
  Bookmark, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  CheckCircle2,
  Briefcase,
  AlertCircle,
  Award,
  Layers,
  Zap,
  Target,
  Mic
} from 'lucide-react';

interface JobSeekerDashboardProps {
  onNavigate: (view: string) => void;
  onSelectJob: (job: JobListing) => void;
  onApplyJob: (job: JobListing) => void;
  initialTab?: 'overview' | 'skills_gap';
}

export const JobSeekerDashboard: React.FC<JobSeekerDashboardProps> = ({
  onNavigate,
  onSelectJob,
  onApplyJob,
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills_gap'>(initialTab);
  const { jobs, applications, savedJobIds, interviews } = useJobs();
  const { user, jobSeekerProfile } = useAuth();
  const { isBangla } = useLanguage();

  const myApplications = applications.filter(a => a.candidateId === user?.uid || a.candidateEmail === user?.email);
  const completionScore = jobSeekerProfile?.completionScore || 45;

  // Filter recommended jobs matching profile skills
  const profileSkills = (jobSeekerProfile?.skills || ['React', 'JavaScript', 'TypeScript']).map(s => s.toLowerCase().trim());
  const recommendedJobs = jobs
    .filter(job => job.skills.some(s => profileSkills.includes(s.toLowerCase().trim())))
    .slice(0, 4);

  // Quick skills gap calculation for the Overview banner
  const bookmarkedJobs = jobs.filter(j => savedJobIds.includes(j.id));
  const bookmarkedSkillsSet = new Set<string>();
  bookmarkedJobs.forEach(j => {
    j.skills.forEach(s => bookmarkedSkillsSet.add(s));
  });

  const allBookmarkedSkills = Array.from(bookmarkedSkillsSet);
  const missingInBookmarks = allBookmarkedSkills.filter(
    s => !profileSkills.includes(s.toLowerCase().trim())
  );

  const quickMatchRate = allBookmarkedSkills.length > 0
    ? Math.round(((allBookmarkedSkills.length - missingInBookmarks.length) / allBookmarkedSkills.length) * 100)
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {isBangla ? 'প্রার্থী পোর্টাল' : 'Candidate Portal'}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-xs text-neutral-400">
              {isBangla ? 'যাচাইকৃত প্রোফাইল' : 'Verified Profile'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
            {isBangla 
              ? `স্বাগতম, ${jobSeekerProfile?.fullName || 'প্রার্থী'}!`
              : `Welcome back, ${jobSeekerProfile?.fullName || 'Professional'}!`}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {jobSeekerProfile?.headline || (
              isBangla 
                ? 'আপনার জন্য প্রস্তাবিত চাকরি অন্বেষণ করুন, বুকমার্ক করা পদের সাথে দক্ষতা তুলনা করুন এবং আবেদন ট্র্যাক করুন।'
                : 'Explore curated job recommendations, compare skills against saved roles, and track applications.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          <button
            onClick={() => onNavigate('mock_interview')}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-white" />
            {isBangla ? 'এআই মক ইন্টারভিউ' : 'AI Mock Interview'}
          </button>
          <button
            onClick={() => setActiveTab('skills_gap')}
            className={`w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-all ${
              activeTab === 'skills_gap'
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {isBangla ? 'দক্ষতার ঘাটতি বিশ্লেষণ' : 'Skills Gap Analysis'}
            {missingInBookmarks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold border border-amber-300">
                {missingInBookmarks.length} {isBangla ? 'ঘাটতি' : 'gaps'}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('profile_builder')}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {isBangla ? 'এআই সিভি পার্সার' : 'AI Resume Parser'}
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {isBangla ? 'সংক্ষিপ্ত বিবরণ ও সুপারিশ' : 'Overview & Recommendations'}
          </button>

          <button
            onClick={() => setActiveTab('skills_gap')}
            className={`px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'skills_gap'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isBangla ? 'স্কিলস গ্যাপ বিশ্লেষণ' : 'Skills Gap Analysis'}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'skills_gap' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {quickMatchRate}% {isBangla ? 'ম্যাচ' : 'Match'}
            </span>
          </button>
        </div>

        <span className="hidden sm:inline text-xs text-neutral-400">
          {isBangla 
            ? `${bookmarkedJobs.length} টি সংরক্ষিত পদের সাথে তুলনা` 
            : `Comparing against ${bookmarkedJobs.length} bookmarked role${bookmarkedJobs.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Profile Completion */}
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-medium">{isBangla ? 'প্রোফাইল স্কোর' : 'Profile Score'}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-bold text-neutral-900">{completionScore}%</span>
                <span className="text-xs text-neutral-400">{isBangla ? 'সম্পূর্ণ' : 'complete'}</span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${completionScore}%` }} />
              </div>
            </div>

            {/* Applications */}
            <div 
              onClick={() => onNavigate('applications')}
              className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs cursor-pointer hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-medium">{isBangla ? 'আবেদনসমূহ' : 'Applications'}</span>
                <FileText className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{myApplications.length}</p>
              <span className="text-[11px] text-emerald-600 font-medium">
                {isBangla ? 'চলমান আবেদন' : 'Active submissions'}
              </span>
            </div>

            {/* Saved Jobs */}
            <div 
              onClick={() => onNavigate('saved_jobs')}
              className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs cursor-pointer hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-medium">{isBangla ? 'সংরক্ষিত চাকরি' : 'Saved Jobs'}</span>
                <Bookmark className="w-4 h-4 text-neutral-400" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 mt-2">{savedJobIds.length}</p>
              <span className="text-[11px] text-neutral-400">
                {isBangla ? 'বুকমার্ক করা সুযোগ' : 'Bookmarked opportunities'}
              </span>
            </div>

            {/* Upcoming Interviews */}
            <div 
              onClick={() => onNavigate('interviews')}
              className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs cursor-pointer hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-medium">{isBangla ? 'ইন্টারভিউ' : 'Interviews'}</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2">{interviews.length}</p>
              <span className="text-[11px] text-neutral-400">
                {isBangla ? 'নির্ধারিত ইন্টারভিউ' : 'Scheduled sessions'}
              </span>
            </div>
          </div>

          {/* Dedicated Skills Gap Highlight Callout Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-neutral-900 to-neutral-950 text-white p-6 rounded-2xl border border-neutral-800 shadow-xs relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" /> {isBangla ? 'স্কিলস গ্যাপ ইনটেলিজেন্স' : 'Skills Gap Intelligence'}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {bookmarkedJobs.length} {isBangla ? 'টি বুকমার্ক করা পদ' : `Bookmarked Target Role${bookmarkedJobs.length === 1 ? '' : 's'}`}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  {isBangla 
                    ? `আপনার সংরক্ষিত পদের সাথে ${quickMatchRate}% যোগ্যতার মিল রয়েছে`
                    : `You match ${quickMatchRate}% of qualifications for your saved jobs`}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {missingInBookmarks.length > 0 ? (
                    isBangla ? (
                      <>
                        আপনার সংরক্ষিত চাকরির নিয়োগকারীরা প্রায়শই{' '}
                        <span className="text-amber-300 font-semibold">
                          {missingInBookmarks.slice(0, 3).join(', ')}
                        </span>
                        {missingInBookmarks.length > 3 ? ` এবং আরও ${missingInBookmarks.length - 3} টি দক্ষতা` : ''} চান।
                        কাস্টমাইজড কোর্স এবং প্রজেক্টের পরামর্শ দেখুন।
                      </>
                    ) : (
                      <>
                        Your bookmarked employers frequently require{' '}
                        <span className="text-amber-300 font-semibold">
                          {missingInBookmarks.slice(0, 3).join(', ')}
                        </span>
                        {missingInBookmarks.length > 3 ? ` and ${missingInBookmarks.length - 3} other skills` : ''}.
                        Review tailored courses, proof-of-work project suggestions, and AI strategy tips.
                      </>
                    )
                  ) : (
                    isBangla
                      ? 'আপনার সংরক্ষিত সকল চাকরির প্রাথমিক যোগ্যতার সাথে আপনার সিভির পূর্ণ মিল রয়েছে!'
                      : 'Your resume fully covers all primary requirements for your currently bookmarked jobs! Keep up the great work.'
                  )}
                </p>

                {/* Quick Gap Chips */}
                {missingInBookmarks.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] text-neutral-400 mr-1 self-center">
                      {isBangla ? 'শীর্ষ ঘাটতি:' : 'Top missing:'}
                    </span>
                    {missingInBookmarks.slice(0, 4).map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-white/10 text-neutral-200 text-[11px] font-mono border border-white/15"
                      >
                        ✕ {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
                <div className="text-left md:text-right">
                  <span className="text-xs text-neutral-400 block">
                    {isBangla ? 'সামগ্রিক পদের ফিট' : 'Overall Target Fit'}
                  </span>
                  <span className="text-3xl font-black text-emerald-400">{quickMatchRate}%</span>
                </div>

                <button
                  onClick={() => setActiveTab('skills_gap')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {isBangla ? 'স্কিলস গ্যাপ বিশ্লেষণ দেখুন' : 'Launch Skills Gap Matrix'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Voice Mock Interview Simulator Banner */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Mic className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    {isBangla ? 'ভয়েস প্রিপ সিমুলেটর' : 'Voice Prep Simulator'}
                  </span>
                  <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {isBangla ? 'নতুন এআই ফিচার' : 'New AI Feature'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">
                  {isBangla 
                    ? 'আপনার লক্ষ্য পদের জন্য উপযোগী ইন্টারঅ্যাক্টিভ মক ইন্টারভিউ প্রস্তুতি' 
                    : 'Interactive Practice Interview Tailored Specifically to Your Target Role'}
                </h3>
                <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
                  {isBangla 
                    ? 'এআই আপনাকে টেকনিক্যাল ও আচরণগত প্রশ্ন করবে এবং তাৎক্ষণিকভাবে আপনার উত্তর মূল্যায়ন করে গঠনমূলক পরামর্শ প্রদান করবে।' 
                    : 'The AI asks technical and behavioral questions one by one, evaluates your spoken or typed answers in real-time, and gives constructive critiques on clarity, confidence, and keyword depth.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('mock_interview')}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shrink-0 self-start md:self-auto cursor-pointer transition-colors"
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>{isBangla ? 'ভয়েস সিমুলেটর শুরু করুন' : 'Launch Voice Simulator'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recommended Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {isBangla ? 'আপনার জন্য সুপারিশকৃত' : 'Recommended For You'}
                </h2>
                <p className="text-xs text-neutral-500">
                  {isBangla 
                    ? `আপনার সিভি দক্ষতার ভিত্তিতে মিল করা হয়েছে (${jobSeekerProfile?.skills.slice(0, 3).join(', ') || 'React, JavaScript'})`
                    : `Matched automatically against your resume skills (${jobSeekerProfile?.skills.slice(0, 3).join(', ') || 'React, JavaScript'})`}
                </p>
              </div>

              <button
                onClick={() => onNavigate('jobs')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                {isBangla ? 'সব দেখুন' : 'View All'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(recommendedJobs.length > 0 ? recommendedJobs : jobs.slice(0, 4)).map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSelect={onSelectJob}
                  onApplyDirectly={onApplyJob}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS GAP ANALYSIS FULL FEATURE */}
      {activeTab === 'skills_gap' && (
        <div className="animate-in fade-in">
          <SkillsGapAnalysis
            onSelectJob={onSelectJob}
            onApplyJob={onApplyJob}
            onNavigateToJobs={() => onNavigate('jobs')}
          />
        </div>
      )}
    </div>
  );
};
