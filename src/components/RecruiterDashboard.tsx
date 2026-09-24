import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { analyzeCandidateWithGemini, generateJobDescriptionWithGemini } from '../services/aiService';
import { JobListing, Application, ScreeningQuestion, InterviewSchedule } from '../types';
import { RecruiterCalendarScheduler } from './RecruiterCalendarScheduler';
import { CandidateComparisonTable } from './CandidateComparisonTable';
import { PostInterviewFeedbackModal } from './PostInterviewFeedbackModal';
import { BatchResumeScreening } from './BatchResumeScreening';
import { TechnicalAssessmentQuiz } from './TechnicalAssessmentQuiz';
import { CollaborativeHiringScorecard } from './CollaborativeHiringScorecard';
import { OfferLetterBuilder } from './OfferLetterBuilder';
import { 
  Users, 
  Briefcase, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  ShieldAlert,
  ArrowUpRight,
  UserCheck,
  TrendingUp,
  FileSpreadsheet,
  Award,
  ArrowUpDown,
  Star,
  Code,
  FileText,
  UploadCloud
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecruiterDashboardProps {
  onNavigateToPostJob: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ onNavigateToPostJob }) => {
  const { 
    jobs, 
    applications, 
    interviews,
    updateApplicationStatus, 
    updateApplicationAiAnalysis, 
    scheduleInterview,
    updateInterview,
    cancelInterview,
    submitInterviewFeedback
  } = useJobs();
  const { user, currentCompany } = useAuth();
  const { isBangla, t } = useLanguage();

  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<
    | 'applicants'
    | 'batch_screening'
    | 'technical_assessment'
    | 'collaborative_scorecards'
    | 'offer_builder'
    | 'interview_calendar'
    | 'jobs_management'
    | 'candidate_comparison'
  >('applicants');
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
  const [analyzingAppId, setAnalyzingAppId] = useState<string | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [offerCandidate, setOfferCandidate] = useState<Application | null>(null);
  const [scorecardCandidateId, setScorecardCandidateId] = useState<string | undefined>(undefined);
  const [quizJobId, setQuizJobId] = useState<string | undefined>(undefined);
  const [interviewDate, setInterviewDate] = useState('2026-10-05');
  const [interviewTime, setInterviewTime] = useState('11:00');
  const [interviewType, setInterviewType] = useState<'Online' | 'Phone' | 'In-person'>('Online');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/kormo-interview');

  // Post-interview feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCandidate, setFeedbackCandidate] = useState<Application | null>(null);
  const [feedbackInterview, setFeedbackInterview] = useState<InterviewSchedule | null>(null);

  // Candidate comparison multi-select - seeded with top 2 initial candidates
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(['app_sample_1', 'app_sample_3']);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'ai_rank' | 'interview_rating' | 'date_newest' | 'date_oldest'>('ai_rank');

  // Filtered and sorted applications (candidate ranking updates dynamically with interview feedback)
  const filteredApps = applications
    .filter(app => {
      if (selectedJobId !== 'all' && app.jobId !== selectedJobId) return false;
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = app.candidateName.toLowerCase().includes(query);
        const matchesRole = app.jobTitle.toLowerCase().includes(query);
        const matchesHeadline = (app.candidateHeadline || '').toLowerCase().includes(query);
        const matchesSnippet = (app.resumeTextSnippet || '').toLowerCase().includes(query);
        if (!matchesName && !matchesRole && !matchesHeadline && !matchesSnippet) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'ai_rank') {
        // Uses composite weighted score (65% interview + 35% AI match) if feedback recorded
        const scoreA = a.feedbackWeightedScore ?? a.aiAnalysis?.matchScore ?? -1;
        const scoreB = b.feedbackWeightedScore ?? b.aiAnalysis?.matchScore ?? -1;
        return scoreB - scoreA;
      }
      if (sortBy === 'interview_rating') {
        const ratingA = a.interviewFeedback?.averageRating ?? -1;
        const ratingB = b.interviewFeedback?.averageRating ?? -1;
        return ratingB - ratingA;
      }
      if (sortBy === 'date_oldest') {
        return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
      }
      return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
    });

  const totalApplicants = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const interviewCount = applications.filter(a => a.status === 'interview').length;

  // Run AI Candidate Ranking & Analysis
  const handleAiAnalyze = async (app: Application) => {
    const job = jobs.find(j => j.id === app.jobId);
    if (!job) return;

    setAnalyzingAppId(app.id);
    try {
      const analysis = await analyzeCandidateWithGemini({
        jobTitle: job.title,
        jobRequirements: job.requirements,
        jobSkills: job.skills,
        candidateProfile: {
          fullName: app.candidateName,
          headline: app.candidateHeadline,
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'GraphQL', 'Next.js'],
          experience: [{ role: 'Software Engineer', years: 4 }],
          education: [{ degree: 'B.Sc. in CSE' }]
        },
        screeningAnswers: app.answers
      });

      await updateApplicationAiAnalysis(app.id, {
        ...analysis,
        analyzedAt: new Date().toISOString()
      });

      confetti({ particleCount: 40, spread: 60 });
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingAppId(null);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    await scheduleInterview({
      applicationId: selectedCandidate.id,
      jobId: selectedCandidate.jobId,
      jobTitle: selectedCandidate.jobTitle,
      candidateId: selectedCandidate.candidateId,
      candidateName: selectedCandidate.candidateName,
      candidateEmail: selectedCandidate.candidateEmail,
      recruiterId: user?.uid || 'recruiter_demo',
      companyName: currentCompany?.name || 'Company',
      date: interviewDate,
      time: interviewTime,
      type: interviewType,
      meetingLinkOrLocation: meetingLink,
      notes: 'Technical Interview'
    });

    setShowInterviewModal(false);
    confetti({ particleCount: 50, spread: 50 });
  };

  const toggleComparisonSelection = (appId: string) => {
    if (selectedForComparison.includes(appId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== appId));
    } else {
      if (selectedForComparison.length >= 4) {
        alert('You can compare up to 4 candidates simultaneously.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, appId]);
    }
  };

  const clearComparisonSelection = () => {
    setSelectedForComparison([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={currentCompany?.logo || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80'}
            alt="Company"
            className="w-14 h-14 rounded-xl object-cover border border-neutral-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-neutral-900">{currentCompany?.name || (isBangla ? 'নিয়োগকারী পোর্টাল' : 'Recruiter Portal')}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                {isBangla ? 'যাচাইকৃত নিয়োগকারী' : 'Verified Recruiter'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isBangla 
                ? `নিয়োগ ওয়ার্কস্পেস • ${jobs.length} সক্রিয় সার্কুলার • বাংলাদেশ হাব` 
                : `Hiring workspace • ${jobs.length} Active Listings • Bangladesh Hub`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={() => setActiveTab('batch_screening')}
            className={`w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'batch_screening' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBangla ? 'বাল্ক রেজুমে আপলোড ও স্ক্রিন' : 'Batch Upload & Screen'}</span>
          </button>
          <button
            onClick={() => setActiveTab('candidate_comparison')}
            className={`w-full sm:w-auto px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'candidate_comparison' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> 
            {isBangla ? `প্রার্থী তুলনা (${selectedForComparison.length})` : `Compare Candidates (${selectedForComparison.length})`}
          </button>
          <button
            onClick={onNavigateToPostJob}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {isBangla ? 'নতুন চাকরি তৈরি করুন' : 'Post a New Job'}
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">{isBangla ? 'সক্রিয় চাকরি' : 'Active Jobs'}</span>
            <Briefcase className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{jobs.length}</p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {isBangla ? 'আবেদন গ্রহণ চলছে' : 'Accepting candidates'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">{isBangla ? 'মোট আবেদনকারী' : 'Total Applicants'}</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{totalApplicants}</p>
          <span className="text-[11px] text-neutral-400">
            {isBangla ? 'সকল পদ মিলিয়ে' : 'Across all postings'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">{isBangla ? 'শর্টলিস্টেড' : 'Shortlisted'}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{shortlistedCount}</p>
          <span className="text-[11px] text-neutral-400">
            {isBangla ? 'পরবর্তী রাউন্ডে যোগ্য' : 'Qualified for next phase'}
          </span>
        </div>

        <button
          onClick={() => setActiveTab('interview_calendar')}
          className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs text-left hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium group-hover:text-blue-600 transition-colors">
              {isBangla ? 'নির্ধারিত ইন্টারভিউ' : 'Scheduled Interviews'}
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{interviews.filter(i => i.status !== 'cancelled').length}</p>
          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
            {isBangla ? 'ড্র্যাগ ও ড্রপ ক্যালেন্ডার খুলুন →' : 'Open Drag & Drop Calendar →'}
          </span>
        </button>
      </div>

      {/* Main Recruiter Work Area */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Header Tabs & Job Filter */}
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('applicants')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'applicants' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {isBangla ? `প্রার্থী পাইপলাইন (${filteredApps.length})` : `Applicant Pipeline (${filteredApps.length})`}
            </button>
            <button
              onClick={() => setActiveTab('batch_screening')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'batch_screening' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isBangla ? 'বাল্ক স্ক্রীনিং ও র‍্যাংকিং' : 'Batch Screening & Ranking'}
            </button>
            <button
              onClick={() => setActiveTab('technical_assessment')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'technical_assessment' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              {isBangla ? 'টেকনিক্যাল কুইজ' : 'Technical Quizzes'}
            </button>
            <button
              onClick={() => setActiveTab('collaborative_scorecards')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'collaborative_scorecards' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {isBangla ? 'টিম স্কোরকার্ড ও ডিব্রিফ' : 'Team Scorecards & Debriefs'}
            </button>
            <button
              onClick={() => setActiveTab('offer_builder')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'offer_builder' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {isBangla ? 'অফার লেটার ও চুক্তি' : 'Offer Letters & Signatures'}
            </button>
            <button
              onClick={() => setActiveTab('interview_calendar')}
              className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                activeTab === 'interview_calendar' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {isBangla 
                ? `ক্যালেন্ডার (${interviews.filter(i => i.status !== 'cancelled').length})` 
                : `Calendar (${interviews.filter(i => i.status !== 'cancelled').length})`}
            </button>
            <button
              onClick={() => setActiveTab('candidate_comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'candidate_comparison' ? 'bg-white text-emerald-800 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              {isBangla ? 'তুলনা' : 'Compare'}
              {selectedForComparison.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                  {selectedForComparison.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('jobs_management')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                activeTab === 'jobs_management' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {isBangla ? `চাকরি (${jobs.length})` : `Jobs (${jobs.length})`}
            </button>
          </div>

          {/* Job Filter dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">{isBangla ? 'পদ নির্বাচন:' : 'Filter role:'}</span>
            <select
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              className="text-xs border border-neutral-300 rounded-lg p-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{isBangla ? `সকল চাকরি (${applications.length})` : `All Jobs (${applications.length})`}</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TAB 1: APPLICANTS PIPELINE */}
        {activeTab === 'applicants' && (
          <div>
            {/* Filter & Sorting Sub-Bar */}
            <div className="p-3.5 bg-neutral-50/80 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative w-full max-w-xs">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isBangla ? 'প্রার্থীর নাম, দক্ষতা বা পদ দিয়ে খুঁজুন...' : 'Search candidate name, skills, title...'}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[11px] text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {isBangla ? 'মুছুন' : 'Clear'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 text-[11px]">{isBangla ? 'স্ট্যাটাস:' : 'Status:'}</span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="text-xs bg-white border border-neutral-200 rounded-lg px-2 py-1.5 font-medium text-neutral-700 focus:outline-none"
                  >
                    <option value="all">{isBangla ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
                    <option value="applied">{isBangla ? 'আবেদনকৃত' : 'Applied'}</option>
                    <option value="under_review">{isBangla ? 'রিভিউ চলছে' : 'Under Review'}</option>
                    <option value="shortlisted">{isBangla ? 'শর্টলিস্টেড' : 'Shortlisted'}</option>
                    <option value="interview">{isBangla ? 'ইন্টারভিউ' : 'Interview'}</option>
                    <option value="selected">{isBangla ? 'নিযুক্ত / অফারকৃত' : 'Hired / Offered'}</option>
                    <option value="rejected">{isBangla ? 'প্রত্যাখ্যাত' : 'Rejected'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-neutral-500 text-[11px]">{isBangla ? 'সাজান:' : 'Sort By:'}</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'ai_rank' | 'interview_rating' | 'date_newest' | 'date_oldest')}
                    className="text-xs bg-white border border-emerald-300 rounded-lg px-2 py-1.5 font-semibold text-emerald-800 focus:outline-none ring-1 ring-emerald-500/30 cursor-pointer"
                  >
                    <option value="ai_rank">{isBangla ? '✨ সামগ্রিক র‍্যাঙ্ক (সর্বোত্তম ম্যাচ ও ফিডব্যাক)' : '✨ Overall Rank (Best Match & Feedback)'}</option>
                    <option value="interview_rating">{isBangla ? '★ ইন্টারভিউ রেটিং (সর্বোচ্চ আগে)' : '★ Interview Rating (Highest First)'}</option>
                    <option value="date_newest">{isBangla ? 'নতুন আবেদন আগে' : 'Newest Application'}</option>
                    <option value="date_oldest">{isBangla ? 'পুরনো আবেদন আগে' : 'Oldest Application'}</option>
                  </select>
                </div>

                {selectedForComparison.length > 0 && (
                  <button
                    onClick={() => setActiveTab('candidate_comparison')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Compare Selected ({selectedForComparison.length}) →
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-neutral-200">
            {filteredApps.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 text-xs">
                {isBangla ? 'আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো আবেদন পাওয়া যায়নি।' : 'No applications matching your search or filters.'}
              </div>
            ) : (
              filteredApps.map((app, index) => {
                const isSelectedForComp = selectedForComparison.includes(app.id);
                const targetJob = jobs.find(j => j.id === app.jobId);
                const isTopRanked = sortBy === 'ai_rank' && app.aiAnalysis && app.aiAnalysis.matchScore >= 80 && index === 0;

                return (
                  <div key={app.id} className="p-5 hover:bg-neutral-50/70 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Candidate info */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelectedForComp}
                          onChange={() => toggleComparisonSelection(app.id)}
                          className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title={isBangla ? 'পাশাপাশি তুলনা করতে নির্বাচন করুন' : 'Select to compare candidates side-by-side'}
                        />
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {app.candidateName.charAt(0)}
                          </div>
                          {sortBy === 'ai_rank' && app.aiAnalysis && (
                            <span className="absolute -top-1.5 -left-1.5 bg-neutral-900 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-neutral-700">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-neutral-900">{app.candidateName}</h3>
                            {isTopRanked && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-600" /> {isBangla ? 'শীর্ষ এআই প্রার্থী' : 'Top AI Candidate'}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              app.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-800' :
                              app.status === 'interview' ? 'bg-blue-100 text-blue-800' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 mt-0.5">{app.candidateHeadline}</p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-1">
                            <span className="text-neutral-700 font-medium">{app.jobTitle}</span>
                            <span>•</span>
                            <span>{app.candidateLocation}</span>
                            <span>•</span>
                            <span>{app.candidateEmail}</span>
                            <span>•</span>
                            <span>{isBangla ? 'আবেদনের তারিখ' : 'Applied'} {new Date(app.appliedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Signal Score / Action */}
                      <div className="flex flex-wrap items-center gap-3 self-end lg:self-center">
                        {app.feedbackWeightedScore ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold shadow-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{app.feedbackWeightedScore}% {isBangla ? 'র‍্যাঙ্ক' : 'Rank'}</span>
                            <span className="text-[10px] text-emerald-800 font-semibold ml-0.5">
                              (★{app.interviewFeedback?.averageRating})
                            </span>
                          </div>
                        ) : app.aiAnalysis ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{app.aiAnalysis.matchScore}% {isBangla ? 'এআই র‍্যাঙ্ক' : 'AI Rank'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAiAnalyze(app)}
                            disabled={analyzingAppId === app.id}
                            className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {analyzingAppId === app.id ? (
                              <>
                                <span className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                                {isBangla ? 'র‍্যাঙ্কিং হচ্ছে...' : 'Ranking...'}
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                {isBangla ? 'এআই স্কোর র‍্যাঙ্কিং' : 'AI Rank Candidate'}
                              </>
                            )}
                          </button>
                        )}

                        {/* Status dropdown */}
                        <select
                          value={app.status}
                          onChange={e => updateApplicationStatus(app.id, e.target.value as Application['status'])}
                          className="text-xs border border-neutral-300 rounded-lg p-1.5 bg-white font-medium text-neutral-700 focus:outline-none"
                        >
                          <option value="applied">{isBangla ? 'আবেদনকৃত' : 'Applied'}</option>
                          <option value="under_review">{isBangla ? 'রিভিউ চলছে' : 'Under Review'}</option>
                          <option value="shortlisted">{isBangla ? 'শর্টলিস্ট' : 'Shortlist'}</option>
                          <option value="interview">{isBangla ? 'ইন্টারভিউ' : 'Interview'}</option>
                          <option value="selected">{isBangla ? 'নিয়োগ / অফার' : 'Hire / Offer'}</option>
                          <option value="rejected">{isBangla ? 'প্রত্যাখ্যান' : 'Reject'}</option>
                        </select>

                        {/* Quick Action: Assign Technical Quiz */}
                        <button
                          type="button"
                          onClick={() => {
                            setQuizJobId(app.jobId);
                            setActiveTab('technical_assessment');
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1"
                          title={isBangla ? 'টেকনিক্যাল স্ক্রীনিং কুইজ তৈরি বা বরাদ্দ করুন' : 'Generate or Assign Technical Screening Quiz'}
                        >
                          <Code className="w-3 h-3 text-indigo-600" />
                          {isBangla ? 'কুইজ' : 'Quiz'}
                        </button>

                        {/* Quick Action: Team Scorecard */}
                        <button
                          type="button"
                          onClick={() => {
                            setScorecardCandidateId(app.id);
                            setActiveTab('collaborative_scorecards');
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                          title={isBangla ? 'টিম স্কোরকার্ড ও যৌথ ডিব্রিফ' : 'Multi-interviewer scorecards and committee debrief'}
                        >
                          <Users className="w-3 h-3 text-amber-600" />
                          {isBangla ? 'স্কোরকার্ড' : 'Scorecard'}
                        </button>

                        {/* Quick Action: Build Offer Letter */}
                        <button
                          type="button"
                          onClick={() => {
                            setOfferCandidate(app);
                            setActiveTab('offer_builder');
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                          title={isBangla ? 'ডিজিটাল অফার লেটার তৈরি করুন' : 'Prepare and digitally sign offer letter'}
                        >
                          <FileText className="w-3 h-3 text-emerald-600" />
                          {isBangla ? 'অফার' : 'Offer'}
                        </button>

                        {/* Post-Interview Feedback & Ratings Button */}
                        <button
                          onClick={() => {
                            setFeedbackCandidate(app);
                            const matchedInt = interviews.find(i => i.applicationId === app.id && i.status !== 'cancelled') || interviews.find(i => i.applicationId === app.id);
                            setFeedbackInterview(matchedInt || null);
                            setFeedbackModalOpen(true);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                            app.interviewFeedback
                              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs'
                          }`}
                          title={isBangla ? 'ইন্টারভিউ পরবর্তী রেটিং ও নোট যোগ করুন' : 'Record or update post-interview ratings and qualitative notes'}
                        >
                          <Star className={`w-3.5 h-3.5 ${app.interviewFeedback ? 'fill-amber-500 text-amber-500' : 'text-white'}`} />
                          {app.interviewFeedback ? `${isBangla ? 'ফিডব্যাক' : 'Feedback'} (★${app.interviewFeedback.averageRating})` : (isBangla ? 'ফিডব্যাক' : 'Feedback')}
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('interview_calendar');
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                          title={isBangla ? 'শিডিউল করতে ক্যালেন্ডার খুলুন' : 'Open Calendar to schedule this candidate'}
                        >
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          {isBangla ? 'ক্যালেন্ডার' : 'Calendar'}
                        </button>

                        <button
                          onClick={() => {
                            toggleComparisonSelection(app.id);
                            setActiveTab('candidate_comparison');
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                            isSelectedForComp
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                          title={isBangla ? 'তুলনা ম্যাট্রিক্সে দেখুন' : 'View in Compare Candidates matrix'}
                        >
                          <Users className="w-3 h-3" />
                          {isSelectedForComp ? (isBangla ? 'তুলনাধীন' : 'Comparing') : (isBangla ? 'তুলনা' : 'Compare')}
                        </button>

                        <button
                          onClick={() => setSelectedCandidate(selectedCandidate?.id === app.id ? null : app)}
                          className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                        >
                          {selectedCandidate?.id === app.id ? (isBangla ? 'বিবরণ লুকান' : 'Hide Details') : (isBangla ? 'আবেদন দেখুন' : 'View Application')}
                        </button>
                      </div>
                    </div>

                    {/* Candidate Expansion Details & AI Evaluation */}
                    {selectedCandidate?.id === app.id && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 text-xs animate-in fade-in">
                        {/* Post-Interview Evaluation Card (if feedback submitted) */}
                        {app.interviewFeedback && (
                          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold flex items-center gap-1.5 text-amber-950 text-xs">
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                  Post-Interview Recruiter Evaluation ({app.interviewFeedback.averageRating} / 5.0 Stars)
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-200 text-amber-900 border border-amber-300">
                                  {app.interviewFeedback.recommendation.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setFeedbackCandidate(app);
                                  const matchedInt = interviews.find(i => i.applicationId === app.id && i.status !== 'cancelled') || interviews.find(i => i.applicationId === app.id);
                                  setFeedbackInterview(matchedInt || null);
                                  setFeedbackModalOpen(true);
                                }}
                                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-md border border-amber-300 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                Edit Feedback & Ratings
                              </button>
                            </div>

                            <div className="p-3 rounded-lg bg-white border border-neutral-200 space-y-1">
                              <span className="text-[11px] font-semibold text-neutral-500 block">Recruiter Qualitative Summary & Observations:</span>
                              <p className="text-xs text-neutral-800 leading-relaxed font-medium">
                                "{app.interviewFeedback.summaryNotes}"
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                                <span className="font-bold text-emerald-900 block mb-1">Key Strengths Noted:</span>
                                <p className="text-[11px] text-emerald-950">{app.interviewFeedback.keyStrengths}</p>
                              </div>

                              <div className="p-2.5 rounded-lg bg-amber-100/50 border border-amber-200">
                                <span className="font-bold text-amber-900 block mb-1">Areas for Growth / Considerations:</span>
                                <p className="text-[11px] text-amber-950">{app.interviewFeedback.areasForImprovement}</p>
                              </div>
                            </div>

                            {/* 5 Dimensions breakdown */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-amber-200/60">
                              <div className="text-center p-2 rounded-lg bg-white border border-neutral-200">
                                <span className="text-[10px] text-neutral-500 block">Technical</span>
                                <span className="text-xs font-bold text-neutral-900">★ {app.interviewFeedback.ratings.technicalProficiency} / 5</span>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-white border border-neutral-200">
                                <span className="text-[10px] text-neutral-500 block">Problem Solving</span>
                                <span className="text-xs font-bold text-neutral-900">★ {app.interviewFeedback.ratings.problemSolving} / 5</span>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-white border border-neutral-200">
                                <span className="text-[10px] text-neutral-500 block">Communication</span>
                                <span className="text-xs font-bold text-neutral-900">★ {app.interviewFeedback.ratings.communicationSkills} / 5</span>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-white border border-neutral-200">
                                <span className="text-[10px] text-neutral-500 block">Cultural Fit</span>
                                <span className="text-xs font-bold text-neutral-900">★ {app.interviewFeedback.ratings.culturalFit} / 5</span>
                              </div>
                              <div className="text-center p-2 rounded-lg bg-white border border-neutral-200">
                                <span className="text-[10px] text-neutral-500 block">Leadership</span>
                                <span className="text-xs font-bold text-neutral-900">★ {app.interviewFeedback.ratings.leadershipPotential} / 5</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {app.aiAnalysis && (
                          <div className="p-4 rounded-xl bg-neutral-900 text-white space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5 text-emerald-400 text-xs">
                                <Sparkles className="w-4 h-4" /> AI Candidate Evaluation ({app.aiAnalysis.matchScore}% Match Score)
                              </span>
                              <span className="text-[10px] text-neutral-400">
                                Evaluated on {new Date(app.aiAnalysis.analyzedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs text-neutral-200 leading-relaxed">
                              {app.aiAnalysis.summary}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                              <div className="p-2.5 rounded-lg bg-neutral-800/80">
                                <span className="font-semibold text-emerald-400 block mb-1">
                                  Matching Key Skills:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {app.aiAnalysis.matchingSkills.map(s => (
                                    <span key={s} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-200 rounded text-[10px]">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-neutral-800/80">
                                <span className="font-semibold text-amber-400 block mb-1">
                                  Missing Skills / Training Needed:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {app.aiAnalysis.missingSkills.length > 0 ? (
                                    app.aiAnalysis.missingSkills.map(s => (
                                      <span key={s} className="px-1.5 py-0.5 bg-neutral-700 text-neutral-300 rounded text-[10px]">
                                        {s}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-neutral-400">None detected</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {app.aiAnalysis.strengths && app.aiAnalysis.strengths.length > 0 && (
                              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50">
                                <span className="font-semibold text-emerald-300 block mb-1">Demonstrated Strengths:</span>
                                <ul className="list-disc list-inside text-neutral-300 space-y-0.5 text-[11px]">
                                  {app.aiAnalysis.strengths.map((str, i) => (
                                    <li key={i}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="text-[10px] text-neutral-400 italic pt-1">
                              * {app.aiAnalysis.disclaimer}
                            </div>
                          </div>
                        )}

                        {/* Resume & Profile Snippet */}
                        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-neutral-900 text-xs">Resume & Candidate Profile Details:</h4>
                            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {app.resumeFileName || 'Resume Attached'}
                            </span>
                          </div>
                          {app.resumeTextSnippet && (
                            <p className="text-neutral-700 text-xs leading-relaxed bg-white p-3 rounded-lg border border-neutral-200 font-mono text-[11px]">
                              {app.resumeTextSnippet}
                            </p>
                          )}
                          {app.coverLetter && (
                            <div className="pt-2">
                              <span className="text-[11px] font-semibold text-neutral-600 block">Candidate Cover Note:</span>
                              <p className="text-neutral-800 text-xs italic bg-white p-2.5 rounded-lg border border-neutral-200 mt-1">
                                "{app.coverLetter}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Screening Questions Answers */}
                        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                          <h4 className="font-bold text-neutral-900 text-xs">Recruiter Questions & Candidate Answers:</h4>
                          {Object.keys(app.answers).length === 0 ? (
                            <p className="text-neutral-400 text-xs">No questions required for this position.</p>
                          ) : (
                            Object.entries(app.answers).map(([qId, ans]) => {
                              const qObj = targetJob?.questions.find(q => q.id === qId);
                              const questionText = qObj ? qObj.question : `Question (${qId})`;
                              return (
                                <div key={qId} className="border-b border-neutral-200/60 pb-2 last:border-b-0">
                                  <span className="font-semibold text-neutral-800 block text-xs">
                                    Q: {questionText}
                                  </span>
                                  <p className="text-neutral-900 text-xs mt-1 bg-white p-2 rounded border border-neutral-200">
                                    A: {ans || 'No response provided'}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            </div>
          </div>
        )}

        {/* TAB 2: INTERVIEW CALENDAR (DRAG & DROP SCHEDULER) */}
        {activeTab === 'interview_calendar' && (
          <div className="p-6">
            <RecruiterCalendarScheduler
              applications={applications}
              interviews={interviews}
              jobs={jobs}
              recruiterId={user?.uid || 'recruiter_demo'}
              companyName={currentCompany?.name || 'Company'}
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
        )}

        {/* TAB 3: JOBS MANAGEMENT */}
        {activeTab === 'jobs_management' && (
          <div className="p-6 divide-y divide-neutral-200">
            {jobs.map(job => (
              <div key={job.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{job.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      ৳ {job.salaryMinBdt.toLocaleString()} - {job.salaryMaxBdt.toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>{job.applicantsCount || 0} applicants</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    job.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: CANDIDATE COMPARISON MATRIX */}
        {activeTab === 'candidate_comparison' && (
          <div className="p-6">
            <CandidateComparisonTable
              applications={applications}
              jobs={jobs}
              selectedIds={selectedForComparison}
              onToggleSelect={toggleComparisonSelection}
              onClearAll={clearComparisonSelection}
              onScheduleInterview={(app) => {
                setSelectedCandidate(app);
                setShowInterviewModal(true);
              }}
              onUpdateStatus={updateApplicationStatus}
              onOpenFeedback={(app) => {
                const matchedInt = interviews.find(i => i.applicationId === app.id && i.status !== 'cancelled') || interviews.find(i => i.applicationId === app.id);
                setFeedbackCandidate(app);
                setFeedbackInterview(matchedInt || null);
                setFeedbackModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 5: BATCH RESUME SCREENING & RANKING */}
        {activeTab === 'batch_screening' && (
          <div className="p-6">
            <BatchResumeScreening
              onScheduleCandidate={(cand) => {
                const matched = applications.find(a => a.candidateEmail === cand.email) || applications[0];
                if (matched) {
                  setSelectedCandidate(matched);
                  setShowInterviewModal(true);
                }
              }}
              onSendQuiz={(cand) => {
                setActiveTab('technical_assessment');
              }}
            />
          </div>
        )}

        {/* TAB 6: TECHNICAL ASSESSMENT QUIZZES */}
        {activeTab === 'technical_assessment' && (
          <div className="p-6">
            <TechnicalAssessmentQuiz
              initialJobId={quizJobId || (selectedJobId !== 'all' ? selectedJobId : undefined)}
              onAssignToCandidate={(quiz, candId) => {
                const cand = applications.find(a => a.id === candId);
                if (cand) {
                  updateApplicationStatus(cand.id, 'under_review');
                }
              }}
            />
          </div>
        )}

        {/* TAB 7: COLLABORATIVE HIRING SCORECARDS & DEBRIEFS */}
        {activeTab === 'collaborative_scorecards' && (
          <div className="p-6">
            <CollaborativeHiringScorecard
              initialCandidateId={scorecardCandidateId || applications[0]?.id}
              onProceedToOffer={(cand) => {
                setOfferCandidate(cand);
                setActiveTab('offer_builder');
              }}
            />
          </div>
        )}

        {/* TAB 8: OFFER LETTER BUILDER & DIGITAL SIGNATURE */}
        {activeTab === 'offer_builder' && (
          <div className="p-6">
            <OfferLetterBuilder
              initialCandidate={offerCandidate || applications[0]}
            />
          </div>
        )}
      </div>

      {/* Post-Interview Feedback Modal */}
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

      {/* Interview Scheduling Modal */}
      {showInterviewModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-neutral-900">
              Schedule Interview with {selectedCandidate.candidateName}
            </h3>
            <p className="text-xs text-neutral-500">
              Candidate will receive a calendar invite and notification on their dashboard.
            </p>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-neutral-700 block mb-1">Interview Date</label>
                <input
                  type="date"
                  required
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-medium text-neutral-700 block mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={interviewTime}
                  onChange={e => setInterviewTime(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-medium text-neutral-700 block mb-1">Type</label>
                <select
                  value={interviewType}
                  onChange={e => setInterviewType(e.target.value as 'Online' | 'Phone' | 'In-person')}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="Online">Online Video (Google Meet / Zoom)</option>
                  <option value="Phone">Phone Call</option>
                  <option value="In-person">In-person at Office</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-neutral-700 block mb-1">Meeting Link or Office Address</label>
                <input
                  type="text"
                  required
                  value={meetingLink}
                  onChange={e => setMeetingLink(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm & Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
