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
    this.makeColorTransparent('player', { r: 255, g: 255, b: 255 })
    for (let i = 1; i <= 20; i++) {
      this.makeColorTransparent(`enemy${i}`, { r: 255, g: 255, b: 255 })
    }

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
    this.enemies.children.each(enemy => {
      if (enemy.active) {
        if (enemy.y > 300) {
          enemy.body.velocity.y = 0
        }

        if (enemy.x < 50 || enemy.x > 750) {
          enemy.body.velocity.x *= -1
        }

        if (Phaser.Math.Between(0, 100) > 98) {
          this.fireEnemyBullet(enemy.x, enemy.y)
        }
      }
    })

    // Check for next wave
    if (this.enemies.countActive(true) === 0 && !this.isSpawning) {
      this.wave++
      this.waveText.setText('Wave: ' + this.wave)
      this.startWave()
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
    this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#FFF' }).setOrigin(0.5)
  }

  enemyHit (bullet, enemy) {
    bullet.destroy()
    enemy.destroy()
    this.score += 10
    this.scoreText.setText('Score: ' + this.score)
  }

  startWave () {
    if (this.gameOver || this.isSpawning) return

    this.isSpawning = true
    const enemiesThisWave = Math.min(3 + this.wave, 15)

    this.time.addEvent({
      delay: 500,
      repeat: enemiesThisWave - 1,
      callback: () => {
        const x = Phaser.Math.Between(50, 750)
        const y = Phaser.Math.Between(-100, -50)
        const enemyKey = `enemy${Phaser.Math.Between(1, 20)}`
        const enemy = this.enemies.create(x, y, enemyKey)
        enemy.setScale(0.05)
        enemy.body.setCircle(250)
        enemy.body.velocity.y = Phaser.Math.Between(50, 150)
        enemy.body.velocity.x = Phaser.Math.Between(-50, 50)
      },
      onComplete: () => {
        this.isSpawning = false
        // Visual debug cue
        this.cameras.main.flash(250, 255, 0, 0) // Flash red
      }
    })
  }

  makeColorTransparent (textureKey, color, tolerance = 0.1) {
    const texture = this.textures.get(textureKey)
    if (!texture || texture.key === '__MISSING') {
      return
    }
    const sourceImage = texture.getSourceImage()
    const canvas = Phaser.Display.Canvas.CanvasPool.create(this, sourceImage.width, sourceImage.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(sourceImage, 0, 0)

    const imageData = ctx.getImageData(0, 0, sourceImage.width, sourceImage.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const distance = Math.sqrt(
        Math.pow(r - color.r, 2) +
        Math.pow(g - color.g, 2) +
        Math.pow(b - color.b, 2)
      )

      if (distance < 255 * tolerance) {
        data[i + 3] = 0
      }
    }

    ctx.putImageData(imageData, 0, 0)
    this.textures.remove(textureKey)
    this.textures.addCanvas(textureKey, canvas)
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
