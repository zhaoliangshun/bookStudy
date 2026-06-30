# FastAPI 入门 demo

一个用 FastAPI 写的最小「待办事项」API，演示路由、路径/查询参数、Pydantic 请求体校验、内存 CRUD。

## 一、环境准备

需要 Python 3.10+。推荐用虚拟环境隔离依赖：

```bash
# 进入 demo 目录
cd fastapi-demo

# 创建虚拟环境（在当前目录下生成 .venv 文件夹）
python3 -m venv .venv

# 激活虚拟环境
# macOS / Linux:
source .venv/bin/activate
# Windows (PowerShell):
# .venv\Scripts\Activate.ps1
```

激活后，终端提示符前会出现 `(.venv)`，之后 `pip install` 的包都只装在这个虚拟环境里。

## 二、安装依赖

```bash
pip install -r requirements.txt
```

会安装：
- `fastapi[standard]` —— FastAPI 框架 + Pydantic v2 + 配套工具
- `uvicorn[standard]` —— ASGI 服务器，用于运行 FastAPI

## 三、运行 demo

两种方式任选其一：

```bash
# 方式 1：用 uvicorn 命令（推荐，开发时加 --reload 热重载）
uvicorn main:app --reload

# 方式 2：直接用 python 运行（main.py 末尾已配置等价启动逻辑）
python main.py
```

启动成功后终端会输出：

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

## 四、访问接口

| 地址 | 说明 |
|------|------|
| http://127.0.0.1:8000/ | 接口首页（健康检查） |
| http://127.0.0.1:8000/docs | **Swagger UI 交互式文档（可在线试调）** |
| http://127.0.0.1:8000/redoc | ReDoc 阅读型文档 |
| http://127.0.0.1:8000/openapi.json | 原始 OpenAPI Schema |

推荐直接打开 `/docs`，在浏览器里点 "Try it out" 测试所有接口。

## 五、接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 健康检查 |
| GET | `/items` | 获取事项列表（支持 `skip`/`limit`/`done` 查询参数） |
| GET | `/items/{item_id}` | 获取单个事项 |
| POST | `/items` | 创建事项 |
| PUT | `/items/{item_id}` | 更新事项 |
| DELETE | `/items/{item_id}` | 删除事项 |

## 六、用 curl 快速试一遍

```bash
# 创建一个事项
curl -X POST http://127.0.0.1:8000/items \
  -H "Content-Type: application/json" \
  -d '{"title": "学习 FastAPI", "done": false}'

# 获取列表
curl http://127.0.0.1:8000/items

# 获取单个
curl http://127.0.0.1:8000/items/1

# 更新（标记为完成）
curl -X PUT http://127.0.0.1:8000/items/1 \
  -H "Content-Type: application/json" \
  -d '{"done": true}'

# 删除
curl -X DELETE http://127.0.0.1:8000/items/1
```

## 七、目录结构

```
fastapi-demo/
├── main.py              # FastAPI 应用 + 路由 + 内存数据 + CORS
├── requirements.txt     # 依赖列表
└── README.md            # 本文件
```

数据存在内存里，进程重启即丢失。真实项目请接入数据库（如 SQLAlchemy + SQLite/PostgreSQL）。

## 八、与 Next.js 前端联调

本仓库根目录是一个 Next.js 16 项目，里面已经写好了一个 Todo 前端页面（`app/todo/page.js`），可以直接联调。

### 8.1 架构

```
浏览器 ──> Next.js (3000) ──rewrites──> FastAPI (8000) ──> 内存列表
   ↑                                                              |
   └────────────────── JSON ─────────────────────────────────────┘
```

- 浏览器只跟同源 3000 端口通信，**没有跨域问题**
- Next.js 的 `rewrites` 把 `/api/todos/*` 代理到 `http://127.0.0.1:8000/items/*`
- FastAPI 这边也开了 CORS 做双保险（允许 `localhost:3000` / `127.0.0.1:3000`）

### 8.2 路径映射

| 前端请求 | 代理到 FastAPI |
|---------|---------------|
| `GET /api/todos` | `GET /items` |
| `GET /api/todos/5` | `GET /items/5` |
| `POST /api/todos` | `POST /items` |
| `PUT /api/todos/5` | `PUT /items/5` |
| `DELETE /api/todos/5` | `DELETE /items/5` |

### 8.3 启动联调

**步骤 1：启动 FastAPI 后端（终端 A）**

```bash
cd fastapi-demo
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload        # 默认监听 http://127.0.0.1:8000
```

**步骤 2：启动 Next.js 前端（终端 B）**

回到仓库根目录：

```bash
npm run dev                      # 默认监听 http://localhost:3000
```

**步骤 3：打开 Todo 页面**

浏览器访问 [http://localhost:3000/todo](http://localhost:3000/todo) 即可看到前后端联调的待办事项界面。

### 8.4 验证联调是否成功

1. 页面顶部不报错、能看到「添加 / 刷新 / 过滤」按钮 → rewrites 代理通了
2. 输入文字点添加，列表里出现新事项 → POST 通了
3. 点 checkbox 切换完成状态 → PUT 通了
4. 点 ✕ 删除按钮 → DELETE 通了
5. 同时打开 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) 看后端 Swagger，两边数据应该一致

### 8.5 常见问题

**Q：前端页面提示「加载失败」？**
A：FastAPI 后端没启动。回到终端 A 跑 `uvicorn main:app --reload`，看到 `Application startup complete.` 再刷新页面。

**Q：改了 next.config.mjs 的 rewrites 不生效？**
A：Next.js 配置改动需要重启 dev 服务器，`Ctrl+C` 停掉再 `npm run dev`。

**Q：CORS 还报错？**
A：检查 `main.py` 里 `allow_origins` 是否包含你访问前端的地址（默认 `localhost:3000` 和 `127.0.0.1:3000` 都允许了）。

