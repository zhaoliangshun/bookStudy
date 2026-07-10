// =============================================================
// 沟通交流指南 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 20 章，覆盖 4 大主题方向。
// 纯内容阅读型教程，无代码执行功能。
//
// 4 个 batch 文件，每组 5 章：
//   comm-chapters-batch1.js : 沟通基础 1-5
//   comm-chapters-batch2.js : 日常沟通 6-10
//   comm-chapters-batch3.js : 进阶技巧 11-15
//   comm-chapters-batch4.js : 场景实战 16-20
// =============================================================

import { chapters as batch1 } from "./comm-chapters-batch1";
import { chapters as batch2 } from "./comm-chapters-batch2";
import { chapters as batch3 } from "./comm-chapters-batch3";
import { chapters as batch4 } from "./comm-chapters-batch4";

export const commChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

export const commChapterGroups = [
  "沟通基础",
  "日常沟通",
  "进阶技巧",
  "场景实战",
];