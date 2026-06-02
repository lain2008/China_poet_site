@echo off
chcp 65001 >nul
cls
echo ============================================
echo  诗人匹配测试网站 - 启动器
echo ============================================
echo.
echo  1. 本地模式 (localhost:8080)
echo  2. 外网模式 (Cloudflare Tunnel)
echo  3. 退出
echo.
set /p choice="请选择 (1/2/3): "

if "%choice%"=="1" goto local
if "%choice%"=="2" goto tunnel
if "%choice%"=="3" goto end

:local
echo.
echo 启动本地服务器...
start "PoetSite-Server" /min A:\vibe\tool\flask_env\Scripts\python.exe A:\vibe\code\poet_site\app.py
timeout /t 3 >nul
echo.
echo 已启动！访问地址: http://localhost:8080
echo 按任意键关闭服务...
pause >nul
taskkill /f /im python.exe >nul 2>&1
exit

:tunnel
echo.
echo 启动本地服务器...
start "PoetSite-Server" /min A:\vibe\tool\flask_env\Scripts\python.exe A:\vibe\code\poet_site\app.py
timeout /t 3 >nul
echo.
echo 启动 Cloudflare Tunnel（获取外网地址）...
echo 请等待出现 "https://xxxxx.trycloudflare.com" 字样
echo 按 Ctrl+C 可停止隧道
echo.
A:\vibe\tool\cloudflared\cloudflared.exe tunnel --url http://localhost:8080
taskkill /f /im python.exe >nul 2>&1
exit

:end
