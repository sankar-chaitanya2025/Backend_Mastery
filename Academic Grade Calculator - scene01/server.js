const express = require("express");
const app = express();

const PORT = 3000;

// Boundary middleware: parses JSON BEFORE route handlers
// If JSON is malformed, express.json() will throw a SyntaxError
app.use(express.json());

app.post("/api/calculate-gpa", (req, res) => {
  // Never trust client input → destructure explicitly
  let { id, name, scores } = req.body;

  // Presence check (null/undefined) → fail fast at boundary
  // if (id === null || name === null || scores === null) {
  //   return res.status(400).json({
  //     error: "Missing require fields : studentId, name, or scores.",
  //   });
  // }    "Bug: Missing fields default to undefined, but the condition strictly checks for null. This causes invalid input to bypass validation and return a 200 status."

  if (!id || !name || !scores) {
    return res.status(400).json({
      error: "Missing required field : studentId, name or scores",
    });
  }

  // Structural validation → scores MUST be an array
  // typeof is useless here → Array.isArray is the only safe check
  if (!Array.isArray(scores)) {
    return res.status(400).json({
      error: "Invalid format",
    });
  }

  // Business rule: empty array is invalid even if type is correct
  if (scores.length === 0) {
    return res.status(400).json({
      error: "Scores array can't be empty",
    });
  }

  // Deep validation → validate EACH element, not just the array
  for (let i = 0; i < scores.length; i++) {
    const item = scores[i];

    // Type safety before value checks → prevent JS coercion bugs
    if (typeof item != "number") {
      return res.status(400).json({
        error: `Invalid Data at index ${i} : Marks must be a number`,
      });
    }

    // Domain constraint → valid range enforcement
    // Fail fast → first bad element rejects entire request
    if (item.marks < 0 || item.marks > 100) {
      return res.status(400).josn({
        error: `Invalid Data at index ${i}: Marks must be between 0 and 100.`,
      });
    }
  }

  // Processing logic runs ONLY after all validation gates pass
  let total = 0;

  // Deterministic computation → no side effects
  for (let i = 0; i < scores.length; i++) {
    total += scores[i];
  }

  let average = total / scores.length;

  // Explicit response contract → predictable for client
  return res.status(200).json({
    message: "calculation successfull",
    student: name,
    averageScore: average,
    isPass: average >= 40, // simple business rule
  });

  // Global error handler → boundary-level failure (malformed JSON)
  // Runs ONLY when express.json() throws
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res
        .status(400)
        .json({ error: "CRITICAL: Malformed JSON syntax." });
    }
    next(); // pass non-body errors forward
  });
});

// Server lifecycle → app listens AFTER middleware + routes are defined
app.listen(PORT, () => {
  console.log(`Grade Calculator running on http://localhost:${PORT}`);
});

/*
====================================
MANUAL TEST CASES (BOUNDARY VERIFICATION)
====================================

TC-1: Happy Path (Valid Input)
→ Purpose: Confirm full request → response flow
→ Expect: 200 OK, correct average, pass/fail logic

{
  "studentId": "CS-001",
  "name": "Ravi Kumar",
  "scores": [85, 78, 92, 60]
}

------------------------------------

TC-2: Missing Required Field
→ Purpose: Presence validation (fail fast)
→ Expect: 400 Bad Request

{
  "name": "Priya Sharma",
  "scores": [88, 76]
}

------------------------------------

TC-3: Invalid Type Inside Array
→ Purpose: Deep validation per element
→ Expect: 400 Bad Request (type safety)

{
  "studentId": "CS-005",
  "name": "Karthik",
  "scores": [70, "88", 90]
}

------------------------------------

TC-4: Domain Rule Violation (Out of Range)
→ Purpose: Business constraint enforcement
→ Expect: 400 Bad Request

{
  "studentId": "CS-009",
  "name": "Anusha",
  "scores": [95, 150]
}

------------------------------------

TC-5: Empty Array
→ Purpose: Structural validity ≠ business validity
→ Expect: 400 Bad Request

{
  "studentId": "CS-012",
  "name": "Suresh",
  "scores": []
}

====================================
END TEST CASES
====================================
*/
