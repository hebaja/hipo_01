import { Scene, GameObjects } from 'phaser';
import { MapGrid } from '../data/buildings';

export class Player {
    public sprite: GameObjects.Sprite;
    public gridX: number;
    public gridY: number;
    private tileSize: number;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys: any;

    constructor(scene: Scene, mapGrid: MapGrid, startX: number = 10, startY: number = 10) {
        this.tileSize = mapGrid.tileSize;
        this.gridX = startX;
        this.gridY = startY;
        this.tileSize = mapGrid.tileSize;

        // Create player sprite
        this.sprite = scene.add.sprite(0, 0, 'maleAdventurer', 'idle');
        
        // The sprite is 96x128. The tile is 64x64. Let's scale it so it fits reasonably.
        // E.g., scale 0.5 makes it 48x64
        this.sprite.setScale(0.5);
        this.sprite.setOrigin(0.5, 0.5); // Center origin
        
        this.sprite.x = this.gridX * this.tileSize + this.tileSize / 2;
        this.sprite.y = this.gridY * this.tileSize + this.tileSize / 2 - 10; // offset slightly up
        this.sprite.setDepth(100); // Ensure player is on top

        // Setup input
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.keys = {
            W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            SPACE: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };
    }

    public update(mapGrid: MapGrid) {
        let moved = false;
        let newX = this.gridX;
        let newY = this.gridY;

        // Check movement
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.keys.A)) {
            newX--;
            moved = true;
            this.sprite.setFlipX(true);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.keys.D)) {
            newX++;
            moved = true;
            this.sprite.setFlipX(false);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            newY--;
            moved = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.keys.S)) {
            newY++;
            moved = true;
        }

        // Bounds checking and discovery checking
        if (newX >= 0 && newX < mapGrid.width && newY >= 0 && newY < mapGrid.height) {
            if (moved && mapGrid.isTileDiscovered(newX, newY)) {
                this.gridX = newX;
                this.gridY = newY;
                this.updatePosition();
            }
        }
    }

    private updatePosition() {
        this.sprite.x = this.gridX * this.tileSize + this.tileSize / 2;
        this.sprite.y = this.gridY * this.tileSize + this.tileSize / 2 - 10;
        
        // Play minimal walk animation step
        this.sprite.play('player-walk', true);
        this.sprite.scene.time.delayedCall(150, () => {
             // Revert to idle after a short moment if we aren't moving continuously
             // Since it's grid-based just-down movement, a short burst of animation looks ok.
             this.sprite.play('player-idle', true);
        });
    }

    public getPosition(): { x: number, y: number } {
        return { x: this.gridX, y: this.gridY };
    }

    public isInteracting(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    }
}