---
trigger: always_on
description: Table of contents, skill routing, rule selection guide, when to apply rules
---

You have multiple specialized rules organized into **Skills** (comprehensive guides with references) and **Rules** (concise best practices).

## Skills

- [FiveM NUI](../skills/fivem-nui/SKILL.md) - FiveM NUI development: CEF performance, VH/VW responsive units, strict Figma fidelity, NUI communication patterns, and asset management
- [Project README](../skills/project-readme/SKILL.md) - Generate a comprehensive, senior-level README.md by deeply analyzing the real codebase — stack, features, design tokens, communication patterns, and author info
- [Aesthetic](../skills/aesthetic/SKILL.md) - Visual design principles, storytelling, and micro-interactions for distinctive interfaces
- [Backend Development](../skills/backend-development/SKILL.md) - API design, architecture, authentication, security, and DevOps patterns
- [Frontend Design](../skills/frontend-design/SKILL.md) - Create distinctive, production-grade interfaces with bold aesthetics (avoid generic AI slop)
- [Frontend Development](../skills/frontend-development/SKILL.md) - React/TypeScript patterns: Suspense, lazy loading, TanStack Query/Router, MUI v7, file organization
- [UI Styling](../skills/ui-styling/SKILL.md) - shadcn/ui components, Tailwind CSS utilities, theming, accessibility, and canvas-based visual design
- [Sequential Thinking](../skills/sequential-thinking/SKILL.md) - Structured problem-solving with revision, branching, and hypothesis verification
- [Problem Solving](../skills/problem-solving/SKILL.md) - Techniques for complexity spirals, innovation blocks, meta-patterns, and scale testing
- [Research](../skills/research/SKILL.md) - Systematic research methodology for technical solutions with report generation

## Rules

- [Git](./git.md) - Git commit and branching conventions
- [Coding Style](./coding-style.md) - Coding style and best practices
- [Missions History](./missions-history.md) - History of monthly missions to avoid reward repetition

## Routing Guidelines

1. **FiveM Detection (MANDATORY FIRST STEP)**: Before selecting any skill, check if the project is a FiveM NUI project. Detection markers (any ONE is sufficient):
   - **Resource files**: `fxmanifest.lua`, `__resource.lua`, or a `web/` directory typical of NUI resources.
   - **Boilerplate signatures**: `hooks/observe.ts`, `hooks/post.ts`, `hooks/listen.ts`, or `providers/Visibility.tsx` in the `src/` directory.
   - If **any** marker is found, **ALWAYS include `FiveM NUI` as the primary skill** — it takes priority over `Frontend Design`, `UI Styling`, and `Frontend Development` for any UI/frontend work.
2. For each user request, first infer which domains are relevant.
3. Select 0–3 rules/skills that best match the request, prefer the SINGLE most specific one when possible.
4. If both security and performance apply, prioritize `security.mdc` first, then `performance.mdc`.
5. If no rule clearly matches, ignore all rules and answer normally.