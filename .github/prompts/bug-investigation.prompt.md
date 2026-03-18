---
name: Browser Game Bug Investigation
description: 'Investigate a gameplay, UI, state, or narrative bug in the browser game and produce a structured root-cause analysis and fix plan.'
agent: ask
model: GPT-5.4
tools: ['codebase', 'search', 'usages', 'findTestFiles', 'githubRepo', 'fetch']
---

# Browser Game Bug Investigation

Investigate the reported bug in this browser-based narrative puzzle-strategy game.

## Instructions

1. Restate the problem precisely.
2. Identify likely affected modules and state flows.
3. Infer reproduction steps from the codebase and user report.
4. Distinguish between:
   - likely root cause
   - symptoms
   - unknowns
5. Propose a minimal fix strategy.
6. Recommend regression tests.
7. Highlight whether the issue is primarily:
   - state bug
   - render bug
   - input handling bug
   - event ordering bug
   - initialization/reset bug
   - narrative trigger bug

## Output structure

## Bug summary
## Likely reproduction
## Affected systems/files
## Root cause analysis
## Fix plan
## Regression tests
## Risks / follow-up checks
