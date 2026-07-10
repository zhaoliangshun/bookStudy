// =============================================================
// Sass 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 4 个独立文件，共 16 章：
//   sass-chapters-batch1.js : 基础（intro, variables, nesting, partials）
//   sass-chapters-batch2.js : 核心功能（mixins, functions, control, extend）
//   sass-chapters-batch3.js : 进阶技巧（data-structures, color,
//                              responsive, architecture）
//   sass-chapters-batch4.js : 实战案例（button-system, card-layout,
//                              form-styling, design-system）
//
// 与 Tailwind 教程类似，code 字段是 SCSS 代码，前端调用
// /api/run-sass 编译成 CSS，再配合一段通用 demo HTML 放进 iframe
// 实时预览效果。
// =============================================================

import { chapters as batch1 } from "./sass-chapters-batch1";
import { chapters as batch2 } from "./sass-chapters-batch2";
import { chapters as batch3 } from "./sass-chapters-batch3";
import { chapters as batch4 } from "./sass-chapters-batch4";

// 按分组顺序拼接所有章节
export const sassChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序
export const sassChapterGroups = [
  "基础",
  "核心功能",
  "进阶技巧",
  "实战案例",
];
