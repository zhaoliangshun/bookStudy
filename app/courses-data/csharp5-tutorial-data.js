import { chapters as batch1 } from "./csharp5-chapters-batch1.js";
import { chapters as batch2 } from "./csharp5-chapters-batch2.js";
import { chapters as batch3 } from "./csharp5-chapters-batch3.js";
import { chapters as batch4 } from "./csharp5-chapters-batch4.js";
import { chapters as batch5 } from "./csharp5-chapters-batch5.js";
import { chapters as batch6 } from "./csharp5-chapters-batch6.js";
import { chapters as batch7 } from "./csharp5-chapters-batch7.js";
import { chapters as batch8 } from "./csharp5-chapters-batch8.js";
import { chapters as batch9 } from "./csharp5-chapters-batch9.js";
import { chapters as batch10 } from "./csharp5-chapters-batch10.js";
import { chapters as batch11 } from "./csharp5-chapters-batch11.js";
import { chapters as batch12 } from "./csharp5-chapters-batch12.js";
import { chapters as batch13 } from "./csharp5-chapters-batch13.js";
import { chapters as batch14 } from "./csharp5-chapters-batch14.js";
import { chapters as batch15 } from "./csharp5-chapters-batch15.js";
import { chapters as batch16 } from "./csharp5-chapters-batch16.js";
import {
  csharp5Preface,
  csharp5ProductionChapters,
  csharp5Conclusion,
  csharp5ProductionGroups,
} from "./csharp5-chapters-production.js";

const allBatches = [
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
  ...batch12,
  ...batch13,
  ...batch14.slice(0, -1),
  ...batch15,
];

// csharp5 拥有独立章节文件和 ID，不会随 csharp4 的修改隐式变化。
const foundationalChapters = allBatches.filter(
  ({ id }) => id !== "csharp5-preface" && id !== "csharp5-conclusion"
);

export const csharp5Chapters = [
  csharp5Preface,
  ...foundationalChapters,
  ...csharp5ProductionChapters,
  ...batch16,
  csharp5Conclusion,
];

export const csharp5ChapterGroups = [
  "开篇",
  "第一部分 入门基础",
  "第二部分 核心语法",
  "第三部分 面向对象",
  "第四部分 泛型与集合",
  "第五部分 委托、事件与 Lambda",
  "第六部分 LINQ",
  "第七部分 异步与并发",
  "第八部分 文件 IO 与序列化",
  "第九部分 反射与特性",
  "第十部分 异常处理与调试",
  "第十一部分 内存管理与性能",
  "第十二部分 网络编程",
  "第十三部分 工程化实战",
  "第十四部分 现代 C# 与生产工程",
  ...csharp5ProductionGroups,
  "第十九部分 生产深水区",
  "结尾",
];
