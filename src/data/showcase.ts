// Stable editorial choices. Repository availability still comes from the build snapshot.
export const featuredRepository = 'pg-playground';
export const showcase = {
  order: ['pg-playground', 'pg-handbook', 'portfolio-pilot', 'totp', 'code-mate'],
  details: {
    'ballance-web': {
      description: '控制小球穿过悬空木桥，在惯性、刹车和侧风之间找到平衡。',
      features: ['三段旅程', '三种材质', '键盘与触屏'],
      preview: '/images/ballance-preview.svg',
      previewAlt: '云端之间关卡示意：悬空木桥、木球、检查点与终点',
    },
    'pg-handbook': {
      description: '交付、调优、数据库设计、故障诊断与检索评测。导入证据，在本地完成分析并导出报告。',
      features: ['五类工作台', '本地分析', '报告导出'],
    },
    'pg-playground': {
      description: '在浏览器里运行 SQL，查看表结构与执行计划。无需安装，数据保存在本地。',
      features: ['SQL 编辑器', '执行计划', '本地保存'],
      preview: '/images/pg-playground-preview.webp',
      previewAlt: 'PostgreSQL 实验台界面：SQL 编辑器与 orders 表的顺序扫描执行计划',
    },
    'portfolio-pilot': {
      description: '输入持仓与目标比例，规划定投和再平衡，让每一笔投入都有方向。',
      features: ['资产比例', '定投规划', '再平衡'],
      preview: '/images/portfolio-pilot-preview.webp',
      previewAlt: '仓位助手示例界面：每月投入清单与投资组合目标比例',
    },
    totp: {
      description: '管理多个账号的动态验证码，支持本地加密与 PIN 解锁，打开就能用。',
      features: ['多账号', '本地加密', 'PIN 解锁'],
    },
    'code-mate': {
      description: '带着代码和文档讨论系统设计，逐步理清模块职责、状态归属与故障处理。',
      features: ['代码与文档', '设计讨论', '数据库系统'],
    },
  },
};

