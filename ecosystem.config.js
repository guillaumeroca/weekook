module.exports = {
  apps: [
    {
      name: 'weekook-api',
      script: './server/app.js',
      cwd: '/home/weekook/www',
      instances: 1,
      exec_mode: 'fork',
      
      // Environnement
      env: {
        NODE_ENV: 'validation',
        PORT: 3001
      },
      
      // Configuration de démarrage
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      
      // Logs
      log_file: './logs/weekook-api.log',
      out_file: './logs/weekook-api-out.log',
      error_file: './logs/weekook-api-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Gestion des erreurs
      max_restarts: 3,
      min_uptime: '10s',
      max_memory_restart: '500M',
      
      // Auto-restart
      autorestart: true,
      restart_delay: 4000,
      
      // Variables d'environnement spécifiques à Infomaniak
      env_validation: {
        NODE_ENV: 'validation',
        PORT: 3001,
        
        // Base de données Infomaniak
        DATABASE_URL: 'mysql://6501ew_WeekookVA:Weekookmania1-1@6501ew.myd.infomaniak.com/6501ew_WeeKooK_VAL',
        DATABASE_HOST: '6501ew.myd.infomaniak.com',
        DATABASE_PORT: 3306,
        DATABASE_NAME: '6501ew_WeeKooK_VAL',
        DATABASE_USER: '6501ew_WeekookVA',
        DATABASE_PASSWORD: 'Weekookmania1-1',
        
        // URLs de validation
        BASE_URL: 'https://val.weekook.com',
        API_BASE_URL: 'https://val-api.weekook.com',
        CORS_ORIGIN: 'https://val.weekook.com',
        
        // Sécurité
        JWT_SECRET: 'VAL-JWT-SECRET-WEEKOOK-2024-CHANGE-ME',
        JWT_EXPIRES_IN: '7d',
        TRUST_PROXY: true,
        
        // Email Infomaniak
        SMTP_HOST: 'mail.infomaniak.com',
        SMTP_PORT: 587,
        SMTP_USER: 'noreply@weekook.com',
        SMTP_PASS: 'VOTRE_PASSWORD_EMAIL_VAL',
        
        // Upload
        UPLOAD_MAX_SIZE: 10485760,
        UPLOAD_ALLOWED_TYPES: 'image/jpeg,image/png,image/webp'
      }
    },
    
    {
      name: 'weekook-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/home/weekook/www',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'validation'
      },
      
      // Logs
      log_file: './logs/weekook-frontend.log',
      out_file: './logs/weekook-frontend-out.log',
      error_file: './logs/weekook-frontend-error.log',
      
      // Gestion des erreurs
      max_restarts: 3,
      min_uptime: '10s',
      autorestart: true,
      restart_delay: 4000
    }
  ],
  
  deploy: {
    validation: {
      user: 'weekook',
      host: 'ssh-weekook.alwaysdata.net',
      ref: 'origin/validation',
      repo: 'git@github.com:your-repo/weekook.git',
      path: '/home/weekook/www',
      
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && npm run build:val && npm run db:migrate && pm2 reload ecosystem.config.js --env validation',
      'pre-setup': 'mkdir -p /home/weekook/www/logs'
    }
  }
};