// =============================================================
// GraphQL 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 4 个独立文件，共 16 章：
//   gql-chapters-batch1.js : 基础（intro, schema, query, mutation）
//   gql-chapters-batch2.js : 核心（resolvers, fragments, variables,
//                              validation）
//   gql-chapters-batch3.js : 进阶（relations, subscription, pagination,
//                              file-upload）
//   gql-chapters-batch4.js : 实战（fullstack, auth, client,
//                              best-practices）
//
// 与 JS/TS 教程不同，code 字段是 GraphQL 三段式代码
// （Schema + Resolvers + Query），前端通过 /api/run-gql 接口
// 构建 schema 并执行查询，返回 data/errors JSON。
// =============================================================

import { chapters as batch1 } from "./gql-chapters-batch1";
import { chapters as batch2 } from "./gql-chapters-batch2";
import { chapters as batch3 } from "./gql-chapters-batch3";
import { chapters as batch4 } from "./gql-chapters-batch4";

// 按分组顺序拼接所有章节
export const gqlChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序
export const gqlChapterGroups = [
  "基础",
  "核心",
  "进阶",
  "实战",
];