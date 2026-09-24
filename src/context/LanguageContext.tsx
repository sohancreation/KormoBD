import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'bn';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  isBangla: boolean;
  t: (key: string, fallback?: string) => string;
}

const UI_DICTIONARY: Record<string, { en: string; bn: string }> = {
  // Navigation & Branding
  'nav.brand_sub': { en: 'Modern Talent Hub', bn: 'আধুনিক ক্যারিয়ার প্ল্যাটফর্ম' },
  'nav.jobs': { en: 'Explore Jobs', bn: 'চাকরি খুঁজুন' },
  'nav.companies': { en: 'Companies', bn: 'কোম্পানিসমূহ' },
  'nav.market': { en: 'Market Research', bn: 'মার্কেট ইনসাইটস' },
  'nav.dashboard': { en: 'My Dashboard', bn: 'আমার ড্যাশবোর্ড' },
  'nav.skills_gap': { en: 'Skills Gap', bn: 'স্কিল গ্যাপ অ্যানালাইসিস' },
  'nav.mock_interview': { en: 'AI Mock Interview', bn: 'এআই মক ইন্টারভিউ' },
  'nav.applications': { en: 'Applications', bn: 'আবেদনসমূহ' },
  'nav.saved_jobs': { en: 'Saved Jobs', bn: 'সংরক্ষিত চাকরি' },
  'nav.resume_builder': { en: 'AI Resume Parser', bn: 'এআই সিভি পার্সার' },
  'nav.recruiter_hub': { en: 'Recruiter Hub', bn: 'নিয়োগকারী হাব' },
  'nav.post_job': { en: 'Post a Job', bn: 'নতুন চাকরি পোস্ট' },
  'nav.moderation': { en: 'Moderation Panel', bn: 'মডারেশন প্যানেল' },
  'nav.notifications': { en: 'Notifications', bn: 'নোটিফিকেশন' },
  'nav.profile': { en: 'My Profile & Resume', bn: 'আমার প্রোফাইল ও সিভি' },
  'nav.logout': { en: 'Sign Out', bn: 'লগ আউট' },
  'nav.login': { en: 'Sign In', bn: 'লগ ইন' },
  'nav.signup': { en: 'Create Account', bn: 'অ্যাকাউন্ট তৈরি' },

  // Job Listing & Discovery
  'job.search_placeholder': { en: 'Search job title, tech stack, or keyword...', bn: 'চাকরির পদবি, প্রযুক্তি বা কিওয়ার্ড দিয়ে খুঁজুন...' },
  'job.location_placeholder': { en: 'City, division or area...', bn: 'শহর, বিভাগ বা এলাকা...' },
  'job.all_locations': { en: 'All Locations (Bangladesh)', bn: 'সকল স্থান (বাংলাদেশ)' },
  'job.all_departments': { en: 'All Departments', bn: 'সকল বিভাগ' },
  'job.all_types': { en: 'All Job Types', bn: 'সকল চাকরির ধরন' },
  'job.salary_range': { en: 'Monthly Salary Range (BDT)', bn: 'মাসিক বেতন সীমা (টাকা)' },
  'job.apply_now': { en: 'Apply Now', bn: 'আবেদন করুন' },
  'job.applied': { en: 'Applied', bn: 'আবেদন সম্পন্ন' },
  'job.view_details': { en: 'View Details', bn: 'বিস্তারিত দেখুন' },
  'job.match_score': { en: 'Match', bn: 'ম্যাচ' },
  'job.monthly_salary': { en: 'Monthly Salary', bn: 'মাসিক বেতন' },
  'job.deadline': { en: 'Deadline', bn: 'আবেদনের শেষ তারিখ' },
  'job.workplace': { en: 'Workplace & Type', bn: 'কাজের ধরন ও স্থান' },
  'job.location': { en: 'Location', bn: 'কর্মস্থল' },
  'job.responsibilities': { en: 'Key Responsibilities', bn: 'প্রধান দায়িত্বসমূহ' },
  'job.requirements': { en: 'Requirements & Qualifications', bn: 'প্রয়োজনীয় যোগ্যতা ও অভিজ্ঞতা' },
  'job.benefits': { en: 'Perks & Benefits', bn: 'সুযোগ-সুবিধা ও সুবিধাদি' },
  'job.translate_to_bn': { en: 'Translate to বাংলা', bn: 'ইংরেজিতে দেখুন' },
  'job.translating': { en: 'Translating with AI...', bn: 'বাংলায় রূপান্তর করা হচ্ছে...' },
  'job.translated_badge': { en: 'Bangla Translation Active', bn: 'বাংলা সংস্করণ প্রদর্শিত হচ্ছে' },
  'job.share': { en: 'Share Listing', bn: 'শেয়ার করুন' },
  'job.save': { en: 'Save Job', bn: 'সংরক্ষণ করুন' },
  'job.saved': { en: 'Saved', bn: 'সংরক্ষিত' },
  'job.start_mock': { en: 'Practice Mock Interview for this Job', bn: 'এই চাকরির জন্য এআই মক ইন্টারভিউ দিন' },

  // Chatbot
  'chat.title': { en: 'Career Assistant', bn: 'ক্যারিয়ার সহকারী' },
  'chat.subtitle': { en: 'Online • AI Powered', bn: 'সক্রিয় • এআই চালিত' },
  'chat.welcome': { 
    en: 'Hello! I am your AI Career Assistant. Grounded with live Bangladesh market data, I can assist you with salary benchmarks, resume tips, interview prep, or navigating jobs. How can I help you today?', 
    bn: 'হ্যালো! আমি আপনার এআই ক্যারিয়ার সহকারী। বাংলাদেশের চাকরির বাজার, বেতন কাঠামো, সিভি তৈরির পরামর্শ এবং ইন্টারভিউ প্রস্তুতির বিষয়ে যেকোনো প্রশ্ন আমাকে করতে পারেন। আজ আপনাকে কীভাবে সাহায্য করতে পারি?' 
  },
  'chat.placeholder': { en: 'Ask about careers, applications, resume in English or বাংলা...', bn: 'চাকরি, বেতন, সিভি বা ইন্টারভিউ সম্পর্কে যেকোনো প্রশ্ন লিখুন...' },
  'chat.send': { en: 'Send', bn: 'পাঠান' },
  'chat.suggested_title': { en: 'Popular Questions:', bn: 'জনপ্রিয় প্রশ্নসমূহ:' },
  'chat.lang_toggle': { en: 'বাংলায় কথা বলুন', bn: 'Switch to English' },

  // Interview Simulator
  'interview.title': { en: 'AI Mock Interview Simulator & Voice Prep', bn: 'এআই মক ইন্টারভিউ সিমুলেটর ও ভয়েস প্রস্তুতি' },
  'interview.subtitle': { 
    en: 'Real-time role-tailored technical & behavioral interviews with instant speech evaluation and scoring powered by Advanced AI.', 
    bn: 'অ্যাডভান্সড এআই চালিত রিয়েল-টাইম রোল-ভিত্তিক টেকনিক্যাল ও আচরণগত ইন্টারভিউ এবং তাৎক্ষণিক ভয়েস অ্যানালাইসিস।' 
  },
  'interview.instructions_heading': { en: 'Interview Instructions & Guidelines', bn: 'ইন্টারভিউ নির্দেশনা ও নিয়মাবলী' },
  'interview.instruction_1': { 
    en: 'Ensure a quiet environment and verify your microphone permissions before beginning.', 
    bn: 'ইন্টারভিউ শুরুর পূর্বে শান্ত পরিবেশ নিশ্চিত করুন এবং মাইক্রোফোনের অনুমতি সক্রিয় করুন।' 
  },
  'interview.instruction_2': { 
    en: 'Listen to or read each question carefully. You may replay the audio at any time.', 
    bn: 'প্রতিটি প্রশ্ন মনোযোগ দিয়ে শুনুন বা পড়ুন। প্রয়োজনে অডিওটি পুনরায় শুনতে পারেন।' 
  },
  'interview.instruction_3': { 
    en: 'Speak or type your answer clearly. Structure answers using the STAR method for behavioral questions.', 
    bn: 'আপনার উত্তর মুখে স্পষ্টভাবে বলুন বা টাইপ করুন। আচরণগত প্রশ্নের ক্ষেত্রে STAR পদ্ধতি ব্যবহার করুন।' 
  },
  'interview.instruction_4': { 
    en: 'The AI evaluates clarity, confidence, domain keyword density, and architectural depth instantly.', 
    bn: 'এআই আপনার উত্তরের স্পষ্টতা, আত্মবিশ্বাস, প্রাসঙ্গিক কিওয়ার্ড এবং গভীরতা তাৎক্ষণিকভাবে মূল্যায়ন করবে।' 
  },
  'interview.start_btn': { en: 'Start Interview Session', bn: 'ইন্টারভিউ পর্ব শুরু করুন' },
  'interview.speak_btn': { en: 'Speak Answer (Mic)', bn: 'মুখে বলুন (মাইক্রোফোন)' },
  'interview.stop_btn': { en: 'Stop Recording', bn: 'রেকর্ডিং বন্ধ করুন' },
  'interview.submit_btn': { en: 'Submit Answer for AI Evaluation', bn: 'মূল্যায়নের জন্য উত্তর জমা দিন' },
  'interview.next_btn': { en: 'Next Question', bn: 'পরবর্তী প্রশ্ন' },
  'interview.view_report_btn': { en: 'Generate Final Debrief Report', bn: 'চূড়ান্ত মূল্যায়ন রিপোর্ট দেখুন' },
  'interview.clarity': { en: 'Clarity & Articulation', bn: 'স্পষ্টতা ও উপস্থাপন' },
  'interview.confidence': { en: 'Confidence & Delivery', bn: 'আত্মবিশ্বাস ও দৃঢ়তা' },
  'interview.keywords': { en: 'Domain Keywords', bn: 'প্রাসঙ্গিক কিওয়ার্ড' },
  'interview.overall_score': { en: 'Overall Answer Score', bn: 'সামগ্রিক স্কোর' },
  'interview.strengths': { en: 'Identified Strengths', bn: 'উত্তরের শক্তিশালী দিকসমূহ' },
  'interview.critiques': { en: 'Constructive Critiques', bn: 'উন্নতির ক্ষেত্রসমূহ' },
  'interview.exemplar': { en: 'Exemplar Gold-Standard Answer', bn: 'আদর্শ মানসম্মত উত্তর (Exemplar)' },
  'interview.actionable_tip': { en: 'Actionable Interview Tip', bn: 'কার্যকর ইন্টারভিউ টিপ' },
  'interview.language_toggle_label': { en: 'Interview Language:', bn: 'ইন্টারভিউয়ের ভাষা:' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('kormobd_language');
      return (saved === 'bn' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kormobd_language', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'bn' : 'en');
  };

  const t = (key: string, fallback?: string): string => {
    const item = UI_DICTIONARY[key];
    if (item) {
      return language === 'bn' ? item.bn : item.en;
    }
    return fallback || key;
  };

  const isBangla = language === 'bn';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, isBangla, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
