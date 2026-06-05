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
   - Note filenames that reveal patterns (e.g., `useObserve.ts` = NUI listener, `usePost.ts` = NUI sender).

3. **Feature Extraction**
   - Read component files to understand what each screen/menu does.
   - Identify user-facing interactions (forms, buttons, modals, events).
   - Trace data flows (what comes in, what goes out, what triggers what).

4. **Design Token Extraction**
   - Read CSS/Tailwind config for color palette, fonts, spacing.
   - Note specific values (e.g., `#00E27E`, `rgba(0, 226, 126, 0.1)`, `Agdasima` font).

5. **Communication Protocol**
   - For FiveM: trace all `useObserver()` calls and `post()` calls with their payloads.
   - For APIs: document all endpoints, methods, and request/response shapes.

---

## 📊 Data Payload Standards (Mandatory)
This section is crucial. You must extract and document the exact structures of the data payloads passing through the system.

### 📥 Incoming (Events/Requests)
Document the raw payload of incoming events or requests (e.g., Lua -> NUI messages, or API requests) using valid, copy-pasteable JSON examples with correct property names.

### 📤 Outgoing (Callbacks/Responses)
Document the raw payload of outgoing events or responses (e.g., NUI Callbacks -> Lua, or API responses) using real, descriptive JSON examples.

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
## 🚀 Technologies

- **[Tech Name]**: [What role it plays in this specific project — not just general definitions, but its concrete role, e.g., "React + TypeScript: Project baseline for strong typing and reactive rendering."]
- **[Tech Name]**: [...]
```

**Rules:**
- Include only what's directly relevant to the project's architecture.
- Describe the *purpose in context*, not the general definition of the technology.

---

### 3. ✨ Features
List concrete user-facing or developer-facing features extracted from the code.

```markdown
## ✨ Features

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
## 📡 Communication System (NUI)

The project utilizes a robust bidirectional communication standard between **React (Frontend)** and **FiveM (Client-side)**.

### [Hook/Module Name] (`src/path/to/file.ts`)
[What it does — is it a listener, sender, or debugger?]
- **[eventName]**: [What data it receives/sends and what it triggers in the UI.]
```

**Rules:**
- List all NUI events with their payload structure.
- Distinguish between incoming (Lua → React) and outgoing (React → Lua) messages.
- Document any debug/mock utilities.

---

### 5. 📊 Data Payloads (if applicable)
Document the raw payload structures of the communication layers.

```markdown
## 📊 Data Payloads

### 📥 Incoming Events (Lua -> NUI)
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

### 📤 Outgoing Events (NUI -> Lua)
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
## 🧩 Detailed View (Menus)

### 1. [Menu/Screen Name] (`ComponentName`)
- **How to open via [Lua/API/route]**: [Exact trigger — payload, route, command.]
- **Flow**: [Step-by-step: what the user sees → what they do → what happens in code.]
- **Important**: [Any critical ordering, data pre-loading, or edge cases.]
```

---

### 7. 🎨 Design Tokens
Extract real values from the codebase — never invent.

```markdown
## 🎨 Design Tokens

- **Colors**:
  - `Primary`: `#XXXXXX` ([Color name/description])
  - `Background`: [Exact gradient or rgba value]
  - `Borders`: [Exact value]
- **Typography**: [Font name and its visual effect/purpose]
- **Transitions & Effects**: [Specific animation/transition values used]
```

**Rules:**
- Copy exact hex values, rgba strings, and CSS class names from the code.
- Explain the *intent* of each token.

---

### 8. 🛠️ How to Run
Extract real commands from `package.json` scripts or equivalent.

```markdown
## 🛠️ How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```

[Add any project-specific context, e.g., what the dev environment loads by default.]
```

---

### 9. Footer / Author
```markdown
---

Developed by **[Author Name](link)** — *[Team/Context]*
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
- [ ] Every NUI event is traced to an actual `useObserver()` or `post()` call
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

- By default, write the README in **English** to match international developer documentation standards, unless the project has explicit requirements for another language.
- Emoji section headers are encouraged for scannability (match the pattern from the examples above).
