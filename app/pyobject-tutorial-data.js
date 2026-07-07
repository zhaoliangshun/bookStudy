// =============================================================
// Python 面向对象教程（pyobject）章节数据聚合入口
// -------------------------------------------------------------
// 专题教程，专注讲解 Python 面向对象编程（OOP）的核心概念与日常开发应用。
// 风格定位：简单易懂、原理 + 大量 demo、详细源码注释。
// 章节数据拆分到 pyobject-chapters-batch1 ~ batch5 中（共 24 章）。
//
// 章节分组说明：
//   batch1（1-4章）：   基础概念
//   batch2（5-9章）：   三大特性
//   batch3（10-14章）： 魔术方法
//   batch4（15-19章）： 进阶特性
//   batch5（20-24章）： 实战项目
// =============================================================

import { chapters as batch1 } from "./pyobject-chapters-batch1";
import { chapters as batch2 } from "./pyobject-chapters-batch2";
import { chapters as batch3 } from "./pyobject-chapters-batch3";
import { chapters as batch4 } from "./pyobject-chapters-batch4";
import { chapters as batch5 } from "./pyobject-chapters-batch5";

export const pyobjectChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

// 导出分组（用于侧边栏分组展示）
export const pyobjectChapterGroups = [
  "基础概念",
  "三大特性",
  "魔术方法",
  "进阶特性",
  "实战项目",
];
