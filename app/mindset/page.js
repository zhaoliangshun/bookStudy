"use client";

import TutorialPage from "../components/TutorialPage";
import { mindsetChapters, mindsetChapterGroups } from "../courses-data/mindset-book-data";

export default function MindsetBook() {
  return (
    <TutorialPage
      chapters={mindsetChapters}
      chapterGroups={mindsetChapterGroups}
      bookPath="/mindset"
      bookTitle="看淡：情绪控制之道"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="看淡一切 · 心态稳定 · 活好自己 · 12 章自在之旅"
    />
  );
}