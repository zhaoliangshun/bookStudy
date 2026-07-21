# 《Mantine v9 实战指南》

> 基于 Mantine v9.4+ 的完整指南，聚焦设计理念、Theme 系统与 Form 验证

---

## 前言

Mantine 是一个专注于提供卓越用户体验和开发体验的 React 组件库。自 2021 年 1 月由 Vitaly Rtishchev 创建以来，它已发展为拥有 138 个组件、82 个 hooks、345 个文档页面和 1668 个交互式 demos 的成熟生态。

v9 是 Mantine 的一次重大飞跃——全面拥抱 React 19.2+，引入 Standard Schema 规范统一表单验证，新增日历调度组件套件，并针对 AI 辅助开发工作流进行了深度优化。

本书不追求面面俱到地罗列所有组件的 API，而是聚焦于三个最核心的主题：

1. **设计理念**——理解 Mantine "为什么"这样设计，才能在项目中做出正确的架构决策
2. **Theme 系统**——Mantine 最强大的能力之一，深入掌握它意味着可以构建任何视觉风格
3. **Form 验证**——@mantine/form 是独立于 UI 组件的表单管理库，v9 的 schemaResolver 变更使其更加通用

### 适合读者

- 有 React 基础，希望系统学习 Mantine 的前端开发者
- 正在从 Material-UI、Ant Design 等迁移到 Mantine 的团队
- 需要构建企业级品牌主题和复杂表单的工程师
- 对 React 19 + Next.js 16 技术栈感兴趣的开发者

### 技术栈版本

| 技术 | 版本 |
|------|------|
| Mantine | v9.4+ |
| React | 19.2+ |
| Next.js | 16+（App Router）|
| Zod | v4+ |
| TypeScript | 5+（可选）|

### 如何阅读

- **第一章**适合所有读者，建立对 Mantine 的整体认知
- **第二章**是全书重点，建议反复阅读并结合实践
- **第三章**是全书另一个重点，建议边读边在项目中实践

所有代码示例均包含详细的中文注释，可直接复制到项目中使用。

---

## 目录

### [第一章 Mantine 的设计理念](./chapter1-philosophy.md)

- 1.1 什么是 Mantine
- 1.2 核心设计哲学
- 1.3 模块化包结构
- 1.4 可访问性（Accessibility）承诺
- 1.5 Dark Mode 哲学
- 1.6 v9 的新特性
- 1.7 与其他 UI 库的对比
- 1.8 快速开始

### [第二章 Mantine Theme 系统](./chapter2-theme.md) ⭐ 重点

- 2.1 MantineProvider 详解
- 2.2 主题对象完整结构
- 2.3 createTheme 函数
- 2.4 自定义颜色系统
- 2.5 CSS 变量系统
- 2.6 组件级样式覆盖（Styles API）
- 2.7 响应式主题
- 2.8 Color Scheme 管理
- 2.9 多主题管理
- 2.10 TypeScript 类型安全
- 2.11 实战：构建完整的自定义主题

### [第三章 Mantine Form 验证](./chapter3-form-validation.md) ⭐ 重点

- 3.1 @mantine/form 概述
- 3.2 useForm hook 基础
- 3.3 验证策略详解
- 3.4 验证时机控制
- 3.5 内置验证函数（Premade validators）
- 3.6 Schema 验证（v9 重点：schemaResolver + Standard Schema）
- 3.7 嵌套表单和列表表单
- 3.8 表单状态管理
- 3.9 表单提交处理
- 3.10 动态表单字段
- 3.11 Form Context（多组件共享表单状态）
- 3.12 Form Actions（跨组件状态变更）
- 3.13 实战：完整的注册表单
- 3.14 v8 到 v9 的迁移要点
- 3.15 常见陷阱与最佳实践
- 3.16 TypeScript 集成

---

## v9 关键变更速查

| 变更项 | v8 | v9 |
|--------|-----|-----|
| React 依赖 | React 18+ | React 19.2+ |
| Schema 验证 | zodResolver / yupResolver / valibotResolver | 统一为 schemaResolver（Standard Schema）|
| fontWeights.medium | 500 | 600 |
| 内联样式去重 | 无 | deduplicateInlineStyles（React 19 style hoisting）|
| 日历调度 | 无 | @mantine/schedule 包 |
| Collapse 方向 | 仅垂直 | 支持 orientation="horizontal" |
| 图表库 | Recharts 2 | Recharts 3 |
| 富文本 | Tiptap 2 | Tiptap 3 |

---

## 参考资源

- [Mantine 官方文档](https://mantine.dev/)
- [Mantine v9 Changelog](https://mantine.dev/changelog/9-0-0/)
- [v8 → v9 迁移指南](https://mantine.dev/guides/8x-to-9x/)
- [Standard Schema 规范](https://standardschema.dev/)
- [Zod v4 文档](https://zod.dev/v4)
