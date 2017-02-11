// namespace
var App = App || {};

App.Sector = (function () {
    "use strict";

    var fn = function (game, key) {
        this.game = game;
        this.key  = key;

        // config data
        this.config          = this.config          || {};
        this.config.assets   = this.config.assets   || game.cache.getJSON('assetsConfig');
        this.config.sectors  = this.config.sectors  || game.cache.getJSON('sectorsConfig');

    };

    fn.prototype.sectorConfig          = function () { return this.config.sectors[this.key]; };
    fn.prototype.tilemapAssetConfig    = function () { return this.config.assets.tilemaps[this.sectorConfig().tilemap]; };
    fn.prototype.tilesetList           = function () { return this.sectorConfig().tilesets; };
    fn.prototype.tilesetAssetConfig    = function (key) { return this.config.assets.tilesets[key]; };
    fn.prototype.backgroundAssetConfig = function () { return this.config.assets.backgrounds[this.sectorConfig().background]; };

    fn.prototype.loadAssets = function () {
        var tilesets = this.sectorConfig().tilesets;
        _.each(this.tilesetList(), (function (tileset) {
            var config = this.tilesetAssetConfig(tileset);
            this.game.load.image(config.key, config.file);
       }).bind(this));

       var tilemap = this.tilemapAssetConfig();
       this.game.load.tilemap(tilemap.key, tilemap.file, null, Phaser.Tilemap.TILED_JSON);

       if (this.sectorConfig().background) {
           var bg_asset = this.backgroundAssetConfig();
           this.game.load.image(bg_asset.key, bg_asset.file);
       }
    };

    fn.prototype.setupSector = function () {
        // init map
        this.map = this.game.add.tilemap(this.tilemapAssetConfig().key);

        // add tileset images
        _.each(this.tilesetList(), (function (tileset) {
            var config = this.tilesetAssetConfig(tileset);
            this.map.addTilesetImage(tileset, config.key);
        }).bind(this));

        // setup tile layers
        this.layers = {};

        _.each(this.sectorConfig().layers, (function (layer) {
           this.layers[layer.name] = this.map.createLayer(layer.name);

           if (layer.hasCollisions) {
               this.map.setCollisionBetween(layer.firstCollisionTileId, layer.lastCollisionTileId, true, layer.name);
           }
        }).bind(this));

        // TODO: setup  object layers

        // resize world to match the first layer (considered the base layer)
        this.layers[this.sectorConfig().layers[0].name].resizeWorld();

        // apply background
        if (this.sectorConfig().background) {
            this.background = this.game.add.tileSprite(0, 0, this.widthInPixels(), this.heightInPixels(), this.backgroundAssetConfig().key);

            this.game.world.sendToBack(this.background);
        }
    };

    fn.prototype.widthInPixels  = function () { return this.map.widthInPixels; };
    fn.prototype.heightInPixels = function () { return this.map.heightInPixels; };

    fn.prototype.widthInTiles  = function () { return this.map.width; };
    fn.prototype.heightInTiles = function () { return this.map.height; };

    fn.prototype.tileWidth  = function () { return this.map.tileWidth; };
    fn.prototype.tileHeight = function () { return this.map.tileHeight; };

    return fn;
})();
