// =============================================================
// 怼人艺术 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 22 章(含前言 + 结语),覆盖 6 大部分。
// 纯内容阅读型书籍,无代码执行功能。
//
// 5 个 batch 文件:
//   dui-chapters-batch1.js : 前言 + 第一部分(第1-4章)
//   dui-chapters-batch2.js : 第二部分(第5-7章)
//   dui-chapters-batch3.js : 第二部分(第8-10章)
//   dui-chapters-batch4.js : 第三部分(第11-16章)
//   dui-chapters-batch5.js : 第四部分(第17-20章)+ 结语
// =============================================================

import { chapters as batch1 } from "./dui-chapters-batch1";
import { chapters as batch2 } from "./dui-chapters-batch2";
import { chapters as batch3 } from "./dui-chapters-batch3";
import { chapters as batch4 } from "./dui-chapters-batch4";
import { chapters as batch5 } from "./dui-chapters-batch5";

export const duiChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const duiChapterGroups = [
  "开篇",
  "第一部分 怼人的基础——心态与原则",
  "第二部分 怼人技法大全",
  "第三部分 场景实战——各种场合如何回怼",
  "第四部分 高阶怼人——心理战与语言艺术",
  "结尾",
];
