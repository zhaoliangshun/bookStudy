// =============================================================
// Python vs Java 深度对比 —— 第 6 批
// -------------------------------------------------------------
// 转义规则：content 内部反引号写作 \`，${ 写作 \$\{
// =============================================================

export const chapters = [
  {
    id: "pyvsjava-package-mgmt",
    icon: "📦",
    title: "包管理：pip vs Maven/Gradle",
    group: "生态与工程",
    content: `# 包管理：pip vs Maven/Gradle

## 一、包管理要解决的同一组问题

无论是 Python 还是 Java，"包管理"要解决的都是同一组问题：

- **依赖声明**：项目需要哪些外部库？版本范围是什么？
- **依赖解析**：库 A 依赖 B 1.0，库 C 依赖 B 2.0，到底用哪个？
- **环境隔离**：项目 A 和项目 B 用同一个库的不同版本，怎么共存？
- **构建打包**：怎么把项目打成一个可分发的产物？
- **版本锁定**：怎么保证开发、测试、生产环境用完全一致的依赖？

但 Python 和 Java 给出的答案截然不同。Java 从一开始就走"工程化"路线（Maven/Gradle），而 Python 走了"灵活脚本"路线（pip），后者在大型项目里吃尽苦头，最近几年才用 poetry/uv 补课。

| 维度 | Python | Java |
|------|--------|------|
| 主流构建工具 | pip + venv（传统）/ poetry / uv / pdm | Maven / Gradle |
| 依赖声明文件 | requirements.txt / pyproject.toml | pom.xml / build.gradle |
| 锁文件 | poetry.lock / uv.lock | Maven 无锁文件（dependencyManagement） |
| 中央仓库 | PyPI | Maven Central |
| 环境隔离 | venv / virtualenv / conda | 无（靠类路径/模块系统） |
| 打包产物 | wheel (.whl) / sdist (.tar.gz) | jar / war / uber jar |
| 工具数量 | 多到混乱（pip/conda/poetry/uv/pdm） | 两强格局（Maven/Gradle） |

## 二、Python 的包管理：从 pip 到工具乱象

### 1. pip + venv：最朴素的组合

Python 最经典的包管理组合是 \`pip\` + \`venv\`：

\`\`\`bash
# 创建虚拟环境
python -m venv .venv

# 激活（macOS/Linux）
source .venv/bin/activate

# 安装依赖
pip install flask==2.3.2

# 导出依赖
pip freeze > requirements.txt

# 从文件安装
pip install -r requirements.txt
\`\`\`

\`requirements.txt\` 长这样：

\`\`\`
flask==2.3.2
requests>=2.28.0,<3.0.0
numpy==1.25.0
pandas==2.0.3
\`\`\`

看起来简单，但问题很多：

1. **依赖解析弱**：pip 历史上用"贪心 + 后装优先"策略，遇到冲突就直接报错或装个"错"的版本。直到 pip 20.3（2020）才引入新的 resolver，但依然不如 Maven 严谨。
2. **没有锁文件概念**：\`requirements.txt\` 既当依赖声明又当锁文件，职责混乱。\`requests>=2.28.0\` 这种范围声明，今天装的是 2.31.0，明天可能装 2.32.0，环境不可复现。
3. **没有项目元信息**：requirements.txt 只列依赖，没有项目名、版本、入口、构建方式等信息。

### 2. poetry：补课之作

poetry（2018 出现）就是为了补上"现代包管理"这一课：

\`\`\`toml
# pyproject.toml
[tool.poetry]
name = "my-app"
version = "0.1.0"
description = "A sample project"
authors = ["zhangsan <zhangsan@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
flask = "^2.3"
requests = "^2.31"
pandas = "^2.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4"
black = "^23.0"
\`\`\`

\`\`\`bash
poetry install          # 安装所有依赖（含开发依赖）
poetry add numpy        # 添加生产依赖
poetry add --group dev pytest  # 添加开发依赖
poetry lock             # 重新解析并生成 poetry.lock
poetry build            # 打包成 wheel + sdist
poetry publish          # 发布到 PyPI
\`\`\`

poetry 的核心改进是**依赖声明、锁文件、项目元信息分离**，并且有完整的依赖解析算法（回溯解析），冲突时报错清晰。

### 3. uv：Rust 写的新王者

2024 年 Astral 公司（ruff 的作者）推出 \`uv\`，用 Rust 重写 pip/poetry/pip-tools/virtualenv 的全部功能，速度快 10-100 倍：

\`\`\`bash
uv venv                 # 创建虚拟环境（毫秒级）
uv pip install flask    # 安装（比 pip 快几十倍）
uv pip compile pyproject.toml -o requirements.txt  # 生成锁文件
uv pip sync requirements.txt  # 严格同步环境
\`\`\`

uv 还支持 \`uv add\`、\`uv lock\`、\`uv run\` 等 poetry 风格命令，2024-2025 年迅速成为 Python 社区最受关注的新工具。

### 4. Python 包管理工具乱象

Python 的包管理工具多到让人崩溃：

| 工具 | 定位 | 特点 |
|------|------|------|
| pip | 官方基础安装器 | 慢、解析弱，但是事实标准 |
| pip-tools | pip 的锁文件补充 | pip-compile + pip-sync |
| poetry | 现代全功能 | 完整但慢，社区有争议 |
| pdm | PEP 标准实现 | 严格遵循 PEP 582/621 |
| uv | Rust 重写 | 2024 年新王，超快 |
| conda | 科学计算专用 | 解决 C 依赖，但生态独立 |
| hatch | 官方推荐的现代工具 | PEP 621 标准 |
| flit | 简单库发布 | 适合纯 Python 库 |

一个新人在 2024 年学 Python，光是选"用哪个包管理工具"就要纠结一周。这是 Python 生态最大的痛点之一。

## 三、Java 的包管理：Maven 与 Gradle 两强

### 1. Maven：约定优于配置

Maven（2002，Apache）是 Java 生态事实标准。它的核心理念是"约定优于配置"——项目结构、构建命令、产物路径都是固定的：

\`\`\`
my-app/
├── pom.xml              # 项目对象模型（唯一配置文件）
├── src/
│   ├── main/
│   │   ├── java/        # 源码
│   │   └── resources/   # 配置文件
│   └── test/
│       └── java/        # 测试代码
└── target/              # 构建产物（自动生成）
\`\`\`

\`pom.xml\` 长这样：

\`\`\`xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>my-app</artifactId>
  <version>0.1.0</version>
  <packaging>jar</packaging>

  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
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

常用命令：

\`\`\`bash
mvn clean            # 清理 target
mvn compile          # 编译
mvn test             # 运行测试
mvn package          # 打包（生成 jar）
mvn install          # 安装到本地仓库 ~/.m2/repository
mvn deploy           # 部署到远程仓库
\`\`\`

### 2. Gradle：更灵活更快

Gradle（2012）用 Groovy/Kotlin DSL 替代 XML，更灵活、构建更快（增量编译、构建缓存）：

\`\`\`kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.20"
    application
}

group = "com.example"
version = "0.1.0"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:3.2.0")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
}

application {
    mainClass.set("com.example.Main")
}
\`\`\`

Gradle 是 Android 的官方构建工具，在 JVM 后端项目里也越来越流行。Maven 和 Gradle 的格局：

| 维度 | Maven | Gradle |
|------|-------|--------|
| 配置语言 | XML | Groovy/Kotlin DSL |
| 灵活性 | 低（约定优先） | 高（编程式） |
| 构建速度 | 慢（无增量） | 快（增量+缓存） |
| 学习曲线 | 平缓 | 较陡 |
| 适用场景 | 服务端标准项目 | Android/复杂构建 |
| 生态占比 | 仍占多数 | 增长中，Android 必选 |

## 四、依赖解析：pip 的痛 vs Maven 的严

### Python：历史上著名的"依赖地狱"

pip 早期用的是"first-found"策略——按顺序装，先到先得，遇到冲突就装最后那个。这导致：

\`\`\`bash
# 项目依赖 A 和 B
# A 依赖 pandas==1.5.0
# B 依赖 pandas>=2.0.0
pip install A B
# 结果：可能装了 2.0.0，A 运行时崩溃；或者报错让你自己解决
\`\`\`

更糟的是 transitive 依赖（传递依赖）不透明——你只写了 \`flask\`，但实际装了 flask + werkzeug + jinja2 + click + itsdangerous + markupsafe 一大堆，且这些传递依赖的版本不可控。

Maven 从第一天就有完整的依赖解析算法（基于 Maven 2 的 resolver）：

- **最近优先**：依赖树里离根最近的版本胜出
- **声明优先**：同距离时，pom.xml 里先声明的胜出
- **可选依赖**：不传递
- **依赖排除**：\`<exclusions>\` 显式排除冲突

\`\`\`xml
<!-- Maven：显式排除冲突依赖 -->
<dependency>
  <groupId>com.example</groupId>
  <artifactId>A</artifactId>
  <version>1.0</version>
  <exclusions>
    <exclusion>
      <groupId>org.apache.commons</groupId>
      <artifactId>commons-lang3</artifactId>
    </exclusion>
  </exclusions>
</dependency>
\`\`\`

\`\`\`bash
mvn dependency:tree    # 查看完整依赖树
mvn dependency:analyze # 分析未使用/未声明依赖
\`\`\`

Maven 的依赖树是确定性的、可解释的，而 pip 直到 2020 年才勉强追上。

### 版本锁定对比

Python（poetry/uv）用锁文件：

\`\`\`toml
# poetry.lock（节选）
[[package]]
name = "flask"
version = "2.3.2"
description = "A simple framework for building complex web applications."
dependencies = [
    "Werkzeug >= 2.3.3",
    "Jinja2 >= 3.1.2",
    "itsdangerous >= 2.1.2",
    "click >= 8.1.3",
]
files = [
    {file = "Flask-2.3.2-py3-none-any.whl", hash = "sha256-..."},
]
\`\`\`

Maven 用 \`dependencyManagement\` + \`-Ddependency.version\`：

\`\`\`xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>32.1.3-jre</version>
    </dependency>
  </dependencies>
</dependencyManagement>
\`\`\`

Maven 没有传统意义的"锁文件"——它用 \`dependencyManagement\` 统一版本，加上 parent POM / BOM（Bill of Materials）机制。Spring Boot 就用 \`spring-boot-dependencies\` BOM 统一管理几百个依赖的版本：

\`\`\`xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.2.0</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
\`\`\`

## 五、环境隔离：venv vs 类路径

### Python：venv 是必备

Python 的虚拟环境（venv）是"目录级隔离"——每个项目一个 \`.venv\` 目录，里面有独立的 Python 解释器副本和独立的 site-packages：

\`\`\`bash
# 项目 A 用 flask 2.x
cd project-a
python -m venv .venv
source .venv/bin/activate
pip install "flask>=2.0,<3.0"

# 项目 B 用 flask 3.x
cd project-b
python -m venv .venv
source .venv/bin/activate
pip install "flask>=3.0"
\`\`\`

没有 venv 的话，所有项目共享全局 site-packages，版本冲突无解。所以 Python 项目几乎强制要求用 venv。

### Java：没有虚拟环境，靠类路径/模块

Java **没有**类似 venv 的概念。Java 的依赖隔离靠：

1. **类路径（Classpath）**：每个项目有自己的 classpath，指向不同的 jar 文件
2. **Maven 本地仓库**：所有 jar 都缓存在 \`~/.m2/repository\`，不同项目引用不同版本
3. **Java 9 模块系统**：用 \`module-info.java\` 显式声明模块依赖，更强隔离

\`\`\`bash
# Java 项目 A 用 guava 32
mvn package    # 产物 target/project-a.jar 依赖 guava 32

# Java 项目 B 用 guava 30
mvn package    # 产物 target/project-b.jar 依赖 guava 30

# 两个项目互不影响——它们运行时各自的 classpath 不同
\`\`\`

Java 的隔离是"项目级"的（每个 jar 自带 classpath），而 Python 是"环境级"的（每个 venv 一套依赖）。Java 的方式更轻量（不需要复制解释器），但 Python 的 venv 更彻底（连 Python 版本都可以每个项目不同）。

| 维度 | Python venv | Java classpath |
|------|-------------|----------------|
| 隔离粒度 | 整个 Python 环境 | 类加载器级别 |
| Python/JDK 版本 | 每个 venv 可以不同 | 需要切换 JAVA_HOME |
| 磁盘开销 | 较大（复制解释器副本） | 小（共享 jar 缓存） |
| 切换方式 | activate/deactivate | 切换 classpath |

## 六、仓库：PyPI vs Maven Central

### PyPI：开放但有质量参差

PyPI（pypi.org）是 Python 官方仓库，截至 2025 年有 60 万+ 包。注册发布门槛低：

\`\`\`bash
# 注册账号 + 配置 API token
pip install twine
python setup.py sdist bdist_wheel
twine upload dist/*
\`\`\`

低门槛带来繁荣，也带来"名字抢注""恶意包"问题——PyPI 团队疲于清理仿冒包。

### Maven Central：严格但繁琐

Maven Central 要求：

1. 注册 Sonatype JIRA 账号
2. 验证 GroupId 对应的域名所有权
3. 用 GPG 签名每个 artifact
4. 通过 staging 仓库审核后才能 release

发布流程繁琐，但保证了包的可信度——你不会在 Maven Central 上随便看到一个 \`springframework\` 仿冒包。

\`\`\`bash
mvn deploy -P release   # 部署到 staging
# 在 Sonatype Nexus 网页上 close → release
\`\`\`

## 七、打包产物：wheel vs jar

### Python：wheel + sdist

- **sdist**（source distribution）：\`.tar.gz\`，源码包，安装时本地编译
- **wheel**（built distribution）：\`.whl\`，预编译包，安装快

\`\`\`bash
python -m build    # 生成 dist/my_app-0.1.0-py3-none-any.whl + sdist
\`\`\`

wheel 的命名规则 \`my_app-0.1.0-py3-none-any.whl\` 包含 Python 版本、ABI、平台标签，C 扩展包会针对不同平台预编译（如 numpy 有几十个 wheel）。

### Java：jar / war / uber jar

- **jar**：Java 类文件 + 资源 + META-INF
- **war**：Web 应用归档（含 WEB-INF/）
- **uber jar / fat jar**：把所有依赖打进一个 jar，可直接 \`java -jar\` 运行

\`\`\`xml
<!-- Maven 打 uber jar：用 shade 插件 -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-shade-plugin</artifactId>
  <executions>
    <execution>
      <phase>package</phase>
      <goals><goal>shade</goal></goals>
      <configuration>
        <transformers>
          <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
            <mainClass>com.example.Main</mainClass>
          </transformer>
        </transformers>
      </configuration>
    </execution>
  </executions>
</plugin>
\`\`\`

Spring Boot 默认打的就是 fat jar（用 spring-boot-maven-plugin），\`java -jar app.jar\` 直接启动——这是 Java 比 Python 部署方便的地方之一。

## 八、一句话总结

| 维度 | Python | Java |
|------|--------|------|
| 工具成熟度 | 补课中（uv 2024 才追上） | 早已成熟（Maven 20 年） |
| 依赖解析 | poetry/uv 改进，pip 历史弱 | Maven 严谨确定性 |
| 环境隔离 | venv 强制必备 | classpath 天然隔离 |
| 工具数量 | 多到混乱 | 两强格局 |
| 仓库门槛 | 低（繁荣但风险高） | 高（繁琐但可信） |

**一句话总结**：Python 的包管理走了 20 年弯路，靠 poetry/uv 在 2024 年才补齐现代工程化；而 Maven 用 20 年时间证明"约定优于配置 + 严格依赖解析"才是大型项目的正道。

---

> **下一章**：包管理解决了"依赖从哪来"，接下来看"框架怎么搭"——Django/FastAPI vs Spring Boot，两套截然不同的 Web 后端哲学。`,
  },
  {
    id: "pyvsjava-web-frameworks",
    icon: "🌐",
    title: "Web 后端框架",
    group: "生态与工程",
    content: `# Web 后端框架

## 一、两种哲学：自由组合 vs 全家桶

Python Web 框架和 Java Web 框架的对比，本质是两种哲学的对比：

- **Python**："自由组合"哲学——框架只做一件事，其它（数据库、认证、缓存）你自己挑。Django 是个例外（全栈），但 Django 之外的 Flask/FastAPI 都是"组装积木"。
- **Java**："全家桶"哲学——Spring 把 IoC、AOP、事务、安全、数据访问、微服务全包了，你用 Spring 就该用全套，不要"东拼西凑"。

| 对位 | Python | Java |
|------|--------|------|
| 重型全栈 | Django | Spring Boot（+ Spring 全家桶） |
| 微型框架 | Flask | Javalin / Spark / Vert.x |
| 现代异步+类型 | FastAPI | Spring WebFlux |
| ORM | Django ORM / SQLAlchemy | Hibernate / JPA / MyBatis |
| 模板 | Jinja2 | Thymeleaf |
| DI 容器 | FastAPI 有限 / 无原生 | Spring IoC（核心） |

## 二、重型全栈：Django vs Spring Boot

### Django："for perfectionists with deadlines"

Django（2005）的口号是"The web framework for perfectionists with deadlines"——给有死线的完美主义者。它自带 ORM、模板、Admin 后台、表单、认证、缓存、信号、中间件……"开箱即用"到令人发指。

\`\`\`python
# Django：定义模型
# myapp/models.py
from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey("User", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
\`\`\`

\`\`\`python
# Django：定义视图（函数式）
# myapp/views.py
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Article

def article_detail(request, article_id):
    article = get_object_or_404(Article, pk=article_id)
    return JsonResponse({
        "title": article.title,
        "content": article.content,
        "author": article.author.username,
    })
\`\`\`

\`\`\`python
# Django：路由配置
# myapp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("articles/<int:article_id>/", views.article_detail),
]
\`\`\`

\`\`\`bash
# Django 自动生成 Admin 后台（这就是"开箱即用"）
python manage.py createsuperuser
python manage.py runserver
# 访问 /admin/ 就有完整的 CRUD 管理界面
\`\`\`

### Spring Boot：约定优于配置 + 全家桶

Spring Boot（2014）是 Spring 的"自动化配置版"——把 Spring 那一堆 XML/注解配置自动化，让你 5 分钟起一个服务：

\`\`\`java
// Spring Boot：实体 + JPA
// src/main/java/com/example/Article.java
package com.example;

import jakarta.persistence.*;

@Entity
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String content;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    // getter/setter 省略
}
\`\`\`

\`\`\`java
// Spring Boot：Repository（自动实现 CRUD）
package com.example;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<Article, Long> {
}
\`\`\`

\`\`\`java
// Spring Boot：Controller（REST）
package com.example;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/articles")
public class ArticleController {

    private final ArticleRepository repo;

    // 构造器注入（Spring 自动注入）
    public ArticleController(ArticleRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticle(@PathVariable Long id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Article createArticle(@RequestBody Article article) {
        return repo.save(article);
    }
}
\`\`\`

\`\`\`java
// Spring Boot：启动类
package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

\`\`\`bash
mvn spring-boot:run   # 启动，访问 http://localhost:8080/articles/1
\`\`\`

### Django vs Spring Boot 对比

| 维度 | Django | Spring Boot |
|------|--------|-------------|
| 语言 | Python | Java |
| 启动速度 | 快（<1 秒） | 慢（3-10 秒，JVM 预热） |
| 内存占用 | 小（~100MB） | 大（~500MB+） |
| ORM | Django ORM（内置） | JPA/Hibernate（默认） |
| Admin 后台 | 内置（杀手锏） | 无（需第三方） |
| 配置方式 | settings.py | application.yml + 注解 |
| DI | 简单（无容器） | IoC 容器（核心） |
| 学习曲线 | 平缓 | 陡峭（Spring 概念多） |
| 适合项目 | 内容站/中后台/快速原型 | 大型企业服务/微服务 |

Django 的杀手锏是 **Admin 后台**——写完 model，免费得到一套 CRUD 管理界面，对内部系统开发极其友好。Spring Boot 没有对标，需要自己用 Spring Data Rest 或写前端。

## 三、微型框架：Flask vs Javalin

### Flask：500 行文档起步

Flask（2010）号称"micro framework"——核心只做路由 + 请求响应，其它都要自己加：

\`\`\`python
from flask import Flask, jsonify, request

app = Flask(__name__)

articles = {}

@app.route("/articles/<int:article_id>", methods=["GET"])
def get_article(article_id):
    article = articles.get(article_id)
    if article is None:
        return jsonify({"error": "not found"}), 404
    return jsonify(article)

@app.route("/articles", methods=["POST"])
def create_article():
    data = request.get_json()
    article_id = len(articles) + 1
    articles[article_id] = data
    return jsonify({"id": article_id, **data}), 201

if __name__ == "__main__":
    app.run(debug=True)
\`\`\`

Flask 的哲学是"你想要什么自己加"——要数据库加 SQLAlchemy，要认证加 Flask-Login，要表单加 Flask-WTF。灵活但需要自己组装。

### Javalin：Java 的 Flask

Javalin（2017）是 Java/ Kotlin 的微型框架，定位类似 Flask：

\`\`\`java
import io.javalin.Javalin;

public class Main {
    public static void main(String[] args) {
        var app = Javalin.create().start(7000);

        app.get("/articles/{id}", ctx -> {
            int id = ctx.pathParamAsClass("id", Integer.class).get();
            ctx.json(articles.getOrDefault(id, "not found"));
        });

        app.post("/articles", ctx -> {
            var body = ctx.bodyAsClass(Map.class);
            int id = articles.size() + 1;
            articles.put(id, body);
            ctx.status(201).json(Map.of("id", id));
        });
    }
}
\`\`\`

Javalin 比 Spring 轻量得多，但 Java 生态里微型框架始终是"非主流"——大部分 Java 团队还是用 Spring Boot。

## 四、现代异步：FastAPI vs Spring WebFlux

### FastAPI：类型驱动的现代 Python

FastAPI（2018）是 Python Web 框架的"新生代"——基于类型提示 + async/await + Pydantic，自动生成 OpenAPI 文档：

\`\`\`python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class ArticleCreate(BaseModel):
    title: str
    content: str
    author_id: int

class ArticleResponse(BaseModel):
    id: int
    title: str
    content: str
    author_id: int

articles: dict[int, dict] = {}

@app.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int):
    if article_id not in articles:
        raise HTTPException(status_code=404, detail="not found")
    return {"id": article_id, **articles[article_id]}

@app.post("/articles", response_model=ArticleResponse, status_code=201)
async def create_article(article: ArticleCreate):
    article_id = len(articles) + 1
    articles[article_id] = article.model_dump()
    return {"id": article_id, **article.model_dump()}
\`\`\`

FastAPI 的杀手锏：

1. **类型即文档**：Pydantic 模型自动转 JSON Schema，访问 \`/docs\` 就有 Swagger UI
2. **async 原生**：基于 Starlette，高并发 IO 场景性能逼近 Node.js
3. **依赖注入**：用 \`Depends\` 实现轻量 DI

\`\`\`python
from fastapi import Depends

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/articles")
async def list_articles(db: Session = Depends(get_db)):
    return db.query(Article).all()
\`\`\`

### Spring WebFlux：反应式编程

Spring WebFlux（2017）是 Spring 的反应式版本，基于 Reactor（Mono/Flux）+ Netty，非阻塞 IO：

\`\`\`java
// Spring WebFlux：反应式 Controller
package com.example;

import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.*;

@RestController
@RequestMapping("/articles")
public class ArticleController {

    private final ArticleRepository repo;

    public ArticleController(ArticleRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{id}")
    public Mono<Article> getArticle(@PathVariable Long id) {
        return repo.findById(id)
            .switchIfEmpty(Mono.error(new NotFoundException("not found")));
    }

    @GetMapping
    public Flux<Article> listArticles() {
        return repo.findAll();
    }

    @PostMapping
    public Mono<Article> createArticle(@RequestBody Article article) {
        return repo.save(article);
    }
}
\`\`\`

WebFlux 的 \`Mono\`（0/1 个元素）和 \`Flux\`（0/N 个元素）是反应式流的核心抽象。它的优势是高并发下线程少、内存省（不阻塞），但代价是**调试极其困难**——反应式调用链堆栈信息几乎不可读。

| 维度 | FastAPI | Spring WebFlux |
|------|---------|----------------|
| 编程模型 | async/await（直观） | Mono/Flux（陡峭） |
| 性能 | 高（接近 Node） | 极高（非阻塞） |
| 类型 | Pydantic（运行时校验） | Java 类型（编译期） |
| 文档 | 自动 Swagger | 自动 OpenAPI |
| 学习曲线 | 平缓 | 陡峭（反应式思维） |
| 调试 | 容易 | 困难（堆栈乱） |

## 五、ORM 对比

### Django ORM：直观但绑定 Django

\`\`\`python
# Django ORM：查询
Article.objects.filter(author__username="zhangsan").order_by("-created_at")[:10]

# 多表关联
Article.objects.filter(author__department__name="工程部").count()
\`\`\`

### SQLAlchemy：Python 的 Hibernate

\`\`\`python
from sqlalchemy import select
from sqlalchemy.orm import Session

with Session(engine) as session:
    stmt = select(Article).where(Article.author_id == 1).order_by(Article.created_at.desc()).limit(10)
    articles = session.scalars(stmt).all()
\`\`\`

### Hibernate/JPA：Java 的重型 ORM

\`\`\`java
// Spring Data JPA：方法名即查询（魔法）
public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByAuthorUsernameOrderByCreatedAtDesc(String username);

    @Query("SELECT a FROM Article a WHERE a.author.department.name = :dept")
    long countByDepartment(@Param("dept") String dept);
}
\`\`\`

### MyBatis：Java 特有的"半 ORM"

MyBatis 在中国 Java 圈极流行——SQL 写在 XML 里，对象只做映射，不做"自动 SQL 生成"：

\`\`\`xml
<!-- ArticleMapper.xml -->
<select id="findByAuthor" resultType="Article">
    SELECT * FROM articles
    WHERE author_id = #{authorId}
    ORDER BY created_at DESC
    LIMIT 10
</select>
\`\`\`

MyBatis 的哲学是"SQL 我自己写，性能我自己控"——这在中国互联网公司（高并发、复杂 SQL）很受欢迎，而 Hibernate 在欧美更主流。

| ORM | 语言 | 风格 | 自动 SQL | 复杂度 |
|-----|------|------|----------|--------|
| Django ORM | Python | 查询集 | 是 | 低 |
| SQLAlchemy | Python | Unit of Work | 是 | 中高 |
| Hibernate/JPA | Java | 全自动 ORM | 是 | 高 |
| MyBatis | Java | SQL 映射 | 否（手写 SQL） | 中 |

## 六、依赖注入：FastAPI Depends vs Spring IoC

依赖注入（DI）是 Spring 的核心灵魂，而 Python 几乎没有"DI 容器"概念。

### Spring IoC：容器管理一切

\`\`\`java
// Spring：声明组件
@Service
public class ArticleService {
    private final ArticleRepository repo;
    private final EmailService email;

    // 构造器注入，Spring 自动装配
    public ArticleService(ArticleRepository repo, EmailService email) {
        this.repo = repo;
        this.email = email;
    }

    public Article publish(Long id) {
        var article = repo.findById(id).orElseThrow();
        email.notify(article.getAuthor());
        return article;
    }
}

@RestController
public class ArticleController {
    private final ArticleService service;
    public ArticleController(ArticleService service) { this.service = service; }
}
\`\`\`

Spring 的 IoC 容器在启动时扫描所有 \`@Component/@Service/@Repository/@Controller\`，自动创建实例并按类型注入。这是"控制反转"——你不再 \`new\` 对象，容器帮你 \`new\`。

### FastAPI Depends：函数式 DI

FastAPI 的 DI 是"函数式"的，靠 \`Depends\`：

\`\`\`python
from fastapi import Depends

def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str, db: Session = Depends(get_db_session)):
    user = verify_token(token, db)
    if not user:
        raise HTTPException(401)
    return user

@app.get("/me")
async def me(user = Depends(get_current_user)):
    return {"username": user.username}
\`\`\`

FastAPI 的 DI 没有"容器"，每个依赖就是一个函数，靠 \`Depends\` 串起来。比 Spring 轻量，但没有 Spring 的 AOP、生命周期管理、条件装配等高级特性。

## 七、模板引擎：Jinja2 vs Thymeleaf

### Jinja2：Python 模板之王

\`\`\`html
<!-- Django/Jinja2 模板 -->
{% extends "base.html" %}
{% block content %}
  <h1>{{ article.title }}</h1>
  <p>作者：{{ article.author.username }}</p>
  {% if article.comments %}
    <ul>
    {% for comment in article.comments %}
      <li>{{ comment.text }}</li>
    {% endfor %}
    </ul>
  {% endif %}
{% endblock %}
\`\`\`

### Thymeleaf：Spring 的天然模板

Thymeleaf 的特点是"天然 HTML"——不渲染也能在浏览器打开看：

\`\`\`html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
  <h1 th:text="\${article.title}">标题占位</h1>
  <p>作者：<span th:text="\${article.author.username}">作者占位</span></p>
  <ul>
    <li th:each="comment : \${article.comments}" th:text="\${comment.text}">评论占位</li>
  </ul>
</body>
</html>
\`\`\`

注意 Thymeleaf 里用 \`\${...}\` 表达式——这就是为什么本文件的转义规则要把 \`\${\` 写成 \\\`\\\${\\\`。

## 八、一句话总结

| 维度 | Python 阵营 | Java 阵营 |
|------|-------------|-----------|
| 哲学 | 自由组合 | 全家桶 |
| 全栈 | Django | Spring Boot |
| 微型 | Flask | Javalin |
| 现代 | FastAPI | WebFlux |
| DI | FastAPI Depends（轻） | Spring IoC（重） |
| 模板 | Jinja2 | Thymeleaf |

**一句话总结**：Spring 的"全家桶"哲学让大型团队"按图索骥"，Python 的"自由组合"哲学让小团队"轻装上阵"——FastAPI 的崛起证明 Python 终于找到了"现代 Web 框架"的正确姿势。

---

> **下一章**：Web 框架只是冰山一角，企业级架构（微服务、消息队列、分布式事务、监控）才是 Spring 真正的护城河。`,
  },
  {
    id: "pyvsjava-enterprise",
    icon: "🏢",
    title: "企业级架构",
    group: "生态与工程",
    content: `# 企业级架构

## 一、Spring 生态：Java 企业开发的"操作系统"

如果说 Spring Boot 是"应用框架"，那 Spring 全家桶就是 Java 企业开发的"操作系统"。它覆盖了一个企业应用从开发到运维的所有环节：

\`\`\`
Spring 全家桶全景
┌─────────────────────────────────────────────────┐
│  Spring Boot（自动配置 + 起步依赖）              │
│  ┌───────────────────────────────────────────┐  │
│  │ Spring Framework（IoC + AOP + 事务）      │  │
│  ├───────────────────────────────────────────┤  │
│  │ Spring Web（MVC/WebFlux）                 │  │
│  │ Spring Data（JPA/Redis/Mongo）            │  │
│  │ Spring Security（认证授权）               │  │
│  │ Spring Batch（批处理）                    │  │
│  │ Spring Integration（EAI 集成）            │  │
│  ├───────────────────────────────────────────┤  │
│  │ Spring Cloud（微服务全家桶）              │  │
│  │  ├ Config（配置中心）                     │  │
│  │  ├ Netflix Eureka / LoadBalancer（注册）  │  │
│  │  ├ OpenFeign（声明式 HTTP 客户端）        │  │
│  │  ├ Gateway（API 网关）                    │  │
│  │  ├ Circuit Breaker（熔断）                │  │
│  │  └ Sleuth + Zipkin（链路追踪）            │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
\`\`\`

Python **没有**对标 Spring 全家桶的东西。Django 只覆盖了 Web + ORM + Auth，微服务、配置中心、熔断、链路追踪都得自己拼。

| 企业级能力 | Java（Spring 全家桶） | Python |
|------------|----------------------|--------|
| IoC 容器 | Spring Core | 无原生（FastAPI Depends 有限） |
| AOP 切面 | Spring AOP / AspectJ | 装饰器（手动） |
| 声明式事务 | @Transactional | 无（手动或装饰器） |
| 安全框架 | Spring Security | 无统一（各框架自带） |
| 微服务全家桶 | Spring Cloud | 无（拼凑） |
| 配置中心 | Spring Cloud Config / Nacos | 无标准 |
| 服务注册发现 | Eureka / Nacos / Consul | 无标准 |
| 熔断降级 | Resilience4j / Sentinel | 无标准（pyston tenacity 凑合） |
| 链路追踪 | SkyWalking / Zipkin | opentelemetry（有但不够流行） |

## 二、AOP 与声明式事务：Spring 的魔法

### Spring AOP：横切关注点

Spring AOP 让你把"日志、事务、权限、缓存"这些横切逻辑用切面统一处理，业务代码保持纯净：

\`\`\`java
// Spring：声明式事务，一个注解搞定
@Service
public class TransferService {

    @Transactional
    public void transfer(Long from, Long to, BigDecimal amount) {
        accountRepo.debit(from, amount);
        accountRepo.credit(to, amount);
        // 方法正常结束 → 提交；抛异常 → 回滚
    }
}
\`\`\`

\`\`\`java
// Spring：自定义切面（日志/性能监控）
@Aspect
@Component
public class LoggingAspect {

    @Around("execution(* com.example.service.*.*(..))")
    public Object log(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        try {
            Object result = pjp.proceed();
            long cost = System.currentTimeMillis() - start;
            log.info("{}#{} cost={}ms", pjp.getTarget().getClass().getSimpleName(),
                     pjp.getSignature().getName(), cost);
            return result;
        } catch (Throwable e) {
            log.error("method error", e);
            throw e;
        }
    }
}
\`\`\`

### Python：装饰器凑合

Python 没有真正的 AOP，靠装饰器手动实现类似效果：

\`\`\`python
import functools
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def log_execution(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = func(*args, **kwargs)
            cost = (time.time() - start) * 1000
            logger.info("%s cost=%.1fms", func.__name__, cost)
            return result
        except Exception as e:
            logger.error("method error: %s", e)
            raise
    return wrapper

@log_execution
def transfer(from_id: int, to_id: int, amount: float):
    debit(from_id, amount)
    credit(to_id, amount)
\`\`\`

装饰器能模拟一部分 AOP，但 Spring AOP 的优势是"声明式 + 容器集成"——\`@Transactional\` 自动管理事务边界，\`@Async\` 自动异步执行，这些在 Python 里都要手动处理或依赖框架特定机制。

## 三、微服务：Spring Cloud vs Python 拼凑

### Spring Cloud：开箱即用的微服务全家桶

\`\`\`java
// Spring Cloud：声明式 HTTP 客户端（OpenFeign）
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/users/{id}")
    User getUser(@PathVariable Long id);
}

// 像调本地方法一样调远程服务
@Service
public class OrderService {
    private final UserClient userClient;
    public OrderService(UserClient userClient) { this.userClient = userClient; }

    public Order createOrder(Long userId) {
        User user = userClient.getUser(userId);  // 自动负载均衡 + 服务发现
        // ...
    }
}
\`\`\`

\`\`\`yaml
# application.yml：注册中心 + 配置中心
spring:
  cloud:
    nacos:
      discovery:
        server-addr: nacos:8848
      config:
        server-addr: nacos:8848
        file-extension: yaml
    sentinel:
      transport:
        dashboard: sentinel:8080
\`\`\`

Spring Cloud Alibaba（Nacos + Sentinel + Seata + RocketMQ）在中国企业里几乎是微服务事实标准。

### Python：拼凑式微服务

Python 没有对标的微服务全家桶，只能拼凑：

\`\`\`python
# Python：调远程服务用 httpx + 自己写负载均衡
import httpx

async def get_user(user_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        # 服务发现？自己用 consul-py 或写死 IP
        # 负载均衡？自己用 round-robin 或随机
        # 熔断？自己用 tenacity 或 pycircuit
        resp = await client.get(f"http://user-service/users/{user_id}")
        resp.raise_for_status()
        return resp.json()
\`\`\`

Python 社区有 Nameko（微服务框架）、Granian 等，但都不成气候。大部分 Python 微服务项目最后都是"FastAPI + httpx + 自己造轮子"。

## 四、分布式事务：Seata vs 数据库/Redis

### Java Seata：分布式事务方案

Seata（阿里开源）提供 AT/TCC/SAGA/XA 四种模式：

\`\`\`java
// Seata AT 模式：一个注解搞定分布式事务
@GlobalTransactional
public void placeOrder(Long userId, List<Item> items) {
    orderService.create(userId, items);          // 订单库
    storageService.deduct(items);                // 库存库
    accountService.debit(userId, totalAmount);   // 账户库
    // 任意一步失败，三库一起回滚
}
\`\`\`

### Python：靠数据库或 Redis 兜底

Python 没有成熟的分布式事务框架，常见做法：

\`\`\`python
# Python：用 Saga 模式 + 补偿事务手动实现
async def place_order(user_id, items):
    try:
        order = await create_order(user_id, items)
        try:
            await deduct_inventory(items)
        except Exception:
            await cancel_order(order.id)  # 补偿
            raise
        try:
            await debit_account(user_id, total)
        except Exception:
            await restore_inventory(items)  # 补偿
            await cancel_order(order.id)
            raise
    except Exception as e:
        logger.error("place_order failed: %s", e)
        raise
\`\`\`

复杂、易错、没标准。这是 Python 在大型企业架构里的硬伤之一。

## 五、消息队列集成

### Java：Kafka/RabbitMQ 客户端最成熟

\`\`\`java
// Spring Kafka：声明式消费者
@KafkaListener(topics = "orders", groupId = "order-group")
public void handleOrder(OrderEvent event) {
    orderService.process(event);
}

// Spring RabbitMQ
@RabbitListener(queues = "order.queue")
public void handle(OrderEvent event) {
    orderService.process(event);
}
\`\`\`

Spring 把 Kafka/RabbitMQ/RocketMQ/Pulsar 都封装了 starter，开箱即用。

### Python：客户端存在但不够成熟

\`\`\`python
# Python：用 confluent-kafka 或 aiokafka
from aiokafka import AIOKafkaConsumer
import asyncio

async def consume():
    consumer = AIOKafkaConsumer(
        "orders",
        bootstrap_servers="kafka:9092",
        group_id="order-group",
    )
    await consumer.start()
    try:
        async for msg in consumer:
            event = json.loads(msg.value)
            await process_order(event)
    finally:
        await consumer.stop()
\`\`\`

Python 的 Kafka 客户端功能上够用，但缺少 Spring 那种"声明式 + 事务 + 死信队列 + 重试策略"的完整封装。

## 六、监控：Micrometer vs prometheus_client

### Java：Micrometer + Prometheus + SkyWalking

\`\`\`java
// Spring Boot Actuator + Micrometer：自动暴露 /actuator/metrics
@RestController
public class OrderController {
    private final Counter orderCounter;

    public OrderController(MeterRegistry registry) {
        this.orderCounter = Counter.builder("orders.created")
            .description("Number of orders created")
            .register(registry);
    }

    @PostMapping("/orders")
    public Order create() {
        orderCounter.increment();
        return orderService.create();
    }
}
\`\`\`

SkyWalking（Apache，中国团队主导）是 Java 圈最流行的 APM，自动埋点 Spring MVC/MyBatis/Redis/Kafka，零代码改动就有完整链路追踪。

### Python：prometheus_client + opentelemetry

\`\`\`python
from prometheus_client import Counter, generate_latest
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

app = FastAPI()
order_counter = Counter("orders_created", "Number of orders created")

@app.post("/orders")
async def create_order():
    order_counter.inc()
    return {"status": "ok"}

@app.get("/metrics")
async def metrics():
    return PlainTextResponse(generate_latest())
\`\`\`

Python 有 opentelemetry SDK，但生态采用率远不如 Java——SkyWalking 的 Python agent 一直不够稳定。

## 七、配置中心

### Spring Cloud Config / Nacos

\`\`\`yaml
# Spring Cloud Nacos：配置自动刷新
@RefreshScope
@RestController
public class FeatureController {
    @Value("\${feature.newCheckout.enabled:false}")
    private boolean newCheckoutEnabled;

    @GetMapping("/feature/new-checkout")
    public boolean isNewCheckoutEnabled() {
        return newCheckoutEnabled;
    }
}
# 在 Nacos 控制台改配置，自动推送到所有实例，@RefreshScope Bean 自动重建
\`\`\`

### Python：无标准方案

Python 没有统一的配置中心方案。常见做法：

\`\`\`python
# Python：自己拉配置 + 热更新靠重启
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    new_checkout_enabled: bool = False
    database_url: str

    class Config:
        env_file = ".env"

settings = Settings()
# 想热更新？自己写轮询 Nacos 的逻辑，或者直接重启服务
\`\`\`

## 八、为什么 Java 适合大型企业而 Python 适合中小型

综合以上对比，原因清晰：

1. **生态完整度**：Spring 全家桶覆盖企业开发所有环节，Python 需要拼凑
2. **类型安全**：静态类型让大型团队协作、重构更安全
3. **运维监控**：SkyWalking/Micrometer 等工具成熟，Python 追赶吃力
4. **人才市场**：Java 企业开发人才储备充足，Python 偏数据/AI
5. **长期维护**：Java 二进制兼容性好（jar 跑 10 年），Python 2→3 迁移痛过

但 Python 也有它的地盘：

- **AI/数据驱动**的中小型服务（FastAPI + 模型推理）
- **原型/内部工具**（Django Admin 几小时搭一个后台）
- **脚本/ETL**（Python 简单脚本胜过 Java 工程化）

\`\`\`
企业级架构选型决策树
┌─────────────────────────────┐
│ 项目规模？                   │
└──────────────┬──────────────┘
       ┌───────┴────────┐
       ▼                ▼
   大型企业            中小型
   高并发              快速迭代
   长期维护            AI/数据驱动
       │                │
       ▼                ▼
    Java + Spring     Python (FastAPI/Django)
    微服务全家桶       单体或轻量微服务
\`\`\`

## 九、一句话总结

**一句话总结**：Spring 全家桶是 Java 在企业级架构的真正护城河——微服务、分布式事务、监控、配置中心一整套成熟方案，Python 至今没有对标；但 Python 在"AI 驱动的中小型服务"这一新地盘上找到了自己的位置。

---

> **下一章**：从企业架构转向数据科学与 AI——这是 Python 真正"碾压"Java 的领域，碾压到 Java 几乎缺席。`,
  },
  {
    id: "pyvsjava-data-ai",
    icon: "🤖",
    title: "数据科学与 AI",
    group: "生态与工程",
    content: `# 数据科学与 AI

## 一、Python 在数据科学与 AI 的绝对霸主

如果说前几章 Java 还有优势，那这一章是 Python 的"屠杀现场"。数据科学和 AI 领域，Python 是绝对霸主，Java 几乎缺席。

\`\`\`
2025 年数据科学与 AI 生态语言占比（大致）
┌────────────────────────────────────────┐
│ Python  ████████████████████████  ~90% │
│ R       ██                            ~5% │
│ Julia   █                             ~2% │
│ Java    ▎                            ~1% │
│ 其他     ▎                            ~2% │
└────────────────────────────────────────┘
\`\`\`

| 领域 | Python 阵营 | Java 阵营 |
|------|-------------|-----------|
| 数值计算 | NumPy | 无（ND4J 已停更） |
| 数据处理 | Pandas | 无对标（Apache Tables 不流行） |
| 科学计算 | SciPy | 无对标 |
| 可视化 | Matplotlib/Seaborn/Plotly | 无对标 |
| 传统机器学习 | Scikit-learn | Weka/Tribuo（小众） |
| 深度学习 | TensorFlow/PyTorch | DL4J（边缘） |
| LLM SDK | OpenAI/Anthropic 第一公民 | LangChain4j（二等） |
| Notebook | Jupyter | 无（Jupyter Java 内核小众） |

## 二、Python 数据科学核心栈

### NumPy：一切的基础

\`\`\`python
import numpy as np

# 创建数组
a = np.array([1, 2, 3, 4, 5])
b = np.array([[1, 2, 3], [4, 5, 6]])

# 向量化运算（C 后端，比 Python 循环快 100 倍）
a * 2              # array([2, 4, 6, 8, 10])
b.T                # 转置
b @ b.T            # 矩阵乘法
np.mean(b, axis=0) # 按列求均值

# 广播
a + 100            # array([101, 102, 103, 104, 105])
\`\`\`

NumPy 的核心是 C 实现的 ndarray——连续内存 + 向量化操作 + 广播规则。Python 只是个"胶水壳"，真正的计算在 C 层。

### Pandas：数据分析的 Excel

\`\`\`python
import pandas as pd

df = pd.read_csv("sales.csv")

# 筛选
high_value = df[df["amount"] > 1000]

# 分组聚合
summary = df.groupby("region")["amount"].agg(["mean", "sum", "count"])

# 透视表
pivot = df.pivot_table(index="region", columns="month", values="amount", aggfunc="sum")

# 合并
merged = pd.merge(orders, customers, on="customer_id", how="left")

# 时间序列
df["date"] = pd.to_datetime(df["date"])
monthly = df.set_index("date").resample("M")["amount"].sum()
\`\`\`

Pandas 让"用代码做 Excel 能做的事"变得极其自然——这是数据分析师入门 Python 的第一站。

### Matplotlib：可视化

\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(x, y, label="sin(x)", color="steelblue")
ax.set_title("Sine Wave")
ax.legend()
ax.grid(True)
plt.savefig("sine.png", dpi=150)
\`\`\`

## 三、机器学习：Scikit-learn 的统治

\`\`\`python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# 加载数据
X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 训练随机森林
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 评估
y_pred = clf.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print(classification_report(y_test, y_pred))
\`\`\`

Scikit-learn 的 API 设计极其统一——所有模型都是 \`fit\` / \`predict\` / \`transform\`，换模型只改一行。这种统一性让"实验不同模型"成本极低。

Java 对标的 Weka/Tribuo 市场份额可以忽略不计。

## 四、深度学习：PyTorch 的统治

2025 年，PyTorch 在研究界占比超过 90%，TensorFlow 在工业部署仍有份额但研究界已基本被 PyTorch 占领。

\`\`\`python
import torch
import torch.nn as nn
import torch.optim as optim

# 定义模型
class MLP(nn.Module):
    def __init__(self, in_dim, hidden_dim, out_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, out_dim),
        )

    def forward(self, x):
        return self.net(x)

model = MLP(784, 256, 10)
optimizer = optim.Adam(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

# 训练循环
for epoch in range(10):
    for batch_x, batch_y in dataloader:
        pred = model(batch_x)
        loss = criterion(pred, batch_y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
\`\`\`

PyTorch 的"动态图"设计让调试像写普通 Python 代码一样自然——这是它击败 TensorFlow（静态图）的关键。

### Java 的尝试：Deeplearning4j

\`\`\`java
// Deeplearning4j：Java 的深度学习库
MultiLayerConfiguration conf = new NeuralNetConfiguration.Builder()
    .updater(new Adam(1e-3))
    .list()
    .layer(new DenseLayer.Builder().nIn(784).nOut(256).activation(RELU).build())
    .layer(new OutputLayer.Builder(LossFunction.NEGATIVELOGLIKELIHOOD)
        .nIn(256).nOut(10).activation(SOFTMAX).build())
    .build();

MultiLayerNetwork model = new MultiLayerNetwork(conf);
model.init();
model.fit(trainingData);
\`\`\`

DL4J 功能上能用，但生态远不如 PyTorch——没有 Hugging Face 对标、没有预训练模型库、社区小。研究界几乎没人用。

## 五、为什么 Python 赢了

### 1. 研究者友好

学术论文作者大多是研究人员（不是工程师），他们要的是"快速实验想法"，而不是"工程严谨性"。Python 的动态类型、交互式 REPL、简洁语法完美契合：

\`\`\`python
# 研究者写 Python：5 行实现一个想法
import torch
x = torch.randn(100, 10)
w = torch.randn(10, 1, requires_grad=True)
y = (x @ w).sum()
y.backward()
print(w.grad)  # 自动求导
\`\`\`

同样的想法用 Java 写要多几倍的代码，且编译-运行循环拖慢实验。

### 2. C 后端胶水

Python 的"胶水语言"定位让它能调用 C/Fortran 写的高性能数值库（NumPy 底层是 C，SciPy 底层是 Fortran LAPACK）。研究者用 Python 写高层逻辑，性能瓶颈全在 C 层——既有"开发效率"又有"运行效率"。

### 3. 生态飞轮

\`\`\`
论文用 Python 实现 → 开源到 GitHub → 别人用 pip install 复现
→ 越多人用 → 越多库基于它 → 新论文继续用 Python
→ 飞轮转起来，Java 无法切入
\`\`\`

PyTorch、Transformers、Diffusers、LangChain——所有前沿 AI 库都是 Python 第一公民。

### 4. Jupyter Notebook

\`\`\`python
# Jupyter Notebook：交互式数据分析
# Cell 1
import pandas as pd
df = pd.read_csv("data.csv")
df.head()

# Cell 2
df.describe()

# Cell 3
import matplotlib.pyplot as plt
df["price"].hist(bins=50)
plt.show()
\`\`\`

Jupyter 让"探索性数据分析"变成愉悦体验——代码、图表、文字、公式混排在一份文档里。Java 没有对标（IJava 内核极其小众）。

## 六、LLM 时代：Python 第一公民

### OpenAI/Anthropic SDK

\`\`\`python
# Python：OpenAI SDK（第一公民，功能最全）
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个翻译助手"},
        {"role": "user", "content": "把这句话翻成英文：今天天气很好"},
    ],
    temperature=0.3,
)
print(response.choices[0].message.content)
\`\`\`

\`\`\`python
# 流式输出 + Function Calling + 多模态，Python SDK 全支持
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    stream=True,
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "parameters": {"type": "object", "properties": {"city": {"type": "string"}}}
        }
    }],
)
for chunk in stream:
    delta = chunk.choices[0].delta
    if delta.content:
        print(delta.content, end="", flush=True)
\`\`\`

### LangChain / LlamaIndex

\`\`\`python
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA

# RAG：5 行代码
docs = PyPDFLoader("report.pdf").load()
vectorstore = Chroma.from_documents(docs, OpenAIEmbeddings())
qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4o"),
    retriever=vectorstore.as_retriever(),
)
print(qa.invoke("这份报告的核心结论是什么？"))
\`\`\`

### Java：二等公民

Java 有 LangChain4j、Spring AI，但功能滞后、社区小、新模型支持慢半拍。OpenAI 官方 Java SDK 2024 年才正式发布（Python 早就稳定多年）。

\`\`\`java
// Spring AI：Java 的 LLM 封装
@RestController
public class ChatController {
    private final ChatClient client;
    public ChatController(ChatClient.Builder builder) {
        this.client = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String q) {
        return client.prompt().user(q).call().content();
    }
}
\`\`\`

Spring AI 不错，但生态丰富度远不如 Python LangChain——Agent 框架、向量数据库集成、工具调用都还在追赶。

## 七、Spark 大数据：PySpark 的特殊位置

Spark 是 JVM 写的（Scala），但 PySpark 让 Python 也能用：

\`\`\`python
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, avg

spark = SparkSession.builder.appName("sales-agg").getOrCreate()

df = spark.read.parquet("s3://bucket/sales/")
result = (
    df.filter(col("amount") > 100)
     .groupBy("region")
     .agg(sum("amount").alias("total"), avg("amount").alias("avg"))
     .orderBy(col("total").desc())
)
result.show()
\`\`\`

PySpark 底层通过 Py4J 网桥调用 JVM——Python 写驱动逻辑，真正的分布式计算在 JVM executor 上跑。所以"PySpark 性能 ≈ Scala Spark"（除了 Python UDF 有序列化开销）。

## 八、Python 的 AI 优势为什么短期无法撼动

1. **人才壁垒**：全球 AI 研究者 90%+ 用 Python，转换成本巨大
2. **库生态**：PyTorch/HF/LangChain 等核心库深度绑定 Python
3. **教育惯性**：所有 AI 课程用 Python，新人入门就是 Python
4. **模型格式**：safetensors、ONNX runtime Python 优先
5. **MLOps**：MLflow/Weights&Biases Python 优先

Java 想翻盘，需要的不是"做一个更好的语言"，而是"重做整个生态"——这在飞轮已经转起来的领域几乎不可能。

## 九、一句话总结

**一句话总结**：数据科学与 AI 是 Python 的"屠杀现场"——NumPy/Pandas/PyTorch/Transformers 构成的飞轮让 Java 几乎缺席，LLM 时代 Python 进一步巩固"第一公民"地位，短期无法撼动。

---

> **下一章**：AI 是 Python 的主场，但"大数据基础设施"（Hadoop/Spark/Flink/Kafka）全是 JVM 写的——这是 Java/Scala 的主场，Python 只是"借道"。`,
  },
  {
    id: "pyvsjava-bigdata",
    icon: "📊",
    title: "大数据与分布式",
    group: "生态与工程",
    content: `# 大数据与分布式

## 一、大数据基础设施：全是 JVM

数据科学与 AI 是 Python 主场，但"大数据基础设施"恰恰相反——Hadoop、Spark、Flink、Kafka、Elasticsearch 全是 JVM 写的（Java/Scala）。Java/Scala 是大数据的"原生语言"。

\`\`\`
大数据基础设施语言栈
┌─────────────────────────────────────────────┐
│ Hadoop    Java      HDFS + MapReduce + YARN │
│ Spark     Scala     统一引擎（批/流/SQL/ML） │
│ Flink     Java/Scala  流处理王者            │
│ Kafka     Scala/Java  消息队列事实标准       │
│ ES        Java       搜索引擎               │
│ HBase     Java       列式存储               │
│ Hive      Java       数据仓库               │
│ Presto    Java       交互式查询             │
└─────────────────────────────────────────────┘
\`\`\`

| 维度 | Java/Scala | Python |
|------|------------|--------|
| 大数据引擎本体 | 原生（JVM 写的） | 借道（Py4J 网桥） |
| 性能 | 原生 | 有网桥开销 |
| API 完整度 | 第一公民 | 跟随（部分滞后） |
| 流处理 | Flink 原生 | PyFlink 较新 |
| 客户端成熟度 | 最成熟 | 可用但不够成熟 |

## 二、PySpark：Python 借道 JVM

### PySpark 的工作原理

PySpark 不是"用 Python 重写的 Spark"，而是"Python 调用 JVM Spark"。架构如下：

\`\`\`
PySpark 架构
┌──────────────────┐        Py4J（本地 socket）
│ Python Driver     │◄──────────────────────────┐
│  (pyspark)        │                            │
└────────┬─────────┘                            │
         │ 启动 JVM                              │
         ▼                                       │
┌──────────────────┐                            │
│ JVM Driver       │────────────────────────────┘
│  (SparkContext)  │
└────────┬─────────┘
         │ 分发任务
         ▼
┌──────────────────────────────────────────────┐
│ Executor（JVM 进程，跑在 worker 节点）        │
│  ┌─────────────┐    ┌─────────────┐          │
│  │ Task (JVM)  │    │ Task (JVM)  │  ...     │
│  └─────────────┘    └─────────────┘          │
└──────────────────────────────────────────────┘
\`\`\`

关键点：**真正的分布式计算在 JVM executor 上跑**，Python 只负责"驱动逻辑"和"Python UDF"。所以 PySpark 的批量计算性能和 Scala Spark 接近，差异主要在：

1. **Python UDF 序列化开销**：Python 函数要序列化发到 executor，executor 启动 Python 进程执行，结果再序列化回 JVM——这一来一回开销大
2. **驱动层开销**：Python driver 和 JVM driver 之间走 Py4J 网桥，有少量开销

### PySpark 代码示例

\`\`\`python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F

spark = SparkSession.builder.appName("user-analysis").getOrCreate()

# 读 Parquet
df = spark.read.parquet("s3://bucket/events/2025/")

# 转换
result = (
    df.filter(F.col("event_type") == "purchase")
      .groupBy(F.col("user_id"))
      .agg(
          F.sum("amount").alias("total_spent"),
          F.count("*").alias("purchase_count"),
          F.max("event_time").alias("last_purchase"),
      )
      .filter(F.col("total_spent") > 1000)
      .orderBy(F.desc("total_spent"))
)

result.write.mode("overwrite").parquet("s3://bucket/result/")
\`\`\`

### Scala Spark 对比

\`\`\`scala
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions._

val spark = SparkSession.builder.appName("user-analysis").getOrCreate()

val df = spark.read.parquet("s3://bucket/events/2025/")

val result = df
  .filter(\$"event_type" === "purchase")
  .groupBy(\$"user_id")
  .agg(
    sum("amount").as("total_spent"),
    count(lit(1)).as("purchase_count"),
    max("event_time").as("last_purchase")
  )
  .filter(\$"total_spent" > 1000)
  .orderBy(desc("total_spent"))

result.write.mode("overwrite").parquet("s3://bucket/result/")
\`\`\`

API 几乎一一对应——PySpark 是 Scala Spark API 的"Python 翻译"。区别在于：

- Scala 类型更严格（编译期检查列名/类型）
- Scala 能直接调用 Spark 内部 API，性能极致
- Python 写 UDF 更灵活，但序列化开销大

### Python UDF 的性能陷阱

\`\`\`python
# Python UDF：慢（要序列化 + 启动 Python 进程）
@F.udf("double")
def complex_calc(x: float, y: float) -> float:
    # 复杂业务逻辑
    return some_lib.compute(x, y)

df = df.withColumn("result", complex_calc("x", "y"))  # 每行都跨进程调用

# 替代方案：用 Spark SQL 内置函数（JVM 内执行，快）
df = df.withColumn("result", F.log(F.col("x")) + F.col("y"))
\`\`\`

生产建议：能用 Spark SQL 内置函数就别写 Python UDF。必须写 UDF 时考虑 Pandas UDF（Arrow 批量传输，比行级 UDF 快 10-100 倍）。

\`\`\`python
# Pandas UDF：用 Arrow 批量序列化，快得多
import pandas as pd

@F.pandas_udf("double")
def complex_calc_batch(x: pd.Series, y: pd.Series) -> pd.Series:
    return some_lib.compute_vectorized(x.values, y.values)

df = df.withColumn("result", complex_calc_batch("x", "y"))
\`\`\`

## 三、流处理：Flink 的主场

### Flink：流处理王者

Apache Flink（Java/Scala）是真正的"流原生"引擎——事件时间、水位线、状态后端、精确一次语义都做得最完善。

\`\`\`java
// Flink Java：窗口聚合
DataStream<Event> stream = env
    .addSource(new FlinkKafkaConsumer<>("events", new EventDeserializer(), props))
    .keyBy(Event::getUserId)
    .window(TumblingEventTimeWindows.of(Time.minutes(5)))
    .aggregate(new CountAgg());

stream.addSink(new FlinkKafkaProducer<>("results", new ResultSerializer(), props));
\`\`\`

\`\`\`scala
// Flink Scala：更简洁
val stream = env
  .addSource(new FlinkKafkaConsumer[Event]("events", deser, props))
  .keyBy(_.userId)
  .window(TumblingEventTimeWindows.of(Time.minutes(5)))
  .aggregate(new CountAgg)
\`\`\`

### PyFlink：跟随但较新

\`\`\`python
# PyFlink：Python API
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.datastream.functions import KeyedProcessFunction
from pyflink.common import Time, TimeUnits

env = StreamExecutionEnvironment.get_execution_environment()

ds = env.from_source(
    kafka_source,
    WatermarkStrategy.for_bounded_out_of_orderness(Time.minutes(1)),
    "events"
)

result = (
    ds.key_by(lambda e: e.user_id)
      .window(TumblingEventTimeWindows.of(Time.minutes(5)))
      .aggregate(CountAgg())
)

result.sink_to(kafka_sink)
env.execute("user-window-agg")
\`\`\`

PyFlink 2020 年才逐渐成熟，功能上跟随 Java/Scala API，但新特性通常滞后 1-2 个版本，复杂场景（自定义 Operator、状态 TTL 细粒度控制）只能用 Java。

## 四、消息队列：Kafka 客户端对比

### Java Kafka 客户端：最成熟

\`\`\`java
// Spring Kafka：生产者
@Autowired
private KafkaTemplate<String, OrderEvent> kafka;

public void sendOrder(OrderEvent event) {
    kafka.send("orders", event.getUserId().toString(), event);
}

// 消费者 + 事务
@KafkaListener(topics = "orders", groupId = "order-service")
public void handle(OrderEvent event) {
    // exactly-once 语义 + 死信队列 + 重试，Spring 全包
}
\`\`\`

Java Kafka 客户端是 Confluent 官方维护，功能最全：事务、幂等生产、Schema Registry、Streams API。

### Python Kafka 客户端

\`\`\`python
# confluent-kafka-python：基于 librdkafka，性能好
from confluent_kafka import Consumer, Producer

consumer = Consumer({
    "bootstrap.servers": "kafka:9092",
    "group.id": "order-service",
    "auto.offset.reset": "earliest",
    "enable.auto.commit": False,
})

consumer.subscribe(["orders"])
while True:
    msg = consumer.poll(1.0)
    if msg is None:
        continue
    if msg.error():
        print(f"error: {msg.error()}")
        continue
    event = json.loads(msg.value())
    process_order(event)
    consumer.commit(msg)  # 手动提交 offset
\`\`\`

Python 的 confluent-kafka 性能不错（基于 C 库 librdkafka），但缺少 Java 那种"事务 + Streams + Schema Registry"完整封装。

## 五、搜索引擎：Elasticsearch 客户端

### Java 客户端：原生

\`\`\`java
// Spring Data Elasticsearch：Repository 风格
public interface ArticleRepository extends ElasticsearchRepository<Article, String> {
    Page<Article> findByTitleContaining(String keyword, Pageable pageable);
}

// 复杂查询：Elasticsearch Java Client
SearchResponse<Article> response = client.search(s -> s
    .index("articles")
    .query(q -> q.bool(b -> b
        .must(m -> m.match(t -> t.field("title").query("Python")))
        .filter(f -> f.range(r -> r.field("date").gte(JsonData.of("2025-01-01"))))
    ))
    .highlight(h -> h.fields("title", f -> f)),
    Article.class
);
\`\`\`

### Python 客户端

\`\`\`python
from elasticsearch import Elasticsearch

es = Elasticsearch("http://es:9200")

response = es.search(
    index="articles",
    query={
        "bool": {
            "must": [{"match": {"title": "Python"}}],
            "filter": [{"range": {"date": {"gte": "2025-01-01"}}}],
        }
    },
    highlight={"fields": {"title": {}}},
)

for hit in response["hits"]["hits"]:
    print(hit["_source"]["title"], hit.get("highlight"))
\`\`\`

Python 客户端用 dict 构建查询，灵活但没有编译期检查；Java 客户端用 builder DSL，类型安全但啰嗦。

## 六、数据工程 ETL：Python 简单脚本 vs Java 大规模

### Python：Pandas 脚本（小数据）

\`\`\`python
import pandas as pd

# 简单 ETL：CSV → 清洗 → 写 Parquet
df = pd.read_csv("raw/users.csv")
df = df.dropna(subset=["email"])
df["signup_date"] = pd.to_datetime(df["signup_date"])
df["email_domain"] = df["email"].str.split("@").str[1]
df.to_parquet("processed/users.parquet")
\`\`\`

适合 GB 级以下数据——单机 Pandas 内存装得下就行。

### Java/Scala：Spark（大数据）

\`\`\`scala
// Spark：TB 级 ETL
val df = spark.read.json("s3://raw/events/")
val cleaned = df
  .filter(\$"email".isNotNull)
  .withColumn("signup_date", to_date(\$"signup_date"))
  .withColumn("email_domain", split(\$"email", "@").getItem(1))

cleaned.write.mode("overwrite").parquet("s3://processed/users/")
\`\`\`

适合 TB/PB 级数据——分布式跑在集群上。

## 七、大数据选型决策

\`\`\`
大数据选型决策树
┌──────────────────────────────────┐
│ 数据量级？                         │
└──────────────┬───────────────────┘
       ┌───────┴────────┐
       ▼                ▼
    < 10GB            > 100GB
    单机够用          需要分布式
       │                │
       ▼                ▼
    Python Pandas     Spark / Flink
    (简单脚本)        (Scala/Java/PySpark)
       │                │
       ▼                ▼
    快速开发           需要集群运维
    适合小公司         适合中大型公司
\`\`\`

| 场景 | 推荐 | 原因 |
|------|------|------|
| 单机小数据 ETL | Python + Pandas | 简单、灵活、迭代快 |
| TB+ 批处理 | Spark（Scala/PySpark） | 分布式成熟 |
| 实时流处理 | Flink（Java/Scala） | 流原生，PyFlink 较新 |
| 消息队列 | Kafka（Java 客户端） | 官方最成熟 |
| 搜索 | Elasticsearch（Java 客户端） | 原生 |
| ML 特征工程 | PySpark + Pandas UDF | 平衡开发效率与性能 |

## 八、为什么大数据引擎选 JVM 而不是 Python

1. **性能**：JVM JIT + 静态类型，比 CPython 快 10-100 倍
2. **GC 适合大数据**：分代 GC 处理大量临时对象比 Python 引用计数高效
3. **序列化**：Kryo/Protobuf 在 JVM 生态成熟
4. **多线程**：JVM 真正的多线程，Python GIL 限制并行
5. **网络层**：Netty（Java NIO 框架）是高性能网络基石
6. **历史**：Hadoop 2006 用 Java，整个生态路径依赖

## 九、一句话总结

**一句话总结**：大数据基础设施（Hadoop/Spark/Flink/Kafka）全是 JVM 写的，Java/Scala 是大数据原生语言；Python 通过 PySpark/PyFlink"借道"参与，小数据用 Pandas，大数据借 Spark，但引擎本体永远在 JVM。

---

> **下一章**：从"跑在哪"转向"怎么验证质量"——测试与工具链，pytest 的简洁 vs JUnit 的严谨。`,
  },
  {
    id: "pyvsjava-testing",
    icon: "🧪",
    title: "测试与工具链",
    group: "生态与工程",
    content: `# 测试与工具链

## 一、测试文化：Python 灵活 vs Java 严谨

测试是工程质量的基石。Python 和 Java 都有成熟的测试生态，但风格截然不同——Python 的 pytest 追求"极简与灵活"，Java 的 JUnit 追求"严谨与结构化"。

| 维度 | Python | Java |
|------|--------|------|
| 主流测试框架 | pytest（事实标准） | JUnit 5 |
| 备选框架 | unittest（标准库） | TestNG |
| 断言风格 | 原生 \`assert\` | \`assertEquals\` 等方法 |
| Mock | unittest.mock | Mockito |
| 参数化 | \`@pytest.mark.parametrize\` | \`@ParameterizedTest\` |
| 夹具 | pytest fixture | \`@BeforeEach\` / \`@BeforeAll\` |
| 覆盖率 | coverage.py | JaCoCo |
| 静态检查 | mypy/pylint/ruff | Checkstyle/SpotBugs/PMD |
| IDE | PyCharm | IntelliJ IDEA |

## 二、单元测试：pytest vs JUnit

### Python pytest：简洁到极致

\`\`\`python
# test_calculator.py
def add(a, b):
    return a + b

# 测试函数（不需要类）
def test_add():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    assert add(0, 0) == 0

def test_add_floats():
    assert add(0.1, 0.2) == pytest.approx(0.3)
\`\`\`

\`\`\`bash
pytest test_calculator.py -v
# pytest 自动发现 test_ 开头的函数/文件
\`\`\`

pytest 的核心优势：

1. **原生 assert**：\`assert x == y\` 失败时 pytest 自动展示差异，不需要 \`assertEquals\`
2. **不需要类**：测试可以是普通函数
3. **自动发现**：\`test_*.py\` 文件、\`test_*\` 函数自动被发现
4. **失败信息清晰**：

\`\`\`
>       assert add(1, 2) == 4
E       assert 3 == 4
\`\`\`

### Java JUnit 5：严谨结构化

\`\`\`java
// src/test/java/com/example/CalculatorTest.java
package com.example;

import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    @Test
    void add_should_return_sum() {
        Calculator calc = new Calculator();
        assertEquals(3, calc.add(1, 2));
        assertEquals(0, calc.add(-1, 1));
        assertEquals(0, calc.add(0, 0));
    }

    @Test
    void add_floats_should_handle_precision() {
        Calculator calc = new Calculator();
        assertEquals(0.3, calc.add(0.1, 0.2), 0.0001);
    }
}
\`\`\`

\`\`\`bash
mvn test   # 运行所有测试
\`\`\`

JUnit 5 的特点：

1. **必须用类**：测试方法必须在 \`@Test\` 注解的类里
2. **显式断言方法**：\`assertEquals\` / \`assertTrue\` / \`assertThrows\`
3. **注解驱动**：\`@Test\` / \`@DisplayName\` / \`@Disabled\`
4. **编译期检查**：类型不匹配编译就报错

\`\`\`java
// JUnit 5：异常断言
@Test
void divide_by_zero_throws() {
    Calculator calc = new Calculator();
    ArithmeticException ex = assertThrows(
        ArithmeticException.class,
        () -> calc.divide(1, 0)
    );
    assertEquals("除以零", ex.getMessage());
}
\`\`\`

### 断言风格对比

\`\`\`python
# Python：原生 assert，最自然
assert result == expected
assert "error" in response.text
assert user.is_active
assert len(items) == 3
\`\`\`

\`\`\`java
// Java：assertEquals / assertTrue 一堆方法
assertEquals(expected, result);
assertTrue(response.getText().contains("error"));
assertTrue(user.isActive());
assertEquals(3, items.size());
\`\`\`

pytest 的 \`assert\` 更像"自然语言"，但缺点是没有编译期检查（断言表达式写错运行时才发现）。JUnit 的 \`assertEquals\` 啰嗦但类型安全。

## 三、Mock：unittest.mock vs Mockito

### Python：unittest.mock

\`\`\`python
from unittest.mock import Mock, patch, MagicMock

def test_send_email():
    # 用 patch 替换真实 SMTP 客户端
    with patch("myapp.email.SMTPClient") as MockSMTP:
        instance = MockSMTP.return_value
        instance.send.return_value = True

        service = EmailService()
        result = service.send_welcome("user@example.com")

        assert result is True
        instance.send.assert_called_once_with(
            "user@example.com",
            "Welcome!",
            expect_body=True,
        )
\`\`\`

\`\`\`python
# pytest + pytest-mock：更简洁
def test_send_email(mocker):
    mock_smtp = mocker.patch("myapp.email.SMTPClient")
    mock_smtp.return_value.send.return_value = True

    service = EmailService()
    result = service.send_welcome("user@example.com")

    assert result is True
    mock_smtp.return_value.send.assert_called_once()
\`\`\`

### Java：Mockito

\`\`\`java
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    SMTPClient smtpClient;

    @InjectMocks
    EmailService service;

    @Test
    void send_welcome_should_call_smtp() {
        when(smtpClient.send(anyString(), anyString(), anyBoolean()))
            .thenReturn(true);

        boolean result = service.sendWelcome("user@example.com");

        assertTrue(result);
        verify(smtpClient, times(1)).send(
            eq("user@example.com"),
            eq("Welcome!"),
            eq(true)
        );
    }
}
\`\`\`

Mockito 用注解 \`@Mock\` / \`@InjectMocks\` 自动创建和注入 mock，比 Python 的 \`patch\` 更"声明式"。但 Python 的 \`patch\` 更灵活（能 patch 任意属性）。

## 四、参数化测试

### Python：@pytest.mark.parametrize

\`\`\`python
import pytest

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (-1, 1, 0),
    (0, 0, 0),
    (100, 200, 300),
    (0.1, 0.2, 0.3),
])
def test_add(a, b, expected):
    assert add(a, b) == pytest.approx(expected)
\`\`\`

pytest 会为每组参数生成一个独立测试用例，报告里清晰列出哪组失败。

### Java：@ParameterizedTest

\`\`\`java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;

class CalculatorTest {

    @ParameterizedTest
    @CsvSource({
        "1, 2, 3",
        "-1, 1, 0",
        "0, 0, 0",
        "100, 200, 300"
    })
    void add_should_return_sum(int a, int b, int expected) {
        assertEquals(expected, new Calculator().add(a, b));
    }

    @ParameterizedTest
    @MethodSource("addProvider")
    void add_from_method(int a, int b, int expected) {
        assertEquals(expected, new Calculator().add(a, b));
    }

    static Stream<Arguments> addProvider() {
        return Stream.of(
            arguments(1, 2, 3),
            arguments(-1, 1, 0)
        );
    }
}
\`\`\`

JUnit 5 参数化功能更丰富（\`@ValueSource\` / \`@EnumSource\` / \`@CsvSource\` / \`@MethodSource\`），但写起来比 pytest 啰嗦。

## 五、测试夹具：pytest fixture vs JUnit @BeforeEach

### pytest fixture：依赖注入式

\`\`\`python
import pytest
from sqlalchemy.orm import Session

@pytest.fixture
def db_session():
    """每个测试函数独立的事务会话，用完回滚"""
    session = Session(test_engine)
    session.begin()
    yield session  # yield 之前是 setup，之后是 teardown
    session.rollback()
    session.close()

@pytest.fixture
def sample_user(db_session):  # fixture 可以依赖其他 fixture
    user = User(name="test", email="test@example.com")
    db_session.add(user)
    db_session.flush()
    return user

def test_user_name(db_session, sample_user):
    user = db_session.query(User).get(sample_user.id)
    assert user.name == "test"

def test_user_count(db_session, sample_user):
    assert db_session.query(User).count() == 1
\`\`\`

pytest fixture 的精髓是**依赖注入**——fixture 可以依赖其他 fixture，pytest 自动按依赖图组装。\`scope\` 控制生命周期（function/module/session）：

\`\`\`python
@pytest.fixture(scope="session")
def app():
    return create_app()

@pytest.fixture(scope="module")
def client(app):
    return app.test_client()
\`\`\`

### JUnit：@BeforeEach / @BeforeAll

\`\`\`java
class UserRepositoryTest {

    private Session session;
    private UserRepository repo;

    @BeforeAll
    static void initDatabase() {
        // 整个测试类只执行一次
        Database.setup();
    }

    @BeforeEach
    void setUp() {
        // 每个测试方法前执行
        session = sessionFactory.openSession();
        session.beginTransaction();
        repo = new UserRepository(session);
    }

    @AfterEach
    void tearDown() {
        session.getTransaction().rollback();
        session.close();
    }

    @Test
    void find_by_id_returns_user() {
        repo.save(new User("test", "test@example.com"));
        User user = repo.findById(1L);
        assertNotNull(user);
        assertEquals("test", user.getName());
    }
}
\`\`\`

JUnit 的 \`@BeforeEach\` / \`@AfterEach\` 是"生命周期回调"，比 pytest fixture 简单但不够灵活——不能"依赖注入"，每个测试方法都用同样的 setup。

| 维度 | pytest fixture | JUnit @BeforeEach |
|------|----------------|-------------------|
| 依赖注入 | 支持（fixture 依赖 fixture） | 不支持 |
| 生命周期 | scope=function/module/session/class | @BeforeEach/@BeforeAll |
| 灵活性 | 极高 | 中 |
| 学习曲线 | 中（fixture 概念多） | 平缓 |

## 六、覆盖率：coverage.py vs JaCoCo

### Python：coverage.py + pytest-cov

\`\`\`bash
# 运行测试并收集覆盖率
pytest --cov=myapp --cov-report=html --cov-report=term-missing

# 生成 HTML 报告 → htmlcov/index.html
\`\`\`

\`\`\`ini
# .coveragerc 配置
[run]
source = myapp
omit = myapp/tests/*,myapp/migrations/*

[report]
exclude_lines =
    def __repr__
    raise NotImplementedError
    if __name__ == .__main__.:
\`\`\`

### Java：JaCoCo

\`\`\`xml
<!-- pom.xml 加 JaCoCo 插件 -->
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
    <execution>
      <id>check</id>
      <goals><goal>check</goal></goals>
      <configuration>
        <rules>
          <rule>
            <element>BUNDLE</element>
            <limits>
              <limit>
                <counter>LINE</counter>
                <value>COVEREDRATIO</value>
                <minimum>0.80</minimum>
              </limit>
            </limits>
          </rule>
        </rules>
      </configuration>
    </execution>
  </executions>
</plugin>
\`\`\`

\`\`\`bash
mvn clean verify   # 运行测试 + 生成报告 + 覆盖率检查
# 报告在 target/site/jacoco/index.html
\`\`\`

JaCoCo 还能生成字节码覆盖率（branch/instruction/line/class 多维度），比 coverage.py 的"行覆盖率"更精细。

## 七、静态检查：ruff 时代 vs Java 多工具

### Python：从 pylint 到 ruff

Python 静态检查工具历史上很多：

| 工具 | 用途 |
|------|------|
| mypy | 类型检查 |
| pylint | 代码规范 + bug 检测 |
| flake8 | 风格检查（PEP 8） |
| black | 自动格式化 |
| isort | import 排序 |
| bandit | 安全扫描 |
| **ruff** | 2023 年新王，Rust 写，一个工具替代 flake8/pylint/isort/bandit |

\`\`\`bash
# ruff：超快，一个工具搞定
ruff check .          # 替代 flake8 + pylint + isort
ruff format .         # 替代 black
ruff check --fix .    # 自动修复

# mypy：类型检查（ruff 不做类型检查）
mypy myapp/
\`\`\`

\`\`\`toml
# pyproject.toml 配置 ruff
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "UP", "SIM"]
ignore = ["E501"]
\`\`\`

### Java：Checkstyle + SpotBugs + PMD + Error Prone

\`\`\`xml
<!-- Maven 多插件组合 -->
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-checkstyle-plugin</artifactId>
  <configuration>
    <configLocation>checkstyle.xml</configLocation>
    <failOnViolation>true</failOnViolation>
  </configuration>
</plugin>

<plugin>
  <groupId>com.github.spotbugs</groupId>
  <artifactId>spotbugs-maven-plugin</artifactId>
  <configuration>
    <effort>Max</effort>
    <threshold>Low</threshold>
  </configuration>
</plugin>

<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-pmd-plugin</artifactId>
</plugin>
\`\`\`

| 工具 | 用途 |
|------|------|
| Checkstyle | 代码风格 |
| SpotBugs | bug 模式检测（基于字节码） |
| PMD | 代码规范 + 重复代码 |
| Error Prone | 编译期 bug 检测（Google 出品） |
| Spotless | 格式化（类似 black） |

Java 工具更多但更成熟——SpotBugs 能检测空指针、资源泄漏等真实 bug，比 pylint 的"风格警告"更有价值。

## 八、CI/CD：都支持主流平台

两者在 CI/CD 上没有本质差异——都支持 GitHub Actions / GitLab CI / Jenkins。

\`\`\`yaml
# GitHub Actions：Python
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install uv && uv pip install --system -e ".[dev]"
      - run: ruff check .
      - run: mypy myapp/
      - run: pytest --cov=myapp --cov-fail-under=80
\`\`\`

\`\`\`yaml
# GitHub Actions：Java
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: "21"
          distribution: "temurin"
      - uses: actions/cache@v4
        with:
          path: ~/.m2
          key: \${{ runner.os }}-m2-\${{ hashFiles('**/pom.xml') }}
      - run: mvn -B verify
\`\`\`

## 九、IDE：PyCharm vs IntelliJ IDEA

PyCharm 和 IntelliJ IDEA 都是 JetBrains 出品，体验高度一致：

| 维度 | PyCharm | IntelliJ IDEA |
|------|---------|---------------|
| 公司 | JetBrains | JetBrains |
| 类型检查 | mypy 集成 | 编译器级 |
| 重构 | 中（动态类型限制） | 强（静态类型优势） |
| 调试 | 强 | 强 |
| 跳转 | 中（有时不准） | 精确 |
| 启动速度 | 快 | 慢 |

静态类型语言在 IDE 重构、跳转、智能提示上有天然优势——这是 Java 开发体验的核心红利之一。

## 十、一句话总结

**一句话总结**：pytest 的"原生 assert + fixture 依赖注入"是 Python 测试的精华，JUnit 5 的严谨结构化更适合大型团队——但 ruff 的崛起让 Python 的静态检查工具链终于"统一且极速"，追平甚至超越了 Java 的多工具组合。

---

> **下一章**：测试保证质量，部署交付价值——最后一章看 Python 和 Java 的部署与运维，Serverless 时代的冷启动之战。`,
  },
  {
    id: "pyvsjava-deploy",
    icon: "🚀",
    title: "部署与运维",
    group: "生态与工程",
    content: `# 部署与运维

## 一、打包部署：wheel/jar 的差异

### Python：wheel + 源码部署

Python 的部署产物主要是 wheel（\`.whl\`）或直接源码：

\`\`\`bash
# 打包
python -m build
# 产物：dist/my_app-0.1.0-py3-none-any.whl

# 部署：在目标机器
pip install my_app-0.1.0-py3-none-any.whl
# 或源码部署
pip install -e .

# 启动（以 FastAPI 为例）
uvicorn myapp.main:app --host 0.0.0.0 --port 8000 --workers 4
\`\`\`

问题：目标机器必须有兼容的 Python 解释器 + 编译工具链（C 扩展包）。这就是为什么 Python 在容器化之前部署痛苦——"在我机器上能跑"是经典梗。

### Java：fat jar 一把梭

Java 的部署产物是 jar，Spring Boot 默认打 fat jar（所有依赖打进去）：

\`\`\`bash
# 打包
mvn clean package
# 产物：target/my-app-0.1.0.jar（含所有依赖）

# 部署：在目标机器
java -jar my-app-0.1.0.jar --server.port=8080

# 后台运行
nohup java -jar my-app-0.1.0.jar > app.log 2>&1 &
\`\`\`

Java 部署的核心优势：**目标机器只需要 JRE**，一个 fat jar 自包含所有依赖，\`java -jar\` 直接跑。这是 Java 在容器化之前最大的部署优势。

| 维度 | Python | Java |
|------|--------|------|
| 部署产物 | wheel / 源码 | jar / fat jar / war |
| 运行时依赖 | Python 解释器 + 编译链 | JRE |
| 自包含 | 否（需 pip install 依赖） | 是（fat jar） |
| 启动命令 | uvicorn/gunicorn | java -jar |
| 传统容器 | Tomcat/WildFly（Java EE） | gunicorn/uwsgi |

## 二、容器化：Docker 两者都支持

容器化抹平了 Python 的"环境依赖"痛点——把 Python 解释器 + 依赖都打进镜像：

### Python Dockerfile

\`\`\`dockerfile
# Python Dockerfile
FROM python:3.12-slim AS builder

WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv pip install --system --no-cache .

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

EXPOSE 8000
CMD ["uvicorn", "myapp.main:app", "--host", "0.0.0.0", "--port", "8000"]
\`\`\`

### Java Dockerfile

\`\`\`dockerfile
# Java Dockerfile（多阶段构建）
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/my-app-0.1.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
\`\`\`

### 镜像大小对比

| 镜像 | 大小（大致） |
|------|-------------|
| python:3.12-slim | ~150MB |
| python:3.12 (完整) | ~1GB |
| eclipse-temurin:21-jre-alpine | ~80MB |
| eclipse-temurin:21-jdk | ~400MB |

Java 用 alpine + JRE 镜像可以做到比 Python slim 还小——这反直觉但真实（JRE 比完整 Python 解释器小）。

## 三、启动速度：Python 快冷启动 vs Java 慢预热

这是 Serverless 时代的关键差异。

### Python：冷启动快

\`\`\`bash
# FastAPI 冷启动
time uvicorn myapp.main:app --port 8000 &
# ~0.3-1 秒就能响应第一个请求
\`\`\`

Python 解释器启动 + 加载模块 + 初始化应用，通常 1 秒内完成。

### Java：JVM 预热慢

\`\`\`bash
# Spring Boot 冷启动
time java -jar app.jar &
# ~5-15 秒才能响应第一个请求
\`\`\`

Java 启动慢的原因：

1. **JVM 启动**：加载 JVM 本身 + 类加载
2. **Spring 容器初始化**：扫描 Bean、自动配置、依赖注入
3. **JIT 预热**：解释执行 → C1 编译 → C2 编译，前几千个请求慢
4. **连接池预热**：数据库连接、HTTP 客户端池

\`\`\`
启动时间对比（典型 Spring Boot vs FastAPI）
┌────────────────────────────────────────┐
│ FastAPI    ██ ~0.5s                    │
│ Flask      ██ ~0.3s                    │
│ Django     ███ ~1.5s                   │
│ Spring Boot ███████████████ ~8s        │
│ Quarkus(JVM) █████ ~2s                 │
│ Quarkus(Native) █ ~0.05s              │
└────────────────────────────────────────┘
\`\`\`

## 四、Serverless：Python 友好 vs Java 痛点

### Python：AWS Lambda 友好

\`\`\`python
# AWS Lambda handler（Python）
import json
from myapp.service import process_event

def lambda_handler(event, context):
    result = process_event(event)
    return {
        "statusCode": 200,
        "body": json.dumps(result),
    }
\`\`\`

Python Lambda 冷启动通常 200-500ms，适合事件驱动场景。

### Java：冷启动痛点

\`\`\`java
// AWS Lambda handler（Java）
public class OrderHandler implements RequestHandler<Map<String, Object>, String> {
    private final OrderService service = new OrderService();

    @Override
    public String handleRequest(Map<String, Object> input, Context context) {
        return service.process(input).toJson();
    }
}
\`\`\`

Java Lambda 冷启动 3-10 秒（JVM + Spring 上下文），用户体验糟糕。SnapStart（AWS 2022 推出）通过 CRaC 快照把冷启动降到 ~200ms，但需要额外配置。

### GraalVM Native Image：Java 的反击

GraalVM Native Image 把 Java 应用 AOT 编译成原生可执行文件，启动时间从秒级降到毫秒级：

\`\`\`bash
# Spring Boot + GraalVM Native Image
mvn -Pnative package
# 产物：target/my-app（原生可执行文件，~80MB）

./target/my-app
# 启动 ~0.05 秒！接近 Python
\`\`\`

代价：

1. **构建时间长**：AOT 编译要几分钟
2. **反射受限**：需要显式配置 reflect-config.json（Spring AOT 插件自动生成）
3. **镜像不可移植**：必须和目标平台一致（Linux x86/ARM 分别构建）
4. **峰值性能降**：没有 JIT 的运行时优化，长时间运行不如 JVM 模式

Quarkus / Micronaut / Spring Boot 3 都原生支持 Native Image，是 Java 在 Serverless 领域的关键武器。

\`\`\`
启动时间 + 内存占用对比（Spring Boot）
┌──────────────────────────────────────────────────┐
│                  启动时间        内存（RSS）      │
│ JVM 模式         ~8s             ~500MB          │
│ Native Image     ~0.05s          ~80MB           │
│ Python FastAPI   ~0.5s           ~120MB          │
└──────────────────────────────────────────────────┘
\`\`\`

Native Image 让 Java 在 Serverless 场景重新有了竞争力——启动比 Python 还快，内存占用更低。

## 五、性能监控与 Profiling

### Python：cProfile + py-spy

\`\`\`bash
# cProfile：标准库，函数级
python -m cProfile -o profile.out myapp.py
python -c "import pstats; pstats.Stats('profile.out').sort_stats('cumulative').print_stats(20)"

# py-spy：采样 profiler，无需改代码，能 attach 到运行进程
py-spy top --pid 12345          # 实时火焰图
py-spy record --pid 12345 -o profile.svg  # 生成火焰图

# memray：内存 profiler
python -m memray run myapp.py
python -m memray flamegraph myapp.py.bin
\`\`\`

py-spy 用 Rust 写，性能开销极低，是 Python 生产环境 profiling 的首选。

### Java：JFR + async-profiler + Arthas

Java 的 profiling 工具极其成熟：

\`\`\`bash
# JFR（Java Flight Recorder）：JVM 内置，生产可用
java -XX:StartFlightRecording=duration=60s,filename=app.jfr -jar app.jar
# 用 JDK Mission Control 分析 app.jfr

# async-profiler：低开销采样 profiler
./profiler.sh -d 60 -f flame.html 12345

# Arthas（阿里开源）：在线诊断神器
java -jar arthas-boot.jar
# attach 到运行中的 JVM，可以：
#   - 查看方法调用耗时
#   - 动态修改日志级别
#   - 反编译类查看实际加载的代码
#   - 监控方法异常
\`\`\`

\`\`\`
# Arthas 在线诊断示例
[arthas@12345]$ watch com.example.OrderService createOrder returnObj
# 实时观察 createOrder 方法的返回值，无需重启应用
\`\`\`

Arthas 是 Java 运维的"瑞士军刀"——线上不重启就能诊断问题，Python 没有对标（py-spy 只能看 CPU 火焰图，不能动态观测方法调用）。

| 维度 | Python | Java |
|------|--------|------|
| CPU profiler | cProfile / py-spy | JFR / async-profiler |
| 内存 profiler | memray / tracemalloc | JFR / jmap / MAT |
| 在线诊断 | 无（要重启） | Arthas（不重启） |
| 火焰图 | py-spy | async-profiler |
| 生产开销 | 低（py-spy 采样） | 极低（JFR 生产可用） |

## 六、内存占用

| 运行时 | 空载内存 | 典型 Web 服务 |
|--------|----------|---------------|
| CPython（FastAPI） | ~30MB | ~100-200MB |
| JVM（Spring Boot） | ~80MB | ~500MB-1GB |
| JVM Native Image | ~20MB | ~80-150MB |
| Node.js | ~30MB | ~100-200MB |

Java 内存占用比 Python 大——JVM 本身 + 元空间 + 线程栈 + GC 分代区域。但 Native Image 把这个差距抹平了。

\`\`\`
内存占用对比（同样一个 Hello World Web 服务）
┌──────────────────────────────────────┐
│ Python FastAPI    ██ ~120MB          │
│ Node Express      ██ ~110MB          │
│ Go Gin            █ ~30MB            │
│ Spring Boot JVM   ████████ ~550MB    │
│ Spring Boot Native ██ ~90MB          │
└──────────────────────────────────────┘
\`\`\`

## 七、传统部署：容器之前的战争

### Java：Tomcat / WildFly（Servlet 容器）

\`\`\`bash
# 传统 Java Web 部署：打 war 包扔进 Tomcat
mvn clean package
# 产物：target/my-app.war

# Tomcat 部署
cp target/my-app.war $CATALINA_HOME/webapps/
# Tomcat 自动解压并启动

# 或用 WildFly（Java EE 全功能）
./standalone.sh
\`\`\`

Spring Boot 之后这种"war 扔 Tomcat"模式逐渐被"fat jar 自带 Tomcat"取代——Spring Boot 内嵌 Tomcat，\`java -jar\` 就能跑。

### Python：gunicorn / uwsgi（WSGI 服务器）

\`\`\`bash
# gunicorn：Unix 下 Python Web 服务标准
gunicorn myapp.wsgi:application --workers 4 --bind 0.0.0.0:8000

# uvicorn：ASGI（异步）
uvicorn myapp.main:app --workers 4 --host 0.0.0.0 --port 8000

# uwsgi：功能更全（但配置复杂）
uwsgi --http :8000 --wsgi-file myapp/wsgi.py --processes 4
\`\`\`

gunicorn 的 worker 模型是"多进程"——一个 master + N 个 worker（每个 worker 一个 Python 进程），靠多进程绕开 GIL。Java 用线程池（Tomcat 默认 200 线程）。

\`\`\`
传统 Web 服务器架构对比
┌──────────────────────────────────────────┐
│ Java Tomcat                               │
│  ┌─────────────┐                          │
│  │ Tomcat 进程  │                          │
│  │  ├ 线程池 200│ ← 每个请求一个线程       │
│  │  └ Servlet   │                          │
│  └─────────────┘                          │
│                                           │
│ Python gunicorn                           │
│  ┌─────────────┐                          │
│  │ Master 进程  │ ← 管理 worker            │
│  └──────┬──────┘                          │
│    ┌────┼────┬────────┐                   │
│    ▼    ▼    ▼        ▼                   │
│  [W1] [W2] [W3]     [W4]  ← 每个 worker    │
│   进程  进程  进程    进程   独立 Python 进程│
└──────────────────────────────────────────┘
\`\`\`

## 八、现代部署：容器编排 + K8s

容器化时代两者殊途同归——都打成 Docker 镜像扔 K8s：

\`\`\`yaml
# Kubernetes Deployment（Python 和 Java 通用）
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-registry/my-app:0.1.0
        ports:
        - containerPort: 8080
        resources:
          requests: { cpu: "100m", memory: "256Mi" }
          limits: { cpu: "500m", memory: "512Mi" }
        readinessProbe:
          httpGet: { path: /health, port: 8080 }
          initialDelaySeconds: 5
        livenessProbe:
          httpGet: { path: /health, port: 8080 }
          initialDelaySeconds: 30
\`\`\`

K8s 层面 Python 和 Java 没差异——都是容器。但 Java 的"启动慢"在 K8s 里是真实痛点：

- **readinessProbe 失败**：Java 8 秒启动，但 K8s 5 秒就探活，导致 Pod 被重启
- **滚动更新慢**：Java Pod 启动慢，滚动更新耗时长
- **HPA 扩容滞后**：流量突增时 Java Pod 还在预热，扩容来不及

所以 Java 在 K8s 里要调高 \`initialDelaySeconds\` 或用 Native Image。

## 九、部署命令速查

### Python 部署命令

\`\`\`bash
# 虚拟环境 + 安装
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# gunicorn（生产）
gunicorn myapp.wsgi:application \\
  --workers 4 \\
  --bind 0.0.0.0:8000 \\
  --access-logfile - \\
  --error-logfile -

# uvicorn + uvicorn worker（异步）
uvicorn myapp.main:app \\
  --host 0.0.0.0 --port 8000 \\
  --workers 4 \\
  --loop uvloop \\
  --http httptools

# Docker
docker build -t my-app .
docker run -p 8000:8000 my-app
\`\`\`

### Java 部署命令

\`\`\`bash
# 编译打包
mvn clean package -DskipTests

# 直接运行
java -jar target/my-app-0.1.0.jar \\
  --server.port=8080 \\
  --spring.profiles.active=prod \\
  -Xmx512m -Xms256m

# Native Image
mvn -Pnative package
./target/my-app

# Docker
docker build -t my-app .
docker run -p 8080:8080 my-app
\`\`\`

## 十、一句话总结

**一句话总结**：传统部署 Java 的 fat jar 比 Python wheel 更自包含，但 Serverless 时代 Python 的快冷启动是优势；GraalVM Native Image 让 Java 启动反超 Python，Arthas 让 Java 在线诊断无对手——部署运维领域，Native Image 是 Java 在云原生时代的"二次青春"。

---

> **本批 7 章（第 28-34 章）到此结束。生态与工程篇完整呈现了 Python 与 Java 在包管理、Web 框架、企业架构、数据 AI、大数据、测试工具链、部署运维七个维度的深度对比。两门语言各有所长，选择取决于场景——下一批将进入更深入的实战与展望。**`,
  },
];
