// =============================================================
// Python 工程化实战教程 —— 章节数据聚合入口
// -------------------------------------------------------------
// 从日志、配置、命令行,到测试、格式化,
// 系统讲解 Python 工程化的核心工具与最佳实践。
//
// 覆盖:logging 日志 → 配置文件(yaml/toml/ini)
//       → 命令行(argparse/click/typer)
//       → 测试(unittest/pytest)→ 格式化(black/ruff/isort)
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 重点讲清「为什么」和「怎么用」,工具会变,工程化思维长存。
// =============================================================

import { chapters as batch1 } from "./pyeng-chapters-batch1";
import { chapters as batch2 } from "./pyeng-chapters-batch2";
import { chapters as batch3 } from "./pyeng-chapters-batch3";
import { chapters as batch4 } from "./pyeng-chapters-batch4";
import { chapters as batch5 } from "./pyeng-chapters-batch5";

export const pyengChapters = [
  ...batch1, ...batch2, ...batch3, ...batch4, ...batch5,
];

export const pyengChapterGroups = [
  "日志 logging",
  "配置文件",
  "命令行工具",
  "测试",
  "格式化与工程化",
];
