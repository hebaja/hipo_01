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
    private isTutorialActive: boolean = true;
    private tutorialContainer: Phaser.GameObjects.Container | null = null;
    private questionNumberTexts: Phaser.GameObjects.Text[] = [];

    private TOTAL_EXPANSIONS = 5;
    private RADII = [4, 7, 10, 14, 20];

    constructor() {
        super('MapScene');
    }

    create() {
        // Initialize map grid
        this.mapGrid = new MapGrid(this.gridSize, this.gridSize, this.tileSize);
        
        // Generate buildings in zones to guarantee progression
        this.mapGrid.generateStagedBuildings(this.buildingCount, this.TOTAL_EXPANSIONS, this.RADII);

        // Create graphics object for rendering
        this.graphics = this.add.graphics();

        // Create player (starting in the middle)
        const startX = Math.floor(this.gridSize / 2);
        const startY = Math.floor(this.gridSize / 2);
        this.player = new Player(this, this.mapGrid, startX, startY);

        // Initial map reveal
        this.mapGrid.discoveryRadius = this.RADII[0];
        this.mapGrid.updateDiscoveryFromCenter(startX, startY);

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

        // Show tutorial
        this.showTutorial();
    }

    update() {
        if (this.isTutorialActive) return;

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
            this.interactionText.setText('Mova e interaja com os prédios');
        }

        // Update score display
        this.scoreText.setText(`Score: ${this.score} | Conquistado: ${this.mapGrid.getConqueredCount()}/${this.mapGrid.getTotalCount()}`);
    }

    private drawMap() {
        this.graphics.clear();

        // Clear previous question number texts
        this.questionNumberTexts.forEach(text => text.destroy());
        this.questionNumberTexts = [];

        // Draw tiles
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                if (this.mapGrid.isTileDiscovered(x, y)) {
                    this.graphics.lineStyle(1, 0x333333, 0.5);
                    this.graphics.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else {
                    // Draw "fog" for undiscovered tiles
                    this.graphics.fillStyle(0x111111, 0.5);
                    this.graphics.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        // Draw buildings
        this.mapGrid.grid.forEach(building => {
            if (!this.mapGrid.isTileDiscovered(building.x, building.y)) return;

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

            // Add question number indicator
            const numberText = this.add.text(
                building.x * this.tileSize + this.tileSize / 2,
                building.y * this.tileSize + this.tileSize / 2,
                building.questionNumber.toString(),
                {
                    fontSize: '16px',
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    padding: { x: 4, y: 2 }
                }
            );
            numberText.setOrigin(0.5);
            numberText.setDepth(5); // Between background (0) and buildings (10)
            this.questionNumberTexts.push(numberText);
        });
    }

    private startQuiz(building: Building) {
        // Filter questions by category
        const categoryQuestions = quizQuestions.filter(q => q.category === building.category);
        
        if (categoryQuestions.length === 0) {
            console.error(`No questions found for category: ${building.category}`);
            return;
        }

        // Use stored question index (assigned during generation)
        const question = categoryQuestions[building.questionIndex];

        // Launch quiz scene with persistent question
        this.scene.launch('QuizScene', {
            question: question,
            building: building,
            mapScene: this
        });
        
        // Pause this scene
        this.scene.pause();
    }

    public onQuizComplete(success: boolean | null, building: Building) {
        if (success === true) {
            this.mapGrid.conquerBuilding(building);
            
            // Refined Expansion logic: 5 discrete stages
            const totalBuildings = this.mapGrid.getTotalCount();
            const conqueredCount = this.mapGrid.getConqueredCount();
            
            // Determine which stage we are at based on count
            // We want to expand when we reach thresholds: ceil(1*total/5), ceil(2*total/5), etc.
            for (let s = 1; s < this.TOTAL_EXPANSIONS; s++) {
                const threshold = Math.ceil((s) * totalBuildings / this.TOTAL_EXPANSIONS);
                // If we JUST reached the exact threshold, expand
                if (conqueredCount === threshold) {
                    this.mapGrid.discoveryRadius = this.RADII[s];
                    const centerX = Math.floor(this.gridSize / 2);
                    const centerY = Math.floor(this.gridSize / 2);
                    this.mapGrid.updateDiscoveryFromCenter(centerX, centerY);
                    break;
                }
            }
            
            // Final reveal if all conquered
            if (conqueredCount === totalBuildings) {
                this.mapGrid.discoveryRadius = this.RADII[this.TOTAL_EXPANSIONS - 1];
                const centerX = Math.floor(this.gridSize / 2);
                const centerY = Math.floor(this.gridSize / 2);
                this.mapGrid.updateDiscoveryFromCenter(centerX, centerY);
            }

            this.score += 100;
            
            // Redraw map to show conquered building and new area
            this.drawMap();
            
            // Show success message
            const msg = this.add.text(
                this.cameras.main.midPoint.x,
                this.cameras.main.midPoint.y - 100,
                'Prédio conquistado! +100',
                {
                    fontSize: '24px',
                    color: '#00ff00',
                    backgroundColor: '#000000'
                }
            );
            msg.setOrigin(0.5);
            msg.setScrollFactor(0);
            
            this.time.delayedCall(1500, () => msg.destroy());
        } else if (success === false) {
            // Show failure message
            const msg = this.add.text(
                this.cameras.main.midPoint.x,
                this.cameras.main.midPoint.y - 100,
                'Errado! Tente novamente.',
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
        // If success is null, do nothing just resume

        // Resume this scene
        this.scene.resume();
    }

    private showTutorial() {
        const { width, height } = this.cameras.main;

        // Create a container for tutorial elements
        this.tutorialContainer = this.add.container(0, 0);
        this.tutorialContainer.setDepth(2000);
        this.tutorialContainer.setScrollFactor(0);

        // Background overlay
        const bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(0, 0, width, height);
        this.tutorialContainer.add(bg);

        // Tutorial Box
        const boxWidth = 500;
        const boxHeight = 400;
        const box = this.add.graphics();
        box.fillStyle(0x222222, 1);
        box.lineStyle(4, 0xffffff, 1);
        box.fillRoundedRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight, 20);
        box.strokeRoundedRect((width - boxWidth) / 2, (height - boxHeight) / 2, boxWidth, boxHeight, 20);
        this.tutorialContainer.add(box);

        // Title
        const title = this.add.text(width / 2, (height - boxHeight) / 2 + 50, 'Como Jogar', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tutorialContainer.add(title);

        // Instructions
        const instructions = [
            '• Use as setas ou WASD para se mover.',
            '• Explore o mapa para encontrar prédios.',
            '• Chegue perto de um prédio e aperte ESPAÇO.',
            '• Responda corretamente para conquistar o prédio.',
            '• Conquistar prédios revela mais partes do mapa!',
            '',
            'Clique em qualquer lugar para começar!'
        ];

        const content = this.add.text(width / 2, height / 2 + 20, instructions.join('\n'), {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: boxWidth - 60 }
        }).setOrigin(0.5);
        this.tutorialContainer.add(content);

        // Interaction to close tutorial
        this.input.once('pointerdown', () => {
            if (this.tutorialContainer) {
                this.tutorialContainer.destroy();
                this.tutorialContainer = null;
                this.isTutorialActive = false;
            }
        });
    }
}