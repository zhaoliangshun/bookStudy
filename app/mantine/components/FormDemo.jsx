"use client";

// =============================================================
// 文件：app/mantine/components/FormDemo.jsx
// -------------------------------------------------------------
// 【职责】演示 Mantine 表单最常用功能：
//   - useForm 管理表单状态
//   - TextInput / Textarea / Select / NumberInput / Checkbox / Switch / Radio
//   - 表单校验（内置规则 + 自定义校验函数）
//   - 提交 + 重置 + 动态表单值展示
//
// 【三方库】
//   @mantine/form : Mantine 官方表单方案，类似 react-hook-form
//   @mantine/core : UI 组件库
// =============================================================

import { useState } from "react";
import {
  Paper,
  Title,
  Text,
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Checkbox,
  Switch,
  Radio,
  Button,
  Group,
  Divider,
  Code,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";

export default function FormDemo() {
  // ---- 提交结果状态 ----
  // submitted 存放校验通过后的表单数据，用于在下方展示
  const [submitted, setSubmitted] = useState(null);

  // ---- 创建 form 实例 ----
  // useForm 是 @mantine/form 的核心 Hook，返回一个 form 对象。
  // form 对象包含：values（当前值）、errors（错误信息）、
  // getInputProps（桥接组件）、onSubmit（提交处理）、reset（重置）等。
  const form = useForm({
    // initialValues：表单初始值，字段名即 key
    initialValues: {
      username: "",
      email: "",
      age: 18,
      country: "",
      bio: "",
      gender: "",
      subscribe: false,
      newsletter: true,
      agree: false,
    },

    // validate：校验函数。返回 { 字段名: 错误信息 } 对象。
    // 某字段校验通过则返回 null（不写也行）。
    // 校验失败返回字符串错误信息。
    validate: {
      // 用户名：必填 + 至少 2 字符
      username: (value) =>
        value.length < 2 ? "用户名至少 2 个字符" : null,

      // 邮箱：必填 + 简单正则校验
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "请输入有效的邮箱地址",

      // 年龄：必须 ≥ 18
      age: (value) => (value < 18 ? "必须年满 18 岁" : null),

      // 国家：必选
      country: (value) => (value ? null : "请选择国家"),

      // 同意条款：必须勾选
      agree: (value) => (value ? null : "必须同意服务条款"),
    },
  });

  // ---- 提交处理 ----
  // form.onSubmit(handleSubmit) 返回真正的 form onSubmit 函数：
  //   1) 阻止默认提交刷新
  //   2) 执行 validate 校验
  //   3) 全部通过才调 handleSubmit(values)
  const handleSubmit = (values) => {
    setSubmitted(values);
  };

  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>📝 表单实战</Title>
        <Text size="sm" c="dimmed" mt={4}>
          useForm + 校验 + 各类输入控件 + 提交重置
        </Text>
      </div>

      {/* ============ 表单卡片 ============ */}
      <Paper p="lg" withBorder shadow="sm">
        {/* withAsterisk 在 label 后加红色星号（纯视觉，校验靠 validate） */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* ---- 文本输入 ---- */}
            <TextInput
              label="用户名"
              placeholder="输入用户名"
              withAsterisk
              description="2 个字符以上"
              {...form.getInputProps("username")}
            />

            {/* ---- 邮箱输入 ---- */}
            <TextInput
              label="邮箱"
              placeholder="user@example.com"
              withAsterisk
              {...form.getInputProps("email")}
            />

            {/* ---- 数字输入 ---- */}
            {/* NumberInput 的 value 是字符串，但会被转成数字存储 */}
            <NumberInput
              label="年龄"
              withAsterisk
              min={0}
              max={150}
              description="必须年满 18 岁"
              {...form.getInputProps("age")}
            />

            {/* ---- 下拉选择 ---- */}
            <Select
              label="国家"
              placeholder="选择国家"
              withAsterisk
              data={[
                { value: "cn", label: "中国" },
                { value: "us", label: "美国" },
                { value: "jp", label: "日本" },
                { value: "kr", label: "韩国" },
                { value: "uk", label: "英国" },
              ]}
              searchable  // 允许搜索筛选
              clearable    // 允许清空选择
              {...form.getInputProps("country")}
            />

            {/* ---- 多行文本 ---- */}
            <Textarea
              label="个人简介"
              placeholder="介绍一下自己..."
              autosize       // 高度自适应
              minRows={2}    // 最少 2 行
              maxRows={5}    // 最多 5 行
              {...form.getInputProps("bio")}
            />

            {/* ---- 单选按钮组 ---- */}
            <Radio.Group
              label="性别"
              withAsterisk
              {...form.getInputProps("gender")}
            >
              <Group mt="xs">
                <Radio value="male" label="男" />
                <Radio value="female" label="女" />
                <Radio value="other" label="其他" />
              </Group>
            </Radio.Group>

            <Divider label="偏好设置" labelPosition="center" />

            {/* ---- 复选框 ---- */}
            {/* Checkbox 需要传 { type: "checkbox" } 才能正确绑定 checked */}
            <Checkbox
              label="订阅营销邮件"
              {...form.getInputProps("subscribe", { type: "checkbox" })}
            />

            {/* ---- 开关 ---- */}
            {/* Switch 也需要 { type: "checkbox" }，视觉上是拨动开关 */}
            <Switch
              label="接收每周简报"
              {...form.getInputProps("newsletter", { type: "checkbox" })}
            />

            <Divider />

            {/* ---- 强制勾选 ---- */}
            <Checkbox
              label="我同意服务条款和隐私政策"
              {...form.getInputProps("agree", { type: "checkbox" })}
              onBlur={() => {}}  // 阻止 blur 校验闪现
            />

            {/* ---- 按钮区 ---- */}
            <Group justify="flex-end">
              {/* form.reset()：重置回 initialValues */}
              <Button variant="default" onClick={() => form.reset()}>
                重置
              </Button>
              <Button type="submit">提交表单</Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      {/* ============ 实时表单值预览 ============ */}
      {/* form.values 是响应式的，输入时实时更新 */}
      <Paper p="md" withBorder bg="var(--mantine-color-gray-0)">
        <Text size="sm" fw={500} mb="xs">
          实时表单值（输入时同步更新）：
        </Text>
        <Box
          component="pre"
          style={{
            margin: 0,
            fontSize: "0.8rem",
            overflow: "auto",
          }}
        >
          {JSON.stringify(form.values, null, 2)}
        </Box>
      </Paper>

      {/* ============ 提交结果 ============ */}
      {submitted && (
        <Paper p="md" withBorder style={{ borderColor: "var(--mantine-color-green-6)" }}>
          <Text size="sm" fw={500} c="green" mb="xs">
            ✅ 提交成功！校验通过的数据：
          </Text>
          <Box
            component="pre"
            style={{
              margin: 0,
              fontSize: "0.8rem",
              overflow: "auto",
            }}
          >
            {JSON.stringify(submitted, null, 2)}
          </Box>
        </Paper>
      )}
    </Stack>
  );
}
