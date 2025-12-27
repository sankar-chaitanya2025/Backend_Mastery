
---


# Scenario 05 – Refresh Token Rotation & Session Security

This scenario is about building a **real authentication system**, not a tutorial-style one.

The goal was to deeply understand:
- why JWT alone is not enough
- how refresh tokens actually work
- how rotation improves security
- what can go wrong if things are designed casually

This README is written mainly for **future me**, so that when I read it later, I immediately remember what I struggled with, what I misunderstood, and what finally clicked.

---

## What I Built

In this scenario, I implemented:

- User signup (minimal, just to enable testing)
- Login with email + password
- Short-lived JWT access tokens
- Long-lived refresh tokens
- Refresh token rotation
- Detection of refresh token reuse
- Secure storage of refresh tokens (hashed)
- Clean separation of routes, controllers, middleware, and models
- MongoDB-backed session management

This is not a toy auth system.  
This is very close to how production systems work.

---

## Why JWT Alone Is Not Enough

Initially, I thought:
“If JWT is signed and verified, why not just trust it?”

The problem:
- JWTs are stateless
- Once issued, the server cannot revoke them
- If a JWT is stolen, the attacker can use it until expiry

That is where **refresh tokens** come in.

JWT = access permission (short-lived)  
Refresh token = session continuity (long-lived, server-controlled)

Once I understood this separation, everything else started to make sense.

---

## Core Idea That Finally Clicked

The most important idea in this scenario:

**Access tokens are disposable.  
Refresh tokens are single-use and rotated.**

Flow:
1. User logs in
2. Server issues:
   - short-lived JWT
   - long random refresh token
3. Refresh token is hashed and stored in DB
4. When JWT expires:
   - client sends refresh token
   - server verifies it by hash lookup
   - old refresh token is deleted
   - new JWT + new refresh token are issued

If a refresh token is reused:
- it means token theft or replay
- server rejects it
- session is considered compromised

This single-use rotation is what actually gives security.

---

## Major Pitfalls I Faced (and Learned From)

### 1. Mixing routing and controller logic

I initially wrote:
```js
router.post("/login", async (req, res) => {})
````

Then later tried to export `login` and `refresh` functions.

This caused crashes because I mixed two patterns:

* inline routing
* separated controller architecture

Lesson:
Routes should only wire URLs to functions.
Controllers should export plain async functions.

---

### 2. Returning responses too early

At one point, my login code looked correct but refresh tokens were never created.

Reason:
I returned `res.json()` before generating and storing refresh tokens.

Lesson:
Once `return res.json()` runs, everything below it is dead code.
Control flow mistakes are easy to miss.

---

### 3. Storing refresh tokens incorrectly

My first instinct was to store refresh tokens directly.

That is dangerous.

If the DB leaks:

* attacker gets full session access

Correct approach:

* store only the hash
* treat refresh tokens like passwords

This was a very important security lesson.

---

### 4. Schema over-design (_id issue)

I forced `_id` to be required in the User schema.
Later, signup failed because I did not provide `_id`.

Lesson:
Unless there is a strong reason, let MongoDB generate `_id`.
Over-specifying schemas early causes unnecessary friction.

---

### 5. MongoDB connection options breaking the app

Mongo threw errors for:

* useNewUrlParser
* useUnifiedTopology

These options are deprecated in newer versions.

Lesson:
Sometimes the bug is not your logic.
Sometimes it is library evolution.

---

### 6. Signup was missing, so nothing could be tested

I built login and refresh perfectly, but forgot:
“You cannot log in without a user.”

Lesson:
Authentication is part of a **user lifecycle**.
Signup, login, refresh, logout are all connected.

---

## Folder Structure (Why It Exists)

```
src/
├── controllers/
│   └── auth.controller.js
├── routes/
│   └── auth.routes.js
├── middleware/
│   └── auth.middleware.js
├── models/
│   ├── User.js
│   └── RefreshSession.js
├── utils/
│   ├── crypto.js
│   └── jwt.js
├── db.js
└── server.js
```

This structure exists to separate responsibilities:

* routes decide *where*
* controllers decide *what*
* middleware decides *who is allowed*
* models define *data shape*
* utils handle reusable logic

This separation made debugging much easier later.

---

## Test Cases I Used (Postman)

### Signup

* Create user with email + password
* Duplicate signup should fail

### Login

* Correct credentials → access + refresh token
* Wrong password → error
* Missing fields → error

### Refresh

* Valid refresh token → new access + refresh token
* Reuse old refresh token → rejected
* Missing refresh token → error
* Only one active refresh session per login

### DB Checks

* No raw refresh tokens stored
* Old refresh token hashes deleted after rotation
* Only valid hash exists at any time

---

## What This Scenario Taught Me

* JWTs are not “secure sessions” by default
* Stateless auth needs state somewhere
* Security comes from controlling reuse, not just verification
* Backend bugs are often architectural, not logical
* Stopping when tired is better than pushing blindly

Most importantly:
I now **feel** how refresh token rotation works, not just understand it theoretically.

---

## Status

Scenario 05 is complete.

This scenario changed how I think about authentication and session security.

```
