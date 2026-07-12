// =============================================================
// 云淡风轻：心无所住的智慧 —— 章节数据聚合入口
// -------------------------------------------------------------
// 60 章 6 分组，从心法到智照的完整修心指南。
// 主题：无所谓/心态稳定/不焦虑/不在意/活好自己
//
// 路由：/serenity
// =============================================================

import { chapters as batch1 } from "./serenity-batch1";
import { chapters as batch2 } from "./serenity-batch2";
import { chapters as batch3 } from "./serenity-batch3";
import { chapters as batch4 } from "./serenity-batch4";
import { chapters as batch5 } from "./serenity-batch5";
import { chapters as batch6 } from "./serenity-batch6";

export const serenityChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5, ...batch6,
];

export const serenityChapterGroups = [
  "心法篇",
  "解脱篇",
  "修养篇",
  "豁达篇",
  "独立篇",
  "智照篇",
];
