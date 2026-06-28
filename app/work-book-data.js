// =============================================================
// 职场生存指南 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 28 章（含前言 + 结语），覆盖 6 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 5 个 batch 文件：
//   work-chapters-batch1.js : 前言 + 第一部分（第1-4章）
//   work-chapters-batch2.js : 第二部分（第5-9章）
//   work-chapters-batch3.js : 第三部分（第10-14章）
//   work-chapters-batch4.js : 第四部分 + 第五部分第一章（第15-20章）
//   work-chapters-batch5.js : 第五部分剩余 + 第六部分 + 结语（第21-27章）
// =============================================================

import { chapters as batch1 } from "./work-chapters-batch1";
import { chapters as batch2 } from "./work-chapters-batch2";
import { chapters as batch3 } from "./work-chapters-batch3";
import { chapters as batch4 } from "./work-chapters-batch4";
import { chapters as batch5 } from "./work-chapters-batch5";

export const workChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const workChapterGroups = [
  "开篇",
  "第一部分 职场基础——心态与认知",
  "第二部分 与同事相处——平级关系的艺术",
  "第三部分 与领导相处——向上管理",
  "第四部分 处理矛盾——冲突管理",
  "第五部分 跨部门沟通——影响力辐射",
  "第六部分 职场进阶——成长与突破",
  "结尾",
];
