import Phaser from 'phaser';
import bg1 from './assets/background1.png';
import bg2 from './assets/background2.png';
import bg3 from './assets/background3.png';
import bg4 from './assets/background4.png';
import bg5 from './assets/background5.png';
import playerImg from './assets/player.png';
import enemy1 from './assets/enemy1.png';
import enemy2 from './assets/enemy2.png';
import enemy3 from './assets/enemy3.png';
import enemy4 from './assets/enemy4.png';
import enemy5 from './assets/enemy5.png';
import enemy6 from './assets/enemy6.png';
import enemy7 from './assets/enemy7.png';
import enemy8 from './assets/enemy8.png';
import enemy9 from './assets/enemy9.png';
import enemy10 from './assets/enemy10.png';
import enemy11 from './assets/enemy11.png';
import enemy12 from './assets/enemy12.png';
import enemy13 from './assets/enemy13.png';
import enemy14 from './assets/enemy14.png';
import enemy15 from './assets/enemy15.png';
import enemy16 from './assets/enemy16.png';
import enemy17 from './assets/enemy17.png';
import enemy18 from './assets/enemy18.png';
import enemy19 from './assets/enemy19.png';
import enemy20 from './assets/enemy20.png';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.cursors = null;
        this.bullets = null;
        this.enemies = null;
        this.enemyBullets = null;
        this.background = null;
        this.score = 0;
        this.scoreText = null;
        this.wave = 1;
        this.waveText = null;
        this.gameOver = false;
    }

    preload() {
        // Load backgrounds
        this.load.image('background1', bg1);
        this.load.image('background2', bg2);
        this.load.image('background3', bg3);
        this.load.image('background4', bg4);
        this.load.image('background5', bg5);
        // Load player
        this.load.image('player', playerImg);
        // Load enemies
        for (let i = 1; i <= 20; i++) {
            this.load.image(`enemy${i}`, eval(`enemy${i}`));
        }
    }

    create() {
        // Create a scrolling background
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background1');

        // Player
        this.player = this.physics.add.sprite(400, 550, 'player').setScale(0.08);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(600, 800, true);

        // Cursors
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', this.fireBullet, this);

        // Bullets
        this.bullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        // Enemies
        this.enemies = this.physics.add.group();

        // Enemy Bullets
        this.enemyBullets = this.physics.add.group({
            classType: Bullet,
            runChildUpdate: true
        });

        // Collisions
        this.physics.add.collider(this.player, this.enemies, this.playerHit, null, this);
        this.physics.add.collider(this.player, this.enemyBullets, this.playerHit, null, this);
        this.physics.add.collider(this.bullets, this.enemies, this.enemyHit, null, this);

        // Score and Wave Text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
        this.waveText = this.add.text(550, 16, 'Wave: 1', { fontSize: '32px', fill: '#FFF' });

        // Start first wave
        this.startWave();
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Scroll background
        this.background.tilePositionY -= 2;

        // Player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-300);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(300);
        } else {
            this.player.setVelocityX(0);
        }

        // Enemy firing
        this.enemies.children.each(enemy => {
            if (enemy.active && Phaser.Math.Between(0, 100) > 98) {
                this.fireEnemyBullet(enemy.x, enemy.y);
            }
        });

        // Check for next wave
        if (this.enemies.countActive(true) === 0) {
            this.wave++;
            this.waveText.setText('Wave: ' + this.wave);
            this.startWave();
        }
    }

    fireBullet() {
        const bullet = this.bullets.get();
        if (bullet) {
            bullet.fire(this.player.x, this.player.y - 20, 0, -500);
        }
    }

    fireEnemyBullet(x, y) {
        const bullet = this.enemyBullets.get();
        if (bullet) {
            bullet.fire(x, y + 20, 0, 200);
        }
    }

    playerHit(player, hitable) {
        hitable.destroy();
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.gameOver = true;
        this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#FFF' }).setOrigin(0.5);
    }

    enemyHit(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
    }

    startWave() {
        if (this.gameOver) return;
        for (let i = 0; i < this.wave * 5; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(-600, -50);
            const enemyKey = `enemy${Phaser.Math.Between(1, 20)}`;
            const enemy = this.enemies.create(x, y, enemyKey);
            enemy.setScale(0.08);
            enemy.body.setSize(600, 800, true);
            enemy.body.velocity.y = 100;
        }
    }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, vx, vy) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.body.velocity.x = vx;
        this.body.velocity.y = vy;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.y <= 0 || this.y >= 600) {
            this.setActive(false);
            this.setVisible(false);
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
};

// Create a simple white texture for the bullets
function createBulletTexture(game) {
    const graphics = game.scene.getScene('GameScene').add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 2, 10);
    graphics.generateTexture('bullet', 2, 10);
    graphics.destroy();
}

const game = new Phaser.Game(config);
game.events.on('ready', () => {
    createBulletTexture(game);
});