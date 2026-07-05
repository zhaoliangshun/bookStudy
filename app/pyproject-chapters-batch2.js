// =============================================================
// Python 实战项目教程 - 第 2 批章节(网络与数据采集)
// 转义规则:content 内部反引号写作 \`,\${ 写作 \$\{。
// =============================================================

export const chapters = [
  {
    id: 'pyproject-crawler-arch',
    icon: '🕷️',
    title: '爬虫:基础与 robots.txt 规范',
    group: '网络与数据采集',
    content: `# 爬虫:基础与 robots.txt 规范

本章讲解 Web 爬虫的基础知识、robots.txt 规范,以及 Python 主流爬虫技术栈。核心理念:**做一个遵守规则的爬虫**。

## 一、爬虫的应用场景与法律/道德边界

### 1.1 什么是爬虫

爬虫(Web Crawler / Spider)是按照规则自动抓取互联网网页信息的程序。搜索引擎(Googlebot、Baiduspider)是最典型的爬虫。

### 1.2 合法应用场景

- 搜索引擎建立索引
- 价格监控与比价
- 舆情监测、新闻聚合
- 学术数据采集
- 机器学习训练数据集构建

### 1.3 法律与道德边界

⚠️ 爬虫不是「想抓就抓」。必须遵守:

1. **robots.txt 协议**:网站声明哪些页面可抓
2. **ToS(Terms of Service)**:网站服务条款
3. **数据合规**:个人信息保护法、GDPR
4. **技术克制**:不暴力请求、不绕过反爬机制
5. **登录数据**:不抓取需登录才能访问的私密数据

> 原则:**做一个对服务器友好的爬虫**。

## 二、robots.txt 规范详解

robots.txt 是网站根目录下的一个文本文件,告诉爬虫哪些页面可以抓取、哪些禁止抓取。它是一种**君子协定**,不具有强制法律效力,但业界普遍遵守。

### 2.1 robots.txt 的位置

访问 \`https://example.com/robots.txt\` 即可获取。

### 2.2 基本语法

\`\`\`
# robots.txt 示例
# 任何爬虫都不得抓取 /private/ 目录
User-agent: *
Disallow: /private/

# 允许 /public/ 目录
Allow: /public/

# 设置爬取间隔(秒)
Crawl-delay: 5

# 指定 sitemap
Sitemap: https://example.com/sitemap.xml
\`\`\`

### 2.3 字段说明

| 字段 | 含义 | 示例 |
|------|------|------|
| User-agent | 爬虫标识,* 代表所有 | \`User-agent: *\` |
| Disallow | 禁止抓取的路径 | \`Disallow: /admin/\` |
| Allow | 允许抓取的路径(优先级高于 Disallow) | \`Allow: /public/\` |
| Crawl-delay | 爬取间隔(秒) | \`Crawl-delay: 10\` |
| Sitemap | 站点地图地址 | \`Sitemap: https://...\` |

### 2.4 针对特定爬虫的规则

\`\`\`
# 对 Googlebot 特殊规则
User-agent: Googlebot
Disallow: /no-google/

# 对其他爬虫
User-agent: *
Disallow: /private/
\`\`\`

## 三、Python 爬虫技术栈对比

| 库 | 同步/异步 | 特点 | 适用场景 |
|------|------|------|------|
| urllib | 同步 | 标准库,无需安装 | 简单任务、教学 |
| requests | 同步 | API 友好,生态丰富 | 通用爬虫首选 |
| httpx | 同步+异步 | 支持 HTTP/2,API 类似 requests | 现代项目 |
| aiohttp | 异步 | 高并发 | 大规模爬取 |

> 推荐:新手从 \`requests\` 起步,大规模场景上 \`aiohttp\` 或 \`httpx\` 异步。

## 四、requests 库详解

\`requests\` 是 Python 最流行的 HTTP 库,API 简洁优雅。

### 4.1 安装

\`\`\`bash
pip install requests
\`\`\`

### 4.2 基本用法

\`\`\`python
import requests  # 导入 requests 库

# 发送 GET 请求
response = requests.get('https://httpbin.org/get')
print(response.status_code)  # 打印状态码,200 表示成功
print(response.text)          # 打印响应文本
print(response.json())        # 如果返回 JSON,直接解析
\`\`\`

### 4.3 带参数与请求头

\`\`\`python
import requests

# 查询参数
params = {'q': 'python', 'page': 1}
# 请求头(模拟浏览器)
headers = {
    'User-Agent': 'MyCrawler/1.0 (https://example.com/bot)'  # 标识自己的爬虫
}

response = requests.get(
    'https://httpbin.org/get',
    params=params,    # GET 参数
    headers=headers,  # 请求头
    timeout=10        # 超时(秒),必填,避免卡死
)
print(response.url)  # 打印最终 URL(含参数)
\`\`\`

### 4.4 POST 请求

\`\`\`python
import requests

# 表单数据
data = {'username': 'admin', 'password': '123456'}
# JSON 数据
json_data = {'key': 'value'}

response = requests.post(
    'https://httpbin.org/post',
    data=data,         # 表单
    json=json_data     # JSON(二选一)
)
\`\`\`

### 4.5 Session 保持会话

\`\`\`python
import requests

# Session 可在多次请求间保持 cookies 和连接池
with requests.Session() as session:
    session.headers.update({'User-Agent': 'MyCrawler/1.0'})

    # 第一次请求(可能返回登录 cookie)
    session.get('https://httpbin.org/cookies/set/token=abc')

    # 第二次请求会自动带上 cookie
    response = session.get('https://httpbin.org/cookies')
    print(response.json())  # {'cookies': {'token': 'abc'}}
\`\`\`

## 五、HTML 解析:BeautifulSoup4

BeautifulSoup4 是 Python 最常用的 HTML 解析库。

### 5.1 安装

\`\`\`bash
pip install beautifulsoup4 lxml
\`\`\`

### 5.2 基础解析

\`\`\`python
from bs4 import BeautifulSoup  # 导入 BeautifulSoup

html = '''
<html>
  <body>
    <h1 class="title">标题</h1>
    <ul>
      <li class="item">项目一</li>
      <li class="item">项目二</li>
    </ul>
    <a href="https://example.com">链接</a>
  </body>
</html>
'''

# 创建解析对象,'lxml' 是解析器(快且容错)
soup = BeautifulSoup(html, 'lxml')

# find: 返回第一个匹配
h1 = soup.find('h1')
print(h1.text)            # 标题
print(h1['class'])       # ['title']

# find_all: 返回所有匹配
items = soup.find_all('li', class_='item')
for li in items:
    print(li.text)  # 项目一 / 项目二

# 提取属性
link = soup.find('a')
print(link['href'])  # https://example.com
\`\`\`

### 5.3 CSS 选择器

\`\`\`python
from bs4 import BeautifulSoup

soup = BeautifulSoup(html, 'lxml')

# select: CSS 选择器,返回列表
items = soup.select('li.item')       # class 选择器
title = soup.select_one('h1.title')  # 返回单个

# 嵌套选择
links = soup.select('ul li a')
\`\`\`

## 六、爬虫礼仪

### 6.1 限速(Rate Limiting)

\`\`\`python
import time
import requests
from random import uniform

urls = ['https://httpbin.org/get'] * 3

for url in urls:
    response = requests.get(url, timeout=10)
    print(response.status_code)
    # 每次请求间隔 1~2 秒(随机,避免规律性)
    time.sleep(uniform(1, 2))
\`\`\`

### 6.2 重试机制

\`\`\`python
import requests
from time import sleep

def fetch_with_retry(url, retries=3):
    """带重试的请求函数"""
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()  # 状态码非 2xx 抛异常
            return response
        except requests.RequestException as e:
            print(f'第 {attempt+1} 次失败: {e}')
            sleep(2 ** attempt)  # 指数退避:1s, 2s, 4s
    raise Exception(f'重试 {retries} 次后仍失败')

resp = fetch_with_retry('https://httpbin.org/get')
print(resp.status_code)
\`\`\`

### 6.3 User-Agent 与缓存

- **User-Agent**:用真实标识,最好留联系方式,方便站长联系
- **缓存**:对相同 URL 的结果做缓存,避免重复请求
- **并发**:控制并发数(线程池 / 异步),不暴力

\`\`\`python
import requests
import hashlib
import os

# 简易文件缓存
def cached_get(url, cache_dir='.cache'):
    os.makedirs(cache_dir, exist_ok=True)
    key = hashlib.md5(url.encode()).hexdigest()
    path = os.path.join(cache_dir, key)
    if os.path.exists(path):          # 命中缓存
        with open(path, 'r') as f:
            return f.read()

    response = requests.get(url, timeout=10)
    response.raise_for_status()
    with open(path, 'w') as f:        # 写入缓存
        f.write(response.text)
    return response.text

content = cached_get('https://httpbin.org/get')
\`\`\`

## 七、demo 汇总

### demo 1:requests 获取网页

\`\`\`python
import requests

def download(url):
    """下载网页内容"""
    headers = {'User-Agent': 'MyCrawler/1.0'}
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()        # 检查状态码
    response.encoding = response.apparent_encoding  # 自动识别编码
    return response.text

html = download('https://httpbin.org/html')
print(html[:200])  # 打印前 200 字符
\`\`\`

### demo 2:解析 robots.txt

\`\`\`python
import requests
from urllib.robotparser import RobotFileParser

def can_fetch(url, user_agent='MyCrawler'):
    """检查 robots.txt 是否允许抓取"""
    rp = RobotFileParser()
    # 拼接 robots.txt 地址
    robots_url = url.split('/')[0] + '//' + url.split('/')[2] + '/robots.txt'
    rp.set_url(robots_url)
    rp.read()                        # 读取并解析
    return rp.can_fetch(user_agent, url)

# 示例:检查是否允许抓取
print(can_fetch('https://www.baidu.com/'))
\`\`\`

### demo 3:BeautifulSoup 提取数据

\`\`\`python
from bs4 import BeautifulSoup
import requests

response = requests.get('https://httpbin.org/html', timeout=10)
soup = BeautifulSoup(response.text, 'lxml')

# 提取 h1 标题
h1 = soup.find('h1')
if h1:
    print('标题:', h1.text.strip())

# 提取所有段落
for p in soup.find_all('p'):
    print(p.text.strip())
\`\`\`

### demo 4:CSS 选择器

\`\`\`python
from bs4 import BeautifulSoup

html = '''
<div class="post">
  <h2 class="title">文章 A</h2>
  <p class="excerpt">摘要 A</p>
</div>
<div class="post">
  <h2 class="title">文章 B</h2>
  <p class="excerpt">摘要 B</p>
</div>
'''

soup = BeautifulSoup(html, 'lxml')

# 选择所有 post 下的 title
for title in soup.select('div.post h2.title'):
    print(title.text)

# 同时取 title 和 excerpt
for post in soup.select('div.post'):
    title = post.select_one('h2.title').text
    excerpt = post.select_one('p.excerpt').text
    print(f'标题: {title}, 摘要: {excerpt}')
\`\`\`

### demo 5:Session 保持会话

\`\`\`python
import requests

with requests.Session() as s:
    s.headers.update({'User-Agent': 'MyCrawler/1.0'})

    # 设置 cookie
    s.get('https://httpbin.org/cookies/set/session=abc123')

    # 后续请求自动带 cookie
    r = s.get('https://httpbin.org/cookies')
    print(r.json())  # {'cookies': {'session': 'abc123'}}
\`\`\`

### demo 6:限速与重试

\`\`\`python
import requests
import time
from random import uniform

class PoliteCrawler:
    """遵守礼仪的爬虫:限速 + 重试"""
    def __init__(self, delay=1.0, retries=3):
        self.delay = delay         # 最小间隔
        self.retries = retries

    def get(self, url):
        for attempt in range(self.retries):
            try:
                r = requests.get(url, timeout=10)
                r.raise_for_status()
                return r
            except requests.RequestException as e:
                print(f'重试 {attempt+1}: {e}')
                time.sleep(2 ** attempt)
            finally:
                time.sleep(uniform(self.delay, self.delay * 2))
        raise Exception('抓取失败')

crawler = PoliteCrawler(delay=1.0)
r = crawler.get('https://httpbin.org/get')
print(r.status_code)
\`\`\`

## 八、遵守规则的爬虫设计原则

1. **先看 robots.txt**:用 \`urllib.robotparser\` 检查
2. **设置 User-Agent**:真实标识 + 联系方式
3. **限速**:每次请求间隔 1~3 秒
4. **重试**:指数退避,最多 3 次
5. **超时**:必填 timeout,避免卡死
6. **缓存**:避免重复请求
7. **遵守 ToS**:不抓私密数据,不绕反爬

> 一句话:**己所不欲,勿施于人**——把对方服务器当自己的服务器对待。`
  },
  {
    id: 'pyproject-crawler-impl',
    icon: '📰',
    title: '实战:新闻聚合爬虫(完整实现)',
    group: '网络与数据采集',
    content: `# 实战:新闻聚合爬虫(完整实现)

本章实现一个完整的新闻聚合爬虫:抓取多个站点 → 解析标题/正文/时间 → 去重 → 存储 SQLite。采用**管道模式** + **适配器模式**。

## 一、项目需求

- 抓取多个新闻站点的列表页与详情页
- 提取字段:标题、正文、发布时间、URL、来源
- URL 去重,避免重复入库
- 存储到 SQLite,可导出 JSON
- 遵守礼仪:限速、重试、robots.txt

## 二、架构设计:管道模式

\`\`\`
调度器(Scheduler)
   ↓ URL 队列
下载器(Downloader)
   ↓ HTML 文本
解析器(Parser,多站点适配器)
   ↓ NewsItem 数据对象
存储器(Storage)→ SQLite / JSON
\`\`\`

- **调度器**:管理待抓 URL,去重
- **下载器**:封装 requests,带重试限速
- **解析器**:抽象基类 + 各站点子类(适配器模式)
- **存储器**:SQLite 持久化

## 三、数据模型:NewsItem

\`\`\`python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class NewsItem:
    """新闻条目数据模型"""
    title: str                          # 标题
    url: str                            # 原文 URL
    content: str = ''                   # 正文
    published_at: Optional[datetime] = None  # 发布时间
    source: str = ''                    # 来源(站点名)
    crawled_at: datetime = field(default_factory=datetime.now)  # 抓取时间

    def to_dict(self):
        return {
            'title': self.title,
            'url': self.url,
            'content': self.content,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'source': self.source,
            'crawled_at': self.crawled_at.isoformat(),
        }
\`\`\`

## 四、下载器:带重试限速

\`\`\`python
import requests
import time
from random import uniform
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse

class Downloader:
    """遵守礼仪的下载器"""
    def __init__(self, delay=1.0, retries=3, user_agent='NewsBot/1.0'):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': user_agent})
        self.delay = delay
        self.retries = retries
        self.robots = {}  # 缓存各站点 robots 解析器

    def can_fetch(self, url):
        """检查 robots.txt"""
        parsed = urlparse(url)
        domain = f'{parsed.scheme}://{parsed.netloc}'
        if domain not in self.robots:
            rp = RobotFileParser()
            rp.set_url(f'{domain}/robots.txt')
            try:
                rp.read()
            except Exception:
                pass  # 没有 robots.txt 默认允许
            self.robots[domain] = rp
        return self.robots[domain].can_fetch('NewsBot', url)

    def fetch(self, url):
        """下载页面,返回 HTML 文本"""
        if not self.can_fetch(url):
            print(f'[robots] 禁止抓取: {url}')
            return None

        for attempt in range(self.retries):
            try:
                r = self.session.get(url, timeout=10)
                r.raise_for_status()
                r.encoding = r.apparent_encoding  # 自动编码
                return r.text
            except requests.RequestException as e:
                print(f'重试 {attempt+1}: {e}')
                time.sleep(2 ** attempt)
            finally:
                time.sleep(uniform(self.delay, self.delay * 2))
        return None
\`\`\`

## 五、解析器:适配器模式

### 5.1 抽象基类

\`\`\`python
from abc import ABC, abstractmethod
from bs4 import BeautifulSoup

class BaseParser(ABC):
    """解析器抽象基类"""
    def __init__(self, source_name):
        self.source_name = source_name

    @abstractmethod
    def parse_list(self, html):
        """解析列表页,返回详情 URL 列表"""
        pass

    @abstractmethod
    def parse_detail(self, html, url):
        """解析详情页,返回 NewsItem"""
        pass
\`\`\`

### 5.2 示例适配器

\`\`\`python
from bs4 import BeautifulSoup
from datetime import datetime

class ExampleParser(BaseParser):
    """示例站点适配器"""
    def __init__(self):
        super().__init__('example.com')

    def parse_list(self, html):
        """从列表页提取详情链接"""
        soup = BeautifulSoup(html, 'lxml')
        urls = []
        for a in soup.select('a.news-link'):    # 列表页链接
            href = a.get('href')
            if href:
                urls.append(href)
        return urls

    def parse_detail(self, html, url):
        """从详情页提取新闻字段"""
        soup = BeautifulSoup(html, 'lxml')
        title_tag = soup.select_one('h1.article-title')
        content_tag = soup.select_one('div.article-body')
        time_tag = soup.select_one('time')

        title = title_tag.text.strip() if title_tag else '无标题'
        content = content_tag.text.strip() if content_tag else ''
        published = None
        if time_tag and time_tag.get('datetime'):
            published = datetime.fromisoformat(time_tag['datetime'])

        return NewsItem(
            title=title,
            url=url,
            content=content,
            published_at=published,
            source=self.source_name,
        )
\`\`\`

## 六、存储器:SQLite + 去重

\`\`\`python
import sqlite3
import json

class Storage:
    """SQLite 存储器,自带 URL 去重"""
    def __init__(self, db_path='news.db'):
        self.conn = sqlite3.connect(db_path)
        self._init_db()

    def _init_db(self):
        """建表(URL 唯一)"""
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT UNIQUE NOT NULL,       -- UNIQUE 实现去重
                content TEXT,
                published_at TEXT,
                source TEXT,
                crawled_at TEXT
            )
        ''')
        self.conn.commit()

    def save(self, item):
        """插入一条新闻,URL 重复则忽略"""
        try:
            self.conn.execute('''
                INSERT OR IGNORE INTO news (title, url, content, published_at, source, crawled_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (item.title, item.url, item.content,
                item.published_at.isoformat() if item.published_at else None,
                item.source, item.crawled_at.isoformat()))
            self.conn.commit()
            return True  # 新增成功
        except sqlite3.IntegrityError:
            return False  # URL 已存在

    def export_json(self, path='news.json'):
        """导出为 JSON"""
        rows = self.conn.execute('SELECT * FROM news').fetchall()
        items = [{'title': r[1], 'url': r[2], 'content': r[3],
                  'published_at': r[4], 'source': r[5], 'crawled_at': r[6]}
                 for r in rows]
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        return len(items)

    def count(self):
        return self.conn.execute('SELECT COUNT(*) FROM news').fetchone()[0]

    def close(self):
        self.conn.close()
\`\`\`

## 七、调度器与完整管道

\`\`\`python
from typing import List, Dict

class Scheduler:
    """调度器:管理 URL 队列,去重"""
    def __init__(self):
        self.pending = []    # 待抓
        self.seen = set()     # 已抓 URL

    def add_urls(self, urls):
        """添加 URL,自动去重"""
        for url in urls:
            if url not in self.seen:
                self.pending.append(url)
                self.seen.add(url)

    def next(self):
        """取出下一个 URL"""
        if self.pending:
            return self.pending.pop(0)
        return None

    def has_more(self):
        return len(self.pending) > 0


class NewsPipeline:
    """完整爬虫管道"""
    def __init__(self, parsers: Dict[str, BaseParser], storage: Storage, downloader: Downloader):
        self.parsers = parsers   # {source: parser}
        self.storage = storage
        self.downloader = downloader

    def run(self, seed_urls: Dict[str, List[str]]):
        """运行管道
        seed_urls: {source: [list_url1, list_url2, ...]}
        """
        for source, list_urls in seed_urls.items():
            parser = self.parsers.get(source)
            if not parser:
                continue
            print(f'=== 抓取 {source} ===')
            for list_url in list_urls:
                list_html = self.downloader.fetch(list_url)
                if not list_html:
                    continue
                # 解析列表页,得到详情 URL
                detail_urls = parser.parse_list(list_html)
                for detail_url in detail_urls:
                    detail_html = self.downloader.fetch(detail_url)
                    if not detail_html:
                        continue
                    item = parser.parse_detail(detail_html, detail_url)
                    if item:
                        self.storage.save(item)
                        print(f'已保存: {item.title}')
        print(f'共存储 {self.storage.count()} 条新闻')
\`\`\`

## 八、demo 汇总

### demo 1:单站点抓取

\`\`\`python
# 使用 ExampleParser 抓取单个站点
downloader = Downloader(delay=1.0)
parser = ExampleParser()

html = downloader.fetch('https://example.com/news')
urls = parser.parse_list(html)
print(f'发现 {len(urls)} 条详情')

for url in urls[:3]:
    detail = downloader.fetch(url)
    item = parser.parse_detail(detail, url)
    print(item.title)
\`\`\`

### demo 2:多站点抓取

\`\`\`python
parsers = {
    'example.com': ExampleParser(),
    # 'news.com': NewsComParser(),  # 其他站点适配器
}

pipeline = NewsPipeline(parsers, storage, downloader)
seed_urls = {
    'example.com': ['https://example.com/news?page=1'],
}
pipeline.run(seed_urls)
\`\`\`

### demo 3:去重逻辑(基于 URL)

\`\`\`python
storage = Storage(':memory:')  # 内存数据库
item1 = NewsItem(title='A', url='https://x.com/1')
item2 = NewsItem(title='A', url='https://x.com/1')  # 相同 URL

print(storage.save(item1))  # True(新增)
print(storage.save(item2))  # False(去重,忽略)
print(storage.count())      # 1
\`\`\`

### demo 4:存储到 SQLite

\`\`\`python
storage = Storage('news.db')
storage.save(NewsItem(title='测试新闻', url='https://x.com/1', content='正文', source='test'))
# 查看存储
for row in storage.conn.execute('SELECT title, url FROM news'):
    print(row)
storage.close()
\`\`\`

### demo 5:导出 JSON

\`\`\`python
storage = Storage('news.db')
count = storage.export_json('news.json')
print(f'导出 {count} 条到 news.json')
storage.close()
\`\`\`

### demo 6:完整管道运行

\`\`\`python
# 组装并运行完整管道
downloader = Downloader(delay=1.0, user_agent='NewsBot/1.0')
storage = Storage('news.db')
parsers = {'example.com': ExampleParser()}
pipeline = NewsPipeline(parsers, storage, downloader)

seed = {'example.com': ['https://example.com/news']}
pipeline.run(seed)

storage.export_json('news.json')
storage.close()
\`\`\`

## 九、反爬应对策略(尊重网站)

- **限速**:控制请求频率,别暴力
- **重试**:指数退避
- **User-Agent**:真实标识,别伪装
- **不绕反爬**:验证码、JS 渲染该停就停
- **优先用 API**:很多站点提供 RSS / Open API,优先使用
- **缓存**:避免重复请求

> 关键原则:**尊重对方**,做长期可持续的爬虫。`
  },
  {
    id: 'pyproject-api-arch',
    icon: '🌐',
    title: 'RESTful API 服务:设计原则与框架',
    group: '网络与数据采集',
    content: `# RESTful API 服务:设计原则与框架

本章讲解 RESTful API 设计原则、HTTP 语义,以及 FastAPI 框架基础。

## 一、RESTful API 设计原则

### 1.1 什么是 REST

REST(Representational State Transfer)是一种 Web 服务架构风格。核心:**资源导向**,用 HTTP 方法表达操作。

### 1.2 六大原则(简述)

1. **客户端-服务端分离**:前后端独立
2. **无状态**:每个请求自包含,服务器不存会话
3. **可缓存**:响应可标记是否可缓存
4. **统一接口**:URL 表达资源,HTTP 表达动作
5. **分层系统**:可加代理、负载均衡
6. **按需代码**(可选):服务端可下发可执行代码

### 1.3 资源导向的 URL 设计

❌ 动作导向:\`/getUser?id=1\`、\`/createUser\`
✅ 资源导向:\`/users/1\`、\`/users\`(POST 创建)

| 操作 | URL | 方法 |
|------|-----|------|
| 列表 | \`/users\` | GET |
| 详情 | \`/users/{id}\` | GET |
| 创建 | \`/users\` | POST |
| 全量更新 | \`/users/{id}\` | PUT |
| 部分更新 | \`/users/{id}\` | PATCH |
| 删除 | \`/users/{id}\` | DELETE |

### 1.4 URL 设计规范

- 名词复数:\`/users\` 不是 \`/user\`
- 层级表达关系:\`/users/{id}/posts\`
- 查询参数过滤:\`/users?role=admin&page=2\`
- 版本化:\`/api/v1/users\`

## 二、HTTP 方法与 CRUD 映射

| HTTP 方法 | CRUD | 语义 | 幂等 | 安全 |
|-----------|------|------|------|------|
| GET | Read | 获取资源 | 是 | 是 |
| POST | Create | 创建资源 | 否 | 否 |
| PUT | Update | 全量替换 | 是 | 否 |
| PATCH | Update | 部分更新 | 否 | 否 |
| DELETE | Delete | 删除 | 是 | 否 |

- **幂等**:多次执行结果相同(GET、PUT、DELETE)
- **安全**:不改变服务器状态(GET)

## 三、状态码规范

### 3.1 常用状态码

| 码 | 类别 | 含义 |
|------|------|------|
| 200 | 2xx 成功 | OK |
| 201 | 2xx 成功 | Created(POST 创建成功) |
| 204 | 2xx 成功 | No Content(DELETE 成功) |
| 400 | 4xx 客户端错误 | 请求格式错误 |
| 401 | 4xx | 未认证(没登录) |
| 403 | 4xx | 无权限 |
| 404 | 4xx | 资源不存在 |
| 409 | 4xx | 冲突(重复创建) |
| 422 | 4xx | 实体校验失败 |
| 500 | 5xx 服务端错误 | 服务器内部错误 |
| 502 | 5xx | 网关错误 |
| 503 | 5xx | 服务不可用 |

### 3.2 统一响应格式

\`\`\`json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
\`\`\`

## 四、Flask vs FastAPI 对比

| 特性 | Flask | FastAPI |
|------|-------|---------|
| 异步支持 | 需 async 扩展 | 原生 async |
| 类型提示 | 不强求 | 必需(Pydantic) |
| 自动文档 | 需 flask-restx | 内置 Swagger |
| 性能 | 中 | 高(接近 Go) |
| 学习曲线 | 平缓 | 略陡 |
| 生态 | 极丰富 | 快速增长 |

> 推荐:新项目选 **FastAPI**,类型安全 + 自动文档 + 高性能。

## 五、FastAPI 基础

### 5.1 安装

\`\`\`bash
pip install fastapi uvicorn
\`\`\`

- \`fastapi\`:框架
- \`uvicorn\`:ASGI 服务器,运行 FastAPI

### 5.2 第一个接口

\`\`\`python
from fastapi import FastAPI  # 导入 FastAPI

app = FastAPI()  # 创建应用实例

@app.get('/')                  # 路由:GET /
def root():
    return {'message': 'Hello'}  # FastAPI 自动转 JSON

# 启动:uvicorn main:app --reload
\`\`\`

### 5.3 路径参数

\`\`\`python
@app.get('/users/{user_id}')           # {user_id} 路径参数
def get_user(user_id: int):            # 类型提示:int
    return {'user_id': user_id, 'type': type(user_id).__name__}
# /users/1  → {"user_id": 1, "type": "int"}
# /users/abc → 422 错误(类型不符)
\`\`\`

### 5.4 查询参数

\`\`\`python
from typing import Optional

@app.get('/users')
def list_users(
    page: int = 1,                    # 默认 1
    size: int = 10,                   # 默认 10
    role: Optional[str] = None,       # 可选
):
    return {'page': page, 'size': size, 'role': role}
# /users?page=2&size=20&role=admin
\`\`\`

### 5.5 请求体(Pydantic)

\`\`\`python
from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):         # Pydantic 模型
    name: str                         # 必填
    email: str                       # 必填
    age: Optional[int] = None         # 可选

@app.post('/users', status_code=201) # POST,默认 201
def create_user(user: UserCreate):   # 自动校验请求体
    return {'created': user.dict()}
\`\`\`

### 5.6 响应模型

\`\`\`python
class UserOut(BaseModel):
    id: int
    name: str
    email: str

@app.get('/users/{user_id}', response_model=UserOut)
def get_user(user_id: int):
    return {'id': user_id, 'name': 'Alice', 'email': 'a@x.com', 'secret': '...'}
# response_model 会自动过滤 secret 字段
\`\`\`

### 5.7 错误处理

\`\`\`python
from fastapi import HTTPException

@app.get('/users/{user_id}')
def get_user(user_id: int):
    if user_id < 1:
        raise HTTPException(status_code=404, detail='用户不存在')
    return {'user_id': user_id}
\`\`\`

## 六、API 版本化与文档

### 6.1 版本化

\`\`\`python
app = FastAPI()

# 在 URL 中带版本号
@app.get('/api/v1/users')
def list_users_v1():
    return [{'id': 1, 'name': 'v1'}]

@app.get('/api/v2/users')
def list_users_v2():
    return [{'id': 1, 'name': 'v2', 'email': '...'}]  # v2 增字段
\`\`\`

### 6.2 自动文档(Swagger / OpenAPI)

FastAPI 自动生成:
- \`/docs\`:Swagger UI(交互式)
- \`/redoc\`:ReDoc(只读文档)
- \`/openapi.json\`:OpenAPI 规范

\`\`\`python
app = FastAPI(
    title='任务管理 API',
    description='RESTful 任务管理服务',
    version='1.0.0',
)
\`\`\`

## 七、demo 汇总

### demo 1:FastAPI 第一个接口

\`\`\`python
from fastapi import FastAPI

app = FastAPI()

@app.get('/')
def root():
    return {'message': 'Hello, FastAPI'}

@app.get('/health')
def health():
    return {'status': 'ok'}
# 启动:uvicorn main:app --reload --port 8000
\`\`\`

### demo 2:路径参数

\`\`\`python
@app.get('/items/{item_id}')
def get_item(item_id: int):    # 自动类型校验
    return {'item_id': item_id}

@app.get('/files/{file_path:path}')  # 接受 / 的路径
def get_file(file_path: str):
    return {'path': file_path}
\`\`\`

### demo 3:Pydantic 请求体验证

\`\`\`python
from pydantic import BaseModel, EmailStr

class CreateUser(BaseModel):
    name: str                    # 必填
    email: EmailStr              # 邮箱格式校验
    age: int = 18                # 默认 18

@app.post('/users', status_code=201)
def create_user(user: CreateUser):
    # FastAPI 已校验 name 必填、email 格式、age 是 int
    return {'id': 1, **user.dict()}
\`\`\`

### demo 4:查询参数

\`\`\`python
from typing import Optional

@app.get('/users')
def list_users(
    page: int = 1,            # 默认页码
    size: int = 10,           # 默认每页
    q: Optional[str] = None,  # 搜索关键字
):
    return {'page': page, 'size': size, 'q': q}
\`\`\`

### demo 5:错误处理

\`\`\`python
from fastapi import HTTPException

@app.get('/users/{user_id}')
def get_user(user_id: int):
    if user_id <= 0:
        raise HTTPException(400, 'user_id 必须为正整数')
    users = {1: 'Alice', 2: 'Bob'}
    if user_id not in users:
        raise HTTPException(404, '用户不存在')
    return {'user_id': user_id, 'name': users[user_id]}
\`\`\`

### demo 6:自动文档

\`\`\`python
from fastapi import FastAPI

app = FastAPI(
    title='示例 API',
    version='1.0.0',
    description='访问 /docs 看 Swagger,/redoc 看 ReDoc'
)

@app.get('/hello', summary='问好', description='返回问候语')
def hello():
    return {'msg': 'hello'}
# 启动后访问 http://localhost:8000/docs
\`\`\`

## 八、设计原则总结

1. **资源导向**:URL 用名词,HTTP 表达动作
2. **统一接口**:一致的 URL、状态码、响应格式
3. **无状态**:不依赖服务端会话
4. **版本化**:\`/api/v1/\` 前缀
5. **类型安全**:用 Pydantic 校验输入输出
6. **文档先行**:OpenAPI 自动生成,前后端对齐
7. **合理状态码**:用标准 HTTP 状态码
8. **错误结构统一**:{code, message, data}

> 一句话:**让 API 自己说话**——URL 表达意图,状态码表达结果,文档自动生成。`
  },
  {
    id: 'pyproject-api-impl',
    icon: '✅',
    title: '实战:任务管理 RESTful API(完整实现)',
    group: '网络与数据采集',
    content: `# 实战:任务管理 RESTful API(完整实现)

本章实现一个完整的任务管理 API:CRUD + JWT 认证 + 中间件 + SQLite 存储。基于 FastAPI + Pydantic + SQLAlchemy。

## 一、项目需求

- 任务 CRUD:创建、查询、更新、删除
- 用户认证:JWT 登录、token 校验
- 列表分页、状态过滤
- 中间件:CORS、日志、异常处理
- SQLite 持久化(SQLAlchemy)
- 完整、可运行、可测试

## 二、数据模型:Task / User

\`\`\`python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# ---- 请求模型 ----
class TaskCreate(BaseModel):
    """创建任务"""
    title: str                          # 标题(必填)
    description: Optional[str] = None   # 描述(可选)

class TaskUpdate(BaseModel):
    """更新任务(部分字段)"""
    title: Optional[str] = None
    description: Optional[str] = None
    done: Optional[bool] = None

# ---- 响应模型 ----
class TaskOut(BaseModel):
    """任务响应(过滤内部字段)"""
    id: int
    title: str
    description: Optional[str]
    done: bool
    created_at: datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str

class Token(BaseModel):
    access_token: str
    token_type: str = 'bearer'
\`\`\`

## 三、数据层:SQLite + SQLAlchemy

\`\`\`python
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# SQLite 数据库(本地文件)
engine = create_engine('sqlite:///tasks.db', connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class Task(Base):
    """任务表 ORM 模型"""
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, default='')
    done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    """用户表"""
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)    # 存哈希,不存明文

# 建表
Base.metadata.create_all(engine)
\`\`\`

## 四、JWT 认证

### 4.1 密码哈希

\`\`\`python
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')

def hash_password(p: str) -> str:
    return pwd_ctx.hash(p)

def verify_password(p: str, hashed: str) -> bool:
    return pwd_ctx.verify(p, hashed)
\`\`\`

### 4.2 JWT 生成与校验

\`\`\`python
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = 'your-secret-key-change-me'  # 生产环境必须改
ALGORITHM = 'HS256'
TOKEN_EXPIRE_MINUTES = 60

def create_token(user_id: int) -> str:
    """生成 JWT"""
    payload = {
        'sub': str(user_id),        # 用户 ID
        'exp': datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> int:
    """解码 JWT,返回 user_id"""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return int(payload['sub'])
\`\`\`

### 4.3 认证依赖

\`\`\`python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/login')

def get_current_user(token: str = Depends(oauth2_scheme)) -> int:
    """依赖注入:从 token 解出 user_id"""
    try:
        user_id = decode_token(token)
    except Exception:
        raise HTTPException(401, '无效的 token')
    return user_id
\`\`\`

## 五、FastAPI 路由:完整 CRUD

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

# 依赖:获取数据库 session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI(title='任务管理 API', version='1.0.0')

# ---- 用户注册/登录 ----
@app.post('/register', response_model=UserOut, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter_by(username=user.username).first():
        raise HTTPException(409, '用户名已存在')
    u = User(username=user.username, password_hash=hash_password(user.password))
    db.add(u); db.commit(); db.refresh(u)
    return u

@app.post('/login', response_model=Token)
def login(user: UserCreate, db: Session = Depends(get_db)):
    u = db.query(User).filter_by(username=user.username).first()
    if not u or not verify_password(user.password, u.password_hash):
        raise HTTPException(401, '用户名或密码错误')
    return Token(access_token=create_token(u.id))

# ---- 任务 CRUD ----
@app.post('/tasks', response_model=TaskOut, status_code=201)
def create_task(
    task: TaskCreate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = Task(title=task.title, description=task.description or '')
    db.add(t); db.commit(); db.refresh(t)
    return t

@app.get('/tasks', response_model=List[TaskOut])
def list_tasks(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    done: Optional[bool] = None,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Task)
    if done is not None:
        q = q.filter(Task.done == done)
    # 分页:offset 跳过,(page-1)*size 条
    return q.offset((page-1)*size).limit(size).all()

@app.get('/tasks/{task_id}', response_model=TaskOut)
def get_task(
    task_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Task).get(task_id)
    if not t:
        raise HTTPException(404, '任务不存在')
    return t

@app.put('/tasks/{task_id}', response_model=TaskOut)
def update_task(
    task_id: int,
    data: TaskUpdate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Task).get(task_id)
    if not t:
        raise HTTPException(404, '任务不存在')
    # 仅更新非 None 字段
    for k, v in data.dict(exclude_unset=True).items():
        setattr(t, k, v)
    db.commit(); db.refresh(t)
    return t

@app.delete('/tasks/{task_id}', status_code=204)
def delete_task(
    task_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(Task).get(task_id)
    if not t:
        raise HTTPException(404, '任务不存在')
    db.delete(t); db.commit()
\`\`\`

## 六、中间件:CORS、日志、异常处理

\`\`\`python
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
import logging
import time

# CORS:允许前端跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],         # 生产环境改具体域名
    allow_methods=['*'],
    allow_headers=['*'],
    allow_credentials=True,
)

# 日志中间件
@app.middleware('http')
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    logging.info(f'{request.method} {request.url.path} → {response.status_code} ({duration:.0f}ms)')
    return response

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception(request: Request, exc: Exception):
    logging.exception(f'未处理异常: {exc}')
    return JSONResponse(status_code=500, content={'detail': '服务器内部错误'})
\`\`\`

## 七、demo 汇总

### demo 1:创建任务

\`\`\`python
# 用 TestClient 测试(无需启动服务)
from fastapi.testclient import TestClient
client = TestClient(app)

# 先注册登录拿 token
client.post('/register', json={'username': 'alice', 'password': '123456'})
r = client.post('/login', json={'username': 'alice', 'password': '123456'})
token = r.json()['access_token']

# 创建任务
headers = {'Authorization': f'Bearer {token}'}
r = client.post('/tasks', json={'title': '学 FastAPI', 'description': '完成教程'}, headers=headers)
print(r.json())  # {'id': 1, 'title': '学 FastAPI', ...}
\`\`\`

### demo 2:查询列表(分页)

\`\`\`python
r = client.get('/tasks?page=1&size=10', headers=headers)
print(r.json())  # [{...}, ...]

# 按状态过滤
r = client.get('/tasks?done=false', headers=headers)
\`\`\`

### demo 3:更新任务

\`\`\`python
# 部分更新:标记完成
r = client.put('/tasks/1', json={'done': True}, headers=headers)
print(r.json()['done'])  # True
\`\`\`

### demo 4:删除任务

\`\`\`python
r = client.delete('/tasks/1', headers=headers)
print(r.status_code)  # 204
\`\`\`

### demo 5:JWT 认证流程

\`\`\`python
# 1. 注册
client.post('/register', json={'username': 'bob', 'password': 'pw'})

# 2. 登录拿 token
r = client.post('/login', json={'username': 'bob', 'password': 'pw'})
token = r.json()['access_token']

# 3. 无 token 访问 → 401
assert client.get('/tasks').status_code == 401

# 4. 带 token 访问 → 200
assert client.get('/tasks', headers={'Authorization': f'Bearer {token}'}).status_code == 200
\`\`\`

### demo 6:完整 API 运行

\`\`\`bash
# 安装依赖
pip install fastapi uvicorn sqlalchemy python-jose passlib[bcrypt] pydantic[email]

# 启动服务(开发模式,自动重载)
uvicorn main:app --reload --port 8000

# 浏览器访问文档
# http://localhost:8000/docs
\`\`\`

## 八、测试建议(TestClient)

\`\`\`python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_register_and_login():
    r = client.post('/register', json={'username': 'test', 'password': '123'})
    assert r.status_code == 201
    r = client.post('/login', json={'username': 'test', 'password': '123'})
    assert r.status_code == 200
    assert 'access_token' in r.json()

def test_task_crud():
    # 登录
    token = client.post('/login', json={'username': 'test', 'password': '123'}).json()['access_token']
    h = {'Authorization': f'Bearer {token}'}

    # 创建
    r = client.post('/tasks', json={'title': '测试'}, headers=h)
    assert r.status_code == 201
    tid = r.json()['id']

    # 查询
    assert client.get(f'/tasks/{tid}', headers=h).status_code == 200

    # 更新
    assert client.put(f'/tasks/{tid}', json={'done': True}, headers=h).status_code == 200

    # 删除
    assert client.delete(f'/tasks/{tid}', headers=h).status_code == 204

if __name__ == '__main__':
    test_register_and_login()
    test_task_crud()
    print('✅ 所有测试通过')
\`\`\`

## 九、总结

完整 API 包含:
- ✅ CRUD 端点(7 个路由)
- ✅ JWT 认证(注册、登录、依赖注入)
- ✅ Pydantic 请求/响应模型
- ✅ SQLAlchemy + SQLite 持久化
- ✅ 中间件:CORS、日志、异常
- ✅ 自动文档(/docs)
- ✅ TestClient 测试

> 生产化建议:换 PostgreSQL、加 rate limit、加 refresh token、密码加盐、配置中心管理 SECRET_KEY。`
  }
];

