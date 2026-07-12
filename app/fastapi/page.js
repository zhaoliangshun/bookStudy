"use client";

import TutorialPage from "../components/TutorialPage";
import { fastapiChapters, fastapiChapterGroups } from "../courses-data/fastapi-book-data";

export default function FastAPIBook() {
  return (
    <TutorialPage
      chapters={fastapiChapters}
      chapterGroups={fastapiChapterGroups}
      bookPath="/fastapi"
      bookTitle="FastAPI 实战"
      defaultLang="py"
      tip="点击章节开始阅读"
      footerText="FastAPI 应用开发实战 · 从入门到精通 · 高性能 API 框架的完整指南"
    />
  );
}
