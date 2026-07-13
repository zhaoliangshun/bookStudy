"use client";

import TutorialPage from "../components/TutorialPage";
import { httpsChapters, httpsChapterGroups } from "../courses-data/https-book-data";

export default function HTTPSBook() {
  return (
    <TutorialPage
      chapters={httpsChapters}
      chapterGroups={httpsChapterGroups}
      bookPath="/https-book"
      bookTitle="HTTPS 详解"
      defaultLang="bash"
      tip="点击章节开始阅读"
      footerText="HTTPS 详解全书 · 30 章超详细 · 密码学 → 证书 → TLS → 部署 → 性能 → 安全 · 从原理到实战"
    />
  );
}
