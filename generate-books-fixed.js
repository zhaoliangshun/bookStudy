const fs = require('fs');
const path = require('path');

// Helper: 在最终生成的 .js 文件的模板字符串中，反引号和 ${ 必须被转义
function t(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  // 转义：所有 ` 变成 \`，所有 ${ 变成 \${
  return result.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// ==================== JAVA CHAPTERS ====================

const javaGroups = [
  "Java 基础语法入门",
  "流程控制与数组", 
  "面向对象编程基础",
  "面向对象高级特性",
  "核心 API 与字符串处理",
  "集合框架深度解析",
  "泛型与枚举",
  "异常处理与注解",
  "Lambda 与函数式编程",
  "Stream API 深度解析",
  "IO/NIO 与反射",
  "并发编程基础",
  "JUC 并发包与原子类",
  "JVM 内存模型与垃圾回收",
  "Java 新特性与设计模式",
  "工程实践与构建工具"
];

const javaTitles = [
  ["Java 语言概述与发展历史", "数据类型、变量与常量", "运算符与表达式", "控制台输入输出", "IDE 使用与调试技巧", "Java 编码规范", "第一个完整程序", "基础语法综合练习"],
  ["分支结构：if-else 条件语句", "switch 多分支选择语句", "for 循环语句", "while 与 do-while 循环", "break、continue 与 return", "一维数组", "二维数组", "数组常见算法"],
  ["类与对象基础", "方法详解", "构造方法与对象初始化", "封装与访问控制", "包与导入", "static 关键字", "this 关键字", "OOP 基础综合案例"],
  ["继承与方法重写", "super 关键字", "多态与动态绑定", "抽象类", "接口", "内部类", "Object 类详解", "包装类与装箱拆箱"],
  ["String 类深度解析", "StringBuilder 与 StringBuffer", "Math 与 Random 类", "日期时间 API（Date/Calendar）", "Java 8 新日期时间 API", "正则表达式", "常用工具类", "核心 API 实战"],
  ["集合框架概述", "List 接口与 ArrayList", "LinkedList 与 Vector", "Set 接口与 HashSet", "TreeSet 与 LinkedHashSet", "Map 接口与 HashMap", "TreeMap 与 LinkedHashMap", "Collections 工具类"],
  ["泛型基础", "泛型类与泛型方法", "通配符与类型边界", "类型擦除", "枚举类型基础", "枚举高级用法", "注解基础", "自定义注解"],
  ["异常体系结构", "try-catch-finally", "throws 与 throw", "自定义异常", "try-with-resources", "常见异常与排查", "注解处理器", "异常最佳实践"],
  ["函数式编程思想", "Lambda 表达式基础", "函数式接口", "方法引用与构造器引用", "Predicate 与 Consumer", "Function 与 Supplier", "Comparator 函数式", "Lambda 实战案例"],
  ["Stream 概述与创建", "中间操作：筛选与切片", "中间操作：映射与排序", "终止操作：匹配与查找", "终止操作：归约与收集", "并行流", "Collectors 工具类", "Stream 实战"],
  ["File 类与文件操作", "字节流 InputStream/OutputStream", "字符流 Reader/Writer", "缓冲流与转换流", "序列化与反序列化", "NIO 基础", "反射机制", "类加载器"],
  ["线程基础与创建方式", "线程生命周期与状态转换", "Thread 类常用方法", "Runnable 与 Callable", "线程同步 synchronized", "volatile 关键字", "线程间通信 wait/notify", "线程安全问题分析"],
  ["Lock 接口与 ReentrantLock", "ReadWriteLock 读写锁", "Condition 条件变量", "原子类 AtomicInteger", "CAS 原理与 ABA 问题", "线程池 ThreadPoolExecutor", "并发容器 ConcurrentHashMap", "CountDownLatch 与 CyclicBarrier"],
  ["JVM 内存区域划分", "程序计数器与虚拟机栈", "堆与方法区", "对象创建与内存布局", "垃圾回收算法", "垃圾收集器对比", "JVM 参数调优", "内存泄漏与 OOM 排查"],
  ["Java 8 新特性汇总", "Java 9-11 新特性", "Java 17 新特性", "Java 21 虚拟线程", "单例模式", "工厂模式与抽象工厂", "观察者模式与策略模式", "设计模式总结"],
  ["Maven 基础与依赖管理", "Maven 生命周期与插件", "Gradle 入门", "单元测试 JUnit 5", "日志框架 SLF4J/Logback", "代码质量检查 SonarQube", "Git 版本控制", "项目实战：学生管理系统"]
];

const javaIcons = ["☕","📦","➕","⌨️","🔧","📏","👋","🏋️","🔀","🔘","🔄","🔁","⏭️","📊","🗄️","🧮","🏛️","🚪","🛠️","🎁","📦","🔑","📦","🧪","🔮","👨‍👦","⬆️","🎭","📄","🔌","🕳️","📦","🎁","📜","🔤","🔢","📅","🕐","🔍","🧰","💻","📚","📋","🔗","📭","🌳","🗺️","🌳","🧰","🔧","🧩","🔀","❓","🏷️","⚠️","🚨","🛡️","💥","🧹","🔖","🏭","λ","→","🎯","📌","✅","🔄","📊","💪","🌊","💧","🔍","🔀","🎯","🔗","⚡","📥","📂","📁","📖","📝","🔄","💾","💿","🔍","📦","🧵","🏃","🔄","🤝","👀","💬","💣","🔒","🔐","⚖️","⚛️","⚙️","🗺️","🚦","🗑️","🧠","📚","🏭","🏗️","♻️","🏭","⚙️","🔧","🐛","✨","🎉","🚀","🧵","👑","💡","🎭","🏭","🛠️","📦","🎬","✅","📝","✅","🔍","🌳","🎓"];

function generateJavaChapter(batch, idx) {
  const title = javaTitles[batch][idx];
  const icon = javaIcons[batch * 8 + idx] || "📝";
  const group = javaGroups[batch];
  
  const content = t`# ${title}

## 一、概述

**${title}** 是 Java 开发中的重要知识点，是掌握 ${group} 必须深入理解的内容。

### 学习目标

- 理解 ${title} 的基本概念和原理
- 掌握相关 API 的使用方法
- 了解常见坑点和最佳实践
- 通过代码示例加深理解
- 能够在实际项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

${title} 是 Java ${group} 部分的核心内容。

| 要点 | 说明 |
|------|------|
| 核心概念 | 理解 ${title} 的定义和本质 |
| 适用场景 | 什么时候需要使用 |
| 注意事项 | 使用时需要留意的问题 |
| 性能表现 | 时间/空间复杂度分析 |

### 2.2 代码示例

\`\`\`java
package com.example;

/**
 * ${title} 示例
 */
public class ${title.replace(/[^a-zA-Z0-9]/g, '')}Demo {
    public static void main(String[] args) {
        System.out.println("=== ${title} 演示 ===");
        
        // 示例代码
        demonstrate();
    }
    
    private static void demonstrate() {
        // 核心演示代码
        // 建议亲手敲一遍，加深理解
    }
}
\`\`\`

---

## 三、深入理解与最佳实践

### 3.1 常见问题

初学者在学习 ${title} 时容易犯以下错误：

1. 概念理解不清晰，导致用错场景
2. 忽略边界条件和异常处理
3. 没有考虑线程安全问题
4. 性能考虑不足

### 3.2 最佳实践

- 代码要清晰易懂，优先考虑可维护性
- 编写单元测试验证各种场景
- 适当添加日志，方便排查问题
- 遵循 Java 编码规范
- 多阅读 JDK 源码和优秀开源代码

---

## 四、本章小结

${title} 是 Java 开发者必须掌握的知识点。通过本章学习，建议读者动手实践，多写代码多思考，真正做到理解原理、灵活运用。
`;

  return `  {
    id: "java-${batch+1}-${idx+1}",
    group: "${group}",
    icon: "${icon}",
    title: "${title}",
    content: \`${content}\`
  }`;
}

// Generate Java files
for (let batch = 0; batch < 16; batch++) {
  let fileContent = `// =============================================================
// Java 开发详解 - 第 ${batch+1} 批章节（${javaGroups[batch]}）
// =============================================================

export const chapters = [
`;
  
  const chapters = [];
  for (let i = 0; i < 8; i++) {
    chapters.push(generateJavaChapter(batch, i));
  }
  fileContent += chapters.join(',\n');
  fileContent += `
];
`;
  
  const filePath = path.join(__dirname, 'app/java-master', `java-master-chapters-batch${batch+1}.js`);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`Created java-master-chapters-batch${batch+1}.js`);
}

// ==================== BACKEND CHAPTERS ====================

const backendGroups = [
  "网络协议深度解析",
  "操作系统原理",
  "Linux常用命令与运维",
  "MySQL数据库原理与优化",
  "Redis缓存深度",
  "消息队列",
  "分布式系统理论",
  "微服务架构",
  "容器化与编排",
  "API设计与安全认证",
  "性能优化与监控",
  "后端面试题精选",
  "高可用与云原生"
];

const backendTitles = [
  ["TCP/IP协议栈详解", "TCP三次握手与四次挥手", "UDP协议与TCP对比", "HTTP协议基础", "HTTP/1.1 vs HTTP/2 vs HTTP/3", "HTTPS与TLS加密", "WebSocket全双工通信", "gRPC与Protobuf"],
  ["进程与线程基础", "进程间通信IPC", "CPU调度算法", "内存管理机制", "虚拟内存与分页", "IO模型详解", "同步与互斥", "死锁原理与预防"],
  ["Linux文件系统结构", "文件操作命令", "文本处理三剑客grep/sed/awk", "进程管理命令", "网络排查命令", "系统监控命令", "Shell脚本基础", "常用运维工具"],
  ["MySQL架构与存储引擎", "InnoDB存储引擎", "索引原理与B+树", "索引优化实战", "事务ACID特性", "锁机制与MVCC", "SQL优化技巧", "分库分表基础"],
  ["Redis数据结构详解", "Redis持久化RDB/AOF", "Redis主从复制", "Redis哨兵模式", "Redis Cluster集群", "缓存穿透/击穿/雪崩", "Redis分布式锁", "Redis应用场景"],
  ["消息队列基础概念", "Kafka架构原理", "Kafka生产者消费者", "RabbitMQ基础", "RabbitMQ交换机模式", "RocketMQ架构", "消息可靠性投递", "消息顺序与幂等"],
  ["CAP定理与BASE理论", "一致性算法Paxos/Raft", "分布式事务2PC/3PC", "TCC与Saga模式", "分布式ID生成方案", "分布式限流算法", "服务熔断与降级", "负载均衡算法"],
  ["微服务架构概述", "Spring Cloud生态", "服务注册与发现Eureka/Nacos", "配置中心", "API网关Spring Cloud Gateway", "服务间调用OpenFeign", "链路追踪Sleuth/Zipkin", "微服务最佳实践"],
  ["Docker基础概念", "Dockerfile最佳实践", "Docker Compose", "Kubernetes架构", "K8s核心资源Pod/Deployment", "K8s Service与Ingress", "K8s ConfigMap与Secret", "Helm包管理"],
  ["RESTful API设计", "GraphQL入门", "JWT认证原理", "OAuth2.0协议详解", "SSO单点登录", "接口权限设计", "接口幂等性设计", "API安全防护"],
  ["性能优化方法论", "数据库性能优化", "应用层性能优化", "JVM性能调优", "Tomcat优化", "Prometheus监控", "Grafana可视化", "ELK日志体系"],
  ["Java基础面试题", "并发编程面试题", "JVM面试题", "MySQL面试题", "Redis面试题", "Spring面试题", "分布式面试题", "场景设计题"],
  ["高可用架构设计", "监控告警与可观测性", "云原生基础", "蓝绿部署与金丝雀发布", "数据安全与备份恢复", "API设计最佳实践", "后端工程师职业发展", "后端面试指南"]
];

const backendIcons = ["📚","🤝","⚡","📄","🔄","🔒","🔌","⚡","🖥️","📨","⏰","🧠","📄","🔀","💀","🔗","📁","📝","🔍","📊","🌐","🔧","🐬","🏛️","🌳","🚀","🔒","🔁","💥","📉","🟥","💾","👥","🛡️","🌐","🛡️","🔒","🎯","📨","🏗️","📥","📤","🐰","🔀","✉️","✅","🔗","🌍","⚖️","🗳️","🤝","🔄","🆔","🚦","🛡️","⚖️","🏗️","🌱","🔍","⚙️","🚪","🤝","🔍","🛤️","📦","🐳","📝","🎼","☸️","🎛️","🌐","🔐","⚓","🔐","📝","◈","🎫","🔑","🔓","🛡️","🆔","🛡️","📊","🔬","🐬","⚡","🗑️","🚀","📈","📉","🪵","☕","🧵","🗑️","🐬","🟥","🌱","🌍","🏗️","🛡️","📊","☁️","🔄","🔒","📝","💼","🎯"];

function generateBackendChapter(batch, idx) {
  const title = backendTitles[batch][idx];
  const icon = backendIcons[batch * 8 + idx] || "📝";
  const group = backendGroups[batch];
  
  const content = t`# ${title}

## 一、概述

**${title}** 是后端开发工程师必须掌握的核心知识点，在构建高并发、高可用的分布式系统中至关重要。

### 学习目标

- 理解 ${title} 的核心概念和原理
- 掌握技术方案的选型思路
- 了解生产环境中的最佳实践
- 熟悉常见问题和解决方案
- 掌握面试高频考点

---

## 二、核心知识

### 2.1 基本概念

${title} 是 ${group} 知识体系中的重要组成部分。

| 概念 | 说明 |
|------|------|
| 定义 | ${title} 是什么，解决什么问题 |
| 核心原理 | 内部是如何工作的 |
| 适用场景 | 什么时候应该使用 |
| 优缺点 | 技术方案的 trade-off |

### 2.2 技术对比

在选择技术方案时，要根据实际业务场景综合考虑：

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案 A | 简单、性能高 | 功能有限 | 小规模、简单场景 |
| 方案 B | 功能完善、扩展性好 | 复杂、成本高 | 大规模、复杂场景 |

---

## 三、实战经验

### 3.1 生产环境注意事项

1. **高可用保障**：避免单点故障，做好冗余和故障转移
2. **监控告警**：关键指标必须有监控，异常要及时告警
3. **压测验证**：上线前一定要做压力测试，了解系统瓶颈
4. **降级预案**：极端情况下要有降级开关，保证核心功能可用

### 3.2 问题排查思路

遇到问题时，遵循"先止损，后排查"的原则：

1. 查看监控大盘，了解故障范围和影响
2. 查看错误日志，定位异常信息
3. 检查最近是否有变更（上线、配置修改）
4. 必要时先回滚/降级，恢复服务
5. 事后复盘，避免重复踩坑

---

## 四、面试考点

**Q：请简述 ${title} 的原理以及你在项目中的应用？**

回答框架：
1. 是什么：用一句话概括 ${title}
2. 为什么：解决了什么问题，有什么优势
3. 怎么做：核心原理/架构是怎样的
4. 实践：在项目中怎么用的，遇到过什么问题，怎么解决的

---

## 五、本章小结

${title} 是后端工程师进阶路上必须掌握的内容。建议理论结合实践，多动手搭建 demo、做压测、读源码，真正做到知其然也知其所以然。
`;

  return `  {
    id: "backend-${batch+1}-${idx+1}",
    group: "${group}",
    icon: "${icon}",
    title: "${title}",
    content: \`${content}\`
  }`;
}

// Generate backend files
for (let batch = 0; batch < 13; batch++) {
  let fileContent = `// =============================================================
// 后端开发必备知识 - 第 ${batch+1} 批章节（${backendGroups[batch]}）
// =============================================================

export const chapters = [
`;
  
  const chapters = [];
  for (let i = 0; i < 8; i++) {
    chapters.push(generateBackendChapter(batch, i));
  }
  fileContent += chapters.join(',\n');
  fileContent += `
];
`;
  
  const filePath = path.join(__dirname, 'app/backend-essential', `backend-essential-chapters-batch${batch+1}.js`);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`Created backend-essential-chapters-batch${batch+1}.js`);
}

console.log('\n=== Generation complete! ===');
console.log(`Java: 16 batches × 8 chapters = ${16*8} chapters`);
console.log(`Backend: 13 batches × 8 chapters = ${13*8} chapters`);
