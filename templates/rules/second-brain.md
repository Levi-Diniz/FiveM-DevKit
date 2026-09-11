---
trigger: always_on
description: Second Brain - Project persistent memory and knowledge base (Obsidian-compatible)
---

# Second Brain (Obsidian Knowledge Base)

## Purpose
The **Second Brain** serves as the persistent, long-term memory of this repository and is designed to be opened directly as an **Obsidian Vault**. It maintains deep context about server mechanics, solved bugs, architectural decisions, and unique environment quirks.

**Location:** `brain-<ProjectName>/` (at the workspace root, e.g. `brain-FiveM-DevKit/`).

---

## Vault Structure & Conventions

Inside `brain-<ProjectName>/`, each topic has its dedicated folder with **individual Markdown files**:

1. **`brain-<ProjectName>/bugs/`**:
   - Every resolved bug gets its own file: `bug - <concise-bug-name>.md`.
   - Content: Symptom, affected files, root cause, fix applied, and how to avoid regression.

2. **`brain-<ProjectName>/decisions/`**:
   - Technical and architectural decisions (ADRs): `decisao - <topic>.md` or `decision - <topic>.md`.
   - Content: Context, decision made, rejected alternatives, and trade-offs.

3. **`brain-<ProjectName>/concepts/`**:
   - Server gameplay mechanics, FiveM systems, business rules, and frameworks: `conceito - <system>.md` or `<system>.md`.
   - Content: How the system works, data contracts, events, and relations to other scripts.

4. **`brain-<ProjectName>/project/`**:
   - Repository architecture, folder structure, coding guidelines, and dependencies: `overview.md`, `stack.md`.

5. **`brain-<ProjectName>/gotchas/`**:
   - Edge-cases, CEF/NUI quirks, thread-blocking pitfalls, and platform caveats: `gotcha - <title>.md`.

---

## Behavioral Guidelines for Agents

### 1. Consult Before Acting
- Before starting complex tasks, refactors, or bug hunting, **read relevant notes in `brain-<ProjectName>/`** to leverage existing context and respect past technical decisions.
- Use knowledge of server concepts to ensure compatibility with existing systems.

### 2. Obsidian Linking
- Use standard markdown and internal links (e.g. `[[decisao - nome]]` or `[title](file:///path)`) so the knowledge graph connects cleanly in Obsidian.

### 3. Record Work via `/brain`
- When the user runs `/brain`, inspect the work just completed and create a dedicated file under the appropriate `brain-<ProjectName>/` subdirectory following the file naming conventions.
- Keep notes concise, factual, and actionable.
