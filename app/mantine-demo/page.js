"use client";
// ↑ "use client" 指令：声明本文件是【客户端组件】(Client Component)。
//   Mantine 的组件大量使用 useState、useEffect、Context 等 React Hook，
//   只能在浏览器端运行，所以必须开启客户端模式。
//   在 Next.js App Router 中，默认是服务端组件，加这行才允许用 Hook。

// =============================================================
// 文件：app/mantine-demo/page.js
// -------------------------------------------------------------
// 【一句话职责】
//   /mantine-demo 路由的主页面。用一个「用户信息表单」综合演示：
//   Mantine Form 表单管理 + Zod 数据校验 + 主题切换 + Modal 弹窗展示结果。
//
// 【演示的技术点】
//   1. @mantine/form 的 useForm     —— 表单状态管理（取值/改值/重置/校验）
//   2. schemaResolver(zodSchema)    —— 把 Zod schema 桥接成 Mantine 校验器
//   3. z.coerce.number()            —— 把字符串自动转成数字再校验
//   4. z.enum / z.literal           —— 枚举校验 / 必须等于某值（用于勾选框）
//   5. useMantineColorScheme        —— 运行时切换亮色/暗色主题
//   6. Modal                        —— 弹窗组件展示提交后的 JSON 结果
//
// 【三方库简介】
//   - @mantine/core  ：Mantine 的核心组件库（Button/TextInput/Modal 等）
//   - @mantine/form  ：Mantine 的表单方案，类似 react-hook-form 但更轻量
//   - zod            ：TypeScript 优先的数据校验库，用 schema 描述数据形状
//
// 【配套教程章节】
//   m-form-zod-basic / m-form-zod-complex / m-create-theme / m-demo
// =============================================================

import { useState } from "react";
// useState：React 基础 Hook，用于在函数组件里保存可变状态。
//           本文件用它管理「提交的数据」和「Modal 开关」两个状态。

// ---- 批量引入 Mantine 组件 ----
// 下面每个组件的用途会在使用处详细说明，这里先做个速查：
//   Container  : 页面容器，限制最大宽度并居中
//   Paper      : 带背景/边框/阴影的「纸张」容器，常用来包卡片
//   Title      : 标题（h1~h6），order 属性控制层级
//   TextInput  : 文本输入框（input type=text）
//   Textarea   : 多行文本框（textarea）
//   Select     : 下拉选择框
//   NumberInput: 数字输入框（只能输数字，带上下步进）
//   Checkbox   : 复选框
//   Button     : 按钮
//   Group      : 水平布局容器（flex-direction: row）
//   Stack      : 垂直布局容器（flex-direction: column）
//   Modal      : 弹窗/对话框
//   Text       : 通用文本，size/c/fw 等属性控制样式
//   SegmentedControl : 分段控制器（类似 iOS 的分段选择）
//   Box        : 通用块级容器
//   Code       : 行内代码样式（等宽字体 + 背景色）
//   useMantineColorScheme : 获取/设置亮暗主题的 Hook
import {
  Container,
  Paper,
  Title,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Modal,
  useMantineColorScheme,
  Text,
  SegmentedControl,
  Box,
  Code,
} from "@mantine/core";

// ---- 引入表单与校验桥接工具 ----
// useForm        : @mantine/form 的核心 Hook，创建一个 form 实例，
//                  管理所有字段值、错误信息、脏标记等。
// schemaResolver : 把【任意校验库的 schema】适配成 Mantine form 能用的
//                  校验函数。这里传入 Zod schema，它会在校验时调用
//                  schema.safeParse() 并把错误映射成 { field: message }。
import { useForm, schemaResolver } from "@mantine/form";

// ---- 引入 Zod ----
// z 是 Zod 的命名空间，所有 schema 构造器都挂在它上面（z.string/z.object...）。
// Zod 的核心思想：用「schema（模式）」描述数据该长什么样，然后拿数据去匹配。
import { z } from "zod";

// =============================================================
// 第一部分：定义 Zod 校验 Schema
// -------------------------------------------------------------
// 【什么是 Schema】
//   Schema 就是「数据形状的描述」。下面的 schema 描述了一个用户对象：
//   必须有 name(字符串≥2字)、email(合法邮箱)、age(数字≥18)、
//   role(只能是 admin/user/guest 三者之一)、bio(可选,最多200字)、
//   agree(必须为 true，即必须勾选)。
//
// 【为什么用 Zod 而不是手写校验函数】
//   1. 声明式：一眼看清数据结构，不用读 if/else 链
//   2. 可复用：同一份 schema 既能给前端表单校验，也能给后端 API 校验
//   3. 类型推导：z.infer<typeof schema> 能自动反推 TypeScript 类型
// =============================================================
const schema = z.object({
  // name：字符串类型，最少 2 个字符，否则报「姓名至少 2 字」。
  //       min(2, msg) 的第二个参数是校验失败时的错误信息。
  name: z.string().min(2, "姓名至少 2 字"),

  // email：字符串 + 邮箱格式校验。Zod 内置 email 规则（含 @ 和域名）。
  email: z.string().email("邮箱格式不正确"),

  // age：数字类型，但用 z.coerce.number() ——
  //   【为什么要 coerce（强制转换）】
  //   NumberInput 虽然叫「数字输入框」，但表单收集到的值是【字符串】
  //   （HTML input 的 value 永远是字符串）。如果用 z.number() 会直接
  //   校验失败（类型不对）。z.coerce.number() 会先尝试把字符串转成
  //   数字再校验，相当于 Number(input)。
  //   .int() 要求整数；.min(18) 要求 ≥18。
  age: z.coerce.number().int().min(18, "必须 18 岁以上"),

  // role：枚举类型，值只能是数组里的某一个。
  //       配合下方的 <Select> 下拉框，保证选项和校验规则一致。
  //       如果传了 "superadmin" 之类不在列表里的值会校验失败。
  role: z.enum(["admin", "user", "guest"]),

  // bio：可选简介。.max(200) 最多 200 字，.optional() 表示可不填。
  //      注意 optional 放最后，表示「这个字段可以不存在」。
  bio: z.string().max(200, "简介最多 200 字").optional(),

  // agree：必须等于 true（z.literal(true) 表示「字面量必须为 true」）。
  //   【为什么用 literal 而不是 z.boolean()】
  //   z.boolean() 接受 true 和 false 两种值，无法强制必须勾选。
  //   z.literal(true) 则要求值【严格等于 true】，没勾就报错。
  //
  //   【Zod v4 错误定制 API 变化（重要）】
  //   Zod v3 用 { errorMap: () => ({ message: "..." }) }，
  //   Zod v4 已废弃 errorMap，改为第二个参数直接传字符串，
  //   或用 { error: "..." } 选项。
  //   如果仍用旧的 errorMap 写法，自定义消息会被静默忽略，
  //   回退成默认英文错误（如 "Invalid input: expected true, received false"），
  //   这正是「点击 label 闪现红色英文」的根因。
  agree: z.literal(true, "必须同意条款"),
});

// =============================================================
// 第二部分：表单初始值
// -------------------------------------------------------------
// initialValues 定义表单【打开时的默认值】。
// 字段名必须和 schema 的 key 完全对应，否则 form 拿不到值。
// 注意 agree 设为 false（未勾选），用户必须主动勾选才通过校验。
// =============================================================
const initialValues = {
  name: "",
  email: "",
  age: 18,
  role: "user",
  bio: "",
  agree: false,
};

// =============================================================
// 第三部分：表单组件 UserForm
// -------------------------------------------------------------
// 【职责】渲染所有输入控件，并通过 props 把「提交的值」传给父组件。
// 【为什么拆成独立组件】
//   1. 关注点分离：表单逻辑和页面布局解耦
//   2. form 实例只在这一个组件内创建，父组件不用关心表单细节
//   3. 复用性：理论上这个表单可在多处使用
//
// 【props】
//   onSubmit : 提交回调，父组件传入，接收校验通过的 values
// =============================================================
function UserForm({ onSubmit }) {
  // ---- 创建 form 实例 ----
  // useForm 返回一个 form 对象，包含：getInputProps / onSubmit / reset /
  // setValues / errors / values 等几十个方法。下面只用其中几个。
  const form = useForm({
    initialValues,                       // 表单初始值（见上方定义）
    validate: schemaResolver(schema),    // 用 Zod schema 做校验
    // validateInputOnBlur：校验时机策略。
    //   false（默认）：输入时不校验，提交时才整体校验
    //   true         ：失焦(onBlur)时校验当前字段
    //   开启后体验更好——用户输完一个字段离开时立刻知道对不对，
    //   而不是等点「提交」才一次性弹一堆错误。
    validateInputOnBlur: true,
  });

  // ---- 渲染表单 ----
  // form.onSubmit(onSubmit) 返回一个真正的 HTML form onSubmit 处理函数，
  // 它会：1) 阻止默认提交刷新页面 2) 调用 validate 校验 3) 全部通过才调 onSubmit(values)
  return (
    // Paper：Mantine 的「纸张」容器。p="md" 内边距中等，withBorder 显示边框。
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(onSubmit)}>
        {/* Stack：垂直布局，子元素之间默认有间距，省去手动写 margin */}
        <Stack>
          {/* ---- 姓名输入框 ---- */}
          {/* withAsterisk：显示红色星号，表示必填（纯视觉提示，校验靠 schema） */}
          {/* {...form.getInputProps("name")}：展开 form 桥接 props，
              等价于 value={form.values.name} onChange={...} onBlur={...} error={form.errors.name} */}
          <TextInput
            label="姓名"
            placeholder="张三"
            withAsterisk
            {...form.getInputProps("name")}
          />

          {/* ---- 邮箱输入框 ---- */}
          <TextInput
            label="邮箱"
            placeholder="user@example.com"
            withAsterisk
            {...form.getInputProps("email")}
          />

          {/* ---- 年龄数字输入框 ---- */}
          {/* min/max：限制可选范围（仍是 UI 层提示，真正校验在 schema） */}
          {/* 注意：NumberInput 的 value 是字符串，所以 schema 才用了 z.coerce */}
          <NumberInput
            label="年龄"
            withAsterisk
            min={0}
            max={150}
            {...form.getInputProps("age")}
          />

          {/* ---- 角色下拉框 ---- */}
          {/* data：选项数组，value 是真实值，label 是显示文本 */}
          {/* schema 用 z.enum(["admin","user","guest"]) 保证 value 合法 */}
          <Select
            label="角色"
            data={[
              { value: "admin", label: "管理员" },
              { value: "user", label: "用户" },
              { value: "guest", label: "访客" },
            ]}
            withAsterisk
            {...form.getInputProps("role")}
          />

          {/* ---- 简介多行文本框 ---- */}
          {/* autosize + minRows：自动高度，至少 2 行高，内容多了自动撑高 */}
          <Textarea
            label="简介"
            placeholder="介绍一下自己..."
            autosize
            minRows={2}
            {...form.getInputProps("bio")}
          />

          {/* ---- 同意条款复选框 ---- */}
          {/* 第二个参数 { type: "checkbox" } 很关键：
              getInputProps 默认按「文本输入」处理，Checkbox 需要显式声明 type，
              否则勾选状态不会正确绑定到 checked 属性。 */}
          <Checkbox
            label="我同意服务条款"
            {...form.getInputProps("agree", { type: "checkbox" })}
          />

          {/* ---- 操作按钮区 ---- */}
          {/* Group justify="flex-end"：水平排列，整体靠右对齐 */}
          <Group justify="flex-end">
            {/* variant="default"：次要按钮样式（灰底） */}
            {/* form.reset()：把表单重置回 initialValues 的状态 */}
            <Button variant="default" onClick={() => form.reset()}>
              重置
            </Button>
            {/* type="submit"：触发表单 onSubmit（进而触发校验+提交） */}
            <Button type="submit">提交</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

// =============================================================
// 第四部分：主题切换组件 ThemeSwitcher
// -------------------------------------------------------------
// 【职责】提供「亮色/暗色」分段切换器，运行时改变整页主题。
// 【useMantineColorScheme Hook】
//   返回 { colorScheme, setColorScheme, toggleColorScheme }：
//     colorScheme    : 当前主题，'light' 或 'dark'
//     setColorScheme : 直接设成某主题
//     toggleColorScheme : 在亮/暗间切换
//   切换后 Mantine 会修改 <html data-mantine-color-scheme="...">，
//   所有组件通过 CSS 变量自动响应，无需刷新。
// =============================================================
function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    // Group gap="xs"：水平排列，元素间距 xs（最小）
    <Group gap="xs">
      <Text size="sm" c="dimmed">
        主题:
      </Text>
      {/* SegmentedControl：分段控制器，类似 iOS 顶部的「分类切换」。
          value    : 当前选中项的 value
          onChange : 切换时回调，v 是新 value（'light' 或 'dark'）
          data     : 选项数组 */}
      <SegmentedControl
        size="xs"
        value={colorScheme}
        onChange={(v) => setColorScheme(v)}
        data={[
          { value: "light", label: "☀️ 亮色" },
          { value: "dark", label: "🌙 暗色" },
        ]}
      />
    </Group>
  );
}

// =============================================================
// 第五部分：主页面组件
// -------------------------------------------------------------
// 【状态说明】
//   submitted : 存放「校验通过并提交」的表单数据，用于在 Modal 里展示。
//               初始为 null，提交后变成 values 对象。
//   opened    : 控制 Modal 显示/隐藏的布尔值。
// =============================================================
export default function MantineDemoPage() {
  // useState(null)：submitted 初始为 null，表示还没提交过。
  //   setSubmitted 用来保存提交的 values。
  const [submitted, setSubmitted] = useState(null);

  // useState(false)：Modal 默认关闭。
  //   setOpened 用来打开/关闭弹窗。
  const [opened, setOpened] = useState(false);

  return (
    // 【滚动根容器】
    // 主站 globals.css 把 html/body 的 overflow 锁成了 hidden（为主站的
    // 「侧边栏 + 内容区各自滚动」布局服务）。但本页用的是 Mantine 流式
    // 布局，没有内部滚动区，直接用会导致内容超出视口后无法下拉。
    // 解决：用一个外层 div 接管滚动——height: 100vh 占满视口、
    // overflowY: auto 允许纵向滚动，让页面整体可上下滚动。
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
      }}
    >
    {/* Container size="sm"：限制内容最大宽度为 sm（约 640px），居中显示。
        适合表单类页面，避免在宽屏上输入框被拉得过宽。
        py="xl"：上下内边距 xl，给页面留白。 */}
    <Container size="sm" py="xl">
      {/* Stack：垂直布局，下面三块（顶部栏/表单/提示卡）依次堆叠 */}
      <Stack>
        {/* ============ 顶部：标题 + 主题切换 ============ */}
        {/* Group justify="space-between"：两端对齐，标题在左、主题切换在右
            align="flex-start"：顶部对齐（防止两边高度不一居中错位） */}
        <Group justify="space-between" align="flex-start">
          <Box>
            {/* Title order={2}：渲染成 <h2>。order 1~6 对应 h1~h6 */}
            <Title order={2}>Mantine Demo</Title>
            {/* mt={4}：margin-top 4px，让副标题贴近主标题 */}
            <Text size="sm" c="dimmed" mt={4}>
              演示 Form + Zod + 主题切换 + Modal。测试账号任意填写，需满足校验。
            </Text>
          </Box>
          {/* 主题切换器（独立组件，见上方定义） */}
          <ThemeSwitcher />
        </Group>

        {/* ============ 表单区 ============ */}
        {/* onSubmit 回调：表单校验通过后触发，values 是整理好的表单数据。
            这里做两件事：1) 保存到 submitted 状态 2) 打开 Modal */}
        <UserForm
          onSubmit={(values) => {
            setSubmitted(values); // 保存提交的数据，供 Modal 展示
            setOpened(true);      // 打开结果弹窗
          }}
        />

        {/* ============ 演示要点提示卡 ============ */}
        {/* bg="var(--mantine-color-gray-0)"：浅灰背景，用 Mantine CSS 变量。
            亮色主题下是浅灰，暗色主题下 Mantine 会自动切到对应的暗灰。 */}
        <Paper p="md" withBorder bg="var(--mantine-color-gray-0)">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              演示要点
            </Text>
            {/* 下面逐条列出本 Demo 演示的技术点，用 <Code> 高亮关键字 */}
            <Text size="xs" c="dimmed">
              • <Code>zodResolver</Code> 接管表单校验
            </Text>
            <Text size="xs" c="dimmed">
              • <Code>z.coerce.number()</Code> 处理 NumberInput 字符串值
            </Text>
            <Text size="xs" c="dimmed">
              • <Code>z.enum</Code> 配合 Select 枚举
            </Text>
            <Text size="xs" c="dimmed">
              • <Code>z.literal(true)</Code> 强制勾选 Checkbox
            </Text>
            <Text size="xs" c="dimmed">
              • <Code>validateInputOnBlur</Code> 失焦校验
            </Text>
            <Text size="xs" c="dimmed">
              • <Code>useMantineColorScheme</Code> 运行时切换主题
            </Text>
            <Text size="xs" c="dimmed">
              • <Code>Modal</Code> 展示提交结果（JSON）
            </Text>
          </Stack>
        </Paper>

        {/* ============ 提交结果弹窗 Modal ============ */}
        {/* opened   : 是否显示
            onClose : 关闭回调（点遮罩/叉号/ESC 触发）
            title   : 弹窗标题
            size    : 弹窗宽度档位 */}
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="提交成功"
          size="md"
        >
          <Stack>
            <Text size="sm" c="dimmed">
              以下数据已通过 zod 校验：
            </Text>
            {/* 用原生 <pre> 展示 JSON，模拟「代码块」效果。
                这里没用 Mantine 的 <Code block>，是为了更精细地控制样式。
                background/color 用 Mantine 的暗色 CSS 变量，
                保证亮/暗主题下都是「深底浅字」的终端风格。 */}
            <pre
              style={{
                background: "var(--mantine-color-dark-8)",  // 最深的暗色背景
                color: "var(--mantine-color-gray-3)",        // 浅灰文字
                padding: "1rem",
                borderRadius: "8px",
                overflow: "auto",     // 内容过长时出现滚动条
                fontSize: "0.875rem", // 14px
                margin: 0,            // 清除浏览器默认 margin
              }}
            >
              {/* JSON.stringify(obj, null, 2)：美化输出，2 空格缩进。
                  submitted 为 null 时会显示 "null"（首次渲染时），无伤大雅。 */}
              {JSON.stringify(submitted, null, 2)}
            </pre>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setOpened(false)}>
                关闭
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
    </div>
  );
}
