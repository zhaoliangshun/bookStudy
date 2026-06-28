// Comprehensive test: import ALL batch files and verify chapter counts, IDs, groups, fields
const fs = require('fs');
const path = require('path');

const APP_DIR = '/Users/zhaoliangshun/nextStudy/my-app/app';

const books = [
  { name: 'tutorial (Node.js)', prefix: 'chapters-batch', count: 12,
    expectedChapters: 79,
    groups: ['快速入门','核心基础','异步编程','核心模块','构建 API','认证与安全','数据存储','测试与调试','工程化','性能与优化','实战模式','实用场景'] },
  { name: 'ts (TypeScript)', prefix: 'ts-chapters-batch', count: 9,
    expectedChapters: 46,
    groups: ['基础','基础补充','核心','核心补充','进阶类型','进阶类型深入','工程化','工程化进阶','实战'] },
  { name: 'tw (Tailwind)', prefix: 'tw-chapters-batch', count: 4,
    expectedChapters: 16,
    groups: ['基础','排版与布局','组件样式','进阶'] },
  { name: 'py (Python)', prefix: 'py-chapters-batch', count: 8,
    expectedChapters: 40,
    groups: ['基础','核心','进阶','工程化','基础深化','函数式与并发','数据处理与持久化','高级特性与工程'] },
  { name: 'java (Java)', prefix: 'java-chapters-batch', count: 22,
    expectedChapters: 300,
    groups: ['基础','面向对象','进阶','基础深入','字符串与字符','数组与控制流','方法与作用域','OOP 深入','继承与多态深入','接口与抽象类深入','内部类与枚举','异常处理深入','集合框架深入','集合进阶','泛型深入','I/O 与 NIO','多线程与并发','Lambda 与 Stream','反射与注解','高级主题','设计模式','新特性与工程化'] },
  { name: 'csharp (C#)', prefix: 'csharp-chapters-batch', count: 5,
    expectedChapters: 22,
    groups: ['开篇','第一部分 基础入门','第二部分 语法进阶','第三部分 面向对象','第四部分 高级特性','第五部分 实战与生态','结尾'] },
  { name: 'go (Go)', prefix: 'go-chapters-batch', count: 5,
    expectedChapters: 22,
    groups: ['开篇','第一部分 基础入门','第二部分 语法进阶','第三部分 类型系统','第四部分 高级特性','第五部分 实战与生态','结尾'] },
  { name: 'sass (Sass)', prefix: 'sass-chapters-batch', count: 4,
    expectedChapters: 16,
    groups: ['基础','核心功能','进阶技巧','实战案例'] },
  { name: 'gql (GraphQL)', prefix: 'gql-chapters-batch', count: 4,
    expectedChapters: 16,
    groups: ['基础','核心','进阶','实战'] },
  { name: 'backend (后端)', prefix: 'backend-chapters-batch', count: 8,
    expectedChapters: 40,
    groups: ['基础与网络','API 设计与架构','数据存储','分布式与工程化'] },
  { name: 'ai (AI)', prefix: 'ai-chapters-batch', count: 8,
    expectedChapters: 40,
    groups: ['AI编程认知','提示词工程','AI辅助编码','AI辅助学习','AI工作流','进阶实战','陷阱与伦理','未来趋势'] },
  { name: 'career (职业)', prefix: 'career-chapters-batch', count: 4,
    expectedChapters: 20,
    groups: ['技术深耕路线','职业晋升通道','跨界转型方向','行业趋势与规划'] },
  { name: 'comm (沟通)', prefix: 'comm-chapters-batch', count: 4,
    expectedChapters: 20,
    groups: ['沟通基础','日常沟通','进阶技巧','场景实战'] },
  { name: 'psychology (心理学)', prefix: 'psychology-chapters-batch', count: 5,
    expectedChapters: 20,
    groups: ['开篇','第一部分 人际关系为什么如此伤人','第二部分 在关系中保护自己','第三部分 面对恶意——回击的艺术','第四部分 释怀与重建','第五部分 正确交往之道','结尾'] },
  { name: 'work (职场)', prefix: 'work-chapters-batch', count: 5,
    expectedChapters: 28,
    groups: ['开篇','第一部分 职场基础——心态与认知','第二部分 与同事相处——平级关系的艺术','第三部分 与领导相处——向上管理','第四部分 处理矛盾——冲突管理','第五部分 跨部门沟通——影响力辐射','第六部分 职场进阶——成长与突破','结尾'] },
  { name: 'stomach (脾胃)', prefix: 'stomach-chapters-batch', count: 5,
    expectedChapters: 26,
    groups: ['开篇','第一部分 认识脾胃——理解消化系统','第二部分 调养原则——总纲','第三部分 饮食调养——核心方法','第四部分 起居调养——生活方式','第五部分 对症调养——具体问题','第六部分 季节与人群','结尾'] },
  { name: 'dui (怼人)', prefix: 'dui-chapters-batch', count: 5,
    expectedChapters: 22,
    groups: ['开篇','第一部分 怼人的基础——心态与原则','第二部分 怼人技法大全','第三部分 场景实战——各种场合如何回怼','第四部分 高阶怼人——心理战与语言艺术','结尾'] },
  { name: 'fandui (反怼)', prefix: 'fandui-chapters-batch', count: 5,
    expectedChapters: 22,
    groups: ['开篇','第一部分 识别恶意——言语攻击的心理学','第二部分 心理防御——构建你的内在护盾','第三部分 反击策略——心理学驱动的回应技术','第四部分 场景实战——各场合的反怼心法','第五部分 长期修炼——成为不可摧毁的人','结尾'] },
  { name: 'curse (毒舌)', prefix: 'curse-chapters-batch', count: 5,
    expectedChapters: 20,
    groups: ['第一部分 毒舌基础篇','第二部分 毒舌外貌篇','第三部分 毒舌能力篇','第四部分 毒舌性格篇','第五部分 毒舌场景篇'] },
  { name: 'quotes (语录)', prefix: 'quotes-chapters-batch', count: 24,
    expectedChapters: 96,
    groups: ['第一部分 职场篇','第二部分 亲戚家庭篇','第三部分 社交生活篇','第四部分 应对套路篇','第五部分 金句集','第六部分 职场进阶篇','第七部分 校园篇','第八部分 情感篇','第九部分 消费篇','第十部分 交通出行篇','第十一部分 邻里篇','第十二部分 网络进阶篇','第十三部分 应对评价篇','第十四部分 应对炫耀篇','第十五部分 应对说教篇','第十六部分 应对情绪篇','第十七部分 应对越界篇','第十八部分 应对双标篇','第十九部分 应对杠精进阶篇','第二十部分 终极金句篇','第二十一部分 应对职场进阶篇','第二十二部分 应对生活琐事篇','第二十三部分 应对奇葩篇','第二十四部分 收官金句篇'] },
  { name: 'mahjong (麻将)', prefix: 'mahjong-chapters-batch', count: 4,
    expectedChapters: 20,
    groups: ['基础规则','胡牌核心策略','红中战术进阶','实战案例与心法'] },
];

function loadBatch(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // If file uses ES module exports (has 'export ' at line start), strip them
  if (/^export\s+/m.test(content)) {
    content = content.replace(/^export\s+/gm, '');
    content += '\nmodule.exports = { chapters: typeof chapters !== "undefined" ? chapters : [] };';
  }
  // Use .cjs to force CommonJS parsing
  const tmpFile = path.join(process.cwd(), '_batch_tmp_' + Date.now() + '_' + Math.random().toString(36).slice(2) + '.cjs');
  fs.writeFileSync(tmpFile, content);
  try {
    delete require.cache[tmpFile];
    const mod = require(tmpFile);
    fs.unlinkSync(tmpFile);
    return mod.chapters || [];
  } catch (e) {
    try { fs.unlinkSync(tmpFile); } catch (_) {}
    return { error: e.message };
  }
}

console.log('==================== COMPREHENSIVE REPORT ====================\n');

let totalIssues = 0;
const allIssues = [];

for (const book of books) {
  console.log(`\n----- ${book.name} -----`);
  const allChapters = [];
  let loadErrors = [];

  for (let i = 1; i <= book.count; i++) {
    const fileName = `${book.prefix}${i}.js`;
    const filePath = path.join(APP_DIR, fileName);
    const result = loadBatch(filePath);
    if (Array.isArray(result)) {
      for (const ch of result) {
        allChapters.push({ ...ch, _file: fileName });
      }
    } else {
      loadErrors.push(`${fileName}: ${result.error}`);
    }
  }

  console.log(`Chapters exported: ${allChapters.length} (expected: ${book.expectedChapters})`);

  if (loadErrors.length > 0) {
    console.log(`!! LOAD ERRORS:`);
    for (const e of loadErrors) { console.log(`   ${e}`); totalIssues++; }
  }

  if (allChapters.length !== book.expectedChapters) {
    totalIssues++;
    allIssues.push(`${book.name}: exported ${allChapters.length} chapters but expected ${book.expectedChapters}`);
    console.log(`!! CHAPTER COUNT MISMATCH: ${allChapters.length} vs expected ${book.expectedChapters}`);
  }

  // Check duplicate IDs
  const seen = new Map();
  const dups = [];
  for (const ch of allChapters) {
    if (seen.has(ch.id)) {
      dups.push({ id: ch.id, first: seen.get(ch.id), second: { file: ch._file, title: ch.title } });
    } else {
      seen.set(ch.id, { file: ch._file, title: ch.title });
    }
  }
  if (dups.length > 0) {
    totalIssues += dups.length;
    console.log(`!! DUPLICATE IDS (${dups.length}):`);
    for (const d of dups) {
      console.log(`   id="${d.id}"`);
      console.log(`      first : ${d.first.file} (title: ${d.first.title})`);
      console.log(`      second: ${d.second.file} (title: ${d.second.title})`);
    }
  } else {
    console.log(`OK: No duplicate IDs`);
  }

  // Check group consistency
  const groupSet = new Set(book.groups);
  const undefinedGroups = new Set();
  for (const ch of allChapters) {
    if (!groupSet.has(ch.group)) undefinedGroups.add(ch.group);
  }
  if (undefinedGroups.size > 0) {
    totalIssues += undefinedGroups.size;
    console.log(`!! UNDEFINED GROUPS:`);
    for (const g of undefinedGroups) console.log(`   "${g}"`);
  } else {
    console.log(`OK: All groups defined in chapterGroups`);
  }

  // Check required fields: id, group, icon, title, content
  const missingFields = [];
  for (const ch of allChapters) {
    const missing = [];
    if (ch.id === undefined) missing.push('id');
    if (ch.group === undefined) missing.push('group');
    if (ch.icon === undefined) missing.push('icon');
    if (ch.title === undefined) missing.push('title');
    if (ch.content === undefined) missing.push('content');
    if (missing.length > 0) missingFields.push({ file: ch._file, id: ch.id, missing });
  }
  if (missingFields.length > 0) {
    totalIssues += missingFields.length;
    console.log(`!! MISSING REQUIRED FIELDS:`);
    for (const m of missingFields) console.log(`   ${m.file} id="${m.id}": missing ${m.missing.join(', ')}`);
  } else {
    console.log(`OK: All chapters have required fields (id, group, icon, title, content)`);
  }
}

console.log(`\n==================== SUMMARY ====================`);
console.log(`Total issues found: ${totalIssues}`);
