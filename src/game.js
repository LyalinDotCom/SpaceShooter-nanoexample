import Phaser from 'phaser'
import bg1 from './assets/background1.png'
import bg2 from './assets/background2.png'
import bg3 from './assets/background3.png'
import bg4 from './assets/background4.png'
import bg5 from './assets/background5.png'
import playerImg from './assets/player.png'
import enemy1 from './assets/enemy1.png'
import enemy2 from './assets/enemy2.png'
import enemy3 from './assets/enemy3.png'
import enemy4 from './assets/enemy4.png'
import enemy5 from './assets/enemy5.png'
import enemy6 from './assets/enemy6.png'
import enemy7 from './assets/enemy7.png'
import enemy8 from './assets/enemy8.png'
import enemy9 from './assets/enemy9.png'
import enemy10 from './assets/enemy10.png'
import enemy11 from './assets/enemy11.png'
import enemy12 from './assets/enemy12.png'
import enemy13 from './assets/enemy13.png'
import enemy14 from './assets/enemy14.png'
import enemy15 from './assets/enemy15.png'
import enemy16 from './assets/enemy16.png'
import enemy17 from './assets/enemy17.png'
import enemy18 from './assets/enemy18.png'
import enemy19 from './assets/enemy19.png'
import enemy20 from './assets/enemy20.png'

const enemyImages = {
  enemy1,
  enemy2,
  enemy3,
  enemy4,
  enemy5,
  enemy6,
  enemy7,
  enemy8,
  enemy9,
  enemy10,
  enemy11,
  enemy12,
  enemy13,
  enemy14,
  enemy15,
  enemy16,
  enemy17,
  enemy18,
  enemy19,
  enemy20
}

class GameScene extends Phaser.Scene {
  constructor () {
    super('GameScene')
    this.player = null
    this.cursors = null
    this.bullets = null
    this.enemies = null
    this.enemyBullets = null
    this.powerUps = null
    this.background = null
    this.score = 0
    this.scoreText = null
    this.wave = 1
    this.waveText = null
    this.gameOver = false
    this.isSpawning = false
    this.bgKeys = ['background1', 'background2', 'background3', 'background4', 'background5']
    this.gameOverText = null
    this.restartButton = null
    this.enemyFireTimer = 0
    this.debugText = null
    this.debugEnabled = false

    // Shooting control
    this.shootCooldown = 200
    this.nextShotTime = 0
    this.autoFireUntil = 0

    // Web Audio
    this.audioCtx = null
    // Timers/watchdogs
    this.nextWaveTimer = null
    this.spawnWatchStart = null
    this.spawnTimerEvent = null

    // Enemy fire tuning (global control)
    this.fireConfig = {
      // Minimum time between individual-fire checks (ms)
      minGateMs: 800,
      // Chance per active enemy to fire when gate opens (0..1)
      perEnemyChance: 0.2,
      // Coordinated volleys
      volley: {
        enabled: true,
        minDelayMs: 2500,
        maxDelayMs: 5000,
        fireAll: true, // if false, uses fraction below
        fraction: 0.6,
        aimed: true, // aim towards player
        speed: 240
      }
    }
    this.nextFireGateAt = 0
    this.nextVolleyAt = 0
  }

  preload () {
    // Load backgrounds
    this.load.image('background1', bg1)
    this.load.image('background2', bg2)
    this.load.image('background3', bg3)
    this.load.image('background4', bg4)
    this.load.image('background5', bg5)
    // Load player
    this.load.image('player', playerImg)
    // Load enemies
    for (const key in enemyImages) {
      this.load.image(key, enemyImages[key])
    }
  }

  create () {
    // Create a scrolling background
    this.background = this.add.tileSprite(400, 300, 800, 600, 'background1')

    // Ensure procedural textures exist before creating groups
    if (!this.textures.exists('bullet')) {
      const g = this.add.graphics()
      g.fillStyle(0xffffff, 1)
      g.fillRect(0, 0, 2, 10)
      g.generateTexture('bullet', 2, 10)
      g.destroy()
    }
    if (!this.textures.exists('powerup')) {
      const g2 = this.add.graphics()
      g2.fillStyle(0x00ff66, 1)
      g2.fillRoundedRect(0, 0, 12, 12, 3)
      g2.generateTexture('powerup', 12, 12)
      g2.destroy()
    }

    // Player
    this.player = this.physics.add.sprite(400, 550, 'player').setScale(0.05)
    this.player.setCollideWorldBounds(true)
    // Fair hitbox sized to displayed sprite
    this.player.body.setSize(this.player.displayWidth * 0.8, this.player.displayHeight * 0.8, true)

    // Cursors
    this.cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.on('keydown-SPACE', () => {
      this.tryFireBullet()
    })
    // Toggle debug overlay
    this.input.keyboard.on('keydown-D', () => {
      this.debugEnabled = !this.debugEnabled
      this.debugText.setVisible(this.debugEnabled)
    })

    // Bullets
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 200
    })

    // Enemies
    this.enemies = this.physics.add.group()

    // Enemy Bullets
    this.enemyBullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 200
    })

    // Power-Ups
    this.powerUps = this.physics.add.group()

    // Collisions
    this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this)
    this.physics.add.collider(this.player, this.enemyBullets, this.playerHit, null, this)
    // Use overlap for bullet hits to avoid separation issues
    this.physics.add.overlap(this.bullets, this.enemies, this.enemyHit, null, this)
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this)

    // Score and Wave Text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' })
    this.waveText = this.add.text(550, 16, 'Wave: 1', { fontSize: '32px', fill: '#FFF' })
    this.debugText = this.add.text(16, 560, 'Enemies: 0', { fontSize: '16px', fill: '#FFF' })
    this.debugText.setVisible(this.debugEnabled)

    // Start first wave
    // Initialize fire timers
    this.nextFireGateAt = this.time.now + this.fireConfig.minGateMs
    this.scheduleNextVolley()
    this.startWave()
  }

  update () {
    if (this.gameOver) {
      return
    }

    // Scroll background
    this.background.tilePositionY -= 2

    // Player movement (adds vertical)
    let vx = 0
    let vy = 0
    if (this.cursors.left.isDown) vx = -300
    else if (this.cursors.right.isDown) vx = 300
    if (this.cursors.up?.isDown) vy = -300
    else if (this.cursors.down?.isDown) vy = 300
    this.player.setVelocity(vx, vy)

    // Hold-to-fire and auto-fire
    if (this.cursors.space?.isDown || this.time.now < this.autoFireUntil) {
      this.tryFireBullet()
    }

    // Enemy movement and firing
    this.enemies.children.each(enemy => {
      if (enemy.active) {
        if (enemy.y > 300) {
          enemy.body.velocity.y = 0
        }

        // Keep enemies moving horizontally and bounce off walls without sticking
        if (enemy.x <= 50) {
          enemy.x = 50
          const speed = Math.max(Math.abs(enemy.body.velocity.x), 60)
          enemy.body.velocity.x = speed
        } else if (enemy.x >= 750) {
          enemy.x = 750
          const speed = Math.max(Math.abs(enemy.body.velocity.x), 60)
          enemy.body.velocity.x = -speed
        } else if (Math.abs(enemy.body.velocity.x) < 20) {
          enemy.body.velocity.x = Phaser.Math.Between(40, 80) * (Phaser.Math.Between(0, 1) ? 1 : -1)
        }
      }
    })

    // Global, time-based fire gate for individual enemy shots
    const now = this.time.now
    if (now >= this.nextFireGateAt) {
      const chance = this.fireConfig.perEnemyChance
      this.enemies.children.each(enemy => {
        if (enemy.active && Math.random() < chance) {
          // Slight random horizontal lead
          const vx = Phaser.Math.Between(-40, 40)
          this.fireEnemyBullet(enemy.x, enemy.y, vx, 220)
        }
      })
      this.nextFireGateAt = now + this.fireConfig.minGateMs
    }

    // Coordinated volleys
    if (this.fireConfig.volley.enabled && now >= this.nextVolleyAt) {
      this.coordinatedVolley()
      this.scheduleNextVolley()
    }

    // Update debug info
    const activeEnemies = this.enemies.countActive(true)
    if (this.debugEnabled) {
      this.debugText.setText(`Enemies: ${activeEnemies} | Spawning: ${this.isSpawning}`)
    }

    // Check for next wave with better logic
    if (activeEnemies === 0 && !this.isSpawning && !this.gameOver) {
      // Prepare and lock spawning for next wave using helper
      this.startNextWave(1000)
    }

    // Spawn watchdog: if flagged spawning but no enemies appear in time, restart the wave
    if (this.isSpawning && activeEnemies === 0 && !this.gameOver) {
      if (this.spawnWatchStart == null) this.spawnWatchStart = this.time.now
      if (this.time.now - this.spawnWatchStart > 2500) {
        console.warn('Spawn watchdog restarting wave')
        this.isSpawning = false
        this.spawnWatchStart = null
        this.startNextWave(0)
      }
    } else {
      this.spawnWatchStart = null
    }

    // Destroy bullets that are off-screen
    this.bullets.children.each(bullet => {
      if (bullet.active && bullet.y < -20) {
        this.bullets.killAndHide(bullet)
        if (bullet.body) bullet.body.enable = false
      }
    })

    this.enemyBullets.children.each(bullet => {
      if (bullet.active && bullet.y > 620) {
        this.enemyBullets.killAndHide(bullet)
        if (bullet.body) bullet.body.enable = false
      }
    })
  }

  tryFireBullet () {
    if (this.time.now < this.nextShotTime) return
    const x = this.player.x
    const y = this.player.y - this.player.displayHeight * 0.6
    const bullet = this.bullets.get(x, y, 'bullet')
    if (!bullet) return
    bullet.setActive(true)
    bullet.setVisible(true)
    if (bullet.body) {
      bullet.body.enable = true
      bullet.body.reset(x, y)
      bullet.body.setAllowGravity(false)
      bullet.body.setVelocity(0, -520)
      if (bullet.body.setSize) bullet.body.setSize(10, 26, true)
    } else {
      bullet.setPosition(x, y)
      bullet.setVelocity(0, -500)
    }
    this.nextShotTime = this.time.now + this.shootCooldown
    this.playBeep(700, 0.05, 'square', 0.03)
  }

  fireEnemyBullet (x, y, vx = 0, vy = 200) {
    const bx = x
    const by = y + 20
    const bullet = this.enemyBullets.get(bx, by, 'bullet')
    if (!bullet) return
    bullet.setActive(true)
    bullet.setVisible(true)
    if (bullet.body) {
      bullet.body.enable = true
      bullet.body.reset(bx, by)
      bullet.body.setAllowGravity(false)
      bullet.body.setVelocity(vx, vy)
      if (bullet.body.setSize) bullet.body.setSize(10, 26, true)
    } else {
      bullet.setPosition(bx, by)
      bullet.setVelocity(vx, vy)
    }
  }

  playerHit (player, hitable) {
    hitable.destroy()
    this.physics.pause()
    this.player.setTint(0xff0000)
    this.gameOver = true
    this.playBeep(200, 0.2, 'sawtooth', 0.05)

    // Store references to game over UI elements
    this.gameOverText = this.add.text(400, 250, 'Game Over', { fontSize: '64px', fill: '#FFF' }).setOrigin(0.5)

    // Add restart button
    this.restartButton = this.add.text(400, 350, 'RESTART', {
      fontSize: '40px',
      fill: '#FFF',
      backgroundColor: '#333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)

    this.restartButton.setInteractive({ useHandCursor: true })
    this.restartButton.on('pointerover', () => {
      this.restartButton.setStyle({ backgroundColor: '#555' })
    })
    this.restartButton.on('pointerout', () => {
      this.restartButton.setStyle({ backgroundColor: '#333' })
    })
    this.restartButton.on('pointerdown', () => {
      this.restartGame()
    })
  }

  enemyHit (bullet, enemy) {
    if (bullet?.active) {
      this.bullets.killAndHide(bullet)
      if (bullet.body) bullet.body.enable = false
    }

    // Create explosion effect
    const explosion = this.add.graphics()
    explosion.x = enemy.x
    explosion.y = enemy.y

    // Draw explosion circles
    explosion.fillStyle(0xffff00, 1)
    explosion.fillCircle(0, 0, 10)
    explosion.fillStyle(0xff8800, 0.8)
    explosion.fillCircle(0, 0, 20)
    explosion.fillStyle(0xff0000, 0.5)
    explosion.fillCircle(0, 0, 30)

    // Animate explosion
    this.tweens.add({
      targets: explosion,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        explosion.destroy()
      }
    })

    enemy.destroy()
    this.score += 10
    this.scoreText.setText('Score: ' + this.score)

    // Power-up drop disabled for now

    this.playBeep(320, 0.08, 'triangle', 0.04)
  }

  restartGame () {
    // Clear game over UI elements
    if (this.gameOverText) {
      this.gameOverText.destroy()
      this.gameOverText = null
    }
    if (this.restartButton) {
      this.restartButton.destroy()
      this.restartButton = null
    }

    // Reset game state
    this.score = 0
    this.wave = 1
    this.gameOver = false
    this.isSpawning = false
    this.enemyFireTimer = 0
    this.nextShotTime = 0
    this.shootCooldown = 200
    this.autoFireUntil = 0
    if (this.nextWaveTimer) { this.nextWaveTimer.remove(false); this.nextWaveTimer = null }
    if (this.spawnTimerEvent) { this.spawnTimerEvent.remove(false); this.spawnTimerEvent = null }
    this.spawnWatchStart = null

    // Clear all existing game objects
    this.enemies.clear(true, true)
    this.bullets.clear(true, true)
    this.enemyBullets.clear(true, true)
    this.powerUps.clear(true, true)

    // Reset player
    this.player.clearTint()
    this.player.setPosition(400, 550)
    this.player.setActive(true)

    // Update UI texts
    this.scoreText.setText('Score: 0')
    this.waveText.setText('Wave: 1')

    // Resume physics
    this.physics.resume()

    // Start first wave again
    this.startWave()
  }

  startWave () {
    if (this.gameOver) {
      console.log('Cannot start wave - game over')
      return
    }
    // Mark spawning and rotate background
    this.isSpawning = true
    const bgIndex = (this.wave - 1) % this.bgKeys.length
    this.background.setTexture(this.bgKeys[bgIndex])

    // Better wave progression: starts with 3-5, then adds 1-2 per wave
    const baseEnemies = Phaser.Math.Between(3, 5)
    const additionalEnemies = Math.floor((this.wave - 1) * 1.5)
    const enemiesThisWave = Math.min(baseEnemies + additionalEnemies, 20)

    console.log(`Wave ${this.wave} starting with ${enemiesThisWave} enemies`)
    let enemiesCreated = 0

    // Occasionally spawn a simple formation
    const useFormation = this.wave % 3 === 0
    if (useFormation) {
      const cols = Math.min(8, enemiesThisWave)
      const startX = 80
      const endX = 720
      const step = (endX - startX) / (cols - 1)
      for (let i = 0; i < enemiesThisWave; i++) {
        const col = i % cols
        const x = startX + col * step
        const y = -80 - Math.floor(i / cols) * 50
        const enemyKey = `enemy${Phaser.Math.Between(1, 20)}`
        const enemy = this.enemies.create(x, y, enemyKey)
        enemy.setScale(0.05)
        // Reasonable hitbox matching display size
        enemy.body.setSize(enemy.displayWidth * 1.2, enemy.displayHeight * 1.2, true)
        enemy.body.velocity.y = Phaser.Math.Between(70, 120)
        const hv = Phaser.Math.Between(40, 80) * (Phaser.Math.Between(0, 1) ? 1 : -1)
        enemy.body.velocity.x = hv
        enemiesCreated++
      }
      this.isSpawning = false
      console.log(`Wave ${this.wave} formation spawned ${enemiesCreated} enemies`)
    } else {
      this.spawnTimerEvent = this.time.addEvent({
        delay: 600,
        repeat: enemiesThisWave - 1,
        callback: () => {
          if (!this.gameOver) {
            const x = Phaser.Math.Between(50, 750)
            const y = Phaser.Math.Between(-100, -50)
            const enemyKey = `enemy${Phaser.Math.Between(1, 20)}`
            const enemy = this.enemies.create(x, y, enemyKey)
            enemy.setScale(0.05)
            enemy.body.setSize(enemy.displayWidth * 1.2, enemy.displayHeight * 1.2, true)
            enemy.body.velocity.y = Phaser.Math.Between(50, 150)
            const hv = Phaser.Math.Between(40, 80) * (Phaser.Math.Between(0, 1) ? 1 : -1)
            enemy.body.velocity.x = hv
            enemiesCreated++
            // console.log(`Enemy ${enemiesCreated} created`)
          }
        },
        onComplete: () => {
          this.isSpawning = false
          this.spawnTimerEvent = null
          console.log(`Wave ${this.wave} complete - spawned ${enemiesCreated} enemies`)
        }
      })
      if (!this.spawnTimerEvent) {
        this.isSpawning = false
      }
    }
  }

  // Helper: schedule next coordinated volley
  scheduleNextVolley () {
    const { minDelayMs, maxDelayMs } = this.fireConfig.volley
    this.nextVolleyAt = this.time.now + Phaser.Math.Between(minDelayMs, maxDelayMs)
  }

  // Fire a coordinated volley from all or a fraction of active enemies
  coordinatedVolley () {
    const active = []
    this.enemies.children.each(e => { if (e.active) active.push(e) })
    if (active.length === 0) return

    let shooters = active
    const { fireAll, fraction, aimed, speed } = this.fireConfig.volley
    if (!fireAll) {
      const count = Math.max(1, Math.floor(active.length * fraction))
      shooters = Phaser.Utils.Array.Shuffle(active.slice()).slice(0, count)
    }

    shooters.forEach(e => {
      if (aimed && this.player?.active) {
        const dx = this.player.x - e.x
        const dy = Math.max(1, this.player.y - e.y)
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const vx = (dx / len) * speed
        const vy = (dy / len) * speed
        this.fireEnemyBullet(e.x, e.y, vx, vy)
      } else {
        this.fireEnemyBullet(e.x, e.y)
      }
    })
  }

  // Helper: advance wave counter and start wave, with optional delay
  startNextWave (delayMs = 1000) {
    // Increment wave and update UI immediately so indicator reflects reality
    this.isSpawning = true
    this.wave++
    this.waveText.setText('Wave: ' + this.wave)
    console.log(`Preparing wave ${this.wave}`)
    if (this.nextWaveTimer) this.nextWaveTimer.remove(false)
    if (delayMs > 0) {
      this.nextWaveTimer = this.time.delayedCall(delayMs, () => this.startWave())
    } else {
      this.startWave()
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
}

window.game = new Phaser.Game(config)

// Audio helpers on the Scene prototype
GameScene.prototype.ensureAudio = function () {
  if (!this.audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    this.audioCtx = Ctx ? new Ctx() : null
  }
  if (this.audioCtx?.state === 'suspended') {
    this.audioCtx.resume().catch(() => {})
  }
}

GameScene.prototype.playBeep = function (freq = 440, duration = 0.05, type = 'square', gainValue = 0.03) {
  try {
    this.ensureAudio()
    if (!this.audioCtx) return
    const ctx = this.audioCtx
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(gainValue, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (e) {
    // ignore audio errors (e.g., autoplay restrictions)
  }
}

GameScene.prototype.collectPowerUp = function (player, powerUp) {
  const type = powerUp.getData('type')
  powerUp.destroy()
  if (type === 'rapid') {
    this.shootCooldown = 80
    this.autoFireUntil = this.time.now + 5000
    this.playBeep(900, 0.08, 'square', 0.04)
  }
}
