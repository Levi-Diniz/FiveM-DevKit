# Índice do Second Brain

> Gerado por `fdk brain index` a partir do frontmatter das notas. Para mudar uma linha, edite a nota e rode o comando de novo.
> Sem o CLI, adicione a linha à mão no mesmo formato: `- [[nome-da-nota]] — resumo · files: \`caminho\` · #tag`.

## Projeto

- [[conventions]] — Respostas em pt-BR, commits só quando pedido (Conventional Commits em inglês), templates neutros por IDE · files: `templates/rules/git.md`, `templates/rules/idioma.md` · #conventions #preferences
- [[overview]] — CLI que instala regras, commands e skills de IA para FiveM em vários IDEs (Claude Code, AntiGravity, Cursor, Copilot) · files: `src/cli.ts`, `templates/manifest.json` · #overview
- [[stack]] — Node 18+ e TypeScript, citty + @clack/prompts, build com tsup, lint com Biome, release-please · files: `package.json`, `tsup.config.ts`, `biome.json` · #stack

## Decisões

- [[remocao-apps-www]] — apps/www (Next.js) removido; documentação só em Markdown, nunca reintroduzir app web neste repo · files: `README.md` · #repositorio #ci #documentacao

## Gotchas

- [[cef-nui-css-limitations]] — No CEF do FiveM, backdrop-filter, opacidade com barra do Tailwind e shadow-[...] quebram; use rgba e style inline · files: `templates/rules/fivem-nui-styling.md`, `templates/skills/fivem-nui/SKILL.md` · #nui #cef #css #tailwind
