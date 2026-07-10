// =============================================================
// 《破怒——被情绪暴击后如何彻底翻篇》- 章节数据聚合入口
// -------------------------------------------------------------
// 共 16 章（前言 + 15 章正文 + 结语），覆盖 3 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 本书定位：
//   专门针对"与人争执时对方突然情绪爆发（砸东西、破口大骂、怒不可遏），
//   你当场被镇住不敢作声，事后却长期无法释怀、反复回想、气愤难平、
//   觉得自己受了天大委屈、尊严碎了一地、甚至憋出病来"这一特定心理创伤。
//   重点：看破真相 → 疗愈伤口 → 预防再犯。
//
// 4 个 batch 文件：
//   unharmed-chapters-batch1.js : 前言 + 第一部分 看破（第1-2章）
//   unharmed-chapters-batch2.js : 第一部分 看破（第3-5章）
//   unharmed-chapters-batch3.js : 第二部分 疗愈（第6-10章）
//   unharmed-chapters-batch4.js : 第三部分 预防（第11-15章）+ 结语
// =============================================================

import { chapters as batch1 } from "./unharmed-chapters-batch1";
import { chapters as batch2 } from "./unharmed-chapters-batch2";
import { chapters as batch3 } from "./unharmed-chapters-batch3";
import { chapters as batch4 } from "./unharmed-chapters-batch4";

export const unharmedChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const unharmedChapterGroups = [
  "开篇",
  "第一部分 看破——那些你以为的\"真相\"都不是真相",
  "第二部分 疗愈——把卡住的情绪真正释放出去",
  "第三部分 预防——下次再遇，不再受伤",
  "结尾",
];
