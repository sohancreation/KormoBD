import React, { useState, useRef, useEffect } from 'react';
import { askCareerAssistant } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, 
  Send, 
  X, 
  MessageSquare, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  HelpCircle,
  Briefcase,
  FileText,
  Globe
} from 'lucide-react';

export const CareerChatbot: React.FC = () => {
  const { userProfile, jobSeekerProfile } = useAuth();
  const { language, setLanguage, isBangla, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const getInitialGreeting = (lang: 'en' | 'bn') => {
    return lang === 'bn'
      ? 'হ্যালো! আমি আপনার এআই ক্যারিয়ার সহকারী। বাংলাদেশের চাকরির বাজার, বেতন কাঠামো, সিভি তৈরির পরামর্শ এবং ইন্টারভিউ প্রস্তুতির বিষয়ে যেকোনো প্রশ্ন আমাকে করতে পারেন। আজ আপনাকে কীভাবে সাহায্য করতে পারি?'
      : 'Hello! I am your AI Career Assistant. Grounded with live Google Search data, I can provide up-to-date salary trends in Bangladesh, active company hiring signals, resume guidance, or application help. What can I look up for you today?';
  };

  const [messages, setMessages] = useState<Array<{ 
    role: 'user' | 'model'; 
    text: string;
    sources?: Array<{ title: string; uri: string }>;
  }>>([
    {
      role: 'model',
      text: getInitialGreeting(language)
    }
  ]);

  // If language changes externally, update or append a polite localized indicator if chat is fresh
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
      setMessages([{ role: 'model', text: getInitialGreeting(language) }]);
    }
  }, [language]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !minimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, minimized]);

  const handleSend = async (messageText?: string) => {
    const query = messageText || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const response = await askCareerAssistant({
        message: query,
        history: messages.map(m => ({ role: m.role, text: m.text })),
        language: isBangla ? 'bn' : 'en',
        userContext: {
          name: jobSeekerProfile?.fullName || userProfile?.displayName,
          role: userProfile?.role,
          skills: jobSeekerProfile?.skills
        }
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text,
        sources: response.sources 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: isBangla 
            ? 'সাময়িক ত্রুটির কারণে উত্তরটি তৈরি করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
            : 'I ran into a temporary issue retrieving live web data. Please feel free to ask again!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const englishQuestions = [
    'What is the average software engineer salary in Dhaka?',
    'What skills are most in demand in Bangladesh tech hubs?',
    'How do I tailor my resume for automated recruiter screening?',
    'How can I prepare for behavioral STAR interview questions?'
  ];

  const banglaQuestions = [
    'ঢাকায় সফটওয়্যার ইঞ্জিনিয়ারদের বর্তমান বেতন কত?',
    'বাংলাদেশের শীর্ষ আইটি কোম্পানিতে কোন স্কিলগুলো সবচেয়ে বেশি চাওয়া হচ্ছে?',
    'কর্মো বিডিতে সিভি স্কোর ও শর্টলিস্টিং কীভাবে কাজ করে?',
    'ইন্টারভিউয়ে STAR পদ্ধতি কীভাবে ব্যবহার করব?'
  ];

  const suggestedQuestions = isBangla ? banglaQuestions : englishQuestions;

  return (
    <div className="fixed bottom-20 right-3.5 sm:bottom-5 sm:right-5 z-40">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setMinimized(false);
          }}
          className="group flex items-center gap-2 sm:gap-2.5 p-3 sm:px-4 sm:py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer border border-neutral-700 min-h-[48px]"
          aria-label="Open AI Career Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <span className="hidden sm:inline text-xs font-semibold tracking-wide">
            {isBangla ? 'এআই ক্যারিয়ার সহকারী' : 'Career AI Assistant'}
          </span>
          <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
            {isBangla ? 'বাংলা' : 'EN'}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col transition-all duration-200 ${
            minimized 
              ? 'w-72 sm:w-80 h-14' 
              : 'w-[calc(100vw-1.75rem)] max-w-sm sm:w-96 h-[500px] sm:h-[540px] max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-neutral-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-none">
                  {isBangla ? 'এআই ক্যারিয়ার সহকারী' : 'Career Assistant'}
                </h3>
                <span className="text-[10px] text-emerald-400 font-medium">
                  {isBangla ? 'সক্রিয় • এআই চালিত' : 'Online • AI Powered'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switcher Pill */}
              <div className="flex items-center bg-neutral-800 rounded-md p-0.5 border border-neutral-700 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-neutral-600 text-white font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    language === 'bn'
                      ? 'bg-emerald-600 text-white font-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="বাংলায় কথা বলুন"
                >
                  বাং
                </button>
              </div>

              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white cursor-pointer"
              >
                {minimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!minimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-neutral-50/50">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-white border border-neutral-200 text-neutral-800 shadow-xs rounded-bl-xs whitespace-pre-line'
                      }`}
                    >
                      {m.text}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-neutral-100 text-[10px] space-y-1">
                          <span className="font-semibold text-neutral-500 block">
                            {isBangla ? 'গুগল সার্চ রেফারেন্স:' : 'Google Search Sources:'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.sources.map((s, si) => (
                              <a
                                key={si}
                                href={s.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-emerald-700 rounded truncate max-w-[180px] inline-block"
                              >
                                {s.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-neutral-200 text-neutral-500 rounded-2xl px-3 py-2 flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[11px] text-neutral-400 font-medium ml-1">
                        {isBangla ? 'উত্তর তৈরি হচ্ছে...' : 'AI analyzing...'}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 bg-white border-t border-neutral-100 flex gap-1.5 overflow-x-auto text-[11px]">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="whitespace-nowrap px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full cursor-pointer shrink-0 transition-colors border border-neutral-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-neutral-200">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder={
                      isBangla 
                        ? 'চাকরি, বেতন, সিভি বা ইন্টারভিউ সম্পর্কে প্রশ্ন করুন...' 
                        : 'Ask about careers, applications, resume...'
                    }
                    className="flex-1 p-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

