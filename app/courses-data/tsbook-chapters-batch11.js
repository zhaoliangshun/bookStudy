// =============================================================
// TypeScript 全解 · Batch 11：Node.js 实战（5 章）
// -------------------------------------------------------------
// 本 batch 覆盖 TypeScript 在 Node.js 后端场景的完整链路：
//   1. Node.js 模块与类型      tsbook-node-module
//   2. Express + TypeScript     tsbook-express-ts
//   3. async/await 与 Promise   tsbook-async-await
//   4. 错误处理与自定义错误     tsbook-error-handling
//   5. API 类型设计与 OpenAPI   tsbook-api-type
// 章节归属 group：Node.js 实战
// =============================================================

export const chapters = [
  // ===========================================================
  // 第 1 章：Node.js 模块与类型
  // ===========================================================
  {
    id: "tsbook-node-module",
    title: "Node.js 模块与类型",
    icon: "🟢",
    group: "Node.js 实战",
    content: `# 🟢 Node.js 模块与类型

TypeScript 写 Node.js 后端，第一道关是**搞清楚类型从哪来**。Node 本身是用 C++ 和 JS 写的，并不带类型——所有类型都来自 \`@types/node\` 这个 DefinitelyTyped 维护的声明包。

## 一、\`@types/node\` 是什么

\`\`\`bash
npm i -D @types/node
\`\`\`

装上之后，所有 Node 内置模块（\`fs\`、\`path\`、\`http\`、\`os\`、\`crypto\`…）都会自动获得类型。原理是 \`@types/node\` 在 \`node_modules/@types/node\` 下放了一堆 \`.d.ts\`，TS 编译器会自动把 \`@types\` 目录纳入类型搜索路径。

## 二、\`NodeJS\` 命名空间

\`@types/node\` 暴露了一个全局 \`NodeJS\` 命名空间，里面装着一些**进程级**的类型：

\`\`\`ts
const err: NodeJS.ErrnoException = new Error("ENOENT");  // 带 code 字段的错误
const timer: NodeJS.Timeout = setTimeout(() => {}, 1000);  // 定时器句柄
const stream: NodeJS.ReadStream = process.stdin;  // 标准输入流
\`\`\`

不需要 \`import\`，全局可用——因为 \`@types/node\` 用了 \`declare global\` 或 \`declare namespace NodeJS\`。

## 三、\`fs\` 文件系统模块

\`\`\`ts
import fs from "fs";            // 默认导入（需 esModuleInterop）
import { readFileSync } from "fs";  // 命名导入（更推荐）

const data: string = readFileSync("./a.txt", "utf-8");  // 同步读
fs.writeFileSync("./b.txt", "hi");                       // 同步写
\`\`\`

- **同步 API**（\`readFileSync\`）：阻塞，简单，适合脚本和启动期。
- **异步 API**（\`readFile\`）：回调风格，非阻塞，适合服务器。
- **Promise API**（\`fs/promises\`）：现代写法，配合 \`async/await\`。

\`\`\`ts
import { readFile } from "fs/promises";
const txt = await readFile("./a.txt", "utf-8");
\`\`\`

## 四、\`path\` 路径模块

跨平台拼路径必须用 \`path\`——Windows 用 \`\\\`，POSIX 用 \`/\`，硬编码迟早出 bug。

\`\`\`ts
import path from "path";

path.join("a", "b", "c");        // a/b/c（自动加分隔符）
path.resolve("a", "b");          // 绝对路径（基于 cwd）
path.extname("a.txt");           // .txt
path.basename("/x/y/a.txt");     // a.txt
\`\`\`

## 五、\`http\` 模块

Node 自带的 HTTP 服务器（Express、Koa 都是基于它封装的）：

\`\`\`ts
import http from "http";

const server = http.Server;  // 类型是 http.Server
const req: http.IncomingMessage;   // 请求类型
const res: http.ServerResponse;    // 响应类型
\`\`\`

\`http.IncomingMessage\` 是**可读流**，\`http.ServerResponse\` 是**可写流**——直接拿到原始字节。

## 六、\`Buffer\` 类型

\`Buffer\` 是 Node 专属的二进制数据容器（浏览器没有，浏览器用 \`ArrayBuffer\` / \`TypedArray\`）。它本质是 \`Uint8Array\` 的子类，但带了一堆工具方法。

\`\`\`ts
const buf: Buffer = Buffer.from("hello", "utf-8");  // 字符串转 Buffer
const str: string = buf.toString("utf-8");            // 转回字符串
const len: number = buf.length;                       // 字节数（不是字符数！）
\`\`\`

> ⚠️ \`buf.length\` 是**字节**数，不是字符数。\`Buffer.from("中文")\` 的 length 是 6（UTF-8 每个汉字 3 字节）。

## 七、一句话总结

- 装好 \`@types/node\`，所有内置模块自动有类型。
- 优先用 \`fs/promises\` + \`async/await\`，告别回调地狱。
- 拼路径必须用 \`path\`，跨平台才安全。
- \`Buffer.length\` 是字节数，处理中文要小心。

> *下一章，把 Node 原生 http 封装成 Express，看 TS 怎么和 Web 框架配合。*`,
    code: `// 🟢 Node.js 模块与类型 Demo

// ============================================================
// 1️⃣ fs 模块：读、写、判断存在
// ============================================================
import fs from "fs";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";  // Promise 版本，推荐

// 同步读：阻塞，简单，适合启动期加载配置
const pkg: string = readFileSync("./package.json", "utf-8");  // 第二参数指定编码，否则返回 Buffer
console.log("--- 1️⃣ fs 同步读取 ---");
console.log("package.json 前 80 字符：", pkg.slice(0, 80));

// 同步写
writeFileSync("/tmp/ts-hello.txt", "Hello from TS");  // 直接覆盖，无返回值

// 判断存在
const exists: boolean = existsSync("/tmp/ts-hello.txt");  // 返回 boolean
console.log("/tmp/ts-hello.txt 存在：", exists);

// ============================================================
// 2️⃣ fs/promises：异步 Promise 风格（推荐）
// ============================================================
async function demoAsyncFs(): Promise<void> {
  console.log("--- 2️⃣ fs/promises 异步 ---");
  // 写文件
  await writeFile("/tmp/ts-async.txt", "异步写入的内容", "utf-8");  // 返回 Promise<void>
  // 读文件
  const content: string = await readFile("/tmp/ts-async.txt", "utf-8");  // 返回 Promise<string>
  console.log("异步读回：", content);
}

// ============================================================
// 3️⃣ path 模块：跨平台路径拼接
// ============================================================
import path from "path";

console.log("--- 3️⃣ path 模块 ---");
const joined: string = path.join("users", "zhang", "docs", "a.txt");  // users/zhang/docs/a.txt
console.log("path.join:", joined);

const resolved: string = path.resolve("users", "zhang");  // 转成绝对路径（基于 process.cwd）
console.log("path.resolve:", resolved);

const ext: string = path.extname("photo.jpeg");  // .jpeg
console.log("path.extname:", ext);

const base: string = path.basename("/a/b/c.txt");  // c.txt（含扩展名）
console.log("path.basename:", base);

const dir: string = path.dirname("/a/b/c.txt");  // /a/b
console.log("path.dirname:", dir);

// 跨平台分隔符（Windows 是 \\，POSIX 是 /）
console.log("path.sep:", JSON.stringify(path.sep));  // 当前平台的分隔符

// ============================================================
// 4️⃣ Buffer 类型：二进制数据处理
// ============================================================

console.log("--- 4️⃣ Buffer 类型 ---");

// 从字符串创建 Buffer（指定编码，默认就是 utf-8）
const buf: Buffer = Buffer.from("Hello, 世界", "utf-8");  // Buffer 是 Uint8Array 的子类
console.log("Buffer:", buf);  // <Buffer 48 65 6c 6c 6f 2c 20 e4 b8 96 e7 95 8c>

// 字节数（注意不是字符数！）
const byteLen: number = buf.length;  // 13 字节（"Hello, " 7 字节 + "世界" 6 字节）
console.log("字节长度 buf.length:", byteLen);

// 字符数（用 TextDecoder 或 String.prototype.length）
const str: string = buf.toString("utf-8");  // 转回字符串
console.log("转回字符串:", str, "字符数:", str.length);  // 9 个字符

// 按字节切片（注意可能切到半个汉字！）
const slice: Buffer = buf.subarray(0, 7);  // 前 7 字节 = "Hello, "
console.log("subarray(0,7):", slice.toString("utf-8"));

// Buffer 与 TypedArray 互转
const u8: Uint8Array = new Uint8Array(buf);  // Buffer 可以直接当 Uint8Array 用
console.log("Uint8Array length:", u8.length);

// 十六进制 / Base64 编码
const hex: string = buf.toString("hex");  // 48656c6c6f2c20e4b896e7958c
const b64: string = buf.toString("base64");  // SGVsbG8sIOS4lueVjA==
console.log("hex:", hex);
console.log("base64:", b64);

// ============================================================
// 5️⃣ http 模块类型（不实际启动服务器，只演示类型）
// ============================================================
import http from "http";

console.log("--- 5️⃣ http 模块类型 ---");

// 创建服务器：泛型参数可以指定请求体类型
const server: http.Server = http.createServer((req, res) => {
  // req 是 http.IncomingMessage（继承自 Readable 流）
  // res 是 http.ServerResponse（继承自 Writable 流）
  const method: string = req.method;  // "GET" / "POST" / ...
  const url: string | undefined = req.url;  // 路径
  const headers: http.IncomingHttpHeaders = req.headers;  // 头部对象
  const userAgent: string | undefined = headers["user-agent"];  // 字段名全小写

  // 响应
  res.statusCode = 200;  // 设置状态码
  res.setHeader("Content-Type", "application/json");  // 设置响应头
  res.end(JSON.stringify({ method, url, userAgent }));  // 结束响应
});

// 不实际监听端口，只演示类型
console.log("server 构造成功，类型:", typeof server);
console.log("server instanceof http.Server:", server instanceof http.Server);

// 立即关闭，避免进程挂起
server.close();

// ============================================================
// 6️⃣ NodeJS 命名空间：进程级类型
// ============================================================

console.log("--- 6️⃣ NodeJS 命名空间 ---");

// process 对象：NodeJS.Process 类型
const cwd: string = process.cwd();  // 当前工作目录
const nodeEnv: string | undefined = process.env.NODE_ENV;  // 环境变量
const platform: NodeJS.Platform = process.platform;  // "darwin" / "linux" / "win32"
console.log("cwd:", cwd);
console.log("platform:", platform);
console.log("NODE_ENV:", nodeEnv ?? "(未设置)");

// 进程退出码
const exitCode: number = process.exitCode ?? 0;  // 不强制退出，只设置码
console.log("exitCode:", exitCode);

// 全局定时器：NodeJS.Timeout 类型
const timer: NodeJS.Timeout = setTimeout(() => {
  console.log("定时器触发");
}, 10);
clearTimeout(timer);  // 立即清除，不真正触发

// ============================================================
// 7️⃣ 综合示例：读 JSON 文件并解析
// ============================================================
function readJsonSync<T = unknown>(filePath: string): T {
  // 同步读取 + JSON 解析 + 类型断言
  const raw: string = readFileSync(filePath, "utf-8");  // 读为字符串
  return JSON.parse(raw) as T;  // 解析后断言成目标类型
}

// 等异步 fs 跑完再退出
demoAsyncFs().then(() => {
  console.log("--- 7️⃣ 综合：读 JSON ---");
  const pkgJson = readJsonSync<{ name: string; version: string }>("./package.json");
  console.log("项目名:", pkgJson.name);
  console.log("版本号:", pkgJson.version);
});
`,
  },

  // ===========================================================
  // 第 2 章：Express + TypeScript
  // ===========================================================
  {
    id: "tsbook-express-ts",
    title: "Express + TypeScript",
    icon: "🚂",
    group: "Node.js 实战",
    content: `# 🚂 Express + TypeScript

Express 是最经典的 Node Web 框架，本身是 JS 写的，但配合 \`@types/express\` 可以获得完整类型支持。核心是三个类型：\`Request\`、\`Response\`、\`NextFunction\`。

## 一、安装

\`\`\`bash
npm i express
npm i -D @types/express @types/node
\`\`\`

类型包没装的话，\`req.body\`、\`res.json()\` 全是 \`any\`，TS 形同虚设。

## 二、三个核心类型

\`\`\`ts
import express, { Request, Response, NextFunction } from "express";

const app = express();

app.get("/users/:id", (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;     // 路径参数，类型是 string
  const q = req.query.q;        // 查询参数，类型是 string | qs.ParsedQs | ...
  res.json({ id });             // 自动设置 Content-Type
});
\`\`\`

- **\`Request\`**：进来的请求，带 \`params\`、\`query\`、\`body\`、\`headers\`、\`cookies\` 等。
- **\`Response\`**：发出去的响应，带 \`json()\`、\`send()\`、\`status()\`、\`cookie()\` 等。
- **\`NextFunction\`**：交给下一个中间件，必须调用否则请求挂起。

## 三、路由参数泛型

\`Request\` 是泛型类型：\`Request<P, ResBody, ReqBody, ReqQuery, Locals>\`。

\`\`\`ts
interface Params { id: string }
interface Query { expand?: string }

app.get<Params>("/users/:id", (req, res) => {
  req.params.id;  // string（不是 string | undefined）
});
\`\`\`

实际项目里很少显式写泛型，因为 \`req.params\` 通常用 \`req.params.id\` 直接访问就够了。

## 四、自定义 \`Request\` 属性

Express 经典场景：登录后把 \`req.user\` 挂上去，后面中间件直接读。但默认 \`Request\` 上没有 \`user\` 字段——会报类型错误。

### 方案 1：声明合并（模块扩展）

\`\`\`ts
// types/express.d.ts
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; name: string };  // 给 Request 加字段
  }
}
\`\`\`

之后所有 \`req.user\` 都有类型——**全局生效**。

### 方案 2：自定义接口 + 类型断言

\`\`\`ts
interface AuthRequest extends Request {
  user: { id: string };
}
app.get("/me", (req: AuthRequest, res) => req.user.id);
\`\`\`

局部生效，更显式，但要手动断言。

## 五、中间件类型

中间件就是 \`(req, res, next) => void\`，类型用 \`RequestHandler\`：

\`\`\`ts
import { RequestHandler } from "express";

const logger: RequestHandler = (req, res, next) => {
  console.log(req.method, req.url);
  next();  // 必须 next，否则请求挂起
};

app.use(logger);  // 全局中间件
\`\`\

错误处理中间件是 4 个参数（Express 通过参数数量识别）：

\`\`\`ts
import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ error: err.message });
};
app.use(errorHandler);
\`\`\`

## 六、异步错误处理

Express 4 不会自动捕获 \`async\` 函数里的 \`reject\`——必须手动 \`next(err)\`：

\`\`\`ts
app.get("/users", async (req, res, next) => {
  try {
    const users = await db.findUsers();
    res.json(users);
  } catch (err) {
    next(err);  // 关键：交给错误中间件
  }
});
\`\`\`

Express 5 会自动捕获 \`async\` 错误，但目前主流还是 4.x。

## 七、一句话总结

- 装 \`@types/express\`，三个核心类型：\`Request\`、\`Response\`、\`NextFunction\`。
- 自定义 \`req.user\` 用 \`declare module "express-serve-static-core"\`。
- 中间件类型用 \`RequestHandler\` / \`ErrorRequestHandler\`。
- async 路由必须 \`try/catch + next(err)\`，否则错误会丢。

> *下一章，深入 async/await 与 Promise 的类型推演。*`,
    code: `// 🚂 Express + TypeScript Demo
// 注意：本 demo 不真正启动 HTTP 服务器，只演示类型与结构

import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  ErrorRequestHandler,
} from "express";

// ============================================================
// 1️⃣ 基础路由：三个核心类型
// ============================================================

const app = express();  // 创建 Express 应用

// 路径参数：req.params.id 是 string（注意：URL 里都是 string！）
app.get("/users/:id", (req: Request, res: Response, next: NextFunction) => {
  const id: string = req.params.id;  // 路径参数，恒为 string
  const fields: string | qs.ParsedQs | string[] | qs.ParsedQs[] | undefined = req.query.fields;
  // 简化：实际开发时直接断言
  const expand: string = req.query.expand as string;  // 强制断言成 string

  res.json({ id, fields, expand });  // 返回 JSON
});

// POST 请求 + body：需要 express.json() 中间件
app.use(express.json());  // 解析 JSON body，挂到 req.body

app.post("/users", (req: Request, res: Response) => {
  const body = req.body;  // 默认是 any
  res.status(201).json({ created: true, body });  // 201 Created
});

// ============================================================
// 2️⃣ 路由参数泛型：让 params 有具体类型
// ============================================================

interface UserParams {
  id: string;  // 路径参数都是 string
}

// 用泛型约束 req.params
app.get<UserParams>("/api/users/:id", (req, res) => {
  const id: string = req.params.id;  // 类型安全：一定是 string
  res.json({ id });
});

interface SearchQuery {
  q: string;          // 必填
  page?: string;      // 可选（URL 参数都是 string！）
}

app.get<{}, {}, {}, SearchQuery>("/search", (req, res) => {
  const q: string = req.query.q;            // 一定有
  const page: string | undefined = req.query.page;  // 可能没有
  res.json({ q, page: page ?? "1" });
});

// ============================================================
// 3️⃣ 自定义 Request 属性：模块扩展
// ============================================================
// 在 .d.ts 文件里写：
//   declare module "express-serve-static-core" {
//     interface Request {
//       user?: { id: string; name: string };
//     }
//   }
// 之后所有 req.user 都有类型

// 这里直接用模块扩展语法演示
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; name: string; role: "admin" | "user" };  // 可选字段
  }
}

// 鉴权中间件：往 req 上挂 user
const authMiddleware: RequestHandler = (req, res, next) => {
  const token: string | undefined = req.headers.authorization;
  if (!token) {
    res.status(401).json({ error: "未登录" });
    return;  // 必须 return，否则 next() 也会执行
  }
  // 真实场景：解析 JWT，这里直接伪造
  req.user = { id: "u123", name: "张三", role: "admin" };  // 类型安全：扩展后的字段
  next();  // 交给下一个中间件
};

app.get("/me", authMiddleware, (req: Request, res: Response) => {
  // 此时 req.user 一定存在（因为前面中间件保证）
  const user = req.user!;  // 非空断言
  res.json({ id: user.id, name: user.name, role: user.role });
});

// ============================================================
// 4️⃣ 中间件类型：RequestHandler
// ============================================================

// 日志中间件：所有请求都过它
const loggerMiddleware: RequestHandler = (req, res, next) => {
  const start: number = Date.now();  // 记录开始时间
  res.on("finish", () => {  // 响应结束时打印
    const duration: number = Date.now() - start;
    console.log(\`\${req.method} \${req.url} \${res.statusCode} \${duration}ms\`);
  });
  next();  // 关键：不调用 next，请求会一直挂起
};

// 限流中间件（演示结构）
const rateLimitMiddleware: RequestHandler = (req, res, next) => {
  const ip: string = req.ip ?? "unknown";  // 客户端 IP
  // 真实场景：用 Map 或 Redis 计数
  console.log(\`请求来自 \${ip}\`);
  next();
};

app.use(loggerMiddleware);       // 全局注册
app.use(rateLimitMiddleware);    // 全局注册

// ============================================================
// 5️⃣ 错误处理中间件：4 个参数，Express 通过数量识别
// ============================================================

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // err 是 Error 或其子类
  const status: number = (err as any).status ?? 500;  // 自定义错误可能带 status
  const message: string = err.message;
  const stack: string | undefined = process.env.NODE_ENV === "development" ? err.stack : undefined;

  res.status(status).json({
    error: message,
    stack,  // 生产环境不暴露堆栈
  });
};

// 必须最后注册（注册顺序决定执行顺序）
app.use(errorHandler);

// ============================================================
// 6️⃣ 异步路由：必须 try/catch + next(err)
// ============================================================

// 模拟数据库查询
async function findUserById(id: string): Promise<{ id: string; name: string } | null> {
  if (id === "u123") return { id, name: "张三" };
  return null;  // 找不到
}

// Express 4 不会自动捕获 async 错误！必须手动处理
app.get("/users/:id/profile", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await findUserById(req.params.id);  // 可能抛错（数据库故障）
    if (!user) {
      // 方式 1：构造错误交给 next
      const err = new Error("用户不存在");
      (err as any).status = 404;
      return next(err);  // 必须显式 next(err)
    }
    res.json(user);
  } catch (err) {
    next(err as Error);  // 关键：把错误传给错误中间件
  }
});

// ============================================================
// 7️⃣ 路由模块化：express.Router
// ============================================================

import { Router } from "express";

const userRouter = Router();  // 创建子路由

userRouter.get("/", (req: Request, res: Response) => {
  res.json([{ id: "1", name: "张三" }]);
});

userRouter.get("/:id", (req: Request, res: Response) => {
  res.json({ id: req.params.id });
});

userRouter.post("/", (req: Request, res: Response) => {
  const body = req.body as { name: string };
  res.status(201).json({ id: "new", name: body.name });
});

app.use("/api/users", userRouter);  // 挂载到 /api/users 下

// ============================================================
// 8️⃣ 启动（演示用，不真正 listen）
// ============================================================

console.log("--- 🚂 Express 应用已构造 ---");
console.log("app 的类型:", typeof app);
console.log("app._router 存在:", !!(app as any)._router);

// 真实启动：
// app.listen(3000, () => console.log("Server on :3000"));
`,
  },

  // ===========================================================
  // 第 3 章：async/await 与 Promise 类型
  // ===========================================================
  {
    id: "tsbook-async-await",
    title: "async/await 与 Promise 类型",
    icon: "⏳",
    group: "Node.js 实战",
    content: `# ⏳ async/await 与 Promise 类型

\`async/await\` 是 Promise 的语法糖，让异步代码看起来像同步。但**它本质上还是 Promise**——理解 Promise 类型是基础。

## 一、\`Promise<T>\` 是什么

\`Promise<T>\` 表示"将来会拿到一个 \`T\` 类型的值"。

\`\`\`ts
const p: Promise<number> = new Promise((resolve) => {
  setTimeout(() => resolve(42), 1000);
});

p.then((n) => console.log(n));  // n 是 number
\`\`\`

- \`resolve(x)\` 把值传给 \`.then\`。
- \`reject(err)\` 把错误传给 \`.catch\`。
- \`Promise<T>\` 的泛型参数是 \`resolve\` 的值类型。

## 二、\`async\` 函数总是返回 \`Promise\`

**核心规则**：\`async\` 函数的返回类型，永远是被 \`Promise\` 包裹的版本。

\`\`\`ts
async function getNum(): Promise<number> {
  return 42;  // 返回 number，但函数签名是 Promise<number>
}

async function getString() {  // 推断为 Promise<string>
  return "hi";
}
\`\`\`

即使你显式 \`return\` 一个原始值，TS 也会自动包成 \`Promise\`。如果 \`return\` 的已经是 \`Promise\`，不会双层包裹：

\`\`\`ts
async function chain() {
  return anotherAsyncFn();  // 不会变成 Promise<Promise<T>>，自动展平
}
\`\`\`

## 三、\`await\` 的类型

\`await\` 会"拆开" \`Promise\`，拿到里面的值：

\`\`\`ts
const n: number = await getNum();  // await Promise<number> → number
\`\`\`

如果 \`await\` 一个非 Promise 值，TS 会用 \`Promise.resolve()\` 包一层——所以 \`await 42\` 也是合法的（返回 42）。

\`await\` 只能在 \`async\` 函数或**顶层 await**（ES2022+）里用。

## 四、错误处理：\`try/catch\` vs \`.catch()\`

\`\`\`ts
// 方式 1：try/catch（推荐，更直观）
try {
  const data = await fetchData();
} catch (err) {
  // err 类型是 unknown（TS 4.4+）
  const msg = err instanceof Error ? err.message : String(err);
}

// 方式 2：.catch() 链式
const data = await fetchData().catch((err) => {
  console.error(err);
  return defaultValue;  // 失败时返回默认值，让流程继续
});
\`\`\

\`catch\` 子句里的 \`err\` 默认是 \`unknown\`（TS 4.4+），必须先收窄类型才能访问属性。

## 五、\`Promise.all\` / \`race\` / \`allSettled\` / \`any\`

\`\`\`ts
const [a, b, c] = await Promise.all([fa(), fb(), fc()]);  // 并行，全成功才返回
const first = await Promise.race([fa(), fb()]);            // 第一个完成（无论成功失败）
const results = await Promise.allSettled([fa(), fb()]);    // 全部完成（不抛错）
const firstOk = await Promise.any([fa(), fb()]);           // 第一个成功
\`\`\`

\`Promise.all\` 的类型很巧妙：传入 \`[Promise<A>, Promise<B>]\`，返回 \`Promise<[A, B]>\`——元组类型保留。

\`\`\`ts
const results = await Promise.all([
  fetch("/a").then(r => r.json()),  // Promise<User>
  fetch("/b").then(r => r.json()),  // Promise<Post>
]);
// results: [User, Post]
\`\`\`

\`Promise.allSettled\` 返回 \`PromiseSettledResult<T>\` 数组：

\`\`\`ts
type PromiseSettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };
\`\`\`

## 六、并发 vs 串行

**串行**：\`await\` 之间有依赖，逐个等。

\`\`\`ts
const user = await getUser(id);
const posts = await getPosts(user.id);  // 依赖 user
\`\`\`

**并行**：无依赖，用 \`Promise.all\`。

\`\`\`ts
// ❌ 错误：这其实是串行（第二个 await 在第一个完成后才开始）
const a = await fa();
const b = await fb();

// ✅ 正确：并行
const [a, b] = await Promise.all([fa(), fb()]);
\`\`\`

## 七、\`for await...of\`：异步迭代

处理异步流（如 Node 的 readable stream）：

\`\`\`ts
for await (const chunk of stream) {
  console.log(chunk);
}
\`\`\

## 八、一句话总结

- \`async\` 函数永远返回 \`Promise<T>\`，\`await\` 永远拆出 \`T\`。
- \`catch\` 里的 \`err\` 是 \`unknown\`，先收窄再用。
- 无依赖的异步用 \`Promise.all\` 并行，省时间。
- \`Promise.allSettled\` 适合"尽力而为"的场景。

> *下一章，把错误处理做成系统化方案——自定义 Error 与 Result 模式。*`,
    code: `// ⏳ async/await 与 Promise 类型 Demo

// ============================================================
// 1️⃣ Promise 基础：手动构造与泛型
// ============================================================

console.log("--- 1️⃣ Promise 构造 ---");

// Promise<T> 的泛型参数是 resolve 的值类型
const p1: Promise<number> = new Promise((resolve) => {
  setTimeout(() => resolve(42), 10);  // 1 秒后返回 42
});

const p2: Promise<string> = new Promise((resolve) => {
  setTimeout(() => resolve("hello"), 5);
});

// 用 .then 链式处理
p1.then((n: number) => n * 2).then((doubled: number) => {
  console.log("p1 * 2 =", doubled);  // 84
});

// ============================================================
// 2️⃣ async 函数：永远返回 Promise
// ============================================================

// 显式标注返回 Promise<number>
async function getNum(): Promise<number> {
  return 42;  // 返回 number，自动包成 Promise<number>
}

// 不标注，TS 推断为 Promise<string>
async function getString() {
  return "hello";  // 推断返回 Promise<string>
}

// 返回 Promise 不会双层包裹
async function chained(): Promise<number> {
  return getNum();  // 不会变成 Promise<Promise<number>>
}

// async 函数内部可以 await
async function compute(): Promise<number> {
  const a: number = await getNum();     // await 拆出 number
  const b: number = await chained();    // 同样拆出 number
  return a + b;                          // 42 + 42 = 84
}

compute().then((result: number) => {
  console.log("--- 2️⃣ async 函数 ---");
  console.log("compute() =", result);  // 84
});

// ============================================================
// 3️⃣ 错误处理：try/catch 与 .catch()
// ============================================================

// 模拟可能失败的异步操作
async function riskyFetch(success: boolean): Promise<string> {
  if (!success) {
    throw new Error("网络错误");  // 抛出 Error
  }
  return "数据加载成功";
}

// 方式 1：try/catch（推荐）
async function withTryCatch(): Promise<string> {
  try {
    const data: string = await riskyFetch(false);  // 可能抛错
    return data;
  } catch (err: unknown) {  // TS 4.4+：err 是 unknown
    // 必须先收窄类型才能访问 .message
    if (err instanceof Error) {
      return \`错误：\${err.message}\`;  // 此处 err 收窄为 Error
    }
    return \`未知错误：\${String(err)}\`;
  }
}

// 方式 2：.catch() 链式（适合提供默认值）
async function withCatch(): Promise<string> {
  const data: string = await riskyFetch(false).catch((err: unknown) => {
    // 失败时返回默认值，让流程继续
    return \`降级：\${err instanceof Error ? err.message : "unknown"}\`;
  });
  return data;  // 一定是 string（不会抛错）
}

console.log("--- 3️⃣ 错误处理 ---");
withTryCatch().then(console.log);  // 错误：网络错误
withCatch().then(console.log);     // 降级：网络错误

// ============================================================
// 4️⃣ Promise.all：并行执行
// ============================================================

async function fetchUser(): Promise<{ id: string; name: string }> {
  await new Promise(r => setTimeout(r, 5));
  return { id: "u1", name: "张三" };
}

async function fetchPosts(): Promise<string[]> {
  await new Promise(r => setTimeout(r, 8));
  return ["文章1", "文章2", "文章3"];
}

async function fetchComments(): Promise<number> {
  await new Promise(r => setTimeout(r, 3));
  return 42;
}

// Promise.all 的类型推演：传入元组，返回元组
async function loadAll(): Promise<void> {
  const start = Date.now();
  const [user, posts, comments] = await Promise.all([
    fetchUser(),       // Promise<{ id, name }>
    fetchPosts(),      // Promise<string[]>
    fetchComments(),   // Promise<number>
  ]);
  // 三个变量的类型分别是：{ id, name }, string[], number
  const elapsed = Date.now() - start;
  console.log("--- 4️⃣ Promise.all 并行 ---");
  console.log(\`耗时 \${elapsed}ms（理论最快 ~8ms，并行）\`);
  console.log("user:", user);
  console.log("posts:", posts);
  console.log("comments:", comments);
}
loadAll();

// ============================================================
// 5️⃣ 串行 vs 并行：性能对比
// ============================================================

// ❌ 串行：总耗时 = 5 + 8 + 3 = 16ms
async function serial(): Promise<void> {
  const start = Date.now();
  const user = await fetchUser();       // 5ms
  const posts = await fetchPosts();     // 8ms
  const comments = await fetchComments(); // 3ms
  console.log("--- 5️⃣ 串行（慢）---");
  console.log(\`串行耗时 \${Date.now() - start}ms\`);
}

// ✅ 并行：总耗时 = max(5, 8, 3) = 8ms
async function parallel(): Promise<void> {
  const start = Date.now();
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments(),
  ]);
  console.log("--- 5️⃣ 并行（快）---");
  console.log(\`并行耗时 \${Date.now() - start}ms\`);
}

serial().then(parallel);

// ============================================================
// 6️⃣ Promise.allSettled：全部完成，不抛错
// ============================================================

async function loadAllSettled(): Promise<void> {
  // 即使有失败，也等全部完成
  const results = await Promise.allSettled([
    fetchUser(),                         // 成功
    riskyFetch(false),                   // 失败
    fetchComments(),                     // 成功
  ]);

  console.log("--- 6️⃣ Promise.allSettled ---");
  results.forEach((result, i) => {
    // result 类型是 PromiseSettledResult<T>
    if (result.status === "fulfilled") {  // 判别联合类型
      console.log(\`[\${i}] 成功:\`, result.value);  // 此处 result.value 有类型
    } else {
      console.log(\`[\${i}] 失败:\`, result.reason);  // 此处 result.reason 是 any
    }
  });
}
loadAllSettled();

// ============================================================
// 7️⃣ Promise.race / Promise.any
// ============================================================

// race：第一个完成（无论成功/失败）即返回
async function demoRace(): Promise<void> {
  const slow = new Promise<string>(r => setTimeout(() => r("慢"), 50));
  const fast = new Promise<string>(r => setTimeout(() => r("快"), 5));
  const winner: string = await Promise.race([slow, fast]);
  console.log("--- 7️⃣ Promise.race ---");
  console.log("胜者:", winner);  // 快
}
demoRace();

// any：第一个成功（全部失败才抛 AggregateError）
async function demoAny(): Promise<void> {
  const fail = new Promise<string>((_, rej) => setTimeout(() => rej(new Error("失败")), 5));
  const ok = new Promise<string>(r => setTimeout(() => r("成功"), 10));
  try {
    const result: string = await Promise.any([fail, ok]);  // 跳过失败，等成功
    console.log("--- 7️⃣ Promise.any ---");
    console.log("结果:", result);  // 成功
  } catch (err) {
    // 全部失败时抛 AggregateError
    console.log("全部失败:", err);
  }
}
demoAny();

// ============================================================
// 8️⃣ for await...of：异步迭代
// ============================================================

// 把数组包装成异步可迭代对象
async function* asyncGenerator(): AsyncGenerator<number> {
  for (let i = 1; i <= 3; i++) {
    await new Promise(r => setTimeout(r, 2));  // 模拟异步
    yield i;  // 产出值
  }
}

async function demoForAwait(): Promise<void> {
  console.log("--- 8️⃣ for await...of ---");
  for await (const num of asyncGenerator()) {
    // 每次迭代都 await
    console.log("收到:", num);  // 1, 2, 3
  }
}
demoForAwait();
`,
  },

  // ===========================================================
  // 第 4 章：错误处理与自定义错误
  // ===========================================================
  {
    id: "tsbook-error-handling",
    title: "错误处理与自定义错误",
    icon: "🛡️",
    group: "Node.js 实战",
    content: `# 🛡️ 错误处理与自定义错误

错误处理是后端代码的命脉。JS 原生 \`Error\` 类功能简陋，TS 4.0+ 的 \`cause\` 字段、自定义错误子类、Result 模式是构建健壮错误处理的三件套。

## 一、原生 \`Error\` 类

\`\`\`ts
const err = new Error("文件未找到");
err.message;   // "文件未找到"
err.name;      // "Error"
err.stack;     // 调用栈字符串
\`\`\`

JS 的 \`Error\` 是特殊的——它不能用 \`Object.create(Error.prototype)\` 复制，必须用 \`new Error()\`。TS 里 \`Error\` 的构造签名：

\`\`\`ts
new (message?: string): Error;
\`\`\`

## 二、\`ErrorOptions\` 与 \`cause\`（TS 4.0+ / ES2022）

ES2022 给 \`Error\` 加了第二个参数 \`ErrorOptions\`，可以传 \`cause\` 字段记录"原始错误"：

\`\`\`ts
try {
  JSON.parse(badJson);
} catch (err) {
  throw new Error("解析配置文件失败", { cause: err });  // 链式记录原因
}
\`\`\`

\`cause\` 类型是 \`unknown\`（不限定必须是 \`Error\`），所以读取时要先收窄。

错误链路：

\`\`\`
应用错误（"配置加载失败"）
  └── cause: 原始错误（"Unexpected token in JSON"）
        └── cause: 更底层错误（文件读取失败）
\`\`\`

排查问题时，顺着 \`cause\` 链一路看下去，就能看到完整调用栈。

## 三、自定义 Error 子类

JS 原生错误只有几种（\`TypeError\`、\`RangeError\`、\`SyntaxError\`…），实际项目需要更细的分类。

### 正确写法

\`\`\`ts
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);          // 必须先调 super
    this.name = "ValidationError";  // 关键：设置 name
    // 兼容旧引擎：修复原型链
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
\`\`\`

**两个坑**：

1. **必须 \`super(message)\`**：\`Error\` 是特殊类，不调 \`super\` 的话 \`this.message\` 是 \`undefined\`。
2. **必须 \`Object.setPrototypeOf\`**：Babel/TS 编译 \`extends Error\` 后原型链会断（这是 ES5 继承的已知问题），手动修复才行。

### \`instanceof\` 判别

\`\`\`ts
try {
  // ...
} catch (err) {
  if (err instanceof ValidationError) {
    res.status(400).json({ field: err.field, message: err.message });
  } else if (err instanceof DatabaseError) {
    res.status(500).json({ message: "数据库错误" });
  } else {
    res.status(500).json({ message: "未知错误" });
  }
}
\`\`\`

\`instanceof\` 比读 \`err.name\` 字符串更安全——类型收窄后能访问子类专属字段。

## 四、判别联合错误

配合 \`kind\` 字段做判别联合，比 \`instanceof\` 更适合跨进程/跨边界的场景：

\`\`\`ts
type AppError =
  | { kind: "validation"; field: string; message: string }
  | { kind: "auth"; code: number; message: string }
  | { kind: "database"; table: string; message: string };

function handle(err: AppError) {
  switch (err.kind) {
    case "validation": return err.field;  // 此处类型收窄
    case "auth":       return err.code;
    case "database":   return err.table;
  }
}
\`\`\`

好处：跨 JSON 序列化不丢失信息（\`instanceof\` 序列化后就失效了）。

## 五、Result 模式

Rust 风格的 \`Result<T, E>\` 类型，把错误当返回值，不用 \`throw\`：

\`\`\`ts
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return { ok: false, error: "除数不能为 0" };
  return { ok: true, value: a / b };
}

const r = divide(10, 0);
if (r.ok) {
  console.log(r.value);  // 此处 r 是 { ok: true; value: number }
} else {
  console.log(r.error);  // 此处 r 是 { ok: false; error: string }
}
\`\`\`

**优点**：错误显式出现在类型签名里，调用方必须处理。
**缺点**：写起来啰嗦，不符合 JS 主流风格（Go 是这种风格）。

实际项目里，**\`throw\` + \`try/catch\` 是主流**，\`Result\` 模式适合关键路径（如解析不可信输入）。

## 六、错误处理 best practice

1. **不要吞错误**：\`catch (e) {}\` 是反模式，至少打个日志。
2. **错误要分类**：自定义 \`ValidationError\`、\`AuthError\`、\`DatabaseError\`，方便上层分支处理。
3. **保留 \`cause\`**：包装错误时务必传 \`cause\`，别丢失原始信息。
4. **\`catch\` 的 \`err\` 是 \`unknown\`**：必须先收窄（\`instanceof\` 或 typeof）再访问。

## 七、一句话总结

- 自定义错误 \`extends Error\`，必调 \`super\`，必 \`setPrototypeOf\`。
- TS 4.0+ 用 \`cause\` 链式记录原始错误。
- 跨边界场景用判别联合（\`kind\` 字段），比 \`instanceof\` 更鲁棒。
- 关键路径考虑 \`Result<T, E>\`，逼调用方处理错误。

> *最后一章，把类型设计推到 API 层——DTO、Response 包装、zod 验证。*`,
    code: `// 🛡️ 错误处理与自定义错误 Demo

// ============================================================
// 1️⃣ 原生 Error 与 ErrorOptions
// ============================================================

console.log("--- 1️⃣ 原生 Error ---");

// 基础 Error
const err1 = new Error("文件未找到");  // message 是第一个参数
console.log("message:", err1.message);   // "文件未找到"
console.log("name:", err1.name);         // "Error"
console.log("stack 前 40 字符:", err1.stack?.slice(0, 40));

// ErrorOptions.cause：ES2022 新增，记录原始错误
try {
  JSON.parse("{ invalid json }");  // 故意解析失败
} catch (err: unknown) {
  // 用 cause 包装，保留原始错误链
  const wrapped = new Error("配置文件解析失败", {
    cause: err,  // 记录原始错误（类型是 unknown）
  });
  console.log("包装错误:", wrapped.message);
  console.log("原始 cause:", (wrapped.cause as Error)?.message);
}

// ============================================================
// 2️⃣ 自定义 ValidationError：字段校验错误
// ============================================================

class ValidationError extends Error {
  // 用构造参数属性简写：public field 自动成为实例属性
  constructor(
    public field: string,        // 出错的字段名
    message: string,             // 错误描述
    public code?: string,        // 可选错误码
  ) {
    super(message);  // 关键 1：必须先调 super(message)
    this.name = "ValidationError";  // 关键 2：设置 name，便于识别
    // 关键 3：修复原型链（Babel/TS 编译 extends Error 的已知问题）
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

// 测试 ValidationError
function validateEmail(email: string): void {
  if (!email.includes("@")) {
    throw new ValidationError("email", "邮箱格式不正确", "INVALID_EMAIL");
  }
  if (email.length > 100) {
    throw new ValidationError("email", "邮箱长度超出限制", "EMAIL_TOO_LONG");
  }
}

console.log("--- 2️⃣ ValidationError ---");
try {
  validateEmail("not-an-email");  // 触发校验错误
} catch (err: unknown) {
  // instanceof 收窄类型
  if (err instanceof ValidationError) {
    console.log("字段:", err.field);     // "email"
    console.log("消息:", err.message);   // "邮箱格式不正确"
    console.log("代码:", err.code);      // "INVALID_EMAIL"
  }
}

// ============================================================
// 3️⃣ 自定义 DatabaseError：数据库错误
// ============================================================

class DatabaseError extends Error {
  constructor(
    public table: string,         // 出错的表名
    public operation: "insert" | "update" | "delete" | "select",
    message: string,
    public cause?: unknown,       // 原始驱动错误
  ) {
    super(message);
    this.name = "DatabaseError";
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  // 实例方法：格式化错误信息
  toLogString(): string {
    return \`[\${this.operation}:\${this.table}] \${this.message}\`;
  }
}

// 模拟数据库操作
async function insertUser(name: string): Promise<void> {
  if (name.length === 0) {
    throw new DatabaseError("users", "insert", "用户名不能为空");
  }
  // 模拟唯一约束冲突
  if (name === "duplicate") {
    const driverErr = new Error("UNIQUE constraint failed");
    throw new DatabaseError("users", "insert", "用户名已存在", driverErr);  // 带 cause
  }
  console.log(\`插入用户 \${name} 成功\`);
}

console.log("--- 3️⃣ DatabaseError ---");
(async () => {
  try {
    await insertUser("duplicate");  // 触发唯一约束
  } catch (err: unknown) {
    if (err instanceof DatabaseError) {
      console.log(err.toLogString());  // [insert:users] 用户名已存在
      if (err.cause) {
        console.log("原始错误:", (err.cause as Error).message);  // UNIQUE constraint failed
      }
    }
  }
})();

// ============================================================
// 4️⃣ 统一错误处理：分类捕获
// ============================================================

class AuthError extends Error {
  constructor(
    public code: number,  // 401 / 403
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// 统一错误处理器：根据类型映射 HTTP 状态码
function toHttpStatus(err: unknown): { status: number; body: unknown } {
  if (err instanceof ValidationError) {
    return { status: 400, body: { field: err.field, message: err.message, code: err.code } };
  }
  if (err instanceof AuthError) {
    return { status: err.code, body: { message: err.message } };
  }
  if (err instanceof DatabaseError) {
    return { status: 500, body: { message: "数据库错误", detail: err.toLogString() } };
  }
  // 兜底：未知错误
  if (err instanceof Error) {
    return { status: 500, body: { message: err.message } };
  }
  return { status: 500, body: { message: "未知错误" } };
}

console.log("--- 4️⃣ 统一错误处理 ---");
console.log("ValidationError →", toHttpStatus(new ValidationError("name", "必填")));
console.log("AuthError →", toHttpStatus(new AuthError(401, "未登录")));
console.log("DatabaseError →", toHttpStatus(new DatabaseError("users", "insert", "失败")));
console.log("普通 Error →", toHttpStatus(new Error("奇怪的错误")));
console.log("非 Error →", toHttpStatus("string error"));

// ============================================================
// 5️⃣ Result 模式：把错误当返回值
// ============================================================

// Result<T, E>：成功带 value，失败带 error
type Result<T, E = Error> =
  | { ok: true; value: T }      // 成功分支
  | { ok: false; error: E };    // 失败分支

// 工具函数：包装可能抛错的同步操作
function trySync<T>(fn: () => T): Result<T, Error> {
  try {
    return { ok: true, value: fn() };  // 成功：返回 value
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

// 除法函数：用 Result 而不是 throw
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: "除数不能为 0" };  // 失败：返回 error
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { ok: false, error: "参数必须是有限数" };
  }
  return { ok: true, value: a / b };  // 成功：返回 value
}

console.log("--- 5️⃣ Result 模式 ---");

// 使用：调用方必须处理两种情况
const r1 = divide(10, 2);
if (r1.ok) {
  // 此处 r1 类型被收窄为 { ok: true; value: number }
  console.log("10 / 2 =", r1.value);  // 5
} else {
  // 此处 r1 类型被收窄为 { ok: false; error: string }
  console.log("错误:", r1.error);
}

const r2 = divide(10, 0);
if (r2.ok) {
  console.log("10 / 0 =", r2.value);
} else {
  console.log("10 / 0 错误:", r2.error);  // 除数不能为 0
}

// 用 trySync 包装 JSON.parse
const r3 = trySync(() => JSON.parse("{ \\"name\\": \\"张三\\" }"));
if (r3.ok) {
  console.log("解析成功:", r3.value);  // { name: "张三" }
}

const r4 = trySync(() => JSON.parse("{ invalid }"));
if (!r4.ok) {
  console.log("解析失败:", r4.error.message);  // Unexpected token
}

// ============================================================
// 6️⃣ 错误链：用 cause 记录完整调用栈
// ============================================================

class ServiceError extends Error {
  constructor(
    public service: string,  // 服务名
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });  // 传给父类的 ErrorOptions
    this.name = "ServiceError";
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

// 模拟三层调用：Controller → Service → Database
function databaseLayer(): never {
  throw new Error("连接超时");  // 最底层错误
}

function serviceLayer(): void {
  try {
    databaseLayer();
  } catch (err) {
    // 包装一层，记录 cause
    throw new ServiceError("UserService", "获取用户列表失败", err);
  }
}

function controllerLayer(): void {
  try {
    serviceLayer();
  } catch (err) {
    // 再包装一层，记录 cause
    throw new Error("HTTP 500: 处理请求失败", { cause: err });
  }
}

console.log("--- 6️⃣ 错误链 cause ---");
try {
  controllerLayer();
} catch (err: unknown) {
  // 沿着 cause 链一路打印
  let current: unknown = err;
  let depth = 0;
  while (current instanceof Error) {
    const prefix = "  ".repeat(depth);
    console.log(\`\${prefix}└─ \${current.name}: \${current.message}\`);
    current = current.cause;  // 顺着 cause 往下挖
    depth++;
  }
}
`,
  },

  // ===========================================================
  // 第 5 章：API 类型设计与 OpenAPI
  // ===========================================================
  {
    id: "tsbook-api-type",
    title: "API 类型设计与 OpenAPI",
    icon: "🌐",
    group: "Node.js 实战",
    content: `# 🌐 API 类型设计与 OpenAPI

后端 API 的类型设计，决定了前后端协作的效率。**单一数据源**（Single Source of Truth）是核心原则——类型只在一边定义，另一边自动同步。

## 一、API 类型的三层结构

\`\`\`
┌─────────────────────────────────────────┐
│  DTO（Data Transfer Object）            │  ← 网络传输的形状
│  请求体 / 响应体的字段类型               │
├─────────────────────────────────────────┤
│  Domain Model（领域模型）                │  ← 业务逻辑用
│  User、Order、Product 等核心实体         │
├─────────────────────────────────────────┤
│  Database Schema（数据库 schema）        │  ← 持久化层
│  UserRow、OrderRow（直接对应表结构）     │
└─────────────────────────────────────────┘
\`\`\`

**三者不要混用**！数据库的 \`UserRow\` 可能有 \`password_hash\`，但 API 响应的 \`UserDTO\` 绝不能暴露这个字段。

\`\`\`ts
// 数据库行：包含敏感字段
interface UserRow {
  id: string;
  email: string;
  password_hash: string;  // 敏感
  created_at: Date;
}

// API 响应 DTO：脱敏后给前端
interface UserDTO {
  id: string;
  email: string;
  // 不包含 password_hash
  createdAt: string;  // 序列化成 ISO 字符串
}

// 转换函数：Row → DTO
function toDTO(row: UserRow): UserDTO {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at.toISOString(),
  };
}
\`\`\`

## 二、请求与响应类型分离

每个 API 端点至少有三种类型：

\`\`\`ts
// 1. 请求体（POST/PUT 才有）
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

// 2. 请求参数（URL 上的）
interface GetUserParams {
  id: string;
}

// 3. 请求查询参数（? 后面的）
interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

// 4. 响应体
interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
\`\`\`

**命名约定**：\`XxxRequest\`（入参）、\`XxxResponse\`（出参）、\`XxxDTO\`（数据传输对象）、\`XxxRow\`（数据库行）。

## 三、统一响应包装：\`Response<T>\`

实际项目通常用统一包装格式，前端可以写通用拦截器：

\`\`\`ts
interface ApiResponse<T> {
  code: number;       // 业务码：0 成功，其他失败
  message: string;    // 提示信息
  data: T;            // 实际数据，用泛型
  timestamp: number;  // 服务器时间戳
}

// 成功响应
function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: "OK", data, timestamp: Date.now() };
}

// 失败响应
function fail(code: number, message: string): ApiResponse<null> {
  return { code, message, data: null, timestamp: Date.now() };
}

// 路由 handler 返回 ApiResponse<UserDTO>
app.get("/users/:id", (req, res) => {
  const user = findUser(req.params.id);
  res.json(ok(toDTO(user)));  // ApiResponse<UserDTO>
});
\`\`\`

前端拿到后，先检查 \`code\`，再决定用不用 \`data\`。

## 四、分页响应

\`\`\`ts
interface Paginated<T> {
  items: T[];           // 当前页数据
  total: number;        // 总条数
  page: number;         // 当前页码
  pageSize: number;     // 每页大小
  hasMore: boolean;     // 是否还有下一页
}

type ListUsersResponse = ApiResponse<Paginated<UserDTO>>;
\`\`\`

\`Paginated<T>\` 是另一个泛型包装，和 \`ApiResponse<T>\` 组合使用。

## 五、zod：运行时验证 + 类型推导

类型只在编译时存在，运行时全是 \`any\`。用户传进来的 JSON 是不是合法？\`zod\` 解决这个问题——**一份 schema，既能验证又能生成类型**。

\`\`\`ts
import { z } from "zod";

// 定义 schema
const CreateUserSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(0).optional(),
});

// 从 schema 推导出类型
type CreateUserRequest = z.infer<typeof CreateUserSchema>;
// 等价于手动写的：
// { name: string; email: string; password: string; age?: number }

// 运行时验证
const result = CreateUserSchema.safeParse(req.body);
if (!result.success) {
  // result.error 是结构化的错误信息
  return fail(400, result.error.message);
}
const data: CreateUserRequest = result.data;  // 类型安全的合法数据
\`\`\

**核心优势**：schema 是单一数据源，类型从 schema 推导出来——永远不会再出现"类型说有 \`name\`，运行时却没有"的尴尬。

## 六、OpenAPI / Swagger

OpenAPI 是 REST API 的规范描述格式（YAML/JSON），Swagger UI 能把它渲染成交互式文档。

TS 项目里通常用 \`swagger-jsdoc\` 或 \`@asteasolutions/zod-to-openapi\`，从 zod schema 自动生成 OpenAPI spec，**避免手写 YAML**。

\`\`\`ts
// 用 zod 注册 schema，自动生成 OpenAPI
registry.register("User", UserSchema);
registry.register("CreateUserRequest", CreateUserSchema);
\`\`\

前端可以用 \`openapi-typescript\` 从 OpenAPI spec 反向生成 TS 类型——形成"后端 zod → OpenAPI → 前端类型"的闭环。

## 七、best practice 清单

1. **DTO 与领域模型分离**：别把数据库行直接当响应返回。
2. **统一响应包装**：\`ApiResponse<T>\` 让前端写通用拦截器。
3. **用 zod 做运行时验证**：类型从 schema 推导，保证一致性。
4. **OpenAPI 是单一数据源**：后端定义，前端反向生成，禁止两边手写。
5. **字段命名用 camelCase**：JS 习惯；数据库的 snake_case 在转换层映射。

## 八、一句话总结

- API 类型分三层：\`Row\`（数据库）→ \`Domain\`（业务）→ \`DTO\`（传输），不要混。
- 用 \`ApiResponse<T>\` 和 \`Paginated<T>\` 泛型包装，统一响应格式。
- 用 \`zod\` 做"单一数据源"：schema 既能验证又能推类型。
- OpenAPI 把后端类型导出给前端，闭环自动化。

> *Batch 11 完结！下一 batch 我们进入测试与工程化实战。*`,
    code: `// 🌐 API 类型设计与 OpenAPI Demo

// ============================================================
// 1️⃣ 三层类型：Row → Domain → DTO
// ============================================================

// 数据库行类型：直接对应表结构（snake_case）
interface UserRow {
  id: string;
  user_name: string;        // 数据库字段名
  email: string;
  password_hash: string;    // 敏感字段，不能暴露给前端
  is_active: number;        // 数据库用 0/1 表示布尔
  created_at: Date;         // 数据库的 Date 对象
}

// 领域模型：业务逻辑用（camelCase）
interface User {
  id: string;
  userName: string;
  email: string;
  passwordHash: string;     // 内部用，但不返回给前端
  isActive: boolean;
  createdAt: Date;
}

// DTO：网络传输用（脱敏 + 序列化）
interface UserDTO {
  id: string;
  userName: string;
  email: string;
  isActive: boolean;
  createdAt: string;        // 序列化成 ISO 字符串
}

// 转换函数 1：Row → Domain
function rowToDomain(row: UserRow): User {
  return {
    id: row.id,
    userName: row.user_name,           // snake → camel
    email: row.email,
    passwordHash: row.password_hash,
    isActive: row.is_active === 1,     // 0/1 → boolean
    createdAt: row.created_at,
  };
}

// 转换函数 2：Domain → DTO（脱敏）
function toDTO(user: User): UserDTO {
  return {
    id: user.id,
    userName: user.userName,
    email: user.email,
    // 不返回 passwordHash（脱敏）
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),  // Date → ISO 字符串
  };
}

console.log("--- 1️⃣ 三层类型转换 ---");
const fakeRow: UserRow = {
  id: "u1",
  user_name: "张三",
  email: "zhang@example.com",
  password_hash: "$2b$10$xxx",
  is_active: 1,
  created_at: new Date("2025-01-01"),
};
const user = rowToDomain(fakeRow);
const dto = toDTO(user);
console.log("DTO:", dto);  // 不包含 password_hash

// ============================================================
// 2️⃣ 请求 / 响应类型分离
// ============================================================

// 创建用户：请求体
interface CreateUserRequest {
  userName: string;
  email: string;
  password: string;
  age?: number;            // 可选
}

// 创建用户：响应体
interface CreateUserResponse {
  id: string;
  userName: string;
  email: string;
  createdAt: string;
}

// 列表查询：路径参数
interface GetUserParams {
  id: string;              // URL 上的参数恒为 string
}

// 列表查询：query 参数
interface ListUsersQuery {
  page?: string;           // query 参数也是 string（前端传过来都是字符串）
  pageSize?: string;
  search?: string;
}

// 模拟 controller：返回 CreateUserResponse
function handleCreateUser(body: CreateUserRequest): CreateUserResponse {
  return {
    id: "new-id",
    userName: body.userName,
    email: body.email,
    createdAt: new Date().toISOString(),
  };
}

console.log("--- 2️⃣ 请求/响应类型 ---");
const created = handleCreateUser({
  userName: "李四",
  email: "li@example.com",
  password: "secret123",
});
console.log("创建用户响应:", created);

// ============================================================
// 3️⃣ 统一响应包装：ApiResponse<T>
// ============================================================

// 泛型包装：所有 API 返回统一格式
interface ApiResponse<T> {
  code: number;            // 业务码：0 成功，非 0 失败
  message: string;         // 提示信息
  data: T;                 // 实际数据（泛型）
  timestamp: number;       // 服务器时间戳
}

// 成功响应构造器
function ok<T>(data: T): ApiResponse<T> {
  return {
    code: 0,
    message: "OK",
    data,                   // 泛型 data
    timestamp: Date.now(),
  };
}

// 失败响应构造器
function fail(code: number, message: string): ApiResponse<null> {
  return {
    code,
    message,
    data: null,             // 失败时 data 为 null
    timestamp: Date.now(),
  };
}

console.log("--- 3️⃣ ApiResponse<T> ---");
const okResp: ApiResponse<UserDTO> = ok(dto);  // 泛型实例化为 UserDTO
console.log("成功响应:", okResp);

const failResp: ApiResponse<null> = fail(404, "用户不存在");
console.log("失败响应:", failResp);

// ============================================================
// 4️⃣ 分页响应：Paginated<T>
// ============================================================

interface Paginated<T> {
  items: T[];               // 当前页数据
  total: number;            // 总条数
  page: number;             // 当前页码
  pageSize: number;         // 每页大小
  hasMore: boolean;         // 是否还有下一页
}

// 分页构造器
function paginate<T>(items: T[], total: number, page: number, pageSize: number): Paginated<T> {
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,  // 计算是否还有下一页
  };
}

console.log("--- 4️⃣ Paginated<T> ---");
const page = paginate<UserDTO>([dto], 100, 1, 10);
const listResp: ApiResponse<Paginated<UserDTO>> = ok(page);  // 泛型嵌套
console.log("分页响应:", JSON.stringify(listResp, null, 2));

// ============================================================
// 5️⃣ 错误响应：用判别联合区分
// ============================================================

// 业务错误码枚举
enum ErrorCode {
  VALIDATION = 1001,
  AUTH = 1002,
  NOT_FOUND = 1003,
  RATE_LIMIT = 1004,
}

// 错误响应类型
type ErrorResponse =
  | { code: ErrorCode.VALIDATION; message: string; field: string }
  | { code: ErrorCode.AUTH; message: string }
  | { code: ErrorCode.NOT_FOUND; message: string; resource: string }
  | { code: ErrorCode.RATE_LIMIT; message: string; retryAfter: number };

// 处理错误响应：switch 收窄
function describeError(err: ErrorResponse): string {
  switch (err.code) {
    case ErrorCode.VALIDATION:
      return \`校验错误：\${err.field} - \${err.message}\`;  // 此处 err 有 field
    case ErrorCode.AUTH:
      return \`鉴权错误：\${err.message}\`;  // 此处 err 无 field
    case ErrorCode.NOT_FOUND:
      return \`未找到：\${err.resource}\`;  // 此处 err 有 resource
    case ErrorCode.RATE_LIMIT:
      return \`限流：\${err.retryAfter}ms 后重试\`;  // 此处 err 有 retryAfter
  }
}

console.log("--- 5️⃣ 错误响应 ---");
console.log(describeError({ code: ErrorCode.VALIDATION, message: "必填", field: "email" }));
console.log(describeError({ code: ErrorCode.NOT_FOUND, message: "不存在", resource: "user" }));
console.log(describeError({ code: ErrorCode.RATE_LIMIT, message: "太快了", retryAfter: 1000 }));

// ============================================================
// 6️⃣ zod 风格的 schema + 类型推导（手写模拟，不依赖 zod）
// ============================================================

// 模拟 zod 的 schema 推导（实际项目用 zod 库）
// 这里手写一个简化的 schema 系统

type Schema =
  | { kind: "string"; min?: number; max?: number; optional?: boolean }
  | { kind: "number"; min?: number; max?: number; optional?: boolean }
  | { kind: "boolean"; optional?: boolean }
  | { kind: "object"; fields: Record<string, Schema> };

// 从 Schema 推导 TS 类型（条件类型递归）
type Infer<S extends Schema> =
  S extends { kind: "string" }
    ? S extends { optional: true } ? string | undefined : string
    : S extends { kind: "number" }
      ? S extends { optional: true } ? number | undefined : number
      : S extends { kind: "boolean" }
        ? S extends { optional: true } ? boolean | undefined : boolean
        : S extends { kind: "object" }
          ? { [K in keyof S["fields"] as S["fields"][K] extends { optional: true } ? never : K]: Infer<S["fields"][K]> } &
            { [K in keyof S["fields"] as S["fields"][K] extends { optional: true } ? K : never]?: Infer<S["fields"][K]> }
          : never;

// 定义 CreateUser 的 schema
const createUserSchema = {
  kind: "object",
  fields: {
    userName: { kind: "string", min: 1, max: 50 } as const,
    email: { kind: "string", min: 1, max: 100 } as const,
    password: { kind: "string", min: 8, max: 100 } as const,
    age: { kind: "number", min: 0, max: 200, optional: true } as const,
  },
} as const;

// 手动等价的类型（实际项目用 z.infer 自动推导）
interface CreateUserInferred {
  userName: string;
  email: string;
  password: string;
  age?: number;     // 可选
}

console.log("--- 6️⃣ Schema 驱动类型 ---");
console.log("schema:", JSON.stringify(createUserSchema, null, 2));

// 模拟运行时验证
function validateCreateUser(input: unknown): CreateUserInferred {
  if (typeof input !== "object" || input === null) {
    throw new Error("输入必须是对象");
  }
  const obj = input as Record<string, unknown>;
  if (typeof obj.userName !== "string" || obj.userName.length < 1) {
    throw new Error("userName 必须是非空字符串");
  }
  if (typeof obj.email !== "string" || !obj.email.includes("@")) {
    throw new Error("email 格式不正确");
  }
  if (typeof obj.password !== "string" || obj.password.length < 8) {
    throw new Error("password 至少 8 位");
  }
  if (obj.age !== undefined && (typeof obj.age !== "number" || obj.age < 0)) {
    throw new Error("age 必须是非负数");
  }
  return {
    userName: obj.userName,
    email: obj.email,
    password: obj.password,
    age: obj.age as number | undefined,
  };
}

// 测试验证
try {
  const valid = validateCreateUser({
    userName: "王五",
    email: "wang@example.com",
    password: "password123",
    age: 25,
  });
  console.log("验证通过:", valid);
} catch (err) {
  console.log("验证失败:", (err as Error).message);
}

try {
  validateCreateUser({ userName: "x", email: "bad", password: "123" });  // 故意失败
} catch (err) {
  console.log("预期失败:", (err as Error).message);
}

// ============================================================
// 7️⃣ 完整 API 类型导出（给前端用）
// ============================================================

// 完整的 API 类型映射表：前端可以 import 这些类型
export type UserAPI = {
  // GET /users/:id
  GetUser: {
    Params: { id: string };
    Response: ApiResponse<UserDTO>;
  };
  // GET /users
  ListUsers: {
    Query: ListUsersQuery;
    Response: ApiResponse<Paginated<UserDTO>>;
  };
  // POST /users
  CreateUser: {
    Body: CreateUserRequest;
    Response: ApiResponse<CreateUserResponse>;
  };
  // DELETE /users/:id
  DeleteUser: {
    Params: { id: string };
    Response: ApiResponse<{ deleted: boolean }>;
  };
};

console.log("--- 7️⃣ API 类型导出 ---");
console.log("UserAPI 类型已定义（前端可 import 使用）");

// 模拟前端调用：基于类型生成 mock 数据
const mockGetUserResp: UserAPI["GetUser"]["Response"] = {
  code: 0,
  message: "OK",
  data: {
    id: "u1",
    userName: "张三",
    email: "zhang@example.com",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  timestamp: Date.now(),
};
console.log("Mock GetUser 响应:", mockGetUserResp);
`,
  },
];
