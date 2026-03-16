# JS Playground

A JavaScript playground with authentication, file storage, and server-side code execution.

## Setup

**Frontend:**
```bash
npm install
npm run dev
```

**Backend** (in another terminal):
```bash
cd backend
go run main.go
```

The frontend proxies `/api` to `http://localhost:3000` in dev mode.

## Docker

**Development** (без SSL, прямой доступ по порту):
```bash
docker compose up --build
```

Open http://localhost:8081

**Production** (Caddy + SSL для design-x-dev.online):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Перед запуском:
1. Настройте DNS: `design-x-dev.online` → IP сервера
2. Убедитесь, что порты 80 и 443 открыты
3. Caddy автоматически получит SSL-сертификат от Let's Encrypt

## Roles

- **admin** — видит и управляет всеми файлами (list, get, update, delete любые)
- **student** — только свои файлы

Роль admin назначается при регистрации: если email совпадает с `ADMIN_EMAIL`, пользователь получает роль admin.

Скопируйте `.env.example` в `.env` и настройте:

```bash
cp .env.example .env
```

В `.env`:
- `ADMIN_EMAIL` — email админа
- `ADMIN_PASSWORD` — пароль админа (создаётся при первом запуске, если пользователя нет)
- `JWT_SECRET` — секрет для JWT (обязательно сменить в production)

Docker Compose автоматически подхватывает `.env`. При локальном запуске бекенд загружает `.env` из корня проекта.

## Features

- JWT authentication (register/login)
- Per-user file storage (create, save, delete files)
- Monaco Editor with JavaScript syntax highlighting
- Server-side code execution via goja (Go)
- Console output from `console.log`, `console.error`, `console.warn` for isolation
