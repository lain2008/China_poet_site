# 中国现代诗人相似度匹配测试

将静态 HTML 诗人匹配测试改造为 Flask 动态网站，部署至公网可访问。

在线体验：[lain2008.pythonanywhere.com](https://lain2008.pythonanywhere.com)

## 功能

- **64题匹配测试**：通过64道题目计算与10位中国现代诗人的相似度
- **诗歌评析**：提交原创诗歌，基于关键词和风格特征分析匹配诗人（后端 API + SQLite 持久化）
- **数据统计**：热门匹配诗人排名
- **调试后门**：页面按 `Ctrl+Shift+D` 查看答题详情与得分

## 完整搭建过程

### 1. 本地环境搭建

```powershell
# 安装 Python 3.10+，创建虚拟环境
python -m venv venv
venv\Scripts\activate

# 安装依赖
pip install flask flask-cors gunicorn

# 启动（开发模式）
python app.py
# 访问 http://localhost:8080
```

### 2. 项目结构

```
poet_site/
├── app.py                       # Flask 主入口 + Waitress/Gunicorn 生产模式
├── requirements.txt             # Python 依赖
├── README.md                    # 本文件
├── start.bat                    # 本地一键启动菜单
├── start-online.ps1             # Cloudflare 隧道外网启动脚本
├── static/
│   ├── css/style.css            # 前端样式
│   ├── js/main.js               # 前端逻辑（64题测试 + 诗歌评析 + 调试后门）
│   └── images/poets/*.webp      # 诗人头像（中文文件名，10位）
├── templates/index.html         # Jinja2 页面模板
├── database/poets.db            # SQLite 数据库（首次启动自动生成）
└── utils/
    ├── __init__.py
    ├── database.py              # 数据库初始化、诗人种子数据、日志与统计
    └── poem_analyzer.py         # 诗歌分析引擎（关键词+风格特征匹配）
```

### 3. 部署到 PythonAnywhere（免费）

#### 3.1 注册与准备

1. 访问 [pythonanywhere.com](https://www.pythonanywhere.com) 注册免费账号
2. 打开 **Bash 控制台**（Dashboard → Open Bash console here）

#### 3.2 克隆代码与安装依赖

```bash
git clone https://github.com/lain2008/China_poet_site.git
cd China_poet_site
python3.10 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

#### 3.3 配置 Web 应用

1. 点击 **Web** 标签 → **Add a new web app**
2. 选择 **Manual configuration** → Python **3.10**
3. 配置：
   - **Source code**: `/home/lain2008/China_poet_site`
   - **Virtualenv**: `/home/lain2008/China_poet_site/venv`
   - **WSGI file**: 打开编辑，内容替换为：

```python
import sys
sys.path.insert(0, '/home/lain2008/China_poet_site')
from app import app as application
```

4. 点 **Reload**，访问 `https://你的用户名.pythonanywhere.com`

### 4. 数据文件持久化

PythonAnywhere 免费版的文件系统是持久的，SQLite 数据库 (`database/poets.db`) 和分析日志不会丢失。

若需重置数据库：`rm ~/China_poet_site/database/poets.db`，重启应用后自动重建。

## 开发循环方案

```
本地修改代码 → git commit + push → 服务器 pull + reload
```

### 完整流程

```bash
# 本地
cd A:\vibe\code\poet_site
# 修改代码...
git add -A
git commit -m "修改说明"
git push

# PythonAnywhere 控制台
cd ~/China_poet_site
git pull
. venv/bin/activate
pip install -r requirements.txt  # 如果有新依赖
# 回到 Web 页面 → Reload
```

### 更新后端依赖

```bash
# 本地
pip freeze > requirements.txt
git add -A && git commit -m "update deps" && git push

# 服务器
cd ~/China_poet_site && git pull && . venv/bin/activate && pip install -r requirements.txt
# Reload web app
```

### 更新前端（CSS/JS/HTML）

前端文件不需要 reload 服务器，PythonAnywhere 会自动服务最新文件。但后端代码修改后必须手动点击 **Reload**。

### 快速定位

| 场景 | 操作 |
|------|------|
| 修改了 app.py 或 utils/ | git push → 服务器 pull → Reload |
| 修改了 static/ 或 templates/ | git push → 服务器 pull（无需 Reload） |
| 新增了 Python 依赖 | git push → 服务器 pull → pip install → Reload |
| 新增了静态文件（图片等） | git push → 服务器 pull |
| 数据库需要重置 | 服务器删 db 文件 → Reload |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | / | 主页面 |
| POST | /api/analyze | 诗歌分析（body: `{"poem": "..."}`） |
| GET  | /api/poets | 获取诗人列表 |
| GET  | /api/stats | 获取热门匹配统计 |

## 技术栈

- **后端**: Python 3.10+, Flask, Gunicorn (生产), SQLite
- **前端**: 原生 JavaScript, CSS3, Jinja2 模板
- **部署**: GitHub → PythonAnywhere (Free Tier)
- **头像**: WebP 格式（中文文件名，通过 encodeURIComponent 访问）

## 注意事项

- PythonAnywhere 免费版有 CPU/内存/流量限制，个人使用足够
- 若长时间无访问，免费版应用会进入休眠，下次访问需等几秒重启
- 免费版不支持自定义域名
- WebP 图片通过 `encodeURIComponent` 编码中文文件名在 URL 中传输
