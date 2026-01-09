import type { AnalysisResult } from './types';
import { normalize } from './normalize';
import { compare } from './compare';
import { checkSemantics } from './semantics';

export function analyze(htmlSamples: string[], url: string): AnalysisResult {
  const trees = htmlSamples.map(normalize);
  const structure = compare(trees);
  const semantics = checkSemantics(htmlSamples[0]);

  return { url, structure, semantics };
}

export type { AnalysisResult, StructureResult, SemanticResult } from './types';
