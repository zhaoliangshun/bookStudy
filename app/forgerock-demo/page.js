"use client";

// 独立路由：ForgeRock Mock Demo
// 与教程 /forgerock 是不同路由
// 这里挂载不依赖 AM 服务器的 mock demo 组件
import ForgeRockMockDemo from "./ForgeRockMockDemo";

export default function ForgeRockDemoPage() {
  return <ForgeRockMockDemo />;
}
