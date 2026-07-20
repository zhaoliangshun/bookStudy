"use client";

import TutorialPage from "../components/TutorialPage";
import { csharp2Chapters, csharp2ChapterGroups } from "../courses-data/csharp2-tutorial-data";

export default function Csharp2Tutorial() {
  return (
    <TutorialPage
      chapters={csharp2Chapters}
      chapterGroups={csharp2ChapterGroups}
      bookPath="/csharp2"
      bookTitle="C# 大全"
      defaultLang="cs"
      tip="点击章节开始学习 C# · 大而全 · 100% 覆盖日常开发知识点"
      footerText="C# 12 / .NET 8 完整教程 · 61 章 · 从基础语法到高级特性 · 每章可运行 demo · 详细注释"
    />
  );
}
