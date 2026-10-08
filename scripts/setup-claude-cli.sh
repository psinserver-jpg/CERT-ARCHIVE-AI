#!/bin/bash
# =============================================================
#  대진전자통신고 자격증 플랫폼 + Claude CLI 서버 설치 스크립트
#  DGX Spark (psin2@100.91.11.68) 환경 전용
# =============================================================

echo "🚀 [1/5] 기본 패키지 및 Node.js, PM2 환경 점검..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git build-essential curl

echo "⚡ [2/5] PM2 및 Claude Code CLI (Claude Haiku 5.5) 설치..."
sudo npm install -g pm2
sudo npm install -g @anthropic-ai/claude-code

echo "🔑 [3/5] Claude Code CLI 인증 확인..."
echo "※ 서버 터미널에서 'claude' 를 한 번 직접 실행하여 브라우저/토큰 로그인을 완료해주세요."

echo "📦 [4/5] Claude API Wrapper 서버 의존성 설치..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/claude-server"
npm install

echo "🔄 [5/5] PM2 프로세스 등록 및 실행..."
pm2 delete claude-api 2>/dev/null || true
pm2 start server.js --name "claude-api"
pm2 save

echo "============================================================="
echo "✅ Claude CLI API Wrapper 가 포트 8088에서 실행 중입니다!"
echo "기본 모델: claude-haiku-5-5"
echo "외부 접속 테스트: curl -H 'x-api-key: certvault-spark-key-2026' http://localhost:8088/health"
echo "============================================================="
