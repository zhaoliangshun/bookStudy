// =============================================================
// 《40岁前端程序员的出路》- 章节数据聚合入口
// -------------------------------------------------------------
// 共 33 项（前言 + 31 章正文 + 结语），覆盖 7 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 本书定位：
//   专门写给 40 岁左右、做了多年前端开发、正在寻找出路的中年程序员。
//   与"被裁之后怎么办"的应急手册不同——本书直奔主题"出路在哪"：
//   先讲清 40 岁前端的真实困局，再系统梳理五条出路（前端深耕、转岗、
//   独立开发、转行跨界、创业），最后落到个人品牌、财务、健康等底层逻辑。
//   不是鸡汤，是一张能照着走的中年转型路线图。
//
// 7 个 batch 文件：
//   career40-chapters-batch1.js : 前言 + 第一部分 困局——40岁的真实处境（第1-5章）
//   career40-chapters-batch2.js : 第二部分 出路一：在前端继续深耕（第6-10章）
//   career40-chapters-batch3.js : 第三部分 出路二：转岗与内部突破（第11-14章）
//   career40-chapters-batch4.js : 第四部分 出路三：独立开发者与副业（第15-19章）
//   career40-chapters-batch5.js : 第五部分 出路四：转行与跨界（第20-23章）
//   career40-chapters-batch6.js : 第六部分 出路五：创业与做生意（第24-27章）
//   career40-chapters-batch7.js : 第七部分 出路的底层逻辑（第28-31章）+ 结语
// =============================================================

import { chapters as batch1 } from "./career40-chapters-batch1";
import { chapters as batch2 } from "./career40-chapters-batch2";
import { chapters as batch3 } from "./career40-chapters-batch3";
import { chapters as batch4 } from "./career40-chapters-batch4";
import { chapters as batch5 } from "./career40-chapters-batch5";
import { chapters as batch6 } from "./career40-chapters-batch6";
import { chapters as batch7 } from "./career40-chapters-batch7";

// 合并所有 batch 的章节，保持顺序
export const career40Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
];

// 章节分组（按书籍结构顺序排列，与 Sidebar 左侧目录一致）
export const career40ChapterGroups = [
  "开篇",
  "第一部分 困局——40岁前端的真实处境",
  "第二部分 出路一：在前端继续深耕",
  "第三部分 出路二：转岗与内部突破",
  "第四部分 出路三：独立开发者与副业",
  "第五部分 出路四：转行与跨界",
  "第六部分 出路五：创业与做生意",
  "第七部分 出路的底层逻辑",
  "结尾",
];
