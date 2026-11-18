# ACTIVE by Eurostars · MVP

**Travel further. Play together.**

Web-app móvil (PWA) del proyecto *ACTIVE by Eurostars* para Grupo Hotusa · Talent Match.
Conecta a viajeros activos con comunidades, actividades y eventos deportivos locales en los destinos Eurostars.

👉 **App:** https://joelpuche.github.io/active-by-eurostars/
En iPhone: ábrela en Safari → Compartir → **Añadir a pantalla de inicio**.

## Qué incluye
- Cuentas con usuario y contraseña (sin email) y *Recordarme*. Al registrarte eliges **qué esperas de ACTIVE** y tus deportes: las recomendaciones (*Para ti*) se basan en ello.
- **3 tipos de evento** con su público:
  - **ACTIVE Local**: experiencias frecuentes organizadas por el hotel (running turístico, pádel social, gym pass en clubs premium).
  - **Race Weekend**: el hotel se prepara para la maratón o el gran evento de la ciudad, con **extras solo en reserva directa** (shakeout, desayuno de carga, late check-out, descarga muscular…).
  - **ACTIVE Tour**: circuito de Grupo Hotusa con una parada por ciudad, ranking y Master Final.
- **Precios por nivel**: no todo es gratis; p. ej. el gym pass en club privado cuesta 18 € y es gratis desde Challenger.
- Reserva con **fotos reales de la habitación** (eurostarshotels.com) y **PDF de reserva** con vista previa.
- ACTIVE Pass con QR → sello en el **Sport Passport** y subida de nivel.
- **Muro de cada evento en tiempo real**: ve quién va y habla con el grupo.
- **Partners** (BamVolea, David Lloyd, Holmes Place, Playtomic, Strava, Decathlon, HYROX, ASICS · acuerdos de ejemplo) en carrusel.
- **Programa Embajador** y botón **Colabora con ACTIVE** para marcas, clubs y organizadores (nuevas fuentes de ingresos).
- Perfil con beneficios y enlace a **Star Traveler**.
- **Stella**, asistente IA (Gemini) con la base de conocimiento oficial, búsqueda web, recomendaciones y recogida de propuestas.
- Bilingüe ES/EN y funciona sin conexión (salvo cuentas, muro y Stella).

**Cuenta demo:** botón *Probar con la cuenta demo (Laura)* en la pantalla de inicio.

## Mantenimiento de Stella
La base de conocimiento es un PDF (`stella/base-conocimiento-stella.pdf`).
1. Edita el contenido (o `stella/build-kb.js` y ejecuta `node stella/build-kb.js` para regenerar el HTML; imprímelo a PDF).
2. Entra en la app con una cuenta de administrador → **Perfil → Panel del equipo → Subir nuevo PDF**.
3. Stella usa la nueva versión en unos minutos. En el mismo panel se ven las propuestas de la comunidad y las últimas preguntas.

## Tecnología
HTML/CSS/JS sin frameworks · Supabase (Auth, Postgres con RLS, Storage, Edge Functions) · Google Gemini (plan gratuito) · jsPDF.

## Aviso
MVP académico. Reservas y pagos **simulados**. Los acuerdos con partners son ejemplos ilustrativos. Fotografías de Unsplash (licencia Unsplash) y de habitaciones de eurostarshotels.com. Logotipos de partners propiedad de sus marcas, usados como ejemplo académico.

Equipo: Joan Mas · Joel Puche · Luca Bertuzzi · Alex Piquer · Pol Tristany
