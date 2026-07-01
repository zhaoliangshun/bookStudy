// =============================================================
// Java Web 应用开发实战教程 —— 第五批章节（Maven 与构建工具，共 4 章）
// -------------------------------------------------------------
// 本文件包含以下章节：
//   jw-17 — Maven 基础与 pom.xml
//   jw-18 — 依赖管理与生命周期
//   jw-19 — 多模块项目
//   jw-20 — Gradle 入门
//
// 转义约定：content 为反引号模板字符串，内部所有反引号已转义为 \`，
//          三反引号已转义为 \`\`\`，${ 序列已转义为 \${。
// =============================================================

export const chapters = [
  // =========================================================
  // jw-17：Maven 基础与 pom.xml
  // =========================================================
  {
    id: "jw-17",
    group: "Maven 与构建工具",
    icon: "📦",
    title: "Maven 基础与 pom.xml",
    content: `# Maven 基础与 pom.xml

## 概念讲解

### Maven 是什么

**Maven** 是 Apache 基金会下的一款**项目构建与管理工具**，由 **Jason van Zyl** 于 2002 年发起，名字来自意第绪语，意为"知识的积累者"。在 Maven 出现之前，Java 项目的构建主要依赖 **Ant**——一个过程式、用 XML 写构建脚本的工具。Ant 灵活但没有约定，每个项目的目录结构、依赖位置、构建脚本都不一样，新人接手项目要先研究半天 \\\`build.xml\\\`。Maven 的核心贡献在于它**用约定取代配置**（Convention over Configuration），把"项目应该长什么样"这件事标准化了。

Maven 不仅是构建工具，它更是一个围绕 **POM（Project Object Model，项目对象模型）** 的**项目管理平台**。它能做四件事：

1. **构建**：编译、测试、打包、部署，一条命令搞定全流程。
2. **依赖管理**：声明项目用到的第三方库，Maven 自动去仓库下载并解决传递依赖。
3. **项目信息管理**：自动生成项目站点、Javadoc、依赖树、变更日志等文档。
4. **标准化**：所有 Maven 项目目录结构一致、构建命令一致，降低上手成本。

### POM 与项目对象模型

POM 是 Maven 的核心概念。每个 Maven 项目根目录下都有一个 \\\`pom.xml\\\` 文件，它是该项目的"身份证 + 说明书"。POM 用 XML 描述项目的基本信息、依赖、插件、构建配置等。Maven 读取这个 XML 后，在内存中构建出一棵 **项目对象模型树**，后续所有构建操作都基于这棵树进行。

POM 的一个关键特性是**继承**：子模块的 pom.xml 可以继承父 pom 的配置（依赖、插件、版本号等），避免重复声明。Maven 还有一个**超级 POM（Super POM）**，是所有 POM 的隐式祖先，内置了所有默认约定（如目录结构、默认插件绑定）。

### Maven 坐标（Coordinates）

Maven 世界里，每个构件（artifact，可以是一个 jar、一个 war、一个 pom）都用一组**坐标**唯一标识。坐标由三个核心字段加一个可选字段组成：

| 字段 | 含义 | 例子 |
| --- | --- | --- |
| \\\`groupId\\\` | 组织/公司/项目组的反向域名 | \\\`org.springframework\\\` |
| \\\`artifactId\\\` | 项目/模块名 | \\\`spring-core\\\` |
| \\\`version\\\` | 版本号 | \\\`5.3.30\\\` |
| \\\`packaging\\\` | 打包类型（可选，默认 jar） | \\\`jar\\\` / \\\`war\\\` / \\\`pom\\\` |

写在一起就是 \\\`groupId:artifactId:version\\\`，例如 \\\`org.springframework:spring-core:5.3.30\\\`。这个三元组在 Maven 仓库中对应一个唯一的文件路径，是依赖查找的"门牌号"。

### 仓库（Repository）

Maven 的所有构件都存放在**仓库**里。仓库分三类：

1. **本地仓库（Local Repository）**：本机磁盘上的缓存目录，默认在 \\\`~/.m2/repository\\\`。第一次下载的依赖会缓存在这里，下次再用就直接读本地，不再联网。
2. **中央仓库（Central Repository）**：Maven 社区维护的公共仓库，地址 \\\`https://repo1.maven.org/maven2/\\\`，包含绝大多数开源库。本地仓库找不到时去这里拉取。
3. **私服（Private Repository / Nexus）**：公司内部搭建的仓库代理，常用 **Sonatype Nexus** 或 **JFrog Artifactory**。私服同时充当缓存代理（代理中央仓库）和内部发布平台（存放公司内部 jar），是团队协作的标配。

查找顺序：**本地 → 私服 → 中央**。这种分层设计既保证速度（本地命中最快），又支持团队共享（私服缓存一次全公司复用），还能放私有 jar。

### 标准目录结构

Maven 强制约定了项目的目录结构，这是"约定优于配置"的体现：

\\\`\\\`\\\`
my-app/
├── pom.xml                  # 项目对象模型
├── src/
│   ├── main/
│   │   ├── java/            # 主源代码（生产代码）
│   │   ├── resources/       # 主资源文件（配置文件、properties 等）
│   │   └── webapp/          # Web 应用目录（war 包专用，放 WEB-INF/web.xml）
│   └── test/
│       ├── java/            # 测试源代码
│       └── resources/       # 测试资源文件
└── target/                  # 构建输出（编译后的 class、打好的 jar/war）
\\\`\\\`\\\`

这个结构不是建议，是**强制约定**。Maven 编译时只会去 \\\`src/main/java\\\` 找源码，测试时只去 \\\`src/test/java\\\` 找测试。如果你把代码放在别的目录，Maven 看不见。这种"约束"换来了"零配置"——不用告诉 Maven 源码在哪，它本来就知道。

## 设计原则

### 1. 约定优于配置（Convention over Configuration）

Maven 最根本的设计哲学。传统 Ant 需要你显式告诉它源码目录、输出目录、依赖路径；Maven 预先定义了一套合理的默认约定，你只要按约定摆放文件，就什么都不用配。配置只在"偏离约定"时才需要。这降低了 90% 的配置工作量，也让项目之间高度一致。

### 2. 声明式优于过程式

Ant 的 \\\`build.xml\\\` 是过程式的——你写"先编译、再拷贝、再打包"的步骤。Maven 的 \\\`pom.xml\\\` 是**声明式**的——你只声明"我要什么"（依赖什么库、打成什么包），具体怎么编译、怎么打包由内置的**生命周期**和**插件绑定**自动完成。声明式的好处是：配置简单、可复用、不依赖执行顺序。

### 3. 单一事实来源（Single Source of Truth）

每个项目的元信息（版本、依赖、构建方式）只在 \\\`pom.xml\\\` 里声明一次。版本号不散落在各处脚本里，依赖不重复下载到 libs 目录。改版本只改一处，改依赖只改一处。配合 \\\`dependencyManagement\\\` 和父 pom，整个公司多模块项目的版本可以集中管控。

### 4. 复用与可重现构建

只要把 \\\`pom.xml\\\` 和 \\\`src/\\\` 提交到 Git，任何人 clone 后执行 \\\`mvn package\\\` 都能得到一模一样的产物。依赖从仓库按坐标拉取，版本固定，不依赖本机已有的 jar。这就是"可重现构建"——构建结果只受源码和 pom 控制，不受机器环境影响。

## 使用场景

### 场景一：从零创建一个 Java 项目

用 Maven 的 archetype（原型）插件快速生成项目骨架：

\\\`\\\`\\\`bash
mvn archetype:generate \\
  -DgroupId=com.example \\
  -DartifactId=my-app \\
  -DarchetypeArtifactId=maven-archetype-quickstart \\
  -DarchetypeVersion=1.4 \\
  -DinteractiveMode=false
\\\`\\\`\\\`

执行后会在当前目录生成 \\\`my-app/\\\` 项目，含标准目录结构和一个示例 \\\`App.java\\\`。这是新项目最快的起手式。

### 场景二：编译并打包项目

\\\`\\\`\\\`bash
mvn clean package
\\\`\\\`\\\`

\\\`clean\\\` 清理 \\\`target/\\\` 目录，\\\`package\\\` 执行编译、测试、打包，最终在 \\\`target/\\\` 下生成 \\\`my-app-1.0.jar\\\`。

### 场景三：Web 应用项目

Web 项目打包类型是 \\\`war\\\`，多一个 \\\`src/main/webapp\\\` 目录放 \\\`WEB-INF/web.xml\\\` 和静态资源。打出的 war 包直接丢进 Tomcat 的 \\\`webapps/\\\` 即可运行。

### 场景四：团队私服管理内部 jar

公司开发的公共工具包想给所有项目复用，不能传到中央仓库（那是开源公共仓库）。这时搭建 Nexus 私服，执行 \\\`mvn deploy\\\` 把内部 jar 发布到私服的 release 仓库，其他项目在 pom 里加私服地址即可依赖。

## 代码逐行讲解

### 一个完整的 pom.xml

\\\`\\\`\\\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- project 是根元素，xmlns 声明 Maven POM 的命名空间 -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- POM 模型版本，Maven 3 固定是 4.0.0 -->
    <modelVersion>4.0.0</modelVersion>

    <!-- 项目坐标：三元组唯一标识本项目 -->
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!-- 打包类型：jar(默认)/war/pom/ear/maven-plugin -->
    <packaging>jar</packaging>

    <!-- 项目元信息（非构建必需，但建议填写） -->
    <name>My Application</name>
    <description>一个示例 Maven 项目</description>

    <!-- 属性定义：可在下方用 \${属性名} 引用，集中管理版本号 -->
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>5.10.0</junit.version>
    </properties>

    <!-- 依赖列表：每个 dependency 是一个第三方库 -->
    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <!-- 构建配置 -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>\${maven.compiler.source}</source>
                    <target>\${maven.compiler.target}</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
\\\`\\\`\\\`

**逐行解释**：

- \\\`<project>\\\`：根元素。\\\`xmlns\\\` 声明命名空间，避免 XML 标签冲突；\\\`xsi:schemaLocation\\\` 指向 XSD 校验文件，让 IDE 能做标签补全和校验。
- \\\`<modelVersion>4.0.0</modelVersion>\\\`：POM 模型版本号，Maven 2/3 都是 4.0.0，Maven 4 才会升到 4.1.0。这行照抄即可。
- \\\`<groupId>com.example</groupId>\\\`：组织标识，习惯用反向域名，全局唯一。
- \\\`<artifactId>my-app</artifactId>\\\`：项目名，在同一 groupId 下唯一。
- \\\`<version>1.0-SNAPSHOT</version>\\\`：版本号。\\\`-SNAPSHOT\\\` 后缀表示"快照版"，开发中随时会变；不带后缀（如 \\\`1.0\\\`）是"发布版"，发布后不应再修改。
- \\\`<packaging>jar</packaging>\\\`：打包类型。jar 是普通 Java 库；war 是 Web 应用；pom 表示这是个父项目（本身不产 jar，只管理子模块）。不写时默认 jar。
- \\\`<properties>\\\`：自定义属性。\\\`maven.compiler.source/target\\\` 指定编译用的 JDK 版本；\\\`project.build.sourceEncoding\\\` 指定源码编码（避免中文乱码）。定义的属性可在下方用 \\\`\\\${属性名}\\\` 引用，方便统一改版本。
- \\\`<dependencies>\\\`：依赖列表。每个 \\\`<dependency>\\\` 声明一个第三方库，Maven 会自动去仓库下载。\\\`<scope>test</scope>\\\` 表示该依赖只在测试时用，不会打进最终 jar。
- \\\`<build><plugins>\\\`：插件配置。\\\`maven-compiler-plugin\\\` 控制编译行为，\\\`<source>/<target>\\\` 指定编译和运行的 JDK 字节码版本。

### 验证安装

\\\`\\\`\\\`bash
mvn -v
\\\`\\\`\\\`

输出类似：

\\\`\\\`\\\`
Apache Maven 3.9.5
Maven home: /usr/share/maven
Java version: 17.0.8, vendor: Oracle Corporation
\\\`\\\`\\\`

## 对比（表格形式）

### Maven vs Ant vs Gradle

| 维度 | Ant | Maven | Gradle |
| --- | --- | --- | --- |
| 配置文件 | build.xml（过程式） | pom.xml（声明式 XML） | build.gradle（声明式 Groovy/Kotlin） |
| 设计哲学 | 过程式，灵活无约定 | 约定优于配置 | 约定 + 灵活 |
| 依赖管理 | 手动下载 jar 放 libs | 内置，自动解析 | 内置，自动解析 |
| 目录结构 | 无约定，自由 | 强制标准结构 | 标准结构（可改） |
| 构建脚本可读性 | 步骤清晰但冗长 | XML 啰嗦但规范 | 简洁，编程能力强 |
| 性能 | 一般 | 一般（每次全量） | 快（增量构建） |
| 学习曲线 | 低 | 中（要懂生命周期） | 中高（要懂 Groovy） |
| 适用场景 | 老项目、复杂自定义流程 | 标准项目、企业级 | Android、追求性能的项目 |

### 仓库类型对比

| 仓库类型 | 位置 | 作用 | 谁维护 |
| --- | --- | --- | --- |
| 本地仓库 | \\\`~/.m2/repository\\\` | 缓存已下载依赖，避免重复联网 | 开发者本机 |
| 中央仓库 | \\\`repo1.maven.org\\\` | 公共开源库总汇 | Maven 社区 |
| 私服 Nexus | 公司内网 | 代理中央 + 存内部 jar | 公司运维 |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| SNAPSHOT 当发布版用 | SNAPSHOT 会被远程覆盖，构建不可重现 | 生产用 release 版本号，去掉 -SNAPSHOT |
| 直接改本地仓库的 jar | 下次构建被远程覆盖，改动丢失 | 改源码重新 install，不要手改缓存 |
| 依赖下载失败报红 | 网络问题或中央仓库慢 | 配阿里云镜像 \\\`<mirror>\\\`，或挂 VPN |
| 版本号硬编码到处写 | 改版本要改几十处，易漏 | 用 \\\`<properties>\\\` 集中定义，\\\${version}\\\` 引用 |
| 把源码放在非标准目录 | Maven 找不到源码，编译为空 | 严格遵守 \\\`src/main/java\\\` 结构 |
| packaging 写错 | 想打 war 却写成 jar，部署失败 | Web 项目写 \\\`<packaging>war</packaging>\\\` |
| 不写 sourceEncoding | 中文注释编译报错"unmappable character" | 加 \\\`<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\\\` |
`,
  },

  // =========================================================
  // jw-18：依赖管理与生命周期
  // =========================================================
  {
    id: "jw-18",
    group: "Maven 与构建工具",
    icon: "📦",
    title: "依赖管理与生命周期",
    content: `# 依赖管理与生命周期

## 概念讲解

### 依赖声明

在 Maven 中声明一个依赖非常简单，只要在 \\\`pom.xml\\\` 的 \\\`<dependencies>\\\` 下加一个 \\\`<dependency>\\\` 块：

\\\`\\\`\\\`xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>5.3.30</version>
</dependency>
\\\`\\\`\\\`

这三个坐标（groupId/artifactId/version）唯一定位一个构件。Maven 会自动从仓库下载该 jar，并放进本地仓库缓存。**重点**：你只声明"我要什么"，Maven 负责"去哪找、怎么下"。

### 依赖范围（Scope）

依赖范围决定一个依赖**在什么阶段可用、是否打进最终包**。这是 Maven 依赖管理最容易被忽视却又最关键的特性。共有 6 种 scope：

| scope | 编译期 | 测试期 | 运行期 | 打进包 | 典型场景 |
| --- | --- | --- | --- | --- | --- |
| \\\`compile\\\`（默认） | ✅ | ✅ | ✅ | ✅ | 普通业务依赖 |
| \\\`test\\\` | ❌ | ✅ | ❌ | ❌ | JUnit、Mockito |
| \\\`provided\\\` | ✅ | ✅ | ❌ | ❌ | Servlet API（容器已有） |
| \\\`runtime\\\` | ❌ | ✅ | ✅ | ✅ | JDBC 驱动（运行时反射加载） |
| \\\`system\\\` | ✅ | ✅ | ❌ | ❌ | 本地 jar（不推荐，不可移植） |
| \\\`import\\\` | — | — | — | — | 导入 BOM（仅 dependencyManagement 中） |

理解 scope 的意义：

- **\\\`test\\\`** 让测试框架不污染生产包，避免把 JUnit 打进线上 jar。
- **\\\`provided\\\`** 用于"运行环境已提供"的库。比如 Servlet API，Tomcat 自带，如果再打一遍进 war 会和容器的版本冲突（这就是经典的 \\\`jar hell\\\`）。
- **\\\`runtime\\\`** 用于编译期不需要、运行期需要的库。典型是 JDBC 驱动——你代码里写 \\\`DriverManager.getConnection()\\\`，用的是 JDK 的接口，但运行时需要具体驱动的实现类（通过反射加载）。

### 传递依赖（Transitive Dependency）

这是 Maven 最省心的特性。你依赖 \\\`A\\\`，而 \\\`A\\\` 又依赖 \\\`B\\\`，那么 \\\`B\\\` 会**自动**成为你的依赖，无需在 pom 里再声明。比如依赖 \\\`spring-web\\\`，它会自动把 \\\`spring-core\\\`、\\\`spring-beans\\\` 拉进来。

传递依赖的规则：scope 会**降级传播**。假设 \\\`A (compile) → B (compile)\\\`，那么 B 对你也是 compile。但如果 \\\`A (compile) → B (runtime)\\\`，那么 B 对你降级为 runtime。具体规则见下表：

| 直接依赖 \\ 传递依赖 | compile | test | provided | runtime |
| --- | --- | --- | --- | --- |
| compile | compile | - | - | runtime |
| test | test | test | - | test |
| provided | provided | - | provided | runtime |
| runtime | runtime | - | - | runtime |

### 依赖冲突解决

传递依赖带来一个新问题：**冲突**。你依赖 A 和 C，A 依赖 B:1.0，C 依赖 B:2.0，最终用哪个版本？Maven 用两条规则：

1. **最短路径优先**：Maven 构建依赖树，选择离根最近的版本。比如 \\\`你→A→B:1.0\\\`（路径长 2）和 \\\`你→C→B:2.0\\\`（路径长 2）一样长时，看规则 2。但如果是 \\\`你→B:3.0\\\`（路径长 1），则直接用 3.0，因为它最近。
2. **声明优先**：当路径长度相同时，pom 里**先声明**的那个依赖胜出。即 \\\`<dependency>\\\` 的书写顺序决定胜负。

这个机制看似合理，实则坑很多——因为编译期用的版本和运行时实际加载的 jar 可能不一致，导致 \\\`NoSuchMethodError\\\`、\\\`ClassNotFoundException\\\`。排查工具是 \\\`mvn dependency:tree\\\`，它打印完整依赖树，标出冲突点。

### 排除依赖（Exclusions）

有时某个传递依赖有 bug 或不想要（比如引入了 \\\`commons-logging\\\` 而你想用 \\\`slf4j\\\`），可以用 \\\`<exclusions>\\\` 排除：

\\\`\\\`\\\`xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>5.3.30</version>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
\\\`\\\`\\\`

排除后，spring-core 依赖的 commons-logging 不会被传递进来，你可以换成自己想要的日志门面。注意 exclusions 只对**这一条传递路径**生效，不影响其他路径。

### Maven 生命周期（Lifecycle）

生命周期是 Maven 区别于 Ant 的核心特性。Maven 内置了**三套相互独立的生命周期**：

1. **clean 生命周期**：清理项目，含 \\\`pre-clean\\\`、\\\`clean\\\`、\\\`post-clean\\\` 三个阶段。
2. **default 生命周期**：项目构建的主力，含 \\\`validate→compile→test→package\\\`→...→\\\`install→deploy\\\` 等约 23 个阶段。
3. **site 生命周期**：生成项目站点文档，含 \\\`site\\\` 等。

每套生命周期内的**阶段（phase）是有顺序的**——执行后面的阶段会自动执行前面所有阶段。比如执行 \\\`mvn package\\\`，会依次执行 \\\`compile→test→package\\\`，你不用手动一条条敲。

### default 生命周期的关键阶段

| 阶段 | 作用 | 绑定的默认插件目标 |
| --- | --- | --- |
| \\\`validate\\\` | 校验项目完整性 | - |
| \\\`compile\\\` | 编译主源码 \\\`src/main/java\\\` | \\\`compiler:compile\\\` |
| \\\`test\\\` | 运行单元测试 | \\\`surefire:test\\\` |
| \\\`package\\\` | 打包成 jar/war | \\\`jar:jar\\\` / \\\`war:war\\\` |
| \\\`install\\\` | 安装到本地仓库 | \\\`install:install\\\` |
| \\\`deploy\\\` | 发布到远程仓库 | \\\`deploy:deploy\\\` |

### 阶段与插件目标（Goal）的绑定

生命周期只是"流程框架"，真正的活儿是**插件**干的。每个阶段默认绑定一个插件目标（goal）。比如 \\\`compile\\\` 阶段绑定 \\\`maven-compiler-plugin\\\` 的 \\\`compile\\\` 目标。当你执行 \\\`mvn compile\\\`，Maven 实际是调用 \\\`compiler:compile\\\` 这个目标来编译。

你也可以直接执行某个 goal，比如 \\\`mvn dependency:tree\\\`、\\\`mvn surefire:test\\\`。这种不经过阶段、直接调插件的方式在排查问题时很常用。

## 设计原则

### 1. 依赖传递自动化

设计哲学是"声明一次，自动传递"。开发者只需关心直接依赖，传递依赖由 Maven 自动解析。这极大降低了"手动管理一堆 jar"的负担。但自动化也带来"黑盒"风险——你可能不知道最终打包了哪些 jar，所以 \\\`dependency:tree\\\` 是必备工具。

### 2. scope 隔离不同环境的依赖

设计上把"编译期需要"和"运行期需要"分离，避免测试框架污染生产包，避免容器已提供的库重复打包。这体现了**关注点分离**思想——不同阶段的依赖各管各的。

### 3. 生命周期的线性与原子性

阶段是线性递进的，执行后阶段必然先执行前阶段。这种"线性不可跳"的设计让构建行为可预测——你不会遇到"测试了但没编译"的诡异情况。每个阶段是原子的，失败即停止，不会继续往后执行破坏产物。

### 4. 插件化扩展

生命周期本身不知道怎么编译、怎么测试，它只定义"什么时候做"。具体怎么做交给插件，通过 goal 绑定。这种解耦让 Maven 可以通过替换插件支持新语言、新打包格式，而不用改生命周期框架。

## 使用场景

### 场景一：声明多个依赖

\\\`\\\`\\\`xml
<dependencies>
    <!-- 生产依赖：打进 jar -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>5.3.30</version>
    </dependency>

    <!-- 运行时依赖：JDBC 驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Web 容器提供：不打进 war -->
    <dependency>
        <groupId>javax.servlet</groupId>
        <artifactId>javax.servlet-api</artifactId>
        <version>4.0.1</version>
        <scope>provided</scope>
    </dependency>

    <!-- 测试依赖：仅测试期可见 -->
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
\\\`\\\`\\\`

### 场景二：排查依赖冲突

\\\`\\\`\\\`bash
mvn dependency:tree
\\\`\\\`\\\`

输出示例（节选）：

\\\`\\\`\\\`
[INFO] com.example:my-app:jar:1.0
[INFO] +- org.springframework:spring-context:jar:5.3.30:compile
[INFO] |  +- org.springframework:spring-aop:jar:5.3.30:compile
[INFO] |  \\- org.springframework:spring-beans:jar:5.3.30:compile
[INFO] +- org.junit.jupiter:junit-jupiter:jar:5.10.0:test
\\\`\\\`\\\`

带 \\\`-Dverbose\\\` 可以看被"omitted"（省略）的冲突版本：

\\\`\\\`\\\`bash
mvn dependency:tree -Dverbose
\\\`\\\`\\\`

### 场景三：构建全流程

\\\`\\\`\\\`bash
mvn clean install
\\\`\\\`\\\`

清理后重新编译、测试、打包、装到本地仓库。多模块项目里这条命令会让子模块的产物对后续模块立即可见。

## 代码逐行讲解

### 一个含 exclusions 和 dependencyManagement 的 pom

\\\`\\\`\\\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!-- dependencyManagement：只声明版本，不实际引入 -->
    <!-- 子模块继承后，写 dependency 时可省略 version -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-framework-bom</artifactId>
                <version>5.3.30</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- 业务依赖，排除了不想要的 commons-logging -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <!-- version 由上面的 BOM 统一管理，这里不写 -->
            <exclusions>
                <exclusion>
                    <groupId>commons-logging</groupId>
                    <artifactId>commons-logging</artifactId>
                </exclusion>
            </exclusions>
        </dependency>

        <!-- 用 slf4j 桥接替代 commons-logging -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>jcl-over-slf4j</artifactId>
            <version>2.0.9</version>
        </dependency>
    </dependencies>
</project>
\\\`\\\`\\\`

**逐行解释**：

- \\\`<dependencyManagement>\\\`：依赖管理区。这里声明的依赖**不会实际引入**项目，只是"登记"了版本号。子模块或下方 dependencies 引用时可以省略 \\\`<version>\\\`，统一从此处取。这是大型项目版本管理的标配。
- \\\`<scope>import</scope>\\\` + \\\`<type>pom</type>\\\`：导入一个 BOM（Bill of Materials）。Spring 的 BOM 里管理了所有 spring-* 的版本，导入后所有 spring 依赖都不用写 version，版本由 BOM 统一保证一致——这是避免 Spring 各模块版本不匹配导致冲突的标准做法。
- \\\`<exclusions>\\\`：排除传递依赖。spring-core 默认依赖 commons-logging，但我们要换成 slf4j 体系，所以排掉它，避免日志框架冲突。
- 第二个 dependency 引入 \\\`jcl-over-slf4j\\\`：这是 slf4j 提供的桥接包，实现了 commons-logging 的接口但内部转发到 slf4j。这样 spring 内部用 commons-logging API 打的日志会走 slf4j 统一输出。这是日志体系治理的经典套路。

## 对比（表格形式）

### scope 详细对比

| scope | 何时可见 | 是否打包 | 典型依赖 | 传递性 |
| --- | --- | --- | --- | --- |
| compile | 编译+测试+运行 | 是 | spring-core | 强传递 |
| test | 仅测试 | 否 | junit | 不传递 |
| provided | 编译+测试 | 否 | servlet-api | 不传递 |
| runtime | 测试+运行 | 是 | jdbc 驱动 | 弱传递 |
| system | 编译+测试 | 否 | 本地 jar | 不传递 |
| import | - | - | BOM | 仅版本管理 |

### 生命周期三套对比

| 生命周期 | 作用 | 关键阶段 | 触发命令 |
| --- | --- | --- | --- |
| clean | 清理 | clean | mvn clean |
| default | 构建 | compile/test/package/install/deploy | mvn package |
| site | 文档 | site | mvn site |

### 依赖冲突解决规则对比

| 规则 | 触发条件 | 胜出者 |
| --- | --- | --- |
| 最短路径优先 | 多条路径引同一 artifact 不同版本 | 路径最短的版本 |
| 声明优先 | 路径长度相同 | pom 中先声明的版本 |
| 显式声明优先 | 自己直接声明了该依赖 | 直接声明的版本（路径为 1） |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| NoSuchMethodError 运行时报错 | 依赖冲突，编译期和运行期版本不一致 | 用 \\\`dependency:tree -Dverbose\\\` 找冲突，加 exclusions 或 dependencyManagement 锁版本 |
| 测试框架被打进生产 jar | scope 写成了 compile | 测试依赖必须 \\\`<scope>test</scope>\\\` |
| war 包里多了 servlet-api | scope 没写 provided | servlet-api 用 \\\`<scope>provided</scope>\\\` |
| 依赖下不动 | 公司内网或中央慢 | 配阿里云镜像或私服 |
| exclusions 写错位置 | 写在 dependencyManagement 里没生效 | exclusions 必须写在真正引入依赖的 \\\`<dependency>\\\` 里 |
| 多模块版本不一致 | 各模块各写各的版本号 | 用父 pom 的 dependencyManagement 统一管控 |
| SNAPSHOT 上生产 | 远程随时覆盖，构建不可重现 | 生产用 release 版本号，CI 上禁止 SNAPSHOT |
| dependency:tree 看不全 | 默认只显示实际生效的版本 | 加 \\\`-Dverbose\\\` 看被省略的冲突版本 |
`,
  },

  // =========================================================
  // jw-19：多模块项目
  // =========================================================
  {
    id: "jw-19",
    group: "Maven 与构建工具",
    icon: "📦",
    title: "多模块项目",
    content: `# 多模块项目

## 概念讲解

### 为什么要拆分模块

随着项目规模增长，把所有代码塞进一个 Maven 项目会越来越难维护：编译变慢、职责混乱、无法独立复用、多人协作时频繁冲突。**多模块（Multi-Module）项目**就是把这些代码按职责拆成多个 Maven 模块，每个模块有自己的 \\\`pom.xml\\\`，但又通过一个**父 pom** 聚合在一起统一管理。

拆分模块的核心动机有四点：

1. **关注点分离**：把领域模型、数据访问、Web 接口、工具类分别放在不同模块，每个模块只负责一类事情。改 Web 不会动到领域模型，互不干扰。
2. **复用**：把通用工具（如 \\\`common-utils\\\`、\\\`domain-model\\\`）拆成独立模块，多个上层模块都能依赖它。不用复制粘贴代码。
3. **并行开发**：模块间通过接口依赖，定义好 API 后各团队并行开发，编译期互不阻塞。
4. **构建效率**：改了某个模块只重新构建该模块及其下游，不必每次全量构建（配合 \\\`-pl\\\`、\\\`-am\\\` 参数）。

### 父 pom 与 packaging=pom

多模块项目有一个**父 pom**，它的 \\\`<packaging>\\\` 是 \\\`pom\\\`，表示"本身不产 jar，只用于聚合和统一管理"。父 pom 通过 \\\`<modules>\\\` 列出所有子模块：

\\\`\\\`\\\`xml
<packaging>pom</packaging>
<modules>
    <module>common</module>
    <module>domain</module>
    <module>web</module>
</modules>
\\\`\\\`\\\`

每个 \\\`<module>\\\` 的值是子模块**相对于父 pom 的目录路径**。Maven 执行构建时，会按依赖顺序依次进入每个子模块目录执行构建。

### 聚合 vs 继承

这是多模块最容易混淆的两个概念，必须分清：

- **聚合（Aggregation）**：父 pom 通过 \\\`<modules>\\\` 把子模块"拢"在一起，执行 \\\`mvn package\\\` 时一次构建所有子模块。这是**构建层面的聚合**，解决的是"如何批量构建"。
- **继承（Inheritance）**：子模块的 pom 通过 \\\`<parent>\\\` 声明父 pom，继承其 properties、dependencyManagement、pluginManagement 等配置。这是**配置层面的继承**，解决的是"如何复用配置"。

二者可以独立存在，但通常**一起用**——既聚合又继承。父 pom 既是聚合入口又是配置基类。但理论上你可以：只聚合不继承（子模块不写 \\\`<parent>\\\`，父 pom 只列 modules）；或只继承不聚合（子模块继承某个父 pom，但父 pom 不列 modules）。

### 子模块继承父 pom

子模块 pom 通过 \\\`<parent>\\\` 声明父 pom：

\\\`\\\`\\\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>my-parent</artifactId>
        <version>1.0-SNAPSHOT</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    <artifactId>web</artifactId>
    <!-- groupId 和 version 继承自父 pom，可省略 -->
    <packaging>war</packaging>
</project>
\\\`\\\`\\\`

\\\`<relativePath>\\\` 指向父 pom 在文件系统的位置，默认值是 \\\`../pom.xml\\\`，让 Maven 先从本地文件系统找父 pom，找不到再去仓库下载。子模块可以省略 \\\`<groupId>\\\` 和 \\\`<version>\\\`，自动继承父 pom 的值。

### dependencyManagement 统一版本

这是多模块项目的核心武器。在父 pom 的 \\\`<dependencyManagement>\\\` 里集中声明所有依赖的版本，子模块引入时只写 groupId/artifactId，不写 version：

\\\`\\\`\\\`xml
<!-- 父 pom -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-context</artifactId>
            <version>5.3.30</version>
        </dependency>
    </dependencies>
</dependencyManagement>
\\\`\\\`\\\`

\\\`\\\`\\\`xml
<!-- 子模块 -->
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <!-- 不写 version，由父 pom 管理 -->
    </dependency>
</dependencies>
\\\`\\\`\\\`

关键区别：\\\`<dependencyManagement>\\\` 里的声明**不会实际引入依赖**，只登记版本。子模块必须在自己的 \\\`<dependencies>\\\` 里再写一次（但不带 version）才会真正引入。这让你"声明版本"和"使用依赖"分离——所有模块的 spring 版本都由父 pom 一处控制，改一处全改。

### pluginManagement 统一插件版本

类似的，\\\`<pluginManagement>\\\` 用于统一插件版本和配置。子模块用到该插件时自动继承版本和配置，无需重复写。

### BOM（Bill of Materials）

BOM 是一种特殊的 pom，\\\`<packaging>pom</packaging>\\\`，里面只有一个 \\\`<dependencyManagement>\\\` 块，列出一系列"版本配套"的依赖。**它本身不包含任何代码**，纯版本清单。使用方式：

\\\`\\\`\\\`xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-framework-bom</artifactId>
            <version>5.3.30</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
\\\`\\\`\\\`

导入后，所有 spring-* 依赖都不用写 version，版本由 BOM 统一保证一致。Spring、Spring Boot、JUnit 5 等大型框架都提供官方 BOM。BOM 的价值是**保证一组配套依赖的版本兼容性**——比如 spring-core 5.3.30 必须配 spring-beans 5.3.30，用 BOM 一次性保证，不会出现版本错配。

## 设计原则

### 1. 单一职责拆分

模块拆分的依据是**职责**，不是文件多少。常见拆法：\\\`common\\\`（工具）、\\\`domain\\\`（领域模型）、\\\`repository\\\`（数据访问）、\\\`service\\\`（业务逻辑）、\\\`web\\\`（控制器）。每个模块依赖关系单向：web→service→repository→domain→common。**避免循环依赖**——A 依赖 B，B 又依赖 A，说明拆分边界错了。

### 2. 依赖方向自上而下

设计上让上层（web）依赖下层（service），下层不感知上层。这样改 web 不影响 service，但改 service 接口会影响 web。这种单向依赖让变更影响可控可预测。

### 3. 配置集中管控

所有版本号、插件配置集中在父 pom 的 \\\`<properties>\\\` 和 \\\`<dependencyManagement>\\\`、\\\`<pluginManagement>\\\` 里。子模块只引用不重写版本。这样升级一个库只改父 pom 一处，全模块生效，避免版本碎片化。

### 4. 接口与实现分离

大型项目常把"接口契约"和"实现"分到不同模块。比如 \\\`api\\\` 模块只放接口和数据模型，\\\`impl\\\` 模块放实现。调用方只依赖 \\\`api\\\`，不依赖 \\\`impl\\\`，实现可热插拔。这是面向接口编程在工程结构上的体现。

## 使用场景

### 场景一：典型分层 Web 项目

\\\`\\\`\\\`
my-project/
├── pom.xml                  # 父 pom (packaging=pom)
├── common/                  # 通用工具
│   └── pom.xml
├── domain/                  # 领域模型
│   └── pom.xml
├── repository/             # 数据访问
│   └── pom.xml
├── service/                 # 业务逻辑
│   └── pom.xml
└── web/                     # Web 控制器 + 启动
    └── pom.xml
\\\`\\\`\\\`

依赖方向：web → service → repository → domain → common。

### 场景二：只构建改动模块

\\\`\\\`\\\`bash
# 只构建 web 模块及其依赖的上游模块 (-am = also make)
mvn install -pl web -am
\\\`\\\`\\\`

### 场景三：跳过测试快速打包

\\\`\\\`\\\`bash
mvn clean package -DskipTests
\\\`\\\`\\\`

## 代码逐行讲解

### 完整多模块项目结构

**父 pom（/pom.xml）：**

\\\`\\\`\\\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>common</module>
        <module>domain</module>
        <module>repository</module>
        <module>service</module>
        <module>web</module>
    </modules>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <spring.version>5.3.30</spring.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-context</artifactId>
                <version>\${spring.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
\\\`\\\`\\\`

**子模块 web/pom.xml：**

\\\`\\\`\\\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>my-project</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <artifactId>web</artifactId>
    <packaging>war</packaging>

    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>service</artifactId>
            <version>\${project.version}</version>
        </dependency>
    </dependencies>
</project>
\\\`\\\`\\\`

**逐行解释**：

- 父 pom 的 \\\`<packaging>pom</packaging>\\\`：标记这是聚合父项目，不产出 jar。
- \\\`<modules>\\\`：列出所有子模块目录。Maven 构建时按此顺序（及依赖关系）进入每个子目录构建。
- \\\`<dependencyManagement>\\\`：声明 spring-context 的版本为 \\\${spring.version}\\\`（即 5.3.30）。子模块引用时省略 version 即自动继承。
- 子模块的 \\\`<parent>\\\`：声明父 pom 坐标，继承其配置。\\\`<relativePath>\\\` 默认 \\\`../pom.xml\\\`，可省略。
- 子模块只写 \\\`<artifactId>web</artifactId>\\\`：groupId 和 version 继承自父 pom。
- \\\`<packaging>war</packaging>\\\`：web 模块打 war 包，其他模块默认 jar。
- \\\`<version>\${project.version}</version>\\\`：引用本项目的 version，让 web 依赖的 service 模块版本和自身一致。\\\`\\\${project.version}\\\` 是 Maven 内置属性，指向当前 pom 的 version。

### 反应堆构建顺序（Reactor）

执行 \\\`mvn install\\\` 时 Maven 会计算**反应堆顺序**——根据模块间依赖关系决定构建先后。比如 web 依赖 service，service 依赖 repository，则构建顺序是 common→domain→repository→service→web。可以用 \\\`-pl\\\`（projects list）指定只构建部分模块，\\\`-am\\\`（also make）带上其上游依赖，\\\`-amd\\\`（also make dependents）带上其下游。

## 对比（表格形式）

### 聚合 vs 继承

| 维度 | 聚合 | 继承 |
| --- | --- | --- |
| 解决什么问题 | 批量构建多个模块 | 复用 pom 配置 |
| 配置标签 | \\\`<modules>\\\`（父 pom） | \\\`<parent>\\\`（子 pom） |
| 方向 | 父→子（父列出子） | 子→父（子声明父） |
| 是否可单独用 | 可（只聚合不继承） | 可（只继承不聚合） |
| 典型场景 | 一次构建整个工程 | 子模块复用版本和插件配置 |

### dependencyManagement vs dependencies

| 维度 | dependencyManagement | dependencies |
| --- | --- | --- |
| 是否实际引入依赖 | 否，只登记版本 | 是，会下载并打包 |
| 子模块是否自动有 | 否，子模块要自己声明才引入 | 是，子模块自动继承 |
| 主要用途 | 统一版本管控 | 声明真实依赖 |
| 是否可省略 version | 子模块引用时可省 | 不能省略 version |

### 单模块 vs 多模块

| 维度 | 单模块 | 多模块 |
| --- | --- | --- |
| 构建复杂度 | 简单 | 复杂，要管依赖方向 |
| 复用性 | 差（代码混在一起） | 好（模块可独立复用） |
| 编译速度 | 慢（全量） | 可按模块增量 |
| 适合规模 | 小项目 | 中大型项目 |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 循环依赖 | A 依赖 B，B 又依赖 A | 重新划分模块边界，引入接口模块解耦 |
| 版本号不一致 | 各模块各写各的 version | 用父 pom 的 dependencyManagement 统一 |
| 构建顺序错乱 | 子模块依赖了未构建的模块 | 让被依赖模块在父 pom 的 modules 中先列出（或靠反应堆自动排序） |
| relativePath 错误 | 子模块找不到父 pom | 检查 \\\`<relativePath>\\\` 路径，或先 install 父 pom |
| 改了 common 全量重编 | 没用增量构建 | 用 \\\`-pl xxx -am\\\` 只构建改动模块及上游 |
| 接口和实现混在一模块 | 调用方被迫依赖整个实现 | 拆 \\\`api\\\` 和 \\\`impl\\\` 两个模块，调用方只依赖 api |
| 父 pom 没装到本地仓库 | 子模块构建时报找不到父 pom | 先 \\\`mvn install -N\\\` 装父 pom（-N 不构建子模块） |
| BOM 导入位置错 | 写在 dependencies 里没生效 | BOM 必须写在 dependencyManagement 里且 \\\`<scope>import</scope>\\\` |
`,
  },

  // =========================================================
  // jw-20：Gradle 入门
  // =========================================================
  {
    id: "jw-20",
    group: "Maven 与构建工具",
    icon: "📦",
    title: "Gradle 入门",
    content: `# Gradle 入门

## 概念讲解

### Gradle 是什么

**Gradle** 是新一代的构建工具，由 **Hans Dockter** 于 2009 年创建，2012 年发布 1.0。它吸收了 Maven 的"约定优于配置"和 Ant 的"灵活性"，但放弃了 Maven 的 XML，改用 **Groovy（或 Kotlin）DSL** 写构建脚本——这意味着构建脚本本身就是代码，可以有变量、条件、循环、函数，表达能力远超声明式 XML。

Gradle 的两个标志性特性：

1. **增量构建（Incremental Build）**：Gradle 会跟踪每个任务的输入输出文件，只有当输入变化时才重新执行该任务。Maven 每次都全量编译，Gradle 只编译改动过的部分，大型项目构建速度差异显著。
2. **构建缓存与守护进程**：Gradle 的 \\\`Daemon\\\` 进程常驻内存，避免每次启动 JVM 的开销；构建缓存可以跨机器、跨项目复用已构建产物。这让 Gradle 在大型项目上比 Maven 快数倍。

Gradle 目前是 **Android 官方构建工具**，也是 Spring Framework、Spring Boot 自身使用的构建工具。在 Java 后端领域虽不如 Maven 普及，但越来越多新项目选 Gradle。

### Gradle vs Maven

| 维度 | Maven | Gradle |
| --- | --- | --- |
| 配置文件 | \\\`pom.xml\\\`（XML，啰嗦） | \\\`build.gradle\\\`（Groovy/Kotlin，简洁） |
| 表达能力 | 声明式，难写复杂逻辑 | 编程式，可写任意逻辑 |
| 构建速度 | 慢（全量） | 快（增量 + 缓存 + 守护进程） |
| 生命周期 | 固定阶段 | 任务图（灵活组合） |
| 依赖管理 | 强，传递解析成熟 | 强，兼容 Maven 仓库 |
| 学习曲线 | 中（XML 易读但要懂生命周期） | 中高（要懂 Groovy） |
| 适用领域 | 企业 Java 后端主流 | Android、大型项目、追求性能 |

### build.gradle 结构

一个最简的 Gradle 构建脚本：

\\\`\\\`\\\`groovy
plugins {
    id 'java'
}

group = 'com.example'
version = '1.0-SNAPSHOT'

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework:spring-core:5.3.30'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}

test {
    useJUnitPlatform()
}
\\\`\\\`\\\`

**逐块解释**：

- \\\`plugins { id 'java' }\\\`：应用 java 插件，自动配置编译、测试、打包的标准任务（类似 Maven 的生命周期）。
- \\\`group\\\` 和 \\\`version\\\`：项目坐标，等价于 Maven 的 groupId 和 version。
- \\\`repositories { mavenCentral() }\\\`：声明仓库，从 Maven 中央仓库拉依赖。可以加 \\\`mavenLocal()\\\`（本地仓库）、\\\`maven { url '...' }\\\`（私服）。
- \\\`dependencies\\\`：依赖声明。Gradle 用字符串简写 \\\`'group:artifact:version'\\\` 代替 XML 的三行配置。
- \\\`test { useJUnitPlatform() }\\\`：配置测试任务，启用 JUnit 5 平台。

### 依赖配置（Configurations）

Gradle 的"scope"叫 \\\`configuration\\\`（配置），比 Maven 更细：

| configuration | 含义 | 对应 Maven scope |
| --- | --- | --- |
| \\\`implementation\\\` | 主源码依赖，不暴露给上游 | compile（更优） |
| \\\`api\\\` | 主源码依赖，且暴露给上游（依赖此模块者可见） | compile |
| \\\`compileOnly\\\` | 仅编译期，不打包 | provided |
| \\\`runtimeOnly\\\` | 仅运行期 | runtime |
| \\\`testImplementation\\\` | 测试主源码依赖 | test |
| \\\`testCompileOnly\\\` | 仅测试编译期 | - |
| \\\`testRuntimeOnly\\\` | 仅测试运行期 | - |

\`implementation\` 和 \`api\` 的区别是 Gradle 的精华：\\\`implementation\\\` 不把依赖暴露给上游模块，上游编译时看不到它，这能**减少上游重新编译的范围**，加速构建。\\\`api\\\` 则暴露给上游（用于库的公开 API 依赖）。

### 任务（Task）

Gradle 的构建单元是 **task**。一切构建都是 task 的组合。java 插件预置了大量 task：

| task | 作用 | 对应 Maven 阶段 |
| --- | --- | --- |
| \\\`compileJava\\\` | 编译主源码 | compile |
| \\\`processResources\\\` | 处理资源文件 | process-resources |
| \\\`compileTestJava\\\` | 编译测试源码 | test-compile |
| \\\`test\\\` | 运行测试 | test |
| \\\`build\\\` | 全量构建（编译+测试+打包） | package |
| \\\`clean\\\` | 清理 build 目录 | clean |
| \\\`jar\\\` | 打 jar 包 | package |

可以自定义 task：

\\\`\\\`\\\`groovy
tasks.register('hello') {
    doLast {
        println 'Hello, Gradle!'
    }
}
\\\`\\\`\\\`

执行 \\\`gradle hello\\\` 即可运行。task 之间可以声明依赖：\\\`taskB.dependsOn taskA\\\`，Gradle 会自动按依赖关系排序执行。

### 增量构建原理

Gradle 会为每个 task 记录**输入**（源文件、属性）和**输出**（产物文件）的指纹（hash）。下次执行时如果输入输出都没变，就跳过该 task，标记为 \\\`UP-TO-DATE\\\`。这就是为什么第二次 \\\`gradle build\\\` 比第一次快得多——大部分 task 被跳过了。

要让增量构建生效，自定义 task 必须声明 inputs/outputs：

\\\`\\\`\\\`groovy
tasks.register('processData', Copy) {
    from 'src/data'
    into 'build/processed'
    // Copy 任务自动声明了输入输出，自动支持增量
}
\\\`\\\`\\\`

### Gradle Wrapper

**Wrapper** 是 Gradle 的杀手锏之一。它是一组脚本（\\\`gradlew\\\`、\\\`gradlew.bat\\\`）和一个小 jar（\\\`gradle-wrapper.jar\\\`），随项目提交到 Git。任何人 clone 项目后用 \\\`./gradlew build\\\` 构建时，Wrapper 会**自动下载项目指定版本的 Gradle**，无需本机预装 Gradle。

这解决了"我电脑上能跑"的经典问题——构建工具版本本身被项目锁定，保证所有人构建环境一致。Maven 没有官方 wrapper（有第三方 \\\`mvnw\\\` 但普及度低），这是 Gradle 的明显优势。

生成 wrapper：

\\\`\\\`\\\`bash
gradle wrapper --gradle-version 8.5
\\\`\\\`\\\`

执行构建：

\\\`\\\`\\\`bash
./gradlew build      # Linux/Mac
gradlew.bat build    # Windows
\\\`\\\`\\\`

### 与 Maven 互操作

Gradle 完全兼容 Maven 仓库——同样的 \\\`mavenCentral()\\\`、\\\`mavenLocal()\\\`，能拉同样的 jar。依赖坐标用 \\\`'group:artifact:version'\\\` 简写，等价于 Maven 的 GAV。Gradle 还能直接消费 Maven 的 \\\`pom\\\`、\\\`BOM\\\`：

\\\`\\\`\\\`groovy
// 导入 Maven BOM
implementation platform('org.springframework:spring-framework-bom:5.3.30')
implementation 'org.springframework:spring-context'  // 版本由 BOM 管
\\\`\\\`\\\`

但反向（Maven 项目用 Gradle 构建）不直接支持——pom 和 build.gradle 是两套体系。迁移时可用 \\\`gradle init\\\` 把 Maven 项目转成 Gradle 项目。

## 设计原则

### 1. 构建脚本即代码

Gradle 用 Groovy/Kotlin 写脚本，意味着构建逻辑可以编程。你可以写函数、用 if/else、循环生成依赖、动态创建 task。这让复杂构建逻辑可以优雅表达，而不是用 XML 的各种 hack。代价是构建脚本本身需要测试和维护。

### 2. 增量优先

Gradle 的核心设计目标之一是"不重复劳动"。每个 task 都尽可能增量——只有输入变了才执行。配合构建缓存（跨项目、跨机器复用产物）和守护进程（常驻 JVM），构建速度被推到极致。这让 Gradle 在大型项目（如 Android 工程、Spring 源码）上构建速度优势明显。

### 3. 约定优于配置（继承自 Maven）

java 插件预置了标准目录结构（\\\`src/main/java\\\`、\\\`src/test/java\\\`）和标准 task（build、test、jar）。默认配置开箱即用，偏离约定时才需自定义。这让简单项目的 build.gradle 可以只有几行。

### 4. 配置分离（implementation vs api）

Gradle 引入 \\\`implementation\\\` vs \\\`api\\\` 的区分，强制开发者思考"这个依赖是否暴露给上游"。这是 Maven 没有的精细控制——\\\`implementation\\\` 隐藏依赖细节，减少上游编译耦合，加速构建。这体现了**最小暴露原则**。

## 使用场景

### 场景一：创建新 Gradle 项目

\\\`\\\`\\\`bash
mkdir my-app && cd my-app
gradle init --type java-application
\\\`\\\`\\\`

交互式选择后生成项目骨架，含 \\\`build.gradle\\\`、\\\`settings.gradle\\\`、\\\`src/main/java\\\`、\\\`src/test/java\\\` 和 wrapper 脚本。

### 场景二：声明依赖

\\\`\\\`\\\`groovy
dependencies {
    // 主源码依赖，不暴露给上游
    implementation 'org.springframework:spring-core:5.3.30'
    implementation 'org.springframework:spring-context:5.3.30'

    // 仅编译期需要（如 lombok）
    compileOnly 'org.projectlombok:lombok:1.18.30'
    annotationProcessor 'org.projectlombok:lombok:1.18.30'

    // 测试依赖
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
\\\`\\\`\\\`

### 场景三：构建与测试

\\\`\\\`\\\`bash
./gradlew build          # 编译+测试+打包
./gradlew test           # 只跑测试
./gradlew clean build    # 清理后构建
./gradlew build -x test  # 构建但跳过测试
\\\`\\\`\\\`

### 场景四：查看依赖树

\\\`\\\`\\\`bash
./gradlew dependencies
./gradlew dependencyInsight --dependency spring-core
\\\`\\\`\\\`

## 代码逐行讲解

### 一个完整的 build.gradle

\\\`\\\`\\\`groovy
// 应用插件
plugins {
    id 'java'                              // Java 项目支持
    id 'application'                        // 应用支持（可运行 main 方法）
    id 'jacoco'                             // 代码覆盖率
}

// 项目坐标
group = 'com.example'
version = '1.0-SNAPSHOT'

// JDK 版本
java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

// 仓库
repositories {
    mavenLocal()                            // 本地 Maven 仓库
    mavenCentral()                          // Maven 中央仓库
    maven { url 'https://maven.aliyun.com/repository/public' }  // 阿里云镜像
}

// 依赖
dependencies {
    implementation 'org.springframework:spring-context:5.3.30'
    implementation 'mysql:mysql-connector-java:8.0.33'
    compileOnly 'javax.servlet:javax.servlet-api:4.0.1'   // 容器提供
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}

// 测试配置
test {
    useJUnitPlatform()                      // 启用 JUnit 5
    testLogging {
        events 'passed', 'skipped', 'failed'
    }
}

// 应用入口
application {
    mainClass = 'com.example.Main'
}

// 打包配置
jar {
    manifest {
        attributes 'Main-Class': 'com.example.Main'
    }
}
\\\`\\\`\\\`

**逐行解释**：

- \\\`plugins { id 'java' }\\\`：应用 java 插件，自动注入编译、测试、打包任务及标准目录结构。
- \\\`id 'application'\\\`：应用 application 插件，提供 \\\`run\\\` 任务直接执行 main 方法，方便调试。
- \\\`id 'jacoco'\\\`：代码覆盖率插件，构建时生成覆盖率报告。
- \\\`group\\\`、\\\`version\\\`：项目坐标，等价 Maven 的 groupId 和 version。
- \\\`java { sourceCompatibility = ... }\\\`：指定源码和目标的 JDK 版本为 17。
- \\\`repositories\\\`：仓库列表，按顺序查找。\\\`mavenLocal()\\\` 先查本地 Maven 缓存（共享 Maven 的本地仓库），\\\`mavenCentral()\\\` 查中央，第三个是阿里云镜像加速国内下载。
- \\\`implementation\\\`：主依赖，不暴露给上游模块。
- \\\`compileOnly\\\`：仅编译期，servlet-api 由 Tomcat 容器提供，不打包进 war。
- \\\`testImplementation\\\`：测试依赖，只在测试源码可见。
- \\\`test { useJUnitPlatform() }\\\`：配置 test 任务使用 JUnit 5 平台引擎。
- \\\`application { mainClass = ... }\\\`：声明应用主类，\\\`./gradlew run\\\` 时执行它的 main 方法。
- \\\`jar { manifest { attributes 'Main-Class' = ... } }\\\`：配置 jar 的清单文件，指定主类，使 jar 可通过 \\\`java -jar\\\` 运行。

### settings.gradle

\\\`\\\`\\\`groovy
rootProject.name = 'my-app'
include 'common', 'domain', 'web'   // 多模块声明
\\\`\\\`\\\`

多模块项目在 \\\`settings.gradle\\\` 里用 \\\`include\\\` 声明子模块，类似 Maven 父 pom 的 \\\`<modules>\\\`。

## 对比（表格形式）

### 依赖配置对比

| Gradle configuration | 作用 | Maven scope | 是否暴露上游 |
| --- | --- | --- | --- |
| implementation | 主源码依赖，不暴露 | compile | 否 |
| api | 主源码依赖，暴露给上游 | compile | 是 |
| compileOnly | 仅编译期 | provided | - |
| runtimeOnly | 仅运行期 | runtime | - |
| testImplementation | 测试主源码 | test | - |

### 增量构建对比

| 维度 | Maven | Gradle |
| --- | --- | --- |
| 增量编译 | 不支持，每次全量 | 支持，按文件指纹跳过 |
| 守护进程 | 无，每次启动 JVM | 有，常驻内存 |
| 构建缓存 | 无 | 跨项目跨机器复用产物 |
| 第二次构建速度 | 慢 | 快很多（大部分 UP-TO-DATE） |

### Wrapper 对比

| 维度 | Maven mvnw | Gradle wrapper |
| --- | --- | --- |
| 是否官方 | 第三方 | 官方原生 |
| 普及度 | 低 | 极高，几乎所有 Gradle 项目用 |
| 锁定构建工具版本 | 是 | 是 |
| 生成命令 | mvn -N io.takari:maven:wrapper | gradle wrapper |

## 常见陷阱（表格形式）

| 陷阱 | 原因 | 解决 |
| --- | --- | --- |
| 用 api 代替 implementation | 上游被迫重新编译，构建变慢 | 仅库的公开 API 依赖用 api，其余用 implementation |
| 忘记用 wrapper | 不同机器 Gradle 版本不一致，构建行为不同 | 提交 \\\`gradlew\\\` 和 \\\`gradle-wrapper.jar\\\` 到 Git |
| 依赖写成 compile | compile 已废弃，且不分 implementation/api | 用 implementation 或 api 替代 |
| 守护进程内存泄漏 | 长期运行的 daemon 占用大内存 | \\\`gradle --stop\\\` 重启 daemon |
| 版本号硬编码 | 改版本要改多处 | 用 \\\`ext { springVersion = '5.3.30' }\\\` 或 version catalog 集中管理 |
| 没声明 repositories | 找不到依赖报错 | 必须在 \\\`repositories\\\` 里加 \\\`mavenCentral()\\\` 等 |
| build.gradle 逻辑过于复杂 | DSL 当通用语言用，可读性差 | 复杂逻辑抽到 \\\`buildSrc\\\` 或插件里，保持 build.gradle 简洁 |
| JDK 版本没配对 | sourceCompatibility 和本机 JDK 不一致 | 在 \\\`java { }\\\` 里显式指定 sourceCompatibility/targetCompatibility |
`,
  },
];
