// Genera la base de conocimiento de Stella (HTML -> PDF) a partir de js/data.js
// Uso: node stella/build-kb.js  && luego imprimir a PDF (ver README)
global.window = {};
require('../js/data.js');
const D = window.ACTIVE_DATA;
const fs = require('fs');
const path = require('path');
const es = (o) => (o == null ? '' : typeof o === 'string' ? o : o.es);
const city = (id) => D.cities.find((c) => c.id === id);
const sport = Object.fromEntries(D.sports.map((x) => [x.id, x.label.es]));
const today = new Date().toISOString().slice(0, 10);

const lvl = (id) => (D.levels.find((l) => l.id === id) || {}).name;
const priceTxt = (a) => a.invite ? 'Solo por invitación' : !a.price ? 'Incluido con la reserva directa' : a.price + ' € / persona' + (a.freeFrom ? ' (gratis desde nivel ' + lvl(a.freeFrom) + ')' : '');
const rows = D.activities.map((a) => `<tr><td><b>${es(a.title)}</b><br><small>id: ${a.id}</small></td><td>${es(city(a.city).name)}</td><td>${D.kinds[a.kind].name} · ${sport[a.sport] || a.sport}</td><td>${a.partner}</td><td>${es(a.when)}</td><td>${es(a.distance)}</td><td>${es(a.level)}</td><td>${priceTxt(a)}${a.bibNote ? '. Dorsal no incluido' : ''}${a.exclusive ? '. Club privado normalmente solo para socios' : ''}</td><td>${es(a.meet)}</td></tr><tr class="d"><td colspan="9">${es(a.desc)}</td></tr>`).join('');

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Base de conocimiento Stella · ACTIVE by Eurostars</title>
<style>
@page { size: A4; margin: 16mm 14mm; }
body { font-family: Helvetica, Arial, sans-serif; font-size: 10.5pt; color: #2A0911; line-height: 1.45; }
h1 { color: #591225; font-size: 22pt; margin: 0 0 4px; letter-spacing: .02em; }
h2 { color: #591225; font-size: 13.5pt; border-bottom: 2px solid #591225; padding-bottom: 3px; margin: 20px 0 8px; text-transform: uppercase; letter-spacing: .04em; }
h3 { font-size: 11pt; margin: 12px 0 4px; }
.meta { background: #E8EBED; padding: 10px 12px; border-radius: 6px; font-size: 9.5pt; }
table { width: 100%; border-collapse: collapse; font-size: 8.4pt; }
th { background: #591225; color: #fff; text-align: left; padding: 4px; }
td { border-bottom: 1px solid #ddd; padding: 4px; vertical-align: top; }
tr.d td { color: #555; font-style: italic; border-bottom: 1px solid #bbb; }
small { color: #777; }
ul { margin: 4px 0 8px 18px; padding: 0; }
.q { font-weight: bold; margin-top: 8px; }
</style></head><body>
<h1>ACTIVE by Eurostars · Base de conocimiento de Stella</h1>
<p><b>Travel further. Play together.</b></p>
<div class="meta">
<b>Versión:</b> ${today} · <b>Mantenimiento:</b> semanal (calendario de actividades y eventos) y mensual (políticas, partners y niveles).<br>
<b>Responsable del programa ACTIVE:</b> Joel Puche · joelpuche@icloud.com<br>
Este documento es la fuente oficial de información de Stella, la asistente de ACTIVE. Lo que no aparezca aquí no está confirmado por el programa.
</div>

<h2>1. Qué es ACTIVE by Eurostars</h2>
<p>ACTIVE by Eurostars es el programa deportivo de Eurostars Hotel Company (Grupo Hotusa) que conecta a viajeros activos con comunidades, actividades y eventos deportivos locales en los destinos donde opera Eurostars. El hotel es el punto de encuentro; la comunidad crea participación; los eventos, motivos para viajar; y el estatus, motivos para volver.</p>
<p>Cuatro pilares: <b>Stay</b> (reserva directa con ventajas deportivas), <b>Community</b> (quedadas de running y pádel con clubes locales y otros huéspedes), <b>Events</b> (Run Tours, circuitos de pádel y Race Day Packs) y <b>Status</b> (niveles y Sport Passport). Cualquier deporte cuenta: running, pádel, surf, paddle surf, trekking, golf (con sello de cada campo), bici, yoga, pilates, natación, tenis y gym/HYROX, según la ciudad. El hotel conecta y reconoce; la actividad la organizan partners locales.</p>
<p>Perfiles de cliente: <b>Sport Travellers</b> (viajan por deporte: competir, entrenar o participar en un evento) y <b>Active Explorers</b> (viajan por ocio o trabajo y no quieren romper su rutina).</p>
<p>Fase actual: piloto de 90 días en Eurostars Madrid Tower y Eurostars Torre Sevilla, con más ciudades de la red en despliegue.</p>

<h2>2. Cómo funciona</h2>
<ul>
<li>El huésped descubre una actividad en la app/web ACTIVE y reserva habitación + plaza en un solo paso, siempre en el canal oficial de Eurostars (reserva directa).</li>
<li>Recibe su ACTIVE Pass con código QR. En el check-in, recepción activa el pase y entrega el kit de bienvenida.</li>
<li>Al terminar la actividad, el partner valida el QR y se estampa el sello de la ciudad en el Sport Passport.</li>
<li>Con cada actividad se progresa de nivel. Ver la política de precios en el apartado 5b.</li>
<li>Se puede crear cuenta solo con nombre de usuario y contraseña (opción "Recordarme"). Al registrarse, el socio elige qué espera de ACTIVE (planes en sus viajes, sus deportes, grandes eventos, ACTIVE Tour, conocer gente, gym y recuperación) y sus deportes; las recomendaciones se basan en ello. Cualquier deporte cuenta.</li>
</ul>

<h2>3. Niveles de estatus y ventajas</h2>
<table><tr><th>Nivel</th><th>Requisito</th><th>Ventajas</th></tr>
${D.levels.map((l) => `<tr><td><b>${l.name}</b></td><td>${es(l.req)}</td><td>${l.perks.es.join('; ')}</td></tr>`).join('')}
</table>
<p>Las ventajas son acumulativas. ACTIVE complementa a <b>Star Traveler</b>, el programa de fidelización de Eurostars Hotel Company: Star Traveler premia la estancia y ACTIVE premia la actividad. Mismo socio, misma web de reserva. Las estancias reservadas con ACTIVE suman puntos Star Traveler. Más información: https://www.eurostarshotels.com/startraveler</p>

<h2>4. Hoteles y ciudades ACTIVE</h2>
<table><tr><th>Ciudad</th><th>Hotel</th><th>Estrellas</th><th>Precio orientativo desde</th><th>Estado</th></tr>
${D.cities.map((c) => `<tr><td>${c.name.es} (${es(c.country)})</td><td>${c.hotel}</td><td>${c.stars}*</td><td>${c.price} € / noche (Classic)</td><td>${c.pilot ? 'Hotel piloto' : 'Disponible'}</td></tr>`).join('')}
</table>
<p>Tipos de habitación: Classic (precio base), Superior (+20%) y Junior Suite (+60%). Impuestos incluidos, pago en el hotel. Ventaja de reserva directa ACTIVE: desayuno temprano + lavado exprés de ropa deportiva incluidos.</p>

<h2>5. Calendario de actividades (actualización semanal)</h2>
<table><tr><th>Actividad</th><th>Ciudad</th><th>Tipo de evento · deporte</th><th>Partner</th><th>Cuándo</th><th>Distancia / duración</th><th>Nivel</th><th>Precio</th><th>Punto de encuentro</th></tr>${rows}</table>


<h2>5b. Los 3 tipos de evento ACTIVE</h2>
${Object.values(D.kinds).map((k) => `<h3>${k.name} · ${k.tag.es}</h3><p>${k.what.es} <b>Público:</b> ${k.who.es}.</p>`).join('')}
<h3>Extras de ACTIVE Live (solo en reserva directa, se añaden a la reserva de habitación)</h3>
<ul>${D.upsells.map((u) => `<li>${u.title.es}: ${u.price ? u.price + ' €' : 'incluido'}${u.freeFrom ? ' (gratis desde nivel ' + lvl(u.freeFrom) + ')' : ''} · disponible en: ${u.sets.map((x) => ({ race: 'carreras', fitness: 'HYROX/fitness', fan: 'eventos como público' })[x]).join(', ')}</li>`).join('')}</ul>
<p>En ACTIVE Live hay dos modalidades: <b>compites</b> (maratones, medias, HYROX; el dorsal no está incluido) o <b>vas de público</b> (Premier Padel/FIP, Mutua Madrid Open, Barcelona Open, Internazionali d'Italia; la entrada no está incluida). Las fechas exactas dependen del calendario oficial de cada evento.</p>
<p>El dorsal de la carrera no está incluido: se compra en la web oficial de cada evento. Las maratones figuran como colaboradores propuestos (no hay acuerdo firmado).</p>
<h3>Política de precios</h3>
<p>Las experiencias ACTIVE Local sencillas organizadas por el hotel (Run Tours, quedadas) están incluidas con la reserva directa. Las actividades con partner (pádel) tienen precio por persona. Los gym pass en clubs premium (David Lloyd, Holmes Place), normalmente reservados a socios, cuestan entre 15 y 18 € y son gratis desde el nivel Challenger. La inscripción a cada parada del ACTIVE Tour cuesta 25 € y es gratis para nivel Ambassador.</p>

<h2>5c. ACTIVE Tour ${D.tour.season}: un circuito por deporte</h2>
<p>El ACTIVE Tour lo organiza Grupo Hotusa y va <b>por separado por deporte</b>: cada socio puede apuntarse solo al circuito que le interese (por ejemplo, solo pádel o solo running) o a varios. Cada circuito tiene su propio ranking y su Master Final. Cada parada cuesta 25 € (gratis para nivel Ambassador), suma ${D.tour.points.stop} puntos (+${D.tour.points.top10} si quedas top 10 de tu categoría) y un sello en el Sport Passport.</p>
${D.tours.map((tr) => `<h3>${tr.name}</h3><p>Formato: ${tr.format.es}.</p><ul>${D.activities.filter((a) => a.tour === tr.id).map((a) => `<li>${a.final ? 'Master Final' : 'Parada ' + a.stop} · ${city(a.city).name.es} · ${a.when.es} (id: ${a.id})</li>`).join('')}</ul>`).join('')}
<p>Premios: ${D.tour.rewards.es.join('; ')}.</p>

<h2>5g. Recuerdos y ACTIVE Wrapped</h2>
<p>Al completar una actividad, el socio puede registrarla con una foto: la app le añade como marca de agua el sello de la ciudad (o del campo de golf) y el logo de ACTIVE by Eurostars. Las fotos se guardan de forma privada en su calendario "Mis recuerdos" y pueden compartirse. Al final del año (y en vista previa durante el año) se genera el ACTIVE Wrapped: actividades, ciudades, deporte favorito, ciudad favorita, mes más activo, fotos y nivel, listo para compartir.</p>

<h2>5d. Programa Embajador</h2>
<p>Embajadores ACTIVE: corredores, clubs, entrenadores y creadores que organizan sus propios eventos en la red Eurostars. Se accede completando 10 actividades en 3 ciudades (nivel Ambassador) o por solicitud desde la app (Perfil o Pasaporte → Programa Embajador). Ventajas propuestas: espacio y difusión para sus eventos en hoteles Eurostars, 20 % de descuento en estancias, 1 noche gratis por cada evento con 10+ participantes alojados, kit ASICS, gym premium gratis, inscripción gratis al ACTIVE Tour y 5 % de comisión en reservas con su código (propuesta).</p>

<h2>5e. Colabora con ACTIVE</h2>
<p>Empresas, marcas, clubs, organizadores de eventos y particulares pueden proponer colaboraciones (patrocinio, eventos, acceso a clubs, embajadores) desde el botón "Colabora con ACTIVE" de la app. El equipo responde a cada propuesta.</p>

<h2>5f. Comunidad</h2>
<p>Cada actividad y quedada tiene un muro del evento donde los socios apuntados pueden ver quién va y hablar entre ellos (por ejemplo, para compartir ritmo o quedar antes). Al reservar, el socio aparece automáticamente como asistente.</p>

<h2>6. Partners oficiales (acuerdos de ejemplo del MVP)</h2>
${D.partners.map((p) => `<h3>${p.name} · ${p.tagline.es}</h3><p>${p.desc.es} Web: ${p.url}</p><ul>${p.perks.es.map((x) => `<li>${x}</li>`).join('')}</ul>`).join('')}
<p>Clubes locales colaboradores: ${[...new Set(D.activities.filter((a) => !a.partnerId && a.kind === 'local').map((a) => a.partner))].join(', ')}.</p>

<h3>Quedadas de comunidad activas</h3>
<ul>${D.meetups.map((m) => `<li>${es(city(m.city).name)} · ${m.title.es} · ${m.club} · ${m.when.es} (${m.from.es})</li>`).join('')}</ul>

<h2>7. Políticas del programa</h2>
<h3>Menores</h3>
<ul>
<li>Run Tours y quedadas de running: a partir de 12 años acompañados de un adulto responsable inscrito en la misma actividad. Ritmo social, apto para familias activas.</li>
<li>Pádel en clubes partner: a partir de 10 años acompañados de un adulto; las americanas sociales son para mayores de 16.</li>
<li>Gym pass en clubs partner: según la normativa de cada club (zonas de gimnasio solo para mayores de 16; piscina familiar disponible en horario indicado por el club).</li>
<li>Race Day Packs: la edad mínima la fija el reglamento oficial de cada carrera.</li>
</ul>
<h3>Reservas y cancelación</h3>
<ul>
<li>La plaza en la actividad va unida a la reserva de habitación en el canal oficial de Eurostars.</li>
<li>Cancelación de la actividad sin coste hasta 24 h antes. La cancelación de la habitación sigue la tarifa elegida.</li>
<li>Si el partner cancela por meteorología se ofrece una alternativa (actividad indoor o cambio de día) o se reembolsa el importe de la actividad.</li>
<li>Acompañantes no alojados: pueden unirse a las quedadas gratuitas si hay plazas; las actividades de pista y los day pass son solo para huéspedes ACTIVE.</li>
</ul>
<h3>Material y salud</h3>
<ul>
<li>Running: ropa y calzado propios. Pádel: pala y bolas incluidas en las actividades BamVolea.</li>
<li>Las actividades no requieren licencia federativa. Cada participante declara estar en condiciones físicas adecuadas. Los grupos se organizan por ritmo/nivel.</li>
<li>Custodia de bicicletas y late check-out garantizado según nivel de estatus (ver niveles).</li>
</ul>
<h3>Mascotas y accesibilidad</h3>
<ul>
<li>Las mascotas no participan en las actividades. Para alojarse con mascota se aplica la política de cada hotel Eurostars.</li>
<li>Para necesidades de accesibilidad o deporte adaptado, el equipo ACTIVE estudia cada caso: contactar con el responsable del programa.</li>
</ul>

<h2>8. Proponer actividades</h2>
<p>Cualquier socio puede proponer nuevas actividades, rutas o ciudades a través de Stella. Las propuestas llegan al equipo ACTIVE y se revisan cada mes. No hay garantía de que se implanten, pero las más votadas por la comunidad se incluyen en el calendario.</p>

<h2>9. Preguntas frecuentes</h2>
<p class="q">¿Tengo que pagar por las actividades?</p><p>Las sociales básicas están incluidas con la estancia; las actividades de pista tienen el precio indicado en el calendario.</p>
<p class="q">¿Necesito un nivel mínimo?</p><p>No. Hay grupos por ritmo y nivel en cada actividad; el calendario indica el nivel recomendado.</p>
<p class="q">¿Puedo participar si no me alojo en el hotel?</p><p>Solo en quedadas gratuitas y si hay plazas. El resto es exclusivo para huéspedes ACTIVE.</p>
<p class="q">¿Cómo subo de nivel?</p><p>Completando actividades validadas con QR. Challenger exige actividades en al menos 2 ciudades.</p>
<p class="q">¿Qué pasa con mis puntos Star Traveler?</p><p>Sigues sumándolos por tus estancias; ACTIVE añade ventajas deportivas encima.</p>

<h2>10. Contacto</h2>
<p>Responsable del programa ACTIVE: <b>Joel Puche</b> · joelpuche@icloud.com. Para dudas no resueltas, incidencias o propuestas de colaboración.</p>
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'base-conocimiento-stella.html'), html);
console.log('OK', path.join(__dirname, 'base-conocimiento-stella.html'));
