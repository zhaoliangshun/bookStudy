// =============================================================
// 计算机原理入门教程（cs）章节数据聚合入口
// -------------------------------------------------------------
// 共 32 章，4 个 batch 文件。
// 风格：简单入门、生活例子、干货、对编程有帮助。
// 演示代码用 Python，通过 /api/run-py 调用系统 python3 执行。
// =============================================================

import { chapters as batch1 } from "./cs-chapters-batch1";
import { chapters as batch2 } from "./cs-chapters-batch2";
import { chapters as batch3 } from "./cs-chapters-batch3";
import { chapters as batch4 } from "./cs-chapters-batch4";

export const csChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const csChapterGroups = [
  "从开关到计算",
  "二进制与数据",
  "数据怎么表示",
  "硬件组成",
  "程序运行原理",
  "操作系统基础",
  "编程中的为什么",
];
