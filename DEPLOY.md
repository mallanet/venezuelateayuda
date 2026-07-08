# Despliegue en VPS Hostinger

Arquitectura **aislada**: cada proyecto tiene su propio Caddy, red Docker y Postgres. Un **edge HAProxy** en `vps_edge` publica `:80/:443` en la IP del VPS y enruta por dominio (SNI).

```
IP 2.25.77.231
    └── vps-edge-haproxy (:80/:443)
            ├── terremotoapp-caddy-1  → stack Terremoto (mapa_prod_net)
            └── venezuelateayuda-caddy-1 → stack VTA (vta_internal)
```

## VTA stack

- Red interna: `vta_internal` (app + db)
- Caddy propio: `venezuelateayuda-caddy-1` (sin puertos en el host)
- Postgres: `venezuelateayuda-db-1`

## Deploy

```bash
bash scripts/vps-deploy.sh          # incluye vps-setup-edge.sh
bash scripts/vps-setup-edge.sh      # solo edge + conexión de redes
```

Secrets en GitHub → ver tabla en sección anterior del doc o `.env.prod.example`.

## Verificación

```bash
curl -sI https://venezuelateayuda.org
curl -sI https://terremotovenezuela.app
docker ps --filter name=edge
```
