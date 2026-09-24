import React, { useState } from 'react';
import { searchWithGoogleGrounding, GroundingSource } from '../services/aiService';
import { 
  Search, 
  Globe, 
  ExternalLink, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  Coins, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const MarketIntelligence: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);

  const suggestedQueries = [
    'Software Engineer salary benchmarks in Dhaka Bangladesh 2026',
    'Most in-demand programming languages and tech stacks in Bangladesh',
    'Hiring trends and tech companies expanding in Bangladesh',
    'Average entry level developer salary in BDT'
  ];

  const handleSearch = async (targetQuery?: string) => {
    const q = targetQuery || query;
    if (!q.trim() || loading) return;

    setLoading(true);
    setResultText(null);
    setSources([]);

    try {
      const res = await searchWithGoogleGrounding(q);
      setResultText(res.text);
      setSources(res.sources);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
          <Globe className="w-4 h-4" /> Real-Time Market Intelligence
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
          Google Search Grounded Salary & Job Market Research
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Query live web data via Advanced AI and Google Search to verify real salaries (BDT), company hiring rounds, tech stacks, and economic trends.
        </p>

        {/* Search input bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. Senior Frontend salary ranges in Dhaka, bKash engineering tech stack..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Live Search Grounding
              </>
            )}
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-neutral-400 shrink-0 font-medium">Quick trends:</span>
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleSearch(q);
              }}
              className="whitespace-nowrap px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg cursor-pointer transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Grounded Result Display */}
      {resultText && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Grounded Search Findings</h3>
                <span className="text-[11px] text-emerald-600 font-medium">Powered by AI + Live Search Grounding</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-600">
              Verified Web Signals
            </span>
          </div>

          <div className="prose prose-neutral max-w-none text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-line">
            {resultText}
          </div>

          {/* Sources / Citations */}
          {sources.length > 0 && (
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" /> Grounding Sources & References ({sources.length}):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 text-neutral-800 flex items-center justify-between group transition-colors"
                  >
                    <span className="truncate font-medium group-hover:text-emerald-700">{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-emerald-700 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
