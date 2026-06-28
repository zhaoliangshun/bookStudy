// =============================================================
// Java 教程章节数据（聚合入口）
// -------------------------------------------------------------
// 教程内容按章节分组拆分到 22 个独立文件，共 300 章：
//
//   java-chapters-batch1.js  : 基础（5 章）
//   java-chapters-batch2.js  : 面向对象（5 章）
//   java-chapters-batch3.js  : 进阶（5 章）
//   java-chapters-batch4.js  : 基础深入（15 章）
//   java-chapters-batch5.js  : 字符串与字符（15 章）
//   java-chapters-batch6.js  : 数组与控制流（15 章）
//   java-chapters-batch7.js  : 方法与作用域（15 章）
//   java-chapters-batch8.js  : OOP 深入（15 章）
//   java-chapters-batch9.js  : 继承与多态深入（15 章）
//   java-chapters-batch10.js : 接口与抽象类深入（15 章）
//   java-chapters-batch11.js : 内部类与枚举（15 章）
//   java-chapters-batch12.js : 异常处理深入（15 章）
//   java-chapters-batch13.js : 集合框架深入（15 章）
//   java-chapters-batch14.js : 集合进阶（15 章）
//   java-chapters-batch15.js : 泛型深入（15 章）
//   java-chapters-batch16.js : I/O 与 NIO（15 章）
//   java-chapters-batch17.js : 多线程与并发（15 章）
//   java-chapters-batch18.js : Lambda 与 Stream（15 章）
//   java-chapters-batch19.js : 反射与注解（15 章）
//   java-chapters-batch20.js : 高级主题（15 章）
//   java-chapters-batch21.js : 设计模式（15 章）
//   java-chapters-batch22.js : 新特性与工程化（15 章）
//
// 前端通过 /api/run-java 接口调用系统 javac 编译、java 运行，
// 捕获 stdout / stderr 返回。
// =============================================================

import { chapters as batch1 } from "./java-chapters-batch1";
import { chapters as batch2 } from "./java-chapters-batch2";
import { chapters as batch3 } from "./java-chapters-batch3";
import { chapters as batch4 } from "./java-chapters-batch4";
import { chapters as batch5 } from "./java-chapters-batch5";
import { chapters as batch6 } from "./java-chapters-batch6";
import { chapters as batch7 } from "./java-chapters-batch7";
import { chapters as batch8 } from "./java-chapters-batch8";
import { chapters as batch9 } from "./java-chapters-batch9";
import { chapters as batch10 } from "./java-chapters-batch10";
import { chapters as batch11 } from "./java-chapters-batch11";
import { chapters as batch12 } from "./java-chapters-batch12";
import { chapters as batch13 } from "./java-chapters-batch13";
import { chapters as batch14 } from "./java-chapters-batch14";
import { chapters as batch15 } from "./java-chapters-batch15";
import { chapters as batch16 } from "./java-chapters-batch16";
import { chapters as batch17 } from "./java-chapters-batch17";
import { chapters as batch18 } from "./java-chapters-batch18";
import { chapters as batch19 } from "./java-chapters-batch19";
import { chapters as batch20 } from "./java-chapters-batch20";
import { chapters as batch21 } from "./java-chapters-batch21";
import { chapters as batch22 } from "./java-chapters-batch22";

// 按分组顺序拼接所有章节（300 章）
export const javaChapters = [
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
  ...batch17,
  ...batch18,
  ...batch19,
  ...batch20,
  ...batch21,
  ...batch22,
];

// 侧边栏分组顺序（22 组 300 章）
export const javaChapterGroups = [
  "基础",
  "面向对象",
  "进阶",
  "基础深入",
  "字符串与字符",
  "数组与控制流",
  "方法与作用域",
  "OOP 深入",
  "继承与多态深入",
  "接口与抽象类深入",
  "内部类与枚举",
  "异常处理深入",
  "集合框架深入",
  "集合进阶",
  "泛型深入",
  "I/O 与 NIO",
  "多线程与并发",
  "Lambda 与 Stream",
  "反射与注解",
  "高级主题",
  "设计模式",
  "新特性与工程化",
];
