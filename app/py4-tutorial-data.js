// =============================================================
// Python 3.12+ 全面实战教程 —— 章节数据聚合入口
// 56 章 14 分组，每章独立 demo，文字精简。
// 覆盖 Python 日常开发的所有核心功能，基于 3.12+ 语法。
// =============================================================

import { chapters as batch1 } from "./py4-chapters-batch1";
import { chapters as batch2 } from "./py4-chapters-batch2";
import { chapters as batch3 } from "./py4-chapters-batch3";
import { chapters as batch4 } from "./py4-chapters-batch4";
import { chapters as batch5 } from "./py4-chapters-batch5";
import { chapters as batch6 } from "./py4-chapters-batch6";
import { chapters as batch7 } from "./py4-chapters-batch7";
import { chapters as batch8 } from "./py4-chapters-batch8";
import { chapters as batch9 } from "./py4-chapters-batch9";
import { chapters as batch10 } from "./py4-chapters-batch10";
import { chapters as batch11 } from "./py4-chapters-batch11";
import { chapters as batch12 } from "./py4-chapters-batch12";
import { chapters as batch13 } from "./py4-chapters-batch13";
import { chapters as batch14 } from "./py4-chapters-batch14";

export const py4Chapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5,
  ...batch6, ...batch7, ...batch8, ...batch9, ...batch10,
  ...batch11, ...batch12, ...batch13, ...batch14,
];

export const py4ChapterGroups = [
  "快速开始",
  "控制流",
  "函数",
  "数据结构",
  "推导式",
  "面向对象",
  "模块与包",
  "文件与 IO",
  "异常处理",
  "迭代器与生成器",
  "函数式编程",
  "装饰器",
  "并发编程",
  "现代特性",
];