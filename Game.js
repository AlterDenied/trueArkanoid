let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            checkCollision: {down: false},
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [StartScene, ActionScene]
};

let game = new Phaser.Game(config);