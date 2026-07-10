export const chapters = [
  {
    id: "tsgen-constraint",
    icon: "🔒",
    group: "泛型进阶",
    title: "泛型约束（extends）：给类型加条件",
    content: `泛型约束是 TypeScript 中非常核心的特性，它让我们在保留泛型灵活性的同时，给类型参数加上结构化的条件限制，从而获得真正的类型安全。本节将系统讲解 extends 约束的用法。

一、没有约束时的问题

当我们定义一个泛型函数 function logLength<T>(arg: T): T 时，类型参数 T 代表任意类型。在函数体内部，编译器对 T 一无所知，所以几乎什么属性都不能访问。比如想读取 arg.length，编译器会直接报错，提示 T 上不存在 length 属性。这是合理的，因为 T 可能是 number、boolean 这些根本没有 length 的类型。

面对这种情况，初学者常常退而求其次改用 any，但这样就完全放弃了类型检查，后续所有操作都失去了保护，违背了使用 TypeScript 的初衷。下面这个例子展示了报错场景：

\`\`\`ts
function logLength<T>(arg: T): T {
  console.log(arg.length); // 报错：T 上不存在 length 属性
  return arg;
}
\`\`\`

二、extends 关键字的含义

TypeScript 借用 extends 关键字来给泛型加约束。这里 extends 的含义是"满足某种结构"，而不是面向对象里的"继承"。写 <T extends HasLength> 表示要求类型参数 T 必须满足 HasLength 这个结构，即必须包含 length: number 属性。加了约束之后，函数体内就能安全地访问 length 了：

\`\`\`ts
interface HasLength {
  length: number;
}
function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length); // 安全：编译器保证 T 一定有 length
  return arg;
}
\`\`\`

三、约束到接口

最推荐的做法是先定义一个接口作为约束条件，再让泛型参数 extends 这个接口。这样字符串、数组、以及任何带有 length 属性的自定义对象都能通过检查，而 number、boolean 会被拒绝。约束既保证了安全，又比 any 灵活得多。

四、约束到基本类型

除了约束到接口，还可以直接约束到基本类型或它们的联合。比如 <T extends number | string> 要求 T 只能是 number 或 string。这在写只处理数值或文本的通用函数时非常实用，可以挡住布尔值、对象等不相关的输入。

五、约束的传递性

约束具有传递性：如果 T extends U，而 U extends V，那么 T 也自动满足 V。这和数学中的传递关系一致，让我们能够构建层次化的约束体系，逐层收紧类型范围。

六、多重约束

当一个类型参数需要同时满足多个条件时，可以用交叉类型 <T extends A & B>，要求 T 同时具备 A 和 B 两个接口的全部属性。这在组合多种能力时很常用，比如要求一个对象既有 name 又有 age。

七、约束与 any 的本质区别

这是理解约束价值的关键所在。any 是放弃类型信息，编译器对 any 类型的值不做任何检查，相当于绕过了类型系统。而约束是保留类型信息：编译器知道 T 满足某个结构，既保证了访问安全，又保留了 T 的具体类型。比如 logLength 返回值类型仍然是原来的 T，而不是 any，后续操作依然有完整的类型保护。这就是约束优于 any 的根本原因。

下面通过完整代码示例来体会约束的威力。`,
    code: `// 泛型约束（extends）示例

// 1. 定义一个接口，作为约束条件
interface HasLength {
  length: number;
}

// 2. 泛型函数：要求 T 必须有 length 属性
function logLength<T extends HasLength>(arg: T): T {
  console.log("长度是: " + arg.length);
  return arg;
}

// 字符串有 length 属性，可以通过
const r1 = logLength("hello"); // 长度是: 5
console.log("r1 类型被保留: " + r1.toUpperCase());

// 数组有 length 属性，可以通过
const r2 = logLength([1, 2, 3]); // 长度是: 3
console.log("r2 长度: " + r2.length);

// 3. 约束到基本类型联合
function doubleIt<T extends number | string>(value: T): T {
  console.log("传入的值: " + value);
  return value;
}

doubleIt(42);     // 数字 OK
doubleIt("hi");   // 字符串 OK
// doubleIt(true); // 报错：boolean 不满足 number | string

// 4. 多重约束：同时满足两个接口
interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

// T 必须同时有 name 和 age
function describe<T extends HasName & HasAge>(obj: T): string {
  return obj.name + " 今年 " + obj.age + " 岁";
}

const person = { name: "小明", age: 18, hobby: "打球" };
console.log(describe(person)); // 小明 今年 18 岁

// 5. 对比：没有约束时的问题
// 下面这行会报错，因为 T 可能是任何类型（比如 number），没有 length
// function badLogLength<T>(arg: T): T {
//   console.log(arg.length); // 报错：Property 'length' does not exist on type 'T'
//   return arg;
// }

// 6. 约束 vs any 的区别
// 用 any：丢失类型信息，后续无法检查
function anyLog(arg: any): any {
  console.log("any 方式长度: " + arg.length);
  return arg;
}
const a1 = anyLog("abc");
// a1 是 any，编译器帮不了你检查后续操作

// 用约束：保留类型信息
const a2 = logLength("abc");
// a2 是 string，编译器知道它是字符串
console.log("约束方式结果: " + a2.toUpperCase());
`
  },
  {
    id: "tsgen-multi-params",
    icon: "🔗",
    group: "泛型进阶",
    title: "多类型参数与类型参数间约束",
    content: `当单个类型参数无法表达复杂的关系时，TypeScript 允许在同一个泛型中声明多个类型参数，并且让类型参数之间相互约束。本节讲解多类型参数的用法和经典模式。

一、多个独立类型参数

泛型可以同时声明多个类型参数，用逗号分隔，比如 <K, V>、<T, U, V>。最典型的例子是键值对函数 function pair<K, V>(key: K, value: V)，它接收两个可能不同类型的值，返回一个包含两者的对象。调用时编译器会分别推断 K 和 V 的类型，保证键和值的类型各自正确。

二、类型参数之间相互约束

类型参数之间可以相互约束，也就是一个类型参数 extends 另一个类型参数。比如 <T, U extends T> 表示 U 必须是 T 的子类型。这种写法不常见，但在某些需要建立类型层级关系的场景下很有用。

三、经典模式：copyFields

一个经典模式是 function copyFields<T extends U, U>(target: T, source: U): T，它把 source 的属性复制到 target 上。这里 T extends U 保证 target 的类型包含 source 的所有属性，从而可以安全地做覆盖。这种"被约束参数在前、约束源在后"的顺序是约定俗成的写法。

四、keyof 约束：类型安全的属性访问

更常用的是 keyof 约束模式：function get<T, K extends keyof T>(obj: T, key: K): T[K]。这里 K extends keyof T 表示 K 必须是 T 的某个属性名。这样调用时传入不存在的属性名会直接报错，而且返回值类型 T[K] 会被精确推断为该属性对应的类型。比如对 { id: number; name: string } 访问 name 返回 string，访问 id 返回 number。

\`\`\`ts
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
\`\`\`

五、类型参数的顺序约定

当类型参数之间存在约束关系时，约定把"被约束的参数"放在前面，"约束源"放在后面。比如 <T extends U, U> 中 T 在前、U 在后。这看起来和声明顺序直觉相反，但这是为了让调用时的类型推断更自然，编译器能从实参推断出 U，再据此检查 T。

六、多类型参数的命名建议

单字母类型参数（T、U、V、K）在简单场景下很方便，但当参数较多时容易混淆。建议在复杂场景使用有意义的名字，比如 KeyType、ValueType、TargetType、SourceType，这样代码可读性会好很多，维护者也更容易理解每个参数的意图。

下面通过代码示例演示这些模式。`,
    code: `// 多类型参数与类型参数间约束

// 1. 多个独立类型参数
function pair<K, V>(key: K, value: V): { key: K; value: V } {
  return { key: key, value: value };
}

const p1 = pair("name", "小明");
console.log(p1.key + " = " + p1.value); // name = 小明

const p2 = pair("age", 18);
console.log(p2.key + " = " + p2.value); // age = 18

// 2. 类型安全的属性访问：keyof 约束
interface User {
  id: number;
  name: string;
  email: string;
}

// K extends keyof T：K 必须是 T 的某个属性名
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { id: 1, name: "小明", email: "xm@example.com" };

// 返回类型会被正确推断为 string
const userName = getProperty(user, "name");
console.log("用户名: " + userName);

// 返回类型会被正确推断为 number
const userId = getProperty(user, "id");
console.log("用户ID: " + userId);

// getProperty(user, "phone"); // 报错："phone" 不是 User 的属性

// 3. copyFields 模式：从 source 复制属性到 target
// T extends U：要求 target 的类型包含 source 的所有属性
function copyFields<T extends U, U>(target: T, source: U): T {
  const result = Object.assign({}, target, source);
  return result;
}

const base = { id: 1, name: "小明", email: "xm@example.com" };
const update = { name: "小红" };

const updated = copyFields(base, update);
console.log("更新后名字: " + updated.name); // 小红
console.log("更新后ID: " + updated.id);     // 1（不变）

// 4. 多类型参数命名建议：用有意义的名字
function createMap<KeyType, ValueType>(entries: Array<[KeyType, ValueType]>) {
  const map: Record<string, ValueType> = {};
  for (const entry of entries) {
    const k = entry[0];
    const v = entry[1];
    map[String(k)] = v;
  }
  return map;
}

const myMap = createMap([["a", 1], ["b", 2]]);
console.log("map.a = " + myMap.a); // 1
console.log("map.b = " + myMap.b); // 2
`
  },
  {
    id: "tsgen-default",
    icon: "⚙️",
    group: "泛型进阶",
    title: "默认类型参数：让泛型更易用",
    content: `默认类型参数让泛型在常见场景下用起来更简洁，只在少数需要自定义的情况下才显式传入类型。本节讲解默认类型参数的语法、使用场景和规则。

一、默认类型参数语法

TypeScript 允许给类型参数指定默认值，语法是 <T = string> 或 <T, E = Error>。当调用时不传入该类型参数，编译器就使用默认值。这和函数参数的默认值思想一致，目的是降低使用成本。

二、默认类型的使用场景

很多时候一个泛型在大多数使用场景下类型是固定的，只有少数情况需要自定义。比如一个 Result<T, E> 类型，绝大多数情况下错误就是标准的 Error，只有特定业务才需要自定义错误类型。这时给 E 一个默认值 Error，大多数地方写 Result<string> 就够了，需要时再写 Result<string, MyError>，既简洁又灵活。

三、Result<T, E = Error> 模式

这是默认类型参数最经典的应用。Result 表示一个可能成功也可能失败的操作结果，T 是成功时的数据类型，E 是失败时的错误类型。把 E 默认设为 Error，符合大多数场景的预期，需要自定义错误时再覆盖。这种模式在异步操作、错误处理中非常常见。

\`\`\`ts
interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}
\`\`\`

四、默认类型可以引用前面的类型参数

默认值不仅能是具体类型，还能引用前面的类型参数。比如 <T, U = T[]> 表示 U 默认是 T 的数组。这样写 List<number> 时 U 自动是 number[]，写 List<number, Set<number>> 时 U 就是 Set<number>。这种"基于前一个参数推导默认值"的能力让泛型组合更强大。

五、默认类型参数的规则

和函数默认参数一样，有默认值的类型参数必须放在没有默认值的参数后面。也就是说 <T, U = T[]> 是合法的，而 <U = number, T> 是非法的。这是因为类型参数是按位置匹配的，有默认值的放后面才不会产生歧义。

六、与函数默认值的类比

理解默认类型参数，可以类比 JavaScript 的函数默认参数。函数 function greet(name, greeting = "你好") 中 greeting 有默认值，调用时可以省略；类似地，interface Box<T, U = T[]> 中 U 有默认值，使用时可以省略。两者在思路上完全一致，只是一个是值层面的默认，一个是类型层面的默认。

七、Response<T = any> 的取舍

有时会用 <T = any> 作为默认值，比如通用的 API 响应类型。这在快速原型阶段很方便，但要注意 any 会削弱类型安全。更好的做法是给一个合理的具体默认类型，或者干脆不设默认值、强制调用方明确指定，以避免类型信息悄悄流失。

下面通过代码示例体会默认类型参数的便利。`,
    code: `// 默认类型参数

// 1. Result<T, E = Error>：默认错误类型是 Error
interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// 不传 E，默认用 Error
const r1: Result<string> = {
  success: true,
  data: "操作成功"
};
console.log("r1: " + r1.data);

// 传 E，自定义错误类型
interface MyError {
  code: number;
  message: string;
}

const r2: Result<string, MyError> = {
  success: false,
  error: { code: 404, message: "找不到资源" }
};
console.log("r2 错误码: " + r2.error.code);
console.log("r2 错误信息: " + r2.error.message);

// 2. 默认类型可以引用前面的类型参数
// List<T, U = T[]>：U 默认是 T 的数组
interface List<T, U = T[]> {
  items: U;
  count: number;
}

// 不传 U，默认 T[]
const list1: List<number> = {
  items: [1, 2, 3],
  count: 3
};
console.log("list1: " + list1.items.join(","));

// 传 U，自定义容器类型
const list2: List<number, Set<number>> = {
  items: new Set([1, 2, 3]),
  count: 3
};
console.log("list2 大小: " + list2.items.size);

// 3. Response<T = any>：默认 any
interface ApiResponse<T = any> {
  status: number;
  body: T;
}

// 不传 T，body 是 any
const resp1: ApiResponse = { status: 200, body: "ok" };
console.log("resp1: " + resp1.body);

// 传 T，body 是具体类型
const resp2: ApiResponse<{ id: number }> = {
  status: 200,
  body: { id: 100 }
};
console.log("resp2 id: " + resp2.body.id);

// 4. 默认参数必须放后面（类似函数默认参数）
// 正确：有默认值的在后面
// interface Good<T, U = T[]> { ... }
// 错误：有默认值的不能在前面
// interface Bad<U = number, T> { ... } // 编译报错

// 5. 与函数默认值的类比
function greet(name: string, greeting: string = "你好"): string {
  return greeting + "，" + name + "！";
}
console.log(greet("小明"));        // 你好，小明！
console.log(greet("小明", "嗨"));   // 嗨，小明！
`
  },
  {
    id: "tsgen-inference",
    icon: "🎯",
    group: "泛型进阶",
    title: "类型推断：编译器如何猜出类型",
    content: `类型推断是 TypeScript 让泛型用起来不那么繁琐的关键能力。大多数情况下我们不需要手动写出类型参数，编译器会根据上下文自动推断。本节讲解推断的规则和何时应该显式指定类型。

一、类型推断的场景

调用泛型函数时，如果不写类型参数，TypeScript 会根据传入的实参自动推断类型参数的值。比如调用 identity(42)，编译器看到实参是 42，就推断 T 是 number。这种推断让我们写代码时几乎感觉不到泛型的存在，既简洁又安全。

二、推断规则：从函数参数推断

最基本的推断规则是从函数实参推断类型参数。编译器会扫描传入的参数，把它们的类型"填充"到对应的类型参数位置。如果函数有多个参数都涉及同一个类型参数 T，编译器会综合所有参数的信息来确定 T。

三、最佳公共类型推断

当推断一个数组的元素类型时，编译器会寻找能同时容纳所有元素的"最佳公共类型"。比如 [1, 2, 3] 全是数字，推断为 number[]；而 [1, "a", 2] 既有数字又有字符串，会推断为 (number | string)[]。这个"最佳公共类型"是所有元素类型的超集，保证每个元素都能放进去。

四、推断失败的情况

有时编译器无法推断出类型参数，比如传入一个空数组 []，没有任何元素信息可供推断。这时编译器会回退到 unknown[]、never[] 或 any，具体取决于上下文和配置。推断失败往往意味着类型信息不足，后续操作可能不安全，需要开发者留意。

\`\`\`ts
// 空数组无法推断元素类型
const empty = [];
// empty 的元素类型可能是 never[] 或 any[]
\`\`\`

五、何时应该显式指定

大部分情况下推断是准确的，但有些场景需要显式指定类型参数。第一种是推断不准确或过于宽泛，比如想用一个字符串解析出数字，编译器无法从字符串参数推断出数字返回值。第二种是上下文信息不足，比如空数组、回调函数嵌套较深时。第三种是想要比推断结果更具体的类型。这些情况下手动写 <number> 等类型参数更安全。

六、推断与约束的配合

推断和约束是配合工作的：编译器先根据实参推断类型参数，再检查推断结果是否满足约束条件。如果推断出的类型不满足约束，会报错。比如调用一个 <T extends HasLength> 的函数时传入了 number，编译器先推断 T 是 number，再检查 number 是否满足 HasLength，发现没有 length 属性，于是报错。整个过程是先推断、后检查。

七、从上下文类型推断

除了从函数参数推断，TypeScript 还能从变量类型注解反向推断字面量。比如 const point: Point = { x: 10, y: 20 }，编译器根据 Point 的结构检查字面量是否匹配，这也是一种推断。上下文类型推断让赋值、回调参数等场景都能获得类型保护。

下面通过代码示例观察推断的过程。`,
    code: `// 类型推断

// 1. 从函数参数推断类型参数
function identity<T>(value: T): T {
  return value;
}

// 不写 <number>，TS 从参数 42 推断 T 是 number
const a = identity(42);
console.log("a = " + a + "，类型被推断为 number");

// 不写 <string>，TS 从参数 "hi" 推断 T 是 string
const b = identity("hi");
console.log("b = " + b + "，类型被推断为 string");

// 2. 最佳公共类型推断
// 数字数组：推断为 number[]
const nums = [1, 2, 3];
console.log("nums 是 number[]: " + nums.join(","));

// 混合类型：推断为 (number | string)[]
const mixed = [1, "a", 2, "b"];
console.log("mixed 长度: " + mixed.length);

// 3. 推断失败的情况
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// 空数组无法推断元素类型，需要显式标注
const empty: number[] = [];
const first = getFirst(empty);
console.log("空数组第一个: " + first);

// 4. 何时应该显式指定类型
// 场景：推断不准确时
function parseValue<T>(input: string): T {
  // 这里只是演示，实际不会这样写
  return input as unknown as T;
}

// 显式指定 T 为 number，否则会被推断为 unknown
const num = parseValue<number>("123");
console.log("显式指定为 number: " + num);

// 5. 推断与约束的配合：先推断，再检查约束
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(function (item) {
    return item.id === id;
  });
}

const users = [
  { id: 1, name: "小明" },
  { id: 2, name: "小红" }
];

// TS 推断 T 为 { id: number; name: string }，并检查它满足 HasId
const found = findById(users, 2);
console.log("找到用户: " + (found ? found.name : "无"));

// 6. 从上下文类型推断（赋值时）
interface Point {
  x: number;
  y: number;
}

// 根据变量类型注解检查字面量
const point: Point = { x: 10, y: 20 };
console.log("point: (" + point.x + ", " + point.y + ")");
`
  },
  {
    id: "tsgen-keyof",
    icon: "🔑",
    group: "泛型进阶",
    title: "keyof 操作符：类型安全的属性名",
    content: `keyof 是 TypeScript 中一个非常强大的类型操作符，它能从一个类型中提取所有键，组成一个联合类型。结合泛型，keyof 可以实现真正类型安全的属性访问。本节系统讲解 keyof 的用法。

一、keyof 的本质

keyof 的本质是"获取一个类型的所有键的联合类型"。对一个对象类型使用 keyof，会得到它所有属性名的字面量联合。这是在类型层面做运算，不是运行时的操作，完全由编译器处理。

二、keyof Person 的含义

假设有 interface Person { name: string; age: number; city: string }，那么 keyof Person 的结果就是 "name" | "age" | "city" 这三个字符串字面量的联合类型。任何声明为 keyof Person 的变量，只能赋值为这三个字符串之一，写别的字符串会报错。这就把"属性名"也纳入了类型检查。

\`\`\`ts
interface Person {
  name: string;
  age: number;
  city: string;
}
type PersonKeys = keyof Person; // "name" | "age" | "city"
\`\`\`

三、keyof 与泛型结合

keyof 最强大的用法是和泛型组合：<T, K extends keyof T>。这里 K 被约束为 T 的某个属性名，于是函数 get<T, K extends keyof T>(obj: T, key: K) 既能保证 key 是合法属性名，又能让返回值类型精确为 T[K]。调用 get(person, "age") 时，编译器知道返回值是 number；调用 get(person, "name") 时知道返回值是 string。拼错属性名会在编译期直接报错，而不是等到运行时返回 undefined。

四、Partial 的实现原理

keyof 还是映射类型的基础。以常用的 Partial<T>（把所有属性变成可选）为例，它的实现原理是 { [K in keyof T]?: T[K] }。这里 keyof T 遍历 T 的每个键，T[K] 取出每个键对应的类型，问号让每个属性变可选。这是 keyof 配合映射类型实现类型转换的经典模式，后续会专门讲解映射类型。

五、keyof 对数组

对数组类型使用 keyof 会有点出乎意料：keyof number[] 不仅包含数字索引，还包含 push、pop、map、length 等所有数组方法和属性的名称。因为数组本质上也是一个对象，它的键既包括索引，也包括方法名。所以在对数组用 keyof 时要注意这个特点。

六、keyof 对基本类型

对基本类型使用 keyof 同样会得到它的方法名联合。比如 keyof string 包含 charAt、length、split、toUpperCase 等等。这反映了"字符串也是一个对象，有方法可调用"的事实。虽然实际中很少直接对基本类型用 keyof，但了解这一点有助于理解 keyof 的工作机制。

七、实用模式：类型安全的工具函数

结合 keyof 可以实现一批类型安全的工具函数：get 函数安全地读取属性，set 函数安全地设置属性（值的类型会被检查），pick 函数安全地挑选部分属性。这些函数的妙处在于：属性名和值类型都在编译期被检查，拼错名字或传错类型都会立即报错，而不是留到运行时才发现。

下面通过代码示例演示 keyof 的各种用法。`,
    code: `// keyof 操作符

// 1. 定义 Person 接口
interface Person {
  name: string;
  age: number;
  city: string;
}

// keyof Person 等价于 "name" | "age" | "city"
type PersonKeys = keyof Person;
// PersonKeys 的类型是 "name" | "age" | "city"

// 演示：只能赋值为这三个字符串之一
const k: PersonKeys = "name";
console.log("PersonKeys 的值: " + k);

// 2. 类型安全的属性访问
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person: Person = { name: "小明", age: 18, city: "北京" };

// 返回类型自动推断为 string
const personName = get(person, "name");
console.log("姓名: " + personName);

// 返回类型自动推断为 number
const personAge = get(person, "age");
console.log("年龄: " + personAge);

// get(person, "phone"); // 报错："phone" 不是 Person 的属性

// 3. 类型安全的属性设置
function set<T, K extends keyof T>(obj: T, key: K, value: T[K]): T {
  const copy = Object.assign({}, obj);
  copy[key] = value;
  return copy;
}

// value 的类型会被检查：age 必须是 number
const updated = set(person, "age", 20);
console.log("更新后年龄: " + updated.age);

// set(person, "age", "二十"); // 报错："二十" 不是 number

// 4. 简单的 pick：挑选部分属性
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: any = {};
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

// 只挑出 name 和 city
const subset = pick(person, ["name", "city"]);
console.log("picked name: " + subset.name);
console.log("picked city: " + subset.city);

// 5. keyof 对数组：包含数组方法名
const arr = [1, 2, 3];
// keyof typeof arr 包含 "length", "push", "pop", "map" 等
console.log("数组长度: " + arr.length);
console.log("数组求和: " + arr.reduce(function (a, b) { return a + b; }, 0));

// 6. keyof 对基本类型
// keyof string 包含字符串方法名，如 "charAt", "length" 等
const str = "hello";
console.log("字符串长度: " + str.length);
console.log("第一个字符: " + str.charAt(0));

// 7. Partial 的实现原理（预告映射类型）
// Partial<T> 相当于 { [K in keyof T]?: T[K] }
type PartialPerson = Partial<Person>;
// 现在 name、age、city 都是可选的

const partialPerson: PartialPerson = { name: "小红" };
console.log("partialPerson: " + JSON.stringify(partialPerson));
`
  }
];
