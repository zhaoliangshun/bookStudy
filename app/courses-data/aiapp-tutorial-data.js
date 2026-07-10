// =============================================================
// AI 应用编程教程章节数据（聚合入口）
// -------------------------------------------------------------
// 全新教程，与既有 /ai（AI 编程方法）和 /ai-agent（AI Agent 开发）教程互补。
// 共 50 章，按 10 个分组拆分到 10 个独立文件，每文件 5 章：
//
//   aiapp-chapters-batch1.js  : AI 编程入门（5 章）
//   aiapp-chapters-batch2.js  : 主流大模型对比（5 章）
//   aiapp-chapters-batch3.js  : AI 编程工具全景（5 章）
//   aiapp-chapters-batch4.js  : Codex 深度使用（5 章）
//   aiapp-chapters-batch5.js  : Claude 深度使用（5 章）
//   aiapp-chapters-batch6.js  : 提示词工程实战（5 章）
//   aiapp-chapters-batch7.js  : AI 编程实用技巧（5 章）
//   aiapp-chapters-batch8.js  : AI 编程工作流（5 章）
//   aiapp-chapters-batch9.js  : 陷阱与最佳实践（5 章）
//   aiapp-chapters-batch10.js : 进阶与未来（5 章）
//
// 每个章节对象结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细注释的示例代码（Node.js 沙箱）
// =============================================================

import { chapters as batch1 } from "./aiapp-chapters-batch1";
import { chapters as batch2 } from "./aiapp-chapters-batch2";
import { chapters as batch3 } from "./aiapp-chapters-batch3";
import { chapters as batch4 } from "./aiapp-chapters-batch4";
import { chapters as batch5 } from "./aiapp-chapters-batch5";
import { chapters as batch6 } from "./aiapp-chapters-batch6";
import { chapters as batch7 } from "./aiapp-chapters-batch7";
import { chapters as batch8 } from "./aiapp-chapters-batch8";
import { chapters as batch9 } from "./aiapp-chapters-batch9";
import { chapters as batch10 } from "./aiapp-chapters-batch10";

// 按分组顺序拼接所有章节（50 章）
export const aiappChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
];

// 侧边栏分组顺序（10 组 50 章）
export const aiappChapterGroups = [
  "AI编程入门",
  "主流大模型对比",
  "AI编程工具全景",
  "Codex深度使用",
  "Claude深度使用",
  "提示词工程实战",
  "AI编程实用技巧",
  "AI编程工作流",
  "陷阱与最佳实践",
  "进阶与未来",
];
