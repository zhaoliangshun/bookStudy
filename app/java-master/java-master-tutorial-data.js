// =============================================================
// Java 开发详解 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 128 章，覆盖 Java 开发全栈知识。
// 纯内容阅读型教程，无代码执行功能。
//
// 16 个 batch 文件，每组 8 章：
//   java-master-chapters-batch1.js  : Java 基础语法入门
//   java-master-chapters-batch2.js  : 流程控制与数组
//   java-master-chapters-batch3.js  : 面向对象编程基础
//   java-master-chapters-batch4.js  : 面向对象高级特性
//   java-master-chapters-batch5.js  : 核心 API 与字符串处理
//   java-master-chapters-batch6.js  : 集合框架深度解析
//   java-master-chapters-batch7.js  : 泛型与枚举
//   java-master-chapters-batch8.js  : 异常处理与注解
//   java-master-chapters-batch9.js  : Lambda 与函数式编程
//   java-master-chapters-batch10.js : Stream API 深度解析
//   java-master-chapters-batch11.js : IO/NIO 与反射
//   java-master-chapters-batch12.js : 并发编程基础
//   java-master-chapters-batch13.js : JUC 并发包与原子类
//   java-master-chapters-batch14.js : JVM 内存模型与垃圾回收
//   java-master-chapters-batch15.js : Java 新特性与设计模式
//   java-master-chapters-batch16.js : 工程实践与构建工具
// =============================================================

import { chapters as batch1 } from "./java-master-chapters-batch1";
import { chapters as batch2 } from "./java-master-chapters-batch2";
import { chapters as batch3 } from "./java-master-chapters-batch3";
import { chapters as batch4 } from "./java-master-chapters-batch4";
import { chapters as batch5 } from "./java-master-chapters-batch5";
import { chapters as batch6 } from "./java-master-chapters-batch6";
import { chapters as batch7 } from "./java-master-chapters-batch7";
import { chapters as batch8 } from "./java-master-chapters-batch8";
import { chapters as batch9 } from "./java-master-chapters-batch9";
import { chapters as batch10 } from "./java-master-chapters-batch10";
import { chapters as batch11 } from "./java-master-chapters-batch11";
import { chapters as batch12 } from "./java-master-chapters-batch12";
import { chapters as batch13 } from "./java-master-chapters-batch13";
import { chapters as batch14 } from "./java-master-chapters-batch14";
import { chapters as batch15 } from "./java-master-chapters-batch15";
import { chapters as batch16 } from "./java-master-chapters-batch16";

export const javaMasterChapters = [
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
  ...batch14,
  ...batch15,
  ...batch16,
];

export const javaMasterChapterGroups = [
  "Java 基础语法入门",
  "流程控制与数组",
  "面向对象编程基础",
  "面向对象高级特性",
  "核心 API 与字符串处理",
  "集合框架深度解析",
  "泛型与枚举",
  "异常处理与注解",
  "Lambda 与函数式编程",
  "Stream API 深度解析",
  "IO/NIO 与反射",
  "并发编程基础",
  "JUC 并发包与原子类",
  "JVM 内存模型与垃圾回收",
  "Java 新特性与设计模式",
  "工程实践与构建工具",
];
