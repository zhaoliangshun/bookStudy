// =============================================================
// 《委屈的解剖学》- 章节数据聚合入口
// -------------------------------------------------------------
// 共 33 项（前言 + 31 章正文 + 结语），覆盖 6 大部分。
// 纯内容阅读型心理学治疗书籍，无代码执行功能。
//
// 本书定位：
//   当你在冲突中被人砸东西、破口大骂、人格侮辱，你选择了沉默，
//   但事后心里久久不能放下，反复回想，觉得自己输了、尊严碎了、
//   憋出病来——这本书就是为你写的。心理学治疗导向，注重实操。
//
// 7 个 batch 文件：
//   hurt-chapters-batch1.js : 前言 + 第一部分 创伤的解剖（第1-5章）
//   hurt-chapters-batch2.js : 第二部分 为什么放不下（第6-10章）
//   hurt-chapters-batch3.js : 第三部分 看破（第11-15章）
//   hurt-chapters-batch4.js : 第四部分 疗愈（第16-21章）
//   hurt-chapters-batch5.js : 第五部分 重建（第22-26章）
//   hurt-chapters-batch6.js : 第六部分 未来（第27-31章）
//   hurt-chapters-batch7.js : 结语
// =============================================================

import { chapters as batch1 } from "./hurt-chapters-batch1";
import { chapters as batch2 } from "./hurt-chapters-batch2";
import { chapters as batch3 } from "./hurt-chapters-batch3";
import { chapters as batch4 } from "./hurt-chapters-batch4";
import { chapters as batch5 } from "./hurt-chapters-batch5";
import { chapters as batch6 } from "./hurt-chapters-batch6";
import { chapters as batch7 } from "./hurt-chapters-batch7";

// 合并所有 batch 的章节，保持顺序
export const hurtChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
];

// 章节分组（按书籍结构顺序排列，与 Sidebar 左侧目录一致）
export const hurtChapterGroups = [
  "开篇",
  "第一部分 创伤的解剖——理解你身上发生了什么",
  "第二部分 为什么放不下——心理根源深挖",
  "第三部分 看破——重新认知这件事",
  "第四部分 疗愈——治愈受伤的小心灵",
  "第五部分 重建——找回你的尊严与力量",
  "第六部分 未来——再遇到此类事情怎么办",
  "结尾",
];