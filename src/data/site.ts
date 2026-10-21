import toolCatalog from './tools.json';
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
    name: '仓位助手', label: '资产配置',
    description: '把资产比例、定投与再平衡放在一起，做一个自己用得顺手的仓位工具。',
    tags: ['TypeScript', '资产配置'],
    url: 'https://github.com/czNail/portfolio-pilot', icon: 'chart',
  },
  {
    name: 'TOTP 验证器', label: '隐私与安全',
    description: '在浏览器里管理动态验证码，探索本地加密、备份与简单交互之间的平衡。',
    tags: ['TypeScript', '本地加密'],
    url: 'https://github.com/czNail/totp', icon: 'shield',
  },
  {
    name: 'GMKit',
    label: '密码工具',
    description: '面向国密互操作、本地测试与脚本自动化的命令行工具集，支持 SM2、SM3 和 SM4。',
    tags: ['Python', 'CLI', 'SM2 / SM3 / SM4'],
    url: 'https://github.com/czNail/GMKit',
    icon: 'terminal',
  },
  {
    name: 'Code Mate',
    label: '设计评审',
    description: '围绕真实代码与文档，逐步讨论数据库类系统的模块边界、状态所有权与故障语义。',
    tags: ['Agent Skill', 'System Design'],
    url: 'https://github.com/czNail/code-mate',
    icon: 'code',
  },
];

// 工具目录是主页正文、下拉菜单与 /tools.json 的唯一数据源。
export const { projects, tools } = createCatalog(snapshot.repositories, projectDetails, toolCatalog);
