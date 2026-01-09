import type { StructureResult, SemanticResult } from '../analysis/types';
import { Code } from './Code';
import { Tooltip } from './Tooltip';

type SignalStatus = 'good' | 'warning' | 'issue';

interface SignalItem {
  status: SignalStatus;
  text: React.ReactNode;
}

function SignalMarker({ status }: { status: SignalStatus }) {
  const markers = {
    good: { symbol: '✓', className: 'text-emerald-600/70' },
    warning: { symbol: '○', className: 'text-amber-500/70' },
    issue: { symbol: '–', className: 'text-gray-400' },
  };

  const { symbol, className } = markers[status];

  return (
    <span className={`mr-3 inline-block w-4 text-center font-medium ${className}`}>
      {symbol}
    </span>
  );
}

function SignalList({ items }: { items: SignalItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start text-sm text-gray-700">
          <SignalMarker status={item.status} />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

interface StructuralSignalsProps {
  structure: StructureResult;
}

export function StructuralSignals({ structure }: StructuralSignalsProps) {
  const items: SignalItem[] = [];

  if (structure.differenceCount === 0) {
    items.push({
      status: 'good',
      text: 'Identical structure across 3 fetches',
    });
  } else {
    items.push({
      status: 'warning',
      text: <>{structure.differenceCount} structural difference(s) detected</>,
    });
  }

  if (structure.classification === 'deterministic') {
    items.push({
      status: 'good',
      text: <>DOM tree is deterministic</>,
    });
  } else if (structure.classification === 'mostly-deterministic') {
    items.push({
      status: 'warning',
      text: <>Minor variations in DOM structure</>,
    });
  } else {
    items.push({
      status: 'issue',
      text: 'Structure changes between requests',
    });
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 sm:p-6">
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Structural Signals
      </h3>
      <p className="mb-4 text-xs text-gray-400 sm:mb-5">
        How consistently the page renders its DOM tree across requests.
      </p>
      <SignalList items={items} />
    </div>
  );
}

interface SemanticSignalsProps {
  semantics: SemanticResult;
}

export function SemanticSignals({ semantics }: SemanticSignalsProps) {
  const items: SignalItem[] = [];

  // Headings
  if (semantics.headings.h1Count === 1 && !semantics.headings.hasSkips) {
    items.push({
      status: 'good',
      text: <>Single <Code>h1</Code>, no skipped heading levels</>,
    });
  } else if (semantics.headings.h1Count === 1) {
    items.push({
      status: 'warning',
      text: <>Single <Code>h1</Code>, but heading levels are skipped</>,
    });
  } else if (semantics.headings.h1Count === 0) {
    items.push({
      status: 'issue',
      text: <>No <Code>h1</Code> element found</>,
    });
  } else {
    items.push({
      status: 'warning',
      text: <>{semantics.headings.h1Count} <Code>h1</Code> elements (expected 1)</>,
    });
  }

  // Landmarks
  const landmarkTooltip = (
    <Tooltip text="Landmark regions are semantic containers like main, nav, header, and footer that define page structure.">
      landmark regions
    </Tooltip>
  );
  if (semantics.landmarks.coveragePercent >= 80) {
    items.push({
      status: 'good',
      text: <>{semantics.landmarks.coveragePercent}% content in {landmarkTooltip}</>,
    });
  } else if (semantics.landmarks.coveragePercent >= 50) {
    items.push({
      status: 'warning',
      text: <>{semantics.landmarks.coveragePercent}% content in {landmarkTooltip}</>,
    });
  } else {
    items.push({
      status: 'issue',
      text: <>Only {semantics.landmarks.coveragePercent}% content in landmarks</>,
    });
  }

  // Div ratio
  const divPercent = Math.round(semantics.divRatio * 100);
  const divRatioTooltip = (
    <Tooltip text="The ratio of generic elements (div, span) to semantic elements. Lower values indicate more meaningful markup.">
      <Code>div/span</Code> ratio
    </Tooltip>
  );
  if (semantics.divRatio < 0.4) {
    items.push({
      status: 'good',
      text: <>{divPercent}% {divRatioTooltip}</>,
    });
  } else if (semantics.divRatio < 0.6) {
    items.push({
      status: 'warning',
      text: <>{divPercent}% {divRatioTooltip}</>,
    });
  } else {
    items.push({
      status: 'issue',
      text: <>{divPercent}% {divRatioTooltip} (heavy on generic elements)</>,
    });
  }

  // Links
  if (semantics.linkIssues === 0) {
    items.push({
      status: 'good',
      text: 'All links have descriptive text',
    });
  } else {
    items.push({
      status: 'warning',
      text: <>{semantics.linkIssues} link(s) with generic or missing text</>,
    });
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 sm:p-6">
      <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Semantic Signals
      </h3>
      <p className="mb-4 text-xs text-gray-400 sm:mb-5">
        How much meaning is encoded in markup rather than inferred from presentation.
      </p>
      <SignalList items={items} />
    </div>
  );
}

interface SignalPanelsProps {
  structure: StructureResult;
  semantics: SemanticResult;
}

export function SignalPanels({ structure, semantics }: SignalPanelsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      <StructuralSignals structure={structure} />
      <SemanticSignals semantics={semantics} />
    </div>
  );
}
