import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/tools-menu.js',import.meta.url),'utf8');
function setup(response={tools:[{id:'one',name:'工具一',url:'/one/',description:'说明'}]},fail=false,staticTools=false){
  const events={},handlers={},list={children:['fallback'],replaceChildren(...children){this.children=children;}};
  let focused=false,fetches=0;
  const menu={dataset:{},open:true,hasAttribute:name=>name==='data-tools-static'&&staticTools,contains:target=>target?.inside===true,querySelector:q=>q==='summary'?{focus(){focused=true;}}:list,addEventListener(name,handler){assert.equal(handlers[name],undefined);handlers[name]=handler;}};
  const document={activeElement:null,querySelectorAll:selector=>selector.includes('[open]')&&!menu.open?[]:[menu],addEventListener(name,handler){events[name]=handler;},createElement:tag=>({tag,dataset:{},children:[],append(...children){this.children.push(...children);}})};
  const window={};
  vm.runInNewContext(source,{window,document,location:{origin:'https://cznail.github.io'},URL,AbortSignal,setTimeout:fn=>fn(),fetch:async(url,options)=>{fetches++;assert.equal(url,'/tools.json');assert.notEqual(options?.method,'HEAD');if(fail)throw Error('offline');return {ok:true,json:async()=>response};}});
  return {menu,list,handlers,events,window,get focused(){return focused;},get fetches(){return fetches;}};
}
test('展开菜单读取共享目录，过滤重复和非HTTPS外链；再次初始化不重复绑定',async()=>{
  const c=setup({tools:[{id:'one',name:'工具一',url:'/one/'},{id:'two',name:'工具二',url:'https://example.com/tool'},{id:'one',name:'重复',url:'/duplicate'},{id:'unsafe',name:'不安全',url:'javascript:alert(1)'},{id:'insecure',name:'不安全',url:'http://example.com'}]});
  await c.handlers.toggle();assert.equal(c.list.children.length,2);assert.equal(c.list.children[0].href,'/one/');assert.equal(c.list.children[0].children[0].textContent,'工具一');
  c.window.__neilToolsMenu();await c.handlers.toggle();assert.equal(c.fetches,1);
});
test('离线保留现有入口；Esc回到开关，点击外部和离开焦点均可收起',async()=>{
  const c=setup(undefined,true);await c.handlers.toggle();assert.deepEqual(c.list.children,['fallback']);
  c.events.keydown({key:'Escape'});assert.equal(c.menu.open,false);assert.equal(c.focused,true);
  c.menu.open=true;c.events.pointerdown({target:{inside:false}});assert.equal(c.menu.open,false);
  c.menu.open=true;c.handlers.focusout();assert.equal(c.menu.open,false);
  c.menu.open=true;c.events.pointerdown({target:{inside:true}});assert.equal(c.menu.open,true);
});

test('共享目录为空时清空静态旧链接',async()=>{
  const c=setup({tools:[]});await c.handlers.toggle();
  assert.equal(c.list.children.length,1);assert.equal(c.list.children[0].textContent,'暂时没有已发布的小工具。');
});
test('主页静态菜单离线打开不请求目录或GitHub，交互关闭行为仍正常',async()=>{
  const c=setup(undefined,true,true);
  await c.handlers.toggle();assert.equal(c.fetches,0);assert.deepEqual(c.list.children,['fallback']);
  c.events.keydown({key:'Escape'});assert.equal(c.menu.open,false);assert.equal(c.focused,true);
});
test('其他站点只读取一次已发布静态目录，不探测工具可用性',async()=>{
  const c=setup({tools:[{id:'tool',repository:'tool',name:'工具',url:'/tool/'}]});
  await c.handlers.toggle();await c.handlers.toggle();
  assert.equal(c.list.children[0].href,'/tool/');assert.equal(c.fetches,1);
});
