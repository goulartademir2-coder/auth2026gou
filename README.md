# GOU Auth System

Sistema de Autenticação e Licenciamento completo, similar ao KeyAuth em funcionalidades, mas com implementação e visual totalmente próprios.

## 🚀 Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure DATABASE_URL
npm run db:push       # Criar tabelas no banco
npm run dev           # Iniciar servidor (port 3001)
```

### Frontend

```bash
cd frontend
npm install
npm run dev           # Iniciar Next.js (port 3000)
```

> **Importante:** Configure o PostgreSQL e atualize a `DATABASE_URL` no `.env`

---

## 📂 Estrutura do Projeto

```
AUTH GOU 2026/
├── backend/              # API REST (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── controllers/  # Controllers HTTP
│   │   ├── services/     # Lógica de negócio
│   │   ├── middleware/   # Auth, Rate Limit, Validate
│   │   ├── utils/        # JWT, Crypto, Logger
│   │   └── routes/       # Definições de rotas
│   └── prisma/           # Schema do banco de dados
│
├── frontend/             # Admin Panel (Next.js + React)
│   └── src/
│       ├── app/          # Páginas (App Router)
│       └── components/   # Componentes UI
│
├── sdk/                  # SDKs para integração
│   ├── python/           # SDK Python
│   └── cpp/              # SDK C++
│
└── docs/                 # Documentação
    └── api.md            # Documentação da API
```

---

## ✨ Features

### Autenticação
- ✅ Login com usuário/senha
- ✅ Login por key/licença  
- ✅ Registro de usuário
- ✅ Ativação por key
- ✅ Sessão segura com JWT
- ✅ Expiração de licença

### Sistema de Keys
- ✅ Tipos: TIME, LIFETIME, USES
- ✅ Vincular key a usuário
- ✅ Reset de HWID
- ✅ Ativar/desativar keys
- ✅ Limite de ativações

### Proteções
- ✅ HWID Lock
- ✅ Rate Limiting
- ✅ Senhas com Argon2
- ✅ Tokens JWT seguros
- ✅ Logs de auditoria

### Admin Panel
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de usuários
- ✅ Gerenciamento de keys
- ✅ Sistema de apps
- ✅ Visualização de logs
- ✅ Visual moderno com animações

---

## 🎨 Visual

O admin panel usa um design **dark neon** premium com:

- Gradientes roxo/azul (#8B5CF6 → #3B82F6)
- Animações com Framer Motion
- Glassmorphism effects
- Micro-animações e hover states

---

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login com credenciais |
| POST | `/api/auth/key` | Login com key |
| POST | `/api/auth/register` | Registrar usuário |
| GET | `/api/auth/session` | Validar sessão |
| POST | `/api/keys/generate` | Gerar novas keys |
| GET | `/api/users` | Listar usuários |

Veja a [documentação completa](./docs/api.md) para todos os endpoints.

---

## 🔧 Tecnologias

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT, Argon2, Zod

**Frontend:**
- Next.js 14 + React 18
- Framer Motion
- CSS Variables (design system próprio)

---

## 📄 Licença

Projeto desenvolvido para uso próprio.
