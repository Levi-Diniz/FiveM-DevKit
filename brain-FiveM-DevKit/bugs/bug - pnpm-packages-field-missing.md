# Bug: Falha no pnpm install por packages field missing or empty

- **Data:** 2026-09-11
- **Status:** Resolvido
- **Tags:** #bug #ci #pnpm #github-actions

---

## Sintoma
O workflow `Publish to npm` do GitHub Actions falhou na etapa `Install dependencies` com o erro:
`ERROR packages field missing or empty`.

## Arquivos Afetados
- `pnpm-workspace.yaml`

## Causa-Raiz
Após a remoção da pasta `apps/www`, o repositório deixou de ser um monorepo. O arquivo `pnpm-workspace.yaml` permaneceu na raiz contendo apenas configurações de `allowBuilds`, mas sem o campo obrigatório `packages:`. O pnpm v9 em ambientes limpos de CI rejeita a execução se o arquivo de workspace existir sem declarar pacotes.

## Solução Aplicada
Exclusão do arquivo `pnpm-workspace.yaml`, permitindo que o pnpm reconheça o repositório como um projeto único padrão.

## Prevenção
Projetos de pacote único que não possuem múltiplos workspaces não devem conter o arquivo `pnpm-workspace.yaml`.
