"use client";

import TutorialPage from "../components/TutorialPage";
import { emotionChapters, emotionChapterGroups } from "../courses-data/emotion-book-data";

export default function EmotionBook() {
  return (
    <TutorialPage
      chapters={emotionChapters}
      chapterGroups={emotionChapterGroups}
      bookPath="/emotion"
      bookTitle="无所谓"
      defaultLang="md"
      tip="点击章节开始阅读"
      footerText="无所谓 · 心态稳定 · 看淡这个世界"
    />
  );
}
