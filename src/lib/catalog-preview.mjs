/** Limits shared by static rendering and live GitHub refreshes. */
export const previewLimits = Object.freeze({projects: 2, tools: 3, posts: 3});

/** @template T @param {T[]} items @param {'projects'|'tools'} kind */
export function catalogPreview(items, kind) {
  return {preview: items.slice(0, previewLimits[kind]), remaining: items.slice(previewLimits[kind]), total: items.length};
}
