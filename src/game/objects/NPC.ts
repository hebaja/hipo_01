import { Scene, GameObjects } from 'phaser';

export class NPC {
    public sprite: GameObjects.Sprite;
    public balloon: GameObjects.Container;
    public gridX: number;
    public gridY: number;
    public npcName: string;
    public type: string;
    private idleAnimKey: string;
    private isTalking: boolean = false;

    constructor(
        scene: Scene,
        type: string,
        npcName: string,
        gridX: number,
        gridY: number,
        tileSize: number
    ) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;
        this.npcName = npcName;
        this.idleAnimKey = `${type}-idle`;

        const prefix = this.getFramePrefix();
        const pixelX = gridX * tileSize + tileSize / 2;
        const pixelY = gridY * tileSize + tileSize / 2;

        // Create idle animation (frames 1-4) if not already registered
        if (!scene.anims.exists(this.idleAnimKey)) {
            scene.anims.create({
                key: this.idleAnimKey,
                frames: [
                    { key: type, frame: `${prefix}_frame01.png` },
                    { key: type, frame: `${prefix}_frame02.png` },
                    { key: type, frame: `${prefix}_frame03.png` },
                    { key: type, frame: `${prefix}_frame04.png` },
                ],
                frameRate: 6,
                repeat: -1,
            });
        }

        // Create sprite from atlas, start on idle animation
        this.sprite = scene.add.sprite(pixelX, pixelY, type, `${prefix}_frame01.png`);
        this.sprite.setScale(1.5);
        this.sprite.setDepth(15);
        this.sprite.play(this.idleAnimKey);

        // Create speech balloon
        this.balloon = scene.add.container(pixelX, gridY * tileSize - 10);
        const bg = scene.add.image(0, 0, 'panel_beigeLight').setScale(0.25).setAlpha(0.9);
        const dots = scene.add.text(0, -5, '...', {
            fontSize: '24px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.balloon.add([bg, dots]);
        this.balloon.setDepth(20);
        this.balloon.setVisible(false);
    }

    private getFramePrefix(): string {
        switch (this.type) {
            case 'npc1': return 'npc_01';
            case 'npc2': return 'npc_02';
            case 'npc3': return 'npc_3';
            default: return this.type;
        }
    }

    public showIdle() {
        if (this.isTalking) {
            this.isTalking = false;
            this.sprite.play(this.idleAnimKey);
        }
    }

    public showTalk() {
        if (!this.isTalking) {
            this.isTalking = true;
            this.sprite.stop();
            this.sprite.setFrame(`${this.getFramePrefix()}_frame09.png`);
        }
    }

    public showBalloon() {
        this.balloon.setVisible(true);
    }

    public hideBalloon() {
        this.balloon.setVisible(false);
    }

    public setVisible(visible: boolean) {
        this.sprite.setVisible(visible);
    }

    public getPosition(): { x: number; y: number } {
        return { x: this.gridX, y: this.gridY };
    }
}