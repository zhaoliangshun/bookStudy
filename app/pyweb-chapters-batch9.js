// =============================================================
// Python Web 应用开发实战教程 - 第 9 批章节（Jinja2 模板引擎篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   33. jinja-basics   : Jinja2 模板语法
//   34. jinja-inherit  : 模板继承与宏
//   35. jinja-advanced : Jinja2 高级特性
//   36. jinja-practice : Jinja2 实战技巧
//
// 技术栈：Python 3.11+ / Jinja2 3.x / Flask / Django
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式（shell/docker 变量）统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"Jinja2 模板引擎"
// =============================================================

export const chapters = [
  // =========================================================
  // 第三十三章：Jinja2 模板语法
  // =========================================================
  {
    id: "jinja-basics",
    group: "Jinja2 模板引擎",
    icon: "📜",
    title: "Jinja2 模板语法",
    content: `

# Jinja2 模板语法

## 一、为什么需要模板引擎

写 Web 应用时，最后一步是把数据"塞进" HTML 返回给浏览器。最朴素的办法是字符串拼接：

\`\`\`python filename="字符串拼接 HTML（反面教材）"
# 定义函数 render_user，参数: user
def render_user(user):
    # 手动拼字符串，噩梦开始
    # 定义变量 html，赋值为 "<h1>欢迎，" + user.name + "</h1>"
    html = "<h1>欢迎，" + user.name + "</h1>"
    # html += "<p>邮箱：" + user.email + "</p>"
    html += "<p>邮箱：" + user.email + "</p>"
    # 条件判断：如果 user.is_admin
    if user.is_admin:
        # html += "<span class='badge'>管理员</span>"
        html += "<span class='badge'>管理员</span>"
    # 返回 html
    return html
\`\`\`

这种写法有几个致命问题：

1. **HTML 和 Python 混在一起**：业务逻辑和展示逻辑耦合，前端同学改 HTML 要动 Python 代码。
2. **XSS 漏洞**：\`user.name\` 里如果藏着 \`<script>...</script>\`，不转义就会被浏览器执行——典型的跨站脚本攻击。
3. **可维护性差**：稍微复杂一点的页面（列表、表格、条件分支）拼字符串会变成面条代码。
4. **无法复用**：每个页面都从头拼，重复代码堆积。

**模板引擎**就是为了解决这些问题：把 HTML 和数据分离，HTML 里写"占位符"和"逻辑控制"，引擎负责把数据填进去并自动转义。Python 生态里最主流的模板引擎就是 **Jinja2**。

## 二、Jinja2 是什么

**Jinja2** 是一个用 Python 写的现代模板引擎，由 Armin Ronacher（也是 Flask 的作者）开发。它的特点：

- **语法接近 Django 模板**，但功能更强大、更灵活。
- **Flask 默认使用 Jinja2**：装了 Flask 就自带 Jinja2，无需额外安装。
- **Django 也可用**：Django 自带的模板引擎语法和 Jinja2 几乎一致，但 Django 项目可以配置成用 Jinja2。
- **独立可用**：Jinja2 不依赖任何 Web 框架，可以单独拿来生成 HTML、配置文件、邮件正文、甚至代码。

> **Flask 和 Django 模板的关系**：Flask 直接用 Jinja2；Django 有自己的模板引擎（语法相似但独立）。两者 90% 语法通用，本章以 Jinja2 为准，差异点会标注。

\`\`\`txt filename="Jinja2 在 Web 请求中的位置"
浏览器请求 → Flask 视图函数
                  ↓ 拿到数据（user, posts...）
                  ↓ 调用 render_template("page.html", user=user)
                  ↓ Jinja2 引擎：读 page.html → 填变量 → 自动转义 → 生成 HTML
                  ← 返回 HTML 响应给浏览器
\`\`\`

## 三、安装与最小示例

如果只用 Flask，无需单独装 Jinja2（Flask 依赖它）。单独使用则：

\`\`\`bash filename="安装 Jinja2"
# 单独使用时安装
# 安装 Python 包: jinja2
pip install jinja2

# Flask 已自带 Jinja2
# 安装 Python 包: flask
pip install flask
\`\`\`

\`\`\`python filename="独立使用 Jinja2（不依赖 Flask）"
# 从 jinja2 导入 Template
from jinja2 import Template

# 1. 直接从字符串创建模板
# 定义变量 template，赋值为 Template("你好，{{ name }}！你有 {{ count }} 条新消息。"...
template = Template("你好，{{ name }}！你有 {{ count }} 条新消息。")

# 2. 渲染：把变量传进去
# 定义变量 result，赋值为 template.render(name="小明", count=5)
result = template.render(name="小明", count=5)
print(result)   # 输出：你好，小明！你有 5 条新消息。
\`\`\`

\`\`\`python filename="在 Flask 里用 Jinja2"
# 从 flask 导入 Flask, render_template
from flask import Flask, render_template

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/user/<name>")
# 定义函数 user_page，参数: name
def user_page(name):
    # Flask 的 render_template 自动在 templates/ 目录找模板文件
    # 并把后面的关键字参数作为变量传给模板
    # 返回 render_template("user.html", name=name, count=5)
    return render_template("user.html", name=name, count=5)
\`\`\`

对应的模板文件放在 \`templates/user.html\`：

\`\`\`html filename="templates/user.html"
# <!DOCTYPE html>
<!DOCTYPE html>
# <html>
<html>
# <body>
<body>
  # <!-- {{ }} 里写变量名，渲染时被替换 -->
  <!-- {{ }} 里写变量名，渲染时被替换 -->
  # <p>你好，{{ name }}！你有 {{ count }} 条新消息。</p>
  <p>你好，{{ name }}！你有 {{ count }} 条新消息。</p>
# </body>
</body>
# </html>
</html>
\`\`\`

## 四、变量与属性访问

\`{{ 变量名 }}\` 是 Jinja2 输出变量的语法。变量可以是任意 Python 对象，Jinja2 会智能地访问它的属性、字典键、列表下标。

\`\`\`jinja filename="变量访问的各种姿势"
# {# 1. 简单变量 #}
{# 1. 简单变量 #}
# <p>名字：{{ name }}</p>
<p>名字：{{ name }}</p>

# {# 2. 字典：用点号访问 key，等价于 dict["key"] #}
{# 2. 字典：用点号访问 key，等价于 dict["key"] #}
# <p>城市：{{ user.city }}</p>
<p>城市：{{ user.city }}</p>
# {# 等价于 {{ user["city"] }} #}
{# 等价于 {{ user["city"] }} #}

# {# 3. 对象属性：用点号访问属性，等价于 obj.attr #}
{# 3. 对象属性：用点号访问属性，等价于 obj.attr #}
# <p>邮箱：{{ user.email }}</p>
<p>邮箱：{{ user.email }}</p>

# {# 4. 列表/元组：用点号加下标，或中括号 #}
{# 4. 列表/元组：用点号加下标，或中括号 #}
# <p>第一篇文章：{{ posts.0.title }}</p>
<p>第一篇文章：{{ posts.0.title }}</p>
# <p>第一篇文章：{{ posts[0].title }}</p>
<p>第一篇文章：{{ posts[0].title }}</p>

# {# 5. 调用无参方法：方法名后加括号 #}
{# 5. 调用无参方法：方法名后加括号 #}
# <p>大写名字：{{ user.name.upper() }}</p>
<p>大写名字：{{ user.name.upper() }}</p>
\`\`\`

> **Jinja2 的属性查找顺序**：当写 \`user.name\` 时，Jinja2 会按这个顺序尝试：① 字典的 \`["name"]\` 键 ② 对象的 \`name\` 属性 ③ \`getname()\` 方法（带括号才是调用）。找不到就返回 \`Undefined\`（默认不报错，渲染成空字符串）。

\`\`\`python filename="变量访问的查找演示"
# 从 jinja2 导入 Template
from jinja2 import Template

# 定义类 User
class User:
    # 定义函数 __init__，参数: self, name, email
    def __init__(self, name, email):
        # self.name = name
        self.name = name
        # self.email = email
        self.email = email

# 对象属性
# 定义变量 user，赋值为 User("小明", "xm@example.com")
user = User("小明", "xm@example.com")
print(Template("{{ user.name }}").render(user=user))  # 小明

# 字典 key
# 定义字典 data
data = {"name": "小红", "age": 18}
print(Template("{{ data.name }}").render(data=data))  # 小红

# 列表下标
# 定义列表 nums
nums = [10, 20, 30]
print(Template("{{ nums.1 }}").render(nums=nums))  # 20
\`\`\`

## 五、注释

Jinja2 的注释语法是 \`{# ... #}\`，渲染时会被完全去掉，不出现在最终 HTML 里。

\`\`\`jinja filename="注释语法"
# {# 这是单行注释，不会输出到 HTML #}
{# 这是单行注释，不会输出到 HTML #}

# {#
{#
  # 这是多行注释
  这是多行注释
  # 可以写说明、TODO
  可以写说明、TODO
#}

# <p>正文内容{{ name }}</p> {# 行内注释 #}
<p>正文内容{{ name }}</p> {# 行内注释 #}
\`\`\`

> **HTML 注释 vs Jinja2 注释**：\`<!-- 注释 -->\` 是 HTML 注释，会出现在最终页面源码里（用户能看到）；\`{# 注释 #}\` 是 Jinja2 注释，渲染后消失。开发调试用 HTML 注释方便排查，正式上线用 Jinja2 注释更干净。

## 六、过滤器

**过滤器**（Filter）是对变量做"后处理"的函数，用管道符 \`|\` 串联：\`{{ 变量 | 过滤器 }}\`。可以链式调用：\`{{ 变量 | 过滤器1 | 过滤器2 }}\`。

\`\`\`jinja filename="过滤器示例"
# {# upper：转大写 #}
{# upper：转大写 #}
# <p>名字：{{ name | upper }}</p>  {# alice → ALICE #}
<p>名字：{{ name | upper }}</p>  {# alice → ALICE #}

# {# lower：转小写 #}
{# lower：转小写 #}
# <p>{{ word | lower }}</p>  {# HELLO → hello #}
<p>{{ word | lower }}</p>  {# HELLO → hello #}

# {# default：变量未定义或为空时的默认值 #}
{# default：变量未定义或为空时的默认值 #}
# <p>签名：{{ user.signature | default("这个人很懒，什么都没写") }
<p>签名：{{ user.signature | default("这个人很懒，什么都没写") }}</p>

# {# length：取长度（字符串、列表、字典） #}
{# length：取长度（字符串、列表、字典） #}
# <p>文章数：{{ posts | length }}</p>
<p>文章数：{{ posts | length }}</p>

# {# join：把列表元素用分隔符拼成字符串 #}
{# join：把列表元素用分隔符拼成字符串 #}
# <p>标签：{{ tags | join(", ") }}</p>  {# ["py","web"]
<p>标签：{{ tags | join(", ") }}</p>  {# ["py","web"] → "py, web" #}

# {# round：四舍五入 #}
{# round：四舍五入 #}
# <p>平均分：{{ avg_score | round(2) }}</p>  {# 保留 2 位小数
<p>平均分：{{ avg_score | round(2) }}</p>  {# 保留 2 位小数 #}

# {# trim：去首尾空格 #}
{# trim：去首尾空格 #}
# <p>{{ input | trim }}</p>
<p>{{ input | trim }}</p>

# {# capitalize：首字母大写其余小写 #}
{# capitalize：首字母大写其余小写 #}
# <p>{{ title | capitalize }}</p>
<p>{{ title | capitalize }}</p>

# {# 链式：先 trim 再 upper #}
{# 链式：先 trim 再 upper #}
# <p>{{ name | trim | upper }}</p>
<p>{{ name | trim | upper }}</p>
\`\`\`

### 常用内置过滤器速查表

| 过滤器 | 作用 | 示例 | 结果 |
|--------|------|------|------|
| \`upper\` | 转大写 | \`"abc" \| upper\` | \`ABC\` |
| \`lower\` | 转小写 | \`"ABC" \| lower\` | \`abc\` |
| \`capitalize\` | 首字母大写 | \`"hELLO" \| capitalize\` | \`Hello\` |
| \`title\` | 每个单词首字母大写 | \`"hello world" \| title\` | \`Hello World\` |
| \`trim\` | 去首尾空白 | \`"  hi  " \| trim\` | \`hi\` |
| \`length\` | 取长度 | \`[1,2,3] \| length\` | \`3\` |
| \`default\` | 默认值 | \`none \| default("N/A")\` | \`N/A\` |
| \`join\` | 列表拼接 | \`[1,2] \| join("-")\` | \`1-2\` |
| \`round\` | 四舍五入 | \`3.1415 \| round(2)\` | \`3.14\` |
| \`int\` | 转整数 | \`"5" \| int\` | \`5\` |
| \`float\` | 转浮点 | \`"3.14" \| float\` | \`3.14\` |
| \`string\` | 转字符串 | \`42 \| string\` | \`"42"\` |
| \`replace\` | 替换 | \`"abc" \| replace("a","X")\` | \`Xbc\` |
| \`truncate\` | 截断加省略号 | \`"long text" \| truncate(5)\` | \`lon...\` |
| \`escape\` / \`e\` | HTML 转义 | \`"<b>" \| e\` | \`&lt;b&gt;\` |

## 七、控制结构

### 1. 条件判断 {% if %}

\`\`\`jinja filename="{% if %} 条件分支"
# {% if user.is_admin %}
{% if user.is_admin %}
  # <span class="badge admin">管理员</span>
  <span class="badge admin">管理员</span>
# {% elif user.is_editor %}
{% elif user.is_editor %}
  # <span class="badge editor">编辑</span>
  <span class="badge editor">编辑</span>
# {% else %}
{% else %}
  # <span class="badge user">普通用户</span>
  <span class="badge user">普通用户</span>
# {% endif %}
{% endif %}

# {# 比较运算符和 Python 一样 #}
{# 比较运算符和 Python 一样 #}
# {% if posts | length > 0 %}
{% if posts | length > 0 %}
  # <p>共 {{ posts | length }} 篇文章</p>
  <p>共 {{ posts | length }} 篇文章</p>
# {% else %}
{% else %}
  # <p>暂无文章</p>
  <p>暂无文章</p>
# {% endif %}
{% endif %}

# {# and / or / not 逻辑运算 #}
{# and / or / not 逻辑运算 #}
# {% if user and user.is_active %}
{% if user and user.is_active %}
  # <p>欢迎回来</p>
  <p>欢迎回来</p>
# {% endif %}
{% endif %}
\`\`\`

### 2. 循环 {% for %}

\`\`\`jinja filename="{% for %} 循环"
# <ul>
<ul>
# {% for post in posts %}
{% for post in posts %}
  # <li>{{ post.title }}</li>
  <li>{{ post.title }}</li>
# {% endfor %}
{% endfor %}
# </ul>
</ul>

# {# loop 对象：循环内的特殊变量，提供当前状态 #}
{# loop 对象：循环内的特殊变量，提供当前状态 #}
# {% for post in posts %}
{% for post in posts %}
  # <p>第 {{ loop.index }} 篇：{{ post.title }}</p>  {# 从
  <p>第 {{ loop.index }} 篇：{{ post.title }}</p>  {# 从 1 开始的序号 #}
  # <p>（第 {{ loop.index0 }} 个，从 0 开始）</p>     {# 从 0 开
  <p>（第 {{ loop.index0 }} 个，从 0 开始）</p>     {# 从 0 开始 #}
  # {% if loop.first %}<hr>{% endif %}               {
  {% if loop.first %}<hr>{% endif %}               {# 是否第一次 #}
  # {% if loop.last %}<p>—— 到底了 ——</p>{% endif %}   {#
  {% if loop.last %}<p>—— 到底了 ——</p>{% endif %}   {# 是否最后一次 #}
  # <p>共 {{ loop.length }} 篇</p>                   {# 
  <p>共 {{ loop.length }} 篇</p>                   {# 总数 #}
# {% endfor %}
{% endfor %}

# {# 遍历字典：用 items() #}
{# 遍历字典：用 items() #}
# {% for key, value in config.items() %}
{% for key, value in config.items() %}
  # <p>{{ key }} = {{ value }}</p>
  <p>{{ key }} = {{ value }}</p>
# {% endfor %}
{% endfor %}

# {# else 分支：循环列表为空时执行 #}
{# else 分支：循环列表为空时执行 #}
# {% for post in posts %}
{% for post in posts %}
  # <li>{{ post.title }}</li>
  <li>{{ post.title }}</li>
# {% else %}
{% else %}
  # <li>暂无文章</li>
  <li>暂无文章</li>
# {% endfor %}
{% endfor %}
\`\`\`

\`\`\`txt filename="loop 对象属性速查"
loop.index     当前迭代序号（从 1 开始）
loop.index0    当前迭代序号（从 0 开始）
loop.first     是否第一次迭代（布尔）
loop.last      是否最后一次迭代（布尔）
loop.length    序列总长度
loop.revindex  从结尾算的序号（从 1 开始）
loop.cycle     在多个值间循环（已废弃，用 cycle() 函数）
\`\`\`

### 3. 宏 {% macro %}

宏（macro）类似 Python 的函数：把一段可复用的模板片段封装起来，传入参数渲染。

\`\`\`jinja filename="{% macro %} 宏定义与调用"
# {# 定义宏：渲染一个表单输入框 #}
{# 定义宏：渲染一个表单输入框 #}
# {% macro input_field(name, value="", type="text", 
{% macro input_field(name, value="", type="text", placeholder="") %}
  # <input type="{{ type }}" name="{{ name }}" value="
  <input type="{{ type }}" name="{{ name }}" value="{{ value }}"
         # 定义变量 placeholder，赋值为 "{{ placeholder }}">
         placeholder="{{ placeholder }}">
# {% endmacro %}
{% endmacro %}

# {# 调用宏 #}
{# 调用宏 #}
# <form>
<form>
  # {{ input_field("username", placeholder="请输入用户名") }
  {{ input_field("username", placeholder="请输入用户名") }}
  # {{ input_field("password", type="password", placeh
  {{ input_field("password", type="password", placeholder="密码") }}
  # {{ input_field("email", value=user.email) }}
  {{ input_field("email", value=user.email) }}
# </form>
</form>
\`\`\`

## 八、自动转义：防 XSS 的第一道防线

默认情况下，Flask 里 Jinja2 对 \`.html\`、\`.htm\`、\`.xml\` 后缀的模板**自动开启 HTML 转义**：变量里的 \`<\`、\`>\`、\`&\` 会被替换成 \`&lt;\`、\`&gt;\`、\`&amp;\`，防止 XSS。

\`\`\`python filename="自动转义演示"
# 从 jinja2 导入 Template
from jinja2 import Template

# 自动转义开启时
t = Template('{{ html }}')  # 默认不自动转义
# 调用 print()
print(t.render(html="<script>alert(1)</script>"))
# 输出：<script>alert(1)</script>  ← 危险！浏览器会执行

# Flask 中 .html 模板默认自动转义
# {{ html }} 里的 < 会被转义成 &lt;
\`\`\`

\`\`\`jinja filename="转义与不转义"
# {# 默认：自动转义，安全 #}
{# 默认：自动转义，安全 #}
# {{ user_bio }}  {# "<b>嗨</b>" → "&lt;b&gt;嗨&lt;/b&
{{ user_bio }}  {# "<b>嗨</b>" → "&lt;b&gt;嗨&lt;/b&gt;" 显示成纯文本 #}

# {# 标记为安全，不转义（慎用！） #}
{# 标记为安全，不转义（慎用！） #}
# {{ user_bio | safe }}  {# <b>嗨</b> 原样输出，加粗显示 #}
{{ user_bio | safe }}  {# <b>嗨</b> 原样输出，加粗显示 #}

# {# 手动转义（关闭自动转义的场景下用） #}
{# 手动转义（关闭自动转义的场景下用） #}
# {{ user_bio | escape }}
{{ user_bio | escape }}
\`\`\`

> **\`| safe\` 的使用原则**：只有你**完全信任**的内容（自己生成的 HTML 片段）才能用 \`safe\`。用户输入的内容绝对不能 \`safe\`，否则就是 XSS 漏洞。常见场景：富文本编辑器的内容要先经过白名单过滤（如 bleach 库）再 \`safe\`。

## 九、综合示例：用户列表页

\`\`\`python filename="app.py - Flask 视图"
# 从 flask 导入 Flask, render_template
from flask import Flask, render_template

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/users")
# 定义函数 user_list，参数: 
def user_list():
    # 假装从数据库查出来的数据
    # 定义列表 users
    users = [
        # {"id": 1, "name": "小明", "role": "admin", "email": 
        {"id": 1, "name": "小明", "role": "admin", "email": "xm@example.com"},
        # {"id": 2, "name": "小红", "role": "user", "email": "
        {"id": 2, "name": "小红", "role": "user", "email": "xh@example.com"},
        # {"id": 3, "name": "小刚", "role": "editor", "email":
        {"id": 3, "name": "小刚", "role": "editor", "email": "xg@example.com"},
    # ]
    ]
    # 返回 render_template("users.html", users=users, current_user_role="admin")
    return render_template("users.html", users=users, current_user_role="admin")
\`\`\`

\`\`\`html filename="templates/users.html"
# <!DOCTYPE html>
<!DOCTYPE html>
# <html lang="zh">
<html lang="zh">
# <head><meta charset="UTF-8"><title>用户列表</title></h
<head><meta charset="UTF-8"><title>用户列表</title></head>
# <body>
<body>
  # <h1>用户列表（共 {{ users | length }} 人）</h1>
  <h1>用户列表（共 {{ users | length }} 人）</h1>

  # {% if users | length > 0 %}
  {% if users | length > 0 %}
  # <table border="1">
  <table border="1">
    # <tr><th>序号</th><th>姓名</th><th>角色</th><th>邮箱</th><t
    <tr><th>序号</th><th>姓名</th><th>角色</th><th>邮箱</th><th>操作</th></tr>
    # {% for u in users %}
    {% for u in users %}
    # <tr>
    <tr>
      # <td>{{ loop.index }}</td>
      <td>{{ loop.index }}</td>
      # <td>{{ u.name }}</td>
      <td>{{ u.name }}</td>
      # <td>
      <td>
        # {# 根据角色显示不同样式 #}
        {# 根据角色显示不同样式 #}
        # {% if u.role == "admin" %}
        {% if u.role == "admin" %}
          # <span style="color:red">管理员</span>
          <span style="color:red">管理员</span>
        # {% elif u.role == "editor" %}
        {% elif u.role == "editor" %}
          # <span style="color:blue">编辑</span>
          <span style="color:blue">编辑</span>
        # {% else %}
        {% else %}
          # <span>普通用户</span>
          <span>普通用户</span>
        # {% endif %}
        {% endif %}
      # </td>
      </td>
      # <td>{{ u.email | upper }}</td>
      <td>{{ u.email | upper }}</td>
      # <td>
      <td>
        # {# 只有管理员能删除 #}
        {# 只有管理员能删除 #}
        # {% if current_user_role == "admin" %}
        {% if current_user_role == "admin" %}
          # <a href="/users/{{ u.id }}/delete">删除</a>
          <a href="/users/{{ u.id }}/delete">删除</a>
        # {% else %}
        {% else %}
          # ——
          ——
        # {% endif %}
        {% endif %}
      # </td>
      </td>
    # </tr>
    </tr>
    # {% endfor %}
    {% endfor %}
  # </table>
  </table>
  # {% else %}
  {% else %}
  # <p>暂无用户</p>
  <p>暂无用户</p>
  # {% endif %}
  {% endif %}
# </body>
</body>
# </html>
</html>
\`\`\`

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 漏写 \`{% endif %}\` | 模板报错"expected token end" | if/for/macro 都要有结束标签 |
| \`{{ }}\` 和 \`{% %}\` 混用 | 变量没输出或逻辑没执行 | 输出值用 \`{{ }}\`，控制流用 \`{% %}\` |
| 用户输入没转义 | XSS 漏洞 | 默认转义别关，信任内容才 \`| safe\` |
| 在 \`{{ }}\` 里写赋值 | 报错 | 赋值用 \`{% set x = 1 %}\` |
| 用 \`==\` 比较时漏空格 | 部分老版本解析异常 | 写 \`{% if x == 1 %}\` 而非 \`{% if x==1 %}\` |
| 循环里改不了外部变量 | \`{% set %}\` 在 for 内不持久 | 用命名空间或把循环外结果算好传入 |
| \`{{ none | default("x") }}\` 不生效 | 空字符串不算 undefined | 用 \`default("x", true)\` 处理空值 |
| 模板文件放错位置 | Flask 找不到模板 | 放 \`templates/\` 目录下 |
| 用 \`user.name\` 但 user 是 None | 渲染报错或空 | 先 \`{% if user %}\` 判断再访问 |

## 十一、小结

Jinja2 用三种标记覆盖了模板的核心需求：\`{{ }}\` 输出变量、\{% %}\` 控制逻辑、\`{# #}\` 写注释。变量访问支持字典/属性/下标多种方式，过滤器用管道符串联做后处理，\`if/for/macro\` 三大控制结构解决条件和循环。默认自动转义是防 XSS 的安全网，\`| safe\` 要慎用。下一章我们学模板继承，把公共布局抽出来，让多个页面共享同一套外壳。
`
  },

  // =========================================================
  // 第三十四章：模板继承与宏
  // =========================================================
  {
    id: "jinja-inherit",
    group: "Jinja2 模板引擎",
    icon: "🏛️",
    title: "模板继承与宏",
    content: `

# 模板继承与宏

## 一、为什么需要模板复用

真实网站有几十上百个页面，但它们的外壳几乎一样：顶部导航栏、侧边栏、底部版权、引入的 CSS/JS。如果每个 HTML 文件都把这些重复一遍，后果是：

- **改一次导航栏，要改几十个文件**：维护噩梦。
- **代码重复**：违反 DRY（Don't Repeat Yourself）原则。
- **不一致风险**：有的页面忘了加某段 JS，行为不统一。

解决方案有两条路：

1. **模板继承（extends）**：定义一个"基础模板"作为外壳，子页面只填"内容块"。类似面向对象的继承。
2. **包含（include）**：把可复用的小片段（如一个表单、一个卡片）单独存成文件，需要时引入。

本章重点讲模板继承——这是 Jinja2 最强大的特性之一。

## 二、模板继承的核心三件套

\`\`\`txt filename="模板继承的三个关键字"
{% extends "base.html" %}   继承基础模板（必须是模板第一行）
{% block name %}...{% endblock %}   定义一个可被子模板覆盖的块
{{ super() }}   在子块里调用父模板同名块的默认内容
\`\`\`

类比面向对象：
- \`base.html\` = 父类（定义骨架和默认实现）
- \`{% block %}\` = 虚函数（子类可重写）
- \`{% extends %}\` = 子类继承父类
- \`{{ super() }}\` = 调用父类的同名方法

## 三、基础模板：base.html

基础模板定义整个网站的骨架：HTML 结构、导航、页脚、引入资源，中间用 \`{% block %}\` 留出"坑"给子页面填。

\`\`\`html filename="templates/base.html - 基础模板"
# <!DOCTYPE html>
<!DOCTYPE html>
# <html lang="zh">
<html lang="zh">
# <head>
<head>
  # <meta charset="UTF-8">
  <meta charset="UTF-8">
  # <meta name="viewport" content="width=device-width,
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  # {# block: 标题，子页面可覆盖 #}
  {# block: 标题，子页面可覆盖 #}
  # <title>{% block title %}我的网站{% endblock %}</title>
  <title>{% block title %}我的网站{% endblock %}</title>
  # {# 公共 CSS #}
  {# 公共 CSS #}
  # <link rel="stylesheet" href="/static/css/main.css"
  <link rel="stylesheet" href="/static/css/main.css">
  # {# block: 额外 CSS，子页面按需加 #}
  {# block: 额外 CSS，子页面按需加 #}
  # {% block extra_css %}{% endblock %}
  {% block extra_css %}{% endblock %}
# </head>
</head>
# <body>
<body>
  # {# 公共导航栏 #}
  {# 公共导航栏 #}
  # <nav class="navbar">
  <nav class="navbar">
    # <a href="/" class="logo">我的网站</a>
    <a href="/" class="logo">我的网站</a>
    # <a href="/posts">文章</a>
    <a href="/posts">文章</a>
    # <a href="/about">关于</a>
    <a href="/about">关于</a>
    # {% if current_user %}
    {% if current_user %}
      # <a href="/logout">登出（{{ current_user.name }}）</a>
      <a href="/logout">登出（{{ current_user.name }}）</a>
    # {% else %}
    {% else %}
      # <a href="/login">登录</a>
      <a href="/login">登录</a>
    # {% endif %}
    {% endif %}
  # </nav>
  </nav>

  # {# 主内容区：每个页面填不同的内容 #}
  {# 主内容区：每个页面填不同的内容 #}
  # <main class="content">
  <main class="content">
    # {% block content %}
    {% block content %}
      # {# 默认内容，子页面不覆盖就显示这个 #}
      {# 默认内容，子页面不覆盖就显示这个 #}
      # <p>欢迎来到我的网站</p>
      <p>欢迎来到我的网站</p>
    # {% endblock %}
    {% endblock %}
  # </main>
  </main>

  # {# 公共页脚 #}
  {# 公共页脚 #}
  # <footer class="footer">
  <footer class="footer">
    # <p>&copy; 2026 我的网站</p>
    <p>&copy; 2026 我的网站</p>
  # </footer>
  </footer>

  # {# 公共 JS #}
  {# 公共 JS #}
  # <script src="/static/js/main.js"></script>
  <script src="/static/js/main.js"></script>
  # {% block extra_js %}{% endblock %}
  {% block extra_js %}{% endblock %}
# </body>
</body>
# </html>
</html>
\`\`\`

## 四、子模板：继承并填充块

\`\`\`html filename="templates/posts.html - 子模板"
# {# 第一行必须 extends，继承基础模板 #}
{# 第一行必须 extends，继承基础模板 #}
# {% extends "base.html" %}
{% extends "base.html" %}

# {# 覆盖 title 块 #}
{# 覆盖 title 块 #}
# {% block title %}文章列表 - {{ super() }}{% endblock %
{% block title %}文章列表 - {{ super() }}{% endblock %}

# {# 覆盖 content 块：这才是这个页面的主体 #}
{# 覆盖 content 块：这才是这个页面的主体 #}
# {% block content %}
{% block content %}
  # <h1>文章列表</h1>
  <h1>文章列表</h1>
  # <ul>
  <ul>
    # {% for post in posts %}
    {% for post in posts %}
      # <li><a href="/posts/{{ post.id }}">{{ post.title }
      <li><a href="/posts/{{ post.id }}">{{ post.title }}</a></li>
    # {% else %}
    {% else %}
      # <li>暂无文章</li>
      <li>暂无文章</li>
    # {% endfor %}
    {% endfor %}
  # </ul>
  </ul>
# {% endblock %}
{% endblock %}

# {# 覆盖 extra_js：这个页面需要的额外脚本 #}
{# 覆盖 extra_js：这个页面需要的额外脚本 #}
# {% block extra_js %}
{% block extra_js %}
  # <script src="/static/js/posts.js"></script>
  <script src="/static/js/posts.js"></script>
# {% endblock %}
{% endblock %}
\`\`\`

\`\`\`python filename="Flask 视图渲染子模板"
# 从 flask 导入 Flask, render_template
from flask import Flask, render_template

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/posts")
# 定义函数 posts，参数: 
def posts():
    # 定义列表 posts
    posts = [{"id": 1, "title": "Jinja2 入门"}, {"id": 2, "title": "Flask 实战"}]
    # 渲染 posts.html，它会自动继承 base.html 的外壳
    # 返回 render_template("posts.html", posts=posts)
    return render_template("posts.html", posts=posts)

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 不覆盖任何块，用 base.html 的默认内容
    # 返回 render_template("base.html")
    return render_template("base.html")
\`\`\`

## 五、super()：调用父块内容

子模板覆盖一个块时，默认会**完全替换**父块的默认内容。如果想保留父块内容再追加，用 \`{{ super() }}\`：

\`\`\`jinja filename="super() 用法"
# {# base.html 里 #}
{# base.html 里 #}
# {% block title %}我的网站{% endblock %}
{% block title %}我的网站{% endblock %}

# {# posts.html 里 #}
{# posts.html 里 #}
# {% block title %}文章列表 - {{ super() }}{% endblock %
{% block title %}文章列表 - {{ super() }}{% endblock %}
# {# 渲染结果：文章列表 - 我的网站 #}
{# 渲染结果：文章列表 - 我的网站 #}

# {# base.html 里：额外 CSS 默认空 #}
{# base.html 里：额外 CSS 默认空 #}
# {% block extra_css %}{% endblock %}
{% block extra_css %}{% endblock %}

# {# 子模板：先保留（虽然空），再追加 #}
{# 子模板：先保留（虽然空），再追加 #}
# {% block extra_css %}
{% block extra_css %}
  # {{ super() }}
  {{ super() }}
  # <link rel="stylesheet" href="/static/css/posts.css
  <link rel="stylesheet" href="/static/css/posts.css">
# {% endblock %}
{% endblock %}
\`\`\`

> **什么时候用 super()**：当父块有"基础"内容（如默认标题、默认脚本），子页面想在其**基础上增加**而不是替换时。CSS/JS 的追加场景最常见。

## 六、多级继承

继承可以多层：\`base.html\` → \`base_admin.html\` → \`admin_dashboard.html\`。

\`\`\`html filename="templates/base_admin.html - 二级基础模板"
# {% extends "base.html" %}
{% extends "base.html" %}

# {# 管理后台特有的侧边栏 #}
{# 管理后台特有的侧边栏 #}
# {% block content %}
{% block content %}
  # <div class="admin-layout">
  <div class="admin-layout">
    # <aside class="sidebar">
    <aside class="sidebar">
      # <a href="/admin/users">用户管理</a>
      <a href="/admin/users">用户管理</a>
      # <a href="/admin/posts">文章管理</a>
      <a href="/admin/posts">文章管理</a>
    # </aside>
    </aside>
    # <div class="admin-main">
    <div class="admin-main">
      # {# 再挖一个坑给三级模板填 #}
      {# 再挖一个坑给三级模板填 #}
      # {% block admin_content %}{% endblock %}
      {% block admin_content %}{% endblock %}
    # </div>
    </div>
  # </div>
  </div>
# {% endblock %}
{% endblock %}

# {# 管理后台统一加权限校验脚本 #}
{# 管理后台统一加权限校验脚本 #}
# {% block extra_js %}
{% block extra_js %}
  # {{ super() }}
  {{ super() }}
  # <script src="/static/js/admin.js"></script>
  <script src="/static/js/admin.js"></script>
# {% endblock %}
{% endblock %}
\`\`\`

\`\`\`html filename="templates/admin_users.html - 三级模板"
# {% extends "base_admin.html" %}
{% extends "base_admin.html" %}

# {% block title %}用户管理 - {{ super() }}{% endblock %
{% block title %}用户管理 - {{ super() }}{% endblock %}

# {% block admin_content %}
{% block admin_content %}
  # <h2>用户列表</h2>
  <h2>用户列表</h2>
  # <table><!-- ... --></table>
  <table><!-- ... --></table>
# {% endblock %}
{% endblock %}
\`\`\`

> **继承层数建议**：不超过 3 层。太深的继承链会让"内容到底从哪来"变得难追踪，调试痛苦。简单项目 1 层（base + page）就够。

## 七、include：引入片段

继承解决"整体外壳复用"，\`include\` 解决"局部片段复用"——把一小段模板（如一个卡片、一个表单）存成文件，需要时引入。

\`\`\`html filename="templates/_post_card.html - 可复用片段（约定 _ 开头表示 partial）"
# <div class="post-card">
<div class="post-card">
  # <h3>{{ post.title }}</h3>
  <h3>{{ post.title }}</h3>
  # <p class="meta">作者：{{ post.author }} · {{ post.cre
  <p class="meta">作者：{{ post.author }} · {{ post.created_at }}</p>
  # <p>{{ post.summary }}</p>
  <p>{{ post.summary }}</p>
  # <a href="/posts/{{ post.id }}">阅读全文</a>
  <a href="/posts/{{ post.id }}">阅读全文</a>
# </div>
</div>
\`\`\`

\`\`\`html filename="templates/index.html - 用 include 引入片段"
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block content %}
{% block content %}
  # <h1>最新文章</h1>
  <h1>最新文章</h1>
  # <div class="post-list">
  <div class="post-list">
    # {% for post in posts %}
    {% for post in posts %}
      # {# 引入片段，把当前 post 传进去 #}
      {# 引入片段，把当前 post 传进去 #}
      # {% include "_post_card.html" %}
      {% include "_post_card.html" %}
    # {% endfor %}
    {% endfor %}
  # </div>
  </div>
# {% endblock %}
{% endblock %}
\`\`\`

\`\`\`jinja filename="include 的上下文"
# {# 默认：include 能访问当前模板的所有变量 #}
{# 默认：include 能访问当前模板的所有变量 #}
# {% include "_post_card.html" %}
{% include "_post_card.html" %}

# {# 只传特定变量，隔离上下文（with ... only） #}
{# 只传特定变量，隔离上下文（with ... only） #}
# {% include "_post_card.html" with context %}      
{% include "_post_card.html" with context %}      {# 显式带上当前上下文 #}
# {% include "_post_card.html" without context %}  {
{% include "_post_card.html" without context %}  {# 不带上下文，只传 with 后的变量 #}
# {% include "_post_card.html" ignore missing %}    
{% include "_post_card.html" ignore missing %}    {# 文件不存在也不报错 #}
\`\`\`

> **extends vs include 的选择**：页面级别的整体外壳用 \`extends\`；局部的小组件（卡片、评论项、分页器）用 \`include\` 或宏。

## 八、宏：模板里的函数

宏（macro）是另一种复用方式，类似"带参数的 include"。把常用的小组件（输入框、按钮、分页器）封装成宏，集中管理。

\`\`\`html filename="templates/macros.html - 宏集合文件"
# {# 表单输入框宏 #}
{# 表单输入框宏 #}
# {% macro input(name, value="", type="text", label=
{% macro input(name, value="", type="text", label="", placeholder="") %}
# <div class="form-group">
<div class="form-group">
  # {% if label %}<label for="{{ name }}">{{ label }}<
  {% if label %}<label for="{{ name }}">{{ label }}</label>{% endif %}
  # <input type="{{ type }}" id="{{ name }}" name="{{ 
  <input type="{{ type }}" id="{{ name }}" name="{{ name }}"
         # 定义变量 value，赋值为 "{{ value }}" placeholder="{{ placeholder }}"...
         value="{{ value }}" placeholder="{{ placeholder }}">
# </div>
</div>
# {% endmacro %}
{% endmacro %}

# {# 分页器宏 #}
{# 分页器宏 #}
# {% macro pagination(page, total_pages, base_url="/
{% macro pagination(page, total_pages, base_url="/posts") %}
# <nav class="pagination">
<nav class="pagination">
  # {% if page > 1 %}
  {% if page > 1 %}
    # <a href="{{ base_url }}?page={{ page - 1 }}">上一页</
    <a href="{{ base_url }}?page={{ page - 1 }}">上一页</a>
  # {% endif %}
  {% endif %}
  # <span>{{ page }} / {{ total_pages }}</span>
  <span>{{ page }} / {{ total_pages }}</span>
  # {% if page < total_pages %}
  {% if page < total_pages %}
    # <a href="{{ base_url }}?page={{ page + 1 }}">下一页</
    <a href="{{ base_url }}?page={{ page + 1 }}">下一页</a>
  # {% endif %}
  {% endif %}
# </nav>
</nav>
# {% endmacro %}
{% endmacro %}

# {# 按钮宏 #}
{# 按钮宏 #}
# {% macro button(text, type="button", href=None, cl
{% macro button(text, type="button", href=None, class="btn") %}
# {% if href %}
{% if href %}
  # <a href="{{ href }}" class="{{ class }}">{{ text }
  <a href="{{ href }}" class="{{ class }}">{{ text }}</a>
# {% else %}
{% else %}
  # <button type="{{ type }}" class="{{ class }}">{{ t
  <button type="{{ type }}" class="{{ class }}">{{ text }}</button>
# {% endif %}
{% endif %}
# {% endmacro %}
{% endmacro %}
\`\`\`

\`\`\`html filename="在页面里 import 并使用宏"
# {% extends "base.html" %}
{% extends "base.html" %}
# {# 从 macros.html 导入所有宏，命名空间为 macros #}
{# 从 macros.html 导入所有宏，命名空间为 macros #}
# {% import "macros.html" as macros %}
{% import "macros.html" as macros %}

# {% block content %}
{% block content %}
  # <h1>注册</h1>
  <h1>注册</h1>
  # <form method="post">
  <form method="post">
    # {{ macros.input("username", label="用户名", placehold
    {{ macros.input("username", label="用户名", placeholder="3-20 字符") }}
    # {{ macros.input("email", type="email", label="邮箱")
    {{ macros.input("email", type="email", label="邮箱") }}
    # {{ macros.input("password", type="password", label
    {{ macros.input("password", type="password", label="密码") }}
    # {{ macros.button("注册", type="submit", class="btn-p
    {{ macros.button("注册", type="submit", class="btn-primary") }}
  # </form>
  </form>

  # {{ macros.pagination(page, total_pages) }}
  {{ macros.pagination(page, total_pages) }}
# {% endblock %}
{% endblock %}
\`\`\`

\`\`\`jinja filename="按需导入单个宏"
# {# 只导入 input 一个宏 #}
{# 只导入 input 一个宏 #}
# {% from "macros.html" import input %}
{% from "macros.html" import input %}

# {# 导入并重命名 #}
{# 导入并重命名 #}
# {% from "macros.html" import input as text_input %
{% from "macros.html" import input as text_input %}
\`\`\`

> **宏 vs include 的选择**：宏适合"需要参数化、像函数一样调用"的组件；include 适合"固定结构、依赖上下文变量"的片段。两者也可混用。

## 九、block 的命名空间与可见性

\`\`\`jinja filename="block 的高级用法"
# {# block 可以嵌套 #}
{# block 可以嵌套 #}
# {% block content %}
{% block content %}
  # {% block sidebar %}侧边栏{% endblock %}
  {% block sidebar %}侧边栏{% endblock %}
  # {% block main %}主内容{% endblock %}
  {% block main %}主内容{% endblock %}
# {% endblock %}
{% endblock %}

# {# 子模板可以覆盖嵌套的 block #}
{# 子模板可以覆盖嵌套的 block #}
# {% block sidebar %}自定义侧边栏{% endblock %}
{% block sidebar %}自定义侧边栏{% endblock %}

# {# block 加 scoped：让块内能访问 for 循环的变量 #}
{# block 加 scoped：让块内能访问 for 循环的变量 #}
# {% for item in items %}
{% for item in items %}
  # {% block item_block scoped %}{{ item }}{% endblock
  {% block item_block scoped %}{{ item }}{% endblock %}
# {% endfor %}
{% endfor %}

# {# self：在模板里引用自己的 block #}
{# self：在模板里引用自己的 block #}
# <title>{{ self.title() }}</title>
<title>{{ self.title() }}</title>
\`\`\`

## 十、完整的博客模板组织结构

\`\`\`txt filename="推荐的项目模板结构"
templates/
├── base.html              # 全站基础外壳（导航/页脚/CSS/JS）
├── base_admin.html        # 管理后台基础外壳（继承 base）
├── macros.html            # 公共宏集合（输入框/分页器/按钮）
├── _post_card.html        # 文章卡片片段（include 用）
├── _comment.html          # 评论项片段
├── _pagination.html       # 分页器片段
├── index.html             # 首页（继承 base）
├── posts/
│   ├── list.html          # 文章列表页
│   ├── detail.html        # 文章详情页
│   ├── new.html           # 新建文章表单
│   └── edit.html          # 编辑文章表单（复用 new）
├── user/
│   ├── login.html         # 登录
│   ├── register.html      # 注册
│   └── profile.html       # 个人资料
└── admin/
    ├── dashboard.html     # 管理首页（继承 base_admin）
    └── users.html         # 用户管理
\`\`\`

\`\`\`python filename="Flask 注册模板文件夹和复用 new.html"
# 从 flask 导入 Flask, render_template, request, redirect, url_for
from flask import Flask, render_template, request, redirect, url_for

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/posts/new")
# 定义函数 post_new，参数: 
def post_new():
    # 返回 render_template("posts/new.html", post=None)
    return render_template("posts/new.html", post=None)

# 装饰器：app.route
@app.route("/posts/<int:pid>/edit")
# 定义函数 post_edit，参数: pid
def post_edit(pid):
    post = get_post(pid)  # 假装从数据库取
    # 复用 new.html，传 post 进去预填表单
    # 返回 render_template("posts/new.html", post=post)
    return render_template("posts/new.html", post=post)
\`\`\`

\`\`\`html filename="templates/posts/new.html - 新建/编辑复用"
# {% extends "base.html" %}
{% extends "base.html" %}
# {% from "macros.html" import input %}
{% from "macros.html" import input %}

# {% block title %}
{% block title %}
  # {% if post %}编辑文章{% else %}新建文章{% endif %}
  {% if post %}编辑文章{% else %}新建文章{% endif %}
# {% endblock %}
{% endblock %}

# {% block content %}
{% block content %}
  # <h1>{% if post %}编辑文章{% else %}新建文章{% endif %}</h1
  <h1>{% if post %}编辑文章{% else %}新建文章{% endif %}</h1>
  # {# action 根据 post 是否存在决定提交到哪个接口 #}
  {# action 根据 post 是否存在决定提交到哪个接口 #}
  # <form method="post"
  <form method="post"
        # 定义变量 action，赋值为 "{% if post %}/posts/{{ post.id }}/update{% e...
        action="{% if post %}/posts/{{ post.id }}/update{% else %}/posts/create{% endif %}">
    # {{ input("title", value=post.title if post else ""
    {{ input("title", value=post.title if post else "", label="标题") }}
    # <div class="form-group">
    <div class="form-group">
      # <label>正文</label>
      <label>正文</label>
      # <textarea name="body">{% if post %}{{ post.body }}
      <textarea name="body">{% if post %}{{ post.body }}{% endif %}</textarea>
    # </div>
    </div>
    # <button type="submit">{% if post %}保存修改{% else %}发
    <button type="submit">{% if post %}保存修改{% else %}发布{% endif %}</button>
  # </form>
  </form>
# {% endblock %}
{% endblock %}
\`\`\`

## 十一、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| \`extends\` 不在第一行 | 继承失效或报错 | extends 必须是模板第一个标签 |
| 子模板 block 名拼错 | 块没被覆盖，显示默认内容 | 名字和父模板严格一致 |
| 忘记 \`{% endblock %}\` | 模板报错 | 每个 block 都要闭合，可加名字 \`{% endblock content %}\` 辅助检查 |
| 子模板直接写 HTML 不放 block 里 | 内容不显示 | 子模板内容必须在 block 内，外面的文本会被忽略 |
| \`{{ super() }}\` 用错位置 | 报错或重复 | 只在覆盖父 block 时用，调用父同名块 |
| include 找不到文件 | 报错 TemplateNotFound | 路径相对 templates/，或加 \`ignore missing\` |
| 宏里访问不到上下文变量 | 渲染空 | 宏默认看不到外部变量，要传参或用 \`with context\` |
| 继承层数太多 | 调试困难 | 控制在 3 层以内 |
| partial 文件没用 \`_\` 前缀 | 和完整页面混淆 | 约定 \`_\` 开头表示片段 |
| block 名太通用（如 \`content\`） | 多级继承时被意外覆盖 | 用具名 block 如 \`admin_content\` |

## 十二、小结

模板继承用 \`{% extends %}\` + \`{% block %}\` + \`{{ super() }}\` 三件套实现"外壳复用、内容定制"，是组织多页面网站的标配。\`include\` 适合局部片段复用，\`macro\` 适合参数化组件。推荐的项目结构：base.html 做外壳，macros.html 集中放宏，\`_\` 开头的文件放片段，页面按功能分目录。新建和编辑页面复用同一个表单模板，用 \`{% if post %}\` 区分场景。下一章深入 Jinja2 的高级特性：自定义过滤器、上下文处理器、沙箱安全等。
`
  },

  // =========================================================
  // 第三十五章：Jinja2 高级特性
  // =========================================================
  {
    id: "jinja-advanced",
    group: "Jinja2 模板引擎",
    icon: "🚀",
    title: "Jinja2 高级特性",
    content: `

# Jinja2 高级特性

## 一、为什么需要高级特性

前面两章覆盖了 90% 的日常模板需求。但当项目变大、需求变复杂时，会遇到这些场景：

- 团队约定统一格式化日期、金额，每个地方手动 \`{{ d.strftime() }}\` 太啰嗦 → **自定义过滤器**。
- 模板里要判断"这个用户是不是 VIP"，逻辑重复 → **自定义测试（is vip）**。
- 全站所有页面都要拿到当前登录用户、站点配置，每个视图函数都传一遍 → **上下文处理器**。
- 让用户自定义模板（如邮件模板、报表模板），但怕他们执行危险代码 → **沙箱环境**。
- 模板分散在多个目录或打包在 Python 包里 → **模板加载器**。

本章逐一解决这些进阶问题。

## 二、自定义过滤器

内置过滤器不够用时，可以注册自己的。一个过滤器就是一个 Python 函数：接收值（和可选参数），返回处理后的字符串。

\`\`\`python filename="Flask 注册自定义过滤器"
# 从 flask 导入 Flask
from flask import Flask

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 1. 定义函数：把日期格式化成 "2026-07-01"
@app.template_filter("fmtdate")  # 注册名为 fmtdate 的过滤器
# 定义函数 format_date，参数: value, fmt="%Y-%m-%d"
def format_date(value, fmt="%Y-%m-%d"):
    # 条件判断：如果 value is None
    if value is None:
        # 返回 ""
        return ""
    # value 是 datetime 对象
    # 返回 value.strftime(fmt)
    return value.strftime(fmt)

# 等价的另一种注册方式（不用装饰器）
# app.jinja_env.filters["fmtdate"] = format_date

# 2. 定义金额过滤器：分 → 元，保留 2 位
# 装饰器：app.template_filter
@app.template_filter("money")
# 定义函数 format_money，参数: cents
def format_money(cents):
    # """把分转成元，如 1995 → '19.95'"""
    """把分转成元，如 1995 → '19.95'"""
    # 条件判断：如果 cents is None
    if cents is None:
        # 返回 "0.00"
        return "0.00"
    # 返回 f"{cents / 100:.2f}"
    return f"{cents / 100:.2f}"

# 3. 截断中文字符串（按字符数，不按字节）
# 装饰器：app.template_filter
@app.template_filter("truncate_cn")
# 定义函数 truncate_cn，参数: text, length=20
def truncate_cn(text, length=20):
    # 条件判断：如果 not text
    if not text:
        # 返回 ""
        return ""
    # 条件判断：如果 len(text) <= length
    if len(text) <= length:
        # 返回 text
        return text
    # 返回 text[:length] + "..."
    return text[:length] + "..."
\`\`\`

\`\`\`html filename="在模板里用自定义过滤器"
# <p>发布时间：{{ post.created_at | fmtdate }}</p>
<p>发布时间：{{ post.created_at | fmtdate }}</p>
# {# 2026-07-01 #}
{# 2026-07-01 #}

# <p>价格：{{ product.price_cents | money }} 元</p>
<p>价格：{{ product.price_cents | money }} 元</p>
# {# 19.95 元 #}
{# 19.95 元 #}

# <p>摘要：{{ post.body | truncate_cn(50) }}</p>
<p>摘要：{{ post.body | truncate_cn(50) }}</p>
# {# 前 50 个字 + ... #}
{# 前 50 个字 + ... #}

# {# 链式：先格式化日期再转大写 #}
{# 链式：先格式化日期再转大写 #}
# <p>{{ post.created_at | fmtdate("%Y/%m") | upper }
<p>{{ post.created_at | fmtdate("%Y/%m") | upper }}</p>
\`\`\`

> **过滤器命名**：用小写加下划线（snake_case），如 \`fmt_date\`。不要和内置重名（除非你想覆盖）。

## 三、自定义测试（Test）

测试（test）用 \`is\` 关键字调用：\`{% if x is odd %}\`。内置测试有 \`defined\`、\`none\`、\`number\`、\`string\`、\`iterable\` 等。自定义测试让你把业务判断封装进模板语法。

\`\`\`python filename="Flask 注册自定义测试"
# 从 flask 导入 Flask
from flask import Flask

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 定义：判断用户是否是管理员
# 装饰器：app.template_test
@app.template_test("admin")
# 定义函数 is_admin，参数: user
def is_admin(user):
    # 条件判断：如果 not user
    if not user:
        # 返回 False
        return False
    # 返回 user.get("role") == "admin"
    return user.get("role") == "admin"

# 定义：判断字符串是否包含敏感词
# 定义字典 SENSITIVE
SENSITIVE = {"广告", "垃圾", "骗"}
# 装饰器：app.template_test
@app.template_test("sensitive")
# 定义函数 is_sensitive，参数: text
def is_sensitive(text):
    # 条件判断：如果 not text
    if not text:
        # 返回 False
        return False
    # 返回 any(word in text for word in SENSITIVE)
    return any(word in text for word in SENSITIVE)

# 等价注册方式
# app.jinja_env.tests["admin"] = is_admin
\`\`\`

\`\`\`jinja filename="在模板里用自定义测试"
# {% if user is admin %}
{% if user is admin %}
  # <a href="/admin">进入后台</a>
  <a href="/admin">进入后台</a>
# {% endif %}
{% endif %}

# {% if comment.content is sensitive %}
{% if comment.content is sensitive %}
  # <p class="warning">该评论含敏感词，待审核</p>
  <p class="warning">该评论含敏感词，待审核</p>
# {% else %}
{% else %}
  # <p>{{ comment.content }}</p>
  <p>{{ comment.content }}</p>
# {% endif %}
{% endif %}

# {# 测试可以带参数 #}
{# 测试可以带参数 #}
# {% if user is defined %}...{% endif %}  {# 内置：是否已定
{% if user is defined %}...{% endif %}  {# 内置：是否已定义 #}
\`\`\`

> **过滤器 vs 测试**：过滤器**变换**值（输入字符串输出字符串）；测试**判断**值（输入任意输出布尔）。语义不同，别混用。

## 四、上下文处理器：注入全局变量

很多变量（当前用户、站点配置、导航菜单）几乎每个页面都要用。如果每个 \`render_template\` 都手动传一遍，视图函数会变成：

\`\`\`python filename="重复传变量（反面教材）"
# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 返回 render_template("index.html", posts=posts,
    return render_template("index.html", posts=posts,
                          # 定义变量 current_user，赋值为 get_current_user(),
                          current_user=get_current_user(),
                          # 定义变量 site_name，赋值为 "我的博客",
                          site_name="我的博客",
                          # 定义变量 nav_items，赋值为 get_nav())
                          nav_items=get_nav())

# 装饰器：app.route
@app.route("/about")
# 定义函数 about，参数: 
def about():
    # 返回 render_template("about.html",
    return render_template("about.html",
                          current_user=get_current_user(),  # 又来
                          site_name="我的博客",              # 又来
                          nav_items=get_nav())              # 又来
\`\`\`

**上下文处理器**解决这个：注册一个函数，它返回的字典会自动合并进**所有**模板的上下文。

\`\`\`python filename="Flask 上下文处理器"
# 从 flask 导入 Flask, render_template, session
from flask import Flask, render_template, session

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "dev-secret"
app.secret_key = "dev-secret"

# 注册上下文处理器：返回的字典会注入所有模板
# 装饰器：app.context_processor
@app.context_processor
# 定义函数 inject_globals，参数: 
def inject_globals():
    # 这里可以访问 session、数据库等
    # 定义变量 user_id，赋值为 session.get("user_id")
    user_id = session.get("user_id")
    # 定义变量 current_user，赋值为 get_user(user_id) if user_id else None
    current_user = get_user(user_id) if user_id else None
    # 返回 {
    return {
        "current_user": current_user,           # 所有模板都能用 {{ current_user }}
        "site_name": "我的博客",                # 所有模板都能用 {{ site_name }}
        "nav_items": get_nav_items(),           # 导航菜单
        "current_year": 2026,                   # 页脚年份
    # }
    }

# 现在视图函数只传页面特有的变量
# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 定义变量 posts，赋值为 get_posts()
    posts = get_posts()
    # 返回 render_template("index.html", posts=posts)
    return render_template("index.html", posts=posts)

# 装饰器：app.route
@app.route("/about")
# 定义函数 about，参数: 
def about():
    return render_template("about.html")  # current_user 等自动有
\`\`\`

\`\`\`html filename="base.html 直接用注入的变量"
# <nav>
<nav>
  # <a href="/">{{ site_name }}</a>
  <a href="/">{{ site_name }}</a>
  # {% for item in nav_items %}
  {% for item in nav_items %}
    # <a href="{{ item.url }}">{{ item.name }}</a>
    <a href="{{ item.url }}">{{ item.name }}</a>
  # {% endfor %}
  {% endfor %}
  # {% if current_user %}
  {% if current_user %}
    # <span>你好，{{ current_user.name }}</span>
    <span>你好，{{ current_user.name }}</span>
  # {% else %}
  {% else %}
    # <a href="/login">登录</a>
    <a href="/login">登录</a>
  # {% endif %}
  {% endif %}
# </nav>
</nav>
# <footer>&copy; {{ current_year }} {{ site_name }}<
<footer>&copy; {{ current_year }} {{ site_name }}</footer>
\`\`\`

> **上下文处理器执行时机**：每次 \`render_template\` 都会执行所有注册的上下文处理器。所以里面的逻辑要**轻量**，别放数据库重查询。重的查询结果可缓存。

## 五、全局函数：在模板里调用的 Python 函数

\`\`\`python filename="注册全局函数"
# 从 flask 导入 Flask, url_for
from flask import Flask, url_for

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 注册全局函数：模板里可像内置函数一样调用
# 装饰器：app.template_global
@app.template_global()
# 定义函数 now，参数: 
def now():
    # """返回当前时间"""
    """返回当前时间"""
    # 从 datetime 导入 datetime
    from datetime import datetime
    # 返回 datetime.now()
    return datetime.now()

@app.template_global("sum_list")  # 可指定模板里的名字
# 定义函数 sum_list，参数: values
def sum_list(values):
    # 返回 sum(values)
    return sum(values)
\`\`\`

\`\`\`jinja filename="调用全局函数"
# <p>当前服务器时间：{{ now() }}</p>
<p>当前服务器时间：{{ now() }}</p>
# <p>总分：{{ sum_list([80, 90, 100]) }}</p>
<p>总分：{{ sum_list([80, 90, 100]) }}</p>

# {# Flask 已内置的全局函数：url_for（生成路由 URL）、get_flashed_me
{# Flask 已内置的全局函数：url_for（生成路由 URL）、get_flashed_messages（取闪现消息） #}
# <a href="{{ url_for('posts') }}">所有文章</a>
<a href="{{ url_for('posts') }}">所有文章</a>
\`\`\`

> **\`url_for()\` 是 Flask 模板里最重要的全局函数**：它根据视图函数名反查 URL，避免硬编码路径。改路由时模板自动跟随，不会断链。

## 六、模板加载器：模板从哪来

Jinja2 通过"加载器（Loader）"决定从哪里找模板文件。Flask 默认用 \`FileSystemLoader\` 指向 \`templates/\` 目录。独立使用时可自定义。

\`\`\`python filename="各种 Loader 对比"
# 从 jinja2 导入 Environment, FileSystemLoader, PackageLoader, DictLoader, ChoiceLoader
from jinja2 import Environment, FileSystemLoader, PackageLoader, DictLoader, ChoiceLoader

# 1. FileSystemLoader：从文件系统目录加载（最常用）
# 定义变量 env，赋值为 Environment(loader=FileSystemLoader("template...
env = Environment(loader=FileSystemLoader("templates"))
# env.get_template("index.html") → 读 templates/index.html

# 2. PackageLoader：从已安装的 Python 包里加载
# 适合把模板打进 pip 包分发
# 定义变量 env，赋值为 Environment(loader=PackageLoader("mypackage",...
env = Environment(loader=PackageLoader("mypackage", "templates"))
# 读 mypackage 包内的 templates/ 目录

# 3. DictLoader：从字典加载（适合测试或动态生成模板）
# 定义变量 env，赋值为 Environment(loader=DictLoader({
env = Environment(loader=DictLoader({
    # "index": "<h1>{{ title }}</h1>",
    "index": "<h1>{{ title }}</h1>",
    # "error": "<p>出错了</p>",
    "error": "<p>出错了</p>",
# }))
}))
# env.get_template("index") → 取字典里 key 为 "index" 的字符串

# 4. ChoiceLoader：按顺序尝试多个 loader（前一个找不到才试下一个）
# 定义变量 env，赋值为 Environment(loader=ChoiceLoader([
env = Environment(loader=ChoiceLoader([
    FileSystemLoader("templates_custom"),   # 先找自定义目录
    FileSystemLoader("templates_default"),  # 再找默认目录
    # 调用 DictLoader()
    DictLoader({"fallback": "<p>默认兜底</p>"}),
# ]))
]))
\`\`\`

\`\`\`python filename="Flask 配置多个模板目录"
# 从 flask 导入 Flask
from flask import Flask

# 定义变量 app，赋值为 Flask(__name__, template_folder=["templates",...
app = Flask(__name__, template_folder=["templates", "templates_default"])
# 或用 jinja_loader
# app.jinja_loader = ChoiceLoader([
app.jinja_loader = ChoiceLoader([
    # 调用 FileSystemLoader()
    FileSystemLoader("templates"),
    # 调用 FileSystemLoader()
    FileSystemLoader("vendor_templates"),
# ])
])
\`\`\`

## 七、自动转义：何时开何时关

自动转义（autoescape）决定变量是否做 HTML 转义。规则：

\`\`\`txt filename="Flask 自动转义默认规则"
模板文件后缀        自动转义
.html / .htm        ✅ 开启
.xml                ✅ 开启
.xhtml              ✅ 开启
其他（.txt/.css/.js） ❌ 关闭
\`\`\`

\`\`\`python filename="手动控制自动转义"
# 从 jinja2 导入 Environment, FileSystemLoader, select_autoescape
from jinja2 import Environment, FileSystemLoader, select_autoescape

# select_autoescape：根据后缀决定是否转义
# 定义变量 env，赋值为 Environment(
env = Environment(
    # 定义变量 loader，赋值为 FileSystemLoader("templates"),
    loader=FileSystemLoader("templates"),
    # 定义变量 autoescape，赋值为 select_autoescape(["html", "htm", "xml"]),
    autoescape=select_autoescape(["html", "htm", "xml"]),
# )
)

# 强制全开
# 定义变量 env，赋值为 Environment(loader=..., autoescape=True)
env = Environment(loader=..., autoescape=True)

# 强制全关（生成纯文本模板时，如配置文件、邮件正文）
# 定义变量 env，赋值为 Environment(loader=..., autoescape=False)
env = Environment(loader=..., autoescape=False)
\`\`\`

\`\`\`jinja filename="模板内临时开关转义"
# {# autoescape 块：临时关闭转义 #}
{# autoescape 块：临时关闭转义 #}
# {% autoescape false %}
{% autoescape false %}
  # {{ raw_html }}  {# 不转义 #}
  {{ raw_html }}  {# 不转义 #}
# {% endautoescape %}
{% endautoescape %}

# {# 单个变量用 | safe 标记安全 #}
{# 单个变量用 | safe 标记安全 #}
# {{ trusted_html | safe }}
{{ trusted_html | safe }}

# {# 单个变量强制转义（在关闭转义的环境里用） #}
{# 单个变量强制转义（在关闭转义的环境里用） #}
# {{ user_input | escape }}
{{ user_input | escape }}
\`\`\`

> **\`| safe\` 的安全红线**：任何来自用户的内容（昵称、评论、文章正文）都不要 \`safe\`。即使是富文本，也要先用 \`bleach.clean()\` 过滤掉 \`<script>\`、\`onerror\` 等危险标签/属性，再 \`safe\`。

## 八、沙箱环境：执行不可信模板

当你让用户自己写模板（如邮件模板、自定义页面），普通 \`Environment\` 很危险——用户能在模板里调用任意 Python 方法，比如 \`{{ config["SECRET_KEY"] }}\` 偷密钥。

\`\`\`python filename="SandboxedEnvironment 防危险操作"
# 从 jinja2.sandbox 导入 SandboxedEnvironment
from jinja2.sandbox import SandboxedEnvironment
# 从 jinja2 导入 Environment
from jinja2 import Environment

# ❌ 危险：普通环境，用户模板能访问对象的所有属性方法
# 定义变量 env，赋值为 Environment()
env = Environment()
# 用户模板里写 {{ user.__class__.__mro__ }} 能挖出敏感信息

# ✅ 安全：沙箱环境，限制可访问的属性和方法
# 定义变量 sandbox，赋值为 SandboxedEnvironment()
sandbox = SandboxedEnvironment()
# 定义变量 template，赋值为 sandbox.from_string("你好 {{ user.name }}")
template = sandbox.from_string("你好 {{ user.name }}")
# 定义变量 result，赋值为 template.render(user=user)
result = template.render(user=user)
# 沙箱会拦截：
# - 以 _ 开头的属性（如 __class__）
# - 危险方法（如 pop、clear、update）
# - 类的内部属性
\`\`\`

\`\`\`python filename="更严格的沙箱：ImmutableSandboxedEnvironment"
# 从 jinja2.sandbox 导入 ImmutableSandboxedEnvironment
from jinja2.sandbox import ImmutableSandboxedEnvironment

# 这个沙箱连对象的修改都禁止（连赋值都不行）
# 定义变量 sandbox，赋值为 ImmutableSandboxedEnvironment()
sandbox = ImmutableSandboxedEnvironment()
# 适合纯展示场景，杜绝模板副作用
\`\`\`

> **沙箱不是万能的**：它能防属性遍历和危险方法调用，但不能防资源耗尽（用户写无限循环让渲染卡死）。对用户模板要配合超时和长度限制。

## 九、综合示例：带自定义过滤器的邮件模板系统

\`\`\`python filename="邮件模板渲染服务"
# 从 jinja2 导入 Environment, FileSystemLoader, select_autoescape
from jinja2 import Environment, FileSystemLoader, select_autoescape
# 从 datetime 导入 datetime
from datetime import datetime

# 独立配置一个邮件模板环境（不用 Flask 的）
# 定义变量 email_env，赋值为 Environment(
email_env = Environment(
    # 定义变量 loader，赋值为 FileSystemLoader("templates/emails"),
    loader=FileSystemLoader("templates/emails"),
    autoescape=False,  # 邮件正文是纯文本/特定 HTML，按需控制
# )
)

# 注册过滤器
# 装饰器：email_env.filter
@email_env.filter("fmtdate")
# 定义函数 fmtdate，参数: value, fmt="%Y年%m月%d日"
def fmtdate(value, fmt="%Y年%m月%d日"):
    # 条件判断：如果 isinstance(value, datetime)
    if isinstance(value, datetime):
        # 返回 value.strftime(fmt)
        return value.strftime(fmt)
    # 返回 str(value)
    return str(value)

# 装饰器：email_env.filter
@email_env.filter("mask_email")
# 定义函数 mask_email，参数: email
def mask_email(email):
    # """邮箱脱敏：xm@example.com → x***@example.com"""
    """邮箱脱敏：xm@example.com → x***@example.com"""
    # 条件判断：如果 "@" not in email
    if "@" not in email:
        # 返回 email
        return email
    # name, domain = email.split("@", 1)
    name, domain = email.split("@", 1)
    # 条件判断：如果 not name
    if not name:
        # 返回 email
        return email
    # 返回 name[0] + "***@" + domain
    return name[0] + "***@" + domain

# 定义函数 render_email，参数: template_name, **context
def render_email(template_name, **context):
    # """渲染邮件正文"""
    """渲染邮件正文"""
    # 定义变量 template，赋值为 email_env.get_template(template_name)
    template = email_env.get_template(template_name)
    # 返回 template.render(**context)
    return template.render(**context)

# 使用
# 定义变量 body，赋值为 render_email("welcome.txt", user={"name": "小明...
body = render_email("welcome.txt", user={"name": "小明", "email": "xm@example.com"},
                    # 定义变量 activate_url，赋值为 "https://example.com/activate/abc")
                    activate_url="https://example.com/activate/abc")
\`\`\`

\`\`\`txt filename="templates/emails/welcome.txt"
你好 {{ user.name }}，

欢迎注册！请用以下邮箱登录：{{ user.email | mask_email }}

激活账号请点击：{{ activate_url }}
（链接 24 小时内有效，发送时间：{{ now | fmtdate }}）

—— {{ site_name }} 团队
\`\`\`

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 自定义过滤器名和内置重名 | 行为被意外覆盖 | 起独特名字，加项目前缀 |
| 上下文处理器里放重查询 | 每个页面都慢 | 只放轻量数据，重的缓存 |
| 全局函数有副作用 | 多次调用结果不一致 | 全局函数应是纯函数 |
| 用普通 Environment 渲染用户模板 | 安全漏洞 | 用 SandboxedEnvironment |
| autoescape 关了又渲染用户输入 | XSS | 用户内容必须转义 |
| 沙箱里还想用复杂对象方法 | 报错 undefined | 提前把需要的数据扁平化传入 |
| ChoiceLoader 顺序写反 | 覆盖了默认模板 | 自定义目录放前面 |
| 包模板没把 templates 打进包 | PackageLoader 找不到 | setup.py 里 include_package_data=True |
| 测试当过滤器用 \`{{ x \| admin }}\` | 报错 | 测试用 \`{% if x is admin %}\` |
| 沙箱防不住无限循环 | 渲染卡死 | 加超时和模板长度限制 |

## 十一、小结

高级特性让 Jinja2 适配复杂项目：自定义过滤器封装格式化逻辑，自定义测试封装业务判断，上下文处理器注入全站变量，全局函数暴露工具函数。模板加载器决定模板来源（文件/包/字典/多源）。自动转义是安全网，\`SandboxedEnvironment\` 是渲染不可信模板的必选项。生产建议把邮件、报表等独立模板环境单独配置，和 Web 模板隔离。下一章用这些能力搭一个完整的博客模板系统。
`
  },

  // =========================================================
  // 第三十六章：Jinja2 实战技巧
  // =========================================================
  {
    id: "jinja-practice",
    group: "Jinja2 模板引擎",
    icon: "🛠️",
    title: "Jinja2 实战技巧",
    content: `

# Jinja2 实战技巧

## 一、模板组织的工程思维

学完语法和高级特性，最后一步是把它们组织成一个**可维护的项目结构**。模板组织和代码组织遵循同样的原则：高内聚、低耦合、按职责分层。

\`\`\`txt filename="推荐的模板分层模型"
┌─────────────────────────────────────────┐
│  页面层（pages）                          │
│  index.html / posts/list.html            │
│  ↓ extends                               │
├─────────────────────────────────────────┤
│  布局层（layouts）                        │
│  base.html / base_admin.html             │
├─────────────────────────────────────────┤
│  组件层（components / partials）          │
│  macros.html / _post_card.html           │
└─────────────────────────────────────────┘
\`\`\`

三层各司其职：
- **布局层**：全站或某个区域的骨架（导航、页脚、CSS/JS 引入），被多个页面继承。
- **页面层**：具体页面的内容，填布局层的"坑"。
- **组件层**：可复用的小部件（表单输入、卡片、分页器），被页面 include 或宏调用。

## 二、完整博客模板结构实战

\`\`\`txt filename="blog 项目模板结构"
templates/
├── base.html              # 全站外壳
├── macros.html            # 公共宏
├── _post_card.html        # 文章卡片片段
├── _comment_item.html     # 评论项片段
├── _pagination.html       # 分页片段
├── index.html             # 首页
├── posts/
│   ├── list.html          # 列表页
│   ├── detail.html        # 详情页
│   └── form.html          # 新建/编辑表单
├── auth/
│   ├── login.html
│   └── register.html
└── errors/
    ├── 404.html
    └── 500.html
\`\`\`

\`\`\`python filename="app.py - Flask 应用骨架"
# 从 flask 导入 Flask, render_template, request, redirect, url_for, session, flash
from flask import Flask, render_template, request, redirect, url_for, session, flash
# 从 datetime 导入 datetime
from datetime import datetime

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
# app.secret_key = "change-me-in-production"
app.secret_key = "change-me-in-production"

# 模拟数据库
# 定义列表 POSTS
POSTS = [
    # {"id": 1, "title": "Jinja2 入门", "body": "...", "au
    {"id": 1, "title": "Jinja2 入门", "body": "...", "author": "小明", "views": 100},
    # {"id": 2, "title": "Flask 实战", "body": "...", "aut
    {"id": 2, "title": "Flask 实战", "body": "...", "author": "小红", "views": 50},
# ]
]

# 上下文处理器：注入全站变量
# 装饰器：app.context_processor
@app.context_processor
# 定义函数 inject_globals，参数: 
def inject_globals():
    # 返回 {
    return {
        # "site_name": "技术博客",
        "site_name": "技术博客",
        # "current_year": datetime.now().year,
        "current_year": datetime.now().year,
        # "current_user": session.get("user"),
        "current_user": session.get("user"),
    # }
    }

# 自定义过滤器
# 装饰器：app.template_filter
@app.template_filter("fmtdate")
# 定义函数 fmtdate，参数: value, fmt="%Y-%m-%d"
def fmtdate(value, fmt="%Y-%m-%d"):
    # 返回 value.strftime(fmt) if value else ""
    return value.strftime(fmt) if value else ""

# 装饰器：app.template_filter
@app.template_filter("excerpt")
# 定义函数 excerpt，参数: text, length=50
def excerpt(text, length=50):
    # """截取摘要"""
    """截取摘要"""
    # 返回 (text[:length] + "...") if text and len(text) > length else (text or "")
    return (text[:length] + "...") if text and len(text) > length else (text or "")

# 装饰器：app.route
@app.route("/")
# 定义函数 index，参数: 
def index():
    # 定义变量 posts，赋值为 sorted(POSTS, key=lambda p: p["views"], rever...
    posts = sorted(POSTS, key=lambda p: p["views"], reverse=True)[:5]
    # 返回 render_template("index.html", posts=posts)
    return render_template("index.html", posts=posts)
\`\`\`

\`\`\`html filename="templates/base.html - 外壳"
# <!DOCTYPE html>
<!DOCTYPE html>
# <html lang="zh">
<html lang="zh">
# <head>
<head>
  # <meta charset="UTF-8">
  <meta charset="UTF-8">
  # <meta name="viewport" content="width=device-width,
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  # <title>{% block title %}{{ site_name }}{% endblock
  <title>{% block title %}{{ site_name }}{% endblock %}</title>
  # <link rel="stylesheet" href="{{ url_for('static', 
  <link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">
  # {% block extra_css %}{% endblock %}
  {% block extra_css %}{% endblock %}
# </head>
</head>
# <body>
<body>
  # <nav class="navbar">
  <nav class="navbar">
    # <a href="{{ url_for('index') }}" class="logo">{{ s
    <a href="{{ url_for('index') }}" class="logo">{{ site_name }}</a>
    # <a href="{{ url_for('posts_list') }}">文章</a>
    <a href="{{ url_for('posts_list') }}">文章</a>
    # {% if current_user %}
    {% if current_user %}
      # <a href="/logout">登出</a>
      <a href="/logout">登出</a>
    # {% else %}
    {% else %}
      # <a href="{{ url_for('login') }}">登录</a>
      <a href="{{ url_for('login') }}">登录</a>
      # <a href="{{ url_for('register') }}">注册</a>
      <a href="{{ url_for('register') }}">注册</a>
    # {% endif %}
    {% endif %}
  # </nav>
  </nav>

  # <main class="container">
  <main class="container">
    # {# flash 消息区 #}
    {# flash 消息区 #}
    # {% with messages = get_flashed_messages(with_categ
    {% with messages = get_flashed_messages(with_categories=true) %}
      # {% if messages %}
      {% if messages %}
        # {% for category, message in messages %}
        {% for category, message in messages %}
          # <div class="alert alert-{{ category }}">{{ message
          <div class="alert alert-{{ category }}">{{ message }}</div>
        # {% endfor %}
        {% endfor %}
      # {% endif %}
      {% endif %}
    # {% endwith %}
    {% endwith %}

    # {% block content %}{% endblock %}
    {% block content %}{% endblock %}
  # </main>
  </main>

  # <footer>&copy; {{ current_year }} {{ site_name }}<
  <footer>&copy; {{ current_year }} {{ site_name }}</footer>
  # <script src="{{ url_for('static', filename='js/mai
  <script src="{{ url_for('static', filename='js/main.js') }}"></script>
  # {% block extra_js %}{% endblock %}
  {% block extra_js %}{% endblock %}
# </body>
</body>
# </html>
</html>
\`\`\`

\`\`\`html filename="templates/macros.html - 宏集合"
# {# 通用表单输入 #}
{# 通用表单输入 #}
# {% macro field(name, label, value="", type="text",
{% macro field(name, label, value="", type="text", error=None) %}
# <div class="form-group {% if error %}has-error{% e
<div class="form-group {% if error %}has-error{% endif %}">
  # <label for="{{ name }}">{{ label }}</label>
  <label for="{{ name }}">{{ label }}</label>
  # <input type="{{ type }}" id="{{ name }}" name="{{ 
  <input type="{{ type }}" id="{{ name }}" name="{{ name }}"
         # 定义变量 value，赋值为 "{{ value }}" class="form-control">
         value="{{ value }}" class="form-control">
  # {% if error %}<span class="error">{{ error }}</spa
  {% if error %}<span class="error">{{ error }}</span>{% endif %}
# </div>
</div>
# {% endmacro %}
{% endmacro %}

# {# 文章卡片 #}
{# 文章卡片 #}
# {% macro post_card(post) %}
{% macro post_card(post) %}
# <article class="post-card">
<article class="post-card">
  # <h3><a href="{{ url_for('post_detail', pid=post.id
  <h3><a href="{{ url_for('post_detail', pid=post.id) }}">{{ post.title }}</a></h3>
  # <p class="meta">{{ post.author }} · {{ post.views 
  <p class="meta">{{ post.author }} · {{ post.views }} 浏览</p>
  # <p>{{ post.body | excerpt(80) }}</p>
  <p>{{ post.body | excerpt(80) }}</p>
# </article>
</article>
# {% endmacro %}
{% endmacro %}

# {# 分页器 #}
{# 分页器 #}
# {% macro pagination(page, total, per_page=10) %}
{% macro pagination(page, total, per_page=10) %}
# {% set total_pages = (total + per_page - 1) // per
{% set total_pages = (total + per_page - 1) // per_page %}
# {% if total_pages > 1 %}
{% if total_pages > 1 %}
# <nav class="pagination">
<nav class="pagination">
  # {% if page > 1 %}<a href="?page={{ page - 1 }}">上一
  {% if page > 1 %}<a href="?page={{ page - 1 }}">上一页</a>{% endif %}
  # {% for p in range(1, total_pages + 1) %}
  {% for p in range(1, total_pages + 1) %}
    # {% if p == page %}<span class="current">{{ p }}</s
    {% if p == page %}<span class="current">{{ p }}</span>
    # {% else %}<a href="?page={{ p }}">{{ p }}</a>{% en
    {% else %}<a href="?page={{ p }}">{{ p }}</a>{% endif %}
  # {% endfor %}
  {% endfor %}
  # {% if page < total_pages %}<a href="?page={{ page 
  {% if page < total_pages %}<a href="?page={{ page + 1 }}">下一页</a>{% endif %}
# </nav>
</nav>
# {% endif %}
{% endif %}
# {% endmacro %}
{% endmacro %}
\`\`\`

\`\`\`html filename="templates/index.html - 首页"
# {% extends "base.html" %}
{% extends "base.html" %}
# {% from "macros.html" import post_card %}
{% from "macros.html" import post_card %}

# {% block title %}首页 - {{ super() }}{% endblock %}
{% block title %}首页 - {{ super() }}{% endblock %}

# {% block content %}
{% block content %}
  # <h1>热门文章</h1>
  <h1>热门文章</h1>
  # <div class="post-list">
  <div class="post-list">
    # {% for post in posts %}
    {% for post in posts %}
      # {{ post_card(post) }}
      {{ post_card(post) }}
    # {% else %}
    {% else %}
      # <p>暂无文章，<a href="{{ url_for('post_new') }}">写一篇</a
      <p>暂无文章，<a href="{{ url_for('post_new') }}">写一篇</a></p>
    # {% endfor %}
    {% endfor %}
  # </div>
  </div>
# {% endblock %}
{% endblock %}
\`\`\`

## 三、性能优化

### 1. 模板编译缓存

Jinja2 把模板编译成 Python 代码再执行。默认每次都要解析模板文件，开启缓存后只编译一次。

\`\`\`python filename="开启模板缓存"
# 从 jinja2 导入 Environment, FileSystemLoader
from jinja2 import Environment, FileSystemLoader

# 方式一：环境配置（生产推荐）
# 定义变量 env，赋值为 Environment(
env = Environment(
    # 定义变量 loader，赋值为 FileSystemLoader("templates"),
    loader=FileSystemLoader("templates"),
    auto_reload=False,   # 不检查文件变更（生产）
    # cache_size 默认 400，足够
# )
)

# Flask 默认开缓存，开发模式关掉方便热重载
app.config["TEMPLATES_AUTO_RELOAD"] = app.debug  # 开发 True，生产 False
\`\`\`

### 2. 预编译模板

对性能极致要求的场景，可以提前把模板编译成 Python 文件，省去运行时解析。

\`\`\`bash filename="预编译命令"
# 把 templates/ 编译成 .py 缓存
# 以模块方式运行 jinja2
python -m jinja2 --compile templates/
\`\`\`

### 3. 减少模板里的重逻辑

\`\`\`txt filename="性能反模式 vs 正例"
❌ 反模式：在模板里做数据库查询、复杂计算
{% for user in users %}
  {% set count = get_post_count(user.id) %}  {# 每次循环都查库 #}
{% endfor %}

✅ 正例：在视图里算好，模板只展示
# 视图函数
users = [{"name": u.name, "post_count": u.posts.count()} for u in users]
# 模板
{% for user in users %}{{ user.post_count }}{% endfor %}
\`\`\`

> **模板的职责边界**：模板只负责"展示"，不做数据获取和业务计算。把重活放视图函数，模板只做循环、条件、格式化。

## 四、模板调试

\`\`\`python filename="开启调试看错误行号"
# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)
app.debug = True   # 开启调试，模板报错会显示行号和上下文
\`\`\`

\`\`\`txt filename="Jinja2 报错信息示例"
jinja2.exceptions.TemplateSyntaxError: Encountered unknown tag 'endfor'.
  File "templates/posts/list.html", line 12, in template
    {% for post in posts %}   ← 这里少了 {% endfor %}
\`\`\`

\`\`\`python filename="独立环境的调试选项"
# 从 jinja2 导入 Environment, FileSystemLoader
from jinja2 import Environment, FileSystemLoader

# 定义变量 env，赋值为 Environment(
env = Environment(
    # 定义变量 loader，赋值为 FileSystemLoader("templates"),
    loader=FileSystemLoader("templates"),
    undefined=Undefined,  # 默认，未定义变量渲染为空
    # StrictUndefined,  # 未定义变量报错（推荐开发用）
    # DebugUndefined,  # 未定义变量显示 [undefined]（推荐调试用）
# )
)

# 捕获渲染异常
# 尝试执行，捕获异常
try:
    # 调用 env.get_template()
    env.get_template("page.html").render(user=user)
# 捕获 Exception 异常，赋值为 e
except Exception as e:
    # 调用 print()
    print(f"模板渲染失败：{e}")
\`\`\`

> **开发用 \`StrictUndefined\`**：让未定义变量直接报错，及早暴露 bug。生产用默认 \`Undefined\` 容错。

## 五、继承层级设计原则

\`\`\`txt filename="继承层数 vs 维护成本"
1 层（base + page）     简单项目，最推荐
2 层（base + section + page）  中型项目，按区域分（前台/后台）
3 层及以上             谨慎，调试成本陡增
\`\`\`

\`\`\`txt filename="block 命名约定"
通用坑（每个页面都覆盖）：title, content
可选坑（按需覆盖）：extra_css, extra_js, sidebar
嵌套坑：带前缀，如 admin_content, post_meta
避免太通用：别都用 content，多级继承会冲突
\`\`\`

## 六、和前端框架结合：JSON 传递

现代 Web 常用"后端渲染外壳 + 前端框架（React/Vue）渲染交互区"。Jinja2 负责把初始数据以 JSON 形式传给前端。

\`\`\`python filename="把数据序列化成 JSON 传给前端"
# 从 flask 导入 Flask, render_template, jsonify
from flask import Flask, render_template, jsonify
# 导入 json 模块
import json

# 定义变量 app，赋值为 Flask(__name__)
app = Flask(__name__)

# 装饰器：app.route
@app.route("/posts")
# 定义函数 posts，参数: 
def posts():
    # 定义变量 posts，赋值为 get_posts()
    posts = get_posts()
    # 把数据序列化成 JSON 字符串传给模板
    # 返回 render_template("posts.html",
    return render_template("posts.html",
                           # 定义变量 posts_json，赋值为 json.dumps(posts, ensure_ascii=False))
                           posts_json=json.dumps(posts, ensure_ascii=False))
\`\`\`

\`\`\`html filename="templates/posts.html - 把 JSON 传给 Vue"
# {% extends "base.html" %}
{% extends "base.html" %}

# {% block content %}
{% block content %}
# <div id="app">
<div id="app">
  # <!-- Vue 接管这个区域 -->
  <!-- Vue 接管这个区域 -->
# </div>
</div>
# {% endblock %}
{% endblock %}

# {% block extra_js %}
{% block extra_js %}
# <script>
<script>
  # // 从后端传来的 JSON 数据
  // 从后端传来的 JSON 数据
  # // 用 | safe 因为这是我们自己生成的 JSON，不是用户输入
  // 用 | safe 因为这是我们自己生成的 JSON，不是用户输入
  # const posts = {{ posts_json | safe }};
  const posts = {{ posts_json | safe }};

  # // 初始化 Vue
  // 初始化 Vue
  # new Vue({
  new Vue({
    # 字段 el，类型: "#app",
    el: "#app",
    # 字段 data，类型: { posts: posts },
    data: { posts: posts },
    # 字段 template，类型: '<ul><li v-for，默认值: "p in posts">{{ p.title }}</li></ul>'
    template: '<ul><li v-for="p in posts">{{ p.title }}</li></ul>'
  # });
  });
# </script>
</script>
# {% endblock %}
{% endblock %}
\`\`\`

\`\`\`txt filename="JSON 传递的安全注意"
✅ 后端用 json.dumps 生成 → | safe → 前端解析，安全
❌ 把用户输入直接拼进 <script> → XSS（用户输入里能注入 </script>）
✅ 防御：json.dumps 会转义 < → \\u003c，杜绝标签注入
\`\`\`

## 七、常用模式速查

### 列表页模式

\`\`\`jinja filename="列表页标准结构"
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block content %}
{% block content %}
  # <h1>{{ page_title }}</h1>
  <h1>{{ page_title }}</h1>
  # {% if items | length > 0 %}
  {% if items | length > 0 %}
    # <ul>{% for item in items %}<li>{{ item.name }}</li
    <ul>{% for item in items %}<li>{{ item.name }}</li>{% endfor %}</ul>
    # {{ pagination(page, total) }}
    {{ pagination(page, total) }}
  # {% else %}
  {% else %}
    # <p class="empty">暂无数据</p>
    <p class="empty">暂无数据</p>
  # {% endif %}
  {% endif %}
# {% endblock %}
{% endblock %}
\`\`\`

### 详情页模式

\`\`\`jinja filename="详情页标准结构"
# {% extends "base.html" %}
{% extends "base.html" %}
# {% block title %}{{ item.title }} - {{ super() }}{
{% block title %}{{ item.title }} - {{ super() }}{% endblock %}
# {% block content %}
{% block content %}
  # <article>
  <article>
    # <h1>{{ item.title }}</h1>
    <h1>{{ item.title }}</h1>
    # <div class="meta">{{ item.created_at | fmtdate }} 
    <div class="meta">{{ item.created_at | fmtdate }} · {{ item.author }}</div>
    # <div class="body">{{ item.body | safe }}</div>
    <div class="body">{{ item.body | safe }}</div>
  # </article>
  </article>
  # <a href="{{ url_for('list') }}">返回列表</a>
  <a href="{{ url_for('list') }}">返回列表</a>
# {% endblock %}
{% endblock %}
\`\`\`

### 表单页模式

\`\`\`jinja filename="表单页（带错误回显）"
# {% extends "base.html" %}
{% extends "base.html" %}
# {% from "macros.html" import field %}
{% from "macros.html" import field %}
# {% block content %}
{% block content %}
  # <form method="post">
  <form method="post">
    # {# value 回显上次输入，error 显示校验错误 #}
    {# value 回显上次输入，error 显示校验错误 #}
    # {{ field("name", "用户名", value=form.name.data, erro
    {{ field("name", "用户名", value=form.name.data, error=form.name.errors[0] if form.name.errors) }}
    # <button type="submit">提交</button>
    <button type="submit">提交</button>
  # </form>
  </form>
# {% endblock %}
{% endblock %}
\`\`\`

## 八、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 生产开了 auto_reload | 每次渲染都查文件修改时间 | 生产关掉 |
| 模板里查数据库 | 慢，N+1 查询 | 视图层算好数据再传 |
| 用 \`| safe\` 输出用户内容 | XSS | 用户内容必须转义 |
| JSON 传给前端没转义 \`<\` | XSS | 用 json.dumps（自动转义） |
| 继承超过 3 层 | 调试难 | 拆成组合（include）替代深继承 |
| block 名重复 | 多级继承覆盖冲突 | 用带前缀的具名 block |
| 上下文处理器重查询 | 全站变慢 | 轻量数据或缓存 |
| flash 消息没取 | 消息堆积 | 用 get_flashed_messages 消费 |
| url_for 写错视图名 | 500 错误 | 用视图函数名，不是 URL 路径 |
| 开发用默认 Undefined | bug 晚暴露 | 开发用 StrictUndefined |

## 九、小结

实战层面，Jinja2 项目的可维护性取决于**分层是否清晰**：布局层管外壳，页面层填内容，组件层（宏/include）做复用。性能上开缓存、关 auto_reload，把重逻辑挪出模板。和前端框架结合时用 JSON 传数据，注意 \`| safe\` 只用于自己生成的 JSON。开发期开 debug、用 StrictUndefined 早暴露问题。至此 Jinja2 篇完整闭环：语法 → 继承宏 → 高级特性 → 实战架构。下一章进入 SQLAlchemy ORM，从模板"展示数据"转向"持久化数据"。
`
  },
];
