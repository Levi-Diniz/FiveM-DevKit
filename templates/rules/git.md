---
trigger: always_on
---

# Git Conventions & Rules

## ⚠️ Regras Fundamentais de Git (MANDATÓRIO)
- **NUNCA execute `git commit`, `git push` ou `git pull` por conta própria.**
- Operações de Git (commit, push, pull, checkout, branch, etc.) **SÓ DEVEM SER REALIZADAS QUANDO EXPLICITAMENTE SOLICITADAS PELO USUÁRIO**.
- **Nunca faça nenhuma ação no Git que não tenha sido expressamente solicitada.**

---

## 🔍 Análise Prévia do Conteúdo Alterado
Antes de elaborar e executar qualquer commit solicitado:
1. **Verifique minuciosamente todo o conteúdo alterado:** Analise detalhadamente todos os arquivos modificados (ex: inspecionando as alterações reais via `git status` e `git diff`) para entender exatamente tudo o que foi alterado.
2. **Baseie a mensagem no código real:** Leve em consideração todas as mudanças concretas para definir o escopo, assunto e mensagem do commit.

---

## 📝 Padrão de Commit (Conventional Commits)
Siga estritamente o formato de Conventional Commits:

```
<type>(<scope>): <subject>

[descrição resumida e direta da alteração]
```

### Tipos (`<type>`):
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alteração na documentação
- `style`: Formatação ou estilo de código (sem afetar regra de negócio)
- `refactor`: Refatoração que não corrige bug nem adiciona funcionalidade
- `perf`: Melhoria de performance
- `test`: Adição ou ajuste de testes
- `chore`: Tarefas de build, dependências ou ferramentas

### Regras do Assunto (`<subject>`):
- **Obrigatório:** As mensagens de commit devem ser **SEMPRE em inglês** (assunto, escopo e descrição).
- Use o modo imperativo em inglês ("add", "fix", "update", "refactor", "remove").
- Primeira letra minúscula.
- Sem ponto final no término.
- Máximo de 50 caracteres.
- Mantenha sempre uma descrição resumida, clara e direta.

### Exemplo de Commit:
```
fix(nui): fix transparency and call button position

Analyze changed files, update colors to 8-digit hex (#121c17), and increase bottom margin of the card.
```
