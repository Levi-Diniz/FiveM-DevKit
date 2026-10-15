# Second Brain

Memória de longo prazo do projeto, compartilhada entre você e os agentes de IA (Claude Code, AntiGravity). Abra esta pasta como um vault do **Obsidian**.

## Por onde começar

- **[[INDEX]]**: mapa de todas as notas, uma linha cada. É por ele que a IA encontra a nota certa sem ler tudo.
- **[[stack]]**: framework, banco e dependências. Mantenha atualizado; é o que a IA mais consulta.
- **[[conventions]]**: suas preferências. A IA segue o que estiver aqui.

## Pastas

| Pasta | O que guarda |
|---|---|
| `project/` | Visão geral, stack e convenções |
| `decisions/` | Escolhas técnicas, alternativas rejeitadas e por quê |
| `bugs/` | Bugs com causa não óbvia: sintoma, causa raiz, correção |
| `gotchas/` | Armadilhas de runtime (CEF, natives, OneSync, Windows) |
| `concepts/` | Sistemas do servidor: fronteiras, eventos, invariantes |
| `_templates/` | Modelos de nota (use com o plugin **Templates** do Obsidian) |

## Como registrar

- Peça `/brain` no chat da IA, ou crie a nota pelo Obsidian a partir de `_templates/`.
- Toda nota tem frontmatter (`type`, `status`, `summary`, `files`, `tags`) e começa com um **TL;DR**.
- Depois de criar ou editar notas à mão, rode `fdk brain index` para atualizar o [[INDEX]] e `fdk brain check` para achar links quebrados e notas desatualizadas.
