---
trigger: always_on
description: Second Brain - memória persistente do projeto (Obsidian) - quando consultar, quando registrar e como achar a nota certa
---

# Second Brain

Memória de longo prazo do projeto, compartilhada entre o usuário (Obsidian) e todos os agentes de IA. Fica em **`{{BRAIN_DIR}}/`** na raiz do workspace. Nunca crie outro vault nem use outro nome.

## Como achar a nota certa (sem ler tudo)

1. **`{{BRAIN_DIR}}/INDEX.md`**: uma linha por nota, com resumo, arquivos de código cobertos e tags. Leia o índice, não as pastas.
2. **Busca direta**: o frontmatter `files:` de cada nota lista os arquivos que ela cobre. Antes de editar `server/inventory.lua`, rode `grep -rl "inventory.lua" {{BRAIN_DIR}}/`. Para um erro, busque um trecho da mensagem em `{{BRAIN_DIR}}/bugs/`.
3. Abra só as notas que casarem.

## Quando consultar

| Situação | Onde olhar |
|---|---|
| Vai editar um arquivo não trivial | `grep` do nome do arquivo no vault |
| Apareceu um erro ou comportamento estranho | `bugs/` e `gotchas/` (busca pela mensagem ou pelo sistema) |
| Vai escolher lib, padrão, estrutura ou arquitetura | `decisions/` |
| Começou a trabalhar no projeto ou não sabe o framework | `project/stack.md` e `project/conventions.md` |
| Vai mexer num sistema do servidor (eventos, economia, inventário...) | `concepts/` |

**Não consulte** para tarefas triviais (texto, renomear, pergunta conceitual). Respeite sempre os blocos **Diretriz para IA**, **Invariantes** e **Sinais de detecção** das notas. Notas com `status: superseded` estão obsoletas: siga o link para a substituta.

## Quando registrar

| Aconteceu | Registro | Como |
|---|---|---|
| Bug com causa não óbvia, ou que levou mais de uma tentativa | `bugs/` | **Automático** |
| O runtime se comportou diferente do esperado (CEF, natives, OneSync) | `gotchas/` | **Automático** |
| Sistema novo ou contrato de eventos/NUI criado | `concepts/` | **Automático** |
| Descobriu framework, banco ou dependência que não estava em `stack.md` | `project/stack.md` | **Automático** |
| O usuário escolheu ou rejeitou uma abordagem com um motivo | `decisions/` | **Perguntar antes** |
| O usuário corrigiu uma preferência ("sempre use X", "não faça Y") | `project/conventions.md` | **Perguntar antes** |

- **Automático**: grave ao concluir a tarefa e avise em uma linha (`Registrei em {{BRAIN_DIR}}/bugs/x.md`).
- **Perguntar antes**: decisões e convenções registram escolhas do usuário. Pergunte "Quer que eu registre isso no brain?" e só grave com um sim.
- **Não registre**: correções triviais, o que já está claro no código ou no git log, e estado temporário (isso vai no `AGENT_BOARD.md`).
- Antes de criar, procure no `INDEX.md` uma nota sobre o mesmo tema. Se existir, **atualize-a** em vez de duplicar.
- Formato e processo: siga o command `/brain` e os modelos em `{{BRAIN_DIR}}/_templates/`.

## Manter correto

- Se você mudar código listado em `files:` de uma nota e ela ficar errada, atualize a nota (e o campo `updated`) ou marque `status: superseded` com um link para a nova.
- Depois de criar ou alterar notas, atualize o `INDEX.md`: rode `fdk brain index` ou adicione/edite a linha à mão no mesmo formato.

## Onde cada coisa vai

| Informação | Lugar |
|---|---|
| Regra que vale sempre, para todos os agentes | rules / `GEMINI.md` |
| Conhecimento do projeto: porquês, armadilhas, histórico, stack | Second Brain |
| Trabalho em andamento entre agentes | `AGENT_BOARD.md` |
| Memória privada de um agente (ex.: a do Claude) | Só o fluxo pessoal daquele agente. Nunca conhecimento do projeto, porque os outros agentes e o usuário não veem |

## Links e nomes (Obsidian)

- `[[nome-da-nota]]` para notas do vault (sem pasta, sem `.md`). `[texto](caminho/arquivo.lua)` para código.
- Toda nota de bug, decisão ou gotcha linka o conceito ou sistema afetado, quando existir. É isso que cria o grafo.
- Arquivos em kebab-case, sem espaços e sem prefixo de tipo: `bugs/callback-nui-sem-retorno.md`. O tipo já está na pasta e no frontmatter.
