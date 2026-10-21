import { iconPaths } from '../data/icon-paths';
import snapshot from '../data/repositories.json';
import toolDetails from '../data/tools.json';
import { profile, projectDetails } from '../data/site';
import { createCatalog, listRepositories, repositoryMetadata } from './catalog.mjs';
import { rankRepositories } from './recommendations.mjs';

type Repository = import('./catalog.mjs').Repository;
const interval = 5 * 60 * 1000;
const date = (value: string) => new Intl.DateTimeFormat('zh-CN', {timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit'}).format(new Date(value));
function text(parent: Element, selector: string, value: string) {
  parent.querySelector(selector)!.textContent = value;
}
function clone(id: string) {
  return (document.querySelector<HTMLTemplateElement>(id)!.content.firstElementChild!).cloneNode(true) as HTMLAnchorElement;
}
function empty(message: string) {
  const node = document.createElement('p'); node.className = 'recommendation-empty'; node.textContent = message;
  return node;
}
function render(repositories: Repository[]) {
  const catalog = createCatalog(repositories, projectDetails, toolDetails);
  const projects = catalog.projects.map(project => {
    const card = clone('#project-template'); card.href = project.url; card.dataset.repository = project.repository; card.dataset.visual = project.visual;
    text(card, 'h3', project.name); text(card, 'p', project.description); text(card, '.card-kind', project.label);
    const tags = project.tags.map(tag => { const li = document.createElement('li'); li.textContent = tag; return li; });
    card.querySelector('.tags')!.replaceChildren(...tags);
    return card;
  });
  document.querySelector('.project-grid')!.replaceChildren(...(projects.length ? projects : [empty('暂时没有可展示的公开项目。')]));
  const recommendations = rankRepositories(repositories).slice(0,1).map((repo, index) => {
    const project = catalog.projects.find(item => item.repository === repo.name)!;
    const tool = catalog.tools.find(item => item.repository === repo.name);
    const card = clone('#recommendation-template'); card.href = tool?.url ?? repo.url; card.dataset.repository = repo.name;
    card.classList.toggle('featured', index === 0);
    card.querySelector('.recommendation-icon path')!.setAttribute('d', iconPaths[project.icon] || iconPaths.code);
    text(card, 'strong', tool?.name ?? project.name);
    text(card, '.recommendation-description', tool?.description ?? project.description);
    const meta = card.querySelector('small')!;
    if (repo.stars > 0) { const star = document.createElement('span'); star.textContent = `☆ ${repo.stars}`; meta.append(star); }
    if (repo.lastCommitAt) { const time = document.createElement('time'); time.dateTime = repo.lastCommitAt; time.textContent = `${date(repo.lastCommitAt)} 更新`; meta.append(time); }
    return card;
  });
  document.querySelector('.recommendation-list')!.replaceChildren(...(recommendations.length ? recommendations : [empty('暂时没有可推荐的公开项目。')]));
  const toolsTemplate = document.querySelector<HTMLTemplateElement>('#tools-template')!;
  const tools = catalog.tools.map(tool => {
    const original = [...toolsTemplate.content.querySelectorAll<HTMLElement>('[data-repository]')].find(card => card.dataset.repository!.toLowerCase() === tool.repository.toLowerCase())!;
    return original.cloneNode(true);
  });
  document.querySelector('.tools-grid')!.replaceChildren(...(tools.length ? tools : [empty('暂时没有已发布的小工具。')]));
  document.querySelectorAll('[data-tools-list]').forEach(list => {
    const links = catalog.tools.map(tool => {
      const link = document.createElement('a'); link.href = tool.url; link.dataset.repository = tool.repository;
      const name = document.createElement('strong'); name.textContent = tool.name;
      const description = document.createElement('small'); description.textContent = tool.description;
      link.append(name, description); return link;
    });
    list.replaceChildren(...(links.length ? links : [empty('暂时没有已发布的小工具。')]));
  });
}

export function startRepositorySync() {
  let lastAttempt = 0;
  let pending = false;
  async function sync() {
    if (pending || document.hidden || Date.now() - lastAttempt < interval) return;
    pending = true; lastAttempt = Date.now();
    const status = document.querySelector('[data-sync-status]')!;
    status.textContent = '正在核对 GitHub 项目…';
    try {
      const repos = await listRepositories(async (path: string) => {
        const response = await fetch(`https://api.github.com${path}`, {
          headers:{Accept:'application/vnd.github+json'}, credentials:'omit', cache:'no-cache', signal:AbortSignal.timeout(12000),
        });
        if (!response.ok) throw Error(`GitHub ${response.status}`);
        return response.json();
      });
      const repositories = repos.map(repo => repositoryMetadata(repo, snapshot.repositories.find(old => old.name.toLowerCase() === repo.name.toLowerCase())));
      // A repository can still exist while its Pages deployment has been removed.
      await Promise.all(toolDetails.map(async tool => {
        const repo = repositories.find(repo => repo.name.toLowerCase() === tool.repository.toLowerCase());
        if (!repo?.hasPages) return;
        try {
          const response = await fetch(new URL(tool.url, profile.blog), {method:'HEAD',cache:'no-cache',signal:AbortSignal.timeout(8000)});
          if (response.status === 404 || response.status === 410) repo.pageAvailable = false;
        } catch { /* Keep the last published entry on transient network failures. */ }
      }));
      render(repositories);
      status.textContent = '已核对 GitHub 项目';
    } catch {
      status.textContent = '暂时无法核对，显示最近同步内容';
    } finally { pending = false; }
  }
  void sync();
  window.setInterval(() => void sync(), interval);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void sync(); });
}
