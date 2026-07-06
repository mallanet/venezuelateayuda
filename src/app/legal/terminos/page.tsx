export const metadata = {
  title: "Términos de uso — Venezuela Te Ayuda",
};

export default function TerminosPage() {
  return (
    <article className="prose prose-neutral mx-auto w-full max-w-3xl px-4 py-12 dark:prose-invert">
      <h1>Términos de uso</h1>
      <p>Última actualización: julio de 2026</p>

      <h2>1. Qué es Venezuela Te Ayuda</h2>
      <p>
        Venezuela Te Ayuda es una plataforma comunitaria sin fines de lucro que
        conecta a personas que ofrecen ayuda con personas que la necesitan.
        La plataforma actúa únicamente como punto de encuentro: <strong>no
        somos parte de los acuerdos entre usuarios, no garantizamos las ayudas
        ofrecidas ni verificamos la veracidad total de cada publicación</strong>,
        aunque aplicamos moderación manual a todos los perfiles y fichas.
      </p>

      <h2>2. Registro y verificación</h2>
      <p>
        Para publicar fichas o contactar a otras personas debes crear una
        cuenta, verificar tu email y esperar la aprobación manual de nuestro
        equipo de moderación. Nos reservamos el derecho de rechazar o suspender
        cuentas que incumplan estos términos o representen un riesgo para la
        comunidad.
      </p>

      <h2>3. Normas de la comunidad</h2>
      <ul>
        <li>Publica solo información veraz y de buena fe.</li>
        <li>No publiques direcciones exactas ni datos personales sensibles.</li>
        <li>Está prohibido cualquier uso comercial, fraudulento o de explotación.</li>
        <li>Está prohibido solicitar dinero por adelantado o datos bancarios.</li>
        <li>Trata a las demás personas con respeto en el chat interno.</li>
      </ul>

      <h2>4. Responsabilidad</h2>
      <p>
        Cada usuario es responsable de sus interacciones. Recomendamos
        encontrarse en lugares públicos, no compartir información financiera y
        denunciar cualquier conducta sospechosa mediante el botón «Denunciar».
        En la máxima medida permitida por la ley aplicable, la plataforma no
        será responsable de daños derivados de los acuerdos entre usuarios.
      </p>

      <h2>5. Moderación y suspensión</h2>
      <p>
        Todas las publicaciones pasan por revisión manual antes de aparecer en
        el mapa. Podemos retirar contenido, rechazar fichas o suspender cuentas
        cuando existan denuncias fundadas o incumplimiento de estas normas. Las
        acciones de moderación quedan registradas con fines de trazabilidad.
      </p>

      <h2>6. Cambios</h2>
      <p>
        Podemos actualizar estos términos. Notificaremos los cambios relevantes
        a través de la plataforma. El uso continuado implica la aceptación de
        la versión vigente.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Para consultas legales o de moderación, escribe a{" "}
        <a href="mailto:legal@venezuelateayuda.org">legal@venezuelateayuda.org</a>.
      </p>
    </article>
  );
}
