"use client";

import TutorialPage from "../components/TutorialPage";
import { mongoChapters, mongoChapterGroups } from "../courses-data/mongo-tutorial-data";

export default function MongoBook() {
  return (
    <TutorialPage
      chapters={mongoChapters}
      chapterGroups={mongoChapterGroups}
      bookPath="/mongo"
      bookTitle="MongoDB 实战"
      defaultLang="js"
      tip="点击章节开始阅读"
      footerText="MongoDB 实战教程 · 覆盖日常开发全部知识 · 愿你建模又灵活又稳"
    />
  );
}
