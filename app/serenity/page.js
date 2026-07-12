"use client";

import TutorialPage from "../components/TutorialPage";
import { serenityChapters, serenityChapterGroups } from "../courses-data/serenity-book-data";

export default function SerenityBook() {
  return (
    <TutorialPage
      chapters={serenityChapters}
      chapterGroups={serenityChapterGroups}
      bookPath="/serenity"
      bookTitle="云淡风轻：心无所住的智慧"
      defaultLang="md"
      tip="点击章节开始修心"
      footerText="云淡风轻 · 60 章心无所住的智慧 · 世间一切皆是过客，看淡即为自在"
    />
  );
}
