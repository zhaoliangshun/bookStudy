"use client";

import TutorialPage from "../components/TutorialPage";
import { hermitChapters, hermitChapterGroups } from "../courses-data/hermit-book-data";

export default function HermitBook() {
  return (
    <TutorialPage
      chapters={hermitChapters}
      chapterGroups={hermitChapterGroups}
      bookPath="/hermit"
      bookTitle="红尘之外：隐居生活之道"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="观红尘 · 看破执 · 断俗缘 · 寻归处 · 隐居道 · 心自在 · 得大自在 · 33 章归隐之旅"
    />
  );
}
