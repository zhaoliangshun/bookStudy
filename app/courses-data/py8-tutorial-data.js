// =============================================================
// Python 全而大教程（py8）章节数据聚合入口
// -------------------------------------------------------------
// 全新制作，共 10 个 batch 文件，100 章，覆盖 100% 日常开发知识。
// 章节数据拆分到 py8-chapters-batch1 ~ batch10 中。
// 运行方式：通过 /api/run-py 调用系统 python3 执行。
// =============================================================

import { chapters as batch1 } from "./py8-chapters-batch1";
import { chapters as batch2 } from "./py8-chapters-batch2";
import { chapters as batch3 } from "./py8-chapters-batch3";
import { chapters as batch4 } from "./py8-chapters-batch4";
import { chapters as batch5 } from "./py8-chapters-batch5";
import { chapters as batch6 } from "./py8-chapters-batch6";
import { chapters as batch7 } from "./py8-chapters-batch7";
import { chapters as batch8 } from "./py8-chapters-batch8";
import { chapters as batch9 } from "./py8-chapters-batch9";
import { chapters as batch10 } from "./py8-chapters-batch10";

export const py8Chapters = [
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
];

export const py8ChapterGroups = [
  "环境与入门",
  "数据类型与字符串",
  "流程控制",
  "数据结构",
  "函数编程",
  "面向对象上",
  "面向对象下与异常",
  "文件IO与模块",
  "并发与网络",
  "数据库测试工程化",
];
