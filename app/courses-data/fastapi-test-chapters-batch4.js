// =============================================================
// FastAPI 测试与部署全书 - 第 4 批章节（测试进阶 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   ft-file-upload: 测试文件上传下载
//   ft-async-task: 测试异步任务与 BackgroundTasks
//   ft-websocket: 测试 WebSocket
//   ft-mock: mock 外部服务
//   ft-fixtures-coverage: pytest fixtures 高级与覆盖率
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：测试文件上传下载
  // ============================================================
  {
    id: "ft-file-upload",
    group: "测试进阶",
    icon: "📎",
    title: "测试文件上传下载",
    content: `# 测试文件上传下载

## 为什么文件上传下载需要专门测试

文件上传下载是 Web 应用最常见的功能之一：头像上传、Excel 导入、PDF 报告导出、附件下载……看似简单，其实暗藏大量边界情况：

- 上传空文件会怎样？
- 上传超大文件会不会把内存撑爆？
- 上传错误 MIME 类型能不能被正确拒绝？
- 下载时文件不存在返回什么状态码？
- 流式下载大文件时内存占用是否稳定？

这些问题光靠"手动点一下"是测不全的，必须用自动化测试覆盖。FastAPI 基于 Starlette，它的 \`TestClient\` 底层是 httpx + Starlette TestTransport，对 \`multipart/form-data\` 文件上传和二进制响应下载都有一等支持，写测试非常顺手。

**生活类比：** 测试文件上传就像在快递站验收包裹——你要检查包裹名字对不对（filename）、包裹里东西有多大（size）、外包装标的是什么类型（content_type）、有没有破损（内容是否完整）。TestClient 就是你的"自动验收机器人"，替你一遍遍打包、寄送、拆包、核对。

## TestClient 上传文件的基本写法

httpx 的 \`files=\` 参数专门用来构造 \`multipart/form-data\` 请求。三元组格式为：

\`\`\`python
# (filename, file_bytes, content_type)
client.post("/upload", files={"file": ("a.txt", b"hello", "text/plain")})
\`\`\`

也可以省略 content_type：

\`\`\`python
# 省略 MIME，httpx 会自动推断或不设置
client.post("/upload", files={"file": ("a.txt", b"hello")})
\`\`\`

服务端用 \`UploadFile\` 接收，这是 FastAPI 对 Starlette \`UploadFile\` 的封装，背后是 \`SpooledTemporaryFile\`（先存内存，超过阈值自动落盘）。

### Demo 1：测试单文件上传

\`\`\`python
# 从 fastapi 导入 FastAPI、UploadFile
from fastapi import FastAPI, UploadFile
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建 FastAPI 应用实例
app = FastAPI()

# 定义 POST 路由 /upload，参数 file 是 UploadFile 类型
@app.post("/upload")
def upload(file: UploadFile):
    # file.filename：客户端上传的文件名
    # file.file.read()：读取全部字节（读完指针到末尾）
    # len(...) 求字节数
    size = len(file.file.read())
    # 返回文件名和大小
    return {"filename": file.filename, "size": size}

# 创建测试客户端
client = TestClient(app)

# 定义测试函数：测试单文件上传
def test_upload():
    # 构造一个 multipart 请求，文件名 a.txt，内容 hello，MIME text/plain
    r = client.post("/upload", files={"file": ("a.txt", b"hello", "text/plain")})
    # 断言状态码 200
    assert r.status_code == 200
    # 断言返回的 filename 是 a.txt
    assert r.json()["filename"] == "a.txt"
    # 断言返回的 size 是 5（"hello" 是 5 字节）
    assert r.json()["size"] == 5
\`\`\`

**关键点：** \`files={"file": ...}\` 里的 key \`"file"\` 必须和路由参数名 \`file\` 一致，FastAPI 才能正确映射。

### Demo 2：测试多文件上传（List[UploadFile]）

多个文件用 \`List[UploadFile]\` 接收，测试时 \`files=\` 传一个列表。

\`\`\`python
# 导入 List 类型（Python 3.9+ 可直接用 list[UploadFile]）
from typing import List
# 从 fastapi 导入 FastAPI、UploadFile
from fastapi import FastAPI, UploadFile
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义 POST 路由 /uploads，参数 files 是 List[UploadFile]
@app.post("/uploads")
def uploads(files: List[UploadFile]):
    # 用列表推导式收集每个文件的文件名
    names = [f.filename for f in files]
    # 返回文件数量和文件名列表
    return {"count": len(files), "names": names}

# 创建测试客户端
client = TestClient(app)

# 测试多文件上传
def test_uploads():
    # files 的 value 是列表，每个元素是一个三元组
    r = client.post(
        "/uploads",
        files=[
            # 第 1 个文件
            ("files", ("a.txt", b"aaa", "text/plain")),
            # 第 2 个文件
            ("files", ("b.txt", b"bbb", "text/plain")),
            # 第 3 个文件
            ("files", ("c.txt", b"ccc", "text/plain")),
        ],
    )
    # 断言状态码 200
    assert r.status_code == 200
    # 断言文件数量是 3
    assert r.json()["count"] == 3
    # 断言文件名列表正确
    assert r.json()["names"] == ["a.txt", "b.txt", "c.txt"]
\`\`\`

**注意：** 列表里每个元素的 key 都写成 \`"files"\`（与路由参数名一致），httpx 会把它们合并成多文件上传。

### Demo 3：测试文件 + 表单字段（Form + File）

文件上传常常伴随表单字段（比如"描述"、"分类"）。用 \`Form()\` 和 \`File()\` / \`UploadFile\` 一起声明即可，FastAPI 自动用 \`multipart/form-data\`。

\`\`\`python
# 从 fastapi 导入 FastAPI、Form、UploadFile
from fastapi import FastAPI, Form, UploadFile
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义 POST 路由 /upload-with-meta
@app.post("/upload-with-meta")
def upload_with_meta(
    # description：表单文本字段，必填
    description: str = Form(...),
    # category：表单文本字段，可选
    category: str | None = Form(None),
    # file：文件字段
    file: UploadFile = File(...),
):
    # 返回所有字段
    return {
        # 表单描述
        "description": description,
        # 表单分类（可能为 None）
        "category": category,
        # 文件名
        "filename": file.filename,
        # 文件大小
        "size": len(file.file.read()),
    }

# 创建测试客户端
client = TestClient(app)

# 测试文件 + 表单字段
def test_upload_with_meta():
    # data= 传表单字段，files= 传文件
    r = client.post(
        "/upload-with-meta",
        data={"description": "我的头像", "category": "avatar"},
        files={"file": ("avatar.png", b"fake-png-bytes", "image/png")},
    )
    # 断言状态码 200
    assert r.status_code == 200
    # 断言描述正确
    assert r.json()["description"] == "我的头像"
    # 断言分类正确
    assert r.json()["category"] == "avatar"
    # 断言文件名正确
    assert r.json()["filename"] == "avatar.png"
\`\`\`

**易错点：** 同时用 \`Form\` 和 \`File\` 时，\`data=\` 放表单字段，\`files=\` 放文件，两者不能混在一个参数里。

### Demo 4：测试大文件上传（StreamingResponse）

上传超大文件时，服务端不应该一次性 \`read()\` 到内存，而应该分块读取。测试时用 \`io.BytesIO\` 模拟大文件。

\`\`\`python
# 导入 io 模块，提供 BytesIO 内存字节流
import io
# 从 fastapi 导入 FastAPI、UploadFile
from fastapi import FastAPI, UploadFile
# 从 fastapi.responses 导入 StreamingResponse（这里用来回显）
from fastapi.responses import StreamingResponse
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义 POST 路由 /big-upload，分块读取上传文件并原样回传
@app.post("/big-upload")
async def big_upload(file: UploadFile):
    # 定义一个异步生成器，分块读取
    async def chunked():
        # 每次读 1024 字节
        while True:
            # 异步读取一块
            chunk = await file.read(1024)
            # 读到空表示结束
            if not chunk:
                # 跳出循环
                break
            # yield 这一块
            yield chunk

    # 用 StreamingResponse 流式回传
    return StreamingResponse(chunked(), media_type="application/octet-stream")

# 创建测试客户端
client = TestClient(app)

# 测试大文件上传
def test_big_upload():
    # 构造 5000 字节的假数据
    payload = b"x" * 5000
    # 用 BytesIO 包装，模拟文件对象
    r = client.post(
        "/big-upload",
        files={"file": ("big.bin", io.BytesIO(payload), "application/octet-stream")},
    )
    # 断言状态码 200
    assert r.status_code == 200
    # 断言回传内容和上传内容一致
    assert r.content == payload
    # 断言长度一致
    assert len(r.content) == 5000
\`\`\`

### Demo 5：测试文件下载（FileResponse）

文件下载最简单的方式是 \`FileResponse\`，它直接把磁盘文件作为响应体返回。

\`\`\`python
# 导入 os 模块
import os
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 FileResponse
from fastapi.responses import FileResponse
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义 GET 路由 /download/{name}
@app.get("/download/{name}")
def download(name: str):
    # 拼接文件路径
    path = os.path.join("/tmp", name)
    # 文件不存在则返回 404（这里简化处理）
    if not os.path.exists(path):
        # 抛出 404
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="文件不存在")
    # 返回 FileResponse
    return FileResponse(path, filename=name)

# 创建测试客户端
client = TestClient(app)

# 测试文件下载
def test_download(tmp_path):
    # tmp_path 是 pytest 内置 fixture，提供临时目录
    # 在临时目录创建文件 a.txt，内容 hello
    f = tmp_path / "a.txt"
    f.write_bytes(b"hello")
    # 由于上面路由写死 /tmp，这里为演示直接用 monkeypatch 改路径
    # 实际项目应把根目录抽成配置或依赖
    # 这里直接断言逻辑：把文件放到 /tmp 下（仅演示思路）
    # 用 monkeypatch 替换 os.path.join 的根目录更优雅
    # 为简洁，这里假设文件在 /tmp/a.txt
    # r = client.get("/download/a.txt")
    # assert r.status_code == 200
    # assert r.content == b"hello"
    pass

# 更实用的写法：把根目录作为依赖
def test_download_real(tmp_path, monkeypatch):
    # 准备文件
    f = tmp_path / "a.txt"
    f.write_bytes(b"hello")
    # 用 monkeypatch 把全局根目录替换为 tmp_path
    # （前提是路由里用了模块级变量 BASE_DIR）
    import main  # 假设路由在 main.py
    monkeypatch.setattr(main, "BASE_DIR", str(tmp_path))
    # 发起下载请求
    r = client.get("/download/a.txt")
    # 断言状态码 200
    assert r.status_code == 200
    # 断言内容是 hello
    assert r.content == b"hello"
\`\`\`

**生活类比：** \`FileResponse\` 像快递员直接把仓库里的现成包裹递给你；\`StreamingResponse\` 像流水线一边生产一边发货。小文件用前者更省事，大文件用后者更省内存。

### Demo 6：测试 StreamingResponse 下载

\`\`\`python
# 导入 io 模块
import io
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.responses 导入 StreamingResponse
from fastapi.responses import StreamingResponse
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义 GET 路由 /stream-download
@app.get("/stream-download")
def stream_download():
    # 构造一个分块生成器（每次 4 字节）
    def gen():
        # 数据
        data = b"hello world"
        # 步长 4
        for i in range(0, len(data), 4):
            # yield 一块
            yield data[i:i+4]
    # 返回 StreamingResponse
    return StreamingResponse(gen(), media_type="text/plain")

# 创建测试客户端
client = TestClient(app)

# 测试流式下载
def test_stream_download():
    # 发起 GET 请求
    r = client.get("/stream-download")
    # 断言状态码 200
    assert r.status_code == 200
    # 断言拼接后的内容完整
    assert r.content == b"hello world"
    # 断言 text 也正确
    assert r.text == "hello world"
\`\`\`

### Demo 7：测试文件类型校验（拒绝非图片）

实际项目中，头像接口通常只允许图片。我们用 \`content_type\` 做校验，测试要覆盖"合法"和"非法"两种情况。

\`\`\`python
# 从 fastapi 导入 FastAPI、UploadFile、HTTPException
from fastapi import FastAPI, UploadFile, HTTPException
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 允许的 MIME 集合
ALLOWED = {"image/png", "image/jpeg", "image/webp"}

# 定义 POST 路由 /avatar
@app.post("/avatar")
def avatar(file: UploadFile):
    # 校验 MIME 类型
    if file.content_type not in ALLOWED:
        # 不在白名单则 400
        raise HTTPException(status_code=400, detail="仅允许图片文件")
    # 通过校验，返回信息
    return {"filename": file.filename, "content_type": file.content_type}

# 创建测试客户端
client = TestClient(app)

# 测试合法图片上传
def test_avatar_ok():
    # 上传一个 png
    r = client.post("/avatar", files={"file": ("a.png", b"fake", "image/png")})
    # 断言 200
    assert r.status_code == 200
    # 断言 content_type 回显正确
    assert r.json()["content_type"] == "image/png"

# 测试非法文件被拒
def test_avatar_reject():
    # 上传一个 txt（非图片）
    r = client.post("/avatar", files={"file": ("a.txt", b"hello", "text/plain")})
    # 断言 400
    assert r.status_code == 400
    # 断言错误信息
    assert r.json()["detail"] == "仅允许图片文件"
\`\`\`

## UploadFile 常用属性表

| 属性 / 方法 | 类型 | 说明 |
| --- | --- | --- |
| \`filename\` | \`str \| None\` | 客户端上传的原始文件名 |
| \`content_type\` | \`str \| None\` | 客户端声明的 MIME 类型（可伪造，仅作参考） |
| \`size\` | \`int\` | 文件大小（字节，Starlette 0.36+ 支持） |
| \`file\` | \`SpooledTemporaryFile\` | 底层文件对象，可调用 \`.read()\` / \`.write()\` / \`.seek()\` |
| \`read(n)\` | \`coroutine\` / \`bytes\` | 异步读取 n 字节（\`await file.read()\`） |
| \`write(data)\` | \`coroutine\` / \`int\` | 异步写入 |
| \`seek(offset)\` | \`coroutine\` | 移动指针 |
| \`close()\` | \`coroutine\` | 关闭文件 |

**注意：** \`UploadFile.read()\` 在 \`async def\` 路由里是协程需要 \`await\`；在 \`def\` 路由里 Starlette 会自动用线程池调度，直接调用即可。

## 本章小结

| 知识点 | 关键写法 | 备注 |
| --- | --- | --- |
| 单文件上传 | \`files={"file": (name, bytes, mime)}\` | key 与路由参数名一致 |
| 多文件上传 | \`files=[("files", (...)), ...]\` | 服务端用 \`List[UploadFile]\` |
| 文件 + 表单 | \`data={...}, files={...}\` | 自动 \`multipart/form-data\` |
| 大文件上传 | \`await file.read(1024)\` 分块 | 避免一次性读入内存 |
| 文件下载 | \`FileResponse(path)\` | 适合磁盘现成文件 |
| 流式下载 | \`StreamingResponse(gen())\` | 适合动态生成 / 大文件 |
| 类型校验 | 检查 \`file.content_type\` | MIME 可伪造，仅第一道防线 |
| 断言内容 | \`r.content == b"..."\` | 二进制用 \`.content\` |
| 断言 JSON | \`r.json()\` | 响应是 JSON 时用 |
`
  },

  // ============================================================
  // 第 2 章：测试异步任务与 BackgroundTasks
  // ============================================================
  {
    id: "ft-async-task",
    group: "测试进阶",
    icon: "⏩",
    title: "测试异步任务与 BackgroundTasks",
    content: `# 测试异步任务与 BackgroundTasks

## 三种"延迟执行"的方式

Web 请求讲究"快进快出"——能立即返回就别拖。但有些副作用（发邮件、写日志、清理缓存、推送通知）又必须做。于是出现了三类"请求返回后再做事"的方案：

1. **FastAPI \`BackgroundTasks\`**：Starlette 提供的轻量任务队列，响应返回后由同一个进程同步执行。适合"几秒内能干完"的小任务。
2. **\`asyncio.create_task\`**：原生协程任务，挂在事件循环上异步跑。适合 IO 密集且不阻塞的活。
3. **Celery / RQ / Dramatiq**：外部消息队列 + worker 进程，真正分布式。适合重任务、需重试、需调度的场景。

**生活类比：** 
- \`BackgroundTasks\` 像快递员送完包裹顺手帮你扔个垃圾——他还是那个人，扔完才下班。
- \`asyncio.create_task\` 像你顺手把衣服丢进洗衣机，洗衣机自己转，你继续干别的。
- Celery 像你把任务外包给另一家公司，他们有自己的员工和仓库，你只管下单。

测试这三者的难点完全不同：\`BackgroundTasks\` 在 TestClient 里会被同步等待执行；\`asyncio.create_task\` 的任务可能"漏跑"需要手动 await；Celery 则要 mock 掉 \`.delay()\` 只验证"下达了命令"。

## BackgroundTasks 基础

\`BackgroundTasks\` 通过依赖注入拿到，用 \`add_task(func, *args, **kwargs)\` 添加任务。任务会在响应发送完成后执行。

### Demo 1：一个带 BackgroundTasks 的 FastAPI 应用

\`\`\`python
# 从 fastapi 导入 FastAPI、BackgroundTasks
from fastapi import FastAPI, BackgroundTasks
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义一个模拟发邮件的函数
def send_email(to: str):
    # 模拟发邮件（实际会调 SMTP）
    print(f"send to {to}")

# 定义 POST 路由 /notify
@app.post("/notify")
def notify(bg: BackgroundTasks):
    # 把 send_email 加入后台任务，参数 "a@b.com"
    bg.add_task(send_email, "a@b.com")
    # 立即返回响应（任务稍后执行）
    return {"ok": True}

# 创建测试客户端
client = TestClient(app)
\`\`\`

### Demo 2：测试 BackgroundTasks 是否执行（用 mock）

直接测试时，\`send_email\` 真的会被执行（打印、写文件、发请求……）。我们要用 \`unittest.mock.patch\` 把它换成"替身"，然后断言替身被调用过。

\`\`\`python
# 从 unittest.mock 导入 patch
from unittest.mock import patch

# 测试 notify 是否真的调用了 send_email
def test_notify():
    # patch("模块名.函数名") 把该函数替换成 Mock
    # 这里的模块名要看 send_email 定义在哪里，假设在 main 模块
    with patch("main.send_email") as m:
        # 发起请求
        r = client.post("/notify")
        # 断言响应状态码 200
        assert r.status_code == 200
        # 关键：TestClient 会等待 BackgroundTasks 执行完毕
        # 所以这里可以断言 mock 被调用了一次，参数是 "a@b.com"
        m.assert_called_once_with("a@b.com")
\`\`\`

**重点：** Starlette 的 TestClient 在请求返回前会同步执行完所有 \`BackgroundTasks\`，所以你不需要 sleep 或 await，断言直接成立。这是 TestClient 对测试者的"贴心承诺"。

### Demo 3：测试 async def 路由 + BackgroundTasks

\`BackgroundTasks\` 在 \`async def\` 路由里同样可用，任务函数可以是同步也可以是 async。

\`\`\`python
# 从 fastapi 导入 FastAPI、BackgroundTasks
from fastapi import FastAPI, BackgroundTasks
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 unittest.mock 导入 patch
from unittest.mock import patch

# 创建应用
app = FastAPI()

# 定义一个 async 任务函数
async def async_log(msg: str):
    # 模拟异步写日志
    print(f"log: {msg}")

# 定义 async 路由
@app.post("/async-notify")
async def async_notify(bg: BackgroundTasks):
    # 添加 async 任务
    bg.add_task(async_log, "hello")
    # 立即返回
    return {"ok": True}

# 创建测试客户端
client = TestClient(app)

# 测试 async 路由的 BackgroundTasks
def test_async_notify():
    # patch async_log
    with patch("main.async_log") as m:
        # 发起请求
        r = client.post("/async-notify")
        # 断言 200
        assert r.status_code == 200
        # 断言 async 任务被调用
        m.assert_called_once_with("hello")
\`\`\`

### Demo 4：测试 BackgroundTasks 抛异常（不影响响应）

\`BackgroundTasks\` 的设计原则是"任务出错不能影响已发送的响应"。但异常不会凭空消失——Starlette 会把异常记录到日志，且如果任务抛错，TestClient 默认会把异常重新抛出（因为 TestClient 捕获了 background 异常）。需要用 \`pytest.raises\` 捕获。

\`\`\`python
# 导入 pytest
import pytest
# 从 fastapi 导入 FastAPI、BackgroundTasks
from fastapi import FastAPI, BackgroundTasks
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义一个会失败的任务
def bad_task():
    # 主动抛异常
    raise RuntimeError("任务爆炸了")

# 定义路由
@app.post("/risky")
def risky(bg: BackgroundTasks):
    # 添加会失败的任务
    bg.add_task(bad_task)
    # 响应正常返回
    return {"ok": True}

# 创建测试客户端
client = TestClient(app)

# 测试：任务异常时响应已经成功，但 TestClient 会把异常抛出
def test_risky_task_raises():
    # 期望抛出 RuntimeError
    with pytest.raises(RuntimeError, match="任务爆炸了"):
        # 请求会触发 background 任务，异常被 TestClient 重新抛出
        client.post("/risky")

# 测试：如果想"吞掉"异常只验证响应，可以捕获
def test_risky_response_ok():
    try:
        # 发起请求
        r = client.post("/risky")
    except RuntimeError:
        # background 抛的异常被吞掉
        # 响应对象其实在异常前已经生成，但这里拿不到
        # 所以更推荐用 raise_server_exceptions=False
        return
    # 走到这里说明没抛
    assert r.status_code == 200

# 更优雅：关闭异常重抛
def test_risky_silent():
    # 创建一个不抛服务端异常的 TestClient
    silent_client = TestClient(app, raise_server_exceptions=False)
    # 发起请求
    r = silent_client.post("/risky")
    # 响应正常
    assert r.status_code == 200
    assert r.json() == {"ok": True}
\`\`\`

**要点：** \`TestClient(app, raise_server_exceptions=False)\` 会让 background 异常被吞掉（仅打印日志），适合只关心响应的测试。

### Demo 5：测试真实异步任务（asyncio.create_task）

\`asyncio.create_task\` 创建的协程任务挂在事件循环上。但 TestClient 每次请求都在一个临时事件循环里跑，请求结束后循环可能就关了，导致任务"没跑完就被销毁"。测试时需要手动让任务有机会执行。

\`\`\`python
# 导入 asyncio
import asyncio
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 unittest.mock 导入 patch
from unittest.mock import patch

# 创建应用
app = FastAPI()

# 记录任务结果的容器（用 list 当可变容器）
results = []

# 定义 async 任务
async def slow_task(name: str):
    # 模拟耗时
    await asyncio.sleep(0.01)
    # 写结果
    results.append(name)

# 定义 async 路由，用 create_task 触发
@app.post("/async-fire")
async def async_fire():
    # 创建任务但不 await（fire and forget）
    asyncio.create_task(slow_task("alpha"))
    # 立即返回
    return {"ok": True}

# 创建测试客户端
client = TestClient(app)

# 注意：create_task 的任务在 TestClient 中可能不会自动等待
# 因为请求返回后事件循环可能立刻关闭
def test_async_fire_may_miss():
    # 清空结果
    results.clear()
    # patch slow_task
    with patch("main.slow_task") as m:
        # 把 mock 配成 async 函数
        import asyncio as _a
        async def _fake(name):
            results.append(name)
        m.side_effect = _fake
        # 发起请求
        r = client.post("/async-fire")
        # 响应正常
        assert r.status_code == 200
        # 注意：这里 m.assert_called_once_with("alpha") 可能失败！
        # 因为任务可能还没被事件循环调度就退出了
        # 结论：测 create_task 不要假设它一定执行完
\`\`\`

**结论：** 测 \`create_task\` 时，更稳妥的做法是把"创建任务"这步也抽成可 mock 的依赖，测试只验证"创建了任务"，而非"任务执行完"。真正想测任务逻辑，单独写 async 测试用 \`asyncio.run\` 或 \`pytest-asyncio\` 跑。

### Demo 6：测试 Celery 任务（mock 延迟调用）

Celery 任务通过 \`.delay()\` 或 \`.apply_async()\` 异步派发。测试时绝不应该连真 Redis，而是 mock 掉 \`.delay\`，只验证"派发了任务"。

\`\`\`python
# 从 unittest.mock 导入 patch
from unittest.mock import patch
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 假设我们有一个 celery 任务定义在 tasks.py
# from tasks import send_welcome_email  # celery 任务
# 这里用占位说明
class FakeCeleryTask:
    # 模拟 celery 任务对象
    def delay(self, user_id: int):
        # 真实环境会丢进队列
        pass

# 模块级任务对象
send_welcome_email = FakeCeleryTask()

# 定义路由
@app.post("/register")
def register(user_id: int):
    # 派发 celery 任务
    send_welcome_email.delay(user_id)
    # 立即返回
    return {"ok": True}

# 创建测试客户端
client = TestClient(app)

# 测试：mock celery 任务的 delay
def test_register_calls_celery():
    # patch delay 方法
    with patch.object(send_welcome_email, "delay") as mock_delay:
        # 发起注册请求
        r = client.post("/register", params={"user_id": 42})
        # 断言 200
        assert r.status_code == 200
        # 断言 delay 被调用一次，参数 42
        mock_delay.assert_called_once_with(42)
\`\`\`

**生活类比：** mock Celery 的 \`.delay()\` 就像你给外卖平台下单后，只检查"订单按钮被按下了"，而不真的等外卖送到——送餐是另一个部门的事，归他们的测试管。

## BackgroundTasks vs asyncio.create_task vs Celery 对比表

| 维度 | BackgroundTasks | asyncio.create_task | Celery |
| --- | --- | --- | --- |
| 执行进程 | 同进程 | 同进程 | 独立 worker 进程 |
| 执行时机 | 响应发送后 | 事件循环调度 | 队列消费 |
| 是否持久化 | 否（重启丢失） | 否（重启丢失） | 是（队列持久化） |
| 重试机制 | 无 | 无 | 内置重试 |
| 调度（定时） | 不支持 | 不支持 | 支持（beat） |
| 测试难度 | 低（TestClient 同步等） | 高（需手动 await） | 中（mock delay） |
| 适用场景 | 发邮件、写日志 | 异步 IO 小任务 | 重计算、可重试、分布式 |
| 依赖 | 无 | 无 | Redis/RabbitMQ |

## 本章小结

| 知识点 | 关键写法 | 备注 |
| --- | --- | --- |
| 添加后台任务 | \`bg.add_task(func, *args)\` | 响应返回后执行 |
| 测试任务执行 | \`with patch("m.func") as m\` | TestClient 同步等待 |
| async 路由 + bg | \`async def\` + \`bg.add_task\` | 任务可同步可 async |
| 任务异常 | \`TestClient(..., raise_server_exceptions=False)\` | 吞掉 background 异常 |
| create_task | \`asyncio.create_task(coro)\` | 测试中不保证执行完 |
| 测 Celery | \`patch.object(task, "delay")\` | 只验证派发，不连真队列 |
| 断言调用 | \`m.assert_called_once_with(args)\` | 验证参数 |
`
  },

  // ============================================================
  // 第 3 章：测试 WebSocket
  // ============================================================
  {
    id: "ft-websocket",
    group: "测试进阶",
    icon: "🔌",
    title: "测试 WebSocket",
    content: `# 测试 WebSocket

## WebSocket 与 HTTP 的区别

普通 HTTP 是"一问一答"——客户端发请求，服务端回响应，连接就断了。而 WebSocket 是"双向长连接"——握手后双方可以随时互发消息，适合聊天室、实时推送、协同编辑、股票行情等场景。

FastAPI 的 WebSocket 支持来自 Starlette，TestClient 也提供了专门的 \`websocket_connect\` 方法，让你能用类似上下文管理器的写法测试 WS 端点，无需启动真实服务器。

**生活类比：** HTTP 像打电话问完一句就挂断；WebSocket 像接通后双方一直保持通话，谁想说话就说话。TestClient 的 \`websocket_connect\` 就是给你一个"模拟电话"，让你在测试里拨号、说话、听话、挂断。

## WebSocket 端点基础

WebSocket 端点用 \`@app.websocket("/path")\` 定义，函数参数是 \`WebSocket\`。必须先 \`await websocket.accept()\` 才能收发消息，结束后 \`await websocket.close()\`。

### Demo 1：一个简单的 WebSocket 端点

\`\`\`python
# 从 fastapi 导入 FastAPI、WebSocket
from fastapi import FastAPI, WebSocket
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义 WebSocket 端点 /ws
@app.websocket("/ws")
async def ws(websocket: WebSocket):
    # 接受连接（必须先 accept）
    await websocket.accept()
    # 接收一段文本
    data = await websocket.receive_text()
    # 回显
    await websocket.send_text(f"echo: {data}")
    # 关闭连接
    await websocket.close()
\`\`\`

### Demo 2：用 TestClient 测试 WebSocket

\`\`\`python
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建测试客户端
client = TestClient(app)

# 测试 WebSocket 回显
def test_ws():
    # 用 websocket_connect 上下文管理器建立连接
    with client.websocket_connect("/ws") as ws:
        # 发送文本
        ws.send_text("hello")
        # 接收文本
        data = ws.receive_text()
        # 断言回显内容
        assert data == "echo: hello"
\`\`\`

**要点：** \`with\` 块结束时连接自动关闭。在块内可以多次 send/receive。

### Demo 3：测试 WebSocket 拒绝连接（accept 前抛异常）

有些场景需要在握手阶段就拒绝连接（比如 token 非法）。在 \`accept()\` 之前抛异常或调用 \`close(code=...)\`，客户端会收到连接关闭。

\`\`\`python
# 导入 pytest
import pytest
# 从 fastapi 导入 FastAPI、WebSocket
from fastapi import FastAPI, WebSocket
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义需要 token 的 WS 端点
@app.websocket("/secure")
async def secure(websocket: WebSocket):
    # 从 query 参数取 token
    token = websocket.query_params.get("token")
    # token 非法
    if token != "secret":
        # 拒绝连接（用 1008 策略违反）
        await websocket.close(code=1008)
        # 直接 return，不 accept
        return
    # 合法则 accept
    await websocket.accept()
    await websocket.send_text("welcome")
    await websocket.close()

# 创建测试客户端
client = TestClient(app)

# 测试非法 token 被拒
def test_secure_reject():
    # 用 pytest.raises 捕获 WebSocketDisconnect
    from starlette.websockets import WebSocketDisconnect
    with pytest.raises(WebSocketDisconnect) as exc:
        # 不带 token 连接
        with client.websocket_connect("/secure") as ws:
            # 这里不会执行，连接直接被关
            ws.receive_text()
    # 断言关闭码是 1008
    assert exc.value.code == 1008

# 测试合法 token 通过
def test_secure_ok():
    # 带正确 token 连接
    with client.websocket_connect("/secure?token=secret") as ws:
        # 接收欢迎消息
        data = ws.receive_text()
        # 断言
        assert data == "welcome"
\`\`\`

### Demo 4：测试 WebSocket 多消息往返

WS 的精髓是多次往返。测试时连续 send/receive 即可。

\`\`\`python
# 从 fastapi 导入 FastAPI、WebSocket
from fastapi import FastAPI, WebSocket
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义一个计数器端点：每次收到消息就回当前计数
@app.websocket("/counter")
async def counter(websocket: WebSocket):
    # 接受连接
    await websocket.accept()
    # 计数器
    count = 0
    # 循环接收
    while True:
        try:
            # 接收文本
            await websocket.receive_text()
        except Exception:
            # 客户端断开时退出
            break
        # 计数加一
        count += 1
        # 回传计数
        await websocket.send_text(str(count))

# 创建测试客户端
client = TestClient(app)

# 测试多次往返
def test_counter():
    # 建立连接
    with client.websocket_connect("/counter") as ws:
        # 第 1 次
        ws.send_text("ping")
        assert ws.receive_text() == "1"
        # 第 2 次
        ws.send_text("ping")
        assert ws.receive_text() == "2"
        # 第 3 次
        ws.send_text("ping")
        assert ws.receive_text() == "3"
\`\`\`

### Demo 5：测试 WebSocket close code

关闭连接时可以指定 code（默认 1000）。测试要验证服务端用正确的 code 关闭。

\`\`\`python
# 导入 pytest
import pytest
# 从 fastapi 导入 FastAPI、WebSocket
from fastapi import FastAPI, WebSocket
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 starlette.websockets 导入 WebSocketDisconnect
from starlette.websockets import WebSocketDisconnect

# 创建应用
app = FastAPI()

# 定义端点：收到 "bye" 就用 1001 关闭
@app.websocket("/bye")
async def bye(websocket: WebSocket):
    # 接受连接
    await websocket.accept()
    # 循环
    while True:
        try:
            # 接收文本
            msg = await websocket.receive_text()
        except WebSocketDisconnect:
            # 客户端断了
            break
        # 收到 bye
        if msg == "bye":
            # 用 1001（going away）关闭
            await websocket.close(code=1001)
            # 退出
            break
        # 否则回显
        await websocket.send_text(f"echo: {msg}")

# 创建测试客户端
client = TestClient(app)

# 测试 close code
def test_close_code():
    # 建立连接
    with client.websocket_connect("/bye") as ws:
        # 先发个普通消息
        ws.send_text("hi")
        # 收到回显
        assert ws.receive_text() == "echo: hi"
        # 发 bye
        ws.send_text("bye")
        # 接下来 receive 应该抛 WebSocketDisconnect
        with pytest.raises(WebSocketDisconnect) as exc:
            ws.receive_text()
        # 断言关闭码 1001
        assert exc.value.code == 1001
\`\`\`

### Demo 6：测试带认证的 WebSocket（query param token）

WS 不能像 HTTP 那样轻松用 Header 传 token（浏览器原生 WS 不支持自定义 header），常用做法是 query 参数或子协议。

\`\`\`python
# 从 fastapi 导入 FastAPI、WebSocket
from fastapi import FastAPI, WebSocket
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 简单 token 校验
def verify(token: str) -> bool:
    # 假设正确 token 是 abc
    return token == "abc"

# 定义带认证的 WS
@app.websocket("/auth")
async def auth_ws(websocket: WebSocket):
    # 取 query 参数 token
    token = websocket.query_params.get("token", "")
    # 校验失败
    if not verify(token):
        # 1008 策略违反
        await websocket.close(code=1008)
        return
    # 校验通过
    await websocket.accept()
    # 发欢迎
    await websocket.send_text("auth ok")
    await websocket.close()

# 创建测试客户端
client = TestClient(app)

# 测试无 token 被拒
def test_no_token():
    import pytest
    from starlette.websockets import WebSocketDisconnect
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect("/auth") as ws:
            ws.receive_text()
    # 断言 1008
    assert exc.value.code == 1008

# 测试正确 token
def test_valid_token():
    with client.websocket_connect("/auth?token=abc") as ws:
        data = ws.receive_text()
        assert data == "auth ok"
\`\`\`

### Demo 7：测试 WebSocket 异常关闭（WebSocketDisconnect）

当服务端主动关闭后，客户端再 \`receive\` 会抛 \`WebSocketDisconnect\`。这是 WS 测试中最常见的异常断言对象。

\`\`\`python
# 导入 pytest
import pytest
# 从 fastapi 导入 FastAPI、WebSocket
from fastapi import FastAPI, WebSocket
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient
# 从 starlette.websockets 导入 WebSocketDisconnect
from starlette.websockets import WebSocketDisconnect

# 创建应用
app = FastAPI()

# 定义端点：收到一条消息后立即关闭
@app.websocket("/one-shot")
async def one_shot(websocket: WebSocket):
    # 接受
    await websocket.accept()
    # 收一条
    data = await websocket.receive_text()
    # 回一句
    await websocket.send_text(f"got: {data}")
    # 直接关闭（默认 1000）
    await websocket.close()

# 创建测试客户端
client = TestClient(app)

# 测试异常关闭
def test_disconnect():
    # 建立连接
    with client.websocket_connect("/one-shot") as ws:
        # 发送
        ws.send_text("hello")
        # 接收正常回复
        assert ws.receive_text() == "got: hello"
        # 再 receive 会抛 WebSocketDisconnect（服务端已关）
        with pytest.raises(WebSocketDisconnect):
            ws.receive_text()
\`\`\`

## TestClient WebSocket API 表

| 方法 | 说明 | 示例 |
| --- | --- | --- |
| \`send_text(s)\` | 发送文本 | \`ws.send_text("hi")\` |
| \`receive_text()\` | 接收文本 | \`data = ws.receive_text()\` |
| \`send_bytes(b)\` | 发送字节 | \`ws.send_bytes(b"\\\\x01")\` |
| \`receive_bytes()\` | 接收字节 | \`b = ws.receive_bytes()\` |
| \`send_json(obj)\` | 发送 JSON（自动序列化） | \`ws.send_json({"a": 1})\` |
| \`receive_json()\` | 接收并解析 JSON | \`obj = ws.receive_json()\` |
| \`close()\` | 客户端主动关闭 | \`ws.close()\` |

**注意：** \`receive_*\` 在服务端关闭时会抛 \`WebSocketDisconnect\`，其 \`.code\` 属性是关闭码。常用关闭码：\`1000\` 正常关闭、\`1001\` going away、\`1008\` 策略违反、\`1011\` 服务端内部错误。

## 本章小结

| 知识点 | 关键写法 | 备注 |
| --- | --- | --- |
| 定义 WS 端点 | \`@app.websocket("/ws")\` | 必须 \`await accept()\` |
| 建立测试连接 | \`with client.websocket_connect("/ws") as ws:\` | 上下文管理器自动关 |
| 收发文本 | \`ws.send_text\` / \`ws.receive_text\` | 收发需配对 |
| 收发 JSON | \`ws.send_json\` / \`ws.receive_json\` | 自动序列化 |
| 拒绝连接 | \`await websocket.close(code=1008)\` | accept 之前 close |
| 多消息往返 | 循环 \`receive_text\` + \`send_text\` | 注意退出条件 |
| 关闭码断言 | \`exc.value.code == 1001\` | 用 \`pytest.raises(WebSocketDisconnect)\` |
| 异常关闭 | \`pytest.raises(WebSocketDisconnect)\` | 服务端关后再 receive 会抛 |
| 认证 | query 参数传 token | 浏览器 WS 不支持自定义 header |
`
  },

  // ============================================================
  // 第 4 章：mock 外部服务
  // ============================================================
  {
    id: "ft-mock",
    group: "测试进阶",
    icon: "🎭",
    title: "mock 外部服务",
    content: `# mock 外部服务

## 为什么测试要 mock

你的 FastAPI 应用很少是"孤岛"——它会调天气 API、发短信、查数据库、读写文件、依赖时间。如果在测试里真的去调这些外部服务，会面临：

- **慢**：网络往返几百毫秒，跑 1000 个测试要等半天。
- **不稳定**：外部服务挂了你的测试就红，明明你的代码没问题。
- **不可控**：外部 API 返回什么你说了算不了，难以测"异常分支"。
- **花钱**：短信、支付、AI 调用按次数计费。
- **污染**：真写数据库会留下脏数据。

mock（替身）就是解决这些问题的利器——把外部依赖换成"你说了算"的假实现，让测试快、稳、可控、免费、干净。

**生活类比：** mock 就像拍电影时找"替身演员"——危险动作让替身上，主角只负责露脸。测你的业务逻辑时，外部 API 就是那个"危险动作"，让 mock 替身上场，你的代码（主角）该怎么演还怎么演。

## unittest.mock.patch 详解

Python 标准库 \`unittest.mock\` 提供了 \`patch\`，它能在测试期间把某个对象替换成 \`Mock\`，测试结束自动还原。核心用法：

\`\`\`python
# 装饰器写法：把 main 模块里的 httpx.get 替换成 Mock
@patch("main.httpx.get")
def test_x(mock_get):
    # 配置返回值
    mock_get.return_value = ...
    # 调用被测代码
    ...
    # 断言被调用
    mock_get.assert_called_once()
\`\`\`

\`patch\` 的目标字符串是"模块路径.对象名"，关键是 patch "使用处"而非"定义处"。比如 \`httpx\` 定义在 httpx 库，但你的代码 \`import httpx\` 后用 \`httpx.get\`，要 patch 的是 \`main.httpx.get\`（你模块里的那个引用）。

### Demo 1：一个调用外部 API 的 FastAPI 应用

\`\`\`python
# 导入 httpx
import httpx
# 从 fastapi 导入 FastAPI
from fastapi import FastAPI
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 定义 /weather 路由：调外部天气 API
@app.get("/weather")
def weather():
    # 真实调用外部 API
    r = httpx.get("https://api.weather.com/today")
    # 把返回的 JSON 透传
    return r.json()

# 创建测试客户端
client = TestClient(app)
\`\`\`

### Demo 2：用 unittest.mock.patch mock httpx.get

\`\`\`python
# 从 unittest.mock 导入 patch、Mock
from unittest.mock import patch, Mock

# 用 patch 装饰器替换 main 模块的 httpx.get
@patch("main.httpx.get")
def test_weather(mock_get):
    # 配置 mock 的返回值：一个有 json() 方法的假响应
    mock_get.return_value = Mock(json=lambda: {"temp": 25})
    # 发起请求
    r = client.get("/weather")
    # 断言状态码 200
    assert r.status_code == 200
    # 断言返回内容来自 mock
    assert r.json() == {"temp": 25}
    # 断言 httpx.get 被调用一次
    mock_get.assert_called_once()
    # 断言调用的 URL 正确
    mock_get.assert_called_once_with("https://api.weather.com/today")
\`\`\`

**重点：** \`mock_get.return_value = Mock(json=lambda: {...})\` 是因为代码里用了 \`r.json()\`，所以假响应也要有 \`json\` 方法。

### Demo 3：用 responses 库 mock httpx/requests（更优雅）

\`responses\` 库会在传输层拦截请求，让你按 URL 配置假响应，比 \`patch\` 更贴近真实。注意：\`responses\` 主要面向 \`requests\` 库，对 \`httpx\` 的支持在较新版本（httpx 自带 transport 机制，推荐用 \`respx\`）。这里演示 \`responses\` 的思路。

\`\`\`python
# 导入 responses 库（需 pip install responses）
import responses
# 导入 pytest
import pytest

# 假设应用代码用 requests 调外部 API
# import requests
# @app.get("/weather2")
# def weather2():
#     r = requests.get("https://api.weather.com/today")
#     return r.json()

# 用 @responses.activate 装饰测试
@responses.activate
def test_weather_with_responses():
    # 注册一个假响应：GET 该 URL 返回 200 + JSON
    responses.add(
        # 方法
        responses.GET,
        # URL
        "https://api.weather.com/today",
        # 状态码
        status=200,
        # 返回 JSON
        json={"temp": 25},
    )
    # 发起请求
    r = client.get("/weather2")
    # 断言
    assert r.json() == {"temp": 25}
    # 断言只调了一次
    assert len(responses.calls) == 1
\`\`\`

### Demo 4：用 respx 库 mock httpx（专为 httpx 设计）

\`respx\` 是 httpx 官方推荐的 mock 库，API 更现代，支持路由匹配、正则、响应顺序等。

\`\`\`python
# 导入 respx（需 pip install respx）
import respx
# 导入 httpx
import httpx

# 用 @respx.mock 装饰测试
@respx.mock
def test_weather_with_respx():
    # 注册路由：GET 该 URL 返回 200 + JSON
    respx.get("https://api.weather.com/today").respond(200, json={"temp": 25})
    # 发起请求
    r = client.get("/weather")
    # 断言状态码 200
    assert r.status_code == 200
    # 断言温度字段
    assert r.json()["temp"] == 25

# 测试异常分支：外部 API 返回 500
@respx.mock
def test_weather_server_error():
    # 让外部 API 返回 500
    respx.get("https://api.weather.com/today").respond(500)
    # 发起请求（假设应用对 500 有兜底）
    r = client.get("/weather")
    # 断言应用返回了降级结果（具体看应用实现）
    # 这里只是示意，实际取决于应用如何处理上游 500
    assert r.status_code in (200, 502)
\`\`\`

**优势：** \`respx\` 让你能轻松测"外部 API 超时、500、慢响应"等异常分支，而这些用真 API 几乎测不了。

### Demo 5：mock 数据库依赖（不用真实 DB）

FastAPI 的依赖注入让 mock 数据库变得优雅——把数据库会话作为依赖，测试时用 \`dependency_overrides\` 换成内存版或 Mock。

\`\`\`python
# 从 fastapi 导入 FastAPI、Depends
from fastapi import FastAPI, Depends
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# 创建应用
app = FastAPI()

# 假装这是个数据库会话
class DBSession:
    # 查用户
    def get_user(self, user_id: int):
        # 真实环境查数据库
        return {"id": user_id, "name": "real"}

# 依赖：返回 DBSession
def get_db():
    # 真实环境 yield 一个 session
    db = DBSession()
    yield db

# 定义路由
@app.get("/users/{user_id}")
def get_user(user_id: int, db: DBSession = Depends(get_db)):
    # 用 db 查
    return db.get_user(user_id)

# 创建测试客户端
client = TestClient(app)

# 真实依赖会返回 real
def test_real_db():
    r = client.get("/users/1")
    assert r.json()["name"] == "real"

# mock 依赖：返回 fake
def test_mocked_db():
    # 定义一个假依赖
    def fake_db():
        # 假 session
        fake = DBSession()
        # 覆盖 get_user 方法
        fake.get_user = lambda uid: {"id": uid, "name": "fake"}
        yield fake
    # 用 dependency_overrides 替换
    app.dependency_overrides[get_db] = fake_db
    try:
        # 发起请求
        r = client.get("/users/1")
        # 断言拿到 fake
        assert r.json()["name"] == "fake"
    finally:
        # 测完务必清理，避免污染其他测试
        app.dependency_overrides.clear()
\`\`\`

**关键：** \`app.dependency_overrides[get_db] = fake_db\` 是 FastAPI 测试依赖的官方姿势，比 patch 函数更稳、更解耦。

### Demo 6：mock 时间（freezegun 冻结时间）测试 token 过期

JWT token 通常带 \`exp\`（过期时间）。测"token 过期"分支需要让时间"穿越"到未来。\`freezegun\` 库能冻结 \`datetime.now()\` 等时间函数。

\`\`\`python
# 导入 freezegun 的 freeze_time（需 pip install freezegun）
from freezegun import freeze_time
# 导入 datetime
from datetime import datetime, timedelta, timezone

# 假设有个创建 token 的函数
def create_token(expire_seconds: int):
    # 当前时间
    now = datetime.now(timezone.utc)
    # 过期时间
    exp = now + timedelta(seconds=expire_seconds)
    # 返回带 exp 的 token（简化演示）
    return {"exp": exp.timestamp()}

# 假设有个校验函数
def verify_token(token: dict):
    # 当前时间
    now = datetime.now(timezone.utc).timestamp()
    # 过期
    if now > token["exp"]:
        return False
    return True

# 测试：冻结在 2026-01-01 创建 token
@freeze_time("2026-01-01")
def test_token_created_at_2026():
    # 此时 now() 被冻结
    token = create_token(expire_seconds=3600)
    # 立即校验应该有效
    assert verify_token(token) is True

# 测试：token 过期
@freeze_time("2026-01-01")
def test_token_expire():
    # 创建 1 小时有效的 token
    token = create_token(expire_seconds=3600)
    # 把时间往前拨 2 小时
    with freeze_time("2026-01-01T02:00:00"):
        # 此时已过期
        assert verify_token(token) is False
\`\`\`

**生活类比：** \`freezegun\` 像给整个世界按了暂停键——\`datetime.now()\` 停在你指定的时间，你慢慢测，测完再恢复。

### Demo 7：mock 文件系统（pyfakefs）

测文件操作时，真写磁盘慢且容易留垃圾。\`pyfakefs\` 提供一个假文件系统，所有 \`open\` / \`os.path\` 都落在内存里。

\`\`\`python
# 导入 pytest
import pytest

# 假设应用代码读配置文件
# def read_config():
#     with open("/etc/app/config.ini") as f:
#         return f.read()

# 用 fs fixture（pyfakefs 提供，需 pip install pyfakefs）
def test_read_config(fs):
    # fs 是 pyfakefs 的 fixture，自动接管文件系统
    # 在假文件系统创建配置文件
    fs.create_file("/etc/app/config.ini", contents="debug=true")
    # 调用被测函数
    # result = read_config()
    # 断言读取正确
    # assert result == "debug=true"
    # 这里仅演示 fs 的用法
    import os
    # 断言文件存在（在假 fs 里）
    assert os.path.exists("/etc/app/config.ini")
    # 读取内容
    with open("/etc/app/config.ini") as f:
        assert f.read() == "debug=true"
\`\`\`

**注意：** \`pyfakefs\` 通过 pytest 的 \`fs\` fixture 接管文件系统，测试结束自动还原，不污染真磁盘。

## mock 工具对比表

| 工具 | 替换对象 | 优势 | 劣势 | 适用场景 |
| --- | --- | --- | --- | --- |
| \`unittest.mock\` | 任意 Python 对象 | 标准库无需安装 | 写起来啰嗦、patch 路径易错 | 函数/方法替身 |
| \`responses\` | requests 传输层 | URL 路由配置 | 主要面向 requests | 用 requests 的项目 |
| \`respx\` | httpx 传输层 | 官方推荐、API 现代 | 仅 httpx | 用 httpx 的项目 |
| \`freezegun\` | 时间函数 | 冻结时间测过期 | 略慢 | JWT/定时/时间逻辑 |
| \`pyfakefs\` | 文件系统 | 内存假 fs、不污染磁盘 | 不支持某些 C 扩展 | 文件读写测试 |
| \`dependency_overrides\` | FastAPI 依赖 | 官方姿势、解耦 | 仅 FastAPI 依赖 | mock DB/外部服务依赖 |

## 本章小结

| 知识点 | 关键写法 | 备注 |
| --- | --- | --- |
| patch 替身 | \`@patch("main.httpx.get")\` | patch "使用处" |
| 配置返回值 | \`mock.return_value = Mock(json=lambda: ...)\` | 模拟响应对象 |
| 断言调用 | \`mock.assert_called_once_with(args)\` | 验证参数 |
| respx mock httpx | \`@respx.mock\` + \`respx.get(url).respond(...)\` | httpx 官方推荐 |
| mock 依赖 | \`app.dependency_overrides[dep] = fake\` | 测完 \`.clear()\` |
| 冻结时间 | \`@freeze_time("2026-01-01")\` | 测 token 过期 |
| 假文件系统 | \`def test_x(fs):\` + \`fs.create_file(...)\` | pyfakefs pytest fixture |
| 选型原则 | 优先 \`dependency_overrides\` > respx > patch | 越贴近业务越稳 |
`
  },

  // ============================================================
  // 第 5 章：pytest fixtures 高级与覆盖率
  // ============================================================
  {
    id: "ft-fixtures-coverage",
    group: "测试进阶",
    icon: "📊",
    title: "pytest fixtures 高级与覆盖率",
    content: `# pytest fixtures 高级与覆盖率

## fixture 是什么

fixture 是 pytest 的"测试前置准备"机制——把"造数据、起服务、连数据库"这些重复的 setup 逻辑抽成一个带 \`@pytest.fixture\` 装饰器的函数，测试函数把它当参数声明就能自动拿到。相比 xUnit 风格的 \`setUp/tearDown\`，fixture 有几个显著优势：

- **依赖注入**：测试声明需要什么 fixture，pytest 自动注入，不用继承基类。
- **可组合**：fixture 可以依赖其他 fixture，形成依赖图。
- **可控作用域**：\`scope\` 决定它实例化几次（function/class/module/session）。
- **可复用**：放在 \`conftest.py\` 里，整个目录的测试都能用。

**生活类比：** fixture 像剧组的道具组——你（测试）在剧本里写"需要一把剑"，道具组就把剑准备好递给你；写"需要一匹马"，马也备好。你不用关心剑是怎么打造的、马从哪牵来的，只管演。

## fixture scope 详解

\`scope\` 决定 fixture 实例在多大范围内复用：

| scope | 实例化时机 | 复用范围 |
| --- | --- | --- |
| \`function\`（默认） | 每个测试函数前 | 仅当前测试 |
| \`class\` | 每个测试类前 | 类内所有测试共享 |
| \`module\` | 每个测试文件前 | 文件内所有测试共享 |
| \`package\` | 每个包前 | 包内所有测试共享 |
| \`session\` | 整个测试会话开始 | 全程只实例化一次 |

scope 越大越省时（少造几次数据），但共享状态带来风险——某个测试改了状态会污染后续。原则：默认 \`function\`，确认无副作用才放大 scope。

### Demo 1：session 级 fixture（全局只执行一次）

\`\`\`python
# 导入 pytest
import pytest
# 从 fastapi.testclient 导入 TestClient
from fastapi.testclient import TestClient

# session 级 fixture：整个测试会话只创建一次 app
@pytest.fixture(scope="session")
def app():
    # 导入应用（假设在 main.py）
    from main import app
    # 返回 app
    return app

# session 级 client：复用同一个 app
@pytest.fixture(scope="session")
def client(app):
    # 用 app 创建 TestClient
    with TestClient(app) as c:
        # yield 提供 fixture 值
        yield c

# 测试用 client（session 级，所有测试共享一个）
def test_one(client):
    # 用 client 发请求
    r = client.get("/")
    assert r.status_code == 200

def test_two(client):
    # 同一个 client
    r = client.get("/health")
    assert r.status_code == 200
\`\`\`

**注意：** \`TestClient(app)\` 用 \`with\` 形式可以正确管理生命周期（包括 startup/shutdown 事件）。

### Demo 2：fixture 参数化（params）

\`params\` 让 fixture 对每个参数值都跑一遍，依赖它的测试会被自动参数化。

\`\`\`python
# 导入 pytest
import pytest

# 参数化 fixture：params 是列表
@pytest.fixture(params=[1, 2, 3])
def num(request):
    # request.param 是当前参数值
    return request.param

# 这个测试会跑 3 次，num 分别是 1、2、3
def test_positive(num):
    # 断言 num > 0
    assert num > 0

# 参数化 + 字符串
@pytest.fixture(params=["alice", "bob"])
def username(request):
    return request.param

def test_username_not_empty(username):
    # 断言非空
    assert len(username) > 0
\`\`\`

### Demo 3：fixture 依赖其他 fixture

fixture 可以把其他 fixture 当参数声明，pytest 自动解析依赖图。

\`\`\`python
# 导入 pytest
import pytest

# 基础 fixture：数据库连接
@pytest.fixture
def db_connection():
    # 模拟连接
    conn = {"connected": True, "data": []}
    # 提供
    yield conn
    # teardown：关闭连接
    conn["connected"] = False

# 依赖 db_connection 的 fixture：用户仓库
@pytest.fixture
def user_repo(db_connection):
    # db_connection 由 pytest 注入
    class UserRepo:
        def __init__(self, conn):
            self.conn = conn
        def create(self, name):
            self.conn["data"].append(name)
            return len(self.conn["data"])
    # 返回仓库实例
    return UserRepo(db_connection)

# 测试：用 user_repo（间接用了 db_connection）
def test_create_user(user_repo):
    # 创建 alice
    uid = user_repo.create("alice")
    # 断言 ID 是 1
    assert uid == 1
    # 再创建一个
    uid2 = user_repo.create("bob")
    # 断言 ID 是 2
    assert uid2 == 2
\`\`\`

### Demo 4：conftest.py 中 autouse fixture

\`conftest.py\` 是 pytest 的"共享配置文件"，里面的 fixture 不用 import 就能用。\`autouse=True\` 让 fixture 自动应用到所有测试，无需声明。

\`\`\`python
# 文件：tests/conftest.py
# 导入 pytest
import pytest

# autouse fixture：每个测试前自动跑
@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    # 每个测试前重置环境变量
    monkeypatch.setenv("TEST_MODE", "true")
    # yield 让出控制权
    yield
    # 测试后清理（这里 monkeypatch 会自动还原）

# 文件：tests/test_something.py
# 这个测试不需要声明 reset_env，它自动生效
def test_env_is_test_mode():
    # 读环境变量
    import os
    # 断言是 true
    assert os.getenv("TEST_MODE") == "true"
\`\`\`

**注意：** \`autouse\` 强大但易滥用——它"隐式"生效，新来的同事可能不知道某个全局状态被改了。重要逻辑最好显式声明 fixture 参数。

### Demo 5：用 yield 实现 setup/teardown

fixture 函数里 \`yield\` 之前的代码是 setup，之后是 teardown。

\`\`\`python
# 导入 pytest
import pytest

# 带 setup/teardown 的 fixture
@pytest.fixture
def temp_file(tmp_path):
    # setup：创建临时文件
    f = tmp_path / "data.txt"
    f.write_text("init")
    # yield 提供给测试
    yield f
    # teardown：测试结束后清理
    # tmp_path 本身会被 pytest 自动清理，这里只是演示
    if f.exists():
        f.unlink()

# 测试
def test_temp_file(temp_file):
    # temp_file 是 yield 的值（Path 对象）
    assert temp_file.read_text() == "init"
    # 写入新内容
    temp_file.write_text("updated")
    assert temp_file.read_text() == "updated"
\`\`\`

**要点：** \`yield\` 后的代码即使测试抛异常也会执行（类似 try/finally），适合做资源释放。

### Demo 6：pytest-cov 覆盖率

\`pytest-cov\` 是 \`coverage.py\` 的 pytest 插件，让 \`\`pytest --cov\`\` 自动统计覆盖率。

\`\`\`bash
# 安装
pip install pytest-cov

# 运行测试并统计 main 模块的覆盖率
pytest --cov=main --cov-report=term-missing

# 生成 HTML 报告（在 htmlcov/ 目录）
pytest --cov=main --cov-report=html --cov-report=term

# 只看终端报告，显示哪些行没覆盖
pytest --cov=main --cov-report=term-missing
\`\`\`

终端输出示例：

\`\`\`text
Name           Stmts   Miss  Cover   Missing
--------------------------------------------
main.py           20      3    85%   12, 18-19
utils.py          15      0   100%
--------------------------------------------
TOTAL             35      3    91%
\`\`\`

- \`Stmts\`：可执行语句数
- \`Miss\`：未执行的语句数
- \`Cover\`：覆盖率百分比
- \`Missing\`：具体未覆盖的行号

### Demo 7：覆盖率配置 + 分支覆盖率（--cov-branch）

把覆盖率配置写进 \`pyproject.toml\`，避免每次敲长命令。

\`\`\`toml
# pyproject.toml
[tool.pytest.ini_options]
# 默认加 cov 参数
addopts = "--cov=app --cov-report=term-missing --cov-branch"

[tool.coverage.run]
# 统计来源
source = ["app"]
# 排除测试目录
omit = ["*/tests/*", "*/conftest.py"]

[tool.coverage.report]
# 低于 80% 报错（CI 卡线）
fail_under = 80
# 排除某些不算未覆盖的行
exclude_lines = [
    # pragma: no cover
    "pragma: no cover",
    # 抽象方法
    "raise NotImplementedError",
    # if TYPE_CHECKING:
    "if TYPE_CHECKING:",
]
\`\`\`

\`\`\`bash
# 启用分支覆盖率（命令行方式）
pytest --cov=app --cov-branch --cov-report=term-missing

# 分支覆盖率会统计 if/else 两个分支是否都走到
# 例如：
# if x > 0:
#     do_a()
# else:
#     do_b()
# 只测 x>0 的情况，line coverage 可能 100%，但 branch coverage 只有 50%
\`\`\`

**重点：** 行覆盖率会"骗人"——\`if/else\` 只测一个分支，行覆盖率仍可能 100%。分支覆盖率（\`--cov-branch\`）才能发现"另一半分支没测"。

### Demo 8：用 pytest-xdist 并行测试（-n auto）

测试多了就慢。\`pytest-xdist\` 让你按 CPU 核数并行跑测试。

\`\`\`bash
# 安装
pip install pytest-xdist

# 按核数自动并行
pytest -n auto

# 指定 4 个进程
pytest -n 4

# 指定每个进程跑哪些测试（按文件分组，避免 fixture 冲突）
pytest -n auto --dist loadfile
\`\`\`

**注意：** 并行测试要求 fixture 是"无状态"的——session 级 fixture 会在每个 worker 各起一份，如果它连了同一个数据库会冲突。常见做法：每个 worker 用独立数据库（用 \`PYTEST_XDIST_WORKER\` 环境变量区分）。

\`\`\`python
# conftest.py：每个 worker 用独立测试库
import pytest
import os

@pytest.fixture(scope="session")
def db_url():
    # 取 worker 编号
    worker = os.getenv("PYTEST_XDIST_WORKER", "gw0")
    # 每个worker独立库，避免并发冲突
    return f"sqlite:///test_{worker}.db"
\`\`\`

## fixture scope 对比表

| scope | 实例化次数 | 速度 | 共享风险 | 典型用途 |
| --- | --- | --- | --- | --- |
| \`function\` | 每个测试 1 次 | 最慢 | 无 | 默认，干净数据 |
| \`class\` | 每个类 1 次 | 较快 | 类内共享 | 类内共享的昂贵对象 |
| \`module\` | 每个文件 1 次 | 快 | 文件内共享 | 文件级共享资源 |
| \`package\` | 每个包 1 次 | 更快 | 包内共享 | 少用 |
| \`session\` | 全程 1 次 | 最快 | 全局共享 | app 实例、DB 连接池 |

## 覆盖率指标表

| 指标 | 含义 | 命令 | 建议 |
| --- | --- | --- | --- |
| 行覆盖率（line） | 被执行的语句占比 | \`--cov=m\` | 基础指标 |
| 分支覆盖率（branch） | if/else 分支被走过的占比 | \`--cov-branch\` | 更严格 |
| 语句数（Stmts） | 可执行语句总数 | 报告自动显示 | 参考 |
| 未覆盖行（Missing） | 没被执行的行号 | \`--cov-report=term-missing\` | 补测试的依据 |
| 阈值（fail_under） | 低于该值 CI 报错 | \`fail_under = 80\` | 推荐 80% 起步 |
| 排除（omit/exclude） | 不统计的文件/行 | \`omit = ["*/tests/*"]\` | 排除测试本身 |

**经验：** 100% 覆盖率不等于没 bug——它只证明"代码跑过了"，不证明"逻辑对了"。覆盖率是底线（防止漏测），不是终点。

## 本章小结

| 知识点 | 关键写法 | 备注 |
| --- | --- | --- |
| 定义 fixture | \`@pytest.fixture\` | 默认 function scope |
| session 级 | \`scope="session"\` | 全程一次，省时 |
| 参数化 | \`params=[1,2,3]\` + \`request.param\` | 测试自动跑多次 |
| fixture 依赖 | 把别的 fixture 当参数 | 自动解析依赖图 |
| autouse | \`autouse=True\` | 隐式生效，慎用 |
| setup/teardown | \`yield\` 前后 | yield 后必执行 |
| 终端覆盖率 | \`pytest --cov=m --cov-report=term-missing\` | 显示未覆盖行 |
| 分支覆盖率 | \`--cov-branch\` | 比 line 更严格 |
| 配置文件 | \`[tool.coverage.run]\` in pyproject.toml | 避免长命令 |
| 阈值卡线 | \`fail_under = 80\` | CI 守门 |
| 并行测试 | \`pytest -n auto\` | 注意 fixture 隔离 |
| 独立 DB | 用 \`PYTEST_XDIST_WORKER\` 区分 | 避免并发冲突 |
`
  },
];
