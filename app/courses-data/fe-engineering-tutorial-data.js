// =============================================================
// 前端工程化教程 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 15 章，覆盖 3 大主题方向。
// 纯内容阅读型教程，配合 CodeBlock 工具栏支持代码复制 / 跳转 Playground。
//
// 3 个 batch 文件，每组 5 章：
//   fe-engineering-chapters-batch1.js : 基础概念 1-5
//   fe-engineering-chapters-batch2.js : 构建与打包 6-10
//   fe-engineering-chapters-batch3.js : 质量与现代化 11-15
// =============================================================

import { chapters as batch1 } from "./fe-engineering-chapters-batch1";
import { chapters as batch2 } from "./fe-engineering-chapters-batch2";
import { chapters as batch3 } from "./fe-engineering-chapters-batch3";

export const feEngineeringChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
];

export const feEngineeringChapterGroups = [
  "基础概念",
  "构建与打包",
  "质量与现代化",
];
