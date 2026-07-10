// =============================================================
// Next.js 16 教程 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 25 章，覆盖 5 大主题方向，基于 Next.js 16.2.9 + React 19.2.4。
// 纯内容阅读型教程，配合 CodeBlock 工具栏支持代码复制 / 跳转 Playground。
//
// 重点覆盖 Next.js 16 破坏性变更：
//   - Turbopack 默认（无需 --turbopack 标志）
//   - Async Request APIs（params/searchParams/cookies/headers 全部 Promise）
//   - middleware 弃用为 proxy（Node.js 运行时）
//   - cacheComponents 取代 PPR
//   - revalidateTag 第二参数 / updateTag / refresh 新 API
//   - React Compiler 稳定 / React 19.2 新特性
//
// 5 个 batch 文件，每组 5 章：
//   nextjs-chapters-batch1.js : 基础入门 1-5
//   nextjs-chapters-batch2.js : 数据与交互 6-10
//   nextjs-chapters-batch3.js : 高级路由 11-15
//   nextjs-chapters-batch4.js : 性能与缓存 16-20
//   nextjs-chapters-batch5.js : 配置与部署 21-25
// =============================================================

import { chapters as batch1 } from "./nextjs-chapters-batch1";
import { chapters as batch2 } from "./nextjs-chapters-batch2";
import { chapters as batch3 } from "./nextjs-chapters-batch3";
import { chapters as batch4 } from "./nextjs-chapters-batch4";
import { chapters as batch5 } from "./nextjs-chapters-batch5";

export const nextjsChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const nextjsChapterGroups = [
  "基础入门",
  "数据与交互",
  "高级路由",
  "性能与缓存",
  "配置与部署",
];
