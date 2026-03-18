import { MapScene } from './scenes/MapScene';
import { QuizScene } from './scenes/QuizScene';
import { AnagramScene } from './scenes/AnagramScene';
import { TwoTruthsOneLieScene } from './scenes/TwoTruthsOneLieScene';
import { WordSearchScene } from './scenes/WordSearchScene';
import { AUTO, Game, Scale,Types } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade'
    },
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        MapScene,
        QuizScene,
        AnagramScene,
        TwoTruthsOneLieScene,
        WordSearchScene
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
