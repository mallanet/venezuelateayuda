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

## Email de verificación

El registro envía el enlace por **Resend** o **SMTP Hostinger**.

### Opción A — Resend (recomendado)

1. Crea cuenta en https://resend.com y verifica el dominio `venezuelateayuda.org` (DNS SPF/DKIM).
2. Crea API key y configúrala:

```bash
gh secret set VTA_RESEND_API_KEY --repo mallanet/venezuelateayuda --body "re_..."
# o en el VPS:
# RESEND_API_KEY=re_... en /opt/venezuelateayuda/.env.prod
```

### Opción B — SMTP Hostinger

1. En hPanel → Emails → crea `no-reply@venezuelateayuda.org`.
2. Secrets:

```bash
gh secret set VTA_SMTP_HOST --repo mallanet/venezuelateayuda --body smtp.hostinger.com
gh secret set VTA_SMTP_PORT --repo mallanet/venezuelateayuda --body 465
gh secret set VTA_SMTP_USERNAME --repo mallanet/venezuelateayuda --body no-reply@venezuelateayuda.org
gh secret set VTA_SMTP_PASSWORD --repo mallanet/venezuelateayuda --body "..."
gh secret set VTA_SMTP_FROM --repo mallanet/venezuelateayuda --body "Venezuela Te Ayuda <no-reply@venezuelateayuda.org>"
```

Sin proveedor, el enlace solo aparece en logs de `venezuelateayuda-app-1`.

## Verificación

```bash
curl -sI https://venezuelateayuda.org
curl -sf https://venezuelateayuda.org/api/health
curl -sI https://venezuelateayuda.org/privacidad
curl -sI https://venezuelateayuda.org/terminos
docker logs venezuelateayuda-app-1 --tail 50 | grep -i email
```
