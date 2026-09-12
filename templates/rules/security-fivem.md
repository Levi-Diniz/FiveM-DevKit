---
trigger: model_decision
description: Diretrizes rigorosas de segurança, prevenção de exploits e arquitetura Zero-Trust para scripts FiveM
---

# Segurança e Proteção Anti-Exploit para FiveM (Zero-Trust Client)

## 1. Princípio Fundamental: "O Client é Sempre Hostil"
Em FiveM, qualquer jogador pode executar executores de código, disparar eventos de rede manuais (`TriggerServerEvent`) e alterar variáveis locais de memória. Portanto, **o Client NUNCA deve ser confiado para regras de negócio críticas**.

---

## 2. Regras Inegociáveis de Segurança

### A. Validação de `source` em Eventos de Servidor
- **NUNCA** aceite um identificador de jogador ou ID de personagem enviado como parâmetro pelo cliente em eventos `RegisterNetEvent`.
- **SEMPRE** utilize a variável global `source` injetada pelo runtime do FXServer:
  ```lua
  -- ❌ VULNERÁVEL (Exploiter pode enviar o ID de outro jogador)
  RegisterNetEvent('meu-recurso:darItem', function(targetPlayerId, item) ... end)

  -- ✅ SEGURO (source vem autenticado diretamente do runtime do FiveM)
  RegisterNetEvent('meu-recurso:darItem', function(item)
      local src = source
      -- Processa apenas para o jogador autenticado pelo src
  end)
  ```

### B. Prevenção Absoluta de SQL Injection (Prepared Statements)
- **PROIBIDO** concatenar strings ou variáveis em consultas SQL do `oxmysql` ou `ghmattimysql`.
- **SEMPRE** utilize *prepared statements* com passagem de parâmetros:
  ```lua
  -- ❌ VULNERÁVEL (Injeção de SQL via payload)
  MySQL.query('SELECT * FROM users WHERE license = "' .. playerLicense .. '"')

  -- ✅ SEGURO (Parâmetros escapados pelo driver)
  MySQL.query('SELECT * FROM users WHERE license = ?', { playerLicense })
  ```

### C. Cálculos Críticos Apenas no Server
- Preços de compra/venda, validação de saldo bancário, verificação de peso no inventário e concessão de recompensas **DEVEM ser calculados exclusivamente no Server**.
- O cliente apenas solicita a intenção (ex: *"quero comprar 2 unidades do item X"*). O servidor verifica se o item existe, busca o preço na tabela oficial do servidor, checa o dinheiro e executa a transação.

### D. Validação de Distância e Anti-Teleport
- Em interações no mapa (lojas, bancos, NPCs, baús), valide se a coordenada do jogador no Server está dentro da distância aceitável do ponto de interação (`#(GetEntityCoords(GetPlayerPed(src)) - pontoInteracao) <= maxDist`).

### E. Callbacks NUI Confiáveis e Sanitizados
- Callbacks `RegisterNUICallback` **SEMPRE** devem retornar uma resposta para o CEF via `cb('ok')` ou `cb(dados)`. Nunca deixe a Promise do JavaScript pendente.
- Valide o tipo e tamanho de payloads recebidos pela NUI antes de repassá-los para eventos de rede do servidor.
