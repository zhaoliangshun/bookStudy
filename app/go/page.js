"use client";

import TutorialPage from "../components/TutorialPage";
import { goChapters, goChapterGroups } from "../courses-data/go-tutorial-data";

export default function GoTutorial() {
  return (
    <TutorialPage
      chapters={goChapters}
      chapterGroups={goChapterGroups}
      bookPath="/go"
      bookTitle="Go 入门"
      defaultLang="go"
      tip="点击章节开始学习 Go"
      footerText="Go 1.21+ 交互式教程 · 代码由系统 go run 编译运行 · 涵盖语法基础/接口/泛型/并发 goroutine/channel/Go Modules/Web 开发"
    />
  );
}
