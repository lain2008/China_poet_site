param(
    [switch]$NoTunnel
)

$python = "A:\vibe\tool\flask_env\Scripts\python.exe"
$app = "A:\vibe\code\poet_site\app.py"
$cloudflared = "A:\vibe\tool\cloudflared\cloudflared.exe"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 诗人匹配测试网站 - 启动中..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 启动 waitress 后端（后台进程）
$psi = @{
    FilePath = $python
    Arguments = $app
    WorkingDirectory = "A:\vibe\code\poet_site"
    PassThru = $true
    WindowStyle = "Hidden"
}
$server = Start-Process @psi
Write-Host "[后端] waitress 已启动 (http://localhost:8080)" -ForegroundColor Green

Start-Sleep -Seconds 2

if (-not $NoTunnel) {
    Write-Host "[隧道] 启动 Cloudflare Tunnel..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " 外网地址生成中，请稍候..." -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # cloudflared 会在前台显示隧道 URL
    & $cloudflared tunnel --url http://localhost:8080
    
    # cloudflared 退出后，停止后端
    Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "无隧道模式，仅供本地访问" -ForegroundColor Yellow
    Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
    
    # 等待用户按键
    Read-Host "按 Enter 停止服务"
    Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
}
