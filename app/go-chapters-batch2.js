// =============================================================
// Go 交互式教程 - 第二批章节（第二部分 语法进阶，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   go-ch05 : 第五章 控制流——条件与循环
//   go-ch06 : 第六章 函数
//   go-ch07 : 第七章 数组、切片与字符串
//   go-ch08 : 第八章 指针与结构体
// =============================================================

const chapters = [
  // ============================================================
  // 第五章：控制流
  // ============================================================
  {
    id: 'go-ch05',
    group: '第二部分 语法进阶',
    icon: '🔀',
    title: '控制流——条件与循环',
    content: `## 第五章　控制流——条件与循环

控制流决定代码"按什么顺序执行"。Go 的控制流设计极简：只有 \`if\`、\`for\`、\`switch\` 三种结构，没有 \`while\`、\`do-while\`。这一章讲条件分支、循环、跳转，并对比与 Java/C# 的差异。

### 一、Go 控制流的设计哲学

Go 在控制流上做了几个"反传统"的设计：

1. **只有 \`for\` 一种循环**：\`while\`、\`do-while\` 全部用 \`for\` 模拟。
2. **\`if\` 和 \`for\` 不需要括号**：\`if x > 0 {...}\` 而非 \`if (x > 0) {...}\`。
3. **\`switch\` 默认不贯穿**：每个 \`case\` 自动 \`break\`，不需要显式写。
4. **支持初始化语句**：\`if x := getValue(); x > 0 {...}\`，作用域限于 \`if\` 块。

> **与 Java/C# 对比**：Java/C# 有 \`while\`、\`do-while\`、\`for\`、\`foreach\` 四种循环；Go 只保留 \`for\`，但能覆盖所有场景。Go 的 \`switch\` 比 Java/C# 更安全（默认不贯穿）。

### 二、if-else 条件

#### 1. 基本语法

Go 的 \`if\` 不需要小括号，但大括号是**必须**的：

\`\`\`go
package main

import "fmt"

func main() {
    age := 18

    if age >= 18 {
        fmt.Println("成年")
    } else if age >= 13 {
        fmt.Println("青少年")
    } else {
        fmt.Println("儿童")
    }
}
\`\`\`

输出：

\`\`\`
成年
\`\`\`

**注意**：

- 大括号 \`{...\}\` 不能省略，即使只有一行。
- \`{\` 必须跟在 \`if\`、\`else\` 同一行，不能换行（Go 编译器强制）。

#### 2. 带初始化语句的 if

\`if\` 可以在条件前加一条初始化语句，变量作用域限于整个 \`if-else\` 块：

\`\`\`go
package main

import "fmt"

func main() {
    if age := 20; age >= 18 {
        fmt.Println("成年，年龄：", age)
    } else {
        fmt.Println("未成年，年龄：", age)
    }
    // fmt.Println(age)  // 编译错误：age 在这里不可见
}
\`\`\`

输出：

\`\`\`
成年，年龄： 20
\`\`\`

> **Java/C# 对比**：Java/C# 不支持这种写法，需要在外面声明变量：\`int age = 20; if (age >= 18) {...}\`。Go 这种写法让变量作用域更小，减少污染。

#### 3. 没有三元运算符

Go **没有** \`?:\` 三元运算符，必须用 \`if-else\`：

\`\`\`go
package main

import "fmt"

func main() {
    age := 20
    var status string
    if age >= 18 {
        status = "成年"
    } else {
        status = "未成年"
    }
    fmt.Println(status)  // 成年
}
\`\`\`

> **Java/C# 对比**：Java/C# 可以写 \`string status = age >= 18 ? "成年" : "未成年";\`，Go 必须用完整 \`if-else\`。Go 设计者认为三元运算符降低可读性。

### 三、for 循环（Go 唯一的循环）

Go 把所有循环统一到 \`for\`，但有三种形式。

#### 1. 传统 for（类似 C 的 for）

\`\`\`go
package main

import "fmt"

func main() {
    for i := 0; i < 5; i++ {
        fmt.Println("i =", i)
    }
}
\`\`\`

输出：

\`\`\`
i = 0
i = 1
i = 2
i = 3
i = 4
\`\`\`

#### 2. 类似 while 的 for（省略初始化和后置语句）

\`\`\`go
package main

import "fmt"

func main() {
    n := 0
    for n < 5 {
        fmt.Println("n =", n)
        n++
    }
}
\`\`\`

输出：

\`\`\`
n = 0
n = 1
n = 2
n = 3
n = 4
\`\`\`

> **这就是 Go 的 while 循环**：\`for 条件 {\` 等价于 Java/C# 的 \`while (条件) {\`。

#### 3. 无限循环（省略条件）

\`\`\`go
package main

import "fmt"

func main() {
    count := 0
    for {
        count++
        if count >= 3 {
            break
        }
        fmt.Println("count =", count)
    }
    fmt.Println("结束")
}
\`\`\`

输出：

\`\`\`
count = 1
count = 2
结束
\`\`\`

> **注意**：\`for {\` 等价于 Java/C# 的 \`while (true) {\`。必须用 \`break\` 或 \`return\` 退出，否则死循环。

#### 4. for range（遍历集合）

\`\`\`go
package main

import "fmt"

func main() {
    // 遍历切片
    fruits := []string{"苹果", "香蕉", "橙子"}
    for index, value := range fruits {
        fmt.Printf("%d: %s\\n", index, value)
    }

    // 只用值，忽略索引
    for _, v := range fruits {
        fmt.Println(v)
    }

    // 只用索引
    for i := range fruits {
        fmt.Println("索引:", i)
    }
}
\`\`\`

输出：

\`\`\`
0: 苹果
1: 香蕉
2: 橙子
苹果
香蕉
橙子
索引: 0
索引: 1
索引: 2
\`\`\`

> **Java/C# 对比**：Go 的 \`for range\` 类似 Java 的 \`for (String s : list)\` 或 C# 的 \`foreach\`。但 Go 同时提供索引和值。

#### 5. 遍历字符串的特别注意

Go 字符串是 UTF-8，\`range\` 按"码点（rune）"遍历，不是按字节：

\`\`\`go
package main

import "fmt"

func main() {
    s := "Go语言"

    // range 遍历：按 rune
    for i, r := range s {
        fmt.Printf("%d: %c (Unicode: %U)\\n", i, r, r)
    }

    // 按字节遍历
    for i := 0; i < len(s); i++ {
        fmt.Printf("%d: 字节 %d\\n", i, s[i])
    }
}
\`\`\`

输出：

\`\`\`
0: G (Unicode: U+0047)
1: o (Unicode: U+006F)
2: 语 (Unicode: U+8BED)
5: 言 (Unicode: U+8A00)
0: 字节 71
1: 字节 111
2: 字节 232
3: 字节 175
4: 字节 173
5: 字节 232
6: 字节 168
7: 字节 128
\`\`\`

**注意**：'语' 占 3 字节，所以第二个 rune 的索引是 5 而不是 3。

### 四、switch 语句

Go 的 \`switch\` 比 Java/C# 更简洁安全。

#### 1. 传统 switch（默认 break）

\`\`\`go
package main

import "fmt"

func main() {
    day := 3
    switch day {
    case 1:
        fmt.Println("周一")
    case 2:
        fmt.Println("周二")
    case 3:
        fmt.Println("周三")
    case 4:
        fmt.Println("周四")
    case 5:
        fmt.Println("周五")
    default:
        fmt.Println("周末")
    }
}
\`\`\`

输出：

\`\`\`
周三
\`\`\`

> **与 Java/C# 的关键区别**：Go 的 \`case\` 默认带 \`break\`，不会"贯穿"到下一个 \`case\`。Java/C# 必须显式写 \`break\`，否则会贯穿（C# 甚至强制要求 \`break\`）。

#### 2. fallthrough：强制贯穿

如果确实需要贯穿，用 \`fallthrough\` 关键字：

\`\`\`go
package main

import "fmt"

func main() {
    day := 3
    switch day {
    case 1:
        fmt.Println("周一")
        fallthrough
    case 2:
        fmt.Println("周二")
        fallthrough
    case 3:
        fmt.Println("周三")
        fallthrough
    case 4:
        fmt.Println("周四")
    }
}
\`\`\`

输出：

\`\`\`
周三
周四
\`\`\`

**注意**：\`fallthrough\` 必须是 \`case\` 块的最后一条语句，且只能强制进入**紧接着的下一个 \`case\`**，不判断条件。

#### 3. 多值 case

一个 \`case\` 可以匹配多个值：

\`\`\`go
package main

import "fmt"

func main() {
    day := 6
    switch day {
    case 1, 2, 3, 4, 5:
        fmt.Println("工作日")
    case 6, 7:
        fmt.Println("周末")
    default:
        fmt.Println("无效")
    }
}
\`\`\`

输出：

\`\`\`
周末
\`\`\`

#### 4. 无表达式 switch（类似 if-else 链）

\`switch\` 后不跟表达式，每个 \`case\` 写条件：

\`\`\`go
package main

import "fmt"

func main() {
    score := 85
    switch {
    case score >= 90:
        fmt.Println("优秀")
    case score >= 80:
        fmt.Println("良好")
    case score >= 70:
        fmt.Println("中等")
    case score >= 60:
        fmt.Println("及格")
    default:
        fmt.Println("不及格")
    }
}
\`\`\`

输出：

\`\`\`
良好
\`\`\`

> **这是 Go 独有的简洁写法**，等价于 Java/C# 的 \`if-else if-else\` 链。

#### 5. 带初始化语句的 switch

\`\`\`go
package main

import "fmt"

func main() {
    switch num := 15; {
    case num < 0:
        fmt.Println("负数")
    case num == 0:
        fmt.Println("零")
    case num > 0:
        fmt.Println("正数")
    }
}
\`\`\`

输出：

\`\`\`
正数
\`\`\`

#### 6. switch 匹配类型（type switch）

用于接口类型断言（接口章节详讲）：

\`\`\`go
package main

import "fmt"

func main() {
    var x interface{} = 42
    switch v := x.(type) {
    case int:
        fmt.Println("整数:", v)
    case string:
        fmt.Println("字符串:", v)
    case bool:
        fmt.Println("布尔:", v)
    default:
        fmt.Println("未知类型")
    }
}
\`\`\`

输出：

\`\`\`
整数: 42
\`\`\`

### 五、break 与 continue

#### 1. break：跳出循环

\`\`\`go
package main

import "fmt"

func main() {
    for i := 0; i < 10; i++ {
        if i == 5 {
            break  // i=5 时跳出
        }
        fmt.Println(i)
    }
}
\`\`\`

输出：

\`\`\`
0
1
2
3
4
\`\`\`

#### 2. continue：跳过本次

\`\`\`go
package main

import "fmt"

func main() {
    for i := 0; i < 10; i++ {
        if i%2 == 0 {
            continue  // 跳过偶数
        }
        fmt.Println(i)
    }
}
\`\`\`

输出：

\`\`\`
1
3
5
7
9
\`\`\`

### 六、标签（Label）与 goto

Go 支持 \`goto\`、带标签的 \`break\`、带标签的 \`continue\`。

#### 1. goto（谨慎使用）

\`\`\`go
package main

import "fmt"

func main() {
    i := 0
loop:
    if i >= 3 {
        goto end
    }
    fmt.Println("i =", i)
    i++
    goto loop
end:
    fmt.Println("结束")
}
\`\`\`

输出：

\`\`\`
i = 0
i = 1
i = 2
结束
\`\`\`

> **注意**：\`goto\` 在 Go 中可用但不推荐，破坏可读性。Go 设计者保留它是为了在某些底层场景（如状态机）方便使用。

#### 2. 带标签的 break（跳出多层循环）

普通 \`break\` 只能跳出最内层循环，要跳出多层需要标签：

\`\`\`go
package main

import "fmt"

func main() {
outer:
    for i := 0; i < 3; i++ {
        for j := 0; j < 3; j++ {
            if i == 1 && j == 1 {
                break outer  // 跳出外层循环
            }
            fmt.Printf("i=%d, j=%d\\n", i, j)
        }
    }
    fmt.Println("结束")
}
\`\`\`

输出：

\`\`\`
i=0, j=0
i=0, j=1
i=0, j=2
i=1, j=0
结束
\`\`\`

#### 3. 带标签的 continue

跳到外层循环的下一次：

\`\`\`go
package main

import "fmt"

func main() {
outer:
    for i := 0; i < 3; i++ {
        for j := 0; j < 3; j++ {
            if j == 1 {
                continue outer  // 跳过 j=1，继续外层
            }
            fmt.Printf("i=%d, j=%d\\n", i, j)
        }
    }
}
\`\`\`

输出：

\`\`\`
i=0, j=0
i=1, j=0
i=2, j=0
\`\`\`

### 七、控制流综合示例

\`\`\`go
package main

import "fmt"

func main() {
    // 1. 九九乘法表
    fmt.Println("=== 九九乘法表 ===")
    for i := 1; i <= 9; i++ {
        for j := 1; j <= i; j++ {
            fmt.Printf("%dx%d=%d\\t", j, i, i*j)
        }
        fmt.Println()
    }

    // 2. 计算 1 到 100 求和（while 风格）
    fmt.Println("\\n=== 1 到 100 求和 ===")
    sum := 0
    n := 1
    for n <= 100 {
        sum += n
        n++
    }
    fmt.Println("1+2+...+100 =", sum)  // 5050

    // 3. 遍历切片
    fmt.Println("\\n=== 遍历切片 ===")
    fruits := []string{"苹果", "香蕉", "橙子"}
    for index, fruit := range fruits {
        fmt.Printf("%d: %s\\n", index, fruit)
    }

    // 4. switch 评级
    fmt.Println("\\n=== 分数评级 ===")
    score := 85
    switch {
    case score >= 90:
        fmt.Println("优秀")
    case score >= 80:
        fmt.Println("良好")
    case score >= 70:
        fmt.Println("中等")
    case score >= 60:
        fmt.Println("及格")
    default:
        fmt.Println("不及格")
    }

    // 5. continue 跳过偶数
    fmt.Println("\\n=== 1-10 中的奇数 ===")
    for i := 1; i <= 10; i++ {
        if i%2 == 0 {
            continue
        }
        fmt.Print(i, " ")
    }
    fmt.Println()

    // 6. 多值 case
    fmt.Println("\\n=== 多值 case ===")
    day := 6
    switch day {
    case 1, 2, 3, 4, 5:
        fmt.Println("工作日")
    case 6, 7:
        fmt.Println("周末")
    }

    // 7. 带标签的 break
    fmt.Println("\\n=== 查找第一个负数 ===")
    matrix := [][]int{
        {1, 2, 3},
        {4, -5, 6},
        {7, 8, 9},
    }
    found := false
search:
    for i, row := range matrix {
        for j, val := range row {
            if val < 0 {
                fmt.Printf("找到负数 %d 在 [%d][%d]\\n", val, i, j)
                found = true
                break search
            }
        }
    }
    if !found {
        fmt.Println("没找到")
    }
}
\`\`\`

运行输出：

\`\`\`
=== 九九乘法表 ===
1x1=1
1x2=2	2x2=4
...（完整九九表）

=== 1 到 100 求和 ===
1+2+...+100 = 5050

=== 遍历切片 ===
0: 苹果
1: 香蕉
2: 橙子

=== 分数评级 ===
良好

=== 1-10 中的奇数 ===
1 3 5 7 9

=== 多值 case ===
周末

=== 查找第一个负数 ===
找到负数 -5 在 [1][1]
\`\`\`

### 八、Go vs Java/C# 控制流对比

| 特性 | Go | Java/C# |
| --- | --- | --- |
| 条件括号 | 不需要 \`()\` | 需要 \`()\` |
| 大括号 | 必须，且 \`{\` 不换行 | 建议但非强制 |
| 循环种类 | 只有 \`for\` | \`for\`、\`while\`、\`do-while\`、\`foreach\` |
| while 循环 | \`for 条件 {}\` | \`while (条件) {}\` |
| 无限循环 | \`for {}\` | \`while (true) {}\` |
| switch 贯穿 | 默认不贯穿 | Java 默认贯穿，C# 不贯穿 |
| fallthrough | 需显式 \`fallthrough\` | Java 需要无 \`break\`，C# 不允许 |
| 三元运算符 | 无 | \`?:\` |
| goto | 支持（有标签） | C# 支持，Java 不支持（保留字） |

### 九、本章小结

- 条件分支用 \`if-else\`，可带初始化语句：\`if x := f(); x > 0 {}\`。
- 循环只有 \`for\`，三种形式：传统、while 风格、无限循环。
- \`for range\` 遍历集合，同时返回索引和值。
- \`switch\` 默认不贯穿，多值用逗号分隔，无条件 switch 替代 if-else 链。
- \`break\` 跳出循环，\`continue\` 跳过本次，带标签可跳出多层。
- \`goto\` 可用但不推荐，仅在特殊场景。
- Go 没有 \`while\`、\`do-while\`、三元运算符——这是设计上的简化。

下一章讲函数——Go 函数支持多返回值、命名返回值、闭包、defer 等强大特性。`,
  },

  // ============================================================
  // 第六章：函数
  // ============================================================
  {
    id: 'go-ch06',
    group: '第二部分 语法进阶',
    icon: '🔧',
    title: '函数',
    content: `## 第六章　函数

函数是 Go 程序的基本构建块。Go 的函数设计简洁而强大：支持多返回值、命名返回值、可变参数、闭包、\`defer\` 等。这一章详细讲解。

### 一、Go 函数的设计哲学

1. **多返回值**：错误处理用返回值，而不是异常（Go 没有 try-catch）。
2. **一等公民**：函数可以作为参数、返回值、变量赋值。
3. **没有方法重载**：同名函数只能有一个，参数不同也不行。
4. **没有默认参数**：用可变参数或选项模式替代。
5. **defer 替代 finally**：资源清理用 \`defer\`。

> **与 Java/C# 对比**：
> - Java/C# 有异常机制（try-catch-finally），Go 用多返回值 + \`defer\`。
> - Java/C# 支持方法重载，Go 不支持。
> - Java/C# 支持默认参数，Go 不支持。

### 二、函数定义

#### 1. 基本语法

\`\`\`go
func 函数名(参数列表) 返回值列表 {
    函数体
    return 返回值
}
\`\`\`

示例：

\`\`\`go
package main

import "fmt"

func add(a int, b int) int {
    return a + b
}

func main() {
    sum := add(3, 5)
    fmt.Println(sum)  // 8
}
\`\`\`

输出：

\`\`\`
8
\`\`\`

#### 2. 参数类型简写

连续多个参数类型相同，可省略前面的：

\`\`\`go
package main

import "fmt"

func add(a, b int) int {  // a, b 都是 int
    return a + b
}

func main() {
    fmt.Println(add(3, 5))  // 8
}
\`\`\`

#### 3. 无返回值

\`\`\`go
package main

import "fmt"

func greet(name string) {
    fmt.Println("Hello,", name)
}

func main() {
    greet("张三")  // Hello, 张三
}
\`\`\`

### 三、多返回值

Go 函数可以返回多个值，这是 Go 的标志性特性。

#### 1. 基本多返回值

\`\`\`go
package main

import "fmt"

func divide(a, b int) (int, int) {
    quotient := a / b
    remainder := a % b
    return quotient, remainder
}

func main() {
    q, r := divide(17, 5)
    fmt.Printf("商=%d, 余数=%d\\n", q, r)  // 商=3, 余数=2
}
\`\`\`

输出：

\`\`\`
商=3, 余数=2
\`\`\`

#### 2. 用下划线 _ 忽略返回值

\`\`\`go
package main

import "fmt"

func divide(a, b int) (int, int) {
    return a / b, a % b
}

func main() {
    q, _ := divide(17, 5)  // 只要商
    fmt.Println("商 =", q)  // 3

    _, r := divide(17, 5)  // 只要余数
    fmt.Println("余数 =", r)  // 2
}
\`\`\`

#### 3. 多返回值经典用法：错误处理

Go 没有 try-catch，错误通过返回值传递：

\`\`\`go
package main

import (
    "errors"
    "fmt"
)

func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("除数不能为零")
    }
    return a / b, nil  // nil 表示无错误
}

func main() {
    result, err := divide(10, 0)
    if err != nil {
        fmt.Println("错误:", err)
        return
    }
    fmt.Println("结果:", result)
}
\`\`\`

输出：

\`\`\`
错误: 除数不能为零
\`\`\`

> **这是 Go 的惯用模式**：函数返回 \`(result, error)\`，调用方必须检查 \`err\`。\`err != nil\` 表示出错。Java/C# 用 \`try-catch\`，Go 用 \`if err != nil\`。

### 四、命名返回值

返回值可以命名，像在函数顶部声明变量：

\`\`\`go
package main

import "fmt"

func divide(a, b int) (quotient, remainder int) {
    quotient = a / b
    remainder = a % b
    return  // 裸 return，自动返回命名返回值
}

func main() {
    q, r := divide(17, 5)
    fmt.Printf("商=%d, 余数=%d\\n", q, r)
}
\`\`\`

输出：

\`\`\`
商=3, 余数=2
\`\`\`

**注意**：

- 命名返回值会在函数开始时初始化为零值。
- 裸 \`return\` 会自动返回当前命名返回值的值。
- **不推荐在长函数中使用裸 return**，影响可读性。

### 五、可变参数

用 \`...\` 表示不定数量参数，参数在函数内是切片：

\`\`\`go
package main

import "fmt"

func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

func main() {
    fmt.Println(sum(1, 2, 3))           // 6
    fmt.Println(sum(1, 2, 3, 4, 5))     // 15
    fmt.Println(sum())                  // 0

    // 传切片：用 ... 展开
    nums := []int{10, 20, 30}
    fmt.Println(sum(nums...))  // 60
}
\`\`\`

输出：

\`\`\`
6
15
0
60
\`\`\`

> **Java/C# 对比**：Java 用 \`int... nums\`，C# 用 \`params int[] nums\`。Go 用 \`nums ...int\`（注意位置：\`...\` 在类型前）。Go 还能用 \`slice...\` 展开切片，Java 也支持但写法不同。

### 六、函数作为值（一等公民）

Go 函数是一等公民，可以赋值给变量、作为参数传递、作为返回值。

#### 1. 赋值给变量

\`\`\`go
package main

import "fmt"

func add(a, b int) int { return a + b }

func main() {
    f := add  // 函数赋值给变量
    fmt.Println(f(3, 5))  // 8
}
\`\`\`

#### 2. 函数类型

\`\`\`go
package main

import "fmt"

func main() {
    // 显式声明函数类型
    var op func(int, int) int

    op = func(a, b int) int { return a + b }
    fmt.Println(op(3, 5))  // 8

    op = func(a, b int) int { return a * b }
    fmt.Println(op(3, 5))  // 15
}
\`\`\`

### 七、匿名函数

没有名字的函数，常用于临时使用：

\`\`\`go
package main

import "fmt"

func main() {
    // 1. 赋值给变量
    add := func(a, b int) int {
        return a + b
    }
    fmt.Println(add(3, 5))  // 8

    // 2. 立即调用（IIFE）
    result := func(a, b int) int {
        return a * b
    }(3, 5)
    fmt.Println(result)  // 15

    // 3. 作为参数
    nums := []int{1, 2, 3, 4, 5}
    process(nums, func(n int) int {
        return n * n
    })
}

func process(nums []int, f func(int) int) {
    for _, n := range nums {
        fmt.Println(f(n))
    }
}
\`\`\`

输出：

\`\`\`
8
15
1
4
9
16
25
\`\`\`

### 八、闭包（Closure）

闭包是引用了外部变量的函数，能"记住"外部变量的状态。

#### 1. 基本闭包

\`\`\`go
package main

import "fmt"

func main() {
    x := 10
    f := func() {
        fmt.Println(x)  // 引用外部变量 x
    }
    f()  // 10
    x = 20
    f()  // 20，闭包"看到"了 x 的变化
}
\`\`\`

#### 2. 计数器闭包

\`\`\`go
package main

import "fmt"

func makeCounter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

func main() {
    counter := makeCounter()
    fmt.Println(counter())  // 1
    fmt.Println(counter())  // 2
    fmt.Println(counter())  // 3

    // 每个闭包有独立的状态
    counter2 := makeCounter()
    fmt.Println(counter2())  // 1（独立于 counter）
}
\`\`\`

输出：

\`\`\`
1
2
3
1
\`\`\`

#### 3. 生成器闭包

\`\`\`go
package main

import "fmt"

func makeEvenGenerator() func() int {
    n := 0
    return func() int {
        n += 2
        return n
    }
}

func main() {
    nextEven := makeEvenGenerator()
    fmt.Println(nextEven())  // 2
    fmt.Println(nextEven())  // 4
    fmt.Println(nextEven())  // 6
}
\`\`\`

### 九、defer 语句

\`defer\` 延迟执行到函数返回时，常用于资源清理。这是 Go 替代 \`finally\` 的机制。

#### 1. 基本用法

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("开始")
    defer fmt.Println("中间（defer）")  // 延迟到函数返回前
    fmt.Println("结束")
}
\`\`\`

输出：

\`\`\`
开始
结束
中间（defer）
\`\`\`

#### 2. LIFO 顺序（后进先出）

多个 \`defer\` 按相反顺序执行：

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("开始")
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
    fmt.Println("结束")
}
\`\`\`

输出：

\`\`\`
开始
结束
3
2
1
\`\`\`

#### 3. defer 参数立即求值

\`defer\` 的参数在 \`defer\` 声明时就求值，不是执行时：

\`\`\`go
package main

import "fmt"

func main() {
    i := 1
    defer fmt.Println("defer 时 i =", i)  // i=1 在这里就固定了
    i = 10
    fmt.Println("执行时 i =", i)
}
\`\`\`

输出：

\`\`\`
执行时 i = 10
defer 时 i = 1
\`\`\`

#### 4. defer 经典用法：关闭文件

\`\`\`go
package main

import (
    "fmt"
    "os"
)

func main() {
    file, err := os.Open("test.txt")
    if err != nil {
        fmt.Println("打开失败:", err)
        return
    }
    defer file.Close()  // 保证函数返回时关闭

    // 使用文件...
    fmt.Println("使用文件")
}
\`\`\`

> **Java/C# 对比**：Java 用 \`try-with-resources\`，C# 用 \`using\`，Go 用 \`defer\`。\`defer\` 更灵活但需要手动写关闭代码。

#### 5. defer 用于锁释放

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

var mu sync.Mutex
var count int

func increment() {
    mu.Lock()
    defer mu.Unlock()  // 保证解锁
    count++
}

func main() {
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            increment()
        }()
    }
    wg.Wait()
    fmt.Println("count =", count)  // 1000
}
\`\`\`

### 十、init 函数

每个包可以有多个 \`init\` 函数，在 \`main\` 之前自动执行，用于初始化。

\`\`\`go
package main

import "fmt"

var x int

func init() {
    x = 42
    fmt.Println("init 1 执行")
}

func init() {
    fmt.Println("init 2 执行")
}

func main() {
    fmt.Println("main 执行，x =", x)
}
\`\`\`

输出：

\`\`\`
init 1 执行
init 2 执行
main 执行，x = 42
\`\`\`

**注意**：

- \`init\` 在 \`main\` 之前执行，按声明顺序。
- 一个文件可以有多个 \`init\`。
- \`init\` 没有参数和返回值。
- 用于初始化全局变量、注册驱动、检查环境等。

### 十一、高阶函数

高阶函数是接收函数作为参数或返回函数的函数。

#### 1. 函数作为参数

\`\`\`go
package main

import "fmt"

func apply(nums []int, f func(int) int) []int {
    result := make([]int, len(nums))
    for i, n := range nums {
        result[i] = f(n)
    }
    return result
}

func main() {
    nums := []int{1, 2, 3, 4, 5}

    squares := apply(nums, func(n int) int {
        return n * n
    })
    fmt.Println("平方:", squares)  // [1 4 9 16 25]

    doubles := apply(nums, func(n int) int {
        return n * 2
    })
    fmt.Println("翻倍:", doubles)  // [2 4 6 8 10]
}
\`\`\`

#### 2. 函数作为返回值

\`\`\`go
package main

import "fmt"

func multiplier(factor int) func(int) int {
    return func(n int) int {
        return n * factor
    }
}

func main() {
    double := multiplier(2)
    triple := multiplier(3)

    fmt.Println(double(5))  // 10
    fmt.Println(triple(5))  // 15
}
\`\`\`

### 十二、recover：捕获 panic

Go 用 \`panic\`/\`recover\` 处理严重错误，类似其他语言的 \`throw\`/\`catch\`，但仅用于不可恢复的场景。

\`\`\`go
package main

import "fmt"

func riskyFunc() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("捕获 panic:", r)
        }
    }()
    panic("出错了！")
}

func main() {
    riskyFunc()
    fmt.Println("继续执行")
}
\`\`\`

输出：

\`\`\`
捕获 panic: 出错了！
继续执行
\`\`\`

> **注意**：\`recover\` 必须在 \`defer\` 中调用才有效。\`panic\` 应该只用于真正不可恢复的错误，普通错误用 \`error\` 返回值。

### 十三、函数综合示例

\`\`\`go
package main

import (
    "errors"
    "fmt"
)

// 1. 多返回值 + 错误处理
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("除数不能为零")
    }
    return a / b, nil
}

// 2. 命名返回值
func swap(a, b int) (first, second int) {
    first = b
    second = a
    return
}

// 3. 可变参数
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

// 4. 高阶函数
func apply(nums []int, f func(int) int) []int {
    result := make([]int, len(nums))
    for i, n := range nums {
        result[i] = f(n)
    }
    return result
}

// 5. 闭包：计数器
func makeCounter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

// 6. defer 演示
func deferDemo() {
    fmt.Println("进入 deferDemo")
    for i := 1; i <= 3; i++ {
        defer fmt.Printf("defer %d\\n", i)
    }
    fmt.Println("离开 deferDemo")
}

func main() {
    // 测试多返回值
    fmt.Println("=== 多返回值 ===")
    if q, err := divide(10, 3); err == nil {
        fmt.Printf("10 / 3 = %d\\n", q)
    }
    if _, err := divide(10, 0); err != nil {
        fmt.Println("错误:", err)
    }

    // 测试命名返回值
    fmt.Println("\\n=== 命名返回值 ===")
    a, b := swap(1, 2)
    fmt.Printf("swap(1, 2) = %d, %d\\n", a, b)

    // 测试可变参数
    fmt.Println("\\n=== 可变参数 ===")
    fmt.Println("sum(1,2,3) =", sum(1, 2, 3))
    fmt.Println("sum(1,2,3,4,5) =", sum(1, 2, 3, 4, 5))

    // 测试高阶函数
    fmt.Println("\\n=== 高阶函数 ===")
    nums := []int{1, 2, 3, 4, 5}
    squares := apply(nums, func(n int) int { return n * n })
    fmt.Println("平方:", squares)

    // 测试闭包
    fmt.Println("\\n=== 闭包 ===")
    counter := makeCounter()
    fmt.Println(counter())
    fmt.Println(counter())
    fmt.Println(counter())

    // 测试 defer
    fmt.Println("\\n=== defer ===")
    deferDemo()
}
\`\`\`

输出：

\`\`\`
=== 多返回值 ===
10 / 3 = 3
错误: 除数不能为零

=== 命名返回值 ===
swap(1, 2) = 2, 1

=== 可变参数 ===
sum(1,2,3) = 6
sum(1,2,3,4,5) = 15

=== 高阶函数 ===
平方: [1 4 9 16 25]

=== 闭包 ===
1
2
3

=== defer ===
进入 deferDemo
离开 deferDemo
defer 3
defer 2
defer 1
\`\`\`

### 十四、Go vs Java/C# 函数对比

| 特性 | Go | Java | C# |
| --- | --- | --- | --- |
| 多返回值 | 支持 | 不支持 | 元组 (C# 7+) |
| 命名返回值 | 支持 | 不支持 | 不支持 |
| 方法重载 | 不支持 | 支持 | 支持 |
| 默认参数 | 不支持 | 支持 | 支持 |
| 可变参数 | \`...int\` | \`int...\` | \`params int[]\` |
| 闭包 | 支持 | Lambda | Lambda |
| defer | 支持 | try-finally | using/try-finally |
| 错误处理 | 多返回值 | try-catch | try-catch |

### 十五、本章小结

- 函数定义：\`func name(params) returns {}\`。
- **多返回值**是 Go 标志性特性，错误用返回值传递。
- **命名返回值**：\`func f() (q, r int)\`，可裸 \`return\`。
- **可变参数**：\`nums ...int\`，传切片用 \`slice...\`。
- **匿名函数**：\`func() {...}\`，可立即调用。
- **闭包**：引用外部变量的函数，"记住"外部状态。
- **defer**：延迟执行，LIFO 顺序，参数立即求值，用于资源清理。
- **init 函数**：\`main\` 前自动执行，用于初始化。
- **高阶函数**：函数作为参数或返回值。
- **recover**：在 \`defer\` 中捕获 \`panic\`，仅用于严重错误。
- Go 没有重载、默认参数、try-catch——这是设计简化。

下一章讲数组、切片与字符串——Go 数据容器的核心。`,
  },

  // ============================================================
  // 第七章：数组、切片与字符串
  // ============================================================
  {
    id: 'go-ch07',
    group: '第二部分 语法进阶',
    icon: '📚',
    title: '数组、切片与字符串',
    content: `## 第七章　数组、切片与字符串

数组、切片和字符串是 Go 最常用的数据容器。**数组和切片的区别**是 Go 新手最大的坑：数组是定长值类型，切片是变长引用类型。这一章详细讲解。

### 一、数组（Array）

#### 1. 基本语法

Go 数组是**定长**的，长度是类型的一部分：

\`\`\`go
package main

import "fmt"

func main() {
    // 1. 声明指定大小
    var arr1 [5]int  // [0 0 0 0 0]，零值
    fmt.Println(arr1)

    // 2. 声明并初始化
    arr2 := [3]int{1, 2, 3}
    fmt.Println(arr2)

    // 3. 让编译器数长度
    arr3 := [...]int{10, 20, 30, 40}
    fmt.Println(arr3)
    fmt.Printf("长度: %d\\n", len(arr3))

    // 4. 指定位置初始化
    arr4 := [5]int{1: 10, 3: 30}  // 索引 1 和 3 赋值，其余 0
    fmt.Println(arr4)  // [0 10 0 30 0]
}
\`\`\`

输出：

\`\`\`
[0 0 0 0 0]
[1 2 3]
[10 20 30 40]
长度: 4
[0 10 0 30 0]
\`\`\`

#### 2. 数组是值类型（重要！）

Go 数组赋值是**复制**，不是引用：

\`\`\`go
package main

import "fmt"

func main() {
    arr1 := [3]int{1, 2, 3}
    arr2 := arr1  // 复制
    arr2[0] = 99
    fmt.Println("arr1:", arr1)  // [1 2 3]，没变
    fmt.Println("arr2:", arr2)  // [99 2 3]
}
\`\`\`

> **这是 Go 与 Java/C# 的重大区别**：Java/C# 的数组是引用类型，赋值是引用复制；Go 的数组是值类型，赋值是值复制。函数传数组也是复制——大数组传参性能差，所以 Go 实际多用切片。

#### 3. 传数组给函数

\`\`\`go
package main

import "fmt"

func modify(arr [3]int) {
    arr[0] = 99  // 不影响原数组（值复制）
    fmt.Println("函数内:", arr)
}

func main() {
    arr := [3]int{1, 2, 3}
    modify(arr)
    fmt.Println("函数外:", arr)  // 原数组不变
}
\`\`\`

输出：

\`\`\`
函数内: [99 2 3]
函数外: [1 2 3]
\`\`\`

#### 4. 遍历数组

\`\`\`go
package main

import "fmt"

func main() {
    arr := [3]string{"Go", "Java", "C#"}

    // for range
    for index, value := range arr {
        fmt.Printf("%d: %s\\n", index, value)
    }

    // 传统 for
    for i := 0; i < len(arr); i++ {
        fmt.Println(arr[i])
    }
}
\`\`\`

#### 5. 多维数组

\`\`\`go
package main

import "fmt"

func main() {
    var matrix [3][3]int = [3][3]int{
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9},
    }

    for _, row := range matrix {
        for _, val := range row {
            fmt.Printf("%d ", val)
        }
        fmt.Println()
    }
}
\`\`\`

输出：

\`\`\`
1 2 3
4 5 6
7 8 9
\`\`\`

### 二、切片（Slice）——Go 的核心数据结构

切片是 Go 最常用的数据结构，是变长、引用类型的"动态数组"。

#### 1. 切片 vs 数组

| 特性 | 数组 \`[n]T\` | 切片 \`[]T\` |
| --- | --- | --- |
| 长度 | 固定 | 可变 |
| 类型 | 值类型 | 引用类型 |
| 赋值 | 复制值 | 复制引用 |
| 零值 | 各元素零值 | nil |
| 声明 | \`[3]int\` | \`[]int\` |

#### 2. 创建切片

\`\`\`go
package main

import "fmt"

func main() {
    // 1. 字面量
    s1 := []int{1, 2, 3}
    fmt.Println(s1)

    // 2. make：make([]T, len, cap)
    s2 := make([]int, 5)        // 长度 5，容量 5
    fmt.Println(s2)              // [0 0 0 0 0]

    s3 := make([]int, 3, 10)    // 长度 3，容量 10
    fmt.Println(s3)             // [0 0 0]
    fmt.Printf("len=%d cap=%d\\n", len(s3), cap(s3))

    // 3. 从数组切片
    arr := [5]int{10, 20, 30, 40, 50}
    s4 := arr[1:4]  // 索引 1 到 3（不含 4）
    fmt.Println(s4)  // [20 30 40]

    // 4. nil 切片
    var s5 []int
    fmt.Println(s5, len(s5), cap(s5))  // [] 0 0
    fmt.Println(s5 == nil)  // true
}
\`\`\`

#### 3. len 和 cap

- \`len\`：切片当前长度（元素个数）。
- \`cap\`：切片容量（底层数组从切片开始到末尾的元素数）。

\`\`\`go
package main

import "fmt"

func main() {
    arr := [5]int{10, 20, 30, 40, 50}
    s := arr[1:3]  // [20 30]
    fmt.Printf("len=%d cap=%d\\n", len(s), cap(s))  // len=2 cap=4
}
\`\`\`

#### 4. append：追加元素

\`\`\`go
package main

import "fmt"

func main() {
    s := []int{1, 2, 3}
    s = append(s, 4)         // 追加一个
    fmt.Println(s)           // [1 2 3 4]

    s = append(s, 5, 6, 7)   // 追加多个
    fmt.Println(s)           // [1 2 3 4 5 6 7]

    s2 := []int{100, 200}
    s = append(s, s2...)     // 追加另一个切片
    fmt.Println(s)           // [1 2 3 4 5 6 7 100 200]
}
\`\`\`

> **注意**：\`append\` 返回新切片，必须接收返回值。原切片可能不变（容量够时）或指向新底层数组（容量不够时）。

#### 5. append 的容量增长

\`\`\`go
package main

import "fmt"

func main() {
    var s []int
    for i := 0; i < 10; i++ {
        s = append(s, i)
        fmt.Printf("len=%d cap=%d %v\\n", len(s), cap(s), s)
    }
}
\`\`\`

输出（容量增长规律）：

\`\`\`
len=1 cap=1 [0]
len=2 cap=2 [0 1]
len=3 cap=4 [0 1 2]
len=4 cap=4 [0 1 2 3]
len=5 cap=8 [0 1 2 3 4]
...
\`\`\`

> **容量增长策略**：通常按 2 倍增长（小切片），大切片按 1.25 倍。具体由运行时决定。

#### 6. copy：复制切片

\`\`\`go
package main

import "fmt"

func main() {
    src := []int{1, 2, 3, 4, 5}
    dst := make([]int, 3)
    n := copy(dst, src)  // 复制 min(len(dst), len(src)) 个
    fmt.Println(n, dst)  // 3 [1 2 3]

    // 部分复制
    dst2 := make([]int, 5)
    copy(dst2[1:4], src[1:4])
    fmt.Println(dst2)  // [0 2 3 4 0]
}
\`\`\`

#### 7. 切片表达式 s[low:high]

\`\`\`go
package main

import "fmt"

func main() {
    s := []int{10, 20, 30, 40, 50}

    fmt.Println(s[1:3])   // [20 30]，索引 1 到 2
    fmt.Println(s[:3])    // [10 20 30]，从头到 2
    fmt.Println(s[2:])    // [30 40 50]，从 2 到尾
    fmt.Println(s[:])    // [10 20 30 40 50]，全部

    // 三索引切片 [low:high:max]，限制容量
    s2 := s[1:3:4]
    fmt.Printf("len=%d cap=%d %v\\n", len(s2), cap(s2), s2)  // len=2 cap=3 [20 30]
}
\`\`\`

#### 8. 切片是引用类型（重要！）

\`\`\`go
package main

import "fmt"

func modify(s []int) {
    s[0] = 99
    fmt.Println("函数内:", s)
}

func main() {
    s := []int{1, 2, 3}
    modify(s)
    fmt.Println("函数外:", s)  // [99 2 3]，原切片被修改
}
\`\`\`

> **与数组的区别**：数组传参是值复制，切片传参是引用。这就是 Go 实际多用切片的原因。

#### 9. 切片共享底层数组

\`\`\`go
package main

import "fmt"

func main() {
    s := []int{1, 2, 3, 4, 5}
    s1 := s[1:3]  // [2 3]
    s2 := s[2:4]  // [3 4]

    s1[1] = 99  // 修改 s1 的元素
    fmt.Println(s1)  // [2 99]
    fmt.Println(s2)  // [99 4]，s2 也被影响！共享底层
    fmt.Println(s)   // [1 2 99 4 5]
}
\`\`\`

> **警告**：这是 Go 切片最坑的地方。要避免共享，用 \`copy\` 复制。

#### 10. 删除元素

Go 没有内置删除，用切片操作：

\`\`\`go
package main

import "fmt"

func main() {
    s := []int{1, 2, 3, 4, 5}

    // 删除索引 2 的元素
    i := 2
    s = append(s[:i], s[i+1:]...)
    fmt.Println(s)  // [1 2 4 5]
}
\`\`\`

#### 11. 二维切片

\`\`\`go
package main

import "fmt"

func main() {
    // 错误写法：make([][]int, 3) 后每行还是 nil
    // 正确写法：逐行初始化
    matrix := make([][]int, 3)
    for i := range matrix {
        matrix[i] = make([]int, 3)
    }

    for i := 0; i < 3; i++ {
        for j := 0; j < 3; j++ {
            matrix[i][j] = i*3 + j + 1
        }
    }

    for _, row := range matrix {
        fmt.Println(row)
    }
}
\`\`\`

输出：

\`\`\`
[1 2 3]
[4 5 6]
[7 8 9]
\`\`\`

### 三、字符串（string）

Go 字符串是**不可变**的字节序列，通常存 UTF-8 文本。

#### 1. 基本操作

\`\`\`go
package main

import "fmt"

func main() {
    s := "Hello, World!"

    fmt.Println(len(s))              // 13，字节数
    fmt.Println(s[0])               // 72，'H' 的字节值
    fmt.Printf("%c\\n", s[0])        // H
    fmt.Println(s[0:5])             // Hello，切片
    fmt.Println(s[7:])               // World!

    // s[0] = 'h'  // 编译错误：字符串不可变
}
\`\`\`

#### 2. 字符串不可变

字符串不能修改，要"修改"先转 \`[]byte\` 或 \`[]rune\`：

\`\`\`go
package main

import "fmt"

func main() {
    s := "hello"
    b := []byte(s)  // 转 []byte
    b[0] = 'H'
    s = string(b)   // 转回 string
    fmt.Println(s)   // Hello
}
\`\`\`

#### 3. UTF-8 与 rune

Go 字符串按 UTF-8 存储，一个中文字符占 3 字节。用 \`rune\` 处理字符：

\`\`\`go
package main

import "fmt"

func main() {
    s := "Go语言"

    // 字节数
    fmt.Println(len(s))  // 8（G, o 各 1，语、言 各 3）

    // 字符数（rune 数）
    fmt.Println(len([]rune(s)))  // 4

    // range 遍历 rune
    for i, r := range s {
        fmt.Printf("%d: %c\\n", i, r)
    }
}
\`\`\`

输出：

\`\`\`
8
4
0: G
1: o
2: 语
5: 言
\`\`\`

#### 4. []byte 与 string 转换

\`\`\`go
package main

import "fmt"

func main() {
    s := "Hello"
    b := []byte(s)     // string → []byte
    s2 := string(b)    // []byte → string

    fmt.Println(b)     // [72 101 108 108 111]
    fmt.Println(s2)    // Hello
}
\`\`\`

> **注意**：转换会复制内存，有性能开销。频繁转换要考虑性能。

#### 5. strings 包

标准库 \`strings\` 提供常用操作：

\`\`\`go
package main

import (
    "fmt"
    "strings"
)

func main() {
    s := "Hello, World!"

    fmt.Println(strings.ToUpper(s))             // HELLO, WORLD!
    fmt.Println(strings.ToLower(s))             // hello, world!
    fmt.Println(strings.Contains(s, "World"))  // true
    fmt.Println(strings.Contains(s, "Go"))     // false
    fmt.Println(strings.HasPrefix(s, "Hello")) // true
    fmt.Println(strings.HasSuffix(s, "!"))     // true
    fmt.Println(strings.Index(s, "World"))     // 7
    fmt.Println(strings.Replace(s, "World", "Go", 1))  // Hello, Go!
    fmt.Println(strings.ReplaceAll(s, "l", "L"))       // HeLLo, WorLd!
    fmt.Println(strings.Count(s, "l"))         // 3
    fmt.Println(strings.Repeat("ab", 3))       // ababab

    // 分割
    parts := strings.Split("a,b,c,d", ",")
    fmt.Println(parts)  // [a b c d]

    // 连接
    joined := strings.Join([]string{"a", "b", "c"}, "-")
    fmt.Println(joined)  // a-b-c

    // 去首尾空白
    fmt.Println(strings.TrimSpace("  hello  "))  // hello

    // 分割字段
    fields := strings.Fields("  hello   world  ")
    fmt.Println(fields)  // [hello world]
}
\`\`\`

#### 6. strconv 包

字符串与其他类型转换：

\`\`\`go
package main

import (
    "fmt"
    "strconv"
)

func main() {
    // 字符串转整数
    n, err := strconv.Atoi("42")
    fmt.Println(n, err)  // 42 <nil>

    n2, err := strconv.Atoi("abc")
    fmt.Println(n2, err)  // 0 错误信息

    // 整数转字符串
    s := strconv.Itoa(42)
    fmt.Println(s)  // "42"

    // 字符串转浮点
    f, _ := strconv.ParseFloat("3.14", 64)
    fmt.Println(f)  // 3.14

    // 浮点转字符串
    fmt.Println(strconv.FormatFloat(3.14, 'f', 2, 64))  // 3.14

    // 字符串转布尔
    b, _ := strconv.ParseBool("true")
    fmt.Println(b)  // true

    // 布尔转字符串
    fmt.Println(strconv.FormatBool(true))  // true
}
\`\`\`

#### 7. 字符串拼接性能对比

\`\`\`go
package main

import (
    "fmt"
    "strings"
    "time"
)

func main() {
    const N = 100000

    // 方法 1：+ 拼接（每次创建新字符串，慢）
    start := time.Now()
    s := ""
    for i := 0; i < N; i++ {
        s += "a"
    }
    fmt.Println("+ 拼接耗时:", time.Since(start))

    // 方法 2：strings.Builder（推荐，快）
    start = time.Now()
    var builder strings.Builder
    for i := 0; i < N; i++ {
        builder.WriteString("a")
    }
    _ = builder.String()
    fmt.Println("Builder 耗时:", time.Since(start))

    // 方法 3：strings.Join
    start = time.Now()
    parts := make([]string, N)
    for i := 0; i < N; i++ {
        parts[i] = "a"
    }
    _ = strings.Join(parts, "")
    fmt.Println("Join 耗时:", time.Since(start))
}
\`\`\`

> **性能结论**：
> - 少量拼接：\`+\` 或 \`fmt.Sprintf\` 即可。
> - 循环拼接：用 \`strings.Builder\`，性能最好。
> - 已有切片：用 \`strings.Join\`。

### 四、综合示例

\`\`\`go
package main

import (
    "fmt"
    "strings"
)

func main() {
    // 1. 数组操作
    fmt.Println("=== 数组 ===")
    arr := [...]int{5, 3, 8, 1, 9}
    fmt.Println("原数组:", arr)

    // 2. 切片操作
    fmt.Println("\\n=== 切片 ===")
    s := []int{5, 3, 8, 1, 9}
    fmt.Println("原切片:", s)

    // 追加
    s = append(s, 7, 4, 6, 2)
    fmt.Println("追加后:", s)

    // 切片
    sub := s[2:5]
    fmt.Println("s[2:5]:", sub)

    // 3. 字符串操作
    fmt.Println("\\n=== 字符串 ===")
    text := "Hello, World!"
    fmt.Println("原文:", text)
    fmt.Println("大写:", strings.ToUpper(text))
    fmt.Println("小写:", strings.ToLower(text))
    fmt.Println("包含 'World':", strings.Contains(text, "World"))
    fmt.Println("替换:", strings.Replace(text, "World", "Go", 1))

    // 4. 字符串分割
    fmt.Println("\\n=== 分割 ===")
    csv := "张三,李四,王五"
    names := strings.Split(csv, ",")
    for i, name := range names {
        fmt.Printf("%d: %s\\n", i+1, name)
    }

    // 5. strings.Builder
    fmt.Println("\\n=== Builder ===")
    var builder strings.Builder
    builder.WriteString("第一行\\n")
    builder.WriteString("第二行\\n")
    builder.WriteString("第三行")
    fmt.Println(builder.String())

    // 6. 中文字符串
    fmt.Println("\\n=== 中文处理 ===")
    cn := "Go语言"
    fmt.Printf("字节数: %d\\n", len(cn))
    fmt.Printf("字符数: %d\\n", len([]rune(cn)))
    for i, r := range cn {
        fmt.Printf("%d: %c\\n", i, r)
    }
}
\`\`\`

### 五、Go vs Java/C# 对比

| 特性 | Go | Java | C# |
| --- | --- | --- | --- |
| 数组类型 | 值类型 | 引用类型 | 引用类型 |
| 动态数组 | 切片 \`[]T\` | \`ArrayList\` | \`List<T>\` |
| 字符串 | 不可变 UTF-8 | 不可变 UTF-16 | 不可变 UTF-16 |
| 字符类型 | \`rune\`（int32） | \`char\` | \`char\` |
| 字符串拼接 | \`+\` 或 Builder | \`+\` 或 StringBuilder | \`+\` 或 StringBuilder |
| 遍历字符 | \`for range\` | \`charAt(i)\` | \`foreach\` |

### 六、本章小结

- **数组 \`[n]T\`**：定长，值类型，赋值是复制。实际使用少。
- **切片 \`[]T\`**：变长，引用类型，Go 最常用数据结构。
- 切片创建：\`make([]T, len, cap)\`、字面量、数组切片。
- \`append\` 追加，\`copy\` 复制，注意 \`append\` 返回新切片。
- 切片共享底层数组——修改要注意影响。
- **字符串**：不可变字节序列，UTF-8 编码。
- \`len(s)\` 是字节数，要按字符遍历用 \`for range\` 或转 \`[]rune\`。
- \`strings\` 包：\`Contains\`、\`Index\`、\`Replace\`、\`Split\`、\`Join\`、\`ToUpper\` 等。
- \`strconv\` 包：\`Atoi\`、\`Itoa\`、\`ParseFloat\` 等。
- 字符串拼接：少量用 \`+\`，循环用 \`strings.Builder\`。

下一章讲指针与结构体——Go 没有 class，用 struct + 方法实现面向对象。`,
  },

  // ============================================================
  // 第八章：指针与结构体
  // ============================================================
  {
    id: 'go-ch08',
    group: '第二部分 语法进阶',
    icon: '📍',
    title: '指针与结构体',
    content: `## 第八章　指针与结构体

Go 保留了 C 语言的指针（但去掉了指针运算），用结构体（struct）替代 class。Go **没有继承**，用**组合**代替。这一章讲指针、结构体，以及 Go 的面向对象思想。

### 一、指针（Pointer）

#### 1. 什么是指针

指针是变量的内存地址。

- \`&\` 取地址：\`&x\` 得到 \`x\` 的地址。
- \`*\` 解引用：\`*p\` 得到指针 \`p\` 指向的值。

\`\`\`go
package main

import "fmt"

func main() {
    x := 42
    p := &x  // p 是 *int 类型，指向 x

    fmt.Println(x)    // 42
    fmt.Println(p)    // 0xc0000a2000（地址）
    fmt.Println(*p)   // 42，解引用

    *p = 100  // 通过指针修改 x
    fmt.Println(x)    // 100
}
\`\`\`

#### 2. 指针类型

\`\`\`go
package main

import "fmt"

func main() {
    var p *int  // 指向 int 的指针，零值是 nil
    fmt.Println(p)  // <nil>

    x := 10
    p = &x
    fmt.Println(*p)  // 10
}
\`\`\`

#### 3. new 函数

\`new(T)\` 分配一个 T 类型的零值，返回指针：

\`\`\`go
package main

import "fmt"

func main() {
    p := new(int)  // *int，指向 0
    fmt.Println(*p)  // 0
    *p = 100
    fmt.Println(*p)  // 100
}
\`\`\`

> **注意**：Go 中 \`new\` 用得不多，更常用 \`&T{}\` 或 \`:=\` 简短声明。\`new\` 主要用于基本类型。

#### 4. nil 指针

指针的零值是 \`nil\`，解引用 nil 指针会 panic：

\`\`\`go
package main

import "fmt"

func main() {
    var p *int
    fmt.Println(p)  // <nil>

    // *p = 10  // panic: runtime error: invalid memory address
}
\`\`\`

#### 5. 指针与值传递的区别

这是指针最重要的用途——修改函数外的变量：

\`\`\`go
package main

import "fmt"

// 值传递：不影响原变量
func incrementByValue(x int) {
    x++
    fmt.Println("函数内（值）:", x)
}

// 指针传递：影响原变量
func incrementByPointer(x *int) {
    *x++
    fmt.Println("函数内（指针）:", *x)
}

func main() {
    n := 10
    incrementByValue(n)
    fmt.Println("调用后（值）:", n)  // 10

    n = 10
    incrementByPointer(&n)
    fmt.Println("调用后（指针）:", n)  // 11
}
\`\`\`

输出：

\`\`\`
函数内（值）: 11
调用后（值）: 10
函数内（指针）: 11
调用后（指针）: 11
\`\`\`

> **Java/C# 对比**：
> - Java 基本类型是值传递，对象是引用传递（实际是引用的值传递）。
> - C# 有 \`ref\`、\`out\` 关键字，Go 用指针实现类似效果。
> - Go 一切都是值传递，要修改原变量必须传指针。

#### 6. 指针与切片

切片本身已经是引用类型，传切片不需要再传指针：

\`\`\`go
package main

import "fmt"

func modifySlice(s []int) {
    s[0] = 99  // 直接修改，不需要 *s
}

func main() {
    s := []int{1, 2, 3}
    modifySlice(s)
    fmt.Println(s)  // [99 2 3]
}
\`\`\`

> **注意**：切片、map、channel 都是引用类型，传参自动是引用效果，不需要指针。指针主要用于基本类型和结构体。

#### 7. Go 没有指针运算

\`\`\`go
package main

func main() {
    arr := [3]int{1, 2, 3}
    p := &arr[0]
    // p++        // 编译错误：Go 不允许指针运算
    // *(p + 1)   // 编译错误
    _ = p
}
\`\`\`

> **与 C 的区别**：C 可以 \`p++\` 移动指针，Go 不允许。这让 Go 指针更安全，避免越界访问。

### 二、结构体（struct）

结构体是 Go 组织数据的方式，相当于其他语言的 class（但只有数据，方法分开定义）。

#### 1. 定义结构体

\`\`\`go
package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

func main() {
    // 1. 字面量初始化
    p1 := Person{Name: "张三", Age: 25}
    fmt.Println(p1)  // {张三 25}

    // 2. 按顺序初始化
    p2 := Person{"李四", 30}
    fmt.Println(p2)

    // 3. 零值初始化
    var p3 Person
    fmt.Println(p3)  // { 0}，Name=""，Age=0

    // 4. new 返回指针
    p4 := new(Person)
    p4.Name = "王五"
    p4.Age = 28
    fmt.Println(*p4)
}
\`\`\`

输出：

\`\`\`
{张三 25}
{李四 30}
{ 0}
{王五 28}
\`\`\`

#### 2. 字段访问

用 \`.\` 访问字段：

\`\`\`go
package main

import "fmt"

type Point struct {
    X, Y int
}

func main() {
    p := Point{X: 3, Y: 4}
    fmt.Println(p.X, p.Y)  // 3 4

    p.X = 10
    fmt.Println(p)  // {10 4}
}
\`\`\`

#### 3. 结构体是值类型

\`\`\`go
package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

func main() {
    p1 := Person{Name: "张三", Age: 25}
    p2 := p1  // 复制
    p2.Name = "李四"
    fmt.Println(p1)  // {张三 25}，原值不变
    fmt.Println(p2)  // {李四 25}
}
\`\`\`

> **重要**：结构体是值类型，赋值和传参都是复制。要修改原结构体，传指针。

#### 4. 结构体指针

\`\`\`go
package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

func birthday(p *Person) {
    p.Age++  // 通过指针修改
}

func main() {
    p := &Person{Name: "张三", Age: 25}
    birthday(p)
    fmt.Println(p.Age)  // 26
}
\`\`\`

#### 5. 语法糖：指针访问字段

Go 自动解引用，\`p.Name\` 等价于 \`(*p).Name\`：

\`\`\`go
package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

func main() {
    p := &Person{Name: "张三", Age: 25}
    fmt.Println(p.Name)       // 张三，自动解引用
    fmt.Println((*p).Name)    // 张三，显式解引用
}
\`\`\`

#### 6. 结构体嵌套

结构体可以包含其他结构体：

\`\`\`go
package main

import "fmt"

type Address struct {
    City    string
    Country string
}

type Person struct {
    Name    string
    Age     int
    Address Address  // 嵌套结构体
}

func main() {
    p := Person{
        Name: "张三",
        Age:  25,
        Address: Address{
            City:    "北京",
            Country: "中国",
        },
    }
    fmt.Println(p.Name)
    fmt.Println(p.Address.City)  // 访问嵌套字段
    fmt.Println(p.Address.Country)
}
\`\`\`

#### 7. 匿名字段（嵌入）

Go 的"继承"机制——匿名字段：

\`\`\`go
package main

import "fmt"

type Animal struct {
    Name string
}

func (a Animal) Eat() {
    fmt.Println(a.Name, "在吃东西")
}

type Dog struct {
    Animal  // 匿名字段，嵌入 Animal
    Breed string
}

func main() {
    d := Dog{
        Animal: Animal{Name: "旺财"},
        Breed:  "金毛",
    }

    // 直接访问嵌入字段的方法
    d.Eat()  // 旺财 在吃东西

    // 也可以显式访问
    d.Animal.Eat()  // 旺财 在吃东西

    fmt.Println(d.Name)       // 旺财，直接访问
    fmt.Println(d.Animal.Name) // 旺财，显式访问
    fmt.Println(d.Breed)       // 金毛
}
\`\`\`

> **这就是 Go 的"继承"**：通过嵌入（组合）复用字段和方法。Go 称之为"组合优于继承"。

#### 8. 结构体标签（Tag）

标签是字段的元信息，常用于 JSON、数据库映射：

\`\`\`go
package main

import (
    "encoding/json"
    "fmt"
)

type User struct {
    ID       int    \`json:"id"\`
    Username string \`json:"username"\`
    Email    string \`json:"email,omitempty"\`
    Password string \`json:"-"\`  // 不序列化
}

func main() {
    u := User{
        ID:       1,
        Username: "zhangsan",
        Email:    "zhangsan@example.com",
        Password: "123456",
    }

    data, _ := json.Marshal(u)
    fmt.Println(string(data))
    // {"id":1,"username":"zhangsan","email":"zhangsan@example.com"}
}
\`\`\`

输出：

\`\`\`
{"id":1,"username":"zhangsan","email":"zhangsan@example.com"}
\`\`\`

**注意**：Password 因 \`json:"-"\` 不被序列化。

#### 9. 结构体比较

如果所有字段都可比较，结构体也可比较（用 \`==\`）：

\`\`\`go
package main

import "fmt"

type Point struct {
    X, Y int
}

func main() {
    p1 := Point{1, 2}
    p2 := Point{1, 2}
    p3 := Point{1, 3}

    fmt.Println(p1 == p2)  // true
    fmt.Println(p1 == p3)  // false
}
\`\`\`

> **注意**：如果结构体含切片、map 等不可比较字段，则结构体不可比较，必须用 \`reflect.DeepEqual\`。

#### 10. 结构体方法

方法是与类型关联的函数，下一章详讲，这里先看简单示例：

\`\`\`go
package main

import "fmt"

type Rectangle struct {
    Width, Height float64
}

// 值接收者方法
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// 指针接收者方法
func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

func main() {
    r := Rectangle{Width: 3, Height: 4}
    fmt.Println("面积:", r.Area())  // 12

    r.Scale(2)
    fmt.Println("放大后:", r)        // {6 8}
    fmt.Println("新面积:", r.Area())  // 48
}
\`\`\`

> **值接收者 vs 指针接收者**：
> - 值接收者：方法内修改不影响原对象（复制）。
> - 指针接收者：方法内修改影响原对象。
> - 一般建议统一用指针接收者（性能 + 一致性）。

### 三、Go 没有继承（组合代替继承）

Go 没有类继承，但有嵌入（embedding）实现代码复用：

#### 1. 嵌入实现复用

\`\`\`go
package main

import "fmt"

// 基础能力
type Logger struct{}

func (l Logger) Log(msg string) {
    fmt.Println("[LOG]", msg)
}

type Validator struct{}

func (v Validator) Validate(data string) bool {
    return len(data) > 0
}

// Service 嵌入 Logger 和 Validator
type Service struct {
    Logger      // 嵌入 Logger
    Validator   // 嵌入 Validator
}

func (s *Service) Process(data string) {
    if !s.Validate(data) {  // 直接调用 Validator 的方法
        s.Log("数据无效")
        return
    }
    s.Log("处理数据: " + data)
}

func main() {
    svc := &Service{}
    svc.Process("hello")
    svc.Process("")
}
\`\`\`

输出：

\`\`\`
[LOG] 处理数据: hello
[LOG] 数据无效
\`\`\`

> **Java/C# 对比**：
> - Java：\`class Service extends Logger\`（单继承）或 \`implements\`（接口）。
> - Go：\`type Service struct { Logger }\`（嵌入），可嵌入多个——更接近"组合"。

#### 2. 嵌入与重写

\`\`\`go
package main

import "fmt"

type Animal struct{}

func (a Animal) Speak() string {
    return "动物叫声"
}

func (a Animal) Describe() string {
    return "我是动物，" + a.Speak()  // 调用 Speak
}

type Dog struct {
    Animal  // 嵌入
}

// 重写 Speak
func (d Dog) Speak() string {
    return "汪汪"
}

func main() {
    d := Dog{}
    fmt.Println(d.Speak())      // 汪汪
    fmt.Println(d.Describe())   // 我是动物，动物叫声
    fmt.Println(d.Animal.Describe())  // 我是动物，动物叫声
}
\`\`\`

> **注意**：Go 的"重写"和 Java 不同。\`Describe\` 是 Animal 的方法，调用的是 \`Animal.Speak\`，不是 \`Dog.Speak\`。Go 没有动态分派（除非用接口）。这是 Go 设计的简化。

### 四、综合示例

\`\`\`go
package main

import (
    "fmt"
)

// 1. 指针演示
func increment(x *int) {
    *x++
}

// 2. 结构体
type Point struct {
    X, Y int
}

func (p Point) Distance() float64 {
    // 简化：返回距离平方
    return float64(p.X*p.X + p.Y*p.Y)
}

type Rectangle struct {
    Width, Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r *Rectangle) Scale(factor float64) {
    r.Width *= factor
    r.Height *= factor
}

// 3. 嵌入
type Shape struct {
    Name string
}

func (s Shape) Describe() string {
    return "形状: " + s.Name
}

type ColoredRectangle struct {
    Rectangle  // 嵌入 Rectangle
    Color string
}

// 4. 结构体标签
type User struct {
    ID   int    \`json:"id"\`
    Name string \`json:"name"\`
}

func main() {
    // 指针
    fmt.Println("=== 指针 ===")
    n := 10
    increment(&n)
    fmt.Println("n =", n)  // 11

    // Point
    fmt.Println("\\n=== Point ===")
    p := Point{3, 4}
    fmt.Println(p)
    fmt.Println("距离平方:", p.Distance())

    // Rectangle
    fmt.Println("\\n=== Rectangle ===")
    r := Rectangle{Width: 3, Height: 4}
    fmt.Printf("面积: %.0f\\n", r.Area())
    r.Scale(2)
    fmt.Printf("放大后: %.0fx%.0f, 面积: %.0f\\n", r.Width, r.Height, r.Area())

    // 嵌入
    fmt.Println("\\n=== 嵌入 ===")
    cr := ColoredRectangle{
        Rectangle: Rectangle{Width: 5, Height: 3},
        Color:     "红色",
    }
    fmt.Printf("颜色: %s, 面积: %.0f\\n", cr.Color, cr.Area())  // 调用嵌入的方法

    // 结构体值类型
    fmt.Println("\\n=== 值类型 ===")
    p1 := Point{1, 2}
    p2 := p1  // 复制
    p2.X = 99
    fmt.Printf("p1: %v, p2: %v\\n", p1, p2)  // p1 不变

    // 结构体指针
    fmt.Println("\\n=== 指针 ===")
    p3 := &Point{1, 2}
    p4 := p3
    p4.X = 99
    fmt.Printf("p3: %v, p4: %v\\n", p3, p4)  // 都变，因为是指针
}
\`\`\`

输出：

\`\`\`
=== 指针 ===
n = 11

=== Point ===
{3 4}
距离平方: 25

=== Rectangle ===
面积: 12
放大后: 6x8, 面积: 48

=== 嵌入 ===
颜色: 红色, 面积: 15

=== 值类型 ===
p1: {1 2}, p2: {99 2}

=== 指针 ===
p3: &{99 2}, p4: &{99 2}
\`\`\`

### 五、Go vs Java/C# 面向对象对比

| 特性 | Go | Java | C# |
| --- | --- | --- | --- |
| 类 | 无 class，用 struct | class | class |
| 继承 | 无，用嵌入组合 | 单继承 | 单继承 |
| 多态 | 用接口 | 接口 + 继承 | 接口 + 继承 |
| 构造函数 | 无，用工厂函数 | 有 | 有 |
| 方法 | 独立定义 | 在 class 内 | 在 class 内 |
| this/self | 无，用接收者变量 | this | this |
| 访问修饰 | 大写公开，小写私有 | public/private | public/private |
| 指针 | 有，但无运算 | 无（引用） | 无（引用） |

### 六、关键概念回顾

#### 1. 何时用指针

- 要在函数内修改原变量：传指针。
- 结构体较大，避免复制开销：传指针。
- 一致性：一个类型的方法集，要么都用值接收者，要么都用指针接收者。

#### 2. 何时用值

- 小结构体（几个基本类型字段）。
- 不需要修改原数据。
- map、slice、channel 已经是引用，不需要指针。

#### 3. Go 没有 class 的设计哲学

- 数据（struct）和行为（方法）分开，更清晰。
- 没有继承层次，避免"脆弱基类"问题。
- 用接口和组合，更灵活。

### 七、本章小结

- **指针**：\`&\` 取地址，\`*\` 解引用，\`new(T)\` 返回 \`*T\`。
- Go 指针**没有运算**（不能 \`p++\`），比 C 安全。
- 指针用于在函数内修改原变量，或避免大对象复制。
- **结构体** \`struct\`：组织数据的容器，是值类型。
- 结构体字面量：\`Person{Name: "张三", Age: 25}\`。
- **结构体嵌套**：实现数据组合。
- **匿名字段（嵌入）**：Go 的"继承"机制，复用字段和方法。
- **结构体标签** \`json:"..."\`：用于序列化、数据库映射等。
- **没有继承**：Go 用组合代替继承，更灵活。
- **方法**：值接收者（复制）vs 指针接收者（引用），建议统一用指针接收者。
- Go 面向对象：struct + 方法 + 接口，没有 class、继承、构造函数。

下一部分讲接口与错误处理——Go 类型系统的灵魂。`,
  },
];

export { chapters };
