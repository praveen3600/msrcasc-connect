---
description: Full-stack debug sweep — analyze the entire MSRCASC Connect codebase (client + server) to find and fix bugs
---

# Full-Stack Debug Sweep

When this workflow is triggered, perform a comprehensive, systematic analysis of the entire MSRCASC Connect project to find bugs, crashes, misconfigurations, and compatibility issues. Follow every phase below in order.

---

## Phase 1: Gather Context

1. Read the server entry point: `server/src/server.js` and `server/src/app.js`
2. Read the client entry point: `client/src/main.jsx` and `client/src/App.jsx`
3. Read `server/package.json` and `client/package.json` — note all dependency versions
4. Read deployment configs: `client/vercel.json`, any `render.yaml`, `.env` files, `Dockerfile`, etc.
5. Check for any recent git changes: `git log --oneline -10` and `git diff HEAD~3 --stat`

## Phase 2: Backend Analysis

Check each of these categories for issues:

### 2a. Dependency Compatibility
- Cross-reference every middleware/library version against the Express version being used
- Flag any packages known to be deprecated, unmaintained, or incompatible (e.g., xss-clean with Express 5)
- Check for known CVEs: `npm audit` in `server/`

### 2b. Middleware Pipeline
- Read `app.js` end-to-end and trace the middleware execution order
- Verify: helmet → logging → CORS → body parsing → cookie parsing → sanitization → rate limiting → routes → error handler
- Check for middleware that crashes on every request (like the express-mongo-sanitize + Express 5 issue)
- Ensure the global error handler has the correct `(err, req, res, next)` signature

### 2c. Routes & Controllers
- Read every route file in `server/src/routes/`
- Read every controller in `server/src/controllers/`
- Check for: unhandled promise rejections, missing `try/catch` or `async` error handling, undefined variables, incorrect status codes, missing auth middleware on protected routes

### 2d. Database & Models
- Read every model in `server/src/models/`
- Check for: missing indexes, schema mismatches, incorrect refs, validation gaps

### 2e. Auth & Security
- Trace the full auth flow: registration → login → token issuance → token verification → protected route access
- Verify JWT/cookie configuration: httpOnly, secure, sameSite, expiry, domain settings
- Check CORS config matches the actual frontend deployment URL
- Check for IDOR vulnerabilities (users accessing other users' data)

### 2f. Socket.io
- Read `server/src/sockets/chatHandler.js`
- Check for: missing auth on socket connections, memory leaks, unhandled events, CORS config for socket.io

## Phase 3: Frontend Analysis

### 3a. Build & Deployment Config
- Verify `vite.config.js` is correct for production
- Verify `vercel.json` has SPA rewrite rules
- Check `index.html` for SEO meta tags, correct script references

### 3b. Routing
- Read `App.jsx` and trace all routes
- Verify protected routes have auth guards
- Check for missing routes, broken links, or redirect loops

### 3c. API Layer
- Read the API client config (e.g., `src/api/index.js` or axios config)
- Verify the base URL is correctly set for production (not hardcoded to localhost)
- Check that credentials: 'include' / withCredentials is set for cookie-based auth
- Look for API calls that don't handle errors

### 3d. Auth Context
- Read `src/context/AuthContext.jsx` (or equivalent)
- Verify: login/logout flows, token refresh logic, loading states, error handling
- Check for race conditions on initial load

### 3e. Components & Pages
- Scan all pages in `src/pages/` for: uncaught errors, missing null checks, broken imports, hardcoded URLs
- Check for console errors that would appear in the browser

## Phase 4: Cross-Stack Issues

- Verify the frontend API base URL matches the backend's deployed URL
- Verify CORS origins on the backend include the frontend's Vercel URL
- Verify cookie domain/path settings work cross-origin (Render backend ↔ Vercel frontend)
- Check environment variable usage — are any missing or misspelled?
- Verify WebSocket connection URL matches the backend

## Phase 5: Report & Fix

1. Create an artifact `debug_report.md` summarizing ALL findings, categorized by severity:
   - 🔴 **CRITICAL** — App crashes, auth bypass, data loss
   - 🟠 **HIGH** — Features broken, security gaps
   - 🟡 **MEDIUM** — Poor UX, missing error handling
   - 🔵 **LOW** — Code quality, minor improvements

2. For each CRITICAL and HIGH issue, apply the fix directly to the codebase.

3. For MEDIUM and LOW issues, document the fix but ask the user before applying.

4. After all fixes, run any available tests and verify the build: `npm run build` in `client/`.

## Phase 6: Deploy

After fixing, ask the user if they want to commit and push all changes to GitHub.
