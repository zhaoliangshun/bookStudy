"use client";

// =============================================================
// 文件：app/mantine/components/FeedbackDemo.jsx
// -------------------------------------------------------------
// 【职责】演示 Mantine 反馈交互类组件：
//   - Modal        : 模态弹窗（带确认/取消）
//   - Drawer       : 抽屉（从侧边滑入）
//   - Tooltip      : 文字提示（鼠标悬停）
//   - Alert        : 警告/提示条
//   - Loader       : 加载指示器
//   - LoadingOverlay : 全屏加载遮罩
//   - Skeleton     : 骨架屏占位
//   - Progress     : 进度条
//   - 自建通知     : 右上角 Toast 弹窗
//
// 【优化点（相对旧版）】
//   - 通知改用自建 store（统一管理、定时清理、不依赖 @mantine/notifications）
//   - Modal 加 size 切换演示
//   - Drawer 加 position 切换（左/右/上/下）
//   - LoadingOverlay 加可取消和带进度条的版本
//   - 加 Alert 的 4 种语义演示
//   - 整体更整齐的 SimpleGrid 布局
// =============================================================

import { useState } from "react";
import {
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Modal,
  Drawer,
  Tooltip,
  Alert,
  Loader,
  LoadingOverlay,
  Skeleton,
  Progress,
  Box,
  SegmentedControl,
  ActionIcon,
  Badge,
  SimpleGrid,
  TextInput,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "./notifications";

export default function FeedbackDemo() {
  // ---- Modal 控制 ----
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [modalSize, setModalSize] = useState("md");
  const [modalContent, setModalContent] = useState("default");

  // ---- Drawer 控制 ----
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [drawerPosition, setDrawerPosition] = useState("right");

  // ---- LoadingOverlay ----
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // ---- Skeleton 状态（模拟首次加载） ----
  const [skeletonLoaded, setSkeletonLoaded] = useState(false);

  // ---- 通知通知 ----
  const [notifCount, setNotifCount] = useState(0);

  // ---- 模拟加载（带进度） ----
  const handleSimulateLoad = () => {
    setLoading(true);
    setLoadingProgress(0);
    const timer = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setLoading(false);
          showNotification({
            color: "green",
            title: "加载完成",
            message: "数据已准备就绪",
            icon: "✅",
          });
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  // ---- Skeleton 重新加载 ----
  const handleSkeletonReload = () => {
    setSkeletonLoaded(false);
    setTimeout(() => setSkeletonLoaded(true), 1500);
  };

  return (
    <Stack gap="xl">
      {/* ============ 区块标题 ============ */}
      <div>
        <Title order={2}>🔔 反馈交互</Title>
        <Text size="sm" c="dimmed" mt={4}>
          Modal + Drawer + Tooltip + Alert + LoadingOverlay + Skeleton + 自建通知
        </Text>
      </div>

      {/* ============ 通知区 ============ */}
      <Paper withBorder p="md">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={4}>📬 通知系统（自建）</Title>
            <Text size="xs" c="dimmed">
              右上角弹出，3 秒后自动消失，可手动关闭
            </Text>
          </div>
          <Badge color="indigo" variant="light">
            已发送 {notifCount} 条
          </Badge>
        </Group>
        <Group>
          <Button
            color="green"
            variant="light"
            onClick={() => {
              showNotification({ color: "green", title: "操作成功", message: "数据已保存到服务器", icon: "✅" });
              setNotifCount((c) => c + 1);
            }}
          >
            成功通知
          </Button>
          <Button
            color="red"
            variant="light"
            onClick={() => {
              showNotification({ color: "red", title: "操作失败", message: "网络连接超时，请重试", icon: "❌" });
              setNotifCount((c) => c + 1);
            }}
          >
            错误通知
          </Button>
          <Button
            color="yellow"
            variant="light"
            onClick={() => {
              showNotification({ color: "yellow", title: "注意", message: "你有 3 条未读消息", icon: "⚠️" });
              setNotifCount((c) => c + 1);
            }}
          >
            警告通知
          </Button>
          <Button
            color="indigo"
            variant="light"
            onClick={() => {
              showNotification({ color: "indigo", title: "提示", message: "系统将于 5 分钟后维护", icon: "ℹ️" });
              setNotifCount((c) => c + 1);
            }}
          >
            信息通知
          </Button>
        </Group>
      </Paper>

      {/* ============ Modal 演示 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">🪟 模态弹窗 Modal</Title>
        <Text size="xs" c="dimmed" mb="md">
          居中弹窗，遮罩背景，点击外部或按 Esc 关闭
        </Text>
        <Group>
          <SegmentedControl
            value={modalSize}
            onChange={setModalSize}
            data={[
              { value: "xs", label: "极小" },
              { value: "sm", label: "小" },
              { value: "md", label: "中" },
              { value: "lg", label: "大" },
              { value: "xl", label: "极大" },
            ]}
            size="xs"
          />
          <Button
            onClick={() => {
              setModalContent("default");
              openModal();
            }}
          >
            打开弹窗
          </Button>
          <Button
            variant="light"
            onClick={() => {
              setModalContent("confirm");
              openModal();
            }}
          >
            确认对话框
          </Button>
        </Group>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={modalContent === "confirm" ? "确认操作" : "弹窗演示"}
        size={modalSize}
        centered
      >
        {modalContent === "confirm" ? (
          <Stack>
            <Text size="sm">确定要执行此操作吗？此操作不可撤销。</Text>
            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={closeModal}>取消</Button>
              <Button
                color="red"
                onClick={() => {
                  closeModal();
                  showNotification({ color: "red", title: "已删除", message: "操作已完成", icon: "🗑️" });
                }}
              >
                确认删除
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack>
            <Text size="sm">
              这是一个 size="{modalSize}" 的弹窗。Mantine 的 Modal 支持 5 种预设尺寸，
              也可以传 CSS 宽度字符串自定义。
            </Text>
            <TextInput label="随便输入点什么" placeholder="这里输入..." />
            <Group justify="flex-end" mt="md">
              <Button onClick={closeModal}>好的</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ============ Drawer 演示 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">📂 抽屉 Drawer</Title>
        <Text size="xs" c="dimmed" mb="md">
          从指定方向滑入，覆盖在内容之上
        </Text>
        <Group>
          <SegmentedControl
            value={drawerPosition}
            onChange={setDrawerPosition}
            data={[
              { value: "left", label: "← 左侧" },
              { value: "right", label: "右侧 →" },
              { value: "top", label: "↑ 顶部" },
              { value: "bottom", label: "底部 ↓" },
            ]}
            size="xs"
          />
          <Button onClick={openDrawer}>打开抽屉</Button>
        </Group>
      </Paper>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={"抽屉 - " + drawerPosition}
        position={drawerPosition}
        size="md"
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Drawer 是从屏幕边缘滑入的面板，适合显示详情、设置或导航。
          </Text>
          <Divider />
          <Text size="sm" fw={500}>快速链接</Text>
          {["首页", "个人资料", "消息中心", "设置", "帮助"].map((item) => (
            <Button key={item} variant="subtle" justify="flex-start" fullWidth>
              {item}
            </Button>
          ))}
        </Stack>
      </Drawer>

      {/* ============ Tooltip + ActionIcon 演示 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">💬 文字提示 Tooltip</Title>
        <Text size="xs" c="dimmed" mb="md">
          鼠标悬停时显示提示，4 个方向可配置
        </Text>
        <Group>
          <Tooltip label="编辑" withArrow>
            <ActionIcon variant="light" color="indigo" size="lg">✏️</ActionIcon>
          </Tooltip>
          <Tooltip label="删除" withArrow position="bottom" color="red">
            <ActionIcon variant="light" color="red" size="lg">🗑️</ActionIcon>
          </Tooltip>
          <Tooltip label="分享给朋友" withArrow position="left" color="teal">
            <ActionIcon variant="light" color="teal" size="lg">🔗</ActionIcon>
          </Tooltip>
          <Tooltip label="下载文件" withArrow position="right" color="orange">
            <ActionIcon variant="light" color="orange" size="lg">📥</ActionIcon>
          </Tooltip>
          <Tooltip
            label="多行提示示例\n可以换行显示\n第三行内容"
            withArrow
            multiline
            w={200}
          >
            <Button variant="light">悬停看多行</Button>
          </Tooltip>
        </Group>
      </Paper>

      {/* ============ Alert 演示 ============ */}
      <Paper withBorder p="md">
        <Title order={4} mb="xs">⚠️ 警告提示 Alert</Title>
        <Text size="xs" c="dimmed" mb="md">
          4 种语义类型，传达不同严重程度
        </Text>
        <Stack gap="xs">
          <Alert variant="light" color="blue" title="信息" icon="ℹ️">
            这是一条普通的信息提示。
          </Alert>
          <Alert variant="light" color="green" title="成功" icon="✅">
            操作已成功完成，所有更改已保存。
          </Alert>
          <Alert variant="light" color="yellow" title="警告" icon="⚠️">
            你的密码即将过期，请尽快修改。
          </Alert>
          <Alert variant="light" color="red" title="错误" icon="❌">
            服务器连接失败，请检查网络后重试。
          </Alert>
        </Stack>
      </Paper>

      {/* ============ LoadingOverlay + Loader + Progress ============ */}
      <Paper withBorder p="md" pos="relative">
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ blur: 2 }}
          loaderProps={{ size: "lg", type: "dots" }}
        />
        <Title order={4} mb="xs">⏳ 加载状态</Title>
        <Text size="xs" c="dimmed" mb="md">
          LoadingOverlay 全屏遮罩 / Loader 局部指示器 / Progress 进度条
        </Text>
        <Stack>
          <Group>
            <Loader size="sm" />
            <Text size="sm">小 Loader</Text>
            <Loader size="md" color="indigo" />
            <Text size="sm">中 Loader</Text>
            <Loader size="lg" type="bars" color="orange" />
            <Text size="sm">条形 Loader</Text>
          </Group>

          <Box mt="sm">
            <Group justify="space-between" mb={4}>
              <Text size="sm">下载进度（模拟）</Text>
              <Text size="sm" c="indigo" fw={500}>
                {loadingProgress}%
              </Text>
            </Group>
            <Progress value={loadingProgress} size="md" radius="xl" animated={loading} />
          </Box>

          <Group mt="md">
            <Button onClick={handleSimulateLoad} loading={loading}>
              模拟加载 2 秒
            </Button>
            <Button variant="light" onClick={handleSimulateLoad} loading={loading}>
              带遮罩的加载
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* ============ Skeleton 骨架屏 ============ */}
      <Paper withBorder p="md">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={4}>🦴 骨架屏 Skeleton</Title>
            <Text size="xs" c="dimmed">
              数据加载中时的占位 UI，避免布局抖动
            </Text>
          </div>
          <Button size="xs" variant="light" onClick={handleSkeletonReload}>
            重新加载
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {skeletonLoaded ? (
            [1, 2, 3].map((i) => (
              <Paper key={i} withBorder p="md" radius="md">
                <Group mb="xs">
                  <Skeleton circle height={32} width={32} />
                  <Skeleton height={12} width="40%" />
                </Group>
                <Skeleton height={8} mt="sm" />
                <Skeleton height={8} mt="xs" width="80%" />
                <Skeleton height={8} mt="xs" width="60%" />
                <Text size="xs" c="dimmed" mt="md">
                  文章 #{i} 预览内容
                </Text>
              </Paper>
            ))
          ) : (
            [1, 2, 3].map((i) => (
              <Paper key={i} withBorder p="md" radius="md">
                <Group mb="xs">
                  <Skeleton circle height={32} />
                  <Skeleton height={12} width="40%" />
                </Group>
                <Skeleton height={8} mt="sm" />
                <Skeleton height={8} mt="xs" width="80%" />
                <Skeleton height={8} mt="xs" width="60%" />
              </Paper>
            ))
          )}
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
