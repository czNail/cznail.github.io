import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {normalizePresentation,iconPath} from '../src/lib/presentation.mjs';
import {createCatalog,repositoryMetadata} from '../src/lib/catalog.mjs';
import {syncPresentations} from '../scripts/sync-presentations.mjs';
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>';
const file=(text)=>{const bytes=Buffer.from(text);return {type:'file',encoding:'base64',size:bytes.length,content:bytes.toString('base64'),sha:createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')};};
const manifest={schemaVersion:1,name:'同一名称',icon:'./assets/icon.svg',tool:{url:'https://cznail.github.io/new/',features:['一','二']}};
const repo=()=>({name:'new',url:'https://github.com/czNail/new',description:'说明',language:'TypeScript',stars:0,hasPages:true,revision:'a'.repeat(40),lastCommitAt:null,recentCommitDates:[]});
const failure=status=>Object.assign(Error('request failed'),{status});

test('game category survives manifest synchronization and honors publication availability',async()=>{
 const repositories=[repo()];
 await syncPresentations(repositories,async path=>file(path.includes('homepage.json')?JSON.stringify({...manifest,category:'game'}):svg),async()=>{});
 const catalog=createCatalog(repositories);
 assert.equal(catalog.projects[0].category,'game');
 assert.equal(catalog.tools.length,1);
 assert.equal(createCatalog([{...repositories[0],pageAvailable:false}]).tools.length,0);
 assert.equal(normalizePresentation({...manifest,category:'unknown'}).category,undefined);
});

test('新增仓库自行声明工具，项目和工具使用同一份名称及本地图标，查询固定提交',async()=>{
 const repositories=[repo()],saved=[],calls=[];
 await syncPresentations(repositories,async path=>{calls.push(path);return file(path.includes('homepage.json')?JSON.stringify(manifest):svg);},async(name,bytes)=>saved.push({name,bytes}));
 const catalog=createCatalog(repositories);
 assert.equal(catalog.tools.length,1);assert.equal(catalog.projects[0].name,catalog.tools[0].name);
 assert.equal(catalog.projects[0].image,catalog.tools[0].image);assert.match(catalog.tools[0].image,/^\/project-icons\/new-[a-f0-9]{40}\.svg$/);
 assert.equal(saved[0].bytes.toString(),svg);assert.ok(calls.every(path=>path.endsWith(`ref=${repositories[0].revision}`)));
 const live=repositoryMetadata({name:'new',owner:{login:'czNail'},private:false,fork:false,archived:false,disabled:false,size:1,has_pages:true},repositories[0]);
 assert.equal(createCatalog([live]).tools[0].image,catalog.tools[0].image);
});
test('配置404撤下工具及图标；临时失败或格式错误保留上次配置',async()=>{
 const old={name:'旧信息',image:'/project-icons/old.svg',tool:{url:'https://cznail.github.io/new/',status:'available',features:[]}};
 for (const request of [async()=>{throw failure(503);},async()=>file('{broken'),async()=>file('{"schemaVersion":99}')]) {
  const repositories=[{...repo(),presentation:old}];await syncPresentations(repositories,request,async()=>{});assert.deepEqual(repositories[0].presentation,old);
 }
 const repositories=[{...repo(),presentation:old}];await syncPresentations(repositories,async()=>{throw failure(404);},async()=>{});
 assert.equal(repositories[0].presentation,null);assert.equal(createCatalog(repositories).tools.length,0);assert.equal(createCatalog(repositories).projects[0].image,undefined);
});
test('取消工具声明保留项目；图标404回退默认，限流保留旧图标；无配置也能展示项目',async()=>{
 const old={image:'/project-icons/old.svg',tool:normalizePresentation(manifest).tool};
 for(const status of [404,429]) {
  const repositories=[{...repo(),presentation:old}];
  await syncPresentations(repositories,async path=>{if(path.includes('homepage.json'))return file(JSON.stringify({...manifest,tool:undefined}));throw failure(status);},async()=>{});
  const catalog=createCatalog(repositories);assert.equal(catalog.tools.length,0);assert.equal(catalog.projects[0].image,status===404?undefined:old.image);
 }
 assert.equal(createCatalog([repo()]).projects.length,1);assert.equal(createCatalog([repo()]).tools.length,0);
});
test('拒绝越界资源和非HTTPS工具入口；错误图片不进入公开静态资源',async()=>{
 for(const path of ['../icon.svg','https://evil.test/a.svg','/etc/icon.svg','assets/%2e%2e/icon.svg','assets/../../icon.svg'])assert.equal(iconPath(path),'');
 for(const url of ['', 'javascript:alert(1)','http://example.com/','https://name:password@example.com/'])assert.throws(()=>normalizePresentation({...manifest,tool:{url}}));
 assert.throws(()=>normalizePresentation({...manifest,schemaVersion:99}));
 let saved=0;const repositories=[repo()];
 await syncPresentations(repositories,async path=>file(path.includes('homepage.json')?JSON.stringify(manifest):'<svg><script>alert(1)</script></svg>'),async()=>{saved++;});
 assert.equal(saved,0);assert.equal(repositories[0].presentation.image,undefined);
});
test('删除、归档或下线的项目不会被配置恢复；Pages状态不阻止外部托管工具',()=>{
 const presentation={...normalizePresentation(manifest),image:'/project-icons/icon.svg'};
 assert.deepEqual(createCatalog([]).tools,[]);
 assert.equal(createCatalog([{...repo(),presentation,pageAvailable:false}]).tools.length,0);
 assert.equal(createCatalog([{...repo(),presentation,hasPages:false}]).tools.length,0);
 presentation.tool={...presentation.tool,url:'https://example.com/tool/'};
 assert.equal(createCatalog([{...repo(),presentation,hasPages:false}]).tools.length,1);
});

test('工具未配置专属图标时，项目和工具共用默认图标',()=>{
 const presentation=normalizePresentation({...manifest,icon:undefined});
 const catalog=createCatalog([{...repo(),presentation}]);
 assert.equal(catalog.projects[0].image,'/project-icons/default.svg');
 assert.equal(catalog.tools[0].image,catalog.projects[0].image);
});

