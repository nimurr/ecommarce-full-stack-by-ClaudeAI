# ============================================
# PM2 ECOSYSTEM FILE FOR gadgetslagbe.com
# ============================================
# Run: pm2 start ecosystem.config.cjs
# ============================================

module.exports = {
  apps: [
    {
      name: 'gadgetslagbe-api',
      script: './server/server.js',
      instances: 'max', // Auto-scale to CPU cores
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'public'],
      error_file: '/var/log/pm2/gadgetslagbe-api-error.log',
      out_file: '/var/log/pm2/gadgetslagbe-api-out.log',
      log_file: '/var/log/pm2/gadgetslagbe-api-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
    },
    {
      name: 'gadgetslagbe-client',
      cwd: './client',
      script: 'npm',
      args: 'run dev',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5173,
      },
      max_memory_restart: '300M',
      watch: false,
      error_file: '/var/log/pm2/gadgetslagbe-client-error.log',
      out_file: '/var/log/pm2/gadgetslagbe-client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
    },
    {
      name: 'gadgetslagbe-admin',
      cwd: './admin',
      script: 'npm',
      args: 'run dev',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5174,
      },
      max_memory_restart: '300M',
      watch: false,
      error_file: '/var/log/pm2/gadgetslagbe-admin-error.log',
      out_file: '/var/log/pm2/gadgetslagbe-admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
    },
  ],
};
