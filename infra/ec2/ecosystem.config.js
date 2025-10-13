module.exports = {
  apps: [
    {
      // === 기본 설정 ===
      name: "conpang-sprintServer",
      script: "./dist/server.js",
      instances: 1,
      exec_mode: "fork",
      // === 메모리 관리 ===
      max_memory_restart: "500M",
      // === 환경변수 설정 ===
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // === 로그 설정 ===
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_file: "./logs/pm2-combined.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // === 재시작 전략 ===
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
      // === 종료 관련 설정 ===
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
