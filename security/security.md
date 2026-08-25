# Web Application Security: Complete Reference Guide

This document covers the essential concepts, architectures, and prevention strategies for securing modern web applications.

---

## 1. Authentication vs. Authorization

```
  Authentication (Who are you?) ────► Verification ───┐
                                                       ▼
  Authorization (What can you do?) ──► Permissions ──► Access Granted / Denied
```

* **Authentication (AuthN):** The process of verifying the identity of a user, device, or system. 
  * *Examples:* Entering a password, fingerprint scan, verifying a JWT, or receiving an SMS OTP.
* **Authorization (AuthZ):** The process of verifying what an authenticated user is permitted to do.
  * *Examples:* Check if a user has the `admin` role, checking if a user owns a specific document before letting them delete it (RBAC/ABAC).

---

## 2. JWT (JSON Web Token) vs. Sessions

### Sessions (Stateful)
* **How it works:** 
  1. The user logs in, and the server creates a session store record (in memory or a database like Redis).
  2. The server sends a unique `Session ID` to the browser in a secure, `HTTPOnly` cookie.
  3. On subsequent requests, the browser sends the cookie back. The server looks up the Session ID in its store.
* **Pros:** Easy to revoke instantly (just delete the session from Redis).
* **Cons:** Hard to scale across multiple servers (requires shared session storage).

### JWT (Stateless)
* **How it works:**
  1. The user logs in, and the server generates a token signed with a secret key.
  2. The token is sent to the client (stored in memory or cookies) and contains claims (user ID, expiration).
  3. The server validates the token signature on each request without querying a database.
* **Structure:** `header.payload.signature` (Base64Url encoded).
* **Pros:** Highly scalable, stateless, works great for microservices.
* **Cons:** Cannot be easily revoked before expiration unless a blacklist database is implemented.

---

## 3. OAuth 2.0 & OpenID Connect (OIDC)

### OAuth 2.0 (Authorization Framework)
OAuth 2.0 is designed **exclusively to delegate access**. It allows a third-party application to access APIs on behalf of a user without learning their credentials.
* *Analogy:* A valet key that allows a driver to park your car but not open the glove box.
* *Key Grant Types:* 
  * **Authorization Code (with PKCE):** Used by Web and Mobile Apps (highly secure).
  * **Client Credentials:** Used for machine-to-machine communication (e.g., backend service to service).

### OpenID Connect (Authentication Layer)
OIDC is a simple **identity layer built on top of OAuth 2.0**. While OAuth 2.0 returns an *Access Token* (meant for APIs), OIDC adds an *ID Token* (a JWT containing user profile details like email and name) so the app knows *who* the user is.
* *Rule:* OAuth 2.0 is for **Authorization** (Access Tokens); OIDC is for **Authentication** (ID Tokens).

---

## 4. Web Vulnerabilities & Prevention

### CORS (Cross-Origin Resource Sharing)
CORS is a browser security mechanism, **not** an API security feature. It prevents a malicious website on Domain A from reading data from your API on Domain B unless your API explicitly allows it.
* **How it works:** For write/delete requests, the browser sends a pre-flight `OPTIONS` request asking the server if the cross-origin request is allowed.
* **Prevention:** Configure your CORS middleware strictly. Never use `Access-Control-Allow-Origin: *` in production if your API handles credentials (cookies/auth headers).

### CSRF (Cross-Site Request Forgery)
CSRF occurs when a malicious site tricks a user's browser into executing an unwanted action on a trusted site where the user is currently authenticated.
* *Example:* Clicking a link on `evil.com` sends a request to `bank.com/transfer?amount=1000` using the user's active session cookies.
* **Prevention:**
  1. Use `SameSite=Strict` or `SameSite=Lax` flags on session cookies.
  2. Implement **CSRF Tokens** (a unique, secret token required in request bodies).
  3. Require custom headers (like `X-Requested-With`) which browsers block in cross-origin requests.

### XSS (Cross-Site Scripting)
XSS happens when an attacker injects malicious JavaScript code into a trusted website, which then runs in another user's browser.
* *Types:* 
  * **Stored XSS:** The script is saved to the database (e.g., inside a comment field) and executed whenever someone loads the page.
  * **Reflected XSS:** The script is reflected off the server response via a query parameter.
* **Prevention:**
  1. Escape and sanitize all user input before rendering it in the HTML DOM.
  2. Set a strong **Content Security Policy (CSP)** HTTP header to restrict where scripts can be loaded from.
  3. Use `HTTPOnly` flags on sensitive cookies to prevent JS from reading them.

### SQL & NoSQL Injection
Injection occurs when untrusted user input is concatenated directly into database queries, allowing attackers to execute arbitrary database commands.

```javascript
// ❌ DANGEROUS SQL INJECTION
const query = `SELECT * FROM users WHERE username = '${req.body.username}'`;
// If input is "admin' OR '1'='1", the query becomes:
// SELECT * FROM users WHERE username = 'admin' OR '1'='1' (returns all users)

// ❌ DANGEROUS NoSQL INJECTION (MongoDB)
const query = { username: req.body.username, password: req.body.password };
// If password is sent as {"$gt": ""}, it queries: Where password is greater than empty string.
```

* **Prevention:**
  * **SQL:** Use Parameterized Queries (Prepared Statements) or an ORM (Prisma, TypeORM).
  * **NoSQL:** Sanitize input queries, enforce strict Mongoose schemas, and use libraries like `mongo-sanitize`.

---

## 5. Defensive Implementation Tactics

### Password Hashing
Passwords must **never** be stored in plaintext. They should be hashed using slow, secure, cryptographic hashing algorithms.
* *Best Algorithms:* **Argon2** (current standard), **bcrypt**, or **scrypt**.
* **Salt:** A random string appended to the password before hashing to defeat precomputed lookup attacks (rainbow tables).
* **Pepper:** A secret key stored outside the database (e.g., in environment variables) added to the password to protect hashes if the database is breached.

### Rate Limiting
Protects endpoints (especially login/forgot-password) from brute-force attacks and DDoS.
* **How to implement:** Enforce a limit on the number of requests an IP can make within a time window (e.g., maximum 5 login attempts per minute).
* *Tools:* `express-rate-limit` middleware, or rate-limiting at the reverse proxy (Nginx/Cloudflare) using Redis.

### Secrets Management
* **Never commit secrets (API keys, DB URIs, private keys) to Git.**
* Use environment variables (`.env`) for local development, and load them using libraries like `dotenv`.
* In production, use managed secret stores (e.g., AWS Secrets Manager, HashiCorp Vault, or GitHub Secrets).

---

## 6. OWASP Top 10 (2021 Overview)

The Open Web Application Security Project (OWASP) lists the top 10 most critical security risks:

1. **A01:2021-Broken Access Control:** Users acting outside of their permissions (e.g., accessing someone else's account).
2. **A02:2021-Cryptographic Failures:** Storing passwords in plaintext, using weak encryption keys, or transmitting sensitive data without SSL/TLS.
3. **A03:2021-Injection:** SQL, NoSQL, or Command injection due to unvalidated inputs.
4. **A04:2021-Insecure Design:** Flaws in application threat modeling and architecture.
5. **A05:2021-Security Misconfiguration:** Using default passwords, enabling debug headers, or leaving ports open.
6. **A06:2021-Vulnerable and Outdated Components:** Using packages with known security exploits. (Run `npm audit`).
7. **A07:2021-Identification and Authentication Failures:** Weak password policies, vulnerable session IDs, or missing MFA.
8. **A08:2021-Software and Data Integrity Failures:** Auto-updating software without verifying signatures.
9. **A09:2021-Security Logging and Monitoring Failures:** Failing to log critical events (like failed logins), leaving operations blind to active attacks.
10. **A10:2021-Server-Side Request Forgery (SSRF):** A server fetching a URL specified by an attacker (e.g., accessing internal AWS metadata APIs).
