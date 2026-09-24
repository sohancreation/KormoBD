import React, { useState, useEffect } from 'react';
import { JobListing, WorkplaceType } from '../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Banknote, 
  Bookmark, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Send,
  Users,
  Mic,
  Globe,
  Loader2
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translateJobPostingWithGemini, TranslatedJobData } from '../services/aiService';

interface JobDetailsViewProps {
  job: JobListing;
  onBack: () => void;
  onApply: (job: JobListing) => void;
  onStartMockInterview?: (job: JobListing) => void;
}

export const JobDetailsView: React.FC<JobDetailsViewProps> = ({ job, onBack, onApply, onStartMockInterview }) => {
  const { savedJobIds, toggleSaveJob } = useJobs();
  const { jobSeekerProfile } = useAuth();
  const { language, isBangla, t } = useLanguage();
  const isSaved = savedJobIds.includes(job.id);

  // Local state for translation toggle
  const [showBangla, setShowBangla] = useState(isBangla);
  const [translating, setTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<TranslatedJobData | null>(null);

  // Automatically sync with global language changes
  useEffect(() => {
    setShowBangla(isBangla);
  }, [isBangla]);

  // Fetch or trigger translation when Bangla view is selected
  useEffect(() => {
    if (showBangla && !translatedData && !translating) {
      setTranslating(true);
      translateJobPostingWithGemini({
        title: job.title,
        department: job.department,
        summary: job.summary,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits,
        location: job.location,
        employmentType: job.employmentType,
        workplaceType: job.workplaceType
      }).then(res => {
        setTranslatedData(res);
      }).catch(err => {
        console.error('Translation error:', err);
      }).finally(() => {
        setTranslating(false);
      });
    }
  }, [showBangla, job, translatedData, translating]);

  // Compute matching and missing skills
  const seekerSkills = (jobSeekerProfile?.skills || []).map(s => s.toLowerCase());
  const matchingSkills = job.skills.filter(s => seekerSkills.includes(s.toLowerCase()));
  const missingSkills = job.skills.filter(s => !seekerSkills.includes(s.toLowerCase()));

  const matchPercent = Math.min(98, Math.max(50, Math.round((matchingSkills.length / Math.max(1, job.skills.length)) * 100)));

  // Display fields based on active language view
  const displayTitle = (showBangla && translatedData) ? translatedData.title : job.title;
  const displayDepartment = (showBangla && translatedData) ? translatedData.department : job.department;
  const displayLocation = (showBangla && translatedData) ? translatedData.location : job.location;
  const displaySummary = (showBangla && translatedData) ? translatedData.summary : job.summary;
  const displayResponsibilities = (showBangla && translatedData) ? translatedData.responsibilities : job.responsibilities;
  const displayRequirements = (showBangla && translatedData) ? translatedData.requirements : job.requirements;
  const displayBenefits = (showBangla && translatedData) ? translatedData.benefits : job.benefits;
  const displayEmploymentType = (showBangla && translatedData) ? translatedData.employmentType : job.employmentType;
  const displayWorkplaceType = (showBangla && translatedData) ? translatedData.workplaceType : job.workplaceType;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button & Translation toggle header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 group cursor-pointer min-h-[44px] px-2.5 py-1.5 rounded-xl hover:bg-neutral-150 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          <span>{isBangla ? 'চাকরি অনুসন্ধানে ফিরে যান' : 'Back to Job Discovery'}</span>
        </button>

        {/* Dynamic Job Translation Toggle Button */}
        <button
          onClick={() => setShowBangla(!showBangla)}
          className={`flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            showBangla 
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' 
              : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300'
          }`}
        >
          {translating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              <span>বাংলায় রূপান্তর হচ্ছে...</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5" />
              <span>{showBangla ? '✓ বাংলায় প্রদর্শিত (Switch to English)' : '🌐 বাংলায় দেখুন (Translate to বাংলা)'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Job Body */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs relative">
            {showBangla && (
              <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-semibold text-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>জেমিনাই চালিত বাংলা সংস্করণ সক্রিয়</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={job.companyLogo || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&auto=format&fit=crop&q=80'}
                  alt={job.companyName}
                  className="w-16 h-16 rounded-2xl object-cover border border-neutral-100 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <span className="font-semibold">{job.companyName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>•</span>
                    <span>{displayDepartment}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-1">
                    {displayTitle}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSaveJob(job.id)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                    isSaved ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                  title={isBangla ? 'চাকরি সংরক্ষণ করুন' : 'Save Job'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert(isBangla ? 'চাকরির লিঙ্ক কপি করা হয়েছে!' : 'Job link copied to clipboard!');
                  }}
                  className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 cursor-pointer"
                  title={isBangla ? 'শেয়ার করুন' : 'Share Listing'}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-100 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-400 block mb-0.5">
                  {showBangla ? 'কর্মস্থল' : 'Location'}
                </span>
                <span className="font-semibold text-neutral-800">{displayLocation}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-400 block mb-0.5">
                  {showBangla ? 'কাজের ধরন' : 'Workplace & Type'}
                </span>
                <span className="font-semibold text-neutral-800">{displayEmploymentType} ({displayWorkplaceType})</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-400 block mb-0.5">
                  {showBangla ? 'মাসিক বেতন' : 'Monthly Salary'}
                </span>
                <span className="font-semibold text-emerald-700">
                  ৳ {job.salaryMinBdt.toLocaleString()} - {job.salaryMaxBdt.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-400 block mb-0.5">
                  {showBangla ? 'আবেদনের শেষ তারিখ' : 'Deadline'}
                </span>
                <span className="font-semibold text-neutral-800">{job.deadline}</span>
              </div>
            </div>
          </div>

          {/* AI Compatibility Breakdown */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {showBangla ? 'এআই প্রোফাইল সামঞ্জস্যতা বিশ্লেষণ' : 'AI Profile Compatibility Analysis'}
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold rounded-full text-xs">
                {matchPercent}% {showBangla ? 'ম্যাচ' : 'Match'}
              </span>
            </div>

            <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
              {showBangla
                ? 'আপনার প্রোফাইলে থাকা দক্ষতার সাথে এই চাকরির আবশ্যিক চাহিদার তুলনামূলক মূল্যায়ন।'
                : "Based on your current profile skills compared against this job's specified requirements."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-700/60 text-xs">
              <div>
                <span className="font-semibold text-emerald-400 block mb-1.5">
                  {showBangla ? `মিলে যাওয়া দক্ষতাসমূহ (${matchingSkills.length}):` : `Matching Skills (${matchingSkills.length}):`}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSkills.length > 0 ? (
                    matchingSkills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-emerald-950/70 border border-emerald-700/60 text-emerald-300 rounded text-[11px]">
                        ✓ {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-neutral-400">{showBangla ? 'এখনো যুক্ত করা হয়নি' : 'None yet (add to your profile)'}</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-neutral-400 block mb-1.5">
                  {showBangla ? 'প্রয়োজনীয় অতিরিক্ত দক্ষতা:' : 'Required Skills to Highlight:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {missingSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <span className="text-[10px] text-neutral-400 block mt-3 italic">
              {showBangla
                ? '* এআই ম্যাচ স্কোরটি আপনার সিভি সাজানোর সুবিধার্থে পরামর্শমূলক সংকেত।'
                : '* AI Match signal is an advisory tool to help you tailor your resume.'}
            </span>
          </div>

          {/* Role Summary & Sections */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6 text-xs sm:text-sm text-neutral-700">
            <div>
              <h3 className="font-bold text-neutral-900 text-base mb-2">
                {showBangla ? 'ভূমিকা ও বিবরণ' : 'Role Overview'}
              </h3>
              <p className="leading-relaxed text-neutral-600">{displaySummary}</p>
            </div>

            <div>
              <h3 className="font-bold text-neutral-900 text-base mb-3">
                {showBangla ? 'প্রধান দায়িত্বসমূহ' : 'Key Responsibilities'}
              </h3>
              <ul className="space-y-2 list-disc list-inside text-neutral-600 leading-relaxed">
                {displayResponsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-neutral-900 text-base mb-3">
                {showBangla ? 'প্রয়োজনীয় যোগ্যতা ও অভিজ্ঞতা' : 'Requirements & Experience'}
              </h3>
              <ul className="space-y-2 list-disc list-inside text-neutral-600 leading-relaxed">
                {displayRequirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {displayBenefits.length > 0 && (
              <div>
                <h3 className="font-bold text-neutral-900 text-base mb-3">
                  {showBangla ? 'সুযোগ-সুবিধা ও সুবিধাদি' : 'Perks & Compensation'}
                </h3>
                <ul className="space-y-2 list-disc list-inside text-neutral-600 leading-relaxed">
                  {displayBenefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Apply Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs text-neutral-400">
                {showBangla ? 'পরবর্তী পদক্ষেপে এগিয়ে যেতে প্রস্তুত?' : 'Ready to take the next step?'}
              </span>
              <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                {showBangla ? 'এই পদে আবেদন করুন' : 'Apply for this Position'}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{showBangla ? 'সংরক্ষিত প্রোফাইল দিয়ে দ্রুত আবেদন' : 'Quick application with pre-filled profile'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {showBangla ? `${job.questions.length}টি স্ক্রিনিং প্রশ্নের উত্তর আবশ্যক` : `${job.questions.length} screening questions required`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>
                  {showBangla ? `এখন পর্যন্ত ${job.applicantsCount || 0} জন আবেদন করেছেন` : `${job.applicantsCount || 0} candidates applied so far`}
                </span>
              </div>
            </div>

            <button
              onClick={() => onApply(job)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" /> 
              <span>{showBangla ? 'এখনই আবেদন করুন' : 'Apply Now'}</span>
            </button>

            {onStartMockInterview && (
              <button
                type="button"
                onClick={() => onStartMockInterview(job)}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-neutral-700 group"
              >
                <Mic className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>{showBangla ? 'এআই মক ইন্টারভিউ প্রস্তুতি শুরু করুন' : 'Practice AI Mock Interview'}</span>
              </button>
            )}

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-emerald-800">
                <Sparkles className="w-3.5 h-3.5" /> 
                {showBangla ? 'উন্নত ভয়েস ইন্টারভিউ প্রস্তুতি' : 'High-Impact Voice Prep'}
              </span>
              <p className="text-neutral-600 leading-snug">
                {showBangla 
                  ? 'এই সুনির্দিষ্ট পদের জন্য এআই দিয়ে ইন্টারভিউ অনুশীলন করুন। টেকনিক্যাল ও ব্যবহারিক প্রশ্নের উত্তর মুখে বা লিখে দিন এবং তাত্ক্ষণিক প্রতিক্রিয়া পান।'
                  : 'Simulate this exact role with AI. Answer technical and STAR questions with voice or typing and get instant critique.'}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-400">
                {showBangla ? 'আবেদনের শেষ সময়: ' : 'Application closes on '}
                <strong>{job.deadline}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (Layout C) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-30 lg:hidden shadow-lg pb-safe">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div className="min-w-0">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold truncate">{job.companyName}</div>
            <div className="text-xs font-black text-emerald-700 truncate">
              ৳ {(job.salaryMinBdt / 1000).toFixed(0)}k - {(job.salaryMaxBdt / 1000).toFixed(0)}k/mo
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleSaveJob(job.id)}
              className={`p-2.5 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}
              aria-label="Save job"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onApply(job)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{showBangla ? 'আবেদন করুন' : 'Apply Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
