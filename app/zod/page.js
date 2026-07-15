"use client";

import TutorialPage from "../components/TutorialPage";
import { zodChapters, zodChapterGroups } from "../courses-data/zod-tutorial-data";

export default function ZodTutorial() {
  return (
    <TutorialPage
      chapters={zodChapters}
      chapterGroups={zodChapterGroups}
      bookPath="/zod"
      bookTitle="Zod 实战教程"
      defaultLang="js"
      tip="点击章节开始学习 Zod"
      footerText="Zod 交互式教程 · TypeScript-first schema 验证库 · 覆盖表单/API/环境变量等实战场景"
    />
  );
}
