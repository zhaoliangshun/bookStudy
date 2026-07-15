// =============================================================
// 《人性的弱点·大全集》—— 简明总结版 · 章节数据聚合入口
// -------------------------------------------------------------
// 共 90 章，覆盖 10 大方面，约 900 个弱点条目。
// 纯内容阅读型，无代码执行功能。
// 本书特点：文字简洁，点多面广，不拖泥带水，概括性强。
// 风格：一句话点透本质，每条简短有力，方便快速阅读和自我对照。
//
// 10 个 batch 文件：
//   weakness2-batch1.js  : 第一篇 思维认知篇 · 大脑的盲区（10章）
//   weakness2-batch2.js  : 第二篇 情绪心理篇 · 内心的暗流（10章）
//   weakness2-batch3.js  : 第三篇 言语沟通篇 · 嘴上的毛病（10章）
//   weakness2-batch4.js  : 第四篇 社交人际篇 · 关系中的陷阱（10章）
//   weakness2-batch5.js  : 第五篇 行动做事篇 · 行动上的短板（10章）
//   weakness2-batch6.js  : 第六篇 欲望执念篇 · 放不下的枷锁（10章）
//   weakness2-batch7.js  : 第七篇 自我认知篇 · 对自己的误解（8章）
//   weakness2-batch8.js  : 第八篇 职场发展篇 · 工作中的盲点（8章）
//   weakness2-batch9.js  : 第九篇 金钱利益篇 · 钱财面前的丑态（8章）
//   weakness2-batch10.js : 第十篇 生活日常篇 · 随处可见的弱点（8章）
// =============================================================

import { chapters as w2batch1 } from "./weakness2-batch1";
import { chapters as w2batch2 } from "./weakness2-batch2";
import { chapters as w2batch3 } from "./weakness2-batch3";
import { chapters as w2batch4 } from "./weakness2-batch4";
import { chapters as w2batch5 } from "./weakness2-batch5";
import { chapters as w2batch6 } from "./weakness2-batch6";
import { chapters as w2batch7 } from "./weakness2-batch7";
import { chapters as w2batch8 } from "./weakness2-batch8";
import { chapters as w2batch9 } from "./weakness2-batch9";
import { chapters as w2batch10 } from "./weakness2-batch10";

export const weakness2Chapters = [
  ...w2batch1,
  ...w2batch2,
  ...w2batch3,
  ...w2batch4,
  ...w2batch5,
  ...w2batch6,
  ...w2batch7,
  ...w2batch8,
  ...w2batch9,
  ...w2batch10,
];

export const weakness2ChapterGroups = [
  "思维认知篇 · 大脑的盲区",
  "情绪心理篇 · 内心的暗流",
  "言语沟通篇 · 嘴上的毛病",
  "社交人际篇 · 关系中的陷阱",
  "行动做事篇 · 行动上的短板",
  "欲望执念篇 · 放不下的枷锁",
  "自我认知篇 · 对自己的误解",
  "职场发展篇 · 工作中的盲点",
  "金钱利益篇 · 钱财面前的丑态",
  "生活日常篇 · 随处可见的弱点",
];
