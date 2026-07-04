// =============================================================
// Python 工程化教程 - 第 4 批章节(测试)
// -------------------------------------------------------------
// 本批共 6 章,group 均为 "测试":
//   1. pyeng-test-intro          — 为什么要写测试
//   2. pyeng-test-unittest       — unittest 标准库
//   3. pyeng-test-pytest-basics  — pytest 基础
//   4. pyeng-test-pytest-fixture — pytest fixture 与参数化
//   5. pyeng-test-mock           — Mock 与打桩
//   6. pyeng-test-practices      — 测试最佳实践与策略
//
// 教程定位:纯阅读型(代码示例在 content 的 markdown 代码块中展示)
// 重点讲清「为什么」和「怎么用」,工具会变,工程化思维长存。
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  // =========================================================
  // 第一章:为什么要写测试
  // =========================================================
  {
    id: "pyeng-test-intro",
    icon: "🧪",
    title: "为什么要写测试",
    group: "测试",
    content: `## 一、不测试的代价

很多 Python 开发者对测试的态度是:"代码能跑就行,测试是 QA 的事"或者"项目赶进度,没时间写测试"。这种想法在短期看似乎合理,但只要项目活过三个月,不测试的代价就会像复利一样累积,最终压垮整个团队的开发效率。

### 不测试的真实日常

来看看一个没有测试的项目,日常开发是什么样的:

\`\`\`text
场景1:上线前夜
  你: "这个改动应该没问题吧?我本地跑了一下。"
  同事: "你改了 utils.py,会不会影响其他模块?"
  你: "应该不会……吧。"
  → 上线后,果然某个不相关的功能挂了。

场景2:修一个 bug
  你: "这个 bug 我修好了。"
  测试同学: "你修了这个,但好像引入了另外两个 bug。"
  你: "???"
  → 这就是"打地鼠"模式:按下葫芦浮起瓢。

场景3:重构
  你: "这段代码太乱了,我想重构一下。"
  同事: "别动!上次老王动了之后线上挂了三天。"
  你: "……那算了,继续堆 if-else 吧。"
  → 代码越来越烂,因为没人敢动。

场景4:新人接手
  新人: "这个函数我改了一下,不知道对不对。"
  你: "我也忘了它到底该干啥,你跑一下整个系统看看。"
  → 新人花一周才知道自己改对了没。
\`\`\`

### 代价量化

把不测试的代价量化一下,你会发现"省下写测试的时间"其实是借高利贷:

| 维度 | 不写测试 | 写测试 |
|------|----------|--------|
| **上线信心** | 提心吊胆,靠"祈祷式部署" | 跑一遍测试,绿灯就上 |
| **改 bug 速度** | 改一个引入三个,回归反复 | 改完跑测试,立刻知道有没有改坏 |
| **重构勇气** | 不敢动,代码越堆越烂 | 有测试兜底,放心重构 |
| **新人上手** | 靠口口相传,半月才敢改代码 | 看测试就知道每个函数的预期行为 |
| **交付速度(短期)** | 快(0 测试成本) | 慢(要写测试) |
| **交付速度(长期)** | 越来越慢(回归成本指数上升) | 稳定(测试成本线性) |

**关键洞察**:写测试的"成本"是前置的、显性的;不写测试的"成本"是后置的、隐性的,而且会**指数增长**。一个跑了三年的无测试项目,加一个简单功能可能要花三天"确认没改坏",而这三天的痛苦本来可以用最初写测试的两小时避免。

## 二、测试的五大价值

测试不只是"找 bug",它至少提供五重价值。理解这五重价值,你才会真正愿意写测试。

### 价值1:验证正确性

最直接的价值——确认代码做了它该做的事。

\`\`\`python
def add(a, b):
    return a + b

def test_add():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0
\`\`\`

虽然 \`add\` 简单到不用测,但当逻辑复杂时(比如一个折扣计算器),测试能把"我以为它对"变成"我证明它对"。

### 价值2:防止回归

**回归(Regression)** = 之前好的功能,改完之后坏了。

回归是软件工程最痛的 bug 类型——你明明没动那个功能,它怎么就坏了?测试最大的长期价值就是**自动捕获回归**:

\`\`\`text
开发流程:
  写功能 A → 写测试 A
  写功能 B → 写测试 B
  改功能 A → 跑所有测试
    ├─ 测试 A 通过:没改坏 A
    ├─ 测试 B 通过:没改坏 B(虽然你只动了 A)
    └─ 测试 B 失败:发现 A 和 B 有隐藏依赖!立刻修复

没有测试:
  写功能 A → 写功能 B → 改功能 A
    → B 可能悄悄坏了,直到用户投诉你才知道
\`\`\`

每次改代码后跑全量测试,等于给系统做了一次"全身扫描",任何回归都会立刻暴露。

### 价值3:重构的勇气

这是被低估的价值。**没有测试的代码是"遗产代码"(Legacy Code)**——Michael Feathers 在《修改代码的艺术》中给的定义就是"没有测试的代码"。遗产代码的特征是:没人敢动。

\`\`\`text
有测试:
  看到一段烂代码 → 写测试覆盖它(先固化行为)→ 放心重构 → 测试一直绿 → 重构完成

无测试:
  看到一段烂代码 → 想重构 → 怕改坏 → 继续堆屎山 → 代码越来越烂
\`\`\`

测试是重构的"安全网"。没有安全网,走钢丝就是玩命;有安全网,你可以放手表演。

### 价值4:文档作用(测试即示例)

测试是最好的"活文档"。文档会过期,但测试不会——因为测试一旦过期,CI 就会红。

\`\`\`python
# 这个测试比任何文档都清楚地说明了 discount 函数的用法
def test_discount():
    # 正常打折
    assert discount(price=100, rate=0.2) == 80
    # 打折后不能为负
    assert discount(price=50, rate=1.5) == 0
    # 不打折
    assert discount(price=100, rate=0) == 100
\`\`\`

新人接手代码,看测试比看文档靠谱得多——测试展示了**函数的真实调用方式和边界行为**。

### 价值5:设计反馈(难测 = 设计有问题)

这是最"玄"但最重要的价值。**如果一个函数很难写测试,通常说明它的设计有问题**。

\`\`\`python
# ❌ 难测:函数内部直接读文件、连数据库
def get_user_score(user_id):
    with open("config.json") as f:    # 依赖文件
        config = json.load(f)
    conn = sqlite3.connect(config["db"])  # 依赖数据库
    cursor = conn.cursor()
    cursor.execute("SELECT score FROM users WHERE id=?", (user_id,))
    return cursor.fetchone()[0]

# 想测试?必须准备真实文件 + 真实数据库,测试又慢又脆。

# ✅ 好测:依赖通过参数注入
def get_user_score(user_id, db_connection, config):
    cursor = db_connection.cursor()
    cursor.execute("SELECT score FROM users WHERE id=?", (user_id,))
    return cursor.fetchone()[0]

# 测试时传入 mock 的 db_connection,瞬间完成
\`\`\`

"难测"的设计信号:
- 函数内部 \`new\` 了依赖(而不是接收参数)
- 函数依赖全局状态(模块级变量、单例)
- 函数有副作用(写文件、发请求、改全局)
- 函数返回值依赖当前时间(直接 \`datetime.now()\`)

这些信号都指向同一个问题:**耦合过紧**。测试的压力会"逼迫"你写出低耦合的代码。这就是为什么 TDD(测试驱动开发)被称作"设计活动"而不仅仅是"验证活动"。

## 三、测试的种类:测试金字塔

不是所有测试都一样。Mike Cohn 在《Succeeding with Agile》中提出了**测试金字塔(Test Pyramid)**,把测试按粒度分层:

\`\`\`text
                  ▲
                 /  \\
                / E2E\\          少(5%):慢、贵、脆
               /______\\
              /        \\
             / 集成测试  \\      中(20%):中速、组合验证
            /____________\\
           /              \\
          /   单元测试      \\   多(75%):快、隔离、廉价
         /__________________\\

         速度: 快 ──────────────► 慢
         数量: 多 ──────────────► 少
         成本: 低 ──────────────► 高
         信心: 低 ──────────────► 高
\`\`\`

### 三层详解

**1. 单元测试(Unit Test)**

- **测什么**:单个函数 / 类,在隔离环境下验证行为
- **速度**:极快(毫秒级),几千个测试几秒跑完
- **隔离**:依赖被 mock 掉,不碰数据库 / 网络 / 文件
- **数量**:最多,应占 70-80%
- **例子**:测 \`add(1, 2) == 3\`、测 \`UserValidator.validate(invalid_email)\` 抛错

\`\`\`python
def test_validate_email():
    validator = EmailValidator()
    assert validator.validate("a@b.com") is True
    assert validator.validate("invalid") is False
\`\`\`

**2. 集成测试(Integration Test)**

- **测什么**:多个模块组合后的行为,允许接触真实依赖(测试数据库、临时文件)
- **速度**:中(秒级),比单元测试慢
- **隔离**:部分隔离,可能用测试数据库而非生产数据库
- **数量**:中等,占 15-20%
- **例子**:测"用户注册 → 写数据库 → 发邮件"整个链路

\`\`\`python
def test_user_registration_writes_db_and_sends_email(db, mailer):
    service = UserService(db, mailer)
    service.register("alice", "alice@example.com", "pass123")
    assert db.find_user("alice") is not None
    assert mailer.sent_emails == ["alice@example.com"]
\`\`\`

**3. 端到端测试(End-to-End, E2E)**

- **测什么**:从用户视角走完整个系统(包括 UI、API、数据库、第三方)
- **速度**:慢(分钟级),一个 E2E 测试可能要 10 秒
- **隔离**:几乎不隔离,跑在接近生产的环境
- **数量**:少,占 5-10%
- **例子**:用 Selenium/Playwright 模拟用户打开浏览器、注册、下单、支付

\`\`\`python
def test_user_can_register_and_buy(browser):
    browser.goto("https://app.example.com/register")
    browser.fill("username", "alice")
    browser.fill("password", "pass123")
    browser.click("submit")
    browser.goto("/products/1")
    browser.click("buy")
    assert browser.text("#order-status") == "订单成功"
\`\`\`

### 测试金字塔对比表

| 维度 | 单元测试 | 集成测试 | 端到端测试 |
|------|----------|----------|------------|
| **粒度** | 单函数 / 单类 | 多模块组合 | 整个系统 |
| **速度** | 毫秒级 | 秒级 | 分钟级 |
| **数量** | 多(70-80%) | 中(15-20%) | 少(5-10%) |
| **成本** | 低 | 中 | 高 |
| **隔离** | 完全隔离(mock 依赖) | 部分隔离(测试库) | 不隔离(接近生产) |
| **稳定性** | 高(环境稳定) | 中 | 低(易脆,UI 一变就挂) |
| **信心** | 低(单元对不算整体对) | 中 | 高(用户视角) |
| **维护** | 容易 | 中等 | 困难(易脆) |
| **发现 bug 类型** | 逻辑错误 | 模块间契约错误 | 用户场景错误 |
| **失败定位** | 容易(就在这个函数) | 中等(查组合) | 困难(可能在任何层) |

### 为什么是金字塔而不是倒三角

\`\`\`text
倒金字塔(错误的测试结构):
  E2E E2E E2E E2E E2E E2E
     集成 集成 集成
        单元

问题:
  - 跑一遍测试要 30 分钟 → 没人愿意跑
  - E2E 一改 UI 就挂 → 测试天天红
  - 一个测试失败 → 整片红,定位困难
  - 维护成本爆炸

正金字塔(健康的测试结构):
        E2E
      集成 集成
    单元 单元 单元 单元 单元

优势:
  - 单元测试秒级跑完 → 提交前必跑
  - 失败定位精确 → 就在那个函数
  - 重构时单元测试稳 → 不会因 UI 改动挂
\`\`\`

**核心原则**:**底层多,顶层少**。单元测试是地基,地基扎实了上层才稳。

## 四、其他测试种类

金字塔的三层是按"粒度"分的,还有一些按"目的"分的测试种类:

### 1. 冒烟测试(Smoke Test)

**定义**:最基础的"系统能不能启动"测试。来源于硬件测试——通电后不冒烟就算通过。

\`\`\`python
def test_app_can_start(app):
    response = app.get("/health")
    assert response.status_code == 200
\`\`\`

**用途**:每次部署后先跑冒烟测试,确认系统没"挂",再跑详细测试。如果冒烟都不过,后面测试都不用跑了。

### 2. 回归测试(Regression Test)

**定义**:专门针对"曾经出现过的 bug"写的测试,确保这个 bug 不会再次出现。

\`\`\`python
# 这是修 bug #1234 后写的回归测试
def test_discount_not_negative_after_fix_bug_1234():
    # bug: 折扣率超过 1 时,价格变成负数
    assert discount(price=100, rate=1.5) == 0   # 修复后应为 0
\`\`\`

**原则**:**每修一个 bug,必须写一个回归测试**。否则同样的 bug 半年后会回来。

### 3. 性能测试(Performance Test)

**定义**:验证系统在特定负载下的响应时间、吞吐量。

\`\`\`python
import time

def test_api_response_time():
    start = time.time()
    response = client.get("/api/users")
    elapsed = time.time() - start
    assert response.status_code == 200
    assert elapsed < 0.5   # 必须在 500ms 内响应
\`\`\`

**工具**:\`locust\`、\`pytest-benchmark\`、\`timeit\`。

### 4. 压力测试(Stress Test)

**定义**:把系统推到极限(高并发、大数据量),看它在什么压力下崩溃,以及崩溃后能否恢复。

\`\`\`text
正常负载: 100 QPS  → 性能测试范围
峰值负载: 1000 QPS → 压力测试范围
极限负载: 10000 QPS → 看系统何时崩溃、崩溃后能否自愈
\`\`\`

### 5. 其他

| 种类 | 说明 |
|------|------|
| **验收测试(Acceptance)** | 用户/产品确认"这是我要的功能" |
| **突变测试(Mutation)** | 故意改坏代码,看测试能不能抓到(检验测试质量) |
| **属性测试(Property)** | 用随机数据验证"性质"(如 \`reverse(reverse(x)) == x\`) |
| **模糊测试(Fuzzing)** | 喂随机/畸形输入,看程序是否崩溃 |

## 五、TDD 简介:测试驱动开发

**TDD(Test-Driven Development)** 是 Kent Beck 提出的开发方法,核心是**先写测试,再写实现**。

### 红-绿-重构循环

TDD 的节奏叫"红-绿-重构",每次只加一小步:

\`\`\`text
┌─────────────────────────────────────────────┐
│  红(Red):写一个失败的测试                  │
│    ↓ 你明确"我要实现什么"                   │
│  绿(Green):写最简单的代码让测试通过        │
│    ↓ 你"做对了一件事"                       │
│  重构(Refactor):优化代码,测试保持绿色    │
│    ↓ 你"做漂亮了"                           │
└─────────────────────────────────────────────┘
          循环,每次只前进一小步
\`\`\`

### 一个 TDD 实例:实现 FizzBuzz

**第 1 轮:最简单的 case**

\`\`\`python
# 红:写测试(此时 fizzbuzz 还不存在)
def test_fizzbuzz_1():
    assert fizzbuzz(1) == "1"

# 绿:写最简实现
def fizzbuzz(n):
    return "1"

# 测试通过 ✅
\`\`\`

**第 2 轮:加第二个 case,发现重复**

\`\`\`python
# 红:加测试
def test_fizzbuzz_2():
    assert fizzbuzz(2) == "2"

# 绿:把硬编码改成真逻辑
def fizzbuzz(n):
    return str(n)

# 测试通过 ✅
\`\`\`

**第 3 轮:加 Fizz case**

\`\`\`python
# 红
def test_fizzbuzz_3():
    assert fizzbuzz(3) == "Fizz"

# 绿
def fizzbuzz(n):
    if n % 3 == 0:
        return "Fizz"
    return str(n)

# 测试通过 ✅
\`\`\`

**第 4 轮:加 Buzz、FizzBuzz case**

\`\`\`python
# 红
def test_fizzbuzz_5():
    assert fizzbuzz(5) == "Buzz"

def test_fizzbuzz_15():
    assert fizzbuzz(15) == "FizzBuzz"

# 绿
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

# 测试通过 ✅,重构(本例已经足够清晰,无需重构)
\`\`\`

### TDD 的价值

| 价值 | 说明 |
|------|------|
| **明确需求** | 写测试前必须想清楚"这个函数该返回什么" |
| **小步前进** | 每次只加一个测试,降低出错概率 |
| **即时反馈** | 几分钟一次绿光,心理满足感强 |
| **100% 覆盖** | 每行代码都是"为了让某个测试通过"而写的 |
| **设计驱动** | 先写测试会"逼迫"你写出可测的设计 |

### TDD 的争议

TDD 不是银弹,也有争议:

- **不适合探索性开发**:研究新库时,你不知道怎么调用,先写测试不现实
- **不适合 UI/算法密集**:UI 变化快,算法实现复杂时先写测试很别扭
- **节奏可能拖慢**:对简单功能,TDD 的"红绿"循环比直接写慢

**实用建议**:**不必教条 TDD,但可以"测试先行"**——先想好测试用例(在脑子里或注释里),再写实现,最后补全测试代码。这种"想清楚再动手"的精神,比死板的"红绿循环"更重要。

## 六、测试覆盖率:工具与误区

**测试覆盖率(Test Coverage)** = 测试执行时,跑过了多少行 / 多少分支的代码。

### coverage.py 工具

\`\`\`bash
# 安装
pip install coverage

# 用 coverage 跑测试
coverage run -m pytest

# 看报告
coverage report
# 输出:
# Name              Stmts   Miss  Cover
# -------------------------------------
# myapp/calc.py        10      1    90%
# myapp/utils.py       20      5    75%
# -------------------------------------
# TOTAL                30      6    80%

# 生成 HTML 报告(可视化,看哪行没覆盖)
coverage html
# 打开 htmlcov/index.html
\`\`\`

### pytest-cov 插件

\`\`\`bash
pip install pytest-cov

# 直接在 pytest 里用
pytest --cov=myapp --cov-report=html

# --cov=myapp:只统计 myapp 包
# --cov-report=html:生成 HTML 报告
\`\`\`

### 行覆盖 vs 分支覆盖

\`\`\`python
def classify(n):
    if n > 0:          # 行 1
        return "pos"   # 行 2
    return "non-pos"   # 行 3
\`\`\`

- **行覆盖**:测试调用了 \`classify(1)\`,跑过行 1、2。覆盖率 2/3 = 67%
- **分支覆盖**:必须同时测 \`n > 0\` 和 \`n <= 0\` 两条分支,才算 100%

\`\`\`bash
# 启用分支覆盖
pytest --cov=myapp --cov-branch
\`\`\`

### 覆盖率的三大误区

**误区1:覆盖率 = 质量**

\`\`\`python
def add(a, b):
    return a + b

# 这个测试 100% 覆盖,但完全没验证"加法对不对"
def test_add():
    add(1, 2)   # 没有 assert!
\`\`\`

100% 覆盖只代表"每行都被跑过",不代表"每行都被正确验证"。**覆盖率是必要条件,不是充分条件**。

**误区2:追求 100% 覆盖**

\`\`\`python
# 这种代码没必要 100% 覆盖
def load_config():
    try:
        with open("config.json") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}   # 默认配置
\`\`\`

为了覆盖 \`except FileNotFoundError\`,你得造一个不存在的文件——为了 1% 的覆盖率付出不成比例的成本。**70-80% 覆盖率通常是性价比最高的区间**。

**误区3:覆盖率低的代码一定有问题**

有些代码天生难覆盖(异常处理、防御性代码、平台分支)。覆盖率低先看是哪部分低,而不是盲目补测试。

### 覆盖率的正确用法

| 用法 | 说明 |
|------|------|
| **趋势监控** | 覆盖率从 80% 掉到 60% → 有大量没测的代码混入,警告 |
| **找未测区域** | 看覆盖率报告,优先补"核心业务逻辑"的低覆盖区 |
| **CI 门槛** | \`--cov-fail-under=80\` 覆盖率低于 80% 则 CI 失败 |
| **不能唯一指标** | 覆盖率 + 测试质量 + bug 率,综合评估 |

## 七、案例:没有测试的项目改一个 bug 引入三个 bug

来看一个真实场景,体感"不测试的痛"。

### 背景

某创业公司的订单系统,核心函数 \`calculate_order\`:

\`\`\`python
def calculate_order(items, coupon=None, vip_level=0):
    """计算订单总价。
    items: [{price, quantity}, ...]
    coupon: {type, value} 或 None
    vip_level: 0-5,VIP 等级
    """
    subtotal = sum(item["price"] * item["quantity"] for item in items)

    # VIP 折扣
    if vip_level >= 3:
        subtotal *= 0.9

    # 优惠券
    if coupon:
        if coupon["type"] == "fixed":
            subtotal -= coupon["value"]
        elif coupon["type"] == "percentage":
            subtotal *= (1 - coupon["value"])

    return max(0, subtotal)
\`\`\`

没有测试。某天用户反馈:"用优惠券后价格变成负数了"(因为 \`subtotal -= coupon["value"]\` 没限制)。

### 修 bug

开发者 A 修复:

\`\`\`python
if coupon and coupon["type"] == "fixed":
    subtotal -= coupon["value"]
    subtotal = max(0, subtotal)   # 修复:不为负
\`\`\`

注意:他**顺手**把 \`if coupon\` 改成了 \`if coupon and coupon["type"] == "fixed"\`,以为 percentage 不需要保护(他忘了 percentage 也可能让价格异常低)。

### 引入的新 bug

1. **bug A**:percentage 优惠券现在完全不生效了——因为外层 \`if\` 加了 \`type == "fixed"\` 条件,percentage 分支永远进不去。
2. **bug B**:VIP 折扣 + 固定优惠券叠加时,VIP 折扣被算了两遍(开发者 A 改的时候不小心复制了一行)。
3. **bug C**:\`max(0, subtotal)\` 只在 fixed 分支里,percentage 分支算完没保护,极端情况还是会负。

### 结果

用户原本报 1 个 bug,修完变成 3 个 bug,而且这 3 个 bug 在不同场景才触发,QA 没全测到,线上又炸了。

### 如果有测试

\`\`\`python
def test_calculate_order():
    items = [{"price": 100, "quantity": 2}]

    # 无优惠
    assert calculate_order(items) == 200

    # VIP 折扣
    assert calculate_order(items, vip_level=3) == 180

    # 固定优惠券
    assert calculate_order(items, coupon={"type": "fixed", "value": 50}) == 150

    # 固定优惠券不超支
    assert calculate_order(items, coupon={"type": "fixed", "value": 999}) == 0

    # 百分比优惠券
    assert calculate_order(items, coupon={"type": "percentage", "value": 0.2}) == 160

    # VIP + 固定券叠加
    assert calculate_order(items, vip_level=3, coupon={"type": "fixed", "value": 50}) == 130
\`\`\`

开发者 A 改完代码,跑这个测试:
- 百分比优惠券测试 → ❌ 红(发现 bug A)
- VIP + 固定券叠加 → ❌ 红(发现 bug B)
- 极端 percentage → ❌ 红(发现 bug C)

**三个新 bug 在开发本机就暴露了,根本不会上线**。这就是测试的价值——把"上线后用户发现 bug"前移到"开发时自己发现 bug"。bug 发现得越早,修复成本越低。

## 八、本章小结

| 要点 | 内容 |
|------|------|
| **不测试的代价** | 上线心慌、回归反复、不敢重构、新人难上手 |
| **测试五大价值** | 验证正确性、防回归、重构勇气、文档作用、设计反馈 |
| **测试金字塔** | 单元多(快)、集成中、E2E 少(慢) |
| **其他测试种类** | 冒烟、回归、性能、压力、验收、突变 |
| **TDD** | 红-绿-重构,先写测试再写实现 |
| **覆盖率** | 工具 coverage.py / pytest-cov,是必要非充分指标 |

## 九、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ 测试是 QA 的事 | 开发只管写代码 | 开发必须为自己的代码写单元测试,QA 负责集成/E2E |
| ❌ 项目赶进度没时间写测试 | 测试是额外负担 | 测试是"投资",前期省时间后期还债加倍 |
| ❌ 100% 覆盖率才是好项目 | 追求满分 | 70-80% 性价比最高,核心逻辑 90%+,边缘代码可低 |
| ❌ 覆盖率高 = 测试质量高 | 行覆盖就行 | 还要看断言是否充分,无 assert 的测试 100% 覆盖也白搭 |
| ❌ TDD 必须严格红绿重构 | 一行代码一个测试 | 精神是"测试先行",节奏可灵活 |
| ❌ 只写 E2E 就够了 | 端到端覆盖全 | E2E 慢且脆,应该金字塔结构,单元为主 |
| ❌ 测试写完就不动了 | 一次写完终身受用 | 代码变了测试要跟着变,测试要维护 |
| ❌ 难测的代码用更厉害的测试工具 | 工具不够强 | 难测通常说明设计耦合,先重构再测 |
| ❌ 改 bug 不用写测试 | 修完跑一遍手测就行 | 每个 bug 都该有回归测试,防止复活 |
| ❌ 测试越多越好 | 数量是指标 | 测试质量比数量重要,冗余测试反而增加维护成本 |

> **一句话总结**:测试不是"额外工作",而是"开发的保险"。它的价值不在"找 bug",而在"给你改代码的勇气"。没有测试的代码是遗产代码,有测试的代码才是活代码。`,
  },

  // =========================================================
  // 第二章:unittest 标准库
  // =========================================================
  {
    id: "pyeng-test-unittest",
    icon: "🏛️",
    title: "unittest 标准库",
    group: "测试",
    content: `## 一、unittest 简介

\`unittest\` 是 Python 标准库自带的测试框架,**无需安装,开箱即用**。它的设计灵感来自 Java 的 JUnit,属于 xUnit 家族的一员。

### 为什么先学 unittest

虽然实际项目里 \`pytest\` 更流行,但 \`unittest\` 仍然值得先学,原因有三:

1. **标准库**:不用 \`pip install\`,任何 Python 环境都有
2. **基础概念**:\`unittest\` 的 TestCase / fixture / assertion 概念是所有测试框架的"通用语言",学会它再学 \`pytest\` 会非常自然
3. **遗留项目**:很多老项目、标准库自身、第三方库的测试都用 \`unittest\`,你必须看得懂

### unittest 的核心概念

\`\`\`text
┌─────────────────────────────────────────────┐
│  TestCase(测试用例)                        │
│    一个测试类,继承 unittest.TestCase       │
│    里面包含多个 test_ 开头的方法            │
├─────────────────────────────────────────────┤
│  Fixture(测试夹具)                         │
│    setUp / tearDown:每个测试方法前后        │
│    setUpClass / tearDownClass:类级前后      │
├─────────────────────────────────────────────┤
│  Assertion(断言)                           │
│    self.assertEqual / assertTrue / ...      │
│    断言失败 → 测试失败                      │
├─────────────────────────────────────────────┤
│  TestSuite(测试套件)                       │
│    把多个 TestCase 组织起来一起跑           │
├─────────────────────────────────────────────┤
│  TestRunner(测试运行器)                    │
│    unittest.TextTestRunner 等,执行并报告   │
└─────────────────────────────────────────────┘
\`\`\`

## 二、第一个 unittest 测试

### 被测代码:一个计算器类

\`\`\`python
# calc.py
class Calculator:
    def add(self, a, b):
        return a + b

    def subtract(self, a, b):
        return a - b

    def multiply(self, a, b):
        return a * b

    def divide(self, a, b):
        if b == 0:
            raise ValueError("除数不能为零")
        return a / b
\`\`\`

### 编写测试

\`\`\`python
# test_calc.py
import unittest
from calc import Calculator


class TestCalculator(unittest.TestCase):
    """Calculator 的测试用例。"""

    def setUp(self):
        """每个测试方法前都会跑一次。"""
        self.calc = Calculator()

    def tearDown(self):
        """每个测试方法后都会跑一次。"""
        # 这里可以清理资源(本例无需清理)
        pass

    def test_add(self):
        self.assertEqual(self.calc.add(1, 2), 3)
        self.assertEqual(self.calc.add(-1, 1), 0)
        self.assertEqual(self.calc.add(0, 0), 0)

    def test_subtract(self):
        self.assertEqual(self.calc.subtract(5, 3), 2)
        self.assertEqual(self.calc.subtract(0, 0), 0)

    def test_multiply(self):
        self.assertEqual(self.calc.multiply(3, 4), 12)
        self.assertEqual(self.calc.multiply(0, 100), 0)

    def test_divide(self):
        self.assertEqual(self.calc.divide(10, 2), 5)

    def test_divide_by_zero_raises(self):
        with self.assertRaises(ValueError) as ctx:
            self.calc.divide(1, 0)
        self.assertEqual(str(ctx.exception), "除数不能为零")


if __name__ == "__main__":
    unittest.main()
\`\`\`

### 运行测试

\`\`\`bash
# 方式1:直接运行测试文件
python test_calc.py

# 方式2:用 unittest 模块运行
python -m unittest test_calc

# 方式3:运行特定类的特定方法
python -m unittest test_calc.TestCalculator.test_add

# 方式4:详细输出
python -m unittest test_calc -v
\`\`\`

输出:

\`\`\`text
test_add (__main__.TestCalculator) ... ok
test_divide (__main__.TestCalculator) ... ok
test_divide_by_zero_raises (__main__.TestCalculator) ... ok
test_multiply (__main__.TestCalculator) ... ok
test_subtract (__main__.TestCalculator) ... ok

----------------------------------------------------------------------
Ran 5 tests in 0.001s

OK
\`\`\`

### 测试失败的样子

故意把 \`test_add\` 改错:

\`\`\`python
def test_add(self):
    self.assertEqual(self.calc.add(1, 2), 4)   # 故意写错
\`\`\`

再跑:

\`\`\`text
test_add (__main__.TestCalculator) ... FAIL
test_divide (__main__.TestCalculator) ... ok
...

======================================================================
FAIL: test_add (__main__.TestCalculator)
----------------------------------------------------------------------
Traceback (most recent call last):
  File "test_calc.py", line 14, in test_add
    self.assertEqual(self.calc.add(1, 2), 4)
AssertionError: 3 != 4

----------------------------------------------------------------------
Ran 5 tests in 0.001s

FAILED (failures=1)
\`\`\`

\`unittest\` 会告诉你:哪个测试失败、失败在哪一行、实际值 vs 期望值。

## 三、setUp / tearDown:方法级夹具

\`setUp\` 和 \`tearDown\` 在**每个 test_ 方法前后**都会执行一次。

\`\`\`python
class TestExample(unittest.TestCase):
    def setUp(self):
        print("  [setUp] 准备测试环境")
        self.data = [1, 2, 3]

    def tearDown(self):
        print("  [tearDown] 清理测试环境")
        self.data = None

    def test_a(self):
        print("  [test_a] 跑测试 A")
        self.assertEqual(len(self.data), 3)

    def test_b(self):
        print("  [test_b] 跑测试 B")
        self.data.append(4)
        self.assertEqual(len(self.data), 4)
\`\`\`

运行:

\`\`\`text
  [setUp] 准备测试环境
  [test_a] 跑测试 A
  [tearDown] 清理测试环境
  [setUp] 准备测试环境
  [test_b] 跑测试 B
  [tearDown] 清理测试环境
\`\`\`

注意:\`test_a\` 往 \`self.data\` 加东西,**不会影响** \`test_b\`——因为每个测试方法前都会重新 \`setUp\`。这保证了**测试之间相互独立**。

### setUp 的典型用途

\`\`\`python
class TestUserRepository(unittest.TestCase):
    def setUp(self):
        # 每个测试前:连接测试数据库,清空表
        self.conn = sqlite3.connect(":memory:")
        self.conn.execute("CREATE TABLE users (id INTEGER, name TEXT)")
        self.repo = UserRepository(self.conn)

    def tearDown(self):
        # 每个测试后:关闭连接
        self.conn.close()

    def test_save_user(self):
        self.repo.save(User(1, "Alice"))
        # 断言...

    def test_find_user(self):
        self.repo.save(User(1, "Bob"))
        found = self.repo.find(1)
        self.assertEqual(found.name, "Bob")
\`\`\`

每个测试都拿到一个**全新的内存数据库**,互不干扰。

## 四、setUpClass / tearDownClass:类级夹具

\`setUpClass\` / \`tearDownClass\` 在**整个测试类前后**只执行一次(注意是类方法,要 \`@classmethod\`)。

\`\`\`python
class TestExpensiveSetup(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """整个类只跑一次。适合昂贵的初始化(连数据库、起服务)。"""
        print(">>> 启动测试数据库(耗时操作)")
        cls.db_server = start_test_db()   # 假设启动要 5 秒

    @classmethod
    def tearDownClass(cls):
        print(">>> 关闭测试数据库")
        cls.db_server.stop()

    def setUp(self):
        """每个测试前跑:只是清表,不重启数据库。"""
        self.db_server.clear()

    def test_query_1(self):
        ...

    def test_query_2(self):
        ...

    def test_query_3(self):
        ...
\`\`\`

输出:

\`\`\`text
>>> 启动测试数据库(耗时操作)
  [setUp] 清表
  [test_query_1]
  [setUp] 清表
  [test_query_2]
  [setUp] 清表
  [test_query_3]
>>> 关闭测试数据库
\`\`\`

**何时用 setUp vs setUpClass**:

| 场景 | 用 setUp | 用 setUpClass |
|------|----------|---------------|
| 创建测试对象 | ✅ |  |
| 清空数据表 | ✅ |  |
| 启动数据库服务 |  | ✅(耗时,整个类共用) |
| 加载大型配置文件 |  | ✅(只读,整个类共用) |
| 创建临时目录 | 看是否独立 | 看是否共享 |

## 五、unittest 常用断言方法

\`unittest\` 提供了丰富的断言方法,比裸 \`assert\` 提供更好的错误信息。

### 基础断言

\`\`\`python
class TestAssertions(unittest.TestCase):
    def test_equality(self):
        self.assertEqual(1 + 1, 2)              # == 
        self.assertNotEqual(1, 2)               # !=

    def test_truthiness(self):
        self.assertTrue([1, 2])                 # bool(x) is True
        self.assertFalse([])                    # bool(x) is False

    def test_identity(self):
        a = []
        b = a
        self.assertIs(a, b)                     # is
        self.assertIsNot(a, [])

    def test_none(self):
        self.assertIsNone(None)                 # is None
        self.assertIsNotNone(0)                 # is not None(注意 0 不是 None)

    def test_membership(self):
        self.assertIn(2, [1, 2, 3])             # in
        self.assertNotIn(4, [1, 2, 3])          # not in
\`\`\`

### 异常断言

\`\`\`python
class TestExceptions(unittest.TestCase):
    def test_raises_value_error(self):
        with self.assertRaises(ValueError):
            int("not a number")

    def test_raises_with_message(self):
        with self.assertRaises(ValueError) as ctx:
            raise ValueError("具体的错误信息")
        self.assertEqual(str(ctx.exception), "具体的错误信息")

    def test_raises_specific_subclass(self):
        # ValueError 是 Exception 的子类
        # assertRaises 默认接受子类;如果只要精确类型用 assertRaisesRegex
        with self.assertRaises(ValueError):
            raise ValueError()
\`\`\`

### 类型断言

\`\`\`python
class TestTypes(unittest.TestCase):
    def test_isinstance(self):
        self.assertIsInstance(42, int)
        self.assertIsInstance("hello", str)
        self.assertIsInstance([], list)

    def test_not_isinstance(self):
        self.assertNotIsInstance(42, str)
\`\`\`

### 近似断言(浮点数)

浮点数有精度问题,直接 \`assertEqual(0.1 + 0.2, 0.3)\` 会失败!

\`\`\`python
class TestFloats(unittest.TestCase):
    def test_bad(self):
        # ❌ 失败:0.1 + 0.2 = 0.30000000000000004
        self.assertEqual(0.1 + 0.2, 0.3)

    def test_good(self):
        # ✅ 用 assertAlmostEqual,默认比较到小数点后 7 位
        self.assertAlmostEqual(0.1 + 0.2, 0.3)
        # 自定义精度:places=2 比较到小数点后 2 位
        self.assertAlmostEqual(0.1 + 0.2, 0.3, places=2)
        # 或者用 delta:差异不超过 0.0001
        self.assertAlmostEqual(0.1 + 0.2, 0.3, delta=0.0001)
\`\`\`

### 常用断言方法表

| 方法 | 等价于 | 说明 |
|------|--------|------|
| \`assertEqual(a, b)\` | \`a == b\` | 相等 |
| \`assertNotEqual(a, b)\` | \`a != b\` | 不等 |
| \`assertTrue(x)\` | \`bool(x) is True\` | 真 |
| \`assertFalse(x)\` | \`bool(x) is False\` | 假 |
| \`assertIs(a, b)\` | \`a is b\` | 同一对象 |
| \`assertIsNot(a, b)\` | \`a is not b\` | 不同对象 |
| \`assertIsNone(x)\` | \`x is None\` | 是 None |
| \`assertIsNotNone(x)\` | \`x is not None\` | 不是 None |
| \`assertIn(a, b)\` | \`a in b\` | 包含 |
| \`assertNotIn(a, b)\` | \`a not in b\` | 不包含 |
| \`assertIsInstance(a, b)\` | \`isinstance(a, b)\` | 是实例 |
| \`assertNotIsInstance(a, b)\` | \`not isinstance(a, b)\` | 不是实例 |
| \`assertAlmostEqual(a, b)\` | \`round(a-b, 7) == 0\` | 近似相等(浮点) |
| \`assertNotAlmostEqual(a, b)\` | \`round(a-b, 7) != 0\` | 不近似相等 |
| \`assertRaises(Exc, fn, *args)\` | 调用必抛 Exc | 抛异常 |
| \`assertRaisesRegex(Exc, r, ...)\` | 抛 Exc 且信息匹配 r | 抛特定异常 |
| \`assertGreater(a, b)\` | \`a > b\` | 大于 |
| \`assertLess(a, b)\` | \`a < b\` | 小于 |
| \`assertGreaterEqual(a, b)\` | \`a >= b\` | 大于等于 |
| \`assertLessEqual(a, b)\` | \`a <= b\` | 小于等于 |
| \`assertRegex(s, r)\` | \`re.search(r, s)\` | 字符串匹配正则 |
| \`assertCountEqual(a, b)\` | 排序后相等 | 元素相同(顺序无关) |

## 六、测试发现:unittest discover

手动指定每个测试文件太麻烦,\`unittest\` 支持自动发现测试:

\`\`\`bash
# 在当前目录及子目录自动发现 test_*.py
python -m unittest discover

# 指定起始目录、文件名模式、顶层模块
python -m unittest discover -s tests -p "test_*.py" -t .

# 参数说明:
# -s: 起始目录(默认 .)
# -p: 文件名模式(默认 test*.py)
# -t: 顶层目录(用于 import,默认同 -s)
\`\`\`

**发现规则**:
- 文件名匹配 \`test*.py\`(默认)或自定义模式
- 类继承 \`unittest.TestCase\`
- 方法名以 \`test\` 开头

\`\`\`text
项目结构:
myapp/
├── calc.py
└── tests/
    ├── __init__.py
    ├── test_calc.py        ← 会被发现
    ├── test_utils.py       ← 会被发现
    └── helpers/
        ├── __init__.py
        └── test_strings.py ← 会被发现(递归)

运行:python -m unittest discover -s tests
\`\`\`

## 七、完整 demo:测试一个用户管理类

把前面学的串起来,写一个稍完整的测试套件。

### 被测代码

\`\`\`python
# user_manager.py
class User:
    def __init__(self, user_id, name, email):
        self.id = user_id
        self.name = name
        self.email = email

    def __repr__(self):
        return f"User({self.id}, {self.name!r})"


class UserManager:
    def __init__(self):
        self._users = {}
        self._next_id = 1

    def create(self, name, email):
        if not name or not email:
            raise ValueError("name 和 email 不能为空")
        if "@" not in email:
            raise ValueError("email 格式不合法")
        for u in self._users.values():
            if u.email == email:
                raise ValueError("email 已存在")
        user = User(self._next_id, name, email)
        self._users[self._next_id] = user
        self._next_id += 1
        return user

    def get(self, user_id):
        if user_id not in self._users:
            raise KeyError(f"用户 {user_id} 不存在")
        return self._users[user_id]

    def delete(self, user_id):
        if user_id not in self._users:
            raise KeyError(f"用户 {user_id} 不存在")
        del self._users[user_id]

    def list_all(self):
        return list(self._users.values())

    def count(self):
        return len(self._users)
\`\`\`

### 测试套件

\`\`\`python
# test_user_manager.py
import unittest
from user_manager import UserManager, User


class TestUserManagerCreate(unittest.TestCase):
    """测试 create 方法。"""

    def setUp(self):
        self.mgr = UserManager()

    def test_create_success(self):
        user = self.mgr.create("Alice", "alice@example.com")
        self.assertEqual(user.id, 1)
        self.assertEqual(user.name, "Alice")
        self.assertEqual(user.email, "alice@example.com")
        self.assertEqual(self.mgr.count(), 1)

    def test_create_increments_id(self):
        u1 = self.mgr.create("Alice", "a@example.com")
        u2 = self.mgr.create("Bob", "b@example.com")
        self.assertEqual(u1.id, 1)
        self.assertEqual(u2.id, 2)

    def test_create_empty_name_raises(self):
        with self.assertRaises(ValueError):
            self.mgr.create("", "a@example.com")

    def test_create_empty_email_raises(self):
        with self.assertRaises(ValueError):
            self.mgr.create("Alice", "")

    def test_create_invalid_email_raises(self):
        with self.assertRaises(ValueError):
            self.mgr.create("Alice", "not-an-email")

    def test_create_duplicate_email_raises(self):
        self.mgr.create("Alice", "a@example.com")
        with self.assertRaises(ValueError):
            self.mgr.create("Bob", "a@example.com")


class TestUserManagerGet(unittest.TestCase):
    """测试 get 方法。"""

    def setUp(self):
        self.mgr = UserManager()
        self.user = self.mgr.create("Alice", "a@example.com")

    def test_get_existing_user(self):
        found = self.mgr.get(self.user.id)
        self.assertIs(found, self.user)   # 同一对象

    def test_get_nonexistent_raises(self):
        with self.assertRaises(KeyError):
            self.mgr.get(999)


class TestUserManagerDelete(unittest.TestCase):
    """测试 delete 方法。"""

    def setUp(self):
        self.mgr = UserManager()
        self.user = self.mgr.create("Alice", "a@example.com")

    def test_delete_existing(self):
        self.mgr.delete(self.user.id)
        self.assertEqual(self.mgr.count(), 0)
        with self.assertRaises(KeyError):
            self.mgr.get(self.user.id)

    def test_delete_nonexistent_raises(self):
        with self.assertRaises(KeyError):
            self.mgr.delete(999)


class TestUserManagerList(unittest.TestCase):
    """测试 list_all 方法。"""

    def setUp(self):
        self.mgr = UserManager()
        self.mgr.create("Alice", "a@example.com")
        self.mgr.create("Bob", "b@example.com")

    def test_list_all_returns_all_users(self):
        users = self.mgr.list_all()
        self.assertEqual(len(users), 2)
        names = [u.name for u in users]
        self.assertCountEqual(names, ["Alice", "Bob"])

    def test_empty_manager_returns_empty_list(self):
        empty_mgr = UserManager()
        self.assertEqual(empty_mgr.list_all(), [])


if __name__ == "__main__":
    unittest.main()
\`\`\`

### 运行结果

\`\`\`bash
$ python -m unittest test_user_manager -v

test_create_duplicate_email_raises (test_user_manager.TestUserManagerCreate) ... ok
test_create_empty_email_raises (test_user_manager.TestUserManagerCreate) ... ok
test_create_empty_name_raises (test_user_manager.TestUserManagerCreate) ... ok
test_create_increments_id (test_user_manager.TestUserManagerCreate) ... ok
test_create_invalid_email_raises (test_user_manager.TestUserManagerCreate) ... ok
test_create_success (test_user_manager.TestUserManagerCreate) ... ok
test_get_existing_user (test_user_manager.TestUserManagerGet) ... ok
test_get_nonexistent_raises (test_user_manager.TestUserManagerGet) ... ok
test_delete_existing (test_user_manager.TestUserManagerDelete) ... ok
test_delete_nonexistent_raises (test_user_manager.TestUserManagerDelete) ... ok
test_list_all_returns_all_users (test_user_manager.TestUserManagerList) ... ok
test_empty_manager_returns_empty_list (test_user_manager.TestUserManagerList) ... ok

----------------------------------------------------------------------
Ran 12 tests in 0.002s

OK
\`\`\`

注意:每个测试类都有自己的 \`setUp\`,测试之间完全隔离。\`TestUserManagerGet\` 的 \`setUp\` 创建了一个用户,但不会影响 \`TestUserManagerDelete\` 的测试——因为每个类都从空的 \`UserManager()\` 开始。

## 八、unittest 的局限

虽然 \`unittest\` 能用,但写多了会发现它有几个明显痛点:

### 1. 样板代码多

\`\`\`python
# unittest:必须继承 + self.
class TestCalc(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(1, 2), 3)   # self.assertEqual,啰嗦

# pytest:普通函数 + assert
def test_add():
    assert add(1, 2) == 3                # 简洁
\`\`\`

### 2. 断言方法冗长

\`\`\`python
# unittest:每个断言要查方法名
self.assertEqual(a, b)
self.assertTrue(x)
self.assertIn(a, b)
self.assertRaises(Exc, fn)
self.assertIsInstance(x, T)

# pytest:全是 assert
assert a == b
assert x
assert a in b
with pytest.raises(Exc): fn()
assert isinstance(x, T)
\`\`\`

### 3. fixture 不灵活

\`unittest\` 的 fixture 是类方法,跨类共享数据很麻烦(要么用全局变量,要么手动传)。\`pytest\` 的 \`fixture\` 可以按名注入,跨文件共享(\`conftest.py\`)。

### 4. 参数化麻烦

\`unittest\` 原生不支持参数化,要写多个几乎一样的方法:

\`\`\`python
# unittest:复制粘贴
def test_add_1_2(self):
    self.assertEqual(add(1, 2), 3)

def test_add_3_4(self):
    self.assertEqual(add(3, 4), 7)

def test_add_0_0(self):
    self.assertEqual(add(0, 0), 0)

# 要参数化得装第三方库(parameterized / ddt),写 @parameterized.expand
\`\`\`

而 \`pytest\` 原生支持:

\`\`\`python
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (3, 4, 7),
    (0, 0, 0),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
\`\`\`

### 5. 错误信息不如 pytest

\`\`\`python
# unittest:断言失败只告诉你 != 
AssertionError: 3 != 4

# pytest:自动展示中间变量
def test_complex():
    x = 1
    y = 2
    z = compute(x, y)
    assert z == 10
# 失败时:
# E   assert 7 == 10
# E    +  where 7 = compute(1, 2)
# E    +    where 1 = x, 2 = y
\`\`\`

pytest 自动 introspection 让 debug 容易得多。

### unittest vs pytest 速览

| 维度 | unittest | pytest |
|------|----------|--------|
| **安装** | 标准库,无需安装 | \`pip install pytest\` |
| **测试写法** | 继承 TestCase + 方法 | 普通函数 |
| **断言** | \`self.assertEqual\` 等专用方法 | 普通 \`assert\` |
| **错误信息** | 基础(只显示期望/实际) | 智能(显示中间变量) |
| **fixture** | setUp/tearDown(类方法) | @pytest.fixture(按名注入,灵活) |
| **参数化** | 需第三方库 | 原生 @parametrize |
| **插件生态** | 较少 | 极丰富(pytest-cov/pytest-mock/...) |
| **学习曲线** | 平稳(Java 风格) | 简单(Pythonic) |
| **适用场景** | 标准库项目、遗留代码 | 现代项目首选 |

## 九、unittest 实用技巧

虽然 pytest 更香,但如果你必须用 unittest(比如改老项目),这些技巧能让日子好过点。

### 1. 用 assertEqual 的 msg 参数

\`\`\`python
def test_long_list(self):
    a = list(range(100))
    b = list(range(100))
    b[50] = 999   # 故意改一个

    # ❌ 默认错误信息:AssertionError: lists differ...
    self.assertEqual(a, b)

    # ✅ 加 msg,失败时直接告诉你重点
    self.assertEqual(a, b, "第 50 位应该相同")
\`\`\`

### 2. subTest:在一个方法里测多组数据

\`\`\`python
class TestAdd(unittest.TestCase):
    def test_add_many_cases(self):
        cases = [
            (1, 2, 3),
            (10, 20, 30),
            (-1, 1, 0),
        ]
        for a, b, expected in cases:
            with self.subTest(a=a, b=b, expected=expected):
                self.assertEqual(add(a, b), expected)
\`\`\`

\`subTest\` 的好处:某一组失败不影响其他组继续跑,而且每组都会单独报告。

\`\`\`text
FAIL: test_add_many_cases (_) (a=1, b=2, expected=3)
FAIL: test_add_many_cases (_) (a=10, b=20, expected=30)
\`\`\`

### 3. skip 装饰器:跳过测试

\`\`\`python
import sys
import unittest


class TestPlatformSpecific(unittest.TestCase):
    @unittest.skip("暂时跳过,等重构完再开")
    def test_old_feature(self):
        ...

    @unittest.skipUnless(sys.platform == "linux", "只在 Linux 跑")
    def test_linux_only(self):
        ...

    @unittest.skipIf(sys.version_info < (3, 10), "需要 Python 3.10+")
    def test_new_feature(self):
        ...

    def test_normal(self):
        self.assertTrue(True)
\`\`\`

输出:

\`\`\`text
test_linux_only (skipped: 只在 Linux 跑)
test_new_feature (skipped: 需要 Python 3.10+)
test_normal ... ok
test_old_feature (skipped: 暂时跳过,等重构完再开)
\`\`\`

### 4. mock 集成

\`unittest\` 自带 \`unittest.mock\`(下一章详讲):

\`\`\`python
from unittest.mock import patch


class TestWeatherService(unittest.TestCase):
    @patch("weather.requests.get")
    def test_get_weather(self, mock_get):
        mock_get.return_value.json.return_value = {"temp": 25}
        service = WeatherService()
        self.assertEqual(service.get_temp("Beijing"), 25)
        mock_get.assert_called_once_with("https://api.weather.com/Beijing")
\`\`\`

## 十、本章小结

| 要点 | 内容 |
|------|------|
| **unittest 定位** | Python 标准库测试框架,无需安装 |
| **核心概念** | TestCase / fixture / assertion / TestRunner |
| **测试结构** | 继承 TestCase + test_ 方法 + self.assertXxx |
| **方法级夹具** | setUp / tearDown,每个测试方法前后 |
| **类级夹具** | setUpClass / tearDownClass(@classmethod),类前后一次 |
| **自动发现** | python -m unittest discover |
| **常用断言** | assertEqual / assertTrue / assertRaises / assertIn / assertAlmostEqual |
| **局限** | 样板多、断言冗长、fixture 不灵活、参数化麻烦 |

## 十一、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ setUp 是测试前的"准备"就行 | 名字无所谓 | 必须叫 setUp/tearDown,大小写敏感,否则不被识别 |
| ❌ setUpClass 不用 @classmethod | 普通方法 | 必须 @classmethod,且参数是 cls 不是 self |
| ❌ 测试方法名可以随便起 | testXXX 也行 | 必须 test_ 开头(默认),否则不被发现 |
| ❌ assertEqual 比浮点数 | 直接 == 浮点 | 浮点用 assertAlmostEqual,否则精度问题失败 |
| ❌ assertRaises 写成 \`assertRaises(fn())\` | 先调用再断言 | 必须用 with 上下文或传可调用对象+参数,不能先调用 |
| ❌ 一个测试方法测多个不相关的东西 | 一锅烩 | 一个方法测一个行为,失败时好定位 |
| ❌ setUp 里创建的状态会被测试间共享 | 每个测试独立 | 每个测试前都重新 setUp,但要注意类属性会被共用 |
| ❌ tearDown 一定执行 | 失败就不清 | tearDown 总会执行(即使测试失败),setUp 失败则不执行 tearDown |
| ❌ unittest 不能 mock | 要装第三方 | unittest.mock 是标准库,内置 patch/Mock/MagicMock |
| ❌ subTest 等于参数化 | 完全一样 | subTest 某个失败不阻断后续,但参数化每个是独立测试 |
| ❌ assertRaisesRegex 用普通字符串 | 直接 == | 第一个参数是异常类,第二个是正则,用 re.search 匹配 |

> **一句话总结**:\`unittest\` 是 Python 测试的"基本功",概念清晰、开箱即用。它的样板代码和冗长断言是缺点,但 TestCase/fixture/assertion 三件套是所有测试框架的通用语言,学会它再学 pytest 会势如破竹。`,
  },

  // =========================================================
  // 第三章:pytest 基础
  // =========================================================
  {
    id: "pyeng-test-pytest-basics",
    icon: "⚡",
    title: "pytest 基础",
    group: "测试",
    content: `## 一、pytest 简介

\`pytest\` 是 Python 生态**最流行**的测试框架,没有之一。根据 JetBrains 的 Python 开发者调查,pytest 的使用率超过 70%,远超 \`unittest\`。

### pytest 的核心优势

\`\`\`text
unittest:
  class TestXxx(unittest.TestCase):    ← 要继承
      def test_xxx(self):              ← 要 self
          self.assertEqual(a, b)       ← 要 self.assertEqual

pytest:
  def test_xxx():                      ← 普通函数
      assert a == b                    ← 普通 assert
\`\`\`

pytest 的设计哲学:**让测试代码尽可能简洁,把精力放在"测什么"而不是"怎么写测试"上**。

### 五大优势详解

| 优势 | 说明 |
|------|------|
| **无需继承** | 测试是普通函数,不需要 \`class TestX(unittest.TestCase)\` |
| **普通 assert** | 用 Python 内置 \`assert\`,不需要 \`self.assertEqual\` 等 |
| **自动 introspection** | 失败时自动显示中间变量的值,debug 友好 |
| **自动发现** | 自动找到 \`test_*.py\` / \`*_test.py\` 里的 \`test_*\` 函数 |
| **插件生态** | 800+ 插件(pytest-cov/pytest-mock/pytest-xdist/...) |

### 安装

\`\`\`bash
pip install pytest

# 验证
pytest --version
# pytest 8.0.0
\`\`\`

## 二、第一个 pytest 测试

### 被测代码

\`\`\`python
# calc.py
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b
\`\`\`

### 编写测试

\`\`\`python
# test_calc.py
from calc import add, divide


def test_add():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0


def test_add_zero():
    assert add(0, 0) == 0


def test_divide():
    assert divide(10, 2) == 5


def test_divide_by_zero():
    import pytest
    with pytest.raises(ValueError, match="除数不能为零"):
        divide(1, 0)
\`\`\`

### 运行

\`\`\`bash
# 自动发现当前目录及子目录的 test_*.py
pytest

# 指定文件
pytest test_calc.py

# 详细模式
pytest -v
\`\`\`

输出:

\`\`\`text
========================= test session starts =========================
platform darwin -- Python 3.11.0, pytest-8.0.0, pluggy-1.4.0
rootdir: /Users/demo
collected 4 items

test_calc.py::test_add PASSED                              [ 25%]
test_calc.py::test_add_zero PASSED                         [ 50%]
test_calc.py::test_divide PASSED                           [ 75%]
test_calc.py::test_divide_by_zero PASSED                   [100%]

========================== 4 passed in 0.01s ==========================
\`\`\`

对比 \`unittest\` 版本:同样是测 \`add\` 和 \`divide\`,pytest 版本代码量少了一半,而且可读性更高。

## 三、测试发现规则

pytest 自动发现测试的规则:

\`\`\`text
文件级:文件名匹配 test_*.py 或 *_test.py
类级:类名以 Test 开头(且不能有 __init__ 方法)
方法级:函数/方法名以 test 开头
\`\`\`

### 合法的测试文件 / 类 / 函数

\`\`\`python
# test_example.py ← 文件名 test_ 开头,会被发现

def test_function():           # ✅ 函数名 test_ 开头
    assert True

class TestMyClass:             # ✅ 类名 Test 开头,且无 __init__
    def test_method(self):     # ✅ 方法名 test_ 开头
        assert True
\`\`\`

### 不会被发现的

\`\`\`python
# example.py ← 文件名不是 test_ 开头,被忽略

def helper():                  # ❌ 函数名不以 test 开头
    assert True

def TestFunction():            # ❌ 函数名虽以 Test 开头,但不是 test_,被忽略
    assert True

class MyClass:                 # ❌ 类名不以 Test 开头,被忽略
    def test_method(self):
        assert True

class TestWithInit:            # ❌ 有 __init__,pytest 跳过(避免和普通类混淆)
    def __init__(self):
        pass
    def test_method(self):
        assert True
\`\`\`

### 自定义发现规则

可以在 \`pytest.ini\` / \`pyproject.toml\` 里改:

\`\`\`ini
# pytest.ini
[pytest]
python_files = test_*.py check_*.py   # 文件名模式
python_classes = Test* Check*          # 类名模式
python_functions = test_* check_*      # 函数名模式
\`\`\`

## 四、assert 的魔法:introspection

pytest 最让人舒服的一点是**断言失败时的错误信息**。它通过 AST 重写,自动展示断言表达式里每个子表达式的值。

### 对比 unittest

\`\`\`python
# unittest:只告诉你 3 != 4
self.assertEqual(add(1, 2), 4)
# AssertionError: 3 != 4
\`\`\`

\`\`\`python
# pytest:展示完整上下文
def test_add():
    result = add(1, 2)
    assert result == 4
# 失败时:
# E   assert 3 == 4
# E    +  where 3 = add(1, 2)
\`\`\`

### 复杂表达式的 introspection

\`\`\`python
def test_complex():
    users = ["Alice", "Bob", "Charlie"]
    selected = [u for u in users if len(u) > 3]
    assert len(selected) == 5
\`\`\`

失败信息:

\`\`\`text
E   assert 2 == 5
E    +  where 2 = len(['Alice', 'Charlie'])
E    +    where ['Alice', 'Charlie'] = [u for u in ['Alice', 'Bob', 'Charlie'] if len(u) > 3]
\`\`\`

pytest 不仅告诉你 \`2 != 5\`,还告诉你 \`selected\` 的实际值是 \`['Alice', 'Charlie']\`,以及它是怎么算出来的。**这种透明度让你不用 print 也能 debug**。

### 各种 assert 的错误信息

\`\`\`python
def test_comparisons():
    a, b = [1, 2, 3], [1, 2, 4]
    assert a == b
# E   assert [1, 2, 3] == [1, 2, 4]
# E     At index 2 diff: 3 != 4
# E     Use -v to get more diff

def test_string():
    s = "Hello, pytest!"
    assert "world" in s
# E   AssertionError: assert 'world' in 'Hello, pytest!'

def test_dict():
    d = {"a": 1, "b": 2}
    assert d == {"a": 1, "b": 3}
# E   AssertionError: assert {'a': 1, 'b': 2} == {'a': 1, 'b': 3}
# E     Omitting 1 identical items, use -vv to show
# E     Differing items:
# E     {'b': 2} != {'b': 3}
\`\`\`

对于容器类型(列表/字典/集合),pytest 会做 **diff**,只显示不同的部分,大型数据结构对比时尤其有用。

## 五、运行测试:常用命令

### 1. 基础运行

\`\`\`bash
# 跑所有发现到的测试
pytest

# 跑指定文件
pytest test_calc.py

# 跑指定文件的指定函数
pytest test_calc.py::test_add

# 跑指定文件的指定类的指定方法
pytest test_calc.py::TestClass::test_method

# 跑多个文件
pytest test_calc.py test_utils.py

# 跑指定目录
pytest tests/
\`\`\`

### 2. -k:按名字筛选

\`\`\`bash
# 名字包含 "add" 的测试
pytest -k "add"

# 名字包含 "add" 但不包含 "zero"
pytest -k "add and not zero"

# 名字匹配正则(其实 -k 是表达式,支持 and/or/not)
pytest -k "test_login and (success or failure)"
\`\`\`

### 3. -m:按 marker 筛选

可以给测试打"标签"(marker),然后按标签跑:

\`\`\`python
# test_example.py
import pytest

@pytest.mark.slow
def test_large_dataset():
    ...

@pytest.mark.slow
@pytest.mark.db
def test_complex_db_query():
    ...

@pytest.mark.fast
def test_simple():
    ...
\`\`\`

\`\`\`bash
# 只跑带 slow 标签的
pytest -m "slow"

# 跑带 fast 但不带 slow 的
pytest -m "fast and not slow"

# 跑带 db 或 slow 的
pytest -m "db or slow"
\`\`\`

> 注意:自定义 marker 需要在 \`pytest.ini\` 注册,否则会有 warning(下一章详讲)。

### 4. -v / -q / -s:输出控制

\`\`\`bash
# -v(verbose):每个测试一行,显示完整名字
pytest -v
# test_calc.py::test_add PASSED
# test_calc.py::test_divide PASSED

# -q(quiet):只显示进度点和总结
pytest -q
# ..                                                    [100%]
# 2 passed in 0.01s

# -s:显示 print 输出(默认 print 会被捕获)
pytest -s
# 如果测试里有 print("hello"),会显示出来

# 组合
pytest -v -s
\`\`\`

**默认行为**:\`pytest\` 会"捕获"测试里的 \`print\` 输出,只有测试失败时才显示(帮你看失败前的输出)。加 \`-s\` 关闭捕获,所有 print 立即显示——适合调试。

### 5. --tb:错误回溯控制

\`\`\`bash
# --tb=long:完整回溯(默认)
pytest --tb=long

# --tb=short:简短回溯(只显示关键几行)
pytest --tb=short

# --tb=line:一行总结
pytest --tb=line
# /path/to/test.py:5: AssertionError

# --tb=no:不显示回溯
pytest --tb=no

# --tb=auto:第一个失败用 long,后续用 short
pytest --tb=auto
\`\`\`

### 6. 其他常用选项

\`\`\`bash
# 失败时立刻停止(只看第一个错)
pytest -x

# 失败 N 次后停止
pytest --maxfail=3

# 失败的测试重新跑
pytest --lf            # 只跑上次失败的
pytest --lf --ff       # 失败的先跑,再跑其他

# 跑 N 次(随机顺序,找不稳定测试)
pytest --pjs=random -p no:randomly  # 需 pytest-randomly 插件

# 用 N 个进程并行
pytest -n 4            # 需 pytest-xdist 插件

# 显示最慢的 N 个测试
pytest --durations=10

# 遇到第一个失败进入 pdb 调试器
pytest --pdb
\`\`\`

## 六、测试结构:Arrange-Act-Assert(3A 模式)

好的测试有清晰的三段结构,叫 **3A 模式**:

\`\`\`python
def test_user_login():
    # Arrange(准备):造数据、设环境
    user = User("Alice", "alice@example.com")
    user.set_password("secret123")
    repo = InMemoryUserRepo([user])
    service = LoginService(repo)

    # Act(行动):调用被测代码
    result = service.login("alice@example.com", "secret123")

    # Assert(断言):验证结果
    assert result.success is True
    assert result.user == user
\`\`\`

### 3A 模式的精神

| 阶段 | 干什么 | 一句话 |
|------|--------|--------|
| **Arrange** | 准备测试所需的数据和环境 | "假设世界是这样" |
| **Act** | 调用被测代码,触发行为 | "我做了这件事" |
| **Assert** | 验证结果是否符合预期 | "应该发生这样的事" |

### 反例:3A 混在一起

\`\`\`python
# ❌ 混乱:准备、调用、断言交错
def test_bad():
    repo = Repo()
    repo.add(User("Alice"))
    result = service.login("Alice")          # Act 来得太早
    assert result.success
    repo.add(User("Bob"))                     # 又在 Arrange?
    result2 = service.login("Bob")
    assert result2.success
    assert repo.count() == 2                  # 这个断言在测什么?
\`\`\`

### 反例:多个 Act

\`\`\`python
# ❌ 一个测试调了多次被测方法,等于测了多个行为
def test_too_much():
    user = User("Alice")
    user.rename("Bob")          # Act 1
    assert user.name == "Bob"
    user.rename("")             # Act 2
    assert user.name == "Bob"   # 这次断言的是"不能改成空"
    user.rename("Charlie")      # Act 3
    assert user.name == "Charlie"
\`\`\`

应该拆成三个测试:\`test_rename\` / \`test_rename_to_empty_keeps_name\` / \`test_rename_again\`。

### 用注释明确 3A(可选)

简单测试不必加注释,复杂测试可以加,提升可读性:

\`\`\`python
def test_discount_with_coupon():
    # given( Arrange)
    order = Order(items=[Item(100, 2)])
    coupon = Coupon(type="fixed", value=50)

    # when(Act)
    total = order.calculate_total(coupon)

    # then(Assert)
    assert total == 150
\`\`\`

也有用 **given-when-then**(BDD 风格)的,精神一致。

## 七、异常测试:pytest.raises

测试"应该抛异常"的场景,用 \`pytest.raises\`:

### 基础用法

\`\`\`python
import pytest

def divide(a, b):
    if b == 0:
        raise ValueError("除数不能为零")
    return a / b

def test_divide_by_zero_raises():
    with pytest.raises(ValueError):
        divide(1, 0)
\`\`\`

### 验证异常信息

\`\`\`python
def test_divide_by_zero_message():
    with pytest.raises(ValueError) as exc_info:
        divide(1, 0)
    # exc_info.value 是捕获到的异常对象
    assert str(exc_info.value) == "除数不能为零"
\`\`\`

### 用 match 参数(正则匹配异常信息)

\`\`\`python
def test_divide_by_zero_match():
    # match 是正则,部分匹配即可
    with pytest.raises(ValueError, match="除数不能为零"):
        divide(1, 0)

    # 部分匹配
    with pytest.raises(ValueError, match="除数"):
        divide(1, 0)

    # 正则特殊字符要转义
    with pytest.raises(ValueError, match=r"除数不能为\\d+"):
        divide(1, 0)   # 实际信息不含数字,这个会失败
\`\`\`

### 检查异常的属性

\`\`\`python
class UserNotFoundError(Exception):
    def __init__(self, user_id, message="用户不存在"):
        self.user_id = user_id
        super().__init__(f"{message}: id={user_id}")

def test_user_not_found():
    with pytest.raises(UserNotFoundError) as exc_info:
        find_user(999)
    # 检查自定义属性
    assert exc_info.value.user_id == 999
\`\`\`

### 对比 unittest 的异常测试

\`\`\`python
# unittest:with self.assertRaises(ValueError)
with self.assertRaises(ValueError):
    divide(1, 0)

# pytest:with pytest.raises(ValueError)
with pytest.raises(ValueError):
    divide(1, 0)

# 几乎一样,但 pytest 更简洁,且 match 参数更强大
\`\`\`

## 八、对比 demo:用 pytest 重写第二章的测试

回看第二章 \`unittest\` 写的 \`TestCalculator\`,用 pytest 重写,对比代码量。

### unittest 版本

\`\`\`python
import unittest
from calc import Calculator


class TestCalculator(unittest.TestCase):
    def setUp(self):
        self.calc = Calculator()

    def test_add(self):
        self.assertEqual(self.calc.add(1, 2), 3)
        self.assertEqual(self.calc.add(-1, 1), 0)
        self.assertEqual(self.calc.add(0, 0), 0)

    def test_subtract(self):
        self.assertEqual(self.calc.subtract(5, 3), 2)
        self.assertEqual(self.calc.subtract(0, 0), 0)

    def test_multiply(self):
        self.assertEqual(self.calc.multiply(3, 4), 12)
        self.assertEqual(self.calc.multiply(0, 100), 0)

    def test_divide(self):
        self.assertEqual(self.calc.divide(10, 2), 5)

    def test_divide_by_zero_raises(self):
        with self.assertRaises(ValueError) as ctx:
            self.calc.divide(1, 0)
        self.assertEqual(str(ctx.exception), "除数不能为零")
\`\`\`

### pytest 版本

\`\`\`python
import pytest
from calc import Calculator


@pytest.fixture
def calc():
    return Calculator()


def test_add(calc):
    assert calc.add(1, 2) == 3
    assert calc.add(-1, 1) == 0
    assert calc.add(0, 0) == 0


def test_subtract(calc):
    assert calc.subtract(5, 3) == 2
    assert calc.subtract(0, 0) == 0


def test_multiply(calc):
    assert calc.multiply(3, 4) == 12
    assert calc.multiply(0, 100) == 0


def test_divide(calc):
    assert calc.divide(10, 2) == 5


def test_divide_by_zero_raises(calc):
    with pytest.raises(ValueError, match="除数不能为零"):
        calc.divide(1, 0)
\`\`\`

### 代码量对比

| 维度 | unittest | pytest |
|------|----------|--------|
| 类定义 | \`class TestCalculator(unittest.TestCase):\` | 不需要 |
| setUp | 2 行(def + return) | 2 行(@fixture + def) |
| 断言 | \`self.assertEqual(x, y)\` | \`assert x == y\` |
| 异常断言 | 2 行(with + assertEqual) | 1 行(with + match) |
| self 前缀 | 每个断言都要 | 不需要 |
| **总行数** | ~30 行 | ~22 行 |
| **可读性** | 中(样板多) | 高(直奔主题) |

虽然行数差距不算巨大,但**可读性**差距很大。pytest 版本每个测试都"开门见山",unittest 版本总有一堆 \`self.\` 噪音。

## 九、测试组织:文件与目录

中大型项目里,测试文件怎么组织?

### 推荐结构

\`\`\`text
myapp/
├── myapp/                    ← 源代码
│   ├── __init__.py
│   ├── calc.py
│   ├── users.py
│   └── utils/
│       ├── __init__.py
│       └── strings.py
├── tests/                    ← 测试目录
│   ├── __init__.py           ← 可选(让 tests 成为包)
│   ├── conftest.py           ← 共享 fixture(下一章详讲)
│   ├── test_calc.py          ← 测 myapp/calc.py
│   ├── test_users.py         ← 测 myapp/users.py
│   └── utils/
│       └── test_strings.py   ← 测 myapp/utils/strings.py
├── pytest.ini                ← pytest 配置
├── pyproject.toml
└── setup.py / setup.cfg
\`\`\`

### 文件命名约定

测试文件命名要**对应源文件**,方便查找:

\`\`\`text
源文件: myapp/calc.py       → 测试文件: tests/test_calc.py
源文件: myapp/users.py      → 测试文件: tests/test_users.py
源文件: myapp/utils/strings → 测试文件: tests/utils/test_strings.py
\`\`\`

### pytest.ini 配置

\`\`\`ini
# pytest.ini
[pytest]
# 测试文件搜索路径
testpaths = tests

# 发现规则
python_files = test_*.py
python_classes = Test*
python_functions = test_*

# 默认选项(每次跑 pytest 都生效)
addopts = -v --tb=short --strict-markers

# 注册自定义 marker
markers =
    slow: 标记慢测试
    db: 需要数据库的测试
    smoke: 冒烟测试
\`\`\`

### pyproject.toml 配置(现代写法)

\`\`\`toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
addopts = "-v --tb=short --strict-markers"
markers = [
    "slow: 标记慢测试",
    "db: 需要数据库的测试",
    "smoke: 冒烟测试",
]
\`\`\`

## 十、实战 demo:测试一个字符串工具模块

把前面的知识综合运用,测一个稍微实用点的模块。

### 被测代码

\`\`\`python
# string_utils.py
import re


def slugify(text: str) -> str:
    """把任意文本转成 URL 友好的 slug。
    "Hello, World!" → "hello-world"
    """
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\\s-]", "", text)   # 去掉特殊字符
    text = re.sub(r"[\\s-]+", "-", text)          # 空格和连续 - 合并成单个 -
    text = text.strip("-")
    return text


def truncate(text: str, max_length: int, suffix: str = "...") -> str:
    """截断文本,超过 max_length 加省略号。"""
    if max_length <= 0:
        raise ValueError("max_length 必须为正数")
    if len(text) <= max_length:
        return text
    if max_length <= len(suffix):
        return suffix[:max_length]
    return text[: max_length - len(suffix)] + suffix


def is_palindrome(text: str) -> bool:
    """判断是否回文(忽略空格、大小写、标点)。"""
    cleaned = re.sub(r"[^a-zA-Z0-9]", "", text).lower()
    return cleaned == cleaned[::-1]


def count_words(text: str) -> int:
    """统计单词数(以空白分隔)。"""
    if not text.strip():
        return 0
    return len(text.split())
\`\`\`

### 测试代码

\`\`\`python
# test_string_utils.py
import pytest
from string_utils import slugify, truncate, is_palindrome, count_words


# ============ slugify ============
class TestSlugify:
    def test_basic(self):
        assert slugify("Hello, World!") == "hello-world"

    def test_multiple_spaces(self):
        assert slugify("hello    world") == "hello-world"

    def test_leading_trailing_dash(self):
        assert slugify("---hello---") == "hello"

    def test_chinese_removed(self):
        # 中文字符会被移除(因为不在 a-z0-9)
        assert slugify("你好 world") == "world"

    def test_empty_string(self):
        assert slugify("") == ""

    def test_only_special_chars(self):
        assert slugify("@#$%") == ""


# ============ truncate ============
class TestTruncate:
    def test_short_text_unchanged(self):
        assert truncate("hello", 10) == "hello"

    def test_exact_length_unchanged(self):
        assert truncate("hello", 5) == "hello"

    def test_long_text_truncated(self):
        assert truncate("Hello, World!", 10) == "Hello..."

    def test_custom_suffix(self):
        assert truncate("Hello, World!", 10, suffix="…") == "Hello, W…"

    def test_max_length_zero_raises(self):
        with pytest.raises(ValueError, match="max_length 必须为正数"):
            truncate("hello", 0)

    def test_negative_max_length_raises(self):
        with pytest.raises(ValueError, match="max_length 必须为正数"):
            truncate("hello", -5)

    def test_suffix_longer_than_max(self):
        # suffix 比 max_length 还长,只返回 suffix 的前 max_length 字符
        assert truncate("hello", 2, suffix="...") == ".."


# ============ is_palindrome ============
class TestIsPalindrome:
    def test_simple_palindrome(self):
        assert is_palindrome("racecar") is True

    def test_not_palindrome(self):
        assert is_palindrome("hello") is False

    def test_with_spaces_and_case(self):
        assert is_palindrome("A man a plan a canal Panama") is True

    def test_with_punctuation(self):
        assert is_palindrome("Was it a car or a cat I saw?") is True

    def test_empty_string(self):
        assert is_palindrome("") is True

    def test_single_char(self):
        assert is_palindrome("a") is True


# ============ count_words ============
class TestCountWords:
    def test_simple(self):
        assert count_words("hello world") == 2

    def test_multiple_spaces(self):
        assert count_words("hello    world") == 2

    def test_leading_trailing_spaces(self):
        assert count_words("  hello world  ") == 2

    def test_empty_string(self):
        assert count_words("") == 0

    def test_only_spaces(self):
        assert count_words("   ") == 0

    def test_newlines_tabs(self):
        assert count_words("hello\\nworld\\ttab") == 3
\`\`\`

### 运行

\`\`\`bash
$ pytest test_string_utils.py -v

test_string_utils.py::TestSlugify::test_basic PASSED
test_string_utils.py::TestSlugify::test_multiple_spaces PASSED
test_string_utils.py::TestSlugify::test_chinese_removed PASSED
test_string_utils.py::TestSlugify::test_empty_string PASSED
test_string_utils.py::TestSlugify::test_leading_trailing_dash PASSED
test_string_utils.py::TestSlugify::test_only_special_chars PASSED
test_string_utils.py::TestTruncate::test_short_text_unchanged PASSED
test_string_utils.py::TestTruncate::test_exact_length_unchanged PASSED
test_string_utils.py::TestTruncate::test_long_text_truncated PASSED
test_string_utils.py::TestTruncate::test_custom_suffix PASSED
test_string_utils.py::TestTruncate::test_max_length_zero_raises PASSED
test_string_utils.py::TestTruncate::test_negative_max_length_raises PASSED
test_string_utils.py::TestTruncate::test_suffix_longer_than_max PASSED
test_string_utils.py::TestIsPalindrome::test_simple_palindrome PASSED
test_string_utils.py::TestIsPalindrome::test_not_palindrome PASSED
test_string_utils.py::TestIsPalindrome::test_with_spaces_and_case PASSED
test_string_utils.py::TestIsPalindrome::test_with_punctuation PASSED
test_string_utils.py::TestIsPalindrome::test_empty_string PASSED
test_string_utils.py::TestIsPalindrome::test_single_char PASSED
test_string_utils.py::TestCountWords::test_simple PASSED
test_string_utils.py::TestCountWords::test_multiple_spaces PASSED
test_string_utils.py::TestCountWords::test_leading_trailing_spaces PASSED
test_string_utils.py::TestCountWords::test_empty_string PASSED
test_string_utils.py::TestCountWords::test_only_spaces PASSED
test_string_utils.py::TestCountWords::test_newlines_tabs PASSED

========================== 25 passed in 0.02s ==========================
\`\`\`

## 十一、pytest vs unittest 写法对比表

| 场景 | unittest | pytest |
|------|----------|--------|
| **测试函数** | \`class T(TestCase): def test_x(self): ...\` | \`def test_x(): ...\` |
| **断言相等** | \`self.assertEqual(a, b)\` | \`assert a == b\` |
| **断言真** | \`self.assertTrue(x)\` | \`assert x\` |
| **断言包含** | \`self.assertIn(a, b)\` | \`assert a in b\` |
| **断言抛异常** | \`with self.assertRaises(Exc): fn()\` | \`with pytest.raises(Exc): fn()\` |
| **断言异常信息** | \`with self.assertRaises(Exc) as c: ...; assert str(c.exception)==...\` | \`with pytest.raises(Exc, match="..."): ...\` |
| **浮点近似** | \`self.assertAlmostEqual(a, b)\` | \`assert a == pytest.approx(b)\` |
| **方法级夹具** | \`def setUp(self): ...\` | \`@pytest.fixture def x(): ...\` |
| **类级夹具** | \`@classmethod def setUpClass(cls): ...\` | \`@pytest.fixture(scope="class")\` |
| **跳过测试** | \`@unittest.skip("reason")\` | \`@pytest.mark.skip(reason="...")\` |
| **条件跳过** | \`@unittest.skipIf(cond, ...)\` | \`@pytest.mark.skipif(cond, ...)\` |
| **预期失败** | \`@unittest.expectedFailure\` | \`@pytest.mark.xfail\` |
| **参数化** | 需第三方库(parameterized) | \`@pytest.mark.parametrize\` |
| **子测试** | \`with self.subTest():\` | 用 \`parametrize\` 拆成多个 |
| **失败信息** | 简单(只显示期望/实际) | 智能(显示中间变量) |
| **mock** | \`unittest.mock.patch\` | \`pytest-mock\` 的 \`mocker\`(更简洁) |
| **临时目录** | \`tempfile\` 手动 | \`tmp_path\` 内置 fixture |
| **捕获 print** | 手动 redirect | \`capsys\` 内置 fixture |

## 十二、本章小结

| 要点 | 内容 |
|------|------|
| **pytest 优势** | 无需继承、普通 assert、自动发现、智能错误信息、插件生态 |
| **测试发现** | test_*.py / *_test.py 里的 test_* 函数 / Test* 类 |
| **断言** | 直接用 \`assert\`,pytest 自动展示中间变量 |
| **异常测试** | \`with pytest.raises(Exc, match="..."):\` |
| **运行选项** | -v / -q / -s / -k / -m / -x / --tb / --lf |
| **3A 模式** | Arrange(准备)→ Act(行动)→ Assert(断言) |
| **配置** | pytest.ini 或 pyproject.toml 的 [tool.pytest.ini_options] |

## 十三、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ 测试类可以有 __init__ | 像普通类 | pytest 跳过有 __init__ 的类,不要加 |
| ❌ assert 后面可以跟任何东西 | 表达式就行 | assert 用 Python 原生语法,但别用 \`assert x is True\`,直接 \`assert x\` |
| ❌ pytest.raises 后断言必须另写一行 | match 不够 | 用 \`match\` 参数直接匹配异常信息,不必取 exc_info |
| ❌ match 是精确匹配 | 完整字符串相等 | match 是 re.search,部分匹配,正则特殊字符要转义 |
| ❌ -s 是 silent | 静默 | -s 反而是"显示 print"(disable capture),-q 才是静默 |
| ❌ -k 支持任意正则 | 复杂模式 | -k 只支持 and/or/not 表达式,匹配的是测试名子串 |
| ❌ 自定义 marker 直接用就行 | 无需注册 | 未注册会有 warning,要在 pytest.ini 的 markers 里声明 |
| ❌ 测试函数名必须叫 test_xxx | 严格格式 | 只要 test 开头即可,testXXX / test_ 都行 |
| ❌ 一个测试函数多个 assert 是错的 | 必须一个 | 一个测试一个"行为",可以有多个 assert 验证同一行为的不同方面 |
| ❌ pytest 不能测 unittest 风格 | 不兼容 | pytest 完全兼容 unittest.TestCase,可以混用 |
| ❌ print 输出默认会显示 | 自动打印 | 默认被捕获,只有失败时才显示,要看 print 加 -s |

> **一句话总结**:pytest 用"普通函数 + 普通 assert"把测试的样板代码降到最低,加上智能的错误信息和丰富的运行选项,让"写测试"和"跑测试"都变成愉快的事。它是 Python 测试的现代标准。`,
  },

  // =========================================================
  // 第四章:pytest fixture 与参数化
  // =========================================================
  {
    id: "pyeng-test-pytest-fixture",
    icon: "🔧",
    title: "pytest fixture 与参数化",
    group: "测试",
    content: `## 一、fixture:pytest 最强大的特性

如果说 pytest 比 unittest 强在哪,**fixture** 是最大的一块。fixture 让你**优雅地管理测试的"准备"和"清理"**,而且可以跨测试共享、按需组合。

### fixture 是什么

简单说:**fixture 是一个"测试资源提供器"**。它负责:
1. 准备测试需要的东西(数据库连接、临时文件、测试对象...)
2. 把这个东西**注入**到测试函数里(通过参数名匹配)
3. 测试结束后**清理**(关连接、删文件...)

\`\`\`text
传统方式(unittest):
  def setUp(self):
      self.db = create_db()       ← 准备
  def test_xxx(self):
      use(self.db)                ← 用
  def tearDown(self):
      self.db.close()             ← 清理

  问题:每个测试类都要重写 setUp/tearDown,跨类共享麻烦。

fixture 方式(pytest):
  @pytest.fixture
  def db():
      db = create_db()            ← 准备
      yield db                    ← 提供给测试
      db.close()                  ← 清理

  def test_xxx(db):               ← 参数名 = fixture 名,自动注入
      use(db)
  def test_yyy(db):               ← 复用同一个 fixture
      use(db)
\`\`\`

## 二、fixture 基础

### 第一个 fixture

\`\`\`python
import pytest


@pytest.fixture
def sample_user():
    """提供一个测试用户。"""
    return {"id": 1, "name": "Alice", "email": "alice@example.com"}


def test_user_has_name(sample_user):
    # 参数名 sample_user 匹配 fixture 名,自动注入
    assert "name" in sample_user
    assert sample_user["name"] == "Alice"


def test_user_email_format(sample_user):
    # 同一个 fixture 可以被多个测试复用
    assert "@" in sample_user["email"]
\`\`\`

**关键机制**:
1. 用 \`@pytest.fixture\` 装饰一个函数,函数名就是 fixture 名
2. 测试函数的**参数名**和 fixture 名匹配时,pytest 自动调用 fixture,把返回值作为参数传入
3. fixture 可以被任意多个测试复用

### fixture 的返回值注入

\`\`\`python
@pytest.fixture
def numbers():
    return [1, 2, 3, 4, 5]


def test_sum(numbers):
    assert sum(numbers) == 15


def test_length(numbers):
    assert len(numbers) == 5


def test_max(numbers):
    assert max(numbers) == 5
\`\`\`

每个测试运行时,pytest 都会调用一次 \`numbers()\` 拿到 \`[1, 2, 3, 4, 5]\`,注入进去。

## 三、yield:fixture 的清理

fixture 如果只 \`return\`,没办法清理资源。用 \`yield\` 替代 \`return\`,yield 之后是清理代码。

### return vs yield

\`\`\`python
@pytest.fixture
def db_with_return():
    db = create_db()
    return db                    # ❌ 没法清理
    # 这行之后写啥都不会执行(return 已经退出)


@pytest.fixture
def db_with_yield():
    db = create_db()
    yield db                     # 把 db 给测试,测试跑完后继续往下
    db.close()                   # 清理代码
    print("数据库已关闭")
\`\`\`

### 执行顺序

\`\`\`python
@pytest.fixture
def resource():
    print("\\n[fixture] 准备资源")
    yield "resource"
    print("\\n[fixture] 清理资源")


def test_a(resource):
    print("[test_a] 使用资源")


def test_b(resource):
    print("[test_b] 使用资源")
\`\`\`

跑 \`pytest -s\` 输出:

\`\`\`text
[fixture] 准备资源
[test_a] 使用资源
[fixture] 清理资源
[fixture] 准备资源
[test_b] 使用资源
[fixture] 清理资源
\`\`\`

每个测试前后都跑一遍 fixture(因为默认 scope=function)。

### 完整例子:文件 fixture

\`\`\`python
import os
import pytest


@pytest.fixture
def temp_file(tmp_path):
    """创建一个临时文件,测试后自动删除。
    (其实 tmp_path 会自动清理,这里演示 yield 的用法)"""
    file_path = tmp_path / "test_data.txt"
    file_path.write_text("hello,fixture!")
    yield file_path
    # 清理:删文件
    if file_path.exists():
        file_path.unlink()


def test_read_file(temp_file):
    content = temp_file.read_text()
    assert content == "hello,fixture!"


def test_file_exists(temp_file):
    assert temp_file.exists()
\`\`\`

## 四、fixture 的作用域:scope

fixture 默认每个测试函数都重新执行一次(\`scope="function"\`)。可以通过 \`scope\` 改变:

\`\`\`python
@pytest.fixture(scope="module")
def expensive_resource():
    print(">>> 初始化耗时资源(整个模块只一次)")
    return load_large_dataset()
\`\`\`

### 四种 scope

| scope | 执行频率 | 典型用途 |
|-------|----------|----------|
| \`function\`(默认) | 每个测试函数前 | 测试对象、临时数据 |
| \`class\` | 每个测试类前 | 类共享的、稍贵的资源 |
| \`module\` | 每个测试文件前 | 文件级共享(读配置、起服务) |
| \`session\` | 整个测试会话前(只一次) | 最贵的(数据库服务器、Docker 容器) |

### scope 演示

\`\`\`python
import pytest


@pytest.fixture(scope="session")
def session_resource():
    print(">>> [session] 启动(整个 pytest 只 1 次)")
    return "session_data"


@pytest.fixture(scope="module")
def module_resource():
    print(">>> [module] 启动(每个文件 1 次)")
    return "module_data"


@pytest.fixture(scope="function")
def function_resource():
    print(">>> [function] 启动(每个测试 1 次)")
    return "function_data"


def test_a(session_resource, module_resource, function_resource):
    print("[test_a]")


def test_b(session_resource, module_resource, function_resource):
    print("[test_b]")
\`\`\`

输出:

\`\`\`text
>>> [session] 启动(整个 pytest 只 1 次)
>>> [module] 启动(每个文件 1 次)
>>> [function] 启动(每个测试 1 次)
[test_a]
>>> [function] 启动(每个测试 1 次)
[test_b]
\`\`\`

\`session\` 和 \`module\` 只跑一次,\`function\` 跑两次。

### scope 对比表

| 维度 | function | class | module | session |
|------|----------|-------|--------|---------|
| **执行次数** | 每测试 1 次 | 每类 1 次 | 每文件 1 次 | 整个会话 1 次 |
| **执行 setup** | N 次 | M 次 | K 次 | 1 次 |
| **执行 teardown** | N 次 | M 次 | K 次 | 1 次 |
| **状态隔离** | 完全隔离 | 类内共享 | 文件内共享 | 全会话共享 |
| **适用资源** | 轻量对象 | 类共享数据 | 文件共享配置 | 数据库/Docker |
| **速度影响** | 慢(重复初始化) | 中 | 快 | 最快 |
| **风险** | 低(隔离好) | 中 | 中 | 高(状态污染) |

**经验法则**:**从 function 开始**,只有当初始化太慢时才升级到 module/session,且要确保 fixture 不会污染状态。

## 五、conftest.py:共享 fixture

如果每个测试文件都重写同一个 fixture,太重复。pytest 提供 \`conftest.py\` **自动共享** fixture,无需 import。

### conftest.py 的工作机制

\`\`\`text
tests/
├── conftest.py            ← 这个文件里的 fixture,所有子目录的测试都能用
├── test_a.py              ← 可以用 conftest 的 fixture
├── test_b.py              ← 可以用
└── sub/
    ├── conftest.py        ← 子目录的 conftest,只对 sub/ 生效
    ├── test_c.py          ← 可以用 两个 conftest 的 fixture
    └── test_d.py
\`\`\`

**规则**:
- \`conftest.py\` 放在哪个目录,fixture 就对该目录及子目录生效
- **不需要 \`import\`**,pytest 自动发现
- 同名 fixture,近的覆盖远的(子 conftest 覆盖父 conftest)

### 例子

\`\`\`python
# tests/conftest.py
import pytest


@pytest.fixture
def sample_user():
    return {"id": 1, "name": "Alice"}


@pytest.fixture
def db():
    """模拟数据库连接。"""
    print(">>> 连接数据库")
    db = {"users": [], "connected": True}
    yield db
    print(">>> 关闭数据库")
    db["connected"] = False
\`\`\`

\`\`\`python
# tests/test_user_service.py
def test_create_user(db, sample_user):
    # 直接用,无需 import
    db["users"].append(sample_user)
    assert len(db["users"]) == 1


def test_db_connected(db):
    assert db["connected"] is True
\`\`\`

\`\`\`bash
$ pytest tests/test_user_service.py -v -s

>>> 连接数据库
test_create_user PASSED
>>> 关闭数据库
>>> 连接数据库
test_db_connected PASSED
>>> 关闭数据库
\`\`\`

### conftest.py 的好处

| 好处 | 说明 |
|------|------|
| **去重** | 多个测试文件共享同一 fixture,不必复制 |
| **隐式注入** | 测试只需声明参数,不用 import |
| **分层** | 不同目录可以有不同 conftest,fixture 作用域清晰 |
| **可覆盖** | 子 conftest 同名 fixture 覆盖父 conftest |

## 六、参数化:@pytest.mark.parametrize

参数化让**一个测试函数跑多组数据**,避免复制粘贴。

### 一个参数

\`\`\`python
import pytest


@pytest.mark.parametrize("name", ["Alice", "Bob", "Charlie"])
def test_greet(name):
    assert greet(name) == f"Hello, {name}!"
\`\`\`

等价于:

\`\`\`python
def test_greet_alice():
    assert greet("Alice") == "Hello, Alice!"

def test_greet_bob():
    assert greet("Bob") == "Hello, Bob!"

def test_greet_charlie():
    assert greet("Charlie") == "Hello, Charlie!"
\`\`\`

但参数化版本只写了一个函数,新增数据只要往列表里加。

### 多个参数

\`\`\`python
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (10, 20, 30),
    (-1, 1, 0),
    (0, 0, 0),
    (100, -50, 50),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
\`\`\`

pytest 会跑 5 次,每次用一组数据。输出:

\`\`\`text
test_add[a-b-expected0] PASSED
test_add[a-b-expected1] PASSED
test_add[a-b-expected2] PASSED
test_add[a-b-expected3] PASSED
test_add[a-b-expected4] PASSED
\`\`\`

### 给参数起有意义的名字(ids)

默认的 \`test_add[0]\` 看不出测的是哪组数据,用 \`ids\` 自定义:

\`\`\`python
@pytest.mark.parametrize(
    "a,b,expected",
    [
        (1, 2, 3),
        (-1, 1, 0),
        (0, 0, 0),
    ],
    ids=["one_plus_two", "negative_plus_positive", "zero_plus_zero"]
)
def test_add(a, b, expected):
    assert add(a, b) == expected
\`\`\`

输出:

\`\`\`text
test_add[one_plus_two] PASSED
test_add[negative_plus_positive] PASSED
test_add[zero_plus_zero] PASSED
\`\`\`

### 用函数生成 id

\`\`\`python
def idfn(params):
    """根据参数生成 id。"""
    return f"{params[0]}+{params[1]}={params[2]}"


@pytest.mark.parametrize(
    "a,b,expected",
    [(1, 2, 3), (10, 20, 30)],
    ids=idfn
)
def test_add(a, b, expected):
    assert add(a, b) == expected

# 输出:test_add[1+2=3] / test_add[10+20=30]
\`\`\`

### 参数化的常见场景

\`\`\`python
# 1. 边界值测试
@pytest.mark.parametrize("n", [0, 1, -1, 100, -100, 999999])
def test_classify(n):
    result = classify(n)
    assert result in ("zero", "positive", "negative")


# 2. 异常输入
@pytest.mark.parametrize("bad_input", [None, "", [], {}, "not-a-number"])
def test_parse_invalid(bad_input):
    with pytest.raises((ValueError, TypeError)):
        parse(bad_input)


# 3. 等价类划分
@pytest.mark.parametrize("age,category", [
    (-1, "invalid"),
    (0, "infant"),
    (5, "child"),
    (15, "teen"),
    (30, "adult"),
    (70, "senior"),
    (150, "invalid"),
])
def test_age_category(age, category):
    assert categorize_age(age) == category
\`\`\`

## 七、fixture 嵌套:fixture 依赖 fixture

fixture 可以**依赖其他 fixture**,只需在参数里声明。

\`\`\`python
import pytest


@pytest.fixture
def config():
    return {"db_url": "sqlite:///:memory:", "debug": True}


@pytest.fixture
def db_connection(config):     # ← 依赖 config fixture
    """建一个数据库连接,用 config 里的 url。"""
    print(f">>> 连接 {config['db_url']}")
    conn = FakeConnection(config["db_url"])
    yield conn
    conn.close()


@pytest.fixture
def user_repo(db_connection):  # ← 依赖 db_connection fixture
    return UserRepository(db_connection)


def test_create_user(user_repo):
    user_repo.create("Alice")
    assert user_repo.count() == 1
\`\`\`

执行顺序:

\`\`\`text
1. config() → 返回 config dict
2. db_connection(config) → 用 config,返回 conn
3. user_repo(db_connection) → 用 conn,返回 repo
4. test_create_user(user_repo) → 用 repo 跑测试
5. 测试结束,逆序清理:user_repo 没清理 → db_connection.close() → config 没清理
\`\`\`

fixture 嵌套让"组合资源"非常优雅——你只声明需要什么,pytest 自动按依赖图组装。

## 八、fixture 的参数:request.param(高级)

fixture 可以接收参数,让同一个 fixture 在不同测试里行为不同。

\`\`\`python
import pytest


@pytest.fixture(params=["mysql", "postgres", "sqlite"])
def db(request):
    """对每种数据库跑一遍测试。"""
    db_type = request.param
    print(f">>> 初始化 {db_type}")
    db = create_db(db_type)
    yield db
    db.close()


def test_query(db):
    # 这个测试会跑 3 次,分别用 mysql/postgres/sqlite
    result = db.query("SELECT 1")
    assert result == 1
\`\`\`

输出:

\`\`\`text
>>> 初始化 mysql
test_query[mysql] PASSED
>>> 初始化 postgres
test_query[postgres] PASSED
>>> 初始化 sqlite
test_query[sqlite] PASSED
\`\`\`

### fixture 参数 + 参数化组合

\`\`\`python
@pytest.fixture(params=[1, 10, 100])
def amount(request):
    return request.param


@pytest.mark.parametrize("discount_rate", [0.1, 0.5, 0.9])
def test_discount(amount, discount_rate):
    # 这个测试会跑 3 × 3 = 9 次
    result = discount(amount, discount_rate)
    assert 0 <= result <= amount
\`\`\`

## 九、内置 fixture

pytest 自带一批常用 fixture,无需自己写。

### 1. tmp_path / tmp_path_factory:临时目录

\`\`\`python
def test_write_file(tmp_path):
    # tmp_path 是 pathlib.Path,每个测试独立
    file = tmp_path / "data.txt"
    file.write_text("hello")
    assert file.read_text() == "hello"
    # 测试结束自动删除


def test_unique_dirs(tmp_path):
    d1 = tmp_path / "dir1"
    d2 = tmp_path / "dir2"
    d1.mkdir()
    d2.mkdir()
    assert d1.exists() and d2.exists()
\`\`\`

\`tmp_path_factory\` 是 session 级,适合跨测试共享的大目录:

\`\`\`python
@pytest.fixture(scope="session")
def image_dir(tmp_path_factory):
    """session 级临时目录,放测试图片。"""
    d = tmp_path_factory.mktemp("images")
    return d
\`\`\`

### 2. capsys / capfd:捕获输出

\`\`\`python
def test_print(capsys):
    print("hello,pytest!")
    captured = capsys.readouterr()
    assert captured.out == "hello,pytest!\\n"
    assert captured.err == ""


def test_stderr(capsys):
    import sys
    sys.stderr.write("error message")
    captured = capsys.readouterr()
    assert captured.err == "error message"
\`\`\`

\`capsys\` 捕获 Python 级输出,\`capfd\` 捕获文件描述符级(包括 C 扩展的输出)。

### 3. monkeypatch:打补丁

\`\`\`python
import os


def test_get_env(monkeypatch):
    monkeypatch.setenv("MY_VAR", "test_value")
    assert os.environ["MY_VAR"] == "test_value"
    # 测试结束自动恢复(删除 MY_VAR)


def test_mock_attr(monkeypatch):
    class Config:
        debug = False

    monkeypatch.setattr(Config, "debug", True)
    assert Config.debug is True
    # 测试结束恢复原值
\`\`\`

monkeypatch 下一章详讲。

### 4. recwarn:捕获警告

\`\`\`python
import warnings


def test_warning(recwarn):
    warnings.warn("deprecated", DeprecationWarning)
    assert len(recwarn) == 1
    assert "deprecated" in str(recwarn[0].message)
\`\`\`

### 5. 其他常用内置 fixture

| fixture | 作用 | scope |
|---------|------|-------|
| \`tmp_path\` | 临时目录(函数级) | function |
| \`tmp_path_factory\` | 临时目录工厂(session 级) | session |
| \`capsys\` | 捕获 stdout/stderr | function |
| \`capfd\` | 捕获 fd 级输出 | function |
| \`caplog\` | 捕获日志 | function |
| \`monkeypatch\` | 打补丁(setattr/setenv/delattr) | function |
| \`recwarn\` | 捕获警告 | function |
| \`pytest.raises\` | 断言抛异常(其实是函数,不是 fixture) | - |
| \`request\` | 访问测试上下文 | function |
| \`config\` | pytest 配置对象 | session |

## 十、完整 demo:数据库 fixture

来写一个稍完整的例子,综合演示 fixture 的威力。

### 被测代码

\`\`\`python
# user_repo.py
class UserRepository:
    def __init__(self, db):
        self.db = db

    def create(self, name, email):
        user_id = self.db.execute(
            "INSERT INTO users (name, email) VALUES (?, ?)", (name, email)
        )
        return user_id

    def find(self, user_id):
        rows = self.db.query("SELECT * FROM users WHERE id = ?", (user_id,))
        if not rows:
            raise KeyError(f"用户 {user_id} 不存在")
        return rows[0]

    def list_all(self):
        return self.db.query("SELECT * FROM users")
\`\`\`

### conftest.py:共享 fixture

\`\`\`python
# tests/conftest.py
import sqlite3
import pytest


@pytest.fixture(scope="session")
def db_schema():
    """session 级:定义表结构(只一次)。"""
    return """
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    );
    """


@pytest.fixture(scope="function")
def db(db_schema):
    """function 级:每个测试一个全新的内存数据库。"""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(db_schema)

    # 包装一下,提供统一接口
    class DB:
        def execute(self, sql, params=()):
            cursor = conn.execute(sql, params)
            conn.commit()
            return cursor.lastrowid

        def query(self, sql, params=()):
            cursor = conn.execute(sql, params)
            return [dict(row) for row in cursor.fetchall()]

    yield DB()
    conn.close()


@pytest.fixture
def repo(db):
    """UserRepository 实例,依赖 db fixture。"""
    from user_repo import UserRepository
    return UserRepository(db)


@pytest.fixture
def sample_users(repo):
    """预置一些用户。"""
    repo.create("Alice", "alice@example.com")
    repo.create("Bob", "bob@example.com")
    return repo.list_all()
\`\`\`

### 测试代码

\`\`\`python
# tests/test_user_repo.py
import pytest
from user_repo import UserRepository


class TestCreate:
    def test_create_returns_id(self, repo):
        user_id = repo.create("Alice", "alice@example.com")
        assert user_id > 0

    def test_create_duplicate_email_raises(self, repo):
        repo.create("Alice", "alice@example.com")
        with pytest.raises(sqlite3.IntegrityError):
            repo.create("Bob", "alice@example.com")


class TestFind:
    def test_find_existing(self, repo, sample_users):
        # sample_users 已经预置了 Alice/Bob
        alice = repo.find(sample_users[0]["id"])
        assert alice["name"] == "Alice"

    def test_find_nonexistent_raises(self, repo):
        with pytest.raises(KeyError):
            repo.find(999)


class TestListAll:
    def test_empty_returns_empty_list(self, repo):
        assert repo.list_all() == []

    def test_returns_all(self, repo, sample_users):
        users = repo.list_all()
        assert len(users) == 2


# 参数化测试
@pytest.mark.parametrize("name,email", [
    ("Alice", "alice@example.com"),
    ("Bob", "bob@example.com"),
    ("中文用户", "chinese@example.com"),
    ("用户 with spaces", "spaces@example.com"),
])
def test_create_various_names(repo, name, email):
    user_id = repo.create(name, email)
    found = repo.find(user_id)
    assert found["name"] == name
    assert found["email"] == email


@pytest.mark.parametrize("invalid_email", [
    "",
    "no-at-sign",
    "@no-local.com",
    "no-domain@",
    "spaces in@example.com",
])
def test_create_invalid_email(repo, invalid_email):
    # 假设我们加了邮箱校验
    with pytest.raises((ValueError, sqlite3.IntegrityError)):
        repo.create("Test", invalid_email)
\`\`\`

### 运行

\`\`\`bash
$ pytest tests/test_user_repo.py -v

tests/test_user_repo.py::TestCreate::test_create_returns_id PASSED
tests/test_user_repo.py::TestCreate::test_create_duplicate_email_raises PASSED
tests/test_user_repo.py::TestFind::test_find_existing PASSED
tests/test_user_repo.py::TestFind::test_find_nonexistent_raises PASSED
tests/test_user_repo.py::TestListAll::test_empty_returns_empty_list PASSED
tests/test_user_repo.py::TestListAll::test_returns_all PASSED
tests/test_user_repo.py::test_create_various_names[Alice-alice@example.com] PASSED
tests/test_user_repo.py::test_create_various_names[Bob-bob@example.com] PASSED
tests/test_user_repo.py::test_create_various_names[中文用户-chinese@example.com] PASSED
tests/test_user_repo.py::test_create_various_names[用户 with spaces-spaces@example.com] PASSED
tests/test_user_repo.py::test_create_invalid_email[no-at-sign] PASSED
...

========================== 11 passed in 0.05s ==========================
\`\`\`

### 这个 demo 的亮点

1. **db fixture scope="function"**:每个测试拿全新的内存数据库,完全隔离
2. **fixture 嵌套**:\`repo\` 依赖 \`db\`,\`sample_users\` 依赖 \`repo\`
3. **conftest.py 共享**:所有测试文件都能用 \`db\` / \`repo\` / \`sample_users\`,无需 import
4. **参数化**:\`test_create_various_names\` 一组函数测多种名字
5. **测试组织**:用 \`class TestXxx\` 把相关测试分组

## 十一、fixture scope 对比表(完整版)

| scope | setup 次数 | teardown 次数 | 状态共享 | 速度 | 隔离性 | 适用 |
|-------|-----------|---------------|----------|------|--------|------|
| **function** | N(每测试) | N | 不共享 | 最慢 | 最好 | 默认,大部分场景 |
| **class** | M(每类) | M | 类内 | 中 | 中 | 类内共享昂贵资源 |
| **module** | K(每文件) | K | 文件内 | 快 | 弱 | 文件内共享配置 |
| **session** | 1 | 1 | 全会话 | 最快 | 最弱 | 数据库/Docker/服务 |

**升级 scope 的原则**:
- 只在"初始化太慢"时升级
- 升级后必须保证 fixture 不会在测试间"泄漏状态"
- 用 yield 的清理部分必须能"恢复"资源到初始态

## 十二、fixture 的常见坑

### 坑1:fixture 没用 yield,无法清理

\`\`\`python
@pytest.fixture
def db():
    conn = connect()
    return conn      # ❌ 测试结束 conn 不会被关
    conn.close()     # 永远到不了这里


@pytest.fixture
def db():
    conn = connect()
    yield conn       # ✅
    conn.close()
\`\`\`

### 坑2:scope 选错导致状态污染

\`\`\`python
@pytest.fixture(scope="session")
def db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER, name TEXT)")
    return conn


def test_a(db):
    db.execute("INSERT INTO users VALUES (1, 'Alice')")
    assert db.query("SELECT COUNT(*) FROM users")[0][0] == 1


def test_b(db):
    # ❌ session 级,db 里有 test_a 插的数据!
    db.execute("INSERT INTO users VALUES (2, 'Bob')")
    assert db.query("SELECT COUNT(*) FROM users")[0][0] == 1   # 失败:实际是 2
\`\`\`

**修复**:要么 \`scope="function"\`,要么在 fixture 里每次清表:

\`\`\`python
@pytest.fixture(scope="session")
def db_connection():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER, name TEXT)")
    yield conn
    conn.close()


@pytest.fixture
def db(db_connection):
    # function 级,每次清表
    db_connection.execute("DELETE FROM users")
    db_connection.commit()
    return db_connection
\`\`\`

### 坑3:fixture 名字和测试参数名不匹配

\`\`\`python
@pytest.fixture
def sample_user():
    return {"name": "Alice"}


def test_xxx(user):       # ❌ 参数名是 user,不是 sample_user
    assert user["name"]    # fixture not found 错误
\`\`\`

**修复**:参数名必须和 fixture 名**完全一致**。

### 坑4:fixture 循环依赖

\`\`\`python
@pytest.fixture
def a(b):
    return b + 1


@pytest.fixture
def b(a):
    return a + 1     # ❌ a 依赖 b,b 依赖 a,pytest 报错
\`\`\`

fixture 依赖必须是**有向无环图**。

## 十三、本章小结

| 要点 | 内容 |
|------|------|
| **fixture 是什么** | 测试资源提供器,负责准备 + 注入 + 清理 |
| **定义 fixture** | \`@pytest.fixture\` 装饰函数,函数名 = fixture 名 |
| **使用 fixture** | 测试函数参数名匹配 fixture 名,自动注入 |
| **清理** | 用 \`yield\` 替代 \`return\`,yield 之后是清理 |
| **scope** | function / class / module / session,控制执行频率 |
| **conftest.py** | 共享 fixture,无需 import,分层覆盖 |
| **参数化** | \`@pytest.mark.parametrize\`,一个函数跑多组数据 |
| **fixture 嵌套** | fixture 可以依赖其他 fixture |
| **内置 fixture** | tmp_path / capsys / monkeypatch / caplog / recwarn |

## 十四、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ fixture 必须用 return | return 唯一选择 | 要清理用 yield,return 之后无法清理 |
| ❌ scope 越大越好 | session 最快最好 | scope 大则状态污染风险高,默认 function |
| ❌ conftest.py 要 import | 像 import 模块 | conftest.py 自动发现,不要 import |
| ❌ 参数名可以和 fixture 名不同 | 只要类型对 | 必须**完全一致**(按名注入,不看类型) |
| ❌ parametrize 的 ids 是数字 | 自动编号 | 默认是数字,但可自定义(ids 参数) |
| ❌ parametrize 只能一个参数 | 单值 | 可以多个参数,用逗号分隔名,元组传值 |
| ❌ fixture 不能依赖 fixture | 必须独立 | 可以依赖,pytest 自动按依赖图组装 |
| ❌ scope=session 的 fixture 改了不影响 | 全局共享 | 一定要保证幂等,或搭配 function 级清表 |
| ❌ tmp_path 要手动删 | 自己清理 | pytest 自动清理,别手动 |
| ❌ fixture 的 yield 之后代码不执行 | 失败就跳过 | 即使测试失败,清理代码也会执行(类似 finally) |
| ❌ 多个 parametrize 叠加是顺序 | 串联 | 多个 parametrize 是**笛卡尔积**,组合数会爆炸 |
| ❌ 内置 fixture 要 import | 像 import | 直接当参数用,tmp_path/capsys 等都无需 import |

> **一句话总结**:fixture 是 pytest 的灵魂——它用"按名注入 + yield 清理 + scope 控制 + conftest 共享"的组合,把测试的"准备-清理"从样板代码变成了优雅的声明。配合 parametrize,一组逻辑可以测遍百组数据,而代码只写一遍。`,
  },

  // =========================================================
  // 第五章:Mock 与打桩
  // =========================================================
  {
    id: "pyeng-test-mock",
    icon: "🎭",
    title: "Mock 与打桩",
    group: "测试",
    content: `## 一、为什么需要 Mock

测试的核心原则之一是**隔离**——单元测试应该只测"这个函数",不测"它的依赖"。但现实中,函数往往依赖外部世界:

\`\`\`python
def get_user_score(user_id):
    # 依赖1:文件系统
    with open("config.json") as f:
        config = json.load(f)
    # 依赖2:数据库
    conn = sqlite3.connect(config["db"])
    cursor = conn.cursor()
    cursor.execute("SELECT score FROM users WHERE id=?", (user_id,))
    # 依赖3:网络(调用外部 API 校验)
    response = requests.get(f"https://verify.example.com/{user_id}")
    if response.status_code != 200:
        raise ValueError("校验失败")
    return cursor.fetchone()[0]
\`\`\`

测这个函数,如果用真实的文件 / 数据库 / 网络:

| 问题 | 表现 |
|------|------|
| **慢** | 每个测试连数据库、发请求,要几秒 |
| **不稳定** | 网络一断测试就红,但你的代码没错 |
| **难造数据** | 想测"用户不存在"的分支,得真删数据库里的用户 |
| **有副作用** | 测试发了真实邮件、扣了真实钱、改了真实文件 |
| **不可重复** | 上次测试改了数据,这次测试行为变了 |

**Mock 的核心思想**:用"假对象"替换"真依赖",让测试**只关注被测代码的逻辑**,不依赖外部世界。

\`\`\`text
真实环境:                     测试环境(Mock):
┌──────────┐                  ┌──────────┐
│ 你的代码  │                  │ 你的代码  │
│  ↓ 调用   │                  │  ↓ 调用   │
│ requests │ ──→ 真实 API      │ Mock     │ ──→ 返回你预设的值
│ sqlite3  │ ──→ 真实 DB       │ Mock     │ ──→ 返回你预设的数据
│ open     │ ──→ 真实文件      │ Mock     │ ──→ 返回你预设的内容
└──────────┘                  └──────────┘
\`\`\`

## 二、unittest.mock 模块

Python 标准库自带 \`unittest.mock\` 模块,**无需安装**(即使你用 pytest 也能用)。核心三个工具:

| 工具 | 作用 |
|------|------|
| \`Mock\` | 通用 mock 对象,可配置返回值、记录调用 |
| \`MagicMock\` | Mock 的增强版,支持魔法方法(\`__len__\`/\`__iter__\` 等) |
| \`patch\` | 临时替换对象(装饰器 / 上下文管理器) |

### Mock:基础 mock 对象

\`\`\`python
from unittest.mock import Mock

# 创建一个 mock
m = Mock()

# 任意属性 / 方法都存在,且返回值是另一个 Mock
print(m.some_method())           # <Mock id=...>
print(m.any_attribute)            # <Mock id=...>

# 配置返回值
m.return_value = 42
print(m())                        # 42

# 配置某个方法的返回值
m.some_method.return_value = "hello"
print(m.some_method())            # "hello"
\`\`\`

### Mock 记录调用

\`\`\`python
m = Mock()
m(1, 2, key="value")
m()
m.some_method("a", "b")

# 检查调用次数
print(m.call_count)               # 2(主 mock 被调用 2 次)

# 检查调用参数
print(m.call_args)                # call()(最后一次)
print(m.call_args_list)           # [call(1, 2, key='value'), call()]

# 检查子方法的调用
print(m.some_method.call_count)   # 1
print(m.some_method.call_args)    # call('a', 'b')
\`\`\`

### 配置 return_value vs side_effect

\`\`\`python
# return_value:每次调用都返回同一个值
m = Mock()
m.return_value = 100
print(m())   # 100
print(m())   # 100

# side_effect:可以是列表(按顺序返回)、函数、异常
m = Mock()
m.side_effect = [1, 2, 3]   # 第一次返回 1,第二次 2,第三次 3
print(m())   # 1
print(m())   # 2
print(m())   # 3
print(m())   # ❌ StopIteration(列表耗尽)

# side_effect 是函数:返回函数的返回值
m = Mock()
m.side_effect = lambda x: x * 2
print(m(5))   # 10
print(m(7))   # 14

# side_effect 是异常:抛出异常
m = Mock()
m.side_effect = ValueError("出错了")
m()   # ❌ 抛 ValueError

# side_effect 是异常类列表:按顺序抛
m = Mock()
m.side_effect = [ValueError, TypeError]
m()   # ❌ ValueError
m()   # ❌ TypeError

# return_value = None 且 side_effect = 函数返回 None,效果一样
\`\`\`

### MagicMock:支持魔法方法

\`Mock\` 不支持 \`len()\` / \`iter()\` / \`__getitem__\` 等魔法方法,会报错或返回 Mock。用 \`MagicMock\`:

\`\`\`python
from unittest.mock import Mock, MagicMock

m = Mock()
print(len(m))   # ❌ TypeError: object of type 'Mock' has no len()

mm = MagicMock()
print(len(mm))  # 0(MagicMock 默认实现 __len__ 返回 0)
print(bool(mm)) # True(__bool__ 默认 True)
print(list(mm)) # [](__iter__ 默认返回空迭代器)

# 自定义魔法方法的返回值
mm.__len__.return_value = 5
print(len(mm))  # 5

mm.__iter__.return_value = iter([1, 2, 3])
print(list(mm)) # [1, 2, 3]

mm.__getitem__.return_value = "value"
print(mm["any_key"])   # "value"

mm.__contains__.return_value = True
print("x" in mm)       # True
\`\`\`

### 断言调用

\`\`\`python
m = Mock()
m(1, 2)
m(3, 4, key="value")
m.some_method("a")
m.some_method("b")

# 是否被调用过
m.assert_called()                  # ✅ 主 mock 调用过

# 调用次数
assert m.call_count == 2

# 最后一次调用的参数
m.assert_called_once_with(3, 4, key="value")  # ❌ 调用了 2 次,不是 once

# 子方法
m.some_method.assert_called_once()           # ✅ 调用过 1 次
m.some_method.assert_called_with("b")        # ✅ 最后一次是 ("b",)
m.some_method.assert_called_once_with("a")   # ❌ 调用了 2 次,不是 once

# 是否调用过特定参数(不要求是最后一次)
m.some_method.assert_any_call("a")           # ✅ 调用过 ("a",)

# 检查所有调用序列
expected = [call(1, 2), call(3, 4, key="value")]
m.assert_has_calls(expected, any_order=False)
\`\`\`

### 常用断言方法表

| 方法 | 含义 |
|------|------|
| \`assert_called()\` | 至少调用过 1 次 |
| \`assert_called_once()\` | 恰好调用过 1 次 |
| \`assert_not_called()\` | 从未调用过 |
| \`assert_called_with(*args, **kwargs)\` | 最后一次调用参数匹配 |
| \`assert_called_once_with(*args, **kwargs)\` | 恰好 1 次,且参数匹配 |
| \`assert_any_call(*args, **kwargs)\` | 调用过(任意一次)该参数 |
| \`assert_has_calls([call(...), ...])\` | 调用序列包含这些(可指定顺序) |

## 三、patch:临时替换对象

\`Mock\` 创建了假对象,但**真代码里用的还是真对象**。怎么让真代码用我们的 Mock?\`patch\` 来了——它**临时替换**某个对象,测试结束自动恢复。

### patch 的三种用法

**用法1:装饰器**

\`\`\`python
from unittest.mock import patch

# patch 后,被测函数里的 requests.get 会被替换成 Mock
@patch("myapp.requests.get")
def test_get_user(mock_get):
    # mock_get 是 patch 注入的 Mock 对象
    mock_get.return_value.json.return_value = {"name": "Alice"}

    result = get_user(1)   # 调用真函数,但它内部的 requests.get 是假的

    assert result["name"] == "Alice"
    mock_get.assert_called_once_with("https://api.example.com/users/1")
\`\`\`

**用法2:上下文管理器**

\`\`\`python
def test_get_user():
    with patch("myapp.requests.get") as mock_get:
        mock_get.return_value.json.return_value = {"name": "Alice"}
        result = get_user(1)
        assert result["name"] == "Alice"
    # with 块结束,requests.get 自动恢复
\`\`\`

**用法3:手动 start / stop**

\`\`\`python
def test_get_user():
    patcher = patch("myapp.requests.get")
    mock_get = patcher.start()
    try:
        mock_get.return_value.json.return_value = {"name": "Alice"}
        result = get_user(1)
        assert result["name"] == "Alice"
    finally:
        patcher.stop()
\`\`\`

手动方式少用,主要在 \`setUp/tearDown\` 里:

\`\`\`python
class TestXxx(unittest.TestCase):
    def setUp(self):
        self.patcher = patch("myapp.requests.get")
        self.mock_get = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_xxx(self):
        ...
\`\`\`

### patch 的"在哪里 patch"问题(最容易踩的坑)

\`patch\` 的参数是**对象的"路径"**,但不是"定义处",而是"被使用处"。

\`\`\`python
# myapp/api.py
import requests

def get_user(uid):
    return requests.get(f".../{uid}").json()
\`\`\`

\`\`\`python
# test_api.py
# ❌ 错误:patch 的是 requests.get,但 myapp.api 已经 import 了 requests
@patch("requests.get")
def test_get_user(mock_get):
    ...

# ❌ 也错:虽然不报错,但 myapp.api 里用的还是真 requests
@patch("requests")
def test_get_user(mock_requests):
    ...

# ✅ 正确:patch myapp.api 模块里的 requests
@patch("myapp.api.requests.get")
def test_get_user(mock_get):
    ...

# ✅ 也可以:
@patch("myapp.api.requests")
def test_get_user(mock_requests):
    mock_requests.get.return_value.json.return_value = {...}
    ...
\`\`\`

**原则**:**patch "被测代码看到的名字",不是"对象定义的地方"**。

\`\`\`text
# myapp/api.py:
from requests import get     ← 这里 from import,myapp.api 模块有了 get 这个名字
def get_user(uid):
    return get(f".../{uid}")

# 正确的 patch:
@patch("myapp.api.get")      ← patch myapp.api 里的 get
def test(mock_get): ...
\`\`\`

### patch.object:patch 类的属性

\`\`\`python
class Database:
    def query(self, sql):
        return real_db.execute(sql)

# patch Database.query
@patch.object(Database, "query")
def test_db(mock_query):
    mock_query.return_value = [{"id": 1}]
    db = Database()
    result = db.query("SELECT *")
    assert result == [{"id": 1}]
\`\`\`

### patch.dict:patch 字典(如 os.environ)

\`\`\`python
@patch.dict("os.environ", {"MY_VAR": "test", "DEBUG": "1"})
def test_with_env():
    import os
    assert os.environ["MY_VAR"] == "test"
    assert os.environ["DEBUG"] == "1"
# 测试结束,os.environ 恢复原样
\`\`\`

### patch 的新对象:new vs new_callable

\`\`\`python
# new:直接指定替换成什么
@patch("myapp.config", new={"debug": True})
def test_xxx():
    ...

# new_callable:指定用哪个类创建 Mock(默认 MagicMock)
@patch("myapp.database", new_callable=MyCustomMock)
def test_xxx(mock_db):
    ...
\`\`\`

## 四、pytest-mock 插件:mocker fixture

虽然 \`unittest.mock\` 够用,但 \`pytest-mock\` 插件提供了更简洁的 \`mocker\` fixture:

\`\`\`bash
pip install pytest-mock
\`\`\`

\`\`\`python
# 不用 mocker:每个测试都 from unittest.mock import patch,还要 with/装饰
def test_old():
    with patch("myapp.requests.get") as mock_get:
        ...

# 用 mocker:简洁
def test_new(mocker):
    mock_get = mocker.patch("myapp.requests.get")
    mock_get.return_value.json.return_value = {"name": "Alice"}
    ...
    # 测试结束自动 stop,无需 with
\`\`\`

\`mocker\` 还提供了一些便捷方法:

\`\`\`python
def test_xxx(mocker):
    # 1. patch
    mock_get = mocker.patch("myapp.requests.get")

    # 2. patch.object
    mocker.patch.object(Database, "query", return_value=[])

    # 3. patch.dict
    mocker.patch.dict("os.environ", {"DEBUG": "1"})

    # 4. spy(不替换,只记录调用)
    spy = mocker.spy(Database, "query")
    Database().query("SELECT 1")
    assert spy.call_count == 1

    # 5. stub(快速创建一个假对象)
    fake = mocker.stub(name="fake")
    fake.return_value = 42
    assert fake() == 42
\`\`\`

## 五、monkeypatch:pytest 内置

pytest 自带 \`monkeypatch\` fixture(无需装插件),提供打补丁功能:

\`\`\`python
import os


def test_setenv(monkeypatch):
    monkeypatch.setenv("MY_VAR", "test")
    assert os.environ["MY_VAR"] == "test"
    # 测试结束自动恢复(删除 MY_VAR)


def test_setattr(monkeypatch):
    class Config:
        debug = False

    monkeypatch.setattr(Config, "debug", True)
    assert Config.debug is True
    # 测试结束恢复原值


def test_delattr(monkeypatch):
    class Config:
        debug = True

    monkeypatch.delattr(Config, "debug")
    assert not hasattr(Config, "debug")
    # 测试结束恢复属性


def test_delenv(monkeypatch):
    monkeypatch.setenv("TEMP_VAR", "x")
    assert "TEMP_VAR" in os.environ
    monkeypatch.delenv("TEMP_VAR")
    assert "TEMP_VAR" not in os.environ
\`\`\`

**monkeypatch 的优势**:测试结束**自动恢复**,不需要手动 \`stop()\`,比 \`patch\` 更简洁。

### monkeypatch vs patch

| 维度 | monkeypatch | patch |
|------|-------------|-------|
| **来源** | pytest 内置 | unittest.mock |
| **语法** | \`monkeypatch.setattr(obj, name, val)\` | \`@patch("path.to.obj")\` |
| **恢复** | 自动 | 自动 |
| **能创建 Mock** | 否(只打补丁) | 是(patch 创建 MagicMock) |
| **适合** | 简单赋值/环境变量 | 需要记录调用、配置返回值 |
| **依赖** | 无 | unittest.mock |

**选择**:**只改值用 monkeypatch,需要断言调用用 patch**。

## 六、Mock 的边界:不要 mock 自己

Mock 的黄金法则:**只 mock 依赖,不 mock 被测代码本身**。

\`\`\`text
被测代码 ──调用──► 依赖 A ──► 依赖 B
   ↑                   ↑
   │                   │
  不 mock             mock 这里

正确:mock 依赖 A,测试"被测代码在 A 返回 X 时的行为"
错误:mock 被测代码,那你在测啥?测 mock 吗?
\`\`\`

### 反例:mock 被测代码

\`\`\`python
# ❌ 错误:mock 了被测的 UserService
class UserService:
    def register(self, name):
        return self._save(name)

    def _save(self, name):
        # 真实保存逻辑
        ...

# 测试时 mock 了 _save,那 register 的真实行为你根本没测
@patch.object(UserService, "_save")
def test_register(mock_save):
    service = UserService()
    service.register("Alice")
    mock_save.assert_called_once_with("Alice")
    # ❌ 你只验证了"调用了 _save",没验证 register 的业务逻辑
\`\`\`

### 正例:mock 依赖

\`\`\`python
# ✅ 正确:mock 依赖(UserRepo),测被测代码(UserService)
class UserService:
    def __init__(self, repo):
        self.repo = repo

    def register(self, name):
        if not name:
            raise ValueError("名字不能为空")
        return self.repo.save(name)

def test_register_calls_repo_save():
    mock_repo = Mock()
    service = UserService(mock_repo)   # 依赖注入
    service.register("Alice")
    mock_repo.save.assert_called_once_with("Alice")

def test_register_empty_name_raises():
    mock_repo = Mock()
    service = UserService(mock_repo)
    with pytest.raises(ValueError):
        service.register("")
    mock_repo.save.assert_not_called()   # 空名字不该调 repo
\`\`\`

### Mock 的"度"

| 该 mock | 不该 mock |
|---------|-----------|
| 外部 API(requests) | 被测函数本身 |
| 数据库连接 | 纯函数 / 数据类 |
| 文件系统(如需要) | 简单工具函数 |
| 时间(datetime.now) | 标准库的 json/re 等 |
| 随机数(random) | 被测代码的业务逻辑 |
| 发邮件 / 发短信 | 数据结构(dict/list 操作) |

**经验**:**mock 边界(依赖),不 mock 内部(实现)**。如果发现要 mock 被测代码的私有方法,通常是设计有问题——把私有方法拆成独立的类/函数,然后 mock 那个新依赖。

## 七、demo:Mock 一个外部 API 请求

\`\`\`python
# weather.py
import requests


class WeatherService:
    def __init__(self, api_url="https://api.weather.com"):
        self.api_url = api_url

    def get_temp(self, city):
        response = requests.get(f"{self.api_url}/{city}")
        if response.status_code != 200:
            raise ValueError(f"获取天气失败: {response.status_code}")
        data = response.json()
        return data["temp"]


# test_weather.py
import pytest
from unittest.mock import patch
from weather import WeatherService


class TestGetTemp:
    @patch("weather.requests.get")
    def test_get_temp_success(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"temp": 25, "city": "Beijing"}

        service = WeatherService()
        temp = service.get_temp("Beijing")

        assert temp == 25
        mock_get.assert_called_once_with("https://api.weather.com/Beijing")

    @patch("weather.requests.get")
    def test_get_temp_not_found_raises(self, mock_get):
        mock_get.return_value.status_code = 404

        service = WeatherService()
        with pytest.raises(ValueError, match="获取天气失败: 404"):
            service.get_temp("UnknownCity")

    @patch("weather.requests.get")
    def test_get_temp_network_error(self, mock_get):
        mock_get.side_effect = ConnectionError("网络断开")

        service = WeatherService()
        with pytest.raises(ConnectionError):
            service.get_temp("Beijing")
\`\`\`

**亮点**:
- 不发真实请求,测试秒级完成
- 能模拟 200/404/网络异常三种场景,真实 API 测不全
- 验证了"调用了正确的 URL"

## 八、demo:Mock 数据库查询

\`\`\`python
# user_service.py
class UserService:
    def __init__(self, db):
        self.db = db

    def get_user_name(self, user_id):
        row = self.db.fetchone("SELECT name FROM users WHERE id=?", (user_id,))
        if row is None:
            return None
        return row["name"]


# test_user_service.py
from unittest.mock import Mock
from user_service import UserService


def test_get_user_name_found():
    mock_db = Mock()
    mock_db.fetchone.return_value = {"name": "Alice"}

    service = UserService(mock_db)
    assert service.get_user_name(1) == "Alice"
    mock_db.fetchone.assert_called_once_with(
        "SELECT name FROM users WHERE id=?", (1,)
    )


def test_get_user_name_not_found():
    mock_db = Mock()
    mock_db.fetchone.return_value = None

    service = UserService(mock_db)
    assert service.get_user_name(999) is None
\`\`\`

**亮点**:
- 不连真实数据库,毫秒级完成
- 容易模拟"用户不存在"(返回 None),真实 DB 要先删用户
- 验证了 SQL 和参数正确

## 九、demo:Mock 时间

测试"昨天""今天""过期"等时间相关逻辑时,\`datetime.now()\` 是大坑——结果随当前时间变,测试不稳定。

\`\`\`python
# token.py
from datetime import datetime, timedelta


class Token:
    def __init__(self, expires_in_seconds):
        self.created_at = datetime.now()
        self.expires_at = self.created_at + timedelta(seconds=expires_in_seconds)

    def is_expired(self):
        return datetime.now() >= self.expires_at


# test_token.py
from datetime import datetime, timedelta
from unittest.mock import patch
from token import Token


@patch("token.datetime")
def test_token_not_expired(mock_datetime):
    fixed_now = datetime(2026, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = fixed_now
    mock_datetime.side_effect = lambda *a, **kw: datetime(*a, **kw)

    token = Token(expires_in_seconds=3600)
    assert token.is_expired() is False


@patch("token.datetime")
def test_token_expired(mock_datetime):
    start = datetime(2026, 1, 1, 12, 0, 0)
    mock_datetime.now.return_value = start
    mock_datetime.side_effect = lambda *a, **kw: datetime(*a, **kw)

    token = Token(expires_in_seconds=3600)
    mock_datetime.now.return_value = start + timedelta(hours=2)
    assert token.is_expired() is True
\`\`\`

**亮点**:
- 时间被"冻结"在固定点,测试可重复
- 能模拟"时间流逝",测过期逻辑无需真等

### freezegun 插件(更优雅的时间 mock)

\`\`\`bash
pip install freezegun
\`\`\`

\`\`\`python
from freezegun import freeze_time


@freeze_time("2026-01-01 12:00:00")
def test_token_not_expired():
    token = Token(expires_in_seconds=3600)
    assert token.is_expired() is False


@freeze_time("2026-01-01 12:00:00")
def test_token_expired():
    token = Token(expires_in_seconds=3600)
    with freeze_time("2026-01-01 14:00:00"):
        assert token.is_expired() is True
\`\`\`

\`freezegun\` 比 \`patch("datetime")\` 简洁得多,推荐时间相关测试用 \`freezegun\`。

## 十、Mock 工具对比表

| 工具 | 来源 | 作用 | 典型场景 |
|------|------|------|----------|
| \`Mock\` | unittest.mock | 通用 mock 对象,记录调用 | 创建假依赖对象 |
| \`MagicMock\` | unittest.mock | Mock + 魔法方法 | 需要支持 \`len()\`/\`[]\` 等 |
| \`patch\` | unittest.mock | 临时替换对象 | 替换 requests.get 等 |
| \`patch.object\` | unittest.mock | patch 类的属性 | 替换 Database.query |
| \`patch.dict\` | unittest.mock | patch 字典 | 替换 os.environ |
| \`monkeypatch\` | pytest 内置 | 打补丁(setattr/setenv) | 简单赋值,无需断言调用 |
| \`mocker\` | pytest-mock 插件 | patch 的便捷封装 | pytest 项目的首选 |
| \`freezegun\` | 第三方 | 冻结时间 | 时间相关逻辑测试 |
| \`spec\` 参数 | unittest.mock | 限制 mock 只能访问真实属性 | 防止拼错方法名 |

### spec:防止拼错方法名

\`\`\`python
class Database:
    def query(self, sql): ...

# 没 spec:任何方法都能调,拼错不报错
mock_db = Mock()
mock_db.qery("SELECT 1")   # 拼错了,但不报错!测试会"假绿"

# 有 spec:只能访问真实存在的方法
mock_db = Mock(spec=Database)
mock_db.qery("SELECT 1")   # ❌ AttributeError,拼写错误立刻暴露
mock_db.query("SELECT 1")  # ✅
\`\`\`

**建议**:**mock 依赖时尽量加 \`spec=RealClass\`**,防止拼写错误导致测试假绿。

## 十一、本章小结

| 要点 | 内容 |
|------|------|
| **为什么 Mock** | 隔离依赖,让测试快、稳、可重复 |
| **Mock** | 通用 mock 对象,配置 return_value/side_effect |
| **MagicMock** | 支持魔法方法(\`__len__\` 等) |
| **patch** | 临时替换对象,装饰器/上下文/手动三种用法 |
| **patch 路径** | patch "被测代码看到的名字",不是"定义处" |
| **monkeypatch** | pytest 内置,自动恢复,适合简单赋值 |
| **freezegun** | 冻结时间,测时间相关逻辑 |
| **Mock 边界** | 只 mock 依赖,不 mock 被测代码本身 |
| **spec** | 限制 mock 只能访问真实属性,防止拼错 |

## 十二、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ patch 路径写"定义处" | patch 原模块 | patch "被测代码 import 的名字"(被使用处) |
| ❌ Mock 用 return_value 配置方法 | mock.return_value = x 就行 | 方法要 mock.method.return_value,主对象才用 return_value |
| ❌ side_effect 列表用完了报错 | 一直循环 | 列表耗尽抛 StopIteration,要补够长度 |
| ❌ side_effect 函数抛异常要 return | 用 return 抛 | 函数里 raise,side_effect 会传播异常 |
| ❌ MagicMock 等于 Mock | 完全一样 | MagicMock 支持魔法方法,Mock 不支持 |
| ❌ mock 被测代码的私有方法 | 简化测试 | 不要 mock 被测代码,只 mock 依赖 |
| ❌ patch 不 stop 会泄漏 | 自动恢复 | 装饰器/with 自动 stop,手动 start 必须 stop |
| ❌ assert_called_once_with 检查所有调用 | 任意一次匹配 | 检查"恰好 1 次且参数匹配" |
| ❌ monkeypatch 能记录调用 | 像 patch | monkeypatch 只改值不记录,要记录用 patch |
| ❌ Mock 时间用 patch("datetime") | 全局替换 | 应 patch "模块.datetime",或用 freezegun |
| ❌ Mock 不加 spec | 灵活点好 | 没 spec 拼错方法名不报错,测试会假绿 |

> **一句话总结**:Mock 是"隔离的艺术"——用假对象替换真依赖,让测试只关注被测代码。核心工具是 \`patch\`(替换对象)和 \`Mock\`(假对象),关键是"patch 被使用处的名字,只 mock 依赖不 mock 自己"。`,
  },

  // =========================================================
  // 第六章:测试最佳实践与策略
  // =========================================================
  {
    id: "pyeng-test-practices",
    icon: "🏆",
    title: "测试最佳实践与策略",
    group: "测试",
    content: `## 一、测试结构:Arrange-Act-Assert(3A)

好的测试有清晰的三段结构,前面章节已介绍 3A 模式,这里强调几个细节:

\`\`\`python
def test_discount():
    # Arrange:准备
    cart = Cart()
    cart.add(Item("book", 100))
    coupon = Coupon("SAVE20", 0.2)

    # Act:行动(通常就一行)
    total = cart.checkout(coupon)

    # Assert:断言
    assert total == 80
\`\`\`

### 3A 的反模式

**反模式1:多个 Act**

\`\`\`python
# ❌ 一个测试测了多个行为
def test_cart():
    cart = Cart()
    cart.add(Item("book", 100))     # Act 1
    assert cart.total() == 100
    cart.add(Item("pen", 10))       # Act 2
    assert cart.total() == 110
    cart.remove("book")             # Act 3
    assert cart.total() == 10
\`\`\`

应该拆成 \`test_add_item\` / \`test_add_multiple_items\` / \`test_remove_item\` 三个测试。

**反模式2:Act 里有分支**

\`\`\`python
# ❌ 测试里有 if,说明测了多个场景
def test_classify(n):
    result = classify(n)
    if n > 0:
        assert result == "positive"
    elif n < 0:
        assert result == "negative"
    else:
        assert result == "zero"
\`\`\`

应该用参数化拆成三个测试。

**反模式3:断言一堆不相关的**

\`\`\`python
# ❌ 一个测试断言了过多不相关的事
def test_user_creation():
    user = create_user("Alice", "alice@example.com")
    assert user.id > 0
    assert user.name == "Alice"
    assert user.email == "alice@example.com"
    assert user.created_at is not None
    assert user.is_active is True
    assert send_welcome_email.called  # 这跟"创建"无关
\`\`\`

后面的"邮件发送"应该单独测。

## 二、测试命名:test_行为_条件_结果

好的测试名能**不看代码就知道在测什么**。

\`\`\`text
命名公式:test_<被测行为>_<条件>_<预期结果>

例子:
  test_login_with_correct_password_returns_token
  test_login_with_wrong_password_returns_error
  test_login_with_empty_password_raises_value_error
  test_login_when_db_down_raises_connection_error

反例:
  test_login1     ← 1 是啥?
  test_login_ok   ← ok 是啥条件?
  test_login      ← 太泛,看不出测哪个场景
  test_login_test ← 啰嗦
\`\`\`

### 命名的好处

\`\`\`text
测试失败时,CI 输出:
  ✅ test_login_with_correct_password_returns_token PASSED
  ❌ test_login_with_wrong_password_returns_error FAILED
  ✅ test_login_with_empty_password_raises_value_error PASSED

你一眼就知道:密码错的场景挂了。不用打开测试文件看代码。
\`\`\`

### 用参数化让命名更清晰

\`\`\`python
@pytest.mark.parametrize(
    "password,should_succeed",
    [
        ("correct_pass", True),
        ("wrong_pass", False),
        ("", False),
    ],
    ids=["correct_password", "wrong_password", "empty_password"]
)
def test_login(password, should_succeed):
    result = login("alice", password)
    assert result.success is should_succeed
\`\`\`

## 三、FIRST 原则

好的单元测试应该满足 **FIRST** 五原则:

| 字母 | 原则 | 含义 |
|------|------|------|
| **F** | Fast | 快,毫秒级,几千个测试几秒跑完 |
| **I** | Independent | 独立,测试之间不依赖,任意顺序都能跑 |
| **R** | Repeatable | 可重复,任何环境结果一样(不依赖网络/时间) |
| **S** | Self-validating | 自验证,通过/失败不需要人工判断(有 assert) |
| **T** | Timely | 及时,在代码写完后(或之前)立刻写,别拖 |

### Fast(快)

\`\`\`text
慢测试的危害:
  - 提交前不跑 → 失去早期反馈
  - CI 跑 10 分钟 → 改一次等 10 分钟
  - 团队习惯"跳过测试" → 测试形同虚设

如何快:
  - 单元测试 mock 掉数据库/网络
  - 用内存数据库替代真实数据库
  - 避免在测试里 sleep(用 freezegun 推进时间)
  - 把慢测试打 @pytest.mark.slow,日常只跑快的
\`\`\`

### Independent(独立)

\`\`\`python
# ❌ 依赖顺序:test_a 必须在 test_b 前跑
class TestBad:
    def test_a(self):
        self.user = create_user("Alice")   # 创建

    def test_b(self):
        assert self.user.name == "Alice"   # 依赖 test_a 创建的 user

# ✅ 独立:每个测试自己准备
class TestGood:
    @pytest.fixture
    def user(self):
        return create_user("Alice")

    def test_a(self, user):
        assert user.name == "Alice"

    def test_b(self, user):
        assert user.name == "Alice"
\`\`\`

### Repeatable(可重复)

\`\`\`python
# ❌ 不可重复:依赖当前时间
def test_greeting():
    hour = datetime.now().hour
    if hour < 12:
        assert greeting() == "早上好"
    else:
        assert greeting() == "下午好"
# 半夜跑和中午跑结果不一样!

# ✅ 可重复:冻结时间
@freeze_time("2026-01-01 08:00:00")
def test_morning_greeting():
    assert greeting() == "早上好"
\`\`\`

### Self-validating(自验证)

\`\`\`python
# ❌ 不自验证:只调用,不断言
def test_bad():
    result = compute(1, 2)
    # 没 assert,compute 返回啥都"通过"

# ✅ 自验证:有明确断言
def test_good():
    result = compute(1, 2)
    assert result == 3
\`\`\`

### Timely(及时)

\`\`\`text
及时写测试:
  写代码当下 → 写测试,5 分钟
  一周后补测试 → 要回忆逻辑,30 分钟
  三个月后补测试 → 早就忘了,2 小时
  上线后出 bug 才补 → 已经造成损失

代码和测试应该"同时出生",别让代码"裸奔"太久。
\`\`\`

## 四、测试什么:四个维度

### 1. 正常路径(Happy Path)

最常用的场景,输入合法,期望正常输出。

\`\`\`python
def test_add_positive_numbers():
    assert add(2, 3) == 5
\`\`\`

### 2. 边界值

边界是最容易出 bug 的地方:0、空、最大、最小、临界。

\`\`\`python
@pytest.mark.parametrize("a,b,expected", [
    (0, 0, 0),       # 都为零
    (0, 1, 1),       # 一个为零
    (1, 0, 1),
    (-1, 1, 0),      # 正负相加
    (999999, 1, 1000000),  # 大数
])
def test_add_boundaries(a, b, expected):
    assert add(a, b) == expected
\`\`\`

### 3. 异常路径

错误输入、依赖失败,应该抛特定异常。

\`\`\`python
def test_add_invalid_type_raises():
    with pytest.raises(TypeError):
        add("a", 1)

def test_divide_by_zero_raises():
    with pytest.raises(ValueError):
        divide(1, 0)
\`\`\`

### 4. 等价类划分

把输入分成"等价类",每类测一个代表即可。

\`\`\`text
分类函数 classify_age(age):
  等价类:
    - 负数(无效): -1, -100
    - 0(边界): 0
    - 1-17(未成年): 5, 15
    - 18-64(成年): 30, 60
    - 65+(老年): 70, 100
    - 150+(无效): 200

  每类测 1-2 个代表值,不必穷举。
\`\`\`

\`\`\`python
@pytest.mark.parametrize("age,expected", [
    (-1, "invalid"),
    (0, "infant"),
    (10, "minor"),
    (30, "adult"),
    (70, "senior"),
    (200, "invalid"),
])
def test_classify_age(age, expected):
    assert classify_age(age) == expected
\`\`\`

## 五、测试策略

### 1. 测试金字塔:多单元少 E2E

\`\`\`text
        E2E(5%)        ← 慢、脆、贵
      集成(20%)
    单元(75%)          ← 快、稳、廉

错误:倒金字塔(全是 E2E)
  - 跑一次 10 分钟,没人跑
  - 一个 UI 改动挂一片

正确:正金字塔(单元为主)
  - 单元秒级跑完,提交前必跑
  - E2E 只测核心流程,每天跑一次
\`\`\`

### 2. 测公共 API,不测私有方法

\`\`\`python
class User:
    def __init__(self, name):
        self._name = name   # 私有

    def get_display_name(self):    # 公共
        return self._format_name(self._name)

    def _format_name(self, name):  # 私有
        return name.strip().title()

# ❌ 不要直接测 _format_name(私有)
def test_format_name():
    user = User("alice")
    assert user._format_name("alice") == "Alice"

# ✅ 通过公共 API 测
def test_get_display_name():
    user = User("  alice  ")
    assert user.get_display_name() == "Alice"
\`\`\`

**理由**:私有方法是**实现细节**,会随重构变化。公共 API 是**契约**,稳定。测私有方法,一重构测试就挂,反而阻碍重构。

### 3. 测行为不测实现

\`\`\`python
class Stack:
    def __init__(self):
        self._items = []   # 实现:用 list

    def push(self, x):
        self._items.append(x)

    def pop(self):
        return self._items.pop()

# ❌ 测实现:耦合了内部数据结构
def test_push_uses_list():
    s = Stack()
    s.push(1)
    assert s._items == [1]   # 万一改成 deque,测试就挂

# ✅ 测行为:只关心"压入弹出"的对外行为
def test_push_pop_lifo():
    s = Stack()
    s.push(1)
    s.push(2)
    assert s.pop() == 2   # 后进先出
    assert s.pop() == 1
\`\`\`

**理由**:实现会变(优化、重构),行为不该变。测行为,重构时测试稳;测实现,一重构测试全挂。

### 4. 不要追求 100% 覆盖率

\`\`\`text
适合 100% 覆盖:
  - 核心业务逻辑(订单、支付、权限)
  - 工具函数(纯函数)
  - 算法实现

不必 100% 覆盖:
  - 异常处理里"不该发生"的分支
  - 平台特定代码(只在 Linux/Windows 跑)
  - 防御性代码(防御理论上不可能的情况)
  - 第三方库的兼容性分支

性价比:70-80% 覆盖率,核心逻辑 90%+,边缘代码可低。
\`\`\`

## 六、测试坏味道

测试代码也是代码,也会有"坏味道"。识别并消除它们,测试才能维护。

### 坏味道1:测试依赖顺序

\`\`\`python
# ❌ test_a 必须先跑,test_b 才能过
class TestBad:
    def test_a(self):
        self.created_id = create_user("Alice")

    def test_b(self):
        assert get_user(self.created_id).name == "Alice"
# 单独跑 test_b 会 AttributeError

# ✅ 每个测试独立
class TestGood:
    def test_create_and_get(self):
        user_id = create_user("Alice")
        assert get_user(user_id).name == "Alice"
\`\`\`

### 坏味道2:测试互相依赖

\`\`\`python
# ❌ test_a 改了全局,test_b 依赖
GLOBAL_COUNTER = 0

def test_a():
    global GLOBAL_COUNTER
    GLOBAL_COUNTER += 1

def test_b():
    assert GLOBAL_COUNTER == 1   # 依赖 test_a 跑过
\`\`\`

### 坏味道3:测试里有分支(if)

\`\`\`python
# ❌ 测试里有 if,说明测了多个场景
def test_classify(n):
    result = classify(n)
    if n > 0:
        assert result == "positive"
    else:
        assert result == "non-positive"

# ✅ 参数化拆开
@pytest.mark.parametrize("n,expected", [(1, "positive"), (-1, "non-positive")])
def test_classify(n, expected):
    assert classify(n) == expected
\`\`\`

### 坏味道4:断言一堆不相关的事

\`\`\`python
# ❌ 一个测试断言了创建+查询+邮件+日志
def test_user_creation():
    user = create_user(...)
    assert user.id > 0
    assert get_user(user.id) is not None
    assert email_sent()
    assert log_written()
# 失败时不知道是哪个环节挂了

# ✅ 拆成多个测试
def test_create_returns_user():
    ...
def test_created_user_can_be_fetched():
    ...
def test_create_sends_email():
    ...
\`\`\`

### 坏味道5:测试需要外部状态

\`\`\`python
# ❌ 依赖文件系统里的特定文件
def test_read_config():
    config = read_config("/etc/myapp/config.json")   # 这台机器才有
# 换台机器就挂

# ✅ 用 fixture 准备
def test_read_config(tmp_path):
    config_file = tmp_path / "config.json"
    config_file.write_text('{"debug": true}')
    config = read_config(str(config_file))
    assert config["debug"] is True
\`\`\`

### 坏味道速查表

| 坏味道 | 症状 | 解法 |
|--------|------|------|
| 依赖顺序 | 单独跑某个测试挂 | 每个测试用 fixture 自备数据 |
| 互相依赖 | 跑 A 才能跑 B | 消除全局状态,用 fixture 隔离 |
| 测试有 if | 测试里有分支逻辑 | 参数化拆成多个测试 |
| 断言过多 | 一个测试 10+ assert | 按行为拆成多个测试 |
| 外部状态 | 依赖特定文件/环境 | 用 tmp_path / fixture 准备 |
| 巨型测试 | 一个测试 100+ 行 | 拆成小测试,提取 helper |
| 魔法数字 | assert x == 42(42 哪来的) | 用命名常量或注释说明 |
| 测私有方法 | 调用 _xxx | 通过公共 API 间接测 |

## 七、覆盖率工具:coverage.py / pytest-cov

### 行覆盖 vs 分支覆盖

\`\`\`python
def classify(n):
    if n > 0:           # 行1
        return "pos"    # 行2
    return "non-pos"    # 行3
\`\`\`

- **行覆盖**:测 \`classify(1)\` 跑过行1、2。覆盖率 2/3 = 67%
- **分支覆盖**:必须同时测 \`n > 0\` 和 \`n <= 0\` 两条分支,才算 100%

### 用 pytest-cov

\`\`\`bash
pip install pytest-cov

# 跑测试并统计覆盖率
pytest --cov=myapp --cov-report=term-missing

# 输出:
# Name                 Stmts   Miss  Branch   BrMiss   Cover   Missing
# ------------------------------------------------------------------
# myapp/calc.py            8      1      4       1     88%   12, 15->17
# myapp/users.py          20      5      8       2     72%   23-28
# ------------------------------------------------------------------
# TOTAL                   28      6     12       3     76%

# Missing 列告诉你哪几行没覆盖,精准补测

# 生成 HTML 报告(可视化)
pytest --cov=myapp --cov-report=html
# 打开 htmlcov/index.html,红色行没覆盖,绿色行覆盖了
\`\`\`

### 常用覆盖率命令

\`\`\`bash
# 只统计某些包
pytest --cov=myapp.core --cov=myapp.api

# 启用分支覆盖
pytest --cov=myapp --cov-branch

# 覆盖率低于阈值则失败(CI 用)
pytest --cov=myapp --cov-fail-under=80

# 多种报告同时输出
pytest --cov=myapp --cov-report=term --cov-report=html --cov-report=xml
\`\`\`

### .coveragerc 配置

\`\`\`ini
# .coveragerc
[run]
source = myapp
branch = True

[report]
# 排除测试文件和迁移文件
omit =
    */tests/*
    */migrations/*
    */__init__.py

# 排除某些"不需要覆盖"的行
exclude_lines =
    pragma: no cover
    if __name__ == .__main__.:
    raise NotImplementedError
    if TYPE_CHECKING:

# 阈值
fail_under = 80
\`\`\`

## 八、CI 中集成测试

CI(持续集成)里,测试是"守门员"——提交代码自动跑测试,不过则阻止合并。

### GitHub Actions 示例

\`\`\`yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: 安装依赖
        run: pip install -e ".[dev]"
      - name: 跑测试 + 覆盖率
        run: |
          pytest --cov=myapp --cov-branch --cov-fail-under=80 --cov-report=xml
      - name: 上传覆盖率到 Codecov
        uses: codecov/codecov-action@v3
\`\`\`

### CI 测试策略

\`\`\`text
提交前(本地):
  pytest -x --ff          # 失败就停,先跑上次失败的

Push 时(CI):
  pytest --cov --cov-fail-under=80   # 全量 + 覆盖率门槛

每日(nightly):
  pytest -m "slow"        # 跑慢测试
  pytest tests/e2e/       # 跑 E2E
\`\`\`

### 常用 CI 门槛

| 门槛 | 命令 | 作用 |
|------|------|------|
| 全测试通过 | \`pytest\` | 阻止有 bug 的代码合并 |
| 覆盖率门槛 | \`--cov-fail-under=80\` | 阻止覆盖率下降 |
| 无 lint 错误 | \`ruff check .\` | 阻止风格问题 |
| 类型检查 | \`mypy myapp\` | 阻止类型错误 |

## 九、完整 demo:一个小项目的测试

把本章知识综合,测一个购物车模块。

### 被测代码

\`\`\`python
# cart.py
from dataclasses import dataclass, field


@dataclass
class Item:
    name: str
    price: float
    quantity: int = 1

    @property
    def subtotal(self) -> float:
        return self.price * self.quantity


class Cart:
    def __init__(self):
        self._items: list[Item] = []

    def add(self, item: Item) -> None:
        if item.price < 0:
            raise ValueError("价格不能为负")
        if item.quantity <= 0:
            raise ValueError("数量必须为正")
        # 同名商品合并
        for existing in self._items:
            if existing.name == item.name:
                existing.quantity += item.quantity
                return
        self._items.append(item)

    def remove(self, name: str) -> None:
        for i, item in enumerate(self._items):
            if item.name == name:
                self._items.pop(i)
                return
        raise KeyError(f"商品 {name} 不在购物车")

    def total(self) -> float:
        return sum(item.subtotal for item in self._items)

    def item_count(self) -> int:
        return sum(item.quantity for item in self._items)

    def is_empty(self) -> bool:
        return len(self._items) == 0
\`\`\`

### 测试代码(综合最佳实践)

\`\`\`python
# test_cart.py
import pytest
from cart import Item, Cart


@pytest.fixture
def cart():
    """每个测试一个空购物车。"""
    return Cart()


@pytest.fixture
def cart_with_items(cart):
    """预置两个商品的购物车。"""
    cart.add(Item("book", 50, 2))
    cart.add(Item("pen", 10, 3))
    return cart


class TestAdd:
    def test_add_single_item(self, cart):
        cart.add(Item("book", 50))
        assert cart.item_count() == 1
        assert cart.total() == 50

    def test_add_multiple_different_items(self, cart):
        cart.add(Item("book", 50))
        cart.add(Item("pen", 10))
        assert cart.item_count() == 2

    def test_add_same_item_merges_quantity(self, cart):
        cart.add(Item("book", 50, 2))
        cart.add(Item("book", 50, 3))
        assert cart.item_count() == 5   # 合并后 5 本
        assert cart.total() == 250

    @pytest.mark.parametrize("price,quantity", [
        (-1, 1),    # 负价格
        (0, 1),     # 零价格(边界,假设允许)
        (10, 0),    # 零数量
        (10, -1),   # 负数量
    ])
    def test_add_invalid_raises(self, cart, price, quantity):
        if price < 0 or quantity <= 0:
            with pytest.raises(ValueError):
                cart.add(Item("x", price, quantity))


class TestRemove:
    def test_remove_existing(self, cart_with_items):
        cart_with_items.remove("book")
        assert cart_with_items.item_count() == 3   # 只剩 3 支笔

    def test_remove_nonexistent_raises(self, cart):
        with pytest.raises(KeyError, match="不存在"):
            cart.remove("ghost")


class TestTotal:
    def test_empty_cart_total_zero(self, cart):
        assert cart.total() == 0

    def test_total_sums_subtotals(self, cart_with_items):
        # book: 50*2=100, pen: 10*3=30, total=130
        assert cart_with_items.total() == 130


class TestIsEmpty:
    def test_empty_cart_is_empty(self, cart):
        assert cart.is_empty() is True

    def test_cart_with_items_not_empty(self, cart_with_items):
        assert cart_with_items.is_empty() is False
\`\`\`

### 跑测试 + 覆盖率

\`\`\`bash
$ pytest test_cart.py --cov=cart --cov-branch --cov-report=term-missing -v

test_cart.py::TestAdd::test_add_single_item PASSED
test_cart.py::TestAdd::test_add_multiple_different_items PASSED
test_cart.py::TestAdd::test_add_same_item_merges_quantity PASSED
test_cart.py::TestAdd::test_add_invalid_raises[-1-1] PASSED
test_cart.py::TestAdd::test_add_invalid_raises[10-0] PASSED
test_cart.py::TestAdd::test_add_invalid_raises[10--1] PASSED
test_cart.py::TestRemove::test_remove_existing PASSED
test_cart.py::TestRemove::test_remove_nonexistent_raises PASSED
test_cart.py::TestTotal::test_empty_cart_total_zero PASSED
test_cart.py::TestTotal::test_total_sums_subtotals PASSED
test_cart.py::TestIsEmpty::test_empty_cart_is_empty PASSED
test_cart.py::TestIsEmpty::test_cart_with_items_not_empty PASSED

---------- coverage: platform darwin, python 3.11.0-final-0 -----------
Name      Stmts   Miss  Branch   BrMiss   Cover   Missing
---------------------------------------------------------
cart.py      22      0      10       0    100%
---------------------------------------------------------
TOTAL        22      0      10       0    100%

========================== 12 passed in 0.03s ==========================
\`\`\`

### 这个 demo 体现的最佳实践

| 实践 | 体现 |
|------|------|
| **3A 模式** | 每个测试:准备(fixture)→ 行动(cart.add)→ 断言 |
| **命名清晰** | \`test_add_same_item_merges_quantity\` 一看就懂 |
| **FIRST 原则** | 快(0.03s)、独立(fixture 隔离)、可重复(无外部依赖) |
| **测试金字塔** | 全是单元测试,无 E2E |
| **测行为不测实现** | 没断言 \`cart._items\`,只断言 \`total()\`/\`item_count()\` |
| **测公共 API** | 没测 \`_items\` 私有属性 |
| **边界值** | 零价格、零数量、负数都测了 |
| **参数化** | \`test_add_invalid_raises\` 一组测多个异常 |
| **fixture 隔离** | 每个 test class 用独立 fixture |
| **100% 覆盖** | 简单模块,值得全覆盖 |

## 十、测试反模式 vs 正确做法

写测试时,初学者常陷入一些"看起来在测试,实际上没价值"的陷阱。下表把常见反模式和正确做法并列,方便对照检查自己的测试代码。

### 反模式总览

| ❌ 反模式 | 表现 | 危害 | ✅ 正确做法 |
|----------|------|------|------------|
| **冰激凌测试** | 测试覆盖率 100%,但全是 \`assertTrue(True)\` | 数字漂亮但无价值,bug 依然漏 | 测真正有价值的断言,覆盖核心路径与边界 |
| **测私有方法** | \`tester._internal_helper()\` 直接调私有方法 | 实现一改测试就废,耦合死 | 测公共 API,让私有方法通过公共路径被间接覆盖 |
| **断言写死实现** | \`assert len(obj._items) == 3\` 检查内部结构 | 重构必坏测试 | 断言公共行为结果,如 \`assert obj.total() == 30\` |
| **测试间依赖** | test_b 依赖 test_a 创建的数据 | 顺序一改就崩,无法单独跑 | 每个测试独立 fixture,互不依赖 |
| **过度 Mock** | 把被测对象的 90% 都 Mock 掉 | 测的是 Mock 不是代码 | 只 Mock 外部依赖(网络/数据库/时间),内部逻辑用真东西 |
| **测试逻辑复杂** | 测试里有 for/if/try | 测试本身可能有 bug | 测试代码要简单直白,复杂逻辑用 parametrize 拆开 |
| **无意义的断言** | \`assert result is not None\` 检查得太弱 | 通过了但功能可能错 | 精确断言: \`assert result == {"id": 1, "name": "x"}\` |
| **共享可变状态** | 多个测试改同一个全局变量 | 顺序敏感,偶发失败 | 用 fixture 生成独立副本,用 \`monkeypatch\` 临时改 |
| **测试输出** | 测试里写 \`print\` 看结果 | 没人看输出,等于没断言 | 用 \`capsys\` 抓输出并断言,或干脆删掉 print |
| **跳过的测试** | \`@pytest.mark.skip\` 一堆 | 假装有测试,实则裸奔 | 修好或删掉,跳过的测试必须有期限 |
| **巨无霸测试** | 一个测试函数 200 行,断言 20 件事 | 失败时定位困难 | 一个测试断言一件事,失败信息精准 |
| **测试生产代码** | 测试里 import 生产模块的私有辅助 | 测试和生产耦合 | 测试只用公共 API,辅助逻辑自己造 |

### 反模式详解:测私有方法

最常见的反模式之一是直接测私有方法。看个例子:

\`\`\`python
# ❌ 反例:直接测私有方法
class PriceCalculator:
    def calculate(self, order):
        subtotal = self._compute_subtotal(order)
        discount = self._apply_discount(subtotal, order.coupon)
        return subtotal - discount

    def _compute_subtotal(self, order):
        return sum(item.price * item.qty for item in order.items)

    def _apply_discount(self, subtotal, coupon):
        return subtotal * coupon.rate if coupon else 0


# 反例测试:直接调 _compute_subtotal
def test_compute_subtotal():
    calc = PriceCalculator()
    order = Order([Item(10, 2), Item(5, 3)])
    assert calc._compute_subtotal(order) == 35   # ❌ 测私有方法
\`\`\`

**为什么不推荐**:

1. **重构即坏**:\`_compute_subtotal\` 是内部实现,改名/合并/拆分都让测试失效。
2. **测不到组合**:\`calculate\` 调用了 \`_compute_subtotal\` 和 \`_apply_discount\`,只测私有方法等于没测主流程。
3. **违背封装**:私有方法是实现细节,本不该暴露给外部。

\`\`\`python
# ✅ 正例:通过公共 API 测
def test_calculate_without_coupon():
    calc = PriceCalculator()
    order = Order([Item(10, 2), Item(5, 3)])
    assert calc.calculate(order) == 35   # 测公共方法

def test_calculate_with_coupon():
    calc = PriceCalculator()
    order = Order([Item(10, 2)], coupon=Coupon(0.1))
    assert calc.calculate(order) == 18   # 20 - 2 = 18
\`\`\`

这样测,内部实现怎么重构都不影响测试,只要对外行为对就行。

### 反模式详解:测试间依赖

\`\`\`python
# ❌ 反例:测试间共享状态
created_user_id = None   # 全局变量

def test_create_user():
    global created_user_id
    user = create_user("alice")
    created_user_id = user.id
    assert user.name == "alice"

def test_get_user():   # 依赖 test_create_user 先跑
    user = get_user(created_user_id)   # ❌ 依赖前一个测试
    assert user.name == "alice"
\`\`\`

**危害**:

- 单跑 \`test_get_user\` 会失败(\`created_user_id\` 还是 None)。
- 并行跑会乱套。
- 改测试顺序就崩。

\`\`\`python
# ✅ 正例:每个测试独立
import pytest

@pytest.fixture
def created_user():
    return create_user("alice")

def test_create_user(created_user):
    assert created_user.name == "alice"

def test_get_user(created_user):
    user = get_user(created_user.id)
    assert user.name == "alice"
\`\`\`

每个测试都通过 fixture 拿到独立的 \`created_user\`,互不依赖,顺序无关。

### 反模式详解:过度 Mock

\`\`\`python
# ❌ 反例:连被测对象本身都 Mock 了
def test_order_process():
    mock_order = Mock()
    mock_order.process.return_value = "done"
    result = mock_order.process()   # ❌ 这测的是 Mock 不是 Order!
    assert result == "done"
\`\`\`

这个测试毫无价值——它只验证了 \`Mock.process\` 返回我们设的值,完全没测 \`Order\` 类的逻辑。

\`\`\`python
# ✅ 正例:只 Mock 外部依赖
def test_order_process(mocker):
    mocker.patch("emailer.send", return_value=True)   # 只 Mock 邮件
    order = Order(items=[...])   # 真实的 Order
    result = order.process()      # 真实的 process
    assert result.status == "completed"
    assert emailer.send.call_count == 1   # 验证副作用
\`\`\`

被测对象必须是真的,只 Mock "外部世界"(网络、数据库、时间、第三方服务)。

## 十一、CI 集成:让测试自动跑

测试光在本地跑还不够,**CI(持续集成)** 才是测试的护城河。每个 PR、每次 push 都自动跑测试,失败就不让合并,才能真正保证质量。

### GitHub Actions 集成示例

\`\`\`yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.9", "3.10", "3.11", "3.12"]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -e ".[dev]"

      - name: Run tests with coverage
        run: |
          pytest --cov=src --cov-branch --cov-report=xml --cov-report=term

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        if: matrix.python-version == '3.11'

      - name: Fail if coverage < 80%
        run: |
          coverage report --fail-under=80
\`\`\`

### 关键设计点

| 设计 | 原因 |
|------|------|
| **多版本矩阵** | Python 3.9~3.12 都跑,提前发现版本兼容问题 |
| **\`pip install -e ".[dev]"\`** | 可编辑安装 + dev 依赖(含 pytest/cov),保证测的是最新代码 |
| **\`--cov-branch\`** | 不只测行覆盖,还测分支覆盖,更严格 |
| **\`--cov-report=xml\`** | 给 Codecov 上传,可视化覆盖率变化 |
| **\`--fail-under=80\`** | 覆盖率低于 80% 直接失败,防止慢慢退化 |
| **PR 触发** | 每次 PR 必跑,合入前保证质量 |

### pre-commit 钩子:本地拦截

CI 是最后一道关,但反馈慢(要 push)。**pre-commit** 在你 \`git commit\` 时就跑,把问题拦在本地。

\`\`\`yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.0
    hooks:
      - id: ruff
        args: [--fix]

  - repo: https://github.com/psf/black
    rev: 24.8.0
    hooks:
      - id: black

  - repo: local
    hooks:
      - id: pytest
        name: pytest
        entry: pytest
        args: ["-x", "--ff", "-q"]
        language: system
        pass_filenames: false
        stages: [commit]
\`\`\`

| 钩子 | 作用 |
|------|------|
| \`ruff --fix\` | 自动修 lint 问题,修不了的报错 |
| \`black\` | 格式化代码,统一风格 |
| \`pytest -x --ff\` | \`-x\` 失败就停;\`--ff\` 先跑上次失败的,快速反馈 |

这样,提交时就会自动跑测试,失败就阻止提交,bug 在本地就被拦下。

## 十二、测试策略:不同场景不同打法

不是所有代码都该用同一种测试方式。不同场景的测试策略也不同。

| 场景 | 推荐策略 | 关键点 |
|------|----------|--------|
| **纯函数库** | 大量单元测试 + 参数化 | 无副作用,容易 100% 覆盖 |
| **Web 应用** | 单元测试服务层 + 集成测试 API | 接口契约用 contract test |
| **数据处理脚本** | 测输入输出快照 + 小数据集 | 用 \`pytest\` \`tmp_path\` 造临时文件 |
| **CLI 工具** | 用 \`CliRunner\` 测命令行 | 测 exit code 和 stdout |
| **机器学习** | 测数据预处理 + 模型接口 | 模型本身用小数据验证流程,不验证精度 |
| **数据库应用** | 用 testcontainers 起真 DB | 不要 Mock DB,Mock 会让测试失真 |
| **第三方 API 集成** | 用 VCR.py 录制 HTTP 请求 | 一次录制,离线回放 |
| **遗留代码** | 测"现状行为"做安全网 | 不追求覆盖率,先建立回归基线 |

### 数据处理脚本的测试

\`\`\`python
# 处理 CSV 的脚本
import pandas as pd

def process_csv(input_path, output_path):
    df = pd.read_csv(input_path)
    df["total"] = df["price"] * df["qty"]
    df.to_csv(output_path, index=False)


# 测试
def test_process_csv(tmp_path):
    # 准备输入
    input_file = tmp_path / "input.csv"
    input_file.write_text("price,qty\\n10,2\\n5,3\\n")

    output_file = tmp_path / "output.csv"

    # 执行
    process_csv(input_file, output_file)

    # 验证
    result = pd.read_csv(output_file)
    assert list(result["total"]) == [20, 15]
\`\`\`

用 \`tmp_path\` 造临时文件,测试结束后自动清理,不污染文件系统。

### CLI 工具的测试(以 click 为例)

\`\`\`python
from click.testing import CliRunner
from mycli import cli

def test_cli_greet():
    runner = CliRunner()
    result = runner.invoke(cli, ["greet", "--name", "Alice"])
    assert result.exit_code == 0
    assert "Hello, Alice!" in result.output

def test_cli_greet_no_name():
    runner = CliRunner()
    result = runner.invoke(cli, ["greet"])
    assert result.exit_code != 0   # 缺参数应该报错
\`\`\`

\`CliRunner\` 模拟命令行调用,既能测逻辑也能测参数解析。

## 十三、本章小结

| 要点 | 内容 |
|------|------|
| **3A 模式** | Arrange-Act-Assert,每段职责清晰 |
| **命名** | \`test_行为_条件\`,失败时一眼定位 |
| **FIRST 原则** | Fast/Independent/Repeatable/Self-validating/Timely |
| **测什么** | 公共 API、边界值、异常路径、错误信息 |
| **不测什么** | 私有方法、第三方库、简单 getter/setter |
| **测试金字塔** | 单元多、集成少、E2E 极少 |
| **测试坏味道** | 巨无霸、过度 Mock、断言弱、共享状态 |
| **覆盖率** | 是工具不是目标,行+分支覆盖都要看 |
| **CI 集成** | GitHub Actions + 矩阵 + 覆盖率门槛 |
| **pre-commit** | 本地拦截,把问题挡在 push 前 |
| **反模式** | 测私有方法、测试间依赖、过度 Mock、断言实现 |
| **不同场景** | 纯函数/Web/CLI/ML/DB/集成,各有侧重 |

## 十四、易错点小结

| 易错点 | 错误理解 | 正确理解 |
|--------|----------|----------|
| ❌ 100% 覆盖率 = 没 bug | 覆盖率高就万事大吉 | 覆盖率只看"跑没跑",不看断言对不对,可能有死代码被"覆盖"了 |
| ❌ 测试越多越好 | 测试数量是质量指标 | 测试质量比数量重要,100 个低质量测试不如 20 个精准测试 |
| ❌ 测私有方法提高覆盖率 | 私有方法也要测 | 通过公共 API 间接测,否则重构必坏 |
| ❌ Mock 越多越好 | 把所有依赖都 Mock | 只 Mock 外部依赖(网络/DB/时间),内部用真的 |
| ❌ 一个测试断言很多 | 断言越多越全面 | 一个测试一个断言点,失败信息精准 |
| ❌ 测试间共享数据省事 | 复用 fixture 提高效率 | 每个测试独立,共享状态导致顺序依赖 |
| ❌ 跳过的测试留着就行 | 反正不影响 | 跳过的测试是定时炸弹,要么修要么删 |
| ❌ CI 跑过就行 | 绿了就是好 | 还要看覆盖率门槛、多版本矩阵、分支覆盖 |
| ❌ 测试代码不用维护 | 写完就一劳永逸 | 测试也是代码,要重构、要简化、要随生产代码演进 |
| ❌ TDD 一定要先写测试 | 死板遵守 Red-Green-Refactor | TDD 是工具不是教条,适合"想清楚再做"的场景 |
| ❌ 单元测试能替代集成测试 | 全用 Mock 就够了 | 单元测逻辑,集成测组装,两者不能互相替代 |
| ❌ 测试 = QA 的事 | 开发只管写功能 | 开发对自己代码负责,测试是开发的一部分 |
| ❌ 测试代码可以脏 | 反正不是生产代码 | 测试代码也要清晰可读,复杂测试本身可能有 bug |
| ❌ print 看输出就行 | 不用断言 | 测试必须自动断言,人眼看输出不算测试 |
| ❌ 覆盖率门槛越高越好 | 90% 才合格 | 80% 通常够用,死抠 100% 反而让人写垃圾测试凑数 |

> **一句话总结**:好测试是"安全网"——它让你敢重构、敢改动、敢发布;但好测试不是"测试多",而是"测得准"。把测试当作生产代码一样认真写,它才会在你需要的时候真正保护你。`,
  },
];