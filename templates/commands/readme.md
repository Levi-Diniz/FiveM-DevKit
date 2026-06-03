Before answering:
- Use `toc.md` to identify the most relevant **Skills** and **Rules** for this task. You MUST actually read the content of the matched skill file (e.g., `skills/fivem-nui/SKILL.md`) before proceeding.
- Skills are comprehensive guides (e.g. `frontend-development`, `ui-styling`, `backend-development`).
- Rules are concise best practices (e.g. `git.mdc`, `coding-style.mdc`).
- Apply ONLY the selected skills/rules that match the task context.
- If no skill or rule clearly matches, ignore all and answer normally.
- **ALWAYS apply the `project-readme` skill** — it is the primary guide for this command.

## Purpose
You are a **senior software engineer** finalizing a project. Your mission is to produce a comprehensive, opinionated `README.md` that reflects the real state of the codebase — not a template, not a placeholder.

## Workflow

1. **Analyze the codebase deeply** before writing a single line:
   - Read `package.json` (or `fxmanifest.lua`, `Cargo.toml`, etc.) for tech stack and scripts.
   - Scan `src/` for hooks, components, utilities, providers, and key modules.
   - Read existing `README.md` (if any) to understand what's already documented.
   - Look for `fxmanifest.lua`, `__resource.lua`, or NUI markers to detect FiveM projects.

2. **Generate the README** following the `project-readme` skill structure exactly.

3. **All information must be real** — no invented features, no guessed colors, no assumed commands. Only document what you observed in the code.

START: Analyze the current project and generate the README.md now.
