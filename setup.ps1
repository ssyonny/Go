# ============================================================
# 모두를위한바둑 - 개발 환경 설치 스크립트 (PowerShell)
# 실행: PowerShell에서  .\setup.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  모두를위한바둑 - 개발 환경 설치" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ----------------------------------------------------------
# 1. Node.js 설치 확인
# ----------------------------------------------------------
Write-Host "[1/6] Node.js 확인..." -ForegroundColor Yellow

if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "  Node.js $nodeVersion 설치됨" -ForegroundColor Green
} else {
    Write-Host "  Node.js가 설치되어 있지 않습니다. 설치를 시작합니다..." -ForegroundColor Red
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  winget 설치 실패. https://nodejs.org 에서 직접 다운로드해주세요." -ForegroundColor Red
        exit 1
    }
    # PATH 갱신
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-Host "  Node.js $(node --version) 설치 완료" -ForegroundColor Green
}

# npm 확인
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "  npm을 찾을 수 없습니다. 터미널을 재시작한 뒤 다시 실행해주세요." -ForegroundColor Red
    exit 1
}
Write-Host "  npm $(npm --version)" -ForegroundColor Green

# ----------------------------------------------------------
# 2. PostgreSQL 설치 확인
# ----------------------------------------------------------
Write-Host "`n[2/6] PostgreSQL 확인..." -ForegroundColor Yellow

if (Get-Command psql -ErrorAction SilentlyContinue) {
    $pgVersion = psql --version
    Write-Host "  $pgVersion" -ForegroundColor Green
} else {
    Write-Host "  PostgreSQL이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "  설치 옵션:" -ForegroundColor Yellow
    Write-Host "    1) winget install PostgreSQL.PostgreSQL.16" -ForegroundColor White
    Write-Host "    2) https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host ""

    $installPg = Read-Host "  winget으로 설치할까요? (y/n)"
    if ($installPg -eq 'y') {
        winget install PostgreSQL.PostgreSQL.16 --accept-source-agreements --accept-package-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    } else {
        Write-Host "  PostgreSQL 설치 후 다시 실행해주세요." -ForegroundColor Yellow
    }
}

# ----------------------------------------------------------
# 3. Redis 설치 확인
# ----------------------------------------------------------
Write-Host "`n[3/6] Redis 확인..." -ForegroundColor Yellow

if (Get-Command redis-cli -ErrorAction SilentlyContinue) {
    Write-Host "  Redis 설치됨" -ForegroundColor Green
} else {
    Write-Host "  Redis가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "  Windows에서 Redis 설치 옵션:" -ForegroundColor Yellow
    Write-Host "    1) winget install Redis.Redis" -ForegroundColor White
    Write-Host "    2) Memurai (Windows Redis 호환): https://www.memurai.com/" -ForegroundColor White
    Write-Host "    3) WSL2에서 Redis: sudo apt install redis-server" -ForegroundColor White
    Write-Host ""

    $installRedis = Read-Host "  winget으로 설치할까요? (y/n)"
    if ($installRedis -eq 'y') {
        winget install Redis.Redis --accept-source-agreements --accept-package-agreements
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    } else {
        Write-Host "  Redis 설치 후 다시 실행해주세요." -ForegroundColor Yellow
    }
}

# ----------------------------------------------------------
# 4. 환경변수 파일 설정
# ----------------------------------------------------------
Write-Host "`n[4/6] 환경변수 설정..." -ForegroundColor Yellow

$envFile = "packages\server\.env"
$envExample = ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "  .env.example -> packages/server/.env 복사됨" -ForegroundColor Green
        Write-Host "  !! packages/server/.env 파일에서 DB_PASSWORD를 수정해주세요 !!" -ForegroundColor Red
    } else {
        Write-Host "  .env.example 파일이 없습니다. 수동으로 .env를 생성해주세요." -ForegroundColor Red
    }
} else {
    Write-Host "  packages/server/.env 이미 존재함" -ForegroundColor Green
}

# ----------------------------------------------------------
# 5. npm install
# ----------------------------------------------------------
Write-Host "`n[5/6] npm install (워크스페이스 전체)..." -ForegroundColor Yellow

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  npm install 실패" -ForegroundColor Red
    exit 1
}
Write-Host "  의존성 설치 완료" -ForegroundColor Green

# ----------------------------------------------------------
# 6. 데이터베이스 설정
# ----------------------------------------------------------
Write-Host "`n[6/6] 데이터베이스 설정..." -ForegroundColor Yellow

if (Get-Command psql -ErrorAction SilentlyContinue) {
    $dbName = "baduk"
    $dbUser = "postgres"

    Write-Host "  PostgreSQL 비밀번호를 입력해주세요 (기본 사용자: postgres)" -ForegroundColor White

    # DB 존재 여부 확인 후 생성
    $dbExists = psql -U $dbUser -tc "SELECT 1 FROM pg_database WHERE datname='$dbName'" 2>$null
    if ($dbExists -match "1") {
        Write-Host "  데이터베이스 '$dbName' 이미 존재함" -ForegroundColor Green
    } else {
        psql -U $dbUser -c "CREATE DATABASE $dbName"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  데이터베이스 '$dbName' 생성 완료" -ForegroundColor Green
        } else {
            Write-Host "  DB 생성 실패. 수동으로 생성해주세요: CREATE DATABASE baduk;" -ForegroundColor Red
        }
    }

    # 마이그레이션 실행
    $migrationFile = "packages\server\src\migrations\001_create_users_table.sql"
    if (Test-Path $migrationFile) {
        Write-Host "  마이그레이션 실행 중..." -ForegroundColor White
        psql -U $dbUser -d $dbName -f $migrationFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  마이그레이션 완료" -ForegroundColor Green
        } else {
            Write-Host "  마이그레이션 실패 (이미 실행된 경우 무시 가능)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  psql을 찾을 수 없어 DB 설정을 건너뜁니다." -ForegroundColor Yellow
    Write-Host "  수동으로 실행해주세요:" -ForegroundColor Yellow
    Write-Host "    1) CREATE DATABASE baduk;" -ForegroundColor White
    Write-Host "    2) psql -U postgres -d baduk -f packages/server/src/migrations/001_create_users_table.sql" -ForegroundColor White
}

# ----------------------------------------------------------
# 완료
# ----------------------------------------------------------
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  설치 완료!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "실행 방법:" -ForegroundColor Yellow
Write-Host "  프론트엔드:  npm run dev:client   (http://localhost:5173)" -ForegroundColor White
Write-Host "  백엔드:      npm run dev:server   (http://localhost:3000)" -ForegroundColor White
Write-Host ""
Write-Host "사전 확인:" -ForegroundColor Yellow
Write-Host "  1. packages/server/.env 에서 DB_PASSWORD 설정" -ForegroundColor White
Write-Host "  2. PostgreSQL 서비스 실행 중인지 확인" -ForegroundColor White
Write-Host "  3. Redis 서비스 실행 중인지 확인" -ForegroundColor White
Write-Host ""
