// Stable editorial choices. Repository availability still comes from the build snapshot.
export const featuredRepository = 'pg-playground';
export const showcase = {
  order: ['pg-playground', 'pg-handbook', 'portfolio-pilot', 'totp', 'code-mate'],
  details: {
    'pg-handbook': {
      description: '沿着迁移、性能、恢复和运维四条工程主线，串联原理、实施、验证证据与交付模板。',
      features: ['工程手册', '生态选型', '交付工具'],
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
