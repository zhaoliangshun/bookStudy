export const chapters = [
  {
    id: "rhf-controller",
    group: "进阶集成",
    icon: "🎛️",
    title: "Controller：集成 UI 组件库",
    content: `# Controller：集成 UI 组件库

\`register\` 适用于原生 input，但很多 UI 库（MUI、AntD、React Select 等）的组件不暴露 ref，或者是受控组件，这时候需要用 \`Controller\`。

---

## 为什么需要 Controller？

\`register\` 的工作原理是通过 ref 绑定 DOM 元素，但有些组件：
- 不暴露原生 input 的 ref
- 是受控组件（通过 value/onChange 控制值）
- 是自定义的 React 组件

这时候就需要 \`Controller\` 作为"桥梁"，把表单状态和第三方组件连接起来。

---

## Controller 基本用法

\`\`\`jsx
import { useForm, Controller } from "react-hook-form";
// 假设你用了某个 UI 库的 Input 组件
// import { Input } from "@mui/material";
// import Select from "react-select";

function FormWithController() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Controller 基本结构 */}
      <Controller
        name="firstName"           // 字段名（必填）
        control={control}          // control 对象（必填）
        defaultValue=""            // 默认值
        rules={{ required: true }} // 验证规则（和 register 的第二个参数一样）
        render={({ field }) => (   // render prop，返回你的组件
          <input {...field} />
          // field 包含: onChange, onBlur, value, name, ref
        )}
      />

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

---

## field 对象有什么？

\`render\` 函数接收的 \`field\` 对象包含以下属性：

\`\`\`javascript
{
  onChange: (value) => void,  // 更新值的函数
  onBlur: () => void,         // 标记为"已触碰"
  value: any,                 // 当前字段值
  name: string,               // 字段名
  ref: (ref) => void          // 用于聚焦的 ref
}
\`\`\`

把这些属性绑定到你的组件上，React Hook Form 就能管理这个组件的值了！

---

## 集成 MUI (Material UI)

\`\`\`jsx
import { TextField, Checkbox, Button } from "@mui/material";
import { useForm, Controller } from "react-hook-form";

function MUIForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      email: "",
      remember: false
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* MUI TextField */}
      <Controller
        name="name"
        control={control}
        rules={{ required: "请输入姓名" }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="姓名"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            variant="outlined"
            fullWidth
            margin="normal"
          />
        )}
      />

      {/* MUI Checkbox */}
      <Controller
        name="remember"
        control={control}
        render={({ field }) => (
          <label>
            <Checkbox
              checked={field.value}
              onChange={field.onChange}
            />
            记住我
          </label>
        )}
      />

      <Button type="submit" variant="contained">
        登录
      </Button>
    </form>
  );
}
\`\`\`

---

## 集成 React Select

\`\`\`jsx
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";

const options = [
  { value: "beijing", label: "北京" },
  { value: "shanghai", label: "上海" },
  { value: "guangzhou", label: "广州" },
  { value: "shenzhen", label: "深圳" }
];

function ReactSelectForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="city"
        control={control}
        rules={{ required: "请选择城市" }}
        render={({ field, fieldState }) => (
          <div>
            <Select
              {...field}
              options={options}
              placeholder="请选择城市"
              // React Select 的 value 格式：{ value, label }
              // onChange 返回的是整个 option 对象，直接传给 field
            />
            {fieldState.error && (
              <p style={{ color: "red" }}>{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      {/* 多选 */}
      <Controller
        name="hobbies"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <Select
            {...field}
            options={[
              { value: "coding", label: "编程" },
              { value: "reading", label: "阅读" },
              { value: "sports", label: "运动" }
            ]}
            isMulti
            placeholder="选择兴趣爱好"
          />
        )}
      />

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

---

## fieldState：字段状态

\`render\` 还可以获取 \`fieldState\`，包含当前字段的状态：

\`\`\`javascript
render={({ field, fieldState }) => {
  // fieldState 包含：
  fieldState.invalid   // 是否验证失败
  fieldState.isTouched // 是否被触碰过（blur 过）
  fieldState.isDirty   // 值是否被修改过
  fieldState.error     // 错误对象 { message, type, ref }

  return <YourComponent />;
}}
\`\`\`

---

## useController：Hook 版的 Controller

如果你更喜欢自定义 Hook，或者想在自定义组件中复用逻辑，可以用 \`useController\`：

\`\`\`jsx
import { useForm, useController } from "react-hook-form";

// 自定义 Input 组件
function CustomInput({ control, name, label, rules }) {
  const {
    field,
    fieldState: { invalid, error, isTouched }
  } = useController({
    name,
    control,
    rules,
    defaultValue: ""
  });

  return (
    <div>
      <label>{label}</label>
      <input
        {...field}
        style={{ border: invalid ? "1px solid red" : "1px solid #ddd" }}
      />
      {error && <span style={{ color: "red" }}>{error.message}</span>}
    </div>
  );
}

// 使用自定义组件
function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <CustomInput
        name="username"
        label="用户名"
        control={control}
        rules={{ required: "必填" }}
      />
      <CustomInput
        name="email"
        label="邮箱"
        control={control}
        rules={{ required: "必填" }}
      />
      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

---

## 常见问题

### Q: 为什么不用 register？

A: 如果组件是原生 input/select/textarea，优先用 \`register\`（更简单、性能更好）。只有当组件是第三方 UI 库组件或自定义受控组件时，才需要 \`Controller\`。

### Q: defaultValue 应该在哪里设置？

A: 两个地方选一个：
1. \`useForm\` 的 \`defaultValues\`（推荐）
2. \`Controller\` 的 \`defaultValue\` prop

⚠️ **不要两个地方都设，也不要都不设！**

### Q: Controller 和 register 的验证规则一样吗？

A: 完全一样！\`rules\` 参数接受和 \`register\` 第二个参数相同的配置对象：required、minLength、pattern、validate 等。

---

## 本章小结

✅ \`register\` 用于原生表单元素
✅ \`Controller\` 用于第三方 UI 组件和受控组件
✅ \`Controller\` 需要 \`name\`, \`control\`, \`render\` 三个必填 props
✅ \`field\` 对象包含 onChange, onBlur, value, name, ref
✅ \`fieldState\` 包含 invalid, error, isTouched, isDirty
✅ \`useController\` 是 Hook 版本，适合封装自定义组件
✅ defaultValue 要么在 useForm 设，要么在 Controller 设，选一个

下一章学习用 Zod 进行 Schema 验证！`,
    code: `import { useForm, Controller } from "react-hook-form";

// Controller 集成自定义组件示例
// 这里用原生 input 演示，实际项目中替换成 MUI/AntD/React Select 等即可

// 模拟一个自定义输入组件（类似 UI 库组件）
function MyInput({ value, onChange, onBlur, label, error, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 14 }}>{label}</label>
      <input
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: 8,
          marginTop: 4,
          border: error ? "1px solid red" : "1px solid #ddd",
          borderRadius: 4,
          boxSizing: "border-box"
        }}
      />
      {error && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

// 模拟自定义 Select 组件
function MySelect({ value, onChange, onBlur, options, placeholder, error }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <select
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          width: "100%",
          padding: 8,
          marginTop: 4,
          border: error ? "1px solid red" : "1px solid #ddd",
          borderRadius: 4,
          boxSizing: "border-box"
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

// 模拟自定义 Toggle 组件
function MyToggle({ value, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          border: "none",
          background: value ? "#28a745" : "#ccc",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: value ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s"
          }}
        />
      </button>
      {label}
    </label>
  );
}

export default function ControllerDemo() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      city: "",
      subscribe: false
    }
  });

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 800));
    console.log("提交数据:", data);
    alert("提交成功！\\n" + JSON.stringify(data, null, 2));
  };

  const cityOptions = [
    { value: "beijing", label: "北京" },
    { value: "shanghai", label: "上海" },
    { value: "guangzhou", label: "广州" },
    { value: "shenzhen", label: "深圳" },
    { value: "hangzhou", label: "杭州" }
  ];

  return (
    <div style={{ maxWidth: 450, margin: "40px auto", padding: 20 }}>
      <h2>🎛️ Controller 集成示例</h2>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
        使用 Controller 连接自定义组件（实际项目中替换成 MUI/AntD/React Select 等）
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 自定义 Input */}
        <Controller
          name="name"
          control={control}
          rules={{ required: "请输入姓名" }}
          render={({ field, fieldState }) => (
            <MyInput
              {...field}
              label="姓名 *"
              placeholder="请输入姓名"
              error={fieldState.error?.message}
            />
          )}
        />

        {/* 自定义 Input - 邮箱 */}
        <Controller
          name="email"
          control={control}
          rules={{
            required: "请输入邮箱",
            pattern: {
              value: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
              message: "邮箱格式不正确"
            }
          }}
          render={({ field, fieldState }) => (
            <MyInput
              {...field}
              label="邮箱 *"
              placeholder="example@email.com"
              error={fieldState.error?.message}
            />
          )}
        />

        {/* 自定义 Select */}
        <Controller
          name="city"
          control={control}
          rules={{ required: "请选择城市" }}
          render={({ field, fieldState }) => (
            <div>
              <label style={{ fontSize: 14 }}>城市 *</label>
              <MySelect
                {...field}
                options={cityOptions}
                placeholder="请选择城市"
                error={fieldState.error?.message}
              />
            </div>
          )}
        />

        {/* 自定义 Toggle */}
        <Controller
          name="subscribe"
          control={control}
          render={({ field }) => (
            <MyToggle
              value={field.value}
              onChange={field.onChange}
              label="订阅邮件通知"
            />
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 10,
            background: isSubmitting ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: 16
          }}
        >
          {isSubmitting ? "提交中..." : "提交"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 12, color: "#999" }}>
        💡 把上面的 MyInput/MySelect/MyToggle 替换成你用的 UI 库组件（如 MUI TextField、AntD Input、React Select 等），用法完全一样！
      </p>
    </div>
  );
}
`,
  },

  {
    id: "rhf-zod",
    group: "进阶集成",
    icon: "🛡️",
    title: "Zod Schema 验证",
    content: `# Zod Schema 验证

虽然 React Hook Form 内置验证已经够用，但配合 [Zod](https://zod.dev)（或 Yup/Joi）可以获得更强大的类型安全和 Schema 复用能力。

---

## 为什么用 Zod？

1. **类型安全**：Schema 定义后，TypeScript 类型自动推导
2. **复用性**：同一个 Schema 可以前后端共用
3. **更强大的验证**：复杂的嵌套验证、条件验证更方便
4. **错误信息统一**：错误格式标准化

---

## 安装

需要安装两个包：

\`\`\`bash
npm install zod @hookform/resolvers
\`\`\`

- \`zod\`：Schema 验证库
- \`@hookform/resolvers\`：React Hook Form 的验证适配器，支持 Zod/Yup/Joi 等

---

## 基本用法

\`\`\`jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. 用 Zod 定义 Schema
const schema = z.object({
  username: z
    .string()
    .min(2, "用户名至少2个字符")
    .max(20, "用户名最多20个字符"),
  email: z
    .string()
    .email("请输入有效的邮箱地址"),
  age: z
    .number()
    .min(18, "年龄必须满18岁")
    .max(99, "年龄不能超过99岁")
    .optional(), // 可选字段
  password: z
    .string()
    .min(6, "密码至少6位")
    .regex(/[A-Z]/, "必须包含大写字母")
    .regex(/[0-9]/, "必须包含数字")
});

// 2. 从 Schema 推导 TypeScript 类型
type FormData = z.infer<typeof schema>;
// FormData 类型 = { username: string; email: string; age?: number; password: string }

// 3. 在 useForm 中使用 zodResolver
function ZodForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)  // 关键：使用 Zod 验证器
  });

  const onSubmit = (data: FormData) => {
    // data 自动有完整的类型提示！
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("username")} />
      {errors.username && <p>{errors.username.message}</p>}

      <input type="email" {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        type="number"
        {...register("age", { valueAsNumber: true })}
      />
      {errors.age && <p>{errors.age.message}</p>}

      <input type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}

      <button type="submit">提交</button>
    </form>
  );
}
\`\`\`

---

## Zod 常用验证方法

### 字符串 (string)

\`\`\`javascript
z.string()
  .min(2, "至少2个字符")
  .max(100, "最多100个字符")
  .length(6, "必须6位")
  .email("邮箱格式不正确")
  .url("URL格式不正确")
  .regex(/^[a-z]+$/, "只能是小写字母")
  .startsWith("https://", "必须以https://开头")
  .trim()  // 自动去除首尾空格
  .optional()  // 可选字段
  .nullable()  // 可以为 null
\`\`\`

### 数字 (number)

\`\`\`javascript
z.number()
  .min(0, "不能小于0")
  .max(100, "不能大于100")
  .int("必须是整数")
  .positive("必须是正数")
  .negative("必须是负数")
  .multipleOf(5, "必须是5的倍数")
\`\`\`

### 布尔值 (boolean)

\`\`\`javascript
z.boolean()
\`\`\`

### 枚举 (enum)

\`\`\`javascript
const GenderEnum = z.enum(["male", "female", "other"]);
// 值只能是这三个字符串之一

// TypeScript 类型
type Gender = z.infer<typeof GenderEnum>; // "male" | "female" | "other"
\`\`\`

### 可选字段和默认值

\`\`\`javascript
z.object({
  name: z.string(),               // 必填
  bio: z.string().optional(),     // 可选，可以是 undefined
  newsletter: z.boolean().default(true), // 默认值为 true
  role: z.enum(["user", "admin"]).default("user")
})
\`\`\`

---

## 嵌套对象

\`\`\`javascript
const addressSchema = z.object({
  street: z.string().min(1, "请输入街道"),
  city: z.string().min(1, "请输入城市"),
  zipCode: z.string().regex(/^\\d{6}$/, "邮编必须6位数字")
});

const formSchema = z.object({
  name: z.string(),
  address: addressSchema  // 嵌套对象
});

// 数据结构：
// {
//   name: "张三",
//   address: {
//     street: "...",
//     city: "...",
//     zipCode: "..."
//   }
// }

// JSX 中
<input {...register("address.street")} />
<input {...register("address.city")} />
<input {...register("address.zipCode")} />
\`\`\`

---

## 数组验证

\`\`\`javascript
// 字符串数组
const schema = z.object({
  hobbies: z.array(z.string()).min(1, "至少选择一个爱好")
});

// 对象数组
const itemSchema = z.object({
  name: z.string().min(1, "商品名不能为空"),
  price: z.number().min(0, "价格不能为负")
});

const orderSchema = z.object({
  items: z.array(itemSchema).min(1, "至少有一个商品")
});
\`\`\`

---

## 确认密码（字段对比）

用 \`refine\` 实现跨字段验证：

\`\`\`javascript
const schema = z.object({
  password: z.string().min(6, "密码至少6位"),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "两次密码不一致",
    path: ["confirmPassword"] // 错误挂在 confirmPassword 字段上
  }
);
\`\`\`

---

## 条件验证

\`\`\`javascript
const schema = z.object({
  hasCompany: z.boolean(),
  companyName: z.string()
}).superRefine((data, ctx) => {
  // 如果勾选了"有公司"，companyName 必填
  if (data.hasCompany && !data.companyName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "请输入公司名称",
      path: ["companyName"]
    });
  }
});
\`\`\`

---

## 本章小结

✅ 安装 \`zod\` 和 \`@hookform/resolvers\`
✅ 用 \`z.object({...})\` 定义 Schema
✅ \`z.string()\`, \`z.number()\`, \`z.boolean()\`, \`z.enum()\` 等基础类型
✅ \`.min()\`, \`.max()\`, \`.email()\`, \`.regex()\` 等验证方法
✅ \`.optional()\`, \`.default()\`, \`.nullable()\` 修饰符
✅ \`z.infer<typeof schema>\` 自动推导 TypeScript 类型
✅ \`resolver: zodResolver(schema)\` 绑定到 useForm
✅ 嵌套对象用 \`z.object\` 嵌套，register 用 \`"address.city"\` 点语法
✅ 跨字段验证用 \`.refine()\` 或 \`.superRefine()\`

最后一章来一个完整的实战示例！`,
    code: `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod Schema 定义
const registerSchema = z.object({
  username: z
    .string({ required_error: "请输入用户名" })
    .min(2, "用户名至少2个字符")
    .max(20, "用户名最多20个字符")
    .regex(/^[a-zA-Z0-9_\\u4e00-\\u9fa5]+$/, "只能包含字母、数字、下划线、中文"),

  email: z
    .string({ required_error: "请输入邮箱" })
    .email("请输入有效的邮箱地址"),

  password: z
    .string({ required_error: "请输入密码" })
    .min(8, "密码至少8位")
    .regex(/[A-Z]/, "必须包含至少一个大写字母")
    .regex(/[a-z]/, "必须包含至少一个小写字母")
    .regex(/[0-9]/, "必须包含至少一个数字")
    .regex(/[^a-zA-Z0-9]/, "必须包含至少一个特殊字符"),

  confirmPassword: z.string({ required_error: "请确认密码" }),

  age: z
    .number({ required_error: "请输入年龄", invalid_type_error: "请输入数字" })
    .int("年龄必须是整数")
    .min(18, "必须满18岁")
    .max(120, "年龄不能超过120岁"),

  gender: z.enum(["male", "female", "other"], {
    required_error: "请选择性别"
  }),

  bio: z
    .string()
    .max(200, "简介最多200字")
    .optional()
    .or(z.literal("")),

  agreeTerms: z
    .boolean()
    .refine(val => val === true, "请同意服务条款")
}).refine(
  data => data.password === data.confirmPassword,
  {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"]
  }
);

type RegisterForm = z.infer<typeof registerSchema>;

export default function ZodValidationDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      gender: "male",
      agreeTerms: false,
      bio: ""
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    await new Promise(r => setTimeout(r, 1000));
    console.log("验证通过，提交数据:", data);
    alert("注册成功！\\n" + JSON.stringify(data, null, 2));
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: 8,
    marginTop: 4,
    border: hasError ? "1px solid red" : "1px solid #ddd",
    borderRadius: 4,
    boxSizing: "border-box"
  });
  const errorText = { color: "red", fontSize: 12, margin: "4px 0 0" };
  const labelStyle = { display: "block", marginTop: 12, fontSize: 14 };

  return (
    <div style={{ maxWidth: 450, margin: "40px auto", padding: 20 }}>
      <h2>🛡️ Zod Schema 验证</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 用户名 */}
        <label style={labelStyle}>用户名 *</label>
        <input
          placeholder="2-20位，支持中英文/数字/下划线"
          style={inputStyle(!!errors.username)}
          {...register("username")}
        />
        {errors.username && <p style={errorText}>{errors.username.message}</p>}

        {/* 邮箱 */}
        <label style={labelStyle}>邮箱 *</label>
        <input
          type="email"
          placeholder="example@email.com"
          style={inputStyle(!!errors.email)}
          {...register("email")}
        />
        {errors.email && <p style={errorText}>{errors.email.message}</p>}

        {/* 年龄 */}
        <label style={labelStyle}>年龄 *</label>
        <input
          type="number"
          placeholder="18-120"
          style={inputStyle(!!errors.age)}
          {...register("age", { valueAsNumber: true })}
        />
        {errors.age && <p style={errorText}>{errors.age.message}</p>}

        {/* 性别 */}
        <div style={labelStyle}>
          性别 *：
          <label style={{ marginLeft: 10 }}>
            <input type="radio" value="male" {...register("gender")} /> 男
          </label>
          <label style={{ marginLeft: 10 }}>
            <input type="radio" value="female" {...register("gender")} /> 女
          </label>
          <label style={{ marginLeft: 10 }}>
            <input type="radio" value="other" {...register("gender")} /> 其他
          </label>
        </div>
        {errors.gender && <p style={errorText}>{errors.gender.message}</p>}

        {/* 密码 */}
        <label style={labelStyle}>密码 *</label>
        <input
          type="password"
          placeholder="至少8位，包含大小写字母、数字、特殊字符"
          style={inputStyle(!!errors.password)}
          {...register("password")}
        />
        {errors.password && <p style={errorText}>{errors.password.message}</p>}

        {/* 确认密码 */}
        <label style={labelStyle}>确认密码 *</label>
        <input
          type="password"
          placeholder="再次输入密码"
          style={inputStyle(!!errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <p style={errorText}>{errors.confirmPassword.message}</p>}

        {/* 简介 */}
        <label style={labelStyle}>个人简介</label>
        <textarea
          placeholder="介绍一下自己（选填，最多200字）"
          rows={3}
          style={inputStyle(!!errors.bio)}
          {...register("bio")}
        />
        {errors.bio && <p style={errorText}>{errors.bio.message}</p>}

        {/* 同意条款 */}
        <div style={{ marginTop: 15 }}>
          <label>
            <input type="checkbox" {...register("agreeTerms")} />
            我已阅读并同意服务条款和隐私政策 *
          </label>
          {errors.agreeTerms && <p style={errorText}>{errors.agreeTerms.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 20,
            background: isSubmitting ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: 16
          }}
        >
          {isSubmitting ? "注册中..." : "注册账号"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        💡 提示：本示例使用 Zod 进行 Schema 验证，包含了必填校验、长度限制、邮箱格式、正则匹配、密码强度、跨字段确认、枚举值、布尔值校验、数字范围等常见验证场景。
      </p>
    </div>
  );
}
`,
  },
];
