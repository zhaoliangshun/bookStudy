// =============================================================
// 人际关系心理学 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 18 章 + 前言 + 结语，覆盖 5 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 5 个 batch 文件：
//   psychology-chapters-batch1.js : 前言 + 第一部分（第1-4章）
//   psychology-chapters-batch2.js : 第二部分（第5-7章）
//   psychology-chapters-batch3.js : 第三部分（第8-11章）
//   psychology-chapters-batch4.js : 第四部分（第12-14章）
//   psychology-chapters-batch5.js : 第五部分（第15-18章）+ 结语
// =============================================================

import { chapters as batch1 } from "./psychology-chapters-batch1";
import { chapters as batch2 } from "./psychology-chapters-batch2";
import { chapters as batch3 } from "./psychology-chapters-batch3";
import { chapters as batch4 } from "./psychology-chapters-batch4";
import { chapters as batch5 } from "./psychology-chapters-batch5";

export const psychologyChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const psychologyChapterGroups = [
  "开篇",
  "第一部分 人际关系为什么如此伤人",
  "第二部分 在关系中保护自己",
  "第三部分 面对恶意——回击的艺术",
  "第四部分 释怀与重建",
  "第五部分 正确交往之道",
  "结尾",
];
