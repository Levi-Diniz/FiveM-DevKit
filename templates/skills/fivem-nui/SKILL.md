---
name: fivem-nui-development
description: Guidelines for FiveM NUI development across different frameworks (React, Vue, jQuery, Vanilla). Includes performance optimization for FiveM CEF, responsive units (VH/VW), and strict Figma fidelity. Use when working on interfaces for FiveM resources.
---

# FiveM NUI Development Guidelines

## Purpose

Specialized guide for creating high-performance, responsive interfaces for FiveM (NUI). Covers communication patterns, browser compatibility (CEF), and design fidelity.

---

## 🛠️ Communication Patterns

### 1. React (Levi-Diniz Boilerplate)
If the project structure includes `hooks/observe.ts` or `hooks/post.ts`, use these patterns:

- **Receiving**: `Observe("actionName", (data) => { ... })`
- **Sending**: `Post.create("actionName", { data }, { mockResponse })`
- **Visibility**: Use `useVisibility()` hook.

### 2. Vanilla / Vue / Modern JS
- **Receiving**:
  ```javascript
  window.addEventListener('message', (event) => {
    const { action, data } = event.data;
    if (action === 'open') { /* ... */ }
  });
  ```
- **Sending**:
  ```javascript
  fetch(`https://${GetParentResourceName()}/actionName`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(resp => resp.json()).then(resp => { /* ... */ });
  ```

### 3. jQuery (Legacy/Traditional)
- **Sending**:
  ```javascript
  $.post(`https://${GetParentResourceName()}/actionName`, JSON.stringify(data));
  ```

---

## ⚡ Performance & Compatibility (CEF Limits)

### 🚫 Blur Optimization (PROIBIDO backdrop-filter / backdrop-blur)
- **`backdrop-filter: blur()` e `backdrop-blur-*` NÃO FUNCIONAM no FiveM.**
- **Motivo Técnico**: O CEF renderiza em modo Off-Screen Rendering (OSR) isolado do pipeline DirectX do GTA V. Ele não tem acesso ao buffer de renderização do jogo e portanto **não consegue** borrar o jogo atrás da NUI. Além disso, no DOM interno causa quedas brutais de FPS, artefatos gráficos e telas pretas.
- **NUNCA use `backdrop-blur-*` ou `backdrop-filter: blur(...)` mesmo se estiver no Figma.**
- **MANDATÓRIO**: Use fundos escuros semi-transparentes sólidos com `rgba(...)`. Se o menu exigir efeito de fundo borrado no jogo, use o nativo FiveM no script client (Lua):
  ```lua
  SetTimecycleModifier("hud_def_blur") -- ou "Bloom"
  SetTimecycleModifierStrength(1.0)
  ```

### 🐛 TailwindCSS Bugs & Regras de Opacidade e Cores
- **NUNCA use notação de barra (`/alpha`) para opacidade no Tailwind (ex: `bg-black/65`, `border-white/5`, `bg-[#10b981]/10`).** O CEF do FiveM não interpreta corretamente a sintaxe de divisão de opacidade (`rgb(r g b / alpha)` ou `--tw-*-opacity`), fazendo com que o elemento fique 100% opaco/sólido ou quebre totalmente o estilo.
- **MANDATÓRIO**: Aplique a opacidade diretamente no canal alfa da cor via `rgba(...)` preferencialmente em `style={{ }}` ou em hex de 8 dígitos sem barra:
  - **Inline Style (Altamente Recomendado):**
    ```tsx
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
    ```
  - **Tailwind Arbitrary direto sem barra:** `bg-[rgba(0,0,0,0.65)]` ou `border-[rgba(255,255,255,0.05)]`
  - **8-digit hex:** `bg-[#000000a6]` (para 65% de opacidade)
- **Background Color Names (`bg-emerald-400`, `bg-red-600`, etc.) frequentemente falham no CEF do FiveM.** Sempre use valores hexadecimais explícitos arbitrários ou `rgba(...)` em `style={{ }}`.

### 📦 Sombras Customizadas (`box-shadow`)
- **Classes arbitrárias de sombra (ex: `shadow-[0_8px_32px_rgba(0,0,0,0.6)]`) frequentemente falham na compilação ou renderização no CEF.**
- **MANDATÓRIO**: Declare sombras customizadas diretamente dentro do atributo `style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)' }}`.

- Exemplo Comparativo (React + Tailwind):
  ```tsx
  // ❌ RUIM (Causa quebra no FiveM CEF: tela preta, queda de FPS e cores opacas)
  <div className="shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md border border-white/5 bg-black/65" />

  // ✅ BOM (Estável, leve e perfeitamente compatível com FiveM CEF)
  <div 
    className="border rounded-lg"
    style={{ 
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      borderColor: 'rgba(255, 255, 255, 0.05)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
    }} 
  />
  ```

### 🚫 Anti-AI-Slop em HUDs e Interfaces FiveM
- **Evite o visual clichê de IA**:
  - ❌ **Proibido** colocar ícones dentro de quadradinhos coloridos repetitivos em todos os itens.
  - ❌ **Proibido** colocar bolinhas verdes pulsantes (`animate-ping`) sem necessidade real de status online/rede.
  - ❌ **Proibido** criar cards dentro de cards com cantos ultra-arredondados (`rounded-2xl` em tudo). Use cantos discretos (`rounded-[6px]`, `rounded-sm`) ou divisores de 1px.
  - ❌ **Proibido** paddings inflados de marketing (`p-8`, `gap-6`). UIs de FiveM devem ser **densas, compactas e legíveis em 100ms** pelo jogador.
- Para detalhes e diretrizes aprofundadas de design humano e autêntico, consulte a skill [Frontend Design](../frontend-design/SKILL.md).

---

## 📏 Responsive Units (VH/VW)

**NEVER use static pixels (`px`) for layouts.**

1. **Detection**: Check existing code to see if the project uses `vh` or `vw`.
2. **Standard**: Usually `vh` is used for vertical scaling (1080p base).
3. **Conversion**: Convert Figma pixel values to the project's unit.
   - **VH Formula**: `(px_value / 1080) * 100`
   - **VW Formula**: `(px_value / 1920) * 100`
4. **Mixed Usage**: Use `vh` for heights/font-sizes and `vw` for widths if the project requires adaptive stretching.

---

## 🎨 Figma Fidelity (MCP Server)

When a Figma design is provided via MCP:

- **Absolute Fidelity**: Colors, sizes, margins, and backgrounds must match the design EXACTLY.
- **Assets**: Use the exact SVGs, icons, and images from the design.
- **No Placeholders**: Do not use generic icons or "AI suggested" colors.
- **Backgrounds**: If the design has a specific gradient or image, implement it exactly.

### 🚫 Anti-Hallucination & Assets
- **NO External Images**: If the Figma design has a background image, **NEVER** fetch a replacement from the internet. Use the exact asset from Figma or ask the user to provide the path/file.
- **Icon Fidelity**: Do not use generic icon libraries (FontAwesome, Lucide) if the Figma design uses custom icons. Request or extract the exact **SVG code**.
- **Micro-interaction Precision**: Pay extreme attention to "active" states (e.g., selection indicators, underlines, glow effects). If there is a 2px green diamond under an icon in Figma, it must be converted to the responsive unit (e.g., `0.185vh`) and match the color exactly. **Never use `px` even for small offsets or borders.**

### 📦 Asset Management & Production
- **NO Figma Localhost URLs**: Using `http://localhost:3845/assets/...` in the code is **STRICTLY PROHIBITED**, even for prototyping.
- **Immediate Localization**: As soon as a Figma asset (SVG, PNG, JPG) is identified and needed:
    1. Download the asset immediately.
    2. Save it in the project's assets directory (e.g., `src/assets/`).
    3. Use semantic filenames (e.g., `icon-torso.svg` instead of `vector-1.svg`).
    4. Import and use the local file in the code.
- **Reason**: Ensures the project is always "game-ready" and prevents broken images if the Figma plugin is closed.

### 🎨 SVG & Icon Decision Matrix
When extracting icons/vector assets from Figma, choose the correct approach:

- **Inline SVG Components (`Icons.tsx` pattern)**:
  - **Use for**: Small, interactive UI icons (arrows, close buttons, navigation links, status indicators).
  - **Implementation**: Extract the SVG paths and build them as typed React components in a centralized file like `Icons.tsx` (e.g., `export const UserIcon = ({ className, style }: IconProps) => (...)`).
  - **Best Practice**: Use `fill="currentColor"` or `stroke="currentColor"` so colors can be dynamically controlled via Tailwind/CSS class names (including hover states and dark mode). Make sure all SVG attributes are converted to React camelCase (e.g., `strokeWidth`, `fillRule`).
- **Downloaded Asset Files (`/assets/` directory)**:
  - **Use for**: Large illustrations, highly complex vectors (many paths/gradients), static brand logos, or background graphics.
  - **Implementation**: Download the raw `.svg` or `.png` file directly from Figma, save it to the assets folder, and use it inside a standard `<img />` tag or CSS background.
  - **Reason**: Avoids bloating the JS bundle with massive vector coordinate strings and enables efficient browser caching.

### 🔗 Multi-State Synchronization (Figma)
- **Unified Feature Analysis**: When provided with multiple Figma screens for a single feature (e.g., different categories of a Garage), **DO NOT** create separate components for each.
- **Dynamic Logic**: Identify the shared elements (layout, sidebar, header) and create a centralized state management (e.g., `useState` or Context) to handle the visual changes between categories or filters.
- **Shared Components**: Extract repeating patterns (cards, buttons, lists) into reusable sub-components that adapt based on the data/state.

---

## 🚀 Detection Logic (For AI)

Before suggesting code:
1. Check `package.json` for frameworks (React, Vue).
2. Check `src/hooks` for boilerplate signatures.
3. Check `index.html` for jQuery CDN.
4. Check CSS files for existing unit patterns (`vh` vs `vw`).
5. **If unsure, ask the user: "Should I use the React Boilerplate patterns, jQuery, or Vanilla JS? Also, should I use VH or VW for units?"**

---
