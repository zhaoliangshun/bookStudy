// =============================================================
// Vue 源码构建教程（vuesrc）章节数据聚合入口
// -------------------------------------------------------------
// 主题：从零开始一步步构建 Vue 核心源代码，最终完成一个 Mini Vue
// 面向：想深入理解 Vue 底层原理的开发者
// 共 25 章，7 个分组：
//   vuesrc-chapters-batch1.js : 开篇 + 响应式系统基础（5 章）
//   vuesrc-chapters-batch2.js : 响应式系统进阶（5 章）
//   vuesrc-chapters-batch3.js : 模板编译 + 虚拟 DOM（5 章）
//   vuesrc-chapters-batch4.js : Diff 算法 + 组件系统（5 章）
//   vuesrc-chapters-batch5.js : Composition API + 完整 Mini Vue（5 章）
//
// 每章包含 content（Markdown 讲解）和 code（可运行 demo）。
// =============================================================

import { chapters as batch1 } from "./vuesrc-chapters-batch1";
import { chapters as batch2 } from "./vuesrc-chapters-batch2";
import { chapters as batch3 } from "./vuesrc-chapters-batch3";
import { chapters as batch4 } from "./vuesrc-chapters-batch4";
import { chapters as batch5 } from "./vuesrc-chapters-batch5";

// 按分组顺序拼接所有章节
export const vuesrcChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 侧边栏分组顺序（7 组 25 章）
export const vuesrcChapterGroups = [
  "开篇：Vue 的核心本质",
  "第一部分 响应式系统",
  "第二部分 模板编译",
  "第三部分 虚拟 DOM",
  "第四部分 组件系统",
  "第五部分 Composition API",
  "第六部分 完整 Mini Vue",
];
