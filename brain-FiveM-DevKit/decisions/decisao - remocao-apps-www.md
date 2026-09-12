# Decisão: Remoção da aplicação web apps/www

- **Data:** 2026-09-11
- **Status:** Aprovada & Aplicada
- **Impacto:** Médio (Estrutura do Repositório & CI/CD)

---

## 1. Contexto & Problema (Decision Drivers)
O repositório foi inicialmente estruturado como um monorepo (Turborepo/Next.js) contendo uma landing page e documentação em `apps/www`. No entanto, isso gerou gargalos operacionais:
- **Desvio de Foco:** O objetivo central do FiveM DevKit é fornecer tooling de terminal (CLI), geradores de código e templates NUI/Lua para desenvolvedores FiveM.
- **Complexidade de Dependências:** O ecossistema Next.js/React do `apps/www` inflava drasticamente o `node_modules`, tornando comandos como `npm install` e `git clone` lentos e pesados.
- **Instabilidade no CI/CD:** Pipelines de build no Vercel e workflows de deploy quebravam com frequência por motivos alheios à CLI e às ferramentas do DevKit.

---

## 2. Alternativas Consideradas

### Opção 1: Manter monorepo e corrigir o pipeline do Next.js
- **Prós:** Código do site e da CLI no mesmo repositório; atualização em commit único.
- **Contras / Por que foi rejeitada:** Adicionava overhead contínuo de manutenção de frontend web em um projeto focado em scripts e CLI. Não agregava valor funcional ao usuário do DevKit.

### Opção 2: Separar o site em um repositório isolado (`FiveM-DevKit-Web`)
- **Prós:** Desacopla 100% o site do repositório da CLI.
- **Contras / Por que foi rejeitada:** Criação prematura de múltiplos repositórios. No estágio atual do projeto, a prioridade máxima é amadurecer a CLI e seus templates.

### Opção 3 (Escolhida): Exclusão definitiva de `apps/www`
- **Prós:** Elimina dependências pesadas, zera erros de CI de deploy web, deixa o repositório limpo e focado exclusivamente no tooling FiveM.
- **Por que venceu:** Alinhamento direto com o objetivo core do projeto com custo zero de manutenção adicional.

---

## 3. Decisão
Remoção permanente do diretório `apps/www`, do arquivo de configuração `vercel.json` e da GitHub Action `.github/workflows/deploy-www.yml`. Toda a documentação e orientações de uso passam a residir em arquivos Markdown dentro do repositório (`README.md`, documentação em pastas dedicadas e templates).

---

## 4. Consequências & Trade-offs
- **Ganhos (Positivas):**
  - Redução expressiva no tamanho do repositório e no tempo de clone/instalação.
  - CI focado puramente em testes, lint e builds da CLI.
  - Zero risco de conflitos de dependências entre frameworks web e a CLI Node.
- **Custos / Dores Aceitas (Negativas):**
  - Perda de uma página web navegável e interativa pública no domínio web próprio no momento atual.
  - Usuários acessam a documentação via Markdown do GitHub ou localmente.

---

## 5. Diretrizes para IAs e Agentes (Regras de Não-Regressão)
> [!IMPORTANT]
> - **NÃO reintroduzir** aplicações web (Next.js, Vite, React, Astro) na raiz ou como monorepo dentro deste repositório para fins de documentação ou landing page.
> - Manter toda documentação pública em arquivos Markdown dentro do repositório.
> - Se houver demanda futura por site visual, a IA deve orientar a criação de um repositório separado dedicado (ex: `FiveM-DevKit-Web`), nunca dentro deste repo.

---

## 6. Gatilho de Reavaliação (When to Revisit)
Esta decisão só deve ser reavaliada caso o DevKit atinja escala onde um portal de documentação com playground/sandbox CEF interativo seja estritamente necessário. Mesmo nesse cenário, o portal deve ser hospedado em repositório externo ou via GitHub Pages gerado estaticamente a partir dos próprios markdowns.

