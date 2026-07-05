// =============================================================
// Python vs Java 语言对比教程 —— 第 4 批章节（标准库与生态组，共 5 章）
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: "pyjava-stdlib",
    icon: "📖",
    group: "标准库与生态",
    title: "标准库对比",
    content: `## 第16章：标准库对比

### 一、两种截然不同的哲学

如果把一门编程语言的「标准库」比作买房时开发商送的「精装修」,那么 Python 和 Java 的交付标准天差地别:

- **Python 是「全屋精装 + 家电齐全」**:开箱即用,拎包入住。os、sys、re、json、datetime、urllib、http、sqlite3、csv、logging、argparse、unittest、pathlib、dataclasses、typing、collections、itertools、functools......你日常 80% 的需求都不需要装第三方库。这就是 Python 社区著名的 \"batteries included\"(内置电池)哲学。
- **Java 是「毛坯 + 强电箱」**:JDK 给了你一套基础但深入的「原语」(java.lang、java.util、java.io、java.nio、java.time、java.sql、java.net......),但很多「家用功能」要你自己去 Maven 中央仓库采购。比如想优雅地处理字符串?得引 commons-lang3;想解析 JSON?得引 Jackson 或 Gson;想写个 HTTP 客户端?JDK 11 才有 HttpClient,之前得用 OkHttp 或 Apache HttpClient。

这两种哲学没有绝对优劣,但深刻影响了两门语言的开发体验和生态走向。本章我们会从覆盖范围、模块对应关系、时间 API 演进等多个维度做一次系统对比。

### 二、Python 标准库全貌:batteries included

Python 标准库按功能大致可以分为以下几大类:

| 分类 | 代表模块 | 用途 |
|------|---------|------|
| 系统与 OS | os、sys、platform、subprocess、shutil、signal | 进程、文件系统、环境变量、子进程 |
| 文件与路径 | pathlib、os.path、tempfile、glob、fnmatch | 路径操作、临时文件、模式匹配 |
| IO 与流 | io、csv、json、pickle、shelve | 流读写、序列化、CSV/JSON |
| 文本处理 | re、string、textwrap、unicodedata、difflib | 正则、字符串、文本对齐、diff |
| 数据结构 | collections、heapq、bisect、array、enum | 命名元组、计数器、双端队列、堆 |
| 函数式工具 | itertools、functools、operator | 迭代器组合、装饰器、偏函数 |
| 日期时间 | datetime、time、calendar、zoneinfo | 日期、时间、时区 |
| 数学与数值 | math、cmath、decimal、fractions、statistics | 数学函数、高精度、统计 |
| 网络 | socket、http、urllib、ftplib、smtplib、xmlrpc | 底层网络、HTTP、邮件 |
| 加密 | hashlib、hmac、secrets、ssl | 哈希、HMAC、随机数、SSL |
| 并发 | threading、multiprocessing、concurrent.futures、asyncio | 线程、进程、异步 |
| 类型与反射 | typing、inspect、types、dataclasses | 类型注解、内省、数据类 |
| 开发工具 | unittest、doctest、argparse、logging、warnings、traceback | 测试、CLI、日志、警告 |
| 调试与性能 | pdb、cProfile、timeit、tracemalloc | 调试器、性能分析、计时 |
| 编码与压缩 | base64、binascii、zlib、gzip、bz2、lzma、tarfile、zipfile | 编码、压缩归档 |
| 数据库 | sqlite3、dbm | 内嵌数据库、键值存储 |
| 国际化 | gettext、locale | 多语言、本地化 |
| 内部 DSL | xml、html、email、json | 标记语言解析 |

一个典型场景:写一个「读取 CSV、按某列分组求和、输出 JSON」的小工具,Python 一行 import 都不用出标准库:

\`\`\`python
import csv
import json
from collections import defaultdict
from pathlib import Path

# 读取 sales.csv,按 product 分组求 amount 之和,输出 result.json
totals = defaultdict(float)
with Path("sales.csv").open(encoding="utf-8") as f:
    for row in csv.DictReader(f):
        totals[row["product"]] += float(row["amount"])

Path("result.json").write_text(
    json.dumps(totals, indent=2, ensure_ascii=False),
    encoding="utf-8",
)
\`\`\`

这段代码用到的 csv、json、collections、pathlib 全是标准库,零依赖即可运行。这是 \"batteries included\" 最直观的体现。

### 三、Java JDK 标准库全貌:深度优先

Java 的 JDK 同样庞大,但风格截然不同——它更偏「底层原语」,把「易用」留给了第三方生态。JDK 主要包如下:

| 包 | 作用 | 备注 |
|----|------|------|
| java.lang | 语言核心:String、Math、Thread、Exception、System | 自动导入,无需 import |
| java.util | 集合框架:List、Map、Set、Queue,还有 Scanner、Random、Properties | 最常用的包之一 |
| java.io | 字节/字符流:InputStream、Reader、File | 老式 IO,阻塞式 |
| java.nio | 新 IO:Buffer、Channel、Selector | 非阻塞、面向缓冲区 |
| java.nio.file | 文件路径与操作:Path、Files、FileSystem | Java 7 引入,对标 Python pathlib |
| java.time | 时间日期:LocalDate、Instant、ZonedDateTime | Java 8 引入,替代旧的 Date/Calendar |
| java.sql | JDBC:Connection、PreparedStatement、ResultSet | 数据库访问标准 |
| java.net | 网络:Socket、URL、URI、HttpClient(JDK 11+) | 老牌网络 API |
| java.math | 高精度:BigInteger、BigDecimal | 任意精度整数与小数 |
| java.util.concurrent | 并发:Executor、Lock、AtomicXxx、ConcurrentHashMap | 比Python更丰富 |
| java.util.stream | 流式 API:Stream、Collector | Java 8 函数式风格 |
| java.util.regex | 正则:Pattern、Matcher | 对标 Python re |
| java.util.function | 函数式接口:Function、Predicate、Consumer | Java 8 lambda 基础 |
| java.util.logging | 日志:Logger、Handler | 可用但生态常用 logback/log4j2 |
| javax.\* | 扩展:javax.crypto、javax.xml、javax.annotation | 历史 \"扩展包\" |
| java.text | 文本格式化:NumberFormat、DateFormat、MessageFormat | 国际化格式 |
| java.security | 安全:MessageDigest、Signature、KeyStore | 加密、签名、密钥库 |

同样是「读取 CSV 分组求和输出 JSON」,Java 版本即使不引第三方库也能做,但代码量明显更多,而且 CSV 解析需要手写或用 java.util.Scanner 拆分,JSON 需要用不太友好的 javax.json(JDK 不内置 JSON API):

\`\`\`java
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;

public class SalesAggregator {
    public static void main(String[] args) throws IOException {
        // JDK 没有内置 CSV 解析器,只能手动按逗号拆分(简单场景可用,复杂引号场景会出错)
        Map<String, Double> totals = new HashMap<>();
        Pattern comma = Pattern.compile(",");
        try (BufferedReader reader = Files.newBufferedReader(Path.of("sales.csv"))) {
            String header = reader.readLine();
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = comma.split(line);
                String product = parts[0];
                double amount = Double.parseDouble(parts[1]);
                totals.merge(product, amount, Double::sum);
            }
        }
        // 输出 JSON:JDK 没有内置 JSON 库,只能手拼字符串(生产会用 Jackson/Gson)
        StringBuilder sb = new StringBuilder("{\\n");
        int i = 0;
        for (var entry : totals.entrySet()) {
            sb.append("  \\\\\"").append(entry.getKey()).append("\\\\\": ")
              .append(entry.getValue());
            if (++i < totals.size()) sb.append(",");
            sb.append("\\n");
        }
        sb.append("}");
        Files.writeString(Path.of("result.json"), sb.toString());
    }
}
\`\`\`

可以看到:Java JDK 给了你 Files、Map.merge 这样的好工具,但 CSV 解析和 JSON 序列化都要「自己动手」。这就是为什么 Java 项目几乎必然引第三方库。

### 四、覆盖范围对比:广度 vs 深度

| 维度 | Python 标准库 | Java JDK |
|------|--------------|----------|
| CSV 解析 | csv 模块,开箱即用 | 无,需引 commons-csv 或 opencsv |
| JSON 序列化 | json 模块,开箱即用 | 无,需引 Jackson/Gson/fastjson |
| HTTP 客户端 | urllib.request(够用但老),常用 requests | JDK 11+ 才有 HttpClient,之前需 OkHttp |
| HTTP 服务端 | http.server(简单 demo 用) | com.sun.net.httpserver(仅 demo),生产用 servlet 容器 |
| 正则 | re,函数式风格 | java.util.regex,面向对象风格 |
| 路径 | pathlib(现代)、os.path(老式) | java.nio.file.Path/Files(Java 7+) |
| 日志 | logging,标准库即可用于生产 | java.util.logging 可用但生态用 logback |
| 测试 | unittest(标准库)+ doctest | JUnit 需另引(非 JDK) |
| 命令行参数 | argparse,标准库 | 无,需 picocli 或 commons-cli |
| 模板引擎 | string.Template(基础) | 无,需 Thymeleaf/Freemarker |
| 加密 | hashlib、hmac、secrets | java.security、javax.crypto,更底层 |
| 异步 | asyncio(标准库,完整) | CompletableFuture + 异步 HTTP(需第三方) |
| 数据库 | sqlite3(内置!) | JDBC API 但需驱动包 |
| 邮件 | smtplib、email(标准库) | javax.mail(需引依赖) |
| XML | xml.etree.ElementTree | javax.xml.parsers、JAXB(部分已移除) |
| 单元测试 mock | unittest.mock(标准库) | 需引 Mockito |
| 数学统计 | statistics(基础统计) | 无,需 Apache Commons Math |
| 压缩 | gzip、bz2、lzma、zipfile、tarfile | java.util.zip(gzip/zip)、无 tar |
| 进程管理 | subprocess(功能完整) | ProcessBuilder |

一句话总结:**Python 标准库「广而实用」,Java JDK「深而基础」**。Python 把「日常 80% 的事」都覆盖了;Java 把「底层 20% 的能力」做得很扎实,剩下 80% 的便利交给生态。

### 五、常用模块对应关系表

下表是高频「找东西」对照,迁移时非常实用:

| 功能 | Python | Java |
|------|--------|------|
| 文件路径 | pathlib.Path | java.nio.file.Path |
| 文件读写 | open() / Path.read_text | java.nio.file.Files |
| 正则匹配 | re | java.util.regex |
| JSON | json | Jackson / Gson / org.json |
| 日期时间 | datetime | java.time |
| 集合 | collections、内置 list/dict/set | java.util (List/Map/Set) |
| 函数式 | itertools、functools | java.util.stream、java.util.function |
| HTTP 客户端 | urllib / requests | java.net.http.HttpClient / OkHttp |
| 日志 | logging | SLF4J + Logback |
| 命令行 | argparse | picocli / commons-cli |
| 字符串工具 | str 方法 | commons-lang3 StringUtils |
| CSV | csv | commons-csv / opencsv |
| 数据库 | sqlite3 / psycopg2 | JDBC + 驱动 |
| 异步 IO | asyncio | NIO / Netty / Project Loom |
| 单元测试 | unittest / pytest | JUnit 5 / TestNG |
| Mock | unittest.mock | Mockito |
| 加密哈希 | hashlib | java.security.MessageDigest |

### 六、Python \"batteries included\" 的优势

**1. 上手门槛极低**。初学者装好 Python,几分钟就能写出能干活的小脚本,不用先学 pip 和依赖管理。这是 Python 在教学、运维、科研领域流行的关键原因。

**2. 环境可移植性强**。同一份 .py 文件丢到任何一台装了 Python 的机器上往往就能跑,不依赖一堆 jar 包。这对「在服务器上临时跑个脚本」的场景非常友好。

**3. 减少依赖冲突**。标准库版本随 Python 解释器一起升级,不存在「A 库要 numpy 1.20,B 库要 numpy 1.24」的冲突(至少标准库内部不会)。

**4. 官方背书,长期稳定**。标准库的 API 由 Python 官方维护,废弃前会有 DeprecationWarning,生命周期远比第三方库长。

**5. 文档统一**。docs.python.org 一处看所有标准库文档,风格一致,示例齐全。

\`\`\`python
# 一个只用标准库的「下载网页并统计词频」的完整脚本
import urllib.request
import re
from collections import Counter
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip = False
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self.skip = True
    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = False
    def handle_data(self, data):
        if not self.skip:
            self.text.append(data)

url = "https://www.python.org"
html = urllib.request.urlopen(url).read().decode("utf-8")
parser = TextExtractor()
parser.feed(html)
words = re.findall(r"[a-zA-Z]+", " ".join(parser.text))
print(Counter(words).most_common(10))
\`\`\`

上面这段代码下载网页、解析 HTML、提取文本、分词、统计——全程只用标准库,这在 Java 里几乎不可想象。

### 七、Java 为什么常用第三方库

Java 的「不内置」是有历史原因和设计考量的:

**1. 历史包袱与兼容性承诺**。Java 从 1995 年到现在,对二进制兼容性极度保守。一旦某个 API 进了 JDK,就很难再删(否则老代码崩)。所以 JDK 对新增 API 非常谨慎,宁可不进,也不进一个将来要后悔的。对比之下,Python 标准库「进进出出」更灵活(2to3、模块废弃时有发生)。

**2. \"JCP\" 流程繁琐**。Java 新增标准库要走 JCP(Java Community Process),从提案到落地往往几年。等不及的社区就先做第三方库,等成熟了再「招安」进 JDK。java.time 就是从 Joda-Time 借鉴的,HttpClient 是 Java 11 才进的。

**3. 厂商中立**。Java 由 Oracle 主导,不愿在 JDK 里偏袒某个 JSON/HTTP/日志实现(怕被说垄断)。把这些留给开源生态自由竞争,反而催生了 Jackson、OkHttp、SLF4J 这样优秀的库。

**4. 企业偏好「可替换」**。企业级 Java 项目希望组件可替换(比如日志后端从 log4j 换 logback 不改业务代码),所以 JDK 只定 SPI 接口,实现交给第三方。这就是为什么 commons-lang3 这种「工具类」库在 Java 里几乎人手一份:

\`\`\`java
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.time.DateUtils;

// StringUtils 提供了 JDK String 没有的便捷方法
String s = "  hello  ";
StringUtils.isBlank(s);        // true(比 String.isEmpty 更强,JDK 没有)
StringUtils.trim(s);           // "hello"
StringUtils.repeat("-", 10);   // "----------"
StringUtils.join(new String[]{"a","b","c"}, ", "); // "a, b, c"
ArrayUtils.contains(new int[]{1,2,3}, 2);           // true
\`\`\`

这些功能 Python 用 \`s.strip()\`、\`"-"\` * 10\`、\`",".join(list)\` 内置就能做,而 Java 必须引 commons-lang3。

### 八、时间 API 演进:教科书级对比

时间 API 是两门语言「标准库演进」最经典的对比案例。

**Python 的 datetime**:\`datetime\` 模块从早期就比较「够用」,\`datetime\`、\`date\`、\`time\`、\`timedelta\` 几个类覆盖了 90% 场景。时区处理早期靠第三方 pytz,Python 3.9 引入了标准库 \`zoneinfo\`,终于把时区「扶正」:

\`\`\`python
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

now = datetime.now()
tomorrow = now + timedelta(days=1)

# 时区:Python 3.9+ 标准库 zoneinfo
utc_now = datetime.now(timezone.utc)
shanghai_time = datetime.now(ZoneInfo("Asia/Shanghai"))
print(shanghai_time.astimezone(ZoneInfo("America/New_York")))
\`\`\`

Python 时间 API 的优点是「平缓演进,向后兼容」,缺点是早期 \`datetime\` 的时区设计有些「坑」(naive vs aware 混用容易出错),社区至今还在用第三方库 dateutil 处理复杂时间运算。

**Java 的 java.time**:\`java.time\` 是 Java 8(2014)引入的,在此之前 Java 用了十几年糟糕的 \`java.util.Date\` 和 \`java.util.Calendar\`——这两个类设计有严重问题:月份从 0 开始、可变(非线程安全)、时区处理混乱。社区被迫用 Joda-Time。Java 8 的 \`java.time\` 几乎照搬了 Joda-Time 的设计,所有类不可变、线程安全、API 清晰:

\`\`\`java
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class TimeDemo {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        long daysBetween = ChronoUnit.DAYS.between(today, tomorrow);

        // 时区
        ZonedDateTime shanghai = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
        ZonedDateTime ny = shanghai.withZoneSameInstant(ZoneId.of("America/New_York"));

        // 格式化
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        System.out.println(shanghai.format(fmt));
        System.out.println(ny.format(fmt));

        // 时间戳
        Instant instant = Instant.now();
        System.out.println(instant.getEpochSecond());
    }
}
\`\`\`

Java 时间 API 的演进路径是典型的「先做错→社区做第三方→官方吸取重做」。结果是 java.time 设计非常优秀,甚至比 Python 的 datetime 还要严谨(不可变、类型细分 LocalDate/LocalDateTime/Instant/ZonedDateTime),代价是迁移周期长达十年(很多老系统还在用 Date)。

### 九、小结与选型建议

| 选型 | Python 标准库 | Java JDK |
|------|--------------|----------|
| 适合场景 | 脚本、运维、数据处理、原型、教学 | 企业级应用、大型系统、长期维护项目 |
| 优势 | 广度覆盖、零依赖、上手快 | 底层扎实、并发丰富、SPI 可替换 |
| 劣势 | 部分模块性能一般、API 偶有不一致 | 日常工具缺失、必须依赖第三方 |
| 生态关系 | 标准库覆盖广,第三方做「增强」(requests 比 urllib 好用) | 标准库做基础,第三方做「补全」(Jackson 补 JSON) |

记住一个原则:**Python 标准库是「80 分起步」,第三方库是「锦上添花」;Java JDK 是「20 分起步」,第三方库是「雪中送炭」**。理解了这个差异,你就能解释为什么 Java 项目的 pom.xml 动辄几十个依赖,而 Python 脚本常常一行 import 都不用出标准库。
`,
  },
  {
    id: "pyjava-packaging",
    icon: "📦",
    group: "标准库与生态",
    title: "包管理：pip vs Maven/Gradle",
    content: `## 第17章：包管理：pip vs Maven/Gradle

### 一、包管理要解决的四个问题

任何一门编程语言,只要生态壮大到一定程度,就必须回答四个问题:

1. **发现**:怎么找到需要的第三方库?(「我要一个解析 Excel 的库」)
2. **安装**:怎么把库下载到本地并配置好?
3. **声明**:项目依赖了哪些库、什么版本?怎么让别的机器复现?
4. **隔离**:不同项目依赖同一库的不同版本,怎么并存?

Python 和 Java 给出了截然不同的答案。Python 长期「轻管理重自由」,直到近年才有 poetry/uv 这样的现代工具;Java 则从早期就被 Maven/Gradle 「强约束」,工程化更成熟。本章我们对比这两套体系。

### 二、Python 包管理:从 pip 到 uv 的演进

#### 2.1 pip + requirements.txt:最朴素的方案

\`pip\` 是 Python 官方的包管理器,从 PyPI(Python Package Index)下载安装包:

\`\`\`bash
pip install requests          # 安装最新版
pip install requests==2.31.0  # 指定版本
pip install "django>=4.0,<5.0"  # 版本范围
pip freeze > requirements.txt  # 导出当前环境已装包
pip install -r requirements.txt  # 按 requirements.txt 安装
\`\`\`

requirements.txt 长这样:

\`\`\`text
requests==2.31.0
django==4.2.7
numpy==1.26.0
pandas==2.1.3
\`\`\`

这套方案简单,但有三大痛点:

**痛点 1:不区分直接依赖和间接依赖**。requirements.txt 把所有包(包括依赖的依赖)全列出来,导致文件臃肿,升级时不知道哪个是「你真正要的」。

**痛点 2:没有锁文件(lock)概念**。requirements.txt 里写 \`requests>=2.0\`,在不同时间安装可能装到不同版本,无法保证「同事复现我的环境」。

**痛点 3:依赖冲突解决能力弱**。A 要 numpy 1.20,B 要 numpy 1.24,pip 默认装最新版,可能让 A 崩溃而无人知晓。

#### 2.2 venv/virtualenv:虚拟环境

为解决「不同项目依赖不同版本」的问题,Python 引入虚拟环境——每个项目一个独立的 Python 解释器目录,互不干扰:

\`\`\`bash
python -m venv .venv           # 创建虚拟环境
source .venv/bin/activate      # 激活(macOS/Linux)
.venv\\Scripts\\activate         # 激活(Windows)
pip install requests           # 装到 .venv 里,不影响全局
deactivate                     # 退出虚拟环境
\`\`\`

virtualenv 是第三方版,功能类似但更快、支持更多 Python 版本。这套机制本质上是用「目录隔离」模拟「项目级依赖隔离」,简单粗暴但有效。

#### 2.3 poetry:现代化的依赖管理

poetry(2018 年出现)是 Python 生态对 npm/cargo 的回应,引入了:

- **pyproject.toml**:声明项目元数据和依赖(对标 package.json / Cargo.toml)
- **poetry.lock**:精确锁定所有依赖版本(对标 package-lock.json),保证可复现
- **依赖解析**:自动解决版本冲突,支持语义化版本
- **虚拟环境自动管理**:\`poetry install\` 自动创建虚拟环境

\`\`\`bash
poetry new my-project        # 创建项目结构
poetry add requests          # 添加依赖(自动写入 pyproject.toml)
poetry add pytest --group dev  # 添加开发依赖
poetry install               # 按 pyproject.toml + poetry.lock 安装
poetry shell                 # 进入虚拟环境
\`\`\`

pyproject.toml 示例:

\`\`\`toml
[tool.poetry]
name = "my-project"
version = "0.1.0"
description = "示例项目"
authors = ["zhangsan <zhangsan@example.com>"]

[tool.poetry.dependencies]
python = "^3.10"
requests = "^2.31"
django = "^4.2"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4"
black = "^23.0"
\`\`\`

#### 2.4 uv:Rust 写的新一代工具

uv 是 Astral 公司(用 Rust 写 ruff 的团队)2024 年推出的,主打「极快」:用 Rust 重写 pip/poetry 的功能,安装速度比 pip 快 10-100 倍,全局缓存共享,占盘小:

\`\`\`bash
uv pip install requests         # 兼容 pip 语法
uv venv                          # 创建虚拟环境
uv pip install -r requirements.txt
uv add requests                  # 类似 poetry add
uv lock                          # 生成 lock 文件
uv run python script.py          # 在项目环境里跑脚本
\`\`\`

uv 同时兼容 pip 语法和 poetry 的项目管理,正在快速成为 Python 社区的新宠。

### 三、Java 包管理:Maven 的「约定优于配置」

#### 3.1 Maven 是什么

Maven 是 Java 生态最主流的构建 + 依赖管理工具(2004 年 Apache 推出),核心理念是「**约定优于配置**」(Convention over Configuration):

- 项目目录结构是固定的(\`src/main/java\`、\`src/test/java\`、\`src/main/resources\`)
- 构建生命周期是固定的(compile、test、package、install、deploy)
- 你只需要写 \`pom.xml\` 声明依赖,Maven 替你管理一切

#### 3.2 pom.xml:项目对象模型

\`\`\`xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <version>3.2.0</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
\`\`\`

每个依赖用 GAV 坐标唯一标识:\`groupId:artifactId:version\`。Maven 从中央仓库(Maven Central)下载依赖到本地 \`~/.m2/repository\` 缓存,多个项目共享。

#### 3.3 Maven 依赖调解:最近者优先

当出现版本冲突时,Maven 用「最近者优先」(nearest definition)策略:

\`\`\`text
你的项目 → A(依赖 log4j:1.2)
         → B(依赖 log4j:2.0)
         → C(依赖 log4j:1.1)
\`\`\`

如果 A 和 B 在你的 pom 里深度相同,Maven 会选「先声明的那个」。这个机制比 pip 的「装最新版」要可控得多,但仍然不够智能(不会做语义化版本范围求解)。

可以用 \`mvn dependency:tree\` 查看完整依赖树:

\`\`\`bash
mvn dependency:tree
# 输出示例:
# com.example:my-app:jar:1.0.0
# +- org.springframework.boot:spring-boot-starter-web:jar:3.2.0
# |  +- org.springframework.boot:spring-boot-starter:jar:3.2.0
# |  |  +- org.springframework.boot:spring-boot:jar:3.2.0
# |  |  \\- jakarta.annotation:jakarta.annotation-api:jar:2.1.1
# |  +- org.springframework:spring-web:jar:6.1.1
# |  \\- org.springframework:spring-webmvc:jar:6.1.1
# \\- org.junit.jupiter:junit-jupiter:jar:5.10.0:test
\`\`\`

#### 3.4 Maven scope:依赖作用域

Maven 用 \`scope\` 控制依赖在「什么阶段」可用:

| scope | 编译 | 测试 | 运行 | 打包 | 典型场景 |
|-------|------|------|------|------|---------|
| compile(默认) | ✓ | ✓ | ✓ | ✓ | 主代码依赖,如 Spring |
| test | ✗ | ✓ | ✗ | ✗ | 仅测试用,如 JUnit |
| provided | ✓ | ✓ | ✗ | ✗ | 运行时容器提供,如 Servlet API |
| runtime | ✗ | ✓ | ✓ | ✓ | 仅运行时需要,如 JDBC 驱动 |
| system | ✓ | ✓ | ✗ | ✗ | 本地 jar,不推荐 |

\`\`\`xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
    <scope>runtime</scope>  <!-- 编译时不需要,运行时才加载 -->
</dependency>
\`\`\`

这种 scope 机制是 Java 依赖隔离的核心——「编译依赖」「测试依赖」「运行依赖」分得很清楚,而 Python 的 requirements.txt 早期没有这种区分(后来用 dev/optional extras 弥补)。

### 四、Gradle:更灵活的构建工具

Gradle(2008 年)结合了 Maven 的依赖管理和 Ant 的灵活性,用 Groovy 或 Kotlin 写构建脚本,更简洁:

\`\`\`groovy
// build.gradle (Groovy DSL)
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.2.0'
}

group = 'com.example'
version = '1.0.0'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web:3.2.0'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
    runtimeOnly 'mysql:mysql-connector-java:8.0.33'
}

test {
    useJUnitPlatform()
}
\`\`\`

Kotlin DSL 版本(\`build.gradle.kts\`)更类型安全:

\`\`\`kotlin
plugins {
    java
    id("org.springframework.boot") version "3.2.0"
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:3.2.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    runtimeOnly("mysql:mysql-connector-java:8.0.33")
}
\`\`\`

Gradle 的 \`configurations\`(implementation、api、testImplementation、runtimeOnly、compileOnly)对应 Maven 的 scope,但更细分:

- \`implementation\`:编译 + 运行,但不暴露给下游(类似 Maven compile 但更严格)
- \`api\`:编译 + 运行 + 暴露给下游(库项目用)
- \`compileOnly\`:仅编译(类似 provided)
- \`runtimeOnly\`:仅运行(类似 runtime)
- \`testImplementation\`:仅测试编译 + 运行

### 五、依赖管理对比

| 维度 | Python | Java(Maven/Gradle) |
|------|--------|---------------------|
| 包仓库 | PyPI(pypi.org) | Maven Central(mvnrepository.com) |
| 包数量 | 50 万+ | 60 万+(含插件) |
| 声明文件 | requirements.txt / pyproject.toml | pom.xml / build.gradle |
| 锁文件 | poetry.lock / uv.lock | Maven 无(版本写死在 pom) / Gradle 有 lock |
| 版本范围 | \>=、<、~(兼容)、==(精确) | [1.0,2.0)、\${project.version} |
| 冲突解决 | pip 弱(装最新),poetry/uv 强(语义化求解) | Maven 最近者优先,Gradle 默认最高版 |
| 依赖作用域 | dev / optional extras(弱) | compile/test/provided/runtime(强) |
| 传递依赖 | 默认装,但难查看 | 默认装,可查看树 |
| 隔离机制 | venv(虚拟环境,目录隔离) | scope + 多模块(项目内隔离) |
| 离线缓存 | ~/.cache/pip | ~/.m2/repository |

### 六、Python 的「依赖地狱」

Python 的依赖管理长期被吐槽,典型问题:

**问题 1:全局污染**。早期没有虚拟环境,所有包都装到全局 site-packages,升级一个包可能让另一个项目崩。

**问题 2:版本冲突难解**。A 要 \`numpy<1.20\`,B 要 \`numpy>=1.24\`,pip 报错后只能手动取舍,没有 Maven 那样的依赖树可视化。

**问题 3:间接依赖不可控**。requirements.txt 只列直接依赖时,间接依赖版本飘移;全列出来时,文件臃肿难维护。

**问题 4:ABI 兼容**。Python 包有 C 扩展(numpy、pandas),不同 Python 版本、不同操作系统要装不同的 wheel,跨平台部署时容易踩坑(「我这能跑你那不能跑」)。

\`\`\`python
# 经典场景:同一个全局环境装了两个互相冲突的版本
# 项目A需要:django==3.2
# 项目B需要:django==4.2
# 没有虚拟环境的话,只能装一个,另一个就崩
# 解决:每个项目一个 venv
\`\`\`

poetry/uv 通过 lock 文件和依赖解析大幅缓解了这些问题,但相比 Maven 仍有差距——比如 Python 没有 Maven 的 scope 概念,「测试依赖」和「运行依赖」的区分靠 conventions 而非机制。

### 七、Java 的「约定优于配置」优势

Maven 的「约定优于配置」让 Java 项目高度标准化:

**1. 目录结构统一**。任何 Maven 项目都是 \`src/main/java\`、\`src/test/java\`,换项目无需重新理解结构。

**2. 生命周期固定**。\`mvn clean package\`、\`mvn install\`、\`mvn deploy\` 在所有项目里含义一致,CI/CD 脚本可复用。

**3. 多模块支持原生**。一个父 pom 管理多个子模块,版本统一控制,这是 Python 弱项(Python 的 monorepo 需要自己搭 workspace)。

\`\`\`xml
<!-- 父 pom.xml 管理多模块 -->
<modules>
    <module>common</module>
    <module>service-user</module>
    <module>service-order</module>
    <module>web-admin</module>
</modules>
\`\`\`

**4. scope 隔离强**。JDBC 驱动用 \`runtime\` scope,不会污染编译期;JUnit 用 \`test\` scope,不会打进生产 jar。

### 八、虚拟环境 vs 依赖作用域:两种隔离哲学

这是 Python 和 Java 最大的思维差异:

**Python:用「环境」隔离项目**。每个项目一个 venv,里面装自己版本的依赖,项目之间物理隔离。优点是简单直观,缺点是每个项目都要重新装一遍依赖(虽然有缓存),且无法在同一项目内区分「编译依赖」和「运行依赖」。

**Java:用「scope」隔离作用域**。一个项目的所有依赖都在一个 classpath 里,但用 scope 控制哪些阶段可用。优点是精细化,缺点是不同项目仍可能依赖冲突(所以有 Gradle 的 module metadata、Maven Enforcer 插件)。

\`\`\`bash
# Python:每个项目独立环境
cd ~/projects/A && source .venv/bin/activate   # A 的环境,装 django 3.2
cd ~/projects/B && source .venv/bin/activate   # B 的环境,装 django 4.2
\`\`\`

\`\`\`bash
# Java:所有项目共享 ~/.m2,但用 scope 控制作用域
# 项目 A 的 pom.xml 里 JUnit 是 test scope,不会打进生产 jar
# 项目 B 同理,但 A 和 B 可以共享 ~/.m2 里的同一个 junit-5.10.0.jar
\`\`\`

### 九、现代趋势:趋同还是分化?

有意思的是,Python 和 Java 的包管理正在互相学习:

- **Python 学 Java**:poetry/uv 引入了 lock 文件、语义化版本解析、项目元数据声明(对标 pom.xml)。
- **Java 学 Python**:Gradle 的 Kotlin DSL 让构建脚本更简洁;Spring Boot 的 starter 概念类似于 Python 的「一键装全家桶」。

uv 的出现尤其值得关注——它用 Rust 重写了整个 Python 包管理栈,速度极快,正在推动 Python 包管理向 Java 级别的工程化靠拢。

### 十、小结

| 你的需求 | Python 方案 | Java 方案 |
|---------|------------|----------|
| 快速装个库试试 | pip install | mvn install / 在 pom 加 dependency |
| 小脚本/工具 | pip + requirements.txt | (Java 不适合小脚本) |
| 中型项目 | poetry / uv + pyproject.toml | Maven + pom.xml |
| 大型企业项目 | poetry + monorepo(workspace) | Maven/Gradle 多模块 |
| 严格可复现 | poetry.lock / uv.lock | Gradle lock + Maven enforcer |
| 区分测试/运行依赖 | poetry group dev | scope = test / runtime |

一句话:**Python 包管理「轻量灵活」,适合快速迭代;Java 包管理「重而严谨」,适合长期协作**。Python 的痛点正在被 poetry/uv 解决,Java 的繁琐正在被 Gradle Kotlin DSL 缓解,两者在「现代工程化」的路上逐渐趋同。
`,
  },
  {
    id: "pyjava-build",
    icon: "🏗️",
    group: "标准库与生态",
    title: "构建与部署",
    content: `## 第18章：构建与部署

### 一、构建部署的核心问题

代码写完不是终点,「把代码变成可运行的产物并交付到服务器」才是工程化的最后一公里。这一公里涉及:

1. **构建**:源码 → 可分发产物(jar / wheel / 可执行文件)
2. **打包**:产物 + 依赖 → 自包含单元
3. **分发**:产物上传到仓库 / 镜像 / 服务器
4. **部署**:在目标环境启动 + 配置 + 监控
5. **回滚**:出问题时快速恢复

Python 和 Java 在这一公里上的体验天差地别。Java 因为「编译型 + JVM」的天然优势,构建部署高度标准化;Python 因为「解释型 + 动态依赖」的特性,长期是「工程化短板」。本章我们系统对比。

### 二、Python 构建:没有标准工具的痛

#### 2.1 Python 构建的本质

Python 是解释型语言,严格说「不需要构建」——.py 文件直接交给解释器跑。但当你要「分发给别人的机器」时,问题来了:

- 别人没装你的依赖怎么办?
- 别人的 Python 版本不一样怎么办?
- 别人不想装 Python 怎么办(打包成 .exe)?

这些问题催生了一堆工具,但没有一个像 Maven 那样「一统天下」。

#### 2.2 pyproject.toml + setuptools/hatch/flit

现代 Python 用 \`pyproject.toml\` 声明构建后端(PEP 517/518),常见后端有三个:

- **setuptools**:老牌、最普遍,兼容性最好
- **hatch**(hatchling):现代、功能丰富,Poetry 团队推荐
- **flit**:极简,适合纯 Python 包(无 C 扩展)

\`\`\`toml
# pyproject.toml 用 setuptools 构建
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "my-package"
version = "1.0.0"
description = "示例 Python 包"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.31",
    "pydantic>=2.0",
]

[project.scripts]
my-tool = "my_package.cli:main"
\`\`\`

构建命令:

\`\`\`bash
python -m build          # 生成 dist/ 下的 .whl 和 .tar.gz
# dist/my_package-1.0.0-py3-none-any.whl  (wheel,预编译包)
# dist/my_package-1.0.0.tar.gz            (sdist,源码包)
\`\`\`

- **wheel(.whl)**:预编译的 zip,装得快,不用在用户机器上编译
- **sdist(.tar.gz)**:源码包,用户机器上构建

上传到 PyPI:

\`\`\`bash
pip install twine
twine upload dist/*
\`\`\`

#### 2.3 可执行文件:PyInstaller / Nuitka

当目标用户「不想装 Python」时,需要把 Python 程序打包成单文件可执行程序:

\`\`\`bash
# PyInstaller:把 Python 解释器 + 依赖 + 脚本 打成单文件
pip install pyinstaller
pyinstaller --onefile my_script.py
# 生成 dist/my_script(macOS) 或 dist/my_script.exe(Windows)
\`\`\`

PyInstaller 的原理:把 CPython 解释器、所有 .pyc 字节码、依赖的 .so/.dll 全部塞进一个文件,运行时解压到临时目录再执行。优点是用户无需装 Python,缺点是:

- 产物大(几十 MB 起步,因为含整个解释器)
- 跨平台要分别在对应平台构建(macOS 上打的包不能在 Windows 跑)
- 杀毒软件可能误报(因为自解压行为像病毒)

Nuitka 更进一步,把 Python 编译成 C 再编译成机器码:

\`\`\`bash
pip install nuitka
python -m nuitka --onefile my_script.py
\`\`\`

Nuitka 产物更小、更快,但编译慢,且部分动态特性(如 eval)可能不兼容。

### 三、Java 构建:Maven/Gradle 的标准化

#### 3.1 JAR:Java 的标准产物

Java 编译后会得到 .class 字节码,再用 \`jar\` 命令打包成 JAR(Java Archive,本质是 zip):

\`\`\`bash
# 手动构建(教学用,实际都用 Maven/Gradle)
javac -d target/classes src/main/java/com/example/*.java
jar -cf target/my-app.jar -C target/classes .
\`\`\`

JAR 文件结构:

\`\`\`text
my-app.jar
├── META-INF/
│   └── MANIFEST.MF        # 清单文件,声明 Main-Class 等
├── com/
│   └── example/
│       ├── App.class
│       └── Utils.class
└── application.properties  # 资源文件
\`\`\`

MANIFEST.MF 里指定入口类后,JAR 就能直接运行:

\`\`\`text
Manifest-Version: 1.0
Main-Class: com.example.App
\`\`\`

\`\`\`bash
java -jar my-app.jar   # 直接运行
\`\`\`

这是 Java 相比 Python 的巨大优势:**JAR 是自包含、跨平台、可执行的标准单元**。一份 JAR 在任何装了 JVM 的机器上都能跑,不用关心依赖(假设是 fat jar)。

#### 3.2 Maven 构建

Maven 把「编译、测试、打包、安装、部署」标准化为生命周期:

\`\`\`bash
mvn clean compile    # 编译
mvn test             # 跑测试
mvn package          # 打包(生成 target/my-app-1.0.0.jar)
mvn install          # 装到本地 ~/.m2
mvn deploy           # 上传到远程仓库(Nexus/Artifactory)
\`\`\`

Spring Boot 项目用 \`spring-boot-maven-plugin\` 打成「fat jar」——把所有依赖塞进一个 JAR,运行时 \`java -jar\` 即可,这是现代 Java 微服务的标准部署形态:

\`\`\`xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <mainClass>com.example.App</mainClass>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
\`\`\`

\`\`\`bash
mvn clean package
# 生成 target/my-app-1.0.0.jar(几十 MB,含所有依赖)
java -jar target/my-app-1.0.0.jar  # 一行启动整个微服务
\`\`\`

#### 3.3 WAR / EAR:传统应用服务器

在 Spring Boot 之前,Java Web 应用打包成 WAR(Web Application Archive),部署到 Tomcat/Jetty/WebLogic 等应用服务器:

\`\`\`text
my-app.war
├── WEB-INF/
│   ├── web.xml           # 部署描述符
│   ├── classes/          # 编译后的 .class
│   └── lib/              # 依赖 jar
└── index.jsp
\`\`\`

EAR(Enterprise Archive)更重,可含多个 WAR + EJB,现代已少用。Spring Boot 的「fat jar」让 WAR 逐渐退出主流——服务器内置在 jar 里,部署更简单。

#### 3.4 jpackage / jlink:定制运行时

Java 9 引入模块系统后,可以用 jlink 生成「定制 JRE」——只含你用到的模块,体积大幅缩小:

\`\`\`bash
# 检测项目用了哪些模块
jdeps --list-deps my-app.jar

# 生成定制 JRE(只含 java.base、java.logging 等需要的模块)
jlink --add-modules java.base,java.logging,java.net.http \\
      --output custom-jre --strip-debug --compress=2

# 用定制 JRE 跑应用(比完整 JDK 小很多)
custom-jre/bin/java -jar my-app.jar
\`\`\`

jpackage 进一步把「应用 + 定制 JRE」打成系统原生安装包(.dmg / .msi / .deb):

\`\`\`bash
jpackage --input target --name MyApp --main-jar my-app.jar \\
         --type dmg --java-options "-Xmx512m"
# 生成 MyApp-1.0.dmg,双击安装,像原生 Mac 应用
\`\`\`

这让 Java 也能做出「用户双击就装、不用装 JVM」的桌面应用,对标 Python 的 PyInstaller。

### 四、容器化:Docker 镜像对比

Docker 是现代部署的事实标准,Python 和 Java 的镜像策略差异显著:

#### 4.1 Python Docker 镜像

\`\`\`dockerfile
# python:3.12-slim 基础镜像(约 130MB)
FROM python:3.12-slim

WORKDIR /app

# 先拷依赖文件,利用 Docker 层缓存
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 再拷源码
COPY . .

EXPOSE 8000
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myapp:app"]
\`\`\`

镜像大小:python:slim 约 130MB + 依赖(numpy/pandas 等)可能到 300-500MB。

#### 4.2 Java Docker 镜像

\`\`\`dockerfile
# 多阶段构建:先用 Maven 构建,再用 JRE 运行
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline    # 预下载依赖(利用层缓存)
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段:用更小的 JRE 镜像
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /build/target/my-app-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

镜像大小:eclipse-temurin:17-jre-alpine 约 80MB + fat jar(30-80MB),总计约 150MB。

#### 4.3 镜像大小对比

| 基础镜像 | 大小 | 备注 |
|---------|------|------|
| python:3.12 | ~1000MB | 完整 Debian + Python + 编译工具链 |
| python:3.12-slim | ~130MB | 精简 Debian,常用 |
| python:3.12-alpine | ~50MB | Alpine Linux,但 numpy 等 C 扩展装得慢 |
| eclipse-temurin:17-jdk | ~330MB | 完整 JDK |
| eclipse-temurin:17-jre | ~230MB | 仅 JRE |
| eclipse-temurin:17-jre-alpine | ~80MB | Alpine + JRE,最小 |

**注意**:Alpine 镜像虽小,但 Python 用 Alpine 装 C 扩展(numpy/pandas)时要从源码编译,反而更慢更大,所以 Python 生产常用 slim。Java 用 Alpine 则很合适(没有 C 扩展问题)。

### 五、部署形态对比

#### 5.1 Python 部署形态

- **脚本直接跑**:\`python my_script.py\`,最原始,适合 cron / 一次性任务
- **WSGI**(同步):Gunicorn + Flask/Django,传统 Web 服务
- **ASGI**(异步):Uvicorn + FastAPI/Starlette,支持 WebSocket、async
- **Serverless**:AWS Lambda、阿里云函数计算,Python 是一等公民
- **容器**:Docker + K8s,现代主流

\`\`\`bash
# Gunicorn 启动 Flask(同步,多 worker 进程)
gunicorn --workers 4 --bind 0.0.0.0:8000 myapp:app

# Uvicorn 启动 FastAPI(异步)
uvicorn myapp:app --host 0.0.0.0 --port 8000 --workers 4
\`\`\`

#### 5.2 Java 部署形态

- **JAR 直接跑**:\`java -jar app.jar\`,Spring Boot 标准
- **应用服务器**:WAR 部署到 Tomcat/Jetty,传统 Java EE
- **容器**:Docker + K8s,微服务主流
- **Serverless**:AWS Lambda(支持 Java,但冷启动慢)

\`\`\`bash
# Spring Boot 启动(内置 Tomcat)
java -jar -Xmx512m -Xms256m app.jar --spring.profiles.active=prod
\`\`\`

Java 的优势是「一个 jar 一个进程」,部署简单;劣势是启动慢(JVM 预热 5-30 秒,Serverless 冷启动吃亏)。Python 启动快但运行效率较低。

### 六、CI/CD 集成

#### 6.1 Python CI/CD(GitHub Actions 示例)

\`\`\`yaml
# .github/workflows/python-ci.yml
name: Python CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
      - run: pip install -r requirements.txt
      - run: pip install pytest coverage
      - run: coverage run -m pytest
      - run: coverage xml
      - uses: codecov/codecov-action@v3
\`\`\`

#### 6.2 Java CI/CD

\`\`\`yaml
# .github/workflows/java-ci.yml
name: Java CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: maven
      - run: mvn -B clean verify
      - run: mvn jacoco:report
      - uses: codecov/codecov-action@v3
      # 构建 Docker 镜像并推送
      - run: docker build -t my-app:\${{ github.sha }} .
      - run: docker push my-app:\${{ github.sha }}
\`\`\`

注意 Java 用了 \`cache: maven\` 缓存 ~/.m2,加速构建。Python 也有 pip 缓存(actions/setup-python 自动处理)。

### 七、构建产物对比

| 维度 | Python | Java |
|------|--------|------|
| 标准产物 | wheel(.whl)/ sdist(.tar.gz) | JAR / WAR |
| 是否含依赖 | 否(依赖在 requirements/lock) | fat jar 是(spring-boot) |
| 跨平台 | wheel 标 \`py3-none-any\` 跨平台;C 扩展分平台 | JAR 一次编写到处运行 |
| 可执行文件 | PyInstaller / Nuitka(几十 MB) | jpackage + jlink(几十 MB) |
| 启动速度 | 快(毫秒级) | 慢(JVM 预热秒级) |
| 镜像大小 | slim + 依赖,300-500MB | jre-alpine + fat jar,150MB |

### 八、Python 打包的痛点

总结 Python 在构建部署上的几个长期痛点:

**痛点 1:没有标准构建工具**。setuptools/hatch/flit/poetry/uv 各搞一套,新人不知道该学哪个。对比 Maven 的「一统江湖」,Python 这块 fragmentation 严重。

**痛点 2:C 扩展跨平台难**。numpy、pandas 这种含 C 代码的包,在 Windows 上要 MSVC、Linux 上要 gcc,跨平台编译是噩梦(虽然有 wheel 缓解,但开发时仍麻烦)。

**痛点 3:依赖必须随产物分发**。Python 没有「fat wheel」概念,部署时要么用 venv 重装依赖,要么 PyInstaller 打成大文件。Java 的 fat jar 一把梭,简单太多。

**痛点 4:没有「编译期检查」**。Python 动态类型,构建时不会检查类型错误,运行时才崩。Java 编译期就排除大量错误,部署更有信心。

\`\`\`python
# Python:这个错误构建时发现不了,要运行到这行才崩
def calc(a, b):
    return a + b + c  # NameError: c 未定义,但构建时不报

# 对比 Java:编译期就报错
# public int calc(int a, int b) {
#     return a + b + c;  // 编译错误:cannot find symbol c
# }
\`\`\`

### 九、Java 构建的标准化优势

Java 在构建部署上的核心优势:

**1. JAR 是真正的「标准单元」**。一份 jar 任何 JVM 都能跑,跨 OS、跨发行版、跨云厂商无障碍。

**2. Maven 生命周期统一**。\`mvn package\` 在所有项目里语义一致,CI/CD 模板化。

**3. fat jar 自包含**。Spring Boot 的 fat jar 把所有依赖塞进去,部署只需 \`java -jar\`,不用管依赖。

**4. jlink 定制运行时**。可以裁剪出 30MB 的 JRE,适合资源受限场景。

**5. 编译期保证**。.class 文件已通过类型检查,部署信心比 Python 强。

### 十、小结

| 场景 | 推荐 |
|------|------|
| 小脚本/工具,要分发给非程序员 | Python + PyInstaller,或直接发 .py 让对方装 Python |
| 内部 Web 服务 | Python(轻量)+ Docker,或 Java(Spring Boot fat jar) |
| 大型企业微服务 | Java(Spring Boot + K8s),标准化程度高 |
| Serverless 函数 | Python(冷启动快),Java 冷启动慢 |
| 数据科学/ML 部署 | Python(生态决定),用 Docker 隔离 |
| 桌面应用 | Java(jpackage + jlink)或 Python(PyInstaller) |

一句话:**Java 构建部署「重而标准」,适合企业级大规模协作;Python 构建部署「轻而灵活」,适合快速交付和数据科学场景**。Java 的 JAR 是工程化的标杆,Python 的痛点正在被 Docker 和现代工具(poetry/uv)缓解,但「无标准构建工具」的基因短期难改。
`,
  },
  {
    id: "pyjava-testing",
    icon: "🧪",
    group: "标准库与生态",
    title: "测试框架",
    content: `## 第19章：测试框架

### 一、为什么测试是工程的基石

「能跑起来」和「能稳定跑起来」之间,隔着一座叫做「测试」的大山。一个没有测试的项目,就像没有安全绳的走钢丝——今天改一行代码,明天线上就可能崩。

测试的核心价值:

1. **防回归**:改代码后立刻知道有没有弄坏旧功能
2. **活文档**:测试用例就是「代码该怎么用」的最佳示例
3. **设计反馈**:难测的代码往往设计有问题(高耦合、副作用多)
4. **重构信心**:有测试才敢大刀阔斧重构
5. **CI/CD 门槛**:自动化测试是持续交付的前提

Python 和 Java 都有成熟的测试生态,但风格差异明显:Python 测试「简洁灵活」,Java 测试「严谨结构化」。本章对比两套体系。

### 二、Python 测试:unittest 与 pytest

#### 2.1 unittest:标准库的测试框架

\`unittest\` 是 Python 标准库自带的测试框架(受 JUnit 启发),采用「类 + 方法」风格:

\`\`\`python
import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_add_integers(self):
        self.assertEqual(add(1, 2), 3)

    def test_add_floats(self):
        self.assertAlmostEqual(add(0.1, 0.2), 0.3, places=7)

    def test_add_strings(self):
        self.assertEqual(add("hello, ", "world"), "hello, world")

    def test_add_negative(self):
        self.assertEqual(add(-1, -2), -3)

if __name__ == "__main__":
    unittest.main()
\`\`\`

unittest 的特点:

- **标准库自带**,零依赖
- 类继承 \`TestCase\`,方法以 \`test_\` 开头
- 用 \`assertEqual\`、\`assertTrue\`、\`assertRaises\` 等方法断言
- 有 \`setUp\`/\`tearDown\` 做前后置(每个测试方法前后)
- 有 \`setUpClass\`/\`tearDownClass\` 做类级别前后置

\`\`\`python
class TestDatabase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """整个测试类开始前执行一次:建表、连数据库"""
        cls.conn = create_connection("test.db")

    @classmethod
    def tearDownClass(cls):
        """整个测试类结束后执行一次:关连接"""
        cls.conn.close()

    def setUp(self):
        """每个测试方法前执行:清空表"""
        self.conn.execute("DELETE FROM users")

    def test_insert_user(self):
        self.conn.execute("INSERT INTO users VALUES (1, 'Alice')")
        count = self.conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        self.assertEqual(count, 1)
\`\`\`

#### 2.2 pytest:事实标准

虽然 unittest 是标准库,但 Python 社区「事实上」更常用 **pytest**。pytest 是第三方库,语法更简洁、功能更强:

\`\`\`bash
pip install pytest
pytest                    # 自动发现 test_*.py 文件并运行
pytest -v                 # 显示详细输出
pytest --cov=myapp        # 生成覆盖率报告(需 pytest-cov)
\`\`\`

pytest 的核心优势是「**用普通函数代替类**」:

\`\`\`python
# 不需要继承 TestCase,直接写函数
def add(a, b):
    return a + b

def test_add_integers():
    assert add(1, 2) == 3          # 用原生 assert,不需要 assertEqual

def test_add_floats():
    assert abs(add(0.1, 0.2) - 0.3) < 1e-7

def test_add_strings():
    assert add("hello, ", "world") == "hello, world"

def test_add_raises_typeerror():
    with pytest.raises(TypeError):
        add(1, "two")   # 传入非法类型应抛 TypeError
\`\`\`

pytest 失败时的 assert 报错信息比 unittest 更友好——它会自动展示断言表达式的中间值:

\`\`\`text
def test_add():
    assert add(1, 2) == 4
E   assert 3 == 4
E    +  where 3 = add(1, 2)
\`\`\`

#### 2.3 pytest fixture:依赖注入的精髓

pytest 最强大的特性是 **fixture**——一种依赖注入机制,把「测试前置条件」做成可复用的「夹具」:

\`\`\`python
import pytest

@pytest.fixture
def sample_list():
    """返回一个示例列表,每个用它的测试都会拿到一个新副本"""
    return [1, 2, 3, 4, 5]

@pytest.fixture
def db_connection():
    """模拟数据库连接:yield 之前是 setup,yield 之后是 teardown"""
    conn = create_connection("test.db")
    yield conn              # 把 conn 交给测试用例使用
    conn.close()            # 测试结束后执行(即使测试失败也会执行)

def test_sum(sample_list):
    assert sum(sample_list) == 15

def test_max(sample_list):
    assert max(sample_list) == 5

def test_db_query(db_connection):
    result = db_connection.execute("SELECT 1").fetchone()
    assert result[0] == 1
\`\`\`

fixture 的精髓:

- **按名注入**:测试函数参数名 = fixture 名,pytest 自动注入
- **作用域可控**:\`@pytest.fixture(scope="session"/"module"/"class"/"function")\`
- **可组合**:fixture 可以依赖其他 fixture
- **自动清理**:yield 模式保证 teardown 必执行

这比 unittest 的 setUp/tearDown 灵活得多——unittest 的前后置是「类级别绑定」,而 fixture 是「按需注入」,粒度更细。

#### 2.4 pytest 参数化测试

\`@pytest.mark.parametrize\` 让一个测试函数跑多组数据:

\`\`\`python
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, -2, -3),
    (0, 0, 0),
    (0.1, 0.2, 0.3),
    ("a", "b", "ab"),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
\`\`\`

这一行装饰器等价于写 5 个测试函数,且报错时能清晰看出是哪组数据失败。

#### 2.5 pytest 插件生态

pytest 有丰富的插件生态:

- \`pytest-cov\`:覆盖率
- \`pytest-mock\`:封装 unittest.mock,更简洁
- \`pytest-asyncio\`:测试异步代码
- \`pytest-xdist\`:并行测试
- \`pytest-django\` / \`pytest-flask\`:Web 框架集成
- \`hypothesis\`:基于属性的测试(property-based testing)

\`\`\`python
# pytest-mock 提供 mocker fixture
def test_http_call(mocker):
    mock_get = mocker.patch("requests.get")
    mock_get.return_value.json.return_value = {"status": "ok"}

    result = fetch_status()
    assert result == "ok"
    mock_get.assert_called_once_with("https://api.example.com/status")
\`\`\`

### 三、Java 测试:JUnit 4 与 JUnit 5

#### 3.1 JUnit 4:经典之选

JUnit 4(2006 年)用注解驱动,简洁优雅:

\`\`\`java
import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import static org.junit.Assert.*;

public class CalculatorTest {
    private Calculator calc;

    @Before
    public void setUp() {
        // 每个测试方法前执行
        calc = new Calculator();
    }

    @After
    public void tearDown() {
        // 每个测试方法后执行
        calc = null;
    }

    @Test
    public void testAddIntegers() {
        assertEquals(3, calc.add(1, 2));
    }

    @Test
    public void testAddFloats() {
        assertEquals(0.3, calc.add(0.1, 0.2), 0.0001);
    }

    @Test(expected = ArithmeticException.class)
    public void testDivideByZero() {
        calc.divide(1, 0);
    }
}
\`\`\`

#### 3.2 JUnit 5:Jupiter 的现代设计

JUnit 5(2017 年)重新设计,叫 Jupiter,引入了「扩展模型」(Extension Model),取代 JUnit 4 的「Runner + Rule」:

\`\`\`java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    private Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator();
    }

    @Test
    @DisplayName("整数相加应返回正确结果")
    void testAddIntegers() {
        assertEquals(3, calc.add(1, 2));
    }

    @Test
    @DisplayName("除以零应抛出异常")
    void testDivideByZero() {
        ArithmeticException ex = assertThrows(
            ArithmeticException.class,
            () -> calc.divide(1, 0)
        );
        assertEquals("Division by zero", ex.getMessage());
    }

    // 嵌套测试:把相关测试分组
    @Nested
    @DisplayName("浮点数运算")
    class FloatOperations {
        @Test
        void testAddFloats() {
            assertEquals(0.3, calc.add(0.1, 0.2), 0.0001);
        }
    }
}
\`\`\`

JUnit 5 的核心改进:

- **@DisplayName**:可读性更强的测试名(中文、emoji 都行)
- **@Nested**:嵌套测试类,组织相关用例
- **assertThrows**:异常断言更优雅(替代 @Test(expected=))
- **@ParameterizedTest**:参数化测试(对标 pytest parametrize)
- **扩展模型**:@ExtendWith 替代 Runner,可组合

#### 3.3 JUnit 5 参数化测试

\`\`\`java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

class CalculatorParamTest {
    @ParameterizedTest
    @CsvSource({
        "1, 2, 3",
        "-1, -2, -3",
        "0, 0, 0",
        "0.1, 0.2, 0.3"
    })
    void testAdd(double a, double b, double expected) {
        Calculator calc = new Calculator();
        assertEquals(expected, calc.add(a, b), 0.0001);
    }

    @ParameterizedTest
    @ValueSource(strings = {"hello", "world", "junit"})
    void testIsNotBlank(String input) {
        assertFalse(input.isBlank());
    }
}
\`\`\`

#### 3.4 JUnit 5 扩展模型

JUnit 5 的「扩展模型」是对标 pytest fixture 的核心机制。通过 \`@ExtendWith\` 注入自定义扩展,实现前后置逻辑:

\`\`\`java
import org.junit.jupiter.api.extension.*;

// 自定义扩展:管理数据库连接
class DatabaseExtension implements BeforeAllCallback, AfterAllCallback {
    @Override
    public void beforeAll(ExtensionContext context) {
        // 所有测试前:建表
        Database.connect("test.db");
        Database.execute("CREATE TABLE users (...)");
    }

    @Override
    public void afterAll(ExtensionContext context) {
        // 所有测试后:关连接
        Database.disconnect();
    }
}

// 使用扩展
@ExtendWith(DatabaseExtension.class)
class UserRepositoryTest {
    @Test
    void testInsert() {
        Database.execute("INSERT INTO users VALUES (1, 'Alice')");
        // ...
    }
}
\`\`\`

Spring Boot 提供了 \`SpringExtension\`,让 JUnit 5 测试能注入 Spring Bean:

\`\`\`java
@SpringBootTest
class UserServiceTest {
    @Autowired  // 直接注入 Spring Bean
    private UserService userService;

    @Test
    void testFindUser() {
        User user = userService.findById(1L);
        assertNotNull(user);
        assertEquals("Alice", user.getName());
    }
}
\`\`\`

### 四、断言对比

| 场景 | Python | Java(JUnit) |
|------|--------|--------------|
| 相等 | \`assert a == b\` 或 \`assertEqual(a, b)\` | \`assertEquals(a, b)\` |
| 不等 | \`assert a != b\` | \`assertNotEquals(a, b)\` |
| 真/假 | \`assert x\` / \`assert not x\` | \`assertTrue(x)\` / \`assertFalse(x)\` |
| None | \`assert x is None\` | \`assertNull(x)\` |
| 异常 | \`with pytest.raises(ValueError):\` | \`assertThrows(ValueError.class, () -> ...)\` |
| 浮点近似 | \`assertAlmostEqual(a, b, 7)\` | \`assertEquals(a, b, delta)\` |
| 包含 | \`assert "x" in list\` | \`assertTrue(list.contains("x"))\` |

pytest 用原生 \`assert\` 的最大好处:失败时自动展示表达式中间值,调试体验极佳。Java 必须用专门的 assertXxx 方法,因为 Java 没有 Python 那种「assert 重写」机制。

### 五、Mock 对比

#### 5.1 Python:unittest.mock

\`unittest.mock\` 是标准库(即使你用 pytest 也能用),核心是 \`Mock\` 和 \`patch\`:

\`\`\`python
from unittest.mock import Mock, patch, call

def test_fetch_weather():
    # 用 patch 替换 requests.get,测试结束后自动恢复
    with patch("myapp.requests.get") as mock_get:
        mock_get.return_value.json.return_value = {"temp": 25}

        result = fetch_weather("Shanghai")

        assert result["temp"] == 25
        mock_get.assert_called_once_with("https://weather.api/Shanghai")

# 更复杂的场景:side_effect 模拟多次调用返回不同值
def test_retry_logic():
    with patch("myapp.requests.get") as mock_get:
        mock_get.side_effect = [ConnectionError(), ConnectionError(), Mock(json={"ok": True})]
        # 前两次抛异常,第三次返回成功
        result = fetch_with_retry()
        assert result["ok"] is True
        assert mock_get.call_count == 3
\`\`\`

#### 5.2 Java:Mockito

Mockito 是 Java 测试的主流 Mock 库:

\`\`\`java
import static org.mockito.Mockito.*;

// 用 Mockito.mock 创建 mock 对象
WeatherApi mockApi = mock(WeatherApi.class);
when(mockApi.getTemperature("Shanghai")).thenReturn(25);

WeatherService service = new WeatherService(mockApi);
int temp = service.getWeather("Shanghai");

assertEquals(25, temp);
verify(mockApi, times(1)).getTemperature("Shanghai");

// 模拟抛异常
when(mockApi.getTemperature("Beijing"))
    .thenThrow(new RuntimeException("API timeout"));

// ArgumentCaptor:捕获参数做断言
ArgumentCaptor<String> captor = ArgumentCaptor.forClass(String.class);
verify(mockApi).getTemperature(captor.capture());
assertEquals("Shanghai", captor.getValue());
\`\`\`

Mockito 的特点是「**类型安全**」——mock 对象有明确的接口类型,编译期检查方法签名。Python 的 Mock 是「万能对象」,任何属性都能访问,灵活但容易写出「mock 了不存在的方法」的 bug。

### 六、覆盖率:coverage.py vs JaCoCo

#### 6.1 Python coverage.py

\`\`\`bash
pip install coverage
coverage run -m pytest     # 跑测试并收集覆盖率
coverage report            # 终端报告
coverage html              # 生成 htmlcov/ 目录,浏览器查看
\`\`\`

输出示例:

\`\`\`text
Name                    Stmts   Miss  Cover
-------------------------------------------
myapp/__init__.py           2      0   100%
myapp/calculator.py        15      2    87%
myapp/service.py           30      8    73%
-------------------------------------------
TOTAL                      47     10    79%
\`\`\`

pytest 集成:\`pytest --cov=myapp --cov-report=html\`

#### 6.2 Java JaCoCo

JaCoCo 是 Java 的覆盖率工具,Maven 集成:

\`\`\`xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <executions>
        <execution>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>
        </execution>
    </executions>
</plugin>
\`\`\`

\`\`\`bash
mvn test          # 跑测试 + 生成 target/site/jacoco/index.html
\`\`\`

JaCoCo 还支持「分支覆盖率」「行覆盖率」「方法覆盖率」,比 coverage.py 更细粒度。

### 七、测试金字塔

两门语言社区都推崇「测试金字塔」:

\`\`\`text
        /  \\
       / UI \\         <- 少量:E2E 测试(Selenium / Playwright)
      /------\\
     / 集成  \\        <- 中量:集成测试(数据库、HTTP)
    /--------\\
   /  单元   \\       <- 大量:单元测试(纯逻辑,毫秒级)
  /__________\\
\`\`\`

| 层级 | Python | Java |
|------|--------|------|
| 单元测试 | pytest + mock | JUnit 5 + Mockito |
| 集成测试 | pytest + testcontainers | Spring Boot Test + TestContainers |
| E2E | pytest + Playwright | Selenium / Playwright Java |
| 契约测试 | pact-python | Spring Cloud Contract |

TestContainers 是近年 Java/Python 都流行的工具,用 Docker 启动真实数据库做集成测试,比 mock 更可信:

\`\`\`python
# Python testcontainers
from testcontainers.postgres import PostgresContainer

def test_with_postgres():
    with PostgresContainer("postgres:15") as pg:
        engine = create_engine(pg.get_connection_url())
        # 用真实 PostgreSQL 测试,比 mock 可信
        result = engine.execute("SELECT 1").scalar()
        assert result == 1
\`\`\`

\`\`\`java
// Java TestContainers
@Testcontainers
class UserRepositoryIT {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");

    @Test
    void testQuery() {
        DataSource ds = createDataSource(postgres.getJdbcUrl());
        // 用真实 PostgreSQL 测试
    }
}
\`\`\`

### 八、行为驱动测试(BDD)

#### Python:behave

\`\`\`python
# features/addition.feature
Feature: 加法运算
  Scenario: 两个整数相加
    Given 计算器已启动
    When 我输入 1 和 2
    Then 结果应该是 3
\`\`\`

#### Java:Cucumber

\`\`\`gherkin
# src/test/resources/features/addition.feature
Feature: 加法运算
  Scenario: 两个整数相加
    Given 计算器已启动
    When 我输入 1 和 2
    Then 结果应该是 3
\`\`\`

两者语法几乎一样(Gherkin),只是绑定步骤定义的语言不同。BDD 在企业级项目里用于「需求 → 测试」的桥接,Python 和 Java 都支持。

### 九、小结

| 维度 | Python | Java |
|------|--------|------|
| 标准库测试 | unittest(够用) | 无(必须引 JUnit) |
| 事实标准 | pytest | JUnit 5 |
| 依赖注入 | fixture(灵活) | Extension 模型 + @Autowired |
| 参数化 | @parametrize | @ParameterizedTest |
| Mock | unittest.mock(标准库) | Mockito(第三方) |
| 覆盖率 | coverage.py | JaCoCo |
| 断言风格 | 原生 assert | assertXxx 方法 |
| 启动速度 | 毫秒级 | 百毫秒级(JVM 启动) |
| 测试可读性 | 高(函数式) | 中(类 + 注解) |

一句话:**Python 测试「轻量灵活」,pytest 的 fixture + 原生 assert 体验极佳;Java 测试「严谨结构化」,JUnit 5 + Mockito + Spring Test 是企业级标配**。pytest 的设计哲学正在影响 Java(JUnit 5 的 @DisplayName、@Nested 都是向 pytest 致敬),而 Java 的 TestContainers 反向影响 Python。两者互相学习,测试生态都在进步。
`,
  },
  {
    id: "pyjava-ecosystem",
    icon: "🌳",
    group: "标准库与生态",
    title: "生态系统",
    content: `## 第20章：生态系统

### 一、生态决定语言命运

一门编程语言能否长期繁荣,「生态」比「语法」更重要。Lisp 语法优雅得像数学,但生态小众;JavaScript 设计有诸多缺陷,但 npm 上两百万个包让它统治了 Web。Python 和 Java 之所以能长盛不衰,正是因为各自构建了庞大且差异化的生态:

- **Python 生态**:以「数据科学 + AI + 自动化」为核心,开源社区驱动,百花齐放
- **Java 生态**:以「企业级 + 大数据 + Android」为核心,厂商主导,标准化程度高

本章我们全景式对比这两个生态,帮你理解「什么场景该用谁」。

### 二、Python 生态全景

#### 2.1 PyPI:50 万+ 包的宝库

PyPI(Python Package Index,pypi.org)是 Python 的官方包仓库,截至 2024 年已有超过 50 万个包,日下载量数十亿次。任何人都能用 \`twine upload\` 发布包,门槛极低——这是 Python 生态「百花齐放」的原因,也是「质量参差」的根源。

PyPI 的几个特点:

- **包名先到先得**:抢注问题时有发生(比如曾有人抢注了 \`python-dateutil\` 的近似名投毒)
- **无审核发布**:不像 Maven Central 要验证 GPG 签名,PyPI 任何人都能传(后引入 2FA 缓解)
- **wheel 优先**:预编译 wheel 装得快,纯 Python 包 \`py3-none-any\` 跨平台

#### 2.2 数据科学栈:Python 的统治区

这是 Python 生态最强大的领域,几乎没有对手:

| 库 | 作用 | 地位 |
|----|------|------|
| NumPy | 多维数组 + 线性代数 | 整个数据科学栈的基石,C 扩展性能极强 |
| Pandas | DataFrame 数据处理 | 类 SQL + Excel 的混合体,数据分析标配 |
| SciPy | 科学计算(积分、优化、信号) | NumPy 之上的科学工具箱 |
| Matplotlib | 绘图 | 老牌但强大,万物之源 |
| Seaborn | 统计可视化 | 基于 Matplotlib,更美观 |
| Plotly | 交互式图表 | Web 友好,Dash 配套 |
| scikit-learn | 传统机器学习 | 随机森林/SVM/聚类,小数据集首选 |
| Statsmodels | 统计建模 | 假设检验、回归诊断 |
| Jupyter | 交互式笔记本 | 数据科学家的「IDE」 |

\`\`\`python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

# 一个完整的数据分析流程:读数据 → 清洗 → 建模 → 可视化
df = pd.read_csv("house_prices.csv")
df = df.dropna(subset=["area", "price"])

X = df[["area"]].values
y = df["price"].values

model = LinearRegression()
model.fit(X, y)
print(f"R² = {model.score(X, y):.3f}")

plt.scatter(X, y, alpha=0.5)
plt.plot(X, model.predict(X), color="red", linewidth=2)
plt.xlabel("面积")
plt.ylabel("价格")
plt.savefig("regression.png")
\`\`\`

这段代码涵盖了数据科学 80% 的工作流,全程纯 Python,生态完整度无出其右。

#### 2.3 深度学习栈:Python 的事实垄断

| 库 | 背景 | 特点 |
|----|------|------|
| TensorFlow | Google | 工业部署强,2.x 后 API 简化 |
| PyTorch | Meta(Facebook) | 动态图,学术界主流,Research 首选 |
| Keras | 高层 API | 已并入 TensorFlow,极简 |
| JAX | Google | 函数式 + 自动微分,新一代研究框架 |
| Hugging Face Transformers | 开源社区 | NLP 模型库,GPT/BERT 一键加载 |

\`\`\`python
# 用 PyTorch 训练一个简单神经网络
import torch
import torch.nn as nn
import torch.optim as optim

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(784, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

model = SimpleNet()
optimizer = optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

# 训练循环
for epoch in range(10):
    for batch_x, batch_y in dataloader:
        optimizer.zero_grad()
        output = model(batch_x)
        loss = criterion(output, batch_y)
        loss.backward()
        optimizer.step()
\`\`\`

深度学习领域 Python 几乎「独家」——C++ 写底层内核,Python 写上层逻辑,这是行业共识。Java 在这块基本缺席(虽然有 DL4J,但生态远不及)。

#### 2.4 Web 栈:三足鼎立

| 框架 | 风格 | 适合场景 |
|------|------|---------|
| Django | 全栈、电池齐全 | 内容网站、CMS、传统 Web |
| Flask | 微框架、灵活 | 小项目、API、原型 |
| FastAPI | 现代、异步、类型注解 | API 服务、微服务、实时 |

\`\`\`python
# FastAPI:用类型注解自动生成文档和校验
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str
    age: int

@app.post("/users")
async def create_user(user: User):
    # user.name 已自动校验为 str,user.age 已校验为 int
    return {"id": 1, "name": user.name}
\`\`\`

#### 2.5 爬虫与自动化

| 库 | 作用 |
|----|------|
| Scrapy | 工业级爬虫框架 |
| BeautifulSoup | HTML 解析(轻量) |
| Selenium | 浏览器自动化 |
| Playwright | 新一代浏览器自动化(微软) |
| Requests | HTTP 客户端(简单好用) |
| Ansible | 运维自动化(SSH + YAML) |

\`\`\`python
import requests
from bs4 import BeautifulSoup

# 10 行代码抓取网页标题
resp = requests.get("https://news.ycombinator.com")
soup = BeautifulSoup(resp.text, "html.parser")
titles = [a.text for a in soup.select(".titleline > a")]
for t in titles:
    print(t)
\`\`\`

### 三、Java 生态全景

#### 3.1 Maven Central:企业级包仓库

Maven Central(repo1.maven.org)是 Java 的官方包仓库,包数量约 60 万+(含插件)。与 PyPI 不同,Maven Central:

- **需 GPG 签名**:发布前要验证身份,安全性更高
- **GAV 坐标**:\`groupId:artifactId:version\` 三元组定位,包名不会冲突
- **企业镜像多**:Nexus / Artifactory 私服普及,内网加速

#### 3.2 企业级框架:Spring 王朝

Spring 是 Java 生态的「半壁江山」,由 Broadcom 子公司 VMware 维护:

| 项目 | 作用 |
|------|------|
| Spring Framework | 核心 IoC 容器 + AOP |
| Spring Boot | 自动配置、starter、内嵌服务器,「约定优于配置」 |
| Spring MVC | Web MVC |
| Spring WebFlux | 响应式 Web |
| Spring Data | 数据访问(JPA、Redis、MongoDB) |
| Spring Security | 认证授权 |
| Spring Cloud | 微服务全家桶(网关、注册中心、配置中心) |
| Spring Batch | 批处理 |

\`\`\`java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}
\`\`\`

一个 \`@SpringBootApplication\` 注解搞定自动配置、内嵌 Tomcat、组件扫描——这是 Spring Boot「约定优于配置」的极致体现。

Spring 生态的庞大是 Java 在企业级市场的护城河。一个完整的微服务系统,用 Spring Cloud 全家桶能搞定:注册发现(Eureka/Nacos)、配置中心(Config)、网关(Gateway)、熔断(Resilience4j)、链路追踪(Sleuth)、消息总线(Bus)......Python 没有对标方案(Python 微服务更多靠 FastAPI + 第三方组件拼装)。

#### 3.3 大数据栈:Java 的主场

大数据领域 Java 几乎垄断(Scala 蹭 JVM 生态):

| 项目 | 语言 | 作用 |
|------|------|------|
| Hadoop | Java | 分布式存储 + MapReduce |
| Spark | Scala(运行在 JVM) | 内存计算,大数据事实标准 |
| Flink | Java/Scala | 流处理 |
| Kafka | Scala/Java | 消息队列,流处理平台 |
| HBase | Java | 列式 NoSQL |
| Hive | Java(SQL on Hadoop) | 数据仓库 |
| Zookeeper | Java | 分布式协调 |
| ElasticSearch | Java | 搜索引擎 |

\`\`\`java
// Flink 流处理示例
StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

DataStream<String> stream = env
    .socketTextStream("localhost", 9999);

stream
    .flatMap((String line, Collector<Tuple2<String, Integer>> out) -> {
        for (String word : line.split(" ")) {
            out.collect(Tuple2.of(word, 1));
        }
    })
    .keyBy(value -> value.f0)
    .sum(1)
    .print();

env.execute("WordCount");
\`\`\`

这些大数据组件的「运维工具」「客户端 SDK」基本都是 Java/Scala 一等公民,Python 多数是「次等公民」(PySpark、PyFlink 存在但功能滞后)。如果做大数据平台开发,Java/Scala 是必修课。

#### 3.4 微服务生态

| 能力 | Java 方案 | Python 方案 |
|------|----------|------------|
| Web 框架 | Spring Boot | FastAPI / Flask |
| 服务注册 | Eureka / Nacos | consul-python / 自研 |
| 配置中心 | Spring Cloud Config | 没有标准方案 |
| API 网关 | Spring Cloud Gateway | Kong / 自研 |
| 熔断降级 | Resilience4j / Hystrix | 没有(用 tenacity 做重试) |
| 链路追踪 | Sleuth + Zipkin | OpenTelemetry-Python |
| RPC | Dubbo / gRPC-Java | gRPC-Python |
| 消息队列 | Kafka / RocketMQ 客户端 | kafka-python |

Java 的微服务生态「全家桶」属性强——一套 Spring Cloud 解决所有问题,适合大型企业。Python 微服务更「自由组合」,适合中小团队。

#### 3.5 Android 开发

Android 开发长期是 Java 的主场(Kotlin 出现后逐渐让位,但 Kotlin 也跑在 JVM 上):

\`\`\`java
// Android Activity 示例(Java)
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button button = findViewById(R.id.button);
        button.setOnClickListener(v -> {
            Toast.makeText(this, "Clicked!", Toast.LENGTH_SHORT).show();
        });
    }
}
\`\`\`

Python 在移动端基本缺席(Kivy 等框架小众),这是 Java/Kotlin 的绝对主场。

### 四、社区对比:开源 vs 厂商

| 维度 | Python | Java |
|------|--------|------|
| 治理 | Python 软件基金会(PSF)非营利 | Oracle 主导 + JCP 社区流程 |
| 核心开发 | 个人贡献者 + 公司赞助 | Oracle 雇佣核心团队 |
| 生态主导 | 数据科学社区(NumFOCUS) | 厂商(Spring/RedHat/IBM) |
| 主要会议 | PyCon、SciPy | JavaOne(已并入 Devnexus) |
| 学习资源 | 官方 docs + Real Python | Baeldung + 官方 docs |
| 商业支持 | Anaconda、AWS、Google | Oracle、IBM、VMware |

Python 社区更「草根」——很多核心库(Pandas、NumPy)由高校和科研机构孵化,开源精神浓厚。Java 社区更「企业化」——Spring 由商业公司维护,Hadoop/Spark 由 Apache 基金会托管但厂商深度参与。

### 五、领域统治力对比

| 领域 | Python | Java | 谁更强 |
|------|--------|------|--------|
| 数据科学/分析 | Pandas/NumPy/Jupyter | (无对标) | Python 碾压 |
| 深度学习/AI | PyTorch/TensorFlow | DL4J(小众) | Python 垄断 |
| 传统 Web 后端 | Django/Flask/FastAPI | Spring Boot | Java 略强(企业级) |
| 大数据 | PySpark(客户端) | Spark/Flink/Kafka 原生 | Java 主场 |
| 企业级大型系统 | (少用) | Spring 全家桶 | Java 碾压 |
| 微服务 | FastAPI + 拼装 | Spring Cloud | Java 全家桶强 |
| Android | (缺席) | Java/Kotlin | Java 独占 |
| 爬虫 | Scrapy/BeautifulSoup | (弱) | Python 强 |
| 运维自动化 | Ansible/Fabric | (弱) | Python 强 |
| 量化金融 | Pandas/zipline | 生态较弱 | Python 强 |
| 游戏后端 | (少) | Netty/Mina | Java 强 |
| 桌面 GUI | Tkinter/PyQt(弱) | JavaFX/Swing | Java 略强 |
| Serverless | 一等公民 | 冷启动慢 | Python 强 |
| 物联网 | MicroPython | (弱) | Python 强 |

### 六、文档与学习资源

#### Python

- **官方文档**:docs.python.org,中文翻译完整,风格统一
- **Real Python**:realpython.com,高质量教程
- **PyCon 视频**:YouTube 免费看,每年上千场
- **书籍**:《Fluent Python》《Effective Python》《Python Cookbook》

#### Java

- **官方文档**:docs.oracle.com/javase,Javadoc 风格统一
- **Baeldung**:baeldung.com,Spring/Java 实战教程
- **JavaOne/Devnexus**:会议视频
- **书籍**:《Effective Java》《Java Concurrency in Practice》《Spring in Action》

### 七、生态演化趋势

#### Python 的演化

- **类型注解普及**:\`typing\` 模块 + mypy/pyright,Python 在向「可选类型」靠拢,缩小与 Java 的「工程化」差距
- **性能优化**:Python 3.11+ 速度提升 25%,未来有「No-GIL」(去除 GIL)和多 JIT 计划
- **AI 红利**:LLM(大语言模型)爆发让 Python 更火,LangChain、LlamaIndex 等新生态涌现

\`\`\`python
# 现代 Python:类型注解 + Pydantic + async
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int = 0

async def fetch_user(user_id: int) -> User:
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api/users/{user_id}")
        return User(**resp.json())
\`\`\`

#### Java 的演化

- **Project Loom**:虚拟线程(Virtual Thread),让 Java 也能「协程式」高并发,对标 Go
- **Records / Pattern Matching**:语法糖,减少样板代码
- **GraalVM**:原生镜像(Native Image),启动毫秒级,对标 Serverless 场景

\`\`\`java
// Java 21 虚拟线程:百万并发
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 1_000_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}
\`\`\`

Java 在「降低语法负担」「提升启动速度」上发力,缩小与 Python 的「易用性」差距。

### 八、选型决策树

面对一个新项目,如何选 Python 还是 Java?

\`\`\`text
1. 是数据科学 / AI / ML 项目吗?
   → 是:Python(无悬念)

2. 是大数据平台开发(Spark/Flink/Kafka 集成)吗?
   → 是:Java/Scala(生态主场)

3. 是 Android 应用吗?
   → 是:Java/Kotlin

4. 是大型企业级系统(多模块、长期维护、强类型需求)?
   → 是:Java(Spring Boot)

5. 是快速原型 / 创业 MVP / 内部工具?
   → 是:Python(开发快)

6. 是高并发微服务(百万 QPS)?
   → 都行:Java(传统)或 Python(异步,但生态弱)

7. 是 Serverless / 函数计算?
   → Python(冷启动快)

8. 是运维自动化 / 脚本?
   → Python(生态强)

9. 是量化交易 / 金融分析?
   → Python(Pandas/NumPy 生态)

10. 是游戏后端 / IM 长连接?
    → Java(Netty 生态强)
\`\`\`

### 九、生态共存:不是非此即彼

实际上,现代系统常常「Python + Java 共存」:

- **数据团队用 Python**:训练模型、做分析
- **工程团队用 Java**:把模型部署成服务、做大数据 ETL
- **ML 平台**:Python 训练 + Java 推理(TensorFlow Serving 用 Java 重写推理引擎提性能)

典型架构:\`Python(Jupyter 训练)→ 导出模型 → Java(Spring Boot 加载模型 + 推理 API)\`。这种分工在企业里很常见——Python 负责「探索」,Java 负责「工程化」。

### 十、小结

| 维度 | Python 生态 | Java 生态 |
|------|------------|----------|
| 核心优势 | 数据科学、AI、自动化 | 企业级、大数据、Android |
| 治理模式 | 开源社区驱动 | 厂商 + 标准化 |
| 包数量 | 50 万+ | 60 万+ |
| 标志性框架 | Django/FastAPI/PyTorch | Spring/Hadoop/Spark |
| 工程化程度 | 中(在补课) | 高(成熟) |
| 学习曲线 | 平缓 | 陡峭 |
| 性能 | 中(在优化) | 高(JIT) |
| 启动速度 | 快 | 慢(Loom/GraalVM 改善) |
| 未来趋势 | AI 红利、性能优化 | 虚拟线程、原生镜像 |

一句话:**Python 生态赢在「数据科学 + AI」的统治地位和「快速开发」的体验;Java 生态赢在「企业级 + 大数据」的工程化和「一次编写到处运行」的稳定**。两者不是替代关系,而是「分工互补」——理解各自的生态边界,才能在合适场景做出合适选型。未来十年,Python 借 AI 红利继续扩张,Java 借 Loom/GraalVM 补齐短板,两者都难被替代。
`,
  },
];
