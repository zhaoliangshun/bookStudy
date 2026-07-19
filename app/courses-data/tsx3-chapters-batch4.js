// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第四批章节
// -------------------------------------------------------------
// 覆盖：第二部分 TypeScript 类型进阶 下半
// 包含 4 个章节：ch15 ~ ch18
//
// 章节范围：
//   - ch15 条件类型与 infer（T extends U ? X : Y、infer 提取数组元素/函数返回值/Promise 泛型）
//   - ch16 映射类型与键重映射（{[K in keyof T]: ...}、as 子句、+/- 修饰符、Partial/Pick 底层）
//   - ch17 模板字面量类型（模板字符串作为类型、4 个变换工具、getter/setter/CSS 属性推导）
//   - ch18 模块声明与 tsconfig（.d.ts、declare module、namespace、tsconfig 完整配置、path mapping）
//
// 风格沿用第一批：
//   - 每章从"为什么讲这个"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 每章至少 1 个 React 组件 demo
//   - 语言简洁生动，章节末尾必带"避坑清单"
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch15: 条件类型与 infer
  // ============================================================
  {
    id: "tsx3-ch15",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🎯",
    title: "ch15 条件类型与 infer",
    content: `# ch15 条件类型与 infer

## 为什么讲这个

到这一章为止，你已经能用泛型写出"通用函数"。但有些场景泛型 alone 搞不定：

- 给我一个 \`Promise<T>\`，我想自动拿到 \`T\`
- 给我一个函数 \`(a: string) => number\`，我想自动拿到返回值 \`number\`
- 给我一个数组 \`string[]\`，我想自动拿到元素类型 \`string\`

这些"从大类型里拆出小类型"的需求，正是**条件类型 + infer** 的主场。事实上，TypeScript 内置的 \`ReturnType\`、\`Parameters\`、\`Awaited\` 全靠这一套实现。掌握它，你就能写出"会自己推断类型"的高级工具类型。

## 1. 条件类型基本语法

条件类型长得像三元表达式：

\`\`\`ts
// 语法：T extends U ? X : Y
// 读作：如果 T 能赋给 U，结果是 X，否则是 Y
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;             // true
type B = IsString<42>;                  // false
type C = IsString<string | number>;     // boolean —— 联合类型会"分布式"展开
\`\`\`

注意最后一行：当 T 是联合类型时，条件类型会**分布式**计算——对每个成员分别判断，再把结果联合起来。

\`\`\`ts
// 分布式的展开过程
type IsStringResult = IsString<string | number>;
// 第 1 步：对 string 判断 -> true
// 第 2 步：对 number 判断 -> false
// 第 3 步：把两个结果联合 -> true | false
// 第 4 步：化简为 boolean
\`\`\`

## 2. 用条件类型做"类型过滤"

经典的"从联合类型里筛掉某些成员"：

\`\`\`ts
// 排除 null 和 undefined：实现一个简易版 NonNullable
type MyNonNullable<T> = T extends null | undefined ? never : T;

type R = MyNonNullable<string | null | number | undefined>;
// 分布式：对 string -> string，对 null -> never，对 number -> number，对 undefined -> never
// 联合后：string | never | number | never
// never 在联合里会自动消失，最终：string | number
\`\`\`

\`never\` 是这里的灵魂：它在联合类型里会自动消失，所以 \`true | never\` 化简为 \`true\`，相当于"过滤"。

## 3. 禁用分布式：用方括号包起来

有时候你不希望分布式展开（比如 T 可能是 \`any\` 或本身就是一个整体联合），用方括号禁用：

\`\`\`ts
// 不加方括号：分布式
type Distributed<T> = T extends string ? "yes" : "no";
type R1 = Distributed<string | number>;        // "yes" | "no"

// 加方括号：把 T 当成一个整体判断
type NonDistributed<T> = [T] extends [string] ? "yes" : "no";
type R2 = NonDistributed<string | number>;     // "no" —— 整体不能赋给 string
\`\`\`

实战里 \`isAny\` 检测就靠这一招：

\`\`\`ts
// 检测 T 是不是 any（any 在分布式里会穿透，所以要禁用分布）
type IsAny<T> = [T] extends [never] ? false : true;
type R = IsAny<any>;    // true
type R2 = IsAny<string>; // false
\`\`\`

## 4. infer 关键字：从类型里"抠"出东西

光有条件判断还不够，很多时候你要"提取"类型的一部分。 \`infer\` 就是干这个的——它在 extends 子句里"声明一个待推断的类型变量"。

\`\`\`ts
// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;

type R1 = ElementOf<string[]>;              // string
type R2 = ElementOf<number[]>;              // number
type R3 = ElementOf<(string | number)[]>;   // string | number
\`\`\`

读法：如果 \`T\` 能赋给"某个数组 \`(infer E)[]\`"，就把元素类型记为 \`E\`，返回 \`E\`。 \`infer E\` 类似于"在这里挖一个叫 E 的坑，让 TS 帮我填"。

## 5. 提取函数返回值：ReturnType 的底层

\`\`\`ts
// 内置 ReturnType 的简化实现
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type R = MyReturnType<() => string>;             // string
type R2 = MyReturnType<(x: number) => boolean>;  // boolean
type R3 = MyReturnType<typeof JSON.parse>;       // any（JSON.parse 的返回值就是 any）
\`\`\`

读法：如果 \`T\` 能赋给"任意参数、返回 \`infer R\` 的函数"，就把返回值类型记为 \`R\`，返回 \`R\`。

## 6. 提取函数参数：Parameters 的底层

\`\`\`ts
// 提取参数元组
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type P = MyParameters<(a: string, b: number) => void>;
// [string, number] —— 一个元组类型
\`\`\`

参数被推断成元组而不是数组，因为参数个数是固定的。这就是为什么 \`Parameters\` 返回 \`[string, number]\` 而不是 \`string[]\`。

## 7. 提取 Promise 的泛型参数：Awaited

\`\`\`ts
// 递归剥 Promise，直到不是 Promise 为止
type Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;

type R1 = Unwrap<Promise<string>>;                  // string
type R2 = Unwrap<Promise<Promise<Promise<number>>>; // number —— 递归剥到底
type R3 = Unwrap<string>;                           // string —— 不是 Promise 直接返回
\`\`\`

这就是内置 \`Awaited\` 类型的核心思路。 \`async/await\` 表达式的返回值类型自动 unwrap 就是靠它。

## 8. 多个 infer 同时抠

\`\`\`ts
// 同时抠出函数第一个参数和返回值
type FirstArgAndReturn<T> = T extends (a: infer A, ...rest: any[]) => infer R
  ? { firstArg: A; returnValue: R }
  : never;

type R = FirstArgAndReturn<(x: number, y: string) => boolean>;
// { firstArg: number; returnValue: boolean }
\`\`\`

一个 extends 子句里可以同时 \`infer\` 多个类型，结果一起返回。

## 9. infer 的约束（TS 4.7+）

\`\`\`ts
// 用 extends 给 infer 出的类型加约束
type FirstString<T> = T extends [infer F extends string, ...any[]] ? F : never;

type R1 = FirstString<["hello", 1, 2]>;  // "hello"
type R2 = FirstString<[1, 2, 3]>;        // never —— 第一个不是 string，落到 else 分支
\`\`\`

\`infer F extends string\` 表示"挖一个坑，但它必须是 string 子类型"。约束让 infer 更精确，避免挖出过宽的类型。

## 10. React 场景：useAsync Hook 的自动类型推导

下面这个 Hook 接受一个返回 Promise 的函数，自动推导出 \`data\` 的类型，调用方无需手动标注。

\`\`\`tsx
import React from "react";

// 用条件类型 + infer 自动剥 Promise 的内层类型
type Unwrap<T> = T extends Promise<infer U> ? U : T;

// Hook 入参约束：必须是一个返回 Promise 的函数
type AsyncFn = () => Promise<unknown>;

function useAsync<T extends AsyncFn>(fn: T) {
  // state 的 data 字段类型：Unwrap<ReturnType<T>> | null
  // ReturnType<T> 拿到函数返回值，Unwrap 再剥掉 Promise
  const [state, setState] = React.useState<{
    data: Unwrap<ReturnType<T>> | null;  // 关键：自动推断 data 类型
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    let cancelled = false;                  // 防止卸载后还 setState
    setState(s => ({ ...s, loading: true }));
    fn()
      .then(data => {
        if (!cancelled) {
          // 这里 data 是 unknown，需要断言成具体类型
          setState({ data: data as Unwrap<ReturnType<T>>, loading: false, error: null });
        }
      })
      .catch(error => {
        if (!cancelled) setState(s => ({ ...s, loading: false, error }));
      });
    return () => { cancelled = true; };
  }, [fn]);

  return state;
}

// 使用：fn 返回 Promise<{ id; name }[]>，data 自动是那个数组类型
function UserList() {
  const { data, loading, error } = useAsync(async () => {
    const res = await fetch("/api/users");
    // 注意：res.json() 返回 Promise<any>，这里断言到精确类型
    return res.json() as Promise<{ id: number; name: string }[]>;
  });

  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错了：{error.message}</div>;
  // data 是 { id; name }[] | null，但前面 return 后 TS 知道不是 null
  // 用 ! 非空断言告诉 TS 这里一定有值
  return (
    <ul>
      {data!.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
\`\`\`

重点看 \`Unwrap<ReturnType<T>>\` 这一行：它把"返回 \`Promise<User[]>\` 的函数"自动剥成 \`User[]\`。调用方完全不用显式标注 \`data\` 的类型，TS 全帮你推。

## 小结

- 条件类型 \`T extends U ? X : Y\` 像三元表达式，对联合类型会"分布式"计算。
- 用方括号 \`[T] extends [U]\` 可以禁用分布式，常用在 \`isAny\` 这种检测。
- \`never\` 在联合类型里会自动消失，是"过滤"的利器。
- \`infer\` 用于从大类型里抠出小类型，是 \`ReturnType\`/\`Parameters\`/\`Awaited\` 的核心。
- 多个 \`infer\` 可以同时抠；TS 4.7+ 还能给 infer 加约束。

## 避坑清单

- ❌ 在条件类型里写 \`T extends string\` 却忘了联合类型会分布式计算（要么用 \`[T] extends [string]\` 禁用分布）
- ❌ 试图用 \`infer\` 提取不可推断的位置（infer 只能写在 extends 子句的"类型位置"上，不能写在函数体里）
- ❌ 用 \`any\` 代替 \`infer\`（看似省事，实则丢失了类型推导能力）
- ❌ 递归 infer 不设终止条件（递归剥 Promise 必须有"非 Promise 分支"作为出口）

下一章我们看"映射类型"——批量改字段类型的神器。`
  },

  // ============================================================
  // ch16: 映射类型与键重映射
  // ============================================================
  {
    id: "tsx3-ch16",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🗺️",
    title: "ch16 映射类型与键重映射",
    content: `# ch16 映射类型与键重映射

## 为什么讲这个

你已经用过 \`Partial<T>\`、\`Readonly<T>\`、\`Pick<T, K>\` 这些工具类型，但你想过它们是怎么实现的吗？答案就是**映射类型**——一种"遍历对象字段并改写它们"的语法。

映射类型是写高级工具类型的基石。掌握它，你就能自己造 \`DeepPartial\`、\`Mutable\`、\`SetOptional\`、\`Getters\` 这种定制工具类型，让团队代码复用度上一个台阶。

## 1. 映射类型基本语法

\`\`\`ts
// 遍历 T 的所有 key，把每个字段类型重新声明
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

interface User {
  id: number;
  name: string;
}

type ReadonlyUser = MyReadonly<User>;
// 等价于 { readonly id: number; readonly name: string }
\`\`\`

读法：\`[K in keyof T]\` 表示"对 T 的每个 key K"，\`T[K]\` 是 K 对应的值类型。 \`in\` 类似 for...in，\`keyof T\` 拿到 T 所有 key 的联合。

## 2. Partial 的底层实现

\`\`\`ts
// 给每个字段加 ?，变成可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

interface User {
  id: number;
  name: string;
}

type PartialUser = MyPartial<User>;
// { id?: number; name?: string }
\`\`\`

\`?\` 加在 \`K\` 后面，表示"这个字段变成可选"。这就是 \`Partial\` 的全部秘密。

## 3. 修饰符 +/-

映射类型可以"加"或"去"修饰符，符号是 \`+\` 和 \`-\`：

\`\`\`ts
// 加 readonly（+ 可以省略）
type ToReadonly<T> = { +readonly [K in keyof T]: T[K] };

// 去 readonly（用 -，不能省略）
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

// 加 ?
type ToOptional<T> = { [K in keyof T]?: T[K] };

// 去 ?（用 -?，去掉可选）
type ToRequired<T> = { [K in keyof T]-?: T[K] };
\`\`\`

\`-\` 表示"移除"修饰符。这是写"反向工具类型"的关键——比如 \`Mutable\` 是 \`Readonly\` 的反向。

\`\`\`ts
interface User {
  readonly id: number;
  name?: string;
}

type MutableUser = Mutable<User>;      // { id: number; name?: string } —— id 去掉了 readonly
type RequiredUser = ToRequired<User>;  // { readonly id: number; name: string } —— name 去掉了 ?
\`\`\`

## 4. Pick 的底层实现

\`\`\`ts
// 只保留 K 指定的字段
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type UserSummary = MyPick<User, "id" | "name">;
// { id: number; name: string }
\`\`\`

注意 \`[P in K]\` 这里遍历的是 \`K\`（一个联合类型），不是 \`keyof T\`。这是 Pick 和 Partial 的关键区别：Partial 遍历所有 key，Pick 只遍历指定的 key。

\`K extends keyof T\` 这行约束很重要——它防止调用方传入不存在的 key，比如 \`MyPick<User, "foo">\` 会直接报错。

## 5. 键重映射：as 子句（TS 4.1+）

可以在映射时"重命名"键：

\`\`\`ts
// 给所有 key 加上前缀
type AddPrefix<T, P extends string> = {
  [K in keyof T as \`\${P}\${Capitalize<string & K>}\`]: T[K];
};

interface User {
  id: number;
  name: string;
}

type PrefixedUser = AddPrefix<User, "user">;
// { userId: number; userName: string }
\`\`\`

\`as\` 后面跟一个新 key 的表达式，可以是模板字面量类型（下一章细讲）。\`string & K\` 是为了把 \`K\` 收窄到 string 子类型——因为 \`Capitalize\` 只接受 string。

## 6. 用 as 过滤 key

把不需要的 key 重映射为 \`never\`，它就会被自动过滤掉：

\`\`\`ts
// 排除特定 key：实现一个简易版 Omit
type MyOmit<T, K> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

interface User {
  id: number;
  name: string;
  email: string;
}

type UserWithoutEmail = MyOmit<User, "email">;
// { id: number; name: string }
\`\`\`

这是 \`Omit\` 的另一种实现方式（用 as 子句过滤），比传统的 \`Pick<T, Exclude<keyof T, K>>\` 更直观。\`as P extends K ? never : P\` 表示：如果 P 在 K 里就丢掉，否则保留原名。

## 7. 自定义工具：所有字段变成可空

\`\`\`ts
// 把每个字段类型包成 T | null
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface User {
  id: number;
  name: string;
}

type NullableUser = Nullable<User>;
// { id: number | null; name: string | null }
\`\`\`

适用于"从后端拿到的字段可能为空"的场景——把所有字段都允许 null，调用方就必须判空。

## 8. 自定义工具：Getter 类型生成

\`\`\`ts
// 把每个字段名加上 get 前缀，值变成函数
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

interface User {
  id: number;
  name: string;
}

type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string }
\`\`\`

这是"对象 -> getter 接口"的自动转换。Vuex / Pinia 这类状态管理库的类型推导就大量用了这种映射。

## 9. 自定义工具：深度 Partial

\`\`\`ts
// 递归把所有嵌套字段都变成可选
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Config {
  server: {
    host: string;
    port: number;
  };
  debug: boolean;
}

type PartialConfig = DeepPartial<Config>;
// 等价于 {
//   server?: { host?: string; port?: number };
//   debug?: boolean;
// }
\`\`\`

\`T[K] extends object ? DeepPartial<T[K]> : T[K]\` 这一行是递归条件：如果字段是对象就继续递归，否则原样保留。 配合条件类型，映射类型能玩出无穷花样。

## 10. React 场景：表单错误状态自动生成

假设有一个用户表单，每个字段都可能"出错"。我们用映射类型自动生成"错误状态"类型，让实体加字段时错误类型自动跟着加：

\`\`\`tsx
import React from "react";

// 用户实体的字段
interface UserForm {
  name: string;
  age: number;
  email: string;
}

// 用映射类型生成"每个字段对应一组错误信息"的类型
type FormErrors<T> = {
  [K in keyof T]?: string[];  // 每个字段对应一个错误信息数组
};

// 表单组件：props 接收提交回调
function UserForm({ onSubmit }: { onSubmit: (data: UserForm) => void }) {
  // formData 是 UserForm，errors 是 FormErrors<UserForm>
  const [formData, setFormData] = React.useState<UserForm>({
    name: "",
    age: 0,
    email: "",
  });
  // errors 自动是 { name?: string[]; age?: string[]; email?: string[] }
  const [errors, setErrors] = React.useState<FormErrors<UserForm>>({});

  // 校验函数：返回每个字段的错误数组
  const validate = (data: UserForm): FormErrors<UserForm> => {
    const e: FormErrors<UserForm> = {};
    if (!data.name) e.name = ["名字必填"];
    if (data.age < 0) e.age = ["年龄不能为负"];
    if (!data.email.includes("@")) e.email = ["邮箱格式错误"];
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(formData);
    setErrors(e);
    // 只有所有字段都没错时才提交
    if (Object.keys(e).length === 0) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={ev => setFormData(d => ({ ...d, name: ev.target.value }))}
      />
      {/* errors.name 是 string[] | undefined，先判存在再取 [0] */}
      {errors.name && <span style={{ color: "red" }}>{errors.name[0]}</span>}

      <input
        type="number"
        value={formData.age}
        onChange={ev => setFormData(d => ({ ...d, age: +ev.target.value }))}
      />
      {errors.age && <span style={{ color: "red" }}>{errors.age[0]}</span>}

      <input
        value={formData.email}
        onChange={ev => setFormData(d => ({ ...d, email: ev.target.value }))}
      />
      {errors.email && <span style={{ color: "red" }}>{errors.email[0]}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

重点：\`FormErrors<UserForm>\` 自动生成了 \`{ name?: string[]; age?: string[]; email?: string[] }\`。以后给 \`UserForm\` 加 \`phone\` 字段，\`errors\` 的类型自动跟着加 \`phone?: string[]\`，**永远不会漏**。

## 小结

- 映射类型 \`{ [K in keyof T]: ... }\` 用于"批量改字段类型"。
- 修饰符 \`+\` / \`-\` 控制加还是去 \`readonly\` / \`?\`；\`-\` 不能省略。
- \`as\` 子句可以重映射键名，配合 \`never\` 还能过滤 key（实现 Omit 的现代写法）。
- \`Partial\` / \`Readonly\` / \`Pick\` / \`Omit\` 的底层都是映射类型，看完这章你应该能默写它们的实现。

## 避坑清单

- ❌ 用 \`type Mutable<T> = { [K in keyof T]: T[K] }\` 想去 readonly（漏了 \`-\`，应该用 \`-readonly\`）
- ❌ 在 \`as\` 子句里写非字符串模板（重映射的 key 必须是 \`string | number | symbol\`）
- ❌ 给 \`Pick\` 的 K 不加约束（应该 \`K extends keyof T\`，否则能传入不存在的 key）
- ❌ 在映射类型里用 \`interface\`（映射类型必须用 \`type\`，interface 不支持 \`[K in ...]\` 语法）

下一章我们看"模板字面量类型"——把字符串玩法推到极致。`
  },

  // ============================================================
  // ch17: 模板字面量类型
  // ============================================================
  {
    id: "tsx3-ch17",
    group: "第二部分 TypeScript 类型进阶",
    icon: "🔤",
    title: "ch17 模板字面量类型",
    content: `# ch17 模板字面量类型

## 为什么讲这个

TS 4.1 引入了"模板字面量类型"——把模板字符串的语法搬到了类型层。这一招一出来，整个类型系统的表达力直接翻倍：你能基于字符串联合类型生成新的联合类型，能精确约束 props 名，能给 CSS 属性做类型推导，甚至能在类型层写一个解析器。

这一章我们彻底玩转字符串类型，看完你就能理解为什么 React Router、Pinia、Tailwind 这些库的类型能玩出花。

## 1. 模板字面量类型基本语法

\`\`\`ts
// 字符串字面量类型
type Greeting = "hello";

// 模板字面量类型：用反引号包裹，长得像模板字符串但是类型
type GreetingWorld = \`\${Greeting} world\`;
// 类型就是 "hello world"
\`\`\`

它看起来像 JS 的模板字符串，但它是**类型**——编译期产物，运行时不存在。 所有 \`string\` 的子字面量都能这样拼接。

## 2. 拼接联合类型：笛卡尔积

当模板里出现联合类型，结果会**笛卡尔积**展开：

\`\`\`ts
type Side = "top" | "right" | "bottom" | "left";
type Margin = \`margin-\${Side}\`;
// 得到 4 个： "margin-top" | "margin-right" | "margin-bottom" | "margin-left"

type Padding = \`padding-\${Side}\`;
// 同样 4 个
\`\`\`

这是 CSS 属性类型推导的基础——只要枚举所有方向，所有合法的 margin/padding 键名就自动生成。

## 3. 内置 4 个字符串变换工具

TS 内置了 4 个把字符串"变形"的工具类型：

\`\`\`ts
// 全大写
type Upper = Uppercase<"hello">;       // "HELLO"

// 全小写
type Lower = Lowercase<"HELLO">;       // "hello"

// 首字母大写
type Cap = Capitalize<"hello">;        // "Hello"

// 首字母小写
type Uncap = Uncapitalize<"Hello">;    // "hello"
\`\`\`

这 4 个工具是模板字面量类型最常用的搭档，几乎所有"改名"场景都要靠它们。

## 4. 生成事件处理器类型

经典的用法：给一组事件名自动生成 \`on\${Event}\`：

\`\`\`ts
type EventName = "click" | "change" | "submit";

type EventHandler = \`on\${Capitalize<EventName>}\`;
// "onClick" | "onChange" | "onSubmit"
\`\`\`

\`Capitalize<EventName>\` 先把每个事件名首字母大写，再拼上 \`on\` 前缀，结果就是一组合法的 React 事件 prop 名。

## 5. 用模板字面量类型定义 Props

配合映射类型，可以一次性生成一组精确的 prop：

\`\`\`ts
type EventName = "click" | "change" | "submit";

type EventProps = {
  [K in \`on\${Capitalize<EventName>}\`]?: (e: React.SyntheticEvent) => void;
};

// 等价于 {
//   onClick?: (e: SyntheticEvent) => void;
//   onChange?: (e: SyntheticEvent) => void;
//   onSubmit?: (e: SyntheticEvent) => void;
// }
\`\`\`

映射类型 + 模板字面量类型的组合拳——一套定义，多个精确的 prop 名。 Radix UI、Headless UI 这些库大量用这种模式自动生成事件 props。

## 6. CSS 属性类型推导

\`\`\`ts
// 所有合法的 margin 属性名
type MarginKey = \`margin-\${"top" | "right" | "bottom" | "left"}\`;

// 把它们作为 key，值是 number
type MarginStyle = {
  [K in MarginKey]?: number;
};

const style: MarginStyle = {
  "margin-top": 10,
  "margin-left": 20,
  // "margin-foo": 10, // ❌ 报错：margin-foo 不在 4 个合法值里
};
\`\`\`

写错一个 CSS 属性名，TS 直接红线报错。这就是 styled-components / emotion 这类 CSS-in-JS 库类型安全的底层。

## 7. 解析路径字符串

\`\`\`ts
// 提取路径里的参数名
type ExtractRouteParam<T> =
  T extends \`\${string}:\${infer Param}/\${string}\`
    ? Param
    : T extends \`\${string}:\${infer Param}\`
    ? Param
    : never;

type R1 = ExtractRouteParam<"/users/:userId/posts">;  // "userId"
type R2 = ExtractRouteParam<"/users/:userId">;        // "userId"
type R3 = ExtractRouteParam<"/home">;                  // never —— 没有参数
\`\`\`

\`infer Param\` 配合模板字面量类型，能在字符串类型里"挖出"中间某段。 实际项目里 React Router v6 / Next.js 动态路由的类型推导，就是这套思路的复杂版。

## 8. Getter / Setter 类型生成

\`\`\`ts
// 给所有字段生成 getXxx / setXxx
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as \`set\${Capitalize<string & K>}\`]: (value: T[K]) => void;
};

interface User {
  id: number;
  name: string;
}

type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string }

type UserSetters = Setters<User>;
// { setId: (v: number) => void; setName: (v: string) => void }
\`\`\`

这是"对象 -> getter/setter 接口"的自动转换。 Vuex 的 \`getters\`、Pinia 的 \`storeToRefs\` 类型推导，原理都跑不掉这一套。

## 9. React 场景：类型安全的 CSS-in-JS 主题

下面这个组件演示了用模板字面量类型生成"主题间距键名"，调用方写错间距会直接报错：

\`\`\`tsx
import React from "react";

// 主题的间距键：spacing-0 / spacing-1 / ... / spacing-4
type SpacingKey = \`spacing-\${0 | 1 | 2 | 3 | 4}\`;

// 主题类型：用映射类型生成所有 spacing-X 键
interface Theme {
  [K in SpacingKey]: number;
}

// 默认主题（每个 spacing-X 都要给值，否则 TS 报错）
const theme: Theme = {
  "spacing-0": 0,
  "spacing-1": 4,
  "spacing-2": 8,
  "spacing-3": 16,
  "spacing-4": 24,
};

// 组件：接受 spacing prop
function Box({
  children,
  padding,
  margin,
}: {
  children: React.ReactNode;
  padding?: SpacingKey;     // 只能传 "spacing-0" ~ "spacing-4"
  margin?: SpacingKey;
}) {
  // 取间距值，没传默认 spacing-2 / spacing-0
  const pad = theme[padding ?? "spacing-2"];
  const mar = theme[margin ?? "spacing-0"];
  return (
    <div style={{ padding: pad, margin: mar }}>
      {children}
    </div>
  );
}

// 使用：
// <Box padding="spacing-3" margin="spacing-1">内容</Box>  ✅
// <Box padding="spacing-9" />  ❌ 报错：spacing-9 不在 0~4 的合法值里
\`\`\`

如果调用方写 \`padding="spacing-9"\`，TS 直接报错，避免了运行时拿到 \`undefined\`、CSS 不生效却不知道的尴尬。

## 10. 实战：拆分字符串字面量

\`\`\`ts
// 把 "a.b.c" 拆成 ["a", "b", "c"]
type Split<S extends string, D extends string> =
  S extends \`\${infer Head}\${D}\${infer Tail}\`
    ? [Head, ...Split<Tail, D>]
    : [S];

type R = Split<"a.b.c", ".">;
// ["a", "b", "c"] —— 递归 + infer + 模板字面量类型三件套
\`\`\`

读法：如果 \`S\` 能拆成"Head + D + Tail"，就把 Head 留下，对 Tail 递归。 否则 \`S\` 自己就是最后一段。 这种"在类型层写解析器"的玩法，TS 类型体操社区玩得很花。

## 小结

- 模板字面量类型用反引号包裹，长得像模板字符串但是是类型。
- 联合类型在模板里会笛卡尔积展开，是生成大量键名的核心机制。
- 内置 \`Uppercase\` / \`Lowercase\` / \`Capitalize\` / \`Uncapitalize\` 4 个变换工具。
- 配合映射类型和 \`as\` 子句，能生成 \`getXxx\` / \`onXxx\` / \`margin-xxx\` 这类精确的键名。
- 配合 \`infer\`，能在字符串类型里"挖出"中间某段，实现路径解析、字符串拆分。

## 避坑清单

- ❌ 在模板字面量里把 \`number\` 当成数字处理（应该用 \`\${number}\` 表"任意数字字面量类型"）
- ❌ 用模板字面量类型生成无穷多个字符串（TS 有递归深度限制，超过会报"类型实例化过深"）
- ❌ \`Capitalize\` 直接对 \`keyof T\` 用（要先 \`string & K\` 收窄，否则 union 里有 symbol 会报错）
- ❌ 把模板字面量类型当运行时字符串用（它是类型，运行时根本不存在）

下一章我们看"模块声明与 tsconfig"——工程化配置的最后一公里。`
  },

  // ============================================================
  // ch18: 模块声明与 tsconfig
  // ============================================================
  {
    id: "tsx3-ch18",
    group: "第二部分 TypeScript 类型进阶",
    icon: "⚙️",
    title: "ch18 模块声明与 tsconfig",
    content: `# ch18 模块声明与 tsconfig

## 为什么讲这个

到这一章为止，你写的 TS 都是"自带类型"的——每个 .ts 文件都有类型注解。但真实项目里你会遇到三类问题：

1. 引入一个 JS 老库，它没有类型怎么办？
2. 想给 \`window\` 加个自定义属性，TS 报错怎么办？
3. \`tsconfig.json\` 里那么多选项，到底哪些影响类型检查？

这一章一次性讲透模块声明、\`.d.ts\` 文件、\`tsconfig\` 核心配置。读完你就能从"会写 TS"升级到"会配 TS 工程"。

## 1. .d.ts 文件：纯类型声明

\`.d.ts\` 文件只包含**类型声明**，没有运行时代码。它用来描述一个 JS 库的"形状"。

\`\`\`ts
// math.d.ts
// 声明一个名为 "math-lib" 的模块的类型
declare module "math-lib" {
  // 模块导出的函数
  export function add(a: number, b: number): number;
  export function multiply(a: number, b: number): number;
  // 模块导出的常量
  export const PI: number;
}
\`\`\`

然后在 .ts 文件里就能 import 它：

\`\`\`ts
// app.ts
import { add, PI } from "math-lib";
// 即使 math-lib 是纯 JS 没类型，TS 也不报错了
const result = add(1, 2);     // number
const pi = PI;                // number
\`\`\`

\`declare module\` 是"给一个模块补类型"的语法。 一个 \`declare module\` 块里写的所有 export，就是这个模块的公共 API。

## 2. declare module：扩展第三方模块

如果你想给已有的库加额外的方法（比如给 axios 加自定义 API），用 \`declare module\` 配合 \`interface\` 合并：

\`\`\`ts
// axios-ext.d.ts
import "axios";  // 这行让文件成为"模块"，否则 declare global 会报错

declare module "axios" {
  // 给 AxiosInstance 接口加一个方法（interface 自动合并）
  export interface AxiosInstance {
    myCustomMethod(): Promise<void>;
  }
}
\`\`\`

之后用 axios 时，TS 就认得 \`myCustomMethod\` 了。 这种"接口合并"特性让第三方库的类型可以无限扩展。

## 3. 给全局 window 加属性

\`\`\`ts
// global.d.ts
// 扩展全局 Window 接口
declare global {
  interface Window {
    myAppConfig: {
      apiBaseUrl: string;
      debug: boolean;
    };
  }
}

// 之后在任意文件里都能访问
window.myAppConfig.apiBaseUrl;  // ✅ string，TS 不报错
\`\`\`

注意 \`declare global\` 必须在**模块文件**里（即有 \`import\` 或 \`export\` 的文件），纯脚本文件里不能直接用。 没有显式 import/export 时，加一行 \`export {};\` 让它变成模块即可。

## 4. 三斜线指令：声明文件之间的依赖

\`\`\`ts
/// <reference types="node" />
/// <reference path="./other.d.ts" />
\`\`\`

三斜线指令告诉 TS：当前文件依赖另一个类型声明。 \`types="node"\` 引入 \`@types/node\`，\`path="./other.d.ts"\` 引入相对路径的声明文件。

现代项目里基本被 \`tsconfig\` 的 \`types\` 和 \`include\` 替代，但写 .d.ts 库时还会用到。 业务代码里几乎不需要手写三斜线。

## 5. namespace：给类型分组

\`\`\`ts
// 老式声明：用 namespace 把一组类型包起来
declare namespace MyApp {
  interface User {
    id: number;
    name: string;
  }
  type Role = "admin" | "user";
  const version: string;
}

// 使用：通过点号访问
const u: MyApp.User = { id: 1, name: "Alice" };
const role: MyApp.Role = "admin";
console.log(MyApp.version);
\`\`\`

\`namespace\` 是 TS 早期的"模块"方案，现代代码推荐用 ES Module 替代。 但读老库的 .d.ts（比如 jQuery、Vue 2 的类型）时还会大量遇到，需要看懂。

## 6. tsconfig.json 核心配置项

完整一份"前端项目推荐配置"：

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",                       // 编译目标 JS 版本
    "module": "ESNext",                       // 模块系统：前端用 ESNext
    "moduleResolution": "bundler",            // 模块解析策略：bundler 适配 Vite/Webpack 5
    "jsx": "react-jsx",                       // JSX 处理：React 17+ 新模式（无需 import React）
    "strict": true,                           // 开启所有严格检查（强烈建议保持）
    "noUncheckedIndexedAccess": true,         // 索引访问返回 T | undefined
    "noImplicitAny": true,                    // 禁止隐式 any
    "strictNullChecks": true,                 // null / undefined 严格检查
    "esModuleInterop": true,                  // CJS/ESM 互导（import fs from "fs" 不报错）
    "skipLibCheck": true,                     // 跳过 .d.ts 检查加速编译
    "forceConsistentCasingInFileNames": true, // 文件名大小写一致（跨平台兼容）
    "resolveJsonModule": true,                // 允许 import .json
    "isolatedModules": true,                  // 每个文件独立编译（Vite 必需）
    "baseUrl": ".",                           // path mapping 的基准路径
    "paths": {
      "@/*": ["src/*"]                        // 路径别名
    },
    "types": ["node", "vite/client"]          // 全局类型声明（默认包含 node_modules/@types 下所有）
  },
  "include": ["src", "vite-env.d.ts"],        // 编译范围
  "exclude": ["node_modules", "dist"]         // 排除范围
}
\`\`\`

每个选项都直接决定 TS 的检查行为，配错一个都可能让整个项目报错或漏检。

## 7. 选项详解：strict 家族

\`strict: true\` 会一次性开启以下所有严格检查：

| 子选项 | 作用 |
| --- | --- |
| \`noImplicitAny\` | 禁止隐式 any（参数没注解会报错） |
| \`strictNullChecks\` | null/undefined 必须显式处理（最重要的一个） |
| \`strictFunctionTypes\` | 函数参数双向检查改严格 |
| \`strictBindCallApply\` | bind/call/apply 严格类型 |
| \`strictPropertyInitialization\` | class 字段必须在构造函数里初始化 |
| \`noImplicitThis\` | 禁止隐式 this |
| \`useUnknownInCatchVariables\` | catch 的 e 默认是 unknown 而非 any |
| \`alwaysStrict\` | 编译产物加 "use strict" |

**强烈建议保持 \`strict: true\`**。 关掉任何一个都会让类型安全打折扣，"省事一时爽，调试火葬场"。

## 8. path mapping：路径别名

大型项目里 \`import\` 路径很容易变成 \`../../../utils/foo\`，又丑又难改。 path mapping 解决这个问题：

\`\`\`json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
\`\`\`

然后在代码里就能写：

\`\`\`ts
// 不再需要 ../../../utils/date
import { formatDate } from "@utils/date";
import { Button } from "@components/Button";
\`\`\`

**关键避坑**：tsconfig 的 \`paths\` 只告诉 TS 怎么找类型，**打包工具不认**。 Vite 项目要额外在 \`vite.config.ts\` 里配 \`resolve.alias\`，Webpack 项目要在 \`resolve.alias\` 里同步配，否则运行时 \`import\` 会找不到模块。

\`\`\`ts
// vite.config.ts —— 同步配 alias，否则运行时找不到模块
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
\`\`\`

## 9. React 场景：给一个 JS 老库写声明

下面这个 demo 演示：给一个假设的 JS 库 \`legacy-modal\` 写类型声明，然后在 React 组件里用，调用方有完整类型提示。

\`\`\`tsx
// legacy-modal.d.ts —— 给 JS 库写类型声明
declare module "legacy-modal" {
  // 模块导出的配置接口
  export interface ModalOptions {
    title: string;
    content: string;
    onClose?: () => void;
  }
  // 模块默认导出一个工厂函数，返回带 open/close 的实例
  export interface ModalInstance {
    open: () => void;
    close: () => void;
  }
  // 默认导出：把 createModal 标记为默认导出
  const createModal: (options: ModalOptions) => ModalInstance;
  export default createModal;
}

// ModalButton.tsx —— 在 React 里用这个库
import React from "react";
import createModal from "legacy-modal";

function ModalButton() {
  const handleClick = () => {
    // 调用方有完整类型提示：title/content 必填，onClose 可选
    const modal = createModal({
      title: "确认删除",
      content: "确定要删除这条记录吗？",
      onClose: () => console.log("已关闭"),
    });
    // modal 是 ModalInstance 类型，认得 open/close
    modal.open();
  };

  return <button onClick={handleClick}>打开弹窗</button>;
}
\`\`\`

如果调用 \`createModal({ title: 123 })\`，TS 会直接报错——即使 \`legacy-modal\` 是纯 JS 库，调用方依然有类型保护。 这就是 .d.ts 文件的价值：**让 JS 库拥有 TS 体验，而无需修改库本身**。

## 10. 实战：把 tsconfig 拆分成多个

大型项目通常把 tsconfig 拆成多个，避免重复配置：

\`\`\`json
// tsconfig.base.json —— 公共配置（被其他配置 extends）
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}

// tsconfig.json —— 应用代码配置
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}

// tsconfig.node.json —— Node 端配置（Vite 配置文件、脚本用）
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "types": ["node"]
  },
  "include": ["vite.config.ts", "scripts/**/*.ts"]
}
\`\`\`

\`extends\` 让多个 tsconfig 共享基础配置，避免重复。 Vite / Next.js / Nuxt 这些脚手架默认就是这种"基础 + 派生"的结构。

## 小结

- \`.d.ts\` 文件是纯类型声明，给 JS 库补类型用 \`declare module\`。
- 给全局对象加属性用 \`declare global\`，必须在模块文件里（有 import/export）。
- tsconfig 的 \`strict\` 家族是类型安全的底线，必开；\`noUncheckedIndexedAccess\` 强烈建议开。
- path mapping 配 \`paths\`，但要记得在打包工具（Vite/Webpack）里同步配 alias。
- 大型项目用 \`extends\` 把 tsconfig 拆成多个，避免重复。

## 避坑清单

- ❌ 把运行时代码写进 .d.ts（.d.ts 只能放声明，不能有实现，否则编译产物会有重复代码）
- ❌ \`declare global\` 写在纯脚本文件里（必须有 import/export 让它成为模块）
- ❌ 只配 tsconfig \`paths\` 不配 Vite/Webpack \`alias\`（运行时找不到模块，TS 却不报错）
- ❌ 关 \`strict\` 逃避报错（应该补类型而不是降低严格度，否则等于白用 TS）
- ❌ \`types\` 选项配得太宽（默认会包含 \`@types/*\` 下所有，建议显式列出需要的几个）

下一章我们进入第三部分：React + TS 工程基础，从 JSX 与函数组件开始。`
  },
];

export { chapters };
