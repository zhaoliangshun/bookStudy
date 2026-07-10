// =============================================================
// TypeScript 泛型专门教程章节数据（聚合入口）
// -------------------------------------------------------------
// 本书专攻 TypeScript 泛型，从最简单到最复杂，层层递进：
//
//   batch1 : 泛型基础篇（5 章）—— 为什么需要泛型 / 泛型函数 /
//            泛型接口 / 泛型类 / 泛型类型别名
//   batch2 : 泛型进阶篇（5 章）—— 泛型约束 extends / 多类型参数 /
//            默认类型参数 / 泛型推断 / keyof 操作符
//   batch3 : 泛型高级篇（5 章）—— 条件类型 / infer 关键字 /
//            映射类型 / 模板字面量类型 / 类型工具内置实现
//   batch4 : 泛型实战与类型体操篇（5 章）—— 常用模式 / 高阶组件 /
//            状态机类型 / 类型体操经典题 / 综合实战
//
// 每个章节对象的结构：
//   id      : 唯一标识
//   title   : 章节标题
//   icon    : 展示用 emoji
//   group   : 分组名
//   content : Markdown 格式的详细讲解
//   code    : 可运行、带详细注释的示例代码
// =============================================================

import { chapters as batch1 } from "./tsgen-chapters-batch1";
import { chapters as batch2 } from "./tsgen-chapters-batch2";
import { chapters as batch3 } from "./tsgen-chapters-batch3";
import { chapters as batch4 } from "./tsgen-chapters-batch4";

// 按分组顺序拼接所有章节（20 章）
export const tsgenChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
];

// 侧边栏分组顺序（4 组 20 章）
export const tsgenChapterGroups = [
  "泛型基础",
  "泛型进阶",
  "泛型高级",
  "实战与类型体操",
];
