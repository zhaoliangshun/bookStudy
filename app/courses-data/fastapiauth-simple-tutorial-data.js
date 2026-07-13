// =============================================================
// FastAPI 认证授权简化版（fastapiauth-simple）章节数据聚合入口
// -------------------------------------------------------------
// 主题：只讲干货，简单易懂的 FastAPI 认证授权教程
// 共 12 章，2 个分组：
//   fastapiauth-simple-chapters-batch1.js : 认证基础（6 章）
//   fastapiauth-simple-chapters-batch2.js : 实战与企业级（6 章）
// =============================================================

import { chapters as batch1 } from "./fastapiauth-simple-chapters-batch1";
import { chapters as batch2 } from "./fastapiauth-simple-chapters-batch2";

// 按分组顺序拼接所有章节
export const fastapiauthSimpleChapters = [
  ...batch1,
  ...batch2,
];

// 侧边栏分组顺序（2 组 12 章）
export const fastapiauthSimpleChapterGroups = [
  "认证基础",
  "实战与企业级",
];
