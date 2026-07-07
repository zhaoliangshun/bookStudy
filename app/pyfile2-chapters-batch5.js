// =============================================================
// Python 文件管理教程（pyfile2）—— 第五批章节
// -------------------------------------------------------------
// 实战项目（20-24章）
//   第 20 章：项目 1：日志分析器
//   第 21 章：项目 2：照片整理器
//   第 22 章：项目 3：配置中心
//   第 23 章：项目 4：简易文件备份工具
//   第 24 章：常见错误与最佳实践
// =============================================================

export const chapters = [
  // =========================================================
  // 第二十章：项目 1：日志分析器
  // =========================================================
  {
    id: "pf-20",
    group: "实战项目",
    icon: "🔎",
    title: "项目 1：日志分析器",
    content: `## 一、项目目标

读应用日志文件，统计错误、警告、信息的数量，并按时间分组。

## 二、需求分析

| 功能 | 描述 |
|------|------|
| 读日志 | 流式读大文件 |
| 解析每行 | 提取时间、级别、消息 |
| 统计 | 按级别、小时统计 |
| 输出 | 控制台 + JSON 报告 |

## 三、关键技术

- 流式读：\`for line in f\`
- 正则：\`re.match()\` 解析日志
- 计数器：\`collections.Counter\`
- 默认字典：\`defaultdict\`

## 四、完整实现

\`\`\`python
import re
import json
from pathlib import Path
from collections import Counter, defaultdict
from datetime import datetime

LOG_PATTERN = re.compile(
    r"^(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(\\w+)\\] (.+)$"
)

def parse_log(path):
    """解析日志，按级别和小时统计"""
    level_counter = Counter()
    hourly_counter = defaultdict(Counter)
    errors = []

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            m = LOG_PATTERN.match(line.strip())
            if m:
                timestamp, level, msg = m.groups()
                level_counter[level] += 1
                hour = timestamp[:13]  # YYYY-MM-DD HH
                hourly_counter[hour][level] += 1
                if level == "ERROR":
                    errors.append({"time": timestamp, "msg": msg})
    return level_counter, hourly_counter, errors

def print_report(level_counter, hourly_counter):
    print("=== 级别统计 ===")
    for level, count in level_counter.most_common():
        print(f"  {level:8s}: {count}")
    print("\\n=== 每小时统计 ===")
    for hour in sorted(hourly_counter):
        c = hourly_counter[hour]
        print(f"  {hour}: INFO={c['INFO']} WARN={c['WARN']} ERROR={c['ERROR']}")
\`\`\`

## 五、改进方向

1. 支持多文件（glob）
2. 输出到文件
3. 支持自定义正则
4. 异常处理

## 六、本章 demo
下面 demo 实现一个完整的日志分析器。
`,
    code: `"""
第二十章 demo：日志分析器
完整实现：
  - 流式读大文件
  - 正则解析日志
  - 按级别、小时统计
  - 输出报告
"""

import re
import json
import tempfile
from pathlib import Path
from collections import Counter, defaultdict


# 日志格式: "2024-03-15 10:23:45 [INFO] 用户登录"
LOG_PATTERN = re.compile(
    r"^(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(\\w+)\\] (.+)$"
)


def generate_sample_log(path, num_lines=1000):
    """生成模拟日志"""
    import random
    levels = ["INFO", "INFO", "INFO", "WARN", "ERROR"]
    messages = [
        "用户登录",
        "请求 /api/users",
        "数据库查询完成",
        "内存使用率达 85%",
        "数据库连接失败",
        "权限不足",
    ]
    with path.open("w", encoding="utf-8") as f:
        for i in range(num_lines):
            hour = 9 + (i // 100) % 12
            minute = i % 60
            level = random.choice(levels)
            msg = random.choice(messages)
            f.write(f"2024-03-15 {hour:02d}:{minute:02d}:{i%60:02d} [{level}] {msg}\\n")


class LogAnalyzer:
    def __init__(self, log_path):
        self.log_path = Path(log_path)
        self.level_counter = Counter()
        self.hourly_counter = defaultdict(Counter)
        self.errors = []
        self.total_lines = 0
        self.parsed_lines = 0

    def parse(self):
        """解析日志"""
        with self.log_path.open("r", encoding="utf-8") as f:
            for line in f:
                self.total_lines += 1
                m = LOG_PATTERN.match(line.strip())
                if m:
                    self.parsed_lines += 1
                    timestamp, level, msg = m.groups()
                    self.level_counter[level] += 1
                    hour = timestamp[:13]
                    self.hourly_counter[hour][level] += 1
                    if level == "ERROR":
                        self.errors.append({"time": timestamp, "msg": msg})

    def report(self):
        """生成报告"""
        print(f"  解析率: {self.parsed_lines}/{self.total_lines} "
              f"({self.parsed_lines/self.total_lines*100:.1f}%)")
        print(f"\\n  === 级别统计 ===")
        for level, count in self.level_counter.most_common():
            pct = count / self.parsed_lines * 100
            print(f"    {level:8s}: {count:4d} ({pct:5.1f}%)")

        print(f"\\n  === 错误详情（前 5） ===")
        for err in self.errors[:5]:
            print(f"    [{err['time']}] {err['msg']}")

        print(f"\\n  === 每小时统计（Top 5） ===")
        for hour in sorted(self.hourly_counter)[:5]:
            c = self.hourly_counter[hour]
            print(f"    {hour}: INFO={c['INFO']:3d} "
                  f"WARN={c['WARN']:3d} ERROR={c['ERROR']:3d}")

    def to_json(self, path):
        """导出为 JSON"""
        report = {
            "total_lines": self.total_lines,
            "parsed_lines": self.parsed_lines,
            "level_stats": dict(self.level_counter),
            "errors": self.errors[:20],  # 前 20 个错误
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        return path


def main():
    base = Path(tempfile.mkdtemp(prefix="pf20_"))
    log_path = base / "app.log"
    generate_sample_log(log_path, 500)
    print(f"  生成日志: {log_path.name} ({log_path.stat().st_size} bytes)")

    analyzer = LogAnalyzer(log_path)
    analyzer.parse()
    analyzer.report()

    # 导出 JSON
    json_path = base / "report.json"
    analyzer.to_json(json_path)
    print(f"\\n  报告导出: {json_path.name} ({json_path.stat().st_size} bytes)")


if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第二十章 demo")
    print("=" * 50 + "\\n")
    main()
    print("\\n" + "=" * 50)
    print("总结：")
    print("• 日志分析 = 流式读 + 正则解析 + Counter")
    print("• 大文件必须流式处理（for line in f）")
    print("• 解析率: 解析成功/总行数")
    print("• 输出: 控制台 + JSON 报告")
    print("• defaultdict 让代码更简洁")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十一章：项目 2：照片整理器
  // =========================================================
  {
    id: "pf-21",
    group: "实战项目",
    icon: "📸",
    title: "项目 2：照片整理器",
    content: `## 一、项目目标

把杂乱的相机/手机照片按日期归档到子目录，并按时间顺序重新编号。

## 二、需求分析

| 步骤 | 描述 |
|------|------|
| 1. 扫描 | 找所有照片文件 |
| 2. 提取日期 | 从文件名（IMG_20240301_xxx.jpg）或修改时间 |
| 3. 分类 | 按日期建子目录 |
| 4. 移动 | 把照片移到对应目录 |
| 5. 编号 | 按时间排序重新命名 |

## 三、关键点

- **文件名日期**：相机照片通常含日期
- **EXIF 信息**：用 \`PIL\` 读拍摄时间（更准）
- **修改时间**：兜底方案
- **重复文件**：按内容 hash 去重

## 四、核心代码

\`\`\`python
import re
import shutil
from pathlib import Path
from collections import defaultdict

# 相机照片名格式
PHOTO_PATTERN = re.compile(
    r"(\\d{4})(\\d{2})(\\d{2})"  # YYYYMMDD
)

def organize_photos(src_dir, dst_dir):
    src = Path(src_dir)
    dst = Path(dst_dir)
    groups = defaultdict(list)

    # 1. 扫描 + 提取日期
    for f in src.glob("IMG_*.jpg"):
        m = PHOTO_PATTERN.search(f.name)
        if m:
            date_str = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        else:
            # 用修改时间
            import time
            t = time.gmtime(f.stat().st_mtime)
            date_str = time.strftime("%Y-%m-%d", t)
        groups[date_str].append(f)

    # 2. 按日期建子目录 + 移动
    for date, files in groups.items():
        target_dir = dst / date
        target_dir.mkdir(parents=True, exist_ok=True)
        # 3. 按时间排序编号
        files.sort(key=lambda p: p.stat().st_mtime)
        for i, f in enumerate(files, 1):
            new_name = f"IMG_{i:04d}.jpg"
            shutil.move(str(f), str(target_dir / new_name))
\`\`\`

## 五、扩展：去重

\`\`\`python
import hashlib

def file_hash(path, chunk_size=8192):
    h = hashlib.md5()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()
\`\`\`

## 六、本章 demo
下面 demo 实现完整的照片整理器。
`,
    code: `"""
第二十一章 demo：照片整理器
完整实现：
  - 扫描 + 提取日期
  - 按日期归档
  - 重新编号
  - 去重（可选）
"""

import re
import shutil
import hashlib
import tempfile
import time
from pathlib import Path
from collections import defaultdict


PHOTO_PATTERN = re.compile(r"(\\d{4})(\\d{2})(\\d{2})")
PHOTO_EXTS = {".jpg", ".jpeg", ".png", ".heic"}


class PhotoOrganizer:
    def __init__(self, src_dir, dst_dir, dedupe=False):
        self.src = Path(src_dir)
        self.dst = Path(dst_dir)
        self.dedupe = dedupe
        self.seen_hashes = set()
        self.stats = {
            "total": 0, "moved": 0, "duplicated": 0, "no_date": 0,
        }

    def get_date(self, photo_path):
        """从文件名或修改时间提取日期"""
        m = PHOTO_PATTERN.search(photo_path.name)
        if m:
            return f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
        # 兜底：用修改时间
        t = time.gmtime(photo_path.stat().st_mtime)
        return time.strftime("%Y-%m-%d", t)

    def get_hash(self, path):
        """计算文件 MD5"""
        h = hashlib.md5()
        with path.open("rb") as f:
            while True:
                chunk = f.read(8192)
                if not chunk:
                    break
                h.update(chunk)
        return h.hexdigest()

    def organize(self):
        # 1. 扫描所有照片
        groups = defaultdict(list)
        for f in self.src.iterdir():
            if f.is_file() and f.suffix.lower() in PHOTO_EXTS:
                self.stats["total"] += 1
                date_str = self.get_date(f)
                if not PHOTO_PATTERN.search(f.name):
                    self.stats["no_date"] += 1
                groups[date_str].append(f)

        # 2. 整理
        for date, files in sorted(groups.items()):
            target_dir = self.dst / date
            target_dir.mkdir(parents=True, exist_ok=True)

            # 按时间排序
            files.sort(key=lambda p: p.stat().st_mtime)

            for i, f in enumerate(files, 1):
                # 去重检查
                if self.dedupe:
                    h = self.get_hash(f)
                    if h in self.seen_hashes:
                        self.stats["duplicated"] += 1
                        continue
                    self.seen_hashes.add(h)

                # 移动并重命名
                new_name = f"photo_{i:04d}{f.suffix.lower()}"
                target = target_dir / new_name
                if not target.exists():
                    shutil.move(str(f), str(target))
                    self.stats["moved"] += 1

        return self.stats


def main():
    base = Path(tempfile.mkdtemp(prefix="pf21_"))
    src = base / "messy_photos"
    src.mkdir()

    # 模拟乱序的照片
    fake_photos = [
        "IMG_20240315_120000.jpg",
        "IMG_20240315_180000.jpg",
        "IMG_20240301_090000.jpg",
        "IMG_20240301_150000.jpg",
        "IMG_20240320_220000.jpg",
        "random_photo.jpg",  # 无日期
    ]
    for name in fake_photos:
        (src / name).write_bytes(b"fake jpg " + name.encode())

    print(f"  原始:")
    for p in sorted(src.iterdir()):
        print(f"    {p.name}")

    dst = base / "organized"
    organizer = PhotoOrganizer(src, dst, dedupe=False)
    stats = organizer.organize()

    print(f"\\n  整理结果:")
    print(f"    总照片: {stats['total']}")
    print(f"    已移动: {stats['moved']}")
    print(f"    无日期: {stats['no_date']}")
    print(f"\\n  整理后结构:")
    for d in sorted(dst.iterdir()):
        if d.is_dir():
            files = sorted(p.name for p in d.iterdir())
            print(f"    📁 {d.name}/: {files}")


if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第二十一章 demo")
    print("=" * 50 + "\\n")
    main()
    print("\\n" + "=" * 50)
    print("总结：")
    print("• 照片整理 = 扫描 + 提取日期 + 分类 + 编号")
    print("• 日期来源: 文件名 → EXIF → 修改时间")
    print("• 用 MD5 去重")
    print("• 按 mtime 排序，编号更符合时间线")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十二章：项目 3：配置中心
  // =========================================================
  {
    id: "pf-22",
    group: "实战项目",
    icon: "🎛️",
    title: "项目 3：配置中心",
    content: `## 一、项目目标

构建一个支持多源（默认 / 文件 / 环境变量 / 命令行）的配置加载器。

## 二、需求分析

| 配置源 | 优先级 |
|--------|--------|
| 默认值 | 最低 |
| 配置文件（JSON/YAML/TOML） | 中 |
| 环境变量 | 高 |
| 命令行参数 | 最高 |

后加载的覆盖前面的。

## 三、核心设计

\`\`\`python
class Config:
    def __init__(self, defaults=None):
        self._data = defaults or {}

    def load_file(self, path):
        # 读 JSON / YAML / TOML
        ...

    def load_env(self, prefix):
        # 从环境变量读
        ...

    def load_args(self, args):
        # 从命令行读
        ...

    def get(self, key, default=None):
        keys = key.split(".")
        value = self._data
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value
\`\`\`

## 四、配置 key 嵌套

用 \`.\` 分隔嵌套 key：
- \`db.host\` → \`{"db": {"host": "..."}}\`
- \`server.port\` → \`{"server": {"port": ...}}\`

## 五、类型转换

环境变量都是字符串，需要转换：
- \`"true"\` → \`True\`
- \`"42"\` → \`42\`
- \`"3.14"\` → \`3.14\`
- \`"a,b,c"\` → \`["a", "b", "c"]\`

## 六、本章 demo
下面 demo 实现完整的配置中心。
`,
    code: `"""
第二十二章 demo：配置中心
完整实现：
  - 多源加载（默认、文件、环境变量、命令行）
  - 优先级：后加载覆盖前加载
  - 支持嵌套 key（点号分隔）
  - 类型自动转换
"""

import os
import json
import argparse
import tempfile
from pathlib import Path


def auto_convert(s):
    """自动类型转换"""
    if s.lower() in ("true", "yes"):
        return True
    if s.lower() in ("false", "no"):
        return False
    if s.lower() in ("null", "none", ""):
        return None
    # 数字
    try:
        return int(s)
    except ValueError:
        pass
    try:
        return float(s)
    except ValueError:
        pass
    # 列表（逗号分隔）
    if "," in s:
        return [auto_convert(x.strip()) for x in s.split(",")]
    return s


class Config:
    def __init__(self, defaults=None):
        self._data = defaults or {}
        self.sources = []

    def load_file(self, path, format="json"):
        path = Path(path)
        if not path.exists():
            return self
        with path.open("r", encoding="utf-8") as f:
            content = f.read()
        if format == "json":
            data = json.loads(content)
        elif format == "yaml":
            try:
                import yaml
                data = yaml.safe_load(content)
            except ImportError:
                raise RuntimeError("需要 PyYAML")
        else:
            data = json.loads(content)  # fallback
        self._deep_update(self._data, data)
        self.sources.append(f"file:{path}")
        return self

    def load_env(self, prefix=""):
        """读环境变量（前缀匹配）"""
        for key, value in os.environ.items():
            if not key.startswith(prefix):
                continue
            config_key = key[len(prefix):].lower()
            self._set_nested(config_key, auto_convert(value))
            self.sources.append(f"env:{key}")
        return self

    def load_args(self, args):
        """从 argparse 读"""
        parser = argparse.ArgumentParser()
        parser.add_argument("--config", help="配置文件路径")
        for key in self._flatten_keys(self._data):
            parser.add_argument(f"--{key.replace(\".\", \"-\")}",
                                default=None, type=auto_convert)
        parsed = parser.parse_args(args)

        for key in self._flatten_keys(self._data):
            arg_name = key.replace(".", "-")
            value = getattr(parsed, arg_name.replace("-", "_"), None)
            if value is not None:
                self._set_nested(key, value)
                self.sources.append(f"arg:--{arg_name}")
        return self

    def get(self, key, default=None):
        keys = key.split(".")
        value = self._data
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        return value

    def _deep_update(self, base, override):
        for k, v in override.items():
            if k in base and isinstance(base[k], dict) and isinstance(v, dict):
                self._deep_update(base[k], v)
            else:
                base[k] = v

    def _set_nested(self, key, value):
        keys = key.split(".")
        d = self._data
        for k in keys[:-1]:
            if k not in d:
                d[k] = {}
            d = d[k]
        d[keys[-1]] = value

    def _flatten_keys(self, d, prefix=""):
        keys = []
        for k, v in d.items():
            full_key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                keys.extend(self._flatten_keys(v, full_key))
            else:
                keys.append(full_key)
        return keys

    def __repr__(self):
        return f"Config({self._data!r})"


def main():
    base = Path(tempfile.mkdtemp(prefix="pf22_"))

    # 1. 默认配置
    defaults = {
        "app": {"name": "MyApp", "debug": False, "version": "1.0"},
        "db": {"host": "localhost", "port": 5432, "user": "admin"},
        "log_level": "INFO",
    }
    config = Config(defaults)
    print("  === 阶段 1: 默认 ===")
    print(f"    app.name: {config.get('app.name')}")
    print(f"    db.host: {config.get('db.host')}")
    print(f"    db.port: {config.get('db.port')}")

    # 2. 配置文件
    config_file = base / "config.json"
    config_file.write_text(json.dumps({
        "app": {"debug": True},
        "db": {"host": "prod-db.example.com", "port": 5433},
        "log_level": "DEBUG",
    }, ensure_ascii=False), encoding="utf-8")
    config.load_file(config_file)
    print(f"\\n  === 阶段 2: 加载文件 ===")
    print(f"    app.debug: {config.get('app.debug')}（文件覆盖）")
    print(f"    db.host: {config.get('db.host')}（文件覆盖）")
    print(f"    db.user: {config.get('db.user')}（默认保留）")

    # 3. 环境变量
    os.environ["DB_HOST"] = "env-db.example.com"
    os.environ["DB_PORT"] = "3306"
    os.environ["LOG_LEVEL"] = "WARNING"
    config.load_env()
    print(f"\\n  === 阶段 3: 环境变量 ===")
    print(f"    db.host: {config.get('db.host')}（env 覆盖）")
    print(f"    db.port: {config.get('db.port')}（env 覆盖）")
    print(f"    log_level: {config.get('log_level')}（env 覆盖）")

    # 4. 命令行
    config.load_args(["--app-name", "MyAppCLI", "--db-port", "9999"])
    print(f"\\n  === 阶段 4: 命令行 ===")
    print(f"    app.name: {config.get('app.name')}（CLI 覆盖）")
    print(f"    db.port: {config.get('db.port')}（CLI 覆盖）")

    # 5. 来源追踪
    print(f"\\n  === 加载来源（按顺序） ===")
    for s in config.sources:
        print(f"    {s}")


if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第二十二章 demo")
    print("=" * 50 + "\\n")
    main()
    print("\\n" + "=" * 50)
    print("总结：")
    print("• 多源配置：默认 → 文件 → 环境变量 → 命令行")
    print("• 嵌套 key 用点号分隔")
    print("• 环境变量自动类型转换")
    print("• 12-factor app 原则")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十三章：项目 4：简易文件备份工具
  // =========================================================
  {
    id: "pf-23",
    group: "实战项目",
    icon: "💾",
    title: "项目 4：简易文件备份工具",
    content: `## 一、项目目标

实现一个支持增量备份的小工具。

## 二、需求分析

| 功能 | 描述 |
|------|------|
| 全量备份 | 第一次全复制 |
| 增量备份 | 只复制修改过的文件 |
| 备份元数据 | 记录每个文件的大小、时间、hash |
| 还原 | 从备份还原到原位置 |

## 三、设计

- 用 \`zipfile\` 把每次备份打成 .zip
- 用 JSON 记录元数据
- 增量：比较 hash，相同则跳过

## 四、核心代码

\`\`\`python
import zipfile
import json
import hashlib
from pathlib import Path

def get_file_hash(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def incremental_backup(src_dir, backup_path, manifest_path):
    src = Path(src_dir)
    manifest = {}
    if Path(manifest_path).exists():
        with open(manifest_path, "r") as f:
            manifest = json.load(f)

    new_manifest = {}
    with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in src.rglob("*"):
            if f.is_file():
                h = get_file_hash(f)
                new_manifest[str(f.relative_to(src))] = {
                    "hash": h, "size": f.stat().st_size
                }
                # 增量：跳过未修改的
                rel = str(f.relative_to(src))
                if rel in manifest and manifest[rel]["hash"] == h:
                    continue
                zf.write(f, rel)

    with open(manifest_path, "w") as f:
        json.dump(new_manifest, f, indent=2)
\`\`\`

## 五、还原

\`\`\`python
def restore(backup_path, dst_dir):
    Path(dst_dir).mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(backup_path, "r") as zf:
        zf.extractall(dst_dir)
\`\`\`

## 六、本章 demo
下面 demo 实现完整的备份工具。
`,
    code: `"""
第二十三章 demo：简易文件备份工具
完整实现：
  - 全量 / 增量备份
  - 哈希去重
  - 备份清单（manifest）
  - 还原
"""

import json
import shutil
import zipfile
import hashlib
import tempfile
import time
from pathlib import Path


def get_file_hash(path, chunk_size=8192):
    """计算文件 MD5"""
    h = hashlib.md5()
    with path.open("rb") as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()


class BackupTool:
    def __init__(self, src_dir, backup_dir):
        self.src = Path(src_dir)
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.manifest_path = self.backup_dir / "manifest.json"
        self.manifest = self._load_manifest()

    def _load_manifest(self):
        if self.manifest_path.exists():
            with self.manifest_path.open("r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _save_manifest(self):
        with self.manifest_path.open("w", encoding="utf-8") as f:
            json.dump(self.manifest, f, ensure_ascii=False, indent=2)

    def backup(self, label=None):
        """增量备份"""
        if label is None:
            label = time.strftime("%Y%m%d_%H%M%S")
        backup_path = self.backup_dir / f"backup_{label}.zip"
        new_manifest = {}
        copied = 0
        skipped = 0

        with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in self.src.rglob("*"):
                if f.is_file():
                    rel = str(f.relative_to(self.src))
                    h = get_file_hash(f)
                    new_manifest[rel] = {
                        "hash": h, "size": f.stat().st_size
                    }
                    # 增量：未变则跳过
                    if rel in self.manifest and self.manifest[rel]["hash"] == h:
                        skipped += 1
                        continue
                    zf.write(f, rel)
                    copied += 1

        self.manifest = new_manifest
        self._save_manifest()
        return {
            "path": str(backup_path),
            "size": backup_path.stat().st_size,
            "copied": copied,
            "skipped": skipped,
        }

    def restore(self, backup_name, dst_dir):
        """从备份还原"""
        backup_path = self.backup_dir / backup_name
        if not backup_path.exists():
            return None
        dst = Path(dst_dir)
        dst.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(backup_path, "r") as zf:
            zf.extractall(dst)
        return dst


def main():
    base = Path(tempfile.mkdtemp(prefix="pf23_"))

    # 创建工作目录
    work = base / "work"
    work.mkdir()
    (work / "a.txt").write_text("A")
    (work / "b.txt").write_text("B")
    (work / "sub").mkdir()
    (work / "sub" / "c.txt").write_text("C")

    backup_dir = base / "backups"
    tool = BackupTool(work, backup_dir)

    # 第 1 次备份（全量）
    print("  === 第 1 次备份 ===")
    r = tool.backup("first")
    print(f"    备份: {Path(r['path']).name} ({r['size']} bytes)")
    print(f"    复制: {r['copied']} 跳过: {r['skipped']}")

    # 修改一个文件
    (work / "a.txt").write_text("A_MODIFIED")
    time.sleep(1.1)  # 确保 mtime 改变

    # 第 2 次备份（增量）
    print("\\n  === 第 2 次备份（增量）===")
    r = tool.backup("second")
    print(f"    备份: {Path(r['path']).name} ({r['size']} bytes)")
    print(f"    复制: {r['copied']}（只复制修改的） 跳过: {r['skipped']}")

    # 不修改任何文件
    time.sleep(1.1)

    # 第 3 次备份（无变化）
    print("\\n  === 第 3 次备份（无变化） ===")
    r = tool.backup("third")
    print(f"    备份: {Path(r['path']).name} ({r['size']} bytes)")
    print(f"    复制: {r['copied']} 跳过: {r['skipped']}")

    # 添加新文件
    (work / "d.txt").write_text("D_NEW")
    print("\\n  === 第 4 次备份（新增文件）===")
    r = tool.backup("fourth")
    print(f"    备份: {Path(r['path']).name} ({r['size']} bytes)")
    print(f"    复制: {r['copied']} 跳过: {r['skipped']}")

    # 列出所有备份
    print(f"\\n  === 备份列表 ===")
    for f in sorted(backup_dir.glob("*.zip")):
        print(f"    {f.name} ({f.stat().st_size} bytes)")

    # 还原测试
    print(f"\\n  === 还原第 1 次备份 ===")
    restore_dir = base / "restored"
    tool.restore("backup_first.zip", restore_dir)
    files = sorted(p.name for p in restore_dir.rglob("*") if p.is_file())
    print(f"    还原文件: {files}")


if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第二十三章 demo")
    print("=" * 50 + "\\n")
    main()
    print("\\n" + "=" * 50)
    print("总结：")
    print("• 增量备份: 用 hash 跳过未变文件")
    print("• 备份用 zip 压缩 + manifest 记录")
    print("• 还原: zipfile.extractall")
    print("• 生产环境用 rsync / restic / borg")
    print("=" * 50)
`,
  },

  // =========================================================
  // 第二十四章：常见错误与最佳实践
  // =========================================================
  {
    id: "pf-24",
    group: "实战项目",
    icon: "🚧",
    title: "常见错误与最佳实践",
    content: `## 一、10 个最常见错误

### 1. 忘 close()
\`\`\`python
# ❌
f = open("a.txt", "w")
f.write("hi")
# 忘了 close()

# ✅
with open("a.txt", "w") as f:
    f.write("hi")
\`\`\`

### 2. 路径硬编码
\`\`\`python
# ❌
path = "/tmp/data.txt"

# ✅
from pathlib import Path
import tempfile
path = Path(tempfile.gettempdir()) / "data.txt"
\`\`\`

### 3. 不指定 encoding
\`\`\`python
# ❌ 依赖系统默认
with open("a.txt") as f:
    ...

# ✅ 显式指定
with open("a.txt", encoding="utf-8") as f:
    ...
\`\`\`

### 4. 一次 read() 大文件
\`\`\`python
# ❌ 1GB 全加载
data = open("big.log").read()

# ✅ 流式读
with open("big.log") as f:
    for line in f:
        process(line)
\`\`\`

### 5. 拼字符串路径
\`\`\`python
# ❌
path = "data" + "/" + "file.txt"

# ✅
from pathlib import Path
path = Path("data") / "file.txt"
\`\`\`

### 6. 没判断存在就操作
\`\`\`python
# ❌
os.remove("file.txt")  # 不存在就崩

# ✅
from pathlib import Path
Path("file.txt").unlink(missing_ok=True)
\`\`\`

### 7. 删非空目录
\`\`\`python
# ❌
os.rmdir("non_empty")  # 报错

# ✅
import shutil
shutil.rmtree("non_empty")
\`\`\`

### 8. 没处理异常
\`\`\`python
# ❌
with open("file.txt") as f:
    data = f.read()
# 假设文件一定存在

# ✅
from pathlib import Path
path = Path("file.txt")
if path.exists():
    data = path.read_text(encoding="utf-8")
else:
    data = ""
\`\`\`

### 9. 用 os.system 删文件
\`\`\`python
# ❌ 路径含空格会出错
os.system(f"rm {filename}")

# ✅
from pathlib import Path
Path(filename).unlink()
\`\`\`

### 10. 跨平台不一致
\`\`\`python
# ❌ Windows 路径用 \\\\, macOS 用 /
# 不同平台路径字符串差异大

# ✅ 用 pathlib，跨平台
from pathlib import Path
p = Path("data") / "2024" / "report.csv"  # 跨平台
\`\`\`

## 二、12 条最佳实践

1. **永远用 \`with open()\`**
2. **永远显式 \`encoding="utf-8"\`**
3. **永远用 \`pathlib\` 代替字符串拼接**
4. **大文件用 \`for line in f\`**
5. **临时文件用 \`tempfile\` 模块**
6. **删除用 \`unlink(missing_ok=True)\`**
7. **重要操作前先备份**
8. **配置文件用 YAML/JSON**
9. **跨进程用文件锁**
10. **路径用 \`__file__\` 定位**
11. **不要硬编码 \`/tmp\`**
12. **日志带时间戳和级别**

## 三、5 个安全提示

1. **永远不要执行 \`rm -rf\`**：用 pathlib
2. **删除前确认**：用 dry-run 模式
3. **敏感文件用 0o600 权限**
4. **不要把密码写进代码或配置**
5. **备份 3-2-1 原则**：3 份、2 种介质、1 份异地

## 四、跨平台注意事项

| 问题 | 解决 |
|------|------|
| 路径分隔符 | 用 \`pathlib.Path / Path\` |
| 临时目录 | 用 \`tempfile.gettempdir()\` |
| 换行符 | 文本模式自动处理 |
| 文件编码 | 显式指定 utf-8 |
| 用户主目录 | 用 \`Path.home()\` |
| 行尾空格 | \`Path("a.txt").read_text().rstrip() + "\\n"\` |

## 五、本章 demo
下面 demo 展示常见错误的正确写法。
`,
    code: `"""
第二十四章 demo：常见错误与最佳实践
演示：
  1. 10 个常见错误 + 正确写法
  2. 文件操作 checklist
  3. 跨平台一致性测试
  4. 实战：写一个安全的工具函数库
"""

import os
import sys
import json
import tempfile
import platform
from pathlib import Path


def demo_top_10_mistakes():
    print("=== 10 个常见错误 ===\\n")

    # 1. 忘 close
    print("  1. 忘 close → 用 with open")
    print("     ❌  f = open(); f.write(); # 忘 close")
    print("     ✅  with open() as f: f.write()\\n")

    # 2. 硬编码路径
    print("  2. 硬编码路径 → 用 pathlib / tempfile")
    print("     ❌  /tmp/data.txt")
    print(f"     ✅  Path(tempfile.gettempdir()) / 'data.txt'\\n")

    # 3. 不指定 encoding
    print("  3. 不指定 encoding → 显式 utf-8")
    print("     ❌  open('a.txt')")
    print("     ✅  open('a.txt', encoding='utf-8')\\n")

    # 4. read() 大文件
    print("  4. read() 大文件 → 流式读")
    print("     ❌  data = f.read()")
    print("     ✅  for line in f\\n")

    # 5. 拼字符串
    print("  5. 拼字符串路径 → pathlib /")
    print("     ❌  'data/' + name")
    print("     ✅  Path('data') / name\\n")

    # 6. 没判断存在
    print("  6. 删不存在的文件 → missing_ok")
    print("     ❌  Path('a.txt').unlink()")
    print("     ✅  Path('a.txt').unlink(missing_ok=True)\\n")

    # 7. 删非空目录
    print("  7. 删非空目录 → rmtree")
    print("     ❌  os.rmdir('non_empty')")
    print("     ✅  shutil.rmtree('non_empty')\\n")

    # 8. 异常没处理
    print("  8. 异常没处理 → try/except")
    print("     ❌  open('a.txt')")
    print("     ✅  try: open(...) except FileNotFoundError\\n")

    # 9. os.system
    print("  9. os.system 删文件 → pathlib")
    print("     ❌  os.system(f'rm {file}')")
    print("     ✅  Path(file).unlink()\\n")

    # 10. 跨平台不一致
    print("  10. 跨平台不一致 → pathlib")
    print("      ❌ 字符串拼接 / vs \\\\\\\\")
    print("      ✅ Path() / Path()")


def demo_safe_file_lib():
    print("\\n=== 安全文件操作工具库 ===\\n")

    class SafeFile:
        @staticmethod
        def read_text(path, default=""):
            """安全读文本"""
            p = Path(path)
            if not p.exists():
                return default
            try:
                return p.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError) as e:
                print(f"    警告: {e}")
                return default

        @staticmethod
        def write_text(path, content):
            """安全写文本（自动建父目录）"""
            p = Path(path)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(content, encoding="utf-8")
            return p

        @staticmethod
        def safe_delete(path):
            """安全删除"""
            p = Path(path)
            if p.is_file():
                p.unlink(missing_ok=True)
                return True
            elif p.is_dir():
                import shutil
                shutil.rmtree(p, ignore_errors=True)
                return True
            return False

        @staticmethod
        def read_json(path, default=None):
            """安全读 JSON"""
            text = SafeFile.read_text(path)
            if not text:
                return default if default is not None else {}
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                return default if default is not None else {}

        @staticmethod
        def write_json(path, data, indent=2):
            """安全写 JSON"""
            text = json.dumps(data, ensure_ascii=False, indent=indent)
            return SafeFile.write_text(path, text)

    # 测试
    base = Path(tempfile.mkdtemp(prefix="pf24_"))
    config = base / "config.json"

    # 读不存在的文件 → 默认值
    cfg = SafeFile.read_json(config, default={"default": True})
    print(f"  读不存在: {cfg}")

    # 写
    SafeFile.write_json(config, {"app": "demo", "version": "1.0"})
    print(f"  写入: {config.name} ({config.stat().st_size} bytes)")

    # 读
    cfg = SafeFile.read_json(config)
    print(f"  读回: {cfg}")

    # 安全删除
    SafeFile.safe_delete(config)
    print(f"  删除后存在: {config.exists()}")


def demo_cross_platform_check():
    print("\\n=== 跨平台一致性检查 ===\\n")
    print(f"  平台: {platform.system()} {platform.release()}")
    print(f"  Python: {sys.version.split()[0]}")
    print(f"  os.sep: {os.sep!r}")
    print(f"  Path.cwd(): {Path.cwd()}")
    print(f"  Path.home(): {Path.home()}")
    print(f"  tempfile.gettempdir(): {tempfile.gettempdir()}")

    # pathlib 路径一致
    p1 = Path("data") / "2024" / "file.txt"
    p2 = Path("data/2024/file.txt")
    print(f"\\n  Path('data') / '2024' / 'file.txt': {p1}")
    print(f"  Path('data/2024/file.txt'):         {p2}")
    print(f"  跨平台等价: {str(p1) == str(p2)}")


def demo_checklist():
    print("\\n=== 文件操作 Checklist ===\\n")
    checklist = [
        "✅ 用 with open() 代替裸 open",
        "✅ 显式指定 encoding='utf-8'",
        "✅ 用 pathlib 而不是字符串拼接",
        "✅ 大文件用 for line in f",
        "✅ 临时文件用 tempfile",
        "✅ 删文件用 unlink(missing_ok=True)",
        "✅ 删非空目录用 shutil.rmtree",
        "✅ 路径用 __file__ 定位脚本",
        "✅ 配置文件用 JSON / YAML / TOML",
        "✅ 多进程访问用文件锁",
        "✅ 不要硬编码 /tmp",
        "✅ 重要操作先备份",
    ]
    for item in checklist:
        print(f"  {item}")


# ===== 主程序 =====
if __name__ == "__main__":
    print("=" * 50)
    print("Python 文件管理教程 — 第二十四章 demo")
    print("=" * 50 + "\\n")

    demo_top_10_mistakes()
    demo_safe_file_lib()
    demo_cross_platform_check()
    demo_checklist()

    print("\\n" + "=" * 50)
    print("🎉 教程完结！你已经掌握了 Python 文件管理的核心。")
    print("\\n下一步建议：")
    print("  • 实际项目中练习 pathlib")
    print("  • 读 openpyxl / watchdog 官方文档")
    print("  • 学 Pandas 处理大 CSV")
    print("  • 学 asyncio 做异步 IO")
    print("=" * 50)
`,
  },
];
