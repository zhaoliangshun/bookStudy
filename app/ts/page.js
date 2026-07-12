"use client";

import TutorialPage from "../components/TutorialPage";
import { tsChapters, tsChapterGroups } from "../courses-data/ts-tutorial-data";

export default function TypeScriptTutorial() {
  return (
    <TutorialPage
      chapters={tsChapters}
      chapterGroups={tsChapterGroups}
      bookPath="/ts"
      bookTitle="TypeScript 入门"
      defaultLang="ts"
      tip="点击章节开始学习 TypeScript"
      footerText="TypeScript 交互式教程 · 代码先经 TS 编译器转译再在沙箱中执行 · 支持 interface/type/enum/泛型/装饰器"
    />
  );
}
