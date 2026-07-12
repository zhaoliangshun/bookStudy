// =============================================================
// FastAPI Demo 详解 —— 章节数据聚合入口
// -------------------------------------------------------------
// 16 章 4 分组，demo 驱动，代码注释详细，重点在代码里讲解。
// 覆盖：入门 → 请求与数据 → 核心机制 → 实战进阶
//
// 路由：/fastapi-learn
// =============================================================

import { chapters as batch1 } from "./fastapi-learn-batch1";
import { chapters as batch2 } from "./fastapi-learn-batch2";
import { chapters as batch3 } from "./fastapi-learn-batch3";
import { chapters as batch4 } from "./fastapi-learn-batch4";

export const fastapiLearnChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
];

export const fastapiLearnChapterGroups = [
  "入门基础",
  "请求与数据",
  "核心机制",
  "实战进阶",
];
