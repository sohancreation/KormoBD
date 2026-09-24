import React, { useState } from 'react';
import { Application, InterviewSchedule, JobListing } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  User, 
  MapPin, 
  Video, 
  Phone, 
  Building2, 
  Award, 
  CheckCircle2, 
  X, 
  Plus, 
  AlertCircle,
  GripVertical,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RecruiterCalendarSchedulerProps {
  applications: Application[];
  interviews: InterviewSchedule[];
  jobs: JobListing[];
  recruiterId: string;
  companyName: string;
  onScheduleInterview: (data: Omit<InterviewSchedule, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  onRescheduleInterview: (id: string, updates: Partial<InterviewSchedule>) => Promise<void>;
  onCancelInterview: (id: string, reason?: string) => Promise<void>;
  onOpenFeedback?: (interview: InterviewSchedule) => void;
}

// Fixed time slots from 09:00 to 18:00
const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];

export const RecruiterCalendarScheduler: React.FC<RecruiterCalendarSchedulerProps> = ({
  applications,
  interviews,
  jobs,
  recruiterId,
  companyName,
  onScheduleInterview,
  onRescheduleInterview,
  onCancelInterview,
  onOpenFeedback
}) => {
  // Current calendar viewing date (default to today or fixed seed date)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    // Start on Monday of current week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Dragging state
  const [draggedApp, setDraggedApp] = useState<Application | null>(null);
  const [draggedInterview, setDraggedInterview] = useState<InterviewSchedule | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ dateStr: string; time: string } | null>(null);

  // Quick schedule confirmation modal
  const [slotPendingDrop, setSlotPendingDrop] = useState<{
    dateStr: string;
    time: string;
    app: Application;
  } | null>(null);

  // Selected scheduled interview inspection modal
  const [activeInterview, setActiveInterview] = useState<InterviewSchedule | null>(null);

  // Filter state for top candidates pool
  const [candidateFilterJobId, setCandidateFilterJobId] = useState<string>('all');
  const [onlyTopRanked, setOnlyTopRanked] = useState(true);

  // Compute 7 days for the current week view
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const formatDateYMD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const jumpToCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Top ranked candidates pool ready to be scheduled
  const candidatePool = applications
    .filter(app => {
      // Exclude already completed/rejected
      if (app.status === 'rejected') return false;
      if (candidateFilterJobId !== 'all' && app.jobId !== candidateFilterJobId) return false;
      if (onlyTopRanked) {
        return (app.aiAnalysis?.matchScore ?? 0) >= 75 || app.status === 'shortlisted';
      }
      return true;
    })
    .sort((a, b) => (b.aiAnalysis?.matchScore ?? 0) - (a.aiAnalysis?.matchScore ?? 0));

  // Drag handlers for top candidate cards
  const handleCandidateDragStart = (e: React.DragEvent, app: Application) => {
    setDraggedApp(app);
    setDraggedInterview(null);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'NEW_CANDIDATE', appId: app.id }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Drag handlers for existing interview items (rescheduling)
  const handleInterviewDragStart = (e: React.DragEvent, interview: InterviewSchedule) => {
    setDraggedInterview(interview);
    setDraggedApp(null);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'RESCHEDULE', interviewId: interview.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverSlot = (e: React.DragEvent, dateStr: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverSlot || dragOverSlot.dateStr !== dateStr || dragOverSlot.time !== time) {
      setDragOverSlot({ dateStr, time });
    }
  };

  const handleDragLeaveSlot = () => {
    setDragOverSlot(null);
  };

  const handleDropOnSlot = async (e: React.DragEvent, dateStr: string, time: string) => {
    e.preventDefault();
    setDragOverSlot(null);

    // Case 1: Dragging a candidate to schedule a new interview
    if (draggedApp) {
      setSlotPendingDrop({
        dateStr,
        time,
        app: draggedApp
      });
      setDraggedApp(null);
      return;
    }

    // Case 2: Dragging an existing interview to reschedule it
    if (draggedInterview) {
      await onRescheduleInterview(draggedInterview.id, {
        date: dateStr,
        time: time
      });
      confetti({ particleCount: 35, spread: 50 });
      setDraggedInterview(null);
    }
  };

  // Confirm schedule creation
  const handleConfirmSchedule = async (type: 'Online' | 'Phone' | 'In-person', meetingLink: string, notes: string) => {
    if (!slotPendingDrop) return;
    const { dateStr, time, app } = slotPendingDrop;

    await onScheduleInterview({
      applicationId: app.id,
      jobId: app.jobId,
      jobTitle: app.jobTitle,
      candidateId: app.candidateId,
      candidateName: app.candidateName,
      candidateEmail: app.candidateEmail,
      recruiterId: recruiterId || 'recruiter_demo',
      companyName: companyName || app.companyName || 'Company',
      date: dateStr,
      time: time,
      type: type,
      meetingLinkOrLocation: meetingLink || 'https://meet.google.com/kormo-interview',
      notes: notes || 'Interview scheduled via Recruiter Calendar'
    });

    confetti({ particleCount: 60, spread: 60 });
    setSlotPendingDrop(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-5 rounded-2xl border border-neutral-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Smart Calendar Scheduler
            </span>
            <span className="text-xs text-neutral-400">• Drag & Drop Interview Booking</span>
          </div>
          <h2 className="text-lg font-bold mt-1 text-white">Interview Schedule Grid</h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Drag candidates from the AI Top-Ranked pool directly onto open calendar time slots.
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={jumpToCurrentWeek}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors cursor-pointer"
          >
            Today / This Week
          </button>
          <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded-lg p-0.5">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
              title="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-medium text-neutral-200">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button
              onClick={() => navigateWeek('next')}
              className="p-1.5 text-neutral-300 hover:text-white hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
              title="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Pool of Top Candidates + Right Weekly Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Top-Ranked Candidates Drag Pool (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-neutral-900">Top Candidates to Schedule</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {candidatePool.length} Available
              </span>
            </div>

            {/* Filter controls inside pool */}
            <div className="py-2.5 space-y-2 border-b border-neutral-100 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-neutral-500 text-[11px]">Filter Role:</span>
                <select
                  value={candidateFilterJobId}
                  onChange={e => setCandidateFilterJobId(e.target.value)}
                  className="text-xs border border-neutral-200 rounded-lg p-1 bg-neutral-50 text-neutral-700 max-w-[170px]"
                >
                  <option value="all">All Roles</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-600 select-none">
                <input
                  type="checkbox"
                  checked={onlyTopRanked}
                  onChange={e => setOnlyTopRanked(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Only AI match ≥ 75% or Shortlisted</span>
              </label>
            </div>

            {/* Candidate Draggable Cards List */}
            <div className="mt-3 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {candidatePool.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  <User className="w-8 h-8 text-neutral-300 mx-auto mb-1" />
                  No candidates match your current filter.
                </div>
              ) : (
                candidatePool.map(app => {
                  const score = app.aiAnalysis?.matchScore ?? 70;
                  const isScheduled = interviews.some(
                    i => i.applicationId === app.id && i.status !== 'cancelled'
                  );

                  return (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={e => handleCandidateDragStart(e, app)}
                      className={`group p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none ${
                        isScheduled
                          ? 'border-blue-200 bg-blue-50/30 opacity-75'
                          : 'border-neutral-200 bg-white hover:border-emerald-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500 shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                                {app.candidateName}
                              </h4>
                              {isScheduled && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-700">
                                  Booked
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-500 line-clamp-1">{app.jobTitle}</p>
                          </div>
                        </div>

                        {/* AI Match Badge */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{score}%</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 pt-1.5 border-t border-neutral-100">
                        <span>{app.candidateLocation}</span>
                        <span className="text-emerald-600 font-medium group-hover:underline">
                          Drag to calendar →
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px] text-neutral-500 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Tip:</strong> Grab any candidate card and drop it onto an open time slot on the calendar.
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 7-Day Calendar Grid (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            {/* Calendar Table Header */}
            <div className="grid grid-cols-8 border-b border-neutral-200 bg-neutral-50 text-center text-xs">
              <div className="p-3 font-semibold text-neutral-400 border-r border-neutral-200 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              {weekDays.map((day, idx) => {
                const isToday = formatDateYMD(day) === formatDateYMD(new Date());
                const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = day.getDate();
                const isWeekend = day.getDay() === 5 || day.getDay() === 6; // Fri / Sat in BD

                return (
                  <div
                    key={idx}
                    className={`p-2.5 border-r border-neutral-200 last:border-r-0 ${
                      isToday ? 'bg-emerald-50/80 text-emerald-900 font-bold' : isWeekend ? 'bg-neutral-100/50 text-neutral-500' : 'text-neutral-800'
                    }`}
                  >
                    <div className="text-[11px] uppercase tracking-wider text-neutral-400">{dayName}</div>
                    <div className={`text-sm font-bold mt-0.5 ${isToday ? 'text-emerald-700' : ''}`}>
                      {dayNum}
                    </div>
                    {isToday && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calendar Grid Time Slots */}
            <div className="divide-y divide-neutral-200">
              {TIME_SLOTS.map(time => (
                <div key={time} className="grid grid-cols-8 min-h-[72px]">
                  {/* Time label column */}
                  <div className="p-2 text-[11px] font-mono font-medium text-neutral-400 bg-neutral-50/40 border-r border-neutral-200 flex items-start justify-center">
                    {time}
                  </div>

                  {/* 7 Days for this time slot */}
                  {weekDays.map((day, dayIdx) => {
                    const dateStr = formatDateYMD(day);
                    const slotInterviews = interviews.filter(
                      i => i.date === dateStr && i.time === time && i.status !== 'cancelled'
                    );

                    const isOver = dragOverSlot?.dateStr === dateStr && dragOverSlot?.time === time;

                    return (
                      <div
                        key={dayIdx}
                        onDragOver={e => handleDragOverSlot(e, dateStr, time)}
                        onDragLeave={handleDragLeaveSlot}
                        onDrop={e => handleDropOnSlot(e, dateStr, time)}
                        className={`p-1.5 border-r border-neutral-200 last:border-r-0 transition-colors relative flex flex-col gap-1 ${
                          isOver
                            ? 'bg-emerald-100 border-2 border-dashed border-emerald-600'
                            : 'hover:bg-neutral-50/60'
                        }`}
                      >
                        {/* Slot has booked interview(s) */}
                        {slotInterviews.map(item => (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={e => handleInterviewDragStart(e, item)}
                            onClick={() => setActiveInterview(item)}
                            className="p-1.5 rounded-lg bg-neutral-900 text-white text-[10px] shadow-xs cursor-grab active:cursor-grabbing hover:bg-neutral-800 transition-all border border-neutral-800"
                            title="Click to view details or drag to reschedule"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold truncate text-emerald-400">
                                {item.candidateName}
                              </span>
                              {item.type === 'Online' ? (
                                <Video className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                              ) : (
                                <Phone className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[9px] text-neutral-300 truncate">{item.jobTitle}</div>
                            <div className="text-[8px] text-neutral-400 flex items-center justify-between mt-0.5">
                              <span>{item.type}</span>
                              {item.feedback ? (
                                <span className="text-amber-300 font-bold flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                                  {item.feedback.averageRating}
                                </span>
                              ) : (
                                <span className="text-emerald-400">Scheduled</span>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Visual indicator when dropping */}
                        {isOver && (
                          <div className="absolute inset-1 rounded-lg bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-800 pointer-events-none">
                            Drop to Book
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Quick status guide below calendar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-neutral-500 px-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-900 inline-block" /> Scheduled Interview
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500 inline-block" /> Drop Target
              </span>
              <span className="flex items-center gap-1.5">
                <Video className="w-3 h-3 text-blue-600" /> Online Video
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-amber-600" /> Phone Call
              </span>
            </div>
            <span className="text-neutral-400 italic">
              Tip: Drag existing interviews to any slot to reschedule instantly.
            </span>
          </div>
        </div>
      </div>

      {/* MODAL 1: Drop Confirmation to Schedule Interview */}
      {slotPendingDrop && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  Confirm Schedule
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  Book Interview with {slotPendingDrop.app.candidateName}
                </h3>
              </div>
              <button
                onClick={() => setSlotPendingDrop(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Candidate & Slot summary */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Position:</span>
                <span className="font-semibold text-neutral-900">{slotPendingDrop.app.jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">AI Compatibility:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                  {slotPendingDrop.app.aiAnalysis?.matchScore ?? 85}% Match
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Selected Time:</span>
                <span className="font-bold text-neutral-900">
                  {slotPendingDrop.dateStr} at {slotPendingDrop.time}
                </span>
              </div>
            </div>

            {/* Configuration Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget;
                const type = (form.elements.namedItem('interviewType') as HTMLSelectElement).value as 'Online' | 'Phone' | 'In-person';
                const link = (form.elements.namedItem('meetingLink') as HTMLInputElement).value;
                const notes = (form.elements.namedItem('notes') as HTMLInputElement).value;
                handleConfirmSchedule(type, link, notes);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Interview Format</label>
                <select
                  name="interviewType"
                  defaultValue="Online"
                  className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="Online">Online Video Meeting (Google Meet / Zoom)</option>
                  <option value="Phone">Telephone Screen</option>
                  <option value="In-person">In-Person at Office</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Meeting Link or Office Address</label>
                <input
                  type="text"
                  name="meetingLink"
                  defaultValue="https://meet.google.com/kormo-interview"
                  required
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Interviewer Notes</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue="Technical assessment and cultural fit round"
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSlotPendingDrop(null)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Notify Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Active Scheduled Interview Inspector */}
      {activeInterview && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Interview Details
                </span>
                <h3 className="text-base font-bold text-neutral-900">
                  {activeInterview.candidateName}
                </h3>
              </div>
              <button
                onClick={() => setActiveInterview(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-500">Role:</span>
                <span className="font-semibold text-neutral-900">{activeInterview.jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date & Time:</span>
                <span className="font-bold text-neutral-900">
                  {activeInterview.date} at {activeInterview.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Candidate Email:</span>
                <span className="text-neutral-900">{activeInterview.candidateEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Type:</span>
                <span className="font-medium text-neutral-900">{activeInterview.type}</span>
              </div>
              <div className="pt-1">
                <span className="text-neutral-500 block mb-1">Meeting Link:</span>
                <a
                  href={activeInterview.meetingLinkOrLocation}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline break-all font-mono text-[11px]"
                >
                  {activeInterview.meetingLinkOrLocation}
                </a>
              </div>
              {activeInterview.notes && (
                <div className="pt-1">
                  <span className="text-neutral-500 block">Notes:</span>
                  <p className="text-neutral-700 mt-0.5">{activeInterview.notes}</p>
                </div>
              )}

              {/* Post-Interview Evaluation Badge & Summary */}
              {activeInterview.feedback && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Interview Evaluated ({activeInterview.feedback.averageRating} / 5.0)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                      {activeInterview.feedback.recommendation.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-700 leading-relaxed italic">
                    "{activeInterview.feedback.summaryNotes}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 gap-2 flex-wrap">
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Cancel interview with ${activeInterview.candidateName}?`)) {
                    await onCancelInterview(activeInterview.id, 'Cancelled by recruiter');
                    setActiveInterview(null);
                  }
                }}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Cancel Interview
              </button>

              <div className="flex items-center gap-2">
                {onOpenFeedback && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenFeedback(activeInterview);
                      setActiveInterview(null);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {activeInterview.feedback ? 'Update Feedback & Ratings' : 'Submit Post-Interview Feedback'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveInterview(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
