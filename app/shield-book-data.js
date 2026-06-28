// =============================================================
// 回怼护盾 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 30 章（前言 + 28 章正文 + 结语），覆盖 6 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 本书定位：
//   实战话术 + 心理护甲并重，列举大量具体情境下的回复。
//   核心目的：让别人伤害不到你（心理防护 + 实战话术并重）。
//
// 与同类书籍的区别：
//   《怼人艺术》偏主动话术堆砌
//   《反怼心理学》偏心理学原理分析
//   《回怼护盾》两者并重，更侧重"在各种情境下具体如何回复"
//
// 5 个 batch 文件：
//   shield-chapters-batch1.js : 前言 + 第一部分 心理护甲（第1-5章）
//   shield-chapters-batch2.js : 第二部分 回怼原则与技巧（第6-10章）+ 第三部分第1章（第11章）
//   shield-chapters-batch3.js : 第三部分 职场情境（第12-15章）+ 第四部分 社交情境开篇（第16-17章）
//   shield-chapters-batch4.js : 第四部分 社交情境（第18-20章）+ 第五部分 家庭情境开篇（第21-23章）
//   shield-chapters-batch5.js : 第五部分 家庭情境（第24章）+ 第六部分 高级反击（第25-28章）+ 结语
// =============================================================

import { chapters as batch1 } from "./shield-chapters-batch1";
import { chapters as batch2 } from "./shield-chapters-batch2";
import { chapters as batch3 } from "./shield-chapters-batch3";
import { chapters as batch4 } from "./shield-chapters-batch4";
import { chapters as batch5 } from "./shield-chapters-batch5";

export const shieldChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const shieldChapterGroups = [
  "开篇",
  "第一部分 心理护甲——让别人伤不到你",
  "第二部分 回怼的基本原则与技巧",
  "第三部分 职场情境回怼",
  "第四部分 社交情境回怼",
  "第五部分 亲密关系与家庭情境",
  "第六部分 高级反击与特殊场景",
  "结尾",
];
