import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

import {owner,isEligible,listRepositories,repositoryMetadata} from '../src/lib/catalog.mjs';
export {isEligible};

export async function collectRepositories(request, previous={repositories:[]}, now=Date.now()) {
  const repos=await listRepositories(request);
  const repositories=[];
  for(const repo of repos) {
    const old=previous.repositories.find(item=>item.name===repo.name);
    // If the default branch cannot be read, retain its previous verified commit data.
    let dates;
    try {
      const commits=await request(`/repos/${owner}/${encodeURIComponent(repo.name)}/commits?sha=${encodeURIComponent(repo.default_branch)}&per_page=20`);
      if(!Array.isArray(commits))throw Error('Invalid commit response');
      dates=commits.map(item=>item.commit?.committer?.date).filter(date=>typeof date==='string'&&Number.isFinite(Date.parse(date)));
      if(!dates.length)continue;
    } catch {
      if(!old)continue;
      dates=old.recentCommitDates.length?old.recentCommitDates:old.lastCommitAt?[old.lastCommitAt]:[];
    }
    repositories.push({...repositoryMetadata(repo),lastCommitAt:dates[0]??null,recentCommitDates:dates});
  }
  return {fetchedAt:new Date(now).toISOString(),repositories};
}

async function main() {
  const target=new URL('../src/data/repositories.json',import.meta.url);
  const previous=JSON.parse(await readFile(target,'utf8'));
  const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'cznail-homepage'};
  if(process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
  const request=async path=>{
    const response=await fetch(`https://api.github.com${path}`,{headers,signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw Error(`GitHub metadata request failed (${response.status})`);
    return response.json();
  };
  try {
    const snapshot=await collectRepositories(request,previous);
    const tools=JSON.parse(await readFile(new URL('../src/data/tools.json',import.meta.url),'utf8'));
    for(const tool of tools) {
      const repo=snapshot.repositories.find(repo=>repo.name.toLowerCase()===tool.repository.toLowerCase());
      if(!repo?.hasPages)continue;
      try {
        const response=await fetch(new URL(tool.url,'https://cznail.github.io'),{method:'HEAD',signal:AbortSignal.timeout(10000)});
        if(response.status===404 || response.status===410)repo.pageAvailable=false;
      } catch { /* Transient failures do not prove a published tool was removed. */ }
    }
    await writeFile(target,JSON.stringify(snapshot,null,2)+'\n');
    console.log(`Updated public recommendations: ${snapshot.repositories.length} repositories.`);
  } catch {
    console.warn(`GitHub metadata unavailable; using bundled snapshot from ${previous.fetchedAt}.`);
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)await main();
