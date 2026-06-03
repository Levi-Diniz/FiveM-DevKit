---
name: fivem-nui-development
description: Guidelines for FiveM NUI development across different frameworks (React, Vue, jQuery, Vanilla). Includes performance optimization for FiveM CEF, responsive units (VH/VW), and strict Figma fidelity. Use when working on interfaces for FiveM resources.
---

# FiveM NUI Development Guidelines

## Purpose

Specialized guide for creating high-performance, responsive interfaces for FiveM (NUI). Covers communication patterns, browser compatibility (CEF), and design fidelity.

---

## 🛠️ Communication Patterns

### 1. React (Levi-Diniz Boilerplate) - Structure and Usage
When requested to create a FiveM front-end from scratch or when working with the React boilerplate, you **MUST** ensure the following structure and exact patterns are implemented. If the boilerplate files are missing, create them using these patterns:

#### 📂 Directory Structure
```text
src/
├── context/
│   └── VisibilityContext.ts
├── hooks/
│   ├── listen.ts
│   ├── observe.ts
│   └── post.ts
├── providers/
│   └── Visibility.tsx
├── utils/
│   ├── debugger.ts
│   └── misc.ts
├── types.ts
├── App.tsx
└── main.tsx
```

#### 🧩 Core Boilerplate Implementation

1. **`src/utils/misc.ts`**: Must export `isEnvBrowser = (): boolean => !window.invokeNative` and `noop = () => {}`.
2. **`src/types.ts`**: Must define at least:
   - `NuiMessageDataFrame<T = unknown> { action: string; data: T; }`
   - `NuiDebugEventFrame { action: string; data: unknown; }`
   - `NuiVisibilityFrame { setVisible: (visible: boolean) => void; visible: boolean; }`
3. **`src/hooks/observe.ts`**: Exports `Observe<T>(action, handler)`. Registers `window.addEventListener("message")`, checks if `event.data.action === action`, and calls the saved handler (using `useRef`). Uses `isEnvBrowser` to log events in the browser.
4. **`src/hooks/post.ts`**: Exports `class Post<T = unknown>`. Contains a `static async create(eventName, data, mockData)` method that uses `fetch` to `https://${GetParentResourceName()}/${eventName}`. Returns `mockData` immediately if `isEnvBrowser()` is true.
5. **`src/hooks/listen.ts`**: Exports `useListen(event, handler, target = window)`. Registers an event listener on the target using `useEffect` and `useRef`.
6. **`src/context/VisibilityContext.ts`**: Exports `VisibilityProviderValue` interface, `VisibilityCtx = createContext`, and a `useVisibility` hook that uses `useContext(VisibilityCtx)`.
7. **`src/providers/Visibility.tsx`**: 
   - A React component `VisibilityProvider` wrapping `{children}`.
   - Uses local `useState` for `visible`.
   - Uses `Observe("setVisibility")` (and action-specific setups like `"setupUI"`) to set visibility to true/false.
   - Uses `useEffect` with a `keydown` listener to handle `Escape` (or `Backspace`), triggering `Post.create("closeUI")` and setting `visible(false)` (only when visible).
   - Wraps children in `<VisibilityCtx.Provider>` and an encapsulating `<div style={{ display: visible ? "block" : "none", height: "100%" }}>`.
8. **`src/utils/debugger.ts`**: Exports a `Debugger` class that accepts `NuiDebugEventFrame[]` and a timer. Dispatches mock `MessageEvent` loops if `isEnvBrowser()` is true to test the UI in a normal browser.
9. **App Initialization (`App.tsx` / `main.tsx`)**: The top-level component in `App.tsx` must be wrapped inside `<VisibilityProvider>`.

#### 📡 Usage Patterns
- **Receiving**: `Observe("actionName", (data) => { ... })`
- **Sending**: `Post.create("actionName", { data }, { mockResponse })`
- **Visibility**: Use `const { visible, setVisible } = useVisibility()` hook.

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
