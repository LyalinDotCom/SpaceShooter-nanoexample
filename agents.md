Space Shooter — Feature Tracker (AGENTS)

This document summarizes how the game works and tracks all user-visible features and notable implementation details inferred from the codebase.

Overview

- Core: Phaser 3 arcade shooter with endless waves.
- Resolution: 800×600, mounted into `#game-container` (see `src/game.js:373`).
- Build: Vite (root `src/`, output `public/`), ESLint plugin enabled.
- Entry: `src/index.html` loads Phaser CDN and `game.js`.

Gameplay Loop

- Assets preload: backgrounds (1–5), player, 20 enemy sprites (`src/game.js:73`).
- Create phase:
  - Scrolling background via `tileSprite` (`src/game.js:90`).
  - Player sprite with world bounds and circular body (`src/game.js:93`, `src/game.js:95`).
  - Bullet groups (player and enemy) using a custom `Bullet` class (`src/game.js:101`, `src/game.js:111`, `src/game.js:359`).
  - Colliders: player↔enemies, player↔enemyBullets, bullets↔enemies (`src/game.js:116`).
  - HUD texts: score, wave, debug enemy count (`src/game.js:121`).
  - Starts first wave (`src/game.js:126`).
- Update phase (`src/game.js:133`):
  - Scrolls background (`tilePositionY -= 2`).
  - Player left/right movement; Space to shoot.
  - Enemies drift down, stop at y>300, bounce horizontally within x=50..750.
  - Enemies occasionally fire after a timer threshold.
  - Debug HUD shows active enemies and spawning flag.
  - When no active enemies and not spawning, increments wave and schedules next wave.
  - Cleans up off-screen bullets.

Player

- Sprite: scaled to `0.05`, constrained to world bounds (`src/game.js:93`).
- Collision: circular body set to radius 250 (`src/game.js:95`).
- Controls: Arrow Left/Right, shoot on Space (`src/game.js:98`, `src/game.js:99`).
- Speed: horizontal velocity ±300 (`src/game.js:139`).

Bullets

- Class: `Bullet` extends `Phaser.Physics.Arcade.Sprite` (`src/game.js:359`).
- Texture: generated at runtime as a 2×10 white rectangle (`src/game.js:388`).
- Player bullet: fired from player.x, player.y-20, velocity (0, -500) (`src/game.js:199`).
- Enemy bullet: fired from enemy.x, enemy.y+20, velocity (0, 200) (`src/game.js:206`).
- Cleanup: destroys when off-screen (player bullets y<0, enemy bullets y>600) (`src/game.js:185`, `src/game.js:192`).

Enemies

- Spawn: via `startWave()` with a timed event every 600ms (`src/game.js:327`).
- Count per wave: `min(random(3..5) + floor((wave-1)*1.5), 20)` (`src/game.js:321`).
- Sprite: random among 20 enemy images, scaled `0.05` (`src/game.js:335`, `src/game.js:337`).
- Collision: circular body radius 500 (`src/game.js:339`).
- Motion: initial velocities y=50..150 down, x=-50..50 sideways (`src/game.js:340`).
- Behavior in update: stop vertical at y>300; bounce on x<50 or x>750 (`src/game.js:151`, `src/game.js:155`).
- Firing: after `enemyFireTimer > 120` frames, ~2% chance per update, with occasional timer reset (`src/game.js:159`).

Waves & Difficulty

- Starts at wave 1; when no active enemies and not currently spawning, increments wave and spawns next after 1s (`src/game.js:173`).
- `isSpawning` flag prevents duplicate wave starts; reset on spawn timer complete (`src/game.js:347`).

HUD / UI

- Score (top-left), Wave (top-right), Debug (bottom-left) (`src/game.js:121`).
- Score increases +10 per enemy destroyed (`src/game.js:271`).
- Game Over UI: centered text and clickable `RESTART` button with hover effect (`src/game.js:219`).

Background & Visuals

- Background: `tileSprite(800×600)` with continuous vertical scroll (`src/game.js:90`, `src/game.js:136`).
- Explosion effect: procedural graphics (three concentric circles) with a brief tween expanding and fading (`src/game.js:245`).
- Styles: `src/style.css` sets dark theme, centers content, adds white border to canvas.

Game Over & Restart

- Trigger: collision of player with enemy or enemy bullet (`src/game.js:116`, `src/game.js:213`).
- Effect: pauses physics, tints player red, shows UI, waits for restart click.
- Restart: clears UI, resets state (score, wave, flags, timers), clears groups, resets player, resumes physics, starts wave 1 (`src/game.js:275`).

Input

- Arrow keys: movement via `createCursorKeys()` (`src/game.js:98`).
- Spacebar: shoots (`src/game.js:99`).

Physics & Config

- Engine: Phaser Arcade Physics (`src/game.js:378`).
- Gravity: disabled (`{ y: 0 }`), debug off (`src/game.js:381`).
- Parent DOM container: `#game-container` (`src/game.js:377`).

Tech Stack

- Phaser 3 (CDN in HTML, plus ESM import in code): `src/index.html`, `src/game.js:1`.
- Vite build tooling with ESLint plugin (`vite.config.js`).
- Source served from `src/`; production build in `public/`.

Assets

- Backgrounds: 5 images (`src/assets/background1.png` … `background5.png`).
- Player: `src/assets/player.png`.
- Enemies: 20 sprites (`src/assets/enemy1.png` … `enemy20.png`).
- Bullet: procedural texture generated at runtime (no file).

Observations / Potential Enhancements

- Large hitboxes: player (radius 250) and enemies (radius 500) are large relative to scaled sprites; consider aligning physics body size to visual scale for fairness.
- Background variants (2–5) are loaded but not used; could rotate per wave.
- No vertical player movement; could add up/down for more control.
- No audio: add shoot/explosion sounds and background music.
- Power-ups and enemy variety (patterns, formations) are not implemented yet.
- Debug text is visible in gameplay; consider a debug toggle for production.
- Phaser is included via CDN and ESM; decide on one to avoid redundancy.

File Map

- `src/index.html`: HTML entry; includes Phaser CDN and `game.js`.
- `src/game.js`: All game logic, asset loading, scene, physics, waves, bullets, UI.
- `src/style.css`: Basic layout and canvas styling.
- `vite.config.js`: Vite config (root `src/`, output `public/`, ESLint plugin).
- `public/`: Built assets and production HTML.

