import { Scene } from 'phaser';
import { MapGrid, Building } from '../data/buildings';
import { Player } from '../objects/Player';
import { quizQuestions } from '../data/questions';
import maleAdventurerPng from '../../assets/sprites/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png';
import maleAdventurerXml from '../../assets/sprites/Male adventurer/Tilesheet/character_maleAdventurer_sheet.xml?url';

// UI Assets
import panelBrownPng from '../../assets/ui/PNG/panel_brown.png';
import buttonLongBeigePng from '../../assets/ui/PNG/buttonLong_beige.png';
import buttonLongBeigePressedPng from '../../assets/ui/PNG/buttonLong_beige_pressed.png';
import iconCrossBrownPng from '../../assets/ui/PNG/iconCross_brown.png';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';

// Board Game Icons Assets
import iconAwardPng from '../../assets/icons/PNG/Default (64px)/award.png';
import iconCrownPng from '../../assets/icons/PNG/Default (64px)/crown_a.png';

// Tilemap Assets
import cityTilesetPng from '../../assets/tilesets/Tilemap/tilemap_packed.png';
import cityMapJson from '../../assets/tilemap/city_map.json?url';

export class MapScene extends Scene {
    private mapGrid: MapGrid;
    private player: Player;
    private gridSize: number = 20;
    private tileSize: number = 64;
    private buildingCount: number = 6;
    private graphics: any;
    private interactionText: any;
    private scoreText: any;
    private score: number = 0;
    private isTutorialActive: boolean = true;
    private tutorialContainer: Phaser.GameObjects.Container | null = null;
    private questionNumberTexts: Phaser.GameObjects.Text[] = [];
    private currentExpansionStage: number = 0;

    //private TOTAL_EXPANSIONS = 6; // 6 stages: Initial + 5 expansions
    private TOTAL_EXPANSIONS = 3; // 3 stages: Initial + 2 expansions
    //private RADII = [2, 4, 6, 8, 11, 15]; // Gradual radii for visiblity on 20x20 grid
    private RADII = [2, 4, 6]; // Gradual radii for visiblity on 20x20 grid

    // Badge system properties
    private badges: Phaser.GameObjects.Image[] = [];
    private badgeCount: number = 0;
    //private readonly TOTAL_BADGES: number = 6; // 5 expansion + 1 special
    private readonly TOTAL_BADGES: number = 3; // 2 expansion + 1 special
    private readonly BADGE_SPACING: number = 34; // Spacing increased (was 28, then 22, then 24)
    //private readonly BADGE_SPACING: number = 20; // Spacing increased (was 28, then 22, then 24)

    constructor() {
        super('MapScene');
    }

    preload() {
        this.load.atlasXML('maleAdventurer', maleAdventurerPng, maleAdventurerXml);

        // Load UI Panel & Buttons
        this.load.image('panel_brown', panelBrownPng);
        this.load.image('buttonLong_beige', buttonLongBeigePng);
        this.load.image('buttonLong_beige_pressed', buttonLongBeigePressedPng);
        this.load.image('iconCross_brown', iconCrossBrownPng);

        // Load Icon Assets
        this.load.image('iconAward', iconAwardPng);
        this.load.image('iconCrown', iconCrownPng);

        // Load Tilemap
        this.load.image('city-tileset', cityTilesetPng);
        this.load.tilemapTiledJSON('city-map', cityMapJson);
    }

    create() {
        // Set custom default cursor
        this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);

        // Initialize map grid
        this.mapGrid = new MapGrid(this.gridSize, this.gridSize, this.tileSize);

        // Generate buildings in zones to guarantee progression
        this.mapGrid.generateStagedBuildings(this.buildingCount, this.TOTAL_EXPANSIONS, this.RADII);

        // Initialize and setup Tilemap
        const map = this.make.tilemap({ key: 'city-map' });
        const tileset = map.addTilesetImage('city-tileset', 'city-tileset', 16, 16, 0, 1);
        if (tileset) {
            const groundLayer = map.createLayer('groundLayer', tileset, 0, 0);
            if (groundLayer) {
                groundLayer.setScale(this.tileSize / 16);
                groundLayer.setDepth(-1); // Ensure it's behind everything
            }
        }

        // Create graphics object for rendering (Fog and Buildings)
        this.graphics = this.add.graphics();
        this.graphics.setDepth(0);

        // Create player (starting in the middle)
        const startX = Math.floor(this.gridSize / 2);
        const startY = Math.floor(this.gridSize / 2);
        this.player = new Player(this, this.mapGrid, startX, startY);

        // Register player animations
        this.anims.create({
            key: 'player-idle',
            frames: [{ key: 'maleAdventurer', frame: 'idle' }],
            frameRate: 10
        });

        this.anims.create({
            key: 'player-walk',
            frames: [
                { key: 'maleAdventurer', frame: 'walk0' },
                { key: 'maleAdventurer', frame: 'walk1' },
                { key: 'maleAdventurer', frame: 'walk2' },
                { key: 'maleAdventurer', frame: 'walk3' },
                { key: 'maleAdventurer', frame: 'walk4' },
                { key: 'maleAdventurer', frame: 'walk5' },
                { key: 'maleAdventurer', frame: 'walk6' },
                { key: 'maleAdventurer', frame: 'walk7' }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.player.sprite.play('player-idle');

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

        // Initialize and draw badges
        this.drawBadges();

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
            this.interactionText.setText(`Pressione ESPAÇO para conquistar: ${nearbyBuilding.category}`);

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

        // Draw tiles (FOG)
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                if (!this.mapGrid.isTileDiscovered(x, y)) {
                    // Draw "fog" for undiscovered tiles
                    this.graphics.fillStyle(0x000000, 0.8);
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

    private drawBadges(): void {
        // Clear existing badge images
        this.badges.forEach((badge: Phaser.GameObjects.Image) => badge.destroy());
        this.badges = [];

        // Calculate positioning at bottom of HUD (left-aligned)
        const hudBottomY = 100; // Below score text (y=50 + 18px font + padding)
        const startX = 20; // Left-aligned with HUD text margin

        // Draw each badge
        for (let i = 0; i < this.TOTAL_BADGES; i++) {
            const x = startX + i * this.BADGE_SPACING;
            const y = hudBottomY;

            // Determine if it's the 6th badge (index 5)
            const isFinalBadge = (i === this.TOTAL_BADGES - 1);
            const texture = isFinalBadge ? 'iconCrown' : 'iconAward';

            const badge = this.add.image(x, y, texture);

            // The icons are 64x64. Scale to 32x32 to fit the HUD nicely.
            badge.setScale(0.5);

            if (i < this.badgeCount) {
                // Earned badge: Normal color, fully opaque
                badge.clearTint();
                badge.setAlpha(1);
            } else {
                // Locked badge: dark gray with transparency
                badge.setTint(0x333333);
                badge.setAlpha(0.4);
            }

            badge.setScrollFactor(0);
            badge.setDepth(1000); // Same depth as other HUD elements
            this.badges.push(badge);
        }
    }

    private startQuiz(building: Building) {
        // Filter questions by category
        const categoryQuestions = quizQuestions.filter(q => q.category === building.category);

        if (categoryQuestions.length === 0) {
            console.error(`Nenhuma questão encontrada para a categoria: ${building.category}`);
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

            // Synchronized Expansion logic: 5 discrete expansions
            const totalBuildings = this.mapGrid.getTotalCount();
            const conqueredCount = this.mapGrid.getConqueredCount();

            // Track which expansion stage we should be at (0 to TOTAL_EXPANSIONS)
            let targetStage = this.currentExpansionStage;
            for (let s = 1; s <= this.TOTAL_EXPANSIONS; s++) {
                const threshold = Math.ceil((s * totalBuildings) / this.TOTAL_EXPANSIONS);
                if (conqueredCount >= threshold) {
                    targetStage = s;
                }
            }

            // Expand if we hit a new stage
            if (targetStage > this.currentExpansionStage) {
                this.currentExpansionStage = targetStage;

                if (this.currentExpansionStage === this.TOTAL_EXPANSIONS) {
                    // Final expansion: Reveal everything
                    this.mapGrid.revealAll();
                } else {
                    // Regular expansion: Increase radius
                    this.mapGrid.discoveryRadius = this.RADII[this.currentExpansionStage];
                    const centerX = Math.floor(this.gridSize / 2);
                    const centerY = Math.floor(this.gridSize / 2);
                    this.mapGrid.updateDiscoveryFromCenter(centerX, centerY);
                }

                // Award expansion badge
                if (this.currentExpansionStage >= 1 && this.currentExpansionStage <= this.TOTAL_EXPANSIONS) {
                    this.badgeCount = Math.max(this.badgeCount, this.currentExpansionStage);
                    this.drawBadges();
                }
            }

            // Award special badge when all buildings conquered
            if (conqueredCount === totalBuildings && this.badgeCount < 3) {
                this.badgeCount = 3; // All badges earned
                this.drawBadges();
            }

            this.score += 100;

            // Redraw map to show conquered building and new area
            this.drawMap();

            // Redraw badges to ensure they're on top
            this.drawBadges();

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

        // Tutorial Box using NineSlice
        const boxWidth = 500;
        const boxHeight = 400;

        // panel_brown.png is typically 100x100 with corners taking roughly 30px
        const box = this.add.nineslice(
            width / 2,
            height / 2,
            'panel_brown',
            0, // frame
            boxWidth,
            boxHeight,
            32, 32, 32, 32 // Left, Right, Top, Bottom margins
        );
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