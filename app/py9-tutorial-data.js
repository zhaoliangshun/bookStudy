// =============================================================
// Python 逐层深入教程（py9）章节数据聚合入口
// -------------------------------------------------------------
// 全新制作，共 92 章，9 个 batch 文件。
// 风格：抽丝剥茧、深入浅出，每章配可运行 demo + 详细注释。
// 运行方式：通过 /api/run-py 调用系统 python3 子进程执行。
// =============================================================

import { chapters as batch1 } from "./py9-chapters-batch1";
import { chapters as batch2 } from "./py9-chapters-batch2";
import { chapters as batch3 } from "./py9-chapters-batch3";
import { chapters as batch4 } from "./py9-chapters-batch4";
import { chapters as batch5 } from "./py9-chapters-batch5";
import { chapters as batch6 } from "./py9-chapters-batch6";
import { chapters as batch7 } from "./py9-chapters-batch7";
import { chapters as batch8 } from "./py9-chapters-batch8";
import { chapters as batch9 } from "./py9-chapters-batch9";

export const py9Chapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
  ...batch6,
  ...batch7,
  ...batch8,
  ...batch9,
];

export const py9ChapterGroups = [
  "起步：认识 Python",
  "数据：Python 里的东西",
  "流程：判断与重复",
  "函数：代码的复用",
  "面向对象：描述世界",
  "异常文件与实战",
  "迭代器与生成器",
  "函数式与高级特性",
  "标准库精讲",
  "类型与现代特性",
  "测试与调试",
  "性能优化",
  "实战进阶",
];
