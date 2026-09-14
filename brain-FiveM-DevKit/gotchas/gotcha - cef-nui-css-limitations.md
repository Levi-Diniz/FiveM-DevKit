# Gotcha: Limitações Críticas de CSS no FiveM NUI (CEF)

## Contexto
O FiveM renderiza interfaces NUI utilizando o **Chromium Embedded Framework (CEF)** em modo **Off-Screen Rendering (OSR)** sobreposto à renderização gráfica do GTA V via DirectX. Esse ambiente possui limitações severas de renderização e compatibilidade de CSS moderno.

---

## 1. Armadilha: `backdrop-filter: blur(...)` e `backdrop-blur-*`
### A Armadilha Intuitiva
Supor que `backdrop-filter: blur(12px)` ou `backdrop-blur-md` criará um efeito de vidro fosco mostrando o jogo ou elementos de fundo borrados, como na Web moderna.

### A Realidade da Engine
* O CEF é um processo isolado da pipeline gráfica do GTA V. Ele não possui acesso aos buffers de profundidade ou cores do mundo 3D do jogo, sendo incapaz de borrar o cenário do GTA V atrás da NUI.
* No próprio DOM interno, o CEF OSR sofre com problemas graves de composição com `backdrop-filter`, provocando quedas bruscas de FPS, flickering ou caixas pretas na tela.

### Solução
* Use fundos escuros semi-transparentes diretos (`rgba(...)`).
* Se precisar borrar o jogo ao abrir um menu, utilize nativos do FiveM no script client (Lua):
  ```lua
  SetTimecycleModifier("hud_def_blur")
  SetTimecycleModifierStrength(1.0)
  ```

---

## 2. Armadilha: Notação com Barra (`/opacity`) no Tailwind
### A Armadilha Intuitiva
Usar a sintaxe rápida do Tailwind como `bg-black/65`, `border-white/5` ou `bg-slate-900/90`.

### A Realidade da Engine
* A sintaxe de barra gera CSS moderno `rgb(r g b / alpha)` ou depende de variáveis CSS como `--tw-bg-opacity`.
* No CEF embutido no FiveM, essa notação frequentemente falha, fazendo a cor virar sólida (preto opaco ou branco opaco) ou invisível.

### Solução
Declare a opacidade diretamente no valor da cor:
* `style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderColor: 'rgba(255, 255, 255, 0.05)' }}`
* Ou via classe arbitrária Tailwind sem barra: `bg-[rgba(0,0,0,0.65)]`

---

## 3. Armadilha: Sombras Arbitrárias em Classes (`shadow-[...]`)
### A Armadilha Intuitiva
Usar `className="shadow-[0_8px_32px_rgba(0,0,0,0.6)]"`.

### A Realidade da Engine
* Sintaxes complexas arbitrárias de sombra com RGBA frequentemente falham na compilação do Vite/Tailwind em boilerplates FiveM legados ou causam bugs de renderização no parser do CEF.

### Solução
Passe a sombra diretamente no atributo inline:
* `style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)' }}`

---

## Comparativo: Bad vs Good

```tsx
// ❌ BAD (Causa tela preta, queda de FPS e cores opacas no FiveM):
<div className="shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md border border-white/5 bg-black/65">
  Conteúdo da HUD
</div>

// ✅ GOOD (Renderização leve, estável e previsível no CEF):
<div
  className="border rounded-lg"
  style={{
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  }}
>
  Conteúdo da HUD
</div>
```
