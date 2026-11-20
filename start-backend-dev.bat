@echo off
cd /d "%~dp0backend"
call gradlew.bat bootRun > "%~dp0backend-runtime.log" 2>&1
