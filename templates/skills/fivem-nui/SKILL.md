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

The FiveM browser (CEF) has specific limitations. Follow these strictly:

### 🚫 Blur Optimization
- **`backdrop-filter: blur()` is heavy.**
- **Figma Exception**: If the Figma design explicitly uses blur, it **MUST** be implemented to maintain fidelity.
- **MANDATORY**: When using blur, follow the [TailwindCSS Bug](#tailwindcss-bugs) fix below (always use inline styles).

### 🐛 TailwindCSS Bugs
- **Blur and Box-Shadow classes often fail in FiveM.**
- **MANDATORY**: Apply `blur` and `box-shadow` styles via inline `style={{ }}` (React) or vanilla CSS.
- Example (React + Tailwind):
  ```tsx
  // ❌ AVOID
  <div className="shadow-xl backdrop-blur-md" />

  // ✅ CORRECT
  <div 
    className="bg-black/50" 
    style={{ 
      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      backdropFilter: 'blur(12px)' 
    }} 
  />
  ```

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
