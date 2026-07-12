"use client";

import TutorialPage from "../components/TutorialPage";
import { calmChapters, calmChapterGroups } from "../courses-data/calm-book-data";

export default function CalmBook() {
  return (
    <TutorialPage
      chapters={calmChapters}
      chapterGroups={calmChapterGroups}
      bookPath="/calm"
      bookTitle="心境如水：情绪自在之道"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="觉醒 · 接受 · 放下 · 不扰 · 自在 · 通透 · 20 章心境之旅"
    />
  );
}
