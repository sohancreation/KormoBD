import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Application, 
  IndividualInterviewerScorecard, 
  HiringScorecardReviewerRole, 
  ScorecardRecommendation,
  CollaborativeCandidateEvaluation
} from '../types';
import { 
  Users, 
  Sparkles, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  MessageSquare, 
  Award, 
  AlertCircle,
  Briefcase,
  Lock,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CollaborativeHiringScorecardProps {
  initialCandidateId?: string;
  onProceedToOffer?: (candidate: Application) => void;
}

// Preset interview committee members for fast realistic multi-interviewer debriefs
const INTERVIEWER_PERSONAS: Array<{
  role: HiringScorecardReviewerRole;
  name: string;
  title: string;
  titleBn: string;
  avatarText: string;
  avatarColor: string;
}> = [
  {
    role: 'technical_lead',
    name: 'Tariqul Islam',
    title: 'Principal Systems Architect',
    titleBn: 'প্রিন্সিপাল সিস্টেমস আর্কিটেক্ট',
    avatarText: 'TI',
    avatarColor: 'bg-indigo-600'
  },
  {
    role: 'hr_talent',
    name: 'Farhana Kabir',
    title: 'Senior People Operations Lead',
    titleBn: 'সিনিয়র পিপল অপারেশনস লিড',
    avatarText: 'FK',
    avatarColor: 'bg-emerald-600'
  },
  {
    role: 'executive',
    name: 'Tanzeem Ahmed',
    title: 'VP of Engineering',
    titleBn: 'ভিপি অফ ইঞ্জিনিয়ারিং',
    avatarText: 'TA',
    avatarColor: 'bg-amber-600'
  }
];

export const CollaborativeHiringScorecard: React.FC<CollaborativeHiringScorecardProps> = ({
  initialCandidateId,
  onProceedToOffer
}) => {
  const { applications, jobs, updateApplicationStatus } = useJobs();
  const { isBangla } = useLanguage();

  // Active candidate selection
  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialCandidateId || applications[0]?.id || ''
  );
  const activeCandidate = applications.find(a => a.id === selectedAppId) || applications[0];

  // Active reviewer tab
  const [activeReviewerIndex, setActiveReviewerIndex] = useState<number>(0);
  const currentPersona = INTERVIEWER_PERSONAS[activeReviewerIndex];

  // Storage for submitted multi-interviewer scorecards keyed by candidateId
  const [evaluationsMap, setEvaluationsMap] = useState<Record<string, IndividualInterviewerScorecard[]>>({
    // Pre-populate with realistic debrief for the first candidate
    [applications[0]?.id || 'default']: [
      {
        id: 'sc_tech_1',
        reviewerName: 'Tariqul Islam',
        reviewerRole: 'technical_lead',
        submittedAt: 'Today at 2:30 PM',
        recommendation: 'strong_hire',
        ratings: {
          technicalSkills: 5,
          problemSolving: 5,
          cultureAndValues: 4,
          communication: 4,
          leadership: 4
        },
        overallScore: 4.4,
        privateNotes: 'Exceptional grasp of system architecture and distributed concurrency. Solved database index optimization question effortlessly.',
        keyStrengths: 'Deep TypeScript & PostgreSQL internals, clean modular coding style.',
        redFlagsOrRisks: 'None. Strong technical hire for our platform squad.'
      },
      {
        id: 'sc_hr_1',
        reviewerName: 'Farhana Kabir',
        reviewerRole: 'hr_talent',
        submittedAt: 'Today at 3:15 PM',
        recommendation: 'hire',
        ratings: {
          technicalSkills: 4,
          problemSolving: 4,
          cultureAndValues: 5,
          communication: 5,
          leadership: 4
        },
        overallScore: 4.4,
        privateNotes: 'Very communicative and humble. Salary expectations aligned with our BDT budget. Ready to start in 3 weeks.',
        keyStrengths: 'High EQ, collaborative mindset, genuine interest in product mission.',
        redFlagsOrRisks: 'Has competing offer expiring in 5 business days.'
      }
    ]
  });

  // Active form state for the currently selected reviewer
  const [ratings, setRatings] = useState({
    technicalSkills: 4,
    problemSolving: 4,
    cultureAndValues: 5,
    communication: 4,
    leadership: 4
  });
  const [recommendation, setRecommendation] = useState<ScorecardRecommendation>('strong_hire');
  const [privateNotes, setPrivateNotes] = useState('');
  const [keyStrengths, setKeyStrengths] = useState('');
  const [redFlagsOrRisks, setRedFlagsOrRisks] = useState('');

  // Current candidate's scorecards
  const candidateReviews = evaluationsMap[selectedAppId] || [];

  // Submit current interviewer's scorecard
  const handleSubmitScorecard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;

    const avg = Object.values(ratings).reduce((a, b) => a + b, 0) / 5;

    const newScorecard: IndividualInterviewerScorecard = {
      id: `sc_${Date.now()}`,
      reviewerName: currentPersona.name,
      reviewerRole: currentPersona.role,
      submittedAt: isBangla ? 'এইমাত্র' : 'Just now',
      recommendation,
      ratings: { ...ratings },
      overallScore: Number(avg.toFixed(1)),
      privateNotes: privateNotes || (isBangla ? 'প্রার্থী মূল্যায়নে সন্তোষজনক দক্ষতা ও সচেতনতা প্রদর্শন করেছেন।' : 'Candidate demonstrated consistent competency during technical evaluation.'),
      keyStrengths: keyStrengths || (isBangla ? 'দৃঢ় টেকনিক্যাল জ্ঞান ও চমৎকার যোগাযোগ দক্ষতা।' : 'Solid foundational skills and clear communication.'),
      redFlagsOrRisks: redFlagsOrRisks || (isBangla ? 'কোনো ঝুঁকি নেই।' : 'None reported.')
    };

    setEvaluationsMap(prev => {
      const existing = prev[selectedAppId] || [];
      // Replace or add
      const filtered = existing.filter(r => r.reviewerRole !== currentPersona.role);
      return {
        ...prev,
        [selectedAppId]: [...filtered, newScorecard]
      };
    });

    confetti({ particleCount: 40, spread: 60 });
    setPrivateNotes('');
    setKeyStrengths('');
    setRedFlagsOrRisks('');
  };

  // Recommendation score helper
  const getRecommendationBadge = (rec: ScorecardRecommendation) => {
    switch (rec) {
      case 'strong_hire':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">{isBangla ? '🚀 নিশ্চিত নিয়োগ' : '🚀 Strong Hire'}</span>;
      case 'hire':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{isBangla ? '👍 নিয়োগযোগ্য' : '👍 Hire'}</span>;
      case 'neutral':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">{isBangla ? '⚖️ নিরপেক্ষ' : '⚖️ Lean / Neutral'}</span>;
      case 'no_hire':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">{isBangla ? '👎 অননুমোদিত' : '👎 No Hire'}</span>;
      case 'strong_no_hire':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">{isBangla ? '🚫 সরাসরি বাতিল' : '🚫 Strong No'}</span>;
    }
  };

  // Aggregated score
  const overallCommitteeAvg = candidateReviews.length > 0
    ? (candidateReviews.reduce((sum, r) => sum + r.overallScore, 0) / candidateReviews.length).toFixed(1)
    : '4.4';

  const strongHires = candidateReviews.filter(r => r.recommendation === 'strong_hire').length;
  const hires = candidateReviews.filter(r => r.recommendation === 'hire').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white p-6 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400" />
                {isBangla ? 'যৌথ নিয়োগ প্যানেল' : 'Collaborative Committee Panel'}
              </span>
              <span className="text-xs text-neutral-400">
                • {isBangla ? 'মাল্টি-ইন্টারভিউয়ার যৌথ স্কোরকার্ড ও মন্তব্য' : 'Multi-Interviewer Scorecards & Debriefs'}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white">
              {isBangla ? 'হায়ারিং টিমের অভ্যন্তরীণ স্কোরকার্ড ও মন্তব্য' : 'Hiring Team Notes & Internal Scorecards'}
            </h1>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              {isBangla 
                ? 'টেকনিক্যাল লিড, এইচআর পার্টনার ও শীর্ষ নির্বাহীদের ব্যক্তিগত মূল্যায়ন, রেটিং এবং মতামতের সমন্বয় করুন। অফার লেটার দেওয়ার পূর্বে পুরো টিমের সম্মতিক্রমে সিদ্ধান্ত চূড়ান্ত করুন।' 
                : 'Enable Technical Leads, HR Partners, and Executives to submit private ratings, structured competency reviews, and thumbs up/down recommendations. Synthesize all perspectives into consensus before extending an offer.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 bg-neutral-800/80 rounded-xl text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              {isBangla ? 'প্রার্থী:' : 'Candidate:'}
            </span>
            <select
              value={selectedAppId}
              onChange={e => setSelectedAppId(e.target.value)}
              className="bg-neutral-800 text-white text-xs border border-neutral-700 rounded-xl p-2 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {applications.map(a => (
                <option key={a.id} value={a.id}>
                  {a.candidateName} — {a.jobTitle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {activeCandidate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: Interviewer Scorecard Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interviewer Persona Switcher Tabs */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs space-y-3">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                {isBangla ? 'মতামত প্রদানের জন্য ইন্টারভিউয়ার নির্বাচন করুন:' : 'Select Interviewer Persona to Submit Feedback:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {INTERVIEWER_PERSONAS.map((persona, idx) => {
                  const isSelected = activeReviewerIndex === idx;
                  const alreadySubmitted = candidateReviews.some(r => r.reviewerRole === persona.role);

                  return (
                    <button
                      key={persona.role}
                      type="button"
                      onClick={() => setActiveReviewerIndex(idx)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200' 
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 ${persona.avatarColor}`}>
                        {persona.avatarText}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-neutral-900 truncate">{persona.name}</h4>
                          {alreadySubmitted && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate">
                          {isBangla ? persona.titleBn : persona.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scorecard Submission Form */}
            <form onSubmit={handleSubmitScorecard} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center ${currentPersona.avatarColor}`}>
                    {currentPersona.avatarText}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">
                      {currentPersona.name} {isBangla ? 'স্কোরকার্ড' : 'Scorecard'}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {isBangla ? currentPersona.titleBn : currentPersona.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-md">
                  <Lock className="w-3 h-3 text-neutral-500" />
                  <span>{isBangla ? 'অভ্যন্তরীণ গোপনীয় রিভিউ' : 'Private Internal Review'}</span>
                </div>
              </div>

              {/* 5 Core Competency Ratings */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-neutral-800">
                  {isBangla ? '১. মূল দক্ষতা মূল্যায়ন (১ থেকে ৫ স্টার):' : '1. Core Competency Ratings (1 to 5 Stars):'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'technicalSkills', labelEn: 'Technical Proficiency & Architecture', labelBn: 'প্রযুক্তিগত দক্ষতা ও আর্কিটেকচার' },
                    { key: 'problemSolving', labelEn: 'Problem Decomposition & Algorithms', labelBn: 'সমস্যা সমাধান ও অ্যালগরিদম' },
                    { key: 'cultureAndValues', labelEn: 'Culture, Ownership & Integrity', labelBn: 'টিম সংস্কৃতি ও নৈতিকতা' },
                    { key: 'communication', labelEn: 'Communication & Team Articulation', labelBn: 'যোগাযোগ ও স্পষ্টতা' },
                    { key: 'leadership', labelEn: 'Leadership Potential & Velocity', labelBn: 'নেতৃত্ব ও কাজের গতি' }
                  ].map(item => {
                    const currentRating = (ratings as any)[item.key];

                    return (
                      <div key={item.key} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-700">
                          {isBangla ? item.labelBn : item.labelEn}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatings(prev => ({ ...prev, [item.key]: star }))}
                              className="p-0.5 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${star <= currentRating ? 'fill-amber-400' : 'text-neutral-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hiring Recommendation Selector */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-neutral-800">
                  {isBangla ? '২. নিয়োগের চূড়ান্ত সুপারিশ:' : '2. Hiring Recommendation:'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { val: 'strong_hire', labelEn: '🚀 Strong Hire', labelBn: '🚀 নিশ্চিত নিয়োগ', descEn: 'Bar Raiser', descBn: 'মান বৃদ্ধিকারী' },
                    { val: 'hire', labelEn: '👍 Hire', labelBn: '👍 নিয়োগযোগ্য', descEn: 'Meets Bar', descBn: 'যোগ্যতা পূরণ' },
                    { val: 'neutral', labelEn: '⚖️ Neutral', labelBn: '⚖️ নিরপেক্ষ', descEn: 'Debrief Needed', descBn: 'আলোচনা প্রয়োজন' },
                    { val: 'no_hire', labelEn: '👎 No Hire', labelBn: '👎 অননুমোদিত', descEn: 'Below Bar', descBn: 'অপ্রতুল' },
                    { val: 'strong_no_hire', labelEn: '🚫 Strong No', labelBn: '🚫 সরাসরি বাতিল', descEn: 'Critical Gap', descBn: 'বড় ঘাটতি' }
                  ].map(option => (
                    <button
                      key={option.val}
                      type="button"
                      onClick={() => setRecommendation(option.val as ScorecardRecommendation)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        recommendation === option.val
                          ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs font-bold'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{isBangla ? option.labelBn : option.labelEn}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{isBangla ? option.descBn : option.descEn}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Qualitative Feedback Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isBangla ? 'পর্যবেক্ষিত প্রধান দক্ষতাসমূহ:' : 'Key Strengths Observed:'}
                  </label>
                  <textarea
                    rows={3}
                    value={keyStrengths}
                    onChange={e => setKeyStrengths(e.target.value)}
                    placeholder={isBangla ? 'যেমন: React কনকারেন্ট রেন্ডারিং ও PostgreSQL ইনডেক্সিংয়ে গভীর জ্ঞান প্রদর্শন করেছেন...' : 'e.g. Demonstrated deep understanding of React concurrent rendering and PostgreSQL indexing strategies.'}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    {isBangla ? 'ঝুঁকি বা সম্ভাব্য রেড ফ্ল্যাগ:' : 'Risks or Potential Red Flags:'}
                  </label>
                  <textarea
                    rows={3}
                    value={redFlagsOrRisks}
                    onChange={e => setRedFlagsOrRisks(e.target.value)}
                    placeholder={isBangla ? 'যেমন: ক্লাউড সিআই/সিডি অটোমেশনে সামান্য অনভিজ্ঞতা রয়েছে...' : 'e.g. Limited experience with CI/CD deployment pipelines; needs short ramp-up.'}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {isBangla ? 'অভ্যন্তরীণ কমিটির গোপন মন্তব্য (প্রার্থীর জন্য অদৃশ্য):' : 'Private Hiring Committee Debrief Notes (Invisible to Candidate):'}
                </label>
                <textarea
                  rows={2}
                  value={privateNotes}
                  onChange={e => setPrivateNotes(e.target.value)}
                  placeholder={isBangla ? 'অফার দেওয়ার পূর্বে কমিটির অভ্যন্তরীণ সমন্বয়ের জন্য মতামত...' : 'Internal perspective for the committee sync before extending offer...'}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isBangla ? `${currentPersona.name}-এর স্কোরকার্ড জমা দিন` : `Submit ${currentPersona.name}'s Scorecard`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Committee Debrief & Consensus Matrix */}
          <div className="space-y-6">
            {/* Consensus Overview Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  {isBangla ? 'কমিটির যৌথ সম্মতি ও ফলাফল' : 'Committee Consensus Debrief'}
                </h3>
                <span className="text-xs text-neutral-500 font-semibold">
                  {candidateReviews.length} {isBangla ? 'রিভিউ প্রাপ্ত' : 'Reviews In'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div>
                  <span className="text-xs text-emerald-800 font-semibold block">
                    {isBangla ? 'যৌথ গড় স্কোর' : 'Consensus Score'}
                  </span>
                  <div className="text-2xl font-black text-emerald-950 mt-0.5">
                    {overallCommitteeAvg} / 5.0
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-emerald-800 font-semibold block">
                    {isBangla ? 'ভোটের হিসাব' : 'Tally'}
                  </span>
                  <div className="text-xs font-bold text-emerald-900 mt-1">
                    {strongHires} {isBangla ? 'দৃঢ় সুপারিশ' : 'Strong Hire'} • {hires} {isBangla ? 'নিয়োগ' : 'Hire'}
                  </div>
                </div>
              </div>

              {/* Committee Decision Action */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-neutral-800 block">
                  {isBangla ? 'চূড়ান্ত নিয়োগ সিদ্ধান্ত:' : 'Final Hiring Decision:'}
                </span>
                
                {onProceedToOffer && (
                  <button
                    type="button"
                    onClick={() => onProceedToOffer(activeCandidate)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <span>{isBangla ? 'অফার লেটার তৈরিতে এগিয়ে যান' : 'Proceed to Offer Letter Builder'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    updateApplicationStatus(activeCandidate.id, 'rejected');
                    confetti({ particleCount: 20 });
                  }}
                  className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {isBangla ? 'প্রার্থী বাতিল করুন' : 'Decline Candidate'}
                </button>
              </div>
            </div>

            {/* Submitted Scorecards Feed */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-xs text-neutral-800 uppercase tracking-wider">
                {isBangla ? `জমা দেওয়া রিভিউ (${candidateReviews.length})` : `Submitted Reviews (${candidateReviews.length})`}
              </h3>

              {candidateReviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400">
                  {isBangla 
                    ? `${activeCandidate.candidateName}-এর জন্য এখনো কোনো স্কোরকার্ড জমা হয়নি।` 
                    : `No scorecards submitted yet for ${activeCandidate.candidateName}.`}
                </div>
              ) : (
                <div className="space-y-3">
                  {candidateReviews.map((rev) => (
                    <div key={rev.id} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-neutral-900 block">{rev.reviewerName}</span>
                          <span className="text-[10px] text-neutral-400 capitalize">{rev.reviewerRole.replace('_', ' ')} • {rev.submittedAt}</span>
                        </div>
                        {getRecommendationBadge(rev.recommendation)}
                      </div>

                      <p className="text-neutral-700 text-[11px] leading-relaxed italic">
                        "{rev.privateNotes}"
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-200">
                        <span>{isBangla ? 'সামগ্রিক:' : 'Overall:'} <strong>{rev.overallScore} / 5.0</strong></span>
                        <span className="text-emerald-700 font-semibold truncate max-w-[150px]">{rev.keyStrengths}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
