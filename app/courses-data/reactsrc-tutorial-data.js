// =============================================================
// React 源码构建教程（reactsrc）章节数据聚合入口
// -------------------------------------------------------------
// 主题：从零开始一步步构建 React 核心源代码，最终完成一个 Mini React
// 面向：想深入理解 React 底层原理的开发者
// 共 25 章，6 个分组：
//   reactsrc-chapters-batch1.js : 开篇 + JSX 与虚拟 DOM（5 章）
//   reactsrc-chapters-batch2.js : 渲染与调和（5 章）
//   reactsrc-chapters-batch3.js : Fiber 架构 + 组件系统（5 章）
//   reactsrc-chapters-batch4.js : 组件系统 + Hooks 系统（5 章）
//   reactsrc-chapters-batch5.js : 高级 Hooks + 完整 Mini React（5 章）
//
// 每章包含 content（Markdown 讲解）和 code（可运行 demo）。
// =============================================================

import { chapters as batch1 } from "./reactsrc-chapters-batch1";
import { chapters as batch2 } from "./reactsrc-chapters-batch2";
import { chapters as batch3 } from "./reactsrc-chapters-batch3";
import { chapters as batch4 } from "./reactsrc-chapters-batch4";
import { chapters as batch5 } from "./reactsrc-chapters-batch5";

// 按分组顺序拼接所有章节
export const reactsrcChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 侧边栏分组顺序（6 组 25 章）
export const reactsrcChapterGroups = [
  "开篇：React 的核心本质",
  "第一部分 JSX 与虚拟 DOM",
  "第二部分 渲染与调和",
  "第三部分 Fiber 架构",
  "第四部分 组件系统",
  "第五部分 Hooks 系统",
  "第六部分 完整 Mini React",
];
