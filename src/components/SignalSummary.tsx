import type { StructureResult, SemanticResult } from '../analysis/types';
import { StatusPill, type Tone } from './StatusPill';
import { Tooltip } from './Tooltip';

interface SummaryCardProps {
  title: React.ReactNode;
  classification: string;
  classificationTooltip: string;
  tone: Tone;
  description: string;
}

function SummaryCard({
  title,
  classification,
  classificationTooltip,
  tone,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 sm:p-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:mb-4">
        {title}
      </h2>
      <div className="mb-3 sm:mb-4">
        <Tooltip text={classificationTooltip}>
          <StatusPill label={classification} tone={tone} />
        </Tooltip>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function getStructureTone(
  classification: StructureResult['classification']
): Tone {
  if (classification === 'deterministic') return 'neutral';
  return 'muted';
}

function getSemanticsTone(
  classification: SemanticResult['classification']
): Tone {
  if (classification === 'explicit') return 'positive';
  return 'muted';
}

function getStructureDescription(structure: StructureResult): string {
  if (structure.classification === 'deterministic') {
    return 'Document structure is consistent across requests.';
  }
  if (structure.classification === 'mostly-deterministic') {
    return 'Minor structural variations detected between requests.';
  }
  return 'Structure varies significantly between requests.';
}

function getSemanticsDescription(semantics: SemanticResult): string {
  if (semantics.classification === 'explicit') {
    return 'Semantic meaning is conveyed through HTML elements.';
  }
  if (semantics.classification === 'partial') {
    return 'Some semantic structure present, with gaps.';
  }
  return 'Meaning relies on visual presentation or inference.';
}

function getStructureTooltip(
  classification: StructureResult['classification']
): string {
  if (classification === 'deterministic') {
    return 'Deterministic means repeated requests produce the same DOM structure.';
  }
  if (classification === 'mostly-deterministic') {
    return 'Mostly-deterministic means the structure is largely stable with minor variations.';
  }
  return 'Unstable means the DOM structure changes between requests.';
}

function getSemanticsTooltip(
  classification: SemanticResult['classification']
): string {
  if (classification === 'explicit') {
    return 'Explicit means meaning is encoded directly in HTML elements and attributes.';
  }
  if (classification === 'partial') {
    return 'Partial means some meaning is encoded in markup, but gaps exist.';
  }
  return 'Opaque means machines must infer meaning from presentation or context.';
}

interface SignalSummaryProps {
  structure: StructureResult;
  semantics: SemanticResult;
}

export function SignalSummary({ structure, semantics }: SignalSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      <SummaryCard
        title={
          <Tooltip text="Structure refers to the consistency of the DOM tree across multiple requests.">
            Structure
          </Tooltip>
        }
        classification={structure.classification}
        classificationTooltip={getStructureTooltip(structure.classification)}
        tone={getStructureTone(structure.classification)}
        description={getStructureDescription(structure)}
      />
      <SummaryCard
        title={
          <Tooltip text="Semantics refers to how much meaning is conveyed through HTML elements rather than visual styling.">
            Semantics
          </Tooltip>
        }
        classification={semantics.classification}
        classificationTooltip={getSemanticsTooltip(semantics.classification)}
        tone={getSemanticsTone(semantics.classification)}
        description={getSemanticsDescription(semantics)}
      />
    </div>
  );
}
