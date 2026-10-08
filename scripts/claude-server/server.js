import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 8088;
const API_KEY = process.env.API_KEY || 'certvault-spark-key-2026';
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-5-5';
const ALLOWED_EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);

app.use(cors());
app.use(express.json());

// API 인증 미들웨어
app.use((req, res, next) => {
  const reqKey = req.headers['x-api-key'] || req.query.apiKey;
  if (reqKey !== API_KEY) {
    return res.status(401).json({ error: '인증 실패: 유효하지 않은 API Key입니다.' });
  }
  next();
});

// Claude CLI 실행 함수
function callClaudeCli(prompt, effort = 'medium') {
  return new Promise((resolve, reject) => {
    const selectedEffort = ALLOWED_EFFORTS.has(effort) ? effort : 'medium';
    const claudeProcess = spawn('claude', [
      '--model', CLAUDE_MODEL,
      '--effort', selectedEffort,
      '--tools', '',
      '--disallowedTools', 'mcp__*',
      '-p', prompt
    ], {
      shell: false,
      env: process.env,
    });

    let output = '';
    let errorOutput = '';

    claudeProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    claudeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    const timeout = setTimeout(() => {
      claudeProcess.kill('SIGTERM');
      reject(new Error('Claude Code CLI 응답 시간 초과 (25s)'));
    }, 25000);

    claudeProcess.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    claudeProcess.once('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        console.warn(`Claude CLI exited with code ${code}. Error: ${errorOutput}`);
        reject(new Error(errorOutput || `Claude CLI 프로세스 종료 코드: ${code}`));
      }
    });
  });
}

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'DGX Spark Claude Code CLI', model: CLAUDE_MODEL, port: PORT });
});

// AI 질의 엔드포인트
app.post('/api/claude', async (req, res) => {
  try {
    const { prompt, effort = 'medium' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'prompt 파라미터가 필요합니다.' });
    }

    console.log(`[Claude Server] 요청 수신 (길이: ${prompt.length})`);
    const result = await callClaudeCli(prompt, effort);
    res.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    console.error('[Claude Server 에러]:', message);
    res.status(500).json({ error: message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Claude CLI API Wrapper Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔑 Key Protected. Endpoints: POST /api/claude, GET /health`);
});
