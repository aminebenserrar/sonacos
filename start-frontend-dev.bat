@echo off
cd /d "%~dp0frontend"
npm run dev > "%~dp0frontend-runtime.log" 2>&1
