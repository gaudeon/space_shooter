import 'phaser';
import 'lodash';
import 'webfontloader';

import LoadingScene from './scenes/loading';
import MainMenuScene from './scenes/main_menu';
import PlayMissionScene from './scenes/play_mission';
import MissionResultsScene from './scenes/mission_results';

var gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        }
    }, 
    scene: [LoadingScene, MainMenuScene, PlayMissionScene, MissionResultsScene]
};

let game = new Phaser.Game(gameConfig);