---
name: e2e
description: Run Playwright e2e tests against the running local webshop
argument-hint: "<test-file-path> [--headed]"
user-invocable: true
allowed-tools: Read, Grep, Glob, Bash(cd * && npx playwright *), Bash(ls *)
---

## Instructions

1. Parse arguments from `$ARGUMENTS`:
   - First argument: test file path (required). Can be:
     - A full absolute path
     - A relative path from the project root
     - A short name or keyword — search for the matching `.spec.ts` file under `packages/frontend/e2e/`
   - `--headed` flag: optional, runs in headed mode for debugging

2. Resolve the test file:
   - If a full or relative path was given, verify it exists
   - If a keyword was given, use Glob to find matching `**/*<keyword>*.spec.ts` files
   - If multiple matches, list them and ask the user to pick one

3. Run the test:
   ```
   cd /Users/gekovacs/workspace/webshop && npx playwright test <resolved-path> --reporter=list
   ```
   - Add `--headed` if the flag was provided

4. Analyze results:
   - If tests pass, report success with test count and duration
   - If tests fail, show:
     - Which test case(s) failed
     - The assertion error messages
     - The source location of the failure
   - Do NOT automatically fix test files — report findings and ask the user

5. Notes:
   - Tests require the local dev environment running (frontend + backend)
   - Tests run against `https://localhost:5173` by default
