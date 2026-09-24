import React, { useState, useMemo } from 'react';
import { Application, InterviewSchedule, HiringRecommendation, InterviewFeedback } from '../types';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { 
  X, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  User, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PostInterviewFeedbackModalProps {
  application: Application;
  interview?: InterviewSchedule | null;
  onClose: () => void;
  onFeedbackSaved?: () => void;
}

export const PostInterviewFeedbackModal: React.FC<PostInterviewFeedbackModalProps> = ({
  application,
  interview,
  onClose,
  onFeedbackSaved
}) => {
  const { user } = useAuth();
  const { submitInterviewFeedback } = useJobs();

  // Existing feedback if already recorded
  const existingFeedback = application.interviewFeedback || interview?.feedback;

  // Rating dimensions (1 to 5)
  const [technicalRating, setTechnicalRating] = useState<number>(existingFeedback?.ratings.technicalProficiency || 4);
  const [problemSolvingRating, setProblemSolvingRating] = useState<number>(existingFeedback?.ratings.problemSolving || 4);
  const [communicationRating, setCommunicationRating] = useState<number>(existingFeedback?.ratings.communicationSkills || 4);
  const [culturalFitRating, setCulturalFitRating] = useState<number>(existingFeedback?.ratings.culturalFit || 4);
  const [leadershipRating, setLeadershipRating] = useState<number>(existingFeedback?.ratings.leadershipPotential || 4);

  // Qualitative notes
  const [recommendation, setRecommendation] = useState<HiringRecommendation>(existingFeedback?.recommendation || 'hire');
  const [summaryNotes, setSummaryNotes] = useState<string>(
    existingFeedback?.summaryNotes || 
    'Candidate demonstrated strong technical fundamentals, solid knowledge of system components, and clear problem formulation during coding challenges.'
  );
  const [keyStrengths, setKeyStrengths] = useState<string>(
    existingFeedback?.keyStrengths || 
    'Clean code architecture, articulate communication of tradeoffs, proactive curiosity.'
  );
  const [areasForImprovement, setAreasForImprovement] = useState<string>(
    existingFeedback?.areasForImprovement || 
    'Could gain deeper familiarity with cloud telemetry and distributed caching at scale.'
  );

  // Status transition option
  const [advanceStatus, setAdvanceStatus] = useState<Application['status']>(
    recommendation === 'strong_hire' || recommendation === 'hire' ? 'selected' : application.status
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate live average rating and score projection
  const averageRating = useMemo(() => {
    const sum = technicalRating + problemSolvingRating + communicationRating + culturalFitRating + leadershipRating;
    return Number((sum / 5).toFixed(1));
  }, [technicalRating, problemSolvingRating, communicationRating, culturalFitRating, leadershipRating]);

  // Scaled interview score (0-100)
  const interviewScaledScore = Math.round((averageRating / 5) * 100);

  // Projected updated composite ranking score
  // 65% interview performance + 35% initial AI resume match score
  const existingAiScore = application.aiAnalysis?.matchScore ?? 75;
  const projectedRankScore = Math.round((existingAiScore * 0.35) + (interviewScaledScore * 0.65));

  const handleRatingChange = (category: string, value: number) => {
    if (category === 'tech') setTechnicalRating(value);
    if (category === 'problem') setProblemSolvingRating(value);
    if (category === 'comm') setCommunicationRating(value);
    if (category === 'culture') setCulturalFitRating(value);
    if (category === 'lead') setLeadershipRating(value);
  };

  const renderStarSelector = (category: string, currentVal: number, label: string, description: string) => {
    return (
      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5 hover:border-emerald-300 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-xs text-neutral-900 block">{label}</span>
            <span className="text-[10px] text-neutral-500">{description}</span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(category, star)}
                className={`p-1 rounded transition-transform cursor-pointer hover:scale-110 ${
                  star <= currentVal ? 'text-amber-400 fill-amber-400' : 'text-neutral-300 hover:text-amber-300'
                }`}
                title={`${star} out of 5`}
              >
                <Star className={`w-4 h-4 ${star <= currentVal ? 'fill-current' : ''}`} />
              </button>
            ))}
            <span className="text-xs font-bold text-neutral-800 ml-1.5 w-6 text-right">
              {currentVal}.0
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const feedbackPayload: InterviewFeedback = {
        interviewerId: user?.uid || 'recruiter_evaluator',
        interviewerName: user?.displayName || 'Lead Technical Interviewer',
        submittedAt: new Date().toISOString(),
        ratings: {
          technicalProficiency: technicalRating,
          problemSolving: problemSolvingRating,
          communicationSkills: communicationRating,
          culturalFit: culturalFitRating,
          leadershipPotential: leadershipRating
        },
        averageRating,
        scaledScore: interviewScaledScore,
        recommendation,
        summaryNotes,
        keyStrengths,
        areasForImprovement,
        nextStepDecision: advanceStatus
      };

      await submitInterviewFeedback({
        interviewId: interview?.id,
        applicationId: application.id,
        feedback: feedbackPayload,
        advanceStatus
      });

      confetti({ particleCount: 50, spread: 70 });
      if (onFeedbackSaved) onFeedbackSaved();
      onClose();
    } catch (err) {
      console.error('Failed to submit post-interview feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in my-8 border border-neutral-100">
        {/* Header with Candidate Context */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" /> Post-Interview Feedback Form
              </span>
              <span className="text-xs text-neutral-400">• Candidate Evaluation</span>
            </div>
            <h2 className="text-lg font-bold text-neutral-900">
              {application.candidateName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1 font-medium text-neutral-700">
                <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                {application.jobTitle}
              </span>
              {interview && (
                <span className="flex items-center gap-1 text-neutral-500">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {interview.date} at {interview.time} ({interview.type})
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Candidate Ranking Impact Preview Banner */}
        <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-4 rounded-xl border border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-4 h-4" />
              Dynamic Candidate Ranking Engine
            </div>
            <p className="text-xs text-neutral-300">
              Submitting these ratings updates the candidate's ranking against all applicants for {application.jobTitle}.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
            <div className="text-center">
              <span className="text-[10px] text-neutral-400 block uppercase">Resume Match</span>
              <span className="text-sm font-bold text-neutral-200">{existingAiScore}%</span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />

            <div className="text-center">
              <span className="text-[10px] text-neutral-400 block uppercase">Interview Rating</span>
              <span className="text-sm font-bold text-amber-300 flex items-center justify-center gap-0.5">
                ★ {averageRating}
              </span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />

            <div className="text-center">
              <span className="text-[10px] text-emerald-300 block uppercase font-bold">New Rank Score</span>
              <span className="text-xl font-black text-emerald-400">{projectedRankScore}%</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: Quantitative Rating Dimensions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Performance Ratings (1 - 5 Scale)
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Composite Rating: {averageRating} / 5.0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderStarSelector('tech', technicalRating, '1. Technical Proficiency', 'Coding depth, framework mastery, system architecture')}
              {renderStarSelector('problem', problemSolvingRating, '2. Problem Solving & Logic', 'Analytical structure, edge case handling, optimization')}
              {renderStarSelector('comm', communicationRating, '3. Communication & Articulation', 'Clarity, listening skills, explaining complex concepts')}
              {renderStarSelector('culture', culturalFitRating, '4. Culture & Collaboration Fit', 'Teamwork values, receptive to feedback, mission alignment')}
            </div>

            {renderStarSelector('lead', leadershipRating, '5. Leadership & Ownership Mindset', 'Initiative, mentorship potential, autonomous execution')}
          </div>

          {/* SECTION 2: Hiring Recommendation Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider block">
              Overall Hiring Recommendation
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'strong_hire', label: 'Strong Hire', color: 'bg-emerald-600 text-white border-emerald-600' },
                { id: 'hire', label: 'Hire', color: 'bg-emerald-500 text-white border-emerald-500' },
                { id: 'lean_hire', label: 'Lean Hire', color: 'bg-teal-600 text-white border-teal-600' },
                { id: 'lean_no_hire', label: 'Lean No Hire', color: 'bg-amber-600 text-white border-amber-600' },
                { id: 'no_hire', label: 'No Hire', color: 'bg-red-600 text-white border-red-600' }
              ].map(item => {
                const isSelected = recommendation === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRecommendation(item.id as HiringRecommendation);
                      if (item.id === 'strong_hire' || item.id === 'hire') {
                        setAdvanceStatus('selected');
                      } else if (item.id === 'no_hire') {
                        setAdvanceStatus('rejected');
                      }
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? `${item.color} shadow-xs font-black`
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Qualitative Feedback Notes */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Qualitative Interview Feedback & Observations
            </h3>

            {/* Executive Summary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">
                Executive Evaluation Notes & Summary:
              </label>
              <textarea
                rows={3}
                value={summaryNotes}
                onChange={e => setSummaryNotes(e.target.value)}
                placeholder="Overall interview impressions, reasoning behind recommendation..."
                className="w-full text-xs p-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Key Strengths */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" /> Key Strengths Noted:
                </label>
                <textarea
                  rows={2}
                  value={keyStrengths}
                  onChange={e => setKeyStrengths(e.target.value)}
                  placeholder="Standout skills or attributes..."
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Areas for Improvement */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                  <ThumbsDown className="w-3.5 h-3.5" /> Areas for Improvement / Gaps:
                </label>
                <textarea
                  rows={2}
                  value={areasForImprovement}
                  onChange={e => setAreasForImprovement(e.target.value)}
                  placeholder="Knowledge gaps, development needs, or minor concerns..."
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Application Stage Transition */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-neutral-900 block">
                Update Candidate Application Status:
              </span>
              <span className="text-[11px] text-neutral-500">
                Automatically transition candidate in the recruitment pipeline upon saving feedback.
              </span>
            </div>

            <select
              value={advanceStatus}
              onChange={e => setAdvanceStatus(e.target.value as Application['status'])}
              className="border border-neutral-300 rounded-lg p-1.5 bg-white text-xs font-medium text-neutral-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 shrink-0"
            >
              <option value="interview">Keep in Interview Stage</option>
              <option value="shortlisted">Move to Final Shortlist</option>
              <option value="selected">Extend Job Offer (Selected)</option>
              <option value="rejected">Reject Candidate</option>
            </select>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isSubmitting ? (
                'Saving Feedback & Updating Ranking...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Feedback & Update Candidate Rank
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
