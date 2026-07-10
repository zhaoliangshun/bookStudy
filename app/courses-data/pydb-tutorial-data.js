// =============================================================
// Python 数据库编程教程（pydb）章节数据聚合入口
// -------------------------------------------------------------
// 系统讲解 Python 数据库编程，涵盖 SQLite、MySQL、PostgreSQL、Redis、MongoDB。
// 教程按章节分组拆分到独立 batch 文件：
//
//   pydb-chapters-batch1.js : 数据库基础（intro, api, compare）
//                              + SQLite（intro, connect, crud,
//                                transaction, practice）—— 共 8 章
//   pydb-chapters-batch2.js : MySQL（intro, connect, crud,
//                              practice）
//                              + PostgreSQL（intro, connect,
//                              features）—— 共 7 章
//   pydb-chapters-batch3.js : Redis（intro, connect, datatypes）
//                              + MongoDB（intro, crud）—— 共 5 章
//
// 共 20 章，6 个分组。
//
// 运行环境说明：
//   - SQLite 使用标准库 sqlite3，无需安装服务器，代码完全可运行
//   - MySQL/PostgreSQL/Redis/MongoDB 需要对应数据库服务器运行
//     代码在无服务器时会优雅降级，演示 API 用法并打印说明
//   - 驱动包：pymysql、psycopg2-binary、redis、pymongo 已安装
// =============================================================

import { chapters as batch1 } from "./pydb-chapters-batch1";
import { chapters as batch2 } from "./pydb-chapters-batch2";
import { chapters as batch3 } from "./pydb-chapters-batch3";

// 按分组顺序拼接所有章节
export const pydbChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
];

// 侧边栏分组顺序（6 组 20 章）
export const pydbChapterGroups = [
  "数据库基础",
  "SQLite",
  "MySQL",
  "PostgreSQL",
  "Redis",
  "MongoDB",
];
