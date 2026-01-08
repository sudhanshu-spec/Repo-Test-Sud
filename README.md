# Repo-Test-Sud
Testing Existing and New Projects

## Node.js Express Server

This project includes a Node.js server built with Express.js framework, enhanced with production-ready middleware, environment configuration, and PM2 process management.

### Setup

```bash
npm install
npm start
```

### Middleware

The server includes a production-ready middleware stack configured in the following order:

| Middleware | Package | Purpose |
|------------|---------|---------|
| Security Headers | `helmet` | Sets secure HTTP headers (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, etc.) |
| Response Compression | `compression` | Gzip compression for reduced response sizes (50-70% reduction) |
| CORS Support | `cors` | Enables Cross-Origin Resource Sharing for API consumers |
| Request Logging | `morgan` | HTTP request logging with environment-aware formats ('combined' for production, 'dev' for development) |
| Environment Config | `dotenv` | Loads environment variables from `.env` file |

### Endpoints

| Route | Method | Response |
|-------|--------|----------|
| `/` | GET | "Hello world" |
| `/evening` | GET | "Good evening" |
| `/health` | GET | JSON health check response |

### Health Check Endpoint

The `/health` endpoint provides server health information for load balancers and monitoring systems.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.123
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Server health status ("healthy") |
| `timestamp` | string | ISO 8601 formatted current timestamp |
| `uptime` | number | Server uptime in seconds |

### Testing

Run automated tests:
```bash
npm test
```

### Environment Variables

Configure the application using environment variables. Create a `.env` file from the template:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment (`development` or `production`) |
| `PORT` | `3000` | Server listening port |
| `LOG_LEVEL` | `info` | Logging verbosity (`info`, `debug`, `error`) |
| `DB_Host` | - | Database host address |
| `DB` | - | Database connection string (legacy, maintained for compatibility) |
| `API_KEY` | - | External API authentication key |

### PM2 Deployment

This project supports production deployment using PM2 process manager with cluster mode for optimal performance.

#### Prerequisites

Install PM2 globally on your production server:
```bash
npm install -g pm2
```

#### PM2 Commands

| Command | npm Script | Description |
|---------|------------|-------------|
| Start Production | `npm run start:prod` | Start server in production mode with PM2 cluster |
| Stop Server | `pm2 stop ecosystem.config.js` | Stop all PM2 processes |
| Restart Server | `pm2 restart ecosystem.config.js` | Restart with zero-downtime |
| Monitor Processes | `pm2 monit` | Real-time process monitoring dashboard |
| View Logs | `pm2 logs` | View aggregated application logs |
| Process Status | `pm2 status` | List all running processes |

#### Quick Start

```bash
# Start in production mode
npm run start:prod

# Or directly with PM2
pm2 start ecosystem.config.js --env production

# Monitor running processes
pm2 monit

# View logs
pm2 logs

# Restart with zero-downtime
pm2 reload ecosystem.config.js
```

### Production Deployment

Follow these steps for production deployment:

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd Repo-Test-Sud
   npm install --production
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Set Production Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=3000
   DB_Host=your-database-host
   API_KEY=your-api-key
   ```

4. **Install PM2 Globally**
   ```bash
   npm install -g pm2
   ```

5. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

6. **Configure PM2 Startup (Optional)**
   ```bash
   # Generate startup script for OS boot
   pm2 startup
   
   # Save current process list
   pm2 save
   ```

7. **Verify Deployment**
   ```bash
   # Check process status
   pm2 status
   
   # Test health endpoint
   curl http://localhost:3000/health
   ```

### Production Features

- **Cluster Mode**: Utilizes all CPU cores for maximum performance
- **Zero-Downtime Restarts**: Use `pm2 reload` for seamless updates
- **Auto-Restart**: Automatically restarts on crash
- **Log Management**: Centralized logging with PM2
- **Memory Management**: Configurable memory limits with auto-restart
- **Security Headers**: Helmet middleware protects against common vulnerabilities
- **Response Compression**: Gzip compression reduces bandwidth usage
