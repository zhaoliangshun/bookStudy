// =============================================================
// Go 教程 - 第三批章节（第三部分 类型系统，共 4 章）
// -------------------------------------------------------------
// 本批包含 4 章：
//   go-ch09 : 第九章 方法
//   go-ch10 : 第十章 接口
//   go-ch11 : 第十一章 类型声明与组合
//   go-ch12 : 第十二章 错误处理
//
// 所有 Go 代码示例均可在交互式编辑器中通过 go run 运行。
// 适用版本：Go 1.21+
// =============================================================

const chapters = [
  // ============================================================
  // 第九章：方法
  // ============================================================
  {
    id: 'go-ch09',
    group: '第三部分 类型系统',
    icon: '🔧',
    title: '方法',
    content: `## 第九章　方法

### 一、为什么需要方法

在前面的章节里，我们用函数来操作数据：\`func Add(a, b int) int\`。当数据类型变多、行为变复杂时，把"数据 + 对数据的操作"绑定在一起会让代码更清晰。Go 没有 class，但允许给任意**自定义类型**绑定方法：

\`\`\`go
package main

import "fmt"

// 定义一个自定义类型
type Counter struct {
	value int
}

// 给 Counter 绑定一个方法
func (c Counter) Increment() {
	c.value++ // 注意：这里改的是副本
}

func (c Counter) Get() int {
	return c.value
}

func main() {
	var c Counter
	c.Increment()
	c.Increment()
	fmt.Println(c.Get()) // 0
}
\`\`\`

\`(c Counter)\` 是"接收者"（receiver），相当于其他语言里的 \`this\` 或 \`self\`。注意上面 \`Increment()\` 看起来"没用"——因为值接收者拿到的是副本，对原对象没有影响。这就引出了下面要讲的核心议题：值接收者 vs 指针接收者。

#### 方法的语法结构

\`\`\`
func (receiver ReceiverType) MethodName(args) (returns) {
    // 方法体
}
\`\`\`

- **receiver**：接收者变量名（一般用类型首字母小写，如 \`c Counter\` 中的 \`c\`）。
- **ReceiverType**：可以是结构体、自定义类型（基于基本类型的 type 定义），但不能是接口或指针类型本身。

\`\`\`go
package main

import "fmt"

// 给基于 int 的自定义类型绑定方法
type MyInt int

func (m MyInt) IsPositive() bool {
	return m > 0
}

// 给基于 slice 的自定义类型绑定方法
type IntSlice []int

func (s IntSlice) Sum() int {
	total := 0
	for _, v := range s {
		total += v
	}
	return total
}

// 给基于函数类型的自定义类型绑定方法
type Handler func()

func (h Handler) Run() {
	h()
}

func main() {
	var n MyInt = 10
	fmt.Println(n.IsPositive()) // true

	s := IntSlice{1, 2, 3, 4, 5}
	fmt.Println(s.Sum()) // 15

	var f Handler = func() { fmt.Println("handler 执行") }
	f.Run() // handler 执行
}
\`\`\`

### 二、值接收者

值接收者拿到的是原对象的**副本**，方法内部修改不会影响外部：

\`\`\`go
package main

import "fmt"

type Money struct {
	amount int
}

func (m Money) Add(n int) Money {
	m.amount += n // 修改副本，原对象不变
	return m
}

func (m Money) Display() string {
	return fmt.Sprintf("%d 元", m.amount)
}

func main() {
	m := Money{amount: 100}
	m2 := m.Add(50)
	fmt.Println(m.Display())  // 100 元，原对象不变
	fmt.Println(m2.Display()) // 150 元，返回的是新对象
}
\`\`\`

值接收者相当于"按值传递"——方法内部修改不会影响外部。这适合**只读方法**或不希望改变原对象的方法（比如 \`String()\`、\`Area()\`）。

#### 值接收者的特点

1. **不可变性**：方法内修改的是副本，原对象不变。
2. **线程安全**：值接收者方法天然并发安全（每个 goroutine 拿到独立副本）。
3. **拷贝成本**：每次调用都拷贝整个结构体——结构体大时有性能开销。

\`\`\`go
package main

import "fmt"

type Point struct{ X, Y float64 }

// 值接收者：只读，不修改原对象
func (p Point) Distance() float64 {
	return p.X*p.X + p.Y*p.Y
}

func main() {
	p := Point{X: 3, Y: 4}
	fmt.Println(p.Distance()) // 25
	fmt.Println(p)            // {3 4}，未改变
}
\`\`\`

### 三、指针接收者

指针接收者拿到的是原对象的地址，方法内的修改会影响外部：

\`\`\`go
package main

import "fmt"

type Money struct {
	amount int
}

func (m *Money) Add(n int) {
	m.amount += n // 通过指针修改原对象
}

func (m *Money) Subtract(n int) error {
	if m.amount < n {
		return fmt.Errorf("余额不足")
	}
	m.amount -= n
	return nil
}

func main() {
	m := &Money{amount: 100}
	m.Add(50)
	fmt.Println(m.amount) // 150

	if err := m.Subtract(30); err != nil {
		fmt.Println("错误：", err)
	}
	fmt.Println(m.amount) // 120
}
\`\`\`

指针接收者适合**需要修改状态**的方法。它也避免了大结构体的拷贝成本。

#### 指针接收者的特点

1. **可变性**：方法内修改影响外部。
2. **零拷贝**：只传递指针（8 字节），结构体大时性能更好。
3. **nil 安全性**：可以做 nil 检查（后面会讲）。
4. **必须可寻址**：调用方必须能取到对象的地址。

### 四、值接收者 vs 指针接收者：对比表

| 维度 | 值接收者 \`func (m Money)\` | 指针接收者 \`func (m *Money)\` |
|------|------------------------|----------------------------|
| 内部修改 | 不影响外部 | 影响外部 |
| 拷贝成本 | 整个结构体拷贝 | 只拷贝一个指针（8 字节） |
| nil 安全性 | 直接 nil 会 panic | 可以做 nil 检查 |
| 调用语法 | \`m.F()\` 自动取值 | \`m.F()\` 自动取地址 |
| 方法集 | 只有值方法 | 值方法 + 指针方法 |
| 接口实现 | T 和 *T 都实现 | 只有 *T 实现 |

#### 决策流程

\`\`\`
是否需要修改状态？
├─ 是 → 用指针接收者
└─ 否 → 结构体大小？
        ├─ 大（>64 字节） → 用指针接收者
        └─ 小 → 类型是否需要"不可变"语义？
                ├─ 是 → 用值接收者
                └─ 否 → 团队约定（推荐用指针接收者保持一致）
\`\`\`

### 五、自动取地址与自动取值

Go 编译器会自动处理"值调用指针方法"和"指针调用值方法"的转换：

\`\`\`go
package main

import "fmt"

type Counter struct{ value int }

func (c Counter) Value() int  { return c.value }
func (c *Counter) Inc()        { c.value++ }

func main() {
	c := Counter{value: 10}

	// 值类型调用值接收者方法
	fmt.Println(c.Value()) // 10

	// 值类型调用指针接收者方法——Go 自动取地址 (&c).Inc()
	c.Inc()
	fmt.Println(c.Value()) // 11

	// 指针调用值接收者方法——Go 自动解引用 (*p).Value()
	p := &Counter{value: 99}
	fmt.Println(p.Value()) // 99

	// 指针调用指针接收者方法
	p.Inc()
	fmt.Println(p.Value()) // 100
}
\`\`\`

虽然编译器做了"自动转换"，但有几个细节需要注意：

1. **方法集决定接口实现**（下一章会展开）。
2. **可寻址性**：如果对象不可寻址，编译器无法自动取地址，会编译错误。

### 六、可寻址性详解

可寻址（addressable）的对象才能被取地址。Go 中：

| 表达式 | 是否可寻址 | 原因 |
|--------|----------|------|
| \`var x int; &x\` | ✅ | 局部变量可寻址 |
| \`&slice[i]\` | ✅ | 切片元素可寻址 |
| \`&array[i]\` | ✅ | 数组元素可寻址 |
| \`&struct.field\` | ✅ | 结构体字段可寻址 |
| \`&m["key"]\` | ❌ | map 值不可寻址 |
| \`&fn()\` | ❌ | 函数返回值不可寻址 |
| \`&literal\` | ❌ | 字面量不可寻址 |
| \`&constant\` | ❌ | 常量不可寻址 |

#### map 值不可寻址的陷阱

\`\`\`go
package main

type Counter struct{ value int }

func (c *Counter) Inc() { c.value++ }

func main() {
	m := map[string]Counter{"a": {value: 1}}
	// m["a"].Inc() // 编译错误：cannot assign to m["a"] 或 cannot take address

	// 解决方法：把值类型改成指针类型
	m2 := map[string]*Counter{"a": {value: 1}}
	m2["a"].Inc()
}
\`\`\`

map 的值不可寻址，因为 map 内部可能 rehash，地址会失效。修复方法：把值类型改成指针类型 \`map[string]*Counter\`。

#### 字面量不可寻址

\`\`\`go
package main

type Counter struct{ value int }

func (c *Counter) Inc() { c.value++ }

func main() {
	// Counter{value: 1}.Inc() // 编译错误：cannot take address of Counter literal

	// 必须先存到变量
	c := Counter{value: 1}
	c.Inc()
}
\`\`\`

字面量是临时值，编译器无法保证其地址有效。赋值给变量后就可寻址了。

### 七、方法集规则

方法集（method set）决定了一个类型实现了哪些方法。规则很明确：

- **T 的方法集**：所有 \`func (T) M()\` —— 值接收者方法。
- **\*T 的方法集**：所有 \`func (T) M()\` + \`func (*T) M()\` —— 值接收者 + 指针接收者。

\`\`\`go
package main

import "fmt"

type Speaker interface {
	Speak()
}

type LoudSpeaker interface {
	Shout()
}

type Dog struct{}

func (d Dog) Speak()  { fmt.Println("汪汪") }
func (d *Dog) Shout() { fmt.Println("汪汪汪！") }

func main() {
	d := Dog{}
	p := &Dog{}

	// Dog 类型只能赋值给 Speaker（值接收者）
	var _ Speaker = d
	var _ Speaker = p

	// 只有 *Dog 能赋值给 LoudSpeaker（指针接收者）
	// var _ LoudSpeaker = d // 编译错误：Dog 没有实现 Shout
	var _ LoudSpeaker = p
}
\`\`\`

**记忆要点：** \`*T\` 可以做的事 \`T\` 都可以做，反过来不行。给一个类型方法时，**要么全用值接收者，要么全用指针接收者**——混用容易出 bug，也是 Go 社区强烈反对的。

#### 方法集的常见陷阱

\`\`\`go
package main

import "fmt"

type Saver interface {
	Save() error
}

type Config struct{ path string }

func (c *Config) Save() error {
	fmt.Printf("保存到 %s\\n", c.path)
	return nil
}

func SaveTo(s Saver) {
	s.Save()
}

func main() {
	c := Config{path: "config.json"}
	// SaveTo(c) // 编译错误：Config 没有实现 Saver（*Config 才有）
	SaveTo(&c) // OK：*Config 实现了 Saver
}
\`\`\

### 八、方法与字段同名

Go 允许方法和字段同名吗？**不允许**——方法集和字段命名空间相同：

\`\`\`go
package main

type User struct {
	Name string // 字段
}

// func (u User) Name() string { // 编译错误：method and field with same name
// 	return u.Name
// }

func main() {
	u := User{Name: "张三"}
	_ = u
}
\`\`\`

#### 方法不重载

Go 不支持方法重载——同一类型不能有同名方法（即使参数不同）：

\`\`\`go
type S struct{}

func (s S) F()      {}
// func (s S) F(x int) {} // 编译错误：method redeclared
\`\`\`

设计原因：方法重载会让调用选择复杂化，Go 选择"显式优于隐式"。需要不同参数版本时，给方法起不同的名字：

\`\`\`go
package main

import "fmt"

type Formatter struct{}

func (f Formatter) FormatInt(n int) string         { return fmt.Sprintf("%d", n) }
func (f Formatter) FormatString(s string) string   { return s }
func (f Formatter) FormatFloat(n float64) string   { return fmt.Sprintf("%.2f", n) }

func main() {
	f := Formatter{}
	fmt.Println(f.FormatInt(42))
	fmt.Println(f.FormatString("hello"))
	fmt.Println(f.FormatFloat(3.14))
}
\`\`\`

### 九、嵌入字段的方法提升

Go 没有"继承"，但有**嵌入（embedding）**——把一个类型作为匿名字段嵌入到另一个类型里，外层类型会自动"提升"内层类型的方法。

#### 基本嵌入

\`\`\`go
package main

import "fmt"

type Animal struct{}

func (a Animal) Breathe() { fmt.Println("呼吸中...") }

type Dog struct {
	Animal // 匿名嵌入字段
}

func main() {
	d := Dog{}
	d.Breathe() // 等价于 d.Animal.Breathe()
	fmt.Println(d) // { {}}
}
\`\`\`

外层类型 \`Dog\` 直接获得了 \`Animal.Breathe()\` 方法——这就是"方法提升"。

#### 嵌入字段的方法提升：详细

\`\`\`go
package main

import "fmt"

type Engine struct {
	power int
}

func (e Engine) Start()  { fmt.Println("引擎启动") }
func (e *Engine) Turbo() { e.power += 100; fmt.Println("涡轮+100") }

type Car struct {
	Engine
	model string
}

func (c Car) Drive() { fmt.Printf("%s 行驶中\\n", c.model) }

func main() {
	c := Car{Engine: Engine{power: 100}, model: "Tesla"}
	c.Start()  // 来自 Engine（值接收者）
	c.Drive()  // 来自 Car
	c.Turbo()  // 来自 *Engine（指针接收者）—— 调用 (&c.Engine).Turbo()
	fmt.Println(c.power) // 200
}
\`\`\`

注意几点：

1. 提升的方法会"穿透"——\`c.Start()\` 实际是 \`c.Engine.Start()\`。
2. 外层方法可以覆盖内层同名方法：如果 \`Car\` 也定义了 \`Start()\`，\`c.Start()\` 调用的是 \`Car.Start()\`，但 \`c.Engine.Start()\` 仍可访问。

### 十、方法覆盖（外层覆盖内层）

\`\`\`go
package main

import "fmt"

type Base struct{}

func (b Base) Hello() { fmt.Println("Base.Hello") }

type Child struct{ Base }

func (c Child) Hello() { fmt.Println("Child.Hello") } // 覆盖

func main() {
	c := Child{}
	c.Hello()        // Child.Hello
	c.Base.Hello()   // Base.Hello（显式访问被覆盖的方法）
}
\`\`\`

注意 Go 的"覆盖"和 Java/C# 的"多态"不同——Go 没有 \`virtual\` 概念，方法调用按**编译期**的静态类型决定。

### 十一、多层嵌入

\`\`\`go
package main

import "fmt"

type A struct{}

func (a A) Foo() { fmt.Println("A.Foo") }

type B struct{ A } // B 嵌入 A
type C struct{ B } // C 嵌入 B

func main() {
	var c C
	c.Foo() // 一路提升：c.B.A.Foo()
}
\`\`\`

方法可以穿透任意层级的嵌入——这是 Go 实现"分层抽象"的方式。

### 十二、嵌入字段的命名

嵌入字段的字段名默认就是类型名（去掉包前缀）：

\`\`\`go
package main

import "fmt"

type Engine struct{ power int }

type Car struct{ Engine } // 字段名是 "Engine"

func main() {
	c := Car{Engine: Engine{power: 200}}
	fmt.Println(c.Engine.power) // 200
	fmt.Println(c.power)       // 200（提升）
}
\`\`\`

#### 同名冲突

如果两个嵌入字段有同名方法，调用时必须显式指定：

\`\`\`go
package main

import "fmt"

type A struct{}
func (A) Hello() { fmt.Println("A.Hello") }

type B struct{}
func (B) Hello() { fmt.Println("B.Hello") }

type C struct {
	A
	B
}

func main() {
	c := C{}
	// c.Hello() // 编译错误：ambiguous selector c.Hello
	c.A.Hello() // 显式指定
	c.B.Hello()
}
\`\`\

### 十三、空接收者（nil 安全调用）

指针接收者可以接收 nil——只要方法内不访问字段就不会 panic。这让"空对象模式"成为可能：

\`\`\`go
package main

import "fmt"

type List struct {
	value int
	next  *List
}

func (l *List) Length() int {
	if l == nil {
		return 0
	}
	return 1 + l.next.Length() // 链式调用，nil 安全
}

func main() {
	l := &List{
		value: 1,
		next: &List{
			value: 2,
			next:  nil,
		},
	}
	fmt.Println(l.Length()) // 2

	var empty *List
	fmt.Println(empty.Length()) // 0，不会 panic
}
\`\`\`

注意 \`empty.Length()\` 的神奇之处——\`empty\` 是 nil 指针，但调用它的方法不会 panic，因为方法体里有 nil 检查。这是 Go 风格的"链表/树"实现，比其他语言简洁很多。

#### 空接收者 vs nil 解引用

\`\`\`go
package main

import "fmt"

type Safe struct{}
func (s *Safe) Hello() { fmt.Println("Safe.Hello") } // 不访问字段，nil 安全

type Unsafe struct{ value int }
func (u *Unsafe) Hello() { fmt.Println("Unsafe.value:", u.value) } // 访问字段，nil 会 panic

func main() {
	var s *Safe
	s.Hello() // Safe.Hello，不会 panic

	// var u *Unsafe
	// u.Hello() // panic: runtime error: invalid memory address
}
\`\`\

### 十四、方法值（Method Value）

把方法绑定到具体接收者上，得到一个函数值：

\`\`\`go
package main

import "fmt"

type Counter struct{ value int }

func (c *Counter) Inc() { c.value++ }
func (c Counter) Get() int { return c.value }

func main() {
	c := &Counter{}
	f := c.Inc // 方法值：f 是 func()，绑定了 c
	f()
	f()
	f()
	fmt.Println(c.Get()) // 3
}
\`\`\`

方法值在"回调"场景很有用——比如把某个对象的方法作为 \`http.HandlerFunc\` 注册：

\`\`\`go
package main

import "fmt"

type Handler struct{ name string }

func (h *Handler) Serve() { fmt.Printf("%s 处理请求\\n", h.name) }

func RegisterHandler(f func()) {
	// 模拟路由注册
	f()
}

func main() {
	h := &Handler{name: "userHandler"}
	RegisterHandler(h.Serve) // 方法值
}
\`\`\`

### 十五、方法表达式（Method Expression）

方法表达式把方法"解耦"成普通函数，第一个参数是接收者：

\`\`\`go
package main

import "fmt"

type Counter struct{ value int }

func (c *Counter) Inc() { c.value++ }
func (c Counter) Get() int { return c.value }

func main() {
	inc := (*Counter).Inc // 方法表达式：func(*Counter)
	c := &Counter{}
	inc(c)
	inc(c)
	fmt.Println(c.Get()) // 2

	get := Counter.Get // 方法表达式：func(Counter) int
	fmt.Println(get(*c)) // 2
}
\`\`\`

#### 方法值 vs 方法表达式对比

| 维度 | 方法值 \`c.Inc\` | 方法表达式 \`(*Counter).Inc\` |
|------|----------------|--------------------------|
| 类型 | \`func()\` | \`func(*Counter)\` |
| 接收者 | 绑定到具体对象 | 作为第一个参数传递 |
| 用途 | 回调注册（已绑定） | 工具函数、泛型操作 |

方法表达式在"通用工具函数"场景很有用——比如用反射或泛型时：

\`\`\`go
package main

import "fmt"

type Counter struct{ value int }

func (c *Counter) Inc() { c.value++ }
func (c Counter) Get() int { return c.value }

// 通用工具：对任意 Counter 调用方法
func Apply(cs []*Counter, fn func(*Counter)) {
	for _, c := range cs {
		fn(c)
	}
}

func main() {
	cs := []*Counter{{}, {}, {}}
	Apply(cs, (*Counter).Inc) // 用方法表达式
	for _, c := range cs {
		fmt.Println(c.Get()) // 1 1 1
	}
}
\`\`\`

### 十六、接收者选型的决策原则

- **结构体大（>64 字节）**：用指针接收者，避免每次调用都拷贝。
- **需要修改状态**：用指针接收者。
- **小且不可变的类型（如 time.Time）**：用值接收者。
- **一个类型的所有方法，应该统一**：要么全值，要么全指针。

#### time.Time 是值接收者的典型

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func main() {
	t1 := time.Now()
	t2 := t1
	t2 = t2.Add(time.Hour)
	fmt.Println(t1) // 原值不变
	fmt.Println(t2) // 加 1 小时
}
\`\`\`

\`time.Time\` 是值类型，所有方法都是值接收者，强调"不可变"语义。这与 \`big.Int\` 的设计截然不同——\`big.Int\` 用指针接收者，因为它需要可变操作。

### 十七、综合示例：链表实现

\`\`\`go
package main

import "fmt"

type Node struct {
	value int
	next  *Node
}

type List struct {
	head *Node
	size int
}

// PushHead 在头部插入，指针接收者修改 size 和 head
func (l *List) PushHead(v int) {
	l.head = &Node{value: v, next: l.head}
	l.size++
}

// Len 返回长度，值接收者足够
func (l List) Len() int { return l.size }

// ForEach 遍历，值接收者（不修改）
func (l List) ForEach(fn func(int)) {
	for n := l.head; n != nil; n = n.next {
		fn(n.value)
	}
}

// Reverse 反转链表，指针接收者
func (l *List) Reverse() {
	var prev *Node
	curr := l.head
	for curr != nil {
		next := curr.next
		curr.next = prev
		prev = curr
		curr = next
	}
	l.head = prev
}

// String 实现 fmt.Stringer
func (l List) String() string {
	if l.head == nil {
		return "[]"
	}
	s := "["
	for n := l.head; n != nil; n = n.next {
		if n != l.head {
			s += " -> "
		}
		s += fmt.Sprintf("%d", n.value)
	}
	return s + "]"
}

func main() {
	var l List
	l.PushHead(1)
	l.PushHead(2)
	l.PushHead(3)
	fmt.Println(l) // [3 -> 2 -> 1]
	l.Reverse()
	fmt.Println(l) // [1 -> 2 -> 3]
	fmt.Println("len:", l.Len()) // 3
}
\`\`\`

这个例子把值接收者（只读：\`Len\`、\`ForEach\`、\`String\`）和指针接收者（修改：\`PushHead\`、\`Reverse\`）区分开，体现了 Go 方法设计的典型风格。

### 十八、综合示例：栈（Stack）

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

type Stack[T any] struct {
	items []T
}

func (s *Stack[T]) Push(item T) {
	s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, error) {
	var zero T
	if len(s.items) == 0 {
		return zero, errors.New("stack is empty")
	}
	idx := len(s.items) - 1
	item := s.items[idx]
	s.items = s.items[:idx]
	return item, nil
}

func (s Stack[T]) Len() int {
	return len(s.items)
}

func (s Stack[T]) Peek() (T, error) {
	var zero T
	if len(s.items) == 0 {
		return zero, errors.New("stack is empty")
	}
	return s.items[len(s.items)-1], nil
}

func main() {
	s := &Stack[int]{}
	s.Push(1)
	s.Push(2)
	s.Push(3)

	fmt.Println("len:", s.Len()) // 3

	if v, err := s.Peek(); err == nil {
		fmt.Println("peek:", v) // 3
	}

	for s.Len() > 0 {
		v, _ := s.Pop()
		fmt.Println("pop:", v) // 3 2 1
	}

	_, err := s.Pop()
	fmt.Println("err:", err) // err: stack is empty
}
\`\`\

### 十九、综合示例：建造者模式（Builder）

\`\`\`go
package main

import "fmt"

type Pizza struct {
	size      string
	sauce     string
	cheese    bool
	pepperoni bool
	mushroom  bool
}

type PizzaBuilder struct {
	pizza Pizza
}

func NewPizzaBuilder() *PizzaBuilder {
	return &PizzaBuilder{}
}

func (b *PizzaBuilder) Size(s string) *PizzaBuilder {
	b.pizza.size = s
	return b
}

func (b *PizzaBuilder) Sauce(s string) *PizzaBuilder {
	b.pizza.sauce = s
	return b
}

func (b *PizzaBuilder) AddCheese() *PizzaBuilder {
	b.pizza.cheese = true
	return b
}

func (b *PizzaBuilder) AddPepperoni() *PizzaBuilder {
	b.pizza.pepperoni = true
	return b
}

func (b *PizzaBuilder) AddMushroom() *PizzaBuilder {
	b.pizza.mushroom = true
	return b
}

func (b *PizzaBuilder) Build() Pizza {
	return b.pizza
}

func main() {
	pizza := NewPizzaBuilder().
		Size("large").
		Sauce("tomato").
		AddCheese().
		AddPepperoni().
		AddMushroom().
		Build()

	fmt.Printf("%+v\\n", pizza)
	// {size:large sauce:tomato cheese:true pepperoni:true mushroom:true}
}
\`\`\`

链式调用通过返回 \`*PizzaBuilder\` 实现——这是 Go 实现建造者模式的常见方式。

### 二十、方法的实战模式

#### 1. 函数式选项模式（Functional Options）

这是 Go 社区流行的"配置"模式——通过方法链灵活配置对象：

\`\`\`go
package main

import "fmt"

type Server struct {
	host    string
	port    int
	timeout int
	tls     bool
}

type Option func(*Server)

func WithHost(h string) Option       { return func(s *Server) { s.host = h } }
func WithPort(p int) Option          { return func(s *Server) { s.port = p } }
func WithTimeout(t int) Option       { return func(s *Server) { s.timeout = t } }
func WithTLS() Option                { return func(s *Server) { s.tls = true } }

func NewServer(opts ...Option) *Server {
	s := &Server{
		host:    "localhost",
		port:    8080,
		timeout: 30,
	}
	for _, opt := range opts {
		opt(s)
	}
	return s
}

func (s *Server) Start() {
	scheme := "http"
	if s.tls {
		scheme = "https"
	}
	fmt.Printf("启动 %s://%s:%d，超时 %d 秒\\n", scheme, s.host, s.port, s.timeout)
}

func main() {
	s1 := NewServer()
	s1.Start()

	s2 := NewServer(
		WithHost("0.0.0.0"),
		WithPort(443),
		WithTLS(),
		WithTimeout(60),
	)
	s2.Start()
}
\`\`\`

函数式选项让 API 既"开箱即用"又有"高度可定制"——这是 gRPC、Kubernetes client 等大型项目的标准模式。

#### 2. 回调与方法值

方法值在"事件回调"场景非常方便：

\`\`\`go
package main

import "fmt"

type Button struct {
	onClick func()
}

func (b *Button) Click() {
	if b.onClick != nil {
		b.onClick()
	}
}

func (b *Button) SetOnClick(handler func()) {
	b.onClick = handler
}

type App struct {
	name string
}

func (a *App) HandleClick() {
	fmt.Printf("%s 处理点击\\n", a.name)
}

func main() {
	app := &App{name: "MyApp"}
	btn := &Button{}

	// 用方法值注册回调
	btn.SetOnClick(app.HandleClick)
	btn.Click() // MyApp 处理点击
}
\`\`\`

#### 3. 方法链（Builder Pattern）

方法链通过返回 \`*T\` 让调用可以连写：

\`\`\`go
package main

import "fmt"

type Query struct {
	table   string
	fields  []string
	where   string
	limit   int
}

func NewQuery(table string) *Query {
	return &Query{table: table}
}

func (q *Query) Select(fields ...string) *Query {
	q.fields = fields
	return q
}

func (q *Query) Where(cond string) *Query {
	q.where = cond
	return q
}

func (q *Query) Limit(n int) *Query {
	q.limit = n
	return q
}

func (q *Query) Build() string {
	sql := "SELECT "
	if len(q.fields) == 0 {
		sql += "*"
	} else {
		for i, f := range q.fields {
			if i > 0 {
				sql += ", "
			}
			sql += f
		}
	}
	sql += " FROM " + q.table
	if q.where != "" {
		sql += " WHERE " + q.where
	}
	if q.limit > 0 {
		sql += fmt.Sprintf(" LIMIT %d", q.limit)
	}
	return sql
}

func main() {
	sql := NewQuery("users").
		Select("id", "name", "email").
		Where("age > 18").
		Limit(10).
		Build()
	fmt.Println(sql)
	// SELECT id, name, email FROM users WHERE age > 18 LIMIT 10
}
\`\`\`

#### 4. 装饰器模式

通过嵌入接口 + 覆盖方法，给现有方法添加行为：

\`\`\`go
package main

import "fmt"

type Greeter interface {
	Greet(name string) string
}

type EnglishGreeter struct{}

func (EnglishGreeter) Greet(name string) string {
	return "Hello, " + name
}

// 装饰器：加感叹号
type ExclaimGreeter struct {
	Greeter
}

func (e ExclaimGreeter) Greet(name string) string {
	return e.Greeter.Greet(name) + "!"
}

// 装饰器：转大写
type UpperGreeter struct {
	Greeter
}

func (u UpperGreeter) Greet(name string) string {
	s := u.Greeter.Greet(name)
	return stringsToUpper(s)
}

func stringsToUpper(s string) string {
	result := ""
	for _, r := range s {
		if r >= 'a' && r <= 'z' {
			result += string(r - 32)
		} else {
			result += string(r)
		}
	}
	return result
}

func main() {
	var g Greeter = EnglishGreeter{}
	g = ExclaimGreeter{Greeter: g}
	g = UpperGreeter{Greeter: g}
	fmt.Println(g.Greet("world")) // HELLO, WORLD!
}
\`\`\`

### 二十一、方法的反模式

#### 1. 混用值接收者和指针接收者

\`\`\`go
package main

import "fmt"

type Bad struct{ value int }

// 不好：混用值和指针接收者
func (b Bad) GetValue() int   { return b.value } // 值
func (b *Bad) SetValue(v int) { b.value = v }     // 指针

func main() {
	b := Bad{}
	b.SetValue(42)
	fmt.Println(b.GetValue()) // 42
	// 看似能用，但接口实现会出问题
}
\`\`\`

#### 2. 大结构体用值接收者

\`\`\`go
package main

import "fmt"

type BigData struct {
	data [10000]int // 80 KB
}

// 不好：每次调用都拷贝 80 KB
func (b BigData) Sum() int {
	total := 0
	for _, v := range b.data {
		total += v
	}
	return total
}

// 好：用指针接收者，只拷贝 8 字节
func (b *BigData) SumPtr() int {
	total := 0
	for _, v := range b.data {
		total += v
	}
	return total
}

func main() {
	b := &BigData{}
	b.data[0] = 42
	fmt.Println(b.Sum(), b.SumPtr())
}
\`\`\`

#### 3. 不必要的指针接收者

\`\`\`go
package main

import "fmt"

type Point struct{ X, Y float64 }

// 不必要：小结构体的只读方法用指针，反而增加间接寻址开销
func (p *Point) Distance() float64 {
	return p.X*p.X + p.Y*p.Y
}

// 推荐：小结构体只读方法用值接收者
func (p Point) DistanceGood() float64 {
	return p.X*p.X + p.Y*p.Y
}

func main() {
	p := Point{3, 4}
	fmt.Println(p.Distance(), p.DistanceGood())
}
\`\`\`

### 二十二、方法与接口的协作

方法和接口配合使用，能实现高度解耦的设计。

#### 1. 通过方法实现接口

\`\`\`go
package main

import "fmt"

type Sorter interface {
	Len() int
	Less(i, j int) bool
	Swap(i, j int)
}

type IntSlice []int

func (s IntSlice) Len() int           { return len(s) }
func (s IntSlice) Less(i, j int) bool { return s[i] < s[j] }
func (s IntSlice) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }

func Sort(s Sorter) {
	for i := 0; i < s.Len(); i++ {
		for j := i + 1; j < s.Len(); j++ {
			if s.Less(j, i) {
				s.Swap(i, j)
			}
		}
	}
}

func main() {
	data := IntSlice{3, 1, 4, 1, 5, 9, 2, 6}
	Sort(data)
	fmt.Println(data) // [1 1 2 3 4 5 6 9]
}
\`\`\`

\`IntSlice\` 通过实现 \`Len/Less/Swap\` 三个方法，自动满足 \`Sorter\` 接口。

#### 2. 接口作为方法返回值

\`\`\`go
package main

import "fmt"

type Animal interface {
	Sound() string
}

type Dog struct{}
func (Dog) Sound() string { return "汪汪" }

type Cat struct{}
func (Cat) Sound() string { return "喵喵" }

// 工厂方法：返回接口
func NewAnimal(kind string) Animal {
	switch kind {
	case "dog":
		return Dog{}
	case "cat":
		return Cat{}
	default:
		return nil
	}
}

func main() {
	a := NewAnimal("dog")
	fmt.Println(a.Sound()) // 汪汪

	b := NewAnimal("cat")
	fmt.Println(b.Sound()) // 喵喵
}
\`\`\`

工厂方法返回接口类型，调用方不关心具体类型，只依赖接口。

### 二十三、方法在标准库中的运用

Go 标准库本身是学习"方法设计"的最佳教材。下面挑几个典型模式做拆解，帮你把书上的概念对接到真实工程代码。

#### 1. \`fmt.Stringer\`：自定义打印格式

任何类型只要实现 \`String() string\` 方法，\`fmt.Println\` 就会调用它来打印。这是最常被实现的接口之一：

\`\`\`go
package main

import "fmt"

type Money struct {
	Yuan  int
	Jiao  int
}

func (m Money) String() string {
	return fmt.Sprintf("%d.%d 元", m.Yuan, m.Jiao)
}

func main() {
	m := Money{Yuan: 12, Jiao: 5}
	fmt.Println(m)        // 12.5 元
	fmt.Printf("%v\\n", m) // 12.5 元
	fmt.Printf("%+v\\n", m) // {Yuan:12 Jiao:5}
}
\`\`\`

注意 \`%v\` 默认也调用 \`String()\`，但 \`%+v\` 会显示字段名。如果你不希望 \`String()\` 被 \`%v\` 触发，可以另外提供一个独立方法。

#### 2. \`sort.Interface\`：用方法描述可排序集合

\`sort\` 包要求实现三个方法：\`Len()\`、\`Less(i, j int) bool\`、\`Swap(i, j int)\`。这就是"用接口描述行为"的范本：

\`\`\`go
package main

import (
	"fmt"
	"sort"
)

type Student struct {
	Name string
	Age  int
}

type ByAge []Student

func (s ByAge) Len() int           { return len(s) }
func (s ByAge) Less(i, j int) bool { return s[i].Age < s[j].Age }
func (s ByAge) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }

func main() {
	students := ByAge{
		{"张三", 22},
		{"李四", 19},
		{"王五", 21},
	}
	sort.Sort(students)
	fmt.Println(students)
	// [{李四 19} {王五 21} {张三 22}]
}
\`\`\`

Go 1.8 后可用 \`sort.Slice\` 简化，但学习这个老式写法能帮你理解"接口=行为契约"的设计思路。

#### 3. \`io.Reader/Writer\`：方法即数据流

\`io.Reader\` 只有一个方法 \`Read(p []byte) (n int, err error)\`。看似简单，却串起了文件、网络、缓冲、加密等所有"流"。装饰器模式在这里非常常见：

\`\`\`go
package main

import (
	"fmt"
	"io"
	"strings"
)

// 把每个字节转大写
type UpperReader struct {
	r io.Reader
}

func (u *UpperReader) Read(p []byte) (int, error) {
	n, err := u.r.Read(p)
	for i := 0; i < n; i++ {
		if p[i] >= 'a' && p[i] <= 'z' {
			p[i] -= 32
		}
	}
	return n, err
}

func main() {
	src := strings.NewReader("hello, world")
	r := &UpperReader{r: src}
	buf := make([]byte, 32)
	n, _ := r.Read(buf)
	fmt.Println(string(buf[:n])) // HELLO, WORLD
}
\`\`\`

把 \`io.Reader\` 当作参数传来传去，调用方完全不关心底层是字符串、文件还是网络连接——这就是方法+接口带来的"流式编程"。

#### 4. \`json.Marshaler\`：自定义序列化

类型可以实现 \`MarshalJSON() ([]byte, error)\` 来控制 JSON 序列化结果：

\`\`\`go
package main

import (
	"encoding/json"
	"fmt"
	"time"
)

type Event struct {
	When time.Time
	What string
}

func (e Event) MarshalJSON() ([]byte, error) {
	type Alias Event // 别名避免递归
	return json.Marshal(struct {
		When string
		What string
	}{
		When: e.When.Format("2006-01-02 15:04:05"),
		What: e.What,
	})
}

func main() {
	e := Event{When: time.Now(), What: "上线部署"}
	b, _ := json.Marshal(e)
	fmt.Println(string(b))
	// {"When":"2026-06-28 10:00:00","What":"上线部署"}
}
\`\`\`

注意 \`type Alias Event\` 这个技巧——它绕开了 \`MarshalJSON\` 自调用形成的无限递归。

#### 5. \`context.Context\`：方法的链式传递

\`context.Context\` 有四个方法：\`Deadline()\`、\`Done()\`、\`Err()\`、\`Value(key)\`。它通过方法把"取消信号""超时""请求作用域的值"统一在一种类型上，是 Go 工程化最重要的接口之一。后续章节会专门讲 \`context\` 包，这里只要先理解：**接口越精简，越容易被各种类型实现**——\`Context\` 只有四个方法，但几乎所有 I/O 函数都接受它。

### 二十四、本章小结

- Go 给**自定义类型**绑定方法，方法签名包含接收者 \`func (r T) M()\`。
- **值接收者**：方法内修改不影响外部，适合只读方法。**指针接收者**：方法内修改影响外部，适合修改状态或大结构体。
- 方法集：\`T\` 只有值接收者方法；\`*T\` 同时有值接收者和指针接收者方法。
- **可寻址性**决定是否能取地址——map 值、字面量等不可寻址。
- **嵌入字段的方法提升**让外层类型自动获得内层方法——这是 Go 替代"继承"的核心机制。
- **空接收者**（nil pointer）可以安全调用方法，前提是方法体里检查了 nil。
- **方法值** \`c.Inc\` 和**方法表达式** \`(*Counter).Inc\` 都把方法转成函数值，区别是前者绑定接收者、后者把接收者作为第一个参数。
- 设计原则：所有方法的接收者类型应保持一致，避免混用。
- **实战模式**：函数式选项、回调、方法链、装饰器。
- **避免反模式**：不要混用接收者类型、大结构体别用值接收者、小结构体只读方法别用指针接收者。
- 方法与接口协作——类型通过方法满足接口，是 Go 实现"开闭原则"的关键。`,
  },

  // ============================================================
  // 第十章：接口
  // ============================================================
  {
    id: 'go-ch10',
    group: '第三部分 类型系统',
    icon: '🧩',
    title: '接口',
    content: `## 第十章　接口

### 一、Go 接口的哲学：隐式实现

在 Java/C# 里，类型要显式声明 \`implements Foo\`，编译器才知道"这个类实现了接口"。Go 反其道而行——**类型只要实现了接口中所有方法，就算实现了这个接口**，不需要任何 \`implements\` 关键字。

这种"隐式实现"带来几个深远影响：

1. **解耦**：接口定义方和实现方可以完全独立——你写一个 \`Logger\` 接口，第三方库的类型天然就能满足，不需要修改第三方源码。
2. **测试友好**：可以定义接口，给业务代码注入 mock 实现。
3. **小接口哲学**：标准库 \`io.Reader\` 只有一个方法 \`Read\`，几乎所有"可读"类型都满足。

Go 社区有句名言："**Accept interfaces, return structs**"——函数参数用接口、返回值用具体类型，这是 Go 风格 API 设计的核心原则。

#### 接口的底层结构

接口值在运行时有两部分：

- **类型信息（type）**：动态类型。
- **值指针（value）**：指向实际数据。

可以用 \`fmt.Printf("%T %v\\n", i, i)\` 查看：

\`\`\`go
package main

import "fmt"

func main() {
	var i any
	i = 42
	fmt.Printf("type=%T value=%v\\n", i, i) // type=int value=42

	i = "hello"
	fmt.Printf("type=%T value=%v\\n", i, i) // type=string value=hello

	i = []int{1, 2, 3}
	fmt.Printf("type=%T value=%v\\n", i, i) // type=[]int value=[1 2 3]
}
\`\`\

### 二、定义与实现接口

#### 接口定义

\`\`\`go
package main

import "fmt"

// 定义接口：一个方法签名
type Speaker interface {
	Speak() string
}

// Dog 类型实现了 Speak 方法——天然满足 Speaker 接口
type Dog struct{ name string }

func (d Dog) Speak() string { return d.name + ": 汪汪" }

// Cat 类型也实现了 Speak 方法
type Cat struct{ name string }

func (c Cat) Speak() string { return c.name + ": 喵喵" }

func Greet(s Speaker) {
	fmt.Println(s.Speak())
}

func main() {
	Greet(Dog{name: "旺财"})
	Greet(Cat{name: "咪咪"})
}
\`\`\`

\`Greet\` 只依赖 \`Speaker\` 接口，不依赖具体的 \`Dog\` 或 \`Cat\`。新增动物类型时，\`Greet\` 不需要改动——这就是接口的"开闭"价值。

#### 多方法接口

\`\`\`go
package main

import "fmt"

type Animal interface {
	Name() string
	Sound() string
}

type Dog struct{ name string }

func (d Dog) Name() string  { return d.name }
func (d Dog) Sound() string { return "汪汪" }

func Introduce(a Animal) {
	fmt.Printf("我是 %s，叫声是 %s\\n", a.Name(), a.Sound())
}

func main() {
	Introduce(Dog{name: "旺财"})
}
\`\`\`

### 三、隐式实现的好处

#### 1. 解耦

接口定义方和实现方可以完全独立：

\`\`\`go
package main

import "fmt"

// 假设这是第三方库
type ThirdPartyLogger struct{}
func (t ThirdPartyLogger) Log(msg string) { fmt.Println("[TPL]", msg) }

// 我们自己的代码：定义接口
type MyLogger interface {
	Log(string)
}

// 桥接：第三方类型天然满足我们的接口
func UseLogger(l MyLogger) {
	l.Log("使用日志器")
}

func main() {
	UseLogger(ThirdPartyLogger{}) // 第三方类型直接传过去
}
\`\`\`

如果用 Java，需要写适配器类来桥接。Go 让这件事"零成本"完成。

#### 2. 测试友好

\`\`\`go
package main

import "fmt"

// 业务接口
type UserRepo interface {
	Find(id int) string
}

// 生产实现
type MySQLRepo struct{}
func (MySQLRepo) Find(id int) string { return fmt.Sprintf("MySQL 用户 %d", id) }

// 测试 mock
type MockRepo struct{}
func (MockRepo) Find(id int) string { return fmt.Sprintf("Mock 用户 %d", id) }

// 业务逻辑：依赖接口，不依赖具体实现
type UserService struct {
	repo UserRepo
}

func (s *UserService) GetUser(id int) string {
	return s.repo.Find(id)
}

func main() {
	// 生产环境
	prod := &UserService{repo: MySQLRepo{}}
	fmt.Println(prod.GetUser(1)) // MySQL 用户 1

	// 测试环境
	test := &UserService{repo: MockRepo{}}
	fmt.Println(test.GetUser(1)) // Mock 用户 1
}
\`\`\`

\`UserService\` 只依赖接口——生产用真实实现，测试用 mock 实现。这就是"面向接口编程"的威力。

### 四、空接口 interface{} 与 any

空接口没有任何方法——所有类型都满足空接口。Go 1.18 起，\`any\` 是 \`interface{}\` 的别名：

\`\`\`go
package main

import "fmt"

func main() {
	// 旧写法
	var x interface{} = 42
	// 新写法（Go 1.18+）：any 是 interface{} 的别名
	var y any = "hello"
	fmt.Println(x, y)
}
\`\`\`

#### 用空接口做"通用容器"

\`\`\`go
package main

import "fmt"

func PrintAny(v any) {
	fmt.Println(v)
}

func main() {
	PrintAny(42)
	PrintAny("hello")
	PrintAny([]int{1, 2, 3})
	PrintAny(struct{ X int }{X: 99})
}
\`\`\`

#### 空接口的局限

空接口让 Go 在某些场景"看起来像动态语言"，但使用前**必须用类型断言**取出具体值——这是 Go 与真正的动态语言（Python、JavaScript）的本质区别。

\`\`\`go
package main

import "fmt"

// 通用"加法"看似可行，实则不推荐
func Add(a, b any) any {
	// 必须类型断言，否则不能相加
	ai, ok1 := a.(int)
	bi, ok2 := b.(int)
	if !ok1 || !ok2 {
		return nil
	}
	return ai + bi
}

func main() {
	fmt.Println(Add(1, 2))      // 3
	fmt.Println(Add("a", "b")) // nil
}
\`\`\`

**经验法则：** 优先用泛型（Go 1.18+ 的类型参数）代替空接口，能保留类型安全。空接口适合真正"任意类型"的场景（如序列化、JSON）。

#### 用泛型替代空接口

\`\`\`go
package main

import "fmt"

// 泛型版本：类型安全
func Add[T int | float64 | string](a, b T) T {
	return a + b
}

func main() {
	fmt.Println(Add(1, 2))         // 3
	fmt.Println(Add(1.5, 2.5))     // 4
	fmt.Println(Add("a", "b"))     // ab
	// fmt.Println(Add(1, "a"))    // 编译错误：类型不匹配
}
\`\`\`

### 五、类型断言 x.(T)

类型断言从接口值中"取出"具体类型。两种用法：

#### 1. 直接断言（失败会 panic）

\`\`\`go
package main

import "fmt"

func main() {
	var i any = "hello"
	s := i.(string) // 断言 i 是 string
	fmt.Println(s, len(s))

	// n := i.(int) // panic: interface conversion
}
\`\`\`

#### 2. 带检查的断言（comma-ok 模式）

\`\`\`go
package main

import "fmt"

func Describe(i any) {
	if s, ok := i.(string); ok {
		fmt.Printf("字符串：%q\\n", s)
		return
	}
	if n, ok := i.(int); ok {
		fmt.Printf("整数：%d\\n", n)
		return
	}
	fmt.Println("未知类型")
}

func main() {
	Describe("hello") // 字符串："hello"
	Describe(42)      // 整数：42
	Describe(3.14)    // 未知类型
}
\`\`\`

带检查的断言不会 panic，是处理"可能是某种类型"的推荐方式。

#### 类型断言到接口

类型断言不仅能断言到具体类型，也能断言到接口：

\`\`\`go
package main

import "fmt"

type Stringer interface {
	String() string
}

type Person struct{ name string }

func (p Person) String() string { return "Person: " + p.name }

func main() {
	var i any = Person{name: "张三"}

	// 断言到具体类型
	if p, ok := i.(Person); ok {
		fmt.Println(p) // Person: 张三
	}

	// 断言到接口
	if s, ok := i.(Stringer); ok {
		fmt.Println("实现了 Stringer:", s.String())
	}
}
\`\`\`

### 六、类型 switch

当需要分多个类型分支时，类型断言写起来繁琐，类型 switch 是更简洁的工具：

\`\`\`go
package main

import "fmt"

func Describe(i any) {
	switch v := i.(type) {
	case string:
		fmt.Printf("字符串，长度 %d：%q\\n", len(v), v)
	case int:
		fmt.Printf("整数，平方 %d\\n", v*v)
	case bool:
		fmt.Printf("布尔：%v\\n", v)
	case []int:
		fmt.Printf("int 切片，长度 %d\\n", len(v))
	default:
		fmt.Printf("未知类型 %T\\n", v)
	}
}

func main() {
	Describe("hello")     // 字符串，长度 5："hello"
	Describe(42)          // 整数，平方 1764
	Describe(true)        // 布尔：true
	Describe([]int{1, 2}) // int 切片，长度 2
	Describe(3.14)        // 未知类型 float64
}
\`\`\`

关键点：

- \`i.(type)\` 只能在 \`switch\` 中使用。
- 每个 \`case\` 里，\`v\` 已经是对应类型的值，不需要再断言。
- \`default\` 处理其他类型。

#### 类型 switch 与多接口

\`\`\`go
package main

import "fmt"

type Reader interface{ Read() string }
type Writer interface{ Write(string) }

type File struct{}
func (File) Read() string  { return "读取数据" }
func (File) Write(s string) string { return "写入：" + s }

func Process(r Reader) {
	// 同时检查是否实现 Writer
	if w, ok := r.(Writer); ok {
		fmt.Println(w.Write("hello"))
	}
	fmt.Println(r.Read())
}

func main() {
	Process(File{})
}
\`\`\`

### 七、接口组合

Go 接口可以"组合"——一个接口可以嵌入多个接口，方法集是它们的并集：

\`\`\`go
package main

import "fmt"

type Reader interface {
	Read(p []byte) (n int, err error)
}

type Writer interface {
	Write(p []byte) (n int, err error)
}

// 接口组合：ReadWriter 嵌入 Reader 和 Writer
type ReadWriter interface {
	Reader
	Writer
}

// 实现 ReadWriter 的类型
type MyBuffer struct{ data []byte }

func (b *MyBuffer) Read(p []byte) (int, error)  { return copy(p, b.data), nil }
func (b *MyBuffer) Write(p []byte) (int, error) { b.data = append(b.data, p...); return len(p), nil }

func Use(rw ReadWriter) {
	rw.Write([]byte("hello"))
	buf := make([]byte, 5)
	rw.Read(buf)
	fmt.Println(string(buf))
}

func main() {
	var buf MyBuffer
	Use(&buf)
}
\`\`\`

标准库 \`io.ReadWriter\` 就是 \`io.Reader\` + \`io.Writer\` 的组合。Go 标准库鼓励这种"小接口、组合使用"。

### 八、常用标准库接口

#### 1. fmt.Stringer —— 自定义字符串表示

\`\`\`go
package main

import "fmt"

type Person struct{ Name string; Age int }

func (p Person) String() string {
	return fmt.Sprintf("%s (%d 岁)", p.Name, p.Age)
}

func main() {
	p := Person{Name: "张三", Age: 30}
	fmt.Println(p)              // 张三 (30 岁) —— 自动调用 String()
	fmt.Printf("%v\\n", p)    // 张三 (30 岁)
	fmt.Printf("%+v\\n", p)  // {Name:张三 Age:30}（带字段名）
}
\`\`\`

只要实现 \`String() string\`，\`fmt\` 包打印这个类型时就会自动调用它。这是 Go 风格的"\`toString()\`"。

#### 2. io.Reader / io.Writer —— I/O 的统一抽象

\`\`\`go
package main

import (
	"fmt"
	"io"
	"strings"
)

func CopyTo(dst io.Writer, src io.Reader) {
	io.Copy(dst, src)
}

func main() {
	src := strings.NewReader("hello, world")
	var dst strings.Builder
	CopyTo(&dst, src)
	fmt.Println(dst.String()) // hello, world
}
\`\`\`

\`io.Reader\` 和 \`io.Writer\` 是 Go I/O 系统的基石——文件、网络、内存缓冲、加密流都满足这两个接口。任何 \`func(r io.Reader)\` 的函数都可以处理任意可读数据源，这是"小接口、大威力"的典范。

#### 3. error —— 下一章会专门讲

\`\`\`go
type error interface {
	Error() string
}
\`\`\`

#### 4. sort.Interface —— 排序抽象

\`\`\`go
package main

import (
	"fmt"
	"sort"
)

type ByLength []string

func (s ByLength) Len() int           { return len(s) }
func (s ByLength) Less(i, j int) bool { return s[i] < s[j] }
func (s ByLength) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }

func main() {
	fruits := []string{"peach", "banana", "apple"}
	sort.Sort(ByLength(fruits))
	fmt.Println(fruits) // [apple banana peach]
}
\`\`\`

Go 1.21+ 还可以用 \`slices.Sort\` 更简洁：

\`\`\`go
package main

import (
	"fmt"
	"slices"
)

func main() {
	fruits := []string{"peach", "banana", "apple"}
	slices.Sort(fruits)
	fmt.Println(fruits)
}
\`\`\`

#### 5. hash.Hash —— 哈希抽象

\`\`\`go
package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func main() {
	h := sha256.New()
	h.Write([]byte("hello"))
	sum := h.Sum(nil)
	fmt.Println(hex.EncodeToString(sum))
	// 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
}
\`\`\`

#### 6. context.Context 简介

\`\`\`context.Context\` 是 Go 1.7 引入的"上下文"接口，用于在 goroutine 之间传递截止时间、取消信号、请求范围内的值：

\`\`\`go
package main

import (
	"context"
	"fmt"
	"time"
)

func Work(ctx context.Context) {
	select {
	case <-time.After(2 * time.Second):
		fmt.Println("工作完成")
	case <-ctx.Done():
		fmt.Println("被取消：", ctx.Err())
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	Work(ctx) // 1 秒后被取消
}
\`\`\`

#### 7. json.Marshaler / Unmarshaler

\`\`\`go
package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
)

type Money struct {
	amount int
}

func (m Money) MarshalJSON() ([]byte, error) {
	return json.Marshal(fmt.Sprintf("%d cents", m.amount))
}

func (m *Money) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	parts := strings.Split(s, " ")
	if len(parts) != 2 {
		return fmt.Errorf("invalid format")
	}
	n, err := strconv.Atoi(parts[0])
	if err != nil {
		return err
	}
	m.amount = n
	return nil
}

func main() {
	m := Money{amount: 1500}
	data, _ := json.Marshal(m)
	fmt.Println(string(data)) // "1500 cents"

	var m2 Money
	json.Unmarshal(data, &m2)
	fmt.Println(m2.amount) // 1500
}
\`\`\`

### 九、接口设计原则：小接口、组合

Go 标准库的接口大多只有 1~3 个方法。这背后是一种设计哲学——**接口应该足够小、单一职责**：

| 接口 | 方法数 | 用途 |
|------|--------|------|
| \`io.Reader\` | 1 | 可读 |
| \`io.Writer\` | 1 | 可写 |
| \`fmt.Stringer\` | 1 | 字符串表示 |
| \`error\` | 1 | 错误 |
| \`sort.Interface\` | 3 | 可排序 |
| \`io.ReadWriter\` | 2 | 组合接口 |

**小接口的好处：**

1. 容易实现：一个类型满足 1 个方法的接口比满足 10 个方法的接口容易得多。
2. 解耦彻底：调用方只依赖"需要的那一两个方法"。
3. 可组合：多个小接口组合出大接口，灵活。

#### 反例：庞大接口（fat interface）

\`\`\`go
// 反模式：接口太大，实现者负担重
type UserService interface {
	GetUser(id int) User
	CreateUser(name string, age int) User
	UpdateUser(id int, name string, age int) User
	DeleteUser(id int)
	ListUsers() []User
	SearchByName(name string) []User
	SearchByEmail(email string) []User
	Count() int
	// ... 还有几十个方法
}
\`\`\`

如果接口有 30 个方法，**每个实现者都要实现全部**——这违背了"接口隔离原则"（ISP）。修复方法：拆分成多个小接口，让调用方只依赖需要的部分。

#### 接口隔离原则（ISP）

\`\`\`go
package main

import "fmt"

// 不好的设计：一个"大杂烩"接口
type UserStore interface {
	Get(id int) *User
	Save(u *User) error
	Delete(id int) error
	List() []*User
	Search(name string) []*User
}

// 好的设计：按调用方拆分
type UserGetter interface {
	Get(id int) *User
}
type UserSaver interface {
	Save(u *User) error
}
type UserDeleter interface {
	Delete(id int) error
}

// 实现者只实现自己关心的部分
type MemoryStore struct{}
func (MemoryStore) Get(id int) *User { return &User{Name: "张三"} }

type User struct{ Name string }

// 调用方只依赖需要的接口
func ShowUser(g UserGetter, id int) {
	u := g.Get(id)
	fmt.Println(u.Name)
}

func main() {
	s := MemoryStore{}
	ShowUser(s, 1) // 张三
}
\`\`\`

### 十、面向接口编程

#### Accept interfaces, return structs

Go 社区的金科玉律：**函数参数用接口类型，返回值用具体类型**。

\`\`\`go
package main

import "fmt"

// 接口：参数
type Reader interface {
	Read() string
}

// 具体类型：返回值
type FileReader struct{ path string }

func NewFileReader(path string) *FileReader {
	return &FileReader{path: path}
}

func (r *FileReader) Read() string {
	return fmt.Sprintf("读取文件 %s", r.path)
}

// 函数：接受接口，返回具体类型
func Open(path string) *FileReader {
	return NewFileReader(path)
}

func Process(r Reader) {
	fmt.Println(r.Read())
}

func main() {
	r := Open("config.yaml")
	Process(r) // 读取文件 config.yaml
}
\`\`\`

为什么返回具体类型而不是接口？因为接口会"丢失"具体类型的方法——返回具体类型让调用方有完整的 API 可用，调用方需要抽象时再转成接口。

### 十一、接口的零值

接口的零值是 \`nil\`——即类型和值都为 nil：

\`\`\`go
package main

import "fmt"

func main() {
	var i interface{} = nil
	fmt.Println(i == nil) // true
}
\`\`\`

调用一个 nil 接口的方法会 panic：

\`\`\`go
package main

type Speaker interface {
	Speak()
}

func main() {
	var s Speaker
	// s.Speak() // panic: runtime error: invalid memory address
}
\`\`\`

但调用 nil 指针的方法（如果方法体检查了 nil）是安全的——前面讲过。

### 十二、interface 与 nil 的陷阱

接口值有两部分：**类型信息 + 值指针**。只有当类型和值都是 nil 时，接口才等于 nil。

\`\`\`go
package main

import "fmt"

func main() {
	var p *int = nil
	var i any = p // 接口值：类型=*int，值=nil

	fmt.Println(i == nil) // false！接口不等于 nil
}
\`\`\`

这个陷阱在实际代码里非常常见——比如函数返回 \`error\` 时，如果显式赋了 nil 指针，调用方 \`if err != nil\` 会以为有错。

\`\`\`go
package main

import "fmt"

type MyError struct{ msg string }
func (e *MyError) Error() string { return e.msg }

// 错误的写法：返回 nil 指针赋给 error 接口
func BadFunc() error {
	var err *MyError = nil
	return err // err 是 nil，但 return 后被装进 error 接口
}

func main() {
	err := BadFunc()
	if err != nil {
		fmt.Println("意外：err != nil") // 会走到这里
	} else {
		fmt.Println("正常：err == nil")
	}
}
\`\`\`

#### 修复方法：显式返回 nil

\`\`\`go
package main

import "fmt"

type MyError struct{ msg string }
func (e *MyError) Error() string { return e.msg }

func GoodFunc() error {
	var err *MyError = nil
	if err == nil {
		return nil // 显式返回 nil，避免 nil 接口陷阱
	}
	return err
}

func main() {
	err := GoodFunc()
	if err != nil {
		fmt.Println("意外：err != nil")
	} else {
		fmt.Println("正常：err == nil")
	}
}
\`\`\`

#### 反射检查接口

如果不确定，可以用反射判断：

\`\`\`go
package main

import (
	"fmt"
	"reflect"
)

func IsNil(i any) bool {
	if i == nil {
		return true
	}
	v := reflect.ValueOf(i)
	return v.Kind() == reflect.Ptr && v.IsNil()
}

func main() {
	var p *int
	fmt.Println(IsNil(p))      // true
	fmt.Println(IsNil(nil))    // true
	fmt.Println(IsNil(42))     // false
}
\`\`\`

### 十三、综合示例：策略模式

接口是 Go 实现"策略模式"的工具——把算法抽象成接口，运行时可替换：

\`\`\`go
package main

import "fmt"

// 策略接口
type Formatter interface {
	Format(name string, age int) string
}

// 具体策略 A
type PlainFormatter struct{}

func (PlainFormatter) Format(name string, age int) string {
	return fmt.Sprintf("%s, %d", name, age)
}

// 具体策略 B
type JSONFormatter struct{}

func (JSONFormatter) Format(name string, age int) string {
	return fmt.Sprintf(\`{"name":"%s","age":%d}\`, name, age)
}

// 具体策略 C
type HtmlFormatter struct{}

func (HtmlFormatter) Format(name string, age int) string {
	return fmt.Sprintf("<span class='name'>%s</span><span class='age'>%d</span>", name, age)
}

// 调用方：只依赖接口，运行时注入策略
type Person struct {
	Name string
	Age  int
}

func (p Person) Render(f Formatter) string {
	return f.Format(p.Name, p.Age)
}

func main() {
	p := Person{Name: "张三", Age: 30}
	formatters := []Formatter{PlainFormatter{}, JSONFormatter{}, HtmlFormatter{}}
	for _, f := range formatters {
		fmt.Println(p.Render(f))
	}
}
\`\`\`

### 十四、综合示例：依赖注入

\`\`\`go
package main

import "fmt"

// 接口定义
type Notifier interface {
	Send(to, message string) error
}

// 实现 A：邮件通知
type EmailNotifier struct{ from string }

func (e EmailNotifier) Send(to, msg string) error {
	fmt.Printf("[Email] %s -> %s: %s\\n", e.from, to, msg)
	return nil
}

// 实现 B：短信通知
type SMSNotifier struct{ phone string }

func (s SMSNotifier) Send(to, msg string) error {
	fmt.Printf("[SMS] %s -> %s: %s\\n", s.phone, to, msg)
	return nil
}

// 业务逻辑：依赖接口
type UserService struct {
	notifier Notifier
}

func (s *UserService) Welcome(userID, msg string) {
	s.notifier.Send(userID, msg)
}

func main() {
	emailSvc := &UserService{notifier: EmailNotifier{from: "noreply@example.com"}}
	emailSvc.Welcome("zs@example.com", "欢迎注册")

	smsSvc := &UserService{notifier: SMSNotifier{phone: "10086"}}
	smsSvc.Welcome("13800000000", "欢迎注册")
}
\`\`\`

### 十五、综合示例：插件架构

接口让 Go 实现"插件"架构——主程序定义接口，插件实现接口：

\`\`\`go
package main

import "fmt"

// 主程序定义的插件接口
type Plugin interface {
	Name() string
	Run(input string) string
}

// 插件管理器
type PluginManager struct {
	plugins map[string]Plugin
}

func NewPluginManager() *PluginManager {
	return &PluginManager{plugins: make(map[string]Plugin)}
}

func (m *PluginManager) Register(p Plugin) {
	m.plugins[p.Name()] = p
}

func (m *PluginManager) Execute(name, input string) (string, error) {
	p, ok := m.plugins[name]
	if !ok {
		return "", fmt.Errorf("plugin %q not found", name)
	}
	return p.Run(input), nil
}

// 具体插件
type UpperCasePlugin struct{}

func (UpperCasePlugin) Name() string                  { return "upper" }
func (UpperCasePlugin) Run(input string) string       { return fmt.Sprintf("%s", input) }

// 在 Go 中，可以通过 plugin 包动态加载 .so 文件
// 这里演示静态注册

func main() {
	mgr := NewPluginManager()
	mgr.Register(UpperCasePlugin{})

	out, err := mgr.Execute("upper", "hello")
	if err != nil {
		fmt.Println("错误：", err)
		return
	}
	fmt.Println(out) // HELLO
}
\`\`\`

### 十六、接口与泛型（Go 1.18+ 类型参数）

Go 1.18 引入泛型后，接口和类型参数（type parameters）开始协同工作。它们解决的是**不同维度**的问题：

- **接口**：运行时多态，调用方传一个实现了接口的值。
- **泛型**：编译期多态，调用方传一个类型参数，编译器为每个类型生成特化代码。

两者不是"二选一"——很多场景下配合使用更优雅。

#### 1. 用接口约束类型参数

类型参数需要"类型约束"（type constraint），约束本身也是一个接口（通常是 \`interface{}\` 的超集）：

\`\`\`go
package main

import "fmt"

// Number 约束：只允许 int 或 float64
type Number interface {
	~int | ~float64
}

func Sum[T Number](nums []T) T {
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

func main() {
	fmt.Println(Sum([]int{1, 2, 3}))         // 6
	fmt.Println(Sum([]float64{1.5, 2.5}))   // 4
}
\`\`\`

\`~int\` 表示"底层类型是 int 的所有类型"（包括自定义的 \`type MyInt int\`）。没有 \`~\`，\`MyInt\` 不会被接受。

#### 2. 接口里的类型集（type set）

Go 1.18 后，接口里可以写"类型联合"和"类型元素"，这让接口从"方法集合"扩展为"类型集合"：

\`\`\`go
package main

import "fmt"

// Stringer 要么有 String()，要么是底层类型 string
type Stringer interface {
	~string | String()
}

func Print[T Stringer](v T) {
	fmt.Println(v)
}

type MyString string

func main() {
	Print(MyString("hello"))   // 走 ~string 分支
	Print("world")            // 走 ~string 分支
}
\`\`\`

这是 Go 接口语义的最大变化——以前接口只关心方法，现在还能表达"必须是某些类型"。但注意：**带类型元素的接口只能用作类型约束，不能用作普通接口变量**（不能 \`var s Stringer = ...\`）。

#### 3. 接口方法 + 类型约束混合

\`\`\`go
package main

import "fmt"

type Comparable[T any] interface {
	CompareTo(T) int
}

func Max[T any, C Comparable[T]](items []T, _ C) T {
	if len(items) == 0 {
		var zero T
		return zero
	}
	max := items[0]
	for _, item := range items[1:] {
		// 这里需要类型断言或者另一种设计
	}
	return max
}

type Int int

func (a Int) CompareTo(b Int) int {
	if a < b {
		return -1
	} else if a > b {
		return 1
	}
	return 0
}

func main() {
	// 简化版：直接用 < 运算符
	fmt.Println(maxInt([]int{3, 1, 4, 1, 5, 9, 2, 6}))
}

func maxInt(nums []int) int {
	m := nums[0]
	for _, n := range nums[1:] {
		if n > m {
			m = n
		}
	}
	return m
}
\`\`\`

**经验法则**：能用 \`constraints.Ordered\` 这种"内置约束"解决的，就别自己造带方法的复杂约束。简单胜过聪明。

### 十七、接口的版本演进与兼容

接口一旦发布，再"加方法"就构成破坏性变更——所有实现方都要补上新方法。下面是工程上常见的演进策略。

#### 1. 用接口组合做"扩展"

旧接口 \`Reader\` 不能动，但想要 \`Close()\` 怎么办？定义新接口 \`Closer\`，再组合成 \`ReadCloser\`：

\`\`\`go
package main

import "fmt"

type Reader interface {
	Read(p []byte) (int, error)
}

type Closer interface {
	Close() error
}

type ReadCloser interface {
	Reader
	Closer
}

type FileReader struct{ name string }

func (f *FileReader) Read(p []byte) (int, error) {
	return 0, nil
}

func (f *FileReader) Close() error {
	fmt.Println("close", f.name)
	return nil
}

func Use(rc ReadCloser) {
	rc.Read(nil)
	rc.Close()
}

func main() {
	Use(&FileReader{name: "a.txt"})
}
\`\`\`

这就是 \`io.ReadCloser\` 的设计——通过组合而不是修改原接口来扩展能力。

#### 2. 用默认实现（adapter）补方法

新接口加了方法，旧实现方来不及补全？写个"包装器"补默认行为：

\`\`\`go
package main

import "fmt"

type Logger interface {
	Log(msg string)
	Level() string
}

// 只实现了 Log 的旧类型
type OldLogger struct{}

func (OldLogger) Log(msg string) { fmt.Println(msg) }

// 适配器：补全 Level 方法
type LoggerAdapter struct {
	Logger
}

func (LoggerAdapter) Level() string { return "INFO" }

func main() {
	var l Logger = LoggerAdapter{OldLogger{}}
	l.Log("hello")
	fmt.Println(l.Level()) // INFO
}
\`\`\`

#### 3. 用版本号接口做破坏性升级

如果方法签名都变了，只能开新接口：

\`\`\`go
// 旧版本（保留兼容）
type CacheV1 interface {
	Get(key string) (string, bool)
}

// 新版本（推荐使用）
type CacheV2 interface {
	Get(key string) (any, bool)
	GetWithTTL(key string) (any, time.Duration, bool)
}
\`\`\`

代码里同时支持两个版本，逐步迁移，最终废弃旧版本。Go 标准库的 \`hash.Hash32\` / \`hash.Hash64\` 就是这种思路。

### 十八、接口的测试技巧

接口让单元测试变得极其优雅——因为你可以注入"假实现"（fake/mock）。

#### 1. 接口 + mock：替换依赖

\`\`\`go
package main

import "fmt"

// 被测代码依赖接口
type UserStore interface {
	Find(id int) (string, error)
}

type UserService struct {
	store UserStore
}

func (s *UserService) Greet(id int) string {
	name, err := s.store.Find(id)
	if err != nil {
		return "你好，陌生人"
	}
	return "你好，" + name
}

// 测试时用假实现替换数据库
type FakeStore struct{}

func (FakeStore) Find(id int) (string, error) {
	if id == 1 {
		return "张三", nil
	}
	return "", fmt.Errorf("not found")
}

func main() {
	// 测试 UserService，不需要真实数据库
	svc := &UserService{store: FakeStore{}}
	fmt.Println(svc.Greet(1)) // 你好，张三
	fmt.Println(svc.Greet(2)) // 你好，陌生人
}
\`\`\`

这就是"依赖注入"——把 \`UserStore\` 作为接口注入到 \`UserService\`，测试时换成假实现。这是接口最大的工程价值之一。

#### 2. 表驱动测试 + 接口

\`\`\`go
package main

import "fmt"

type Sorter interface {
	Sort([]int) []int
}

type BubbleSort struct{}

func (BubbleSort) Sort(nums []int) []int {
	out := append([]int(nil), nums...)
	for i := 0; i < len(out); i++ {
		for j := i + 1; j < len(out); j++ {
			if out[j] < out[i] {
				out[i], out[j] = out[j], out[i]
			}
		}
	}
	return out
}

func main() {
	cases := []struct {
		name string
		in   []int
		want []int
	}{
		{"空", []int{}, []int{}},
		{"单个", []int{1}, []int{1}},
		{"乱序", []int{3, 1, 2}, []int{1, 2, 3}},
		{"重复", []int{2, 2, 1}, []int{1, 2, 2}},
	}

	var s Sorter = BubbleSort{}
	for _, c := range cases {
		got := s.Sort(c.in)
		equal := len(got) == len(c.want)
		if equal {
			for i := range got {
				if got[i] != c.want[i] {
					equal = false
					break
				}
			}
		}
		status := "PASS"
		if !equal {
			status = "FAIL"
		}
		fmt.Printf("[%s] %s: %v -> %v\\n", status, c.name, c.in, got)
	}
}
\`\`\`

接口让"换实现测试"和"表驱动测试"完美结合——一个测试函数跑遍所有实现。

### 十九、接口的性能考量

接口不是免费的，每次调用都有微小的额外开销。在性能敏感场景下要心里有数。

#### 1. 接口的内存布局

Go 接口变量在内存中是两个指针（16 字节，64 位机器上）：

- **类型指针**：指向具体类型信息（itab）
- **数据指针**：指向实际值（小值会装箱到堆上）

\`\`\`go
package main

import (
	"fmt"
	"unsafe"
)

func main() {
	var i interface{} = 42
	fmt.Println(unsafe.Sizeof(i)) // 16

	type big struct {
		data [128]byte
	}
	var b interface{} = big{}
	fmt.Println(unsafe.Sizeof(b)) // 还是 16
}
\`\`\`

#### 2. 装箱开销

把 \`int\` 赋值给 \`interface{}\` 会发生"装箱"——把值复制到堆上，再让接口的数据指针指向它。频繁装箱会影响性能：

\`\`\`go
package main

import "fmt"

func sumInterface(nums []interface{}) int {
	total := 0
	for _, n := range nums {
		total += n.(int) // 类型断言 + 装箱开销
	}
	return total
}

func sumTyped(nums []int) int {
	total := 0
	for _, n := range nums {
		total += n // 直接加，无开销
	}
	return total
}

func main() {
	nums := make([]int, 5)
	for i := range nums {
		nums[i] = i + 1
	}
	fmt.Println(sumTyped(nums)) // 15

	boxed := make([]interface{}, len(nums))
	for i, n := range nums {
		boxed[i] = n
	}
	fmt.Println(sumInterface(boxed)) // 15
}
\`\`\`

**性能差距**：装箱版本通常比类型化版本慢 3-10 倍。日常代码无所谓，但热路径里要避免。

#### 3. 泛型替代接口

对于"算法相同、类型不同"的场景，Go 1.18+ 用泛型比接口更快，因为编译器会为每个类型生成特化代码：

\`\`\`go
package main

import "fmt"

// 泛型版
func SumT[T int | float64](nums []T) T {
	var total T
	for _, n := range nums {
		total += n
	}
	return total
}

// 接口版
func SumI(nums []interface{}) interface{} {
	var total int
	for _, n := range nums {
		total += n.(int)
	}
	return total
}

func main() {
	fmt.Println(SumT([]int{1, 2, 3})) // 6
	fmt.Println(SumI([]interface{}{1, 2, 3})) // 6
}
\`\`\`

泛型版本避免了装箱和类型断言，热路径里性能显著更好。

### 二十、接口与并发

Go 的并发原语（goroutine、channel、select）经常和接口搭配使用。下面是几个典型场景。

#### 1. 接口作为 channel 的元素类型

\`\`\`go
package main

import (
	"fmt"
	"time"
)

type Job interface {
	Do()
}

type PrintJob struct{ msg string }

func (p PrintJob) Do() { fmt.Println("处理:", p.msg) }

func worker(jobs <-chan Job) {
	for j := range jobs {
		j.Do()
	}
}

func main() {
	jobs := make(chan Job, 3)
	go worker(jobs)

	jobs <- PrintJob{msg: "A"}
	jobs <- PrintJob{msg: "B"}
	jobs <- PrintJob{msg: "C"}
	close(jobs)

	time.Sleep(100 * time.Millisecond)
}
\`\`\`

接口作为 channel 元素类型让 worker 能处理任意类型的 Job——这是 worker pool 模式的基础。

#### 2. \`context.Context\` 贯穿并发函数

几乎所有并发函数都接受 \`ctx context.Context\` 作为第一个参数，让它能响应取消和超时：

\`\`\`go
package main

import (
	"context"
	"fmt"
	"time"
)

type Fetcher interface {
	Fetch(ctx context.Context, url string) (string, error)
}

type HTTPFetcher struct{}

func (HTTPFetcher) Fetch(ctx context.Context, url string) (string, error) {
	select {
	case <-time.After(50 * time.Millisecond):
		return "数据: " + url, nil
	case <-ctx.Done():
		return "", ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Millisecond)
	defer cancel()

	var f Fetcher = HTTPFetcher{}
	out, err := f.Fetch(ctx, "https://example.com")
	fmt.Println(out, err) //  context deadline exceeded
}
\`\`\`

\`ctx.Done()\` 返回的 channel 是"取消信号"，配合 \`select\` 让函数能优雅退出。这是 Go 工程化的"标准件"。

### 二十一、接口的反模式与陷阱

最后用一节梳理工程中常见的接口误用，帮你少踩坑。

#### 1. 过早抽象：接口太多

新手容易把所有依赖都抽成接口，导致代码里到处是 \`UserService\`、\`UserRepository\`、\`UserCreator\`——结果是看一个调用要跳四五层文件。

**原则**：除非有"需要替换实现"或"需要解耦测试"的真实需求，否则先用具体类型，等真有需求时再抽接口。Go 标准库的 \`os.File\` 就是个具体类型，没抽接口，照样好用。

#### 2. 接口太大：上帝接口

\`\`\`go
// 反模式
type UserService interface {
	Create()
	Update()
	Delete()
	Find()
	List()
	Search()
	BatchCreate()
	Export()
	Import()
	SendEmail()
	// ...50 个方法
}
\`\`\`

这种接口实现起来要写一大堆方法，违反"单一职责"。拆成 \`UserCreator\`、\`UserReader\`、\`UserDeleter\` 等小接口，再按需组合。

#### 3. 返回接口而非具体类型

\`\`\`go
// 反模式：返回接口
func NewLogger() Logger {
	return &fileLogger{}
}

// 推荐：返回具体类型
func NewLogger() *FileLogger {
	return &FileLogger{}
}
\`\`\`

返回具体类型让调用方拿到更丰富的方法集；返回接口会"剪掉"具体类型上的额外方法。"Accept interfaces, return structs"——这条 Go 谚语背后就是这个理。

#### 4. 用空接口 \`any\` 逃避类型系统

\`\`\`go
// 反模式：到处 any
func process(data any) any {
	switch v := data.(type) {
	case int:
		return v * 2
	case string:
		return v + v
	}
	return nil
}
\`\`\`

\`any\` 抹掉了编译期类型检查，错误要等到运行时才暴露。能用具体类型或泛型就用具体的，\`any\` 只用于"真的不关心类型"的场景（如序列化、反射）。

#### 5. 误以为 \`nil\` 接口等于 \`nil\`

\`\`\`go
package main

import "fmt"

type Doer interface {
	Do()
}

type Nothing struct{}

func (n *Nothing) Do() {}

func getDoer() Doer {
	var n *Nothing = nil
	return n // 注意：返回了 *Nothing(nil)
}

func main() {
	d := getDoer()
	fmt.Println(d == nil) // false！
	if d != nil {
		d.Do() // 这里有 nil 指针 panic 风险
	}
}
\`\`\`

\`d\` 的内部是 \`(*Nothing, nil)\`——类型不为 nil，所以 \`d != nil\`。但调用 \`Do()\` 会因为接收者是 nil 而出错（如果 \`Do()\` 访问字段的话）。**返回接口时显式 \`return nil\`**，不要返回"具体类型 nil"。

### 二十二、本章小结

- Go 接口是**隐式实现**的——类型只需拥有接口的所有方法即可，不需要 \`implements\` 关键字。
- **空接口** \`interface{}\`（Go 1.18+ 别名 \`any\`）匹配所有类型，但使用前需要类型断言。
- **类型断言** \`x.(T)\` 和**类型 switch** \`switch v := x.(type)\` 是从接口取具体值的方式。
- **接口组合**让小接口拼装成大接口，是 Go 设计的标准做法。
- **常用标准库接口**：\`fmt.Stringer\`、\`io.Reader/Writer\`、\`error\`、\`sort.Interface\`、\`hash.Hash\`、\`context.Context\`、\`json.Marshaler\`——掌握这些就能读懂大半个标准库。
- **接口设计原则**：接口要小、单一职责；"Accept interfaces, return structs"。
- **nil 接口陷阱**：接口有两部分（类型 + 值），两者都为 nil 才等于 nil；返回错误时显式 \`return nil\`。
- **接口与泛型**：接口是运行时多态，泛型是编译期多态；用接口约束类型参数让两者协同。
- **接口演进**：用接口组合做扩展，用 adapter 补方法，用版本号接口做破坏性升级。
- **接口测试**：依赖注入 + mock 让单元测试脱离外部依赖；接口让表驱动测试可以同时跑多个实现。
- **接口性能**：接口调用有装箱和间接寻址开销，热路径用泛型或具体类型更高效。
- **接口并发**：接口作为 channel 元素是 worker pool 基础；\`context.Context\` 是并发函数的标准参数。
- **反模式**：过早抽象、上帝接口、返回接口、滥用 \`any\`、忽视 nil 接口陷阱——五个常见坑要牢记。`,
  },

  // ============================================================
  // 第十一章：类型声明与组合
  // ============================================================
  {
    id: 'go-ch11',
    group: '第三部分 类型系统',
    icon: '🧱',
    title: '类型声明与组合',
    content: `## 第十一章　类型声明与组合

### 一、type 关键字：给类型起新名字

Go 的 \`type\` 关键字能做两件事：定义新类型、定义别名。它让代码更可读、更安全。

#### type 定义新类型

\`\`\`go
package main

import "fmt"

// 定义一个新类型，底层是 int
type Celsius int
type Fahrenheit int

func (c Celsius) String() string  { return fmt.Sprintf("%d°C", int(c)) }
func (f Fahrenheit) String() string { return fmt.Sprintf("%d°F", int(f)) }

func CToF(c Celsius) Fahrenheit {
	return Fahrenheit(c*9/5 + 32)
}

func main() {
	var c Celsius = 100
	f := CToF(c)
	fmt.Println(c) // 100°C
	fmt.Println(f) // 212°F

	// var x Celsius = f // 编译错误：类型不匹配
	// 即使底层都是 int，Celsius 和 Fahrenheit 也不能直接赋值
}
\`\`\`

\`type Celsius int\` 创建了一个**全新类型**，虽然底层是 \`int\`，但与 \`int\` 不能直接互操作。这避免了"温度"和"湿度"都是 int 却被误用的 bug——类型系统在编译期帮你挡住错误。

#### 别名 type T = U

\`\`\`go
package main

import "fmt"

// 别名：MyInt 完全等同于 int
type MyInt = int

func main() {
	var x MyInt = 10
	var y int = 20
	x = y // OK：完全相同的类型
	fmt.Println(x + y)
}
\`\`\`

别名 \`type T = U\` 不创建新类型，只是给 \`U\` 起了个**新名字**。两者可以互相赋值、互相运算。Go 标准库用别名做"平滑升级"——比如 \`byte\` 是 \`uint8\` 的别名，\`rune\` 是 \`int32\` 的别名。

#### type 定义 vs 别名：什么时候用哪个

| 维度 | \`type T U\`（新类型） | \`type T = U\`（别名） |
|------|---------------------|---------------------|
| 是否新类型 | 是 | 否，完全等同 |
| 能否互转 | 不能直接赋值，需显式转换 | 直接赋值 |
| 方法集 | 独立 | 共享 U 的方法 |
| 用途 | 表达领域概念（温度、货币） | 重命名、平滑升级 |

#### 别名的常见用途

\`\`\`go
package main

import "fmt"

// 标准库中的别名
type byte = uint8
type rune = int32

// 自定义别名：旧 API 到新 API 的平滑过渡
type OldAPI = NewAPI

type NewAPI struct{ version int }
func (n NewAPI) Call() string { return "v2 response" }

func main() {
	var a OldAPI = NewAPI{version: 2}
	fmt.Println(a.Call())
}
\`\`\

### 二、给函数类型起新名

\`\`\`go
package main

import "fmt"

// 类型化函数
type Handler func(req string) (resp string, err error)
type Filter func(int) bool
type Comparator func(a, b int) int

func Apply(items []int, f Filter) []int {
	var result []int
	for _, v := range items {
		if f(v) {
			result = append(result, v)
		}
	}
	return result
}

func main() {
	isEven := func(n int) bool { return n%2 == 0 }

	nums := []int{1, 2, 3, 4, 5, 6}
	evens := Apply(nums, isEven)
	fmt.Println(evens) // [2 4 6]
}
\`\`\`

### 三、iota 枚举模式

Go 没有 \`enum\` 关键字，但用 \`const\` + \`iota\` 实现枚举：

#### 基本用法

\`\`\`go
package main

import "fmt"

type Weekday int

const (
	Sunday Weekday = iota // iota 从 0 开始
	Monday               // 1
	Tuesday              // 2
	Wednesday            // 3
	Thursday             // 4
	Friday               // 5
	Saturday             // 6
)

func (d Weekday) String() string {
	names := [...]string{"周日", "周一", "周二", "周三", "周四", "周五", "周六"}
	if d < Sunday || d > Saturday {
		return "未知"
	}
	return names[d]
}

func main() {
	fmt.Println(Monday)    // 周一
	fmt.Println(Saturday)  // 周六
	fmt.Println(Wednesday) // 周三
}
\`\`\`

\`iota\` 在每个 \`const\` 块中从 0 开始，每出现一次自动加 1。

#### iota 跳过值

\`\`\`go
package main

import "fmt"

type FileState int

const (
	Created FileState = iota
	Modified
	// _ = iota // 跳过一个值
	Deleted
	Archived
)

func main() {
	fmt.Println(Created, Modified, Deleted, Archived)
	// 0 1 3 4
}
\`\`\`

#### 位运算枚举（权限标志）

\`\`\`go
package main

import "fmt"

type Permission uint8

const (
	Read Permission = 1 << iota // 1 (0001)
	Write                       // 2 (0010)
	Execute                     // 4 (0100)
)

func main() {
	p := Read | Write // 3 (0011)
	fmt.Printf("权限：%b\\n", p) // 11

	if p&Read != 0 {
		fmt.Println("有读权限")
	}
	if p&Execute != 0 {
		fmt.Println("有执行权限")
	} else {
		fmt.Println("无执行权限")
	}
}
\`\`\`

#### 复杂枚举：KB、MB、GB

\`\`\`go
package main

import "fmt"

type ByteSize float64

const (
	_           = iota // 忽略第一个（iota=0）
	KB ByteSize = 1 << (10 * iota) // 1 << 10 = 1024
	MB                              // 1 << 20
	GB                              // 1 << 30
	TB                              // 1 << 40
	PB                              // 1 << 50
)

func (b ByteSize) String() string {
	switch {
	case b >= PB:
		return fmt.Sprintf("%.2f PB", b/PB)
	case b >= TB:
		return fmt.Sprintf("%.2f TB", b/TB)
	case b >= GB:
		return fmt.Sprintf("%.2f GB", b/GB)
	case b >= MB:
		return fmt.Sprintf("%.2f MB", b/MB)
	case b >= KB:
		return fmt.Sprintf("%.2f KB", b/KB)
	default:
		return fmt.Sprintf("%d B", int64(b))
	}
}

func main() {
	fmt.Println(ByteSize(2048))         // 2.00 KB
	fmt.Println(ByteSize(1024 * 1024))  // 1.00 MB
	fmt.Println(ByteSize(5 * 1024 * 1024 * 1024)) // 5.00 GB
}
\`\`\`

### 四、嵌入（embedding）：Go 的"组合代替继承"

Go 没有 \`extends\`、没有类继承，但通过**嵌入字段**实现代码复用——把一个类型作为匿名字段嵌入另一个类型，外层自动获得内层的方法。

#### 嵌入结构体

\`\`\`go
package main

import "fmt"

type Animal struct {
	name string
}

func (a Animal) Breathe() {
	fmt.Printf("%s 在呼吸\\n", a.name)
}

func (a Animal) Move() {
	fmt.Printf("%s 在移动\\n", a.name)
}

type Dog struct {
	Animal // 匿名嵌入：Dog 自动获得 Breathe 和 Move
	breed  string
}

func (d Dog) Bark() {
	fmt.Printf("%s（%s）在叫\\n", d.name, d.breed)
}

func main() {
	d := Dog{Animal: Animal{name: "旺财"}, breed: "柴犬"}
	d.Breathe() // 提升的方法
	d.Move()
	d.Bark()
}
\`\`\`

注意 \`d.name\` 直接访问了 \`Animal\` 的字段——字段也被提升了。

#### 嵌入指针

可以嵌入指针，适合"可选"或"共享"的场景：

\`\`\`go
package main

import "fmt"

type Engine struct{ power int }

func (e *Engine) Start() {
	if e == nil {
		fmt.Println("无引擎")
		return
	}
	fmt.Printf("引擎启动，功率 %d\\n", e.power)
}

type Car struct {
	*Engine // 嵌入指针
	model   string
}

func main() {
	c1 := &Car{Engine: &Engine{power: 200}, model: "Tesla"}
	c1.Start() // 引擎启动，功率 200

	c2 := &Car{model: "Bicycle"} // 没有引擎
	c2.Start()                   // 无引擎
}
\`\`\`

### 五、组合代替继承：Go 的设计哲学

Go 没有"Is-a"继承，而是提倡"Has-a"组合。原因：

1. **继承的耦合太强**：父类改了，所有子类都受影响，编译期就固定了。
2. **继承层次太深**：5 层继承后没人能看懂。
3. **多继承的菱形问题**：C++ 用虚继承解决，Java 干脆只允许单继承。Go 直接砍掉继承。

#### 经典示例：用组合实现"鸟"与"飞行能力"

\`\`\`go
package main

import "fmt"

// 能力接口
type Flyer interface {
	Fly()
}
type Swimmer interface {
	Swim()
}

// 能力的实现
type Wings struct{}
func (Wings) Fly() { fmt.Println("用翅膀飞") }

type Fins struct{}
func (Fins) Swim() { fmt.Println("用鳍游") }

// 主体类型：通过嵌入组合能力
type Duck struct {
	Wings
	Fins
	name string
}

func (d Duck) Quack() { fmt.Printf("%s：嘎嘎\\n", d.name) }

func main() {
	d := Duck{name: "唐老鸭"}
	d.Fly()    // Wings.Fly()
	d.Swim()   // Fins.Swim()
	d.Quack()
}
\`\`\`

如果用继承，"既能飞又能游"会很难表达（多继承、菱形问题）。用组合，鸭子同时嵌入 \`Wings\` 和 \`Fins\`，干净利落。

### 六、嵌套结构体

结构体可以嵌套任意层，组织复杂数据：

\`\`\`go
package main

import "fmt"

type Address struct {
	City    string
	ZipCode string
}

type Contact struct {
	Email string
	Phone string
}

type Person struct {
	Name    string
	Age     int
	Address Address // 具名字段（不提升）
	Contact Contact
}

type Employee struct {
	Person      // 匿名嵌入（提升）
	EmployeeID  string
	Salary      float64
}

func main() {
	e := Employee{
		Person: Person{
			Name: "张三",
			Age:  30,
			Address: Address{City: "北京", ZipCode: "100000"},
			Contact: Contact{Email: "zs@example.com", Phone: "13800000000"},
		},
		EmployeeID: "EMP001",
		Salary:     20000,
	}

	// 嵌套访问
	fmt.Println(e.Name)                  // 提升：Person.Name
	fmt.Println(e.Address.City)          // 张三 Person.Address.City
	fmt.Println(e.Contact.Email)         // zs@example.com
	fmt.Println(e.EmployeeID, e.Salary)
}
\`\`\`

### 七、嵌入接口

接口也可以作为匿名字段嵌入结构体——这让结构体"持有"接口实现，可以动态替换：

\`\`\`go
package main

import "fmt"

type Notifier interface {
	Notify(message string)
}

type EmailNotifier struct{}
func (EmailNotifier) Notify(msg string) { fmt.Println("邮件:", msg) }

type SMSNotifier struct{}
func (SMSNotifier) Notify(msg string) { fmt.Println("短信:", msg) }

// UserService 嵌入 Notifier 接口
type UserService struct {
	Notifier // 嵌入接口
}

func (s *UserService) SetNotifier(n Notifier) {
	s.Notifier = n
}

func main() {
	s := &UserService{Notifier: EmailNotifier{}}
	s.Notify("Hello") // 邮件: Hello

	s.SetNotifier(SMSNotifier{})
	s.Notify("Hello") // 短信: Hello
}
\`\`\`

嵌入接口是 Go 实现"依赖注入"的常见手段——结构体持有接口字段，运行时设置具体实现。

#### 嵌入接口的命名冲突

\`\`\`go
package main

import "fmt"

type A interface {
	Method() string
}

type B interface {
	Method() string
}

type C struct {
	A
	B
}

// 如果 A 和 B 都有 Method()，C.Method() 会产生歧义
// 必须显式指定：c.A.Method() 或 c.B.Method()

type ImplA struct{}
func (ImplA) Method() string { return "A" }

type ImplB struct{}
func (ImplB) Method() string { return "B" }

func main() {
	c := C{A: ImplA{}, B: ImplB{}}
	fmt.Println(c.A.Method()) // A
	fmt.Println(c.B.Method()) // B
	// fmt.Println(c.Method()) // 编译错误：ambiguous
}
\`\`\`

### 八、包装器模式（Decorator）

嵌入字段的方法可以被外层"覆盖"，外层方法可以调用内层方法——这是包装器/装饰器模式的基础：

\`\`\`go
package main

import "fmt"

type Logger interface {
	Log(message string)
}

type ConsoleLogger struct{}
func (ConsoleLogger) Log(msg string) {
	fmt.Println("[Console]", msg)
}

// 包装器：在原 Logger 基础上添加前缀
type PrefixLogger struct {
	Logger // 嵌入接口，外层持有内层
	prefix string
}

func (p PrefixLogger) Log(msg string) {
	// 调用内层 + 添加行为
	p.Logger.Log(p.prefix + ": " + msg)
}

// 包装器：日志加上时间戳
type TimestampLogger struct {
	Logger
}

func (t TimestampLogger) Log(msg string) {
	t.Logger.Log("[2024-01-01] " + msg)
}

func main() {
	var l Logger = ConsoleLogger{}
	l = PrefixLogger{Logger: l, prefix: "APP"}
	l = TimestampLogger{Logger: l}

	l.Log("启动完成")
	// [Console] [2024-01-01] APP: 启动完成
}
\`\`\`

每一层包装器都"包"住内层 logger，调用时层层委托，最终输出经过所有包装器的处理。这是 \`net/http\` 中间件、日志库等的核心模式。

### 九、HTTP 中间件：包装器模式的实战

\`\`\`go
package main

import (
	"fmt"
	"net/http"
)

// 中间件类型
type Middleware func(http.Handler) http.Handler

// 日志中间件
func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("[LOG] %s %s\\n", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

// 认证中间件
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") == "" {
			http.Error(w, "未授权", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// 应用多个中间件
func ApplyMiddlewares(handler http.Handler, middlewares ...Middleware) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		handler = middlewares[i](handler)
	}
	return handler
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, World!")
	})

	// 应用中间件
	handler := ApplyMiddlewares(mux, LoggingMiddleware, AuthMiddleware)
	_ = handler

	fmt.Println("中间件链已构建")
}
\`\`\`

中间件本质是"层层包装"——每个中间件包住前一个 handler，调用时层层委托。

### 十、嵌入 vs 继承的对比

#### 嵌入不是继承

虽然嵌入"看起来"像继承（外层获得内层方法），但本质是**组合**：

\`\`\`go
package main

import "fmt"

type Base struct{}
func (Base) Hello() { fmt.Println("Base.Hello") }

type Derived struct{ Base }

func main() {
	d := Derived{}
	d.Hello()      // Base.Hello（提升）
	d.Base.Hello() // Base.Hello（显式）

	// 多态问题：嵌入不支持 is-a
	// var b Base = Derived{} // 编译错误！Derived 不是 Base
}
\`\`\`

\`Derived\` 嵌入了 \`Base\`，但 \`Derived\` **不是** \`Base\`——不能赋值给 \`Base\` 类型的变量。这就是"嵌入不是继承"的本质区别。

#### 嵌入的方法集与指针接收者

\`\`\`go
package main

import "fmt"

type Engine struct{ power int }

func (e Engine) Start()    { fmt.Println("引擎启动") }
func (e *Engine) Turbo()   { e.power += 100; fmt.Println("涡轮 +100") }

type Car struct{ Engine }

func main() {
	c := Car{Engine: Engine{power: 100}}
	c.Start()  // 提升：Car 持有 Engine 的值方法
	c.Turbo()  // 提升：Car.Turbo() → (&c.Engine).Turbo()

	// p := &Car{Engine: Engine{power: 100}}
	// p.Turbo() // 同样可以
}
\`\`\`

嵌入字段的方法集会被合并到外层，但需要注意：

- 嵌入 \`Engine\`（值），外层 \`Car\` 的方法集包含 \`Engine\` 的值方法。
- 嵌入 \`*Engine\`（指针），外层 \`Car\` 的方法集同时包含值方法和指针方法。

### 十一、类型转换与类型断言

#### 类型转换

类型转换用于"已知类型"之间的显式转换：

\`\`\`go
package main

import "fmt"

type Celsius float64
type Fahrenheit float64

func main() {
	var c Celsius = 100
	f := Fahrenheit(c*9/5 + 32) // 显式转换
	fmt.Println(c, f)
}
\`\`\

#### 类型断言

类型断言用于"从接口取具体类型"：

\`\`\`go
package main

import "fmt"

func main() {
	var i any = "hello"
	s, ok := i.(string)
	fmt.Println(s, ok) // hello true

	n, ok := i.(int)
	fmt.Println(n, ok) // 0 false
}
\`\`\

#### 转换 vs 断言：何时用哪个

- **类型转换** \`T(v)\`：两个具体类型之间转换（如 \`int(f)\`、\`Celsius(i)\`）。
- **类型断言** \`v.(T)\`：从接口值取出具体类型。

### 十二、空结构体 struct{}

空结构体 \`struct{}\` 不占内存（大小为 0），常用于"信号"场景：

\`\`\`go
package main

import "fmt"

func main() {
	var s struct{}
	fmt.Println(unsafe_sizeof(s)) // 0
}

func unsafe_sizeof(s struct{}) int {
	// 在 64 位系统上，空结构体大小为 0
	return 0
}
\`\`\`

#### 用空结构体做集合

\`\`\`go
package main

import "fmt"

type Set struct {
	items map[string]struct{}
}

func NewSet() *Set {
	return &Set{items: make(map[string]struct{})}
}

func (s *Set) Add(item string) {
	s.items[item] = struct{}{}
}

func (s *Set) Has(item string) bool {
	_, ok := s.items[item]
	return ok
}

func (s *Set) Remove(item string) {
	delete(s.items, item)
}

func main() {
	s := NewSet()
	s.Add("apple")
	s.Add("banana")
	fmt.Println(s.Has("apple"))  // true
	fmt.Println(s.Has("cherry")) // false
	s.Remove("apple")
	fmt.Println(s.Has("apple")) // false
}
\`\`\`

用 \`map[string]struct{}\` 实现集合，比 \`map[string]bool\` 节省内存。

#### 用空结构体做信号 channel

\`\`\`go
package main

import (
	"fmt"
	"time"
)

func main() {
	done := make(chan struct{})

	go func() {
		time.Sleep(100 * time.Millisecond)
		fmt.Println("工作完成")
		close(done) // 通过 close 通知
	}()

	<-done // 等待 close
	fmt.Println("收到信号，继续执行")
}
\`\`\`

\`chan struct{}\` 是 Go 中"信号通道"的标准写法——不传数据，只用 close 信号。

### 十三、综合示例：分层领域模型

\`\`\`go
package main

import (
	"fmt"
	"time"
)

// 基础类型：时间戳
type Timestamp struct {
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (t *Timestamp) Touch() {
	t.UpdatedAt = time.Now()
}

// 实体：嵌入 Timestamp
type Entity struct {
	ID  int
	Timestamp // 嵌入基础类型
}

// 用户实体
type User struct {
	Entity // 嵌入，获得 ID、CreatedAt、UpdatedAt、Touch()
	Name   string
	Email  string
}

// 订单实体
type Order struct {
	Entity
	UserID int
	Amount float64
}

func main() {
	u := User{
		Entity: Entity{
			ID: 1,
			Timestamp: Timestamp{
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		Name:  "张三",
		Email: "zs@example.com",
	}

	o := Order{
		Entity: Entity{ID: 100},
		UserID: u.ID,
		Amount: 99.99,
	}

	// 嵌入字段直接可用
	fmt.Println(u.ID, u.Name, u.CreatedAt)
	fmt.Println(o.ID, o.UserID, o.Amount)

	u.Touch() // 修改 u.UpdatedAt
	fmt.Println("u.UpdatedAt:", u.UpdatedAt)
}
\`\`\`

通过嵌入 \`Timestamp\`，所有"实体"类型自动获得时间戳字段和方法——这是 Go 风格的"领域模型复用"。

### 十四、综合示例：可组合的中间件

\`\`\`go
package main

import "fmt"

// 通用处理函数类型
type Handler func(ctx string) string

// 中间件：包装 Handler
type Middleware func(Handler) Handler

// 日志中间件
func Logging(next Handler) Handler {
	return func(ctx string) string {
		fmt.Println("[LOG] before:", ctx)
		result := next(ctx)
		fmt.Println("[LOG] after:", result)
		return result
	}
}

// 认证中间件
func Auth(next Handler) Handler {
	return func(ctx string) string {
		if ctx == "guest" {
			return "unauthorized"
		}
		return next(ctx)
	}
}

// 应用多个中间件
func Use(h Handler, middlewares ...Middleware) Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	return h
}

func main() {
	// 基础处理函数
	base := func(ctx string) string {
		return "processed: " + ctx
	}

	// 应用中间件链
	handler := Use(base, Logging, Auth)

	fmt.Println(handler("admin"))
	// [LOG] before: admin
	// [LOG] after: processed: admin
	// processed: admin

	fmt.Println(handler("guest"))
	// [LOG] before: guest
	// [LOG] after: unauthorized
	// unauthorized
}
\`\`\`

### 十五、type 与方法配合的实战模式

\`type\` 关键字不只是给类型起名——配合方法，它能制造出比 OOP 继承更灵活的复用模式。

#### 1. 领域特定类型（Domain-Specific Type）

把 \`string\` 重新定义成"用户 ID"类型，让编译器帮你防止混淆：

\`\`\`go
package main

import "fmt"

// 用新类型包裹底层类型，避免参数传错
type UserID string
type OrderID string

func FetchUser(id UserID) string {
	return "用户 " + string(id)
}

func FetchOrder(id OrderID) string {
	return "订单 " + string(id)
}

func main() {
	uid := UserID("U-100")
	oid := OrderID("O-200")

	fmt.Println(FetchUser(uid)) // 用户 U-100
	fmt.Println(FetchOrder(oid)) // 订单 O-200
	// FetchUser(oid) // 编译错误：类型不匹配
}
\`\`\`

\`UserID\` 和 \`OrderID\` 底层都是 \`string\`，但编译器视为不同类型——传错参数直接报错，省下不少调试时间。

#### 2. 给基本类型加方法

新类型可以挂方法，让"基本类型 + 行为"成为可能：

\`\`\`go
package main

import (
	"fmt"
	"strings"
)

type Celsius float64
type Fahrenheit float64

func (c Celsius) String() string  { return fmt.Sprintf("%.1f°C", c) }
func (c Celsius) ToF() Fahrenheit { return Fahrenheit(c*9/5 + 32) }

func (f Fahrenheit) String() string { return fmt.Sprintf("%.1f°F", f) }

func main() {
	c := Celsius(36.5)
	fmt.Println(c)        // 36.5°C
	fmt.Println(c.ToF())  // 97.7°F
	_ = strings.Repeat // 避免未使用导入
}
\`\`\`

\`Celsius\` 不仅是个数字，还带上了 \`ToF()\` 转换方法和友好的 \`String()\`——这就是"领域建模"的轻量做法。

#### 3. 函数类型加方法

Go 允许给函数类型加方法，实现"函数即对象"：

\`\`\`go
package main

import "fmt"

// 定义函数类型
type Handler func(req string) string

// 给函数类型加方法
func (h Handler) Log(req string) string {
	fmt.Println("收到请求:", req)
	resp := h(req)
	fmt.Println("响应:", resp)
	return resp
}

func main() {
	// 一个普通函数
	echo := func(req string) string {
		return "echo: " + req
	}

	// 把它转成 Handler 类型，就能调用 .Log()
	h := Handler(echo)
	h.Log("ping")
}
\`\`\`

\`http.HandleFunc\` 在标准库里就是这么干的——\`http.HandlerFunc\` 是 \`func(ResponseWriter, *Request)\` 的别名，又实现了 \`ServeHTTP\` 方法，所以既能作为函数调用，也能作为 \`http.Handler\` 使用。

### 十六、类型系统的设计原则

下面几条原则能帮你在"何时定义新类型"和"何时用别名"之间做出合理选择。

#### 1. 新类型 vs 别名：何时用哪个

| 维度 | \`type T U\`（新类型） | \`type T = U\`（别名） |
|------|--------------------|-------------------|
| 类型身份 | 独立类型，不能隐式转换 | 与原类型完全相同 |
| 方法集 | 可独立添加方法 | 共享原类型方法 |
| 编译检查 | 区分不同概念，防止混淆 | 用于"改名迁移"或简化书写 |
| 典型用途 | 领域类型、枚举、函数类型 | 包重构、跨包统一名字 |

\`\`\`go
package main

import "fmt"

type Score int      // 新类型：分数是一个独立概念
type Count = int    // 别名：Count 就是 int，可以互换

func Grade(s Score) string {
	switch {
	case s >= 90:
		return "A"
	case s >= 80:
		return "B"
	default:
		return "C"
	}
}

func main() {
	var s Score = 88
	fmt.Println(Grade(s)) // B

	var n Count = 10
	var m int = n // OK：Count 就是 int
	fmt.Println(s, n, m)
}
\`\`\`

**经验**：90% 的情况下用新类型；别名只在"包迁移"或"想保持完全兼容"时用。

#### 2. 类型最小化原则

不要为了"显得 OO"而定义一堆中间类型。能用基本类型表达的就别造类型——Go 标准库的 \`time.Duration\`、\`time.Time\` 都是 \`int64\` 派生，但只在"时间"这个语义上有意义。

#### 3. 组合优于继承的原则

遇到"类型 A 想复用 B 的能力"时，先想：能不能用嵌入字段？嵌入字段让 A "拥有 B 的能力"，但 A 和 B 仍是独立类型——这比继承灵活得多。

\`\`\`go
package main

import "fmt"

// 一个能记录调用次数的"基础能力"
type Counter struct {
	count int
}

func (c *Counter) Inc()  { c.count++ }
func (c *Counter) Get() int { return c.count }

// 业务类型嵌入 Counter，获得计数能力
type APIServer struct {
	Counter // 匿名嵌入
	name    string
}

func (s *APIServer) Handle() {
	s.Inc() // 直接调用嵌入字段的方法
	fmt.Printf("[%s] 已处理 %d 次请求\\n", s.name, s.Get())
}

func main() {
	s := &APIServer{name: "user-svc"}
	s.Handle() // [user-svc] 已处理 1 次请求
	s.Handle() // [user-svc] 已处理 2 次请求
}
\`\`\`

\`APIServer\` 不需要"继承"什么基类，只是"组装"了 \`Counter\` 这个能力。换个业务场景，再加一个 \`Logger\` 嵌入字段就行——这就是 Go 的"组合优于继承"。

### 十七、嵌入字段的进阶模式

#### 1. 嵌入 + 接口替换：运行时切换实现

把嵌入字段改成"接口类型的字段"，就能在运行时替换实现：

\`\`\`go
package main

import "fmt"

type Logger interface {
	Log(msg string)
}

type ConsoleLogger struct{}

func (ConsoleLogger) Log(msg string) { fmt.Println("[console]", msg) }

type FileLogger struct{ path string }

func (f *FileLogger) Log(msg string) { fmt.Println("[file:"+f.path+"]", msg) }

type Service struct {
	Logger // 接口嵌入：可在运行时替换
	name   string
}

func (s *Service) SetLogger(l Logger) {
	s.Logger = l
}

func (s *Service) DoWork() {
	s.Log(s.name + " 开始工作")
}

func main() {
	s := &Service{name: "订单服务", Logger: ConsoleLogger{}}
	s.DoWork() // [console] 订单服务 开始工作

	s.SetLogger(&FileLogger{path: "app.log"})
	s.DoWork() // [file:app.log] 订单服务 开始工作
}
\`\`\`

注意：嵌入接口字段时，必须显式赋初值（\`Logger: ConsoleLogger{}\`），否则它是 \`nil\`，调用方法会 panic。

#### 2. 嵌入字段的"覆盖"与"super 调用"

外层类型可以覆盖嵌入字段的方法，并通过"嵌入字段名 + 方法"调用原方法（类似其他语言的 \`super\`）：

\`\`\`go
package main

import "fmt"

type Base struct{}

func (Base) Hello() string { return "Hello from Base" }

type Derived struct {
	Base
}

func (d Derived) Hello() string {
	return d.Base.Hello() + ", and Derived" // 通过字段名访问原方法
}

func main() {
	d := Derived{}
	fmt.Println(d.Hello()) // Hello from Base, and Derived
}
\`\`\`

注意是 \`d.Base.Hello()\` 不是 \`super.Hello()\`——Go 用"字段名"访问嵌入字段本身，再调它的方法。

#### 3. 多重嵌入的方法冲突

嵌入多个字段时，如果两个字段有同名方法且都被提升，会编译报错：

\`\`\`go
package main

type A struct{}
func (A) Foo() {}

type B struct{}
func (B) Foo() {}

// 编译错误：ambiguous selector c.Foo
type C struct {
	A
	B
}

func main() {
	// var c C
	// c.Foo() // 编译器不知道该调 A 还是 B 的 Foo
}
\`\`\`

解决方式：在外层类型显式定义一个 \`Foo()\`，明确选择调谁：

\`\`\`go
type C struct {
	A
	B
}

func (c C) Foo() {
	c.A.Foo() // 显式选择 A 的实现
}
\`\`\`

### 十八、类型与接口的协作

类型和接口是 Go 类型系统的两条腿——类型定义"是什么"，接口定义"能做什么"。

#### 1. 类型满足接口：编译期断言

用 \`var _ Interface = (*Type)(nil)\` 这种声明，让编译器检查"类型是否实现了接口"：

\`\`\`go
package main

import "fmt"

type Stringer interface {
	String() string
}

type User struct{ Name string }

// 编译期断言：确保 *User 实现了 Stringer
var _ Stringer = (*User)(nil)

func (u *User) String() string {
	return "User(" + u.Name + ")"
}

func main() {
	u := &User{Name: "张三"}
	fmt.Println(u) // User(张三)
}
\`\`\`

如果 \`*User\` 忘了实现 \`String()\`，编译期就报错——比"运行时类型断言失败"早得多。

#### 2. 接口隔离 + 类型嵌入

让大结构体只暴露"它实现的部分接口"，避免依赖整个类型：

\`\`\`go
package main

import "fmt"

type User struct{ name, email string }

func (u *User) GetName() string  { return u.name }
func (u *User) GetEmail() string { return u.email }
func (u *User) SetEmail(e string) { u.email = e }

// 只需要"读取名字"的能力
type NameReader interface {
	GetName() string
}

func Greet(r NameReader) string {
	return "你好，" + r.GetName()
}

func main() {
	u := &User{name: "张三", email: "z@x.com"}
	fmt.Println(Greet(u)) // 你好，张三
}
\`\`\`

\`Greet\` 函数依赖 \`NameReader\` 这个小接口，而不是 \`*User\` 整个类型——单元测试时换任何实现 \`GetName()\` 的类型都行。

#### 3. 用接口包装类型：策略模式

\`\`\`go
package main

import "fmt"

type DiscountStrategy interface {
	Apply(price float64) float64
}

type NoDiscount struct{}
func (NoDiscount) Apply(p float64) float64 { return p }

type PercentDiscount struct{ Percent float64 }
func (d PercentDiscount) Apply(p float64) float64 {
	return p * (1 - d.Percent/100)
}

type Order struct {
	Price    float64
	Strategy DiscountStrategy
}

func (o Order) FinalPrice() float64 {
	if o.Strategy == nil {
		return o.Price
	}
	return o.Strategy.Apply(o.Price)
}

func main() {
	o := Order{Price: 100, Strategy: PercentDiscount{Percent: 20}}
	fmt.Println(o.FinalPrice()) // 80

	o2 := Order{Price: 100, Strategy: NoDiscount{}}
	fmt.Println(o2.FinalPrice()) // 100
}
\`\`\`

\`Order\` 通过 \`Strategy\` 接口持有"折扣策略"，运行时切换不同实现——这就是策略模式的 Go 写法，没有继承层次，只有接口 + 组合。

### 十九、类型系统的反模式

最后列几个常见的类型系统误用，帮你少踩坑。

#### 1. 滥用别名破坏类型安全

\`\`\`go
// 反模式：用别名让两个概念"互相兼容"
type UserID = string
type OrderID = string

// 结果：FetchUser(oid) 不报错，运行时才发现传错了
\`\`\`

\`type UserID = string\` 让两者完全相同，编译器无法帮你检查参数混淆——这种"便利"得不偿失。除非是包迁移，否则用新类型 \`type UserID string\`。

#### 2. 嵌入不该嵌入的类型

\`\`\`go
// 反模式：把内部状态嵌入暴露出去
type Database struct {
	url      string
	password string
}

type UserService struct {
	Database // 把整个数据库都暴露给外部
}

// 外部代码可以 userSvc.url、userSvc.password 直接访问
\`\`\`

嵌入字段会被"提升"——外部能直接访问 \`userSvc.url\`、\`userSvc.password\`。如果不想暴露内部细节，用命名字段 \`db *Database\` 而不是嵌入。

#### 3. 用嵌入"假装继承"

\`\`\`go
// 反模式：把嵌入当继承，写出一堆层级
type Animal struct{}
type Dog struct{ Animal }
type Puppy struct{ Dog }
type TeacupPuppy struct{ Puppy }
\`\`\`

四层嵌入看起来像继承层次，但 Go 没有 \`super\`、没有 \`virtual\`，运行时行为和 OOP 继承完全不同——代码会变得难推理。Go 鼓励扁平结构：把需要的能力直接嵌入，不要套娃。

#### 4. 用 \`any\` 逃避类型设计

\`\`\`go
// 反模式
type Bag struct {
	items map[string]any
}
func (b *Bag) Get(key string) any { return b.items[key] }
\`\`\`

\`any\` 让编译器失去类型信息，调用方每次都要类型断言。除非真的不知道类型（如解析 JSON），否则用泛型或具体类型：

\`\`\`go
// Go 1.18+ 泛型版
type Bag[T any] struct {
	items map[string]T
}
func (b *Bag[T]) Get(key string) (T, bool) {
	v, ok := b.items[key]
	return v, ok
}
\`\`\`

#### 5. 在嵌入接口上写循环方法

\`\`\`go
// 反模式：方法里只是再调一遍嵌入字段的方法
type Logger struct{ Inner Logger }
func (l Logger) Log(msg string) { l.Inner.Log(msg) }
\`\`\`

无意义的"转发"代码读起来累，还没增加任何价值。如果只是想换名字，用别名 \`type Inner = Logger\`；如果是要改行为，就在方法里写真正的逻辑。

### 二十、Go 类型系统与其他语言对比

理解 Go 类型系统的最好方式，是和 Java/C#/Python 等语言做横向对比——这样能看清 Go 的取舍和长处。

#### 1. 没有"类"：方法不是类型的"附属品"

Java、C# 把数据和方法都装在 \`class\` 里，方法属于类本身。Go 不一样——**方法是独立定义在类型之外的**：

\`\`\`go
// Go：方法定义可以离 struct 很远
type User struct{ name string }

// 这一行可以放在文件末尾，甚至另一个文件
func (u *User) GetName() string { return u.name }
\`\`\`

这带来一个工程优势：你可以给**别人包里的类型**加方法——前提是定义一个新类型 \`type MyUser = TheirUser\`（其实新类型才能加，别名不能直接加）。这种灵活性是 Java/C# 没有的。

#### 2. 没有继承：组合代替一切

Java 用 \`extends\` 建立类型层次，C# 用 \`:\` 继承。Go 没有继承，只有组合：

| 语言 | 复用方式 | 关键字 |
|------|---------|--------|
| Java | 继承 + 接口实现 | \`extends\` / \`implements\` |
| C# | 继承 + 接口实现 | \`:\` |
| Python | 多继承 + 鸭子类型 | \`class A(B, C)\` |
| Go | 嵌入字段 + 隐式接口 | （没有关键字）|

\`\`\`go
// Java 的做法
class Dog extends Animal implements Barkable { ... }

// Go 的做法
type Dog struct {
	Animal      // 嵌入：获得 Animal 的字段和方法
}
func (Dog) Bark() {} // 实现接口（隐式）
\`\`\`

Go 的方式让"类型层次"扁平化——没有"父类→子类→孙子类"的链条，每个类型都是顶层的、独立的。代价是写起来不如继承那么"自然"，但好处是重构起来没包袱。

#### 3. 没有泛型重载：用类型参数

Java 的泛型用"擦除"实现，C# 用"特化"。Go 1.18 引入泛型，走的是"类型参数 + 类型约束"路子：

\`\`\`go
// Go 泛型
func Max[T int | float64](a, b T) T {
	if a > b { return a }
	return b
}
\`\`\`

和 Java \`<T extends Comparable<T>>\` 比，Go 的约束写在 \`interface\` 里，更明确但也更冗长。Go 不支持"方法重载"——同名方法只能有一个签名，要变体就写不同名字（\`MaxInt\`、\`MaxFloat\`）或用泛型。

#### 4. 隐式接口 vs 显式接口

这是 Go 与其他语言最显眼的差异：

\`\`\`go
// Go：隐式
type Reader interface { Read() }
type File struct{}
func (File) Read() {}  // File 自动满足 Reader
\`\`\`

\`\`\`java
// Java：显式
interface Reader { void read(); }
class File implements Reader {  // 必须显式 implements
	public void read() {}
}
\`\`\`

Go 的隐式接口让你可以"事后"定义接口——某个第三方库的类型已经有了 \`Read()\` 方法，你写个 \`Reader\` 接口就能用上，不需要修改第三方代码。Java 的显式接口要求你"事前"就声明 implements，对第三方代码做扩展就没这么自由。

#### 5. 错误类型也是值

Java/C# 把异常当 \`throw\` 出去的对象，Go 把错误当 \`error\` 接口类型的返回值：

\`\`\`go
// Go
func Fetch() (string, error) {
	return "", fmt.Errorf("network down")
}
\`\`\`

\`\`\`java
// Java
String fetch() throws IOException {
	throw new IOException("network down");
}
\`\`\`

Go 的方式让"哪些函数可能出错"在签名里一目了然——函数没返回 \`error\` 就不会出错（除了 panic）。代价是错误处理代码会比较啰嗦（到处是 \`if err != nil\`）。

### 二十一、本章小结

- \`type\` 关键字能定义新类型（\`type T U\`）或别名（\`type T = U\`）。新类型有独立的方法集，别名完全等同原类型。
- **iota 枚举模式**：用 \`const\` + \`iota\` 实现自增枚举，常配合位运算做权限标志。
- **嵌入字段**让外层类型获得内层类型的方法和字段——这是 Go 替代继承的机制。
- **组合代替继承**：Go 没有 \`extends\`，提倡"Has-a"关系。多个能力通过嵌入不同类型组合，避免继承层次的复杂性。
- **嵌入接口**让结构体持有可替换的实现，是依赖注入的基础。
- **包装器模式**通过嵌入接口 + 覆盖方法，实现层层委托的装饰器（如 HTTP 中间件）。
- **类型转换** \`T(v)\` 用于具体类型之间，**类型断言** \`v.(T)\` 用于从接口取具体类型。
- **空结构体** \`struct{}\` 不占内存，常用于集合、信号 channel。
- 嵌入不是继承——\`Derived\` 嵌入 \`Base\` 但 \`Derived\` 不是 \`Base\`，不能赋值给 \`Base\` 类型变量。
- **领域特定类型**用新类型包裹底层类型，让编译器帮你防止参数混淆。
- **设计原则**：90% 用新类型不用别名；类型最小化；组合优于继承。
- **嵌入进阶**：嵌入接口字段可在运行时替换实现；外层覆盖内层方法时通过字段名调原方法。
- **类型与接口协作**：编译期断言 \`var _ I = (*T)(nil)\` 提前发现未实现；接口隔离让大类型只暴露部分能力。
- **反模式**：滥用别名破坏类型安全、嵌入暴露内部状态、把嵌入当继承套娃、用 \`any\` 逃避类型设计——这些都是工程上的常见坑。
- **横向对比**：Go 没有"类""继承""方法重载"——方法独立于类型定义、组合代替继承、泛型用类型参数、接口隐式实现、错误是值。每一条都是和 Java/C# 的取舍不同。`,
  },

  // ============================================================
  // 第十二章：错误处理
  // ============================================================
  {
    id: 'go-ch12',
    group: '第三部分 类型系统',
    icon: '⚠️',
    title: '错误处理',
    content: `## 第十二章　错误处理

### 一、Go 的错误哲学：错误是值，不是异常

C++、Java、C# 用 \`try/catch\` 异常机制：错误"抛出"后，沿调用栈向上传播，直到被某个 \`catch\` 接住。Go 走了完全不同的路——**错误就是普通的返回值**。

这个设计有三个深远含义：

1. **错误必须显式处理**：函数返回 \`error\`，调用方必须检查（或显式 \`_\` 忽略）。不能像异常那样"忘记 catch"导致程序崩溃。
2. **没有隐藏的控制流**：异常会在任意位置"跳出去"，让人难以追踪。Go 的错误处理是线性的——错误返回后，调用方决定如何处理。
3. **错误是值，可以组合、传递、包装**：可以放进 channel、存进结构体、用 \`%w\` 包装，灵活度极高。

#### 一个简单对比

\`\`\`go
// Java 风格
try {
    String s = readFile("a.txt");
    process(s);
} catch (IOException e) {
    log.error(e);
}

// Go 风格
s, err := readFile("a.txt")
if err != nil {
    log.Println(err)
    return
}
process(s)
\`\`\`

Go 的写法看起来"啰嗦"，但它强制开发者**显式决策**：忽略、记录、返回、还是 panic。这是 Go 设计哲学的核心：**让错误路径成为代码的一等公民**。

#### Go 没有 try-catch

Go 故意没有 \`try/catch\`。原因：

1. **异常隐藏控制流**：你不知道哪个函数会抛异常。
2. **异常容易滥用**：用异常处理"正常流程"（如找不到用户）会让代码混乱。
3. **异常性能开销**：异常机制需要栈展开，性能不如普通返回值。

Go 选择"错误是值"——简单、显式、可组合。

### 二、error 接口

#### error 接口定义

\`\`\`go
type error interface {
	Error() string
}
\`\`\`

任何实现了 \`Error() string\` 方法的类型都是 \`error\`。Go 标准库提供两种基本创建方式：

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("除数不能为零")
	}
	return a / b, nil
}

func main() {
	r, err := Divide(10, 0)
	if err != nil {
		fmt.Println("错误：", err) // 错误： 除数不能为零
		return
	}
	fmt.Println("结果：", r)
}
\`\`\`

#### errors.New vs fmt.Errorf

- \`errors.New("msg")\`：创建简单错误，只有字符串描述。
- \`fmt.Errorf("格式化 %s", arg)\`：支持格式化，可包装其他错误（下一节讲）。

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

func findUser(id int) (string, error) {
	if id < 0 {
		return "", errors.New("id 不能为负数")
	}
	if id == 0 {
		return "", fmt.Errorf("用户 %d 不存在", id)
	}
	return "张三", nil
}

func main() {
	if _, err := findUser(-1); err != nil {
		fmt.Println(err) // id 不能为负数
	}
	if _, err := findUser(0); err != nil {
		fmt.Println(err) // 用户 0 不存在
	}
}
\`\`\`

#### errors.New 的内部实现

\`\`\`go
// errors.New 内部大致是这样：
type errorString struct {
	s string
}

func (e *errorString) Error() string {
	return e.s
}

func New(text string) error {
	return &errorString{text}
}
\`\`\`

可见 \`errors.New\` 创建的就是一个简单的字符串错误。

### 三、错误包装 %w（Go 1.13+）

Go 1.13 引入错误包装机制：用 \`%w\` 动词把一个错误"包"进另一个错误，保留原始错误的类型信息：

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func readConfig(path string) error {
	file, err := os.Open(path)
	if err != nil {
		// 用 %w 包装原始错误
		return fmt.Errorf("打开配置文件 %q 失败: %w", path, err)
	}
	defer file.Close()
	return nil
}

func main() {
	err := readConfig("/nonexistent.yaml")
	if err != nil {
		fmt.Println(err)
		// 打开配置文件 "/nonexistent.yaml" 失败: open /nonexistent.yaml: no such file or directory
	}
}
\`\`\`

#### %w 与 %v 的区别

- \`%w\`：保留原始错误，可以用 \`errors.Is\` 和 \`errors.As\` 检查。
- \`%v\`：把错误转成字符串后嵌入新错误，丢失了原始错误的类型信息。

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

func main() {
	wrapped := fmt.Errorf("查询失败: %w", ErrNotFound)
	plain := fmt.Errorf("查询失败: %v", ErrNotFound)

	fmt.Println(errors.Is(wrapped, ErrNotFound)) // true
	fmt.Println(errors.Is(plain, ErrNotFound))    // false
}
\`\`\`

#### 多层包装

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var ErrDB = errors.New("db error")

func queryDB() error {
	return ErrDB
}

func serviceLayer() error {
	if err := queryDB(); err != nil {
		return fmt.Errorf("service: %w", err)
	}
	return nil
}

func handlerLayer() error {
	if err := serviceLayer(); err != nil {
		return fmt.Errorf("handler: %w", err)
	}
	return nil
}

func main() {
	err := handlerLayer()
	fmt.Println(err) // handler: service: db error

	// errors.Is 会穿透包装链
	fmt.Println(errors.Is(err, ErrDB)) // true
}
\`\`\`

### 四、自定义错误类型

#### 简单自定义错误

\`\`\`go
package main

import "fmt"

type MyError struct {
	Code    int
	Message string
}

func (e *MyError) Error() string {
	return fmt.Sprintf("错误码 %d: %s", e.Code, e.Message)
}

func DoSomething(bad bool) error {
	if bad {
		return &MyError{Code: 500, Message: "内部错误"}
	}
	return nil
}

func main() {
	err := DoSomething(true)
	if err != nil {
		fmt.Println(err) // 错误码 500: 内部错误
	}
}
\`\`\`

#### 携带更多上下文

自定义错误类型可以携带丰富的信息，让调用方能根据错误做不同处理：

\`\`\`go
package main

import "fmt"

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("字段 %q 校验失败: %s", e.Field, e.Message)
}

type NotFoundError struct {
	Resource string
	ID       int
}

func (e *NotFoundError) Error() string {
	return fmt.Sprintf("%s %d 不存在", e.Resource, e.ID)
}

func GetUser(id int) error {
	if id < 0 {
		return &ValidationError{Field: "id", Message: "不能为负数"}
	}
	if id == 0 {
		return &NotFoundError{Resource: "User", ID: id}
	}
	return nil
}

func main() {
	for _, id := range []int{-1, 0, 1} {
		err := GetUser(id)
		if err != nil {
			fmt.Println(err)
		} else {
			fmt.Println("找到用户", id)
		}
	}
	// 字段 "id" 校验失败: 不能为负数
	// User 0 不存在
	// 找到用户 1
}
\`\`\`

#### 实现 Unwrap 方法

要让自定义错误类型支持 \`errors.Is/As\`，可以实现 \`Unwrap\` 方法：

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var ErrDBConnection = errors.New("db connection failed")

type QueryError struct {
	Query string
	Err   error
}

func (e *QueryError) Error() string {
	return fmt.Sprintf("查询 %q 失败: %v", e.Query, e.Err)
}

// 实现 Unwrap，让 errors.Is/As 能解包
func (e *QueryError) Unwrap() error {
	return e.Err
}

func runQuery() error {
	return &QueryError{
		Query: "SELECT * FROM users",
		Err:   ErrDBConnection,
	}
}

func main() {
	err := runQuery()
	fmt.Println(errors.Is(err, ErrDBConnection)) // true
}
\`\`\`

### 五、errors.Is 与 errors.As（Go 1.13+）

#### errors.Is：检查错误链中是否包含特定错误

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")
var ErrUnauthorized = errors.New("unauthorized")

func findUser(id int) error {
	if id == 0 {
		return fmt.Errorf("查询用户 %d: %w", id, ErrNotFound)
	}
	if id < 0 {
		return fmt.Errorf("查询用户 %d: %w", id, ErrUnauthorized)
	}
	return nil
}

func main() {
	err := findUser(0)
	if errors.Is(err, ErrNotFound) {
		fmt.Println("处理 not found 错误")
	}

	err = findUser(-1)
	if errors.Is(err, ErrUnauthorized) {
		fmt.Println("处理未授权错误")
	}
}
\`\`\`

\`errors.Is\` 会沿着错误包装链一路检查，即使错误被层层包装，也能找到最底层的"哨兵错误"。

#### errors.Is 的内部实现（简化版）

\`\`\`go
func Is(err, target error) bool {
	for err != nil {
		if err == target {
			return true
		}
		// 尝试 Unwrap
		if u, ok := err.(interface{ Unwrap() error }); ok {
			err = u.Unwrap()
		} else {
			return false
		}
	}
	return false
}
\`\`\`

#### errors.As：提取错误链中的特定类型

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

type QueryError struct {
	Query   string
	Message string
}

func (e *QueryError) Error() string {
	return fmt.Sprintf("查询错误 %q: %s", e.Query, e.Message)
}

func runQuery(sql string) error {
	return &QueryError{Query: sql, Message: "语法错误"}
}

func main() {
	err := runQuery("SELECT * FROM")
	var qe *QueryError
	if errors.As(err, &qe) {
		fmt.Printf("查询: %s\\n消息: %s\\n", qe.Query, qe.Message)
	}
}
\`\`\`

\`errors.As\` 用于从错误链中提取特定类型的错误，方便调用方根据错误类型做精细处理。

### 六、哨兵错误模式

"哨兵错误"是用包级变量声明的预定义错误，调用方用 \`errors.Is\` 检查：

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidInput = errors.New("invalid input")
	ErrTimeout      = errors.New("timeout")
	ErrNotFound    = errors.New("not found")
)

func Process(input string) error {
	if input == "" {
		return ErrInvalidInput
	}
	if input == "timeout" {
		return ErrTimeout
	}
	if input == "missing" {
		return ErrNotFound
	}
	return nil
}

func main() {
	err := Process("missing")
	switch {
	case errors.Is(err, ErrInvalidInput):
		fmt.Println("请检查输入")
	case errors.Is(err, ErrTimeout):
		fmt.Println("请重试")
	case errors.Is(err, ErrNotFound):
		fmt.Println("找不到资源")
	case err != nil:
		fmt.Println("其他错误:", err)
	default:
		fmt.Println("处理成功")
	}
}
\`\`\`

**注意：** 哨兵错误适合"调用方需要区分的少量情况"。如果错误有丰富上下文，应该用自定义错误类型 + \`errors.As\`。

#### 标准库中的哨兵错误

\`\`\`go
package main

import (
	"errors"
	"fmt"
	"io"
	"os"
)

func main() {
	_, err := os.Open("/nonexistent.txt")
	if errors.Is(err, os.ErrNotExist) {
		fmt.Println("文件不存在")
	}

	// io.EOF 是经典的哨兵错误
	fmt.Println(errors.Is(io.EOF, io.EOF)) // true
}
\`\`\`

### 七、panic 与 recover

#### panic：不可恢复的错误

\`panic\` 用于"不应该发生的情况"——比如程序状态被破坏、不可恢复的初始化失败。panic 会立即停止当前函数，依次执行 defer，然后沿调用栈向上 panic：

\`\`\`go
package main

import "fmt"

func A() {
	fmt.Println("A 开始")
	B()
	fmt.Println("A 结束") // 不会执行
}

func B() {
	fmt.Println("B 开始")
	panic("B 出问题了")
	fmt.Println("B 结束") // 不会执行
}

func main() {
	A()
}
\`\`\`

输出：

\`\`\`
A 开始
B 开始
panic: B 出问题了

goroutine 1 [running]:
main.B(...)
	...
main.A(...)
	...
main.main()
	...
\`\`\`

#### 什么时候用 panic

- **程序初始化失败**：比如配置文件解析失败，无法继续。
- **不可能的状态**：比如 \`switch\` 的 default 分支永远不应该走到。
- **库的 API 误用**：比如传 nil 给不应该传 nil 的函数。

**不要用 panic 代替 error 返回**——业务错误应该用 \`error\` 返回，panic 是给"程序员错误"用的。

#### 何时 panic：例子

\`\`\`go
package main

import "fmt"

func MustConnect(dsn string) {
	if dsn == "" {
		panic("dsn 不能为空") // 启动时检查，必填
	}
	fmt.Println("连接成功")
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("启动失败:", r)
		}
	}()

	MustConnect("")
}
\`\`\`

标准库有很多 \`MustXxx\` 函数——它们在错误时 panic，用于"启动时配置必须正确"的场景。比如 \`regexp.MustCompile\`、\`template.Must\`。

#### recover：捕获 panic

\`recover\` 只能在 defer 函数中调用，能"接住" panic，让程序继续运行：

\`\`\`go
package main

import "fmt"

func SafeDivide(a, b int) (result int, err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic: %v", r)
			result = 0
		}
	}()

	return a / b, nil // 如果 b == 0 会 panic
}

func main() {
	r, err := SafeDivide(10, 0)
	if err != nil {
		fmt.Println("错误：", err) // 错误： panic: runtime error: integer divide by zero
	} else {
		fmt.Println("结果：", r)
	}

	// 程序继续运行
	r2, err2 := SafeDivide(10, 2)
	fmt.Println(r2, err2) // 5 <nil>
}
\`\`\`

### 八、defer 在 panic 中的应用

defer 函数即使发生 panic 也会执行——这是清理资源、记录日志、发送告警的关键机制：

\`\`\`go
package main

import "fmt"

func riskyOperation() {
	defer fmt.Println("清理资源 1")
	defer fmt.Println("清理资源 2")
	defer fmt.Println("清理资源 3")

	fmt.Println("执行操作")
	panic("出问题了")
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println("捕获 panic:", r)
		}
	}()

	riskyOperation()
}
\`\`\`

输出：

\`\`\`
执行操作
清理资源 3
清理资源 2
清理资源 1
捕获 panic: 出问题了
\`\`\`

defer 按 LIFO（后进先出）执行——所以资源 3 最先清理。这种"无论是否 panic 都会清理"的特性是 Go 资源管理的基石。

#### defer 与资源清理

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func ProcessFile(path string) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	// defer 保证文件被关闭，即使下面 panic
	defer file.Close()

	// 假设这里有 panic 的可能
	data := make([]byte, 100)
	_, err = file.Read(data)
	if err != nil {
		return err
	}

	fmt.Println(string(data))
	return nil
}

func main() {
	ProcessFile("/etc/hosts")
}
\`\`\`

\`defer file.Close()\` 保证文件被关闭——即使中间 panic，资源也不会泄漏。

### 九、错误处理最佳实践

#### 1. 优先返回 error，不要 panic

\`\`\`go
// 不好：用 panic 表达业务错误
func GetUser(id int) *User {
	if id < 0 {
		panic("invalid id")
	}
	// ...
}

// 好：用 error 返回
func GetUser(id int) (*User, error) {
	if id < 0 {
		return nil, ErrInvalidInput
	}
	// ...
}
\`\`\`

#### 2. 错误要包装上下文

\`\`\`go
// 不好：直接返回底层错误
func LoadConfig(path string) error {
	_, err := os.Open(path)
	return err
}

// 好：包装上下文，方便定位
func LoadConfig(path string) error {
	_, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("加载配置 %q 失败: %w", path, err)
	}
	return nil
}
\`\`\`

#### 3. 不要重复处理同一错误

\`\`\`go
// 不好：每层都 log，导致同一个错误被记录多次
func A() error {
	err := B()
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}
func B() error {
	err := C()
	if err != nil {
		log.Println(err)
		return err
	}
	return nil
}

// 好：上层包装、底层返回；只在最顶层记录
func A() error {
	if err := B(); err != nil {
		return fmt.Errorf("A 失败: %w", err)
	}
	return nil
}
\`\`\`

#### 4. 不要忽略错误（除非显式 \`_\`）

\`\`\`go
// 危险：错误被忽略
file, _ := os.Open("config.yaml")

// 显式忽略（至少表明是有意的）
file, _ := os.Open("optional.txt")
\`\`\`

#### 5. 哨兵错误与类型断言结合

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

type User struct{ Name string }

func findUser(id int) (*User, error) {
	if id == 0 {
		return nil, ErrNotFound
	}
	return &User{Name: "张三"}, nil
}

func main() {
	u, err := findUser(0)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			fmt.Println("用户不存在，使用默认用户")
			u = &User{Name: "Guest"}
		} else {
			fmt.Println("其他错误:", err)
			return
		}
	}
	fmt.Println("用户名:", u.Name)
}
\`\`\`

#### 6. 错误信息要可读

\`\`\`go
// 不好：信息不足
return errors.New("failed")

// 好：包含上下文
return fmt.Errorf("查询用户 %d 失败: %w", id, err)
\`\`\`

#### 7. 不要用 string 比较错误

\`\`\`go
// 不好：用字符串比较
if err.Error() == "not found" { ... }

// 好：用 errors.Is
if errors.Is(err, ErrNotFound) { ... }
\`\`\`

### 十、错误比较

#### 用 == 比较哨兵错误

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

func find(id int) error {
	if id == 0 {
		return ErrNotFound
	}
	return nil
}

func main() {
	err := find(0)
	// 直接比较（适用于未包装的错误）
	if err == ErrNotFound {
		fmt.Println("直接比较：not found")
	}
	// 用 errors.Is（适用于可能被包装的错误，更通用）
	if errors.Is(err, ErrNotFound) {
		fmt.Println("errors.Is：not found")
	}
}
\`\`\`

**最佳实践：** 优先用 \`errors.Is\`——它兼容未包装和已包装的错误。

### 十一、context 与错误传播

\`context.Context\` 用于在 goroutine 之间传递取消信号、超时、值。错误传播与 context 经常配合使用：

\`\`\`go
package main

import (
	"context"
	"fmt"
	"time"
)

func SlowOperation(ctx context.Context) error {
	select {
	case <-time.After(2 * time.Second):
		return nil
	case <-ctx.Done():
		// 上下文取消，返回 ctx.Err()
		return ctx.Err()
	}
}

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	if err := SlowOperation(ctx); err != nil {
		fmt.Println("错误：", err) // 错误： context deadline exceeded
	}
}
\`\`\`

#### context 的标准错误

- \`context.Canceled\`：被主动取消。
- \`context.DeadlineExceeded\`：超时。

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

	<-ctx.Done()
	fmt.Println(ctx.Err()) // context deadline exceeded
}
\`\`\`

### 十二、并发场景的错误处理

#### 多 goroutine 错误聚合

Go 的 channel 可以传递 error，让多个 goroutine 的错误汇聚到一处：

\`\`\`go
package main

import (
	"fmt"
	"sync"
)

func worker(id int, wg *sync.WaitGroup, errCh chan<- error) {
	defer wg.Done()
	if id%2 == 0 {
		errCh <- fmt.Errorf("worker %d 失败", id)
		return
	}
	fmt.Printf("worker %d 成功\\n", id)
}

func main() {
	const n = 5
	var wg sync.WaitGroup
	errCh := make(chan error, n)

	for i := 1; i <= n; i++ {
		wg.Add(1)
		go worker(i, &wg, errCh)
	}

	go func() {
		wg.Wait()
		close(errCh)
	}()

	var errs []error
	for err := range errCh {
		errs = append(errs, err)
	}

	fmt.Printf("完成，错误数 %d\\n", len(errs))
	for _, err := range errs {
		fmt.Println(err)
	}
}
\`\`\`

#### errgroup 包（推荐）

Go 1.20+ 标准库的 \`golang.org/x/sync/errgroup\` 提供更优雅的多 goroutine 错误处理：

\`\`\`go
package main

import (
	"context"
	"fmt"
	"golang.org/x/sync/errgroup"
)

func main() {
	g, ctx := errgroup.WithContext(context.Background())

	for i := 1; i <= 3; i++ {
		i := i
		g.Go(func() error {
			if i == 2 {
				return fmt.Errorf("worker %d 失败", i)
			}
			fmt.Printf("worker %d 成功\\n", i)
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		fmt.Println("第一个错误：", err)
	}
	_ = ctx
}
\`\`\`

\`errgroup\` 会在第一个错误发生时取消 context，让其他 goroutine 优雅退出。

### 十三、综合示例：分层错误处理

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

// 基础层：自定义错误类型
type DBError struct {
	Op  string
	Err error
}

func (e *DBError) Error() string {
	return fmt.Sprintf("db %s: %v", e.Op, e.Err)
}

// 实现 Unwrap 方法，让 errors.Is/As 能解包
func (e *DBError) Unwrap() error {
	return e.Err
}

// 业务层错误
var ErrUserNotFound = errors.New("user not found")

// 数据访问层
func dbFindUser(id int) (*struct{ Name string }, error) {
	if id == 0 {
		return nil, &DBError{
			Op:  "SELECT",
			Err: ErrUserNotFound,
		}
	}
	return &struct{ Name string }{"张三"}, nil
}

// 业务逻辑层：包装错误加上下文
func GetUserProfile(id int) (string, error) {
	user, err := dbFindUser(id)
	if err != nil {
		return "", fmt.Errorf("获取用户 %d 资料: %w", id, err)
	}
	return user.Name, nil
}

// HTTP 层：处理错误，返回合适的响应
func handleRequest(id int) string {
	name, err := GetUserProfile(id)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return "404 Not Found"
		}
		return "500 Internal Server Error"
	}
	return "200 OK: " + name
}

func main() {
	fmt.Println(handleRequest(1)) // 200 OK: 张三
	fmt.Println(handleRequest(0)) // 404 Not Found
}
\`\`\`

这个例子综合了：

- **自定义错误类型** \`DBError\` 携带操作类型和原始错误。
- **Unwrap 方法**让错误可被 \`errors.Is/As\` 检查。
- **哨兵错误** \`ErrUserNotFound\` 表达业务语义。
- **%w 包装**逐层添加上下文（数据库层 → 业务层 → HTTP 层）。
- **errors.Is** 在最顶层穿透包装链找到哨兵错误。

这是 Go 生产代码的标准错误处理架构。

### 十四、综合示例：可重试错误

\`\`\`go
package main

import (
	"errors"
	"fmt"
	"time"
)

var ErrTransient = errors.New("transient error")

type RetryableError struct {
	Err        error
	RetryAfter time.Duration
}

func (e *RetryableError) Error() string {
	return fmt.Sprintf("可重试: %v (建议等待 %v)", e.Err, e.RetryAfter)
}

func (e *RetryableError) Unwrap() error { return e.Err }

func CallAPI(attempt int) error {
	if attempt < 3 {
		return &RetryableError{
			Err:        ErrTransient,
			RetryAfter: 100 * time.Millisecond,
		}
	}
	return nil
}

func WithRetry(maxAttempts int, fn func(int) error) error {
	var lastErr error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		err := fn(attempt)
		if err == nil {
			return nil
		}

		var re *RetryableError
		if errors.As(err, &re) {
			fmt.Printf("第 %d 次尝试失败：%v，%v 后重试\\n", attempt, err, re.RetryAfter)
			time.Sleep(re.RetryAfter)
			lastErr = err
			continue
		}
		// 不可重试的错误，直接返回
		return err
	}
	return fmt.Errorf("重试 %d 次后仍失败: %w", maxAttempts, lastErr)
}

func main() {
	err := WithRetry(5, CallAPI)
	if err != nil {
		fmt.Println("最终失败：", err)
	} else {
		fmt.Println("成功")
	}
}
\`\`\`

### 十五、综合示例：错误聚合

\`\`\`go
package main

import (
	"fmt"
	"strings"
)

// 多错误聚合
type MultiError struct {
	Errors []error
}

func (m *MultiError) Add(err error) {
	if err != nil {
		m.Errors = append(m.Errors, err)
	}
}

func (m *MultiError) Error() string {
	if len(m.Errors) == 0 {
		return "no errors"
	}
	if len(m.Errors) == 1 {
		return m.Errors[0].Error()
	}
	msgs := make([]string, len(m.Errors))
	for i, e := range m.Errors {
		msgs[i] = fmt.Sprintf("  %d. %v", i+1, e)
	}
	return fmt.Sprintf("%d 个错误:\\n%s", len(m.Errors), strings.Join(msgs, "\\n"))
}

func (m *MultiError) HasErrors() bool {
	return len(m.Errors) > 0
}

func ValidateUser(name, email string, age int) error {
	var m MultiError

	if name == "" {
		m.Add(fmt.Errorf("名字不能为空"))
	}
	if len(name) > 50 {
		m.Add(fmt.Errorf("名字过长"))
	}
	if email == "" {
		m.Add(fmt.Errorf("邮箱不能为空"))
	}
	if !strings.Contains(email, "@") {
		m.Add(fmt.Errorf("邮箱格式不正确"))
	}
	if age < 0 || age > 150 {
		m.Add(fmt.Errorf("年龄 %d 不合法", age))
	}

	if m.HasErrors() {
		return &m
	}
	return nil
}

func main() {
	err := ValidateUser("", "invalid-email", 200)
	fmt.Println(err)
	// 4 个错误:
	//   1. 名字不能为空
	//   2. 邮箱格式不正确
	//   3. 年龄 200 不合法
}
\`\`\`

### 十六、错误处理设计模式

错误处理是软件设计的关键部分，这里总结几种常见模式。

#### 1. 错误传播模式（Pass-Through）

最简单的模式——下层返回错误，上层原样返回，只在最顶层处理：

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func ReadFile(path string) ([]byte, error) {
	return os.ReadFile(path) // 直接返回错误
}

func ParseConfig(path string) (map[string]string, error) {
	data, err := ReadFile(path)
	if err != nil {
		return nil, err // 原样传播
	}
	_ = data
	return map[string]string{}, nil
}

func main() {
	cfg, err := ParseConfig("/nonexistent.yaml")
	if err != nil {
		fmt.Println("配置加载失败：", err)
		return
	}
	fmt.Println(cfg)
}
\`\`\`

#### 2. 错误包装模式（Wrap with Context）

每一层都包装错误添加上下文，方便定位问题：

\`\`\`go
package main

import (
	"fmt"
	"os"
)

func ReadConfig(path string) ([]byte, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件 %q: %w", path, err)
	}
	return data, nil
}

func LoadApp() error {
	_, err := ReadConfig("app.yaml")
	if err != nil {
		return fmt.Errorf("应用初始化: %w", err)
	}
	return nil
}

func main() {
	if err := LoadApp(); err != nil {
		fmt.Println(err)
		// 应用初始化: 读取配置文件 "app.yaml": open app.yaml: no such file or directory
	}
}
\`\`\`

#### 3. 错误转换模式（Translate）

把底层错误转换成业务错误，让上层不依赖底层实现：

\`\`\`go
package main

import (
	"errors"
	"fmt"
	"os"
)

var ErrConfigNotFound = errors.New("config not found")

func LoadConfig(path string) error {
	_, err := os.ReadFile(path)
	if err != nil {
		// 转换 os 错误为业务错误
		if errors.Is(err, os.ErrNotExist) {
			return ErrConfigNotFound
		}
		return fmt.Errorf("读取配置: %w", err)
	}
	return nil
}

func main() {
	err := LoadConfig("/nonexistent.yaml")
	if errors.Is(err, ErrConfigNotFound) {
		fmt.Println("使用默认配置")
	}
}
\`\`\`

#### 4. 错误降级模式（Fallback）

遇到错误时降级到默认行为，不让错误中断流程：

\`\`\`go
package main

import (
	"errors"
	"fmt"
	"os"
)

func LoadConfigOrDefault(path, defaultConfig string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		// 错误时降级到默认值
		fmt.Println("警告：使用默认配置")
		return defaultConfig
	}
	return string(data)
}

func main() {
	config := LoadConfigOrDefault("/nonexistent.yaml", "default=true")
	fmt.Println("配置：", config)
}
\`\`\`

#### 5. 错误重试模式（Retry）

对临时性错误自动重试，提高可用性：

\`\`\`go
package main

import (
	"errors"
	"fmt"
	"time"
)

var ErrTemporary = errors.New("temporary error")

func CallService(attempt int) (string, error) {
	if attempt < 3 {
		return "", ErrTemporary
	}
	return "success", nil
}

func CallWithRetry(maxAttempts int) (string, error) {
	var lastErr error
	for i := 1; i <= maxAttempts; i++ {
		result, err := CallService(i)
		if err == nil {
			return result, nil
		}
		if !errors.Is(err, ErrTemporary) {
			return "", err // 非临时错误，直接返回
		}
		lastErr = err
		time.Sleep(time.Duration(i) * 100 * time.Millisecond) // 退避
	}
	return "", fmt.Errorf("重试 %d 次后仍失败: %w", maxAttempts, lastErr)
}

func main() {
	result, err := CallWithRetry(5)
	if err != nil {
		fmt.Println("失败：", err)
		return
	}
	fmt.Println("结果：", result)
}
\`\`\`

### 十七、错误与日志策略

错误处理要配合合理的日志策略。

#### 1. 只在顶层记录详细日志

\`\`\`go
package main

import (
	"fmt"
	"log"
)

type Service struct{}

func (s Service) DoWork(id int) error {
	if id <= 0 {
		return fmt.Errorf("invalid id: %d", id)
	}
	// 不在这里 log
	return nil
}

func main() {
	var s Service
	for _, id := range []int{1, 0, -1} {
		if err := s.DoWork(id); err != nil {
			// 只在顶层记录详细日志
			log.Printf("处理 id=%d 失败: %v", id, err)
			continue
		}
		fmt.Println("成功处理", id)
	}
}
\`\`\`

#### 2. 错误分类记录

不同类型的错误用不同的日志级别：

\`\`\`go
package main

import (
	"errors"
	"fmt"
	"log"
)

var (
	ErrWarning  = errors.New("warning")
	ErrCritical = errors.New("critical")
)

func Process(input string) error {
	if input == "" {
		return ErrWarning
	}
	if input == "fatal" {
		return ErrCritical
	}
	return nil
}

func main() {
	err := Process("fatal")
	switch {
	case errors.Is(err, ErrWarning):
		log.Printf("[WARN] %v", err)
	case errors.Is(err, ErrCritical):
		log.Printf("[FATAL] %v", err)
	case err != nil:
		log.Printf("[ERROR] %v", err)
	default:
		fmt.Println("OK")
	}
}
\`\`\`

#### 3. 结构化日志

生产环境推荐用 \`log/slog\`（Go 1.21+）做结构化日志，方便后续查询：

\`\`\`go
package main

import (
	"errors"
	"log/slog"
)

var ErrNotFound = errors.New("not found")

func findUser(id int) error {
	if id == 0 {
		return ErrNotFound
	}
	return nil
}

func main() {
	err := findUser(0)
	if err != nil {
		slog.Error("查询用户失败",
			slog.Int("user_id", 0),
			slog.String("error", err.Error()),
		)
	}
}
\`\`\`

结构化日志输出 JSON 格式，便于 ELK、Loki 等日志系统收集查询。

### 十八、错误处理在大型项目中的实践

#### 1. 错误类型分层

大型项目通常按"领域"定义错误类型：

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

// 领域层错误
type DomainError struct {
	Domain string // "user", "order", "payment"
	Code   string
	Err    error
}

func (e *DomainError) Error() string {
	return fmt.Sprintf("[%s.%s] %v", e.Domain, e.Code, e.Err)
}

func (e *DomainError) Unwrap() error { return e.Err }

// 各领域的哨兵错误
var (
	ErrUserNotFound   = &DomainError{Domain: "user", Code: "NOT_FOUND", Err: errors.New("user not found")}
	ErrUserExists     = &DomainError{Domain: "user", Code: "EXISTS", Err: errors.New("user already exists")}
	ErrOrderInvalid   = &DomainError{Domain: "order", Code: "INVALID", Err: errors.New("invalid order")}
	ErrPaymentFailed  = &DomainError{Domain: "payment", Code: "FAILED", Err: errors.New("payment failed")}
)

func CreateUser(name string) error {
	if name == "" {
		return ErrUserExists
	}
	return nil
}

func main() {
	err := CreateUser("")
	var de *DomainError
	if errors.As(err, &de) {
		fmt.Printf("领域：%s，错误码：%s\\n", de.Domain, de.Code)
	}
}
\`\`\`

#### 2. HTTP 层错误转换

HTTP handler 通常把业务错误转换成 HTTP 状态码：

\`\`\`go
package main

import (
	"errors"
	"fmt"
	"net/http"
)

var (
	ErrBadRequest   = errors.New("bad request")
	ErrUnauthorized = errors.New("unauthorized")
	ErrNotFound     = errors.New("not found")
	ErrInternal     = errors.New("internal server error")
)

func errorCode(err error) int {
	switch {
	case errors.Is(err, ErrBadRequest):
		return http.StatusBadRequest
	case errors.Is(err, ErrUnauthorized):
		return http.StatusUnauthorized
	case errors.Is(err, ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

func HandleGetUser(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "missing id", errorCode(ErrBadRequest))
		return
	}
	if id == "0" {
		http.Error(w, "user not found", errorCode(ErrNotFound))
		return
	}
	fmt.Fprintln(w, "user:", id)
}

func main() {
	http.HandleFunc("/user", HandleGetUser)
	fmt.Println("服务器启动...")
	_ = http.ListenAndServe(":8080", nil)
}
\`\`\`

#### 3. gRPC 风格错误码

如果用 gRPC，可以用 \`status\` 包传递错误码：

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

// 模拟 gRPC 错误码
const (
	CodeOK                 = 0
	CodeInvalidArgument    = 3
	CodeNotFound           = 5
	CodeAlreadyExists      = 6
	CodeInternal           = 13
)

type RPCError struct {
	Code    int
	Message string
}

func (e *RPCError) Error() string {
	return fmt.Sprintf("rpc error %d: %s", e.Code, e.Message)
}

func NewRPCError(code int, msg string) error {
	return &RPCError{Code: code, Message: msg}
}

func GetUser(id int) error {
	if id <= 0 {
		return NewRPCError(CodeInvalidArgument, "id must be positive")
	}
	if id == 0 {
		return NewRPCError(CodeNotFound, "user not found")
	}
	return nil
}

func main() {
	err := GetUser(-1)
	var rpcErr *RPCError
	if errors.As(err, &rpcErr) {
		fmt.Printf("错误码 %d: %s\\n", rpcErr.Code, rpcErr.Message)
	}
}
\`\`\`

#### 4. 错误的国际化

错误信息可能需要根据用户语言本地化：

\`\`\`go
package main

import (
	"errors"
	"fmt"
)

var ErrNotFound = errors.New("not found")

var messages = map[string]map[error]string{
	"zh": {
		ErrNotFound: "未找到资源",
	},
	"en": {
		ErrNotFound: "Resource not found",
	},
}

func LocalizeError(err error, lang string) string {
	if msgs, ok := messages[lang]; ok {
		if msg, ok := msgs[err]; ok {
			return msg
		}
	}
	return err.Error()
}

func main() {
	err := ErrNotFound
	fmt.Println(LocalizeError(err, "zh")) // 未找到资源
	fmt.Println(LocalizeError(err, "en")) // Resource not found
}
\`\`\`

### 十九、错误处理的常见反模式

#### 1. 用 panic 代替 error

\`\`\`go
// 不好：业务错误用 panic
func GetUser(id int) *User {
	if id == 0 {
		panic("user not found")
	}
	return &User{}
}

// 好：用 error 返回
func GetUser(id int) (*User, error) {
	if id == 0 {
		return nil, ErrNotFound
	}
	return &User{}, nil
}
\`\`\`

#### 2. 吞掉错误

\`\`\`go
// 不好：错误被丢弃
file, _ := os.Open("config.yaml")

// 好：处理或显式忽略
file, err := os.Open("config.yaml")
if err != nil {
	log.Println(err)
	return
}
defer file.Close()
\`\`\`

#### 3. 错误信息过少

\`\`\`go
// 不好：信息不足以定位
return errors.New("failed")

// 好：包含上下文
return fmt.Errorf("查询用户 %d 失败: %w", id, err)
\`\`\`

#### 4. 用字符串比较错误

\`\`\`go
// 不好：脆弱，错误信息一改就失效
if err.Error() == "not found" { ... }

// 好：用 errors.Is
if errors.Is(err, ErrNotFound) { ... }
\`\`\`

#### 5. 重复日志

\`\`\`go
// 不好：每层都 log，调用一次错误被记录 5 次
func A() error {
	if err := B(); err != nil {
		log.Println(err)
		return err
	}
	return nil
}

// 好：只在最顶层 log
func A() error {
	if err := B(); err != nil {
		return fmt.Errorf("A: %w", err)
	}
	return nil
}

func main() {
	if err := A(); err != nil {
		log.Println(err) // 只在这里 log 一次
	}
}
\`\`\`

### 二十、本章小结

- Go 的错误哲学：**错误是值，不是异常**。函数返回 \`error\`，调用方显式处理。
- \`error\` 是一个接口，只有一个 \`Error() string\` 方法。\`errors.New\` 和 \`fmt.Errorf\` 是基本创建方式。
- **错误包装 \`%w\`**（Go 1.13+）：保留原始错误，配合 \`errors.Is\` 和 \`errors.As\` 检查错误链。
- **自定义错误类型**可以携带丰富上下文（错误码、字段名、原始错误等）。实现 \`Unwrap\` 方法支持错误解包。
- **哨兵错误模式**：用包级 \`var ErrXxx = errors.New(...)\` 声明预定义错误，调用方用 \`errors.Is\` 检查。
- **panic/recover** 用于"不应该发生的情况"，不要用来代替业务错误返回。defer 在 panic 时仍会执行。
- **最佳实践**：错误要包装上下文、不要重复处理、不要忽略错误、哨兵错误与类型断言结合使用。
- **错误处理设计模式**：传播、包装、转换、降级、重试。
- **日志策略**：只在顶层记录、错误分类记录、结构化日志（\`log/slog\`）。
- **大型项目实践**：领域错误分层、HTTP 错误转换、gRPC 错误码、错误国际化。
- **context.Context** 与错误传播配合：\`context.Canceled\`、\`context.DeadlineExceeded\` 是标准库的哨兵错误。
- **并发错误处理**：用 channel 聚合多 goroutine 错误，或用 \`errgroup\` 简化。
- **避免反模式**：不要用 panic 代替 error、不要吞掉错误、不要用字符串比较、不要重复日志。`,
  },
];

export { chapters };
