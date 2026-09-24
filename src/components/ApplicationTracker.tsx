import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { Application, ApplicationStatus, NotificationItem } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  Building2,
  Calendar,
  Mic,
  Bell,
  Send,
  Eye,
  Award,
  Check,
  Mail,
  ArrowUpRight,
  AlertCircle,
  Filter,
  CheckCheck,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ApplicationTrackerProps {
  onStartMockInterview?: (job?: any) => void;
}

interface MilestoneDef {
  key: string;
  label: string;
  description: string;
  stageBadge: string;
}

const MILESTONES: MilestoneDef[] = [
  {
    key: 'applied',
    label: 'Application Received',
    description: 'Tailored resume and custom cover letter submitted to hiring team.',
    stageBadge: 'Submitted'
  },
  {
    key: 'resume_viewed',
    label: 'Resume Viewed',
    description: 'Hiring manager or talent lead opened and reviewed your qualifications.',
    stageBadge: 'Reviewing'
  },
  {
    key: 'screening_passed',
    label: 'Screening Passed',
    description: 'Candidate verified against core requirements and shortlisted.',
    stageBadge: 'Shortlisted'
  },
  {
    key: 'interview_scheduled',
    label: 'Technical Round Scheduled',
    description: 'Live technical interview arranged with engineering leads.',
    stageBadge: 'Technical Round'
  },
  {
    key: 'evaluation_recorded',
    label: 'Interview Evaluated',
    description: 'Post-interview feedback and rubric evaluation recorded.',
    stageBadge: 'Debrief'
  },
  {
    key: 'offer_extended',
    label: 'Offer Extended',
    description: 'Official employment offer extended with compensation & start date.',
    stageBadge: 'Selected'
  }
];

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ onStartMockInterview }) => {
  const { 
    applications, 
    interviews, 
    jobs, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    updateApplicationStatus 
  } = useJobs();
  const { user } = useAuth();

  // Active view tab: 'timeline' or 'notifications'
  const [activeTab, setActiveTab] = useState<'timeline' | 'notifications'>('timeline');

  // Filter application status
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Email / Nudge Preview toggle
  const [previewEmailAppId, setPreviewEmailAppId] = useState<string | null>(null);

  // Nudge Modal / State
  const [nudgeModalApp, setNudgeModalApp] = useState<Application | null>(null);
  const [nudgeTone, setNudgeTone] = useState<'polite_checkin' | 'enthusiastic_update' | 'competing_offer'>('polite_checkin');
  const [isNudging, setIsNudging] = useState(false);
  const [nudgedAppIds, setNudgedAppIds] = useState<Set<string>>(new Set());

  // Simulation advancing state
  const [isSimulatingAdvance, setIsSimulatingAdvance] = useState(false);

  // Filter applications submitted by this user (or fallback to all if demo user)
  const myApplications = applications.filter(
    a => a.candidateId === user?.uid || a.candidateEmail === user?.email || (user?.email === 'sohanfardin546@gmail.com')
  );

  // Display applications with filter
  const displayedApplications = myApplications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  // User notifications
  const userNotifications = notifications.filter(
    n => !n.userId || n.userId === user?.uid || n.userId === 'user_jobseeker_demo' || user?.email === 'sohanfardin546@gmail.com'
  );
  const unreadCount = userNotifications.filter(n => !n.read).length;

  // Compute milestone status for an application
  const getMilestoneState = (app: Application, milestoneKey: string) => {
    const isRejected = app.status === 'rejected';

    // Map application status to milestone index
    let currentMilestoneIndex = 0;
    if (app.status === 'applied') currentMilestoneIndex = 0;
    else if (app.status === 'under_review') currentMilestoneIndex = 1;
    else if (app.status === 'shortlisted') currentMilestoneIndex = 2;
    else if (app.status === 'interview') {
      const hasFeedback = app.interviewFeedback || app.timeline.some(t => t.note?.toLowerCase().includes('evaluated'));
      currentMilestoneIndex = hasFeedback ? 4 : 3;
    } else if (app.status === 'selected') currentMilestoneIndex = 5;

    const milestoneIndex = MILESTONES.findIndex(m => m.key === milestoneKey);

    if (isRejected && milestoneIndex === currentMilestoneIndex) {
      return 'rejected';
    }
    if (milestoneIndex < currentMilestoneIndex) {
      return 'completed';
    }
    if (milestoneIndex === currentMilestoneIndex) {
      return 'current';
    }
    return 'upcoming';
  };

  // Dispatch an automated polite nudge to recruiter
  const handleSendNudge = async () => {
    if (!nudgeModalApp) return;
    setIsNudging(true);

    try {
      const nudgeMessages: Record<string, string> = {
        polite_checkin: `Polite Follow-up: Candidate ${user?.displayName || 'Job Seeker'} sent a gentle status inquiry regarding the ${nudgeModalApp.jobTitle} application.`,
        enthusiastic_update: `Enthusiastic Update: Candidate reiterated high excitement for the ${nudgeModalApp.jobTitle} position and shared updated portfolio achievements.`,
        competing_offer: `Timeline Acceleration: Candidate has received an external inquiry and kindly requested an expedited status update for ${nudgeModalApp.jobTitle}.`
      };

      const note = nudgeMessages[nudgeTone];
      const timestamp = new Date().toISOString();

      // Log nudge into application timeline
      await updateApplicationStatus(
        nudgeModalApp.id, 
        nudgeModalApp.status, 
        `Candidate Nudge Sent (${nudgeTone.replace('_', ' ')}): ${note}`
      );

      // Track nudged in local state
      setNudgedAppIds(prev => new Set(prev).add(nudgeModalApp.id));
      confetti({ particleCount: 30, spread: 60 });
      setNudgeModalApp(null);
    } catch (err) {
      console.warn('Error sending recruiter nudge:', err);
    } finally {
      setIsNudging(false);
    }
  };

  // Simulate advancing application milestone for live demonstration
  const handleSimulateNextStage = async (app: Application) => {
    setIsSimulatingAdvance(true);
    try {
      let nextStatus: ApplicationStatus = 'under_review';
      let note = 'Resume viewed and assessed by Hiring Manager';

      if (app.status === 'applied') {
        nextStatus = 'under_review';
        note = 'Resume opened & technical scorecard reviewed by Engineering Director.';
      } else if (app.status === 'under_review') {
        nextStatus = 'shortlisted';
        note = 'Screening passed: Candidate advanced to technical interview pool.';
      } else if (app.status === 'shortlisted') {
        nextStatus = 'interview';
        note = 'Technical Round Scheduled: Video invite with Lead Full-Stack Architect.';
      } else if (app.status === 'interview') {
        nextStatus = 'selected';
        note = 'Interview Evaluated & Offer Extended: Compensation package prepared.';
      }

      await updateApplicationStatus(app.id, nextStatus, note);
      confetti({ particleCount: 45, spread: 70 });
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setIsSimulatingAdvance(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white p-6 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Live Status Intelligence
              </span>
              <span className="text-xs text-neutral-400">• Automated Recruiter Nudges</span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white">Application Milestone Timeline</h1>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-2xl leading-relaxed">
              Track your candidate journey in real time: from Resume Viewed to Screening, Technical Interviews, and Offers. Send automated nudges and inspect live hiring notifications.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-neutral-800/80 rounded-xl text-xs font-semibold text-neutral-200 border border-neutral-700">
              {myApplications.length} Submissions
            </span>
          </div>
        </div>
      </div>

      {/* View Switcher: Timeline vs Live Notifications Drawer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Milestone Timeline ({myApplications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'notifications'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Live Alerts & Nudges</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-extrabold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Status Filter for Timeline */}
        {activeTab === 'timeline' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="p-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-700 font-medium text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Stages</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview">Interview</option>
              <option value="selected">Offer / Selected</option>
            </select>
          </div>
        )}

        {activeTab === 'notifications' && unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-end sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {/* ================= TAB 1: MILESTONE TIMELINE ================= */}
      {activeTab === 'timeline' && (
        <>
          {displayedApplications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400 space-y-3 shadow-xs">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-bold text-neutral-800 text-sm">No applications found in this filter</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Explore open jobs on the Job Wall and apply in 1-click using your tailored resume and AI cover letter.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayedApplications.map(app => {
                const scheduledInt = interviews.find(
                  i => i.applicationId === app.id && i.status !== 'cancelled'
                );
                const hasNudged = nudgedAppIds.has(app.id);
                const isSelected = selectedAppId === app.id;
                const isEmailPreviewOpen = previewEmailAppId === app.id;

                return (
                  <div 
                    key={app.id} 
                    className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6 hover:border-neutral-300 transition-all"
                  >
                    {/* Header: Company, Role, Current Status & Fast Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={app.companyLogo || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&auto=format&fit=crop&q=80'}
                          alt={app.companyName}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-100 p-0.5 shadow-xs shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-neutral-900">{app.jobTitle}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              app.status === 'selected' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              app.status === 'shortlisted' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                              app.status === 'interview' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' : 
                              'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              ● {app.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {app.companyName} • Applied {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        {/* AI Mock Prep CTA */}
                        {onStartMockInterview && (
                          <button
                            type="button"
                            onClick={() => {
                              const matchingJob = jobs.find(j => j.id === app.jobId);
                              onStartMockInterview(matchingJob || {
                                id: app.jobId,
                                title: app.jobTitle,
                                companyName: app.companyName,
                                description: `Practicing for ${app.jobTitle} at ${app.companyName}.`
                              });
                            }}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                            title="Launch AI Mock Interview simulator tailored to this role"
                          >
                            <Mic className="w-3.5 h-3.5 text-emerald-400" />
                            <span>AI Mock Prep</span>
                          </button>
                        )}

                        {/* Send Recruiter Nudge Button */}
                        <button
                          type="button"
                          disabled={hasNudged}
                          onClick={() => setNudgeModalApp(app)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                            hasNudged
                              ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                          }`}
                          title="Send a polite automated status nudge to the hiring team"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{hasNudged ? 'Nudge Sent' : 'Nudge Recruiter'}</span>
                        </button>

                        {/* Simulate Advance Button (Demo/Interactive Testing) */}
                        <button
                          type="button"
                          onClick={() => handleSimulateNextStage(app)}
                          disabled={isSimulatingAdvance || app.status === 'selected' || app.status === 'rejected'}
                          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold flex items-center gap-1 border border-neutral-200 cursor-pointer disabled:opacity-50"
                          title="Simulate hiring manager advancing candidate to next milestone"
                        >
                          <RefreshCw className={`w-3 h-3 text-neutral-500 ${isSimulatingAdvance ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">Advance Stage</span>
                        </button>
                      </div>
                    </div>

                    {/* ================= 6-STAGE REAL-TIME MILESTONE TIMELINE ================= */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-600">
                        <span>Milestone Progress</span>
                        <span className="text-neutral-400 text-[11px]">
                          Last Updated: {new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Visual Timeline Stepper */}
                      <div className="relative pt-2 pb-4">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute left-8 right-8 top-6 h-1 bg-neutral-200 -z-0" />

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 z-10 relative">
                          {MILESTONES.map((m, idx) => {
                            const state = getMilestoneState(app, m.key);

                            return (
                              <div 
                                key={m.key} 
                                className={`flex flex-col items-center text-center p-2.5 rounded-xl transition-all ${
                                  state === 'current'
                                    ? 'bg-emerald-50/70 border border-emerald-300'
                                    : state === 'completed'
                                    ? 'bg-neutral-50/70'
                                    : 'opacity-60'
                                }`}
                              >
                                {/* Circle Icon */}
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                                    state === 'completed'
                                      ? 'bg-emerald-600 text-white'
                                      : state === 'current'
                                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse'
                                      : state === 'rejected'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-white border-2 border-neutral-300 text-neutral-400'
                                  }`}
                                >
                                  {state === 'completed' ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : state === 'rejected' ? (
                                    '✕'
                                  ) : (
                                    idx + 1
                                  )}
                                </div>

                                <span className={`text-xs font-bold mt-2 ${
                                  state === 'current' ? 'text-emerald-900' :
                                  state === 'completed' ? 'text-neutral-800' : 'text-neutral-500'
                                }`}>
                                  {m.label}
                                </span>

                                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight line-clamp-2">
                                  {m.description}
                                </span>

                                {state === 'current' && (
                                  <span className="mt-1.5 px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                                    Current Stage
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Interview Details Alert (if scheduled) */}
                    {scheduledInt && (
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 animate-in fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-blue-950">Technical Interview Confirmed</span>
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-blue-200/60 text-blue-800">
                                {scheduledInt.type} Round
                              </span>
                            </div>
                            <p className="text-blue-700 mt-0.5">
                              <strong>{scheduledInt.date}</strong> at <strong>{scheduledInt.time}</strong> • {scheduledInt.companyName}
                            </p>
                          </div>
                        </div>

                        {scheduledInt.meetingLinkOrLocation && (
                          <a
                            href={scheduledInt.meetingLinkOrLocation}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-2xs"
                          >
                            <span>Join Video Call</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Collapsible Section: Recruiter Action Log & Automated Email Nudge Preview */}
                    <div className="pt-2 border-t border-neutral-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedAppId(isSelected ? null : app.id)}
                          className="font-semibold text-neutral-700 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Recruiter Action Timeline & Notes ({app.timeline.length})</span>
                          {isSelected ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setPreviewEmailAppId(isEmailPreviewOpen ? null : app.id)}
                          className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{isEmailPreviewOpen ? 'Hide Email Nudge Preview' : 'View Automated Email Nudge'}</span>
                        </button>
                      </div>

                      {/* Expanded Recruiter Action Timeline */}
                      {isSelected && (
                        <div className="p-4 bg-neutral-50 rounded-xl text-xs space-y-2.5 border border-neutral-200/80 animate-in fade-in">
                          <span className="font-bold text-neutral-800 block text-[11px] uppercase tracking-wider">
                            Verified Audit Log:
                          </span>
                          {app.timeline.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-neutral-700">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-neutral-900 capitalize">
                                    {item.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-[11px] text-neutral-400">
                                    {new Date(item.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-600 mt-0.5">
                                  {item.note || `Status milestone updated to ${item.status}.`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Automated Email Preview Card */}
                      {isEmailPreviewOpen && (
                        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between pb-2 border-b border-indigo-100 text-[11px] text-indigo-900 font-semibold">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-indigo-600" />
                              Automated Email Dispatch Preview
                            </span>
                            <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.2 rounded-full">
                              Dispatched to: {app.candidateEmail || user?.email}
                            </span>
                          </div>
                          <div className="space-y-1 text-neutral-700">
                            <p className="font-bold text-neutral-900">
                              Subject: Milestone Update: Your Application at {app.companyName} ({app.jobTitle})
                            </p>
                            <p className="text-[11px] text-neutral-600 leading-relaxed pt-1">
                              Dear {app.candidateName || user?.displayName || 'Candidate'},
                            </p>
                            <p className="text-[11px] text-neutral-600 leading-relaxed">
                              Great news! The hiring team at <strong>{app.companyName}</strong> has logged an update on your application. Your current status is now <strong>{app.status.replace('_', ' ').toUpperCase()}</strong>.
                            </p>
                            <p className="text-[11px] text-neutral-600 leading-relaxed">
                              <em>"Recruiter Note: {app.timeline[app.timeline.length - 1]?.note || 'Your qualifications align closely with our team needs.'}"</em>
                            </p>
                            <p className="text-[11px] text-neutral-500 pt-1">
                              You can log into Kormo BD anytime to track milestone stages and prepare with the AI Mock Interview simulator.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ================= TAB 2: LIVE NOTIFICATIONS & NUDGES ================= */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                Live In-App Notifications & Nudge Stream
              </h3>
              <p className="text-xs text-neutral-500">
                Real-time milestone notifications triggered by recruiters, interviews, and status advancements.
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {unreadCount} Unread
              </span>
            )}
          </div>

          {userNotifications.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 space-y-2">
              <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs">No notifications yet. You'll receive real-time alerts when recruiters review your profile.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {userNotifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`py-3.5 flex items-start justify-between gap-4 transition-colors ${
                    !notif.read ? 'bg-indigo-50/30 px-3 rounded-xl' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                      notif.type === 'interview' ? 'bg-blue-100 text-blue-700' :
                      notif.type === 'status' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {notif.type === 'interview' ? <Calendar className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-neutral-900">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 shrink-0 cursor-pointer"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= RECRUITER NUDGE MODAL ================= */}
      {nudgeModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Automated Candidate Nudge
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-1.5">
                  Send Polite Status Nudge to {nudgeModalApp.companyName}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Position: <strong className="text-neutral-800">{nudgeModalApp.jobTitle}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNudgeModalApp(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Tone Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 block">
                Choose Nudge Objective & Tone:
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'polite_checkin',
                    title: 'Standard Polite Check-In',
                    desc: 'Politely inquiries on review progress and expresses continued interest in the team.'
                  },
                  {
                    id: 'enthusiastic_update',
                    title: 'Enthusiastic Portfolio Update',
                    desc: 'Highlights enthusiasm and notifies the hiring manager of fresh projects or skills.'
                  },
                  {
                    id: 'competing_offer',
                    title: 'Expedited Decision Request',
                    desc: 'Politely notes active hiring discussions with other firms to speed up review.'
                  }
                ].map(item => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      nudgeTone === item.id
                        ? 'bg-indigo-50/60 border-indigo-300 ring-1 ring-indigo-200'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="nudgeTone"
                      value={item.id}
                      checked={nudgeTone === item.id}
                      onChange={() => setNudgeTone(item.id as any)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">{item.title}</span>
                      <span className="text-[11px] text-neutral-500 leading-snug">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview notice */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Nudges are delivered directly to the recruiter's hiring dashboard and recorded in your application timeline audit log.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setNudgeModalApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendNudge}
                disabled={isNudging}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isNudging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Nudge...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Nudge Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
