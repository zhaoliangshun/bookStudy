// =============================================================
// Python 基础路径教程（pybasic）章节数据聚合入口
// -------------------------------------------------------------
// 对应"第一阶段：Python 基础（★★★★★ 必须）"学习路径，
// 是所有人的起点。教程按章节分组拆分到独立 batch 文件：
//
//   pybasic-chapters-batch1.js : 环境搭建（interpreter, pip, venv,
//                                        uv, pyenv, conda-ide）
//
// 后续阶段（1.2 语法、1.3 数据类型 等）会继续以新的 batch 文件
// 追加到本教程中。
//
// 与 Node.js / TypeScript 教程不同，Python 教程的 code 字段是
// Python 源代码，前端通过 /api/run-py 接口调用系统 python3 子进程
// 执行，捕获 stdout / stderr 返回。
// =============================================================

import { chapters as batch1 } from "./pybasic-chapters-batch1";

// 按分组顺序拼接所有章节
export const pybasicChapters = [
  ...batch1,
];

// 侧边栏分组顺序
export const pybasicChapterGroups = [
  "环境搭建",
];
