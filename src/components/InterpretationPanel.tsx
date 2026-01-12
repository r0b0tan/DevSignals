import type { StructureResult, SemanticResult } from '../analysis/types';
import { Tooltip } from './Tooltip';

interface Interpretation {
  category: string;
  finding: React.ReactNode;
  implication: React.ReactNode;
  baseline?: string; // e.g., "Typical for SPA", "Common for static pages"
}

function generateInterpretations(
  structure: StructureResult,
  semantics: SemanticResult,
  fetchCount: number
): Interpretation[] {
  const interpretations: Interpretation[] = [];

  // Structure consistency
  if (structure.classification === 'deterministic') {
    const finding = fetchCount === 1
      ? 'Single fetch completed'
      : `Identical across ${fetchCount} fetches`;
    const implication = fetchCount === 1
      ? 'Baseline captured. Run multiple fetches to verify consistency.'
      : 'The page delivers the same content on each visit, making it easy to cache and index.';
    interpretations.push({
      category: 'Structure Consistency',
      finding,
      implication,
    });
  } else if (structure.classification === 'mostly-deterministic') {
    interpretations.push({
      category: 'Structure Consistency',
      finding: `${structure.differenceCount} minor variation(s)`,
      implication: 'The page is mostly stable with small differences between visits.',
    });
  } else {
    interpretations.push({
      category: 'Structure Consistency',
      finding: `${structure.differenceCount} structural difference(s)`,
      implication: 'Content changes between visits, which can make parsing and caching less reliable.',
      baseline: 'Typical for SPAs and dynamic content',
    });
  }

  // Heading structure
  if (semantics.headings.h1Count === 1 && !semantics.headings.hasSkips) {
    interpretations.push({
      category: 'Semantic Headings',
      finding: '1 H1, sequential hierarchy',
      implication: 'The document has a clear outline that helps machines identify the main topic.',
    });
  } else if (semantics.headings.h1Count === 0) {
    interpretations.push({
      category: 'Semantic Headings',
      finding: 'H1 not present',
      implication: 'Machines will infer the page topic from other content instead.',
      baseline: 'Common for app shells and client-rendered pages',
    });
  } else if (semantics.headings.h1Count > 1) {
    interpretations.push({
      category: 'Semantic Headings',
      finding: `${semantics.headings.h1Count} H1 elements`,
      implication: 'Multiple main headings can make the topic hierarchy less clear.',
    });
  } else if (semantics.headings.hasSkips) {
    interpretations.push({
      category: 'Semantic Headings',
      finding: 'Heading hierarchy has gaps',
      implication: 'Skipped heading levels mean the outline needs to be reconstructed from context.',
    });
  }

  // Landmark coverage
  if (semantics.landmarks.coveragePercent >= 80) {
    interpretations.push({
      category: 'Semantic Landmarks',
      finding: `${semantics.landmarks.coveragePercent}% in semantic regions`,
      implication: 'Most content is in clearly defined regions, making navigation and extraction straightforward.',
    });
  } else if (semantics.landmarks.coveragePercent >= 50) {
    interpretations.push({
      category: 'Semantic Landmarks',
      finding: `${semantics.landmarks.coveragePercent}% in semantic regions`,
      implication: 'About half the content is in semantic regions; some boundaries need to be guessed.',
    });
  } else {
    interpretations.push({
      category: 'Semantic Landmarks',
      finding: `${semantics.landmarks.coveragePercent}% in semantic regions`,
      implication: 'Most content boundaries will be inferred from context rather than markup.',
      baseline: 'Common for legacy sites or framework markup',
    });
  }

  // Max DOM depth
  if (structure.maxDepth >= 15) {
    interpretations.push({
      category: 'Structure Depth',
      finding: `${structure.maxDepth} levels deep`,
      implication: 'Deep nesting can slow down traversal and make context harder to infer.',
    });
  } else if (structure.maxDepth >= 10) {
    interpretations.push({
      category: 'Structure Depth',
      finding: `${structure.maxDepth} levels deep`,
      implication: 'Moderate nesting depth, typical for most pages.',
    });
  }

  // Top-level sections
  if (structure.topLevelSections >= 3) {
    interpretations.push({
      category: 'Structure Sections',
      finding: `${structure.topLevelSections} top-level sections`,
      implication: 'The page is well-segmented, making it easy to identify distinct regions.',
    });
  } else if (structure.topLevelSections > 0) {
    interpretations.push({
      category: 'Structure Sections',
      finding: `${structure.topLevelSections} top-level section${structure.topLevelSections === 1 ? '' : 's'}`,
      implication: 'Limited segmentation means some region boundaries need to be guessed.',
    });
  } else {
    interpretations.push({
      category: 'Structure Sections',
      finding: 'No top-level sections',
      implication: 'Without explicit sections, regions will be inferred from the content itself.',
    });
  }

  // Shadow DOM hosts (custom elements)
  if (structure.customElements > 0) {
    interpretations.push({
      category: 'Structure Shadow DOM',
      finding: `${structure.customElements} shadow DOM host${structure.customElements === 1 ? '' : 's'}`,
      implication: 'Some content is hidden in shadow DOM and may not be visible to standard parsing.',
    });
  }

  // Element composition
  const divPercent = Math.round(semantics.divRatio * 100);
  if (semantics.divRatio > 0.6) {
    interpretations.push({
      category: 'Semantic Markup',
      finding: `${divPercent}% generic containers`,
      implication: 'Most elements are generic divs, so meaning is derived from class names rather than HTML semantics.',
      baseline: 'Common for component frameworks (React, Vue)',
    });
  } else if (semantics.divRatio > 0.4) {
    interpretations.push({
      category: 'Semantic Markup',
      finding: `${divPercent}% generic containers`,
      implication: 'A mix of semantic and generic elements; structure is partially self-describing.',
    });
  } else {
    interpretations.push({
      category: 'Semantic Markup',
      finding: `${divPercent}% generic containers`,
      implication: 'Most elements have semantic meaning, making the structure self-describing.',
    });
  }

  // Link descriptiveness
  if (semantics.linkIssues > 0) {
    interpretations.push({
      category: 'Semantic Links',
      finding: `${semantics.linkIssues} non-descriptive link(s)`,
      implication: 'Some links use generic text like "click here", so their purpose must be inferred from context.',
    });
  } else {
    interpretations.push({
      category: 'Semantic Links',
      finding: 'All links descriptive',
      implication: 'All links clearly describe their destination, making navigation easy to understand.',
    });
  }

  // Time elements
  if (semantics.timeElements.total > 0) {
    if (semantics.timeElements.withDatetime === semantics.timeElements.total) {
      interpretations.push({
        category: 'Semantic Time',
        finding: `${semantics.timeElements.total} time element${semantics.timeElements.total === 1 ? '' : 's'} with datetime`,
        implication: 'All timestamps are machine-readable, making date extraction reliable.',
      });
    } else if (semantics.timeElements.withDatetime > 0) {
      interpretations.push({
        category: 'Semantic Time',
        finding: `${semantics.timeElements.withDatetime}/${semantics.timeElements.total} with datetime`,
        implication: 'Some timestamps are machine-readable; others need to be parsed from text.',
      });
    } else {
      interpretations.push({
        category: 'Semantic Time',
        finding: `${semantics.timeElements.total} without datetime`,
        implication: 'Dates are displayed as text only, so they need to be parsed and interpreted.',
      });
    }
  }

  // List structures
  if (semantics.lists.total > 0) {
    interpretations.push({
      category: 'Semantic Lists',
      finding: `${semantics.lists.total} list structure${semantics.lists.total === 1 ? '' : 's'}`,
      implication: 'Lists provide clear item boundaries, making enumeration straightforward.',
    });
  }

  // Tables
  if (semantics.tables.total > 0) {
    const withoutHeaders = semantics.tables.total - semantics.tables.withHeaders;
    if (withoutHeaders > 0) {
      interpretations.push({
        category: 'Semantic Tables',
        finding: `${withoutHeaders} table${withoutHeaders === 1 ? '' : 's'} without headers`,
        implication: 'Tables without headers require column meanings to be guessed from content.',
      });
    }
  }

  // Language attribute
  if (semantics.langAttribute) {
    interpretations.push({
      category: 'Semantic Language',
      finding: 'Language declared',
      implication: 'The page specifies its language, enabling correct text processing.',
    });
  } else {
    interpretations.push({
      category: 'Semantic Language',
      finding: 'Language not declared',
      implication: 'The language will be detected automatically from the content.',
    });
  }

  // Images
  if (semantics.images.total > 0) {
    const { total, withAlt, emptyAlt, missingAlt, inFigure } = semantics.images;

    // Alt text coverage
    if (missingAlt === 0) {
      interpretations.push({
        category: 'Image Accessibility',
        finding: 'All images have alt',
        implication: 'Every image is clearly marked as meaningful or decorative.',
      });
    } else if (missingAlt > 0) {
      const percent = Math.round((missingAlt / total) * 100);
      interpretations.push({
        category: 'Image Accessibility',
        finding: `${missingAlt} image${missingAlt === 1 ? '' : 's'} without alt (${percent}%)`,
        implication: 'Some images lack alt text, so their purpose must be guessed from context.',
      });
    }

    // Semantic context (figure/figcaption)
    if (inFigure > 0) {
      const percent = Math.round((inFigure / total) * 100);
      interpretations.push({
        category: 'Image Context',
        finding: `${inFigure} in figure elements (${percent}%)`,
        implication: 'Images in figures can be associated with their captions automatically.',
      });
    }

    // Decorative images
    if (emptyAlt > 0 && withAlt > 0) {
      interpretations.push({
        category: 'Image Classification',
        finding: `${withAlt} meaningful, ${emptyAlt} decorative`,
        implication: 'Images are clearly classified, so machines know which ones carry content.',
      });
    }
  }

  return interpretations;
}

interface InterpretationPanelProps {
  structure: StructureResult;
  semantics: SemanticResult;
  fetchCount: number;
}

export function InterpretationPanel({ structure, semantics, fetchCount }: InterpretationPanelProps) {
  const interpretations = generateInterpretations(structure, semantics, fetchCount);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-300 sm:p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900">
          Interpretation{' '}
          <Tooltip text="Analysis of what the measured values mean for how machines understand and process this page.">
            <span className="text-indigo-700 font-normal">ⓘ</span>
          </Tooltip>
        </h3>
        <p className="mt-1 text-xs text-gray-500">What these measurements suggest for machine readers</p>
      </div>

      <div className="space-y-4">
        {interpretations.map((item, index) => (
          <div
            key={index}
            className="rounded-lg bg-indigo-50/50 p-4"
          >
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              {item.category}
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-4">
              <div className="text-sm font-medium text-gray-900 md:w-1/3 md:shrink-0">
                {item.finding}
              </div>
              <div className="text-sm leading-relaxed text-gray-600">
                {item.implication}
                {item.baseline && (
                  <Tooltip text={item.baseline}>
                    <span className="ml-1 inline-flex items-center justify-center w-[1em] h-[1em] rounded-full bg-indigo-600 text-white text-[0.7em] font-medium cursor-help align-middle">?</span>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
