"use client";

import TutorialPage from "../components/TutorialPage";
import { csharp4Chapters, csharp4ChapterGroups } from "../courses-data/csharp4-tutorial-data";

// =============================================================
// C# 从入门到精通大全（全新版）—— 教程页面入口
// -------------------------------------------------------------
// 本教程为完全重新编写的「大而全」C# 参考书：
//   - 共 80 篇（前言 + 78 讲 + 结语），覆盖从环境搭建到工程实战的全套知识体系
//   - 每章 demo 驱动，代码可在线编辑运行（基于顶级语句 / .NET 8）
//   - 注释详尽，循序渐进，覆盖日常开发 100% 高频知识点
//   - 语言简洁、内容生动、不拖沓
// 复用 /api/run-csharp 路由进行代码执行（.NET 8.0.412 SDK）
// =============================================================
export default function Csharp4Tutorial() {
  return (
    <TutorialPage
      chapters={csharp4Chapters}
      chapterGroups={csharp4ChapterGroups}
      bookPath="/csharp4"
      bookTitle="C# 从入门到精通大全（全新版）"
      defaultLang="cs"
      tip="点击章节开始学习，所有代码均可在线运行"
      footerText="C# 12 / .NET 8 LTS · 全新版大全集 · 80 篇覆盖：入门基础 / 核心语法 / 面向对象 / 泛型集合 / 委托事件 / LINQ / 异步并发 / 文件IO / 反射特性 / 异常调试 / 内存性能 / 网络编程 / 工程化实战"
    />
  );
}
