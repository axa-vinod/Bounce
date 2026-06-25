/**
 * Neon Bounce: Retro Arcade Bouncing Balls
 * A highly interactive web game demonstrating ES6 Classes, Inheritance,
 * Web Audio API, Canvas Graphics, and Game Physics.
 */

// ==========================================
// 1. SOUND SYNTHESIZER ENGINE (Web Audio)
// ==========================================
class GameAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmInterval = null;
    this.audioEnabled = true;
    this.bgmEnabled = true;
    this.bgmNotes = [
      110.00, 130.81, 146.83, 164.81, 196.00, // A2 Pentatonic
      220.00, 261.63, 293.66, 329.63, 392.00, // A3 Pentatonic
      440.00, 523.25, 587.33, 659.25, 783.99  // A4 Pentatonic
    ];
    this.bgmPattern = [0, 4, 2, 5, 3, 7, 5, 8, 7, 5, 6, 4, 2, 3, 1, 0];
  }

  /**
   * Lazy-initialization to bypass strict browser media policies.
   * Triggered upon user's first game launch click.
   */
  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.audioEnabled ? 0.25 : 0;
    this.masterGain.connect(this.ctx.destination);
  }

  setAudioEnabled(enabled) {
    this.audioEnabled = enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(enabled ? 0.25 : 0, this.ctx.currentTime);
    }
  }

  setBGMEnabled(enabled) {
    this.bgmEnabled = enabled;
    if (enabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
  }

  playEat(isCombo = false) {
    if (!this.ctx || !this.audioEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    
    // Higher pitch if eating during a combo streak
    const baseFreq = isCombo ? 280 : 180;
    const peakFreq = isCombo ? 900 : 650;
    
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playPowerup() {
    if (!this.ctx || !this.audioEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;

    const playTone = (freq, startDelay, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + startDelay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + startDelay + duration);

      gain.gain.setValueAtTime(0, now + startDelay);
      gain.gain.linearRampToValueAtTime(0.3, now + startDelay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + startDelay);
      osc.stop(now + startDelay + duration);
    };

    // Arpeggiated shiny chime sound
    playTone(523.25, 0.00, 0.3); // C5
    playTone(659.25, 0.06, 0.3); // E5
    playTone(783.99, 0.12, 0.4); // G5
    playTone(1046.50, 0.18, 0.5); // C6
  }

  playGameOver(isNewHighScore = false) {
    if (!this.ctx || !this.audioEnabled) return;
    this.stopBGM();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isNewHighScore) {
      // Upward triumphant sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.6);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
    } else {
      // Downward retro game-over slump
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.9);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.9);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.0);
  }

  startBGM() {
    if (!this.ctx || !this.bgmEnabled || !this.audioEnabled) return;
    this.stopBGM();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    let step = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state === 'suspended' || !this.bgmEnabled || !this.audioEnabled) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const noteIndex = this.bgmPattern[step % this.bgmPattern.length];
      const freq = this.bgmNotes[noteIndex];

      // Bass synth sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.25);

      step++;
    }, 220); // 136 bpm rhythm
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

// Global audio handle
const audio = new GameAudio();


// ==========================================
// 2. BASE OBJECT-ORIENTED CLASSES
// ==========================================

/**
 * Shape: The absolute base parent class representing a canvas entity.
 */
class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    this.exists = true;
  }

  draw() {
    // Abstract stub to override in children
  }

  update() {
    // Basic linear motion
    this.x += this.velX;
    this.y += this.velY;
  }
}

/**
 * Ball: Bouncing entity containing physics bounce parameters.
 * Extends Shape.
 */
class Ball extends Shape {
  constructor(x, y, velX, velY, color, size, type = 'normal') {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;
    this.type = type; // 'normal', 'fast', 'giant'
    this.baseSpeedFactor = 1.0; // modified temporarily by powerups
  }

  /**
   * Draw the ball with an outer radial glow for the cyber aesthetic.
   */
  draw(ctx) {
    ctx.save();
    
    // Outer shadow glow
    ctx.shadowBlur = this.size * 0.8;
    ctx.shadowColor = this.color;

    // Draw solid core
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Keep ball within logical dimensions and bounce off walls.
   */
  update(width, height) {
    // Incorporate slow/freeze factors if applicable
    const activeVelX = this.velX * this.baseSpeedFactor;
    const activeVelY = this.velY * this.baseSpeedFactor;

    this.x += activeVelX;
    this.y += activeVelY;

    // Bounce off left/right walls
    if ((this.x + this.size) >= width) {
      this.velX = -Math.abs(this.velX);
      this.x = width - this.size;
    }
    if ((this.x - this.size) <= 0) {
      this.velX = Math.abs(this.velX);
      this.x = this.size;
    }

    // Bounce off top/bottom walls
    if ((this.y + this.size) >= height) {
      this.velY = -Math.abs(this.velY);
      this.y = height - this.size;
    }
    if ((this.y - this.size) <= 0) {
      this.velY = Math.abs(this.velY);
      this.y = this.size;
    }
  }

  /**
   * Elastic 2D Collision physics.
   * If two balls collide, they bounce off each other naturally based on size.
   */
  collisionDetect(balls) {
    for (const ball of balls) {
      if (ball.exists && this !== ball) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.hypot(dx, dy);

        if (distance < (this.size + ball.size)) {
          // 1. Separate the overlapping circles immediately to prevent sticking
          const overlap = (this.size + ball.size) - distance;
          const separationX = (dx / distance) * overlap * 0.5;
          const separationY = (dy / distance) * overlap * 0.5;
          this.x += separationX;
          this.y += separationY;
          ball.x -= separationX;
          ball.y -= separationY;

          // 2. Normal and tangent unit vectors
          const nx = dx / distance;
          const ny = dy / distance;
          const tx = -ny;
          const ty = nx;

          // 3. Project velocity vectors onto normal/tangential units
          const v1n = this.velX * nx + this.velY * ny;
          const v1t = this.velX * tx + this.velY * ty;
          const v2n = ball.velX * nx + ball.velY * ny;
          const v2t = ball.velX * tx + ball.velY * ty;

          // 4. Masses are approximated linearly by ball size
          const m1 = this.size;
          const m2 = ball.size;

          // 5. Compute new normal speeds using 1D elastic collision formula
          const v1nPrime = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
          const v2nPrime = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

          // 6. Project scalar speeds back to Cartesian coordinates
          this.velX = v1nPrime * nx + v1t * tx;
          this.velY = v1nPrime * ny + v1t * ty;
          ball.velX = v2nPrime * nx + v2t * tx;
          ball.velY = v2nPrime * ny + v2t * ty;
        }
      }
    }
  }
}

/**
 * EvilCircle: Player-controlled collector.
 * Extends Shape.
 */
class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 0, 0);
    this.color = '#f43f5e';
    this.size = 28;
    this.speed = 6.5;
    
    // Keyboard inputs tracking
    this.keysPressed = {};
    
    // Modifiers (updated by power-ups)
    this.shieldActive = false;
    
    this.setControls();
  }

  /**
   * Draw the player entity as an animated targeting ring.
   */
  draw(ctx) {
    ctx.save();
    
    // Outer shield circle (if active)
    if (this.shieldActive) {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#d946ef';
      ctx.strokeStyle = 'rgba(217, 70, 239, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Draw shield range
      ctx.arc(this.x, this.y, this.size * 2.2, 0, 2 * Math.PI);
      ctx.stroke();

      // Pulsing transparent background for shield
      ctx.fillStyle = 'rgba(217, 70, 239, 0.06)';
      ctx.fill();
    }

    // Outer Neon Ring
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();

    // Small dashed core pointer inside
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size - 8, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Keyboard listeners for responsive controls.
   */
  setControls() {
    window.addEventListener('keydown', (e) => {
      this.keysPressed[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed[e.key.toLowerCase()] = false;
    });
  }

  /**
   * Calculate velocities and update coordinates.
   */
  update(width, height) {
    let dx = 0;
    let dy = 0;

    // Supports WASD and Arrow Keys
    if (this.keysPressed['w'] || this.keysPressed['arrowup']) dy = -1;
    if (this.keysPressed['s'] || this.keysPressed['arrowdown']) dy = 1;
    if (this.keysPressed['a'] || this.keysPressed['arrowleft']) dx = -1;
    if (this.keysPressed['d'] || this.keysPressed['arrowright']) dx = 1;

    // Normalize diagonal velocity
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.x += dx * this.speed;
    this.y += dy * this.speed;

    this.checkBounds(width, height);
  }

  /**
   * Stop player from passing off the screen borders.
   */
  checkBounds(width, height) {
    if ((this.x - this.size) < 0) this.x = this.size;
    if ((this.x + this.size) > width) this.x = width - this.size;
    if ((this.y - this.size) < 0) this.y = this.size;
    if ((this.y + this.size) > height) this.y = height - this.size;
  }

  /**
   * Collision checking for eating balls.
   * If shield is active, target range is increased by 2.2x.
   */
  collisionDetect(balls, onEatCallback) {
    const eatRange = this.shieldActive ? this.size * 2.2 : this.size;

    for (const ball of balls) {
      if (ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.hypot(dx, dy);

        // Collision bounds check
        if (distance < (eatRange + ball.size)) {
          ball.exists = false;
          onEatCallback(ball);
        }
      }
    }
  }
}

/**
 * PowerUp: Collectable triggers.
 * Extends Shape.
 */
class PowerUp extends Shape {
  constructor(x, y, velX, velY, type) {
    super(x, y, velX, velY);
    this.type = type; // 'speed', 'freeze', 'shield'
    this.size = 16;
    this.pulse = 0;
    this.color = this.getColorByType();
    this.spawnTime = Date.now();
    this.lifespan = 8000; // PowerUp decays after 8 seconds
  }

  getColorByType() {
    switch (this.type) {
      case 'speed': return '#facc15';  // Neon Yellow
      case 'freeze': return '#06b6d4'; // Neon Cyan
      case 'shield': return '#d946ef'; // Neon Magenta
      default: return '#ffffff';
    }
  }

  draw(ctx) {
    this.pulse += 0.06;
    const animRadius = this.size + Math.sin(this.pulse) * 3;

    ctx.save();
    
    // Outer pulse ring
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, animRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Solid inner core
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size - 2, 0, 2 * Math.PI);
    ctx.fill();

    // Render power-up label/symbol
    ctx.fillStyle = this.color;
    ctx.font = 'bold 11px var(--font-hud)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let icon = '';
    if (this.type === 'speed') icon = '⚡';
    if (this.type === 'freeze') icon = '❄️';
    if (this.type === 'shield') icon = '🛡️';

    ctx.fillText(icon, this.x, this.y + 0.5);

    ctx.restore();
  }

  /**
   * Linear bouncing movement.
   */
  update(width, height) {
    super.update();

    // Bounce off walls
    if ((this.x + this.size) >= width || (this.x - this.size) <= 0) {
      this.velX = -this.velX;
    }
    if ((this.y + this.size) >= height || (this.y - this.size) <= 0) {
      this.velY = -this.velY;
    }
  }

  /**
   * Collision check with player's circle.
   */
  collisionDetect(evilCircle) {
    const dx = this.x - evilCircle.x;
    const dy = this.y - evilCircle.y;
    const distance = Math.hypot(dx, dy);

    return distance < (this.size + evilCircle.size);
  }
}


// ==========================================
// 3. VISUAL PARTICLE EFFECTS
// ==========================================

/**
 * Particle: Represents one point of color in a burst animation.
 */
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    
    // Spread direction speeds
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1.5;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;

    this.size = Math.random() * 3.5 + 2.0;
    this.alpha = 1.0;
    this.decay = Math.random() * 0.02 + 0.015; // fade rate per frame
    this.exists = true;
  }

  update() {
    this.x += this.velX;
    this.y += this.velY;
    this.alpha -= this.decay;
    this.size -= 0.03;
    
    if (this.alpha <= 0 || this.size <= 0) {
      this.exists = false;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
}


// ==========================================
// 4. MAIN GAME STATE CONTROLLER
// ==========================================
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Dimensions
    this.width = 0;
    this.height = 0;

    // Entities lists
    this.balls = [];
    this.powerups = [];
    this.particles = [];
    this.evilCircle = null;

    // Controls states
    this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameover'
    this.difficulty = 'arcade';
    this.score = 0;
    this.highScore = 0;
    this.ballsEaten = 0;
    
    // Timer configurations
    this.timeLeft = 0;
    this.gameDuration = 60; // Fixed duration for arcade mode
    this.gameTimerInterval = null;
    this.startTimeStamp = 0;
    this.timeSurvived = 0;

    // Combo system
    this.comboMultiplier = 1;
    this.lastEatTime = 0;
    this.comboDecayTime = 1600; // 1.6 seconds to hit next ball
    this.peakCombo = 1;

    // Active temporary powerup handlers
    this.activePowerups = {
      speed: { active: false, expires: 0, duration: 6000 },
      freeze: { active: false, expires: 0, duration: 6000 },
      shield: { active: false, expires: 0, duration: 6000 }
    };

    // Spawning timer
    this.lastSpawnTime = 0;
    this.spawnInterval = 3500; // Spawn 1 ball every 3.5s

    // DOM Binding elements
    this.dom = {
      themeBtn: document.getElementById('btn-theme-toggle'),
      startBtn: document.getElementById('btn-start-game'),
      
      hud: document.getElementById('hud'),
      hudScore: document.getElementById('hud-score'),
      hudCombo: document.getElementById('hud-combo'),
      comboProgress: document.getElementById('combo-progress'),
      hudBalls: document.getElementById('hud-balls'),
      hudHighScore: document.getElementById('hud-highscore'),
      powerupsBar: document.getElementById('powerups-active-bar'),

      // Screen Modals
      startScreen: document.getElementById('screen-start'),
      pauseScreen: document.getElementById('screen-pause'),
      gameoverScreen: document.getElementById('screen-game-over'),
      highScoreBadge: document.getElementById('new-high-score-badge'),

      // Score summaries
      summaryScore: document.getElementById('summary-score'),
      summaryCollected: document.getElementById('summary-collected'),
      summaryCombo: document.getElementById('summary-combo'),
      
      // Control buttons
      pauseToggle: document.getElementById('btn-pause-toggle'),
      resumeBtn: document.getElementById('btn-resume'),
      restartPaused: document.getElementById('btn-restart-paused'),
      quitPaused: document.getElementById('btn-quit-paused'),
      restartGameOver: document.getElementById('btn-restart-gameover'),
      quitGameOver: document.getElementById('btn-quit-gameover')
    };

    this.bindEvents();
    this.handleResize();
    this.loadHighScore();
    this.updateThemeUI();
  }

  /**
   * Bind event listeners to UI Elements
   */
  bindEvents() {
    window.addEventListener('resize', () => this.handleResize());
    
    // Theme toggle
    this.dom.themeBtn.addEventListener('click', () => this.toggleTheme());

    // Audio configuration
    audio.setAudioEnabled(true);
    audio.setBGMEnabled(true);

    // Start, Pause, Resume, and restart bindings
    this.dom.startBtn.addEventListener('click', () => this.startGame());
    this.dom.pauseToggle.addEventListener('click', () => this.togglePause());
    this.dom.resumeBtn.addEventListener('click', () => this.togglePause());
    
    this.dom.restartPaused.addEventListener('click', () => {
      this.togglePause();
      this.startGame();
    });
    this.dom.quitPaused.addEventListener('click', () => {
      this.togglePause();
      this.quitToMenu();
    });

    this.dom.restartGameOver.addEventListener('click', () => this.startGame());
    this.dom.quitGameOver.addEventListener('click', () => this.quitToMenu());

    // Escape key pause binding
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.gameState === 'playing' || this.gameState === 'paused') {
          this.togglePause();
        }
      }
    });
  }

  /**
   * Scale canvas drawing size based on device pixel ratios for sharp UI.
   */
  handleResize() {
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
  }

  // ==========================================
  // CONFIGURATIONS & THEMES
  // ==========================================
  
  toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    root.setAttribute('data-theme', nextTheme);
    this.updateThemeUI();
  }

  updateThemeUI() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    this.dom.themeBtn.textContent = isDark ? 'Dark Mode' : 'Light Mode';
  }

  loadHighScore() {
    const saved = localStorage.getItem(`highscore_${this.difficulty}`);
    this.highScore = saved ? parseInt(saved, 10) : 0;
    this.dom.hudHighScore.textContent = String(this.highScore).padStart(4, '0');
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem(`highscore_${this.difficulty}`, this.score);
      this.dom.hudHighScore.textContent = String(this.highScore).padStart(4, '0');
      return true;
    }
    return false;
  }

  // ==========================================
  // GAMEPLAY FLOW CONTROL
  // ==========================================

  startGame() {
    // Lazy initialize synthesizers contexts
    audio.init();

    // Set configuration variables (Fixed 30 balls, medium speed)
    let numBalls = 30;
    let speedMin = 3.5;
    let speedMax = 6.0;

    // Reset gameplay variables
    this.score = 0;
    this.ballsEaten = 0;
    this.comboMultiplier = 1;
    this.peakCombo = 1;
    this.startTimeStamp = Date.now();
    this.lastSpawnTime = Date.now();

    // Reset powerup effects
    for (const key in this.activePowerups) {
      this.activePowerups[key].active = false;
      this.activePowerups[key].expires = 0;
    }

    // Populate balls lists
    this.balls = [];
    this.powerups = [];
    this.particles = [];

    // Instantiate Evil Circle in center of screen
    this.evilCircle = new EvilCircle(this.width / 2, this.height / 2);
    // Bind controls (avoid binding repeatedly)
    this.evilCircle.keysPressed = {};

    // Generate Bouncing Balls
    for (let i = 0; i < numBalls; i++) {
      this.spawnRandomBall(speedMin, speedMax);
    }

    this.updateHUD();

    // Switch screen overlay visibility
    this.gameState = 'playing';
    this.dom.startScreen.classList.add('hidden');
    this.dom.pauseScreen.classList.add('hidden');
    this.dom.gameoverScreen.classList.add('hidden');
    this.dom.hud.classList.remove('hidden');

    audio.setAudioEnabled(true);
    audio.setBGMEnabled(true);
    audio.startBGM();
    
    // Kickstart canvas loop
    requestAnimationFrame((t) => this.loop(t));
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.dom.pauseScreen.classList.remove('hidden');
      audio.stopBGM();
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.dom.pauseScreen.classList.add('hidden');
      audio.startBGM();
    }
  }

  quitToMenu() {
    this.gameState = 'menu';
    this.dom.hud.classList.add('hidden');
    this.dom.pauseScreen.classList.add('hidden');
    this.dom.gameoverScreen.classList.add('hidden');
    this.dom.startScreen.classList.remove('hidden');
    audio.stopBGM();
  }

  endGame(isWin = false) {
    this.gameState = 'gameover';

    const isNewHighScore = this.saveHighScore();
    audio.playGameOver(isNewHighScore);

    // Update GameOver screen data
    this.dom.summaryScore.textContent = String(this.score).padStart(4, '0');
    this.dom.summaryCollected.textContent = this.ballsEaten;
    this.dom.summaryCombo.textContent = this.peakCombo + 'x';

    // Update Game Over text based on outcome
    const gameOverTag = document.querySelector('.game-over-tag');
    const gameOverTitle = document.querySelector('.game-over-title');
    if (isWin) {
      gameOverTag.textContent = 'SIMULATION COMPLETED';
      gameOverTag.style.color = 'var(--color-easy)';
      gameOverTitle.textContent = 'VICTORY!';
    } else {
      gameOverTag.textContent = 'SIMULATION TERMINATED';
      gameOverTag.style.color = 'var(--text-evil)';
      gameOverTitle.textContent = 'GAME OVER';
    }

    if (isNewHighScore) {
      this.dom.highScoreBadge.classList.remove('hidden');
    } else {
      this.dom.highScoreBadge.classList.add('hidden');
    }

    // Swap overlay screens
    this.dom.hud.classList.add('hidden');
    this.dom.gameoverScreen.classList.remove('hidden');
  }

  // ==========================================
  // BALL CREATION HELPERS
  // ==========================================

  /**
   * Spawn a random ball.
   * Speed boundaries based on difficulty coefficients.
   */
  spawnRandomBall(speedMin, speedMax) {
    const size = this.getRandomValue(11, 42);
    // Make sure coordinates start inside bounds
    const x = this.getRandomValue(size, this.width - size);
    const y = this.getRandomValue(size, this.height - size);

    // Make sure speeds are not 0
    let velX = this.getRandomValue(speedMin, speedMax) * (Math.random() < 0.5 ? -1 : 1);
    let velY = this.getRandomValue(speedMin, speedMax) * (Math.random() < 0.5 ? -1 : 1);

    // Determine type distribution
    let type = 'normal';
    let color = '';
    
    const roll = Math.random();
    if (roll < 0.20 && size < 16) {
      type = 'fast';
      color = '#eab308'; // electric yellow
      velX *= 1.8;
      velY *= 1.8;
    } else if (size > 32) {
      type = 'giant';
      color = '#ec4899'; // magenta/pink giant
      velX *= 0.5;
      velY *= 0.5;
    } else {
      type = 'normal';
      // Pick dynamic shades of purple/blue
      const hues = [190, 210, 230, 255, 275];
      const selectedHue = hues[Math.floor(Math.random() * hues.length)];
      color = `hsl(${selectedHue}, 90%, 60%)`;
    }

    this.balls.push(new Ball(x, y, velX, velY, color, size, type));
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  // ==========================================
  // POWER-UPS SPAWNING & UPDATING
  // ==========================================

  triggerPowerupSpawn() {
    if (this.powerups.length >= 2) return; // Keep limit low

    const types = ['speed', 'freeze', 'shield'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    const size = 16;
    const x = this.getRandomValue(size, this.width - size);
    const y = this.getRandomValue(size, this.height - size);
    const velX = this.getRandomValue(1.5, 3.5) * (Math.random() < 0.5 ? -1 : 1);
    const velY = this.getRandomValue(1.5, 3.5) * (Math.random() < 0.5 ? -1 : 1);

    this.powerups.push(new PowerUp(x, y, velX, velY, selectedType));
  }

  applyPowerup(type) {
    audio.playPowerup();
    
    // Setup durations
    const activeData = this.activePowerups[type];
    activeData.active = true;
    activeData.expires = Date.now() + activeData.duration;

    // Apply active immediate parameters
    if (type === 'speed') {
      this.evilCircle.speed = 12.0; // Double player speed
      this.evilCircle.color = '#eab308'; // Glow yellow
    } else if (type === 'freeze') {
      // Slow ball speeds down to 20%
      this.balls.forEach(ball => ball.baseSpeedFactor = 0.22);
    } else if (type === 'shield') {
      this.evilCircle.shieldActive = true;
    }

    this.renderPowerupsIndicators();
  }

  updatePowerupsStates() {
    const now = Date.now();
    let changesOccured = false;

    for (const key in this.activePowerups) {
      const activeData = this.activePowerups[key];
      if (activeData.active && now > activeData.expires) {
        // Powerup expired - reset factors
        activeData.active = false;
        
        if (key === 'speed') {
          this.evilCircle.speed = 6.5;
          this.evilCircle.color = '#f43f5e';
        } else if (key === 'freeze') {
          this.balls.forEach(ball => ball.baseSpeedFactor = 1.0);
        } else if (key === 'shield') {
          this.evilCircle.shieldActive = false;
        }

        changesOccured = true;
      }
    }

    if (changesOccured || now % 100 < 20) {
      this.renderPowerupsIndicators();
    }
  }

  renderPowerupsIndicators() {
    const now = Date.now();
    let html = '';

    for (const key in this.activePowerups) {
      const activeData = this.activePowerups[key];
      if (activeData.active) {
        const remaining = Math.max(0, activeData.expires - now);
        const percent = (remaining / activeData.duration) * 100;
        
        let title = '';
        if (key === 'speed') title = 'SPEED BOOST';
        if (key === 'freeze') title = 'FREEZE';
        if (key === 'shield') title = 'MAGNETIC SHIELD';

        html += `
          <div class="active-powerup-pill ${key}">
            <span>${title}</span>
            <div class="powerup-duration-bar">
              <div class="powerup-duration-fill" style="width: ${percent}%;"></div>
            </div>
          </div>
        `;
      }
    }

    this.dom.powerupsBar.innerHTML = html;
    if (html !== '') {
      this.dom.powerupsBar.classList.remove('hidden');
    } else {
      this.dom.powerupsBar.classList.add('hidden');
    }
  }

  // ==========================================
  // COMBO & SCORE INCREMENTS
  // ==========================================

  handleBallEaten(ball) {
    const now = Date.now();
    this.ballsEaten++;

    // Process combos
    if (now - this.lastEatTime < this.comboDecayTime) {
      this.comboMultiplier = Math.min(5, this.comboMultiplier + 1);
    } else {
      this.comboMultiplier = 1;
    }

    this.lastEatTime = now;
    if (this.comboMultiplier > this.peakCombo) {
      this.peakCombo = this.comboMultiplier;
    }

    // Base point allocation by type
    let points = 100;
    if (ball.type === 'fast') points = 250;
    if (ball.type === 'giant') points = 50;

    // Apply combo multipliers
    this.score += points * this.comboMultiplier;

    // Time bonuses disabled

    // Play synthesized blip sound
    audio.playEat(this.comboMultiplier > 1);

    // Spawn visual explosion particle burst
    this.createBurst(ball.x, ball.y, ball.color);

    // Update HUD visual details
    this.updateHUD();

    // Check if all balls eaten (Win condition)
    const activeCount = this.balls.filter(b => b.exists).length;
    if (activeCount === 0) {
      this.endGame(true);
    }
  }

  createBurst(x, y, color) {
    // Generate 15-20 particles
    const particleCount = 18;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  updateHUD() {
    this.dom.hudScore.textContent = String(this.score).padStart(4, '0');
    
    // Render ball balance
    const activeCount = this.balls.filter(b => b.exists).length;
    this.dom.hudBalls.textContent = `${activeCount} / ${this.balls.length}`;

    // Combo UI update
    this.dom.hudCombo.textContent = `${this.comboMultiplier}x`;
    if (this.comboMultiplier > 1) {
      this.dom.hudCombo.classList.add('multiplier');
    } else {
      this.dom.hudCombo.classList.remove('multiplier');
    }
  }

  updateComboDecay() {
    if (this.comboMultiplier <= 1) {
      this.dom.comboProgress.style.width = '0%';
      return;
    }

    const elapsed = Date.now() - this.lastEatTime;
    const remaining = Math.max(0, this.comboDecayTime - elapsed);
    const percent = (remaining / this.comboDecayTime) * 100;

    this.dom.comboProgress.style.width = `${percent}%`;

    if (percent <= 0) {
      this.comboMultiplier = 1;
      this.updateHUD();
    }
  }

  // ==========================================
  // CORE ENGINE ANIMATION LOOP
  // ==========================================

  loop(timestamp) {
    if (this.gameState !== 'playing') return;

    // Clear Canvas with alpha trail for movement blur
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    this.ctx.fillStyle = isDark ? 'rgba(5, 4, 9, 0.22)' : 'rgba(240, 242, 245, 0.22)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 1. Spawning over time has been disabled to keep target count at 30

    // 2. Powerups random spawning scheduler
    if (Math.random() < 0.0018) { // Soft rate check per frame
      this.triggerPowerupSpawn();
    }

    // 3. Update & Draw PowerUps list
    this.powerups = this.powerups.filter(pu => {
      // Delete from canvas if lifespan exceeded
      if (Date.now() - pu.spawnTime > pu.lifespan) {
        return false;
      }

      pu.update(this.width, this.height);
      pu.draw(this.ctx);

      // Check collision with player
      if (pu.collisionDetect(this.evilCircle)) {
        this.applyPowerup(pu.type);
        return false; // Consume and remove
      }
      return true;
    });

    // 4. Update & Draw Balls list
    this.balls.forEach(ball => {
      if (ball.exists) {
        ball.update(this.width, this.height);
        ball.collisionDetect(this.balls);
        ball.draw(this.ctx);
      }
    });

    // 5. Update & Draw Player (Evil Circle)
    this.evilCircle.update(this.width, this.height);
    this.evilCircle.collisionDetect(this.balls, (b) => this.handleBallEaten(b));
    this.evilCircle.draw(this.ctx);

    // 6. Update & Draw explosion particles
    this.particles = this.particles.filter(p => {
      if (p.exists) {
        p.update();
        p.draw(this.ctx);
        return true;
      }
      return false;
    });

    // 7. Update ongoing time frames modifiers
    this.updatePowerupsStates();
    this.updateComboDecay();

    // Loop
    requestAnimationFrame((t) => this.loop(t));
  }
}

// Initialise game on DOM loading completion
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
