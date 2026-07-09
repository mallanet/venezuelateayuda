export const metadata = {
  title: "Política de privacidad — Venezuela Te Ayuda",
};

export default function PrivacidadPage() {
  return (
    <article className="prose prose-slate prose-headings:text-[var(--mallanet-blue-900)] prose-a:text-[var(--mallanet-blue-700)] mx-auto w-full max-w-3xl px-5 py-16">
      <header className="not-prose mb-10 border-b border-border pb-8">
        <span className="kicker">Información legal</span>
        <h1 className="mt-3 font-heading text-4xl text-primary">Política de privacidad</h1>
        <p className="mt-3 text-sm text-muted-foreground">Última actualización: julio de 2026</p>
      </header>

      <h2>1. Datos que recopilamos</h2>
      <ul>
        <li><strong>Cuenta:</strong> email, contraseña (almacenada cifrada con hash), fecha de aceptación de términos.</li>
        <li><strong>Perfil:</strong> nombre, teléfono (opcional), estado y municipio, zona aproximada de acción.</li>
        <li><strong>Fichas:</strong> título, descripción, categoría y ubicación aproximada que tú eliges en el mapa.</li>
        <li><strong>Mensajes:</strong> el contenido del chat interno, para poder prestar el servicio y moderar denuncias.</li>
      </ul>

      <h2>2. Qué se muestra públicamente</h2>
      <p>
        Aplicamos minimización de datos: en el mapa y las fichas públicas solo
        se muestra tu <strong>nombre de pila</strong>, la categoría y una{" "}
        <strong>ubicación aproximada</strong> (nunca una dirección exacta). Tu
        email y tu teléfono nunca se muestran a otros usuarios; el primer
        contacto siempre ocurre por el chat interno.
      </p>

      <h2>3. Uso de los datos</h2>
      <p>
        Usamos tus datos exclusivamente para operar la plataforma: crear tu
        cuenta, mostrar tus fichas aprobadas, habilitar el chat y moderar la
        comunidad. No vendemos ni compartimos tus datos con terceros con fines
        comerciales.
      </p>

      <h2>4. Moderación</h2>
      <p>
        Nuestro equipo de moderación puede acceder a los datos de tu perfil,
        fichas y, en caso de denuncia, a las conversaciones implicadas, con el
        único fin de proteger a la comunidad. Toda acción de moderación queda
        registrada.
      </p>

      <h2>5. Conservación y eliminación</h2>
      <p>
        Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar
        la eliminación de tu cuenta y tus datos escribiendo a{" "}
        <a href="mailto:privacidad@mallanet.org">privacidad@mallanet.org</a>.
        Podemos conservar registros de moderación cuando exista una obligación
        legal o una disputa abierta.
      </p>

      <h2>6. Seguridad</h2>
      <p>
        Las contraseñas se almacenan con hash bcrypt, las comunicaciones viajan
        cifradas por HTTPS y el acceso administrativo está restringido y
        auditado.
      </p>

      <h2>7. Tus derechos</h2>
      <p>
        Puedes acceder, rectificar o eliminar tus datos desde tu perfil o
        escribiéndonos. También puedes retirar tu consentimiento eliminando tu
        cuenta en cualquier momento.
      </p>
    </article>
  );
}
