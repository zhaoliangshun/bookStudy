// =============================================================
// Go 教程 - 第四批章节（第四部分 高级特性，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   go-ch13 : 第十三章 泛型（Go 1.18+）
//   go-ch14 : 第十四章 goroutine 与并发基础
//   go-ch15 : 第十五章 channel 与 select
//   go-ch16 : 第十六章 并发模式与 sync 包
//
// 所有 Go 代码示例均可直接 `go run` 运行。
// 适用版本：Go 1.22+（泛型需 Go 1.18+，部分特性需 1.21+）
// 设计哲学：CSP——"不要通过共享内存来通信，而应该通过通信来共享内存"
// =============================================================

const chapters = [
  // ============================================================
  // 第十三章：泛型（Go 1.18+）
  // ============================================================
  {
    id: 'go-ch13',
    group: '第四部分 高级特性',
    icon: '🎯',
    title: '泛型（Go 1.18+）',
    content: `## 第十三章　泛型（Go 1.18+）

### 一、泛型的历史与动机

Go 在长达十年的时间里都没有泛型。这是 Go 团队刻意的设计选择——他们追求简洁、快速编译、可读性，认为"接口 + 代码生成"已经能覆盖大部分复用场景。但这给开发者带来了实实在在的痛点。

#### 没有 泛型时的痛点

\`\`\`go
package main

import "fmt"

// 为每种类型写一份几乎相同的代码——"复制粘贴编程"
func MaxInt(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func MaxFloat64(a, b float64) float64 {
    if a > b {
        return a
    }
    return b
}

func MaxString(a, b string) string {
    if a > b {
        return a
    }
    return b
}

func main() {
    fmt.Println(MaxInt(3, 5))           // 5
    fmt.Println(MaxFloat64(3.14, 2.71)) // 3.14
    fmt.Println(MaxString("apple", "banana")) // banana
}
\`\`\`

#### 用 interface{} 的方案

\`\`\`go
package main

import "fmt"

func MaxAny(a, b interface{}) interface{} {
    // 运行期才能发现类型不匹配
    // 类型断言有开销，且类型安全丢失
    switch a.(type) {
    case int:
        ai, bi := a.(int), b.(int)
        if ai > bi {
            return ai
        }
        return bi
    case float64:
        af, bf := a.(float64), b.(float64)
        if af > bf {
            return af
        }
        return bf
    }
    return nil
}

func main() {
    // 编译期不报错，运行期返回 nil
    fmt.Println(MaxAny(3, "hello"))
}
\`\`\`

\`interface{}\` 方案的两大缺陷：

1. **类型不安全**：编译期无法发现"把 int 和 string 比较"的错误。
2. **性能损失**：值要"装箱"到 interface，产生额外内存分配；类型断言有运行期开销。

#### 泛型的时间线

- **2010 年**：Go 发布，没有泛型。
- **2011-2018 年**：社区多次提出泛型提案（Type Functions、Contracts 等），都被否决——简洁性优先。
- **2018 年**：Go 团队重新启动泛型设计。
- **2020 年**：发布 \` Contracts \` 草案。
- **2021 年**：简化为 \` type parameters \` 草案，加入 Go 1.17 预览。
- **2022 年 3 月**：**Go 1.18** 正式发布泛型——历经 12 年。

### 二、类型参数 [T any]

Go 泛型的核心语法是**类型参数**——在函数/类型名后用方括号声明。注意是方括号 \`[]\`，不是 Java/C# 的尖括号 \`<>\`（避免与 \`<\`、\`>\`、\`<<\` 等运算符冲突）。

#### 泛型函数

\`\`\`go
package main

import "fmt"

// T 是类型参数；any 是约束（任意类型）
func Max[T int | float64 | string](a, b T) T {
    if a > b {
        return a
    }
    return b
}

func main() {
    // 类型参数可省略，编译器自动推断
    fmt.Println(Max(3, 5))                  // 5
    fmt.Println(Max(3.14, 2.71))            // 3.14
    fmt.Println(Max("apple", "banana"))     // banana

    // 显式指定类型参数
    fmt.Println(Max[int](3, 5))             // 5
}
\`\`\`

#### 类型参数语法对比

| 语言 | 声明语法 | 调用语法 |
|------|---------|---------|
| Go | \`func Max[T any](a, b T) T\` | \`Max[int](3, 5)\` 或 \`Max(3, 5)\` |
| Java | \`<T> T max(T a, T b)\` | \`Max.max(3, 5)\` |
| C# | \`T Max<T>(T a, T b)\` | \`Max<int>(3, 5)\` 或 \`Max(3, 5)\` |

Go 选择方括号 \`[]\` 的原因：

1. 不与比较运算符 \`<\`、\`>\` 冲突。
2. 与切片/数组类型 \`[]int\` 视觉一致。
3. 与 map 类型 \`map[K]V\` 风格统一。

### 三、约束（Constraint）

类型参数不能是任意类型——必须有"约束"声明允许哪些类型。\`any\` 是一个预声明约束，等价于 \`interface{}\`，表示"任意类型"。

#### 1. 内置约束 any 与 comparable

\`\`\`go
package main

import "fmt"

// any 等价于 interface{}——任意类型
func Print[T any](v T) {
    fmt.Println(v)
}

// comparable 表示支持 == 和 != 的类型
// 所有基本类型、指针、channel、接口都满足 comparable
// 但切片、map、函数不满足
func Contains[T comparable](slice []T, target T) bool {
    for _, v := range slice {
        if v == target {
            return true
        }
    }
    return false
}

func main() {
    Print(42)
    Print("hello")
    Print([]int{1, 2, 3})

    fmt.Println(Contains([]int{1, 2, 3}, 2))           // true
    fmt.Println(Contains([]string{"a", "b"}, "c"))       // false
}
\`\`\`

#### 2. 类型联合（Type Union）

用 \`|\` 列出允许的类型：

\`\`\`go
package main

import "fmt"

// 数字类型联合
type Number interface {
    int | int8 | int16 | int32 | int64 |
    float32 | float64
}

func Sum[T Number](nums []T) T {
    var sum T
    for _, n := range nums {
        sum += n
    }
    return sum
}

func main() {
    fmt.Println(Sum([]int{1, 2, 3, 4, 5}))         // 15
    fmt.Println(Sum([]float64{1.5, 2.5, 3.0}))    // 7.0
}
\`\`\`

#### 3. ~T 近似类型（Underlying Type）

\`~int\` 表示"底层类型是 int 的所有类型"——包括自定义类型 \`type MyInt int\`。不加 \`~\` 只匹配 \`int\` 本身。

\`\`\`go
package main

import "fmt"

// 不加 ~：只匹配 int，不匹配 type MyInt int
type StrictInt interface {
    int
}

// 加 ~：匹配所有底层类型是 int 的类型
type LooseInt interface {
    ~int
}

func Double[T LooseInt](v T) T {
    return v * 2
}

// 自定义类型
type Score int
type Age int

func main() {
    var s Score = 100
    var a Age = 25

    // 由于约束是 ~int，自定义类型 Score、Age 都能用
    fmt.Println(Double(s))  // 200
    fmt.Println(Double(a))  // 50
    fmt.Println(Double(10)) // 20

    // 也可以约束多个底层类型
    type Celsius float64
    var temp Celsius = 36.5
    fmt.Println(Double(temp)) // 73

    // 注意：Double 返回的是原类型，不是 int
    fmt.Printf("%T\\n", Double(s)) // main.Score
}
\`\`\`

#### 4. 标准库 constraints 包

Go 1.18 引入 \`golang.org/x/exp/constraints\`（实验包），Go 1.21 起 \`cmp\` 包提供 \`Ordered\` 约束。常用约束：

- \`constraints.Ordered\`：所有支持 \`<\`、\`>\`、\`<=\`、\`>=\` 的类型（整数、浮点、字符串）。
- \`constraints.Signed\` / \`Unsigned\`：有符号/无符号整数。
- \`constraints.Integer\` / \`Float\` / \`Complex\`：数字类型分组。
- \`constraints.Ordered\`：可排序类型。

\`\`\`go
package main

import (
    "fmt"
    "golang.org/x/exp/constraints"
)

// 用标准库约束，避免重复定义
func Max[T constraints.Ordered](a, b T) T {
    if a > b {
        return a
    }
    return b
}

func main() {
    fmt.Println(Max(3, 5))               // 5
    fmt.Println(Max(3.14, 2.71))         // 3.14
    fmt.Println(Max("apple", "banana"))  // banana
}
\`\`\`

Go 1.21+ 推荐使用内置 \`cmp\` 包：

\`\`\`go
package main

import (
    "cmp"
    "fmt"
    "slices"
)

func main() {
    nums := []int{3, 1, 4, 1, 5, 9, 2, 6}
    slices.Sort(nums)
    fmt.Println(nums) // [1 1 2 3 4 5 6 9]

    fmt.Println(cmp.Or(0, "", "fallback")) // fallback（返回第一个非零值）
}
\`\`\`

### 四、泛型类型

#### 1. 泛型切片/容器

\`\`\`go
package main

import "fmt"

// 泛型栈
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(v T) {
    s.items = append(s.items, v)
}

func (s *Stack[T]) Pop() (T, bool) {
    var zero T
    if len(s.items) == 0 {
        return zero, false
    }
    v := s.items[len(s.items)-1]
    s.items = s.items[:len(s.items)-1]
    return v, true
}

func (s *Stack[T]) Len() int {
    return len(s.items)
}

func main() {
    // 整数栈
    intStack := &Stack[int]{}
    intStack.Push(1)
    intStack.Push(2)
    intStack.Push(3)
    if v, ok := intStack.Pop(); ok {
        fmt.Println(v) // 3
    }
    fmt.Println(intStack.Len()) // 2

    // 字符串栈
    strStack := &Stack[string]{}
    strStack.Push("hello")
    strStack.Push("world")
    if v, ok := strStack.Pop(); ok {
        fmt.Println(v) // world
    }
}
\`\`\`

#### 2. 泛型 Map 包装

\`\`\`go
package main

import "fmt"

// 泛型 Map：K 必须可比较（因为 map 的 key 要能 hash）
type Map[K comparable, V any] struct {
    data map[K]V
}

func NewMap[K comparable, V any]() *Map[K, V] {
    return &Map[K, V]{data: make(map[K]V)}
}

func (m *Map[K, V]) Set(k K, v V) {
    m.data[k] = v
}

func (m *Map[K, V]) Get(k K) (V, bool) {
    v, ok := m.data[k]
    return v, ok
}

func (m *Map[K, V]) Delete(k K) {
    delete(m.data, k)
}

func main() {
    m := NewMap[string, int]()
    m.Set("a", 1)
    m.Set("b", 2)
    if v, ok := m.Get("a"); ok {
        fmt.Println(v) // 1
    }

    m2 := NewMap[int, string]()
    m2.Set(100, "张三")
    m2.Set(200, "李四")
    fmt.Println(m2.Get(100)) // 张三 true
}
\`\`\`

#### 3. 泛型链表

\`\`\`go
package main

import "fmt"

type Node[T any] struct {
    Value T
    Next  *Node[T]
}

type LinkedList[T any] struct {
    head *Node[T]
    size int
}

func (l *LinkedList[T]) Push(v T) {
    l.head = &Node[T]{Value: v, Next: l.head}
    l.size++
}

func (l *LinkedList[T]) Pop() (T, bool) {
    var zero T
    if l.head == nil {
        return zero, false
    }
    v := l.head.Value
    l.head = l.head.Next
    l.size--
    return v, true
}

func (l *LinkedList[T]) ForEach(fn func(T)) {
    for n := l.head; n != nil; n = n.Next {
        fn(n.Value)
    }
}

func main() {
    list := &LinkedList[int]{}
    list.Push(1)
    list.Push(2)
    list.Push(3)
    list.ForEach(func(v int) {
        fmt.Println(v) // 3 2 1
    })
}
\`\`\`

### 五、泛型方法的限制

Go 泛型有一个重要限制：**方法不能引入新的类型参数**。方法只能使用类型上已声明的类型参数。

\`\`\`go
package main

import "fmt"

type Container[T any] struct {
    items []T
}

func (c *Container[T]) Add(v T) {
    c.items = append(c.items, v)
}

// ❌ 编译错误：方法不能引入新类型参数 U
// func (c *Container[T]) Map[U any](fn func(T) U) []U {
//     result := make([]U, len(c.items))
//     for i, v := range c.items {
//         result[i] = fn(v)
//     }
//     return result
// }

// ✅ 正确：把 Map 写成泛型函数
func Map[T any, U any](c *Container[T], fn func(T) U) []U {
    result := make([]U, len(c.items))
    for i, v := range c.items {
        result[i] = fn(v)
    }
    return result
}

func main() {
    c := &Container[int]{}
    c.Add(1)
    c.Add(2)
    c.Add(3)

    squares := Map(c, func(v int) int { return v * v })
    fmt.Println(squares) // [1 4 9]

    strs := Map(c, func(v int) string { return fmt.Sprintf("num-%d", v) })
    fmt.Println(strs) // [num-1 num-2 num-3]
}
\`\`\`

这是 Go 团队的有意设计——保持方法签名简单，避免复杂推导。需要"带新类型参数"的操作时，用顶层泛型函数。

### 六、类型推断

Go 编译器能根据实参推断类型参数，大多数时候不需要显式写出：

\`\`\`go
package main

import "fmt"

func Map[T, U any](slice []T, fn func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = fn(v)
    }
    return result
}

func main() {
    nums := []int{1, 2, 3}

    // 类型参数完全推断
    squares := Map(nums, func(v int) int { return v * v })
    fmt.Println(squares) // [1 4 9]

    // 不同类型参数
    strs := Map(nums, func(v int) string { return fmt.Sprintf("#%d", v) })
    fmt.Println(strs) // [#1 #2 #3]

    // 显式指定（少数情况）
    doubles := Map[int, float64](nums, func(v int) float64 { return float64(v) * 1.5 })
    fmt.Println(doubles) // [1.5 3 4.5]
}
\`\`\`

**类型推断的局限：** 返回类型不参与推断。如下例必须显式：

\`\`\`go
// 调用时 TSource 能从 nums 推断，TResult 不能——但闭包的返回类型会触发推导
var result []string = Map(nums, func(v int) string { ... })
// Go 编译器很聪明，能根据闭包签名反推 TResult
\`\`\`

### 七、Go 泛型 vs Java/C# 泛型

三种语言的泛型实现差异很大：

| 维度 | Go 泛型 | Java 泛型 | C# 泛型 |
|------|---------|-----------|---------|
| 引入版本 | Go 1.18 (2022) | Java 5 (2004) | C# 2.0 (2005) / .NET 2.0 |
| 实现方式 | GC Shape Stenciling | 类型擦除（Type Erasure） | Reified（具化） |
| 运行期类型信息 | 部分保留（按 GC shape 分组） | 完全擦除（\`List<String>\` 运行期是 \`List\`） | 完全保留（\`List<int>\` 和 \`List<string>\` 是不同类型） |
| 值类型特化 | 是（按 GC shape） | 否（值类型装箱到 Object） | 是（值类型有专属特化代码） |
| 约束声明 | \`[T any]\` 或 \`[T Number]\` | \`<T extends Number>\` | \`<T> where T : ...\` |
| 类型参数与方法 | 方法不能引入新类型参数 | 方法可以引入新类型参数 | 方法可以引入新类型参数 |
| 协变逆变 | 不支持 | \`? extends T\` / \`? super T\` | \`out\` / \`in\` |

#### 类型擦除 vs 具化

Java 用类型擦除——运行期 \`List<String>\` 和 \`List<Integer>\` 是同一个 \`List\` 类。这导致：

- 无法在运行期通过反射拿到泛型参数类型（除非在方法签名/字段声明里）。
- 不能 \`new T()\`、不能 \`new T[]\`、不能 \`instanceof List<String>\`。

C# 是具化——运行期 \`List<int>\` 和 \`List<string>\` 是不同类型，值类型有专属代码。

Go 走中间路线——**GC Shape Stenciling**。把类型按"GC 行为"分组，同组的类型共享一份代码。比如 \`int\`、\`int32\`、\`*int\` 等"指针形状"共享，但 \`float64\` 单独。这是性能和编译速度的折衷。

### 八、何时使用泛型

#### 适合泛型的场景

1. **数据容器**：栈、队列、链表、树等通用结构。
2. **算法**：排序、查找、过滤、映射等通用算法。
3. **类型安全的工具函数**：\`Map\`、\`Filter\`、\`Reduce\`。
4. **减少重复代码**：当 3+ 个类型有几乎相同的实现时。

#### 不适合泛型的场景

1. **只是为了类型签名好看**：如果一种类型就够，不要强行泛型化。
2. **简单包装**：\`func Print(v interface{})\` 已经够用，泛型化收益小。
3. **方法需要引入新类型参数**：Go 不支持，改用顶层函数。
4. **运行期反射类型信息**：Go 泛型的类型信息有限，反射能做的有限。

#### Go 官方建议

Go 团队强调"**不要为了泛型而泛型**"。在以下情况才考虑：

- 多份重复代码（≥3 份）且类型不同。
- 容器类型需要类型安全。
- 算法需要参数化多种数值类型。

### 九、综合示例：泛型函数式工具

\`\`\`go
package main

import (
    "constraints"
    "fmt"
)

// 泛型工具：Map / Filter / Reduce
func Map[T, U any](slice []T, fn func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = fn(v)
    }
    return result
}

func Filter[T any](slice []T, predicate func(T) bool) []T {
    result := make([]T, 0)
    for _, v := range slice {
        if predicate(v) {
            result = append(result, v)
        }
    }
    return result
}

func Reduce[T, U any](slice []T, init U, fn func(U, T) U) U {
    acc := init
    for _, v := range slice {
        acc = fn(acc, v)
    }
    return acc
}

func Sum[T constraints.Integer | constraints.Float](slice []T) T {
    var sum T
    for _, v := range slice {
        sum += v
    }
    return sum
}

func Max[T constraints.Ordered](slice []T) (T, bool) {
    var max T
    if len(slice) == 0 {
        return max, false
    }
    max = slice[0]
    for _, v := range slice[1:] {
        if v > max {
            max = v
        }
    }
    return max, true
}

func main() {
    nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

    // 1. 过滤偶数
    evens := Filter(nums, func(n int) bool { return n%2 == 0 })
    fmt.Println("偶数:", evens) // [2 4 6 8 10]

    // 2. 平方
    squares := Map(evens, func(n int) int { return n * n })
    fmt.Println("平方:", squares) // [4 16 36 64 100]

    // 3. 求和（用 Reduce）
    total := Reduce(squares, 0, func(acc, v int) int { return acc + v })
    fmt.Println("总和:", total) // 220

    // 4. 最大值
    if m, ok := Max(nums); ok {
        fmt.Println("最大:", m) // 10
    }

    // 5. 字符串列表操作
    words := []string{"go", "rust", "python", "java"}
    lengths := Map(words, func(s string) int { return len(s) })
    fmt.Println("长度:", lengths) // [2 4 6 4]

    longWords := Filter(words, func(s string) bool { return len(s) > 3 })
    fmt.Println("长词:", longWords) // [rust python java]
}
\`\`\`

这个例子展示了泛型在函数式编程中的威力——一组工具函数适用所有类型，且类型安全。

### 十、本章小结

- Go 泛型于 1.18 (2022) 正式发布，历经 12 年设计。
- 核心语法是 \`[T any]\` 类型的参数声明，用方括号而非尖括号。
- 约束（Constraint）声明允许的类型：\`any\`（任意）、\`comparable\`（可比较）、\`int | float64\`（联合）、\`~int\`（近似类型）。
- Go 1.21+ 推荐使用 \`cmp\` 包的 \`Ordered\` 约束。
- 泛型可应用于函数、类型（结构体/接口），但**方法不能引入新类型参数**——这是 Go 的有意限制。
- Go 采用 GC Shape Stenciling，是 Java 类型擦除和 C# 具化的折衷方案。
- 实战场景：数据容器、算法、函数式工具——但要"不为泛型而泛型"。
`,
  },

  // ============================================================
  // 第十四章：goroutine 与并发基础
  // ============================================================
  {
    id: 'go-ch14',
    group: '第四部分 高级特性',
    icon: '🚦',
    title: 'goroutine 与并发基础',
    content: `## 第十四章　goroutine 与并发基础

### 一、并发 vs 并行

理解 Go 并发前先区分两个概念：

- **并发（Concurrency）**：同时**处理**多件事（一个 CPU 在多任务间切换）。
- **并行（Parallelism）**：同时**执行**多件事（多个 CPU 同时跑）。

并发是"结构"问题——把程序拆成可独立调度的单元。并行是"执行"问题——多个单元真的同时跑。Go 通过 goroutine 提供并发抽象，调度器自动利用多核实现并行。

Go 设计哲学来自 **CSP（Communicating Sequential Processes）**——Tony Hoare 1978 年提出的模型。核心理念：

> **不要通过共享内存来通信，而应该通过通信来共享内存。**
>
> *Do not communicate by sharing memory; instead, share memory by communicating.*

传统并发（Java、C++、Python）用"共享变量 + 锁"。Go 推荐用 channel 传递数据所有权——只有拥有数据的 goroutine 才能访问它，天然避免竞态。

### 二、goroutine 创建

创建 goroutine 极其简单——在函数调用前加 \`go\` 关键字：

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func sayHello(name string) {
    fmt.Println("Hello,", name)
}

func main() {
    // 启动 3 个 goroutine
    go sayHello("张三")
    go sayHello("李四")
    go sayHello("王五")

    // ⚠️ 没有等待机制的话，main 退出，所有 goroutine 被强制终止
    time.Sleep(time.Second)
    fmt.Println("main 退出")
}
\`\`\`

#### 匿名函数 goroutine

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Printf("goroutine #%d\\n", id)
        }(i) // ⚠️ 把 i 作为参数传入，避免闭包陷阱
    }

    wg.Wait()
    fmt.Println("所有 goroutine 完成")
}
\`\`\`

#### 闭包陷阱

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    // ❌ 错误：所有 goroutine 捕获同一个 i 变量
    for i := 0; i < 3; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            fmt.Println(i) // 可能输出 3 3 3
        }()
    }

    // ✅ 正确：用局部变量
    for i := 0; i < 3; i++ {
        i := i // 在循环体内创建新变量
        wg.Add(1)
        go func() {
            defer wg.Done()
            fmt.Println(i) // 0 1 2
        }()
    }

    wg.Wait()
}
\`\`\`

**陷阱原理：** Go 1.22 之前，循环变量 \`i\` 在整个循环中只有一份。所有 goroutine 共享同一个 \`i\`，循环结束时 \`i = 3\`。Go 1.22+ 默认每次循环创建新的 \`i\`（修复了这个陷阱），但显式传参仍是更稳妥的做法。

### 三、轻量级线程：goroutine vs OS 线程

goroutine 是 Go 自己实现的"用户态轻量级线程"。与操作系统线程（OS Thread）有本质区别：

| 维度 | goroutine | OS 线程 |
|------|-----------|---------|
| 栈大小 | 初始 2KB，按需增长/收缩 | 固定 1-8MB（Linux 默认 8MB） |
| 创建开销 | 几百纳秒 | 几十微秒（约 100 倍） |
| 切换开销 | 几十纳秒（仅保存少量寄存器） | 1-10 微秒（陷入内核） |
| 数量上限 | 单机可达百万级 | 通常几千（受内存限制） |
| 调度 | Go 运行时（用户态） | 操作系统内核 |
| 阻塞 | 阻塞一个 goroutine 不阻塞线程 | 阻塞一个线程就少一个 |

#### 栈增长演示

\`\`\`go
package main

import (
    "fmt"
    "runtime"
)

// 递归压栈，观察栈自动增长
func grow(n int, depth int) int {
    if n == 0 {
        return depth
    }
    return grow(n-1, depth+1)
}

func main() {
    // 单个 goroutine 默认栈大小
    var mem runtime.MemStats
    runtime.ReadMemStats(&mem)
    fmt.Printf("初始 HeapAlloc: %d KB\\n", mem.HeapAlloc/1024)

    // 启动 10 万个 goroutine，看内存占用
    done := make(chan struct{})
    for i := 0; i < 100000; i++ {
        go func() {
            <-done // 阻塞等待
        }()
    }

    runtime.ReadMemStats(&mem)
    fmt.Printf("10万 goroutine HeapAlloc: %d KB\\n", mem.HeapAlloc/1024)
    // 10 万 goroutine 大约只占 200MB（每个约 2KB）

    close(done) // 释放所有
}
\`\`\`

10 万个 OS 线程至少要 800GB 内存（8MB × 100000），不可能做到。10 万个 goroutine 只需 200MB——这就是 Go 并发的核心优势。

### 四、GMP 调度模型

Go 调度器的核心是 **GMP 模型**：

- **G（Goroutine）**：用户态协程。
- **M（Machine）**：OS 线程，真正执行 G 的载体。
- **P（Processor）**：逻辑处理器，持有可运行的 G 队列（本地 runqueue）。P 的数量等于 \`GOMAXPROCS\`，默认等于 CPU 核心数。

\`\`\`
┌──────────────────────────────────────────┐
│              Go Runtime Scheduler          │
│  ┌─────────────┐  ┌─────────────┐        │
│  │   P (本地队列) │  │   P (本地队列) │ ...   │
│  │  [G][G][G]   │  │  [G][G][G]   │        │
│  └──────┬──────┘  └──────┬──────┘        │
│         │                 │                │
│         ▼                 ▼                │
│  ┌─────────────┐  ┌─────────────┐        │
│  │      M      │  │      M      │ ...    │
│  │  (OS 线程)   │  │  (OS 线程)   │        │
│  └─────────────┘  └─────────────┘        │
│                                            │
│  ┌─────────────────────────────────┐      │
│  │       全局队列 (Global Queue)     │      │
│  │   [G][G][G][G][G][G][G][G]      │      │
│  └─────────────────────────────────┘      │
└──────────────────────────────────────────┘
\`\`\`

#### 调度流程

1. 每个 P 有一个本地 G 队列（256 大小）。
2. M 从绑定的 P 取 G 执行。
3. P 本地队列空了，去全局队列拿；全局也空，去其他 P "偷" 一半（**work-stealing**）。
4. G 阻塞（如 channel 操作、系统调用）时，M 会与 P 解绑，P 找另一个 M 继续跑其他 G。
5. 系统调用返回时，原 M 尝试找一个空闲 P；找不到就把 G 放回全局队列，自己休眠。

\`\`\`go
package main

import (
    "fmt"
    "runtime"
    "time"
)

func main() {
    // GOMAXPROCS：P 的数量，默认 = CPU 核心数
    fmt.Println("GOMAXPROCS:", runtime.GOMAXPROCS(0))
    fmt.Println("CPU 核心数:", runtime.NumCPU())

    // 修改 P 数量
    runtime.GOMAXPROCS(2)
    fmt.Println("现在 GOMAXPROCS:", runtime.GOMAXPROCS(0))

    // goroutine 数量
    fmt.Println("当前 goroutine 数:", runtime.NumGoroutine())

    // 启动 10 个 goroutine
    for i := 0; i < 10; i++ {
        go func(id int) {
            time.Sleep(time.Second)
            fmt.Printf("goroutine #%d 完成\\n", id)
        }(i)
    }

    fmt.Println("运行中 goroutine 数:", runtime.NumGoroutine())
    time.Sleep(2 * time.Second)
}
\`\`\`

### 五、goroutine 泄漏

如果 goroutine 永远阻塞（没人接收它的 channel、没人取消它），就会泄漏——它会一直占用内存，直到程序退出。

#### 泄漏示例

\`\`\`go
package main

import (
    "context"
    "fmt"
    "runtime"
    "time"
)

// ❌ 泄漏：goroutine 永远阻塞
func leaky() {
    ch := make(chan int)
    go func() {
        val := <-ch  // 永远没人发送
        fmt.Println("收到:", val)
    }()
    // 函数返回，ch 也没人引用了，但 goroutine 还在等
}

// ✅ 正确：用 context 或 done channel
func safe(ctx context.Context) {
    ch := make(chan int, 1)
    go func() {
        select {
        case val := <-ch:
            fmt.Println("收到:", val)
        case <-ctx.Done():
            fmt.Println("被取消")
            return
        }
    }()
}

func main() {
    leaky()
    fmt.Println("leaky 后 goroutine 数:", runtime.NumGoroutine())

    ctx, cancel := context.WithCancel(context.Background())
    safe(ctx)
    time.Sleep(time.Millisecond * 100)
    cancel() // 取消，goroutine 退出

    time.Sleep(time.Millisecond * 100)
    fmt.Println("最终 goroutine 数:", runtime.NumGoroutine())
}
\`\`\`

#### 检测泄漏的工具

- \`runtime.NumGoroutine()\`：运行期检查 goroutine 数量。
- \`pprof\`：\`net/http/pprof\` 包提供 \`/debug/pprof/goroutine\` 端点。
- \`go.uber.org/goleak\`：测试中检测 goroutine 泄漏。

### 六、sync.WaitGroup：等待一组 goroutine

\`sync.WaitGroup\` 是最常见的同步原语——等待一组 goroutine 完成。

\`\`\`go
package main

import (
    "fmt"
    "sync"
    "time"
)

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 5; i++ {
        wg.Add(1) // 计数器 +1
        go func(id int) {
            defer wg.Done() // 完成时 -1
            fmt.Printf("worker #%d 开始\\n", id)
            time.Sleep(time.Duration(id*100) * time.Millisecond)
            fmt.Printf("worker #%d 完成\\n", id)
        }(i)
    }

    wg.Wait() // 阻塞直到计数器归 0
    fmt.Println("全部完成")
}
\`\`\`

#### WaitGroup 的注意事项

1. **Add 必须在 Wait 之前**：在 goroutine 内部 Add 会有竞态。
2. **Done 用 defer**：确保 panic 也能减计数。
3. **不能复制**：WaitGroup 是结构体，传参要传指针。
4. **不能复用**：Wait 后才能再次 Add，否则行为未定义。

#### 错误用法 vs 正确用法

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

func main() {
    var wg sync.WaitGroup

    // ❌ 错误：在 goroutine 内 Add，可能有竞态
    // for i := 0; i < 5; i++ {
    //     go func() {
    //         wg.Add(1)
    //         defer wg.Done()
    //         // ...
    //     }()
    // }

    // ✅ 正确：在主 goroutine Add
    for i := 0; i < 5; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            fmt.Println("worker", id)
        }(i)
    }
    wg.Wait()

    // ✅ 嵌套 WaitGroup
    var wg2 sync.WaitGroup
    wg2.Add(2)

    go func() {
        defer wg2.Done()
        var inner sync.WaitGroup
        for i := 0; i < 3; i++ {
            inner.Add(1)
            go func(i int) {
                defer inner.Done()
                fmt.Println("inner", i)
            }(i)
        }
        inner.Wait()
    }()

    go func() {
        defer wg2.Done()
        fmt.Println("outer task 2")
    }()

    wg2.Wait()
    fmt.Println("全部完成")
}
\`\`\`

### 七、sync.Once：单次执行

\`sync.Once\` 保证某段代码**只执行一次**——即使多个 goroutine 同时调用。常用于单例初始化、配置加载。

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

type Config struct {
    value string
}

var (
    config *Config
    once   sync.Once
)

func GetConfig() *Config {
    once.Do(func() {
        fmt.Println("初始化 config（只执行一次）")
        config = &Config{value: "default"}
    })
    return config
}

func main() {
    var wg sync.WaitGroup

    // 10 个 goroutine 同时调用 GetConfig
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            c := GetConfig()
            fmt.Printf("config: %s\\n", c.value)
        }()
    }

    wg.Wait()
    // "初始化 config（只执行一次）" 只输出一次
    // 后续调用直接返回已初始化的 config
}
\`\`\`

#### Once 的实现原理

\`sync.Once\` 内部用 \`atomic\` 和 \`Mutex\` 实现：

\`\`\`go
// 简化版伪代码
type Once struct {
    done atomic.Bool
    m    Mutex
}

func (o *Once) Do(f func()) {
    if o.done.Load() {
        return // 快速路径
    }
    o.m.Lock()
    defer o.m.Unlock()
    if !o.done.Load() { // 双重检查
        f()
        o.done.Store(true)
    }
}
\`\`\`

双重检查避免每次都加锁——大多数调用直接走快速路径。

### 八、CPU 密集型 vs IO 密集型

并发编程要区分两种工作负载：

#### CPU 密集型

大量计算，CPU 是瓶颈。例如：图像处理、加密、压缩、数学计算。

\`\`\`go
package main

import (
    "fmt"
    "runtime"
    "sync"
    "time"
)

func cpuTask(n int) int {
    sum := 0
    for i := 0; i < n; i++ {
        sum += i * i
    }
    return sum
}

func main() {
    start := time.Now()

    // 单线程
    var sum1 int
    for i := 0; i < 4; i++ {
        sum1 += cpuTask(100_000_000)
    }
    fmt.Println("单线程耗时:", time.Since(start), "结果:", sum1)

    // 多线程（CPU 密集型用 GOMAXPROCS 数量的 goroutine 即可）
    start = time.Now()
    var wg sync.WaitGroup
    results := make([]int, 4)

    for i := 0; i < 4; i++ {
        wg.Add(1)
        go func(idx int) {
            defer wg.Done()
            results[idx] = cpuTask(100_000_000)
        }(i)
    }
    wg.Wait()

    var sum2 int
    for _, r := range results {
        sum2 += r
    }
    fmt.Printf("多线程 (%d CPU) 耗时: %s 结果: %d\\n",
        runtime.NumCPU(), time.Since(start), sum2)
}
\`\`\`

#### IO 密集型

等待 I/O（网络、磁盘、数据库）。goroutine 在等待时不占线程，可以开很多。

\`\`\`go
package main

import (
    "fmt"
    "sync"
    "time"
)

func fetch(url string) string {
    time.Sleep(500 * time.Millisecond) // 模拟网络 I/O
    return url + " 内容"
}

func main() {
    urls := []string{
        "http://a.com",
        "http://b.com",
        "http://c.com",
        "http://d.com",
    }

    // 同步：4 × 500ms = 2s
    start := time.Now()
    for _, url := range urls {
        fetch(url)
    }
    fmt.Println("同步耗时:", time.Since(start))

    // 并发：max(500ms) = 500ms
    start = time.Now()
    var wg sync.WaitGroup
    for _, url := range urls {
        wg.Add(1)
        go func(u string) {
            defer wg.Done()
            fetch(u)
        }(url)
    }
    wg.Wait()
    fmt.Println("并发耗时:", time.Since(start))
}
\`\`\`

#### 最佳实践

- **CPU 密集**：goroutine 数量 ≈ \`GOMAXPROCS\`，多了反而增加切换开销。
- **IO 密集**：goroutine 数量可以远超 CPU 核数（几百上千都行）。
- **混合**：用 worker pool + 限流（如 \`semaphore.Weighted\`）控制并发上限。

### 九、并发安全：数据竞争

多个 goroutine 同时读写同一个变量会产生**数据竞争**（Data Race）——结果不可预测。

#### 数据竞争示例

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

func main() {
    counter := 0
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            counter++ // ⚠️ 数据竞争：read-modify-write 非原子
        }()
    }

    wg.Wait()
    fmt.Println("counter:", counter) // 不等于 1000，每次结果不同
}
\`\`\`

\`counter++\` 看起来是一条语句，实际是三步：读 \`counter\`、+1、写回 \`counter\`。多个 goroutine 交错执行就会丢失更新。

#### 用 \`go run -race\` 检测

Go 内置竞态检测器：

\`\`\`bash
go run -race main.go
\`\`\`

它会报告所有数据竞争点。

#### 解决方案

1. **加锁**（sync.Mutex / RWMutex）
2. **原子操作**（sync/atomic）
3. **用 channel**（Go 推荐的方式）

\`\`\`go
package main

import (
    "fmt"
    "sync"
    "sync/atomic"
)

func main() {
    // 方案 1：原子操作（最简单，适合计数）
    var counter int64
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            atomic.AddInt64(&counter, 1)
        }()
    }
    wg.Wait()
    fmt.Println("atomic counter:", counter) // 1000

    // 方案 2：互斥锁
    var (
        mu      sync.Mutex
        counter2 int = 0
    )
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            mu.Lock()
            counter2++
            mu.Unlock()
        }()
    }
    wg.Wait()
    fmt.Println("mutex counter:", counter2) // 1000

    // 方案 3：channel（Go 风格）
    counter3 := 0
    ch := make(chan int, 1000)
    for i := 0; i < 1000; i++ {
        go func() { ch <- 1 }()
    }
    for i := 0; i < 1000; i++ {
        counter3 += <-ch
    }
    fmt.Println("channel counter:", counter3) // 1000
}
\`\`\`

### 十、综合示例：并发求和

\`\`\`go
package main

import (
    "fmt"
    "math/rand"
    "sync"
    "time"
)

// 将大数组切分成 N 份，并发求和
func ConcurrentSum(nums []int, numWorkers int) int {
    size := len(nums) / numWorkers
    results := make(chan int, numWorkers)

    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(idx int) {
            defer wg.Done()
            start := idx * size
            end := start + size
            if idx == numWorkers-1 {
                end = len(nums) // 最后一份包含余数
            }
            sum := 0
            for _, n := range nums[start:end] {
                sum += n
            }
            results <- sum
        }(i)
    }

    // 等所有 worker 完成后关闭 channel
    go func() {
        wg.Wait()
        close(results)
    }()

    total := 0
    for r := range results {
        total += r
    }
    return total
}

func main() {
    rand.Seed(time.Now().UnixNano())
    nums := make([]int, 10_000_000)
    for i := range nums {
        nums[i] = rand.Intn(100)
    }

    start := time.Now()
    sum := ConcurrentSum(nums, 8)
    fmt.Printf("并发求和: %d, 耗时: %v\\n", sum, time.Since(start))
}
\`\`\`

这个例子综合了：goroutine 启动、WaitGroup 同步、channel 收集结果、关闭 channel 后 range 自动退出。

### 十一、本章小结

- Go 并发基于 CSP 模型——"通过通信共享内存"而非"通过共享内存通信"。
- goroutine 是用户态轻量级线程，初始 2KB 栈，可创建百万级。
- GMP 调度模型：G=goroutine、M=OS 线程、P=逻辑处理器（持有 G 队列）。
- \`sync.WaitGroup\` 等待一组 goroutine 完成；\`sync.Once\` 保证只执行一次。
- 区分 CPU 密集（goroutine 数 ≈ CPU 核数）和 IO 密集（goroutine 数可远超核数）。
- 数据竞争用 \`go run -race\` 检测，用锁/原子/channel 解决。
- 闭包陷阱：循环变量捕获要小心，传参或创建局部变量。
- goroutine 泄漏：永远阻塞的 goroutine 会占用内存——用 context 取消。
`,
  },

  // ============================================================
  // 第十五章：channel 与 select
  // ============================================================
  {
    id: 'go-ch15',
    group: '第四部分 高级特性',
    icon: '📡',
    title: 'channel 与 select',
    content: `## 第十五章　channel 与 select

### 一、channel：goroutine 之间的桥梁

channel 是 Go 并发的核心——让 goroutine 之间安全地传递数据。所有 channel 都是**类型安全**的，只能发送/接收指定类型的数据。

#### 创建 channel

\`\`\`go
package main

import "fmt"

func main() {
    // 无缓冲 channel
    ch1 := make(chan int)

    // 缓冲 channel，缓冲区大小为 3
    ch2 := make(chan string, 3)

    fmt.Printf("ch1: %T, 容量 %d\\n", ch1, cap(ch1)) // chan int, 容量 0
    fmt.Printf("ch2: %T, 容量 %d\\n", ch2, cap(ch2)) // chan string, 容量 3
}
\`\`\`

#### 发送与接收

\`\`\`go
ch <- 42        // 发送：把 42 放入 channel
v := <-ch       // 接收：从 channel 取一个值
v, ok := <-ch   // 接收 + 检查是否关闭
\`\`\`

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

func main() {
    ch := make(chan int)
    var wg sync.WaitGroup

    wg.Add(1)
    go func() {
        defer wg.Done()
        ch <- 42       // 发送：会阻塞，直到有人接收
        fmt.Println("已发送")
    }()

    v := <-ch          // 接收：会阻塞，直到有人发送
    fmt.Println("收到:", v)

    wg.Wait()
}
\`\`\`

### 二、无缓冲 channel：同步通信

无缓冲 channel 的发送和接收**必须同时就绪**——发送方阻塞直到接收方取走，反之亦然。这是一种**同步**机制。

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan string)

    // 模拟"传球游戏"——A 发球，B 接球，交替
    go func() {
        for i := 0; i < 3; i++ {
            ch <- fmt.Sprintf("球 #%d", i+1)
            time.Sleep(time.Millisecond * 100)
        }
        close(ch) // 发送完毕，关闭
    }()

    // 主 goroutine 接收
    for ball := range ch {
        fmt.Println("接住:", ball)
    }
    fmt.Println("游戏结束")
}
\`\`\`

**无缓冲 channel 像一次"握手"**——发送方把数据"亲手交给"接收方。

### 三、缓冲 channel：异步通信

缓冲 channel 有一个固定大小的缓冲区。发送方在缓冲区未满时不阻塞，接收方在缓冲区未空时不阻塞。

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func main() {
    // 缓冲区为 3
    ch := make(chan int, 3)

    // 发送 3 个值不会阻塞（缓冲区未满）
    ch <- 1
    ch <- 2
    ch <- 3

    // 第 4 个会阻塞，因为缓冲区满了
    // ch <- 4 // ⚠️ 死锁！没有接收方

    go func() {
        time.Sleep(time.Second)
        // 接收方来了，依次取走
        fmt.Println("收到:", <-ch)
        fmt.Println("收到:", <-ch)
        fmt.Println("收到:", <-ch)
    }()

    // 这时第 4 个才能发送
    ch <- 4
    fmt.Println("已发送 4")

    // 等待 goroutine 完成
    time.Sleep(time.Second * 2)
}
\`\`\`

#### 缓冲大小的选择

- **0**（无缓冲）：同步通信，强耦合。
- **1**：常见于"信号"用途（done channel）。
- **N**：异步缓冲，削峰填谷。N 应有明确意义，不要随便填大数字。

### 四、关闭 channel：close

\`close(ch)\` 关闭 channel，表示"再也不会发送数据了"。

- 关闭后**不能发送**（panic：send on closed channel）。
- 关闭后**可以接收**——返回零值，第二个返回值 \`ok\` 为 \`false\`。
- 关闭已关闭的 channel 会 panic。
- 重复关闭也会 panic。

\`\`\`go
package main

import "fmt"

func main() {
    ch := make(chan int, 5)

    // 生产者
    go func() {
        for i := 1; i <= 5; i++ {
            ch <- i
        }
        close(ch) // 发送完毕，关闭
    }()

    // 消费者：用 ok 检查是否关闭
    for {
        v, ok := <-ch
        if !ok {
            fmt.Println("channel 已关闭")
            break
        }
        fmt.Println("收到:", v)
    }
}
\`\`\`

#### close 的原则

- **应该由发送方关闭**，而不是接收方。
- 关闭的目的是通知接收方"没有更多数据"。
- 不是所有 channel 都需要关闭——程序退出时 Go 会自动回收。
- 只关闭"需要通知结束"的 channel。

### 五、range channel：自动检测关闭

\`for v := range ch\` 会循环接收，直到 channel 关闭并清空：

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

func main() {
    ch := make(chan int)
    var wg sync.WaitGroup

    // 生产者：发送 1-5，然后关闭
    wg.Add(1)
    go func() {
        defer wg.Done()
        for i := 1; i <= 5; i++ {
            ch <- i
        }
        close(ch)
    }()

    // 消费者：range 自动检测关闭
    wg.Add(1)
    go func() {
        defer wg.Done()
        for v := range ch {
            fmt.Println("收到:", v)
        }
        fmt.Println("range 退出")
    }()

    wg.Wait()
}
\`\`\`

### 六、select：多路复用

\`select\` 让一个 goroutine 同时等待多个 channel 操作，哪个先就绪就执行哪个。

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)

    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "来自 ch1"
    }()

    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "来自 ch2"
    }()

    // 等待先返回的 channel
    for i := 0; i < 2; i++ {
        select {
        case msg := <-ch1:
            fmt.Println("收到:", msg)
        case msg := <-ch2:
            fmt.Println("收到:", msg)
        }
    }
}
\`\`\`

#### select 的规则

1. **多个 case 同时就绪**：随机选一个（避免饥饿）。
2. **没有 case 就绪**：阻塞等待。
3. **有 default 分支**：所有 case 都不就绪时执行 default（非阻塞）。
4. **空 select**：\`select {}\` 永远阻塞。

### 七、default：非阻塞操作

\`default\` 分支让 select 不阻塞——所有 case 都不就绪时立即执行 default。

\`\`\`go
package main

import "fmt"

func main() {
    ch := make(chan int, 1)

    // 非阻塞发送
    select {
    case ch <- 1:
        fmt.Println("发送成功")
    default:
        fmt.Println("channel 满，发送失败")
    }

    // 非阻塞接收
    select {
    case v := <-ch:
        fmt.Println("收到:", v)
    default:
        fmt.Println("channel 空，没有数据")
    }
}
\`\`\`

#### 非阻塞操作的工具函数

\`\`\`go
package main

import "fmt"

// 非阻塞接收
func TryReceive(ch <-chan int) (int, bool) {
    select {
    case v := <-ch:
        return v, true
    default:
        return 0, false
    }
}

// 非阻塞发送
func TrySend(ch chan<- int, v int) bool {
    select {
    case ch <- v:
        return true
    default:
        return false
    }
}

func main() {
    ch := make(chan int, 1)
    ch <- 42

    if v, ok := TryReceive(ch); ok {
        fmt.Println("收到:", v)
    }
    if _, ok := TryReceive(ch); !ok {
        fmt.Println("channel 空")
    }

    TrySend(ch, 100)
    if TrySend(ch, 200) {
        fmt.Println("发送成功")
    } else {
        fmt.Println("channel 满")
    }
}
\`\`\`

### 八、超时模式：time.After

\`select\` 配合 \`time.After\` 实现超时——避免 goroutine 永远阻塞。

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func slowOperation() string {
    time.Sleep(2 * time.Second) // 模拟慢操作
    return "完成"
}

func main() {
    ch := make(chan string, 1)
    go func() {
        ch <- slowOperation()
    }()

    select {
    case result := <-ch:
        fmt.Println("收到:", result)
    case <-time.After(500 * time.Millisecond):
        fmt.Println("超时！操作太慢")
    }
}
\`\`\`

#### 超时控制的陷阱

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch := make(chan int)

    go func() {
        time.Sleep(2 * time.Second)
        ch <- 42
    }()

    // ❌ 每次循环创建新的 timer，浪费资源
    for {
        select {
        case v := <-ch:
            fmt.Println("收到:", v)
            return
        case <-time.After(100 * time.Millisecond):
            fmt.Println("...等待中")
        }
    }

    // ✅ 正确：复用 timer（或用 context.WithTimeout）
}
\`\`\`

正确做法是用 \`time.NewTimer\` 复用，或用 \`context\` 包（见下章）。

### 九、channel 方向限制

Go 可以限制 channel 的方向，作为函数参数时增强类型安全：

- \`chan T\`：双向（可读可写）。
- \`chan<- T\`：只写（send-only）。
- \`<-chan T\`：只读（receive-only）。

\`\`\`go
package main

import "fmt"

// 只能发送
func producer(ch chan<- int) {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)
}

// 只能接收
func consumer(ch <-chan int) {
    for v := range ch {
        fmt.Println("消费:", v)
    }
}

func main() {
    ch := make(chan int)

    go producer(ch) // 双向转只写
    consumer(ch)    // 双向转只读

    // 在 consumer 内：
    // ch <- 1  // 编译错误：cannot send to receive-only channel
    // 在 producer 内：
    // <-ch      // 编译错误：cannot receive from send-only channel
}
\`\`\`

方向限制是**编译期检查**——只在函数参数声明时生效，调用时双向 channel 自动转换。

### 十、退出信号 channel：done

用 \`struct{}\` 类型的 channel 作为"信号通道"——不传数据，只传"事件"。

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func worker(id int, done <-chan struct{}) {
    for {
        select {
        case <-done:
            fmt.Printf("worker #%d 退出\\n", id)
            return
        default:
            fmt.Printf("worker #%d 工作中...\\n", id)
            time.Sleep(time.Second)
        }
    }
}

func main() {
    done := make(chan struct{})

    // 启动 3 个 worker
    for i := 1; i <= 3; i++ {
        go worker(i, done)
    }

    // 3 秒后通知所有 worker 退出
    time.Sleep(3 * time.Second)
    close(done) // close 让所有接收方同时解除阻塞

    time.Sleep(time.Second) // 等待 worker 退出
    fmt.Println("main 退出")
}
\`\`\`

**为什么用 \`chan struct{}\`？**

- \`struct{}\` 不占内存（0 字节）。
- 表意明确：只关心"事件"，不关心"数据"。
- \`close(done)\` 一次性通知所有接收方——广播。

### 十一、生产者-消费者模式

\`\`\`go
package main

import (
    "fmt"
    "math/rand"
    "sync"
    "time"
)

func producer(id int, ch chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for i := 0; i < 5; i++ {
        value := rand.Intn(100)
        ch <- value
        fmt.Printf("生产者 #%d -> %d\\n", id, value)
        time.Sleep(time.Millisecond * time.Duration(rand.Intn(200)))
    }
}

func consumer(id int, ch <-chan int, wg *sync.WaitGroup) {
    defer wg.Done()
    for v := range ch {
        fmt.Printf("  消费者 #%d <- %d\\n", id, v)
        time.Sleep(time.Millisecond * time.Duration(rand.Intn(300)))
    }
    fmt.Printf("消费者 #%d 退出\\n", id)
}

func main() {
    rand.Seed(time.Now().UnixNano())

    ch := make(chan int, 10)

    var prodWg, consWg sync.WaitGroup

    // 2 个生产者
    for i := 1; i <= 2; i++ {
        prodWg.Add(1)
        go producer(i, ch, &prodWg)
    }

    // 3 个消费者
    for i := 1; i <= 3; i++ {
        consWg.Add(1)
        go consumer(i, ch, &consWg)
    }

    // 等生产者完成，然后关闭 channel
    go func() {
        prodWg.Wait()
        close(ch)
    }()

    // 等消费者完成
    consWg.Wait()
    fmt.Println("全部完成")
}
\`\`\`

注意 \`close(ch)\` 的时机——必须在所有生产者完成后才能关闭。用单独的 goroutine 等待 \`prodWg\` 是常见模式。

### 十二、多路 select 综合示例

\`\`\`go
package main

import (
    "fmt"
    "math/rand"
    "time"
)

func main() {
    rand.Seed(time.Now().UnixNano())

    // 模拟多个数据源
    sensor1 := make(chan float64)
    sensor2 := make(chan float64)
    alert := make(chan string)
    quit := make(chan struct{})

    // 传感器 1：每 500ms 产生一个温度
    go func() {
        for {
            select {
            case <-quit:
                return
            case sensor1 <- 20 + rand.Float64()*10:
                time.Sleep(500 * time.Millisecond)
            }
        }
    }()

    // 传感器 2：每 700ms 产生一个湿度
    go func() {
        for {
            select {
            case <-quit:
                return
            case sensor2 <- 40 + rand.Float64()*20:
                time.Sleep(700 * time.Millisecond)
            }
        }
    }()

    // 告警生成器
    go func() {
        time.Sleep(2 * time.Second)
        alert <- "⚠️ 温度过高！"
    }()

    // 主循环：多路监听
    go func() {
        time.Sleep(5 * time.Second)
        close(quit)
    }()

    tempCount, humCount := 0, 0
loop:
    for {
        select {
        case temp := <-sensor1:
            tempCount++
            fmt.Printf("[温度 #%d] %.2f°C\\n", tempCount, temp)
        case hum := <-sensor2:
            humCount++
            fmt.Printf("[湿度 #%d] %.2f%%\\n", humCount, hum)
        case msg := <-alert:
            fmt.Println("[告警]", msg)
        case <-quit:
            fmt.Println("收到退出信号")
            break loop
        case <-time.After(1 * time.Second):
            fmt.Println("[心跳] 1 秒内无数据")
        }
    }

    fmt.Printf("总计：温度 %d 次，湿度 %d 次\\n", tempCount, humCount)
}
\`\`\`

### 十三、nil channel 的妙用

nil channel 的发送和接收**永远阻塞**——但放在 select 中相当于"禁用"该分支。利用这个特性可以动态启用/禁用 select 分支。

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func main() {
    var ch1, ch2 chan int // nil channel
    ch1 = make(chan int)
    ch2 = make(chan int)

    go func() {
        for i := 0; ; i++ {
            time.Sleep(time.Second)
            if i%2 == 0 {
                ch1 <- i
            } else {
                ch2 <- i
            }
        }
    }()

    // 启用 ch1，禁用 ch2（赋 nil）
    useCh1 := true

    for i := 0; i < 6; i++ {
        var c1, c2 chan int
        if useCh1 {
            c1 = ch1
        } else {
            c2 = ch2
        }

        select {
        case v := <-c1:
            fmt.Println("从 ch1:", v)
        case v := <-c2:
            fmt.Println("从 ch2:", v)
        }

        useCh1 = !useCh1 // 切换
    }
}
\`\`\`

### 十四、本章小结

- channel 是 goroutine 之间传递数据的类型安全管道。
- 无缓冲 channel（\`make(chan T)\`）同步通信；缓冲 channel（\`make(chan T, n)\`）异步通信。
- \`close(ch)\` 关闭 channel，由**发送方**关闭；接收方用 \`v, ok := <-ch\` 检查。
- \`for v := range ch\` 自动接收直到 channel 关闭。
- \`select\` 多路复用：多个 case 同时就绪随机选；有 default 则非阻塞。
- \`time.After\` 实现超时，但循环中要小心资源浪费——优先用 \`context\`。
- \`chan<- T\` 只写、\`<-chan T\` 只读——编译期方向限制。
- \`chan struct{}\` 是 0 字节的信号通道；\`close\` 实现广播。
- nil channel 在 select 中"禁用"分支——动态切换的多路复用技巧。
`,
  },

  // ============================================================
  // 第十六章：并发模式与 sync 包
  // ============================================================
  {
    id: 'go-ch16',
    group: '第四部分 高级特性',
    icon: '🧮',
    title: '并发模式与 sync 包',
    content: `## 第十六章　并发模式与 sync 包

### 一、Worker Pool 模式

固定数量的 worker 从任务队列消费任务，避免无限创建 goroutine。优点是控制资源使用、复用 worker。

\`\`\`go
package main

import (
    "fmt"
    "sync"
    "time"
)

type Task struct {
    ID    int
    Input int
}

func worker(id int, tasks <-chan Task, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for t := range tasks {
        fmt.Printf("worker #%d 处理任务 #%d\\n", id, t.ID)
        time.Sleep(100 * time.Millisecond) // 模拟处理
        results <- t.Input * t.Input       // 返回平方
    }
}

func main() {
    const numWorkers = 3
    const numTasks = 10

    tasks := make(chan Task, numTasks)
    results := make(chan int, numTasks)

    // 启动 worker pool
    var wg sync.WaitGroup
    for i := 1; i <= numWorkers; i++ {
        wg.Add(1)
        go worker(i, tasks, results, &wg)
    }

    // 投递任务
    for i := 1; i <= numTasks; i++ {
        tasks <- Task{ID: i, Input: i}
    }
    close(tasks) // 没有更多任务

    // 等所有 worker 完成
    go func() {
        wg.Wait()
        close(results)
    }()

    // 收集结果
    for r := range results {
        fmt.Println("结果:", r)
    }
}
\`\`\`

#### Worker Pool 的优点

1. **限制并发度**：避免资源耗尽（DB 连接、内存）。
2. **复用 goroutine**：减少创建开销。
3. **背压控制**：任务队列满时自动阻塞生产者。

### 二、Fan-In / Fan-Out 模式

- **Fan-Out**：一个任务分发给多个 goroutine 并行处理。
- **Fan-In**：多个 goroutine 的结果汇集到一个 channel。

\`\`\`go
package main

import (
    "fmt"
    "math/rand"
    "sync"
    "time"
)

// Fan-Out：多个生产者
func producer(id int, out chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for i := 0; i < 3; i++ {
        v := rand.Intn(100)
        out <- v
        fmt.Printf("生产者 #%d -> %d\\n", id, v)
        time.Sleep(time.Millisecond * time.Duration(rand.Intn(200)))
    }
}

// Fan-In：合并多个 channel 到一个
func fanIn(channels []<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup

    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}

func main() {
    rand.Seed(time.Now().UnixNano())

    // 创建 3 个生产者 channel
    producers := make([]chan int, 3)
    var wg sync.WaitGroup
    for i := 0; i < 3; i++ {
        producers[i] = make(chan int)
        wg.Add(1)
        go producer(i+1, producers[i], &wg)
    }

    // 等所有生产者完成后关闭它们的 channel
    go func() {
        wg.Wait()
        for _, p := range producers {
            close(p)
        }
    }()

    // Fan-In：把 3 个 channel 合并
    readOnly := make([]<-chan int, 3)
    for i, p := range producers {
        readOnly[i] = p
    }
    merged := fanIn(readOnly)

    // 消费合并后的 channel
    count := 0
    for v := range merged {
        count++
        fmt.Printf("  收到: %d (累计 %d)\\n", v, count)
    }
    fmt.Println("完成")
}
\`\`\`

### 三、Pipeline 模式

把任务拆成多个阶段，每个阶段用一个 goroutine，通过 channel 串联。每个阶段读取上阶段输出、处理后发送给下阶段。

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

// 阶段 1：生成数字
func generate(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            out <- n
        }
    }()
    return out
}

// 阶段 2：平方
func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            out <- n * n
        }
    }()
    return out
}

// 阶段 3：过滤偶数
func filterEven(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            if n%2 == 0 {
                out <- n
            }
        }
    }()
    return out
}

// 阶段 4：求和
func sum(in <-chan int) int {
    total := 0
    for n := range in {
        total += n
    }
    return total
}

func main() {
    // 组装 pipeline：generate → square → filterEven → sum
    nums := generate(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
    squared := square(nums)
    evens := filterEven(squared)
    result := sum(evens)

    // 1→1, 2→4, 3→9, 4→16, 5→25, 6→36, 7→49, 8→64, 9→81, 10→100
    // 平方后偶数：4, 16, 36, 64, 100
    // 求和：220
    fmt.Println("结果:", result) // 220

    // 用 WaitGroup 等所有阶段结束（这里 pipeline 内部已 close）
    var wg sync.WaitGroup
    _ = wg // 占位，演示用
}
\`\`\`

#### Pipeline 的取消传播

长 pipeline 要支持取消——任意阶段都能让上游停止：

\`\`\`go
package main

import (
    "context"
    "fmt"
    "time"
)

func generate(ctx context.Context, nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            select {
            case out <- n:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}

func square(ctx context.Context, in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            select {
            case out <- n * n:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
    defer cancel()

    nums := make([]int, 1000)
    for i := range nums {
        nums[i] = i + 1
    }

    // 50ms 后取消，pipeline 提前退出
    out := square(ctx, generate(ctx, nums...))

    count := 0
    for range out {
        count++
    }
    fmt.Printf("处理了 %d 个数后被取消\\n", count)
}
\`\`\`

### 四、Done Channel 取消模式

在 context 之前，Go 社区用 \`done chan struct{}\` 表达取消信号：

\`\`\`go
package main

import (
    "fmt"
    "time"
)

func worker(id int, done <-chan struct{}) {
    for {
        select {
        case <-done:
            fmt.Printf("worker #%d 收到取消信号\\n", id)
            return
        default:
            fmt.Printf("worker #%d 工作中...\\n", id)
            time.Sleep(500 * time.Millisecond)
        }
    }
}

func main() {
    done := make(chan struct{})

    for i := 1; i <= 3; i++ {
        go worker(i, done)
    }

    time.Sleep(2 * time.Second)
    close(done) // 广播取消信号

    time.Sleep(time.Second) // 等待退出
    fmt.Println("main 退出")
}
\`\`\`

**现代 Go 推荐用 \`context\` 包**——它提供更丰富的语义（超时、值传递、嵌套取消）。

### 五、context 包

\`context\` 是 Go 1.7 引入的标准包，专门用于"跨 goroutine 的取消、超时、值传递"。它是 Go 并发的核心。

#### 1. context.WithCancel

\`\`\`go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
)

func worker(ctx context.Context, id int, wg *sync.WaitGroup) {
    defer wg.Done()
    for {
        select {
        case <-ctx.Done():
            fmt.Printf("worker #%d 取消: %v\\n", id, ctx.Err())
            return
        case <-time.After(500 * time.Millisecond):
            fmt.Printf("worker #%d 工作中...\\n", id)
        }
    }
}

func main() {
    ctx, cancel := context.WithCancel(context.Background())
    var wg sync.WaitGroup

    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(ctx, i, &wg)
    }

    time.Sleep(2 * time.Second)
    cancel() // 取消所有 worker
    wg.Wait()
    fmt.Println("全部退出")
}
\`\`\`

#### 2. context.WithTimeout

\`\`\`go
package main

import (
    "context"
    "fmt"
    "time"
)

func slowDB(ctx context.Context) (string, error) {
    select {
    case <-time.After(3 * time.Second):
        return "data", nil
    case <-ctx.Done():
        return "", ctx.Err()
    }
}

func main() {
    // 1 秒超时
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel() // 一定要调用 cancel 释放资源

    result, err := slowDB(ctx)
    if err != nil {
        fmt.Println("错误:", err) // context deadline exceeded
        return
    }
    fmt.Println("结果:", result)
}
\`\`\`

**重要：** 即使函数提前返回，也要 \`defer cancel()\` ——否则 context 持有的资源（如 timer）不会被回收，导致泄漏。

#### 3. context.WithValue

\`WithValue\` 用于跨 goroutine 传递请求范围的值（如 trace ID、用户 ID）。

\`\`\`go
package main

import (
    "context"
    "fmt"
)

type key int

const (
    traceIDKey key = iota
    userIDKey
)

func handler(ctx context.Context) {
    traceID, _ := ctx.Value(traceIDKey).(string)
    userID, _ := ctx.Value(userIDKey).(int)
    fmt.Printf("traceID=%s, userID=%d\\n", traceID, userID)
}

func main() {
    ctx := context.Background()
    ctx = context.WithValue(ctx, traceIDKey, "abc-123")
    ctx = context.WithValue(ctx, userIDKey, 42)

    handler(ctx)
}
\`\`\`

**WithValue 的注意事项：**

- 不要用 \`string\` 作为 key（会冲突），用自定义类型（如 \`type key int\`）。
- 仅用于"请求范围"的元数据，**不要传业务参数**。
- 值是 \`interface{}\`，取出时要类型断言。

#### 4. context 链式派生

\`\`\`go
package main

import (
    "context"
    "fmt"
    "time"
)

func main() {
    // 根 context
    root := context.Background()

    // 派生 1：5 秒超时
    ctx1, cancel1 := context.WithTimeout(root, 5*time.Second)
    defer cancel1()

    // 从 ctx1 再派生：2 秒超时（更严格）
    ctx2, cancel2 := context.WithTimeout(ctx1, 2*time.Second)
    defer cancel2()

    // 从 ctx1 派生：可取消
    ctx3, cancel3 := context.WithCancel(ctx1)
    defer cancel3()

    // 取消 ctx1 会让 ctx2、ctx3 也取消（向下传播）
    // 取消 ctx2 不影响 ctx1、ctx3（向上不传播）
    _ = ctx3

    select {
    case <-ctx2.Done():
        fmt.Println("ctx2 done:", ctx2.Err()) // 2 秒后 context deadline exceeded
    }
}
\`\`\`

#### 5. context 的设计原则

- **每个公开函数的第一个参数** 应该是 \`ctx context.Context\`。
- **不要把 context 存到结构体字段**（例外：请求对象本身）。
- **不要传 nil context**——用 \`context.Background()\` 或 \`context.TODO()\`。
- **永远 defer cancel()** ——即使 WithTimeout 自然到期。

### 六、sync.Mutex：互斥锁

\`Mutex\` 是最基础的并发原语——同一时刻只允许一个 goroutine 持有锁。

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Inc() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

func (c *Counter) Value() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.value
}

func main() {
    c := &Counter{}
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            c.Inc()
        }()
    }

    wg.Wait()
    fmt.Println("counter:", c.Value()) // 1000
}
\`\`\`

#### Mutex 的陷阱

1. **不要复制**：\`Mutex\` 是结构体，复制会创建新锁。用指针传递。
2. **不要重复 Lock**：同 goroutine 内重复 Lock 会死锁（Go 的 Mutex 不是可重入的）。
3. **defer Unlock**：确保异常路径也能解锁。

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

type SafeMap struct {
    mu sync.Mutex
    m  map[string]int
}

func NewSafeMap() *SafeMap {
    return &SafeMap{m: make(map[string]int)}
}

func (s *SafeMap) Set(k string, v int) {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.m[k] = v
}

func (s *SafeMap) Get(k string) (int, bool) {
    s.mu.Lock()
    defer s.mu.Unlock()
    v, ok := s.m[k]
    return v, ok
}

func (s *SafeMap) Delete(k string) {
    s.mu.Lock()
    defer s.mu.Unlock()
    delete(s.m, k)
}

func main() {
    sm := NewSafeMap()
    var wg sync.WaitGroup

    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()
            sm.Set(fmt.Sprintf("k%d", i), i)
        }(i)
    }

    wg.Wait()
    fmt.Println("map 大小:", len(sm.m))
}
\`\`\`

### 七、sync.RWMutex：读写锁

\`RWMutex\` 允许**多个读**或**一个写**——读多写少的场景比 Mutex 性能更好。

\`\`\`go
package main

import (
    "fmt"
    "sync"
    "time"
)

type Cache struct {
    rw   sync.RWMutex
    data map[string]string
}

func NewCache() *Cache {
    return &Cache{data: make(map[string]string)}
}

func (c *Cache) Get(key string) (string, bool) {
    c.rw.RLock()         // 读锁：可多人同时持有
    defer c.rw.RUnlock()
    v, ok := c.data[key]
    return v, ok
}

func (c *Cache) Set(key, value string) {
    c.rw.Lock()          // 写锁：独占
    defer c.rw.Unlock()
    c.data[key] = value
}

func main() {
    cache := NewCache()
    cache.Set("name", "张三")

    var wg sync.WaitGroup

    // 10 个读者
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            if v, ok := cache.Get("name"); ok {
                fmt.Println("读到:", v)
            }
        }()
    }

    // 1 个写者
    wg.Add(1)
    go func() {
        defer wg.Done()
        cache.Set("name", "李四")
    }()

    wg.Wait()
    time.Sleep(time.Millisecond * 100)
}
\`\`\`

#### RWMutex 的规则

- 多个 \`RLock\` 可同时持有。
- \`Lock\` 会等待所有 \`RLock\` 释放。
- \`RLock\` 会等待 \`Lock\` 释放。
- 写优先策略：如果 \`Lock\` 在等，新的 \`RLock\` 也要排队（避免写饥饿）。

**何时用 RWMutex？** 读远多于写时（如 10:1）。如果读写相当或写多，RWMutex 的开销反而比 Mutex 大。

### 八、sync.Cond：条件变量

\`Cond\` 让 goroutine 等待/通知某个条件成立。适合"等待某个状态"的场景。

\`\`\`go
package main

import (
    "fmt"
    "sync"
    "time"
)

type Queue struct {
    mu   sync.Mutex
    cond *sync.Cond
    data []int
}

func NewQueue() *Queue {
    q := &Queue{}
    q.cond = sync.NewCond(&q.mu)
    return q
}

func (q *Queue) Put(v int) {
    q.mu.Lock()
    defer q.mu.Unlock()
    q.data = append(q.data, v)
    q.cond.Signal() // 通知一个等待者
}

func (q *Queue) Get() int {
    q.mu.Lock()
    defer q.mu.Unlock()

    // ⚠️ 必须用 for，不能用 if
    // 因为可能被虚假唤醒（spurious wakeup）
    for len(q.data) == 0 {
        q.cond.Wait() // 释放锁，进入等待；被唤醒时重新加锁
    }
    v := q.data[0]
    q.data = q.data[1:]
    return v
}

func main() {
    q := NewQueue()

    // 消费者
    go func() {
        for i := 0; i < 5; i++ {
            v := q.Get()
            fmt.Println("消费:", v)
        }
    }()

    // 生产者
    for i := 1; i <= 5; i++ {
        time.Sleep(200 * time.Millisecond)
        q.Put(i)
        fmt.Println("生产:", i)
    }

    time.Sleep(time.Second)
}
\`\`\`

#### Wait 的伪代码

\`Cond.Wait()\` 内部做三件事：

1. 释放锁。
2. 阻塞等待 \`Signal\` / \`Broadcast\`。
3. 被唤醒后重新加锁。

所以调用 Wait 前**必须持有锁**。

### 九、原子操作：sync/atomic

\`sync/atomic\` 提供基本类型的原子操作——比 Mutex 更轻量。适合计数器、标志位等简单场景。

\`\`\`go
package main

import (
    "fmt"
    "sync"
    "sync/atomic"
)

func main() {
    // 1. int64 计数器
    var counter int64
    var wg sync.WaitGroup
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            atomic.AddInt64(&counter, 1)
        }()
    }
    wg.Wait()
    fmt.Println("counter:", atomic.LoadInt64(&counter)) // 1000

    // 2. 原子布尔（Go 1.19+ atomic.Bool）
    var done atomic.Bool
    go func() {
        // ... 工作
        done.Store(true)
    }()
    for !done.Load() {
        // 自旋等待
    }
    fmt.Println("done")

    // 3. 原子指针
    var ptr atomic.Pointer[int]
    v := 42
    ptr.Store(&v)
    if p := ptr.Load(); p != nil {
        fmt.Println("ptr:", *p) // 42
    }

    // 4. CAS（Compare-And-Swap）
    var x int64 = 10
    if atomic.CompareAndSwapInt64(&x, 10, 20) {
        fmt.Println("CAS 成功:", x) // 20
    }
    if !atomic.CompareAndSwapInt64(&x, 10, 30) {
        fmt.Println("CAS 失败: x 已不是 10")
    }
}
\`\`\`

#### atomic.Value（Go 1.4+）

\`atomic.Value\` 可以原子地存取任意类型——适合"配置热更新"场景。

\`\`\`go
package main

import (
    "fmt"
    "sync/atomic"
    "time"
)

type Config struct {
    Threshold int
    Message   string
}

func main() {
    var config atomic.Value
    config.Store(&Config{Threshold: 100, Message: "v1"})

    // 读
    go func() {
        for i := 0; i < 5; i++ {
            c := config.Load().(*Config)
            fmt.Printf("读: %s (threshold=%d)\\n", c.Message, c.Threshold)
            time.Sleep(200 * time.Millisecond)
        }
    }()

    // 写
    time.Sleep(500 * time.Millisecond)
    config.Store(&Config{Threshold: 200, Message: "v2"})
    fmt.Println("配置已更新")

    time.Sleep(time.Second)
}
\`\`\`

#### atomic vs Mutex 的选择

- **简单计数/标志位**：用 atomic，无锁性能高。
- **复合操作**（多个变量一起改）：用 Mutex——atomic 无法保证多个变量的原子性。
- **读多写少且数据较大**：用 \`atomic.Value\` 或 \`RWMutex\`。

### 十、内存模型与 happens-before

Go 内存模型定义了"一个 goroutine 的写操作何时能被另一个 goroutine 看到"。核心概念是 **happens-before**——如果 A happens-before B，那么 B 一定能看到 A 的写。

#### 不加同步的读可能看不到写

\`\`\`go
package main

import (
    "fmt"
    "time"
)

var ready bool
var data int

func main() {
    go func() {
        data = 42
        ready = true // ⚠️ 没有同步，主 goroutine 可能看不到
    }()

    // 忙等：可能永远看不到 ready = true
    for !ready {
    }
    fmt.Println("data:", data) // 期望 42，但可能读到 0
    _ = time.Second
}
\`\`\`

#### 修正：用 channel 同步

\`\`\`go
package main

import "fmt"

var data int

func main() {
    ch := make(chan struct{})

    go func() {
        data = 42
        close(ch) // close happens-before 接收
    }()

    <-ch // 接收 happens-before 后续读
    fmt.Println("data:", data) // 保证读到 42
}
\`\`\`

#### happens-before 的保证

1. **channel 发送 happens-before 对应接收**。
2. **close channel happens-before 接收返回零值**。
3. **无缓冲 channel 的接收 happens-before 对应发送完成**（重要！）。
4. **容量为 C 的 channel 第 k 次接收 happens-before 第 (k+C) 次发送完成**。
5. **Mutex.Unlock happens-before 下一次 Mutex.Lock**。
6. **RWMutex 的读/写释放 happens-before 下一次锁**。
7. **Once.Do(f) 中的 f 返回 happens-before 任何 Once.Do 返回**。

\`\`\`go
package main

import "fmt"

var (
    msg    string
    readyCh = make(chan struct{})
)

func main() {
    go func() {
        msg = "hello, world"
        close(readyCh) // 1. close happens-before 接收
    }()

    <-readyCh         // 2. 接收完成
    fmt.Println(msg)   // 3. 由于 1 和 2，写 msg happens-before 这里读 → 一定读到 "hello, world"
}
\`\`\`

#### happens-before 的实战意义

- 不要假设"我先写 \`ready = true\`，你再读 \`ready\`"——没有同步，CPU 缓存/编译器优化可能让你看不到。
- **所有跨 goroutine 共享数据必须通过同步原语访问**——channel、Mutex、atomic。
- \`go run -race\` 能检测大部分 happens-before 违规。

### 十一、综合示例：限流并发爬虫

\`\`\`go
package main

import (
    "context"
    "fmt"
    "math/rand"
    "sync"
    "time"
)

type Result struct {
    URL    string
    Length int
    Err    error
}

func crawlOne(ctx context.Context, url string) Result {
    // 模拟 200-800ms 的请求
    delay := time.Duration(200+rand.Intn(600)) * time.Millisecond
    select {
    case <-time.After(delay):
        return Result{URL: url, Length: 100 + rand.Intn(9000)}
    case <-ctx.Done():
        return Result{URL: url, Err: ctx.Err()}
    }
}

func crawlAll(ctx context.Context, urls []string, maxConcurrent int) []Result {
    // 用带缓冲 channel 当信号量，限制并发
    sem := make(chan struct{}, maxConcurrent)
    results := make([]Result, len(urls))

    var wg sync.WaitGroup
    for i, url := range urls {
        wg.Add(1)
        go func(idx int, u string) {
            defer wg.Done()

            // 获取信号量
            select {
            case sem <- struct{}{}:
                defer func() { <-sem }()
            case <-ctx.Done():
                results[idx] = Result{URL: u, Err: ctx.Err()}
                return
            }

            results[idx] = crawlOne(ctx, u)
            fmt.Printf("完成: %s (%d 字符)\\n", u, results[idx].Length)
        }(i, url)
    }

    wg.Wait()
    return results
}

func main() {
    rand.Seed(time.Now().UnixNano())

    urls := []string{
        "https://example.com/1",
        "https://example.com/2",
        "https://example.com/3",
        "https://example.com/4",
        "https://example.com/5",
        "https://example.com/6",
        "https://example.com/7",
        "https://example.com/8",
    }

    // 5 秒超时，最多 3 并发
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    start := time.Now()
    results := crawlAll(ctx, urls, 3)

    success := 0
    for _, r := range results {
        if r.Err == nil {
            success++
        } else {
            fmt.Printf("失败: %s (%v)\\n", r.URL, r.Err)
        }
    }
    fmt.Printf("成功 %d/%d, 耗时 %v\\n", success, len(urls), time.Since(start))
}
\`\`\`

这个例子综合了：

1. **context.WithTimeout**：超时控制。
2. **带缓冲 channel 作为信号量**：限制并发数。
3. **WaitGroup**：等待所有 goroutine。
4. **select**：响应取消信号。
5. **预分配结果 slice**：避免共享 map 的锁开销。

### 十二、本章小结

- **Worker Pool**：固定数量的 worker 消费任务队列，限制资源使用。
- **Fan-In / Fan-Out**：分发任务并行处理，合并结果。
- **Pipeline**：多阶段串联，每阶段独立 goroutine。
- **context 包**：取消（WithCancel）、超时（WithTimeout）、值传递（WithValue）——现代 Go 必备。
- **sync.Mutex / RWMutex**：互斥锁 / 读写锁，保护共享数据。
- **sync.Cond**：等待/通知条件成立。
- **sync/atomic**：原子计数、CAS、原子指针/值——比锁更轻量。
- **内存模型 happens-before**：跨 goroutine 共享数据必须通过同步原语访问，否则可能读到旧值。
- 设计哲学：**优先用 channel，必要时用锁**——这是 Go 并发的风格。
`,
  },
];

export { chapters };
