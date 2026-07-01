// =============================================================
// Java Web 应用开发实战教程 —— 第五批章节
// 分组:Maven 与构建工具(共 4 章)
// -------------------------------------------------------------
// 本文件包含以下章节:
//   jw-17: Maven 基础与 pom.xml
//   jw-18: 依赖管理与仓库
//   jw-19: 生命周期与插件
//   jw-20: 多模块项目与 Gradle 对比
//
// 转义约定:content 为反引号模板字符串,内部反引号已转义为 \`,
//          三反引号已转义为 \`\`\`,${ 序列已转义为 \${。
// =============================================================

export const chapters = [
  // =========================================================
  // jw-17:Maven 基础与 pom.xml
  // =========================================================
  {
    id: "jw-17",
    group: "Maven 与构建工具",
    icon: "📦",
    title: "Maven 基础与 pom.xml",
    content: `# Maven 基础与 pom.xml

## 概念解释

**Maven** 是 Apache 基金会下的项目构建与管理工具,由 Jason van Zyl 于 2002 年发起。在 Maven 出现之前,Java 项目构建主要依赖 Ant——一个过程式、用 XML 写构建脚本但没有约定的工具,每个项目的目录结构、依赖位置都不一样。Maven 的核心贡献在于**用约定取代配置**(Convention over Configuration),把"项目应该长什么样"标准化了。

Maven 不仅是构建工具,更是一个围绕 **POM(Project Object Model,项目对象模型)** 的项目管理平台。每个 Maven 项目根目录下都有一个 \`pom.xml\` 文件,它是该项目的"身份证"。Maven 读取这个 XML 后,在内存中构建出项目对象模型树,后续所有构建操作都基于这棵树进行。

### Maven 坐标(Coordinates)

Maven 世界里,每个构件(artifact)用一组坐标唯一标识:

| 字段 | 含义 | 例子 |
| --- | --- | --- |
| \`groupId\` | 组织/公司的反向域名 | \`org.springframework\` |
| \`artifactId\` | 项目/模块名 | \`spring-core\` |
| \`version\` | 版本号 | \`5.3.30\` |
| \`packaging\` | 打包类型(可选,默认 jar) | \`jar\` / \`war\` / \`pom\` |

写在一起就是 \`groupId:artifactId:version\`,例如 \`org.springframework:spring-core:5.3.30\`。这个三元组在仓库中对应一个唯一的文件路径。

### 标准目录结构

Maven 强制约定了项目的目录结构:

\`\`\`
my-app/
├── pom.xml                  # 项目对象模型
├── src/
│   ├── main/
│   │   ├── java/            # 主源代码
│   │   ├── resources/       # 配置文件
│   │   └── webapp/          # Web 应用目录(war 包专用)
│   └── test/
│       ├── java/            # 测试源代码
│       └── resources/       # 测试资源
└── target/                  # 构建输出
\`\`\`

Maven 编译时只会去 \`src/main/java\` 找源码。如果你把代码放在别的目录,Maven 看不见。这种"约束"换来了"零配置"。

## 设计原理

### 1. 约定优于配置

Maven 最根本的设计哲学。Ant 需要你显式告诉它源码目录、输出目录;Maven 预先定义了合理的默认约定,你只要按约定摆放文件,就什么都不用配。配置只在"偏离约定"时才需要,降低了 90% 的配置工作量。

### 2. 声明式优于过程式

Ant 的 \`build.xml\` 是过程式的——你写"先编译、再拷贝、再打包"的步骤。Maven 的 \`pom.xml\` 是**声明式**的——你只声明"我要什么",具体怎么编译打包由内置的生命周期和插件自动完成。声明式的好处是配置简单、可复用、不依赖执行顺序。

### 3. 可重现构建

只要把 \`pom.xml\` 和 \`src/\` 提交到 Git,任何人 clone 后执行 \`mvn package\` 都能得到一模一样的产物。依赖从仓库按坐标拉取,版本固定,不依赖本机已有的 jar。

## 使用场景

**场景一:从零创建项目**——用 archetype 插件生成骨架:\`mvn archetype:generate -DgroupId=com.example -DartifactId=my-app\`。

**场景二:编译并打包**——\`mvn clean package\`,清理后编译、测试、打包,在 \`target/\` 下生成 jar。

**场景三:Web 应用项目**——打包类型设为 \`war\`,多一个 \`src/main/webapp\` 目录放 \`WEB-INF/web.xml\`,打出的 war 包丢进 Tomcat 即可运行。

**不适用场景**:需要极度灵活的自定义构建流程、追求极致构建速度的超大型项目(Android 项目更倾向 Gradle)。

## 代码示例

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- project 是根元素,xmlns 声明 Maven POM 的命名空间 -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- POM 模型版本,Maven 3 固定是 4.0.0 -->
    <modelVersion>4.0.0</modelVersion>

    <!-- 项目坐标:三元组唯一标识本项目 -->
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!-- 打包类型:jar(默认)/war/pom -->
    <packaging>jar</packaging>

    <!-- 属性定义:可在下方用 \${属性名} 引用,集中管理版本号 -->
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <junit.version>5.10.0</junit.version>
    </properties>

    <!-- 依赖列表:每个 dependency 是一个第三方库 -->
    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
\`\`\`

逐行说明:\`<groupId>\` 是组织标识,用反向域名;\`<version>\` 中 \`-SNAPSHOT\` 后缀表示开发中的快照版,不带后缀是发布版;\`<properties>\` 定义的属性可在下方用 \`\${属性名}\` 引用,方便统一改版本;\`<scope>test</scope>\` 表示该依赖只在测试时用,不会打进最终 jar。

## 对比分析

### Maven vs Ant vs Gradle

| 维度 | Ant | Maven | Gradle |
| --- | --- | --- | --- |
| 配置文件 | build.xml(过程式) | pom.xml(声明式 XML) | build.gradle(Groovy/Kotlin) |
| 设计哲学 | 灵活无约定 | 约定优于配置 | 约定 + 灵活 |
| 依赖管理 | 手动下载 jar | 内置,自动解析 | 内置,自动解析 |
| 目录结构 | 无约定,自由 | 强制标准结构 | 标准结构(可改) |
| 性能 | 一般 | 一般(每次全量) | 快(增量构建) |
| 适用场景 | 老项目 | 标准企业级项目 | Android、大型项目 |

### 仓库类型对比

| 仓库类型 | 位置 | 作用 | 谁维护 |
| --- | --- | --- | --- |
| 本地仓库 | \`~/.m2/repository\` | 缓存已下载依赖 | 开发者本机 |
| 中央仓库 | \`repo1.maven.org\` | 公共开源库总汇 | Maven 社区 |
| 私服 Nexus | 公司内网 | 代理中央 + 存内部 jar | 公司运维 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| SNAPSHOT 当发布版用 | SNAPSHOT 会被远程覆盖,构建不可重现 | 生产用 release 版本号,去掉 -SNAPSHOT |
| 依赖下载失败报红 | 网络问题或中央仓库慢 | 配阿里云镜像 \`<mirror>\`,或挂 VPN |
| 版本号硬编码到处写 | 改版本要改几十处,易漏 | 用 \`<properties>\` 集中定义,\`\${version}\` 引用 |
| 把源码放在非标准目录 | Maven 找不到源码,编译为空 | 严格遵守 \`src/main/java\` 结构 |
| packaging 写错 | 想打 war 却写成 jar,部署失败 | Web 项目写 \`<packaging>war</packaging>\` |
| 中文注释编译报错 | 没指定源码编码 | 加 \`<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\` |
| 直接改本地仓库的 jar | 下次构建被远程覆盖,改动丢失 | 改源码重新 install,不要手改缓存 |
`,
  },

  // =========================================================
  // jw-18:依赖管理与仓库
  // =========================================================
  {
    id: "jw-18",
    group: "Maven 与构建工具",
    icon: "📚",
    title: "依赖管理与仓库",
    content: `# 依赖管理与仓库

## 概念解释

Maven 的依赖管理是其最有价值的特性之一。你只需在 \`pom.xml\` 中声明"我要什么"依赖,Maven 负责自动从仓库下载并解决传递依赖。

### 依赖范围(Scope)

依赖范围决定一个依赖在什么阶段可用、是否打进最终包。共有 6 种 scope:

| scope | 编译期 | 测试期 | 运行期 | 打进包 | 典型场景 |
| --- | --- | --- | --- | --- | --- |
| \`compile\`(默认) | ✅ | ✅ | ✅ | ✅ | 普通业务依赖 |
| \`test\` | ❌ | ✅ | ❌ | ❌ | JUnit、Mockito |
| \`provided\` | ✅ | ✅ | ❌ | ❌ | Servlet API(容器已有) |
| \`runtime\` | ❌ | ✅ | ✅ | ✅ | JDBC 驱动 |
| \`system\` | ✅ | ✅ | ❌ | ❌ | 本地 jar(不推荐) |
| \`import\` | — | — | — | — | 导入 BOM |

理解 scope 的意义:\`test\` 让测试框架不污染生产包;\`provided\` 用于"运行环境已提供"的库(如 Servlet API,Tomcat 自带,再打一遍会冲突);\`runtime\` 用于编译期不需要、运行期需要的库(如 JDBC 驱动,运行时反射加载)。

### 传递依赖(Transitive Dependency)

你依赖 \`A\`,而 \`A\` 又依赖 \`B\`,那么 \`B\` 会自动成为你的依赖。比如依赖 \`spring-web\`,它会自动把 \`spring-core\`、\`spring-beans\` 拉进来。传递依赖的 scope 会降级传播:A(compile)→B(runtime),则 B 对你降级为 runtime。

### 依赖冲突解决

传递依赖带来冲突问题:你依赖 A 和 C,A 依赖 B:1.0,C 依赖 B:2.0,最终用哪个?Maven 用两条规则:**最短路径优先**(选择离根最近的版本)和**声明优先**(路径相同时,pom 里先声明的胜出)。

### 仓库体系

Maven 的所有构件都存放在仓库里,分三层查找:**本地 → 私服 → 中央**。

1. **本地仓库**:默认 \`~/.m2/repository\`,第一次下载的依赖缓存在这里。
2. **中央仓库**:Maven 社区维护,地址 \`https://repo1.maven.org/maven2/\`。
3. **私服**:公司用 Nexus/Artifactory 搭建的代理仓库,既代理中央又存内部 jar。

国内常配镜像加速,在 \`~/.m2/settings.xml\` 中配阿里云镜像:

\`\`\`xml
<mirror>
    <id>aliyun</id>
    <mirrorOf>central</mirrorOf>
    <url>https://maven.aliyun.com/repository/public</url>
</mirror>
\`\`\`

## 设计原理

### 1. 依赖传递自动化

设计哲学是"声明一次,自动传递"。开发者只需关心直接依赖,传递依赖由 Maven 自动解析。但自动化也带来"黑盒"风险——你可能不知道最终打包了哪些 jar,所以 \`dependency:tree\` 是必备工具。

### 2. scope 隔离不同环境

把"编译期需要"和"运行期需要"分离,避免测试框架污染生产包,避免容器已提供的库重复打包。体现了关注点分离思想。

### 3. 分层仓库设计

本地 → 私服 → 中央的分层设计既保证速度(本地命中最快),又支持团队共享(私服缓存一次全公司复用),还能放私有 jar。

## 使用场景

**场景一:声明多 scope 依赖**——业务依赖用 compile,JDBC 驱动用 runtime,Servlet API 用 provided,测试框架用 test。

**场景二:排查依赖冲突**——\`mvn dependency:tree\` 打印完整依赖树,\`mvn dependency:tree -Dverbose\` 显示被省略的冲突版本。

**场景三:排除不想要的传递依赖**——比如 Spring 默认依赖 commons-logging,你想换成 slf4j,用 \`<exclusions>\` 排掉它。

**场景四:团队私服管理内部 jar**——公司开发的公共工具包通过 \`mvn deploy\` 发布到私服,其他项目依赖即可。

## 代码示例

\`\`\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>

    <!-- dependencyManagement:只声明版本,不实际引入 -->
    <!-- 子模块继承后,写 dependency 时可省略 version -->
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
        <!-- 业务依赖,排除了不想要的 commons-logging -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <!-- version 由上面的 BOM 统一管理,这里不写 -->
            <exclusions>
                <exclusion>
                    <groupId>commons-logging</groupId>
                    <artifactId>commons-logging</artifactId>
                </exclusion>
            </exclusions>
        </dependency>

        <!-- 运行时依赖:JDBC 驱动 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Web 容器提供:不打进 war -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>4.0.1</version>
            <scope>provided</scope>
        </dependency>

        <!-- 测试依赖:仅测试期可见 -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
\`\`\`

逐行说明:\`<dependencyManagement>\` 只登记版本不实际引入,子模块引用时省略 version;\`<scope>import</scope>\` + \`<type>pom</type>\` 导入 BOM,保证一组配套依赖版本兼容;\`<exclusions>\` 排除传递依赖,只对当前路径生效;\`runtime\` scope 让 JDBC 驱动编译期不可见但运行期可用。

## 对比分析

### scope 详细对比

| scope | 何时可见 | 是否打包 | 典型依赖 | 传递性 |
| --- | --- | --- | --- | --- |
| compile | 编译+测试+运行 | 是 | spring-core | 强传递 |
| test | 仅测试 | 否 | junit | 不传递 |
| provided | 编译+测试 | 否 | servlet-api | 不传递 |
| runtime | 测试+运行 | 是 | jdbc 驱动 | 弱传递 |
| system | 编译+测试 | 否 | 本地 jar | 不传递 |
| import | - | - | BOM | 仅版本管理 |

### 依赖冲突解决规则对比

| 规则 | 触发条件 | 胜出者 |
| --- | --- | --- |
| 最短路径优先 | 多条路径引同一 artifact 不同版本 | 路径最短的版本 |
| 声明优先 | 路径长度相同 | pom 中先声明的版本 |
| 显式声明优先 | 自己直接声明了该依赖 | 直接声明的版本(路径为 1) |

### dependencyManagement vs dependencies

| 维度 | dependencyManagement | dependencies |
| --- | --- | --- |
| 是否实际引入依赖 | 否,只登记版本 | 是,会下载并打包 |
| 子模块是否自动有 | 否,要自己声明才引入 | 是,自动继承 |
| 是否可省略 version | 子模块引用时可省 | 不能省略 version |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| NoSuchMethodError 运行时报错 | 依赖冲突,编译期和运行期版本不一致 | 用 \`dependency:tree -Dverbose\` 找冲突,加 exclusions 锁版本 |
| 测试框架被打进生产 jar | scope 写成了 compile | 测试依赖必须 \`<scope>test</scope>\` |
| war 包里多了 servlet-api | scope 没写 provided | servlet-api 用 \`<scope>provided</scope>\` |
| 依赖下不动 | 公司内网或中央慢 | 配阿里云镜像或私服 |
| exclusions 写错位置 | 写在 dependencyManagement 里没生效 | exclusions 必须写在真正引入依赖的 \`<dependency>\` 里 |
| SNAPSHOT 上生产 | 远程随时覆盖,构建不可重现 | 生产用 release 版本号,CI 禁止 SNAPSHOT |
| dependency:tree 看不全 | 默认只显示实际生效的版本 | 加 \`-Dverbose\` 看被省略的冲突版本 |
`,
  },

  // =========================================================
  // jw-19:生命周期与插件
  // =========================================================
  {
    id: "jw-19",
    group: "Maven 与构建工具",
    icon: "⚙️",
    title: "生命周期与插件",
    content: `# 生命周期与插件

## 概念解释

生命周期(Lifecycle)是 Maven 区别于 Ant 的核心特性。Maven 内置了**三套相互独立的生命周期**:

1. **clean 生命周期**:清理项目,含 \`pre-clean\`、\`clean\`、\`post-clean\` 三个阶段。
2. **default 生命周期**:项目构建的主力,含 \`validate→compile→test→package→...→install→deploy\` 等约 23 个阶段。
3. **site 生命周期**:生成项目站点文档。

每套生命周期内的**阶段(phase)是有顺序的**——执行后面的阶段会自动执行前面所有阶段。比如执行 \`mvn package\`,会依次执行 \`compile→test→package\`,你不用手动一条条敲。

### default 生命周期的关键阶段

| 阶段 | 作用 | 绑定的默认插件目标 |
| --- | --- | --- |
| \`validate\` | 校验项目完整性 | - |
| \`compile\` | 编译主源码 \`src/main/java\` | \`compiler:compile\` |
| \`test\` | 运行单元测试 | \`surefire:test\` |
| \`package\` | 打包成 jar/war | \`jar:jar\` / \`war:war\` |
| \`install\` | 安装到本地仓库 | \`install:install\` |
| \`deploy\` | 发布到远程仓库 | \`deploy:deploy\` |

### 阶段与插件目标(Goal)的绑定

生命周期只是"流程框架",真正的活儿是**插件**干的。每个阶段默认绑定一个插件目标(goal)。比如 \`compile\` 阶段绑定 \`maven-compiler-plugin\` 的 \`compile\` 目标。执行 \`mvn compile\` 时,Maven 实际调用 \`compiler:compile\` 来编译。

你也可以直接执行某个 goal,比如 \`mvn dependency:tree\`、\`mvn surefire:test\`。这种不经过阶段、直接调插件的方式在排查问题时很常用。

### 常用插件

| 插件 | 作用 | 常用 goal |
| --- | --- | --- |
| \`maven-compiler-plugin\` | 编译 Java 源码 | compile |
| \`maven-surefire-plugin\` | 运行单元测试 | test |
| \`maven-jar-plugin\` | 打 jar 包 | jar |
| \`maven-war-plugin\` | 打 war 包 | war |
| \`maven-shade-plugin\` | 打胖 jar(含依赖) | shade |
| \`maven-assembly-plugin\` | 自定义打包格式 | assembly |
| \`maven-source-plugin\` | 打源码 jar | jar-no-fork |

## 设计原理

### 1. 生命周期的线性与原子性

阶段是线性递进的,执行后阶段必然先执行前阶段。这种"线性不可跳"的设计让构建行为可预测——你不会遇到"测试了但没编译"的诡异情况。每个阶段是原子的,失败即停止,不会继续往后执行破坏产物。

### 2. 插件化扩展

生命周期本身不知道怎么编译、怎么测试,它只定义"什么时候做"。具体怎么做交给插件,通过 goal 绑定。这种解耦让 Maven 可以通过替换插件支持新语言、新打包格式,而不用改生命周期框架。

### 3. 默认绑定与可覆盖

每个阶段有默认绑定的插件 goal,但开发者可以覆盖。比如可以在 \`package\` 阶段额外绑定 \`shade:shade\` 来打胖 jar,或自定义插件执行。这种"默认 + 可覆盖"的设计兼顾了开箱即用和灵活定制。

## 使用场景

**场景一:常用构建命令**

\`\`\`bash
mvn clean install          # 清理后重新编译、测试、打包、装到本地仓库
mvn clean package          # 只打包,不装到本地仓库
mvn clean deploy           # 发布到远程仓库
mvn clean install -DskipTests  # 跳过测试快速打包
\`\`\`

**场景二:只执行某个 goal**——\`mvn dependency:tree\` 查看依赖树,\`mvn versions:display-dependency-updates\` 检查依赖更新。

**场景三:自定义插件配置**——配置编译器插件指定 JDK 版本,配置 surefire 跳过某些测试。

**场景四:绑定自定义 goal 到阶段**——把 \`shade:shade\` 绑定到 \`package\` 阶段,打包含所有依赖的胖 jar。

## 代码示例

\`\`\`xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <build>
        <plugins>
            <!-- 编译器插件:指定 JDK 版本 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>\${maven.compiler.source}</source>
                    <target>\${maven.compiler.target}</target>
                    <encoding>\${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>

            <!-- 测试插件:配置 JUnit 5 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.1.2</version>
                <configuration>
                    <parallel>methods</parallel>
                    <threadCount>4</threadCount>
                </configuration>
            </plugin>

            <!-- 打胖 jar:把所有依赖打进一个 jar -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.1</version>
                <executions>
                    <execution>
                        <phase>package</phase>      <!-- 绑定到 package 阶段 -->
                        <goals>
                            <goal>shade</goal>      <!-- 执行 shade 目标 -->
                        </goals>
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
        </plugins>
    </build>
</project>
\`\`\`

逐行说明:\`maven-compiler-plugin\` 的 \`<source>/<target>\` 指定编译和运行的 JDK 字节码版本;\`maven-surefire-plugin\` 配置测试并行执行加速;\`maven-shade-plugin\` 的 \`<execution>\` 把 \`shade\` goal 绑定到 \`package\` 阶段,打包含所有依赖的胖 jar,\`<mainClass>\` 指定 jar 的主类让 \`java -jar\` 可运行。

## 对比分析

### 阶段(Phase)vs 目标(Goal)

| 维度 | 阶段(Phase) | 目标(Goal) |
| --- | --- | --- |
| 本质 | 生命周期的步骤 | 插件的具体操作 |
| 执行方式 | \`mvn phase\`(会执行前面所有阶段) | \`mvn plugin:goal\`(只执行该 goal) |
| 是否有顺序 | 有,线性递进 | 无,独立执行 |
| 是否可绑定 | 每个阶段可绑定 goal | 一个 goal 可绑定到任意阶段 |

### 三套生命周期对比

| 生命周期 | 作用 | 关键阶段 | 触发命令 |
| --- | --- | --- | --- |
| clean | 清理 | clean | mvn clean |
| default | 构建 | compile/test/package/install/deploy | mvn package |
| site | 文档 | site | mvn site |

### 常用打包插件对比

| 插件 | 产物 | 特点 |
| --- | --- | --- |
| maven-jar-plugin | xxx.jar | 只含项目自身 class |
| maven-war-plugin | xxx.war | Web 应用,含 WEB-INF |
| maven-shade-plugin | xxx-shaded.jar | 胖 jar,含所有依赖 |
| maven-assembly-plugin | xxx-bin.zip | 自定义格式,可含脚本 |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 混淆阶段和 goal | 以为 \`mvn compile\` 和 \`mvn compiler:compile\` 不同 | 效果类似,但阶段会触发前置阶段,goal 不会 |
| 插件版本没指定 | 用了默认旧版本,行为不一致 | 显式声明 \`<version>\` 锁定版本 |
| shade 打包后丢失配置文件 | 资源被覆盖 | 用 \`<transformers>\` 合并 META-INF/services |
| surefire 不识别 JUnit 5 | 默认只支持 JUnit 4 | 升级 surefire 到 3.x,加 \`junit-platform-engine\` 依赖 |
| phase 绑定不生效 | execution 配置写错 | 检查 \`<phase>\` 和 \`<goal>\` 是否正确 |
| 测试不跑 | 类名不以 Test 结尾 | surefire 默认匹配 \`*Test\`,改类名或配 \`<includes>\` |
| deploy 失败 | 没配 \`distributionManagement\` | 在 pom 中配 \`<distributionManagement><repository>\` |
| 插件配置不生效 | 写在了 \`<pluginManagement>\` 里 | \`pluginManagement\` 只声明版本,\`<plugins>\` 才实际应用 |
`,
  },

  // =========================================================
  // jw-20:多模块项目与 Gradle 对比
  // =========================================================
  {
    id: "jw-20",
    group: "Maven 与构建工具",
    icon: "🔧",
    title: "多模块项目与 Gradle 对比",
    content: `# 多模块项目与 Gradle 对比

## 概念解释

### Maven 多模块项目

随着项目规模增长,把所有代码塞进一个 Maven 项目会越来越难维护:编译变慢、职责混乱、无法独立复用。**多模块(Multi-Module)项目**就是按职责拆成多个 Maven 模块,每个模块有自己的 \`pom.xml\`,通过一个**父 pom** 聚合在一起统一管理。

父 pom 的 \`<packaging>\` 是 \`pom\`,通过 \`<modules>\` 列出所有子模块:

\`\`\`xml
<packaging>pom</packaging>
<modules>
    <module>common</module>
    <module>domain</module>
    <module>web</module>
</modules>
\`\`\`

### 聚合 vs 继承

- **聚合(Aggregation)**:父 pom 通过 \`<modules>\` 把子模块"拢"在一起,一次构建所有子模块。这是**构建层面**的聚合。
- **继承(Inheritance)**:子模块通过 \`<parent>\` 声明父 pom,继承其 properties、dependencyManagement 等配置。这是**配置层面**的继承。

二者通常一起用——既聚合又继承。

### BOM(Bill of Materials)

BOM 是一种特殊的 pom,里面只有一个 \`<dependencyManagement>\` 块,列出"版本配套"的依赖。它本身不含代码,纯版本清单。导入后所有配套依赖都不用写 version,保证版本兼容性。

### Gradle 基础

**Gradle** 是新一代构建工具,用 Groovy/Kotlin DSL 写构建脚本。两个标志性特性:**增量构建**(只编译改动过的文件)和**守护进程**(常驻内存避免启动开销)。Gradle 是 Android 官方构建工具,Spring Boot 自身也用它。

\`\`\`groovy
plugins { id 'java' }
group = 'com.example'
version = '1.0-SNAPSHOT'
repositories { mavenCentral() }
dependencies {
    implementation 'org.springframework:spring-core:5.3.30'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}
\`\`\`

Gradle 用 \`implementation\` 代替 Maven 的 \`compile\`,且区分 \`implementation\`(不暴露给上游)和 \`api\`(暴露给上游),这能减少上游重新编译的范围。

## 设计原理

### 1. 单一职责拆分(Maven)

模块拆分依据是职责,不是文件多少。常见拆法:\`common\`(工具)、\`domain\`(领域模型)、\`repository\`(数据访问)、\`service\`(业务逻辑)、\`web\`(控制器)。依赖关系单向:web→service→repository→domain→common。避免循环依赖。

### 2. 配置集中管控(Maven)

所有版本号集中在父 pom 的 \`<properties>\` 和 \`<dependencyManagement>\` 里。子模块只引用不重写版本。升级一个库只改父 pom 一处,全模块生效。

### 3. 增量优先(Gradle)

Gradle 的核心设计目标是"不重复劳动"。每个 task 记录输入输出的指纹,只有输入变了才执行。配合构建缓存和守护进程,构建速度被推到极致。

### 4. 构建脚本即代码(Gradle)

Gradle 用 Groovy/Kotlin 写脚本,构建逻辑可以编程:函数、条件、循环、动态创建 task。代价是构建脚本本身需要维护。

## 使用场景

**场景一:典型分层 Web 项目(Maven)**

\`\`\`
my-project/
├── pom.xml                  # 父 pom (packaging=pom)
├── common/                  # 通用工具
├── domain/                  # 领域模型
├── repository/             # 数据访问
├── service/                 # 业务逻辑
└── web/                     # Web 控制器 + 启动
\`\`\`

依赖方向:web → service → repository → domain → common。

**场景二:只构建改动模块**——\`mvn install -pl web -am\`(-pl 指定模块,-am 带上上游依赖)。

**场景三:Gradle 项目**——\`./gradlew build\` 用 Wrapper 构建保证版本一致;\`./gradlew dependencies\` 查看依赖树。

**场景四:Maven 转 Gradle**——\`gradle init\` 自动把 Maven 项目转成 Gradle。

## 代码示例

### Maven 父 pom

\`\`\`xml
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
\`\`\`

### Maven 子模块 web/pom.xml

\`\`\`xml
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
\`\`\`

### Gradle build.gradle

\`\`\`groovy
plugins {
    id 'java'
    id 'application'
}

group = 'com.example'
version = '1.0-SNAPSHOT'

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenLocal()
    mavenCentral()
    maven { url 'https://maven.aliyun.com/repository/public' }
}

dependencies {
    implementation 'org.springframework:spring-context:5.3.30'
    implementation 'mysql:mysql-connector-java:8.0.33'
    compileOnly 'javax.servlet:javax.servlet-api:4.0.1'
    testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'
}

test { useJUnitPlatform() }

application { mainClass = 'com.example.Main' }

jar {
    manifest { attributes 'Main-Class': 'com.example.Main' }
}
\`\`\`

逐行说明:父 pom 的 \`<packaging>pom</packaging>\` 标记聚合父项目;\`<dependencyManagement>\` 声明 spring-context 版本,子模块引用时省略 version;子模块 \`<parent>\` 继承父 pom,省略 groupId 和 version;\`\${project.version}\` 引用当前 pom 的 version;Gradle 的 \`implementation\` 不暴露给上游,\`compileOnly\` 等价 provided scope;\`application\` 插件提供 \`run\` 任务直接执行 main 方法。

## 对比分析

### Maven 多模块 vs Gradle 多模块

| 维度 | Maven | Gradle |
| --- | --- | --- |
| 模块声明 | 父 pom 的 \`<modules>\` | settings.gradle 的 \`include\` |
| 配置复用 | \`<parent>\` 继承 | \`apply from\` 或 convention 插件 |
| 版本管控 | dependencyManagement | platform / version catalog |
| 增量构建 | 不支持 | 支持 |
| 构建速度 | 慢(全量) | 快(增量+缓存) |
| 学习曲线 | 中 | 中高 |

### Gradle configuration vs Maven scope

| Gradle configuration | 作用 | Maven scope | 是否暴露上游 |
| --- | --- | --- | --- |
| implementation | 主源码依赖,不暴露 | compile | 否 |
| api | 主源码依赖,暴露给上游 | compile | 是 |
| compileOnly | 仅编译期 | provided | - |
| runtimeOnly | 仅运行期 | runtime | - |
| testImplementation | 测试主源码 | test | - |

### 聚合 vs 继承

| 维度 | 聚合 | 继承 |
| --- | --- | --- |
| 解决什么问题 | 批量构建多个模块 | 复用 pom 配置 |
| 配置标签 | \`<modules>\`(父 pom) | \`<parent>\`(子 pom) |
| 方向 | 父→子(父列出子) | 子→父(子声明父) |
| 是否可单独用 | 可(只聚合不继承) | 可(只继承不聚合) |

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
| --- | --- | --- |
| 循环依赖 | A 依赖 B,B 又依赖 A | 重新划分模块边界,引入接口模块解耦 |
| 版本号不一致 | 各模块各写各的 version | 用父 pom 的 dependencyManagement 统一 |
| 构建顺序错乱 | 子模块依赖了未构建的模块 | 靠反应堆自动排序,或调整 modules 顺序 |
| 父 pom 没装到本地仓库 | 子模块构建时报找不到父 pom | 先 \`mvn install -N\` 装父 pom(-N 不构建子模块) |
| Gradle 用 api 代替 implementation | 上游被迫重新编译,构建变慢 | 仅库的公开 API 依赖用 api,其余用 implementation |
| Gradle 忘记用 wrapper | 不同机器 Gradle 版本不一致 | 提交 \`gradlew\` 和 \`gradle-wrapper.jar\` 到 Git |
| Gradle 守护进程内存泄漏 | 长期运行的 daemon 占用大内存 | \`gradle --stop\` 重启 daemon |
| BOM 导入位置错 | 写在 dependencies 里没生效 | BOM 必须写在 dependencyManagement 里且 \`<scope>import</scope>\` |
`,
  },
];
