import type { StructureResult, SemanticResult } from '../analysis/types';

interface Insight {
  title: string;
  description: string;
  category: 'structure' | 'semantics' | 'accessibility';
}

function generateInsights(
  structure: StructureResult,
  semantics: SemanticResult
): Insight[] {
  const insights: Insight[] = [];

  if (structure.classification !== 'deterministic') {
    insights.push({
      title: 'Variable DOM structure detected',
      description: 'The page structure differs between requests. This means machines may see different content representations on each visit.',
      category: 'structure',
    });
  } else {
    insights.push({
      title: 'Deterministic structure',
      description: 'The page returns identical DOM structure across multiple fetches, providing consistent machine-readable content.',
      category: 'structure',
    });
  }

  if (semantics.headings.h1Count === 0) {
    insights.push({
      title: 'No H1 heading present',
      description: 'The page lacks a primary heading element. Machines cannot identify the main topic from markup alone.',
      category: 'semantics',
    });
  } else if (semantics.headings.h1Count > 1) {
    insights.push({
      title: `${semantics.headings.h1Count} H1 headings found`,
      description: 'Multiple primary headings exist. This creates ambiguity about document structure for automated systems.',
      category: 'semantics',
    });
  }

  if (semantics.headings.hasSkips) {
    insights.push({
      title: 'Heading hierarchy has gaps',
      description: 'The document uses non-sequential heading levels (e.g., H1 → H3). This breaks the implicit outline structure.',
      category: 'accessibility',
    });
  }

  if (semantics.landmarks.coveragePercent < 50) {
    insights.push({
      title: `${semantics.landmarks.coveragePercent}% landmark coverage`,
      description: 'Most content is not within semantic regions. Machines must infer content boundaries from visual or contextual cues.',
      category: 'semantics',
    });
  } else if (semantics.landmarks.coveragePercent < 100) {
    insights.push({
      title: `${semantics.landmarks.coveragePercent}% landmark coverage`,
      description: 'Partial use of semantic regions. Some content areas are explicitly defined, others require interpretation.',
      category: 'semantics',
    });
  }

  if (semantics.divRatio > 0.7) {
    insights.push({
      title: `${Math.round(semantics.divRatio * 100)}% generic container elements`,
      description: 'High proportion of <div> and <span> elements. Structural meaning relies on class names or visual presentation rather than markup.',
      category: 'semantics',
    });
  }

  if (semantics.linkIssues > 0) {
    insights.push({
      title: `${semantics.linkIssues} non-descriptive link(s)`,
      description: 'Some links use generic text ("click here", "read more"). Link purpose must be inferred from surrounding context.',
      category: 'accessibility',
    });
  }

  return insights;
}

interface RecommendationsProps {
  structure: StructureResult;
  semantics: SemanticResult;
}

function getCategoryColor(category: Insight['category']) {
  switch (category) {
    case 'structure':
      return 'text-blue-700 bg-blue-50 ring-blue-200';
    case 'semantics':
      return 'text-purple-700 bg-purple-50 ring-purple-200';
    case 'accessibility':
      return 'text-indigo-700 bg-indigo-50 ring-indigo-200';
  }
}

export function Recommendations({ structure, semantics }: RecommendationsProps) {
  const insights = generateInsights(structure, semantics);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Structural Insights
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Factual observations about how machines interpret this page
        </p>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="rounded-lg bg-gray-50 p-4 ring-1 ring-gray-200/50"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${getCategoryColor(insight.category)}`}
              >
                {insight.category}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
