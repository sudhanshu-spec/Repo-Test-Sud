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

### Environment Variables

- `PORT` - Server listening port (default: 3000)
- `DB` - Database connection string (optional)
