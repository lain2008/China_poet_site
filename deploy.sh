#!/bin/bash
# ============================================
# 诗人匹配测试网站 - 云服务器一键部署脚本
# 适用于 Ubuntu 22.04/24.04 (Oracle Cloud Free Tier)
# ============================================
set -e

echo "============================================"
echo "  开始部署诗人匹配测试网站"
echo "============================================"

# 1. 系统更新
echo "[1/6] 更新系统..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

# 2. 安装依赖
echo "[2/6] 安装 Python3 + pip + nginx..."
sudo apt-get install -y -qq python3 python3-pip python3-venv nginx

# 3. 创建项目目录
echo "[3/6] 创建项目目录..."
sudo mkdir -p /opt/poet_site
sudo chown -R $USER:$USER /opt/poet_site

# 4. 部署代码（从本地拷贝或从git拉取）
# 方式A：如果代码在本地，用 scp 拷贝
#   scp -r /mnt/a/vibe/code/poet_site/* ubuntu@<VM-IP>:/opt/poet_site/
#
# 方式B：如果在 git 仓库，直接克隆
#   git clone <你的仓库地址> /opt/poet_site

echo "[4/6] 设置 Python 虚拟环境..."
cd /opt/poet_site
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors waitress gunicorn -q

# 5. 配置 nginx 反向代理
echo "[5/6] 配置 nginx..."
sudo tee /etc/nginx/sites-available/poet_site > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /opt/poet_site/static/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/poet_site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# 6. 创建 systemd 服务（开机自启）
echo "[6/6] 创建系统服务..."
sudo tee /etc/systemd/system/poet_site.service > /dev/null <<'SERVICE'
[Unit]
Description=Poet Match Website
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/poet_site
ExecStart=/opt/poet_site/venv/bin/python /opt/poet_site/app.py
Restart=always
RestartSec=5
Environment=WAITRESS=true
Environment=HOST=127.0.0.1
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable poet_site
sudo systemctl start poet_site

echo "============================================"
echo "  部署完成！"
echo "============================================"
echo ""
echo "访问地址: http://<你的VM公网IP>"
echo ""
echo "管理命令:"
echo "  sudo systemctl status poet_site    # 查看状态"
echo "  sudo systemctl restart poet_site   # 重启服务"
echo "  sudo journalctl -u poet_site -f    # 查看日志"
echo ""
echo "数据库路径: /opt/poet_site/database/poets.db"
echo "============================================"
