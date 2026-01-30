# SSL/TLS Certificates

## Overview

This directory is designated for storing SSL/TLS certificates required for HTTPS support in the application. The certificates enable encrypted communication between clients and the server, protecting data in transit from interception and tampering.

**Important**: Certificate files (`key.pem` and `cert.pem`) are not included in the repository and must be generated locally or obtained from a Certificate Authority (CA).

---

## Development Setup

For local development, you can generate a self-signed certificate using OpenSSL. This certificate will enable HTTPS on your development server.

### Generate Self-Signed Certificate

Run the following command from the **project root directory**:

```bash
openssl req -x509 -newkey rsa:4096 -keyout certificates/key.pem -out certificates/cert.pem -days 365 -nodes -subj "/CN=localhost"
```

#### Command Explanation

| Parameter | Description |
|-----------|-------------|
| `req -x509` | Generate a self-signed certificate |
| `-newkey rsa:4096` | Create a new 4096-bit RSA private key |
| `-keyout certificates/key.pem` | Output path for the private key file |
| `-out certificates/cert.pem` | Output path for the certificate file |
| `-days 365` | Certificate validity period (1 year) |
| `-nodes` | Do not encrypt the private key (no password required) |
| `-subj "/CN=localhost"` | Set the certificate Common Name to localhost |

### Alternative: Generate from within the certificates directory

```bash
cd certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```

---

## Required Files

After generating certificates, this directory should contain:

| File | Description | Required |
|------|-------------|----------|
| `key.pem` | Private key file - Used by the server to decrypt incoming traffic and sign responses | **Yes** |
| `cert.pem` | Certificate file - Contains the public key and is sent to clients to establish trust | **Yes** |
| `.gitkeep` | Placeholder file to ensure directory is tracked by Git | Included |
| `README.md` | This documentation file | Included |

---

## Environment Variables

The application references certificate paths through environment variables defined in your `.env` file:

```bash
# SSL Certificate Configuration
SSL_KEY_PATH=./certificates/key.pem
SSL_CERT_PATH=./certificates/cert.pem
```

You can customize these paths if your certificates are stored in a different location. See the `.env.example` file in the project root for all available configuration options.

---

## Security Notice

### ⚠️ Critical Security Warnings

1. **Never commit private keys to version control**
   - The `key.pem` file contains sensitive cryptographic material
   - Exposing private keys compromises all encrypted communications
   - Leaked keys must be immediately revoked and regenerated

2. **Certificate files are excluded via `.gitignore`**
   - The project's `.gitignore` file excludes `*.pem` files
   - This prevents accidental commits of certificate files
   - Verify `.gitignore` is configured correctly before committing

3. **Protect file permissions**
   - Private keys should have restricted permissions (600 or 400)
   - Run: `chmod 600 certificates/key.pem`

4. **Self-signed certificates are for development only**
   - Do not use self-signed certificates in production
   - Self-signed certificates do not provide identity verification
   - Users will see browser security warnings with self-signed certs

---

## Production Certificates

For production deployments, you must use certificates signed by a trusted Certificate Authority (CA).

### Recommended: Let's Encrypt

[Let's Encrypt](https://letsencrypt.org/) provides free, automated, and trusted SSL certificates.

**Benefits:**
- Free of charge
- Automated renewal via Certbot or similar tools
- Trusted by all major browsers
- Supports wildcard certificates

**Getting Started with Certbot:**

```bash
# Install Certbot (Ubuntu/Debian)
sudo apt-get install certbot

# Obtain certificate (standalone mode)
sudo certbot certonly --standalone -d yourdomain.com

# Certificates are typically stored in:
# /etc/letsencrypt/live/yourdomain.com/privkey.pem (private key)
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem (certificate)
```

### Other Certificate Authorities

You may also obtain certificates from commercial CAs:
- DigiCert
- Comodo/Sectigo
- GlobalSign
- GoDaddy SSL

### Production Configuration

Update your environment variables to point to production certificates:

```bash
# Production SSL Configuration
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

---

## Browser Warning (Development)

When using self-signed certificates during development, you will encounter browser security warnings:

### Expected Warnings

| Browser | Warning Message |
|---------|-----------------|
| Chrome | "Your connection is not private" (NET::ERR_CERT_AUTHORITY_INVALID) |
| Firefox | "Warning: Potential Security Risk Ahead" |
| Safari | "This Connection Is Not Private" |
| Edge | "Your connection isn't private" |

### Bypassing Warnings (Development Only)

**Chrome:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"

**Firefox:**
1. Click "Advanced"
2. Click "Accept the Risk and Continue"

**Safari:**
1. Click "Show Details"
2. Click "visit this website"

### Why This Happens

Self-signed certificates are not issued by a trusted Certificate Authority. Browsers cannot verify the certificate's authenticity, hence the security warning. This is expected behavior in development and does not indicate a problem with your certificate generation.

**Note**: These warnings will not appear when using CA-signed certificates in production.

---

## Troubleshooting

### Common Issues

**1. "Unable to load private key" error**
- Verify the `key.pem` file exists in the certificates directory
- Check file permissions: `ls -la certificates/`
- Ensure the file is not empty or corrupted

**2. "Certificate and private key do not match" error**
- Regenerate both files using the OpenSSL command above
- Ensure you're not mixing certificates from different generation attempts

**3. "Permission denied" error**
- Check file ownership and permissions
- Run: `chmod 644 certificates/cert.pem && chmod 600 certificates/key.pem`

**4. OpenSSL not found**
- Install OpenSSL on your system:
  - **macOS**: `brew install openssl`
  - **Ubuntu/Debian**: `sudo apt-get install openssl`
  - **Windows**: Download from [OpenSSL website](https://slproweb.com/products/Win32OpenSSL.html)

---

## Additional Resources

- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Node.js TLS Documentation](https://nodejs.org/api/tls.html)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OWASP TLS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
