// =============================================================
// Python 设计思想与架构教程 - 第 6 批章节(架构模式)
// =============================================================

export const chapters = [
  {
    id: "pyarch-mvc",
    icon: "🎭",
    title: "MVC 模式",
    group: "架构模式",
    content: `# MVC 模式

## 一、MVC 是什么

MVC(Model-View-Controller,模型-视图-控制器)是软件工程中最古老、最广为人知的架构模式之一。它的核心定义是:

> 将一个应用程序拆分成三个相互独立但相互协作的部分——**模型(Model)**负责数据与业务逻辑,**视图(View)**负责展示,**控制器(Controller)**负责接收用户输入并协调模型与视图。

用一句话概括:**「数据、展示、控制,三权分立」**。

MVC 不是设计模式(Design Pattern),而是**架构模式(Architectural Pattern)**。设计模式解决的是某一类具体的、局部的代码问题(比如「对象怎么创建」「状态怎么切换」);架构模式解决的是**整个系统的高层结构问题**(「整个应用怎么分层」「职责怎么划分」)。MVC 属于后者,它讨论的是宏观骨架。

### 1.1 一张图理解 MVC 的核心三角

\`\`\`
        用户输入
            │
            ▼
   ┌─────────────────┐
   │   Controller    │  接收输入,调用 Model,选择 View
   │   (控制器)      │
   └────────┬────────┘
            │ 调用业务方法
            ▼
   ┌─────────────────┐    change/notification   ┌─────────────────┐
   │     Model       │ ───────────────────────► │      View       │
   │   (模型:数据+   │                          │   (视图:展示)   │
   │    业务逻辑)    │ ◄─────────────────────── │  监听 Model 变化 │
   └─────────────────┘     view 查询 model       └─────────────────┘
                                                        │
                                                        ▼
                                                   渲染输出给用户
\`\`\`

注意箭头方向:

- **Controller → Model**:Controller 调用 Model 的方法改变状态
- **Model → View**:Model 变化时通知 View(观察者模式)
- **View → Model**:View 从 Model 读取数据来展示
- **Controller → View**:Controller 选择并激活某个 View(传统 MVC 中常见)

### 1.2 为什么需要 MVC

想象你不做任何架构,所有代码揉在一个文件里:HTML 里嵌 SQL,SQL 里嵌业务判断,业务判断里又有 \`print\`。这种代码俗称「意大利面条代码(Spaghetti Code)」。它会带来三个灾难:

1. **无法测试**:业务逻辑和数据库、UI 绑死,单元测试无从下手
2. **无法复用**:同一个折扣算法,Web 端写一遍,API 端又写一遍
3. **无法协作**:前端改 HTML 不小心碰了 SQL,后端改 SQL 不小心碰了模板

MVC 的解法是:**强制分离关注点(Separation of Concerns, SoC)**。Model 只关心数据,View 只关心展示,Controller 只关心流程。三者通过明确的接口交互,各自可以独立变化。

---

## 二、MVC 的历史:从 Smalltalk-80 到 Web 时代

理解 MVC 的历史很重要,因为现代很多人讲的「MVC」其实已经偏离了原始含义。只有了解它的演化,你才能搞清楚为什么 Web MVC 和桌面 MVC 长得不一样。

### 2.1 Trygve Reenskaug 与 Smalltalk-80(1979)

MVC 由挪威计算机科学家 **Trygve Reenskaug** 于 1979 年在 Xerox PARC 工作期间提出,最初是为 Smalltalk-80 图形用户界面环境设计的。原始论文叫 *Models-Views-Controllers*。

Reenskaug 的初衷是解决一个问题:**如何在 GUI 应用中,让同一个数据以多种方式展示,并保持同步?**

例如,一个电子表格的数据,既可以用表格视图显示,也可以用柱状图显示,还可以用饼图显示。当用户在表格里改了一个值,所有视图都要同步更新。

为了解决这个问题,他提出了 MVC:

- **Model**:封装数据和操作
- **View**:把 Model 的状态「投影」到屏幕上
- **Controller**:接收用户的键盘/鼠标输入,翻译成对 Model 的操作

### 2.2 传统桌面 MVC(主动 MVC / 观察者 MVC)

在原始 Smalltalk-80 的 MVC 中,View 与 Model 是**直接耦合**的:

\`\`\`
   ┌──────────┐  register listener  ┌──────────┐
   │   View   │ ──────────────────► │  Model   │
   │          │ ◄─────notify──────── │          │
   └────┬─────┘                      └──────────┘
        │ query state
        ▼
   重新渲染
\`\`\`

这种模式称为**主动 MVC(Active MVC)**或**观察者 MVC**,因为 Model 主动通知 View「我变了,你重新读一遍数据再画吧」。它依赖**观察者模式(Observer Pattern)**。

### 2.3 Web MVC(被动 MVC)

Web 时代来了,问题变了。HTTP 是无状态的,一次请求-响应之后就断开,**Model 没法主动通知浏览器里的 View**。于是 Web 框架(Rails、Django、Spring MVC)演化出一种变体:

\`\`\`
   浏览器请求 ──► Controller ──► Model(读/写)──► 选 View ──► 渲染 HTML ──► 返回
\`\`\`

这种模式称为**被动 MVC(Passive MVC)**或**Web MVC**。View 不再监听 Model,而是由 Controller 把 Model 数据「塞」给 View 一次性渲染。Model 完全不知道 View 的存在。

| 对比维度 | 传统桌面 MVC(主动) | Web MVC(被动) |
|---------|--------------------|-----------------|
| View 与 Model 关系 | View 监听 Model | View 不监听 Model |
| 通信机制 | 观察者模式(事件通知) | 请求-响应(一次性) |
| Controller 职责 | 翻译输入为 Model 操作 | 接收请求、调用 Model、选 View、传数据 |
| View 更新方式 | Model 变化时自动刷新 | 每次请求重新渲染整个页面 |
| 状态保持 | 内存中常驻 | HTTP 无状态,需 cookie/session |

记住这张表,你就能解释为什么 Rails 的 Controller 和 Smalltalk 的 Controller 完全不是一回事。

---

## 三、三者职责详解

### 3.1 Model:数据与业务逻辑

Model 是 MVC 的灵魂。它包含:

- **数据状态**:应用程序的核心数据(订单、用户、购物车)
- **业务规则**:数据如何变化(下单必须扣库存、密码必须加密)
- **数据访问**:如何读写持久化存储(SQL、NoSQL、文件)

Model **不关心**:

- 数据怎么显示(表格?JSON?XML?)
- 用户怎么输入(点击?命令行?API?)
- 用什么框架(Flask?Django?Tkinter?)

一个理想的 Model 应该是「框架无关」的。下面是一个纯 Python 的订单 Model:

\`\`\`python
from dataclasses import dataclass, field
from datetime import datetime
from typing import List

@dataclass
class OrderItem:
    name: str
    price: float
    qty: int

    @property
    def subtotal(self) -> float:
        return self.price * self.qty

@dataclass
class Order:
    id: str
    customer: str
    items: List[OrderItem] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    _status: str = "draft"

    def add_item(self, item: OrderItem) -> None:
        if self._status != "draft":
            raise ValueError("只有草稿状态订单可以加商品")
        self.items.append(item)

    def total(self) -> float:
        return sum(i.subtotal for i in self.items)

    def submit(self) -> None:
        if not self.items:
            raise ValueError("空订单不能提交")
        if self.total() > 10000:
            raise ValueError("超过 1 万元需要人工审核")
        self._status = "submitted"
\`\`\`

注意这个 Model **没有任何 UI 代码、没有任何 SQL、没有任何 HTTP 概念**。它可以被终端界面调用,也可以被 Flask 调用,也可以被单元测试调用。

### 3.2 View:展示与渲染

View 的职责是**把 Model 的数据翻译成用户能看懂的形式**。

- 终端 View:打印文本
- Web View:渲染 HTML
- API View:输出 JSON
- GUI View:绘制窗口

View 应该**尽可能「 dumb(笨)」**:不写业务逻辑,不做决策,只负责展示。View 里出现 \`if order.status == "submitted"\` 这种判断是允许的(决定显示什么颜色),但出现 \`order.submit()\` 这种调用就是越界了。

终端 View 示例:

\`\`\`python
class OrderTerminalView:
    def show(self, order) -> None:
        print(f"订单号: {order.id}")
        print(f"客户:   {order.customer}")
        print(f"状态:   {order._status}")
        print("-" * 40)
        for item in order.items:
            print(f"  {item.name} x{item.qty}  ¥{item.subtotal:.2f}")
        print("-" * 40)
        print(f"合计:   ¥{order.total():.2f}")

    def show_error(self, msg: str) -> None:
        print(f"[错误] {msg}")

    def prompt(self, text: str) -> str:
        return input(text)
\`\`\`

### 3.3 Controller:协调与流转

Controller 是「中间人」,它的工作流程通常是这样的:

1. 接收用户输入(命令行参数 / HTTP 请求 / GUI 事件)
2. 调用 Model 的方法执行业务
3. 捕获 Model 抛出的异常
4. 选择合适的 View
5. 把 Model 传给 View 渲染

Controller 应该**薄**:不要把业务逻辑塞进 Controller。一个常见的反模式叫「Fat Controller, Thin Model」——Controller 里写满了业务规则,Model 只是个数据容器。这违背了 MVC 的初衷。

终端 Controller 示例:

\`\`\`python
class OrderController:
    def __init__(self, model, view):
        self.model = model
        self.view = view

    def add_item(self, name: str, price: float, qty: int) -> None:
        try:
            item = OrderItem(name=name, price=price, qty=qty)
            self.model.add_item(item)
            self.view.show(self.model)
        except ValueError as e:
            self.view.show_error(str(e))

    def submit(self) -> None:
        try:
            self.model.submit()
            self.view.show(self.model)
            print("订单已提交!")
        except ValueError as e:
            self.view.show_error(str(e))
\`\`\`

注意 Controller 里**没有**「订单金额超过 1 万要审核」这种规则——那是 Model 的事。Controller 只负责「调用 → 捕获异常 → 选 View」。

---

## 四、MVC 的核心机制:观察者模式

传统桌面 MVC 之所以能让多个 View 自动同步,靠的是**观察者模式**。Model 维护一个观察者列表,View 注册自己为观察者;Model 状态变化时,遍历列表调用每个观察者的更新方法。

\`\`\`python
from typing import List, Callable

class Observable:
    """可被观察的基类,Model 继承它。"""
    def __init__(self):
        self._observers: List[Callable] = []

    def add_observer(self, observer: Callable) -> None:
        self._observers.append(observer)

    def remove_observer(self, observer: Callable) -> None:
        self._observers.remove(observer)

    def _notify(self) -> None:
        for observer in self._observers:
            observer(self)

class TodoModel(Observable):
    def __init__(self):
        super().__init__()
        self._todos: List[str] = []

    def add(self, text: str) -> None:
        self._todos.append(text)
        self._notify()      # 通知所有观察者

    def remove(self, idx: int) -> None:
        if 0 <= idx < len(self._todos):
            self._todos.pop(idx)
            self._notify()

    @property
    def todos(self) -> List[str]:
        return list(self._todos)

# View 作为观察者
class TodoConsoleView:
    def render(self, model: TodoModel) -> None:
        print("\\n=== 待办列表 ===")
        for i, t in enumerate(model.todos):
            print(f"  [{i}] {t}")
        if not model.todos:
            print("  (空)")

model = TodoModel()
view = TodoConsoleView()
model.add_observer(view.render)   # View 注册自己

model.add("写完 MVC 教程")
# 控制台自动打印:
# === 待办列表 ===
#   [0] 写完 MVC 教程

model.add("复习观察者模式")
# 自动打印更新后的列表
\`\`\`

这就是「主动 MVC」的精髓:**View 自动响应 Model 变化,无需 Controller 介入刷新**。Controller 只负责改变 Model,Model 一变,所有 View 自动跟上。

### 4.1 观察者模式的陷阱

观察者模式虽然强大,但容易踩坑:

| 陷阱 | 表现 | 解法 |
|------|------|------|
| 内存泄漏 | Observer 没注销,Model 一直持有引用 | 用弱引用 weakref,或显式 remove |
| 通知风暴 | 一次操作触发多次 notify,View 闪烁 | 合并通知(批量操作前后只 notify 一次) |
| 循环通知 | A 通知 B,B 改了 A,A 又通知 B | 引入「正在通知」标志位 |
| 顺序依赖 | Observer A 依赖 B 先执行 | 用队列+优先级,或干脆别用观察者 |
| 调试困难 | 不知道谁触发了更新 | 在 notify 处打调用栈日志 |

Web MVC 之所以抛弃观察者,正是因为 HTTP 请求-响应模型下,这些坑都不会出现——每次请求都是全新的。

---

## 五、Web MVC vs 桌面 MVC:差异深入

### 5.1 桌面 MVC 的工作流

以 Tkinter 写一个简单的计数器为例:

\`\`\`python
import tkinter as tk

class CounterModel:
    def __init__(self):
        self._count = 0
        self._listeners = []

    def add_listener(self, fn):
        self._listeners.append(fn)

    def inc(self):
        self._count += 1
        for fn in self._listeners:
            fn(self._count)

class CounterView:
    def __init__(self, model):
        self.model = model
        self.label = None  # 由 controller 注入

    def render(self, count):
        if self.label:
            self.label.config(text=str(count))

class CounterController:
    def __init__(self, root):
        self.model = CounterModel()
        self.view = CounterView(self.model)
        self.view.label = tk.Label(root, text="0", font=("Arial", 30))
        self.view.label.pack()
        btn = tk.Button(root, text="+1", command=self.on_click)
        btn.pack()
        # View 监听 Model
        self.model.add_listener(self.view.render)

    def on_click(self):
        self.model.inc()   # Model 变化自动触发 View 更新

root = tk.Tk()
CounterController(root)
root.mainloop()
\`\`\`

看,点击按钮 → Controller 调 \`model.inc()\` → Model 通知 → View 自动刷新。Controller 完全不用管「怎么刷新界面」。

### 5.2 Web MVC 的工作流

同样的计数器用 Flask 实现:

\`\`\`python
from flask import Flask, session, render_template_string

app = Flask(__name__)
app.secret_key = "dev"

# Model
class CounterModel:
    @staticmethod
    def get():
        return session.get("count", 0)

    @staticmethod
    def inc():
        session["count"] = session.get("count", 0) + 1
        return session["count"]

# View(模板)
TEMPLATE = """
<!doctype html>
<html><body>
  <h1>{{ count }}</h1>
  <form method="post" action="/inc">
    <button type="submit">+1</button>
  </form>
</body></html>
"""

# Controller
@app.route("/")
def index():
    count = CounterModel.get()
    return render_template_string(TEMPLATE, count=count)

@app.route("/inc", methods=["POST"])
def inc():
    count = CounterModel.inc()
    return render_template_string(TEMPLATE, count=count)
\`\`\`

对比两个版本的差异:

| 方面 | 桌面版 | Web 版 |
|------|--------|--------|
| 状态保存 | 进程内存 \`self._count\` | session(本质是 cookie) |
| View 更新 | 监听 Model 自动刷新 | 每次请求重新渲染整个页面 |
| 用户输入 | 事件回调 \`command=\` | HTTP POST 表单 |
| 观察者模式 | 用了 | 没用 |
| Controller 角色 | 翻译事件 → Model 操作 | 接收请求 → Model 操作 → 选模板 → 返回 |

这就是为什么 Web 框架的「Controller」看起来更像个「路由处理函数」,而桌面框架的「Controller」更像个「事件分发器」。

---

## 六、Python 实战:纯 Python 实现一个待办事项 MVC

下面我们用**纯 Python**(不依赖任何框架)实现一个完整的待办事项应用,严格遵循 MVC 分层。

### 6.1 项目结构

\`\`\`
todo_mvc/
├── model.py       # Model:数据与业务规则
├── view.py        # View:终端展示
├── controller.py  # Controller:协调流程
└── main.py        # 入口
\`\`\`

### 6.2 Model 层

\`\`\`python
# model.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Callable
from uuid import uuid4

@dataclass
class Todo:
    id: str
    text: str
    done: bool = False
    created_at: datetime = field(default_factory=datetime.now)

class TodoModel:
    """待办事项模型,纯业务逻辑,不依赖 UI。"""
    def __init__(self):
        self._todos: List[Todo] = []
        self._listeners: List[Callable[[], None]] = []

    # —— 观察者机制 ——
    def add_listener(self, fn: Callable[[], None]) -> None:
        self._listeners.append(fn)

    def _notify(self) -> None:
        for fn in self._listeners:
            fn()

    # —— 业务方法 ——
    def add(self, text: str) -> Todo:
        if not text.strip():
            raise ValueError("待办内容不能为空")
        todo = Todo(id=str(uuid4())[:8], text=text.strip())
        self._todos.append(todo)
        self._notify()
        return todo

    def complete(self, todo_id: str) -> None:
        todo = self.find(todo_id)
        if not todo:
            raise KeyError(f"找不到待办 {todo_id}")
        if todo.done:
            raise ValueError("该待办已完成")
        todo.done = True
        self._notify()

    def remove(self, todo_id: str) -> None:
        todo = self.find(todo_id)
        if not todo:
            raise KeyError(f"找不到待办 {todo_id}")
        self._todos.remove(todo)
        self._notify()

    def find(self, todo_id: str) -> Optional[Todo]:
        return next((t for t in self._todos if t.id == todo_id), None)

    # —— 查询方法 ——
    @property
    def todos(self) -> List[Todo]:
        return list(self._todos)

    @property
    def pending(self) -> List[Todo]:
        return [t for t in self._todos if not t.done]

    @property
    def completed(self) -> List[Todo]:
        return [t for t in self._todos if t.done]
\`\`\`

注意 \`TodoModel\` 里只有业务规则(空文本校验、完成状态校验)和数据操作,**没有任何 \`print\`、没有任何 \`input\`**。它可以被任意 UI 复用。

### 6.3 View 层

\`\`\`python
# view.py
from typing import List
from model import TodoModel, Todo

class TodoView:
    """终端视图,只负责渲染,不做决策。"""
    def render(self, model: TodoModel) -> None:
        todos = model.todos
        print("\\n" + "=" * 50)
        print(f"  待办事项  (共 {len(todos)} 条,"
              f"待办 {len(model.pending)},"
              f"已完成 {len(model.completed)})")
        print("=" * 50)
        if not todos:
            print("  (空空如也,加一条试试?)")
        for i, t in enumerate(todos, 1):
            status = "✓" if t.done else "○"
            print(f"  {status} [{t.id}] {t.text}")
        print("=" * 50)

    def show_error(self, msg: str) -> None:
        print(f"\\n[错误] {msg}")

    def show_info(self, msg: str) -> None:
        print(f"\\n[信息] {msg}")

    def prompt(self, text: str) -> str:
        return input(text).strip()
\`\`\`

### 6.4 Controller 层

\`\`\`python
# controller.py
from model import TodoModel
from view import TodoView

class TodoController:
    """控制器:解析输入,调用 Model,刷新 View。"""
    def __init__(self):
        self.model = TodoModel()
        self.view = TodoView()
        # View 监听 Model 变化(主动 MVC 风格)
        self.model.add_listener(lambda: self.view.render(self.model))

    def run(self) -> None:
        self.view.show_info("待办事项管理器(命令:add/complete/remove/quit)")
        self.view.render(self.model)
        while True:
            cmd = self.view.prompt("\\n> ").split(" ", 1)
            if not cmd or not cmd[0]:
                continue
            action = cmd[0].lower()
            try:
                if action == "quit":
                    self.view.show_info("再见!")
                    break
                elif action == "add":
                    text = cmd[1] if len(cmd) > 1 else ""
                    self.model.add(text)
                elif action == "complete":
                    self.model.complete(cmd[1])
                elif action == "remove":
                    self.model.remove(cmd[1])
                else:
                    self.view.show_error(f"未知命令 {action}")
            except (ValueError, KeyError, IndexError) as e:
                self.view.show_error(str(e))
\`\`\`

### 6.5 入口

\`\`\`python
# main.py
from controller import TodoController

if __name__ == "__main__":
    TodoController().run()
\`\`\`

运行效果:

\`\`\`
> add 写完 MVC 教程

==================================================
  待办事项  (共 1 条,待办 1,已完成 0)
==================================================
  ○ [a1b2c3d4] 写完 MVC 教程
==================================================

> add 复习观察者模式
(自动刷新列表)

> complete a1b2c3d4
  ✓ [a1b2c3d4] 写完 MVC 教程
\`\`\`

### 6.6 这个例子的设计亮点

1. **Model 可独立测试**:不需要 mock 任何 UI 就能测业务逻辑
2. **View 可替换**:把 \`TodoView\` 换成 \`TodoWebView\`,Model 和 Controller 几乎不动
3. **观察者解耦**:Controller 不用关心「刷新 UI」,Model 一变 View 自动跟
4. **异常分层**:Model 抛业务异常,Controller 捕获并转给 View 显示

---

## 七、Flask 中的 MVC 实践

把上面的待办事项搬到 Web 上。Flask 没有强制 MVC,但约定俗成是这样的:

| MVC 角色 | Flask 中的对应 |
|---------|----------------|
| Model | SQLAlchemy 模型 / 自定义业务类 |
| View | Jinja2 模板(\`templates/*.html\`) |
| Controller | 视图函数(\`@app.route\` 装饰的函数) |

\`\`\`python
# app.py
from flask import Flask, request, render_template, redirect, url_for
from dataclasses import dataclass
from typing import List

app = Flask(__name__)

# —— Model ——
@dataclass
class Todo:
    id: int
    text: str
    done: bool = False

class TodoStore:
    """简化的内存存储(实际项目用 SQLAlchemy)。"""
    def __init__(self):
        self._todos: List[Todo] = []
        self._next_id = 1

    def add(self, text: str) -> Todo:
        todo = Todo(id=self._next_id, text=text)
        self._todos.append(todo)
        self._next_id += 1
        return todo

    def complete(self, todo_id: int) -> None:
        for t in self._todos:
            if t.id == todo_id:
                t.done = True
                return
        raise KeyError(todo_id)

    def all(self) -> List[Todo]:
        return list(self._todos)

store = TodoStore()

# —— Controller(视图函数) ——
@app.route("/")
def index():
    todos = store.all()  # 调用 Model
    return render_template("index.html", todos=todos)  # 选 View + 传数据

@app.route("/add", methods=["POST"])
def add():
    text = request.form.get("text", "").strip()
    if text:
        store.add(text)
    return redirect(url_for("index"))

@app.route("/complete/<int:todo_id>")
def complete(todo_id: int):
    try:
        store.complete(todo_id)
    except KeyError:
        pass
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

模板 \`templates/index.html\`:

\`\`\`html
<!doctype html>
<html>
<head><title>Todo</title></head>
<body>
  <h1>待办事项</h1>
  <form method="post" action="/add">
    <input name="text" placeholder="写点什么...">
    <button>添加</button>
  </form>
  <ul>
    {% for t in todos %}
      <li>
        {% if t.done %}<s>{{ t.text }}</s>{% else %}{{ t.text }}{% endif %}
        {% if not t.done %}
          <a href="/complete/{{ t.id }}">完成</a>
        {% endif %}
      </li>
    {% endfor %}
  </ul>
</body>
</html>
\`\`\`

注意 Web 版**没有观察者**。每次操作完都 \`redirect\` 回首页,重新查询 Model、重新渲染。这就是被动 MVC。

---

## 八、Django 的 MTV:是 MVC 的变体

Django 把 MVC 改了个名字叫 **MTV(Model-Template-View)**,很多人初学 Django 会困惑「Django 的 View 是 MVC 的哪个?」

| MVC 角色 | Django MTV 角色 | 说明 |
|---------|----------------|------|
| Model | Model | 一样,定义数据模型 |
| View | Template | Django 的「Template」就是 MVC 的「View」 |
| Controller | View | Django 的「View」函数其实是 MVC 的「Controller」! |
| (无) | urls.py | Django 把路由单独抽出来,本质是 Controller 的一部分 |

所以 Django 文档里常说「Django 里的 View 是控制器」,这话不假。Django 之所以改名,是因为它认为「View」这个词更接近「视图函数 = 处理请求并返回响应的逻辑」,而 Template 才是真正的「展示」。

\`\`\`python
# myapp/models.py  —— MTV 的 Model
from django.db import models

class Todo(models.Model):
    text = models.CharField(max_length=200)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

# myapp/views.py  —— MTV 的 View(其实是 MVC 的 Controller)
from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo

def index(request):
    todos = Todo.objects.all()
    return render(request, "index.html", {"todos": todos})

def add(request):
    if request.method == "POST":
        text = request.POST.get("text", "").strip()
        if text:
            Todo.objects.create(text=text)
    return redirect("index")

def complete(request, todo_id):
    todo = get_object_or_404(Todo, pk=todo_id)
    todo.done = True
    todo.save()
    return redirect("index")

# myapp/urls.py  —— 路由
from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("add/", views.add),
    path("complete/<int:todo_id>/", views.complete),
]
\`\`\`

模板 \`templates/index.html\` 与 Flask 版几乎一样。

理解了 Django MTV 就是 MVC 的换名变体,你学 Rails(Spring MVC / Laravel)时也会发现它们的套路完全一致,只是命名不同。

---

## 九、MVC 的优缺点

### 9.1 优点

| 优点 | 说明 |
|------|------|
| 关注点分离 | Model/View/Controller 各司其职,代码组织清晰 |
| 多视图支持 | 同一 Model 可挂多个 View(桌面 MVC) |
| 可测试性 | Model 可独立单元测试,不依赖 UI |
| 并行开发 | 后端写 Model,前端写 View,中间定好接口 |
| 演化基础 | MVP/MVVM/分层架构都是在 MVC 基础上演化而来 |

### 9.2 缺点

| 缺点 | 说明 |
|------|------|
| Controller 容易膨胀 | 业务逻辑没沉到 Model 时会全堆 Controller |
| View 与 Model 耦合(主动 MVC) | View 直接读 Model 字段,字段一改 View 全炸 |
| Web 场景下观察者失效 | HTTP 无状态,主动 MVC 用不上 |
| 小项目过度设计 | 一个简单的 CRUD,搞 MVC 反而啰嗦 |
| 不解决跨层复杂业务 | 复杂业务流(如订单+支付+库存)MVC 没有指引 |

### 9.3 什么时候**不要**用 MVC

- **脚本/工具**:一次性数据处理,一个文件搞定
- **简单 CRUD**:Django Admin 这种,框架已经帮你抽象了,不用自己再分层
- **纯 API 服务**:没有 View,用分层架构或六边形架构更合适
- **实时游戏**:游戏循环和数据驱动架构更适合,不是 MVC

---

## 十、常见误区与陷阱

### 10.1 把 Model 当成 ORM 实体

很多人误以为「Model = 数据库表对应的类」。这是窄化理解。

Model 是**整个领域逻辑层**,ORM 实体只是 Model 的一部分。例如「订单提交」是一个业务流程,涉及库存检查、优惠计算、风控,这些都属于 Model 层,但它们可能根本不是数据库表。

正确的分层应该是:

\`\`\`
Model(领域层)
├── Entity(实体,如 Order、User)  ← 对应 ORM
├── Value Object(值对象,如 Money、Address)
├── Service(领域服务,如 PaymentService)
└── Repository(仓储,封装数据访问)
\`\`\`

### 10.2 Controller 里写业务逻辑

反例:

\`\`\`python
# 反模式:Fat Controller
@app.route("/order", methods=["POST"])
def create_order():
    data = request.json
    # ❌ 业务逻辑写在 Controller 里
    if data["amount"] > 10000:
        return "需要审核", 400
    if data["user_id"] not in VIP_USERS:
        discount = 1.0
    else:
        discount = 0.8
    total = data["amount"] * discount
    # ... 一堆 SQL
    return {"total": total}
\`\`\`

正例:

\`\`\`python
# 正确:Controller 只做协调
@app.route("/order", methods=["POST"])
def create_order():
    data = request.json
    try:
        order = order_service.create(data)   # 业务逻辑沉到 Model
        return {"id": order.id, "total": order.total}
    except BusinessError as e:
        return {"error": str(e)}, 400
\`\`\`

### 10.3 View 直接操作 Model

反例(模板里调用 Model 方法):

\`\`\`html
<!-- 反模式:View 调用 Model -->
<ul>
  {% for u in users %}
    <li>{{ u.name }} - {{ u.calculate_discount() }}</li>  {# ❌ #}
  {% endfor %}
</ul>
\`\`\`

View 应该只**读** Model 已经算好的数据,不该**调** Model 的方法去触发计算。计算应该在 Controller 或 Model 里完成,View 只展示结果。

---

## 十一、易错点小结表格

| 序号 | 易错点 | 错误做法 | 正确做法 |
|------|--------|----------|----------|
| 1 | Model 等同 ORM | Model 只有 \`models.CharField\` 字段 | Model 包含实体、服务、仓储等领域逻辑 |
| 2 | Controller 堆业务 | 金额计算、规则判断写在 Controller | 业务沉到 Model/Service,Controller 只协调 |
| 3 | View 调用 Model 方法 | 模板里 \`{{ user.compute() }}\` | Controller 算好结果传给 View |
| 4 | 混淆主动/被动 MVC | Web 应用强求观察者刷新 | Web 用请求-响应,桌面才用观察者 |
| 5 | Model 依赖 UI | Model 里 \`import tkinter\` 或 \`print\` | Model 纯业务,与 UI 框架无关 |
| 6 | 多 View 不同步 | 改了 Model 忘记 notify | 用观察者模式自动通知 |
| 7 | 观察者内存泄漏 | View 销毁不注销 | 显式 remove_observer 或用 weakref |
| 8 | Django View 与 MVC View 混淆 | 以为 Django View 是展示层 | Django View = MVC Controller,Template 才是 View |
| 9 | 小项目强上 MVC | 几十行脚本也分三层 | 小工具直接写,大了再拆 |
| 10 | 异常跨层穿透 | Model 抛 SQL 异常直接到用户 | Controller 捕获转成友好提示 |

---

## 十二、本章小结

MVC 是所有架构模式的鼻祖,理解它你就掌握了「分层」这一思想的雏形。关键记住几点:

1. **MVC 是架构模式,不是设计模式**,它讨论的是系统宏观结构
2. **传统 MVC(主动)**靠观察者模式让 View 自动同步 Model,适合桌面 GUI
3. **Web MVC(被动)**靠请求-响应,View 不监听 Model,Controller 把数据塞给模板
4. **Model 是核心**,应该独立于 UI 框架,可单元测试
5. **Controller 应该薄**,业务逻辑沉到 Model
6. **Django MTV 就是 MVC 换名**,View=Controller,Template=View
7. **小项目别滥用 MVC**,但项目一大,MVC 是天然的起点

掌握了 MVC,接下来你会看到 MVP、MVVM 如何修正 MVC 的缺陷,以及分层、整洁、六边形架构如何把「关注点分离」推到更极致的境界。所有这些架构,本质都是在回答同一个问题:**「怎么让代码组织得既能容纳变化,又能让人看懂」**。MVC 给出了第一个经典答案。
`,
  },
  {
    id: "pyarch-mvp-mvvm",
    icon: "🎪",
    title: "MVP 与 MVVM 模式",
    group: "架构模式",
    content: `# MVP 与 MVVM 模式

## 一、为什么 MVC 之后还需要 MVP / MVVM

MVC 是开山鼻祖,但它有几个公认的痛点:

1. **View 与 Model 直接耦合**:主动 MVC 中,View 直接读 Model 字段、监听 Model 事件,导致 View 难测试、难替换
2. **Controller 角色模糊**:既是输入翻译器,又是流程协调器,还可能直接操作 View,职责混乱
3. **测试困难**:View 强依赖 Model 和 GUI 框架,单元测试时必须 mock 一堆东西

为了解决这些问题,演化出两个分支:

- **MVP(Model-View-Presenter)**:把 Controller 改造成 Presenter,**切断 View 与 Model 的直接联系**,Presenter 居中协调
- **MVVM(Model-View-ViewModel)**:在 MVP 基础上引入**双向数据绑定**,让 View 自动反映 ViewModel 的状态,进一步减少手工同步代码

\`\`\`
    MVC                     MVP                     MVVM
    ───                     ───                     ────
  View ↔ Model            View ← Presenter → Model    View ↔ ViewModel ← Model
   (直接耦合)              (View 不知 Model)            (双向绑定)
\`\`\`

可以认为:MVP 是「严格版的 MVC」,MVVM 是「带数据绑定的 MVP」。

---

## 二、MVP:Model-View-Presenter

### 2.1 MVP 的定义

> MVP 是一种派生自 MVC 的架构模式,核心改动是:View 与 Model **完全隔离**,所有交互都通过 Presenter 中转。Presenter 同时持有 View 接口和 Model,扮演「协调者」角色。

### 2.2 MVP 的结构图

\`\`\`
              用户操作
                 │
                 ▼
        ┌────────────────┐
        │      View       │  ← 只实现 View 接口
        │  (被动视图)     │     不含业务,不含 Model 引用
        └────┬───────┬───┘
   事件上报  │       │  调用 Presenter 方法
             ▼       ▼
        ┌────────────────┐
        │   Presenter    │  ← 协调者
        │ - view: IView  │     持有 View 接口和 Model
        │ - model: Model │     处理业务、更新 View
        └────────┬───────┘
                 │ 调用
                 ▼
        ┌────────────────┐
        │     Model       │  ← 纯数据与业务规则
        └────────────────┘
\`\`\`

注意箭头方向:

- **View → Presenter**:View 把用户事件委托给 Presenter
- **Presenter → View**:Presenter 通过 View 接口更新展示
- **Presenter → Model**:Presenter 调用 Model 业务方法
- **View ✗ Model**:View **不直接访问** Model!这是 MVP 与 MVC 最大的区别

### 2.3 三种角色的职责

| 角色 | 职责 | 不该做的事 |
|------|------|-----------|
| Model | 数据与业务规则 | 不依赖 View |
| View(被动视图 Passive View) | 实现接口,只做展示和事件转发 | 不写业务,不直接读 Model |
| Presenter | 接收 View 事件,调 Model,更新 View | 不直接操作 UI 控件(只通过接口) |

### 2.4 MVP 的两种风格

| 风格 | 特点 | View 是否主动 |
|------|------|---------------|
| Passive View(被动视图) | View 极其 dumb,所有状态由 Presenter 推送 | 完全被动 |
| Supervising Controller(监督控制器) | View 可以简单数据绑定 Model,Presenter 只处理复杂逻辑 | 半主动 |

业界通常说 MVP 默认指 Passive View,因为它最利于测试。

### 2.5 MVP 的可测试性优势

MVP 最大的卖点是**测试性**。因为 View 通过接口暴露,Presenter 依赖的是 \`IView\` 接口而不是具体 View 类,所以可以:

\`\`\`python
# 测试 Presenter 时,mock 一个 IView 即可
class FakeView:
    def __init__(self):
        self.displayed = None
        self.error = None

    def show_todos(self, todos):
        self.displayed = todos

    def show_error(self, msg):
        self.error = msg

def test_presenter_add():
    model = TodoModel()
    view = FakeView()
    presenter = TodoPresenter(model, view)
    presenter.add("买菜")
    assert len(view.displayed) == 1
    assert view.displayed[0].text == "买菜"
\`\`\`

完全不需要启动 GUI/浏览器,Presenter 测试就跑起来了。

---

## 三、MVP Python 实战:待办事项

### 3.1 定义 View 接口

Python 没有原生 interface,用 \`abc.ABC\` 模拟:

\`\`\`python
# view.py
from abc import ABC, abstractmethod
from typing import List
from model import Todo

class ITodoView(ABC):
    """View 接口,Presenter 通过它操作 View。"""
    @abstractmethod
    def show_todos(self, todos: List[Todo]) -> None: ...

    @abstractmethod
    def show_error(self, msg: str) -> None: ...

    @abstractmethod
    def show_info(self, msg: str) -> None: ...

    @abstractmethod
    def clear_input(self) -> None: ...
\`\`\`

### 3.2 实现 Model

Model 与 MVC 版本基本一致,但**去掉了观察者机制**(因为 Presenter 会主动推 View):

\`\`\`python
# model.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

@dataclass
class Todo:
    id: str
    text: str
    done: bool = False
    created_at: datetime = field(default_factory=datetime.now)

class TodoModel:
    def __init__(self):
        self._todos: List[Todo] = []

    def add(self, text: str) -> Todo:
        if not text.strip():
            raise ValueError("待办内容不能为空")
        todo = Todo(id=str(uuid4())[:8], text=text.strip())
        self._todos.append(todo)
        return todo

    def complete(self, todo_id: str) -> None:
        todo = self.find(todo_id)
        if not todo:
            raise KeyError(f"找不到待办 {todo_id}")
        if todo.done:
            raise ValueError("已完成")
        todo.done = True

    def remove(self, todo_id: str) -> None:
        todo = self.find(todo_id)
        if not todo:
            raise KeyError(f"找不到待办 {todo_id}")
        self._todos.remove(todo)

    def find(self, todo_id: str) -> Optional[Todo]:
        return next((t for t in self._todos if t.id == todo_id), None)

    @property
    def todos(self) -> List[Todo]:
        return list(self._todos)
\`\`\`

### 3.3 实现 Presenter

\`\`\`python
# presenter.py
from model import TodoModel
from view import ITodoView

class TodoPresenter:
    """Presenter:持有 View 接口和 Model,处理事件、协调更新。"""
    def __init__(self, model: TodoModel, view: ITodoView):
        self.model = model
        self.view = view
        # 初始化时拉一次数据
        self._refresh()

    def add(self, text: str) -> None:
        try:
            self.model.add(text)
            self.view.clear_input()
            self._refresh()
            self.view.show_info(f"已添加:{text}")
        except ValueError as e:
            self.view.show_error(str(e))

    def complete(self, todo_id: str) -> None:
        try:
            self.model.complete(todo_id)
            self._refresh()
        except (KeyError, ValueError) as e:
            self.view.show_error(str(e))

    def remove(self, todo_id: str) -> None:
        try:
            self.model.remove(todo_id)
            self._refresh()
            self.view.show_info(f"已删除:{todo_id}")
        except KeyError as e:
            self.view.show_error(str(e))

    def _refresh(self) -> None:
        """Presenter 主动把数据推给 View。"""
        self.view.show_todos(self.model.todos)
\`\`\`

注意 \`Presenter._refresh()\`:每次 Model 变化后,Presenter **主动**调用 \`view.show_todos()\`。这就是「Presenter 推 View」的机制——取代了 MVC 的「Model 通知 View」。

### 3.4 实现具体 View(终端)

\`\`\`python
# terminal_view.py
from typing import List
from view import ITodoView
from model import Todo

class TodoTerminalView(ITodoView):
    def show_todos(self, todos: List[Todo]) -> None:
        print("\\n=== 待办列表 ===")
        for t in todos:
            mark = "✓" if t.done else "○"
            print(f"  {mark} [{t.id}] {t.text}")
        if not todos:
            print("  (空)")

    def show_error(self, msg: str) -> None:
        print(f"[错误] {msg}")

    def show_info(self, msg: str) -> None:
        print(f"[信息] {msg}")

    def clear_input(self) -> None:
        # 终端版无需清空输入框
        pass
\`\`\`

### 3.5 入口与交互循环

\`\`\`python
# main.py
from model import TodoModel
from presenter import TodoPresenter
from terminal_view import TodoTerminalView

def main():
    model = TodoModel()
    view = TodoTerminalView()
    presenter = TodoPresenter(model, view)

    while True:
        cmd = input("\\n> ").split(" ", 1)
        if not cmd[0]:
            continue
        action = cmd[0].lower()
        if action == "quit":
            break
        elif action == "add":
            presenter.add(cmd[1] if len(cmd) > 1 else "")
        elif action == "complete":
            presenter.complete(cmd[1])
        elif action == "remove":
            presenter.remove(cmd[1])

if __name__ == "__main__":
    main()
\`\`\`

### 3.6 测试 Presenter(关键优势)

\`\`\`python
# test_presenter.py
import pytest
from model import TodoModel
from presenter import TodoPresenter

class FakeView:
    def __init__(self):
        self.todos = []
        self.errors = []
        self.infos = []
        self.cleared = 0

    def show_todos(self, todos):
        self.todos = todos
    def show_error(self, msg):
        self.errors.append(msg)
    def show_info(self, msg):
        self.infos.append(msg)
    def clear_input(self):
        self.cleared += 1

def test_add_normal():
    model = TodoModel()
    view = FakeView()
    p = TodoPresenter(model, view)
    p.add("买菜")
    assert len(view.todos) == 1
    assert view.todos[0].text == "买菜"
    assert view.cleared == 1
    assert view.infos == ["已添加:买菜"]

def test_add_empty():
    model = TodoModel()
    view = FakeView()
    p = TodoPresenter(model, view)
    p.add("   ")
    assert view.errors == ["待办内容不能为空"]
    assert len(view.todos) == 0

def test_complete():
    model = TodoModel()
    view = FakeView()
    p = TodoPresenter(model, view)
    p.add("写报告")
    todo_id = view.todos[0].id
    p.complete(todo_id)
    assert view.todos[0].done is True

def test_complete_not_found():
    model = TodoModel()
    view = FakeView()
    p = TodoPresenter(model, view)
    p.complete("no-exist")
    assert len(view.errors) == 1
\`\`\`

注意:测试**完全不需要终端、不需要 GUI、不需要 HTTP**。这就是 MVP 的杀手锏——可测试性远超 MVC。

---

## 四、MVVM:Model-View-ViewModel

### 4.1 MVVM 的定义

> MVVM 由微软于 2005 年提出(为 WPF 设计),核心是在 View 和 Model 之间加一个 ViewModel,ViewModel 暴露**数据流(状态)+ 命令**,通过**双向数据绑定**让 View 自动同步,无需手工刷新。

MVVM 的关键创新是**数据绑定(Data Binding)**:

- ViewModel 不直接操作 View 控件,只改变自身状态
- View 通过绑定机制「观察」ViewModel 状态,状态一变 View 自动刷新
- View 上的用户输入通过绑定自动写回 ViewModel

### 4.2 MVVM 结构图

\`\`\`
              用户操作
                 │
                 ▼ (双向绑定:命令)
        ┌────────────────┐
        │      View       │  ← 声明式绑定 ViewModel
        │  (UI/模板)      │     状态变化自动刷新
        └────┬───────┬───┘
   双向绑定  │       │  事件 → 命令
   (状态)    ▼       ▼
        ┌────────────────┐
        │   ViewModel     │  ← 暴露状态 + 命令
        │ - state: ...   │     不引用 View
        │ - commands      │
        └────────┬───────┘
                 │ 调用
                 ▼
        ┌────────────────┐
        │     Model       │  ← 纯数据/业务
        └────────────────┘
\`\`\`

### 4.3 MVVM 与 MVP 的核心差异

| 维度 | MVP | MVVM |
|------|-----|------|
| View 与 ViewModel/Presenter 关系 | Presenter 通过接口推数据 | View 通过绑定拉/推数据 |
| ViewModel/Presenter 是否引用 View | 是(依赖 IView 接口) | **否**(完全不知 View 存在) |
| 数据同步方式 | 手工调 \`view.show_xxx()\` | 自动双向绑定 |
| 测试难度 | 需 mock IView | 直接测 ViewModel 状态即可 |
| 适合场景 | 桌面/移动端 | 声明式 UI(WPF/Vue/Angular/SwiftUI) |

### 4.4 双向绑定:概念示例

在 WPF/Vue 里,绑定是框架级支持:

\`\`\`html
<!-- Vue 风格(伪代码) -->
<input v-model="vm.newTodoText" />   <!-- 输入自动写回 vm.newTodoText -->
<button @click="vm.add()">添加</button>
<ul>
  <li v-for="t in vm.todos">
    {{ t.text }}
  </li>
</ul>
\`\`\`

ViewModel 只需要:

\`\`\`javascript
// 伪代码
class TodoViewModel {
  newTodoText = ""
  todos = []

  add() {
    this.todos.push({ text: this.newTodoText })
    this.newTodoText = ""   // View 自动清空输入框
  }
}
\`\`\`

ViewModel **完全不引用 View**,但 View 自动响应 ViewModel 状态变化——这就是绑定的魔力。

---

## 五、MVVM 在 Python 的局限

Python 生态**没有像 WPF/Vue 那样原生的双向绑定框架**。原因:

1. **GUI 框架落后**:Tkinter/PyQt 没有声明式绑定机制
2. **Web 端模板不绑定**:Jinja2 是一次性渲染,不监听状态
3. **缺少响应式系统**:Python 没有 Vue 那种基于 \`Proxy\` 的响应式追踪

但我们可以**模拟**一个简化版 MVVM,核心思路是:

- ViewModel 暴露状态(属性)
- 用 \`property\` + 观察者机制模拟「状态变化通知」
- View 注册监听,状态一变就刷新

### 5.1 Python 简易 MVVM 实现

\`\`\`python
# observable_property.py
from typing import Callable, List

class Observable:
    """简易响应式基类,属性变化时通知监听者。"""
    def __init__(self):
        self._listeners: List[Callable[[str, object], None]] = []

    def bind(self, listener: Callable[[str, object], None]) -> None:
        self._listeners.append(listener)

    def _set(self, name: str, value: object) -> None:
        old = getattr(self, name, None)
        if old != value:
            object.__setattr__(self, name, value)
            for fn in self._listeners:
                fn(name, value)
\`\`\`

\`\`\`python
# view_model.py
from typing import List
from observable_property import Observable
from model import Todo, TodoModel

class TodoViewModel(Observable):
    """ViewModel:暴露状态(todos/new_text)和命令(add)。"""
    def __init__(self, model: TodoModel):
        super().__init__()
        self._model = model
        self.todos: List[Todo] = model.todos
        self.new_text: str = ""
        self.error: str = ""

    # —— 命令 ——
    def add(self) -> None:
        try:
            self._model.add(self.new_text)
            self._set("todos", self._model.todos)
            self._set("new_text", "")
            self._set("error", "")
        except ValueError as e:
            self._set("error", str(e))

    def complete(self, todo_id: str) -> None:
        try:
            self._model.complete(todo_id)
            self._set("todos", self._model.todos)
        except (KeyError, ValueError) as e:
            self._set("error", str(e))

    def set_new_text(self, text: str) -> None:
        self._set("new_text", text)
\`\`\`

\`\`\`python
# view.py —— View 绑定 ViewModel,状态变化自动刷新
from view_model import TodoViewModel

class TodoView:
    def __init__(self, vm: TodoViewModel):
        self.vm = vm
        # 注册监听:任何属性变化都触发重新渲染
        self.vm.bind(self._on_change)

    def _on_change(self, prop: str, value) -> None:
        # 在真实框架里,这里会做精细的差异化更新
        # 我们简化为「全部重画」
        if prop == "error" and value:
            print(f"[错误] {value}")
        elif prop == "todos":
            self._render()
        elif prop == "new_text":
            # 在 GUI 里这里会清空输入框
            pass

    def _render(self):
        print("\\n=== 待办 ===")
        for t in self.vm.todos:
            print(f"  {'✓' if t.done else '○'} [{t.id}] {t.text}")
        if not self.vm.todos:
            print("  (空)")

    def run(self):
        self._render()
        while True:
            text = input("\\n输入(直接回车退出): ").strip()
            if not text:
                break
            self.vm.set_new_text(text)
            self.vm.add()
\`\`\`

\`\`\`python
# main.py
from model import TodoModel
from view_model import TodoViewModel
from view import TodoView

model = TodoModel()
vm = TodoViewModel(model)
view = TodoView(vm)
view.run()
\`\`\`

### 5.2 Python MVVM 的真实选择

虽然能用纯 Python 模拟 MVVM,但实际工程中:

| 场景 | 推荐做法 |
|------|----------|
| PyQt/PySide 应用 | 用 \`QtCore.pyqtSignal\` 实现响应式,接近 MVVM |
| Web 后端 | 不要 MVVM,后端没「View 绑定」概念,用分层/六边形 |
| 全栈 Vue + FastAPI | 前端 Vue 用 MVVM,后端 FastAPI 用分层,各管各的 |
| 桌面工具 | 用 MVP 更简单,不必强行 MVVM |

记住:**MVVM 的核心价值在于声明式数据绑定,而 Python 生态缺乏这个基础设施**。强行在 Python 后端用 MVVM,往往是「为了模式而模式」。

---

## 六、MVC / MVP / MVVM 三者对比

| 维度 | MVC | MVP | MVVM |
|------|-----|-----|------|
| View 与 Model 关系 | 直接通信(主动 MVC) | 完全隔离 | 完全隔离 |
| 中间角色 | Controller | Presenter | ViewModel |
| 中间角色是否引用 View | 通常引用 | 引用(IView 接口) | **不引用** |
| 数据同步 | 观察者 / 手工 | Presenter 手工推送 | 双向绑定自动 |
| 可测试性 | 中(View 难测) | 高(可 mock View) | 极高(ViewModel 纯状态) |
| 适合平台 | 桌面/Web 通用 | 桌面/移动(Android/WinForms) | 声明式 UI(WPF/Vue/Angular/SwiftUI) |
| 学习成本 | 低 | 中 | 高(需理解绑定) |
| Python 适用性 | ★★★★(Django/Flask 天然 MVC) | ★★★(桌面/可测后端) | ★★(生态不支持,需模拟) |

### 6.1 依赖方向对比图

\`\`\`
MVC(主动):            MVP:                  MVVM:
View ↔ Model           View ← Presenter → Model   View ↔(binding)↔ ViewModel ← Model
(双向耦合)              (View 不知 Model)         (ViewModel 不知 View)
\`\`\`

### 6.2 数据流对比

**MVC**:

\`\`\`
用户 → Controller → Model →(notify)→ View 刷新
\`\`\`

**MVP**:

\`\`\`
用户 → View → Presenter → Model
                  ↓
                Presenter → View 刷新
\`\`\`

**MVVM**:

\`\`\`
用户 → View(绑定命令)→ ViewModel → Model
                          ↓
                       ViewModel 状态变化
                          ↓
                       View(绑定状态)自动刷新
\`\`\`

---

## 七、用同一个待办应用对比 MVP 与 MVVM

我们前面已经实现了 MVP 版本。再看 MVVM 版本的「添加待办」流程:

| 步骤 | MVP | MVVM |
|------|-----|------|
| 1. 用户输入文本 | View 转发事件给 Presenter | View 双向绑定到 \`vm.new_text\` |
| 2. 触发添加 | Presenter 调 \`view.clear_input()\` + \`model.add()\` | \`vm.add()\` 内部调 \`model.add()\`,改 \`vm.todos\` |
| 3. 刷新列表 | Presenter 调 \`view.show_todos()\` | \`vm.todos\` 变化,View 自动重渲染 |
| 4. 清空输入框 | Presenter 调 \`view.clear_input()\` | \`vm.new_text=""\`,View 自动清空 |

看 MVP 要写 4 个调用,MVVM 只改 2 个状态。**MVVM 的核心收益是「少写同步代码」**。但代价是必须有一套绑定框架。

---

## 八、什么时候选 MVP / MVVM

### 8.1 选 MVP 的场景

- **Android(传统)**:Activity/Fragment 当 View,Presenter 处理逻辑,View 接口可测
- **WinForms / WPF(不用绑定时)**:Form 当 View
- **Python 桌面工具**:Tkinter/PyQt 应用,需要可测试
- **跨平台 GUI**:Flutter(虽然 Flutter 自己叫 Provider/Bloc,思路类似)
- **后端的「Use Case + IO 接口」**:本质上是一种 MVP,Presenter 即 Use Case

### 8.2 选 MVVM 的场景

- **WPF**:MVVM 是 WPF 的官方推荐
- **Vue / Angular / Knockout**:前端框架原生支持
- **SwiftUI / Jetpack Compose**:声明式 UI,响应式状态
- **React + MobX**:也算 MVVM 思路(状态驱动)
- **Python + PyQt(用 pyqtProperty)**:可以接近 MVVM

### 8.3 不选的场景

- **简单 CRUD 后端**:MVC/分层足够,MVP/MVVM 是过度设计
- **没有 UI 的纯服务**:直接分层架构,不需要 View 概念
- **脚本/小工具**:函数式编程,一个文件搞定

---

## 九、常见误区

### 9.1 把 ViewModel 当成 Model

\`\`\`python
# 反模式:ViewModel 直接当数据用
class UserViewModel:
    def __init__(self):
        self.name = ""           # ❌ 应该是 Model 的字段
        self.email = ""          # ❌ 应该是 Model 的字段
        self.save = lambda: ...  # ❌ 应该调 Model.save
\`\`\`

正确做法:ViewModel 暴露的是**给 View 用的状态**(可能是 Model 的投影、组合、转换),不是直接复制 Model 字段。

\`\`\`python
# 正确:ViewModel 是 Model 的「View 友好投影」
class UserViewModel:
    def __init__(self, user: User):
        self._user = user

    @property
    def display_name(self) -> str:
        return f"{self._user.name} <{self._user.email}>"

    @property
    def avatar_url(self) -> str:
        return f"https://avatar.example.com/{self._user.email_hash}"
\`\`\`

### 9.2 Presenter 写业务规则

\`\`\`python
# 反模式:Presenter 里写业务规则
class OrderPresenter:
    def submit(self, order):
        if order.total > 10000:        # ❌ 业务规则
            self.view.show_error("需要审核")
            return
        # ...
\`\`\`

业务规则应该在 Model,Presenter 只负责「调用 Model → 处理结果 → 通知 View」。

### 9.3 View 引用 Model

\`\`\`python
# 反模式:MVP 的 View 直接读 Model
class TodoView(ITodoView):
    def render(self, model):           # ❌ View 不该知道 Model
        for t in model.todos:           # ❌ 直接读 Model 字段
            print(t.text)
\`\`\`

正确做法:View 只接收 Presenter 推来的纯数据(列表、字符串),不该 import Model。

---

## 十、易错点小结表格

| 序号 | 易错点 | 错误做法 | 正确做法 |
|------|--------|----------|----------|
| 1 | View 引用 Model | View 里 \`from model import\` | View 只接收 primitive 数据 |
| 2 | Presenter 写业务规则 | 金额判断写在 Presenter | 业务规则沉到 Model |
| 3 | ViewModel 当 Model | ViewModel 复制 Model 所有字段 | ViewModel 是 View 友好的投影 |
| 4 | 测试时启动 GUI | 测 Presenter 启动 Tkinter | mock IView 接口 |
| 5 | Python 强行 MVVM | 后端用 MVVM 绑定 | 后端用分层,前端用 MVVM |
| 6 | 混淆 Controller/Presenter | MVP 里叫 Controller | MVP 叫 Presenter,职责不同 |
| 7 | View 接口设计过细 | 每个控件一个方法 | 接口按业务行为抽象 |
| 8 | 双向绑定无限循环 | A 改 B,B 改 A | 监听器判断值相等就 return |
| 9 | ViewModel 持有 View | \`vm.view = view\` | ViewModel 完全不知 View |
| 10 | 小项目强上 MVP/MVVM | 几个页面也分三层 | 简单页面直接 MVC |

---

## 十一、本章小结

MVP 和 MVVM 都是 MVC 的演化版本,解决的是「View 与 Model 耦合」和「测试困难」两大痛点:

1. **MVP** 切断 View 与 Model 的直接联系,Presenter 通过 IView 接口操作 View,**测试性大幅提升**
2. **MVVM** 在 MVP 基础上引入**双向数据绑定**,ViewModel 不引用 View,**同步代码近乎为零**
3. **MVP 适合**桌面/移动端,以及 Python 中需要可测试性的 GUI 应用
4. **MVVM 适合**声明式 UI(WPF/Vue/Angular/SwiftUI),Python 生态缺乏原生支持
5. **后端**通常不需要 MVP/MVVM,因为后端没有「View 控件」概念,直接用分层或六边形架构更合适
6. 三者本质都是在回答:**「UI 逻辑、业务逻辑、数据怎么分」**,只是分的力度和通信方式不同

选择时记住一个原则:**测试性需求越高,越往后选(MVC → MVP → MVVM);UI 框架越声明式,越往后选**。如果用 Tkinter 写个小工具,MVC 足够;如果做大型 Vue 应用,MVVM 是默认;如果做 Android, MVP/MVVM 都可。**架构是工具,不是教条**。
`,
  },
  {
    id: "pyarch-layered",
    icon: "🏛️",
    title: "分层架构(Layered Architecture)",
    group: "架构模式",
    content: `# 分层架构(Layered Architecture)

## 一、分层架构是什么

分层架构(Layered Architecture)是工程界最常见、最朴素的架构模式。它的核心定义是:

> 将系统按照职责划分成**水平的若干层**,每层只与**相邻层**通信,上层依赖下层,下层不感知上层。

用一句话概括:**「上下分层,单向依赖,各管一摊」**。

如果你用过任何企业级框架(Spring / Django / Rails / .NET),你已经在用分层架构了。它是其他高级架构(整洁架构、六边形架构)的基础。

### 1.1 一张图理解分层

\`\`\`
   ┌─────────────────────────────────────┐
   │        表现层 Presentation           │  ← HTTP / CLI / GUI
   │   (routes, controllers, views)      │
   ├─────────────────────────────────────┤
   │        业务层 Business              │  ← 业务规则、流程编排
   │      (services, use cases)          │
   ├─────────────────────────────────────┤
   │       持久层 Persistence            │  ← 数据访问
   │   (repositories, DAOs, ORM)         │
   ├─────────────────────────────────────┤
   │       数据库层 Database             │  ← 实际存储
   │   (PostgreSQL, MySQL, Redis)        │
   └─────────────────────────────────────┘
           ↑ 上层依赖下层,下层不知上层
\`\`\`

注意箭头方向:**调用从上往下,依赖从上往下**。下层永远不知道上层存在。

### 1.2 为什么需要分层

不分层的代码长什么样?来看个反面教材:

\`\`\`python
# 反模式:全堆在一起的"意大利面条"
from flask import Flask, request
import psycopg2

app = Flask(__name__)

@app.route("/users", methods=["POST"])
def create_user():
    # 1. 取参数(表现层)
    name = request.json["name"]
    email = request.json["email"]

    # 2. 业务校验(业务层)
    if not name or len(name) > 50:
        return "name 无效", 400
    if "@" not in email:
        return "email 无效", 400

    # 3. 直接写 SQL(持久层)
    conn = psycopg2.connect("postgres://...")
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        return "邮箱已存在", 400
    cur.execute(
        "INSERT INTO users(name, email) VALUES(%s, %s)",
        (name, email)
    )
    conn.commit()

    # 4. 返回结果(表现层)
    return {"name": name, "email": email}, 201
\`\`\`

这段代码的问题:

1. **无法测试**:测试必须连真实数据库 + 启动 Flask
2. **无法复用**:同样的注册逻辑,CLI 工具想用?复制一份
3. **修改困难**:换 MySQL 要改 4 处;改校验规则要在路由里翻
4. **可读性差**:HTTP、业务、SQL 三种关注点混在一起

分层的解法是:**把这些关注点各自归位**。

---

## 二、经典四层架构

### 2.1 四层职责详解

| 层 | 职责 | 典型组件 | Python 例子 |
|----|------|----------|-------------|
| 表现层(Presentation) | 接收输入、返回输出、协议适配 | Routes, Controllers, Views | Flask \`@app.route\`, Django View |
| 业务层(Business/Service) | 业务规则、流程编排、事务边界 | Services, Use Cases | \`UserService.register()\` |
| 持久层(Persistence) | 数据访问抽象,封装存储细节 | Repositories, DAOs | \`UserRepository.save()\` |
| 数据库层(Database) | 实际存储引擎 | RDBMS, NoSQL, 文件 | PostgreSQL, Redis, MongoDB |

### 2.2 各层代码示例

**表现层**:

\`\`\`python
# routes.py
from flask import Blueprint, request, jsonify
from services import user_service

bp = Blueprint("users", __name__)

@bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    try:
        user = user_service.register(data["name"], data["email"])
        return jsonify({"id": user.id, "name": user.name}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except user_service.DuplicateEmail:
        return jsonify({"error": "邮箱已存在"}), 409
\`\`\`

表现层只做:取参数 → 调 service → 转结果。**没有任何业务逻辑、没有 SQL**。

**业务层**:

\`\`\`python
# services/user_service.py
from typing import Optional
from models import User
from repositories import UserRepository

class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register(self, name: str, email: str) -> User:
        # 业务规则
        if not name or len(name) > 50:
            raise ValueError("name 无效")
        if "@" not in email:
            raise ValueError("email 无效")
        if self.repo.find_by_email(email):
            raise DuplicateEmail(email)
        user = User(id=None, name=name, email=email)
        self.repo.save(user)
        return user

class DuplicateEmail(Exception):
    pass
\`\`\`

业务层只做:校验、流程、调仓储。**没有 HTTP、没有 SQL**。

**持久层**:

\`\`\`python
# repositories/user_repository.py
from typing import Optional
from models import User

class UserRepository:
    def __init__(self, db):
        self.db = db

    def save(self, user: User) -> User:
        # 用 SQLAlchemy / psycopg2 / 任选一种
        sql = "INSERT INTO users(name, email) VALUES(:name, :email) RETURNING id"
        row = self.db.execute(sql, name=user.name, email=user.email).fetchone()
        user.id = row["id"]
        return user

    def find_by_email(self, email: str) -> Optional[User]:
        sql = "SELECT id, name, email FROM users WHERE email=:email"
        row = self.db.execute(sql, email=email).fetchone()
        if not row:
            return None
        return User(id=row["id"], name=row["name"], email=row["email"])
\`\`\`

持久层只做:CRUD。**没有业务规则、没有 HTTP**。

**模型层**:

\`\`\`python
# models/user.py
from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    id: Optional[int]
    name: str
    email: str
\`\`\`

模型层是纯数据结构,没有行为(也可以有简单的领域方法)。

### 2.3 调用链路

\`\`\`
POST /users
   │
   ▼
routes.create_user          [表现层]
   │  调 user_service.register()
   ▼
UserService.register         [业务层]
   │  校验、调 repo.find_by_email、repo.save
   ▼
UserRepository.save          [持久层]
   │  执行 SQL
   ▼
PostgreSQL                   [数据库层]
   │
   ▼(逐层返回)
User 对象 ← User 对象 ← User 对象 ← HTTP 响应
\`\`\`

每层只跟相邻层打交道,职责清晰。

---

## 三、调用规则:严格分层 vs 松散分层

### 3.1 严格分层(Strict Layering)

> 严格分层要求:**每层只能调用直接相邻的下层**,不能跨层。

例如表现层只能调业务层,不能直接调持久层。

\`\`\`
✅ routes → services → repositories → db
❌ routes → repositories    (跨层)
❌ routes → db              (跨多层)
\`\`\`

严格分层的好处:**层与层之间耦合最低**,替换某一层时上层无感知。坏处:**调用链路长**,简单操作也要绕一圈。

### 3.2 松散分层(Relaxed Layering)

> 松散分层允许:**每层可以调用任意下层**,不限于相邻层。

例如表现层为了「读个用户列表」可以直接调仓储,不必经过 service。

\`\`\`
✅ routes → services → repositories → db
✅ routes → repositories    (允许)
✅ routes → db              (允许,但不推荐)
\`\`\`

松散分层的好处:**减少样板代码**(简单的 CRUD 不必造空 service)。坏处:**层边界模糊**,容易演变成大杂烩。

### 3.3 如何选择

| 场景 | 推荐 |
|------|------|
| 业务复杂、规则多 | 严格分层,边界清晰 |
| 简单 CRUD 占多数 | 松散分层,允许跨层 |
| 团队大、人多 | 严格分层,避免冲突 |
| 团队小、迭代快 | 松散分层,快速开发 |
| 长期维护系统 | 严格分层,可演化 |

### 3.4 CQRS 思想:读写分层

实践中常见一种**混合策略**:写操作走严格分层(必经 service,保证业务规则),读操作走松散分层(直接调仓储,绕过 service,提升性能)。这其实是 CQRS(命令查询职责分离)的雏形。

\`\`\`python
# 写:必经 service(强制业务规则)
@bp.route("/users", methods=["POST"])
def create():
    user = user_service.register(...)  # ✅ 走 service
    return jsonify(...)

# 读:直接走 repo(快速查询)
@bp.route("/users", methods=["GET"])
def list_users():
    users = user_repo.list_all()       # ✅ 绕过 service
    return jsonify(users)
\`\`\`

---

## 四、依赖方向与闭环依赖

### 4.1 依赖必须单向

分层架构的铁律:**依赖必须从上往下,不能反向**。如果下层反向依赖上层,会形成**闭环依赖**,导致:

- 编译/加载困难(循环 import)
- 测试困难(mock 上一层才能测下一层)
- 死锁风险(A 等 B,B 等 A)

### 4.2 闭环依赖的例子

\`\`\`python
# repositories/user_repo.py
from services import email_service   # ❌ 持久层依赖业务层

class UserRepository:
    def save(self, user):
        # ... 保存后发邮件
        email_service.send_welcome(user.email)
\`\`\`

\`\`\`python
# services/email_service.py
from repositories import user_repo   # ❌ 业务层依赖持久层

class EmailService:
    def send_welcome(self, email):
        user = user_repo.find_by_email(email)
        # ...
\`\`\`

两个文件互相 import,Python 会报错或行为异常。

### 4.3 解法:依赖倒置 + 事件

**方案 1:依赖倒置(DIP)**

下层定义接口,上层实现接口,下层依赖接口而非具体类。

\`\`\`python
# repositories/interfaces.py(下层定义接口)
from abc import ABC, abstractmethod

class IEmailSender(ABC):
    @abstractmethod
    def send_welcome(self, email: str) -> None: ...

# repositories/user_repo.py
from .interfaces import IEmailSender

class UserRepository:
    def __init__(self, email_sender: IEmailSender):
        self.email_sender = email_sender   # 依赖抽象

    def save(self, user):
        # ... 保存
        self.email_sender.send_welcome(user.email)

# services/email_service.py(上层实现接口)
class EmailService(IEmailSender):
    def send_welcome(self, email: str) -> None:
        # ...
\`\`\`

**方案 2:事件驱动**

下层发事件,上层订阅,下层不知谁会处理。

\`\`\`python
# repositories/user_repo.py
class UserRepository:
    def __init__(self, event_bus):
        self.event_bus = event_bus

    def save(self, user):
        # ... 保存
        self.event_bus.publish("user.created", user)

# services/email_service.py
class EmailService:
    def on_user_created(self, user):
        # 发邮件
        ...

# wire 处
event_bus.subscribe("user.created", email_service.on_user_created)
\`\`\`

---

## 五、Python 实战:Flask + SQLAlchemy 分层

下面我们实现一个完整的「用户注册」功能,严格遵循四层分层。

### 5.1 项目结构

\`\`\`
user_register/
├── app.py                  # 入口 + 依赖装配
├── models/
│   ├── __init__.py
│   └── user.py             # 领域模型(纯数据)
├── repositories/
│   ├── __init__.py
│   ├── interfaces.py       # 仓储抽象接口
│   └── user_repository.py  # SQLAlchemy 实现
├── services/
│   ├── __init__.py
│   └── user_service.py     # 业务层
└── routes/
    ├── __init__.py
    └── users.py            # 表现层
\`\`\`

### 5.2 模型层

\`\`\`python
# models/user.py
from dataclasses import dataclass
from typing import Optional

@dataclass
class User:
    """领域模型,与具体 ORM 解耦。"""
    id: Optional[int]
    name: str
    email: str
    is_active: bool = True

    def __post_init__(self):
        # 简单的领域规则(可选)
        if not self.email or "@" not in self.email:
            raise ValueError(f"非法 email: {self.email}")
\`\`\`

### 5.3 持久层

\`\`\`python
# repositories/interfaces.py
from abc import ABC, abstractmethod
from typing import Optional
from models import User

class IUserRepository(ABC):
    """仓储抽象:业务层依赖此接口,不依赖具体实现。"""
    @abstractmethod
    def save(self, user: User) -> User: ...

    @abstractmethod
    def find_by_email(self, email: str) -> Optional[User]: ...

    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[User]: ...
\`\`\`

\`\`\`python
# repositories/user_repository.py
from typing import Optional
from sqlalchemy import text
from models import User
from .interfaces import IUserRepository

class SqlAlchemyUserRepository(IUserRepository):
    """SQLAlchemy 实现。换 MySQL/PG 只改这里。"""
    def __init__(self, db_session):
        self.session = db_session

    def save(self, user: User) -> User:
        sql = text("""
            INSERT INTO users(name, email, is_active)
            VALUES(:name, :email, :is_active)
            RETURNING id
        """)
        result = self.session.execute(sql, {
            "name": user.name,
            "email": user.email,
            "is_active": user.is_active,
        })
        user.id = result.scalar()
        return user

    def find_by_email(self, email: str) -> Optional[User]:
        sql = text("SELECT id, name, email, is_active FROM users WHERE email=:email")
        row = self.session.execute(sql, {"email": email}).fetchone()
        if not row:
            return None
        return User(
            id=row.id, name=row.name,
            email=row.email, is_active=row.is_active
        )

    def find_by_id(self, user_id: int) -> Optional[User]:
        sql = text("SELECT id, name, email, is_active FROM users WHERE id=:id")
        row = self.session.execute(sql, {"id": user_id}).fetchone()
        if not row:
            return None
        return User(
            id=row.id, name=row.name,
            email=row.email, is_active=row.is_active
        )
\`\`\`

### 5.4 业务层

\`\`\`python
# services/user_service.py
from typing import Optional
from models import User
from repositories import IUserRepository

class UserService:
    """业务层:校验、流程、事务边界。"""
    def __init__(self, repo: IUserRepository):
        self.repo = repo

    def register(self, name: str, email: str) -> User:
        # 1. 校验
        if not name or len(name) > 50:
            raise ValueError("姓名长度需在 1-50 之间")
        if "@" not in email:
            raise ValueError("邮箱格式非法")

        # 2. 业务规则:邮箱唯一
        if self.repo.find_by_email(email):
            raise DuplicateEmailError(f"邮箱已注册: {email}")

        # 3. 创建并保存
        user = User(id=None, name=name, email=email, is_active=True)
        return self.repo.save(user)

    def get(self, user_id: int) -> Optional[User]:
        return self.repo.find_by_id(user_id)

class DuplicateEmailError(Exception):
    pass
\`\`\`

### 5.5 表现层

\`\`\`python
# routes/users.py
from flask import Blueprint, request, jsonify
from services import UserService, DuplicateEmailError

def create_users_bp(service: UserService):
    bp = Blueprint("users", __name__)

    @bp.route("/users", methods=["POST"])
    def create_user():
        data = request.get_json() or {}
        try:
            user = service.register(
                name=data.get("name", ""),
                email=data.get("email", ""),
            )
            return jsonify({"id": user.id, "name": user.name}), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except DuplicateEmailError as e:
            return jsonify({"error": str(e)}), 409

    @bp.route("/users/<int:user_id>", methods=["GET"])
    def get_user(user_id: int):
        user = service.get(user_id)
        if not user:
            return jsonify({"error": "not found"}), 404
        return jsonify({"id": user.id, "name": user.name, "email": user.email})

    return bp
\`\`\`

### 5.6 依赖注入:打通各层

\`\`\`python
# app.py
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from repositories import SqlAlchemyUserRepository
from services import UserService
from routes import create_users_bp

def create_app(config: dict) -> Flask:
    app = Flask(__name__)

    # 数据库层
    engine = create_engine(config["DATABASE_URL"])
    Session = sessionmaker(bind=engine)

    # 持久层
    repo = SqlAlchemyUserRepository(Session())

    # 业务层(注入持久层)
    service = UserService(repo)

    # 表现层(注入业务层)
    app.register_blueprint(create_users_bp(service))

    return app

if __name__ == "__main__":
    app = create_app({"DATABASE_URL": "postgresql://localhost/dev"})
    app.run(debug=True)
\`\`\`

### 5.7 关键观察

1. **依赖方向单向**:\`routes → services → repositories\`,反向不存在
2. **业务层依赖抽象**:\`UserService.__init__(repo: IUserRepository)\`,不依赖具体仓储
3. **可替换性**:换 MySQL 改 \`SqlAlchemyUserRepository\`,换 Redis 实现一个 \`RedisUserRepository\`,上层不动
4. **可测试性**:测 \`UserService\` 时 mock 一个 \`IUserRepository\` 即可,无需数据库

### 5.8 测试业务层

\`\`\`python
# test_user_service.py
import pytest
from unittest.mock import MagicMock
from services import UserService, DuplicateEmailError
from models import User

def test_register_success():
    repo = MagicMock()
    repo.find_by_email.return_value = None
    repo.save.return_value = User(id=1, name="张三", email="z@x.com")
    svc = UserService(repo)

    user = svc.register("张三", "z@x.com")

    assert user.id == 1
    repo.save.assert_called_once()

def test_register_duplicate():
    repo = MagicMock()
    repo.find_by_email.return_value = User(id=1, name="张三", email="z@x.com")
    svc = UserService(repo)

    with pytest.raises(DuplicateEmailError):
        svc.register("李四", "z@x.com")

    repo.save.assert_not_called()

def test_register_invalid_name():
    repo = MagicMock()
    svc = UserService(repo)
    with pytest.raises(ValueError):
        svc.register("", "z@x.com")
    with pytest.raises(ValueError):
        svc.register("x" * 51, "z@x.com")
\`\`\`

**不启动 Flask、不连数据库**就能测业务层——这就是分层的最大收益。

---

## 六、分层架构的优缺点

### 6.1 优点

| 优点 | 说明 |
|------|------|
| 关注点分离 | HTTP/业务/SQL 各归各位,代码清晰 |
| 可测试 | 每层可独立 mock 测试 |
| 可替换 | 换数据库、换框架只改对应层 |
| 团队协作 | 前后端可并行,接口先约定 |
| 学习成本最低 | 团队新人一天就能上手 |
| 工具支持好 | 各语言主流框架都基于分层 |

### 6.2 缺点

| 缺点 | 说明 |
|------|------|
| 过度分层 | 简单 CRUD 也要 4 层,代码膨胀 |
| 性能损耗 | 每层一次封装,有调用开销 |
| 简单穿透 | 大量"透传"方法,只为传一个参数 |
| 跨层重复 | 同一概念在 model/entity/dto 反复定义 |
| 难以应对复杂业务 | 业务跨多个领域时,层概念反而模糊 |

### 6.3 何时该用 / 不该用

**该用**:

- 中大型 Web 应用
- 有多种接入方式(HTTP + CLI + gRPC)
- 团队 5 人以上,需要明确分工
- 长期维护的企业系统

**不该用**:

- 一次性脚本
- 简单 CRUD(Django Admin 直接用即可)
- 实时游戏/数据流(用响应式架构)
- 极致性能场景(分层有开销)

---

## 七、分层架构的反模式

### 7.1 跨层调用(穿层)

\`\`\`python
# 反模式:表现层直接调持久层
@bp.route("/users/<int:id>")
def get_user(id):
    user = user_repo.find_by_id(id)   # ❌ 绕过 service
    return jsonify(user)
\`\`\`

读操作松散分层可以接受,但**写操作绝对不能跨层**,否则业务规则被绕过。

### 7.2 业务层变成「转发层」

\`\`\`python
# 反模式:service 只是 repo 的代理,没有任何业务
class UserService:
    def get(self, id):
        return self.repo.find_by_id(id)   # 只是转发
    def list(self):
        return self.repo.list_all()        # 只是转发
    def save(self, user):
        return self.repo.save(user)        # 只是转发
\`\`\`

如果 service 全是这种「转发」,说明分层过早,应该松散分层让 routes 直接调 repo。

### 7.3 模型贫血(Anemic Model)

\`\`\`python
from dataclasses import dataclass
# 反模式:模型只有字段,没有行为
@dataclass
class Order:
    id: int
    total: float
    status: str
    # 所有逻辑都在 service 里
\`\`\`

业务规则全堆在 service,模型变成纯数据容器。这导致 service 越来越胖,模型越来越瘦,违背了 OOP 的「数据+行为在一起」原则。**领域驱动设计(DDD)** 提倡「充血模型」:把行为放回模型。

\`\`\`python
from dataclasses import dataclass
# 正确:充血模型
@dataclass
class Order:
    id: int
    total: float
    status: str

    def submit(self):
        if self.status != "draft":
            raise ValueError("非草稿订单不能提交")
        if self.total > 10000:
            raise ValueError("超过 1 万元需审核")
        self.status = "submitted"

# service 只做协调
class OrderService:
    def submit(self, order_id):
        order = self.repo.find(order_id)
        order.submit()           # 业务规则在模型
        self.repo.save(order)
\`\`\`

### 7.4 DTO 爆炸

为了「层间解耦」,每层都定义自己的数据结构:Entity、Domain Model、DTO、ViewModel、ResponseDTO...同一个用户在不同层有 5 种表示,转换代码比业务还多。这是过度设计的典型。

\`\`\`python
# 反模式:DTO 爆炸
class UserEntity: ...        # ORM 实体
class UserModel: ...         # 领域模型
class UserDTO: ...           # service 间传输
class UserVO: ...            # 给 View
class UserResponse: ...      # API 响应
\`\`\`

实际上,中小型项目用同一个 \`User\` 类贯穿所有层,需要时再加转换,不必一开始就分 5 种。

---

## 八、易错点小结表格

| 序号 | 易错点 | 错误做法 | 正确做法 |
|------|--------|----------|----------|
| 1 | 业务层无业务 | service 只是 repo 的转发 | 业务规则沉到 service 或 model |
| 2 | 跨层写操作 | routes 直接调 repo.save | 写操作必经 service |
| 3 | 反向依赖 | repo 引用 service | 用 DIP/事件解耦 |
| 4 | 贫血模型 | model 只有字段,无方法 | 把领域规则放回 model |
| 5 | DTO 爆炸 | 每层 5 种数据结构 | 中小项目用一个 Model,需要再分 |
| 6 | 事务边界模糊 | repo 控制事务 | service 控制事务边界 |
| 7 | 异常穿透 | repo 抛 SQL 异常到 routes | service 转成业务异常 |
| 8 | 测试用真实 DB | 测 service 连真实 PG | mock repo 接口 |
| 9 | 过度分层 | 50 行脚本分 4 层 | 小工具直接写 |
| 10 | 层间共享模型污染 | 表现层直接返回 ORM 对象 | 用 dataclass/DTO 隔离 |

---

## 九、本章小结

分层架构是工程师的「默认架构」,**90% 的业务系统都能用它解决**。关键记住:

1. **四层职责清晰**:表现层 / 业务层 / 持久层 / 数据库,各管一摊
2. **依赖单向**:从上往下,下层不感知上层,反向依赖用 DIP/事件解耦
3. **业务层是核心**:业务规则沉在这里(或更深的领域模型),不要变成转发层
4. **抽象接口**:业务层依赖 \`IRepository\` 抽象,不依赖具体 ORM
5. **可测试性是最大收益**:每层 mock 下层即可独立测试
6. **避免反模式**:跨层写、贫血模型、DTO 爆炸、过度分层
7. **严格 vs 松散**:写操作严格,读操作可松散(CQRS 雏形)
8. **中小项目别过度分层**:CRUD 直接 Django Admin 即可,分层是为复杂业务而生

掌握了分层架构,你再看 Spring Boot 的 Controller-Service-Repository、Django 的 View-Model-Template、Rails 的 Controller-Model-View,会发现它们**本质都是分层架构的不同名字**。架构思想是相通的,只是命名约定不同。

接下来要讲的「整洁架构」和「六边形架构」,可以理解为**分层架构的进化版**——它们把「依赖方向」推到极致,让业务核心彻底独立于框架和外部世界。
`,
  },
  {
    id: "pyarch-clean-arch",
    icon: "✨",
    title: "整洁架构(Clean Architecture)",
    group: "架构模式",
    content: `# 整洁架构(Clean Architecture)

## 一、整洁架构是什么

整洁架构(Clean Architecture)由 **Robert C. Martin(Uncle Bob)** 在 2017 年的同名著作《Clean Architecture》中系统提出。它的核心定义是:

> 把系统划分成**同心圆层级**,依赖方向**只能从外向内**——外层依赖内层,内层完全不知外层存在。最内层是**业务实体(Entities)**和**用例(Use Cases)**,它们独立于 UI、数据库、框架等外部细节。

用一句话概括:**「业务核心在中央,框架数据库在外圈,依赖只能向内指」**。

### 1.1 同心圆图

\`\`\`
                       ╔══════════════════════════════╗
                       ║       Frameworks &          ║   外层:框架/驱动
                       ║       Drivers               ║   (Web 框架、DB、UI)
                       ║  ┌────────────────────────┐ ║
                       ║  │   Interface Adapters   │ ║   接口适配器
                       ║  │  (Controllers,         │ ║   (控制器、仓储实现、
                       ║  │   Presenters,          │ ║    模板)
                       ║  │   Gateways)            │ ║
                       ║  │  ┌──────────────────┐  │ ║
                       ║  │  │   Use Cases      │  │ ║   用例层
                       ║  │  │  (Application    │  │ ║   (应用业务规则、
                       ║  │  │   Business Rules)│  │ ║    流程编排)
                       ║  │  │  ┌────────────┐  │  │ ║
                       ║  │  │  │ Entities   │  │  │ ║   实体层
                       ║  │  │  │ (Enterprise│  │  │ ║   (企业业务规则、
                       ║  │  │  │  Business  │  │  │ ║    核心领域模型)
                       ║  │  │  │  Rules)    │  │  │ ║
                       ║  │  │  └────────────┘  │  │ ║
                       ║  │  └──────────────────┘  │ ║
                       ║  └────────────────────────┘ ║
                       ╚══════════════════════════════╝

         依赖方向:外层 ──────► 内层
         外层知道内层,内层不知外层
\`\`\`

注意:**箭头永远指向圆心**。数据库、Web 框架在最外层,它们可以引用用例、实体;但实体绝对不能 import Flask、SQLAlchemy。

### 1.2 整洁架构的源代码特征

判断一个项目是否符合整洁架构,看 import 方向:

\`\`\`
✅ routes.py     → import use_cases → import entities
✅ repositories  → import use_cases_interfaces
✅ use_cases     → import entities
❌ entities      → import sqlalchemy     (禁止!)
❌ use_cases     → import flask           (禁止!)
❌ entities      → import requests        (禁止!)
\`\`\`

**实体层不能 import 任何框架**——这是整洁架构的铁律。

### 1.3 为什么需要整洁架构

分层架构解决了「HTTP/业务/SQL 分离」,但有个隐患:**业务层仍然依赖 ORM**。例如:

\`\`\`python
# 分层架构中常见的"业务层依赖 ORM"
class UserService:
    def __init__(self, db_session):   # ❌ 业务层依赖 SQLAlchemy session
        self.db = db_session

    def register(self, name, email):
        existing = self.db.query(User).filter_by(email=email).first()  # ❌ 直接用 ORM
        if existing:
            raise DuplicateEmail()
        self.db.add(User(name=name, email=email))
        self.db.commit()
\`\`\`

这个 \`UserService\` 看似分层了,但实际**和 SQLAlchemy 强绑定**:

- 换 Django ORM?改一堆
- 换 MongoDB?改一堆
- 单元测试?必须 mock SQLAlchemy session,非常痛苦

整洁架构的解法:**业务层只定义抽象接口(端口),由外层实现**。这样业务核心就彻底独立于任何具体技术。

---

## 二、四层职责详解

### 2.1 Entities(实体层)

> 实体是**企业级业务规则**的载体,对应领域中的核心对象,生命周期最长,独立于任何应用、UI、数据库。

实体的特征:

- 包含核心业务规则(订单是否可提交、用户是否合法)
- 纯 Python 类,**不依赖任何框架**
- 即使应用换成 Web/桌面/API,实体不变
- 即使数据库换 MySQL/MongoDB/文件,实体不变

\`\`\`python
# entities/order.py
from dataclasses import dataclass, field
from typing import List
from datetime import datetime

@dataclass
class OrderItem:
    name: str
    price: float
    qty: int

    @property
    def subtotal(self) -> float:
        return self.price * self.qty

@dataclass
class Order:
    id: str
    customer_id: str
    items: List[OrderItem] = field(default_factory=list)
    status: str = "draft"
    created_at: datetime = field(default_factory=datetime.now)

    MAX_AMOUNT = 10000.0

    def add_item(self, item: OrderItem) -> None:
        if self.status != "draft":
            raise ValueError("只有草稿订单可加商品")
        self.items.append(item)

    def total(self) -> float:
        return sum(i.subtotal for i in self.items)

    def submit(self) -> None:
        if not self.items:
            raise ValueError("空订单不可提交")
        if self.total() > self.MAX_AMOUNT:
            raise ValueError("超过 1 万元需人工审核")
        if self.status != "draft":
            raise ValueError("订单已提交")
        self.status = "submitted"
\`\`\`

注意:\`Order\` 是纯 Python dataclass,**没有任何 import 任何外部框架**。换 Flask/Django/Tkinter,这个类一行不改。

### 2.2 Use Cases(用例层)

> 用例层封装**应用级业务规则**,描述「系统在某种场景下应该做什么」。例如「创建订单」「注册用户」「发起支付」。

用例的特征:

- 编排实体完成一个完整业务流程
- 定义业务需要的外部依赖接口(输出端口 Output Port)
- 不知具体数据库/邮件/MQ 实现
- 一个用例 = 一个业务场景 = 一个类

\`\`\`python
# use_cases/create_order.py
from dataclasses import dataclass
from typing import List
from entities import Order, OrderItem
from abc import ABC, abstractmethod

# —— 输出端口:用例需要的抽象 ——
class IOrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> Order: ...

class IPaymentGateway(ABC):
    @abstractmethod
    def charge(self, order_id: str, amount: float) -> str: ...

class INotifier(ABC):
    @abstractmethod
    def notify_order_created(self, order: Order) -> None: ...

# —— 输入端口:用例的入口 ——
@dataclass
class CreateOrderInput:
    customer_id: str
    items: List[dict]   # [{"name":..., "price":..., "qty":...}]

@dataclass
class CreateOrderOutput:
    order_id: str
    total: float
    payment_id: str

class CreateOrderUseCase:
    """用例:创建订单。"""
    def __init__(
        self,
        repo: IOrderRepository,
        payment: IPaymentGateway,
        notifier: INotifier,
    ):
        self.repo = repo
        self.payment = payment
        self.notifier = notifier

    def execute(self, input: CreateOrderInput) -> CreateOrderOutput:
        # 1. 构造实体(实体自带业务规则)
        from uuid import uuid4
        order = Order(id=str(uuid4())[:8], customer_id=input.customer_id)
        for it in input.items:
            order.add_item(OrderItem(**it))   # 实体内校验

        # 2. 提交订单(实体自带规则)
        order.submit()

        # 3. 持久化
        self.repo.save(order)

        # 4. 调支付(抽象接口)
        payment_id = self.payment.charge(order.id, order.total())

        # 5. 通知(抽象接口)
        self.notifier.notify_order_created(order)

        return CreateOrderOutput(
            order_id=order.id,
            total=order.total(),
            payment_id=payment_id,
        )
\`\`\`

用例层只依赖:

- \`entities\`(内层)
- 自己定义的抽象接口(\`IOrderRepository\` 等)

**不知**这些接口由谁实现——可能是 SQLAlchemy、可能是 MongoDB、可能是内存。

### 2.3 Interface Adapters(接口适配器层)

> 接口适配器负责**把外层的数据格式转换成内层需要的格式**,反之亦然。包含控制器(Controller)、展示器(Presenter)、仓储实现(Repository Implementation)、网关(Gateway)。

适配器的职责:

- HTTP 请求 → 用例输入对象
- 用例输出对象 → HTTP 响应 JSON
- ORM 实体 ↔ 领域实体 转换
- 实现用例层定义的抽象接口

\`\`\`python
# adapters/controllers/order_controller.py
from flask import Blueprint, request, jsonify
from use_cases.create_order import CreateOrderUseCase, CreateOrderInput

def create_orders_bp(use_case: CreateOrderUseCase):
    bp = Blueprint("orders", __name__)

    @bp.route("/orders", methods=["POST"])
    def create():
        data = request.get_json() or {}
        # —— 输入适配 ——
        input = CreateOrderInput(
            customer_id=data["customer_id"],
            items=data.get("items", []),
        )
        # —— 调用用例 ——
        try:
            output = use_case.execute(input)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # —— 输出适配 ——
        return jsonify({
            "order_id": output.order_id,
            "total": output.total,
            "payment_id": output.payment_id,
        }), 201

    return bp
\`\`\`

\`\`\`python
# adapters/repositories/sqlalchemy_order_repository.py
from sqlalchemy import text
from entities import Order, OrderItem
from use_cases.create_order import IOrderRepository

class SqlAlchemyOrderRepository(IOrderRepository):
    """实现用例层定义的 IOrderRepository 接口。"""
    def __init__(self, session):
        self.session = session

    def save(self, order: Order) -> Order:
        sql = text("""
            INSERT INTO orders(id, customer_id, status, total)
            VALUES(:id, :customer, :status, :total)
        """)
        self.session.execute(sql, {
            "id": order.id,
            "customer": order.customer_id,
            "status": order.status,
            "total": order.total(),
        })
        # 保存 items
        for item in order.items:
            self.session.execute(
                text("INSERT INTO order_items(order_id, name, price, qty) VALUES(:oid, :n, :p, :q)"),
                {"oid": order.id, "n": item.name, "p": item.price, "q": item.qty}
            )
        self.session.commit()
        return order
\`\`\`

\`\`\`python
# adapters/gateways/stripe_payment.py
from use_cases.create_order import IPaymentGateway

class StripePaymentGateway(IPaymentGateway):
    """Stripe 支付实现。"""
    def __init__(self, api_key: str):
        self.api_key = api_key

    def charge(self, order_id: str, amount: float) -> str:
        # 调 Stripe API(伪代码)
        # stripe.Charge.create(amount=int(amount*100), ...)
        return f"pi_{order_id}_{int(amount)}"
\`\`\`

\`\`\`python
# adapters/notifiers/email_notifier.py
from use_cases.create_order import INotifier
from entities import Order

class EmailNotifier(INotifier):
    def __init__(self, smtp_host: str):
        self.smtp_host = smtp_host

    def notify_order_created(self, order: Order) -> None:
        # 发邮件(伪代码)
        print(f"邮件通知:订单 {order.id} 已创建,合计 {order.total()}")
\`\`\`

### 2.4 Frameworks & Drivers(框架与驱动层)

> 最外层是**具体的工具和框架**:Web 框架、数据库、消息队列、邮件服务、第三方 SDK。这一层是「细节」,应该可以随时替换。

\`\`\`python
# main.py(组合根 Composition Root)
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from use_cases.create_order import CreateOrderUseCase
from adapters.controllers.order_controller import create_orders_bp
from adapters.repositories.sqlalchemy_order_repository import SqlAlchemyOrderRepository
from adapters.gateways.stripe_payment import StripePaymentGateway
from adapters.notifiers.email_notifier import EmailNotifier

def create_app():
    app = Flask(__name__)

    # 外层资源
    engine = create_engine("postgresql://localhost/shop")
    Session = sessionmaker(bind=engine)

    # 装配:外层适配器注入用例
    use_case = CreateOrderUseCase(
        repo=SqlAlchemyOrderRepository(Session()),
        payment=StripePaymentGateway(api_key="sk_test_xxx"),
        notifier=EmailNotifier(smtp_host="smtp.qq.com"),
    )

    # 注册路由
    app.register_blueprint(create_orders_bp(use_case))

    return app

if __name__ == "__main__":
    create_app().run(debug=True)
\`\`\`

注意 **组合根(Composition Root)**:在 \`main.py\` 这一处完成所有依赖装配,用例完全不知具体实现类。

---

## 三、依赖规则:外向内,不能反向

### 3.1 依赖倒置原则(DIP)的应用

整洁架构的核心机制是 **DIP(Dependency Inversion Principle)**:

> 高层模块不应该依赖低层模块,两者都应该依赖抽象。
> 抽象不应该依赖细节,细节应该依赖抽象。

在整洁架构里:

- **内层(高层)** 定义抽象接口(端口)
- **外层(低层)** 实现这些接口(适配器)
- **依赖注入** 在组合根完成装配

\`\`\`
┌──────────────────────────────────────────┐
│  Use Case  ──depends on──►  IRepo (抽象)  │  内层
└──────────────────────────────────────────┘
                                        ▲
                       implements       │
                                        │
┌──────────────────────────────────────────┐
│  SqlAlchemyRepository  ──────────────────┘  │  外层
└──────────────────────────────────────────┘
\`\`\`

\`\`\`python
from abc import abstractmethod
from abc import ABC
# 内层定义
class IOrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> Order: ...

# 外层实现
class SqlAlchemyOrderRepository(IOrderRepository):
    def save(self, order): ...

# 用例只引用抽象
class CreateOrderUseCase:
    def __init__(self, repo: IOrderRepository):
        self.repo = repo   # 类型是抽象,实际由外层注入
\`\`\`

### 3.2 依赖检查工具

可以用 \`import-linter\` 等工具检查依赖方向:

\`\`\`ini
# .importlinter
[importlinter]
root_package = myapp

[importlinter:contract:clean-arch]
name = Clean architecture dependency direction
type = layers
layers =
    myapp.entities
    myapp.use_cases
    myapp.adapters
    myapp.frameworks
\`\`\`

CI 跑这个检查,任何反向 import 都会失败,**保证架构不被慢慢腐化**。

---

## 四、与 SOLID 的关系

整洁架构是 SOLID 原则在**架构层面**的应用,尤其依赖倒置(DIP)是核心:

| SOLID 原则 | 在整洁架构中的体现 |
|-----------|-------------------|
| S(单一职责) | 每个用例只做一件事,每个适配器只适配一种格式 |
| O(开闭原则) | 加新数据库/框架,只需加新适配器,不改用例 |
| L(里氏替换) | 任何 \`IRepository\` 实现都应可替换 |
| I(接口隔离) | 用例只定义自己需要的方法,不强迫实现方实现一堆无关方法 |
| **D(依赖倒置)** | **核心!** 外层依赖内层抽象,内层不依赖外层细节 |

### 4.1 单一职责的例子

\`\`\`python
# 反模式:一个用例干两件事
class OrderUseCase:
    def create(self): ...
    def cancel(self): ...
    def refund(self): ...
    def query(self): ...
\`\`\`

整洁架构倾向**一个用例一个类**:

\`\`\`python
# 正确:每个用例独立
class CreateOrderUseCase: ...
class CancelOrderUseCase: ...
class RefundOrderUseCase: ...
class QueryOrderUseCase: ...
\`\`\`

好处:每个用例可独立测试,加新用例不影响老用例,符合开闭原则。

### 4.2 接口隔离的例子

\`\`\`python
from abc import abstractmethod
from abc import ABC
# 反模式:胖接口
class IRepository(ABC):
    @abstractmethod
    def save_user(self, u): ...
    @abstractmethod
    def find_user(self, id): ...
    @abstractmethod
    def save_order(self, o): ...
    @abstractmethod
    def find_order(self, id): ...
\`\`\`

用户仓储被迫实现订单方法,违背接口隔离。

\`\`\`python
from abc import ABC
# 正确:细粒度接口
class IUserRepository(ABC):
    def save_user(self, u): ...
    def find_user(self, id): ...

class IOrderRepository(ABC):
    def save_order(self, o): ...
    def find_order(self, id): ...
\`\`\`

---

## 五、Python 实战:订单创建流程

我们来完整实现一个订单创建流程,严格按整洁架构分层。

### 5.1 项目结构

\`\`\`
clean_arch/
├── entities/                  # 实体层(最内)
│   ├── __init__.py
│   ├── order.py
│   └── user.py
├── use_cases/                 # 用例层
│   ├── __init__.py
│   └── create_order.py
├── adapters/                  # 接口适配器层
│   ├── __init__.py
│   ├── controllers/
│   │   └── order_controller.py
│   ├── repositories/
│   │   ├── sqlalchemy_repo.py
│   │   └── memory_repo.py     # 内存版,用于测试
│   ├── gateways/
│   │   └── stripe_payment.py
│   └── presenters/
│       └── order_presenter.py
├── frameworks/                # 框架层(最外)
│   ├── __init__.py
│   └── flask_app.py
└── main.py                    # 组合根
\`\`\`

### 5.2 实体层

\`\`\`python
# entities/order.py
from dataclasses import dataclass, field
from typing import List
from datetime import datetime
from uuid import uuid4

@dataclass
class OrderItem:
    name: str
    price: float
    qty: int

    @property
    def subtotal(self) -> float:
        return round(self.price * self.qty, 2)

@dataclass
class Order:
    id: str
    customer_id: str
    items: List[OrderItem] = field(default_factory=list)
    status: str = "draft"
    created_at: datetime = field(default_factory=datetime.now)
    payment_id: str = ""

    MAX_AMOUNT = 10000.0

    def add_item(self, item: OrderItem) -> None:
        if self.status != "draft":
            raise ValueError("只有草稿订单可加商品")
        if item.qty <= 0:
            raise ValueError("数量必须大于 0")
        self.items.append(item)

    def total(self) -> float:
        return round(sum(i.subtotal for i in self.items), 2)

    def submit(self) -> None:
        if not self.items:
            raise ValueError("空订单不可提交")
        if self.total() > self.MAX_AMOUNT:
            raise ValueError(f"订单金额超过 {self.MAX_AMOUNT} 元,需人工审核")
        if self.status != "draft":
            raise ValueError("订单已提交,不可重复提交")
        self.status = "submitted"

    def mark_paid(self, payment_id: str) -> None:
        if self.status != "submitted":
            raise ValueError("只有已提交订单可标记为已支付")
        self.payment_id = payment_id
        self.status = "paid"

    @staticmethod
    def new(customer_id: str) -> "Order":
        return Order(id=str(uuid4())[:8], customer_id=customer_id)
\`\`\`

\`\`\`python
# entities/user.py
from dataclasses import dataclass

@dataclass
class User:
    id: str
    name: str
    email: str
    is_active: bool = True
\`\`\`

注意:**实体层没有任何外部 import**(除了 Python 标准库)。即使整个外层换掉,这两个文件一行不动。

### 5.3 用例层

\`\`\`python
# use_cases/create_order.py
from dataclasses import dataclass
from typing import List, Optional
from abc import ABC, abstractmethod
from entities import Order, OrderItem, User

# —— 输出端口(用例需要的抽象) ——
class IOrderRepository(ABC):
    @abstractmethod
    def save(self, order: Order) -> Order: ...

    @abstractmethod
    def find(self, order_id: str) -> Optional[Order]: ...

class IUserRepository(ABC):
    @abstractmethod
    def find(self, user_id: str) -> Optional[User]: ...

class IPaymentGateway(ABC):
    @abstractmethod
    def charge(self, order_id: str, amount: float) -> str: ...

class INotifier(ABC):
    @abstractmethod
    def notify(self, order: Order) -> None: ...

# —— 输入/输出 DTO ——
@dataclass
class CreateOrderInput:
    customer_id: str
    items: List[dict]

@dataclass
class CreateOrderOutput:
    order_id: str
    total: float
    payment_id: str
    status: str

# —— 用例 ——
class CreateOrderUseCase:
    """用例:创建订单。"""
    def __init__(
        self,
        order_repo: IOrderRepository,
        user_repo: IUserRepository,
        payment: IPaymentGateway,
        notifier: INotifier,
    ):
        self.order_repo = order_repo
        self.user_repo = user_repo
        self.payment = payment
        self.notifier = notifier

    def execute(self, input: CreateOrderInput) -> CreateOrderOutput:
        # 1. 校验用户存在且激活(用例层规则)
        user = self.user_repo.find(input.customer_id)
        if not user:
            raise ValueError(f"用户 {input.customer_id} 不存在")
        if not user.is_active:
            raise ValueError("用户已被禁用,不可下单")

        # 2. 构造订单(实体自带规则)
        order = Order.new(input.customer_id)
        for it in input.items:
            order.add_item(OrderItem(
                name=it["name"],
                price=it["price"],
                qty=it["qty"],
            ))

        # 3. 提交订单(实体自带规则)
        order.submit()

        # 4. 持久化
        self.order_repo.save(order)

        # 5. 调支付
        payment_id = self.payment.charge(order.id, order.total())
        order.mark_paid(payment_id)
        self.order_repo.save(order)

        # 6. 通知
        self.notifier.notify(order)

        return CreateOrderOutput(
            order_id=order.id,
            total=order.total(),
            payment_id=payment_id,
            status=order.status,
        )
\`\`\`

### 5.4 接口适配器层

**内存仓储**(用于测试):

\`\`\`python
# adapters/repositories/memory_repo.py
from typing import Dict, Optional
from entities import Order, User
from use_cases.create_order import IOrderRepository, IUserRepository

class InMemoryOrderRepository(IOrderRepository):
    def __init__(self):
        self._store: Dict[str, Order] = {}

    def save(self, order: Order) -> Order:
        self._store[order.id] = order
        return order

    def find(self, order_id: str) -> Optional[Order]:
        return self._store.get(order_id)

class InMemoryUserRepository(IUserRepository):
    def __init__(self):
        self._store: Dict[str, User] = {}

    def save(self, user: User) -> User:
        self._store[user.id] = user
        return user

    def find(self, user_id: str) -> Optional[User]:
        return self._store.get(user_id)
\`\`\`

**SQLAlchemy 仓储**(生产用):

\`\`\`python
# adapters/repositories/sqlalchemy_repo.py
from typing import Optional
from sqlalchemy import text
from entities import Order, OrderItem, User
from use_cases.create_order import IOrderRepository, IUserRepository

class SqlAlchemyOrderRepository(IOrderRepository):
    def __init__(self, session):
        self.session = session

    def save(self, order: Order) -> Order:
        self.session.execute(text("""
            INSERT INTO orders(id, customer_id, status, total, payment_id)
            VALUES(:id, :cid, :st, :tot, :pid)
            ON CONFLICT(id) DO UPDATE SET
              status=:st, total=:tot, payment_id=:pid
        """), {
            "id": order.id, "cid": order.customer_id,
            "st": order.status, "tot": order.total(),
            "pid": order.payment_id,
        })
        # 保存 items(略)
        self.session.commit()
        return order

    def find(self, order_id: str) -> Optional[Order]:
        row = self.session.execute(
            text("SELECT * FROM orders WHERE id=:id"),
            {"id": order_id},
        ).fetchone()
        if not row:
            return None
        # 简化:实际需查 items
        return Order(
            id=row.id, customer_id=row.customer_id,
            status=row.status, payment_id=row.payment_id,
        )
\`\`\`

**支付网关**:

\`\`\`python
# adapters/gateways/stripe_payment.py
import time
from use_cases.create_order import IPaymentGateway

class StripePaymentGateway(IPaymentGateway):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def charge(self, order_id: str, amount: float) -> str:
        # 模拟调用 Stripe API
        # 实际: stripe.Charge.create(amount=int(amount*100), ...)
        time.sleep(0.1)
        return f"pi_{order_id}_{int(amount)}"
\`\`\`

**通知器**:

\`\`\`python
# adapters/notifiers/email_notifier.py
from entities import Order
from use_cases.create_order import INotifier

class EmailNotifier(INotifier):
    def notify(self, order: Order) -> None:
        # 模拟发邮件
        print(f"[邮件] 订单 {order.id} 已创建,合计 ¥{order.total()}")
\`\`\`

**控制器**:

\`\`\`python
# adapters/controllers/order_controller.py
from flask import Blueprint, request, jsonify
from use_cases.create_order import CreateOrderUseCase, CreateOrderInput

def create_orders_bp(use_case: CreateOrderUseCase):
    bp = Blueprint("orders", __name__)

    @bp.route("/orders", methods=["POST"])
    def create_order():
        data = request.get_json() or {}
        try:
            input_dto = CreateOrderInput(
                customer_id=data["customer_id"],
                items=data.get("items", []),
            )
            output = use_case.execute(input_dto)
            return jsonify({
                "order_id": output.order_id,
                "total": output.total,
                "payment_id": output.payment_id,
                "status": output.status,
            }), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except KeyError as e:
            return jsonify({"error": f"缺少字段: {e}"}), 400

    return bp
\`\`\`

### 5.5 框架层 + 组合根

\`\`\`python
# main.py
from flask import Flask
from use_cases.create_order import CreateOrderUseCase
from adapters.controllers.order_controller import create_orders_bp
from adapters.repositories.memory_repo import (
    InMemoryOrderRepository, InMemoryUserRepository,
)
from adapters.gateways.stripe_payment import StripePaymentGateway
from adapters.notifiers.email_notifier import EmailNotifier
from entities import User

def create_app() -> Flask:
    app = Flask(__name__)

    # 外层资源 + 适配器
    order_repo = InMemoryOrderRepository()
    user_repo = InMemoryUserRepository()
    # 预置一个用户(实际项目从注册流程来)
    user_repo.save(User(id="u001", name="张三", email="z@x.com"))

    payment = StripePaymentGateway(api_key="sk_test_xxx")
    notifier = EmailNotifier()

    # 装配用例(组合根)
    use_case = CreateOrderUseCase(
        order_repo=order_repo,
        user_repo=user_repo,
        payment=payment,
        notifier=notifier,
    )

    # 注册路由
    app.register_blueprint(create_orders_bp(use_case))
    return app

if __name__ == "__main__":
    create_app().run(debug=True)
\`\`\`

### 5.6 测试用例

\`\`\`python
# test_create_order.py
import pytest
from entities import User, Order
from use_cases.create_order import (
    CreateOrderUseCase, CreateOrderInput,
)
from adapters.repositories.memory_repo import (
    InMemoryOrderRepository, InMemoryUserRepository,
)

class FakePayment:
    def charge(self, order_id, amount):
        return f"fake_{order_id}"

class FakeNotifier:
    def __init__(self):
        self.notified = []
    def notify(self, order):
        self.notified.append(order)

@pytest.fixture
def use_case():
    user_repo = InMemoryUserRepository()
    user_repo.save(User(id="u001", name="张三", email="z@x.com"))
    return CreateOrderUseCase(
        order_repo=InMemoryOrderRepository(),
        user_repo=user_repo,
        payment=FakePayment(),
        notifier=FakeNotifier(),
    )

def test_create_order_success(use_case):
    out = use_case.execute(CreateOrderInput(
        customer_id="u001",
        items=[{"name": "书", "price": 50, "qty": 2}],
    ))
    assert out.total == 100
    assert out.status == "paid"
    assert out.payment_id.startswith("fake_")

def test_create_order_user_not_found(use_case):
    with pytest.raises(ValueError, match="用户"):
        use_case.execute(CreateOrderInput(
            customer_id="no-such-user",
            items=[{"name": "书", "price": 50, "qty": 1}],
        ))

def test_create_order_empty_items(use_case):
    with pytest.raises(ValueError, match="空订单"):
        use_case.execute(CreateOrderInput(
            customer_id="u001", items=[],
        ))

def test_create_order_too_large(use_case):
    with pytest.raises(ValueError, match="人工审核"):
        use_case.execute(CreateOrderInput(
            customer_id="u001",
            items=[{"name": "金条", "price": 99999, "qty": 1}],
        ))
\`\`\`

注意测试:**不需要 Flask、不需要数据库、不需要真实 Stripe**。所有外层都被 Fake/Mock 替换,用例完全在内存中跑。这就是整洁架构的杀手锏。

---

## 六、整洁架构的代价

### 6.1 优点

| 优点 | 说明 |
|------|------|
| 业务核心独立 | 实体/用例不依赖任何框架,换框架无成本 |
| 极致可测试 | 用例层 mock 一切外层,测试快如闪电 |
| 长期可维护 | 业务核心稳定,外围可演化 |
| 团队分工清晰 | 内层资深工程师,外层新手 |
| 符合 SOLID | 架构层面落地 SOLID |

### 6.2 代价

| 代价 | 说明 |
|------|------|
| 学习成本高 | 团队要理解 DIP、用例、端口适配器 |
| 代码量大 | 一个简单 CRUD 也要 5-6 个文件 |
| 接口爆炸 | 每个用例一个输入 DTO + 输出 DTO + 接口 |
| 转换代码多 | Entity ↔ ORM ↔ DTO ↔ JSON |
| 对小项目过度 | 几个页面的工具用整洁架构是杀鸡用牛刀 |

### 6.3 适用判断

| 项目特征 | 是否推荐整洁架构 |
|---------|------------------|
| 大型企业系统,生命周期 5 年+ | ✅ 强烈推荐 |
| 业务规则复杂,多变 | ✅ 推荐 |
| 需要支持多种接入(HTTP/gRPC/CLI) | ✅ 推荐 |
| 团队 10 人以上 | ✅ 推荐 |
| 中小型 CRUD 应用 | ❌ 用分层架构即可 |
| 创业项目快速试错 | ❌ 过度设计,先 MVP |
| 一次性脚本 | ❌ 别用 |

---

## 七、常见误区

### 7.1 实体层依赖 ORM

\`\`\`python
# 反模式:实体层直接用 SQLAlchemy
from sqlalchemy import Column, String

class Order(Base):                    # ❌ 继承 ORM Base
    __tablename__ = "orders"
    id = Column(String, primary_key=True)
\`\`\`

这违背了「实体独立于框架」。正确做法是:**实体是纯 Python 类,ORM 实体是另一个类,仓储层做转换**。

\`\`\`python
from dataclasses import dataclass
# entities/order.py  —— 纯实体
@dataclass
class Order:
    id: str
    customer_id: str

# adapters/repositories/orm.py  —— ORM 实体
class OrderModel(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True)
    customer_id = Column(String)

# 仓储层做转换
class SqlAlchemyOrderRepository:
    def save(self, order: Order):
        model = OrderModel(id=order.id, customer_id=order.customer_id)
        self.session.add(model)
\`\`\`

### 7.2 用例层直接调框架

\`\`\`python
# 反模式:用例层调 Flask request
class CreateOrderUseCase:
    def execute(self):
        data = request.json   # ❌ 用例层引用 Flask
\`\`\`

正确做法:控制器把 HTTP 数据转换成 DTO,传给用例。

### 7.3 一个用例做太多事

\`\`\`python
# 反模式:上帝用例
class OrderUseCase:
    def create(self): ...
    def cancel(self): ...
    def refund(self): ...
    def query(self): ...
    def list(self): ...
    def export(self): ...
\`\`\`

整洁架构强调「一个用例一个职责」,每个用例独立成类。

### 7.4 端口定义过胖

\`\`\`python
from abc import ABC
# 反模式:一个端口包含所有方法
class IRepo(ABC):
    def save_order(self): ...
    def find_order(self): ...
    def save_user(self): ...
    def find_user(self): ...
    def send_email(self): ...
    def charge(self): ...
\`\`\`

接口隔离原则要求**端口细粒度**:

\`\`\`python
class IOrderRepository(ABC): ...
class IUserRepository(ABC): ...
class IEmailSender(ABC): ...
class IPaymentGateway(ABC): ...
\`\`\`

---

## 八、易错点小结表格

| 序号 | 易错点 | 错误做法 | 正确做法 |
|------|--------|----------|----------|
| 1 | 实体依赖 ORM | \`class Order(Base)\` | 实体是纯 dataclass,ORM 单独建类 |
| 2 | 用例引用框架 | 用例里 \`import flask\` | 用例只 import entities 和自己定义的接口 |
| 3 | 上帝用例 | 一个类十几个方法 | 一个用例一个类,职责单一 |
| 4 | 端口过胖 | 一个接口包含所有方法 | 接口隔离,按职责拆分 |
| 5 | 控制器写业务 | 控制器里做金额校验 | 业务沉到实体或用例 |
| 6 | 用例直接操作 ORM | 用例里 \`session.query()\` | 用例调 \`repo.save()\` |
| 7 | 测试连真实 DB | 测用例连 PostgreSQL | 用 InMemory 仓储或 Mock |
| 8 | 跨层共享 ORM 对象 | 控制器返回 ORM 模型 | 用 DTO 转换 |
| 9 | 小项目强上整洁架构 | 几个 CRUD 用全栈整洁 | 用分层架构,业务复杂再演进 |
| 10 | 依赖方向反向 | 内层 import 外层 | 用 import-linter 检查 |

---

## 九、本章小结

整洁架构是把「关注点分离」和「依赖倒置」推到极致的架构模式,关键记住:

1. **同心圆分层**:Entities → Use Cases → Interface Adapters → Frameworks
2. **依赖只能向内**:外层依赖内层,内层不知外层,通过 DIP 实现
3. **实体是核心**:纯 Python,独立于任何框架,生命周期最长
4. **用例封装业务流程**:一个用例一个类,编排实体完成场景
5. **适配器做转换**:HTTP ↔ DTO ↔ Entity ↔ ORM 之间转换
6. **组合根装配**:在 main.py 完成所有依赖注入
7. **极致可测试**:用例层 mock 全部外层,测试又快又稳
8. **代价是复杂度**:小项目别强上,中大项目才值得

整洁架构不是银弹,它是「为了应对长期变化」而生的架构。如果你的系统只活半年,简单分层就够了;如果系统要活 5 年、要支持多端接入、要换数据库,整洁架构会让你的业务核心稳如磐石。**架构是投资,投多少看回报期**。

接下来要讲的「六边形架构」思想与整洁架构一致,但切入点不同——它更强调「应用核心与外部世界隔离」的可视化模型。
`,
  },
  {
    id: "pyarch-hexagonal",
    icon: "⬡",
    title: "六边形架构(端口与适配器)",
    group: "架构模式",
    content: `# 六边形架构(端口与适配器)

## 一、六边形架构是什么

六边形架构(Hexagonal Architecture)由 **Alistair Cockburn** 于 2005 年提出,原名 **Ports and Adapters(端口与适配器)**。它的核心定义是:

> 把应用程序核心(业务逻辑)与外部世界(UI、数据库、消息队列、第三方 API)完全隔离,**核心通过端口(Port)定义与外界的交互协议,通过适配器(Adapter)实现具体的交互**。核心不知任何外部技术,外部技术随时可替换。

用一句话概括:**「应用核心是孤岛,端口是码头,适配器是船」**。

### 1.1 六边形图

为什么叫「六边形」?Cockburn 用六边形只是为了让图不像 MVC 那种「三角」结构,而是强调**应用核心被多个端口/适配器环绕,可以任意多个,不限数量**。

\`\`\`
                    ┌──────────────┐
                    │   Web UI     │ (主适配器)
                    │  (HTTP/REST) │
                    └──────┬───────┘
                           │ drives
                           ▼
        ┌──────────────┐  ╔═══════════════╗  ┌──────────────┐
        │   CLI        │◀─║               ║─▶│   Database   │
        │  (命令行)    │  ║   Application ║  │  (次适配器)  │
        │  (主适配器)  │  ║     Core      ║  └──────────────┘
        └──────────────┘  ║  (业务逻辑)  ║
                          ║               ║  ┌──────────────┐
        ┌──────────────┐  ║   uses ports  ║─▶│   Email/MQ   │
        │  gRPC        │◀─║               ║  │  (次适配器)  │
        │  (主适配器)  │  ╚═══════════════╝  └──────────────┘
        └──────────────┘                          │
                           ▲                      │
                           │ driven by            ▼
                    ┌──────────────┐       ┌──────────────┐
                    │  消息消费者  │       │  第三方 API  │
                    │  (主适配器)  │       │  (次适配器)  │
                    └──────────────┘       └──────────────┘

     左侧:主适配器(Driving Adapters) —— 主动驱动应用
     右侧:次适配器(Driven Adapters)  —— 被应用驱动
\`\`\`

### 1.2 关键概念

| 概念 | 含义 |
|------|------|
| **应用核心(Application Core)** | 业务逻辑 + 领域模型,完全独立 |
| **端口(Port)** | 核心定义的接口,规定「核心需要什么」「核心提供什么」 |
| **适配器(Adapter)** | 端口的具体实现,把外部技术(HTTP/DB/SMTP)翻译成端口调用 |
| **主适配器(Driving Adapter)** | 主动方,驱动应用执行用例(如 Web 路由、CLI、消息消费者) |
| **次适配器(Driven Adapter)** | 被动方,被应用调用以完成外部交互(如数据库、邮件、第三方 API) |

### 1.3 与分层/整洁架构的关系

六边形架构、整洁架构、洋葱架构(Onion Architecture)思想高度一致,都是**「业务核心独立,外部可替换」**:

| 架构 | 强调点 |
|------|--------|
| 六边形架构 | **端口与适配器**的可视化模型,强调对称性 |
| 整洁架构 | **同心圆 + 依赖规则**,更细致的层级划分 |
| 洋葱架构 | **依赖倒置 + 领域中心**,与整洁架构几乎一致 |

实践中**三者可以混用**——很多团队用六边形的「端口/适配器」术语 + 整洁架构的「实体/用例」分层。

---

## 二、端口(Ports)详解

端口是**应用核心对外暴露或依赖的接口**。分两类:

### 2.1 输入端口(API 端口,Driving Port)

> 输入端口定义「外部世界如何调用应用核心」。它由核心提供,主适配器调用。

类比:餐厅的「菜单」。菜单是餐厅对外暴露的接口,顾客(主适配器)按菜单点菜,厨房(应用核心)按菜单做菜。

\`\`\`python
# ports/inbound.py
from abc import ABC, abstractmethod
from typing import List
from entities import Post

class IPostService(ABC):
    """输入端口:博客应用对外提供的功能。"""
    @abstractmethod
    def create_post(self, title: str, content: str, author_id: str) -> Post: ...

    @abstractmethod
    def list_posts(self) -> List[Post]: ...

    @abstractmethod
    def get_post(self, post_id: str) -> Post: ...

    @abstractmethod
    def publish_post(self, post_id: str) -> Post: ...
\`\`\`

输入端口通常对应**用例(Use Case)**,描述「应用能做什么」。

### 2.2 输出端口(SPI 端口,Driven Port)

> 输出端口定义「应用核心需要外部世界提供什么」。它由核心定义,次适配器实现。

类比:餐厅的「食材采购接口」。厨房需要鸡蛋、面粉、肉,这些是厨房定义的接口,具体从哪个供应商买(适配器)由后端决定。

\`\`\`python
# ports/outbound.py
from abc import ABC, abstractmethod
from typing import List, Optional
from entities import Post

class IPostRepository(ABC):
    """输出端口:应用需要持久化文章。"""
    @abstractmethod
    def save(self, post: Post) -> Post: ...

    @abstractmethod
    def find_by_id(self, post_id: str) -> Optional[Post]: ...

    @abstractmethod
    def list_all(self) -> List[Post]: ...

class INotifier(ABC):
    """输出端口:应用需要发通知。"""
    @abstractmethod
    def send(self, to: str, subject: str, body: str) -> None: ...

class IEventPublisher(ABC):
    """输出端口:应用需要发布事件。"""
    @abstractmethod
    def publish(self, event_type: str, payload: dict) -> None: ...
\`\`\`

### 2.3 端口的设计原则

| 原则 | 说明 |
|------|------|
| 单一职责 | 每个端口只关心一个外部关注点 |
| 接口隔离 | 不要建一个胖端口,按需拆分 |
| 由核心定义 | 端口在核心包内,不在适配器包 |
| 抽象稳定 | 端口签名稳定,实现可换 |
| 面向业务 | 端口方法名用业务语言,不要 \`save_to_sql\` |

---

## 三、适配器(Adapters)详解

### 3.1 主适配器(Driving Adapter)

> 主适配器接收外部输入,翻译成对输入端口的调用。它驱动应用执行。

例如:HTTP 路由、CLI 命令、gRPC 服务、消息队列消费者。

\`\`\`python
# adapters/inbound/http_routes.py
from flask import Blueprint, request, jsonify
from ports.inbound import IPostService

def create_posts_bp(service: IPostService) -> Blueprint:
    bp = Blueprint("posts", __name__)

    @bp.route("/posts", methods=["POST"])
    def create_post():
        data = request.get_json() or {}
        try:
            post = service.create_post(
                title=data["title"],
                content=data["content"],
                author_id=data["author_id"],
            )
            return jsonify({"id": post.id, "title": post.title}), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    @bp.route("/posts", methods=["GET"])
    def list_posts():
        posts = service.list_posts()
        return jsonify([{"id": p.id, "title": p.title} for p in posts])

    @bp.route("/posts/<post_id>/publish", methods=["POST"])
    def publish(post_id: str):
        try:
            post = service.publish_post(post_id)
            return jsonify({"id": post.id, "status": post.status})
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

    return bp
\`\`\`

\`\`\`python
# adapters/inbound/cli.py
import click
from ports.inbound import IPostService

def make_cli(service: IPostService):
    @click.group()
    def cli():
        pass

    @cli.command()
    @click.option("--title", required=True)
    @click.option("--content", required=True)
    @click.option("--author", required=True)
    def create(title, content, author):
        post = service.create_post(title, content, author)
        click.echo(f"已创建文章 id={post.id}")

    @cli.command()
    @click.argument("post_id")
    def publish(post_id):
        post = service.publish_post(post_id)
        click.echo(f"已发布:{post.title}")

    @cli.command(name="list")
    def list_posts():
        for p in service.list_posts():
            mark = "✓" if p.status == "published" else "○"
            click.echo(f"  {mark} [{p.id}] {p.title}")

    return cli
\`\`\`

注意:**HTTP 路由和 CLI 命令调用的是同一个 \`IPostService\`**。它们是同一个应用核心的两个不同入口,核心完全不知是 HTTP 还是 CLI 在调用它。

### 3.2 次适配器(Driven Adapter)

> 次适配器实现输出端口,把应用核心的需求翻译成对外部资源的操作。它被应用驱动。

例如:SQLAlchemy 仓储、SMTP 邮件、Redis 缓存、Kafka 发布者。

\`\`\`python
# adapters/outbound/sqlalchemy_post_repository.py
from typing import List, Optional
from sqlalchemy import text
from entities import Post
from ports.outbound import IPostRepository

class SqlAlchemyPostRepository(IPostRepository):
    """SQLAlchemy 实现的仓储。换 MongoDB 只需另写一个实现。"""
    def __init__(self, session):
        self.session = session

    def save(self, post: Post) -> Post:
        sql = text("""
            INSERT INTO posts(id, title, content, author_id, status, created_at)
            VALUES(:id, :title, :content, :author, :status, :created)
            ON CONFLICT(id) DO UPDATE SET
              title=:title, content=:content, status=:status
        """)
        self.session.execute(sql, {
            "id": post.id, "title": post.title,
            "content": post.content, "author": post.author_id,
            "status": post.status, "created": post.created_at,
        })
        self.session.commit()
        return post

    def find_by_id(self, post_id: str) -> Optional[Post]:
        row = self.session.execute(
            text("SELECT * FROM posts WHERE id=:id"),
            {"id": post_id},
        ).fetchone()
        if not row:
            return None
        return Post(
            id=row.id, title=row.title, content=row.content,
            author_id=row.author_id, status=row.status,
            created_at=row.created_at,
        )

    def list_all(self) -> List[Post]:
        rows = self.session.execute(text("SELECT * FROM posts ORDER BY created_at DESC"))
        return [Post(
            id=r.id, title=r.title, content=r.content,
            author_id=r.author_id, status=r.status,
            created_at=r.created_at,
        ) for r in rows]
\`\`\`

\`\`\`python
# adapters/outbound/smtp_notifier.py
import smtplib
from email.mime.text import MIMEText
from ports.outbound import INotifier

class SmtpNotifier(INotifier):
    """SMTP 邮件实现。"""
    def __init__(self, host: str, port: int, user: str, password: str):
        self.host = host
        self.port = port
        self.user = user
        self.password = password

    def send(self, to: str, subject: str, body: str) -> None:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = self.user
        msg["To"] = to
        with smtplib.SMTP(self.host, self.port) as server:
            server.starttls()
            server.login(self.user, self.password)
            server.send_message(msg)
\`\`\`

\`\`\`python
# adapters/outbound/memory_post_repository.py
"""内存仓储,用于开发和测试。"""
from typing import Dict, List, Optional
from entities import Post
from ports.outbound import IPostRepository

class InMemoryPostRepository(IPostRepository):
    def __init__(self):
        self._store: Dict[str, Post] = {}

    def save(self, post: Post) -> Post:
        self._store[post.id] = post
        return post

    def find_by_id(self, post_id: str) -> Optional[Post]:
        return self._store.get(post_id)

    def list_all(self) -> List[Post]:
        return list(self._store.values())
\`\`\`

---

## 四、应用核心(Application Core)

应用核心包含**实体(领域模型)** + **用例(应用服务实现输入端口)**。它**只依赖自己定义的端口**,不依赖任何适配器。

### 4.1 实体

\`\`\`python
# entities/post.py
from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4

@dataclass
class Post:
    id: str
    title: str
    content: str
    author_id: str
    status: str = "draft"   # draft / published
    created_at: datetime = field(default_factory=datetime.now)

    def publish(self) -> None:
        if self.status == "published":
            raise ValueError("文章已发布,不可重复发布")
        if not self.title.strip():
            raise ValueError("标题不能为空")
        if len(self.content) < 10:
            raise ValueError("内容至少 10 字")
        self.status = "published"

    @staticmethod
    def new(title: str, content: str, author_id: str) -> "Post":
        if not title.strip():
            raise ValueError("标题不能为空")
        return Post(
            id=str(uuid4())[:8],
            title=title.strip(),
            content=content,
            author_id=author_id,
        )
\`\`\`

### 4.2 用例(实现输入端口)

\`\`\`python
# use_cases/post_service.py
from typing import List
from entities import Post
from ports.inbound import IPostService
from ports.outbound import IPostRepository, INotifier

class PostService(IPostService):
    """应用核心:实现输入端口,使用输出端口。"""
    def __init__(
        self,
        repo: IPostRepository,
        notifier: INotifier,
    ):
        self.repo = repo
        self.notifier = notifier

    def create_post(self, title: str, content: str, author_id: str) -> Post:
        post = Post.new(title=title, content=content, author_id=author_id)
        self.repo.save(post)
        return post

    def list_posts(self) -> List[Post]:
        return self.repo.list_all()

    def get_post(self, post_id: str) -> Post:
        post = self.repo.find_by_id(post_id)
        if not post:
            raise ValueError(f"文章 {post_id} 不存在")
        return post

    def publish_post(self, post_id: str) -> Post:
        post = self.get_post(post_id)
        post.publish()                    # 实体自带规则
        self.repo.save(post)
        # 通知作者(用输出端口)
        self.notifier.send(
            to=f"author_{post.author_id}@example.com",
            subject=f"文章已发布:{post.title}",
            body=f"您的文章《{post.title}》已发布。",
        )
        return post
\`\`\`

注意:\`PostService\` 只引用 \`IPostRepository\` 和 \`INotifier\` 抽象,**不知**它们是 SQL 还是 MongoDB 还是内存实现。

---

## 五、装配:组合根

\`\`\`python
# main.py
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from entities import Post
from use_cases.post_service import PostService
from adapters.inbound.http_routes import create_posts_bp
from adapters.inbound.cli import make_cli
from adapters.outbound.sqlalchemy_post_repository import SqlAlchemyPostRepository
from adapters.outbound.smtp_notifier import SmtpNotifier
from adapters.outbound.memory_post_repository import InMemoryPostRepository

def create_app(use_memory: bool = False) -> Flask:
    app = Flask(__name__)

    # 装配输出端口(次适配器)
    if use_memory:
        repo = InMemoryPostRepository()
    else:
        engine = create_engine("postgresql://localhost/blog")
        repo = SqlAlchemyPostRepository(sessionmaker(bind=engine)())
    notifier = SmtpNotifier("smtp.qq.com", 587, "bot@x.com", "pwd")

    # 装配应用核心(实现输入端口)
    service = PostService(repo=repo, notifier=notifier)

    # 装配输入端口(主适配器)
    app.register_blueprint(create_posts_bp(service))

    # 同时挂载 CLI(可选)
    app.cli = make_cli(service)

    return app

if __name__ == "__main__":
    create_app(use_memory=True).run(debug=True)
\`\`\`

注意:**切换数据库只需改一行**(\`use_memory\`),其他代码不动。这就是六边形架构的精髓——适配器可插拔。

---

## 六、可测试性:替换适配器

测试时用内存适配器,完全不依赖外部资源:

\`\`\`python
# test_post_service.py
import pytest
from entities import Post
from use_cases.post_service import PostService
from adapters.outbound.memory_post_repository import InMemoryPostRepository

class FakeNotifier:
    def __init__(self):
        self.sent = []
    def send(self, to, subject, body):
        self.sent.append((to, subject, body))

@pytest.fixture
def service():
    return PostService(
        repo=InMemoryPostRepository(),
        notifier=FakeNotifier(),
    )

def test_create_post(service):
    post = service.create_post("标题", "内容长度足够", "u1")
    assert post.status == "draft"
    assert post.id

def test_publish_post(service):
    post = service.create_post("标题", "内容长度足够", "u1")
    published = service.publish_post(post.id)
    assert published.status == "published"
    assert len(service.notifier.sent) == 1

def test_publish_not_found(service):
    with pytest.raises(ValueError, match="不存在"):
        service.publish_post("no-such-id")

def test_publish_invalid_content(service):
    post = service.create_post("标题", "短", "u1")  # 创建时不校验长度
    with pytest.raises(ValueError, match="至少 10 字"):
        service.publish_post(post.id)
\`\`\`

测试**无需 Flask、无需 PostgreSQL、无需 SMTP**——所有外部依赖都被 Fake/内存适配器替代。

---

## 七、六边形架构 vs 整洁架构

两者思想几乎一致,差异主要在**术语和侧重点**:

| 维度 | 六边形架构 | 整洁架构 |
|------|-----------|---------|
| 提出者 | Cockburn (2005) | Uncle Bob (2017) |
| 核心隐喻 | 端口(Port)+ 适配器(Adapter) | 同心圆(Concentric Circles) |
| 分层粒度 | 端口 + 适配器,层较粗 | Entities/UseCases/Adapters/Frameworks,层较细 |
| 强调点 | 应用核心与外部的**对称性** | 依赖方向**严格单向** |
| 端口位置 | 在核心边界 | Use Cases 层定义 |
| 适配器分类 | 主适配器/次适配器 | Controller/Presenter/Gateway |
| 实战选择 | 想强调「外部可替换」用六边形 | 想强调「层级清晰」用整洁 |

实际项目常常**混合使用**:用六边形的术语(端口/适配器) + 整洁架构的分层(Entities/UseCases)。两者本质都在做同一件事——**让业务核心独立,让外部细节可替换**。

---

## 八、六边形架构的优缺点

### 8.1 优点

| 优点 | 说明 |
|------|------|
| 极致可替换 | 换 DB/UI/MQ 只换适配器,核心零改动 |
| 极致可测试 | 内存适配器 + Fake,测试又快又稳 |
| 多入口支持 | 同一核心可同时挂 HTTP/CLI/gRPC/MQ |
| 清晰的依赖边界 | 端口即边界,import 检查一目了然 |
| 演化友好 | 早期用内存适配器,后期加 SQL 适配器 |

### 8.2 缺点

| 缺点 | 说明 |
|------|------|
| 概念门槛 | 团队需理解端口/适配器/依赖倒置 |
| 代码量 | 简单 CRUD 也要写端口+多适配器 |
| 接口膨胀 | 每个外部依赖一个端口+一个实现 |
| 过度抽象 | 单一数据库的项目可能不需要 |
| 学习曲线 | 新手容易写「假装六边形」的代码 |

### 8.3 何时用 / 不用

**该用**:

- 同一业务需多入口(HTTP + CLI + MQ)
- 需要严格测试,不依赖外部资源
- 业务核心长期稳定,外部技术可能变
- 团队理解 DIP,愿意为可维护性投资

**不用**:

- 简单 CRUD,框架自带的分层已足够
- 一次性脚本/原型
- 团队不熟悉 DIP,会写出假装六边形的代码
- 业务核心本身简单,大部分代码是适配器

---

## 九、常见误区

### 9.1 端口定义在适配器包

\`\`\`python
from abc import ABC
# 反模式:端口写在 adapters 包
# adapters/sqlalchemy_repo.py
class IPostRepository(ABC): ...  # ❌ 端口应在 core/ports

class SqlAlchemyPostRepository(IPostRepository): ...
\`\`\`

端口应在 **核心包内**(\`ports/\`),适配器在 \`adapters/\` 包内实现。这样核心不依赖适配器包,符合依赖方向。

### 9.2 核心直接 import 适配器

\`\`\`python
# 反模式:用例直接 import SQLAlchemy 仓储
from adapters.outbound.sqlalchemy_repo import SqlAlchemyPostRepository  # ❌

class PostService:
    def __init__(self):
        self.repo = SqlAlchemyPostRepository(...)  # 硬编码实现
\`\`\`

正确:用例只引用 \`IPostRepository\` 抽象,由组合根注入实现。

### 9.3 把端口设计成「数据库语义」

\`\`\`python
from abc import abstractmethod
from abc import ABC
# 反模式:端口方法名带 SQL 语义
class IPostRepository(ABC):
    @abstractmethod
    def insert_into_posts_table(self, post): ...   # ❌
    @abstractmethod
    def select_by_id(self, id): ...                 # ❌
\`\`\`

端口应该用**业务语义**:

\`\`\`python
from abc import abstractmethod
from abc import ABC
class IPostRepository(ABC):
    @abstractmethod
    def save(self, post): ...
    @abstractmethod
    def find_by_id(self, id): ...
\`\`\`

### 9.4 适配器包含业务逻辑

\`\`\`python
# 反模式:仓储里写业务规则
class SqlAlchemyPostRepository:
    def save(self, post):
        if post.status == "published" and not post.title:  # ❌ 业务规则
            raise ValueError("已发布文章标题不能空")
        # ... 保存
\`\`\`

业务规则应在实体或用例,适配器只做「数据格式转换 + 调外部 API」。

### 9.5 主适配器和次适配器混淆

新手常把「数据库」当成主适配器。实际上:

- **主适配器(Driving)**:外部**主动**调用应用 → HTTP/CLI/MQ 消费者
- **次适配器(Driven)**:应用**主动**调用外部 → DB/Email/第三方 API

判断方法:**看调用方向**。外部调应用 = 主;应用调外部 = 次。

---

## 十、易错点小结表格

| 序号 | 易错点 | 错误做法 | 正确做法 |
|------|--------|----------|----------|
| 1 | 端口位置错 | 端口定义在 adapters 包 | 端口在 core/ports,适配器在 adapters |
| 2 | 核心 import 适配器 | 用例里 \`from adapters import\` | 用例只引用端口抽象,组合根注入 |
| 3 | 端口语义错 | \`insert_into_table\` | 用业务语言 \`save\`/\`find_by_id\` |
| 4 | 适配器写业务 | 仓储里写校验规则 | 业务在实体/用例,适配器只翻译 |
| 5 | 主/次适配器混淆 | 把数据库当主适配器 | DB 是次适配器,HTTP/CLI 才是主 |
| 6 | 测试连真实 DB | 测用例连 PostgreSQL | 用内存适配器或 Fake |
| 7 | 端口过胖 | 一个端口包含 DB+邮件+MQ | 接口隔离,一个关注点一个端口 |
| 8 | 装配散落 | 多处 new 适配器 | 在组合根(main.py)统一装配 |
| 9 | 假装六边形 | 端口+实现一一绑定,无法替换 | 严格通过抽象注入,实现可热插拔 |
| 10 | 小项目强上 | 简单 CRUD 也用全六边形 | 用分层架构,复杂度上来再演进 |

---

## 十一、本章小结

六边形架构是「应用核心与外部世界隔离」思想的经典实现,关键记住:

1. **核心是孤岛**:业务逻辑 + 领域模型,不依赖任何外部技术
2. **端口是码头**:核心定义的接口,规定交互协议
3. **适配器是船**:端口的具体实现,把外部技术翻译成端口调用
4. **主适配器驱动应用**(HTTP/CLI/MQ 消费者),**次适配器被应用驱动**(DB/邮件/第三方 API)
5. **可插拔**:换数据库、换 UI 只换适配器,核心零修改
6. **可测试**:内存适配器 + Fake,测试不依赖任何外部资源
7. **多入口**:同一核心可同时挂 HTTP + CLI + gRPC,业务只写一份
8. **与整洁架构本质相同**:都是 DIP 在架构层的应用,差异主要在术语

六边形架构的代价是「概念门槛 + 代码量」。中小项目用分层架构即可;**当你的业务核心需要长期稳定、需要多入口接入、需要严苛的测试性时,六边形架构是值得的投资**。架构是工具,不是宗教——选合适的,而不是选最复杂的。

接下来最后一章我们会把 MVC/分层/整洁/六边形放在一起对比,帮你在实际项目中做出选型决策。
`,
  },
  {
    id: "pyarch-arch-compare",
    icon: "⚖️",
    title: "架构模式对比与选型",
    group: "架构模式",
    content: `# 架构模式对比与选型

## 一、为什么要对比架构模式

前面五章我们讲了 MVC、MVP、MVVM、分层架构、整洁架构、六边形架构。这些架构看起来五花八门,但**本质都在回答同一个问题**:如何让代码组织得既能容纳变化,又能让人看懂。

理解每一种架构的「设计动机」和「适用场景」后,你会发现它们之间不是非此即彼的关系,而是**一条演化的光谱**:从最简单的脚本,到 MVC,到分层,到整洁/六边形,复杂度逐渐提升,可维护性也逐渐提升。

本章的目标是:**给你一把「选型尺」**,让你在面对一个真实项目时,能快速判断该用哪种架构,以及为什么。

---

## 二、六大架构横向对比表

| 架构 | 关注点 | 复杂度 | 适用规模 | 可测试性 | 依赖方向 | 典型场景 |
|------|--------|--------|----------|----------|----------|----------|
| **MVC** | 数据/展示/控制分离 | ★★ | 小-中 | ★★(Model 可测) | Controller↔Model↔View | Web 应用、桌面 GUI |
| **MVP** | View 与 Model 隔离 | ★★★ | 中 | ★★★(可 mock View) | View↔Presenter↔Model | Android、WinForms |
| **MVVM** | 双向数据绑定 | ★★★ | 中-大 | ★★★★(VM 纯状态) | View↔(bind)↔VM↔Model | WPF、Vue、Angular |
| **分层** | 水平职责分层 | ★★ | 中-大 | ★★★(每层 mock 下层) | 上→下,单向 | 企业 Web 应用 |
| **整洁** | 同心圆+DIP | ★★★★ | 大 | ★★★★★(用例 mock 全外层) | 外→内,严格单向 | 长期大型系统 |
| **六边形** | 端口+适配器 | ★★★★ | 大 | ★★★★★(适配器可插拔) | 外→内,对称 | 多入口、需高可替换 |

### 2.1 关键维度详解

**复杂度**:学习曲线 + 代码量。MVC 最简单,整洁/六边形最复杂。

**可测试性**:架构对单元测试的支持程度。MVC 的 View 难测,整洁架构的用例可全部 mock 外层。

**依赖方向**:这是架构的核心特征。

\`\`\`
MVC:    Controller ↔ Model ↔ View        (双向,易耦合)
MVP:    View ← Presenter → Model         (View 不知 Model)
MVVM:   View ↔(bind）↔ VM ← Model       (VM 不知 View)
分层:   routes → services → repos        (单向)
整洁:   frameworks → adapters → use_cases → entities   (外→内)
六边形: 适配器 → 端口 → 核心              (对称,外→内)
\`\`\`

**适用规模**:小项目用复杂架构是浪费,大项目用简单架构是欠债。

---

## 三、架构演化路径

架构不是一开始就选最复杂的,而是**随业务复杂度演化**:

\`\`\`
脚本(单文件)
   │  业务变复杂
   ▼
MVC(数据/展示/控制分离)
   │  View 与 Model 耦合成痛点
   ▼
MVP/MVVM(切断 View-Model,提升测试性)
   │  业务层与 ORM 强绑定成痛点
   ▼
分层架构(routes → service → repo → db)
   │  业务核心仍依赖具体 ORM/框架
   ▼
整洁架构 / 六边形架构(业务核心独立,外部可替换)
\`\`\`

### 3.1 演化的关键信号

什么时候该升级到下一级架构?看这些信号:

| 信号 | 含义 | 升级方向 |
|------|------|----------|
| 单文件超过 500 行 | 关注点混杂 | → MVC |
| View 直接读 Model,改字段全炸 | View-Model 耦合 | → MVP/MVVM |
| 测试时必须启动 GUI/DB | 业务层依赖外部 | → 分层 |
| 换 ORM 要改业务层 | 业务依赖具体技术 | → 整洁/六边形 |
| 同一业务要支持 HTTP+CLI | 多入口需求 | → 六边形 |
| 团队 10+ 人改同一代码 | 需要清晰边界 | → 整洁/六边形 |
| 业务核心要活 5 年+ | 长期可维护 | → 整洁/六边形 |

### 3.2 反向降级

架构也可以「降级」——当业务简化或团队变化时:

- 整洁架构 → 分层:业务核心稳定下来,不再频繁换 ORM
- 分层 → MVC:CRUD 占比上升,业务规则减少
- MVC → 脚本:工具化,不再需要 Web UI

**降级不是退化,是「匹配当前复杂度」**。架构应跟随业务,而不是反过来。

---

## 四、选型决策树

\`\`\`
                  你的项目是什么?
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   一次性脚本       小型应用         中大型系统
   (工具/数据      (CRUD 为主,      (业务复杂,
    处理)           单一入口)         多入口/长期)
        │               │               │
        ▼               ▼               ▼
   直接写函数      MVC / 分层       进一步判断
   不用架构           架构               │
                                      ├──────────────┐
                                      ▼              ▼
                                  需要多入口     不需要多入口
                                  (HTTP+CLI+MQ)  (单一 Web)
                                      │              │
                                      ▼              ▼
                                  六边形架构      分层架构
                                      │         (业务规则沉到
                                      │          service/model)
                                      │
                                      ▼
                              业务核心要长期稳定?
                                      │
                                ┌─────┴─────┐
                                ▼           ▼
                              是           否
                                │           │
                                ▼           ▼
                            整洁架构     六边形即可
                            (更细粒度)
\`\`\`

### 4.1 决策维度

| 维度 | 偏向简单架构 | 偏向复杂架构 |
|------|------------|------------|
| 项目周期 | < 半年 | > 3 年 |
| 团队规模 | 1-3 人 | 10+ 人 |
| 业务复杂度 | 简单 CRUD | 复杂业务规则 |
| 入口数量 | 单一 Web | HTTP+CLI+gRPC+MQ |
| 测试需求 | 集成测试够用 | 严格单元测试 |
| 技术稳定性 | 框架不变 | 框架可能换 |
| 性能要求 | 极致性能 | 可维护优先 |

---

## 五、Python 社区的实际偏好

Python 社区对架构有自己的「文化偏好」,与 Java/C# 社区不完全相同:

### 5.1 Django 偏 MTV 约定

Django 是「约定优于配置」的典范,它默认 MTV(Model-Template-View),不鼓励复杂的分层。

\`\`\`
Django 默认结构:
myapp/
├── models.py     # Model
├── views.py      # Controller(MTV 叫 View)
├── urls.py       # 路由
└── templates/    # View(MTV 叫 Template)
\`\`\`

Django 项目通常**不分层到 service/repository**,业务逻辑直接写在 View 或 Model 的 fat model 里。这种风格适合中小项目,大项目会演变成「Fat View」或「Fat Model」反模式。

### 5.2 FastAPI 偏分层

FastAPI 没有强约定,社区倾向**显式分层**:

\`\`\`
FastAPI 典型结构:
app/
├── main.py
├── routers/      # 表现层
├── services/     # 业务层
├── models/       # SQLAlchemy 模型
├── schemas/      # Pydantic DTO
└── repositories/ # 持久层(可选)
\`\`\`

FastAPI 的依赖注入系统(\`Depends\`)天然支持分层,适合演化到整洁/六边形。

### 5.3 Flask 灵活

Flask 本身不约束结构,小项目可以单文件,大项目可以分多层。社区有「Flask 大型应用模板」(如 Flask Application Factory Pattern),本质是分层架构。

### 5.4 Python 社区总结

| 框架 | 默认架构 | 大项目演化方向 |
|------|---------|----------------|
| Django | MTV(≈MVC) | service 层 + repository 层 |
| FastAPI | 分层 | 整洁/六边形(配合 Depends) |
| Flask | 自由 | 分层 |
| Tkinter/PyQt | 自由 | MVP(可测试性) |

**Python 社区的务实倾向**:能用分层解决就不上整洁/六边形;业务核心真的需要独立时才上更复杂的架构。

---

## 六、反模式:架构选型的三个坑

### 6.1 过度架构(Over-engineering)

最常见的坑:**小项目用大架构**。

\`\`\`
# 一个简单的 TODO API,非要上整洁架构:
todo_clean_arch/
├── entities/
│   └── todo.py
├── use_cases/
│   ├── create_todo.py
│   ├── complete_todo.py
│   └── list_todos.py
├── adapters/
│   ├── controllers/
│   ├── repositories/
│   └── presenters/
├── frameworks/
└── main.py
\`\`\`

一个 CRUD 写了 20 个文件。**这是杀鸡用牛刀**。

判断标准:**如果业务规则少于 N 个(N≈5),分层架构足够;少于 3 个,直接 MVC**。

### 6.2 Cargo Cult(盲目模仿)

看到大厂用六边形架构,自己也跟着用,但不理解为什么。

\`\`\`python
# 反模式:假装六边形
class PostService:
    def __init__(self):
        # 看似用了端口,实际硬编码实现
        self.repo = SqlAlchemyPostRepository()   # ❌ 没 IOC
\`\`\`

这种「形似神不似」的架构,既增加了代码量,又没获得可替换性。**不如不用**。

### 6.3 银弹思维(Silver Bullet)

认为某种架构能解决所有问题。「全公司统一用六边形架构」就是银弹思维。

现实是:

- 营销页面:静态站点生成器即可,不需要架构
- 中台核心业务:分层/整洁
- 数据 ETL:函数式 + 流式,不需要 MVC
- ML 推理服务:可能用六边形(模型推理是核心,API 是适配器)

**不同子系统可以用不同架构**,统一是手段,不是目的。

---

## 七、综合实战:同一博客系统三种架构对比

我们用同一个「博客系统」的核心功能——**创建文章并发布**——分别用 MVC、分层、六边形实现,对比代码量与可测试性。

### 7.1 MVC 版本(Django MTV 风格)

\`\`\`python
# models.py
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    status = models.CharField(max_length=20, default="draft")

# views.py
from django.shortcuts import get_object_or_404
from .models import Post

def create_post(title, content):
    post = Post.objects.create(title=title, content=content)
    return post

def publish_post(post_id):
    post = get_object_or_404(Post, pk=post_id)
    if post.status == "published":
        raise ValueError("已发布")
    if len(post.content) < 10:
        raise ValueError("内容太短")
    post.status = "published"
    post.save()
    return post
\`\`\`

**代码量**:约 25 行
**可测试性**:必须连数据库(Django ORM)
**可替换性**:换 ORM 要改 Model 和 View

### 7.2 分层版本

\`\`\`python
# models/post.py
from dataclasses import dataclass

@dataclass
class Post:
    id: int
    title: str
    content: str
    status: str = "draft"

# repositories/post_repo.py
class PostRepository:
    def __init__(self, db):
        self.db = db
    def save(self, post): ...
    def find_by_id(self, id): ...

# services/post_service.py
class PostService:
    def __init__(self, repo: PostRepository):
        self.repo = repo
    def create(self, title, content):
        post = Post(id=0, title=title, content=content)
        return self.repo.save(post)
    def publish(self, post_id):
        post = self.repo.find_by_id(post_id)
        if post.status == "published":
            raise ValueError("已发布")
        if len(post.content) < 10:
            raise ValueError("内容太短")
        post.status = "published"
        self.repo.save(post)
        return post

# routes.py(表现层)
@app.route("/posts", methods=["POST"])
def create():
    post = post_service.create(...)
    return jsonify(...)

# app.py(装配)
repo = PostRepository(db)
post_service = PostService(repo)
\`\`\`

**代码量**:约 50 行
**可测试性**:可 mock \`PostRepository\` 测 service
**可替换性**:换 ORM 只改 repository,service 不动

### 7.3 六边形版本

\`\`\`python
from abc import abstractmethod
from abc import ABC
from dataclasses import dataclass
# entities/post.py
@dataclass
class Post:
    id: str
    title: str
    content: str
    status: str = "draft"
    def publish(self):
        if self.status == "published":
            raise ValueError("已发布")
        if len(self.content) < 10:
            raise ValueError("内容太短")
        self.status = "published"

# ports/outbound.py
class IPostRepository(ABC):
    @abstractmethod
    def save(self, post): ...
    @abstractmethod
    def find_by_id(self, id): ...
class INotifier(ABC):
    @abstractmethod
    def send(self, to, subject, body): ...

# ports/inbound.py
class IPostService(ABC):
    @abstractmethod
    def create_post(self, title, content): ...
    @abstractmethod
    def publish_post(self, post_id): ...

# use_cases/post_service.py
class PostService(IPostService):
    def __init__(self, repo: IPostRepository, notifier: INotifier):
        self.repo = repo
        self.notifier = notifier
    def create_post(self, title, content):
        post = Post(id=uuid4().hex[:8], title=title, content=content)
        self.repo.save(post)
        return post
    def publish_post(self, post_id):
        post = self.repo.find_by_id(post_id)
        post.publish()  # 实体自带规则
        self.repo.save(post)
        self.notifier.send(...)
        return post

# adapters/inbound/http_routes.py
# adapters/inbound/cli.py
# adapters/outbound/sqlalchemy_repo.py
# adapters/outbound/memory_repo.py
# adapters/outbound/smtp_notifier.py

# main.py(组合根)
\`\`\`

**代码量**:约 150 行(含多适配器)
**可测试性**:内存适配器 + Fake,完全无外部依赖
**可替换性**:换 DB/UI/MQ 全部只换适配器,核心零改动

### 7.4 三版本对比

| 维度 | MVC | 分层 | 六边形 |
|------|-----|------|--------|
| 代码量 | ~25 行 | ~50 行 | ~150 行 |
| 文件数 | 2 | 4 | 10+ |
| 业务规则位置 | View 函数 | Service 方法 | 实体方法 |
| 测试需要 DB | 是 | 否(mock repo) | 否(内存适配器) |
| 换 ORM 影响 | 改 Model+View | 改 repository | 改 adapter |
| 换 UI 影响 | 改 View+路由 | 改 routes | 改 inbound adapter |
| 多入口支持 | 难 | 中(复制 service 调用) | 易(挂多个 adapter) |
| 学习曲线 | 低 | 中 | 高 |

### 7.5 选型启示

- **博客这种 CRUD 应用**:MVC 足够,六边形是过度
- **如果要加「发布通知 + 多渠道发布」**:分层更合适
- **如果博客要同时支持 HTTP+CLI+RSS+邮件订阅**:六边形值得
- **如果业务核心(文章审核/付费墙)要长期演化**:六边形/整洁值得

**架构选择不是「越复杂越好」,而是「匹配业务复杂度」**。

---

## 八、混合架构:实战中的常见做法

实际项目常常**混合多种架构**:

### 8.1 整洁 + 六边形

用整洁架构的分层(Entities/UseCases/Adapters),用六边形的术语(端口/适配器)。这是最流行的现代后端架构。

### 8.2 MVC + 分层

外层用 MVC(Web 框架自带),Model 层内部用分层(Service/Repository)。这是 Django/FastAPI 项目的常见做法。

\`\`\`
Flask App(MVC 外壳)
├── routes/   (Controller)
├── templates/ (View)
└── models/    (Model = 内部分层)
    ├── entities/
    ├── services/
    └── repositories/
\`\`\`

### 8.3 CQRS + 六边形

写操作走六边形(严格用例),读操作走简单查询(直接 SQL)。这是高并发系统的常见做法。

\`\`\`python
# 写:严格用例
class CreatePostUseCase: ...
# 读:直接查询
@app.route("/posts")
def list_posts():
    return db.execute("SELECT * FROM posts").fetchall()
\`\`\`

### 8.4 微服务 + 每服务一种架构

微服务架构下,每个服务可以独立选架构:

- 用户服务(CRUD):分层
- 订单服务(复杂业务):整洁
- 通知服务(多渠道):六边形
- 搜索服务(读密集):CQRS

**不要强求全公司架构统一**,每个服务选最合适的。

---

## 九、架构演化的实操建议

### 9.1 从简单开始,演化到复杂

新项目**永远从最简单的架构开始**(脚本 → MVC → 分层),而不是一开始就上整洁/六边形。原因:

1. 早期业务不稳定,复杂架构的抽象可能错位
2. 复杂架构前期成本高,可能拖慢 MVP
3. 演化路径清晰,后期升级有迹可循

### 9.2 用 import 检查守住边界

无论用哪种架构,用工具守住依赖方向:

\`\`\`ini
# .importlinter
[importlinter:contract:layers]
type = layers
layers =
    myapp.routes
    myapp.services
    myapp.repositories
    myapp.entities
\`\`\`

CI 跑这个检查,任何越界 import 立即失败。**架构腐化都是从一个小 import 开始的**。

### 9.3 定期重构

每 6-12 个月做一次「架构体检」:

- 哪些层开始变胖?(可能是职责错位)
- 哪些跨层调用变多?(边界模糊)
- 哪些抽象从未被替换过?(可能过度设计)
- 哪些业务核心开始依赖外部?(依赖倒置被破坏)

发现问题及时重构,**不要等架构彻底腐化再推倒重来**。

### 9.4 文档化架构决策

用 ADR(Architecture Decision Record)记录每个架构决策:

\`\`\`markdown
# ADR-001: 选用六边形架构

## 背景
订单系统需要支持 HTTP + gRPC + 消息队列三种入口,且业务核心需要 5 年以上稳定。

## 决策
采用六边形架构,核心订单逻辑独立,通过端口适配器接入不同入口。

## 后果
- 正面:多入口支持好,核心可测试性强
- 负面:代码量增加约 30%,团队需学习成本
\`\`\`

ADR 让架构决策**可追溯、可审查**,新人能快速理解「为什么这么设计」。

---

## 十、易错点小结表格

| 序号 | 易错点 | 错误做法 | 正确做法 |
|------|--------|----------|----------|
| 1 | 过度架构 | 小项目用整洁/六边形 | 匹配业务复杂度,从简单开始 |
| 2 | Cargo Cult | 照搬大厂架构不理解 | 理解动机,按需选用 |
| 3 | 银弹思维 | 全公司统一一种架构 | 不同子系统可选不同架构 |
| 4 | 早期过度抽象 | MVP 阶段上整洁架构 | 先 MVP,演化到复杂架构 |
| 5 | 不守边界 | 跨层 import 不检查 | 用 import-linter 在 CI 检查 |
| 6 | 不重构 | 架构腐化不管 | 定期体检,及时重构 |
| 7 | 不文档化 | 架构决策无记录 | 用 ADR 记录决策与原因 |
| 8 | 混淆术语 | Django View 当 MVC View | Django View=MVC Controller |
| 9 | 强求纯架构 | 拒绝混合架构 | 实战常混合,选合适的而非纯的 |
| 10 | 忽视团队 | 团队不懂 DIP 强上整洁 | 培训在前,架构在后 |

---

## 十一、全章总结:架构是投资

回到最初的问题:**为什么需要架构?**

因为软件会变。需求变、技术变、团队变、规模变。**架构是让代码在变化中保持可维护性的投资**。

### 11.1 六大架构一句话总结

| 架构 | 一句话 |
|------|--------|
| MVC | 数据、展示、控制三权分立 |
| MVP | 切断 View-Model,提升测试性 |
| MVVM | 双向绑定,View 自动同步 VM |
| 分层 | 水平分层,单向依赖 |
| 整洁 | 同心圆,依赖向内,业务核心独立 |
| 六边形 | 端口+适配器,外部可插拔 |

### 11.2 选型三原则

1. **匹配业务复杂度**:小项目用简单架构,大项目用复杂架构
2. **匹配团队能力**:团队不熟悉的架构不如不用
3. **匹配演化路径**:从简单开始,演化到复杂

### 11.3 架构师的修养

- **懂业务**:架构为业务服务,不懂业务谈架构是空谈
- **懂权衡**:没有完美架构,只有合适架构
- **懂演化**:架构是动态的,会随业务变化
- **懂克制**:不过度设计,不银弹思维
- **懂沟通**:架构决策要让团队理解和执行

### 11.4 最后的话

记住 Uncle Bob 的一句话:

> **架构是关于「推迟决策」的艺术。好架构让你尽可能晚地做尽可能少的不可逆决策。**

不管你选 MVC、分层、整洁还是六边形,**核心目标都是:让业务核心稳定,让外部细节可变**。能做到这一点的架构,就是好架构。

掌握这些架构思想,你就不再是被框架牵着走的「框架使用者」,而是能驾驭框架的「架构设计者」。框架会过时,设计思想长存。这就是本教程讲架构模式的根本目的。
`,
  },
];
