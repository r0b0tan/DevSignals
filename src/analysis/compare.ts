import type { NormalizedNode, StructureResult } from './types';

function treesEqual(a: NormalizedNode, b: NormalizedNode): boolean {
  if (a.tag !== b.tag) return false;
  if (a.childTags.length !== b.childTags.length) return false;

  for (let i = 0; i < a.childTags.length; i++) {
    if (a.childTags[i] !== b.childTags[i]) return false;
  }

  return true;
}

export function compare(trees: NormalizedNode[]): StructureResult {
  let differences = 0;

  for (let i = 0; i < trees.length; i++) {
    for (let j = i + 1; j < trees.length; j++) {
      if (!treesEqual(trees[i], trees[j])) {
        differences++;
      }
    }
  }

  let classification: StructureResult['classification'];
  if (differences === 0) {
    classification = 'deterministic';
  } else if (differences === 1) {
    classification = 'mostly-deterministic';
  } else {
    classification = 'unstable';
  }

  return { classification, differenceCount: differences };
}
