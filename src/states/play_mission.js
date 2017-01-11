// namespace
var App = App || {};

App.PlayMissionState = (function () {
    "use strict";

    var fn = function (game) {
        Phaser.State.call(this, game);
    };

    fn.prototype = Object.create(Phaser.State.prototype);
    fn.prototype.constructor = fn;

    fn.prototype.init = function () {
        this.hud = new App.HUD(this.game, this);

        this.sector = {
            name: "Test Sector",
            width: this.game.world.width * 2,
            height: this.game.world.height * 2
        };

        // create a shorter accessor to the player object
        this.player = this.game.global.player;
    };

    fn.prototype.preload = function () {
        // image assets
        this.load.image('space', 'assets/images/spaceBGDarkPurple.png');
        this.load.image('player', this.player.getHullAsset().file);
        this.load.image('enemy1', 'assets/images/enemyShipG.png');
        this.load.image('greenLaser', 'assets/images/LaserGreen.png');
        this.load.image('redLaser', 'assets/images/LaserRed.png');

        // audio assets
        this.game.load.audio('thrust', 'assets/sounds/thrust.wav');

        // hud assets
        this.hud.loadAssets();
    };

    fn.prototype.create = function () {
        // hud
        this.hud.draw();

        // background
        this.background = this.add.tileSprite(0, 0, this.sector.width, this.sector.height, 'space');
        this.game.world.setBounds(0, 0, this.sector.width, this.sector.height);

        // use p2 for ships
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        // setup player ship spite
        this.player.setShipSprite(this.add.sprite(this.game.world.width / 2, this.game.world.height / 2, 'player'));
        this.player_ship = this.player.getShipSprite(); // easier accessor to player ship sprite
        this.player_ship.anchor.setTo(this.player.getHullAsset().anchor);
        this.player_ship.scale.setTo(this.player.getHullAsset().scale);

        this.game.physics.p2.enable(this.player_ship);

        this.enemy1 = this.add.sprite(this.game.world.width / 3, this.game.world.height / 3, 'enemy1');
        this.enemy1.anchor.setTo(0.5);
        this.enemy1.scale.setTo(-0.5);
        this.enemy1.follow = 0;
        this.enemy1.followx = this.game.world.randomX;
        this.enemy1.followy = this.game.world.randomY;

        this.game.physics.p2.enable(this.enemy1);

        this.cursors = game.input.keyboard.createCursorKeys();

        //  Notice that the sprite doesn't have any momentum at all,
        //  it's all just set by the camera follow type.
        //  0.1 is the amount of linear interpolation to use.
        //  The smaller the value, the smooth the camera (and the longer it takes to catch up)
        game.camera.follow(this.player_ship, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);

        // Audio
        this.thrust_sound = this.game.add.audio('thrust');
        // I an't figure out how to get onDown and onUp working
        // so just using this flag for now. -- HookBot
        this.thrusting = false;
    };

    fn.prototype.update = function () {
        if (this.cursors.up.isDown) {
            this.player_ship.body.thrust(this.player.getHullThrust());
            if (!this.thrusting) {
                // XXX: Is there any way to force a loop?
                this.thrust_sound.play();
                this.thrusting = true;
            }
        }
        else if (this.cursors.up.isUp) {
            if (this.thrusting) {
                this.thrust_sound.stop();
                this.thrusting = false;
            }
        }

        if (this.cursors.down.isDown) {
            this.player_ship.body.reverse(this.player.getHullThrust());
            if (!this.thrusting) {
                // XXX: Is there any way to force a loop?
                this.thrust_sound.play();
                this.thrusting = true;
            }
        }
        else if (this.cursors.down.isUp) {
            if (this.thrusting) {
                this.thrust_sound.stop();
                this.thrusting = false;
            }
        }

        if (this.cursors.left.isDown) {
            this.player_ship.body.rotateLeft(this.player.getHullRotation());
        }
        else if (this.cursors.right.isDown) {
            this.player_ship.body.rotateRight(this.player.getHullRotation());
        }
        else {
            this.player_ship.body.setZeroRotation();
        }

        if (Math.abs(this.player_ship.body.x - this.enemy1.body.x) < 200 && Math.abs(this.player_ship.body.y - this.enemy1.body.y) < 200) {
            this.enemy1.follow = 1;
        }
        else if (Math.abs(this.player_ship.body.x - this.enemy1.body.x) > 450 && Math.abs(this.player_ship.body.y - this.enemy1.body.y) > 450) {
            this.enemy1.follow = 0;
            this.enemy1.followx = this.game.world.randomX;
            this.enemy1.followy = this.game.world.randomX;
        }

        if (this.enemy1.follow == 1) {
            this.accelerateToObject(this.enemy1,this.player_ship,60);  //start accelerateToObject on every bullet
        } else if (this.enemy1.follow == 0) {
            if (Math.abs(this.enemy1.followx - this.enemy1.x) < 75 && Math.abs(this.enemy1.followy - this.enemy1.y) < 75) {
                this.enemy1.followx = (((Math.random() * (.8 - .2) + .2) * this.game.world.width) + this.enemy1.x) % this.game.world.width;
                this.enemy1.followy = (((Math.random() * (.8 - .2) + .2) * this.game.world.height) + this.enemy1.y) % this.game.world.height;
            }
            this.accelerateToObject(this.enemy1,undefined,45);  //start accelerateToObject on every bullet
        }
    }

    fn.prototype.accelerateToObject = function(obj1, obj2, speed) {
        var x;
        var y;
        if (typeof obj2 === 'undefined') {
            x = obj1.followx;
            y = obj1.followy;
        } else {
            x = obj2.x;
            y = obj2.y;
        }
        if (typeof speed === 'undefined') { speed = 60; }
        var angle = Math.atan2(y - obj1.y, x - obj1.x);
        obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry bullets (depends on the sprite used)
        obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject
        obj1.body.force.y = Math.sin(angle) * speed;
    }

    return fn;
})();
