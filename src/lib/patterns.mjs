/** Fixed decorative patterns shared by server rendering and live updates. */
const patterns = ['rings', 'blocks', 'waves', 'grid'];
/** @param {string} key */
export function contentPattern(key) {
  let hash = 2166136261;
  for (const character of key) hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
  return patterns[(hash >>> 0) % patterns.length];
}
