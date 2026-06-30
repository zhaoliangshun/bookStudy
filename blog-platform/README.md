# Blog Platform —— 全栈教学项目

一个完整的博客平台，覆盖前后端 + 数据库的典型全栈知识点。

- **后端**：FastAPI + SQLAlchemy 2.0 + MySQL + JWT
- **前端**：Next.js 16 (App Router) + React 19
- **数据库**：MySQL 8.x / 9.x（账号 root / 密码 123456）

## 项目特色

- 📚 **教学导向**：每个文件、每个关键逻辑都有详细中文注释，解释「为什么这么做」
- 🔐 **JWT 认证全流程**：注册、登录、token 签发与校验、密码哈希、权限校验
- 📝 **完整 CRUD**：文章、评论、标签三大资源的增删改查
- 💬 **评论树**：自引用关系实现评论回复，递归渲染
- 🏷️ **多对多关系**：文章与标签的 N:M 关联
- 📦 **分页与过滤**：分页、关键词搜索、按标签过滤
- 🎨 **现代化 UI**：响应式布局、加载状态、错误提示、乐观更新

---

## 一、目录结构

```
bookStudy/
├── blog-platform/
│   └── backend/                          # 后端项目
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py                   # FastAPI 入口（路由注册、中间件、建表）
│       │   ├── config.py                 # 配置（Pydantic Settings）
│       │   ├── database.py               # 引擎、Session、Base
│       │   ├── models.py                 # ORM 模型（5 张表）
│       │   ├── schemas.py                # Pydantic schemas（请求/响应结构）
│       │   ├── security.py               # 密码哈希、JWT
│       │   ├── deps.py                   # 依赖注入（get_db、get_current_user）
│       │   └── routers/
│       │       ├── __init__.py
│       │       ├── auth.py               # 认证路由
│       │       ├── posts.py              # 文章路由
│       │       ├── comments.py           # 评论路由
│       │       └── tags.py               # 标签路由
│       ├── scripts/
│       │   └── seed.py                   # 种子数据脚本
│       ├── requirements.txt
│       ├── .env.example
│       └── README.md                     # 本文件
└── app/blog/                             # 前端（Next.js App Router）
    ├── layout.js                         # 博客布局（含 AuthProvider）
    ├── blog.css                          # 全局样式
    ├── page.js                           # 首页
    ├── _lib/
    │   ├── api.js                        # API 客户端
    │   └── auth-context.jsx              # Auth Context
    ├── _components/
    │   ├── Header.jsx                    # 顶部导航
    │   └── CommentTree.jsx               # 递归评论组件
    ├── login/page.js                     # 登录页
    ├── register/page.js                  # 注册页
    ├── posts/
    │   ├── page.js                       # 文章列表
    │   ├── new/page.js                   # 写新文章
    │   └── [id]/
    │       ├── page.js                   # 文章详情
    │       └── edit/page.js              # 编辑文章
    ├── tags/page.js                      # 标签列表
    └── me/page.js                        # 用户中心
```

---

## 二、快速启动

### 前置条件

- Python 3.9+
- Node.js 20.9+
- MySQL 8.x / 9.x（账号 root / 密码 123456）

### 步骤 1：准备数据库

```bash
mysql -uroot -p123456 -e "CREATE DATABASE IF NOT EXISTS blog_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 步骤 2：启动后端

```bash
cd blog-platform/backend

# 安装依赖
pip install -r requirements.txt

# 导入种子数据（会重建所有表 + 插入演示数据）
python -m scripts.seed --yes

# 启动后端（默认 http://127.0.0.1:8000）
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

启动后访问：
- http://127.0.0.1:8000/docs —— Swagger UI（在线试调 API）
- http://127.0.0.1:8000/redoc —— ReDoc 文档

### 步骤 3：启动前端

回到仓库根目录：

```bash
npm run dev
```

启动后访问 http://localhost:3000/blog 即可看到博客平台。

### 步骤 4：测试账号

种子数据预置了三个账号：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 用户1 | alice | alice123 |
| 用户2 | bob | bob123 |

---

## 三、架构与数据流

```
┌─────────────────────────────────────────────────────────────┐
│  浏览器（用户）                                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP 请求
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js 16 (3000)                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ React 19 + App Router                                 │    │
│  │ ┌─────────┐  ┌──────────┐  ┌─────────┐              │    │
│  │ │ Auth    │  │ API 客户端│  │ UI 组件 │              │    │
│  │ │ Context │→ │ blogApi  │→ │ Pages   │              │    │
│  │ └─────────┘  └────┬─────┘  └─────────┘              │    │
│  └─────────────────────┼───────────────────────────────┘    │
│                        │ /api/blog/* 请求                     │
│  ┌─────────────────────▼───────────────────────────────┐    │
│  │ rewrites（同源代理）                                  │    │
│  │ /api/blog/* → http://127.0.0.1:8000/api/blog/*      │    │
│  └─────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTP 转发
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  FastAPI (8000)                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ CORS 中间件（双保险）                                  │    │
│  │ JWT 依赖（解析 token → 当前用户）                      │    │
│  │ 路由：auth / posts / comments / tags                  │    │
│  └─────────────────────┬───────────────────────────────┘    │
│                        │ SQLAlchemy ORM                       │
└─────────────────────────┼───────────────────────────────────┘
                          │ SQL
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  MySQL (3306)                                                │
│  ┌──────┐  ┌───────┐  ┌──────────┐  ┌──────┐  ┌──────────┐ │
│  │users │  │ posts │  │ comments │  │ tags │  │post_tags │ │
│  └──────┘  └───────┘  └──────────┘  └──────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 关键设计

1. **同源代理**：前端走 `/api/blog/*`，由 Next.js rewrites 代理到后端，浏览器无跨域问题
2. **JWT 认证**：登录返回 token，前端存 localStorage，每次请求放 `Authorization: Bearer <token>` 头
3. **依赖注入**：FastAPI `Depends()` 实现 `get_db`、`get_current_user`，路由函数声明即获得
4. **ORM 关系**：
   - 1:N（用户-文章、文章-评论）
   - N:M（文章-标签，通过 `post_tags` 关联表）
   - 自引用（评论-评论，实现回复树）

---

## 四、数据库表结构

### users（用户）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增主键 |
| username | VARCHAR(50) UNIQUE | 用户名 |
| email | VARCHAR(255) UNIQUE | 邮箱 |
| password_hash | VARCHAR(255) | 密码哈希（bcrypt） |
| avatar | VARCHAR(500) | 头像 URL |
| bio | TEXT | 简介 |
| is_admin | BOOL | 是否管理员 |
| is_active | BOOL | 是否启用 |
| created_at / updated_at | DATETIME | 时间戳 |

### posts（文章）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增主键 |
| title | VARCHAR(200) | 标题 |
| summary | VARCHAR(500) | 摘要 |
| content | TEXT | 正文 |
| author_id | INT FK → users.id | 作者 |
| is_published | BOOL | 是否发布（False=草稿） |
| view_count | INT | 浏览数 |
| created_at / updated_at | DATETIME | 时间戳 |

### comments（评论，自引用）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增主键 |
| content | TEXT | 评论内容 |
| author_id | INT FK → users.id | 评论者 |
| post_id | INT FK → posts.id | 所属文章 |
| parent_id | INT FK → comments.id | 父评论（NULL=顶级评论） |
| created_at / updated_at | DATETIME | 时间戳 |

### tags（标签）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增主键 |
| name | VARCHAR(50) UNIQUE | 标签名 |
| description | VARCHAR(200) | 描述 |
| created_at | DATETIME | 时间戳 |

### post_tags（文章-标签关联表）

| 字段 | 类型 | 说明 |
|------|------|------|
| post_id | INT FK → posts.id | 文章 ID |
| tag_id | INT FK → tags.id | 标签 ID |

复合主键 (post_id, tag_id)。

---

## 五、API 接口列表

所有接口前缀 `/api/blog`。

### 认证

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| POST | /auth/register | 注册 | 无 |
| POST | /auth/login | 登录，返回 token | 无 |
| GET | /auth/me | 获取当前用户 | 需要 |
| PUT | /auth/me | 更新资料 | 需要 |
| PUT | /auth/me/password | 修改密码 | 需要 |

### 文章

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /posts | 分页列表（支持 tag_id / author_id / keyword） | 可选 |
| GET | /posts/{id} | 详情（含评论树，浏览数 +1） | 可选 |
| POST | /posts | 创建 | 需要 |
| PUT | /posts/{id} | 更新（作者或管理员） | 需要 |
| DELETE | /posts/{id} | 删除（作者或管理员） | 需要 |

### 评论

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /comments/post/{post_id} | 文章的评论树 | 无 |
| POST | /comments?post_id=X | 创建评论（可带 parent_id 回复） | 需要 |
| PUT | /comments/{id} | 更新（作者或管理员） | 需要 |
| DELETE | /comments/{id} | 删除（作者或管理员，级联删回复） | 需要 |

### 标签

| 方法 | 路径 | 说明 | 鉴权 |
|------|------|------|------|
| GET | /tags | 标签列表 | 无 |
| GET | /tags/{id}/posts/count | 标签下文章数 | 无 |
| POST | /tags | 创建标签 | 需要 |
| PUT | /tags/{id} | 更新标签 | 管理员 |
| DELETE | /tags/{id} | 删除标签 | 管理员 |

---

## 六、前端页面

| 路径 | 页面 | 说明 |
|------|------|------|
| /blog | 首页 | 项目介绍 + 最新 5 篇文章 + 测试账号 |
| /blog/login | 登录 | 用户名/邮箱 + 密码 |
| /blog/register | 注册 | 注册后自动登录 |
| /blog/posts | 文章列表 | 分页 + 搜索 + 标签过滤 |
| /blog/posts/{id} | 文章详情 | 正文 + 评论树 + 编辑/删除按钮 |
| /blog/posts/new | 写新文章 | 登录后访问，支持草稿 |
| /blog/posts/{id}/edit | 编辑文章 | 作者或管理员可访问 |
| /blog/tags | 标签列表 | 显示各标签下文章数 |
| /blog/me | 用户中心 | 个人信息 + 我写的文章 |

---

## 七、核心知识点详解

### 7.1 JWT 认证流程

```
1. 用户注册：
   前端 → POST /auth/register {username, email, password}
   后端 → 校验唯一性 → bcrypt 哈希密码 → 写库 → 返回用户信息

2. 用户登录：
   前端 → POST /auth/login {username, password}
   后端 → 查用户 → bcrypt 校验密码 → 生成 JWT → 返回 {token, user}
   前端 → 把 token 存 localStorage

3. 后续请求：
   前端 → 每次请求加 Authorization: Bearer <token>
   后端 → deps.get_current_user 解析 token → 查库 → 注入 user 对象

4. 登出：
   前端 → 清除 localStorage（token 是无状态的，后端无需操作）
```

### 7.2 SQLAlchemy 关系映射

```python
# 一对多：User ←→ Post
class User(Base):
    posts: Mapped[List["Post"]] = relationship(back_populates="author")

class Post(Base):
    author: Mapped["User"] = relationship(back_populates="posts")

# 多对多：Post ←→ Tag（通过 post_tags 关联表）
class Post(Base):
    tags: Mapped[List["Tag"]] = relationship(
        secondary=post_tags, back_populates="posts"
    )

# 自引用：Comment ←→ Comment（回复）
class Comment(Base):
    parent: Mapped[Optional["Comment"]] = relationship(
        "Comment", back_populates="replies", remote_side=[id]
    )
    replies: Mapped[List["Comment"]] = relationship(
        "Comment", back_populates="parent"
    )
```

### 7.3 FastAPI 依赖注入

```python
# 数据库 session：每个请求一个，自动关闭
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 当前用户：从 token 解析，失败抛 401
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(401, "Token 无效")
    user = db.get(User, int(payload["sub"]))
    return user

# 路由使用：声明依赖即获得
@router.post("/posts")
def create_post(payload: PostCreate,
                current_user: User = Depends(get_current_user),  # 强制登录
                db: Session = Depends(get_db)):
    ...
```

### 7.4 Next.js rewrites 同源代理

```javascript
// next.config.mjs
async rewrites() {
  return [
    {
      source: "/api/blog/:path*",
      destination: "http://127.0.0.1:8000/api/blog/:path*",
    },
  ];
}
```

前端只跟同源 3000 端口通信，浏览器无跨域问题，后端地址变了只改这一处。

### 7.5 React Context 管理登录态

```jsx
// 包一层 Provider，所有子组件都能用 useAuth()
<AuthProvider>
  <App />
</AuthProvider>

// 任意组件读取
const { user, isLogin, login, logout } = useAuth();
```

### 7.6 递归评论树

```jsx
// CommentTree 组件递归渲染自己
function CommentTree({ comment }) {
  return (
    <li>
      <div>{comment.content}</div>
      {comment.replies?.length > 0 && (
        <ul>
          {comment.replies.map(r => (
            <CommentTree key={r.id} comment={r} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

---

## 八、常见问题

### Q1：前端提示「加载失败」？

后端没启动。检查：
1. `curl http://127.0.0.1:8000/` 应返回 `{"status":"ok",...}`
2. 没启动则 `cd blog-platform/backend && uvicorn app.main:app --reload`

### Q2：改了 next.config.mjs 不生效？

Next.js 配置改动需重启 dev 服务器：
```bash
# Ctrl+C 停掉 npm run dev，再重新启动
npm run dev
```

### Q3：数据库连接失败？

1. 确认 MySQL 在跑：`mysql -uroot -p123456 -e "SELECT 1"`
2. 确认数据库存在：`SHOW DATABASES LIKE 'blog_platform'`
3. 改 `blog-platform/backend/.env` 里的 `DATABASE_URL`

### Q4：想重置数据？

```bash
cd blog-platform/backend
python -m scripts.seed --yes
```

会删表重建 + 插入演示数据。

### Q5：如何加新接口？

1. 后端：在 `app/routers/` 对应文件加路由函数
2. 前端：在 `app/blog/_lib/api.js` 的 `blogApi` 对象加方法
3. 前端：在页面组件里调用 `blogApi.xxx.yyy()`

---

## 九、扩展练习

学完本项目后，可以尝试以下扩展：

1. **接入 Markdown 渲染**：前端用 `react-markdown` 把文章正文渲染成 HTML
2. **图片上传**：后端加 `/upload` 接口，存到本地或 OSS
3. **文章收藏**：User ←→ Post 多对多关系（类似标签）
4. **邮件验证**：注册时发验证邮件，用 `fastapi-mail`
5. **限流**：用 `slowapi` 给登录接口加防暴力破解
6. **WebSocket**：文章下实时同步新评论
7. **Docker 部署**：写 Dockerfile + docker-compose 一键启动
8. **测试**：用 `pytest` 写后端单元测试，`jest` 写前端组件测试

---

## 十、安全提示

本项目为教学目的，**生产环境使用前需修改**：

1. **改 JWT_SECRET**：用 `openssl rand -hex 32` 生成随机密钥
2. **token 存储**：localStorage 易受 XSS 攻击，生产用 httpOnly cookie
3. **HTTPS**：全站 HTTPS，避免 token 被中间人窃取
4. **限流**：登录、注册接口加 IP 限流
5. **CORS**：把 `allow_origins` 改成真实域名，不要用 `*`
6. **SQL 注入**：用 ORM 已经天然防御，别手写 SQL 字符串拼接
7. **XSS**：用户输入的内容渲染时要转义（React 默认会转义）
8. **CSRF**：如果改用 cookie 存 token，要加 CSRF 防护

---

## 十一、相关文档

- [FastAPI 官方文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 文档](https://docs.sqlalchemy.org/en/20/)
- [Next.js 16 文档](https://nextjs.org/docs)
- [React 19 文档](https://react.dev/)
- [JWT 介绍](https://jwt.io/introduction)
- [bcrypt 原理](https://en.wikipedia.org/wiki/Bcrypt)
