---
name: project-readme
description: Guidelines for generating a comprehensive, senior-level README.md by analyzing the real codebase. Use when the user asks to document, generate, or update the project README. Produces structured documentation that reflects actual code — not templates or guesses.
---

# Project README Generation Guidelines

## Identity & Mindset

You are a **senior software engineer** who just finished building this project. You write documentation like someone who deeply understands the code and wants the next developer (or your future self) to understand it instantly. Your tone is **technical, confident, and precise**. No fluff, no filler, no invented features.

---

## 🔍 Pre-Writing Analysis (Mandatory)

Before writing any documentation, perform a full codebase scan:

1. **Stack Detection**
   - Read `package.json` → extract `dependencies`, `devDependencies`, and `scripts`.
   - Check for `fxmanifest.lua` / `__resource.lua` → FiveM project (apply `fivem-nui` skill).
   - Check for `Cargo.toml`, `go.mod`, `requirements.txt`, etc. for non-JS stacks.

2. **Architecture Scan**
   - List all directories in `src/` and their purpose.
   - Identify key modules: hooks, components, providers, utils, services, stores, types.
   - Note filenames that reveal patterns (e.g., `observe.ts` = NUI listener, `post.ts` = NUI sender).

3. **Feature Extraction**
   - Read component files to understand what each screen/menu does.
   - Identify user-facing interactions (forms, buttons, modals, events).
   - Trace data flows (what comes in, what goes out, what triggers what).

4. **Design Token Extraction**
   - Read CSS/Tailwind config for color palette, fonts, spacing.
   - Note specific values (e.g., `#00E27E`, `rgba(0, 226, 126, 0.1)`, `Agdasima` font).

5. **Communication Protocol**
   - For FiveM: trace all `Observe()` calls and `Post.create()` calls with their payloads.
   - For APIs: document all endpoints, methods, and request/response shapes.

---

## 📊 Padrão de Dados (Payloads)
Esta seção é crucial. Sempre instrua o agente a extrair e documentar a estrutura exata de dados que trafegam pelo sistema.

### 📥 Entrada (Entrada de Dados/Eventos)
Documentar o payload de eventos recebidos (ex: eventos Lua -> NUI, ou payloads de requests HTTP GET/POST de entrada) com exemplos de JSON reais e válidos.

### 📤 Saída (Saída de Dados/Callbacks)
Documentar o payload de eventos enviados (ex: NUI Callbacks -> Lua, ou payloads de requests HTTP enviados para outras APIs) com exemplos claros de JSON.

---

## 📄 README Structure (Follow This Exactly)

### 1. Title & Description
```markdown
# [Project Name]

[1–3 sentences describing what the project is, what it does, and its key differentiator. Be specific — mention tech, context (e.g., "FiveM server"), and the primary user-facing value.]
```

**Rules:**
- No vague intros like "This is a modern web app." Be concrete.
- Mention the actual stack in the description if relevant (e.g., React + TypeScript, FiveM NUI).

---

### 2. 🚀 Technologies
List only the technologies actually used. Extract them from `package.json` or equivalents.

```markdown
## 🚀 Tecnologias

- **[Tech Name]**: [What role it plays in this specific project — not just "UI library" but "base do projeto para tipagem forte e componentes reativos."]
- **[Tech Name]**: [...]
```

**Rules:**
- Include only what's directly relevant to the project's architecture.
- Describe the *purpose in context*, not the general definition of the technology.

---

### 3. ✨ Funcionalidades (Features)
List concrete user-facing or developer-facing features extracted from the code.

```markdown
## ✨ Funcionalidades

- **[Feature Name]**: [What it does, including any notable technical details like UI patterns, data handled, or interaction model.]
```

**Rules:**
- Each bullet = one real feature, confirmed in the code.
- Mention specific field names, event names, or UI elements when relevant.
- Avoid generic bullets like "Modern design" — describe *what* makes it distinctive.

---

### 4. 📡 Communication System (if applicable)
**For FiveM NUI projects:** Document the bidirectional communication layer.

```markdown
## 📡 Sistema de Comunicação (NUI)

O projeto utiliza um padrão de comunicação bidirecional robusto entre o **React (Frontend)** e o **FiveM (Client-side)**.

### [Hook/Module Name] (`src/path/to/file.ts`)
[What it does — is it a listener, sender, or debugger?]
- **[eventName]**: [What data it receives/sends and what it triggers in the UI.]
```

**Rules:**
- List all NUI events with their payload structure.
- Distinguish between incoming (Lua → React) and outgoing (React → Lua) messages.
- Document any debug/mock utilities.

---

### 5. 📊 Padrão de Dados (Payloads) (if applicable)
Document the raw payload structures of the communication layers.

```markdown
## 📊 Padrão de Dados (Payloads)

### 📥 Eventos Recebidos / Entrada
[Describe where data comes from, e.g. Lua -> NUI or API Requests]

#### 1. `[EventName]`
[Describe purpose]
```json
{
  "action": "[eventName]",
  "data": {
    "field": "value"
  }
}
```

### 📤 Eventos Enviados / Saída
[Describe where data goes to, e.g. NUI Callback -> Lua or API Responses]

#### 1. `[CallbackName]`
[Describe purpose]
```json
{
  "field": "value"
}
```
```

---

### 6. 🧩 Detailed View (Menus / Screens / Modules)
For each major screen or module, describe:
- How to trigger/open it (e.g., Lua command, route, event).
- What it renders and what user actions are available.
- What it emits/calls when the user completes an action.

```markdown
## 🧩 Visão Detalhada dos Menus

### 1. [Menu/Screen Name] (`ComponentName`)
- **Como abrir via [Lua/API/route]**: [Exact trigger — payload, route, command.]
- **Funcionamento**: [Step-by-step: what the user sees → what they do → what happens in code.]
- **Importante**: [Any critical ordering, data pre-loading, or edge cases.]
```

---

### 6. 🎨 Design Tokens
Extract real values from the codebase — never invent.

```markdown
## 🎨 Design Tokens

- **Cores**:
  - `Primária`: `#XXXXXX` ([Color name/description])
  - `Fundo`: [Exact gradient or rgba value]
  - `Bordas`: [Exact value]
- **Tipografia**: [Font name and its visual effect/purpose]
- **Transições e Efeitos**: [Specific animation/transition values used]
```

**Rules:**
- Copy exact hex values, rgba strings, and CSS class names from the code.
- Explain the *intent* of each token (e.g., "Verde Crush — cor de marca do servidor").

---

### 7. 🛠️ How to Run
Extract real commands from `package.json` scripts or equivalent.

```markdown
## 🛠️ Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

[Add any project-specific context, e.g., what the dev environment loads by default.]
```

---

### 8. Footer / Author
```markdown
---

Desenvolvido por **[Author Name](link)** — *[Team/Context]*
- **Discord**: `handle`
- **GitHub**: [username](link)
```

Extract author info from `package.json` (`author` field), existing README, or git history.

---

## ✅ Quality Checklist

Before finalizing the README, verify:

- [ ] Every technology listed is actually in `package.json` (or equivalent)
- [ ] Every feature described exists in the codebase
- [ ] Every color/font value is copied from source files
- [ ] Every NUI event is traced to an actual `Observe()` or `Post.create()` call
- [ ] No placeholder text remains (e.g., "lorem ipsum", "TODO", "[Add description]")
- [ ] Commands in "How to Run" match actual `scripts` in `package.json`
- [ ] Author info is real (from package.json or git log)

---

## 🚫 Anti-Patterns (Never Do These)

- ❌ **Do NOT** invent features that aren't in the code.
- ❌ **Do NOT** use generic color names ("blue", "green") — always use exact values.
- ❌ **Do NOT** write vague bullets like "Responsive design" without specifics.
- ❌ **Do NOT** add sections that don't apply to this project (e.g., "API Endpoints" for a pure NUI frontend).
- ❌ **Do NOT** use placeholder commands — verify every script exists in `package.json`.
- ❌ **Do NOT** write in a tone that sounds like a template — write as a senior dev who owns this code.

---

## 🌐 Language

- Write the README in the **same language as the existing project documentation**, or in **Portuguese (Brazilian)** if it's a FiveM/Brazilian server project and no other language is established.
- Emoji section headers are encouraged for scannability (match the pattern from the examples above).
