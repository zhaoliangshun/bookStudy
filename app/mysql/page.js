"use client";

import TutorialPage from "../components/TutorialPage";
import { mysqlChapters, mysqlChapterGroups } from "../courses-data/mysql-tutorial-data";

export default function MysqlBook() {
  return (
    <TutorialPage
      chapters={mysqlChapters}
      chapterGroups={mysqlChapterGroups}
      bookPath="/mysql"
      bookTitle="MySQL 实战"
      defaultLang="sql"
      tip="点击章节开始阅读"
      footerText="MySQL 实战教程 · 覆盖日常开发全部知识 · 愿你写出的 SQL 又快又稳"
    />
  );
}
