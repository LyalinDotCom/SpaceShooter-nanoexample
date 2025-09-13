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
    this.background = null
    this.score = 0
    this.scoreText = null
    this.wave = 1
    this.waveText = null
    this.gameOver = false
    this.isSpawning = false
    this.gameOverText = null
    this.restartButton = null
    this.enemyFireTimer = 0
    this.debugText = null
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

    // Player
    this.player = this.physics.add.sprite(400, 550, 'player').setScale(0.05)
    this.player.setCollideWorldBounds(true)
    this.player.body.setCircle(250)

    // Cursors
    this.cursors = this.input.keyboard.createCursorKeys()
    this.input.keyboard.on('keydown-SPACE', this.fireBullet, this)

    // Bullets
    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true
    })

    // Enemies
    this.enemies = this.physics.add.group()

    // Enemy Bullets
    this.enemyBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true
    })

    // Collisions
    this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this)
    this.physics.add.collider(this.player, this.enemyBullets, this.playerHit, null, this)
    this.physics.add.collider(this.bullets, this.enemies, this.enemyHit, null, this)

    // Score and Wave Text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' })
    this.waveText = this.add.text(550, 16, 'Wave: 1', { fontSize: '32px', fill: '#FFF' })
    this.debugText = this.add.text(16, 560, 'Enemies: 0', { fontSize: '16px', fill: '#FFF' })

    // Start first wave
    this.startWave()
  }

  update () {
    if (this.gameOver) {
      return
    }

    // Scroll background
    this.background.tilePositionY -= 2

    // Player movement
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300)
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300)
    } else {
      this.player.setVelocityX(0)
    }

    // Enemy movement and firing
    this.enemyFireTimer++
    this.enemies.children.each(enemy => {
      if (enemy.active) {
        if (enemy.y > 300) {
          enemy.body.velocity.y = 0
        }

        if (enemy.x < 50 || enemy.x > 750) {
          enemy.body.velocity.x *= -1
        }

        // Reduced firing rate - fire every 2-3 seconds (120-180 frames at 60fps)
        if (this.enemyFireTimer > 120 && Phaser.Math.Between(0, 100) > 98) {
          this.fireEnemyBullet(enemy.x, enemy.y)
          if (Phaser.Math.Between(0, 100) > 50) {
            this.enemyFireTimer = 0 // Reset timer after some enemies fire
          }
        }
      }
    })

    // Update debug info
    const activeEnemies = this.enemies.countActive(true)
    this.debugText.setText(`Enemies: ${activeEnemies} | Spawning: ${this.isSpawning}`)

    // Check for next wave with better logic
    if (activeEnemies === 0 && !this.isSpawning && !this.gameOver) {
      this.isSpawning = true // Set immediately to prevent multiple triggers
      this.wave++
      this.waveText.setText('Wave: ' + this.wave)
      console.log(`Preparing wave ${this.wave}`)
      this.time.delayedCall(1000, () => {
        // Don't reset isSpawning here, let startWave handle it
        this.startWave()
      })
    }

    // Destroy bullets that are off-screen
    this.bullets.children.each(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.destroy()
      }
    })

    this.enemyBullets.children.each(bullet => {
      if (bullet.active && bullet.y > 600) {
        bullet.destroy()
      }
    })
  }

  fireBullet () {
    const bullet = this.bullets.get()
    if (bullet) {
      bullet.fire(this.player.x, this.player.y - 20, 0, -500)
    }
  }

  fireEnemyBullet (x, y) {
    const bullet = this.enemyBullets.get()
    if (bullet) {
      bullet.fire(x, y + 20, 0, 200)
    }
  }

  playerHit (player, hitable) {
    hitable.destroy()
    this.physics.pause()
    this.player.setTint(0xff0000)
    this.gameOver = true

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
    bullet.destroy()

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

    // Clear all existing game objects
    this.enemies.clear(true, true)
    this.bullets.clear(true, true)
    this.enemyBullets.clear(true, true)

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

    // Better wave progression: starts with 3-5, then adds 1-2 per wave
    const baseEnemies = Phaser.Math.Between(3, 5)
    const additionalEnemies = Math.floor((this.wave - 1) * 1.5)
    const enemiesThisWave = Math.min(baseEnemies + additionalEnemies, 20)

    console.log(`Wave ${this.wave} starting with ${enemiesThisWave} enemies`)

    let enemiesCreated = 0
    const spawnTimer = this.time.addEvent({
      delay: 600,
      repeat: enemiesThisWave - 1,
      callback: () => {
        if (!this.gameOver) {
          const x = Phaser.Math.Between(50, 750)
          const y = Phaser.Math.Between(-100, -50)
          const enemyKey = `enemy${Phaser.Math.Between(1, 20)}`
          const enemy = this.enemies.create(x, y, enemyKey)
          enemy.setScale(0.05)
          // Make hitbox 2x bigger (was 250, now 500)
          enemy.body.setCircle(500)
          enemy.body.velocity.y = Phaser.Math.Between(50, 150)
          enemy.body.velocity.x = Phaser.Math.Between(-50, 50)
          enemiesCreated++
          console.log(`Enemy ${enemiesCreated} created`)
        }
      },
      onComplete: () => {
        this.isSpawning = false
        console.log(`Wave ${this.wave} complete - spawned ${enemiesCreated} enemies`)
      }
    })

    // If timer creation failed, reset spawning flag
    if (!spawnTimer) {
      this.isSpawning = false
    }
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor (scene, x, y) {
    super(scene, x, y, 'bullet')
  }

  fire (x, y, vx, vy) {
    this.body.reset(x, y)
    this.setActive(true)
    this.setVisible(true)
    this.body.velocity.x = vx
    this.body.velocity.y = vy
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

// Create a simple white texture for the bullets
function createBulletTexture (game) {
  const graphics = game.scene.getScene('GameScene').add.graphics()
  graphics.fillStyle(0xffffff, 1)
  graphics.fillRect(0, 0, 2, 10)
  graphics.generateTexture('bullet', 2, 10)
  graphics.destroy()
}

const game = new Phaser.Game(config)
game.events.on('ready', () => {
  createBulletTexture(game)
})
