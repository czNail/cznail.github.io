(() => {
  if (window.__neilToolsMenu) { window.__neilToolsMenu(); return; }
  let catalog;
  let pending;
  async function getTools() {
    if (catalog) return catalog;
    if (!pending) pending = fetch('/tools.json', {credentials:'omit',signal:AbortSignal.timeout(12000)})
      .then(response => { if (!response.ok) throw Error('catalog'); return response.json(); })
      .then(data => {
        if (!Array.isArray(data.tools)) throw Error('catalog');
        const seen=new Set();
        const candidates=data.tools.filter(tool => {
          if (!tool || typeof tool.id!=='string' || typeof tool.name!=='string' || typeof tool.url!=='string' || seen.has(tool.id)) return false;
          let url;
          try { url=new URL(tool.url,location.origin); } catch { return false; }
          if ((url.protocol!=='https:' && url.origin!==location.origin) || url.username || url.password) return false;
          seen.add(tool.id);return true;
        });
        catalog=candidates;
        return catalog;
      }).finally(() => { pending=undefined; });
    return pending;
  }
  function init() {
    document.querySelectorAll('details.tools-menu').forEach(menu => {
      if (menu.dataset.bound) return;
      menu.dataset.bound='true';
      menu.addEventListener('toggle', async () => {
        if (!menu.open || menu.hasAttribute('data-tools-static')) return;
        try {
          const tools=await getTools();
          const list=menu.querySelector('[data-tools-list]');
          if (!list) return;
          const links=tools.map(tool => {
            const link=document.createElement('a');link.href=tool.url;
            const name=document.createElement('strong');name.textContent=tool.name;
            const description=document.createElement('small');description.textContent=typeof tool.description==='string'?tool.description:'';
            if (tool.repository) link.dataset.repository=tool.repository;
            link.append(name,description);return link;
          });
          if (!links.length) {
            const message=document.createElement('p');message.textContent='暂时没有已发布的小工具。';links.push(message);
          }
          list.replaceChildren(...links);menu.dataset.loaded='true';
        } catch { /* The rendered links remain usable offline or if the catalog is unavailable. */ }
      });
      menu.addEventListener('click', event => { if (event.target.closest('a')) menu.open=false; });
      menu.addEventListener('focusout', () => {
        setTimeout(() => { if (!menu.contains(document.activeElement)) menu.open=false; },0);
      });
    });
  }
  document.addEventListener('pointerdown', event => {
    document.querySelectorAll('details.tools-menu[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open=false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key!=='Escape') return;
    document.querySelectorAll('details.tools-menu[open]').forEach(menu => { menu.open=false;menu.querySelector('summary')?.focus(); });
  });
  window.__neilToolsMenu=init;
  document.addEventListener('astro:page-load',init);
  init();
})();
