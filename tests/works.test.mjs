import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorks} from '../src/lib/works.mjs';

const project = repository => ({repository, name:repository, url:`https://github.com/czNail/${repository}`, description:'原始说明', label:'开源项目', tags:['TypeScript'], icon:'code'});
test('同一作品合并在线入口和源码；未发布的工具保留源码入口', () => {
  const projects = [project('app'), project('source-only')];
  const works = createWorks(projects, [{repository:'APP',url:'/app/',features:['本地保存']}]);
  assert.equal(works.length, 2);
  assert.equal(works[0].url, projects[0].url);
  assert.equal(works[0].toolUrl, '/app/');
  assert.equal(works[1].toolUrl, undefined);
  assert.deepEqual(works[1].features, ['TypeScript']);
});
test('代表作品顺序不随接口返回顺序或活跃度变化；未知作品按名称排列', () => {
  const projects = ['z-new','portfolio-pilot','a-new','pg-playground'].map(project);
  const options = {order:['pg-playground','portfolio-pilot']};
  const order = ['pg-playground','portfolio-pilot','a-new','z-new'];
  assert.deepEqual(createWorks(projects,[],options).map(work=>work.repository),order);
  assert.deepEqual(createWorks(projects.toReversed(),[],options).map(work=>work.repository),order);
});
test('编辑文案用于现有项目，已移除项目不会因固定推荐或截图配置而复活', () => {
  const options = {order:['removed','app'],details:{removed:{description:'已删除'},app:{description:'直接说明用途',features:['功能'],preview:'/preview.webp'}}};
  const works = createWorks([project('app')],[],options);
  assert.equal(works.length,1);
  assert.equal(works[0].description,'直接说明用途');
  assert.equal(works[0].preview,'/preview.webp');
  assert.deepEqual(createWorks([],[],options),[]);
});
