@echo off
chcp 65001 >nul
title 모두를위한바둑 - 서버 시작

echo.
echo ========================================
echo   모두를위한바둑 - 서버 시작
echo ========================================
echo.

:: PATH 설정
set PATH=C:\Program Files\PostgreSQL\16\bin;C:\Program Files\Redis;C:\Program Files\nodejs;%PATH%

:: ------------------------------------------
:: 1. PostgreSQL 시작
:: ------------------------------------------
echo [1/3] PostgreSQL 확인...
pg_isready >nul 2>&1
if %errorlevel%==0 (
    echo   PostgreSQL 이미 실행 중
) else (
    echo   PostgreSQL 시작 중...
    pg_ctl -D "C:\Program Files\PostgreSQL\16\data" -l "C:\Program Files\PostgreSQL\16\data\pg.log" start >nul 2>&1
    timeout /t 3 /nobreak >nul
    pg_isready >nul 2>&1
    if %errorlevel%==0 (
        echo   PostgreSQL 시작 완료
    ) else (
        echo   [오류] PostgreSQL 시작 실패
        pause
        exit /b 1
    )
)

:: ------------------------------------------
:: 2. Redis 시작
:: ------------------------------------------
echo.
echo [2/3] Redis 확인...
redis-cli ping >nul 2>&1
if %errorlevel%==0 (
    echo   Redis 이미 실행 중
) else (
    echo   Redis 시작 중...
    start /b "" redis-server >nul 2>&1
    timeout /t 2 /nobreak >nul
    redis-cli ping >nul 2>&1
    if %errorlevel%==0 (
        echo   Redis 시작 완료
    ) else (
        echo   [오류] Redis 시작 실패
        pause
        exit /b 1
    )
)

:: ------------------------------------------
:: 3. 백엔드 + 프론트엔드 동시 시작
:: ------------------------------------------
echo.
echo [3/3] 서버 시작...
echo.

cd /d E:\Workspace\BoardGame

echo   백엔드 서버 시작 (http://localhost:3000)
start "baduk-server" cmd /k "cd /d E:\Workspace\BoardGame && npm run dev:server"

timeout /t 3 /nobreak >nul

echo   프론트엔드 서버 시작 (http://localhost:5173)
start "baduk-client" cmd /k "cd /d E:\Workspace\BoardGame && npm run dev:client"

echo.
echo ========================================
echo   모든 서버 시작 완료!
echo ========================================
echo.
echo   프론트엔드: http://localhost:5173
echo   백엔드:     http://localhost:3000
echo.
echo   이 창을 닫아도 서버는 유지됩니다.
echo   서버 종료: stop.bat 실행
echo.
pause
