"use client";

import TutorialPage from "../components/TutorialPage";
import { csharp3Chapters, csharp3ChapterGroups } from "../courses-data/csharp3-tutorial-data";

// =============================================================
// C# 从入门到精通大全（终极版）—— 教程页面入口
// -------------------------------------------------------------
// 本教程定位为「终极版大而全」的 C# 参考书：
//   - 共 86 章，覆盖从环境搭建到工程实战的全套知识体系
//   - 每章 demo 驱动，代码可在线编辑运行（基于顶级语句 / .NET 8）
//   - 注释详尽，循序渐进，覆盖日常开发 100% 高频知识点
//   - 语言简洁、内容生动、不拖沓
// 复用 /api/run-csharp 路由进行代码执行
// =============================================================
export default function Csharp3Tutorial() {
  return (
    <TutorialPage
      chapters={csharp3Chapters}
      chapterGroups={csharp3ChapterGroups}
      bookPath="/csharp3"
      bookTitle="C# 从入门到精通大全（终极版）"
      defaultLang="cs"
      tip="点击章节开始学习，所有代码均可在线运行"
      footerText="C# 12 / .NET 8 LTS · 终极版大全集 · 86 章覆盖：语法基础 / OOP / 泛型集合 / 委托事件 / LINQ / 反射特性 / 异步并发 / 文件IO / JSON / 网络编程 / 工程化实战 / 综合项目"
    />
  );
}