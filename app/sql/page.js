"use client";

import TutorialPage from "../components/TutorialPage";
import { sqlChapters, sqlChapterGroups } from "../courses-data/sql-tutorial-data";

export default function SQLTutorial() {
  return (
    <TutorialPage
      chapters={sqlChapters}
      chapterGroups={sqlChapterGroups}
      bookPath="/sql"
      bookTitle="SQL 入门"
      defaultLang="sql"
      tip="点击章节开始学习数据库开发"
      footerText="数据库开发教程 · 代码在 SQLite 内存数据库中执行 · 支持 SQL 基础、查询进阶、索引优化、事务设计、现代数据库全景"
    />
  );
}
