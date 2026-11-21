/* ACTIVE by Eurostars · catálogo de demostración */
window.ACTIVE_DATA = (function () {
  function rooms(city, c, s, j) {
    var f = function (arr) { return arr.map(function (n) { return 'img/rooms/' + city + '-' + n + '.jpg'; }); };
    return { classic: f(c), superior: f(s), suite: f(j) };
  }
  var cities = [
    { id: 'madrid',    name: { es: 'Madrid', en: 'Madrid' },       country: { es: 'España', en: 'Spain' },      code: 'MAD', pilot: true,  hotel: 'Eurostars Madrid Tower',  stars: 5, price: 165, img: 'img/run4.jpg', rooms: rooms('madrid', [5, 3], [1, 2], [4, 2]) },
    { id: 'sevilla',   name: { es: 'Sevilla', en: 'Seville' },     country: { es: 'España', en: 'Spain' },      code: 'SVQ', pilot: true,  hotel: 'Eurostars Torre Sevilla', stars: 5, price: 139, img: 'img/run1.jpg', rooms: rooms('sevilla', [4, 5], [3, 4], [1, 2]) },
    { id: 'barcelona', name: { es: 'Barcelona', en: 'Barcelona' }, country: { es: 'España', en: 'Spain' },      code: 'BCN', pilot: false, hotel: 'Eurostars Grand Marina',  stars: 5, price: 189, img: 'img/run7.jpg', rooms: rooms('barcelona', [1, 2], [5, 4], [3, 6]) },
    { id: 'lisboa',    name: { es: 'Lisboa', en: 'Lisbon' },       country: { es: 'Portugal', en: 'Portugal' }, code: 'LIS', pilot: false, hotel: 'Eurostars Das Letras',    stars: 4, price: 129, img: 'img/surf1.jpg', rooms: rooms('lisboa', [1], [2], [2, 1]) },
    { id: 'berlin',    name: { es: 'Berlín', en: 'Berlin' },       country: { es: 'Alemania', en: 'Germany' },  code: 'BER', pilot: false, hotel: 'Eurostars Berlin',        stars: 4, price: 119, img: 'img/run3.jpg', rooms: rooms('berlin', [1, 5], [2, 4], [3, 2]) },
    { id: 'roma',      name: { es: 'Roma', en: 'Rome' },           country: { es: 'Italia', en: 'Italy' },      code: 'ROM', pilot: false, hotel: 'Eurostars Roma Aeterna',  stars: 4, price: 149, img: 'img/run8.jpg', rooms: rooms('roma', [1, 5], [2, 3], [4, 2]) },
    { id: 'praga',     name: { es: 'Praga', en: 'Prague' },        country: { es: 'Chequia', en: 'Czechia' },   code: 'PRG', pilot: false, hotel: 'Eurostars Thalia',        stars: 5, price: 125, img: 'img/run5.jpg', rooms: rooms('praga', [2], [1], [1, 2]) },
    { id: 'porto',     name: { es: 'Oporto', en: 'Porto' },        country: { es: 'Portugal', en: 'Portugal' }, code: 'OPO', pilot: false, hotel: 'Eurostars Porto Douro',   stars: 4, price: 115, img: 'img/surf4.jpg', rooms: rooms('porto', [2, 3], [1, 5], [4, 1]) }
  ];

  /* Los 3 tipos de evento (claves internas: local / race / tour) */
  var kinds = {
    local: { name: 'ACTIVE Play', icon: 'compass', img: 'img/surf1.jpg',
      tag: { es: 'Cada semana en la ciudad', en: 'Every week in the city' },
      short: { es: 'Running, surf, golf, pádel… organizado por el hotel', en: 'Running, surf, golf, padel… run by the hotel' },
      who: { es: 'Para quien viaja por ocio o trabajo y no quiere romper su rutina', en: 'For leisure and business travellers who keep their routine' },
      what: { es: 'Experiencias frecuentes y sencillas con partners locales: descubre la ciudad haciendo deporte.', en: 'Frequent, easy experiences with local partners: discover the city through sport.' } },
    race: { name: 'ACTIVE Live', icon: 'event', img: 'img/fans2.jpg',
      tag: { es: 'Los grandes eventos de la ciudad', en: 'The city’s big sports events' },
      short: { es: 'Maratones, HYROX, Premier Padel, ATP… compite o anima', en: 'Marathons, HYROX, Premier Padel, ATP… compete or cheer' },
      who: { es: 'Para quien viaja a competir o a vivir un gran evento como público', en: 'For those travelling to compete or watch a big event' },
      what: { es: 'El hotel se prepara para el evento con un plan especial y extras que eliges al reservar. Solo en reserva directa.', en: 'The hotel gets event-ready with a special plan and extras you choose when booking. Direct booking only.' } },
    tour: { name: 'ACTIVE Tour', icon: 'trophy', img: 'img/run10.jpg',
      tag: { es: 'Circuitos por deporte', en: 'Circuits by sport' },
      short: { es: 'Running, Pádel o Fitness: elige tu circuito', en: 'Running, Padel or Fitness: pick your circuit' },
      who: { es: 'Para quien quiere retarse, sumar puntos y viajar por la red Eurostars', en: 'For those who want a challenge, points and travel across Eurostars' },
      what: { es: 'Circuitos de Grupo Hotusa, uno por deporte: una parada en cada ciudad, ranking propio y Master Final.', en: 'Grupo Hotusa circuits, one per sport: a stop in each city, its own ranking and a Master Final.' } }
  };

  /* Deportes: cualquier deporte cuenta */
  var sports = [
    { id: 'run', img: 'img/run7.jpg', label: { es: 'Running', en: 'Running' } },
    { id: 'padel', img: 'img/padel2.jpg', label: { es: 'Pádel', en: 'Padel' } },
    { id: 'surf', img: 'img/surf1.jpg', label: { es: 'Surf', en: 'Surf' } },
    { id: 'trail', img: 'img/trek1.jpg', label: { es: 'Trekking', en: 'Trekking' } },
    { id: 'golf', img: 'img/golf1.jpg', label: { es: 'Golf', en: 'Golf' } },
    { id: 'cycling', img: 'img/bike1.jpg', label: { es: 'Bici', en: 'Cycling' } },
    { id: 'sup', img: 'img/sup1.jpg', label: { es: 'Paddle surf', en: 'Paddle board' } },
    { id: 'gym', img: 'img/fit1.jpg', label: { es: 'Gym & HYROX', en: 'Gym & HYROX' } },
    { id: 'tennis', img: 'img/tennis1.jpg', label: { es: 'Tenis', en: 'Tennis' } },
    { id: 'yoga', img: 'img/yoga1.jpg', label: { es: 'Yoga', en: 'Yoga' } },
    { id: 'pilates', img: 'img/pilates1.jpg', label: { es: 'Pilates', en: 'Pilates' } },
    { id: 'swim', img: 'img/swim1.jpg', label: { es: 'Natación', en: 'Swimming' } }
  ];

  function A(o) { o.spots = o.spots || 20; o.taken = o.taken || 6; o.level = o.level || { es: 'Todos los niveles', en: 'All levels' }; return o; }
  var activities = [
    /* ================= ACTIVE PLAY ================= */
    A({ id: 'sev-triana', kind: 'local', city: 'sevilla', sport: 'run', img: 'img/run1.jpg',
      title: { es: 'Run Tour Triana al amanecer', en: 'Triana Sunrise Run Tour' }, partner: 'Triana Run Club', distance: '7 km',
      when: { es: 'Sábados · 07:30', en: 'Saturdays · 7:30 am' }, meet: { es: 'Lobby Eurostars Torre Sevilla · 07:15', en: 'Eurostars Torre Sevilla lobby · 7:15 am' },
      price: 0, taken: 13, desc: { es: 'Cruza el Guadalquivir por el puente de Triana con un club local, recorre la calle Betis y vuelve al hotel para compartir un café en el vestíbulo.', en: 'Cross the Guadalquivir over the Triana bridge with a local club, run along Calle Betis and come back for a coffee in the lobby.' } }),
    A({ id: 'sev-padel', kind: 'local', city: 'sevilla', sport: 'padel', img: 'img/padel1.jpg',
      title: { es: 'Pádel social con Playtomic', en: 'Social padel with Playtomic' }, partner: 'Playtomic · Club Pádel Cartuja', partnerId: 'playtomic', distance: '2 h', level: { es: 'Intermedio', en: 'Intermediate' },
      when: { es: 'Viernes · 19:00', en: 'Fridays · 7 pm' }, meet: { es: 'Club Pádel Cartuja · traslado desde el hotel', en: 'Club Pádel Cartuja · hotel transfer' },
      price: 15, spots: 16, taken: 11, desc: { es: 'Formato americano con huéspedes y jugadores locales. Pala y bolas incluidas.', en: 'Americano with guests and local players. Racket and balls included.' } }),
    A({ id: 'sev-sup', kind: 'local', city: 'sevilla', sport: 'sup', img: 'img/sup2.jpg',
      title: { es: 'Paddle surf en el Guadalquivir al atardecer', en: 'Sunset paddle board on the Guadalquivir' }, partner: 'Club náutico local (partner propuesto)', distance: '90 min',
      when: { es: 'Jueves y domingos · 19:00', en: 'Thu & Sun · 7 pm' }, meet: { es: 'Embarcadero junto a Torre Sevilla', en: 'Pier next to Torre Sevilla' },
      price: 20, spots: 12, taken: 5, desc: { es: 'Remonta el río con la Torre del Oro y Triana de fondo. Tabla, remo y chaleco incluidos.', en: 'Paddle up the river with Torre del Oro and Triana as backdrop. Board, paddle and vest included.' } }),
    A({ id: 'sev-golf', kind: 'local', city: 'sevilla', sport: 'golf', img: 'img/golf4.jpg', stampName: 'R.C. GOLF SEVILLA',
      title: { es: 'Green fee · Real Club de Golf de Sevilla', en: 'Green fee · Real Club de Golf de Sevilla' }, partner: 'Real Club de Golf de Sevilla (campo propuesto)', distance: '18 hoyos', level: { es: 'Hándicap recomendado', en: 'Handicap recommended' },
      when: { es: 'Todos los días · salidas por la mañana', en: 'Every day · morning tee times' }, meet: { es: 'Traslado desde el hotel (20 min)', en: 'Hotel transfer (20 min)' },
      price: 85, spots: 8, taken: 3, desc: { es: 'Descubre uno de los campos de referencia de Andalucía y consigue el sello del campo en tu Sport Passport.', en: 'Discover one of Andalusia’s reference courses and earn the course stamp in your Sport Passport.' } }),
    A({ id: 'mad-retiro', kind: 'local', city: 'madrid', sport: 'run', img: 'img/run4.jpg',
      title: { es: 'Run Tour Retiro – Madrid Río', en: 'Retiro – Madrid Río Run Tour' }, partner: 'Madrid Runners Crew', distance: '10 km',
      when: { es: 'Domingos · 08:00', en: 'Sundays · 8 am' }, meet: { es: 'Lobby Eurostars Madrid Tower · 07:30 (traslado)', en: 'Eurostars Madrid Tower lobby · 7:30 am (transfer)' },
      price: 0, spots: 25, taken: 18, desc: { es: 'De la Puerta de Alcalá al Retiro y bajada hasta Madrid Río. Grupos por ritmo.', en: 'From Puerta de Alcalá through Retiro down to Madrid Río. Groups by pace.' } }),
    A({ id: 'mad-padel', kind: 'local', city: 'madrid', sport: 'padel', img: 'img/padel2.jpg',
      title: { es: 'Pádel social BamVolea', en: 'BamVolea social padel' }, partner: 'BamVolea · Ciudad de la Raqueta', partnerId: 'bamvolea', distance: '90 min', level: { es: 'Iniciación – medio', en: 'Beginner – intermediate' },
      when: { es: 'Martes y jueves · 20:00', en: 'Tue & Thu · 8 pm' }, meet: { es: 'Lobby Eurostars Madrid Tower · 19:30 (traslado)', en: 'Eurostars Madrid Tower lobby · 7:30 pm (transfer)' },
      price: 12, spots: 8, taken: 5, desc: { es: 'Partidos mixtos por nivel para huéspedes que viajan por trabajo. Pala incluida.', en: 'Level-matched games for business travellers. Racket included.' } }),
    A({ id: 'mad-trek', kind: 'local', city: 'madrid', sport: 'trail', img: 'img/trek1.jpg',
      title: { es: 'Trekking Siete Picos · Guadarrama', en: 'Siete Picos trek · Guadarrama' }, partner: 'Guías de montaña locales (partner propuesto)', distance: '12 km · 600 m+', level: { es: 'Medio', en: 'Intermediate' },
      when: { es: 'Sábados · 08:00', en: 'Saturdays · 8 am' }, meet: { es: 'Lobby Eurostars Madrid Tower (traslado en minibús)', en: 'Eurostars Madrid Tower lobby (minibus)' },
      price: 15, spots: 14, taken: 7, desc: { es: 'Escápate de la ciudad a la Sierra de Guadarrama con guía, picnic y vuelta al hotel a media tarde.', en: 'Escape to the Guadarrama mountains with a guide and picnic, back at the hotel mid-afternoon.' } }),
    A({ id: 'mad-golf', kind: 'local', city: 'madrid', sport: 'golf', img: 'img/golf1.jpg', stampName: 'CLUB DE CAMPO',
      title: { es: 'Green fee · Club de Campo Villa de Madrid', en: 'Green fee · Club de Campo Villa de Madrid' }, partner: 'Club de Campo Villa de Madrid (campo propuesto)', distance: '18 hoyos', level: { es: 'Hándicap recomendado', en: 'Handicap recommended' },
      when: { es: 'Todos los días', en: 'Every day' }, meet: { es: 'Traslado desde el hotel (25 min)', en: 'Hotel transfer (25 min)' },
      price: 75, spots: 8, taken: 2, desc: { es: 'Juega a 15 minutos del centro y suma el sello del campo a tu pasaporte.', en: 'Play 15 minutes from downtown and add the course stamp to your passport.' } }),
    A({ id: 'mad-yoga', kind: 'local', city: 'madrid', sport: 'yoga', img: 'img/yoga1.jpg',
      title: { es: 'Sunrise yoga en el Retiro', en: 'Sunrise yoga in Retiro park' }, partner: 'Instructora local (partner propuesto)', distance: '60 min',
      when: { es: 'Miércoles y sábados · 07:30', en: 'Wed & Sat · 7:30 am' }, meet: { es: 'Puerta de Alcalá', en: 'Puerta de Alcalá' },
      price: 0, taken: 9, desc: { es: 'Empieza el día con calma antes de tus reuniones. Esterilla incluida (Decathlon).', en: 'Start your day calmly before meetings. Mat included (Decathlon).' } }),
    A({ id: 'mad-pilates', kind: 'local', city: 'madrid', sport: 'pilates', img: 'img/pilates1.jpg',
      title: { es: 'Reformer Pilates exprés', en: 'Express Reformer Pilates' }, partner: 'Estudio boutique de pilates (partner propuesto)', distance: '50 min',
      when: { es: 'Lun–vie · 07:00 y 19:30', en: 'Mon–Fri · 7 am & 7:30 pm' }, meet: { es: 'Estudio a 5 min del hotel', en: 'Studio 5 min from the hotel' },
      price: 22, freeFrom: 'challenger', spots: 10, taken: 4, desc: { es: 'Clase en máquina reformer en grupo reducido. Ideal antes o después de una jornada de trabajo: core, postura y movilidad tras horas de avión o reuniones.', en: 'Small-group reformer class. Perfect before or after a working day: core, posture and mobility after flights or meetings.' } }),
    A({ id: 'bcn-pilates', kind: 'local', city: 'barcelona', sport: 'pilates', img: 'img/pilates3.jpg',
      title: { es: 'Mat Pilates frente al mar', en: 'Seafront mat Pilates' }, partner: 'Instructora local (partner propuesto)', distance: '55 min',
      when: { es: 'Martes y domingos · 08:30', en: 'Tue & Sun · 8:30 am' }, meet: { es: 'Terraza del Eurostars Grand Marina', en: 'Eurostars Grand Marina terrace' },
      price: 0, taken: 7, desc: { es: 'Pilates en esterilla con vistas al puerto. Sin material: solo ven con ropa cómoda.', en: 'Mat Pilates overlooking the harbour. No gear needed, just comfy clothes.' } }),
    A({ id: 'lis-pilates', kind: 'local', city: 'lisboa', sport: 'pilates', img: 'img/pilates2.jpg',
      title: { es: 'Reformer Pilates en Chiado', en: 'Reformer Pilates in Chiado' }, partner: 'Estudio local de pilates (partner propuesto)', distance: '50 min',
      when: { es: 'Mié, vie y sáb · 09:00', en: 'Wed, Fri & Sat · 9 am' }, meet: { es: 'Estudio a 8 min a pie del hotel', en: 'Studio an 8-min walk from the hotel' },
      price: 20, freeFrom: 'challenger', spots: 8, taken: 3, desc: { es: 'Recupera el cuerpo tras surfear o patear Lisboa con una sesión de reformer en grupo reducido.', en: 'Reset your body after surfing or walking Lisbon with a small-group reformer session.' } }),
    A({ id: 'mad-dl-recovery', kind: 'local', city: 'madrid', sport: 'gym', img: 'img/fit2.jpg',
      title: { es: 'Day Pass David Lloyd La Finca', en: 'David Lloyd La Finca Day Pass' }, partner: 'David Lloyd La Finca', partnerId: 'davidlloyd', distance: { es: 'Día completo', en: 'Full day' },
      when: { es: 'Todos los días · 07:00–22:00', en: 'Every day · 7 am–10 pm' }, meet: { es: 'Acceso con tu ACTIVE Pass en recepción del club', en: 'Access with your ACTIVE Pass at the club' },
      price: 18, freeFrom: 'challenger', exclusive: true, spots: 30, taken: 12, desc: { es: 'Club premium normalmente reservado a socios: gimnasio, clases, piscina y recuperación. Abierto solo para huéspedes ACTIVE.', en: 'Members-only premium club: gym, classes, pool and recovery. Open only to ACTIVE guests.' } }),
    A({ id: 'bcn-barceloneta', kind: 'local', city: 'barcelona', sport: 'run', img: 'img/run7.jpg',
      title: { es: 'Seafront Run Barceloneta', en: 'Barceloneta Seafront Run' }, partner: 'BCN Social Runners', distance: '8 km',
      when: { es: 'Sábados · 08:00', en: 'Saturdays · 8 am' }, meet: { es: 'Lobby Eurostars Grand Marina · 07:45', en: 'Eurostars Grand Marina lobby · 7:45 am' },
      price: 0, spots: 25, taken: 9, desc: { es: 'Del Port Vell al Port Olímpic por el paseo marítimo. Baño opcional al final.', en: 'From Port Vell to Port Olímpic along the seafront. Optional swim at the end.' } }),
    A({ id: 'bcn-sup', kind: 'local', city: 'barcelona', sport: 'sup', img: 'img/sup1.jpg',
      title: { es: 'Paddle surf al amanecer', en: 'Sunrise paddle board' }, partner: 'Escuela de paddle surf de la Barceloneta (partner propuesto)', distance: '75 min',
      when: { es: 'Martes, jueves y sábados · 07:30', en: 'Tue, Thu & Sat · 7:30 am' }, meet: { es: 'Playa de Sant Sebastià (5 min del hotel)', en: 'Sant Sebastià beach (5 min from hotel)' },
      price: 25, spots: 10, taken: 4, desc: { es: 'Mar en calma, skyline al fondo y desayuno después en el hotel.', en: 'Calm sea, skyline view and breakfast at the hotel afterwards.' } }),
    A({ id: 'bcn-swim', kind: 'local', city: 'barcelona', sport: 'swim', img: 'img/swim1.jpg',
      title: { es: 'Aguas abiertas en la Barceloneta', en: 'Open water swim at Barceloneta' }, partner: 'Club de natación local (partner propuesto)', distance: '1,5 km', level: { es: 'Nadador habitual', en: 'Regular swimmer' },
      when: { es: 'Domingos · 08:30 (abril–octubre)', en: 'Sundays · 8:30 am (April–October)' }, meet: { es: 'Playa de Sant Sebastià', en: 'Sant Sebastià beach' },
      price: 10, spots: 15, taken: 5, desc: { es: 'Nado guiado con boya de seguridad y kayak de apoyo.', en: 'Guided swim with safety buoy and kayak support.' } }),
    A({ id: 'bcn-collserola', kind: 'local', city: 'barcelona', sport: 'trail', img: 'img/trek3.jpg',
      title: { es: 'Trail running en Collserola', en: 'Collserola trail run' }, partner: 'BCN Social Runners', distance: '14 km · 450 m+', level: { es: 'Medio', en: 'Intermediate' },
      when: { es: 'Domingos · 08:00', en: 'Sundays · 8 am' }, meet: { es: 'Lobby Eurostars Grand Marina (traslado)', en: 'Eurostars Grand Marina lobby (transfer)' },
      price: 0, taken: 8, desc: { es: 'La propuesta más votada por la comunidad: senderos con vistas a toda Barcelona.', en: 'The community’s most-voted idea: trails overlooking all of Barcelona.' } }),
    A({ id: 'bcn-padel', kind: 'local', city: 'barcelona', sport: 'padel', img: 'img/padel3.jpg',
      title: { es: 'Pádel indoor BamVolea', en: 'BamVolea indoor padel' }, partner: 'BamVolea · Hospitalet Padel Indoor', partnerId: 'bamvolea', distance: '90 min', level: { es: 'Intermedio', en: 'Intermediate' },
      when: { es: 'Miércoles · 19:30', en: 'Wednesdays · 7:30 pm' }, meet: { es: 'Lobby Eurostars Grand Marina · 19:00 (traslado)', en: 'Eurostars Grand Marina lobby · 7 pm (transfer)' },
      price: 14, spots: 8, taken: 6, desc: { es: 'Americano en pistas indoor climatizadas. Llueva o haga sol.', en: 'Americano on climate-controlled indoor courts. Rain or shine.' } }),
    A({ id: 'bcn-dl-turo', kind: 'local', city: 'barcelona', sport: 'gym', img: 'img/fit1.jpg',
      title: { es: 'Day Pass David Lloyd Turó', en: 'David Lloyd Turó Day Pass' }, partner: 'David Lloyd Club Turó', partnerId: 'davidlloyd', distance: { es: 'Día completo', en: 'Full day' },
      when: { es: 'Todos los días · 07:00–22:00', en: 'Every day · 7 am–10 pm' }, meet: { es: 'Acceso con tu ACTIVE Pass en recepción del club', en: 'Access with your ACTIVE Pass at the club' },
      price: 18, freeFrom: 'challenger', exclusive: true, spots: 30, taken: 9, desc: { es: 'Gimnasio, piscinas y estudios en un club privado de referencia, abierto solo para huéspedes ACTIVE.', en: 'Gym, pools and studios at a leading private club, open only to ACTIVE guests.' } }),
    A({ id: 'lis-belem', kind: 'local', city: 'lisboa', sport: 'run', img: 'img/run2.jpg',
      title: { es: 'Run Tour Belém junto al Tajo', en: 'Belém Run Tour by the Tagus' }, partner: 'Lisbon Run Collective', distance: '9 km',
      when: { es: 'Domingos · 08:30', en: 'Sundays · 8:30 am' }, meet: { es: 'Lobby Eurostars Das Letras · 08:00', en: 'Eurostars Das Letras lobby · 8 am' },
      price: 0, taken: 7, desc: { es: 'Del Cais do Sodré a la Torre de Belém junto al río.', en: 'From Cais do Sodré to Belém Tower along the river.' } }),
    A({ id: 'lis-surf', kind: 'local', city: 'lisboa', sport: 'surf', img: 'img/surf1.jpg',
      title: { es: 'Clase de surf en Carcavelos', en: 'Surf lesson at Carcavelos' }, partner: 'Escuela de surf de Carcavelos (partner propuesto)', distance: '2 h', level: { es: 'Iniciación', en: 'Beginner' },
      when: { es: 'Sábados y domingos · 10:00', en: 'Sat & Sun · 10 am' }, meet: { es: 'Tren desde Cais do Sodré (25 min)', en: 'Train from Cais do Sodré (25 min)' },
      price: 35, spots: 10, taken: 6, desc: { es: 'La ola más cercana a Lisboa. Tabla, neopreno y monitor incluidos.', en: 'The closest wave to Lisbon. Board, wetsuit and coach included.' } }),
    A({ id: 'lis-sintra', kind: 'local', city: 'lisboa', sport: 'trail', img: 'img/trek2.jpg',
      title: { es: 'Trail por la Sierra de Sintra', en: 'Sintra hills trail' }, partner: 'Guías locales (partner propuesto)', distance: '11 km · 500 m+', level: { es: 'Medio', en: 'Intermediate' },
      when: { es: 'Sábados · 08:30', en: 'Saturdays · 8:30 am' }, meet: { es: 'Lobby Eurostars Das Letras (traslado)', en: 'Eurostars Das Letras lobby (transfer)' },
      price: 20, spots: 12, taken: 4, desc: { es: 'Bosques, palacios y vistas al Atlántico en una mañana.', en: 'Forests, palaces and Atlantic views in one morning.' } }),
    A({ id: 'lis-golf', kind: 'local', city: 'lisboa', sport: 'golf', img: 'img/golf1.jpg', stampName: 'OITAVOS DUNES',
      title: { es: 'Green fee · Oitavos Dunes (Cascais)', en: 'Green fee · Oitavos Dunes (Cascais)' }, partner: 'Oitavos Dunes (campo propuesto)', distance: '18 hoyos', level: { es: 'Hándicap recomendado', en: 'Handicap recommended' },
      when: { es: 'Todos los días', en: 'Every day' }, meet: { es: 'Traslado desde el hotel (35 min)', en: 'Hotel transfer (35 min)' },
      price: 120, spots: 8, taken: 2, desc: { es: 'Links junto al Atlántico entre dunas y pinares. Sello del campo incluido.', en: 'Atlantic links among dunes and pines. Course stamp included.' } }),
    A({ id: 'lis-holmes', kind: 'local', city: 'lisboa', sport: 'gym', img: 'img/fit2.jpg',
      title: { es: 'Gym Pass Holmes Place Lisboa', en: 'Holmes Place Lisbon Gym Pass' }, partner: 'Holmes Place', partnerId: 'holmesplace', distance: { es: 'Día completo', en: 'Full day' },
      when: { es: 'Todos los días', en: 'Every day' }, meet: { es: 'Acceso con tu ACTIVE Pass', en: 'Access with your ACTIVE Pass' },
      price: 15, freeFrom: 'challenger', exclusive: true, spots: 30, desc: { es: 'Club premium de fitness y spa, normalmente solo para socios.', en: 'Premium fitness and spa club, normally members-only.' } }),
    A({ id: 'por-douro', kind: 'local', city: 'porto', sport: 'run', img: 'img/run6.jpg',
      title: { es: 'Run Tour Ribeira – Foz', en: 'Ribeira – Foz Run Tour' }, partner: 'Porto Run Club', distance: '10 km',
      when: { es: 'Sábados · 08:30', en: 'Saturdays · 8:30 am' }, meet: { es: 'Lobby Eurostars Porto Douro', en: 'Eurostars Porto Douro lobby' },
      price: 0, taken: 8, desc: { es: 'Desde la Ribeira hasta la desembocadura del Duero en Foz.', en: 'From Ribeira to where the Douro meets the sea at Foz.' } }),
    A({ id: 'por-surf', kind: 'local', city: 'porto', sport: 'surf', img: 'img/surf4.jpg',
      title: { es: 'Surf en Matosinhos', en: 'Surf at Matosinhos' }, partner: 'Escuela de surf de Matosinhos (partner propuesto)', distance: '2 h', level: { es: 'Iniciación – medio', en: 'Beginner – intermediate' },
      when: { es: 'Todos los días · 10:00', en: 'Every day · 10 am' }, meet: { es: 'Metro desde el hotel (25 min)', en: 'Metro from the hotel (25 min)' },
      price: 30, spots: 10, taken: 5, desc: { es: 'La playa urbana de surf de Oporto, ideal para empezar.', en: 'Porto’s urban surf beach, ideal to get started.' } }),
    A({ id: 'por-golf', kind: 'local', city: 'porto', sport: 'golf', img: 'img/golf4.jpg', stampName: 'OPORTO GOLF CLUB',
      title: { es: 'Green fee · Oporto Golf Club (Espinho)', en: 'Green fee · Oporto Golf Club (Espinho)' }, partner: 'Oporto Golf Club (campo propuesto)', distance: '18 hoyos', level: { es: 'Hándicap recomendado', en: 'Handicap recommended' },
      when: { es: 'Todos los días', en: 'Every day' }, meet: { es: 'Traslado desde el hotel (30 min)', en: 'Hotel transfer (30 min)' },
      price: 70, spots: 8, taken: 1, desc: { es: 'Uno de los clubes de golf más antiguos de la Península, junto al mar.', en: 'One of the oldest golf clubs on the Iberian Peninsula, by the sea.' } }),
    A({ id: 'ber-tiergarten', kind: 'local', city: 'berlin', sport: 'run', img: 'img/run3.jpg',
      title: { es: 'Run Tour Tiergarten – Brandeburgo', en: 'Tiergarten – Brandenburg Run Tour' }, partner: 'Berlin Run Club', distance: '8 km',
      when: { es: 'Domingos · 09:00', en: 'Sundays · 9 am' }, meet: { es: 'Lobby Eurostars Berlin', en: 'Eurostars Berlin lobby' },
      price: 0, taken: 8, desc: { es: 'Tiergarten, Puerta de Brandeburgo y el Reichstag a ritmo social.', en: 'Tiergarten, Brandenburg Gate and the Reichstag at a social pace.' } }),
    A({ id: 'ber-bike', kind: 'local', city: 'berlin', sport: 'cycling', img: 'img/bike4.jpg',
      title: { es: 'Bike tour del Muro de Berlín', en: 'Berlin Wall bike tour' }, partner: 'Bike tours locales (partner propuesto)', distance: '25 km',
      when: { es: 'Sábados · 10:00', en: 'Saturdays · 10 am' }, meet: { es: 'Lobby Eurostars Berlin', en: 'Eurostars Berlin lobby' },
      price: 20, spots: 14, taken: 6, desc: { es: 'Sigue el trazado del Muro de East Side Gallery a Mauerpark. Bici incluida.', en: 'Follow the Wall from East Side Gallery to Mauerpark. Bike included.' } }),
    A({ id: 'rom-antica', kind: 'local', city: 'roma', sport: 'run', img: 'img/run8.jpg',
      title: { es: 'Roma Antica Run', en: 'Roma Antica Run' }, partner: 'Run Rome Club', distance: '6 km',
      when: { es: 'Sábados · 07:00', en: 'Saturdays · 7 am' }, meet: { es: 'Lobby Eurostars Roma Aeterna', en: 'Eurostars Roma Aeterna lobby' },
      price: 0, taken: 10, desc: { es: 'Coliseo, Foro y Circo Máximo antes de que llegue el turismo.', en: 'Colosseum, Forum and Circus Maximus before the crowds.' } }),
    A({ id: 'rom-appia', kind: 'local', city: 'roma', sport: 'cycling', img: 'img/bike3.jpg',
      title: { es: 'Bici por la Via Appia Antica', en: 'Via Appia Antica bike ride' }, partner: 'Bike tours locales (partner propuesto)', distance: '22 km',
      when: { es: 'Domingos · 09:00', en: 'Sundays · 9 am' }, meet: { es: 'Lobby Eurostars Roma Aeterna (traslado)', en: 'Eurostars Roma Aeterna lobby (transfer)' },
      price: 25, spots: 12, taken: 5, desc: { es: 'Pedalea sobre la calzada romana entre acueductos y catacumbas.', en: 'Ride the Roman road among aqueducts and catacombs.' } }),
    A({ id: 'rom-tennis', kind: 'local', city: 'roma', sport: 'tennis', img: 'img/tennis2.jpg',
      title: { es: 'Tenis en tierra batida', en: 'Clay court tennis' }, partner: 'Club de tenis local (partner propuesto)', distance: '90 min', level: { es: 'Medio', en: 'Intermediate' },
      when: { es: 'Martes y jueves · 19:00', en: 'Tue & Thu · 7 pm' }, meet: { es: 'Traslado desde el hotel', en: 'Hotel transfer' },
      price: 18, spots: 8, taken: 3, desc: { es: 'Juega en la tierra batida de la capital del tenis italiano.', en: 'Play on clay in the capital of Italian tennis.' } }),
    A({ id: 'pra-bridges', kind: 'local', city: 'praga', sport: 'run', img: 'img/run5.jpg',
      title: { es: 'Run de los puentes del Moldava', en: 'Vltava Bridges Run' }, partner: 'Prague Morning Runners', distance: '8 km',
      when: { es: 'Domingos · 08:00', en: 'Sundays · 8 am' }, meet: { es: 'Lobby Eurostars Thalia', en: 'Eurostars Thalia lobby' },
      price: 0, desc: { es: 'Puente de Carlos, Malá Strana y la orilla del Moldava.', en: 'Charles Bridge, Malá Strana and the Vltava riverbank.' } }),
    A({ id: 'pra-sup', kind: 'local', city: 'praga', sport: 'sup', img: 'img/sup2.jpg',
      title: { es: 'Paddle surf en el Moldava', en: 'Paddle board on the Vltava' }, partner: 'Club náutico local (partner propuesto)', distance: '90 min',
      when: { es: 'Sábados · 17:00 (mayo–septiembre)', en: 'Saturdays · 5 pm (May–September)' }, meet: { es: 'Isla de Střelecký', en: 'Střelecký Island' },
      price: 20, spots: 10, taken: 3, desc: { es: 'Praga desde el agua, con el castillo al fondo.', en: 'Prague from the water, with the castle in the background.' } }),

    /* ================= ACTIVE LIVE: grandes eventos ================= */
    A({ id: 'bcn-marathon', month: '2027-03', kind: 'race', role: 'compete', ups: 'race', city: 'barcelona', sport: 'run', img: 'img/run10.jpg',
      title: { es: 'Maratón de Barcelona', en: 'Barcelona Marathon' }, partner: 'Zurich Marató de Barcelona (colaborador propuesto)', distance: '42 km', level: { es: 'Corredores', en: 'Runners' },
      when: { es: 'Marzo 2027', en: 'March 2027' }, meet: { es: 'Eurostars Grand Marina · centro de operaciones del corredor', en: 'Eurostars Grand Marina · runner HQ' },
      price: 0, spots: 60, taken: 38, bibNote: true, desc: { es: 'Plan especial del hotel: shakeout el sábado, desayuno de carga, late check-out y recuperación.', en: 'Special hotel plan: Saturday shakeout, carb breakfast, late check-out and recovery.' } }),
    A({ id: 'sev-marathon', month: '2027-02', kind: 'race', role: 'compete', ups: 'race', city: 'sevilla', sport: 'run', img: 'img/run1.jpg',
      title: { es: 'Maratón de Sevilla', en: 'Seville Marathon' }, partner: 'Zurich Maratón de Sevilla (colaborador propuesto)', distance: '42 km', level: { es: 'Corredores', en: 'Runners' },
      when: { es: 'Febrero 2027', en: 'February 2027' }, meet: { es: 'Eurostars Torre Sevilla', en: 'Eurostars Torre Sevilla' },
      price: 0, spots: 60, taken: 21, bibNote: true, desc: { es: 'Una de las maratones más llanas de Europa, con la logística resuelta desde el hotel piloto.', en: 'One of Europe’s flattest marathons, logistics sorted from the pilot hotel.' } }),
    A({ id: 'mad-marathon', month: '2027-04', kind: 'race', role: 'compete', ups: 'race', city: 'madrid', sport: 'run', img: 'img/run4.jpg',
      title: { es: 'Maratón y Medio de Madrid', en: 'Madrid Marathon & Half' }, partner: 'Zurich Rock’n’Roll Madrid (colaborador propuesto)', distance: '42 / 21 / 10 km', level: { es: 'Corredores', en: 'Runners' },
      when: { es: 'Abril 2027', en: 'April 2027' }, meet: { es: 'Recogida de dorsal en el hotel', en: 'Bib pick-up at the hotel' },
      price: 0, spots: 60, taken: 41, bibNote: true, desc: { es: 'Desayuno de carga, late check-out, bolsa de recuperación y lavado exprés.', en: 'Carb breakfast, late check-out, recovery bag and express laundry.' } }),
    A({ id: 'lis-half', month: '2027-03', kind: 'race', role: 'compete', ups: 'race', city: 'lisboa', sport: 'run', img: 'img/run2.jpg',
      title: { es: 'Media Maratón de Lisboa', en: 'Lisbon Half Marathon' }, partner: 'EDP Meia Maratona de Lisboa (colaborador propuesto)', distance: '21 km', level: { es: 'Corredores', en: 'Runners' },
      when: { es: 'Marzo 2027', en: 'March 2027' }, meet: { es: 'Eurostars Das Letras', en: 'Eurostars Das Letras' },
      price: 0, spots: 40, taken: 17, bibNote: true, desc: { es: 'Salida sobre el puente 25 de Abril: una de las medias más espectaculares del mundo.', en: 'Start on the 25 de Abril bridge: one of the world’s most spectacular halves.' } }),
    A({ id: 'rom-marathon', month: '2027-03', kind: 'race', role: 'compete', ups: 'race', city: 'roma', sport: 'run', img: 'img/run8.jpg',
      title: { es: 'Maratón de Roma', en: 'Rome Marathon' }, partner: 'Maratona di Roma (colaborador propuesto)', distance: '42 km', level: { es: 'Corredores', en: 'Runners' },
      when: { es: 'Marzo 2027', en: 'March 2027' }, meet: { es: 'Eurostars Roma Aeterna', en: 'Eurostars Roma Aeterna' },
      price: 0, spots: 40, taken: 14, bibNote: true, desc: { es: '42 km entre monumentos con salida y meta junto al Coliseo.', en: '42 km through monuments, starting and finishing by the Colosseum.' } }),
    A({ id: 'pra-marathon', month: '2027-05', kind: 'race', role: 'compete', ups: 'race', city: 'praga', sport: 'run', img: 'img/run5.jpg',
      title: { es: 'Maratón de Praga', en: 'Prague Marathon' }, partner: 'Prague International Marathon (colaborador propuesto)', distance: '42 km', level: { es: 'Corredores', en: 'Runners' },
      when: { es: 'Mayo 2027', en: 'May 2027' }, meet: { es: 'Eurostars Thalia', en: 'Eurostars Thalia' },
      price: 0, spots: 40, taken: 12, bibNote: true, desc: { es: 'Recorrido rápido por el casco histórico y la orilla del Moldava.', en: 'Fast course through the old town and along the Vltava.' } }),
    A({ id: 'ber-marathon', month: '2027-09', kind: 'race', role: 'compete', ups: 'race', city: 'berlin', sport: 'run', img: 'img/run3.jpg',
      title: { es: 'Maratón de Berlín', en: 'Berlin Marathon' }, partner: 'BMW Berlin-Marathon (colaborador propuesto)', distance: '42 km', level: { es: 'Corredores', en: 'Runners' },
      when: { es: 'Septiembre 2027', en: 'September 2027' }, meet: { es: 'Shakeout desde el hotel el sábado', en: 'Saturday shakeout from the hotel' },
      price: 0, spots: 40, taken: 22, bibNote: true, desc: { es: 'Una de las maratones más rápidas del mundo con la logística resuelta.', en: 'One of the world’s fastest marathons with logistics sorted.' } }),
    A({ id: 'mad-hyrox', kind: 'race', role: 'compete', ups: 'fitness', city: 'madrid', sport: 'gym', img: 'img/fit1.jpg',
      title: { es: 'HYROX Madrid', en: 'HYROX Madrid' }, partner: 'HYROX (partner)', partnerId: 'hyrox', distance: '8 × 1 km + 8 estaciones', level: { es: 'Individual, dobles o relevos', en: 'Singles, doubles or relay' },
      when: { es: 'Fecha según calendario oficial HYROX', en: 'Date per official HYROX calendar' }, meet: { es: 'Eurostars Madrid Tower · traslado al recinto', en: 'Eurostars Madrid Tower · venue transfer' },
      price: 0, spots: 40, taken: 19, bibNote: true, desc: { es: 'Plan fitness racing: simulación previa en gym partner, desayuno proteico y fisio post-carrera.', en: 'Fitness racing plan: pre-race simulation at a partner gym, protein breakfast and post-race physio.' } }),
    A({ id: 'ber-hyrox', kind: 'race', role: 'compete', ups: 'fitness', city: 'berlin', sport: 'gym', img: 'img/fit2.jpg',
      title: { es: 'HYROX Berlín', en: 'HYROX Berlin' }, partner: 'HYROX (partner)', partnerId: 'hyrox', distance: '8 × 1 km + 8 estaciones', level: { es: 'Individual, dobles o relevos', en: 'Singles, doubles or relay' },
      when: { es: 'Fecha según calendario oficial HYROX', en: 'Date per official HYROX calendar' }, meet: { es: 'Eurostars Berlin · traslado al recinto', en: 'Eurostars Berlin · venue transfer' },
      price: 0, spots: 40, taken: 15, bibNote: true, desc: { es: 'Compite en una de las grandes pruebas europeas de fitness racing.', en: 'Race at one of Europe’s big fitness racing events.' } }),
    A({ id: 'mad-premierpadel', kind: 'race', role: 'watch', ups: 'fan', city: 'madrid', sport: 'padel', img: 'img/padel2.jpg',
      title: { es: 'Premier Padel Madrid', en: 'Premier Padel Madrid' }, partner: 'Premier Padel · FIP (colaborador propuesto)', distance: { es: 'Torneo profesional', en: 'Pro tournament' }, level: { es: 'Público', en: 'Spectators' },
      when: { es: 'Según calendario Premier Padel', en: 'Per Premier Padel calendar' }, meet: { es: 'Eurostars Madrid Tower · traslado al estadio', en: 'Eurostars Madrid Tower · stadium transfer' },
      price: 0, spots: 50, taken: 23, ticketNote: true, desc: { es: 'Vive a los mejores jugadores del mundo y juega tú también: clínic de pádel por la mañana con BamVolea.', en: 'Watch the world’s best and play too: morning padel clinic with BamVolea.' } }),
    A({ id: 'rom-premierpadel', kind: 'race', role: 'watch', ups: 'fan', city: 'roma', sport: 'padel', img: 'img/padel3.jpg',
      title: { es: 'Premier Padel Italy Major · Roma', en: 'Premier Padel Italy Major · Rome' }, partner: 'Premier Padel · FIP (colaborador propuesto)', distance: { es: 'Torneo profesional', en: 'Pro tournament' }, level: { es: 'Público', en: 'Spectators' },
      when: { es: 'Según calendario Premier Padel', en: 'Per Premier Padel calendar' }, meet: { es: 'Eurostars Roma Aeterna · traslado al Foro Itálico', en: 'Eurostars Roma Aeterna · Foro Italico transfer' },
      price: 0, spots: 40, taken: 11, ticketNote: true, desc: { es: 'Uno de los Majors del circuito en el Foro Itálico.', en: 'One of the tour’s Majors at the Foro Italico.' } }),
    A({ id: 'mad-open', month: '2027-04', kind: 'race', role: 'watch', ups: 'fan', city: 'madrid', sport: 'tennis', img: 'img/tennis1.jpg',
      title: { es: 'Mutua Madrid Open (ATP/WTA)', en: 'Mutua Madrid Open (ATP/WTA)' }, partner: 'Mutua Madrid Open (colaborador propuesto)', distance: { es: 'Torneo profesional', en: 'Pro tournament' }, level: { es: 'Público', en: 'Spectators' },
      when: { es: 'Finales de abril – mayo 2027', en: 'Late April – May 2027' }, meet: { es: 'Eurostars Madrid Tower · traslado a la Caja Mágica', en: 'Eurostars Madrid Tower · Caja Mágica transfer' },
      price: 0, spots: 50, taken: 27, ticketNote: true, desc: { es: 'Masters 1000 y WTA 1000 en Madrid. Mañana de tenis para huéspedes y traslado a la Caja Mágica.', en: 'Masters 1000 and WTA 1000 in Madrid. Morning tennis for guests and transfer to Caja Mágica.' } }),
    A({ id: 'bcn-atp', month: '2027-04', kind: 'race', role: 'watch', ups: 'fan', city: 'barcelona', sport: 'tennis', img: 'img/tennis2.jpg',
      title: { es: 'Barcelona Open Banc Sabadell (ATP 500)', en: 'Barcelona Open Banc Sabadell (ATP 500)' }, partner: 'Real Club de Tenis Barcelona (colaborador propuesto)', distance: { es: 'Torneo profesional', en: 'Pro tournament' }, level: { es: 'Público', en: 'Spectators' },
      when: { es: 'Abril 2027', en: 'April 2027' }, meet: { es: 'Eurostars Grand Marina · traslado', en: 'Eurostars Grand Marina · transfer' },
      price: 0, spots: 40, taken: 15, ticketNote: true, desc: { es: 'El Godó: tierra batida, ambiente único y tenis de primer nivel.', en: 'The Godó: clay courts, unique atmosphere and top tennis.' } }),
    A({ id: 'rom-ibi', month: '2027-05', kind: 'race', role: 'watch', ups: 'fan', city: 'roma', sport: 'tennis', img: 'img/tennis1.jpg',
      title: { es: 'Internazionali BNL d’Italia (ATP/WTA)', en: 'Internazionali BNL d’Italia (ATP/WTA)' }, partner: 'Internazionali BNL d’Italia (colaborador propuesto)', distance: { es: 'Torneo profesional', en: 'Pro tournament' }, level: { es: 'Público', en: 'Spectators' },
      when: { es: 'Mayo 2027', en: 'May 2027' }, meet: { es: 'Eurostars Roma Aeterna · traslado al Foro Itálico', en: 'Eurostars Roma Aeterna · Foro Italico transfer' },
      price: 0, spots: 40, taken: 13, ticketNote: true, desc: { es: 'El gran torneo de tierra batida de Roma antes de Roland Garros.', en: 'Rome’s big clay event before Roland Garros.' } })
  ];

  /* ================= ACTIVE TOUR: un circuito por deporte ================= */
  var tours = [
    { id: 'run', sport: 'run', name: 'ACTIVE Tour Running', img: 'img/run10.jpg',
      format: { es: '10K urbano nocturno con salida desde el hotel', en: 'Night 10K starting from the hotel' },
      stops: [['sevilla', '2027-02', { es: 'Febrero 2027', en: 'February 2027' }], ['madrid', '2027-04', { es: 'Abril 2027', en: 'April 2027' }], ['barcelona', '2027-06', { es: 'Junio 2027', en: 'June 2027' }], ['lisboa', '2027-09', { es: 'Septiembre 2027', en: 'September 2027' }]],
      final: ['madrid', '2027-11', { es: 'Noviembre 2027', en: 'November 2027' }],
      ranking: [{ name: 'Lucía G.', city: 'Madrid', pts: 450 }, { name: 'Marco T.', city: 'Roma', pts: 400 }, { name: 'Carmen R.', city: 'Sevilla', pts: 300 }, { name: 'Tomás V.', city: 'Lisboa', pts: 200 }] },
    { id: 'padel', sport: 'padel', name: 'ACTIVE Tour Pádel', img: 'img/padel2.jpg',
      format: { es: 'Torneo americano por niveles con BamVolea y Playtomic', en: 'Level-based americano with BamVolea and Playtomic' },
      stops: [['madrid', '2027-03', { es: 'Marzo 2027', en: 'March 2027' }], ['sevilla', '2027-05', { es: 'Mayo 2027', en: 'May 2027' }], ['barcelona', '2027-07', { es: 'Julio 2027', en: 'July 2027' }], ['roma', '2027-10', { es: 'Octubre 2027', en: 'October 2027' }]],
      final: ['barcelona', '2027-12', { es: 'Diciembre 2027', en: 'December 2027' }],
      ranking: [{ name: 'Jordi P. & Ana M.', city: 'Barcelona', pts: 450 }, { name: 'Pablo S. & Irene L.', city: 'Sevilla', pts: 350 }, { name: 'Luca B. & Sara F.', city: 'Roma', pts: 300 }, { name: 'Diego R. & Marta C.', city: 'Madrid', pts: 250 }] },
    { id: 'fit', sport: 'gym', name: 'ACTIVE Tour Fitness', img: 'img/fit1.jpg',
      format: { es: 'Reto de fitness racing por parejas (formato tipo HYROX)', en: 'Fitness racing challenge in pairs (HYROX-style)' },
      stops: [['madrid', '2027-03', { es: 'Marzo 2027', en: 'March 2027' }], ['berlin', '2027-05', { es: 'Mayo 2027', en: 'May 2027' }], ['barcelona', '2027-09', { es: 'Septiembre 2027', en: 'September 2027' }]],
      final: ['berlin', '2027-11', { es: 'Noviembre 2027', en: 'November 2027' }],
      ranking: [{ name: 'Anna K. & Tim W.', city: 'Berlín', pts: 300 }, { name: 'Raúl P. & Leo G.', city: 'Madrid', pts: 250 }, { name: 'Clara V. & Nora S.', city: 'Barcelona', pts: 150 }] }
  ];
  tours.forEach(function (tr) {
    tr.stops.concat([tr.final]).forEach(function (s, i) {
      var fin = i === tr.stops.length, c = s[0];
      activities.push(A({ id: 'tour-' + tr.id + '-' + c + (fin ? '-final' : ''), kind: 'tour', tour: tr.id, stop: i + 1, final: fin, month: s[1], city: c, sport: tr.sport, img: tr.img,
        title: { es: tr.name + (fin ? ' · Master Final' : ' · Parada ' + (i + 1)), en: tr.name + (fin ? ' · Master Final' : ' · Stop ' + (i + 1)) },
        partner: 'Grupo Hotusa · ' + tr.name, distance: tr.format, level: fin ? { es: 'Por invitación', en: 'By invitation' } : { es: 'Todas las categorías', en: 'All categories' },
        when: s[2], meet: { es: 'Hotel Eurostars de la ciudad', en: 'City Eurostars hotel' },
        price: fin ? 0 : 25, freeFrom: fin ? null : 'ambassador', invite: fin, spots: fin ? 64 : 200, taken: fin ? 0 : 40 + i * 10,
        desc: fin ? { es: 'Los mejores del ranking y quienes completen el circuito, invitados con estancia incluida.', en: 'Top-ranked athletes and circuit finishers, invited with stay included.' }
                  : { es: tr.format.es + '. Suma puntos para el ranking de ' + tr.name + ' y un sello en tu pasaporte.', en: tr.format.en + '. Earn points for the ' + tr.name + ' ranking and a passport stamp.' } }));
    });
  });

  /* Extras según tipo de evento grande: solo en reserva directa */
  var upsells = [
    { id: 'shakeout', sets: ['race'], price: 0, title: { es: 'Shakeout run el día antes con el equipo ACTIVE', en: 'Shakeout run the day before with the ACTIVE team' } },
    { id: 'breakfast', sets: ['race'], price: 14, title: { es: 'Desayuno de carga a las 05:30', en: 'Carb-loading breakfast at 5:30 am' } },
    { id: 'protein', sets: ['fitness'], price: 14, title: { es: 'Desayuno proteico temprano', en: 'Early protein breakfast' } },
    { id: 'simulation', sets: ['fitness'], price: 15, title: { es: 'Sesión de simulación en gym partner', en: 'Simulation session at a partner gym' } },
    { id: 'clinic', sets: ['fan'], price: 30, title: { es: 'Clínic deportivo por la mañana', en: 'Morning sports clinic' } },
    { id: 'brunch', sets: ['fan'], price: 18, title: { es: 'Brunch deportivo antes del partido', en: 'Sports brunch before the match' } },
    { id: 'latecheckout', sets: ['race', 'fitness', 'fan'], price: 25, freeFrom: 'challenger', title: { es: 'Late check-out hasta las 16:00', en: 'Late check-out until 4 pm' } },
    { id: 'laundry', sets: ['race', 'fitness'], price: 9, title: { es: 'Lavado exprés de ropa técnica', en: 'Express sportswear laundry' } },
    { id: 'massage', sets: ['race', 'fitness'], price: 39, title: { es: 'Sesión de descarga muscular (30 min)', en: 'Recovery massage (30 min)' } },
    { id: 'transfer', sets: ['race', 'fitness', 'fan'], price: 8, title: { es: 'Traslado a la salida / recinto', en: 'Transfer to the start / venue' } },
    { id: 'recoverykit', sets: ['race', 'fitness'], price: 15, title: { es: 'Kit de recuperación en la habitación', en: 'In-room recovery kit' } }
  ];
  var upsellDefaults = { race: ['shakeout', 'breakfast'], fitness: ['protein'], fan: ['transfer'] };

  var tourInfo = {
    season: '2027', points: { stop: 100, top10: 50 },
    rewards: {
      es: ['Completa todas las paradas de tu circuito menos una → medalla Finisher + 1 noche gratis en la red Eurostars', 'Top del ranking de tu circuito → invitación al Master Final con estancia incluida', 'Cada parada suma un sello en tu Sport Passport', 'Puedes hacer solo un circuito o varios: cada uno tiene su propio ranking'],
      en: ['Finish all stops of your circuit but one → Finisher medal + 1 free night across Eurostars', 'Top of your circuit ranking → Master Final invitation with stay included', 'Every stop adds a stamp to your Sport Passport', 'Do one circuit or several: each has its own ranking']
    }
  };

  var partners = [
    { id: 'bamvolea', name: 'BamVolea', logo: 'img/partners/bamvolea.svg', sport: 'padel', url: 'https://bamvolea.com', tagline: { es: 'Pádel', en: 'Padel' },
      desc: { es: 'La mayor cadena de clubes de pádel de España: 14 clubes y más de 250 pistas. Su BamVolea Tour inspira el ACTIVE Tour Pádel.', en: 'Spain’s largest padel club chain: 14 clubs and 250+ courts. Their BamVolea Tour inspires the ACTIVE Tour Padel.' },
      cities: ['madrid', 'barcelona'], perks: { es: ['Reserva preferente de pista para huéspedes ACTIVE', 'Pala y bolas incluidas en las actividades', 'Sede del ACTIVE Tour Pádel'], en: ['Priority court booking for ACTIVE guests', 'Racket and balls included', 'Host of the ACTIVE Tour Padel'] } },
    { id: 'davidlloyd', name: 'David Lloyd Clubs', logo: 'img/partners/davidlloyd.svg', sport: 'gym', url: 'https://www.davidlloyd.es', tagline: { es: 'Club premium · Gym & Wellness', en: 'Premium club · Gym & Wellness' },
      desc: { es: 'Grupo europeo líder en salud y bienestar. Clubs privados con gimnasio, clases, piscinas, pistas y spa.', en: 'Europe’s leading health and wellness group. Private clubs with gym, classes, pools, courts and spa.' },
      cities: ['madrid', 'barcelona'], perks: { es: ['Day pass normalmente exclusivo para socios', '18 € para huéspedes ACTIVE · gratis desde Challenger', 'Zona de recuperación tras tu actividad'], en: ['Day pass normally members-only', '€18 for ACTIVE guests · free from Challenger', 'Recovery area after your activity'] } },
    { id: 'holmesplace', name: 'Holmes Place', logo: 'img/partners/holmesplace.svg', mono: true, sport: 'gym', url: 'https://www.holmesplace.com', tagline: { es: 'Fitness premium', en: 'Premium fitness' },
      desc: { es: 'Clubs premium de fitness y spa en Europa, con presencia en Madrid, Lisboa, Oporto, Berlín y Praga.', en: 'Premium fitness and spa clubs across Europe, incl. Madrid, Lisbon, Porto, Berlin and Prague.' },
      cities: ['madrid', 'lisboa', 'porto', 'berlin', 'praga'], perks: { es: ['Gym pass para huéspedes ACTIVE (15 €)', 'Gratis desde nivel Challenger', 'Clases dirigidas incluidas'], en: ['Gym pass for ACTIVE guests (€15)', 'Free from Challenger level', 'Group classes included'] } },
    { id: 'playtomic', name: 'Playtomic', logo: 'img/partners/playtomic.svg', sport: 'padel', url: 'https://playtomic.com', tagline: { es: 'Reserva de pistas', en: 'Court booking' },
      desc: { es: 'La app de pádel y tenis con miles de clubes. Encuentra partido de tu nivel en tu destino.', en: 'The padel and tennis app with thousands of clubs. Find a match at your level wherever you go.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'roma', 'porto'], perks: { es: ['Partidos abiertos con jugadores locales de tu nivel', 'Pistas cerca de cada hotel Eurostars', 'Ranking conectado al ACTIVE Tour Pádel'], en: ['Open matches with local players', 'Courts near every Eurostars hotel', 'Ranking linked to the ACTIVE Tour Padel'] } },
    { id: 'strava', name: 'Strava', logo: 'img/partners/strava.svg', sport: 'run', url: 'https://www.strava.com', tagline: { es: 'Comunidad y retos', en: 'Community and challenges' },
      desc: { es: 'Club ACTIVE en Strava con las rutas de cada hotel y retos inter-ciudades.', en: 'ACTIVE Club on Strava with each hotel’s routes and inter-city challenges.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'berlin', 'roma', 'praga', 'porto'], perks: { es: ['Rutas oficiales ACTIVE de cada hotel', 'Retos mensuales con sello extra', 'Segmentos del ACTIVE Tour Running'], en: ['Official ACTIVE routes per hotel', 'Monthly challenges with bonus stamp', 'ACTIVE Tour Running segments'] } },
    { id: 'decathlon', name: 'Decathlon', logo: 'img/partners/decathlon.svg', sport: 'run', url: 'https://www.decathlon.es', tagline: { es: 'Material deportivo', en: 'Sports gear' },
      desc: { es: '¿Te has dejado algo? Material en préstamo en el hotel y tiendas en todas las ciudades ACTIVE.', en: 'Forgot something? Gear on loan at the hotel and stores in every ACTIVE city.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'berlin', 'roma', 'praga', 'porto'], perks: { es: ['Préstamo de material (palas, esterillas, bicis, neoprenos)', 'Descuento en tienda con tu ACTIVE Pass', 'Avituallamiento en el ACTIVE Tour'], en: ['Gear loans (rackets, mats, bikes, wetsuits)', 'Store discount with your ACTIVE Pass', 'Aid stations at the ACTIVE Tour'] } },
    { id: 'hyrox', name: 'HYROX', logo: 'img/partners/hyrox.png', mono: true, sport: 'gym', url: 'https://hyrox.com', tagline: { es: 'Fitness racing', en: 'Fitness racing' },
      desc: { es: 'La competición de fitness que más crece: 1,5 M de atletas estimados en la temporada 2025/26.', en: 'The fastest-growing fitness race: an estimated 1.5M athletes in 2025/26.' },
      cities: ['madrid', 'barcelona', 'berlin', 'roma'], perks: { es: ['Packs ACTIVE Live en sus pruebas europeas', 'Simulaciones HYROX en gyms partner', 'Formato del ACTIVE Tour Fitness'], en: ['ACTIVE Live packs at its European events', 'HYROX simulations at partner gyms', 'Format of the ACTIVE Tour Fitness'] } },
    { id: 'asics', name: 'ASICS', logo: 'img/partners/asics.svg', sport: 'run', url: 'https://www.asics.com', tagline: { es: 'Kit oficial', en: 'Official kit' },
      desc: { es: 'Patrocinador de equipación del ACTIVE Tour y de los Embajadores ACTIVE.', en: 'Kit sponsor of the ACTIVE Tour and ACTIVE Ambassadors.' },
      cities: ['madrid', 'sevilla', 'barcelona', 'lisboa', 'berlin', 'roma', 'praga', 'porto'], perks: { es: ['Camiseta técnica del ACTIVE Tour', 'Kit completo para Embajadores', 'Pruebas de zapatillas en ACTIVE Live'], en: ['ACTIVE Tour tech tee', 'Full kit for Ambassadors', 'Shoe testing at ACTIVE Live'] } }
  ];

  var meetups = [
    { id: 'm1', city: 'sevilla', sport: 'run', title: { es: 'Sunset run Alameda – Guadalquivir', en: 'Sunset run Alameda – Guadalquivir' }, club: 'Triana Run Club', when: { es: 'Jue · 19:30', en: 'Thu · 7:30 pm' }, going: 12, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm2', city: 'sevilla', sport: 'padel', title: { es: 'Americano para huéspedes', en: 'Guest americano' }, club: 'Playtomic', when: { es: 'Vie · 19:00', en: 'Fri · 7 pm' }, going: 7, from: { es: 'Falta 1 plaza', en: '1 spot left' } },
    { id: 'm3', city: 'madrid', sport: 'run', title: { es: 'Easy run Madrid Río', en: 'Easy run Madrid Río' }, club: 'Madrid Runners Crew', when: { es: 'Mié · 07:00', en: 'Wed · 7 am' }, going: 15, from: { es: 'Desde el lobby', en: 'From the lobby' } },
    { id: 'm4', city: 'madrid', sport: 'padel', title: { es: 'Pádel after-work', en: 'After-work padel' }, club: 'BamVolea', when: { es: 'Mar · 20:00', en: 'Tue · 8 pm' }, going: 6, from: { es: 'Nivel medio', en: 'Intermediate' } },
    { id: 'm5', city: 'barcelona', sport: 'trail', title: { es: 'Bunkers del Carmel trail', en: 'Bunkers del Carmel trail' }, club: 'BCN Social Runners', when: { es: 'Sáb · 08:00', en: 'Sat · 8 am' }, going: 21, from: { es: 'Desde el hotel', en: 'From the hotel' } },
    { id: 'm6', city: 'lisboa', sport: 'surf', title: { es: 'Surf al atardecer en Carcavelos', en: 'Sunset surf at Carcavelos' }, club: 'Lisbon Surf Crew', when: { es: 'Mar · 18:00', en: 'Tue · 6 pm' }, going: 9, from: { es: 'Tren desde el hotel', en: 'Train from the hotel' } },
    { id: 'm7', city: 'berlin', sport: 'gym', title: { es: 'HYROX training session', en: 'HYROX training session' }, club: 'Holmes Place', when: { es: 'Dom · 10:00', en: 'Sun · 10 am' }, going: 18, from: { es: 'Gym partner', en: 'Partner gym' } }
  ];

  var levels = [
    { id: 'explorer',   name: 'Explorer',   min: 0,  cities: 0, req: { es: 'Registro gratuito', en: 'Free sign-up' },
      perks: { es: ['Experiencias ACTIVE Play del hotel incluidas', 'Rutas del hotel en tu móvil'], en: ['ACTIVE Play hotel experiences included', 'Hotel routes on your phone'] } },
    { id: 'active',     name: 'Active',     min: 2,  cities: 0, req: { es: '2 actividades', en: '2 activities' },
      perks: { es: ['Desayuno temprano de carga', 'Lavado exprés de ropa deportiva'], en: ['Early energy breakfast', 'Express sportswear laundry'] } },
    { id: 'challenger', name: 'Challenger', min: 5,  cities: 2, req: { es: '5 actividades en 2+ ciudades', en: '5 activities in 2+ cities' },
      perks: { es: ['Gym pass premium gratis (David Lloyd, Holmes Place)', 'Late check-out garantizado tras tu actividad', 'Custodia de bicicletas'], en: ['Free premium gym pass (David Lloyd, Holmes Place)', 'Guaranteed late check-out after your activity', 'Bike storage'] } },
    { id: 'ambassador', name: 'Ambassador', min: 10, cities: 3, req: { es: '10 actividades + eventos', en: '10 activities + events' },
      perks: { es: ['Inscripción gratis al ACTIVE Tour', 'Organiza tus propios eventos ACTIVE', 'Upgrade según disponibilidad'], en: ['Free ACTIVE Tour entry', 'Host your own ACTIVE events', 'Upgrade subject to availability'] } },
    { id: 'legend',     name: 'Legend',     min: Infinity, cities: 0, invite: true, req: { es: 'Por invitación', en: 'By invitation' },
      perks: { es: ['Kit técnico edición Legend', 'Experiencias VIP con partners'], en: ['Legend edition technical kit', 'VIP experiences with partners'] } }
  ];

  var goals = [
    { id: 'plans', kinds: ['local'], icon: 'compass', label: { es: 'Planes deportivos en mis viajes', en: 'Sports plans on my trips' } },
    { id: 'sports', kinds: ['local'], icon: 'route', label: { es: 'Practicar mis deportes allí donde vaya', en: 'Do my sports wherever I go' } },
    { id: 'events', kinds: ['race'], icon: 'event', label: { es: 'Vivir grandes eventos: competir o animar', en: 'Big events: compete or cheer' } },
    { id: 'tour', kinds: ['tour'], icon: 'trophy', label: { es: 'Llenar el pasaporte con el ACTIVE Tour', en: 'Fill my passport with the ACTIVE Tour' } },
    { id: 'community', kinds: ['local', 'tour'], icon: 'users', label: { es: 'Conocer gente que entrena', en: 'Meet people who train' } },
    { id: 'discover', kinds: ['local'], icon: 'globe', label: { es: 'Probar deportes nuevos (surf, golf…)', en: 'Try new sports (surf, golf…)' } }
  ];

  function demoState() {
    var d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
    var iso = d.toISOString().slice(0, 10);
    return {
      user: { name: 'Laura', demo: true, since: '2026-03-14' },
      prefs: { goals: ['plans', 'events', 'tour', 'discover'], sports: ['run', 'padel', 'surf'] },
      stamps: [
        { city: 'madrid', sport: 'run', activity: 'mad-retiro', date: '2026-04-26' },
        { city: 'madrid', sport: 'padel', activity: 'mad-padel', date: '2026-06-11' },
        { city: 'barcelona', sport: 'run', activity: 'bcn-barceloneta', date: '2026-07-18' },
        { city: 'lisboa', sport: 'surf', activity: 'lis-surf', date: '2026-09-27' }
      ],
      bookings: [
        { id: 'AE-7Q4K2', activity: 'sev-triana', city: 'sevilla', checkIn: iso, nights: 2, guests: 1, room: 'superior', upsells: [], total: 334, status: 'upcoming', checkedIn: false, created: new Date().toISOString() }
      ],
      joined: ['m1']
    };
  }

  return { cities: cities, kinds: kinds, sports: sports, activities: activities, tours: tours, upsells: upsells, upsellDefaults: upsellDefaults, tour: tourInfo, partners: partners, meetups: meetups, levels: levels, goals: goals, demoState: demoState };
})();
