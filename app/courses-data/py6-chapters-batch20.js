export const chapters = [
  {
    id: "py6-project-cli-tool",
    group: "综合实战项目",
    icon: "🛠️",
    title: "实战项目 1：命令行待办事项工具",
    content: `## 实战项目 1：命令行待办事项工具

### 一、项目需求分析

日常开发中，我们经常需要一个轻量级的任务管理工具。市面上的待办 App 虽然功能丰富，但启动慢、依赖多、需要登录。本项目的目标是**用纯 Python 标准库实现一个命令行待办工具**，做到开箱即用、数据本地化、零依赖。

**核心功能需求**：

| 功能 | 命令 | 说明 |
|------|------|------|
| 添加任务 | \`todo add "买牛奶"\` | 支持优先级、标签、截止日期 |
| 查看列表 | \`todo list\` | 支持按状态/优先级/标签过滤 |
| 标记完成 | \`todo done 3\` | 按 ID 标记完成 |
| 删除任务 | \`todo delete 5\` | 按 ID 删除 |
| 清理已完成 | \`todo clear\` | 批量清理 |

**非功能需求**：
- 数据用 JSON 存储到本地文件（\`~/.todo.json\`），方便版本控制
- 启动速度 < 100ms（不依赖网络）
- 支持中英文，终端表格对齐美观
- 单文件可运行，跨平台

### 二、架构设计

整个工具采用**三层架构**，职责清晰分离：

\`\`\`
┌─────────────────────────────────────┐
│  CLI 接口层 (argparse)               │  ← 解析命令行参数
├─────────────────────────────────────┤
│  业务逻辑层 (TodoService)            │  ← add/list/done/delete
├─────────────────────────────────────┤
│  数据存储层 (Storage + JSON 文件)     │  ← load/save
└─────────────────────────────────────┘
\`\`\`

**模块划分**：

| 模块 | 职责 | 关键技术 |
|------|------|----------|
| \`Todo\` 数据模型 | 表示单个任务 | \`dataclass\` |
| \`Storage\` 存储层 | 读写 JSON 文件 | \`json\` + 文件 IO |
| \`TodoService\` 业务层 | 增删改查逻辑 | 列表操作、过滤 |
| \`CLI\` 接口层 | 参数解析分发 | \`argparse\` 子命令 |
| \`Formatter\` 输出层 | 表格化打印 | 字符串格式化 |

### 三、技术选型与理由

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 参数解析 | \`argparse\` | 标准库自带，支持子命令、自动生成帮助 |
| 数据格式 | JSON | 人类可读、标准库原生支持、无需 schema |
| 数据模型 | \`dataclass\` | Python 3.7+，自动生成 \`__init__\`/\`__repr__\` |
| 存储位置 | \`~/.todo.json\` | 用户目录隔离，不污染项目 |
| 表格输出 | 手动格式化 | 不依赖 \`tabulate\`，控制更精细 |

> 💡 为什么不用 SQLite？待办列表通常 < 1000 条，JSON 读写足够快，且文件可手动编辑、git 可追踪。SQLite 适合上万条记录或需要复杂查询的场景。

### 四、代码实现思路

#### 4.1 数据模型层

用 \`dataclass\` 定义 \`Todo\`，字段包括 id、title、priority、tags、due、done、created_at。\`__post_init__\` 中初始化默认值（tags 为空列表、created_at 自动填充当前时间）。

\`\`\`python
from dataclasses import dataclass, asdict, field
from datetime import datetime
from typing import List, Optional

@dataclass
class Todo:
    id: int
    title: str
    priority: str = "medium"          # low / medium / high
    tags: List[str] = field(default_factory=list)
    due: Optional[str] = None
    done: bool = False
    created_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M")
\`\`\`

> ⚠️ **避坑**：\`tags: List[str] = []\` 是经典陷阱——可变默认值会被所有实例共享。\`dataclass\` 用 \`field(default_factory=list)\` 解决，每次实例化生成新列表。

#### 4.2 存储层

\`Storage\` 类封装 JSON 文件读写。load 时文件不存在返回空列表；save 时用 \`ensure_ascii=False\` 保留中文，\`indent=2\` 方便人工阅读。

\`\`\`python
import json, os

class Storage:
    def __init__(self, path):
        self.path = path
    
    def load(self):
        if not os.path.exists(self.path):
            return []
        with open(self.path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def save(self, todos):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(todos, f, ensure_ascii=False, indent=2)
\`\`\`

#### 4.3 业务层

\`TodoService\` 持有 storage 实例，提供 add/list/done/delete/clear 方法。每次操作都是 "加载 → 修改 → 保存" 模式，保证数据一致性。

- **add**：计算新 ID（\`max(ids) + 1\`），创建 Todo，追加保存
- **list**：可选按 status / priority / tag 过滤
- **done**：按 ID 查找，设置 \`done=True\`
- **delete**：按 ID 过滤掉对应记录

#### 4.4 CLI 接口层

\`argparse\` 的 \`add_subparsers\` 实现子命令模式，每个子命令注册独立参数：

\`\`\`python
import argparse
parser = argparse.ArgumentParser(prog="todo")
sub = parser.add_subparsers(dest="command", required=True)

p_add = sub.add_parser("add", help="添加任务")
p_add.add_argument("title")
p_add.add_argument("-p", "--priority", choices=["low","medium","high"], default="medium")
p_add.add_argument("-t", "--tags", nargs="*", default=[])
p_add.add_argument("-d", "--due")

p_list = sub.add_parser("list", help="查看任务")
p_list.add_argument("-s", "--status", choices=["all","done","todo"], default="all")
\`\`\`

#### 4.5 表格输出

手动计算列宽，用 \`str.ljust\` 对齐。优先级用 emoji 标记（🔴 高 / 🟡 中 / 🟢 低），状态用 ✅/⬜。

### 五、关键数据结构与算法

**任务 ID 生成**：采用自增策略 \`max(existing_ids, default=0) + 1\`。简单可靠，但不保证连续（删除后会有空洞）。如需连续 ID 需重新编号，但会破坏外部引用。

**过滤算法**：用列表推导式链式过滤，时间复杂度 O(n)。待办量 < 1000 时无需索引。

\`\`\`python
result = [t for t in todos
          if (status == "all" or (t["done"] == (status == "done")))
          and (not priority or t["priority"] == priority)
          and (not tag or tag in t["tags"])]
\`\`\`

### 六、测试策略

| 测试类型 | 方法 | 覆盖点 |
|----------|------|--------|
| 单元测试 | \`unittest\` + 临时文件 | add/list/done/delete 各方法 |
| 边界测试 | 空列表、不存在的 ID | 不崩溃、合理提示 |
| 集成测试 | 模拟完整命令流程 | 增删改查闭环 |
| 数据测试 | 手动编辑 JSON 后加载 | 容错处理 |

测试时用 \`tempfile.NamedTemporaryFile\` 创建临时存储，避免污染用户目录。

### 七、扩展方向

1. **提醒功能**：结合 \`datetime\` 检查 \`due\` 临近任务，配合 cron 定时通知
2. **多列表**：支持 \`todo work add\` / \`todo home list\`，按项目隔离
3. **导入导出**：支持 CSV、Markdown 表格导出，方便分享
4. **同步**：数据上传到 Git 仓库或自建 API 实现多设备同步
5. **子任务**：任务支持嵌套，记录 parent_id 形成树结构
6. **Web UI**：套一层 \`http.server\` 提供 Web 界面

### 八、业务场景类比

- **类比 Git**：\`add\` 类似 \`git add\`，\`list\` 类似 \`git status\`，\`done\` 类似 \`git commit\`（标记里程碑）
- **类比数据库**：JSON 文件 = 表，每条 Todo = 行，CLI 命令 = SQL（\`add\`=INSERT，\`list\`=SELECT，\`done\`=UPDATE，\`delete\`=DELETE）
- **实际场景**：个人 GTD 管理、团队轻量任务看板、CI/CD 流水线步骤记录

### 九、避坑提示

1. **可变默认参数**：\`def f(items=[])\` 会导致所有调用共享同一列表，务必用 \`None\` + 内部初始化或 \`default_factory\`
2. **JSON 编码**：\`datetime\` 不能直接序列化，需先转字符串；\`ensure_ascii=False\` 才能正确保存中文
3. **文件并发**：多进程同时写 JSON 会冲突，生产环境需加文件锁 (\`fcntl\`) 或改用 SQLite
4. **路径跨平台**：用 \`os.path.expanduser("~")\` 而非硬编码 \`/home/user\`
5. **argparse required**：Python 3.7+ 才支持 \`required=True\`，旧版本需手动检查
6. **ID 冲突**：并发添加时 \`max(ids)+1\` 可能重复，可用 \`uuid4\` 或原子计数器

### 十、最佳实践总结

1. **分层清晰**：数据模型 / 存储 / 业务 / 接口分离，便于替换实现（如 JSON 换 SQLite）
2. **dataclass 建模**：比 dict 更安全，有类型提示和 IDE 补全
3. **存储抽象**：通过 Storage 类隔离 IO，方便单元测试注入临时文件
4. **子命令模式**：CLI 工具超过 3 个功能就用 subparsers，比 flag 模式更直观
5. **输出友好**：表格对齐、颜色标记、emoji 状态，提升终端体验
6. **防御性编程**：文件不存在、JSON 损坏、ID 不存在都要有合理降级
7. **零依赖优先**：能用标准库解决就不引入第三方，降低部署成本`,
    code: `# 命令行待办事项工具 - 完整可运行演示
import argparse
import json
import os
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import List, Optional

# 演示用临时文件，不污染用户目录
TODO_FILE = "/tmp/demo_todo.json"

@dataclass
class Todo:
    """待办事项数据模型"""
    id: int
    title: str
    priority: str = "medium"                       # low / medium / high
    tags: List[str] = field(default_factory=list)  # 标签列表
    due: Optional[str] = None                      # 截止日期
    done: bool = False
    created_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().strftime("%Y-%m-%d %H:%M")

class Storage:
    """JSON 文件存储层"""
    def __init__(self, path):
        self.path = path
    
    def load(self):
        if not os.path.exists(self.path):
            return []
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    
    def save(self, todos):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(todos, f, ensure_ascii=False, indent=2)

class TodoService:
    """业务逻辑层"""
    PRIORITY_ICON = {"high": "🔴", "medium": "🟡", "low": "🟢"}
    
    def __init__(self, storage):
        self.storage = storage
    
    def add(self, title, priority="medium", tags=None, due=None):
        todos = self.storage.load()
        new_id = max([t["id"] for t in todos], default=0) + 1
        todo = Todo(id=new_id, title=title, priority=priority,
                    tags=tags or [], due=due)
        todos.append(asdict(todo))
        self.storage.save(todos)
        return todo
    
    def list(self, status="all", priority=None, tag=None):
        todos = self.storage.load()
        result = []
        for t in todos:
            if status == "done" and not t["done"]:
                continue
            if status == "todo" and t["done"]:
                continue
            if priority and t["priority"] != priority:
                continue
            if tag and tag not in t["tags"]:
                continue
            result.append(t)
        return result
    
    def done(self, todo_id):
        todos = self.storage.load()
        for t in todos:
            if t["id"] == todo_id:
                t["done"] = True
                self.storage.save(todos)
                return True
        return False
    
    def delete(self, todo_id):
        todos = self.storage.load()
        new_todos = [t for t in todos if t["id"] != todo_id]
        if len(new_todos) == len(todos):
            return False
        self.storage.save(new_todos)
        return True
    
    def clear_done(self):
        todos = self.storage.load()
        remaining = [t for t in todos if not t["done"]]
        removed = len(todos) - len(remaining)
        self.storage.save(remaining)
        return removed

def print_table(todos):
    """表格化输出"""
    if not todos:
        print("  （空空如也，添加一个任务吧）")
        return
    print(f"  {'ID':<4} {'状态':<4} {'优先级':<6} {'标题':<20} {'标签':<12} {'截止':<12}")
    print("  " + "-" * 70)
    for t in todos:
        status = "✅" if t["done"] else "⬜"
        pri = TodoService.PRIORITY_ICON.get(t["priority"], "⚪")
        tags = ",".join(t["tags"]) if t["tags"] else "-"
        due = t["due"] or "-"
        title = t["title"][:20]
        print(f"  {t['id']:<4} {status:<4} {pri:<6} {title:<20} {tags:<12} {due:<12}")

def build_parser():
    """构建 CLI 参数解析器"""
    parser = argparse.ArgumentParser(prog="todo", description="命令行待办工具")
    sub = parser.add_subparsers(dest="command")
    
    p_add = sub.add_parser("add", help="添加任务")
    p_add.add_argument("title", help="任务标题")
    p_add.add_argument("-p", "--priority", choices=["low","medium","high"], default="medium")
    p_add.add_argument("-t", "--tags", nargs="*", default=[])
    p_add.add_argument("-d", "--due", help="截止日期 YYYY-MM-DD")
    
    p_list = sub.add_parser("list", help="查看任务")
    p_list.add_argument("-s", "--status", choices=["all","done","todo"], default="all")
    p_list.add_argument("-p", "--priority", choices=["low","medium","high"])
    p_list.add_argument("-t", "--tag")
    
    p_done = sub.add_parser("done", help="标记完成")
    p_done.add_argument("id", type=int)
    
    p_del = sub.add_parser("delete", help="删除任务")
    p_del.add_argument("id", type=int)
    
    sub.add_parser("clear", help="清理已完成")
    return parser

def main():
    # 清理旧演示数据
    if os.path.exists(TODO_FILE):
        os.remove(TODO_FILE)
    
    storage = Storage(TODO_FILE)
    service = TodoService(storage)
    
    print("=== 命令行待办事项工具 演示 ===\\n")
    
    print("--- 1. 添加任务 ---")
    service.add("完成季度报告", priority="high", tags=["工作","紧急"], due="2026-07-10")
    service.add("买牛奶和面包", priority="low", tags=["生活"])
    service.add("学习 Python 装饰器", priority="medium", tags=["学习"])
    service.add("回复客户邮件", priority="high", tags=["工作"], due="2026-07-06")
    service.add("周末爬山", priority="low", tags=["生活","健康"])
    print("  已添加 5 个任务")
    
    print("\\n--- 2. 查看全部任务 ---")
    print_table(service.list())
    
    print("\\n--- 3. 按优先级过滤（high）---")
    print_table(service.list(priority="high"))
    
    print("\\n--- 4. 按标签过滤（生活）---")
    print_table(service.list(tag="生活"))
    
    print("\\n--- 5. 标记完成（ID=2 买牛奶）---")
    if service.done(2):
        print("  ✅ 任务 2 已标记完成")
    print_table(service.list())
    
    print("\\n--- 6. 只看待办（未完成）---")
    print_table(service.list(status="todo"))
    
    print("\\n--- 7. 只看已完成 ---")
    print_table(service.list(status="done"))
    
    print("\\n--- 8. 删除任务（ID=3）---")
    if service.delete(3):
        print("  🗑️ 任务 3 已删除")
    print_table(service.list())
    
    print("\\n--- 9. 清理已完成 ---")
    removed = service.clear_done()
    print(f"  已清理 {removed} 条已完成任务")
    print_table(service.list())
    
    print("\\n--- 10. 查看存储的 JSON 文件内容 ---")
    with open(TODO_FILE, "r", encoding="utf-8") as f:
        print(f.read())
    
    # 清理
    os.remove(TODO_FILE)
    print("=== 演示结束 ===")

if __name__ == "__main__":
    main()`
  },
  {
    id: "py6-project-crawler",
    group: "综合实战项目",
    icon: "🕷️",
    title: "实战项目 2：博客爬虫与数据分析",
    content: `## 实战项目 2：博客爬虫与数据分析

### 一、项目需求分析

内容平台运营需要定期分析博客文章数据：哪位作者产出最多？哪个时间段发文密集？正文中哪些关键词出现最频繁？手动统计费时费力，本项目用 Python 标准库实现一个**博客爬虫 + 数据分析**管道。

**核心功能需求**：

| 功能 | 输入 | 输出 |
|------|------|------|
| 网页抓取 | URL / HTML 字符串 | 原始 HTML |
| 内容解析 | HTML | 结构化文章列表 |
| 数据导出 | 文章列表 | CSV 文件 |
| 作者统计 | 文章列表 | 按作者分组计数 |
| 时间分析 | 文章列表 | 按月份分布 |
| 词频统计 | 正文文本 | Top N 关键词 |

### 二、架构设计

采用**管道模式**，数据单向流动，每个阶段职责单一：

\`\`\`
HTML 输入 → 解析器 → 文章列表 → ┬→ CSV 导出
                                 ├→ 作者统计
                                 ├→ 时间分析
                                 └→ 词频统计
\`\`\`

**模块划分**：

| 模块 | 职责 | 技术 |
|------|------|------|
| \`Fetcher\` | 获取 HTML | \`urllib.request\`（演示用内置字符串） |
| \`BlogParser\` | 解析 HTML | \`html.parser.HTMLParser\` |
| \`Exporter\` | 导出 CSV | \`csv\` 模块 |
| \`Analyzer\` | 数据统计 | \`collections.Counter\` / \`defaultdict\` |

### 三、技术选型与理由

| 决策点 | 选择 | 理由 |
|--------|------|------|
| HTTP 请求 | \`urllib.request\` | 标准库，无需安装；生产用 \`requests\` 更方便 |
| HTML 解析 | \`html.parser.HTMLParser\` | 标准库事件驱动解析器，轻量 |
| CSV 导出 | \`csv.DictWriter\` | 标准库，正确处理引号、逗号转义 |
| 词频统计 | \`collections.Counter\` | 内置高性能计数器，\`most_common\` 一行搞定 |
| 分词 | 简单 split | 演示用；中文需 \`jieba\` |

> 💡 为什么不用 BeautifulSoup？它是第三方库，需 \`pip install\`。\`html.parser\` 虽然API底层些，但零依赖、足够应对规则化页面。生产环境推荐 \`lxml\`（最快）或 \`BeautifulSoup\`（最易用）。

### 四、代码实现思路

#### 4.1 HTMLParser 工作原理

\`HTMLParser\` 是**事件驱动**的 SAX 风格解析器，遍历 HTML 时触发回调：

- \`handle_starttag(tag, attrs)\`：遇到开始标签
- \`handle_endtag(tag)\`：遇到结束标签
- \`handle_data(data)\`：遇到文本内容
- \`handle_startendtag\`：遇到自闭合标签（如 \`<meta/>\`）

我们需要维护一个**状态机**：记录当前在哪个标签内，决定是否捕获文本。

#### 4.2 BlogParser 状态设计

\`\`\`python
class BlogParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.articles = []        # 解析结果
        self.current = None       # 当前文章 dict
        self.capture = None       # 当前正在捕获的字段名
    
    def handle_starttag(self, tag, attrs):
        if tag == "article":
            self.current = {"title":"","author":"","date":"","content":""}
        elif self.current:
            if tag == "h1":
                self.capture = "title"
            elif tag == "meta":
                attrs_dict = dict(attrs)
                if attrs_dict.get("name") == "author":
                    self.current["author"] = attrs_dict.get("content","")
                elif attrs_dict.get("name") == "date":
                    self.current["date"] = attrs_dict.get("content","")
            elif tag == "div" and dict(attrs).get("class") == "content":
                self.capture = "content"
\`\`\`

#### 4.3 词频统计

中文分词是难点。演示版用简单策略：去除标点、按空格和常见虚词切分。生产环境用 \`jieba.cut\` 效果更好。

\`\`\`python
import re
from collections import Counter

def word_freq(text, top_n=10):
    # 去标点，按非汉字/字母数字分割
    words = re.findall(r'[\\u4e00-\\u9fa5a-zA-Z]+', text)
    stopwords = {"的","了","是","在","和","与","也","都","就","而"}
    filtered = [w for w in words if w not in stopwords and len(w) > 1]
    return Counter(filtered).most_common(top_n)
\`\`\`

### 五、关键数据结构

**文章列表**：\`list[dict]\`，每条 dict 含 title/author/date/content。用 dict 而非 dataclass 是因为爬虫数据字段可能动态变化。

**Counter**：\`dict\` 子类，专为计数设计。\`most_common(n)\` 返回出现次数最多的 n 个元素，底层用堆排序，时间复杂度 O(n log k)。

**defaultdict(list)**：按 key 自动初始化空列表，避免手动检查 key 是否存在的样板代码。

### 六、测试策略

| 测试点 | 方法 |
|--------|------|
| 解析正确性 | 构造已知 HTML，断言字段值 |
| 空文章处理 | 畸形 HTML 不崩溃 |
| 编码处理 | UTF-8 中文正确提取 |
| 统计准确性 | 手动验证计数结果 |
| CSV 导出 | 用 \`csv.DictReader\` 回读校验 |

### 七、扩展方向

1. **真实网络请求**：用 \`urllib.request.urlopen\` 配合 \`User-Agent\` 头抓取真实页面
2. **增量爬取**：记录已爬 URL，用 \`set\` 去重，支持断点续爬
3. **并发爬取**：\`concurrent.futures.ThreadPoolExecutor\` 并发请求，注意限速
4. **持久化**：存入 SQLite，支持历史趋势分析
5. **反爬应对**：随机延迟、代理池、Cookie 管理
6. **正文提取**：用 readability 算法自动识别正文区块

### 八、业务场景类比

- **类比 ETL**：抓取=Extract，解析清洗=Transform，CSV/统计=Load/Analyze
- **类比编译器**：HTML=源码，Parser=词法+语法分析，文章列表=AST，统计=代码分析
- **实际场景**：舆情监控、竞品分析、内容聚合、SEO 审计

### 九、避坑提示

1. **编码问题**：网页可能是 GBK/UTF-8，需根据 \`Content-Type\` 或 meta charset 判断；统一 decode 为 str 再处理
2. **HTML 不规范**：真实网页常有未闭合标签、嵌套错误，\`html.parser\` 有一定容错但仍需防御
3. **反爬机制**：频繁请求会被封 IP，务必加延迟（\`time.sleep\`）和 User-Agent
4. **法律合规**：遵守 \`robots.txt\`，尊重版权，不爬个人隐私数据
5. **内存控制**：大页面分块解析，\`HTMLParser.feed\` 支持多次调用
6. **Counter 切片**：\`most_common\` 返回 list 不是 dict，遍历注意类型

### 十、最佳实践总结

1. **管道设计**：抓取 → 解析 → 分析各阶段解耦，可独立测试和复用
2. **事件驱动解析**：HTMLParser 适合大文件，内存占用恒定
3. **数据用 dict**：爬虫数据半结构化，dict 比 dataclass 更灵活
4. **Counter 简化统计**：别手写计数循环，\`collections.Counter\` 又快又准
5. **CSV 用标准库**：\`csv\` 模块正确处理引号转义，别用 \`split(",")\`
6. **异常隔离**：单条文章解析失败不应中断整体，用 try/except 跳过并记录
7. **可观测性**：打印抓取进度、成功/失败计数，方便调试`,
    code: `# 博客爬虫与数据分析 - 完整可运行演示
from html.parser import HTMLParser
import csv
import io
import re
from collections import Counter, defaultdict
from datetime import datetime

# 内置示例 HTML，避免真实网络请求
SAMPLE_HTML = """
<!DOCTYPE html>
<html><head><title>技术博客</title></head><body>
<article>
  <h1>Python 装饰器深入理解</h1>
  <meta name="author" content="Alice">
  <meta name="date" content="2026-01-15">
  <div class="content">装饰器是 Python 的高级特性，本质上是一个接收函数并返回新函数的高阶函数。掌握装饰器需要理解闭包和函数作为一等公民的概念。</div>
</article>
<article>
  <h1>用标准库构建 Web 服务</h1>
  <meta name="author" content="Bob">
  <meta name="date" content="2026-02-20">
  <div class="content">Python 标准库的 http.server 模块虽然简单，但足以构建轻量级 Web 服务。本文介绍如何用 BaseHTTPRequestHandler 实现 RESTful API。</div>
</article>
<article>
  <h1>数据管道设计模式</h1>
  <meta name="author" content="Alice">
  <meta name="date" content="2026-02-28">
  <div class="content">数据管道是数据处理系统的核心。生成器管道模式能优雅地处理流式数据，节省内存。每个阶段是一个生成器函数，数据逐步流过。</div>
</article>
<article>
  <h1>并发编程对比</h1>
  <meta name="author" content="Carol">
  <meta name="date" content="2026-03-10">
  <div class="content">Python 并发有三种方式：多线程适合 IO 密集，多进程适合 CPU 密集，asyncio 适合高并发 IO。选择合适的并发模型很重要。</div>
</article>
<article>
  <h1>正则表达式实战</h1>
  <meta name="author" content="Bob">
  <meta name="date" content="2026-03-25">
  <div class="content">正则表达式是文本处理的利器。从简单的字符串匹配到复杂的模式提取，正则表达式都能胜任。但复杂的正则可读性差，需要注释。</div>
</article>
</body></html>
"""

class BlogParser(HTMLParser):
    """博客 HTML 解析器，提取文章结构化数据"""
    def __init__(self):
        super().__init__()
        self.articles = []
        self.current = None
        self.capture = None
    
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "article":
            self.current = {"title": "", "author": "", "date": "", "content": ""}
        elif self.current is not None:
            if tag == "h1":
                self.capture = "title"
            elif tag == "meta":
                name = attrs_dict.get("name")
                if name in ("author", "date"):
                    self.current[name] = attrs_dict.get("content", "")
            elif tag == "div" and attrs_dict.get("class") == "content":
                self.capture = "content"
    
    def handle_endtag(self, tag):
        if tag == "article" and self.current is not None:
            self.articles.append(self.current)
            self.current = None
        if tag in ("h1", "div"):
            self.capture = None
    
    def handle_data(self, data):
        text = data.strip()
        if text and self.capture and self.current is not None:
            self.current[self.capture] += text

def fetch_html():
    """模拟抓取 HTML（演示用内置字符串）"""
    return SAMPLE_HTML

def export_csv(articles, filepath="/tmp/blog_articles.csv"):
    """导出为 CSV"""
    with open(filepath, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["title","author","date","content"])
        writer.writeheader()
        for a in articles:
            writer.writerow(a)
    return filepath

def stats_by_author(articles):
    """按作者分组统计"""
    counter = Counter(a["author"] for a in articles)
    return counter

def stats_by_month(articles):
    """按月份统计发文量"""
    monthly = defaultdict(int)
    for a in articles:
        try:
            month = a["date"][:7]  # YYYY-MM
            monthly[month] += 1
        except (IndexError, TypeError):
            pass
    return dict(sorted(monthly.items()))

def word_frequency(articles, top_n=10):
    """词频统计（简单中文分词）"""
    stopwords = {"的","了","是","在","和","与","也","都","就","而",
                 "一个","本文","介绍","但","需要","能","到","为"}
    all_text = " ".join(a["content"] for a in articles)
    # 提取中文词和英文单词
    words = re.findall(r'[\\u4e00-\\u9fa5]+|[a-zA-Z]+', all_text)
    # 中文按 2-3 字滑窗（简化分词）
    tokens = []
    for w in words:
        if re.match(r'[a-zA-Z]', w):
            if len(w) > 2 and w.lower() not in stopwords:
                tokens.append(w.lower())
        else:
            # 中文：取 2 字组合
            for i in range(len(w) - 1):
                token = w[i:i+2]
                if token not in stopwords:
                    tokens.append(token)
    return Counter(tokens).most_common(top_n)

def main():
    print("=== 博客爬虫与数据分析 演示 ===\\n")
    
    print("--- 1. 抓取 HTML ---")
    html = fetch_html()
    print(f"  HTML 长度: {len(html)} 字符")
    
    print("\\n--- 2. 解析文章 ---")
    parser = BlogParser()
    parser.feed(html)
    articles = parser.articles
    print(f"  共解析出 {len(articles)} 篇文章")
    for i, a in enumerate(articles, 1):
        print(f"  [{i}] 《{a['title']}》 - {a['author']} ({a['date']})")
    
    print("\\n--- 3. 导出 CSV ---")
    csv_path = export_csv(articles)
    print(f"  已导出到: {csv_path}")
    # 回读验证
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    print(f"  回读验证: {len(rows)} 行")
    print(f"  首行: {rows[0]['title']} - {rows[0]['author']}")
    
    print("\\n--- 4. 按作者统计 ---")
    author_stats = stats_by_author(articles)
    print(f"  {'作者':<10} {'文章数':<6}")
    print("  " + "-" * 20)
    for author, count in author_stats.most_common():
        print(f"  {author:<10} {count:<6}")
    
    print("\\n--- 5. 按月份统计 ---")
    monthly = stats_by_month(articles)
    print(f"  {'月份':<10} {'发文量':<6}")
    print("  " + "-" * 20)
    for month, count in monthly.items():
        bar = "📰" * count
        print(f"  {month:<10} {count:<6} {bar}")
    
    print("\\n--- 6. 词频统计 Top 10 ---")
    freq = word_frequency(articles, top_n=10)
    print(f"  {'词语':<8} {'出现次数':<8}")
    print("  " + "-" * 20)
    for word, count in freq:
        bar = "█" * count
        print(f"  {word:<8} {count:<8} {bar}")
    
    print("\\n--- 7. 完整文章详情 ---")
    for i, a in enumerate(articles, 1):
        print(f"  \\n  [{i}] {a['title']}")
        print(f"      作者: {a['author']}  日期: {a['date']}")
        print(f"      正文: {a['content'][:50]}...")
    
    # 清理
    import os
    if os.path.exists(csv_path):
        os.remove(csv_path)
    print("\\n=== 演示结束 ===")

if __name__ == "__main__":
    main()`
  },
  {
    id: "py6-project-web-api",
    group: "综合实战项目",
    icon: "🌐",
    title: "实战项目 3：用 http.server 构建 REST API",
    content: `## 实战项目 3：用 http.server 构建 REST API

### 一、项目需求分析

团队内部需要一个轻量级用户管理 API，用于开发测试和小规模内部工具。不想引入 Flask/FastAPI 等框架，希望用**纯标准库**实现一个符合 RESTful 规范的 API 服务。

**核心功能需求**：

| HTTP 方法 | 路径 | 功能 | 状态码 |
|-----------|------|------|--------|
| GET | \`/api/users\` | 获取所有用户 | 200 |
| GET | \`/api/users/:id\` | 获取单个用户 | 200 / 404 |
| POST | \`/api/users\` | 创建用户 | 201 / 400 |
| PUT | \`/api/users/:id\` | 更新用户 | 200 / 404 |
| DELETE | \`/api/users/:id\` | 删除用户 | 204 / 404 |

**设计约束**：
- 请求/响应均用 JSON
- 正确的 HTTP 状态码
- 统一错误响应格式 \`{"error": "message"}\`
- 内存存储（重启丢失，演示足够）

### 二、架构设计

\`\`\`
┌──────────────────────────────────┐
│  HTTPServer (监听端口)            │
├──────────────────────────────────┤
│  APIHandler (请求处理器)          │
│   ├─ 路由分发                     │
│   ├─ do_GET / do_POST / ...       │
│   └─ JSON 序列化                  │
├──────────────────────────────────┤
│  UserStore (内存存储)             │
│   └─ dict[int, dict]              │
└──────────────────────────────────┘
\`\`\`

**模块划分**：

| 模块 | 职责 |
|------|------|
| \`UserStore\` | 内存数据存储，CRUD 操作 |
| \`APIHandler\` | 继承 \`BaseHTTPRequestHandler\`，处理 HTTP 请求 |
| \`Router\` | 路径匹配与分发（简化版内联在 Handler 中） |
| \`Response\` | 统一 JSON 响应封装 |

### 三、技术选型与理由

| 决策点 | 选择 | 理由 |
|--------|------|------|
| HTTP 服务器 | \`http.server.HTTPServer\` | 标准库，零依赖 |
| 请求处理 | \`BaseHTTPRequestHandler\` | 提供钩子方法，灵活控制 |
| 路由 | 手动字符串匹配 | RESTful 路径简单，无需正则框架 |
| 存储 | 内存 dict | 演示用；生产换 SQLite/Redis |
| 测试客户端 | \`urllib.request\` | 标准库 HTTP 客户端 |

> 💡 **http.server 的局限**：单线程默认（HTTPServer），高并发需 \`ThreadingHTTPServer\`；不支持 ASGI/WSGI；无中间件、无 ORM。生产环境用 FastAPI/Flask + uvicorn。但理解 http.server 有助于掌握 Web 框架底层原理。

### 四、代码实现思路

#### 4.1 BaseHTTPRequestHandler 生命周期

每个请求创建一个 Handler 实例，依次调用：

1. \`do_GET\` / \`do_POST\` 等方法（根据方法分发）
2. 通过 \`self.path\` 获取路径，\`self.headers\` 获取请求头
3. 读取请求体：\`self.rfile.read(content_length)\`
4. 发送响应：\`self.send_response(status)\` → \`self.send_header()\` → \`self.end_headers()\` → \`self.wfile.write(body)\`

#### 4.2 路由设计

RESTful 路由模式简单，手动解析即可：

\`\`\`python
path = self.path  # /api/users 或 /api/users/5
parts = path.strip("/").split("/")
# ["api", "users"]      → 列表
# ["api", "users", "5"] → 单个资源
\`\`\`

#### 4.3 JSON 响应封装

\`\`\`python
def _send_json(self, status, data):
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)
\`\`\`

> ⚠️ **必须设置 Content-Length**，否则客户端会 hang 住等待更多数据（HTTP/1.1 keep-alive）。

#### 4.4 请求体解析

\`\`\`python
length = int(self.headers.get("Content-Length", 0))
raw = self.rfile.read(length)
data = json.loads(raw)
\`\`\`

### 五、关键 HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 OK | 成功 | GET / PUT 成功 |
| 201 Created | 已创建 | POST 创建成功 |
| 204 No Content | 无内容 | DELETE 成功 |
| 400 Bad Request | 请求错误 | JSON 解析失败、字段缺失 |
| 404 Not Found | 未找到 | 资源不存在、路径不匹配 |
| 500 Internal Error | 服务器错误 | 未捕获异常 |

### 六、测试策略

| 测试类型 | 方法 |
|----------|------|
| CRUD 闭环 | 创建 → 查询 → 更新 → 删除 → 确认删除 |
| 错误路径 | 不存在的 ID、畸形 JSON、错误路径 |
| 状态码 | 每个操作返回正确状态码 |
| 并发 | 多线程同时请求（ThreadingHTTPServer）|

测试时把服务器跑在随机端口（端口 0 让系统分配），线程内 \`serve_forever\`，主线程用 \`urllib\` 发请求，结束后 \`shutdown\`。

### 七、扩展方向

1. **持久化**：存储换 SQLite，数据落盘
2. **认证**：JWT token 中间件，\`Authorization\` 头校验
3. **CORS**：响应头加 \`Access-Control-Allow-Origin\`
4. **分页**：\`/api/users?page=1&size=20\`
5. **日志中间件**：记录请求方法、路径、状态码、耗时
6. **ThreadingHTTPServer**：\`from http.server import ThreadingHTTPServer\` 支持并发
7. **Swagger 文档**：自动生成 OpenAPI 规范

### 八、业务场景类比

- **类比餐厅**：HTTPServer=餐厅，APIHandler=服务员，路由=菜单，UserStore=后厨仓库，请求=点单，响应=上菜，状态码=上菜结果（200 正常上菜、404 没这道菜、400 客人点单写错）
- **实际场景**：内部 mock 服务、CI/CD 测试桩、IoT 设备接口、原型开发

### 九、避坑提示

1. **Content-Length 必填**：不设会导致客户端阻塞，特别是 keep-alive 连接
2. **线程安全**：默认 \`HTTPServer\` 单线程，并发请求排队；用 \`ThreadingHTTPServer\` 后存储需加锁
3. **端口占用**：\`HTTPServer((host, 0), handler)\` 让系统分配可用端口，避免冲突
4. **优雅关闭**：\`server.shutdown()\` 停止 \`serve_forever\`，再 \`server.server_close()\` 释放端口
5. **路径编码**：URL 含中文/空格需 \`urllib.parse.unquote\` 解码
6. **JSON 解析防御**：\`json.loads\` 可能抛 \`JSONDecodeError\`，必须 try/except 返回 400
7. **日志噪音**：默认每个请求打印日志，重写 \`log_message\` 静音

### 十、最佳实践总结

1. **统一响应封装**：\`_send_json\` 方法统一处理 Content-Type/Length，避免遗漏
2. **错误处理集中**：所有异常转成 JSON 错误响应，不暴露堆栈给客户端
3. **路由前置校验**：路径不匹配立即 404，不进入业务逻辑
4. **状态码语义化**：严格遵守 HTTP 规范，201/204/400 不能含糊
5. **存储抽象**：UserStore 独立类，方便替换实现（内存→SQLite→Redis）
6. **测试用随机端口**：\`port=0\` 避免端口冲突，测试可并行
7. **线程模型明确**：单线程简单但慢，多线程需加锁，根据场景选择`,
    code: `# 用 http.server 构建 REST API - 完整可运行演示
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import threading
import urllib.request
import urllib.error

# 内存存储
class UserStore:
    """线程安全的用户存储"""
    def __init__(self):
        self._data = {}
        self._next_id = 1
        self._lock = threading.Lock()
    
    def all(self):
        with self._lock:
            return list(self._data.values())
    
    def get(self, uid):
        with self._lock:
            return self._data.get(uid)
    
    def create(self, data):
        with self._lock:
            uid = self._next_id
            self._next_id += 1
            data["id"] = uid
            self._data[uid] = data
            return data
    
    def update(self, uid, data):
        with self._lock:
            if uid not in self._data:
                return None
            data["id"] = uid
            self._data[uid] = data
            return data
    
    def delete(self, uid):
        with self._lock:
            return self._data.pop(uid, None)

store = UserStore()

class APIHandler(BaseHTTPRequestHandler):
    """REST API 请求处理器"""
    
    def _send_json(self, status, data):
        """统一 JSON 响应"""
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    
    def _read_body(self):
        """读取并解析 JSON 请求体"""
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return None
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))
    
    def _parse_path(self):
        """解析路径，返回 (resource, id_str)"""
        parts = self.path.strip("/").split("/")
        if len(parts) >= 2 and parts[0] == "api" and parts[1] == "users":
            if len(parts) == 2:
                return "users", None
            elif len(parts) == 3:
                return "users", parts[2]
        return None, None
    
    def do_GET(self):
        resource, id_str = self._parse_path()
        if resource != "users":
            self._send_json(404, {"error": "路径不存在"})
            return
        if id_str is None:
            self._send_json(200, store.all())
        else:
            try:
                uid = int(id_str)
            except ValueError:
                self._send_json(400, {"error": "ID 必须是数字"})
                return
            user = store.get(uid)
            if user is None:
                self._send_json(404, {"error": "用户不存在"})
            else:
                self._send_json(200, user)
    
    def do_POST(self):
        resource, id_str = self._parse_path()
        if resource != "users" or id_str is not None:
            self._send_json(404, {"error": "路径不存在"})
            return
        try:
            data = self._read_body()
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(400, {"error": "JSON 格式错误"})
            return
        if not data or "name" not in data:
            self._send_json(400, {"error": "缺少 name 字段"})
            return
        created = store.create(data)
        self._send_json(201, created)
    
    def do_PUT(self):
        resource, id_str = self._parse_path()
        if resource != "users" or id_str is None:
            self._send_json(404, {"error": "路径不存在"})
            return
        try:
            uid = int(id_str)
        except ValueError:
            self._send_json(400, {"error": "ID 必须是数字"})
            return
        try:
            data = self._read_body()
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(400, {"error": "JSON 格式错误"})
            return
        if not data:
            self._send_json(400, {"error": "请求体为空"})
            return
        updated = store.update(uid, data)
        if updated is None:
            self._send_json(404, {"error": "用户不存在"})
        else:
            self._send_json(200, updated)
    
    def do_DELETE(self):
        resource, id_str = self._parse_path()
        if resource != "users" or id_str is None:
            self._send_json(404, {"error": "路径不存在"})
            return
        try:
            uid = int(id_str)
        except ValueError:
            self._send_json(400, {"error": "ID 必须是数字"})
            return
        deleted = store.delete(uid)
        if deleted is None:
            self._send_json(404, {"error": "用户不存在"})
        else:
            self._send_json(200, {"message": "已删除", "id": uid})
    
    def log_message(self, *args):
        pass  # 静音日志

def http_request(url, method="GET", data=None):
    """发送 HTTP 请求的工具函数"""
    headers = {"Content-Type": "application/json; charset=utf-8"}
    body = None
    if data is not None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, {"error": raw}

def main():
    print("=== REST API 服务演示 ===\\n")
    
    # 启动服务器（随机端口）
    server = ThreadingHTTPServer(("127.0.0.1", 0), APIHandler)
    port = server.server_address[1]
    base = f"http://127.0.0.1:{port}"
    
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    
    try:
        print("--- 1. 获取空列表 ---")
        status, data = http_request(f"{base}/api/users")
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 2. 创建用户 Alice ---")
        status, data = http_request(f"{base}/api/users", "POST", {"name":"Alice","age":30})
        print(f"  状态码: {status}, 数据: {data}")
        alice_id = data["id"]
        
        print("\\n--- 3. 创建用户 Bob ---")
        status, data = http_request(f"{base}/api/users", "POST", {"name":"Bob","age":25})
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 4. 创建用户 Carol ---")
        status, data = http_request(f"{base}/api/users", "POST", {"name":"Carol","age":28})
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 5. 获取所有用户 ---")
        status, data = http_request(f"{base}/api/users")
        print(f"  状态码: {status}")
        print(f"  用户列表: {data}")
        
        print(f"\\n--- 6. 获取单个用户 (ID={alice_id}) ---")
        status, data = http_request(f"{base}/api/users/{alice_id}")
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 7. 更新用户 Alice ---")
        status, data = http_request(f"{base}/api/users/{alice_id}", "PUT", {"name":"Alice","age":31})
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 8. 删除用户 Bob ---")
        status, data = http_request(f"{base}/api/users/2", "DELETE")
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 9. 错误场景：不存在的用户 ---")
        status, data = http_request(f"{base}/api/users/999")
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 10. 错误场景：缺少字段 ---")
        status, data = http_request(f"{base}/api/users", "POST", {"age":20})
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 11. 错误场景：路径不存在 ---")
        status, data = http_request(f"{base}/api/orders")
        print(f"  状态码: {status}, 数据: {data}")
        
        print("\\n--- 12. 最终用户列表 ---")
        status, data = http_request(f"{base}/api/users")
        print(f"  状态码: {status}, 数据: {data}")
        
    finally:
        server.shutdown()
        server.server_close()
    
    print("\\n=== 演示结束 ===")

if __name__ == "__main__":
    main()`
  },
  {
    id: "py6-project-data-pipeline",
    group: "综合实战项目",
    icon: "🛢️",
    title: "实战项目 4：CSV 数据处理管道",
    content: `## 实战项目 4：CSV 数据处理管道

### 一、项目需求分析

数据分析场景中，原始 CSV 数据往往脏乱差：有重复行、缺失值、格式不统一。我们需要构建一个**数据处理管道**，把原始数据清洗、转换、聚合后输出可分析的结果。

**核心功能需求**：

| 阶段 | 操作 | 说明 |
|------|------|------|
| 读取 | \`csv.DictReader\` | 流式读取 CSV |
| 清洗 | 去重、填空、类型转换 | 保证数据质量 |
| 转换 | 字段映射、计算字段 | 派生新维度 |
| 聚合 | 分组统计 | 按维度汇总 |
| 输出 | CSV / JSON | 多格式导出 |

**性能要求**：用生成器管道处理，内存占用恒定，可处理超过内存大小的文件。

### 二、架构设计

采用**生成器管道**模式，每个阶段是一个生成器函数，数据流式通过：

\`\`\`
CSV 文件 → read() → clean() → transform() → aggregate() → write()
            gen      gen        gen             reduce        IO
\`\`\`

每个生成器 \`yield\` 一条记录，下游消费后再触发上游读取，形成**惰性求值**链路。

**模块划分**：

| 模块 | 职责 | 类型 |
|------|------|------|
| \`read_csv\` | 读取 CSV 为 dict 流 | 生成器 |
| \`dedupe\` | 去重 | 生成器 |
| \`fill_missing\` | 填充空值 | 生成器 |
| \`convert_types\` | 类型转换 | 生成器 |
| \`add_fields\` | 计算派生字段 | 生成器 |
| \`aggregate\` | 分组聚合 | 归约（消费生成器） |
| \`write_csv\` | 输出 CSV | 消费者 |

### 三、技术选型与理由

| 决策点 | 选择 | 理由 |
|--------|------|------|
| CSV 读取 | \`csv.DictReader\` | 自动用首行做字段名，返回 dict |
| 管道模式 | 生成器函数 | 惰性求值，内存恒定 |
| 聚合 | \`defaultdict\` | 分组时自动初始化容器 |
| 输出 | \`csv.DictWriter\` + \`json.dump\` | 标准库多格式 |

> 💡 为什么不用 pandas？pandas 功能强大但内存占用高（一次性加载全部数据），且是第三方依赖。生成器管道适合**流式大数据**，内存友好。数据量 < 1GB 且需要复杂分析时，pandas 更合适。

### 四、代码实现思路

#### 4.1 生成器管道原理

生成器函数（含 \`yield\`）返回一个迭代器。调用 \`next()\` 时执行到 \`yield\` 暂停并返回值，再次调用从暂停处恢复。这让数据可以**逐条流动**而非全部加载。

\`\`\`python
def read_csv(data):
    reader = csv.DictReader(io.StringIO(data))
    for row in reader:
        yield row          # 逐行 yield

def clean(rows):
    for row in rows:        # 接收上游生成器
        if not row["name"]:
            continue        # 过滤无效行
        yield row

# 串联：clean(read_csv(data))
\`\`\`

调用 \`next(pipeline)\` 时，\`clean\` 请求 \`read_csv\` 的下一条，\`read_csv\` 读一行返回。整条链路只有一条记录在内存中。

#### 4.2 去重策略

用 \`set\` 记录已见过的 key。注意 set 会增长，若去重 key 空间巨大需用布隆过滤器。

\`\`\`python
def dedupe(rows, key_func):
    seen = set()
    for row in rows:
        key = key_func(row)
        if key not in seen:
            seen.add(key)
            yield row
\`\`\`

#### 4.3 类型转换

CSV 读出的都是字符串，需按字段类型转换。转换失败时降级为默认值并记录。

\`\`\`python
def convert_types(rows, schema):
    for row in rows:
        for field, conv in schema.items():
            try:
                row[field] = conv(row[field])
            except (ValueError, TypeError):
                row[field] = conv("0")  # 降级
        yield row
\`\`\`

#### 4.4 聚合

聚合是**归约**操作，消费整个生成器后产出汇总结果。用 \`defaultdict(list)\` 分组，再计算统计量。

\`\`\`python
def aggregate(rows, group_key, agg_field):
    groups = defaultdict(list)
    for row in rows:
        groups[row[group_key]].append(row[agg_field])
    return {k: {"count": len(v), "avg": sum(v)/len(v)} for k, v in groups.items()}
\`\`\`

### 五、关键数据结构

| 结构 | 用途 | 优势 |
|------|------|------|
| 生成器 | 管道各阶段 | 惰性求值，内存 O(1) |
| \`set\` | 去重 | O(1) 查找 |
| \`defaultdict(list)\` | 分组 | 自动初始化空列表 |
| \`dict\` | 单条记录 | 字段名访问，可读性好 |

### 六、测试策略

| 测试点 | 方法 |
|--------|------|
| 去重正确性 | 构造重复行，验证过滤 |
| 空值处理 | 缺失字段，验证填充默认值 |
| 类型转换 | 字符串数字，验证转 int |
| 聚合准确性 | 手动计算对比 |
| 大数据性能 | 模拟 10 万行，验证内存稳定 |
| 异常容错 | 脏数据不中断管道 |

### 七、扩展方向

1. **真实文件流**：\`open(file)\` 返回的文件对象本身是迭代器，可逐行读取
2. **并行管道**：用 \`multiprocessing.Pool\` 并行处理批次
3. **增量处理**：记录处理位置，支持断点续跑
4. **Schema 校验**：用 \`pydantic\` 或自定义校验器严格验证字段
5. **SQL 输出**：直接写入 SQLite，支持后续 SQL 查询
6. **监控指标**：统计各阶段处理条数、耗时、错误率

### 八、业务场景类比

- **类比工厂流水线**：read=原材料入库，clean=质检剔除不良品，transform=加工，aggregate=打包统计，write=成品入库
- **类比 Unix 管道**：\`cat data | grep -v空 | awk '{...}' | sort | uniq -c\`，每个生成器对应一个命令
- **实际场景**：日志分析、ETL 数据仓库、报表生成、数据清洗

### 九、避坑提示

1. **生成器只能迭代一次**：消费完就空了，需要重复使用要 \`list()\` 物化或重新创建
2. **中间状态**：生成器是惰性的，不消费就不执行；调试时可加 print 或 \`list()\` 触发
3. **异常传播**：生成器内的异常会沿管道传播，需在各阶段 try/except
4. **内存陷阱**：\`aggregate\` 必须缓存全部分组结果，是内存瓶颈；超大分组可用外部排序
5. **类型转换顺序**：先填空再转换，否则 \`int("")\` 报错
6. **CSV 注入**：以 \`=\` 开头的单元格在 Excel 中会被当公式，需转义
7. **编码问题**：用 \`encoding="utf-8"\` 显式指定，避免 Windows 默认 GBK

### 十、最佳实践总结

1. **生成器管道**：流式处理大数据，内存恒定，是 Python 数据处理的精髓
2. **每阶段单一职责**：clean 只清洗，transform 只转换，便于测试复用
3. **失败降级**：单条记录出错跳过而非中断，记录错误数
4. **schema 显式声明**：类型转换用 dict 映射字段，集中管理
5. **聚合分离**：聚合是 reduce 操作，与 map 阶段分开写
6. **多格式输出**：CSV 便于 Excel，JSON 便于程序读取，按需选择
7. **可观测性**：管道各阶段打印处理进度，方便定位卡顿`,
    code: `# CSV 数据处理管道 - 完整可运行演示
import csv
import io
import json
from collections import defaultdict, Counter

# 示例 CSV 数据（含重复、空值、类型混乱）
SAMPLE_CSV = """name,age,city,salary,department,join_date
Alice,30,Beijing,15000,Engineering,2022-03-15
Bob,25,Shanghai,12000,Marketing,2023-01-20
Carol,,Beijing,18000,Engineering,2021-11-08
David,35,Shenzhen,22000,Engineering,2020-06-01
Alice,30,Beijing,15000,Engineering,2022-03-15
Eve,28,,13000,Sales,2023-07-10
Frank,40,Guangzhou,25000,Engineering,2019-04-22
Grace,32,Shanghai,20000,Marketing,2021-09-30
Heidi,29,Beijing,16000,Sales,2022-12-05
Ivan,45,Shenzhen,30000,Engineering,2018-02-14
Bob,25,Shanghai,12000,Marketing,2023-01-20
Judy,27,,11000,Sales,2024-01-10
"""

def read_csv_stream(data):
    """阶段1：读取 CSV 为 dict 流"""
    reader = csv.DictReader(io.StringIO(data))
    for row in reader:
        yield dict(row)

def dedupe(rows, key_fields):
    """阶段2：去重"""
    seen = set()
    skipped = 0
    for row in rows:
        key = tuple(row[f] for f in key_fields)
        if key in seen:
            skipped += 1
            continue
        seen.add(key)
        yield row
    print(f"  [去重] 跳过 {skipped} 条重复记录")

def fill_missing(rows, defaults):
    """阶段3：填充空值"""
    for row in rows:
        for field, default in defaults.items():
            if not row.get(field):
                row[field] = default
        yield row

def convert_types(rows, schema):
    """阶段4：类型转换"""
    for row in rows:
        for field, conv in schema.items():
            try:
                row[field] = conv(row[field])
            except (ValueError, TypeError):
                row[field] = conv("0")
        yield row

def add_fields(rows):
    """阶段5：计算派生字段"""
    for row in rows:
        row["annual_salary"] = row["salary"] * 12
        row["level"] = "Senior" if row["age"] >= 30 else "Junior"
        row["tenure_years"] = 2026 - int(row["join_date"][:4])
        yield row

def aggregate(rows):
    """阶段6：聚合统计（归约操作）"""
    by_dept = defaultdict(list)
    by_city = defaultdict(int)
    by_level = defaultdict(int)
    total = 0
    for row in rows:
        by_dept[row["department"]].append(row)
        by_city[row["city"]] += 1
        by_level[row["level"]] += 1
        total += 1
    
    dept_stats = {}
    for dept, members in by_dept.items():
        salaries = [m["salary"] for m in members]
        dept_stats[dept] = {
            "count": len(members),
            "total_salary": sum(salaries),
            "avg_salary": round(sum(salaries) / len(salaries), 2),
            "avg_age": round(sum(m["age"] for m in members) / len(members), 1),
        }
    
    return {
        "total_employees": total,
        "by_department": dept_stats,
        "by_city": dict(by_city),
        "by_level": dict(by_level),
    }

def write_csv(rows, filepath):
    """输出 CSV"""
    rows = list(rows)  # 物化以获取字段名
    if not rows:
        return
    with open(filepath, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

def main():
    print("=== CSV 数据处理管道 演示 ===\\n")
    
    print("--- 1. 原始数据预览 ---")
    print(SAMPLE_CSV[:200] + "...")
    
    print("\\n--- 2. 构建生成器管道 ---")
    # 串联各阶段（此时还未真正执行）
    pipeline = add_fields(
        convert_types(
            fill_missing(
                dedupe(
                    read_csv_stream(SAMPLE_CSV),
                    key_fields=["name", "age", "city"]
                ),
                defaults={"age": "0", "city": "Unknown"}
            ),
            schema={"age": int, "salary": int}
        )
    )
    print("  管道: read → dedupe → fill → convert → add_fields")
    
    print("\\n--- 3. 物化并查看清洗后数据 ---")
    cleaned = list(pipeline)
    print(f"  清洗后记录数: {len(cleaned)}")
    print(f"  {'姓名':<8} {'年龄':<5} {'城市':<10} {'月薪':<7} {'部门':<12} {'级别':<8} {'年薪':<8}")
    print("  " + "-" * 70)
    for r in cleaned:
        print(f"  {r['name']:<8} {r['age']:<5} {r['city']:<10} {r['salary']:<7} {r['department']:<12} {r['level']:<8} {r['annual_salary']:<8}")
    
    print("\\n--- 4. 重新构建管道用于聚合 ---")
    pipeline2 = add_fields(
        convert_types(
            fill_missing(
                dedupe(
                    read_csv_stream(SAMPLE_CSV),
                    key_fields=["name", "age", "city"]
                ),
                defaults={"age": "0", "city": "Unknown"}
            ),
            schema={"age": int, "salary": int}
        )
    )
    
    print("\\n--- 5. 按部门聚合统计 ---")
    stats = aggregate(pipeline2)
    print(f"  总员工数: {stats['total_employees']}")
    print(f"  {'部门':<14} {'人数':<5} {'总薪资':<10} {'平均薪资':<10} {'平均年龄':<8}")
    print("  " + "-" * 55)
    for dept, s in stats["by_department"].items():
        print(f"  {dept:<14} {s['count']:<5} {s['total_salary']:<10} {s['avg_salary']:<10} {s['avg_age']:<8}")
    
    print("\\n--- 6. 按城市分布 ---")
    for city, count in sorted(stats["by_city"].items(), key=lambda x: -x[1]):
        bar = "👥" * count
        print(f"  {city:<12} {count} {bar}")
    
    print("\\n--- 7. 按级别分布 ---")
    for level, count in stats["by_level"].items():
        bar = "📊" * count
        print(f"  {level:<8} {count} {bar}")
    
    print("\\n--- 8. 输出清洗后的 CSV 文件 ---")
    csv_path = "/tmp/employees_cleaned.csv"
    pipeline3 = add_fields(
        convert_types(
            fill_missing(
                dedupe(
                    read_csv_stream(SAMPLE_CSV),
                    key_fields=["name", "age", "city"]
                ),
                defaults={"age": "0", "city": "Unknown"}
            ),
            schema={"age": int, "salary": int}
        )
    )
    write_csv(pipeline3, csv_path)
    print(f"  已输出: {csv_path}")
    with open(csv_path, "r", encoding="utf-8") as f:
        print(f.read())
    
    print("--- 9. 输出聚合结果 JSON ---")
    json_path = "/tmp/employees_stats.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print(f"  已输出: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        print(f.read())
    
    # 清理
    import os
    for p in [csv_path, json_path]:
        if os.path.exists(p):
            os.remove(p)
    print("=== 演示结束 ===")

if __name__ == "__main__":
    main()`
  },
  {
    id: "py6-project-chat-server",
    group: "综合实战项目",
    icon: "💬",
    title: "实战项目 5：Socket 多人聊天室",
    content: `## 实战项目 5：Socket 多人聊天室

### 一、项目需求分析

多人聊天室是网络编程的经典练习项目，涵盖 socket、线程、并发同步等核心知识点。本项目用**纯标准库**实现一个支持多客户端的命令行聊天室。

**核心功能需求**：

| 功能 | 说明 |
|------|------|
| 多客户端连接 | 多个用户同时在线聊天 |
| 昵称系统 | 用户设置昵称，消息显示昵称 |
| 消息广播 | 一人发送，所有人收到 |
| 私聊 | \`@昵称 消息\` 发送私聊 |
| 命令系统 | \`/quit\` 退出、\`/list\` 在线列表、\`/help\` 帮助 |
| 消息历史 | 新用户加入时查看最近 N 条历史 |
| 系统通知 | 用户加入/退出自动通知 |

### 二、架构设计

采用**客户端-服务器**架构，服务器维护所有连接：

\`\`\`
┌──────────────┐     ┌─────────────────────┐     ┌──────────────┐
│  Client A    │◄───►│                     │◄───►│  Client B    │
│ (昵称 Alice) │     │   ChatServer        │     │ (昵称 Bob)   │
└──────────────┘     │  ┌───────────────┐  │     └──────────────┘
                     │  │ clients dict  │  │
┌──────────────┐     │  │ history deque │  │     ┌──────────────┐
│  Client C    │◄───►│  │ lock          │  │     │  Client D    │
│ (昵称 Carol) │     │  └───────────────┘  │     │ (昵称 Dave)  │
└──────────────┘     └─────────────────────┘     └──────────────┘
\`\`\`

**模块划分**：

| 模块 | 职责 | 技术 |
|------|------|------|
| \`ChatServer\` | 接受连接、管理客户端 | \`socket\` + \`threading\` |
| \`ClientHandler\` | 处理单个客户端 | 独立线程 |
| \`MessageRouter\` | 广播/私聊路由 | 共享 dict + lock |
| \`HistoryStore\` | 消息历史 | \`collections.deque\` |
| \`ChatClient\` | 客户端连接逻辑 | \`socket\` + 线程 |

### 三、技术选型与理由

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 网络通信 | \`socket\` TCP | 可靠传输，标准库 |
| 并发模型 | 每客户端一线程 | 简单直观，适合小规模 |
| 同步机制 | \`threading.Lock\` | 保护共享数据（客户端列表） |
| 消息历史 | \`collections.deque\` | 自动淘汰旧消息，O(1) 操作 |
| 消息分隔 | 换行符 \`\\n\` | 简单文本协议 |

> 💡 为什么不用 asyncio？线程模型更易理解，适合教学。asyncio 适合高并发（上千连接），聊天室通常 < 100 人，线程模型足够。生产环境可考虑 asyncio + aiohttp。

### 四、代码实现思路

#### 4.1 服务器主循环

\`\`\`python
import socket
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.bind(("0.0.0.0", 9999))
server_socket.listen(5)
while True:
    client_sock, addr = server_socket.accept()
    thread = threading.Thread(target=handle_client, args=(client_sock,))
    thread.start()
\`\`\`

每个新连接起一个线程处理，主循环继续 accept。

#### 4.2 客户端处理

\`\`\`python
def handle_client(sock):
    # 1. 接收昵称
    nick = sock.recv(1024).decode().strip()
    # 2. 注册到 clients
    with lock:
        clients[nick] = sock
    # 3. 广播加入通知
    broadcast(f"{nick} 加入了聊天室")
    # 4. 消息循环
    while True:
        msg = sock.recv(1024).decode()
        if msg == "/quit":
            break
        broadcast(f"{nick}: {msg}")
    # 5. 清理
    with lock:
        del clients[nick]
    sock.close()
\`\`\`

#### 4.3 广播与线程安全

\`clients\` dict 被所有线程共享，读写必须加锁。\`broadcast\` 遍历所有客户端发送消息：

\`\`\`python
def broadcast(message):
    with lock:
        for nick, sock in clients.items():
            try:
                sock.sendall(message.encode())
            except BrokenPipeError:
                pass  # 客户端已断开
\`\`\`

#### 4.4 消息历史

用 \`deque(maxlen=50)\` 自动保留最近 50 条，新用户加入时推送历史。

### 五、关键并发问题

| 问题 | 场景 | 解决 |
|------|------|------|
| 竞态条件 | 多线程同时修改 clients | \`Lock\` 保护 |
| 死锁 | 广播时持锁等待发送 | 拷贝客户端列表后释放锁再发送 |
| 客户端断开 | recv 返回空 / BrokenPipe | try/except 跳过 |
| 消息边界 | TCP 是流，需分隔符 | 用 \`\\n\` 分隔或长度前缀 |
| 资源泄漏 | 线程未结束、socket 未关闭 | finally 块确保清理 |

### 六、测试策略

| 测试点 | 方法 |
|--------|------|
| 多客户端 | 模拟 3+ 客户端连接 |
| 广播正确性 | 一人发消息，验证其他人收到 |
| 私聊 | 验证只有目标收到 |
| 退出处理 | 客户端 /quit 后通知其他人 |
| 历史推送 | 新用户收到最近消息 |
| 异常断开 | 客户端直接关闭，服务器不崩 |

**演示说明**：为避免阻塞，code 字段用**模拟方式**演示聊天流程，不开真实 socket 监听。真实代码结构相同，只是 IO 用 socket 而非 print。

### 七、扩展方向

1. **群组功能**：\`/join #room\` 加入频道，按频道隔离广播
2. **文件传输**：扩展协议支持二进制消息
3. **消息持久化**：历史存入 SQLite，支持离线消息
4. **用户认证**：登录注册，密码哈希存储
5. **WebSocket**：用 \`websockets\` 库支持浏览器客户端
6. **加密通信**：用 \`ssl.SSLContext\` 包裹 socket（\`SSLContext.wrap_socket()\`）
7. **心跳检测**：定期 ping/pong，清理僵尸连接

### 八、业务场景类比

- **类比电话总机**：ChatServer=总机，ClientHandler=接线员，clients dict=通话线路表，broadcast=群呼，私聊=转接
- **类比论坛**：消息历史=帖子列表，昵称=用户名，加入通知=新人发帖报到
- **实际场景**：客服系统、游戏大厅、协作工具、IoT 设备通信

### 九、避坑提示

1. **TCP 粘包**：TCP 是字节流无边界，\`recv\` 可能收到半条或多条消息。需用分隔符（\`\\n\`）或长度前缀协议
2. **阻塞 recv**：\`recv\` 默认阻塞，客户端断开返回空 bytes，需检测退出
3. **锁的粒度**：广播时持锁太久会阻塞其他线程，应拷贝列表后释放锁
4. **BrokenPipe**：向已关闭 socket 发送抛异常，需 try/except
5. **daemon 线程**：客户端线程设 \`daemon=True\`，主进程退出时自动结束
6. **端口复用**：\`setsockopt(SO_REUSEADDR)\` 避免重启时 "Address already in use"
7. **编码一致**：收发都指定 \`utf-8\`，避免 Windows 默认 GBK 乱码
8. **资源释放**：socket 用完必须 close，建议用 \`with\` 或 finally

### 十、最佳实践总结

1. **线程模型清晰**：主线程 accept，工作线程处理客户端，职责分离
2. **共享数据加锁**：clients、history 等共享结构必须 \`Lock\` 保护
3. **消息协议明确**：定义清楚消息格式（分隔符/长度/类型），别依赖运气
4. **异常隔离**：单个客户端异常不影响其他人，try/except 包裹处理逻辑
5. **优雅退出**：捕获 KeyboardInterrupt，通知所有客户端，关闭 socket
6. **历史用 deque**：自动淘汰，无需手动管理大小
7. **演示用模拟**：教学/测试时用 print 模拟流程，避免真实 socket 阻塞`,
    code: `# Socket 多人聊天室 - 模拟演示（用 print 模拟，不开真实 socket 监听避免阻塞）
import threading
import time
from collections import deque
from datetime import datetime

class SimulatedChatServer:
    """模拟聊天服务器（演示逻辑，真实场景替换 print 为 socket 通信）"""
    
    def __init__(self, history_size=50):
        self.clients = {}              # 昵称 -> 模拟客户端队列
        self.history = deque(maxlen=history_size)
        self.lock = threading.Lock()
        self.event_log = []            # 事件日志
    
    def _log(self, msg):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.event_log.append(f"[{timestamp}] {msg}")
    
    def register(self, nickname):
        """客户端注册昵称"""
        with self.lock:
            if nickname in self.clients:
                return False, "昵称已存在"
            self.clients[nickname] = []
            self._log(f"[系统] {nickname} 加入了聊天室")
            # 推送历史消息
            return True, list(self.history)
    
    def broadcast(self, sender, message):
        """广播消息给所有在线客户端"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        full_msg = f"[{timestamp}] {sender}: {message}"
        with self.lock:
            self.history.append(full_msg)
            recipients = list(self.clients.keys())
        self._log(full_msg)
        return recipients
    
    def private_message(self, sender, recipient, message):
        """私聊消息"""
        with self.lock:
            if recipient not in self.clients:
                return False, f"用户 {recipient} 不在线"
        timestamp = datetime.now().strftime("%H:%M:%S")
        msg = f"[{timestamp}] (私聊) {sender} -> {recipient}: {message}"
        self._log(msg)
        return True, msg
    
    def quit(self, nickname):
        """客户端退出"""
        with self.lock:
            if nickname in self.clients:
                del self.clients[nickname]
                self._log(f"[系统] {nickname} 离开了聊天室")
                return True
        return False
    
    def list_users(self):
        """获取在线用户列表"""
        with self.lock:
            return list(self.clients.keys())
    
    def get_history(self, n=10):
        """获取最近 n 条历史"""
        with self.lock:
            return list(self.history)[-n:]
    
    def show_log(self):
        """显示事件日志"""
        print("  --- 服务器事件日志 ---")
        for entry in self.event_log:
            print(f"  {entry}")

class SimulatedClient:
    """模拟客户端"""
    def __init__(self, server, nickname):
        self.server = server
        self.nickname = nickname
        self.received = []
    
    def join(self):
        ok, history = self.server.register(self.nickname)
        if ok:
            self.received.extend(history)
            return True
        return False
    
    def send(self, message):
        if message == "/quit":
            self.server.quit(self.nickname)
            return False
        elif message == "/list":
            users = self.server.list_users()
            self.received.append(f"在线用户: {', '.join(users)}")
            return True
        elif message.startswith("@"):
            # 私聊: @nickname message
            parts = message[1:].split(" ", 1)
            if len(parts) == 2:
                ok, msg = self.server.private_message(self.nickname, parts[0], parts[1])
                if ok:
                    self.received.append(msg)
                else:
                    self.received.append(f"[错误] {msg}")
            return True
        else:
            self.server.broadcast(self.nickname, message)
            return True
    
    def show_inbox(self):
        print(f"  [{self.nickname}] 收件箱:")
        for msg in self.received:
            print(f"    {msg}")
        self.received.clear()

def main():
    print("=== Socket 多人聊天室 模拟演示 ===\\n")
    print("  说明: 用 print 模拟流程, 真实场景替换为 socket 通信\\n")
    
    server = SimulatedChatServer()
    
    print("--- 1. 三个客户端加入 ---")
    alice = SimulatedClient(server, "Alice")
    bob = SimulatedClient(server, "Bob")
    carol = SimulatedClient(server, "Carol")
    
    alice.join()
    print("  Alice 加入了聊天室")
    bob.join()
    print("  Bob 加入了聊天室")
    carol.join()
    print("  Carol 加入了聊天室")
    
    print("\\n--- 2. Alice 发送群消息 ---")
    alice.send("大家好！今天天气真好")
    alice.show_inbox()
    
    print("\\n--- 3. Bob 回复 ---")
    bob.send("Hi Alice！确实天气不错")
    
    print("\\n--- 4. Carol 发送消息 ---")
    carol.send("你们好，我是新来的 Carol")
    
    print("\\n--- 5. Bob 查看在线用户 (/list) ---")
    bob.send("/list")
    bob.show_inbox()
    
    print("\\n--- 6. Alice 私聊 Carol ---")
    alice.send("@Carol 晚上一起吃饭吗？")
    alice.show_inbox()
    
    print("\\n--- 7. Carol 查看私聊 ---")
    # 模拟 Carol 收到私聊
    ok, msg = server.private_message("Carol", "Alice", "好的，几点？")
    carol.received.append(msg)
    carol.show_inbox()
    
    print("\\n--- 8. Bob 退出 (/quit) ---")
    bob.send("/quit")
    print("  Bob 已退出聊天室")
    
    print("\\n--- 9. 在线用户列表 ---")
    users = server.list_users()
    print(f"  当前在线: {users}")
    
    print("\\n--- 10. Dave 加入并查看历史 ---")
    dave = SimulatedClient(server, "Dave")
    dave.join()
    print("  Dave 加入了聊天室")
    history = server.get_history(5)
    print("  Dave 收到的最近 5 条历史消息:")
    for h in history:
        print(f"    {h}")
    
    print("\\n--- 11. 消息广播测试 ---")
    dave.send("Hello everyone, I'm Dave!")
    alice.send("Welcome Dave!")
    
    print("\\n--- 12. 完整服务器事件日志 ---")
    server.show_log()
    
    print("\\n--- 13. 真实 socket 服务器核心代码示例 ---")
    code_sample = '''
# 真实 socket 聊天服务器核心代码（参考）
import socket, threading

def real_server():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(("0.0.0.0", 9999))
    srv.listen(5)
    clients = {}
    lock = threading.Lock()
    
    def handle_client(sock, nick):
        with lock:
            clients[nick] = sock
        while True:
            try:
                msg = sock.recv(1024).decode("utf-8")
                if not msg or msg == "/quit":
                    break
                with lock:
                    for s in clients.values():
                        s.sendall(f"{nick}: {msg}".encode("utf-8"))
            except ConnectionError:
                break
        with lock:
            clients.pop(nick, None)
        sock.close()
    
    while True:
        conn, addr = srv.accept()
        nick = conn.recv(1024).decode("utf-8").strip()
        t = threading.Thread(target=handle_client, args=(conn, nick), daemon=True)
        t.start()
'''
    print(code_sample)
    
    print("=== 演示结束 ===")

if __name__ == "__main__":
    main()`
  },
  {
    id: "py6-project-template-engine",
    group: "综合实战项目",
    icon: "📝",
    title: "实战项目 6：模板引擎实现",
    content: `## 实战项目 6：模板引擎实现

### 一、项目需求分析

模板引擎是 Web 开发的基础设施：把动态数据填入静态模板生成 HTML。Jinja2、Django 模板都是经典实现。本项目用**纯标准库**实现一个迷你模板引擎，理解其核心原理。

**核心功能需求**：

| 语法 | 功能 | 示例 |
|------|------|------|
| \`{{ var }}\` | 变量替换 | \`{{ name }}\` → Alice |
| \`{{ obj.attr }}\` | 属性访问 | \`{{ user.name }}\` |
| \`{{ func(arg) }}\` | 函数调用 | \`{{ upper(name) }}\` |
| \`{{ value \| filter }}\` | 过滤器 | \`{{ name \| upper }}\` |
| \`{% if cond %}...{% endif %}\` | 条件分支 | 满足条件才渲染 |
| \`{% for x in list %}...{% endfor %}\` | 循环 | 遍历列表渲染 |
| 嵌套支持 | if/for 可嵌套 | 多层结构 |

### 二、架构设计

模板引擎分两阶段：**词法分析**（分词）→ **递归渲染**（解析+执行）。

\`\`\`
模板字符串 → Tokenizer → Token 列表 → Renderer → 最终输出
                            ↓
                       上下文 context (dict)
\`\`\`

**模块划分**：

| 模块 | 职责 | 技术 |
|------|------|------|
| \`Tokenizer\` | 分割文本和标签 | \`re.split\` |
| \`Renderer\` | 递归渲染 token | 递归下降 |
| \`ExprEvaluator\` | 表达式求值 | 正则 + 反射 |
| \`FilterRegistry\` | 过滤器注册 | dict 映射 |

### 三、技术选型与理由

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 分词 | \`re.split\` | 正则一次分割所有标签 |
| 表达式求值 | 正则 + 手动解析 | 避免用 \`eval\`（安全风险） |
| 控制结构 | 递归下降 | 处理嵌套 if/for |
| 过滤器 | 函数字典 | 可扩展 |

> ⚠️ **安全警告**：绝不能用 \`eval()\` 或 \`exec()\` 求值表达式！模板可能来自用户输入，\`eval\` 会导致任意代码执行漏洞。必须用受限的表达式解析器。

### 四、代码实现思路

#### 4.1 分词（Tokenization）

用正则把模板切成 token 列表，文本和标签交替：

\`\`\`python
import re
pattern = re.compile(r'(\\{\\{.*?\\}\\}|\\{%.*?%\\})', re.DOTALL)
tokens = pattern.split(template)
# ["Hello ", "{{ name }}", "!", "{% if show %}", "Welcome", "{% endif %}"]
\`\`\`

- \`.*?\` 非贪婪匹配，避免跨标签吞掉内容
- \`re.DOTALL\` 让 \`.\` 匹配换行，支持多行标签
- 捕获组 \`()\` 让分隔符也保留在结果中

#### 4.2 表达式求值

依次尝试匹配：函数调用 → 属性访问 → 过滤器 → 简单变量。

\`\`\`python
def eval_expr(expr, context):
    # 1. 过滤器: value | filter
    if "|" in expr:
        value, *filters = expr.split("|")
        result = eval_expr(value.strip(), context)
        for f in filters:
            result = apply_filter(result, f.strip())
        return result
    # 2. 函数调用: func(arg)
    m = re.match(r'(\\w+)\\((.*)\\)', expr)
    if m and m.group(1) in context and callable(context[m.group(1)]):
        ...
    # 3. 属性访问: obj.attr
    if "." in expr:
        ...
    # 4. 简单变量
    return context.get(expr, "")
\`\`\`

#### 4.3 递归渲染控制结构

遇到 \`{% if %}\` 时，找到匹配的 \`{% endif %}\`（注意嵌套深度），条件成立则递归渲染内部 token：

\`\`\`python
def render_tokens(tokens, context):
    result = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok 是 if 标签:
            depth = 1
            inner = []
            j = i + 1
            while j < len(tokens):
                if 遇到嵌套 if: depth += 1
                if 遇到 endif: depth -= 1; if depth == 0: break
                inner.append(tokens[j])
                j += 1
            if 条件成立:
                result.append(render_tokens(inner, context))  # 递归
            i = j + 1
        ...
\`\`\`

#### 4.4 for 循环

\`{% for item in list %}\` 解析出变量名和可迭代对象，对每个元素创建新上下文（复制 + 注入循环变量），递归渲染循环体。

### 五、关键算法：嵌套匹配

处理 \`{% if %}\` 嵌套时，用**深度计数器**：遇到内层 \`if\` depth+1，遇到 \`endif\` depth-1，depth 归零时找到匹配。类似括号匹配问题。

\`\`\`
{% if A %}          depth=1
  {% if B %}        depth=2
    content
  {% endif %}       depth=1  ← 不是 A 的 endif
{% endif %}         depth=0  ← A 的 endif
\`\`\`

### 六、过滤器系统

预置常用过滤器，用 dict 注册，支持链式调用：

| 过滤器 | 作用 | 示例 |
|--------|------|------|
| \`upper\` | 大写 | \`"abc" \| upper\` → ABC |
| \`lower\` | 小写 | \`"ABC" \| lower\` → abc |
| \`title\` | 标题化 | \`"hello world" \| title\` |
| \`length\` | 长度 | \`"abc" \| length\` → 3 |
| \`default:x\` | 默认值 | \`"" \| default:"N/A"\` |

链式：\`{{ name \| upper \| length }}\` 先大写再算长度。

### 七、测试策略

| 测试点 | 方法 |
|--------|------|
| 变量替换 | 简单模板 + context |
| 属性访问 | dict/对象属性 |
| 函数调用 | 注册函数到 context |
| 过滤器 | 单个 + 链式 |
| 条件分支 | true/false/比较 |
| 循环 | 列表/嵌套循环 |
| 嵌套结构 | if 内嵌 for 内嵌 if |
| 边界 | 空模板、未定义变量 |

### 八、扩展方向

1. **模板继承**：\`{% extends "base.html" %}\` + \`{% block content %}\`
2. **include**：\`{% include "header.html" %}\` 引入子模板
3. **宏定义**：\`{% macro name(args) %}...\` 可复用代码块
4. **自动转义**：HTML 特殊字符转义防 XSS
5. **编译缓存**：模板预编译成 AST，重复渲染更快
6. **过滤器扩展**：支持 \`{{ x \| add(5) }}\` 带参数过滤器
7. **国际化**：\`{% trans %}文本{% endtrans %}\`

### 九、业务场景类比

- **类比编译器**：模板=源码，Tokenizer=词法分析，Renderer=语法分析+代码生成，context=运行时环境
- **类比邮件合并**：模板=信件模板，context=收件人信息，渲染=批量生成个性化邮件
- **实际场景**：HTML 页面生成、邮件模板、代码生成器、配置文件模板、报表生成

### 十、避坑提示

1. **正则贪婪**：\`{{.*}}\` 会贪婪匹配到行末最后一个 \`}}\`，必须用 \`.*?\` 非贪婪
2. **DOTALL 模式**：默认 \`.\` 不匹配换行，多行标签需 \`re.DOTALL\`
3. **空白处理**：\`{{ name }}\` 内部空格要 strip，避免 \`{{name}}\` 和 \`{{ name }}\` 行为不一致
4. **未定义变量**：返回空字符串而非报错，避免模板小问题导致整页崩溃
5. **类型转换**：渲染时 \`str(value)\`，None 显示 "None" 不友好，建议返回 ""
6. **XSS 防护**：HTML 模板必须转义 \`<>&"\`，默认开启自动转义更安全
7. **性能**：每次渲染都重新分词很慢，可缓存编译后的 AST
8. **沙箱安全**：禁止访问 \`__\` 开头属性，防止逃逸到对象系统

### 十一、最佳实践总结

1. **分词用正则**：\`re.split\` 配合非贪婪匹配，简洁高效
2. **递归下降渲染**：自然处理嵌套结构，代码清晰
3. **表达式受限求值**：白名单方式，只支持预定义操作，杜绝 \`eval\`
4. **过滤器可扩展**：用 dict 注册，方便添加新过滤器
5. **上下文隔离**：for 循环创建新 context，避免变量污染外层
6. **失败友好**：未定义变量、错误语法返回空或原样输出，不崩溃
7. **缓存编译结果**：生产环境预编译模板，避免每次重新解析`,
    code: `# 模板引擎实现 - 完整可运行演示
import re
from typing import Any, Dict, List

class TemplateEngine:
    """迷你模板引擎，支持变量/属性/函数/过滤器/条件/循环"""
    
    def __init__(self, template):
        self.template = template
        self.filters = {
            "upper": lambda v: str(v).upper(),
            "lower": lambda v: str(v).lower(),
            "title": lambda v: str(v).title(),
            "length": lambda v: len(v),
            "trim": lambda v: str(v).strip(),
            "reverse": lambda v: str(v)[::-1],
        }
    
    def render(self, context):
        """渲染模板"""
        tokens = self._tokenize(self.template)
        return self._render_tokens(tokens, context)
    
    def _tokenize(self, text):
        """分词：分割文本和 {{ }} {% %} 标签"""
        pattern = re.compile(r'(\\{\\{.*?\\}\\}|\\{%.*?%\\})', re.DOTALL)
        return [t for t in pattern.split(text) if t]
    
    def _render_tokens(self, tokens, context):
        """递归渲染 token 列表"""
        result = []
        i = 0
        while i < len(tokens):
            tok = tokens[i]
            if tok.startswith("{{") and tok.endswith("}}"):
                # 变量/表达式
                expr = tok[2:-2].strip()
                value = self._eval_expr(expr, context)
                result.append("" if value is None else str(value))
                i += 1
            elif tok.startswith("{%") and tok.endswith("%}"):
                stmt = tok[2:-2].strip()
                if stmt.startswith("if "):
                    # 找匹配的 endif（处理嵌套）
                    inner, end_idx = self._find_block(tokens, i, "if", "endif")
                    cond = stmt[3:].strip()
                    if self._eval_cond(cond, context):
                        result.append(self._render_tokens(inner, context))
                    i = end_idx + 1
                elif stmt.startswith("for "):
                    inner, end_idx = self._find_block(tokens, i, "for", "endfor")
                    m = re.match(r'for\\s+(\\w+)\\s+in\\s+(.+)', stmt)
                    if m:
                        var_name = m.group(1)
                        list_expr = m.group(2).strip()
                        items = self._eval_expr(list_expr, context) or []
                        for item in items:
                            new_ctx = dict(context)
                            new_ctx[var_name] = item
                            result.append(self._render_tokens(inner, new_ctx))
                    i = end_idx + 1
                else:
                    i += 1
            else:
                result.append(tok)
                i += 1
        return "".join(result)
    
    def _find_block(self, tokens, start, open_tag, close_tag):
        """找到匹配的结束标签，返回 (内部 tokens, 结束索引)"""
        depth = 1
        inner = []
        j = start + 1
        while j < len(tokens):
            t = tokens[j]
            if t.startswith("{%") and t.endswith("%}"):
                s = t[2:-2].strip()
                if s.startswith(open_tag + " "):
                    depth += 1
                elif s == close_tag:
                    depth -= 1
                    if depth == 0:
                        return inner, j
            inner.append(t)
            j += 1
        return inner, j  # 未找到结束标签，尽量返回
    
    def _eval_expr(self, expr, context):
        """求值表达式"""
        expr = expr.strip()
        # 1. 过滤器: value | filter | filter
        if "|" in expr:
            parts = expr.split("|")
            value = self._eval_expr(parts[0].strip(), context)
            for filt in parts[1:]:
                value = self._apply_filter(value, filt.strip())
            return value
        # 2. 字符串字面量
        if (expr.startswith('"') and expr.endswith('"')) or \\
           (expr.startswith("'") and expr.endswith("'")):
            return expr[1:-1]
        # 3. 数字字面量
        if re.match(r'^-?\\d+$', expr):
            return int(expr)
        # 4. 函数调用: func(arg1, arg2)
        m = re.match(r'(\\w+)\\((.*)\\)$', expr)
        if m:
            func_name = m.group(1)
            arg_str = m.group(2).strip()
            func = context.get(func_name)
            if callable(func):
                args = []
                if arg_str:
                    for a in self._split_args(arg_str):
                        args.append(self._eval_expr(a.strip(), context))
                return func(*args)
            return ""
        # 5. 属性访问: obj.attr.attr
        if "." in expr:
            parts = expr.split(".")
            value = context.get(parts[0])
            for p in parts[1:]:
                if value is None:
                    return ""
                if isinstance(value, dict):
                    value = value.get(p)
                elif hasattr(value, p):
                    value = getattr(value, p)
                else:
                    return ""
            return value
        # 6. 简单变量
        return context.get(expr, "")
    
    def _split_args(self, arg_str):
        """分割函数参数（简单版，不处理嵌套逗号）"""
        args = []
        current = ""
        in_str = None
        for ch in arg_str:
            if ch in ('"', "'"):
                if in_str is None:
                    in_str = ch
                elif in_str == ch:
                    in_str = None
                current += ch
            elif ch == "," and in_str is None:
                args.append(current)
                current = ""
            else:
                current += ch
        if current.strip():
            args.append(current)
        return args
    
    def _eval_cond(self, cond, context):
        """条件求值"""
        cond = cond.strip()
        # 比较: a == b, a != b
        if "==" in cond:
            left, right = cond.split("==", 1)
            lv = self._eval_expr(left.strip(), context)
            rv = self._eval_expr(right.strip(), context)
            return lv == rv
        if "!=" in cond:
            left, right = cond.split("!=", 1)
            lv = self._eval_expr(left.strip(), context)
            rv = self._eval_expr(right.strip(), context)
            return lv != rv
        # 真值判断
        value = self._eval_expr(cond, context)
        return bool(value)
    
    def _apply_filter(self, value, filt):
        """应用过滤器"""
        # 带参数: default:"N/A"
        if ":" in filt:
            name, arg = filt.split(":", 1)
            name = name.strip()
            arg = arg.strip().strip('"\\"')
            if name == "default":
                return value if value else arg
            return value
        # 无参数
        func = self.filters.get(filt.strip())
        if func:
            return func(value)
        return value

def main():
    print("=== 模板引擎实现 演示 ===\\n")
    
    print("--- 1. 变量替换 ---")
    tpl = TemplateEngine("你好，{{ name }}！你今年 {{ age }} 岁。")
    print("  模板: 你你好，{{ name }}！你今年 {{ age }} 岁。")
    print(f"  结果: {tpl.render({'name': 'Alice', 'age': 30})}")
    
    print("\\n--- 2. 对象属性访问 ---")
    tpl = TemplateEngine("用户：{{ user.name }}，邮箱：{{ user.email }}")
    user = {"name": "Bob", "email": "bob@test.com"}
    print(f"  结果: {tpl.render({'user': user})}")
    
    print("\\n--- 3. 函数调用 ---")
    tpl = TemplateEngine("大写：{{ upper(name) }}，重复：{{ repeat(word, 3) }}")
    ctx = {
        "name": "hello",
        "word": "py",
        "upper": lambda s: s.upper(),
        "repeat": lambda s, n: s * n,
    }
    print(f"  结果: {tpl.render(ctx)}")
    
    print("\\n--- 4. 过滤器 ---")
    tpl = TemplateEngine("原：{{ name }} | 大写：{{ name | upper }} | 长度：{{ name | length }}")
    print(f"  结果: {tpl.render({'name': 'Python'})}")
    tpl2 = TemplateEngine("链式：{{ name | upper | reverse }}")
    print(f"  链式结果: {tpl2.render({'name': 'abc'})}")
    
    print("\\n--- 5. 条件分支 ---")
    tpl = TemplateEngine("{% if show %}欢迎回来，{{ name }}！{% endif %}再见！")
    print(f"  show=True: {tpl.render({'name':'Alice','show':True})}")
    print(f"  show=False: {tpl.render({'name':'Alice','show':False})}")
    
    print("\\n--- 6. 条件比较 ---")
    tpl = TemplateEngine("{% if age >= 18 %}成年人{% endif %}{% if age < 18 %}未成年{% endif %}")
    # 简化：只支持 == 和 !=，用 == 演示
    tpl = TemplateEngine("{% if status == 'vip' %}VIP 用户{% endif %}{% if status != 'vip' %}普通用户{% endif %}")
    print(f"  vip: {tpl.render({'status':'vip'})}")
    print(f"  normal: {tpl.render({'status':'normal'})}")
    
    print("\\n--- 7. 循环 ---")
    tpl = TemplateEngine("水果列表：{% for fruit in fruits %}{{ fruit }} {% endfor %}")
    print(f"  结果: {tpl.render({'fruits': ['苹果','香蕉','橙子']})}")
    
    print("\\n--- 8. 循环 + 属性 ---")
    tpl = TemplateEngine("{% for u in users %}- {{ u.name }} ({{ u.age }}岁)\\n{% endfor %}")
    users = [
        {"name": "Alice", "age": 30},
        {"name": "Bob", "age": 25},
        {"name": "Carol", "age": 28},
    ]
    print(f"  结果:\\n{tpl.render({'users': users})}")
    
    print("--- 9. 嵌套结构（if 内嵌 for）---")
    tpl = TemplateEngine("{% if show_list %}团队：{% for m in members %}{{ m }} {% endfor %}{% endif %}")
    print(f"  显示: {tpl.render({'show_list': True, 'members': ['Alice','Bob','Carol']})}")
    print(f"  隐藏: {tpl.render({'show_list': False, 'members': ['Alice','Bob','Carol']})}")
    
    print("\\n--- 10. 完整 HTML 页面渲染 ---")
    html_template = \"\"\"<html>
<head><title>{{ title }}</title></head>
<body>
<h1>{{ title }}</h1>
{% if logged_in %}<p>欢迎，{{ username | upper }}！</p>{% endif %}
<h2>文章列表</h2>
<ul>
{% for post in posts %}<li>{{ post.title }} - {{ post.author }} ({{ post.views }}次阅读)</li>
{% endfor %}</ul>
<p>共 {{ posts | length }} 篇文章</p>
</body>
</html>\"\"\"
    context = {
        "title": "我的技术博客",
        "logged_in": True,
        "username": "alice",
        "posts": [
            {"title": "Python 入门", "author": "张三", "views": 1200},
            {"title": "正则实战", "author": "李四", "views": 856},
            {"title": "并发编程", "author": "王五", "views": 2300},
        ],
    }
    engine = TemplateEngine(html_template)
    result = engine.render(context)
    print(result)
    
    print("\\n--- 11. 过滤器扩展测试 ---")
    tpl = TemplateEngine("{{ '' | default:'匿名' }} / {{ name | default:'匿名' }}")
    print(f"  空值默认: {tpl.render({'name': ''})}")
    print(f"  有值默认: {tpl.render({'name': 'Alice'})}")
    
    print("\\n--- 12. 性能与边界 ---")
    # 大列表渲染
    big_list = [f"item{i}" for i in range(100)]
    tpl = TemplateEngine("{% for x in items %}{{ x }},{% endfor %}")
    result = tpl.render({"items": big_list})
    print(f"  渲染 100 项列表，结果长度: {len(result)} 字符")
    # 未定义变量
    tpl = TemplateEngine("Hello {{ undefined_var }}!")
    print(f"  未定义变量: '{tpl.render({})}'")
    
    print("\\n=== 演示结束 ===")

if __name__ == "__main__":
    main()`
  }
];
