# Repo-Test-Sud

Testing Existing and New Projects

## Node.js Express Server

This project includes a production-ready Node.js server built with Express.js framework, featuring security middleware, request logging, and PM2 process management support.

### Features

- **Express.js 4.x** - Fast, unopinionated web framework
- **Helmet** - Security HTTP headers protection
- **Morgan** - HTTP request logging
- **CORS** - Cross-Origin Resource Sharing support
- **Compression** - Gzip response compression
- **PM2 Ready** - Cluster mode support for production deployment

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm start

# Start production server with PM2
npm run start:prod
```

### Endpoints

| Route | Method | Response | Description |
|-------|--------|----------|-------------|
| `/` | GET | "Hello world" | Root endpoint |
| `/evening` | GET | "Good evening" | Evening greeting |
| `/health` | GET | JSON | Health check for monitoring/load balancer |

#### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 123.456
}
```

### Middleware Stack

The middleware is configured in the following order for optimal security and performance:

1. **helmet()** - Sets security HTTP headers (CSP, X-Frame-Options, etc.)
2. **compression()** - Compresses responses for reduced bandwidth
3. **cors()** - Handles cross-origin requests
4. **morgan()** - Logs HTTP requests ('combined' in production, 'dev' in development)

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### PM2 Deployment

```bash
# Start in production mode (cluster)
npm run start:prod
# Or: pm2 start ecosystem.config.js --env production

# Stop application
npm run stop
# Or: pm2 stop ecosystem.config.js

# Restart application
npm run restart
# Or: pm2 restart ecosystem.config.js

# Zero-downtime reload
pm2 reload ecosystem.config.js

# View logs
pm2 logs express-server

# Monitor processes
pm2 monit
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Application environment (development/production/test) |
| `PORT` | 3000 | Server listening port |
| `LOG_LEVEL` | info | Logging verbosity (error/warn/info/debug) |
| `DB_Host` | - | Database host address |
| `DB` | - | Database connection string (legacy) |
| `API_KEY` | - | External API authentication key |

### Project Structure

```
├── server.js              # Express application entry point
├── ecosystem.config.js    # PM2 process manager configuration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment template
├── .env                   # Environment variables (not committed)
├── tests/
│   └── server.test.js     # Jest test suite
└── README.md              # This file
```

### License

ISC
