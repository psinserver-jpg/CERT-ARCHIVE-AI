import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 8088;
const API_KEY = process.env.API_KEY || 'certvault-spark-key-2026';

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
function callClaudeCli(prompt: string, effort: string = 'medium'): Promise<string> {
  return new Promise((resolve, reject) => {
    // claude cli 호출 (하이쿠 4.5 모델 권장 옵션 적용 및 파이프라인)
    // prompt를 claude 명령어로 전달
    const claudeProcess = spawn('claude', [
      '--model', 'claude-3-5-haiku-20241022',
      '--dangerously-skip-permissions',
      '-p', prompt
    ], {
      shell: true,
      env: { ...process.env, CLAUDE_EFFORT: effort }
    });

    let output = '';
    let errorOutput = '';

    claudeProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    claudeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    claudeProcess.on('close', (code) => {
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        // claude cli 가 아직 로그인 안되었거나 없을 경우를 고려해 로그 출력
        console.warn(`Claude CLI exited with code ${code}. Error: ${errorOutput}`);
        if (output.trim()) {
          resolve(output.trim());
        } else {
          reject(new Error(errorOutput || `Claude CLI 프로세스 종료 코드: ${code}`));
        }
      }
    });

    // 25초 타임아웃
    setTimeout(() => {
      claudeProcess.kill();
      reject(new Error('Claude CLI 응답 시간 초과 (25s)'));
    }, 25000);
  });
}

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'DGX Spark Claude Wrapper', port: PORT });
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
  } catch (err: any) {
    console.error('[Claude Server 에러]:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Claude CLI API Wrapper Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔑 Key Protected. Endpoints: POST /api/claude, GET /health`);
});
