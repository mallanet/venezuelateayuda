import {
  PrismaClient,
  type Category,
  type HelpModality,
  type ListingType,
  type QuantityUnit,
  type Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { ABROAD_STATE, abroadMapPosition } from "../src/lib/abroad";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo-vta-2026";
const DEMO_MARKER_EMAIL = "demo-seed@venezuelateayuda.org";

function avatarUrl(displayName: string): string {
  const name = encodeURIComponent(displayName.trim() || "Usuario");
  return `https://ui-avatars.com/api/?name=${name}&background=0d9488&color=fff&size=256&bold=true`;
}

interface DemoListing {
  email: string;
  displayName: string;
  role: Role;
  bio: string;
  state: string;
  municipality: string;
  lat: number;
  lng: number;
  categories: Category[];
  type: ListingType;
  category: Category;
  title: string;
  description: string;
  quantity: number;
  quantityUnit: QuantityUnit;
  modality: HelpModality;
}

const DEMO_LISTINGS: DemoListing[] = [
  {
    email: "demo-alimentos@venezuelateayuda.org",
    displayName: "Carla Mendoza",
    role: "AYUDANTE",
    bio: "Organizo mercados solidarios con productos frescos para familias de la zona.",
    state: "Miranda",
    municipality: "Chacao",
    lat: 10.496,
    lng: -66.853,
    categories: ["ALIMENTOS"],
    type: "OFREZCO",
    category: "ALIMENTOS",
    title: "Mercado solidario semanal",
    description:
      "Comparto canasta con arroz, legumbres, verduras y proteína para una familia de hasta cuatro personas cada sábado en Chacao.",
    quantity: 1,
    quantityUnit: "KIT",
    modality: "PRESENCIAL",
  },
  {
    email: "demo-medicinas@venezuelateayuda.org",
    displayName: "Dr. Rafael Insua",
    role: "AYUDANTE",
    bio: "Médico general; coordino donaciones de medicamentos de uso continuo.",
    state: "Carabobo",
    municipality: "Valencia",
    lat: 10.18,
    lng: -68.0,
    categories: ["MEDICINAS"],
    type: "OFREZCO",
    category: "MEDICINAS",
    title: "Donación de medicamentos crónicos",
    description:
      "Puedo facilitar insulina glargina y metformina (con receta vigente) para una persona en Valencia que no tenga acceso inmediato.",
    quantity: 1,
    quantityUnit: "PERSONA",
    modality: "PRESENCIAL",
  },
  {
    email: "demo-transporte@venezuelateayuda.org",
    displayName: "Luis Herrera",
    role: "AYUDANTE",
    bio: "Conductor con vehículo propio; apoyo traslados solidarios en Caracas.",
    state: "Distrito Capital",
    municipality: "Libertador",
    lat: 10.48,
    lng: -66.91,
    categories: ["TRANSPORTE"],
    type: "OFREZCO",
    category: "TRANSPORTE",
    title: "Traslado solidario a citas médicas",
    description:
      "Ofrezco dos viajes al mes desde Petare hasta centros de salud en el centro de Caracas, preferiblemente martes y jueves por la mañana.",
    quantity: 2,
    quantityUnit: "UNIDAD",
    modality: "PRESENCIAL",
  },
  {
    email: "demo-alojamiento@venezuelateayuda.org",
    displayName: "María Elena Ruiz",
    role: "SOLICITANTE",
    bio: "Madre de dos hijos; busco apoyo temporal mientras estabilizo vivienda.",
    state: "Zulia",
    municipality: "Maracaibo",
    lat: 10.65,
    lng: -71.65,
    categories: ["ALOJAMIENTO"],
    type: "NECESITO",
    category: "ALOJAMIENTO",
    title: "Refugio temporal para familia",
    description:
      "Necesitamos alojamiento por 2–3 semanas en Maracaibo mientras cerramos trámite de alquiler. Somos tres personas, sin mascotas.",
    quantity: 1,
    quantityUnit: "FAMILIA",
    modality: "PRESENCIAL",
  },
  {
    email: "demo-educacion@venezuelateayuda.org",
    displayName: "Prof. Gabriela León",
    role: "AYUDANTE",
    bio: "Docente de secundaria; doy clases de refuerzo gratuitas dos tardes por semana.",
    state: "Mérida",
    municipality: "Libertador",
    lat: 8.59,
    lng: -71.14,
    categories: ["EDUCACION"],
    type: "OFREZCO",
    category: "EDUCACION",
    title: "Clases de matemáticas y física",
    description:
      "Ofrezco refuerzo escolar para estudiantes de 3er a 5to año en Mérida capital, presencial o por videollamada los miércoles y viernes.",
    quantity: 2,
    quantityUnit: "HORA",
    modality: "ONLINE",
  },
  {
    email: "demo-empleo@venezuelateayuda.org",
    displayName: "Ana Victoria Briceño",
    role: "AYUDANTE",
    bio: "Consultora de RR.HH. voluntaria; ayudo con CV y entrevistas.",
    state: "Lara",
    municipality: "Iribarren",
    lat: 10.07,
    lng: -69.32,
    categories: ["EMPLEO"],
    type: "OFREZCO",
    category: "EMPLEO",
    title: "Orientación laboral y revisión de CV",
    description:
      "Reviso currículum, simulo entrevistas y comparto vacantes verificadas en Barquisimeto para jóvenes recién egresados.",
    quantity: 3,
    quantityUnit: "SESION",
    modality: "ONLINE",
  },
  {
    email: "demo-otro@venezuelateayuda.org",
    displayName: "Pedro Salazar",
    role: "SOLICITANTE",
    bio: "Vecino de la urbanización; busco apoyo con reparaciones menores en el hogar.",
    state: "Anzoátegui",
    municipality: "Simón Bolívar",
    lat: 10.13,
    lng: -64.68,
    categories: ["OTRO"],
    type: "NECESITO",
    category: "OTRO",
    title: "Ayuda para reparar calefón",
    description:
      "Necesito quien pueda revisar o donar repuesto para calefón eléctrico en Barcelona. La familia lleva una semana sin agua caliente.",
    quantity: 1,
    quantityUnit: "UNIDAD",
    modality: "PRESENCIAL",
  },
  {
    email: "demo-alimentos-2@venezuelateayuda.org",
    displayName: "José Ramírez",
    role: "SOLICITANTE",
    bio: "Adulto mayor viviendo solo en Valencia.",
    state: "Carabobo",
    municipality: "Naguanagua",
    lat: 10.24,
    lng: -68.01,
    categories: ["ALIMENTOS"],
    type: "NECESITO",
    category: "ALIMENTOS",
    title: "Canasta básica para adulto mayor",
    description:
      "Solicito apoyo con alimentos no perecederos para esta quincena. Puedo retirar en punto de encuentro en Naguanagua.",
    quantity: 1,
    quantityUnit: "KIT",
    modality: "PRESENCIAL",
  },
  {
    email: "demo-medicinas-2@venezuelateayuda.org",
    displayName: "Lucía Paredes",
    role: "SOLICITANTE",
    bio: "Cuidadora familiar en San Cristóbal.",
    state: "Táchira",
    municipality: "San Cristóbal",
    lat: 7.77,
    lng: -72.22,
    categories: ["MEDICINAS"],
    type: "NECESITO",
    category: "MEDICINAS",
    title: "Antihipertensivos para familiar",
    description:
      "Necesito losartán 50 mg para mi madre de 72 años. Tenemos receta médica y podemos cubrir parte del costo si es necesario.",
    quantity: 1,
    quantityUnit: "PERSONA",
    modality: "PRESENCIAL",
  },
  {
    email: "demo-transporte-2@venezuelateayuda.org",
    displayName: "Familia Oropeza",
    role: "SOLICITANTE",
    bio: "Familia en Puerto La Cruz con traslados limitados.",
    state: "Anzoátegui",
    municipality: "Sotillo",
    lat: 10.21,
    lng: -64.63,
    categories: ["TRANSPORTE"],
    type: "NECESITO",
    category: "TRANSPORTE",
    title: "Traslado a quimioterapia",
    description:
      "Necesitamos transporte los lunes desde Puerto La Cruz hasta Barcelona para sesiones de quimioterapia, horario 7:00 am.",
    quantity: 4,
    quantityUnit: "HORA",
    modality: "PRESENCIAL",
  },
];

const DEMO_ABROAD_ONLINE: DemoListing[] = [
  {
    email: "demo-online-miami@venezuelateayuda.org",
    displayName: "Andrea Vásquez",
    role: "AYUDANTE",
    bio: "Psicóloga venezolana en Miami; ofrezco contención emocional por videollamada.",
    state: ABROAD_STATE,
    municipality: "Miami, EE.UU.",
    lat: 0,
    lng: 0,
    categories: ["OTRO"],
    type: "OFREZCO",
    category: "OTRO",
    title: "Contención emocional online",
    description:
      "Sesiones gratuitas de 45 minutos para personas en Venezuela que necesiten hablar y organizar ideas. Horario EST, fines de semana.",
    quantity: 2,
    quantityUnit: "SESION",
    modality: "ONLINE",
  },
  {
    email: "demo-online-madrid@venezuelateayuda.org",
    displayName: "Carlos Ibáñez",
    role: "AYUDANTE",
    bio: "Desarrollador en Madrid; ayudo con CV tech y entrevistas remotas.",
    state: ABROAD_STATE,
    municipality: "Madrid, España",
    lat: 0,
    lng: 0,
    categories: ["EMPLEO"],
    type: "OFREZCO",
    category: "EMPLEO",
    title: "Mentoría laboral tech online",
    description:
      "Revisión de CV, perfil de LinkedIn y simulación de entrevistas para roles de desarrollo y soporte IT.",
    quantity: 3,
    quantityUnit: "SESION",
    modality: "ONLINE",
  },
  {
    email: "demo-online-bogota@venezuelateayuda.org",
    displayName: "Dra. Patricia Mora",
    role: "AYUDANTE",
    bio: "Médica general en Bogotá; orientación de primeros auxilios y derivación.",
    state: ABROAD_STATE,
    municipality: "Bogotá, Colombia",
    lat: 0,
    lng: 0,
    categories: ["MEDICINAS"],
    type: "OFREZCO",
    category: "MEDICINAS",
    title: "Orientación médica por videollamada",
    description:
      "Consulta breve para evaluar síntomas, explicar tratamientos y sugerir cuándo acudir a un centro de salud en Venezuela.",
    quantity: 1,
    quantityUnit: "PERSONA",
    modality: "ONLINE",
  },
  {
    email: "demo-online-panama@venezuelateayuda.org",
    displayName: "Luisana Pérez",
    role: "AYUDANTE",
    bio: "Docente en Panamá; clases de refuerzo de primaria por Zoom.",
    state: ABROAD_STATE,
    municipality: "Ciudad de Panamá",
    lat: 0,
    lng: 0,
    categories: ["EDUCACION"],
    type: "OFREZCO",
    category: "EDUCACION",
    title: "Clases de matemáticas online",
    description:
      "Refuerzo para estudiantes de 4to a 6to grado, dos sesiones semanales por videollamada en horario vespertino.",
    quantity: 2,
    quantityUnit: "HORA",
    modality: "ONLINE",
  },
];

/** Voluntarios y aliados reales (no demo). */
const REAL_VOLUNTEERS: DemoListing[] = [
  {
    email: "calma-universidadcontinental@venezuelateayuda.org",
    displayName: "Calma (Universidad Continental)",
    role: "AYUDANTE",
    bio: "Programa social de la Facultad de Psicología de la Universidad Continental. Primeros auxilios psicológicos en línea para personas de Venezuela y sus familiares.",
    state: ABROAD_STATE,
    municipality: "Lima, Perú",
    lat: 0,
    lng: 0,
    categories: ["OTRO"],
    type: "OFREZCO",
    category: "OTRO",
    title: "Calma - Primeros auxilios psicológicos en línea",
    description:
      "Apoyo psicológico gratuito en línea. Calma ofrece escucha, contención y orientación inicial para personas de Venezuela y sus familiares que atraviesan emergencias o crisis emocionales.\n\n" +
      "Programa social de la Facultad de Psicología de la Universidad Continental. Equipo de voluntarios (docentes, egresados y estudiantes de últimos ciclos) con enfoque de atención a la diversidad.\n\n" +
      "Solicita tu cita en: https://ucontinental.edu.pe/calma-cita/\n\n" +
      "El formulario también está disponible en inglés, alemán, portugués, francés, quechua e italiano en el mismo enlace.",
    quantity: 1,
    quantityUnit: "SESION",
    modality: "ONLINE",
  },
];

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@mallanet.org").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to create/update the admin user");
  }
  // Guard against truncated env values (e.g. unquoted ';' in .env).
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD looks truncated; quote it in .env.prod");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        passwordHash,
        role: "ADMIN",
        status: "APROBADO",
        emailVerified: existing.emailVerified ?? new Date(),
      },
    });
    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) throw new Error("Admin password hash self-check failed");
    console.log(`Admin password refreshed for ${email} (len=${password.length})`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "APROBADO",
      emailVerified: new Date(),
      termsAcceptedAt: new Date(),
      profile: {
        create: {
          displayName: "Equipo Mallanet",
          avatarUrl: avatarUrl("Equipo Mallanet"),
          state: "Distrito Capital",
          municipality: "Libertador",
        },
      },
    },
  });
  console.log(`Admin created for ${email} (len=${password.length})`);
}

async function seedDemoListings() {
  const marker = await prisma.user.findUnique({ where: { email: DEMO_MARKER_EMAIL } });
  if (marker) {
    console.log("Los ejemplos demo ya existen, omitiendo seed de fichas.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const demo of DEMO_LISTINGS) {
    const user = await prisma.user.create({
      data: {
        email: demo.email,
        passwordHash,
        role: demo.role,
        status: "APROBADO",
        emailVerified: new Date(),
        termsAcceptedAt: new Date(),
        profile: {
          create: {
            displayName: demo.displayName,
            avatarUrl: avatarUrl(demo.displayName),
            bio: demo.bio,
            state: demo.state,
            municipality: demo.municipality,
            lat: demo.lat,
            lng: demo.lng,
            categories: demo.categories,
          },
        },
        listings: {
          create: {
            type: demo.type,
            title: demo.title,
            description: demo.description,
            category: demo.category,
            state: demo.state,
            municipality: demo.municipality,
            lat: demo.lat,
            lng: demo.lng,
            status: "APROBADA",
            quantity: demo.quantity,
            quantityUnit: demo.quantityUnit,
            modality: demo.modality,
          },
        },
      },
    });
    console.log(`Demo: ${demo.category} — ${demo.title} (${user.email})`);
  }

  await prisma.user.create({
    data: {
      email: DEMO_MARKER_EMAIL,
      passwordHash,
      role: "ADMIN",
      status: "APROBADO",
      emailVerified: new Date(),
      termsAcceptedAt: new Date(),
    },
  });

  console.log(`\n${DEMO_LISTINGS.length} fichas demo creadas (todas APROBADA).`);
  console.log(`Contraseña demo: ${DEMO_PASSWORD}`);
}

/** Actualiza cantidad y modalidad en fichas demo ya existentes. */
async function syncDemoListingMeta() {
  let updated = 0;
  for (const demo of [...DEMO_LISTINGS, ...DEMO_ABROAD_ONLINE]) {
    const result = await prisma.helpListing.updateMany({
      where: { user: { email: demo.email } },
      data: {
        quantity: demo.quantity,
        quantityUnit: demo.quantityUnit,
        modality: demo.modality,
      },
    });
    updated += result.count;
  }
  if (updated > 0) {
    console.log(`Meta de ayuda actualizada en ${updated} fichas demo.`);
  }
}

async function seedAbroadOnlineHelpers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  let created = 0;

  for (const demo of DEMO_ABROAD_ONLINE) {
    const existing = await prisma.user.findUnique({ where: { email: demo.email } });
    if (existing) continue;

    const { lat, lng } = abroadMapPosition(demo.email);
    await prisma.user.create({
      data: {
        email: demo.email,
        passwordHash,
        role: demo.role,
        status: "APROBADO",
        emailVerified: new Date(),
        termsAcceptedAt: new Date(),
        profile: {
          create: {
            displayName: demo.displayName,
            avatarUrl: avatarUrl(demo.displayName),
            bio: demo.bio,
            state: demo.state,
            municipality: demo.municipality,
            lat,
            lng,
            categories: demo.categories,
          },
        },
        listings: {
          create: {
            type: demo.type,
            title: demo.title,
            description: demo.description,
            category: demo.category,
            state: demo.state,
            municipality: demo.municipality,
            lat,
            lng,
            status: "APROBADA",
            quantity: demo.quantity,
            quantityUnit: demo.quantityUnit,
            modality: demo.modality,
          },
        },
      },
    });
    created++;
    console.log(`Demo online: ${demo.displayName} — ${demo.title}`);
  }

  if (created > 0) {
    console.log(`${created} ayudantes online desde el exterior creados.`);
  } else {
    console.log("Los ayudantes online demo ya existen.");
  }
}

async function seedRealVolunteers() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  let created = 0;

  for (const volunteer of REAL_VOLUNTEERS) {
    const existing = await prisma.user.findUnique({ where: { email: volunteer.email } });
    if (existing) continue;

    const { lat, lng } = abroadMapPosition(volunteer.email);
    await prisma.user.create({
      data: {
        email: volunteer.email,
        passwordHash,
        role: volunteer.role,
        status: "APROBADO",
        emailVerified: new Date(),
        termsAcceptedAt: new Date(),
        profile: {
          create: {
            displayName: volunteer.displayName,
            avatarUrl: avatarUrl(volunteer.displayName),
            bio: volunteer.bio,
            state: volunteer.state,
            municipality: volunteer.municipality,
            lat,
            lng,
            categories: volunteer.categories,
          },
        },
        listings: {
          create: {
            type: volunteer.type,
            title: volunteer.title,
            description: volunteer.description,
            category: volunteer.category,
            state: volunteer.state,
            municipality: volunteer.municipality,
            lat,
            lng,
            status: "APROBADA",
            quantity: volunteer.quantity,
            quantityUnit: volunteer.quantityUnit,
            modality: volunteer.modality,
          },
        },
      },
    });
    created++;
    console.log(`Voluntario real: ${volunteer.displayName} — ${volunteer.title}`);
  }

  if (created > 0) {
    console.log(`${created} voluntario(s) real(es) creado(s).`);
  } else {
    console.log("Los voluntarios reales ya existen.");
  }
}

async function main() {
  await ensureAdmin();
  if (process.env.SEED_DEMOS === "true") {
    await seedDemoListings();
    await seedAbroadOnlineHelpers();
    await syncDemoListingMeta();
  }
  await seedRealVolunteers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
