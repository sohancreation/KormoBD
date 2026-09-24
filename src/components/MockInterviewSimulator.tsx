import React, { useState, useEffect, useRef } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { 
  JobListing, 
  MockInterviewQuestion, 
  MockInterviewEvaluation, 
  MockInterviewFinalReport, 
  InterviewRoundType,
  CompletedMockSession 
} from '../types';
import { 
  generateMockInterviewPlanWithAI,
  evaluateMockInterviewAnswerWithAI,
  generateMockInterviewFinalReportWithAI 
} from '../services/aiService';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Play, 
  Award, 
  Briefcase, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Send, 
  Copy, 
  Check, 
  History, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  MessageSquareQuote,
  Lightbulb,
  FileCheck,
  Target,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

interface MockInterviewSimulatorProps {
  initialJob?: JobListing | null;
  onNavigateToJob?: (job: JobListing) => void;
  onBackToJobs?: () => void;
}

export const MockInterviewSimulator: React.FC<MockInterviewSimulatorProps> = ({
  initialJob = null,
  onNavigateToJob,
  onBackToJobs
}) => {
  const { jobs, applications, savedJobIds } = useJobs();
  const { user, jobSeekerProfile } = useAuth();
  const { language, setLanguage, isBangla, t } = useLanguage();

  // History stored in localStorage
  const storageKey = `kormobd_mock_sessions_${user?.uid || 'guest'}`;
  const [sessionHistory, setSessionHistory] = useState<CompletedMockSession[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Simulator Workflow States: 'setup' | 'active_question' | 'evaluation' | 'final_report' | 'history'
  const [workflowState, setWorkflowState] = useState<'setup' | 'active_question' | 'evaluation' | 'final_report' | 'history'>('setup');

  // Setup configuration state
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJob ? initialJob.id : 'custom');
  const [customJobTitle, setCustomJobTitle] = useState(initialJob?.title || 'Full-Stack Software Engineer');
  const [customCompany, setCustomCompany] = useState(initialJob?.companyName || 'bKash Limited');
  const [customJD, setCustomJD] = useState(
    initialJob 
      ? `${initialJob.summary}\n\nKey Responsibilities:\n${initialJob.responsibilities?.join('\n') || ''}`
      : 'Building high-scale scalable payment infrastructure, React & Node.js, microservices, distributed caching, and micro-frontend architecture.'
  );
  const [roundType, setRoundType] = useState<InterviewRoundType>('full_mixed');
  const [experienceLevel, setExperienceLevel] = useState<'junior' | 'mid' | 'senior' | 'lead'>('mid');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [enableTTS, setEnableTTS] = useState<boolean>(true);

  // Active Session state
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersHistory, setAnswersHistory] = useState<Array<{
    question: MockInterviewQuestion;
    userAnswer: string;
    evaluation: MockInterviewEvaluation;
  }>>([]);

  // Current Question Answering state
  const [userAnswerText, setUserAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<MockInterviewEvaluation | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExemplar, setShowExemplar] = useState(false);
  const [finalReport, setFinalReport] = useState<MockInterviewFinalReport | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  // Voice & Speech synthesis state
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingType, setCurrentSpeakingType] = useState<'question' | 'evaluation' | 'exemplar' | null>(null);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechKeepAliveRef = useRef<any>(null);

  // Speech Recognition state (Candidate Response Speech)
  const recognitionRef = useRef<any>(null);
  const textBeforeRecordingRef = useRef<string>('');
  const finalTranscriptRef = useRef<string>('');
  const answerInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechErrorMsg, setSpeechErrorMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Setup screen Mic Readiness Test
  const [micTestStatus, setMicTestStatus] = useState<'idle' | 'testing' | 'granted' | 'denied'>('idle');
  const [micTestMsg, setMicTestMsg] = useState<string | null>(null);

  // Timer per question
  const [questionTimer, setQuestionTimer] = useState(0);
  const timerIntervalRef = useRef<any>(null);

  // Helper to get formatted JD string from JobListing
  const formatJobDescription = (job: JobListing) => {
    return [
      job.summary,
      job.responsibilities?.length ? `Responsibilities:\n${job.responsibilities.map(r => `• ${r}`).join('\n')}` : '',
      job.requirements?.length ? `Requirements:\n${job.requirements.map(r => `• ${r}`).join('\n')}` : ''
    ].filter(Boolean).join('\n\n');
  };

  // Initialize selected job if prop changes
  useEffect(() => {
    if (initialJob) {
      setSelectedJobId(initialJob.id);
      setCustomJobTitle(initialJob.title);
      setCustomCompany(initialJob.companyName);
      setCustomJD(formatJobDescription(initialJob));
    }
  }, [initialJob]);

  // When job dropdown changes
  const handleJobSelectChange = (id: string) => {
    setSelectedJobId(id);
    if (id === 'custom') {
      return;
    }
    const found = jobs.find(j => j.id === id);
    if (found) {
      setCustomJobTitle(found.title);
      setCustomCompany(found.companyName);
      setCustomJD(formatJobDescription(found));
    }
  };

  // Load and cache SpeechSynthesis voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          setAvailableVoices(v);
        }
      } catch (err) {
        console.warn('Could not load speechSynthesis voices:', err);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      try {
        window.speechSynthesis.onvoiceschanged = null;
      } catch {}
    };
  }, []);

  // Cleanup speech resources on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopSpeaking();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Timer logic for active question
  useEffect(() => {
    if (workflowState === 'active_question') {
      setQuestionTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setQuestionTimer(t => t + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [workflowState, currentQuestionIndex]);

  // Core Speech Synthesis (Text-to-Speech)
  const speakText = (text: string, type: 'question' | 'evaluation' | 'exemplar' = 'question') => {
    if (!('speechSynthesis' in window) || !enableTTS || !text) return;

    stopSpeaking();

    // Clean formatting characters for smooth TTS pronunciation
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/•/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // A brief delay prevents Chrome speech cancel race conditions
    setTimeout(() => {
      try {
        // Resume synthesis if Chrome paused it
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Choose appropriate voice for Bangla or English
        const voicePool = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        let selectedVoice: SpeechSynthesisVoice | undefined;

        if (isBangla) {
          selectedVoice = voicePool.find(v => 
            v.lang.startsWith('bn') || 
            v.lang.includes('Bangla') || 
            v.lang.includes('Bengali')
          );
        }

        if (!selectedVoice) {
          // Look for pleasant, natural English voice
          selectedVoice = voicePool.find(v => 
            v.lang.startsWith('en') && 
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Zira') || v.name.includes('Karen'))
          );
        }

        if (!selectedVoice && voicePool.length > 0) {
          selectedVoice = voicePool.find(v => v.lang.startsWith(isBangla ? 'bn' : 'en')) || voicePool[0];
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          setIsInterviewerSpeaking(true);
          setCurrentSpeakingType(type);

          // Workaround for Chrome cutting off speech after 14 seconds
          if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
          speechKeepAliveRef.current = setInterval(() => {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            }
          }, 10000);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setIsInterviewerSpeaking(false);
          setCurrentSpeakingType(null);
          if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
          currentUtteranceRef.current = null;
        };

        utterance.onerror = (e) => {
          console.warn('SpeechSynthesis utterance error:', e);
          setIsSpeaking(false);
          setIsInterviewerSpeaking(false);
          setCurrentSpeakingType(null);
          if (speechKeepAliveRef.current) clearInterval(speechKeepAliveRef.current);
          currentUtteranceRef.current = null;
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Failed to speak text:', err);
        setIsSpeaking(false);
        setIsInterviewerSpeaking(false);
        setCurrentSpeakingType(null);
      }
    }, 50);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (speechKeepAliveRef.current) {
      clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
    setIsSpeaking(false);
    setIsInterviewerSpeaking(false);
    setCurrentSpeakingType(null);
    currentUtteranceRef.current = null;
  };

  const speakQuestion = (text: string) => {
    speakText(text, 'question');
  };

  const speakEvaluationDebrief = (evalData: MockInterviewEvaluation) => {
    if (!evalData) return;
    const cleanStrength = evalData.strengths?.[0]?.replace(/[•*]/g, '').trim() || '';
    const cleanCritique = evalData.critiques?.[0]?.replace(/[•*]/g, '').trim() || '';
    const cleanTip = evalData.actionableTip?.replace(/[•*]/g, '').trim() || '';

    const debrief = isBangla
      ? `আপনার উত্তর মূল্যায়নের ফলাফল: স্কোর ১০০ এর মধ্যে ${evalData.score}। ${evalData.clarityFeedback} প্রধান ইতিবাচক দিক: ${cleanStrength}। উন্নতির সুযোগ: ${cleanCritique}। পরামর্শ: ${cleanTip}`
      : `Your interview response evaluation is ready. Overall score is ${evalData.score} out of 100. ${evalData.clarityFeedback} Standout strength: ${cleanStrength}. Recommended improvement: ${cleanCritique}. Actionable tip: ${cleanTip}`;

    speakText(debrief, 'evaluation');
  };

  // Candidate Response Speech-to-Text (Microphone recording)
  const startRecording = async () => {
    stopSpeaking();
    setSpeechErrorMsg(null);
    setSubmitError(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechErrorMsg(isBangla
        ? 'আপনার ব্রাউজারে সরাসরি মাইক্রোফোন স্পিচ-টু-টেক্সট সক্রিয় নেই। আপনি নিচের বক্সে টাইপ করতে পারেন অথবা নমুনা উত্তর ব্যবহার করতে পারেন।'
        : 'Speech recognition is not supported in this browser environment. You can type directly in the box below or load a sample answer.');
      setSpeechSupported(false);
      return;
    }

    // Step 1: Explicitly request browser microphone permission via getUserMedia
    // This prompts the browser's native permission modal (Allow / Block)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop media stream tracks to free audio hardware for SpeechRecognition
        stream.getTracks().forEach(track => track.stop());
      } catch (mediaErr: any) {
        console.warn('getUserMedia permission error:', mediaErr);
        const isIframe = typeof window !== 'undefined' && window.self !== window.top;
        if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
          const iframeTip = isIframe
            ? 'Note: Embedded preview frames often restrict direct hardware microphone capture. '
            : 'Please allow microphone access in your browser address bar. ';
          const iframeTipBn = isIframe
            ? 'প্রিভিউ আইফ্রেম সিকিউরিটির কারণে সরাসরি ব্রাউজার মাইক বন্ধ থাকতে পারে। '
            : 'ব্রাউজার অ্যাড্রেস বারের লক আইকন থেকে Microphone Allow করুন। ';

          if (isBangla) {
            setSpeechErrorMsg(`মাইক্রোফোন ব্যবহারের অনুমতি বন্ধ করা আছে (Permission Denied)। ${iframeTipBn}আপনি নিচের বক্সে সরাসরি টাইপ করতে পারেন অথবা "নমুনা স্পোকেন উত্তর" বোতামে ক্লিক করে তাৎক্ষণিক AI মূল্যায়ন চালাতে পারেন।`);
          } else {
            setSpeechErrorMsg(`Microphone permission denied. ${iframeTip}You can type your answer below or click "Simulate Spoken Answer" to experience the complete AI evaluation!`);
          }
          setIsRecording(false);
          return;
        } else if (mediaErr.name === 'NotFoundError' || mediaErr.name === 'DevicesNotFoundError') {
          setSpeechErrorMsg(isBangla
            ? 'কোনো সক্রিয় মাইক্রোফোন পাওয়া যায়নি। অনুগ্রহ করে অডিও ইনপুট সংযোগ নিশ্চিত করুন অথবা নিচের বক্সে সরাসরি টাইপ করুন।'
            : 'No microphone was found on your device. Please connect an audio input device or type your answer.');
          setIsRecording(false);
          return;
        }
      }
    }

    // Step 2: Initialize SpeechRecognition
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isBangla ? 'bn-BD' : 'en-US';

      textBeforeRecordingRef.current = userAnswerText.trim();
      finalTranscriptRef.current = '';

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const prefix = textBeforeRecordingRef.current ? textBeforeRecordingRef.current + ' ' : '';
        const combined = (prefix + finalTranscriptRef.current + interim).trim();
        setUserAnswerText(combined);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        const isIframe = typeof window !== 'undefined' && window.self !== window.top;
        if (event.error === 'not-allowed') {
          const iframeTip = isIframe
            ? 'Note: Embedded preview frames often restrict direct hardware microphone capture. '
            : 'Please allow microphone access in your browser address bar. ';
          const iframeTipBn = isIframe
            ? 'প্রিভিউ আইফ্রেম সিকিউরিটির কারণে সরাসরি ব্রাউজার মাইক বন্ধ থাকতে পারে। '
            : 'ব্রাউজার অ্যাড্রেস বারের লক আইকন থেকে Microphone Allow করুন। ';

          if (isBangla) {
            setSpeechErrorMsg(`মাইক্রোফোন ব্যবহারের অনুমতি বন্ধ করা আছে (Permission Denied)। ${iframeTipBn}আপনি নিচের বক্সে সরাসরি টাইপ করতে পারেন অথবা "নমুনা স্পোকেন উত্তর" বোতামে ক্লিক করে তাৎক্ষণিক AI মূল্যায়ন চালাতে পারেন।`);
          } else {
            setSpeechErrorMsg(`Microphone permission denied. ${iframeTip}You can type your answer below or click "Simulate Spoken Answer" to experience the complete AI evaluation!`);
          }
          setIsRecording(false);
        } else if (event.error === 'no-speech') {
          // Keep listening or allow user to speak
        } else {
          setSpeechErrorMsg(isBangla
            ? `ভয়েস শনাক্তকরণ ত্রুটি: ${event.error}`
            : `Voice recognition error: ${event.error}`);
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      setSpeechErrorMsg(isBangla
        ? 'মাইক্রোফোন চালু করা যায়নি। দয়া করে ব্রাউজার অ্যাড্রেস বারে অনুমতি চেক করুন অথবা সরাসরি টাইপ করুন।'
        : 'Could not access microphone. Please check browser permissions or type your answer.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  // Helper when user clicks "Type Answer Instead" from banner
  const handleFocusAnswerBox = () => {
    setSpeechErrorMsg(null);
    if (answerInputRef.current) {
      answerInputRef.current.focus();
    }
  };

  // Helper when user clicks "Load Sample Answer" from banner
  const handleLoadSampleFromError = (type: 'star' | 'tech' | 'culture') => {
    setUserAnswerText(getSampleAnswer(type));
    setSpeechErrorMsg(null);
    setSubmitError(null);
    setTimeout(() => {
      answerInputRef.current?.focus();
    }, 100);
  };

  // Setup screen microphone diagnostics tester
  const handleTestMicrophone = async () => {
    setMicTestStatus('testing');
    setMicTestMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicTestStatus('denied');
      setMicTestMsg(isBangla
        ? 'আপনার ব্রাউজার সরাসরি মাইক্রোফোন অডিও মিডিয়া সমর্থন করে না।'
        : 'Your browser environment does not support mediaDevices API.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicTestStatus('granted');
      setMicTestMsg(isBangla
        ? 'মাইক্রোফোন সফলভাবে সংযুক্ত ও সম্পূর্ণ প্রস্তুত!'
        : 'Microphone is connected and permission is granted!');
    } catch (err: any) {
      setMicTestStatus('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicTestMsg(isBangla
          ? 'মাইক্রোফোন অনুমতি বন্ধ আছে। অ্যাড্রেস বারের লক আইকনে ক্লিক করে "Allow" করুন।'
          : 'Microphone access denied. Click the lock/tune icon in your browser address bar to allow.');
      } else {
        setMicTestMsg(isBangla
          ? 'কোনো সক্রিয় মাইক্রোফোন পাওয়া যায়নি। অনুগ্রহ করে অডিও ইনপুট চেক করুন।'
          : 'No microphone detected or error accessing audio input.');
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Sample spoken responses for quick testing
  const getSampleAnswer = (type: 'star' | 'tech' | 'culture') => {
    setSubmitError(null);
    if (isBangla) {
      if (type === 'star') {
        return 'আমাদের পেমেন্ট গেটওয়েতে ট্রানজ্যাকশন স্পাইকের সময় ডেটাবেস কানেকশন ড্রপ হচ্ছিল (Situation)। আমার দায়িত্ব ছিল সিস্টেম ডাউনটাইম কমানো ও থ্রটলিং সমাধান করা (Task)। আমি তাৎক্ষণিকভাবে রেডিস ক্লাস্টার ক্যাশিং লেয়ার যুক্ত করি এবং ব্যাকপ্রেশার কিউ মেকানিজম বাস্তবায়ন করি (Action)। এর ফলে ৯৯.৯৯% সিস্টেম আপটাইম নিশ্চিত হয় এবং পিক ট্রাফিকের সময় কোনো ট্রানজ্যাকশন ব্যর্থ হয়নি (Result)।';
      }
      if (type === 'tech') {
        return 'হাই-স্কেল মাইক্রোসার্ভিস আর্কিটেকচারে আমি ইভেন্ট-ড্রিভেন আর্কিটেকচার এবং অপটিমিস্টিক লকিং পছন্দ করি। নোড.জেএস এবং নেক্সট.জেএস-এ এপিআই লেয়ারে ইন-মেমরি ক্যাশিং এবং রিড-রেপ্লিকা সহ পোস্টগ্রেস ডেটাবেস ব্যবহার করে ডেটাবেস লোড প্রায় ৬০% কমিয়ে আনা সম্ভব। ডিস্ট্রিবিউটেড ট্রেসিংয়ের জন্য আমরা ওপেনটেলিমেট্রি ব্যবহার করি।';
      }
      return 'টিমের ক্রস-ফাংশনাল সমন্বয় ও প্রোডাক্ট ডেলিভারিতে আমি নিয়মিত অ্যাজাইল ও স্প্রিন্ট প্ল্যানিং অনুসরণ করি। জুনিয়র ডেভেলপারদের জন্য কোড রিভিউ ও মেন্টরশিপের পাশাপাশি স্টেকহোল্ডারদের সাথে স্বচ্ছ যোগাযোগ বজায় রাখাকে আমি সর্বোচ্চ অগ্রাধিকার দেই।';
    } else {
      if (type === 'star') {
        return 'In my previous role, during high-volume flash sales our payment gateway experienced latency spikes exceeding 3 seconds (Situation). As the lead backend engineer, my goal was to bring p99 latency under 250ms without dropping orders (Task). I implemented a distributed Redis caching layer with Redis streams for asynchronous transaction queueing, decoupling order ingestion from payment reconciliation (Action). As a result, p99 latency dropped by 88% to 180ms, maintaining 99.99% availability during peak 25,000 QPS load (Result).';
      }
      if (type === 'tech') {
        return 'For scalable microservices, I design stateless services backed by event-driven architectures using Kafka or RabbitMQ. At the data layer, I combine partitioned PostgreSQL with read replicas and multi-tier Redis caching. We use distributed tracing and circuit breakers with Resilience4j to prevent cascading failures.';
      }
      return 'I believe in fostering psychological safety and technical excellence. When technical disagreements arise, I anchor decisions on data, architectural trade-offs, and user experience, while holding weekly architecture reviews and pair-programming sessions with junior engineers.';
    }
  };

  // Start the interview session
  const handleStartInterview = async () => {
    setLoadingPlan(true);
    setPlanError(null);
    stopSpeaking();

    const selectedJob = jobs.find(j => j.id === selectedJobId);
    const targetTitle = selectedJob ? selectedJob.title : customJobTitle;
    const targetCompany = selectedJob ? selectedJob.companyName : customCompany;
    const targetJD = selectedJob ? formatJobDescription(selectedJob) : customJD;
    const targetSkills = selectedJob ? selectedJob.skills : (jobSeekerProfile?.skills || []);
    const targetReqs = selectedJob ? selectedJob.requirements : [];

    try {
      const plan = await generateMockInterviewPlanWithAI({
        jobTitle: targetTitle,
        companyName: targetCompany,
        jobDescription: targetJD,
        requirements: targetReqs,
        skills: targetSkills,
        roundType,
        experienceLevel,
        candidateHeadline: jobSeekerProfile?.headline || '',
        candidateSkills: jobSeekerProfile?.skills || [],
        questionCount,
        language: isBangla ? 'bn' : 'en'
      });

      setQuestions(plan);
      setCurrentQuestionIndex(0);
      setAnswersHistory([]);
      setUserAnswerText('');
      setCurrentEvaluation(null);
      setShowHint(false);
      setShowExemplar(false);
      setWorkflowState('active_question');

      // Speak first question
      if (enableTTS && plan.length > 0) {
        setTimeout(() => {
          speakQuestion(`Welcome to your interview for ${targetTitle} at ${targetCompany}. Here is your first question: ${plan[0].question}`);
        }, 500);
      }
    } catch (err: any) {
      setPlanError('Failed to generate interview questions. Please check your network and try again.');
    } finally {
      setLoadingPlan(false);
    }
  };

  // Submit answer for real-time AI evaluation
  const handleSubmitAnswer = async () => {
    if (!userAnswerText.trim()) {
      setSubmitError(isBangla
        ? 'দয়া করে উত্তরটি মাইক্রোফোনে বলুন অথবা বক্সে টাইপ করুন।'
        : 'Please provide an answer by speaking into the microphone or typing your response.');
      return;
    }
    setSubmitError(null);

    if (isRecording) {
      stopRecording();
    }
    stopSpeaking();

    setIsEvaluating(true);
    const currentQ = questions[currentQuestionIndex];
    const targetTitle = customJobTitle;
    const targetCompany = customCompany;

    try {
      const evalResult = await evaluateMockInterviewAnswerWithAI({
        jobTitle: targetTitle,
        companyName: targetCompany,
        question: currentQ,
        candidateAnswer: userAnswerText,
        experienceLevel,
        language: isBangla ? 'bn' : 'en'
      });

      setCurrentEvaluation(evalResult);
      setShowExemplar(false);
      setWorkflowState('evaluation');

      // Play soft celebration confetti if score is high
      if (evalResult.score >= 80) {
        confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
      }

      // Auto-speak AI evaluation response debrief if TTS is enabled
      if (enableTTS) {
        setTimeout(() => {
          speakEvaluationDebrief(evalResult);
        }, 600);
      }
    } catch (err) {
      console.warn('Error evaluating answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to Next Question or Final Debrief
  const handleProceedNext = async () => {
    if (!currentEvaluation) return;

    // Record Q&A
    const updatedHistory = [
      ...answersHistory,
      {
        question: questions[currentQuestionIndex],
        userAnswer: userAnswerText,
        evaluation: currentEvaluation
      }
    ];
    setAnswersHistory(updatedHistory);

    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      // Advance to next question
      setCurrentQuestionIndex(nextIndex);
      setUserAnswerText('');
      setCurrentEvaluation(null);
      setShowHint(false);
      setShowExemplar(false);
      setWorkflowState('active_question');

      if (enableTTS) {
        setTimeout(() => {
          speakQuestion(`Question ${nextIndex + 1}: ${questions[nextIndex].question}`);
        }, 400);
      }
    } else {
      // Completed all questions -> generate final report
      setGeneratingReport(true);
      setWorkflowState('final_report');

      try {
        const report = await generateMockInterviewFinalReportWithAI({
          jobTitle: customJobTitle,
          companyName: customCompany,
          roundType,
          qaHistory: updatedHistory,
          language: isBangla ? 'bn' : 'en'
        });

        setFinalReport(report);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        // Save to session history
        const newSession: CompletedMockSession = {
          id: `session_${Date.now()}`,
          date: new Date().toISOString(),
          jobTitle: customJobTitle,
          companyName: customCompany,
          roundType,
          questionsCount: questions.length,
          report,
          qaHistory: updatedHistory
        };

        const updatedSessions = [newSession, ...sessionHistory.slice(0, 19)];
        setSessionHistory(updatedSessions);
        try {
          localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
        } catch {}
      } catch (err) {
        console.warn('Error generating final report:', err);
      } finally {
        setGeneratingReport(false);
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  // Copy report summary to clipboard
  const handleCopyReport = () => {
    if (!finalReport) return;
    const text = `🎯 Kormo BD AI Mock Interview Report
Target Role: ${customJobTitle} at ${customCompany}
Round: ${roundType.replace('_', ' ').toUpperCase()}
Overall Readiness Score: ${finalReport.overallScore}/100
Recommendation: ${finalReport.recommendation.toUpperCase()}

📊 Category Breakdown:
- Clarity & Articulation: ${finalReport.averageClarity}/100
- Confidence & Ownership: ${finalReport.averageConfidence}/100
- Keywords & Technical Depth: ${finalReport.averageKeywordScore}/100

🌟 Standout Strengths:
${finalReport.topStrengths.map(s => `• ${s}`).join('\n')}

📈 Priority Areas for Improvement:
${finalReport.priorityImprovements.map(p => `• ${p}`).join('\n')}

⚡ Action Plan:
${finalReport.actionPlan.map(a => `• ${a}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {isBangla ? 'এআই ভয়েস সিমুলেটর' : 'AI Voice Simulator'}
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-xs text-neutral-500 font-medium">
              {isBangla ? 'STAR ফ্রেমওয়ার্ক ও রিয়েল-টাইম ভয়েস প্রস্তুতি' : 'STAR Framework & Real-Time Voice Prep'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
            {isBangla ? 'এআই মক ইন্টারভিউ ও ভয়েস কোচ' : 'AI Mock Interview & Voice Coach'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-3xl leading-relaxed">
            {isBangla 
              ? 'আপনার লক্ষ্যযুক্ত চাকরির বর্ণনার সাথে হুবহু মিল রেখে ইন্টারভিউ অনুশীলন করুন। এআই এক এক করে টেকনিক্যাল ও আচরণগত প্রশ্ন করবে এবং আপনার স্পষ্টতা, আত্মবিশ্বাস ও প্রযুক্তিগত গভীরতা মূল্যায়ন করবে।' 
              : 'Practice realistic interviews tailored specifically to your target job description. The AI asks technical & behavioral questions one by one and evaluates clarity, confidence, and keyword depth.'}
          </p>
        </div>

        {/* Global Controls / History View & Language Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="English instructions and questions"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                language === 'bn'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="বাংলা নির্দেশাবলী ও প্রশ্নাবলী"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>বাংলা</span>
            </button>
          </div>

          {workflowState !== 'setup' && (
            <button
              onClick={() => {
                const confirmMsg = isBangla
                  ? 'আপনি কি নিশ্চিত যে এই ইন্টারভিউ সেশন থেকে প্রস্থান করতে চান? আপনার বর্তমান অগ্রগতি রিসেট হয়ে যাবে।'
                  : 'Are you sure you want to exit this interview session? Your current progress will be reset.';
                if (window.confirm(confirmMsg)) {
                  stopSpeaking();
                  setWorkflowState('setup');
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 
              <span>{isBangla ? 'সেশন ত্যাগ' : 'Exit Session'}</span>
            </button>
          )}

          <button
            onClick={() => setWorkflowState(workflowState === 'history' ? 'setup' : 'history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              workflowState === 'history'
                ? 'bg-neutral-900 text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBangla ? `পূর্ববর্তী সেশনসমূহ (${sessionHistory.length})` : `Past Sessions (${sessionHistory.length})`}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SETUP & CONFIGURATION STATE                                            */}
      {/* ========================================================================= */}
      {workflowState === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Setup Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-emerald-600" />
                {isBangla ? 'আপনার মক ইন্টারভিউ কনফিগার করুন' : 'Configure Your Mock Interview'}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {isBangla 
                  ? 'টার্গেট পদবি, নিয়োগের মানদণ্ড এবং অনুশীলন রাউন্ড নির্ধারণ করুন।' 
                  : 'Customize the target role, hiring standards, and practice round focus.'}
              </p>
            </div>

            {/* Target Job Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                {isBangla ? 'টার্গেট চাকরির বিবরণ' : 'Target Job Description'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedJobId}
                  onChange={(e) => handleJobSelectChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="custom">✍️ {isBangla ? 'কাস্টম পদ ও বিবরণ লিখুন' : 'Custom Role & Job Description'}</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} — {job.companyName} ({job.department})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder={isBangla ? 'কোম্পানির নাম (যেমন: বিকাশ)' : 'Company Name (e.g. bKash)'}
                    className="w-1/2 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => setCustomJobTitle(e.target.value)}
                    placeholder={isBangla ? 'চাকরির পদবি' : 'Role Title'}
                    className="w-1/2 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {selectedJobId === 'custom' && (
                <div className="mt-3">
                  <textarea
                    rows={4}
                    value={customJD}
                    onChange={(e) => setCustomJD(e.target.value)}
                    placeholder={isBangla ? 'চাকরির প্রয়োজনীয় দায়িত্ব ও স্কিলসমূহ এখানে পেস্ট করুন...' : 'Paste the Job Description or key responsibilities here...'}
                    className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Round Focus Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                {isBangla ? 'ইন্টারভিউ রাউন্ডের ধরন নির্বাচন করুন' : 'Select Interview Round Type'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'full_mixed',
                    label: isBangla ? 'কম্প্রিহেন্সিভ ফুল রাউন্ড' : 'Comprehensive Full Round',
                    badge: isBangla ? 'সুপারিশকৃত' : 'Recommended',
                    desc: isBangla ? 'আচরণগত, সিস্টেম আর্কিটেকচার এবং টেকনিক্যাল গভীরতার পারফেক্ট সমন্বয়।' : 'Balanced mix of behavioral, system architecture, and domain technical depth.'
                  },
                  {
                    id: 'technical',
                    label: isBangla ? 'টেকনিক্যাল ডিপ-ডাইভ' : 'Technical Deep-Dive',
                    badge: isBangla ? 'হ্যান্ডস-অন' : 'Hands-on',
                    desc: isBangla ? 'প্রোডাকশন ট্রাবলশুটিং, আর্কিটেকচার ও ফ্রেমওয়ার্ক সমাধান।' : 'Production troubleshooting, code architecture, data consistency, and frameworks.'
                  },
                  {
                    id: 'behavioral',
                    label: isBangla ? 'আচরণগত ও STAR মেথড' : 'Behavioral & STAR',
                    badge: 'STAR Method',
                    desc: isBangla ? 'বিরোধ মীমাংসা, লিডারশিপ, স্টেকহোল্ডার কমিউনিকেশন ও সমঝোতা।' : 'Conflict resolution, leadership, stakeholder alignment, and trade-offs.'
                  },
                  {
                    id: 'system_design',
                    label: isBangla ? 'সিস্টেম ডিজাইন ও স্কেল' : 'System Design & Scale',
                    badge: isBangla ? 'আর্কিটেকচার' : 'Architecture',
                    desc: isBangla ? 'ক্যাশিং, লেটেন্সি, হাই-থ্রুপুট মাইক্রোসার্ভিসেস, কিউ এবং ডাটাবেজ।' : 'Caching, latency, high-throughput microservices, queues, and databases.'
                  },
                  {
                    id: 'culture_fit',
                    label: isBangla ? 'কালচার ফিট ও সফট স্কিল' : 'Culture & Soft Skills',
                    badge: isBangla ? 'মূল্যবোধ' : 'Values',
                    desc: isBangla ? 'যোগাযোগের স্বচ্ছতা, দ্রুত শেখার মানসিকতা ও দলীয় ভূমিকা।' : 'Communication clarity, fast-paced mindset, ownership, and team impact.'
                  }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoundType(r.id as InterviewRoundType)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      roundType === r.id
                        ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs">{r.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          roundType === r.id ? 'bg-emerald-200 text-emerald-900' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {r.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-snug">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seniority & Questions count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                  {isBangla ? 'প্রার্থীর অভিজ্ঞতা স্তর' : 'Candidate Seniority Level'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'junior', label: isBangla ? 'জুনিয়র' : 'Junior' },
                    { id: 'mid', label: isBangla ? 'মিড-লেভেল' : 'Mid-Level' },
                    { id: 'senior', label: isBangla ? 'সিনিয়র' : 'Senior' },
                    { id: 'lead', label: isBangla ? 'লিড/স্টাফ' : 'Lead/Staff' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id as any)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        experienceLevel === lvl.id
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                  {isBangla ? 'প্রশ্নের সংখ্যা' : 'Question Length'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 3, label: isBangla ? '৩টি প্রশ্ন' : '3 Questions', sub: isBangla ? '~১০ মিনিট' : '~10 min' },
                    { count: 4, label: isBangla ? '৪টি প্রশ্ন' : '4 Questions', sub: isBangla ? '~১৫ মিনিট' : '~15 min' },
                    { count: 6, label: isBangla ? '৬টি প্রশ্ন' : '6 Questions', sub: isBangla ? '~২৫ মিনিট' : '~25 min' }
                  ].map(len => (
                    <button
                      key={len.count}
                      type="button"
                      onClick={() => setQuestionCount(len.count)}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
                        questionCount === len.count
                          ? 'bg-neutral-900 text-white shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <div>{len.label}</div>
                      <div className="text-[10px] opacity-70">{len.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Voice Options Toggle */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    {isBangla ? 'এআই ভয়েস ইন্টারভিউয়ার (Text-to-Speech)' : 'AI Voice Interviewer (Text-to-Speech)'}
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    {isBangla 
                      ? 'বাস্তব ইন্টারভিউ কলের অভিজ্ঞতা দিতে প্রশ্নগুলো সরাসরি মুখে বলবে।' 
                      : 'The interviewer speaks questions aloud to simulate a real call.'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTTS}
                  onChange={(e) => setEnableTTS(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Microphone Readiness & Browser Permission Check */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    micTestStatus === 'granted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : micTestStatus === 'denied'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {micTestStatus === 'granted' ? <ShieldCheck className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                      <span>{isBangla ? 'মাইক্রোফোন ও অডিও পারমিশন চেক' : 'Microphone & Audio Readiness Check'}</span>
                      {micTestStatus === 'granted' && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                          {isBangla ? 'অনুমোদিত ও প্রস্তুত' : 'Ready & Allowed'}
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      {isBangla 
                        ? 'ইন্টারভিউ শুরু করার পূর্বে ব্রাউজারের মাইক্রোফোন অ্যাক্সেস যাচাই করে নিন।' 
                        : 'Verify browser microphone permission and hardware before beginning the interview.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestMicrophone}
                  disabled={micTestStatus === 'testing'}
                  className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Mic className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {micTestStatus === 'testing'
                      ? (isBangla ? 'যাচাই হচ্ছে...' : 'Testing...')
                      : (isBangla ? 'মাইক্রোফোন টেস্ট' : 'Test Microphone')}
                  </span>
                </button>
              </div>

              {micTestMsg && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  micTestStatus === 'granted'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{micTestMsg}</span>
                </div>
              )}
            </div>

            {planError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{planError}</span>
              </div>
            )}

            {/* Launch CTA */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={loadingPlan}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                {loadingPlan ? (
                  <>
                    <BrainCircuit className="w-4 h-4 animate-spin" />
                    <span>{isBangla ? 'এআই উপযুক্ত প্রশ্নসমূহ তৈরি করছে...' : 'AI is generating tailored questions...'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isBangla ? 'মক ইন্টারভিউ সিমুলেশন শুরু করুন' : 'Start Mock Interview Simulation'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Info Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Active Candidate Profile Banner */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-black text-sm">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{jobSeekerProfile?.fullName || user?.displayName || 'Job Seeker'}</h3>
                  <p className="text-xs text-neutral-500 truncate max-w-[200px]">{jobSeekerProfile?.headline || (isBangla ? 'প্রার্থী প্রোফাইল' : 'Active Candidate')}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  {isBangla ? 'প্রোফাইলে চিহ্নিত দক্ষতাসমূহ' : 'Recognized Skills in Profile'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(jobSeekerProfile?.skills || ['React', 'TypeScript', 'Node.js', 'System Design']).slice(0, 8).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-semibold rounded-md">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* How Evaluation Works */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-850 text-white rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>{isBangla ? 'এআই যেভাবে মূল্যায়ন করে (নির্দেশিকা):' : 'What the AI Evaluates:'}</span>
              </div>

              <div className="space-y-3 text-xs text-neutral-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-white">{isBangla ? 'স্পষ্টতা ও উপস্থাপনা:' : 'Clarity & Articulation:'}</strong>{' '}
                    {isBangla ? 'যৌক্তিক কাঠামো, সংক্ষেপণ ও অপ্রয়োজনীয় কথা এড়িয়ে স্পষ্ট কথা বলা।' : 'Logical structure, concise delivery, avoiding rambling.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-white">{isBangla ? 'আত্মবিশ্বাস ও ভয়েস টোন:' : 'Confidence & Tone:'}</strong>{' '}
                    {isBangla ? 'প্যাসিভ কথার বদলে নিজস্ব দায়িত্ব ও অবদানের দৃঢ় প্রকাশ ("আমি ডিজাইন করেছি")।' : 'Proactive ownership verbs ("I architected") vs passive language.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-white">{isBangla ? 'কিওয়ার্ড ও টেকনিক্যাল গভীরতা:' : 'Keyword & Tech Depth:'}</strong>{' '}
                    {isBangla ? 'চাকরির বর্ণনায় উল্লেখিত প্রয়োজনীয় আর্কিটেকচার ও ডোমেইন কিওয়ার্ডের সঠিক ব্যবহার।' : 'Spotting required architecture and domain keywords vs missed terms.'}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <strong className="text-white">{isBangla ? 'STAR ফ্রেমওয়ার্ক:' : 'STAR Framework:'}</strong>{' '}
                    {isBangla ? 'পরিস্থিতি (Situation), কাজ (Task), পদক্ষেপ (Action) এবং পরিমাপযোগ্য ফলাফল (Result) নিশ্চিতকরণ।' : 'Situation, Task, Action, and Quantified Result verification.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE QUESTION STATE (VOICE & INPUT)                                 */}
      {/* ========================================================================= */}
      {workflowState === 'active_question' && currentQ && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Progress Header */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-bold">
                {isBangla 
                  ? `প্রশ্ন ${currentQuestionIndex + 1} / ${questions.length}` 
                  : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
              </span>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                {currentQ.type} Round • {customCompany}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
              <div className="flex items-center gap-1.5 text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formatTime(questionTimer)}</span>
              </div>

              {enableTTS && (
                <button
                  onClick={() => isInterviewerSpeaking ? stopSpeaking() : speakQuestion(currentQ.question)}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 cursor-pointer font-bold"
                  title="Re-play question voice"
                >
                  {isInterviewerSpeaking ? (
                    <>
                      <VolumeX className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">{isBangla ? 'ভয়েস থামান' : 'Stop Voice'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>{isBangla ? 'প্রশ্ন শুনুন' : 'Hear Question'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Interviewer Question Box */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {customCompany.charAt(0)}
                </div>
                {isInterviewerSpeaking && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-neutral-900">
                    {isBangla ? 'নিয়োগ কমিটির প্রধান ইন্টারভিউয়ার' : 'Lead Hiring Committee Interviewer'}
                  </span>
                  <span className="text-xs text-neutral-400">•</span>
                  <span className="text-xs text-neutral-500">{customCompany}</span>
                  {isInterviewerSpeaking && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                      {isBangla ? 'কথা বলছেন...' : 'Speaking...'}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-base sm:text-lg font-bold text-neutral-900 leading-relaxed">
                  "{currentQ.question}"
                </p>

                {currentQ.interviewerContext && (
                  <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs text-neutral-600 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-neutral-800">{isBangla ? 'ইন্টারভিউয়ারের মূল উদ্দেশ্য:' : 'Interviewer Intent:'} </strong>
                      {currentQ.interviewerContext}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hint Dropdown */}
            {currentQ.sampleHints && currentQ.sampleHints.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {showHint 
                      ? (isBangla ? 'ইঙ্গিত লুকান' : 'Hide Hint') 
                      : (isBangla ? 'উত্তরের কাঠামোর উপর একটি ইঙ্গিত প্রয়োজন?' : 'Need a hint on how to structure your response?')}
                  </span>
                  {showHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showHint && (
                  <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    {currentQ.sampleHints.map((hint, i) => (
                      <p key={i} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{hint}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Candidate Answer Box */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-5">
            {/* Enhanced Speech error notification banner */}
            {speechErrorMsg && (
              <div className="p-4 bg-amber-50/95 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 shadow-sm space-y-3 animate-in fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-200/90 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <MicOff className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                        {isBangla ? 'মাইক্রোফোন অনুমতি প্রয়োজন (Microphone Access Needed)' : 'Microphone Permission Needed'}
                      </h4>
                      <p className="text-amber-900 mt-0.5 text-xs leading-relaxed">
                        {speechErrorMsg}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpeechErrorMsg(null)}
                    className="text-amber-700 hover:text-amber-950 font-bold p-1 rounded-lg hover:bg-amber-100 text-xs cursor-pointer shrink-0"
                    title={isBangla ? 'বার্তা বন্ধ করুন' : 'Dismiss'}
                  >
                    ✕
                  </button>
                </div>

                {/* 3 Step Browser Instructions */}
                <div className="bg-white/90 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-950 space-y-1.5">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isBangla ? 'ব্রাউজারে মাইক্রোফোন পারমিশন যেভাবে অনুমোদন করবেন:' : 'How to enable microphone in your browser address bar:'}</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-neutral-700">
                    <li>
                      {isBangla 
                        ? 'আপনার ব্রাউজার উইন্ডোর শীর্ষে অ্যাড্রেস বারের বাম পাশে অবস্থিত লক (🔒) অথবা টিউন/সাইট সেটিংস আইকনে ক্লিক করুন।' 
                        : 'Look at the top URL address bar and click the Lock (🔒) or Tune/Site settings icon.'}
                    </li>
                    <li>
                      {isBangla 
                        ? 'Microphone অপশনটি "Blocked" থেকে পরিবর্তন করে "Allow" (অনুমোদন) নির্বাচন করুন।' 
                        : 'Find Microphone and change it from "Blocked" to "Allow".'}
                    </li>
                    <li>
                      {isBangla 
                        ? 'এরপর নিচের "অনুমতি পুনরায় চেষ্টা করুন" বাটনে ক্লিক করুন।' 
                        : 'Click "Retry Microphone Access" below.'}
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isBangla ? 'অনুমতি পুনরায় চেষ্টা করুন' : 'Retry Microphone Access'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFocusAnswerBox}
                    className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span>✏️</span>
                    <span>{isBangla ? 'টাইপ করে উত্তর দিন' : 'Type Answer Instead'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswerText(currentQ.sampleExemplar || getSampleAnswer('star'));
                      setSpeechErrorMsg(null);
                      setSubmitError(null);
                      setTimeout(() => answerInputRef.current?.focus(), 100);
                    }}
                    className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isBangla ? 'নমুনা স্পোকেন উত্তর ইনপুট করুন' : 'Simulate Spoken Answer (STAR)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Validation submit error */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitError(null)}
                  className="text-red-700 hover:text-red-950 font-bold px-2 py-0.5 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <span>{isBangla ? 'আপনার মৌখিক বা লিখিত উত্তর' : 'Your Spoken or Typed Response'}</span>
                  {isRecording && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full animate-pulse flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      {isBangla ? 'ভয়েস রেকর্ড হচ্ছে...' : 'Recording Voice...'}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isBangla 
                    ? 'মাইক্রোফোনে স্বাভাবিকভাবে কথা বলুন অথবা নিচের বক্সে টাইপ করুন।' 
                    : 'Speak naturally into your microphone or type your response below.'}
                </p>
              </div>

              {/* Microphone & Voice Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {isRecording && (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                    <span className="w-1.5 h-3 bg-red-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-5 bg-red-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                    <span className="w-1.5 h-2.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    <span className="w-1.5 h-4 bg-red-600 rounded-full animate-bounce [animation-delay:0.45s]"></span>
                    <span className="ml-1 text-[11px] hidden sm:inline">{isBangla ? 'শোনা হচ্ছে...' : 'Listening...'}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setUserAnswerText(currentQ.sampleExemplar || getSampleAnswer('star'));
                    setSpeechErrorMsg(null);
                    setSubmitError(null);
                    setTimeout(() => answerInputRef.current?.focus(), 100);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300"
                  title={isBangla ? 'মাইক্রোফোন ছাড়া বাস্তবসম্মত স্পোকেন উত্তরের ড্রাফট বসান' : 'Load realistic spoken candidate response draft without microphone'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{isBangla ? 'নমুনা স্পোকেন ড্রাফট' : 'Simulate Spoken Answer'}</span>
                  <span className="sm:hidden">{isBangla ? 'নমুনা' : 'Sample'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100 animate-pulse'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>{isBangla ? 'রেকর্ডিং বন্ধ করুন' : 'Stop Recording'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-emerald-700" />
                      <span>{isBangla ? 'ভয়েস উত্তর দিন (বাংলা/ইংরেজি)' : 'Speak Answer (Voice Prep)'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Answer Textarea */}
            <div className="relative">
              <textarea
                ref={answerInputRef}
                rows={6}
                value={userAnswerText}
                onChange={(e) => {
                  setUserAnswerText(e.target.value);
                  if (submitError) setSubmitError(null);
                }}
                placeholder={isBangla 
                  ? 'কথা বলা শুরু করুন অথবা এখানে টাইপ করুন... (পরামর্শ: পরিস্থিতি, আপনার পদক্ষেপ এবং পরিমাপযোগ্য ফলাফল উল্লেখ করুন)' 
                  : 'Start speaking or type your response here... (Tip: Structure your thoughts: Situation, Action taken, and Measurable Result)'}
                className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm font-normal text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed placeholder:text-neutral-400"
              />

              <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {isBangla ? 'নমুনা ভয়েস উত্তর লোড:' : 'Quick Voice Prep Answers:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswerText(getSampleAnswer('star'));
                      if (submitError) setSubmitError(null);
                    }}
                    className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {isBangla ? 'STAR ইনসিডেন্ট' : 'STAR Method'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswerText(getSampleAnswer('tech'));
                      if (submitError) setSubmitError(null);
                    }}
                    className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {isBangla ? 'সিস্টেম ডিজাইন' : 'System Design'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswerText(getSampleAnswer('culture'));
                      if (submitError) setSubmitError(null);
                    }}
                    className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {isBangla ? 'টিম কালচার' : 'Team Culture'}
                  </button>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span>
                    {userAnswerText.trim() ? userAnswerText.trim().split(/\s+/).length : 0} {isBangla ? 'শব্দ' : 'words'}
                    {userAnswerText.trim() ? ` (~${Math.round(userAnswerText.trim().split(/\s+/).length / 2.2)}${isBangla ? ' সে.' : 's'})` : ''}
                  </span>

                  {userAnswerText.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserAnswerText('');
                        if (submitError) setSubmitError(null);
                      }}
                      className="text-[11px] text-neutral-400 hover:text-neutral-700 cursor-pointer font-medium"
                    >
                      {isBangla ? 'মুছুন' : 'Clear Text'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-neutral-400">
                {isBangla 
                  ? 'এআই আপনার উত্তর পর্যালোচনা করবে এবং সরাসরি স্কোর ও উন্নতির দিক নির্দেশনা দেবে।' 
                  : 'Advanced AI will evaluate your answer against technical criteria and provide instant coaching.'}
              </span>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || !userAnswerText.trim()}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <BrainCircuit className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{isBangla ? 'এআই মূল্যায়ন করছে...' : 'AI is evaluating your response...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isBangla ? 'মূল্যায়নের জন্য জমা দিন' : 'Submit for AI Evaluation'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REAL-TIME EVALUATION & CONSTRUCTIVE CRITIQUE SHEET                      */}
      {/* ========================================================================= */}
      {workflowState === 'evaluation' && currentEvaluation && currentQ && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Score Banner */}
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {isBangla ? `প্রশ্ন ${currentQuestionIndex + 1} মূল্যায়ন` : `Question ${currentQuestionIndex + 1} Evaluation`}
                </span>
                <span className="text-neutral-300">•</span>
                <span className="text-xs text-neutral-500">{customCompany}</span>
              </div>
              <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
                {isBangla ? 'রিয়েল-টাইম এআই কোচিং বিশ্লেষণ' : 'Real-Time AI Coaching Breakdown'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2.5 rounded-2xl border text-center shadow-xs ${
                currentEvaluation.score >= 85
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : currentEvaluation.score >= 70
                  ? 'bg-blue-50 border-blue-300 text-blue-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}>
                <span className="block text-2xl font-black">{currentEvaluation.score}<span className="text-xs font-normal">/100</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {currentEvaluation.score >= 85 
                    ? (isBangla ? 'দৃঢ় ও যথার্থ উত্তর' : 'Strong Answer') 
                    : currentEvaluation.score >= 70 
                    ? (isBangla ? 'ভালো সম্ভাবনা' : 'Good Potential') 
                    : (isBangla ? 'অনুশীলন প্রয়োজন' : 'Needs Practice')}
                </span>
              </div>
            </div>
          </div>

          {/* AI Voice Coaching Debrief Audio Player */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                isSpeaking && currentSpeakingType === 'evaluation' 
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-md' 
                  : 'bg-neutral-800 text-emerald-400'
              }`}>
                {isSpeaking && currentSpeakingType === 'evaluation' ? (
                  <Volume2 className="w-5 h-5 animate-pulse" />
                ) : (
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-emerald-400">
                    {isBangla ? 'এআই ভয়েস প্রতিক্রিয়া ও কোচিং ডিব্রিফ' : 'AI Spoken Response & Coaching Debrief'}
                  </span>
                  {isSpeaking && currentSpeakingType === 'evaluation' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {isBangla ? 'কথা বলছেন...' : 'Playing Speech...'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-300 mt-0.5">
                  {isBangla 
                    ? 'ইন্টারভিউয়ারের মূল্যায়ন, স্পষ্টতার বিশ্লেষণ ও উন্নতির পরামর্শ শুনুন।' 
                    : 'Listen to the AI interviewer voice debrief of your scores, delivery, and key areas for improvement.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {isSpeaking && currentSpeakingType === 'evaluation' ? (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>{isBangla ? 'ভয়েস থামান' : 'Stop Audio'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => speakEvaluationDebrief(currentEvaluation)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:shadow-emerald-900/20"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isBangla ? 'প্রতিক্রিয়া শুনুন (Play)' : 'Listen to Response'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Triple Metric Cards: Clarity, Confidence, Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Clarity */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  {isBangla ? 'স্পষ্টতা ও প্রবাহ' : 'Clarity & Flow'}
                </span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                  currentEvaluation.clarityScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {currentEvaluation.clarityScore}%
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {currentEvaluation.clarityFeedback}
              </p>
            </div>

            {/* 2. Confidence */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  {isBangla ? 'আত্মবিশ্বাস ও ভয়েস টোন' : 'Confidence & Tone'}
                </span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                  currentEvaluation.confidenceScore >= 80 ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {currentEvaluation.confidenceScore}%
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {currentEvaluation.confidenceFeedback}
              </p>
            </div>

            {/* 3. Keywords */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  {isBangla ? 'কিওয়ার্ড গভীরতা' : 'Keyword Depth'}
                </span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                  currentEvaluation.keywordScore >= 80 ? 'bg-purple-100 text-purple-800' : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {currentEvaluation.keywordScore}%
                </span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {isBangla 
                  ? `${currentEvaluation.keywordsUsed.length}টি টেকনিক্যাল কিওয়ার্ড শনাক্ত হয়েছে।` 
                  : `${currentEvaluation.keywordsUsed.length} domain keywords detected in your answer.`}
              </p>
            </div>
          </div>

          {/* Keywords Tagging Row */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              {isBangla ? 'টেকনিক্যাল ও ডোমেইন কিওয়ার্ড বিশ্লেষণ' : 'Technical & Domain Keywords Analysis'}
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
              <div className="flex-1 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 
                  {isBangla ? 'আপনি যে কিওয়ার্ডগুলো সঠিকভাবে উল্লেখ করেছেন:' : 'Keywords You Used Well:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentEvaluation.keywordsUsed.length > 0 ? (
                    currentEvaluation.keywordsUsed.map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold text-[11px]">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-neutral-400 text-xs italic">{isBangla ? 'কোনো নির্দিষ্ট টেকনিক্যাল কিওয়ার্ড শনাক্ত হয়নি' : 'No specific domain keywords detected'}</span>
                  )}
                </div>
              </div>

              {currentEvaluation.keywordsMissed.length > 0 && (
                <div className="flex-1 space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> 
                    {isBangla ? 'যেসব কিওয়ার্ড উল্লেখ করা ভালো হতো:' : 'Recommended Keywords to Mention:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentEvaluation.keywordsMissed.map((kw, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-semibold text-[11px]">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strengths & Constructive Critiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {isBangla ? 'আপনার উল্লেখযোগ্য শক্তিমত্তা' : 'Standout Strengths'}
              </h4>
              <ul className="space-y-2 text-xs text-neutral-700">
                {currentEvaluation.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                {isBangla ? 'উন্নতির পরামর্শ ও গঠনমূলক ফিডব্যাক' : 'Constructive Critiques & Enhancements'}
              </h4>
              <ul className="space-y-2 text-xs text-neutral-700">
                {currentEvaluation.critiques.map((crt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{crt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable High-Leverage Tip */}
          {currentEvaluation.actionableTip && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold text-purple-950 mb-0.5">
                  {isBangla ? 'কার্যকর ডেলিভারি টিপস:' : 'High-Impact Delivery Tip:'}
                </strong>
                {currentEvaluation.actionableTip}
              </div>
            </div>
          )}

          {/* Exemplar Model Answer Accordion */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs">
            <button
              type="button"
              onClick={() => setShowExemplar(!showExemplar)}
              className="w-full flex items-center justify-between text-xs font-bold text-neutral-900 cursor-pointer"
            >
              <div className="flex items-center gap-2 text-emerald-800">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>
                  {isBangla 
                    ? 'একজন সিনিয়র/স্টাফ ইঞ্জিনিয়ার যেভাবে উত্তর দিতেন (মডেল উত্তর)' 
                    : 'See How a Staff Engineer / Top 1% Candidate Would Answer'}
                </span>
              </div>
              {showExemplar ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>

            {showExemplar && (
              <div className="mt-4 pt-4 border-t border-neutral-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    {isBangla ? 'গোল্ড স্ট্যান্ডার্ড উত্তর স্ক্রিপ্ট:' : 'Gold Standard Answer Script:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeaking && currentSpeakingType === 'exemplar') {
                        stopSpeaking();
                      } else {
                        speakText(currentEvaluation.exemplarAnswer, 'exemplar');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {isSpeaking && currentSpeakingType === 'exemplar' ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-red-600">{isBangla ? 'ভয়েস থামান' : 'Stop Audio'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isBangla ? 'আদর্শ উত্তর শুনুন' : 'Hear Spoken Exemplar'}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-mono bg-neutral-50 p-4 rounded-xl border border-neutral-200/80">
                  {currentEvaluation.exemplarAnswer}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions: Retry or Proceed */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setWorkflowState('active_question');
              }}
              className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBangla ? 'পুনরায় উত্তর দিন' : 'Re-attempt This Question'}</span>
            </button>

            <button
              type="button"
              onClick={handleProceedNext}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>
                {currentQuestionIndex + 1 === questions.length 
                  ? (isBangla ? 'ইন্টারভিউ সমাপ্ত করুন ও পূর্ণাঙ্গ রিপোর্ট দেখুন →' : 'Complete Interview & View Final Debrief →')
                  : (isBangla ? 'পরবর্তী প্রশ্নে যান →' : 'Proceed to Next Question →')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FINAL REPORT & EXECUTIVE DEBRIEF                                      */}
      {/* ========================================================================= */}
      {workflowState === 'final_report' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {generatingReport ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center space-y-4 shadow-xs">
              <BrainCircuit className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900">
                {isBangla ? 'চূড়ান্ত এক্সিকিউটিভ ডিব্রিফ তৈরি হচ্ছে...' : 'Synthesizing Your Final Executive Debrief...'}
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {isBangla 
                  ? 'এআই সামগ্রিক স্পষ্টতা, আত্মবিশ্বাস, কিওয়ার্ড ঘনত্ব এবং নিয়োগের সুপারিশ গণনা করছে।' 
                  : 'The AI is calculating aggregate clarity, confidence, keyword density, and your hiring recommendation.'}
              </p>
            </div>
          ) : finalReport ? (
            <>
              {/* Executive Summary Hero Card */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-850 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>{isBangla ? 'মক ইন্টারভিউ সফলভাবে সম্পন্ন হয়েছে' : 'Mock Interview Completed Successfully'}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                      {customJobTitle} • {customCompany}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Round: {roundType.replace('_', ' ').toUpperCase()} • {answersHistory.length} {isBangla ? 'টি প্রশ্নের মূল্যায়ন' : 'Questions Evaluated'}
                    </p>
                  </div>

                  {/* Recommendation Badge */}
                  <div className="text-center sm:text-right">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                      finalReport.recommendation === 'strong_hire'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : finalReport.recommendation === 'hire'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : finalReport.recommendation === 'lean_hire'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {finalReport.recommendation.replace('_', ' ')}
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                      {finalReport.overallScore}<span className="text-sm font-normal text-neutral-400">/100</span>
                    </div>
                  </div>
                </div>

                {/* Readiness Assessment Quote */}
                <div className="p-4 bg-neutral-800/80 rounded-2xl border border-neutral-700/80 text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                  "{finalReport.readinessAssessment}"
                </div>

                {/* Aggregate Scores Ribbon */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50 text-center">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                      {isBangla ? 'স্পষ্টতা' : 'Clarity'}
                    </span>
                    <span className="text-lg font-extrabold text-emerald-400">{finalReport.averageClarity}%</span>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50 text-center">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                      {isBangla ? 'আত্মবিশ্বাস' : 'Confidence'}
                    </span>
                    <span className="text-lg font-extrabold text-blue-400">{finalReport.averageConfidence}%</span>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50 text-center">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                      {isBangla ? 'টেক কিওয়ার্ড' : 'Tech Keywords'}
                    </span>
                    <span className="text-lg font-extrabold text-purple-400">{finalReport.averageKeywordScore}%</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Action Plan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    {isBangla ? 'ইন্টারভিউয়ের প্রধান শক্তিমত্তা' : 'Top Performance Highlights'}
                  </h3>
                  <ul className="space-y-2.5 text-xs text-neutral-700">
                    {finalReport.topStrengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    {isBangla ? 'বাস্তব ইন্টারভিউয়ের আগে করণীয় পরিকল্পনা' : 'Action Items Before Live Interview'}
                  </h3>
                  <ul className="space-y-2.5 text-xs text-neutral-700">
                    {finalReport.actionPlan.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Accordion of All QA & Feedback */}
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  {isBangla ? 'প্রশ্নভিত্তিক বিস্তারিত পর্যালোচনা' : 'Detailed Question-by-Question Review'}
                </h3>

                <div className="space-y-3">
                  {answersHistory.map((item, idx) => (
                    <div key={idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">
                          {isBangla ? `প্রশ্ন ${idx + 1}:` : `Q${idx + 1}:`} {item.question.question}
                        </span>
                        <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded font-bold">
                          {item.evaluation.score}/100
                        </span>
                      </div>

                      <div className="text-neutral-600 italic bg-white p-3 rounded-xl border border-neutral-100">
                        "{item.userAnswer}"
                      </div>

                      <div className="text-emerald-800 font-medium">
                        ✨ {isBangla ? 'টিপস:' : 'Tip:'} {item.evaluation.actionableTip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>
                    {copiedReport 
                      ? (isBangla ? 'রিপোর্ট ক্লিপবোর্ডে কপি হয়েছে!' : 'Report Copied to Clipboard!') 
                      : (isBangla ? 'সম্পূর্ণ রিপোর্ট কপি করুন' : 'Copy Summary Report')}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWorkflowState('setup');
                    }}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{isBangla ? 'অন্য একটি পদের জন্য অনুশীলন করুন' : 'Practice Another Role or Round'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PAST SESSIONS HISTORY                                                  */}
      {/* ========================================================================= */}
      {workflowState === 'history' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Past Mock Interview Sessions</h2>
              <p className="text-xs text-neutral-500">Track your confidence and performance growth across mock rounds.</p>
            </div>

            <button
              onClick={() => setWorkflowState('setup')}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              + Start New Practice
            </button>
          </div>

          {sessionHistory.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center text-neutral-400 space-y-3 shadow-xs">
              <History className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-sm">No past sessions recorded yet</h3>
              <p className="text-xs text-neutral-500">
                Complete your first mock interview simulation to view historical trends here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessionHistory.map(session => (
                <div key={session.id} className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900">{session.jobTitle}</span>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="text-xs font-semibold text-neutral-600">{session.companyName}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {session.questionsCount} Questions • {session.roundType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        session.report.overallScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {session.report.overallScore}/100 Score
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 italic bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    "{session.report.readinessAssessment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
