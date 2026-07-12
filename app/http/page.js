"use client";

import TutorialPage from "../components/TutorialPage";
import { httpChapters, httpChapterGroups } from "../courses-data/http-tutorial-data";

export default function HTTPTutorial() {
  return (
    <TutorialPage
      chapters={httpChapters}
      chapterGroups={httpChapterGroups}
      bookPath="/http"
      bookTitle="HTTP 通信协议"
      defaultLang="js"
      tip="点击章节开始学习 HTTP 通信协议"
      footerText="HTTP 通信教程 · 代码由 Node.js 沙箱执行 · 从 HTTP/1.1 到 HTTP/3，讲原理也讲实战"
    />
  );
}
