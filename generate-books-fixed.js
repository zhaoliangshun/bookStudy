const fs = require('fs');
const path = require('path');

// Helper function to escape backticks and ${ in template strings
function escapeForTemplate(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// ==================== JAVA CHAPTERS ====================

const javaGroups = [
  { name: "Java 基础语法入门", icon: "☕", count: 8 },
  { name: "流程控制与数组", icon: "🔀", count: 8 },
  { name: "面向对象编程基础", icon: "🏛️", count: 8 },
  { name: "面向对象高级特性", icon: "🔮", count: 8 },
  { name: "核心 API 与字符串处理", icon: "📜", count: 8 },
  { name: "集合框架深度解析", icon: "📚", count: 8 },
  { name: "泛型与枚举", icon: "🔧", count: 8 },
  { name: "异常处理与注解", icon: "⚠️", count: 8 },
  { name: "Lambda 与函数式编程", icon: "λ", count: 8 },
  { name: "Stream API 深度解析", icon: "🌊", count: 8 },
  { name: "IO/NIO 与反射", icon: "📂", count: 8 },
  { name: "并发编程基础", icon: "🧵", count: 8 },
  { name: "JUC 并发包与原子类", icon: "🔒", count: 8 },
  { name: "JVM 内存模型与垃圾回收", icon: "🗑️", count: 8 },
  { name: "Java 新特性与设计模式", icon: "✨", count: 8 },
  { name: "工程实践与构建工具", icon: "🛠️", count: 8 }
];

const javaTitles = [
  // Java 基础语法入门
  ["Java 语言概述与发展历史", "数据类型、变量与常量", "运算符与表达式", "控制台输入输出", "IDE 使用与调试技巧", "Java 编码规范", "第一个完整程序", "基础语法综合练习"],
  // 流程控制与数组
  ["分支结构：if-else 条件语句", "switch 多分支选择语句", "for 循环语句", "while 与 do-while 循环", "break、continue 与 return", "一维数组", "二维数组", "数组常见算法"],
  // 面向对象编程基础
  ["类与对象基础", "方法详解", "构造方法与对象初始化", "封装与访问控制", "包与导入", "static 关键字", "this 关键字", "OOP 基础综合案例"],
  // 面向对象高级特性
  ["继承与方法重写", "super 关键字", "多态与动态绑定", "抽象类", "接口", "内部类", "Object 类详解", "包装类与装箱拆箱"],
  // 核心 API 与字符串处理
  ["String 类深度解析", "StringBuilder 与 StringBuffer", "Math 与 Random 类", "日期时间 API（Date/Calendar）", "Java 8 新日期时间 API", "正则表达式", "常用工具类", "核心 API 实战"],
  // 集合框架深度解析
  ["集合框架概述", "List 接口与 ArrayList", "LinkedList 与 Vector", "Set 接口与 HashSet", "TreeSet 与 LinkedHashSet", "Map 接口与 HashMap", "TreeMap 与 LinkedHashMap", "Collections 工具类"],
  // 泛型与枚举
  ["泛型基础", "泛型类与泛型方法", "通配符与类型边界", "类型擦除", "枚举类型基础", "枚举高级用法", "注解基础", "自定义注解"],
  // 异常处理与注解
  ["异常体系结构", "try-catch-finally", "throws 与 throw", "自定义异常", "try-with-resources", "常见异常与排查", "注解处理器", "异常最佳实践"],
  // Lambda 与函数式编程
  ["函数式编程思想", "Lambda 表达式基础", "函数式接口", "方法引用与构造器引用", "Predicate 与 Consumer", "Function 与 Supplier", "Comparator 函数式", "Lambda 实战案例"],
  // Stream API 深度解析
  ["Stream 概述与创建", "中间操作：筛选与切片", "中间操作：映射与排序", "终止操作：匹配与查找", "终止操作：归约与收集", "并行流", "Collectors 工具类", "Stream 实战"],
  // IO/NIO 与反射
  ["File 类与文件操作", "字节流 InputStream/OutputStream", "字符流 Reader/Writer", "缓冲流与转换流", "序列化与反序列化", "NIO 基础", "反射机制", "类加载器"],
  // 并发编程基础
  ["线程基础与创建方式", "线程生命周期与状态转换", "Thread 类常用方法", "Runnable 与 Callable", "线程同步 synchronized", "volatile 关键字", "线程间通信 wait/notify", "线程安全问题分析"],
  // JUC 并发包与原子类
  ["Lock 接口与 ReentrantLock", "ReadWriteLock 读写锁", "Condition 条件变量", "原子类 AtomicInteger", "CAS 原理与 ABA 问题", "线程池 ThreadPoolExecutor", "并发容器 ConcurrentHashMap", "CountDownLatch 与 CyclicBarrier"],
  // JVM 内存模型与垃圾回收
  ["JVM 内存区域划分", "程序计数器与虚拟机栈", "堆与方法区", "对象创建与内存布局", "垃圾回收算法", "垃圾收集器对比", "JVM 参数调优", "内存泄漏与 OOM 排查"],
  // Java 新特性与设计模式
  ["Java 8 新特性汇总", "Java 9-11 新特性", "Java 17 新特性", "Java 21 虚拟线程", "单例模式", "工厂模式与抽象工厂", "观察者模式与策略模式", "设计模式总结"],
  // 工程实践与构建工具
  ["Maven 基础与依赖管理", "Maven 生命周期与插件", "Gradle 入门", "单元测试 JUnit 5", "日志框架 SLF4J/Logback", "代码质量检查 SonarQube", "Git 版本控制", "项目实战：学生管理系统"]
];

const javaIcons = ["☕","📦","➕","⌨️","🔧","📏","👋","🏋️","🔀","🔘","🔄","🔁","⏭️","📊","🗄️","🧮","🏛️","🚪","🛠️","🎁","📦","🔑","📦","🧪","🔮","👨‍👦","⬆️","🎭","📄","🔌","🕳️","📦","🎁","📜","🔤","🔢","📅","🕐","🔍","🧰","💻","📚","📋","🔗","📭","🌳","🗺️","🌳","🧰","🔧","🧩","🔀","❓","🏷️","⚠️","🚨","🛡️","💥","🧹","🔖","🏭","λ","→","🎯","📌","✅","🔄","📊","💪","🌊","💧","🔍","🔀","🎯","🔗","⚡","📥","📂","📁","📖","📝","🔄","💾","💿","🔍","📦","🧵","🏃","🔄","🤝","👀","💬","💣","🔒","🔐","⚖️","⚛️","⚙️","🗺️","🚦","🗑️","🧠","📚","🏭","🏗️","♻️","🏭","⚙️","🔧","🐛","✨","🎉","🚀","🧵","👑","💡","🎭","🏭","🛠️","📦","🎬","✅","📝","✅","🔍","🌳","🎓"];

function generateJavaChapter(groupIdx, chapterIdx, title, icon, chapterNum) {
  const groupName = javaGroups[groupIdx].name;
  const id = `java-${groupIdx+1}-${chapterIdx+1}`;
  
  return `  {
    id: "${id}",
    group: "${groupName}",
    icon: "${icon}",
    title: "${title}",
    content: \`
# ${title}

## 一、概述

**${title}** 是 Java 开发中的重要知识点，在实际项目开发中应用广泛。本章将系统讲解 ${title} 的核心概念、使用方法和最佳实践。

### 学习目标

- 理解 ${title} 的基本概念和原理
- 掌握 ${title} 的核心 API 和使用方式
- 了解常见坑点和避坑指南
- 通过代码示例加深理解
- 掌握实际项目中的应用场景

---

## 二、核心知识

### 2.1 基本概念

${title} 是 Java ${groupName} 部分的重要内容。理解其原理对于写出高质量、高性能的 Java 代码至关重要。

| 要点 | 说明 |
|------|------|
| 核心原理 | 理解底层实现机制 |
| 适用场景 | 什么时候使用，什么时候不使用 |
| 优缺点 | 技术选型时需要考虑的 trade-off |
| 线程安全 | 在多线程环境下是否安全 |
| 性能特点 | 时间/空间复杂度，性能表现 |

### 2.2 代码示例

\\`\\`\\`java
package com.example.demo;

/**
 * ${title} 示例代码
 */
public class ${title.replace(/[^a-zA-Z0-9]/g, '')}Demo {
    public static void main(String[] args) {
        System.out.println("学习：${title}");
        
        // TODO: 这里是核心代码示例
        // 在实际学习过程中，建议亲手敲一遍代码
        // 理解每一行代码的含义和作用
        
        // 示例1：基础用法
        demonstrateBasicUsage();
        
        // 示例2：进阶用法
        demonstrateAdvancedUsage();
    }
    
    private static void demonstrateBasicUsage() {
        System.out.println("=== 基础用法演示 ===");
        // 基础用法代码
    }
    
    private static void demonstrateAdvancedUsage() {
        System.out.println("=== 进阶用法演示 ===");
        // 进阶用法代码
    }
}
\\`\\`\\`

### 2.3 关键 API 一览

| 方法/类 | 说明 | 示例 |
|---------|------|------|
| 常用方法1 | 功能说明 | 代码示例片段 |
| 常用方法2 | 功能说明 | 代码示例片段 |
| 常用类1 | 功能说明 | 使用场景 |

---

## 三、深入理解

### 3.1 底层原理

要真正掌握 ${title}，需要理解其底层实现原理。建议阅读 JDK 源码，结合实际代码调试来加深理解。

### 3.2 常见坑点

**坑点1：容易忽略的边界情况**

很多初学者在使用 ${title} 时容易犯错误，需要特别注意边界条件、空指针、并发安全等问题。

**坑点2：性能问题**

不恰当的使用方式可能导致性能问题。例如在循环中做重复操作、没有选择合适的数据结构等。

\\`\\`\\`java
// 反例：性能较差的写法
public void badExample() {
    String result = "";
    for (int i = 0; i < 10000; i++) {
        result += i;  // 每次都创建新的 String 对象，性能差
    }
}

// 正例：使用 StringBuilder
public void goodExample() {
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < 10000; i++) {
        sb.append(i);
    }
    String result = sb.toString();
}
\\`\\`\\`

### 3.3 最佳实践

1. **优先考虑代码可读性**，不要过早优化
2. **编写单元测试**验证代码正确性
3. **注意异常处理**，不要吞掉异常
4. **使用日志代替 System.out.println**
5. **遵循 Java 编码规范**，保持代码风格统一
6. **多线程环境下特别注意线程安全问题**

---

## 四、实战经验

### 4.1 项目应用场景

在实际企业级开发中，${title} 常用于以下场景：

- 业务逻辑处理
- 数据转换与处理
- 框架底层实现
- 性能优化

### 4.2 调试技巧

调试 ${title} 相关代码时：

1. 使用 IDEA 的 Debug 模式，设置断点观察变量值
2. 打印关键日志，追踪执行流程
3. 编写单元测试验证各种情况
4. 阅读 JDK 源码理解实现

### 4.3 面试常考问题

**Q1：请简述 ${title} 的原理？**

回答思路：是什么 → 为什么需要 → 怎么实现的 → 优缺点 → 使用场景。

**Q2：${title} 在实际项目中怎么用的？遇到过什么问题？**

结合自己的项目经验回答，讲清楚：业务背景 → 遇到的问题 → 解决方案 → 效果如何 → 有什么收获。

---

## 五、本章小结

${title} 是 Java 开发者必须掌握的核心知识点。通过本章学习，我们了解了：

1. ${title} 的基本概念和使用场景
2. 核心 API 和常用方法
3. 底层原理和最佳实践
4. 常见坑点和避坑指南
5. 项目中的实际应用

学习编程最重要的是实践。建议读者在学习完本章后：

1. 亲手敲一遍示例代码
2. 完成课后练习题
3. 在实际项目中尝试应用
4. 阅读 JDK 源码深入理解

下一章我们将继续学习 Java 的其他核心知识点。
\`
  },`;
}

// Generate Java batch files
let javaChapterIdx = 0;
for (let batch = 0; batch < 16; batch++) {
  let content = `// =============================================================
// Java 开发详解 - 第 ${batch+1} 批章节（${javaGroups[batch].name} 8 章）
// =============================================================

export const chapters = [
`;
  
  for (let ch = 0; ch < 8; ch++) {
    const title = javaTitles[batch][ch];
    const icon = javaIcons[javaChapterIdx] || "📝";
    content += generateJavaChapter(batch, ch, title, icon, javaChapterIdx+1);
    if (ch < 7) content += ",";
    content += "\n";
    javaChapterIdx++;
  }
  
  content += `
];
`;
  
  const filePath = path.join(__dirname, 'app/java-master', `java-master-chapters-batch${batch+1}.js`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${path.basename(filePath)}`);
}

// ==================== BACKEND CHAPTERS ====================

const backendGroups = [
  { name: "网络协议深度解析", icon: "🌐", count: 8 },
  { name: "操作系统原理", icon: "💻", count: 8 },
  { name: "Linux常用命令与运维", icon: "🐧", count: 8 },
  { name: "MySQL数据库原理与优化", icon: "🐬", count: 8 },
  { name: "Redis缓存深度", icon: "🟥", count: 8 },
  { name: "消息队列", icon: "📨", count: 8 },
  { name: "分布式系统理论", icon: "🌍", count: 8 },
  { name: "微服务架构", icon: "🏗️", count: 8 },
  { name: "容器化与编排", icon: "📦", count: 8 },
  { name: "API设计与安全认证", icon: "🔐", count: 8 },
  { name: "性能优化与监控", icon: "📊", count: 8 },
  { name: "后端面试题精选", icon: "🎯", count: 8 },
  { name: "高可用与云原生", icon: "☁️", count: 8 }
];

const backendTitles = [
  // 网络协议深度解析
  ["TCP/IP协议栈详解", "TCP三次握手与四次挥手", "UDP协议与TCP对比", "HTTP协议基础", "HTTP/1.1 vs HTTP/2 vs HTTP/3", "HTTPS与TLS加密", "WebSocket全双工通信", "gRPC与Protobuf"],
  // 操作系统原理
  ["进程与线程基础", "进程间通信IPC", "CPU调度算法", "内存管理机制", "虚拟内存与分页", "IO模型详解", "同步与互斥", "死锁原理与预防"],
  // Linux常用命令与运维
  ["Linux文件系统结构", "文件操作命令", "文本处理三剑客grep/sed/awk", "进程管理命令", "网络排查命令", "系统监控命令", "Shell脚本基础", "常用运维工具"],
  // MySQL数据库原理与优化
  ["MySQL架构与存储引擎", "InnoDB存储引擎", "索引原理与B+树", "索引优化实战", "事务ACID特性", "锁机制与MVCC", "SQL优化技巧", "分库分表基础"],
  // Redis缓存深度
  ["Redis数据结构详解", "Redis持久化RDB/AOF", "Redis主从复制", "Redis哨兵模式", "Redis Cluster集群", "缓存穿透/击穿/雪崩", "Redis分布式锁", "Redis应用场景"],
  // 消息队列
  ["消息队列基础概念", "Kafka架构原理", "Kafka生产者消费者", "RabbitMQ基础", "RabbitMQ交换机模式", "RocketMQ架构", "消息可靠性投递", "消息顺序与幂等"],
  // 分布式系统理论
  ["CAP定理与BASE理论", "一致性算法Paxos/Raft", "分布式事务2PC/3PC", "TCC与Saga模式", "分布式ID生成方案", "分布式限流算法", "服务熔断与降级", "负载均衡算法"],
  // 微服务架构
  ["微服务架构概述", "Spring Cloud生态", "服务注册与发现Eureka/Nacos", "配置中心", "API网关Spring Cloud Gateway", "服务间调用OpenFeign", "链路追踪Sleuth/Zipkin", "微服务最佳实践"],
  // 容器化与编排
  ["Docker基础概念", "Dockerfile最佳实践", "Docker Compose", "Kubernetes架构", "K8s核心资源Pod/Deployment", "K8s Service与Ingress", "K8s ConfigMap与Secret", "Helm包管理"],
  // API设计与安全认证
  ["RESTful API设计", "GraphQL入门", "JWT认证原理", "OAuth2.0协议详解", "SSO单点登录", "接口权限设计", "接口幂等性设计", "API安全防护"],
  // 性能优化与监控
  ["性能优化方法论", "数据库性能优化", "应用层性能优化", "JVM性能调优", "Tomcat优化", "Prometheus监控", "Grafana可视化", "ELK日志体系"],
  // 后端面试题精选
  ["Java基础面试题", "并发编程面试题", "JVM面试题", "MySQL面试题", "Redis面试题", "Spring面试题", "分布式面试题", "场景设计题"],
  // 高可用与云原生
  ["高可用架构设计", "监控告警与可观测性", "云原生基础", "蓝绿部署与金丝雀发布", "数据安全与备份恢复", "API设计最佳实践", "后端工程师职业发展", "后端面试指南"]
];

const backendIcons = ["📚","🤝","⚡","📄","🔄","🔒","🔌","⚡","🖥️","📨","⏰","🧠","📄","🔀","💀","🔗","📁","📝","🔍","📊","🌐","🔧","🐬","🏛️","🌳","🚀","🔒","🔁","💥","📉","🟥","💾","👥","🛡️","🌐","🛡️","🔒","🎯","📨","🏗️","📥","📤","🐰","🔀","✉️","✅","🔗","🌍","⚖️","🗳️","🤝","🔄","🆔","🚦","🛡️","⚖️","🏗️","🌱","🔍","⚙️","🚪","🤝","🔍","🛤️","📦","🐳","📝","🎼","☸️","🎛️","🌐","🔐","⚓","🔐","📝","◈","🎫","🔑","🔓","🛡️","🆔","🛡️","📊","🔬","🐬","⚡","🗑️","🚀","📈","📉","🪵","☕","🧵","🗑️","🐬","🟥","🌱","🌍","🏗️","🛡️","📊","☁️","🔄","🔒","📝","💼","🎯"];

function generateBackendChapter(groupIdx, chapterIdx, title, icon) {
  const groupName = backendGroups[groupIdx].name;
  const id = `backend-${groupIdx+1}-${chapterIdx+1}`;
  
  return `  {
    id: "${id}",
    group: "${groupName}",
    icon: "${icon}",
    title: "${title}",
    content: \`
# ${title}

## 一、概述

**${title}** 是后端开发工程师必须掌握的核心知识点，在高并发、分布式系统设计与实现中应用广泛。

### 为什么要学习 ${title}

- 理解底层原理，写出更高效、更健壮的代码
- 解决实际开发中遇到的复杂技术问题
- 面试高频考点，直接影响薪资定级
- 架构设计的基础能力，决定技术上限

### 本章学习路线

1. 基础概念：理解什么是 ${title}
2. 核心原理：深入内部实现机制
3. 实战应用：在项目中如何使用
4. 常见问题：踩过的坑与解决方案
5. 面试考点：高频问题与回答思路

---

## 二、核心知识

### 2.1 基础概念

\\`\\`\\`
${title} 知识体系图：

┌─────────────────────────────────────┐
│         ${title}                    │
│  ┌──────────┐  ┌──────────┐         │
│  │ 核心概念 │  │ 实现原理 │         │
│  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐         │
│  │ 应用场景 │  │ 最佳实践 │         │
│  └──────────┘  └──────────┘         │
└─────────────────────────────────────┘
\\`\\`\\`

| 概念 | 说明 |
|------|------|
| 定义 | ${title} 是什么，解决什么问题 |
| 核心特性 | 有哪些关键特性 |
| 适用场景 | 什么时候应该用 |
| 不适用场景 | 什么时候不应该用 |
| 常见实现 | 主流的实现方案 |

### 2.2 代码/配置示例

\\`\\`\\`java
// ${title} 核心示例代码
package com.example.backend;

/**
 * ${title} 演示
 */
public class ${title.replace(/[^a-zA-Z0-9]/g, '')}Demo {
    public static void main(String[] args) {
        System.out.println("学习后端知识点：${title}");
        
        // 这里展示核心概念的代码示例
        // 建议结合实际项目场景理解
        
        demonstrateCoreConcept();
    }
    
    private static void demonstrateCoreConcept() {
        // 核心概念演示代码
    }
}
\\`\\`\\`

### 2.3 关键要点对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案A | 实现简单、性能好 | 功能有限、扩展性差 | 简单场景、小规模 |
| 方案B | 功能完善、扩展性好 | 复杂度高、运维成本高 | 复杂场景、大规模 |
| 方案C | 平衡了复杂度和功能 | 需要权衡 | 大多数业务场景 |

---

## 三、深入原理

### 3.1 工作原理

要真正掌握 ${title}，不能只停留在会用的层面，需要理解其内部工作原理：

1. **请求处理流程**：一个请求/操作是如何被处理的
2. **数据流转**：数据在系统中是如何流动的
3. **状态管理**：状态如何维护，一致性如何保证
4. **异常处理**：出现异常时如何降级和恢复

### 3.2 常见坑点与避坑指南

**坑点1：只看功能实现，忽略异常场景**

很多问题都出在异常分支。网络超时、服务宕机、数据格式错误、并发冲突这些边界情况才是考验系统健壮性的关键。

**坑点2：过度设计，为了技术而技术**

不要上来就用最复杂的方案。简单的业务用简单的方案，架构是演进出来的，不是设计出来的。

**坑点3：没有监控，出了问题两眼一抹黑**

上线前必须做好监控告警，关键指标（QPS、延迟、错误率）要有大盘，异常情况要有告警。

### 3.3 性能考量

| 性能维度 | 关注点 | 优化手段 |
|---------|--------|---------|
| 响应时间 | p95/p99延迟 | 缓存、异步、批量 |
| 吞吐量 | QPS/TPS | 水平扩展、连接池、线程池优化 |
| 资源使用 | CPU、内存、IO | 算法优化、数据结构选择 |

---

## 四、实战经验

### 4.1 生产环境最佳实践

1. **做好容灾设计**：任何组件都可能挂，不要有单点
2. **限流熔断降级**：保护系统不被突发流量打垮
3. **灰度发布**：不要一次性全量发布，小流量验证
4. **回滚预案**：每次上线都要有回滚方案
5. **线上问题处理原则**：先止损，再排查根因

### 4.2 问题排查思路

遇到线上问题时，按这个思路排查：

1. 先看监控大盘：错误率、延迟有没有突增
2. 看错误日志：有没有异常栈
3. 复现问题：能复现的问题都好解决
4. 分析原因：最近有没有上线？配置有没有变更？
5. 解决问题：先回滚/降级止损，再修复bug

### 4.3 面试高频问题

**Q1：请简述一下 ${title} 的原理？**

回答框架：
1. 是什么（定义）
2. 为什么需要（解决什么问题）
3. 怎么实现的（核心原理/架构）
4. 优缺点（trade-off）
5. 你在项目中怎么用的（结合实际经验）

**Q2：如果让你来设计一个 ${title} 系统，你会怎么做？**

回答思路：
1. 先问清楚需求和约束（QPS、数据量、延迟要求）
2. 给出高层架构图
3. 讲核心组件设计和数据模型
4. 考虑高可用、高性能、可扩展
5. 对比不同方案的优劣

**Q3：使用 ${title} 时遇到过什么问题？怎么解决的？**

准备一个真实的案例，讲清楚：
- 背景：当时是什么情况
- 问题：遇到了什么现象
- 排查：怎么定位到原因的
- 解决：采取了什么措施
- 复盘：以后怎么避免类似问题

---

## 五、扩展学习

### 推荐资料

- 官方文档（最权威）
- 《数据密集型应用系统设计》（DDIA，后端神书）
- 优秀开源项目源码
- 大厂技术博客（美团、阿里、字节等）

### 动手实践

纸上得来终觉浅，绝知此事要躬行。学习后端技术一定要动手：

1. 搭一个 demo 环境跑一跑
2. 做压测看看性能表现
3. 模拟异常看看系统表现
4. 读优秀的开源实现

---

## 六、本章小结

${title} 是后端工程师知识体系中重要的一环。本章我们系统学习了：

1. **基础概念**：什么是 ${title}，解决什么问题
2. **核心原理**：内部是怎么工作的
3. **实战经验**：生产环境的最佳实践
4. **常见问题**：坑点与避坑指南
5. **面试考点**：高频问题的回答思路

技术学习是一个持续积累的过程，不要指望一蹴而就。多思考、多实践、多总结，你的技术能力一定会稳步提升。
\`
  },`;
}

// Generate backend batch files
let backendChapterIdx = 0;
for (let batch = 0; batch < 13; batch++) {
  let content = `// =============================================================
// 后端开发必备知识 - 第 ${batch+1} 批章节（${backendGroups[batch].name} 8 章）
// =============================================================

export const chapters = [
`;
  
  for (let ch = 0; ch < 8; ch++) {
    const title = backendTitles[batch][ch];
    const icon = backendIcons[backendChapterIdx] || "📝";
    content += generateBackendChapter(batch, ch, title, icon);
    if (ch < 7) content += ",";
    content += "\n";
    backendChapterIdx++;
  }
  
  content += `
];
`;
  
  const filePath = path.join(__dirname, 'app/backend-essential', `backend-essential-chapters-batch${batch+1}.js`);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Created ${path.basename(filePath)}`);
}

console.log("\n=== All files generated successfully! ===");
console.log(`Java Master: ${javaChapterIdx} chapters`);
console.log(`Backend Essential: ${backendChapterIdx} chapters`);
