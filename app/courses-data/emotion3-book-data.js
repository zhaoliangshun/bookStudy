// =============================================================
// 《情绪弱点大百科》—— 简明总结版 · 章节数据聚合入口
// -------------------------------------------------------------
// 共 100 章，覆盖 10 大情绪方面，约 1000 个弱点条目。
// 纯内容阅读型，无代码执行功能。
// 本书特点：文字简洁，点多面广，不拖泥带水，概括性强。
// 专注情绪领域，从日常场景、人际、自我、行为、模式、陷阱、
// 黑洞、关系、身体、自愈全方位剖析情绪弱点。
//
// 10 个 batch 文件：
//   emotion3-batch1.js  : 第一篇 喜怒哀惧 · 四大基础情绪（10章）
//   emotion3-batch2.js  : 第二篇 人际情绪 · 关系里的情绪（10章）
//   emotion3-batch3.js  : 第三篇 自我情绪 · 与自己的关系（10章）
//   emotion3-batch4.js  : 第四篇 行为情绪 · 情绪驱动行为（10章）
//   emotion3-batch5.js  : 第五篇 负面模式 · 反复出现的情绪模式（10章）
//   emotion3-batch6.js  : 第六篇 情绪陷阱 · 常见的情绪坑（10章）
//   emotion3-batch7.js  : 第七篇 情绪黑洞 · 吞噬你的能量（10章）
//   emotion3-batch8.js  : 第八篇 关系情绪 · 爱与被爱里的情绪（10章）
//   emotion3-batch9.js  : 第九篇 身体知道 · 情绪写在身体上（10章）
//   emotion3-batch10.js : 第十篇 情绪自愈 · 与情绪和平共处（10章）
// =============================================================

import { chapters as e3batch1 } from "./emotion3-batch1";
import { chapters as e3batch2 } from "./emotion3-batch2";
import { chapters as e3batch3 } from "./emotion3-batch3";
import { chapters as e3batch4 } from "./emotion3-batch4";
import { chapters as e3batch5 } from "./emotion3-batch5";
import { chapters as e3batch6 } from "./emotion3-batch6";
import { chapters as e3batch7 } from "./emotion3-batch7";
import { chapters as e3batch8 } from "./emotion3-batch8";
import { chapters as e3batch9 } from "./emotion3-batch9";
import { chapters as e3batch10 } from "./emotion3-batch10";

export const emotion3Chapters = [
  ...e3batch1,
  ...e3batch2,
  ...e3batch3,
  ...e3batch4,
  ...e3batch5,
  ...e3batch6,
  ...e3batch7,
  ...e3batch8,
  ...e3batch9,
  ...e3batch10,
];

export const emotion3ChapterGroups = [
  "喜怒哀惧 · 四大基础情绪",
  "人际情绪 · 关系里的情绪",
  "自我情绪 · 与自己的关系",
  "行为情绪 · 情绪驱动行为",
  "负面模式 · 反复出现的情绪模式",
  "情绪陷阱 · 常见的情绪坑",
  "情绪黑洞 · 吞噬你的能量",
  "关系情绪 · 爱与被爱里的情绪",
  "身体知道 · 情绪写在身体上",
  "情绪自愈 · 与情绪和平共处",
];
