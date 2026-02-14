# 모두를위한바둑 - 개발 환경 설치 매뉴얼

## 필수 소프트웨어

| 소프트웨어 | 버전 | 용도 |
|-----------|------|------|
| Node.js | v20 LTS 이상 | 서버/클라이언트 런타임 |
| PostgreSQL | 16 이상 | 사용자 데이터베이스 |
| Redis | 7 이상 | 세션 캐시 |

---

## 1. Node.js

### 설치
```powershell
winget install OpenJS.NodeJS.LTS
```
또는 https://nodejs.org 에서 LTS 버전 다운로드

### 확인
```powershell
node --version   # v20.x.x 이상
npm --version    # 10.x.x 이상
```

> 설치 후 터미널을 재시작해야 PATH가 적용됩니다.

---

## 2. PostgreSQL

### 설치
```powershell
winget install PostgreSQL.PostgreSQL.16
```
또는 https://www.postgresql.org/download/windows/ 에서 다운로드

### 설치 중 설정
- **비밀번호**: postgres 사용자 비밀번호를 설정합니다 (기억해두세요)
- **포트**: 기본값 `5432` 유지
- **로케일**: 기본값 유지

### PATH 설정
설치 후 `psql` 명령이 안 되면 PATH에 추가합니다:

```powershell
# 보통 아래 경로에 설치됩니다
$pgPath = "C:\Program Files\PostgreSQL\16\bin"

# 현재 세션에 임시 적용
$env:Path += ";$pgPath"

# 영구 적용 (관리자 PowerShell)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$pgPath", "User")
```

### 확인
```powershell
psql --version   # psql (PostgreSQL) 16.x
```

### 데이터베이스 생성
```powershell
# PostgreSQL에 접속
psql -U postgres

# 아래 SQL 실행
CREATE DATABASE baduk;
\q
```

### 테이블 마이그레이션
```powershell
psql -U postgres -d baduk -f packages/server/src/migrations/001_create_users_table.sql
```

### 정상 확인
```powershell
psql -U postgres -d baduk -c "\dt"
```
`users` 테이블이 보이면 성공입니다.

---

## 3. Redis

### 설치
```powershell
winget install Redis.Redis
```
또는 https://github.com/tporadowski/redis/releases 에서 Windows 빌드 다운로드

### 서비스 시작
Redis는 설치 시 Windows 서비스로 자동 등록됩니다. 수동으로 제어하려면:

```powershell
# 서비스 상태 확인
Get-Service Redis

# 시작
Start-Service Redis

# 중지
Stop-Service Redis
```

만약 서비스로 등록되지 않았다면 직접 실행:
```powershell
redis-server
```

### 확인
```powershell
redis-cli ping
# 응답: PONG
```

---

## 4. 프로젝트 설정

### 의존성 설치
```powershell
cd E:\Workspace\BoardGame
npm install
```

### 환경변수 설정
`packages/server/.env` 파일을 열어 비밀번호를 수정합니다:

```env
DB_PASSWORD=your_password    # ← PostgreSQL 설치 시 설정한 비밀번호로 변경
```

나머지 값은 기본값으로 사용 가능합니다.

---

## 5. 실행

### 서버 (백엔드)
```powershell
npm run dev:server
```
정상 출력:
```
Database connected successfully
Redis connected
Server running on http://localhost:3000
Environment: development
```

### 클라이언트 (프론트엔드)
```powershell
npm run dev:client
```
정상 출력:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

브라우저에서 http://localhost:5173 접속

---

## 6. 문제 해결

### `psql` 명령을 찾을 수 없음
→ PostgreSQL bin 디렉토리를 PATH에 추가 (위 2번 참조)

### DB 연결 실패 (ECONNREFUSED)
→ PostgreSQL 서비스가 실행 중인지 확인:
```powershell
Get-Service postgresql*
Start-Service postgresql-x64-16   # 서비스명은 버전에 따라 다를 수 있음
```

### Redis 연결 실패
→ Redis 서비스가 실행 중인지 확인:
```powershell
Get-Service Redis
Start-Service Redis
```

### npm install 오류 (bcrypt 관련)
bcrypt는 네이티브 모듈이라 빌드 도구가 필요할 수 있습니다:
```powershell
npm install -g windows-build-tools
# 또는
winget install Microsoft.VisualStudio.2022.BuildTools
```

### 포트 충돌 (EADDRINUSE)
이미 해당 포트를 사용하는 프로세스 확인:
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

---

## 요약 체크리스트

- [ ] Node.js 설치 + `node --version` 확인
- [ ] PostgreSQL 설치 + `psql --version` 확인
- [ ] Redis 설치 + `redis-cli ping` → PONG 확인
- [ ] `npm install` 완료
- [ ] `packages/server/.env`에서 `DB_PASSWORD` 설정
- [ ] `CREATE DATABASE baduk;` 실행
- [ ] 마이그레이션 SQL 실행
- [ ] `npm run dev:server` → 서버 정상 기동
- [ ] `npm run dev:client` → 프론트엔드 정상 기동
- [ ] http://localhost:5173 접속 확인
