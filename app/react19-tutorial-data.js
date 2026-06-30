// =============================================================
// React 19 新特性教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 3 个独立文件，共 15 章：
//
//   react19-chapters-batch1.js : Actions 与表单（5 章）
//     Actions 概念、useActionState、useFormStatus、
//     useOptimistic、form Actions 与 Server Actions
//
//   react19-chapters-batch2.js : 新 API 与改进（5 章）
//     use() API、ref 作为 prop、Document Metadata、
//     React Compiler、资源预加载 API
//
//   react19-chapters-batch3.js : 服务端与迁移（5 章）
//     Server Components、Server Actions、prerender、
//     JSX 变换与类型改进、React 19 迁移指南
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解（含「底层原理」「常见陷阱」「性能提示」）
//   code    : 可在 Node 沙箱（/api/run）运行的纯 JS 演示代码
//             （React 19 特性依赖浏览器 DOM 和 react 模块，
//              故用纯 JS 模拟演示底层原理）
// =============================================================

import { chapters as batch1 } from "./react19-chapters-batch1";
import { chapters as batch2 } from "./react19-chapters-batch2";
import { chapters as batch3 } from "./react19-chapters-batch3";

// 按分组顺序拼接所有章节（15 章）
export const react19Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
];

// 侧边栏分组顺序（3 组 15 章）
export const react19ChapterGroups = [
  "Actions 与表单",
  "新 API 与改进",
  "服务端与迁移",
];