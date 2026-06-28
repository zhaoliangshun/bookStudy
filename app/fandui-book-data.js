// =============================================================
// 反怼心理学 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 21 章（前言 + 20 章正文 + 结语），覆盖 5 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 本书定位：
//   《怼人艺术》偏主动话术，本书偏心理防御机制与心理建设。
//   从心理学视角分析"为什么会被伤害"和"如何从心理层面免疫攻击"。
//
// 5 个 batch 文件：
//   fandui-chapters-batch1.js : 前言 + 第一部分（第1-5章）
//   fandui-chapters-batch2.js : 第二部分（第6-9章）
//   fandui-chapters-batch3.js : 第三部分（第10-13章）
//   fandui-chapters-batch4.js : 第四部分（第14-17章）
//   fandui-chapters-batch5.js : 第五部分（第18-20章）+ 结语
// =============================================================

import { chapters as batch1 } from "./fandui-chapters-batch1";
import { chapters as batch2 } from "./fandui-chapters-batch2";
import { chapters as batch3 } from "./fandui-chapters-batch3";
import { chapters as batch4 } from "./fandui-chapters-batch4";
import { chapters as batch5 } from "./fandui-chapters-batch5";

export const fanduiChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const fanduiChapterGroups = [
  "开篇",
  "第一部分 识别恶意——言语攻击的心理学",
  "第二部分 心理防御——构建你的内在护盾",
  "第三部分 反击策略——心理学驱动的回应技术",
  "第四部分 场景实战——各场合的反怼心法",
  "第五部分 长期修炼——成为不可摧毁的人",
  "结尾",
];
