import type { AnalysisResult } from '../analysis/types';


interface AnalysisEntry {
  url: string;
  timestamp: string;
  result: AnalysisResult;
}

interface ComparisonViewProps {
  entries: AnalysisEntry[];
  onClose: () => void;
}

function ComparisonMetricRow({ 
  label, 
  values 
}: { 
  label: string; 
  values: (string | number)[] 
}) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-2 pr-4 text-sm font-medium text-gray-700">{label}</td>
      {values.map((value, index) => (
        <td key={index} className="py-2 px-4 text-sm text-gray-600">
          {value}
        </td>
      ))}
    </tr>
  );
}

export function ComparisonView({ entries, onClose }: ComparisonViewProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-6xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Compare Analyses
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Metric
                </th>
                {entries.map((_, index) => (
                  <th key={index} className="pb-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Analysis {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonMetricRow
                label="URL"
                values={entries.map(e => new URL(e.url).hostname)}
              />
              <ComparisonMetricRow
                label="Timestamp"
                values={entries.map(e => new Date(e.timestamp).toLocaleString())}
              />
              <tr><td colSpan={entries.length + 1} className="py-2"></td></tr>
              
              <tr className="bg-gray-50">
                <td colSpan={entries.length + 1} className="py-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Structure
                </td>
              </tr>
              <ComparisonMetricRow
                label="Classification"
                values={entries.map(e => e.result.structure.classification)}
              />
              <ComparisonMetricRow
                label="Difference Count"
                values={entries.map(e => e.result.structure.differenceCount)}
              />
              
              <tr><td colSpan={entries.length + 1} className="py-2"></td></tr>
              
              <tr className="bg-gray-50">
                <td colSpan={entries.length + 1} className="py-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Semantics
                </td>
              </tr>
              <ComparisonMetricRow
                label="Classification"
                values={entries.map(e => e.result.semantics.classification)}
              />
              <ComparisonMetricRow
                label="H1 Count"
                values={entries.map(e => e.result.semantics.headings.h1Count)}
              />
              <ComparisonMetricRow
                label="Has Heading Skips"
                values={entries.map(e => e.result.semantics.headings.hasSkips ? 'Yes' : 'No')}
              />
              <ComparisonMetricRow
                label="Landmark Coverage"
                values={entries.map(e => `${e.result.semantics.landmarks.coveragePercent}%`)}
              />
              <ComparisonMetricRow
                label="Div/Span Ratio"
                values={entries.map(e => `${Math.round(e.result.semantics.divRatio * 100)}%`)}
              />
              <ComparisonMetricRow
                label="Link Issues"
                values={entries.map(e => e.result.semantics.linkIssues)}
              />
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

interface ComparisonButtonProps {
  onCompare: () => void;
  analysisCount: number;
}

export function ComparisonButton({ onCompare, analysisCount }: ComparisonButtonProps) {
  return (
    <button
      onClick={onCompare}
      disabled={analysisCount < 2}
      className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      title={analysisCount < 2 ? 'Run at least 2 analyses to compare' : 'Compare analyses'}
    >
      Compare ({analysisCount})
    </button>
  );
}

// Storage helpers
export function saveAnalysis(url: string, result: AnalysisResult) {
  try {
    const history = getAnalysisHistory();
    const entry: AnalysisEntry = {
      url,
      timestamp: new Date().toISOString(),
      result,
    };
    const updated = [entry, ...history].slice(0, 10); // Keep last 10
    localStorage.setItem('devSignalsAnalyses', JSON.stringify(updated));
  } catch {}
}

export function getAnalysisHistory(): AnalysisEntry[] {
  try {
    const data = localStorage.getItem('devSignalsAnalyses');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearAnalysisHistory() {
  try {
    localStorage.removeItem('devSignalsAnalyses');
  } catch {}
}
