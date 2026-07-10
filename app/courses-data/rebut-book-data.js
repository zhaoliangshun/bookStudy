// =============================================================
// 《反驳的艺术》- 章节数据聚合入口
// -------------------------------------------------------------
// 共 36 章（前言 + 34 章正文 + 结语），覆盖 7 大部分。
// 纯内容阅读型书籍，无代码执行功能。
//
// 本书定位：
//   偏逻辑拆解 + 快速反应 + 掷地有声的回击技术。
//   与《怼人艺术》(话术)、《反怼心理学》(心理防御)、《回怼护盾》(防御)
//   形成互补——本书专注于"如何在对话中实时识别漏洞、看穿意图、
//   快速组织反驳、用最简洁有力的话掷地有声地回击"。
//
// 7 个 batch 文件：
//   rebut-chapters-batch1.js : 前言 + 第一部分 倾听的艺术（第1-4章）
//   rebut-chapters-batch2.js : 第二部分 谬误图鉴（第5-9章）
//   rebut-chapters-batch3.js : 第三部分 洞察真实目的（第10-14章）
//   rebut-chapters-batch4.js : 第四部分 快速反应框架（第15-20章）
//   rebut-chapters-batch5.js : 第五部分 掷地有声（第21-23章）
//   rebut-chapters-batch6.js : 第六部分 实战案例库（第24-29章）
//   rebut-chapters-batch7.js : 第七部分 心理博弈与进阶修炼（第30-34章）+ 结语
// =============================================================

import { chapters as batch1 } from "./rebut-chapters-batch1";
import { chapters as batch2 } from "./rebut-chapters-batch2";
import { chapters as batch3 } from "./rebut-chapters-batch3";
import { chapters as batch4 } from "./rebut-chapters-batch4";
import { chapters as batch5 } from "./rebut-chapters-batch5";
import { chapters as batch6 } from "./rebut-chapters-batch6";
import { chapters as batch7 } from "./rebut-chapters-batch7";

// 合并所有 batch 的章节，保持顺序
export const rebutChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
];

// 章节分组（按书籍结构顺序排列，与 Sidebar 左侧目录一致）
export const rebutChapterGroups = [
  "开篇",
  "第一部分 倾听的艺术——在对话中捕捉漏洞",
  "第二部分 谬误图鉴——二十种逻辑漏洞的识别与拆解",
  "第三部分 洞察真实目的——看穿话语背后的动机",
  "第四部分 快速反应——建立辩论的思维框架",
  "第五部分 掷地有声——让回击具有杀伤力",
  "第六部分 实战案例库——六个场景的完整拆解",
  "第七部分 心理博弈与进阶修炼",
  "结尾",
];
