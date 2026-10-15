---
description: Record the latest bug fix, decision, concept or gotcha in the Second Brain vault
argument-hint: [what to record, optional]
---

Before executing:
- Follow `{{RULES_DIR}}/second-brain{{RULE_EXT}}` (where things go, naming, links).
- The vault is `{{BRAIN_DIR}}/` at the workspace root. If it does not exist or has no `_templates/`, run `fdk brain init` (it only adds missing files). If the CLI is not available, create the folders `project/ decisions/ bugs/ gotchas/ concepts/` and write the note with the frontmatter shown below.

## Purpose
Turn the most recent engineering work into a short, findable note that prevents the next agent (or the user) from repeating a mistake or re-debating a choice. Since the user asked for `/brain` explicitly, decisions and conventions do not need extra confirmation here.

## Process

### 1. Decide what to record
Use the input below if given. Otherwise inspect the conversation and `git diff` / `git status` and pick the most valuable item:

| What happened | Type | Folder |
|---|---|---|
| Bug with a non-obvious root cause | `bug` | `bugs/` |
| Choice between approaches, with a reason | `decision` | `decisions/` |
| Runtime behaved differently than expected | `gotcha` | `gotchas/` |
| New system, mechanic or event contract | `concept` | `concepts/` |
| Framework, database, dependency or user preference | `project` | update `project/stack.md` or `project/conventions.md` |

If nothing is worth recording (trivial fix, already obvious from the code), say so and stop.

### 2. Update instead of duplicating
Read `{{BRAIN_DIR}}/INDEX.md` and grep the vault for the affected files and system name. If a note already covers the topic, update it (bump `updated`) instead of creating a new one. If the new knowledge replaces an old note, set `status: superseded` on the old one and link to the new note.

### 3. Write the note
- Copy the matching template from `{{BRAIN_DIR}}/_templates/<type>.md`. Replace `{{date:YYYY-MM-DD}}` with today's date and `{{title}}` with a short title.
- File name: kebab-case, no spaces, no type prefix, e.g. `bugs/callback-nui-sem-retorno.md`.
- Frontmatter is mandatory and drives the index:
  ```yaml
  ---
  type: bug            # bug | decision | gotcha | concept | project
  status: active       # active | superseded
  updated: YYYY-MM-DD
  files: [server/inventory.lua, web/src/hooks/useInventory.ts]   # real paths, relative to the workspace root
  tags: [inventory, nui]
  summary: One line a future agent can triage from INDEX.md
  ---
  ```
- Always keep the **TL;DR** and the **AI directive** block (Diretriz para IA / Invariantes / Sinais de detecção). Drop any other section that does not apply; a short accurate note beats a padded one.
- Link related notes with `[[note-name]]` (search the vault for the affected concept first). Use `[file](path)` for code, never `[[...]]`.
- Write the note body in the same language as the existing notes (default: Portuguese).

### 4. Refresh the index
Run `fdk brain index`. If the CLI is not available, add or update the note's line in `INDEX.md` under the right heading:
`- [[note-name]] — summary · files: \`path\` · #tag`

### 5. Report
Reply with one line linking the note, e.g. `Registrei em [bugs/callback-nui-sem-retorno.md]({{BRAIN_DIR}}/bugs/callback-nui-sem-retorno.md)`.
