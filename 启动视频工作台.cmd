@echo off
chcp 65001 >nul
cd /d "%~dp0"
title DSH Video Workbench - Standalone (no DSH required)

echo ============================================================
echo   AI 视频工作台 - 独立版（不依赖 DSH，不写入 DSH 配置）
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未找到 Node.js，请先安装 Node 20 或更高版本。
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [初始化] 首次运行，正在安装依赖，请稍候...
  call npm install --no-audit --no-fund
)

echo [启动] 正在打开工作台，浏览器地址通常是 http://127.0.0.1:4399
echo [提示] 关闭此窗口即可停止服务。
echo.

node start.mjs
if errorlevel 1 (
  echo.
  echo [启动失败] 请查看上方错误信息。
  pause
)
