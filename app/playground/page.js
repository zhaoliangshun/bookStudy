// =============================================================
// 在线代码 Playground 页面
// -------------------------------------------------------------
// 这是一个独立的「代码试验场」页面，与各教程页面解耦：
//   - 左侧：代码编辑器（带行号 + 语法高亮，复用各语言的 highlight 函数）
//   - 右侧：运行结果控制台
//   - 顶部：语言切换标签 + 操作按钮（运行 / 重置 / 清空 / 快捷键）
//
// 支持的语言（9 种，与后端 API 路由一一对应）：
//   Node.js / TypeScript / Python / Java / C# / Go / Sass / GraphQL / 后端
//
// 编辑器快捷键（VS Code 风格，Mac 用 Cmd，Windows/Linux 用 Ctrl）：
//   Ctrl/Cmd + Enter        运行代码
//   Ctrl/Cmd + /            注释 / 取消注释（行注释，自动适配语言）
//   Tab                     缩进（选中多行则整体缩进）
//   Shift + Tab             减少缩进
//   Ctrl/Cmd + ]            当前行 / 选中行增加缩进
//   Ctrl/Cmd + [            当前行 / 选中行减少缩进
//   Ctrl/Cmd + D            复制当前行到下一行
//   Ctrl/Cmd + Shift + K    删除当前行
//   Alt + ↑ / ↓             当前行上移 / 下移
//   Ctrl/Cmd + S            保存到本地（localStorage，并提示）
//   Ctrl/Cmd + Backspace    清空输出
// =============================================================

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import CodeEditor from "../components/CodeEditor";
import Sidebar from "../components/Sidebar";
import { highlightJavaScript } from "../highlight";
import { highlightTypeScript } from "../ts-highlight";
import { highlightPython } from "../py-highlight";
import { highlightJava } from "../java-highlight";
import { highlightCsharp } from "../csharp-highlight";
import { highlightGo } from "../go-highlight";
import { highlightScss } from "../sass-highlight";
import { highlightGraphQL } from "../gql-highlight";
import { highlightC } from "../c-highlight";
import { highlightCpp } from "../cpp-highlight";
import { highlightRuby } from "../ruby-highlight";
import { highlightSwift } from "../swift-highlight";
import { highlightShell } from "../shell-highlight";
import { highlightSql } from "../sql-highlight";

// =============================================================
// 浏览器端 JavaScript 执行器
// -------------------------------------------------------------
// 与 Node.js 后端执行不同，这里在浏览器里用隐藏 iframe 沙箱执行
// 用户代码，能直接操作 DOM、使用 alert/prompt、console.log，更贴近
// 前端真实开发场景。
//
// 安全设计：
//   1. iframe 加 sandbox="allow-scripts"（不含 allow-same-origin），
//      与父页面同源隔离，用户代码无法访问父窗口的 cookie / localStorage / DOM
//   2. 通过 srcdoc 注入 HTML，用 postMessage 把执行结果回传父窗口
//   3. 重写 iframe 内的 console.* 收集输出
//   4. 5 秒超时保护，防止死循环
//   5. 用户代码里的 </script> 会被转义，避免破坏注入的 HTML 结构
//
// 局限：异步代码（setTimeout 等）的结果可能在超时后才产生，无法捕获；
//       这里面向教学场景，同步代码 + console.log 已能覆盖绝大多数需求。
// =============================================================
async function runClientJavaScript(code) {
  return new Promise((resolve) => {
    // 转义用户代码中的 </script>，防止提前闭合注入的 <script> 标签
    const safeCode = code.replace(/<\/script>/gi, "<\\/script>");

    // 构造 iframe 内执行的 HTML 文档
    const html =
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>\n' +
      "(function () {\n" +
      "  var __logs = [];\n" +
      "  function __fmt(a) {\n" +
      "    if (a === null) return 'null';\n" +
      "    if (a === undefined) return 'undefined';\n" +
      "    if (typeof a === 'object') {\n" +
      "      try { return JSON.stringify(a, null, 2); }\n" +
      "      catch (e) { return String(a); }\n" +
      "    }\n" +
      "    return String(a);\n" +
      "  }\n" +
      "  // 重写 console.*，把输出收集到 __logs\n" +
      "  ['log','info','warn','error','debug'].forEach(function (level) {\n" +
      "    var orig = console[level] ? console[level].bind(console) : function(){};\n" +
      "    console[level] = function () {\n" +
      "      var args = Array.prototype.slice.call(arguments);\n" +
      "      __logs.push(args.map(__fmt).join(' '));\n" +
      "      orig.apply(console, args);\n" +
      "    };\n" +
      "  });\n" +
      "  // 未捕获异常：回传错误\n" +
      "  window.onerror = function (msg, src, line, col, err) {\n" +
      "    window.parent.postMessage({ type: 'pg-js-result', logs: __logs, errors: [msg] }, '*');\n" +
      "    return true;\n" +
      "  };\n" +
      "  try {\n" +
      "    " + safeCode + "\n" +
      "  } catch (e) {\n" +
      "    window.parent.postMessage({ type: 'pg-js-result', logs: __logs, errors: [e.message + (e.stack ? '\\n' + e.stack : '')] }, '*');\n" +
      "    return;\n" +
      "  }\n" +
      "  // 同步代码执行完，等两个微任务轮次再回传，让 Promise.then 跑完\n" +
      "  Promise.resolve().then(function(){return Promise.resolve();}).then(function () {\n" +
      "    window.parent.postMessage({ type: 'pg-js-result', logs: __logs, errors: [] }, '*');\n" +
      "  });\n" +
      "})();\n" +
      "<\/script></body></html>";

    // 创建隐藏 iframe 作为执行沙箱
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    // 监听 iframe 回传的结果
    const handler = (event) => {
      const data = event.data;
      if (!data || data.type !== "pg-js-result") return;
      window.removeEventListener("message", handler);
      clearTimeout(timer);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      resolve({
        output:
          data.logs.join("\n") ||
          (data.errors.length ? "" : "(无输出)"),
        error: data.errors.join("\n"),
      });
    };
    window.addEventListener("message", handler);

    // 超时保护：5 秒未收到结果，强制清理并报错
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      resolve({
        output: "",
        error: "执行超时（5 秒），请检查是否有死循环或异步阻塞。",
      });
    }, 5000);

    // 用 srcdoc 加载文档（sandbox 下 srcdoc 可正常工作）
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}

// =============================================================
// 语言配置表
// -------------------------------------------------------------
// 每种语言一份配置，集中描述：
//   id        唯一标识（也用作 localStorage key）
//   label     标签显示文字
//   icon      标签图标
//   filename  编辑器顶部显示的文件名
//   comment   行注释前缀（用于 Ctrl+/ 快捷键）
//   api       后端执行接口路径（有 clientRun 时可省略）
//   clientRun 浏览器端执行函数（有此字段则跳过后端 fetch，前端直接跑）
//   highlight 语法高亮函数
//   defaultCode 默认初始代码
//   parse     把接口返回的 JSON 转成 { output, error } 统一格式
// =============================================================
const LANGUAGES = [
  {
    id: "node",
    label: "Node.js",
    icon: "⬢",
    filename: "playground.js",
    comment: "//",
    api: "/api/run",
    highlight: highlightJavaScript,
    defaultCode: `// Node.js Playground
// 按 Ctrl/Cmd + Enter 运行，Ctrl/Cmd + / 注释代码

const greeting = "Hello, Node.js!";
console.log(greeting);

// 试试一些内置模块
const now = new Date();
console.log("当前时间:", now.toISOString());

// 数组操作演示
const nums = [1, 2, 3, 4, 5];
const doubled = nums.map((n) => n * 2);
console.log("翻倍:", doubled);
console.log("求和:", doubled.reduce((a, b) => a + b, 0));
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "ts",
    label: "TypeScript",
    icon: "🔷",
    filename: "playground.ts",
    comment: "//",
    api: "/api/run-ts",
    highlight: highlightTypeScript,
    defaultCode: `// TypeScript Playground
// 类型注解会被转译剥离后运行

interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return \`你好, \${user.name}, 你 \${user.age} 岁了\`;
}

const alice: User = { name: "Alice", age: 28 };
console.log(greet(alice));

// 泛型演示
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
console.log("第一个:", first([10, 20, 30]));
console.log("第一个:", first(["a", "b", "c"]));
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "python",
    label: "Python",
    icon: "🐍",
    filename: "playground.py",
    comment: "#",
    api: "/api/run-py",
    highlight: highlightPython,
    defaultCode: `# Python Playground
# 按 Ctrl/Cmd + Enter 运行

greeting = "Hello, Python!"
print(greeting)

# 列表推导式
nums = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in nums]
print("翻倍:", doubled)
print("求和:", sum(doubled))

# 字典演示
user = {"name": "Alice", "age": 28}
print(f"用户: {user['name']}, 年龄: {user['age']}")

# 函数定义
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print("斐波那契前 10 项:", [fib(i) for i in range(10)])
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "java",
    label: "Java",
    icon: "☕",
    filename: "Playground.java",
    comment: "//",
    api: "/api/run-java",
    highlight: highlightJava,
    defaultCode: `// Java Playground
// 注意：public class 名必须为 Playground

public class Playground {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");

        // 数组与循环
        int[] nums = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int n : nums) {
            sum += n;
        }
        System.out.println("求和: " + sum);

        // 字符串拼接
        String name = "Alice";
        int age = 28;
        System.out.printf("用户: %s, 年龄: %d%n", name, age);
    }
}
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "csharp",
    label: "C#",
    icon: "🟪",
    filename: "Playground.cs",
    comment: "//",
    api: "/api/run-csharp",
    highlight: highlightCsharp,
    defaultCode: `// C# Playground
using System;

class Playground {
    static void Main() {
        Console.WriteLine("Hello, C#!");

        // 数组与 LINQ 风格求和
        int[] nums = { 1, 2, 3, 4, 5 };
        int sum = 0;
        foreach (var n in nums) sum += n;
        Console.WriteLine("求和: " + sum);

        // 字符串插值
        string name = "Alice";
        int age = 28;
        Console.WriteLine($"用户: {name}, 年龄: {age}");
    }
}
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "go",
    label: "Go",
    icon: "🐹",
    filename: "playground.go",
    comment: "//",
    api: "/api/run-go",
    highlight: highlightGo,
    defaultCode: `// Go Playground
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")

    // 切片与循环
    nums := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, n := range nums {
        sum += n
    }
    fmt.Println("求和:", sum)

    // 多返回值函数
    name, age := "Alice", 28
    fmt.Printf("用户: %s, 年龄: %d\\n", name, age)
}
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "sass",
    label: "Sass",
    icon: "💅",
    filename: "playground.scss",
    comment: "//",
    api: "/api/run-sass",
    highlight: highlightScss,
    defaultCode: `// Sass/SCSS Playground
// 编译后会输出对应的 CSS

$primary: #2563eb;
$radius: 8px;

@mixin card($padding: 16px) {
  padding: $padding;
  border-radius: $radius;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.button {
  background: $primary;
  color: white;
  border: none;
  border-radius: $radius;
  padding: 8px 16px;
  cursor: pointer;

  &:hover {
    background: darken($primary, 10%);
  }

  &--large {
    padding: 12px 24px;
    font-size: 16px;
  }
}

.card {
  @include card(20px);

  &__title {
    font-size: 18px;
    font-weight: bold;
  }
}
`,
    // Sass 接口返回 { css, error, warnings }，统一转成 { output, error }
    parse: (data) => {
      let output = "";
      if (data.css) {
        output = data.css;
      }
      if (data.warnings && data.warnings.length > 0) {
        output +=
          (output ? "\n\n" : "") +
          "[编译警告]\n" +
          data.warnings.join("\n");
      }
      return {
        output: output || "(无输出：编译失败或代码为空)",
        error: data.error || "",
      };
    },
  },
  {
    id: "gql",
    label: "GraphQL",
    icon: "◈",
    filename: "playground.gql",
    comment: "#",
    api: "/api/run-gql",
    highlight: highlightGraphQL,
    defaultCode: `# GraphQL Playground
# 代码分三段：Schema / Resolvers / Query，用注释标记分隔

# === Schema ===
type Query {
  hello: String
  user(id: ID!): User
}

type User {
  id: ID!
  name: String
  age: Int
}

# === Resolvers ===
{
  Query: {
    hello: () => "Hello, GraphQL!",
    user: ({ id }) => ({
      id,
      name: "Alice",
      age: 28,
    }),
  },
}

# === Query ===
{
  hello
  user(id: "1") {
    id
    name
    age
  }
}
`,
    // GraphQL 接口返回 { data, errors }，统一转成 { output, error }
    parse: (data) => {
      let output = "";
      if (data.data !== null && data.data !== undefined) {
        output += JSON.stringify(data.data, null, 2);
      }
      let error = "";
      if (data.errors && data.errors.length > 0) {
        error = data.errors.map((e) => e.message).join("\n");
      }
      if (!output && !error) {
        output = "(无返回数据)";
      }
      return { output, error };
    },
  },
  {
    id: "backend",
    label: "后端",
    icon: "🖥️",
    filename: "backend.js",
    comment: "//",
    api: "/api/run-backend",
    highlight: highlightJavaScript,
    defaultCode: `// 后端开发 Playground
// 用 Node.js 演示后端概念（HTTP / 缓存 / 限流等）

// 简单的内存缓存演示
const cache = new Map();

function getData(key) {
  if (cache.has(key)) {
    console.log("[缓存命中]", key);
    return cache.get(key);
  }
  console.log("[缓存未命中]，写入缓存", key);
  const value = \`value-\${Date.now()}\`;
  cache.set(key, value);
  return value;
}

console.log(getData("user:1"));
console.log(getData("user:1")); // 第二次会命中缓存
console.log(getData("user:2"));

// 简单的限流器（令牌桶思想）
let tokens = 3;
const MAX = 3;
function request(api) {
  if (tokens <= 0) {
    console.log("[限流]", api, "请求被拒绝");
    return false;
  }
  tokens--;
  console.log("[通过]", api, "剩余令牌:", tokens);
  return true;
}

console.log("\\n--- 限流演示 ---");
for (let i = 0; i < 5; i++) {
  request(\`/api/\${i}\`);
}
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "javascript",
    label: "JavaScript",
    icon: "🟨",
    filename: "playground.js",
    comment: "//",
    // 浏览器端执行：不调后端接口，直接在 iframe 沙箱里跑
    // 与 Node.js 区分：能操作 DOM、用 alert/prompt，贴近前端真实场景
    clientRun: runClientJavaScript,
    highlight: highlightJavaScript,
    defaultCode: `// JavaScript 浏览器端 Playground
// 在浏览器里执行，支持 DOM 操作、alert、console.log

console.log("Hello, JavaScript!");

// 数组与对象
const nums = [1, 2, 3, 4, 5];
console.log("翻倍:", nums.map((n) => n * 2));
console.log("求和:", nums.reduce((a, b) => a + b, 0));

const user = { name: "Alice", age: 28 };
console.log("用户:", user);

// 闭包演示
function counter() {
  let count = 0;
  return () => ++count;
}
const next = counter();
console.log("计数:", next(), next(), next());
`,
    parse: null, // clientRun 直接返回 {output, error}，不需要 parse
  },
  {
    id: "c",
    label: "C",
    icon: "🇨",
    filename: "playground.c",
    comment: "//",
    api: "/api/run-c",
    highlight: highlightC,
    defaultCode: `// C Playground
// 用 clang 编译运行

#include <stdio.h>

int main(void) {
    printf("Hello, C!\\n");

    // 数组求和
    int nums[] = {1, 2, 3, 4, 5};
    int sum = 0;
    int n = sizeof(nums) / sizeof(nums[0]);
    for (int i = 0; i < n; i++) {
        sum += nums[i];
    }
    printf("求和: %d\\n", sum);

    // 指针演示
    int x = 42;
    int *p = &x;
    printf("x = %d, *p = %d\\n", x, *p);

    return 0;
}
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "cpp",
    label: "C++",
    icon: "➕",
    filename: "playground.cpp",
    comment: "//",
    api: "/api/run-cpp",
    highlight: highlightCpp,
    defaultCode: `// C++ Playground
// 用 clang++ 编译运行（-std=c++17）

#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

int main() {
    std::cout << "Hello, C++!" << std::endl;

    // vector 演示
    std::vector<int> nums = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int n : nums) sum += n;
    std::cout << "求和: " << sum << std::endl;

    // 字符串
    std::string name = "Alice";
    int age = 28;
    std::cout << "用户: " << name << ", 年龄: " << age << std::endl;

    // lambda + sort
    std::vector<int> arr = {5, 3, 1, 4, 2};
    std::sort(arr.begin(), arr.end(), [](int a, int b) { return a > b; });
    std::cout << "降序排序: ";
    for (int n : arr) std::cout << n << " ";
    std::cout << std::endl;

    return 0;
}
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "ruby",
    label: "Ruby",
    icon: "💎",
    filename: "playground.rb",
    comment: "#",
    api: "/api/run-ruby",
    highlight: highlightRuby,
    defaultCode: `# Ruby Playground
# 简洁优雅的 Ruby

puts "Hello, Ruby!"

# 数组与块
nums = [1, 2, 3, 4, 5]
puts "翻倍: #{nums.map { |n| n * 2 }.inspect}"
puts "求和: #{nums.sum}"

# 哈希
user = { name: "Alice", age: 28 }
puts "用户: #{user[:name]}, 年龄: #{user[:age]}"

# 类与对象
class Animal
  def initialize(name)
    @name = name
  end

  def speak
    "#{@name} 发出声音"
  end
end

class Dog < Animal
  def speak
    "#{@name} 汪汪叫"
  end
end

dog = Dog.new("旺财")
puts dog.speak

# 块与迭代
3.times { |i| puts "第 #{i + 1} 次" }
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "swift",
    label: "Swift",
    icon: "🐦",
    filename: "playground.swift",
    comment: "//",
    api: "/api/run-swift",
    highlight: highlightSwift,
    defaultCode: `// Swift Playground
// Apple 的 Swift 语言

print("Hello, Swift!")

// 数组与高阶函数
let nums = [1, 2, 3, 4, 5]
print("翻倍:", nums.map { $0 * 2 })
print("求和:", nums.reduce(0, +))

// 字典
let user: [String: Any] = ["name": "Alice", "age": 28]
print("用户:", user["name"] ?? "", "年龄:", user["age"] ?? "")

// 函数与元组
func greet(_ name: String, _ age: Int) -> String {
    return "你好, \\(name), 你 \\(age) 岁了"
}
print(greet("Alice", 28))

// 枚举与 switch
enum Direction {
    case north, south, east, west
}

func describe(_ d: Direction) -> String {
    switch d {
    case .north: return "向北"
    case .south: return "向南"
    case .east: return "向东"
    case .west: return "向西"
    }
}

print(describe(.north))
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "shell",
    label: "Shell",
    icon: "🐚",
    filename: "playground.sh",
    comment: "#",
    api: "/api/run-shell",
    highlight: highlightShell,
    defaultCode: `#!/bin/bash
# Shell/Bash Playground
# 用 echo / printf 输出（shell 没有 console.log）

echo "Hello, Shell!"

# 变量
name="Alice"
age=28
echo "用户: $name, 年龄: $age"

# 数组与循环
nums=(1 2 3 4 5)
sum=0
for n in "\${nums[@]}"; do
  sum=$((sum + n))
done
echo "求和: $sum"

# 条件判断
score=85
if [ $score -ge 90 ]; then
  echo "等级: A"
elif [ $score -ge 80 ]; then
  echo "等级: B"
else
  echo "等级: C"
fi

# 函数
greet() {
  echo "你好, $1!"
}
greet "世界"

# 命令替换
echo "当前目录: $(pwd)"
echo "日期: $(date '+%Y-%m-%d')"
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
  {
    id: "sql",
    label: "SQL",
    icon: "🗄️",
    filename: "playground.sql",
    comment: "--",
    api: "/api/run-sql",
    highlight: highlightSql,
    defaultCode: `-- SQL Playground
-- 用 SQLite 内存数据库执行

-- 创建表
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  city TEXT
);

-- 插入数据
INSERT INTO users (name, age, city) VALUES
  ('Alice', 28, '北京'),
  ('Bob', 34, '上海'),
  ('Charlie', 22, '广州'),
  ('Diana', 41, '北京'),
  ('Eve', 29, '上海');

-- 查询全部
SELECT * FROM users;

-- 按城市分组统计
SELECT city, COUNT(*) AS count, AVG(age) AS avg_age
FROM users
GROUP BY city
ORDER BY count DESC;

-- 条件查询
SELECT name, age FROM users
WHERE age >= 30
ORDER BY age;
`,
    parse: (data) => ({
      output: data.output || "(无输出)",
      error: data.error || "",
    }),
  },
];

// localStorage 存储 key 前缀，按语言隔离保存用户代码
const STORAGE_PREFIX = "playground:code:";

// 快捷键说明表（用于快捷键帮助面板展示）
const SHORTCUTS = [
  { keys: "Ctrl/Cmd + Enter", desc: "运行代码" },
  { keys: "Ctrl/Cmd + /", desc: "注释 / 取消注释" },
  { keys: "Tab", desc: "缩进（选中多行则整体缩进）" },
  { keys: "Shift + Tab", desc: "减少缩进" },
  { keys: "Ctrl/Cmd + ]", desc: "当前行增加缩进" },
  { keys: "Ctrl/Cmd + [", desc: "当前行减少缩进" },
  { keys: "Ctrl/Cmd + D", desc: "复制当前行到下一行" },
  { keys: "Ctrl/Cmd + Shift + K", desc: "删除当前行" },
  { keys: "Alt + ↑ / ↓", desc: "当前行上移 / 下移" },
  { keys: "Ctrl/Cmd + S", desc: "保存到本地" },
  { keys: "Ctrl/Cmd + Backspace", desc: "清空输出" },
];

export default function PlaygroundPage() {
  // ---------- 状态管理 ----------
  // 当前语言 id
  const [langId, setLangId] = useState(LANGUAGES[0].id);
  // 各语言对应的代码（对象映射，切换语言时保留各自内容）
  // 注意：初始化时只用默认代码，不读 localStorage，保证服务端/客户端
  // 首次渲染结果一致，避免 hydration mismatch。localStorage 中的内容
  // 会在挂载后通过 useEffect 读取并覆盖。
  const [codes, setCodes] = useState(() => {
    const init = {};
    for (const lang of LANGUAGES) {
      init[lang.id] = lang.defaultCode;
    }
    return init;
  });
  // 运行输出
  const [output, setOutput] = useState("");
  // 错误信息
  const [error, setError] = useState("");
  // 是否运行中
  const [isRunning, setIsRunning] = useState(false);
  // 是否运行过
  const [hasRun, setHasRun] = useState(false);
  // 快捷键帮助面板是否展开
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  // 保存提示信息（短暂显示）
  const [toast, setToast] = useState("");
  // 自动运行开关：开启后代码改变会自动执行（防抖）
  const [autoRun, setAutoRun] = useState(true);
  // 移动端侧边栏
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---------- ref ----------
  const requestIdRef = useRef(0);

  // 当前语言配置对象
  const activeLang =
    LANGUAGES.find((l) => l.id === langId) || LANGUAGES[0];

  // 当前代码（从 codes 映射里取）
  const code = codes[langId];

  // ---------- 更新某语言代码 ----------
  const setCode = useCallback(
    (newCode) => {
      setCodes((prev) => ({ ...prev, [langId]: newCode }));
    },
    [langId]
  );

  // ---------- 切换语言 ----------
  const selectLanguage = useCallback((id) => {
    setLangId(id);
    setOutput("");
    setError("");
    setHasRun(false);
  }, []);

  // ---------- 运行代码 ----------
  // silent 参数说明：
  //   false（默认，手动运行）—— 立即显示「正在执行...」占位，让用户看到反馈
  //   true（自动运行）—— 不显示占位，保留上一次的输出直到新结果回来，
  //                       避免每次按键都闪烁清空输出区
  //
  // 请求去重：每次运行都给一个自增序号，结果回来时若序号已过期（用户
  //   又输入了新内容触发了新的运行），则丢弃旧结果，防止旧响应覆盖新结果。
  const runCode = useCallback(
    async (silent = false) => {
      const currentId = ++requestIdRef.current;
      setIsRunning(true);
      if (!silent) {
        setOutput(`正在执行 ${activeLang.label}...`);
      }
      setError("");
      try {
        let parsed;
        // 分支一：有 clientRun（浏览器端执行，如 JavaScript），直接调用
        if (typeof activeLang.clientRun === "function") {
          parsed = await activeLang.clientRun(code);
        } else {
          // 分支二：调后端 API 执行
          const res = await fetch(activeLang.api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          const data = await res.json();
          parsed = activeLang.parse(data);
        }
        // 过时请求：用户已经输入新内容并发起了更新的运行，丢弃本次结果
        if (currentId !== requestIdRef.current) return;
        setOutput(parsed.output || "(无输出)");
        setError(parsed.error || "");
      } catch (err) {
        if (currentId !== requestIdRef.current) return;
        setError("请求失败: " + err.message);
        setOutput("");
      } finally {
        // 只有最新的请求才更新运行状态，避免提前清空 loading
        if (currentId === requestIdRef.current) {
          setIsRunning(false);
          setHasRun(true);
        }
      }
    },
    [code, activeLang]
  );

  // ---------- 显示短暂提示 ----------
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  }

  // ---------- 重置代码 ----------
  const resetCode = useCallback(() => {
    setCode(activeLang.defaultCode);
    setOutput("");
    setError("");
    setHasRun(false);
    try {
      localStorage.removeItem(STORAGE_PREFIX + langId);
    } catch {
      // ignore
    }
    showToast("已重置为默认代码");
  }, [activeLang, langId, setCode]);

  // ---------- 清空输出 ----------
  const clearOutput = useCallback(() => {
    setOutput("");
    setError("");
    setHasRun(false);
  }, []);

  // ---------- 手动保存 ----------
  const manualSave = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_PREFIX + langId, code);
      showToast("已保存到本地");
    } catch {
      showToast("保存失败");
    }
  }, [code, langId]);

  // ---------- 自动保存（防抖） ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_PREFIX + langId, code);
      } catch {
        // ignore
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [code, langId]);

  // ---------- 自动运行（防抖） ----------
  // 开启后，代码或语言切换改变时，等待 800ms（让用户连续输入完成）
  // 再静默执行。等待期间若又发生变化，会取消上一次的定时器重新计时，
  // 避免每次按键都发请求。
  // 切换语言也会触发，这样切到新语言能立刻看到默认代码的运行结果。
  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(() => {
      runCode(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [code, langId, autoRun, runCode]);

  // ---------- 行号列表 ----------
  const lineCount = useMemo(() => code.split("\n").length, [code]);

  // ---------- 全局快捷键（不在编辑器内也能触发运行） ----------
  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === "Enter") {
        // 仅当焦点不在 textarea 时拦截，避免与编辑器内重复
        if (!(document.activeElement instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          runCode();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runCode]);

  // ---------- 从 URL 读取语言参数 ----------
  // 当从教程代码块点击「Playground」按钮跳转过来时，URL 会带 ?lang=xxx。
  // 在挂载时读取该参数并切换到对应语言标签。
  // 用 useEffect 而非 useSearchParams 是为了避免 Suspense 边界要求，
  // 同时 selectLanguage 是稳定引用（空依赖），此 effect 仅在挂载时执行一次。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang");
    if (langParam) {
      const found = LANGUAGES.find((l) => l.id === langParam);
      if (found && found.id !== langId) {
        selectLanguage(found.id);
      }
    }
  }, [selectLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- 从 localStorage 恢复用户代码 ----------
  // 挂载后读取 localStorage 中保存的代码，覆盖默认代码。
  // 放在 useEffect 中而非 useState 初始化，避免服务端/客户端渲染不一致
  // 导致的 hydration mismatch（服务端无 localStorage，客户端有）。
  // 仅在挂载时执行一次（空依赖数组）。
  useEffect(() => {
    setCodes((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const lang of LANGUAGES) {
        try {
          const saved = localStorage.getItem(STORAGE_PREFIX + lang.id);
          if (saved !== null && saved !== prev[lang.id]) {
            next[lang.id] = saved;
            changed = true;
          }
        } catch {
          // localStorage 不可用时保持默认代码
        }
      }
      return changed ? next : prev;
    });
  }, []);

  return (
    <div className="app-shell">
      <div className="main-layout playground-main">
        <Sidebar
          title="Playground"
          tip="在线代码编辑器"
          currentPath="/playground"
          meta={`Playground · ${LANGUAGES.length} 种语言 · 在线编辑运行`}
          defaultCollapsed={true}
          groupedChapters={[]}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />
        <main className="content playground-content">
          {/* ===== 顶部工具栏：语言切换 + 操作按钮 ===== */}
          <div className="pg-toolbar">
            <div className="pg-langs" role="tablist">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  className={`pg-lang-btn ${langId === lang.id ? "active" : ""}`}
                  onClick={() => selectLanguage(lang.id)}
                  title={`切换到 ${lang.label}`}
                >
                  <span className="pg-lang-icon">{lang.icon}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>

            <div className="pg-actions">
              <button
                className={`btn ${autoRun ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setAutoRun((v) => !v)}
                title="自动运行：代码改变后自动执行（防抖 800ms）"
                aria-pressed={autoRun}
              >
                {autoRun ? "⚡ 自动运行: 开" : "⏸ 自动运行: 关"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={manualSave}
                title="保存到本地 (Ctrl/Cmd+S)"
              >
                💾 保存
              </button>
              <button
                className="btn btn-secondary"
                onClick={resetCode}
                disabled={isRunning}
                title="恢复默认代码"
              >
                ↺ 重置
              </button>
              <button
                className="btn btn-secondary"
                onClick={clearOutput}
                title="清空输出 (Ctrl/Cmd+Backspace)"
              >
                🗑 清空
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShortcutsOpen((v) => !v)}
                title="查看快捷键"
              >
                ⌨ 快捷键
              </button>
              <button
                className="btn btn-primary"
                onClick={runCode}
                disabled={isRunning}
                title="运行代码 (Ctrl/Cmd+Enter)"
              >
                {isRunning ? "⏳ 执行中..." : "▶ 运行"}
              </button>
            </div>
          </div>

          {/* ===== 快捷键帮助面板 ===== */}
          {shortcutsOpen && (
            <div className="pg-shortcuts">
              <div className="pg-shortcuts-header">
                <span>⌨ 编辑器快捷键（VS Code 风格）</span>
                <button
                  className="pg-shortcuts-close"
                  onClick={() => setShortcutsOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="pg-shortcuts-grid">
                {SHORTCUTS.map((s) => (
                  <div key={s.keys} className="pg-shortcut-item">
                    <kbd className="pg-kbd">{s.keys}</kbd>
                    <span className="pg-shortcut-desc">{s.desc}</span>
                  </div>
                ))}
              </div>
              <div className="pg-shortcuts-tip">
                💡 Mac 用 <kbd className="pg-kbd">Cmd</kbd>，Windows / Linux
                用 <kbd className="pg-kbd">Ctrl</kbd>。代码会自动保存到本地。
              </div>
            </div>
          )}

          {/* ===== 左右分栏：编辑器 + 输出 ===== */}
          <div className="pg-split">
            {/* 左侧：代码编辑器 */}
            <section className="pg-editor-pane">
              <div className="pg-pane-header">
                <div className="pg-pane-label">
                  <span className="dot dot-red"></span>
                  <span className="dot dot-yellow"></span>
                  <span className="dot dot-green"></span>
                  <span className="pg-filename">{activeLang.filename}</span>
                </div>
                <span className="pg-pane-hint">
                  {activeLang.label} · {lineCount} 行
                </span>
              </div>
              <div className="editor-wrap pg-editor-wrap">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  highlight={activeLang.highlight}
                  comment={activeLang.comment}
                  onRun={runCode}
                  placeholder={`在这里编写 ${activeLang.label} 代码...`}
                  minHeight={200}
                  maxHeight={9999}
                />
              </div>
            </section>

            {/* 右侧：输出控制台 */}
            <section className="pg-output-pane">
              <div className="pg-pane-header">
                <div className="pg-pane-label">
                  <span className="pg-pane-title">控制台输出</span>
                </div>
                <span className="pg-pane-hint">
                  {isRunning
                    ? "执行中..."
                    : hasRun
                    ? error
                      ? "执行出错"
                      : "执行完成"
                    : "点击运行查看结果"}
                </span>
              </div>
              <div className="pg-console-body">
                {output && (
                  <pre
                    className={`console-output ${error ? "has-error" : ""}`}
                  >
                    {output}
                  </pre>
                )}
                {error && (
                  <pre className="console-error">
                    <span className="error-label">错误:</span>
                    {"\n"}
                    {error}
                  </pre>
                )}
                {!hasRun && !isRunning && (
                  <div className="console-placeholder">
                    <span className="placeholder-icon">▶</span>
                    <span>
                      点击「运行」按钮，或按 Ctrl/Cmd + Enter 执行代码
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* ===== 底部状态栏 ===== */}
          <div className="pg-statusbar">
            <span className="pg-status-item">
              {activeLang.icon} {activeLang.label}
            </span>
            <span className="pg-status-item pg-status-hint">
              {autoRun
                ? "⚡ 自动运行已开启 · 停止输入 0.8s 后自动执行"
                : "Ctrl/Cmd + Enter 运行 · Ctrl/Cmd + / 注释 · Tab 缩进"}
            </span>
          </div>
        </main>
      </div>

      {/* ===== 保存提示 toast ===== */}
      {toast && <div className="pg-toast">{toast}</div>}
    </div>
  );
}
