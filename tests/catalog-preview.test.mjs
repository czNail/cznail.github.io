import {test} from 'node:test';
import assert from 'node:assert/strict';
import {catalogPreview} from '../src/lib/catalog-preview.mjs';
import {createCatalog,repositoryMetadata} from '../src/lib/catalog.mjs';

test('新项目同步后仍只预览两个，其余项目完整保留供展开查看',()=>{
  const repositories=Array.from({length:7},(_,i)=>repositoryMetadata({name:`project-${i}`,owner:{login:'czNail'},size:1,has_pages:true,private:false,fork:false,archived:false,disabled:false}));
  const catalog=createCatalog(repositories,[],[]);
  const {preview,remaining,total}=catalogPreview(catalog.projects,'projects');
  assert.equal(preview.length,2);
  assert.equal(remaining.length,5);
  assert.equal(total,7);
  assert.deepEqual([...preview,...remaining],catalog.projects);
});
test('工具新增时默认最多三个，完整目录仍可用于导航和展开',()=>{
  const tools=Array.from({length:5},(_,i)=>({repository:`tool-${i}`}));
  const {preview,remaining}=catalogPreview(tools,'tools');
  assert.equal(preview.length,3);
  assert.equal(remaining.length,2);
  assert.deepEqual([...preview,...remaining],tools);
  assert.equal(tools.length,5);
  assert.deepEqual(catalogPreview([],'tools'),{preview:[],remaining:[],total:0});
});
