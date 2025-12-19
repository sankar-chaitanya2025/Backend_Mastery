# Scenario 02 — Multi-step Request Flow (User + Profile + Rollback)

## Goal
Build a **single backend flow** where one request triggers **multiple dependent operations**, and the system remains **consistent** even when something fails.

This scenario is NOT about auth, hashing, or polish.  
It is about **thinking like a backend engineer**.

---

## Real-World Analogy
A student submits an admission form.

Backend must:
1. Create a User account
2. Create the Student Profile
3. Ensure **no partial data** exists if any step fails

One click → many steps → one outcome.

---

## What I Implemented

### Single API
`POST /register`

**Payload:**
```json
{
  "email": "alice@example.com",
  "password": "secret123",
  "fullName": "Alice Johnson",
  "course": "Computer Science"
}
```

### Flow (VERY IMPORTANT)
1. Request enters backend
2. Backend creates a User
3. Backend creates a Profile linked to that User
4. If Profile creation fails → delete the User
5. Only return success if both succeed

This is **manual transaction / rollback logic**.

---

## Why `let user` exists (Critical Insight)

```js
let user;

try {
  user = await User.create(...)
  await Profile.create(...)
} catch (error) {
  if (user) {
    await User.deleteOne({ _id: user._id });
  }
}
```

**Why?**
- `const user` inside `try` is block-scoped
- `catch` would not see it
- Rollback needs access to created data

👉 **`let user` enables compensation logic**

---

## Major Mistakes I Faced (And Why They Matter)

### 1. `User.create is not a function`

**Cause:**
- Exported `{ User }`
- Imported incorrectly

**Fix:**
```js
const { User } = require("./models/User");
```

**Lesson:**  
Import/export mismatches break runtime, not compile time.

---

### 2. Duplicate Email Error (E11000)

**Error:**
```
MongoServerError: E11000 duplicate key error
```

**Cause:**
- `email` is `unique: true`
- Same email sent twice

**Lesson:**  
This is NOT a bug. This proves the database is enforcing rules correctly.  
Real backend systems **expect** this error.

---

### 3. 500 Error in Postman

**Why it happened:**
- Duplicate email OR profile creation failed
- Rollback executed correctly
- Backend returned failure

**Lesson:**  
500 doesn't always mean crash — it can mean **protected failure**

---

## ObjectId Understanding (Core Concept)

```js
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
}
```

**What this means:**
- MongoDB uses `_id` as ObjectId
- Profile stores **reference**, not copy
- Enables relational behavior in NoSQL

**This is how:**
- User → Profile
- One-to-one / one-to-many relationships work

---

## What I DID NOT Use (Intentionally)

- JWT
- Bcrypt
- Sessions
- Transactions
- Zod
- Auth middleware

**Reason:**  
Focus was **flow correctness**, not security polish.  
These come later.

---

## Backend Thinking I Gained

- Multi-step requests are not atomic
- Rollbacks are required without DB transactions
- Errors are **part of the system**, not exceptions
- Database constraints are allies, not enemies
- Backend is about **state consistency**, not APIs

---

## Why This Scenario Matters

This exact pattern appears in:
- Signup + profile creation
- Order + inventory update
- Payment + ledger entry
- Booking + seat reservation
- User + settings creation

**Master this → understand most real backend systems**

---

## Status

✅ Completed  
✅ Tested via Postman  
✅ Rollback verified  
✅ Real production error encountered  
✅ Learned deeply

---

## Confidence After This

> "I can now design and debug multi-step backend flows."

**Ready for Scenario 03 — Idempotent Requests**
