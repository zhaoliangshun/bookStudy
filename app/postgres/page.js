"use client";

import TutorialPage from "../components/TutorialPage";
import { postgresChapters, postgresChapterGroups } from "../courses-data/postgres-tutorial-data";

export default function PostgresBook() {
  return (
    <TutorialPage
      chapters={postgresChapters}
      chapterGroups={postgresChapterGroups}
      bookPath="/postgres"
      bookTitle="PostgreSQL 实战"
      defaultLang="sql"
      tip="点击章节开始阅读"
      footerText="PostgreSQL 实战教程 · 覆盖日常开发与运维全部知识 · 愿你写出的 SQL 又快又稳"
    />
  );
}
