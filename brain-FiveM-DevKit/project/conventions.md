---
type: project
status: active
updated: 2026-10-15
files: [templates/rules/git.md, templates/rules/idioma.md]
tags: [conventions, preferences]
summary: Respostas em pt-BR, commits só quando pedido (Conventional Commits em inglês), templates neutros por IDE
---

# Convenções e Preferências

> **TL;DR:** escolhas do usuário que valem para todo o projeto. A IA segue sem perguntar.

Só entra aqui o que o usuário confirmou. A IA pode propor um item, mas não adiciona sozinha.

## Comunicação

- Respostas em português do Brasil.

## Git

- Nunca commitar, dar push ou pull sem pedido explícito.
- Conventional Commits em inglês, assunto com até 50 caracteres.

## Templates

- Templates em `templates/` são neutros: caminhos específicos de IDE usam placeholders (`{{RULES_DIR}}`, `{{SKILLS_DIR}}`, `{{RULE_EXT}}`, `{{SKILL_FILE}}`, `{{BRAIN_DIR}}`).
- Claude Code e AntiGravity rodam lado a lado (`fdk init -t dual`); o Claude usa um perfil enxuto definido em `templates/manifest.json`.
