# Despliegue en VPS Hostinger

Stack en el VPS `2.25.77.231` (convive con Terremotoapp en `/opt/mallanet`). Caddy de Terremoto termina TLS; la app se une a la red `terremotoapp_mapa_prod_net`.

## Postgres en el VPS

La base de datos corre **dentro del VPS** como contenedor Docker (`venezuelateayuda-db-1`, Postgres 16). Los datos persisten en el volumen `venezuelateayuda_pgdata`.

```bash
docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda
docker volume inspect venezuelateayuda_pgdata
```

No usa Neon ni Vercel Postgres. `DATABASE_URL` apunta a `db:5432` en la red interna de Compose.

## Requisitos en el VPS

- Docker + Docker Compose
- GitHub Actions self-hosted runner (`github-runner-vta`)
- Caddy persistente en `/docker/caddy/` (compartido con Terremoto)

## Secrets de GitHub (repo → Settings → Secrets)

| Secret | Descripción |
|--------|-------------|
| `VTA_POSTGRES_PASSWORD` | Clave Postgres producción |
| `VTA_AUTH_SECRET` | `openssl rand -hex 32` |
| `VTA_ADMIN_PASSWORD` | Clave del admin inicial |
| `VTA_ADMIN_EMAIL` | (opcional) default `admin@venezuelateayuda.org` |
| `VTA_EMAIL_FROM` | (opcional) default `no-reply@venezuelateayuda.org` |

Sincronizar desde el VPS:

```bash
bash scripts/sync-github-secrets.sh
```

## Primer despliegue

1. DNS: `venezuelateayuda.org` y `www` → `2.25.77.231`
2. Añade los secrets en GitHub (o `sync-github-secrets.sh`)
3. Push a `main` o ejecuta workflow **Deploy VPS** con `run_seed: true` (solo la primera vez)

### Caddy persistente

El bloque de `venezuelateayuda.org` vive en `/docker/caddy/Caddyfile.prod`. Para aplicar cambios:

```bash
bash scripts/vps-bootstrap.sh   # actualiza Caddyfile + rebuild imagen
```

## Despliegues siguientes

Cada push a `main` ejecuta `.github/workflows/deploy.yml` en el runner del VPS.

## Manual (sin CI)

```bash
cp .env.prod.example .env.prod
# editar secretos
RUN_SEED=true bash scripts/vps-deploy.sh
```

## Verificación

```bash
curl -sI https://venezuelateayuda.org
docker compose -f docker-compose.prod.yml ps
docker logs venezuelateayuda-app-1 --tail 50
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda -c '\dt'
```
