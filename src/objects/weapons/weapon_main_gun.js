// namespace
var App = App || {};

// Note: Bullets need to be used by a weapon, arcade physics will be applied object instanciated with this clas

App.WeaponMainGun = (function () {
    "use strict";

    var fn = function (game) {
        // call bullet constructor
        App.Weapon.call(this, game);

        // config data
        this.config = {};
        this.config.player = game.cache.getJSON('playerConfig');

        // set our projectile to the main gun projectile
        this.projectileClass = App.ProjectileMainGun;

        // the default amount of projectiles created
        this.projectileCount = this.config.player.main_gun.bullet_pool_count;

        // delay between shots
        this.shotDelay = this.config.player.main_gun.bullet_shot_delay;

        // how fast does a projectile travel in pixles per second
        this.projectileSpeed = this.config.player.main_gun.bullet_speed;

        // offset angle (in degrees) around the orgin Sprite (in case bullet comes out an an undesired angle from the origin sprite)
        this.projectileAngleOffset = this.config.player.main_gun.bullet_angle_offset;
    };

    fn.prototype = Object.create(App.Weapon.prototype);
    fn.prototype.constructor = fn;

    return fn;
})();
