import { toolUrl } from './presentation.mjs';

/** @typedef {{name:string,url:string,description:string,language:string|null,stars:number,lastCommitAt:string|null,recentCommitDates:string[],hasPages?:boolean,pageAvailable?:boolean,defaultBranch?:string,revision?:string|null,presentation?:import('./presentation.mjs').Presentation|null}} Repository */
/** @typedef {{name:string,owner:{login:string},private:boolean,fork:boolean,archived:boolean,disabled:boolean,size:number,has_pages?:boolean,description?:string,language?:string,stargazers_count?:number,default_branch?:string}} GitHubRepository */
/** @typedef {{name:string,label:string,description:string,tags:string[],url:string,icon:string,image?:string}} ProjectDetails */
/** @typedef {{id:string,repository:string,name:string,subtitle:string,description:string,status:string,url:string,features:string[],icon?:string,image?:string}} Tool */

export const owner = 'czNail';
const excluded = new Set(['my-blog', 'cznail.github.io', 'ballance-web']);

export function isEligible(repo) {
  return repo.owner?.login?.toLowerCase() === owner.toLowerCase() && repo.private === false &&
    !repo.fork && !repo.archived && !repo.disabled &&
    // GitHub's size estimate can stay at zero after a new Pages site is published.
    (repo.size > 0 || repo.has_pages === true) && !excluded.has(repo.name.toLowerCase());
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
    defaultBranch: repo.default_branch || previous?.defaultBranch || 'HEAD',
    revision: previous?.revision ?? null, presentation: previous?.presentation ?? null,
    // pushed_at also changes for tags/other branches; never present it as a default-branch commit.
    lastCommitAt: previous?.lastCommitAt ?? null, recentCommitDates: previous?.recentCommitDates ?? [],
  };
}

/** @param {Repository[]} repositories @param {ProjectDetails[]} projectDetails @param {Tool[]} toolDetails */
export function createCatalog(repositories, projectDetails = [], toolDetails = []) {
  // Apply exclusions to cached snapshots as well as fresh GitHub results.
  repositories = repositories.filter(repo => !excluded.has(repo.name.toLowerCase()));
  const projects = repositories.map(repo => {
    const details = projectDetails.find(item => item.url.toLowerCase() === repo.url.toLowerCase());
    const {tool, ...presentation} = repo.presentation || {};
    return {name: repo.name, label: '开源项目', description: repo.description || '查看项目源码与说明。',
      tags: repo.language ? [repo.language] : [], icon: 'code', ...details, ...presentation,
      image:presentation.image || (tool ? '/project-icons/default.svg' : details?.image), url: repo.url, repository: repo.name};
  });
  const tools = repositories.flatMap(repo => {
    const project = projects.find(item => item.repository === repo.name);
    // A fetched manifest owns its tool declaration, including omission/removal.
    const declaration = repo.presentation ? repo.presentation.tool : toolDetails.find(item => item.repository.toLowerCase() === repo.name.toLowerCase());
    if (!declaration) return [];
    const url = toolUrl(declaration.url);
    const ownPages = url && new URL(url).hostname === 'cznail.github.io';
    if (!url || (ownPages && repo.hasPages === false) || repo.pageAvailable === false || declaration.status !== 'available') return [];
    return [{id:repo.name.toLowerCase(), repository:repo.name, name:project.name, description:project.description,
      subtitle:'', features:[], ...declaration, url, icon:project.icon, image:project.image}];
  });
  return {projects, tools};
}
