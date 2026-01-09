import type { NormalizedNode } from './types';

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'svg', 'path']);

function walk(el: Element): NormalizedNode | null {
  const tag = el.tagName.toLowerCase();
  if (SKIP_TAGS.has(tag)) return null;

  const childTags: string[] = [];
  for (const child of el.children) {
    const node = walk(child);
    if (node) {
      childTags.push(node.tag);
      childTags.push(...node.childTags);
    }
  }

  return { tag, childTags };
}

export function normalize(html: string): NormalizedNode {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const body = doc.body;

  if (!body) {
    return { tag: 'body', childTags: [] };
  }

  const result = walk(body);
  return result ?? { tag: 'body', childTags: [] };
}
