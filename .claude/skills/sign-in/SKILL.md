---
name: sign-in
description: Open the webshop in Playwright and sign in as admin
argument-hint: "[email]"
user-invocable: true
allowed-tools: mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_click, mcp__playwright__browser_type, mcp__playwright__browser_wait_for, mcp__playwright__browser_fill_form
---

## Instructions

1. Navigate to `https://localhost:5173/` (or the configured dev URL)
2. Wait up to 5 seconds for the page to load
3. Take a snapshot to determine the current state:
   - **Already signed in** (page shows product catalog or admin area): skip to step 7
   - **Login page** (page shows sign-in form): continue to step 4
4. Determine which user to sign in as:
   - If `$ARGUMENTS` contains an email address, use that
   - Otherwise, use the default admin credentials from `.env`
5. Enter the email address in the email textbox and press Enter
6. Wait for the password field to appear, then enter the password and press Enter
7. Wait up to 6 seconds for the app to fully load
8. Take a final snapshot and confirm the sign-in was successful
