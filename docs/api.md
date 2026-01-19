# GOU Auth API Documentation

## Base URL

```
Production: https://api.gouauth.com
Development: http://localhost:3001
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

---

## Public Endpoints (SDK)

### Login with Credentials

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "usuario123",
  "password": "sua_senha",
  "hwid": "HARDWARE_ID_HERE",
  "appId": "uuid-do-app"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2026-01-20T12:00:00.000Z",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "usuario123",
      "email": "user@email.com",
      "subscriptionExpires": "2026-06-19T00:00:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

| Code | Error | Description |
|------|-------|-------------|
| 401 | INVALID_CREDENTIALS | Wrong username or password |
| 403 | USER_BANNED | User is banned |
| 403 | SUBSCRIPTION_EXPIRED | Subscription has expired |
| 403 | HWID_MISMATCH | Hardware ID doesn't match |
| 404 | APP_NOT_FOUND | Invalid app ID |

---

### Login with License Key

```http
POST /api/auth/key
```

**Request Body:**
```json
{
  "key": "GOU-XXXX-XXXX-XXXX",
  "hwid": "HARDWARE_ID_HERE",
  "appId": "uuid-do-app"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2026-01-20T12:00:00.000Z",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "key_GOU-XXXX",
      "subscriptionExpires": "2026-06-19T00:00:00.000Z",
      "keyType": "TIME"
    }
  }
}
```

---

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "novo_usuario",
  "password": "senha_segura",
  "email": "email@example.com",
  "appId": "uuid-do-app"
}
```

---

### Validate Session

```http
GET /api/auth/session
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "123e4567-e89b-12d3",
      "username": "usuario123",
      "expiresAt": "2026-06-19T00:00:00.000Z"
    },
    "sessionExpiresAt": "2026-01-20T12:00:00.000Z"
  }
}
```

---

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## Admin Endpoints

> All admin endpoints require `Authorization: Bearer <admin_token>`

### Admin Login

```http
POST /api/admin/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin_password"
}
```

---

### Generate Keys

```http
POST /api/keys/generate
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "appId": "uuid-do-app",
  "count": 10,
  "keyType": "TIME",
  "durationDays": 30,
  "maxActivations": 1,
  "note": "Lote de janeiro"
}
```

**Key Types:**
- `TIME` - Limited duration (requires `durationDays`)
- `LIFETIME` - Never expires
- `USES` - Limited uses (requires `maxUses`)

---

### List Keys

```http
GET /api/keys?appId=<uuid>&isActive=true&page=1&limit=50
Authorization: Bearer <admin_token>
```

---

### Toggle Key Status

```http
PUT /api/keys/:id/toggle
Authorization: Bearer <admin_token>
```

---

### Reset HWID

```http
POST /api/keys/:id/reset-hwid
Authorization: Bearer <admin_token>
```

---

### List Users

```http
GET /api/users?appId=<uuid>&search=query&page=1
Authorization: Bearer <admin_token>
```

---

### Ban/Unban User

```http
PUT /api/users/:id/ban
Authorization: Bearer <admin_token>
```

```json
{
  "reason": "Motivo do ban"
}
```

```http
PUT /api/users/:id/unban
Authorization: Bearer <admin_token>
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| General | 100 requests/minute |
| Authentication | 10 attempts/15 minutes |
| Key Generation | 20 requests/minute |

---

## HWID Format

The HWID should be a unique identifier for the client machine. Recommended format:

```
SHA256(CPU_ID + DISK_SERIAL + MAC_ADDRESS)
```

Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
