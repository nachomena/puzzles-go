/* English texts. Same keys as es.js (tests/i18n.test.js checks it). {name} slots are filled in when the text is
   used; texts that change with a number are functions. */
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export default {
  common: {
    back: 'Back',
    menu: 'Menu',
    games: 'Games',
    levels: 'Levels',
    settings: 'Settings',
    help: 'How to play',
    progress: 'Progress',
    hint: 'Hint',
    hintIn: 'Hint available in {time}',
    undo: 'Undo',
    redo: 'Redo',
    reset: 'Restart the game',
    board: 'Board',
    tool: 'Tool',
    pen: 'Write a number',
    pencil: 'Pencil marks',
    erase: 'Clear cell',
    flip: 'Flip',
    done: 'Done',
    close: 'Close',
    cancel: 'Cancel',
    flipAria: 'Flip the selected piece',
    trayAria: 'Pieces not placed yet',
    dragToBoard: 'Drag onto the board',
    tapTwiceRotate: 'Tap twice: rotate',
    tapRotate: 'Tap: rotate',
    tapFlip: 'Tap: flip over',
    flipFace: 'Flip: other side',
    record: 'Best {time}',
    recordWord: 'Best'
  },

  levels: { easy: 'Easy', hard: 'Hard', expert: 'Expert' },

  hub: {
    aria: 'Games',
    choose: 'Choose a game',
    continue: 'Continue',
    gamesCount: ({ n }) => `${n} games`,
    inProgress: 'In progress',
    groups: { pieces: 'Pieces' }
  },

  daily: {
    kicker: 'Daily challenge',
    kickerShort: 'Daily',
    new: 'New today',
    done: 'Done',
    streak: ({ n }) => `${plural(n, 'day', 'days')} streak`,
    solved: ({ n }) => `Daily challenge done · ${plural(n, 'day', 'days')} streak`,
    already: ({ n }) => `You’ve done today’s challenge (${plural(n, 'day', 'days')} streak). There’s another one tomorrow.`
  },

  pro: {
    title: 'Puzzles Go Pro',
    lead: 'Play every level of every game.',
    perkLevels: 'Hard and Expert in every game, with no limit.',
    perkTables: 'Every Pentominoes table.',
    perkStats: 'Progress and statistics for all your games.',
    statsTitle: 'Progress is part of Pro',
    statsText: 'With Pro you see your times, records and charts for every game and level.',
    perkOnce: 'A single payment: no subscription and no ads.',
    free: 'For free you get Easy in every game and the daily challenge.',
    test: 'Test version: the purchase is simulated and nothing is charged.',
    buy: 'Unlock for {price}',
    price: '€9.99',
    restore: 'Restore purchases',
    nothingToRestore: 'There are no purchases to restore',
    webOnly: 'Pro is bought inside the app for iPhone and Android.',
    devOn: 'Test mode on: the purchase is simulated',
    devOff: 'Test mode off',
    thanks: 'Pro unlocked: you now have every level',
    removed: 'Back to the free version',
    badge: 'Pro',
    statusPro: 'Active: every level.',
    statusFree: 'Free: Easy and the daily challenge.',
    go: 'Go Pro',
    reset: 'Remove (test)'
  },

  appSettings: {
    night: 'Night mode',
    nightDesc: 'Warm colours across the app, for playing before bed.',
    language: 'Language',
    languageDesc: 'By default, your phone’s language.',
    languageAuto: 'Phone ({name})'
  },

  backup: {
    title: 'Backup',
    desc: 'There are no accounts or servers: your progress only lives on this device. To switch phones or reinstall the app, export it to a file and import it on the new one. A game in progress is not included.',
    export: 'Export',
    import: 'Import',
    exported: 'Backup saved',
    imported: 'Progress imported',
    confirmTitle: 'Import the progress?',
    confirmText: 'The progress on this device is replaced by the file’s. What you have now in the games the file contains is lost.',
    confirmAccept: 'Import',
    format: 'That file is not a Puzzles Go backup',
    newer: 'The backup is from a newer version: update the app',
    empty: 'The backup has no progress to import',
    failed: 'Could not save: the device is out of space'
  },

  menu: {
    aria: 'Levels',
    newGame: 'New game',
    gameProgress: 'Progress in this game',
    pickAria: 'Choose a puzzle'
  },

  settings: {
    wipe: 'Delete statistics',
    wiped: 'Statistics deleted',
    timer: 'Timer',
    timerDesc: 'Shows how long the game has taken.',
    errors: 'Highlight mistakes',
    cleanNotes: 'Clear pencil marks',
    sameNumbers: 'Highlight matching numbers',
    sameNumbersDesc: 'Marks every cell with the selected number.',
    spots: 'Show where it fits',
    spotsDesc: 'When you pick a piece, marks every place on the board where it fits the way it is turned. Tap one to preview it there and again to place it.',
    spotsHelp: 'With a piece picked, the dots show where it fits the way it is turned: tap one to preview it there and again to place it. You can turn this off in Settings.'
  },

  help: { gotIt: 'Got it' },

  loading: {
    aria: 'Generating',
    title: 'Generating board',
    text: 'Looking for one with a single solution at the chosen difficulty.'
  },

  update: { text: 'A new version is available', apply: 'Update' },

  confirm: {
    newTitle: 'Start another game?',
    newText: 'You have a {level} game in progress ({time}). If you start another, it will be lost.',
    newAccept: 'Start new',
    newKeep: 'Keep playing this one',
    resetTitle: 'Restart the game?',
    resetText: 'Everything you have placed on the board is removed. The timer keeps running.',
    resetAccept: 'Restart'
  },

  play: {
    alreadyEmpty: 'The board is already empty',
    cleared: 'Board cleared. You can undo it.',
    clearedShort: 'Board cleared.',
    nextHint: 'Next hint in {time}',
    pickCell: 'Choose a cell',
    wrongNumber: 'This number doesn’t go here',
    wrongPiece: 'This piece doesn’t go here',
    noRotate: 'It doesn’t fit here rotated',
    noFlip: 'It doesn’t fit here flipped'
  },

  win: {
    aria: 'Board solved',
    title: 'Solved',
    next: 'Next board',
    today: 'Today',
    faster: 'faster',
    slower: 'slower',
    avg: 'average {time}',
    stripAria: 'Today {today}; your average over the last {n}: {avg}',
    vsPrevious: 'Compared with your previous game without hints',
    vsLast: 'Among your last {n} games without hints'
  },

  stats: {
    solvedWithHints: ({ n }) => `${n} solved with hints`,
    seconds: '{n} s',
    minutes: '{time} min',
    sameAsAvg: 'Same as your average.',
    fasterThanAvg: '{d} faster than your average.',
    slowerThanAvg: '{d} slower than your average.',
    newRecord: 'New best in {name}',
    before: ' (was {time}).',
    withHints: ({ n }) => `With ${plural(n, 'hint', 'hints')}.`,
    recordWas: 'Best: {time}.'
  },

  progress: {
    title: 'PROGRESS',
    aria: 'Progress',
    levelAria: 'Progress in a level',
    backGame: 'Back to the game’s progress',
    chipsAria: 'Game',
    empty: 'You haven’t solved any {name} puzzle yet. Each one you solve will show up here, with its date and time.',
    solved: () => 'solved',
    playing: 'playing',
    records: ({ n }) => n === 1 ? 'best time' : 'best times',
    average: 'Average {time} · ',
    games: ({ n }) => plural(n, 'game', 'games'),
    gamesWord: ({ n }) => n === 1 ? 'game' : 'games',
    solvedBefore: ({ n }) => `${n} solved before dates were saved`,
    unsolved: 'Not solved yet',
    record: 'best',
    trendSame: '= Same as last month',
    trendFaster: '↓ {pct}% faster',
    trendSlower: '↑ {pct}% slower',
    hoursMinutes: '{h} h {m} min',
    minutesOnly: '{m} min',
    today: 'today',
    yesterday: 'yesterday',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    rangeAria: 'Period',
    ranges: { last20: 'Last 20', months3: '3 months', all: 'All' },
    avgLabel: 'average',
    avgPeriod: 'period average',
    noneInRange: 'No games in this period.',
    legendGame: 'Game',
    legendHints: 'With hints',
    legendAvg: 'Average of 5',
    legendRecord: 'Best',
    oneGame: 'There is no chart with only one game: it appears from the second.',
    spread: 'How your times are spread',
    last: 'Latest games',
    hints: ({ n }) => plural(n, 'hint', 'hints'),
    withHints: 'with hints',
    tipHints: ({ n }) => `with ${plural(n, 'hint', 'hints')}`,
    recordPill: 'Best',
    belowAvg: '↓ {time} below your average',
    aboveAvg: '↑ {time} above your average',
    moves: '{n} moves',
    chartAria: 'Time of each game',
    histAria: 'Games per time band, from {from} every {step}',
    recordLine: 'Best {time}',
    extraMoves: 'Extra moves',
    perfectOf: '{a} of {n}',
    perfect: 'with the minimum',
    extraAvg: 'extra, on average',
    avgMoves: 'moves on average',
    movesAria: 'Extra moves in the last {n} games',
    movesNote: 'Each bar is a game; a dot means you solved it in the minimum number of moves.',
    gamesAgo: '{n} games ago',
    lastOne: 'latest',
    decimal: '.'
  },

  games: {
    sudoku: {
      name: 'Sudoku',
      tagline: '1 to 9, no repeats',
      errorsDesc: 'Numbers repeated in a row, column or box turn red.',
      notesDesc: 'Placing a number removes it from the pencil marks in its row, column and box.',
      help: `
  <p>Fill the board so that every <b>row</b>, every <b>column</b> and every 3×3 <b>box</b> has the numbers 1 to 9 with no repeats. Every board has a single solution.</p>
  <h3>Controls</h3>
  <ul>
    <li>Tap a cell and then a number on the keypad. Tap the same number again to remove it.</li>
    <li>With the pencil {pencil} you write small candidates in the cell; tap again to remove them.</li>
    <li>The eraser clears the selected cell. On a physical keyboard: numbers, arrows, backspace and <b>N</b> to switch between pencil and number.</li>
  </ul>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> it is enough to see which cell each number fits in.</li>
    <li><b>Hard:</b> you need pairs or triples of candidates and candidates locked in a box.</li>
    <li><b>Expert:</b> always needs an <b>X-Wing</b> or a <b>Swordfish</b>: if a number only fits in the same 2 (or 3) columns in 2 (or 3) rows, it can’t go in any other row of those columns. And the same swapping rows and columns.</li>
  </ul>`
    },

    'killer-sudoku': {
      name: 'Killer Sudoku',
      tagline: 'Sudoku with sum cages',
      errorsDesc: 'Numbers repeated in a row, column, box or cage turn red, and so do cages that don’t add up to their sum.',
      notesDesc: 'Placing a number removes it from the pencil marks in its row, column, box and cage.',
      tint: 'Colour cages',
      tintDesc: 'Tints each cage in a different soft colour.',
      figure: 'Each cage adds up to its number: 8 + 1 = 9 and 9 + 4 + 7 = 20. No number repeats inside a cage.',
      help: `
  <p>It is a Sudoku: every <b>row</b>, every <b>column</b> and every 3 × 3 <b>box</b> holds the numbers 1 to 9 with no repeats.</p>
  {figure}
  <p>On top of that, the board is split into <b>cages</b> with a dotted border. The numbers in a cage <b>add up</b> to the small number in its corner and <b>don’t repeat</b> inside it. Few numbers are given at the start (fewer the harder the level): the rest comes from the sums. Every board has a single solution.</p>
  <h3>Tips</h3>
  <ul>
    <li>Some sums can only be made one way: 3 in two cells is 1 + 2, and 17 is 8 + 9.</li>
    <li><b>The 45 rule:</b> every row, column and box adds up to 45. If you know what the cages that fit entirely inside a box add up to, the remaining cells add up to whatever is left to reach 45.</li>
  </ul>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> small cages, some of a single cell (its number is its sum), and plenty of numbers given; the sums and seeing where each number fits are enough.</li>
    <li><b>Hard:</b> few numbers given; you need locked candidates, pairs and triples.</li>
    <li><b>Expert:</b> cages of up to 4 cells and always the 45 rule in a row, column or box.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Tap a cell and then a number. Tap the same number again to remove it.</li>
    <li>With the pencil {pencil} you write candidates; the eraser clears the cell.</li>
  </ul>`
    },

    kakuro: {
      name: 'Kakuro',
      tagline: 'Cross sums',
      errorsDesc: 'Numbers repeated in a run turn red, and so do runs that don’t add up to their sum.',
      notesDesc: 'Placing a number removes it from the pencil marks in its two runs.',
      figure: 'The top row adds up to 4 (1 + 3) and the bottom one to 11 (2 + 9); the left column to 3 (1 + 2), and the right one to 12 (3 + 9).',
      help: `
  <p>Fill the white cells with numbers from <b>1 to 9</b>. Each <b>run</b> of consecutive white cells, across or down, adds up to the number in the black cell to its left or above it, and <b>doesn’t repeat</b> any number.</p>
  {figure}
  <p>In each black cell, the top number is the sum of the run that starts to its right, and the bottom one, the sum of the run that starts below it. Every board has a single solution.</p>
  <h3>Tips</h3>
  <ul>
    <li>Some sums can only be made one way: 3 in two cells is 1 + 2, 4 is 1 + 3, 16 is 7 + 9 and 17 is 8 + 9. In three: 6 is 1 + 2 + 3, 7 is 1 + 2 + 4, 23 is 6 + 8 + 9 and 24 is 7 + 8 + 9.</li>
    <li>A cell belongs to two runs: it can only hold a number that works for both.</li>
  </ul>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> 6 × 6. The combinations of each run are enough.</li>
    <li><b>Hard:</b> 10 × 10. You have to cross what each cell allows with the combinations of the whole run.</li>
    <li><b>Expert:</b> 12 × 12, with runs of up to 9 cells.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Tap a white cell and then a number. Tap the same number again to remove it.</li>
    <li>With the pencil {pencil} you write candidates; the eraser clears the cell.</li>
  </ul>`
    },

    calcudoku: {
      name: 'Calcudoku',
      tagline: 'Arithmetic in cages',
      errorsDesc: 'Numbers repeated in a row or column turn red.',
      notesDesc: 'Placing a number removes it from the pencil marks in its row and column.',
      tint: 'Colour cages',
      tintDesc: 'Tints each cage in a different soft colour.',
      figure: 'In the 6+ cage, 1 + 2 + 3 = 6; in the 2× cage, 1 × 2 = 2. No number repeats in its row or column.',
      help: `
  <p>Fill the N × N board with the numbers <b>1 to N</b> without repeating in any <b>row</b> or <b>column</b>.</p>
  {figure}
  <p>Each <b>cage</b> (thick border) shows the result of an operation on its numbers: <b>+</b> adds, <b>×</b> multiplies, <b>−</b> subtracts and <b>÷</b> divides (these two, larger by smaller). A one-cell cage simply gives its number. Numbers can repeat inside a cage as long as they aren’t in the same row or column.</p>
  <p>Every board has a single solution.</p>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> 5 × 5, with addition, subtraction and multiplication.</li>
    <li><b>Hard:</b> 6 × 6, with all four operations and no one-cell cages.</li>
    <li><b>Expert:</b> 7 × 7, with no one-cell cages.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Tap a cell and then a number. Tap the same number again to remove it.</li>
    <li>With the pencil {pencil} you write candidates; the eraser clears the cell.</li>
  </ul>`
    },

    'star-battle': {
      name: 'Star Battle',
      tagline: 'Stars that never touch',
      autoX: 'Automatic X marks',
      autoXDesc: 'Puts X marks around every star you place.',
      errorsDesc: 'Stars that break a rule turn red.',
      tint: 'Colour regions',
      tintDesc: 'Tints each region in a different shade.',
      toolStar: 'Stars and X marks',
      toolTry: 'Trial stars',
      wrongStar: 'This star doesn’t go here',
      missingStar: 'A star goes here',
      broken: {
        region: 'There can’t be more than {k} stars in a region.',
        row: 'There can’t be more than {k} stars in a row.',
        col: 'There can’t be more than {k} stars in a column.',
        touch: 'Two stars can’t touch, not even diagonally.'
      },
      help: `
  <p>Place stars so that every <b>row</b>, every <b>column</b> and every <b>region</b> (area outlined by a thick line) has exactly 2 stars.</p>
  <p>Two stars can never touch, not even diagonally. All boards are 10×10 and have a single solution; the difficulty depends on the shape of the regions.</p>
  <h3>Controls</h3>
  {demo}
  <ul>
    <li>Tap a cell to go from empty to X, from X to star and from star to empty.</li>
    <li>Drag your finger to mark several X’s in a row.</li>
    <li>With the trial tool you place <b>trial stars</b> {try} to test a guess. They count as stars: they put their X marks and, if they break a rule, their cell turns red.</li>
    <li>If the guess leads nowhere, <b>tap the trial star again</b> {try}, with either tool: the board goes back to how it was before you placed it, without it and without anything you did after. If you change your mind, undo brings it back.</li>
  </ul>
  <h3>Getting started</h3>
  <p>Start with the small regions: if a region fits in a single row or column, the stars of that row or column are already decided.</p>`
    },

    loop: {
      name: 'Loop',
      tagline: 'One loop between the dots',
      errorsDesc: 'Numbers with more lines than they say and dots with more than two lines turn red.',
      extraLine: 'This line shouldn’t be here',
      missingLine: 'A line goes here',
      figure: 'Each number says how many of its four sides belong to the loop. Cells without a number can have any amount.',
      help: `
  <p>Join the dots with a <b>single closed loop</b>, horizontally and vertically. The loop never crosses or touches itself, and each dot has 0 or 2 lines.</p>
  {figure}
  <p>Each <b>number</b> says how many of the four sides of its cell belong to the loop. Every board has a single solution.</p>
  <h3>Tips</h3>
  <ul>
    <li>A 0 crosses out its four sides. A 3 in a corner gets both of its corner sides.</li>
    <li>The loop separates the inside cells from the outside ones: a line between two cells means one is inside and the other outside.</li>
  </ul>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> 5 × 5. The numbers and having 0 or 2 lines at each dot are enough.</li>
    <li><b>Hard:</b> 8 × 8. Besides the corners and not closing a small loop too early, you have to think about which cells are inside and which outside.</li>
    <li><b>Expert:</b> 10 × 10, with the same as Hard.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Tap a side to draw a line; a second tap crosses it out and another leaves it empty.</li>
    <li>Drag from dot to dot to draw several lines in a row. If you start on a line, dragging erases them.</li>
  </ul>`
    },

    'light-up': {
      name: 'Light Up',
      tagline: 'Light up the whole board',
      errorsDesc: 'Bulbs that see each other and numbers that can no longer be met (too many bulbs, or no room for the missing ones) turn red.',
      noBulb: 'A bulb doesn’t go here',
      bulb: 'A bulb goes here',
      figure: 'The bulb lights its row and column up to a black cell. The 1 has exactly one bulb next to it.',
      help: `
  <p>Place <b>bulbs</b> on the white cells until <b>all of them are lit</b>.</p>
  {figure}
  <ul>
    <li>A bulb lights its row and column until a black cell blocks the light.</li>
    <li>Two bulbs can’t light each other.</li>
    <li>A number on a black cell says how many bulbs are right next to it (above, below, left and right). Black cells without a number can have any amount.</li>
    <li>Every puzzle has a single solution.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Tap a cell to mark it with a dot (no bulb here); again to place a bulb; once more to leave it empty.</li>
  </ul>`
    },

    binary: {
      name: 'Binary',
      tagline: 'Red and blue, half and half',
      errorsDesc: 'Crosses out cells that break a rule: three in a row, more than half of one colour in a line, or two identical lines.',
      wrongColor: 'This colour doesn’t go here',
      why: {
        trio: 'This avoids three in a row',
        half: 'This line already has half of that colour',
        unique: 'Otherwise two lines would be identical',
        look: 'The other colour wouldn’t work',
        none: 'This cell goes like this'
      },
      figure: 'The top row has three reds in a row. The bottom one doesn’t, and has as many reds as blues.',
      help: `
  <p>Fill the board with <b>red</b> and <b>blue</b>.</p>
  {figure}
  <ul>
    <li>There can’t be <b>three of the same in a row</b> in any row or column.</li>
    <li>Each row and each column has <b>as many reds as blues</b>.</li>
    <li><b>No two rows are the same</b>, and no two columns either.</li>
    <li>Every puzzle has a single solution and can be solved without guessing.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Tap a cell to make it red; again, blue; once more, empty. The given cells (with a dot) can’t be changed.</li>
  </ul>`
    },

    bridges: {
      name: 'Bridges',
      tagline: 'Bridges between islands',
      errors: 'Mark islands with too many bridges',
      errorsDesc: 'Islands that already have more bridges than their number turn red.',
      boardAria: 'Islands',
      extraBridge: 'One bridge too many here',
      crosses: 'It crosses another bridge',
      figure: 'Each number says how many bridges leave the island: 1, 1 + 2 = 3 and 2.',
      help: `
  <p>Connect all the <b>islands</b> with <b>bridges</b>. The number on each island says how many bridges leave it.</p>
  {figure}
  <ul>
    <li>Bridges run in a straight line, horizontally or vertically, between two islands.</li>
    <li>There can be one or two bridges between two islands, at most.</li>
    <li>Bridges can’t cross each other or pass over an island.</li>
    <li>In the end, you must be able to get from any island to all the others.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Swipe from an island towards its neighbour, or tap the gap between them, to place a bridge. Repeat for the second; a third time removes them.</li>
    <li>Double-tap an island to remove all its bridges.</li>
    <li>Islands that already have all their bridges look dimmer.</li>
  </ul>`
    },

    trail: {
      name: 'Trail',
      tagline: 'One path through every cell',
      detour: 'The path goes the wrong way here',
      figure: 'A single path through every cell, passing 1, 2 and 3 in order.',
      help: `
  <p>Draw <b>a single path</b> that goes through <b>every cell</b> of the board exactly once and touches the numbers <b>in order</b>: it starts at 1 and ends at the highest number.</p>
  {figure}
  <ul>
    <li>The path goes from a cell to a neighbouring one, horizontally or vertically (never diagonally).</li>
    <li>Every puzzle has a single solution.</li>
  </ul>
  <h3>Levels</h3>
  <p>From <b>Easy</b> (6 × 6) to <b>Expert</b> (7 × 7) the board grows and there are fewer numbers to guide you.</p>
  <h3>Controls</h3>
  <ul>
    <li>Drag from the 1 to draw; you can let go and carry on from the end.</li>
    <li>Go back over the path to erase it, or tap a cell on the path to make it end there.</li>
  </ul>`
    },

    gears: {
      name: 'Gears',
      tagline: 'From the crank to the lock',
      errorsDesc: 'Numbers that already have too many gears turn red, and so does the chain when it closes a circle.',
      turn: 'Turn',
      turnAria: 'Turn the crank',
      jam: 'It jams: there is a circle of gears',
      notLinked: 'The lock isn’t connected to the crank yet',
      wrongWay: 'Something turns against its arrow',
      loose: 'There are loose gears left over',
      clues: 'The lock turns, but a number doesn’t add up',
      noGear: 'A gear doesn’t go here',
      gear: 'A gear goes here',
      figure: 'The crank (silver) drives the chain to the lock (green). Each number counts the gears touching its slot.',
      help: `
  <p>Place <b>gears</b> in the slots so the <b>crank</b> turns the <b>lock</b> and opens it.</p>
  {figure}
  <ul>
    <li>All the gears form <b>a single chain</b> with the crank, with no loose pieces.</li>
    <li>The chain can’t <b>close any circle</b>: a circle of gears jams.</li>
    <li>Two touching gears turn in <b>opposite directions</b>. The crank turns clockwise; the arrows show which way the lock and each gear already in place must turn.</li>
    <li>A <b>number</b> says how many gears touch that slot, which stays empty.</li>
    <li>Every puzzle has a single solution.</li>
  </ul>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> 5 × 5, with more numbers and some gears already placed.</li>
    <li><b>Hard:</b> 7 × 7, with no gears placed.</li>
    <li><b>Expert:</b> 8 × 8, with just enough numbers.</li>
  </ul>
  <h3>Controls</h3>
  <ul>
    <li>Tap a slot to mark it with a dot (no gear here); again to place a gear; once more to leave it empty.</li>
    <li>Gears connected to the crank look brass; loose ones, grey. <b>Turn</b> moves the crank and everything already connected to it.</li>
  </ul>`
    },

    dice: {
      name: 'Dice',
      tagline: 'Four dice faces',
      errorsDesc: 'Dice that don’t make a valid face and sums that don’t add up turn red.',
      sum: 'Sum {n}',
      help: `
  <p>Place the 12 pieces on the board so that each of the <b>4 squares</b> shows a valid <b>die face</b>, in any orientation.</p>
  <p>An arrow next to a row or column says what the <b>two dice</b> in that row or column must <b>add up to</b>. Pieces already placed (in grey) can’t be moved; the ones you place are highlighted. Every puzzle has a single solution.</p>
  {faces}
  <h3>Controls</h3>
  {gestures}
  <ul>
    <li>Drag a piece from the tray onto the board to place it.</li>
    <li>Tap a piece to rotate it 90°, in the tray or on the board.</li>
    <li>Drag a piece off the board to return it to the tray.</li>
  </ul>
  <h3>Getting started</h3>
  <p>The dots of the 4 dice always add up to 12. If one row adds up to 9, the other adds up to 3.</p>`
    },

    circuit: {
      name: 'Circuit',
      tagline: 'Paths between the dots',
      errorsDesc: 'Paths that run into another piece or the edge turn red.',
      help: `
  <p>Place the <b>10 pieces</b> on the board to join the <b>dots</b> in pairs with paths: there is one path for every two dots (with 6 dots, 3 paths).</p>
  <ul>
    <li>You must use every piece, and each path starts and ends at a dot: no loose ends and no closed circuits.</li>
    <li>The dots in the puzzle are all there are: you can’t add others.</li>
    <li>Most pieces have two sides with different paths; the straight ones and the two-cell ones can also be placed on their blank side.</li>
  </ul>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> you see the outline of every piece, but not the paths.</li>
    <li><b>Hard:</b> some pieces with a dot are already placed.</li>
    <li><b>Expert:</b> you only see the dots.</li>
  </ul>
  <h3>Controls</h3>
  {gestures}
  <ul>
    <li>Drag a piece from the tray onto the board; drag it off to return it.</li>
    <li>Tap a piece to pick it and again to rotate it 90°. <b>Flip</b> turns the picked piece to its other side.</li>
  </ul>`
    },

    circle: {
      name: 'Circle',
      tagline: 'Rings without crossing ribs',
      ribs: 'Ribs',
      ribsAria: 'Turn the board’s ribs',
      ribsHint: 'This is where the ribs go',
      backToTray: ({ n }) => n === 1 ? '1 piece goes back to the tray' : `${n} pieces go back to the tray`,
      spotsHelp: 'With a piece picked, the dots show where it fits on the side it shows: tap one to preview it there and again to place it. You can turn this off in Settings.',
      help: `
  <p>Place the <b>10 pieces</b> on the board until its <b>48 holes</b> are filled.</p>
  <ul>
    <li>Big balls go in the outer ring, medium ones in the middle ring and small ones in the inner ring.</li>
    <li>Pieces turn as you move them around the board and have two sides: tap them to flip them over.</li>
    <li>The <b>ribs</b> on the edge can’t be crossed: a piece can’t join two big balls on both sides of a rib.</li>
    <li>Every puzzle has a single solution.</li>
  </ul>
  <h3>Levels</h3>
  <ul>
    <li><b>Easy:</b> some pieces already placed.</li>
    <li><b>Hard:</b> one or two pieces, and you don’t know how the board is turned: you only see the marks of some ribs on the edge. Turn the ribs with the <b>Ribs</b> button into place.</li>
    <li><b>Expert:</b> two pieces and no marks: you also have to find where the ribs go.</li>
  </ul>
  <h3>Controls</h3>
  {gestures}
  <ul>
    <li>Drag a piece from the tray onto the board; drag it off to return it.</li>
    <li>Tap a piece, in the tray or on the board, to flip it over.</li>
    <li>{spots}</li>
  </ul>`
    },

    hexagon: {
      name: 'Hexagon',
      tagline: 'Lines between the pegs',
      tapTwiceRotate: 'Tap twice: rotate 60°',
      help: `
  <p>Place the <b>12 pieces</b> on the board until it is full: the lines run between the pegs and no gap can be left.</p>
  <ul>
    <li>Pieces can be rotated and have two sides: they can be placed on either.</li>
    <li>Pieces already placed at the start are part of the puzzle: they don’t move.</li>
    <li>Every puzzle has a single solution.</li>
  </ul>
  <h3>Levels</h3>
  <p>From <b>Easy</b> to <b>Expert</b> there are fewer and fewer pieces placed at the start.</p>
  <h3>Controls</h3>
  {gestures}
  <ul>
    <li>Drag a piece from the tray onto the board; drag it off to return it.</li>
    <li>Tap a piece to pick it and again to rotate it 60°. <b>Flip</b> turns the picked piece over.</li>
    <li>{spots}</li>
  </ul>`
    },

    fit: {
      name: 'Fit',
      tagline: 'Ball pieces on a 10 × 6 board',
      help: `
  <p>Place the <b>12 ball pieces</b> on the 10 × 6 board until it is full, without leaving any gap.</p>
  <ul>
    <li>Pieces can be rotated and flipped.</li>
    <li>Pieces already placed at the start are part of the puzzle: they don’t move.</li>
    <li>Every puzzle has a single solution.</li>
  </ul>
  <h3>Levels</h3>
  <p>From <b>Easy</b> to <b>Expert</b> there are fewer pieces placed at the start: 7 or 8 in Easy, 4 in Hard and only 3 in Expert.</p>
  <h3>Controls</h3>
  {gestures}
  <ul>
    <li>Drag a piece from the tray onto the board; drag it off to return it.</li>
    <li>Tap a piece to pick it and again to rotate it 90°. <b>Flip</b> turns the picked piece over.</li>
  </ul>`
    },

    pentominoes: {
      name: 'Pentominoes',
      tagline: 'Fill the board without gaps',
      series: 'Set {n}',
      solvedOf: '{a} of {n} solved',
      row: 'No. {n}',
      pieces: '{n} pieces',
      piecesHead: 'Pieces',
      cellAria: 'Row {row}, {n} pieces',
      cellSolved: ', solved',
      breakdown: '{n} pieces in each level',
      stuck: 'It can’t be completed like this: remove a piece',
      help: `
  <p>Each puzzle is about filling the board with the pieces it gives you, without leaving gaps. In the 5-piece puzzle you cover 5 rows with 5 pieces; in the 8-piece one, 8 rows with 8 pieces.</p>
  <ul>
    <li>All the pieces are pentominoes (5 squares each) and can be rotated and flipped.</li>
    <li>A puzzle can have several solutions: any of them counts.</li>
  </ul>
  <h3>Levels</h3>
  <p>Each level has one or two sets of rows (A, B, C…). In each row you start with a few pieces and, when you solve a puzzle, the next one adds a new piece and one more row of board, and you start with an empty board. From <b>Easy</b> to <b>Expert</b>, it gets harder each time.</p>
  <p>You can play any puzzle from the table. The ones you have solved are marked, and a game in progress is saved so you can continue it.</p>
  <h3>Controls</h3>
  {gestures}
  <ul>
    <li>Drag a piece from the tray onto the board; drag it off to return it.</li>
    <li>Tap a piece to pick it and again to rotate it 90°. <b>Flip</b> turns the picked piece over.</li>
  </ul>`
    },

    gridlock: {
      name: 'Gridlock',
      tagline: 'Get the red car out',
      boardAria: 'Car park',
      moves: ({ n, min }) => `${plural(n, 'move', 'moves')} · minimum ${min}`,
      bestMoves: '{n} moves',
      restarted: 'Back to the start. You can undo it.',
      figure: 'Each vehicle only moves along its own direction. Move the blue car down and the red one reaches the exit.',
      help: `
  <p>Get the <b>red car</b> out through the exit on the right. Cars and trucks only move forwards or backwards, along their direction, and can’t jump over others.</p>
  {figure}
  <ul>
    <li>Drag a vehicle to move it. Each time you move one counts as one move, however many cells it travels.</li>
    <li>Under the board you see your moves and the minimum it can be solved in.</li>
  </ul>
  <h3>Levels</h3>
  <p>The more moves needed, the harder: 8 to 13 in Easy, 21 to 29 in Hard and 30 or more in Expert.</p>
  <h3>Controls</h3>
  <ul>
    <li>Undo, redo and starting over are under the board.</li>
  </ul>`
    },

    'peg-solitaire': {
      name: 'Peg Solitaire',
      tagline: 'Jump until one ball is left',
      level: 'Peg Solitaire',
      english: 'English',
      european: 'European',
      board: 'Board',
      boardDesc: 'English: 33 holes in a cross. European: 37, with one more hole in each inner corner.',
      balls: ({ n }) => plural(n, 'ball', 'balls'),
      centerWin: 'One ball, in the centre!',
      oneBall: 'Just one ball!',
      noMoves: 'No jumps · {status}',
      restarted: 'Game restarted. You can undo it.',
      nextBoard: 'The new board will be used in the next game',
      stuck: 'No jumps left: {balls}. You can undo.',
      figure: 'Jump over the ball next to it into the hole; the ball jumped over is removed.',
      help: `
  <p>A ball jumps over a neighbouring one, horizontally or vertically, into an empty hole right behind it. The ball jumped over is removed and goes to the groove on the edge.</p>
  {figure}
  <ul>
    <li>The goal is to leave <b>a single ball</b>. Ideally it ends up in the centre.</li>
    <li>No diagonal jumps and no jumping over more than one ball.</li>
    <li>The game ends when no jump is possible.</li>
  </ul>
  <h3>Boards</h3>
  <ul>
    <li><b>English</b> (33 holes): you start with the centre empty.</li>
    <li><b>European</b> (37 holes): it has one more hole in each inner corner. With the centre empty you can’t finish with a single ball, so you start with the hole above it empty.</li>
  </ul>
  <p>The board is changed in Settings and is used in the next game.</p>
  <h3>Controls</h3>
  <ul>
    <li>Tap a ball to pick it: the holes it can jump to are marked. Tap one to jump, or drag the ball to it.</li>
    <li>You can undo and redo jumps.</li>
  </ul>`
    }
  }
};
