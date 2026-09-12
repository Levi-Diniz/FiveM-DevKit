---
trigger: always_on
description: Diretrizes obrigatórias de busca prévia, reuso de código e não-reinvenção da roda (Search Before Build)
---

# Reuso de Código & Anti-Duplicação (Search Before Build)

## Princípio Fundamental
Antes de criar qualquer nova função, utilitário, componente, hook ou helper, a IA **DEVE OBRIGATORIAMENTE verificar se já existe implementação semelhante pronta no projeto ou nas dependências instaladas**. Reinventar a roda ou duplicar código existente é considerado falha arquitetural grave.

---

## Protocolo Obrigatório: "Search Before Build" (Fase de Reconhecimento)

Antes de escrever uma única linha de código novo, o agente deve seguir este fluxo:

### 1. Varredura no Repositório (Codebase Search)
- Executar `grep_search` procurando por termos-chave, nomes de funções ou conceitos relacionados (ex: formatadores, cálculos, chamadas NUI, fetchers, helpers matemáticos, manipulação de strings/tabelas).
- Inspecionar diretórios utilitários comuns: `utils/`, `helpers/`, `hooks/`, `lib/`, `shared/`, `services/` ou pastas centrais do framework.
- Inspecionar o Second Brain: ler `brain-<Project>/concepts/` para verificar se o sistema ou mecânicas correlatas já foram documentados.

### 2. Hierarquia Estrita de Resolução (Em 4 Níveis)

1. **Nível 1 — Reutilizar Código Interno Existente:**
   - Se já existe uma função ou componente que resolve o problema (ex: `formatCurrency()`, `useVisibility()`, `emitNet()`), use-o diretamente. Não crie variações (`formatMoney()`, `formatCash()`).
2. **Nível 2 — Utilizar Bibliotecas Já Instaladas:**
   - Verifique `package.json` ou dependências do runtime (ex: `ox_lib`, `lodash`, `date-fns`, `clsx`, `lucide-react`).
   - Use os utilitários da biblioteca já presente no projeto em vez de criar implementações manuais rudimentares.
3. **Nível 3 — Estender com Retrocompatibilidade:**
   - Se uma função existente cobre 70-80% do que você precisa, **estenda a função existente** (adicionando parâmetros opcionais ou sobrecargas), garantindo que os usos antigos não quebrem. Não crie uma função "v2" isolada.
4. **Nível 4 — Criação do Zero (Último Recurso):**
   - Só crie código novo se for comprovado que não existe nada similar.
   - **Regra de Centralização:** Se o código novo for um helper ou utilitário genérico, posicione-o na pasta central compartilhada (`utils/`, `helpers/`) e exporte-o adequadamente, evitando helpers anônimos inline espalhados pelo código.

---

## Sinais de Alerta (Anti-Padrões Proibidos)

> [!CAUTION]
> - **Proibido Helper Inline Duplicado:** Criar funções utilitárias dentro de componentes ou recursos se elas pertencerem ao domínio compartilhado.
> - **Proibido Reimitar Framework:** Recriar helpers de notificação, drawtext, callbacks NUI ou inventário se o servidor já possui uma lib base (como `ox_lib` ou framework próprio).
> - **Proibido Variações Concorrentes:** Ter no mesmo projeto `moneyFormat()`, `formatMoney()` e `formatCurrency()`. Unifique no existente.
