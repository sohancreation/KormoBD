import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { JobListing, CourseResource } from '../types';
import { getCoursesForSkill } from '../data/learningCoursesData';
import { 
  generateSkillsGapAnalysisWithAI, 
  SkillsGapAnalysisResult 
} from '../services/aiService';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  ArrowRight, 
  Plus, 
  X, 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Copy, 
  Check, 
  ExternalLink, 
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  GraduationCap,
  PlayCircle,
  Filter,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SkillsGapAnalysisProps {
  onSelectJob?: (job: JobListing) => void;
  onApplyJob?: (job: JobListing) => void;
  onNavigateToJobs?: () => void;
}

export const SkillsGapAnalysis: React.FC<SkillsGapAnalysisProps> = ({
  onSelectJob,
  onApplyJob,
  onNavigateToJobs
}) => {
  const { jobs, savedJobIds, toggleSaveJob } = useJobs();
  const { jobSeekerProfile, updateJobSeekerProfile } = useAuth();

  // Current resume skills state (initialized from profile, fallback to standard tech skills)
  const [resumeSkills, setResumeSkills] = useState<string[]>(() => {
    if (jobSeekerProfile?.skills && jobSeekerProfile.skills.length > 0) {
      return jobSeekerProfile.skills;
    }
    return ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'HTML5', 'Git'];
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Tab state: 'gap_matrix' or 'learning_roadmap'
  const [activeTab, setActiveTab] = useState<'gap_matrix' | 'learning_roadmap'>('gap_matrix');

  // Course Progress tracking state (persisted in localStorage)
  const [courseProgress, setCourseProgress] = useState<Record<string, 'not_started' | 'in_progress' | 'completed'>>(() => {
    try {
      const saved = localStorage.getItem('kormoai_learning_roadmap_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Roadmap filters
  const [roadmapPlatformFilter, setRoadmapPlatformFilter] = useState<string>('all');
  const [roadmapProgressFilter, setRoadmapProgressFilter] = useState<string>('all');

  // Gemini AI Deep Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<SkillsGapAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);

  // Synchronize resume skills if profile changes
  useEffect(() => {
    if (jobSeekerProfile?.skills && jobSeekerProfile.skills.length > 0) {
      setResumeSkills(jobSeekerProfile.skills);
    }
  }, [jobSeekerProfile?.skills]);

  // Resolve user's bookmarked jobs from savedJobIds
  const bookmarkedJobs = jobs.filter(j => savedJobIds.includes(j.id));

  // Determine active jobs to analyze: either all bookmarked jobs or a specifically selected one
  const targetJobsToAnalyze = selectedJobFilter === 'all'
    ? bookmarkedJobs
    : bookmarkedJobs.filter(j => j.id === selectedJobFilter);

  // Compute skills gap math
  const resumeSkillsLower = new Set(resumeSkills.map(s => s.toLowerCase().trim()));

  // Aggregate required skills across analyzed bookmarked jobs
  const skillFrequencyMap: Record<string, { rawSkill: string; count: number; jobs: string[] }> = {};
  targetJobsToAnalyze.forEach(job => {
    job.skills.forEach(skill => {
      const lower = skill.toLowerCase().trim();
      if (!skillFrequencyMap[lower]) {
        skillFrequencyMap[lower] = { rawSkill: skill, count: 0, jobs: [] };
      }
      skillFrequencyMap[lower].count += 1;
      if (!skillFrequencyMap[lower].jobs.includes(job.title)) {
        skillFrequencyMap[lower].jobs.push(job.title);
      }
    });
  });

  const allRequiredSkills = Object.values(skillFrequencyMap);
  const matchedSkills = allRequiredSkills.filter(item => resumeSkillsLower.has(item.rawSkill.toLowerCase().trim()));
  const missingSkills = allRequiredSkills.filter(item => !resumeSkillsLower.has(item.rawSkill.toLowerCase().trim()))
    .sort((a, b) => b.count - a.count);

  const matchPercentage = allRequiredSkills.length > 0
    ? Math.round((matchedSkills.length / allRequiredSkills.length) * 100)
    : 100;

  // Add a new skill to resume & profile
  const handleAddSkill = async (skillToAdd: string) => {
    const trimmed = skillToAdd.trim();
    if (!trimmed) return;
    if (resumeSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) return;

    const updated = [...resumeSkills, trimmed];
    setResumeSkills(updated);
    setNewSkillInput('');

    if (updateJobSeekerProfile) {
      await updateJobSeekerProfile({ skills: updated });
    }
    confetti({ particleCount: 30, spread: 50 });
  };

  // Remove skill
  const handleRemoveSkill = async (skillToRemove: string) => {
    const updated = resumeSkills.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase());
    setResumeSkills(updated);
    if (updateJobSeekerProfile) {
      await updateJobSeekerProfile({ skills: updated });
    }
  };

  // Toggle Course progress status: not_started -> in_progress -> completed -> not_started
  const handleToggleCourseStatus = async (courseId: string, skill: string) => {
    const current = courseProgress[courseId] || 'not_started';
    const next: 'not_started' | 'in_progress' | 'completed' = current === 'not_started' ? 'in_progress' : current === 'in_progress' ? 'completed' : 'not_started';
    const updated: Record<string, 'not_started' | 'in_progress' | 'completed'> = { ...courseProgress, [courseId]: next };
    setCourseProgress(updated);
    try {
      localStorage.setItem('kormoai_learning_roadmap_progress', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save roadmap progress:', e);
    }

    if (next === 'completed') {
      confetti({ particleCount: 45, spread: 60 });
      // Automatically add skill to resume skills if candidate doesn't have it yet
      const exists = resumeSkills.some(s => s.toLowerCase() === skill.toLowerCase());
      if (!exists) {
        await handleAddSkill(skill);
      }
    }
  };

  // Bookmark sample starter jobs if none saved
  const handleBookmarkStarterJobs = async () => {
    const topRoleIds = ['job_senior_react', 'job_lead_frontend', 'job_fullstack_ts'];
    for (const id of topRoleIds) {
      if (jobs.some(j => j.id === id) && !savedJobIds.includes(id)) {
        await toggleSaveJob(id);
      }
    }
    confetti({ particleCount: 40, spread: 60 });
  };

  // Trigger AI Deep Gap Analysis
  const handleRunAiDeepAnalysis = async () => {
    if (targetJobsToAnalyze.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await generateSkillsGapAnalysisWithAI({
        candidateHeadline: jobSeekerProfile?.headline || 'Frontend & Full-Stack Engineer',
        currentSkills: resumeSkills,
        bookmarkedJobs: targetJobsToAnalyze.map(j => ({
          title: j.title,
          company: j.companyName,
          skills: j.skills,
          requirements: j.requirements
        }))
      });
      setAiAnalysis(result);
      confetti({ particleCount: 50, spread: 70 });
    } catch (err) {
      console.error('Failed to generate AI skills gap analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy resume bullet to clipboard
  const handleCopyBullet = (bullet: string, index: number) => {
    navigator.clipboard.writeText(bullet);
    setCopiedBulletIndex(index);
    setTimeout(() => setCopiedBulletIndex(null), 2000);
  };

  // Heuristic certifications mapping for key missing skills
  const getQualificationSuggestions = (skillName: string) => {
    const s = skillName.toLowerCase();
    if (s.includes('docker') || s.includes('kubernetes') || s.includes('container')) {
      return {
        cert: 'Docker Certified Associate (DCA) / Kubernetes CKA',
        time: '2-3 Weeks',
        project: 'Containerize a React/Node full-stack application with Docker Compose and multi-stage builds.',
        category: 'DevOps & Infrastructure'
      };
    }
    if (s.includes('aws') || s.includes('cloud') || s.includes('azure') || s.includes('gcp')) {
      return {
        cert: 'AWS Certified Cloud Practitioner or Solutions Architect',
        time: '3-4 Weeks',
        project: 'Deploy a serverless REST API using AWS Lambda, API Gateway, and S3 static hosting.',
        category: 'Cloud Engineering'
      };
    }
    if (s.includes('graphql') || s.includes('apollo')) {
      return {
        cert: 'Apollo GraphQL Associate Developer Certification',
        time: '1-2 Weeks',
        project: 'Build a unified GraphQL gateway with schema stitching, Apollo Client queries, and caching.',
        category: 'API Architecture'
      };
    }
    if (s.includes('redis') || s.includes('cache')) {
      return {
        cert: 'Redis University Certified Developer (RU101)',
        time: '1 Week',
        project: 'Implement high-speed session management and response rate-limiting with Redis.',
        category: 'Caching & Performance'
      };
    }
    if (s.includes('python') || s.includes('fastapi') || s.includes('django')) {
      return {
        cert: 'Python Institute PCAP / Meta Backend Specialization',
        time: '3-4 Weeks',
        project: 'Develop an asynchronous FastAPI microservice with automated PyTest coverage and JWT auth.',
        category: 'Backend Architecture'
      };
    }
    if (s.includes('next') || s.includes('ssr')) {
      return {
        cert: 'Vercel Next.js App Router Masterclass Certificate',
        time: '1-2 Weeks',
        project: 'Create an SEO-optimized eCommerce catalog with Next.js Server Components and streaming SSR.',
        category: 'Modern Web Frameworks'
      };
    }
    if (s.includes('sql') || s.includes('postgres') || s.includes('mongo')) {
      return {
        cert: 'PostgreSQL Professional Associate / MongoDB University',
        time: '2 Weeks',
        project: 'Design normalized schema, complex indexing, and EXPLAIN query plan optimizations.',
        category: 'Database Engineering'
      };
    }
    if (s.includes('jest') || s.includes('test') || s.includes('cypress')) {
      return {
        cert: 'Testing JavaScript by Kent C. Dodds / Cypress Certification',
        time: '1-2 Weeks',
        project: 'Achieve 90%+ branch test coverage on critical payment or authentication workflows.',
        category: 'Quality Assurance & Testing'
      };
    }
    return {
      cert: `Verified ${skillName} Professional Certification on Coursera / Udemy`,
      time: '1-3 Weeks',
      project: `Build a production-ready module demonstrating hands-on mastery of ${skillName}.`,
      category: 'Specialized Skill'
    };
  };

  // Missing skills courses mapping
  const missingSkillsWithCourses = missingSkills.map(item => ({
    skill: item.rawSkill,
    priority: item.count > 1 ? 'High Priority Gap' : 'Target Skill',
    jobCount: item.count,
    courses: getCoursesForSkill(item.rawSkill)
  }));

  const allRoadmapCourses = missingSkillsWithCourses.flatMap(m => 
    m.courses.map(c => ({ ...c, targetSkill: m.skill, jobCount: m.jobCount }))
  );

  const completedCoursesCount = allRoadmapCourses.filter(c => courseProgress[c.id] === 'completed').length;
  const inProgressCoursesCount = allRoadmapCourses.filter(c => courseProgress[c.id] === 'in_progress').length;
  const totalRoadmapCoursesCount = allRoadmapCourses.length;
  const roadmapCompletionPercent = totalRoadmapCoursesCount > 0 
    ? Math.round((completedCoursesCount / totalRoadmapCoursesCount) * 100) 
    : 0;

  // Filtered courses for the Learning Roadmap tab
  const filteredRoadmapCourses = allRoadmapCourses.filter(course => {
    if (roadmapPlatformFilter !== 'all' && course.platform !== roadmapPlatformFilter) {
      return false;
    }
    const status = courseProgress[course.id] || 'not_started';
    if (roadmapProgressFilter !== 'all' && status !== roadmapProgressFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-6 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Skills Gap Intelligence
              </span>
              <span className="text-xs text-neutral-400">
                • Benchmarked Against Bookmarked Jobs
              </span>
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">
              Resume vs Bookmarked Jobs Gap Analysis
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5 max-w-2xl leading-relaxed">
              Compare your current resume skills against the qualifications requested by your bookmarked companies.
              Uncover high-demand missing skills, estimated study time, and AI-recommended certifications to maximize hiring odds.
            </p>
          </div>

          {/* Quick AI Trigger */}
          <div className="shrink-0">
            <button
              onClick={handleRunAiDeepAnalysis}
              disabled={isAnalyzing || targetJobsToAnalyze.length === 0}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating AI Deep Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Generate AI Deep Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Match Readiness Gauge */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Readiness Match</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-neutral-900">{matchPercentage}%</span>
            <span className="text-xs font-semibold text-emerald-600">
              {matchPercentage >= 75 ? 'Strong Match' : matchPercentage >= 50 ? 'Moderate Fit' : 'Skill Gap'}
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                matchPercentage >= 75 ? 'bg-emerald-500' : matchPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${matchPercentage}%` }}
            />
          </div>
        </div>

        {/* Current Resume Skills */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Your Resume Skills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 mt-2">{resumeSkills.length}</p>
          <span className="text-[11px] text-neutral-400">
            {matchedSkills.length} active in bookmarked jobs
          </span>
        </div>

        {/* Missing Qualifications */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Missing Skills Gap</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{missingSkills.length}</p>
          <span className="text-[11px] text-neutral-400">
            Required across your target jobs
          </span>
        </div>

        {/* Target Bookmarks Count */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Bookmarked Roles</span>
            <Bookmark className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{bookmarkedJobs.length}</p>
          <span className="text-[11px] text-neutral-400">
            {targetJobsToAnalyze.length} active in this analysis
          </span>
        </div>
      </div>

      {/* VIEW SWITCHER: Skills Gap Matrix vs Interactive Learning Roadmap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-100 p-1.5 rounded-2xl border border-neutral-200">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('gap_matrix')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gap_matrix'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Skills Gap Matrix</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-neutral-100 text-neutral-600 font-semibold">
              {matchPercentage}% Fit
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('learning_roadmap')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'learning_roadmap'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Personalized Learning Roadmap & Courses</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
              {completedCoursesCount}/{totalRoadmapCoursesCount} Done
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-neutral-200 text-xs shrink-0 self-end sm:self-auto">
          <span className="text-neutral-500 font-medium">Roadmap Progress:</span>
          <div className="w-24 bg-neutral-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${roadmapCompletionPercent}%` }}
            />
          </div>
          <span className="font-bold text-neutral-900">{roadmapCompletionPercent}%</span>
        </div>
      </div>

      {/* TAB 1: Personalized Learning Roadmap & Course Linker */}
      {activeTab === 'learning_roadmap' && (
        <div className="space-y-6">
          {/* Header & Filter Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 w-fit">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Free Course Linker & Verified Certifications
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-2">
                  Personalized Roadmap to Bridge All {missingSkills.length} Skill Gaps
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 max-w-2xl leading-relaxed">
                  We mapped every missing skill from your bookmarked jobs directly to verified free courses and recognized certifications on Coursera, freeCodeCamp, Udemy, YouTube, and edX.
                </p>
              </div>

              {/* Progress Summary Box */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 shrink-0 min-w-[240px] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-700">Course Completion</span>
                  <span className="font-extrabold text-emerald-700">{roadmapCompletionPercent}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${roadmapCompletionPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{completedCoursesCount} Completed</span>
                  <span>{inProgressCoursesCount} In Progress</span>
                  <span>{totalRoadmapCoursesCount - completedCoursesCount - inProgressCoursesCount} Left</span>
                </div>
              </div>
            </div>

            {/* Platform & Status Filters */}
            <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-neutral-500 font-semibold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Platform:
                </span>
                {['all', 'Coursera', 'freeCodeCamp', 'Udemy', 'YouTube', 'edX'].map(plat => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setRoadmapPlatformFilter(plat)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      roadmapPlatformFilter === plat
                        ? 'bg-neutral-900 text-white shadow-2xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {plat === 'all' ? 'All Platforms' : plat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-neutral-500 font-semibold">Progress Status:</span>
                <select
                  value={roadmapProgressFilter}
                  onChange={e => setRoadmapProgressFilter(e.target.value)}
                  className="p-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-medium text-xs focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="all">All ({totalRoadmapCoursesCount})</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress ({inProgressCoursesCount})</option>
                  <option value="completed">Completed ({completedCoursesCount})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grouped Skills Curriculum */}
          {missingSkillsWithCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">Zero Skill Gaps Detected!</h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Your resume encompasses 100% of the skills required by your saved positions. You're ready to apply!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {missingSkillsWithCourses.map((group, gIdx) => {
                const groupCourses = group.courses.filter(course => {
                  if (roadmapPlatformFilter !== 'all' && course.platform !== roadmapPlatformFilter) return false;
                  const status = courseProgress[course.id] || 'not_started';
                  if (roadmapProgressFilter !== 'all' && status !== roadmapProgressFilter) return false;
                  return true;
                });

                if (groupCourses.length === 0 && (roadmapPlatformFilter !== 'all' || roadmapProgressFilter !== 'all')) {
                  return null;
                }

                return (
                  <div key={gIdx} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-4">
                    {/* Skill Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center border border-indigo-100">
                          {gIdx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-neutral-900">{group.skill}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              group.priority === 'High Priority Gap'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                            }`}>
                              {group.priority}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400">
                            Required in {group.jobCount} bookmarked job{group.jobCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSkill(group.skill)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>I already know this skill</span>
                      </button>
                    </div>

                    {/* Linked Course Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupCourses.map(course => {
                        const status = courseProgress[course.id] || 'not_started';
                        return (
                          <div
                            key={course.id}
                            className={`rounded-xl border p-4 space-y-3 flex flex-col justify-between transition-all ${
                              status === 'completed'
                                ? 'bg-emerald-50/40 border-emerald-300'
                                : status === 'in_progress'
                                ? 'bg-amber-50/30 border-amber-300'
                                : 'bg-neutral-50/40 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <div className="space-y-2">
                              {/* Provider Badge & Difficulty */}
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                  course.platform === 'Coursera'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : course.platform === 'freeCodeCamp'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : course.platform === 'YouTube'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : course.platform === 'Udemy'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                }`}>
                                  {course.platform}
                                </span>

                                <span className="text-[10px] font-semibold text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                                  {course.level}
                                </span>
                              </div>

                              <h5 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
                                {course.title}
                              </h5>

                              <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
                                {course.summary}
                              </p>

                              {/* Time & Rating */}
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 pt-1">
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3 text-neutral-400" />
                                  {course.estimatedHours}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-semibold text-amber-600">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  {course.rating}
                                </span>
                                <span>•</span>
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  {course.isFree ? 'Free' : 'Audit Free'}
                                </span>
                              </div>

                              {/* Syllabus Highlight Pills */}
                              {course.syllabusHighlights && course.syllabusHighlights.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Key Modules:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {course.syllabusHighlights.slice(0, 2).map((item, i) => (
                                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-neutral-600 border border-neutral-200 truncate max-w-full">
                                        • {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Actions & Status Pill Button */}
                            <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between gap-2">
                              <a
                                href={course.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span>Launch Course</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>

                              <button
                                type="button"
                                onClick={() => handleToggleCourseStatus(course.id, group.skill)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                  status === 'completed'
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : status === 'in_progress'
                                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                                    : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-100'
                                }`}
                              >
                                {status === 'completed' ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Completed ✓</span>
                                  </>
                                ) : status === 'in_progress' ? (
                                  <>
                                    <Clock className="w-3.5 h-3.5 animate-spin" />
                                    <span>In Progress</span>
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-3.5 h-3.5" />
                                    <span>Start Course</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Skills Gap Matrix (Sections 1 through 5) */}
      {activeTab === 'gap_matrix' && (
        <div className="space-y-6">
      {/* SECTION 1: Resume Skills Management Pill Bar */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Current Resume Skills ({resumeSkills.length})
            </h3>
            <p className="text-xs text-neutral-500">
              These skills are parsed from your profile and compared directly with job requirements.
            </p>
          </div>

          {/* Quick Add Skill Input */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAddSkill(newSkillInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Add skill (e.g. Docker, Redis)..."
              value={newSkillInput}
              onChange={e => setNewSkillInput(e.target.value)}
              className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-56"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        </div>

        {/* Skill Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {resumeSkills.map((skill, index) => {
            const isMatchedInBookmarks = matchedSkills.some(
              m => m.rawSkill.toLowerCase().trim() === skill.toLowerCase().trim()
            );

            return (
              <span
                key={index}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isMatchedInBookmarks
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                {isMatchedInBookmarks ? (
                  <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                )}
                <span>{skill}</span>
                {isMatchedInBookmarks && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1 rounded">
                    Matched
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-neutral-400 hover:text-red-600 transition-colors ml-0.5 cursor-pointer"
                  title={`Remove ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Bookmarked Target Jobs Filter & Zero State */}
      {bookmarkedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-8 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800">No Bookmarked Jobs Found</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            You haven't bookmarked any jobs yet. Bookmark tech roles you are aspiring towards to run a precise skills gap comparison.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleBookmarkStarterJobs}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" /> Bookmark Top Tech Roles (bKash & Pathao)
            </button>
            {onNavigateToJobs && (
              <button
                onClick={onNavigateToJobs}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Browse All Open Jobs
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Filter Scope:</span>
            <select
              value={selectedJobFilter}
              onChange={e => setSelectedJobFilter(e.target.value)}
              className="border border-neutral-200 rounded-lg p-1.5 bg-neutral-50 text-neutral-800 text-xs font-medium focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">
                All Bookmarked Jobs ({bookmarkedJobs.length} roles)
              </option>
              {bookmarkedJobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.companyName})
                </option>
              ))}
            </select>
          </div>

          <span className="text-neutral-400 text-[11px]">
            Showing required skills across {targetJobsToAnalyze.length} bookmarked position{targetJobsToAnalyze.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      {/* SECTION 3: Suggested Missing Qualifications & Actionable Upskilling Cards */}
      {missingSkills.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Missing Qualifications & Suggested Learning Path
              </h3>
              <p className="text-xs text-neutral-500">
                Prioritized by frequency in your bookmarked jobs. Add these to your skill set to close the gap.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missingSkills.map((item, idx) => {
              const details = getQualificationSuggestions(item.rawSkill);
              const isHighPriority = item.count > 1 || idx < 2;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs space-y-4 hover:border-emerald-300 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                          {item.rawSkill}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isHighPriority
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          {isHighPriority ? 'High Priority Gap' : 'Target Skill'}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 mt-0.5 block">
                        Category: {details.category}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md shrink-0">
                      In {item.count} saved job{item.count > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Recommended Certification / Course */}
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
                      <Award className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Recommended Credential / Course:</span>
                    </div>
                    <p className="text-neutral-800 text-[11px] font-medium pl-5">
                      {details.cert}
                    </p>
                  </div>

                  {/* Free Online Course Links */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      Free Courses & Certifications:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {getCoursesForSkill(item.rawSkill).slice(0, 3).map(course => {
                        const status = courseProgress[course.id] || 'not_started';
                        return (
                          <div
                            key={course.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg text-[10px] text-neutral-700 transition-colors"
                          >
                            <span className="font-bold text-neutral-900">{course.platform}</span>
                            <span className="text-neutral-400">•</span>
                            <span className="text-neutral-500">{course.estimatedHours}</span>
                            <a
                              href={course.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 ml-0.5"
                              title={`Open ${course.title}`}
                            >
                              <ExternalLink className="w-2.5 h-2.5 inline" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleToggleCourseStatus(course.id, item.rawSkill)}
                              className={`ml-1 text-[9px] px-1 py-0.2 rounded font-bold cursor-pointer ${
                                status === 'completed'
                                  ? 'bg-emerald-600 text-white'
                                  : status === 'in_progress'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                              }`}
                              title="Advance progress status"
                            >
                              {status === 'completed' ? '✓ Done' : status === 'in_progress' ? '⏳ Doing' : '+ Start'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Portfolio Project Suggestion */}
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Proof-of-Work Project Idea:</span>
                    </div>
                    <p className="text-neutral-600 text-[11px] pl-5 leading-relaxed">
                      {details.project}
                    </p>
                  </div>

                  {/* Bottom Footer Action */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      Est. Time: {details.time}
                    </span>

                    <button
                      onClick={() => handleAddSkill(item.rawSkill)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Add to your resume skills once learned"
                    >
                      <Plus className="w-3 h-3" />
                      Add to Resume Skills
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: AI Deep Analysis Narrative Report */}
      {aiAnalysis && (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-6 space-y-6 animate-in fade-in">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                AI Strategic Upskilling Report
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-2">
                Executive Upskilling Strategy & Salary Impact
              </h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-2xl leading-relaxed">
                {aiAnalysis.executiveSummary}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-neutral-400 block">AI Readiness Score</span>
              <span className="text-3xl font-black text-emerald-700">
                {aiAnalysis.overallReadinessScore}%
              </span>
            </div>
          </div>

          {/* Salary Impact Insight */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">Market Compensation Growth Potential</h4>
              <p className="text-emerald-800 mt-0.5 leading-relaxed">
                {aiAnalysis.salaryImpactInsight}
              </p>
            </div>
          </div>

          {/* Tailored Resume Bullet Suggestions */}
          {aiAnalysis.resumeBulletSuggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Recommended Resume Bullet Points (Showcasing Target Skills)
              </h4>
              <div className="space-y-2">
                {aiAnalysis.resumeBulletSuggestions.map((bullet, bIdx) => (
                  <div
                    key={bIdx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex items-start justify-between gap-3 text-neutral-800 group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <p className="leading-relaxed font-mono text-[11px]">{bullet}</p>
                    </div>
                    <button
                      onClick={() => handleCopyBullet(bullet, bIdx)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-neutral-600 hover:text-emerald-700 bg-white border border-neutral-200 rounded-md shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy bullet point to clipboard"
                    >
                      {copiedBulletIndex === bIdx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Interview Focus Areas */}
          {aiAnalysis.interviewPrepFocusAreas.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Key Technical Interview Focus Topics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {aiAnalysis.interviewPrepFocusAreas.map((topic, tIdx) => (
                  <div
                    key={tIdx}
                    className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 text-xs text-blue-900"
                  >
                    <span className="font-bold text-[10px] text-blue-600 block mb-0.5">
                      Focus Topic #{tIdx + 1}
                    </span>
                    <p className="text-[11px] leading-snug">{topic}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: Per-Job Detailed Breakdown Accordion */}
      {targetJobsToAnalyze.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Per-Job Fit Breakdown ({targetJobsToAnalyze.length} Saved Roles)
              </h3>
              <p className="text-xs text-neutral-500">
                Inspect which specific skills align and which are missing for each bookmarked employer.
              </p>
            </div>
          </div>

          <div className="divide-y divide-neutral-200">
            {targetJobsToAnalyze.map(job => {
              const isExpanded = expandedJobId === job.id;
              const jobMatched = job.skills.filter(s => resumeSkillsLower.has(s.toLowerCase().trim()));
              const jobMissing = job.skills.filter(s => !resumeSkillsLower.has(s.toLowerCase().trim()));
              const jobMatchPct = Math.round((jobMatched.length / Math.max(1, job.skills.length)) * 100);

              return (
                <div key={job.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="flex items-center justify-between gap-4 cursor-pointer select-none group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-700 text-xs shrink-0 overflow-hidden">
                        {job.companyLogo ? (
                          <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                        ) : (
                          job.companyName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                            {job.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {jobMatchPct}% Match
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                          {job.companyName} • {job.location} • {job.workplaceType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:block text-right text-xs">
                        <span className="text-emerald-700 font-semibold">{jobMatched.length} Matched</span>
                        <span className="text-neutral-300 mx-1.5">•</span>
                        <span className="text-amber-700 font-semibold">{jobMissing.length} Missing</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Skill Breakdown for this Job */}
                  {isExpanded && (
                    <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-200 text-xs space-y-3 animate-in fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Matched in this job */}
                        <div>
                          <span className="font-semibold text-neutral-700 block mb-1.5">
                            ✓ Your Matched Skills ({jobMatched.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {jobMatched.length === 0 ? (
                              <span className="text-neutral-400 text-[11px]">No exact skills matched yet.</span>
                            ) : (
                              jobMatched.map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium text-[11px] border border-emerald-200"
                                >
                                  ✓ {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Missing for this job */}
                        <div>
                          <span className="font-semibold text-neutral-700 block mb-1.5">
                            ✕ Missing for This Role ({jobMissing.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {jobMissing.length === 0 ? (
                              <span className="text-emerald-700 font-semibold text-[11px]">
                                Congratulations! You meet 100% of required skills for this role.
                              </span>
                            ) : (
                              jobMissing.map((s, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddSkill(s);
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 font-medium text-[11px] border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Click to add to your resume skills"
                                >
                                  ✕ {s} <Plus className="w-2.5 h-2.5" />
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                        <span className="text-neutral-400 text-[11px]">
                          Salary: ৳{job.salaryMinBdt.toLocaleString()} – ৳{job.salaryMaxBdt.toLocaleString()} / mo
                        </span>

                        <div className="flex items-center gap-2">
                          {onSelectJob && (
                            <button
                              onClick={() => onSelectJob(job)}
                              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                            >
                              View Full Listing →
                            </button>
                          )}
                          {onApplyJob && (
                            <button
                              onClick={() => onApplyJob(job)}
                              className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Apply Directly
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
