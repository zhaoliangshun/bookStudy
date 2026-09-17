import { csharp5Chapters } from "../app/courses-data/csharp5-tutorial-data.js";
const ch = csharp5Chapters.find((c) => c.id === "csharp5-ch129");
console.log(ch.content);
