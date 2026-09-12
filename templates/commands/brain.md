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

### 3. Cross-Reference Vault Notes (Obsidian Graph Connection)
**MANDATORY FOR GRAPH LINKING:**
Before creating the note, scan `brain-<ProjectName>/` for related concepts, decisions, or gotchas:
- If a bug or decision affects a function or mechanic documented in `[[conceito - <sistema>]]`, you **MUST** insert a Wikilink to that note: `[[conceito - <sistema>]]` (or `[[conceito - <sistema>#FunçãoEspecifica]]`).
- This ensures Obsidian's **Graph View** connects the bug directly to the concept note, visualizing the system as a cluster with all its history.
- Do NOT use `[[...]]` for code files (e.g. don't write `[[src/index.ts]]`). Use markdown file links `[index.ts](file:///...)` for code, and reserve `[[wikilinks]]` strictly for notes in the vault.

### 4. File Templates (High-Relevance for AI & Obsidian)

#### For Decisions (`brain-<ProjectName>/decisions/decisao - <name>.md`):
```markdown
# Decisão: <Título Claro da Decisão>

- **Data:** YYYY-MM-DD
- **Status:** Proposta | Aprovada | Deprecada | Substituída por [[decisao-xyz]]
- **Impacto:** Alto | Médio | Baixo
- **Conexões no Grafo:** [[conceito - sistema-relacionado]], [[project/overview]]
- **Tags:** #decisao #arquitetura #fivem

---

## 1. Contexto & Problema (Decision Drivers)
Gargalos reais, dores operacionais ou limitações técnicas que forçaram a tomada de decisão.

## 2. Alternativas Consideradas & Rejeitadas
*(CRUCIAL PARA A IA: listar o que foi cogitado e por que foi descartado, para que IAs futuras não re-sugiram padrões rejeitados).*
- **Opção 1: [Nome da Opção]**
  - *Prós:* ...
  - *Contras / Motivo do Descarte:* ...
- **Opção 2 (Escolhida): [Nome da Opção]**
  - *Por que venceu:* ...

## 3. Decisão & Racional Técnico
O que foi executado e a fundamentação técnica da escolha.

## 4. Consequências & Trade-offs
- **Ganhos (Positivas):** O que melhorou diretamente.
- **Custos / Dores Aceitas (Negativas):** Trade-offs deliberadamente aceitos.

## 5. Diretrizes para IAs e Agentes (Regras de Não-Regressão)
> [!IMPORTANT]
> - O que o agente **NUNCA DEVE FAZER** ou sugerir a respeito deste tema.
> - Padrão obrigatório a ser seguido em novas implementações relacionadas.

## 6. Gatilho de Reavaliação (When to Revisit)
Condições objetivas sob as quais esta decisão pode ser revista no futuro.
```

#### For Bugs (`brain-<ProjectName>/bugs/bug - <name>.md`):
```markdown
# Bug: <Título Resumido do Sintoma>

- **Data:** YYYY-MM-DD
- **Severidade:** Alta | Média | Baixa
- **Arquivos Afetados:** [arquivo.lua](file:///path/to/arquivo.lua)
- **Conexões no Grafo:** [[conceito - sistema-afetado]] (ou [[conceito - sistema-afetado#NomeDaFuncao]])
- **Tags:** #bug #fivem #fix

---

## 1. Sintoma Observado & Impacto
Comportamento visual/lógico quebrado e mensagem/stack trace exata do erro.

## 2. Causa Raiz Real (Root Cause / 5 Whys)
A falha estrutural subjacente (ex: race condition, desserialização nula, estado desincronizado), não apenas o sintoma superficial.

## 3. A Correção Aplicada (The Fix)
O que foi alterado para sanar a causa raiz de forma definitiva.

## 4. Mecanismo de Prevenção (Anti-Regressão)
Como o código foi protegido contra o retorno deste bug (guard clause, validação de tipo, teste).

## 5. Diretriz para IAs (Agent Guardrail)
> [!CAUTION]
> Regra de segurança obrigatória que o agente deve respeitar ao mexer neste componente.
```

#### For Gotchas (`brain-<ProjectName>/gotchas/gotcha - <title>.md`):
```markdown
# Gotcha: <Nome da Armadilha / Peculiaridade>

- **Ambiente:** FiveM Client | FiveM Server | CEF/NUI | Node.js | Windows
- **Tags:** #gotcha #fivem #performance

---

## 1. A Armadilha Intuitiva (The Intuitive Trap)
O que um desenvolvedor ou IA tentaria fazer naturalmente achando que está correto.

## 2. A Realidade da Engine (Runtime Reality)
Por que a engine ou runtime falha, trava ou se comporta de forma inesperada.

## 3. Padrão Seguro (Bad vs. Good Code)
```lua
-- ❌ ERRADO (Causa problema)
codigo_antigo()

-- ✅ CORRETO (Padrão resiliente)
codigo_correto()
```

## 4. Sinais de Detecção
Palavras-chave ou contextos que indicam que a IA está prestes a cair nesta armadilha.
```

#### For Concepts (`brain-<ProjectName>/concepts/conceito - <name>.md`):
```markdown
# Conceito: <Nome do Sistema / Mecânica>

- **Categoria:** Gameplay | Economia | Infraestrutura | Framework
- **Sistemas Relacionados:** [[conceito - outro]], [[project/overview]]
- **Tags:** #conceito #sistema #servidor

---

## 1. Definição & Fronteiras (O que É e o que NÃO É)
- **O que É:** Propósito e escopo do conceito.
- **O que NÃO É:** Diferenciação explícita para evitar que a IA misture conceitos semelhantes.

## 2. Ciclo de Vida & Estados Válidos
Fluxo de estados e transições permitidas vs proibidas.

## 3. Contratos de Dados & Eventos
- **Eventos Client <-> Server:** Nomes e payloads esperados.
- **Estrutura de Dados:** Schemas ou tabelas principais.

## 4. Invariantes do Sistema (Regras Inegociáveis)
> [!IMPORTANT]
> Regras absolutas de negócio que nenhuma alteração de código pode violar.
```

### 4. Create Note & Report to User
- Create the file in the designated `brain-<ProjectName>/` directory.
- Confirm with a concise message linking to the newly created note (`[Nome da Nota](file:///path/to/file)`).
