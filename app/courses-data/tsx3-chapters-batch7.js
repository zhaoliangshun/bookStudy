// =============================================================
// React 中使用 TypeScript 从入门到精通大全 —— 第七批章节
// -------------------------------------------------------------
// 覆盖：第四部分 事件与表单 末尾 3 章 + 第五部分 Hooks 全解 开头 3 章
// 包含 6 个章节：ch30 ~ ch35
//
// 章节范围：
//   - ch30 React Hook Form 实战（第四部分末尾）
//   - ch31 Zod 校验实战（第四部分末尾）
//   - ch32 复杂表单设计：useFieldArray 与多步表单（第四部分末尾）
//   - ch33 useState 基础与陷阱（第五部分开头）
//   - ch34 useState 函数式更新与批处理（第五部分开头）
//   - ch35 useEffect 基础（第五部分开头）
//
// 风格定位：
//   - 每章都从"为什么需要"切入，再讲"怎么用"
//   - 每段代码都配套逐行注释，注释里讲透"为什么这样写"
//   - 所有 demo 都通过 /api/run-ts 沙箱可运行
//   - 语言简洁、直击要点，避免堆砌
//
// 运行环境：
//   - TypeScript 5.x（strict、esModuleInterop 等默认开启）
//   - React 18（沙箱注入 react / react-dom）
//   - 沙箱使用 ts.transpileModule，target=ES2020, module=CommonJS, jsx=ReactJSX
// =============================================================

const chapters = [
  // ============================================================
  // ch30: React Hook Form 实战
  // ============================================================
  {
    id: "tsx3-ch30",
    group: "第四部分 事件与表单",
    icon: "🪝",
    title: "ch30 React Hook Form 实战",
    content: `# ch30 React Hook Form 实战

## 为什么讲这个

受控组件写小表单挺好，但表单一复杂——十几二十个字段、嵌套对象、动态增删——纯 useState 会让你写到怀疑人生：每个字段一个 state，每次输入都重渲染整棵树，校验逻辑散在 onChange 里。**React Hook Form**（简称 RHF）就是来解决这些问题的：非受控为主、性能高、类型友好、和 Zod 配合默契。这一章把 RHF + TS 的核心用法讲透。

## 1. 安装与最小可运行示例

\`\`\`bash
# 安装核心包
npm install react-hook-form

# 配套 Zod 和桥接包（下一章详细讲 Zod）
npm install zod @hookform/resolvers
\`\`\`

最小 demo——一个登录表单：

\`\`\`tsx
import { useForm } from "react-hook-form";

// 1. 定义表单数据的类型
//    RHF 强类型的核心：把"表单形状"显式写成 TS 类型
type LoginForm = {
  email: string;
  password: string;
};

function LoginFormDemo() {
  // 2. useForm<LoginForm>()：把类型参数传给 Hook
  //    返回的 register / handleSubmit / formState 都会带上 LoginForm 类型
  const {
    register, // 给 input 注册进 RHF 的非受控体系
    handleSubmit, // 包一层 onSubmit，参数自动是 LoginForm 类型
    formState: { errors }, // 校验错误信息
  } = useForm<LoginForm>({
    defaultValues: {
      email: "", // 必须给初值，避免受控/非受控切换警告
      password: "",
    },
  });

  // 3. handleSubmit(onValid) 返回一个新函数，可直接绑到 form 的 onSubmit
  //    onValid 的 data 已经是 LoginForm 类型，无需手动断言
  const onValid = (data: LoginForm) => {
    console.log("提交成功：", data);
    // data.email / data.password 都有类型提示
  };

  return (
    // 4. onSubmit 必须用 handleSubmit 包一层
    //    不能直接写 onSubmit={(e) => ...}，那样拿不到类型化的 data
    <form onSubmit={handleSubmit(onValid)}>
      <div>
        {/* 5. register("email") 返回 { name, onChange, onBlur, ref }
            展开到 input 上，RHF 就接管了这个字段 */}
        <input
          type="email"
          placeholder="邮箱"
          {...register("email", {
            required: "邮箱必填", // 校验规则：必填
            pattern: {
              value: /^\\S+@\\S+\\.\\S+$/,
              message: "邮箱格式不对",
            },
          })}
        />
        {/* 6. errors.email?.message 是校验失败时显示的提示文案 */}
        {errors.email && <span>{errors.email.message}</span>}
      </div>

      <div>
        <input
          type="password"
          placeholder="密码"
          {...register("password", {
            required: "密码必填",
            minLength: { value: 6, message: "至少 6 位" },
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}
      </div>

      <button type="submit">登录</button>
    </form>
  );
}
\`\`\`

> **关键点**：\`register\` 字段名是**字符串字面量**（\`"email"\`、\`"password"\`），但因为有 \`useForm<LoginForm>()\` 的类型参数，TS 会校验你写的字段名是否合法——写成 \`register("emial")\` 会直接报错。

## 2. useForm 的类型参数详解

\`\`\`tsx
import { useForm, UseFormProps, FieldValues } from "react-hook-form";

// 类型参数 TFieldValues 必须满足 FieldValues 约束（即 Record<string, any> 的扩展）
// 99% 情况下你只需要写一个对象类型就行
type FormData = {
  name: string;
  age: number;
  agree: boolean;
};

// 可以显式标注 props 的类型，便于复用配置
const formOptions: UseFormProps<FormData> = {
  defaultValues: {
    name: "",
    age: 0,
    agree: false,
  },
  mode: "onBlur", // 校验触发时机：onChange（默认）/onBlur/onSubmit
  reValidateMode: "onChange", // 错误后再次校验时机
};

function MyForm() {
  // 把 formOptions 传进去，类型会被自动推断
  const { register } = useForm<FormData>(formOptions);

  return (
    <form>
      {/* register 的字段名必须是 FormData 的 key */}
      <input {...register("name")} />
      <input type="number" {...register("age", { valueAsNumber: true })} />
      {/* valueAsNumber：把字符串 value 转成 number，否则 age 是 string */}
      <input type="checkbox" {...register("agree")} />
    </form>
  );
}
\`\`\`

> **避坑**：\`<input type="number">\` 默认 \`value\` 是字符串。要拿到 \`number\` 必须加 \`{ valueAsNumber: true }\`，否则 \`data.age\` 类型对不上 \`number\`。

## 3. handleSubmit 的类型签名

\`\`\`tsx
type HandleSubmit<T extends FieldValues> = (
  onValid: (data: T) => void | Promise<void>,
  onInvalid?: (errors: FieldErrors<T>) => void
) => (e?: React.BaseSyntheticEvent) => Promise<void>;
\`\`\`

- 第一个参数 \`onValid\`：校验通过时调用，\`data\` 类型就是 \`T\`。
- 第二个参数 \`onInvalid\`：校验失败时调用，\`errors\` 类型是 \`FieldErrors<T>\`——错误对象的结构和表单字段一一对应。

\`\`\`tsx
function Demo() {
  const { handleSubmit } = useForm<LoginForm>();

  // 校验失败时也能拿到类型化的 errors
  const onInvalid = (errors: FieldErrors<LoginForm>) => {
    console.log("哪些字段错了：", Object.keys(errors));
    // errors.email?.message 有类型提示
  };

  return (
    <form onSubmit={handleSubmit((data) => {
      console.log("通过校验：", data);
    }, onInvalid)}>
      {/* ... */}
    </form>
  );
}
\`\`\`

## 4. zodResolver 集成：把校验交给 Zod

手写 \`register("email", { required, pattern })\` 在字段多时变得难维护。**最佳实践**是把校验规则抽成 Zod schema，通过 \`zodResolver\` 桥接给 RHF——这样校验逻辑集中、可复用、类型还能自动派生。下一章详细讲 Zod，这里先看集成方式：

\`\`\`tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. 定义 Zod schema：校验规则集中在一处
const schema = z.object({
  email: z.string().email("邮箱格式不对"),
  password: z.string().min(6, "至少 6 位"),
});

// 2. 用 z.infer 派生 TS 类型，避免类型重复定义
type FormData = z.infer<typeof schema>;
// 等价于 { email: string; password: string }

function LoginFormZod() {
  // 3. resolver: zodResolver(schema) 让 RHF 把校验委托给 Zod
  //    类型参数可以省略，因为 zodResolver 已经携带了 schema 的类型
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 4. register 不再写校验规则，规则全在 schema 里
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input type="email" {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">登录</button>
    </form>
  );
}
\`\`\`

**类型链路**：\`z.object(...)\` → \`z.infer\` → \`FormData\` → \`useForm<FormData>\` → \`register\` 字段名被校验 → \`handleSubmit\` 的 \`data\` 类型推导。一条链全打通。

## 5. 嵌套字段路径

表单数据经常是嵌套对象，比如 \`{ user: { name, address: { city } } }\`。RHF 的 \`register\` 支持点路径写法，TS 也会校验路径是否合法：

\`\`\`tsx
type FormValues = {
  user: {
    name: string;
    address: {
      city: string;
      zip: string;
    };
  };
};

function NestedForm() {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      user: {
        name: "",
        address: { city: "", zip: "" },
      },
    },
  });

  // register("user.name") 这种点路径写法
  // TS 会校验 "user.name" 是否真的是 FormValues 的合法路径
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("user.name")} placeholder="姓名" />

      {/* 嵌套对象的路径 */}
      <input {...register("user.address.city")} placeholder="城市" />
      <input {...register("user.address.zip")} placeholder="邮编" />

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

> **避坑**：写成 \`register("user.adress.city")\`（拼错 address）TS 会立即报错，因为 \`adress\` 不在 \`FormValues["user"]\` 上。这是 RHF 强类型最大的价值。

## 6. 数组字段的路径

\`\`\`tsx
type FormValues = {
  tags: string[]; // 数组字段
};

function ArrayForm() {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { tags: [""] },
  });

  // register("tags.0") 表示 tags 数组的第 0 项
  // RHF 会把 input 的值塞到 tags[0] 里
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("tags.0")} placeholder="标签 1" />
      <input {...register("tags.1")} placeholder="标签 2" />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

数组字段的增删改用 \`useFieldArray\`，下一章 ch32 会详细讲。

## 小结

- RHF 用非受控为主，性能比纯受控好，字段越多越明显。
- \`useForm<T>()\` 的类型参数是强类型的入口，\`register\` / \`handleSubmit\` 都靠它推导。
- \`handleSubmit(onValid, onInvalid?)\` 两个回调都有类型化的参数。
- 配合 \`zodResolver\` 把校验交给 Zod，校验规则集中、类型还能自动派生。
- 嵌套字段用点路径 \`register("user.address.city")\`，TS 会校验路径合法性。

## 避坑清单

- ❌ 不传 \`defaultValues\` 导致受控/非受控切换警告
- ❌ \`<input type="number">\` 不加 \`{ valueAsNumber: true }\`，导致 \`data.age\` 是 string
- ❌ 在 \`register\` 里写错字段名（如 \`"emial"\`），不靠 TS 校验就发现不了
- ❌ 校验规则散落在 \`register\` 里，字段一多就乱（应该抽成 Zod schema）
- ❌ 不用 \`z.infer\` 派生类型，导致 schema 和 TS 类型两份定义难维护

下一章我们专攻 Zod：表单校验的"类型即校验"哲学。`
  },

  // ============================================================
  // ch31: Zod 校验实战
  // ============================================================
  {
    id: "tsx3-ch31",
    group: "第四部分 事件与表单",
    icon: "🛡️",
    title: "ch31 Zod 校验实战",
    content: `# ch31 Zod 校验实战

## 为什么讲这个

表单校验是个永恒痛点。手写校验函数散在各地，TS 类型又是一份手写定义，两边慢慢就不同步——schema 改了类型没改，运行时炸了。**Zod** 的核心卖点是"类型即校验"：你定义一份 schema，既能在运行时校验数据，又能用 \`z.infer\` 派生出 TS 类型。一份定义，两份产出。这一章把 Zod 在 React 表单里的实战用法讲透。

## 1. z.object：定义对象 schema

\`\`\`ts
import { z } from "zod";

// z.object 定义一个对象的 schema
const UserSchema = z.object({
  name: z.string(),          // 必须是字符串
  age: z.number(),           // 必须是数字
  email: z.string().email(), // 字符串且符合邮箱格式
});

// 1. 运行时校验：parse 校验失败会抛异常
const result = UserSchema.parse({
  name: "Alice",
  age: 18,
  email: "alice@x.com",
});
console.log(result); // { name: "Alice", age: 18, email: "alice@x.com" }

// 2. safeParse：不抛异常，返回结果对象
const safe = UserSchema.safeParse({
  name: "Bob",
  age: "20", // 故意传字符串
  email: "bob@x.com",
});
if (!safe.success) {
  // 校验失败：safe.error 是结构化的错误信息
  console.log(safe.error.issues);
  // [{ path: ["age"], message: "Expected number, received string" }]
} else {
  console.log(safe.data);
}
\`\`\`

> **关键点**：\`parse\` 抛异常适合"必须正确"的场景；\`safeParse\` 返回结果对象适合表单校验——你需要拿到所有错误一次性显示。

## 2. 基础类型：string / number / boolean / enum

\`\`\`ts
const Schema = z.object({
  // string 的常见校验
  username: z.string()
    .min(3, "用户名至少 3 位")
    .max(20, "用户名最多 20 位")
    .regex(/^[a-zA-Z0-9_]+$/, "只能字母数字下划线"),

  // number 的常见校验
  age: z.number()
    .int("必须是整数")
    .min(0, "不能小于 0")
    .max(150, "不能大于 150"),

  // boolean
  agree: z.boolean().refine(v => v === true, "必须勾选协议"),

  // enum：从一组字面量里选一个
  role: z.enum(["admin", "editor", "viewer"]),
  // 等价于 type role = "admin" | "editor" | "viewer"

  // 可选字段
  nickname: z.string().optional(),     // string | undefined
  bio: z.string().nullable(),          // string | null
  avatar: z.string().optional().nullable(), // string | null | undefined

  // 默认值：传入 undefined 时用默认值
  currency: z.string().default("CNY"),
});
\`\`\`

> **避坑**：\`z.string().optional()\` 和 \`z.optional(z.string())\` 等价，但后者更通用——可以包任意 schema。比如 \`z.optional(z.array(z.string()))\`。

## 3. 复合类型：array / object / union

\`\`\`ts
const FormSchema = z.object({
  // 数组：z.array(elementSchema)
  tags: z.array(z.string().min(1)).min(1, "至少一个标签"),

  // 嵌套对象
  address: z.object({
    city: z.string(),
    zip: z.string().regex(/^\\d{6}$/, "邮编 6 位数字"),
  }),

  // 联合类型：可以是 string 或 number
  id: z.union([z.string(), z.number()]),

  // 简写：z.string().or(z.number())
  alt: z.string().or(z.number()),
});

// 派生类型：自动包含嵌套结构
type FormValues = z.infer<typeof FormSchema>;
// 等价于：
// {
//   tags: string[];
//   address: { city: string; zip: string };
//   id: string | number;
//   alt: string | number;
// }
\`\`\`

## 4. refine：自定义校验

简单校验（min/max/pattern）覆盖不了的场景，用 \`refine\` 加自定义函数：

\`\`\`ts
const Schema = z.object({
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine(
  // 校验函数：返回 true 表示通过
  (data) => data.password === data.confirmPassword,
  // 错误信息：可以指定 path 让错误挂到某个字段上
  {
    message: "两次密码不一致",
    path: ["confirmPassword"], // 错误挂到 confirmPassword 字段
  }
);

// 测试
const r = Schema.safeParse({
  password: "123456",
  confirmPassword: "123457",
});
if (!r.success) {
  console.log(r.error.issues);
  // [{ path: ["confirmPassword"], message: "两次密码不一致" }]
}
\`\`\`

> **关键点**：\`refine\` 写在 \`z.object(...)\` 上而不是字段上，是因为它要同时访问多个字段（\`password\` 和 \`confirmPassword\`）。这就是**跨字段校验**的标准写法。

## 5. superRefine：多错误一次返回

\`refine\` 只能返回一个错误，\`superRefine\` 可以一次塞多个错误，适合复杂校验：

\`\`\`ts
const Schema = z.object({
  password: z.string(),
  username: z.string(),
}).superRefine((data, ctx) => {
  // ctx.addIssue 添加错误，可以加多个
  if (data.password.length < 6) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: "密码至少 6 位",
    });
  }

  if (data.password === data.username) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: "密码不能和用户名相同",
    });
  }

  if (data.username.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["username"],
      message: "用户名至少 3 位",
    });
  }
});

// 一次校验能拿到所有错误，而不是只拿到第一个
const r = Schema.safeParse({ password: "ab", username: "ab" });
if (!r.success) {
  console.log(r.error.issues.length); // 3 条错误
}
\`\`\`

## 6. transform：校验后转换数据

有时候你想"输入是字符串，但拿到的是 number"——\`transform\` 就是干这个的：

\`\`\`ts
// 输入 string，输出 number
const NumberFromString = z.string().transform((val, ctx) => {
  const num = Number(val);
  if (Number.isNaN(num)) {
    // 转换失败时给一个错误
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: \`"\${val}" 不是合法数字\`,
    });
    return z.NEVER; // 让 TS 知道这里会抛错
  }
  return num;
});

const r = NumberFromString.parse("42");
console.log(r); // 42（number 类型）
console.log(typeof r); // "number"

// 输入 "2024-01-01"，输出 Date 对象
const DateFromString = z.string().transform((val) => new Date(val));
const d = DateFromString.parse("2024-01-01");
console.log(d instanceof Date); // true
\`\`\`

> **关键点**：\`transform\` 之后的类型和之前不一样。用 \`z.infer\` 派生的类型是**输出类型**（转换后的），用 \`z.input\` 派生的是**输入类型**（转换前的）。

\`\`\`ts
const Schema = z.object({
  age: z.string().transform(Number), // 输入 string，输出 number
});

type Input = z.input<typeof Schema>;  // { age: string }
type Output = z.output<typeof Schema>; // { age: number } —— z.infer 等价于这个
\`\`\`

## 7. z.infer 派生类型：一份定义两份产出

这是 Zod 最大的价值——你写一份 schema，运行时校验和编译期类型都有了：

\`\`\`tsx
import { z } from "zod";

// 1. 定义 schema
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
  age: z.number().int().min(0),
});

// 2. 派生类型：用作 props、state、API 返回值
type User = z.infer<typeof UserSchema>;
// 等价于：
// {
//   id: number;
//   name: string;
//   email: string;
//   role: "admin" | "user";
//   age: number;
// }

// 3. 派生"创建用户"的入参类型（不带 id）
type CreateUserInput = z.infer<typeof UserSchema.omit({ id: true })>;

// 4. 在 React 组件里用
function UserCard({ user }: { user: User }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>角色：{user.role}</span>
    </div>
  );
}

// 5. 用 schema 校验 API 返回数据
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(\`/api/users/\${id}\`);
  const data = await res.json();
  // 用 parse 校验：如果后端返回结构变了，立刻抛错而不是把脏数据传下去
  return UserSchema.parse(data);
}
\`\`\`

## 8. React Hook Form + Zod 完整集成

把第 30 章的 RHF 和这一章的 Zod 揉到一起，是社区主流写法：

\`\`\`tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. 一份 schema：校验规则和类型一锅端
const RegisterSchema = z.object({
  username: z.string().min(3, "用户名至少 3 位"),
  email: z.string().email("邮箱格式不对"),
  password: z.string().min(6, "密码至少 6 位"),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: "两次密码不一致", path: ["confirmPassword"] }
);

// 2. 派生类型，给 useForm 用
type RegisterForm = z.infer<typeof RegisterSchema>;

function RegisterFormDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    // data 已经通过 Zod 校验，类型完全确定
    await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="用户名" {...register("username")} />
      {errors.username && <span>{errors.username.message}</span>}

      <input placeholder="邮箱" {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" placeholder="密码" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <input type="password" placeholder="确认密码" {...register("confirmPassword")} />
      {/* 跨字段校验的错误也会挂到指定字段上 */}
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "提交中..." : "注册"}
      </button>
    </form>
  );
}
\`\`\`

## 小结

- Zod = 运行时校验 + 编译期类型，一份定义两份产出。
- \`z.object\` 描述对象，\`z.string/z.number/z.enum\` 描述基础类型。
- \`refine\` 做单错误自定义校验，\`superRefine\` 做多错误一次返回。
- \`transform\` 校验后转换数据，注意 \`z.input\` 和 \`z.output\` 的差异。
- \`z.infer\` 派生 TS 类型，和 React Hook Form 配合是社区主流方案。

## 避坑清单

- ❌ schema 和 TS 类型手写两份（应该用 \`z.infer\` 派生）
- ❌ 跨字段校验写在 \`z.string().refine\` 里（应该写在 \`z.object\` 上的 \`refine\`）
- ❌ 用 \`parse\` 校验表单数据（应该用 \`safeParse\` 拿到所有错误）
- ❌ \`transform\` 之后还按输入类型用（应该用 \`z.output\` 看真实输出）
- ❌ schema 改了类型没同步（应该统一从 \`z.infer\` 派生）

下一章我们看复杂表单设计：动态字段数组、多步表单。`
  },

  // ============================================================
  // ch32: 复杂表单设计：useFieldArray 与多步表单
  // ============================================================
  {
    id: "tsx3-ch32",
    group: "第四部分 事件与表单",
    icon: "🧩",
    title: "ch32 复杂表单设计",
    content: `# ch32 复杂表单设计：useFieldArray 与多步表单

## 为什么讲这个

真实业务的表单往往不止"几个字段平铺"这么简单——你需要让用户动态添加多个邮箱、给商品加 N 个 SKU 配置、把注册流程拆成 3 步。RHF 提供了 \`useFieldArray\` 处理动态数组，多步表单则靠状态拆分。这一章把复杂表单的两个核心模式讲透。

## 1. useFieldArray：动态字段数组

\`\`\`tsx
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. 表单类型里有一个数组字段
type FormValues = {
  users: {
    name: string;
    email: string;
  }[];
};

// 2. Zod schema：数组至少 1 项
const Schema = z.object({
  users: z.array(
    z.object({
      name: z.string().min(1, "姓名必填"),
      email: z.string().email("邮箱格式不对"),
    })
  ).min(1, "至少一个用户"),
});

function DynamicArrayForm() {
  // 3. 先用 useForm 拿到 control（useFieldArray 必须用 control）
  const { register, control, handleSubmit, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(Schema),
      defaultValues: {
        users: [{ name: "", email: "" }], // 默认 1 个空行
      },
    });

  // 4. useFieldArray 管理 users 数组
  //    name 必须是 useForm 里数组的字段名
  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  // 5. fields 是渲染用的数组，每项有 id（RHF 内部生成的稳定 key）
  //    append/remove 用来增删行
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {fields.map((field, index) => (
        // ⚠️ key 必须用 field.id，不能用 index（否则删行时 React 复用错位）
        <div key={field.id}>
          <input
            placeholder="姓名"
            // 路径用模板字符串拼出 users.\${index}.name
            {...register(\`users.\${index}.name\` as const)}
          />
          <input
            placeholder="邮箱"
            {...register(\`users.\${index}.email\` as const)}
          />
          {/* remove(index) 删掉这一行 */}
          <button type="button" onClick={() => remove(index)}>删除</button>
        </div>
      ))}

      {/* append 追加一个空对象，结构要和数组元素一致 */}
      <button type="button" onClick={() => append({ name: "", email: "" })}>
        添加用户
      </button>

      {/* 数组级别的错误（比如"至少一个用户"） */}
      {errors.users?.root?.message && (
        <span>{errors.users.root.message}</span>
      )}

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

> **关键点 1**：\`fields.map\` 里的 \`key\` 必须是 \`field.id\`，**不要用 \`index\`**。原因：当用户删掉第 1 行时，原来第 2 行的 index 变成 0，如果用 index 作 key，React 会复用错位的 DOM，导致 input 里的值错乱。

> **关键点 2**：\`register(\`users.\${index}.name\`)\` 这种模板字符串路径，TS 不会自动校验字符串内容。要加 \`as const\` 让 TS 把它当字面量，配合 RHF 的 \`Path<T>\` 类型能做校验。

## 2. useFieldArray 的全部 API

\`\`\`tsx
const {
  fields,        // 当前数组，每项带 id（用于渲染）
  append,        // 末尾追加
  prepend,       // 开头插入
  insert,        // 指定位置插入
  remove,        // 删除指定 index（可多个）
  swap,          // 交换两项位置
  move,          // 移动到指定位置（和 swap 类似但语义不同）
  update,        // 替换指定 index 的内容
  replace,       // 替换整个数组
} = useFieldArray({
  control,
  name: "users",
  // 可选：增删时的焦点控制
  shouldUnregister: false,
  // 可选：保持删掉的 index 的值（再次 append 时复用）
  keyName: "id", // 默认 "id"，一般不改
});
\`\`\`

\`\`\`tsx
// swap 示例：上移下移
function Row({ index, onUp, onDown }: { index: number; onUp: () => void; onDown: () => void }) {
  return (
    <div>
      <button type="button" onClick={onUp}>↑</button>
      <button type="button" onClick={onDown}>↓</button>
    </div>
  );
}

// 在表单里用 swap(index, index - 1) 上移
{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(\`users.\${index}.name\` as const)} />
    <Row
      index={index}
      onUp={() => index > 0 && swap(index, index - 1)}
      onDown={() => index < fields.length - 1 && swap(index, index + 1)}
    />
  </div>
))}
\`\`\`

## 3. 跨字段校验：依赖其他字段

\`\`\`tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 跨字段校验：开始时间必须早于结束时间
const TimeRangeSchema = z.object({
  start: z.string().min(1, "开始时间必填"),
  end: z.string().min(1, "结束时间必填"),
}).refine(
  (data) => new Date(data.start) < new Date(data.end),
  {
    message: "结束时间必须晚于开始时间",
    path: ["end"], // 错误挂到 end 字段
  }
);

type TimeRangeForm = z.infer<typeof TimeRangeSchema>;

function TimeRangeForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TimeRangeForm>({
    resolver: zodResolver(TimeRangeSchema),
    defaultValues: { start: "", end: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input type="datetime-local" {...register("start")} />
      {errors.start && <span>{errors.start.message}</span>}

      <input type="datetime-local" {...register("end")} />
      {/* 跨字段校验错误显示在这里 */}
      {errors.end && <span>{errors.end.message}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

> **避坑**：跨字段校验默认在 \`onSubmit\` 时触发。要让它在字段变化时也触发，给 \`useForm\` 加 \`mode: "onChange"\` 或 \`mode: "all"\`。

## 4. 多步表单：状态拆分策略

多步表单（如注册分 3 步）有两种实现方式：

- **方式 A：分多个 form，每步存自己的 state**——简单但要手动合并数据。
- **方式 B：一个 form，多步切换显示**——RHF 推荐，数据连贯。

\`\`\`tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 完整表单 schema
const MultiStepSchema = z.object({
  // 第 1 步：账户
  username: z.string().min(3, "用户名至少 3 位"),
  email: z.string().email("邮箱格式不对"),
  // 第 2 步：个人信息
  name: z.string().min(1, "姓名必填"),
  age: z.number().int().min(18, "必须 18 岁以上"),
  // 第 3 步：偏好
  newsletter: z.boolean(),
});

type MultiStepForm = z.infer<typeof MultiStepSchema>;

// 每一步要校验的字段（按步骤切分）
const stepFields: (keyof MultiStepForm)[][] = [
  ["username", "email"],       // 第 1 步
  ["name", "age"],             // 第 2 步
  ["newsletter"],              // 第 3 步
];

function MultiStepFormDemo() {
  const [step, setStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger, // 手动触发校验
    formState: { errors },
  } = useForm<MultiStepForm>({
    resolver: zodResolver(MultiStepSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      age: 0,
      newsletter: false,
    },
    mode: "onChange",
  });

  // 下一步：先校验当前步的字段，通过才前进
  const onNext = async () => {
    // trigger 只校验指定字段，返回 boolean
    const valid = await trigger(stepFields[step]);
    if (valid) {
      setStep((s) => Math.min(s + 1, stepFields.length - 1));
    }
  };

  const onPrev = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = (data: MultiStepForm) => {
    console.log("最终提交：", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 第 1 步：账户 */}
      {step === 0 && (
        <div>
          <h3>第 1 步：账户</h3>
          <input placeholder="用户名" {...register("username")} />
          {errors.username && <span>{errors.username.message}</span>}

          <input placeholder="邮箱" {...register("email")} />
          {errors.email && <span>{errors.email.message}</span>}
        </div>
      )}

      {/* 第 2 步：个人信息 */}
      {step === 1 && (
        <div>
          <h3>第 2 步：个人信息</h3>
          <input placeholder="姓名" {...register("name")} />
          {errors.name && <span>{errors.name.message}</span>}

          <input
            type="number"
            {...register("age", { valueAsNumber: true })}
          />
          {errors.age && <span>{errors.age.message}</span>}
        </div>
      )}

      {/* 第 3 步：偏好 */}
      {step === 2 && (
        <div>
          <h3>第 3 步：偏好</h3>
          <label>
            <input type="checkbox" {...register("newsletter")} />
            订阅周报
          </label>
        </div>
      )}

      {/* 导航按钮 */}
      {step > 0 && <button type="button" onClick={onPrev}>上一步</button>}
      {step < stepFields.length - 1 ? (
        <button type="button" onClick={onNext}>下一步</button>
      ) : (
        <button type="submit">提交</button>
      )}
    </form>
  );
}
\`\`\`

> **关键点**：
> - \`trigger(["username", "email"])\` 只校验指定字段——这是分步校验的核心 API。
> - 整个表单始终是**一份 useForm 实例**，切步只是 UI 上的切换，数据是连贯的。
> - 用户点"上一步"再"下一步"切换，已填的数据都还在。

## 5. 提交与重置

\`\`\`tsx
import { useForm } from "react-hook-form";

type FormValues = { name: string; age: number };

function SubmitResetDemo() {
  const {
    register,
    handleSubmit,
    reset,        // 重置表单到 defaultValues 或指定值
    formState: { isSubmitting, isDirty },
  } = useForm<FormValues>({
    defaultValues: { name: "", age: 0 },
  });

  const onSubmit = async (data: FormValues) => {
    // isSubmitting：提交过程中为 true，用于禁用按钮
    await fetch("/api/save", { method: "POST", body: JSON.stringify(data) });
    // 提交成功后重置表单
    reset();
  };

  // isDirty：表单是否有修改（用户改过任何字段）
  // 用于"离开页面"提示
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      <input type="number" {...register("age", { valueAsNumber: true })} />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "保存中..." : "保存"}
      </button>

      {/* 手动重置按钮 */}
      <button type="button" onClick={() => reset()} disabled={!isDirty}>
        重置
      </button>
    </form>
  );
}
\`\`\`

> **避坑**：\`reset()\` 不传参时重置到 \`defaultValues\`。如果想"重置成某个新值"（比如提交成功后服务端返回了带 id 的对象），传参：\`reset({ name: "Alice", age: 20 })\`。

## 小结

- \`useFieldArray\` 管理动态数组字段，\`key\` 必须用 \`field.id\`。
- 跨字段校验用 \`z.object(...).refine(...)\`，错误挂到 \`path\` 指定的字段。
- 多步表单用**一个 useForm + 切换显示**，\`trigger(fields)\` 做分步校验。
- \`isSubmitting\` 控制按钮状态，\`isDirty\` 判断是否有修改，\`reset()\` 重置表单。

## 避坑清单

- ❌ \`useFieldArray\` 的 \`key\` 用 \`index\`（应该用 \`field.id\`）
- ❌ 跨字段校验写在字段级 \`refine\` 里（应该写在 \`z.object\` 上）
- ❌ 多步表单用多个 \`useForm\`（应该用一个，数据连贯）
- ❌ 提交成功后不 \`reset\`（用户再次提交可能误以为是新表单）
- ❌ "上一步/下一步"不校验就放行（应该用 \`trigger\` 校验当前步）

下一部分我们进入 Hooks 全解：从 \`useState\` 开始系统拆解所有内置 Hook。`
  },

  // ============================================================
  // ch33: useState 基础与陷阱
  // ============================================================
  {
    id: "tsx3-ch33",
    group: "第五部分 Hooks 全解",
    icon: "📦",
    title: "ch33 useState 基础与陷阱",
    content: `# ch33 useState 基础与陷阱

## 为什么讲这个

\`useState\` 是 React 里最基础的 Hook，几乎每个组件都用。但"会用"和"用对"差着十万八千里——类型推断不准、对象 state 直接改、闭包陷阱、批处理搞不清——这些都是真实项目里高发的 bug。这一章先把基础打牢，下一章专攻函数式更新和批处理。

## 1. useState 的类型推断

\`\`\`tsx
import { useState } from "react";

function Demo() {
  // 1. 从初始值推断：count 是 number
  const [count, setCount] = useState(0);
  // setCount 只接受 number 或 (prev: number) => number

  // 2. 从初始值推断：name 是 string
  const [name, setName] = useState("Alice");
  // setName 只接受 string 或 (prev: string) => string

  // 3. 推断成联合类型：小心！
  const [value, setValue] = useState(0); // 这里 value 只能是 number
  // 如果想让它能存 string 和 number，必须显式指定泛型

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <p>{count}</p>
    </div>
  );
}
\`\`\`

> **关键点**：\`useState(0)\` 推断出 \`number\`，\`useState("Alice")\` 推断出 \`string\`。但如果初始值是 \`null\` 或 \`undefined\`，推断出来的类型会非常窄，下一节看怎么处理。

## 2. 显式泛型：当推断不够用时

\`\`\`tsx
import { useState } from "react";

function Demo() {
  // ❌ 推断成 null，没法存别的值
  // const [user, setUser] = useState(null);
  // user 类型是 null，setUser(null) 之外啥都存不进去

  // ✅ 显式指定泛型：user 可能是 User 对象或 null
  type User = { id: number; name: string };
  const [user, setUser] = useState<User | null>(null);
  // 现在 user 是 User | null，可以存 User 对象或 null

  // ✅ 显式指定联合类型
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  // status 只能是这三个字面量之一

  // ✅ 显式指定数组类型
  const [items, setItems] = useState<string[]>([]);
  // items 是 string[]，初始空数组

  return (
    <div>
      {/* 用 user 前必须判空 */}
      {user ? <p>{user.name}</p> : <p>未登录</p>}
    </div>
  );
}
\`\`\`

> **避坑**：\`useState<User | null>(null)\` 这种"可能为空"的模式非常常用——比如"用户未登录时 user 是 null，登录后是 User 对象"。判空用 \`if (user)\` 或 \`user?.name\`。

## 3. 函数式更新：处理依赖前值的更新

\`\`\`tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  // ❌ 危险写法：直接用 count 拼新值
  // 如果连续调用三次，只会 +1 而不是 +3（因为 count 是闭包里的旧值）
  const handleClickBad = () => {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    // 实际只 +1，因为三次都用了同一个旧 count
  };

  // ✅ 正确写法：用函数式更新，参数 prev 是最新的 state
  const handleClickGood = () => {
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
    // 实际 +3，因为每次 prev 都是更新后的值
  };

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClickGood}>+3</button>
    </div>
  );
}
\`\`\`

> **关键点**：当新值依赖前值时，**永远用函数式更新** \`setX(prev => ...)\`。这样能避免闭包陷阱和批处理下的"丢失更新"。

## 4. 对象 state 的不可变更新

React 通过"引用比较"判断 state 是否变化——直接修改对象的属性，React 不会触发重渲染：

\`\`\`tsx
import { useState } from "react";

type User = { name: string; age: number };

function UserForm() {
  const [user, setUser] = useState<User>({ name: "Alice", age: 18 });

  // ❌ 错误：直接改属性，React 不会重渲染
  const handleClickBad = () => {
    user.name = "Bob";
    // user 引用没变，React 觉得"没变化"，UI 不更新
  };

  // ✅ 正确：创建新对象
  const handleClickGood = () => {
    setUser({ ...user, name: "Bob" });
    // 用展开运算符创建新对象，name 改成 Bob，其他属性保留
  };

  // ✅ 函数式：基于 prev 更新（推荐，避免闭包陷阱）
  const handleClickBest = () => {
    setUser((prev) => ({ ...prev, name: "Bob" }));
  };

  return (
    <div>
      <p>{user.name}, {user.age}</p>
      <button onClick={handleClickBest}>改名</button>
    </div>
  );
}
\`\`\`

## 5. 嵌套对象的更新

展开运算符只做浅拷贝，嵌套对象更新要一层一层展开：

\`\`\`tsx
import { useState } from "react";

type State = {
  user: {
    profile: {
      name: string;
      age: number;
    };
  };
};

function NestedDemo() {
  const [state, setState] = useState<State>({
    user: {
      profile: { name: "Alice", age: 18 },
    },
  });

  // ❌ 错误：直接改嵌套对象
  // state.user.profile.name = "Bob"; // React 不会重渲染

  // ✅ 正确：每层都要展开
  const updateName = (newName: string) => {
    setState((prev) => ({
      ...prev,                          // 展开 user 同级
      user: {
        ...prev.user,                   // 展开 profile 同级
        profile: {
          ...prev.user.profile,         // 展开 name 同级
          name: newName,                // 覆盖 name
        },
      },
    }));
  };

  return (
    <div>
      <p>{state.user.profile.name}</p>
      <button onClick={() => updateName("Bob")}>改名</button>
    </div>
  );
}
\`\`\`

> **避坑**：嵌套层级太深时，展开运算符写起来很痛苦。两个出路：
> 1. 把深层 state 拆成多个独立的 useState（拍平）。
> 2. 用 \`useReducer\`（后面章节讲）或 Immer 的 \`produce\`。

## 6. 数组 state 的不可变更新

\`\`\`tsx
import { useState } from "react";

function TodoList() {
  const [todos, setTodos] = useState<string[]>(["吃饭", "睡觉"]);

  // ❌ 错误：直接 push（修改原数组）
  // todos.push("打豆豆"); setTodos(todos); // React 不重渲染

  // ✅ 添加：用展开或 concat
  const add = (item: string) => {
    setTodos((prev) => [...prev, item]);
  };

  // ✅ 删除：filter
  const remove = (index: number) => {
    setTodos((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ 修改：map
  const update = (index: number, newItem: string) => {
    setTodos((prev) =>
      prev.map((item, i) => (i === index ? newItem : item))
    );
  };

  // ✅ 插入：slice + spread
  const insert = (index: number, item: string) => {
    setTodos((prev) => [
      ...prev.slice(0, index),
      item,
      ...prev.slice(index),
    ]);
  };

  return (
    <div>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>
            {todo}
            <button onClick={() => remove(i)}>删</button>
          </li>
        ))}
      </ul>
      <button onClick={() => add("打豆豆")}>添加</button>
    </div>
  );
}
\`\`\`

> **避坑**：用 \`index\` 作 \`key\` 在数组增删时会出 bug（DOM 复用错位）。真实场景里数组元素应该有稳定的 \`id\` 字段。

## 7. state 类型推断的常见陷阱

\`\`\`tsx
import { useState } from "react";

function Traps() {
  // 陷阱 1：初始值是空数组，推断成 never[]
  // const [items, setItems] = useState([]); // ❌ items 是 never[]
  // 解决：显式指定泛型
  const [items, setItems] = useState<string[]>([]);

  // 陷阱 2：初始值是 null，推断成 null
  // const [data, setData] = useState(null); // ❌ data 是 null
  // 解决：联合类型 + 泛型
  const [data, setData] = useState<string | null>(null);

  // 陷阱 3：传函数当初始值，会被当初始值而不是初始化函数
  // ❌ 这个函数会在每次渲染时执行（即使只在第一次有用）
  // const [val, setVal] = useState(computeExpensiveValue());
  // ✅ 用 lazy initializer：传一个返回初始值的函数
  const [val, setVal] = useState(() => computeExpensiveValue());

  function computeExpensiveValue(): string {
    console.log("只会在首次渲染时执行");
    return "expensive";
  }

  return <div>{val}</div>;
}
\`\`\`

> **关键点**：\`useState(() => initialValue)\` 是**懒初始化**——传入的函数只在首次渲染时执行一次。如果初始值计算很贵（如读 localStorage、解析大 JSON），必须用懒初始化。

## 小结

- \`useState\` 能从初始值推断类型；初始值是 \`null\` 或空数组时必须显式指定泛型。
- 新值依赖前值时用函数式更新 \`setX(prev => ...)\`。
- 对象/数组 state 必须不可变更新：创建新对象、新数组，不能直接改属性。
- 嵌套对象要层层展开；太深的话考虑拍平或用 \`useReducer\`。
- 初始值计算昂贵时用懒初始化 \`useState(() => expensive())\`。

## 避坑清单

- ❌ \`useState(null)\` 不加泛型（应该写 \`useState<T | null>(null)\`）
- ❌ \`useState([])\` 不加泛型（推断成 \`never[]\`，应该写 \`useState<T[]>([])\`）
- ❌ 直接改对象属性 \`user.name = "Bob"\`（应该 \`setUser({...user, name: "Bob"})\`）
- ❌ 连续多次 \`setX(x + 1)\`（应该用 \`setX(prev => prev + 1)\`）
- ❌ 初始值昂贵却不懒初始化（应该 \`useState(() => expensive())\`）

下一章我们专门看函数式更新和 React 18 的自动批处理。`
  },

  // ============================================================
  // ch34: useState 函数式更新与批处理
  // ============================================================
  {
    id: "tsx3-ch34",
    group: "第五部分 Hooks 全解",
    icon: "⚡",
    title: "ch34 useState 函数式更新与批处理",
    content: `# ch34 useState 函数式更新与批处理

## 为什么讲这个

React 18 引入了**自动批处理**（Automatic Batching），把多次 \`setState\` 合并成一次重渲染——这是性能提升的关键机制。但批处理也带来一堆"反直觉"的陷阱：为什么连续三次 \`setCount(count+1)\` 只 +1？为什么 \`flushSync\` 能强制同步？为什么 setTimeout 里的 setState 行为和 React 17 不一样？这一章把这些底层机制讲清楚。

## 1. 函数式更新：避免丢失更新

\`\`\`tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  // 场景：一次点击要 +3
  const handleClick = () => {
    // ❌ 写法 1：直接用 count
    // setCount(count + 1); // count 是闭包捕获的旧值，比如 0
    // setCount(count + 1); // 还是基于旧值 0
    // setCount(count + 1); // 还是基于旧值 0
    // 结果：count 变成 1（只 +1）

    // ✅ 写法 2：函数式更新
    setCount((prev) => prev + 1); // prev = 0，返回 1
    setCount((prev) => prev + 1); // prev = 1，返回 2
    setCount((prev) => prev + 1); // prev = 2，返回 3
    // 结果：count 变成 3
  };

  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

**为什么直接写不行**？因为 \`count\` 是闭包里的值——本次渲染时 \`count\` 是 \`0\`，三次 \`setCount(count + 1)\` 都是基于这个 \`0\`。React 把它们批处理成一次更新，但每次计算用的都是同一个旧值 \`0\`。

**为什么函数式更新行**？\`setCount(prev => prev + 1)\` 里的 \`prev\` 是 React 内部维护的"最新值"——第一次调用 prev 是 0，第二次 prev 是 1（因为前一次已经更新了内部状态），第三次 prev 是 2。批处理时按顺序应用，最终结果是 3。

## 2. React 18 自动批处理

React 18 之前，批处理只在 React 自己的事件处理器里生效；React 18 之后，**所有场景都自动批处理**：

\`\`\`tsx
import { useState } from "react";

function Demo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  // React 17：在 React 事件里批处理，2 次 setState 合并成 1 次渲染
  // React 18：所有场景都批处理
  const handleClick = () => {
    setCount(1);
    setText("hello");
    // 2 次 setState，但只触发 1 次重渲染
  };

  // Promise 里的 setState
  const handleClickAsync = async () => {
    await fetch("/api/data");
    setCount(2);
    setText("world");
    // React 17：2 次渲染（Promise 不批处理）
    // React 18：1 次渲染（自动批处理）
  };

  // setTimeout 里的 setState
  const handleClickTimeout = () => {
    setTimeout(() => {
      setCount(3);
      setText("!");
      // React 17：2 次渲染
      // React 18：1 次渲染
    }, 1000);
  };

  return (
    <div>
      <p>{count} {text}</p>
      <button onClick={handleClick}>同步</button>
      <button onClick={handleClickAsync}>异步</button>
      <button onClick={handleClickTimeout}>定时</button>
    </div>
  );
}
\`\`\`

> **关键点**：React 18 的自动批处理对你写的代码是透明的——你不需要改任何代码就享受到了性能提升。但要理解它存在，才能解释一些"为什么只渲染一次"的现象。

## 3. flushSync：强制同步刷新

有时候你**不希望**批处理——比如你想在 \`setState\` 之后立刻读到 DOM 的新值。这时用 \`flushSync\` 强制立即刷新：

\`\`\`tsx
import { useState, flushSync } from "react-dom";

function FlushSyncDemo() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 普通批处理：两次 setCount 合并，最后只渲染一次
    setCount(1);
    setCount(2);
    console.log("批处理后 count 还是闭包里的旧值：", count); // 0

    // flushSync：立即刷新，强制同步渲染
    flushSync(() => {
      setCount(3);
    });
    // 这里 DOM 已经更新了，count 也已经是 3（在下次渲染里）
    console.log("flushSync 后下次渲染的 count 会是 3");

    // 但要注意：当前函数里的 count 变量还是旧的（闭包）
    // flushSync 影响的是 DOM 和下次渲染，不影响当前函数作用域
  };

  return (
    <div>
      <p ref={(el) => { console.log("渲染时 DOM：", el?.textContent); }}>{count}</p>
      <button onClick={handleClick}>点击</button>
    </div>
  );
}
\`\`\`

> **避坑**：\`flushSync\` 是逃生舱，**不要滥用**。它会让你的组件失去 React 18 批处理的性能优势。常见用法：
> - 在 \`setState\` 后立刻读取 DOM 测量尺寸（如滚动到底部）。
> - 在第三方库（如某些动画库）需要同步刷新的场景。

\`\`\`tsx
// 典型用法：滚动到底部
function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const addMessage = (msg: string) => {
    // flushSync 确保 DOM 更新后再读 scrollHeight
    flushSync(() => {
      setMessages((prev) => [...prev, msg]);
    });
    // DOM 已经包含新消息了，可以正确滚动
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  return <div ref={listRef}>{/* 消息列表 */}</div>;
}
\`\`\`

## 4. 闭包陷阱（Stale Closure）

\`\`\`tsx
import { useState, useEffect } from "react";

function StaleClosureDemo() {
  const [count, setCount] = useState(0);

  // ❌ 陷阱：useEffect 里捕获了 count，但依赖数组为空
  useEffect(() => {
    // 这里的 count 是首次渲染时的值（0），永远是 0
    const timer = setInterval(() => {
      console.log("count:", count); // 永远打印 0
      setCount(count + 1); // 永远把 count 设成 1
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 空依赖：effect 只在首次渲染后执行一次

  // ✅ 修复 1：把 count 加入依赖
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     console.log("count:", count);
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, [count]); // 每次 count 变都重建 timer（代价：定时器反复重建）

  // ✅ 修复 2：用函数式更新，绕开闭包
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => prev + 1); // prev 是最新值，不依赖闭包
    }, 1000);
    return () => clearInterval(timer);
  }, []); // 空依赖也能正常 +1

  return <div>{count}</div>;
}
\`\`\`

> **关键点**：闭包陷阱的本质是——\`useEffect\` 的回调在首次渲染时捕获了当时的 \`count\`（值是 0），后续即使 \`count\` 变了，回调里读到的还是 0。两种修复方式：
> 1. 把 \`count\` 加进依赖数组，让 effect 重新建立并捕获新的 \`count\`。
> 2. 用函数式更新 \`setCount(prev => ...)\`，让 React 传最新值进来，绕开闭包。

## 5. useState 引用陷阱：存对象 vs 存函数

\`\`\`tsx
import { useState } from "react";

function Traps() {
  // 陷阱 1：每次渲染都创建新对象，但不一定是 bug
  const [user, setUser] = useState({ name: "Alice", age: 18 });
  // user 引用在 setUser 之前不变，每次渲染都是同一个对象

  // 陷阱 2：想存一个函数当 state
  // ❌ 这样写会被当成 lazy initializer，函数只在首次执行一次
  // const [fn, setFn] = useState(() => console.log("hi"));
  // ❌ fn 实际上是函数的返回值（undefined），不是函数本身

  // ✅ 想存函数本身，再包一层
  const [fn, setFn] = useState<() => void>(() => () => console.log("hi"));
  // 外层函数是 lazy initializer，返回内层函数作为初始 state
  // 现在 fn 是一个 () => void 函数
  return (
    <div>
      <button onClick={() => fn()}>调用</button>
      <button onClick={() => setFn(() => () => console.log("bye"))}>换函数</button>
    </div>
  );
}
\`\`\`

## 6. 同步更新 vs 异步更新：心智模型

\`\`\`tsx
import { useState } from "react";

function MentalModel() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log("1. 点击时 count:", count); // 0
    setCount(count + 1);
    console.log("2. setCount 后 count:", count); // 还是 0！
    // 因为 setCount 不立即更新当前作用域的 count
    // 它只是排了个更新，下次渲染时 count 才会变成 1

    // 想立即拿到新值：用临时变量
    const nextCount = count + 1;
    setCount(nextCount);
    console.log("3. 临时变量 nextCount:", nextCount); // 1
  };

  return <button onClick={handleClick}>{count}</button>;
}
\`\`\`

**心智模型**：
- \`setCount\` 不立即更新 \`count\` 变量，它只是"安排一次更新"。
- 当前函数作用域里的 \`count\` 还是旧值，直到下次渲染。
- 想立即用新值，用临时变量或函数式更新里的 \`prev\`。

## 小结

- 新值依赖前值时**必须**用函数式更新 \`setX(prev => ...)\`。
- React 18 自动批处理：所有场景的多次 \`setState\` 都合并成一次渲染。
- \`flushSync\` 是逃生舱，只在"setState 后立刻读 DOM"时用。
- 闭包陷阱：\`useEffect\` 捕获的变量是闭包值，要么加依赖要么用函数式更新绕开。
- \`setCount\` 不立即更新当前作用域的 \`count\`，想用新值用临时变量。

## 避坑清单

- ❌ 连续多次 \`setX(x + 1)\`（应该用 \`setX(prev => prev + 1)\`）
- ❌ \`useEffect\` 里读 state 但依赖数组为空（应该加依赖或用函数式更新）
- ❌ 在 \`setState\` 后立刻读当前作用域的 state 变量（应该用临时变量）
- ❌ 用 \`flushSync\` 替代普通 \`setState\`（性能损失大，应该只在必要时用）
- ❌ 想存函数当 state 直接 \`useState(() => fn)\`（被当 lazy initializer，应该 \`useState<() => void>(() => fn)\`）

下一章我们看 React 最容易踩坑的 Hook：\`useEffect\`。`
  },

  // ============================================================
  // ch35: useEffect 基础
  // ============================================================
  {
    id: "tsx3-ch35",
    group: "第五部分 Hooks 全解",
    icon: "🔄",
    title: "ch35 useEffect 基础",
    content: `# ch35 useEffect 基础

## 为什么讲这个

\`useEffect\` 是 React 里**最容易踩坑**的 Hook——它处理"副作用"（数据请求、订阅、定时器、操作 DOM），但稍不注意就会出现无限循环、内存泄漏、闭包陷阱。这一章把 \`useEffect\` 的核心概念、依赖数组的三种形态、清理函数的作用、常见误区讲清楚。

## 1. 什么是副作用

React 组件的"本职工作"是：根据 props 和 state 计算 JSX。除此之外的事情都叫**副作用**（side effect）：

- 请求数据（fetch、axios）
- 订阅事件（WebSocket、addEventListener）
- 启动定时器（setInterval、setTimeout）
- 操作 DOM（measure、scrollTo）
- 写 localStorage

\`\`\`tsx
import { useState, useEffect } from "react";

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<{ name: string } | null>(null);

  // useEffect 接收两个参数：
  // 1. 副作用函数：组件渲染后执行
  // 2. 依赖数组：只有数组里的值变化时才重新执行
  useEffect(() => {
    // 这里面是副作用代码
    fetch(\`/api/users/\${userId}\`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [userId]); // 依赖 userId：userId 变了才重新请求

  if (!user) return <div>加载中...</div>;
  return <div>{user.name}</div>;
}
\`\`\`

## 2. 依赖数组的三种形态

\`\`\`tsx
import { useEffect, useState } from "react";

function Demo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Alice");

  // 形态 1：空数组 []
  // effect 只在首次渲染后执行一次，之后不再执行
  useEffect(() => {
    console.log("组件挂载了");
    // 适合：初始化订阅、读 localStorage 一次
  }, []);

  // 形态 2：有依赖项 [count]
  // 首次渲染 + count 变化时执行
  useEffect(() => {
    console.log("count 变了:", count);
    // 适合：依赖 count 的副作用（如根据 count 请求分页数据）
  }, [count]);

  // 形态 3：无依赖数组（不传第二个参数）
  // 每次渲染后都执行（极少用，容易无限循环）
  useEffect(() => {
    console.log("每次渲染后都执行");
  });
  // 几乎不要这么写，除非你真的知道在做什么

  return <div>{count}</div>;
}
\`\`\`

> **关键点**：依赖数组决定了 effect 的执行时机。**默认推荐用空数组或具体依赖**，"无依赖数组"几乎总是错的。

## 3. 清理函数：防止内存泄漏

effect 函数可以**返回一个清理函数**，在组件卸载或下次 effect 执行前调用：

\`\`\`tsx
import { useEffect, useState } from "react";

function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 启动定时器
    const timer = setInterval(() => {
      setCount((prev) => prev + 1);
    }, 1000);

    // 返回清理函数：组件卸载时清除定时器
    // ⚠️ 不清理的话，组件卸载后定时器还在跑，会一直 setState 报警告
    return () => {
      clearInterval(timer);
      console.log("定时器已清除");
    };
  }, []); // 空依赖：只在挂载时启动一次

  return <div>{count}</div>;
}
\`\`\`

**清理函数的执行时机**：

\`\`\`tsx
function CleanupTiming({ id }: { id: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log(\`effect 执行，id=\${id}\`);

    return () => {
      // 1. 组件卸载时执行
      // 2. 下次 effect 执行前执行（依赖变化触发新 effect 前）
      console.log(\`cleanup 执行，id=\${id}\`);
    };
  }, [id]);

  // 当 id 从 1 变成 2 时：
  // 1. cleanup 执行（id=1）
  // 2. effect 执行（id=2）
  return <div>{id}</div>;
}
\`\`\`

## 4. 事件订阅的清理

\`\`\`tsx
import { useEffect, useState } from "react";

function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // 订阅 window resize 事件
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // 清理：移除事件监听
    // ⚠️ 不清理的话，组件卸载后还在监听，造成内存泄漏
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // 空依赖：只在挂载时订阅一次

  return (
    <div>
      窗口大小：{size.width} x {size.height}
    </div>
  );
}
\`\`\`

> **关键点**：\`addEventListener\` 和 \`removeEventListener\` 必须用**同一个函数引用**。如果写成：
> \`\`\`tsx
> window.addEventListener("resize", () => setSize(...));
> return () => window.removeEventListener("resize", () => setSize(...));
> \`\`\`
> 两个箭头函数是不同的引用，\`removeEventListener\` 移除不了。必须把函数提取出来。

## 5. 数据请求的正确写法

\`\`\`tsx
import { useEffect, useState } from "react";

type User = { id: number; name: string };
type State =
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error };

function UserDetail({ userId }: { userId: number }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    // 1. 每次请求前先设 loading
    setState({ status: "loading" });

    // 2. 用 AbortController 取消旧请求
    //    场景：用户快速切换 userId，旧请求还没回来
    //    不取消的话，旧请求可能在新请求之后返回，覆盖新数据
    const controller = new AbortController();

    fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: User) => {
        setState({ status: "success", data });
      })
      .catch((err: Error) => {
        // AbortError 是主动取消，不算真正的错误
        if (err.name !== "AbortError") {
          setState({ status: "error", error: err });
        }
      });

    // 3. 清理函数：取消未完成的请求
    return () => controller.abort();
  }, [userId]); // 依赖 userId：切换用户时重新请求

  if (state.status === "loading") return <div>加载中...</div>;
  if (state.status === "error") return <div>出错了：{state.error.message}</div>;
  return <div>{state.data.name}</div>;
}
\`\`\`

> **关键点**：用 \`AbortController\` 取消旧请求是处理"竞态"的标准模式。如果不取消，用户快速切换 \`userId\` 时，旧请求可能比新请求晚返回，导致显示的数据是上一个用户的。

## 6. 无限循环：最常见的坑

\`\`\`tsx
import { useEffect, useState } from "react";

function InfiniteLoop() {
  const [count, setCount] = useState(0);

  // ❌ 陷阱 1：无依赖数组 + setState
  // useEffect(() => {
  //   setCount(count + 1);
  // }); // 每次渲染后执行，setCount 又触发渲染，无限循环

  // ❌ 陷阱 2：依赖里放对象/数组
  // const [filters, setFilters] = useState({ page: 1 });
  // useEffect(() => {
  //   fetch("/api/data?" + new URLSearchParams(filters));
  // }, [filters]); // filters 是对象，每次 setFilters 都是新引用，可能无限循环

  // ✅ 修复 2：依赖具体字段
  // useEffect(() => {
  //   fetch("/api/data?page=" + filters.page);
  // }, [filters.page]); // 只依赖 page 字段

  // ❌ 陷阱 3：在 effect 里改了自己依赖的 state
  // const [data, setData] = useState([]);
  // useEffect(() => {
  //   fetch("/api/data").then(setData);
  // }, [data]); // data 变化触发 effect，effect 又改 data，无限循环

  // ✅ 修复 3：去掉不必要依赖
  // useEffect(() => {
  //   fetch("/api/data").then(setData);
  // }, []); // 只在挂载时请求一次

  return <div>{count}</div>;
}
\`\`\`

**判断无限循环的心法**：
1. effect 里 setState 了吗？
2. setState 改的是依赖数组里的值吗？
3. 如果是，就是无限循环。

## 7. 依赖数组的检查：eslint-plugin-react-hooks

\`\`\`tsx
// 推荐在 .eslintrc 里开启：
// {
//   "plugins": ["react-hooks"],
//   "rules": {
//     "react-hooks/exhaustive-deps": "error"
//   }
// }

// 这条规则会检查你的 effect 依赖数组是否"完整"
// ❌ 缺依赖会报警
function Bad({ userId }: { userId: number }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    // 用了 userId 但依赖数组里没写
    fetch(\`/api/\${userId}\`).then(setData);
  }, []); // eslint 报警告：missing 'userId'
  return <div />;
}

// ✅ 补全依赖
function Good({ userId }: { userId: number }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(\`/api/\${userId}\`).then(setData);
  }, [userId]); // 依赖完整
  return <div />;
}
\`\`\`

> **强烈建议**：开 ESLint 的 \`react-hooks/exhaustive-deps\` 规则。它能拦下 80% 的 effect 陷阱。

## 8. useEffect 的心智模型

\`\`\`tsx
// 不要把 useEffect 当成"生命周期"的等价物
// ❌ 心智：componentDidMount + componentDidUpdate + componentWillUnmount
// ✅ 心智：声明一个"依赖某些值的副作用"，React 保证依赖变化时副作用重新执行

// 不要在 effect 里做"派生数据"
function Bad({ items }: { items: number[] }) {
  const [total, setTotal] = useState(0);
  // ❌ 用 effect 算 total 是反模式
  // useEffect(() => {
  //   setTotal(items.reduce((a, b) => a + b, 0));
  // }, [items]);

  // ✅ 派生数据直接在渲染时算
  const total = items.reduce((a, b) => a + b, 0);
  return <div>{total}</div>;
}
\`\`\`

> **关键点**：\`useEffect\` 不是 \`componentDidMount\`。它是"声明式副作用"——你声明"这个 effect 依赖这些值"，React 保证依赖变了就重新执行。把心智模型从"生命周期"切到"声明式副作用"，能避开大多数陷阱。

## 小结

- \`useEffect\` 处理副作用：数据请求、订阅、定时器、DOM 操作。
- 依赖数组三种形态：空数组（仅挂载）、有依赖（依赖变化时执行）、无数组（每次渲染，几乎不用）。
- 清理函数：组件卸载或下次 effect 前执行，用于取消订阅、清除定时器、取消请求。
- 数据请求用 \`AbortController\` 处理竞态，事件订阅用同一函数引用才能正确移除。
- 开 \`eslint-plugin-react-hooks\` 的 \`exhaustive-deps\` 规则拦下大多数陷阱。

## 避坑清单

- ❌ 不传依赖数组导致每次渲染都执行 effect（应该明确依赖）
- ❌ 在 effect 里 \`setState\` 自己依赖的值（导致无限循环）
- ❌ 事件订阅用不同的函数引用（导致 \`removeEventListener\` 失效）
- ❌ 数据请求不取消旧请求（导致竞态：旧请求覆盖新数据）
- ❌ 用 effect 算派生数据（应该直接在渲染时算）
- ❌ 把 \`useEffect\` 当 \`componentDidMount\` 用（应该用"声明式副作用"心智模型）

下一章我们看 \`useRef\` 的进阶用法：可变值、命令式 DOM 操作、稳定引用。`
  },
];

export { chapters };
