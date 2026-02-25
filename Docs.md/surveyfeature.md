This is a solid, logically structured PRD. It addresses the "Paradox of Choice" that many new learners face by adding a consultative layer to the onboarding process.

To keep with our professional, enterprise-ready theme, here is the English translation and technical refinement of your **Training Interest Survey & Recommendation Engine PRD**.

---

# PRD — TRAINING INTEREST SURVEY & RECOMMENDATION ENGINE

## 1. OVERVIEW

**Feature Name:** Training Interest Survey & Recommendation Engine
**Goal:** To guide new users in selecting the most suitable training path based on their goals, experience, and learning preferences, integrated directly into the post-registration flow.

**The Problem:**

- Users are overwhelmed by choices.
- Users enroll in levels that are too difficult or too easy.
- High dropout rates due to mismatched expectations.

---

## 2. GOALS & SUCCESS METRICS

- **Primary Goal:** Increase relevant enrollments and completion rates.
- **Key Metrics:**
- $\ge 60\%$ Survey Completion Rate for new users.
- $\ge 40\%$ Click-through Rate (CTR) on recommended courses.
- $\ge 15\%$ Increase in overall Course Completion Rate.

---

## 3. USER FLOW & UI/UX

### Trigger

- Triggered immediately after successful **Registration** or **First Login**.

### Flow

1. **Modal/Overlay:** A non-intrusive but focused multi-step modal appears.
2. **5-Step Input:** User answers 5 categorized questions.

[1]->[2]->[3]->[4]->[5]

3. **Engine Calculation:** System processes scores against the Course Category Matrix.
4. **Recommendation Output:** Displays the "Best Match" program.
5. **Action:** User can _Enroll Now_, _View Details_, or _Save for Later_.

### UI Requirements

- **Tech Stack:** `shadcn/ui`, Framer Motion (for smooth transitions), Radix UI Dialog.
- **Progress Indicator:** Clear visual feedback (e.g., Step 1 of 5).
- **Skip Logic:** A "Skip" button is always available; the survey remains accessible via the User Profile.

---

## 4. SURVEY STRUCTURE & MAPPING LOGIC

| Step  | Focus                 | Mapping Logic                                                                       |
| ----- | --------------------- | ----------------------------------------------------------------------------------- |
| **1** | **Primary Goal**      | Career change $\rightarrow$ _Programming_; Freelance $\rightarrow$ _Web/Marketing_. |
| **2** | **Experience Level**  | Beginner $\rightarrow$ _Foundations_; Pro $\rightarrow$ _Specializations_.          |
| **3** | **Field of Interest** | Direct mapping to Category (e.g., Data, UI/UX, Web).                                |
| **4** | **Learning Style**    | Hands-on $\rightarrow$ _Bootcamp_; Theoretical $\rightarrow$ _Self-paced_.          |
| **5** | **Time Commitment**   | $<5$hrs/wk $\rightarrow$ _Light_; $>20$hrs/wk $\rightarrow$ _Intensive_.            |

---

## 5. RECOMMENDATION ENGINE LOGIC (SCORING MATRIX)

The system uses a **Weighted Scoring Approach**. Each answer adds points to specific categories.

**Algorithm Pseudo-logic:**

1. Initialize scores for all categories at 0.
2. For each answer, add `weight` to the corresponding category.
3. The category with the highest `total_score` is the **Primary Recommendation**.
4. Filter results within that category based on the **Experience Level** from Step 2.

---

## 6. TECHNICAL SPECIFICATIONS

### 6.1 Prisma Schema Addition

To support this, we need a new model to persist user preferences for future analytics.

```prisma
model SurveyResponse {
  id                  String         @id @default(uuid())
  userId              String         @unique @map("user_id")
  q1Goal              String         @map("q1_goal")
  q2Experience        String         @map("q2_experience")
  q3Interest          CourseCategory @map("q3_interest")
  q4LearningStyle     String         @map("q4_learning_style")
  q5TimeCommitment    String         @map("q5_time_commitment")
  recommendedCategory CourseCategory @map("recommended_category")
  recommendedLevel    CourseLevel    @map("recommended_level")
  scoreBreakdown      Json?          @map("score_breakdown")
  createdAt           DateTime       @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("survey_responses")
}
```

### 6.2 API Endpoints

- `POST /api/survey/submit`: Validates input, calculates the result, saves to DB, and returns the recommended category ID.
- `GET /api/survey/result`: Retrieves the latest saved recommendation for the dashboard.

---

## 7. NON-FUNCTIONAL REQUIREMENTS

- **Latency:** Calculation and result display must occur in $< 1.5s$.
- **State Management:** Survey should support "Resume" if the user refreshes mid-way (use `localStorage` or `sessionStorage`).
- **Responsiveness:** Must be fully functional on mobile devices.

---

## 8. INTEGRATION WITH TRAINING PAGE

The recommendation should redirect users to the training catalog with pre-applied filters:
`GET /trainings?category=web-development&level=beginner&source=survey_recommendation`

---

## 9. FUTURE ITERATIONS (PHASE 2)

- **AI Recommendation:** Use machine learning to refine suggestions based on successful student profiles.
- **Roadmap Visualization:** Show the user a visual "Career Path" based on their survey result.

---

### **Next Steps Recommendation**

To move forward with implementation, I can help you with:

1. **Scoring Matrix Design:** Defining exactly how many points each answer gives to each category (e.g., Answer A = +5 Programming, +2 Design).
2. **Next.js + shadcn Codebase:** Building the multi-step form component with `react-hook-form` and `zod`.
3. **Clean Architecture (Service Layer):** Creating the `RecommendationService` logic to keep your controllers clean.

**Which would you like to dive into first?**
