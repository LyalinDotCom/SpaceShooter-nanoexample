Space Shooter — Feature Tracker (AGENTS)

This document summarizes how the game works and tracks all user-visible features and notable implementation details inferred from the codebase.

Overview

- Core: Phaser 3 arcade shooter with endless waves.
- Resolution: 800×600, mounted into `#game-container` (see `src/game.js:373`).
- Build: Vite (root `src/`, output `public/`), ESLint plugin enabled.
- Entry: `src/index.html` loads `game.js` (ESM bundled); no CDN.

Recent Fixes

- Procedural textures (bullet/power-up) are now created in-scene during `create()` before groups, preventing race conditions that broke hit detection.
- Bullet pooling fixed: bodies are re-enabled on reuse; off-screen cleanup uses `killAndHide` to avoid stuck bullets.
- Larger hitboxes: bullet bodies enlarged to 8×20; enemy colliders to ~90% of display for more forgiving hits.
- Temporary: power-up drops disabled to eliminate confusing green dot.

Gameplay Loop

- Assets preload: backgrounds (1–5), player, 20 enemy sprites (`src/game.js:73`).
- Create phase:
  - Scrolling background via `tileSprite` (`src/game.js:90`).
  - Player sprite with world bounds and a sized collider (~80% of display) (`src/game.js:93`, `src/game.js:96`).
  - Bullet groups (player and enemy) using pooled physics groups (`defaultKey: 'bullet'`).
  - Colliders: player↔enemies, player↔enemyBullets; bullets use overlap with enemies.
  - HUD texts: score, wave, debug enemy count (`src/game.js:121`).
  - Starts first wave (`src/game.js:126`).
- Update phase (`src/game.js:133`):
  - Scrolls background (`tilePositionY -= 2`).
  - Player left/right/up/down movement; Space to shoot (hold-to-fire with cooldown).
  - Enemies drift down, stop at y>300, bounce horizontally within x=50..750.
  - Enemies occasionally fire after a timer threshold.
  - Debug HUD shows active enemies and spawning flag.
  - When no active enemies and not spawning, increments wave and schedules next wave.
  - Cleans up off-screen bullets.

Player

- Sprite: scaled to `0.05`, constrained to world bounds (`src/game.js:93`).
- Collision: sized body to ~80% of displayed sprite (`src/game.js:96`).
- Controls: Arrow Left/Right/Up/Down; Space to shoot (hold). `D` toggles debug (`src/game.js:98`, `src/game.js:110`).
- Speed: horizontal and vertical velocity up to ±300 (`src/game.js:142`).

Bullets

- Pooled physics groups with `defaultKey: 'bullet'`.
- Texture: generated at runtime as a 2×10 white rectangle.
- Player bullet: fired from player nose with velocity (0, -500).
- Enemy bullet: fired from enemy with velocity (0, 200).
- Firing: hold-to-fire with cooldown (200ms; rapid-fire power-up reduces to ~80ms).
- Cleanup: bullets are disabled/hidden when off-screen for pooling.

Enemies

- Spawn: via `startWave()`; either timed spawns (every 600ms) or simple formation every 3rd wave (`src/game.js:338`).
- Count per wave: `min(random(3..5) + floor((wave-1)*1.5), 20)` (`src/game.js:321`).
- Sprite: random among 20 enemy images, scaled `0.05` (`src/game.js:335`, `src/game.js:337`).
- Collision: sized body to ~80% of display (`src/game.js:356`).
- Motion: initial velocities y=50..150 down, x=-50..50 sideways (`src/game.js:359`).
- Behavior in update: stop vertical at y>300; bounce on x<50 or x>750 (`src/game.js:151`, `src/game.js:155`).
- Firing: after `enemyFireTimer > 120` frames, ~2% chance per update, with occasional timer reset (`src/game.js:159`).

Waves & Difficulty

- Starts at wave 1; when no active enemies and not currently spawning, increments wave and spawns next after 1s (`src/game.js:173`).
- Sets `isSpawning = true` at `startWave()` to avoid duplicate scheduling; cleared when spawns complete (`src/game.js:294`, `src/game.js:371`).
- Background rotates per wave using loaded backgrounds (`src/game.js:303`).

HUD / UI

- Score (top-left), Wave (top-right), Debug (bottom-left) (`src/game.js:121`).
- Debug HUD hidden by default; press `D` to toggle (`src/game.js:166`).
- Score increases +10 per enemy destroyed (`src/game.js:271`).
- Game Over UI: centered text and clickable `RESTART` button with hover effect (`src/game.js:219`).

Background & Visuals

- Background: `tileSprite(800×600)` with continuous vertical scroll (`src/game.js:90`, `src/game.js:136`).
- Rotates background texture each wave (`src/game.js:303`).
- Explosion effect: procedural graphics (three concentric circles) with a brief tween expanding and fading (`src/game.js:245`).
- Styles: `src/style.css` sets dark theme, centers content, adds white border to canvas.

Game Over & Restart

- Trigger: collision of player with enemy or enemy bullet (`src/game.js:116`, `src/game.js:213`).
- Effect: pauses physics, tints player red, plays a low beep, shows UI, waits for restart click.
- Restart: clears UI, resets state (score, wave, flags, timers), clears groups, resets player, resumes physics, starts wave 1 (`src/game.js:275`).

Input

- Arrow keys: Left/Right/Up/Down movement (`src/game.js:98`, `src/game.js:142`).
- Spacebar: shoot (hold-to-fire with cooldown) (`src/game.js:190`).
- D: toggle debug HUD (`src/game.js:110`).

Physics & Config

- Engine: Phaser Arcade Physics (`src/game.js:378`).
- Gravity: disabled (`{ y: 0 }`), debug off (`src/game.js:381`).
- Parent DOM container: `#game-container` (`src/game.js:377`).

Tech Stack

- Phaser 3 via ESM import bundled by Vite; CDN removed (`src/index.html`, `src/game.js:1`).
- Vite build tooling with ESLint plugin (`vite.config.js`).
- Source served from `src/`; production build in `public/`.

Assets

- Backgrounds: 5 images (`src/assets/background1.png` … `background5.png`).
- Player: `src/assets/player.png`.
- Enemies: 20 sprites (`src/assets/enemy1.png` … `enemy20.png`).
- Bullet: procedural texture generated at runtime (no file).

Observations / Potential Enhancements

- Audio: add mute toggle and volume control; consider richer SFX/music.
- Extend power-ups and formations; add enemy patterns/bosses.
- Mobile: add touch controls and responsiveness.
- Menu/pause: add start/pause screens and a scoreboard.

File Map

- `src/index.html`: HTML entry; loads bundled `game.js` (no CDN).
- `src/game.js`: All game logic, asset loading, scene, physics, waves, bullets, UI.
- `src/style.css`: Basic layout and canvas styling.
- `vite.config.js`: Vite config (root `src/`, output `public/`, ESLint plugin).
- `public/`: Built assets and production HTML.

Collaboration Preferences

- Build and lint: run `npm run lint` and `npm run build` before handing off.
- Runtime-only audio: use browser Web Audio, no external files.
- Minimal, focused patches: keep changes surgical and documented here.
- Debugging UX: debug HUD behind `D` toggle; avoid shipping noisy logs.
- Asset discipline: prefer ESM assets; avoid dual-loading via CDN.
- Incremental features: small, testable steps (e.g., hitbox tuning, backgrounds rotation) before larger systems.
 - Maintain this document only when changes affect future understanding; small fixes need not be recorded.
