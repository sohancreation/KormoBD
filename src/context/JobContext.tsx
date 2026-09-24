import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { JobListing, Application, CompanyProfile, NotificationItem, InterviewSchedule, InterviewFeedback } from '../types';
import { INITIAL_JOBS, INITIAL_COMPANIES, INITIAL_SAMPLE_APPLICATIONS, INITIAL_SAMPLE_INTERVIEWS } from '../data/seedData';
import { useAuth } from './AuthContext';
import { analyzeCandidateWithGemini } from '../services/aiService';

interface JobContextType {
  jobs: JobListing[];
  companies: CompanyProfile[];
  applications: Application[];
  savedJobIds: string[];
  notifications: NotificationItem[];
  interviews: InterviewSchedule[];
  loading: boolean;
  toggleSaveJob: (jobId: string) => Promise<void>;
  createJob: (job: Omit<JobListing, 'id' | 'createdAt' | 'updatedAt' | 'applicantsCount'>) => Promise<string>;
  updateJob: (jobId: string, updates: Partial<JobListing>) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  submitApplication: (appData: Omit<Application, 'id' | 'appliedAt' | 'updatedAt' | 'timeline' | 'status'>) => Promise<string>;
  updateApplicationStatus: (appId: string, newStatus: Application['status'], note?: string) => Promise<void>;
  updateApplicationAiAnalysis: (appId: string, analysis: Application['aiAnalysis']) => Promise<void>;
  scheduleInterview: (interviewData: Omit<InterviewSchedule, 'id' | 'createdAt' | 'status'>) => Promise<string>;
  updateInterview: (interviewId: string, updates: Partial<InterviewSchedule>) => Promise<void>;
  cancelInterview: (interviewId: string, reason?: string) => Promise<void>;
  submitInterviewFeedback: (params: {
    interviewId?: string;
    applicationId: string;
    feedback: InterviewFeedback;
    advanceStatus?: Application['status'];
  }) => Promise<void>;
  markNotificationAsRead: (notifId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refreshData: () => Promise<void>;
  populateDemoData: (force?: boolean) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>(INITIAL_JOBS);
  const [companies, setCompanies] = useState<CompanyProfile[]>(INITIAL_COMPANIES);
  const [applications, setApplications] = useState<Application[]>(INITIAL_SAMPLE_APPLICATIONS);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['job_senior_react', 'job_fullstack_nextjs', 'job_mobile_flutter']);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [interviews, setInterviews] = useState<InterviewSchedule[]>(INITIAL_SAMPLE_INTERVIEWS);
  const [loading, setLoading] = useState(true);

  // Initialize seed data into Firestore with merge
  const initSeedDataIfNeeded = async (force: boolean = false) => {
    try {
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      if (jobsSnap.empty || force) {
        // Seed jobs
        for (const job of INITIAL_JOBS) {
          await setDoc(doc(db, 'jobs', job.id), job, { merge: true });
        }
        // Seed companies
        for (const comp of INITIAL_COMPANIES) {
          await setDoc(doc(db, 'companies', comp.id), comp, { merge: true });
        }
        // Seed sample applications
        for (const app of INITIAL_SAMPLE_APPLICATIONS) {
          await setDoc(doc(db, 'applications', app.id), app, { merge: true });
        }
        // Seed interviews
        for (const interview of INITIAL_SAMPLE_INTERVIEWS) {
          await setDoc(doc(db, 'interviews', interview.id), interview, { merge: true });
        }
      } else {
        // Upsert any newly added initial jobs and companies that don't exist yet
        const existingJobIds = new Set(jobsSnap.docs.map(d => d.id));
        for (const job of INITIAL_JOBS) {
          if (!existingJobIds.has(job.id)) {
            await setDoc(doc(db, 'jobs', job.id), job, { merge: true }).catch(() => {});
          }
        }
        for (const comp of INITIAL_COMPANIES) {
          await setDoc(doc(db, 'companies', comp.id), comp, { merge: true }).catch(() => {});
        }
        for (const app of INITIAL_SAMPLE_APPLICATIONS) {
          await setDoc(doc(db, 'applications', app.id), app, { merge: true }).catch(() => {});
        }
        for (const interview of INITIAL_SAMPLE_INTERVIEWS) {
          await setDoc(doc(db, 'interviews', interview.id), interview, { merge: true }).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Initial seeding notice (using local fallback if permission/network delays):', err);
    }
  };

  const populateDemoData = async (force: boolean = true) => {
    setLoading(true);
    try {
      await initSeedDataIfNeeded(force);
      setJobs(INITIAL_JOBS);
      setCompanies(INITIAL_COMPANIES);
      setApplications(INITIAL_SAMPLE_APPLICATIONS);
      setInterviews(INITIAL_SAMPLE_INTERVIEWS);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await initSeedDataIfNeeded();

      // Fetch jobs
      try {
        const jobsSnap = await getDocs(collection(db, 'jobs'));
        if (!jobsSnap.empty) {
          const list = jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as JobListing));
          // Merge with INITIAL_JOBS so all new demo jobs always appear
          const existingIds = new Set(list.map(j => j.id));
          const combined = [...list, ...INITIAL_JOBS.filter(j => !existingIds.has(j.id))];
          setJobs(combined);
        } else {
          setJobs(INITIAL_JOBS);
        }
      } catch {
        setJobs(INITIAL_JOBS);
      }

      // Fetch companies
      try {
        const compsSnap = await getDocs(collection(db, 'companies'));
        if (!compsSnap.empty) {
          const comps = compsSnap.docs.map(d => ({ id: d.id, ...d.data() } as CompanyProfile));
          const existingCompIds = new Set(comps.map(c => c.id));
          const combinedComps = [...comps, ...INITIAL_COMPANIES.filter(c => !existingCompIds.has(c.id))];
          setCompanies(combinedComps);
        } else {
          setCompanies(INITIAL_COMPANIES);
        }
      } catch {
        setCompanies(INITIAL_COMPANIES);
      }

      // Fetch applications
      try {
        const appsSnap = await getDocs(collection(db, 'applications'));
        if (!appsSnap.empty) {
          const apps = appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Application));
          const existingAppIds = new Set(apps.map(a => a.id));
          const combinedApps = [...apps, ...INITIAL_SAMPLE_APPLICATIONS.filter(a => !existingAppIds.has(a.id))];
          setApplications(combinedApps);
        } else {
          setApplications(INITIAL_SAMPLE_APPLICATIONS);
        }
      } catch {
        setApplications(INITIAL_SAMPLE_APPLICATIONS);
      }

      // Fetch saved jobs for current user
      if (user) {
        try {
          const savedSnap = await getDocs(query(collection(db, 'savedJobs'), where('userId', '==', user.uid)));
          const ids = savedSnap.docs.map(d => d.data().jobId as string);
          setSavedJobIds(ids.length > 0 ? ids : ['job_senior_react', 'job_fullstack_ts']);
        } catch {
          // fallback in-memory or empty
        }

        // Fetch notifications
        try {
          const notifSnap = await getDocs(query(collection(db, 'notifications'), where('userId', '==', user.uid)));
          setNotifications(notifSnap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationItem)));
        } catch {
          // fallback
        }

        // Fetch interviews
        try {
          const intSnap = await getDocs(collection(db, 'interviews'));
          if (!intSnap.empty) {
            const fetched = intSnap.docs.map(d => ({ id: d.id, ...d.data() } as InterviewSchedule));
            const existingIntIds = new Set(fetched.map(i => i.id));
            const combinedInts = [...fetched, ...INITIAL_SAMPLE_INTERVIEWS.filter(i => !existingIntIds.has(i.id))];
            setInterviews(combinedInts);
          } else {
            setInterviews(INITIAL_SAMPLE_INTERVIEWS);
          }
        } catch {
          setInterviews(INITIAL_SAMPLE_INTERVIEWS);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toggleSaveJob = async (jobId: string) => {
    if (!user) return;
    const exists = savedJobIds.includes(jobId);
    const newSaved = exists ? savedJobIds.filter(id => id !== jobId) : [...savedJobIds, jobId];
    setSavedJobIds(newSaved);

    const docId = `${user.uid}_${jobId}`;
    try {
      if (exists) {
        await deleteDoc(doc(db, 'savedJobs', docId));
      } else {
        await setDoc(doc(db, 'savedJobs', docId), {
          userId: user.uid,
          jobId,
          savedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Error syncing saved job with Firestore:', err);
    }
  };

  const createJob = async (jobData: Omit<JobListing, 'id' | 'createdAt' | 'updatedAt' | 'applicantsCount'>): Promise<string> => {
    const newId = `job_${Date.now()}`;
    const newJob: JobListing = {
      ...jobData,
      id: newId,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'jobs', newId), newJob);
    } catch (err) {
      console.warn('Could not write job to firestore:', err);
    }
    setJobs(prev => [newJob, ...prev]);
    return newId;
  };

  const updateJob = async (jobId: string, updates: Partial<JobListing>) => {
    const updated = jobs.map(j => (j.id === jobId ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j));
    setJobs(updated);
    try {
      await updateDoc(doc(db, 'jobs', jobId), { ...updates, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.warn('Error updating job:', err);
    }
  };

  const deleteJob = async (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (err) {
      console.warn('Error deleting job:', err);
    }
  };

  const submitApplication = async (appData: Omit<Application, 'id' | 'appliedAt' | 'updatedAt' | 'timeline' | 'status'>): Promise<string> => {
    const appId = `app_${Date.now()}`;
    const newApp: Application = {
      ...appData,
      id: appId,
      status: 'applied',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'applied',
          timestamp: new Date().toISOString(),
          note: 'Application successfully submitted.'
        }
      ]
    };

    setApplications(prev => [newApp, ...prev]);
    // increment job applicants count
    setJobs(prev => prev.map(j => j.id === appData.jobId ? { ...j, applicantsCount: (j.applicantsCount || 0) + 1 } : j));

    // Save base application record
    try {
      await setDoc(doc(db, 'applications', appId), newApp);
      // create notification for recruiter
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        userId: appData.recruiterId,
        title: 'New Application Received',
        message: `${appData.candidateName} applied for ${appData.jobTitle}`,
        type: 'application',
        link: `/recruiter/jobs/${appData.jobId}/applicants`,
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Application Firestore save warning:', err);
    }

    // Trigger AI Ranking immediately to help the recruiter find the best candidates
    (async () => {
      try {
        const targetJob = jobs.find(j => j.id === appData.jobId);
        if (targetJob) {
          const analysis = await analyzeCandidateWithGemini({
            jobTitle: targetJob.title,
            jobRequirements: targetJob.requirements,
            jobSkills: targetJob.skills,
            candidateProfile: {
              fullName: appData.candidateName,
              headline: appData.candidateHeadline,
              skills: targetJob.skills.filter(s => 
                (appData.resumeTextSnippet || '').toLowerCase().includes(s.toLowerCase())
              ),
              experience: [{ role: appData.candidateHeadline, details: appData.resumeTextSnippet }],
              education: []
            },
            screeningAnswers: appData.answers,
            questions: targetJob.questions.map(q => ({ id: q.id, question: q.question }))
          });

          const completeAnalysis = {
            ...analysis,
            analyzedAt: new Date().toISOString()
          };

          setApplications(prev =>
            prev.map(a => (a.id === appId ? { ...a, aiAnalysis: completeAnalysis } : a))
          );

          try {
            await updateDoc(doc(db, 'applications', appId), {
              aiAnalysis: completeAnalysis
            });
          } catch (fireErr) {
            console.warn('Could not persist auto-ranking in firestore:', fireErr);
          }
        }
      } catch (aiRankErr) {
        console.warn('Auto AI ranking background error:', aiRankErr);
      }
    })();

    return appId;
  };

  const updateApplicationStatus = async (appId: string, newStatus: Application['status'], note?: string) => {
    const timestamp = new Date().toISOString();
    setApplications(prev =>
      prev.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            status: newStatus,
            updatedAt: timestamp,
            timeline: [...a.timeline, { status: newStatus, timestamp, note }]
          };
        }
        return a;
      })
    );

    try {
      const appRef = doc(db, 'applications', appId);
      const appTarget = applications.find(a => a.id === appId);
      if (appTarget) {
        await updateDoc(appRef, {
          status: newStatus,
          updatedAt: timestamp,
          timeline: [...appTarget.timeline, { status: newStatus, timestamp, note: note || `Status updated to ${newStatus}` }]
        });

        // Notify candidate
        const notifId = `notif_${Date.now()}`;
        await setDoc(doc(db, 'notifications', notifId), {
          userId: appTarget.candidateId,
          title: `Application Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
          message: `Your application for ${appTarget.jobTitle} at ${appTarget.companyName} is now ${newStatus.replace('_', ' ')}.`,
          type: 'status',
          link: '/applications',
          read: false,
          createdAt: timestamp
        });
      }
    } catch (err) {
      console.warn('Error updating application status in Firestore:', err);
    }
  };

  const updateApplicationAiAnalysis = async (appId: string, analysis: Application['aiAnalysis']) => {
    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, aiAnalysis: analysis } : a))
    );
    try {
      await updateDoc(doc(db, 'applications', appId), {
        aiAnalysis: analysis
      });
    } catch (err) {
      console.warn('Error saving AI analysis:', err);
    }
  };

  const scheduleInterview = async (interviewData: Omit<InterviewSchedule, 'id' | 'createdAt' | 'status'>): Promise<string> => {
    const intId = `int_${Date.now()}`;
    const newInterview: InterviewSchedule = {
      ...interviewData,
      id: intId,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    setInterviews(prev => [newInterview, ...prev]);

    // Automatically set application to 'interview'
    await updateApplicationStatus(interviewData.applicationId, 'interview', `Interview scheduled for ${interviewData.date} at ${interviewData.time}`);

    try {
      await setDoc(doc(db, 'interviews', intId), newInterview);
      // Notify candidate
      const notifId = `notif_${Date.now()}`;
      await setDoc(doc(db, 'notifications', notifId), {
        userId: interviewData.candidateId,
        title: 'Interview Scheduled!',
        message: `${interviewData.companyName} scheduled an interview for ${interviewData.jobTitle} on ${interviewData.date} at ${interviewData.time}.`,
        type: 'interview',
        link: '/interviews',
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error persisting interview schedule:', err);
    }

    return intId;
  };

  const updateInterview = async (interviewId: string, updates: Partial<InterviewSchedule>) => {
    setInterviews(prev => prev.map(int => (int.id === interviewId ? { ...int, ...updates } : int)));
    try {
      await updateDoc(doc(db, 'interviews', interviewId), updates);
      const targetInt = interviews.find(i => i.id === interviewId);
      if (targetInt) {
        // notify candidate if rescheduled
        if (updates.date || updates.time) {
          const notifId = `notif_${Date.now()}`;
          await setDoc(doc(db, 'notifications', notifId), {
            userId: targetInt.candidateId,
            title: 'Interview Rescheduled',
            message: `Your interview for ${targetInt.jobTitle} has been moved to ${updates.date || targetInt.date} at ${updates.time || targetInt.time}.`,
            type: 'interview',
            link: '/interviews',
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn('Error updating interview in Firestore:', err);
    }
  };

  const cancelInterview = async (interviewId: string, reason?: string) => {
    setInterviews(prev => prev.map(int => (int.id === interviewId ? { ...int, status: 'cancelled' } : int)));
    try {
      await updateDoc(doc(db, 'interviews', interviewId), { status: 'cancelled' });
      const targetInt = interviews.find(i => i.id === interviewId);
      if (targetInt) {
        const notifId = `notif_${Date.now()}`;
        await setDoc(doc(db, 'notifications', notifId), {
          userId: targetInt.candidateId,
          title: 'Interview Cancelled',
          message: `Your interview for ${targetInt.jobTitle} on ${targetInt.date} was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'interview',
          link: '/interviews',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Error cancelling interview:', err);
    }
  };

  const submitInterviewFeedback = async (params: {
    interviewId?: string;
    applicationId: string;
    feedback: InterviewFeedback;
    advanceStatus?: Application['status'];
  }) => {
    const { interviewId, applicationId, feedback, advanceStatus } = params;

    // Find the targeted application
    const targetApp = applications.find(a => a.id === applicationId);

    // Compute updated composite score
    // Interview rating is 1.0 - 5.0 -> percentage 20 - 100
    const interviewPercentage = Math.round((feedback.averageRating / 5) * 100);
    const existingAiScore = targetApp?.aiAnalysis?.matchScore ?? 75;
    // Composite: 65% interview performance, 35% resume screening match
    const updatedRankingScore = Math.round((existingAiScore * 0.35) + (interviewPercentage * 0.65));

    const newStatus = advanceStatus || targetApp?.status || 'interview';
    const noteText = `Post-interview evaluation recorded: ${feedback.averageRating.toFixed(1)}/5 stars (${feedback.recommendation.replace(/_/g, ' ').toUpperCase()}). Ranking score updated to ${updatedRankingScore}%.`;

    // 1. Update application in state & Firestore
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== applicationId) return app;
        return {
          ...app,
          status: newStatus,
          interviewFeedback: feedback,
          feedbackWeightedScore: updatedRankingScore,
          recruiterNotes: feedback.summaryNotes
            ? `${app.recruiterNotes ? app.recruiterNotes + '\n' : ''}[Interview Notes]: ${feedback.summaryNotes}`
            : app.recruiterNotes,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...app.timeline,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              note: noteText
            }
          ]
        };
      })
    );

    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        interviewFeedback: feedback,
        feedbackWeightedScore: updatedRankingScore,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error updating application with interview feedback:', err);
    }

    // 2. Update interview record in state & Firestore
    const targetIntId = interviewId || interviews.find(i => i.applicationId === applicationId)?.id;
    if (targetIntId) {
      setInterviews(prev =>
        prev.map(int => {
          if (int.id !== targetIntId) return int;
          return {
            ...int,
            status: 'completed',
            feedback
          };
        })
      );

      try {
        await updateDoc(doc(db, 'interviews', targetIntId), {
          status: 'completed',
          feedback
        });
      } catch (err) {
        console.warn('Error updating interview record with feedback:', err);
      }
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    try {
      await updateDoc(doc(db, 'notifications', notifId), { read: true });
    } catch (err) {
      console.warn(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    for (const notif of notifications) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { read: true });
      } catch (err) {
        console.warn(err);
      }
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        companies,
        applications,
        savedJobIds,
        notifications,
        interviews,
        loading,
        toggleSaveJob,
        createJob,
        updateJob,
        deleteJob,
        submitApplication,
        updateApplicationStatus,
        updateApplicationAiAnalysis,
        scheduleInterview,
        updateInterview,
        cancelInterview,
        submitInterviewFeedback,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshData,
        populateDemoData
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJobs must be used within a JobProvider');
  return context;
};
