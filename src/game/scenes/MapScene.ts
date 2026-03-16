import { Scene } from 'phaser';
import { MapGrid, Building } from '../data/buildings';
import { Player } from '../objects/Player';
import { quizQuestions } from '../data/questions';

export class MapScene extends Scene {
    private mapGrid: MapGrid;
    private player: Player;
    private gridSize: number = 20;
    private tileSize: number = 64;
    private buildingCount: number = 30;
    private graphics: any;
    private interactionText: any;
    private scoreText: any;
    private score: number = 0;

    constructor() {
        super('MapScene');
    }

    create() {
        // Initialize map grid
        this.mapGrid = new MapGrid(this.gridSize, this.gridSize, this.tileSize, this.buildingCount);

        // Create graphics object for rendering
        this.graphics = this.add.graphics();

        // Create player (starting in the middle)
        this.player = new Player(this, this.mapGrid, Math.floor(this.gridSize / 2), Math.floor(this.gridSize / 2));

        // Setup camera
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // Create UI elements
        this.interactionText = this.add.text(10, 10, '', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.interactionText.setScrollFactor(0);
        this.interactionText.setDepth(1000);

        this.scoreText = this.add.text(10, 50, 'Score: 0', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1000);

        // Draw the initial map
        this.drawMap();
    }

    update() {
        // Update player
        this.player.update(this.mapGrid);

        // Check for interaction with nearby buildings
        const playerPos = this.player.getPosition();
        const nearbyBuilding = this.mapGrid.getBuildingAt(playerPos.x, playerPos.y);

        if (nearbyBuilding) {
            this.interactionText.setText(`Press SPACE to conquer ${nearbyBuilding.category}`);
            
            if (this.player.isInteracting() && !nearbyBuilding.conquered) {
                this.startQuiz(nearbyBuilding);
            }
        } else {
            this.interactionText.setText('Move around to find buildings');
        }

        // Update score display
        this.scoreText.setText(`Score: ${this.score} | Conquered: ${this.mapGrid.getConqueredCount()}/${this.mapGrid.getTotalCount()}`);
    }

    private drawMap() {
        this.graphics.clear();

        // Draw empty tiles (grid lines)
        this.graphics.lineStyle(1, 0x333333, 0.5);
        for (let x = 0; x <= this.gridSize; x++) {
            this.graphics.lineBetween(x * this.tileSize, 0, x * this.tileSize, this.gridSize * this.tileSize);
        }
        for (let y = 0; y <= this.gridSize; y++) {
            this.graphics.lineBetween(0, y * this.tileSize, this.gridSize * this.tileSize, y * this.tileSize);
        }

        // Draw buildings
        this.mapGrid.grid.forEach(building => {
            const alpha = building.conquered ? 1 : 0.6;
            this.graphics.fillStyle(building.color, alpha);
            this.graphics.fillRect(
                building.x * this.tileSize + 4,
                building.y * this.tileSize + 4,
                this.tileSize - 8,
                this.tileSize - 8
            );

            // Add border for conquered buildings
            if (building.conquered) {
                this.graphics.lineStyle(3, 0xffffff, 1);
                this.graphics.strokeRect(
                    building.x * this.tileSize + 4,
                    building.y * this.tileSize + 4,
                    this.tileSize - 8,
                    this.tileSize - 8
                );
            }

            // Add category label (small text)
            this.add.text(
                building.x * this.tileSize + this.tileSize / 2,
                building.y * this.tileSize + this.tileSize / 2,
                building.category.substring(0, 3),
                {
                    fontSize: '10px',
                    color: '#ffffff',
                    backgroundColor: '#000000'
                }
            ).setOrigin(0.5);
        });
    }

    private startQuiz(building: Building) {
        // Filter questions by category
        const categoryQuestions = quizQuestions.filter(q => q.category === building.category);
        
        if (categoryQuestions.length === 0) {
            console.error(`No questions found for category: ${building.category}`);
            return;
        }

        // Pick a random question
        const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

        // Launch quiz scene
        this.scene.launch('QuizScene', {
            question: question,
            building: building,
            mapScene: this
        });
        
        // Pause this scene
        this.scene.pause();
    }

    public onQuizComplete(success: boolean, building: Building) {
        if (success) {
            this.mapGrid.conquerBuilding(building);
            this.score += 100;
            
            // Redraw map to show conquered building
            this.drawMap();
            
            // Show success message
            const msg = this.add.text(
                this.cameras.main.midPoint.x,
                this.cameras.main.midPoint.y - 100,
                'Building Conquered! +100',
                {
                    fontSize: '24px',
                    color: '#00ff00',
                    backgroundColor: '#000000'
                }
            );
            msg.setOrigin(0.5);
            msg.setScrollFactor(0);
            
            this.time.delayedCall(1500, () => msg.destroy());
        } else {
            // Show failure message
            const msg = this.add.text(
                this.cameras.main.midPoint.x,
                this.cameras.main.midPoint.y - 100,
                'Failed! Try again.',
                {
                    fontSize: '24px',
                    color: '#ff0000',
                    backgroundColor: '#000000'
                }
            );
            msg.setOrigin(0.5);
            msg.setScrollFactor(0);
            
            this.time.delayedCall(1500, () => msg.destroy());
        }

        // Resume this scene
        this.scene.resume();
    }
}