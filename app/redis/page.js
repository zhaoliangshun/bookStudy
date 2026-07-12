"use client";

import TutorialPage from "../components/TutorialPage";
import { redisChapters, redisChapterGroups } from "../courses-data/redis-tutorial-data";

export default function RedisBook() {
  return (
    <TutorialPage
      chapters={redisChapters}
      chapterGroups={redisChapterGroups}
      bookPath="/redis"
      bookTitle="Redis 实战"
      defaultLang="bash"
      tip="点击章节开始阅读"
      footerText="Redis 实战教程 · 覆盖日常开发全部知识 · 愿你的缓存又快又稳"
    />
  );
}
