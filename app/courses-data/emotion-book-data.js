// =============================================================
// 《无所谓》—— 情绪控制书籍 · 章节数据聚合入口
// -------------------------------------------------------------
// 28 章 7 分组，从认知到实践，系统讲解情绪控制与心态稳定。
// 覆盖：认知情绪 → 放下过去 → 不焦虑未来 → 不在意他人
//       → 看淡世界 → 保持乐观 → 终极心境
//
// 主题：对任何事情的发生都能做到无所谓，心态稳定。
//       过去的事已经过去了，未来的事还在未来。
//       不在意别人的看法，活好自己就行了。
// =============================================================

import { chapters as batch1 } from "./emotion-batch1";
import { chapters as batch2 } from "./emotion-batch2";
import { chapters as batch3 } from "./emotion-batch3";
import { chapters as batch4 } from "./emotion-batch4";
import { chapters as batch5 } from "./emotion-batch5";
import { chapters as batch6 } from "./emotion-batch6";
import { chapters as batch7 } from "./emotion-batch7";

export const emotionChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7,
];

export const emotionChapterGroups = [
  "认知篇 · 看清情绪的本质",
  "过去篇 · 过去的事已过去",
  "未来篇 · 未来还在未来",
  "他人篇 · 不在意别人看法",
  "世界篇 · 看淡世间一切",
  "实践篇 · 保持乐观心态",
  "心境篇 · 终极心态",
];
