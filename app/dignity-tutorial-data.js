// =============================================================
// 《放不下的愤怒：被攻击后如何修复尊严与重建自我》
// - 章节数据聚合入口
// -------------------------------------------------------------
// 共 30 章，覆盖 6 大部分 + 开篇 + 结尾。
// 纯内容阅读型书籍，无代码执行功能。
//
// 6 个 batch 文件：
//   dignity-chapters-batch1.js : 开篇 + 第一部分 事件还原（5 章）
//   dignity-chapters-batch2.js : 第二部分 看破——重新理解那件事（5 章）
//   dignity-chapters-batch3.js : 第三部分 疗愈——修复受伤的心灵（5 章）
//   dignity-chapters-batch4.js : 第四部分 重建——找回你的力量（5 章）
//   dignity-chapters-batch5.js : 第五部分 未来——再遇到这种事怎么办（5 章）
//   dignity-chapters-batch6.js : 第六部分 深层 + 结尾（5 章）
// =============================================================

import { chapters as batch1 } from "./dignity-chapters-batch1";
import { chapters as batch2 } from "./dignity-chapters-batch2";
import { chapters as batch3 } from "./dignity-chapters-batch3";
import { chapters as batch4 } from "./dignity-chapters-batch4";
import { chapters as batch5 } from "./dignity-chapters-batch5";
import { chapters as batch6 } from "./dignity-chapters-batch6";

// 合并所有 batch 的章节，保持顺序
export const dignityChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

// 章节分组（按书籍结构顺序排列，与 Sidebar 左侧目录一致）
export const dignityChapterGroups = [
  "开篇",
  "第一部分 事件还原——到底发生了什么",
  "第二部分 看破——重新理解那件事",
  "第三部分 疗愈——修复受伤的心灵",
  "第四部分 重建——找回你的力量",
  "第五部分 未来——再遇到这种事怎么办",
  "第六部分 深层——当愤怒背后是更深的伤口",
  "结尾",
];
