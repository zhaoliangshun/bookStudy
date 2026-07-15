"use client";

import TutorialPage from "../components/TutorialPage";
import { javaSimpleChapters, javaSimpleChapterGroups } from "../courses-data/java-simple-book-data";

export default function JavaSimpleBook() {
  return (
    <TutorialPage
      chapters={javaSimpleChapters}
      chapterGroups={javaSimpleChapterGroups}
      bookPath="/java-simple"
      bookTitle="Java 精简教程"
      defaultLang="java"
      tip="点击章节开始阅读 · 每章都有可运行 demo"
      footerText="Java 精简教程 · 12 章重点干货 · 代码由系统 javac 编译 + java 运行 · Demo 驱动 + 详细注释"
    />
  );
}
