
# 📦 Scenario 03 — Idempotent Requests (Payments)

## 🎯 Goal of this Scenario

Design and implement an **idempotent payment API** such that:

* A payment is **executed exactly once**
* Retries (network issues, client retries, refreshes) are **safe**
* Same request never causes **duplicate money movement**
* Same idempotency key **cannot** be reused with different intent

This scenario mimics **real fintech / Stripe-level backend behavior**.

---

## 🧠 What is Idempotency (in my own words)

> Idempotency means:
> **No matter how many times the same request is sent, the system state changes only once.**

In payments:

* Money must **never** be deducted twice
* Retries must **replay response**, not re-execute logic

---

## 🏗️ High-Level Design

### Client responsibilities

* Generate an **Idempotency-Key** (UUID / orderId)
* Send the same key for retries of the same logical request

### Server responsibilities

* Treat the idempotency key as **request identity**
* Hash request body to represent **request intent**
* Enforce:

  * Same key + same body → replay response
  * Same key + different body → reject
  * Concurrent requests → execute only once

---

## 🗂️ Key Data Models

### IdempotencyKey

Stores:

* `key` → identity of the request
* `requestHash` → intent of the request
* `status` → `processing` | `completed`
* `response` → cached final response

Acts as:

* a **lock**
* a **receipt**
* a **replay cache**

### Payment

Stores:

* `fromAccount`
* `toAccount`
* `amount`
* `status`
* `idempotencyKey` (traceability)

---

## 🔁 Request Lifecycle (Mental Model)

1. Client sends request with Idempotency-Key
2. Server hashes request body (intent)
3. Server checks idempotency key:

   * exists + completed → replay response
   * exists + processing → tell client to retry later
   * exists + different hash → reject
4. If key does not exist:

   * create idempotency record (`processing`)
   * execute payment logic once
   * store response
   * mark key as `completed`
5. All future retries return stored response

---

## 🧪 Test Cases (Quick Verification Checklist)

### 1️⃣ First valid request

```text
POST /api/pay
Headers:
  Idempotency-Key: order-001
Body:
  fromAccount: user1
  toAccount: user2
  amount: 500
```

✅ Expected:

* Status: 200
* Response: `{ success: true, paymentId }`
* Payment created once

---

### 2️⃣ Retry SAME request (core idempotency)

Send **exact same request again**

✅ Expected:

* Same `paymentId`
* No new DB entry

---

### 3️⃣ Multiple retries

Send same request multiple times rapidly

✅ Expected:

* Always same response
* Only one payment in DB

---

### 4️⃣ Same key, different amount (illegal)

```text
Idempotency-Key: order-001
amount: 5000
```

❌ Expected:

* Request rejected
* No new payment created

---

### 5️⃣ Same key, different receiver

```text
Idempotency-Key: order-001
toAccount: user3
```

❌ Expected:

* Request rejected

---

### 6️⃣ Missing Idempotency-Key

```text
POST /api/pay (no Idempotency-Key header)
```

❌ Expected:

* 400 Bad Request

---

### 7️⃣ New key, same body

```text
Idempotency-Key: order-002
(same body as order-001)
```

✅ Expected:

* New payment
* New paymentId

---

### 8️⃣ Server restart + retry

1. Send request
2. Restart server
3. Retry same request

✅ Expected:

* Same response
* No duplicate payment

---

### 9️⃣ Concurrent request simulation

Send same request from two tabs at the same time

✅ Expected:

* One request executes
* Other returns processing / same final response
* Only one payment in DB

---

## 🧭 My Journey Through Scenario 03 (Personal Notes)

### Where I started

* I understood idempotency **theoretically**
* But translating that into **actual code** felt intimidating
* Writing from scratch felt impossible initially

---

### Early confusion

* Confused identity vs intent
* Thought hashing `(idempotencyKey + body)` made sense
* Learned that:

  * **Key = WHO the request is**
  * **Hash = WHAT the request wants**

---

### Major mistakes I faced (and fixed)

* Forgetting to lock idempotency key before business logic
* Not storing final response
* Returning new responses on retries
* Variable name typos (`existingKey` vs `exisistingKey`)
* MongoDB connection issues (port + localhost vs 127.0.0.1)
* Schema naming typo breaking `.findOne()`

Each error taught me **why production systems are strict**.

---

### Biggest “aha” moments

* Idempotency key is **not uniqueness**, it’s **identity**
* Request hash exists only to **validate intent**
* Storing response is mandatory for true idempotency
* DB record acts as a **mutex**
* Retrying is a **first-class feature**, not an edge case

---

## 🧠 Final Takeaways (Burn These In)

* Idempotency is about **state safety**, not retries
* Payments must be designed assuming:

  * retries
  * crashes
  * duplicate requests
* Never trust the network
* Never trust clients to behave perfectly
* Backend must enforce correctness

---

## ✅ Scenario 03 Status

**COMPLETED ✔️**

This scenario gave me:

* Confidence in backend system design
* Real-world fintech concepts
* Ability to reason about retries, race conditions, and safety

---

When future-me opens this README:

* Read the **journey**
* Run the **test cases**
* Instantly remember **how and why idempotency works**

---
