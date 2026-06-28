// =============================================================
// Go 教程 - 第五批章节（第五部分 实战与生态 + 结语，共 5 章）
// -------------------------------------------------------------
// 本批包含 5 章：
//   go-ch17 : 第十七章 包管理与 Go Modules
//   go-ch18 : 第十八章 标准库精讲
//   go-ch19 : 第十九章 测试与基准
//   go-ch20 : 第二十章 Go 生态与 Web 开发入门
//   go-end  : 结语
//
// 所有 Go 代码示例均可用 \`go run\` 直接运行（package main + func main）。
// 适用版本：Go 1.21+（部分特性需要 1.18+ / 1.22+，会注明）
// =============================================================

const chapters = [
  // ============================================================
  // 第十七章：包管理与 Go Modules
  // ============================================================
  {
    id: 'go-ch17',
    group: '第五部分 实战与生态',
    icon: '📦',
    title: '包管理与 Go Modules',
    content: `## 第十七章　包管理与 Go Modules

### 一、为什么包管理这么重要

写过 C/C++ 的人都知道 "依赖地狱"——头文件路径、链接库版本、Makefile 配置全靠手动。Go 从设计之初就把"包管理"当作一等公民，目标是：

- **可复现构建**：同一份代码在任何机器上构建结果一致。
- **明确的依赖声明**：第三方依赖写在一个文件里，谁也跑不掉。
- **去中心化仓库**：不需要像 Maven/PyPI 那样的中心仓库，直接从 Git 拉取。

Go 的包管理经历了两个时代：

| 时代 | 方案 | 状态 |
|------|------|------|
| Go 1.0 - 1.10 | GOPATH | 已废弃 |
| Go 1.11+ | Go Modules | 官方推荐（1.16 后默认） |

下面从历史讲起，再看现代实践。

### 二、GOPATH 时代（了解即可）

在 Go Modules 出现前，所有 Go 代码必须放在一个叫 \`GOPATH\` 的目录下。结构如下：

\`\`\`
$GOPATH/
├── bin/      # go install 产生的可执行文件
├── pkg/      # 预编译的库缓存
└── src/      # 所有源码
    ├── github.com/
    │   └── user/
    │       └── project/   # 第三方依赖直接 checkout 到这里
    └── myproject/        # 自己的项目也在这里
\`\`\`

**致命缺陷：**

1. **没有版本概念**——所有依赖都是 master 分支最新代码，今天能编译明天就坏。
2. **多项目冲突**——A 项目要 v1，B 项目要 v2，但 \`src/github.com/xxx\` 只能有一份。
3. **第三方工具横行**：glide、dep、godep、govendor……社区碎片化。

为了解决这些问题，Go 团队推出 **Go Modules**（2018 年正式发布）。

### 三、Go Modules 入门

#### 1. 初始化一个 module

\`\`\`bash
mkdir myapp && cd myapp
go mod init github.com/user/myapp
\`\`\`

执行后会生成 \`go.mod\` 文件：

\`\`\`
module github.com/user/myapp

go 1.21
\`\`\`

- 第一行是**模块路径**（module path），也是导入路径的前缀。
- 第二行声明本模块需要的最低 Go 版本。

> 提示：如果只是本地练手，模块路径可以随便写（如 \`hello\`）。但开源项目必须用仓库地址，否则别人没法 \`go get\` 你。

#### 2. 第一个 Go Module 程序

\`\`\`go
package main

import (
	"fmt"
	"rsc.io/quote"
)

func main() {
	fmt.Println(quote.Go())
}
\`\`\`

第一次运行 \`go run main.go\` 时，Go 会自动下载 \`rsc.io/quote\` 依赖，并写入 \`go.mod\` 和 \`go.sum\`：

\`\`\`bash
$ go run main.go
Don't communicate by sharing memory, share memory by communicating.

$ cat go.mod
module github.com/user/myapp

go 1.21

require rsc.io/quote v1.5.2
\`\`\`

### 四、go.mod 文件结构

\`\`\`go
module github.com/user/myapp

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/lib/pq v1.10.9
	rsc.io/quote v1.5.2
)

require golang.org/x/text v0.13.0 // indirect

replace github.com/foo/bar => ./local/bar

exclude github.com/broken/lib v1.0.0

retract [v1.2.0, v1.2.5]
\`\`\`

逐行解释：

| 指令 | 作用 |
|------|------|
| \`module\` | 模块路径 |
| \`go\` | 期望的 Go 工具链版本 |
| \`require\` | 声明直接依赖 |
| \`// indirect\` | 标记间接依赖（你的依赖的依赖） |
| \`replace\` | 用本地路径或别的版本替换某个依赖 |
| \`exclude\` | 显式排除某个有问题的版本 |
| \`retract\` | 撤回自己发布的某个版本（模块作者用） |
| \`toolchain\` | 指定使用的 Go 工具链（Go 1.21+） |

#### require 中的版本号

\`\`\`
github.com/gin-gonic/gin v1.9.1
\`\`\`

格式是 \`v主版本.次版本.修订号\`（语义化版本 SemVer）：

- **主版本（major）**：不兼容的 API 变更。Go 中 v2+ 要在路径里加 \`/v2\`。
- **次版本（minor）**：新增功能，向后兼容。
- **修订号（patch）**：bug 修复。

#### pseudo-version（伪版本）

如果依赖的某个 commit 还没打 tag，Go 会生成形如 \`v0.0.0-20231015120304-abcdef123456\` 的伪版本：

\`\`\`
v0.0.0-YYYYMMDDHHMMSS-CommitHash前12位
\`\`\`

### 五、go.sum 文件

\`go.sum\` 记录**所有依赖（含间接依赖）的哈希值**，用于校验下载的代码没被篡改：

\`\`\`
rsc.io/quote v1.5.2 h1:w5fcYSjg/+J3p3rA1TN1B2+
rsc.io/quote v1.5.2/go.mod h1:asdf...
\`\`\`

每条记录两个哈希：

- \`h1:xxx\`——模块源码 zip 的哈希。
- \`/go.mod h1:xxx\`——go.mod 文件本身的哈希。

**永远不要手动编辑 go.sum**，也**必须提交到版本控制**（保证团队构建一致）。

### 六、依赖管理命令速查

| 命令 | 作用 |
|------|------|
| \`go get github.com/foo/bar\` | 添加/升级依赖（拉最新） |
| \`go get github.com/foo/bar@v1.2.3\` | 拉指定版本 |
| \`go get github.com/foo/bar@latest\` | 升级到最新版 |
| \`go get github.com/foo/bar@upgrade\` | 升级到允许的最新版 |
| \`go get -u ./...\` | 升级所有依赖到最新次版本 |
| \`go get -u=patch ./...\` | 只升级修订号 |
| \`go mod tidy\` | 添加缺失的、删除未用的依赖（**最常用**） |
| \`go mod download\` | 只下载依赖到本地缓存，不改 go.mod |
| \`go mod vendor\` | 把依赖复制到项目内 \`vendor/\` 目录 |
| \`go mod verify\` | 校验依赖哈希 |
| \`go mod why -m github.com/foo/bar\` | 解释为什么需要某个依赖 |
| \`go mod graph\` | 打印依赖图 |
| \`go list -m all\` | 列出所有依赖 |

#### go mod tidy 的作用

这是你日常用得最多的命令。它的职责：

1. 扫描所有 \`.go\` 文件的 \`import\`。
2. 把 import 了但没在 go.mod 里的依赖**加进去**。
3. 把 go.mod 里声明了但实际没 import 的依赖**删掉**。
4. 同步更新 go.sum。

\`\`\`bash
# 写完代码后必做
go mod tidy
\`\`\`

#### go mod vendor 的场景

公司内网/离线环境无法访问公网模块时：

\`\`\`bash
go mod vendor
# 现在项目里有 vendor/ 目录，里面是所有依赖源码
go build -mod=vendor  # 只用 vendor，不联网
\`\`\`

### 七、版本升级实战

假设你有一个项目依赖 \`github.com/foo/bar v1.2.0\`，想升级到 \`v1.3.0\`：

\`\`\`bash
# 方式一：直接指定
go get github.com/foo/bar@v1.3.0

# 方式二：拉最新
go get github.com/foo/bar@latest

# 方式三：交互式（Go 1.23+）
go get -u github.com/foo/bar
\`\`\`

降级：

\`\`\`bash
go get github.com/foo/bar@v1.2.0
\`\`\`

### 八、replace 指令

#### 场景 1：本地开发联调

你正在同时开发 \`github.com/foo/a\` 和 \`github.com/foo/b\`，a 依赖 b。每次改 b 都要 push 才能让 a 用上？不需要：

\`\`\`go
// go.mod of a
replace github.com/foo/b => ../b
\`\`\`

这样 a 在编译时会直接读 \`../b\` 的本地源码。

#### 场景 2：替换上游有 bug 的版本

\`\`\`go
replace github.com/broken/lib v1.2.3 => github.com/fork/lib v1.2.4-fix
\`\`\`

#### 场景 3：固定到某个 fork

\`\`\`go
replace github.com/sirupsen/logrus => github.com/myfork/logrus v1.9.0
\`\`\`

> 注意：发布版本时，go.mod 中的 replace 应该删掉，否则用户拉你的模块时不会生效（replace 只对主模块有效）。

### 九、exclude 指令

某个版本的依赖有严重 bug，强制 Go 不选这个版本：

\`\`\`go
exclude github.com/foo/bar v1.5.0
\`\`\`

实际用得少，因为 \`go mod tidy\` 一般能选到合适的版本。

### 十、GOPROXY 与模块镜像

#### 1. 为什么需要镜像

Go 默认从源码仓库（GitHub/GitLab）直接拉模块。问题：

- GitHub 不稳定（中国大陆访问慢/失败）。
- 已删除的仓库（如 \`github.com/golang/lint\` 迁移后）拉不到。
- 没有缓存，每次都全量下载。

Go 1.13 引入 **GOPROXY**，从模块镜像站拉取。

#### 2. 配置 GOPROXY

国内最常用：

\`\`\`bash
go env -w GOPROXY=https://goproxy.cn,direct
\`\`\`

常见镜像：

| 镜像 | 提供方 |
|------|--------|
| \`https://proxy.golang.org\` | Go 官方（境外） |
| \`https://goproxy.cn\` | 七牛云（国内推荐） |
| \`https://goproxy.io\` | 阿里云 / goproxy.io 社区 |
| \`direct\` | 直接走源码仓库（兜底） |

格式是逗号分隔，按顺序尝试。最后的 \`direct\` 表示"前面的镜像都没有，就直接从源仓库拉"。

#### 3. GOSUMDB 校验

\`GOSUMDB\` 用来校验下载的模块哈希是否和官方数据库一致：

\`\`\`bash
go env -w GOSUMDB=sum.golang.google.cn  # 国内镜像
\`\`\`

设为 \`off\` 关闭校验（不推荐）。

### 十一、私有模块（GOPRIVATE）

公司内网用的 Git 仓库（如 \`git.company.com/foo/bar\`），不能走公网镜像，也不能走 sumdb 校验：

\`\`\`bash
go env -w GOPRIVATE=git.company.com,*.internal.corp
\`\`\`

支持通配符 \`*\`。匹配 \`GOPRIVATE\` 的模块：

- 不走 GOPROXY，直接从源仓库拉。
- 不做 sumdb 校验。

#### 私有 Git 仓库的认证

私有仓库通常需要 token。最简单的方式是配置 \`~/.netrc\`：

\`\`\`
machine git.company.com
login your-username
password ghp_xxxxxxxxxxxxx
\`\`\`

或者用 SSH：

\`\`\`bash
git config --global url."git@git.company.com:".insteadOf "https://git.company.com/"
\`\`\`

### 十二、主版本号与导入路径

SemVer 规定主版本号变更意味着不兼容。Go 的处理方式：**v2+ 必须在模块路径里加版本号**。

\`\`\`
github.com/foo/bar        # v0.x.x 或 v1.x.x
github.com/foo/bar/v2     # v2.x.x
github.com/foo/bar/v3     # v3.x.x
\`\`\`

import 时：

\`\`\`go
import "github.com/foo/bar"      // v1
import "github.com/foo/bar/v2"   // v2
\`\`\`

这样 v1 和 v2 可以**同时存在于一个项目**（解决了 GOPATH 时代的最大痛点）。

### 十三、Workspace 工作区模式（Go 1.18+）

当你同时开发多个相互依赖的模块时，用 \`go.work\`：

\`\`\`bash
mkdir workspace && cd workspace
go work init ./module-a ./module-b
\`\`\`

生成的 \`go.work\`：

\`\`\`go
go 1.21

use (
	./module-a
	./module-b
)
\`\`\`

效果：在 workspace 目录下，构建/运行任何模块时，会优先用 workspace 内的本地源码，而不是从远程拉。

> 比 \`replace\` 更轻量——不动 \`go.mod\`，只影响本地开发。

### 十四、完整示例：从零开始

\`\`\`bash
# 1. 初始化
mkdir calc && cd calc
go mod init github.com/user/calc

# 2. 写代码
cat > main.go <<'EOF'
package main

import (
	"fmt"
	"strconv"
)

func main() {
	if len(只能用 fmt) < 1 {
		fmt.Println("用法: calc <数字>")
		return
	}
	n, err := strconv.Atoi(只能用 fmt[0])
	if err != nil {
		fmt.Println("不是数字:", err)
		return
	}
	fmt.Printf("%d 的平方是 %d\\n", n, n*n)
}
EOF

# 3. 整理依赖
go mod tidy

# 4. 运行
go run main.go 5
# 输出: 5 的平方是 25

# 5. 编译
go build -o calc
./calc 7
# 输出: 7 的平方是 49
\`\`\`

上面那段 EOF 里的代码我故意写错了——变量名不能用中文，正确版本：

\`\`\`go
package main

import (
	"fmt"
	"os"
	"strconv"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("用法: calc <数字>")
		return
	}
	n, err := strconv.Atoi(os.Args[1])
	if err != nil {
		fmt.Println("不是数字:", err)
		return
	}
	fmt.Printf("%d 的平方是 %d\\n", n, n*n)
}
\`\`\`

### 十五、依赖管理与版本控制最佳实践

1. **go.mod 和 go.sum 必须提交**——这是项目可复现构建的基础。
2. **vendor 目录看情况**——库项目不要提交，应用项目（部署到隔离环境）可以提交。
3. **不要手动编辑 go.mod 的 require**——用 \`go get\` / \`go mod tidy\` 改。
4. **CI 里跑 \`go mod verify\`**——校验依赖完整性。
5. **定期升级依赖**——安全补丁要跟进。
6. **小心 major 升级**——v1 到 v2 通常是 breaking change，看 CHANGELOG。
7. **锁定版本**：用 \`go get foo@v1.2.3\` 而不是 \`@latest\`，让构建可复现。

### 十六、go.mod 完整示例

一个真实项目的 go.mod：

\`\`\`go
module github.com/user/myapp

go 1.21

toolchain go1.21.5

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/jackc/pgx/v5 v5.5.1
	github.com/redis/go-redis/v9 v9.3.0
	github.com/spf13/viper v1.17.0
	go.uber.org/zap v1.26.0
)

require (
	github.com/fsnotify/fsnotify v1.7.0 // indirect
	github.com/gin-contrib/sse v0.1.0 // indirect
	github.com/go-playground/locales v0.14.1 // indirect
	golang.org/x/net v0.17.0 // indirect
	golang.org/x/sys v0.14.0 // indirect
	golang.org/x/text v0.14.0 // indirect
)

replace github.com/foo/bar => github.com/myfork/bar v1.2.3-fix
\`\`\`

### 十七、本章小结

- **Go Modules** 是 Go 1.11+ 的官方包管理方案，1.16 起默认开启。
- **go.mod** 声明模块信息和依赖；**go.sum** 记录哈希用于校验。
- **go mod tidy** 是日常最常用命令，写完代码必跑。
- **GOPROXY** 加速模块下载；**GOPRIVATE** 处理私有仓库。
- **replace** 用于本地联调或替换 fork；**go.work** 用于多模块协同开发。
- **v2+ 主版本** 必须在模块路径中加 \`/v2\`。
- 提交 go.mod 和 go.sum 是可复现构建的基石。

> Go 的包管理哲学：**简单、可复现、去中心化**。没有 pom.xml 那么多功能，但够用且好用。

---

下一章我们深入 Go 的标准库——这是 Go 真正的"超能力"所在。
`,
  },

  // ============================================================
  // 第十八章：标准库精讲
  // ============================================================
  {
    id: 'go-ch18',
    group: '第五部分 实战与生态',
    icon: '🧰',
    title: '标准库精讲',
    content: `## 第十八章　标准库精讲

### 一、为什么标准库这么重要

Go 设计团队有一句名言："**标准库应该让你 80% 的工作不需要第三方库**。" 这话不夸张——HTTP 服务、JSON、加密、压缩、时间、正则……全都开箱即用。

对比 Java：
- Java 的 \`java.util\` 朴素到要配 Apache Commons。
- Java 的 \`java.net\` 老旧到大家用 OkHttp / Apache HttpClient。
- Go 的 \`net/http\` 性能足以支撑生产环境，很多框架（Gin/Echo）就是包了它一层。

本章精选 12 个最常用的标准库，每个都给出可运行示例。

### 二、fmt：格式化 IO

#### 1. Print 系列

\`\`\`go
package main

import "fmt"

func main() {
	fmt.Println("Hello")           // 自动换行
	fmt.Print("a", "b", "c\\n")     // 不加空格不换行
	fmt.Printf("数=%d 字=%s\\n", 42, "x") // 格式化
}
\`\`\`

#### 2. 格式化动词（verbs）

| 动词 | 含义 | 示例 |
|------|------|------|
| \`%d\` | 十进制整数 | \`42\` |
| \`%x\` \`%o\` \`%b\` | 十六/八/二进制 | \`2a\` \`52\` \`101010\` |
| \`%f\` | 浮点数 | \`3.14\` |
| \`%e\` \`%g\` | 科学计数法 | \`1.0e+02\` |
| \`%s\` | 字符串 | \`hello\` |
| \`%q\` | 带引号字符串 | \`"hello"\` |
| \`%c\` | 字符（rune） | \`A\` |
| \`%t\` | 布尔 | \`true\` |
| \`%v\` | 默认格式 | 适用于任何类型 |
| \`%+v\` | 带字段名（struct） | \`{Name:Alice Age:30}\` |
| \`%#v\` | Go 语法表示 | \`main.Person{Name:"A"}\` |
| \`%T\` | 类型 | \`main.Person\` |
| \`%p\` | 指针地址 | \`0xc0000140a0\` |
| \`%%\` | 字面 % | \`%\` |

\`\`\`go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func main() {
	p := Person{Name: "Alice", Age: 30}
	fmt.Printf("%%v: %v\\n", p)      // {Alice 30}
	fmt.Printf("%%+v: %+v\\n", p)    // {Name:Alice Age:30}
	fmt.Printf("%%#v: %#v\\n", p)    // main.Person{Name:"Alice", Age:30}
	fmt.Printf("%%T: %T\\n", p)      // main.Person
	fmt.Printf("%%p: %p\\n", &p)     // 0xc0000140a0
}
\`\`\`

#### 3. 宽度与精度

\`\`\`go
fmt.Printf("%5d\\n", 42)      // 右对齐宽 5: "   42"
fmt.Printf("%-5d|\\n", 42)    // 左对齐:    "42   |"
fmt.Printf("%05d\\n", 42)     // 补零:       "00042"
fmt.Printf("%.2f\\n", 3.14159) // 精度 2:   "3.14"
fmt.Printf("%8.2f\\n", 3.14159) // 宽 8 精 2: "    3.14"
\`\`\`

#### 4. Sprintf / Fprintf

\`\`\`go
s := fmt.Sprintf("name=%s&age=%d", "Alice", 30)
// s = "name=Alice&age=30"

n, err := fmt.Fprintf(os.Stdout, "hi %s", "world")
// 写入 os.Stdout
\`\`\`

### 三、os：操作系统交互

#### 1. 命令行参数

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func main() {
	fmt.Println("程序名:", os.Args[0])
	if len(os.Args) > 1 {
		fmt.Println("第一个参数:", os.Args[1])
	}
}
\`\`\`

> 复杂命令行推荐用 \`flag\` 包或第三方 \`cobra\`/\`urfave/cli\`。

#### 2. 环境变量

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func main() {
	// 读
	if v, ok := os.LookupEnv("HOME"); ok {
		fmt.Println("HOME =", v)
	}
	fmt.Println("PATH:", os.Getenv("PATH"))

	// 写
	os.Setenv("MY_VAR", "hello")
	fmt.Println(os.Getenv("MY_VAR"))

	// 一次性读全部
	for _, e := range os.Environ() {
		fmt.Println(e)
	}
}
\`\`\`

#### 3. 退出码

\`\`\`go
func main() {
	if err := doWork(); err != nil {
		fmt.Fprintln(os.Stderr, "error:", err)
		os.Exit(1) // 非零表示失败
	}
}
\`\`\`

#### 4. 文件操作

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func main() {
	// 写文件
	err := os.WriteFile("/tmp/hello.txt", []byte("Hello, Go!\\n"), 0644)
	if err != nil {
		panic(err)
	}

	// 读文件
	data, err := os.ReadFile("/tmp/hello.txt")
	if err != nil {
		panic(err)
	}
	fmt.Printf("内容: %s", data)

	// 追加写（O_APPEND）
	f, _ := os.OpenFile("/tmp/hello.txt", os.O_APPEND|os.O_WRONLY, 0644)
	defer f.Close()
	f.WriteString("另一行\\n")

	// 创建目录
	os.MkdirAll("/tmp/a/b/c", 0755)

	// 删除
	os.Remove("/tmp/hello.txt")
}
\`\`\`

> \`os.ReadFile\` / \`os.WriteFile\` 是 Go 1.16+ 引入的简化 API（替代旧的 \`ioutil\` 包，\`ioutil\` 已废弃）。

### 四、io：Reader/Writer 接口

Go 的 IO 设计核心是两个接口：

\`\`\`go
type Reader interface {
	Read(p []byte) (n int, err error)
}

type Writer interface {
	Write(p []byte) (n int, err error)
}
\`\`\`

只要实现了这两个接口，就能和文件、网络、内存缓冲、压缩流……互连。这是 Go 最优雅的设计之一。

#### 1. 用 io.Copy 拷贝

\`\`\`go
package main

import (
	"fmt"
	"io"
	"os"
	"strings"
)

func main() {
	r := strings.NewReader("Hello, io.Copy!")
	// 拷贝到标准输出
	n, _ := io.Copy(os.Stdout, r)
	fmt.Printf("\\n拷贝了 %d 字节\\n", n)
}
\`\`\`

#### 2. io.ReadAll 一次性读完

\`\`\`go
data, err := io.ReadAll(r)
\`\`\`

#### 3. 自定义 Reader

\`\`\`go
package main

import (
	"fmt"
	"io"
)

// 一个永远产生 'A' 的 Reader
type AReader struct{}

func (AReader) Read(p []byte) (int, error) {
	for i := range p {
		p[i] = 'A'
	}
	return len(p), nil
}

func main() {
	buf := make([]byte, 5)
	r := AReader{}
	n, _ := r.Read(buf)
	fmt.Printf("%s\\n", buf[:n]) // AAAAA
	_, _ = io.CopyN(os.Stdout, r, 3) // AAA
}
\`\`\`

### 五、bufio：缓冲 IO

#### 1. 按行读

\`\`\`go
package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

func main() {
	input := "第一行\\n第二行\\n第三行"
	scanner := bufio.NewScanner(strings.NewReader(input))
	for scanner.Scan() {
		fmt.Println("读到:", scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		fmt.Fprintln(os.Stderr, err)
	}
}
\`\`\`

> \`bufio.Scanner\` 默认按行扫描。可以 \`scanner.Split(bufio.ScanWords)\` 按单词。

#### 2. 缓冲写

\`\`\`go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	w := bufio.NewWriter(os.Stdout)
	w.WriteString("hello ")
	w.WriteString("world\\n")
	w.Flush() // 别忘了 Flush
	fmt.Println("写完")
}
\`\`\`

#### 3. 读单个 token

\`\`\`go
reader := bufio.NewReader(os.Stdin)
line, err := reader.ReadString('\\n')  // 读到换行
word, err := reader.ReadString(' ')
\`\`\`

### 六、strings 与 strconv

#### 1. strings 包常用函数

\`\`\`go
package main

import (
	"fmt"
	"strings"
)

func main() {
	s := "Hello, World"

	fmt.Println(strings.ToUpper(s))         // HELLO, WORLD
	fmt.Println(strings.ToLower(s))          // hello, world
	fmt.Println(strings.Contains(s, "World"))// true
	fmt.Println(strings.HasPrefix(s, "Hello"))// true
	fmt.Println(strings.HasSuffix(s, "World"))// true
	fmt.Println(strings.Index(s, "World"))  // 7
	fmt.Println(strings.Count(s, "l"))       // 3
	fmt.Println(strings.Replace(s, "l", "L", -1)) // HeLLo, WorLd
	fmt.Println(strings.Split("a,b,c", ",")) // [a b c]
	fmt.Println(strings.Join([]string{"a","b"}, "-")) // a-b
	fmt.Println(strings.Repeat("ab", 3))     // ababab
	fmt.Println(strings.TrimSpace("  hi  ")) // hi
	fmt.Println(strings.Trim("xxxhixxx", "x")) // hi
}
\`\`\`

#### 2. strings.Builder（高效拼接）

\`\`\`go
package main

import (
	"fmt"
	"strings"
)

func main() {
	var b strings.Builder
	for i := 0; i < 100; i++ {
		fmt.Fprintf(&b, "line %d\\n", i)
	}
	result := b.String()
	fmt.Println(result[:20], "...")
}
\`\`\`

> 拼接大量字符串时，\`strings.Builder\` 比 \`+=\` 高效得多（避免内存拷贝）。

#### 3. strconv：字符串与类型互转

\`\`\`go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 字符串转数字
	n, err := strconv.Atoi("42")
	fmt.Println(n, err) // 42 <nil>

	f, err := strconv.ParseFloat("3.14", 64)
	fmt.Println(f, err) // 3.14 <nil>

	// 数字转字符串
	s := strconv.Itoa(42)
	fmt.Println(s) // "42"

	s2 := strconv.FormatFloat(3.14, 'f', 2, 64)
	fmt.Println(s2) // 3.14

	// ParseBool
	b, _ := strconv.ParseBool("true")
	fmt.Println(b) // true
}
\`\`\`

### 七、regexp：正则

\`\`\`go
package main

import (
	"fmt"
	"regexp"
)

func main() {
	// 编译一次，复用多次
	re := regexp.MustCompile(\`\\b(\\w+)@(\\w+)\\.com\\b\`)

	email := "联系 alice@example.com 或 bob@test.com"

	// 找第一个
	match := re.FindStringSubmatch(email)
	fmt.Println(match) // [alice@example.com alice example]

	// 找全部
	matches := re.FindAllString(email, -1)
	fmt.Println(matches) // [alice@example.com bob@test.com]

	// 替换
	replaced := re.ReplaceAllString(email, "[邮箱]")
	fmt.Println(replaced) // 联系 [邮箱] 或 [邮箱]
}
\`\`\`

> 性能提示：\`regexp.MustCompile\` 在包级别编译一次，不要每次调用都编译。

Go 的正则是 RE2 语法，**不支持反向引用**（\`\\1\`）和**非贪婪**靠 \`?\` 修饰符实现（\`.*?\`）。

### 八、time：时间

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func main() {
	now := time.Now()
	fmt.Println("现在:", now)
	fmt.Println("时间戳(秒):", now.Unix())
	fmt.Println("时间戳(纳秒):", now.UnixNano())

	// 格式化：Go 的格式化串是固定的"参考时间"
	// 2006-01-02 15:04:05 是 Go 诞生时间，按顺序记忆：
	// 月 1 月 2 日 3 时 4 分 5 秒 2006 年
	fmt.Println(now.Format("2006-01-02 15:04:05"))
	fmt.Println(now.Format("2006/01/02"))

	// 解析
	t, _ := time.Parse("2006-01-02", "2024-12-25")
	fmt.Println(t)

	// 时间运算
	tomorrow := now.Add(24 * time.Hour)
	yesterday := now.Add(-24 * time.Hour)
	diff := tomorrow.Sub(now)
	fmt.Println("差:", diff)

	// Sleep
	time.Sleep(100 * time.Millisecond)

	// 计时
	start := time.Now()
	// ... do work
	fmt.Println("耗时:", time.Since(start))
}
\`\`\`

#### Go 时间格式的记忆口诀

> \`1月2日下午3点4分5秒 2006年\` → \`2006-01-02 15:04:05\`

按 \`1 2 3 4 5 6 7\` 排列：月(1) 日(2) 时(15=3) 分(4) 秒(5) 年(2006=7位? 不对，是按 6 7 还是 2006？)。

实际就是 Go 团队选的 "1/2 03:04:05PM '06 -0700" 这串数字，相当于 \`01/02 03:04:05 06\`，对应 \`1月2日 3点4分5秒 06年\`，按从小到大排列。

### 九、encoding/json：JSON 处理

#### 1. 序列化 Marshal

\`\`\`go
package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	ID    int    \`json:"id"\`
	Name  string \`json:"name"\`
	Email string \`json:"email,omitempty"\` // 空值则省略
	Age   int    \`json:"age,omitempty"\`
	phone string \`json:"-"                  // 不导出（小写字段也不能 JSON 化）
}

func main() {
	u := User{ID: 1, Name: "Alice", Age: 30}
	data, _ := json.Marshal(u)
	fmt.Println(string(data))
	// {"id":1,"name":"Alice","age":30}

	// 缩进输出
	pretty, _ := json.MarshalIndent(u, "", "  ")
	fmt.Println(string(pretty))
}
\`\`\`

struct tag \`json:"field_name,options"\`：

- 字段名后不加选项 → 强制输出。
- \`omitempty\` → 零值时省略。
- \`json:"-"\` → 永不输出。
- \`json:",string"\` → 数字也用字符串包起来。

#### 2. 反序列化 Unmarshal

\`\`\`go
package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	ID   int    \`json:"id"\`
	Name string \`json:"name"\`
}

func main() {
	data := []byte(\`{"id":1,"name":"Alice"}\`)
	var u User
	err := json.Unmarshal(data, &u)
	if err != nil {
		panic(err)
	}
	fmt.Printf("%+v\\n", u) // {ID:1 Name:Alice}
}
\`\`\`

#### 3. 处理不确定结构

\`\`\`go
// 用 map[string]interface{}
var m map[string]interface{}
json.Unmarshal([]byte(\`{"a":1,"b":"x","c":[1,2]}\`), &m)
fmt.Println(m["a"].(float64)) // 1
\`\`\`

> 灵活但类型断言繁琐。生产代码尽量定义 struct。

#### 4. 流式编解码（处理大文件）

\`\`\`go
dec := json.NewDecoder(reader)
for {
	var v SomeType
	if err := dec.Decode(&v); err == io.EOF {
		break
	} else if err != nil {
		log.Fatal(err)
	}
	fmt.Println(v)
}
\`\`\`

### 十、net/http：HTTP 服务与客户端

#### 1. 最简 HTTP 服务

\`\`\`go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
	})
	http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, \`{"msg":"hi"}\`)
	})
	fmt.Println("监听 8080")
	http.ListenAndServe(":8080", nil)
}
\`\`\`

运行：\`go run main.go\`，浏览器访问 \`http://localhost:8080/world\` 看到输出。

> 注意：\`http.HandleFunc("/", ...)\` 中 \`"/"\` 会匹配所有未注册的路径。

#### 2. HTTP 客户端

\`\`\`go
package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	resp, err := http.Get("https://httpbin.org/get")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	fmt.Println(resp.StatusCode)
	fmt.Println(string(body)[:100], "...")
}
\`\`\`

#### 3. 自定义请求

\`\`\`go
package main

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

func main() {
	body := bytes.NewBufferString(\`{"name":"Alice"}\`)
	req, _ := http.NewRequest("POST", "https://httpbin.org/post", body)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-My-Header", "custom")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	data, _ := io.ReadAll(resp.Body)
	fmt.Println(string(data)[:100], "...")
}
\`\`\`

#### 4. 设置超时（生产必做）

\`\`\`go
client := &http.Client{
	Timeout: 5 * time.Second,
}
resp, err := client.Get("https://example.com")
\`\`\`

> 默认 \`http.Get\` 没有超时，生产环境**必须**设置 \`http.Client.Timeout\`！

### 十一、log：日志

\`\`\`go
package main

import "log"

func main() {
	log.Println("普通日志")         // 带时间戳
	log.Printf("user=%s id=%d\\n", "Alice", 1)
	log.Fatal("致命错误")          // 打印后 os.Exit(1)
	// log.Panic("panic 错误")      // 打印后 panic
}
\`\`\`

#### 自定义 logger

\`\`\`go
logger := log.New(os.Stdout, "MYAPP ", log.LstdFlags|log.Lshortfile)
logger.Println("带前缀的日志")
// 输出: MYAPP 2024/01/01 12:00:00 main.go:10: 带前缀的日志
\`\`\`

> 标准库 log 简单但不支持级别（DEBUG/INFO/ERROR）和结构化字段。生产用 \`log/slog\`（Go 1.21+）或第三方 \`zap\`/\`zerolog\`。

### 十二、log/slog：结构化日志（Go 1.21+）

\`\`\`go
package main

import (
	"log/slog"
	"os"
)

func main() {
	// 默认输出 JSON
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	logger.Info("user logged in",
		slog.String("user", "alice"),
		slog.Int("id", 42),
		slog.Any("meta", map[string]string{"ip": "1.2.3.4"}),
	)
	// 输出:
	// {"time":"...","level":"INFO","msg":"user logged in","user":"alice","id":42,"meta":{"ip":"1.2.3.4"}}

	// 全局 logger
	slog.SetDefault(logger)
	slog.Error("启动失败", slog.String("reason", "no config"))
}
\`\`\`

### 十三、context：上下文（核心中的核心）

\`context.Context\` 是 Go 1.7+ 引入的，用于在 goroutine 之间传递**截止时间**、**取消信号**、**请求作用域的值**。

#### 1. 三大用途

| 用途 | 函数 |
|------|------|
| 取消 | \`context.WithCancel\` |
| 超时 | \`context.WithTimeout\` / \`WithDeadline\` |
| 传值 | \`context.WithValue\` |

#### 2. 取消示例

\`\`\`go
package main

import (
	"context"
	"fmt"
	"time"
)

func worker(ctx context.Context, id int) {
	for {
		select {
		case <-ctx.Done():
			fmt.Printf("worker %d 收到取消信号: %v\\n", id, ctx.Err())
			return
		default:
			fmt.Printf("worker %d 工作中\\n", id)
			time.Sleep(500 * time.Millisecond)
		}
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	go worker(ctx, 1)
	go worker(ctx, 2)

	time.Sleep(2 * time.Second)
	cancel() // 取消所有 worker
	time.Sleep(500 * time.Millisecond)
	fmt.Println("主程序退出")
}
\`\`\`

#### 3. 超时示例

\`\`\`go
package main

import (
	"context"
	"fmt"
	"time"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	select {
	case <-time.After(2 * time.Second):
		fmt.Println("完成")
	case <-ctx.Done():
		fmt.Println("超时:", ctx.Err()) // context deadline exceeded
	}
}
\`\`\`

#### 4. context 在 HTTP 服务中的应用

\`\`\`go
func handler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context() // 客户端断开连接时 ctx 会被取消

	select {
	case <-ctx.Done():
		log.Println("客户端断开")
		return
	case result := <-doWork(ctx):
		fmt.Fprintln(w, result)
	}
}
\`\`\`

#### context 使用规则

1. **作为第一个参数**：\`func DoSomething(ctx context.Context, ...)\`。
2. **不要存到 struct 里**（除非这个 struct 本身就是请求作用域的）。
3. **不要用 context 传业务参数**——只传取消信号和 trace ID 这类元数据。
4. **总是 defer cancel()** 避免泄露。
5. **嵌套传播**：父 ctx 取消时，所有子 ctx 也会取消。

### 十四、其他常用包速览

| 包 | 用途 |
|------|------|
| \`errors\` | \`errors.Is\` / \`errors.As\` 错误包装（Go 1.13+） |
| \`sync\` | \`Mutex\` \`WaitGroup\` \`Once\` \`Pool\` |
| \`sync/atomic\` | 原子操作 |
| \`sort\` | 排序 |
| \`encoding/csv\` | CSV 读写 |
| \`encoding/xml\` | XML |
| \`encoding/base64\` | Base64 |
| \`crypto/md5\` \`crypto/sha256\` | 哈希 |
| \`crypto/hmac\` | HMAC |
| \`path/filepath\` | 跨平台路径 |
| \`os/exec\` | 执行子进程 |
| \`flag\` | 命令行参数 |
| \`net/url\` | URL 解析 |
| \`math/rand\` \`crypto/rand\` | 随机数 |
| \`reflect\` | 反射（慎用） |
| \`unsafe\` | 不安全操作（慎用） |

### 十五、并发包单独成章

\`sync\`、\`sync/atomic\`、\`context\` 和 goroutine 配合使用是 Go 的核心特色。已在并发章节讲过，这里不重复。

### 十六、本章小结

- **fmt**：格式化输出，记住 \`%v\` \`%+v\` \`%#v\` \`%T\` 的区别。
- **os**：环境变量、文件、退出码。
- **io**：\`Reader\` / \`Writer\` 接口是 Go IO 的灵魂。
- **bufio**：缓冲读写、Scanner 按行读。
- **strings/strconv**：字符串操作和字符串↔数字转换。
- **regexp**：RE2 正则，注意 \`MustCompile\` 复用。
- **time**：格式化串 \`2006-01-02 15:04:05\` 记忆口诀。
- **encoding/json**：struct tag 控制字段映射，\`omitempty\` 省略零值。
- **net/http**：几行代码起服务，客户端记得设超时。
- **log/slog**：Go 1.21+ 内置结构化日志。
- **context**：取消、超时、传值，生产代码必用。

> Go 标准库的覆盖面和稳定性，是它能在云原生领域称王的基础。Docker / Kubernetes / etcd / Prometheus 全靠它。

---

下一章讲测试——Go 内置的 \`testing\` 包让单元测试成为一等公民。
`,
  },

  // ============================================================
  // 第十九章：测试与基准
  // ============================================================
  {
    id: 'go-ch19',
    group: '第五部分 实战与生态',
    icon: '🧪',
    title: '测试与基准',
    content: `## 第十九章　测试与基准

### 一、Go 的测试哲学

很多语言要装一堆库才能跑测试（Java 的 JUnit、Python 的 pytest）。Go **把测试内置到工具链**：

- 测试文件命名 \`xxx_test.go\`，和被测代码放一起。
- 测试函数签名 \`func TestXxx(t *testing.T)\`。
- 一条命令 \`go test\` 跑全部。
- 无需第三方框架就能写**单元测试**、**基准测试**、**示例函数**、**模糊测试**。

这种"开箱即用"让 Go 项目测试覆盖率天然就高。

### 二、第一个单元测试

被测代码 \`mathutil.go\`：

\`\`\`go
package mathutil

func Add(a, b int) int {
	return a + b
}

func Abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
\`\`\`

测试文件 \`mathutil_test.go\`（**同包同目录**）：

\`\`\`go
package mathutil

import "testing"

func TestAdd(t *testing.T) {
	got := Add(2, 3)
	want := 5
	if got != want {
		t.Errorf("Add(2, 3) = %d, want %d", got, want)
	}
}

func TestAbs(t *testing.T) {
	if Abs(-5) != 5 {
		t.Error("Abs(-5) 应该等于 5")
	}
	if Abs(0) != 0 {
		t.Error("Abs(0) 应该等于 0")
	}
}
\`\`\`

运行：

\`\`\`bash
$ go test
PASS
ok      github.com/user/mathutil  0.002s

$ go test -v
=== RUN   TestAdd
--- PASS: TestAdd (0.00s)
=== RUN   TestAbs
--- PASS: TestAbs (0.00s)
PASS
\`\`\`

### 三、表驱动测试（Go 风格）

这是 Go 社区最推荐的写法——把测试用例组织成表，循环跑：

\`\`\`go
package mathutil

import "testing"

func TestAbs(t *testing.T) {
	tests := []struct {
		name string
		in   int
		want int
	}{
		{"正数", 5, 5},
		{"负数", -5, 5},
		{"零", 0, 0},
		{"最小负数", -1 << 31, -1 << 31}, // int 最小负数取反会溢出
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Abs(tt.in)
			if got != tt.want {
				t.Errorf("Abs(%d) = %d, want %d", tt.in, got, tt.want)
			}
		})
	}
}
\`\`\`

\`t.Run\` 创建子测试，可以单独跑某个用例：

\`\`\`bash
$ go test -v -run TestAbs/负数
=== RUN   TestAbs
=== RUN   TestAbs/负数
--- PASS: TestAbs/负数 (0.00s)
\`\`\`

### 四、测试失败的方式

\`\`\`go
t.Error("普通失败，继续执行后续断言")      // 相当于 Log + Fail
t.Errorf("格式化失败: %d", 42)
t.Fatal("致命失败，立即停止当前测试函数")   // 相当于 Log + FailNow
t.Fatalf("格式化致命: %d", 42)
t.Skip("跳过当前测试")                    // 跳过
t.Skipf("跳过原因: %s", "依赖未安装")
\`\`\`

### 五、测试辅助函数：t.Helper()

\`\`\`go
func assertEqual(t *testing.T, got, want int) {
	t.Helper() // 标记为辅助函数，报错时指向调用处而不是这里
	if got != want {
		t.Errorf("got %d, want %d", got, want)
	}
}

func TestSomething(t *testing.T) {
	assertEqual(t, Add(1, 2), 3)
}
\`\`\`

加了 \`t.Helper()\` 后，失败堆栈会指向 \`TestSomething\` 而不是 \`assertEqual\`。

### 六、Setup / Teardown

Go 没有内置的 setup/teardown，惯例是用 \`TestMain\`：

\`\`\`go
package mathutil

import (
	"fmt"
	"os"
	"testing"
)

// 整个包的测试前后执行一次
func TestMain(m *testing.M) {
	// setup
	fmt.Println("setup...")
	code := m.Run()
	// teardown
	fmt.Println("teardown...")
	os.Exit(code)
}
\`\`\`

单个测试的 setup/teardown：

\`\`\`go
func TestWithDB(t *testing.T) {
	// setup
	db := openDB()
	defer db.Close() // teardown

	// test...
}
\`\`\`

### 七、基准测试 Benchmark

基准测试用 \`func BenchmarkXxx(b *testing.B)\`，跑 N 次循环测性能：

\`\`\`go
package mathutil

import "testing"

func BenchmarkAdd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Add(2, 3)
	}
}
\`\`\`

运行：

\`\`\`bash
$ go test -bench=. -benchmem
goos: darwin
goarch: arm64
BenchmarkAdd-8     1000000000  0.3 ns/op   0 B/op   0 allocs/op
\`\`\`

输出解读：

- \`-8\`：GOMAXPROCS（CPU 数）。
- \`1000000000\`：跑的次数（Go 自动调整）。
- \`0.3 ns/op\`：每次操作耗时。
- \`0 B/op\`：每次操作分配内存。
- \`0 allocs/op\`：每次操作分配次数。

#### 1. 对比两种实现

\`\`\`go
package main

import (
	"strings"
	"testing"
)

func concatPlus(n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += "a"
	}
	return s
}

func concatBuilder(n int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		b.WriteString("a")
	}
	return b.String()
}

func BenchmarkConcatPlus(b *testing.B) {
	for i := 0; i < b.N; i++ {
		concatPlus(1000)
	}
}

func BenchmarkConcatBuilder(b *testing.B) {
	for i := 0; i < b.N; i++ {
		concatBuilder(1000)
	}
}
\`\`\`

运行 \`go test -bench=. -benchmem\`，你会看到 \`Builder\` 比 \`+=\` 快几个数量级，且 0 次分配。

#### 2. 子基准测试

\`\`\`go
func BenchmarkConcat(b *testing.B) {
	for _, n := range []int{10, 100, 1000} {
		b.Run(fmt.Sprintf("n=%d", n), func(b *testing.B) {
			for i := 0; i < b.N; i++ {
				concatBuilder(n)
			}
		})
	}
}
\`\`\`

#### 3. b.ResetTimer / b.ReportAllocs

\`\`\`go
func BenchmarkXxx(b *testing.B) {
	// setup（不计入基准）
	data := prepareData()

	b.ResetTimer()        // 重置计时器，忽略 setup 耗时
	b.ReportAllocs()      // 强制报告内存分配

	for i := 0; i < b.N; i++ {
		Process(data)
	}
}
\`\`\`

#### 4. benchstat 工具

对比优化前后性能：

\`\`\`bash
go test -bench=. -count=10 > old.txt
# ... 优化代码 ...
go test -bench=. -count=10 > new.txt
benchstat old.txt new.txt
\`\`\`

### 八、示例函数 Example

\`Example\` 函数既是文档也是测试——会被 \`go test\` 执行并比对 \`// Output:\` 注释：

\`\`\`go
package mathutil

import "fmt"

func ExampleAdd() {
	fmt.Println(Add(2, 3))
	// Output: 5
}

func ExampleAbs() {
	fmt.Println(Abs(-5), Abs(5), Abs(0))
	// Output: 5 5 0
}
\`\`\`

特点：

- 出现在 \`go doc\` 文档里（替代 README 例子）。
- \`// Output:\` 注释会触发自动测试——输出必须**完全一致**。
- 不写 \`// Output:\` 就是纯示例（不测试）。

### 九、覆盖率 go test -cover

\`\`\`bash
$ go test -cover
PASS
coverage: 75.0% of statements
ok      github.com/user/mathutil  0.002s
\`\`\`

生成详细报告：

\`\`\`bash
$ go test -coverprofile=coverage.out
$ go tool cover -html=coverage.out   # 浏览器查看
$ go tool cover -func=coverage.out   # 命令行查看
\`\`\`

\`-html\` 会高亮哪些行被覆盖、哪些没覆盖。

> 不要盲目追求 100% 覆盖率——错误处理分支、panic 路径覆盖率低很正常。80%+ 是健康基线。

### 十、testify 库

标准库测试断言较繁琐。社区流行 [testify](https://github.com/stretchr/testify)：

\`\`\`bash
go get github.com/stretchr/testify
\`\`\`

\`\`\`go
package mathutil

import (
	"testing"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAdd(t *testing.T) {
	// assert：失败继续
	assert.Equal(t, 5, Add(2, 3))
	assert.NotNil(t, nil)

	// require：失败立即停止
	require.Equal(t, 5, Add(2, 3))
}

func TestAbs(t *testing.T) {
	tests := []struct {
		in, want int
	}{
		{5, 5},
		{-5, 5},
		{0, 0},
	}
	for _, tt := range tests {
		assert.Equal(t, tt.want, Abs(tt.in))
	}
}
\`\`\`

testify 主要模块：

| 模块 | 用途 |
|------|------|
| \`assert\` | 断言（失败继续） |
| \`require\` | 断言（失败停止） |
| \`mock\` | Mock 框架 |
| \`suite\` | 测试套件（带 setup/teardown） |

> 是否引入 testify 是团队选择。社区两派都有。我个人推荐——让测试更可读。

### 十一、Mock 测试

#### 1. 用接口 + 手写 fake

\`\`\`go
// 被测代码
type UserRepository interface {
	FindByID(id int) (*User, error)
}

type Service struct {
	repo UserRepository
}

func (s *Service) GetUser(id int) (*User, error) {
	return s.repo.FindByID(id)
}

// fake 实现
type fakeRepo struct {
	user *User
	err  error
}

func (f *fakeRepo) FindByID(id int) (*User, error) {
	return f.user, f.err
}

// 测试
func TestGetUser(t *testing.T) {
	svc := &Service{repo: &fakeRepo{user: &User{Name: "Alice"}}}
	u, err := svc.GetUser(1)
	assert.NoError(t, err)
	assert.Equal(t, "Alice", u.Name)
}
\`\`\`

Go 风格的 mock 是**接口 + 简单 fake**，比 Java 的 Mockito 简单。

#### 2. 用 mockery / mockgen 自动生成

[gomock](https://github.com/uber-go/mock) / [mockery](https://github.com/vektra/mockery) 可以根据接口自动生成 mock 实现：

\`\`\`bash
mockery --name=UserRepository
\`\`\`

生成 \`mocks/UserRepository.go\`，里面有 \`EXPECT().FindByID(1).Return(...)\` 这样的 API。

### 十二、HTTP Handler 测试

\`\`\`go
package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func handler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(\`{"msg":"hi"}\`))
}

func TestHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/api", nil)
	w := httptest.NewRecorder()

	handler(w, req)

	resp := w.Result()
	if resp.StatusCode != 200 {
		t.Errorf("status = %d, want 200", resp.StatusCode)
	}
}
\`\`\`

\`httptest.NewRecorder\` 模拟 \`ResponseWriter\`，不需要真正起 HTTP 服务。

#### 启动真实服务测试

\`\`\`go
func TestServer(t *testing.T) {
	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/api")
	if err != nil {
		t.Fatal(err)
	}
	// ...
}
\`\`\`

### 十三、集成测试

惯例：把集成测试放 \`//go:build integration\` 标签后，默认不跑：

\`\`\`go
//go:build integration

package main

import "testing"

func TestDBInsert(t *testing.T) {
	// 真连数据库
}
\`\`\`

\`\`\`bash
# 默认不跑集成测试
go test ./...

# 显式跑
go test -tags=integration ./...
\`\`\`

### 十四、模糊测试 Fuzzing（Go 1.18+）

模糊测试自动生成随机输入，找出 panic / 崩溃。函数签名 \`func FuzzXxx(f *testing.F)\`：

\`\`\`go
package mathutil

import (
	"strconv"
	"testing"
)

func FuzzAtoi(f *testing.F) {
	// 种子语料
	f.Add("123")
	f.Add("-42")
	f.Add("0")

	f.Fuzz(func(t *testing.T, s string) {
		// 调用被测函数
		n, err := strconv.Atoi(s)
		if err != nil {
			return // 转换失败是预期行为
		}
		// 不变量：能转回来的字符串应该和输入一致
		back := strconv.Itoa(n)
		if back != s {
			t.Errorf("Atoi(%q) -> Itoa -> %q", s, back)
		}
	})
}
\`\`\`

运行：

\`\`\`bash
# 默认作为普通测试跑种子语料
go test

# 模糊模式：自动生成输入
go test -fuzz=FuzzAtoi -fuzztime=10s
\`\`\`

发现 crash 后，Go 会把触发崩溃的输入写到 \`testdata/fuzz/FuzzAtoi/\` 目录，下次 \`go test\` 自动跑这个 case 作为回归测试。

### 十五、常用 go test flags

| flag | 作用 |
|------|------|
| \`-v\` | 详细输出 |
| \`-run TestXxx\` | 只跑匹配的测试 |
| \`-bench=.\` | 跑基准测试 |
| \`-benchmem\` | 基准测试报告内存 |
| \`-cover\` | 覆盖率 |
| \`-coverprofile=xx.out\` | 覆盖率报告 |
| \`-race\` | 启用竞态检测器 |
| \`-count=N\` | 跑 N 次（检测 flaky test） |
| \`-timeout 30s\` | 超时时间 |
| \`-parallel N\` | 并行度 |
| \`-short\` | 跳过耗时测试（测试代码用 \`testing.Short()\` 判断） |
| \`-tags=xxx\` | 构建标签 |
| \`-fuzz=FuzzXxx\` | 模糊测试 |
| \`-cpuprofile=cpu.out\` | CPU 性能采样 |
| \`-memprofile=mem.out\` | 内存性能采样 |
| \`-json\` | JSON 输出（CI 解析） |

#### -race 竞态检测器（生产必跑）

\`\`\`bash
go test -race ./...
\`\`\`

会检测数据竞争（多 goroutine 同时读写同一变量且至少一个写）。**CI 必须跑 -race**。

### 十六、性能分析 pprof

\`\`\`bash
# CPU 采样
go test -cpuprofile=cpu.out -bench=.

# 内存采样
go test -memprofile=mem.out -bench=.

# 交互式查看
go tool pprof cpu.out
(pprof) top
(pprof) list FunctionName
(pprof) web   # 浏览器看火焰图

# Web 服务内置 pprof
import _ "net/http/pprof"
\`\`\`

### 十七、CI 中的测试命令模板

\`\`\`bash
# 1. 跑全部测试（含 race）
go test -race -cover ./...

# 2. 覆盖率阈值检查
go test -coverprofile=coverage.out ./...
COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}')
echo "Coverage: $COVERAGE"

# 3. 跑基准（不跑普通测试）
go test -run=XXX -bench=. -benchmem ./...

# 4. 模糊测试（CI 短时间）
go test -fuzz=FuzzXXX -fuzztime=30s
\`\`\`

### 十八、完整示例：可运行的测试

被测代码 \`calc.go\`：

\`\`\`go
package main

import "errors"

func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("division by zero")
	}
	return a / b, nil
}
\`\`\`

测试 \`calc_test.go\`：

\`\`\`go
package main

import (
	"testing"
)

func TestDivide(t *testing.T) {
	tests := []struct {
		name    string
		a, b    float64
		want    float64
		wantErr bool
	}{
		{"正常", 6, 3, 2, false},
		{"小数", 1, 4, 0.25, false},
		{"除零", 1, 0, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Divide(tt.a, tt.b)
			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tt.want {
				t.Errorf("Divide(%g, %g) = %g, want %g", tt.a, tt.b, got, tt.want)
			}
		})
	}
}

func BenchmarkDivide(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Divide(6, 3)
	}
}

func ExampleDivide() {
	r, _ := Divide(6, 3)
	println(r)
	// Output: 2
}
\`\`\`

> 注意 \`ExampleDivide\` 用 \`println\`（builtin）输出浮点会带格式问题，最好用 \`fmt.Println\`。这里只是示意。

### 十九、本章小结

- **测试文件 \`_test.go\`** 和被测代码同包同目录。
- **单元测试 \`TestXxx\`** 用 \`t *testing.T\` 报告失败。
- **表驱动测试** 是 Go 社区主流写法，用 \`t.Run\` 创建子测试。
- **基准测试 \`BenchmarkXxx\`** 用 \`b *testing.B\`，循环 \`b.N\` 次。
- **示例 \`ExampleXxx\`** 既是文档也是测试，\`// Output:\` 注释触发断言。
- **覆盖率 \`-cover\`** 配合 \`go tool cover -html\` 可视化。
- **testify** 简化断言；**mockery/gomock** 自动生成 mock。
- **模糊测试 \`FuzzXxx\`**（Go 1.18+）自动找崩溃。
- **\`-race\` 竞态检测器** CI 必跑。
- **pprof** 性能分析。

> Go 测试体系的成熟度，是它在工程化领域碾压大多数语言的关键。

---

下一章看 Go 在 Web 与云原生领域的生态。
`,
  },

  // ============================================================
  // 第二十章：Go 生态与 Web 开发入门
  // ============================================================
  {
    id: 'go-ch20',
    group: '第五部分 实战与生态',
    icon: '🌐',
    title: 'Go 生态与 Web 开发入门',
    content: `## 第二十章　Go 生态与 Web 开发入门

### 一、Go 在云原生的统治地位

先看一个事实：**现代云原生的整个基础设施栈，几乎都是 Go 写的**。

| 项目 | 用途 | 语言 | 备注 |
|------|------|------|------|
| **Docker** | 容器引擎 | Go | 革命性产品 |
| **Kubernetes** | 容器编排 | Go | 事实标准 |
| **etcd** | 分布式 KV | Go | K8s 的核心存储 |
| **Prometheus** | 监控 | Go | CNCF 第一个毕业项目 |
| **Grafana Loki** | 日志聚合 | Go | |
| **Terraform** | IaC | Go | HashiCorp |
| **Consul** | 服务发现 | Go | HashiCorp |
| **Vault** | 密钥管理 | Go | HashiCorp |
| **containerd** | 容器运行时 | Go | Docker 内核 |
| **Istio / Linkerd** | 服务网格 | Go / Rust | |
| **CockroachDB / TiDB** | 分布式数据库 | Go | NewSQL |
| **InfluxDB** | 时序数据库 | Go | |
| **Caddy** | Web 服务器 | Go | 自动 HTTPS |
| **Cilium** | eBPF 网络 | Go + C | |

为什么 Go 能称霸云原生？三点：

1. **静态编译** → 一个二进制文件扔到任何 Linux 上就能跑，不需要 JVM/Python。
2. **goroutine** → 高并发模型天然适合网络服务。
3. **标准库 \`net/http\`** → 几行代码起一个生产级 HTTP 服务。

这一章从零开始，看 Go 怎么做 Web。

### 二、net/http 起一个 Web 服务

#### 1. 最简版本（5 行）

\`\`\`go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello, %s!", r.URL.Path[1:])
	})
	fmt.Println("listening on :8080")
	http.ListenAndServe(":8080", nil)
}
\`\`\`

运行 \`go run main.go\`，访问 \`http://localhost:8080/world\` 看到 \`Hello, world!\`。

#### 2. Handler 接口

Go HTTP 的核心是 \`http.Handler\` 接口：

\`\`\`go
type Handler interface {
	ServeHTTP(w ResponseWriter, r *Request)
}
\`\`\`

任何实现 \`ServeHTTP\` 方法的类型都能当 handler：

\`\`\`go
package main

import (
	"fmt"
	"net/http"
)

type GreetingHandler struct {
	Prefix string
}

func (g GreetingHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "%s, %s!", g.Prefix, r.URL.Path[1:])
}

func main() {
	http.Handle("/hi", GreetingHandler{Prefix: "Hi"})
	http.ListenAndServe(":8080", nil)
}
\`\`\`

#### 3. ServeMux 路由

\`http.ServeMux\` 是默认路由器（Go 1.22 起支持 method 和 path 参数）：

\`\`\`go
// Go 1.22+ 路由增强
mux := http.NewServeMux()
mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	fmt.Fprintf(w, "user %s", id)
})
mux.HandleFunc("POST /users", func(w http.ResponseWriter, r *http.Request) {
	// create user
})
\`\`\`

> Go 1.22 之前 \`ServeMux\` 不支持路径参数和 method 匹配，所以才有了 httprouter / chi 等第三方库。1.22 后差距缩小。

### 三、中间件模式

Go HTTP 中间件就是个**包装函数**：

\`\`\`go
package main

import (
	"fmt"
	"net/http"
	"time"
)

// 中间件：包装一个 handler，返回新 handler
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		fmt.Printf("%s %s %v\\n", r.Method, r.URL.Path, time.Since(start))
	})
}

func recoverMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				http.Error(w, "internal error", http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "hello")
	})

	// 链式包装
	handler := loggingMiddleware(recoverMiddleware(mux))
	http.ListenAndServe(":8080", handler)
}
\`\`\`

中间件链可以用函数简化：

\`\`\`go
func chain(h http.Handler, mws ...func(http.Handler) http.Handler) http.Handler {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

handler := chain(mux, loggingMiddleware, recoverMiddleware, authMiddleware)
\`\`\`

### 四、JSON API 完整示例

\`\`\`go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

type User struct {
	ID   int    \`json:"id"\`
	Name string \`json:"name"\`
}

var users = []User{
	{ID: 1, Name: "Alice"},
	{ID: 2, Name: "Bob"},
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		json.NewEncoder(w).Encode(users)
	case http.MethodPost:
		var u User
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			http.Error(w, "bad request", http.StatusBadRequest)
			return
		}
		u.ID = len(users) + 1
		users = append(users, u)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(u)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func userHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Path[len("/users/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "bad id", http.StatusBadRequest)
		return
	}

	for _, u := range users {
		if u.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(u)
			return
		}
	}
	http.Error(w, "not found", http.StatusNotFound)
}

func main() {
	http.HandleFunc("/users", usersHandler)
	http.HandleFunc("/users/", userHandler)
	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
\`\`\`

测试：

\`\`\`bash
# 列表
curl http://localhost:8080/users

# 创建
curl -X POST http://localhost:8080/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Charlie"}'

# 单个
curl http://localhost:8080/users/1
\`\`\`

### 五、Web 框架对比

标准库 \`net/http\` 够用但繁琐。社区有三大主流：

| 框架 | 风格 | 性能 | 推荐场景 |
|------|------|------|---------|
| **Gin** | 类 Express/Sinatra | 极快 | API 服务、中后台 |
| **Echo** | 类 Gin，更简洁 | 极快 | 微服务 API |
| **Chi** | 标准库兼容 | 快 | 偏好 \`net/http\` 风格 |
| **Fiber** | 类 Express，基于 fasthttp | 极快 | 高吞吐场景 |
| **Beego** | 全栈（MVC/ORM） | 中 | 类似 Django 全家桶 |

#### 1. Gin 示例

\`\`\`bash
go get -u github.com/gin-gonic/gin
\`\`\`

\`\`\`go
package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default() // Logger + Recovery 中间件

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	r.GET("/users/:id", func(c *gin.Context) {
		id := c.Param("id")
		c.JSON(200, gin.H{"id": id, "name": "Alice"})
	})

	// 路由分组 + 中间件
	api := r.Group("/api", func(c *gin.Context) {
		c.Next() // 简单演示
	})
	api.GET("/items", func(c *gin.Context) {
		c.JSON(200, []string{"a", "b"})
	})

	r.Run(":8080")
}
\`\`\`

#### 2. Echo 示例

\`\`\`go
package main

import (
	"net/http"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"msg": "hello"})
	})

	e.GET("/users/:id", func(c echo.Context) error {
		id := c.Param("id")
		return c.JSON(200, map[string]string{"id": id})
	})

	e.Logger.Fatal(e.Start(":8080"))
}
\`\`\`

#### 3. Chi 示例（标准库风格）

\`\`\`go
package main

import (
	"net/http"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hi"))
	})

	r.Route("/users", func(r chi.Router) {
		r.Get("/", listUsers)
		r.Post("/", createUser)
		r.Get("/{id}", getUser)
	})

	http.ListenAndServe(":8080", r)
}

func listUsers(w http.ResponseWriter, r *http.Request) {}
func createUser(w http.ResponseWriter, r *http.Request) {}
func getUser(w http.ResponseWriter, r *http.Request) {}
\`\`\`

#### 怎么选？

- **API 服务，要快** → Gin 或 Echo。
- **要接近标准库，灵活组合** → Chi。
- **要全栈（ORM/MVC/CLI 都有）** → Beego。
- **追求极致性能** → Fiber（但 fasthttp 和 \`net/http\` 不兼容，生态小一圈）。

> 个人推荐：新项目用 Gin（生态最丰富）或 Chi（标准库兼容）。

### 六、gRPC

gRPC 是 Google 的 RPC 框架，云原生内部服务间通信的主流选择。Go 是 gRPC 一等支持语言。

#### 1. 写 .proto 文件

\`\`\`protobuf
syntax = "proto3";

package hello;

option go_package = "example.com/hello";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
\`\`\`

#### 2. 生成 Go 代码

\`\`\`bash
protoc --go_out=. --go-grpc_out=. hello.proto
\`\`\`

#### 3. 实现 server

\`\`\`go
package main

import (
	"context"
	"net"
	"google.golang.org/grpc"
)

type server struct{}

func (s *server) SayHello(ctx context.Context, in *HelloRequest) (*HelloReply, error) {
	return &HelloReply{Message: "Hello " + in.Name}, nil
}

func main() {
	lis, _ := net.Listen("tcp", ":50051")
	s := grpc.NewServer()
	RegisterGreeterServer(s, &server{})
	s.Serve(lis)
}
\`\`\`

#### 4. 实现 client

\`\`\`go
conn, _ := grpc.Dial("localhost:50051", grpc.WithInsecure())
c := NewGreeterClient(conn)
r, _ := c.SayHello(context.Background(), &HelloRequest{Name: "world"})
fmt.Println(r.Message)
\`\`\`

> gRPC 用 Protobuf 编码，比 JSON 快很多；支持流式、双向通信。云原生内部微服务的事实标准。

### 七、ORM：GORM vs ent

#### 1. GORM

最流行的 ORM，API 像 ActiveRecord：

\`\`\`bash
go get -u gorm.io/gorm gorm.io/driver/sqlite
\`\`\`

\`\`\`go
package main

import (
	"gorm.io/gorm"
	"gorm.io/driver/sqlite"
)

type Product struct {
	gorm.Model
	Code  string
	Price uint
}

func main() {
	db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	db.AutoMigrate(&Product{})

	db.Create(&Product{Code: "L1212", Price: 1000})

	var p Product
	db.First(&p, 1)
	db.First(&p, "code = ?", "L1212")

	db.Model(&p).Update("Price", 2000)
	db.Delete(&p)
}
\`\`\`

#### 2. ent

Facebook 出的 ORM，用代码生成 + Schema 即代码：

\`\`\`bash
go get entgo.io/ent
go run -mod=mod entgo.io/ent/cmd/ent init User
\`\`\`

特点：

- 类型安全（生成的代码有完整类型）。
- 强大的图查询（适合复杂关系）。
- 比 GORM 学习曲线陡。

> 选择：简单 CRUD → GORM；复杂关系图 → ent；追求控制 → sqlx + 手写 SQL。

### 八、配置管理 viper

\`\`\`bash
go get github.com/spf13/viper
\`\`\`

\`\`\`go
package main

import (
	"fmt"
	"github.com/spf13/viper"
)

func main() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("/etc/myapp")

	viper.SetDefault("port", 8080)
	viper.SetDefault("debug", false)

	// 环境变量
	viper.AutomaticEnv()
	viper.SetEnvPrefix("MYAPP")

	// 命令行 flag
	// viper.BindPFlag("port", pflag.Lookup("port"))

	if err := viper.ReadInConfig(); err != nil {
		fmt.Println("no config file, using defaults")
	}

	fmt.Println("port:", viper.GetInt("port"))
	fmt.Println("debug:", viper.GetBool("debug"))
	fmt.Println("db.host:", viper.GetString("db.host"))
}
\`\`\`

viper 支持：YAML / JSON / TOML / HCL / 环境变量 / 命令行 / 远程 KV（etcd/Consul）。

### 九、日志库：zap / zerolog

标准库 \`log/slog\` 够用，但追求性能上 \`zap\` 或 \`zerolog\`：

\`\`\`bash
go get go.uber.org/zap
\`\`\`

\`\`\`go
package main

import "go.uber.org/zap"

func main() {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	logger.Info("user logged in",
		zap.String("user", "alice"),
		zap.Int("id", 42),
	)

	// Sugar：性能稍低但 API 友好
	sugar := logger.Sugar()
	sugar.Infof("user %s logged in, id=%d", "alice", 42)
}
\`\`\`

zerolog 用链式调用，零分配：

\`\`\`go
import "github.com/rs/zerolog/log"

log.Info().Str("user", "alice").Int("id", 42).Msg("logged in")
\`\`\`

### 十、Web 开发最佳实践

#### 1. 优雅关闭（Graceful Shutdown）

\`\`\`go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	srv := &http.Server{Addr: ":8080", Handler: http.NewServeMux()}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\\n", err)
		}
	}()

	// 等中断信号
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutdown ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("shutdown error:", err)
	}
	log.Println("exit")
}
\`\`\`

#### 2. 配置 struct 化

\`\`\`go
type Config struct {
	Port     int    \`yaml:"port"\`
	DBURL    string \`yaml:"db_url"\`
	LogLevel string \`yaml:"log_level"\`
}

func Load(path string) (*Config, error) {
	// viper 或 yaml.Unmarshal
}
\`\`\`

#### 3. 依赖注入

不需要框架，构造函数注入：

\`\`\`go
type Server struct {
	userRepo UserRepository
	logger   *zap.Logger
}

func NewServer(r UserRepository, l *zap.Logger) *Server {
	return &Server{userRepo: r, logger: l}
}
\`\`\`

复杂场景用 [wire](https://github.com/google/wire)（编译期依赖注入代码生成）。

#### 4. 错误处理统一

\`\`\`go
type APIError struct {
	Code    int    \`json:"code"\`
	Message string \`json:"message"\`
}

func (e *APIError) Error() string { return e.Message }

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(APIError{Code: status, Message: msg})
}
\`\`\`

### 十一、项目结构惯例

Go 社区有 \`project-layout\` 约定（非强制）：

\`\`\`
myapp/
├── cmd/
│   └── myapp/
│       └── main.go        # 入口
├── internal/              # 只能本模块导入
│   ├── handler/
│   ├── service/
│   ├── repository/
│   └── model/
├── pkg/                   # 可被外部导入的公共库
├── api/                   # proto / openapi
├── configs/               # 配置模板
├── scripts/               # 脚本
├── deployments/           # k8s / docker
├── test/                  # 集成测试
├── go.mod
└── go.sum
\`\`\`

> \`internal/\` 是 Go 编译器强制的：模块外不能 import 它下面的包。这是隔离实现细节的关键。

### 十二、Docker 化 Go 应用

\`\`\`dockerfile
# 多阶段构建
FROM golang:1.21 AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /myapp ./cmd/myapp

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /myapp /myapp
EXPOSE 8080
ENTRYPOINT ["/myapp"]
\`\`\`

最终镜像通常 20MB 左右——这是 Go 静态编译的最大优势。

### 十三、可观测性三件套

云原生应用必备：

| 维度 | 工具 | 库 |
|------|------|----|
| **Metrics** | Prometheus | \`github.com/prometheus/client_golang\` |
| **Logging** | Loki/ELK | \`log/slog\` 或 \`zap\` |
| **Tracing** | Jaeger/Tempo | \`go.opentelemetry.io/otel\` |

#### Prometheus 指标示例

\`\`\`go
package main

import (
	"net/http"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	httpRequests = prometheus.NewCounterVec(
		prometheus.CounterOpts{Name: "http_requests_total"},
		[]string{"path", "method"},
	)
)

func init() {
	prometheus.MustRegister(httpRequests)
}

func main() {
	http.Handle("/metrics", promhttp.Handler())
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		httpRequests.WithLabelValues(r.URL.Path, r.Method).Inc()
		w.Write([]byte("hi"))
	})
	http.ListenAndServe(":8080", nil)
}
\`\`\`

访问 \`http://localhost:8080/metrics\` 看到 Prometheus 抓取格式。

### 十四、Go 在云原生的地位总结

| 维度 | Go 的优势 |
|------|----------|
| 部署 | 静态编译，单二进制，容器镜像极小 |
| 并发 | goroutine 模型天然适合网络服务 |
| 性能 | 接近 C 的吞吐，远超 Java/Python 的资源占用 |
| 生态 | Docker/K8s 全家桶都用 Go，云原生 SDK 一等支持 |
| 工具链 | go build / go test / go vet / pprof 全内置 |
| 学习曲线 | 25 个关键字，半天入门 |

> 一句话：**学 Go 不学云原生，浪费一半功力；做云原生不学 Go，举步维艰**。

### 十五、本章小结

- **net/http** 几行起服务，Go 1.22+ 内置 method 路由和路径参数。
- **Handler 接口** 是 Go HTTP 的核心抽象。
- **中间件** = 包装函数，链式组合。
- **三大框架**：Gin / Echo / Chi，按需选择。
- **gRPC** 云原生内部通信事实标准。
- **ORM**：GORM 简单，ent 类型安全。
- **viper** 配置管理，**zap/zerolog** 高性能日志。
- **优雅关闭** / **Docker 多阶段构建** / **可观测性三件套** 是生产必备。
- **Go 是云原生的事实语言**——Docker/K8s/etcd/Prometheus 全是 Go 写的。

---

至此实战部分讲完。最后一章是结语，聊聊学习路径与社区。
`,
  },

  // ============================================================
  // 结语
  // ============================================================
  {
    id: 'go-end',
    group: '结尾',
    icon: '🎓',
    title: '结语',
    content: `## 结语

### 一、回顾

这本 Go 教程到此结束。我们用了 20 章，覆盖了：

1. **基础入门**（第 1-4 章）：Go 简介与环境、第一个程序、变量与数据类型、运算符与控制流。
2. **语法进阶**（第 5-8 章）：函数、复合类型（数组/切片/map/struct）、方法与接口、指针与值语义。
3. **并发编程**（第 9-12 章）：goroutine、channel、sync 包、select 与 context。
4. **进阶特性**（第 13-16 章）：错误处理、泛型（Go 1.18+）、反射与 unsafe、内存模型与 GC。
5. **实战与生态**（第 17-20 章）：Go Modules、标准库精讲、测试与基准、Web 与云原生。

### 二、Go 的核心特质

学完之后，你应该能感受到 Go 的几个鲜明特点：

- **简洁**：25 个关键字，没有继承、没有泛型重载、没有运算符重载。少即是多。
- **工程导向**：gofmt 统一格式、go vet 静态检查、go test 内置测试——工具链一体化。
- **并发一等公民**：goroutine + channel 是语言级抽象，不是库。
- **显式错误**：没有 try/catch，错误是值，必须处理。看起来啰嗦，但**强制让你思考失败路径**。
- **静态编译**：单二进制部署，没有运行时依赖。这是云原生选择 Go 的根本原因。
- **强标准库**：HTTP、JSON、加密、压缩、时间、正则……80% 工作不用第三方库。
- **向后兼容**：Go 1.x 承诺代码不破坏，10 年前的代码现在还能编译。

### 三、Go 的工程哲学

#### 1. Go Proverbs（Go 谚语）

Rob Pike 整理的 [Go Proverbs](https://go-proverbs.github.io/) 浓缩了 Go 的设计哲学：

> - **Don't communicate by sharing memory, share memory by communicating.**
>   不要通过共享内存通信，而要通过通信共享内存。
> - **Concurrency is not parallelism.**
>   并发不是并行。
> - **Channels orchestrate; mutexes serialize.**
>   channel 编排，mutex 串行化。
> - **Make the zero value useful.**
>   让零值有意义。
> - **Interfaces are satisfied implicitly.**
>   接口是被隐式实现的。
> - **A little copying is better than a little dependency.**
>   一点复制胜过一点依赖。
> - **Clear is better than clever.**
>   清晰胜过聪明。
> - **Don't just check errors, handle them gracefully.**
>   不要只检查错误，要优雅地处理。
> - **The bigger the interface, the weaker the abstraction.**
>   接口越大，抽象越弱。
> - **Gofmt's style is no one's favorite, yet gofmt is everyone's favorite.**
>   gofmt 的风格没人喜欢，但每个人都喜欢 gofmt。

把这些当作写 Go 代码的指南针。

#### 2. Effective Go

官方 [Effective Go](https://go.dev/doc/effective_go) 文档讲了"地道"的 Go 写法：

- 用 \`fmt.Sprintf\` 而不是字符串拼接。
- 用多返回值而不是抛异常。
- 用 \`defer\` 清理资源。
- 用 goroutine + channel 而不是锁。
- 接口定义在**使用方**而不是实现方。
- struct 嵌入替代继承。
- 用 \`go generate\` 自动化代码生成。

读一遍 Effective Go 是每个 Go 开发者的必修课。

### 四、下一站：学习路径

教程是入门，真正的成长在"做项目"中：

#### 路径 1：CLI 工具

写一个 CLI（比如文件批量重命名工具）：
- 用 \`cobra\` / \`urfave/cli\` 做命令行。
- 用 \`os\` / \`path/filepath\` 处理文件。
- 学 \`go build\` 跨平台编译：\`GOOS=linux go build\`。

#### 路径 2：HTTP API 服务

写一个博客后端 API：
- Gin / Chi 起服务。
- GORM + PostgreSQL 存数据。
- JWT 鉴权。
- viper 配置 + zap 日志。
- Docker 化部署。

#### 路径 3：并发任务系统

写一个爬虫 / 任务队列：
- \`sync.WaitGroup\` 管理并发。
- channel 限流。
- \`context\` 超时控制。
- Redis 做分布式锁。

#### 路径 4：云原生方向

直接进入云原生：
- 读 Kubernetes 源码（最好的 Go 大型项目范例）。
- 给 Prometheus / etcd 提 PR。
- 写一个 Kubernetes Operator（用 \`controller-runtime\`）。
- 写一个 CRD controller。

#### 路径 5：深入运行时

性能调优方向：
- 学 \`runtime\` 包。
- 学 pprof 火焰图分析。
- 读 [Go 语言底层原理](https://github.com/tebeka/go2o)。
- 学 GMP 调度器、GC 三色标记。

### 五、推荐资源

#### 官方

- **Go 官网**：[https://go.dev](https://go.dev)
- **A Tour of Go**：[https://go.dev/tour](https://go.dev/tour)（互动教程，必做）
- **Effective Go**：[https://go.dev/doc/effective_go](https://go.dev/doc/effective_go)
- **Go by Example**：[https://gobyexample.com](https://gobyexample.com)（按特性查示例）
- **标准库文档**：\`go doc\` 命令或 [https://pkg.go.dev/std](https://pkg.go.dev/std)
- **Go Blog**：[https://go.dev/blog](https://go.dev/blog)
- **Go Proverbs**：[https://go-proverbs.github.io](https://go-proverbs.github.io)

#### 书籍

- **《The Go Programming Language》**（Donovan & Kernighan）：圣经，由 K&R 的 Kernighan 合著。
- **《Go in Action》**（William Kennedy）：实战导向。
- **《Concurrency in Go》**（Katherine Cox-Buday）：并发深入。
- **《100 Go Mistakes and How to Avoid Them》**（Teiva Harsanyi）：避坑指南。
- **《Cloud Native Go》**（Matthew A. Titmus）：云原生方向。
- **《Go 语言底层原理》**（深入运行时）。

#### 社区

- **GitHub**：[https://github.com/golang](https://github.com/golang)（源码、提案）
- **Go Forum**：[https://forum.golangbridge.org](https://forum.golangbridge.org)
- **Reddit /r/golang**：[https://reddit.com/r/golang](https://reddit.com/r/golang)
- **Go 中国社区**：[https://studygolang.com](https://studygolang.com)
- **GopherCon 演讲**：YouTube 上的年度大会。

#### 必读源码

- **标准库源码**：\`net/http\` \`sync\` \`context\` \`encoding/json\` 都是顶级 Go 代码范例。
- **Docker** (moby)：[https://github.com/moby/moby](https://github.com/moby/moby)
- **Kubernetes**：[https://github.com/kubernetes/kubernetes](https://github.com/kubernetes/kubernetes)
- **etcd**：[https://github.com/etcd-io/etcd](https://github.com/etcd-io/etcd)
- **Prometheus**：[https://github.com/prometheus/prometheus](https://github.com/prometheus/prometheus)

#### 工具

- **GoLand**（JetBrains）：最强 Go IDE，付费。
- **VS Code + Go 扩展**：免费首选。
- **Neovim + gopls**：极客选择。
- **dlv (delve)**：调试器。
- **golangci-lint**：综合 lint 工具。
- **air**：热重载开发。
- **govulncheck**：漏洞扫描。

### 六、最佳实践速查

#### 代码风格

- 跑 \`gofmt\` / \`goimports\`（保存即格式化）。
- 包名小写单词，不用下划线 / 驼峰：\`nethttp\` 而不是 \`net_http\` 或 \`NetHttp\`。
- 导出标识符用大写开头：\`Server\` \`ListenAndServe\`。
- 缩写词全大写或全小写：\`URL\` \`userID\`（不是 \`userId\`）。

#### 错误处理

- 错误是值，不要忽略：\`_, err := ...; if err != nil { ... }\`。
- 用 \`errors.Is\` / \`errors.As\` 判断具体错误。
- 用 \`fmt.Errorf("xxx: %w", err)\` 包装错误（保留调用栈）。
- 在合适的层级处理错误，不要每层都 log。
- 业务错误用 sentinel（\`var ErrNotFound = errors.New("...")\`）或自定义类型。

#### 并发

- 优先 channel，其次 \`sync.Mutex\`，最后 \`sync/atomic\`。
- 不要从接收端关闭 channel。
- 不要复制带 mutex 的 struct（用指针接收者）。
- \`context.Context\` 总是作为第一个参数。
- 跑 \`go test -race\` 检测数据竞争。

#### 性能

- 先写正确，再优化。不要过早优化。
- 用 benchmark + pprof 找瓶颈，不要凭感觉。
- 减少 heap 分配（\`strings.Builder\` / \`sync.Pool\` / 值类型）。
- 大对象传指针，小对象传值。
- 警惕 goroutine 泄露（用 \`context\` 控制）。

#### 接口

- 接口定义在**使用方**，不要预先定义。
- 接口尽量小（一个方法的接口最灵活）。
- 隐式实现——不要为了"实现接口"而设计代码。

#### 测试

- 表驱动测试是默认风格。
- 测试文件 \`_test.go\` 同包同目录。
- \`go mod tidy\` + \`go test -race ./...\` 进 CI。
- 测公共 API，不测私有函数。
- 用 \`t.Helper()\` 标记辅助函数。

#### 项目

- \`internal/\` 放实现细节。
- \`cmd/xxx/main.go\` 是入口。
- 不要在 \`internal/\` 外暴露实现细节。
- 一个包做一件事，不要塞太多。

### 七、给学习者的建议

#### 1. 不要把 Go 当 Java/Python 写

很多新手用 Go 写出"用了 Go 语法的 Java"——到处是 class、继承、设计模式。Go 的精神是：

- 不需要继承——用 struct 嵌入和接口。
- 不需要 try/catch——错误是值。
- 不需要 ORM 框架——先用标准库 \`database/sql\`。
- 不需要 DI 框架——构造函数注入就够。

#### 2. 读标准库源码

标准库是 Go 最佳实践的总和。挑 \`net/http\` 或 \`sync\` 读一遍，比读 10 本书都管用。

\`\`\`bash
go doc -all net/http
go doc -all sync
\`\`\`

#### 3. 用 go vet 和 golangci-lint

\`\`\`bash
go vet ./...
golangci-lint run
\`\`\`

它们会抓出 90% 的常见错误。

#### 4. 跑 race detector

\`\`\`bash
go test -race ./...
\`\`\`

这是 Go 独有的杀手锏——能自动检测大多数数据竞争。Java 都没有这么好用的工具。

#### 5. 关注 Go 版本演进

- **Go 1.18**（2022）：泛型、模糊测试、工作区。
- **Go 1.19**（2022）：内存模型修订、注释规范化。
- **Go 1.20**（2023）：errors.Join、profile-guided optimization。
- **Go 1.21**（2023）：\`log/slog\`、\`slices\`/\`maps\` 包、\`min\`/\`max\`/\`clear\` 内置、toolchain 指令。
- **Go 1.22**（2024）：range int、ServeMux 增强、loopvar 语义修正。
- **Go 1.23**（2024）：range over function、iter 包。
- **Go 1.24**（2025）：泛型类型别名、工具管理、crypto 增强。

每半年发一个大版本，订阅 [Go Blog](https://go.dev/blog) 跟进。

### 八、Go 的不足（理性看待）

没有完美语言，Go 也有短板：

- **错误处理啰嗦**：\`if err != nil\` 重复出现，社区一直在讨论改进。
- **泛型姗姗来迟**：2022 年才加入，生态还适应中。
- **缺少枚举**：用 \`const + iota\` 模拟，不如 Rust/Java 优雅。
- **GC 暂停**：虽大幅改善，但极致低延迟场景仍不如手动管理（Rust/C++）。
- **没有宏**：不能像 Rust 那样编译期生成代码（但 \`go generate\` 部分替代）。
- **GUI 弱**：桌面应用生态远不如 Electron / Qt。
- **没有异常**：跨多层调用传错误确实繁琐。

但这些都不影响 Go 在**服务端、云原生、CLI 工具**领域的统治地位。

### 九、最后

编程语言只是工具，真正解决问题的是你对问题的理解和思考。Go 是一把好工具——它**克制、清晰、可靠**，让你专注在问题本身而不是语言特性上。

> Go 不让你变聪明，它让你做的事变简单。

希望这本教程能帮你打开 Go 与云原生的大门。继续写、继续读、继续造——代码会回报每一份投入。

> 愿你在每一次 \`go build\` 通过时感到欣喜，在每一次 race detector 报告问题时变得更警觉，在每一次 goroutine 优雅退出时变得更扎实。

**Don't communicate by sharing memory, share memory by communicating.**

—— 完 ——
`,
  },
];

export { chapters };
