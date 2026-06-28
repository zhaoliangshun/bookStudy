// =============================================================
// 毒舌词典 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 20 章,覆盖 5 大部分。
// 纯内容阅读型毒舌语录集,无代码执行功能。
// 本书特点:语句简短,每条1-3句,共约3000条毒辣金句。
// 风格:比怼人语录更直接、更辛辣、更"损",但不带脏字。
//
// 5 个 batch 文件:
//   curse-chapters-batch1.js : 第一部分 毒舌基础篇(第1-4章)
//   curse-chapters-batch2.js : 第二部分 毒舌外貌篇(第5-8章)
//   curse-chapters-batch3.js : 第三部分 毒舌能力篇(第9-12章)
//   curse-chapters-batch4.js : 第四部分 毒舌性格篇(第13-16章)
//   curse-chapters-batch5.js : 第五部分 毒舌场景篇(第17-20章)
// =============================================================

import { chapters as curseBatch1 } from "./curse-chapters-batch1";
import { chapters as curseBatch2 } from "./curse-chapters-batch2";
import { chapters as curseBatch3 } from "./curse-chapters-batch3";
import { chapters as curseBatch4 } from "./curse-chapters-batch4";
import { chapters as curseBatch5 } from "./curse-chapters-batch5";

export const curseChapters = [
  ...curseBatch1,
  ...curseBatch2,
  ...curseBatch3,
  ...curseBatch4,
  ...curseBatch5,
];

export const curseChapterGroups = [
  "第一部分 毒舌基础篇",
  "第二部分 毒舌外貌篇",
  "第三部分 毒舌能力篇",
  "第四部分 毒舌性格篇",
  "第五部分 毒舌场景篇",
];
