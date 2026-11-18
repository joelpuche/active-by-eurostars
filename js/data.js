/* ACTIVE by Eurostars · datos de demostración (simulados) */
window.ACTIVE_DATA = (function () {
  var cities = [
    { id: 'madrid',    name: { es: 'Madrid', en: 'Madrid' },       country: { es: 'España', en: 'Spain' },    code: 'MAD', pilot: true,  hotel: 'Eurostars Madrid Tower',        stars: 5, price: 165, img: 'img/run4.jpg' },
    { id: 'sevilla',   name: { es: 'Sevilla', en: 'Seville' },     country: { es: 'España', en: 'Spain' },    code: 'SVQ', pilot: true,  hotel: 'Eurostars Torre Sevilla',       stars: 5, price: 139, img: 'img/run1.jpg' },
    { id: 'barcelona', name: { es: 'Barcelona', en: 'Barcelona' }, country: { es: 'España', en: 'Spain' },    code: 'BCN', pilot: false, hotel: 'Eurostars Grand Marina',        stars: 5, price: 189, img: 'img/run7.jpg' },
    { id: 'lisboa',    name: { es: 'Lisboa', en: 'Lisbon' },       country: { es: 'Portugal', en: 'Portugal' }, code: 'LIS', pilot: false, hotel: 'Eurostars Das Letras',     stars: 4, price: 129, img: 'img/run2.jpg' },
    { id: 'berlin',    name: { es: 'Berlín', en: 'Berlin' },       country: { es: 'Alemania', en: 'Germany' }, code: 'BER', pilot: false, hotel: 'Eurostars Berlin',         stars: 4, price: 119, img: 'img/run3.jpg' },
    { id: 'roma',      name: { es: 'Roma', en: 'Rome' },           country: { es: 'Italia', en: 'Italy' },    code: 'ROM', pilot: false, hotel: 'Eurostars International Palace', stars: 4, price: 149, img: 'img/run8.jpg' },
    { id: 'praga',     name: { es: 'Praga', en: 'Prague' },        country: { es: 'Chequia', en: 'Czechia' }, code: 'PRG', pilot: false, hotel: 'Eurostars Thalia',         stars: 5, price: 125, img: 'img/run5.jpg' },
    { id: 'porto',     name: { es: 'Oporto', en: 'Porto' },        country: { es: 'Portugal', en: 'Portugal' }, code: 'OPO', pilot: false, hotel: 'Eurostars Porto Douro',  stars: 4, price: 115, img: 'img/run6.jpg' }
  ];

  // type: run | padel | event
  var activities = [
    { id: 'sev-triana', city: 'sevilla', sport: 'run', type: 'tour', img: 'img/run1.jpg',
      title: { es: 'Run Tour Triana al amanecer', en: 'Triana Sunrise Run Tour' },
      partner: 'Triana Run Club', distance: '7 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 07:30', en: 'Saturdays · 7:30 am' }, meet: { es: 'Lobby Eurostars Torre Sevilla · 07:15', en: 'Eurostars Torre Sevilla lobby · 7:15 am' },
      price: 0, spots: 20, taken: 13,
      desc: { es: 'Cruza el Guadalquivir por el puente de Triana con un club local, recorre la calle Betis y vuelve al hotel para compartir un café en el vestíbulo.', en: 'Cross the Guadalquivir over the Triana bridge with a local club, run along Calle Betis and come back to the hotel for a coffee in the lobby.' } },
    { id: 'sev-padel', city: 'sevilla', sport: 'padel', type: 'match', img: 'img/padel1.jpg',
      title: { es: 'Torneo express de pádel', en: 'Express padel tournament' },
      partner: 'Club Pádel Cartuja', distance: '2 h', level: { es: 'Intermedio', en: 'Intermediate' },
      when: { es: 'Viernes · 19:00', en: 'Fridays · 7 pm' }, meet: { es: 'Club Pádel Cartuja · traslado desde el hotel', en: 'Club Pádel Cartuja · transfer from the hotel' },
      price: 15, spots: 16, taken: 11,
      desc: { es: 'Formato americano con huéspedes y socios del club. Pala y bolas incluidas.', en: 'Americano format with hotel guests and club members. Racket and balls included.' } },
    { id: 'mad-retiro', city: 'madrid', sport: 'run', type: 'tour', img: 'img/run4.jpg',
      title: { es: 'Run Tour Retiro – Madrid Río', en: 'Retiro – Madrid Río Run Tour' },
      partner: 'Madrid Runners Crew', distance: '10 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Domingos · 08:00', en: 'Sundays · 8 am' }, meet: { es: 'Lobby Eurostars Madrid Tower · 07:30 (traslado)', en: 'Eurostars Madrid Tower lobby · 7:30 am (transfer)' },
      price: 0, spots: 25, taken: 18,
      desc: { es: 'De la Puerta de Alcalá al Retiro y bajada hasta Madrid Río. Ritmo social con grupos por velocidad.', en: 'From Puerta de Alcalá through Retiro park down to Madrid Río. Social pace with groups by speed.' } },
    { id: 'mad-padel', city: 'madrid', sport: 'padel', type: 'match', img: 'img/padel2.jpg',
      title: { es: 'Pádel social BamVolea', en: 'BamVolea social padel' },
      partner: 'BamVolea · Ciudad de la Raqueta', partnerId: 'bamvolea', distance: '90 min', level: { es: 'Iniciación – medio', en: 'Beginner – intermediate' },
      when: { es: 'Martes y jueves · 20:00', en: 'Tue & Thu · 8 pm' }, meet: { es: 'Lobby Eurostars Madrid Tower · 19:30 (traslado)', en: 'Eurostars Madrid Tower lobby · 7:30 pm (transfer)' },
      price: 12, spots: 8, taken: 5,
      desc: { es: 'Partidos mixtos por nivel en BamVolea Ciudad de la Raqueta para huéspedes que viajan por trabajo. Pala incluida.', en: 'Level-matched games at BamVolea Ciudad de la Raqueta for business travellers. Racket included.' } },
    { id: 'mad-dl-recovery', city: 'madrid', sport: 'gym', type: 'wellness', img: 'img/run6.jpg',
      title: { es: 'Day Pass Gym & Recovery', en: 'Gym & Recovery Day Pass' },
      partner: 'David Lloyd La Finca', partnerId: 'davidlloyd', distance: { es: 'Día completo', en: 'Full day' }, level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Todos los días · 07:00–22:00', en: 'Every day · 7 am–10 pm' }, meet: { es: 'Acceso con tu ACTIVE Pass en recepción del club', en: 'Access with your ACTIVE Pass at the club reception' },
      price: 0, spots: 30, taken: 12,
      desc: { es: 'Gimnasio, clases dirigidas, piscina y zona de recuperación en David Lloyd para mantener tu rutina durante el viaje.', en: 'Gym, group classes, pool and recovery area at David Lloyd to keep your routine while travelling.' } },
    { id: 'mad-marathon', city: 'madrid', sport: 'run', type: 'event', img: 'img/run10.jpg',
      title: { es: 'Race Day Pack · Maratón de Madrid', en: 'Race Day Pack · Madrid Marathon' },
      partner: 'Zurich Rock’n’Roll Madrid', distance: '42 / 21 / 10 km', level: { es: 'Competición', en: 'Race' },
      when: { es: 'Abril · fin de semana de carrera', en: 'April · race weekend' }, meet: { es: 'Recogida de dorsal en el hotel', en: 'Bib pick-up at the hotel' },
      price: 0, spots: 60, taken: 41,
      desc: { es: 'Desayuno de carga a las 06:00, late check-out hasta las 16:00, bolsa de recuperación y lavado exprés de ropa técnica.', en: 'Carb-loading breakfast at 6 am, late check-out until 4 pm, recovery bag and express wash for your kit.' } },
    { id: 'bcn-barceloneta', city: 'barcelona', sport: 'run', type: 'tour', img: 'img/run7.jpg',
      title: { es: 'Seafront Run Barceloneta', en: 'Barceloneta Seafront Run' },
      partner: 'BCN Social Runners', distance: '8 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 08:00', en: 'Saturdays · 8 am' }, meet: { es: 'Lobby Eurostars Grand Marina · 07:45', en: 'Eurostars Grand Marina lobby · 7:45 am' },
      price: 0, spots: 25, taken: 9,
      desc: { es: 'Del Port Vell al Port Olímpic por el paseo marítimo. Baño opcional al final.', en: 'From Port Vell to Port Olímpic along the seafront. Optional swim at the end.' } },
    { id: 'bcn-padel', city: 'barcelona', sport: 'padel', type: 'match', img: 'img/padel3.jpg',
      title: { es: 'Pádel indoor BamVolea', en: 'BamVolea indoor padel' },
      partner: 'BamVolea · Hospitalet Padel Indoor', partnerId: 'bamvolea', distance: '90 min', level: { es: 'Intermedio', en: 'Intermediate' },
      when: { es: 'Miércoles · 19:30', en: 'Wednesdays · 7:30 pm' }, meet: { es: 'Lobby Eurostars Grand Marina · 19:00 (traslado)', en: 'Eurostars Grand Marina lobby · 7 pm (transfer)' },
      price: 14, spots: 8, taken: 6,
      desc: { es: 'Americano en pistas indoor climatizadas con otros huéspedes ACTIVE. Llueva o haga sol.', en: 'Americano on climate-controlled indoor courts with other ACTIVE guests. Rain or shine.' } },
    { id: 'bcn-dl-turo', city: 'barcelona', sport: 'gym', type: 'wellness', img: 'img/run9.jpg',
      title: { es: 'Recovery post-carrera en David Lloyd Turó', en: 'Post-run recovery at David Lloyd Turó' },
      partner: 'David Lloyd Club Turó', partnerId: 'davidlloyd', distance: { es: 'Día completo', en: 'Full day' }, level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Todos los días · 07:00–22:00', en: 'Every day · 7 am–10 pm' }, meet: { es: 'Acceso con tu ACTIVE Pass en recepción del club', en: 'Access with your ACTIVE Pass at the club reception' },
      price: 0, spots: 30, taken: 9,
      desc: { es: 'Gimnasio, piscinas y estudios de clases en uno de los clubs deportivos de referencia de Barcelona.', en: 'Gym, pools and class studios at one of Barcelona’s leading sports clubs.' } },
    { id: 'lis-belem', city: 'lisboa', sport: 'run', type: 'tour', img: 'img/run2.jpg',
      title: { es: 'Run Tour Belém junto al Tajo', en: 'Belém Run Tour by the Tagus' },
      partner: 'Lisbon Run Collective', distance: '9 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Domingos · 08:30', en: 'Sundays · 8:30 am' }, meet: { es: 'Lobby Eurostars Das Letras · 08:00', en: 'Eurostars Das Letras lobby · 8 am' },
      price: 0, spots: 20, taken: 7,
      desc: { es: 'Del Cais do Sodré a la Torre de Belém junto al río, con parada en el Padrão.', en: 'From Cais do Sodré to Belém Tower along the river, stopping at the Padrão.' } },
    { id: 'ber-marathon', city: 'berlin', sport: 'run', type: 'event', img: 'img/run3.jpg',
      title: { es: 'Race Day Pack · Maratón de Berlín', en: 'Race Day Pack · Berlin Marathon' },
      partner: 'BMW Berlin Marathon', distance: '42 km', level: { es: 'Competición', en: 'Race' },
      when: { es: 'Septiembre · fin de semana de carrera', en: 'September · race weekend' }, meet: { es: 'Shakeout run desde el hotel el sábado', en: 'Saturday shakeout run from the hotel' },
      price: 0, spots: 40, taken: 22,
      desc: { es: 'La maratón más rápida del mundo con logística resuelta: desayuno temprano, late check-out y custodia de equipaje.', en: 'The world’s fastest marathon with logistics sorted: early breakfast, late check-out and luggage storage.' } },
    { id: 'rom-antica', city: 'roma', sport: 'run', type: 'tour', img: 'img/run8.jpg',
      title: { es: 'Roma Antica Run', en: 'Roma Antica Run' },
      partner: 'Run Rome Club', distance: '6 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 07:00', en: 'Saturdays · 7 am' }, meet: { es: 'Lobby Eurostars International Palace', en: 'Eurostars International Palace lobby' },
      price: 0, spots: 20, taken: 10,
      desc: { es: 'Coliseo, Foro y Circo Máximo antes de que llegue el turismo.', en: 'Colosseum, Forum and Circus Maximus before the crowds arrive.' } },
    { id: 'pra-bridges', city: 'praga', sport: 'run', type: 'tour', img: 'img/run5.jpg',
      title: { es: 'Run de los puentes del Moldava', en: 'Vltava Bridges Run' },
      partner: 'Prague Morning Runners', distance: '8 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Domingos · 08:00', en: 'Sundays · 8 am' }, meet: { es: 'Lobby Eurostars Thalia', en: 'Eurostars Thalia lobby' },
      price: 0, spots: 20, taken: 6,
      desc: { es: 'Puente de Carlos, Malá Strana y la orilla del Moldava.', en: 'Charles Bridge, Malá Strana and the Vltava riverbank.' } },
    { id: 'por-douro', city: 'porto', sport: 'run', type: 'tour', img: 'img/run6.jpg',
      title: { es: 'Run Tour Ribeira – Foz', en: 'Ribeira – Foz Run Tour' },
      partner: 'Porto Run Club', distance: '10 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 08:30', en: 'Saturdays · 8:30 am' }, meet: { es: 'Lobby Eurostars Porto Douro', en: 'Eurostars Porto Douro lobby' },
      price: 0, spots: 20, taken: 8,
      desc: { es: 'Desde la Ribeira hasta la desembocadura del Duero en Foz.', en: 'From Ribeira to where the Douro meets the sea at Foz.' } }
  ];


  var partners = [
    { id: 'bamvolea', name: 'BamVolea', logo: 'img/partners/bamvolea.svg', sport: 'padel', url: 'https://bamvolea.com',
      tagline: { es: 'Pádel · Partner oficial', en: 'Padel · Official partner' },
      desc: { es: 'La mayor cadena de clubes de pádel de España: 14 clubes y más de 250 pistas en Madrid, Barcelona, Valencia, Bilbao, León y Marbella.', en: 'Spain’s largest padel club chain: 14 clubs and 250+ courts in Madrid, Barcelona, Valencia, Bilbao, León and Marbella.' },
      cities: ['madrid', 'barcelona'],
      perks: { es: ['Reserva preferente de pista para huéspedes ACTIVE', 'Pala y bolas incluidas en las actividades', 'Acceso a americanas sociales con otros huéspedes'], en: ['Priority court booking for ACTIVE guests', 'Racket and balls included in activities', 'Access to social americanos with other guests'] } },
    { id: 'davidlloyd', name: 'David Lloyd Clubs', logo: 'img/partners/davidlloyd.svg', sport: 'gym', url: 'https://www.davidlloyd.es',
      tagline: { es: 'Gym & Wellness · Partner oficial', en: 'Gym & Wellness · Official partner' },
      desc: { es: 'Grupo europeo líder en salud y bienestar, con clubs en Madrid y Barcelona: gimnasio, clases, piscinas, pistas y spa.', en: 'Europe’s leading health and wellness group, with clubs in Madrid and Barcelona: gym, classes, pools, courts and spa.' },
      cities: ['madrid', 'barcelona'],
      perks: { es: ['Day pass incluido con tu reserva ACTIVE', 'Zona de recuperación tras tu Run Tour', 'Spa incluido desde nivel Challenger'], en: ['Day pass included with your ACTIVE booking', 'Recovery area after your Run Tour', 'Spa included from Challenger level'] } }
  ];

  var meetups = [
    { id: 'm1', city: 'sevilla', sport: 'run', title: { es: 'Sunset run Alameda – Guadalquivir', en: 'Sunset run Alameda – Guadalquivir' }, club: 'Triana Run Club', when: { es: 'Jue · 19:30', en: 'Thu · 7:30 pm' }, going: 12, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm2', city: 'sevilla', sport: 'padel', title: { es: 'Americano para huéspedes', en: 'Guest americano' }, club: 'Club Pádel Cartuja', when: { es: 'Vie · 19:00', en: 'Fri · 7 pm' }, going: 7, from: { es: 'Faltan 1 plaza', en: '1 spot left' } },
    { id: 'm3', city: 'madrid', sport: 'run', title: { es: 'Easy run Madrid Río', en: 'Easy run Madrid Río' }, club: 'Madrid Runners Crew', when: { es: 'Mié · 07:00', en: 'Wed · 7 am' }, going: 15, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm4', city: 'madrid', sport: 'padel', title: { es: 'Pádel after-work', en: 'After-work padel' }, club: 'Padel Tower Club', when: { es: 'Mar · 20:00', en: 'Tue · 8 pm' }, going: 6, from: { es: 'Nivel medio', en: 'Intermediate' } },
    { id: 'm5', city: 'barcelona', sport: 'run', title: { es: 'Bunkers del Carmel trail', en: 'Bunkers del Carmel trail' }, club: 'BCN Social Runners', when: { es: 'Sáb · 08:00', en: 'Sat · 8 am' }, going: 21, from: { es: 'Desde el hotel', en: 'From the hotel' } },
    { id: 'm6', city: 'lisboa', sport: 'run', title: { es: 'Colinas de Alfama', en: 'Alfama hills' }, club: 'Lisbon Run Collective', when: { es: 'Mar · 07:30', en: 'Tue · 7:30 am' }, going: 9, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm7', city: 'berlin', sport: 'run', title: { es: 'Tiergarten loop', en: 'Tiergarten loop' }, club: 'Berlin Run Club', when: { es: 'Dom · 09:00', en: 'Sun · 9 am' }, going: 18, from: { es: 'Desde el hotel', en: 'From the hotel' } }
  ];

  var levels = [
    { id: 'explorer',   name: 'Explorer',   min: 0,  cities: 0,
      req: { es: 'Registro gratuito', en: 'Free sign-up' },
      perks: { es: ['Acceso a quedadas y Run Tours', 'Rutas del hotel en tu móvil'], en: ['Access to meetups and Run Tours', 'Hotel running routes on your phone'] } },
    { id: 'active',     name: 'Active',     min: 2,  cities: 0,
      req: { es: '2 actividades', en: '2 activities' },
      perks: { es: ['Desayuno temprano de carga', 'Lavado exprés de ropa deportiva'], en: ['Early energy breakfast', 'Express sportswear laundry'] } },
    { id: 'challenger', name: 'Challenger', min: 5,  cities: 2,
      req: { es: '5 actividades en 2+ ciudades', en: '5 activities in 2+ cities' },
      perks: { es: ['Late check-out garantizado tras tu actividad', 'Custodia de bicicletas'], en: ['Guaranteed late check-out after your activity', 'Bike storage'] } },
    { id: 'ambassador', name: 'Ambassador', min: 10, cities: 3,
      req: { es: '10 actividades + eventos', en: '10 activities + events' },
      perks: { es: ['Prioridad de inscripción en eventos', 'Upgrade según disponibilidad'], en: ['Priority event registration', 'Upgrade subject to availability'] } },
    { id: 'legend',     name: 'Legend',     min: Infinity, cities: 0, invite: true,
      req: { es: 'Por invitación', en: 'By invitation' },
      perks: { es: ['Kit técnico edición Legend', 'Experiencias VIP con partners'], en: ['Legend edition technical kit', 'VIP experiences with partners'] } }
  ];

  // Perfil de demostración: 4 actividades en 3 ciudades (nivel Active) y una reserva en Sevilla pendiente.
  function demoState() {
    var d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7) - 1); // próximo viernes aprox.
    var iso = d.toISOString().slice(0, 10);
    return {
      user: { name: 'Laura', sport: 'run', lang: null, demo: true, since: '2026-03-14' },
      stamps: [
        { city: 'madrid', sport: 'run', activity: 'mad-retiro', date: '2026-04-26' },
        { city: 'madrid', sport: 'padel', activity: 'mad-padel', date: '2026-06-11' },
        { city: 'barcelona', sport: 'run', activity: 'bcn-barceloneta', date: '2026-07-18' },
        { city: 'lisboa', sport: 'run', activity: 'lis-belem', date: '2026-09-27' }
      ],
      bookings: [
        { id: 'AE-7Q4K2', activity: 'sev-triana', city: 'sevilla', checkIn: iso, nights: 2, guests: 1, room: 'superior', total: 334, status: 'upcoming', checkedIn: false, created: new Date().toISOString() }
      ],
      joined: ['m1']
    };
  }

  return { cities: cities, activities: activities, partners: partners, meetups: meetups, levels: levels, demoState: demoState };
})();
