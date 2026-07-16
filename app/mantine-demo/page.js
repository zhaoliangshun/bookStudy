"use client";
// =============================================================
// Mantine Demo —— 主页面
// -------------------------------------------------------------
// 演示：Form + Zod 校验 + 主题切换 + Modal 提交结果
// 配套教程章节：m-form-zod-basic / m-form-zod-complex / m-create-theme / m-demo
// =============================================================

import { useState } from "react";
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
import { useForm, schemaResolver } from "@mantine/form";
import { z } from "zod";

// ---------- zod schema ----------
// 演示：字符串、邮箱、数字（coerce）、枚举、可选、literal
const schema = z.object({
  name: z.string().min(2, "姓名至少 2 字"),
  email: z.string().email("邮箱格式不正确"),
  age: z.coerce.number().int().min(18, "必须 18 岁以上"),
  role: z.enum(["admin", "user", "guest"]),
  bio: z.string().max(200, "简介最多 200 字").optional(),
  agree: z.literal(true, {
    errorMap: () => ({ message: "必须同意条款" }),
  }),
});

const initialValues = {
  name: "",
  email: "",
  age: 18,
  role: "user",
  bio: "",
  agree: false,
};

// ---------- 表单组件 ----------
function UserForm({ onSubmit }) {
  const form = useForm({
    initialValues,
    validate: schemaResolver(schema),
    validateInputOnBlur: true, // 失焦时校验，避免输入到一半就报错
  });

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="姓名"
            placeholder="张三"
            withAsterisk
            {...form.getInputProps("name")}
          />
          <TextInput
            label="邮箱"
            placeholder="user@example.com"
            withAsterisk
            {...form.getInputProps("email")}
          />
          <NumberInput
            label="年龄"
            withAsterisk
            min={0}
            max={150}
            {...form.getInputProps("age")}
          />
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
          <Textarea
            label="简介"
            placeholder="介绍一下自己..."
            autosize
            minRows={2}
            {...form.getInputProps("bio")}
          />
          <Checkbox
            label="我同意服务条款"
            {...form.getInputProps("agree", { type: "checkbox" })}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => form.reset()}>
              重置
            </Button>
            <Button type="submit">提交</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

// ---------- 主题切换组件 ----------
function ThemeSwitcher() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  return (
    <Group gap="xs">
      <Text size="sm" c="dimmed">
        主题:
      </Text>
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

// ---------- 主页面 ----------
export default function MantineDemoPage() {
  const [submitted, setSubmitted] = useState(null);
  const [opened, setOpened] = useState(false);

  return (
    <Container size="sm" py="xl">
      <Stack>
        {/* 顶部：标题 + 主题切换 */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Title order={2}>Mantine Demo</Title>
            <Text size="sm" c="dimmed" mt={4}>
              演示 Form + Zod + 主题切换 + Modal。测试账号任意填写，需满足校验。
            </Text>
          </Box>
          <ThemeSwitcher />
        </Group>

        {/* 表单 */}
        <UserForm
          onSubmit={(values) => {
            setSubmitted(values);
            setOpened(true);
          }}
        />

        {/* 提示信息 */}
        <Paper p="md" withBorder bg="var(--mantine-color-gray-0)">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              演示要点
            </Text>
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

        {/* 提交结果 Modal */}
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
            <pre
              style={{
                background: "var(--mantine-color-dark-8)",
                color: "var(--mantine-color-gray-3)",
                padding: "1rem",
                borderRadius: "8px",
                overflow: "auto",
                fontSize: "0.875rem",
                margin: 0,
              }}
            >
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
  );
}
