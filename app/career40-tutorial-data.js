// =============================================================
// 《40岁前端的下半场》- 章节数据聚合入口
// -------------------------------------------------------------
// 共 33 项（前言 + 31 章正文 + 结语），覆盖 7 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 本书定位：
//   专门写给 40 岁左右、做了多年前端开发、突然或即将被裁的中年男人。
//   与现有《程序员职业出路》(通用规划)不同——本书聚焦"被裁之后怎么办"：
//   从情绪、财务、法律，到技能盘点、出路选择、求职实战、心态重建，
//   一本可以放在床头、被裁当晚就开始翻的实操指南。
//
// 7 个 batch 文件：
//   career40-chapters-batch1.js : 前言 + 第一部分 被裁那一刻（第1-5章）
//   career40-chapters-batch2.js : 第二部分 重新认识 40 岁的自己（第6-10章）
//   career40-chapters-batch3.js : 第三部分 出路一：继续在前端深耕（第11-14章）
//   career40-chapters-batch4.js : 第四部分 出路二：转岗与跨界（第15-19章）
//   career40-chapters-batch5.js : 第五部分 出路三：独立开发者与副业（第20-23章）
//   career40-chapters-batch6.js : 第六部分 求职实战（第24-27章）
//   career40-chapters-batch7.js : 第七部分 心态与长期规划（第28-31章）+ 结语
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
  "第一部分 被裁那一刻——理性面对现实",
  "第二部分 重新认识 40 岁的自己",
  "第三部分 出路一：继续在前端深耕",
  "第四部分 出路二：转岗与跨界",
  "第五部分 出路三：独立开发者与副业",
  "第六部分 求职实战",
  "第七部分 心态与长期规划",
  "结尾",
];
