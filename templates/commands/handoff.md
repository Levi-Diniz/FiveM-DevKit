---
description: Write a handoff on AGENT_BOARD.md so the other AI agent can continue the work
argument-hint: [extra notes for the other agent, optional]
---

Before executing:
- Consult `{{RULES_DIR}}/multi-agent{{RULE_EXT}}` for the coordination protocol.
- If `AGENT_BOARD.md` does not exist at the workspace root, tell the user the workspace is not in multi-agent mode (run `fdk init -t dual`) and stop.

## Purpose
Close out your current task on the shared board so the other agent (Claude Code or Google AntiGravity), running in a separate chat, can pick up without any context from this conversation.

## Process

### 1. Gather Facts
- Review what you changed in this session (`git status` / `git diff` limited to the files you registered).
- Identify what is done, what is pending, and any trap the other agent must know (half-migrated code, temporary flags, a broken test you left on purpose).

### 2. Update `AGENT_BOARD.md`
- Remove your line from **In Progress**.
- Add an entry at the **top** of **Handoffs**:

```markdown
### [claude|antigravity] YYYY-MM-DD HH:MM — <task title>
- **Done:** <one or two lines>
- **Files:** `path/a.lua`, `path/b.tsx`
- **Pending:** <next concrete step, or "nothing">
- **Watch out:** <traps, assumptions, things not to touch, or "nothing">
```

- Keep it short: the other agent reads it cold. No narrative, only facts it can act on.
- Keep at most the 10 most recent handoffs. Delete older ones; anything durable belongs in the Second Brain.

### 3. Durable Knowledge
If the work produced a bug RCA, a decision or a gotcha, suggest running `/brain` (do not duplicate it on the board).

### 4. Report
Reply with one line confirming the handoff and the pending step.
