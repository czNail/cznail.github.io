/** @typedef {{name?:string,description?:string,label?:string,tags?:string[],image?:string,tool?:{url:string,subtitle:string,features:string[],status:string}}} Presentation */
const string = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
/** @param {unknown} value */
export function toolUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value, 'https://cznail.github.io');
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
/** Repository-relative asset path, never an arbitrary remote URL. @param {unknown} value */
export function iconPath(value) {
  if (typeof value !== 'string') return '';
  const path = value.replace(/^\.\//, '');
  if (!path || /[\\:%?#]/.test(path) || path.startsWith('/') || path.split('/').some(part => !part || part === '.' || part === '..')) return '';
  return /\.(svg|png|webp|jpe?g)$/i.test(path) ? path : '';
}
/** Validate an opt-in repository manifest before putting it in the public snapshot.
 * @param {any} data @returns {Presentation & {iconPath:string}} */
export function normalizePresentation(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || data.schemaVersion !== 1) throw Error('Unsupported homepage.json');
  const result = {iconPath: iconPath(data.icon)};
  for (const key of ['name','description','label']) {
    const value = string(data[key], key === 'description' ? 500 : 80);
    if (value) result[key] = value;
  }
  if (Array.isArray(data.tags)) result.tags = data.tags.filter(item => typeof item === 'string').slice(0,8).map(item => string(item,40)).filter(Boolean);
  if (data.tool && typeof data.tool === 'object') {
    const url = toolUrl(data.tool.url);
    if (!url) throw Error('Invalid tool URL');
    result.tool = {url, subtitle:string(data.tool.subtitle,160),
      features:Array.isArray(data.tool.features) ? data.tool.features.filter(item => typeof item === 'string').slice(0,8).map(item => string(item,80)).filter(Boolean) : [],
      status:data.tool.status === 'development' ? 'development' : 'available'};
  }
  return result;
}
