// =============================================================
// FastAPI 代码详解 —— 章节数据聚合入口
// -------------------------------------------------------------
// 16 章 4 分组，demo 驱动，代码注释详细，重点在代码里讲解。
// 覆盖：快速入门 → 数据处理 → 核心机制 → 实战进阶
//
// 路由：/fastapi-code
// =============================================================

import { chapters as batch1 } from "./fastapi-code-batch1";
import { chapters as batch2 } from "./fastapi-code-batch2";
import { chapters as batch3 } from "./fastapi-code-batch3";
import { chapters as batch4 } from "./fastapi-code-batch4";

export const fastapiCodeChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
];

export const fastapiCodeChapterGroups = [
  "快速入门",
  "数据处理",
  "核心机制",
  "实战进阶",
];