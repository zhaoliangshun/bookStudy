// =============================================================
// Python后端开发指南 - 第1批章节（Web基础入门 8章）
// =============================================================

export const chapters = [
  {
    id: "pyb-1-1",
    group: "Web基础入门",
    icon: "🌐",
    title: "Web开发概述与后端工程师角色",
    content: `

# Web开发概述与后端工程师角色

## 一、互联网架构概览

Web开发是创建和维护网站或Web应用的过程，涉及前端和后端两大领域。现代Web应用已经从简单的静态页面发展为复杂的分布式系统，支撑着电子商务、社交网络、在线办公等各类互联网服务。

### 1.1 客户端-服务器架构

Web开发的核心是客户端-服务器（Client-Server）架构：
- **客户端**：通常是Web浏览器，负责展示用户界面、处理用户交互
- **服务器**：负责处理业务逻辑、访问数据库、返回数据
- **通信协议**：通过HTTP/HTTPS协议进行数据交换

\`\`\`python
# 最简单的客户端-服务器模型示例
import socket

# 服务器端
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('127.0.0.1', 8000))
server.listen(1)
print("服务器启动，监听8000端口...")

while True:
    conn, addr = server.accept()
    print(f"收到来自 {addr} 的连接")
    data = conn.recv(1024)
    print(f"收到数据: {data.decode('utf-8')[:100]}")
    response = b"HTTP/1.1 200 OK\\r\\nContent-Type: text/html\\r\\n\\r\\n<h1>Hello World</h1>"
    conn.sendall(response)
    conn.close()
\`\`\`

### 1.2 典型互联网系统分层架构

| 层次 | 组件 | 主要职责 |
|------|------|---------|
| 客户端层 | 浏览器、App、小程序 | 用户交互、界面展示 |
| CDN层 | 内容分发网络 | 静态资源缓存、加速访问 |
| 负载均衡层 | Nginx、LVS、F5 | 请求分发、流量调度 |
| Web服务层 | Nginx、Apache | 反向代理、静态文件服务 |
| 应用服务层 | Django/Flask/FastAPI | 业务逻辑处理 |
| 缓存层 | Redis、Memcached | 热点数据缓存 |
| 数据库层 | MySQL、PostgreSQL | 数据持久化存储 |
| 消息队列 | Kafka、RabbitMQ | 异步处理、解耦 |

---

## 二、前端与后端职责划分

### 2.1 前端开发职责

前端主要关注用户直接看到和交互的部分：
1. 页面结构与样式：HTML/CSS实现布局和视觉设计
2. 交互逻辑：JavaScript处理用户操作、表单验证
3. 数据展示：将后端返回的数据渲染为用户可见内容
4. 用户体验优化：加载速度、响应式设计

### 2.2 后端开发职责

后端负责"幕后"工作：
1. **业务逻辑处理**：实现核心业务规则、数据计算
2. **API接口开发**：为前端提供RESTful接口
3. **数据持久化**：数据库设计、增删改查、事务管理
4. **用户认证授权**：登录注册、权限控制、JWT/Session
5. **性能优化**：缓存、异步处理、数据库优化
6. **安全防护**：防SQL注入、XSS、CSRF
7. **系统运维**：日志、监控、部署、故障排查

**后端技术栈（Python方向）**：
- Web框架：Django、Flask、FastAPI、Tornado
- 数据库：MySQL、PostgreSQL、Redis
- 消息队列：Celery + Redis/RabbitMQ
- 部署：Docker、Nginx、Gunicorn

### 2.3 前后端协作模式

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| 服务端渲染（SSR） | 后端生成HTML | 传统网站、SEO要求高 |
| 前后端分离 | 后端只提供API，前端渲染 | 现代Web应用、移动端 |
| BFF | 为前端定制的聚合层 | 多端适配 |
| 微服务 | 拆分为多个独立服务 | 大型系统 |

---

## 三、后端工程师技能树

### 3.1 核心技术能力

**基础篇**：
- Python编程语言精通，了解至少一门其他语言
- 计算机基础：数据结构与算法、操作系统、计算机网络、数据库原理
- Linux基础：常用命令、Shell脚本

**Web开发篇**：
- 至少精通一个Python Web框架
- HTTP协议深入理解
- RESTful API设计
- ORM框架使用

**数据库篇**：
- MySQL/PostgreSQL熟练使用，理解索引、事务、锁
- Redis数据结构及常用场景
- 数据库表结构设计

**工程化篇**：
- Git版本控制
- 单元测试（pytest）
- 代码规范（PEP8）
- Docker容器化

### 3.2 软技能

1. 文档能力：编写清晰的技术文档、接口文档
2. 沟通能力：与前端、产品、测试有效沟通
3. 问题解决能力：独立分析和解决技术问题
4. 学习能力：持续学习新技术

---

## 四、Python后端学习路线图

### 4.1 阶段划分

| 阶段 | 时间 | 学习内容 |
|------|------|---------|
| 第一阶段 | 1-2个月 | Python基础语法、面向对象、常用模块 |
| 第二阶段 | 2-3个月 | HTTP协议、Web框架入门、MySQL基础、Git |
| 第三阶段 | 2-3个月 | 框架深入、Redis、RESTful API、单元测试 |
| 第四阶段 | 2-3个月 | 完整项目开发、部署、Docker |
| 第五阶段 | 持续 | 高并发、微服务、分布式、云原生 |

\`\`\`python
# Python基础必掌握知识点示例
from typing import List, Dict, Optional

# 类型提示
def greet(name: str) -> str:
    return f"Hello, {name}!"

# 面向对象
class UserService:
    def __init__(self, db_config: Dict[str, str]):
        self.db_config = db_config
        self._users: List[Dict] = []
    
    def create_user(self, username: str, email: str) -> Dict:
        user = {"id": len(self._users) + 1, "username": username, "email": email}
        self._users.append(user)
        return user
    
    def get_user(self, user_id: int) -> Optional[Dict]:
        return next((u for u in self._users if u["id"] == user_id), None)
\`\`\`

---

## 五、后端开发工作流程

### 5.1 典型开发流程

\`\`\`
需求评审 → 技术方案设计 → 数据库设计 → 接口设计 → 编码实现 →
单元测试 → 代码审查 → 联调测试 → 测试环境验证 → 正式发布 → 线上监控
\`\`\`

### 5.2 接口设计最佳实践

\`\`\`python
# 统一响应格式示例
from flask import Flask, jsonify

app = Flask(__name__)

def success(data=None, message="success"):
    return jsonify({"code": 0, "message": message, "data": data})

def error(code: int, message: str, status_code: int = 400):
    response = jsonify({"code": code, "message": message, "data": None})
    response.status_code = status_code
    return response

@app.route("/api/v1/users/<int:user_id>")
def get_user(user_id: int):
    user = {"id": user_id, "name": "tom"}
    if not user:
        return error(40401, "用户不存在", 404)
    return success(user)
\`\`\`

---

## 六、常见面试题

### 6.1 前端和后端的区别？

**参考回答**：前端负责用户界面和交互，后端负责业务逻辑、数据处理和API提供。两者通过HTTP通信，前端展示数据，后端处理和存储数据。

### 6.2 输入URL到页面展示发生了什么？

**参考回答**：
1. DNS解析域名到IP
2. TCP三次握手建立连接
3. HTTPS进行TLS握手
4. 浏览器发送HTTP请求
5. 服务器处理请求返回响应
6. 浏览器解析HTML、CSS、JS，渲染页面
7. 关闭连接或复用

---

## 七、本章小结

- 后端核心是处理业务逻辑、管理数据、提供API
- 计算机基础决定技术天花板
- 不要只停留在"会用"框架，要理解原理
- 安全意识和代码质量是基本素养
`
  },
  {
    id: "pyb-1-2",
    group: "Web基础入门",
    icon: "🌐",
    title: "Web工作原理",
    content: `

# Web工作原理

## 一、URL结构详解

URL（统一资源定位符）是Web资源的地址，结构如下：

\`\`\`
https://www.example.com:443/api/users?id=123#profile
\\┬───┘  \\┬──────────────┘ \\┬┘ \\┬────────┘ \\┬──────┘ \\┬─────┘
 │          │             │      │          │        └── 片段（不发送给服务器）
 │          │             │      │          └────────── 查询参数
 │          │             │      └───────────────────── 路径
 │          │             └──────────────────────────── 端口
 │          └────────────────────────────────────────── 主机名
 └───────────────────────────────────────────────────── 协议
\`\`\`

| 组成部分 | 说明 | 默认值 |
|---------|------|--------|
| 协议 | http/https/ftp | - |
| 主机名 | 域名或IP | - |
| 端口 | 服务端口 | http:80, https:443 |
| 路径 | 资源位置 | / |
| 查询参数 | 键值对参数 | - |
| 片段 | 页面内锚点 | - |

\`\`\`python
from urllib.parse import urlparse, parse_qs, quote, unquote

url = "https://www.example.com:8080/api/users?page=1&size=20#top"
parsed = urlparse(url)
print(f"协议: {parsed.scheme}")
print(f"主机: {parsed.hostname}")
print(f"端口: {parsed.port}")
print(f"路径: {parsed.path}")
print(f"查询参数: {parse_qs(parsed.query)}")
print(f"片段: {parsed.fragment}")

# URL编码
print(quote("你好世界"))  # %E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C
\`\`\`

---

## 二、DNS解析过程

DNS将域名转换为IP地址，解析步骤：

\`\`\`
浏览器缓存 → 系统缓存(hosts) → 路由器缓存 → ISP DNS →
根域名服务器 → 顶级域名服务器(.com) → 权威域名服务器 → IP地址
\`\`\`

### 2.1 DNS记录类型

| 类型 | 说明 | 示例 |
|------|------|------|
| A | 域名→IPv4 | example.com → 1.2.3.4 |
| AAAA | 域名→IPv6 | - |
| CNAME | 别名→域名 | www→example.com |
| MX | 邮件服务器 | - |
| NS | 权威DNS服务器 | - |

\`\`\`python
import socket

# DNS查询
ip = socket.gethostbyname("www.baidu.com")
print(f"百度IP: {ip}")

# 获取完整信息
hostname, aliases, ips = socket.gethostbyname_ex("www.baidu.com")
print(f"主机名: {hostname}, 别名: {aliases}, IP: {ips}")
\`\`\`

---

## 三、TCP连接与三次握手

HTTP基于TCP协议，TCP提供可靠的面向连接的服务。

### 3.1 三次握手建立连接

\`\`\`
客户端 → SYN seq=x → 服务器     （第一次：客户端请求连接）
客户端 ← SYN+ACK seq=y,ack=x+1 ← 服务器 （第二次：服务器确认并请求）
客户端 → ACK ack=y+1 → 服务器     （第三次：客户端确认）
连接建立完成
\`\`\`

**为什么是三次？** 防止已失效的连接请求到达服务器造成资源浪费，并确认双方收发能力正常。

### 3.2 四次挥手断开连接

\`\`\`
客户端 → FIN → 服务器    （第一次：客户端关闭发送）
客户端 ← ACK ← 服务器    （第二次：服务器确认，可能还发数据）
客户端 ← FIN ← 服务器    （第三次：服务器关闭发送）
客户端 → ACK → 服务器    （第四次：客户端确认，等待2MSL）
\`\`\`

\`\`\`python
import socket

# Python创建TCP连接并发送HTTP请求
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5)
sock.connect(("www.baidu.com", 80))

request = b"GET / HTTP/1.1\\r\\nHost: www.baidu.com\\r\\nConnection: close\\r\\n\\r\\n"
sock.sendall(request)

response = b""
while True:
    data = sock.recv(4096)
    if not data:
        break
    response += data

print(response.decode("utf-8", errors="ignore")[:500])
sock.close()
\`\`\`

---

## 四、HTTP请求响应模型

HTTP是无状态协议，每个请求独立。

### 4.1 请求报文结构

\`\`\`
POST /api/login HTTP/1.1       ← 请求行
Host: www.example.com          ← 请求头部
Content-Type: application/json
Content-Length: 45
                               ← 空行（必须）
{"username":"tom","password":"123"}  ← 请求体
\`\`\`

### 4.2 响应报文结构

\`\`\`
HTTP/1.1 200 OK                ← 状态行
Content-Type: application/json ← 响应头部
Content-Length: 52
                               ← 空行
{"code":0,"message":"success"} ← 响应体
\`\`\`

### 4.3 常见Content-Type

| MIME类型 | 说明 |
|---------|------|
| application/json | JSON数据 |
| application/x-www-form-urlencoded | 表单默认 |
| multipart/form-data | 文件上传 |
| text/html | HTML文档 |

---

## 五、用Python发送HTTP请求

\`\`\`python
import requests

# GET请求
resp = requests.get("https://httpbin.org/get", params={"name": "tom"})
print(resp.json())

# POST JSON
resp = requests.post(
    "https://httpbin.org/post",
    json={"username": "tom", "age": 25}
)

# POST表单
resp = requests.post(
    "https://httpbin.org/post",
    data={"key": "value"}
)

# Session管理Cookie
session = requests.Session()
session.get("https://httpbin.org/cookies/set/sessionid/abc123")
resp = session.get("https://httpbin.org/cookies")
print(resp.json())
\`\`\`

---

## 六、浏览器开发者工具

Network面板可查看：
- 请求列表（状态码、类型、大小、时间）
- Headers：请求响应头部
- Response：响应内容
- Timing：时间分解（DNS、TCP、TTFB、下载等）

**TTFB（首字节时间）**是衡量后端性能的重要指标。

---

## 七、常见面试题

### TCP三次握手为什么不是两次？

两次握手无法防止已失效的连接请求到达服务器导致资源浪费，也无法确认客户端的接收能力。

### HTTP请求报文由哪几部分组成？

请求行（方法、URL、版本）、请求头部、空行、请求体四部分。

---

## 八、本章小结

- DNS多层缓存加速解析，递归查询获取IP
- TCP三次握手建立可靠连接，四次挥手安全关闭
- HTTP请求响应模型，包含头部和体
- requests是Python最常用的HTTP客户端
`
  },
  {
    id: "pyb-1-3",
    group: "Web基础入门",
    icon: "🌐",
    title: "客户端与服务端架构",
    content: `

# 客户端与服务端架构

## 一、C/S与B/S模式

### 1.1 C/S架构（Client/Server）

客户端/服务器架构，需要安装专用客户端软件。

| 特性 | C/S架构 | B/S架构 |
|------|---------|---------|
| 客户端 | 需要安装专用客户端 | 浏览器即可 |
| 更新 | 需要更新客户端 | 更新服务器即可 |
| 性能 | 客户端可分担计算，性能好 | 主要依赖服务器 |
| 跨平台 | 差，需要开发不同平台客户端 | 好，浏览器跨平台 |
| 安全 | 相对更安全 | 面临更多Web安全问题 |
| 例子 | QQ、微信、网游 | 网站、Web邮箱 |

\`\`\`python
# C/S模式：自定义TCP协议的简单示例
# 服务器
import socket
import json

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('127.0.0.1', 9000))
server.listen(5)

while True:
    conn, addr = server.accept()
    data = conn.recv(1024).decode('utf-8')
    request = json.loads(data)
    
    if request['action'] == 'login':
        response = {'code': 0, 'msg': '登录成功', 'token': 'abc123'}
    else:
        response = {'code': -1, 'msg': '未知操作'}
    
    conn.sendall(json.dumps(response).encode('utf-8'))
    conn.close()
\`\`\`

### 1.2 B/S架构（Browser/Server）

浏览器/服务器架构，通过浏览器访问。B/S是C/S的特例，浏览器作为通用客户端。

---

## 二、MVC架构模式

MVC是经典的软件架构模式，将应用分为三部分：

| 组件 | 职责 | 对应Web开发 |
|------|------|------------|
| Model（模型） | 数据和业务逻辑 | 数据库操作、业务规则 |
| View（视图） | 用户界面展示 | HTML模板、前端页面 |
| Controller（控制器） | 接收请求、协调Model和View | 路由处理、请求分发 |

### 2.1 Django的MTV模式

Django使用MTV模式，本质是MVC的变体：

| MTV | MVC对应 | 说明 |
|-----|---------|------|
| Model | Model | 数据模型，ORM |
| Template | View | 模板，页面展示 |
| View | Controller | 视图函数/类，业务逻辑 |

\`\`\`python
# Django MTV示例
# models.py
from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)

# views.py (Controller)
from django.shortcuts import render, get_object_or_404
from .models import User

def user_detail(request, user_id):
    user = get_object_or_404(User, id=user_id)
    return render(request, 'user_detail.html', {'user': user})

# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('users/<int:user_id>/', views.user_detail),
]
\`\`\`

### 2.2 MVVM模式（前端）

MVVM是Model-View-ViewModel，用于前端框架（Vue、Angular）：
- Model：数据
- View：UI
- ViewModel：View和Model的桥梁，数据双向绑定

---

## 三、前后端分离架构

### 3.1 前后端分离 vs 服务端渲染

| 对比项 | 服务端渲染（SSR） | 前后端分离 |
|--------|----------------|-----------|
| 渲染位置 | 服务器渲染HTML | 客户端（浏览器）渲染 |
| 后端返回 | HTML页面 | JSON数据 |
| 前端职责 | 少量JS交互 | 完整的页面渲染和路由 |
| 开发效率 | 前后端耦合 | 前后端并行开发 |
| SEO | 友好 | 需要额外处理（SSR/SSG） |
| 用户体验 | 页面刷新 | 单页应用，体验流畅 |
| 适用场景 | 内容网站、SEO要求高 | 后台管理、SaaS应用 |

\`\`\`python
# 服务端渲染示例（Flask + Jinja2）
from flask import Flask, render_template

app = Flask(__name__)

@app.route('/users')
def user_list():
    users = [
        {'id': 1, 'name': 'Tom', 'age': 25},
        {'id': 2, 'name': 'Jerry', 'age': 30},
    ]
    # 服务器渲染HTML，返回完整页面
    return render_template('users.html', users=users)

# 前后端分离示例（只返回JSON）
@app.route('/api/v1/users')
def api_user_list():
    users = [{'id': 1, 'name': 'Tom', 'age': 25}]
    return {'code': 0, 'data': users}
\`\`\`

### 3.2 前后端分离的好处

1. **并行开发**：前后端约定API文档后可独立开发
2. **独立部署**：前端和后端可以分开部署
3. **多端复用**：同一套API服务Web、iOS、Android等
4. **职责清晰**：前端专注用户体验，后端专注业务逻辑
5. **灵活扩展**：后端可以用微服务，前端可以用CDN

### 3.3 前后端分离的挑战

1. **跨域问题**：需要配置CORS
2. **SEO问题**：搜索引擎爬虫可能不执行JS
3. **首屏加载**：需要加载JS后渲染，可能较慢
4. **接口文档维护**：需要Swagger等工具维护文档

---

## 四、单体架构与分布式架构

### 4.1 单体架构（Monolithic）

所有功能模块打包在一个应用中部署。

**优点**：
- 开发简单，初期快速迭代
- 部署简单，一个包搞定
- 调试方便，没有分布式问题
- 测试相对简单

**缺点**：
- 代码膨胀后维护困难
- 构建部署变慢
- 技术栈锁定
- 无法针对单个模块扩容
- 单点故障风险

### 4.2 分布式/微服务架构

将应用拆分为多个独立服务，每个服务运行在自己的进程中，通过HTTP/RPC通信。

\`\`\`
用户服务 ←→ 订单服务 ←→ 商品服务
   ↓           ↓           ↓
用户数据库   订单数据库   商品数据库
        ↘     ↓     ↙
           API网关
             ↓
           客户端
\`\`\`

**微服务优点**：
- 服务独立开发、部署、扩展
- 技术栈灵活
- 故障隔离，单个服务故障不影响整体
- 团队可以按服务划分

**微服务缺点**：
- 分布式系统复杂度高（网络延迟、分布式事务）
- 服务间调用、服务发现、负载均衡
- 运维复杂度增加
- 调试和测试困难
- 数据一致性问题

\`\`\`python
# 微服务间调用示例
import requests

class OrderService:
    USER_SERVICE_URL = "http://user-service:8001"
    PRODUCT_SERVICE_URL = "http://product-service:8002"
    
    def create_order(self, user_id: int, product_id: int, quantity: int):
        # 调用用户服务验证用户
        user_resp = requests.get(f"{self.USER_SERVICE_URL}/api/users/{user_id}")
        if user_resp.status_code != 200:
            raise Exception("用户不存在")
        
        # 调用商品服务查询库存
        product_resp = requests.get(f"{self.PRODUCT_SERVICE_URL}/api/products/{product_id}")
        product = product_resp.json()
        if product['stock'] < quantity:
            raise Exception("库存不足")
        
        # 创建订单（本地数据库操作）
        order = self._save_order(user_id, product_id, quantity)
        
        # 调用商品服务扣减库存
        requests.post(f"{self.PRODUCT_SERVICE_URL}/api/products/{product_id}/deduct",
                      json={"quantity": quantity})
        
        return order
\`\`\`

### 4.3 架构选型建议

| 阶段 | 推荐架构 | 原因 |
|------|---------|------|
| 初创期/小项目 | 单体架构 | 快速开发，简单高效 |
| 中型项目 | 模块化单体 | 代码分层，为微服务做准备 |
| 大型项目/团队大 | 微服务 | 独立扩展，团队自治 |

**不要过早微服务！** 马丁·福勒说过："除非你的系统复杂度已经让单体架构难以管理，否则不要使用微服务。微服务有很高的复杂度代价。"

---

## 五、BFF架构

BFF（Backend For Frontend）是为前端服务的后端层，介于前端和后端微服务之间。

### 5.1 BFF的作用

1. **接口聚合**：将多个微服务接口聚合成一个前端需要的接口，减少请求次数
2. **字段裁剪**：根据前端需要返回字段，减少数据传输
3. **格式转换**：将后端的数据格式转换为前端需要的格式
4. **适配多端**：Web、iOS、Android可以有各自的BFF

\`\`\`python
# BFF示例：聚合多个服务
from flask import Flask, jsonify
import requests

app = Flask(__name__)

# 移动端BFF：一个接口返回首页所需所有数据
@app.route('/api/mobile/home')
def mobile_home():
    # 并行调用多个服务（实际用asyncio或线程池）
    user = requests.get('http://user-service/api/user/profile').json()
    banners = requests.get('http://content-service/api/banners').json()
    products = requests.get('http://product-service/api/products/hot').json()
    notifications = requests.get('http://message-service/api/unread-count').json()
    
    # 组装成移动端需要的格式
    return jsonify({
        'userInfo': {
            'name': user['nickname'],
            'avatar': user['avatarUrl']
        },
        'bannerList': banners,
        'hotProducts': products['list'][:10],
        'unreadCount': notifications['count']
    })
\`\`\`

---

## 六、常见面试题

### MVC和MVVM的区别？

MVC是后端经典模式，Controller负责接收请求协调Model和View；MVVM是前端模式，ViewModel通过双向绑定连接Model和View，View和ViewModel自动同步。

### 单体架构和微服务的优缺点？什么时候用微服务？

单体开发部署简单但扩展困难；微服务独立部署扩展但复杂度高。建议初期用单体，当团队规模大、模块边界清晰、单体成为瓶颈时再考虑微服务。不要过早微服务。

### 前后端分离的好处和挑战？

好处是并行开发、独立部署、多端复用；挑战是跨域、SEO、首屏性能、接口文档维护。

---

## 七、本章小结

- C/S需要专用客户端，B/S用浏览器访问
- MVC分离关注点，MTV是Django的变体
- 前后端分离是现代主流，并行开发但需处理跨域等问题
- 单体架构简单高效，微服务灵活但复杂度高
- BFF聚合接口，为前端定制数据格式
`
  },
  {
    id: "pyb-1-4",
    group: "Web基础入门",
    icon: "🌐",
    title: "Python Web生态全景",
    content: `

# Python Web生态全景

## 一、Python Web框架对比

Python有丰富的Web框架生态，各有特色和适用场景。

### 1.1 主流框架对比表

| 框架 | 类型 | 特点 | 性能 | 适用场景 | 学习曲线 |
|------|------|------|------|---------|---------|
| Django | 全栈框架 | 大而全，ORM/Admin/表单/认证 | 中等 | 内容网站、CMS、后台管理 | 中等 |
| Flask | 微框架 | 轻量灵活，插件丰富 | 较好 | 中小型项目、API服务、快速原型 | 平缓 |
| FastAPI | 现代API框架 | 异步、自动文档、类型提示 | 很高 | 高性能API、微服务、机器学习接口 | 平缓 |
| Tornado | 异步框架 | 原生异步、WebSocket支持 | 高 | 长连接、WebSocket、高并发 | 较陡 |
| Sanic | 异步框架 | 类Flask语法、异步优先 | 很高 | 高并发API服务 | 中等 |
| Pyramid | 灵活框架 | 高度可定制 | 中等 | 大型应用、需要灵活定制 | 较陡 |

### 1.2 框架详细介绍

**Django - "完美主义者的Web框架"**

\`\`\`python
# Django示例：开箱即用的功能
# settings.py 中只需配置即可获得：
# - ORM数据库操作
# - Admin后台管理
# - 用户认证系统
# - 表单验证
# - CSRF保护
# - 缓存框架
# - 邮件发送
# - 国际化

# models.py - 定义数据模型
from django.db import models
from django.contrib.auth.models import User

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    published = models.BooleanField(default=False)

# admin.py - 自动生成后台
from django.contrib import admin
from .models import Article

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'created_at', 'published']
    list_filter = ['published', 'created_at']
    search_fields = ['title']
\`\`\`

Django优势：
-  Batteries included（电池齐全），功能完备
-  Admin后台自动生成，快速开发
-  ORM强大，支持多种数据库
-  社区活跃，文档完善，生态丰富
-  适合快速开发复杂的数据库驱动网站

Django劣势：
-  重量级，灵活度较低
-  异步支持不如FastAPI
-  API开发不如FastAPI方便

---

**Flask - "微框架"**

\`\`\`python
# Flask示例：轻量灵活
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
db = SQLAlchemy(app)
login_manager = LoginManager(app)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user:
        login_user(user)
        return jsonify({'code': 0, 'msg': '登录成功'})
    return jsonify({'code': -1, 'msg': '用户名或密码错误'}), 401

if __name__ == '__main__':
    app.run(debug=True)
\`\`\`

Flask优势：
- 轻量级，核心简单
- 高度灵活，按需选择插件
- 学习曲线平缓，上手快
- 适合中小型项目和API

Flask劣势：
- 很多功能需要自己选择插件集成
- 大型项目需要自己做架构决策
- 异步支持有限（2.0+开始支持）

---

**FastAPI - "现代、快速的API框架"**

\`\`\`python
# FastAPI示例：现代Python特性
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio

app = FastAPI(title="用户管理API", version="1.0")

class UserCreate(BaseModel):
    username: str
    email: str
    age: Optional[int] = None

class User(UserCreate):
    id: int

# 自动生成OpenAPI文档：http://localhost:8000/docs
@app.post("/api/users/", response_model=User, summary="创建用户")
async def create_user(user: UserCreate):
    """创建新用户，自动校验参数"""
    # 异步数据库操作（示例）
    await asyncio.sleep(0.1)
    return {"id": 1, **user.dict()}

@app.get("/api/users/{user_id}", response_model=User, summary="获取用户")
async def get_user(user_id: int):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="无效的用户ID")
    return {"id": user_id, "username": "tom", "email": "tom@example.com"}

# 依赖注入
async def get_db():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/items/")
async def list_items(db = Depends(get_db)):
    return db.query(Item).all()
\`\`\`

FastAPI优势：
- 性能极高，接近NodeJS/Go
- 原生异步支持（async/await）
- 自动生成Swagger/ReDoc文档
- 基于Pydantic的类型校验
- 依赖注入，开发效率高
- Python类型提示，IDE支持好

FastAPI劣势：
- 相对较新，生态不如Django/Flask成熟
- 不是全栈框架，没有Admin等内置功能
- 异步编程有学习成本

---

## 二、WSGI与ASGI

### 2.1 WSGI（Web Server Gateway Interface）

WSGI是Python Web服务器和Web应用之间的标准接口。

\`\`\`
用户 → Nginx → uWSGI/Gunicorn → Flask/Django（WSGI应用）
\`\`\`

WSGI是同步接口，一个请求一个线程/进程，不支持异步。

\`\`\`python
# 最简单的WSGI应用示例
def simple_app(environ, start_response):
    """
    environ: 包含请求信息的字典
    start_response: 发送响应状态和头部的回调函数
    """
    status = '200 OK'
    headers = [('Content-Type', 'text/plain; charset=utf-8')]
    start_response(status, headers)
    
    method = environ['REQUEST_METHOD']
    path = environ['PATH_INFO']
    return [f'Hello WSGI! {method} {path}'.encode('utf-8')]

# 使用wsgiref运行
from wsgiref.simple_server import make_server

with make_server('', 8000, simple_app) as httpd:
    print("WSGI服务器运行在 http://localhost:8000")
    httpd.serve_forever()
\`\`\`

常见WSGI服务器：
- **Gunicorn**：推荐用于生产，易配置，支持多种worker
- **uWSGI**：功能丰富，性能好但配置复杂
- **wsgiref**：Python内置，仅用于开发

### 2.2 ASGI（Asynchronous Server Gateway Interface）

ASGI是WSGI的异步继任者，支持异步、WebSocket、HTTP/2。

\`\`\`
用户 → Nginx → Uvicorn/Hypercorn → FastAPI/Starlette（ASGI应用）
\`\`\`

\`\`\`python
# 最简单的ASGI应用示例
import asyncio

async def app(scope, receive, send):
    """
    scope: 连接信息（类型、路径、头部等）
    receive: 接收消息的异步函数
    send: 发送消息的异步函数
    """
    if scope['type'] == 'http':
        await send({
            'type': 'http.response.start',
            'status': 200,
            'headers': [(b'content-type', b'text/plain; charset=utf-8')],
        })
        await send({
            'type': 'http.response.body',
            'body': f'Hello ASGI! {scope["path"]}'.encode('utf-8'),
        })
    elif scope['type'] == 'websocket':
        await send({'type': 'websocket.accept'})
        while True:
            msg = await receive()
            if msg['type'] == 'websocket.receive':
                text = msg.get('text', '')
                await send({'type': 'websocket.send', 'text': f'Echo: {text}'})
            elif msg['type'] == 'websocket.disconnect':
                break
\`\`\`

常见ASGI服务器：
- **Uvicorn**：基于uvloop和httptools，性能很高
- **Hypercorn**：支持HTTP/2
- **Daphne**：Django Channels官方服务器

### 2.3 WSGI vs ASGI对比

| 特性 | WSGI | ASGI |
|------|------|------|
| 同步/异步 | 仅同步 | 同步+异步 |
| HTTP版本 | HTTP/1.1 | HTTP/1.1 + HTTP/2 |
| WebSocket | 不支持 | 原生支持 |
| 并发模型 | 多线程/多进程 | 异步IO + 多进程 |
| 代表框架 | Django、Flask | FastAPI、Starlette |
| 代表服务器 | Gunicorn、uWSGI | Uvicorn、Hypercorn |
| 性能 | 较好 | 更高（高并发场景） |

---

## 三、框架选择指南

### 3.1 根据场景选择

| 场景 | 推荐框架 | 理由 |
|------|---------|------|
| 内容网站/CMS/电商 | Django | Admin、ORM、权限系统开箱即用 |
| 快速原型/MVP | Flask | 轻量灵活，快速上手 |
| 高性能API/微服务 | FastAPI | 异步高性能，自动文档 |
| WebSocket/实时应用 | FastAPI/Tornado | 原生支持异步和WebSocket |
| 机器学习模型接口 | FastAPI | 高性能，类型校验，自动文档 |
| 大型企业应用 | Django/Pyramid | 成熟稳定，生态完善 |

### 3.2 2024年技术选型建议

1. **新项目API优先选FastAPI**：性能好、开发效率高、是未来趋势
2. **需要Admin后台选Django**：Django Admin可以节省大量开发时间
3. **简单项目选Flask**：足够灵活，学习成本低
4. **异步需求选ASGI生态**：FastAPI + Uvicorn

---

## 四、Web服务器部署架构

### 4.1 经典部署架构

\`\`\`
                    ┌─────────────────┐
                    │     用户请求     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Nginx (反向代理) │ ← 处理静态文件、SSL、负载均衡
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐ ┌──────▼──────┐ ┌─────▼──────┐
     │  Gunicorn   │ │  Gunicorn   │ │  Uvicorn   │ ← App Server
     │  (Django)   │ │  (Flask)    │ │  (FastAPI) │
     └────────┬────┘ └──────┬──────┘ └─────┬──────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │  PostgreSQL/MySQL │ ← 数据库
                    └─────────────────┘
                    ┌─────────────────┐
                    │      Redis      │ ← 缓存
                    └─────────────────┘
\`\`\`

\`\`\`python
# Gunicorn启动示例
# gunicorn -w 4 -b 127.0.0.1:8000 myapp.wsgi:application
# -w 4: 4个worker进程（建议CPU核数*2+1）
# -b: 绑定地址
# --worker-class uvicorn.workers.UvicornWorker # 用Uvicorn跑ASGI

# Uvicorn启动示例
# uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
\`\`\`

\`\`\`nginx
# Nginx配置示例
server {
    listen 80;
    server_name example.com;
    
    location /static/ {
        alias /path/to/static/;  # Nginx直接处理静态文件
        expires 30d;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;  # 反向代理到应用服务器
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
\`\`\`

---

## 五、常见面试题

### Django、Flask、FastAPI各有什么特点？怎么选？

Django大而全，适合需要Admin、ORM等完整功能的项目；Flask轻量灵活，适合中小型项目；FastAPI现代高性能，支持异步和自动文档，是API开发的首选。

### WSGI和ASGI的区别？

WSGI是同步接口，一个请求一个线程，不支持WebSocket；ASGI支持异步和WebSocket，并发能力更强，是未来方向。FastAPI用ASGI，Django/Flask传统上用WSGI。

### Gunicorn和Uvicorn的区别？

Gunicorn是WSGI服务器，用于Django/Flask；Uvicorn是ASGI服务器，用于FastAPI。Gunicorn也可以用uvicorn-worker类来跑ASGI应用。

---

## 六、本章小结

- Django全栈适合内容网站，Flask轻量灵活，FastAPI现代高性能
- WSGI是同步标准，ASGI支持异步和WebSocket
- 新项目API推荐FastAPI，需要Admin选Django
- Nginx + Gunicorn/Uvicorn是经典部署架构
`
  },
  {
    id: "pyb-1-5",
    group: "Web基础入门",
    icon: "🌐",
    title: "开发环境搭建",
    content: `

# 开发环境搭建

## 一、Python版本管理：pyenv

系统自带的Python版本通常较旧，且不同项目可能需要不同Python版本，pyenv可以管理多个Python版本。

### 1.1 pyenv安装与使用

macOS安装：
\`\`\`bash
brew install pyenv
\`\`\`

Linux安装：
\`\`\`bash
curl https://pyenv.run | bash
\`\`\`

配置环境变量（~/.zshrc或~/.bashrc）：
\`\`\`bash
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
\`\`\`

常用命令：
\`\`\`bash
pyenv install --list           # 查看可安装的Python版本
pyenv install 3.11.5          # 安装Python 3.11.5
pyenv versions                # 查看已安装的版本
pyenv global 3.11.5           # 设置全局Python版本
pyenv local 3.10.13           # 当前目录设置版本（生成.python-version文件）
pyenv shell 3.9.18            # 当前shell会话设置版本
\`\`\`

### 1.2 .python-version文件

在项目根目录创建.python-version文件，pyenv会自动切换版本：
\`\`\`
3.11.5
\`\`\`

---

## 二、虚拟环境管理

虚拟环境可以隔离不同项目的依赖，避免版本冲突。

### 2.1 venv（Python内置）

venv是Python 3.3+内置的虚拟环境工具，无需额外安装。

\`\`\`bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\\Scripts\\activate

# 激活后命令行前面会显示 (venv)
# 安装依赖包
pip install flask requests

# 导出依赖
pip freeze > requirements.txt

# 安装依赖
pip install -r requirements.txt

# 退出虚拟环境
deactivate
\`\`\`

### 2.2 poetry（推荐现代方案）

poetry是现代化的Python依赖管理和打包工具，类似npm/yarn。

安装：
\`\`\`bash
curl -sSL https://install.python-poetry.org | python3 -
\`\`\`

使用：
\`\`\`bash
# 初始化新项目（创建pyproject.toml）
poetry new myproject
cd myproject

# 或在已有项目初始化
poetry init

# 添加依赖（自动管理版本，写入pyproject.toml）
poetry add flask
poetry add pytest --group dev  # 开发依赖

# 安装所有依赖
poetry install

# 进入虚拟环境shell
poetry shell

# 在虚拟环境中运行命令
poetry run python app.py
poetry run pytest

# 更新依赖
poetry update flask

# 查看依赖树
poetry show --tree
\`\`\`

pyproject.toml示例：
\`\`\`toml
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = "My Python Web Project"
authors = ["Your Name <you@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
flask = "^3.0"
sqlalchemy = "^2.0"
redis = "^5.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.0"
black = "^23.0"
flake8 = "^6.0"
\`\`\`

### 2.3 pipenv

pipenv结合了pip和virtualenv，使用Pipfile管理依赖。

\`\`\`bash
pip install pipenv
pipenv install flask        # 安装依赖
pipenv install pytest --dev # 开发依赖
pipenv shell                # 激活环境
pipenv run python app.py    # 运行命令
\`\`\`

### 2.4 虚拟环境方案对比

| 工具 | 依赖文件 | 锁定版本 | 依赖分离 | 打包发布 | 推荐度 |
|------|---------|---------|---------|---------|--------|
| venv + pip | requirements.txt | 手动freeze | 手动 | 不支持 | ⭐⭐⭐ |
| pipenv | Pipfile + Pipfile.lock | 自动 | 支持dev | 不支持 | ⭐⭐⭐ |
| poetry | pyproject.toml + poetry.lock | 自动 | 支持group | 支持 | ⭐⭐⭐⭐⭐ |

**推荐使用poetry**，功能最完善，是现代Python项目的标准选择。

---

## 三、IDE配置：VSCode与PyCharm

### 3.1 VSCode配置

安装以下扩展：
- Python（Microsoft官方）
- Pylance（类型检查）
- Black Formatter（代码格式化）
- isort（import排序）
- Python Indent（智能缩进）
- GitLens（Git增强）
- Thunder Client（API测试，类似Postman）

.vscode/settings.json推荐配置：
\`\`\`json
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "[python]": {
        "editor.tabSize": 4,
        "editor.defaultFormatter": "ms-python.black-formatter"
    },
    "files.exclude": {
        "**/__pycache__": true,
        "**/.pytest_cache": true,
        "**/*.pyc": true
    }
}
\`\`\`

### 3.2 PyCharm配置

PyCharm是Python专用IDE，功能强大：
- 智能代码补全和重构
- 内置调试器、测试运行器
- 数据库工具
- Git集成
- Docker支持
- REST Client（类似Postman）

**推荐配置**：
1. 配置Python解释器：Settings → Project → Python Interpreter
2. 启用Black格式化：安装black后，Settings → Tools → Black
3. 配置Flake8作为代码检查工具
4. 设置快捷键符合自己习惯

---

## 四、Docker入门

Docker可以容器化应用，确保开发、测试、生产环境一致。

### 4.1 Docker基础概念

- **镜像（Image）**：应用程序的只读模板，包含代码、运行时、依赖
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：定义如何构建镜像的文件
- **docker-compose**：定义和运行多容器应用

### 4.2 Dockerfile示例

为Flask应用编写Dockerfile：

\`\`\`dockerfile
# 使用官方Python镜像作为基础
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# 先复制依赖文件（利用Docker缓存）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制项目代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
\`\`\`

### 4.3 docker-compose示例

包含Web应用和Redis的docker-compose.yml：

\`\`\`yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - FLASK_ENV=development
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
    command: flask run --host=0.0.0.0 --port=8000

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
\`\`\`

常用Docker命令：
\`\`\`bash
docker build -t myapp .           # 构建镜像
docker run -p 8000:8000 myapp    # 运行容器
docker compose up -d             # 启动所有服务（后台）
docker compose logs -f web       # 查看日志
docker compose exec web bash     # 进入容器
docker compose down              # 停止并删除容器
\`\`\`

---

## 五、环境配置最佳实践

### 5.1 环境变量管理

使用.env文件管理环境变量，不要硬编码敏感信息：

\`\`\`bash
# .env文件（不要提交到Git！）
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret
\`\`\`

\`\`\`python
# config.py 使用python-dotenv加载环境变量
from dotenv import load_dotenv
import os

load_dotenv()  # 加载.env文件

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
class DevelopmentConfig(Config):
    DEBUG = True
    
class ProductionConfig(Config):
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
\`\`\`

确保.env加入.gitignore：
\`\`\`
# .gitignore
venv/
__pycache__/
*.pyc
.env
.env.local
*.db
.pytest_cache/
.idea/
.vscode/
dist/
build/
*.egg-info/
Dockerfile.dev
docker-compose.override.yml
\`\`\`

提供.env.example模板：
\`\`\`bash
# .env.example（提交到Git作为模板）
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=change-me-in-production
\`\`\`

### 5.2 requirements.txt分层

可以按环境拆分依赖：
\`\`\`
# requirements.txt（基础依赖）
flask==3.0.0
sqlalchemy==2.0.23
redis==5.0.1

# requirements-dev.txt（开发依赖）
-r requirements.txt
pytest==7.4.3
black==23.11.0
flake8==6.1.0
ipython==8.18.1

# requirements-prod.txt（生产依赖）
-r requirements.txt
gunicorn==21.2.0
psycopg2-binary==2.9.9
\`\`\`

安装：
\`\`\`bash
pip install -r requirements-dev.txt  # 开发环境
pip install -r requirements-prod.txt # 生产环境
\`\`\`

---

## 六、快速环境搭建脚本

可以写一个脚本自动化环境搭建：

\`\`\`bash
#!/bin/bash
# setup.sh - 一键搭建开发环境

set -e

echo "=== 创建虚拟环境 ==="
python3 -m venv venv
source venv/bin/activate

echo "=== 升级pip ==="
pip install --upgrade pip

echo "=== 安装依赖 ==="
pip install -r requirements-dev.txt

echo "=== 复制环境变量文件 ==="
if [ ! -f .env ]; then
    cp .env.example .env
    echo "已创建.env文件，请根据需要修改配置"
fi

echo "=== 初始化Git hooks ==="
pre-commit install 2>/dev/null || echo "pre-commit未安装，跳过"

echo "=== 环境搭建完成！==="
echo "激活虚拟环境: source venv/bin/activate"
echo "启动开发服务器: flask run"
\`\`\`

---

## 七、常见问题与坑点

### 7.1 常见坑点

1. **Mac上用pyenv安装Python报错**：需要先安装依赖 \`brew install openssl readline sqlite3 xz zlib\`
2. **虚拟环境激活后pip还是系统的**：检查是否正确激活，which pip确认路径
3. **Docker中pip安装慢**：配置国内镜像源
4. **M1/M2 Mac兼容性问题**：部分包需要arm64版本，或用--platform linux/amd64
5. **环境变量不生效**：确保.env在正确位置，load_dotenv()被调用

### 7.2 国内镜像源配置

pip国内镜像：
\`\`\`bash
# 临时使用
pip install flask -i https://pypi.tuna.tsinghua.edu.cn/simple

# 永久配置（~/.pip/pip.conf）
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
\`\`\`

poetry镜像配置：
\`\`\`bash
poetry source add tsinghua https://pypi.tuna.tsinghua.edu.cn/simple
\`\`\`

---

## 八、本章小结

- pyenv管理多个Python版本
- 推荐用poetry管理虚拟环境和依赖
- VSCode或PyCharm选一个顺手的IDE
- Docker保证环境一致性
- 用.env管理环境变量，不要硬编码敏感信息
- .gitignore配置好，不要提交不该提交的文件
`
  },
  {
    id: "pyb-1-6",
    group: "Web基础入门",
    icon: "🌐",
    title: "第一个Web应用",
    content: `

# 第一个Web应用

## 一、用socket原生实现HTTP服务器

理解Web框架本质的最好方式是从零实现一个HTTP服务器。

### 1.1 最简单的HTTP服务器

\`\`\`python
import socket

def handle_request(client_socket):
    """处理客户端请求"""
    # 接收请求数据
    request_data = client_socket.recv(4096).decode('utf-8')
    print("=" * 60)
    print("收到请求:")
    print(request_data[:500])
    print("=" * 60)
    
    # 解析请求行（第一行）
    lines = request_data.split('\\r\\n')
    request_line = lines[0]
    method, path, http_version = request_line.split(' ')
    
    print(f"方法: {method}")
    print(f"路径: {path}")
    
    # 构造HTTP响应
    if path == '/':
        body = """
        <html>
        <head><title>首页</title></head>
        <body>
            <h1>欢迎来到我的网站！</h1>
            <p><a href="/about">关于我们</a></p>
            <p><a href="/hello?name=Tom">打招呼</a></p>
        </body>
        </html>
        """
    elif path.startswith('/hello'):
        # 解析查询参数
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(path)
        params = parse_qs(parsed.query)
        name = params.get('name', ['Guest'])[0]
        body = f"<h1>Hello, {name}!</h1>"
    elif path == '/about':
        body = "<h1>关于我们</h1><p>这是一个用原生socket写的Web服务器</p>"
    else:
        body = "<h1>404 Not Found</h1><p>页面不存在</p>"
        status_line = "HTTP/1.1 404 Not Found\\r\\n"
        response = (
            status_line +
            "Content-Type: text/html; charset=utf-8\\r\\n" +
            f"Content-Length: {len(body.encode('utf-8'))}\\r\\n" +
            "Connection: close\\r\\n" +
            "\\r\\n" +
            body
        )
        client_socket.sendall(response.encode('utf-8'))
        client_socket.close()
        return
    
    # 200响应
    response = (
        "HTTP/1.1 200 OK\\r\\n"
        "Content-Type: text/html; charset=utf-8\\r\\n"
        f"Content-Length: {len(body.encode('utf-8'))}\\r\\n"
        "Connection: close\\r\\n"
        "\\r\\n"
        f"{body}"
    )
    
    client_socket.sendall(response.encode('utf-8'))
    client_socket.close()

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(('127.0.0.1', 8000))
    server_socket.listen(5)
    print("服务器启动在 http://127.0.0.1:8000")
    
    while True:
        client_socket, addr = server_socket.accept()
        print(f"\\n新连接来自: {addr}")
        handle_request(client_socket)

if __name__ == '__main__':
    main()
\`\`\`

### 1.2 HTTP响应格式要点

一个HTTP响应必须包含：
1. **状态行**：\`HTTP/1.1 200 OK\\r\\n\`
2. **响应头部**：每行一个头部，以\`\\r\\n\`结尾
3. **空行**：\`\\r\\n\`，分隔头部和体
4. **响应体**：实际内容

Content-Length头部必须正确，否则浏览器会等待数据或截断。

---

## 二、Web框架本质

从上面的例子可以看到，Web框架主要帮我们做这些事情：

1. **Socket封装**：不用直接处理socket监听和连接
2. **请求解析**：解析HTTP请求行、头部、请求体、查询参数
3. **路由分发**：根据URL和方法找到对应的处理函数
4. **响应构造**：方便地构造HTTP响应
5. **中间件**：请求前后的通用处理（如日志、认证）
6. **上下文管理**：request/session等全局可访问
7. **异常处理**：统一的错误处理

让我们实现一个微型框架来理解：

\`\`\`python
from wsgiref.simple_server import make_server
from urllib.parse import parse_qs
import re

class MiniFrame:
    def __init__(self):
        self.routes = []
    
    def route(self, path, methods=['GET']):
        """路由装饰器"""
        def decorator(func):
            # 支持路径参数 /users/<int:id>
            pattern = re.sub(r'<int:(\\w+)>', r'(?P<\\1>\\d+)', path)
            pattern = re.sub(r'<str:(\\w+)>', r'(?P<\\1>[^/]+)', pattern)
            pattern = f'^{pattern}$'
            self.routes.append((re.compile(pattern), methods, func))
            return func
        return decorator
    
    def __call__(self, environ, start_response):
        """WSGI应用接口"""
        path = environ['PATH_INFO']
        method = environ['REQUEST_METHOD']
        
        # 查找路由
        for pattern, methods, handler in self.routes:
            match = pattern.match(path)
            if match and method in methods:
                # 解析参数
                kwargs = match.groupdict()
                # 转换类型
                for k, v in kwargs.items():
                    if v.isdigit():
                        kwargs[k] = int(v)
                
                # 解析查询参数
                query_string = environ.get('QUERY_STRING', '')
                query_params = {k: v[0] for k, v in parse_qs(query_string).items()}
                
                # 解析POST表单
                form_data = {}
                if method == 'POST':
                    content_length = int(environ.get('CONTENT_LENGTH', 0))
                    if content_length > 0:
                        post_data = environ['wsgi.input'].read(content_length).decode('utf-8')
                        form_data = {k: v[0] for k, v in parse_qs(post_data).items()}
                
                # 构造request对象
                request = {
                    'method': method,
                    'path': path,
                    'query': query_params,
                    'form': form_data,
                    'environ': environ
                }
                
                try:
                    # 调用处理函数
                    body = handler(request, **kwargs)
                    if isinstance(body, dict):
                        # JSON响应
                        import json
                        body = json.dumps(body, ensure_ascii=False)
                        content_type = 'application/json; charset=utf-8'
                    else:
                        content_type = 'text/html; charset=utf-8'
                    
                    status = '200 OK'
                    headers = [
                        ('Content-Type', content_type),
                        ('Content-Length', str(len(body.encode('utf-8'))))
                    ]
                except Exception as e:
                    status = '500 Internal Server Error'
                    body = f'<h1>500</h1><p>{str(e)}</p>'
                    headers = [('Content-Type', 'text/html; charset=utf-8')]
                
                start_response(status, headers)
                return [body.encode('utf-8')]
        
        # 404
        status = '404 Not Found'
        body = '<h1>404 Not Found</h1>'
        headers = [('Content-Type', 'text/html; charset=utf-8')]
        start_response(status, headers)
        return [body.encode('utf-8')]

# 使用我们的微型框架
app = MiniFrame()

@app.route('/')
def index(request):
    return """
    <h1>MiniFrame 微型框架</h1>
    <ul>
        <li><a href="/hello?name=World">打招呼</a></li>
        <li><a href="/users/123">用户详情</a></li>
    </ul>
    """

@app.route('/hello')
def hello(request):
    name = request['query'].get('name', 'Guest')
    return f'<h1>Hello, {name}!</h1>'

@app.route('/users/<int:user_id>')
def user_detail(request, user_id):
    return {
        'id': user_id,
        'username': f'user{user_id}',
        'email': f'user{user_id}@example.com'
    }

if __name__ == '__main__':
    with make_server('', 8000, app) as httpd:
        print("MiniFrame运行在 http://localhost:8000")
        httpd.serve_forever()
\`\`\`

---

## 三、Flask快速入门

Flask是轻量级Python Web框架，上手非常快。

### 3.1 安装与第一个应用

\`\`\`bash
pip install flask
\`\`\`

\`\`\`python
# app.py
from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash

app = Flask(__name__)
app.secret_key = 'dev-key-change-in-production'

# 模拟数据库
users = {
    1: {'id': 1, 'name': 'Tom', 'age': 25},
    2: {'id': 2, 'name': 'Jerry', 'age': 30},
}

# 路由和视图函数
@app.route('/')
def index():
    return '<h1>Hello Flask!</h1><p><a href="/users">用户列表</a></p>'

@app.route('/hello')
def hello():
    name = request.args.get('name', 'World')
    return f'Hello, {name}!'

# 返回JSON
@app.route('/api/users')
def api_users():
    return jsonify(list(users.values()))

@app.route('/api/users/<int:user_id>')
def api_user_detail(user_id):
    user = users.get(user_id)
    if not user:
        return jsonify({'error': '用户不存在'}), 404
    return jsonify(user)

# POST请求
@app.route('/api/users', methods=['POST'])
def api_create_user():
    data = request.get_json()
    new_id = max(users.keys()) + 1
    user = {
        'id': new_id,
        'name': data['name'],
        'age': data.get('age', 0)
    }
    users[new_id] = user
    return jsonify(user), 201

# 动态路由
@app.route('/users/<int:user_id>')
def user_detail(user_id):
    user = users.get(user_id)
    if not user:
        return '用户不存在', 404
    return f"<h1>{user['name']}</h1><p>年龄: {user['age']}</p>"

if __name__ == '__main__':
    app.run(debug=True, port=8000)
\`\`\`

运行：
\`\`\`bash
flask run
# 或
python app.py
\`\`\`

访问 http://localhost:8000 即可看到应用。

### 3.2 Flask常用功能

**获取请求数据**：
\`\`\`python
from flask import request

@app.route('/submit', methods=['GET', 'POST'])
def submit():
    # GET查询参数
    page = request.args.get('page', 1, type=int)
    
    # POST表单数据
    username = request.form.get('username')
    
    # JSON数据
    data = request.get_json()
    
    # 请求头
    token = request.headers.get('Authorization')
    
    # 文件上传
    f = request.files.get('avatar')
    if f:
        f.save(f'uploads/{f.filename}')
    
    # Cookie
    visited = request.cookies.get('visited', '0')
    
    return 'OK'
\`\`\`

**响应操作**：
\`\`\`python
from flask import make_response, redirect, url_for, abort

@app.route('/demo')
def demo():
    # 设置Cookie
    resp = make_response('Hello')
    resp.set_cookie('visited', '1', max_age=3600)
    resp.headers['X-Custom-Header'] = 'value'
    return resp

# 重定向
@app.route('/old-page')
def old_page():
    return redirect(url_for('index'))

# 抛出错误
@app.route('/admin')
def admin():
    if not session.get('is_admin'):
        abort(403)
    return 'Admin Page'

# 自定义错误页面
@app.errorhandler(404)
def page_not_found(e):
    return '<h1>页面走丢了</h1>', 404
\`\`\`

---

## 四、FastAPI快速入门

FastAPI是现代、高性能的API框架。

\`\`\`bash
pip install fastapi uvicorn
\`\`\`

\`\`\`python
# main.py
from fastapi import FastAPI, HTTPException, Query, Path, Depends
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

app = FastAPI(title="用户管理API", version="1.0")

# Pydantic模型：自动校验和文档
class UserCreate(BaseModel):
    name: str
    age: int = Query(ge=0, le=150)
    email: Optional[str] = None

class User(UserCreate):
    id: int

# 模拟数据库
users_db = {
    1: {"id": 1, "name": "Tom", "age": 25, "email": "tom@example.com"},
    2: {"id": 2, "name": "Jerry", "age": 30, "email": "jerry@example.com"},
}

@app.get("/", summary="首页")
def root():
    return {"message": "Hello FastAPI!", "docs": "/docs"}

# 路径参数和查询参数
@app.get("/api/users", response_model=List[User], summary="获取用户列表")
def list_users(
    page: int = Query(1, ge=1, description="页码"),
    size: int = Query(10, ge=1, le=100, description="每页数量"),
    keyword: Optional[str] = Query(None, description="搜索关键词")
):
    users = list(users_db.values())
    start = (page - 1) * size
    return users[start:start + size]

@app.get("/api/users/{user_id}", response_model=User, summary="获取用户详情")
def get_user(user_id: int = Path(..., ge=1, description="用户ID")):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    return user

@app.post("/api/users", response_model=User, status_code=201, summary="创建用户")
def create_user(user: UserCreate):
    new_id = max(users_db.keys()) + 1
    new_user = {"id": new_id, **user.dict()}
    users_db[new_id] = new_user
    return new_user

@app.put("/api/users/{user_id}", response_model=User, summary="更新用户")
def update_user(user_id: int, user: UserCreate):
    if user_id not in users_db:
        raise HTTPException(404, "用户不存在")
    users_db[user_id].update(user.dict())
    return users_db[user_id]

@app.delete("/api/users/{user_id}", summary="删除用户")
def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(404, "用户不存在")
    del users_db[user_id]
    return {"message": "删除成功"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
\`\`\`

运行：
\`\`\`bash
uvicorn main:app --reload
\`\`\`

访问：
- http://localhost:8000 - 首页
- http://localhost:8000/docs - Swagger自动文档（交互测试）
- http://localhost:8000/redoc - ReDoc文档

---

## 五、第一个项目结构建议

Flask项目推荐结构：

\`\`\`
myapp/
├── app/
│   ├── __init__.py      # 应用工厂
│   ├── models/          # 数据模型
│   │   ├── __init__.py
│   │   └── user.py
│   ├── routes/          # 路由/蓝图
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── user.py
│   ├── services/        # 业务逻辑层
│   ├── templates/       # Jinja2模板
│   └── static/          # 静态文件
├── migrations/          # 数据库迁移
├── tests/               # 测试
├── config.py            # 配置
├── requirements.txt
└── run.py               # 启动入口
\`\`\`

---

## 六、常见面试题

### Web框架的本质是什么？帮我们做了哪些事？

Web框架封装了HTTP协议处理，主要功能包括：路由分发、请求解析、响应构造、中间件、模板引擎、数据库集成等，让开发者不用处理底层socket和HTTP细节，专注于业务逻辑。

### Flask和Django的区别？

Flask是微框架，轻量灵活，需要自己选择ORM、表单验证等组件；Django是全栈框架，ORM、Admin、认证、表单等功能开箱即用。Flask适合小项目和API，Django适合复杂的数据库驱动网站。

---

## 七、本章小结

- 用socket实现HTTP服务器能帮助理解Web本质
- Web框架核心是路由、请求解析、响应构造
- WSGI/ASGI是Python Web服务器和应用的标准接口
- Flask轻量灵活，FastAPI现代高性能
- 访问/docs可以看到FastAPI自动生成的Swagger文档
`
  },
  {
    id: "pyb-1-7",
    group: "Web基础入门",
    icon: "🌐",
    title: "Web开发工具链",
    content: `

# Web开发工具链

## 一、Git版本控制

Git是现代软件开发必备的版本控制工具。

### 1.1 Git基本配置

\`\`\`bash
# 用户配置
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 配置默认编辑器
git config --global core.editor "code --wait"

# 配置别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"

# 查看配置
git config --list
\`\`\`

### 1.2 Git常用命令

**仓库初始化**：
\`\`\`bash
git init                    # 初始化新仓库
git clone <url>             # 克隆远程仓库
\`\`\`

**日常操作**：
\`\`\`bash
git status                  # 查看工作区状态
git add .                   # 暂存所有修改
git add <file>              # 暂存指定文件
git commit -m "feat: 新增用户登录功能"  # 提交
git commit --amend          # 修改最后一次提交
\`\`\`

**分支操作**：
\`\`\`bash
git branch                  # 查看本地分支
git branch -a               # 查看所有分支（包括远程）
git checkout -b feature/login  # 创建并切换分支
git switch -c feature/login   # 新版Git推荐
git merge feature/login     # 合并分支到当前分支
git branch -d feature/login  # 删除已合并分支
\`\`\`

**远程操作**：
\`\`\`bash
git remote -v               # 查看远程仓库
git remote add origin <url> # 添加远程仓库
git push -u origin main     # 首次推送并设置上游
git push                    # 推送
git pull                    # 拉取并合并
git fetch                   # 拉取但不合并
\`\`\`

**查看历史**：
\`\`\`bash
git log                     # 查看提交历史
git log --oneline           # 简洁版历史
git diff                    # 查看未暂存的修改
git diff --cached           # 查看已暂存的修改
git show <commit-id>        # 查看某次提交的详情
\`\`\`

**撤销操作**：
\`\`\`bash
git checkout -- <file>      # 丢弃工作区修改
git reset HEAD <file>       # 取消暂存
git reset --hard HEAD~1     # 撤销最后一次提交（危险！）
git revert <commit-id>      # 创建新提交来撤销某次提交（安全）
git stash                   # 暂存当前工作区修改
git stash pop               # 恢复暂存的修改
\`\`\`

### 1.3 Git工作流

**Git Flow分支模型**：
- main：生产分支
- develop：开发分支
- feature/*：功能分支
- release/*：发布分支
- hotfix/*：紧急修复分支

**常用分支命名**：
\`\`\`
feature/user-auth      # 新功能
bugfix/login-error     # Bug修复
hotfix/security-patch  # 紧急线上修复
refactor/api-rewrite   # 重构
docs/api-docs          # 文档
\`\`\`

**Commit信息规范（Conventional Commits）**：
\`\`\`
feat: 新增用户登录功能
fix: 修复登录时密码加密问题
docs: 更新API文档
style: 格式化代码
refactor: 重构用户服务
test: 添加用户模块测试
chore: 更新依赖版本
\`\`\`

---

## 二、API调试工具

### 2.1 Postman / Apifox

Postman是流行的API调试工具，Apifox是国产替代品，功能更全面。

**主要功能**：
- 发送HTTP请求（GET/POST/PUT/DELETE等）
- 管理环境变量（开发/测试/生产）
- 接口文档生成
- 自动化测试
- Mock服务
- 团队协作

**使用技巧**：
1. 创建Collection按模块组织接口
2. 使用环境变量切换不同环境
3. 用Tests脚本自动提取token等变量
4. 导出Collection共享给团队

Tests脚本示例（自动保存token）：
\`\`\`javascript
// 登录成功后自动保存token
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("token", jsonData.data.token);
    }
}
\`\`\`

请求头自动添加token：
\`\`\`
Authorization: Bearer {{token}}
\`\`\`

### 2.2 VSCode扩展：Thunder Client

Thunder Client是VSCode内置的API测试工具，轻量方便：
- 无需切换窗口
- 类似Postman的界面
- 支持环境变量、Collection
- 免费

---

## 三、命令行调试工具

### 3.1 curl

curl是最常用的命令行HTTP客户端。

\`\`\`bash
# GET请求
curl https://httpbin.org/get
curl "https://httpbin.org/get?name=tom&age=25"

# 显示详细信息（-v）
curl -v https://httpbin.org/get

# POST请求（-X POST，-d发送数据）
curl -X POST https://httpbin.org/post \\
  -H "Content-Type: application/json" \\
  -d '{"username":"tom","password":"123"}'

# POST表单
curl -X POST https://httpbin.org/post \\
  -d "username=tom" \\
  -d "password=123"

# 带Cookie
curl -b "sessionid=abc123" https://httpbin.org/cookies

# 带Authorization头
curl -H "Authorization: Bearer token123" https://httpbin.org/headers

# 文件上传
curl -F "file=@test.txt" https://httpbin.org/post

# 下载文件
curl -O https://example.com/file.zip
curl -o custom-name.zip https://example.com/file.zip

# 只显示响应头（-I）
curl -I https://httpbin.org/get

# 忽略SSL证书验证（-k，测试环境用）
curl -k https://localhost:8000/api
\`\`\`

### 3.2 httpie（更友好的curl替代品）

httpie是更现代、更人性化的命令行HTTP客户端。

安装：
\`\`\`bash
pip install httpie
# macOS: brew install httpie
\`\`\`

使用：
\`\`\`bash
# GET请求
http https://httpbin.org/get name==tom age==25

# POST JSON（自动识别）
http POST https://httpbin.org/post username=tom password=123

# POST表单
http -f POST https://httpbin.org/post username=tom

# 带Header
http https://httpbin.org/headers Authorization:"Bearer token123"

# 下载文件
http --download https://example.com/file.zip
\`\`\`

输出带语法高亮，格式更易读。

---

## 四、浏览器开发者工具

Chrome DevTools是Web开发必备调试工具。

### 4.1 Network面板

按F12打开开发者工具，切换到Network面板：

**功能**：
- 查看所有网络请求（XHR/Fetch/JS/CSS/Img等）
- 查看请求和响应详情（Headers、Payload、Response）
- 分析请求耗时（Timing）
- 模拟慢速网络（Online → Fast 3G/Slow 3G/Offline）
- 重发请求（右键 → Replay XHR）
- 复制请求为cURL（右键 → Copy → Copy as cURL）

**Timing分析**：
- Queueing：排队时间
- DNS Lookup：DNS解析
- Initial connection：TCP连接
- SSL：TLS握手
- Request sent：请求发送
- Waiting (TTFB)：等待首字节（后端处理时间）
- Content Download：下载响应

**调试技巧**：
1. 勾选"Preserve log"保留跨页面请求
2. 勾选"Disable cache"禁用缓存
3. 用Filter过滤XHR请求只看API
4. 右键请求可以Block/Replay/Copy as cURL

### 4.2 其他常用面板

- **Console**：查看日志、执行JS代码
- **Elements**：查看和修改DOM/CSS
- **Application**：查看Cookie、LocalStorage、SessionStorage
- **Sources**：断点调试JS代码
- **Performance**：性能分析
- **Lighthouse**：网站质量审计

---

## 五、Python调试工具

### 5.1 pdb调试器

pdb是Python内置调试器。

\`\`\`python
import pdb

def calculate_total(price, quantity):
    pdb.set_trace()  # 设置断点
    subtotal = price * quantity
    tax = subtotal * 0.1
    total = subtotal + tax
    return total
\`\`\`

常用pdb命令：
\`\`\`
n (next)      执行下一行
s (step)      进入函数
c (continue)  继续执行直到下一个断点
l (list)      显示当前代码
p <var>       打印变量值
pp <var>      漂亮打印
q (quit)      退出调试
b <line>      设置断点
cl            清除断点
w (where)     显示调用栈
h (help)      帮助
\`\`\`

### 5.2 ipdb（更友好的pdb）

\`\`\`bash
pip install ipdb
\`\`\`

\`\`\`python
import ipdb; ipdb.set_trace()
# Python 3.7+ 可以用breakpoint()，设置PYTHONBREAKPOINT=ipdb.set_trace
\`\`\`

### 5.3 logging日志

打印日志比print更专业：

\`\`\`python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

logger.debug("调试信息")
logger.info("普通信息")
logger.warning("警告信息")
logger.error("错误信息")
logger.critical("严重错误")

# 记录异常
try:
    1 / 0
except ZeroDivisionError:
    logger.exception("除零错误")  # 自动包含堆栈信息
\`\`\`

---

## 六、其他实用工具

### 6.1 jq - JSON处理

jq是命令行JSON处理工具，搭配curl使用：

\`\`\`bash
# 格式化JSON输出
curl -s https://httpbin.org/get | jq

# 提取字段
curl -s https://api.github.com/users/torvalds | jq '.name, .bio'

# 过滤数组
curl -s https://jsonplaceholder.typicode.com/users | jq '.[] | select(.id > 5) | .name'
\`\`\`

### 6.2 httpbin.org - 测试用HTTP服务

httpbin.org提供各种测试端点：
- /get、/post、/put、/delete - 测试各种HTTP方法
- /status/500 - 返回指定状态码
- /headers - 返回请求头
- /cookies - Cookie测试
- /delay/3 - 延迟响应（测试超时）
- /ip - 返回客户端IP

### 6.3 ngrok - 内网穿透

开发时需要外网访问本地服务（如微信支付回调），用ngrok：
\`\`\`bash
ngrok http 8000
# 会得到一个https://xxx.ngrok.io的公网地址，映射到本地8000端口
\`\`\`

---

## 七、本章小结

- Git是必备技能，熟练掌握常用命令和工作流
- Postman/Apifox是API调试的主力工具
- curl/httpie用于命令行快速测试
- 浏览器Network面板是调试Web问题的利器
- pdb/ipdb用于Python代码调试
- logging比print更专业
`
  },
  {
    id: "pyb-1-8",
    group: "Web基础入门",
    icon: "🌐",
    title: "Python Web开发规范",
    content: `

# Python Web开发规范

## 一、PEP8编码规范

PEP8是Python官方的代码风格指南，遵循PEP8让代码更易读、更统一。

### 1.1 代码布局

**缩进**：使用4个空格，不要用Tab。

\`\`\`python
# 正确
def foo():
    x = 1
    if x:
        print("hello")

# 错误（混用Tab和空格）
def foo():
	  x = 1  # Tab
    if x:   # 空格
        print("hello")
\`\`\`

**行长度**：每行不超过79个字符，文档字符串/注释不超过72字符。

\`\`\`python
# 长行换行：括号内隐式换行
def long_function_name(
        var_one, var_two, var_three,
        var_four):
    print(var_one)

# 或使用反斜杠（不推荐）
from very_long_module_name import \\
    something1, something2, something3

# 字符串拼接
long_string = (
    "这是一段很长的字符串，"
    "我们可以用括号把它分成多行，"
    "Python会自动拼接。"
)
\`\`\`

**空行**：
- 顶级函数和类定义之间空两行
- 类内方法定义之间空一行
- 函数内逻辑块之间可以空一行分隔

\`\`\`python
class MyClass:


    def __init__(self):
        self.value = 0


    def method_one(self):
        pass


    def method_two(self):
        pass



def top_level_function():
    pass
\`\`\`

**import顺序**：标准库 → 第三方库 → 本地库，每组之间空一行。

\`\`\`python
# 标准库
import os
import sys
from collections import defaultdict

# 第三方库
import flask
import requests
from flask import Flask, request

# 本地应用/库
from myapp import db
from myapp.models import User
\`\`\`

### 1.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量/函数 | 小写+下划线 | user_name, get_user() |
| 常量 | 全大写+下划线 | MAX_RETRIES, DEFAULT_TIMEOUT |
| 类名 | 大驼峰 | UserService, MyClass |
| 方法 | 小写+下划线 | get_by_id() |
| 私有属性/方法 | 单下划线开头 | _internal_method() |
| 魔术方法 | 双下划线包裹 | __init__, __str__ |
| 模块/包 | 短小写 | models.py, user_service.py |

\`\`\`python
# 正确示例
MAX_CONNECTIONS = 100

class UserProfile:

    def __init__(self, first_name, last_name):
        self.first_name = first_name
        self.last_name = last_name
        self._internal_cache = {}

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def _calculate_score(self):
        pass

# 错误示例
class user_profile:  # 类名应大驼峰
    def GetFullName(self):  # 方法应小写下划线
        pass

userName = "Tom"  # 变量应下划线
\`\`\`

### 1.3 表达式和语句

\`\`\`python
# 布尔比较：直接用隐式False
if users:  # 好
    ...
if len(users) > 0:  # 不好
    ...

if not user:  # 好
    ...
if user is None:  # None比较用is
    ...

# 字符串前缀一致性
name = "Tom"  # 统一用双引号或单引号，保持一致

# 避免单行复合语句
if is_valid:
    do_something()  # 好

if is_valid: do_something()  # 不好
\`\`\`

### 1.4 工具：black + isort + flake8

使用自动化工具保证代码规范：

\`\`\`bash
pip install black isort flake8

# black：自动格式化代码
black app.py
black .  # 格式化整个目录

# isort：自动排序import
isort app.py
isort .

# flake8：检查代码问题
flake8 app.py
\`\`\`

可以配置pre-commit在提交前自动检查：

\`\`\`yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
      - id: black
  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
\`\`\`

---

## 二、项目目录结构规范

### 2.1 Flask项目结构

**小型项目（单文件或简单结构）**：
\`\`\`
myapp/
├── app.py              # 应用入口
├── config.py           # 配置
├── requirements.txt    # 依赖
├── static/             # 静态文件
│   ├── css/
│   └── js/
└── templates/          # 模板
    └── index.html
\`\`\`

**中大型项目（推荐结构）**：
\`\`\`
myapp/
├── instance/           # 实例配置（不提交Git）
│   └── config.py
├── migrations/         # 数据库迁移
├── tests/              # 测试
│   ├── __init__.py
│   ├── conftest.py     # pytest配置
│   ├── test_auth.py
│   └── test_user.py
├── myapp/              # 应用包
│   ├── __init__.py     # 应用工厂
│   ├── extensions.py   # 扩展初始化（db, migrate等）
│   ├── config.py       # 配置类
│   ├── models/         # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── post.py
│   ├── blueprints/     # 蓝图（路由）
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── users.py
│   │       └── posts.py
│   ├── services/       # 业务逻辑层
│   │   ├── user_service.py
│   │   └── auth_service.py
│   ├── utils/          # 工具函数
│   │   ├── __init__.py
│   │   ├── decorators.py
│   │   └── validators.py
│   ├── templates/      # Jinja2模板
│   │   ├── base.html
│   │   └── auth/
│   └── static/         # 静态文件
├── .env                # 环境变量（不提交）
├── .env.example        # 环境变量模板
├── .gitignore
├── requirements.txt
├── requirements-dev.txt
├── pyproject.toml      # 项目配置（black/isort/pytest等）
└── wsgi.py             # WSGI入口（Gunicorn用）
\`\`\`

**应用工厂示例**：
\`\`\`python
# myapp/__init__.py
from flask import Flask
from .extensions import db, migrate, login_manager

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # 加载配置
    from .config import config
    app.config.from_object(config[config_name])
    
    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    
    # 注册蓝图
    from .blueprints.auth import auth_bp
    from .blueprints.api.users import users_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp, url_prefix='/api/v1')
    
    return app
\`\`\`

### 2.2 FastAPI项目结构

\`\`\`
myapp/
├── alembic/            # 数据库迁移
├── tests/
├── app/
│   ├── __init__.py
│   ├── main.py         # FastAPI入口
│   ├── core/           # 核心配置
│   │   ├── config.py   # 配置
│   │   ├── security.py # 安全相关
│   │   └── deps.py     # 依赖注入
│   ├── api/            # API路由
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── endpoints/
│   │       │   ├── users.py
│   │       │   └── auth.py
│   │       └── router.py
│   ├── models/         # SQLAlchemy模型
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/        # Pydantic模型
│   │   ├── __init__.py
│   │   └── user.py
│   ├── crud/           # 数据库操作
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services/       # 业务逻辑
│   └── db/             # 数据库配置
│       ├── base.py
│       └── session.py
├── .env
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── pyproject.toml
\`\`\`

---

## 三、命名规范最佳实践

### 3.1 变量命名

\`\`\`python
# 好的命名：描述性强，看名知意
user_id = 123
is_active = True
has_permission = False
total_amount = 99.99
retry_count = 3
elapsed_time_ms = 1500

# 不好的命名：模糊、缩写过多
uid = 123
flag = True
a = 99.99
tmp = 1500

# 布尔值用is/has/can/should前缀
is_valid = True
has_access = False
can_edit = True
should_retry = False

# 集合用复数形式
users = [{"id": 1}, {"id": 2}]
user_ids = [1, 2, 3]
user_map = {1: "Tom", 2: "Jerry"}  # 字典可以用_map后缀
\`\`\`

### 3.2 函数命名

\`\`\`python
# 动词开头，描述做什么
def get_user_by_id(user_id: int) -> Optional[User]:
    """根据ID获取用户"""
    pass

def create_user(data: UserCreate) -> User:
    """创建用户"""
    pass

def calculate_order_total(order: Order) -> Decimal:
    """计算订单总价"""
    pass

def is_valid_email(email: str) -> bool:
    """验证邮箱是否有效"""
    pass

# 不好的命名
def user(uid):  # 看不出是获取还是创建
    pass

def do_stuff():  # 做什么？
    pass
\`\`\`

### 3.3 API URL命名

RESTful API URL用名词复数，不用动词：

\`\`\`
# 好
GET    /api/v1/users          # 获取用户列表
GET    /api/v1/users/123      # 获取单个用户
POST   /api/v1/users          # 创建用户
PUT    /api/v1/users/123      # 更新用户
DELETE /api/v1/users/123      # 删除用户

GET    /api/v1/users/123/orders  # 获取用户的订单

# 不好
/getUser                      # 用动词
/api/user                     # 单数
/create_user                  # 动词在URL
\`\`\`

---

## 四、代码注释与文档

### 4.1 注释原则

1. **代码即文档**：好的命名和结构不需要过多注释
2. **为什么，而不是做什么**：注释解释原因和意图，而不是代码在做什么
3. **避免过时注释**：修改代码时记得更新注释
4. **公共API必须有文档字符串**

\`\`\`python
# 不好：注释描述代码在做什么
# x加1
x = x + 1

# 好：如果需要，解释为什么
x = x + 1  # 补偿边界条件

# 好：复杂算法可以解释思路
# 使用二分查找快速定位（数据已排序）
index = binary_search(sorted_list, target)
\`\`\`

### 4.2 文档字符串（Docstring）

使用Google风格或NumPy风格的文档字符串：

\`\`\`python
from typing import List, Optional

def get_users(
    page: int = 1,
    size: int = 10,
    keyword: Optional[str] = None
) -> List[dict]:
    """获取用户列表，支持分页和搜索。

    Args:
        page: 页码，从1开始，默认为1
        size: 每页数量，默认10，最大100
        keyword: 搜索关键词，按用户名模糊匹配，None表示不搜索

    Returns:
        用户列表，每个用户包含id、username、email、created_at字段

    Raises:
        ValueError: page或size超出有效范围

    Examples:
        >>> users = get_users(page=1, size=20)
        >>> len(users) <= 20
        True
    """
    if page < 1:
        raise ValueError("page must be >= 1")
    if not 1 <= size <= 100:
        raise ValueError("size must be between 1 and 100")
    # ... 实现
    return []
\`\`\`

**类文档字符串**：
\`\`\`python
class UserService:
    """用户服务，提供用户相关的业务逻辑。

    处理用户的CRUD操作、密码加密、权限验证等。
    使用前需要调用init_app初始化数据库连接。

    Attributes:
        db: 数据库会话对象
        cache: Redis缓存客户端
    """

    def __init__(self, db_session, cache_client):
        self.db = db_session
        self.cache = cache_client
\`\`\`

**模块文档字符串**：
\`\`\`python
"""用户认证模块。

提供登录、注册、JWT令牌签发和验证等功能。
依赖redis存储token黑名单。

Example usage:
    auth_service = AuthService()
    token = auth_service.login(username, password)
"""
\`\`\`

### 4.3 类型提示（Type Hints）

Python 3.5+支持类型提示，提高代码可读性，便于IDE补全和静态检查。

\`\`\`python
from typing import List, Dict, Optional, Union, Callable, Any

# 基本类型
name: str = "Tom"
age: int = 25
price: float = 99.99
is_active: bool = True

# 容器类型
user_ids: List[int] = [1, 2, 3]
user_map: Dict[str, int] = {"Tom": 1, "Jerry": 2}

# Optional：可能为None
user: Optional[dict] = None

# Union：多种类型
id_value: Union[int, str] = 123

# 函数类型
Callback = Callable[[int, int], int]
def apply_operation(x: int, y: int, op: Callback) -> int:
    return op(x, y)

# 返回None的函数
def log(message: str) -> None:
    print(message)

# 类作为类型
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str

def get_user(user_id: int) -> Optional[User]:
    pass

# 使用mypy进行静态类型检查
# pip install mypy
# mypy app.py
\`\`\`

---

## 五、常见坑点与最佳实践

### 5.1 常见坑点

1. **不要使用可变默认参数**：
\`\`\`python
# 错误！默认列表在函数定义时创建，多次调用共享同一个
def add_item(item, items=[]):
    items.append(item)
    return items

# 正确
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
\`\`\`

2. **异常不要裸except**：
\`\`\`python
# 不好：捕获所有异常包括KeyboardInterrupt
try:
    risky_operation()
except:
    pass

# 好：捕获具体异常
try:
    risky_operation()
except (ValueError, IOError) as e:
    logger.error(f"操作失败: {e}")
\`\`\`

3. **数据库连接和文件用with语句**：
\`\`\`python
# 好：自动关闭
with open('file.txt', 'r') as f:
    content = f.read()

# Flask中使用db
with app.app_context():
    user = User.query.get(1)
\`\`\`

4. **不要在循环中查询数据库（N+1问题）**：
\`\`\`python
# 不好：N+1查询
users = User.query.all()
for user in users:
    print(user.profile.avatar)  # 每个用户都查一次profile

# 好：预加载
users = User.query.options(joinedload('profile')).all()
\`\`\`

### 5.2 最佳实践

1. **函数保持简短**：一个函数只做一件事，不超过50行
2. **DRY原则**：Don't Repeat Yourself，重复代码提取为函数
3. **KISS原则**：Keep It Simple, Stupid，保持简单直接
4. **防御性编程**：验证外部输入，不相信任何用户输入
5. **早返回**：减少嵌套，提前返回异常情况
6. **日志充分**：关键操作记日志，方便排查问题
7. **单元测试**：核心逻辑要有测试覆盖

\`\`\`python
# 早返回示例
def get_user_orders(user_id: int, status: str = None):
    user = User.query.get(user_id)
    if not user:
        return None, "用户不存在"
    
    if not user.is_active:
        return None, "用户已禁用"
    
    query = Order.query.filter_by(user_id=user_id)
    
    if status:
        if status not in VALID_ORDER_STATUSES:
            return None, "无效的订单状态"
        query = query.filter_by(status=status)
    
    orders = query.all()
    return orders, None
\`\`\`

---

## 六、本章小结

- 遵循PEP8，用black/isort/flake8自动化检查
- 项目结构分层清晰：models/routes/services/utils
- 命名要描述性强，看名知意
- API用名词复数，RESTful风格
- 文档字符串解释公共API的用法
- 类型提示提高代码可读性和可维护性
- 避免可变默认参数、裸except等坑
- 写简短、单一职责的函数
`
  }
]
