---
name: frontend-design
description: Create distinctive, human-crafted, production-grade frontend interfaces that strictly eliminate the "AI Slop" look. Use this skill whenever building or refining UI components, HUDs, pages, or full web applications in React, Vue, or Tailwind.
---

# Frontend Design: Anti-AI-Slop & Distinctive Interfaces

Esta skill define as regras obrigatórias para que interfaces geradas por IA tenham **acabamento humano, autêntico e profissional**, eliminando ativamente os vícios, clichês e padrões previsíveis que entregam que um frontend foi gerado por IA ("AI Slop").

---

## 🚫 Os 7 Pecados Capitais do "AI Slop" (Lista de Proibições Estritas)

Ao gerar qualquer código de interface, o agente **NUNCA DEVE** usar os seguintes padrões a menos que o usuário exija textualmente:

### 1. ❌ O Falso "Dark Glassmorphism" em Tudo
- **O Vício da IA:** Colocar `bg-black/65` ou `bg-slate-900/80` com `backdrop-blur-md`, `border border-white/10` e sombras infladas `shadow-[0_8px_32px_...]` em quase todo container, HUD ou card.
- **A Regra:** Use fundos sólidos refinados ou semi-transparências com intenção clara (`rgba(...)`), sem abusar de blur e sem tentar fazer tudo parecer vidro genérico. Em ambientes de jogo/FiveM, `backdrop-blur` é terminantemente proibido.

### 2. ❌ Ícone Lucide dentro de Quadrinho Colorido
- **O Vício da IA:** Colocar cegamente um ícone centralizado dentro de um quadrado `p-2 rounded-lg bg-indigo-500/10 text-indigo-400` no topo de todo card.
- **A Regra:** Ícones devem ter propósito estrutural. Integre o ícone inline com o título, use variações de traço (`stroke-1.5`), use ícones monocromáticos discretos ou prefira tipografia e métricas fortes em vez de depender de ícones decorativos repetitivos.

### 3. ❌ Badges em Pílula com Bolinha Verde Pulsante
- **O Vício da IA:** Adicionar uma cápsula `rounded-full border px-2 py-0.5` com um `span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"` no topo de seções ou títulos onde não há conexão de rede em tempo real.
- **A Regra:** Só use indicadores de status se houver um estado real de conexão/servidor. Para tags e metadados, use tipografia monoespaçada discreta ou divisores limpos.

### 4. ❌ Gradientes Roxo-para-Azul e Glows Aleatórios
- **O Vício da IA:** `bg-gradient-to-r from-blue-500 to-purple-600` ou halos luminosos roxos/violetas desfocados no fundo.
- **A Regra:** Escolha paletas com personalidade autêntica: monocromático quente (zinc/stone com acento âmbar), estética tática militar (oliva/verde fósforo), high-contrast suíço (preto profundo, branco puro, acento vermelho técnico) ou neon industrial (grafite escuro com ciano afiado).

### 5. ❌ A Tríade Mecânica de 3 Cards Perfeitamente Simétricos
- **O Vício da IA:** Criar 3 colunas rigorosamente idênticas (Feature 1, Feature 2, Feature 3) com mesmo padding, mesmo tamanho de texto e mesmo peso visual.
- **A Regra:** Quebre a simetria com **hierarquia real**. Um elemento principal deve ter destaque (ex: 2/3 da largura ou fundo contrastante), enquanto itens secundários são mais compactos ou exibidos em lista/tabela densa.

### 6. ❌ "Cardception" (Cards Aninhados Sem Fim com `rounded-2xl`)
- **O Vício da IA:** Um container com cantos redondos gigantes que contém cards arredondados que contêm outros botões ultra-arredondados.
- **A Regra:** Evite caixas dentro de caixas. Separe conteúdos utilizando **linhas divisórias sutis de 1px**, alternância de tonalidade de fundo ou simplesmente **espaçamento tipográfico limpo**. Reduza o raio dos cantos (`rounded-[4px]`, `rounded-sm` ou `rounded-md`) em interfaces funcionais e técnicas.

### 7. ❌ Espaçamento Inflado de Landing Page em UIs Funcionais
- **O Vício da IA:** Aplicar `p-8`, `gap-6` e alturas gigantescas em ferramentas, HUDs, painéis e inventários.
- **A Regra:** Interfaces profissionais e de jogos priorizam **alta densidade de informação**: métricas compactas, fontes monoespaçadas para números, alinhamentos tabulares e aproveitamento inteligente de espaço.

---

## 🎨 Protocolo Anti-Slop em 3 Fases (Obrigatório Antes de Codar)

### Fase 1: Comprometer-se com um Arquétipo Estético Específico
Antes de escrever código, o agente deve internalizar um arquétipo visual coerente:
- **Brutalist / Utilitarian:** Cantos retos (`rounded-none`), bordas contrastantes, tipografia técnica monoespaçada, foco absoluto em dados e funcionalidade.
- **Tactical HUD / Sci-Fi Game:** Linhas técnicas de 1px, acentos de alta voltagem (verde fósforo, ciano ou âmbar), badges compactas, zero blur, alta legibilidade rápida.
- **Swiss / Minimalist Grid:** Tipografia forte com pesos contrastantes (título bold pesado vs legenda leve), grid assimétrico rigoroso, paleta monocromática elegante.
- **Editorial / Refined:** Tipografia display expressiva, respiro intencional, elegância sóbria sem artifícios de neon baratos.

### Fase 2: Definir Paleta de Tokens Fechada
- **Regra de 3 Cores:**
  1. **Base:** 1 tom neutro sólido dominante (ex: `#09090b` ou `#121214`).
  2. **Superfície:** 1 tom de contraste suave para painéis e divisores (ex: `#18181b` ou bordas com `rgba(255,255,255,0.08)`).
  3. **Acento:** 1 única cor de destaque usada com precisão cirúrgica (ex: `#fbbf24` para avisos, `#22c55e` para vida, `#38bdf8` para energia).
- **Proibido:** Espalhar utilitários de cores sortidas do Tailwind (`text-purple-400`, `bg-blue-500`, `border-pink-500`) na mesma tela sem sistema.

### Fase 3: Auto-Auditoria Anti-IA (Antes da Entrega)
Antes de finalizar qualquer arquivo de componente:
1. [ ] Removi qualquer `backdrop-blur` ou falso glassmorphism?
2. [ ] Removi quadradinhos coloridos genéricos em volta de ícones?
3. [ ] Removi badges com ponto verde pulsante sem função?
4. [ ] A densidade de informação está adequada (sem paddings inflados)?
5. [ ] A tipografia possui hierarquia real entre números, labels e títulos?

---

## 🛠️ Exemplos Comparativos de Código

### Exemplo 1: Card / Painel de Status

```tsx
// ❌ RUIM (Puro AI Slop: glassmorphism clichê, ícone na caixinha, badge pulsante inútil)
<div className="p-6 rounded-2xl bg-black/65 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
  <div className="flex items-center justify-between">
    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
      <Activity className="h-5 w-5" />
    </div>
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-xs text-emerald-400">Ativo</span>
    </div>
  </div>
  <h3 className="text-lg font-semibold text-white mt-4">Velocidade Atual</h3>
  <p className="text-3xl font-bold text-white mt-1">120 KM/H</p>
</div>

// ✅ BOM (Design Humano, Tático & Funcional: limpo, denso, tipografia forte)
<div 
  className="rounded-[6px] border px-4 py-3"
  style={{ 
    backgroundColor: 'rgba(18, 18, 20, 0.95)', 
    borderColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
  }}
>
  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
    <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">
      Velocímetro
    </span>
    <span className="font-mono text-[10px] text-zinc-500">
      CAN-BUS
    </span>
  </div>
  <div className="mt-2.5 flex items-baseline gap-1.5">
    <span className="font-mono text-3xl font-extrabold tracking-tight text-zinc-100">
      120
    </span>
    <span className="text-xs font-bold text-amber-400">
      KM/H
    </span>
  </div>
</div>
```

---

## 💡 Diretrizes para Interfaces de Jogos & HUDs (FiveM)
- **Foco em Percepção Rápida:** O jogador está em movimento. A UI deve ser lida em 100ms. Elimine decorações que disputam atenção com a gameplay.
- **Escala Responsiva com VH/VW:** Nunca use valores estáticos em `px` para layouts de FiveM.
- **Contraste de Fundo:** O fundo do jogo varia o tempo todo (céu brilhante, asfalto escuro, túneis). Garanta legibilidade usando fundos sólidos escuros com `rgba(10, 10, 12, 0.85)` e sombras de texto (`drop-shadow` ou `textShadow`) nas métricas principais.
