# Scenario 01 – Basic Request–Response (Academic Grade Calculator)

## Goal
Understand and implement a **real backend request–response flow** with proper boundary validation, fail-fast logic, and predictable responses.

This scenario focuses on **how a backend should think**, not just how to make code run.

---

## What This Scenario Covers

### 1. Request Boundary Handling
- Incoming requests are **untrusted**
- JSON parsing happens **before** route handlers
- Malformed JSON is caught at the middleware level

Key idea:
> Errors at the boundary should be handled at the boundary.

---

### 2. Input Validation (Fail Fast)
Implemented layered validation:
1. **Presence checks** (missing fields)
2. **Structural checks** (array vs non-array)
3. **Deep validation** (each element in array)
4. **Domain rules** (valid score range)

The request is rejected **as soon as invalid data is found**.

---

### 3. Deep Validation Logic
- Every score is validated individually
- Type safety enforced (`number`, not strings)
- Index-aware error messages returned
- No partial processing of bad data

This prevents:
- Silent bugs
- Invalid averages
- Data corruption

---

### 4. Business Logic Isolation
- Processing runs **only after validation passes**
- Deterministic computation (sum → average)
- Clear business rule (`pass` if average ≥ 40)

Validation and computation are kept conceptually separate.

---

### 5. Error Handling Philosophy
- Client errors → `400 Bad Request`
- Clear, human-readable error messages
- No stack traces leaked
- Consistent response structure

This makes the API predictable for clients.

---

### 6. Express Lifecycle Understanding
- Global middleware runs before routes
- Error-handling middleware runs only on failure
- `app.listen()` starts the server and must be last

This clarified how Express actually executes code.

---

## Example Test Cases Covered

- Valid request (happy path)
- Missing required fields
- Invalid type inside array
- Out-of-range values
- Empty array (structurally valid but logically invalid)
- Malformed JSON payload

---

## Key Takeaways

- Backend code is about **defensive thinking**
- Validation is more important than computation
- Fail fast > fix later
- Structure and lifecycle matter more than syntax
- Tools (Git/GitHub) are secondary to correctness

---

## Status
✅ Completed  
This scenario serves as the **foundation** for all future backend workflows.

Next: **Scenario 02 – Multi-step Request Flow**
