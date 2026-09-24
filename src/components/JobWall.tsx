import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobListing } from '../types';
import { JobCard } from './JobCard';
import { BANGLADESH_LOCATIONS } from '../data/seedData';
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  Briefcase, 
  RotateCcw, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface JobWallProps {
  onSelectJob: (job: JobListing) => void;
  onApplyJob: (job: JobListing) => void;
}

export const JobWall: React.FC<JobWallProps> = ({ onSelectJob, onApplyJob }) => {
  const { jobs } = useJobs();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Bangladesh');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [workplaceTypeFilter, setWorkplaceTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'salary'>('relevance');

  // Filter application
  const filteredJobs = jobs.filter(job => {
    // Keyword match
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const matchTitle = job.title.toLowerCase().includes(term);
      const matchCompany = job.companyName.toLowerCase().includes(term);
      const matchSkills = job.skills.some(s => s.toLowerCase().includes(term));
      const matchSummary = job.summary.toLowerCase().includes(term);
      if (!matchTitle && !matchCompany && !matchSkills && !matchSummary) return false;
    }

    // Location match
    if (locationFilter !== 'All Bangladesh') {
      if (!job.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    }

    // Employment type
    if (employmentTypeFilter !== 'all' && job.employmentType !== employmentTypeFilter) {
      return false;
    }

    // Workplace type
    if (workplaceTypeFilter !== 'all' && job.workplaceType !== workplaceTypeFilter) {
      return false;
    }

    return true;
  });

  // Sorting
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'salary') return b.salaryMaxBdt - a.salaryMaxBdt;
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return 0; // relevance / default
  });

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('All Bangladesh');
    setEmploymentTypeFilter('all');
    setWorkplaceTypeFilter('all');
    setSortBy('relevance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Bar & Location Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by job title, skill (e.g. React, Python), or company..."
              className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Location Select */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full pl-10 pr-8 h-11 text-xs sm:text-sm border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
            >
              {BANGLADESH_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              onClick={() => {}}
              className="w-full h-11 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" /> Find Jobs
            </button>
          </div>
        </div>

        {/* Quick Filter Pills & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-neutral-400 font-medium shrink-0">Workplace:</span>
            {['all', 'Remote', 'Hybrid', 'On-site'].map(type => (
              <button
                key={type}
                onClick={() => setWorkplaceTypeFilter(type)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border transition-colors cursor-pointer capitalize shrink-0 flex items-center ${
                  workplaceTypeFilter === type ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {type}
              </button>
            ))}

            <span className="text-neutral-400 font-medium ml-2 shrink-0">Type:</span>
            {['all', 'Full-time', 'Internship', 'Contract'].map(type => (
              <button
                key={type}
                onClick={() => setEmploymentTypeFilter(type)}
                className={`px-3 py-1.5 min-h-[36px] rounded-lg border transition-colors cursor-pointer capitalize shrink-0 flex items-center ${
                  employmentTypeFilter === type ? 'bg-neutral-900 text-white border-neutral-900 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="border border-neutral-300 rounded-lg px-2.5 h-9 bg-white text-xs text-neutral-700 focus:outline-none"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest Posted</option>
                <option value="salary">Highest Salary</option>
              </select>
            </div>

            {(searchTerm || locationFilter !== 'All Bangladesh' || employmentTypeFilter !== 'all' || workplaceTypeFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-neutral-500 hover:text-red-600 flex items-center gap-1 text-xs font-medium px-2 py-1.5 min-h-[36px] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">
            Open Opportunities ({sortedJobs.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Verified roles across FinTech, Telecom, Software, and Logistics in Bangladesh.
          </p>
        </div>
      </div>

      {/* Jobs Grid */}
      {sortedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-500 space-y-3">
          <Briefcase className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-base">No matching positions found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search terms, choosing "All Bangladesh", or clearing specific filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={onSelectJob}
              onApplyDirectly={onApplyJob}
            />
          ))}
        </div>
      )}
    </div>
  );
};
