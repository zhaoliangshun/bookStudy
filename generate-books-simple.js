const fs = require('fs');
const path = require('path');

// 转义函数：在最终输出的 JS 模板字符串中，反引号和 ${ 需要转义
function esc(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// ==================== JAVA 配置 ====================
const javaGroups = [
  "Java 基础语法入门", "流程控制与数组", "面向对象编程基础", "面向对象高级特性",
  "核心 API 与字符串处理", "集合框架深度解析", "泛型与枚举", "异常处理与注解",
  "Lambda 与函数式编程", "Stream API 深度解析", "IO/NIO 与反射", "并发编程基础",
  "JUC 并发包与原子类", "JVM 内存模型与垃圾回收", "Java 新特性与设计模式", "工程实践与构建工具"
];

const javaTitles = [
  ["Java 语言概述与发展历史", "数据类型、变量与常量", "运算符与表达式", "控制台输入输出", "IDE 使用与调试技巧", "Java 编码规范", "第一个完整程序", "基础语法综合练习"],
  ["分支结构：if-else 条件语句", "switch 多分支选择语句", "for 循环语句", "while 与 do-while 循环", "break、continue 与 return", "一维数组", "二维数组", "数组常见算法"],
  ["类与对象基础", "方法详解", "构造方法与对象初始化", "封装与访问控制", "包与导入", "static 关键字", "this 关键字", "OOP 基础综合案例"],
  ["继承与方法重写", "super 关键字", "多态与动态绑定", "抽象类", "接口", "内部类", "Object 类详解", "包装类与装箱拆箱"],
  ["String 类深度解析", "StringBuilder 与 StringBuffer", "Math 与 Random 类", "日期时间 API", "Java 8 新日期时间 API", "正则表达式", "常用工具类", "核心 API 实战"],
  ["集合框架概述", "List 与 ArrayList", "LinkedList", "Set 与 HashSet", "TreeSet", "Map 与 HashMap", "TreeMap", "Collections 工具类"],
  ["泛型基础", "泛型类与泛型方法", "通配符", "类型擦除", "枚举基础", "枚举高级用法", "注解基础", "自定义注解"],
  ["异常体系结构", "try-catch-finally", "throws 与 throw", "自定义异常", "try-with-resources", "常见异常与排查", "注解处理器", "异常最佳实践"],
  ["函数式编程思想", "Lambda 表达式", "函数式接口", "方法引用", "Predicate 与 Consumer", "Function 与 Supplier", "Comparator 函数式", "Lambda 实战"],
  ["Stream 概述", "筛选与切片", "映射与排序", "匹配与查找", "归约与收集", "并行流", "Collectors", "Stream 实战"],
  ["File 类与文件操作", "字节流", "字符流", "缓冲流", "序列化", "NIO 基础", "反射机制", "类加载器"],
  ["线程基础", "线程生命周期", "Thread 常用方法", "Runnable 与 Callable", "synchronized", "volatile", "wait/notify", "线程安全分析"],
  ["Lock 与 ReentrantLock", "ReadWriteLock", "Condition", "原子类", "CAS 与 ABA", "线程池", "ConcurrentHashMap", "CountDownLatch"],
  ["JVM 内存区域", "程序计数器与栈", "堆与方法区", "对象内存布局", "垃圾回收算法", "垃圾收集器", "JVM 参数调优", "OOM 排查"],
  ["Java 8 新特性", "Java 9-11 新特性", "Java 17 新特性", "Java 21 虚拟线程", "单例模式", "工厂模式", "策略模式", "设计模式总结"],
  ["Maven 基础", "Maven 插件", "Gradle 入门", "JUnit 5", "日志框架", "代码质量检查", "Git 版本控制", "项目实战"]
];

const javaIcons = ["☕","📦","➕","⌨️","🔧","📏","👋","🏋️","🔀","🔘","🔄","🔁","⏭️","📊","🗄️","🧮","🏛️","🚪","🛠️","🎁","📦","🔑","📦","🧪","🔮","👨‍👦","⬆️","🎭","📄","🔌","🕳️","🎁","📜","🔤","🔢","📅","🕐","🔍","🧰","💻","📚","📋","🔗","📭","🌳","🗺️","🧰","🔧","🧩","🔀","❓","🏷️","⚠️","🚨","🛡️","💥","🧹","🔖","🏭","λ","→","🎯","📌","✅","🔄","📊","💪","🌊","💧","🔍","🔀","🎯","🔗","⚡","📥","📂","📁","📖","📝","🔄","💾","💿","🔍","📦","🧵","🏃","🔄","🤝","👀","💬","💣","🔒","🔐","⚖️","⚛️","⚙️","🗺️","🚦","🗑️","🧠","📚","🏭","🏗️","♻️","⚙️","🔧","🐛","✨","🎉","🚀","🧵","👑","💡","🎭","🛠️","📦","🎬","✅","📝","✅","🔍","🌳","🎓"];

function genJavaChapter(batch, idx) {
  const title = javaTitles[batch][idx];
  const icon = javaIcons[batch * 8 + idx] || "📝";
  const group = javaGroups[batch];
  const clsName = title.replace(/[^a-zA-Z0-9]/g, '');
  
  const md = `# ${title}

## 一、概述

**${title}** 是 Java ${group} 的重要知识点。

### 学习目标

- 理解 ${title} 的基本概念和原理
- 掌握核心 API 使用方法
- 了解常见坑点和最佳实践
- 能够在项目中灵活运用

---

## 二、核心知识

### 2.1 基本概念

| 要点 | 说明 |
|------|------|
| 核心概念 | ${title} 的定义和本质 |
| 适用场景 | 什么时候使用 |
| 注意事项 | 使用时需要留意的问题 |

### 2.2 代码示例

\`\`\`java
package com.example;

public class ${clsName}Demo {
    public static void main(String[] args) {
        System.out.println("=== ${title} ===");
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

${title} 是 Java 开发必备知识，建议多动手实践加深理解。
`;

  return `  {
    id: "java-${batch+1}-${idx+1}",
    group: "${group}",
    icon: "${icon}",
    title: "${title}",
    content: \`${esc(md)}\`
  }`;
}

// ==================== 后端配置 ====================
const backendGroups = [
  "网络协议深度解析", "操作系统原理", "Linux常用命令与运维", "MySQL数据库原理与优化",
  "Redis缓存深度", "消息队列", "分布式系统理论", "微服务架构",
  "容器化与编排", "API设计与安全认证", "性能优化与监控", "后端面试题精选", "高可用与云原生"
];

const backendTitles = [
  ["TCP/IP协议栈", "TCP三次握手四次挥手", "UDP协议", "HTTP协议基础", "HTTP/2与HTTP/3", "HTTPS与TLS", "WebSocket", "gRPC"],
  ["进程与线程", "进程间通信IPC", "CPU调度", "内存管理", "虚拟内存", "IO模型", "同步互斥", "死锁"],
  ["Linux文件系统", "文件操作命令", "grep/sed/awk", "进程管理", "网络命令", "监控命令", "Shell脚本", "运维工具"],
  ["MySQL架构", "InnoDB引擎", "索引原理B+树", "索引优化", "事务ACID", "锁与MVCC", "SQL优化", "分库分表"],
  ["Redis数据结构", "RDB/AOF持久化", "主从复制", "哨兵模式", "Cluster集群", "缓存穿透击穿雪崩", "分布式锁", "Redis应用"],
  ["消息队列基础", "Kafka架构", "Kafka生产者消费者", "RabbitMQ", "RabbitMQ交换机", "RocketMQ", "消息可靠性", "消息幂等"],
  ["CAP与BASE", "Paxos/Raft", "分布式事务", "TCC与Saga", "分布式ID", "限流算法", "熔断降级", "负载均衡"],
  ["微服务概述", "Spring Cloud", "服务注册发现", "配置中心", "API网关", "OpenFeign", "链路追踪", "微服务实践"],
  ["Docker基础", "Dockerfile", "Docker Compose", "K8s架构", "Pod/Deployment", "Service/Ingress", "ConfigMap/Secret", "Helm"],
  ["RESTful设计", "GraphQL", "JWT认证", "OAuth2.0", "SSO单点登录", "权限设计", "幂等性设计", "API安全"],
  ["优化方法论", "DB优化", "应用优化", "JVM调优", "Tomcat优化", "Prometheus", "Grafana", "ELK日志"],
  ["Java基础面试题", "并发面试题", "JVM面试题", "MySQL面试题", "Redis面试题", "Spring面试题", "分布式面试题", "场景设计题"],
  ["高可用设计", "可观测性", "云原生", "蓝绿金丝雀发布", "数据安全", "API最佳实践", "职业发展", "面试指南"]
];

const backendIcons = ["📚","🤝","⚡","📄","🔄","🔒","🔌","⚡","🖥️","📨","⏰","🧠","📄","🔀","💀","🔗","📁","📝","🔍","📊","🌐","🔧","🐬","🏛️","🌳","🚀","🔒","🔁","💥","📉","🟥","💾","👥","🛡️","🌐","🛡️","🔒","🎯","📨","🏗️","📥","📤","🐰","🔀","✉️","✅","🔗","🌍","⚖️","🗳️","🤝","🔄","🆔","🚦","🛡️","⚖️","🏗️","🌱","🔍","⚙️","🚪","🤝","🔍","🛤️","📦","🐳","📝","🎼","☸️","🎛️","🌐","🔐","⚓","🔐","📝","◈","🎫","🔑","🔓","🛡️","🆔","🛡️","📊","🔬","🐬","⚡","🗑️","🚀","📈","📉","🪵","☕","🧵","🗑️","🐬","🟥","🌱","🌍","🏗️","🛡️","📊","☁️","🔄","🔒","📝","💼","🎯"];

function genBackendChapter(batch, idx) {
  const title = backendTitles[batch][idx];
  const icon = backendIcons[batch * 8 + idx] || "📝";
  const group = backendGroups[batch];
  
  const md = `# ${title}

## 一、概述

**${title}** 是后端开发核心知识点，在分布式系统设计中至关重要。

### 学习目标

- 理解核心概念和原理
- 掌握技术方案选型
- 了解生产最佳实践
- 熟悉面试高频考点

---

## 二、核心知识

| 概念 | 说明 |
|------|------|
| 定义 | ${title} 是什么 |
| 原理 | 内部如何工作 |
| 场景 | 适用场景 |
| 优缺点 | 技术 trade-off |

---

## 三、实战经验

1. 做好高可用，避免单点
2. 完善监控告警
3. 压测验证性能
4. 准备降级预案
5. 线上问题先止损再排查

---

## 四、面试考点

回答框架：是什么 → 为什么 → 怎么做 → 实践经验。

---

## 五、本章小结

${title} 是后端进阶必备知识，建议理论结合实践，多动手多思考。
`;

  return `  {
    id: "backend-${batch+1}-${idx+1}",
    group: "${group}",
    icon: "${icon}",
    title: "${title}",
    content: \`${esc(md)}\`
  }`;
}

// ==================== 生成文件 ====================

// Java
for (let batch = 0; batch < 16; batch++) {
  let content = `// =============================================================
// Java 开发详解 - 第 ${batch+1} 批（${javaGroups[batch]}）
// =============================================================

export const chapters = [
`;
  const chs = [];
  for (let i = 0; i < 8; i++) chs.push(genJavaChapter(batch, i));
  content += chs.join(',\n');
  content += '\n];\n';
  const fp = path.join(__dirname, 'app/java-master', `java-master-chapters-batch${batch+1}.js`);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`✓ java-master-chapters-batch${batch+1}.js`);
}

// Backend
for (let batch = 0; batch < 13; batch++) {
  let content = `// =============================================================
// 后端开发必备知识 - 第 ${batch+1} 批（${backendGroups[batch]}）
// =============================================================

export const chapters = [
`;
  const chs = [];
  for (let i = 0; i < 8; i++) chs.push(genBackendChapter(batch, i));
  content += chs.join(',\n');
  content += '\n];\n';
  const fp = path.join(__dirname, 'app/backend-essential', `backend-essential-chapters-batch${batch+1}.js`);
  fs.writeFileSync(fp, content, 'utf8');
  console.log(`✓ backend-essential-chapters-batch${batch+1}.js`);
}

console.log(`\n=== Done! ===`);
console.log(`Java: ${16*8} chapters`);
console.log(`Backend: ${13*8} chapters`);
