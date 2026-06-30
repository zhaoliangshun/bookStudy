#!/usr/bin/env node
// 直接扫描 app/py5-chapters-batch*.js，逐个 import 并提取 chapters。
import { readFileSync, writeFileSync, existsSync } from "fs";
import { pathToFileURL } from "url";

const all = [];
for (let i = 1; i <= 14; i++) {
  const p = `/Users/test/bookStudy/app/py5-chapters-batch${i}.js`;
  if (!existsSync(p)) continue;
  const mod = await import(pathToFileURL(p).href);
  if (mod.chapters) all.push(...mod.chapters);
}
writeFileSync("/tmp/py5_codes.json", JSON.stringify(all.map((ch, idx) => ({
  idx, id: ch.id, group: ch.group, title: ch.title, code: ch.code
}))));
console.log(`Extracted ${all.length} chapters`);
