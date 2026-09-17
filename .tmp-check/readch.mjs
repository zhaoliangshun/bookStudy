import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";
const ids = process.argv.slice(2);
for (const id of ids) {
  const ch = csharp5Chapters.find((c) => c.id === id);
  if (!ch) { console.log("无 " + id); continue; }
  console.log(`\n########## ${id} | ${ch.title} ##########`);
  console.log(ch.content);
}
