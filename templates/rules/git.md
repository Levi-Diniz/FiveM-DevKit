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
- Use o modo imperativo em inglês ou português ("add" / "adiciona", "fix" / "corrigi", "update" / "atualiza").
- Primeira letra minúscula.
- Sem ponto final no término.
- Máximo de 50 caracteres.
- Mantenha sempre uma descrição resumida, clara e direta.

### Exemplo de Commit:
```
fix(nui): corrige transparencia e posicao do botao de chamada

Analisa os arquivos alterados e atualiza as cores para hex de 8 digitos (#121c17) e eleva a margem inferior do card.
```
