import Projectile from '../../../src/objects/projectile';

let env = require('../../env');
let assets = require('../../assets');
let assert = require('chai').assert;

before(function() {
    return Promise.all([env.game_ready, assets.assets_ready]);
});

// reqs

describe("Projectile", function () {
    let projectile;

    describe("constructor()", function() {
        it("generates an object", function () {
            projectile = new Projectile(game);

            assert.isObject(projectile);
        });
    });
});
