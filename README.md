# Repo-Test-Sud
Testing Existing and New Projects

## Node.js Express Server

This project includes a Node.js server built with Express.js framework.

### Setup

```bash
npm install
npm start
```

### Endpoints

| Route | Method | Response |
|-------|--------|----------|
| `/` | GET | "Hello world" |
| `/evening` | GET | "Good evening" |

### Testing

Run automated tests:
```bash
npm test
```

### Security Features

This application implements a comprehensive security middleware stack following Express.js and OWASP security best practices.

#### Security Headers (Helmet.js)

The application uses [Helmet.js](https://helmetjs.github.io/) v8.1.0 to set secure HTTP response headers. Helmet automatically configures the following security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Restrictive default-src 'self' | Mitigates XSS and injection attacks |
| Cross-Origin-Opener-Policy | same-origin | Process isolation for cross-origin protection |
| Cross-Origin-Resource-Policy | same-origin | Blocks cross-origin resource loading |
| Origin-Agent-Cluster | Enabled | Origin-based process isolation |
| Referrer-Policy | no-referrer | Prevents referrer information leakage |
| Strict-Transport-Security | max-age=31536000; includeSubDomains | Enforces HTTPS connections |
| X-Content-Type-Options | nosniff | Prevents MIME type sniffing |
| X-DNS-Prefetch-Control | off | Disables DNS prefetching for privacy |
| X-Download-Options | noopen | Prevents IE download execution |
| X-Frame-Options | SAMEORIGIN | Prevents clickjacking attacks |
| X-XSS-Protection | 0 | Disables legacy browser XSS filter (recommended) |

**Note:** The `X-Powered-By` header is automatically removed by Helmet to prevent server fingerprinting.

#### CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured using the [cors](https://github.com/expressjs/cors) middleware v2.8.5.

**Configuration Options:**

| Setting | Default | Description |
|---------|---------|-------------|
| `origin` | `*` (development) | Allowed origins for cross-origin requests |
| `methods` | `GET, POST, PUT, DELETE` | Allowed HTTP methods |
| `optionsSuccessStatus` | `200` | Status code for successful OPTIONS preflight |

**Production Recommendation:** Configure specific allowed origins using the `CORS_ORIGIN` environment variable:

```bash
# Single origin
CORS_ORIGIN=https://yourdomain.com

# Multiple origins (comma-separated)
CORS_ORIGIN=https://app.example.com,https://admin.example.com
```

#### Rate Limiting

Protection against brute-force and denial-of-service (DoS) attacks is implemented using [express-rate-limit](https://express-rate-limit.mintlify.app/) v8.2.1.

**Default Configuration:**

| Setting | Default Value | Description |
|---------|---------------|-------------|
| `windowMs` | 900000 (15 minutes) | Time window for rate limiting |
| `limit` | 100 | Maximum requests per window per IP |
| `standardHeaders` | `draft-8` | Modern RateLimit header format |
| `legacyHeaders` | `false` | Disable deprecated X-RateLimit headers |

**Response Headers:** When rate limiting is active, the following headers are included in responses:

- `RateLimit-Limit` - Maximum requests allowed
- `RateLimit-Remaining` - Remaining requests in current window
- `RateLimit-Reset` - Time until the rate limit resets

**Rate Limit Exceeded Response:**
```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 900
}
```

HTTP Status Code: `429 Too Many Requests`

#### Input Validation

Input validation is implemented using [express-validator](https://express-validator.github.io/docs/) v7.3.1, which wraps the battle-tested validator.js library.

**Validation Features:**

- Request parameter validation
- Request body validation
- Query string validation
- Custom error messages
- Sanitization of input data

**Validation Error Response:**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "ID must be a positive integer",
      "path": "id",
      "location": "params"
    }
  ]
}
```

HTTP Status Code: `400 Bad Request`

#### HTTPS/TLS Support

The application supports HTTPS for secure transport layer encryption.

**Enabling HTTPS:**

1. Set the `HTTPS_ENABLED` environment variable to `true`
2. Place TLS certificates in the `certs/` directory:
   - `certs/server.key` - Private key file
   - `certs/server.cert` - Certificate file

**Development Self-Signed Certificates:**

Generate self-signed certificates for development:

```bash
mkdir -p certs
openssl req -x509 -newkey rsa:4096 -keyout certs/server.key -out certs/server.cert -days 365 -nodes -subj "/CN=localhost"
```

**Production Recommendation:** Use certificates from a trusted Certificate Authority (CA) such as Let's Encrypt.

### Security Testing

Verify security implementation with the following commands:

**Check Security Headers:**
```bash
curl -I http://localhost:3000
```

Expected: All security headers present, `X-Powered-By` absent.

**Test Rate Limiting:**
```bash
# Send 105 requests to trigger rate limiting
for i in {1..105}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000; done
```

Expected: First 100 requests return `200`, subsequent requests return `429`.

**Security Audit:**
```bash
npm audit
```

Expected: `0 vulnerabilities` reported.

**Run Security Tests:**
```bash
npm test
```

Expected: All security test cases pass.

### Environment Variables

#### Core Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server listening port |
| `DB` | (empty) | Database connection string (optional) |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`) |

#### Security Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated for multiple) |
| `RATE_LIMIT_WINDOW` | `900000` | Rate limit time window in milliseconds (default: 15 minutes) |
| `RATE_LIMIT_MAX` | `100` | Maximum requests per rate limit window |
| `HTTPS_ENABLED` | `false` | Enable HTTPS/TLS support |

#### Example .env Configuration

```bash
# Core
PORT=3000
NODE_ENV=production

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
HTTPS_ENABLED=true
```

### Security Best Practices

This implementation follows security recommendations from:

- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP Node.js Security Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

**Key Security Measures:**

1. **Defense in Depth** - Multiple layers of security middleware
2. **Secure by Default** - Security features enabled out of the box
3. **Environment-Aware** - Different configurations for development and production
4. **Minimal Attack Surface** - Server information disclosure prevented
