Here is the English translation of your PRD, refined for professional enterprise standards.

---

# PRD — COMPETENCY-BASED MODULAR TRAINING SYSTEM

Here is the **enterprise-ready PRD for the Training / Bootcamp LMS system**, aligned with our restructured schema design (utilizing `LessonProgress`, `ModuleProgress`, `CourseProgress`, weighted scoring, and a grading system).

This document focuses on:

- Modular training structures
- Professional academic evaluation systems
- Standardized progress tracking
- Performance-based unlock logic
- Industrial scalability

---

## 1. PRODUCT OVERVIEW

The training system is a modular learning platform based on the following hierarchy:
**Course → Module → Lesson → Quiz → Final Project**

To succeed, every participant must:

- Complete all lessons.
- Pass all quizzes with a minimum score of **80%**.
- Pass the final project.
- Achieve a final aggregate score of **≥ 80**.

**Final Output:**

- Course status marked as **COMPLETED**.
- Certificate generation enabled.

---

## 2. OBJECTIVES

1. Guarantee academic passing standards.
2. Ensure competency-based evaluation.
3. Create a measurable progress tracking system.
4. Support advanced analytics and reporting.
5. Scale to support thousands of participants.

---

## 3. ACTORS

1. **Student:** The learner consuming the content.
2. **Mentor:** The evaluator providing feedback and grading projects.
3. **Admin:** The system manager handling configurations and oversight.

---

## 4. CONTENT HIERARCHY STRUCTURE

### 4.1 Course

A Course contains:

- Title, Category, and Level.
- Modules and a Final Project.
- **Evaluation Weights:** \* Total Quiz Weight = **40%**
- Project Weight = **60%**

### 4.2 Module

Each Course consists of several Modules.

- **Attributes:** Ordered sequence, Lessons, Quiz (1 per module), and `ModuleProgress` per user.
- **Completion Criteria:** \* All lessons are marked as "Completed."
- The Module Quiz is passed (score ≥ 80).

### 4.3 Lesson

Lessons can be **TEXT** or **VIDEO**.

- **Behavior:** Students can access lessons freely.
- **Completion:** Manually triggered by the user and stored in `LessonProgress`.
- **Note:** Lessons do not have scores, only a completion state.

### 4.4 Quiz

- **Characteristics:** 1 quiz per module, default passing score of 80, configurable weight, retakes allowed.
- **Logic:** The system records and uses the **highest score** (Best Score).
- **Unlock Rule:** Quizzes are accessible immediately (non-sequential).
- **Completion Rule:** Passed if `bestScore` ≥ `passingScore`.

### 4.5 Final Project

- **Characteristics:** 1 per course, default weight of 60%, default passing score of 80.
- **Unlock Rule:** All modules must be **COMPLETED**.
- **Submission:** Student submits a `githubUrl` or `demoUrl`.
- **Mentor Actions:** Assigns a numeric score, status (PASSED / FAILED / REVISION), and feedback.
- **Completion Rule:** Passed if `score` ≥ `passingScore` AND `status` = **PASSED**.

---

## 5. PROGRESS TRACKING SYSTEM

The system employs a three-layer progress logic:

### 5.1 LessonProgress Logic

- **Trigger:** Student clicks “Mark as Complete.”
- **Update:** Sets `completed = true` and records `completedAt` timestamp.

### 5.2 ModuleProgress Logic

- **Trigger:** Triggered whenever a lesson is completed or a quiz attempt is passed.
- **Logic:** \* **IF** (All lessons completed) **AND** (Quiz passed) → **Status: COMPLETED**.
- **ELSE** → **Status: IN_PROGRESS**.

### 5.3 CourseProgress Logic

- **Course COMPLETED if:**

1. All `ModuleProgress` entries = **COMPLETED**.
2. Final Project = **PASSED**.
3. Final Score ≥ **80**.

- **Otherwise:** Status remains **FAILED** or **IN_PROGRESS**.

---

## 6. ACADEMIC GRADING SYSTEM

### 6.1 Final Score Formula

$$FinalScore = (WeightedAverageQuizScore \times 0.4) + (ProjectScore \times 0.6)$$

Where:

$$WeightedAverageQuizScore = \frac{\sum (QuizScore \times QuizWeight)}{\sum QuizWeight}$$

### 6.2 Grading Scale

| Range  | Grade |
| ------ | ----- |
| 90–100 | **A** |
| 80–89  | **B** |
| 70–79  | **C** |
| 60–69  | **D** |
| < 60   | **E** |

- **Minimum Passing Grade:** Grade B (Score ≥ 80).
- Grades are persisted in `CourseProgress` and the generated **Certificate**.

---

## 7. UNLOCKING RULES (STRICT MODE)

- **Lessons:** Always accessible.
- **Quizzes:** Accessible anytime (completion recommended after lessons).
- **Final Project:** **LOCKED** until all modules are COMPLETED.
- **Certificate:** **LOCKED** until `CourseProgress.status` = COMPLETED.

---

## 8. ROLE BEHAVIORS

- **Student:** Enroll, complete lessons, retake quizzes, submit projects, view dashboard, generate certificates.
- **Mentor:** Review projects, assign scores/status, provide feedback, approve or request revisions.
- **Admin:** Create courses/modules, configure weights, monitor analytics, override evaluations (if necessary).

---

## 9. ANALYTICS CAPABILITIES

This design enables the system to:

- Identify the most difficult modules/quizzes (high failure rates).
- Rank students based on `finalScore`.
- Calculate overall completion rates.
- Measure average scores per cohort.
- Track learning drop-off points.

---

## 10. ACCEPTANCE CRITERIA

A Course is valid for completion only if:

- All `ModuleProgress` are **COMPLETED**.
- `ProjectSubmission` is **PASSED**.
- `FinalScore` is **≥ 80**.
- The resulting Grade is at least a **B**.

---

## 11. NON-FUNCTIONAL REQUIREMENTS

- **Atomic Transactions:** Ensure progress updates are atomic.
- **Indexing:** Proper indexing on `userId` and `courseId`.
- **Scalability:** Support at least 50,000 concurrent users.
- **Integrity:** Audit logs for grade changes; no certificates issued without a `COMPLETED` status.

---

## 12. MANDATORY DATABASE CHANGES

1. **Remove** the simple progress array in the `Enrollment` table.
2. **Add** dedicated tables: `LessonProgress`, `ModuleProgress`, and `CourseProgress`.
3. **Add** `weight` fields to `Quiz` and `Project` tables; add `score` to `ProjectSubmission`.
4. **Add** `finalScore` and `grade` fields to the `Certificate` table.

> **Note:** Without these schema changes, the system will not support the professional academic model described above.

---

**Would you like me to generate the SQL schema or the TypeScript interfaces based on these requirements?**
