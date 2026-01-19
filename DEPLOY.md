# Deploy na Vercel com Supabase

## 📋 Passo a Passo

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **Settings > Database**
3. Copie as connection strings:
   - **URI** (Transaction Pooler - porta 6543) → `DATABASE_URL`
   - **URI** (Session Pooler - porta 5432) → `DIRECT_URL`

**Formato:**
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

### 2. Deploy do Backend

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Crie novo projeto → Import do GitHub → Selecione a pasta `backend`
4. Configure as **Environment Variables**:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Connection string do Supabase (porta 6543) |
| `DIRECT_URL` | Connection string do Supabase (porta 5432) |
| `JWT_SECRET` | Uma string longa e segura |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_EMAIL` | `seu@email.com` |
| `ADMIN_PASSWORD` | Senha segura |
| `CORS_ORIGIN` | URL do frontend (após deploy) |
| `NODE_ENV` | `production` |

5. Deploy!
6. Copie a URL do backend (ex: `https://gou-auth-backend.vercel.app`)

---

### 3. Deploy do Frontend

1. Crie novo projeto na Vercel → Import do GitHub → Selecione a pasta `frontend`
2. Configure as **Environment Variables**:

| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | URL do backend (ex: `https://gou-auth-backend.vercel.app`) |

3. Deploy!

---

### 4. Atualizar CORS do Backend

Após o frontend estar online:

1. Volte ao projeto do backend na Vercel
2. **Settings > Environment Variables**
3. Atualize `CORS_ORIGIN` com a URL do frontend
4. Redeploy o backend

---

## 🔧 Comandos Úteis

**Rodar migrations localmente:**
```bash
cd backend
npm run db:push
```

**Visualizar banco:**
```bash
cd backend
npm run db:studio
```

---

## ⚠️ Importante

- Use a porta **6543** (Transaction Pooler) para `DATABASE_URL` - necessário para serverless
- Use a porta **5432** (Direct) para `DIRECT_URL` - necessário para migrations
- O `JWT_SECRET` deve ser uma string longa e aleatória em produção
- Mantenha as senhas seguras e **nunca** commite o `.env` real

---

## 🔒 Variáveis de Ambiente

### Backend (`.env`)
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="sua-chave-secreta-muito-longa-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
NODE_ENV="production"
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@seudominio.com"
ADMIN_PASSWORD="SenhaSegura123!"
CORS_ORIGIN="https://seu-frontend.vercel.app"
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL="https://seu-backend.vercel.app"
```
