// =============================================================
// pnpm 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 2 个独立文件：
//   pnpm-chapters-batch1.js : 基础与安装（intro, install, package-json,
//                                     scripts, config）
//   pnpm-chapters-batch2.js : 依赖管理与工作区（dependencies,
//                                     workspace, overrides, cache,
//                                     publish）
//
// 与 Node.js / Go 教程不同，pnpm 教程的 code 字段是 shell 脚本
// （bash 命令），前端通过 /api/run-shell 后端接口在 bash 沙箱里
// 执行，输出命令行结果。这样可以真实演示 pnpm 命令的输出格式
// 和行为（受限于沙箱环境，部分需要真实 pnpm 的命令会给出模拟
// 输出或用 echo 演示）。
// =============================================================

import { chapters as batch1 } from "./pnpm-chapters-batch1";
import { chapters as batch2 } from "./pnpm-chapters-batch2";

// 按分组顺序拼接所有章节
export const pnpmChapters = [
  ...batch1,
  ...batch2,
];

// 侧边栏分组顺序
export const pnpmChapterGroups = [
  "基础与安装",
  "依赖管理与工作区",
];
