// =============================================================
// Vite 实战教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 2 个独立文件，共 14 章：
//   vite-chapters-batch1.js : 快速上手（3 章）+ 配置基础（4 章）
//   vite-chapters-batch2.js : 资源与环境（3 章）+ 工程进阶（4 章）
//
// 每个章节对象的结构：
//   id      : 唯一标识（同时作为 URL hash）
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名（用于侧边栏分桶展示）
//   content : Markdown 格式的详细讲解（含可直接复制的实战配置）
//   code    : 可在 Node 中独立运行的演示脚本，点 ▶ 运行有控制台输出
//
// code 字段用 lang="js" 渲染，调用 /api/run 在线执行，直观理解概念。
// 完整的 vite.config.js / .env / 命令行等实战配置写在 content 的
// Markdown 代码块里，供读者复制到自己的项目使用。
// =============================================================

import { chapters as batch1 } from "./vite-chapters-batch1";
import { chapters as batch2 } from "./vite-chapters-batch2";

// 按分组顺序拼接所有章节（共 14 章）
export const viteChapters = [
  ...batch1,
  ...batch2,
];

// 侧边栏分组顺序
export const viteChapterGroups = [
  "快速上手",
  "配置基础",
  "资源与环境",
  "工程进阶",
];
