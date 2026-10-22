import snapshot from './repositories.json';
import { createCatalog } from '../lib/catalog.mjs';
export const profile = {
  name: '木匠钉子',
  englishName: 'Neil Chen',
  introduction: '我是木匠钉子(Neil Chen)',
  tagline: '咸鱼一条。',
  description: '关注数据库内核与系统设计，也做一些自己用得上的小工具。',
  wechat: { name: '木匠钉子', url: '/wechat/', qrcode: '/images/wechat-qrcode.jpg' },
  avatar: '/images/avatar-shark.jpg',
  github: 'https://github.com/czNail',
  blog: 'https://cznail.github.io/my-blog/',
  rss: 'https://cznail.github.io/my-blog/rss.xml',
};

export const projectDetails = [
  {
    name: 'GMKit',
    label: '密码工具',
    description: '面向国密互操作、本地测试与脚本自动化的命令行工具集，支持 SM2、SM3 和 SM4。',
    tags: ['Python', 'CLI', 'SM2 / SM3 / SM4'],
    url: 'https://github.com/czNail/GMKit',
    icon: 'terminal',
  },
];

// 仓库 homepage.json 的同步快照供正文、下拉菜单和 /tools.json 共用。
export const { projects, tools } = createCatalog(snapshot.repositories, projectDetails);
