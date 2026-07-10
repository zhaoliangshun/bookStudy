// =============================================================
// 后端开发综合教程 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 教程体量扩大 10 倍，共 40 章，覆盖后端工程师日常高频知识点。
// 内容与具体语言无关：content 用中文讲解通用后端原理，并用
// Java/Go/Python/Node.js 等多语言伪代码对照；code 字段是可在
// 共享沙箱中直接运行的 Node.js 代码，通过 /api/run-backend 执行。
//
// 8 个 batch 文件，每组 5 章：
//   backend-chapters-batch1.js : 基础与网络 1-5
//   backend-chapters-batch2.js : 基础与网络 6-10
//   backend-chapters-batch3.js : API 设计与架构 1-5
//   backend-chapters-batch4.js : API 设计与架构 6-10
//   backend-chapters-batch5.js : 数据存储 1-5
//   backend-chapters-batch6.js : 数据存储 6-10
//   backend-chapters-batch7.js : 分布式与工程化 1-5
//   backend-chapters-batch8.js : 分布式与工程化 6-10
// =============================================================

import { chapters as batch1 } from "./backend-chapters-batch1";
import { chapters as batch2 } from "./backend-chapters-batch2";
import { chapters as batch3 } from "./backend-chapters-batch3";
import { chapters as batch4 } from "./backend-chapters-batch4";
import { chapters as batch5 } from "./backend-chapters-batch5";
import { chapters as batch6 } from "./backend-chapters-batch6";
import { chapters as batch7 } from "./backend-chapters-batch7";
import { chapters as batch8 } from "./backend-chapters-batch8";

// 按分组顺序拼接所有章节
export const backendChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
];

// 侧边栏分组顺序
export const backendChapterGroups = [
  "基础与网络",
  "API 设计与架构",
  "数据存储",
  "分布式与工程化",
];
