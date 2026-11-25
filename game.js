// ASTRO & MAX: Odisea Estelar — Motor principal del juego
(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;   // 480
  const H = canvas.height;  // 270
  const GROUND_ROW = 14;    // y = 224

  // Elementos HUD y Overlays
  const hudScore = document.getElementById('hud-score');
  const hudStars = document.getElementById('hud-stars');
  const hudPlanet = document.getElementById('hud-planet');
  const hudLives = document.getElementById('hud-lives');
  const hudWeapon = document.getElementById('hud-weapon');

  const overlayTitle = document.getElementById('overlay-title');
  const overlayStage = document.getElementById('overlay-stage');
  const overlayGameOver = document.getElementById('overlay-gameover');
  const stageTitle = document.getElementById('stage-title');
  const stageSubtitle = document.getElementById('stage-subtitle');
  const stageStats = document.getElementById('stage-stats');
  const gameoverReason = document.getElementById('gameover-reason');
  const gameoverStats = document.getElementById('gameover-stats');
  const btnStart = document.getElementById('btn-start');
  const btnNextStage = document.getElementById('btn-next-stage');
  const btnRetry = document.getElementById('btn-retry');
  const btnMute = document.getElementById('btn-mute');
  const btnCrt = document.getElementById('btn-crt');
  const crtOverlay = document.getElementById('crt-overlay');

  const audio = new RetroAudio();

  // Estado global del juego
  const state = {
    mode: 'title', // 'title' | 'playing' | 'paused' | 'stageClear' | 'gameover' | 'victory'
    planetIdx: 0,
    score: 0,
    stars: 0,
    lives: 3,
    cameraX: 0,
    shake: 0,
    tick: 0,
    meteorTimer: 1.5,
    cometTimer: 2.5,
    bgStars: Array.from({ length: 75 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (H - 60),
      size: Math.random() < 0.25 ? 2 : 1,
      speed: 0.1 + Math.random() * 0.35,
      twinkle: Math.random() * Math.PI * 2
    }))
  };

  // Entradas: Flechas direccionales + Clic izquierdo
  const keys = {
    left: false,
    right: false,
    up: false,
    down: false
  };

  const mouse = {
    x: W / 2,
    y: H / 2,
    down: false
  };

  // Entidades del nivel actual
  let level = null;
  let blocks = [];
  let collectibles = [];
  let bullets = [];
  let enemies = [];
  let particles = [];
  let floatingTexts = [];
  let player = null;
  let dog = null;

  function createPlayer() {
    return {
      x: 40,
      y: GROUND_ROW * TILE - 16,
      w: 12,
      h: 15,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      coyoteTimer: 0,
      jumpBuffer: 0,
      crouching: false,
      invuln: 0,
      shootCooldown: 0,
      megaTimer: 0,
      shielded: false,
      animTimer: 0,
      walkFrame: 0
    };
  }

  function createDog() {
    return {
      x: 20,
      y: GROUND_ROW * TILE - 12,
      w: 12,
      h: 11,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      animTimer: 0,
      barkTimer: 0,
      barkBubble: 0
    };
  }

  function isGap(tx) {
    return level.gaps.some(([a, b]) => tx >= a && tx <= b);
  }

  function loadPlanet(idx) {
    state.planetIdx = idx;
    level = PLANETS[idx];
    state.cameraX = 0;
    state.meteorTimer = level.meteorRate;
    state.cometTimer = level.cometRate;

    player = createPlayer();
    dog = createDog();
    bullets = [];
    enemies = [];
    particles = [];
    floatingTexts = [];

    blocks = level.blocks.map(b => ({
      tx: b.tx,
      ty: b.ty,
      x: b.tx * TILE,
      y: b.ty * TILE,
      w: TILE,
      h: TILE,
      type: b.type, // 'brick' | 'question' | 'used'
      item: b.item || 'star',
      bumpY: 0
    }));

    collectibles = level.stars.map(([tx, ty]) => ({
      x: tx * TILE + 2,
      y: ty * TILE + 2,
      w: 12,
      h: 12,
      type: 'star',
      vy: 0,
      bobOffset: Math.random() * Math.PI * 2,
      fromBlock: false
    }));

    updateHud();
  }

  function updateHud() {
    hudScore.textContent = String(state.score).padStart(6, '0');
    hudStars.textContent = String(state.stars).padStart(2, '0');
    hudPlanet.textContent = level ? level.id : '1-1 LUNA';
    hudLives.textContent = state.lives > 0 ? '♥'.repeat(state.lives) : '0';
    if (player && player.megaTimer > 0) {
      hudWeapon.textContent = 'MEGA LÁSER';
    } else if (player && player.shielded) {
      hudWeapon.textContent = 'ESCUDO+LÁSER';
    } else {
      hudWeapon.textContent = 'LÁSER';
    }
  }

  function addFloatingText(x, y, text, color = '#ffd54f') {
    floatingTexts.push({ x, y, text, color, life: 45 });
  }

  function spawnParticles(x, y, color, count = 8, speed = 2.2) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * speed;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 0.5,
        size: Math.random() < 0.4 ? 3 : 2,
        color,
        life: 18 + Math.floor(Math.random() * 18)
      });
    }
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Obtener lista de todos los sólidos cercanos a un rectángulo
  function getSolidsNear(x, y, w, h) {
    const solids = [];
    const startTx = Math.max(0, Math.floor(x / TILE) - 1);
    const endTx = Math.min(level.widthTiles - 1, Math.floor((x + w) / TILE) + 1);

    for (let tx = startTx; tx <= endTx; tx++) {
      if (!isGap(tx)) {
        solids.push({
          x: tx * TILE,
          y: GROUND_ROW * TILE,
          w: TILE,
          h: TILE * 3,
          isGround: true
        });
      }
    }

    for (const blk of blocks) {
      if (blk.x + blk.w >= x - TILE && blk.x <= x + w + TILE) {
        solids.push(blk);
      }
    }
    return solids;
  }

  function shootLaser() {
    if (state.mode !== 'playing' || !player || player.shootCooldown > 0) return;

    const worldMouseX = mouse.x + state.cameraX;
    const worldMouseY = mouse.y;
    const px = player.x + player.w / 2;
    const py = player.y + (player.crouching ? 10 : 7);

    let dx = worldMouseX - px;
    let dy = worldMouseY - py;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    player.facing = dx >= 0 ? 1 : -1;
    const upgraded = player.megaTimer > 0;
    const speed = upgraded ? 7.2 : 5.8;

    const angles = upgraded ? [-0.14, 0, 0.14] : [0];
    const baseAngle = Math.atan2(dy, dx);

    for (const offset of angles) {
      const a = baseAngle + offset;
      bullets.push({
        x: px + Math.cos(a) * 8,
        y: py + Math.sin(a) * 8,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        w: upgraded ? 7 : 5,
        h: upgraded ? 4 : 3,
        color: upgraded ? '#ff4f8b' : '#4deeea',
        life: 68,
        power: upgraded ? 2 : 1
      });
    }

    player.shootCooldown = upgraded ? 9 : 13;
    spawnParticles(px + dx * 8, py + dy * 8, upgraded ? '#ff4f8b' : '#4deeea', 4, 1.4);
    audio.laser(upgraded);
  }

  function hitBlockFromBelow(blk) {
    blk.bumpY = -4;
    if (blk.type === 'question') {
      blk.type = 'used';
      if (blk.item === 'power') {
        audio.powerup();
        collectibles.push({
          x: blk.x + 2,
          y: blk.y - 14,
          w: 12,
          h: 12,
          type: 'power',
          vy: -1.8,
          bobOffset: 0,
          fromBlock: true
        });
        addFloatingText(blk.x, blk.y - 8, '¡MEGA PODER!', '#4deeea');
      } else {
        audio.star();
        state.stars++;
        state.score += 100;
        spawnParticles(blk.x + 8, blk.y - 4, '#ffd54f', 10, 2.4);
        addFloatingText(blk.x + 2, blk.y - 8, '+100 ★', '#ffd54f');
        checkExtraLife();
      }
      updateHud();
    } else {
      audio.blockBump();
      spawnParticles(blk.x + 8, blk.y + 4, level.brickAccent, 5, 1.5);
    }
  }

  function checkExtraLife() {
    if (state.stars > 0 && state.stars % 50 === 0) {
      state.lives++;
      audio.powerup();
      addFloatingText(player.x, player.y - 14, '+1 VIDA ♥', '#ff4f8b');
    }
  }

  function spawnMeteor() {
    const fromRight = Math.random() < 0.68;
    const spawnX = fromRight
      ? state.cameraX + W + 20
      : state.cameraX + 120 + Math.random() * (W - 140);
    const fromSky = !fromRight || Math.random() < 0.45;

    enemies.push({
      kind: 'meteor',
      x: spawnX,
      y: fromSky ? -18 : GROUND_ROW * TILE - 16,
      w: 14,
      h: 14,
      vx: fromSky ? -(1.0 + Math.random() * 1.1) : -(1.5 + Math.random() * 0.9),
      vy: fromSky ? 1.4 : -1.5,
      hp: 2,
      bounces: true
    });
  }

  function spawnComet() {
    const y = 38 + Math.random() * (GROUND_ROW * TILE - 76);
    enemies.push({
      kind: 'comet',
      x: state.cameraX + W + 24,
      y,
      w: 15,
      h: 10,
      vx: -(1.9 + state.planetIdx * 0.35 + Math.random() * 0.6),
      vy: (Math.random() - 0.5) * 0.65,
      hp: 1,
      bounces: false
    });

    // Max ladra para avisar si un cometa entra cerca
    if (dog && dog.barkTimer <= 0) {
      dog.barkTimer = 110;
      dog.barkBubble = 42;
      audio.bark();
    }
  }

  function damagePlayer(reason = 'Un meteoro golpeó a Astro.') {
    if (player.invuln > 0) return;

    if (player.shielded) {
      player.shielded = false;
      player.invuln = 80;
      state.shake = 6;
      audio.hurt();
      spawnParticles(player.x + 6, player.y + 8, '#4deeea', 12, 2.5);
      addFloatingText(player.x, player.y - 10, 'ESCUDO ROTO', '#4deeea');
      updateHud();
      return;
    }

    state.lives--;
    state.shake = 9;
    audio.hurt();
    spawnParticles(player.x + 6, player.y + 8, '#ff4f6d', 16, 2.8);
    updateHud();

    if (state.lives <= 0) {
      triggerGameOver(reason);
    } else {
      player.invuln = 100;
      // Si cayó al vacío, reaparecer en suelo seguro cercano
      if (player.y > H) {
        let safeTx = Math.max(2, Math.floor(player.x / TILE) - 3);
        while (safeTx > 1 && isGap(safeTx)) safeTx--;
        player.x = safeTx * TILE;
        player.y = GROUND_ROW * TILE - 20;
        player.vx = 0;
        player.vy = 0;
        dog.x = player.x - 16;
        dog.y = player.y;
      }
    }
  }

  function triggerGameOver(reason) {
    state.mode = 'gameover';
    audio.stopBgm();
    gameoverReason.textContent = reason;
    gameoverStats.innerHTML =
      `PUNTUACIÓN: ${state.score}<br>ESTRELLAS: ${state.stars} ★<br>PLANETA: ${level.id}`;
    overlayGameOver.classList.add('visible');
  }

  function completePlanet() {
    state.mode = 'stageClear';
    audio.stageClear();
    const bonus = 500 + state.lives * 150;
    state.score += bonus;
    updateHud();

    const isLast = state.planetIdx >= PLANETS.length - 1;
    if (isLast) {
      stageTitle.textContent = '¡ODISEA COMPLETADA!';
      stageSubtitle.textContent = 'Astro y Max conquistaron la galaxia y regresaron a salvo.';
      btnNextStage.textContent = 'JUGAR DE NUEVO';
    } else {
      stageTitle.textContent = `¡${level.id} COMPLETADO!`;
      stageSubtitle.textContent = 'Max mueve la cola listo para el siguiente planeta.';
      btnNextStage.textContent = 'SIGUIENTE PLANETA';
    }
    stageStats.innerHTML =
      `BONO DE MISIÓN: +${bonus}<br>PUNTUACIÓN TOTAL: ${state.score}<br>ESTRELLAS: ${state.stars} ★`;
    overlayStage.classList.add('visible');
  }

  // Actualización física (60 FPS fijos)
  function update() {
    state.tick++;

    // Animar estrellas de fondo siempre
    for (const s of state.bgStars) {
      s.twinkle += 0.05;
    }

    if (state.mode !== 'playing') return;

    if (state.shake > 0) state.shake *= 0.82;
    if (state.shake < 0.3) state.shake = 0;

    // Disparo continuo si mantiene presionado clic izquierdo
    if (mouse.down) shootLaser();

    // --- FÍSICA DEL ASTRONAUTA ---
    const moveSpeed = 1.9;
    const accel = player.onGround ? 0.28 : 0.18;
    const friction = player.onGround ? 0.8 : 0.94;

    player.crouching = keys.down && player.onGround;

    if (keys.left && !player.crouching) {
      player.vx = Math.max(-moveSpeed, player.vx - accel);
      player.facing = -1;
    } else if (keys.right && !player.crouching) {
      player.vx = Math.min(moveSpeed, player.vx + accel);
      player.facing = 1;
    } else {
      player.vx *= friction;
      if (Math.abs(player.vx) < 0.06) player.vx = 0;
    }

    // Coyote time & Jump buffer
    if (player.onGround) {
      player.coyoteTimer = 7;
    } else if (player.coyoteTimer > 0) {
      player.coyoteTimer--;
    }

    if (player.jumpBuffer > 0) {
      player.jumpBuffer--;
    }

    if (player.jumpBuffer > 0 && player.coyoteTimer > 0) {
      player.vy = -6.35;
      player.onGround = false;
      player.coyoteTimer = 0;
      player.jumpBuffer = 0;
      audio.jump();
      spawnParticles(player.x + 6, player.y + player.h, '#d6deff', 5, 1.2);
    }

    // Salto de altura variable (soltar Flecha Arriba corta el ascenso)
    if (!keys.up && player.vy < -2.2) {
      player.vy *= 0.84;
    }

    player.vy = Math.min(7.5, player.vy + level.gravity);

    // Movimiento horizontal + colisiones
    player.x += player.vx;
    if (player.x < 0) {
      player.x = 0;
      player.vx = 0;
    }
    const maxX = level.widthTiles * TILE - player.w;
    if (player.x > maxX) player.x = maxX;

    for (const s of getSolidsNear(player.x, player.y, player.w, player.h)) {
      if (aabb(player, s)) {
        if (player.vx > 0) player.x = s.x - player.w;
        else if (player.vx < 0) player.x = s.x + s.w;
        player.vx = 0;
      }
    }

    // Movimiento vertical + colisiones
    player.y += player.vy;
    player.onGround = false;

    for (const s of getSolidsNear(player.x, player.y, player.w, player.h)) {
      if (aabb(player, s)) {
        if (player.vy > 0) {
          player.y = s.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0) {
          player.y = s.y + s.h;
          player.vy = 0;
          if (!s.isGround) hitBlockFromBelow(s);
        }
      }
    }

    // Caída al cráter
    if (player.y > H + 20) {
      damagePlayer('Astro cayó en un cráter espacial.');
    }

    // Cooldowns del jugador
    if (player.invuln > 0) player.invuln--;
    if (player.shootCooldown > 0) player.shootCooldown--;
    if (player.megaTimer > 0) {
      player.megaTimer--;
      if (player.megaTimer === 0) updateHud();
    }

    // Animación caminar
    if (Math.abs(player.vx) > 0.25 && player.onGround) {
      player.animTimer++;
      if (player.animTimer >= 7) {
        player.animTimer = 0;
        player.walkFrame = 1 - player.walkFrame;
      }
    } else {
      player.walkFrame = 0;
    }

    // --- IA DEL PERRITO SCHNAUZER (MAX) ---
    const targetX = player.x - player.facing * 22;
    const dxDog = targetX - dog.x;
    if (Math.abs(dxDog) > 4) {
      dog.vx += Math.sign(dxDog) * 0.22;
      dog.vx = Math.max(-2.05, Math.min(2.05, dog.vx));
      dog.facing = dxDog >= 0 ? 1 : -1;
    } else {
      dog.vx *= 0.78;
    }

    // Saltar si el astronauta está más arriba o si hay un hueco adelante
    const aheadTx = Math.floor((dog.x + dog.w / 2 + dog.facing * 12) / TILE);
    if (dog.onGround && (player.y + 12 < dog.y || isGap(aheadTx))) {
      dog.vy = -5.6;
      dog.onGround = false;
    }

    dog.vy = Math.min(7, dog.vy + level.gravity);
    dog.x += dog.vx;
    for (const s of getSolidsNear(dog.x, dog.y, dog.w, dog.h)) {
      if (aabb(dog, s)) {
        if (dog.vx > 0) dog.x = s.x - dog.w;
        else if (dog.vx < 0) dog.x = s.x + s.w;
        if (dog.onGround) {
          dog.vy = -5.2;
          dog.onGround = false;
        }
      }
    }

    dog.y += dog.vy;
    dog.onGround = false;
    for (const s of getSolidsNear(dog.x, dog.y, dog.w, dog.h)) {
      if (aabb(dog, s)) {
        if (dog.vy > 0) {
          dog.y = s.y - dog.h;
          dog.vy = 0;
          dog.onGround = true;
        } else if (dog.vy < 0) {
          dog.y = s.y + s.h;
          dog.vy = 0;
        }
      }
    }

    // Teletransporte suave si Max se queda muy atrás o cae
    if (dog.y > H + 25 || Math.abs(player.x - dog.x) > 190) {
      dog.x = player.x - player.facing * 18;
      dog.y = player.y - 6;
      dog.vx = 0;
      dog.vy = 0;
      spawnParticles(dog.x + 6, dog.y + 6, '#9beeff', 6, 1.5);
    }

    if (dog.barkTimer > 0) dog.barkTimer--;
    if (dog.barkBubble > 0) dog.barkBubble--;
    if (Math.abs(dog.vx) > 0.25) dog.animTimer++;

    // --- CÁMARA ---
    const targetCam = Math.max(0, Math.min(level.widthTiles * TILE - W, player.x - W * 0.36));
    state.cameraX += (targetCam - state.cameraX) * 0.14;

    // --- BLOQUES ANIMADOS ---
    for (const blk of blocks) {
      if (blk.bumpY < 0) blk.bumpY = Math.min(0, blk.bumpY + 0.6);
    }

    // --- COLECCIONABLES (ESTRELLAS Y POWER-UPS) ---
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const c = collectibles[i];
      if (c.fromBlock) {
        c.y += c.vy;
        c.vy += 0.15;
        if (c.vy > 0) {
          for (const s of getSolidsNear(c.x, c.y, c.w, c.h)) {
            if (aabb(c, s)) {
              c.y = s.y - c.h;
              c.vy = 0;
              c.fromBlock = false;
            }
          }
        }
      }

      // Tanto Astro como Max pueden recoger estrellas
      if (aabb(player, c) || (c.type === 'star' && aabb(dog, c))) {
        if (c.type === 'star') {
          state.stars++;
          state.score += 50;
          audio.star();
          spawnParticles(c.x + 6, c.y + 6, '#ffd54f', 7, 1.8);
          checkExtraLife();
        } else {
          player.shielded = true;
          player.megaTimer = 480; // 8 segundos de Mega Láser
          state.score += 250;
          audio.powerup();
          spawnParticles(c.x + 6, c.y + 6, '#4deeea', 14, 2.5);
          addFloatingText(player.x, player.y - 12, 'ESCUDO + MEGA LÁSER!', '#4deeea');
        }
        collectibles.splice(i, 1);
        updateHud();
      }
    }

    // --- BALAS LÁSER ---
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      let remove = b.life <= 0 || b.x < state.cameraX - 20 || b.x > state.cameraX + W + 20 || b.y < -20 || b.y > H + 20;

      // Choque con bloques
      if (!remove) {
        for (const s of getSolidsNear(b.x, b.y, b.w, b.h)) {
          if (aabb(b, s)) {
            spawnParticles(b.x, b.y, b.color, 4, 1.3);
            remove = true;
            break;
          }
        }
      }

      // Choque con cometas y meteoros
      if (!remove) {
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (aabb(b, e)) {
            e.hp -= b.power;
            remove = true;
            spawnParticles(b.x, b.y, '#ffd54f', 5, 1.8);
            if (e.hp <= 0) {
              const pts = e.kind === 'comet' ? 150 : 100;
              state.score += pts;
              state.shake = 3.5;
              audio.explosion();
              spawnParticles(
                e.x + e.w / 2,
                e.y + e.h / 2,
                e.kind === 'comet' ? '#4deeea' : '#ff7043',
                14,
                2.8
              );
              addFloatingText(e.x, e.y - 6, `+${pts}`, '#ffd54f');
              // Probabilidad de soltar una estrella extra
              if (Math.random() < 0.35) {
                collectibles.push({
                  x: e.x,
                  y: e.y,
                  w: 12,
                  h: 12,
                  type: 'star',
                  vy: -1.5,
                  bobOffset: 0,
                  fromBlock: true
                });
              }
              enemies.splice(j, 1);
              updateHud();
            }
            break;
          }
        }
      }

      if (remove) bullets.splice(i, 1);
    }

    // --- SPAWNERS DE METEOROS Y COMETAS ---
    state.meteorTimer -= 1 / 60;
    if (state.meteorTimer <= 0) {
      state.meteorTimer = level.meteorRate * (0.75 + Math.random() * 0.5);
      if (player.x < (level.rocketTx - 8) * TILE) spawnMeteor();
    }

    state.cometTimer -= 1 / 60;
    if (state.cometTimer <= 0) {
      state.cometTimer = level.cometRate * (0.7 + Math.random() * 0.6);
      if (player.x < (level.rocketTx - 6) * TILE) spawnComet();
    }

    // --- ENEMIGOS (METEOROS Y COMETAS) ---
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.x += e.vx;
      e.y += e.vy;

      if (e.kind === 'meteor') {
        e.vy = Math.min(5.5, e.vy + level.gravity * 0.65);
        for (const s of getSolidsNear(e.x, e.y, e.w, e.h)) {
          if (aabb(e, s)) {
            if (e.vy > 0) {
              e.y = s.y - e.h;
              e.vy = -3.4;
            }
          }
        }
        if (state.tick % 4 === 0) {
          spawnParticles(e.x + e.w, e.y + 4, '#ff7043', 1, 0.8);
        }
      } else if (state.tick % 2 === 0) {
        spawnParticles(e.x + e.w, e.y + e.h / 2, '#4deeea', 1, 0.7);
      }

      if (aabb(player, e)) {
        enemies.splice(i, 1);
        damagePlayer(e.kind === 'comet' ? 'Un cometa impactó contra Astro.' : 'Un meteoro derribó a Astro.');
        continue;
      }

      if (e.x < state.cameraX - 60 || e.y > H + 40) {
        enemies.splice(i, 1);
      }
    }

    // --- PARTÍCULAS Y TEXTOS FLOTANTES ---
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.45;
      ft.life--;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    // --- META: COHETE ESPACIAL ---
    const rocketRect = {
      x: level.rocketTx * TILE,
      y: GROUND_ROW * TILE - 23,
      w: 24,
      h: 23
    };
    if (aabb(player, rocketRect)) {
      completePlanet();
    }
  }

  // Renderizado pixel art
  function draw() {
    if (!level) return;

    // Fondo espacial con degradado
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, level.skyTop);
    grad.addColorStop(1, level.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Estrellas parallax
    for (const s of state.bgStars) {
      const sx = ((s.x - state.cameraX * s.speed) % W + W) % W;
      const alpha = 0.45 + 0.55 * Math.sin(s.twinkle);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.fillRect(Math.floor(sx), Math.floor(s.y), s.size, s.size);
    }

    // Planeta decorativo en el horizonte
    const ap = level.accentPlanet;
    const px = Math.floor(ap.x - state.cameraX * 0.12);
    ctx.fillStyle = ap.color;
    ctx.beginPath();
    ctx.arc(px, ap.y, ap.r, 0, Math.PI * 2);
    ctx.fill();
    if (ap.ring) {
      ctx.strokeStyle = 'rgba(255, 213, 79, 0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(px, ap.y, ap.r + 14, 6, -0.25, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    const shakeX = state.shake ? (Math.random() - 0.5) * state.shake : 0;
    const shakeY = state.shake ? (Math.random() - 0.5) * state.shake : 0;
    ctx.translate(Math.floor(-state.cameraX + shakeX), Math.floor(shakeY));

    // Dibujar suelo visible
    const startTx = Math.max(0, Math.floor(state.cameraX / TILE) - 1);
    const endTx = Math.min(level.widthTiles - 1, Math.ceil((state.cameraX + W) / TILE) + 1);

    for (let tx = startTx; tx <= endTx; tx++) {
      if (isGap(tx)) continue;
      const gx = tx * TILE;
      const gy = GROUND_ROW * TILE;
      ctx.fillStyle = level.groundFill;
      ctx.fillRect(gx, gy, TILE, H - gy);
      ctx.fillStyle = level.groundTop;
      ctx.fillRect(gx, gy, TILE, 4);
      // Detalle pixelado de roca/cráter
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      if (tx % 2 === 0) ctx.fillRect(gx + 3, gy + 8, 4, 3);
      else ctx.fillRect(gx + 9, gy + 12, 5, 3);
    }

    // Dibujar bloques y cajas '?'
    for (const blk of blocks) {
      if (blk.x + TILE < state.cameraX - 16 || blk.x > state.cameraX + W + 16) continue;
      const by = Math.floor(blk.y + blk.bumpY);
      if (blk.type === 'question') {
        ctx.fillStyle = level.qBlockColor;
        ctx.fillRect(blk.x, by, TILE, TILE);
        ctx.strokeStyle = '#9e6b00';
        ctx.lineWidth = 1;
        ctx.strokeRect(blk.x + 0.5, by + 0.5, TILE - 1, TILE - 1);
        ctx.fillStyle = '#5c3d00';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('?', blk.x + 5, by + 12);
      } else if (blk.type === 'used') {
        ctx.fillStyle = '#474c66';
        ctx.fillRect(blk.x, by, TILE, TILE);
        ctx.strokeStyle = '#25293b';
        ctx.strokeRect(blk.x + 0.5, by + 0.5, TILE - 1, TILE - 1);
      } else {
        ctx.fillStyle = level.brickColor;
        ctx.fillRect(blk.x, by, TILE, TILE);
        ctx.fillStyle = level.brickAccent;
        ctx.fillRect(blk.x, by, TILE, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.28)';
        ctx.fillRect(blk.x, by + 8, TILE, 1);
        ctx.fillRect(blk.x + 8, by, 1, 8);
        ctx.fillRect(blk.x + 4, by + 8, 1, 8);
      }
    }

    // Cohete meta
    const rocketSprite = SpriteBank.getRocket();
    ctx.drawImage(rocketSprite, level.rocketTx * TILE, GROUND_ROW * TILE - rocketSprite.height);

    // Coleccionables
    const starFrame = Math.floor(state.tick / 12) % 2;
    for (const c of collectibles) {
      const bob = c.fromBlock ? 0 : Math.sin(state.tick * 0.08 + c.bobOffset) * 2;
      if (c.type === 'star') {
        ctx.drawImage(SpriteBank.getStar(starFrame), Math.floor(c.x), Math.floor(c.y + bob));
      } else {
        // Cápsula de Power-up
        ctx.fillStyle = '#4deeea';
        ctx.fillRect(Math.floor(c.x), Math.floor(c.y), 12, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(c.x + 3), Math.floor(c.y + 3), 6, 6);
      }
    }

    // Perrito Schnauzer (Max)
    if (dog) {
      let dogFrame = 'idle';
      if (Math.abs(dog.vx) > 0.25) {
        dogFrame = Math.floor(dog.animTimer / 6) % 2 === 0 ? 'run1' : 'run2';
      }
      const dogSprite = SpriteBank.getDog(dogFrame);
      ctx.save();
      ctx.translate(Math.floor(dog.x + dog.w / 2), Math.floor(dog.y));
      ctx.scale(dog.facing, 1);
      ctx.drawImage(dogSprite, -7, -1);
      ctx.restore();

      if (dog.barkBubble > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(dog.x + 2), Math.floor(dog.y - 14), 24, 10);
        ctx.fillStyle = '#111528';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('WOOF!', Math.floor(dog.x + 3), Math.floor(dog.y - 6));
      }
    }

    // Astronauta (Astro)
    if (player) {
      const blinkSkip = player.invuln > 0 && Math.floor(player.invuln / 4) % 2 === 0;
      if (!blinkSkip) {
        let frame = 'idle';
        if (!player.onGround) frame = 'jump';
        else if (Math.abs(player.vx) > 0.25) frame = player.walkFrame === 0 ? 'walk1' : 'walk2';

        const astroSprite = SpriteBank.getAstro(frame);
        ctx.save();
        ctx.translate(Math.floor(player.x + player.w / 2), Math.floor(player.y + player.h));
        ctx.scale(player.facing, player.crouching ? 0.78 : 1);
        ctx.drawImage(astroSprite, -8, -16);
        ctx.restore();

        // Halo de Escudo
        if (player.shielded) {
          ctx.strokeStyle = state.tick % 8 < 4 ? '#4deeea' : '#ffd54f';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 11, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Enemigos (Meteoros y Cometas)
    const meteorSprite = SpriteBank.getMeteor();
    const cometSprite = SpriteBank.getComet();
    for (const e of enemies) {
      if (e.kind === 'meteor') {
        ctx.drawImage(meteorSprite, Math.floor(e.x - 1), Math.floor(e.y - 1));
      } else {
        ctx.drawImage(cometSprite, Math.floor(e.x), Math.floor(e.y));
      }
    }

    // Balas láser
    for (const b of bullets) {
      ctx.fillStyle = b.color;
      ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.w, b.h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(b.x + 1), Math.floor(b.y + 1), Math.max(1, b.w - 2), 1);
    }

    // Partículas
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }

    // Textos flotantes
    ctx.font = 'bold 8px monospace';
    for (const ft of floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
    }

    ctx.restore();

    // Cartel de Pausa
    if (state.mode === 'paused') {
      ctx.fillStyle = 'rgba(6, 8, 22, 0.72)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSA', W / 2, H / 2 - 4);
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.fillText('Presiona P para continuar', W / 2, H / 2 + 16);
      ctx.textAlign = 'left';
    }
  }

  const FIXED_STEP = 1000 / 60; // 60 Hz constantes sin importar si el monitor es 120Hz/144Hz
  let lastTime = 0;
  let accumulator = 0;

  function loop(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min(100, now - lastTime);
    lastTime = now;
    accumulator += dt;

    while (accumulator >= FIXED_STEP) {
      update();
      accumulator -= FIXED_STEP;
    }

    draw();
    requestAnimationFrame(loop);
  }

  // Eventos de teclado (Flechas direccionales + Pausa + Mute)
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') {
      if (!keys.up && player) player.jumpBuffer = 7;
      keys.up = true;
    }
    if (e.key === 'ArrowDown') keys.down = true;

    if (e.key.toLowerCase() === 'p' && (state.mode === 'playing' || state.mode === 'paused')) {
      state.mode = state.mode === 'playing' ? 'paused' : 'playing';
    }
    if (e.key.toLowerCase() === 'm') {
      const m = audio.toggleMute();
      btnMute.textContent = m ? '🔇' : '🔊';
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
  });

  // Eventos de Mouse (Clic izquierdo para disparar hacia el cursor)
  function updateMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * W;
    mouse.y = ((e.clientY - rect.top) / rect.height) * H;
  }

  canvas.addEventListener('mousemove', updateMousePos);

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      updateMousePos(e);
      mouse.down = true;
      audio.init();
      shootLaser();
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.down = false;
  });

  // Botones de UI
  function startNewGame() {
    audio.init();
    audio.startBgm();
    state.score = 0;
    state.stars = 0;
    state.lives = 3;
    overlayTitle.classList.remove('visible');
    overlayStage.classList.remove('visible');
    overlayGameOver.classList.remove('visible');
    loadPlanet(0);
    state.mode = 'playing';
  }

  btnStart.addEventListener('click', startNewGame);
  btnRetry.addEventListener('click', startNewGame);

  btnNextStage.addEventListener('click', () => {
    audio.init();
    overlayStage.classList.remove('visible');
    if (state.planetIdx >= PLANETS.length - 1) {
      startNewGame();
    } else {
      loadPlanet(state.planetIdx + 1);
      state.mode = 'playing';
    }
  });

  btnMute.addEventListener('click', () => {
    audio.init();
    const m = audio.toggleMute();
    btnMute.textContent = m ? '🔇' : '🔊';
  });

  btnCrt.addEventListener('click', () => {
    crtOverlay.classList.toggle('active');
  });

  // Inicializar vista previa del Planeta 1 detrás de la pantalla de título
  loadPlanet(0);
  requestAnimationFrame(loop);
})();
