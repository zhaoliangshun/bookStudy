// =============================================================
// TSX 童话镇 - 数据汇总
// -------------------------------------------------------------
// 一个用故事 + 类比讲 TSX 的教程。
// 每个 hooks 都是一位小镇居民，每种类型都是一份魔法契约。
// =============================================================

import { chapters as batch1 } from "./tsx-story-chapters-batch1";
import { chapters as batch2 } from "./tsx-story-chapters-batch2";
import { chapters as batch3 } from "./tsx-story-chapters-batch3";
import { chapters as batch4 } from "./tsx-story-chapters-batch4";

export const tsxStoryChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const tsxStoryChapterGroups = [
  "序章：初入小镇",
  "居民篇：六位老朋友",
  "契约篇：魔法的语言",
  "大冒险：建造城堡",
];
