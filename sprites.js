// Generador de sprites pixel art retro en canvases offscreen
const SpriteBank = (() => {
  const cache = {};

  function buildSprite(key, grid, palette, scale = 1) {
    if (cache[key]) return cache[key];
    const h = grid.length;
    const w = grid[0].length;
    const c = document.createElement('canvas');
    c.width = w * scale;
    c.height = h * scale;
    const ctx = c.getContext('2d');
    for (let y = 0; y < h; y++) {
      const row = grid[y];
      for (let x = 0; x < w; x++) {
        const ch = row[x];
        if (ch === '.' || !palette[ch]) continue;
        ctx.fillStyle = palette[ch];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    cache[key] = c;
    return c;
  }

  // Paleta del Astronauta
  const astroPal = {
    W: '#f4f7ff', // Traje blanco
    S: '#bfc9e0', // Sombra traje
    B: '#2e3856', // Botas / detalles oscuros
    C: '#4deeea', // Visor cian
    D: '#1e88a8', // Sombra visor
    R: '#ff4f6d', // Franja roja / mochila
    G: '#ffd54f', // Hebilla dorada
    P: '#9aa5c4'  // Pistola espacial
  };

  // Astronauta 16x16 (Idle / Walk1 / Walk2 / Jump)
  const astroIdle = [
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWCCCCCCWW...',
    '...WWCCDDDDWW...',
    '...WWWWWWWWWW...',
    '....SSSSSSSS....',
    '..RRWWWWWWWW....',
    '..RRWWGGGGWWPP..',
    '..RRWWWWWWWWPPP.',
    '..RRSSSSSSSS....',
    '....WWWWWWWW....',
    '....WWW..WWW....',
    '....WWW..WWW....',
    '....SSS..SSS....',
    '...BBBB..BBBB...',
    '................'
  ];

  const astroWalk1 = [
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWCCCCCCWW...',
    '...WWCCDDDDWW...',
    '...WWWWWWWWWW...',
    '....SSSSSSSS....',
    '..RRWWWWWWWW....',
    '..RRWWGGGGWWPP..',
    '..RRWWWWWWWWPPP.',
    '..RRSSSSSSSS....',
    '....WWWWWWWW....',
    '...WWW....WWW...',
    '..SSS......SSS..',
    '..BBB......BBB..',
    '................',
    '................'
  ];

  const astroWalk2 = [
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWCCCCCCWW...',
    '...WWCCDDDDWW...',
    '...WWWWWWWWWW...',
    '....SSSSSSSS....',
    '..RRWWWWWWWW....',
    '..RRWWGGGGWWPP..',
    '..RRWWWWWWWWPPP.',
    '..RRSSSSSSSS....',
    '....WWWWWWWW....',
    '.....WW..WW.....',
    '....SSS..SSS....',
    '....BBB..BBB....',
    '................',
    '................'
  ];

  const astroJump = [
    '....WWWWWWWW....',
    '...WWWWWWWWWW...',
    '...WWCCCCCCWW...',
    '...WWCCDDDDWW...',
    '...WWWWWWWWWW...',
    '....SSSSSSSS....',
    '..RRWWWWWWWWPP..',
    '..RRWWGGGGWWPPP.',
    '..RRWWWWWWWW....',
    '..RRSSSSSSSS....',
    '...WWWWWWWWWW...',
    '..WWW......WWW..',
    '..BBB......BBB..',
    '................',
    '................',
    '................'
  ];

  // Paleta del Perrito Schnauzer (Max) con casco espacial
  const dogPal = {
    H: '#9beeff', // Brillo casco
    G: '#8f99ad', // Pelaje gris sal y pimienta
    D: '#5b6375', // Pelaje gris oscuro
    L: '#dce2ee', // Barba y cejas blancas de schnauzer
    N: '#1b1f2b', // Nariz y ojos
    C: '#ff4f6d'  // Collar espacial rojo
  };

  // Schnauzer 14x12 (Run1 / Run2 / Idle)
  const dogIdle = [
    '..D..HHHH..D..',
    '.DGHHGGGGHHGD.',
    '.DGGLLLLLLGGD.',
    '..GGNNGGNNGG..',
    '..GGLLLLLLGG..',
    '...GLLLLLLG...',
    '...CCCCCCCC...',
    '..GGGGGGGGGG..',
    '.DGGGGGGGGGGD.',
    '..GGG....GGG..',
    '..DDD....DDD..',
    '..............'
  ];

  const dogRun1 = [
    '..D..HHHH..D..',
    '.DGHHGGGGHHGD.',
    '.DGGLLLLLLGGD.',
    '..GGNNGGNNGG..',
    '..GGLLLLLLGG..',
    '...GLLLLLLG...',
    '...CCCCCCCC...',
    '.DGGGGGGGGGG..',
    '..GGGGGGGGGG..',
    '.DDD......DDD.',
    '..............',
    '..............'
  ];

  const dogRun2 = [
    '..D..HHHH..D..',
    '.DGHHGGGGHHGD.',
    '.DGGLLLLLLGGD.',
    '..GGNNGGNNGG..',
    '..GGLLLLLLGG..',
    '...GLLLLLLG...',
    '...CCCCCCCC...',
    '..GGGGGGGGGGD.',
    '..GGGGGGGGGG..',
    '....DDD..DDD..',
    '..............',
    '..............'
  ];

  // Estrella coleccionable (12x12)
  const starPal = {
    Y: '#ffd54f',
    L: '#fff59d',
    O: '#f59f00'
  };

  const starGrid1 = [
    '.....YY.....',
    '.....YY.....',
    '....YLLY....',
    'YYYYYLLYYYYY',
    '.YYYYLLYYYY.',
    '..YYYLLYYY..',
    '...YYYYYY...',
    '..YYY..YYY..',
    '.YYY....YYY.',
    '.OO......OO.',
    '............',
    '............'
  ];

  const starGrid2 = [
    '.....YY.....',
    '.....YY.....',
    '....YLLY....',
    '..YYYYYYYY..',
    '...YYLLYY...',
    '...YYLLYY...',
    '...YYYYYY...',
    '...YY..YY...',
    '..YY....YY..',
    '..OO....OO..',
    '............',
    '............'
  ];

  // Meteoro (16x16)
  const meteorPal = {
    R: '#8d5b4c',
    D: '#5a352c',
    L: '#c48b78',
    F: '#ff7043',
    Y: '#ffd54f'
  };

  const meteorGrid = [
    '....DDDDDDDD....',
    '..DDRRRRRRRRFF..',
    '.DRRLLRRRRRRFFY.',
    '.DRLLRRRRDDDRFY.',
    'DRRRRRRRDDDDDRR.',
    'DRRDDDDLRRRRRRR.',
    'DRRDDLLRRRRRRRR.',
    'DRRRRRRRRDDDDDR.',
    '.DRRRRRRDDDDDR..',
    '.DRRRLRRRRRRDD..',
    '..DDRRRRRRRDD...',
    '....DDDDDDDD....',
    '................',
    '................',
    '................',
    '................'
  ];

  // Cometa (16x12)
  const cometPal = {
    C: '#4deeea',
    W: '#e0ffff',
    B: '#1e88e5',
    P: '#90caf9'
  };

  const cometGrid = [
    '......BBBB......',
    '...BBBCCCCPPP...',
    '.BBCCWWWWWWCCPP.',
    'BCCCWWWWWWWWWWCP',
    'BCCWWWWWWWWWWWWP',
    'BCCCWWWWWWWWWWCP',
    '.BBCCWWWWWWCCPP.',
    '...BBBCCCCPPP...',
    '......BBBB......',
    '................',
    '................',
    '................'
  ];

  // Cohete espacial (Meta del nivel) 24x32
  const rocketPal = {
    W: '#f4f7ff',
    S: '#b8c4e0',
    R: '#e63956',
    C: '#4deeea',
    D: '#1e88a8',
    Y: '#ffd54f',
    O: '#ff7043'
  };

  const rocketGrid = [
    '...........RR...........',
    '..........RRRR..........',
    '.........RRRRRR.........',
    '........RRRRRRRR........',
    '........WWWWWWWW........',
    '.......WWWWWWWWWW.......',
    '.......WWWCCCCWWW.......',
    '.......WWCCDDCCWW.......',
    '.......WWCCCCCCWW.......',
    '.......WWWWWWWWWW.......',
    '......WWWWWWWWWWWW......',
    '......WWWWSSSSWWWW......',
    '......WWWWSSSSWWWW......',
    '......RRRRWWWWWRRR......',
    '.....RRRRRWWWWWRRRR.....',
    '....RRRRRRWWWWWRRRRR....',
    '....RRRR..WWWW..RRRR....',
    '....RR....SSSS....RR....',
    '.........OOOOOO.........',
    '........OOYYYYOO........',
    '.........OYYYYO.........',
    '..........YYYY..........',
    '...........YY...........'
  ];

  return {
    getAstro(frame) {
      if (frame === 'jump') return buildSprite('astro_jump', astroJump, astroPal);
      if (frame === 'walk1') return buildSprite('astro_w1', astroWalk1, astroPal);
      if (frame === 'walk2') return buildSprite('astro_w2', astroWalk2, astroPal);
      return buildSprite('astro_idle', astroIdle, astroPal);
    },
    getDog(frame) {
      if (frame === 'run1') return buildSprite('dog_r1', dogRun1, dogPal);
      if (frame === 'run2') return buildSprite('dog_r2', dogRun2, dogPal);
      return buildSprite('dog_idle', dogIdle, dogPal);
    },
    getStar(frame) {
      return frame === 0
        ? buildSprite('star0', starGrid1, starPal)
        : buildSprite('star1', starGrid2, starPal);
    },
    getMeteor() {
      return buildSprite('meteor', meteorGrid, meteorPal);
    },
    getComet() {
      return buildSprite('comet', cometGrid, cometPal);
    },
    getRocket() {
      return buildSprite('rocket', rocketGrid, rocketPal);
    }
  };
})();
