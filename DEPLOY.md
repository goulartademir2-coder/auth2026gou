# Deploy na Vercel com Supabase

## Projeto Unificado

O frontend e backend agora estão em um único projeto Next.js.
A API está nas rotas `/api/*`.

---

## 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **Settings > Database**
3. Copie as connection strings:

```
DATABASE_URL = postgresql://postgres.xxx:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres.xxx:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 2. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Import do GitHub → `auth2026gou`
3. Configure as **Environment Variables**:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | Connection do Supabase (porta 6543) |
| `DIRECT_URL` | Connection do Supabase (porta 5432) |
| `JWT_SECRET` | Uma string longa e segura |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_EMAIL` | `seu@email.com` |
| `ADMIN_PASSWORD` | Senha segura |

4. Deploy!

---

## 3. Inicializar o Sistema

Após o deploy, acesse:
```
https://seu-app.vercel.app/api/init
```

Isso criará o admin inicial.

---

## 4. Acessar o Painel

Acesse a URL do seu app e faça login com:
- **Usuário**: valor de `ADMIN_USERNAME`
- **Senha**: valor de `ADMIN_PASSWORD`

---

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login de usuário (SDK) |
| POST | `/api/admin/login` | Login de admin |
| GET/POST | `/api/keys` | Listar/Gerar keys |
| GET | `/api/users` | Listar usuários |
| GET/POST | `/api/apps` | Listar/Criar apps |
| GET | `/api/stats` | Estatísticas |
| POST | `/api/init` | Inicializar sistema |
