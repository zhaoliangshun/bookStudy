"use client";

import TutorialPage from "../components/TutorialPage";
import { fastapiLearnChapters, fastapiLearnChapterGroups } from "../courses-data/fastapi-learn-book-data";

export default function FastAPILearnBook() {
  return (
    <TutorialPage
      chapters={fastapiLearnChapters}
      chapterGroups={fastapiLearnChapterGroups}
      bookPath="/fastapi-learn"
      bookTitle="FastAPI Demo 详解"
      defaultLang="py"
      tip="点击章节开始阅读"
      footerText="FastAPI Demo 详解 · 16 章 demo 驱动学习 · 重点在代码注释里讲解"
    />
  );
}
