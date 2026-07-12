"use client";

import TutorialPage from "../components/TutorialPage";
import { javaChapters, javaChapterGroups } from "../courses-data/java-tutorial-data";

export default function JavaTutorial() {
  return (
    <TutorialPage
      chapters={javaChapters}
      chapterGroups={javaChapterGroups}
      bookPath="/java"
      bookTitle="Java 入门"
      defaultLang="java"
      tip="点击章节开始学习 Java"
      footerText="Java 交互式教程 · 代码由系统 javac 编译 + java 运行 · 支持 OOP/泛型/集合/多线程/Lambda/Stream，含超时保护"
    />
  );
}
