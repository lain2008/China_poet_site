# 中国现代诗人相似度匹配测试

将静态的诗人匹配测试 HTML 改造为 Flask 动态网站，支持外网不间断访问。

## 功能

- **64题匹配测试**：通过64道题目计算与10位中国现代诗人的相似度
- **诗歌评析**：提交原创诗歌，基于关键词和风格特征分析匹配诗人（后端 API + SQLite 持久化）
- **数据统计**：热门匹配诗人排名

## 快速启动

### 方式一：启动器菜单（推荐）

双击 `start.bat`，选择：
- `1` — 本地模式（访问 http://localhost:8080）
- `2` — 外网模式（启动后等 Cloudflare 生成公网地址）
- `3` — 退出

### 方式二：命令行

```powershell
# 本地访问
A:\vibe\tool\flask_env\Scripts\python.exe A:\vibe\code\poet_site\app.py
```

```powershell
# 外网访问（先启动后端，再开隧道）
# 终端1：启动后端
A:\vibe\tool\flask_env\Scripts\python.exe A:\vibe\code\poet_site\app.py

# 终端2：启动 Cloudflare 隧道（生成公网地址）
A:\vibe\tool\cloudflared\cloudflared.exe tunnel --url http://localhost:8080
```

## 外网访问说明

使用 **Cloudflare Tunnel**（免费、稳定、不限连接数）：

1. 启动后终端会显示 `https://xxxxx.trycloudflare.com`
2. 把这个网址分享给任何人，对方即可访问
3. 关掉隧道后地址失效，下次重新生成

> 相比 ngrok：Cloudflare 免费版不限流量、不限连接数、更稳定

## 生产服务器

使用 **waitress**（已安装）替代 Flask 开发服务器：
- 多线程并发，支持多人同时访问
- 比 Flask 自带服务器更稳定
- 默认使用 waitress 启动（设置环境变量 `WAITRESS=false` 可切换回 Flask 开发服务器）

## 项目结构

```
poet_site/
├── app.py                       # Flask 主入口（waitress 生产模式）
├── requirements.txt             # Python 依赖
├── README.md                    # 使用说明
├── start.bat                    # 一键启动菜单
├── start-online.ps1             # PowerShell 外网启动脚本
├── static/
│   ├── css/style.css            # 前端样式
│   ├── js/main.js               # 前端逻辑（含调试后门 Ctrl+Shift+D）
│   └── images/poets/*.webp      # 诗人头像（10位，中文名）
├── templates/index.html         # 页面模板
├── database/poets.db            # SQLite 数据库（自动生成）
└── utils/
    ├── __init__.py
    ├── database.py              # 数据库初始化与操作
    └── poem_analyzer.py         # 诗歌分析核心逻辑
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | / | 主页面 |
| POST | /api/analyze | 诗歌分析（body: `{"poem": "..."}`） |
| GET  | /api/poets | 获取诗人列表 |
| GET  | /api/stats | 获取热门匹配统计 |

## 调试

在页面按 **Ctrl+Shift+D** 打开调试面板，可查看每题作答和诗人得分。

## 数据库管理

```powershell
# 查看分析日志数
A:\vibe\tool\flask_env\Scripts\python.exe -c "import sqlite3; conn=sqlite3.connect('A:\vibe\code\poet_site\database\poets.db'); print(conn.execute('SELECT COUNT(*) FROM analysis_logs').fetchone()[0], '条记录')"
```
