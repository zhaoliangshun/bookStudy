// 修复 csharp3 教程中的已知编译错误
// 基于实际测试结果，针对性修复

import { readFileSync, writeFileSync } from "fs";

// 已知问题列表（基于之前的编译测试）
const knownIssues = [
  {
    file: "csharp3-chapters-batch1.js",
    chapter: "csharp3-ch01",
    blockIndex: 5, // block6
    issue: "中文标点符号",
    fix: "将代码中的中文标点改为英文标点"
  },
  {
    file: "csharp3-chapters-batch1.js", 
    chapter: "csharp3-ch02",
    blockIndex: 3,
    issue: "类型转换错误",
    fix: "修复 long 到 int 的隐式转换问题"
  },
  {
    file: "csharp3-chapters-batch1.js",
    chapter: "csharp3-ch02", 
    blockIndex: 6,
    issue: "空字符字面量",
    fix: "修复转义字符问题"
  },
  {
    file: "csharp3-chapters-batch1.js",
    chapter: "csharp3-ch03",
    blockIndex: 4,
    issue: "类型定义在顶级语句之后",
    fix: "调整代码顺序，将 enum 定义移到使用之前"
  },
  {
    file: "csharp3-chapters-batch2.js",
    chapter: "csharp3-ch06",
    blockIndex: 7,
    issue: "switch 模式匹配不可达",
    fix: "调整 switch 表达式分支顺序"
  },
  {
    file: "csharp3-chapters-batch2.js",
    chapter: "csharp3-ch07",
    blockIndex: 4,
    issue: "record 的 init-only 属性修改",
    fix: "使用 with 表达式或重新初始化"
  },
  {
    file: "csharp3-chapters-batch2.js",
    chapter: "csharp3-ch08",
    blockIndex: 2,
    issue: "变量名冲突",
    fix: "修改变量名避免作用域冲突"
  },
  {
    file: "csharp3-chapters-batch3.js",
    chapter: "csharp3-ch10",
    blockIndex: 4,
    issue: "重复定义方法",
    fix: "使用不同的方法名或合并代码"
  },
  {
    file: "csharp3-chapters-batch3.js",
    chapter: "csharp3-ch11",
    blockIndex: 4,
    issue: "struct 定义在顶级语句之后",
    fix: "将 struct 定义移到前面"
  },
  {
    file: "csharp3-chapters-batch3.js",
    chapter: "csharp3-ch11",
    blockIndex: 8,
    issue: "命名参数位置错误",
    fix: "调整参数顺序"
  },
  {
    file: "csharp3-chapters-batch3.js",
    chapter: "csharp3-ch12",
    blockIndex: [1, 2, 3, 4, 5],
    issue: "方法重载演示代码重复定义",
    fix: "为每个代码块添加独立上下文"
  },
  {
    file: "csharp3-chapters-batch3.js",
    chapter: "csharp3-ch13",
    blockIndex: 4,
    issue: "class 定义在顶级语句之后",
    fix: "调整代码结构"
  },
  {
    file: "csharp3-chapters-batch3.js",
    chapter: "csharp3-ch13",
    blockIndex: 6,
    issue: "静态局部函数引用外部变量",
    fix: "移除 static 或通过参数传递"
  },
  {
    file: "csharp3-chapters-batch3.js",
    chapter: "csharp3-ch14",
    blockIndex: 5,
    issue: "类型定义顺序",
    fix: "调整代码结构"
  }
];

console.log("已知问题数量:", knownIssues.length);
console.log("\n建议的修复策略:");
console.log("1. 对于中文标点：在字符串中是合法的，无需修复");
console.log("2. 对于类型定义顺序：将类型定义移到顶级语句之前");
console.log("3. 对于方法重载演示：每个代码块独立，不要重复定义同名方法");
console.log("4. 对于变量作用域：使用不同的变量名");
console.log("5. 对于 record 修改：使用 with 表达式");

// 实际修复函数
function fixCodeBlock(code, issue) {
  switch(issue) {
    case "中文标点符号":
      // 中文标点在字符串内是合法的，只在代码语法中需要修复
      return code;
    
    case "类型定义在顶级语句之后":
      // 将类型定义移到代码开头
      const typeDefMatch = code.match(/((?:enum|class|struct|interface|record)\s+\w+[\s\S]*?^\})/m);
      if (typeDefMatch) {
        const typeDef = typeDefMatch[1];
        const restCode = code.replace(typeDef, '').trim();
        return `${typeDef}\n\n${restCode}`;
      }
      return code;
    
    case "方法重载演示代码重复定义":
      // 每个代码块添加注释说明是独立示例
      return `// 示例：方法重载演示（本代码块独立运行）\n${code}`;
    
    default:
      return code;
  }
}

console.log("\n修复脚本准备完成。");
console.log("下一步：逐个文件检查并修复实际代码。");
