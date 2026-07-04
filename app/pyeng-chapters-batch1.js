// =============================================================
// Python 工程化教程 - 第 1 批章节(日志 logging)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyeng-logging-intro",
    icon: "📝",
    title: "日志是什么,为什么重要",
    group: "日志 logging",
    content: `# 日志是什么,为什么重要

## 一、引言:每个工程师都写过 print

如果你写过 Python,你一定写过类似下面的代码:

\`\`\`python
def add(a, b):
    result = a + b
    print("result =", result)
    return result
\`\`\`

\`print\` 是入门最自然的调试手段:快、直观、不需要学任何 API。但当你的程序从「单文件脚本」变成「线上服务」,你会发现 \`print\` 在很多场景下力不从心。本章我们要回答三个问题:

1. 日志(logging)到底是什么?
2. 为什么生产环境必须用日志而非 \`print\`?
3. 日志的级别、消费方、价值分别是什么?

理解了这些,后面章节学 \`logging\` 模块的 API 才不会觉得「为什么要搞这么复杂」。

---

## 二、日志的定义:程序运行时的事件记录

**日志(Log)是程序在运行过程中,对「发生了什么事件」所做的结构化(或半结构化)记录。** 一条日志通常包含以下要素:

| 要素         | 说明                       | 示例                          |
| ------------ | -------------------------- | ----------------------------- |
| 时间戳       | 事件发生的时间             | 2026-07-04 10:23:11.123       |
| 级别         | 事件的严重程度             | INFO / WARNING / ERROR        |
| 来源(Logger)| 事件来自哪个模块/组件      | myapp.payment.service         |
| 消息         | 人类可读的描述             | 订单 order_8829 支付成功      |
| 上下文数据   | 与事件相关的变量、状态     | user_id=1024, amount=99.5     |
| 异常信息     | 出错时的堆栈               | traceback ...                 |
| 进程/线程    | 哪个进程/线程产生          | PID=3210, Thread=0x7f...      |

一个理想的生产日志看起来像这样:

\`\`\`text
2026-07-04 10:23:11.123 INFO  myapp.payment.service - 订单 order_8829 支付成功 user_id=1024 amount=99.50
\`\`\`

而 \`print\` 只能输出一行纯文本,上述要素一个都带不上。

---

## 三、print 的问题:为什么它不能当日志

\`print\` 在生产环境有七大硬伤:

### 1. 没有级别

\`print\` 无法表达「这条信息是调试用的,还是严重错误」。你无法在运行时说「只显示 ERROR 以上的输出」。

\`\`\`python
# 想关掉调试输出?只能手动删掉这些 print
print("debug: 进入函数 add")
print("error: 数据库连接失败")  # 这才是真正的错误
\`\`\`

### 2. 没有时间戳

\`print\` 不记录时间。线上故障复盘时,你不知道这条输出是 10:00 还是 10:30 产生的,无法和监控告警对齐。

### 3. 没有出处

\`print\` 不告诉你这条信息来自哪个文件、哪个函数。一个大型服务里几十个模块都在 \`print\`,你看到一行 "retry failed" 完全不知道是哪个组件在重试。

### 4. 无法控制输出位置

\`print\` 默认写 \`stdout\`。你没法让它同时写「控制台 + 文件 + 远程日志服务器」,也没法让不同级别去不同文件。

### 5. 生产环境无法关闭

\`print\` 没有开关。一旦写进代码,生产环境也会输出。你可以重定向 \`stdout\`,但这会影响所有输出,无法精细控制。

### 6. 没有格式标准化

每行 \`print\` 格式由开发者随手写,事后用脚本分析日志时,格式五花八门,几乎无法批量解析。

### 7. 多线程/多进程下交错混乱

多个线程同时 \`print\`,输出会在终端交错、截断,根本读不出来。

---

## 四、日志的五个核心价值

### 价值 1:调试(Debugging)

开发阶段,日志帮你理解「程序现在在干什么、变量值是多少、走到了哪个分支」。这是 \`print\` 也能做的事,但日志能按级别开关,调试完不用删代码。

### 价值 2:监控(Monitoring)

生产服务 7x24 运行,你不可能盯着屏幕看。日志被采集到 ELK/Loki/CloudWatch,配合告警规则,当 ERROR 数量激增时自动通知。

\`\`\`text
# 监控规则示例:过去 5 分钟 ERROR 日志 > 10 则告警
\`\`\`

### 价值 3:审计(Audit)

「谁在什么时间做了什么操作」是审计的核心。比如:

- 用户 user_1024 在 10:23 修改了订单 order_8829 的收货地址
- 管理员 admin 在 11:00 删除了用户 user_2048

这些操作必须有日志,且不能丢失、不可篡改。

### 价值 4:合规(Compliance)

金融、医疗、隐私等领域有法规要求(如 GDPR、PCI-DSS、等保),强制要求记录关键操作日志,保留 6 个月到数年不等。没有日志=违规=罚款。

### 价值 5:事故复盘(Post-mortem)

线上故障发生后,日志是最重要的「黑匣子」。通过日志时间线,你能还原「10:01 配置变更 → 10:03 错误率上升 → 10:05 雪崩」的因果链,找到根因并防止复发。

---

## 五、日志 vs 调试器 vs APM

三者容易混淆,下表对比:

| 维度     | 日志 logging            | 调试器 pdb/IDE        | APM(SkyWalking/Jaeger) |
| -------- | ----------------------- | --------------------- | ----------------------- |
| 何时用   | 始终在线                | 开发/排查时手动介入   | 生产链路追踪            |
| 粒度     | 事件级(开发者选择)    | 断点级(逐行)        | 请求级(跨服务)        |
| 性能开销 | 小(可控)              | 大(暂停程序)        | 中(采样)              |
| 留存     | 长期(天/月)           | 不留存                | 短期(小时/天)         |
| 离线分析 | 强(可全文检索)        | 无                    | 中(链路维度)          |
| 典型场景 | 日常运行 + 复盘         | 本地复现 bug          | 微服务调用链分析        |

它们是互补关系,不是替代关系。日志是「始终在线」的基础设施,这是调试器和 APM 都做不到的。

---

## 六、日志级别文化:DEBUG/INFO/WARNING/ERROR/CRITICAL

Python \`logging\` 定义了 5 个标准级别(数值越大越严重):

| 级别      | 数值 | 语义                           | 何时使用                                       |
| --------- | ---- | ------------------------------ | ---------------------------------------------- |
| DEBUG     | 10   | 详细的调试信息                 | 开发排查时,生产通常关闭                       |
| INFO      | 20   | 确认程序按预期运行             | 启动、关键业务节点、状态变更                   |
| WARNING   | 30   | 出现意外,但程序仍能运行       | 可恢复的异常、即将超限、配置不理想             |
| ERROR     | 40   | 某功能出错,但程序未崩溃       | 请求失败、外部依赖失败、捕获的异常             |
| CRITICAL  | 50   | 严重错误,程序可能无法继续运行 | 数据库连接全断、核心服务不可用、需立即人工介入 |

### 级别的「文化」比 API 更重要

级别不是随便选的,它代表了一种**运维约定**:

- **INFO 是默认的「生产可见」级别**。INFO 太多会刷屏淹没真正重要的信息。
- **WARNING 是「需要关注但不必立即处理」**。如果 WARNING 一直没人看,说明 WARNING 用得太滥。
- **ERROR 必须有人负责**。每个 ERROR 都应该有对应的处理流程,否则就是噪音。
- **CRITICAL 应该罕见**。一天出现一次 CRITICAL 都嫌多,它意味着「赶紧打电话叫人」。

一个常见的反模式:把所有异常都打成 ERROR,导致 ERROR 漫天飞,真正严重的错误被淹没。

\`\`\`python
# 反模式:无脑 ERROR
import logging
logger = logging.getLogger(__name__)

try:
    value = cache.get(key)
except KeyError:
    # 缓存未命中是正常情况,不应该 ERROR
    logger.error("key not found")  # 错!应该是 DEBUG 或 INFO
\`\`\`

---

## 七、日志的「消费方」思维

写日志时,先想清楚「这条日志谁会看」。不同消费方的需求完全不同:

| 消费方        | 关心什么                         | 对日志的要求                         |
| ------------- | -------------------------------- | ------------------------------------ |
| 开发自己      | 变量值、执行路径、bug 复现       | DEBUG 详细、可读、上下文丰富         |
| 运维 / SRE    | 服务健康、错误率、容量趋势       | INFO/WARNING/ERROR 结构化、可聚合    |
| 合规审计      | 谁、何时、做了什么、是否违规     | 不可篡改、含操作人/对象/结果、可追溯 |
| 机器(告警)  | 数量、频率、模式                 | 结构化(JSON)、可解析、可计数        |
| 机器(分析)  | 业务指标、用户行为               | 字段化、可 group by                  |

**关键启示**:

1. 给人看的日志要「可读」,给机器看的日志要「结构化(JSON)」。生产环境常常两者都要(同时输出文本日志和 JSON 日志)。
2. 一条日志的价值取决于它的「消费者」能否用上。写之前问自己:这条日志会被谁、在什么场景、用来做什么?

---

## 八、真实案例:线上故障没有日志,排查 8 小时

某电商团队半夜收到告警:支付接口错误率飙升到 30%。值班工程师登上服务器:

- 应用 \`print\` 了少量信息,但都打到 \`stdout\`,被容器 runtime 重定向后**没有落盘**,容器重启后全部丢失。
- 关键的支付逻辑没有日志,无法知道请求走到哪一步失败。
- 数据库、第三方支付网关都没有接入统一日志。

工程师只能靠「猜」:加日志 → 重新发布 → 等复现 → 再猜。如此循环 8 小时,直到天亮才定位到是某个第三方证书过期导致 TLS 握手失败。

如果事先有规范的日志:

- ERROR 日志会立刻显示 "TLS handshake failed: certificate expired"
- 时间戳能和证书过期时间对齐
- 5 分钟内就能定位根因

**教训**:日志不是「可选的调试工具」,而是「线上可观测性的基础设施」。没有日志的服务,等于在黑屋里找黑猫。

---

## 九、print vs logging 对比总表

| 维度         | print                       | logging                                   |
| ------------ | --------------------------- | ----------------------------------------- |
| 级别         | 无                          | DEBUG/INFO/WARNING/ERROR/CRITICAL         |
| 时间戳       | 无                          | 自带(可自定义格式)                      |
| 来源         | 无                          | 自动带 logger 名称(模块层级)            |
| 输出目标     | 仅 stdout                   | 控制台/文件/网络/队列,可同时多处        |
| 运行时开关   | 无法关闭                    | 按级别、按 logger 灵活开关                |
| 滚动归档     | 无                          | 按大小/时间自动滚动                       |
| 格式标准化   | 无                          | Formatter 统一格式                        |
| 结构化输出   | 无                          | 可输出 JSON(配合 python-json-logger)   |
| 多线程安全   | 可能交错                    | 线程安全                                  |
| 性能         | 高(但无法控制)            | 可控(级别不够时懒求值,不构造消息)      |
| 适用场景     | 脚本、一次性调试、教学      | 生产服务、库、长运行程序                  |

---

## 十、什么时候可以用 print

并非所有场景都禁止 \`print\`:

- **一次性脚本**:数据清洗、临时批处理,跑完就丢,没必要配日志。
- **教学/演示代码**:强调代码逻辑,不想引入 \`import logging\` 的噪音。
- **CLI 工具的面向用户输出**:\`print\` 是给最终用户看的结果,不是日志(这种情况下 \`print\` 是「输出」而非「日志」)。
- **Jupyter Notebook 探索**:交互式分析,日志反而麻烦。

判断标准:**这段代码会不会在生产环境长期运行、是否需要事后排查?** 如果是,用 \`logging\`;如果不是,\`print\` 也无妨。

---

## 十一、本章小结

- 日志是程序运行时的事件记录,带时间、级别、来源、上下文。
- \`print\` 无级别、无时间、无出处、无法控制,不适合生产。
- 日志的五大价值:调试、监控、审计、合规、事故复盘。
- 日志与调试器、APM 互补,是「始终在线」的可观测性基础。
- 级别是一种运维约定,要克制:INFO 不能太滥,ERROR 必须有人负责。
- 写日志前先想「消费方是谁」,决定用文本还是 JSON。

---

## 十二、易错点小结

| 易错点                                   | 错误做法                       | 正确做法                                 |
| ---------------------------------------- | ------------------------------ | ---------------------------------------- |
| 用 \`print\` 当生产日志                  | 服务里到处 print               | 用 logging.getLogger(__name__)          |
| 级别乱用                                 | 缓存未命中打 ERROR             | 正常情况用 DEBUG/INFO                    |
| ERROR 滥发                               | 所有 try/except 都打 ERROR     | 区分可恢复异常(WARNING)与真正错误(ERROR) |
| 日志没有时间戳                           | 只输出消息文本                 | Formatter 加 %(asctime)s                 |
| 日志没有来源                             | 不知道哪个模块产生的           | logger 用 __name__ 命名                  |
| 把面向用户的输出和日志混在一起           | 用 print 输出业务结果          | 业务输出用 print/返回值,日志用 logging  |
| 认为日志只是为了调试                     | 只在出 bug 时才加日志          | 日志是长期可观测性资产,平时就要规范打    |
| 不考虑消费方                             | 给机器看的日志写成纯文本       | 机器消费用 JSON 结构化日志                |
`,
  },
  {
    id: "pyeng-logging-basics",
    icon: "🌊",
    title: "logging 模块基础",
    group: "日志 logging",
    content: `# logging 模块基础

## 一、logging 模块的四大组件

Python 标准库 \`logging\` 的设计围绕四个核心组件,理解它们的关系是掌握 logging 的关键:

| 组件       | 作用                           | 类比                       |
| ---------- | ------------------------------ | -------------------------- |
| Logger     | 产生日志的入口(决定「谁在记」)| 话筒(谁在说话)           |
| Handler    | 决定日志去哪里(控制台/文件)  | 扬声器(声音发到哪)       |
| Filter     | 决定哪些日志被输出(精细过滤) | 滤镜(筛掉不想听的)       |
| Formatter  | 决定日志长什么样(格式化)     | 字幕样式(显示成什么样)   |

### 数据流向(ASCII 图)

\`\`\`text
应用代码: logger.info("hello")
   │
   ▼
[Logger] ── 级别检查 ── 通过 ──▶ 创建 LogRecord
   │
   ▼
[Filter] ── 过滤 ── 通过 ──▶ 继续
   │
   ▼
[Handler] ── 级别检查 ── 通过 ──▶
   │                                 │
   ▼                                 ▼
[Filter] ── 通过 ──▶ [Formatter] ──▶ 输出到目标(控制台/文件)
\`\`\`

关键点:**Logger 和 Handler 都有级别检查**,日志要通过两道关卡才会真正输出。这一点后面会反复踩坑。

---

## 二、最简单的用法:basicConfig + logging.info

\`\`\`python
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logging.info("服务启动")
logging.warning("磁盘剩余空间不足 10%%")
\`\`\`

输出:

\`\`\`text
2026-07-04 10:23:11,123 INFO 服务启动
2026-07-04 10:23:11,124 WARNING 磁盘剩余空间不足 10%
\`\`\`

\`basicConfig\` 是一个「一键配置 root logger」的便捷函数,适合脚本和小程序。但它有重大局限(后面会讲),生产代码不应依赖它。

### basicConfig 的常用参数

| 参数       | 说明                       | 示例                              |
| ---------- | -------------------------- | --------------------------------- |
| level      | root logger 的级别         | logging.INFO                      |
| format     | 输出格式字符串             | "%(asctime)s %(levelname)s %(message)s" |
| datefmt    | 日期时间格式               | "%Y-%m-%d %H:%M:%S"               |
| filename   | 输出到文件(而非控制台)  | "app.log"                         |
| filemode   | 文件模式                   | "a"(默认追加)                   |
| handlers   | 显式指定 handlers(Python 3.8+) | [handler1, handler2]        |

---

## 三、日志级别详解

Python \`logging\` 预定义了 6 个级别常量及其数值:

| 常量      | 数值 | 对应方法                |
| --------- | ---- | ----------------------- |
| NOTSET    | 0    | (无,表示不设置)       |
| DEBUG     | 10   | logger.debug()          |
| INFO      | 20   | logger.info()           |
| WARNING   | 30   | logger.warning()        |
| ERROR     | 40   | logger.error()          |
| CRITICAL  | 50   | logger.critical()       |

### 级别的数值含义

级别是一个**整数阈值**。当一条日志的级别数值 **>= logger/handler 的级别数值** 时,才会被处理。

\`\`\`python
import logging
logger = logging.getLogger("demo")
logger.setLevel(logging.WARNING)  # 阈值 = 30

logger.debug("msg")    # 10 < 30,丢弃
logger.info("msg")     # 20 < 30,丢弃
logger.warning("msg")  # 30 >= 30,输出 ✓
logger.error("msg")    # 40 >= 30,输出 ✓
\`\`\`

### 自定义级别

\`logging\` 允许自定义级别(但很少用):

\`\`\`python
logging.addLevelName(25, "VERBOSE")  # 在 INFO 和 WARNING 之间
\`\`\`

一般不推荐自定义,会破坏与标准工具的兼容性。

---

## 四、getLogger():命名空间与层级

\`logging.getLogger(name)\` 返回一个 Logger 实例,**同名参数永远返回同一个对象**(单例)。

\`\`\`python
import logging
a = logging.getLogger("myapp")
b = logging.getLogger("myapp")
assert a is b  # True,同一个对象
\`\`\`

### 层级关系:点分命名构成树

Logger 名称用点(\`.\`)分隔,形成父子层级:

\`\`\`text
root
 ├── myapp
 │    ├── myapp.db
 │    └── myapp.api
 │         ├── myapp.api.user
 │         └── myapp.api.order
 └── other
\`\`\`

- \`myapp.api.user\` 的父 logger 是 \`myapp.api\`
- \`myapp.api\` 的父 logger 是 \`myapp\`
- \`myapp\` 的父 logger 是 \`root\`

\`\`\`python
parent = logging.getLogger("myapp.api")
child = logging.getLogger("myapp.api.user")
assert child.parent is parent  # True
\`\`\`

### 子 logger 默认向上传播(propagation)

这是 logging 最重要、也最容易踩坑的机制:**子 logger 产生的日志,会沿着父链向上传播,每一级的 handler 都会处理它**。

\`\`\`text
logger.info() at "myapp.api.user"
   │
   ▼ (传播)
"myapp.api.user" 的 handlers 处理
   │
   ▼ (传播)
"myapp.api" 的 handlers 处理
   │
   ▼ (传播)
"myapp" 的 handlers 处理
   │
   ▼ (传播)
"root" 的 handlers 处理
\`\`\`

如果每一级都配了 handler,同一条日志会被输出多次!这就是常见的「日志重复输出」问题。解决办法通常是:只在 \`root\` 配 handler,子 logger 不配 handler(只靠传播)。

---

## 五、Logger 的有效级别(effective level)继承

当你没有给某个 logger 显式 \`setLevel\`,它会**沿父链向上查找**,直到找到一个设置了级别的 logger(或 root)。这个级别就是「有效级别」。

\`\`\`python
import logging

root = logging.getLogger()              # root logger
root.setLevel(logging.WARNING)          # 30

myapp = logging.getLogger("myapp")      # 未设级别
api = logging.getLogger("myapp.api")    # 未设级别

print(api.getEffectiveLevel())          # 30 (继承自 root)
print(api.level)                        # 0 (NOTSET,表示未设置)
\`\`\`

注意区别:

- \`logger.level\` 返回该 logger **自身**设置的级别(0 表示未设)。
- \`logger.getEffectiveLevel()\` 返回**有效**级别(沿父链找到的实际阈值)。

### root logger 的默认级别

\`root\` logger 的默认级别是 \`WARNING\`(30)。这就是为什么你 \`import logging; logging.debug("x")\` 什么都不输出的原因——root 级别是 WARNING,DEBUG 被丢弃了。

\`\`\`python
import logging
logging.warning("可见")   # 30 >= 30,输出
logging.info("不可见")    # 20 < 30,不输出
\`\`\`

---

## 六、模块级 logger 的命名约定:\`__name__\`

Python 社区约定:**每个模块用自己的 \`__name__\` 作为 logger 名称**。

\`\`\`python
# myapp/payment/service.py
import logging

logger = logging.getLogger(__name__)  # __name__ == "myapp.payment.service"
\`\`\`

为什么用 \`__name__\`?

1. **天然带模块路径**:\`myapp.payment.service\` 一眼就知道来源。
2. **自动形成层级**:同包下的模块共享父 logger(如 \`myapp.payment\`),便于统一控制。
3. **避免命名冲突**:不同包的同名模块不会撞 logger。
4. **配置时方便**:可以在配置里按包名统一调级别,如把 \`myapp.payment\` 整个调成 DEBUG,而不影响 \`myapp.shipping\`。

### 反模式:用字符串常量

\`\`\`python
# 反模式
logger = logging.getLogger("payment")  # 丢失包路径,无法定位
\`\`\`

---

## 七、代码 demo:从零搭建模块化日志

### 步骤 1:basicConfig 的局限

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO)
logging.info("ok")
\`\`\`

局限:所有模块共用 root logger,无法对 \`myapp.db\` 和 \`myapp.api\` 设置不同级别,也无法让某些模块输出到文件、某些只输出到控制台。

### 步骤 2:每个模块独立 logger

\`\`\`python
# myapp/db.py
import logging
logger = logging.getLogger(__name__)  # myapp.db

def query(sql):
    logger.debug("执行 SQL: %s", sql)
    logger.info("查询完成")
\`\`\`

\`\`\`python
# myapp/api.py
import logging
logger = logging.getLogger(__name__)  # myapp.api

def handle_request(req):
    logger.info("收到请求: %s", req)
    try:
        ...
    except Exception:
        logger.exception("请求处理失败")
\`\`\`

### 步骤 3:在入口配置 root logger

\`\`\`python
# myapp/__main__.py
import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-8s %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    # 单独把某个模块调成 DEBUG
    logging.getLogger("myapp.db").setLevel(logging.DEBUG)

if __name__ == "__main__":
    setup_logging()
    from myapp import db, api
    api.handle_request("SELECT 1")
\`\`\`

输出示例:

\`\`\`text
2026-07-04 10:23:11 INFO     myapp.api - 收到请求: SELECT 1
2026-07-04 10:23:11 DEBUG    myapp.db - 执行 SQL: SELECT 1
2026-07-04 10:23:11 INFO     myapp.db - 查询完成
\`\`\`

关键点:

- 只在入口( \`__main__\` )调用一次 \`basicConfig\`。
- 各模块只 \`getLogger(__name__)\` 并打日志,**不负责配置**。
- 配置与代码分离,便于切换(dev 用 INFO,prod 用 WARNING)。

---

## 八、常用 Logger 方法一览

| 方法                          | 级别     | 说明                                  |
| ----------------------------- | -------- | ------------------------------------- |
| logger.debug(msg, *args)      | DEBUG    | 调试信息                              |
| logger.info(msg, *args)       | INFO     | 一般信息                              |
| logger.warning(msg, *args)    | WARNING  | 警告                                  |
| logger.error(msg, *args)      | ERROR    | 错误                                  |
| logger.critical(msg, *args)   | CRITICAL | 严重错误                              |
| logger.exception(msg, *args)  | ERROR    | 自动附带 traceback(只能在 except 块)|
| logger.log(level, msg, *args) | 自定义   | 用数值级别打日志                      |
| logger.setLevel(level)        | -        | 设置级别                              |
| logger.addHandler(h)          | -        | 添加 handler                          |
| logger.removeHandler(h)       | -        | 移除 handler                          |
| logger.addFilter(f)           | -        | 添加 filter                           |
| logger.isEnabledFor(level)    | -        | 检查某级别是否会被输出(性能优化用) |

### 消息格式化:用 % 而非 f-string

\`\`\`python
# 推荐(懒求值,级别不够时不会格式化)
logger.debug("用户 %s 查询 %s", user_id, query)

# 不推荐(无论是否输出都会先格式化)
logger.debug(f"用户 {user_id} 查询 {query}")
\`\`\`

当日志级别是 DEBUG 而 logger 级别是 INFO 时,第一条不会真正格式化(节省开销);第二条 f-string 会先执行再丢弃。

### 高开销参数的优化

\`\`\`python
# 如果构造参数本身很贵,先判断
if logger.isEnabledFor(logging.DEBUG):
    logger.debug("大对象: %s", expensive_serialize(data))
\`\`\`

---

## 九、Logger 的层级控制实战

\`\`\`python
import logging

# 全局 root 配置
logging.basicConfig(level=logging.INFO, format="%(name)s %(levelname)s %(message)s")

# 整个 myapp 用 INFO
logging.getLogger("myapp").setLevel(logging.INFO)
# 但 myapp.db 用 DEBUG(调试数据库层)
logging.getLogger("myapp.db").setLevel(logging.DEBUG)
# myapp.noisy 这个第三方风格模块太吵,关到 WARNING
logging.getLogger("myapp.noisy").setLevel(logging.WARNING)
\`\`\`

这种「按包名调级别」的能力,是 \`__name__\` 命名约定的最大收益。

---

## 十、本章小结

- logging 四大组件:Logger(入口)、Handler(去向)、Filter(过滤)、Formatter(格式)。
- \`basicConfig\` 适合脚本,生产代码用 \`getLogger(__name__)\` + 入口统一配置。
- 级别是数值阈值,日志级别 >= 设置级别才输出。
- logger 名称点分构成树,子 logger 默认向上传播,可能导致重复输出。
- 有效级别沿父链继承;root 默认 WARNING。
- 模块级 logger 用 \`__name__\`,天然带路径、便于按包调级别。
- 消息用 \`%\` 格式化以享受懒求值。

---

## 十一、易错点小结

| 易错点                                   | 现象                               | 解决                                       |
| ---------------------------------------- | ---------------------------------- | ------------------------------------------ |
| basicConfig 不生效                       | 配置后日志仍无格式/无时间          | basicConfig 只在 root 无 handler 时生效,确保第一次调用 |
| basicConfig 调用多次不生效               | 第二次配置无效                     | basicConfig 只生效一次,改用 dictConfig 或手动 addHandler |
| 子 logger 日志重复输出                   | 同一条日志出现 2 次以上            | 子 logger 设 \`propagate = False\`,或只在 root 配 handler |
| debug 日志不输出                         | logger.debug 无输出                | root 默认 WARNING,需 setLevel(DEBUG)      |
| 用 f-string 格式化日志                   | 性能浪费(级别不够也格式化)       | 改用 \`logger.debug("x=%s", x)\`           |
| logger 名称乱起                          | 无法按包调级别、无法定位来源       | 统一用 \`getLogger(__name__)\`             |
| 误以为 logger.level 就是有效级别         | level 返回 0 以为没配              | 用 \`getEffectiveLevel()\` 看实际阈值      |
| 在模块顶层调用 basicConfig               | 库被 import 时副作用影响宿主       | 库不要配 root,只 getLogger;宿主负责配置   |
| logger.exception 在非 except 块使用      | 抛异常或 traceback 缺失            | exception() 只在 except 块内用             |
| 多次 getLogger 不同名导致配置分散        | 配置难统一                         | 沿用 __name__ 树形命名,入口统一配置        |
`,
  },
  {
    id: "pyeng-logging-advanced",
    icon: "⚙️",
    title: "Handler、Formatter、Filter",
    group: "日志 logging",
    content: `# Handler、Formatter、Filter

## 一、Handler:日志去哪里

Handler 决定日志记录最终被发送到哪里。Python \`logging\` 内置多种 Handler:

| Handler                   | 输出目标                  | 典型场景                       |
| ------------------------- | ------------------------- | ------------------------------ |
| StreamHandler             | 流(默认 stderr)        | 控制台输出                     |
| FileHandler               | 文件                      | 简单文件日志                   |
| RotatingFileHandler       | 文件(按大小滚动)        | 限制单文件大小                 |
| TimedRotatingFileHandler  | 文件(按时间滚动)        | 按天/小时归档                  |
| SocketHandler             | TCP socket                | 发往远程日志服务               |
| DatagramHandler           | UDP socket                | 发往远程(不可靠)            |
| SysLogHandler             | syslog                    | 系统日志集成                   |
| NTEventLogHandler         | Windows 事件日志          | Windows 服务                   |
| SMTPHandler               | 邮件                      | 错误邮件告警                   |
| HTTPHandler               | HTTP POST                 | 发往 Webhook                   |
| QueueHandler              | 队列                      | 异步日志(配合 QueueListener) |
| NullHandler               | 丢弃                      | 库的默认 handler(占位)       |
| MemoryHandler             | 内存缓冲                  | 攒一批再 flush                 |
| WatchedFileHandler        | 文件(检测轮换)          | 配合 logrotate                 |

### Handler 的通用属性

所有 Handler 都有:

- \`setLevel(level)\`:Handler 自己的级别阈值(独立于 logger)。
- \`setFormatter(fmt)\`:设置格式化器。
- \`addFilter(f)\` / \`removeFilter(f)\`:添加过滤器。
- \`handler.emit(record)\`:实际输出方法(通常不直接调)。

**关键**:Logger 的级别是第一道门,Handler 的级别是第二道门。一条日志要被某 handler 输出,必须同时通过两道门。

\`\`\`text
logger.info(...)   → logger 级别 INFO(20) >= INFO ✓
                     → handler A 级别 DEBUG(10): INFO >= DEBUG ✓ 输出
                     → handler B 级别 WARNING(30): INFO < WARNING ✗ 丢弃
\`\`\`

---

## 二、StreamHandler:控制台输出

\`\`\`python
import logging

console = logging.StreamHandler()  # 默认 sys.stderr
console.setLevel(logging.INFO)
console.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

logger = logging.getLogger("demo")
logger.addHandler(console)
logger.setLevel(logging.DEBUG)

logger.info("控制台可见")
logger.debug("控制台不可见(handler 级别 INFO)")
\`\`\`

注意:\`StreamHandler()\` 默认输出到 \`sys.stderr\`,不是 \`stdout\`。这是因为日志传统上走 stderr,与程序正常输出(stdout)分离,便于重定向。

---

## 三、FileHandler:文件输出

\`\`\`python
import logging

fh = logging.FileHandler("app.log", encoding="utf-8")
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s %(message)s"))

logger = logging.getLogger("demo")
logger.addHandler(fh)
logger.info("写入文件")
\`\`\`

参数:

- \`filename\`:文件路径。
- \`mode\`:默认 \`'a'\`(追加),也可 \`'w'\`(覆盖,慎用)。
- \`encoding\`:务必指定 \`utf-8\`,避免中文乱码。
- \`delay\`:默认 \`False\`(打开文件即创建),\`True\` 则首次 emit 时才打开。

### FileHandler 的局限

\`FileHandler\` 只会一直往一个文件写,**不会滚动**。长期运行的服务,日志文件会无限增长,最终撑爆磁盘。生产环境必须用滚动 Handler。

---

## 四、RotatingFileHandler:按大小滚动

\`\`\`python
import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler(
    "app.log",
    maxBytes=10 * 1024 * 1024,  # 10 MB
    backupCount=5,              # 保留 5 个历史文件
    encoding="utf-8",
)
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

logger = logging.getLogger("demo")
logger.addHandler(handler)
\`\`\`

### 滚动机制

当 \`app.log\` 超过 \`maxBytes\` 时:

\`\`\`text
滚动前:
  app.log (11 MB)

滚动后:
  app.log    (空,继续写)
  app.log.1  (原 app.log)
  app.log.2  (原 app.log.1)
  app.log.3  (原 app.log.2)
  app.log.4  (原 app.log.3)
  app.log.5  (原 app.log.4,原 app.log.5 被删除)
\`\`\`

\`backupCount=5\` 表示最多保留 5 个历史文件(加上当前文件共 6 个)。超出数量的最老文件被删除。

### maxBytes 怎么定

- 太小(如 1 MB):频繁滚动,IO 开销大。
- 太大(如 1 GB):单文件难下载、难 grep。
- 经验值:10~100 MB,配合 \`backupCount\` 控制总占用。

---

## 五、TimedRotatingFileHandler:按时间滚动

\`\`\`python
import logging
from logging.handlers import TimedRotatingFileHandler

handler = TimedRotatingFileHandler(
    "app.log",
    when="midnight",   # 每天午夜滚动
    interval=1,
    backupCount=7,     # 保留 7 天
    encoding="utf-8",
)
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

logger = logging.getLogger("demo")
logger.addHandler(handler)
\`\`\`

### when 参数取值

| when       | 含义         | 文件名后缀示例            |
| ---------- | ------------ | ------------------------- |
| 'S'        | 秒           | app.log.2026-07-04_10-23  |
| 'M'        | 分钟         | app.log.2026-07-04_10-23  |
| 'H'        | 小时         | app.log.2026-07-04_10     |
| 'D'        | 天           | app.log.2026-07-04        |
| 'midnight' | 每天午夜     | app.log.2026-07-04        |
| 'W0'-'W6'  | 每周(周一~周日)| app.log.2026-07-07      |

### 顺带按大小再滚动?

\`TimedRotatingFileHandler\` 不按大小滚动。如果你的日志一天能写几十 GB,建议:

1. 用 \`RotatingFileHandler\` 限制单文件大小。
2. 或用 \`TimedRotatingFileHandler\` 但配合外部 logrotate 截断。
3. 或升级到专业日志方案(Loki/ELK),不再依赖文件滚动。

---

## 六、QueueHandler:异步日志

同步日志会阻塞业务线程(尤其文件 IO 慢或网络 handler)。异步日志用一个队列解耦:

\`\`\`text
业务线程 ──▶ QueueHandler ──▶ Queue(内存) ──▶ QueueListener ──▶ 真正的 Handler(文件/网络)
\`\`\`

\`\`\`python
import logging
import logging.handlers
import queue

# 1. 创建队列
log_queue = queue.Queue(-1)  # 无界

# 2. QueueHandler 给业务 logger 用(非阻塞)
queue_handler = logging.handlers.QueueHandler(log_queue)

# 3. 真正的 handler(慢 IO),由 listener 调用
file_handler = logging.FileHandler("app.log", encoding="utf-8")
file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

# 4. QueueListener 负责从队列消费,转发给真正的 handler
queue_listener = logging.handlers.QueueListener(log_queue, file_handler)
queue_listener.start()  # 启动后台线程

# 5. 业务使用
logger = logging.getLogger("demo")
logger.addHandler(queue_handler)
logger.setLevel(logging.INFO)

logger.info("异步写入,不阻塞业务")

# 6. 程序退出时停止 listener
import atexit
atexit.register(queue_listener.stop)
\`\`\`

### 异步日志的注意点

- 队列无界(\`Queue(-1)\`)可能内存爆炸,可设上限并制定丢弃策略。
- 进程崩溃时,队列里未消费的日志会丢失(对审计日志要谨慎)。
- \`QueueListener.stop()\` 会 flush 剩余日志,务必在退出前调用(\`atexit\` 注册)。

---

## 七、NullHandler:库的标配

**库(library)永远不应该自己配置日志**,否则会污染宿主应用的日志配置。但库内部又需要打日志,怎么办?答案:库的顶层 logger 加一个 \`NullHandler\`。

\`\`\`python
# mylib/__init__.py
import logging
logging.getLogger(__name__).addHandler(logging.NullHandler())
\`\`\`

\`NullHandler\` 什么也不做:既不输出,也不触发 "No handlers found for logger" 警告(Python 3 已无此警告,但 NullHandler 仍是约定)。

宿主应用按需配置 \`mylib\` 的 logger 即可控制库的日志输出。

---

## 八、Formatter:日志长什么样

Formatter 通过格式字符串决定一条日志的文本形态。

\`\`\`python
fmt = logging.Formatter(
    fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
handler.setFormatter(fmt)
\`\`\`

### 常用字段(LogRecord 属性)

| 字段            | 说明                       | 示例                          |
| --------------- | -------------------------- | ----------------------------- |
| %(asctime)s     | 时间(可 datefmt 控制格式)| 2026-07-04 10:23:11           |
| %(created)f     | time.time() 时间戳         | 1783128191.123                |
| %(name)s        | logger 名称                | myapp.api.user                |
| %(levelname)s   | 级别名                     | INFO                          |
| %(levelno)d     | 级别数值                   | 20                            |
| %(message)s     | 消息正文                   | 用户登录成功                  |
| %(module)s      | 模块名(不含包)          | user                          |
| %(filename)s    | 文件名                     | user.py                       |
| %(lineno)d      | 行号                       | 42                            |
| %(funcName)s    | 函数名                     | handle_login                  |
| %(process)d     | 进程 ID                    | 3210                          |
| %(processName)s | 进程名                     | MainProcess                   |
| %(thread)d      | 线程 ID                    | 140735123456                  |
| %(threadName)s  | 线程名                     | Thread-1                      |
| %(pathname)s    | 完整文件路径               | /app/myapp/api/user.py        |
| %(msecs)d       | 毫秒部分                   | 123                           |
| %(relativeCreated)d | 自 logging 模块加载的毫秒数 | 12345                     |

### 常见格式模板

\`\`\`text
# 简洁(开发)
%(asctime)s %(levelname)s %(name)s: %(message)s

# 详细(排查)
%(asctime)s %(levelname)-8s [%(process)d:%(threadName)s] %(name)s %(funcName)s:%(lineno)d - %(message)s

# JSON(生产,机器消费)
{"ts":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}
\`\`\`

### datefmt

\`datefmt\` 遵循 \`time.strftime\` 语法:

| 占位符 | 含义         | 示例     |
| ------ | ------------ | -------- |
| %Y     | 4 位年份     | 2026     |
| %m     | 月           | 07       |
| %d     | 日           | 04       |
| %H     | 时(24h)    | 10       |
| %M     | 分           | 23       |
| %S     | 秒           | 11       |
| %f     | 微秒(需特殊处理) | 123456 |

注意:标准 \`Formatter\` 的 \`datefmt\` 默认不带毫秒。要毫秒,用 \`default_msec_format\` 或自定义 Formatter:

\`\`\`python
class MsecFormatter(logging.Formatter):
    default_msec_format = "%s,%03d"
\`\`\`

### 字段对齐:\`%-8s\`

\`%(levelname)-8s\` 表示左对齐、宽度 8,让多行日志级别列对齐:

\`\`\`text
2026-07-04 10:23:11 INFO     myapp - ok
2026-07-04 10:23:12 WARNING  myapp - low disk
2026-07-04 10:23:13 CRITICAL myapp - down
\`\`\`

---

## 九、自定义 Formatter

需要更复杂逻辑(如 JSON、脱敏)时,继承 Formatter 重写 \`format\`:

\`\`\`python
import json
import logging

class JsonFormatter(logging.Formatter):
    def format(self, record):
        log = {
            "ts": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        if record.exc_info:
            log["traceback"] = self.formatException(record.exc_info)
        return json.dumps(log, ensure_ascii=False)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
\`\`\`

输出:

\`\`\`json
{"ts": "2026-07-04 10:23:11,123", "level": "INFO", "logger": "demo", "msg": "ok", "module": "demo", "line": 1}
\`\`\`

生产环境也常用第三方库 \`python-json-logger\` 做同样的事(下一章讲)。

---

## 十、Filter:过滤哪些日志

Filter 是最灵活但也最少用的组件。它能在 logger 和 handler 两个层级精细控制「哪些日志通过」。

### Logger 级别过滤 vs Handler 级别过滤

\`\`\`text
logger.setLevel(WARNING)   ← 粗粒度:级别阈值
logger.addFilter(MyFilter())  ← 细粒度:任意逻辑
handler.setLevel(ERROR)    ← handler 也能设级别
handler.addFilter(MyFilter()) ← handler 也能加 filter
\`\`\`

级别只能做「>= 某级别」的判断;Filter 能做任意判断(按 logger 名、按消息内容、按业务字段)。

### 内置用法:按 logger 名过滤

\`\`\`python
# 只允许 "myapp.db" 及其子 logger 的日志通过
class DbFilter(logging.Filter):
    def filter(self, record):
        return record.name.startswith("myapp.db")

handler = logging.StreamHandler()
handler.addFilter(DbFilter())
\`\`\`

\`logging.Filter(name)\` 也能直接按名称过滤(只允许该 logger 及子 logger):

\`\`\`python
handler.addFilter(logging.Filter("myapp.db"))
\`\`\`

### 自定义 Filter:按业务字段过滤

LogRecord 可以携带自定义属性,Filter 基于它过滤:

\`\`\`python
class HighValueFilter(logging.Filter):
    def filter(self, record):
        return getattr(record, "amount", 0) > 1000

logger.info("大额订单", extra={"amount": 2000})   # 通过
logger.info("小额订单", extra={"amount": 50})     # 被过滤
\`\`\`

注意:\`extra\` 的 key 不能与 LogRecord 内置属性冲突(如 \`name\`、\`message\`、\`level\`)。

---

## 十一、代码 demo:同时输出到控制台 + 文件 + 错误文件

一个典型的生产配置:控制台 INFO、全部日志 DEBUG 落文件、ERROR 单独存一个文件便于告警。

\`\`\`python
import logging

def setup_logging():
    logger = logging.getLogger()  # root
    logger.setLevel(logging.DEBUG)

    # 公共格式
    fmt = logging.Formatter(
        "%(asctime)s %(levelname)-8s [%(processName)s] %(name)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # 1. 控制台:INFO 及以上
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    console.setFormatter(fmt)

    # 2. 全量文件:DEBUG 及以上(滚动)
    from logging.handlers import RotatingFileHandler
    debug_file = RotatingFileHandler(
        "logs/debug.log", maxBytes=50*1024*1024, backupCount=5, encoding="utf-8"
    )
    debug_file.setLevel(logging.DEBUG)
    debug_file.setFormatter(fmt)

    # 3. 错误文件:ERROR 及以上
    error_file = RotatingFileHandler(
        "logs/error.log", maxBytes=20*1024*1024, backupCount=10, encoding="utf-8"
    )
    error_file.setLevel(logging.ERROR)
    error_file.setFormatter(fmt)

    logger.addHandler(console)
    logger.addHandler(debug_file)
    logger.addHandler(error_file)

if __name__ == "__main__":
    setup_logging()
    log = logging.getLogger("myapp")
    log.debug("调试信息 → 仅 debug.log")
    log.info("一般信息 → 控制台 + debug.log")
    log.error("错误信息 → 三处都有")
\`\`\`

### 输出去向示意

\`\`\`text
debug()  ──┬──▶ console  [INFO:丢弃]
            ├──▶ debug.log [DEBUG:写入]
            └──▶ error.log [ERROR:丢弃]

info()   ──┬──▶ console  [INFO:写入]
            ├──▶ debug.log [DEBUG:写入]
            └──▶ error.log [ERROR:丢弃]

error()  ──┬──▶ console  [INFO:写入]
            ├──▶ debug.log [DEBUG:写入]
            └──▶ error.log [ERROR:写入]
\`\`\`

每条日志按 handler 各自的级别独立决定是否输出,这就是「多 handler 多级别」的威力。

---

## 十二、本章小结

- Handler 决定「去哪」,Formatter 决定「长啥样」,Filter 决定「过不过」。
- 生产用滚动 Handler(RotatingFileHandler / TimedRotatingFileHandler),别用裸 FileHandler。
- 高并发/慢 IO 场景用 QueueHandler + QueueListener 异步化。
- 库的顶层 logger 加 NullHandler,绝不自己配 handler。
- Formatter 字段来自 LogRecord,\`%(name)s\`/\`%(levelname)s\`/\`%(message)s\` 最常用。
- Filter 比级别更细,可按 logger 名或业务字段(extra)过滤。
- 一个 logger 可挂多个 handler,每个 handler 独立级别和格式,实现「同一条日志多目的地多级别」。

---

## 十三、易错点小结

| 易错点                                   | 现象                               | 解决                                       |
| ---------------------------------------- | ---------------------------------- | ------------------------------------------ |
| FileHandler 不滚动,磁盘满              | 日志文件无限增长                   | 换 RotatingFileHandler / TimedRotatingFileHandler |
| RotatingFileHandler maxBytes 太小        | 频繁滚动、性能下降                 | 10~100 MB 起步                             |
| backupCount 设太小                       | 历史日志很快被删,无法回溯         | 按保留天数/容量算够                        |
| FileHandler 没指定 encoding             | 中文乱码                           | 显式 \`encoding="utf-8"\`                  |
| 以为 logger 级别够了 handler 就输出      | handler 级别更高时仍丢弃           | logger 和 handler 级别都要满足             |
| 库自己 addHandler                        | 污染宿主日志、重复输出             | 库只加 NullHandler,宿主配置               |
| 同一 logger 挂多个 handler 都配 INFO     | 想要「文件 DEBUG + 控制台 INFO」失败| 各 handler 独立 setLevel                   |
| QueueListener 忘记 stop                  | 退出时丢日志                       | atexit 注册 stop                           |
| extra 的 key 与内置属性冲突              | AttributeError                     | 避开 name/message/level 等内置名           |
| 自定义 Formatter 忘记处理 exc_info       | 异常 traceback 丢失                | 检查 record.exc_info 并 formatException    |
| datefmt 不带毫秒                         | 时间精度不够,难对齐               | 自定义 Formatter 或 default_msec_format    |
`,
  },
  {
    id: "pyeng-logging-config",
    icon: "📋",
    title: "日志配置(dictConfig/fileConfig)",
    group: "日志 logging",
    content: `# 日志配置(dictConfig/fileConfig)

## 一、配置的目的:把「日志长什么样」和「代码」解耦

前面章节我们在代码里手写 \`addHandler\`、\`setFormatter\`。这在小项目可行,但生产环境有几个问题:

1. **改配置要改代码、重新发布**:只想把某模块从 INFO 调成 DEBUG,却要改代码、走 CI/CD。
2. **配置分散**:handler 在多处创建,难以全局审视。
3. **环境差异难管理**:dev/staging/prod 想用不同配置,代码里 if-else 会很乱。

「日志配置」的目的就是**把配置抽离成数据**(字典/文件),代码只负责「加载配置」。改配置不动代码,不同环境加载不同配置文件。

\`\`\`text
┌─────────────┐     加载     ┌──────────────────┐
│ config.yaml │ ──────────▶  │ logging.config    │ ──▶ 配置生效
│ (数据)      │              │ .dictConfig(...)  │
└─────────────┘              └──────────────────┘
        ▲
        │ 改配置不动代码
   运维 / SRE
\`\`\`

---

## 二、三种配置方式

| 方式                  | 写在哪           | 优点                 | 缺点                     |
| --------------------- | ---------------- | -------------------- | ------------------------ |
| 代码内配置            | Python 代码      | 直观、IDE 友好       | 改配置要改代码           |
| fileConfig(.ini)      | ini 文件         | 外置、不依赖代码     | 语法古老、表达力弱       |
| dictConfig(dict)      | 字典(YAML/JSON) | 表达力强、可程序化  | 需理解 schema            |

社区共识:**新项目用 dictConfig**(通常配 YAML),fileConfig 仅用于兼容老项目。

---

## 三、fileConfig 详解:ini 格式

\`fileConfig\` 用 Python 标准库 \`configparser\` 解析 ini 文件。

### ini 文件示例

\`\`\`ini
[loggers]
keys=root,demo

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFmt

[logger_root]
level=WARNING
handlers=consoleHandler

[logger_demo]
level=DEBUG
handlers=consoleHandler,fileHandler
qualname=demo
propagate=0

[handler_consoleHandler]
class=StreamHandler
level=INFO
formatter=simpleFmt
args=(sys.stdout,)

[handler_fileHandler]
class=handlers.RotatingFileHandler
level=DEBUG
formatter=simpleFmt
args=('app.log','a',10485760,5,'utf-8')

[formatter_simpleFmt]
format=%(asctime)s %(levelname)s %(name)s %(message)s
datefmt=%Y-%m-%d %H:%M:%S
\`\`\`

### 加载

\`\`\`python
import logging.config
logging.config.fileConfig("logging.ini", disable_existing_loggers=False)
\`\`\`

### ini 结构说明

- \`[loggers]\` / \`[handlers]\` / \`[formatters]\`:三个注册表,列出所有实例的 key。
- \`[logger_xxx]\`:每个 logger 一节,\`qualname\` 是 logger 名称,\`propagate\` 控制传播。
- \`[handler_xxx]\`:\`class\` 是完整类名(如 \`handlers.RotatingFileHandler\`),\`args\` 是构造参数元组(注意是字符串里的 Python 字面量)。
- \`[formatter_xxx]\`:\`format\` 和 \`datefmt\` 字符串。

### fileConfig 的坑

- \`disable_existing_loggers\` 默认 \`True\`,会**禁用所有未在 ini 中声明的 logger**(导致第三方库日志全消失)。生产环境务必设 \`False\`。
- \`args\` 是字符串形式的 Python 元组,容易写错引号转义。
- 不支持任意 Python 对象,自定义类需要可被 \`import\`。
- 表达力弱,不支持「条件配置」「环境变量插值」。

---

## 四、dictConfig 详解:字典结构

\`dictConfig\` 接收一个字典,这是最强大、最推荐的方式。字典可来自 YAML/JSON 文件,也可由代码动态生成(从而支持环境变量、条件分支)。

### dictConfig schema 总览

\`\`\`text
{
  "version": 1,                  # 必填,目前固定为 1
  "disable_existing_loggers": false,
  "formatters": { ... },         # 格式化器字典
  "filters": { ... },            # 过滤器字典(可选)
  "handlers": { ... },           # handler 字典
  "loggers": { ... },            # 非 root logger 字典
  "root": { ... },               # root logger 配置
  "incremental": false,          # 增量配置(可选)
}
\`\`\`

### 最小 dictConfig 示例

\`\`\`python
import logging.config

config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "simple",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "demo": {
            "level": "DEBUG",
            "handlers": ["console"],
            "propagate": False,
        },
    },
    "root": {
        "level": "WARNING",
        "handlers": ["console"],
    },
}

logging.config.dictConfig(config)
\`\`\`

### 关键字段说明

#### formatters

\`\`\`python
"formatters": {
    "simple": {
        "format": "...",
        "datefmt": "...",
        "style": "%",   # 默认 %,也可 '{' 或 '$'
    },
    "json": {
        "()": "myapp.logging.JsonFormatter",  # 自定义 Formatter 类(工厂)
        "datefmt": "%Y-%m-%d %H:%M:%S",
    },
}
\`\`\`

- 用 \`class\` 指定标准 Formatter,或用 \`()\` 指定自定义工厂(可调用对象)。
- \`style\` 控制 format 字符串风格:\`%\`(默认)、\`{\`(\`str.format\`)、\`$\`(\`string.Template\`)。

#### handlers

\`\`\`python
"handlers": {
    "file": {
        "class": "logging.handlers.RotatingFileHandler",
        "level": "DEBUG",
        "formatter": "simple",
        "filename": "app.log",
        "maxBytes": 10485760,
        "backupCount": 5,
        "encoding": "utf-8",
    },
    "console": {
        "class": "logging.StreamHandler",
        "level": "INFO",
        "formatter": "simple",
        "stream": "ext://sys.stdout",
    },
}
\`\`\`

- \`class\`:完整类路径。
- 其他键(\`filename\`/\`maxBytes\` 等)作为关键字参数传给构造函数。
- \`ext://sys.stdout\` 是特殊语法,引用 \`sys.stdout\` 对象。

#### loggers

\`\`\`python
"loggers": {
    "myapp": {
        "level": "INFO",
        "handlers": ["console", "file"],
        "propagate": False,
    },
    "myapp.db": {
        "level": "DEBUG",
        "propagate": True,   # 不配 handlers,靠父级传播
    },
}
\`\`\`

- 不配 \`handlers\` 的 logger 只靠传播到父级 handler 输出。
- \`propagate: False\` 阻止向上传播(防止重复输出)。

#### root

\`\`\`python
"root": {
    "level": "WARNING",
    "handlers": ["console"],
}
\`\`\`

root 是所有 logger 的最终祖先,通常配一个「兜底 handler」。

---

## 五、用 YAML 写日志配置(最常见生产实践)

YAML 比 JSON 更适合人写(支持注释、更少标点)。结合 \`PyYAML\` 加载:

### logging.yaml

\`\`\`yaml
version: 1
disable_existing_loggers: false

formatters:
  simple:
    format: "%(asctime)s %(levelname)-8s %(name)s - %(message)s"
    datefmt: "%Y-%m-%d %H:%M:%S"
  detailed:
    format: "%(asctime)s %(levelname)-8s [%(processName)s:%(threadName)s] %(name)s %(funcName)s:%(lineno)d - %(message)s"
    datefmt: "%Y-%m-%d %H:%M:%S"

handlers:
  console:
    class: logging.StreamHandler
    level: INFO
    formatter: simple
    stream: ext://sys.stdout

  debug_file:
    class: logging.handlers.RotatingFileHandler
    level: DEBUG
    formatter: detailed
    filename: logs/debug.log
    maxBytes: 52428800      # 50 MB
    backupCount: 5
    encoding: utf-8

  error_file:
    class: logging.handlers.RotatingFileHandler
    level: ERROR
    formatter: detailed
    filename: logs/error.log
    maxBytes: 20971520      # 20 MB
    backupCount: 10
    encoding: utf-8

loggers:
  myapp:
    level: INFO
    handlers: [console, debug_file, error_file]
    propagate: false
  myapp.db:
    level: DEBUG
    propagate: true
  myapp.noisy:
    level: WARNING
    propagate: true

root:
  level: WARNING
  handlers: [console]
\`\`\`

### 加载代码

\`\`\`python
import logging.config
import yaml
from pathlib import Path

def setup_logging(config_path="logging.yaml", default_level=logging.INFO):
    path = Path(config_path)
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
        logging.config.dictConfig(config)
    else:
        logging.basicConfig(level=default_level)

setup_logging()
\`\`\`

---

## 六、配置加载:环境变量与多环境切换

生产配置常需要「不同环境不同配置」「运行时调级别」。两种做法:

### 做法 1:多配置文件 + 环境选择

\`\`\`text
configs/
  logging.dev.yaml
  logging.staging.yaml
  logging.prod.yaml
\`\`\`

\`\`\`python
import os
import logging.config
import yaml

env = os.getenv("APP_ENV", "dev")
config_path = f"configs/logging.{env}.yaml"

with open(config_path, encoding="utf-8") as f:
    logging.config.dictConfig(yaml.safe_load(f))
\`\`\`

### 做法 2:基础配置 + 环境变量覆盖

\`\`\`python
import os
import logging.config
import yaml

with open("logging.yaml", encoding="utf-8") as f:
    config = yaml.safe_load(f)

# 用环境变量覆盖级别
level = os.getenv("LOG_LEVEL", "INFO").upper()
config["loggers"]["myapp"]["level"] = level
config["root"]["level"] = os.getenv("ROOT_LOG_LEVEL", "WARNING").upper()

logging.config.dictConfig(config)
\`\`\`

### 做法 3:动态修改已加载的配置

\`\`\`python
import logging

# 运行时把某模块调成 DEBUG(无需重启,适合热调试)
logging.getLogger("myapp.db").setLevel(logging.DEBUG)

# 临时关闭某模块日志
logging.getLogger("myapp.noisy").setLevel(logging.CRITICAL + 1)  # 比所有级别都高
\`\`\`

---

## 七、结构化日志:输出 JSON

生产环境机器消费(告警、分析)需要结构化日志。用 \`python-json-logger\`:

\`\`\`bash
pip install python-json-logger
\`\`\`

### YAML 配置

\`\`\`yaml
formatters:
  json:
    class: pythonjsonlogger.jsonlogger.JsonFormatter
    format: "%(asctime)s %(levelname)s %(name)s %(message)s %(module)s %(lineno)d"
    datefmt: "%Y-%m-%dT%H:%M:%S%z"

handlers:
  json_file:
    class: logging.handlers.RotatingFileHandler
    level: INFO
    formatter: json
    filename: logs/app.json.log
    maxBytes: 52428800
    backupCount: 5
    encoding: utf-8

root:
  level: INFO
  handlers: [json_file]
\`\`\`

输出:

\`\`\`json
{"asctime": "2026-07-04T10:23:11+0800", "levelname": "INFO", "name": "myapp", "message": "订单创建", "module": "order", "lineno": 42}
\`\`\`

### 带 extra 字段

\`\`\`python
logger.info("订单创建", extra={"order_id": "order_8829", "user_id": 1024, "amount": 99.5})
\`\`\`

输出会自动带上这些字段,便于 ELK 里按 \`order_id\` 聚合。

---

## 八、代码 demo:完整 YAML 配置 + 加载 + 使用

### 目录结构

\`\`\`text
myapp/
  __init__.py
  __main__.py
  log_setup.py
  api.py
configs/
  logging.yaml
\`\`\`

### configs/logging.yaml

\`\`\`yaml
version: 1
disable_existing_loggers: false

formatters:
  simple:
    format: "%(asctime)s %(levelname)-8s %(name)s - %(message)s"
    datefmt: "%Y-%m-%d %H:%M:%S"

handlers:
  console:
    class: logging.StreamHandler
    level: INFO
    formatter: simple
    stream: ext://sys.stdout

  file:
    class: logging.handlers.TimedRotatingFileHandler
    level: DEBUG
    formatter: simple
    filename: logs/app.log
    when: midnight
    backupCount: 14
    encoding: utf-8

loggers:
  myapp:
    level: INFO
    handlers: [console, file]
    propagate: false

root:
  level: WARNING
  handlers: [console]
\`\`\`

### myapp/log_setup.py

\`\`\`python
import logging
import logging.config
import os
import yaml
from pathlib import Path

def setup_logging(default_level=logging.INFO):
    env = os.getenv("APP_ENV", "dev")
    config_path = Path(f"configs/logging.{env}.yaml")
    if not config_path.exists():
        config_path = Path("configs/logging.yaml")

    if config_path.exists():
        with open(config_path, encoding="utf-8") as f:
            config = yaml.safe_load(f.read())
        # 环境变量覆盖
        override = os.getenv("LOG_LEVEL")
        if override:
            config.setdefault("loggers", {}).setdefault("myapp", {})["level"] = override.upper()
        logging.config.dictConfig(config)
    else:
        logging.basicConfig(level=default_level)

    # 确保日志目录存在(TimedRotatingFileHandler 不会自动建目录)
    Path("logs").mkdir(exist_ok=True)
\`\`\`

### myapp/api.py

\`\`\`python
import logging

logger = logging.getLogger(__name__)  # myapp.api

def handle(order_id, amount):
    logger.info("处理订单", extra={"order_id": order_id, "amount": amount})
    try:
        ...
    except Exception:
        logger.exception("订单处理失败", extra={"order_id": order_id})
        raise
\`\`\`

### myapp/__main__.py

\`\`\`python
from myapp.log_setup import setup_logging
from myapp.api import handle

if __name__ == "__main__":
    setup_logging()
    handle("order_8829", 99.5)
\`\`\`

---

## 九、三种配置方式对比

| 维度         | 代码内配置          | fileConfig(ini)       | dictConfig(YAML/JSON) |
| ------------ | ------------------- | --------------------- | --------------------- |
| 写法         | Python 代码         | ini 文件              | 字典(YAML/JSON)     |
| 表达力       | 最强(任意代码)    | 弱(无分支/无插值)  | 强(可程序化生成)    |
| 外置化       | 否                  | 是                    | 是                    |
| 改配置       | 改代码              | 改文件                | 改文件                |
| 环境变量     | 直接用              | 不支持                | 加载时注入            |
| 自定义类     | 直接 new            | 需可 import           | \`()\` 工厂或 \`class\` |
| 注释         | Python 注释         | ini 不支持            | YAML 支持             |
| 推荐度       | 脚本/原型           | 兼容老项目            | **新项目首选**        |

---

## 十、dictConfig 高级:增量配置与自定义工厂

### incremental(增量配置)

\`incremental: true\` 时,dictConfig **不创建新 handler/formatter**,只调整已有 logger 的级别/handler 关系。适合「运行时热调级别」:

\`\`\`python
config = {
    "version": 1,
    "incremental": True,
    "loggers": {
        "myapp.db": {"level": "DEBUG"},
    },
}
logging.config.dictConfig(config)
\`\`\`

### 自定义工厂 \`()\`

当 Formatter/Filter 需要复杂构造,用 \`()\` 指定一个**可调用对象**(类或工厂函数):

\`\`\`yaml
formatters:
  json:
    (): myapp.logging.JsonFormatterFactory
    datefmt: "%Y-%m-%d %H:%M:%S"
    mask_fields: [password, token]
\`\`\`

\`\`\`python
# myapp/logging.py
import json, logging

class JsonFormatterFactory:
    def __init__(self, datefmt=None, mask_fields=None):
        self.datefmt = datefmt
        self.mask_fields = set(mask_fields or [])

    def __call__(self):  # 返回真正的 Formatter
        formatter = logging.Formatter(datefmt=self.datefmt)
        # ... 返回一个定制的 Formatter
        return formatter
\`\`\`

\`()\` 指向的对象被实例化(用同节其他键作为参数),然后**被调用**返回真正的组件。这是 dictConfig 支持任意构造逻辑的「后门」。

---

## 十一、本章小结

- 配置的目的:把「日志长啥样」外置成数据,与代码解耦。
- 三种方式:代码内配置(脚本)、fileConfig(兼容)、**dictConfig(推荐)**。
- fileConfig 注意 \`disable_existing_loggers=False\`,否则第三方库日志被禁。
- dictConfig schema:version/formatters/handlers/loggers/root,字段清晰。
- 生产实践:YAML 配置文件 + 环境变量覆盖 + 多环境多文件。
- 结构化日志用 \`python-json-logger\` 输出 JSON,配合 ELK/Loki。
- 自定义 Formatter 用 \`()\` 工厂语法,支持任意构造逻辑。
- \`incremental\` 可热调级别,不重建 handler。

---

## 十二、易错点小结

| 易错点                                   | 现象                               | 解决                                       |
| ---------------------------------------- | ---------------------------------- | ------------------------------------------ |
| disable_existing_loggers=True(默认)     | 第三方库日志全消失                 | 显式设 False                              |
| fileConfig args 引号转义错               | 解析失败                           | 用 dictConfig 代替                         |
| RotatingFileHandler 目录不存在          | 启动报错                           | 提前 mkdir,或 setup 里建目录              |
| dictConfig 漏 version: 1                | 报错 "No version specified"        | 必填 version: 1                           |
| handlers 里 stream 写法错               | 找不到对象                         | 用 \`ext://sys.stdout\` 而非 \`sys.stdout\` |
| YAML 里 level 大小写                    | 级别不识别                         | 用大写 INFO/DEBUG/WARNING                  |
| loggers 配 handlers 又 propagate=true   | 重复输出                           | 配了 handlers 就 propagate=false           |
| 改了 YAML 但没重新加载                  | 配置不生效                         | dictConfig 在启动时加载,改后需重启或热加载 |
| extra 字段未在 Formatter 声明           | JSON 还好,文本格式缺字段          | text 格式需在 format 里加 %(field)s        |
| 多进程写同一文件                         | 日志交错/丢失                      | 用 QueueHandler 或按进程分文件             |
| 自定义类路径写错                         | ImportError                        | 确保类可被 import,路径完整                |
`,
  },
  {
    id: "pyeng-logging-best-practices",
    icon: "🏆",
    title: "日志最佳实践与陷阱",
    group: "日志 logging",
    content: `# 日志最佳实践与陷阱

## 一、最佳实践总览

前面章节我们学了 logging 的 API 和配置。本章是「工程化」的精华:在生产项目里,日志该怎么写、怎么避坑。下面是社区公认的最佳实践清单:

| #   | 实践                                 | 一句话理由                          |
| --- | ------------------------------------ | ----------------------------------- |
| 1   | 每个模块一个 logger(__name__)      | 带路径、可分级控制、便于定位        |
| 2   | 生产代码不要用 print                 | print 无级别无控制、污染输出        |
| 3   | 日志要含足够上下文                   | 只 log "error" 等于没 log           |
| 4   | 用 % 格式化而非 f-string             | 懒求值,级别不够不构造              |
| 5   | 异常用 logger.exception()            | 自动带 traceback,无需手动 format   |
| 6   | 敏感信息脱敏                         | 密码/token/身份证不能进日志         |
| 7   | 异步日志(QueueHandler)             | 避免日志 IO 阻塞业务线程            |
| 8   | 库用 NullHandler                    | 不污染宿主、不强制配置              |
| 9   | 日志级别克制                         | ERROR 必须有人负责,INFO 不能刷屏   |
| 10  | 结构化(JSON)+ 文本双输出          | 人读文本,机器读 JSON               |

---

## 二、实践 1:每个模块一个 logger

\`\`\`python
# 推荐
import logging
logger = logging.getLogger(__name__)
\`\`\`

**为什么**:

- \`__name__\` 是模块的完整点分路径(如 \`myapp.payment.service\`),天然带来源。
- 形成层级树,可在配置里按包名统一调级别(把 \`myapp.payment\` 整个调成 DEBUG)。
- 单例:\`getLogger(__name__)\` 多次调用返回同一对象,配置一处生效。

**反模式**:

\`\`\`python
# 反模式 1:到处用 root
import logging
logging.info("...")  # 来源信息全丢,无法按模块控制

# 反模式 2:随意命名
logger = logging.getLogger("app")  # 多个模块共用一个名,定位不了

# 反模式 3:每个函数内创建
def foo():
    logger = logging.getLogger(__name__)  # 多余开销,应放模块顶层
\`\`\`

---

## 三、实践 2:不要用 print 调试生产代码

\`\`\`python
# 反模式
def process(order):
    print("开始处理", order.id)        # 生产也会输出
    ...
    print("完成", order.id)
\`\`\`

问题:无法关闭、无级别、无时间、无来源。

**正确**:

\`\`\`python
def process(order):
    logger.debug("开始处理 order_id=%s", order.id)
    ...
    logger.info("处理完成 order_id=%s", order.id)
\`\`\`

调试时设 DEBUG 看细节,生产设 INFO 只看结果。

### 何时可以用 print

- CLI 工具面向用户的**输出**(不是日志)。
- 一次性脚本、Notebook 探索。
- 演示/教学代码。

判断:**给用户看的结果用 print,给自己/运维看的诊断信息用 logging**。

---

## 四、实践 3:日志要含足够上下文

\`\`\`python
# 反模式:信息不足
logger.error("出错了")
logger.error("请求失败")

# 正确:带上下文
logger.error("支付失败 order_id=%s user_id=%s reason=%s", order_id, user_id, reason)
\`\`\`

### 上下文该包含什么

| 维度       | 示例                              |
| ---------- | --------------------------------- |
| 谁         | user_id, username                 |
| 什么       | order_id, resource, action        |
| 结果       | success/failed, status_code       |
| 原因       | reason, error message             |
| 关键参数   | amount, retry_count               |
| 关联 ID    | request_id, trace_id              |

### 用 extra 携带结构化字段

\`\`\`python
logger.info(
    "订单创建",
    extra={
        "order_id": order.id,
        "user_id": order.user_id,
        "amount": order.amount,
        "request_id": request_id,
    },
)
\`\`\`

JSON 日志里这些字段会被单独提取,便于在 ELK 里按 \`order_id\` 检索。

### 分布式追踪:request_id

微服务下,一个请求跨多个服务。给每个请求分配唯一 \`request_id\`,在所有日志里带上,就能串起完整链路:

\`\`\`python
import uuid
from contextvars import ContextVar

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True

# 中间件里设置
def middleware(request):
    rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request_id_var.set(rid)
    ...
\`\`\`

Formatter 加 \`%(request_id)s\`,每条日志都带这个 ID。

---

## 五、实践 4:用 % 格式化而非 f-string

\`\`\`python
# 推荐
logger.debug("用户 %s 查询 %s", user_id, query)

# 不推荐
logger.debug(f"用户 {user_id} 查询 {query}")
\`\`\`

### 原因:懒求值

\`logger.debug("%s", x)\` 中,字符串格式化**只在日志真正被输出时**才执行。如果 logger 级别是 INFO,DEBUG 日志被丢弃,那么 \`%s\` 的格式化根本不会发生,节省开销。

而 f-string 是「立即求值」:无论日志是否输出,\`f"...{x}"\` 都会先执行(包括 \`x.__str__()\`、属性访问、函数调用),然后才传给 logger,被丢弃。

### 性能差异示例

\`\`\`python
import logging
logger = logging.getLogger("demo")
logger.setLevel(logging.WARNING)  # DEBUG 不输出

data = list(range(1_000_000))

# 慢:f-string 每次都构造字符串
for _ in range(10000):
    logger.debug(f"data={data}")  # 即使丢弃,也先 str(data)

# 快:% 格式化,丢弃时不构造
for _ in range(10000):
    logger.debug("data=%s", data)  # 丢弃时几乎零开销
\`\`\`

### 何时 f-string 也可接受

- 参数构造本身几乎无开销(简单变量)。
- 该日志一定会输出(如 INFO 级别日志在 INFO logger 下)。
- 可读性优先的少量调试代码。

但**作为通用规范,统一用 \`%\`**,避免团队踩坑。

---

## 六、实践 5:异常用 logger.exception()

\`\`\`python
try:
    risky()
except Exception as e:
    # 反模式:手拼 traceback,繁琐易错
    logger.error("失败: %s\\n%s", e, traceback.format_exc())

    # 正确:exception() 自动附加 traceback
    logger.exception("失败: %s", e)
\`\`\`

\`logger.exception()\` 等同于 \`logger.error(..., exc_info=True)\`,会自动捕获 \`sys.exc_info()\` 并格式化 traceback。**只能在 \`except\` 块内调用**(块外没有当前异常)。

### 在 except 块外记录异常

\`\`\`python
try:
    risky()
except Exception:
    logger.exception("失败")  # ✓
    raise
\`\`\`

如果你在别处想记录一个已捕获的异常对象:

\`\`\`python
logger.error("处理失败", exc_info=exc_obj)  # 传异常对象
\`\`\`

### 不要 swallow exception

\`\`\`python
# 反模式:吞异常,只 log 不 raise
try:
    risky()
except Exception:
    logger.error("出错了")  # 调用方不知道失败了
\`\`\`

除非你有明确理由(如重试、降级),否则异常应该向上传播,日志只是「记录」不是「掩盖」。

---

## 七、实践 6:敏感信息脱敏

日志常被采集到中央系统、被多人查看、长期留存。**绝不能把密码、token、身份证号、银行卡号写进日志**。

\`\`\`python
# 反模式:密码明文进日志
logger.info("用户登录 username=%s password=%s", username, password)

# 正确:脱敏
logger.info("用户登录 username=%s password=***", username)
\`\`\`

### 系统化脱敏:自定义 Filter

\`\`\`python
import logging
import re

SENSITIVE_KEYS = {"password", "token", "secret", "id_card", "card_no"}

class SensitiveFilter(logging.Filter):
    def filter(self, record):
        msg = record.getMessage()
        # 简单示例:替换形如 password=xxx 的内容
        for key in SENSITIVE_KEYS:
            msg = re.sub(rf"{key}=\S+", f"{key}=***", msg, flags=re.IGNORECASE)
        record.msg = msg
        record.args = ()  # 已格式化,清空 args
        return True

logger.addFilter(SensitiveFilter())
\`\`\`

### 脱敏要点

- **白名单优于黑名单**:只允许已知安全字段进日志,而非试图过滤所有敏感字段(容易漏)。
- **结构化日志里也要脱敏**:\`extra\` 里不要带敏感字段。
- **第三方库的日志**:如 SQLAlchemy 会把 SQL 参数打出来,要单独配置其 logger 级别或加 Filter。
- **HTTP 请求日志**:Authorization 头、Cookie 要去掉或脱敏。

### 合规要求

GDPR、PCI-DSS、等保均要求敏感数据脱敏存储。日志里出现明文密码 = 违规 = 罚款。

---

## 八、实践 7:异步日志(QueueHandler)

同步日志在 IO 慢(网络 handler、磁盘忙)时会阻塞业务线程。高并发服务用异步日志解耦:

\`\`\`text
业务线程(快) ──▶ QueueHandler ──▶ Queue ──▶ QueueListener 线程 ──▶ 慢 handler(文件/网络)
\`\`\`

\`\`\`python
import logging
import logging.handlers
import queue
import atexit

log_queue = queue.Queue(-1)

# 业务 logger 用 QueueHandler(非阻塞,只 put)
qh = logging.handlers.QueueHandler(log_queue)

# 真正的 handler(可能慢),由 listener 调用
real_handler = logging.FileHandler("app.log", encoding="utf-8")
real_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))

listener = logging.handlers.QueueListener(log_queue, real_handler)
listener.start()
atexit.register(listener.stop)

root = logging.getLogger()
root.addHandler(qh)
root.setLevel(logging.INFO)
\`\`\`

### 异步日志的取舍

| 维度       | 同步日志           | 异步日志                    |
| ---------- | ------------------ | --------------------------- |
| 业务延迟   | 受 IO 影响         | 几乎无(只入队)            |
| 日志顺序   | 严格有序           | 大致有序(同线程内有序)    |
| 崩溃丢日志 | 不会               | 队列未消费的会丢            |
| 复杂度     | 低                 | 中(需管理 listener)       |
| 适用       | 低并发/审计日志    | 高并发/可容忍少量丢失      |

审计、合规日志(不能丢)用同步;普通运行日志用异步。

---

## 九、实践 8:库用 NullHandler

发布给他人用的库,**绝不配置 handler**,只在顶层 logger 加 NullHandler:

\`\`\`python
# mylib/__init__.py
import logging
logging.getLogger(__name__).addHandler(logging.NullHandler())
\`\`\`

**为什么**:

- 不配置 handler 时,Python 3 默认日志会走 "lastResort" handler(输出 WARNING+ 到 stderr)。库加 NullHandler 可避免这个默认行为。
- 库若自己加 StreamHandler/FileHandler,会污染宿主应用的控制台和文件,甚至导致重复输出。
- 宿主应用通过 \`dictConfig\` 配置 \`mylib\` 的 logger 即可控制其输出。

### 库内打日志

\`\`\`python
# mylib/client.py
import logging
logger = logging.getLogger(__name__)  # mylib.client

def request(url):
    logger.debug("请求 %s", url)  # 默认被 NullHandler 吞掉
    ...
\`\`\`

宿主不配 → 无输出;宿主配了 → 按宿主配置输出。完美。

---

## 十、实践 9:日志级别克制

级别是「运维约定」,不是「随便选」:

- **INFO**:启动、关键业务节点、状态变更。一条 INFO 应该是「运维想知道的正常事件」。
- **WARNING**:可恢复的异常、即将超限、配置不理想。**持续没人看的 WARNING = 噪音**,要么处理要么降级。
- **ERROR**:必须有人负责。每个 ERROR 都该有对应处理流程(告警/工单),否则就是噪音。
- **CRITICAL**:罕见。一天一次都嫌多,意味着「打电话叫人」。

### 反模式:无脑 ERROR

\`\`\`python
try:
    value = cache.get(key)
except KeyError:
    logger.error("缓存未命中")  # 错!缓存未命中是正常的
    value = db.get(key)
\`\`\`

缓存未命中是预期情况,应该 DEBUG 或 INFO。把它当 ERROR 会让 ERROR 数量虚高,淹没真正错误。

### 反模式:INFO 刷屏

\`\`\`python
for item in items:
    logger.info("处理 item %s", item.id)  # 10 万条 item → 10 万行 INFO
\`\`\`

高频循环里打 INFO 会刷屏。改为 DEBUG,或聚合后打一条汇总:

\`\`\`python
logger.info("处理完成 %d 个 item", len(items))
\`\`\`

---

## 十一、实践 10:结构化 + 文本双输出

生产环境常需要两种日志:

- **文本日志**:人读,排查时 tail/grep。
- **JSON 日志**:机器读,被采集到 ELK/Loki 做告警和分析。

一个 logger 挂两个 handler,各用不同 formatter:

\`\`\`yaml
formatters:
  text:
    format: "%(asctime)s %(levelname)-8s %(name)s - %(message)s"
  json:
    class: pythonjsonlogger.jsonlogger.JsonFormatter
    format: "%(asctime)s %(levelname)s %(name)s %(message)s"

handlers:
  text_file:
    class: logging.handlers.RotatingFileHandler
    formatter: text
    filename: logs/app.log
    ...
  json_file:
    class: logging.handlers.RotatingFileHandler
    formatter: json
    filename: logs/app.json.log
    ...

root:
  handlers: [text_file, json_file]
\`\`\`

---

## 十二、常见陷阱详解

### 陷阱 1:basicConfig 只在第一次调用生效

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO)   # 生效
logging.basicConfig(level=logging.DEBUG)  # 无效!root 已有 handler
\`\`\`

\`basicConfig\` 内部检查:若 root 已有 handler,则直接返回(除非 \`force=True\`,Python 3.8+)。

**解决**:用 \`force=True\` 或改用 dictConfig,或手动 \`root.setLevel(DEBUG)\`。

### 陷阱 2:子 logger 默认向上传播导致重复

\`\`\`python
import logging
logging.basicConfig(level=logging.INFO)

parent = logging.getLogger("myapp")
parent.addHandler(logging.StreamHandler())  # 父加 handler

child = logging.getLogger("myapp.child")
child.addHandler(logging.StreamHandler())  # 子也加 handler

child.info("hi")  # 输出 2 次!
\`\`\`

子 logger 的日志先经自己的 handler,再传播到父 handler,两个 handler 都输出 → 重复。

**解决**:

- 只在 root / 顶层 logger 配 handler,子 logger 不配(靠传播)。
- 或子 logger 设 \`propagate = False\`。

### 陷阱 3:级别理解错误

\`\`\`python
logger = logging.getLogger("demo")
logger.setLevel(logging.WARNING)

logger.warning("w")  # 输出(WARNING >= WARNING)
logger.info("i")      # 不输出(INFO < WARNING)
\`\`\`

「设成 WARNING」=「输出 WARNING 及以上」,不是「只输出 WARNING」。新人常误解为「只输出这一级」。

### 陷阱 4:循环里打日志导致性能问题

\`\`\`python
for i in range(1_000_000):
    logger.debug("第 %d 次", i)  # 即使 DEBUG 不输出,也有方法调用开销
\`\`\`

虽然 \`%\` 懒求值,但 \`logger.debug()\` 调用本身有开销(创建 LogRecord、级别检查)。百万级循环里,即便丢弃也会累积。

**解决**:

\`\`\`python
if logger.isEnabledFor(logging.DEBUG):
    for i in range(1_000_000):
        logger.debug("第 %d 次", i)
\`\`\`

或聚合后打一条:

\`\`\`python
logger.debug("处理 %d 次", 1_000_000)
\`\`\`

### 陷阱 5:日志里直接拼 SQL/JSON 导致可读性差

\`\`\`python
# 反模式:超长 SQL 一行打出来,可读性极差
logger.debug("SQL: %s", huge_sql)

# 反模式:大 JSON 一行打出来,grep 都难
logger.debug("响应: %s", json.dumps(big_response))
\`\`\`

**解决**:

- SQL/JSON 用 DEBUG 级别,生产关闭。
- 必要时只 log 关键字段或摘要(hash、长度)。
- 大对象用 \`logger.isEnabledFor\` 守卫,避免无谓序列化。

### 陷阱 6:多进程写同一日志文件

\`logging\` 的 FileHandler 不支持多进程并发写,会出现日志交错、丢失。

**解决**:

- 每个进程写独立文件(文件名带 PID)。
- 用 \`ConcurrentLogHandler\` 第三方库(加文件锁)。
- 用 QueueHandler + 单独的日志进程。
- 用 syslog/journald 等系统日志(天然支持多进程)。
- 升级到专业方案(Loki/ELK),不再用文件。

### 陷阱 7:异常日志丢失 traceback

\`\`\`python
try:
    risky()
except Exception as e:
    logger.error("失败: %s", e)  # 只有 e 的 message,没有 traceback!
\`\`\`

\`logger.error("...%s", e)\` 只记录异常的 \`str(e)\`,不含调用栈。排查时看不到出错位置。

**解决**:用 \`logger.exception()\` 或 \`exc_info=True\`:

\`\`\`python
logger.exception("失败: %s", e)        # 自动带 traceback
logger.error("失败", exc_info=True)     # 显式带 traceback
\`\`\`

---

## 十三、日志反模式 vs 正确做法对照表

| 反模式                                   | 后果                       | 正确做法                                   |
| ---------------------------------------- | -------------------------- | ------------------------------------------ |
| 用 print 当日志                          | 无级别无控制               | getLogger(__name__)                        |
| 到处用 root logger                       | 无法按模块控制             | 每模块 __name__                            |
| logger 名乱起                            | 无法定位                   | __name__ 树形命名                          |
| 只 log "error" 不带上下文                | 无法排查                   | 带 order_id/user_id/reason                 |
| 用 f-string 格式化                       | 性能浪费                   | 用 % 懒求值                                |
| 异常用 error 不带 traceback              | 看不到堆栈                 | exception() 或 exc_info=True               |
| 密码 token 明文进日志                    | 安全违规                   | 脱敏 Filter + 白名单                       |
| 库自己配 handler                         | 污染宿主                   | NullHandler                                |
| basicConfig 调多次                       | 第二次无效                 | dictConfig 或 force=True                   |
| 子 logger 配 handler 又 propagate        | 重复输出                   | propagate=false 或只在 root 配             |
| 缓存未命中打 ERROR                       | ERROR 噪音                 | DEBUG/INFO                                 |
| 循环里高频打 INFO                        | 刷屏                       | DEBUG 或聚合                               |
| 多进程写同一文件                         | 交错丢失                   | 分文件/QueueHandler/syslog                 |
| 日志里拼大 SQL/JSON                      | 可读性差                   | DEBUG 级 + isEnabledFor 守卫               |
| 日志没时间戳/来源                        | 无法对齐排查               | Formatter 带 asctime/name                  |
| 把业务输出和日志混用 print               | 无法区分                   | 输出用 print/返回值,日志用 logging        |
| WARNING 持续无人处理                     | 噪音泛滥                   | 要么修复要么静默,建立告警                  |

---

## 十四、本章小结

本章系统讲解了日志最佳实践与常见陷阱,核心要点回顾:

| 主题 | 要点 |
|------|------|
| 模块化日志 | 每个模块用 getLogger(__name__),不用 root |
| 格式化 | 用 % 懒求值,不用 f-string |
| 异常 | 用 logger.exception() 自动带 traceback |
| 脱敏 | 密码/token/身份证必须脱敏 |
| 异步 | 高频日志用 QueueHandler 避免阻塞 |
| 库的日志 | 用 NullHandler,不强制配置 |
| 级别克制 | ERROR 只用于真错误,WARNING 要可处理 |
| basicConfig | 只在 root 无 handler 时生效,用 force=True |
| propagation | 子 logger 默认向上传播,可能重复 |
| 循环日志 | 高频日志用 DEBUG,或聚合后输出 |

一句话总结:**日志是程序员的"黑匣子",写好日志,故障时才不会两眼一抹黑。**

## 十五、易错点小结

| 易错点 | 错误做法 | 正确做法 |
|--------|----------|----------|
| basicConfig 调多次 | 期望第二次生效 | 用 force=True 或 dictConfig |
| 子 logger 配 handler 又 propagate | 重复输出 | propagate=false 或只在 root 配 |
| 用 f-string 格式化日志 | 性能浪费 | 用 % 懒求值 |
| 异常用 error() | 看不到堆栈 | 用 exception() 或 exc_info=True |
| 敏感信息明文进日志 | 安全违规 | 脱敏 Filter |
| 库自己配 handler | 污染宿主 | 用 NullHandler |
| 缓存未命中打 ERROR | ERROR 噪音 | 用 DEBUG/INFO |
| 循环里高频打 INFO | 刷屏 | 用 DEBUG 或聚合 |
| 多进程写同一文件 | 交错丢失 | 分文件/QueueHandler |
| root logger 不配 | 警告输出到 stderr | 显式配 root 或用 dictConfig |

---

至此,日志 logging 部分全部讲完。下一章我们进入配置文件的世界,看看如何用 YAML/TOML/INI 把"会变的"和"不变的"分离。`
  },
];