#!/bin/bash
# =============================================================
#  CertVault 서버 최초 세팅 스크립트
#  DGX Spark (psin2@100.91.11.68) 에서 한 번만 실행
#  사용법: bash scripts/server-setup.sh <GITHUB_REPO_URL>
#  예시:   bash scripts/server-setup.sh https://github.com/yourname/certvault.git
# =============================================================
set -e

REPO_URL=${1:-""}
APP_DIR="$HOME/certvault"
NODE_VERSION="20"

echo "================================================"
echo "  CertVault 서버 최초 세팅 시작"
echo "================================================"

# ── 1. Node.js 설치 확인 ──────────────────────────
if ! command -v node &> /dev/null; then
  echo "📦 Node.js $NODE_VERSION 설치 중..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "✅ Node.js $(node -v) 이미 설치됨"
fi

# ── 2. PM2 전역 설치 확인 ─────────────────────────
if ! command -v pm2 &> /dev/null; then
  echo "📦 PM2 설치 중..."
  sudo npm install -g pm2
else
  echo "✅ PM2 $(pm2 -v) 이미 설치됨"
fi

# ── 3. Git 설치 확인 ──────────────────────────────
if ! command -v git &> /dev/null; then
  echo "📦 Git 설치 중..."
  sudo apt-get install -y git
else
  echo "✅ Git $(git --version) 이미 설치됨"
fi

# ── 4. 앱 클론 ────────────────────────────────────
if [ -z "$REPO_URL" ]; then
  echo "❌ GitHub 저장소 URL을 인자로 전달해주세요."
  echo "   예: bash scripts/server-setup.sh https://github.com/yourname/certvault.git"
  exit 1
fi

if [ -d "$APP_DIR" ]; then
  echo "⚠️  $APP_DIR 이미 존재합니다. git pull로 업데이트합니다."
  cd "$APP_DIR"
  git pull origin main
else
  echo "📥 저장소 클론 중..."
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 5. .env 파일 안내 ─────────────────────────────
if [ ! -f "$APP_DIR/.env.local" ]; then
  echo ""
  echo "⚠️  .env.local 파일이 없습니다."
  echo "   아래 내용을 $APP_DIR/.env.local 에 직접 작성해주세요:"
  echo ""
  echo "   NEXT_PUBLIC_SUPABASE_URL=..."
  echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=..."
  echo "   SUPABASE_SERVICE_ROLE_KEY=..."
  echo "   HRDKOREA_API_KEY=..."
  echo "   DGX_SSH_HOST=..."
  echo "   DGX_SSH_USER=..."
  echo "   DGX_SSH_PRIVATE_KEY_PATH=..."
  echo "   DGX_LLM_LOCAL_PORT=11434"
  echo ""
fi

# ── 6. 의존성 설치 & 빌드 ─────────────────────────
echo "📦 의존성 설치 중..."
npm ci

echo "🔨 프로덕션 빌드 중..."
npm run build

# ── 7. PM2로 시작 & 부팅 자동시작 등록 ───────────
echo "🚀 PM2로 서버 시작 중..."
pm2 start ecosystem.config.js

echo "💾 PM2 부팅 자동시작 저장 중..."
pm2 save
pm2 startup | tail -1 | bash 2>/dev/null || echo "  (startup 명령은 수동으로 실행하세요)"

# ── 8. 방화벽 포트 안내 ───────────────────────────
echo ""
echo "================================================"
echo "  ✅ 세팅 완료!"
echo "================================================"
echo "  서버 주소: http://100.91.11.68:3000"
echo ""
echo "  PM2 상태 확인: pm2 status"
echo "  로그 확인:     pm2 logs certvault"
echo ""
echo "  ⚠️  포트 3000이 방화벽에서 열려있는지 확인하세요:"
echo "      sudo ufw allow 3000"
echo "================================================"
