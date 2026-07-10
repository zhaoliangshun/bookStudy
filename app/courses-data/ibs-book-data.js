// =============================================================
// 肠易激综合征康复全书 - 章节数据聚合入口
// -------------------------------------------------------------
// 《肠易激综合征康复全书——从认识、诊断到长期管理的完整指南》
// 共 24 章（前言 + 22章 + 结语），覆盖 6 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 4 个 batch 文件：
//   ibs-chapters-batch1.js : 前言 + 第一部分 认识肠易激（第1-5章）
//   ibs-chapters-batch2.js : 第二部分 病因机制深入（第6-11章）
//   ibs-chapters-batch3.js : 第三部分 诊断与就医 + 第四部分 饮食调理（第12-17章）
//   ibs-chapters-batch4.js : 第五部分 生活方式与心理 + 第六部分 长期管理 + 结语（第18-22章 + 结语）
// =============================================================

import { chapters as batch1 } from "./ibs-chapters-batch1";
import { chapters as batch2 } from "./ibs-chapters-batch2";
import { chapters as batch3 } from "./ibs-chapters-batch3";
import { chapters as batch4 } from "./ibs-chapters-batch4";

export const ibsChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const ibsChapterGroups = [
  "开篇",
  "第一部分 认识肠易激",
  "第二部分 病因机制深入",
  "第三部分 诊断与就医",
  "第四部分 饮食调理",
  "第五部分 生活方式与心理",
  "第六部分 长期管理",
  "结尾",
];
