---
name: tdd
description: "TDD bug fix: understand bug → write failing e2e test → analyze → write failing unit tests → implement fix → review"
argument-hint: "<bug-description>"
user-invocable: true
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent, Skill
---

## Dynamic Context

- Current branch:
!`git branch --show-current`

- Changed files on branch:
!`git diff --name-only origin/main...HEAD -- '*.ts' '*.tsx' 2>/dev/null | head -30`

## Instructions

Execute the following phases. After each phase, briefly summarize what was accomplished and confirm with the user before proceeding.

**Execution flow**:
- Phase 1 (understand the bug) runs first.
- After Phase 1, **two tracks run in parallel**:
  - **Background agent**: Phase 2 (write, run, and iterate the e2e test end-to-end)
  - **Main thread**: Phase 3 (analyze & plan) → Phase 4 (unit tests)
- Phase 5 syncs up with the background agent, then implements the fix.
- Phase 6 reviews everything.

---

### Phase 1: Understand the bug

1. **Parse input** from `$ARGUMENTS`:
   - Use the free-text bug description provided by the user

2. **Extract the bug definition**:
   - What is the expected behavior?
   - What is the actual (broken) behavior?
   - What is the reproduction path (user steps)?
   - Which area of the application is affected?

3. **Locate relevant source code**:
   - Use Grep/Glob to find the components, hooks, routes, and API calls involved
   - Read the key files to understand the current implementation
   - Identify the data flow from user action → API call → state change → UI update
   - Check both frontend (`packages/frontend/src/`) and backend (`packages/backend/src/`) as needed

4. **Present the bug summary** to the user and confirm understanding before proceeding.

---

### Phase 2: Write a failing E2E test (background agent)

**Goal**: A Playwright e2e test that reproduces the bug — it must FAIL at the point where the bug manifests.

Immediately after Phase 1 is confirmed, **spawn a background Agent** (`run_in_background: true`) with the full bug summary from Phase 1. The agent prompt must instruct it to:

1. **Find existing e2e tests** in the same area:
   ```
   Glob: packages/frontend/e2e/**/*.spec.ts
   ```
   Read a nearby test to understand the patterns, page objects, and test helpers used.

2. **Read the Playwright E2E guide**:
   ```
   Read: docs/PLAYWRIGHT_E2E_GUIDE.md
   ```
   Follow all conventions: single `test()` with `test.step()`, Page Object Model with private readonly locators, `data-test-id` selectors (camelCase), Hungarian text in selectors, `verbNoun` method naming.

3. **Identify the relevant page objects** (if they exist):
   ```
   Glob: packages/frontend/e2e/pages/**/*.ts
   ```

4. **Write the e2e test** that:
   - Uses a single `test()` call with `test.step()` for each phase
   - Navigates to the relevant page
   - Performs the user steps that trigger the bug
   - Asserts the **expected (correct)** behavior — this assertion should FAIL because the bug exists
   - Place the test in `packages/frontend/e2e/`

5. **Run and iterate the e2e test** (max 5 iterations):
   - Run: `cd /Users/gekovacs/workspace/webshop/packages/frontend && npx playwright test <test-path> --reporter=list`
   - If the test errors before reaching the bug assertion → fix the test setup/selectors
   - If the test passes → the test doesn't reproduce the bug; adjust the assertions
   - If the test fails at the wrong point → fix the preceding steps
   - Target: the test runs all steps successfully but FAILS at the assertion that checks for correct behavior

6. **Report** the final test output and whether the test correctly reproduces the bug.

**Do NOT wait** for the background agent to finish. Immediately proceed to Phase 3.

---

### Phase 3: Analyze and plan the fix (parallel with e2e agent)

1. **Trace the bug** through the code:
   - Follow the user action from the UI component through API calls, backend routes, database queries, and response rendering
   - Identify exactly where the chain breaks
   - Document the root cause with `file:line` references

2. **Evaluate solution options** (2-3 approaches):
   - For each: brief description, pros, cons, complexity, risk
   - Recommend one with rationale

3. **Write the implementation plan**:
   - Step-by-step changes with file paths
   - Order of changes (dependencies)
   - Expected behavior after each change

4. **Present the plan** to the user and get approval before proceeding.

---

### Phase 4: Write failing unit tests (parallel with e2e agent)

**Goal**: Unit tests that assert the CORRECT behavior and FAIL before the fix is implemented. Start this phase immediately after presenting the Phase 3 plan — do NOT wait for the background e2e agent to finish.

#### Step 1: Evaluate testing approaches

Based on the implementation plan from Phase 3, identify all files that will change and their test files (co-located `*.test.tsx` / `*.test.ts`). Then evaluate two approaches:

**Approach A — Granular**: Write unit tests for each file that will be modified. Each test file covers its own module in isolation with mocks for dependencies.
- Pros: precise coverage, easy to pinpoint regressions
- Cons: more test files, heavier mock setup

**Approach B — Top-level**: Write unit tests only for the top-most component or route handler that orchestrates the behavior.
- Pros: fewer test files, tests integrated behavior
- Cons: harder to pinpoint which layer breaks

If the fix is small (e.g. a single file change), skip the choice and proceed directly.

#### Step 2: Present the choice

Show the user which files will change and which test files exist or need to be created for each approach, with a recommendation. Wait for the user to choose.

#### Step 3: Write the failing tests

1. **Read existing test files** in the chosen scope to understand patterns.

2. **Write or extend unit tests** that:
   - Set up the state that triggers the bug
   - Perform the action that should fix it
   - Assert the **correct (expected)** behavior
   - These assertions must FAIL because the fix is not yet implemented

3. **Run the unit tests**:
   - Frontend: `cd /Users/gekovacs/workspace/webshop && pnpm --filter frontend test -- --run <test-file>`
   - Backend: `cd /Users/gekovacs/workspace/webshop && pnpm --filter backend test -- --run <test-file>`

4. **Iterate until tests fail at the right assertions** (max 5 iterations).

5. **Confirm with user**: Show the failing test output.

---

### Phase 5: Implement the fix

1. **Check on the background e2e agent** from Phase 2. If it has completed, review its results. If still running, proceed — it will notify when done. Before running the e2e test in step 6, ensure the agent has completed.

2. **Follow the implementation plan** from Phase 3.

3. **After each file change**, run the relevant unit tests:
   - Frontend: `pnpm --filter frontend test -- --run <test-file>`
   - Backend: `pnpm --filter backend test -- --run <test-file>`

4. **Iterate until all unit tests pass**.

5. **Run ESLint**:
   ```bash
   pnpm lint
   ```

6. **Run TypeScript check**:
   ```bash
   pnpm typecheck
   ```
   Fix any type errors introduced by the changes.

7. **Run the e2e test** from Phase 2 again:
   ```bash
   cd /Users/gekovacs/workspace/webshop/packages/frontend && npx playwright test <test-path> --reporter=list
   ```
   It should now PASS. If it doesn't, analyze why and iterate.

8. **Confirm with user**: All tests green.

---

### Phase 6: Review

1. **Review all changed code** against coding guidelines (`docs/CODING_GUIDELINES.md`):
   - Arrow functions only for components, handlers, helpers
   - `type` over `interface`, no `any`
   - `sx` prop not `style` for MUI components
   - `verbNoun` naming, `handle*` for handlers, `on*` for event props
   - Braces on all `if`/`else`, no dead code
   - Hungarian text for user-facing strings

2. **Fix any violations** found.

3. **Run the full test suite**:
   ```bash
   pnpm test
   ```

4. **Present the final summary**:
   - Bug description
   - Root cause (1-2 sentences)
   - Fix summary (what was changed and why)
   - Files modified (list)
   - Test coverage added (e2e + unit test files)
   - Any remaining concerns or follow-up items

5. **Ask the user** if they want to commit the changes.
