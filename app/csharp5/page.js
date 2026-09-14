"use client";

import TutorialPage from "../components/TutorialPage";
import {
  csharp5Chapters,
  csharp5ChapterGroups,
} from "../courses-data/csharp5-tutorial-data";

export default function Csharp5Tutorial() {
  return (
    <TutorialPage
      chapters={csharp5Chapters}
      chapterGroups={csharp5ChapterGroups}
      bookPath="/csharp5"
      bookTitle="C# 从零基础到生产上线（2026 完整版）"
      defaultLang="cs"
      inlineCodeRun={false}
      tip="138 篇循序渐进课程；每章主 demo 可运行，正文片段用于项目级示例；生产基线为 .NET 10 LTS / C# 14"
      footerText=".NET 10 LTS / C# 14 · 语言与运行时 / Web API / 数据库 / 安全 / 分布式系统 / 云原生 / 测试 / 性能 / 可观测性 / CI/CD / 生产上线"
    />
  );
}
