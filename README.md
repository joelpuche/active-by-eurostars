# ACTIVE by Eurostars · MVP

**Travel further. Play together.**

Web-app móvil (PWA) del proyecto *ACTIVE by Eurostars* para Grupo Hotusa · Talent Match.
Conecta a viajeros activos con comunidades, actividades y eventos deportivos locales en los destinos Eurostars.

👉 **App:** https://joelpuche.github.io/active-by-eurostars/
En iPhone: ábrela en Safari → Compartir → **Añadir a pantalla de inicio**.

## Qué incluye
- Cuentas con usuario y contraseña (sin email) y opción *Recordarme*. Progreso sincronizado en la nube.
- Explorar actividades (running, pádel, gym, eventos) en 8 ciudades Eurostars. Piloto: Madrid Tower y Torre Sevilla.
- Reserva de habitación + actividad en un paso, con **PDF de reserva** descargable.
- ACTIVE Pass con QR, check-in y validación con el partner → sello en el **Sport Passport** y subida de nivel.
- Comunidad (quedadas) y **Partners** (BamVolea, David Lloyd Clubs · acuerdos de ejemplo).
- Perfil con beneficios y enlace a **Star Traveler**.
- **Stella**, asistente IA (Gemini) que responde con la base de conocimiento oficial, busca eventos en internet, recomienda actividades y recoge propuestas.
- Bilingüe ES/EN y funciona sin conexión (salvo cuentas y Stella).

**Cuenta demo:** botón *Probar con la cuenta demo (Laura)* en la pantalla de inicio.

## Mantenimiento de Stella
La base de conocimiento es un PDF (`stella/base-conocimiento-stella.pdf`).
1. Edita el contenido (o `stella/build-kb.js` y ejecuta `node stella/build-kb.js` para regenerar el HTML; imprímelo a PDF).
2. Entra en la app con una cuenta de administrador → **Perfil → Panel del equipo → Subir nuevo PDF**.
3. Stella usa la nueva versión en unos minutos. En el mismo panel se ven las propuestas de la comunidad y las últimas preguntas.

## Tecnología
HTML/CSS/JS sin frameworks · Supabase (Auth, Postgres con RLS, Storage, Edge Functions) · Google Gemini (plan gratuito) · jsPDF.

## Aviso
MVP académico. Reservas y pagos **simulados**. Los acuerdos con partners son ejemplos ilustrativos. Fotografías de Unsplash (licencia Unsplash).

Equipo: Joan Mas · Joel Puche · Luca Bertuzzi · Alex Piquer · Pol Tristany
