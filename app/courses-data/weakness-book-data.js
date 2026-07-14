// =============================================================
// 《人性的弱点》—— 看清自己，超越自己 · 章节数据聚合入口
// -------------------------------------------------------------
// 34 章 7 篇，从不同角度系统剖析人性弱点及应对改进之道。
// 覆盖：认知之弱 → 情绪之弱 → 社交之弱 → 行动之弱
//       → 欲望之弱 → 自我之弱 → 超越之路
//
// 主题：人性有弱点是常态，不是耻辱。
//       看清弱点不是为了自责，是为了不再被弱点牵着鼻子走。
//       接纳它，应对它，最后超越它。
// =============================================================

import { chapters as batch1 } from "./weakness-batch1";
import { chapters as batch2 } from "./weakness-batch2";
import { chapters as batch3 } from "./weakness-batch3";
import { chapters as batch4 } from "./weakness-batch4";
import { chapters as batch5 } from "./weakness-batch5";
import { chapters as batch6 } from "./weakness-batch6";
import { chapters as batch7 } from "./weakness-batch7";

export const weaknessChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7,
];

export const weaknessChapterGroups = [
  "认知之弱 · 大脑的盲区",
  "情绪之弱 · 情绪的失控",
  "社交之弱 · 他人的眼光",
  "行动之弱 · 行动的迟滞",
  "欲望之弱 · 欲望的牵引",
  "自我之弱 · 自我的迷障",
  "超越之路 · 与弱点共处",
];
