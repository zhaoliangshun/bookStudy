// =============================================================
// Python subprocess 教程（pysubprocess）章节数据聚合入口
// -------------------------------------------------------------
// 聚焦 Python 标准库 subprocess 模块，言简意赅、Demo 丰富。
// 章节按分组拆分到独立 batch 文件：
//
//   pysubprocess-chapters-batch1.js : 基础篇（intro / run / capture /
//                                      input / exception / shell）
//   pysubprocess-chapters-batch2.js : 进阶篇（popen / pipe / env-cwd /
//                                      realtime / concurrent / recipes）
//
// 代码运行环境约束：
//   - 用 python3 直接运行，5 秒超时
//   - 仅使用 Python 标准库
//   - 通过 print 输出结果
// =============================================================

import { chapters as batch1 } from "./pysubprocess-chapters-batch1";
import { chapters as batch2 } from "./pysubprocess-chapters-batch2";

// 按分组顺序拼接所有章节
export const pysubprocessChapters = [
  ...batch1,
  ...batch2,
];

// 侧边栏分组顺序
export const pysubprocessChapterGroups = [
  "基础篇",
  "进阶篇",
];
