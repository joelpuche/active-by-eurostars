/* ACTIVE by Eurostars · catálogo de demostración */
window.ACTIVE_DATA = (function () {
  function rooms(city, c, s, j) {
    var f = function (arr) { return arr.map(function (n) { return 'img/rooms/' + city + '-' + n + '.jpg'; }); };
    return { classic: f(c), superior: f(s), suite: f(j) };
  }
  var cities = [
    { id: 'madrid',    name: { es: 'Madrid', en: 'Madrid' },       country: { es: 'España', en: 'Spain' },      code: 'MAD', pilot: true,  hotel: 'Eurostars Madrid Tower',       stars: 5, price: 165, img: 'img/run4.jpg', rooms: rooms('madrid', [5, 3], [1, 2], [4, 2]) },
    { id: 'sevilla',   name: { es: 'Sevilla', en: 'Seville' },     country: { es: 'España', en: 'Spain' },      code: 'SVQ', pilot: true,  hotel: 'Eurostars Torre Sevilla',      stars: 5, price: 139, img: 'img/run1.jpg', rooms: rooms('sevilla', [4, 5], [3, 4], [1, 2]) },
    { id: 'barcelona', name: { es: 'Barcelona', en: 'Barcelona' }, country: { es: 'España', en: 'Spain' },      code: 'BCN', pilot: false, hotel: 'Eurostars Grand Marina',       stars: 5, price: 189, img: 'img/run7.jpg', rooms: rooms('barcelona', [1, 2], [5, 4], [3, 6]) },
    { id: 'lisboa',    name: { es: 'Lisboa', en: 'Lisbon' },       country: { es: 'Portugal', en: 'Portugal' }, code: 'LIS', pilot: false, hotel: 'Eurostars Das Letras',         stars: 4, price: 129, img: 'img/run2.jpg', rooms: rooms('lisboa', [1], [2], [2, 1]) },
    { id: 'berlin',    name: { es: 'Berlín', en: 'Berlin' },       country: { es: 'Alemania', en: 'Germany' },  code: 'BER', pilot: false, hotel: 'Eurostars Berlin',             stars: 4, price: 119, img: 'img/run3.jpg', rooms: rooms('berlin', [1, 5], [2, 4], [3, 2]) },
    { id: 'roma',      name: { es: 'Roma', en: 'Rome' },           country: { es: 'Italia', en: 'Italy' },      code: 'ROM', pilot: false, hotel: 'Eurostars Roma Aeterna',       stars: 4, price: 149, img: 'img/run8.jpg', rooms: rooms('roma', [1, 5], [2, 3], [4, 2]) },
    { id: 'praga',     name: { es: 'Praga', en: 'Prague' },        country: { es: 'Chequia', en: 'Czechia' },   code: 'PRG', pilot: false, hotel: 'Eurostars Thalia',             stars: 5, price: 125, img: 'img/run5.jpg', rooms: rooms('praga', [2], [1], [1, 2]) },
    { id: 'porto',     name: { es: 'Oporto', en: 'Porto' },        country: { es: 'Portugal', en: 'Portugal' }, code: 'OPO', pilot: false, hotel: 'Eurostars Porto Douro',        stars: 4, price: 115, img: 'img/run6.jpg', rooms: rooms('porto', [2, 3], [1, 5], [4, 1]) }
  ];

  /* Los 3 tipos de evento, cada uno con su público */
  var kinds = {
    local: { name: 'ACTIVE Local', icon: 'compass',
      tag: { es: 'Experiencias del hotel', en: 'Hotel experiences' },
      who: { es: 'Active Explorers: viajas por ocio o trabajo y no quieres romper tu rutina', en: 'Active Explorers: you travel for leisure or work and keep your routine' },
      what: { es: 'Frecuentes y sencillas, organizadas por el propio hotel: running turístico, pádel social, gym pass.', en: 'Frequent and easy, run by the hotel itself: sightseeing runs, social padel, gym pass.' } },
    race: { name: 'Race Weekend', icon: 'event',
      tag: { es: 'Grandes eventos de la ciudad', en: 'Big city events' },
      who: { es: 'Sport Travellers: viajas para competir en una carrera o evento señalado', en: 'Sport Travellers: you travel to race at a landmark event' },
      what: { es: 'El hotel se prepara para la maratón o el gran evento: entreno previo, desayuno de carga, late check-out, descarga muscular… Extras solo en reserva directa.', en: 'The hotel gets race-ready: shakeout run, carb breakfast, late check-out, recovery massage… Extras only when booking direct.' } },
    tour: { name: 'ACTIVE Tour', icon: 'star',
      tag: { es: 'Circuito Grupo Hotusa', en: 'Grupo Hotusa circuit' },
      who: { es: 'Comunidad ACTIVE: quieres retarte, sumar puntos y viajar por la red Eurostars', en: 'ACTIVE community: you want a challenge, points and travel across Eurostars' },
      what: { es: 'Una parada en cada ciudad durante la temporada. Ranking, premios por completar el circuito e invitación al Master Final.', en: 'One stop per city during the season. Ranking, rewards for finishing and an invitation to the Master Final.' } }
  };

  // price: precio base · freeFrom: nivel desde el que es gratis
  var activities = [
    /* ---- ACTIVE LOCAL ---- */
    { id: 'sev-triana', kind: 'local', city: 'sevilla', sport: 'run', img: 'img/run1.jpg',
      title: { es: 'Run Tour Triana al amanecer', en: 'Triana Sunrise Run Tour' },
      partner: 'Triana Run Club', distance: '7 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 07:30', en: 'Saturdays · 7:30 am' }, meet: { es: 'Lobby Eurostars Torre Sevilla · 07:15', en: 'Eurostars Torre Sevilla lobby · 7:15 am' },
      price: 0, spots: 20, taken: 13,
      desc: { es: 'Cruza el Guadalquivir por el puente de Triana con un club local, recorre la calle Betis y vuelve al hotel para compartir un café en el vestíbulo.', en: 'Cross the Guadalquivir over the Triana bridge with a local club, run along Calle Betis and come back to the hotel for a coffee in the lobby.' } },
    { id: 'sev-padel', kind: 'local', city: 'sevilla', sport: 'padel', img: 'img/padel1.jpg',
      title: { es: 'Pádel social con Playtomic', en: 'Social padel with Playtomic' },
      partner: 'Playtomic · Club Pádel Cartuja', partnerId: 'playtomic', distance: '2 h', level: { es: 'Intermedio', en: 'Intermediate' },
      when: { es: 'Viernes · 19:00', en: 'Fridays · 7 pm' }, meet: { es: 'Club Pádel Cartuja · traslado desde el hotel', en: 'Club Pádel Cartuja · transfer from the hotel' },
      price: 15, spots: 16, taken: 11,
      desc: { es: 'Formato americano con huéspedes y jugadores locales. Pala y bolas incluidas.', en: 'Americano format with guests and local players. Racket and balls included.' } },
    { id: 'mad-retiro', kind: 'local', city: 'madrid', sport: 'run', img: 'img/run4.jpg',
      title: { es: 'Run Tour Retiro – Madrid Río', en: 'Retiro – Madrid Río Run Tour' },
      partner: 'Madrid Runners Crew', distance: '10 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Domingos · 08:00', en: 'Sundays · 8 am' }, meet: { es: 'Lobby Eurostars Madrid Tower · 07:30 (traslado)', en: 'Eurostars Madrid Tower lobby · 7:30 am (transfer)' },
      price: 0, spots: 25, taken: 18,
      desc: { es: 'De la Puerta de Alcalá al Retiro y bajada hasta Madrid Río. Ritmo social con grupos por velocidad.', en: 'From Puerta de Alcalá through Retiro park down to Madrid Río. Social pace with groups by speed.' } },
    { id: 'mad-padel', kind: 'local', city: 'madrid', sport: 'padel', img: 'img/padel2.jpg',
      title: { es: 'Pádel social BamVolea', en: 'BamVolea social padel' },
      partner: 'BamVolea · Ciudad de la Raqueta', partnerId: 'bamvolea', distance: '90 min', level: { es: 'Iniciación – medio', en: 'Beginner – intermediate' },
      when: { es: 'Martes y jueves · 20:00', en: 'Tue & Thu · 8 pm' }, meet: { es: 'Lobby Eurostars Madrid Tower · 19:30 (traslado)', en: 'Eurostars Madrid Tower lobby · 7:30 pm (transfer)' },
      price: 12, spots: 8, taken: 5,
      desc: { es: 'Partidos mixtos por nivel en BamVolea Ciudad de la Raqueta para huéspedes que viajan por trabajo. Pala incluida.', en: 'Level-matched games at BamVolea Ciudad de la Raqueta for business travellers. Racket included.' } },
    { id: 'mad-dl-recovery', kind: 'local', city: 'madrid', sport: 'gym', img: 'img/run6.jpg',
      title: { es: 'Day Pass David Lloyd La Finca', en: 'David Lloyd La Finca Day Pass' },
      partner: 'David Lloyd La Finca', partnerId: 'davidlloyd', distance: { es: 'Día completo', en: 'Full day' }, level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Todos los días · 07:00–22:00', en: 'Every day · 7 am–10 pm' }, meet: { es: 'Acceso con tu ACTIVE Pass en recepción del club', en: 'Access with your ACTIVE Pass at the club reception' },
      price: 18, freeFrom: 'challenger', exclusive: true, spots: 30, taken: 12,
      desc: { es: 'Club premium normalmente reservado a socios: gimnasio, clases, piscina y zona de recuperación. Acceso abierto solo para huéspedes ACTIVE.', en: 'Premium members-only club: gym, classes, pool and recovery area. Access opened only for ACTIVE guests.' } },
    { id: 'bcn-barceloneta', kind: 'local', city: 'barcelona', sport: 'run', img: 'img/run7.jpg',
      title: { es: 'Seafront Run Barceloneta', en: 'Barceloneta Seafront Run' },
      partner: 'BCN Social Runners', distance: '8 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 08:00', en: 'Saturdays · 8 am' }, meet: { es: 'Lobby Eurostars Grand Marina · 07:45', en: 'Eurostars Grand Marina lobby · 7:45 am' },
      price: 0, spots: 25, taken: 9,
      desc: { es: 'Del Port Vell al Port Olímpic por el paseo marítimo. Baño opcional al final.', en: 'From Port Vell to Port Olímpic along the seafront. Optional swim at the end.' } },
    { id: 'bcn-padel', kind: 'local', city: 'barcelona', sport: 'padel', img: 'img/padel3.jpg',
      title: { es: 'Pádel indoor BamVolea', en: 'BamVolea indoor padel' },
      partner: 'BamVolea · Hospitalet Padel Indoor', partnerId: 'bamvolea', distance: '90 min', level: { es: 'Intermedio', en: 'Intermediate' },
      when: { es: 'Miércoles · 19:30', en: 'Wednesdays · 7:30 pm' }, meet: { es: 'Lobby Eurostars Grand Marina · 19:00 (traslado)', en: 'Eurostars Grand Marina lobby · 7 pm (transfer)' },
      price: 14, spots: 8, taken: 6,
      desc: { es: 'Americano en pistas indoor climatizadas con otros huéspedes ACTIVE. Llueva o haga sol.', en: 'Americano on climate-controlled indoor courts with other ACTIVE guests. Rain or shine.' } },
    { id: 'bcn-dl-turo', kind: 'local', city: 'barcelona', sport: 'gym', img: 'img/run9.jpg',
      title: { es: 'Day Pass David Lloyd Turó', en: 'David Lloyd Turó Day Pass' },
      partner: 'David Lloyd Club Turó', partnerId: 'davidlloyd', distance: { es: 'Día completo', en: 'Full day' }, level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Todos los días · 07:00–22:00', en: 'Every day · 7 am–10 pm' }, meet: { es: 'Acceso con tu ACTIVE Pass en recepción del club', en: 'Access with your ACTIVE Pass at the club reception' },
      price: 18, freeFrom: 'challenger', exclusive: true, spots: 30, taken: 9,
      desc: { es: 'Gimnasio, piscinas y estudios en un club privado de referencia en Barcelona, abierto solo para huéspedes ACTIVE.', en: 'Gym, pools and studios at a leading private club in Barcelona, open only to ACTIVE guests.' } },
    { id: 'lis-belem', kind: 'local', city: 'lisboa', sport: 'run', img: 'img/run2.jpg',
      title: { es: 'Run Tour Belém junto al Tajo', en: 'Belém Run Tour by the Tagus' },
      partner: 'Lisbon Run Collective', distance: '9 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Domingos · 08:30', en: 'Sundays · 8:30 am' }, meet: { es: 'Lobby Eurostars Das Letras · 08:00', en: 'Eurostars Das Letras lobby · 8 am' },
      price: 0, spots: 20, taken: 7,
      desc: { es: 'Del Cais do Sodré a la Torre de Belém junto al río, con parada en el Padrão.', en: 'From Cais do Sodré to Belém Tower along the river, stopping at the Padrão.' } },
    { id: 'lis-holmes', kind: 'local', city: 'lisboa', sport: 'gym', img: 'img/run5.jpg',
      title: { es: 'Gym Pass Holmes Place Lisboa', en: 'Holmes Place Lisbon Gym Pass' },
      partner: 'Holmes Place', partnerId: 'holmesplace', distance: { es: 'Día completo', en: 'Full day' }, level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Todos los días', en: 'Every day' }, meet: { es: 'Acceso con tu ACTIVE Pass', en: 'Access with your ACTIVE Pass' },
      price: 15, freeFrom: 'challenger', exclusive: true, spots: 30, taken: 6,
      desc: { es: 'Club premium de fitness y spa, normalmente solo para socios.', en: 'Premium fitness and spa club, normally members-only.' } },
    { id: 'ber-tiergarten', kind: 'local', city: 'berlin', sport: 'run', img: 'img/run3.jpg',
      title: { es: 'Run Tour Tiergarten – Brandeburgo', en: 'Tiergarten – Brandenburg Run Tour' },
      partner: 'Berlin Run Club', distance: '8 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Domingos · 09:00', en: 'Sundays · 9 am' }, meet: { es: 'Lobby Eurostars Berlin', en: 'Eurostars Berlin lobby' },
      price: 0, spots: 20, taken: 8,
      desc: { es: 'Tiergarten, Puerta de Brandeburgo y el Reichstag a ritmo social.', en: 'Tiergarten, Brandenburg Gate and the Reichstag at a social pace.' } },
    { id: 'rom-antica', kind: 'local', city: 'roma', sport: 'run', img: 'img/run8.jpg',
      title: { es: 'Roma Antica Run', en: 'Roma Antica Run' },
      partner: 'Run Rome Club', distance: '6 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 07:00', en: 'Saturdays · 7 am' }, meet: { es: 'Lobby Eurostars Roma Aeterna', en: 'Eurostars Roma Aeterna lobby' },
      price: 0, spots: 20, taken: 10,
      desc: { es: 'Coliseo, Foro y Circo Máximo antes de que llegue el turismo.', en: 'Colosseum, Forum and Circus Maximus before the crowds arrive.' } },
    { id: 'pra-bridges', kind: 'local', city: 'praga', sport: 'run', img: 'img/run5.jpg',
      title: { es: 'Run de los puentes del Moldava', en: 'Vltava Bridges Run' },
      partner: 'Prague Morning Runners', distance: '8 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Domingos · 08:00', en: 'Sundays · 8 am' }, meet: { es: 'Lobby Eurostars Thalia', en: 'Eurostars Thalia lobby' },
      price: 0, spots: 20, taken: 6,
      desc: { es: 'Puente de Carlos, Malá Strana y la orilla del Moldava.', en: 'Charles Bridge, Malá Strana and the Vltava riverbank.' } },
    { id: 'por-douro', kind: 'local', city: 'porto', sport: 'run', img: 'img/run6.jpg',
      title: { es: 'Run Tour Ribeira – Foz', en: 'Ribeira – Foz Run Tour' },
      partner: 'Porto Run Club', distance: '10 km', level: { es: 'Todos los niveles', en: 'All levels' },
      when: { es: 'Sábados · 08:30', en: 'Saturdays · 8:30 am' }, meet: { es: 'Lobby Eurostars Porto Douro', en: 'Eurostars Porto Douro lobby' },
      price: 0, spots: 20, taken: 8,
      desc: { es: 'Desde la Ribeira hasta la desembocadura del Duero en Foz.', en: 'From Ribeira to where the Douro meets the sea at Foz.' } },

    /* ---- RACE WEEKEND ---- */
    { id: 'bcn-marathon', month: '2027-03', kind: 'race', city: 'barcelona', sport: 'run', img: 'img/run10.jpg',
      title: { es: 'Race Weekend · Maratón de Barcelona', en: 'Race Weekend · Barcelona Marathon' },
      partner: 'Zurich Marató de Barcelona (colaborador propuesto)', distance: '42 km', level: { es: 'Competición', en: 'Race' },
      when: { es: 'Marzo 2027 · fin de semana de carrera', en: 'March 2027 · race weekend' }, meet: { es: 'Eurostars Grand Marina · centro de operaciones del corredor', en: 'Eurostars Grand Marina · runner HQ' },
      price: 0, spots: 60, taken: 38, bibNote: true,
      desc: { es: 'Plan especial del hotel para corredores: shakeout run el sábado, desayuno de carga a las 05:30, late check-out y recuperación. Tú eliges los extras de tu habitación.', en: 'Special hotel plan for runners: Saturday shakeout run, 5:30 am carb breakfast, late check-out and recovery. You choose your room extras.' } },
    { id: 'sev-marathon', month: '2027-02', kind: 'race', city: 'sevilla', sport: 'run', img: 'img/run1.jpg',
      title: { es: 'Race Weekend · Maratón de Sevilla', en: 'Race Weekend · Seville Marathon' },
      partner: 'Zurich Maratón de Sevilla (colaborador propuesto)', distance: '42 km', level: { es: 'Competición', en: 'Race' },
      when: { es: 'Febrero 2027 · fin de semana de carrera', en: 'February 2027 · race weekend' }, meet: { es: 'Eurostars Torre Sevilla', en: 'Eurostars Torre Sevilla' },
      price: 0, spots: 60, taken: 21, bibNote: true,
      desc: { es: 'Una de las maratones más llanas de Europa, con la logística resuelta desde el hotel piloto.', en: 'One of Europe’s flattest marathons, with logistics sorted from the pilot hotel.' } },
    { id: 'mad-marathon', month: '2027-04', kind: 'race', city: 'madrid', sport: 'run', img: 'img/run4.jpg',
      title: { es: 'Race Weekend · Maratón de Madrid', en: 'Race Weekend · Madrid Marathon' },
      partner: 'Zurich Rock’n’Roll Madrid (colaborador propuesto)', distance: '42 / 21 / 10 km', level: { es: 'Competición', en: 'Race' },
      when: { es: 'Abril 2027 · fin de semana de carrera', en: 'April 2027 · race weekend' }, meet: { es: 'Recogida de dorsal en el hotel', en: 'Bib pick-up at the hotel' },
      price: 0, spots: 60, taken: 41, bibNote: true,
      desc: { es: 'Desayuno de carga temprano, late check-out, bolsa de recuperación y lavado exprés de ropa técnica.', en: 'Early carb breakfast, late check-out, recovery bag and express kit laundry.' } },
    { id: 'ber-marathon', month: '2027-09', kind: 'race', city: 'berlin', sport: 'run', img: 'img/run3.jpg',
      title: { es: 'Race Weekend · Maratón de Berlín', en: 'Race Weekend · Berlin Marathon' },
      partner: 'BMW Berlin Marathon (colaborador propuesto)', distance: '42 km', level: { es: 'Competición', en: 'Race' },
      when: { es: 'Septiembre 2027 · fin de semana de carrera', en: 'September 2027 · race weekend' }, meet: { es: 'Shakeout run desde el hotel el sábado', en: 'Saturday shakeout run from the hotel' },
      price: 0, spots: 40, taken: 22, bibNote: true,
      desc: { es: 'Una de las maratones más rápidas del mundo con la logística resuelta: desayuno temprano, late check-out y custodia de equipaje.', en: 'One of the world’s fastest marathons with logistics sorted: early breakfast, late check-out and luggage storage.' } },

    /* ---- ACTIVE TOUR 2027 ---- */
    { id: 'tour-sevilla', month: '2027-02', kind: 'tour', city: 'sevilla', sport: 'run', img: 'img/run1.jpg', stop: 1,
      title: { es: 'ACTIVE Tour · Parada 1 Sevilla', en: 'ACTIVE Tour · Stop 1 Seville' },
      partner: 'Grupo Hotusa · ACTIVE Tour', distance: '10K + reto pádel', level: { es: 'Todas las categorías', en: 'All categories' },
      when: { es: 'Febrero 2027', en: 'February 2027' }, meet: { es: 'Eurostars Torre Sevilla', en: 'Eurostars Torre Sevilla' },
      price: 25, freeFrom: 'ambassador', spots: 300, taken: 112,
      desc: { es: 'Arranca la temporada: 10K urbano nocturno + reto express de pádel. Puntos para el ranking del ACTIVE Tour.', en: 'Season opener: night 10K + express padel challenge. Points for the ACTIVE Tour ranking.' } },
    { id: 'tour-madrid', month: '2027-04', kind: 'tour', city: 'madrid', sport: 'run', img: 'img/run4.jpg', stop: 2,
      title: { es: 'ACTIVE Tour · Parada 2 Madrid', en: 'ACTIVE Tour · Stop 2 Madrid' },
      partner: 'Grupo Hotusa · ACTIVE Tour', distance: '10K + reto pádel', level: { es: 'Todas las categorías', en: 'All categories' },
      when: { es: 'Abril 2027', en: 'April 2027' }, meet: { es: 'Eurostars Madrid Tower', en: 'Eurostars Madrid Tower' },
      price: 25, freeFrom: 'ambassador', spots: 300, taken: 87,
      desc: { es: 'Segunda parada a los pies del skyline de la Castellana. Puntos extra si repites desde Sevilla.', en: 'Second stop at the Castellana skyline. Bonus points if you also raced Seville.' } },
    { id: 'tour-barcelona', month: '2027-06', kind: 'tour', city: 'barcelona', sport: 'run', img: 'img/run7.jpg', stop: 3,
      title: { es: 'ACTIVE Tour · Parada 3 Barcelona', en: 'ACTIVE Tour · Stop 3 Barcelona' },
      partner: 'Grupo Hotusa · ACTIVE Tour', distance: '10K + reto pádel', level: { es: 'Todas las categorías', en: 'All categories' },
      when: { es: 'Junio 2027', en: 'June 2027' }, meet: { es: 'Eurostars Grand Marina', en: 'Eurostars Grand Marina' },
      price: 25, freeFrom: 'ambassador', spots: 300, taken: 64,
      desc: { es: 'Parada junto al mar con fiesta post-carrera en la terraza del hotel.', en: 'Seaside stop with a post-race party on the hotel terrace.' } },
    { id: 'tour-lisboa', month: '2027-09', kind: 'tour', city: 'lisboa', sport: 'run', img: 'img/run2.jpg', stop: 4,
      title: { es: 'ACTIVE Tour · Parada 4 Lisboa', en: 'ACTIVE Tour · Stop 4 Lisbon' },
      partner: 'Grupo Hotusa · ACTIVE Tour', distance: '10K + reto pádel', level: { es: 'Todas las categorías', en: 'All categories' },
      when: { es: 'Septiembre 2027', en: 'September 2027' }, meet: { es: 'Eurostars Das Letras', en: 'Eurostars Das Letras' },
      price: 25, freeFrom: 'ambassador', spots: 250, taken: 40,
      desc: { es: 'Última parada clasificatoria: aquí se decide quién va al Master Final.', en: 'Last qualifying stop: this decides who goes to the Master Final.' } },
    { id: 'tour-final', month: '2027-11', kind: 'tour', city: 'madrid', sport: 'run', img: 'img/run10.jpg', stop: 5, final: true,
      title: { es: 'ACTIVE Tour · Master Final Madrid', en: 'ACTIVE Tour · Master Final Madrid' },
      partner: 'Grupo Hotusa · ACTIVE Tour', distance: '10K + final pádel', level: { es: 'Por invitación', en: 'By invitation' },
      when: { es: 'Noviembre 2027', en: 'November 2027' }, meet: { es: 'Eurostars Madrid Tower', en: 'Eurostars Madrid Tower' },
      price: 0, invite: true, spots: 120, taken: 0,
      desc: { es: 'Los mejores del ranking y los finishers del circuito, invitados con estancia incluida. Gala de premios ACTIVE.', en: 'Top-ranked athletes and circuit finishers, invited with stay included. ACTIVE awards gala.' } }
  ];

  /* Extras de Race Weekend: solo en reserva directa, suben el ticket medio */
  var upsells = [
    { id: 'shakeout', price: 0, title: { es: 'Shakeout run el día antes con el equipo ACTIVE', en: 'Shakeout run the day before with the ACTIVE team' } },
    { id: 'breakfast', price: 14, title: { es: 'Desayuno de carga a las 05:30', en: 'Carb-loading breakfast at 5:30 am' } },
    { id: 'latecheckout', price: 25, freeFrom: 'challenger', title: { es: 'Late check-out hasta las 16:00', en: 'Late check-out until 4 pm' } },
    { id: 'laundry', price: 9, title: { es: 'Lavado exprés de ropa técnica', en: 'Express sportswear laundry' } },
    { id: 'massage', price: 39, title: { es: 'Sesión de descarga muscular (30 min)', en: 'Recovery massage (30 min)' } },
    { id: 'transfer', price: 8, title: { es: 'Traslado a la salida', en: 'Transfer to the start line' } },
    { id: 'recoverykit', price: 15, title: { es: 'Kit de recuperación en la habitación', en: 'In-room recovery kit' } }
  ];

  var tour = {
    season: '2027',
    points: { stop: 100, top10: 50 },
    rewards: {
      es: ['Completa 3 de 4 paradas → medalla Finisher + 1 noche gratis en la red Eurostars', 'Top 3 del ranking por categoría → invitación al Master Final con estancia incluida', 'Cada parada suma un sello en tu Sport Passport'],
      en: ['Finish 3 of 4 stops → Finisher medal + 1 free night across Eurostars', 'Top 3 per category → Master Final invitation with stay included', 'Every stop adds a stamp to your Sport Passport']
    },
    ranking: [
      { name: 'Lucía G.', city: 'Madrid', pts: 450 }, { name: 'Marco T.', city: 'Roma', pts: 400 }, { name: 'Anna K.', city: 'Berlín', pts: 350 },
      { name: 'Jordi P.', city: 'Barcelona', pts: 300 }, { name: 'Carmen R.', city: 'Sevilla', pts: 250 }, { name: 'Tomás V.', city: 'Lisboa', pts: 200 }
    ]
  };

  var partners = [
    { id: 'bamvolea', name: 'BamVolea', logo: 'img/partners/bamvolea.svg', sport: 'padel', url: 'https://bamvolea.com',
      tagline: { es: 'Pádel', en: 'Padel' },
      desc: { es: 'La mayor cadena de clubes de pádel de España: 14 clubes y más de 250 pistas en Madrid, Barcelona, Valencia, Bilbao, León y Marbella. Su BamVolea Tour inspira nuestro ACTIVE Tour.', en: 'Spain’s largest padel club chain: 14 clubs and 250+ courts. Their BamVolea Tour inspires our ACTIVE Tour.' },
      cities: ['madrid', 'barcelona'],
      perks: { es: ['Reserva preferente de pista para huéspedes ACTIVE', 'Pala y bolas incluidas en las actividades', 'Reto de pádel en cada parada del ACTIVE Tour'], en: ['Priority court booking for ACTIVE guests', 'Racket and balls included', 'Padel challenge at every ACTIVE Tour stop'] } },
    { id: 'davidlloyd', name: 'David Lloyd Clubs', logo: 'img/partners/davidlloyd.svg', sport: 'gym', url: 'https://www.davidlloyd.es',
      tagline: { es: 'Club premium · Gym & Wellness', en: 'Premium club · Gym & Wellness' },
      desc: { es: 'Grupo europeo líder en salud y bienestar. Clubs privados con gimnasio, clases, piscinas, pistas y spa.', en: 'Europe’s leading health and wellness group. Private clubs with gym, classes, pools, courts and spa.' },
      cities: ['madrid', 'barcelona'],
      perks: { es: ['Day pass normalmente exclusivo para socios', '18 € para huéspedes ACTIVE · gratis desde Challenger', 'Zona de recuperación tras tu Run Tour'], en: ['Day pass normally members-only', '€18 for ACTIVE guests · free from Challenger', 'Recovery area after your Run Tour'] } },
    { id: 'holmesplace', name: 'Holmes Place', logo: 'img/partners/holmesplace.svg', mono: true, sport: 'gym', url: 'https://www.holmesplace.com',
      tagline: { es: 'Fitness premium', en: 'Premium fitness' },
      desc: { es: 'Clubs premium de fitness y spa en Europa, con presencia en Madrid, Lisboa, Oporto, Berlín y Praga.', en: 'Premium fitness and spa clubs across Europe, including Madrid, Lisbon, Porto, Berlin and Prague.' },
      cities: ['madrid', 'lisboa', 'porto', 'berlin', 'praga'],
      perks: { es: ['Gym pass para huéspedes ACTIVE (15 €)', 'Gratis desde nivel Challenger', 'Clases dirigidas incluidas'], en: ['Gym pass for ACTIVE guests (€15)', 'Free from Challenger level', 'Group classes included'] } },
    { id: 'playtomic', name: 'Playtomic', logo: 'img/partners/playtomic.svg', sport: 'padel', url: 'https://playtomic.com',
      tagline: { es: 'Reserva de pistas', en: 'Court booking' },
      desc: { es: 'La app de pádel y tenis con miles de clubes en España, Portugal, Italia y más. Encuentra partido en tu destino.', en: 'The padel and tennis app with thousands of clubs in Spain, Portugal, Italy and more. Find a match wherever you go.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'roma', 'porto'],
      perks: { es: ['Partidos abiertos con jugadores locales de tu nivel', 'Pistas cerca de cada hotel Eurostars', 'Ranking de pádel conectado al ACTIVE Tour'], en: ['Open matches with local players at your level', 'Courts near every Eurostars hotel', 'Padel ranking linked to the ACTIVE Tour'] } },
    { id: 'strava', name: 'Strava', logo: 'img/partners/strava.svg', sport: 'run', url: 'https://www.strava.com',
      tagline: { es: 'Comunidad y retos', en: 'Community and challenges' },
      desc: { es: 'Club ACTIVE en Strava con las rutas de cada hotel y retos inter-ciudades.', en: 'ACTIVE Club on Strava with each hotel’s routes and inter-city challenges.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'berlin', 'roma', 'praga', 'porto'],
      perks: { es: ['Rutas oficiales ACTIVE de cada hotel', 'Retos mensuales con sello extra', 'Segmentos del ACTIVE Tour'], en: ['Official ACTIVE routes for every hotel', 'Monthly challenges with bonus stamp', 'ACTIVE Tour segments'] } },
    { id: 'decathlon', name: 'Decathlon', logo: 'img/partners/decathlon.svg', sport: 'run', url: 'https://www.decathlon.es',
      tagline: { es: 'Material deportivo', en: 'Sports gear' },
      desc: { es: '¿Te has dejado algo? Material en préstamo en el hotel y tiendas en todas las ciudades ACTIVE.', en: 'Forgot something? Gear on loan at the hotel and stores in every ACTIVE city.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'berlin', 'roma', 'praga', 'porto'],
      perks: { es: ['Préstamo de material (palas, esterillas, bicis)', 'Descuento en tienda con tu ACTIVE Pass', 'Avituallamiento en el ACTIVE Tour'], en: ['Gear loans (rackets, mats, bikes)', 'Store discount with your ACTIVE Pass', 'Aid stations at the ACTIVE Tour'] } },
    { id: 'hyrox', name: 'HYROX', logo: 'img/partners/hyrox.png', mono: true, sport: 'gym', url: 'https://hyrox.com',
      tagline: { es: 'Fitness racing', en: 'Fitness racing' },
      desc: { es: 'La competición de fitness que más crece: 1,5 M de atletas estimados en la temporada 2025/26. Race Weekends para sus pruebas en Europa.', en: 'The fastest-growing fitness race: an estimated 1.5M athletes in 2025/26. Race Weekends for its European events.' },
      cities: ['madrid', 'barcelona', 'berlin', 'roma'],
      perks: { es: ['Race Weekend en sus pruebas europeas', 'Sesiones de simulación HYROX en el gym partner', 'Descuento en inscripción (propuesta)'], en: ['Race Weekend at its European events', 'HYROX simulation sessions at partner gyms', 'Entry discount (proposal)'] } },
    { id: 'asics', name: 'ASICS', logo: 'img/partners/asics.svg', sport: 'run', url: 'https://www.asics.com',
      tagline: { es: 'Kit oficial', en: 'Official kit' },
      desc: { es: 'Patrocinador de equipación del ACTIVE Tour y de los Embajadores ACTIVE.', en: 'Kit sponsor of the ACTIVE Tour and ACTIVE Ambassadors.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'berlin', 'roma', 'praga', 'porto'],
      perks: { es: ['Camiseta técnica del ACTIVE Tour', 'Kit completo para Embajadores', 'Pruebas de zapatillas en Race Weekends'], en: ['ACTIVE Tour tech tee', 'Full kit for Ambassadors', 'Shoe testing at Race Weekends'] } }
  ];

  var meetups = [
    { id: 'm1', city: 'sevilla', sport: 'run', title: { es: 'Sunset run Alameda – Guadalquivir', en: 'Sunset run Alameda – Guadalquivir' }, club: 'Triana Run Club', when: { es: 'Jue · 19:30', en: 'Thu · 7:30 pm' }, going: 12, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm2', city: 'sevilla', sport: 'padel', title: { es: 'Americano para huéspedes', en: 'Guest americano' }, club: 'Playtomic', when: { es: 'Vie · 19:00', en: 'Fri · 7 pm' }, going: 7, from: { es: 'Falta 1 plaza', en: '1 spot left' } },
    { id: 'm3', city: 'madrid', sport: 'run', title: { es: 'Easy run Madrid Río', en: 'Easy run Madrid Río' }, club: 'Madrid Runners Crew', when: { es: 'Mié · 07:00', en: 'Wed · 7 am' }, going: 15, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm4', city: 'madrid', sport: 'padel', title: { es: 'Pádel after-work', en: 'After-work padel' }, club: 'BamVolea', when: { es: 'Mar · 20:00', en: 'Tue · 8 pm' }, going: 6, from: { es: 'Nivel medio', en: 'Intermediate' } },
    { id: 'm5', city: 'barcelona', sport: 'run', title: { es: 'Bunkers del Carmel trail', en: 'Bunkers del Carmel trail' }, club: 'BCN Social Runners', when: { es: 'Sáb · 08:00', en: 'Sat · 8 am' }, going: 21, from: { es: 'Desde el hotel', en: 'From the hotel' } },
    { id: 'm6', city: 'lisboa', sport: 'run', title: { es: 'Colinas de Alfama', en: 'Alfama hills' }, club: 'Lisbon Run Collective', when: { es: 'Mar · 07:30', en: 'Tue · 7:30 am' }, going: 9, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm7', city: 'berlin', sport: 'gym', title: { es: 'HYROX training session', en: 'HYROX training session' }, club: 'Holmes Place', when: { es: 'Dom · 10:00', en: 'Sun · 10 am' }, going: 18, from: { es: 'Gym partner', en: 'Partner gym' } }
  ];

  var levels = [
    { id: 'explorer',   name: 'Explorer',   min: 0,  cities: 0,
      req: { es: 'Registro gratuito', en: 'Free sign-up' },
      perks: { es: ['Experiencias ACTIVE Local del hotel incluidas', 'Rutas del hotel en tu móvil'], en: ['ACTIVE Local hotel experiences included', 'Hotel running routes on your phone'] } },
    { id: 'active',     name: 'Active',     min: 2,  cities: 0,
      req: { es: '2 actividades', en: '2 activities' },
      perks: { es: ['Desayuno temprano de carga', 'Lavado exprés de ropa deportiva'], en: ['Early energy breakfast', 'Express sportswear laundry'] } },
    { id: 'challenger', name: 'Challenger', min: 5,  cities: 2,
      req: { es: '5 actividades en 2+ ciudades', en: '5 activities in 2+ cities' },
      perks: { es: ['Gym pass premium gratis (David Lloyd, Holmes Place)', 'Late check-out garantizado tras tu actividad', 'Custodia de bicicletas'], en: ['Free premium gym pass (David Lloyd, Holmes Place)', 'Guaranteed late check-out after your activity', 'Bike storage'] } },
    { id: 'ambassador', name: 'Ambassador', min: 10, cities: 3,
      req: { es: '10 actividades + eventos', en: '10 activities + events' },
      perks: { es: ['Inscripción gratis al ACTIVE Tour', 'Organiza tus propios eventos ACTIVE', 'Upgrade según disponibilidad'], en: ['Free ACTIVE Tour entry', 'Host your own ACTIVE events', 'Upgrade subject to availability'] } },
    { id: 'legend',     name: 'Legend',     min: Infinity, cities: 0, invite: true,
      req: { es: 'Por invitación', en: 'By invitation' },
      perks: { es: ['Kit técnico edición Legend', 'Experiencias VIP con partners'], en: ['Legend edition technical kit', 'VIP experiences with partners'] } }
  ];

  /* Objetivos e intereses que el usuario elige al registrarse */
  var goals = [
    { id: 'plans', kinds: ['local'], icon: 'compass', label: { es: 'Planes deportivos en mis viajes', en: 'Sports plans on my trips' } },
    { id: 'sports', kinds: ['local'], icon: 'route', label: { es: 'Practicar mis deportes allí donde vaya', en: 'Do my sports wherever I go' } },
    { id: 'events', kinds: ['race'], icon: 'event', label: { es: 'Viajar a maratones y grandes eventos', en: 'Travel to marathons and big events' } },
    { id: 'tour', kinds: ['tour'], icon: 'passport', label: { es: 'Llenar el pasaporte con el ACTIVE Tour', en: 'Fill my passport with the ACTIVE Tour' } },
    { id: 'community', kinds: ['local', 'tour'], icon: 'users', label: { es: 'Conocer gente que entrena', en: 'Meet people who train' } },
    { id: 'wellness', kinds: ['local'], icon: 'gym', label: { es: 'Gym premium y recuperación', en: 'Premium gym and recovery' } }
  ];
  var sports = [
    { id: 'run', label: { es: 'Running', en: 'Running' } }, { id: 'padel', label: { es: 'Pádel', en: 'Padel' } },
    { id: 'gym', label: { es: 'Gym / HYROX', en: 'Gym / HYROX' } }, { id: 'trail', label: { es: 'Trail', en: 'Trail' } },
    { id: 'cycling', label: { es: 'Ciclismo', en: 'Cycling' } }, { id: 'swim', label: { es: 'Natación', en: 'Swimming' } },
    { id: 'tennis', label: { es: 'Tenis', en: 'Tennis' } }, { id: 'yoga', label: { es: 'Yoga / pilates', en: 'Yoga / pilates' } },
    { id: 'triathlon', label: { es: 'Triatlón', en: 'Triathlon' } }, { id: 'surf', label: { es: 'Surf', en: 'Surf' } }
  ];

  // Perfil de demostración: 4 actividades en 3 ciudades (nivel Active) y una reserva en Sevilla pendiente.
  function demoState() {
    var d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
    var iso = d.toISOString().slice(0, 10);
    return {
      user: { name: 'Laura', demo: true, since: '2026-03-14' },
      prefs: { goals: ['plans', 'events', 'tour'], sports: ['run', 'padel'] },
      stamps: [
        { city: 'madrid', sport: 'run', activity: 'mad-retiro', date: '2026-04-26' },
        { city: 'madrid', sport: 'padel', activity: 'mad-padel', date: '2026-06-11' },
        { city: 'barcelona', sport: 'run', activity: 'bcn-barceloneta', date: '2026-07-18' },
        { city: 'lisboa', sport: 'run', activity: 'lis-belem', date: '2026-09-27' }
      ],
      bookings: [
        { id: 'AE-7Q4K2', activity: 'sev-triana', city: 'sevilla', checkIn: iso, nights: 2, guests: 1, room: 'superior', upsells: [], total: 334, status: 'upcoming', checkedIn: false, created: new Date().toISOString() }
      ],
      joined: ['m1']
    };
  }

  return { cities: cities, kinds: kinds, activities: activities, upsells: upsells, tour: tour, partners: partners, meetups: meetups, levels: levels, goals: goals, sports: sports, demoState: demoState };
})();
