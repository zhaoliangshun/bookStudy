// =============================================================
// FastAPI 测试与部署全书 - 第 5 批章节（性能与集成测试 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   ft-locust     : 性能测试 locust
//   ft-benchmark  : 压力测试与基准测试
//   ft-integration: 集成测试
//   ft-e2e        : 端到端测试
// =============================================================

export const chapters = [
  // ============================================================
  // 第 1 章：性能测试 locust
  // ============================================================
  {
    id: "ft-locust",
    group: "性能与集成测试",
    icon: "🐝",
    title: "性能测试 locust",
    content: `# 性能测试 locust

## 一、性能测试 vs 功能测试

前面几章我们写的测试几乎全是功能测试——回答的是「这个接口对不对」。比如 \`GET /items/1\` 返回 200、body 里 \`id=1\`，测试通过。功能测试关心的是**正确性**，一次只发一个请求，没有时间压力。

但线上真实场景是：一秒钟可能有几百上千个请求同时打过来。一个在功能测试里完美通过的接口，放到高并发下可能直接崩溃——响应时间从 10ms 飙到 5 秒，数据库连接池耗尽，内存泄漏导致 OOM。这些问题功能测试根本发现不了。

**性能测试回答的是「这个接口快不快、撑不撑得住」**。它通过模拟大量并发用户持续发请求，测量系统在压力下的表现：

| 维度 | 功能测试 | 性能测试 |
|---|---|---|
| 关心问题 | 对不对 | 快不快、撑不撑得住 |
| 并发量 | 1 个请求 | 几十到上万个并发 |
| 持续时间 | 瞬时 | 几分钟到几小时 |
| 核心指标 | 状态码、返回值 | RPS、响应时间、错误率 |
| 通过标准 | 断言成立 | 指标达到基线 |
| 发现的问题 | 逻辑 bug | 瓶颈、泄漏、资源耗尽 |

> 生活类比：功能测试像「体检」，一项一项查，确认每个器官功能正常；性能测试像「压力面试」或「军训拉练」，把你扔到极限环境下，看你能不能撑住、什么时候崩溃、崩溃前能扛多大压力。

## 二、locust 简介

locust（蝗虫）是 Python 生态最流行的开源性能测试工具。它的核心特点：

1. **纯 Python 编写脚本**：不用学专有 DSL，用 Python 写测试逻辑，灵活度极高。
2. **分布式**：一台 master 调度，多台 worker 模拟用户，可扩展到几十万并发。
3. **Web UI + 命令行**：自带 Web 界面实时看图表，也支持纯命令行跑 CI。
4. **基于 gevent 协程**：单机能模拟成千上万的「虚拟用户」，比线程模型轻量得多。
5. **协议无关**：主要测 HTTP，但也可以扩展测 WebSocket、gRPC 等。

locust 的核心概念：

- **HttpUser**：一个虚拟用户，模拟一个真实客户端。
- **task**：用户执行的动作，用 \`@task\` 装饰器标记。
- **wait_time**：两次请求之间的等待时间，模拟用户思考停顿。
- **User / SequentialTaskSet**：更复杂的任务编排。

> 生活类比：locust 就像一个「导演」，你告诉它「现场有 100 个群众演员（虚拟用户），每个人每 1-2 秒做一次指定动作（task）」，它就帮你调度、统计、画图表。

## 三、安装 locust

\`\`\`bash
# 安装 locust（会自动装 gevent、flask、requests 等依赖）
pip install locust

# 验证安装成功，打印版本号
locust --version

# 如果要测 WebSocket 或需要更快的 HTTP 客户端，可装 httpx
pip install httpx
\`\`\`

安装后会有一个 \`locust\` 命令可用。locust 内部用 Flask 起了一个 Web UI 服务（默认 8089 端口），用 gevent 做协程调度模拟用户。

## 四、Demo 1：准备一个待测 FastAPI 应用

性能测试需要一个被测目标。先写一个简单的 FastAPI 应用作为靶子。

\`\`\`python
# app.py —— 待测的 FastAPI 应用
# 启动方式：uvicorn app:app --port 8000

# 从 fastapi 包导入 FastAPI 主类
from fastapi import FastAPI
# 导入 Pydantic 模型基类
from pydantic import BaseModel

# 创建 FastAPI 应用实例
app = FastAPI()

# 模拟一个内存数据库
items_db = {i: {"id": i, "name": f"item-{i}", "price": i * 1.5} for i in range(1, 101)}

# 商品输入模型（POST 创建用）
class ItemIn(BaseModel):
    name: str          # 商品名称
    price: float       # 商品价格

# 商品输出模型
class ItemOut(BaseModel):
    id: int            # 商品 ID
    name: str          # 商品名称
    price: float       # 商品价格

# GET 接口：按 id 查商品（性能测试主要打这个）
@app.get("/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    # 从模拟数据库取，找不到返回 404
    item = items_db.get(item_id)
    if item is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="not found")
    return item

# POST 接口：创建商品（测写性能用）
@app.post("/items", response_model=ItemOut, status_code=201)
def create_item(item: ItemIn):
    # 生成新 id（实际项目用自增主键）
    new_id = max(items_db.keys()) + 1
    new_item = {"id": new_id, "name": item.name, "price": item.price}
    items_db[new_id] = new_item
    return new_item

# 健康检查接口（locust 跑之前可以先确认服务活着）
@app.get("/health")
def health():
    return {"status": "ok"}
\`\`\`

启动服务：\`uvicorn app:app --port 8000\`，先访问 \`http://localhost:8000/items/1\` 确认能正常返回。

## 五、Demo 2：locustfile.py 基础

locust 的测试脚本约定文件名为 \`locustfile.py\`。最小可用的脚本只需要定义一个 User 类。

\`\`\`python
# locustfile.py —— 最基础的 locust 脚本

# 从 locust 包导入 HttpUser（模拟 HTTP 客户端的虚拟用户）
from locust import HttpUser, task, between

# 定义一个虚拟用户类，继承 HttpUser
class MyUser(HttpUser):
    # wait_time：每个请求之间的随机等待时间（秒）
    # between(1, 2) 表示 1~2 秒之间随机，模拟真人思考停顿
    # 如果不设，默认是 constant(0)，会以最快速度发请求（压测极限用）
    wait_time = between(1, 2)

    # @task 装饰器：标记这是一个测试任务
    # 每个虚拟用户会循环执行被 @task 标记的方法
    @task
    def get_item(self):
        # self.client 是 locust 封装的 requests.Session
        # 会自动记录响应时间、状态码，并上报给 locust 统计
        # base_url 在启动时用 --host 指定，这里只写路径
        self.client.get("/items/1")
\`\`\`

关键点说明：

- \`HttpUser\` 自带一个 \`self.client\`，本质是增强版的 \`requests.Session\`，会自动把每次请求的耗时、状态码上报给 locust 统计模块。
- \`wait_time\` 模拟真实用户停顿。线上用户不会像机器一样狂刷，留思考时间才接近真实负载。
- \`@task\` 标记的方法会被虚拟用户循环调用。一个类里可以有多个 \`@task\`。

## 六、Demo 3：启动 locust

locust 有两种运行模式：Web UI 模式（交互式）和 headless 模式（命令行，适合 CI）。

**Web UI 模式**：

\`\`\`bash
# -f 指定脚本文件
# --host 指定被测服务的地址
locust -f locustfile.py --host=http://localhost:8000
\`\`\`

执行后访问 \`http://localhost:8089\`，会看到配置页：

- **Number of users**：模拟的总用户数（并发上限），比如 100。
- **Ramp up**：每秒新增多少用户，比如 10 表示从 0 涨到 100 需要 10 秒。
- **Host**：已被命令行 --host 指定，可改。

点 Start 后实时看图：RPS 曲线、响应时间曲线、错误统计、当前并发数。

**headless 模式（命令行，适合 CI/CD）**：

\`\`\`bash
# --headless：不开 Web UI，直接命令行跑
# -u 100：100 个并发用户
# -r 10：每秒增加 10 个用户（ramp up 速率）
# -t 30s：跑 30 秒后自动停止
# --only-summary：只在结束时打印汇总，不实时刷新
locust -f locustfile.py --host=http://localhost:8000 \\
  --headless -u 100 -r 10 -t 30s --only-summary
\`\`\`

输出大致是这样：

\`\`\`
Type     Name          # reqs   # fails  Avg   Min   Max   Med   req/s
GET      /items/1      2840     0        12    5     230   11    94.6
\`\`\`

> 生活类比：Web UI 像开着「监控大屏」做演练，你能实时看曲线、随时调参数；headless 像把测试脚本丢进「流水线」，跑完拿报告走人，适合每晚定时跑回归。

## 七、Demo 4：多任务 + 权重

真实系统里不同接口的访问比例不同。比如商品详情页访问量是下单的 10 倍。locust 用 \`@task(weight)\` 的权重参数控制比例。

\`\`\`python
# locustfile.py —— 多任务 + 权重

from locust import HttpUser, task, between
import random  # 用于生成随机参数

class ShopUser(HttpUser):
    # 等待 0.5~1 秒，节奏快一点压得明显
    wait_time = between(0.5, 1)

    # @task(3)：权重 3，表示这个任务被选中的概率是「权重 1」任务的 3 倍
    # locust 在每次循环时按权重随机挑一个 task 执行
    @task(3)
    def browse_item(self):
        # 随机访问 1~100 号商品，模拟浏览不同商品
        item_id = random.randint(1, 100)
        self.client.get(f"/items/{item_id}", name="/items/:id")

    # @task(1)：权重 1，相对浏览，下单只占 1/4 流量
    @task(1)
    def create_item(self):
        # name 参数：把不同 id 的请求归到同一统计项下
        # 否则 /items/1、/items/2 会被统计成几百个独立条目，没法看
        self.client.post(
            "/items",
            json={"name": "new-item", "price": 9.9},
            name="/items [POST]"
        )

    # @task(2)：健康检查，权重 2（实际不会这么高，这里只是演示）
    @task(2)
    def health_check(self):
        self.client.get("/health", name="/health")
\`\`\`

关于 \`name\` 参数：如果不指定，locust 会把 URL 当作统计项。带路径参数的接口（如 \`/items/1\`、\`/items/2\`）会被拆成几百个条目，报表没法看。用 \`name="/items/:id"\` 归类是性能测试的**必做规范**。

权重比例计算：3 + 1 + 2 = 6，所以 browse_item 占 50%、create_item 占 16.7%、health_check 占 33.3%。

## 八、Demo 5：测试 POST + JSON body

写性能测试和写功能测试的客户端调用很类似，区别是这里用 \`self.client\` 而不是 \`httpx\` 或 \`TestClient\`。

\`\`\`python
# locustfile.py —— 测试 POST 接口

from locust import HttpUser, task, between
import uuid  # 用 uuid 生成唯一名称，避免数据重复

class WriteUser(HttpUser):
    # 写操作频率不要太高，避免把数据库撑爆
    wait_time = between(1, 3)

    @task
    def create_item(self):
        # 生成唯一商品名，避免唯一约束冲突
        unique_name = f"item-{uuid.uuid4().hex[:8]}"
        # json= 参数：locust 会自动设置 Content-Type: application/json
        # 并把 dict 序列化成 JSON body
        self.client.post(
            "/items",
            json={"name": unique_name, "price": 19.9},
            name="/items [POST 创建]"
        )

    @task(2)
    def create_batch(self):
        # 模拟批量创建（虽然接口是单个的，但用户可能连续点）
        for _ in range(3):
            unique_name = f"batch-{uuid.uuid4().hex[:8]}"
            self.client.post(
                "/items",
                json={"name": unique_name, "price": 29.9},
                name="/items [POST 批量]"
            )
\`\`\`

注意：写性能测试时，POST 的 body 数据最好**每次不同**（用 uuid、计数器、随机数），否则可能命中缓存或触发唯一约束，测不出真实性能。

## 九、Demo 6：自定义响应断言（catch_response）

默认情况下，locust 把 2xx 当成功、其他当失败。但有时候业务上「200 但 body 字段不对」也算失败，或者「404 是预期行为」不该算失败。这时用 \`catch_response=True\` 手动判定。

\`\`\`python
# locustfile.py —— 自定义成功/失败判定

from locust import HttpUser, task, between

class StrictUser(HttpUser):
    wait_time = between(1, 2)

    @task
    def get_item_strict(self):
        # catch_response=True：把响应对象交给 with 块，由我们手动判定
        # 不传这个参数，locust 会按状态码自动判定
        with self.client.get("/items/1", catch_response=True) as response:
            # 情况 1：状态码不是 200，标记为失败
            if response.status_code != 200:
                # failure() 会让这次请求在统计里计为失败，并附带原因
                response.failure(f"期望 200，实际 {response.status_code}")
            # 情况 2：状态码对，但 body 字段不对
            elif response.json().get("id") != 1:
                response.failure("返回的 id 不是 1")
            # 情况 3：都正常，显式标记成功（可选，不调也会自动成功）
            else:
                response.success()

    @task
    def get_not_found(self):
        # 测一个 404 是预期行为的场景
        # 默认 locust 会把 404 算失败，但我们这里它就该 404
        with self.client.get("/items/99999", catch_response=True) as response:
            if response.status_code == 404:
                # 预期 404，标记成功
                response.success()
            else:
                # 不该出现别的状态码
                response.failure(f"期望 404，实际 {response.status_code}")

    @task
    def check_response_time(self):
        # 还可以根据响应时间判定：超过阈值算失败
        with self.client.get("/items/1", catch_response=True) as response:
            # response.elapsed 是 timedelta，转成毫秒
            if response.elapsed.total_seconds() * 1000 > 500:
                # 超过 500ms 算「慢请求失败」
                response.failure(f"响应超过 500ms: {response.elapsed}")
\`\`\`

\`catch_response=True\` 的核心价值：**把「HTTP 成功」和「业务成功」解耦**。生产环境性能测试一定要用这个，否则接口可能全返回 200 但业务全错，你还以为系统很稳。

## 十、Demo 7：测试登录态（on_start 保存 token）

很多接口需要登录才能访问。locust 的 \`on_start()\` 方法在每个虚拟用户启动时执行一次，适合做登录、拿 token 这类「初始化」操作。

\`\`\`python
# locustfile.py —— 带登录态的性能测试

from locust import HttpUser, task, between

class AuthUser(HttpUser):
    wait_time = between(1, 2)

    # on_start 在每个虚拟用户「诞生」时调用一次
    # 100 个用户就会有 100 次 on_start，按 ramp up 速率分批登录
    def on_start(self):
        # 模拟登录：POST /token 拿 access_token
        # 实际项目这里可能是 OAuth2 password flow
        response = self.client.post(
            "/token",
            data={"username": "alice", "password": "secret"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            name="/token [登录]"
        )
        # 解析 token 存到 self 上，后续 task 复用
        # 注意：每个虚拟用户是独立实例，token 互不干扰
        if response.status_code == 200:
            self.token = response.json()["access_token"]
        else:
            # 登录失败就置空，后续请求会 401（也能测出问题）
            self.token = None

    @task(3)
    def get_profile(self):
        # 访问需要登录的接口，带上 Authorization header
        if self.token:
            self.client.get(
                "/me",
                headers={"Authorization": f"Bearer {self.token}"},
                name="/me [需要登录]"
            )

    @task(1)
    def update_profile(self):
        # 带登录态的写操作
        if self.token:
            self.client.patch(
                "/me",
                json={"nickname": "alice-new"},
                headers={"Authorization": f"Bearer {self.token}"},
                name="/me [PATCH 修改]"
            )

    # on_stop 在用户「死亡」时调用（测试结束或手动停止）
    def on_stop(self):
        # 可选：清理资源、登出
        if self.token:
            self.client.post("/logout", name="/logout")
\`\`\`

关键点：

- \`on_start\` 只在用户启动时调用一次，不会每个请求都登录——否则登录接口被打爆，测的是登录而不是业务。
- \`self.token\` 存在实例上，每个虚拟用户独立。locust 用 gevent 协程，没有线程安全问题（同一个用户同一时刻只跑一个 task）。
- 如果 token 有过期机制，可以在 task 里判断 401 后重新登录。

## 十一、locust 关键指标解读

跑完 locust 会看到一堆指标，理解它们才能判断系统好坏：

| 指标 | 含义 | 经验值 |
|---|---|---|
| **RPS (req/s)** | 每秒处理的请求数，越高越好 | 看业务，列表接口应 >100 |
| **Avg / Min / Max** | 平均/最小/最大响应时间（ms） | Max 容易被毛刺拉高 |
| **Med (P50)** | 中位数响应时间，一半请求比这快 | 体现「多数用户体验」 |
| **P90 / P95 / P99** | 90%/95%/99% 分位响应时间 | 体现「长尾用户体验」 |
| **# fails** | 失败请求数 | 应接近 0，否则有压力问题 |
| **Failures/s** | 每秒失败数 | 持续 >0 说明扛不住 |
| **Active users** | 当前活跃虚拟用户数 | 应等于设定的并发数 |
| **Aggregated** | 所有请求汇总统计 | 整体健康度参考 |

**重点看 P95 而不是 Avg**。平均数会被大量快请求拉低，掩盖少量慢请求。P95 表示「95% 的请求都在这个时间内完成」，更能反映真实体验。比如 Avg 50ms 但 P95 2 秒，说明有 5% 用户等 2 秒以上，体验其实很差。

> 生活类比：P50 像「平均工资」，P95 像「90% 的人最高能拿多少」。光看平均会被首富拉高，看分位数才知道普通人过得怎么样。

## 本章小结

| 知识点 | 要点 |
|---|---|
| 性能测试定位 | 测「快不快、撑不撑得住」，不是「对不对」 |
| locust 核心概念 | HttpUser 模拟用户、@task 定义任务、wait_time 模拟停顿 |
| 安装 | \`pip install locust\`，自带 Web UI |
| 两种运行模式 | Web UI（交互调试）、headless（CI 自动化） |
| 任务权重 | \`@task(3)\` 权重 3，控制流量比例 |
| catch_response | 手动判定成功失败，区分 HTTP 成功和业务成功 |
| 登录态处理 | on_start 登录存 token，task 里复用 |
| 关键指标 | 重点看 P95 和错误率，别只看 Avg |
| name 参数 | 带路径参数的请求必须用 name 归类统计 |
`
  },

  // ============================================================
  // 第 2 章：压力测试与基准测试
  // ============================================================
  {
    id: "ft-benchmark",
    group: "性能与集成测试",
    icon: "⏱️",
    title: "压力测试与基准测试",
    content: `# 压力测试与基准测试

## 一、基准测试 vs 压力测试 vs 容量测试

这三个词经常混用，但侧重点不同。理解区别才能选对工具：

| 类型 | 目标 | 方法 | 典型工具 | 关键产出 |
|---|---|---|---|---|
| **基准测试 (Benchmark)** | 测「单次/单函数有多快」 | 固定输入，跑多次取统计 | pytest-benchmark、timeit | 函数耗时基线 |
| **压力测试 (Stress)** | 测「极限在哪、什么时候崩」 | 逐步加压直到出错 | locust、wrk | 崩溃点、错误率 |
| **容量测试 (Capacity)** | 测「能扛多少不降级」 | 找到 SLA 边界的最大 QPS | locust 阶梯加压 | 最大承载量 |
| **负载测试 (Load)** | 测「日常峰值下稳不稳」 | 模拟预期峰值跑一段时间 | locust 恒定并发 | 是否达标 |

> 生活类比：
> - 基准测试像「百米跑计时」，固定距离，测最快能跑多少秒。
> - 压力测试像「加重扛沙袋」，一直加重量，看你什么时候扛不住趴下。
> - 容量测试像「测背包能装多少书」，找到「还能正常走路」的最大重量。
> - 负载测试像「背日常书包走一小时」，确认平时没问题。

这章我们用不同工具做这几种测试。

## 二、Demo 1：用 pytest-benchmark 测函数性能

pytest-benchmark 是 pytest 插件，专门测「单个函数」的执行性能。适合测算法、序列化、数据处理这类纯计算逻辑。

\`\`\`bash
# 先安装插件
pip install pytest-benchmark
\`\`\`

\`\`\`python
# test_benchmark.py —— 用 pytest-benchmark 测函数性能

# 被测函数 1：列表推导式生成平方
def squares_list(n):
    # 用列表推导式生成 0~n-1 的平方
    return [i * i for i in range(n)]

# 被测函数 2：用 map + lambda（通常更慢）
def squares_map(n):
    # map 返回迭代器，转成 list
    return list(map(lambda i: i * i, range(n)))

# 基准测试 1：测 squares_list
# benchmark 是 pytest-benchmark 注入的 fixture
def test_squares_list_benchmark(benchmark):
    # benchmark(函数, 参数) 会自动跑很多轮，统计耗时
    # 结果会生成统计表：平均、标准差、min、max、迭代次数
    result = benchmark(squares_list, 10000)
    # 断言结果正确（基准测试也要验证正确性）
    assert result[-1] == 9999 * 9999

# 基准测试 2：测 squares_map，做对比
def test_squares_map_benchmark(benchmark):
    result = benchmark(squares_map, 10000)
    assert len(result) == 10000

# 基准测试 3：测参数化的多个规模
# @pytest.mark.parametrize 会生成多个测试用例
import pytest

@pytest.mark.parametrize("n", [100, 1000, 10000])
def test_squares_scale(benchmark, n):
    # 不同规模下测性能，看耗时增长曲线
    result = benchmark(squares_list, n)
    assert len(result) == n
\`\`\`

运行并对比：

\`\`\`bash
# --benchmark-only：只跑基准测试，跳过普通测试
# --benchmark-compare：和上次结果对比（先跑一次存基线）
pytest test_benchmark.py --benchmark-only -v

# 把结果存成 JSON，方便 CI 里做趋势分析
pytest test_benchmark.py --benchmark-save=baseline --benchmark-json=bench.json
\`\`\`

输出大致：

\`\`\`
Name                          Ops      Avg (ms)   Min     Max
test_squares_list[10000]      1200     0.85       0.80    1.20
test_squares_map[10000]       950      1.10       1.00    1.50
\`\`\`

pytest-benchmark 自动跑很多轮（rounds）排除冷启动，再取统计值。适合测「这个函数改了之后变快还是变慢」。

## 三、Demo 2：用 httpx 写脚本基准测试端点

pytest-benchmark 测的是函数，但端点的性能（包含网络、ASGI 处理）要单独测。最简单的方式是用 httpx 写个脚本，顺序发请求计时。

\`\`\`python
# bench_endpoint.py —— 用 httpx 顺序基准测试一个端点

import httpx      # HTTP 客户端
import time       # 计时
import statistics # 统计计算

def bench_sequential(url: str, n: int = 1000):
    """顺序发 n 个请求，统计耗时
    
    参数:
        url: 被测端点
        n: 请求总数
    """
    # 用 with 管理 client，自动关闭连接池
    with httpx.Client(base_url="http://localhost:8000") as client:
        # 先发一个预热请求，避免冷启动影响统计
        client.get("/health")

        # 记录每个请求的耗时（毫秒）
        latencies = []
        # 记录总开始时间
        t_start = time.perf_counter()

        for i in range(n):
            # 记录单次开始时间
            t0 = time.perf_counter()
            # 发请求
            r = client.get(url)
            # 单次耗时转毫秒
            dt = (time.perf_counter() - t0) * 1000
            latencies.append(dt)

        # 总耗时（秒）
        total = time.perf_counter() - t_start

    # 计算统计指标
    avg = statistics.mean(latencies)              # 平均
    p50 = statistics.median(latencies)            # 中位数 P50
    p95 = sorted(latencies)[int(len(latencies) * 0.95)]  # P95
    rps = n / total                               # 每秒请求数

    # 打印报告
    print(f"请求总数: {n}")
    print(f"总耗时: {total:.2f}s")
    print(f"RPS: {rps:.1f}")
    print(f"平均延迟: {avg:.1f}ms")
    print(f"P50: {p50:.1f}ms")
    print(f"P95: {p95:.1f}ms")

if __name__ == "__main__":
    bench_sequential("/items/1", n=1000)
\`\`\`

顺序测试能测出「单连接无并发」下的纯处理延迟。但它的 RPS 上限被「串行等待」卡死，测不出并发能力，那是下一个 demo 的事。

## 四、Demo 3：用 asyncio + httpx.AsyncClient 并发基准

要测并发能力，得用异步同时发多个请求。httpx 的 AsyncClient 配合 asyncio 是最 Pythonic 的方式。

\`\`\`python
# bench_async.py —— 异步并发基准测试

import asyncio       # 异步 IO
import httpx         # 异步 HTTP 客户端
import time
import statistics

async def fetch_one(client: httpx.AsyncClient, url: str) -> float:
    """发单个请求，返回耗时（毫秒）"""
    t0 = time.perf_counter()
    await client.get(url)
    return (time.perf_counter() - t0) * 1000

async def bench_concurrent(url: str, concurrency: int = 100, total: int = 1000):
    """并发基准测试
    
    参数:
        url: 被测端点
        concurrency: 并发连接数
        total: 总请求数
    """
    # 异步上下文管理器创建 client
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # 预热
        await client.get("/health")

        # 用 Semaphore 控制并发上限，避免一次性创建 total 个协程
        sem = asyncio.Semaphore(concurrency)

        async def bounded_fetch():
            # 用信号量限制同时进行的请求数
            async with sem:
                return await fetch_one(client, url)

        # 创建 total 个任务
        tasks = [bounded_fetch() for _ in range(total)]
        # 计时开始
        t0 = time.perf_counter()
        # 并发执行所有任务，gather 会等全部完成
        latencies = await asyncio.gather(*tasks)
        # 总耗时
        total_time = time.perf_counter() - t0

    # 统计
    avg = statistics.mean(latencies)
    p50 = statistics.median(latencies)
    p95 = sorted(latencies)[int(len(latencies) * 0.95)]
    rps = total / total_time

    print(f"并发数: {concurrency}, 总请求: {total}")
    print(f"总耗时: {total_time:.2f}s")
    print(f"RPS: {rps:.1f}")
    print(f"平均: {avg:.1f}ms, P50: {p50:.1f}ms, P95: {p95:.1f}ms")

if __name__ == "__main__":
    # 跑不同并发档位，对比
    asyncio.run(bench_concurrent("/items/1", concurrency=10, total=1000))
    asyncio.run(bench_concurrent("/items/1", concurrency=50, total=1000))
    asyncio.run(bench_concurrent("/items/1", concurrency=100, total=1000))
\`\`\`

并发测试能看到 RPS 随并发数增长的曲线。通常并发加到某个值后 RPS 不再涨（CPU/DB 打满），延迟开始飙升——这个拐点就是系统的最大承载量。

## 五、Demo 4：用 wrk 命令行压测

wrk 是 C 写的高性能压测工具，单机就能打出几十万 QPS，适合压「纯吞吐」极限。Python 工具受 GIL 限制打不出极限，wrk 没这个问题。

\`\`\`bash
# macOS 安装
brew install wrk

# Ubuntu 安装
# apt-get install wrk
\`\`\`

基础用法：

\`\`\`bash
# -t4：4 个线程（一般等于 CPU 核数）
# -c100：100 个并发连接
# -d30s：持续 30 秒
wrk -t4 -c100 -d30s http://localhost:8000/items/1
\`\`\`

输出：

\`\`\`
Running 30s test @ http://localhost:8000/items/1
  4 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     12.5ms    4.2ms   85.0ms   85.3%
    Req/Sec     2.0k      0.2k     2.5k    88.2%
  24012 requests in 30.00s
Requests/sec:   800.4    # QPS
Transfer/sec:    1.2MB
\`\`\`

**测 POST 接口**（用 lua 脚本）：

\`\`\`lua
-- post.lua: wrk 测 POST 的脚本
-- 设置 HTTP 方法和路径
wrk.method = "POST"
wrk.path = "/items"
wrk.body = '{"name":"x","price":9.9}'
wrk.headers["Content-Type"] = "application/json"
\`\`\`

\`\`\`bash
# -s 指定 lua 脚本
wrk -t4 -c100 -d30s -s post.lua http://localhost:8000
\`\`\`

wrk 适合做「快速验证极限 QPS」，locust 适合做「复杂业务场景模拟」。两者搭配用。

## 六、Demo 5：阶梯式加压（LoadTestShape）

恒定并发只能测「某个固定负载下稳不稳」。想知道「系统能扛多少」，得阶梯式加压——每阶段提高并发，观察什么时候开始出错。locust 的 \`LoadTestShape\` 支持这种。

\`\`\`python
# locustfile_shape.py —— 阶梯式加压

from locust import HttpUser, task, between, LoadTestShape

class StepUser(HttpUser):
    wait_time = between(0.5, 1)

    @task
    def get_item(self):
        self.client.get("/items/1", name="/items/:id")

# 自定义负载形状：阶梯式加压
class StagesShape(LoadTestShape):
    # stages：每个元组是 (持续时间秒, 该阶段用户数, 该阶段每秒 spawn 速率)
    stages = [
        {"duration": 30, "users": 10, "spawn_rate": 5},    # 阶段1: 30秒内涨到10用户
        {"duration": 60, "users": 50, "spawn_rate": 10},   # 阶段2: 涨到50用户
        {"duration": 90, "users": 100, "spawn_rate": 10},  # 阶段3: 涨到100用户
        {"duration": 120, "users": 200, "spawn_rate": 20}, # 阶段4: 涨到200用户
        {"duration": 150, "users": 500, "spawn_rate": 30}, # 阶段5: 涨到500用户
    ]

    def tick(self):
        """每次调度调用，返回 (当前用户数, spawn_rate) 或 None 结束
        
        locust 框架会反复调用 tick()，根据返回值调整并发。
        返回 None 表示测试结束。
        """
        # 算出已经运行了多少秒
        run_time = self.get_run_time()

        # 遍历阶段，找到当前应该处于哪个阶段
        for stage in self.stages:
            if run_time < stage["duration"]:
                # 还没到这个阶段结束时间，返回该阶段配置
                return (stage["users"], stage["spawn_rate"])

        # 所有阶段都跑完，返回 None 结束测试
        return None
\`\`\`

运行（不需要指定 -u -r，shape 接管了）：

\`\`\`bash
locust -f locustfile_shape.py --host=http://localhost:8000 --headless -t 180s
\`\`\`

在 Web UI 里能看到并发数像楼梯一样上升，同时观察错误率和 P95。当某个阶段错误率突然飙升，那个并发数就是系统的「崩溃点」。

## 七、Demo 6：找出瓶颈

性能测试跑完拿到数据，下一步是「为什么慢」。瓶颈通常在三个地方：CPU、数据库、网络/IO。

**用 cProfile 分析 Python 代码热点**：

\`\`\`python
# profile_app.py —— 用 cProfile 分析 FastAPI 路由

import cProfile      # Python 内置性能分析器
import pstats        # 分析结果统计
from fastapi.testclient import TestClient
from app import app  # 导入待测应用

def profile_endpoint():
    """分析 GET /items/1 的调用栈耗时"""
    client = TestClient(app)
    # 发 1000 次请求，让热点足够明显
    for _ in range(1000):
        client.get("/items/1")

if __name__ == "__main__":
    # 创建 profiler
    profiler = cProfile.Profile()
    # 开始 profiling，跑目标函数
    profiler.enable()
    profile_endpoint()
    profiler.disable()

    # 输出按累计耗时排序的统计
    stats = pstats.Stats(profiler)
    # sortby='cumulative' 按累计时间排序
    stats.sort_stats("cumulative").print_stats(20)
    # 也可以存到文件后续分析
    stats.dump_stats("profile.prof")
\`\`\`

输出会列出耗时最多的函数，比如发现 80% 时间花在 \`json.dumps\` 上，说明序列化是瓶颈。

**用 py-spy 生成火焰图**（不用改代码）：

\`\`\`bash
# 安装 py-spy（Rust 写的采样 profiler，开销极低）
pip install py-spy

# 实时采样正在运行的进程，生成火焰图
# --pid 指定 uvicorn 进程号
py-spy record --pid <PID> --duration 30 -o flame.svg

# 也可以直接用 py-spy 启动应用
py-spy record -o flame.svg -- python -m uvicorn app:app --port 8000
\`\`\`

火焰图里「最宽的横条」就是最耗时的函数。一眼能看出瓶颈在哪。

**常见瓶颈特征**：

| 瓶颈位置 | 典型特征 | 验证方法 |
|---|---|---|
| 数据库 | P95 远大于 P50，慢查询 | 看 DB 慢查询日志、连接池状态 |
| CPU | CPU 100%，RPS 不再涨 | top / htop 看 Python 进程 |
| 内存 | 内存持续增长不释放 | 监控 RSS，可能是泄漏 |
| 网络 | 延迟高但 CPU/DB 都闲 | 看带宽、TCP 重传 |
| 锁竞争 | 并发上去延迟暴涨 | py-spy 看是否卡在锁上 |

## 八、Demo 7：FastAPI 性能优化技巧

测出瓶颈后，常用优化手段：

\`\`\`python
# 优化示例：async 路由 + 连接池 + 缓存

from fastapi import FastAPI
import httpx          # 异步 HTTP 客户端
import asyncpg        # 异步 PostgreSQL 驱动
from functools import lru_cache

app = FastAPI()

# 优化 1：用 async 路由，避免阻塞事件循环
# 同步路由 def get() 会占用线程池，并发受限于线程数
# async def 路由跑在事件循环里，能扛更高并发
@app.get("/items/{item_id}")
async def get_item(item_id: int):
    # 内部 IO 操作也要用 async 库，否则 async 路由没意义
    # 比如用 asyncpg 而不是 psycopg2
    row = await db.fetchrow("SELECT * FROM items WHERE id=$1", item_id)
    return dict(row)

# 优化 2：复用连接池，不要每次请求新建连接
# 全局创建一次，应用关闭时释放
@app.on_event("startup")
async def startup():
    # 创建数据库连接池（min_size/max_size 控制连接数）
    app.state.db = await asyncpg.create_pool(
        "postgresql://user:pass@localhost/db",
        min_size=5,     # 最小连接数
        max_size=20,    # 最大连接数
    )

@app.on_event("shutdown")
async def shutdown():
    # 关闭连接池
    await app.state.db.close()

# 优化 3：热点数据加缓存
# lru_cache 装饰器：相同参数直接返回缓存结果，不重复计算
@lru_cache(maxsize=1024)
def expensive_compute(key: str):
    # 模拟耗时计算
    import time
    time.sleep(0.1)
    return f"result-{key}"

@app.get("/compute/{key}")
def compute(key: str):
    # 第二次访问相同 key 会命中缓存，几乎 0 耗时
    return {"result": expensive_compute(key)}

# 优化 4：response_model 过滤多余字段，减少序列化开销
# 只返回前端需要的字段，不要返回完整 ORM 对象
from pydantic import BaseModel

class ItemBrief(BaseModel):
    id: int
    name: str
    # 不包含 description、created_at 等大字段

@app.get("/items-brief/{item_id}", response_model=ItemBrief)
async def get_brief(item_id: int):
    row = await app.state.db.fetchrow("SELECT * FROM items WHERE id=$1", item_id)
    return row
\`\`\`

**优化优先级**：先优化最慢的接口（P95 最高的），再优化高频接口（RPS 最高的）。一个从 2s 优化到 200ms 的接口，比把 50ms 优化到 40ms 价值大得多。

> 生活类比：优化像「修路」，先修最堵的那段路（最慢接口），而不是给已经通畅的路再刷一层漆。

## 九、关键指标速查

| 指标 | 含义 | 关注点 |
|---|---|---|
| **QPS / RPS** | 每秒查询/请求数 | 吞吐能力，越高越好 |
| **延迟 P95** | 95% 请求的响应时间 | 长尾体验，应 < SLA |
| **P99** | 99% 请求响应时间 | 极端用户，看是否可接受 |
| **错误率** | 失败请求占比 | 应 <0.1%，压力大了会涨 |
| **CPU 占用** | CPU 使用率 | 接近 100% 说明 CPU 是瓶颈 |
| **内存占用** | RSS 内存 | 持续增长可能有泄漏 |
| **连接池使用率** | DB 连接占用比例 | 接近上限会排队超时 |
| **GC 时间** | 垃圾回收耗时 | 频繁 GC 会卡顿 |

## 本章小结

| 知识点 | 要点 |
|---|---|
| 测试类型 | 基准测函数、压力测极限、容量测承载、负载测日常 |
| pytest-benchmark | 测单个函数耗时，适合算法优化对比 |
| httpx 顺序/并发基准 | 自定义脚本测端点，灵活但性能受 GIL 限制 |
| wrk | C 写的高性能压测，打极限 QPS |
| 阶梯加压 LoadTestShape | 找系统崩溃点，测最大承载 |
| 瓶颈定位 | cProfile 看热点、py-spy 火焰图、监控资源 |
| 优化手段 | async 路由、连接池、缓存、response_model 精简 |
| 指标解读 | 看 P95 不看 Avg，错误率是红线 |
| 优化顺序 | 先修最慢接口，再修高频接口 |
`
  },

  // ============================================================
  // 第 3 章：集成测试
  // ============================================================
  {
    id: "ft-integration",
    group: "性能与集成测试",
    icon: "🔗",
    title: "集成测试",
    content: `# 集成测试

## 一、集成测试 vs 单元测试

前面章节我们写了大量单元测试：mock 掉数据库、mock 掉外部 API，只测单个函数/路由的逻辑。单元测试快、隔离、定位准，但它有个致命假设——「我 mock 的东西和真实东西行为一致」。

现实是：mock 和真实经常不一致。比如：

- mock 的数据库永远秒回，真实数据库有连接池、锁、事务隔离。
- mock 的 Redis \`set\` 总是成功，真实 Redis 可能内存满了。
- mock 的外部 API 返回固定 JSON，真实 API 可能改了字段格式。

**集成测试把多个真实组件拼在一起测**，验证它们「组装后能协作」。它不 mock（或只 mock 外部第三方），用真实的数据库、真实的 Redis、真实的文件系统，跑真实的 SQL、真实的缓存读写。

| 维度 | 单元测试 | 集成测试 |
|---|---|---|
| 测什么 | 单个函数/模块 | 多模块协作 |
| 依赖处理 | 全部 mock | 用真实依赖（除第三方） |
| 速度 | 极快（毫秒级） | 较慢（秒级，要起服务） |
| 隔离性 | 完全隔离 | 共享环境 |
| 发现的问题 | 逻辑错误 | 接口不匹配、集成 bug |
| 维护成本 | 低 | 较高（环境搭建） |
| 数量 | 多（占 70%） | 适中（占 20%） |

> 生活类比：
> - 单元测试像「检查每个零件合格」——发动机单独测、轮胎单独测、刹车单独测。
> - 集成测试像「把车组装起来试驾」——发动机+变速箱+轮胎一起转，看能不能跑、换挡顺不顺。
> - 零件都合格不代表整车能跑，组装环节可能有接口不匹配。

## 二、集成测试的策略

集成测试有几个关键策略：

1. **用真实依赖，但隔离环境**：用 SQLite（内存或文件）代替 PostgreSQL，用 fakeredis 代替真实 Redis。行为接近真实，但不需要起外部服务。

2. **每个测试独立的状态**：测试之间不能互相影响。用事务回滚或每次重建表，保证每个测试拿到干净数据库。

3. **测试真实业务流程**：不只是「调一个接口」，而是「注册→登录→操作→登出」这种多步骤流程，验证模块协作。

4. **分层 mock**：自己的数据库/缓存用真实的，外部第三方 API（支付、短信）用 mock。因为第三方不可控、不稳定、可能收费。

## 三、Demo 1：完整集成测试环境

先搭一个带数据库和缓存的 FastAPI 应用，作为集成测试的目标。

\`\`\`python
# integration_app.py —— 待测的集成应用

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import json

# === 数据库配置 ===
# 用 SQLite 文件库，集成测试可切换到内存库
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_integration.db"
# 创建引擎，check_same_thread=False 允许多线程访问（FastAPI 需要）
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
# 创建会话工厂
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
# 声明式基类
Base = declarative_base()

# === 数据库模型 ===
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)    # 自增主键
    username = Column(String, unique=True, index=True)    # 用户名，唯一
    password_hash = Column(String)                        # 密码哈希
    email = Column(String)                                # 邮箱

# 创建所有表
Base.metadata.create_all(bind=engine)

# === 简易 Redis mock（实际用 fakeredis）===
class SimpleRedis:
    """简易内存缓存，模拟 Redis 接口"""
    def __init__(self):
        self._data = {}

    def set(self, key, value, ex=None):
        self._data[key] = json.dumps(value)

    def get(self, key):
        if key in self._data:
            return json.loads(self._data[key])
        return None

    def delete(self, key):
        self._data.pop(key, None)

# 全局缓存实例
cache = SimpleRedis()

# === FastAPI 应用 ===
app = FastAPI()

# 数据库依赖
def get_db():
    """每个请求创建独立会话，请求结束关闭"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 输入模型
class UserCreate(BaseModel):
    username: str
    password: str
    email: str

# 注册接口
@app.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 检查用户名是否已存在
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="username exists")
    # 创建用户（实际项目要 hash 密码）
    db_user = User(username=user.username, password_hash=f"hash_{user.password}", email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"id": db_user.id, "username": db_user.username}

# 登录接口（简化版，返回假 token）
@app.post("/token")
def login(username: str, password: str, db: Session = Depends(get_db)):
    # 查用户
    db_user = db.query(User).filter(User.username == username).first()
    # 验证密码
    if not db_user or db_user.password_hash != f"hash_{password}":
        raise HTTPException(status_code=401, detail="invalid credentials")
    # 生成 token（实际用 JWT）
    token = f"token-{db_user.id}"
    # 缓存 token 到 user 的映射
    cache.set(token, {"user_id": db_user.id, "username": db_user.username})
    return {"access_token": token, "token_type": "bearer"}

# 获取当前用户信息
@app.get("/me")
def me(authorization: str, db: Session = Depends(get_db)):
    # 从 header 取 token
    token = authorization.replace("Bearer ", "")
    # 从缓存查 token 对应用户
    payload = cache.get(token)
    if not payload:
        raise HTTPException(status_code=401, detail="invalid token")
    # 从数据库查完整用户
    db_user = db.query(User).filter(User.id == payload["user_id"]).first()
    return {"username": db_user.username, "email": db_user.email}
\`\`\`

这个应用包含：数据库（SQLAlchemy + SQLite）、缓存（SimpleRedis 模拟）、三个接口（注册/登录/查信息）。集成测试会测它们的协作。

## 四、Demo 2：测试用户注册→登录→访问端到端流程

这是集成测试最典型的写法：用 TestClient 走完一个真实业务流程，验证多模块协作。

\`\`\`python
# test_integration_flow.py —— 集成测试：完整用户流程

import pytest
from fastapi.testclient import TestClient
from integration_app import app, Base, engine, cache

# 测试 fixture：每个测试前清空数据库和缓存
@pytest.fixture(autouse=True)
def clean_db():
    """每个测试前清空表数据，保证测试隔离
    
    autouse=True 表示所有测试自动用这个 fixture
    """
    # 清空所有表（保留表结构）
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    # 清空缓存
    cache._data.clear()
    # yield 让出控制权给测试
    yield
    # 测试后再清理一次（防御性）
    Base.metadata.drop_all(bind=engine)

# 创建 TestClient（一次性，所有测试复用）
client = TestClient(app)

def test_user_register_login_access_flow():
    """集成测试：注册 → 登录 → 访问 /me 完整流程
    
    这个测试验证了：
    1. 数据库写入（注册）
    2. 缓存读写（登录后存 token）
    3. 认证依赖（/me 校验 token）
    4. 三个接口的协作
    """
    # 步骤 1：注册新用户
    r = client.post("/register", json={
        "username": "alice",
        "password": "secret123",
        "email": "alice@example.com"
    })
    # 验证注册成功
    assert r.status_code == 201
    assert r.json()["username"] == "alice"

    # 步骤 2：登录拿 token
    r = client.post("/token", params={
        "username": "alice",
        "password": "secret123"
    })
    # 验证登录成功
    assert r.status_code == 200
    token = r.json()["access_token"]
    # token 应该非空
    assert token.startswith("token-")

    # 步骤 3：带 token 访问受保护端点
    r = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    # 验证能拿到用户信息
    assert r.status_code == 200
    assert r.json()["username"] == "alice"
    assert r.json()["email"] == "alice@example.com"

def test_login_with_wrong_password():
    """集成测试：密码错误应该登录失败"""
    # 先注册
    client.post("/register", json={
        "username": "bob",
        "password": "correct",
        "email": "bob@example.com"
    })
    # 用错误密码登录
    r = client.post("/token", params={"username": "bob", "password": "wrong"})
    assert r.status_code == 401

def test_access_me_without_token():
    """集成测试：没 token 访问 /me 应该 401"""
    r = client.get("/me", headers={"Authorization": "Bearer invalid"})
    assert r.status_code == 401
\`\`\`

注意这里**没有 mock 任何东西**——数据库是真实的 SQLite，缓存是真实的 SimpleRedis，HTTP 是真实的 ASGI 调用。如果注册逻辑和数据库交互有 bug（比如 commit 漏了），单元测试 mock 掉 DB 是发现不了的，集成测试能抓到。

## 五、Demo 3：测试事务回滚（每测试后清理）

上面用 \`drop_all + create_all\` 清理太重（每次重建表结构）。生产级集成测试通常用**事务回滚**：每个测试跑在一个事务里，测试结束 rollback，数据不真正写入。

\`\`\`python
# test_transaction_rollback.py —— 用事务回滚做测试隔离

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker
from integration_app import app, Base, engine, get_db
from sqlalchemy.orm import Session

# 覆盖数据库依赖，让每个测试用事务包裹的会话
@pytest.fixture
def db_session():
    """创建事务包裹的会话，测试后回滚
    
    原理：开一个外层事务，所有操作在这个事务里，
    测试结束 rollback，数据不真正持久化。
    """
    # 创建连接，开启事务
    connection = engine.connect()
    # 开始外层事务
    transaction = connection.begin()
    # 绑定会话到这个连接
    session = Session(bind=connection)

    yield session

    # 测试结束：关闭会话、回滚事务、关闭连接
    session.close()
    transaction.rollback()
    connection.close()

# 覆盖 FastAPI 的 get_db 依赖，让它用我们的测试会话
@pytest.fixture
def client(db_session):
    """创建用测试会话的 TestClient"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass  # 不在这里 close，由 db_session fixture 管理

    # 覆盖依赖
    app.dependency_overrides[get_db] = override_get_db
    # 创建客户端
    with TestClient(app) as c:
        yield c
    # 清理覆盖
    app.dependency_overrides.clear()

def test_register_with_rollback(client, db_session):
    """测试注册：数据不会真的留下来"""
    r = client.post("/register", json={
        "username": "charlie",
        "password": "pw",
        "email": "c@e.com"
    })
    assert r.status_code == 201

    # 在会话里能查到（同一个事务）
    from integration_app import User
    user = db_session.query(User).filter(User.username == "charlie").first()
    assert user is not None

    # 测试结束后事务回滚，charlie 不会留在数据库里
    # 下一个测试拿到的还是干净数据库
\`\`\`

事务回滚比 drop/create 快得多（不重建表结构），是 PostgreSQL/MySQL 集成测试的标准做法。SQLite 也支持，但要注意 SQLite 的嵌套事务有些限制。

## 六、Demo 4：测试外部 API 集成（respx）

如果应用调用了外部 API（支付、短信、地图），集成测试不能真打外部（慢、不稳定、收费）。这时用 \`respx\` mock httpx 的请求。

\`\`\`bash
# 安装 respx
pip install respx
\`\`\`

\`\`\`python
# test_external_api.py —— mock 外部 API 的集成测试

import pytest
import httpx
import respx
from fastapi import FastAPI

# 假设应用里有个接口会调外部支付 API
app = FastAPI()

# 应用内部用 httpx 调外部支付服务
async def call_payment(amount: float):
    """调外部支付 API"""
    async with httpx.AsyncClient() as client:
        # 真实环境会打 https://api.payment.com/charge
        r = await client.post("https://api.payment.com/charge", json={"amount": amount})
        return r.json()

@app.post("/pay")
async def pay(amount: float):
    # 调外部支付
    result = await call_payment(amount)
    if result.get("status") == "success":
        return {"paid": True, "txn_id": result["txn_id"]}
    return {"paid": False}

# === 集成测试 ===

@respx.mock  # 装饰器：拦截所有 httpx 请求
@pytest.mark.asyncio
async def test_pay_success():
    """测试支付成功：mock 外部 API 返回成功"""
    # 注册 mock 路由：当 POST https://api.payment.com/charge 被调用时
    # 返回我们指定的假响应
    respx.post("https://api.payment.com/charge").mock(
        return_value=httpx.Response(200, json={
            "status": "success",
            "txn_id": "txn-123"
        })
    )

    # 调用应用接口（会触发内部 httpx 调用，但被 respx 拦截）
    from fastapi.testclient import TestClient
    client = TestClient(app)
    r = client.post("/pay", params={"amount": 99.9})

    # 验证应用正确处理了外部 API 响应
    assert r.status_code == 200
    assert r.json()["paid"] is True
    assert r.json()["txn_id"] == "txn-123"

    # 验证 respx 确实拦截到了请求（调用次数断言）
    assert respx.calls.call_count == 1

@respx.mock
@pytest.mark.asyncio
async def test_pay_external_failure():
    """测试外部 API 失败时的处理"""
    # mock 外部 API 返回失败
    respx.post("https://api.payment.com/charge").mock(
        return_value=httpx.Response(200, json={"status": "failed"})
    )

    client = TestClient(app)
    r = client.post("/pay", params={"amount": 99.9})

    # 应用应该正确处理失败
    assert r.json()["paid"] is False

@respx.mock
@pytest.mark.asyncio
async def test_pay_external_timeout():
    """测试外部 API 超时"""
    # mock 抛超时异常
    respx.post("https://api.payment.com/charge").mock(
        side_effect=httpx.TimeoutException("timeout")
    )

    client = TestClient(app)
    # 应用应该捕获超时，不直接崩
    # （需要应用内有 try/except，这里假设返回 500）
    r = client.post("/pay", params={"amount": 99.9})
    # 实际项目应该返回友好错误，这里测兜底
\`\`\`

respx 的价值：**应用内部逻辑是真实跑的，只有最外层的 HTTP 出口被拦截**。这样能测到「应用如何处理外部 API 的各种响应」，比单纯 mock 函数更真实。

## 七、Demo 5：测试数据库迁移（alembic）

生产应用会不断改表结构，用 alembic 管理迁移。集成测试要验证「迁移能正确执行」。

\`\`\`python
# test_migrations.py —— 测试 alembic 迁移

import pytest
import subprocess
from sqlalchemy import create_engine, inspect

# 测试用数据库 URL（独立的，不污染开发库）
TEST_DB_URL = "sqlite:///./test_migrate.db"

def run_alembic(command: str):
    """执行 alembic 命令"""
    # 用 subprocess 调 alembic CLI
    result = subprocess.run(
        ["alembic", command],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        # 迁移失败，打印 stderr 帮助调试
        pytest.fail(f"alembic {command} failed: {result.stderr}")
    return result.stdout

def test_fresh_migration():
    """测试从空库开始迁移到最新版本"""
    # 先确保是空库（删除文件或 drop all）
    import os
    if os.path.exists("./test_migrate.db"):
        os.remove("./test_migrate.db")

    # 执行 alembic upgrade head：从 0 迁移到最新
    output = run_alembic("upgrade head")

    # 验证表结构存在
    engine = create_engine(TEST_DB_URL)
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    # 检查关键表是否创建
    assert "users" in table_names, "users 表应该被创建"
    # 可以进一步检查字段
    columns = [c["name"] for c in inspector.get_columns("users")]
    assert "username" in columns
    assert "password_hash" in columns

def test_migration_rollback():
    """测试迁移可以回滚（降级）"""
    # 先升级到最新
    run_alembic("upgrade head")
    # 回退一个版本
    run_alembic("downgrade -1")
    # 再升回来，验证来回迁移都成功
    run_alembic("upgrade head")

    # 回退再升级后表应该完整
    engine = create_engine(TEST_DB_URL)
    inspector = inspect(engine)
    assert "users" in inspector.get_table_names()
\`\`\`

迁移测试的价值：生产部署时迁移失败是灾难性的。提前在 CI 跑一遍「从空库升级」，能发现迁移脚本的语法错误、依赖顺序错误。

## 八、Demo 6：测试 Redis 缓存集成（fakeredis）

真实 Redis 需要起服务，集成测试用 fakeredis 模拟，接口完全兼容。

\`\`\`bash
# 安装 fakeredis
pip install fakeredis
\`\`\`

\`\`\`python
# test_redis_integration.py —— 用 fakeredis 测缓存集成

import pytest
import fakeredis
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

app = FastAPI()

# 缓存依赖：生产用真 Redis，测试用 fakeredis
def get_redis():
    """获取 Redis 客户端"""
    # 生产环境这里连真 Redis
    import redis
    return redis.Redis(host="localhost", port=6379)

# 一个带缓存的接口
@app.get("/cached/{key}")
def cached_get(key: str, redis=Depends(get_redis)):
    """先查缓存，没有再「查数据库」（这里模拟）"""
    # 先查缓存
    cached = redis.get(f"cache:{key}")
    if cached:
        return {"source": "cache", "value": cached.decode()}
    # 缓存没有，查「数据库」（模拟）
    value = f"db-value-{key}"
    # 写入缓存，设过期 60 秒
    redis.setex(f"cache:{key}", 60, value)
    return {"source": "db", "value": value}

# === 集成测试 ===

@pytest.fixture
def fake_redis():
    """提供 fakeredis 实例，接口和真 Redis 完全一样"""
    # FakeRedis 模拟 Redis 的所有操作，包括 setex、get、expire 等
    return fakeredis.FakeRedis()

@pytest.fixture
def client(fake_redis):
    """用 fakeredis 覆盖 Redis 依赖"""
    def override_redis():
        return fake_redis
    app.dependency_overrides[get_redis] = override_redis
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

def test_cache_miss_then_hit(client, fake_redis):
    """测试缓存未命中→写入→命中流程"""
    # 第一次访问：缓存未命中，从「数据库」取
    r = client.get("/cached/item1")
    assert r.status_code == 200
    assert r.json()["source"] == "db"  # 来自数据库
    assert r.json()["value"] == "db-value-item1"

    # 验证缓存被写入
    assert fake_redis.get("cache:item1") is not None

    # 第二次访问：缓存命中
    r = client.get("/cached/item1")
    assert r.json()["source"] == "cache"  # 来自缓存
    assert r.json()["value"] == "db-value-item1"

def test_cache_expiration(client, fake_redis):
    """测试缓存过期"""
    # 写入缓存
    client.get("/cached/temp")
    # 确认缓存存在
    assert fake_redis.get("cache:temp") is not None
    # 模拟过期：删除 key
    fake_redis.delete("cache:temp")
    # 再次访问应该重新从「数据库」取
    r = client.get("/cached/temp")
    assert r.json()["source"] == "db"
\`\`\`

fakeredis 的好处：**测试代码和生产代码完全一样**，只是依赖注入换了个实现。生产换回真 Redis 不用改任何业务代码。

## 九、Demo 7：集成测试标记 + 跳过策略

集成测试慢，不想每次 \`pytest\` 都跑。用 pytest mark 标记，按需运行。

\`\`\`python
# conftest.py —— 全局 pytest 配置

import pytest

# 注册自定义标记
def pytest_configure(config):
    config.addinivalue_line("markers", "integration: 集成测试（需要 DB/Redis）")
    config.addinivalue_line("markers", "slow: 跑得慢的测试")
    config.addinivalue_line("markers", "external: 依赖外部服务")

# === 在测试里使用标记 ===

# test_marked.py
import pytest
from fastapi.testclient import TestClient
from integration_app import app

client = TestClient(app)

@pytest.mark.integration
def test_user_flow():
    """标记为集成测试"""
    # 注册→登录→访问流程
    pass

@pytest.mark.integration
@pytest.mark.slow
def test_large_batch():
    """标记为又集成又慢"""
    # 批量插入 10000 条数据测试
    pass

@pytest.mark.external
def test_real_payment():
    """依赖真实外部服务（很少用）"""
    pass
\`\`\`

\`\`\`bash
# 只跑集成测试
pytest -m integration

# 跳过集成测试（快速跑单元测试时）
pytest -m "not integration"

# 跳过慢测试
pytest -m "not slow"

# 只跑非集成非慢的（最快）
pytest -m "not integration and not slow"

# 在 CI 里：先跑快的，再跑集成
pytest -m "not integration"    # 第一阶段
pytest -m integration          # 第二阶段
\`\`\`

\`\`\`ini
# pytest.ini —— 也可以在配置文件里设置
[pytest]
markers =
    integration: 集成测试
    slow: 慢测试
    external: 依赖外部服务

# 默认不跑 external（除非显式指定）
addopts = -m "not external"
\`\`\`

## 十、单元 vs 集成 vs E2E 对比

| 维度 | 单元测试 | 集成测试 | E2E 测试 |
|---|---|---|---|
| 范围 | 单个函数 | 多模块协作 | 整个系统 |
| 依赖 | 全 mock | 部分真实 | 全真实 |
| 速度 | 毫秒 | 秒 | 秒~分钟 |
| 数量占比 | 70% | 20% | 10% |
| 发现 bug 类型 | 逻辑错误 | 接口不匹配 | 业务流程断 |
| 维护成本 | 低 | 中 | 高 |
| 环境要求 | 无 | 测试 DB/缓存 | 完整环境 |

## 本章小结

| 知识点 | 要点 |
|---|---|
| 集成测试定位 | 测多模块协作，发现 mock 掩盖的集成 bug |
| 测试策略 | 真实依赖 + 隔离环境 + 测业务流程 |
| 环境隔离 | 事务回滚比 drop/create 快，是标准做法 |
| 外部 API mock | 用 respx 拦截 httpx，应用逻辑真实跑 |
| 迁移测试 | alembic upgrade head 验证迁移脚本 |
| 缓存集成 | fakeredis 接口兼容真 Redis，无侵入 |
| 测试标记 | @pytest.mark.integration 分类，按需运行 |
| 依赖注入 | 用 dependency_overrides 替换依赖实现 |
| 数量配比 | 单元 70%、集成 20%、E2E 10%（金字塔） |
`
  },

  // ============================================================
  // 第 4 章：端到端测试
  // ============================================================
  {
    id: "ft-e2e",
    group: "性能与集成测试",
    icon: "🎯",
    title: "端到端测试",
    content: `# 端到端测试

## 一、E2E 测试是什么

端到端测试（End-to-End，E2E）是从**最终用户的视角**，测试整个系统从入口到出口的完整流程。它不关心内部实现，只关心「用户点这个按钮，最终能看到这个结果」。

集成测试验证「模块能协作」，但范围还是局部的（API + DB）。E2E 更进一步：**前端 UI + 后端 API + 数据库 + 缓存 + 外部服务**，整个链路一起跑，模拟真实用户操作。

| 维度 | 单元测试 | 集成测试 | E2E 测试 |
|---|---|---|---|
| 视角 | 开发者 | 开发者 | 最终用户 |
| 范围 | 单函数 | 多模块 | 全系统 |
| 包含前端 | 否 | 否 | 是 |
| 包含真实环境 | 否 | 部分 | 是 |
| 模拟方式 | mock 依赖 | 真实依赖 | 真实浏览器/客户端 |
| 速度 | 极快 | 中 | 慢 |
| 稳定性 | 高 | 中 | 较低（容易 flaky） |
| 数量 | 多 | 中 | 少 |

> 生活类比：
> - 单元测试像「检查发动机零件」。
> - 集成测试像「发动机+变速箱组装后试转」。
> - E2E 测试像「真人上车，从家开到公司，全程体验」。
>
> E2E 最接近真实用户体验，但也最慢、最易碎，所以数量要少而精。

## 二、E2E 工具选择

E2E 测试有几条技术路线，按「有没有 UI」分：

| 工具 | 类型 | 适合场景 | 特点 |
|---|---|---|---|
| **httpx 脚本** | 无 UI 的 API 级 E2E | 纯后端 API、移动端后端 | 快、稳、写法简单 |
| **Playwright** | 浏览器自动化 | Web 前端+后端完整流程 | 现代、跨浏览器、API 友好 |
| **Selenium** | 浏览器自动化 | 老项目、需多浏览器 | 老牌、生态成熟、稍慢 |
| **Cypress** | 浏览器自动化 | 前端为主的 E2E | 开发体验好、仅 Chrome |

**选择建议**：

- 纯 API 服务（无前端）：用 httpx 写脚本，最轻量。
- 全栈 Web 应用（有前端）：用 Playwright，现代且强大。
- 老项目已用 Selenium：继续用，没必要为换而换。
- 前端团队主导：Cypress 开发体验最佳。

这章重点演示 httpx 脚本（无 UI）和 Playwright（有 UI）两条路线。

## 三、Demo 1：用 httpx 模拟客户端 E2E 流程（无 UI）

对于纯后端 API，E2E 就是「模拟客户端按真实顺序调接口」。和集成测试的区别：E2E 打的是**真实起的服务**（\`uvicorn\` 跑着），不是 TestClient。

\`\`\`python
# test_e2e_api.py —— httpx 端到端测试（真实服务）

import httpx
import pytest

# 被测服务地址（需要先 uvicorn app:app --port 8000 起着）
BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="module")
def client():
    """模块级 fixture：所有测试共享一个 client
    
    scope="module" 表示整个模块只创建一次
    """
    # 用 with 管理 client 生命周期
    with httpx.Client(base_url=BASE_URL, timeout=10) as c:
        yield c

def test_e2e_purchase_flow(client):
    """E2E：完整购买流程
    
    模拟用户：注册 → 登录 → 创建订单 → 查询订单
    验证整个系统从入口到数据库的完整链路
    """
    # 步骤 1：注册新用户
    r = client.post("/register", json={
        "username": "alice_e2e",
        "password": "secret123",
        "email": "alice@e2e.com"
    })
    assert r.status_code == 201

    # 步骤 2：登录拿 token
    r = client.post("/token", params={
        "username": "alice_e2e",
        "password": "secret123"
    })
    assert r.status_code == 200
    token = r.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 步骤 3：创建订单
    r = client.post("/orders", json={"item_id": 1}, headers=headers)
    assert r.status_code == 201
    order_id = r.json()["id"]

    # 步骤 4：查询订单列表
    r = client.get("/orders", headers=headers)
    assert r.status_code == 200
    orders = r.json()
    # 验证刚创建的订单在列表里
    assert len(orders) == 1
    assert orders[0]["id"] == order_id

    # 步骤 5：查询订单详情
    r = client.get(f"/orders/{order_id}", headers=headers)
    assert r.status_code == 200
    assert r.json()["item_id"] == 1

def test_e2e_duplicate_register(client):
    """E2E：重复注册应该失败"""
    # 先注册一个
    client.post("/register", json={
        "username": "dup_user",
        "password": "pw",
        "email": "d@e.com"
    })
    # 再注册同名应该 400
    r = client.post("/register", json={
        "username": "dup_user",
        "password": "pw",
        "email": "d2@e.com"
    })
    assert r.status_code == 400

def test_e2e_unauthorized_access(client):
    """E2E：没登录访问受保护接口应该 401"""
    r = client.get("/orders")
    assert r.status_code == 401
\`\`\`

E2E 测试的 setup：需要先启动真实服务。通常在 conftest.py 里用 subprocess 起 uvicorn：

\`\`\`python
# conftest.py —— E2E 测试启动真实服务
import subprocess
import time
import httpx
import pytest

@pytest.fixture(scope="session", autouse=True)
def start_server():
    """整个测试 session 启动一次服务"""
    # 用 subprocess 启动 uvicorn
    proc = subprocess.Popen(
        ["uvicorn", "app:app", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    # 等待服务就绪（轮询 health 接口）
    for _ in range(30):
        try:
            r = httpx.get("http://localhost:8000/health", timeout=1)
            if r.status_code == 200:
                break
        except:
            time.sleep(0.5)
    else:
        proc.terminate()
        pytest.fail("服务启动失败")

    yield  # 跑所有测试

    # 测试结束杀掉服务
    proc.terminate()
    proc.wait()
\`\`\`

## 四、Demo 2：用 Playwright 测试前端 + API 集成

Playwright 是微软出的现代浏览器自动化工具，支持 Chromium/Firefox/WebKit，API 设计优雅。

\`\`\`bash
# 安装
pip install playwright
# 安装浏览器内核（一次性）
playwright install chromium
\`\`\`

\`\`\`python
# test_e2e_ui.py —— Playwright 端到端测试

import pytest
from playwright.sync_api import sync_playwright, Page, expect

@pytest.fixture(scope="module")
def browser():
    """模块级 fixture：复用浏览器实例"""
    with sync_playwright() as p:
        # 启动 Chromium（headless=False 可以看到浏览器操作）
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()

@pytest.fixture
def page(browser):
    """每个测试一个新页面（隔离状态）"""
    context = browser.new_context()
    page = context.new_page()
    yield page
    context.close()

def test_login_flow(page: Page):
    """E2E：前端登录流程
    
    从浏览器视角：打开页面 → 填表单 → 点按钮 → 验证跳转
    """
    # 打开登录页（前端跑在 3000 端口）
    page.goto("http://localhost:3000/login")

    # 填写用户名（CSS 选择器定位输入框）
    page.fill("#username", "alice")
    # 填写密码
    page.fill("#password", "secret123")

    # 点击登录按钮
    page.click("button[type=submit]")

    # 等待跳转到首页（URL 变化）
    page.wait_for_url("http://localhost:3000/dashboard")

    # 验证页面显示了欢迎信息
    # expect 是 Playwright 的断言，会自动等待元素出现
    welcome = page.locator(".welcome")
    expect(welcome).to_have_text("Welcome alice")

def test_create_item_ui(page: Page):
    """E2E：通过 UI 创建商品"""
    # 先登录（封装成辅助函数更好）
    page.goto("http://localhost:3000/login")
    page.fill("#username", "alice")
    page.fill("#password", "secret123")
    page.click("button[type=submit]")
    page.wait_for_url("**/dashboard")

    # 进入创建商品页
    page.click("text=新建商品")

    # 填写表单
    page.fill("#name", "E2E 测试商品")
    page.fill("#price", "99.9")
    page.click("button:has-text(保存)")

    # 验证列表里出现了新商品
    item_row = page.locator(f"text=E2E 测试商品")
    expect(item_row).to_be_visible()

def test_api_response_in_network(page: Page):
    """E2E：拦截并验证网络请求"""
    # 监听网络请求
    api_calls = []
    page.on("response", lambda r: api_calls.append(r) if "/api/" in r.url else None)

    page.goto("http://localhost:3000/dashboard")

    # 等待 API 请求完成
    page.wait_for_timeout(1000)

    # 验证有调用商品列表 API 且返回 200
    api_responses = [r for r in api_calls if "/api/items" in r.url]
    assert len(api_responses) > 0
    assert all(r.status == 200 for r in api_responses)
\`\`\`

Playwright 的 \`expect\` 会**自动重试**（默认 5 秒），解决 E2E 测试最常见的「时序 flaky」问题——元素还没加载就断言，导致测试随机失败。

## 五、Demo 3：用 Docker Compose 启动完整测试环境

E2E 测试要真实环境，手动起一堆服务太麻烦。Docker Compose 一键拉起完整环境。

\`\`\`yaml
# docker-compose.test.yml —— E2E 测试环境

version: "3.8"

services:
  # 后端 API 服务
  api:
    build: .
    ports:
      - "8000:8000"            # 暴露给测试脚本访问
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/testdb
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy  # 等 DB 健康检查通过再启动
      redis:
        condition: service_started
    # 启动前先跑迁移
    command: >
      sh -c "alembic upgrade head &&
             uvicorn app:app --host 0.0.0.0 --port 8000"

  # PostgreSQL 数据库
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: testdb
    # 健康检查：等数据库准备好接受连接
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7
    ports:
      - "6379:6379"

  # 前端服务（如果有）
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - api
\`\`\`

启动测试环境：

\`\`\`bash
# 用 test 环境配置启动所有服务
docker compose -f docker-compose.test.yml up -d

# 等服务就绪后跑 E2E 测试
pytest test_e2e_api.py -v

# 测试完清理环境
docker compose -f docker-compose.test.yml down -v
\`\`\`

Docker Compose 的价值：**E2E 环境完全可重现**。不管在开发机还是 CI，拉起来的环境一模一样，不会出现「我这能跑你那不能跑」的问题。

## 六、Demo 4：CI 中运行 E2E（GitHub Actions）

E2E 测试放进 CI，每次提交自动跑。GitHub Actions 示例：

\`\`\`yaml
# .github/workflows/e2e.yml —— GitHub Actions E2E 工作流

name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      # 1. 拉代码
      - uses: actions/checkout@v4

      # 2. 装 Python
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"

      # 3. 装依赖
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest httpx playwright
          playwright install chromium

      # 4. 启动 Docker Compose 环境
      - name: Start test environment
        run: |
          docker compose -f docker-compose.test.yml up -d
          # 等服务就绪
          sleep 10

      # 5. 跑 API 级 E2E
      - name: Run API E2E tests
        run: pytest test_e2e_api.py -v

      # 6. 跑 UI 级 E2E（Playwright）
      - name: Run UI E2E tests
        run: pytest test_e2e_ui.py -v

      # 7. 上传测试报告
      - name: Upload test report
        if: always()  # 即使失败也上传
        uses: actions/upload-artifact@v3
        with:
          name: test-report
          path: test-report.html

      # 8. 清理环境
      - name: Cleanup
        if: always()
        run: docker compose -f docker-compose.test.yml down -v
\`\`\`

CI 中的关键点：

- \`if: always()\` 确保清理步骤总是执行，否则会留下容器占资源。
- \`sleep 10\` 等服务启动——更稳妥的做法是轮询 health 接口。
- 测试报告用 artifact 上传，失败时可以下载查看。

## 七、Demo 5：测试数据库快照与恢复

E2E 测试会写脏数据，跑完要恢复到干净状态。几种策略：

\`\`\`python
# test_db_snapshot.py —— 数据库快照恢复策略

import pytest
import subprocess
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# 策略 1：每个测试后 truncate 所有表
@pytest.fixture
def clean_db_truncate():
    """用 TRUNCATE 清空表（保留结构）"""
    engine = create_engine("postgresql://user:pass@localhost/testdb")
    with engine.connect() as conn:
        # 获取所有表名
        tables = conn.execute(
            "SELECT tablename FROM pg_tables WHERE schemaname='public'"
        ).fetchall()
        # 禁用外键检查，truncate 所有表
        conn.execute("SET session_replication_role = replica")
        for (table,) in tables:
            conn.execute(f"TRUNCATE TABLE {table} CASCADE")
        conn.execute("SET session_replication_role = DEFAULT")
        conn.commit()
    yield

# 策略 2：用 pg_dump 快照，测试后恢复
@pytest.fixture(scope="session")
def db_snapshot():
    """session 级：开始时备份，结束恢复"""
    # 备份
    subprocess.run([
        "pg_dump", "-U", "user", "-d", "testdb",
        "-f", "/tmp/snapshot.sql"
    ], check=True)
    yield
    # 恢复
    subprocess.run([
        "psql", "-U", "user", "-d", "testdb",
        "-f", "/tmp/snapshot.sql"
    ], check=True)

# 策略 3：用 Docker 容器快照（最干净）
@pytest.fixture(scope="session")
def db_container():
    """session 级：每个 session 起新容器"""
    # 启动一个全新 PG 容器
    proc = subprocess.run([
        "docker", "run", "-d", "--name", "test-pg",
        "-e", "POSTGRES_PASSWORD=pass",
        "postgres:15"
    ], capture_output=True, text=True)
    container_id = proc.stdout.strip()

    # 等待就绪
    import time
    time.sleep(5)

    yield

    # 销毁容器
    subprocess.run(["docker", "rm", "-f", container_id])

# 策略 4：每个测试用独立 schema（最隔离）
@pytest.fixture
def isolated_schema():
    """每个测试用独立 schema，互不干扰"""
    import uuid
    schema_name = f"test_{uuid.uuid4().hex[:8]}"
    engine = create_engine("postgresql://user:pass@localhost/testdb")
    with engine.connect() as conn:
        conn.execute(f"CREATE SCHEMA {schema_name}")
        conn.commit()
    # 把 schema 名传给应用
    yield schema_name
    # 清理
    with engine.connect() as conn:
        conn.execute(f"DROP SCHEMA {schema_name} CASCADE")
        conn.commit()
\`\`\`

策略选择：

| 策略 | 速度 | 隔离性 | 适合 |
|---|---|---|---|
| TRUNCATE | 快 | 中 | 表少、外键简单 |
| pg_dump 快照 | 中 | 高 | 需要保留初始数据 |
| 新容器 | 慢 | 极高 | CI、要求绝对干净 |
| 独立 schema | 快 | 高 | 并行跑测试 |

## 八、Demo 6：测试并发场景（多用户同时操作）

有些 bug 只在并发下出现：两人同时下单最后一件商品、同时改同一个字段。E2E 要模拟这种。

\`\`\`python
# test_e2e_concurrent.py —— 并发场景 E2E

import pytest
import httpx
import asyncio
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "http://localhost:8000"

def test_concurrent_register():
    """并发注册同名用户，应该只有一个成功"""
    # 用线程池并发发 10 个注册请求
    def register(_):
        with httpx.Client(base_url=BASE_URL) as c:
            return c.post("/register", json={
                "username": "concurrent_user",
                "password": "pw",
                "email": "c@e.com"
            })

    # 10 个线程同时注册
    with ThreadPoolExecutor(max_workers=10) as pool:
        results = list(pool.map(register, range(10)))

    # 应该只有 1 个 201，其余 400
    successes = [r for r in results if r.status_code == 201]
    failures = [r for r in results if r.status_code == 400]
    assert len(successes) == 1, "应该只有一个注册成功"
    assert len(failures) == 9

def test_concurrent_orders_async():
    """异步并发下单，验证库存扣减正确"""
    async def place_order(client, token):
        """单个下单请求"""
        return await client.post("/orders", json={"item_id": 1},
            headers={"Authorization": f"Bearer {token}"})

    async def run_concurrent():
        """跑 100 个并发下单"""
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            # 先登录拿 100 个 token（或复用一个）
            r = await client.post("/token", params={
                "username": "alice", "password": "pw"
            })
            token = r.json()["access_token"]

            # 创建 100 个并发下单任务
            tasks = [place_order(client, token) for _ in range(100)]
            # 并发执行
            responses = await asyncio.gather(*tasks)
            return responses

    # 运行异步测试
    responses = asyncio.run(run_concurrent())

    # 如果库存只有 50，应该 50 个成功 50 个失败
    successes = [r for r in responses if r.status_code == 201]
    failures = [r for r in responses if r.status_code == 409]  # 库存不足
    print(f"成功 {len(successes)}, 失败 {len(failures)}")
    # 验证没有超卖（成功数 <= 库存）
    assert len(successes) <= 50
\`\`\`

并发测试能发现「竞态条件」——单元测试根本测不出来的 bug。比如库存扣减如果没用 \`SELECT ... FOR UPDATE\` 或原子操作，并发下会超卖。

## 九、Demo 7：E2E 测试的反模式

E2E 测试容易写过头。几个常见反模式：

**反模式 1：在 E2E 里测太多细节**

\`\`\`python
# 反模式：E2E 不该测字段级断言
def test_bad_e2e(page):
    page.goto("/dashboard")
    # 错误：E2E 不该断言数据库字段值
    # 这种细节应该放单元测试
    r = httpx.get("http://localhost:8000/api/items/1")
    assert r.json()["created_at"].startswith("2026-01")
    assert r.json()["metadata"]["tags"][0] == "new"
    # E2E 应该测用户能看到什么，不是数据长什么样
\`\`\`

正确做法：E2E 只断言「用户能看到商品名显示对了」，不断言数据库字段。

**反模式 2：E2E 数量太多**

E2E 慢（每个几秒），写 200 个要跑十几分钟。应该只覆盖**核心业务流程**：注册登录、下单支付、关键报表。细节交给单元/集成测试。

**反模式 3：依赖测试执行顺序**

\`\`\`python
# 反模式：测试之间有依赖
def test_step1_create(page):
    # 创建数据
    pass

def test_step2_verify(page):
    # 依赖 step1 创建的数据 —— 错误！
    # 如果 step1 失败或没跑，step2 也失败
    pass

# 正确：每个测试自己 setup 需要的数据
def test_create_and_verify(page):
    # 自己创建自己验证，独立
    pass
\`\`\`

**反模式 4：用 sleep 等待**

\`\`\`python
# 反模式：硬等待
def test_bad_wait(page):
    page.click("button")
    time.sleep(3)  # 错误：硬等 3 秒，慢且不可靠
    assert page.text_content(".result") == "success"

# 正确：用智能等待
def test_good_wait(page):
    page.click("button")
    # 自动等到元素出现，最多等 5 秒
    expect(page.locator(".result")).to_have_text("success")
\`\`\`

**反模式 5：E2E 里 mock 太多**

如果 E2E mock 掉了数据库、mock 掉了外部 API，那它就退化成集成测试了。E2E 的价值在于「真实」，mock 太多就失去意义。

## 十、E2E 测试金字塔位置

测试金字塔从下到上：

| 层级 | 占比 | 速度 | 目的 |
|---|---|---|---|
| 单元测试 | 70% | 极快 | 测逻辑正确性 |
| 集成测试 | 20% | 中 | 测模块协作 |
| E2E 测试 | 10% | 慢 | 测核心业务流程 |
| 手动探索测试 | 少量 | 慢 | 发现意外问题 |

E2E 在金字塔顶端，数量少但价值高——它验证「整个系统能用」。但因为它慢且 flaky，不要用它替代单元/集成测试。

> 生活类比：测试金字塔像建房子。
> - 单元测试是地基（最多最稳）。
> - 集成测试是框架（连接结构）。
> - E2E 测试是封顶（验证整体能住人）。
> - 你不会用封顶来替代地基，但没封顶房子也不算盖完。

## 本章小结

| 知识点 | 要点 |
|---|---|
| E2E 定位 | 从用户视角测全系统，最接近真实体验 |
| 工具选择 | 纯 API 用 httpx、全栈用 Playwright |
| httpx E2E | 打真实服务，模拟客户端调用顺序 |
| Playwright | 浏览器自动化，expect 自动等待解决 flaky |
| Docker Compose | 一键拉起完整测试环境，可重现 |
| CI 集成 | GitHub Actions 里起环境、跑测试、传报告 |
| 数据恢复 | TRUNCATE/快照/新容器/独立 schema 四策略 |
| 并发测试 | 模拟多用户并发，发现竞态 bug |
| 反模式 | 不测细节、数量要少、不依赖顺序、不硬等、少 mock |
| 金字塔位置 | 顶端 10%，少而精，验证核心流程 |
`
  }
];
