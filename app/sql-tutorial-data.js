// =============================================================
// 数据库开发教程 —— 章节聚合入口
// -------------------------------------------------------------
// 将 6 个批次文件合并为完整章节列表，并定义侧边栏分组顺序。
// 共 32 章，分为 6 组：
//   SQL 基础 / 查询进阶 / 高级查询 / 索引与性能 / 事务与设计 / 现代数据库
// =============================================================

import { chapters as batch1 } from "./sql-chapters-batch1";
import { chapters as batch2 } from "./sql-chapters-batch2";
import { chapters as batch3 } from "./sql-chapters-batch3";
import { chapters as batch4 } from "./sql-chapters-batch4";
import { chapters as batch5 } from "./sql-chapters-batch5";
import { chapters as batch6 } from "./sql-chapters-batch6";

// 合并所有章节（共 32 章）
export const sqlChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
];

// 侧边栏分组顺序
export const sqlChapterGroups = [
  "SQL 基础",
  "查询进阶",
  "高级查询",
  "索引与性能",
  "事务与设计",
  "现代数据库",
];
