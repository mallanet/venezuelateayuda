/**
 * Reasigna lat/lng de perfiles y fichas al municipio (o centro de estado).
 * Uso: npx tsx scripts/backfill-zone-coords.ts
 * Solo toca filas locales (no "En el exterior").
 */
import { PrismaClient } from "@prisma/client";
import { ABROAD_STATE } from "../src/lib/abroad";
import { getZoneCoords } from "../src/lib/venezuela";

const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany({
    where: { state: { not: ABROAD_STATE } },
    select: { userId: true, state: true, municipality: true, lat: true, lng: true },
  });

  let profilesUpdated = 0;
  for (const p of profiles) {
    const coords = getZoneCoords(p.state, p.municipality, p.userId);
    if (!coords) continue;
    if (p.lat === coords.lat && p.lng === coords.lng) continue;
    await prisma.profile.update({
      where: { userId: p.userId },
      data: { lat: coords.lat, lng: coords.lng },
    });
    profilesUpdated++;
  }

  const listings = await prisma.helpListing.findMany({
    where: { state: { not: ABROAD_STATE } },
    select: { id: true, state: true, municipality: true, lat: true, lng: true, userId: true },
  });

  let listingsUpdated = 0;
  for (const l of listings) {
    const coords = getZoneCoords(l.state, l.municipality, l.userId);
    if (!coords) continue;
    // Solo corrige pins que siguen en el centro del estado (sin ajuste manual).
    const stateCenter = getZoneCoords(l.state);
    if (!stateCenter) continue;
    const onStateCenter =
      Math.abs(l.lat - stateCenter.lat) < 0.0001 && Math.abs(l.lng - stateCenter.lng) < 0.0001;
    if (!onStateCenter) continue;
    if (l.lat === coords.lat && l.lng === coords.lng) continue;
    await prisma.helpListing.update({
      where: { id: l.id },
      data: { lat: coords.lat, lng: coords.lng },
    });
    listingsUpdated++;
  }

  console.log(`profiles updated: ${profilesUpdated}`);
  console.log(`listings updated: ${listingsUpdated}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
