import { Scene, GameObjects } from 'phaser';
import { MapGrid } from '../data/buildings';

export class Player {
    public sprite: GameObjects.Sprite;
    public gridX: number;
    public gridY: number;
    private tileSize: number;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys: any;
    private facingDirection: string = 'south';
    private isMoving: boolean = false;

    constructor(scene: Scene, mapGrid: MapGrid, startX: number = 10, startY: number = 10) {
        this.tileSize = mapGrid.tileSize;
        this.gridX = startX;
        this.gridY = startY;
        this.tileSize = mapGrid.tileSize;

        // Create player sprite from custom spritesheet
        this.sprite = scene.add.sprite(0, 0, 'player', 'idle_south_000');
        
        // The sprite is 56x56. The tile is 64x64. Scale to fit tile nicely.
        this.sprite.setScale(1.5);
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
        if (this.isMoving) return;

        let moved = false;
        let newX = this.gridX;
        let newY = this.gridY;

        // Check movement
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left!) || Phaser.Input.Keyboard.JustDown(this.keys.A)) {
            newX--;
            moved = true;
            this.facingDirection = 'west';
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.keys.D)) {
            newX++;
            moved = true;
            this.facingDirection = 'east';
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up!) || Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            newY--;
            moved = true;
            this.facingDirection = 'north';
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down!) || Phaser.Input.Keyboard.JustDown(this.keys.S)) {
            newY++;
            moved = true;
            this.facingDirection = 'south';
        }

        // Bounds checking and discovery checking
        if (newX >= 0 && newX < mapGrid.width && newY >= 0 && newY < mapGrid.height) {
            if (moved && mapGrid.isTileDiscovered(newX, newY) && mapGrid.isWalkable(newX, newY)) {
                this.gridX = newX;
                this.gridY = newY;
                this.updatePosition();
            }
        }
    }

    private updatePosition() {
        const targetX = this.gridX * this.tileSize + this.tileSize / 2;
        const targetY = this.gridY * this.tileSize + this.tileSize / 2 - 10;

        this.isMoving = true;
        this.sprite.play(`walk-${this.facingDirection}`, true);

        this.sprite.scene.tweens.add({
            targets: this.sprite,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Linear',
            onComplete: () => {
                this.sprite.play(`idle-${this.facingDirection}`, true);
                this.isMoving = false;
            }
        });
    }

    public getPosition(): { x: number, y: number } {
        return { x: this.gridX, y: this.gridY };
    }

    public isInteracting(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    }
}