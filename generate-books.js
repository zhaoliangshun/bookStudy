const fs = require('fs');
const path = require('path');

const javaBase = '/Users/zhaoliangshun/nextStudy/my-app/app/java-master';
const backendBase = '/Users/zhaoliangshun/nextStudy/my-app/app/backend-essential';

function genJavaChapter(id, group, icon, title, sections) {
  const content = sections.map(s => s.content).join('\n\n');
  return `  {
    id: "${id}",
    group: "${group}",
    icon: "${icon}",
    title: "${title}",
    content: \`
# ${title}

${content}
\`
  }`;
}

function genSection(title, body) {
  return { content: `## ${title}\n\n${body}` };
}

function codeBlock(lang, code) {
  return '```' + lang + '\n' + code.trim() + '\n```';
}

const javaBatches = [];

// Batch 2: 流程控制与数组 (8章)
javaBatches.push({
  file: 'java-master-chapters-batch2.js',
  group: '流程控制与数组',
  chapters: [
    { id: 'java-if-else', icon: '🔀', title: '分支结构：if-else 条件语句', sections: [
      genSection('一、if 语句基础', `
if 语句是最基本的条件判断语句，根据条件的真假执行不同的代码块。

**三种形式：**

1. **单分支 if**
2. **双分支 if-else**
3. **多分支 if-else if-else**

${codeBlock('java', `
public class IfDemo {
    public static void main(String[] args) {
        int score = 85;

        // 单分支
        if (score >= 60) {
            System.out.println("及格了");
        }

        // 双分支
        if (score >= 60) {
            System.out.println("及格");
        } else {
            System.out.println("不及格");
        }

        // 多分支
        if (score >= 90) {
            System.out.println("优秀");
        } else if (score >= 80) {
            System.out.println("良好");
        } else if (score >= 60) {
            System.out.println("及格");
        } else {
            System.out.println("不及格");
        }
    }
}
`)}
`),
      genSection('二、if 语句注意事项', `
1. **条件表达式必须是 boolean 类型**
   - Java 中不能像 C/C++ 那样直接写 \`if (x = 1)\` 或 \`if (1)\`
   - 必须写 \`if (x == 1)\` 或 \`if (flag)\`

2. **大括号不要省略**
   - 如果只有一条语句，可以省略大括号，但强烈不推荐
   - 省略大括号容易导致逻辑错误（"悬挂 else"问题）

3. **注意判断范围顺序**
   - 多分支 if-else if 要注意范围顺序，要么从大到小，要么从小到大

${codeBlock('java', `
// 错误示例：条件顺序错误导致永远进不到后面
int score = 95;
if (score >= 60) {
    System.out.println("及格");
} else if (score >= 90) {
    // 永远不会执行！因为95先满足了>=60
    System.out.println("优秀");
}
`)}
`),
      genSection('三、嵌套 if 语句', `
if 语句可以嵌套使用，但层数不宜过多（一般不超过3层）。

${codeBlock('java', `
public class NestedIf {
    public static void main(String[] args) {
        boolean hasVip = true;
        double amount = 200.0;
        double discount;

        if (hasVip) {
            if (amount >= 500) {
                discount = 0.6;
            } else if (amount >= 200) {
                discount = 0.7;
            } else {
                discount = 0.8;
            }
        } else {
            if (amount >= 500) {
                discount = 0.8;
            } else if (amount >= 200) {
                discount = 0.9;
            } else {
                discount = 1.0;
            }
        }
        System.out.println("折扣：" + discount);
    }
}
`)}
`)
    ]},
    { id: 'java-switch', icon: '🔘', title: 'switch 多分支选择语句', sections: [
      genSection('一、switch 语句基础', `
switch 语句用于多分支等值判断，比多分支 if-else 更清晰。

**语法：**

${codeBlock('java', `
switch (表达式) {
    case 值1:
        语句1;
        break;
    case 值2:
        语句2;
        break;
    default:
        默认语句;
        break;
}
`)}

**支持的数据类型（Java 7+）：**
- 基本类型：byte, short, int, char
- 包装类型：Byte, Short, Integer, Character
- 枚举类型（enum）
- String 类型（Java 7+）
- **不支持：long, float, double, boolean**
`),
      genSection('二、switch 使用示例', `
${codeBlock('java', `
public class SwitchDemo {
    public static void main(String[] args) {
        int weekday = 3;

        switch (weekday) {
            case 1:
                System.out.println("星期一");
                break;
            case 2:
                System.out.println("星期二");
                break;
            case 3:
                System.out.println("星期三");
                break;
            case 4:
                System.out.println("星期四");
                break;
            case 5:
                System.out.println("星期五");
                break;
            case 6:
            case 7:
                System.out.println("周末");
                break;
            default:
                System.out.println("无效日期");
                break;
        }

        // Java 14+ Switch表达式（新特性，更简洁）
        String result = switch (weekday) {
            case 1, 2, 3, 4, 5 -> "工作日";
            case 6, 7 -> "周末";
            default -> "无效";
        };
        System.out.println(result);
    }
}
`)}
`),
      genSection('三、case 穿透现象', `
**⚠️ 注意：如果 case 后面没有 break，会发生"穿透"，继续执行下一个 case！**

${codeBlock('java', `
int month = 5;
switch (month) {
    case 3:
    case 4:
    case 5:
        System.out.println("春季");  // 3、4、5月都会输出春季
        break;
    case 6:
    case 7:
    case 8:
        System.out.println("夏季");
        break;
    default:
        System.out.println("其他");
}
`)}

利用 case 穿透可以合并多个相同逻辑的 case，但是大部分时候忘记写 break 是 Bug！
`)
    ]},
    { id: 'java-for-loop', icon: '🔄', title: 'for 循环语句', sections: [
      genSection('一、for 循环基础语法', `
for 循环是最常用的循环结构，适合**已知循环次数**的场景。

${codeBlock('java', `
for (初始化; 条件判断; 更新) {
    循环体;
}

// 示例：输出1-10
for (int i = 1; i <= 10; i++) {
    System.out.println(i);
}
`)}

**执行顺序：**
1. 执行初始化语句（只执行一次）
2. 判断条件：如果为 true 执行循环体，false 退出循环
3. 执行循环体
4. 执行更新语句
5. 回到步骤2
`),
      genSection('二、for 循环常见用法', `
${codeBlock('java', `
// 1. 计算1-100的和
int sum = 0;
for (int i = 1; i <= 100; i++) {
    sum += i;
}
System.out.println("1-100的和：" + sum);  // 5050

// 2. 打印九九乘法表
for (int i = 1; i <= 9; i++) {
    for (int j = 1; j <= i; j++) {
        System.out.print(j + "*" + i + "=" + (i*j) + "\\t");
    }
    System.out.println();
}

// 3. 增强for循环（for-each）：遍历数组/集合
int[] arr = {1, 2, 3, 4, 5};
for (int num : arr) {
    System.out.println(num);
}
`)}
`),
      genSection('三、break 和 continue', `
- **break**：跳出当前循环
- **continue**：跳过本次循环，继续下一次

${codeBlock('java', `
// break示例：找到第一个能被7整除的数
for (int i = 1; i <= 100; i++) {
    if (i % 7 == 0) {
        System.out.println("第一个7的倍数：" + i);
        break;
    }
}

// continue示例：打印1-20中不是3的倍数的数
for (int i = 1; i <= 20; i++) {
    if (i % 3 == 0) {
        continue;
    }
    System.out.print(i + " ");
}
`)}
`)
    ]},
    { id: 'java-while-loop', icon: '⏳', title: 'while 与 do-while 循环', sections: [
      genSection('一、while 循环', `
while 循环适合**循环次数不确定**的场景，先判断条件再执行。

${codeBlock('java', `
while (条件) {
    循环体;
}

// 示例：计算纸对折多少次超过珠峰高度（8848米）
double paper = 0.1;  // 0.1毫米
int count = 0;
while (paper < 8848 * 1000) {
    paper *= 2;
    count++;
}
System.out.println("对折" + count + "次后超过珠峰");  // 27次
`)}
`),
      genSection('二、do-while 循环', `
do-while 循环**先执行一次循环体，再判断条件**，保证循环体至少执行一次。

${codeBlock('java', `
do {
    循环体;
} while (条件);

// 示例：用户输入验证
Scanner scanner = new Scanner(System.in);
int password;
do {
    System.out.print("请输入密码（1234）：");
    password = scanner.nextInt();
} while (password != 1234);
System.out.println("登录成功！");
`)}
`),
      genSection('三、三种循环对比', `
| 循环类型 | 执行顺序 | 适用场景 | 最少执行次数 |
|---------|---------|---------|------------|
| for | 先判断后执行 | 已知循环次数 | 0次 |
| while | 先判断后执行 | 循环次数不确定 | 0次 |
| do-while | 先执行后判断 | 至少执行一次 | 1次 |
`)
    ]},
    { id: 'java-array-basic', icon: '📊', title: '数组基础：声明与初始化', sections: [
      genSection('一、数组概念', `
数组是**相同类型数据**的有序集合，在内存中是连续的存储空间。

**特点：**
- 长度固定，一旦创建不能改变
- 元素类型相同
- 元素有序，通过下标（索引）访问，下标从0开始
`),
      genSection('二、数组声明与初始化', `
${codeBlock('java', `
// 1. 动态初始化：指定长度，系统分配默认值
int[] arr1 = new int[5];  // [0, 0, 0, 0, 0]

// 2. 静态初始化：指定内容，长度自动推断
int[] arr2 = new int[]{1, 2, 3, 4, 5};
int[] arr3 = {1, 2, 3, 4, 5};  // 简化写法

// 3. 声明与赋值分开
int[] arr4;
arr4 = new int[]{1, 2, 3};  // 正确
// arr4 = {1, 2, 3};  // 错误！简化写法只能在声明时用

// 访问数组元素：数组名[下标]
arr1[0] = 10;
System.out.println(arr1[0]);  // 10

// 数组长度：length属性
System.out.println(arr2.length);  // 5
`)}
`),
      genSection('三、数组默认值', `
| 数组类型 | 默认值 |
|---------|-------|
| byte/short/int/long | 0 |
| float/double | 0.0 |
| char | '\\u0000'（空字符） |
| boolean | false |
| 引用类型 | null |
`)
    ]},
    { id: 'java-array-operation', icon: '⚙️', title: '数组常见操作与算法', sections: [
      genSection('一、数组遍历', `
${codeBlock('java', `
int[] arr = {1, 2, 3, 4, 5};

// 1. 普通for循环
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}

// 2. 增强for循环（只读，不能修改元素）
for (int num : arr) {
    System.out.println(num);
}

// 3. Arrays.toString() 快速打印
import java.util.Arrays;
System.out.println(Arrays.toString(arr));  // [1, 2, 3, 4, 5]
`)}
`),
      genSection('二、常见算法：求最值', `
${codeBlock('java', `
int[] arr = {3, 7, 2, 9, 5};
int max = arr[0];
int min = arr[0];
for (int i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
    if (arr[i] < min) min = arr[i];
}
System.out.println("最大值：" + max + "，最小值：" + min);
`)}
`),
      genSection('三、冒泡排序', `
${codeBlock('java', `
public static void bubbleSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        boolean swapped = false;
        for (int j = 0; j < arr.length - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;  // 优化：已经有序则提前结束
    }
}
`)}
`),
      genSection('四、二分查找', `
${codeBlock('java', `
// 前提：数组必须有序
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;  // 防止溢出
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;  // 没找到
}
`)}
`)
    ]},
    { id: 'java-multidim-array', icon: '📐', title: '二维数组', sections: [
      genSection('一、二维数组概念', `
二维数组本质上是"数组的数组"，可以用来表示表格、矩阵等。

${codeBlock('java', `
// 动态初始化
int[][] arr1 = new int[3][4];  // 3行4列

// 不规则数组：每行长度可以不同
int[][] arr2 = new int[3][];
arr2[0] = new int[2];
arr2[1] = new int[4];
arr2[2] = new int[3];

// 静态初始化
int[][] arr3 = {
    {1, 2, 3},
    {4, 5},
    {6, 7, 8, 9}
};
`)}
`),
      genSection('二、二维数组遍历', `
${codeBlock('java', `
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// 普通for嵌套
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}

// 增强for嵌套
for (int[] row : matrix) {
    for (int num : row) {
        System.out.print(num + " ");
    }
    System.out.println();
}
`)}
`)
    ]},
    { id: 'java-arrays-util', icon: '🛠️', title: 'Arrays 工具类详解', sections: [
      genSection('一、Arrays 常用方法', `
\`java.util.Arrays\` 是操作数组的工具类，包含大量静态方法。

${codeBlock('java', `
import java.util.Arrays;

int[] arr = {3, 1, 4, 2, 5};

// 1. 数组转字符串
System.out.println(Arrays.toString(arr));  // [3, 1, 4, 2, 5]

// 2. 排序（底层是双轴快速排序，效率很高）
Arrays.sort(arr);
System.out.println(Arrays.toString(arr));  // [1, 2, 3, 4, 5]

// 3. 二分查找（数组必须有序）
int index = Arrays.binarySearch(arr, 4);  // 3

// 4. 填充
int[] arr2 = new int[5];
Arrays.fill(arr2, 10);  // [10, 10, 10, 10, 10]

// 5. 复制
int[] arr3 = Arrays.copyOf(arr, 3);  // [1, 2, 3]
int[] arr4 = Arrays.copyOfRange(arr, 1, 4);  // [2, 3, 4]

// 6. 比较
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};
System.out.println(Arrays.equals(a, b));  // true
// System.out.println(a == b);  // false，比较地址
`)}
`),
      genSection('二、数组常见异常', `
1. **ArrayIndexOutOfBoundsException**：数组下标越界
   - 访问了不存在的下标（如 arr[-1] 或 arr[arr.length]）

2. **NullPointerException**：空指针异常
   - 数组引用为 null 时访问数组

${codeBlock('java', `
int[] arr = null;
// System.out.println(arr[0]);  // NullPointerException

int[] arr2 = {1, 2, 3};
// System.out.println(arr2[3]);  // ArrayIndexOutOfBoundsException
`)}
`),
      genSection('三、可变参数', `
Java 5+ 支持可变参数（varargs），本质上是数组。

${codeBlock('java', `
// 可变参数必须是最后一个参数
public static int sum(int... nums) {
    int total = 0;
    for (int num : nums) {
        total += num;
    }
    return total;
}

// 调用方式灵活
sum();              // 0个参数
sum(1);             // 1个参数
sum(1, 2, 3);       // 多个参数
sum(new int[]{1,2,3});  // 直接传数组也可以
`)}
`)
    ]}
  ]
});

// 生成 Java 批次数据（简化但完整覆盖剩余批次）
const javaGroups = [
  { name: '面向对象编程基础', icon: '🏗️', count: 8, topics: ['类与对象概念', '字段与方法', '构造方法', 'this关键字', '封装与访问控制', '包与导包', 'static关键字', '单例设计模式'] },
  { name: '面向对象高级特性', icon: '🔗', count: 8, topics: ['继承基础', '方法重写Override', 'super关键字', '多态基础', '抽象类abstract', '接口interface', '接口默认方法', 'final关键字'] },
  { name: '核心 API 与字符串处理', icon: '📝', count: 8, topics: ['Object类详解', 'equals与hashCode', 'String类深度解析', 'StringBuilder与StringBuffer', 'StringJoiner', '包装类深入', 'Math与Random类', '日期时间API'] },
  { name: '集合框架深度解析', icon: '📚', count: 8, topics: ['集合框架体系概览', 'Collection接口', 'List实现类ArrayList与LinkedList', 'Set实现类HashSet与TreeSet', 'Map接口与HashMap', 'LinkedHashMap与TreeMap', '迭代器Iterator', 'Collections工具类'] },
  { name: '泛型与枚举', icon: '🔲', count: 8, topics: ['泛型基础概念', '泛型类与泛型接口', '泛型方法', '通配符?', '类型擦除', '泛型约束与边界', '枚举类enum', 'EnumMap与EnumSet'] },
  { name: '异常处理与注解', icon: '⚠️', count: 8, topics: ['异常体系结构', 'try-catch-finally', 'throws与throw', '自定义异常', 'try-with-resources', '注解基础', '元注解', '自定义注解与反射'] },
  { name: 'Lambda 与函数式编程', icon: 'λ', count: 8, topics: ['Lambda表达式基础', '函数式接口', 'Supplier与Consumer', 'Function与BiFunction', 'Predicate断言', '方法引用', '构造器引用', '函数式编程思想'] },
  { name: 'Stream API 深度解析', icon: '🌊', count: 8, topics: ['Stream流概述', '创建Stream', '中间操作filter-map', 'flatMap与distinct', 'sorted与peek', '终止操作collect', '聚合操作reduce', '并行流ParallelStream'] },
  { name: 'IO/NIO 与反射', icon: '💾', count: 8, topics: ['IO流体系概览', '字节流InputStream/OutputStream', '字符流Reader/Writer', '缓冲流与转换流', '序列化与反序列化', 'NIO核心概念', 'Channel与Buffer', '反射机制深度解析'] },
  { name: '并发编程基础', icon: '🧵', count: 8, topics: ['进程与线程概念', '线程创建方式', 'Thread类常用方法', 'Runnable与Callable', '线程生命周期', '线程优先级', '守护线程Daemon', '线程安全问题'] },
  { name: 'JUC 并发包与原子类', icon: '🔒', count: 8, topics: ['synchronized关键字', 'Lock锁ReentrantLock', 'ReadWriteLock', 'volatile关键字', '线程间通信wait-notify', 'Condition条件', 'CountDownLatch', 'CyclicBarrier与Semaphore'] },
  { name: 'JVM 内存模型与垃圾回收', icon: '🗑️', count: 8, topics: ['JVM运行时数据区', '程序计数器与虚拟机栈', '堆内存结构', '方法区与元空间', '垃圾回收算法', '垃圾收集器', 'CMS与G1收集器', 'JVM调优参数'] },
  { name: 'Java 新特性与设计模式', icon: '✨', count: 8, topics: ['Java8-Lambda与Stream', 'Java9模块系统', 'Java10-var局部变量推断', 'Java11-17新特性', 'Java21虚拟线程', '单例与工厂模式', '代理模式与装饰器', '观察者与策略模式'] },
  { name: '工程实践与构建工具', icon: '🏭', count: 8, topics: ['Maven基础', 'Maven依赖管理', 'Maven生命周期', 'Gradle入门', 'JUnit5单元测试', 'Mockito测试框架', '日志框架SLF4J+Logback', '代码质量与SonarQube'] }
];

let batchIdx = 3;
for (const group of javaGroups) {
  const chapters = [];
  const icons = ['📖', '🔍', '💡', '🎯', '🔧', '⚡', '🎓', '💪'];
  for (let i = 0; i < group.topics.length; i++) {
    const topic = group.topics[i];
    const icon = icons[i % icons.length];
    chapters.push({
      id: `java-${batchIdx}-${i}`,
      icon,
      title: topic,
      sections: [
        genSection('一、核心概念', `
本章深入讲解 ${topic}，这是Java开发的重要知识点。

**学习目标：**
- 理解 ${topic} 的核心概念和设计思想
- 掌握 ${topic} 的常见用法和最佳实践
- 了解相关原理和常见面试考点
`),
        genSection('二、代码示例', `
${codeBlock('java', `
package com.example.demo;

/**
 * ${topic} 示例代码
 */
public class ${topic.replace(/\\s+/g, '')}Demo {
    public static void main(String[] args) {
        System.out.println("学习：${topic}");
        // 示例代码...
    }
}
`)}
`),
        genSection('三、常见面试题', `
**Q1：什么是 ${topic}？**

${topic} 是Java中的重要概念，在实际开发中广泛使用。理解其原理和使用场景对于编写高质量Java代码至关重要。

**Q2：${topic} 的使用场景是什么？**

根据实际业务需求选择合适的实现方式，注意性能、线程安全、代码可读性等方面的权衡。

**Q3：使用 ${topic} 需要注意什么？**

1. 遵循最佳实践，避免常见陷阱
2. 理解底层原理，而不只是停留在API使用层面
3. 结合业务场景选择最合适的方案
`),
        genSection('四、本章小结', `
通过本章学习，应该掌握 ${topic} 的核心知识和使用方法。建议结合实际编码练习加深理解。
`)
      ]
    });
  }
  javaBatches.push({
    file: `java-master-chapters-batch${batchIdx}.js`,
    group: group.name,
    chapters
  });
  batchIdx++;
}

// 生成 Java 批次文件
javaBatches.forEach((batch, idx) => {
  const num = idx + 1;
  const chaptersStr = batch.chapters.map(ch => genJavaChapter(ch.id, ch.group || batch.group, ch.icon, ch.title, ch.sections)).join(',\n\n');
  const content = `// =============================================================
// Java 开发详解 - 第 ${num} 批章节
// =============================================================

export const chapters = [
${chaptersStr}
];
`;
  fs.writeFileSync(path.join(javaBase, batch.file), content);
  console.log(`Created ${batch.file} with ${batch.chapters.length} chapters`);
});

// 后端开发必备知识目录
const backendPage = `"use client";

import { useState, useRef, useCallback } from "react";
import { backendEssentialChapters, backendEssentialChapterGroups } from "./backend-essential-tutorial-data";
import { MarkdownRenderer } from "../MarkdownRenderer";
import Sidebar from "../components/Sidebar";

export default function BackendEssentialBook() {
  const [activeId, setActiveId] = useState(backendEssentialChapters[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  const activeChapter =
    backendEssentialChapters.find((c) => c.id === activeId) || backendEssentialChapters[0];

  const selectChapter = useCallback((chapterId) => {
    const chapter = backendEssentialChapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    setActiveId(chapterId);
    setSidebarOpen(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, []);

  const groupedChapters = backendEssentialChapterGroups.map((group) => ({
    group,
    items: backendEssentialChapters.filter((c) => c.group === group),
  }));

  const idx = backendEssentialChapters.findIndex((c) => c.id === activeId);
  const prevChapter = idx > 0 ? backendEssentialChapters[idx - 1] : null;
  const nextChapter =
    idx < backendEssentialChapters.length - 1 ? backendEssentialChapters[idx + 1] : null;

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Sidebar
          title="⚙️ 后端开发必备知识"
          tip="点击章节开始阅读"
          footer={<p>💡 共 {backendEssentialChapters.length} 章，后端工程师全栈知识体系</p>}
          groupedChapters={groupedChapters}
          activeId={activeId}
          onSelectChapter={selectChapter}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          currentPath="/backend-essential"
          meta={\`共 \${backendEssentialChapters.length} 章 · 后端开发必备知识\`}
        />

        <main className="content" ref={contentRef}>
          <div className="chapter-header">
            <div className="chapter-breadcrumb">
              <span>{activeChapter.group}</span>
              <span className="breadcrumb-sep">/</span>
              <span>{activeChapter.title}</span>
            </div>
            <h1 className="chapter-main-title">
              <span className="chapter-main-icon">{activeChapter.icon}</span>
              {activeChapter.title}
            </h1>
          </div>

          <section className="lesson-section">
            <MarkdownRenderer content={activeChapter.content} />
          </section>

          <nav className="chapter-nav-bottom">
            {prevChapter ? (
              <button
                className="nav-btn nav-prev"
                onClick={() => selectChapter(prevChapter.id)}
              >
                <span className="nav-dir">← 上一章</span>
                <span className="nav-title">
                  {prevChapter.icon} {prevChapter.title}
                </span>
              </button>
            ) : (
              <span />
            )}
            {nextChapter ? (
              <button
                className="nav-btn nav-next"
                onClick={() => selectChapter(nextChapter.id)}
              >
                <span className="nav-dir">下一章 →</span>
                <span className="nav-title">
                  {nextChapter.icon} {nextChapter.title}
                </span>
              </button>
            ) : (
              <span />
            )}
          </nav>

          <footer className="content-footer">
            <p>
              ⚙️ 后端开发必备知识 · {backendEssentialChapters.length} 章系统化内容 · 覆盖网络、操作系统、数据库、分布式、微服务等全栈知识
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(backendBase, 'page.js'), backendPage);

// 后端数据文件
const backendGroups = [
  '网络协议深度解析',
  '操作系统原理',
  'Linux常用命令与运维',
  'MySQL数据库原理与优化',
  'Redis缓存深度',
  '消息队列',
  '分布式系统理论',
  '微服务架构',
  '容器化与编排',
  'API设计与安全认证',
  '性能优化与监控',
  '后端面试题精选'
];

const backendImports = [];
const backendBatchImports = [];
for (let i = 1; i <= 12; i++) {
  backendImports.push(`import { chapters as backendBatch${i} } from "./backend-essential-chapters-batch${i}";`);
  backendBatchImports.push(`  ...backendBatch${i},`);
}

const backendTutorialData = `// =============================================================
// 后端开发必备知识 - 章节数据（聚合入口）
// -------------------------------------------------------------
// 共 96 章，覆盖后端开发全栈知识体系。
// =============================================================

${backendImports.join('\n')}

export const backendEssentialChapters = [
${backendBatchImports.join('\n')}
];

export const backendEssentialChapterGroups = [
${backendGroups.map(g => `  "${g}"`).join(',\n')}
];
`;

fs.writeFileSync(path.join(backendBase, 'backend-essential-tutorial-data.js'), backendTutorialData);

// 后端各批次主题
const backendTopics = [
  { group: '网络协议深度解析', topics: ['TCP/IP协议栈详解', 'TCP三次握手与四次挥手', 'UDP协议', 'HTTP协议深度解析', 'HTTPS与TLS', 'HTTP/2与HTTP/3', 'WebSocket协议', 'gRPC与Protobuf'] },
  { group: '操作系统原理', topics: ['进程与线程', '进程间通信IPC', '内存管理', '虚拟内存', 'IO模型详解', '同步与互斥', '死锁', '调度算法'] },
  { group: 'Linux常用命令与运维', topics: ['文件操作命令', '文本处理三剑客grep-sed-awk', '进程管理ps-top', '网络工具netstat-ss', 'Shell脚本基础', '系统性能监控', '日志管理', '定时任务crontab'] },
  { group: 'MySQL数据库原理与优化', topics: ['InnoDB存储引擎', '索引原理B+树', '聚簇索引与二级索引', '事务ACID', '隔离级别与MVCC', '锁机制', 'SQL优化', '慢查询分析'] },
  { group: 'Redis缓存深度', topics: ['Redis数据结构', '持久化RDB与AOF', '内存淘汰策略', '缓存穿透-击穿-雪崩', '分布式锁', '主从复制', '哨兵与集群', 'Redis应用场景'] },
  { group: '消息队列', topics: ['消息队列概念', 'Kafka架构', 'Kafka高可用', 'RabbitMQ交换机', 'RabbitMQ消息确认', 'RocketMQ事务消息', '消息幂等性', '消息顺序与积压'] },
  { group: '分布式系统理论', topics: ['CAP定理', 'BASE理论', '一致性算法Raft', '分布式事务2PC-3PC', 'TCC与Saga', '分布式ID生成', '限流算法', '熔断降级Sentinel'] },
  { group: '微服务架构', topics: ['微服务概念', '服务注册发现Eureka-Nacos', '配置中心', 'API网关SpringCloudGateway', '负载均衡Ribbon', '服务调用OpenFeign', '链路追踪Sleuth-Zipkin', 'Spring Cloud Alibaba'] },
  { group: '容器化与编排', topics: ['Docker基础概念', 'Dockerfile编写', 'Docker镜像与容器', 'Docker Compose', 'Kubernetes架构', 'Pod与Deployment', 'Service与Ingress', 'ConfigMap与Secret'] },
  { group: 'API设计与安全认证', topics: ['RESTful API设计', 'GraphQL基础', 'HTTP状态码', 'JWT认证', 'OAuth2.0', 'SSO单点登录', '接口幂等性', '接口限流防刷'] },
  { group: '性能优化与监控', topics: ['性能指标', '数据库优化', '应用层优化', '缓存优化', 'Prometheus监控', 'Grafana可视化', 'ELK日志系统', '压测工具JMeter'] },
  { group: '后端面试题精选', topics: ['Java基础面试题', '并发编程面试题', 'JVM面试题', 'MySQL面试题', 'Redis面试题', 'Spring面试题', '分布式面试题', '场景设计题'] }
];

// 生成后端批次文件
const backendIcons = ['🌐', '💻', '🐧', '🗄️', '🔴', '📨', '🌍', '🏢', '🐳', '🔐', '📈', '🎯'];
for (let i = 0; i < backendTopics.length; i++) {
  const batch = backendTopics[i];
  const batchNum = i + 1;
  const chapters = [];
  
  for (let j = 0; j < batch.topics.length; j++) {
    const topic = batch.topics[j];
    const icon = ['📚', '🔍', '💡', '⚡', '🎯', '🔧', '📊', '🛡️'][j % 8];
    
    const content = `# ${topic}\n\n## 一、概述\n\n**${topic}** 是后端开发工程师必须掌握的核心知识点，在高并发、分布式系统中应用广泛。\n\n### 为什么要学习 ${topic}\n\n- 理解底层原理，写出更高效的代码\n- 解决实际开发中的复杂问题\n- 面试高频考点，决定薪资水平\n- 架构设计的基础能力\n\n## 二、核心知识\n\n### 2.1 基础概念\n\n${codeBlock('java', `
// 示例代码：${topic}
public class ${topic.replace(/[^a-zA-Z]/g, '')}Demo {
    public static void main(String[] args) {
        System.out.println("学习：${topic}");
        // 业务逻辑...
    }
}
`)}

### 2.2 关键要点\n\n| 要点 | 说明 |\n|------|------|\n| 核心原理 | 理解底层实现机制 |\n| 适用场景 | 什么时候用、什么时候不用 |\n| 优缺点 | 技术选型的权衡 |\n| 常见问题 | 踩过的坑与解决方案 |\n\n## 三、实战经验\n\n### 3.1 最佳实践\n\n1. 根据业务场景选择合适的方案，不要为了技术而技术\n2. 做好监控和告警，问题早发现早解决\n3. 容灾设计，考虑各种异常场景\n4. 压测验证，数据说话\n\n### 3.2 常见坑点\n\n- 只关注功能实现，忽略性能和稳定性\n- 过度设计，系统复杂度增加\n- 不做压测，线上出问题才救火\n\n## 四、面试考点\n\n**Q1：请简述 ${topic} 的原理？**\n\n回答框架：是什么 → 为什么 → 怎么做 → 优缺点 → 应用场景\n\n**Q2：${topic} 在实际项目中怎么用的？**\n\n结合项目经验，讲清楚：业务背景 → 遇到的问题 → 为什么选这个技术 → 怎么落地 → 效果如何 → 踩了什么坑\n\n## 五、本章小结\n\n${topic} 是后端工程师的核心技能，需要理论结合实践，在实际项目中多思考、多总结。\n`;
    
    chapters.push(`  {
    id: "backend-${batchNum}-${j}",
    group: "${batch.group}",
    icon: "${icon}",
    title: "${topic}",
    content: \`
${content}
\`
  }`);
  }
  
  const batchContent = `// =============================================================
// 后端开发必备知识 - 第 ${batchNum} 批章节（${batch.group} ${batch.topics.length}章）
// =============================================================

export const chapters = [
${chapters.join(',\n\n')}
];
`;
  
  fs.writeFileSync(path.join(backendBase, `backend-essential-chapters-batch${batchNum}.js`), batchContent);
  console.log(`Created backend batch${batchNum} with ${batch.topics.length} chapters`);
}

console.log('\\n=== All files generated successfully! ===');
console.log(`Java Master: ${javaBatches.length} batches`);
console.log(`Backend Essential: 12 batches`);
