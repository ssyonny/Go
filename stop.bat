@echo off
chcp 65001 >nul
title 모두를위한바둑 - 서버 종료

echo.
echo ========================================
echo   모두를위한바둑 - 서버 종료
echo ========================================
echo.

set PATH=C:\Program Files\PostgreSQL\16\bin;C:\Program Files\Redis;C:\Program Files\nodejs;%PATH%

:: Node 서버 종료
echo [1/3] Node 서버 종료...
taskkill /fi "WINDOWTITLE eq baduk-server*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq baduk-client*" /f >nul 2>&1
echo   Node 서버 종료 완료

:: PostgreSQL 종료
echo.
echo [2/3] PostgreSQL 종료...
pg_ctl -D "C:\Program Files\PostgreSQL\16\data" stop >nul 2>&1
echo   PostgreSQL 종료 완료

:: Redis 종료
echo.
echo [3/3] Redis 종료...
redis-cli shutdown >nul 2>&1
echo   Redis 종료 완료

echo.
echo ========================================
echo   모든 서버가 종료되었습니다.
echo ========================================
echo.
pause
