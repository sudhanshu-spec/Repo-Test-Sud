/**
 * PM2 Ecosystem Configuration File
 * 
 * This configuration file defines how PM2 should manage the Express.js application.
 * It supports cluster mode for utilizing all CPU cores and provides environment-specific
 * configurations for development and production deployments.
 * 
 * Usage:
 *   Development: pm2 start ecosystem.config.js
 *   Production:  pm2 start ecosystem.config.js --env production
 *   Stop:        pm2 stop ecosystem.config.js
 *   Restart:     pm2 restart ecosystem.config.js
 *   Reload:      pm2 reload ecosystem.config.js (zero-downtime)
 *   Delete:      pm2 delete ecosystem.config.js
 * 
 * @see https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // Application name displayed in PM2 process list
      name: 'express-server',
      
      // Entry point script
      script: './server.js',
      
      // Number of instances (cluster mode)
      // 'max' uses all available CPU cores
      instances: 'max',
      
      // Enable cluster mode for load balancing across instances
      exec_mode: 'cluster',
      
      // Automatically restart on file changes (disable in production)
      watch: false,
      
      // Maximum memory threshold before automatic restart (in bytes)
      // 500MB per instance
      max_memory_restart: '500M',
      
      // Delay between restart attempts (exponential backoff)
      exp_backoff_restart_delay: 100,
      
      // Merge logs from all cluster instances
      merge_logs: true,
      
      // Log file paths
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      
      // Log date format
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Default environment variables (development)
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        LOG_LEVEL: 'debug'
      },
      
      // Production environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        LOG_LEVEL: 'info'
      },
      
      // Test environment variables
      env_test: {
        NODE_ENV: 'test',
        PORT: 3001,
        LOG_LEVEL: 'warn'
      }
    }
  ]
};
