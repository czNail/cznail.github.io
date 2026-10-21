// 精选文章：从现有博客 RSS 核对，手动维护。
export const posts = [
  {
    "cover": "/images/btree-cleanup.webp",
    "title": "B-tree 里的重复 Key 与旧记录的清理",
    "description": "从一次阻止了 HOT 的普通 UPDATE 出发，解释 Unique Index 为什么允许重复 Key、B-tree 如何在插入路径上清理旧版本，以及 VACUUM 清理完成之后，空间为什么仍可能留在 Index 文件里。",
    "url": "https://cznail.github.io/my-blog/posts/b-tree-%E9%87%8C%E7%9A%84%E9%87%8D%E5%A4%8D-key-%E4%B8%8E%E6%97%A7%E8%AE%B0%E5%BD%95%E7%9A%84%E6%B8%85%E7%90%86/",
    "date": "2026-10-17",
    "category": "PostgreSQL"
  },
  {
    "title": "COMMIT 返回之前，PostgreSQL 到底在等什么？",
    "description": "COMMIT 返回之前，PostgreSQL 要等 WAL 持久化到自己的 Commit LSN。可这条有序日志是一群并发 Backend 写出来的，这条线比想象中曲折。",
    "url": "https://cznail.github.io/my-blog/posts/commit-%E8%BF%94%E5%9B%9E%E4%B9%8B%E5%89%8Dpostgresql-%E5%88%B0%E5%BA%95%E5%9C%A8%E7%AD%89%E4%BB%80%E4%B9%88/",
    "date": "2026-09-05",
    "category": "PostgreSQL"
  },
  {
    "title": "Shared Buffers 不是一个 Cache",
    "description": "Shared Buffers 会缓存 Page，但沿着一个 Buffer Slot 的生命周期看下去，里面还有 identity、pin、I/O、dirty 和 eviction 组成的一整套协议。",
    "url": "https://cznail.github.io/my-blog/posts/shared-buffers-%E4%B8%8D%E6%98%AF%E4%B8%80%E4%B8%AA-cache/",
    "date": "2026-08-22",
    "category": "PostgreSQL"
  }
];
