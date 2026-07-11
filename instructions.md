# ErrandHub — Deployment Guide

## Deploy to Ubuntu 24.04 VPS with Docker + Traefik

This guide walks you through deploying ErrandHub (React frontend + Laravel backend) using Docker Compose on a VPS running Ubuntu 24.04 LTS with an existing Traefik reverse proxy.

---

## Prerequisites

- Ubuntu 24.04 LTS VPS with root/sudo access
- Docker and Docker Compose v2 installed
- Traefik already running as a Docker container (e.g., for your `/opt/drivesolution` app)
- A domain name with DNS pointing to your VPS IP
- Git installed on the VPS
- GitHub account (for CI/CD)

---

## Part 1: Server Setup (One-Time)

### 1.1 — SSH into your VPS

```bash
ssh root@YOUR_VPS_IP
```

### 1.2 — Verify Docker and Traefik are running

```bash
docker --version          # Should show Docker 24+
docker compose version    # Should show Docker Compose v2
docker ps                 # Should show your Traefik container + drivesolution
```

Check that Traefik is on a shared Docker network (usually `traefik` or `traefik_web`):

```bash
docker network ls | grep traefik
```

> **Note the Traefik network name** — you'll need it in Step 1.5.

### 1.3 — Create the app directory

```bash
mkdir -p /opt/errandhub
cd /opt/errandhub
```

### 1.4 — Clone your repository

```bash
git clone https://github.com/kingwisdom/errandHub.git .
```

### 1.5 — Configure environment variables

```bash
cp .env.docker .env
nano .env
```

Fill in these values:

```bash
# App
APP_NAME=ErrandHub
APP_KEY=base64:GENERATED_KEY_HERE    # See Step 1.6
APP_URL=https://errandhub.drivesolution.cloud
FRONTEND_URL=https://errandhub.drivesolution.cloud
SESSION_DOMAIN=.drivesolution.cloud        # Note the dot prefix
SANCTUM_STATEFUL_DOMAINS=errandhub.drivesolution.cloud

# Domains
TRAEFIK_DOMAIN=errandhub.drivesolution.cloud
REVERB_DOMAIN=reverb.errourdomain.com

# Database — use a STRONG password
DB_DATABASE=errandhub
DB_USERNAME=errandhub
DB_PASSWORD=@@Eds56OP0.L090
DB_ROOT_PASSWORD=@@Eds56OP0.L090

# Reverb — generate with Step 1.7
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_APP_ID=
```

### 1.6 — Generate APP_KEY

```bash
docker run --rm -v /opt/errandhub/backend:/app -w /app composer:2 install --no-dev --no-interaction
docker run --rm -v /opt/errandhub/backend:/app -w /app php:8.2-cli php artisan key:generate --show
```

Copy the output and paste it into your `.env` as `APP_KEY=...`.

### 1.7 — Generate Reverb Keys

```bash
docker run --rm -v /opt/errandhub/backend:/app -w /app php:8.2-cli php artisan reverb:key --show
```

Copy the three values into your `.env`:

- `REVERB_APP_KEY=`
- `REVERB_APP_SECRET=`
- `REVERB_APP_ID=`

### 1.8 — Fix the docker-compose Traefik network name

Edit `docker-compose.yml` and update the external Traefik network name if it's different:

```yaml
networks:
  traefik:
    external: true
    name: traefik # ← Change this to match your actual Traefik network name
```

To find yours: `docker network ls`

---

## Part 2: DNS Configuration

### 2.1 — Add DNS records

In your domain registrar / DNS provider, create:

| Type | Name        | Value         | TTL |
| ---- | ----------- | ------------- | --- |
| A    | `errandhub` | `YOUR_VPS_IP` | 300 |
| A    | `reverb`    | `YOUR_VPS_IP` | 300 |

This gives you:

- `errandhub.yourdomain.com` → Frontend + API
- `reverb.yourdomain.com` → WebSocket server

### 2.2 — Verify DNS is propagating

```bash
dig +short errandhub.yourdomain.com
# Should return YOUR_VPS_IP
```

---

## Part 3: Build and Deploy

### 3.1 — First deployment

```bash
cd /opt/errandhub
chmod +x deploy.sh
./deploy.sh
```

This will:

1. Pull latest code from GitHub
2. Build Docker images (PHP-FPM backend, Node→Nginx frontend)
3. Start all 5 containers (frontend, backend, reverb, queue, mysql)
4. Wait for MySQL to be healthy
5. Run database migrations
6. Cache config and routes
7. Clean up old Docker images

### 3.2 — Verify everything is running

```bash
docker compose ps
```

Expected output:

```
NAME                   STATUS          PORTS
errandhub-backend      Up (healthy)
errandhub-frontend     Up
errandhub-mysql        Up (healthy)
errandhub-queue        Up
errandhub-reverb       Up
```

### 3.3 — Test the application

```bash
# Frontend
curl -I https://errandhub.yourdomain.com

# API
curl https://errandhub.yourdomain.com/api/categories

# Health check
curl https://errandhub.yourdomain.com/health
```

### 3.4 — Test WebSocket (Reverb)

Open browser DevTools → Network → WS tab, visit the app, and check for WebSocket connection to `wss://reverb.yourdomain.com`.

---

## Part 4: GitHub Actions CI/CD

### 4.1 — Push code to GitHub

```bash
cd /opt/errandhub
git remote add origin https://github.com/YOUR_USERNAME/ErrandHub.git
git add .
git commit -m "Initial deployment setup"
git push -u origin main
```

### 4.2 — Set GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions → New repository secret.

Add these secrets:

| Secret         | Value                     |
| -------------- | ------------------------- |
| `VPS_HOST`     | Your VPS IP address       |
| `VPS_USER`     | `root` (or your SSH user) |
| `VPS_PASSWORD` | Your SSH password         |
| `VPS_PORT`     | `22` (default)            |

### 4.3 — Push to deploy

Every push to `main` now auto-deploys:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

GitHub Actions will SSH into your VPS and run the deploy script automatically.

### 4.4 — Manual deploy (optional)

You can also trigger a deploy manually from GitHub:

GitHub repo → Actions → Deploy ErrandHub → Run workflow

---

## Part 5: Useful Commands

### Container management

```bash
# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f queue

# Restart a service
docker compose restart backend

# Stop everything
docker compose down

# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### Laravel artisan commands

```bash
# Run any artisan command
docker compose exec backend php artisan <command>

# Examples:
docker compose exec backend php artisan tinker
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:list
docker compose exec backend php artisan db:seed --force
```

### Database access

```bash
# MySQL shell
docker compose exec mysql mysql -u errandhub -p errandhub

# Backup database
docker compose exec mysql mysqldump -u root -p errandhub > backup_$(date +%Y%m%d).sql
```

### Update PHP/Node versions

Edit the `FROM` line in `backend/Dockerfile` or `frontend/Dockerfile`:

- Backend: `php:8.2-fpm-bookworm` → `php:8.3-fpm-bookworm`
- Frontend: `node:22-alpine` → `node:24-alpine`

Then rebuild: `docker compose build --no-cache && docker compose up -d`

---

## Part 6: Troubleshooting

### Container won't start

```bash
docker compose logs <container_name>
```

### MySQL "Access denied" error

The MySQL container needs time to initialize on first run. The backend entrypoint handles retries, but if it fails:

```bash
docker compose restart backend
docker compose logs backend
```

### "Traefik" network not found

```bash
docker network ls
```

Update the network name in `docker-compose.yml`:

```yaml
networks:
  traefik:
    external: true
    name: actual_network_name_here
```

### WebSocket not connecting

1. Verify Reverb is running: `docker compose logs reverb`
2. Check the `reverb.errandhub.example.com` DNS resolves
3. Ensure Traefik has the correct cert resolver name (check your existing Traefik config)
4. Check browser DevTools → Console for connection errors

### 502 Bad Gateway

The backend container is not healthy or not reachable:

```bash
docker compose ps
docker compose logs backend
```

Ensure Traefik can reach the backend container on its Docker network.

### SSL/TLS not working

Check that Traefik has a certificate resolver configured. The compose file uses `certresolver=letsencrypt`. If your Traefik uses a different resolver name, update the labels:

```yaml
labels:
  - "traefik.http.routers.errandhub-backend.tls.certresolver=your_resolver_name"
```

---

## Architecture Overview

```
Internet
  │
  ▼
Traefik (existing Docker container, TLS termination)
  │
  ├── Host(`errandhub.yourdomain.com`) && PathPrefix(`/api`)
  │     └── errandhub-backend (Nginx:9000 + PHP-FPM:9001)
  │           └── errandhub-mysql (MySQL 8.0, internal)
  │
  ├── Host(`errandhub.yourdomain.com`)
  │     └── errandhub-frontend (Nginx:8080, static React SPA)
  │
  └── Host(`reverb.yourdomain.com`)
        └── errandhub-reverb (Laravel Reverb WebSocket:8080)

errandhub-queue (background job worker, no Traefik labels)
```

### Container Details

| Container            | Image                      | Internal Port | Traefik | Purpose                        |
| -------------------- | -------------------------- | ------------- | ------- | ------------------------------ |
| `errandhub-frontend` | nginx:alpine + built React | 8080          | Yes     | Static SPA + serves index.html |
| `errandhub-backend`  | php:8.2-fpm + nginx        | 9000          | Yes     | Laravel API (`/api/*`)         |
| `errandhub-reverb`   | php:8.2-fpm                | 8080          | Yes     | WebSocket server               |
| `errandhub-queue`    | php:8.2-fpm                | none          | No      | `queue:work` background jobs   |
| `errandhub-mysql`    | mysql:8.0                  | 3306          | No      | Database (internal only)       |

---

## File Structure

```
ErrandHub/
├── docker-compose.yml          # 5 services: frontend, backend, reverb, queue, mysql
├── .env.docker                 # Environment template (copy to .env on server)
├── deploy.sh                   # Server-side deploy script
├── .dockerignore               # Root dockerignore
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD
├── backend/
│   ├── Dockerfile              # PHP-FPM + Nginx + Composer
│   ├── .dockerignore
│   └── docker/
│       ├── nginx.conf          # Backend Nginx config (FastCGI to php-fpm)
│       ├── php.ini             # PHP production settings
│       ├── supervisord.conf    # Runs both Nginx + PHP-FPM
│       └── entrypoint.sh       # Migrations, seeding, permissions
├── frontend/
│   ├── Dockerfile              # Multi-stage: Node 22 build → Nginx Alpine
│   ├── .dockerignore
│   └── nginx.conf              # SPA routing + security headers
└── instructions.md             # This file
```
