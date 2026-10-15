---
type: project
status: active
updated: 2026-10-15
files: [src/cli.ts, templates/manifest.json]
tags: [overview]
summary: CLI que instala regras, commands e skills de IA para FiveM em vários IDEs (Claude Code, AntiGravity, Cursor, Copilot)
---

# Visão Geral do Projeto

> **TL;DR:** kit de ferramentas e CLI (`fdk`) que instala templates de IA para desenvolvimento FiveM em um ou mais IDEs ao mesmo tempo, a partir de uma única fonte em `templates/`.

## Componentes

- **CLI (`src/`)**: comandos em TypeScript (citty + clack), empacotados com tsup. `src/utils/install.ts` instala por alvo; `src/utils/templates.ts` transforma os templates para cada IDE.
- **Templates (`templates/`)**: `rules/`, `commands/`, `skills/` e `brain/` (estrutura deste vault). `manifest.json` lista tudo e define perfis por alvo.
- **Second Brain (`brain-FiveM-DevKit/`)**: este vault.

## Relacionados

- [[stack]] · [[conventions]] · [[remocao-apps-www]]
