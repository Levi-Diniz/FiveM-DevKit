Before executing:
- Consult `.agents/rules/second-brain.md` for conventions and vault structure.
- Target directory is `brain-<ProjectName>/` at the root of the workspace (Obsidian Vault, e.g. `brain-FiveM-DevKit/`).

## Purpose
Capture and document the most recent engineering work (a resolved bug, an architectural decision, a server mechanic/concept, or an environment gotcha) as a dedicated, Obsidian-compatible markdown note inside `brain-<ProjectName>/`.

---

## Process

### 1. Analyze Recent Work
Inspect the last interaction, recent modifications, and git diff/status:
- **Bug Fix:** Did we just diagnose and resolve an issue or error?
- **Technical Decision:** Did we choose a library, pattern, or architectural direction?
- **Server Concept:** Did we implement or define a game system, mechanic, or FiveM resource flow?
- **Project Structure:** Did we organize folders, build steps, or repository standards?
- **Gotcha / Trap:** Did we stumble upon a FiveM CEF quirk, OS lock, or subtle limitation?

### 2. Choose Destination & File Name
Target directory: locate the vault folder `brain-<ProjectName>/` (e.g. `brain-FiveM-DevKit/` or create it if absent).
Select the appropriate subfolder:

| Type | Destination Folder | File Name Format |
|---|---|---|
| Bug Resolved | `brain-<ProjectName>/bugs/` | `bug - <short-description>.md` |
| Technical Decision | `brain-<ProjectName>/decisions/` | `decisao - <short-topic>.md` |
| Server Concept / Mechanic | `brain-<ProjectName>/concepts/` | `conceito - <system-name>.md` |
| Project Standard / Setup | `brain-<ProjectName>/project/` | `<topic-name>.md` |
| Quirk / Gotcha | `brain-<ProjectName>/gotchas/` | `gotcha - <short-title>.md` |

*(Use kebab-case or clean lowercase with hyphens for the `<short-...>` name).*

### 3. File Templates (Obsidian-Friendly)

#### For Bugs (`brain-<ProjectName>/bugs/bug - <name>.md`):
```markdown
# Bug: <Clear Title of the Bug>

- **Data:** YYYY-MM-DD
- **Status:** Resolvido
- **Tags:** #bug #fivem #fix

---

## Sintoma
O que acontecia de errado para o jogador/desenvolvedor ou no console.

## Arquivos Afetados
- [arquivo](file:///path/to/file)

## Causa-Raiz
Explicação técnica do motivo exato pelo qual o bug ocorria.

## Solução Aplicada
O que foi alterado no código para resolver o problema de forma definitiva.

## Prevenção
Como evitar que esse problema ocorra novamente ou como testá-lo.
```

#### For Decisions (`brain-<ProjectName>/decisions/decisao - <name>.md`):
```markdown
# Decisão: <Título da Decisão>

- **Data:** YYYY-MM-DD
- **Status:** Aprovada
- **Tags:** #decisao #arquitetura

---

## Contexto
Por que essa decisão precisou ser tomada.

## Decisão
O que foi decidido e adotado.

## Alternativas Avaliadas
Quais alternativas foram cogitadas e por que foram descartadas.

## Consequências & Trade-offs
Pontos positivos e concessões da abordagem escolhida.
```

#### For Concepts (`brain-<ProjectName>/concepts/conceito - <name>.md`):
```markdown
# Conceito: <Nome do Sistema / Mecânica>

- **Data:** YYYY-MM-DD
- **Tags:** #conceito #sistema #servidor

---

## Objetivo & Funcionamento
Explicação detalhada de como a funcionalidade funciona no servidor.

## Fluxo de Dados & Eventos
Eventos client/server ou NUI envolvidos no fluxo.

## Dependências & Scripts Relacionados
- [[recurso-relacionado]]
```

### 4. Create Note & Report to User
- Create the file in the designated `brain-<ProjectName>/` directory.
- Confirm with a concise message linking to the newly created note (`[Nome da Nota](file:///path/to/file)`).
