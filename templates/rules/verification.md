---
trigger: always_on
description: Validação e verificação obrigatória de código antes de declarar tarefas como concluídas (Definition of Done)
---

# Verificação Obrigatória Antes da Conclusão (Definition of Done)

## Princípio Fundamental
O agente **NUNCA DEVE** declarar uma tarefa de modificação ou criação de código como concluída sem antes executar a verificação técnica correspondente no terminal. Afirmar conclusão sem validação prévia é considerado falha técnica grave.

---

## Protocolo de Verificação por Tipo de Alteração

Antes de responder ao usuário informando que a tarefa foi concluída, execute a esteira de validação aplicável:

### 1. Projetos e Arquivos TypeScript / JavaScript
- **Verificação Estática de Tipos:** Execute `npx tsc --noEmit` (ou `pnpm tsc --noEmit` / `npm run typecheck`).
- **Build de Produção (quando aplicável):** Execute `npm run build` ou o script de compilação configurado no `package.json`.
- **Imports e Dependências:** Verifique se nenhuma dependência inexistente foi importada e se não há caminhos quebrados.

### 2. Interfaces NUI (React / Vue / Svelte / Web)
- Execute o build ou linter dentro da pasta web (`npm run build`).
- Garanta que não há erros de JSX/TSX, assets com caminhos quebrados ou chamadas a APIs de browser inexistentes no CEF do FiveM.

### 3. Lógica de Negócio e Testes Existentes
- Se o projeto possuir suíte de testes configurada (`vitest`, `jest`, `busted`):
  - Execute `npm test` (ou o comando de teste específico do módulo modificado).
  - Garanta que todos os testes passaram antes de entregar a solução.

### 4. Scripts Lua (FiveM Runtime)
- Se ferramentas estáticas estiverem disponíveis no ambiente (`luacheck`, `stylua`), execute-as para garantir ausência de erros de sintaxe ou variáveis globais vazadas acidentalmente.
- Inspecione pares de abertura/fechamento de blocos (`then ... end`, `do ... end`, parênteses).

---

## Checagem de Efeitos Colaterais (Anti-Regressão)
Se você alterou a assinatura de uma função, export ou evento:
1. Execute `grep_search` pelo nome da função/evento no repositório.
2. Certifique-se de que todos os pontos de chamada foram atualizados ou que a alteração manteve retrocompatibilidade com parâmetros opcionais.

---

## Critério de Entrega
A resposta final deve obrigatoriamente relatar:
1. O que foi alterado.
2. Qual comando de verificação foi executado (`tsc`, `build`, `test`) e o resultado confirmado.
