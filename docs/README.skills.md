# GitHub Copilot Skills

This directory documents the [GitHub Copilot skills](https://github.com/github/awesome-copilot) installed in this repository, sourced from the [Awesome Copilot](https://github.com/github/awesome-copilot) collection.

Skills are located in [`.github/skills/`](../.github/skills/) and provide reusable instructions that GitHub Copilot can follow for specific tasks.

---

## Installed Skills

### [`webapp-testing`](../.github/skills/webapp-testing/SKILL.md)

> Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.

Use this skill when you need to test the NumPy Game's browser UI, verify game interactions, capture screenshots, or debug frontend issues using Playwright.

Includes [`assets/test-helper.js`](../.github/skills/webapp-testing/assets/test-helper.js) with reusable Playwright utility functions.

---

### [`playwright-generate-test`](../.github/skills/playwright-generate-test/SKILL.md)

> Generate a Playwright test based on a scenario using Playwright MCP.

Use this skill to generate new Playwright regression tests for the NumPy Game by describing a user scenario. The generated test is saved to the `tests/` directory and iterated until passing.

---

### [`web-design-reviewer`](../.github/skills/web-design-reviewer/SKILL.md)

> Visual inspection of websites to identify and fix design issues: responsive design, accessibility, visual consistency, and layout breakage.

Use this skill to review and fix UI/design issues in `index.html`, `styles.css`, or `app.js`. Includes reference guides:

- [`references/framework-fixes.md`](../.github/skills/web-design-reviewer/references/framework-fixes.md) — Framework-specific CSS/JS fix patterns
- [`references/visual-checklist.md`](../.github/skills/web-design-reviewer/references/visual-checklist.md) — Comprehensive visual inspection checklist

---

### [`create-readme`](../.github/skills/create-readme/SKILL.md)

> Create a comprehensive and well-structured README.md file for the project.

Use this skill to regenerate or improve the repository's `README.md` with accurate project information, usage instructions, and GitHub Flavored Markdown formatting.

---

## Source

All skills are copied from [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main/skills) and selected for relevance to this repository's browser-based game with Playwright regression testing.
