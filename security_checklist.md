# MSRCASC Connect Production Security Checklist

Ensure the following tasks are completed before any code hits the production environment:

## infrastructure & Cloud
- [ ] **Environment Variables:** Secrets (MongoDB credentials, JWT keys, OpenAI keys) are stored in your cloud provider's Secret Manager (e.g., Vercel / Render environment variables) and NEVER committed to source control.
- [ ] **HTTPS Enforced:** All domains route through HTTPS. Traffic to `http://` redirects natively if using modern hosts.
- [ ] **Database Networking:** MongoDB is isolated in a VPC or configured with IP-based access lists allowing ONLY the backend server IPs. The database is NOT publicly exposed.

## Application Security
- [ ] **HTTP-only Cookies Active:** The authentication token is completely detached from localStorage and explicitly using `httpOnly` flags to thwart XSS attacks.
- [ ] **CORS Properly Locked:** `CLIENT_URL` in the environment exactly matches the frontend URL to prevent Cross-Origin abuse.
- [ ] **Global Rate Limiting:** Traffic restrictions (`express-rate-limit`) are dialed in (e.g., max 60 total API route requests per IP per minute).
- [ ] **Brute-Force Protection:** `/api/auth/register` and `/api/auth/login` have strictly aggressive limiters (max 5 requests) configured.
- [ ] **Sanitization:** `express-mongo-sanitize` is preventing object traversal and NoSQL operators (`$`, `.`) from passing through raw bodies.
- [ ] **Header Hardening:** `helmet()` is injecting Content-Security, Strict-Transport-Security, and X-XSS-Protection headers.

## Logging & Monitoring
- [ ] **Audit Logging:** Winston/Morgan are exporting structured logs. Ensure sensitive HTTP headers (like passwords in auth payloads) are explicitly ignored or masked in these logs.
- [ ] **Analytics:** Enable an alert monitor (like Sentry or Datadog) to capture unhandled Node.js exceptions and sudden spikes in 4XX or 5XX return codes.

## Routine Maintenance
- [ ] **Dependency Scans:** Periodically run `npm audit` to determine if downstream vulnerabilities to Express or its plugins emerge. 
- [ ] **Password Rotation:** The `JWT_SECRET` key should be actively rotated once every 6 months to instantly invalidate any hanging legacy sessions.
