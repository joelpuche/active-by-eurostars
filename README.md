# ACTIVE by Eurostars · MVP

**Travel further. Play together.**

Web-app móvil (PWA) del proyecto *ACTIVE by Eurostars* para Grupo Hotusa · Talent Match.
Conecta a viajeros activos con comunidades, actividades y eventos deportivos locales en los destinos Eurostars.

👉 **App:** https://joelpuche.github.io/active-by-eurostars/
En iPhone: ábrela en Safari → Compartir → **Añadir a pantalla de inicio**.

## Qué incluye
- Cuentas con usuario y contraseña (sin email) y *Recordarme*. Al registrarte eliges **qué esperas de ACTIVE** y tus deportes: *Para ti* se basa en ello.
- **Explorar muy visual**: elige deporte (running, pádel, surf, paddle surf, trekking, golf, bici, gym & HYROX, tenis, yoga, natación), destino o tipo de experiencia.
- **3 formas de vivir ACTIVE**:
  - **ACTIVE Play** · cada semana en la ciudad: experiencias organizadas por el hotel (running turístico, surf, golf con sello de cada campo, pádel, gym pass…).
  - **ACTIVE Live** · los grandes eventos de la ciudad: compites (maratones, medias, HYROX) o vas de público (Premier Padel/FIP, ATP/WTA). Extras del hotel **solo en reserva directa**.
  - **ACTIVE Tour** · circuitos de Grupo Hotusa **separados por deporte** (Running, Pádel, Fitness), cada uno con su ranking y Master Final.
- **Precios por nivel** (p. ej. gym pass en club privado 18 €, gratis desde Challenger).
- Reserva con **fotos reales de la habitación** y **PDF de reserva** con vista previa.
- ACTIVE Pass con QR → sello en el **Sport Passport** → **registra la actividad con una foto** con marca de agua (sello de la ciudad + logo).
- **Mis recuerdos**: calendario con tus fotos y sellos, y **ACTIVE Wrapped** anual en formato historias, listo para compartir.
- **Muro de cada evento en tiempo real**, **partners** en carrusel, **Programa Embajador** y **Colabora con ACTIVE**.
- **Stella**, asistente IA (Gemini) con la base de conocimiento oficial, búsqueda web, recomendaciones y recogida de propuestas.
- Bilingüe ES/EN y funciona sin conexión (salvo cuentas, fotos, muro y Stella).

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
