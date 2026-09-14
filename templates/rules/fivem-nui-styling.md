---
trigger: model_decision
description: Regras críticas de CSS, Tailwind e CEF para interfaces NUI no FiveM (sem backdrop-filter, sem opacidade de barra, sombras em style)
---

# Regras de Estilização CSS e Tailwind para FiveM NUI (CEF)

Diretrizes obrigatórias de compatibilidade para qualquer interface de usuário (NUI) desenvolvida para FiveM em React, Vue, Vanilla ou Tailwind CSS.

---

## 1. PROIBIDO `backdrop-filter: blur(...)` e `backdrop-blur-*`
- **Por que não funciona:** O CEF (Chromium Embedded Framework) do FiveM roda em modo Off-Screen Rendering (OSR) isolado do pipeline gráfico 3D do GTA V. Ele não tem acesso aos buffers do jogo e **não consegue borrar o mundo do jogo atrás da NUI**. No próprio DOM da NUI, causa queda drástica de FPS, lentidão e artefatos/caixas pretas.
- **Regra:** Nunca utilize `backdrop-filter` ou classes `backdrop-blur-*`.
- **Solução:** Use fundos escuros semi-transparentes sólidos com `rgba(...)` (ex: `rgba(15, 15, 20, 0.85)`). Se o menu exigir efeito de desfoque no jogo, use o nativo FiveM no script client (Lua):
  ```lua
  SetTimecycleModifier("hud_def_blur") -- ou "Bloom"
  SetTimecycleModifierStrength(1.0)
  ```

---

## 2. PROIBIDO Opacidade com Barra (`/alpha`) em Classes Tailwind
- **Por que não funciona:** Classes utilitárias com barra como `bg-black/65`, `border-white/5`, `bg-[#10b981]/10` geram sintaxe moderna `rgb(r g b / alpha)` ou variáveis CSS `--tw-*-opacity` que não são suportadas ou quebram no CEF do FiveM, deixando o elemento com cor 100% opaca/sólida ou invisível.
- **Regra:** Nunca utilize modificadores com barra (`/5`, `/10`, `/50`, `/65`, `/90`, etc.) em classes de cor.
- **Solução:** Declare a opacidade diretamente no valor da cor:
  - **Inline Style (Preferencial e mais seguro):**
    ```tsx
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
    ```
  - **Tailwind com Arbitrary RGBA direto:** `bg-[rgba(0,0,0,0.65)]` ou `border-[rgba(255,255,255,0.05)]`
  - **Hex de 8 dígitos:** `bg-[#000000a6]`

---

## 3. Sombras Customizadas (`box-shadow`) Sempre em `style={{ }}`
- **Por que não funciona:** Classes arbitrárias como `shadow-[0_8px_32px_rgba(0,0,0,0.6)]` frequentemente falham ao compilar em boilerplates antigos de FiveM ou causam bugs de renderização no CEF.
- **Regra:** Sempre declare sombras customizadas dentro do atributo `style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)' }}`.

---

## Comparativo Rápido

```tsx
// ❌ PROIBIDO NO FIVEM (Gera tela preta, queda de FPS e cores opacas)
<div className="shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md border border-white/5 bg-black/65" />

// ✅ CORRETO NO FIVEM (Leve, estável e previsível no CEF)
<div
  className="border rounded-lg"
  style={{
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  }}
/>
```
