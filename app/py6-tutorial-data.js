// =============================================================
// Python 全面教程（py6）章节数据聚合入口
// -------------------------------------------------------------
// 全新制作，共 14 个 batch 文件，194 章，覆盖 100% 日常开发知识。
// 章节数据拆分到 py6-chapters-batch1 ~ batch14 中。
// 运行方式：通过 /api/run-py 调用系统 python3 执行。
// =============================================================

import { chapters as batch1 } from "./py6-chapters-batch1";
import { chapters as batch2 } from "./py6-chapters-batch2";
import { chapters as batch3 } from "./py6-chapters-batch3";
import { chapters as batch4 } from "./py6-chapters-batch4";
import { chapters as batch5 } from "./py6-chapters-batch5";
import { chapters as batch6 } from "./py6-chapters-batch6";
import { chapters as batch7 } from "./py6-chapters-batch7";
import { chapters as batch8 } from "./py6-chapters-batch8";
import { chapters as batch9 } from "./py6-chapters-batch9";
import { chapters as batch10 } from "./py6-chapters-batch10";
import { chapters as batch11 } from "./py6-chapters-batch11";
import { chapters as batch12 } from "./py6-chapters-batch12";
import { chapters as batch13 } from "./py6-chapters-batch13";
import { chapters as batch14 } from "./py6-chapters-batch14";

export const py6Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
  ...batch11,
  ...batch12,
  ...batch13,
  ...batch14,
];

export const py6ChapterGroups = [
  "基础入门",
  "流程控制",
  "数据结构",
  "函数编程",
  "模块与包",
  "面向对象",
  "文件与异常",
  "内置模块",
  "高级特性",
  "并发网络",
  "工程实战",
  "数据结构进阶",
  "面向对象进阶",
  "函数与并发进阶",
  "工程实战补充",
];
