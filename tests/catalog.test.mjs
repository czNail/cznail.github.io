import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCatalog,listRepositories,repositoryMetadata} from '../src/lib/catalog.mjs';
const raw=name=>({name,owner:{login:'czNail'},private:false,fork:false,archived:false,disabled:false,size:1,has_pages:true});
const details=[{name:'旧项目',url:'https://github.com/czNail/deleted',description:'说明',label:'项目',icon:'code',tags:[]}];
const tool={id:'tool',repository:'tool',name:'工具',status:'available',url:'/tool/'};
test('新发布的Pages仓库不会因GitHub大小统计延迟而被当作空仓库',async()=>{
  const published={...raw('pg-playground'),size:0};
  const repositories=await listRepositories(async()=>[
    published,
    {...raw('empty'),size:0,has_pages:false},
    {...published,name:'private-tool',private:true},
    {...published,name:'fork-tool',fork:true},
    {...published,name:'archived-tool',archived:true},
  ]);
  assert.deepEqual(repositories.map(repo=>repo.name),['pg-playground']);
});
test('正文与工具目录排除已删除项目；新增公开仓库无需手工录入',()=>{
  const catalog=createCatalog([repositoryMetadata({...raw('new'),language:'C'})],details,[tool]);
  assert.deepEqual(catalog.projects.map(item=>item.repository),['new']);
  assert.deepEqual(catalog.projects[0].tags,['C']);
  assert.deepEqual(catalog.tools,[]);
});
test('中文文案只作覆盖，不会恢复删除的仓库；仓库名匹配不区分大小写',()=>{
  const repo=repositoryMetadata(raw('Deleted'));
  const catalog=createCatalog([repo],details,[]);
  assert.equal(catalog.projects[0].name,'旧项目');
  assert.equal(catalog.projects[0].url,repo.url);
});
test('Pages关闭或工具地址明确404时隐藏工具，源码项目依然可见',()=>{
  for(const override of [{hasPages:false},{pageAvailable:false}]) {
    const catalog=createCatalog([{...repositoryMetadata(raw('tool')),...override}],[],[tool]);
    assert.equal(catalog.projects.length,1);assert.equal(catalog.tools.length,0);
  }
  assert.equal(createCatalog([repositoryMetadata(raw('TOOL'))],[],[tool]).tools.length,1);
});
test('动态元数据不将push时间伪装为提交时间；沿用已核实的默认分支提交',()=>{
  const repo={...raw('new'),pushed_at:'2026-10-21T00:00:00Z'};
  assert.equal(repositoryMetadata(repo).lastCommitAt,null);
  const previous={lastCommitAt:'2026-09-01T00:00:00Z',recentCommitDates:[]};
  assert.equal(repositoryMetadata(repo,previous).lastCommitAt,previous.lastCommitAt);
});
test('无效响应或中途分页失败不产出会清空页面的部分目录',async()=>{
  await assert.rejects(()=>listRepositories(async()=>({message:'rate limit'})));
  await assert.rejects(()=>listRepositories(async()=>[{}]));
  let calls=0;
  await assert.rejects(()=>listRepositories(async()=>{
    if(++calls===1)return Array.from({length:100},(_,i)=>raw(`repo-${i}`));
    throw Error('network');
  }));
  assert.deepEqual(await listRepositories(async()=>[]),[]);
});
