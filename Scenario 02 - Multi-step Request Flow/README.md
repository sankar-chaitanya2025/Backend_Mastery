/*
========================================
📌 Scenario 02 – Multi-step Registration
========================================

Endpoint:
POST /register

----------------------------------------
✅ Test Case 1: Happy Path (ALL SUCCESS)
----------------------------------------
Expected: 201 Created

Request Body:
{
  "email": "alice@example.com",
  "password": "secret123",
  "fullName": "Alice Johnson",
  "course": "Computer Science"
}

Flow:
- User is created
- Profile is created
- Response returned

Result:
✔ User exists in DB
✔ Profile linked via userId exists
✔ No rollback

----------------------------------------
❌ Test Case 2: Profile Creation Fails
----------------------------------------
Expected: 500 Internal Server Error

Simulate:
- Force Profile.create() to fail
  (e.g., missing required field or DB error)

Request Body:
{
  "email": "bob@example.com",
  "password": "secret123",
  "fullName": "",
  "course": "Mechanical"
}

Flow:
- User is created
- Profile creation fails
- Rollback deletes the user

Result:
✔ NO user in DB
✔ NO profile in DB
✔ System remains consistent

----------------------------------------
❌ Test Case 3: Duplicate Email
----------------------------------------
Expected: 500 Internal Server Error

Precondition:
- User with email already exists

Request Body:
{
  "email": "alice@example.com",
  "password": "anotherpass",
  "fullName": "Alice Duplicate",
  "course": "CSE"
}

Flow:
- User.create() fails
- Profile creation never attempted
- No rollback needed

Result:
✔ Original user untouched
✔ No new user created

----------------------------------------
❌ Test Case 4: Missing Required Fields
----------------------------------------
Expected: 500 Internal Server Error

Request Body:
{
  "email": "charlie@example.com",
  "password": "secret123"
}

Flow:
- User created
- Profile creation fails (missing fullName/course)
- Rollback deletes user

Result:
✔ NO partial data left in DB

----------------------------------------
🧠 Important Rules Verified
----------------------------------------
✔ Client never sends userId
✔ Backend owns relationships
✔ Multi-step flow is sequential
✔ Rollback prevents inconsistent state

========================================
*/
