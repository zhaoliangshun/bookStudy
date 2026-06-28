// =============================================================
// 脾胃调养全书 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 26 章(含前言 + 24章 + 结语),覆盖 6 大部分。
// 纯内容阅读型书籍,无代码执行功能。
//
// 5 个 batch 文件:
//   stomach-chapters-batch1.js : 前言 + 第一部分(第1-4章)
//   stomach-chapters-batch2.js : 第二部分(第5-7章) + 第三部分(第8-9章)
//   stomach-chapters-batch3.js : 第三部分(第10-13章) + 第四部分(第14章)
//   stomach-chapters-batch4.js : 第四部分(第15-17章) + 第五部分(第18-19章)
//   stomach-chapters-batch5.js : 第五部分(第20-22章) + 第六部分(第23-24章) + 结语
// =============================================================

import { chapters as batch1 } from "./stomach-chapters-batch1";
import { chapters as batch2 } from "./stomach-chapters-batch2";
import { chapters as batch3 } from "./stomach-chapters-batch3";
import { chapters as batch4 } from "./stomach-chapters-batch4";
import { chapters as batch5 } from "./stomach-chapters-batch5";

export const stomachChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const stomachChapterGroups = [
  "开篇",
  "第一部分 认识脾胃——理解消化系统",
  "第二部分 调养原则——总纲",
  "第三部分 饮食调养——核心方法",
  "第四部分 起居调养——生活方式",
  "第五部分 对症调养——具体问题",
  "第六部分 季节与人群",
  "结尾",
];
