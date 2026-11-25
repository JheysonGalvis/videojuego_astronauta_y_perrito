// Motor de audio retro 8-bit con Web Audio API (sin archivos externos)
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isPlayingBgm = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    } else if (this.ctx) {
      this.startBgm();
    }
    return this.muted;
  }

  playTone(freq, duration, type = 'square', volume = 0.12, slideTo = null, delay = 0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playNoise(duration, volume = 0.14) {
    if (this.muted || !this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  jump() {
    this.playTone(210, 0.14, 'square', 0.1, 560);
  }

  laser(upgraded = false) {
    if (upgraded) {
      this.playTone(1100, 0.11, 'sawtooth', 0.1, 240);
      this.playTone(760, 0.09, 'square', 0.08, 180, 0.02);
    } else {
      this.playTone(880, 0.09, 'square', 0.09, 220);
    }
  }

  star() {
    this.playTone(987.77, 0.07, 'square', 0.1, null, 0);
    this.playTone(1318.51, 0.14, 'square', 0.1, null, 0.06);
  }

  powerup() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.playTone(n, 0.09, 'square', 0.11, null, i * 0.06));
  }

  blockBump() {
    this.playTone(160, 0.08, 'triangle', 0.12, 110);
  }

  explosion() {
    this.playNoise(0.22, 0.16);
    this.playTone(130, 0.2, 'sawtooth', 0.08, 45);
  }

  hurt() {
    this.playTone(300, 0.12, 'sawtooth', 0.12, 120);
    this.playTone(180, 0.18, 'square', 0.1, 70, 0.08);
  }

  bark() {
    this.playTone(420, 0.06, 'triangle', 0.09, 540, 0);
    this.playTone(460, 0.07, 'triangle', 0.08, 320, 0.08);
  }

  stageClear() {
    const melody = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    const times = [0, 0.11, 0.22, 0.33, 0.48, 0.6];
    melody.forEach((freq, i) => {
      this.playTone(freq, i === melody.length - 1 ? 0.35 : 0.1, 'square', 0.11, null, times[i]);
    });
  }

  startBgm() {
    if (this.muted || !this.ctx || this.isPlayingBgm) return;
    this.isPlayingBgm = true;
    // Melodía espacial original libre de derechos (arpegio cósmico en La menor)
    const lead = [
      440, 0, 523, 0, 659, 0, 587, 523,
      440, 0, 392, 0, 440, 523, 659, 0,
      698, 0, 659, 0, 587, 0, 523, 440,
      392, 0, 494, 0, 523, 0, 392, 0
    ];
    const bass = [
      110, 110, 220, 110, 110, 110, 220, 110,
      131, 131, 262, 131, 131, 131, 262, 131,
      147, 147, 294, 147, 147, 147, 294, 147,
      196, 196, 247, 196, 165, 165, 196, 165
    ];

    this.bgmTimer = setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const idx = this.bgmStep % lead.length;
      const l = lead[idx];
      const b = bass[idx];
      if (l > 0) this.playTone(l, 0.13, 'triangle', 0.045);
      if (b > 0) this.playTone(b, 0.12, 'square', 0.02);
      this.bgmStep++;
    }, 175);
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}
