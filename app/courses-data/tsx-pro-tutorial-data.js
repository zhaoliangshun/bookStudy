// =============================================================
// TypeScript + React 全栈精通 - 数据汇总
// -------------------------------------------------------------
// 全书 70 章，按学习路径分 11 个 batch：
//   Batch 1-4: TypeScript 体系（28 章）
//   Batch 5-6: React 基础 + Hooks（16 章）
//   Batch 7-8: React 进阶模式 + 性能（11 章）
//   Batch 9-10: 状态管理 + 路由 + 数据 + 表单 + 样式（12 章）
//   Batch 11: 测试 + 工程化（5 章）
// =============================================================

import { chapters as batch1 } from "./tsx-pro-batch1";
import { chapters as batch2 } from "./tsx-pro-batch2";
import { chapters as batch3 } from "./tsx-pro-batch3";
import { chapters as batch4 } from "./tsx-pro-batch4";
import { chapters as batch5 } from "./tsx-pro-batch5";
import { chapters as batch6 } from "./tsx-pro-batch6";
import { chapters as batch7 } from "./tsx-pro-batch7";
import { chapters as batch8 } from "./tsx-pro-batch8";
import { chapters as batch9 } from "./tsx-pro-batch9";
import { chapters as batch10 } from "./tsx-pro-batch10";
import { chapters as batch11 } from "./tsx-pro-batch11";

export const tsxProChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
  ...batch10,
  ...batch11,
];

export const tsxProChapterGroups = [
  "一、TypeScript 基础类型系统",
  "二、TypeScript 函数与泛型",
  "三、TypeScript 高级类型",
  "四、TypeScript 模块与工程化",
  "五、React 基础与组件",
  "六、React Hooks 全套",
  "七、React 进阶模式",
  "八、React 性能优化",
  "九、状态管理与路由",
  "十、表单与样式与动画",
  "十一、测试与工程化",
];
