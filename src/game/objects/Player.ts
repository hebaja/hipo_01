import { Scene, GameObjects } from 'phaser';
import { MapGrid } from '../data/buildings';

export class Player {
    public sprite: GameObjects.Graphics;
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

        // Create player sprite (simple circle)
        this.sprite = scene.add.graphics();
        this.sprite.fillStyle(0xffffff, 1);
        this.sprite.fillCircle(0, 0, this.tileSize / 3);
        this.sprite.x = this.gridX * this.tileSize + this.tileSize / 2;
        this.sprite.y = this.gridY * this.tileSize + this.tileSize / 2;
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
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right!) || Phaser.Input.Keyboard.JustDown(this.keys.D)) {
            newX++;
            moved = true;
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
        this.sprite.y = this.gridY * this.tileSize + this.tileSize / 2;
    }

    public getPosition(): { x: number, y: number } {
        return { x: this.gridX, y: this.gridY };
    }

    public isInteracting(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    }
}