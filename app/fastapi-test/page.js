"use client";

import TutorialPage from "../components/TutorialPage";
import { fastapiTestChapters, fastapiTestChapterGroups } from "../courses-data/fastapi-test-book-data";

export default function FastAPITestBook() {
  return (
    <TutorialPage
      chapters={fastapiTestChapters}
      chapterGroups={fastapiTestChapterGroups}
      bookPath="/fastapi-test"
      bookTitle="FastAPI 测试与部署"
      defaultLang="py"
      tip="点击章节开始阅读"
      footerText="FastAPI 测试与部署全书 · 34 章超详细 · Starlette / TestClient / httpx 深度剖析 · 从单元测试到生产部署"
    />
  );
}
