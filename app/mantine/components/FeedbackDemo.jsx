"use client";

// =============================================================
// 文件：app/mantine/components/FeedbackDemo.jsx
// -------------------------------------------------------------
// 【职责】演示 Mantine 用户反馈类组件：
//   - Modal          : 对话框/弹窗
//   - Drawer          : 侧边抽屉
//   - LoadingOverlay  : 加载遮罩层
//   - Alert           : 警告/提示条
//   - Notification    : 通知提示（自定义实现）
//   - Skeleton        : 骨架屏
//   - Tooltip         : 悬浮提示
//   - ActionIcon      : 图标按钮
// =============================================================

import { useState, useRef } from "react";
import {
  Paper,
  Title,
  Text,
  Stack,
  Button,
  Group,
  Modal,
  Drawer,
  LoadingOverlay,
  Alert,
  Notification,
  Skeleton,
  Tooltip,
  ActionIcon,
  SimpleGrid,
  Divider,
  Box,
} from "@mantine/core";

export default function FeedbackDemo() {
  // ---- 各组件的开关状态 ----
  // useDisclosure 比 useState(false) + 手写 toggle 更简洁
  // 这里用 useState 演示基础写法，实际推荐 useDisclosure
  const [modalOpened, setModalOpened] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---- 通知列表 ----
  // 每个通知有 id（用于删除）、title、message、color
  const [notifications, setNotifications] = useState([]);
  // useRef 保存自增 ID，避免 useState 那样触发额外渲染
  const notifIdRef = useRef(0);

  // ---- 模拟加载 ----
  // 点击按钮 → 显示 LoadingOverlay → 2 秒后隐藏
  const handleLoad = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // ---- 添加通知 ----
  // 往 notifications 数组追加一条，3 秒后自动移除
  const addNotification = (color, title, message) => {
    const id = ++notifIdRef.current;
    setNotifications((prev) => [...prev, { id, color, title, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>🔔 反馈交互</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Modal + Drawer + LoadingOverlay + Alert + Notification + Skeleton + Tooltip
        </Text>
      </div>

      {/* ============ 通知容器（固定在右上角） ============ */}
      {/* fixed 定位 + z-index 高，覆盖在所有内容之上 */}
      <Box
        style={{
          position: "fixed",
          top: 70,
          right: 20,
          zIndex: 1000,
          width: 320,
        }}
      >
        <Stack gap="xs">
          {notifications.map((n) => (
            <Notification
              key={n.id}
              color={n.color}
              title={n.title}
              onClose={() =>
                setNotifications((prev) =>
                  prev.filter((item) => item.id !== n.id)
                )
              }
            >
              {n.message}
            </Notification>
          ))}
        </Stack>
      </Box>

      {/* ============ Alert 提示条 ============ */}
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <Alert variant="light" color="blue" title="信息提示" icon="ℹ️">
          这是一条普通信息提示，用于向用户传达非紧急消息。
        </Alert>
        <Alert variant="light" color="green" title="操作成功" icon="✅">
          数据已成功保存！绿色表示积极的、成功的反馈。
        </Alert>
        <Alert variant="light" color="yellow" title="警告信息" icon="⚠️">
          请注意此操作不可撤销，建议先备份。
        </Alert>
        <Alert variant="light" color="red" title="错误提示" icon="❌">
          网络请求失败，请检查网络后重试。
        </Alert>
      </SimpleGrid>

      {/* ============ 按钮触发区 ============ */}
      <Paper withBorder p="lg">
        <Title order={4} mb="md">点击交互</Title>
        <Group gap="sm" wrap="wrap">
          {/* ---- 打开 Modal ---- */}
          <Button onClick={() => setModalOpened(true)}>
            打开弹窗 Modal
          </Button>

          {/* ---- 打开 Drawer ---- */}
          <Button variant="light" onClick={() => setDrawerOpened(true)}>
            打开抽屉 Drawer
          </Button>

          {/* ---- 模拟加载 ---- */}
          <Button variant="default" onClick={handleLoad}>
            模拟加载 2 秒
          </Button>

          {/* ---- 触发通知 ---- */}
          <Button
            color="green"
            variant="light"
            onClick={() =>
              addNotification("green", "保存成功", "您的修改已保存")
            }
          >
            成功通知
          </Button>
          <Button
            color="red"
            variant="light"
            onClick={() =>
              addNotification("red", "删除失败", "没有操作权限")
            }
          >
            错误通知
          </Button>
        </Group>
      </Paper>

      {/* ============ LoadingOverlay 加载遮罩 ============ */}
      {/* relative 定位 + LoadingOverlay 覆盖在上面 */}
      <Paper withBorder p="lg" style={{ position: "relative", minHeight: 120 }}>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Text size="sm" c="dimmed">
          点击上方「模拟加载 2 秒」按钮，此区域会出现加载遮罩。
          LoadingOverlay 常用于表单提交、数据请求等异步操作的等待反馈。
        </Text>
      </Paper>

      {/* ============ Skeleton 骨架屏 ============ */}
      <Paper withBorder p="lg">
        <Title order={4} mb="md">骨架屏 Skeleton（数据加载占位）</Title>
        {/* Skeleton：在数据加载完成前显示灰色占位块，
            模拟最终内容的布局，避免空白闪烁 */}
        <Group gap="md" align="flex-start">
          <Skeleton circle width={48} height={48} />
          <Stack gap="xs" style={{ flex: 1 }}>
            <Skeleton height={16} width="40%" />
            <Skeleton height={12} width="80%" />
            <Skeleton height={12} width="60%" />
          </Stack>
        </Group>
      </Paper>

      {/* ============ Tooltip 悬浮提示 ============ */}
      <Paper withBorder p="lg">
        <Title order={4} mb="md">Tooltip 悬浮提示 + ActionIcon 图标按钮</Title>
        <Group gap="md">
          {/* Tooltip：鼠标悬停时显示提示文字，label 是提示内容 */}
          <Tooltip label="编辑" position="bottom">
            <ActionIcon variant="subtle" color="indigo" size="lg">
              ✏️
            </ActionIcon>
          </Tooltip>
          <Tooltip label="删除" position="bottom" color="red">
            <ActionIcon variant="subtle" color="red" size="lg">
              🗑️
            </ActionIcon>
          </Tooltip>
          <Tooltip label="分享" position="bottom" color="teal">
            <ActionIcon variant="subtle" color="teal" size="lg">
              🔗
            </ActionIcon>
          </Tooltip>
          <Tooltip label="更多操作" position="bottom">
            <ActionIcon variant="subtle" size="lg">
              ⋯
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>

      {/* ============ Modal 弹窗 ============ */}
      {/* opened：是否显示；onClose：关闭回调（点遮罩/ESC 触发）
          title：弹窗标题；size：宽度档位 */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="确认删除"
        size="md"
      >
        <Stack>
          <Text size="sm">
            确定要删除这条记录吗？此操作不可撤销。
          </Text>
          <Alert variant="light" color="red" icon="⚠️">
            删除后数据将永久丢失，无法恢复！
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpened(false)}>
              取消
            </Button>
            <Button
              color="red"
              onClick={() => {
                setModalOpened(false);
                addNotification("green", "删除成功", "记录已删除");
              }}
            >
              确认删除
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ============ Drawer 抽屉 ============ */}
      {/* Drawer 从屏幕侧边滑入，适合放表单/详情/筛选器
          position：滑出方向（right/left/top/bottom） */}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        title="筛选条件"
        position="right"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Drawer 常用于放筛选表单、详情面板等需要一定空间的内容。
          </Text>
          <Divider label="筛选选项" labelPosition="center" />
          <Skeleton height={36} />
          <Skeleton height={36} />
          <Skeleton height={36} />
          <Button
            onClick={() => {
              setDrawerOpened(false);
              addNotification("blue", "筛选完成", "已应用筛选条件");
            }}
          >
            应用筛选
          </Button>
        </Stack>
      </Drawer>
    </Stack>
  );
}
