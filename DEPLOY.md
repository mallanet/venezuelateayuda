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

El deploy es manual desde una sesión Tailscale; GitHub Actions no ejecuta código
ni operaciones dentro del VPS.

```bash
bash scripts/vps-deploy.sh          # incluye vps-setup-edge.sh
bash scripts/vps-setup-edge.sh      # solo edge + conexión de redes
```

## Email de verificación

Remitente canónico: **`@mallanet.org`** (dominio verificado en Resend).
El registro envía el enlace por **Resend** o **SMTP Hostinger**.

### Opción A — Resend (recomendado)

1. Dominio `mallanet.org` verificado en https://resend.com (DNS SPF/DKIM).
2. Crea API key y configúrala:

Guardar `RESEND_API_KEY` y `EMAIL_FROM` únicamente en
`/opt/venezuelateayuda/.env.prod`, con propietario `root:root` y modo `0600`.

### Opción B — SMTP Hostinger

1. En hPanel → Emails → crea `no-reply@mallanet.org`.
2. Guardar `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` y
   `SMTP_FROM` en `/opt/venezuelateayuda/.env.prod`, nunca en GitHub.

Sin proveedor, el enlace solo aparece en logs de `venezuelateayuda-app-1`.

## Verificación

```bash
curl -sI https://venezuelateayuda.org
curl -sf https://venezuelateayuda.org/api/health
curl -sI https://venezuelateayuda.org/privacidad
curl -sI https://venezuelateayuda.org/terminos
docker logs venezuelateayuda-app-1 --tail 50 | grep -i email
```
## Automatización VPS retirada

El preview `vta-preview` fue retirado porque usaba `hostNetwork`. También se
retiraron los workflows self-hosted de deploy, bootstrap, backfill, diagnóstico,
reparación SSH y operaciones puntuales: todos heredaban control root efectivo
mediante el socket Docker. La aplicación pública continúa en Compose.

No se debe registrar otro runner persistente en este host. Las operaciones se
hacen manualmente por Tailscale y cualquier CI futuro debe usar runners hospedados
sin secretos ni acceso a producción.
