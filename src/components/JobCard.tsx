import React, { useState } from 'react';
import { JobListing } from '../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Banknote, 
  Bookmark, 
  Check, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface JobCardProps {
  job: JobListing;
  onSelect: (job: JobListing) => void;
  onApplyDirectly?: (job: JobListing) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect, onApplyDirectly }) => {
  const { savedJobIds, toggleSaveJob } = useJobs();
  const { jobSeekerProfile } = useAuth();
  const { isBangla, t } = useLanguage();
  const isSaved = savedJobIds.includes(job.id);

  // Compute realistic AI match based on applicant skills vs job skills
  let matchPercentage = 80;
  if (jobSeekerProfile && job.skills.length > 0) {
    const candidateSkills = jobSeekerProfile.skills.map(s => s.toLowerCase());
    const matched = job.skills.filter(s => candidateSkills.includes(s.toLowerCase()));
    matchPercentage = Math.min(96, Math.max(55, Math.round((matched.length / job.skills.length) * 100)));
  }

  return (
    <div className="group relative bg-white rounded-xl border border-neutral-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Top: Logo, Company & Save */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={job.companyLogo || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&auto=format&fit=crop&q=80'}
              alt={job.companyName}
              className="w-12 h-12 rounded-xl object-cover border border-neutral-100 p-0.5 bg-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer">
                  {job.companyName}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <h3 
                onClick={() => onSelect(job)}
                className="text-base font-bold text-neutral-900 group-hover:text-emerald-700 cursor-pointer transition-colors line-clamp-1"
              >
                {job.title}
              </h3>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveJob(job.id);
            }}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isSaved
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
            title={isSaved ? 'Saved' : 'Save job'}
            aria-label="Bookmark job"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs text-neutral-600">
          <span className="inline-flex items-center gap-1 bg-neutral-100 px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1 bg-neutral-100 px-2.5 py-1 rounded-md">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            {job.employmentType} ({job.workplaceType})
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-md border border-emerald-100">
            ৳ {job.salaryMinBdt.toLocaleString()} - {job.salaryMaxBdt.toLocaleString()} {isBangla ? '/মাসিক' : '/mo'}
          </span>
        </div>

        {/* Summary Snippet */}
        <p className="text-xs text-neutral-500 mt-3 line-clamp-2 leading-relaxed">
          {job.summary}
        </p>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {job.skills.slice(0, 4).map(skill => (
            <span
              key={skill}
              className="text-[11px] font-medium bg-neutral-50 text-neutral-700 border border-neutral-200 px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-[11px] text-neutral-400 self-center">
              +{job.skills.length - 4} {isBangla ? 'আরো' : 'more'}
            </span>
          )}
        </div>
      </div>

      {/* Footer: AI Match score and Quick Actions */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5" title="AI Match signal based on current profile skills">
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{matchPercentage}% {isBangla ? 'ম্যাচ' : 'AI Match'}</span>
          </div>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            • {job.applicantsCount || 0} {isBangla ? 'আবেদনকারী' : 'applied'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(job)}
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 px-3 py-2 min-h-[44px] rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer flex items-center"
          >
            {isBangla ? 'বিস্তারিত' : 'Details'}
          </button>
          <button
            onClick={() => onApplyDirectly ? onApplyDirectly(job) : onSelect(job)}
            className="text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 min-h-[44px] rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-98"
          >
            <span>{isBangla ? 'আবেদন করুন' : 'Apply Now'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
