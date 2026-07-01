// =============================================================
// AI Agent 应用开发实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 64 章 16 分组,从零开始系统讲解 AI Agent 应用开发。
// 覆盖:LLM 原理 → Prompt 工程 → API 调用 → Function Calling
//       → RAG 检索增强 → Agent 架构 → LangChain/LlamaIndex/LangGraph
//       → 多 Agent 协作 → 实战项目 → 部署优化
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 因为 AI 代码大多需要 API Key,无法在 playground 直接运行。
// 重点讲清「为什么」和「怎么想」,工具会变,原理长存。
// =============================================================

import { chapters as batch1 } from "./ai-agent-chapters-batch1";
import { chapters as batch2 } from "./ai-agent-chapters-batch2";
import { chapters as batch3 } from "./ai-agent-chapters-batch3";
import { chapters as batch4 } from "./ai-agent-chapters-batch4";
import { chapters as batch5 } from "./ai-agent-chapters-batch5";
import { chapters as batch6 } from "./ai-agent-chapters-batch6";
import { chapters as batch7 } from "./ai-agent-chapters-batch7";
import { chapters as batch8 } from "./ai-agent-chapters-batch8";
import { chapters as batch9 } from "./ai-agent-chapters-batch9";
import { chapters as batch10 } from "./ai-agent-chapters-batch10";
import { chapters as batch11 } from "./ai-agent-chapters-batch11";
import { chapters as batch12 } from "./ai-agent-chapters-batch12";
import { chapters as batch13 } from "./ai-agent-chapters-batch13";
import { chapters as batch14 } from "./ai-agent-chapters-batch14";
import { chapters as batch15 } from "./ai-agent-chapters-batch15";
import { chapters as batch16 } from "./ai-agent-chapters-batch16";

export const aiAgentChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4,
  ...batch5, ...batch6, ...batch7, ...batch8,
  ...batch9, ...batch10, ...batch11, ...batch12,
  ...batch13, ...batch14, ...batch15, ...batch16,
];

export const aiAgentChapterGroups = [
  "AI 基础概念",
  "Prompt 工程",
  "OpenAI API",
  "对话管理",
  "Anthropic Claude",
  "Function Calling",
  "本地开源模型",
  "RAG 基础",
  "RAG 实战",
  "Agent 基础",
  "LangChain 框架",
  "LlamaIndex",
  "LangGraph 工作流",
  "多 Agent 协作",
  "实战项目",
  "部署与优化",
];
