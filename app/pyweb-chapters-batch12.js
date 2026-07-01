// =============================================================
// Python Web 应用开发实战教程 - 第 12 批章节（Session 与认证篇，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   45. session-flask : Flask Session 管理
//   46. auth-jwt      : JWT 认证实现
//   47. auth-password : 密码哈希与安全
//   48. auth-rbac     : 权限控制与 RBAC
//
// 技术栈：Python 3.11+ / Flask / flask-session / PyJWT / werkzeug / passlib
//
// 格式约定：
//   - content 是反引号模板字符串
//   - content 内部三反引号转义为 \`\`\`，内联反引号转义为 \`
//   - 涉及 ${ 形式（shell/docker 变量）统一转义为 \$\{，避免与 JS 模板字符串冲突
//   - group 统一为"Session 与认证"
// =============================================================

export const chapters = [
  // =========================================================
  // 第四十五章：Flask Session 管理
  // =========================================================
  {
    id: "session-flask",
    group: "Session 与认证",
    icon: "🍪",
    title: "Flask Session 管理",
    content: `

# Flask Session 管理

## 一、为什么需要 Session

HTTP 是**无状态协议**：每个请求独立，服务器记不住"上一个请求是谁发的"。但你登录后访问每个页面都该显示登录态——这需要一种机制让服务器"记住"用户。**Session** 就是这种机制。

\`\`\`txt filename="Session 工作原理"
1. 用户登录，服务器验证密码通过
2. 服务器生成一个 session id，把"用户信息"存起来
   存储位置：服务器内存 / Redis / 数据库
3. 服务器把 session id 通过 cookie 发给浏览器
   Set-Cookie: session=abc123; HttpOnly; Path=/
4. 用户下次请求，浏览器自动带上 cookie
   Cookie: session=abc123
5. 服务器拿 session id 找到对应的用户信息 → 知道是登录的谁
\`\`\`

\`\`\`txt filename="Session vs Cookie"
Cookie    存在浏览器端，每次请求自动带上，容量小（4KB）
Session   存在服务器端，安全，通过 session id 关联浏览器
关系      Cookie 里只放 session id，敏感数据放 Session
\`\`\`

## 二、Flask 的默认 Session

Flask 自带一个轻量 session 机制：**把 session 数据加密后整个塞进 cookie**，不在服务器存。适合小型应用，无需额外组件。

\`\`\`python filename="Flask 默认 Session"
from flask import Flask, session

app = Flask(__name__)
app.secret_key = "a-very-secret-key-keep-safe"  # ★ 必须，用于加密 cookie

@app.route("/login")
def login():
    session["user_id"] = 1            # 设置：写入 session
    session["username"] = "alice"
    return "登录成功"

@app.route("/me")
def me():
    if "user_id" not in session:        # 读取
        return "未登录", 401
    return f"你好 {session['username']}"

@app.route("/logout")
def logout():
    session.clear()                    # 清空：登出
    return "已登出"
\`\`\`

\`\`\`txt filename="Flask 默认 Session 特点"
存储位置    客户端 cookie（加密后）
依赖        只需 secret_key
容量限制    cookie 4KB 上限
适合        小应用，少量数据
不适合      大量数据、需要服务端主动失效
\`\`\`

> **\`secret_key\` 是 Session 安全的命根子**：泄露了攻击者能伪造任意 session（伪造登录态）。生产必须用强随机值，从环境变量读，绝不硬编码进代码提交到 Git。

\`\`\`python filename="生产 secret_key 配置"
import os
app.secret_key = os.environ["SECRET_KEY"]
# 或随机生成
# import secrets; app.secret_key = secrets.token_hex(32)
\`\`\`

## 三、session 对象操作

\`\`\`python filename="session 操作速查"
from flask import session

# 设置
session["user_id"] = 1
session["cart"] = [1, 2, 3]

# 读取
uid = session.get("user_id")       # 没有返回 None
uid = session["user_id"]           # 没有会 KeyError

# 判断存在
if "user_id" in session:
    ...

# 删除单个
session.pop("cart", None)

# 清空所有
session.clear()

# 修改（直接赋值会标记修改）
session["username"] = "new_name"
\`\`\`

\`\`\`python filename="修改可变对象要手动标记"
# session 里存了 list/dict，修改内部要显式标记修改
session["cart"].append(4)        # 不会触发保存！
session.modified = True          # 手动标记

# 或重新赋值
cart = session.get("cart", [])
cart.append(4)
session["cart"] = cart           # 整体替换会保存
\`\`\`

## 四、flask-session 扩展：服务端 Session

Flask 默认把 session 放 cookie，但生产环境通常用服务端 session：数据存 Redis/数据库/文件，cookie 只放 session id。优点：容量大、可主动失效、多机共享。

\`\`\`bash filename="安装 flask-session"
pip install flask-session
\`\`\`

\`\`\`python filename="用 Redis 存 Session"
from flask import Flask
from flask_session import Session

app = Flask(__name__)
app.secret_key = "dev-secret"

# 配置 Session 后端
app.config["SESSION_TYPE"] = "redis"              # 用 Redis
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_USE_SIGNER"] = True          # 给 session id 签名防伪造
app.config["PERMANENT_SESSION_LIFETIME"] = 3600  # 1 小时
# Redis 连接（也可用 SESSION_REDIS 显式配置）
app.config["SESSION_REDIS"] = redis.StrictRedis(
    host="localhost", port=6379, db=0,
)

Session(app)  # 初始化扩展

# 用法和默认 session 一样
@app.route("/login")
def login():
    session["user_id"] = 1
    return "OK"
\`\`\`

\`\`\`txt filename="flask-session 支持的后端"
SESSION_TYPE       存储位置
"null"            默认 Flask cookie（不真正用服务端）
"redis"           Redis（推荐生产）
"memcached"       Memcached
"filesystem"      文件系统
"mongodb"         MongoDB
"sqlalchemy"      数据库
\`\`\`

\`\`\`python filename="文件系统 Session（无需 Redis）"
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = "/tmp/flask_session"  # 存储目录
\`\`\`

## 五、Session 过期与持久化

\`\`\`python filename="Session 生命周期控制"
from datetime import timedelta

# 全局过期时间
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)

@app.route("/login")
def login():
    session["user_id"] = 1
    # permanent=True：使用 PERMANENT_SESSION_LIFETIME
    # 不设则关闭浏览器就失效
    session.permanent = True
    return "登录成功"
\`\`\`

\`\`\`txt filename="两种过期方式对比"
默认（非永久）    关闭浏览器即失效（cookie 是 session cookie）
permanent=True    到 PERMANENT_SESSION_LIFETIME 才失效（cookie 有过期时间）
典型场景          默认：临时登录；permanent：记住我（7天/30天）
\`\`\`

\`\`\`python filename="记住我功能"
@app.route("/login", methods=["POST"])
def login():
    user = authenticate(request.form)
    if user:
        session["user_id"] = user.id
        if request.form.get("remember"):
            session.permanent = True  # 长期有效
        else:
            session.permanent = False  # 关浏览器失效
        return redirect(url_for("index"))
\`\`\`

## 六、登录状态管理

\`\`\`python filename="完整登录登出流程"
from flask import Flask, session, request, redirect, url_for, render_template, g, abort
import os

app = Flask(__name__)
app.secret_key = os.environ["SECRET_KEY"]

# 模拟用户库
USERS = {"alice": {"id": 1, "password": "secret", "name": "Alice"}}

@app.before_request
def load_user():
    """每个请求前加载当前用户（如果有）"""
    uid = session.get("user_id")
    g.current_user = None
    if uid:
        for u in USERS.values():
            if u["id"] == uid:
                g.current_user = u
                break

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = USERS.get(username)
        if user and user["password"] == password:  # 生产用哈希比对
            session.clear()                       # 防 session fixation
            session["user_id"] = user["id"]        # 登录态
            session.permanent = True
            return redirect(url_for("dashboard"))
        return render_template("login.html", error="用户名或密码错"), 401
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    if not g.current_user:
        return redirect(url_for("login"))
    return f"欢迎 {g.current_user['name']}"

@app.route("/logout")
def logout():
    session.clear()   # 清空 session = 登出
    return redirect(url_for("login"))
\`\`\`

> **登录后要 \`session.clear()\` 再设新值**：防 session fixation 攻击——攻击者诱导受害者用攻击者预设的 session id 登录，登录后这个 id 还是攻击者能控制的。clear 后重新生成 session id 就防御了。

## 七、用装饰器统一登录校验

\`\`\`python filename="login_required 装饰器"
from functools import wraps
from flask import g, redirect, url_for, request, abort

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not g.current_user:
            # API 返回 401，页面重定向到登录
            if request.path.startswith("/api/"):
                abort(401)
            return redirect(url_for("login", next=request.path))
        return f(*args, **kwargs)
    return decorated

@app.route("/posts/new")
@login_required
def post_new():
    return f"{g.current_user['name']} 写文章"

@app.route("/api/me")
@login_required
def api_me():
    return {"user": g.current_user}
\`\`\`

## 八、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 忘 \`secret_key\` | session 报错 | 必须配置 |
| secret_key 硬编码进 Git | 安全漏洞 | 从环境变量读 |
| 默认 session 存大数据 | cookie 超限 | 用 flask-session 服务端 |
| 修改 list 不标 \`modified\` | 修改不生效 | 整体替换或 \`session.modified=True\` |
| 登录不 \`clear()\` 再设 | session fixation | 登录前 \`session.clear()\` |
| session 存密码等敏感数据 | 泄露风险 | 只存 user_id 等 |
| 多机用默认 cookie session | 不共享 | 用 Redis 服务端 |
| 不设 \`permanent\` 又想长期 | 关浏览器掉 | 设 \`session.permanent = True\` |
| 登出不清 session | 还能访问 | \`session.clear()\` |
| cookie 不设 HttpOnly | JS 能读 | flask 默认开了 |

## 九、小结

Session 让无状态的 HTTP 记住用户：cookie 放 session id，服务器存数据。Flask 默认把 session 加密进 cookie（小应用够用），生产用 flask-session 存 Redis。登录用 \`session["user_id"]=id\`，登出 \`session.clear()\`，\`session.permanent=True\` 控制持久化。用 \`login_required\` 装饰器统一拦截未登录请求。下一章讲另一种认证方式：JWT，适合 API 和跨服务场景。
`
  },

  // =========================================================
  // 第四十六章：JWT 认证实现
  // =========================================================
  {
    id: "auth-jwt",
    group: "Session 与认证",
    icon: "🔐",
    title: "JWT 认证实现",
    content: `

# JWT 认证实现

## 一、JWT 是什么

**JWT**（JSON Web Token）是一种紧凑的、自包含的 token 格式，常用于 API 认证。它把用户信息编码成一个字符串，服务器不存 session，每次请求带 token 验证身份。

\`\`\`txt filename="JWT 结构（三段式）"
header.payload.signature
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxfQ.abc123...

header    算法信息（base64 编码的 JSON）
payload  载荷：用户数据 + 过期时间（base64 编码的 JSON）
signature 签名：用密钥对前两段签名，防伪造
\`\`\`

\`\`\`txt filename="JWT vs Session 认证"
            Session                JWT
状态       有状态（服务器存 session） 无状态（token 自包含）
存储       服务器内存/Redis         不用存（密钥验证签名即可）
扩展性     多机需共享 session      天然支持多机（只要密钥相同）
登出       删 session 即可        难主动失效（token 还有效）
适合       传统 Web 应用          API / 微服务 / 移动端
\`\`\`

> **选型建议**：传统 Web 应用（浏览器渲染页面）用 Session；前后端分离 API、移动 App、微服务间调用用 JWT。两者也可混用。

## 二、PyJWT 库

\`\`\`bash filename="安装 PyJWT"
pip install pyjwt
\`\`\`

\`\`\`python filename="创建和验证 token"
import jwt
from datetime import datetime, timedelta, timezone

SECRET = "my-secret-key-keep-safe"

# 1. 创建 token
def create_token(user_id):
    payload = {
        "user_id": user_id,                          # 用户标识
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),  # 过期时间
        "iat": datetime.now(timezone.utc),           # 签发时间
    }
    token = jwt.encode(payload, SECRET, algorithm="HS256")
    return token  # 字符串

# 2. 验证 token
def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload   # 验证通过，返回载荷
    except jwt.ExpiredSignatureError:
        return None  # 过期
    except jwt.InvalidTokenError:
        return None  # 无效

# 使用
token = create_token(1)
print(token)
data = verify_token(token)
print(data)  # {'user_id': 1, 'exp': ..., 'iat': ...}
\`\`\`

\`\`\`txt filename="常用 payload 字段（claims）"
标准字段（有约定含义）：
iss    签发者
sub    主题（一般是 user_id）
aud    接收方
exp    过期时间（必须设，防永久有效）
iat    签发时间
nbf    在此之前无效

自定义字段：
user_id, role, username 等业务数据
\`\`\`

> **payload 不是加密的**：只是 base64 编码，谁都能解开看。所以**别放密码等敏感数据**。JWT 防的是"伪造"（签名验证），不防"窥探"。

## 三、token 放哪里传输

\`\`\`txt filename="token 传输方式"
推荐    Authorization: Bearer <token>（HTTP 头）
        格式：Authorization: Bearer eyJhbGc...
不推荐  URL 查询参数 ?token=xxx（会进日志、历史）
不推荐  cookie（易 CSRF，除非配合 SameSite）
\`\`\`

\`\`\`html filename="前端发送 token"
<script>
// 登录拿到 token 存起来
fetch("/api/login", {method: "POST", body: ...})
  .then(r => r.json())
  .then(data => {
    localStorage.setItem("token", data.token);  // 存 localStorage
  });

// 后续请求带上 token
fetch("/api/me", {
  headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
  }
});
</script>
\`\`\`

\`\`\`txt filename="localStorage vs cookie 存 token"
localStorage   JS 能读，但 XSS 能偷；不自动带请求
cookie         自动带请求；但 CSRF 能利用；HttpOnly 防 XSS 读
建议           XSS 防御做好可用 localStorage；cookie 要配 SameSite 防 CSRF
\`\`\`

## 四、Flask 装饰器校验 token

\`\`\`python filename="Flask JWT 中间件"
from functools import wraps
from flask import Flask, request, jsonify, g
import jwt
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
app.config["JWT_SECRET"] = "dev-secret-keep-safe"
app.config["JWT_EXP_HOURS"] = 1

def create_token(user_id, role="user"):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=app.config["JWT_EXP_HOURS"]),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, app.config["JWT_SECRET"], algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None, "token 过期"
    except jwt.InvalidTokenError:
        return None, "token 无效"

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "缺少 token"}), 401
        token = auth[7:]  # 去掉 "Bearer "
        payload = decode_token(token)
        if isinstance(payload, tuple):  # 出错
            return jsonify({"error": payload[1]}), 401
        g.current_user_id = payload["user_id"]
        g.current_role = payload.get("role", "user")
        return f(*args, **kwargs)
    return decorated

@app.route("/api/login", methods=["POST"])
def login():
    # 校验用户名密码...
    user = authenticate(request.json)
    if not user:
        return jsonify({"error": "用户名或密码错"}), 401
    token = create_token(user.id, user.role)
    return jsonify({"token": token})

@app.route("/api/me")
@jwt_required
def me():
    return jsonify({"user_id": g.current_user_id, "role": g.current_role})
\`\`\`

## 五、Django 装饰器校验 token

\`\`\`python filename="Django JWT 装饰器"
from functools import wraps
from django.http import JsonResponse
import jwt
from django.conf import settings

def jwt_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth.startswith("Bearer "):
            return JsonResponse({"error": "未登录"}, status=401)
        token = auth[7:]
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return JsonResponse({"error": "token 过期"}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({"error": "token 无效"}, status=401)
        request.user_id = payload["user_id"]
        return view_func(request, *args, **kwargs)
    return wrapper

@jwt_required
def me(request):
    return JsonResponse({"user_id": request.user_id})
\`\`\`

## 六、token 过期处理

\`\`\`python filename="过期处理策略"
# 1. 短期 token + 长期 refresh token
# access token 短期（如 15 分钟），refresh token 长期（如 7 天）
# access 过期后用 refresh 换新的 access

def create_tokens(user_id):
    return {
        "access_token": create_token(user_id, expires_minutes=15),
        "refresh_token": create_token(user_id, expires_days=7, type="refresh"),
    }

@app.route("/api/refresh", methods=["POST"])
def refresh():
    refresh_tok = request.json.get("refresh_token")
    payload = decode_token(refresh_tok)
    if not payload or payload.get("type") != "refresh":
        return jsonify({"error": "refresh token 无效"}), 401
    # 发新的 access token
    new_access = create_token(payload["user_id"], expires_minutes=15)
    return jsonify({"access_token": new_access})
\`\`\`

\`\`\`txt filename="为什么用 refresh token"
短期 access token：泄露风险窗口小
长期 refresh token：只在刷新时用一次，少暴露
access 过期 → 用 refresh 换新 → 继续用，不用重新登录
refresh 也过期 → 用户重新登录
\`\`\`

## 七、主动让 token 失效

JWT 无状态，签发后到过期前都有效，没法"删除"。要主动失效有几种方案：

\`\`\`txt filename="主动失效方案"
1. 黑名单：登出时把 token 加入 Redis 黑名单，校验时查
   优点：精确；缺点：要有存储，破坏无状态特性
2. 版本号：用户表加 token_version，登出 +1，token 里的版本不匹配就失效
   优点：无需额外存储；缺点：每次校验要查库
3. 短期 token：access 设很短（15 分钟），登出后最多 15 分钟失效
   优点：简单；缺点：有窗口期
\`\`\`

\`\`\`python filename="黑名单方案"
import redis
r = redis.StrictRedis()

def logout(token):
    # 把 token 加入黑名单，过期时间和 token 剩余一致
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    exp = payload["exp"]
    now = datetime.now(timezone.utc).timestamp()
    r.setex(f"blacklist:{token}", int(exp - now), "1")

def verify_token(token):
    if r.exists(f"blacklist:{token}"):
        return None, "已登出"
    # 再校验签名和过期
    ...
\`\`\`

## 八、完整示例：JWT 登录中间件

\`\`\`python filename="完整 JWT 认证"
from functools import wraps
from flask import Flask, request, jsonify, g
import jwt
from datetime import datetime, timedelta, timezone
import os

app = Flask(__name__)
app.config["JWT_SECRET"] = os.environ.get("JWT_SECRET", "dev-secret")
app.config["ACCESS_EXP_MIN"] = 15
app.config["REFRESH_EXP_DAY"] = 7

USERS = {"alice": {"id": 1, "password": "$2b$hashed", "role": "admin"}}

def make_token(user_id, role, type, **extra):
    if type == "access":
        exp = timedelta(minutes=app.config["ACCESS_EXP_MIN"])
    else:
        exp = timedelta(days=app.config["REFRESH_EXP_DAY"])
    payload = {
        "user_id": user_id,
        "role": role,
        "type": type,
        "exp": datetime.now(timezone.utc) + exp,
        "iat": datetime.now(timezone.utc),
        **extra,
    }
    return jwt.encode(payload, app.config["JWT_SECRET"], algorithm="HS256")

def decode(token):
    try:
        return jwt.decode(token, app.config["JWT_SECRET"], algorithms=["HS256"]), None
    except jwt.ExpiredSignatureError:
        return None, "token 过期"
    except jwt.InvalidTokenError:
        return None, "token 无效"

def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "未认证"}), 401
        payload, err = decode(auth[7:])
        if err:
            return jsonify({"error": err}), 401
        if payload.get("type") != "access":
            return jsonify({"error": "token 类型错"}), 401
        g.user_id = payload["user_id"]
        g.role = payload["role"]
        return f(*args, **kwargs)
    return wrapper

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json or {}
    user = USERS.get(data.get("username"))
    if not user:  # 生产：用 check_password_hash
        return jsonify({"error": "账号或密码错"}), 401
    return jsonify({
        "access_token": make_token(user["id"], user["role"], "access"),
        "refresh_token": make_token(user["id"], user["role"], "refresh"),
    })

@app.route("/api/refresh", methods=["POST"])
def refresh():
    tok = (request.json or {}).get("refresh_token")
    payload, err = decode(tok)
    if err or payload.get("type") != "refresh":
        return jsonify({"error": "refresh token 无效"}), 401
    return jsonify({
        "access_token": make_token(payload["user_id"], payload["role"], "access")
    })

@app.route("/api/me")
@auth_required
def me():
    return jsonify({"user_id": g.user_id, "role": g.role})
\`\`\`

## 九、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| payload 放密码 | 泄露 | 只放 user_id 等非敏感 |
| 不设 exp | token 永久有效 | 必设 exp |
| 密钥泄露 | 可伪造任意 token | 从环境变量读 |
| token 放 URL | 进日志泄露 | 放 Authorization 头 |
| 用 \`HS256\` 但密钥太短 | 易暴力破解 | 密钥至少 32 字节随机 |
| 不校验 \`type\` | refresh 当 access 用 | 区分 token 类型 |
| 算法不指定 \`algorithms\` | 算法 None 攻击 | 显式 \`algorithms=["HS256"]\` |
| 登出无法失效 | token 还能用 | 黑名单或版本号方案 |
| 不处理过期异常 | 500 错误 | 捕获 ExpiredSignatureError |
| 单一长期 token | 泄露窗口大 | access + refresh 双 token |

## 十、小结

JWT 用 \`header.payload.signature\` 三段式把用户信息编码成自包含 token，服务器用密钥验签不存 session，适合 API 和微服务。PyJWT 的 \`encode\`/\`decode\` 是核心 API。token 放 \`Authorization: Bearer xxx\` 头传输。access token 短期 + refresh token 长期兼顾安全与体验。注意 payload 不加密别放敏感数据，必须设 exp，算法显式指定。下一章讲密码怎么安全存储和校验。
`
  },

  // =========================================================
  // 第四十七章：密码哈希与安全
  // =========================================================
  {
    id: "auth-password",
    group: "Session 与认证",
    icon: "🔒",
    title: "密码哈希与安全",
    content: `

# 密码哈希与安全

## 一、为什么不能明文存密码

\`\`\`txt filename="明文存密码的灾难"
1. 数据库被脱库（SQL 注入、备份泄露、内鬼）→ 所有密码泄露
2. 用户多处复用密码 → 邮箱、银行、社交账号连环失守
3. 内部员工能看 → 隐私风险
4. 法律合规要求（GDPR/个人信息保护法）禁止明文存
\`\`\`

历史上 LinkedIn、CSDN、天涯都发生过明文密码泄露事件。**密码必须哈希存储**——单向不可逆，即使数据库泄露，攻击者也拿不到原密码。

## 二、哈希 vs 加密

\`\`\`txt filename="哈希 vs 加密"
哈希（Hash）    单向，不可逆    "abc" → "a94a8fef..."
                同输入同输出
                用途：密码存储、完整性校验
加密（Encrypt） 双向，可解密    "abc" → "密文" → 能解回 "abc"
                用途：传输加密、数据加密
\`\`\`

> **密码不能用加密**：加密的能解密，意味着密钥泄露密码就泄露。哈希不可逆，即使服务器被攻破，攻击者也拿不到原密码（只能暴力破解）。

## 三、慢哈希算法：bcrypt / argon2 / scrypt

普通的 MD5、SHA256 太快，攻击者用 GPU 每秒能算几亿次，暴力破解轻松。**密码哈希要用慢算法**，让每次计算耗时几十毫秒，暴力破解成本飙升。

\`\`\`txt filename="常用密码哈希算法"
算法       速度      推荐度      说明
MD5        极快      ❌ 禁用     已被破解，有彩虹表
SHA1       极快      ❌ 禁用     已不安全
SHA256     快        ⚠️ 不够    太快，暴力破解可行
bcrypt     慢（可调） ✅ 推荐    老牌成熟，内建加盐
scrypt     慢        ✅ 推荐    内存难解，抗 ASIC
argon2     慢        ✅ 最推荐  2015 密码哈希竞赛冠军
\`\`\`

\`\`\`txt filename="bcrypt 的"慢"如何工作"
bcrypt 有个 cost 参数（默认 12），决定迭代次数
每次哈希耗时 = 2^cost 次基础运算
cost=10 → 约 0.1 秒
cost=12 → 约 0.4 秒
硬件变快后调高 cost，保持破解难度
\`\`\`

## 四、加盐：防彩虹表

\`\`\`txt filename="彩虹表攻击"
预先把常见密码的哈希算好存表：
"123456" → "e10adc..."
"password" → "5f4dcc..."
拿到哈希后查表反推原密码 → 秒破
\`\`\`

**加盐**（Salt）：哈希时混入一段随机字符串，让相同密码哈希出不同结果，彩虹表失效。

\`\`\`python filename="加盐原理"
import hashlib, os

def hash_password(password):
    salt = os.urandom(16)  # 随机盐
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return salt + h  # 盐和哈希一起存

def verify(password, stored):
    salt = stored[:16]
    h = stored[16:]
    new_h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return new_h == h
\`\`\`

> **bcrypt/argon2 内建加盐**：不需要自己加，算法自动生成随机盐并和哈希一起编码进结果字符串。

## 五、werkzeug.security（Flask 自带）

Flask 依赖 werkzeug，自带 \`generate_password_hash\` 和 \`check_password_hash\`，最简单易用。

\`\`\`python filename="werkzeug 密码哈希"
from werkzeug.security import generate_password_hash, check_password_hash

# 1. 注册时：生成哈希存库
password = "user_input_password"
hashed = generate_password_hash(password, method="scrypt", scrypt_n=16384)
# 返回类似：scrypt:16384:8:1$abcd...$efgh...
# 包含算法、参数、盐、哈希，存一个字符串就够

# 2. 登录时：校验
is_correct = check_password_hash(hashed, password)
print(is_correct)  # True / False
\`\`\`

\`\`\`txt filename="werkzeug 支持的方法"
method 参数：
"scrypt"      推荐（默认，werkzeug 2.3+）
"pbkdf2:sha256" 兼容性好
"bcrypt"      需额外装 bcrypt 库
不指定 method 用默认（当前是 scrypt）
\`\`\`

## 六、Django 密码哈希

\`\`\`python filename="Django 自带密码工具"
from django.contrib.auth.hashers import make_password, check_password

# 注册
hashed = make_password("user_input")  # 默认用 PBKDF2

# 校验
is_correct = check_password("user_input", hashed)

# 识别是否需要升级算法（哈希方法变了）
from django.contrib.auth.hashers import identify_hasher
# settings.PASSWORD_HASHERS 配置算法优先级
\`\`\`

\`\`\`txt filename="Django 密码哈希器配置"
# settings.py
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",   # 优先用 argon2
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",   # 兜底
]
# 登录时按顺序尝试，识别旧算法的哈希会在校验成功后自动升级到第一个
\`\`\`

## 七、passlib 库（统一接口）

\`\`\`bash filename="安装 passlib"
pip install passlib
pip install passlib[bcrypt]   # 用 bcrypt 后端
\`\`\`

\`\`\`python filename="passlib 统一接口"
from passlib.context import CryptContext

# 配置算法上下文（支持多算法 + 自动升级）
pwd_ctx = CryptContext(
    schemes=["argon2", "bcrypt", "pbkdf2_sha256"],
    default="argon2",
    deprecated="auto",  # 旧算法哈希在验证后自动升级
)

# 注册：哈希
hashed = pwd_ctx.hash("user_password")

# 登录：校验
is_correct = pwd_ctx.verify("user_password", hashed)

# 升级：校验时识别旧算法自动 rehash
if pwd_ctx.needs_update(hashed):
    new_hashed = pwd_ctx.hash("user_password")
\`\`\`

## 八、密码强度校验

哈希只能防泄露，挡不住弱密码。注册时要校验强度。

\`\`\`python filename="密码强度校验"
import re

def check_password_strength(password):
    """返回错误列表，空表示通过"""
    errors = []
    if len(password) < 8:
        errors.append("至少 8 位")
    if len(password) > 64:
        errors.append("最多 64 位")
    if not re.search(r"[a-z]", password):
        errors.append("需含小写字母")
    if not re.search(r"[A-Z]", password):
        errors.append("需含大写字母")
    if not re.search(r"\d", password):
        errors.append("需含数字")
    if not re.search(r"[!@#$%^&*]", password):
        errors.append("需含特殊字符")
    # 常见弱密码黑名单
    if password.lower() in {"password", "12345678", "qwerty123"}:
        errors.append("密码太常见")
    return errors
\`\`\`

\`\`\`python filename="用 zxcvbn 评估真实强度"
# pip install zxcvbn
from zxcvbn import zxcvbn

result = zxcvbn("Tr0ub4dour&3")
print(result["score"])  # 0-4，4 最强
print(result["feedback"]["warning"])  # 如 "这是常见密码"
\`\`\`

## 九、密码重置流程

\`\`\`txt filename="密码重置标准流程"
1. 用户填邮箱 → 点"忘记密码"
2. 服务器生成一次性 token（短期有效，如 30 分钟）
3. 发邮件，链接含 token：https://site.com/reset?token=xxx
4. 用户点链接 → 服务器校验 token → 显示重置表单
5. 提交新密码 → 哈希存库 → 失效 token
\`\`\`

\`\`\`python filename="密码重置实现"
import jwt
from datetime import datetime, timedelta, timezone
from flask import Flask, request, redirect, url_for, flash, render_template

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev"

def make_reset_token(user_id):
    return jwt.encode({
        "user_id": user_id,
        "type": "reset",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=30),
    }, app.config["SECRET_KEY"], algorithm="HS256")

@app.route("/forgot", methods=["GET", "POST"])
def forgot():
    if request.method == "POST":
        email = request.form.get("email")
        user = find_user_by_email(email)
        if user:
            token = make_reset_token(user.id)
            send_email(email, f"重置链接：/reset?token={token}")
        # 不管用户是否存在都提示"已发送"，防邮箱枚举
        flash("若邮箱存在，重置链接已发送")
        return redirect(url_for("login"))
    return render_template("forgot.html")

@app.route("/reset", methods=["GET", "POST"])
def reset():
    token = request.args.get("token", "")
    try:
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        if payload.get("type") != "reset":
            raise jwt.InvalidTokenError()
    except jwt.InvalidTokenError:
        return "链接无效或已过期", 400
    if request.method == "POST":
        new_pwd = request.form.get("password")
        user = get_user(payload["user_id"])
        user.password_hash = generate_password_hash(new_pwd)
        db.session.commit()
        flash("密码已重置，请登录")
        return redirect(url_for("login"))
    return render_template("reset.html", token=token)
\`\`\`

## 十、Timing Attack：用恒定时间比较

\`\`\`txt filename="时序攻击原理"
普通 == 比较字符串：从头比，第一个不同就返回
攻击者不断试不同输入，测响应时间
响应稍长 → 前几位对了 → 逐位猜出
\`\`\`

\`\`\`python filename="用恒定时间比较防时序攻击"
from hmac import compare_digest

# ❌ 普通 == 有时序泄露
if user_token == stored_token:
    ...

# ✅ 恒定时间比较，无论对错耗时一样
if compare_digest(user_token, stored_token):
    ...
\`\`\`

> **JWT、API token、CSRF token 比较都用 \`compare_digest\`**。密码哈希校验（\`check_password_hash\`）内部已经用了恒定时间比较。

## 十一、完整示例：用户注册和登录密码处理

\`\`\`python filename="完整密码处理"
from flask import Flask, request, session, redirect, url_for, flash, render_template
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import re

app = Flask(__name__)
app.secret_key = "dev-secret"

def check_password_strength(pwd):
    if len(pwd) < 8: return "至少 8 位"
    if not re.search(r"[a-zA-Z]", pwd) or not re.search(r"\d", pwd):
        return "需同时含字母和数字"
    return None

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        email = request.form.get("email", "").strip()

        # 1. 校验密码强度
        err = check_password_strength(password)
        if err:
            flash(err)
            return render_template("register.html"), 400

        # 2. 查重
        if User.query.filter_by(username=username).first():
            flash("用户名已存在")
            return render_template("register.html"), 400

        # 3. ★ 哈希存储（绝不存明文）
        hashed = generate_password_hash(password, method="scrypt")

        # 4. 存库
        user = User(username=username, email=email, password_hash=hashed)
        db.session.add(user)
        db.session.commit()

        flash("注册成功，请登录")
        return redirect(url_for("login"))
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        user = User.query.filter_by(username=username).first()

        # ★ check_password_hash 恒定时间比较
        if user and check_password_hash(user.password_hash, password):
            session.clear()
            session["user_id"] = user.id
            session.permanent = True
            return redirect(url_for("dashboard"))

        # 不管用户不存在还是密码错，统一提示（防用户名枚举）
        flash("用户名或密码错误")
        return render_template("login.html"), 401
    return render_template("login.html")
\`\`\`

## 十二、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 明文存密码 | 脱库即泄露 | 必须 hash |
| 用 MD5/SHA1 | 快，易破解 | 用 bcrypt/argon2/scrypt |
| 不加盐 | 彩虹表破 | bcrypt 等内建加盐 |
| 自己实现哈希 | 易出错 | 用成熟库 |
| cost 设太低 | 破解变快 | 默认 12，硬件升级后调高 |
| 强度校验缺失 | 弱密码横行 | 校验长度 + 字符种类 |
| 密码错误提示区分用户 | 枚举用户名 | 统一"用户名或密码错" |
| 用 == 比 token | 时序攻击 | \`compare_digest\` |
| 重置 token 长期有效 | 被滥用 | 30 分钟过期 + 一次性 |
| 重置 token 不校验 type | 误用其他 token | payload 带 type 字段 |

## 十三、小结

密码安全的核心：**用慢哈希算法（bcrypt/argon2/scrypt）+ 加盐**存储，绝不明文。Flask 用 \`werkzeug.security\`，Django 用 \`make_password\`，跨框架用 \`passlib\`。注册时校验强度，登录时恒定时间比较，错误提示不区分用户名是否存在防枚举。重置流程用短期一次性 token。下一章讲基于角色的权限控制。
`
  },

  // =========================================================
  // 第四十八章：权限控制与 RBAC
  // =========================================================
  {
    id: "auth-rbac",
    group: "Session 与认证",
    icon: "🛡️",
    title: "权限控制与 RBAC",
    content: `

# 权限控制与 RBAC

## 一、为什么需要权限控制

登录解决了"你是谁"，但还要解决"你能做什么"。一个博客系统里：管理员能删任何文章，作者只能改自己的，游客只能看。这就是**授权（Authorization）**——和认证（Authentication）是两件事。

\`\`\`txt filename="认证 vs 授权"
认证（Authentication）   你是谁？    登录、token 校验
授权（Authorization）    你能做什么？ 权限检查、角色判断
顺序                   先认证 → 再授权
\`\`\`

## 二、RBAC 是什么

**RBAC**（Role-Based Access Control，基于角色的访问控制）：把权限挂到角色上，把角色分配给用户。用户 → 角色 → 权限 三层。

\`\`\`txt filename="RBAC 模型"
用户（User）   alice, bob
  ↓ 分配
角色（Role）   admin, editor, user
  ↓ 拥有
权限（Permission）  post:create, post:edit:any, post:delete:own
\`\`\`

为什么不直接"用户 → 权限"？因为权限太多，逐个给用户配会乱。引入"角色"这个中间层：把权限打包成角色，用户只需选角色。

\`\`\`txt filename="典型角色定义"
admin    全部权限：管用户、改/删任何文章、配置系统
editor   内容权限：发文章、改任何文章
author   自己内容：发文章、改自己的文章
user     只读：看文章、评论
guest    匿名：只能看公开内容
\`\`\`

## 三、权限矩阵

设计 RBAC 前先列**权限矩阵**：行是角色，列是操作，格子打勾。

\`\`\`txt filename="博客权限矩阵示例"
操作              admin  editor  author  user  guest
查看文章          ✅     ✅      ✅      ✅    ✅
发文章            ✅     ✅      ✅      ❌    ❌
改任意文章        ✅     ✅      ❌      ❌    ❌
改自己的文章      ✅     ✅      ✅      ❌    ❌
删任意文章        ✅     ✅      ❌      ❌    ❌
删自己的文章      ✅     ✅      ✅      ❌    ❌
管理用户          ✅     ❌      ❌      ❌    ❌
系统配置          ✅     ❌      ❌      ❌    ❌
\`\`\`

## 四、Flask 实现装饰器

\`\`\`python filename="role_required 装饰器"
from functools import wraps
from flask import g, abort

# 假设 g.current_user 有 role 属性
def role_required(*roles):
    """检查当前用户角色是否在允许列表里"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(g, "current_user", None)
            if not user:
                abort(401)  # 未登录
            if user.role not in roles:
                abort(403)  # 无权限
            return f(*args, **kwargs)
        return wrapper
    return decorator

# 用法
@app.route("/admin/users")
@login_required
@role_required("admin")
def admin_users():
    return "用户管理"

@app.route("/posts/<int:pid>/edit", methods=["POST"])
@login_required
@role_required("admin", "editor", "author")
def post_edit(pid):
    ...
\`\`\`

## 五、资源所有权：只能改自己的

光有角色不够：作者能改文章，但只能改**自己的**文章。这是"所有权检查"。

\`\`\`python filename="资源所有权检查"
@app.route("/posts/<int:pid>/edit", methods=["GET", "POST"])
@login_required
@role_required("admin", "editor", "author")
def post_edit(pid):
    post = Post.query.get_or_404(pid)
    # 所有权检查
    if not can_edit_post(g.current_user, post):
        abort(403)
    # ...

def can_edit_post(user, post):
    """判断用户能否编辑这篇文章"""
    if user.role == "admin":
        return True                          # 管理员：任意
    if user.role == "editor":
        return True                          # 编辑：任意
    if user.role == "author":
        return post.author_id == user.id     # 作者：仅自己
    return False
\`\`\`

\`\`\`python filename="权限检查函数集中管理"
# permissions.py - 统一权限判断逻辑
def can_view_post(user, post):
    if post.published:
        return True  # 已发布的任何人能看
    return user and (user.role in ("admin", "editor") or post.author_id == user.id)

def can_edit_post(user, post):
    if not user:
        return False
    if user.role in ("admin", "editor"):
        return True
    return post.author_id == user.id

def can_delete_post(user, post):
    if not user:
        return False
    if user.role == "admin":
        return True
    if user.role == "editor":
        return True
    return post.author_id == user.id

def can_manage_users(user):
    return user and user.role == "admin"
\`\`\`

## 六、前后端权限校验

\`\`\`txt filename="前后端权限校验的分工"
后端（必须做）   权威校验，拦住所有非法请求
前端（辅助）     隐藏不该看到的按钮、菜单，提升体验
原则            前端校验只为体验，后端才是安全边界
\`\`\`

\`\`\`jinja filename="模板里按权限渲染按钮"
{% if current_user and can_edit_post(current_user, post) %}
  <a href="/posts/{{ post.id }}/edit" class="btn">编辑</a>
{% endif %}
{% if current_user and can_delete_post(current_user, post) %}
  <a href="/posts/{{ post.id }}/delete" class="btn-danger">删除</a>
{% endif %}
{% if current_user and current_user.role == "admin" %}
  <a href="/admin" class="btn-admin">管理后台</a>
{% endif %}
\`\`\`

\`\`\`javascript filename="前端 API 拦截（仅体验）"
// 拦截器：无权限就别发请求
axios.interceptors.request.use(config => {
  if (config.url.startsWith("/admin") && userRole !== "admin") {
    return Promise.reject(new Error("无权限"));
  }
  return config;
});
// 注意：这只是体验优化，后端必须再校验一次
\`\`\`

## 七、API 权限设计

\`\`\`txt filename="REST API 权限模型"
权限粒度    操作 + 资源
GET    /posts          列表：登录用户可见
GET    /posts/{id}     详情：公开内容任何人可看
POST   /posts          创建：需 author 以上角色
PUT    /posts/{id}     更新：作者本人或 editor 以上
DELETE /posts/{id}     删除：作者本人或 editor 以上
GET    /admin/users    用户管理：仅 admin
\`\`\`

\`\`\`python filename="API 权限装饰器（结合 JWT）"
def permission_required(action):
    """按操作名检查权限"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = g.current_user
            if not user:
                return jsonify({"error": "未登录"}), 401
            # 权限映射表
            permission_map = {
                "post:create":  {"admin", "editor", "author"},
                "post:edit_any": {"admin", "editor"},
                "post:delete_any": {"admin", "editor"},
                "user:manage": {"admin"},
            }
            allowed_roles = permission_map.get(action, set())
            if user.role not in allowed_roles:
                return jsonify({"error": "无权限"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator

@app.route("/api/posts", methods=["POST"])
@jwt_required                # 认证：解 token 拿用户
@permission_required("post:create")  # 授权：检查角色
def create_post():
    ...

@app.route("/api/posts/<int:pid>", methods=["DELETE"])
@jwt_required
@permission_required("post:delete_any")
def delete_any_post(pid):
    ...
\`\`\`

\`\`\`python filename="API 所有权校验"
@app.route("/api/posts/<int:pid>", methods=["DELETE"])
@jwt_required
def delete_post(pid):
    post = Post.query.get_or_404(pid)
    user = g.current_user
    # 所有权：作者只能删自己的，admin/editor 可删任意
    if not can_delete_post(user, post):
        return jsonify({"error": "无权删除"}), 403
    db.session.delete(post)
    db.session.commit()
    return "", 204
\`\`\`

## 八、Django auth 权限系统

Django 自带成熟的权限系统：\`Group\`（角色）+ \`Permission\`（权限）+ 模型级权限。

\`\`\`python filename="Django 内置权限"
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth.decorators import permission_required, login_required

# 1. 创建角色（Group）
editors, _ = Group.objects.get_or_create(name="editors")

# 2. 给角色加权限（Django 自动为每个模型生成 add/change/delete/view 权限）
perm = Permission.objects.get(codename="change_post")
editors.permissions.add(perm)

# 3. 用户加入角色
user.groups.add(editors)

# 4. 装饰器校验
@permission_required("app.change_post", raise_exception=True)
def edit_post(request, pid):
    ...

# 5. 代码里检查
if user.has_perm("app.change_post"):
    ...
if user.has_perms(["app.add_post", "app.change_post"]):
    ...
\`\`\`

\`\`\`txt filename="Django 自动生成的模型权限"
每个模型自动生成 4 个权限：
app.add_model        添加
app.change_model     修改
app.delete_model     删除
app.view_model       查看
命名：app_label + action + model_name（小写）
\`\`\`

\`\`\`python filename="Django 自定义权限"
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)

    class Meta:
        permissions = [
            ("publish_post", "可以发布文章"),
            ("feature_post", "可以推荐文章"),
        ]
# 迁移后自动生成这些自定义权限
\`\`\`

## 九、完整示例：博客权限系统

\`\`\`python filename="博客权限完整实现"
from functools import wraps
from flask import Flask, g, abort, jsonify
from models import db, User, Post

app = Flask(__name__)

# 1. 权限检查函数（单一真相源）
def can_view_post(user, post):
    if post.published:
        return True
    if not user:
        return False
    if user.role in ("admin", "editor"):
        return True
    return post.author_id == user.id

def can_edit_post(user, post):
    if not user:
        return False
    if user.role in ("admin", "editor"):
        return True
    if user.role == "author":
        return post.author_id == user.id
    return False

def can_delete_post(user, post):
    return can_edit_post(user, post)  # 谁能改谁就能删

# 2. 装饰器
def role_required(*roles):
    def deco(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(g, "current_user", None)
            if not user:
                abort(401)
            if user.role not in roles:
                abort(403)
            return f(*args, **kwargs)
        return wrapper
    return deco

def owner_or_role_required(*roles, get_resource=None):
    """允许角色或资源所有者"""
    def deco(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = g.current_user
            if not user:
                abort(401)
            resource = get_resource(*args, **kwargs) if get_resource else None
            if user.role in roles:
                return f(*args, **kwargs)
            if resource and getattr(resource, "author_id", None) == user.id:
                return f(*args, **kwargs)
            abort(403)
        return wrapper
    return deco

# 3. 视图
def get_post(pid):
    return Post.query.get_or_404(pid)

@app.route("/posts/<int:pid>/edit", methods=["GET", "POST"])
@login_required
@owner_or_role_required("admin", "editor", get_resource=get_post)
def edit_post(pid):
    post = get_post(pid)
    # ...

@app.route("/admin/users")
@login_required
@role_required("admin")
def admin_users():
    users = User.query.all()
    # ...

@app.route("/api/posts/<int:pid>", methods=["DELETE"])
@login_required
def api_delete_post(pid):
    post = get_post(pid)
    if not can_delete_post(g.current_user, post):
        return jsonify({"error": "无权删除"}), 403
    db.session.delete(post)
    db.session.commit()
    return "", 204
\`\`\`

## 十、易错点小结

| 易错点 | 现象 | 正确做法 |
|--------|------|----------|
| 只前端校验 | 改请求绕过 | 后端必须校验 |
| 只查角色不查所有权 | 作者改别人文章 | 加资源所有权检查 |
| 权限逻辑散落各处 | 难维护 | 集中到 \`permissions.py\` |
| 403 vs 401 混用 | 语义乱 | 401 未登录，403 无权限 |
| 角色硬编码字符串 | 拼错不报错 | 用常量或枚举 |
| 删操作不二次确认 | 误删 | 危险操作要确认 |
| 模板不按权限渲染按钮 | 体验差 | 用 \`can_*\` 函数判断 |
| 修改接口用 PUT 不校验 | 越权改 | 每个写操作都校验 |
| 角色太多太细 | 难管理 | 5-7 个角色够用 |
| 权限矩阵不文档化 | 新人不懂 | 写权限矩阵文档 |

## 十一、小结

权限控制分两步：**角色检查**（role_required 装饰器）+ **资源所有权检查**（can_* 函数）。RBAC 用"用户 → 角色 → 权限"三层模型，权限矩阵文档化设计。前端校验只为体验，后端才是安全边界。Flask 用装饰器组合实现，Django 用内置 Group/Permission 系统。权限判断逻辑集中在 \`permissions.py\`，模板和视图都调用同一套函数避免不一致。至此 Session 与认证篇闭环：Session 管理 → JWT → 密码安全 → 权限控制，认证授权体系完整。
`
  },
];
