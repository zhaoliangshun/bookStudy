// =============================================================
// 《情绪的弱点》—— 简明总结版 · 章节数据聚合入口
// -------------------------------------------------------------
// 共 100 章，覆盖 10 大情绪方面，约 1000 个弱点条目。
// 纯内容阅读型，无代码执行功能。
// 本书特点：文字简洁，点多面广，不拖泥带水，概括性强。
// 专注情绪领域，系统剖析各类情绪弱点。
//
// 10 个 batch 文件：
//   emotion2-batch1.js  : 第一篇 愤怒之火 · 情绪的爆发（10章）
//   emotion2-batch2.js  : 第二篇 焦虑之忧 · 情绪的内耗（10章）
//   emotion2-batch3.js  : 第三篇 恐惧之影 · 情绪的逃避（10章）
//   emotion2-batch4.js  : 第四篇 悲伤之渊 · 情绪的低谷（10章）
//   emotion2-batch5.js  : 第五篇 嫉妒之毒 · 情绪的暗箭（10章）
//   emotion2-batch6.js  : 第六篇 愧疚之锁 · 情绪的枷锁（10章）
//   emotion2-batch7.js  : 第七篇 虚荣之雾 · 情绪的伪装（10章）
//   emotion2-batch8.js  : 第八篇 执念之困 · 情绪的死结（10章）
//   emotion2-batch9.js  : 第九篇 麻木之冰 · 情绪的缺失（10章）
//   emotion2-batch10.js : 第十篇 情绪智慧 · 管理与超越（10章）
// =============================================================

import { chapters as e2batch1 } from "./emotion2-batch1";
import { chapters as e2batch2 } from "./emotion2-batch2";
import { chapters as e2batch3 } from "./emotion2-batch3";
import { chapters as e2batch4 } from "./emotion2-batch4";
import { chapters as e2batch5 } from "./emotion2-batch5";
import { chapters as e2batch6 } from "./emotion2-batch6";
import { chapters as e2batch7 } from "./emotion2-batch7";
import { chapters as e2batch8 } from "./emotion2-batch8";
import { chapters as e2batch9 } from "./emotion2-batch9";
import { chapters as e2batch10 } from "./emotion2-batch10";

export const emotion2Chapters = [
  ...e2batch1,
  ...e2batch2,
  ...e2batch3,
  ...e2batch4,
  ...e2batch5,
  ...e2batch6,
  ...e2batch7,
  ...e2batch8,
  ...e2batch9,
  ...e2batch10,
];

export const emotion2ChapterGroups = [
  "愤怒之火 · 情绪的爆发",
  "焦虑之忧 · 情绪的内耗",
  "恐惧之影 · 情绪的逃避",
  "悲伤之渊 · 情绪的低谷",
  "嫉妒之毒 · 情绪的暗箭",
  "愧疚之锁 · 情绪的枷锁",
  "虚荣之雾 · 情绪的伪装",
  "执念之困 · 情绪的死结",
  "麻木之冰 · 情绪的缺失",
  "情绪智慧 · 管理与超越",
];
