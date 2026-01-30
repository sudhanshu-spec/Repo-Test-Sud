# Repo-Test-Sud

A secure Node.js Express tutorial application demonstrating production-ready security best practices including HTTPS encryption, security headers, rate limiting, CORS configuration, and input validation.

## Table of Contents

- [Overview](#overview)
- [Security Features](#security-features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Certificate Setup](#certificate-setup)
- [Environment Configuration](#environment-configuration)
- [Starting the Server](#starting-the-server)
- [Security Headers](#security-headers)
- [API Endpoints](#api-endpoints)
- [Testing Security](#testing-security)
- [Production Recommendations](#production-recommendations)

## Overview

This application implements a comprehensive security middleware stack for Express.js applications, following OWASP security guidelines and Express.js best practices. The security implementation includes:

- **Transport Layer Security (TLS/HTTPS)**: All traffic is encrypted using HTTPS
- **Security Headers (Helmet.js)**: 13 security headers protecting against XSS, clickjacking, and MIME sniffing
- **Rate Limiting**: Protection against DoS attacks and brute force attempts
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Input Validation**: Request sanitization and validation using express-validator

## Security Features

| Feature | Package | Purpose |
|---------|---------|---------|
| Security Headers | helmet@^8.1.0 | Adds 13 HTTP security headers |
| Rate Limiting | express-rate-limit@^8.2.1 | Prevents abuse and DoS attacks |
| CORS | cors@^2.8.5 | Controls cross-origin requests |
| Input Validation | express-validator@^7.3.1 | Sanitizes and validates input |
| HTTPS | Node.js https module | Encrypts all traffic |

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x LTS or 20.x LTS (recommended)
- **npm**: Version 9.x or higher (comes with Node.js)
- **OpenSSL**: For generating self-signed certificates (usually pre-installed on Linux/macOS)

Verify your Node.js version:

```bash
node --version
# Expected: v18.x.x or v20.x.x
```

Verify npm version:

```bash
npm --version
# Expected: 9.x.x or higher
```

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd Repo-Test-Sud
```

2. Install dependencies:

```bash
npm install
```

This will install all required security packages:
- express@^4.21.0
- helmet@^8.1.0
- express-rate-limit@^8.2.1
- cors@^2.8.5
- express-validator@^7.3.1
- dotenv@^16.4.0

3. Verify no vulnerabilities exist:

```bash
npm audit
# Expected: found 0 vulnerabilities
```

## Certificate Setup

For HTTPS to work, you need SSL/TLS certificates. For development, generate self-signed certificates:

### Generate Self-Signed Certificate (Development Only)

1. Create the certificates directory:

```bash
mkdir -p certificates
```

2. Generate the private key and certificate:

```bash
openssl req -x509 -newkey rsa:4096 \
  -keyout certificates/key.pem \
  -out certificates/cert.pem \
  -days 365 -nodes \
  -subj "/CN=localhost"
```

This creates:
- `certificates/key.pem` - Private key (keep secure, never commit)
- `certificates/cert.pem` - Public certificate

### Production Certificates

For production environments, obtain certificates from a trusted Certificate Authority (CA) such as:
- Let's Encrypt (free)
- DigiCert
- Comodo

**Important**: Never commit private keys to version control. The `certificates/` directory is excluded in `.gitignore`.

## Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Configure the environment variables:

```env
# Environment mode: development or production
NODE_ENV=development

# Server ports
HTTPS_PORT=3443
HTTP_PORT=3000

# SSL Certificate paths
SSL_KEY_PATH=./certificates/key.pem
SSL_CERT_PATH=./certificates/cert.pem

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes in milliseconds
RATE_LIMIT_MAX=100             # Maximum requests per window

# CORS configuration (comma-separated list of allowed origins)
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://localhost:3443
```

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode (development/production) | development |
| `HTTPS_PORT` | Port for HTTPS server | 3443 |
| `HTTP_PORT` | Port for HTTP server (redirects to HTTPS) | 3000 |
| `SSL_KEY_PATH` | Path to SSL private key file | ./certificates/key.pem |
| `SSL_CERT_PATH` | Path to SSL certificate file | ./certificates/cert.pem |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window duration in ms | 900000 (15 min) |
| `RATE_LIMIT_MAX` | Maximum requests per window per IP | 100 |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | http://localhost:3000 |

## Starting the Server

### Development Mode

Start the server with auto-reload on file changes:

```bash
npm run dev
```

### Production Mode

Start the server in production mode:

```bash
NODE_ENV=production npm start
```

### Expected Output

```
🔒 Secure Express server running on:
   HTTPS: https://localhost:3443
   HTTP:  http://localhost:3000 (redirects to HTTPS)

Security middleware enabled:
   ✓ Helmet.js security headers
   ✓ Rate limiting (100 requests per 15 minutes)
   ✓ CORS protection
   ✓ Input validation
```

**Note**: When using self-signed certificates, your browser will display a security warning. This is expected in development. Click "Advanced" and proceed to the site.

## Security Headers

The application uses Helmet.js to set the following security headers:

| Header | Value/Purpose |
|--------|---------------|
| `Content-Security-Policy` | Prevents XSS attacks by controlling resource loading |
| `Cross-Origin-Opener-Policy` | Isolates browsing context |
| `Cross-Origin-Resource-Policy` | Controls cross-origin resource access |
| `Origin-Agent-Cluster` | Enables origin-keyed agent clusters |
| `Referrer-Policy` | Controls referrer information |
| `Strict-Transport-Security` | Enforces HTTPS (max-age=31536000; includeSubDomains) |
| `X-Content-Type-Options` | Prevents MIME sniffing (nosniff) |
| `X-DNS-Prefetch-Control` | Controls DNS prefetching |
| `X-Download-Options` | Prevents IE from executing downloads |
| `X-Frame-Options` | Prevents clickjacking (SAMEORIGIN) |
| `X-Permitted-Cross-Domain-Policies` | Controls Adobe cross-domain policies |
| `X-XSS-Protection` | Disabled (CSP is preferred) |

**Removed Header**: `X-Powered-By` - Prevents server fingerprinting by hiding that Express.js is used.

## API Endpoints

### GET /hello

Returns a hello greeting message.

**Request:**
```bash
curl -k https://localhost:3443/hello
```

**Response:**
```json
{
  "message": "Hello, World!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /evening

Returns an evening greeting message.

**Request:**
```bash
curl -k https://localhost:3443/evening
```

**Response:**
```json
{
  "message": "Good Evening!",
  "timestamp": "2024-01-15T18:30:00.000Z"
}
```

**Note**: The `-k` flag is used with curl to accept self-signed certificates in development.

## Testing Security

### Verify Security Headers

Check that all security headers are present:

```bash
curl -k -I https://localhost:3443/hello
```

**Expected headers in response:**
```
HTTP/2 200
content-security-policy: default-src 'self';...
cross-origin-opener-policy: same-origin
cross-origin-resource-policy: same-origin
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
```

**Verify X-Powered-By is removed** (should NOT appear in headers).

### Test Rate Limiting

Send multiple requests to trigger rate limiting:

```bash
# Send 105 requests rapidly
for i in {1..105}; do 
  echo "Request $i: $(curl -k -s -o /dev/null -w "%{http_code}" https://localhost:3443/hello)"
done
```

**Expected behavior:**
- Requests 1-100: Return `200` status code
- Requests 101+: Return `429` (Too Many Requests)

Check rate limit headers:

```bash
curl -k -I https://localhost:3443/hello
```

**Rate limit headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: <timestamp>
```

### Test CORS

Test request from an allowed origin:

```bash
curl -k -H "Origin: http://localhost:3000" \
  -I https://localhost:3443/hello
```

**Expected:** `Access-Control-Allow-Origin: http://localhost:3000`

Test request from a blocked origin:

```bash
curl -k -H "Origin: http://malicious-site.com" \
  -I https://localhost:3443/hello
```

**Expected:** No `Access-Control-Allow-Origin` header in response.

### Test HTTPS/TLS

Verify TLS connection:

```bash
openssl s_client -connect localhost:3443 -tls1_2
```

**Expected:** Successful TLS 1.2 handshake with certificate information displayed.

### Test Input Validation

Test with valid input:

```bash
curl -k -X POST https://localhost:3443/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

**Expected:** `200 OK` with success response.

Test with XSS payload (should be rejected or escaped):

```bash
curl -k -X POST https://localhost:3443/api/data \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(1)</script>"}'
```

**Expected:** `400 Bad Request` with validation error, or sanitized input.

## Production Recommendations

Before deploying to production, ensure you:

1. **Use CA-signed certificates**: Replace self-signed certificates with certificates from a trusted Certificate Authority

2. **Configure proper CORS origins**: Update `CORS_ALLOWED_ORIGINS` to include only your production domains

3. **Set NODE_ENV=production**: This enables production optimizations and stricter security

4. **Use external rate limit store**: For multi-instance deployments, configure Redis or Memcached as the rate limit store

5. **Review Content-Security-Policy**: Customize CSP rules based on your application's specific resource needs

6. **Enable HTTP to HTTPS redirect**: Ensure all HTTP traffic is redirected to HTTPS

7. **Consider reverse proxy**: Use nginx or a load balancer in front of Node.js for additional security and performance

8. **Regular security audits**: Run `npm audit` regularly and keep dependencies updated

## License

This project is provided for educational purposes demonstrating security best practices for Node.js Express applications.
