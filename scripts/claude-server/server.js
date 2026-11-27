import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';

// scripts/claude-server/.env 가 있으면 읽는다 (setup-dgx-claude.sh 가 생성)
const envFile = new URL('./.env', import.meta.url);
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

const app = express();
const PORT = Number(process.env.PORT || 8088);
const HOST = process.env.HOST || '127.0.0.1'; // Tailscale Funnel 이 로컬 포트를 외부에 HTTPS로 공개한다
const API_KEY = process.env.API_KEY;
const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-5-5';
const CLI_TIMEOUT_MS = Number(process.env.CLI_TIMEOUT_MS || 100000);
const MAX_CONCURRENT = Number(process.env.MAX_CONCURRENT || 3);
const MAX_PROMPT_LENGTH = 20000;
const ALLOWED_EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);

// 서버가 인터넷에 공개되므로 저장소에 적혀 있던 기본 키로는 실행하지 않는다.
if (!API_KEY || API_KEY.length < 24 || API_KEY === 'certvault-spark-key-2026') {
  console.error('❌ API_KEY 가 없거나 너무 약합니다. scripts/setup-dgx-claude.sh 를 실행해 .env 를 만드세요.');
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// 헬스체크 (인증 불필요, 민감 정보 없음)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'DGX Spark Claude Code CLI', model: CLAUDE_MODEL, running, queued: queue.length });
});

// API 인증 미들웨어
app.use((req, res, next) => {
  if (req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: '인증 실패: 유효하지 않은 API Key입니다.' });
  }
  next();
});

// 동시에 띄우는 CLI 프로세스 수 제한
let running = 0;
const queue = [];
function withSlot(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      running += 1;
      task().then(resolve, reject).finally(() => {
        running -= 1;
        queue.shift()?.();
      });
    };
    if (running < MAX_CONCURRENT) run();
    else queue.push(run);
  });
}

// Claude Code CLI 실행 (프롬프트는 stdin 으로 전달)
function callClaudeCli(prompt, effort = 'medium') {
  return new Promise((resolve, reject) => {
    const selectedEffort = ALLOWED_EFFORTS.has(effort) ? effort : 'medium';
    const claudeProcess = spawn(CLAUDE_BIN, [
      '--print',
      '--model', CLAUDE_MODEL,
      '--effort', selectedEffort,
      '--tools', '',
      '--strict-mcp-config',
      '--setting-sources', '',
      '--no-session-persistence',
      '--output-format', 'text',
    ], {
      shell: false,
      cwd: tmpdir(), // 프로젝트 CLAUDE.md 등을 읽지 않도록 빈 위치에서 실행
      env: process.env,
    });

    let output = '';
    let errorOutput = '';
    claudeProcess.stdout.on('data', (data) => { output += data.toString(); });
    claudeProcess.stderr.on('data', (data) => { errorOutput += data.toString(); });

    const timeout = setTimeout(() => {
      claudeProcess.kill('SIGTERM');
      reject(new Error(`Claude Code CLI 응답 시간 초과 (${CLI_TIMEOUT_MS / 1000}s)`));
    }, CLI_TIMEOUT_MS);

    claudeProcess.once('error', (error) => {
      clearTimeout(timeout);
      reject(error.code === 'ENOENT'
        ? new Error(`'${CLAUDE_BIN}' 명령을 찾을 수 없습니다. Claude Code CLI 설치를 확인하세요.`)
        : error);
    });

    claudeProcess.once('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        console.warn(`Claude CLI exited with code ${code}. stderr: ${errorOutput}`);
        reject(new Error((errorOutput || output).trim() || `Claude CLI 프로세스 종료 코드: ${code}`));
      }
    });

    claudeProcess.stdin.end(prompt);
  });
}

// AI 질의 엔드포인트
app.post('/api/claude', async (req, res) => {
  const { prompt, effort = 'medium' } = req.body ?? {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt 파라미터가 필요합니다.' });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(413).json({ error: '프롬프트가 너무 깁니다.' });
  }

  const startedAt = Date.now();
  try {
    const result = await withSlot(() => callClaudeCli(prompt, effort));
    console.log(`[Claude Server] 완료 ${Date.now() - startedAt}ms (프롬프트 ${prompt.length}자)`);
    res.json({ result, model: CLAUDE_MODEL });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    console.error('[Claude Server 에러]:', message);
    res.status(502).json({ error: message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Claude CLI API Wrapper Server running on http://${HOST}:${PORT} (model: ${CLAUDE_MODEL})`);
});
