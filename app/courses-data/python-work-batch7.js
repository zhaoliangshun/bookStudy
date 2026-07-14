// =============================================================
// 《Python工作实战手册》—— 第七批章节
// 主题：第三方库与工作实战：解决真实问题（共8章）
// 涵盖：pip/venv、requests、pandas、sqlite3、环境变量、类型提示、asyncio、最佳实践
// =============================================================

export const chapters = [
  {
    id: "py-pip-venv",
    icon: "📦",
    group: "第三方库与工作实战",
    title: "包管理pip与虚拟环境",
    content: `
# 包管理pip与虚拟环境

## 引言：为什么需要包管理和虚拟环境

在实际工作中，你几乎不可能只用Python标准库写代码。Python强大的生态系统来自于PyPI上超过50万个第三方库。但随之而来的问题是：项目A需要requests 2.28，项目B需要requests 2.31；全局安装的包被升级后老项目跑不起来；团队协作时"我电脑上能跑"成为口头禅。

**pip + 虚拟环境**就是解决这些问题的标准答案，是工作第一天就会用到的基本功。

## 一、pip基础命令

\`\`\`bash
pip install requests                  # 安装最新版
pip install requests==2.31.0          # 安装指定版本（推荐！）
pip install "requests>=2.28,<3.0"    # 版本范围
pip install --upgrade requests        # 升级
pip uninstall requests               # 卸载
pip list                             # 查看已安装
pip show requests                    # 查看包详情
pip freeze > requirements.txt        # 导出依赖
pip install -r requirements.txt      # 从文件安装依赖
\`\`\`

## 二、国内镜像源加速

国内访问PyPI官方源很慢，配置清华镜像：

\`\`\`bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip config set global.trusted-host pypi.tuna.tsinghua.edu.cn
\`\`\`

## 三、虚拟环境venv

**为什么需要虚拟环境？** 给每个项目独立的Python环境，不同项目依赖互不干扰。

\`\`\`bash
# 创建虚拟环境
python3 -m venv .venv

# 激活（macOS/Linux）
source .venv/bin/activate

# 激活后命令行前会出现(.venv)标记

# 退出
deactivate
\`\`\`

## 四、新项目标准工作流

\`\`\`bash
mkdir my-project && cd my-project
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install requests pandas flask
pip freeze > requirements.txt
echo ".venv/" >> .gitignore
\`\`\`

> ⚠️ 记住：永远在虚拟环境中开发；永远不要提交.venv到Git；requirements.txt一定要提交。
    `,
    code: `
# =============================================================
# 包管理pip与虚拟环境 —— 演示代码
# 功能：虚拟环境检测、包安装状态检查、依赖版本验证
# 不需要安装第三方库，使用Python标准库即可运行
# =============================================================

import sys
import os
import importlib
from importlib import metadata


def check_python_version():
    """检查Python版本是否符合工作要求（通常需要3.8+）"""
    print("=" * 60)
    print("【1】Python版本检查")
    print("=" * 60)
    print(f"  当前版本：{sys.version}")
    required_major, required_minor = 3, 8
    major, minor = sys.version_info.major, sys.version_info.minor
    if major > required_major or (major == required_major and minor >= required_minor):
        print(f"  ✅ 版本符合要求（需要 >={required_major}.{required_minor}）")
        return True
    else:
        print(f"  ❌ 版本过低，需要Python {required_major}.{required_minor}+")
        return False


def check_virtualenv():
    """检测当前是否运行在虚拟环境中"""
    print("\\n" + "=" * 60)
    print("【2】虚拟环境检测")
    print("=" * 60)
    print(f"  sys.prefix: {sys.prefix}")
    print(f"  sys.base_prefix: {sys.base_prefix}")
    in_venv = sys.prefix != sys.base_prefix
    venv_env = os.environ.get("VIRTUAL_ENV")
    if in_venv:
        print(f"  ✅ 当前在虚拟环境中：{venv_env}")
    else:
        print("  ⚠️  当前不在虚拟环境中！")
        print("  💡 建议：python3 -m venv .venv && source .venv/bin/activate")
    return in_venv


def list_installed_packages():
    """列出已安装的包（类似pip list）"""
    print("\\n" + "=" * 60)
    print("【3】已安装的包（前20个）")
    print("=" * 60)
    packages = []
    for dist in metadata.distributions():
        try:
            packages.append((dist.metadata["Name"], dist.version))
        except Exception:
            continue
    packages.sort(key=lambda x: x[0].lower())
    print(f"  {'包名':<30} {'版本':<15}")
    print("-" * 50)
    for name, version in packages[:20]:
        print(f"  {name:<30} {version:<15}")
    if len(packages) > 20:
        print(f"  ... 还有{len(packages)-20}个包")
    return packages


def check_package(package_name, required_version=None):
    """检查指定包是否安装及版本是否符合要求"""
    try:
        importlib.import_module(package_name)
        try:
            version = metadata.version(package_name)
        except metadata.PackageNotFoundError:
            version = "unknown"
        status = "✅"
        msg = f"已安装，版本：{version}"
        if required_version and version != required_version:
            status = "⚠️"
            msg += f"（要求{required_version}）"
        print(f"  {status} {package_name}: {msg}")
        return True
    except ImportError:
        print(f"  ❌ {package_name}: 未安装")
        print(f"     💡 安装：pip install {package_name}")
        return False


def main():
    """主函数：运行环境检查"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        Python环境与依赖管理检查工具".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    check_python_version()
    check_virtualenv()
    list_installed_packages()
    print("\\n" + "=" * 60)
    print("【4】常见工作库检查")
    print("=" * 60)
    for pkg in ["requests", "pandas", "flask", "numpy"]:
        check_package(pkg)
    print("\\n" + "=" * 60)
    print("  📌 工作中记住：")
    print("  1. python3 -m venv .venv 创建虚拟环境")
    print("  2. source .venv/bin/activate 激活")
    print("  3. pip install -r requirements.txt 安装依赖")
    print("  4. pip freeze > requirements.txt 导出依赖")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-requests",
    icon: "🌐",
    group: "第三方库与工作实战",
    title: "requests库：HTTP请求必备",
    content: `
# requests库：HTTP请求必备

## 引言

工作中每天都会遇到HTTP请求场景：调用第三方API（短信、支付、AI接口）、对接内部服务、抓取网页数据、测试后端接口。requests库以"HTTP for Humans"为口号，是Python HTTP请求的事实标准。

## 一、安装与快速开始

\`\`\`bash
pip install requests
\`\`\`

\`\`\`python
import requests
r = requests.get("https://httpbin.org/get", timeout=10)
print(r.status_code)  # 200表示成功
data = r.json()       # 自动解析JSON为字典
\`\`\`

## 二、核心用法

**各种HTTP方法：**
\`\`\`python
requests.get(url, params=params)          # GET请求
requests.post(url, json=data)             # POST JSON（工作90%场景）
requests.post(url, data=form_data)        # POST表单
requests.put(url, json=data)              # 更新
requests.delete(url)                      # 删除
\`\`\`

**带参数GET：**
\`\`\`python
params = {"page": 1, "limit": 20}
r = requests.get("https://api.example.com/users", params=params)
\`\`\`

**自定义Headers：**
\`\`\`python
headers = {
    "User-Agent": "Mozilla/5.0...",       # 避免被反爬拦截
    "Authorization": "Bearer your-token", # Bearer认证
    "Content-Type": "application/json"
}
\`\`\`

**超时设置（一定要加！）：**
\`\`\`python
r = requests.get(url, timeout=10)  # 10秒超时，防止程序卡死
\`\`\`

## 三、异常处理（必备！）

\`\`\`python
from requests.exceptions import Timeout, ConnectionError, HTTPError
try:
    r = requests.get(url, timeout=10)
    r.raise_for_status()  # 状态码非2xx抛出异常
    data = r.json()
except Timeout:
    print("请求超时")
except ConnectionError:
    print("连接失败")
except HTTPError as e:
    print(f"HTTP错误：{e.response.status_code}")
\`\`\`

> ⚠️ 坑点提醒：永远加timeout；POST JSON用json=不是data=；记得设置User-Agent；调用raise_for_status()检查业务错误。
    `,
    code: `
# =============================================================
# requests库：HTTP请求必备 —— 演示代码
# 需要安装：pip install requests
# 功能：演示GET/POST请求、参数传递、异常处理、Session会话
# =============================================================

# 尝试导入requests，未安装给出友好提示
try:
    import requests
    from requests.exceptions import Timeout, ConnectionError, HTTPError, RequestException
    REQUESTS_OK = True
except ImportError:
    REQUESTS_OK = False
    print("⚠️  requests库未安装！")
    print("💡 请执行：pip install requests")


def demo_get():
    """演示基础GET请求"""
    print("=" * 60)
    print("【1】基础GET请求")
    print("=" * 60)
    if not REQUESTS_OK:
        print("  ⏭️  跳过，requests未安装")
        return
    try:
        r = requests.get("https://httpbin.org/get", timeout=10)
        r.raise_for_status()
        print(f"  ✅ 状态码：{r.status_code}")
        data = r.json()
        print(f"  你的IP：{data.get('origin')}")
    except Exception as e:
        print(f"  ❌ 失败：{e}")


def demo_get_params():
    """演示带参数的GET请求"""
    print("\\n" + "=" * 60)
    print("【2】带参数GET请求")
    print("=" * 60)
    if not REQUESTS_OK:
        print("  ⏭️  跳过")
        return
    params = {"page": 1, "keyword": "python", "limit": 10}
    try:
        r = requests.get("https://httpbin.org/get", params=params, timeout=10)
        r.raise_for_status()
        print(f"  请求URL：{r.url}")
        print(f"  服务器收到参数：{r.json().get('args')}")
        print("  ✅ 参数正确传递！")
    except Exception as e:
        print(f"  ❌ 失败：{e}")


def demo_post_json():
    """演示POST发送JSON（工作最常用！）"""
    print("\\n" + "=" * 60)
    print("【3】POST发送JSON数据")
    print("=" * 60)
    if not REQUESTS_OK:
        print("  ⏭️  跳过")
        return
    payload = {"name": "张三", "age": 28, "email": "YA9RfmB0@dTdpwNO.TAM"}
    headers = {"User-Agent": "Python-Demo/1.0"}
    try:
        # 注意：用json=参数，不是data=！
        r = requests.post("https://httpbin.org/post", json=payload, headers=headers, timeout=10)
        r.raise_for_status()
        print(f"  ✅ 状态码：{r.status_code}")
        print(f"  服务器收到JSON：{r.json().get('json')}")
    except Exception as e:
        print(f"  ❌ 失败：{e}")


def demo_headers():
    """演示自定义请求头（含Authorization）"""
    print("\\n" + "=" * 60)
    print("【4】自定义请求头")
    print("=" * 60)
    if not REQUESTS_OK:
        print("  ⏭️  跳过")
        return
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Authorization": "Bearer your-secret-token",
        "X-Request-ID": "req-123456"
    }
    try:
        r = requests.get("https://httpbin.org/headers", headers=headers, timeout=10)
        r.raise_for_status()
        received = r.json().get("headers", {})
        print(f"  User-Agent: {received.get('User-Agent', '')[:50]}...")
        print(f"  Authorization: {received.get('Authorization', '')[:25]}...")
        print("  ✅ 自定义头发送成功！")
    except Exception as e:
        print(f"  ❌ 失败：{e}")


def demo_error_handling():
    """演示各种异常情况处理"""
    print("\\n" + "=" * 60)
    print("【5】异常处理演示")
    print("=" * 60)
    if not REQUESTS_OK:
        print("  ⏭️  跳过")
        return
    test_cases = [
        ("正常请求", "https://httpbin.org/get", 5),
        ("超时测试", "https://httpbin.org/delay/3", 1),
        ("404错误", "https://httpbin.org/status/404", 5),
        ("域名不存在", "https://nonexistent-123456.com", 5),
    ]
    for name, url, timeout in test_cases:
        print(f"\\n  测试：{name}")
        try:
            r = requests.get(url, timeout=timeout)
            r.raise_for_status()
            print(f"    ✅ 成功，状态码：{r.status_code}")
        except Timeout:
            print(f"    ❌ 超时（超过{timeout}秒）")
        except ConnectionError:
            print("    ❌ 连接失败")
        except HTTPError as e:
            print(f"    ❌ HTTP错误：{e.response.status_code}")
        except RequestException as e:
            print(f"    ❌ 其他错误：{type(e).__name__}")


def main():
    """主函数"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        requests库HTTP请求演示".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    if REQUESTS_OK:
        print(f"  requests版本：{requests.__version__}")
    demo_get()
    demo_get_params()
    demo_post_json()
    demo_headers()
    demo_error_handling()
    print("\\n" + "=" * 60)
    print("  📌 记住万能模板：try + timeout + raise_for_status()")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-pandas",
    icon: "🐼",
    group: "第三方库与工作实战",
    title: "pandas入门：数据处理瑞士军刀",
    content: `
# pandas入门：数据处理瑞士军刀

## 引言

工作中表格数据处理无处不在：读取Excel/CSV、做数据报表、统计销售数据、合并数据源、清洗脏数据。pandas是处理这类问题的终极武器，是数据分析、运营、后端都必须掌握的库。

## 一、安装

\`\`\`bash
pip install pandas openpyxl  # openpyxl用于读写Excel
\`\`\`

## 二、核心数据结构

- **Series**：一维数组，类似Excel的一列
- **DataFrame**：二维表格，类似Excel工作表（99%场景用这个）

## 三、快速入门

\`\`\`python
import pandas as pd

# 读取数据
df = pd.read_csv("data.csv")
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")

# 查看数据
df.head()          # 前5行
df.shape           # (行数, 列数)
df.info()          # 数据概览
df.describe()      # 统计信息

# 选择数据
df["姓名"]                    # 选一列
df[["姓名", "工资"]]          # 选多列
df[df["年龄"] > 30]           # 条件过滤
df[(df["年龄"]>25) & (df["工资"]>10000)]  # 多条件

# 数据处理
df["年薪"] = df["工资"] * 12  # 新增列
df.sort_values("工资", ascending=False)  # 排序
df.groupby("部门")["工资"].mean()  # 分组统计（类似Excel透视表）
df.dropna()  # 删除缺失值
df.fillna(0) # 填充缺失值

# 导出
df.to_csv("output.csv", index=False, encoding="utf-8-sig")
df.to_excel("output.xlsx", index=False)
\`\`\`

> ⚠️ 坑点：导出时加index=False避免多出一列；CSV用utf-8-sig编码解决Excel中文乱码；多条件过滤用& | ~，不是and/or/not。
    `,
    code: `
# =============================================================
# pandas入门：数据处理瑞士军刀 —— 演示代码
# 需要安装：pip install pandas
# 功能：DataFrame创建、数据选择、过滤、分组统计、导出
# =============================================================

try:
    import pandas as pd
    import numpy as np
    PANDAS_OK = True
except ImportError:
    PANDAS_OK = False
    print("⚠️  pandas未安装！")
    print("💡 请执行：pip install pandas numpy")


def create_sample_data():
    """创建模拟员工数据"""
    print("=" * 60)
    print("【1】创建DataFrame（模拟员工数据）")
    print("=" * 60)
    if not PANDAS_OK:
        print("  ⏭️  跳过")
        return None
    data = {
        "姓名": ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十", "郑十一", "王十二"],
        "部门": ["技术部", "技术部", "产品部", "产品部", "市场部", "市场部", "技术部", "人事部", "财务部", "技术部"],
        "年龄": [28, 32, 26, 30, 35, 29, 27, 40, 38, 25],
        "工资": [18000, 25000, 15000, 20000, 22000, 16000, 19000, 28000, 26000, 14000],
        "职级": ["P5", "P7", "P5", "P6", "P7", "P5", "P6", "M2", "M1", "P4"]
    }
    df = pd.DataFrame(data)
    print(f"  数据形状：{df.shape}（{df.shape[0]}行 × {df.shape[1]}列）")
    print(f"  列名：{list(df.columns)}")
    print("\\n  前5行数据：")
    print(df.head().to_string(index=False))
    return df


def demo_basic_ops(df):
    """演示基本数据操作"""
    print("\\n" + "=" * 60)
    print("【2】基本数据操作")
    print("=" * 60)
    if df is None or not PANDAS_OK:
        print("  ⏭️  跳过")
        return
    print("\\n  数据统计信息（数值列）：")
    print(df.describe().round(2).to_string())
    print("\\n  选择'姓名'和'工资'两列：")
    print(df[["姓名", "工资"]].head().to_string(index=False))


def demo_filter(df):
    """演示数据过滤"""
    print("\\n" + "=" * 60)
    print("【3】数据过滤")
    print("=" * 60)
    if df is None or not PANDAS_OK:
        print("  ⏭️  跳过")
        return
    print("\\n  工资大于20000的员工：")
    high_salary = df[df["工资"] > 20000]
    print(high_salary[["姓名", "部门", "工资"]].to_string(index=False))
    print("\\n  技术部且年龄小于30的员工：")
    tech_young = df[(df["部门"] == "技术部") & (df["年龄"] < 30)]
    print(tech_young[["姓名", "年龄", "工资"]].to_string(index=False))


def demo_new_column(df):
    """演示新增计算列"""
    print("\\n" + "=" * 60)
    print("【4】新增计算列")
    print("=" * 60)
    if df is None or not PANDAS_OK:
        print("  ⏭️  跳过")
        return
    df["年薪"] = df["工资"] * 12
    df["税后工资"] = (df["工资"] * 0.8).round(0)
    df["工资等级"] = df["工资"].apply(lambda x: "高" if x > 20000 else ("中" if x > 15000 else "低"))
    print("  新增年薪、税后工资、工资等级列后：")
    print(df[["姓名", "工资", "年薪", "税后工资", "工资等级"]].to_string(index=False))


def demo_groupby(df):
    """演示分组统计（工作超高频！）"""
    print("\\n" + "=" * 60)
    print("【5】分组统计（按部门）")
    print("=" * 60)
    if df is None or not PANDAS_OK:
        print("  ⏭️  跳过")
        return
    print("\\n  各部门人数、平均工资、最高工资：")
    dept_stats = df.groupby("部门")["工资"].agg(["count", "mean", "max", "min"]).round(0)
    dept_stats.columns = ["人数", "平均工资", "最高工资", "最低工资"]
    print(dept_stats.to_string())


def demo_sort(df):
    """演示排序"""
    print("\\n" + "=" * 60)
    print("【6】工资TOP 5")
    print("=" * 60)
    if df is None or not PANDAS_OK:
        print("  ⏭️  跳过")
        return
    top5 = df.sort_values("工资", ascending=False).head(5)
    print(top5[["姓名", "部门", "职级", "工资"]].to_string(index=False))


def main():
    """主函数"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        pandas数据处理演示".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    if PANDAS_OK:
        print(f"  pandas版本：{pd.__version__}")
    df = create_sample_data()
    demo_basic_ops(df)
    demo_filter(df)
    demo_new_column(df)
    demo_groupby(df)
    demo_sort(df)
    print("\\n" + "=" * 60)
    print("  📌 pandas核心：read_csv → 处理 → groupby → to_csv")
    print("  📌 记住index=False和utf-8-sig避免Excel乱码")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-sqlite",
    icon: "🗄️",
    group: "第三方库与工作实战",
    title: "数据库操作：sqlite3",
    content: `
# 数据库操作：sqlite3

## 引言

很多应用需要本地数据持久化：保存用户数据、缓存结果、存储配置信息。SQLite是一个轻量级的文件型数据库，不需要安装服务，Python内置了sqlite3模块，是本地数据存储的最佳选择。

## 一、为什么用SQLite

- **零配置**：不需要安装和启动数据库服务
- **单文件**：整个数据库就是一个.db文件，方便备份和传输
- **Python内置**：import sqlite3就能用，无需pip install
- **支持标准SQL**：建表、增删改查都用标准SQL语法
- **工作场景**：桌面应用、小工具、原型开发、测试环境、数据缓存

## 二、核心操作

\`\`\`python
import sqlite3

# 连接数据库（文件不存在会自动创建）
conn = sqlite3.connect("data.db")
cursor = conn.cursor()

# 建表
cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        email TEXT UNIQUE
    )
""")

# 插入数据（用?占位符，防SQL注入！）
cursor.execute("INSERT INTO users (name, age, email) VALUES (?, ?, ?)", ("张三", 28, "YA9RfmB0@dTdpwNO.TAM"))

# 批量插入
users = [("李四", 32, "Rawe@M3YAEyC.0d9"), ("王五", 25, "eCji@2bI5UL8.vGY")]
cursor.executemany("INSERT INTO users (name, age, email) VALUES (?, ?, ?)", users)

# 查询
cursor.execute("SELECT * FROM users WHERE age > ?", (25,))
all_users = cursor.fetchall()  # 获取所有结果
one_user = cursor.fetchone()   # 获取单个结果

# 更新
cursor.execute("UPDATE users SET age = ? WHERE name = ?", (29, "张三"))

# 删除
cursor.execute("DELETE FROM users WHERE id = ?", (1,))

# 提交事务！不提交不会保存！
conn.commit()
conn.close()
\`\`\`

## 三、重要注意事项

1. **永远用?占位符**：不要用字符串拼接SQL，防止SQL注入！
2. **记得commit**：修改操作后必须调用conn.commit()，否则数据不保存
3. **用with语句自动提交**：with conn: 会自动commit或rollback
4. **Row工厂按列名访问**：conn.row_factory = sqlite3.Row，可以用row["name"]访问
    `,
    code: `
# =============================================================
# 数据库操作：sqlite3 —— 演示代码
# sqlite3是Python内置模块，无需pip install
# 功能：建表、增删改查、参数化查询、批量插入、Row工厂
# =============================================================

import sqlite3
import os

DB_FILE = "demo_students.db"


def demo_create_table(conn):
    """创建学生表"""
    print("=" * 60)
    print("【1】创建数据表")
    print("=" * 60)
    cursor = conn.cursor()
    # IF NOT EXISTS: 如果表已存在不报错
    # PRIMARY KEY AUTOINCREMENT: 主键自增
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            score REAL,
            class_name TEXT
        )
    """)
    print("  ✅ students表创建成功（或已存在）")


def demo_insert(conn):
    """插入数据"""
    print("\\n" + "=" * 60)
    print("【2】插入数据")
    print("=" * 60)
    cursor = conn.cursor()
    
    # 先清空表（演示方便）
    cursor.execute("DELETE FROM students")
    
    # 单条插入（用?占位符，永远不要字符串拼接！）
    student1 = ("张三", 20, "男", 85.5, "计算机1班")
    cursor.execute(
        "INSERT INTO students (name, age, gender, score, class_name) VALUES (?, ?, ?, ?, ?)",
        student1
    )
    print("  ✅ 插入1条数据：张三")
    
    # 批量插入
    students = [
        ("李四", 21, "女", 92.0, "计算机1班"),
        ("王五", 19, "男", 78.5, "计算机1班"),
        ("赵六", 20, "女", 88.0, "数学1班"),
        ("钱七", 22, "男", 95.5, "数学1班"),
        ("孙八", 19, "女", 81.0, "物理1班"),
    ]
    cursor.executemany(
        "INSERT INTO students (name, age, gender, score, class_name) VALUES (?, ?, ?, ?, ?)",
        students
    )
    print(f"  ✅ 批量插入{len(students)}条数据")


def demo_query(conn):
    """查询数据"""
    print("\\n" + "=" * 60)
    print("【3】查询数据")
    print("=" * 60)
    conn.row_factory = sqlite3.Row  # 让结果可以按列名访问
    cursor = conn.cursor()
    
    # 查询所有学生
    print("\\n  所有学生：")
    cursor.execute("SELECT * FROM students ORDER BY score DESC")
    rows = cursor.fetchall()
    print(f"  {'姓名':<8} {'年龄':<6} {'性别':<6} {'分数':<8} {'班级':<10}")
    print("  " + "-" * 45)
    for row in rows:
        print(f"  {row['name']:<8} {row['age']:<6} {row['gender']:<6} {row['score']:<8.1f} {row['class_name']:<10}")
    
    # 条件查询：分数大于85的学生
    print("\\n  分数大于85的学生：")
    cursor.execute("SELECT name, score, class_name FROM students WHERE score > ? ORDER BY score DESC", (85,))
    for row in cursor.fetchall():
        print(f"    {row['name']}: {row['score']}分（{row['class_name']}）")


def demo_aggregate(conn):
    """聚合统计"""
    print("\\n" + "=" * 60)
    print("【4】聚合统计（按班级）")
    print("=" * 60)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT class_name,
               COUNT(*) as count,
               AVG(score) as avg_score,
               MAX(score) as max_score,
               MIN(score) as min_score
        FROM students
        GROUP BY class_name
    """)
    print(f"\\n  {'班级':<12} {'人数':<6} {'平均分':<10} {'最高分':<10} {'最低分':<10}")
    print("  " + "-" * 50)
    for row in cursor.fetchall():
        print(f"  {row[0]:<12} {row[1]:<6} {row[2]:<10.1f} {row[3]:<10.1f} {row[4]:<10.1f}")


def demo_update_delete(conn):
    """更新和删除"""
    print("\\n" + "=" * 60)
    print("【5】更新与删除")
    print("=" * 60)
    cursor = conn.cursor()
    # 更新：张三的分数改为90
    cursor.execute("UPDATE students SET score = ? WHERE name = ?", (90.0, "张三"))
    print(f"  ✅ 更新张三的分数为90（影响{cursor.rowcount}行）")
    # 删除：删除分数小于80的
    cursor.execute("DELETE FROM students WHERE score < ?", (80,))
    print(f"  ✅ 删除分数小于80的记录（影响{cursor.rowcount}行）")


def main():
    """主函数"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        sqlite3数据库操作演示".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    # 如果数据库文件已存在先删除（方便演示）
    if os.path.exists(DB_FILE):
        os.remove(DB_FILE)
        print(f"  删除旧数据库文件：{DB_FILE}")
    # 连接数据库（文件不存在会自动创建）
    conn = sqlite3.connect(DB_FILE)
    print(f"  ✅ 连接数据库：{DB_FILE}")
    try:
        demo_create_table(conn)
        demo_insert(conn)
        conn.commit()  # 提交插入操作
        demo_query(conn)
        demo_aggregate(conn)
        demo_update_delete(conn)
        conn.commit()  # 提交更新和删除
        print("\\n" + "=" * 60)
        print("  📌 记住：用?占位符防注入；修改后记得commit()")
        print(f"  📌 数据库文件已保存为：{os.path.abspath(DB_FILE)}")
        print("=" * 60)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-os-env",
    icon: "🌿",
    group: "第三方库与工作实战",
    title: "环境变量与配置管理",
    content: `
# 环境变量与配置管理

## 引言

代码中总有一些不应该硬编码的内容：数据库密码、API密钥、调试开关、不同环境（开发/测试/生产）的不同配置。把这些直接写在代码里是安全大忌。正确的做法是使用环境变量。

## 一、为什么用环境变量

1. **安全**：密码、密钥不提交到Git
2. **灵活**：不同环境用不同配置，不用改代码
3. **规范**：符合12-Factor应用配置原则
4. **工作场景**：数据库密码、API Key、环境切换（开发/测试/生产）

## 二、os.environ基础

\`\`\`python
import os

# 读取环境变量（不存在会抛出KeyError）
db_host = os.environ["DB_HOST"]

# 安全读取（不存在返回None或默认值）
db_host = os.environ.get("DB_HOST", "localhost")
db_port = os.environ.get("DB_PORT", "5432")
debug = os.environ.get("DEBUG", "false").lower() == "true"
\`\`\`

## 三、python-dotenv：从.env文件加载

在项目根目录创建.env文件（注意：.env要加入.gitignore！）：

\`\`\`env
# .env文件
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASSWORD=mypassword123
API_KEY=sk-xxxxxxxxx
DEBUG=true
\`\`\`

\`\`\`python
from dotenv import load_dotenv
import os

# 加载.env文件（要在最开始调用）
load_dotenv()

# 然后就可以像普通环境变量一样读取
db_password = os.environ.get("DB_PASSWORD")
api_key = os.environ.get("API_KEY")
\`\`\`

## 四、最佳实践

1. **.env加入.gitignore**：永远不要提交.env到代码仓库
2. **提供.env.example**：提交一个示例文件，说明需要哪些配置，但值是假的
3. **有合理默认值**：开发环境配置默认值，方便新人上手
4. **生产环境不用.env**：生产环境直接设置环境变量（Docker/K8s/系统环境变量）
    `,
    code: `
# =============================================================
# 环境变量与配置管理 —— 演示代码
# 需要安装：pip install python-dotenv
# 功能：os.environ读取、dotenv加载、配置类封装
# =============================================================

import os
import sys

# 尝试导入dotenv
try:
    from dotenv import load_dotenv
    DOTENV_OK = True
except ImportError:
    DOTENV_OK = False
    print("⚠️  python-dotenv未安装（可选，用于加载.env文件）")
    print("💡 安装：pip install python-dotenv")


def demo_os_environ():
    """演示os.environ基础用法"""
    print("=" * 60)
    print("【1】os.environ读取环境变量")
    print("=" * 60)
    print("\\n  系统内置环境变量（部分）：")
    print(f"    PATH: {os.environ.get('PATH', '')[:80]}...")
    print(f"    HOME: {os.environ.get('HOME', '未设置')}")
    print(f"    USER: {os.environ.get('USER', '未设置')}")
    print(f"    SHELL: {os.environ.get('SHELL', '未设置')}")
    print(f"    PWD: {os.environ.get('PWD', '未设置')}")
    
    # 安全读取 vs 直接读取
    print("\\n  读取方式演示：")
    # get方法：不存在返回None或默认值（推荐！）
    db_host = os.environ.get("DB_HOST", "localhost")
    print(f"    DB_HOST（默认值）: {db_host}")
    # 直接索引：不存在会抛KeyError
    try:
        secret = os.environ["MY_SECRET_KEY"]
        print(f"    MY_SECRET_KEY: {secret}")
    except KeyError:
        print("    MY_SECRET_KEY: 未设置（直接索引抛KeyError）")


def demo_dotenv():
    """演示python-dotenv加载.env文件"""
    print("\\n" + "=" * 60)
    print("【2】python-dotenv加载.env文件")
    print("=" * 60)
    if not DOTENV_OK:
        print("  ⏭️  跳过，dotenv未安装")
        return
    # 创建临时.env文件用于演示
    env_content = """# 这是.env示例文件
DB_HOST=localhost
DB_PORT=5432
DB_USER=myapp_user
DB_PASSWORD=my_secure_password_123
API_KEY=sk-abcdefghijklmnop
DEBUG=true
ENVIRONMENT=development
"""
    env_path = ".env.demo"
    with open(env_path, "w", encoding="utf-8") as f:
        f.write(env_content)
    print(f"  创建演示.env文件：{env_path}")
    # 加载.env文件
    load_dotenv(env_path)
    print("  ✅ .env文件加载成功")
    print("\\n  从.env读取的配置：")
    print(f"    DB_HOST: {os.environ.get('DB_HOST')}")
    print(f"    DB_PORT: {os.environ.get('DB_PORT')}")
    print(f"    DB_USER: {os.environ.get('DB_USER')}")
    print(f"    DB_PASSWORD: {os.environ.get('DB_PASSWORD')}")
    print(f"    API_KEY: {os.environ.get('API_KEY')[:10]}...（已隐藏）")
    print(f"    DEBUG: {os.environ.get('DEBUG')}")
    # 类型转换
    debug = os.environ.get("DEBUG", "false").lower() == "true"
    db_port = int(os.environ.get("DB_PORT", "5432"))
    print(f"\\n  类型转换后：debug={debug}（bool）, db_port={db_port}（int）")
    # 清理演示文件
    if os.path.exists(env_path):
        os.remove(env_path)


def demo_config_class():
    """演示用配置类统一管理配置"""
    print("\\n" + "=" * 60)
    print("【3】配置类最佳实践")
    print("=" * 60)
    # 在实际项目中，你可以这样写一个Config类
    # 设置一些演示用环境变量
    os.environ["APP_DB_HOST"] = "db.example.com"
    os.environ["APP_DB_PORT"] = "3306"
    os.environ["APP_API_KEY"] = "sk-real-key-12345"
    os.environ["APP_DEBUG"] = "false"
    class Config:
        """项目配置类（集中管理所有配置）"""
        # 数据库配置
        DB_HOST = os.environ.get("APP_DB_HOST", "localhost")
        DB_PORT = int(os.environ.get("APP_DB_PORT", "5432"))
        DB_USER = os.environ.get("APP_DB_USER", "root")
        DB_PASSWORD = os.environ.get("APP_DB_PASSWORD", "")
        # 应用配置
        DEBUG = os.environ.get("APP_DEBUG", "false").lower() == "true"
        API_KEY = os.environ.get("APP_API_KEY", "")
        ENV = os.environ.get("APP_ENV", "development")
    print("  配置类读取结果：")
    print(f"    DB_HOST: {Config.DB_HOST}")
    print(f"    DB_PORT: {Config.DB_PORT}")
    print(f"    DEBUG: {Config.DEBUG}")
    print(f"    ENV: {Config.ENV}")
    print("\\n  💡 好处：配置集中管理、类型转换在一处完成、IDE有提示")


def show_best_practices():
    """显示最佳实践"""
    print("\\n" + "=" * 60)
    print("【4】配置管理最佳实践")
    print("=" * 60)
    tips = [
        "⚠️  永远不要硬编码密码、密钥在代码里！",
        "⚠️  .env文件一定要加入.gitignore！",
        "💡 提交.env.example作为模板，值用占位符",
        "💡 用os.environ.get()，不要直接os.environ[]",
        "💡 开发环境用.env，生产环境用系统环境变量",
        "💡 写一个Config类集中管理配置和类型转换",
        "💡 区分开发/测试/生产环境：ENV=development/staging/production",
    ]
    for tip in tips:
        print(f"  {tip}")


def main():
    """主函数"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        环境变量与配置管理演示".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    demo_os_environ()
    demo_dotenv()
    demo_config_class()
    show_best_practices()
    print("\\n" + "=" * 60)
    print("  📌 记住：密码不硬编码，.env不提交，Config集中管理")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-typing",
    icon: "🏷️",
    group: "第三方库与工作实战",
    title: "类型提示：让代码更可维护",
    content: `
# 类型提示：让代码更可维护

## 引言

Python是动态类型语言，变量不需要声明类型。小项目写起来很爽，但项目大了、团队人多了就会痛苦：IDE没有智能提示、看别人代码不知道参数该传什么、类型相关bug到运行时才发现。类型提示（Type Hints）解决的就是这个问题。

## 一、为什么用类型提示

1. **IDE智能提示**：写代码时自动补全，提前发现错误
2. **代码即文档**：看函数签名就知道传什么、返回什么
3. **静态检查**：用mypy可以在运行前发现类型错误
4. **团队协作**：别人看你的代码不用猜参数类型
5. **大型项目必备**：代码超过1000行后收益明显

## 二、基础语法

Python 3.5+支持类型提示：

\`\`\`python
# 基本类型
def greet(name: str, age: int) -> str:
    return f"你好，我是{name}，今年{age}岁"

# 常用类型
from typing import List, Dict, Tuple, Optional, Union

def get_names() -> List[str]:              # 返回字符串列表
    return ["张三", "李四"]

def get_user() -> Dict[str, int]:          # 返回字典
    return {"id": 1, "age": 25}

def get_coords() -> Tuple[float, float]:   # 返回元组
    return (116.40, 39.90)

def find_user(user_id: int) -> Optional[dict]:  # 可能返回None
    if user_id == 1:
        return {"name": "张三"}
    return None

# Python 3.10+更简洁写法
def process(value: int | str) -> str:      # Union可以写成|
    return str(value)

list[int]  # 代替List[int]
dict[str, int]  # 代替Dict[str,int]
\`\`\`

## 三、@dataclass：数据类神器

工作中经常需要定义"数据类"（只有属性没有太多方法），用@dataclass超级方便：

\`\`\`python
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    age: int
    email: str
    is_active: bool = True  # 默认值

# 自动生成__init__、__repr__、__eq__等
user = User(id=1, name="张三", age=28, email="YA9RfmB0@dTdpwNO.TAM")
print(user)  # User(id=1, name='张三', age=28, ...)
\`\`\`

## 四、注意事项

- 类型提示是"提示"不是强制，Python运行时不检查类型
- 用mypy做静态类型检查：\`pip install mypy && mypy your_file.py\`
- 不是所有地方都要加类型，重点是函数参数、返回值、类属性
    `,
    code: `
# =============================================================
# 类型提示：让代码更可维护 —— 演示代码
# 类型提示是Python 3.5+内置功能，无需pip install
# 功能：基础类型、泛型、Optional、Union、dataclass
# =============================================================

from typing import List, Dict, Tuple, Optional, Union
from dataclasses import dataclass
import sys


def demo_basic_types():
    """演示基础类型提示"""
    print("=" * 60)
    print("【1】基础类型提示")
    print("=" * 60)
    # 这是一个带类型提示的函数
    # name: str 表示name应该是字符串
    # age: int = 18 表示age是整数，默认值18
    # -> str 表示返回字符串
    def greet(name: str, age: int = 18) -> str:
        """一个带类型提示的问候函数"""
        return f"你好，我是{name}，今年{age}岁"
    print("  函数定义：def greet(name: str, age: int = 18) -> str:")
    print("  调用：greet('张三', 28)")
    result = greet("张三", 28)
    print(f"  返回：{result}")
    print(f"  返回类型：{type(result)}")
    # 故意传错类型演示（Python运行时不报错，但IDE会警告）
    print("\\n  ⚠️  类型提示是'提示'，Python运行时不强制检查")
    print("  比如greet(123)运行不会报错，但IDE会标红警告")


def demo_generics():
    """演示泛型类型：List/Dict/Tuple"""
    print("\\n" + "=" * 60)
    print("【2】泛型类型（List/Dict/Tuple）")
    print("=" * 60)
    def get_user_list() -> List[str]:
        """返回字符串列表"""
        return ["张三", "李四", "王五", "赵六"]
    def get_user_info() -> Dict[str, Union[str, int]]:
        """返回字典，键是字符串，值可以是字符串或整数"""
        return {"id": 1, "name": "张三", "age": 28, "email": "YA9RfmB0@dTdpwNO.TAM"}
    def get_location() -> Tuple[float, float]:
        """返回两个浮点数的元组（经度、纬度）"""
        return (116.4074, 39.9042)
    names = get_user_list()
    print(f"  get_user_list() -> List[str]")
    print(f"  结果：{names}，类型：{type(names)}")
    info = get_user_info()
    print(f"\\n  get_user_info() -> Dict[str, Union[str,int]]")
    print(f"  结果：{info}")
    loc = get_location()
    print(f"\\n  get_location() -> Tuple[float, float]")
    print(f"  结果：{loc}（经度{loc[0]}, 纬度{loc[1]}）")


def demo_optional():
    """演示Optional（可能返回None）"""
    print("\\n" + "=" * 60)
    print("【3】Optional（值或None）")
    print("=" * 60)
    def find_user_by_id(user_id: int) -> Optional[Dict[str, Union[str, int]]]:
        """根据ID查找用户，可能返回None"""
        users = {
            1: {"name": "张三", "age": 28},
            2: {"name": "李四", "age": 32}
        }
        return users.get(user_id)  # 找不到返回None
    print("  函数：find_user_by_id(user_id: int) -> Optional[dict]")
    print("  含义：可能返回dict，也可能返回None")
    user1 = find_user_by_id(1)
    user999 = find_user_by_id(999)
    print(f"\\n  查找ID=1：{user1}")
    print(f"  查找ID=999：{user999}")
    print("\\n  💡 使用Optional时，IDE会提醒你判空：")
    if user999 is not None:
        print(f"    用户名：{user999['name']}")
    else:
        print("    用户不存在，安全处理")


def demo_dataclass():
    """演示@dataclass数据类"""
    print("\\n" + "=" * 60)
    print("【4】@dataclass数据类（工作神器！）")
    print("=" * 60)
    @dataclass
    class User:
        """用户数据类"""
        id: int
        name: str
        age: int
        email: str
        is_active: bool = True  # 默认值
        department: str = "未分配"
    @dataclass
    class Product:
        """产品数据类"""
        id: int
        name: str
        price: float
        stock: int
    # 自动生成__init__，直接传参创建
    user1 = User(id=1, name="张三", age=28, email="YA9RfmB0@dTdpwNO.TAM", department="技术部")
    user2 = User(id=2, name="李四", age=32, email="Rawe@M3YAEyC.0d9")
    product = Product(id=101, name="Python实战课程", price=99.0, stock=1000)
    print("  @dataclass自动生成__init__/__repr__/__eq__")
    print(f"\\n  user1: {user1}")
    print(f"  user2: {user2}（使用默认is_active=True和默认部门）")
    print(f"  product: {product}")
    print("\\n  💡 好处：代码简洁、IDE有提示、类型清晰")


def show_benefits():
    """显示类型提示的好处"""
    print("\\n" + "=" * 60)
    print("【5】类型提示的好处")
    print("=" * 60)
    benefits = [
        "✅ IDE智能提示：写代码时自动补全方法和属性",
        "✅ 代码即文档：看函数签名就知道怎么用",
        "✅ 提前发现bug：mypy静态检查，运行前发现错误",
        "✅ 重构更安全：改代码时知道哪里会受影响",
        "✅ 团队协作：不用猜参数类型",
        "💡 Python 3.10+ 可以用list[str]代替List[str]",
        "💡 不是所有地方都要加，重点是函数和类",
    ]
    for b in benefits:
        print(f"  {b}")


def main():
    """主函数"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        Python类型提示演示".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    print(f"  Python版本：{sys.version.split()[0]}")
    demo_basic_types()
    demo_generics()
    demo_optional()
    demo_dataclass()
    show_benefits()
    print("\\n" + "=" * 60)
    print("  📌 从今天开始给函数加类型提示吧！")
    print("  📌 mypy your_code.py 可以做静态类型检查")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-asyncio",
    icon: "🚀",
    group: "第三方库与工作实战",
    title: "asyncio异步编程基础",
    content: `
# asyncio异步编程基础

## 引言

当你需要同时请求10个API、批量下载文件时，同步代码一个一个等太慢了。多线程/多进程有开销且复杂。asyncio异步编程可以在IO等待（网络请求、文件读写）时让CPU去干别的事，大幅提升IO密集型任务的效率。

## 一、同步vs异步：什么时候用

| 场景 | 推荐方式 |
|------|---------|
| 网络请求、API调用、爬虫 | asyncio/aiohttp |
| 文件IO、数据库查询 | asyncio |
| CPU密集计算（视频编码、数学计算） | 多进程multiprocessing |
| 简单脚本、单任务 | 同步代码就行 |

**简单判断**：如果任务大部分时间在"等"（等网络、等磁盘），用asyncio；如果大部分时间在"算"，用多进程。

## 二、核心概念

\`\`\`python
import asyncio

# async def定义协程（coroutine）
async def fetch_data(url):
    print(f"开始请求：{url}")
    await asyncio.sleep(1)  # 模拟IO等待（非阻塞！）
    print(f"请求完成：{url}")
    return f"{url}的数据"

# asyncio.run()运行协程
result = asyncio.run(fetch_data("https://api.example.com"))

# asyncio.gather()并发运行多个协程
async def main():
    results = await asyncio.gather(
        fetch_data("url1"),
        fetch_data("url2"),
        fetch_data("url3"),
    )
    print(results)

asyncio.run(main())
\`\`\`

上面3个请求如果是同步需要3秒，异步只需要1秒！

## 三、aiohttp：异步HTTP请求

\`\`\`bash
pip install aiohttp
\`\`\`

\`\`\`python
import aiohttp
import asyncio

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.json()

async def main():
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            fetch(session, "https://api1.example.com"),
            fetch(session, "https://api2.example.com"),
        )
\`\`\`

> ⚠️ 注意：requests是同步库，不能在asyncio里用！异步要用aiohttp。新手常犯的错是在协程里用time.sleep()（应该用asyncio.sleep()）和requests。
    `,
    code: `
# =============================================================
# asyncio异步编程基础 —— 演示代码
# aiohttp是可选依赖：pip install aiohttp
# 功能：协程定义、await等待、gather并发、同步vs异步对比
# =============================================================

import asyncio
import time
import sys

# 尝试导入aiohttp
try:
    import aiohttp
    AIOHTTP_OK = True
except ImportError:
    AIOHTTP_OK = False


def demo_sync_vs_async_concept():
    """解释同步vs异步概念"""
    print("=" * 60)
    print("【1】同步 vs 异步 概念")
    print("=" * 60)
    print("""
  同步（一个一个来）：
  ┌──────┐   ┌──────┐   ┌──────┐
  │任务1 │   │任务2 │   │任务3 │      总耗时 = 时间1+时间2+时间3
  └──────┘   └──────┘   └──────┘
  →→→→→→→→→→→→→→→→→→→→→→→→→ 时间

  异步（IO等待时切换）：
  ┌──────┐
  │任务1 │
  └──────┘─────┐
      ┌──────┐ │
      │任务2 │ │  总耗时 ≈ max(时间1,时间2,时间3)
      └──────┘ │
        ┌──────┐
        │任务3 │
        └──────┘
  →→→→→→→→→→→→→→→→→→→→→→→→→ 时间
    """)
    print("  💡 适合异步：网络请求、文件IO等'等待多'的任务")
    print("  💡 不适合：CPU密集计算（要用多进程）")


async def async_task(name: str, delay: float):
    """一个模拟的异步任务"""
    print(f"    开始任务：{name}（需要{delay}秒）")
    # asyncio.sleep是异步非阻塞等待（不是time.sleep！）
    await asyncio.sleep(delay)
    print(f"    完成任务：{name}")
    return f"{name}的结果"


def demo_sync_tasks():
    """同步方式执行任务"""
    print("\\n" + "=" * 60)
    print("【2】同步方式执行（一个一个等）")
    print("=" * 60)
    def sync_task(name, delay):
        print(f"    开始任务：{name}（需要{delay}秒）")
        time.sleep(delay)  # 阻塞等待
        print(f"    完成任务：{name}")
        return f"{name}的结果"
    start = time.time()
    results = []
    results.append(sync_task("任务A", 1))
    results.append(sync_task("任务B", 1))
    results.append(sync_task("任务C", 1))
    elapsed = time.time() - start
    print(f"\\n  同步执行3个任务（各1秒）耗时：{elapsed:.2f}秒")
    print(f"  结果：{results}")


async def demo_async_tasks():
    """异步方式并发执行任务"""
    print("\\n" + "=" * 60)
    print("【3】异步方式并发执行（同时等）")
    print("=" * 60)
    start = time.time()
    # asyncio.gather并发运行多个协程
    results = await asyncio.gather(
        async_task("任务A", 1),
        async_task("任务B", 1),
        async_task("任务C", 1),
    )
    elapsed = time.time() - start
    print(f"\\n  异步执行3个任务（各1秒）耗时：{elapsed:.2f}秒")
    print(f"  结果：{results}")
    print("\\n  🎉 同步需要3秒，异步只需要1秒！")


async def demo_async_real_example():
    """演示异步HTTP请求（如果有aiohttp的话）"""
    print("\\n" + "=" * 60)
    print("【4】异步HTTP请求演示")
    print("=" * 60)
    if not AIOHTTP_OK:
        print("  ⏭️  aiohttp未安装，跳过真实HTTP演示")
        print("  💡 安装：pip install aiohttp")
        print("\\n  演示模拟多个HTTP请求并发：")
        start = time.time()
        # 模拟请求5个不同API
        urls = [f"https://api{i}.example.com" for i in range(1, 6)]
        results = await asyncio.gather(*[async_task(f"API-{i}", 0.8) for i in range(1,6)])
        elapsed = time.time() - start
        print(f"\\n  5个API请求（各0.8秒）异步耗时：{elapsed:.2f}秒")
        print("  如果是同步需要4秒！")
        return
    print("  （真实HTTP请求演示需要联网，这里展示基本用法）")


def show_pitfalls():
    """异步常见坑点"""
    print("\\n" + "=" * 60)
    print("【5】异步常见坑点")
    print("=" * 60)
    pitfalls = [
        "⚠️  不要在协程里用time.sleep()，要用asyncio.sleep()",
        "⚠️  不要在协程里用requests，要用aiohttp",
        "⚠️  协程必须用await或asyncio.run()调用，直接调用不会执行",
        "⚠️  CPU密集型任务不要用asyncio，用multiprocessing",
        "💡 async def定义协程，await等待异步操作",
        "💡 asyncio.gather()并发执行多个协程",
        "💡 asyncio.run()是主入口（Python 3.7+）",
    ]
    for p in pitfalls:
        print(f"  {p}")


async def async_main():
    """异步主函数"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        asyncio异步编程演示".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    demo_sync_vs_async_concept()
    demo_sync_tasks()
    await demo_async_tasks()
    await demo_async_real_example()
    show_pitfalls()
    print("\\n" + "=" * 60)
    print("  📌 记住：async def + await + asyncio.gather()")
    print("  📌 异步场景：API并发、批量下载、高IO任务")
    print("=" * 60)


def main():
    """主入口"""
    if sys.version_info < (3, 7):
        print("需要Python 3.7+")
        return
    asyncio.run(async_main())


if __name__ == "__main__":
    main()
`,
  },
  {
    id: "py-best-practices",
    icon: "🏆",
    group: "第三方库与工作实战",
    title: "工作中的Python最佳实践",
    content: `
# 工作中的Python最佳实践

## 引言

写能跑的代码和写专业的、可维护的代码是两回事。工作中你写的代码不是一次性脚本，要被别人读、被别人改、要跑很久。这一章总结了工作中写Python代码的"生存法则"。

## 一、项目结构规范

\`\`\`
my-project/
├── .venv/                # 虚拟环境（不提交Git）
├── .gitignore            # Git忽略文件
├── README.md             # 项目说明
├── requirements.txt      # 依赖清单
├── .env.example          # 环境变量模板
├── src/                  # 源代码
│   ├── __init__.py
│   ├── main.py           # 入口
│   ├── config.py         # 配置
│   ├── models/           # 数据模型
│   ├── services/         # 业务逻辑
│   └── utils/            # 工具函数
├── tests/                # 单元测试
│   └── test_xxx.py
├── scripts/              # 脚本（数据库迁移、数据导入等）
└── data/                 # 数据文件
\`\`\`

## 二、编码最佳实践

**1. 用logging代替print**

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)
logger.info("程序启动")
logger.error("发生错误", exc_info=True)
\`\`\`

**2. 异常处理要细，不要裸except**

\`\`\`python
try:
    result = requests.get(url, timeout=10)
except requests.exceptions.Timeout:
    logger.warning("请求超时，重试")
except requests.exceptions.ConnectionError:
    logger.error("连接失败")
except Exception as e:  # 最后兜底，但要记录日志
    logger.exception(f"未知错误：{e}")
\`\`\`

**3. with语句管理资源**

\`\`\`python
with open("file.txt", "r", encoding="utf-8") as f:
    content = f.read()
# 不需要手动f.close()，with会自动处理
\`\`\`

**4. 写可读的代码**

- 变量名/函数名要清晰：\`get_user_by_id()\` 比 \`get()\` 好
- 函数要短小：一个函数只做一件事，超过50行考虑拆分
- 加类型提示：别人不用猜参数类型
- 适当注释：解释"为什么"而不是"做什么"
- 写docstring说明函数用途

**5. 常见性能坑**

- 循环中字符串拼接：用\`" ".join(list)\` 不要 +=
- 不要在循环里查数据库：用批量查询
- 大数据用生成器（yield）省内存

## 三、代码质量工具

\`\`\`bash
pip install black isort flake8 mypy pytest
\`\`\`

- **black**：代码格式化（不用争论风格了）
- **isort**：import排序
- **flake8**：代码检查（PEP8合规）
- **mypy**：类型检查
- **pytest**：单元测试

记住：工作中代码不是写给自己看的，是写给同事和6个月后的自己看的。写清晰的代码比写"聪明"的代码重要100倍。
    `,
    code: `
# =============================================================
# 工作中的Python最佳实践 —— 演示代码
# 全部使用标准库，无需额外安装
# 功能：项目结构、logging、异常处理、with语句、代码规范演示
# =============================================================

import logging
import time
from typing import List, Dict, Optional
from dataclasses import dataclass
from contextlib import contextmanager


def setup_logging():
    """配置logging（工作中永远用logging代替print）"""
    print("=" * 60)
    print("【1】用logging代替print")
    print("=" * 60)
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S"
    )
    logger = logging.getLogger("demo")
    logger.debug("这是DEBUG信息（开发调试用）")
    logger.info("这是INFO信息（正常运行信息）")
    logger.warning("这是WARNING信息（警告但不影响运行）")
    print("""
  💡 print只用于快速调试
  💡 正式代码用logging：
     - 可以分级（DEBUG/INFO/WARNING/ERROR）
     - 可以输出到文件
     - 有时间戳、模块名等信息
     - 生产环境可以方便调整日志级别
    """)
    return logger


@dataclass
class User:
    """用户数据类（用@dataclass，不用自己写__init__）"""
    id: int
    name: str
    email: str
    age: int


class UserService:
    """用户服务类（演示良好的代码组织）"""
    def __init__(self):
        self._users: Dict[int, User] = {
            1: User(1, "张三", "YA9RfmB0@dTdpwNO.TAM", 28),
            2: User(2, "李四", "Rawe@M3YAEyC.0d9", 32),
        }
        self.logger = logging.getLogger("UserService")
    
    def get_user(self, user_id: int) -> Optional[User]:
        """根据ID获取用户，找不到返回None"""
        return self._users.get(user_id)
    
    def create_user(self, name: str, email: str, age: int) -> User:
        """创建新用户"""
        if not name or not email:
            raise ValueError("姓名和邮箱不能为空")
        if "@" not in email:
            raise ValueError("邮箱格式不正确")
        new_id = max(self._users.keys()) + 1 if self._users else 1
        user = User(new_id, name, email, age)
        self._users[new_id] = user
        self.logger.info(f"创建用户成功：{user}")
        return user
    
    def list_users(self, min_age: int = 0) -> List[User]:
        """列出符合条件的用户"""
        return [u for u in self._users.values() if u.age >= min_age]


def demo_exception_handling(logger):
    """演示正确的异常处理方式"""
    print("\\n" + "=" * 60)
    print("【2】异常处理：粒度要细，不要裸except")
    print("=" * 60)
    service = UserService()
    
    def safe_divide(a: float, b: float) -> Optional[float]:
        """安全除法，处理各种异常情况"""
        try:
            result = a / b
            return result
        except ZeroDivisionError:
            logger.error("除数不能为0")
            return None
        except TypeError:
            logger.error(f"类型错误，a={a}({type(a)}), b={b}({type(b)})")
            return None
        except Exception as e:
            # 最后兜底，但一定要记录日志！
            logger.exception(f"未知错误：{e}")
            return None
    
    test_cases = [(10, 2), (10, 0), (10, "2"), ("a", 2)]
    for a, b in test_cases:
        result = safe_divide(a, b)
        print(f"  {a} / {b} = {result}")
    print("""
  ⚠️  禁止这样写（会吞掉所有错误包括KeyboardInterrupt）：
     try:
         ...
     except:  # 裸except！
         pass
  ✅ 应该：
     1. 捕获具体的异常类型
     2. 记录日志
     3. 适当处理或向上抛出
    """)


@contextmanager
def timer(operation_name: str):
    """上下文管理器：计时代码块（演示with语句）"""
    start = time.time()
    print(f"  开始：{operation_name}")
    yield
    elapsed = time.time() - start
    print(f"  完成：{operation_name}，耗时{elapsed:.4f}秒")


def demo_with_statement():
    """演示with语句管理资源"""
    print("\\n" + "=" * 60)
    print("【3】with语句：自动管理资源")
    print("=" * 60)
    # with语句用于需要"打开-关闭"的资源：文件、数据库连接、锁等
    print("  演示文件操作（with自动关闭文件）：")
    # 创建临时文件演示
    test_file = "demo_temp.txt"
    with open(test_file, "w", encoding="utf-8") as f:
        f.write("第一行\\n")
        f.write("第二行\\n")
        f.write("第三行\\n")
    # 不需要f.close()，with会自动关闭，即使发生异常
    print(f"  ✅ 写入文件完成")
    with open(test_file, "r", encoding="utf-8") as f:
        content = f.read()
        print(f"  ✅ 读取文件完成，内容长度：{len(content)}字符")
    # 演示自定义上下文管理器（计时）
    print("\\n  演示计时上下文管理器：")
    with timer("模拟耗时计算"):
        total = sum(i*i for i in range(100000))
    import os
    if os.path.exists(test_file):
        os.remove(test_file)
    print("""
  💡 with语句的好处：
     1. 自动释放资源（不会忘记close）
     2. 即使发生异常也会正确清理
     3. 代码更清晰
  💡 可以用@contextmanager自己定义上下文管理器
    """)


def demo_readable_code():
    """演示什么是可读的代码"""
    print("\\n" + "=" * 60)
    print("【4】写可读的代码")
    print("=" * 60)
    
    def calc_bad(lst):
        # ❌ 坏代码：变量名无意义、没有类型提示、不知道做什么
        s = 0
        for x in lst:
            if x[2] >= 18:
                s += x[3]
        return s / len([x for x in lst if x[2] >= 18]) if lst else 0
    
    def calc_average_adult_salary(users: List[tuple]) -> float:
        """✅ 好代码：计算成年用户的平均工资
        :param users: 用户列表，每个元素是(name, id, age, salary)
        :return: 平均工资，没有用户返回0
        """
        adult_salaries = [salary for name, uid, age, salary in users if age >= 18]
        if not adult_salaries:
            return 0.0
        return sum(adult_salaries) / len(adult_salaries)
    
    test_users = [
        ("张三", 1, 28, 18000),
        ("李四", 2, 17, 8000),
        ("王五", 3, 32, 25000),
    ]
    print("  ❌ 坏代码：变量名a/b/c、没有注释、不知道做什么")
    print("  ✅ 好代码：")
    print("     - 函数名清晰：calc_average_adult_salary")
    print("     - 有类型提示")
    print("     - 有docstring说明做什么")
    print("     - 中间变量有意义")
    result = calc_average_adult_salary(test_users)
    print(f"\\n  计算结果：成年用户平均工资 = {result:.0f}")


def show_checklist():
    """显示工作代码检查清单"""
    print("\\n" + "=" * 60)
    print("【5】工作代码检查清单")
    print("=" * 60)
    checklist = [
        "✅ 项目结构清晰：src/tests/scripts分离",
        "✅ 使用虚拟环境，requirements.txt管理依赖",
        "✅ 用logging代替print",
        "✅ 异常处理粒度细，没有裸except",
        "✅ with语句管理资源（文件、连接）",
        "✅ 变量/函数命名清晰，不用拼音和缩写",
        "✅ 函数短小，一个函数只做一件事",
        "✅ 加类型提示（函数参数、返回值）",
        "✅ 敏感信息（密码、Key）用环境变量",
        "✅ 代码格式化：black + isort",
        "✅ 核心逻辑有单元测试（pytest）",
        "✅ 不硬编码，配置分离",
    ]
    for item in checklist:
        print(f"  {item}")
    print("""
  💡 记住：代码是写给人看的，顺便给机器执行。
  💡 你写的每一行代码，都要想到6个月后同事（包括你自己）会看它。
  💡 写清晰的代码比写"聪明"的代码重要100倍。
    """)


def main():
    """主函数"""
    print("\\n" + "╔" + "═"*58 + "╗")
    print("║" + "        Python工作最佳实践演示".center(58) + "║")
    print("╚" + "═"*58 + "╝")
    logger = setup_logging()
    demo_exception_handling(logger)
    demo_with_statement()
    demo_readable_code()
    show_checklist()
    print("=" * 60)
    print("  🎯 恭喜你完成《Python工作实战手册》第七批！")
    print("  你已经掌握了Python工作必备的核心技能。")
    print("=" * 60)


if __name__ == "__main__":
    main()
`,
  },
];
