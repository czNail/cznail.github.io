/** @typedef {import('./recommendations.mjs').Repository & {hasPages?:boolean,pageAvailable?:boolean}} Repository */
/** @typedef {{name:string,owner:{login:string},private:boolean,fork:boolean,archived:boolean,disabled:boolean,size:number,has_pages?:boolean,description?:string,language?:string,stargazers_count?:number}} GitHubRepository */
/** @typedef {{name:string,label:string,description:string,tags:string[],url:string,icon:string}} ProjectDetails */
/** @typedef {{id:string,repository:string,name:string,subtitle:string,description:string,status:string,url:string,features:string[]}} Tool */

export const owner = 'czNail';
const excluded = new Set(['my-blog', 'cznail.github.io']);

export function isEligible(repo) {
  return repo.owner?.login?.toLowerCase() === owner.toLowerCase() && repo.private === false &&
    !repo.fork && !repo.archived && !repo.disabled && repo.size > 0 && !excluded.has(repo.name.toLowerCase());
}

// Read every page before replacing anything: a failed/partial response must not clear the page.
/** @param {(path:string)=>Promise<GitHubRepository[]>} request */
export async function listRepositories(request) {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await request(`/users/${owner}/repos?type=owner&per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.some(repo => typeof repo?.name !== 'string' ||
      typeof repo.private !== 'boolean' || typeof repo.owner?.login !== 'string')) {
      throw Error('Invalid repository response');
    }
    repos.push(...batch.filter(isEligible));
    if (batch.length < 100) return repos;
  }
  throw Error('Repository pagination limit exceeded');
}

/** @param {GitHubRepository} repo @param {Repository} [previous] @returns {Repository} */
export function repositoryMetadata(repo, previous) {
  return {
    name: repo.name, url: `https://github.com/${owner}/${encodeURIComponent(repo.name)}`,
    description: repo.description || '', language: repo.language || null,
    stars: Math.max(0, repo.stargazers_count || 0), hasPages: repo.has_pages === true,
    // pushed_at also changes for tags/other branches; never present it as a default-branch commit.
    lastCommitAt: previous?.lastCommitAt ?? null, recentCommitDates: previous?.recentCommitDates ?? [],
  };
}

/** @param {Repository[]} repositories @param {ProjectDetails[]} projectDetails @param {Tool[]} toolDetails */
export function createCatalog(repositories, projectDetails, toolDetails) {
  const byName = new Map(repositories.map(repo => [repo.name.toLowerCase(), repo]));
  const tools = toolDetails.filter(tool => {
    const repo = byName.get(tool.repository.toLowerCase());
    return repo && repo.hasPages !== false && repo.pageAvailable !== false && tool.status === 'available' && tool.url;
  });
  const projects = repositories.map(repo => {
    const details = projectDetails.find(item => item.url.toLowerCase() === repo.url.toLowerCase());
    return {name: repo.name, label: '开源项目', description: repo.description || '查看项目源码与说明。',
      tags: repo.language ? [repo.language] : [], icon: 'code', ...details, url: repo.url, repository: repo.name};
  });
  return {projects, tools};
}
