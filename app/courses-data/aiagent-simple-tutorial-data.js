// =============================================================
// AI 智能体开发入门教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 教程定位：入门级，从最简单的概念讲起，每章都有可运行 demo
// 共 24 章 7 组，demo 用 mock 数据模拟 LLM，无需 API Key
//
// 文件结构：
//   aiagent-simple-chapters-batch1.js : 智能体入门基础（4 章）
//   aiagent-simple-chapters-batch2.js : 构建第一个智能体（4 章）
//   aiagent-simple-chapters-batch3.js : Function Calling 实战（4 章）
//   aiagent-simple-chapters-batch4.js : RAG 检索增强（3 章）
//   aiagent-simple-chapters-batch5.js : Agent 编排与协作（3 章）
//   aiagent-simple-chapters-batch6.js : 实战项目（3 章）
//   aiagent-simple-chapters-batch7.js : 进阶与最佳实践（3 章）
//
// 每个章节对象结构：
//   id      : 唯一标识（前缀 as- = aiagent-simple）
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（含类比、原理、表格）
//   code    : 可运行、带详细中文注释的 Python demo
// =============================================================

import { chapters as batch1 } from "./aiagent-simple-chapters-batch1";
import { chapters as batch2 } from "./aiagent-simple-chapters-batch2";
import { chapters as batch3 } from "./aiagent-simple-chapters-batch3";
import { chapters as batch4 } from "./aiagent-simple-chapters-batch4";
import { chapters as batch5 } from "./aiagent-simple-chapters-batch5";
import { chapters as batch6 } from "./aiagent-simple-chapters-batch6";
import { chapters as batch7 } from "./aiagent-simple-chapters-batch7";

// 按分组顺序拼接所有章节（24 章）
export const aiagentSimpleChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
];

// 侧边栏分组顺序（7 组 24 章）
export const aiagentSimpleChapterGroups = [
  "智能体入门基础",
  "构建第一个智能体",
  "Function Calling 实战",
  "RAG 检索增强",
  "Agent 编排与协作",
  "实战项目",
  "进阶与最佳实践",
];
