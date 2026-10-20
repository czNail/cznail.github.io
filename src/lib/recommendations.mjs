/** @typedef {{name:string,url:string,description:string,language:string|null,stars:number,lastCommitAt:string|null,recentCommitDates:string[]}} Repository */

export const weights = Object.freeze({stars:0.45,recency:0.35,activity:0.20});

/** @param {Repository[]} repositories @param {number} [now] */
export function rankRepositories(repositories, now=Date.now()) {
  const day=86400000;
  return repositories.map(repo=>{
    const stars=Math.max(0,Number.isFinite(repo.stars)?repo.stars:0);
    const age=repo.lastCommitAt ? Math.max(0,(now-Date.parse(repo.lastCommitAt))/day) : Infinity;
    const recency=Number.isFinite(age)?Math.exp(-age/30):0;
    const count=repo.recentCommitDates.filter(date=>{const age=(now-Date.parse(date))/day;return Number.isFinite(age)&&age>=0&&age<=30;}).length;
    const popularity=Math.log1p(stars)/(Math.log1p(stars)+Math.log(11));
    const activity=Math.log1p(Math.min(20,count))/Math.log(21);
    return {...repo,recentCommits:count,score:weights.stars*popularity+weights.recency*recency+weights.activity*activity};
  }).sort((a,b)=>b.score-a.score || b.stars-a.stars || a.name.localeCompare(b.name,'en'));
}
