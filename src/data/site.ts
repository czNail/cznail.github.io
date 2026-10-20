export const profile = {
  name: '木匠钉子',
  englishName: 'Neil Chen',
  introduction: '我是木匠钉子(Neil Chen)',
  github: 'https://github.com/czNail',
  blog: 'https://cznail.github.io/my-blog/',
  rss: 'https://cznail.github.io/my-blog/rss.xml',
};

export const projects = [
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

// 发布后填写 url 并把 status 改为 available；未发布时不渲染链接。
export const tools = [
  {
    name: 'Portfolio Pilot',
    subtitle: '资产配置与再平衡',
    description: '记录持仓与目标比例，规划新增资金分配，查看整体资产的压力情景。',
    status: 'development' as 'development' | 'available',
    url: '' as string,
    features: ['持仓管理', '定投规划', '只买入再平衡', '情景压力测试'],
  },
];
