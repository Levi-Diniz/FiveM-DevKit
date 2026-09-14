# Diretrizes do Projeto FiveM-DevKit

## Regras Críticas de CSS e NUI (Chromium Embedded Framework - CEF)

Ao criar ou editar interfaces NUI (React/Tailwind/CSS) para FiveM:

1. **PROIBIDO `backdrop-blur-*` ou `backdrop-filter`:**
   - O CEF do FiveM não acessa o buffer 3D do jogo e não consegue borrar o fundo, além de causar queda de FPS e artefatos pretos.
   - Utilize fundos semi-transparentes sólidos com `rgba(...)` ou acione o native `SetTimecycleModifier` no client Lua.

2. **PROIBIDO Opacidade com Barra (`/90`, `/65`, `/10`, `/5`) em Classes Tailwind:**
   - A sintaxe `/alpha` (ex: `bg-black/65`, `border-white/5`) quebra no CEF do FiveM, gerando cores sólidas ou elementos transparentes incorretos.
   - Aplique a opacidade diretamente no canal alfa da cor via `rgba(...)`, preferencialmente usando `style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}` ou utilitários Tailwind diretos sem barra (`bg-[rgba(0,0,0,0.65)]`).

3. **SOMBRAS CUSTOMIZADAS no `style={{ }}`:**
   - Não use classes arbitrárias como `shadow-[0_8px_32px_rgba(0,0,0,0.6)]`.
   - Sempre declare sombras customizadas dentro do atributo `style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)' }}`.
