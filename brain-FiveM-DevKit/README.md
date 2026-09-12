# Second Brain

Bem-vindo ao **Second Brain** do projeto. Esta base de conhecimento funciona como a memória persistente da equipe e das IAs, sendo também compatível diretamente como um cofre do **Obsidian**.

---

## Estrutura de Pastas & Padrões para IA

* **[[decisions/]] (`brain-FiveM-DevKit/decisions/`):** Decisões técnicas e arquiteturais (ADRs no padrão MADR). Devem conter: *Contexto/Problema, Alternativas Rejeitadas, Racional Técnico, Trade-offs e Diretrizes de Não-Regressão para IAs*. Formato: `decisao - <tema>.md`.
* **[[bugs/]] (`brain-FiveM-DevKit/bugs/`):** Histórico de bugs resolvidos (padrão Google SRE Post-Mortem). Devem conter: *Sintoma, Causa Raiz Estrutural (5 Whys), Correção, Prevenção e Guardrails de Segurança para o Agente*. Formato: `bug - <nome-do-bug>.md`.
* **[[gotchas/]] (`brain-FiveM-DevKit/gotchas/`):** Peculiaridades e armadilhas de runtime (CEF, FiveM, Node, Windows). Devem contrastar: *A Armadilha Intuitiva vs A Realidade da Engine, com exemplos de código Bad vs Good*. Formato: `gotcha - <titulo>.md`.
* **[[concepts/]] (`brain-FiveM-DevKit/concepts/`):** Conceitos do servidor, mecânicas e integrações (padrão DDD). Devem definir: *Fronteiras (O que É vs O que NÃO É), Ciclo de Vida e Invariantes Inegociáveis*. Formato: `conceito - <tema>.md`.
* **[[project/]] (`brain-FiveM-DevKit/project/`):** Visão geral da arquitetura, matriz de compatibilidade e limites de dependências entre componentes.

---

## Como Atualizar
Para registrar um novo aprendizado, decisão ou correção recente, use o comando:
```
/brain
```
A IA analisará as alterações recentes e criará a nota correspondente na pasta correta, preenchendo obrigatoriamente as seções de alta relevância especificadas nas diretrizes do template.

