---
name: Browser Game Feature Plan
description: 'Generate a detailed implementation plan for a new gameplay, narrative, UI, or systems feature in the browser game.'
agent: ask
model: GPT-5.4
tools: ['codebase', 'search', 'usages', 'findTestFiles', 'githubRepo', 'fetch']
---

# Browser Game Feature Plan

Create a detailed implementation plan for the requested feature in this browser-based narrative puzzle-strategy game.

## Instructions

1. Analyze the existing codebase first.
2. Identify the likely files, modules, state containers, and UI surfaces involved.
3. Explain how the feature fits into:
   - simulation/state
   - narrative/progression
   - DOM/rendering
   - user interaction
4. Produce an implementation plan with:
   - overview
   - requirements
   - affected areas
   - data/state changes
   - UI changes
   - implementation steps
   - testing
   - risks / assumptions
5. Prefer minimal, maintainable changes.
6. Explicitly call out any ambiguity that should be resolved before implementation.

## Output structure

## Overview
## Requirements
## Affected files and systems
## Proposed design
## Implementation steps
## Testing
## Risks and open questions
