---
type: project
status: active
updated:
files: [fxmanifest.lua]
tags: [stack]
summary: Framework, banco, versões e recursos dos quais o projeto depende
---

# Stack

> **TL;DR:** <framework + banco + UI em uma linha, ex.: "QBCore + oxmysql, NUI em React/Vite, Lua 5.4".>

A IA preenche esta nota analisando `fxmanifest.lua`, `package.json` e os `dependencies`. Mantenha atualizada: é a primeira coisa que um agente lê num projeto novo.

| Item | Valor |
|---|---|
| Framework | <ESX / QBCore / Qbox / ox_core / standalone> |
| Banco | <oxmysql / mysql-async / ghmattimysql> |
| NUI | <React + Vite / Vue / Svelte / vanilla> e versão do Tailwind, se houver |
| Lua | <5.4 (`lua54 'yes'`)> |
| OneSync | <ativo / legacy> |
| Dependências | <ox_lib, ox_inventory, ox_target, ...> |
| Artefato / game build | <versão, se relevante> |

> [!IMPORTANT] Diretriz para IA
> - Use as APIs do framework listado acima. Não misture exports de outro framework (ex.: `ESX.GetPlayerFromId` num projeto QBCore).
> - Se algo aqui estiver errado ou faltando, corrija esta nota.
