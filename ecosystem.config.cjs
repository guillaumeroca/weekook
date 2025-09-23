module.exports = {
  apps: [
    {
      name: 'weekook-val-backend',
      script: './server/app.js',
      cwd: '/home/weekook/weekook-val',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_file: '.env',
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true
    },
    {
      name: 'weekook-val-frontend',
      script: 'npm',
      args: 'run preview -- --port 4173 --host 0.0.0.0',
      cwd: '/home/weekook/weekook-val',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env_file: '.env',
      error_file: 'logs/frontend-err.log',
      out_file: 'logs/frontend-out.log',
      log_file: 'logs/frontend-combined.log',
      time: true
    }
  ]
};