---
trigger: always_on
description: Second Brain - Project persistent memory and knowledge base (Obsidian-compatible)
---

# Second Brain (Obsidian Knowledge Base)

## Purpose
The **Second Brain** serves as the persistent, long-term memory of this repository and is designed to be opened directly as an **Obsidian Vault**. It maintains deep context about server mechanics, solved bugs, architectural decisions, and unique environment quirks.

**Location:** `brain-<ProjectName>/` (at the workspace root, e.g. `brain-FiveM-DevKit/`).

---

## Vault Structure & High-Relevance Standards for AI

Inside `brain-<ProjectName>/`, notes are not just changelogs: they are the **anti-regression memory of the AI**. When writing to or reading from these folders, the agent MUST adhere to these standards:

### 1. Decisions (`brain-<ProjectName>/decisions/decisao - <topic>.md`)
*Standard: MADR (Markdown Architectural Decision Records) + AI Non-Regression Directives*
Every decision record MUST include:
- **Context & Decision Drivers:** Real operational pains, bottlenecks, or requirements that forced the change.
- **Alternatives Considered & Rejected:** Explicit list of other approaches evaluated and the exact technical reason they were discarded (CRUCIAL: without this, future AIs will re-suggest rejected patterns).
- **Decision & Rationale:** The chosen solution and the technical reasoning behind it.
- **Consequences & Trade-offs:** Positive gains AND consciously accepted negative trade-offs.
- **Directives for AI (Non-Regression Rules):** Clear `> [!IMPORTANT]` block defining what the AI must NEVER do or suggest regarding this topic.
- **Revisit Criteria:** Clear triggers describing under what exact conditions this decision may be reopened.

### 2. Bugs (`brain-<ProjectName>/bugs/bug - <concise-name>.md`)
*Standard: Google SRE Post-Mortem & Root Cause Analysis (RCA)*
Every resolved bug record MUST include:
- **Observable Symptom & Error:** Exact error messages, stack traces, and broken behavior.
- **Root Cause (5 Whys):** The underlying structural flaw (race condition, null deserialization, lifecycle mismatch), not just the superficial symptom.
- **The Fix Applied:** Specific code changes and affected files (`[file](file:///path)`).
- **Anti-Regression Mechanism:** How future occurrences are prevented (guards, defensive defaults, types, tests).
- **Agent Guardrail (`> [!CAUTION]`):** Strict instruction on what to validate whenever modifying this component in the future.

### 3. Gotchas (`brain-<ProjectName>/gotchas/gotcha - <title>.md`)
*Standard: Google SWE Pitfalls & Runtime Reality*
Every gotcha record MUST include:
- **The Intuitive Trap:** What a developer or modern AI would instinctively write thinking it's correct.
- **The Engine Reality:** Why the FiveM / CEF / Node / OS runtime fails or behaves unexpectedly.
- **Safe Pattern (Bad vs. Good):** Clear side-by-side code blocks showing the anti-pattern and the resilient fix.
- **Detection Clues:** Keywords or scenarios that signal the AI is about to trigger this pitfall.

### 4. Concepts (`brain-<ProjectName>/concepts/conceito - <system>.md`)
*Standard: Domain-Driven Design (DDD) Ubiquitous Language & Invariants*
Every concept record MUST include:
- **Domain Boundaries (What it IS and what it is NOT):** Disambiguation from similar concepts to prevent AI hallucinations.
- **Lifecycle & Valid State Transitions:** Allowed vs prohibited states and transitions.
- **Data Contracts & Events:** Payloads, net events (Client <-> Server), and NUI messages.
- **System Invariants (`> [!IMPORTANT]`):** Non-negotiable business rules that code must never violate.

### 5. Project (`brain-<ProjectName>/project/`)
*Standard: C4 Architectural Boundaries & Tech Matrix*
- Component boundaries, allowed import paths, disallowed dependencies, and supported engine runtime versions.

---

## Behavioral Guidelines for Agents

### 1. Consult Before Acting
- Before starting complex tasks, refactors, or bug hunting, **read relevant notes in `brain-<ProjectName>/`** to leverage existing context and respect past technical decisions.
- Strictly adhere to the `Directives for AI` and `Agent Guardrails` found inside decision and bug notes.

### 2. Obsidian Graph View & Cross-Linking (MANDATORY)
Obsidian's Graph View connects notes visually **ONLY through explicit Wikilinks (`[[target-note]]`)**. Pure text mentions or markdown file paths (`file:///...`) do NOT create edges on the graph.

Whenever reading, creating, or updating notes, agents MUST adhere to these linking rules:
- **Active Vault Cross-Referencing:** Before finalizing any note (e.g. a Bug or Decision), search `brain-<ProjectName>/` for existing notes related to the affected system, mechanic, or function (e.g. `conceito - <sistema>.md`).
- **Wikilink Syntax for Graph Edges:**
  - Link to an entire note: `[[conceito - sistema-combate]]` or `[[decisao - remocao-apps-www]]`.
  - Link with custom display text: `[[conceito - sistema-combate|Sistema de Combate]]`.
  - Link to a specific section/function within a note: `[[conceito - sistema-combate#Função ProcessarDano]]`.
- **Differentiate Code vs Graph Links:**
  - Use `[arquivo.ts](file:///c:/path/to/code.ts)` when providing clickable file references for the code editor.
  - Use `[[nome-da-nota]]` when referencing concepts, bugs, decisions, or gotchas in the Second Brain.
- **Bi-Directional Context:**
  - If a bug affected a function documented in `[[conceito - sistema]]`, the bug note MUST contain a Wikilink to `[[conceito - sistema]]`.
  - In Obsidian's Graph View, this guarantees that the system note becomes a central cluster/hub, surrounded by all its associated bugs, decisions, and gotchas.

### 3. Recording Knowledge via `/brain` or Work Completion
- When recording notes (via `/brain` or after resolving significant tasks), ALWAYS fulfill the required sections above. Never create shallow 2-line notes.
- Ensure every note clearly articulates the **"Why"**, the **"What NOT to do"**, and contains **Wikilinks to related notes** in the vault.
