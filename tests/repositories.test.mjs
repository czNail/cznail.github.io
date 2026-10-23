import {test} from 'node:test';
import assert from 'node:assert/strict';
import {collectRepositories,isEligible} from '../scripts/refresh-repositories.mjs';

const now=Date.parse('2026-10-20T00:00:00Z');
const repo=(name,days,stars=0,commits=0)=>({name,url:`https://github.com/czNail/${name}`,description:'',language:null,stars,lastCommitAt:new Date(now-days*86400000).toISOString(),recentCommitDates:Array.from({length:commits},()=>new Date(now-86400000).toISOString())});
const raw=name=>({name,owner:{login:'czNail'},private:false,fork:false,archived:false,disabled:false,size:1,default_branch:'main',description:'description',stargazers_count:3,language:'TypeScript'});
test('仅收录本人公开原创且可用的项目，排除私有、Fork、归档与主页博客',()=>{
  assert.equal(isEligible(raw('visible')),true);
  for(const override of [{private:true},{fork:true},{archived:true},{disabled:true},{size:0},{owner:{login:'someone-else'}},{name:'my-blog'},{name:'cznail.github.io'}])assert.equal(isEligible({...raw('no'),...override}),false);
});
test('元数据分页，提交数据取自默认分支；未返回的项目不会从旧快照复活',async()=>{
  const calls=[],old={repositories:[repo('removed',1)]};
  const result=await collectRepositories(async path=>{
    calls.push(path);
    if(new URL(path,'https://api.github.com').searchParams.get('page')==='1')return [raw('visible'),...Array.from({length:99},()=>({...raw('private'),private:true}))];
    if(new URL(path,'https://api.github.com').searchParams.get('page')==='2')return [];
    return [{commit:{committer:{date:'2026-10-19T00:00:00Z'}}}];
  },old,now);
  assert.equal(result.repositories.length,1);assert.equal(result.repositories[0].name,'visible');assert.equal(result.repositories[0].stars,3);
  assert.ok(calls.some(p=>p.includes('sha=main')));assert.ok(calls.some(p=>new URL(p,'https://api.github.com').searchParams.get('page')==='2'));
});
test('列表不可用时交给调用方保留快照；提交接口失败仅保留仍公开项目的已知数据',async()=>{
  await assert.rejects(()=>collectRepositories(async()=>{throw Error('rate limit');}));
  const previous={repositories:[repo('visible',10),repo('removed',1)]};
  const result=await collectRepositories(async path=>{
    if(path.startsWith('/users/'))return [raw('visible')];
    throw Error('rate limit');
  },previous,now);
  assert.equal(result.repositories.length,1);assert.equal(result.repositories[0].lastCommitAt,previous.repositories[0].lastCommitAt);
});

test('公开候选被全部移除时清空推荐，不能把已移除的旧仓库恢复出来',async()=>{
  const result=await collectRepositories(async()=>[],{repositories:[repo('removed',1)]},now);
  assert.deepEqual(result.repositories,[]);
});
