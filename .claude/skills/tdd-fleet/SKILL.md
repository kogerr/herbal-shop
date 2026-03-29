---
name: tdd-fleet
description: "TDD feature wave: write failing tests → generate Codex fleet prompt → review agent output → fix issues"
argument-hint: "<wave-description or path-to-plan>"
user-invocable: true
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, Agent, WebFetch, Skill
---

## Dynamic Context

- Current branch:
!`git branch --show-current`

- Changed files on branch:
!`git diff --name-only origin/main...HEAD -- '*.ts' '*.tsx' 2>/dev/null | head -30`

## Instructions

This skill orchestrates TDD-driven feature development across a fleet of external Codex agents. You write the failing tests and the detailed prompts; the user launches the Codex fleet; then you review and fix the results.

Execute the following phases. After each phase, briefly summarize what was accomplished and confirm with the user before proceeding.

---

### Phase 1: Understand the scope

1. **Parse input** from `$ARGUMENTS`:
   - If it references a plan file (e.g. `docs/PHASE_2_PLAN.md`), read it
   - If it's a free-text description, use that directly

2. **Identify the tasks** in this wave:
   - What features need to be implemented?
   - Which files will be created or modified?
   - What are the dependencies between tasks?
   - Which tasks can run in parallel?

3. **Read the relevant specs**:
   - UI plans (`docs/STOREFRONT_UI_PLAN.md`, `docs/ADMIN_UI_PLAN.md`)
   - Coding guidelines (`docs/CODING_GUIDELINES.md`, `.claude/rules/`)
   - Existing code that the tasks will modify or extend

4. **Present the wave summary** to the user: list of tasks, what each produces, and the parallelization plan. Confirm before proceeding.

---

### Phase 2: Write failing tests (TDD red phase)

**Goal**: Write unit tests and e2e tests that define the expected behavior. All tests must FAIL because the features don't exist yet.

#### E2e tests (Playwright)

1. Read `docs/PLAYWRIGHT_E2E_GUIDE.md` for conventions:
   - Single `test()` with `test.step()` for each phase
   - `data-test-id` selectors (camelCase)
   - Hungarian text in selectors and assertions
   - Page Object Model if page objects exist

2. Write e2e test files in `packages/frontend/e2e/`:
   - One test per user flow (storefront flow, admin flow, etc.)
   - Cover the happy path for each feature in the wave
   - Use `test.step()` for each logical step
   - Set appropriate timeouts (30s default, 60s for multi-page flows)

3. Verify Playwright config exists at `packages/frontend/playwright.config.ts`. Create if missing.

#### Unit tests (Vitest)

1. Read existing test files to understand patterns (test-setup.ts, existing *.test.tsx files).

2. For each page or component being created/modified, write a test file that:
   - Mocks dependencies (API hooks, stores, router)
   - Renders the component with providers (QueryClient, MemoryRouter)
   - Asserts the expected DOM structure, text content, and interactive elements
   - Uses `getByTestId` (configured for `data-test-id` attribute), `getByRole`, `getByText`, `getByLabelText`

3. **Run the unit tests** to confirm they fail:
   ```bash
   pnpm --filter frontend test
   ```
   - New tests must FAIL (features not implemented)
   - Existing tests must still PASS
   - If a test errors instead of failing, fix the test setup

4. **Present the test summary**: X new tests, all failing, Y existing tests still passing. Confirm with user.

---

### Phase 3: Generate Codex fleet prompt

**Goal**: Write a markdown file with detailed prompts for a fleet of Codex agents, one per parallel task.

1. **Create** `docs/<wave-name>_CODEX_PROMPT.md` with:

   **Header section** (shared across all agents):
   - Project context (monorepo structure, tech stack)
   - Coding rules (from CODING_GUIDELINES.md and .claude/rules/)
   - Verification commands: `pnpm typecheck && pnpm lint && pnpm --filter frontend test`
   - Instruction that all pre-written failing tests must pass

   **Per-agent section** (one per parallel task):
   - **Branch name**: `<phase>/<feature-name>`
   - **Goal**: one sentence
   - **Pre-written tests to make pass**: list the specific test files and test names
   - **Files to CREATE**: exact paths, with detailed specs for each file's content (component tree, MUI components, props, Hungarian text, data-test-id values)
   - **Files to MODIFY**: exact paths, with what to change and why
   - **Reference**: which section of the UI plan or spec doc to follow
   - **Acceptance criteria**: specific assertions the agent can verify

   **Fleet summary table**: agent number, branch, tests, creates, modifies

2. **Review the prompt** for completeness:
   - Does every failing test have an agent responsible for making it pass?
   - Are Hungarian strings spelled correctly with accents?
   - Are MUI component patterns correct (Grid v2 `size` prop, `sx` not `style`)?
   - Are all dependencies between agents documented?

3. **Present** the prompt file to the user. Confirm before they launch the fleet.

---

### Phase 4: Wait for Codex agents

The user launches the Codex fleet externally and tells you when they're done. While waiting:

- Do not proceed
- If the user asks questions about the tasks, answer from the prompt and specs

---

### Phase 5: Review agent output

Once the user confirms the agents are done:

1. **Check what changed**:
   ```bash
   git status
   git diff --name-only
   ```

2. **Run all verification checks**:
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   ```

3. **Spawn review agents** (in parallel) to read all new/modified files and check:
   - Coding guideline compliance (arrow functions, type Props, sx prop, verbNoun naming, no any, braces)
   - MUI patterns (Grid v2 size prop, missing aria-labels, style vs sx)
   - React issues (infinite loops from unstable selectors, missing keys, hook rules)
   - Type safety (unsafe casts, `body: unknown`, non-null assertions)
   - Feature completeness vs UI plan specs
   - Hungarian text correctness (accented characters)

4. **Start the app and check for runtime errors**:
   ```bash
   # If dev servers aren't running:
   pnpm dev &
   sleep 4
   ```
   Use the Playwright MCP tools to navigate to the app and check for console errors:
   ```js
   // Collect console errors while loading the page
   page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
   await page.goto('http://localhost:5173/');
   ```

5. **Compile issues** from all review sources and present to user, categorized by severity (critical/high/medium/low).

---

### Phase 6: Fix issues

1. **Fix all critical and high issues** directly — don't ask the user for each one.

2. **Common issues to watch for**:
   - **Zustand infinite loop**: selector returns new object → use individual selectors or `useShallow`
   - **Duplicate data-testid**: project uses `data-test-id` (with hyphen), not `data-testid`. Configure Testing Library in test-setup.ts: `configure({ testIdAttribute: "data-test-id" })`
   - **Missing .js extensions**: backend ESM imports need `.js` in relative paths
   - **Unsafe body types**: API functions should accept specific types, not `unknown`
   - **Non-null assertions**: replace `param!` with `param ?? ""` + guard

3. **After each fix, re-run checks**:
   ```bash
   pnpm typecheck && pnpm lint && pnpm test
   ```

4. **Re-check the app** in the browser for runtime errors after fixes.

5. **Present the fix summary**: what was wrong, what you fixed, verification status.

---

### Phase 7: Run e2e tests (optional)

If the user wants end-to-end verification:

1. Ensure the app is running (`pnpm dev`)
2. Run Playwright tests:
   ```bash
   cd packages/frontend && npx playwright test --reporter=list
   ```
3. If tests fail, analyze failures and fix. E2e test failures may reveal integration issues that unit tests missed.
4. Report results.

---

### Phase 8: Commit

Ask the user if they want to commit. If yes, stage all changes and create a descriptive commit with:
- Summary of what was implemented
- List of fixes applied during review
- Co-authored-by trailer
