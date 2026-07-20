"use client";

// =============================================================
// 文件：app/mantine/components/FormDemo.jsx
// -------------------------------------------------------------
// 【职责】演示 Mantine 表单最常用功能：
//   - useForm 管理表单状态
//   - TextInput / Textarea / Select / NumberInput / Checkbox / Switch / Radio
//   - 表单校验（内置规则 + 自定义校验函数）
//   - 提交 + 重置 + 动态表单值展示
//   - 提交时显示 loading，提交成功后用通知反馈
//
// 【优化点】
//   - 提交时按钮显示 loader，禁用重复点击
//   - 提交成功后用 showNotification 弹出反馈（不再只是显示一个绿色块）
//   - 提交结果区加上"复制到剪贴板"按钮
//   - 每个输入框加 hint 提示，最大长度限制
//   - 重置前确认（避免误操作丢数据）
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
  Box,
  CopyButton,
  Tooltip,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "./notifications";

export default function FormDemo() {
  // ---- 提交结果状态 ----
  const [submitted, setSubmitted] = useState(null);

  // ---- 提交 loading 状态 ----
  const [submitting, setSubmitting] = useState(false);

  // ---- 重置确认弹窗 ----
  const [resetModalOpened, { open: openResetModal, close: closeResetModal }] = useDisclosure(false);

  // ---- 创建 form 实例 ----
  const form = useForm({
    mode: "uncontrolled",  // uncontrolled 性能更好，输入不触发整个 form 重渲染
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

    validate: {
      // 用户名：必填 + 2-20 字符
      username: (value) => {
        if (!value) return "用户名不能为空";
        if (value.length < 2) return "用户名至少 2 个字符";
        if (value.length > 20) return "用户名最多 20 个字符";
        return null;
      },

      // 邮箱：必填 + 简单正则校验
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "请输入有效的邮箱地址",

      // 年龄：必须 ≥ 18 且 ≤ 150
      age: (value) => {
        if (value < 18) return "必须年满 18 岁";
        if (value > 150) return "年龄超出范围";
        return null;
      },

      // 国家：必选
      country: (value) => (value ? null : "请选择国家"),

      // 个人简介：最多 200 字符
      bio: (value) =>
        value && value.length > 200 ? "简介最多 200 字符" : null,

      // 同意条款：必须勾选
      agree: (value) => (value ? null : "必须同意服务条款"),
    },

    // transformValues：提交前对数据做一次转换（如去除首尾空格）
    transformValues: (values) => ({
      ...values,
      username: values.username.trim(),
      email: values.email.trim(),
    }),
  });

  // ---- 提交处理（带 loading 模拟） ----
  const handleSubmit = async (values) => {
    setSubmitting(true);
    // 模拟网络请求
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);

    setSubmitted(values);
    showNotification({
      color: "green",
      title: "提交成功",
      message: "欢迎 " + values.username + "！表单数据已保存。",
      icon: "✅",
    });
  };

  // ---- 重置（带确认） ----
  const handleReset = () => {
    form.reset();
    setSubmitted(null);
    closeResetModal();
    showNotification({
      color: "blue",
      title: "已重置",
      message: "表单已恢复到初始值",
      icon: "🔄",
    });
  };

  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>📝 表单实战</Title>
        <Text size="sm" c="dimmed" mt={4}>
          useForm + 校验 + 各类输入控件 + 提交 loading + 通知反馈
        </Text>
      </div>

      {/* ============ 表单卡片 ============ */}
      <Paper p="lg" withBorder shadow="sm">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {/* ---- 文本输入 ---- */}
            <TextInput
              label="用户名"
              placeholder="输入用户名"
              withAsterisk
              description="2 ~ 20 字符"
              maxLength={20}
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
                { value: "cn", label: "🇨🇳 中国" },
                { value: "us", label: "🇺🇸 美国" },
                { value: "jp", label: "🇯🇵 日本" },
                { value: "kr", label: "🇰🇷 韩国" },
                { value: "uk", label: "🇬🇧 英国" },
              ]}
              searchable
              clearable
              {...form.getInputProps("country")}
            />

            {/* ---- 多行文本 ---- */}
            <Textarea
              label="个人简介"
              placeholder="介绍一下自己..."
              autosize
              minRows={2}
              maxRows={5}
              description={"已输入 " + (form.getValues().bio || "").length + " / 200"}
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
            <Checkbox
              label="订阅营销邮件"
              {...form.getInputProps("subscribe", { type: "checkbox" })}
            />

            {/* ---- 开关 ---- */}
            <Switch
              label="接收每周简报"
              {...form.getInputProps("newsletter", { type: "checkbox" })}
            />

            <Divider />

            {/* ---- 强制勾选 ---- */}
            <Checkbox
              label="我同意服务条款和隐私政策"
              {...form.getInputProps("agree", { type: "checkbox" })}
            />

            {/* ---- 按钮区 ---- */}
            <Group justify="space-between">
              <Button
                variant="subtle"
                color="gray"
                onClick={openResetModal}
                disabled={submitting}
              >
                重置
              </Button>
              <Button
                type="submit"
                loading={submitting}
                loaderProps={{ type: "dots" }}
              >
                {submitting ? "提交中..." : "提交表单"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>

      {/* ============ 实时表单值预览 ============ */}
      <Paper p="md" withBorder bg="var(--mantine-color-gray-0)">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            实时表单值（输入时同步更新）：
          </Text>
          <CopyButton value={JSON.stringify(form.getValues(), null, 2)}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? "已复制" : "复制"}>
                <ActionIcon variant="subtle" onClick={copy} size="sm">
                  {copied ? "✅" : "📋"}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
        <Box
          component="pre"
          style={{
            margin: 0,
            fontSize: "0.8rem",
            overflow: "auto",
            maxHeight: 200,
          }}
        >
          {JSON.stringify(form.getValues(), null, 2)}
        </Box>
      </Paper>

      {/* ============ 提交结果 ============ */}
      {submitted && (
        <Paper
          p="md"
          withBorder
          style={{ borderColor: "var(--mantine-color-green-6)" }}
        >
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500} c="green">
              ✅ 提交成功！校验通过的数据：
            </Text>
            <CopyButton value={JSON.stringify(submitted, null, 2)}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "已复制" : "复制 JSON"}>
                  <ActionIcon variant="subtle" onClick={copy} size="sm" color="green">
                    {copied ? "✅" : "📋"}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
          <Box
            component="pre"
            style={{
              margin: 0,
              fontSize: "0.8rem",
              overflow: "auto",
              maxHeight: 240,
            }}
          >
            {JSON.stringify(submitted, null, 2)}
          </Box>
        </Paper>
      )}

      {/* ============ 重置确认弹窗 ============ */}
      <Modal
        opened={resetModalOpened}
        onClose={closeResetModal}
        title="确认重置？"
        size="sm"
        centered
      >
        <Text size="sm" mb="md">
          重置后所有输入会清空，且无法恢复。
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={closeResetModal}>
            取消
          </Button>
          <Button color="red" onClick={handleReset}>
            确认重置
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
