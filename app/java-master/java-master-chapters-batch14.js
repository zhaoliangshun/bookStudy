// =============================================================
// Java 开发详解 - 第 14 批（JVM 内存模型与垃圾回收）
// =============================================================

export const chapters = [
  {
    id: "java-14-1",
    group: "JVM 内存模型与垃圾回收",
    icon: "⚙️",
    title: "JVM 内存区域",
    content: `# JVM 内存区域

## 一、概述

**JVM 内存区域** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 JVM 内存区域 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | JVM 内存区域 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class JVMDemo {
    public static void main(String[] args) {
        System.out.println("=== JVM 内存区域 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

JVM 内存区域 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-14-2",
    group: "JVM 内存模型与垃圾回收",
    icon: "🔧",
    title: "程序计数器与栈",
    content: `# 程序计数器与栈

## 一、概述

**程序计数器与栈** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 程序计数器与栈 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 程序计数器与栈 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 程序计数器与栈 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

程序计数器与栈 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-14-3",
    group: "JVM 内存模型与垃圾回收",
    icon: "🐛",
    title: "堆与方法区",
    content: `# 堆与方法区

## 一、概述

**堆与方法区** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 堆与方法区 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 堆与方法区 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 堆与方法区 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

堆与方法区 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-14-4",
    group: "JVM 内存模型与垃圾回收",
    icon: "✨",
    title: "对象内存布局",
    content: `# 对象内存布局

## 一、概述

**对象内存布局** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 对象内存布局 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 对象内存布局 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 对象内存布局 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

对象内存布局 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-14-5",
    group: "JVM 内存模型与垃圾回收",
    icon: "🎉",
    title: "垃圾回收算法",
    content: `# 垃圾回收算法

## 一、概述

**垃圾回收算法** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 垃圾回收算法 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 垃圾回收算法 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 垃圾回收算法 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

垃圾回收算法 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-14-6",
    group: "JVM 内存模型与垃圾回收",
    icon: "🚀",
    title: "垃圾收集器",
    content: `# 垃圾收集器

## 一、概述

**垃圾收集器** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 垃圾收集器 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 垃圾收集器 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 垃圾收集器 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

垃圾收集器 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-14-7",
    group: "JVM 内存模型与垃圾回收",
    icon: "🧵",
    title: "JVM 参数调优",
    content: `# JVM 参数调优

## 一、概述

**JVM 参数调优** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 JVM 参数调优 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | JVM 参数调优 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class JVMDemo {
    public static void main(String[] args) {
        System.out.println("=== JVM 参数调优 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

JVM 参数调优 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-14-8",
    group: "JVM 内存模型与垃圾回收",
    icon: "👑",
    title: "OOM 排查",
    content: `# OOM 排查

## 一、概述

**OOM 排查** 是 Java JVM 内存模型与垃圾回收 的重要知识点。

### 学习目标

- 理解 OOM 排查 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | OOM 排查 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class OOMDemo {
    public static void main(String[] args) {
        System.out.println("=== OOM 排查 ===");
        demonstrate();
    }
    private static void demonstrate() {
        // 示例代码
    }
}
\`\`\`

---

## 三、最佳实践

- 代码清晰易懂，优先可维护性
- 编写单元测试
- 注意异常处理和线程安全
- 多阅读 JDK 源码

---

## 四、本章小结

OOM 排查 是 Java 开发必备知识，建议多动手实践加深理解。
`
  }
];
