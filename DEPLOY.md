# Despliegue en VPS Hostinger

Stack en el VPS `2.25.77.231` (convive con Terremotoapp en `/opt/mallanet`). Caddy de Terremoto termina TLS; la app se une a la red `terremotoapp_mapa_prod_net`.

## Requisitos en el VPS

- Docker + Docker Compose
- GitHub Actions self-hosted runner (`github-runner`)
- Caddy de `terremotoapp` en puertos 80/443

## Secrets de GitHub (repo → Settings → Secrets)

| Secret | Descripción |
|--------|-------------|
| `VTA_POSTGRES_PASSWORD` | Clave Postgres producción |
| `VTA_AUTH_SECRET` | `openssl rand -hex 32` |
| `VTA_ADMIN_PASSWORD` | Clave del admin inicial |
| `VTA_ADMIN_EMAIL` | (opcional) default `admin@venezuelateayuda.org` |
| `VTA_EMAIL_FROM` | (opcional) default `no-reply@venezuelateayuda.org` |

## Primer despliegue

1. DNS: `venezuelateayuda.org` y `www` → `2.25.77.231`
2. Añade los secrets en GitHub
3. Push a `main` o ejecuta workflow **Deploy VPS** con `run_seed: true` (solo la primera vez)
4. Si Caddy no recarga solo, en el VPS:

```bash
cd /tmp/runner/work/venezuelateayuda/venezuelateayuda
cp .env.prod.example .env.prod   # o deja que el workflow lo genere
bash scripts/vps-bootstrap.sh
```

### Caddy de Terremoto

El Caddyfile principal debe importar sitios extra. Añade una sola vez en el VPS:

```
import /etc/caddy/sites/*
```

Monta `/docker/caddy/sites` en el contenedor Caddy, o copia `deploy/caddy/venezuelateayuda.caddy` manualmente.

## Despliegues siguientes

Cada push a `main` ejecuta `.github/workflows/deploy.yml` en el runner del VPS.

## Manual (sin CI)

```bash
cp .env.prod.example .env.prod
# editar secretos
RUN_SEED=true bash scripts/vps-deploy.sh
```

## Malladog (opcional)

Bot Discord MCP. Para añadirlo al mismo VPS:

```bash
cd /opt/malladog   # clonar repo
docker compose up -d
docker network connect edge discord-mcp
```

Añadir bloque Caddy apuntando a `discord-mcp:8085` si necesitas exposición HTTP.

## Verificación

```bash
curl -sI https://venezuelateayuda.org
docker compose -f docker-compose.prod.yml ps
docker logs venezuelateayuda-app-1 --tail 50
```
