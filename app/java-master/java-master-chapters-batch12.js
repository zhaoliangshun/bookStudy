// =============================================================
// Java 开发详解 - 第 12 批（并发编程基础）
// =============================================================

export const chapters = [
  {
    id: "java-12-1",
    group: "并发编程基础",
    icon: "👀",
    title: "线程基础",
    content: `# 线程基础

## 一、概述

**线程基础** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 线程基础 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 线程基础 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 线程基础 ===");
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

线程基础 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-12-2",
    group: "并发编程基础",
    icon: "💬",
    title: "线程生命周期",
    content: `# 线程生命周期

## 一、概述

**线程生命周期** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 线程生命周期 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 线程生命周期 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 线程生命周期 ===");
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

线程生命周期 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-12-3",
    group: "并发编程基础",
    icon: "💣",
    title: "Thread 常用方法",
    content: `# Thread 常用方法

## 一、概述

**Thread 常用方法** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 Thread 常用方法 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | Thread 常用方法 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class ThreadDemo {
    public static void main(String[] args) {
        System.out.println("=== Thread 常用方法 ===");
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

Thread 常用方法 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-12-4",
    group: "并发编程基础",
    icon: "🔒",
    title: "Runnable 与 Callable",
    content: `# Runnable 与 Callable

## 一、概述

**Runnable 与 Callable** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 Runnable 与 Callable 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | Runnable 与 Callable 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class RunnableCallableDemo {
    public static void main(String[] args) {
        System.out.println("=== Runnable 与 Callable ===");
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

Runnable 与 Callable 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-12-5",
    group: "并发编程基础",
    icon: "🔐",
    title: "synchronized",
    content: `# synchronized

## 一、概述

**synchronized** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 synchronized 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | synchronized 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class synchronizedDemo {
    public static void main(String[] args) {
        System.out.println("=== synchronized ===");
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

synchronized 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-12-6",
    group: "并发编程基础",
    icon: "⚖️",
    title: "volatile",
    content: `# volatile

## 一、概述

**volatile** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 volatile 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | volatile 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class volatileDemo {
    public static void main(String[] args) {
        System.out.println("=== volatile ===");
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

volatile 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-12-7",
    group: "并发编程基础",
    icon: "⚛️",
    title: "wait/notify",
    content: `# wait/notify

## 一、概述

**wait/notify** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 wait/notify 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | wait/notify 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class waitnotifyDemo {
    public static void main(String[] args) {
        System.out.println("=== wait/notify ===");
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

wait/notify 是 Java 开发必备知识，建议多动手实践加深理解。
`
  },
  {
    id: "java-12-8",
    group: "并发编程基础",
    icon: "⚙️",
    title: "线程安全分析",
    content: `# 线程安全分析

## 一、概述

**线程安全分析** 是 Java 并发编程基础 的重要知识点。

### 学习目标

- 理解 线程安全分析 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | 线程安全分析 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class Demo {
    public static void main(String[] args) {
        System.out.println("=== 线程安全分析 ===");
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

线程安全分析 是 Java 开发必备知识，建议多动手实践加深理解。
`
  }
];
