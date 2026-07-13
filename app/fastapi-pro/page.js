"use client";

import TutorialPage from "../components/TutorialPage";
import { fastapiProChapters, fastapiProChapterGroups } from "../courses-data/fastapi-pro-book-data";

export default function FastAPIProBook() {
  return (
    <TutorialPage
      chapters={fastapiProChapters}
      chapterGroups={fastapiProChapterGroups}
      bookPath="/fastapi-pro"
      bookTitle="FastAPI 现代开发"
      defaultLang="py"
      tip="点击章节开始阅读"
      footerText="FastAPI 现代开发全书 · 超详细讲解 · 多 demo 多注释 · 从原理到实战"
    />
  );
}
