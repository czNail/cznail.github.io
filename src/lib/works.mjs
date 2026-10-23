/** @typedef {{repository:string,name:string,label:string,description:string,tags:string[],url:string,icon:string,image?:string}} Project */
/** @typedef {{repository:string,url:string,features:string[]}} Tool */
/** @typedef {{description?:string,features?:string[],preview?:string,previewAlt?:string}} WorkDetails */
/** @typedef {Project & {toolUrl?:string,features:string[],preview?:string,previewAlt?:string}} Work */

/** Combine source and app links without duplicating a repository.
 * Editorial order is independent of time, stars and the API response order.
 * @param {Project[]} projects
 * @param {Tool[]} tools
 * @param {{order?:string[],details?:Record<string,WorkDetails>}} [options]
 * @returns {Work[]}
 */
export function createWorks(projects, tools, {order = [], details = {}} = {}) {
  const positions = new Map(order.map((name, index) => [name.toLowerCase(), index]));
  return projects.map(project => {
    const key = project.repository.toLowerCase();
    const tool = tools.find(item => item.repository.toLowerCase() === key);
    const editorial = details[key] || {};
    return {...project, ...editorial, toolUrl: tool?.url, features: editorial.features || tool?.features || project.tags};
  }).sort((a, b) => (positions.get(a.repository.toLowerCase()) ?? Infinity) -
    (positions.get(b.repository.toLowerCase()) ?? Infinity) || a.repository.localeCompare(b.repository, 'en'));
}
