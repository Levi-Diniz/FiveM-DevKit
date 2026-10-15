---
type: project
status: active
updated: 2026-10-15
files: [package.json, tsup.config.ts, biome.json]
tags: [stack]
summary: Node 18+ e TypeScript, citty + @clack/prompts, build com tsup, lint com Biome, release-please
---

# Stack

> **TL;DR:** CLI Node.js em TypeScript (ESM), comandos com citty, prompts com @clack/prompts, build com tsup, publicada no npm como `fivem-devkit-cli`.

| Item | Valor |
|---|---|
| Runtime | Node.js >= 18 (`.nvmrc`) |
| Linguagem | TypeScript estrito, ESM (`"type": "module"`) |
| CLI | citty (comandos), @clack/prompts (interação), picocolors |
| Download de templates | giget (`github:Levi-Diniz/FiveM-DevKit/templates#master`) |
| Build | tsup → `dist/` |
| Lint / formatação | Biome (`npm run lint`) |
| Release | release-please + Conventional Commits |

> [!IMPORTANT] Diretriz para IA
> - Valide mudanças com `npx tsc --noEmit` e `npm run build`. O `biome check` do repositório já tem erros antigos: formate só os arquivos que você alterou.
> - `fdk pull` baixa os templates do GitHub (`master`): mudanças locais em `templates/` só chegam aos projetos depois de publicadas.
