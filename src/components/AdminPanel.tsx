import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobListing, UserRole } from '../types';
import { 
  Users, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Flag, 
  CheckCircle, 
  Trash2, 
  AlertTriangle,
  FileText,
  RefreshCw
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { jobs, companies, applications, deleteJob, populateDemoData } = useJobs();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reports'>('overview');
  const [isPopulating, setIsPopulating] = useState(false);
  const [populateSuccess, setPopulateSuccess] = useState(false);

  const handlePopulateData = async () => {
    setIsPopulating(true);
    setPopulateSuccess(false);
    try {
      await populateDemoData(true);
      setPopulateSuccess(true);
      setTimeout(() => setPopulateSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPopulating(false);
    }
  };

  // Sample reported jobs list
  const [reports, setReports] = useState([
    {
      id: 'rep_1',
      jobId: 'job_senior_react',
      jobTitle: 'Senior Frontend Engineer',
      reason: 'Verify salary range compliance',
      reportedBy: 'user_anonymous',
      status: 'pending',
      date: '2026-09-21'
    }
  ]);

  const handleResolveReport = (id: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900">Platform Moderation & Admin Panel</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
              Admin Access
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Oversee job listings, company integrity, reported content, and platform activity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePopulateData}
            disabled={isPopulating}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              populateSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300'
            }`}
            title="Populate or reload all demo jobs, companies, applications and interviews"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPopulating ? 'animate-spin' : ''}`} />
            <span>{isPopulating ? 'Syncing...' : populateSuccess ? 'Demo Data Synced!' : 'Re-sync Demo Data'}</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeTab === 'overview' ? 'bg-purple-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeTab === 'jobs' ? 'bg-purple-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              activeTab === 'reports' ? 'bg-purple-900 text-white' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            Reports ({reports.filter(r => r.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Total Listings</span>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{jobs.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Partner Companies</span>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{companies.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Applications Processed</span>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{applications.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium">Open Flags</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{reports.filter(r => r.status === 'pending').length}</p>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-neutral-900">Recent Platform Operations</h3>
          <p className="text-xs text-neutral-500">
            System security is enforced via Cloud Firestore Security Rules and AI parameter verification.
          </p>
          <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
            <span className="font-semibold">Security Enforcement Active:</span>
            <p>Candidate ranking algorithms exclude sensitive demographic factors. Human review is mandatory for all final hiring workflows.</p>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden shadow-xs">
          {jobs.map(job => (
            <div key={job.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-neutral-900">{job.title}</h4>
                <p className="text-xs text-neutral-500">{job.companyName} • {job.location} • {job.employmentType}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm(`Remove listing "${job.title}"?`)) {
                      deleteJob(job.id);
                    }
                  }}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-200 shadow-xs overflow-hidden">
          {reports.map(rep => (
            <div key={rep.id} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-500" />
                  <h4 className="font-bold text-xs text-neutral-900">{rep.jobTitle}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {rep.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-600">{rep.reason}</p>
              </div>

              {rep.status === 'pending' && (
                <button
                  onClick={() => handleResolveReport(rep.id)}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Resolve Flag
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
