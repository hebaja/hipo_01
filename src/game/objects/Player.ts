import { Scene, GameObjects } from 'phaser';
import { MapGrid } from '../data/buildings';

export class Player {
    public sprite: GameObjects.Sprite;
    public gridX: number;
    public gridY: number;
    private scene: Scene;
    private tileSize: number;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys: any;
    private facingDirection: string = 'south';
    private isMoving: boolean = false;
    private movePath: { x: number; y: number }[] = [];
    private moveDelay: number = 150;
    private lastMoveTime: number = 0;
    private moveDirection: string | null = null;

    constructor(scene: Scene, mapGrid: MapGrid, startX: number = 10, startY: number = 10) {
        this.scene = scene;
        this.tileSize = mapGrid.tileSize;
        this.gridX = startX;
        this.gridY = startY;

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

        const now = this.scene.time.now;
        let newX = this.gridX;
        let newY = this.gridY;
        let moved = false;
        let currentDirection: string | null = null;

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            currentDirection = 'west';
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            currentDirection = 'east';
        } else if (this.cursors.up.isDown || this.keys.W.isDown) {
            currentDirection = 'north';
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            currentDirection = 'south';
        }

        if (currentDirection) {
            const isNewPress = this.moveDirection === null || currentDirection !== this.moveDirection;
            
            if (isNewPress) {
                this.moveDirection = currentDirection;
                this.lastMoveTime = now - this.moveDelay;
            }

            if (now - this.lastMoveTime >= this.moveDelay) {
                this.lastMoveTime = now;
                moved = true;
                this.facingDirection = currentDirection;

                if (currentDirection === 'west') newX--;
                else if (currentDirection === 'east') newX++;
                else if (currentDirection === 'north') newY--;
                else if (currentDirection === 'south') newY++;
            }
        } else {
            this.moveDirection = null;
        }

        if (moved) {
            this.movePath = [];
        }

        if (!moved && this.movePath.length > 0) {
            const next = this.movePath[0];
            if (mapGrid.isTileDiscovered(next.x, next.y) && mapGrid.isWalkable(next.x, next.y)) {
                if (next.x < this.gridX) this.facingDirection = 'west';
                else if (next.x > this.gridX) this.facingDirection = 'east';
                else if (next.y < this.gridY) this.facingDirection = 'north';
                else if (next.y > this.gridY) this.facingDirection = 'south';

                newX = next.x;
                newY = next.y;
                moved = true;
                this.movePath.shift();
            } else {
                this.movePath = [];
            }
        }

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

    public setPath(path: { x: number; y: number }[]) {
        this.movePath = path;
    }

    public cancelPath() {
        this.movePath = [];
    }

    public isInteracting(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    }
}