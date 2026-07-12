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
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const FILE_PATH = join(DATA_DIR, "user-preferences.json");

// 确保 data 目录存在
function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 读取偏好
function readPrefs() {
  try {
    if (existsSync(FILE_PATH)) {
      const raw = readFileSync(FILE_PATH, "utf8");
      return JSON.parse(raw);
    }
  } catch {
    // 文件损坏或不存在，返回空对象
  }
  return {};
}

// 写入偏好（原子写入：先写临时文件再 rename，避免并发写入导致文件损坏）
function writePrefs(data) {
  ensureDir();
  const tmpPath = FILE_PATH + ".tmp";
  writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
  renameSync(tmpPath, FILE_PATH);
}

// 允许的字段白名单
const ALLOWED_KEYS = new Set(["bookOrder", "hiddenBooks", "deletedChapters", "hiddenChapters"]);

// GET /api/preferences —— 获取当前偏好
export async function GET() {
  try {
    const prefs = readPrefs();
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
    // 合并写入：先读出现有数据，再用传入的字段覆盖
    const prefs = readPrefs();
    const merged = { ...prefs, ...filtered };
    writePrefs(merged);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "保存偏好失败，请稍后重试" },
      { status: 500 }
    );
  }
}