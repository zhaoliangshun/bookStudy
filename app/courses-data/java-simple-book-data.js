// =============================================================
// Java 精简版书籍 —— 章节数据聚合入口
// -------------------------------------------------------------
// 12 章 3 分组，聚焦 Java 重点干货。
// 风格：demo 驱动 + 逐行中文注释 + 重点讲原理
//
//   batch1: 基础语法（4 章）
//   batch2: 面向对象（4 章）
//   batch3: 进阶核心（4 章）
//
// 代码运行约束：
//   - public class Main + public static void main(String[] args)
//   - 仅用 JDK 标准库
//   - System.out.println 输出
// =============================================================

import { chapters as batch1 } from "./java-simple-batch1";
import { chapters as batch2 } from "./java-simple-batch2";
import { chapters as batch3 } from "./java-simple-batch3";

export const javaSimpleChapters = [
  ...batch1, ...batch2, ...batch3,
];

export const javaSimpleChapterGroups = [
  "基础语法",
  "面向对象",
  "进阶核心",
];
