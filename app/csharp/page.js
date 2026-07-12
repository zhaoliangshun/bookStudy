"use client";

import TutorialPage from "../components/TutorialPage";
import { csharpChapters, csharpChapterGroups } from "../courses-data/csharp-tutorial-data";

export default function CsharpTutorial() {
  return (
    <TutorialPage
      chapters={csharpChapters}
      chapterGroups={csharpChapterGroups}
      bookPath="/csharp"
      bookTitle="C# 入门"
      defaultLang="cs"
      tip="点击章节开始学习 C#"
      footerText="C# 12 / .NET 8 交互式教程 · 代码由系统 dotnet 编译运行 · 涵盖语法基础/OOP/泛型/委托事件/LINQ/异步编程"
    />
  );
}
