import Ship from '../ship';

export default class Bot extends Ship {
    constructor (sector, x, y, classId) {
        const BOT_ASSET_KEY = 'bot_' + classId;
        let assetConfig = sector.scene.cache.json.get('assetsConfig')[BOT_ASSET_KEY];

        super(sector, x, y, assetConfig.key, assetConfig.frame);

        // config data
        this.config = this.config || {};
        this.config.bots = this.scene.cache.json.get('botsConfig');
        this.config.asset = assetConfig;

        // sprite attributes
        this.setOrigin(this.config.bots[classId].sprite.anchor);
        this.setScale(this.config.bots[classId].sprite.scale);

        // bot attributes
        this.attributes = this.attributes || {};

        // these need to be set for each bot
        this.attributes.bot_class_id = classId;

        // setup bot attributes
        this.addAttribute('health', this.getMaxHealth());
        this.addAttribute('energy', this.getMaxEnergy());
        this.setBounce();

        // audio
        const SHIP_EXPLOSION_SOUND_ASSET_KEY = 'sound_ship_explosion';
        this.audio = {};
        this.audio.shipExplosionSound = this.scene.sound.add(this.config.assets[SHIP_EXPLOSION_SOUND_ASSET_KEY].key);

        // explode on death
        this.events.once('killed', () => {
            this.audio.shipExplosionSound.play();
        });

        this.taxonomy = 'bot';
    }

    getBotClassId () {
        if (typeof this.attributes.bot_class_id === 'undefined') {
            throw new Error('Bot Class Id is not defined');
        }

        return this.attributes.bot_class_id;
    }

    getBotConfig () { return this.config.bots[this.getBotClassId()]; }
    getSpeed () { return this.getBotConfig().speed; }
    getMaxEnergy () { return this.getBotConfig().energy; }
    getEnergyRegenRate () { return this.getBotConfig().energy_regen_rate; }
    getEnergyIsShield () { return this.getBotConfig().energy_is_shield; }
    getMaxHealth () { return this.getBotConfig().health; }
    getHealthRegenRate () { return this.getBotConfig().health_regen_rate; }
    getBounce () { return this.getBotConfig().bounce; }

    // main gun info
    getMainGunBulletType () { return this.getBotConfig().main_gun.bullet_type; }
    getMainGunBulletPoolCount () { return this.getBotConfig().main_gun.bullet_pool_count; }
    getMainGunBulletAngleOffset () { return this.getBotConfig().main_gun.bullet_angle_offset; }
    getMainGunBulletFireRate () { return this.getBotConfig().main_gun.bullet_fire_rate; }
    getMainGunBulletSpeed () { return this.getBotConfig().main_gun.bullet_speed; }
    getMainGunBulletEnergyCost () { return this.getBotConfig().main_gun.bullet_energy_cost; }

    // health
    setHealth (health) {
        this.attributes.health = health;

        // don't exceed maximum
        if (this.attributes.health > this.getMaxHealth()) this.attributes.health = this.getMaxHealth();
    }
    getHealth () { return this.attributes.health; };

    // energy
    setEnergy (energy) {
        this.attributes.energy = energy;

        // don't exceed maximum
        if (this.attributes.energy > this.getMaxEnergy()) this.attributes.health = this.getMaxEnergy();
    }
    getEnergy () { return this.attributes.energy; }

    // taking damage
    takeDamage (amount) {
        let curHealth, curEnergy;
        if (this.getEnergyIsShield()) {
            curEnergy = this.getEnergy();
            curHealth = this.getHealth();

            let remainingAmount = curEnergy < amount ? amount - curEnergy : 0;

            // damage energy shield first then player health
            this.setEnergy(curEnergy - amount + remainingAmount);
            this.setHealth(curHealth - remainingAmount);
        } else {
            curHealth = this.getHealth();
            this.setHealth(curHealth - amount);
        }

        if (this.getHealth() <= 0) {
            this.kill();
        }
    }

    accelerateToPoint (x, y, speed) {
        speed = speed || this.getBotConfig().speed || 0;

        let angle = Math.atan2(y - this.y, x - this.x);
        this.setRotation(angle); 
        this.scene.physics.velocityFromRotation(this.rotation, speed, this.body.acceleration);
    }

    accelerateToObject (dest, speed) {
        if (typeof dest !== 'object') return;

        this.accelerateToPoint(dest.x, dest.y, speed);
    }

    hasLOSWithPlayer () {
        let forwardRay = new Phaser.Geom.Line(this.x, this.y,
            this.x + Math.cos(this.rotation) * 1000, this.y + Math.sin(this.rotation) * 1000);

        let player = this.sector.getPlayer();
        let playerRay = new Phaser.Geom.Line(this.x, this.y, player.x, player.y);

        return Phaser.Math.Fuzzy.Equal(Phaser.Geom.Line.NormalAngle(forwardRay), Phaser.Geom.Line.NormalAngle(playerRay), 0.05);
    }

    // default is enemy test, child bots should overwrite this
    isEnemy (ship) {
        return false;
    }
};
