// =============================================================
// 人际关系心理学教程（relations）章节数据聚合入口
// -------------------------------------------------------------
// 主题：人际关系心理学
// 面向：希望系统理解人际关系、改善社交质量的读者
// 共 20 章，4 个分组：
//   relations-chapters-batch1.js : 关系认知基础（5 章）
//   relations-chapters-batch2.js : 关系建立与沟通（5 章）
//   relations-chapters-batch3.js : 关系维护与困境（5 章）
//   relations-chapters-batch4.js : 关系修复与成长（5 章）
//
// 本教程为纯内容阅读型教程，无代码执行功能。
// =============================================================

import { chapters as batch1 } from "./relations-chapters-batch1";
import { chapters as batch2 } from "./relations-chapters-batch2";
import { chapters as batch3 } from "./relations-chapters-batch3";
import { chapters as batch4 } from "./relations-chapters-batch4";

// 按分组顺序拼接所有章节
export const relationsChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序（4 组 20 章）
export const relationsChapterGroups = [
  "关系认知基础",
  "关系建立与沟通",
  "关系维护与困境",
  "关系修复与成长",
];
