# Neon Bounce: Retro Arcade Bouncing Balls

An interactive, feature-rich retro-modern arcade game built using vanilla HTML5, CSS3, and modern ES6 JavaScript classes. This project significantly enhances the classic MDN JavaScript "Bouncing Balls" demo by adding player controls, real elastic 2D collision physics, power-ups, a dynamic combo scoring system, and synthesized audio.

---

## 🚀 Key Features

*   **Player-Controlled Ring (Evil Circle)**: Move around the screen using `W, A, S, D` or the `Arrow Keys` to consume the bouncing balls.
*   **Realistic Elastic 2D Physics**: Balls bounce off walls and react dynamically to collisions with each other based on their mass/size conservation of momentum.
*   **Variable Ball Types**:
    *   *Normal Balls*: Balanced speed and size (various glowing hues).
    *   *Fast Balls*: Small, yellow, and high speed (extra points).
    *   *Giant Balls*: Heavy, slow-moving, magenta structures (low points).
*   **Power-Ups Spawns**:
    *   **⚡ Speed Boost (Yellow)**: Double player's ring movement speed.
    *   **❄️ Freeze (Cyan)**: Slows all ball velocities down to 22% temporarily.
    *   **🛡️ Magnetic Shield (Magenta)**: Spawns an aura field that expands the ball eating radius by 2.2x.
*   **Programmatic Sound Engine**: Utilizes the **Web Audio API** to synthesize retro chiptunes and sound effects dynamically in code (no external sound file assets required!):
    *   *Eat pop sound* (pitch shifts up with combo streaks).
    *   *Power-up chime* (glistening arpeggio notes).
    *   *Game-over sweep* (dramatic descending sawtooth).
    *   *Background music* (repeating 16-step pentatonic synthesizer arpeggiator).
*   **Cyber Aesthetics**: Modern interface featuring glassmorphic menus (`backdrop-filter`), vibrant color palettes, theme switches (Dark / Light mode), particle explosion bursts on consumption, and a score multiplier tracker.
*   **LocalStorage Support**: High scores are persisted on your device.

---

## 🎮 Controls

| Action | Control Keys |
| :--- | :--- |
| **Move Evil Circle** | `W, A, S, D` or `Arrow Keys` |
| **Pause / Resume** | `Escape` key (or Pause Button in HUD) |
| **Theme Toggle** | Click `Dark Mode` / `Light Mode` button |

---

## 🛠️ Codebase Structure

The game is implemented using clean **ES6 Object-Oriented Programming (OOP)**, leveraging class inheritance:

*   **`Shape`**: Base class representing coordinates and velocity fields.
*   **`Ball`** (extends `Shape`): Handles motion parameters, wall boundary bounces, and ball-to-ball elastic collision computations.
*   **`EvilCircle`** (extends `Shape`): Binds event listeners to track keyboard inputs, moves the player's collector ring, and detects collisions for ball consumption.
*   **`PowerUp`** (extends `Shape`): Periodically spawns and triggers temporary modifiers upon player collection.
*   **`Particle`**: Individual particles with randomized coordinates and velocities that fade outwards to create explosion bursts.
*   **`GameAudio`**: Manages Web Audio context, synthesis oscillators, master gains, BGM sequencers, and retro sounds.
*   **`Game`**: Acts as the main loop controller (`requestAnimationFrame`), managing game states (`menu`, `playing`, `paused`, `gameover`), rendering trails, updating score HUDs, checking victories (eating all 30 balls), and persisting high scores.

---

## 📦 How to Run Locally

Since the game uses relative assets and local storage, it is best run using a basic HTTP web server.

### Option 1: Node.js (Recommended)
If you have Node.js installed, navigate to the project directory in your terminal and run:
```bash
npx http-server -p 8090
```
Then open your browser and navigate to:
👉 **[http://localhost:8090/index.html](http://localhost:8090/index.html)**

### Option 2: Python
If you have Python installed, navigate to the project directory and run:
```bash
python -m http.server 8090
```
Then open your browser and navigate to:
👉 **[http://localhost:8090/](http://localhost:8090/)**
