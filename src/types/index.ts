export type UserRole = 'jobseeker' | 'recruiter' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
  profileCompleted?: boolean;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  description?: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  responsibilities: string[];
  technologies?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  githubUrl?: string;
  technologies: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface JobSeekerProfile {
  uid: string;
  fullName: string;
  email: string;
  headline: string;
  bio: string;
  phone: string;
  location: string;
  address?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: string[];
  preferredRoles: string[];
  preferredIndustries: string[];
  preferredLocations: string[];
  expectedSalaryBdt?: number;
  employmentPreference: 'Full-time' | 'Part-time' | 'Remote' | 'Hybrid' | 'Internship' | 'Contract';
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUpdatedAt?: string;
  completionScore: number;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  recruiterId: string;
  name: string;
  logo: string;
  industry: string;
  companySize: string;
  foundedYear: number;
  website: string;
  email: string;
  phone: string;
  location: string; // e.g., "Dhaka, Bangladesh"
  description: string;
  verified: boolean;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
}

export type ScreeningQuestionType = 
  | 'short_answer' 
  | 'long_answer' 
  | 'multiple_choice' 
  | 'yes_no' 
  | 'number' 
  | 'portfolio_url' 
  | 'file_upload';

export interface ScreeningQuestion {
  id: string;
  question: string;
  type: ScreeningQuestionType;
  required: boolean;
  options?: string[]; // For multiple_choice
  idealAnswer?: string;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Freelance';
export type WorkplaceType = 'On-site' | 'Remote' | 'Hybrid';
export type JobStatus = 'active' | 'paused' | 'closed' | 'draft';

export interface JobListing {
  id: string;
  recruiterId: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  department: string;
  industry: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  openingsCount: number;
  experienceLevel: 'Entry-level' | 'Junior' | 'Mid-level' | 'Senior' | 'Lead' | 'Director';
  educationRequired: string;
  salaryMinBdt: number;
  salaryMaxBdt: number;
  isSalaryNegotiable?: boolean;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  questions: ScreeningQuestion[];
  deadline: string; // ISO date
  status: JobStatus;
  applicantsCount: number;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
}

export type ApplicationStatus = 
  | 'applied' 
  | 'under_review' 
  | 'shortlisted' 
  | 'interview' 
  | 'selected' 
  | 'rejected' 
  | 'withdrawn';

export interface CandidateAnalysis {
  matchScore: number; // 0-100
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  relevantExperienceSummary: string;
  screeningAnswersEvaluation?: string;
  strengths: string[];
  concerns: string[];
  disclaimer: string;
  analyzedAt: string;
}

export interface InterviewFeedbackRatings {
  technicalProficiency: number; // 1-5
  problemSolving: number;       // 1-5
  communicationSkills: number;  // 1-5
  culturalFit: number;          // 1-5
  leadershipPotential: number; // 1-5
}

export type HiringRecommendation = 'strong_hire' | 'hire' | 'lean_hire' | 'lean_no_hire' | 'no_hire';

export interface InterviewFeedback {
  interviewerId: string;
  interviewerName: string;
  submittedAt: string;
  ratings: InterviewFeedbackRatings;
  averageRating: number; // 1.0 - 5.0
  scaledScore: number;   // 0 - 100
  recommendation: HiringRecommendation;
  summaryNotes: string;
  keyStrengths: string;
  areasForImprovement: string;
  nextStepDecision?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateHeadline: string;
  candidateLocation: string;
  recruiterId: string;
  resumeFileName?: string;
  resumeTextSnippet?: string;
  answers: Record<string, string>; // questionId -> answer
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  aiAnalysis?: CandidateAnalysis;
  recruiterNotes?: string;
  interviewFeedback?: InterviewFeedback;
  feedbackWeightedScore?: number; // Updated overall score factoring in interview rating + AI resume match score
  timeline: {
    status: ApplicationStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'interview' | 'status' | 'job_alert' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  recruiterId: string;
  companyName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: 'Online' | 'Phone' | 'In-person';
  meetingLinkOrLocation: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  feedback?: InterviewFeedback;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; action: string }[];
}

export type InterviewRoundType = 'technical' | 'behavioral' | 'system_design' | 'culture_fit' | 'full_mixed';

export interface MockInterviewQuestion {
  id: string;
  questionNumber: number;
  type: 'technical' | 'behavioral' | 'system_design' | 'situational';
  question: string;
  interviewerContext: string;
  keyTopicsExpected: string[];
  sampleHints: string[];
  sampleExemplar?: string;
}

export interface MockInterviewEvaluation {
  questionId: string;
  score: number; // 0-100
  clarityScore: number; // 0-100
  clarityFeedback: string;
  confidenceScore: number; // 0-100
  confidenceFeedback: string;
  keywordScore: number; // 0-100
  keywordsUsed: string[];
  keywordsMissed: string[];
  starCompliance?: {
    usedStar: boolean;
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
    feedback?: string;
  };
  strengths: string[];
  critiques: string[];
  actionableTip: string;
  exemplarAnswer: string;
}

export interface MockInterviewFinalReport {
  overallScore: number;
  recommendation: 'strong_hire' | 'hire' | 'lean_hire' | 'lean_no_hire' | 'no_hire';
  readinessAssessment: string;
  averageClarity: number;
  averageConfidence: number;
  averageKeywordScore: number;
  topStrengths: string[];
  priorityImprovements: string[];
  actionPlan: string[];
}

export interface CompletedMockSession {
  id: string;
  date: string;
  jobTitle: string;
  companyName: string;
  roundType: InterviewRoundType;
  questionsCount: number;
  report: MockInterviewFinalReport;
  qaHistory: Array<{
    question: MockInterviewQuestion;
    userAnswer: string;
    evaluation: MockInterviewEvaluation;
  }>;
}

export type CoverLetterTone = 'formal' | 'startup' | 'leadership';
export type CoverLetterLength = 'concise' | 'standard' | 'detailed';

export interface TailoredCoverLetterResult {
  subject: string;
  salutation: string;
  openingHook: string;
  bodyParagraphs: string[];
  coreAlignments: Array<{ skillOrProject: string; whyItFits: string }>;
  companyConnection: string;
  closingCallToAction: string;
  signOff: string;
  fullText: string;
  tone: CoverLetterTone;
  keyStrengthsHighlighted: string[];
}

export interface CourseResource {
  id: string;
  skill: string;
  title: string;
  platform: 'Coursera' | 'freeCodeCamp' | 'Udemy' | 'YouTube' | 'edX';
  url: string;
  isFree: boolean;
  estimatedHours: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  reviewCount: string;
  certificationAvailable: boolean;
  summary: string;
  syllabusHighlights: string[];
}

export interface SkillRoadmapProgress {
  skill: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  completedAt?: string;
  notes?: string;
}

export type ApplicationMilestoneKey = 
  | 'submitted' 
  | 'resume_viewed' 
  | 'screening_passed' 
  | 'interview_scheduled' 
  | 'evaluation_recorded' 
  | 'offer_extended'
  | 'decision';

export interface ApplicationMilestone {
  key: ApplicationMilestoneKey;
  label: string;
  stageName: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
  timestamp?: string;
  notes?: string;
  recruiterAction?: string;
  nudgeNotificationSent?: boolean;
}

// ==========================================
// 1. Bulk Resume Screening & Ranking Types
// ==========================================
export type BatchScreeningTier = 'top_tier' | 'review_needed' | 'not_qualified';

export interface BatchScreenedCandidate {
  id: string;
  candidateName: string;
  email: string;
  phone?: string;
  fileName: string;
  matchScore: number; // 0-100
  tier: BatchScreeningTier;
  headline: string;
  experienceYears: number;
  educationSummary: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  concernsOrRedFlags: string[];
  recommendation: string;
  rawSummary: string;
  selected?: boolean;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview_invited';
}

// ==========================================
// 2. Technical Assessment & Quiz Types
// ==========================================
export type QuizQuestionType = 'multiple_choice' | 'code_snippet' | 'scenario';
export type QuizDifficulty = 'junior' | 'mid' | 'senior' | 'lead';

export interface TechnicalQuizQuestion {
  id: string;
  question: string;
  type: QuizQuestionType;
  codeSnippet?: string;
  options: string[]; // 4 options
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation: string; // Answer key & reasoning
  category: string; // e.g. React Performance, TypeScript, SQL, System Architecture
  difficulty: QuizDifficulty;
  points: number;
}

export interface TechnicalAssessmentQuiz {
  id: string;
  jobId: string;
  jobTitle: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercent: number;
  questions: TechnicalQuizQuestion[];
  createdAt: string;
  totalPossiblePoints: number;
}

export interface AssessmentSubmission {
  id: string;
  quizId: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  scorePercent: number;
  totalScore: number;
  maxScore: number;
  passed: boolean;
  completedAt: string;
  durationSeconds: number;
  questionResults: Array<{
    questionId: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
  }>;
}

// ==========================================
// 3. Collaborative Hiring Team Scorecards
// ==========================================
export type HiringScorecardReviewerRole = 
  | 'technical_lead' 
  | 'hr_talent' 
  | 'executive' 
  | 'hiring_manager';

export type ScorecardRecommendation = 
  | 'strong_hire' 
  | 'hire' 
  | 'neutral' 
  | 'no_hire' 
  | 'strong_no_hire';

export interface IndividualInterviewerScorecard {
  id: string;
  reviewerName: string;
  reviewerRole: HiringScorecardReviewerRole;
  avatar?: string;
  submittedAt: string;
  recommendation: ScorecardRecommendation;
  ratings: {
    technicalSkills: number;  // 1-5
    problemSolving: number;   // 1-5
    cultureAndValues: number; // 1-5
    communication: number;    // 1-5
    leadership: number;       // 1-5
  };
  overallScore: number; // average of ratings (1.0 - 5.0)
  privateNotes: string;
  keyStrengths: string;
  redFlagsOrRisks: string;
}

export interface CollaborativeCandidateEvaluation {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  reviews: IndividualInterviewerScorecard[];
  averageScore: number; // 1.0 - 5.0
  recommendationSummary: {
    strongHires: number;
    hires: number;
    neutrals: number;
    noHires: number;
    strongNoHires: number;
  };
  consensusVerdict?: 'strong_hire' | 'hire' | 'mixed_debrief_needed' | 'no_hire';
  finalCommitteeDecision?: 'approved_for_offer' | 'rejected' | 'additional_round_needed';
  committeeDecisionNotes?: string;
  updatedAt: string;
}

// ==========================================
// 4. Offer Letter Builder & Digital Signature
// ==========================================
export type OfferLetterStatus = 'draft' | 'sent' | 'accepted' | 'declined';

export interface OfferLetterData {
  id: string;
  applicationId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  candidateAddress?: string;
  jobTitle: string;
  department: string;
  companyName: string;
  companyAddress: string;
  companyLogo?: string;
  monthlySalaryBdt: number;
  annualSalaryBdt: number;
  bonusStructure: string;
  stockOptionsUnits?: string;
  joiningDate: string;
  probationMonths: number;
  workLocation: string;
  reportingManager: string;
  workingHours: string;
  benefits: string[];
  offerExpiryDate: string;
  status: OfferLetterStatus;
  specialConditions?: string;
  recruiterSignatureName: string;
  recruiterSignatureTitle: string;
  recruiterSignatureDate: string;
  recruiterSignatureDataUrl?: string;
  candidateSignatureDate?: string;
  candidateSignatureDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}
