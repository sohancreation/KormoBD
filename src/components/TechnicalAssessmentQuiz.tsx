import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  TechnicalAssessmentQuiz as ITechnicalAssessmentQuiz, 
  TechnicalQuizQuestion, 
  QuizDifficulty, 
  AssessmentSubmission,
  JobListing 
} from '../types';
import { generateTechnicalAssessmentWithAI } from '../services/aiService';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Code, 
  ChevronRight, 
  ChevronLeft, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  Sliders, 
  BookOpen, 
  HelpCircle, 
  Send,
  Eye,
  EyeOff,
  Layers,
  ArrowRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TechnicalAssessmentQuizProps {
  initialJobId?: string;
  onAssignToCandidate?: (quiz: ITechnicalAssessmentQuiz, candidateId?: string) => void;
}

export const TechnicalAssessmentQuiz: React.FC<TechnicalAssessmentQuizProps> = ({
  initialJobId,
  onAssignToCandidate
}) => {
  const { jobs, applications } = useJobs();
  const { isBangla } = useLanguage();

  // Active Job selection
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || jobs[0]?.id || '');
  const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  // Quiz generation configuration
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('mid');
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz
  const [activeQuiz, setActiveQuiz] = useState<ITechnicalAssessmentQuiz | null>(null);

  // Recruiter view settings
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Simulator / Test-Taking Mode state
  const [isTakingTest, setIsTakingTest] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [candidateAnswers, setCandidateAnswers] = useState<Record<string, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<AssessmentSubmission | null>(null);

  // Auto-generate initial quiz on mount for selected job
  useEffect(() => {
    if (targetJob && !activeQuiz) {
      handleGenerateQuiz();
    }
  }, [selectedJobId]);

  // Timer countdown while taking test
  useEffect(() => {
    if (!isTakingTest || testCompleted || timeRemainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTakingTest, testCompleted, timeRemainingSeconds]);

  // Generate quiz using AI
  const handleGenerateQuiz = async () => {
    if (!targetJob) return;
    setIsGenerating(true);
    try {
      const generated = await generateTechnicalAssessmentWithAI({
        jobId: targetJob.id,
        jobTitle: targetJob.title,
        requirements: targetJob.requirements,
        skills: targetJob.skills,
        difficulty,
        questionCount,
        language: isBangla ? 'bn' : 'en'
      });
      setActiveQuiz(generated);
      setIsTakingTest(false);
      setTestCompleted(false);
      setCandidateAnswers({});
      confetti({ particleCount: 30, spread: 50 });
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start test-taking simulation
  const handleStartSimulation = () => {
    if (!activeQuiz) return;
    setIsTakingTest(true);
    setTestCompleted(false);
    setCurrentQuestionIndex(0);
    setCandidateAnswers({});
    setTimeRemainingSeconds(activeQuiz.timeLimitMinutes * 60);
  };

  // Handle option selection during test
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (testCompleted) return;
    setCandidateAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Submit test and compute automated scoring
  const handleSubmitTest = () => {
    if (!activeQuiz) return;

    let earnedPoints = 0;
    const questionResults = activeQuiz.questions.map(q => {
      const selectedIndex = candidateAnswers[q.id];
      const isCorrect = selectedIndex === q.correctOptionIndex;
      if (isCorrect) {
        earnedPoints += q.points;
      }
      return {
        questionId: q.id,
        selectedIndex: selectedIndex !== undefined ? selectedIndex : -1,
        correctIndex: q.correctOptionIndex,
        isCorrect
      };
    });

    const scorePercent = Math.round((earnedPoints / activeQuiz.totalPossiblePoints) * 100);
    const passed = scorePercent >= activeQuiz.passingScorePercent;

    const submission: AssessmentSubmission = {
      id: `sub_${Date.now()}`,
      quizId: activeQuiz.id,
      jobId: activeQuiz.jobId,
      candidateName: isBangla ? 'ডেমো প্রার্থী (লাইভ সিমুলেটর)' : 'Demo Candidate (Live Simulator)',
      candidateEmail: 'candidate.preview@kormobd.com',
      answers: candidateAnswers,
      scorePercent,
      totalScore: earnedPoints,
      maxScore: activeQuiz.totalPossiblePoints,
      passed,
      completedAt: new Date().toISOString(),
      durationSeconds: (activeQuiz.timeLimitMinutes * 60) - timeRemainingSeconds,
      questionResults
    };

    setSubmissionResult(submission);
    setTestCompleted(true);
    if (passed) {
      confetti({ particleCount: 60, spread: 80 });
    }
  };

  // Copy shareable link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}?assessment=${activeQuiz?.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyLabel = (lvl: QuizDifficulty) => {
    if (!isBangla) return lvl;
    switch (lvl) {
      case 'junior': return 'জুনিয়র';
      case 'mid': return 'মিড';
      case 'senior': return 'সিনিয়র';
      case 'lead': return 'লিড';
      default: return lvl;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                AI Technical Assessment Engine
              </span>
              <span className="text-xs text-neutral-400">
                • {isBangla ? 'স্বয়ংক্রিয় স্কোরিং ও ব্যাখ্যাযুক্ত উত্তরপত্র' : 'Automated Scoring & Answer Key'}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white">
              {isBangla ? 'এআই-জেনারেটেড টেকনিক্যাল স্ক্রিনিং কুইজ' : 'AI-Generated Technical Screening Quizzes'}
            </h1>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              {isBangla 
                ? 'চাকরির পদবী ও প্রয়োজনীয় দক্ষতা অনুযায়ী তাত্ক্ষণিক বহুনির্বাচনী ও কোড প্রশ্ন তৈরি করুন। স্থাপত্যিক যৌক্তিকতা সহ উত্তরপত্র দেখুন, কিংবা স্বয়ংক্রিয় স্কোরিং সহ প্রার্থীর টেস্ট সিমুলেশন চালান।' 
                : 'Generate role-specific multiple-choice and code-snippet questions on the fly. Review full answer keys with architectural rationale, customize difficulty, or simulate live candidate testing with automated instant scoring.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 bg-neutral-800/80 rounded-xl text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              {isBangla ? 'পদবী:' : 'Role:'}
            </span>
            <select
              value={selectedJobId}
              onChange={e => setSelectedJobId(e.target.value)}
              className="bg-neutral-800 text-white text-xs border border-neutral-700 rounded-xl p-2 font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
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

      {/* Generator Controls Card */}
      {!isTakingTest && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                {isBangla ? 'অ্যাসেসমেন্ট কনফিগারেশন ও কাঠিন্য স্তর' : 'Assessment Configuration & Difficulty'}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {isBangla ? 'মূল্যায়নের লক্ষ্যযুক্ত দক্ষতা:' : 'Targeting competencies in:'} <strong>{targetJob?.skills.join(', ')}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Seniority Selector */}
              <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
                {(['junior', 'mid', 'senior', 'lead'] as QuizDifficulty[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                      difficulty === lvl ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {getDifficultyLabel(lvl)}
                  </button>
                ))}
              </div>

              {/* Question Count */}
              <select
                value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="text-xs border border-neutral-300 rounded-xl p-2 bg-white font-medium cursor-pointer"
              >
                <option value={5}>{isBangla ? '৫টি প্রশ্ন' : '5 Questions'}</option>
                <option value={6}>{isBangla ? '৬টি প্রশ্ন' : '6 Questions'}</option>
                <option value={8}>{isBangla ? '৮টি প্রশ্ন' : '8 Questions'}</option>
                <option value={10}>{isBangla ? '১০টি প্রশ্ন' : '10 Questions'}</option>
              </select>

              {/* Regenerate Button */}
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateQuiz}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>
                  {isGenerating 
                    ? (isBangla ? 'কুইজ তৈরি হচ্ছে...' : 'Generating...') 
                    : (isBangla ? 'কুইজ পুনরায় তৈরি করুন' : 'Regenerate Quiz')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ WORKSPACE: Either Recruiter Builder Mode OR Live Candidate Test Runner */}
      {activeQuiz && (
        <div className="space-y-4">
          {/* Recruiter Toolbar */}
          {!isTakingTest && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">{activeQuiz.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {getDifficultyLabel(difficulty)} {isBangla ? 'লেভেল' : 'Level'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isBangla 
                    ? `${activeQuiz.questions.length}টি প্রশ্ন • সময়সীমা: ${activeQuiz.timeLimitMinutes} মিনিট • পাসের যোগ্যতা: ${activeQuiz.passingScorePercent}%`
                    : `${activeQuiz.questions.length} Questions • ${activeQuiz.timeLimitMinutes} Mins Duration • ${activeQuiz.passingScorePercent}% Passing Threshold`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Answer Key Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    showAnswerKey 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                      : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {showAnswerKey ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>
                    {showAnswerKey 
                      ? (isBangla ? 'উত্তরপত্র লুকান' : 'Hide Answer Key') 
                      : (isBangla ? 'উত্তরপত্র প্রকাশ করুন' : 'Reveal Answer Key')}
                  </span>
                </button>

                {/* Shareable Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>
                    {copiedLink 
                      ? (isBangla ? 'লিংক কপি হয়েছে!' : 'Link Copied!') 
                      : (isBangla ? 'কুইজ লিংক কপি' : 'Copy Quiz Link')}
                  </span>
                </button>

                {/* Start Live Simulator */}
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>{isBangla ? 'টেস্ট সিমুলেটর চালান (লাইভ রান)' : 'Test Run Quiz (Candidate Simulator)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= MODE A: LIVE CANDIDATE TEST RUNNER ================= */}
          {isTakingTest && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-md space-y-6 animate-in fade-in">
              {/* Test Header with Live Timer and Progress Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {isBangla ? 'লাইভ প্রার্থী টেস্ট সিমুলেটর' : 'Live Candidate Simulation Mode'}
                  </span>
                  <h3 className="text-base font-bold text-neutral-900 mt-1">{activeQuiz.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  {!testCompleted && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-xl font-mono text-sm font-bold shadow-xs">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{formatTime(timeRemainingSeconds)}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsTakingTest(false);
                      setTestCompleted(false);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                  >
                    {isBangla ? 'সিমুলেটর বন্ধ করুন' : 'Exit Simulator'}
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-neutral-500 font-semibold">
                  <span>
                    {isBangla 
                      ? `${activeQuiz.questions.length}টির মধ্যে ${currentQuestionIndex + 1} নং প্রশ্ন` 
                      : `Question ${currentQuestionIndex + 1} of ${activeQuiz.questions.length}`}
                  </span>
                  <span>
                    {isBangla 
                      ? `${activeQuiz.questions.length}টির মধ্যে ${Object.keys(candidateAnswers).length}টি সম্পন্ন` 
                      : `${Object.keys(candidateAnswers).length} of ${activeQuiz.questions.length} Answered`}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* NOT COMPLETED: Active Question Display */}
              {!testCompleted && (
                <div className="space-y-5">
                  {(() => {
                    const q = activeQuiz.questions[currentQuestionIndex];
                    const selectedIdx = candidateAnswers[q.id];

                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700">
                            {q.category}
                          </span>
                          <span className="text-xs text-neutral-400 font-medium">
                            {q.points} {isBangla ? 'পয়েন্ট' : 'Points'}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-neutral-900 leading-snug">
                          {q.question}
                        </h4>

                        {/* Code Snippet Box (if present) */}
                        {q.codeSnippet && (
                          <div className="bg-neutral-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-neutral-800">
                            <pre className="whitespace-pre">{q.codeSnippet}</pre>
                          </div>
                        )}

                        {/* 4 Selectable Options */}
                        <div className="space-y-2.5 pt-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedIdx === optIdx;
                            const optionLetters = ['A', 'B', 'C', 'D'];

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                                  isChosen
                                    ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200'
                                    : 'bg-white border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isChosen ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {optionLetters[optIdx]}
                                </span>
                                <span className="text-xs text-neutral-800 font-medium pt-0.5">
                                  {opt}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation & Submit footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> {isBangla ? 'পূর্ববর্তী' : 'Previous'}
                    </button>

                    <div className="flex items-center gap-2">
                      {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1 cursor-pointer"
                        >
                          {isBangla ? 'পরবর্তী' : 'Next'} <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmitTest}
                          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isBangla ? 'মূল্যায়ন জমা দিন ও স্কোর দেখুন' : 'Submit Assessment & View Score'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* COMPLETED: Automated Scoring Results Dashboard */}
              {testCompleted && submissionResult && (
                <div className="space-y-6 animate-in fade-in zoom-in-95">
                  <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                    submissionResult.passed
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}>
                    <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center shadow-xs">
                      {submissionResult.passed ? (
                        <Award className="w-10 h-10 text-emerald-600" />
                      ) : (
                        <HelpCircle className="w-10 h-10 text-amber-600" />
                      )}
                    </div>

                    <h3 className="text-xl font-black text-neutral-900">
                      {submissionResult.passed 
                        ? (isBangla ? 'অ্যাসেসমেন্টে উত্তীর্ণ!' : 'Assessment Passed!') 
                        : (isBangla ? 'পুনরায় পর্যালোচনা প্রয়োজন' : 'Review Required')}
                    </h3>
                    <div className="text-3xl font-black text-neutral-900">
                      {submissionResult.scorePercent}%
                    </div>
                    <p className="text-xs text-neutral-600 max-w-md mx-auto">
                      {isBangla 
                        ? `মোট ${submissionResult.maxScore} পয়েন্টের মধ্যে ${submissionResult.totalScore} পয়েন্ট অর্জিত হয়েছে। পাসের যোগ্যতা ছিল ${activeQuiz.passingScorePercent}%। সময় লেগেছে ${Math.round(submissionResult.durationSeconds)} সেকেন্ড।`
                        : `Earned ${submissionResult.totalScore} of ${submissionResult.maxScore} points. Passing threshold was ${activeQuiz.passingScorePercent}%. Completed in ${Math.round(submissionResult.durationSeconds)} seconds.`}
                    </p>

                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartSimulation}
                        className="px-4 py-2 bg-white rounded-xl text-xs font-semibold text-neutral-800 border border-neutral-300 hover:bg-neutral-50 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> {isBangla ? 'পুনরায় টেস্ট দিন' : 'Retake Test'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTakingTest(false);
                          setShowAnswerKey(true);
                        }}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> {isBangla ? 'উত্তরপত্র ও ব্যাখ্যা দেখুন' : 'Review Full Explanations'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= MODE B: RECRUITER QUESTION BANK & ANSWER KEY ================= */}
          {!isTakingTest && (
            <div className="space-y-4">
              {activeQuiz.questions.map((q, idx) => {
                const optionLetters = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3 hover:border-neutral-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700">
                          {q.category}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-semibold">
                          {q.points} {isBangla ? 'পয়েন্ট' : 'Pts'}
                        </span>
                      </div>

                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                      {q.question}
                    </h4>

                    {/* Code Snippet */}
                    {q.codeSnippet && (
                      <div className="bg-neutral-900 text-emerald-300 p-3.5 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-neutral-800">
                        <pre className="whitespace-pre">{q.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctOptionIndex;

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                              showAnswerKey && isCorrect
                                ? 'bg-emerald-50 border-emerald-400 font-semibold text-emerald-950 ring-1 ring-emerald-300'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              showAnswerKey && isCorrect ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-600'
                            }`}>
                              {optionLetters[optIdx]}
                            </span>
                            <span className="leading-snug pt-0.5">{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Revealed Answer Key & Explanation */}
                    {showAnswerKey && (
                      <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs space-y-1 animate-in fade-in">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px] uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {isBangla ? 'সঠিক উত্তর ও স্থাপত্যিক যৌক্তিকতা:' : 'Answer Key & Architectural Rationale:'}
                        </div>
                        <p className="text-emerald-950 text-xs leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
