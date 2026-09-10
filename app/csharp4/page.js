"use client";

import TutorialPage from "../components/TutorialPage";
import { csharp4Chapters, csharp4ChapterGroups } from "../courses-data/csharp4-tutorial-data";

// =============================================================
// C# 从入门到精通大全（全新版）—— 教程页面入口
// -------------------------------------------------------------
// 本教程为完全重新编写的「大而全」C# 参考书：
//   - 共 94 篇（前言 + 92 讲 + 结语），从语言基础延伸到生产运维
//   - 每章 demo 驱动；生产基线为 .NET 10 / C# 14，交互示例兼容 .NET 8
//   - 注释详尽，循序渐进，同时明确真实框架与教学模拟代码的边界
//   - 语言简洁、内容生动、不拖沓
// 复用 /api/run-csharp 路由进行代码执行（.NET 8.0.412 SDK）
// =============================================================
export default function Csharp4Tutorial() {
  return (
    <TutorialPage
      chapters={csharp4Chapters}
      chapterGroups={csharp4ChapterGroups}
      bookPath="/csharp4"
      bookTitle="现代 C# 从入门到生产（.NET 10 / C# 14）"
      defaultLang="cs"
      tip="点击章节开始学习；交互示例兼容 .NET 8，生产实践以 .NET 10 LTS / C# 14 为基线"
      footerText=".NET 10 LTS / C# 14 · 94 篇覆盖：语言基础 / 面向对象 / 集合与 LINQ / 异步并发 / IO 与性能 / 网络 / ASP.NET Core / EF Core / 安全 / 韧性 / 可观测性 / 测试 / 容器与 CI/CD"
    />
  );
}
