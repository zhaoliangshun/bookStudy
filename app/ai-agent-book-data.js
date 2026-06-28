// =============================================================
// AI Agent开发实战 - 章节数据聚合入口
// -------------------------------------------------------------
// 共 28 章(含前言 + 结语),覆盖 7 大部分。
// 纯内容阅读型技术书籍,无代码执行功能。
// 本书定位:系统讲解AI Agent开发,从基础概念到生产部署。
//
// 6 个 batch 文件:
//   ai-agent-chapters-batch1.js : 前言 + 第一部分(第1-4章)
//   ai-agent-chapters-batch2.js : 第二部分(第5-8章)
//   ai-agent-chapters-batch3.js : 第三部分(第9-12章)
//   ai-agent-chapters-batch4.js : 第四部分(第13-16章)
//   ai-agent-chapters-batch5.js : 第五部分(第17-20章)
//   ai-agent-chapters-batch6.js : 第六部分+第七部分+结语(第21-26章+结语)
// =============================================================

import { chapters as batch1 } from "./ai-agent-chapters-batch1";
import { chapters as batch2 } from "./ai-agent-chapters-batch2";
import { chapters as batch3 } from "./ai-agent-chapters-batch3";
import { chapters as batch4 } from "./ai-agent-chapters-batch4";
import { chapters as batch5 } from "./ai-agent-chapters-batch5";
import { chapters as batch6 } from "./ai-agent-chapters-batch6";

export const aiAgentChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

export const aiAgentChapterGroups = [
  "开篇",
  "第一部分 AI Agent 基础入门",
  "第二部分 Agent开发技术栈",
  "第三部分 主流Agent框架",
  "第四部分 Agent核心能力构建",
  "第五部分 Agent实战开发",
  "第六部分 进阶与优化",
  "第七部分 前沿与展望",
  "结尾",
];
