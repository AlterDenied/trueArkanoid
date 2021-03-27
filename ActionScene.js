class ActionScene extends Phaser.Scene {
    arkanoidBar;
    brick;
    brickRepeatCount = 3;
    cat;
    cursors;
    isLose = false;
    isStarted;
    isWin = false;
    lives = 3;
    rainbowBoss = false;
    rainbowBossHealth = 10;
    score = 0;
    scoreText;

    constructor() {
        super('actionScene');
    }

    preload() {

        this.load.image('sky', 'assets/sky.jpg');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('cat', 'assets/cat.png');
        this.load.image('catDead', 'assets/catDead.png');
        this.load.image('brick', 'assets/brick.png');
        this.load.image('rainbowBoss', 'assets/rainbowBoss.png');

        this.load.audio('popSound', 'assets/popSound.mp3');
        this.load.audio('nyaSound', 'assets/nyaSound.mp3');
        this.load.audio('alertSound', 'assets/alert.mp3');
        this.load.audio('gameoverSound', 'assets/gameover.mp3');
        this.load.audio('victorySound', 'assets/victory.mp3');
        this.load.audio('music', 'assets/music.mp3');
    }


    create() {
        this.add.text(20, 20, 'game!');
        this.add.image(400, 300, 'sky');
        this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, { fontSize: '32px', fill: '#000' });
        this.livesText = this.add.text(600, 16, 'Lives: ' + this.lives, { fontSize: '32px', fill: '#000' });

        this.popSound = this.sound.add('popSound');
        this.nyaSound = this.sound.add('nyaSound');
        this.alertSound = this.sound.add('alertSound');
        this.gameoverSound = this.sound.add('gameoverSound');
        this.victorySound = this.sound.add('victorySound');
        this.music = this.sound.add('music');
        this.music.play();

        this.brick = this.physics.add.staticGroup({
            key: 'brick',
            repeat: this.brickRepeatCount, //повторения т.е. общ. кол-во = repeat + 1 
            setXY: { x: 130, y: 80, stepX: 180 }
        });

        this.arkanoidBar = this.physics.add.sprite(400, 500, 'ground');
        this.arkanoidBar.setCollideWorldBounds(true);
        this.arkanoidBar.setImmovable(true);

        this.cat = this.physics.add.sprite(400, 490, 'cat');
        this.cat.setOffset(0.5);
        this.cat.setBounce(1);
        this.cat.setCollideWorldBounds(true);
        this.cat.setVelocity(0, -330);

        this.physics.add.collider(this.cat, this.arkanoidBar, this.setReflectAngle, null, this); //последний параметр - контекст для коллбэка    
        this.physics.add.collider(this.cat, this.brick, this.crashBricks, null, this); //последний параметр - контекст для коллбэка  
        // this.catStartPosition = Phaser.Math.Between(this.arkanoidBar.body.x, this.arkanoidBar.body.x + this.arkanoidBar.width); для задания угла полёта при старте в 1-й раз
    }


    update() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        //определение положения кота на палке до полёта
        if (!this.isStarted) {
            this.cat.body.x = this.arkanoidBar.body.center.x - this.cat.width / 2;
            this.cat.body.y = this.arkanoidBar.body.y - this.cat.height;
        }

        //нажатие Space при разных условиях
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isStarted) {
            if (this.isWin || this.isLose) {
                this.isWin = false;
                this.isLose = false;
                this.scene.restart();
                this.brickRepeatCount = 3;
                this.rainbowBossHealth = 10;
                this.score = 0;
                this.lives = 3;
                this.rainbowBoss = false;
                this.music.pause();
            } else {
                this.isStarted = true;
            }
        }

        // Условия для движения "палкой"        
        if (this.cursors.left.isDown) {
            this.arkanoidBar.setVelocityX(-400);
        }
        else if (this.cursors.right.isDown) {
            this.arkanoidBar.setVelocityX(400);
        }
        else {
            this.arkanoidBar.setVelocityX(0);
        }

        // Отнимаем жизни у кошки)) ресетим игру        
        if (this.cat.body.position.y > 600) {
            if (this.lives >= 0) {
                this.lives--;
                this.isStarted = false;
                this.livesText.setText("Lives: " + this.lives);
            }
        }

        // Условие для game over
        if (this.cat.body.position.y > 600 && this.lives < 0) {
            this.cat.setTexture('catDead');
            this.loseText = this.add.text(400, 300, "    Game Over\n(SPACE to restart)", { fontSize: '32px', fill: '#000' });
            this.livesText.setText("Lives: 0");
            this.loseText.setOrigin(0.5);
            this.isLose = true;
            this.music.stop();
            this.gameoverSound.play();
        }
        // Условие для победы
        if (this.rainbowBossHealth == 0) {
            this.rainbowBossHealth = -1; //чтобы проверка не зациклилась
            this.cat.setVelocity(0);
            this.winText = this.add.text(400, 300, "Congrats! You win\n(SPACE to restart)", { fontSize: '32px', fill: '#000' });
            this.winText.setOrigin(0.5);
            this.isStarted = false;
            this.isWin = true;
            this.music.stop();
            this.victorySound.play();
        }
    }


    //Ломает блоки при касании и обновляет счёт    
    crashBricks(cat, brick) {
        brick.disableBody(true, true);
        this.brickRepeatCount--;
        this.score += 10;
        this.scoreText.setText("Score " + this.score);
        this.popSound.play();
    }


    //Выставляет угол отскока от палки: влево-вправо, от центра к краям угол острее    
    setReflectAngle(cat, arkanoidBar) {
        this.catX = this.cat.body.center.x;         //х центр кошки 
        this.barX = this.arkanoidBar.body.center.x; //х центр палки
        if (this.catX < this.barX) {
            this.cat.body.setVelocityX((this.catX - this.barX) * 8);      //left
        }
        else if (this.catX > this.barX) {
            this.cat.body.setVelocityX(-(this.barX - this.catX) * 8);     //right
        }
        //Добавлено чтобы босс не появлялся в момент полёта, а только после касания палки        
        if (this.brickRepeatCount < 0 && !this.rainbowBoss) {
            this.addBoss();
        }
    }


    //добавляет босса сразу с колизией для кота
    addBoss() {
        this.rainbowBoss = this.physics.add.staticGroup({
            key: 'rainbowBoss',
            setXY: { x: 400, y: 200 }
        });
        this.alertSound.play();
        this.physics.add.collider(this.cat, this.rainbowBoss, this.bossDying, null, this);
    }


    //Отнимает жизни боссу при касании с котом и уничтожает его при 0    
    bossDying(cat, rainbowBoss) {
        this.rainbowBossHealth--;
        this.nyaSound.play();
        if (this.rainbowBossHealth == 0) {
            rainbowBoss.destroy();
        }
    }
}