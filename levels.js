// Definición de los 3 planetas (niveles) estilo Super Mario Bros.
// TILE = 16px. Alto de pantalla = 270px (~17 tiles). Suelo base en fila 14 y 15 (y=224..256).

const TILE = 16;

const PLANETS = [
  {
    id: '1-1 LUNA',
    name: 'PLANETA 1: LUNA CRÁTER',
    subtitle: 'Baja gravedad lunar. ¡Cuidado con los meteoros rodantes!',
    gravity: 0.34,
    skyTop: '#070b1e',
    skyBottom: '#161e42',
    groundTop: '#8f9bb8',
    groundFill: '#555e7a',
    brickColor: '#6f7999',
    brickAccent: '#9da8c7',
    qBlockColor: '#ffd54f',
    accentPlanet: { x: 360, y: 58, r: 28, color: '#3b4a7a', ring: true },
    widthTiles: 135,
    gaps: [
      [26, 28],
      [52, 55],
      [81, 84],
      [108, 111]
    ],
    // Plataformas flotantes, ladrillos y bloques '?'
    blocks: [
      // Primer grupo clásico estilo 1-1
      { tx: 14, ty: 10, type: 'question', item: 'star' },
      { tx: 18, ty: 10, type: 'brick' },
      { tx: 19, ty: 10, type: 'question', item: 'power' },
      { tx: 20, ty: 10, type: 'brick' },
      { tx: 21, ty: 10, type: 'question', item: 'star' },
      { tx: 20, ty: 6, type: 'question', item: 'star' },

      // Puente sobre primer cráter
      { tx: 25, ty: 11, type: 'brick' },
      { tx: 26, ty: 11, type: 'brick' },
      { tx: 27, ty: 11, type: 'brick' },
      { tx: 28, ty: 11, type: 'brick' },

      // Escalera lunar
      { tx: 36, ty: 13, type: 'brick' },
      { tx: 37, ty: 12, type: 'brick' },
      { tx: 38, ty: 11, type: 'brick' },
      { tx: 42, ty: 9, type: 'question', item: 'star' },
      { tx: 43, ty: 9, type: 'question', item: 'star' },

      // Zona media
      { tx: 58, ty: 10, type: 'brick' },
      { tx: 59, ty: 10, type: 'question', item: 'power' },
      { tx: 60, ty: 10, type: 'brick' },
      { tx: 64, ty: 7, type: 'brick' },
      { tx: 65, ty: 7, type: 'brick' },
      { tx: 66, ty: 7, type: 'question', item: 'star' },
      { tx: 67, ty: 7, type: 'brick' },

      // Segundo tramo elevado
      { tx: 76, ty: 11, type: 'brick' },
      { tx: 77, ty: 11, type: 'brick' },
      { tx: 82, ty: 10, type: 'question', item: 'star' },
      { tx: 88, ty: 10, type: 'brick' },
      { tx: 89, ty: 10, type: 'question', item: 'power' },
      { tx: 90, ty: 10, type: 'brick' },

      // Rampa final hacia el cohete
      { tx: 115, ty: 13, type: 'brick' },
      { tx: 116, ty: 12, type: 'brick' },
      { tx: 117, ty: 11, type: 'brick' },
      { tx: 118, ty: 10, type: 'brick' }
    ],
    // Arcos de estrellas
    stars: [
      [10, 12], [11, 12], [12, 12],
      [26, 9], [27, 9], [28, 9],
      [37, 10], [38, 9], [39, 8],
      [48, 12], [49, 11], [50, 12],
      [53, 8], [54, 8],
      [64, 5], [65, 5], [66, 5], [67, 5],
      [72, 12], [73, 12], [74, 12],
      [82, 8], [83, 8],
      [96, 11], [97, 10], [98, 11],
      [104, 12], [105, 12],
      [116, 10], [117, 9], [118, 8]
    ],
    meteorRate: 2.3,
    cometRate: 3.8,
    rocketTx: 126
  },
  {
    id: '2-1 MARTE',
    name: 'PLANETA 2: MARTE CARMESÍ',
    subtitle: 'Tormentas de cometas veloces y cañones profundos.',
    gravity: 0.39,
    skyTop: '#1c090d',
    skyBottom: '#4a181d',
    groundTop: '#e06b48',
    groundFill: '#8c3723',
    brickColor: '#b34b30',
    brickAccent: '#f08a65',
    qBlockColor: '#ffd54f',
    accentPlanet: { x: 140, y: 52, r: 22, color: '#ff7043', ring: false },
    widthTiles: 145,
    gaps: [
      [20, 23],
      [42, 46],
      [68, 72],
      [95, 99],
      [118, 121]
    ],
    blocks: [
      { tx: 12, ty: 10, type: 'question', item: 'star' },
      { tx: 15, ty: 10, type: 'brick' },
      { tx: 16, ty: 10, type: 'question', item: 'power' },
      { tx: 17, ty: 10, type: 'brick' },

      // Plataformas sobre cañón
      { tx: 21, ty: 11, type: 'brick' },
      { tx: 22, ty: 11, type: 'brick' },

      { tx: 31, ty: 11, type: 'brick' },
      { tx: 32, ty: 10, type: 'question', item: 'star' },
      { tx: 33, ty: 9, type: 'brick' },

      { tx: 43, ty: 11, type: 'brick' },
      { tx: 44, ty: 11, type: 'question', item: 'star' },
      { tx: 45, ty: 11, type: 'brick' },

      { tx: 54, ty: 10, type: 'brick' },
      { tx: 55, ty: 10, type: 'question', item: 'power' },
      { tx: 56, ty: 10, type: 'brick' },
      { tx: 59, ty: 7, type: 'brick' },
      { tx: 60, ty: 7, type: 'question', item: 'star' },
      { tx: 61, ty: 7, type: 'brick' },

      { tx: 69, ty: 10, type: 'brick' },
      { tx: 70, ty: 10, type: 'brick' },
      { tx: 71, ty: 10, type: 'brick' },

      { tx: 82, ty: 11, type: 'question', item: 'star' },
      { tx: 83, ty: 11, type: 'brick' },
      { tx: 84, ty: 11, type: 'question', item: 'star' },

      { tx: 96, ty: 11, type: 'brick' },
      { tx: 97, ty: 10, type: 'question', item: 'power' },
      { tx: 98, ty: 11, type: 'brick' },

      { tx: 108, ty: 12, type: 'brick' },
      { tx: 109, ty: 11, type: 'brick' },
      { tx: 110, ty: 10, type: 'brick' },
      { tx: 125, ty: 12, type: 'brick' },
      { tx: 126, ty: 11, type: 'brick' },
      { tx: 127, ty: 10, type: 'brick' }
    ],
    stars: [
      [8, 12], [9, 12], [10, 12],
      [21, 9], [22, 9],
      [32, 8], [33, 7], [34, 8],
      [44, 9], [45, 9],
      [59, 5], [60, 5], [61, 5],
      [69, 8], [70, 8], [71, 8],
      [78, 12], [79, 11], [80, 12],
      [90, 12], [91, 12], [92, 12],
      [96, 9], [97, 8], [98, 9],
      [114, 12], [115, 11], [116, 12],
      [126, 9], [127, 8]
    ],
    meteorRate: 1.75,
    cometRate: 2.5,
    rocketTx: 136
  },
  {
    id: '3-1 NEBULOSA',
    name: 'PLANETA 3: NEBULOSA NEÓN',
    subtitle: 'Lluvia intensa de cometas y meteoros. ¡Llega al cohete final!',
    gravity: 0.37,
    skyTop: '#0d0624',
    skyBottom: '#2b1055',
    groundTop: '#4deeea',
    groundFill: '#243b6b',
    brickColor: '#6b3fa0',
    brickAccent: '#c77dff',
    qBlockColor: '#ffd54f',
    accentPlanet: { x: 290, y: 55, r: 32, color: '#9d4edd', ring: true },
    widthTiles: 155,
    gaps: [
      [18, 21],
      [38, 42],
      [60, 64],
      [84, 89],
      [108, 113],
      [128, 132]
    ],
    blocks: [
      { tx: 11, ty: 10, type: 'question', item: 'power' },
      { tx: 13, ty: 10, type: 'brick' },
      { tx: 14, ty: 10, type: 'question', item: 'star' },

      { tx: 19, ty: 11, type: 'brick' },
      { tx: 20, ty: 11, type: 'brick' },

      { tx: 28, ty: 10, type: 'brick' },
      { tx: 29, ty: 10, type: 'question', item: 'star' },
      { tx: 30, ty: 10, type: 'brick' },
      { tx: 33, ty: 7, type: 'question', item: 'power' },

      { tx: 39, ty: 10, type: 'brick' },
      { tx: 40, ty: 10, type: 'brick' },
      { tx: 41, ty: 10, type: 'brick' },

      { tx: 50, ty: 11, type: 'brick' },
      { tx: 51, ty: 10, type: 'brick' },
      { tx: 52, ty: 9, type: 'question', item: 'star' },

      { tx: 61, ty: 11, type: 'brick' },
      { tx: 62, ty: 10, type: 'question', item: 'star' },
      { tx: 63, ty: 11, type: 'brick' },

      { tx: 73, ty: 9, type: 'brick' },
      { tx: 74, ty: 9, type: 'question', item: 'power' },
      { tx: 75, ty: 9, type: 'brick' },

      { tx: 85, ty: 10, type: 'brick' },
      { tx: 86, ty: 10, type: 'brick' },
      { tx: 87, ty: 10, type: 'question', item: 'star' },
      { tx: 88, ty: 10, type: 'brick' },

      { tx: 98, ty: 10, type: 'brick' },
      { tx: 99, ty: 10, type: 'question', item: 'star' },
      { tx: 100, ty: 10, type: 'brick' },

      { tx: 109, ty: 11, type: 'brick' },
      { tx: 110, ty: 11, type: 'brick' },
      { tx: 111, ty: 11, type: 'brick' },
      { tx: 112, ty: 11, type: 'brick' },

      { tx: 129, ty: 10, type: 'brick' },
      { tx: 130, ty: 10, type: 'question', item: 'power' },
      { tx: 131, ty: 10, type: 'brick' },

      { tx: 137, ty: 13, type: 'brick' },
      { tx: 138, ty: 12, type: 'brick' },
      { tx: 139, ty: 11, type: 'brick' },
      { tx: 140, ty: 10, type: 'brick' }
    ],
    stars: [
      [7, 12], [8, 12], [9, 12],
      [19, 9], [20, 9],
      [28, 8], [29, 8], [30, 8],
      [39, 8], [40, 8], [41, 8],
      [51, 8], [52, 7],
      [61, 9], [62, 8], [63, 9],
      [73, 7], [74, 7], [75, 7],
      [85, 8], [86, 8], [87, 8], [88, 8],
      [98, 8], [99, 8], [100, 8],
      [110, 9], [111, 9],
      [121, 12], [122, 11], [123, 12],
      [130, 8], [139, 9], [140, 8]
    ],
    meteorRate: 1.35,
    cometRate: 1.9,
    rocketTx: 147
  }
];
