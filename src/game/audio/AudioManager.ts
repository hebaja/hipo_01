import { Scene } from 'phaser';

export class AudioManager {
    private scene: Scene;
    private volumes: Record<string, number> = {
        footstep: 0.15,
        click: 0.3,
        correct: 0.5,
        wrong: 0.5,
        cardFlip: 0.4,
        conquered: 0.6,
        npcTalk: 0.4,
    };

    constructor(scene: Scene) {
        this.scene = scene;
    }

    play(key: string): void {
        const volume = this.volumes[key] ?? 0.5;
        this.scene.sound.play(key, { volume });
    }

    static preload(scene: Scene): void {
        scene.load.audio('footstep', 'assets/audio/footstep.ogg');
        scene.load.audio('click', 'assets/audio/click.ogg');
        scene.load.audio('correct', 'assets/audio/correct.ogg');
        scene.load.audio('wrong', 'assets/audio/wrong.ogg');
        scene.load.audio('cardFlip', 'assets/audio/cardFlip.ogg');
        scene.load.audio('conquered', 'assets/audio/conquered.ogg');
        scene.load.audio('npcTalk', 'assets/audio/npcTalk.ogg');
    }
}
