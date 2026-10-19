---
name: nui-reverse-engineering
description: Rebuild a FiveM NUI whose source code was lost, starting from its built/minified bundle (Vue or React, webpack or vite in web-side/, html/, nui/ or dist/), into an editable React + TypeScript + Tailwind project with the same screens, data, visuals and NUI contract. Use when the user asks to reverse engineer, recreate, port or "copy" a built front, convert a legacy Vue/jQuery NUI to React, or says the resource only has script.js/style.css and no source.
---

# Engenharia reversa de NUI buildada

## Objetivo

Recriar, em código-fonte React editável, uma NUI de que só existe o bundle buildado (`script.js` / `index-*.js` + CSS), **com o mesmo comportamento e o mesmo visual**. Fidelidade vem antes de melhoria: primeiro igual, depois (se pedido) melhor.

> Siga também a skill `fivem-nui` e a rule `fivem-nui-styling`. Toda regra de CEF delas vale aqui.

---

## Fluxo (8 etapas, nesta ordem)

### 1. Preparação
- Leia o `AGENT_BOARD.md` (se existir) e registre a tarefa com os arquivos: projeto front novo, `client-side` do resource e `web-side/**`.
- Procure no Second Brain uma nota de NUI já reconstruída (`grep -ril "reconstruído\|bundle" brain-*/concepts`). Se houver, **ela é a referência de base e de convenções**: reuse o mesmo boilerplate e os mesmos padrões.
- Copie o bundle original para o scratchpad **antes** de qualquer mudança. Ele é a fonte da verdade e vai ser apagado da pasta do resource no fim.

### 2. Inventário e extração
```bash
python -I scripts/extract-app.py "<resource>/web-side" "<scratchpad>/<resource>"
```
- Gera `app.js` (código do app sem o runtime do framework), `full.js` (fallback), CSS formatado e `report.md`.
- O `report.md` lista callbacks NUI, ações de mensagem, stores, componentes, rotas, teclas, variáveis CSS e breakpoints de `font-size` do `:root`. É o checklist da reconstrução, não a verdade final: confirme cada item lendo `app.js`.
- Se o corte cair no lugar errado (o app começa antes), use `full.js` e procure por `GetParentResourceName`, `addEventListener("message"` e `__name:`.
- Liste também os assets (`web-side/**`: imagens, fontes) e o `index.html` (fontes do Google, ids do root).

### 3. Contrato NUI (o mais importante)
Leia **juntos** o `app.js` e o `client-side/*.lua` do resource e escreva a tabela de contratos antes de codar:

| Direção | Nome | Payload | Resposta / efeito |
|---|---|---|---|
| Lua → NUI | `SendNUIMessage({ Action = "Open", Payload = {...} })` | posição exata de cada item | o que o front faz |
| NUI → Lua | `RegisterNUICallback("X")` | campos e tipos | retorno e se fecha a UI |

Verifique:
- **Índices Lua × JS:** arrays Lua chegam 0-based no JS (Lua `[1]` = JS `[0]`). Payload posicional (`{ a, b, c }`) vira tupla.
- **Callback para outro resource:** o bundle pode chamar `https://vrp/Theme` ou outro resource. Confira se esse callback existe (`grep -rn 'RegisterNUICallback("Theme"'`). Se não existir, registre no próprio resource.
- **Quem fecha a UI:** o Lua (mensagem) ou o próprio front (depois do callback).
- **Teclas:** Esc, WASD e Enter, com as condições de cada uma (ex.: Esc bloqueado em modo criação).

### 4. Telas, estado e dados
- Mapeie as **stores** (pinia `state`/`getters`/`actions`, ou context/zustand no React) e as **rotas**. Rotas do vue-router viram estado `tab`/`screen`, sem router.
- Extraia **literalmente** as listas de dados: opções, títulos, limites (`min`/`max`/`step`/`digits`), paletas de cor, nomes e códigos. Coloque tudo em `src/data/*.ts` tipado, nunca espalhado nos componentes.
- Prefira telas **dirigidas por dados** (`SCREENS: Record<Tab, { title, sections }>`) quando o original repetir o mesmo componente com índices diferentes.
- Regras de comportamento a copiar 1:1: guardas de limite nos botões +/−, wraparound de carrossel, valores de fallback, quando um `watch` dispara o callback (só na mudança, não na abertura).

### 5. Visual
- As classes Tailwind do template minificado são a fonte: copie as strings `class:` dos render functions (`hs("div", { class: "..." })`).
- O Tailwind v3 do bundle mapeia quase 1:1 no v4, com estas exceções:
  - **Opacidade com barra** (`bg-from/40`, `text-white/50`, `bg-main/10`) é **proibida** no CEF. Crie `@utility` com `rgba(var(--x), a)` (`bg-surface`, `text-muted`, `bg-main-soft`...).
  - **Variáveis de tema** em canais `r, g, b` (não `r g b`) para funcionar com `rgb(var(--x))` e `rgba(var(--x), a)`.
  - **Cores nomeadas** (`bg-white`, `text-black`) viram hex arbitrário (`bg-[#ffffff]`).
- **Escala:** bundles Creative usam `:root { font-size }` com media queries (1rem = 16px em ≥1850×1000). Use `html { font-size: 1.4815vh }`, que dá 1rem = 16px em 1080p, a menos que o projeto já use outra convenção.
- Copie as regras CSS globais do bundle: `*` (letter-spacing, user-select), scrollbar, `body` (cor, font-size, line-height) e utilitários próprios (`bg-default`, `drop-shadow-light`, `scrollbar-hide`).
- **Ícones:**
  ```bash
  python -I scripts/extract-icons.py "<scratchpad>/<resource>/app.js" "<scratchpad>/<resource>/Icons.tsx"
  ```
  Renomeie os `IconN_<var>` conforme o uso no template (par `line`/`fill` de abas, chevrons, check, logo) e mova para `src/components/icons/Icons.tsx`. Nunca troque por lucide ou outra lib.
- Transições do Vue (`<Transition name="fade">` + `.fade-enter-active`) viram `motion` (`AnimatePresence`) com a mesma duração.
- Assets (imagens) vão para `public/<pasta>` com o **mesmo caminho relativo** usado no bundle (`src="genetics/X.webp"`).

### 6. Projeto React
- Base: copie o boilerplate da NUI já reconstruída do projeto (hooks `useObserver`/`fetchNui`/`useListen`, `ThemeProvider`, utils de cor/tema, `global.css`, configs Vite/TS/Biome) para um projeto novo (`<pasta-de-fronts>/new-<resource>`). Sem `node_modules`/`dist`.
- Estrutura: `types/`, `data/`, `mocks/`, `context/`, `providers/<Resource>.tsx` (estado + contrato NUI, com docstring listando NUI → Lua e Lua → NUI), `components/`, `screens/`.
- `debugData` com um payload de mock realista, para abrir no browser (`pnpm dev`) sem o jogo.
- Não adicione features, textos ou telas que o original não tinha.

### 7. Lua e build
- Adapte o **Lua** ao formato do boilerplate (`{ action, data }`), em vez de deformar os hooks para o formato legado (`{ Action, Payload }`). Mude só as linhas de `SendNUIMessage` e registre callbacks que faltam (ex.: `Theme`). Não refatore o resto.
- Todo `RegisterNUICallback` novo precisa responder (`Callback(...)`).
- Verifique:
  - `pnpm build` (`tsc -b` + `vite build`);
  - `npx biome check --write src` só no projeto novo;
  - CSS gerado sem sintaxe com barra: `grep -o "rgb([^)]*/[^)]*)" dist/assets/*.css` deve vir vazio.
- **Fidelidade de dados:**
  ```bash
  python -I scripts/diff-data.py app.js ../src                       # paletas hex, ordem incluída
  python -I scripts/diff-data.py app.js ../src/data/components.ts --bundle-regex 'title:\s*"([^"]+)"' --source-regex '\(\s*"([^"]+)"|title:\s*"([^"]+)"'
  ```
- Deploy: apague do `web-side` só os arquivos do bundle antigo (`script.js`, `style.css`, `index.html`), mantenha os assets e copie `dist/.` para lá. Confira se `ui_page` e `files` do `fxmanifest` ainda cobrem os caminhos (`web-side/**/*`).

### 8. Registro
- Crie a nota `concepts/<resource>-nui.md` no Second Brain: invariantes (índices, o que é código e o que é posição), contratos, ciclo de vida, onde fica o front e como fazer o deploy. Atualize o `INDEX.md`.
- Remova a linha do `AGENT_BOARD.md` e escreva o handoff, deixando o **teste in-game** como pendente.

---

## Armadilhas conhecidas

| Sintoma | Causa | Ação |
|---|---|---|
| Tela preta no CEF | Radix/`color-scheme: dark` | manter `:root { color-scheme: normal !important; }` do boilerplate |
| Cor sólida ou invisível | `/alpha` do Tailwind no CEF | `@utility` com `rgba(var(--x), a)` |
| Ícone vira quadrado cheio | bbox `M24 0v24H0V0h24Z` dentro de `<g fill="none">` achatado | o `extract-icons.py` já descarta. Confira ícones com `<g>` |
| UI não abre | Lua ainda manda `{ Action, Payload }` | adaptar o `SendNUIMessage` |
| Tema não carrega | callback em outro resource que não existe | registrar `Theme` no próprio resource |
| Valor salvo errado | off-by-one Lua × JS ou código × posição de carrossel | documentar nos invariantes da nota |
| Float drift em sliders 0.01 | soma repetida de `step` | `Number.parseFloat(v.toFixed(digits))` |

## Critério de pronto
1. Todas as telas, abas e itens do `report.md` existem, na mesma ordem.
2. Todos os callbacks e mensagens têm o mesmo nome, o mesmo payload e o mesmo efeito.
3. `diff-data.py` sem divergência para paletas e listas.
4. Build, typecheck e lint limpos, e CSS sem sintaxe com barra.
5. Nota no brain + handoff, com o teste in-game listado como pendente.
