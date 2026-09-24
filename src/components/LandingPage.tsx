import React, { useState } from 'react';
import { JobListing, CompanyProfile } from '../types';
import { JobCard } from './JobCard';
import { POPULAR_CATEGORIES, BANGLADESH_LOCATIONS } from '../data/seedData';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  BrainCircuit,
  FileCheck2,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  jobs: JobListing[];
  companies: CompanyProfile[];
  onExploreJobs: () => void;
  onPostJob: () => void;
  onSelectJob: (job: JobListing) => void;
  onApplyJob: (job: JobListing) => void;
  onOpenAiParser: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  jobs,
  companies,
  onExploreJobs,
  onPostJob,
  onSelectJob,
  onApplyJob,
  onOpenAiParser
}) => {
  const [heroKeyword, setHeroKeyword] = useState('');
  const [heroLocation, setHeroLocation] = useState('All Bangladesh');

  const faqs = [
    {
      q: 'How does the AI Resume Parser work?',
      a: 'Upload your resume PDF or paste your summary. Our AI engine securely reads your technical skills, work history, degree, and projects, structuring them into an editable profile without inventing details.'
    },
    {
      q: 'How are candidates ranked for recruiters?',
      a: 'Recruiters set required skills, experience thresholds, and custom screening questions. AI evaluates candidate applications objectively against these criteria to compute an assistance score. Protected attributes (religion, gender, age) are strictly omitted from analysis.'
    },
    {
      q: 'Is Kormo BD free for job seekers in Bangladesh?',
      a: 'Yes, 100% free for job seekers. You can build profiles, upload multiple resumes, apply to unlimited verified jobs, and track interview invitations.'
    },
    {
      q: 'Can employers set custom technical screening questions?',
      a: 'Yes! Employers can add short answers, portfolio URL requirements, multiple-choice questions, or have AI generate tailored screening questions automatically.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-neutral-200/60 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Subtle Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Next-Generation Career & Recruitment Platform for Bangladesh</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-tight">
            Find the right job. <br />
            <span className="text-emerald-600">Hire the right talent.</span>
          </h1>

          <p className="text-sm sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            An AI-powered talent ecosystem that automates resume parsing, candidate scoring, and custom screening questions — faster, cleaner, and unbiased.
          </p>

          {/* Interactive Search Box */}
          <div className="max-w-3xl mx-auto bg-white p-3 rounded-2xl shadow-xl border border-neutral-200/80">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={heroKeyword}
                  onChange={e => setHeroKeyword(e.target.value)}
                  placeholder="Job title, skill (e.g. React, Python), company..."
                  className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="md:col-span-4 relative">
                <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                <select
                  value={heroLocation}
                  onChange={e => setHeroLocation(e.target.value)}
                  className="w-full pl-10 pr-6 py-2.5 text-xs sm:text-sm border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                >
                  {BANGLADESH_LOCATIONS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={onExploreJobs}
                  className="w-full h-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill Bar */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-4 text-neutral-600 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Employers</span>
            </div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-600" />
              <span>AI Resume Parsing</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>BDT Currency & Local Hubs</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Explore by Category</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Top employment sectors currently hiring across Bangladesh.
            </p>
          </div>
          <button
            onClick={onExploreJobs}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            Browse all jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {POPULAR_CATEGORIES.map(cat => (
            <div
              key={cat.name}
              onClick={onExploreJobs}
              className="p-4 bg-white rounded-xl border border-neutral-200 hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <h3 className="font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-emerald-700 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-neutral-400 mt-1">{cat.count} open vacancies</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED JOBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] font-semibold text-neutral-700 mb-2">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Curated Opportunities
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Featured Openings</h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              High-growth teams in Dhaka, Chittagong, and remote setups.
            </p>
          </div>
          <button
            onClick={onExploreJobs}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            View all {jobs.length} jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.slice(0, 6).map(job => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={onSelectJob}
              onApplyDirectly={onApplyJob}
            />
          ))}
        </div>
      </section>

      {/* 4. AI RESUME PARSER CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero Manual Data Entry</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Build your professional profile in seconds with AI.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Drop your existing resume PDF. Our AI engine extracts your verified experience, key skills, universities, and links into a structured profile you can review and edit before applying.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenAiParser}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Try AI Resume Parser
              </button>
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('NAVIGATE_MARKET_INTELLIGENCE'));
                }}
                className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>🌐 Market Salary Research</span>
              </button>
              <button
                onClick={onExploreJobs}
                className="px-5 py-2.5 bg-neutral-800/60 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Search Jobs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (FOR SEEKERS & RECRUITERS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">How Kormo BD Works</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            A frictionless workflow designed for both modern professionals and busy recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Job Seekers */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-4">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">For Job Seekers</span>
            <h3 className="text-lg font-bold text-neutral-900">Fast, transparent applications</h3>
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Upload your PDF resume to autofill your entire profile with AI.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Discover roles filtered by Bangladeshi cities, BDT salary, and remote preferences.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Answer recruiter screening questions and track status updates on your live timeline.</span>
              </div>
            </div>
          </div>

          {/* For Recruiters */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 space-y-4">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">For Recruiters</span>
            <h3 className="text-lg font-bold text-neutral-900">Precision hiring & candidate analysis</h3>
            <div className="space-y-3 text-xs text-neutral-600">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Post jobs using AI to auto-generate responsibilities, requirements, and questions.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Receive applicants and run AI matching without reading hundreds of unstructured PDFs.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Shortlist, compare candidates side-by-side, and schedule interviews with 1 click.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & VERIFIED COMPANIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Trusted by hiring teams from top enterprises in Bangladesh
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {companies.map(comp => (
            <div
              key={comp.id}
              className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col items-center justify-center gap-2 text-center"
            >
              <img
                src={comp.logo}
                alt={comp.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-xs font-bold text-neutral-800">{comp.name}</span>
              <span className="text-[10px] text-neutral-400">{comp.industry}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-neutral-900 text-center mb-6">Frequently Asked Questions</h2>
        <div className="divide-y divide-neutral-200 bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs">
          {faqs.map((f, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
              <h3 className="text-sm font-bold text-neutral-900">{f.q}</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-neutral-200 pt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
              <span className="text-emerald-400">K</span>
            </div>
            <span className="font-bold text-neutral-900">Kormo BD</span>
            <span>• Empowering careers across Bangladesh</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by AI & Cloud Firestore</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
