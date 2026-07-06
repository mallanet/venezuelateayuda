import {
  PrismaClient,
  type Category,
  type HelpModality,
  type ListingType,
  type QuantityUnit,
  type Role,
} from "@prisma/client";
import bcrypt from "bcryptjs";

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

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@venezuelateayuda.org";
  const password = process.env.ADMIN_PASSWORD ?? "admin-vta-2026";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} ya existe.`);
    return;
  }

  await prisma.user.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "ADMIN",
      status: "APROBADO",
      emailVerified: new Date(),
      termsAcceptedAt: new Date(),
      profile: {
        create: {
          displayName: "Equipo de Moderación",
          avatarUrl: avatarUrl("Equipo VTA"),
          state: "Distrito Capital",
          municipality: "Libertador",
        },
      },
    },
  });
  console.log(`Admin creado: ${email}`);
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
  for (const demo of DEMO_LISTINGS) {
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

async function main() {
  await ensureAdmin();
  await seedDemoListings();
  await syncDemoListingMeta();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
