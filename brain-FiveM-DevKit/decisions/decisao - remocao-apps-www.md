# Decisão: Remoção da aplicação web apps/www

- **Data:** 2026-09-11
- **Status:** Aprovada & Aplicada

---

## Contexto
O repositório estava configurado como um monorepo contendo uma aplicação web Next.js em `apps/www` que servia como landing page e documentação. Com o foco exclusivo nas ferramentas CLI e templates do FiveM DevKit, a pasta trazia complexidade desnecessária de build e dependências pesadas.

## Decisão
Remover a pasta `apps/www`, a configuração `vercel.json` e a GitHub Action `.github/workflows/deploy-www.yml`.

## Consequências
- Repositório mais leve e com tempo de clone reduzido.
- Foco total nas ferramentas do DevKit para FiveM.
- Menor risco de conflitos de dependências.
