---
trigger: always_on
description: Protocolo de coordenação quando Claude Code e Google AntiGravity editam o mesmo workspace ao mesmo tempo (AGENT_BOARD.md)
---

# Coordenação Multi-Agente (Claude Code + AntiGravity)

> **Escopo:** esta regra só vale se existir `AGENT_BOARD.md` na raiz do workspace. Se o arquivo não existir, ignore esta regra inteira.

Dois agentes de IA podem estar editando este workspace **ao mesmo tempo**, cada um no seu próprio chat. Nenhum dos dois vê a conversa do outro: o único canal entre eles é o `AGENT_BOARD.md` e o próprio código.

## Identidade

- Identifique-se no board pelo nome do seu ambiente: `[claude]` se você roda no Claude Code, `[antigravity]` se você roda no Google AntiGravity.
- Se a seção **Roles** do board definir uma divisão de áreas, fique na sua área. Tarefas fora dela: avise o usuário antes de começar.

## Antes de Editar (OBRIGATÓRIO)

1. Leia o `AGENT_BOARD.md`.
2. Se algum arquivo que você precisa alterar estiver listado em **In Progress** por outro agente, **não edite esse arquivo**. Avise o usuário e espere, ou proponha outra abordagem.
3. Registre sua tarefa em **In Progress**, uma linha só:
   `- [claude] YYYY-MM-DD HH:MM | <tarefa curta> | files: <caminho1>, <caminho2>`
4. Se, no meio da tarefa, precisar de um arquivo novo, atualize sua linha antes de editá-lo.

## Durante o Trabalho

- **Mudanças que você não fez são do outro agente.** Se um arquivo mudou sem você mexer nele, não reverta, não "conserte" e não reformate.
- **Proibido:** `git checkout -- <arquivo>`, `git restore`, `git reset`, `git stash`, `git clean` ou qualquer comando que descarte mudanças não commitadas. O trabalho do outro agente ainda não está commitado.
- **Proibido** rodar formatadores ou lint com `--write`/`--fix` no projeto inteiro. Rode só nos arquivos que você registrou.
- Se o typecheck ou o build quebrar num arquivo registrado pelo outro agente, **reporte ao usuário**, não corrija.
- Instalar ou remover dependências (`package.json`, lockfiles) e mudar configuração compartilhada (`tsconfig`, `fxmanifest.lua`, `vite.config`) exige registrar o arquivo no board antes.

## Ao Concluir

1. Remova sua linha de **In Progress**.
2. Adicione no topo de **Handoffs** um resumo curto: o que mudou, arquivos tocados, o que ficou pendente e qualquer cuidado para o outro agente. O command `/handoff` faz isso.
3. Se a tarefa gerou conhecimento durável (bug, decisão, gotcha), registre também no Second Brain (`/brain`). O board é temporário; o `{{BRAIN_DIR}}/` é permanente.

## Second Brain Compartilhado

- Os dois agentes leem e escrevem no mesmo `{{BRAIN_DIR}}/`.
- Antes de criar uma nota, procure se o outro agente já criou uma sobre o mesmo tema. Se sim, atualize a existente em vez de duplicar.
