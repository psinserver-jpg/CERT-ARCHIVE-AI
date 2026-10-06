// PM2 ecosystem 설정 파일
// 서버에서 Next.js를 상시 실행하고 자동 재시작 관리

module.exports = {
  apps: [
    {
      name: 'certvault',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: process.env.HOME + '/certvault',

      // 포트 (필요 시 변경)
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // 자동 재시작 설정
      watch: false,          // 파일 변경 감지 끔 (배포 시 PM2 reload로 처리)
      autorestart: true,     // 크래시 시 자동 재시작
      max_restarts: 10,      // 최대 재시작 횟수
      restart_delay: 3000,   // 재시작 대기 시간 (ms)

      // 로그 설정
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: '~/.pm2/logs/certvault-out.log',
      error_file: '~/.pm2/logs/certvault-error.log',
      merge_logs: true,

      // 성능
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'claude-api',
      script: 'server.js',
      cwd: process.env.HOME + '/certvault/scripts/claude-server',
      env: {
        NODE_ENV: 'production',
        PORT: 8088,
        API_KEY: 'certvault-spark-key-2026',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      out_file: '~/.pm2/logs/claude-api-out.log',
      error_file: '~/.pm2/logs/claude-api-error.log',
      merge_logs: true,
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};
