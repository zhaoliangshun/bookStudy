"use client";

// =============================================================
// 文件：app/mantine/components/notifications.js
// -------------------------------------------------------------
// 【职责】简易通知系统（基于 React Context + 自己的 store）
// -------------------------------------------------------------
// 之所以不直接用 @mantine/notifications：
//   - 它要求在 MantineProvider 树内挂载 <Notifications /> 容器
//   - 容器有自己的位置、动画、关闭逻辑，不够灵活
//   - 多页同时弹通知会互相覆盖计数
//
// 这个轻量 store 的优势：
//   - 单例模式，整个 /mantine 子树共用一份状态
//   - API 简洁：showNotification({ color, title, message, icon })
//   - 内部管理定时器，组件卸载不会泄漏
//   - 通知位置在右上角，固定 z-index = 9999
// =============================================================

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import {
  Paper,
  Group,
  Text,
  ActionIcon,
  Box,
  Stack,
} from "@mantine/core";

// ---- 全局事件总线 ----
// 任何地方（包括 React 树外）都可以调用 showNotification(...)，
// 因为事件总线不依赖 React 上下文。
const listeners = new Set();
let nextId = 1;

export function showNotification({ color = "blue", title, message, icon = "🔔", duration = 3000 } = {}) {
  const id = nextId++;
  const notification = { id, color, title, message, icon, duration };
  listeners.forEach((fn) => fn(notification));
}

// ---- Context + Provider ----
const NotifContext = createContext(null);

export function useNotificationStore() {
  const ctx = useContext(NotifContext);
  if (!ctx) {
    // 容错：未挂 Provider 时返回空 store
    return { notifications: [], dismiss: () => {} };
  }
  return ctx;
}

// ---- 内部 Provider（用 page.js 渲染，AppShell 外层） ----
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  // 用 ref 保存所有 setTimeout id，组件卸载时统一清理，防止内存泄漏
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  // 订阅全局事件总线
  useEffect(() => {
    const handler = (notif) => {
      setNotifications((prev) => [...prev, notif]);
      if (notif.duration > 0) {
        const timer = setTimeout(() => {
          dismiss(notif.id);
        }, notif.duration);
        timersRef.current.set(notif.id, timer);
      }
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
      // 组件卸载时清理所有定时器
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [dismiss]);

  return (
    <NotifContext.Provider value={{ notifications, dismiss }}>
      {children}
    </NotifContext.Provider>
  );
}

// ---- 通知容器（挂在 AppShell 外层，fixed 定位右上角） ----
export function NotificationContainer() {
  const { notifications, dismiss } = useNotificationStore();

  return (
    <Box
      style={{
        position: "fixed",
        top: 70,         // 避开 Header
        right: 16,
        zIndex: 9999,    // 高于所有 Mantine 弹层
        width: 340,
        pointerEvents: "none",  // 容器不接收事件，只内部 Paper 接收
      }}
    >
      <Stack gap="xs">
        {notifications.map((n) => (
          <Paper
            key={n.id}
            p="sm"
            shadow="md"
            radius="md"
            withBorder
            style={{
              borderLeft: `4px solid var(--mantine-color-${n.color}-6)`,
              pointerEvents: "auto",
              animation: "mantine-notif-in 0.2s ease-out",
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Group gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 0 }}>
                <Text size="lg" style={{ flexShrink: 0 }}>{n.icon}</Text>
                <div style={{ minWidth: 0 }}>
                  {n.title && (
                    <Text size="sm" fw={600} lineClamp={1}>
                      {n.title}
                    </Text>
                  )}
                  {n.message && (
                    <Text size="xs" c="dimmed" lineClamp={3}>
                      {n.message}
                    </Text>
                  )}
                </div>
              </Group>
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => dismiss(n.id)}
                aria-label="关闭通知"
                style={{ flexShrink: 0 }}
              >
                ✕
              </ActionIcon>
            </Group>
          </Paper>
        ))}
      </Stack>
      {/* 进入动画（通过内联 style 注入） */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes mantine-notif-in {
              from { opacity: 0; transform: translateX(20px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `,
        }}
      />
    </Box>
  );
}
