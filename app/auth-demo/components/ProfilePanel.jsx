"use client";

// =============================================================
// 文件：app/auth-demo/components/ProfilePanel.jsx
// -------------------------------------------------------------
// 【职责】
//   个人资料面板。已登录用户可查看并修改显示名、邮箱、手机号、
//   个人简介。表单使用 Mantine useForm + Zod schema 校验。
//
// 【技术栈】
//   - Mantine v9：TextInput / Textarea / Button / Paper / Stack /
//     Alert / Text / Group / Avatar / Divider
//   - @mantine/form：useForm + schemaResolver
//   - Zod v4：profileSchema（来自 ../lib/schemas.js）
//   - Mock SDK：getCurrentUser / updateProfile / isLoggedIn
//
// 【props】
//   onBack {Function} 返回按钮回调
// =============================================================

import { useEffect, useState } from "react";
// 导入 Mantine v9 组件
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Stack,
  Alert,
  Text,
  Group,
  Avatar,
  Divider,
} from "@mantine/core";
// 导入 Mantine form 与 Zod schema 解析器
import { useForm, schemaResolver } from "@mantine/form";
// 导入个人资料校验 schema（Zod v4）
import { profileSchema } from "../lib/schemas.js";
// 导入 Mock SDK 用户管理函数
import { getCurrentUser, updateProfile, isLoggedIn } from "../lib/sdk.js";

/**
 * 个人资料面板组件
 * @param {{ onBack?: () => void }} props
 */
export default function ProfilePanel({ onBack }) {
  // ---- 本地状态 ----
  // 登录状态与当前用户用懒初始化读取（SDK 函数是同步的），避免渲染闪烁
  const [loggedIn] = useState(() => isLoggedIn());
  const [user, setUser] = useState(() => getCurrentUser());
  // 提交结果提示：{ type: "success" | "error", message: string }
  const [result, setResult] = useState(null);

  // ---- 表单：useForm + schemaResolver(profileSchema) ----
  // initialValues 字段需与 profileSchema 的字段一一对应：
  //   displayName / email / phone（可选）/ bio（可选）
  const form = useForm({
    initialValues: {
      displayName: "",
      email: "",
      phone: "",
      bio: "",
    },
    // schemaResolver 把 Zod schema 转成 Mantine form 可用的校验函数
    validate: schemaResolver(profileSchema),
  });

  // 挂载时用 getCurrentUser() 的数据回填表单初始值
  // 注意：setValues 必须在 effect 中调用，不能在渲染阶段调用
  useEffect(() => {
    if (loggedIn && user) {
      form.setValues({
        displayName: user.displayName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
    // 仅在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 表单提交处理（校验通过后才会调用）
   * @param {{displayName:string,email:string,phone:string,bio:string}} values
   */
  function handleSubmit(values) {
    // 调用 SDK 更新个人资料
    const res = updateProfile(values);
    if (res.error) {
      // 更新失败：显示错误提示
      setResult({ type: "error", message: res.error });
    } else {
      // 更新成功：同步本地用户状态并显示成功提示
      setUser(res.user);
      setResult({ type: "success", message: "个人资料已更新" });
    }
  }

  // ---- 未登录：显示提示 ----
  if (!loggedIn) {
    return (
      <Paper p="xl" withBorder>
        <Text c="dimmed" ta="center">
          请先登录
        </Text>
      </Paper>
    );
  }

  // 头像首字母：优先取显示名首字，其次用户名首字
  const initial = (
    user?.displayName?.[0] ||
    user?.username?.[0] ||
    "?"
  ).toUpperCase();

  return (
    <Paper p="lg" withBorder shadow="xs">
      <Stack gap="md">
        {/* ---- 头部：头像 + 标题 ---- */}
        <Group gap="sm">
          <Avatar color="indigo" radius="xl" size="lg">
            {initial}
          </Avatar>
          <div>
            <Text fw={600} size="lg">
              个人资料
            </Text>
            <Text c="dimmed" size="sm">
              {user?.username}
            </Text>
          </div>
        </Group>

        <Divider />

        {/* ---- 提交结果提示（可关闭）---- */}
        {result && (
          <Alert
            color={result.type === "success" ? "green" : "red"}
            variant="light"
            withCloseButton
            onClose={() => setResult(null)}
          >
            {result.message}
          </Alert>
        )}

        {/* ---- 资料表单 ---- */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            {/* 显示名：必填（withAsterisk） */}
            <TextInput
              label="显示名"
              placeholder="请输入显示名"
              withAsterisk
              key={form.key("displayName")}
              {...form.getInputProps("displayName")}
            />
            {/* 邮箱：必填 */}
            <TextInput
              label="邮箱"
              placeholder="请输入邮箱"
              withAsterisk
              key={form.key("email")}
              {...form.getInputProps("email")}
            />
            {/* 手机号：可选（不加 withAsterisk） */}
            <TextInput
              label="手机号"
              placeholder="请输入手机号（可选）"
              key={form.key("phone")}
              {...form.getInputProps("phone")}
            />
            {/* 个人简介：多行文本，自适应高度 */}
            <Textarea
              label="个人简介"
              placeholder="介绍一下自己（可选）"
              autosize
              minRows={3}
              key={form.key("bio")}
              {...form.getInputProps("bio")}
            />

            <Divider />

            {/* 操作按钮 */}
            <Group justify="flex-end">
              <Button variant="default" onClick={onBack}>
                返回
              </Button>
              <Button type="submit">保存</Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
