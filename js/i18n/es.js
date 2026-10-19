/* Spanish texts. Same keys as en.js (tests/i18n.test.js checks it). {name} slots are filled in when the text
   is used; texts that change with a number are functions. */
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export default {
  common: {
    back: 'Volver',
    menu: 'Menú',
    games: 'Juegos',
    levels: 'Niveles',
    settings: 'Ajustes',
    help: 'Cómo se juega',
    progress: 'Progreso',
    hint: 'Pista',
    hintIn: 'Pista disponible en {time}',
    undo: 'Deshacer',
    redo: 'Rehacer',
    reset: 'Reiniciar la partida',
    board: 'Tablero',
    tool: 'Herramienta',
    pen: 'Escribir número',
    pencil: 'Anotar candidatos',
    erase: 'Borrar casilla',
    flip: 'Voltear',
    done: 'Listo',
    cancel: 'Cancelar',
    flipAria: 'Voltear la pieza seleccionada',
    trayAria: 'Piezas sin colocar',
    dragToBoard: 'Arrastra al tablero',
    tapTwiceRotate: 'Toca dos veces: gira',
    tapRotate: 'Toca: gira',
    tapFlip: 'Toca: da la vuelta',
    flipFace: 'Voltear: otra cara',
    record: 'Récord {time}',
    recordWord: 'Récord'
  },

  levels: { easy: 'Fácil', hard: 'Difícil', expert: 'Experto' },

  hub: {
    aria: 'Juegos',
    choose: 'Elige un juego',
    continue: 'Continuar',
    gamesCount: ({ n }) => `${n} juegos`,
    now: 'ahora',
    minutesAgo: 'hace {n} min',
    hoursAgo: 'hace {n} h',
    yesterday: 'ayer',
    daysAgo: 'hace {n} días',
    groups: { pieces: 'Piezas' }
  },

  appSettings: {
    night: 'Modo noche',
    nightDesc: 'Colores cálidos en toda la app, para jugar antes de dormir.',
    language: 'Idioma',
    languageDesc: 'Por defecto, el del móvil.',
    languageAuto: 'Del móvil ({name})'
  },

  menu: {
    aria: 'Niveles',
    newGame: 'Nueva partida',
    gameProgress: 'Progreso de este juego',
    pickAria: 'Elegir reto'
  },

  settings: {
    wipe: 'Borrar estadísticas',
    wiped: 'Estadísticas borradas',
    timer: 'Cronómetro',
    timerDesc: 'Muestra el tiempo de la partida.',
    errors: 'Resaltar errores',
    cleanNotes: 'Limpiar notas',
    sameNumbers: 'Resaltar números iguales',
    sameNumbersDesc: 'Marca todas las casillas con el número seleccionado.',
    spots: 'Mostrar dónde cabe',
    spotsDesc: 'Al elegir una pieza, marca los sitios del tablero donde cabe tal como está girada. Toca uno para verla ahí y otra vez para colocarla.',
    spotsHelp: 'Con una pieza elegida, los puntos marcan dónde cabe tal como está girada: toca uno para verla ahí y otra vez para colocarla. Se puede desactivar en Ajustes.'
  },

  help: { gotIt: 'Entendido' },

  loading: {
    aria: 'Generando',
    title: 'Generando tablero',
    text: 'Buscando uno con solución única y de la dificultad elegida.'
  },

  update: { text: 'Hay una versión nueva', apply: 'Actualizar' },

  confirm: {
    newTitle: '¿Empezar otra partida?',
    newText: 'Tienes una partida de {level} en curso ({time}). Si empiezas otra, se perderá.',
    newAccept: 'Empezar nueva',
    newKeep: 'Seguir con la actual',
    resetTitle: '¿Reiniciar la partida?',
    resetText: 'Se quita todo lo que has puesto en el tablero. El tiempo sigue contando.',
    resetAccept: 'Reiniciar'
  },

  play: {
    alreadyEmpty: 'El tablero ya está vacío',
    cleared: 'Tablero vacío. Puedes deshacerlo.',
    clearedShort: 'Tablero vacío.',
    nextHint: 'Próxima pista en {time}',
    pickCell: 'Elige una casilla',
    wrongNumber: 'Este número no va aquí',
    wrongPiece: 'Esta pieza no va aquí',
    noRotate: 'No cabe girada aquí',
    noFlip: 'No cabe volteada aquí'
  },

  win: {
    aria: 'Tablero resuelto',
    title: 'Resuelto',
    next: 'Siguiente tablero',
    today: 'Hoy',
    faster: 'más rápido',
    slower: 'más lento',
    avg: 'media {time}',
    stripAria: 'Hoy {today}; tu media de las últimas {n}: {avg}',
    vsPrevious: 'Frente a tu partida anterior sin pistas',
    vsLast: 'Entre tus últimas {n} partidas sin pistas'
  },

  stats: {
    solvedWithHints: ({ n }) => `${plural(n, 'resuelto', 'resueltos')} con pistas`,
    seconds: '{n} s',
    minutes: '{time} min',
    sameAsAvg: 'Igual que tu media.',
    fasterThanAvg: '{d} más rápido que tu media.',
    slowerThanAvg: '{d} más lento que tu media.',
    newRecord: 'Nuevo récord en {name}',
    before: ' (antes {time}).',
    withHints: ({ n }) => `Con ${plural(n, 'pista', 'pistas')}.`,
    recordWas: 'Récord: {time}.'
  },

  progress: {
    title: 'PROGRESO',
    aria: 'Progreso',
    levelAria: 'Progreso de un nivel',
    backGame: 'Volver al progreso del juego',
    chipsAria: 'Juego',
    empty: 'Todavía no has resuelto ningún reto de {name}. Cada uno que resuelvas aparecerá aquí, con su fecha y su tiempo.',
    solved: ({ n }) => n === 1 ? 'resuelto' : 'resueltos',
    playing: 'jugando',
    records: ({ n }) => n === 1 ? 'récord' : 'récords',
    average: 'Media {time} · ',
    games: ({ n }) => plural(n, 'partida', 'partidas'),
    gamesWord: ({ n }) => n === 1 ? 'partida' : 'partidas',
    solvedBefore: ({ n }) => `${plural(n, 'resuelto', 'resueltos')} antes de guardar fechas`,
    unsolved: 'Sin resolver',
    record: 'récord',
    trendSame: '= Como el mes pasado',
    trendFaster: '↓ {pct} % más rápido',
    trendSlower: '↑ {pct} % más lento',
    hoursMinutes: '{h} h {m} min',
    minutesOnly: '{m} min',
    today: 'hoy',
    yesterday: 'ayer',
    months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    rangeAria: 'Periodo',
    ranges: { last20: 'Últimas 20', months3: '3 meses', all: 'Todo' },
    avgLabel: 'media',
    avgPeriod: 'media del periodo',
    noneInRange: 'No hay partidas en este periodo.',
    legendGame: 'Partida',
    legendHints: 'Con pistas',
    legendAvg: 'Media de 5',
    legendRecord: 'Récord',
    oneGame: 'Con una partida aún no hay gráfico: aparece desde la segunda.',
    spread: 'Cómo se reparten tus tiempos',
    last: 'Últimas partidas',
    hints: ({ n }) => plural(n, 'pista', 'pistas'),
    withHints: 'con pistas',
    tipHints: ({ n }) => `con ${plural(n, 'pista', 'pistas')}`,
    recordPill: 'Récord',
    belowAvg: '↓ {time} bajo tu media',
    aboveAvg: '↑ {time} sobre tu media',
    moves: '{n} mov.',
    chartAria: 'Tiempo de cada partida',
    histAria: 'Partidas por tramo de tiempo, desde {from} cada {step}',
    recordLine: 'Récord {time}',
    extraMoves: 'Movimientos de más',
    perfectOf: '{a} de {n}',
    perfect: 'con los justos',
    extraAvg: 'de más, de media',
    avgMoves: 'movimientos de media',
    movesAria: 'Movimientos de más en las últimas {n} partidas',
    movesNote: 'Cada barra es una partida; un punto, que la resolviste con los movimientos mínimos.',
    gamesAgo: 'hace {n} partidas',
    lastOne: 'la última',
    decimal: ','
  },

  games: {
    sudoku: {
      name: 'Sudoku',
      tagline: 'Del 1 al 9 sin repetir',
      errorsDesc: 'Los números repetidos en una fila, columna o caja se ponen rojos.',
      notesDesc: 'Al poner un número se borra de las notas de su fila, columna y caja.',
      help: `
  <p>Rellena el tablero para que cada <b>fila</b>, cada <b>columna</b> y cada <b>caja</b> de 3×3 tenga los números del 1 al 9 sin repetir. Cada tablero tiene una única solución.</p>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla y después un número del teclado. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz {pencil} anotas candidatos pequeños en la casilla; toca otra vez para quitarlos.</li>
    <li>La goma borra la casilla seleccionada. En teclado físico: números, flechas, retroceso y <b>N</b> para cambiar de lápiz a número.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> basta con ver en qué casilla cabe cada número.</li>
    <li><b>Difícil:</b> hay que usar pares o tríos de candidatos y candidatos bloqueados en una caja.</li>
    <li><b>Experto:</b> siempre necesita un <b>X-Wing</b> o un <b>Swordfish</b>: si un número solo cabe en las mismas 2 (o 3) columnas en 2 (o 3) filas, en esas columnas no puede ir en ninguna otra fila. Y lo mismo cambiando filas por columnas.</li>
  </ul>`
    },

    'killer-sudoku': {
      name: 'Killer Sudoku',
      tagline: 'Sudoku con jaulas de suma',
      errorsDesc: 'Se ponen rojos los números repetidos en una fila, columna, caja o jaula, y las jaulas que no dan su suma.',
      notesDesc: 'Al poner un número se borra de las notas de su fila, columna, caja y jaula.',
      figure: 'Cada jaula suma lo que indica: 8 + 1 = 9 y 9 + 4 + 7 = 20. Dentro de una jaula no se repite ningún número.',
      help: `
  <p>Es un Sudoku: cada <b>fila</b>, cada <b>columna</b> y cada <b>caja</b> de 3 × 3 lleva los números del 1 al 9 sin repetir.</p>
  {figure}
  <p>Además, el tablero está dividido en <b>jaulas</b> con borde punteado. Los números de una jaula <b>suman</b> el número pequeño de su esquina y <b>no se repiten</b> dentro de ella. Al empezar hay pocos números puestos (menos cuanto más difícil): el resto se deduce de las sumas. Cada tablero tiene una única solución.</p>
  <h3>Trucos</h3>
  <ul>
    <li>Algunas sumas solo se pueden hacer de una manera: 3 en dos casillas es 1 + 2, y 17 es 8 + 9.</li>
    <li><b>Regla del 45:</b> cada fila, columna y caja suma 45. Si sabes lo que suman las jaulas que caben enteras en una caja, lo que falta hasta 45 lo suman las casillas que quedan.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> jaulas pequeñas, algunas de una sola casilla (su número es su suma), y bastantes números puestos; basta con las sumas y ver dónde cabe cada número.</li>
    <li><b>Difícil:</b> pocos números puestos; hacen falta candidatos bloqueados, pares y tríos.</li>
    <li><b>Experto:</b> jaulas de hasta 4 casillas y siempre la regla del 45 en una fila, columna o caja.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla y después un número. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz {pencil} anotas candidatos; la goma borra la casilla.</li>
  </ul>`
    },

    kakuro: {
      name: 'Kakuro',
      tagline: 'Sumas cruzadas',
      errorsDesc: 'Se ponen rojos los números repetidos en un tramo y los tramos que no dan su suma.',
      notesDesc: 'Al poner un número se borra de las notas de sus dos tramos.',
      figure: 'La fila de arriba suma 4 (1 + 3) y la de abajo 11 (2 + 9); la columna de la izquierda, 3 (1 + 2), y la de la derecha, 12 (3 + 9).',
      help: `
  <p>Rellena las casillas blancas con números del <b>1 al 9</b>. Cada <b>tramo</b> de casillas blancas seguidas, en horizontal o en vertical, suma lo que dice la casilla negra de su izquierda o de encima, y <b>no repite</b> ningún número.</p>
  {figure}
  <p>En cada casilla negra, el número de arriba es la suma del tramo que empieza a su derecha, y el de abajo, la del tramo que empieza debajo. Cada tablero tiene una única solución.</p>
  <h3>Trucos</h3>
  <ul>
    <li>Algunas sumas solo se hacen de una manera: 3 en dos casillas es 1 + 2, 4 es 1 + 3, 16 es 7 + 9 y 17 es 8 + 9. En tres: 6 es 1 + 2 + 3, 7 es 1 + 2 + 4, 23 es 6 + 8 + 9 y 24 es 7 + 8 + 9.</li>
    <li>Una casilla está en dos tramos: solo puede llevar un número que valga para los dos.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 6 × 6. Basta con las combinaciones de cada tramo.</li>
    <li><b>Difícil:</b> 10 × 10. Hay que cruzar lo que admite cada casilla con las combinaciones del tramo entero.</li>
    <li><b>Experto:</b> 12 × 12, con tramos de hasta 9 casillas.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla blanca y después un número. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz {pencil} anotas candidatos; la goma borra la casilla.</li>
  </ul>`
    },

    calcudoku: {
      name: 'Calcudoku',
      tagline: 'Operaciones en jaulas',
      errorsDesc: 'Los números repetidos en una fila o columna se ponen rojos.',
      notesDesc: 'Al poner un número se borra de las notas de su fila y columna.',
      figure: 'En la jaula 6+, 1 + 2 + 3 = 6; en la 2×, 1 × 2 = 2. Ningún número se repite en su fila ni en su columna.',
      help: `
  <p>Rellena el tablero de N × N con los números del <b>1 al N</b> sin repetir en ninguna <b>fila</b> ni <b>columna</b>.</p>
  {figure}
  <p>Cada <b>jaula</b> (borde grueso) indica el resultado de una operación con sus números: <b>+</b> suma, <b>×</b> multiplica, <b>−</b> resta y <b>÷</b> divide (estas dos, del mayor al menor). Una jaula de una sola casilla dice directamente su número. Dentro de una jaula se pueden repetir números si no están en la misma fila o columna.</p>
  <p>Cada tablero tiene una única solución.</p>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 5 × 5, con sumas, restas y multiplicaciones.</li>
    <li><b>Difícil:</b> 6 × 6, con las cuatro operaciones y sin jaulas de una casilla.</li>
    <li><b>Experto:</b> 7 × 7, sin jaulas de una casilla.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla y después un número. Toca el mismo número otra vez para quitarlo.</li>
    <li>Con el lápiz {pencil} anotas candidatos; la goma borra la casilla.</li>
  </ul>`
    },

    'star-battle': {
      name: 'Star Battle',
      tagline: 'Estrellas que no se tocan',
      autoX: 'X automáticas',
      autoXDesc: 'Pone X alrededor de cada estrella que colocas.',
      errorsDesc: 'Las estrellas que rompen una regla se ponen rojas.',
      tint: 'Colorear regiones',
      tintDesc: 'Tiñe cada región con un tono distinto.',
      toolStar: 'Estrellas y X',
      toolTry: 'Estrellas de prueba',
      wrongStar: 'Esta estrella no va aquí',
      missingStar: 'Aquí sí va una estrella',
      allPlacedWrong: 'Están todas las estrellas, pero las rojas rompen una regla: se tocan, también en diagonal, o sobran en su fila, columna o región.',
      help: `
  <p>Coloca estrellas para que cada <b>fila</b>, cada <b>columna</b> y cada <b>región</b> (zona rodeada por línea gruesa) tenga exactamente 2 estrellas.</p>
  <p>Dos estrellas nunca pueden tocarse, ni siquiera en diagonal. Todos los tableros son de 10×10 y tienen una única solución; la dificultad depende de la forma de las regiones.</p>
  <h3>Controles</h3>
  {demo}
  <ul>
    <li>Toca una casilla para pasar de vacía a X, de X a estrella y de estrella a vacía.</li>
    <li>Arrastra el dedo para marcar varias X seguidas.</li>
    <li>Con la herramienta de prueba {try} pones <b>estrellas de prueba</b> (con borde dorado) para probar una suposición. Cuentan como estrellas: ponen sus X y se ponen rojas si rompen una regla. Tócala otra vez para quitarla, o tócala con la herramienta normal para dejarla como estrella.</li>
  </ul>
  <h3>Truco de inicio</h3>
  <p>Empieza por las regiones pequeñas: si una región cabe en una sola fila o columna, las estrellas de esa fila o columna ya están decididas.</p>`
    },

    loop: {
      name: 'Bucle',
      tagline: 'Un solo lazo entre los puntos',
      errorsDesc: 'En rojo los números con más líneas de las que dicen y los puntos con más de dos líneas.',
      extraLine: 'Esta línea sobra',
      missingLine: 'Aquí va una línea',
      figure: 'Cada número dice cuántos de sus cuatro lados son del lazo. Las casillas sin número pueden tener cualquier cantidad.',
      help: `
  <p>Une los puntos con un <b>único lazo cerrado</b>, en horizontal y en vertical. El lazo no se cruza ni se toca a sí mismo, y de cada punto salen 0 o 2 líneas.</p>
  {figure}
  <p>Cada <b>número</b> dice cuántos de los cuatro lados de su casilla son del lazo. Cada tablero tiene una única solución.</p>
  <h3>Trucos</h3>
  <ul>
    <li>Un 0 tacha sus cuatro lados. Un 3 en una esquina pone sus dos lados de la esquina.</li>
    <li>El lazo separa las casillas de dentro de las de fuera: una línea entre dos casillas es que una está dentro y la otra fuera.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 5 × 5. Basta con los números y con que de cada punto salgan 0 o 2 líneas.</li>
    <li><b>Difícil:</b> 8 × 8. Además de las esquinas y de no cerrar un lazo pequeño antes de tiempo, hay que pensar qué casillas quedan dentro y cuáles fuera.</li>
    <li><b>Experto:</b> 10 × 10, con lo mismo que el Difícil.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca un lado para poner una línea; un segundo toque lo tacha y otro lo deja vacío.</li>
    <li>Arrastra de punto a punto para dibujar varias líneas seguidas. Si empiezas sobre una línea, el arrastre las borra.</li>
  </ul>`
    },

    'light-up': {
      name: 'Luces',
      tagline: 'Ilumina todo el tablero',
      errorsDesc: 'En rojo las bombillas que se ven entre sí y los números que ya no pueden cumplirse: con bombillas de más, o sin sitio para las que faltan.',
      noBulb: 'Aquí no va una bombilla',
      bulb: 'Aquí sí va una bombilla',
      figure: 'La bombilla ilumina su fila y su columna hasta una casilla negra. El 1 tiene justo una bombilla al lado.',
      help: `
  <p>Pon <b>bombillas</b> en las casillas blancas hasta que <b>todas queden iluminadas</b>.</p>
  {figure}
  <ul>
    <li>Una bombilla ilumina su fila y su columna hasta que una casilla negra corta la luz.</li>
    <li>Dos bombillas no pueden alumbrarse entre sí.</li>
    <li>Un número en una casilla negra dice cuántas bombillas tiene justo al lado (arriba, abajo, izquierda y derecha). Las negras sin número pueden tener cualquier cantidad.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla para marcarla con un punto (aquí no va); otra vez, para poner una bombilla; otra más, para dejarla vacía.</li>
  </ul>`
    },

    binary: {
      name: 'Binario',
      tagline: 'Rojo y azul, mitad y mitad',
      errorsDesc: 'Raya las casillas que rompen una regla: tres iguales seguidos, más de la mitad de un color en una línea o dos líneas iguales.',
      wrongColor: 'Este color no va aquí',
      why: {
        trio: 'Así no quedan tres iguales seguidos',
        half: 'Esta línea ya tiene la mitad de ese color',
        unique: 'Si no, habría dos líneas iguales',
        look: 'Con el otro color no saldría',
        none: 'Esta casilla va así'
      },
      figure: 'Arriba hay tres rojos seguidos. Abajo no, y hay tantos rojos como azules.',
      help: `
  <p>Llena el tablero de <b>rojo</b> y <b>azul</b>.</p>
  {figure}
  <ul>
    <li>No puede haber <b>tres iguales seguidos</b> en una fila ni en una columna.</li>
    <li>Cada fila y cada columna tiene <b>tantos rojos como azules</b>.</li>
    <li><b>No hay dos filas iguales</b>, ni dos columnas iguales.</li>
    <li>Cada reto tiene una sola solución y se resuelve sin adivinar.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca una casilla para ponerla roja; otra vez, azul; otra más, vacía. Las que vienen dadas (con un punto) no se pueden cambiar.</li>
  </ul>`
    },

    bridges: {
      name: 'Puentes',
      tagline: 'Puentes entre islas',
      errors: 'Marcar islas con puentes de más',
      errorsDesc: 'En rojo las que ya tienen más puentes de los que dice su número.',
      boardAria: 'Islas',
      extraBridge: 'Aquí sobra un puente',
      crosses: 'Se cruza con otro puente',
      figure: 'Cada número dice cuántos puentes salen de la isla: 1, 1 + 2 = 3 y 2.',
      help: `
  <p>Une todas las <b>islas</b> con <b>puentes</b>. El número de cada isla dice cuántos puentes salen de ella.</p>
  {figure}
  <ul>
    <li>Los puentes van en línea recta, en horizontal o en vertical, entre dos islas.</li>
    <li>Entre dos islas puede haber uno o dos puentes, como mucho.</li>
    <li>Los puentes no se pueden cruzar ni pasar por encima de una isla.</li>
    <li>Al final, desde cualquier isla se tiene que poder llegar a todas las demás.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Desliza desde una isla hacia la de al lado, o toca el hueco entre las dos, para poner un puente. Repite para el segundo; una tercera vez los quita.</li>
    <li>Toca dos veces seguidas una isla para quitar todos sus puentes.</li>
    <li>Las islas que ya tienen todos sus puentes se ven más apagadas.</li>
  </ul>`
    },

    trail: {
      name: 'Trazo',
      tagline: 'Un camino por todas las casillas',
      detour: 'El camino se desvía aquí',
      figure: 'Un solo camino por todas las casillas, pasando por el 1, el 2 y el 3 en orden.',
      help: `
  <p>Dibuja <b>un solo camino</b> que pase por <b>todas las casillas</b> del tablero, una sola vez, y que toque los números <b>en orden</b>: empieza en el 1 y termina en el número más alto.</p>
  {figure}
  <ul>
    <li>El camino va de una casilla a otra vecina, en horizontal o en vertical (nunca en diagonal).</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Fácil</b> (6 × 6) al <b>Experto</b> (7 × 7) el tablero crece y hay menos números que te guíen.</p>
  <h3>Controles</h3>
  <ul>
    <li>Arrastra desde el 1 para dibujar; puedes soltar y seguir desde el final.</li>
    <li>Vuelve hacia atrás sobre el camino para borrar, o toca una casilla del camino para dejarlo acabando ahí.</li>
  </ul>`
    },

    gears: {
      name: 'Engranajes',
      tagline: 'De la manivela al cerrojo',
      errorsDesc: 'En rojo los números que ya tienen engranajes de más y la cadena cuando cierra un círculo.',
      turn: 'Girar',
      turnAria: 'Girar la manivela',
      jam: 'Se atasca: hay un círculo de engranajes',
      notLinked: 'El cerrojo aún no está unido a la manivela',
      wrongWay: 'Algo gira hacia el lado contrario de su flecha',
      loose: 'Sobran engranajes sueltos',
      clues: 'El cerrojo gira, pero algún número no cuadra',
      noGear: 'Aquí no va un engranaje',
      gear: 'Aquí sí va un engranaje',
      figure: 'La manivela (plateada) mueve la cadena hasta el cerrojo (verde). Cada número cuenta los engranajes que tocan su hueco.',
      help: `
  <p>Pon <b>engranajes</b> en los huecos para que la <b>manivela</b> mueva el <b>cerrojo</b> y lo abra.</p>
  {figure}
  <ul>
    <li>Todos los engranajes forman <b>una sola cadena</b> con la manivela, sin piezas sueltas.</li>
    <li>La cadena no puede <b>cerrar ningún círculo</b>: un círculo de engranajes se atasca.</li>
    <li>Dos engranajes que se tocan giran en <b>sentidos contrarios</b>. La manivela gira a la derecha; las flechas dicen hacia dónde tiene que girar el cerrojo y cada engranaje que ya está puesto.</li>
    <li>Un <b>número</b> dice cuántos engranajes tocan ese hueco, que queda vacío.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> 5 × 5, con más números y algunos engranajes puestos.</li>
    <li><b>Difícil:</b> 7 × 7, sin engranajes puestos.</li>
    <li><b>Experto:</b> 8 × 8, con los números justos.</li>
  </ul>
  <h3>Controles</h3>
  <ul>
    <li>Toca un hueco para marcarlo con un punto (aquí no va); otra vez, para poner un engranaje; otra más, para dejarlo vacío.</li>
    <li>Los engranajes unidos a la manivela se ven en latón; los sueltos, en gris. <b>Girar</b> mueve la manivela y todo lo que ya está unido a ella.</li>
  </ul>`
    },

    dice: {
      name: 'Dados',
      tagline: 'Cuatro caras de dado',
      errorsDesc: 'Marca en rojo los dados que no forman una cara válida y las sumas que no cuadran.',
      sum: 'Suma {n}',
      help: `
  <p>Coloca las 12 piezas en el tablero para que cada una de las <b>4 casillas</b> muestre una <b>cara de dado</b> válida, en cualquier orientación.</p>
  <p>Una flecha junto a una fila o columna indica cuánto deben <b>sumar los dos dados</b> de esa fila o columna. Las piezas que ya vienen colocadas (en gris) no se pueden mover; las que pones tú se ven resaltadas. Cada reto tiene una única solución.</p>
  {faces}
  <h3>Controles</h3>
  {gestures}
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero para colocarla.</li>
    <li>Toca una pieza para girarla 90°, en la bandeja o en el tablero.</li>
    <li>Arrastra una pieza fuera del tablero para devolverla a la bandeja.</li>
  </ul>
  <h3>Truco de inicio</h3>
  <p>Los puntos suman siempre 12 entre los 4 dados. Si una fila suma 9, la otra suma 3.</p>`
    },

    circuit: {
      name: 'Circuito',
      tagline: 'Caminos entre los puntos',
      errorsDesc: 'Marca en rojo los caminos que se cortan contra otra pieza o contra el borde.',
      help: `
  <p>Coloca las <b>10 piezas</b> en el tablero para unir los <b>puntos</b> por parejas con caminos: con 2 puntos hay 1 camino, con 4 hay 2 y con 6 hay 3.</p>
  <ul>
    <li>Hay que usar todas las piezas, y cada camino empieza y termina en un punto: no puede quedar ningún tramo suelto ni ningún circuito cerrado.</li>
    <li>Los puntos del reto son todos los que hay: no se pueden añadir otros.</li>
    <li>La mayoría de piezas tienen dos caras con caminos distintos; las rectas y las de dos casillas también se pueden poner por su cara lisa.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> ves la silueta de todas las piezas, pero no los caminos.</li>
    <li><b>Difícil:</b> algunas piezas con punto ya están colocadas.</li>
    <li><b>Experto:</b> solo ves los puntos.</li>
  </ul>
  <h3>Controles</h3>
  {gestures}
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 90°. <b>Voltear</b> cambia de cara la pieza elegida.</li>
  </ul>`
    },

    circle: {
      name: 'Círculo',
      tagline: 'Anillos sin cruzar nervios',
      ribs: 'Nervios',
      ribsAria: 'Girar los nervios del tablero',
      ribsHint: 'Así van los nervios',
      backToTray: ({ n }) => n === 1 ? '1 pieza vuelve a la bandeja' : `${n} piezas vuelven a la bandeja`,
      spotsHelp: 'Con una pieza elegida, los puntos marcan dónde cabe con la cara que tiene: toca uno para verla ahí y otra vez para colocarla. Se puede desactivar en Ajustes.',
      help: `
  <p>Coloca las <b>10 piezas</b> en el tablero hasta llenar sus <b>48 agujeros</b>.</p>
  <ul>
    <li>Las bolas grandes van en el anillo de fuera, las medianas en el del medio y las pequeñas en el de dentro.</li>
    <li>Las piezas giran al moverlas alrededor del tablero y tienen dos caras: tócalas para darles la vuelta.</li>
    <li>Los <b>nervios</b> del borde no se pueden cruzar: una pieza no puede unir dos bolas grandes a ambos lados de un nervio.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <ul>
    <li><b>Fácil:</b> algunas piezas colocadas.</li>
    <li><b>Difícil:</b> una o dos piezas, y no sabes cómo está girado el tablero: solo ves las marcas de algunos nervios en el borde. Gira los nervios con el botón <b>Nervios</b> hasta su sitio.</li>
    <li><b>Experto:</b> dos piezas y ninguna marca: también hay que encontrar dónde van los nervios.</li>
  </ul>
  <h3>Controles</h3>
  {gestures}
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza, en la bandeja o en el tablero, para darle la vuelta.</li>
    <li>{spots}</li>
  </ul>`
    },

    hexagon: {
      name: 'Hexágono',
      tagline: 'Trazos entre las clavijas',
      tapTwiceRotate: 'Toca dos veces: gira 60°',
      help: `
  <p>Coloca las <b>12 piezas</b> en el tablero hasta llenarlo: los trazos pasan entre las clavijas y no puede quedar ningún hueco.</p>
  <ul>
    <li>Las piezas se pueden girar y tienen dos caras: se pueden poner por cualquiera de las dos.</li>
    <li>Las piezas ya colocadas al empezar forman parte del reto: no se mueven.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Fácil</b> al <b>Experto</b> cada vez hay menos piezas colocadas al empezar.</p>
  <h3>Controles</h3>
  {gestures}
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 60°. <b>Voltear</b> le da la vuelta a la pieza elegida.</li>
    <li>{spots}</li>
  </ul>`
    },

    fit: {
      name: 'Encaje',
      tagline: 'Piezas de bolas en un 11 × 5',
      help: `
  <p>Coloca las <b>12 piezas</b> de bolas en el tablero de 11 × 5 hasta llenarlo, sin dejar ningún hueco.</p>
  <ul>
    <li>Las piezas se pueden girar y voltear.</li>
    <li>Las piezas ya colocadas al empezar forman parte del reto: no se mueven.</li>
    <li>Cada reto tiene una sola solución.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Del <b>Fácil</b> al <b>Experto</b> cada vez hay menos piezas puestas al empezar: 7 u 8 en Fácil, 4 en Difícil y solo 3 en Experto.</p>
  <h3>Controles</h3>
  {gestures}
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 90°. <b>Voltear</b> le da la vuelta a la pieza elegida.</li>
  </ul>`
    },

    pentominoes: {
      name: 'Pentominós',
      tagline: 'Llena el tablero sin huecos',
      series: 'Serie {n}',
      solvedOf: '{a} de {n} resueltos',
      row: 'N° {n}',
      pieces: '{n} piezas',
      piecesHead: 'Piezas',
      cellAria: 'Fila {row}, {n} piezas',
      cellSolved: ', resuelto',
      breakdown: '{n} piezas en cada nivel',
      stuck: 'Así no se puede completar: quita alguna pieza',
      help: `
  <p>Cada reto consiste en llenar el tablero con las piezas que te da, sin dejar huecos. En el reto de 5 piezas hay que cubrir 5 filas con 5 piezas; en el de 8, 8 filas con 8 piezas.</p>
  <ul>
    <li>Todas las piezas son pentominós (de 5 casillas) y se pueden girar y voltear.</li>
    <li>Un reto puede tener varias soluciones: vale cualquiera.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Cada nivel tiene una o dos series de filas (A, B, C…). En cada fila empiezas con unas pocas piezas y, al resolver un reto, el siguiente añade una pieza nueva y una fila más de tablero, y empiezas con el tablero vacío. Del <b>Fácil</b> al <b>Experto</b>, cada vez es más difícil.</p>
  <p>Puedes jugar cualquier reto desde la tabla. Los que has resuelto quedan marcados y la partida a medias se guarda para continuarla.</p>
  <h3>Controles</h3>
  {gestures}
  <ul>
    <li>Arrastra una pieza de la bandeja al tablero; arrástrala fuera para devolverla.</li>
    <li>Toca una pieza para elegirla y otra vez para girarla 90°. <b>Voltear</b> le da la vuelta a la pieza elegida.</li>
  </ul>`
    },

    gridlock: {
      name: 'Atasco',
      tagline: 'Saca el coche rojo',
      boardAria: 'Aparcamiento',
      moves: ({ n, min }) => `${n} ${n === 1 ? 'movimiento' : 'movimientos'} · mínimo ${min}`,
      bestMoves: '{n} mov.',
      restarted: 'Vuelta a empezar. Puedes deshacerlo.',
      figure: 'Cada vehículo se mueve solo en su dirección. Baja el coche azul y el rojo llega a la salida.',
      help: `
  <p>Saca el <b>coche rojo</b> por la salida de la derecha. Los coches y camiones solo se mueven hacia delante o hacia atrás, en su dirección, y no pueden saltar por encima de otros.</p>
  {figure}
  <ul>
    <li>Arrastra un vehículo para moverlo. Cada vez que mueves uno, cuenta un movimiento, sin importar cuántas casillas avance.</li>
    <li>Debajo del tablero ves tus movimientos y el mínimo con el que se puede resolver.</li>
  </ul>
  <h3>Niveles</h3>
  <p>Cuantos más movimientos hacen falta, más difícil: de 8 a 13 en Fácil, de 21 a 29 en Difícil y 30 o más en Experto.</p>
  <h3>Controles</h3>
  <ul>
    <li>Deshacer, rehacer y volver a empezar están bajo el tablero.</li>
  </ul>`
    },

    'peg-solitaire': {
      name: 'Solitario',
      tagline: 'Salta hasta dejar una bola',
      level: 'Solitario',
      english: 'Inglés',
      european: 'Europeo',
      board: 'Tablero',
      boardDesc: 'Inglés: 33 agujeros en cruz. Europeo: 37, con un agujero más en cada esquina interior.',
      balls: ({ n }) => n === 1 ? '1 bola' : `${n} bolas`,
      centerWin: '¡Una bola, en el centro!',
      oneBall: '¡Una sola bola!',
      noMoves: 'Sin saltos · {status}',
      restarted: 'Partida reiniciada. Puedes deshacerlo.',
      nextBoard: 'El tablero nuevo se usará en la próxima partida',
      stuck: 'No quedan saltos: {balls}. Puedes deshacer.',
      figure: 'Salta sobre la bola de al lado hasta el hueco; la bola saltada se quita.',
      help: `
  <p>Una bola salta sobre otra vecina, en horizontal o en vertical, hasta un agujero vacío justo detrás. La bola saltada se retira y va a la ranura del borde.</p>
  {figure}
  <ul>
    <li>El objetivo es dejar <b>una sola bola</b>. Lo ideal es que quede en el centro.</li>
    <li>No se salta en diagonal ni sobre más de una bola.</li>
    <li>La partida termina cuando ya no queda ningún salto posible.</li>
  </ul>
  <h3>Tableros</h3>
  <ul>
    <li><b>Inglés</b> (33 agujeros): se empieza con el centro vacío.</li>
    <li><b>Europeo</b> (37 agujeros): tiene un agujero más en cada esquina interior. Con el centro vacío no se puede terminar con una sola bola, así que se empieza con el de encima vacío.</li>
  </ul>
  <p>El tablero se cambia en Ajustes y se usa en la siguiente partida.</p>
  <h3>Controles</h3>
  <ul>
    <li>Toca una bola para elegirla: se marcan los agujeros a los que puede saltar. Toca uno para saltar, o arrastra la bola hasta él.</li>
    <li>Puedes deshacer y rehacer los saltos.</li>
  </ul>`
    },
  }
};
