// =============================================================
// 红中麻将快速胡牌技巧 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 20 章，覆盖 4 大主题方向。
// 纯内容阅读型书籍，无代码执行功能。
//
// 4 个 batch 文件，每组 5 章：
//   mahjong-chapters-batch1.js : 基础规则 1-5
//   mahjong-chapters-batch2.js : 胡牌核心策略 6-10
//   mahjong-chapters-batch3.js : 红中战术进阶 11-15
//   mahjong-chapters-batch4.js : 实战案例与心法 16-20
// =============================================================

import { chapters as batch1 } from "./mahjong-chapters-batch1";
import { chapters as batch2 } from "./mahjong-chapters-batch2";
import { chapters as batch3 } from "./mahjong-chapters-batch3";
import { chapters as batch4 } from "./mahjong-chapters-batch4";

export const mahjongChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const mahjongChapterGroups = [
  "基础规则",
  "胡牌核心策略",
  "红中战术进阶",
  "实战案例与心法",
];