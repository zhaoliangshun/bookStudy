// =============================================================
// 用户偏好 API 路由
// -------------------------------------------------------------
// 将侧边栏的书籍排序、隐藏/删除状态持久化到服务端 JSON 文件，
// 使得在不同设备/浏览器打开时状态保持一致。
//
// 存储文件：data/user-preferences.json
// 数据结构：
//   {
//     "bookOrder": { "Python 教程": ["/py", ...], ... },
//     "hiddenBooks": ["/pyex", ...],
//     "deletedChapters": ["ch1", ...],
//     "hiddenChapters": ["ch2", ...]
//   }
// =============================================================

import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir, rename } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(/*turbopackIgnore: true*/ process.cwd(), "data");
const FILE_PATH = join(DATA_DIR, "user-preferences.json");

// 确保 data 目录存在（异步，避免 mkdirSync 阻塞事件循环）
// mkdir { recursive: true } 在目录已存在时是幂等的，无需 existsSync 预检
async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

// 读取偏好（异步，避免 readFileSync 阻塞事件循环）
async function readPrefs() {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    // 文件损坏或不存在，返回空对象
  }
  return {};
}

// 写入偏好（原子写入：先写临时文件再 rename，避免并发写入导致文件损坏）
// 临时文件名带 pid + 时间戳，避免并发请求写同一临时文件互相覆盖
async function writePrefs(data) {
  await ensureDir();
  const tmpPath = FILE_PATH + `.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf8");
  await rename(tmpPath, FILE_PATH);
}

// 串行化写锁：用 promise 链确保每次 read→merge→write 串行执行，
// 避免两个 hook 同时 POST 时读到旧文件、后写入覆盖前写入的竞态条件。
let pendingWrite = Promise.resolve();

async function lockedWrite(filtered) {
  const result = pendingWrite.then(async () => {
    const prefs = await readPrefs();
    const merged = { ...prefs, ...filtered };
    await writePrefs(merged);
    return { ok: true };
  });
  // 即使当前写入失败，也要释放锁让后续请求继续
  pendingWrite = result.catch(() => {});
  return result;
}

// 允许的字段白名单
const ALLOWED_KEYS = new Set(["bookOrder", "hiddenBooks", "deletedChapters", "hiddenChapters", "categoryConfig", "savedDefaults"]);

// GET /api/preferences —— 获取当前偏好
export async function GET() {
  try {
    const prefs = await readPrefs();
    return NextResponse.json(prefs);
  } catch {
    return NextResponse.json(
      { error: "读取偏好失败，请稍后重试" },
      { status: 500 }
    );
  }
}

// POST /api/preferences —— 保存偏好（合并写入，只更新传入的字段）
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体不是合法的 JSON" }, { status: 400 });
  }

  // 输入校验：body 必须是对象，且只允许白名单字段
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "请求体必须是 JSON 对象" }, { status: 400 });
  }

  // 仅保留白名单字段
  const filtered = {};
  for (const key of Object.keys(body)) {
    if (ALLOWED_KEYS.has(key)) {
      filtered[key] = body[key];
    }
  }

  try {
    // 使用串行化写锁，确保每次写入前都读到最新的文件内容，
    // 避免两个 hook 同时 POST 时互相覆盖（竞态条件）
    const result = await lockedWrite(filtered);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "保存偏好失败，请稍后重试" },
      { status: 500 }
    );
  }
}