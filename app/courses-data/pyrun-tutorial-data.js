// =============================================================
// Python 执行代码原理（pyrun）章节数据聚合入口
// -------------------------------------------------------------
// 用大白话讲清楚 Python 代码是怎么跑起来的。
// 章节分组说明：
//   batch1（1-5章）：  代码到指令（源码→字节码→执行）
//   batch2（6-10章）： 名字与作用域（变量、对象、作用域、闭包、GC）
//   batch3（11-15章）：函数调用的秘密（调用、栈帧、传参、递归、装饰器）
//   batch4（16-20章）：面向对象原理（类、属性查找、魔术方法、描述符、元类）
//   batch5（21-24章）：性能与并发原理（GIL、迭代器、异步、import）
// =============================================================

import { chapters as batch1 } from "./pyrun-chapters-batch1";
import { chapters as batch2 } from "./pyrun-chapters-batch2";
import { chapters as batch3 } from "./pyrun-chapters-batch3";
import { chapters as batch4 } from "./pyrun-chapters-batch4";
import { chapters as batch5 } from "./pyrun-chapters-batch5";

export const pyrunChapters = [
  ...batch1,
  ...batch2,
  ...batch3,
  ...batch4,
  ...batch5,
];

export const pyrunChapterGroups = [
  "代码到指令",
  "名字与作用域",
  "函数调用的秘密",
  "面向对象原理",
  "性能与并发原理",
];
