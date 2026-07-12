"use client";

import TutorialPage from "../components/TutorialPage";
import { fastapiCodeChapters, fastapiCodeChapterGroups } from "../courses-data/fastapi-code-book-data";

export default function FastAPICodeBook() {
  return (
    <TutorialPage
      chapters={fastapiCodeChapters}
      chapterGroups={fastapiCodeChapterGroups}
      bookPath="/fastapi-code"
      bookTitle="FastAPI 代码详解"
      defaultLang="py"
      tip="点击章节开始阅读"
      footerText="FastAPI 代码详解 · 16 章 demo 驱动学习 · 重点在代码注释里讲解"
    />
  );
}