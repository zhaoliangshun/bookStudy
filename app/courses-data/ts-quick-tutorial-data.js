// =============================================================
// TypeScript 速查教程（ts-quick）章节数据聚合入口
// -------------------------------------------------------------
// 与现有深入教程 /ts（12 个 batch，从基础到泛型专题）不同，
// 本教程定位"简单实用、马上能用"：日常开发高频用法、避坑、模板代码。
//
// 全部 15 章集中在单个文件 ts-quick-chapters.js：
//   上手即用 : 注解、interface/type、联合可选、字面量、数组元组
//   日常高频 : 泛型、Utility Types、断言守卫、null 处理、enum 取舍
//   实战模板 : API 类型、事件回调、React 类型、第三方声明、tsconfig
//
// 用户代码会先被 TypeScript 编译器转译成 JS（/api/run-ts），
// 再在 vm 沙箱中执行，因此所有 demo 都支持 TS 语法。
// =============================================================

import { chapters } from "./ts-quick-chapters";

// 章节列表（按分组顺序排列）
export const tsQuickChapters = chapters;

// 侧边栏分组顺序
export const tsQuickChapterGroups = [
  "上手即用",
  "日常高频",
  "实战模板",
];
