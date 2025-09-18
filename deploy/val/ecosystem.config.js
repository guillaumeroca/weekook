module.exports = {
  apps: [
    {
      name: 'weekook-api-val',
      script: 'app.js',
      cwd: '/var/www/weekook-api',
      instances: 1,
      exec_mode: 'cluster',
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'validation',
        PORT: 3001,
      },
      
      // Logs
      log_file: '/var/log/weekook-api-val.log',
      out_file: '/var/log/weekook-api-val-out.log',
      error_file: '/var/log/weekook-api-val-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Monitoring
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 1000,
      
      // Memory et CPU
      max_memory_restart: '500M',
      
      // Reload graceful
      kill_timeout: 5000,
      listen_timeout: 5000,
      
      // Watch (désactivé en production)
      watch: false,
      
      // Ignore certains fichiers
      ignore_watch: [
        'node_modules',
        'logs',
        '*.log'
      ],
      
      // Cron restart (optionnel - tous les jours à 3h)
      cron_restart: '0 3 * * *',
      
      // Merge logs
      merge_logs: true,
      
      // Time zone
      time: true,
      
      // Source map support
      source_map_support: true,
      
      // Interpreter args
      node_args: '--max-old-space-size=512'
    }
  ]
};