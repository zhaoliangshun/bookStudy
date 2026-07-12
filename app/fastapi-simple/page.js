"use client";

import TutorialPage from "../components/TutorialPage";
import { fastapiSimpleChapters, fastapiSimpleChapterGroups } from "../courses-data/fastapi-simple-book-data";

export default function FastAPISimpleBook() {
  return (
    <TutorialPage
      chapters={fastapiSimpleChapters}
      chapterGroups={fastapiSimpleChapterGroups}
      bookPath="/fastapi-simple"
      bookTitle="FastAPI 精简教程"
      defaultLang="py"
      tip="点击章节开始阅读"
      footerText="FastAPI 精简版 · 12 章快速上手 · Demo 驱动学习"
    />
  );
}
