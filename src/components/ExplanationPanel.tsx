import type { StructureResult, SemanticResult } from '../analysis/types';
import { Code } from './Code';
import { Tooltip } from './Tooltip';

interface ObservationRow {
  observed: React.ReactNode;
  meaning: React.ReactNode;
}

function buildObservations(
  structure: StructureResult,
  semantics: SemanticResult
): ObservationRow[] {
  const machinesTooltip = (
    <Tooltip text="Machines refers to automated systems like search engines, screen readers, and AI agents that parse HTML.">
      Machines
    </Tooltip>
  );

  const inferredTooltip = (
    <Tooltip text="Inferred means the system must guess meaning from context, class names, or visual patterns.">
      inferred
    </Tooltip>
  );

  return [
    {
      observed:
        structure.differenceCount === 0
          ? '3 fetches returned identical structure'
          : <>{structure.differenceCount} structural difference(s) across 3 fetches</>,
      meaning:
        structure.classification === 'deterministic'
          ? <>{machinesTooltip} receive consistent structure</>
          : 'Structure may vary between reads',
    },
    {
      observed:
        semantics.headings.h1Count === 1 && !semantics.headings.hasSkips
          ? <>1 <Code>h1</Code>, no skipped heading levels</>
          : <>{semantics.headings.h1Count} <Code>h1</Code>(s){semantics.headings.hasSkips ? ', skipped levels' : ''}</>,
      meaning:
        semantics.headings.h1Count === 1 && !semantics.headings.hasSkips
          ? 'Document outline is parseable'
          : 'Document outline requires reconstruction',
    },
    {
      observed: <>{semantics.landmarks.coveragePercent}% of content in landmark regions</>,
      meaning:
        semantics.landmarks.coveragePercent >= 80
          ? 'Content regions are structurally defined'
          : 'Content requires contextual interpretation',
    },
    {
      observed: <>{Math.round(semantics.divRatio * 100)}% <Code>div/span</Code> ratio</>,
      meaning:
        semantics.divRatio < 0.6
          ? 'Semantic elements provide structural hints'
          : <>Meaning must be {inferredTooltip} from classes or content</>,
    },
    {
      observed:
        semantics.linkIssues === 0
          ? 'All links have descriptive text'
          : <>{semantics.linkIssues} link(s) with generic or missing text</>,
      meaning:
        semantics.linkIssues === 0
          ? 'Link purposes are explicit in markup'
          : (
            <>
              Link purpose requires context{' '}
              <Tooltip text="Inference means the system must guess meaning from surrounding text or context.">
                inference
              </Tooltip>
            </>
          ),
    },
  ];
}

interface ExplanationPanelProps {
  structure: StructureResult;
  semantics: SemanticResult;
}

function ObservationPair({ observed, meaning }: ObservationRow) {
  return (
    <div className="rounded-lg bg-white p-5 ring-1 ring-gray-200/60 transition-shadow hover:shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
        {/* Observation */}
        <div className="flex-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            What we found
          </p>
          <p className="text-sm leading-relaxed text-gray-900">{observed}</p>
        </div>

        {/* Arrow - desktop only */}
        <div className="hidden shrink-0 self-center text-gray-300 md:block">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>

        {/* Meaning */}
        <div className="flex-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            What it means for machines
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{meaning}</p>
        </div>
      </div>
    </div>
  );
}

export function ExplanationPanel({
  structure,
  semantics,
}: ExplanationPanelProps) {
  const observations = buildObservations(structure, semantics);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Observations
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          Each observation maps to an interpretation of what machines can extract.
        </p>
      </div>

      {/* Observation pairs */}
      <div className="space-y-3">
        {observations.map((row, i) => (
          <ObservationPair key={i} observed={row.observed} meaning={row.meaning} />
        ))}
      </div>
    </div>
  );
}
