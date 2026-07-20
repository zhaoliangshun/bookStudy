// =============================================================
// 《Python工作实战手册》—— 第四批 · 文件操作与异常处理
// -------------------------------------------------------------
// 第四篇：与外界打交道，覆盖文件读写、CSV/JSON处理、异常处理、路径操作、序列化
// 每章含：讲解（Markdown，内嵌Python代码块）+ 可复制代码（code字段）
// 代码要求：
//   - 多demo、多注释（中文注释，解释每一行/每一段的作用，解释"为什么"）
//   - 贴近真实工作场景（日志处理、配置文件、报表导入导出、API数据处理）
//   - 避免使用input()等交互式输入，所有数据硬编码
//   - 文件操作使用tempfile临时目录，演示安全路径操作
//   - 变量名有意义（log_file_path、config_parser、csv_writer等）
//   - 包含main()函数和if __name__ == "__main__"入口
// =============================================================

export const chapters = [
  {
    id: "py-files-read",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "📂",
    title: "文件读取：读文本和数据",
    content: `## 文件读取：读文本和数据

工作中每天都要读文件：读日志排查问题、读配置加载参数、读CSV导入数据。文件读取是最基础也最容易踩坑的操作。

### open()函数与with语句

**必须养成使用with语句的习惯**——它是上下文管理器，用完自动关闭文件，避免资源泄漏。

\`\`\`python
# ❌ 不推荐：手动open/close，忘记close会导致资源泄漏
f = open("log.txt", "r", encoding="utf-8")
content = f.read()
f.close()  # 如果中间报错，这行可能执行不到！

# ✅ 推荐：with语句，无论是否异常都会自动关闭文件
with open("log.txt", "r", encoding="utf-8") as f:
    content = f.read()
# 出了with块，文件已经自动关闭
\`\`\`

### 文件读取的三种方式

\`\`\`python
# 方式1：read()读全部内容（适合小文件）
with open("config.txt", "r", encoding="utf-8") as f:
    all_content = f.read()

# 方式2：readline()读一行（需要逐行控制时用）
with open("log.txt", "r", encoding="utf-8") as f:
    first_line = f.readline()

# 方式3：readlines()读所有行，返回列表
with open("data.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()

# 方式4（推荐）：直接遍历文件对象（大文件首选，内存友好）
with open("large_log.txt", "r", encoding="utf-8") as f:
    for line_num, line in enumerate(f, 1):
        print(f"第{line_num}行: {line.strip()}")
\`\`\`

### 文件模式详解

| 模式 | 说明 | 注意事项 |
|------|------|----------|
| r | 只读（默认） | 文件必须存在，否则报错 |
| rb | 二进制只读 | 读图片、视频等非文本文件 |
| w | 只写 | **会清空原有内容！** |
| a | 追加 | 指针在末尾，不会清空 |

### 编码问题——中文乱码的根源

**大坑：Windows默认编码是gbk，Mac/Linux默认是utf-8。**

\`\`\`python
# ✅ 工作中读文本文件，永远显式指定encoding="utf-8"
with open("中文文件.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 处理Windows导出的带BOM的文件，用utf-8-sig
with open("excel_export.csv", "r", encoding="utf-8-sig") as f:
    content = f.read()
\`\`\`

### pathlib.Path（Python 3.4+ 推荐）

\`\`\`python
from pathlib import Path

log_path = Path("logs/app.log")
if log_path.exists():
    content = log_path.read_text(encoding="utf-8")
    print(f"文件名: {log_path.name}, 后缀: {log_path.suffix}")
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第一章 demo：文件读取实战
演示：with语句、多种读取方式、编码处理、pathlib路径操作
工作场景：读取应用日志文件，统计错误信息
注意：使用tempfile创建临时目录，不会污染真实文件系统
"""
import os
import tempfile
from pathlib import Path


def demo_basic_read(temp_dir):
    """演示：基础文件读取"""
    print("=" * 60)
    print("1. 基础文件读取演示")
    print("=" * 60)

    log_file = temp_dir / "app.log"
    log_content = """2025-01-15 09:00:01 INFO  应用启动成功
2025-01-15 09:00:02 INFO  数据库连接成功
2025-01-15 09:01:15 ERROR 数据库查询失败: timeout
2025-01-15 09:02:30 INFO  用户登录: user001
2025-01-15 09:03:45 ERROR 空指针异常: NoneType
2025-01-15 09:05:00 WARN  内存使用率超过80%
"""
    log_file.write_text(log_content, encoding="utf-8")
    print(f"已创建演示日志文件: {log_file}")

    print("\\n--- read()读全部内容 ---")
    with open(log_file, "r", encoding="utf-8") as f:
        all_content = f.read()
    print(f"文件总长度: {len(all_content)} 字符")

    print("\\n--- readlines()读所有行 ---")
    with open(log_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
    print(f"总行数: {len(lines)}")

    print("\\n--- 逐行遍历（大文件推荐）---")
    error_count = 0
    with open(log_file, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            if "ERROR" in line:
                error_count += 1
                print(f"  [错误{error_count}] 第{line_num}行: {line.strip()}")
    print(f"共发现 {error_count} 条ERROR日志")


def demo_encoding_issues(temp_dir):
    """演示：编码问题与解决方法"""
    print("\\n" + "=" * 60)
    print("2. 编码问题演示（中文乱码的根源）")
    print("=" * 60)

    chinese_file = temp_dir / "中文文件.txt"
    chinese_content = "这是中文内容\\n第二行：你好，世界！"
    chinese_file.write_text(chinese_content, encoding="utf-8")

    print("\\n--- 使用utf-8编码读取 ---")
    with open(chinese_file, "r", encoding="utf-8") as f:
        content = f.read()
    print(content)

    print("\\n--- pathlib.read_text()快捷读取 ---")
    content2 = chinese_file.read_text(encoding="utf-8")
    print(f"读取成功，长度: {len(content2)} 字符")


def demo_path_operations(temp_dir):
    """演示：路径操作"""
    print("\\n" + "=" * 60)
    print("3. 路径操作演示")
    print("=" * 60)

    print(f"当前工作目录: {os.getcwd()}")
    script_dir = Path(__file__).parent
    print(f"脚本所在目录: {script_dir}")

    config_path = temp_dir / "config" / "settings.ini"
    print(f"\\n目标配置文件: {config_path}")
    print(f"  父目录: {config_path.parent}")
    print(f"  文件名: {config_path.name}")
    print(f"  后缀: {config_path.suffix}")
    print(f"  是否存在: {config_path.exists()}")

    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text("[database]\\nhost=localhost\\nport=3306", encoding="utf-8")
    print(f"\\n创建后是否存在: {config_path.exists()}")


def demo_work_scenario():
    """工作场景：日志错误统计"""
    print("\\n" + "=" * 60)
    print("4. 工作场景：日志错误统计")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)

        log_file = temp_dir / "application.log"
        log_lines = [
            "2025-01-15 08:30:00 INFO  服务启动",
            "2025-01-15 09:15:22 ERROR 连接Redis失败",
            "2025-01-15 10:00:00 ERROR 数据库查询超时",
            "2025-01-15 10:05:30 WARN  CPU使用率过高",
            "2025-01-15 11:00:00 ERROR 用户认证失败",
        ]
        log_file.write_text("\\n".join(log_lines), encoding="utf-8")

        error_logs = []
        warning_count = 0
        with open(log_file, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                if "ERROR" in line:
                    error_logs.append((line_num, line.strip()))
                elif "WARN" in line:
                    warning_count += 1

        print(f"ERROR数量: {len(error_logs)}")
        print(f"WARN数量: {warning_count}")
        for line_num, log_line in error_logs:
            print(f"  行{line_num}: {log_line}")


def main():
    """主函数：依次执行各个演示"""
    print("文件读取实战演示")

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        demo_basic_read(temp_dir)
        demo_encoding_issues(temp_dir)
        demo_path_operations(temp_dir)

    demo_work_scenario()

    print("\\n" + "=" * 60)
    print("所有演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-files-write",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "✍️",
    title: "文件写入：保存数据",
    content: `## 文件写入：保存数据

写文件最大的坑是w模式会清空原文件！日志文件必须用a模式追加。

### 文件写入模式

| 模式 | 清空原内容 | 指针位置 | 说明 |
|------|-----------|---------|------|
| w | ✅ 会清空 | 开头 | 覆盖写，文件不存在则创建 |
| a | ❌ 追加 | 末尾 | 追加写，日志用这个！ |
| wb | ✅ 会清空 | 开头 | 二进制写 |

\`\`\`python
# ✅ 写日志用a（追加）模式
with open("app.log", "a", encoding="utf-8") as f:
    f.write("日志内容\\n")

# ❌ 错误：用w模式写日志会清空历史！
\`\`\`

### 创建目录

写文件前要确保目录存在：

\`\`\`python
from pathlib import Path

log_dir = Path("logs/2025/01")
log_dir.mkdir(parents=True, exist_ok=True)  # parents=True创建多级目录
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第二章 demo：文件写入实战
演示：w/a模式区别、创建目录、pathlib写入
工作场景：写日志、生成报表
"""
import tempfile
from datetime import datetime
from pathlib import Path


def demo_write_modes(temp_dir):
    """演示：w模式与a模式的区别"""
    print("=" * 60)
    print("1. w模式（覆盖）vs a模式（追加）")
    print("=" * 60)

    test_file = temp_dir / "write_test.txt"

    print("\\n--- 第一次w写入 ---")
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("第一行内容\\n")
    print(test_file.read_text(encoding="utf-8"))

    print("\\n--- 第二次w写入（原内容被清空！）---")
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("第二次写入，之前的内容没了！\\n")
    print(test_file.read_text(encoding="utf-8"))

    print("\\n--- a模式追加（不会清空）---")
    with open(test_file, "a", encoding="utf-8") as f:
        f.write("a追加的第一行\\n")
        f.write("a追加的第二行\\n")
    print(test_file.read_text(encoding="utf-8"))

    print("⚠️  重要提醒：日志一定要用a模式！")


def demo_create_directories(temp_dir):
    """演示：创建目录"""
    print("\\n" + "=" * 60)
    print("2. 创建目录：Path.mkdir")
    print("=" * 60)

    nested_log_path = temp_dir / "logs" / "2025" / "01" / "app.log"
    print(f"目标路径: {nested_log_path}")
    print(f"目录是否存在: {nested_log_path.parent.exists()}")

    nested_log_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"创建后是否存在: {nested_log_path.parent.exists()}")

    log_message = f"[{datetime.now()}] INFO  应用启动\\n"
    with open(nested_log_path, "a", encoding="utf-8") as f:
        f.write(log_message)
    print(f"日志已写入")


def demo_work_scenario():
    """工作场景：日志记录 + 生成报表"""
    print("\\n" + "=" * 60)
    print("3. 工作场景：日志记录 + 薪资报表")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)

        print("\\n--- 应用日志记录（a模式）---")
        log_dir = temp_dir / "app_logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / f"app_{datetime.now().strftime('%Y%m%d')}.log"

        log_messages = [
            ("INFO", "应用启动"),
            ("INFO", "数据库连接成功"),
            ("WARN", "debug_mode已启用"),
            ("ERROR", "处理用户数据异常"),
        ]

        for level, msg in log_messages:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(f"[{timestamp}] {level:5s} {msg}\\n")

        print(log_file.read_text(encoding="utf-8"))

        print("\\n--- 生成薪资报表（w模式）---")
        report_dir = temp_dir / "reports"
        report_dir.mkdir(parents=True, exist_ok=True)
        salary_report = report_dir / "salary_report.txt"

        employees = [
            {"name": "张三", "dept": "技术部", "base": 15000, "bonus": 5000},
            {"name": "李四", "dept": "产品部", "base": 18000, "bonus": 3000},
        ]

        report_lines = [
            "员工薪资报表",
            f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "-" * 40,
        ]
        total = 0
        for emp in employees:
            emp_total = emp["base"] + emp["bonus"]
            total += emp_total
            report_lines.append(f"{emp['name']}: {emp['dept']} - {emp_total}元")
        report_lines.append(f"总计: {total}元")

        salary_report.write_text("\\n".join(report_lines), encoding="utf-8")
        print(salary_report.read_text(encoding="utf-8"))


def main():
    print("文件写入实战演示")

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        demo_write_modes(temp_dir)
        demo_create_directories(temp_dir)

    demo_work_scenario()

    print("\\n" + "=" * 60)
    print("所有演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-csv",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "📊",
    title: "CSV文件处理（工作极常用）",
    content: `## CSV文件处理（工作极常用）

CSV是最常用的数据交换格式。DictReader/DictWriter按字段名访问，不用记列顺序，工作中最常用。

**大坑：**
1. 打开CSV必须加newline=""（Windows下会多空行）
2. Excel打开的CSV用utf-8-sig编码（带BOM）

\`\`\`python
import csv

# DictReader（推荐）
with open("data.csv", "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["姓名"], row["部门"])  # 按字段名访问

# DictWriter（推荐）
with open("out.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["姓名", "部门"])
    writer.writeheader()
    writer.writerow({"姓名": "张三", "部门": "技术部"})
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第三章 demo：CSV文件处理实战
演示：DictReader/DictWriter、newline坑、utf-8-sig编码
工作场景：员工数据导入导出、销售报表处理
"""
import csv
import tempfile
from datetime import datetime
from pathlib import Path


def demo_dict_reader_writer(temp_dir):
    """演示：DictReader/DictWriter（推荐！）"""
    print("=" * 60)
    print("1. DictReader/DictWriter（按字段名访问）")
    print("=" * 60)

    sales_csv = temp_dir / "sales.csv"
    fieldnames = ["订单号", "日期", "产品", "数量", "金额"]

    sales_records = [
        {"订单号": "SO001", "日期": "2025-01-15", "产品": "笔记本", "数量": "2", "金额": "11998"},
        {"订单号": "SO002", "日期": "2025-01-15", "产品": "鼠标", "数量": "5", "金额": "495"},
        {"订单号": "SO003", "日期": "2025-01-16", "产品": "键盘", "数量": "3", "金额": "1197"},
    ]

    with open(sales_csv, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(sales_records)
    print(f"销售报表已写入")

    print("\\n--- 读取销售数据 ---")
    total_amount = 0
    with open(sales_csv, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            amount = int(row["金额"])
            total_amount += amount
            print(f"  订单{row['订单号']}: {row['产品']} x{row['数量']} = {amount}元")

    print(f"\\n销售总金额: {total_amount}元")


def demo_newline_encoding():
    """演示：newline和编码注意事项"""
    print("\\n" + "=" * 60)
    print("2. 大坑提醒：newline和编码")
    print("=" * 60)
    print("""
⚠️  1. 打开CSV必须加newline=""
   Windows下不加会多空行，Python文档明确要求

⚠️  2. 给Excel打开用utf-8-sig
   utf-8-sig带BOM，Excel能识别中文；程序间处理用utf-8

✅ 标准写法：
with open("data.csv", "w", encoding="utf-8-sig", newline="") as f:
    writer = csv.writer(f)
""")


def demo_work_scenario():
    """工作场景：员工数据统计"""
    print("\\n" + "=" * 60)
    print("3. 工作场景：员工薪资统计")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)

        hr_csv = temp_dir / "hr_employees.csv"
        fieldnames = ["工号", "姓名", "部门", "基本工资", "绩效奖金"]
        employees = [
            {"工号": "E001", "姓名": "张三", "部门": "技术部", "基本工资": "20000", "绩效奖金": "5000"},
            {"工号": "E002", "姓名": "李四", "部门": "技术部", "基本工资": "15000", "绩效奖金": "3000"},
            {"工号": "E003", "姓名": "王五", "部门": "产品部", "基本工资": "18000", "绩效奖金": "4000"},
            {"工号": "E004", "姓名": "赵六", "部门": "技术部", "基本工资": "30000", "绩效奖金": "10000"},
        ]

        with open(hr_csv, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(employees)

        dept_stats = {}
        with open(hr_csv, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                dept = row["部门"]
                total = int(row["基本工资"]) + int(row["绩效奖金"])
                if dept not in dept_stats:
                    dept_stats[dept] = {"人数": 0, "总额": 0}
                dept_stats[dept]["人数"] += 1
                dept_stats[dept]["总额"] += total

        print("\\n部门薪资统计:")
        for dept, stats in dept_stats.items():
            avg = stats["总额"] // stats["人数"]
            print(f"  {dept}: {stats['人数']}人, 总计{stats['总额']}元, 平均{avg}元")


def main():
    print("CSV文件处理实战演示")

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        demo_dict_reader_writer(temp_dir)

    demo_newline_encoding()
    demo_work_scenario()

    print("\\n" + "=" * 60)
    print("所有演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-json",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "🔗",
    title: "JSON处理：API数据必备",
    content: `## JSON处理：API数据必备

JSON是API数据交换的事实标准。

### 常用方法

| 方法 | 作用 |
|------|------|
| json.dumps() | Python对象 → JSON字符串 |
| json.loads() | JSON字符串 → Python对象 |
| json.dump() | Python对象 → 写入文件 |
| json.load() | 从文件读取 → Python对象 |

### 重要参数

- ensure_ascii=False：保留中文（必加！）
- indent=2：美化缩进（人读时加）

\`\`\`python
import json

data = {"name": "张三", "age": 28}
json_str = json.dumps(data, ensure_ascii=False, indent=2)
obj = json.loads(json_str)

with open("config.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
\`\`\`

### datetime不能直接序列化

datetime、set等类型需要自定义编码器或先转字符串：

\`\`\`python
from datetime import datetime
data = {"created_at": datetime.now().isoformat()}  # 先转字符串
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第四章 demo：JSON处理实战
演示：dumps/loads、dump/load、ensure_ascii、错误处理
工作场景：API响应处理、配置文件读写
"""
import json
import tempfile
from datetime import datetime
from pathlib import Path


def demo_dumps_loads():
    """演示：dumps和loads"""
    print("=" * 60)
    print("1. dumps/loads：字符串互转")
    print("=" * 60)

    employee = {
        "工号": "E001",
        "姓名": "张三",
        "年龄": 28,
        "部门": "技术部",
        "在职": True,
        "技能": ["Python", "SQL"],
    }

    print("\\n--- ensure_ascii=False保留中文 ---")
    json_pretty = json.dumps(employee, ensure_ascii=False, indent=2)
    print(json_pretty)

    print("\\n--- loads反序列化 ---")
    parsed = json.loads(json_pretty)
    print(f"姓名: {parsed['姓名']}, 部门: {parsed['部门']}")


def demo_dump_load_file(temp_dir):
    """演示：dump/load直接读写文件"""
    print("\\n" + "=" * 60)
    print("2. dump/load：文件读写")
    print("=" * 60)

    app_config = {
        "app_name": "员工管理系统",
        "version": "1.2.0",
        "database": {"host": "localhost", "port": 3306},
        "features": {"login": True, "export_csv": True},
    }

    config_file = temp_dir / "app_config.json"
    with open(config_file, "w", encoding="utf-8") as f:
        json.dump(app_config, f, ensure_ascii=False, indent=2)

    print(f"配置已写入: {config_file}")

    with open(config_file, "r", encoding="utf-8") as f:
        loaded = json.load(f)
    print(f"数据库端口: {loaded['database']['port']}")


def demo_error_handling():
    """演示：JSON解析错误处理"""
    print("\\n" + "=" * 60)
    print("3. JSON解析错误处理")
    print("=" * 60)

    bad_examples = [
        ("正常", '{"name": "张三"}'),
        ("语法错误", '{"name": "张三",}'),
        ("不完整", '{"name": "张三"'),
    ]

    for desc, json_str in bad_examples:
        try:
            result = json.loads(json_str)
            print(f"  {desc}: ✅ 成功")
        except json.JSONDecodeError as e:
            print(f"  {desc}: ❌ {e.msg}")


def demo_work_scenario():
    """工作场景：API响应处理"""
    print("\\n" + "=" * 60)
    print("4. 工作场景：解析API响应")
    print("=" * 60)

    api_response = """{
  "code": 0,
  "message": "success",
  "data": {
    "users": [
      {"id": 1001, "name": "张三", "dept": "技术部", "active": true},
      {"id": 1002, "name": "李四", "dept": "产品部", "active": true},
      {"id": 1003, "name": "王五", "dept": "运营部", "active": false}
    ],
    "total": 3
  }
}"""

    result = json.loads(api_response)
    if result["code"] == 0:
        print("API请求成功！用户列表:")
        for user in result["data"]["users"]:
            status = "在职" if user["active"] else "离职"
            print(f"  [{user['id']}] {user['name']} - {user['dept']} - {status}")


def main():
    print("JSON处理实战演示")

    demo_dumps_loads()

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        demo_dump_load_file(temp_dir)

    demo_error_handling()
    demo_work_scenario()

    print("\\n" + "=" * 60)
    print("所有演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-exceptions",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "⚠️",
    title: "异常处理：让程序不崩溃",
    content: `## 异常处理：让程序不崩溃

异常处理的目的是优雅地处理错误，给用户清晰提示，而不是让程序直接崩溃。

### 核心语法

\`\`\`python
try:
    result = risky_operation()
except FileNotFoundError as e:
    print(f"文件不存在: {e}")
except (ValueError, TypeError) as e:
    print(f"数据错误: {e}")
else:
    print("没有异常才执行")
finally:
    print("无论是否异常都执行（清理资源）")
\`\`\`

### 原则

1. **捕获特定异常**，不要裸except（裸except会吞掉KeyboardInterrupt等）
2. **as e获取异常信息**，方便排查
3. **finally做清理**（关闭文件、释放连接），不过优先用with语句
4. **raise主动抛异常**，做参数校验时用

### 常见异常

| 异常 | 场景 |
|------|------|
| FileNotFoundError | 文件不存在 |
| ValueError | 值错误（int("abc")）|
| KeyError | 字典key不存在 |
| IndexError | 列表越界 |
| json.JSONDecodeError \| JSON解析失败 |`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第五章 demo：异常处理实战
演示：try/except/finally、常见异常、raise、重试模式
工作场景：健壮的配置加载、网络请求重试
"""
import json
import tempfile
import time
from pathlib import Path


def demo_basic_syntax():
    """演示：try/except/else/finally基本结构"""
    print("=" * 60)
    print("1. try/except/else/finally基本结构")
    print("=" * 60)

    print("\\n--- 正常执行 ---")
    try:
        result = 100 / 5
        print(f"  结果: {result}")
    except ZeroDivisionError as e:
        print(f"  出错: {e}")
    else:
        print("  else: 没有异常")
    finally:
        print("  finally: 总会执行")

    print("\\n--- 发生异常 ---")
    try:
        result = 100 / 0
    except ZeroDivisionError as e:
        print(f"  捕获到: {e}")
    finally:
        print("  finally: 总会执行")


def demo_common_exceptions():
    """演示：常见异常类型"""
    print("\\n" + "=" * 60)
    print("2. 常见异常类型")
    print("=" * 60)

    print("\\n--- FileNotFoundError ---")
    try:
        open("/not/exist/file.txt", "r")
    except FileNotFoundError as e:
        print(f"  文件不存在: {e.filename}")

    print("\\n--- ValueError ---")
    try:
        int("abc")
    except ValueError as e:
        print(f"  'abc'转int失败: {e}")

    print("\\n--- KeyError（字典key不存在）---")
    user = {"name": "张三"}
    try:
        print(user["age"])
    except KeyError as e:
        print(f"  key不存在: {e}")
        print(f"  安全访问: user.get('age', '未知') = {user.get('age', '未知')}")

    print("\\n--- IndexError（列表越界）---")
    nums = [1, 2, 3]
    try:
        print(nums[10])
    except IndexError as e:
        print(f"  列表越界: {e}，长度: {len(nums)}")


def demo_no_bare_except():
    """演示：不要用裸except"""
    print("\\n" + "=" * 60)
    print("3. 不要裸except！捕获特定异常")
    print("=" * 60)
    print("""
❌ 反模式：
try:
    code()
except:  # 连Ctrl+C都捕获！程序无法正常退出
    pass

✅ 正确：
try:
    code()
except FileNotFoundError:
    处理文件不存在
except json.JSONDecodeError:
    处理JSON错误
""")


def demo_raise():
    """演示：raise主动抛异常（参数校验）"""
    print("\\n" + "=" * 60)
    print("4. raise主动抛异常（参数校验）")
    print("=" * 60)

    def validate_age(age):
        if not isinstance(age, int):
            raise TypeError(f"年龄必须是整数，收到{type(age).__name__}")
        if age < 0 or age > 150:
            raise ValueError(f"年龄必须在0-150之间，收到{age}")
        return True

    test_ages = [25, -1, "28"]
    for age in test_ages:
        try:
            validate_age(age)
            print(f"  年龄{age}: 合法")
        except (TypeError, ValueError) as e:
            print(f"  年龄{age}: 不合法 - {e}")


def demo_retry():
    """演示：网络请求重试模式"""
    print("\\n" + "=" * 60)
    print("5. 工作场景：重试模式")
    print("=" * 60)

    attempt_count = 0

    def unstable_api():
        nonlocal attempt_count
        attempt_count += 1
        if attempt_count <= 2:
            raise ConnectionError(f"超时（第{attempt_count}次）")
        return {"code": 0, "data": "成功"}

    max_retries = 3
    print(f"\\n模拟不稳定API，最多重试{max_retries}次...")
    for attempt in range(1, max_retries + 1):
        try:
            result = unstable_api()
            print(f"  第{attempt}次: ✅ 成功!")
            break
        except ConnectionError as e:
            print(f"  第{attempt}次: ❌ {e}")
            if attempt < max_retries:
                time.sleep(0.1)
            else:
                print(f"  重试{max_retries}次仍然失败")


def demo_work_scenario():
    """工作场景：健壮的配置加载"""
    print("\\n" + "=" * 60)
    print("6. 工作场景：健壮的配置加载")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)

        def load_config(config_path):
            default = {"port": 8080, "debug": False}
            if not config_path.exists():
                return default, "配置文件不存在，使用默认"
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    return json.load(f), None
            except json.JSONDecodeError as e:
                return default, f"JSON格式错误: {e.msg}"

        print("\\n--- 测试1：文件不存在 ---")
        config, err = load_config(temp_dir / "no.json")
        print(f"  port={config['port']}, 提示: {err}")

        print("\\n--- 测试2：正常配置 ---")
        good = temp_dir / "good.json"
        good.write_text(json.dumps({"port": 9000, "debug": True}), encoding="utf-8")
        config, err = load_config(good)
        print(f"  port={config['port']}, 提示: {err}")

        print("\\n--- 测试3：JSON错误 ---")
        bad = temp_dir / "bad.json"
        bad.write_text("{invalid", encoding="utf-8")
        config, err = load_config(bad)
        print(f"  port={config['port']}, 提示: {err}")


def main():
    print("异常处理实战演示")

    demo_basic_syntax()
    demo_common_exceptions()
    demo_no_bare_except()
    demo_raise()
    demo_retry()
    demo_work_scenario()

    print("\\n" + "=" * 60)
    print("所有演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-errors",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "🐛",
    title: "常见错误与调试技巧",
    content: `## 常见错误与调试技巧

快速定位错误是程序员的核心能力。

### 常见错误速查

| 错误类型 | 原因 | 排查方向 |
|---------|------|---------|
| SyntaxError | 语法错误（少冒号、括号不匹配）| 看报错行号 |
| IndentationError | 缩进错误（Python特有！）| 检查空格Tab混用 |
| NameError | 变量未定义 | 拼写、是否定义 |
| TypeError | 类型不对（字符串+数字）| 检查变量类型 |
| ValueError | 值不对（int("abc")）| 类型对但值错 |
| KeyError | 字典key不存在 | 用dict.get() |
| IndexError | 列表越界 | 检查len() |
| AttributeError | 属性/方法不存在 | dir(obj)看有哪些 |
| ImportError | 模块导入失败 | pip install |

### 调试技巧

1. **print调试法**（最朴素但最好用）：在关键位置打印变量值
2. **logging日志**（比print专业）：可控制级别、输出到文件
3. **traceback.print_exc()**：打印完整堆栈
4. **assert断言**：调试用，检查不可能发生的情况

\`\`\`python
import logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(message)s")
logging.debug("调试信息")
logging.info("普通信息")
logging.error("错误信息")
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第六章 demo：常见错误与调试技巧
演示：各类错误示例、print调试、logging、traceback
"""
import logging
import sys
import traceback

logging.basicConfig(level=logging.DEBUG, format="%(asctime)s [%(levelname)s] %(message)s",
                    datefmt="%H:%M:%S", stream=sys.stdout)


def demo_common_errors():
    """演示：常见错误类型"""
    print("=" * 60)
    print("1. 常见错误类型演示")
    print("=" * 60)

    print("\\n--- NameError（变量未定义）---")
    employee_name = "张三"
    try:
        print(employee_nam)
    except NameError as e:
        print(f"  ❌ {e}")
        print(f"  原因：拼写错误，正确变量名值为: {employee_name}")

    print("\\n--- TypeError（类型错误）---")
    age = 28
    try:
        "年龄: " + age
    except TypeError as e:
        print(f"  ❌ {e}")
        print(f"  正确: '年龄: ' + str(age) = {'年龄: ' + str(age)}")

    print("\\n--- ValueError（值错误）---")
    try:
        int("abc")
    except ValueError as e:
        print(f"  ❌ {e}")
        print("  原因：'abc'是字符串但不是数字")

    print("\\n--- KeyError（字典key不存在）---")
    user = {"name": "张三"}
    try:
        print(user["age"])
    except KeyError as e:
        print(f"  ❌ key不存在: {e}")
        print(f"  安全访问: {user.get('age', '未知')}")

    print("\\n--- IndexError（列表越界）---")
    nums = [1, 2, 3]
    try:
        nums[10]
    except IndexError as e:
        print(f"  ❌ {e}，列表长度{len(nums)}")

    print("\\n--- AttributeError（属性不存在）---")
    try:
        nums.appendddd(4)
    except AttributeError as e:
        print(f"  ❌ {e}")
        print("  原因：append拼写错误，应该是append")


def demo_tips():
    """调试技巧说明"""
    print("\\n" + "=" * 60)
    print("2. 调试技巧")
    print("=" * 60)

    print("""
技巧1：print调试（最快最直接）
  在怀疑出错的位置print变量值，确认数据是否符合预期

技巧2：logging比print好在哪
  - 可以设置级别（DEBUG/INFO/WARNING/ERROR）
  - 上线后不用删，改level即可
  - 可以同时输出到文件和控制台
  - 带时间戳
""")


def demo_logging():
    """演示：logging日志"""
    print("\\n--- logging演示 ---")
    logging.debug("这是DEBUG：调试细节")
    logging.info("这是INFO：正常运行信息")
    logging.warning("这是WARNING：警告")
    logging.error("这是ERROR：出错了")


def demo_traceback():
    """演示：traceback查看完整堆栈"""
    print("\\n" + "=" * 60)
    print("3. traceback查看完整错误栈")
    print("=" * 60)

    def a():
        return b()

    def b():
        return c()

    def c():
        return 1 / 0

    print("\\n调用链 a→b→c（c中除以0）:")
    try:
        a()
    except ZeroDivisionError:
        traceback.print_exc()
        print("\\n⚠️  看堆栈要从下往上看！最下面是真正出错的位置")


def demo_pitfalls():
    """常见坑点总结"""
    print("\\n" + "=" * 60)
    print("4. 新手常见坑点")
    print("=" * 60)
    print("""
坑1：可变默认参数
  ❌ def func(lst=[]):  列表在多次调用间共享！
  ✅ def func(lst=None):
         if lst is None: lst = []

坑2：is vs ==
  is比较内存地址，==比较值。比较值永远用==

坑3：相对路径问题
  open("data.txt") 相对的是启动目录，不是脚本目录
  ✅ 基于__file__: Path(__file__).parent / "data.txt"

坑4：忘记encoding
  ✅ open()永远加encoding="utf-8"

坑5：缩进混用Tab和空格
  ✅ 统一用4个空格
""")


def main():
    print("常见错误与调试技巧演示")

    demo_common_errors()
    demo_tips()
    demo_logging()
    demo_traceback()
    demo_pitfalls()

    print("\\n" + "=" * 60)
    print("所有演示完成！调试能力靠多练。")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-os-path",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "🛤️",
    title: "os与pathlib：路径与目录操作",
    content: `## os与pathlib：路径与目录操作

批量处理文件、查找日志、遍历目录时用。pathlib（Python 3.4+）是现代写法，强烈推荐。

### pathlib.Path（推荐）

\`\`\`python
from pathlib import Path

# /运算符拼接路径（跨平台，比os.path.join直观）
config_path = Path("config") / "app" / "settings.ini"

# 判断
config_path.exists()
config_path.is_file()
config_path.is_dir()

# 属性
config_path.name    # 文件名（含后缀）
config_path.stem    # 文件名（不含后缀）
config_path.suffix  # 后缀

# 读写（快捷方法）
config_path.read_text(encoding="utf-8")
config_path.write_text("content", encoding="utf-8")

# 创建目录（parents=True递归创建，exist_ok=True已存在不报错）
config_path.parent.mkdir(parents=True, exist_ok=True)

# 查找文件
for py_file in Path(".").rglob("*.py"):  # rglob递归查找
    print(py_file)
\`\`\`

### os.walk遍历目录

\`\`\`python
import os
for root, dirs, files in os.walk("project"):
    for f in files:
        if f.endswith(".log"):
            print(os.path.join(root, f))
\`\`\``,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第七章 demo：os与pathlib路径操作实战
演示：pathlib现代写法、glob查找、目录遍历
工作场景：批量处理文件、日志查找、项目结构分析
"""
import os
import tempfile
from pathlib import Path


def demo_pathlib_basics(temp_dir):
    """演示：pathlib.Path基础用法"""
    print("=" * 60)
    print("1. pathlib.Path（现代Python推荐）")
    print("=" * 60)

    base = Path(temp_dir)
    print(f"基础路径: {base}")

    # /运算符拼接路径
    config_path = base / "config" / "app" / "settings.ini"
    print(f"用/拼接: {config_path}")

    # 创建目录
    config_path.parent.mkdir(parents=True, exist_ok=True)

    # 写入
    config_path.write_text("[database]\\nhost=localhost\\nport=3306", encoding="utf-8")

    # 属性
    print(f"\\n--- Path属性 ---")
    print(f"name（文件名）: {config_path.name}")
    print(f"stem（无后缀）: {config_path.stem}")
    print(f"suffix（后缀）: {config_path.suffix}")
    print(f"parent（父目录）: {config_path.parent}")
    print(f"exists: {config_path.exists()}")
    print(f"is_file: {config_path.is_file()}")

    # 读取
    print(f"\\n内容:")
    print(config_path.read_text(encoding="utf-8"))


def demo_glob(temp_dir):
    """演示：glob查找文件"""
    print("\\n" + "=" * 60)
    print("2. glob查找文件")
    print("=" * 60)

    project_dir = Path(temp_dir) / "sample_project"
    (project_dir / "src" / "utils").mkdir(parents=True, exist_ok=True)
    (project_dir / "docs").mkdir(parents=True, exist_ok=True)
    (project_dir / "logs").mkdir(parents=True, exist_ok=True)

    sample_files = [
        "src/main.py", "src/app.py", "src/utils/helper.py",
        "docs/readme.md", "logs/app.log", "config.json",
    ]
    for f in sample_files:
        (project_dir / f).write_text(f"# {f}", encoding="utf-8")

    print(f"\\n--- rglob('*.py') 递归查找所有py文件 ---")
    for py_file in project_dir.rglob("*.py"):
        print(f"  {py_file.relative_to(project_dir)}")

    print(f"\\n--- rglob('*.log') 查找所有日志 ---")
    for log_file in project_dir.rglob("*.log"):
        print(f"  {log_file.relative_to(project_dir)}")


def demo_os_walk(temp_dir):
    """演示：os.walk遍历目录"""
    print("\\n" + "=" * 60)
    print("3. os.walk遍历目录")
    print("=" * 60)

    project_dir = Path(temp_dir) / "walk_demo"
    (project_dir / "a" / "b").mkdir(parents=True, exist_ok=True)
    (project_dir / "c").mkdir(parents=True, exist_ok=True)
    (project_dir / "a" / "a.txt").write_text("a", encoding="utf-8")
    (project_dir / "a" / "b" / "b.txt").write_text("b", encoding="utf-8")
    (project_dir / "c" / "c.log").write_text("log", encoding="utf-8")

    print("\\n目录结构:")
    for root, dirs, files in os.walk(project_dir):
        level = Path(root).relative_to(project_dir).parts
        indent = "  " * len(level)
        print(f"{indent}{Path(root).name}/")
        for f in files:
            print(f"{indent}  {f}")


def demo_work_scenario():
    """工作场景：日志文件统计"""
    print("\\n" + "=" * 60)
    print("4. 工作场景：日志文件统计")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)

        log_root = temp_dir / "app_logs"
        logs = [
            ("2024-10/app.log", "INFO old\\n" * 10),
            ("2024-11/app.log", "INFO nov\\n" * 20),
            ("2024-12/app.log", "INFO dec\\n" * 50),
            ("2025-01/app.log", "INFO current\\nERROR err\\n" * 30),
        ]
        for path_str, content in logs:
            f = log_root / path_str
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(content, encoding="utf-8")

        print("\\n--- 日志统计 ---")
        total_logs = 0
        total_errors = 0
        for log_file in log_root.rglob("*.log"):
            content = log_file.read_text(encoding="utf-8")
            lines = content.splitlines()
            errors = sum(1 for line in lines if "ERROR" in line)
            total_logs += len(lines)
            total_errors += errors
            print(f"  {log_file.relative_to(log_root)}: {len(lines)}行, {errors}个错误")

        print(f"\\n总计: {total_logs}行日志, {total_errors}个错误")


def main():
    print("os与pathlib路径操作实战演示")

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        demo_pathlib_basics(temp_dir)
        demo_glob(temp_dir)
        demo_os_walk(temp_dir)

    demo_work_scenario()

    print("\\n" + "=" * 60)
    print("所有演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  },
  {
    id: "py-serialization",
    group: "文件操作与异常处理 · 与外界打交道",
    icon: "💾",
    title: "数据序列化与配置文件",
    content: `## 数据序列化与配置文件

序列化是把内存对象保存到文件，下次启动再加载。配置文件让程序不用改代码就能调参数。

### pickle：Python专用序列化

可以序列化几乎所有Python对象，但**不要反序列化不信任的数据**（有安全风险）。

\`\`\`python
import pickle

data = {"users": ["张三"], "settings": {"theme": "dark"}}
with open("data.pkl", "wb") as f:
    pickle.dump(data, f)

with open("data.pkl", "rb") as f:
    loaded = pickle.load(f)
\`\`\`

### configparser：INI配置文件

INI格式简单易读，适合简单配置：

\`\`\`python
import configparser

config = configparser.ConfigParser()
config.read("config.ini", encoding="utf-8")
host = config.get("database", "host", fallback="localhost")
port = config.getint("database", "port", fallback=3306)
debug = config.getboolean("app", "debug", fallback=False)
\`\`\`

### 环境变量：敏感信息不硬编码

密码、API密钥等用环境变量，不要提交到代码库：

\`\`\`python
import os
db_password = os.environ.get("DB_PASSWORD", "")
api_key = os.getenv("API_KEY", "")
\`\`\`

### 配置最佳实践

1. 敏感信息用环境变量
2. 配置与代码分离
3. get()带fallback默认值
4. 类型转换：getint/getboolean
5. 启动时校验必要配置`,
    code: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
第八章 demo：数据序列化与配置文件
演示：pickle、configparser读INI、环境变量
工作场景：程序配置加载、保存用户状态
"""
import configparser
import os
import pickle
import tempfile
from datetime import datetime
from pathlib import Path


def demo_pickle(temp_dir):
    """演示：pickle序列化"""
    print("=" * 60)
    print("1. pickle序列化（Python专用）")
    print("=" * 60)

    print("""
⚠️  安全警告：永远不要load来自不信任来源的pickle文件！
  程序间数据交换优先用JSON，pickle只用于自己程序保存状态。
""")

    app_state = {
        "version": "1.2.0",
        "last_run": datetime.now(),
        "theme": "dark",
        "recent_files": ["/docs/report.pdf", "/data/sales.csv"],
        "window_size": (1200, 800),
    }

    pickle_file = temp_dir / "app_state.pkl"
    with open(pickle_file, "wb") as f:
        pickle.dump(app_state, f)
    print(f"状态已保存: {pickle_file.stat().st_size} 字节")

    with open(pickle_file, "rb") as f:
        loaded = pickle.load(f)
    print(f"\\n加载状态:")
    print(f"  版本: {loaded['version']}")
    print(f"  主题: {loaded['theme']}")
    print(f"  最近文件: {len(loaded['recent_files'])}个")


def demo_configparser(temp_dir):
    """演示：configparser读写INI配置"""
    print("\\n" + "=" * 60)
    print("2. configparser：INI配置文件")
    print("=" * 60)

    ini_file = temp_dir / "app.ini"

    config = configparser.ConfigParser()
    config["database"] = {
        "host": "localhost",
        "port": "3306",
        "name": "company_db",
    }
    config["app"] = {
        "debug": "false",
        "log_level": "INFO",
    }

    with open(ini_file, "w", encoding="utf-8") as f:
        config.write(f)

    print(f"INI文件已写入:")
    print(ini_file.read_text(encoding="utf-8"))

    print("--- 读取配置 ---")
    config2 = configparser.ConfigParser()
    config2.read(ini_file, encoding="utf-8")

    db_host = config2.get("database", "host")
    db_port = config2.getint("database", "port")
    debug = config2.getboolean("app", "debug")
    log_level = config2.get("app", "log_level", fallback="WARNING")
    missing = config2.get("app", "timeout", fallback="30")

    print(f"database.host: {db_host}")
    print(f"database.port: {db_port} (类型: {type(db_port).__name__})")
    print(f"app.debug: {debug} (类型: {type(debug).__name__})")
    print(f"app.log_level: {log_level}")
    print(f"app.timeout（带默认值）: {missing}")


def demo_env_vars():
    """演示：环境变量读取"""
    print("\\n" + "=" * 60)
    print("3. 环境变量：敏感信息不硬编码")
    print("=" * 60)

    print("""
最佳实践：密码、API密钥等敏感信息通过环境变量传入，不要写在代码里

# 命令行设置（临时）：
export DB_PASSWORD=mysecret
export API_KEY=abc123

# Python中读取：
""")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_password = os.getenv("DB_PASSWORD", "")
    api_key = os.getenv("API_KEY", "")

    print(f"DB_HOST: {db_host}")
    print(f"DB_PORT: {db_port}")
    print(f"DB_PASSWORD: {'已设置' if db_password else '未设置（使用默认）'}")
    print(f"API_KEY: {'已设置' if api_key else '未设置（使用默认）'}")

    print("""
开发环境可以用python-dotenv从.env文件加载：
  pip install python-dotenv
  from dotenv import load_dotenv
  load_dotenv()  # 加载.env文件中的环境变量
""")


def demo_work_scenario():
    """工作场景：完整的配置加载模式"""
    print("\\n" + "=" * 60)
    print("4. 工作场景：完整配置加载")
    print("=" * 60)

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)

        def load_app_config(config_path):
            """加载应用配置：INI文件 + 环境变量覆盖"""
            config = configparser.ConfigParser()
            defaults = {
                "database": {
                    "host": "localhost",
                    "port": "3306",
                    "name": "app_db",
                    "password": "",
                },
                "app": {
                    "debug": "false",
                    "port": "8080",
                }
            }
            config.read_dict(defaults)

            if config_path.exists():
                config.read(config_path, encoding="utf-8")
                print(f"  已加载配置文件: {config_path}")

            db_password = os.getenv("DB_PASSWORD")
            if db_password:
                config["database"]["password"] = db_password
                print("  DB_PASSWORD从环境变量覆盖")

            return {
                "db_host": config.get("database", "host"),
                "db_port": config.getint("database", "port"),
                "db_name": config.get("database", "name"),
                "db_password": config.get("database", "password"),
                "debug": config.getboolean("app", "debug"),
                "app_port": config.getint("app", "port"),
            }

        ini_file = temp_dir / "config.ini"
        ini_file.write_text("""[database]
host = 192.168.1.100
port = 3307

[app]
debug = true
""", encoding="utf-8")

        print("\\n加载配置:")
        app_config = load_app_config(ini_file)
        for key, value in app_config.items():
            if key == "db_password" and value:
                value = "******"
            print(f"  {key}: {value}")


def main():
    print("数据序列化与配置文件实战演示")

    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        demo_pickle(temp_dir)
        demo_configparser(temp_dir)

    demo_env_vars()
    demo_work_scenario()

    print("\\n" + "=" * 60)
    print("所有演示完成！")
    print("=" * 60)


if __name__ == "__main__":
    main()
`
  }
]
