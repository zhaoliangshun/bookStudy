// =============================================================
// Mantine 教程 —— 第 2 批：Form 核心使用
// -------------------------------------------------------------
// 覆盖：useForm 入门、getInputProps、各类输入接入、
//       initialValues、transformValues、动态字段、提交与重置。
// 这是 Mantine 教程的重点章节，请仔细阅读。
// =============================================================

export const chapters = [
  // -------------------------------------------------------------
  // 章节 1：useForm 入门
  // -------------------------------------------------------------
  {
    id: "mf-intro",
    group: "Form 核心",
    icon: "📝",
    title: "useForm 入门",
    content: `# useForm 入门

\`@mantine/form\` 是 Mantine 自带的表单状态管理库，**不需要再装 react-hook-form**。
它和 Mantine 组件深度集成，3 行代码就能搭出一个可用表单。

## 最小表单

\`\`\`jsx
"use client";
import { useForm } from "@mantine/form";
import { TextInput, Button, Stack } from "@mantine/core";

export default function LoginForm() {
  // 1. 创建 form 实例
  const form = useForm({
    // initialValues：表单字段的初始值
    // 同时也定义了"这个表单有哪些字段"
    initialValues: {
      email: "",
      password: "",
    },
  });

  // 2. 提交回调
  const onSubmit = (values) => {
    // values 的类型就是 initialValues 的类型
    // { email: string, password: string }
    console.log("提交：", values);
    alert(JSON.stringify(values, null, 2));
  };

  return (
    // 3. <form onSubmit={form.onSubmit(onSubmit)}>
    //    注意是 form.onSubmit，不是 handleSubmit
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack>
        {/* 4. form.getInputProps("字段名") 一行搞定 */}
        <TextInput
          label="邮箱"
          placeholder="you@example.com"
          {...form.getInputProps("email")}
        />
        <TextInput
          label="密码"
          type="password"
          placeholder="至少 8 位"
          {...form.getInputProps("password")}
        />
        <Button type="submit">登录</Button>
      </Stack>
    </form>
  );
}
\`\`\`

## getInputProps 是什么

\`form.getInputProps("email")\` 返回一个对象，展开后等同于：

\`\`\`js
{
  value: "用户输入的内容",
  onChange: (event) => form.setFieldValue("email", event.target.value),
  error: form.errors.email,    // 错误信息
  onBlur: () => form.validateField("email"),
  // 还有 name, inputRef 等
}
\`\`\`

所以 \`{...form.getInputProps("email")}\` 这一行就完成了**双向绑定 + 错误显示 + 失焦校验**，
不需要你手写 value/onChange/error。

## form.onSubmit 的工作流

\`form.onSubmit(onSubmit, onErrors)\` 返回一个标准 \`onSubmit\` 函数：

\`\`\`js
(event) => {
  event.preventDefault();
  // 1. 触发校验（如果配置了 validate 函数 / zodResolver）
  // 2. 校验失败：调用 onErrors(errors)，不调 onSubmit
  // 3. 校验通过：调用 onSubmit(values)
}
\`\`\`

如果不传 \`onErrors\`，校验失败会自动把错误信息填到 \`form.errors\`，
然后 \`getInputProps\` 会自动把它们显示在对应字段下面。

## useForm 的核心 API 速览

| 属性/方法 | 用途 |
| --- | --- |
| \`initialValues\` | 初始值，同时定义字段结构 |
| \`validate\` | 自定义校验函数（返回 errors 对象） |
| \`validateInputOnChange\` | 输入时即校验（默认 false，默认是 onBlur 校验） |
| \`form.values\` | 当前表单值 |
| \`form.errors\` | 当前错误信息 |
| \`form.getInputProps(name)\` | 绑定到 Mantine 输入组件 |
| \`form.setFieldValue(name, value)\` | 手动设置某字段值 |
| \`form.setValues(partial)\` | 批量设置多个字段 |
| \`form.setErrors(errors)\` | 手动设置错误（如服务端校验失败回填） |
| \`form.validate()\` | 手动触发全表单校验 |
| \`form.validateField(name)\` | 校验单字段 |
| \`form.reset()\` | 重置到 initialValues |
| \`form.onSubmit(submit, errors)\` | 包裹提交函数 |
| \`form.watch(field, cb)\` | 监听某字段变化 |
| \`form.list\` | 动态字段列表（下一节讲） |

下一节我们看每种 Mantine 输入组件如何接入 form。
`,
    code: `"use client";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Button, Stack, Code } from "@mantine/core";
import { useState } from "react";

export default function LoginForm() {
  const [submitted, setSubmitted] = useState(null);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    // 简单内置校验（返回 { 字段名: "错误信息" } 或 null/{}）
    validate: {
      email: (value) => (/^\\S+@\\S+$/.test(value) ? null : "邮箱格式不正确"),
      password: (value) =>
        value.length < 8 ? "密码至少 8 位" : null,
    },
  });

  return (
    <Stack p="md" gap="md" style={{ maxWidth: 400 }}>
      <form onSubmit={form.onSubmit((values) => setSubmitted(values))}>
        <TextInput
          label="邮箱"
          placeholder="you@example.com"
          withAsterisk
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="密码"
          placeholder="至少 8 位"
          mt="md"
          withAsterisk
          {...form.getInputProps("password")}
        />
        <Button type="submit" mt="lg" fullWidth>
          登录
        </Button>
      </form>

      {submitted && (
        <Code block>
          {JSON.stringify(submitted, null, 2)}
        </Code>
      )}
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 2：Checkbox / Select / Switch 接入
  // -------------------------------------------------------------
  {
    id: "mf-checkbox-select",
    group: "Form 核心",
    icon: "🔗",
    title: "Checkbox / Select / Switch 接入",
    content: `# Checkbox / Select / Switch 接入

\`getInputProps\` 是万能的，所有 Mantine 输入组件都能用，但**接入方式有细微差别**，
这一节专门讲这些差别和踩坑点。

## TextInput / PasswordInput / Textarea：直接展开

\`\`\`jsx
<TextInput label="姓名" {...form.getInputProps("name")} />
<Textarea label="简介" {...form.getInputProps("bio")} />
\`\`\`

这三个组件的 onChange 接收 React 事件，\`getInputProps\` 默认按 React 事件处理，无需特殊处理。

## Checkbox：单值布尔

注意：单独的 \`Checkbox\` 的 value 是布尔，**不需要 type="checkbox"**：

\`\`\`jsx
<Checkbox
  label="同意服务条款"
  {...form.getInputProps("agree", { type: "checkbox" })}
/>
\`\`\`

⚠️ **必须**传 \`{ type: "checkbox" }\` 给 getInputProps！
否则它会把值当作字符串处理，导致显示成 \`"true"/"false"\` 而不是勾选状态。

initialValues 里也要初始化为布尔：

\`\`\`js
const form = useForm({
  initialValues: { agree: false },
});
\`\`\`

## Switch：开关

和 Checkbox 一样要 \`{ type: "checkbox" }\`：

\`\`\`jsx
<Switch
  label="接收推送"
  {...form.getInputProps("notify", { type: "checkbox" })}
/>
\`\`\`

## Select：下拉单选

Select 的 onChange 接收的是 \`value\`（字符串或 null），不是 React 事件！
\`getInputProps\` 内部已经处理了这个差异，**直接展开即可**：

\`\`\`jsx
<Select
  label="城市"
  data={[
    { value: "bj", label: "北京" },
    { value: "sh", label: "上海" },
  ]}
  {...form.getInputProps("city")}
/>
\`\`\`

initialValues：

\`\`\`js
const form = useForm({
  initialValues: { city: null },   // null 或 ""
});
\`\`\`

## MultiSelect / TagsInput：多值数组

\`\`\`jsx
<MultiSelect
  label="技能"
  data={[...]}
  {...form.getInputProps("skills")}
/>
\`\`\`

initialValues 必须是数组：

\`\`\`js
initialValues: { skills: [] }
\`\`\`

## Checkbox.Group：复选组

注意：\`Checkbox.Group\` 才是"多选"，**单独的 Checkbox 是"单值布尔"**。
两者用法完全不同！

\`\`\`jsx
<Checkbox.Group label="选择你感兴趣的领域" {...form.getInputProps("interests")}>
  <Stack mt="xs">
    <Checkbox value="frontend" label="前端" />
    <Checkbox value="backend" label="后端" />
  </Stack>
</Checkbox.Group>
\`\`\`

initialValues：

\`\`\`js
initialValues: { interests: [] }   // 字符串数组
\`\`\`

\`Checkbox.Group\` 的 value 是字符串数组（如 \`["frontend", "backend"]\`），
\`getInputProps\` 会自动同步给内部所有 Checkbox。

## Radio.Group：单选组

\`\`\`jsx
<Radio.Group label="性别" withAsterisk {...form.getInputProps("gender")}>
  <Stack mt="xs">
    <Radio value="male" label="男" />
    <Radio value="female" label="女" />
  </Stack>
</Radio.Group>
\`\`\`

initialValues：

\`\`\`js
initialValues: { gender: null }    // null 或 "male" / "female" 等
\`\`\`

## NumberInput：数字

NumberInput 的 onChange 接收 number | string，**不是 React 事件**。
所以需要用 \`getInputProps\` 的第二参数指定类型：

\`\`\`jsx
<NumberInput
  label="年龄"
  {...form.getInputProps("age", { withError: true })}
/>
\`\`\`

注意 v9 里 NumberInput 的 onChange 参数类型变了，
\`getInputProps\` 内部已经做了适配，**直接展开即可**，不用手动写 onChange。

 initialValues：

\`\`\`js
initialValues: { age: 0 }    // 数字或空字符串
\`\`\`

## SegmentedControl：分段选择

\`\`\`jsx
<SegmentedControl
  data={[
    { value: "list", label: "列表" },
    { value: "grid", label: "网格" },
  ]}
  {...form.getInputProps("viewMode")}
/>
\`\`\`

initialValues：

\`\`\`js
initialValues: { viewMode: "list" }
\`\`\`

## Slider：滑块

\`\`\`jsx
<Slider
  min={0}
  max={100}
  step={10}
  {...form.getInputProps("score")}
/>
\`\`\`

Slider 的 onChange 是 number，\`getInputProps\` 会处理。
initialValues 必须是数字。

## ColorInput / ColorPicker：颜色

\`\`\`jsx
<ColorInput {...form.getInputProps("color")} />
\`\`\`

initialValues：

\`\`\`js
initialValues: { color: "#228be6" }
\`\`\`

## 一张速查表

| 组件 | initialValues 类型 | getInputProps 参数 |
| --- | --- | --- |
| TextInput / Textarea / PasswordInput | string | 无 |
| NumberInput | number 或 "" | 无 |
| Select | string 或 null | 无 |
| MultiSelect | string[] | 无 |
| TagsInput | string[] | 无 |
| Checkbox 单个 | boolean | \`{ type: "checkbox" }\` |
| Switch | boolean | \`{ type: "checkbox" }\` |
| Checkbox.Group | string[] | 无 |
| Radio.Group | string 或 null | 无 |
| SegmentedControl | string | 无 |
| Slider | number | 无 |
| ColorInput | string | 无 |
`,
    code: `"use client";
import { useForm } from "@mantine/form";
import {
  TextInput, NumberInput, Select, MultiSelect,
  Checkbox, Switch, Radio, SegmentedControl,
  Button, Stack, Code,
} from "@mantine/core";
import { useState } from "react";

export default function Demo() {
  const [result, setResult] = useState(null);

  const form = useForm({
    initialValues: {
      name: "",
      age: 18,
      city: null,
      skills: [],
      agree: false,
      notify: true,
      gender: null,
      viewMode: "list",
    },
    validate: {
      name: (v) => (v.length < 2 ? "姓名至少 2 个字符" : null),
      city: (v) => (v === null ? "请选择城市" : null),
      agree: (v) => (v ? null : "必须同意条款"),
    },
  });

  return (
    <Stack p="md" gap="md" style={{ maxWidth: 500 }}>
      <form onSubmit={form.onSubmit((v) => setResult(v))}>
        <TextInput
          label="姓名"
          placeholder="张三"
          withAsterisk
          {...form.getInputProps("name")}
        />

        <NumberInput
          label="年龄"
          min={0}
          max={150}
          mt="sm"
          {...form.getInputProps("age")}
        />

        <Select
          label="城市"
          placeholder="选一个..."
          mt="sm"
          withAsterisk
          data={[
            { value: "bj", label: "北京" },
            { value: "sh", label: "上海" },
            { value: "gz", label: "广州" },
          ]}
          {...form.getInputProps("city")}
        />

        <MultiSelect
          label="技能"
          placeholder="选多个..."
          mt="sm"
          data={[
            { value: "js", label: "JavaScript" },
            { value: "ts", label: "TypeScript" },
            { value: "react", label: "React" },
            { value: "vue", label: "Vue" },
          ]}
          {...form.getInputProps("skills")}
        />

        <Radio.Group
          label="性别"
          mt="sm"
          withAsterisk
          {...form.getInputProps("gender")}
        >
          <Stack mt="xs">
            <Radio value="male" label="男" />
            <Radio value="female" label="女" />
          </Stack>
        </Radio.Group>

        <SegmentedControl
          mt="sm"
          fullWidth
          data={[
            { value: "list", label: "列表视图" },
            { value: "grid", label: "网格视图" },
          ]}
          {...form.getInputProps("viewMode")}
        />

        <Checkbox
          label="同意服务条款"
          mt="sm"
          {...form.getInputProps("agree", { type: "checkbox" })}
        />

        <Switch
          label="接收推送通知"
          mt="sm"
          {...form.getInputProps("notify", { type: "checkbox" })}
        />

        <Button type="submit" mt="lg" fullWidth>
          提交
        </Button>
      </form>

      {result && (
        <Code block>
{JSON.stringify(result, null, 2)}
        </Code>
      )}
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 3：initialValues 与 transformValues
  // -------------------------------------------------------------
  {
    id: "mf-initial",
    group: "Form 核心",
    icon: "🔄",
    title: "initialValues 与 transformValues",
    content: `# initialValues 与 transformValues

## initialValues：定义结构 + 初始值

\`initialValues\` 同时干两件事：

1. **声明字段结构**：未列在 initialValues 里的字段不会被认为是表单字段
2. **提供初始值**：提交时如果用户没改，用的就是这个值

\`\`\`js
const form = useForm({
  initialValues: {
    name: "",
    age: 0,
    skills: [],          // 数组
    address: {           // 嵌套对象
      province: "",
      city: "",
    },
    contacts: [          // 嵌套数组
      { type: "phone", value: "" },
    ],
  },
});
\`\`\`

### 取值与赋值（嵌套字段用路径）

\`\`\`js
// 取值
form.values.name               // "张三"
form.values.address.province   // "广东"
form.values.contacts[0].value  // "13800138000"

// 赋值
form.setFieldValue("address.province", "浙江");
form.setFieldValue("contacts.0.value", "13900139000");
\`\`\`

\`getInputProps\` 同样支持嵌套路径：

\`\`\`jsx
<TextInput label="省份" {...form.getInputProps("address.province")} />
<TextInput label="手机" {...form.getInputProps("contacts.0.value")} />
\`\`\`

## transformValues：提交前转换

实际开发中常常遇到这种情况：
- **表单内部状态**：\`{ birthYear: 2000, birthMonth: 5, birthDay: 12 }\`
- **提交给后端**：\`{ birthdate: "2000-05-12" }\`

\`transformValues\` 让你在提交前做这种转换：

\`\`\`js
const form = useForm({
  initialValues: {
    birthYear: "",
    birthMonth: "",
    birthDay: "",
  },
  transformValues: (values) => ({
    // 返回新对象，结构可以完全不一样
    birthdate: \`\${values.birthYear}-\${values.birthMonth}-\${values.birthDay}\`,
    age: new Date().getFullYear() - Number(values.birthYear),
  }),
});

// onSubmit 收到的是转换后的对象
form.onSubmit((values) => {
  console.log(values);  // { birthdate: "2000-5-12", age: 24 }
});
\`\`\`

注意：
- \`transformValues\` 不影响 \`form.values\`，\`form.values\` 仍是原始结构
- \`transformValues\` 的输出只传给 \`onSubmit\` 回调
- 校验 (\`validate\`) 在 \`transformValues\` **之前**执行，校验的是原始 values

## 典型场景：表单状态 → 后端 DTO

\`\`\`js
const form = useForm({
  initialValues: {
    username: "",
    password: "",
    remember: false,
  },
  transformValues: (values) => ({
    user: values.username,
    pwd: values.password,
    persistent_login: values.remember ? 1 : 0,  // 后端要的是 0/1 不是布尔
  }),
});
\`\`\`

## 重置时回到 initialValues

\`\`\`js
form.reset();
// 所有字段回到 initialValues 的值
\`\`\`

\`form.reset()\` 还可以传一个参数，**临时**重置到别的值（不修改 initialValues）：

\`\`\`js
form.reset({
  name: "默认用户",
  age: 18,
});
\`\`\`

## setValues：批量赋值

\`\`\`js
// 从后端加载用户数据后回填表单
const loadUser = async (id) => {
  const res = await fetch(\`/api/users/\${id}\`);
  const data = await res.json();
  form.setValues({
    name: data.name,
    email: data.email,
    age: data.age,
  });
};
\`\`\`

\`setValues\` 是 partial 更新，没传的字段保持原值。

## 服务端校验失败回填错误

\`\`\`js
const onSubmit = async (values) => {
  try {
    await api.post("/register", values);
  } catch (err) {
    if (err.status === 422) {
      // 后端返回 { detail: [{ loc: ["body", "email"], msg: "已注册" }] }
      // 转成 Mantine 的 errors 格式
      form.setErrors({
        email: "该邮箱已注册",
      });
    }
  }
};
\`\`\`

\`setErrors\` 接受一个对象，key 是字段路径，value 是错误信息字符串。
设置后 \`getInputProps\` 会自动把错误显示在对应输入框下。
`,
    code: `"use client";
import { useForm } from "@mantine/form";
import { TextInput, NumberInput, Button, Stack, Code } from "@mantine/core";
import { useState } from "react";

export default function Demo() {
  const [result, setResult] = useState(null);

  const form = useForm({
    initialValues: {
      birthYear: 2000,
      birthMonth: 1,
      birthDay: 1,
      // 嵌套对象演示
      address: {
        province: "",
        city: "",
      },
    },
    transformValues: (values) => ({
      // 把年月日合并成 ISO 日期字符串
      birthdate: \`\${values.birthYear}-\${String(values.birthMonth).padStart(2, "0")}-\${String(values.birthDay).padStart(2, "0")}\`,
      age: new Date().getFullYear() - values.birthYear,
      location: \`\${values.address.province} / \${values.address.city}\`,
    }),
  });

  return (
    <Stack p="md" gap="md" style={{ maxWidth: 400 }}>
      <form onSubmit={form.onSubmit((v) => setResult(v))}>
        <TextInput
          label="省份"
          placeholder="广东"
          {...form.getInputProps("address.province")}
        />
        <TextInput
          label="城市"
          placeholder="深圳"
          mt="sm"
          {...form.getInputProps("address.city")}
        />
        <NumberInput
          label="出生年份"
          mt="sm"
          min={1900}
          max={2030}
          {...form.getInputProps("birthYear")}
        />
        <NumberInput
          label="月份"
          mt="sm"
          min={1}
          max={12}
          {...form.getInputProps("birthMonth")}
        />
        <NumberInput
          label="日"
          mt="sm"
          min={1}
          max={31}
          {...form.getInputProps("birthDay")}
        />

        <Button type="submit" mt="lg" fullWidth>
          提交（看转换后的值）
        </Button>
        <Button
          variant="light"
          mt="xs"
          fullWidth
          onClick={() => form.reset()}
        >
          重置（回到 initialValues）
        </Button>
      </form>

      {result && (
        <Code block>
{JSON.stringify(result, null, 2)}
        </Code>
      )}
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 4：动态字段列表 form.list
  // -------------------------------------------------------------
  {
    id: "mf-list",
    group: "Form 核心",
    icon: "➕",
    title: "动态字段列表 form.list",
    content: `# 动态字段列表 form.list

很多场景需要"动态增减字段"：填写多个邮箱、多个紧急联系人、添加多个商品...
Mantine 用 \`form.list\` API 处理这种情况。

## 基础用法：动态邮箱列表

\`\`\`jsx
const form = useForm({
  initialValues: {
    emails: [""],   // 数组，初始一个空字符串
  },
});

// form.list("emails") 返回一组操作函数
const emailList = form.list("emails");

// emailList.add(value?)         添加一项到末尾
// emailList.insert(index, value) 在 index 处插入
// emailList.remove(index)       删除 index 处的项
// emailList.setItem(index, value) 修改 index 处的值
// emailList.move(from, to)     移动
// emailList.swap(from, to)     交换
// emailList.replace(index, value)
\`\`\`

完整示例：

\`\`\`jsx
function EmailForm() {
  const form = useForm({
    initialValues: { emails: [""] },
  });

  const fields = form.values.emails.map((_, index) => (
    <Group key={index} align="flex-end">
      <TextInput
        label={\`邮箱 #\${index + 1}\`}
        placeholder="you@example.com"
        style={{ flex: 1 }}
        {...form.getInputProps(\`emails.\${index}\`)}
      />
      <Button
        variant="default"
        onClick={() => form.removeListItem("emails", index)}
        disabled={form.values.emails.length === 1}
      >
        删除
      </Button>
    </Group>
  ));

  return (
    <form onSubmit={form.onSubmit((v) => console.log(v))}>
      <Stack>
        {fields}
        <Button
          variant="light"
          onClick={() => form.insertListItem("emails", "")}
        >
          + 添加邮箱
        </Button>
        <Button type="submit">提交</Button>
      </Stack>
    </form>
  );
}
\`\`\`

## API 速查（v9 推荐用法）

v9 推荐用 \`form.values\` + \`form.insertListItem/removeListItem\` 等**直接方法**，
而不是 v7 的 \`form.list(...)\`：

\`\`\`js
// 添加（末尾）
form.insertListItem("emails", "");         // 加空字符串
form.insertListItem("emails", "new@x.com");

// 删除某项
form.removeListItem("emails", index);

// 在指定位置插入
form.insertListItem("emails", "", 0);      // 在开头插入

// 修改某项的值
form.setFieldValue(\`emails.\${index}\`, "new@x.com");

// 重新排序
form.reorderListItem("emails", { from: 0, to: 2 });

// 交换两项
form.swapListItem("emails", 0, 1);
\`\`\`

\`form.list("name")\` 仍然可用，作为这些方法的别名返回。

## 嵌套对象数组：联系人列表

实际项目最常见的是"对象数组"——每个 item 是个对象：

\`\`\`jsx
const form = useForm({
  initialValues: {
    contacts: [
      { name: "", phone: "", relation: "" },
    ],
  },
});

// 字段路径用 contacts.\${index}.name
const fields = form.values.contacts.map((c, index) => (
  <Paper key={index} withBorder p="md">
    <TextInput
      label="姓名"
      {...form.getInputProps(\`contacts.\${index}.name\`)}
    />
    <TextInput
      label="电话"
      {...form.getInputProps(\`contacts.\${index}.phone\`)}
    />
    <Select
      label="关系"
      data={[
        { value: "parent", label: "父母" },
        { value: "spouse", label: "配偶" },
        { value: "friend", label: "朋友" },
      ]}
      {...form.getInputProps(\`contacts.\${index}.relation\`)}
    />
    <Button
      variant="default"
      color="red"
      onClick={() => form.removeListItem("contacts", index)}
    >
      删除此联系人
    </Button>
  </Paper>
));
\`\`\`

## 校验动态字段

校验函数里也能用路径访问数组项：

\`\`\`js
const form = useForm({
  initialValues: { emails: [""] },
  validate: {
    emails: {
      // 数组校验：函数接收每一项
      _error: "至少需要一个邮箱",
    },
  },
});

// 或自定义校验函数
validate: (values) => {
  const errors = {};
  values.emails.forEach((email, i) => {
    if (!/^\\S+@\\S+$/.test(email)) {
      errors[\`emails.\${i}\`] = "邮箱格式不正确";
    }
  });
  return errors;
},
\`\`\`

## 关键陷阱

1. **key 不能用 index**：如果列表会重排/删除，用 index 做 key 会导致 React 复用错误的 DOM。
   推荐用 \`useId()\` 或一个自增 id 字段。

2. **空列表至少留一个空项**：用户体验上，如果删完所有项，"添加"按钮也要可见。
   \`form.values.emails.length === 0\` 时也要能渲染列表和添加按钮。

3. **删除最后一项的边界**：删除后立即触发表单校验时，数组为空可能导致校验报错。
   可以用 \`validateInputOnChange: false\` + 手动 \`form.validate()\` 控制。
`,
    code: `"use client";
import { useForm } from "@mantine/form";
import { TextInput, Button, Stack, Paper, Code, Group } from "@mantine/core";
import { useState } from "react";

export default function ContactsForm() {
  const [result, setResult] = useState(null);

  const form = useForm({
    initialValues: {
      contacts: [{ name: "", phone: "" }],
    },
    validate: (values) => {
      const errors = {};
      values.contacts.forEach((c, i) => {
        if (!c.name) errors[\`contacts.\${i}.name\`] = "必填";
        if (!/^\\d{11}$/.test(c.phone))
          errors[\`contacts.\${i}.phone\`] = "手机号需 11 位数字";
      });
      return errors;
    },
  });

  return (
    <Stack p="md" gap="md" style={{ maxWidth: 500 }}>
      <form onSubmit={form.onSubmit((v) => setResult(v))}>
        {form.values.contacts.map((c, index) => (
          <Paper key={index} withBorder p="md" mb="sm">
            <TextInput
              label={\`联系人 #\${index + 1} 姓名\`}
              placeholder="张三"
              withAsterisk
              {...form.getInputProps(\`contacts.\${index}.name\`)}
            />
            <TextInput
              label="手机"
              placeholder="11 位手机号"
              mt="xs"
              withAsterisk
              {...form.getInputProps(\`contacts.\${index}.phone\`)}
            />
            <Button
              variant="default"
              color="red"
              size="xs"
              mt="sm"
              disabled={form.values.contacts.length === 1}
              onClick={() => form.removeListItem("contacts", index)}
            >
              删除此联系人
            </Button>
          </Paper>
        ))}

        <Group>
          <Button
            variant="light"
            onClick={() => form.insertListItem("contacts", { name: "", phone: "" })}
          >
            + 添加联系人
          </Button>
          <Button type="submit">提交</Button>
        </Group>
      </form>

      {result && (
        <Code block>
{JSON.stringify(result, null, 2)}
        </Code>
      )}
    </Stack>
  );
}
`,
  },

  // -------------------------------------------------------------
  // 章节 5：提交状态 / 提交与重置 / watch
  // -------------------------------------------------------------
  {
    id: "mf-submit",
    group: "Form 核心",
    icon: "🚀",
    title: "提交状态与 watch",
    content: `# 提交状态与 watch

## 1. 提交时显示 loading

很多场景要在提交时禁用按钮、显示 loading 转圈：

\`\`\`jsx
"use client";
import { useState } from "react";
import { Button } from "@mantine/core";

function MyForm() {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({ initialValues: { name: "" } });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await api.post("/users", values);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput {...form.getInputProps("name")} />
      <Button type="submit" loading={submitting}>
        提交
      </Button>
    </form>
  );
}
\`\`\`

## 2. 校验失败回调

\`form.onSubmit\` 的第二个参数是校验失败回调：

\`\`\`jsx
form.onSubmit(
  (values) => {
    // 校验通过
  },
  (errors) => {
    // 校验失败，errors 是 { 字段名: 错误信息 }
    console.log("校验失败：", errors);
    // 自动滚到第一个错误字段（可选）
  }
);
\`\`\`

## 3. validateInputOnChange：输入即校验

默认情况下，Mantine **只在 onBlur 时校验**单字段，提交时校验全表单。
如果想要"边输入边校验"：

\`\`\`js
const form = useForm({
  initialValues: { email: "" },
  validateInputOnChange: true,   // 所有字段都输入即校验
  // 也可以只对部分字段开启：
  // validateInputOnChange: ["email", "password"],
  validate: {
    email: (v) => (/^\\S+@\\S+$/.test(v) ? null : "邮箱格式不正确"),
  },
});
\`\`\`

> 注意：输入即校验**性能略差**，且用户体验不一定好（用户还没输完就一直红）。
> 推荐只在密码强度、用户名查重等异步场景开启。

## 4. validateInputOnBlur：失焦校验（默认就是 true）

\`\`\`js
const form = useForm({
  validateInputOnBlur: true,   // 默认值
  // 也可以对部分字段关闭：
  // validateInputOnBlur: false,
});
\`\`\`

## 5. watch：监听字段变化

\`form.watch\` 类似 useEffect，可以监听某个字段的变化做副作用：

\`\`\`jsx
const form = useForm({
  initialValues: { username: "", available: null },
});

// 监听 username 变化，做异步查重
form.watch("username", async (value) => {
  if (!value) return;
  const res = await fetch(\`/api/check-username?u=\${value}\`);
  const { available } = await res.json();
  form.setFieldValue("available", available);
  if (!available) {
    form.setFieldError("username", "用户名已被占用");
  }
});
\`\`\`

⚠️ 注意 \`form.watch\` 是**命令式调用**，写在组件函数体顶层（不是 useEffect 内），
Mantine 内部会管理订阅。每次 render 都调用 \`form.watch\` 是安全的，
它会做去重处理（同一个 field 同一个 callback 只注册一次）。

## 6. setFieldError：手动设置单字段错误

\`\`\`js
// 异步校验失败时手动塞错误
form.setFieldError("username", "该用户名已被注册");

// 清除错误
form.setFieldError("username", null);
\`\`\`

\`setFieldError\` 和 \`setErrors\` 区别：
- \`setFieldError(name, msg)\`：单个字段
- \`setErrors({ name: "msg", age: "msg" })\`：批量

## 7. isDirty / touched / pristine

\`\`\`js
form.isDirty();           // 用户是否修改过任何字段
form.isDirty("email");    // email 是否被修改过
form.touched.email;       // email 是否被触碰过（失焦过）
form.pristine;            // 是否完全没修改过（与 isDirty 相反）
\`\`\`

用途：
- 离开页面前提示"有未保存修改"
- 只在用户改过后才显示保存按钮

\`\`\`jsx
{form.isDirty() && (
  <Button type="submit">保存修改</Button>
)}
\`\`\`

## 8. 在 Modal/Drawer 里用 form

注意：Modal 关闭时**不清空 form**，下次打开还是上次的值！
要么用 \`form.reset()\` 手动重置，要么用 \`key\` 强制重新挂载：

\`\`\`jsx
<Modal opened={opened} onClose={close}>
  <UserForm key={opened ? "open" : "closed"} />
</Modal>
\`\`\`

\`key\` 变化时 React 会卸载并重新创建组件，\`useForm\` 会用 initialValues 重新初始化。

## 9. 调试：打印当前 values

开发时常用 \`form.values\` 直接看：

\`\`\`jsx
<Code block>
{JSON.stringify(form.values, null, 2)}
</Code>
\`\`\`

或者用 \`form.getTransformedValues()\` 看转换后的值（如果配了 \`transformValues\`）。
`,
    code: `"use client";
import { useState } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput, Button, Stack, Code, Text, Group, Alert,
} from "@mantine/core";

export default function Demo() {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [checkStatus, setCheckStatus] = useState(null); // 'checking' | 'ok' | 'taken'

  const form = useForm({
    initialValues: { username: "", email: "" },
    validateInputOnBlur: true,
    validate: {
      username: (v) => (v.length < 3 ? "用户名至少 3 字符" : null),
      email: (v) => (/^\\S+@\\S+$/.test(v) ? null : "邮箱格式不正确"),
    },
  });

  // 模拟异步用户名查重
  form.watch("username", (value) => {
    if (!value || value.length < 3) {
      setCheckStatus(null);
      return;
    }
    setCheckStatus("checking");
    setTimeout(() => {
      // 假装是已占用的名字
      const taken = ["admin", "test", "root"].includes(value);
      setCheckStatus(taken ? "taken" : "ok");
      if (taken) form.setFieldError("username", "该用户名已被占用");
    }, 600);
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setResult(values);
      form.reset();
      setCheckStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack p="md" gap="md" style={{ maxWidth: 400 }}>
      <Alert color="blue" variant="light">
        isDirty: {form.isDirty() ? "是（已修改）" : "否"} ｜
        pristine: {form.pristine ? "是" : "否"}
      </Alert>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          label="用户名"
          placeholder="3-20 字符（试试 admin）"
          withAsterisk
          description={
            checkStatus === "checking" ? "正在检查..." :
            checkStatus === "ok" ? "✓ 用户名可用" :
            checkStatus === "taken" ? "✗ 已被占用" :
            "输入后自动检查重名"
          }
          {...form.getInputProps("username")}
        />
        <TextInput
          label="邮箱"
          placeholder="you@example.com"
          mt="sm"
          withAsterisk
          {...form.getInputProps("email")}
        />

        <Group mt="lg">
          <Button type="submit" loading={submitting}>
            提交
          </Button>
          <Button
            variant="default"
            onClick={() => { form.reset(); setCheckStatus(null); }}
            disabled={submitting}
          >
            重置
          </Button>
        </Group>
      </form>

      <Text size="xs" c="dimmed">当前值：</Text>
      <Code block>
{JSON.stringify(form.values, null, 2)}
      </Code>

      {result && (
        <>
          <Text size="xs" c="dimmed">上次提交：</Text>
          <Code block>
{JSON.stringify(result, null, 2)}
          </Code>
        </>
      )}
    </Stack>
  );
}
`,
  },
];
