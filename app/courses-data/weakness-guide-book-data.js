// =============================================================
// 《人性弱点简明手册》—— 64个人性陷阱的简明指南
// -------------------------------------------------------------
// 8 组 64 个弱点，每个短小精悍，简单易读。
// 风格：概括性、不拖泥带水、点多面广。
//
// 覆盖：认知盲区 → 情绪陷阱 → 社交枷锁 → 欲望泥潭
//       → 自我迷障 → 行动阻碍 → 判断失误 → 人际暗礁与成长
// =============================================================

import { chapters as batch1 } from "./weakness-guide-batch1";
import { chapters as batch2 } from "./weakness-guide-batch2";
import { chapters as batch3 } from "./weakness-guide-batch3";
import { chapters as batch4 } from "./weakness-guide-batch4";
import { chapters as batch5 } from "./weakness-guide-batch5";
import { chapters as batch6 } from "./weakness-guide-batch6";
import { chapters as batch7 } from "./weakness-guide-batch7";
import { chapters as batch8 } from "./weakness-guide-batch8";

export const weaknessGuideChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
];

export const weaknessGuideChapterGroups = [
  "一、认知的盲区",
  "二、情绪的陷阱",
  "三、社交的枷锁",
  "四、欲望的泥潭",
  "五、自我的迷障",
  "六、行动的阻碍",
  "七、判断的失误",
  "八、人际的暗礁与成长之路",
];
