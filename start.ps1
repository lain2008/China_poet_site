$env:Path = "A:\vibe\tool\flask_env\Scripts;" + $env:Path
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " 诗人匹配测试网站 - 启动中..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "访问地址: http://localhost:8080" -ForegroundColor Green
Write-Host "局域网: http://<本机IP>:8080" -ForegroundColor Yellow
Write-Host ""
& "A:\vibe\tool\flask_env\Scripts\python.exe" "A:\vibe\code\poet_site\app.py"
