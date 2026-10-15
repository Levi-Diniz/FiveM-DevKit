---
trigger: always_on
---

# Git Conventions & Rules

## ⚠️ Regras Fundamentais de Git (MANDATÓRIO)
- **NUNCA execute `git commit`, `git push` ou `git pull` por conta própria.**
- Operações de Git (commit, push, pull, checkout, branch, etc.) **SÓ DEVEM SER REALIZADAS QUANDO EXPLICITAMENTE SOLICITADAS PELO USUÁRIO**.
- **Nunca faça nenhuma ação no Git que não tenha sido expressamente solicitada.**

---

## 🔍 Análise Antes do Commit
Quando o usuário pedir um commit:
1. **Escopo = o que vai entrar neste commit.** Analise apenas `git diff --cached` (ou `git diff` se nada estiver staged). Não revise commits anteriores nem arquivos fora do diff.
2. **Estilo:** use no máximo `git log --oneline -5` para seguir o padrão de mensagens do repositório.
3. **O que incluir:** só os arquivos da tarefa atual. Nunca use `git add .` / `git add -A` sem o usuário pedir. Se houver mudanças que não são suas (ex.: outro agente, ver `AGENT_BOARD.md`), deixe-as fora e avise.
4. **Mensagem baseada no diff real**, não na memória da conversa.

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
fix(nui): fix card transparency and call button position

Use 8-digit hex (#121c17) for card background and increase bottom margin.
```
