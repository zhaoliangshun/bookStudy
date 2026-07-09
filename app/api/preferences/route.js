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
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
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

// 写入偏好
function writePrefs(data) {
  ensureDir();
  writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/preferences —— 获取当前偏好
export async function GET() {
  try {
    const prefs = readPrefs();
    return NextResponse.json(prefs);
  } catch (e) {
    return NextResponse.json(
      { error: `读取偏好失败：${e.message}` },
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

  try {
    // 合并写入：先读出现有数据，再用传入的字段覆盖
    const prefs = readPrefs();
    const merged = { ...prefs, ...body };
    writePrefs(merged);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: `保存偏好失败：${e.message}` },
      { status: 500 }
    );
  }
}