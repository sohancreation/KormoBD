import React, { useState } from 'react';
import { Application, JobListing, InterviewSchedule } from '../types';
import { 
  Sparkles, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  X, 
  ArrowRight, 
  Calendar, 
  Briefcase, 
  Clock, 
  Check, 
  ChevronRight,
  TrendingUp,
  FileText,
  Star,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CandidateComparisonTableProps {
  applications: Application[];
  jobs: JobListing[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onClearAll: () => void;
  onScheduleInterview: (app: Application) => void;
  onUpdateStatus: (id: string, status: Application['status']) => void;
  onOpenFeedback?: (app: Application) => void;
}

// Helper to extract experience years from text, answers, or summary
export function extractExperienceYears(app: Application): string {
  // Check aiAnalysis.relevantExperienceSummary or summary
  const fullText = `${app.candidateHeadline} ${app.resumeTextSnippet || ''} ${app.aiAnalysis?.relevantExperienceSummary || ''} ${JSON.stringify(app.answers || {})}`;
  
  const match = fullText.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  if (match && match[1]) {
    return `${match[1]}+ Years`;
  }
  if (app.candidateHeadline.toLowerCase().includes('senior') || app.candidateHeadline.toLowerCase().includes('lead')) {
    return '5+ Years';
  }
  if (app.candidateHeadline.toLowerCase().includes('junior') || app.candidateHeadline.toLowerCase().includes('intern')) {
    return '1-2 Years';
  }
  return '3-4 Years';
}

export const CandidateComparisonTable: React.FC<CandidateComparisonTableProps> = ({
  applications,
  jobs,
  selectedIds,
  onToggleSelect,
  onClearAll,
  onScheduleInterview,
  onUpdateStatus,
  onOpenFeedback
}) => {
  const [filterJobId, setFilterJobId] = useState<string>('all');

  // Filter candidates available for selection - sorted by updated effective rank
  const eligibleCandidates = applications
    .filter(app => (filterJobId === 'all' ? true : app.jobId === filterJobId))
    .sort((a, b) => {
      const scoreA = a.feedbackWeightedScore ?? a.aiAnalysis?.matchScore ?? 0;
      const scoreB = b.feedbackWeightedScore ?? b.aiAnalysis?.matchScore ?? 0;
      return scoreB - scoreA;
    });

  // Resolved selected applications
  const selectedApps = selectedIds
    .map(id => applications.find(a => a.id === id))
    .filter((a): a is Application => Boolean(a));

  // Auto pick top 2 or 3 candidates if none selected yet
  const handlePickTopCandidates = (count: number = 3) => {
    const topIds = eligibleCandidates.slice(0, count).map(c => c.id);
    onClearAll();
    topIds.forEach(id => onToggleSelect(id));
    confetti({ particleCount: 30, spread: 45 });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Selector Controls */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-5 rounded-2xl border border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Side-by-Side Comparison
            </span>
            <span className="text-xs text-neutral-400">
              • Compare Key Skills, Experience & AI Scores
            </span>
          </div>
          <h2 className="text-lg font-bold mt-1 text-white">Compare Candidates Matrix</h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Select up to 4 candidates to benchmark qualifications, missing skills, and AI summaries side-by-side.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => handlePickTopCandidates(2)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-neutral-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Compare Top 2
          </button>
          <button
            onClick={() => handlePickTopCandidates(3)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Compare Top 3
          </button>
          {selectedIds.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Clear Selection ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Candidate Selector Badges Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Filter Position:</span>
            <select
              value={filterJobId}
              onChange={e => setFilterJobId(e.target.value)}
              className="border border-neutral-200 rounded-lg p-1.5 bg-neutral-50 text-neutral-800 text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Positions ({applications.length} applicants)</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-neutral-500">
            Click candidates below to add or remove them from comparison:
          </span>
        </div>

        {/* Candidate Pills list */}
        <div className="flex flex-wrap gap-2 pt-1">
          {eligibleCandidates.map(app => {
            const isSelected = selectedIds.includes(app.id);
            const score = app.aiAnalysis?.matchScore ?? 75;

            return (
              <button
                key={app.id}
                onClick={() => onToggleSelect(app.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <span className="font-semibold">{app.candidateName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {score}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Side-by-Side Comparison Matrix */}
      {selectedApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center shadow-xs">
          <Award className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No Candidates Selected for Comparison</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
            Click on candidate chips above or use the "Compare Top 2" or "Compare Top 3" buttons to launch the matrix.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => handlePickTopCandidates(2)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Select Top 2 Ranked
            </button>
            <button
              onClick={() => handlePickTopCandidates(3)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              Select Top 3 Ranked
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/80">
                  <th className="p-4 font-bold text-neutral-500 w-44 min-w-[170px] uppercase text-[11px] tracking-wider">
                    Evaluation Metric
                  </th>
                  {selectedApps.map((app, index) => {
                    const score = app.feedbackWeightedScore ?? app.aiAnalysis?.matchScore ?? 75;
                    const maxScore = Math.max(...selectedApps.map(a => a.feedbackWeightedScore ?? a.aiAnalysis?.matchScore ?? 0));
                    const isWinner = index === 0 && score === maxScore;

                    return (
                      <th
                        key={app.id}
                        className={`p-4 font-bold text-neutral-900 min-w-[260px] align-top relative border-l border-neutral-200 first:border-l-0 ${
                          isWinner ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold text-neutral-900">
                                {app.candidateName}
                              </span>
                              {isWinner && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  #1 Highest Rank
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                              {app.jobTitle}
                            </p>
                          </div>
                          <button
                            onClick={() => onToggleSelect(app.id)}
                            className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-200/50 cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Quick action toolbar for candidate */}
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => onScheduleInterview(app)}
                            className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Calendar className="w-3 h-3 text-emerald-400" /> Interview
                          </button>

                          {onOpenFeedback && (
                            <button
                              onClick={() => onOpenFeedback(app)}
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                app.interviewFeedback
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                              }`}
                              title="Input or view post-interview feedback and ratings"
                            >
                              <Star className={`w-3 h-3 ${app.interviewFeedback ? 'fill-amber-500 text-amber-500' : 'text-emerald-700'}`} />
                              {app.interviewFeedback ? `Feedback (★${app.interviewFeedback.averageRating})` : 'Feedback'}
                            </button>
                          )}

                          <select
                            value={app.status}
                            onChange={e => onUpdateStatus(app.id, e.target.value as Application['status'])}
                            className="text-[10px] border border-neutral-200 bg-white rounded-md px-1.5 py-1 text-neutral-700 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="applied">Applied</option>
                            <option value="under_review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="selected">Hired / Offered</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200">
                {/* 1. Candidate Ranking Score (Updated Composite) */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Overall Candidate Rank
                  </td>
                  {selectedApps.map(app => {
                    const score = app.feedbackWeightedScore ?? app.aiAnalysis?.matchScore ?? 75;
                    const isUpdated = Boolean(app.feedbackWeightedScore);
                    return (
                      <td key={app.id} className="p-4 border-l border-neutral-200">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-black text-emerald-700">{score}%</div>
                            <div className="flex-1 bg-neutral-200 rounded-full h-2 max-w-[100px] overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                          {isUpdated ? (
                            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              Rank updated via interview ratings
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 block">
                              AI Resume screening score
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Post-Interview Evaluation & Ratings */}
                <tr className="hover:bg-neutral-50/50 transition-colors bg-amber-50/20">
                  <td className="p-4 font-bold text-neutral-800 bg-amber-50/40">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 inline mr-1.5" />
                    Interview Ratings & Qualitative Notes
                  </td>
                  {selectedApps.map(app => {
                    const fb = app.interviewFeedback;
                    return (
                      <td key={app.id} className="p-4 border-l border-neutral-200">
                        {fb ? (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {fb.averageRating} / 5.0 Rating
                              </span>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-neutral-900 text-white">
                                {fb.recommendation.replace(/_/g, ' ')}
                              </span>
                            </div>

                            {/* Qualitative notes */}
                            <div className="p-2 rounded-lg bg-white border border-neutral-200 text-[11px] text-neutral-700 leading-relaxed">
                              <span className="font-semibold text-neutral-900 block mb-0.5">Recruiter Observations:</span>
                              "{fb.summaryNotes}"
                            </div>

                            {/* Strengths & Growth */}
                            <div className="text-[10px] space-y-1 text-neutral-600">
                              <div>
                                <span className="font-bold text-emerald-700">Strengths:</span> {fb.keyStrengths}
                              </div>
                              <div>
                                <span className="font-bold text-amber-700">Growth areas:</span> {fb.areasForImprovement}
                              </div>
                            </div>

                            {/* Mini rating indicators */}
                            <div className="grid grid-cols-2 gap-1 text-[9px] text-neutral-500 pt-1 border-t border-neutral-200">
                              <span>Tech: <b>{fb.ratings.technicalProficiency}/5</b></span>
                              <span>Logic: <b>{fb.ratings.problemSolving}/5</b></span>
                              <span>Comm: <b>{fb.ratings.communicationSkills}/5</b></span>
                              <span>Culture: <b>{fb.ratings.culturalFit}/5</b></span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-neutral-50 border border-dashed border-neutral-300 text-center space-y-2">
                            <span className="text-[11px] text-neutral-500 block">
                              No post-interview feedback recorded yet
                            </span>
                            {onOpenFeedback && (
                              <button
                                onClick={() => onOpenFeedback(app)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <Star className="w-3 h-3 fill-current" />
                                Add Interview Feedback
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Years of Experience */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30">
                    <Clock className="w-3.5 h-3.5 text-blue-600 inline mr-1.5" />
                    Experience Years
                  </td>
                  {selectedApps.map(app => {
                    const expYears = extractExperienceYears(app);
                    return (
                      <td key={app.id} className="p-4 border-l border-neutral-200">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-block">
                          {expYears}
                        </span>
                        <p className="text-[11px] text-neutral-600 mt-1.5 line-clamp-2">
                          {app.aiAnalysis?.relevantExperienceSummary || app.candidateHeadline}
                        </p>
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Key Matching Skills */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline mr-1.5" />
                    Key Verified Skills
                  </td>
                  {selectedApps.map(app => (
                    <td key={app.id} className="p-4 border-l border-neutral-200">
                      <div className="flex flex-wrap gap-1.5">
                        {app.aiAnalysis?.matchingSkills && app.aiAnalysis.matchingSkills.length > 0 ? (
                          app.aiAnalysis.matchingSkills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-semibold"
                            >
                              ✓ {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-neutral-400">None detected</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 4. Missing Skills Gap */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 inline mr-1.5" />
                    Missing Skills Gap
                  </td>
                  {selectedApps.map(app => (
                    <td key={app.id} className="p-4 border-l border-neutral-200">
                      <div className="flex flex-wrap gap-1.5">
                        {app.aiAnalysis?.missingSkills && app.aiAnalysis.missingSkills.length > 0 ? (
                          app.aiAnalysis.missingSkills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[11px] font-medium"
                            >
                              ✕ {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-600">
                            No critical missing skills
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 5. Key Strengths Identified by AI */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30">
                    <Award className="w-3.5 h-3.5 text-indigo-600 inline mr-1.5" />
                    AI Strengths Analysis
                  </td>
                  {selectedApps.map(app => (
                    <td key={app.id} className="p-4 border-l border-neutral-200">
                      <ul className="space-y-1">
                        {app.aiAnalysis?.strengths && app.aiAnalysis.strengths.length > 0 ? (
                          app.aiAnalysis.strengths.map((str, idx) => (
                            <li key={idx} className="text-[11px] text-neutral-700 flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                              <span>{str}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-[11px] text-neutral-400">No strengths logged</li>
                        )}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* 6. AI Summary & Evaluation */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30">
                    <FileText className="w-3.5 h-3.5 text-neutral-600 inline mr-1.5" />
                    AI Summary Verdict
                  </td>
                  {selectedApps.map(app => (
                    <td key={app.id} className="p-4 border-l border-neutral-200">
                      <p className="text-[11px] text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                        {app.aiAnalysis?.summary || 'Candidate under preliminary evaluation.'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* 7. Location & Contact Details */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30">
                    Location & Email
                  </td>
                  {selectedApps.map(app => (
                    <td key={app.id} className="p-4 border-l border-neutral-200">
                      <div className="text-[11px] text-neutral-700 font-medium">{app.candidateLocation}</div>
                      <div className="text-[11px] text-neutral-500">{app.candidateEmail}</div>
                      <div className="text-[11px] text-neutral-400">{app.candidatePhone}</div>
                    </td>
                  ))}
                </tr>

                {/* 8. Screening Answers (If Provided) */}
                <tr className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-bold text-neutral-700 bg-neutral-50/30">
                    Screening Responses
                  </td>
                  {selectedApps.map(app => {
                    const answersList = Object.entries(app.answers || {});
                    return (
                      <td key={app.id} className="p-4 border-l border-neutral-200">
                        {answersList.length === 0 ? (
                          <span className="text-[11px] text-neutral-400">No custom screening questions answered</span>
                        ) : (
                          <div className="space-y-2">
                            {answersList.slice(0, 2).map(([qKey, ans], aIdx) => (
                              <div key={aIdx} className="text-[11px] bg-neutral-50 p-2 rounded border border-neutral-100">
                                <span className="font-semibold text-neutral-700 block text-[10px]">Response #{aIdx + 1}:</span>
                                <span className="text-neutral-600 italic">{ans}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
