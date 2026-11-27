#!/bin/bash
# =============================================================
#  DGX Spark 에 Claude Code CLI + 래퍼 서버를 설치하고
#  Tailscale Funnel 로 HTTPS 공개 (Vercel 에서 호출 가능하게)
#
#  사용법 (DGX Spark 에서, 저장소 루트 기준):
#    bash scripts/setup-dgx-claude.sh
# =============================================================
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER_DIR="$SCRIPT_DIR/claude-server"
PORT="${PORT:-8088}"

echo "🚀 [1/6] Node.js / PM2 확인..."
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
command -v pm2 >/dev/null || sudo npm install -g pm2

echo "⚡ [2/6] Claude Code CLI 설치 확인..."
if ! command -v claude >/dev/null; then
  curl -fsSL https://claude.ai/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
fi
claude --version

echo "🔑 [3/6] Claude Code CLI 로그인 확인..."
if ! (cd /tmp && claude --print --model claude-haiku-5-5 --tools '' --strict-mcp-config --no-session-persistence 'ok 라고만 답해' >/dev/null 2>&1); then
  echo "❌ Claude Code CLI 로그인이 필요합니다. 이 터미널에서 'claude' 를 실행해 로그인한 뒤 스크립트를 다시 실행하세요."
  exit 1
fi
echo "✅ Claude Code CLI 응답 확인"

echo "📦 [4/6] 래퍼 서버 의존성 설치 및 API 키 생성..."
cd "$SERVER_DIR"
npm install --omit=dev --no-audit --no-fund
if [ ! -f .env ]; then
  {
    echo "API_KEY=$(openssl rand -hex 32)"
    echo "PORT=$PORT"
    echo "CLAUDE_BIN=$(command -v claude)"
  } > .env
  chmod 600 .env
fi
API_KEY=$(grep '^API_KEY=' .env | cut -d= -f2)

echo "🔄 [5/6] PM2 로 래퍼 서버 실행..."
pm2 delete claude-api 2>/dev/null || true
pm2 start server.js --name claude-api
pm2 save
sleep 2
curl -fsS "http://127.0.0.1:$PORT/health" && echo

echo "🌐 [6/6] Tailscale Funnel 로 HTTPS 공개..."
sudo tailscale funnel --bg "$PORT"
FUNNEL_HOST=$(tailscale status --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).Self.DNSName.replace(/\.$/,"")))')

echo "============================================================="
echo "✅ 설치 완료! Vercel 프로젝트 환경 변수에 아래 두 값을 넣고 재배포하세요."
echo ""
echo "  CLAUDE_API_URL=https://$FUNNEL_HOST/api/claude"
echo "  CLAUDE_API_KEY=$API_KEY"
echo ""
echo "외부 확인: curl https://$FUNNEL_HOST/health"
echo "============================================================="
