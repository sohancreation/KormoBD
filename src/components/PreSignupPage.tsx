import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Users, 
  Building2, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Star, 
  FileCheck2, 
  Layers,
  Zap,
  User,
  Check
} from 'lucide-react';
import { UserRole } from '../types';

interface PreSignupPageProps {
  onOpenAuth: (mode?: 'login' | 'signup' | 'instant', role?: UserRole) => void;
  onDemoLogin: (role: UserRole) => void;
  onInstantLogin?: (role: UserRole, customName?: string) => void;
}

export const PreSignupPage: React.FC<PreSignupPageProps> = ({
  onOpenAuth,
  onDemoLogin,
  onInstantLogin
}) => {
  const [activeTab, setActiveTab] = useState<'jobseeker' | 'recruiter'>('jobseeker');
  const [customName, setCustomName] = useState('');

  const handleLaunch = (role: UserRole, name?: string) => {
    if (onInstantLogin) {
      onInstantLogin(role, name || customName);
    } else {
      onDemoLogin(role);
    }
  };

  const platformFeatures = [
    {
      title: 'AI Skills Gap Analysis',
      tag: 'Job Seeker Suite',
      description: 'Upload your resume and compare your skills against bookmarked jobs with AI to identify missing qualifications.',
      icon: Sparkles,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
      role: 'jobseeker' as UserRole
    },
    {
      title: 'Drag & Drop Interview Scheduler',
      tag: 'Recruiter Suite',
      description: 'Interactive calendar scheduler with real-time slot conflict prevention, Google Meet links, and status sync.',
      icon: Calendar,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400',
      role: 'recruiter' as UserRole
    },
    {
      title: 'Candidate Benchmark Matrix',
      tag: 'Recruiter Suite',
      description: 'Side-by-side multi-candidate comparison table factoring in post-interview ratings and AI screening scores.',
      icon: Layers,
      color: 'from-purple-500/20 to-violet-500/10 text-purple-400',
      role: 'recruiter' as UserRole
    },
    {
      title: 'ATS Resume Builder & Parser',
      tag: 'Job Seeker Suite',
      description: 'AI-assisted resume structuring that extracts your experience and formats it for modern enterprise ATS algorithms.',
      icon: FileCheck2,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
      role: 'jobseeker' as UserRole
    },
    {
      title: 'Live Application Tracker Pipeline',
      tag: 'Universal Tool',
      description: 'Transparent stage-by-stage tracking with interviewer qualitative debrief notes and salary offer negotiation.',
      icon: TrendingUp,
      color: 'from-pink-500/20 to-rose-500/10 text-pink-400',
      role: 'jobseeker' as UserRole
    },
    {
      title: 'Post-Interview 5-Star Feedback',
      tag: 'Recruiter Suite',
      description: 'Recruiters submit qualitative notes and 5-dimension ratings that automatically update candidate rankings.',
      icon: Star,
      color: 'from-yellow-500/20 to-amber-500/10 text-amber-400',
      role: 'recruiter' as UserRole
    }
  ];

  const hiringCompanies = [
    { name: 'Pathao', sector: 'Ride-Hailing & Logistics', roles: '14 Openings' },
    { name: 'bKash Limited', sector: 'Fintech & MFS', roles: '22 Openings' },
    { name: 'Brain Station 23', sector: 'Enterprise Software', roles: '18 Openings' },
    { name: 'Chaldal', sector: 'E-commerce & Grocery', roles: '9 Openings' },
    { name: 'ShopUp', sector: 'B2B Commerce & Credit', roles: '11 Openings' },
    { name: 'Optimizely BD', sector: 'MarTech SaaS', roles: '6 Openings' }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white selection:bg-emerald-500 selection:text-neutral-950 font-sans">
      {/* Top Banner Notice: Open Access */}
      <div className="bg-emerald-500/15 border-b border-emerald-500/30 py-2.5 px-4 text-center text-xs font-semibold text-emerald-300 flex flex-wrap items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>⚡ Open Access Platform: Anyone can sign up and use this immediately. No authentication or password needed!</span>
        <button
          onClick={() => handleLaunch('jobseeker')}
          className="ml-2 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-[11px] cursor-pointer transition-colors shadow-sm"
        >
          1-Click Instant Enter →
        </button>
      </div>

      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-neutral-950 flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/20">
                K
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
                  Kormo <span className="text-emerald-400">BD</span>
                </span>
                <span className="text-[9px] block text-neutral-400 uppercase tracking-widest font-semibold -mt-1">
                  Bangladesh Talent Network
                </span>
              </div>
            </div>

            {/* Instant Launch Buttons in Header */}
            <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-neutral-800 gap-2 text-xs">
              <span className="text-[11px] font-semibold text-neutral-400">1-Click Launch:</span>
              <button
                onClick={() => handleLaunch('jobseeker')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Users className="w-3.5 h-3.5" /> Job Seeker
              </button>
              <button
                onClick={() => handleLaunch('recruiter')}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-blue-500/30 text-blue-400 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5" /> Recruiter
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle variant="compact" />
            <button
              onClick={() => handleLaunch('jobseeker')}
              className="px-3.5 py-1.5 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/40 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Access</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup', 'jobseeker')}
              className="px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 border-b border-neutral-800">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Category Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/80 text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Recruitment & Career Acceleration Platform — No Barriers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
            Connect Talent to Opportunity with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              Zero Friction
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Anyone can explore jobs, prepare resumes with AI, take mock interviews, or hire top talent across Bangladesh. Start using everything in seconds without needing passwords or verification.
          </p>

          {/* Quick Instant Entry Box */}
          <div className="mt-8 p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/90 max-w-2xl mx-auto shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>1-Click Instant Workspace Launch:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleLaunch('jobseeker')}
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Users className="w-3.5 h-3.5" /> Start as Job Seeker
                </button>
                <button
                  onClick={() => handleLaunch('recruiter')}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Building2 className="w-3.5 h-3.5" /> Start as Recruiter
                </button>
              </div>
            </div>

            {/* Quick Name Field */}
            <div className="mt-3 pt-3 border-t border-neutral-700/60 flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Want your name on the workspace? Enter here (e.g. Asif Rahman)"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                onClick={() => handleLaunch('jobseeker', customName)}
                className="w-full sm:w-auto px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Go with Name →
              </button>
            </div>
          </div>

          {/* Dual Entry Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12 text-left">
            {/* 1. Job Seeker Card */}
            <div className="p-8 rounded-3xl bg-neutral-800/50 border border-neutral-700 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    For Job Seekers
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Land High-Impact Roles Faster
                  </h3>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Analyze your skills gap against live job requirements, generate ATS-proof resumes with AI, and practice voice mock interviews tailored for Bangladesh tech jobs.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>AI Skills Gap Analyzer for bookmarked jobs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Interactive AI Voice Mock Interview simulator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Live application status tracking & salary benchmarks</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8 space-y-2">
                <button
                  onClick={() => handleLaunch('jobseeker')}
                  className="w-full py-3.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform group-hover:scale-[1.01] cursor-pointer"
                >
                  <Zap className="w-4 h-4" /> Start Immediately as Job Seeker <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <button
                    onClick={() => onOpenAuth('signup', 'jobseeker')}
                    className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Or create custom account with email →
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Recruiter / Employer Card */}
            <div className="p-8 rounded-3xl bg-neutral-800/50 border border-neutral-700 hover:border-blue-500/50 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    For Employers & Recruiters
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Hire Top Talent in Record Time
                  </h3>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Automate resume screening, coordinate interviews via drag-and-drop calendar, benchmark applicants in comparison matrices, and record 5-star post-interview evaluations.
                </p>

                <ul className="space-y-2 pt-2 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Intelligent AI screening & objective candidate rankings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Drag-and-drop interview calendar with conflict detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Post-interview feedback form & multi-candidate matrix</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8 space-y-2">
                <button
                  onClick={() => handleLaunch('recruiter')}
                  className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform group-hover:scale-[1.01] cursor-pointer"
                >
                  <Zap className="w-4 h-4" /> Start Immediately as Recruiter <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <button
                    onClick={() => onOpenAuth('signup', 'recruiter')}
                    className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Or create custom account with email →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase (Instant Launch with 1 Click) */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-neutral-800 text-emerald-400 border border-neutral-700 text-xs font-semibold inline-flex items-center gap-1.5 mb-3">
              <Zap className="w-3 h-3 text-amber-400" /> 100% Free & Open Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Every Feature Built for Maximum Productivity
            </h2>
            <p className="mt-3 text-neutral-400 text-sm">
              Click any tool below to launch into it instantly with zero authentication friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleLaunch(feat.role)}
                  className="relative group p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-850 transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" /> Instant Access
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                        {feat.tag}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                        {feat.title}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-6 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Launch Tool (1-Click)</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Comparison */}
      <section className="py-20 bg-neutral-900/90 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-white">
              Two Dedicated Environments, One Unified Network
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Select your perspective to see what you get upon launching.
            </p>

            {/* Toggle Tabs */}
            <div className="inline-flex p-1.5 rounded-2xl bg-neutral-800 border border-neutral-700 mt-6">
              <button
                onClick={() => setActiveTab('jobseeker')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'jobseeker'
                    ? 'bg-emerald-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" /> I am a Job Seeker
              </button>
              <button
                onClick={() => setActiveTab('recruiter')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'recruiter'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" /> I am an Employer / Recruiter
              </button>
            </div>
          </div>

          {activeTab === 'jobseeker' ? (
            <div className="p-8 rounded-3xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Job Seeker Workspace
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Everything you need to navigate the modern tech & corporate market
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your workspace gives you 1-click access to curated job matches, AI skill gap breakdowns, resume parsing tools, voice mock interviews, and direct applications.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">1</div>
                    <span>Instant matching algorithm based on your exact verified skills</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">2</div>
                    <span>Skills gap report identifies missing qualifications before you apply</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">3</div>
                    <span>Mock interview simulator with instant AI feedback</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleLaunch('jobseeker')}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Zap className="w-4 h-4" /> Enter Job Seeker Workspace (1-Click)
                  </button>
                </div>
              </div>

              {/* Visual preview box */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Seeker Portal Live
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                    Open Access
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-white">
                    <span>Full-Stack Engineer</span>
                    <span className="text-emerald-400">৳ 95,000 / mo</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Pathao • Gulshan-2, Dhaka</p>
                  <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-950/60 p-1.5 rounded border border-emerald-900/60">
                    ✓ Skills Gap: 92% match. Ready to apply with 1 click.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-white">
                    <span>Product Designer</span>
                    <span className="text-emerald-400">৳ 80,000 / mo</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">bKash Limited • Dhaka</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Recruiter Command Center
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Enterprise-grade hiring automation tailored for high-volume teams
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Access your recruitment dashboard with calendar scheduling, candidate comparison matrices, batch resume screening, and post-interview 5-star scoring.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-neutral-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">1</div>
                    <span>Post jobs with AI-generated descriptions & screening questions</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">2</div>
                    <span>Drag & drop interview slot calendar with meeting link generation</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">3</div>
                    <span>Post-interview evaluations that dynamically adjust ranking scores</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => handleLaunch('recruiter')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Zap className="w-4 h-4" /> Enter Recruiter Workspace (1-Click)
                  </button>
                </div>
              </div>

              {/* Visual preview box */}
              <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Recruiter Pipeline
                  </span>
                  <span className="text-[10px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded">
                    Command Mode
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-white">
                    <span>Tanvir Ahmed</span>
                    <span className="text-emerald-400 font-bold">★ 94% Rank</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">Senior React Engineer • 5+ Yrs</p>
                  <span className="inline-block mt-1 text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    ★ 4.8 / 5.0 Post-Interview Rating (Strong Hire)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-white">
                    <span>Nusrat Jahan</span>
                    <span className="text-emerald-400 font-bold">★ 88% Rank</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">UI/UX Lead • 4 Yrs</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 bg-neutral-950 border-b border-neutral-800 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-bold mb-8">
            Trusted by hiring leaders at Bangladesh's premier companies
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {hiringCompanies.map((comp, idx) => (
              <div
                key={idx}
                onClick={() => handleLaunch('jobseeker')}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 transition-colors cursor-pointer text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-800 group-hover:bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm mb-2 transition-colors">
                  {comp.name[0]}
                </div>
                <h4 className="font-bold text-xs text-white truncate group-hover:text-emerald-400 transition-colors">{comp.name}</h4>
                <p className="text-[10px] text-neutral-500 truncate">{comp.sector}</p>
                <span className="inline-block text-[10px] text-emerald-400 font-semibold mt-1">
                  {comp.roles}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Bar */}
      <section className="py-16 bg-gradient-to-b from-neutral-900 to-neutral-950 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white">
            Ready to Experience Next-Gen Recruitment?
          </h2>
          <p className="mt-3 text-sm text-neutral-400">
            Zero authentication barriers. Start exploring now with 1 click.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleLaunch('jobseeker')}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-2xl text-xs transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Instant Job Seeker Access
            </button>
            <button
              onClick={() => handleLaunch('recruiter')}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Instant Recruiter Access
            </button>
          </div>
          <p className="mt-4 text-[11px] text-neutral-500">
            Open access • AI-powered • Ready to use in 1 click
          </p>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="border-t border-neutral-800 py-8 bg-neutral-950 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500 text-neutral-950 flex items-center justify-center font-black text-xs">
              K
            </div>
            <span className="font-bold text-neutral-300">Kormo BD</span>
            <span>• Dhaka, Bangladesh</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleLaunch('jobseeker')} className="hover:text-emerald-400 cursor-pointer">
              Job Seeker Portal
            </button>
            <button onClick={() => handleLaunch('recruiter')} className="hover:text-blue-400 cursor-pointer">
              Recruiter Portal
            </button>
            <button onClick={() => onOpenAuth('signup')} className="hover:text-neutral-300 cursor-pointer">
              Sign Up
            </button>
            <button onClick={() => onOpenAuth('login')} className="hover:text-neutral-300 cursor-pointer">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
