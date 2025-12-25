
---

# Scenario 04 — Authentication & Identity (Session-Based Auth)

## 📌 Goal of This Scenario

Build a **production-style authentication system** from scratch using:

* Node.js
* Express
* MongoDB + Mongoose
* Session-based authentication (`express-session`)
* MongoDB session store (`connect-mongo`)

The goal was **not just “make login work”**, but to understand:

* where trust lives
* how the server remembers users
* how bugs actually appear in real backend systems

---

## 🧠 What I Built (End Result)

By the end of this scenario, the system supports:

* Secure user signup
* Secure user login
* Password hashing (never storing raw passwords)
* Session creation and persistence
* Protected routes using middleware
* Proper logout (session destruction)
* MongoDB-backed session storage
* Clean separation of concerns

This is **end-to-end authentication**, not a demo.

---

## 🗂️ Final Project Structure

```
Scenario 04 - Authentication & Identity
├── db.js                 # MongoDB connection logic
├── server.js             # Express server + session config
├── models
│   └── User.js           # User schema, hashing, password comparison
├── routes
│   └── auth.js           # Signup, signin, profile, logout routes
├── middleware
│   └── auth.js           # Route protection middleware
└── README.md
```

Each file has **one responsibility only**.

---

## 🔑 Core Concepts I Learned (This Is the Real Value)

### 1️⃣ Passwords must NEVER be stored raw

* Password hashing must happen **before data reaches the DB**
* Hashing logic belongs in the **model**, not routes
* Used `bcrypt` with a Mongoose `pre("save")` hook
* Routes should never know *how* passwords are hashed

> Invariant:
> **Anything that reaches MongoDB is already safe.**

---

### 2️⃣ Sessions vs Cookies (Critical Understanding)

* Cookie ≠ authentication
* Cookie is just an **identifier**
* Session is **server-side trust**

Flow:

```
Login → create session → send cookie
Next request → cookie sent → session restored → user trusted
```

If the server forgets you, you are logged out — **even if cookies exist**.

---

### 3️⃣ Middleware is where security belongs

Protected routes do NOT check passwords.

They only check one thing:

```js
if (!req.session || !req.session.userId)
```

This single rule controls access to the entire app.

---

### 4️⃣ Logout is NOT cosmetic

Logout means:

* Destroy session on the server
* Clear cookie on the client

If only the cookie is removed → security bug
If only the session is removed → bad UX

Both are required.

---

## 🧪 How I Verified Everything (Testing Mindset)

I manually tested the full lifecycle in Postman:

* Signup (valid + invalid cases)
* Login (correct + incorrect credentials)
* Access protected routes (with and without login)
* Logout
* Access protected routes after logout
* Restart server → session still persists (MongoStore)

This confirmed:

* session persistence
* proper logout
* no trust leakage

---

## 🧨 Pitfalls I Fell Into (And What I Learned)

These mistakes were **the most valuable part** of the scenario.

### ❌ 1. `connect-mongo` version hell

* Different versions expose different APIs
* Learned to **pin versions** instead of trusting tutorials
* Realized many backend bugs are dependency boundary issues

---

### ❌ 2. `connectDB is not a function`

Cause:

* Exported `{ connectDB }` but imported as `connectDB`
* Or vice-versa

Lesson:

> **Exports and imports must match exactly.**

This is a contract, not a suggestion.

---

### ❌ 3. Forgot to export the Mongoose model

* `User.create()` silently failed
* Returned 500 instead of clear error

Lesson:

> A file that doesn’t export anything will fail **later**, not immediately.

---

### ❌ 4. Mixed async + `next()` in Mongoose hooks (BIG ONE)

I wrote:

```js
UserSchema.pre("save", async function (next) {
  ...
  next();
});
```

This caused:

```
TypeError: next is not a function
```

Lesson:

* **Async hooks must NOT use `next`**
* Callback hooks must NOT be async

Correct async style:

```js
UserSchema.pre("save", async function () {
  ...
});
```

This is a classic real-world bug.

---

### ❌ 5. Password length mismatch (route vs schema)

* Route allowed length ≥ 6
* Schema required length ≥ 8
* Mongoose validation threw 500

Lesson:

> Route validation and schema validation MUST agree.

Schema always wins.

---

### ❌ 6. Logging `"error"` instead of the actual error 😅

I had:

```js
console.error("error");
```

Which made debugging impossible.

Lesson:

> Always log the real error object.

---

## 🧠 Mental Model I Now Have

When I see an auth system, I now think in layers:

* **Model** → data safety & invariants
* **Routes** → business logic
* **Sessions** → memory of trust
* **Middleware** → enforcement
* **Cookies** → pointers, not authority

This model lets me rebuild auth systems from scratch.

---

## ✅ Final Status

Scenario 04 is **complete and stable**.

I can now:

* Build session-based authentication without tutorials
* Debug Mongoose lifecycle issues
* Reason about security boundaries
* Explain how Instagram-style login actually works

This scenario moved me from:

> “Auth is magic”

to:

> **“Auth is state + rules + discipline.”**

---

## 🚀 Next Steps

Possible extensions after this scenario:

* JWT-based auth (stateless APIs)
* Role-based access control (RBAC)
* OAuth (Google / GitHub login)
* Rate limiting & brute-force protection
* CSRF protection

But this scenario stands **fully on its own**.

---

**Scenario 04 — Completed.** 🏁



Below is a **drop-in section** you can append to the README I wrote.
This is written like an **engineering checklist**, not a tutorial.

You can paste this **at the end of README.md** under a new heading.

---

## 🧪 Test Cases (Postman / Manual Verification)

These test cases validate the **entire authentication lifecycle**.
Run them **in order**, using the **same Postman collection** unless stated otherwise.

**Base URL**

```
http://localhost:3000/api/auth
```

⚠️ Do NOT manually manage cookies — let Postman handle them.

---

### 🔹 Test Group 1 — Signup

#### TC-1: Signup with valid credentials

**Request**

```
POST /signup
```

Body:

```json
{
  "email": "user1@test.com",
  "password": "password123"
}
```

**Expected**

* Status: `201`
* Message: Signup success
* User created in DB
* Password stored as hash (not plaintext)

---

#### TC-2: Signup with existing email

Repeat TC-1.

**Expected**

* Status: `409`
* Message: User already exists

---

#### TC-3: Signup with missing fields

```
POST /signup
```

```json
{
  "email": "user2@test.com"
}
```

**Expected**

* Status: `400`
* Validation error

---

#### TC-4: Signup with weak password

```
POST /signup
```

```json
{
  "email": "user3@test.com",
  "password": "123"
}
```

**Expected**

* Status: `400`
* Password length error

---

### 🔹 Test Group 2 — Signin

#### TC-5: Login with correct credentials

```
POST /signin
```

```json
{
  "email": "user1@test.com",
  "password": "password123"
}
```

**Expected**

* Status: `200`
* Login success
* `sid` cookie set in Postman

---

#### TC-6: Login with wrong password

```
POST /signin
```

```json
{
  "email": "user1@test.com",
  "password": "wrongpassword"
}
```

**Expected**

* Status: `401`
* Message: Invalid credentials
* No session created

---

#### TC-7: Login with non-existing user

```
POST /signin
```

```json
{
  "email": "fake@test.com",
  "password": "password123"
}
```

**Expected**

* Status: `401`
* SAME error message as TC-6
  (no user enumeration)

---

### 🔹 Test Group 3 — Protected Routes

#### TC-8: Access protected route WITHOUT login

(Use a new Postman tab or clear cookies)

```
GET /profile
```

**Expected**

* Status: `401`
* Unauthorized response

---

#### TC-9: Access protected route AFTER login

(Use same tab as TC-5)

```
GET /profile
```

**Expected**

* Status: `200`

```json
{
  "message": "This is a protected route",
  "userId": "<some id>"
}
```

---

### 🔹 Test Group 4 — Logout

#### TC-10: Logout when logged in

```
POST /logout
```

**Expected**

* Status: `200`
* Logout success
* Session destroyed
* Cookie cleared

---

#### TC-11: Access protected route AFTER logout

```
GET /profile
```

**Expected**

* Status: `401`
* Unauthorized

✅ Confirms **real logout**, not fake logout.

---

### 🔹 Edge / Real-World Tests

#### TC-12: Logout twice

Call `/logout` again.

**Expected**

* No crash
* Graceful response

---

#### TC-13: Session persistence across restart

Steps:

1. Login
2. Stop server
3. Restart server
4. Call `/profile`

**Expected**

* Still authenticated
  (MongoDB session store works)

---

#### TC-14: Session expiration

Steps:

1. Login
2. Wait until session `maxAge` expires
3. Call `/profile`

**Expected**

* Status: `401`

---

## ✅ Pass Criteria (Scenario Complete)

Scenario 04 is **fully correct** if:

* All unauthorized access returns `401`
* Login sets a session
* Session survives server restart
* Logout destroys trust
* Protected routes rely ONLY on session
* No password is ever exposed or stored raw

If all tests pass → **Scenario 04 is DONE** 🏁

---

## 🧠 Why These Tests Matter

These tests ensure:

* Security invariants hold
* No trust leaks exist
* Refactors don’t silently break auth
* Future changes can be verified quickly

This section turns the project from *working code* into a **maintainable system**.

---
