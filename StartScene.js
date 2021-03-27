class StartScene extends Phaser.Scene {
    text;
    spaceKey;
    constructor() {
        super('startScene');
    }

    preload () {
        this.load.image("startScreen", "assets/start.gif");
    }

    create () {
        this.startScreen = this.add.image(config.width/2, config.height/2, "startScreen");
        this.text = this.add.text(400, 450, ' Let\'s start\n(Press SPACE)');
        this.text.setOrigin(0.5);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);    
    }

    update () {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.startGameEvent();
        }
    }

    startGameEvent () {
        this.scene.start('actionScene');
    }
}