# 🏗️ Arquitetura Completa - GameRent Full Stack

## 📋 Visão Geral

O GameRent é uma aplicação **Full Stack** completa com três camadas:

```
┌─────────────────────────────────────────────────────┐
│                    NAVEGADOR                         │
│              (Chrome, Firefox, etc.)                 │
└─────────────────────────────────────────────────────┘
                         ↑ ↓
                    HTTP/HTTPS
                         ↑ ↓
┌─────────────────────────────────────────────────────┐
│                  FRONTEND (REACT)                    │
│              http://localhost:5173                   │
│   • Interface do usuário                             │
│   • Componentes React                                │
│   • Estado local (useState)                          │
│   • Chamadas para API (fetch)                        │
└─────────────────────────────────────────────────────┘
                         ↑ ↓
                    REST API (JSON)
                         ↑ ↓
┌─────────────────────────────────────────────────────┐
│              BACKEND (NODE.JS + EXPRESS)             │
│              http://localhost:3001                   │
│   • API REST                                         │
│   • Autenticação JWT                                 │
│   • Validação de dados                               │
│   • Lógica de negócio                                │
└─────────────────────────────────────────────────────┘
                         ↑ ↓
                    SQL Queries
                         ↑ ↓
┌─────────────────────────────────────────────────────┐
│                  BANCO DE DADOS (MYSQL)              │
│                   localhost:3306                     │
│   • Armazenamento persistente                        │
│   • Tabelas relacionais                              │
│   • Integridade de dados                             │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 FRONTEND (React + TypeScript)

### Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool (rápido)
- **Tailwind CSS** - Estilização
- **ShadCN/UI** - Componentes prontos

### Estrutura de Pastas

```
frontend/
├── public/                  # Arquivos estáticos
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HomePage.tsx
│   │   ├── GameCard.tsx
│   │   ├── GameDetailsPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── LoginDialog.tsx
│   │   ├── ReservationManagement.tsx
│   │   └── ui/             # Componentes ShadCN
│   │
│   ├── services/           # Comunicação com API
│   │   └── api.ts          # Funções de API
│   │
│   ├── hooks/              # Hooks customizados (opcional)
│   ├── types/              # Tipos TypeScript (opcional)
│   ├── utils/              # Funções auxiliares (opcional)
│   │
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   └── styles/
│       └── globals.css     # Estilos globais
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Fluxo de Dados no Frontend

```typescript
// 1. Usuário interage com a UI
<Button onClick={handleLogin}>Login</Button>

// 2. Handler chama o serviço da API
const handleLogin = async () => {
  const response = await api.login({ email, password });
  // ...
};

// 3. Serviço faz requisição HTTP
// Em api.ts:
export async function login(credentials) {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  return response.json();
}

// 4. Atualiza o estado React
setUser(response.user);
setIsLoggedIn(true);

// 5. React re-renderiza a UI
```

### Estado da Aplicação

```typescript
// Estado global (App.tsx)
const [currentPage, setCurrentPage] = useState('home');  // Navegação
const [user, setUser] = useState(null);                  // Usuário logado
const [games, setGames] = useState([]);                  // Lista de jogos
const [reservations, setReservations] = useState([]);    // Reservas

// Estado local (componentes)
const [selectedGame, setSelectedGame] = useState(null);
const [selectedDate, setSelectedDate] = useState(null);
```

---

## ⚙️ BACKEND (Node.js + Express)

### Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL2** - Driver MySQL com Promises
- **Bcrypt** - Criptografia de senhas
- **JWT** - Autenticação com tokens
- **Express-validator** - Validação de dados
- **CORS** - Permitir requisições do frontend
- **Dotenv** - Variáveis de ambiente

### Estrutura de Pastas

```
backend/
├── config/
│   └── database.js          # Configuração MySQL
│
├── middleware/
│   └── auth.js              # Middleware de autenticação JWT
│
├── routes/
│   ├── auth.js              # POST /register, /login
│   ├── games.js             # GET /games, /games/:id
│   ├── reservations.js      # CRUD de reservas
│   └── users.js             # GET /profile
│
├── .env                     # Variáveis de ambiente (NÃO committar!)
├── .gitignore
├── package.json
├── server.js                # Arquivo principal
└── README.md
```

### Arquitetura em Camadas

```
┌──────────────────────────────────┐
│         CLIENTE (Frontend)       │
└──────────────┬───────────────────┘
               ↓
┌──────────────────────────────────┐
│      ROTAS (Routes)              │
│  • Recebe requisição HTTP        │
│  • Valida dados                  │
│  • Chama middleware              │
└──────────────┬───────────────────┘
               ↓
┌──────────────────────────────────┐
│    MIDDLEWARE (Auth, etc)        │
│  • Verifica autenticação         │
│  • Valida token JWT              │
│  • Adiciona req.user             │
└──────────────┬───────────────────┘
               ↓
┌──────────────────────────────────┐
│    LÓGICA DE NEGÓCIO             │
│  • Processa dados                │
│  • Aplica regras                 │
│  • Consulta banco                │
└──────────────┬───────────────────┘
               ↓
┌──────────────────────────────────┐
│    DATABASE (MySQL)              │
│  • Executa queries               │
│  • Retorna resultados            │
└──────────────┬───────────────────┘
               ↓
      Resposta JSON retorna
```

### Exemplo de Rota Completa

```javascript
// routes/reservations.js

// 1. Importações
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// 2. Middleware de autenticação
router.use(authenticateToken);

// 3. Rota POST /api/reservations
router.post('/', async (req, res) => {
  try {
    // 4. Extrai dados da requisição
    const { gameId, reservationDate } = req.body;
    const userId = req.user.id;  // Vem do middleware auth

    // 5. Validações
    if (!gameId || !reservationDate) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }

    // 6. Consulta ao banco
    const [result] = await db.query(
      'INSERT INTO reservations (user_id, game_id, reservation_date) VALUES (?, ?, ?)',
      [userId, gameId, reservationDate]
    );

    // 7. Resposta de sucesso
    res.status(201).json({
      success: true,
      reservationId: result.insertId
    });

  } catch (error) {
    // 8. Tratamento de erro
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

module.exports = router;
```

### Autenticação JWT

```javascript
// Como funciona:

// 1. Usuário faz login
POST /api/auth/login
{ "email": "joao@email.com", "password": "senha123" }

// 2. Backend valida e gera token
const token = jwt.sign(
  { id: user.id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// 3. Retorna token para frontend
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }

// 4. Frontend salva o token
localStorage.setItem('authToken', token);

// 5. Frontend envia token em requisições protegidas
GET /api/reservations
Headers: { Authorization: "Bearer eyJhbGc..." }

// 6. Middleware valida o token
jwt.verify(token, SECRET) // ✅ Válido → permite acesso

// 7. Se inválido/expirado → retorna erro 401/403
```

---

## 🗄️ BANCO DE DADOS (MySQL)

### Modelo de Dados (ER Diagram)

```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │
│ username    │
│ email       │
│ password_hash│
│ full_name   │
│ phone       │
│ created_at  │
│ updated_at  │
└──────┬──────┘
       │ 1
       │
       │ N
       ↓
┌─────────────┐         N     ┌─────────────┐
│reservations │ ─────────────→ │    games    │
├─────────────┤         1     ├─────────────┤
│ id (PK)     │               │ id (PK)     │
│ user_id (FK)│               │ name        │
│ game_id (FK)│               │ category    │
│ reservation_date│           │ summary     │
│ return_date │               │ description │
│ status      │               │ how_to_play │
│ total_price │               │ price       │
│ notes       │               │ players     │
│ created_at  │               │ duration    │
│ updated_at  │               │ stock       │
└─────────────┘               │ available   │
                              │ created_at  │
                              │ updated_at  │
                              └──────┬──────┘
                                     │ 1
                      ┌──────────────┼──────────────┐
                      │ N                           │ N
                      ↓                             ↓
              ┌───────────────┐            ┌───────────────┐
              │ game_images   │            │  game_rules   │
              ├───────────────┤            ├───────────────┤
              │ id (PK)       │            │ id (PK)       │
              │ game_id (FK)  │            │ game_id (FK)  │
              │ image_url     │            │ rule_text     │
              │ display_order │            │ rule_order    │
              │ created_at    │            │ created_at    │
              └───────────────┘            └───────────────┘
```

### Relacionamentos

- **users** 1 → N **reservations** (Um usuário tem várias reservas)
- **games** 1 → N **reservations** (Um jogo tem várias reservas)
- **games** 1 → N **game_images** (Um jogo tem várias imagens)
- **games** 1 → N **game_rules** (Um jogo tem várias regras)

### Queries Importantes

```sql
-- Buscar jogos com todas as imagens e regras
SELECT 
  g.*,
  GROUP_CONCAT(DISTINCT gi.image_url) as images,
  GROUP_CONCAT(DISTINCT gr.rule_text) as rules
FROM games g
LEFT JOIN game_images gi ON g.id = gi.game_id
LEFT JOIN game_rules gr ON g.id = gr.game_id
GROUP BY g.id;

-- Buscar reservas do usuário com dados do jogo
SELECT 
  r.*,
  g.name as game_name,
  g.price as game_price
FROM reservations r
JOIN games g ON r.game_id = g.id
WHERE r.user_id = ?
ORDER BY r.reservation_date DESC;

-- Verificar disponibilidade de um jogo em uma data
SELECT COUNT(*) as reserved_count
FROM reservations
WHERE game_id = ? 
  AND reservation_date = ? 
  AND status = 'active';
-- Se reserved_count < stock → disponível
```

---

## 🔄 Fluxo Completo de Uma Funcionalidade

### Exemplo: Criar Reserva

#### 1. FRONTEND - Usuário Clica em "Confirmar Reserva"

```typescript
// CalendarPage.tsx
const handleConfirm = async () => {
  try {
    // Chama o serviço da API
    await api.createReservation({
      gameId: selectedGame.id,
      reservationDate: selectedDate.toISOString().split('T')[0]
    });
    
    // Navega para tela de reservas
    navigate('/reservations');
  } catch (error) {
    alert('Erro ao criar reserva');
  }
};
```

#### 2. FRONTEND - Serviço da API

```typescript
// services/api.ts
export async function createReservation(data) {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch('http://localhost:3001/api/reservations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
}
```

#### 3. BACKEND - Recebe a Requisição

```javascript
// server.js
app.use('/api/reservations', reservationsRoutes);
```

#### 4. BACKEND - Rota Processa

```javascript
// routes/reservations.js
router.post('/', authenticateToken, async (req, res) => {
  const { gameId, reservationDate } = req.body;
  const userId = req.user.id;  // Vem do token JWT
  
  // Busca preço do jogo
  const [game] = await db.query('SELECT price FROM games WHERE id = ?', [gameId]);
  
  // Insere a reserva
  const [result] = await db.query(
    'INSERT INTO reservations (user_id, game_id, reservation_date, total_price) VALUES (?, ?, ?, ?)',
    [userId, gameId, reservationDate, game[0].price]
  );
  
  res.status(201).json({
    success: true,
    reservationId: result.insertId
  });
});
```

#### 5. DATABASE - Executa a Query

```sql
INSERT INTO reservations 
  (user_id, game_id, reservation_date, total_price, status) 
VALUES 
  (2, 1, '2025-11-25', 25.00, 'active');

-- Retorna: { insertId: 15, affectedRows: 1 }
```

#### 6. Resposta Volta ao Frontend

```
DATABASE → BACKEND → FRONTEND → UI Atualiza
```

---

## 🔒 Segurança

### Camadas de Segurança

```
┌────────────────────────────────────────────┐
│          FRONTEND (React)                   │
│  • Validação básica de formulários         │
│  • Esconde token no localStorage            │
│  • Sanitização de inputs                   │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│       BACKEND (Node.js + Express)          │
│  • CORS configurado                        │
│  • Validação server-side (express-validator)│
│  • Autenticação JWT                        │
│  • Bcrypt para senhas (hash + salt)       │
│  • Prepared statements (SQL injection)     │
│  • Rate limiting (futuramente)             │
└────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────┐
│         DATABASE (MySQL)                    │
│  • Usuário com permissões limitadas        │
│  • Foreign keys (integridade referencial)  │
│  • Constraints (validação de dados)        │
│  • Backup regular (produção)               │
└────────────────────────────────────────────┘
```

### Checklist de Segurança

#### ✅ Implementado

- [x] Senhas hasheadas com bcrypt
- [x] JWT para autenticação stateless
- [x] Prepared statements (evita SQL injection)
- [x] Validação de dados no backend
- [x] CORS configurado
- [x] Variáveis sensíveis em .env

#### ⚠️ Para Produção

- [ ] HTTPS obrigatório
- [ ] Rate limiting
- [ ] Helmet.js (headers de segurança)
- [ ] Sanitização de inputs (XSS)
- [ ] Logs de auditoria
- [ ] 2FA (autenticação de dois fatores)
- [ ] Backup automático do banco
- [ ] Monitoramento de erros (Sentry, etc)

---

## 📊 Performance

### Otimizações Implementadas

#### Frontend
- ✅ Vite (build rápido)
- ✅ Code splitting (lazy load - futuro)
- ✅ Imagens otimizadas (Unsplash)
- ✅ Cache de dados (localStorage)

#### Backend
- ✅ Connection pooling (MySQL)
- ✅ Async/await (não-bloqueante)
- ✅ Índices no banco de dados

#### Database
- ✅ Índices em colunas frequentemente consultadas
- ✅ Foreign keys para integridade
- ✅ InnoDB engine (transações)

---

## 🚀 Deploy (Produção)

### Opções de Hospedagem

```
┌─────────────────┬──────────────────┬──────────────────┐
│    FRONTEND     │     BACKEND      │    DATABASE      │
├─────────────────┼──────────────────┼──────────────────┤
│ • Vercel        │ • Railway        │ • PlanetScale    │
│ • Netlify       │ • Render         │ • Railway        │
│ • GitHub Pages  │ • Heroku         │ • AWS RDS        │
│ • Cloudflare    │ • DigitalOcean   │ • DigitalOcean   │
└─────────────────┴──────────────────┴──────────────────┘
```

### Passos para Deploy

1. **Database**
   - Criar banco em serviço cloud
   - Executar script SQL
   - Copiar credenciais de conexão

2. **Backend**
   - Fazer push para GitHub
   - Conectar com Railway/Render
   - Configurar variáveis de ambiente
   - Backend auto-deploya

3. **Frontend**
   - Alterar API_URL para URL do backend
   - Build: `npm run build`
   - Deploy em Vercel/Netlify

---

## 📈 Escalabilidade

### Atualmente (MVP)

```
[Frontend] → [Backend] → [MySQL]
```

### Futuro (Escala)

```
                    ┌──────────┐
      ┌────────────→│ Backend 1│─────┐
      │             └──────────┘     │
      │             ┌──────────┐     │
[Load Balancer]────→│ Backend 2│────→│ [Master DB]
      │             └──────────┘     │      ↓
      │             ┌──────────┐     │ [Replica DB]
      └────────────→│ Backend 3│─────┘
                    └──────────┘

         + Redis Cache
         + CDN para assets
         + Message Queue
```

---

**Documentação completa da arquitetura GameRent Full Stack** 🎮
