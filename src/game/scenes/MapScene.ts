import { Scene } from 'phaser';
import { MapGrid, Building, NPC } from '../data/buildings';
import { Player } from '../objects/Player';
import { NPC as NPCObject } from '../objects/NPC';
import { AudioManager } from '../audio/AudioManager';
import { quizQuestions } from '../data/questions';
import { getAnagramForCategory } from '../data/anagrams';
import { PAINTER_FACTS } from '../data/twoTruthsOneLie';
import { memoryGameData } from '../data/memoryGame';
import maleAdventurerPng from '../../assets/sprites/Male adventurer/Tilesheet/character_maleAdventurer_sheet.png';
import maleAdventurerXml from '../../assets/sprites/Male adventurer/Tilesheet/character_maleAdventurer_sheet.xml?url';

import npc1Png from '../../assets/sprites/npc1.png';
import npc1Json from '../../assets/sprites/npc1.json?url';
import npc2Png from '../../assets/sprites/npc2.png';
import npc2Json from '../../assets/sprites/npc2.json?url';
import npc3Png from '../../assets/sprites/npc3.png';
import npc3Json from '../../assets/sprites/npc3.json?url';

// Player Spritesheet Assets
import playerSpritesheetPng from '../../assets/sprites/player_spritesheet.png';
import playerSpritesheetJson from '../../assets/sprites/player_spritesheet.json?url';

// UI Assets
import panelBeigeLightPng from '../../assets/ui/PNG/panel_beigeLight.png';
import panelBrownPng from '../../assets/ui/PNG/panel_brown.png';
import buttonLongBeigePng from '../../assets/ui/PNG/buttonLong_beige.png';
import buttonLongBeigePressedPng from '../../assets/ui/PNG/buttonLong_beige_pressed.png';
import buttonSquareBeigePng from '../../assets/ui/PNG/buttonSquare_beige.png';
import buttonSquareBeigePressedPng from '../../assets/ui/PNG/buttonSquare_beige_pressed.png';
import iconCrossBrownPng from '../../assets/ui/PNG/iconCross_brown.png';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';

// Board Game Icons Assets
import iconAwardPng from '../../assets/icons/PNG/Default (64px)/award.png';
import iconCrownPng from '../../assets/icons/PNG/Default (64px)/crown_a.png';

// Tilemap Assets
import cityTilesetPng from '../../assets/map/spritesheet.png';
import cityMapJson from '../../assets/map/map.json?url';

export class MapScene extends Scene {
    private mapGrid: MapGrid;
    private player: Player;
    private gridSize: number = 20;
    private tileSize: number = 64;
    private graphics: any;
    private interactionText: any;
    private scoreText: any;
    private score: number = 0;
    private questionNumberTexts: Phaser.GameObjects.Text[] = [];
    private currentExpansionStage: number = 0;
    private buildingsLayer: Phaser.Tilemaps.TilemapLayer | null = null;
    private npcObjects: Map<string, NPCObject> = new Map();

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
        this.load.atlas('npc1', npc1Png, npc1Json);
        this.load.atlas('npc2', npc2Png, npc2Json);
        this.load.atlas('npc3', npc3Png, npc3Json);

        // Load player spritesheet (contains both idle and walk frames)
        this.load.atlas('player', playerSpritesheetPng, playerSpritesheetJson);

        // Load UI Panel & Buttons
        this.load.image('panel_brown', panelBrownPng);
        this.load.image('panel_beigeLight', panelBeigeLightPng);
        this.load.image('buttonLong_beige', buttonLongBeigePng);
        this.load.image('buttonLong_beige_pressed', buttonLongBeigePressedPng);
        this.load.image('buttonSquare_beige', buttonSquareBeigePng);
        this.load.image('buttonSquare_beige_pressed', buttonSquareBeigePressedPng);
        this.load.image('iconCross_brown', iconCrossBrownPng);

        // Load Icon Assets
        this.load.image('iconAward', iconAwardPng);
        this.load.image('iconCrown', iconCrownPng);

        // Load Tilemap
        this.load.image('city-tileset', cityTilesetPng);
        this.load.tilemapTiledJSON('city-map', cityMapJson);

        // Load Custom Fonts
        this.load.font('kenneyPixel', 'assets/fonts/Kenney Pixel.ttf');
        this.load.font('kenneyPixelSquare', 'assets/fonts/Kenney Pixel Square.ttf');

        // Load Audio
        AudioManager.preload(this);
    }

    create() {
        // Set custom default cursor
        this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);

        // Initialize map grid
        this.mapGrid = new MapGrid(this.gridSize, this.gridSize, this.tileSize);

        // Generate buildings and NPCs in zones to guarantee progression
        // this.mapGrid.generateStagedBuildings(this.buildingCount, this.TOTAL_EXPANSIONS, this.RADII);
        // this.mapGrid.generateNPCs(this.TOTAL_EXPANSIONS, this.RADII);

        // Initialize and setup Tilemap
        const map = this.make.tilemap({ key: 'city-map' });
        // The name 'spritefusion' matches the tileset name in map.json
        const tileset = map.addTilesetImage('spritefusion', 'city-tileset', 16, 16, 0, 0);
        
        if (tileset) {
            // Create all layers in correct order
            const layers = ['grass', 'surrounding walls', 'woods', 'objects', 'buildings', 'roof'];
            layers.forEach((layerName, index) => {
                const layer = map.createLayer(layerName, tileset, 0, 0);
                if (layer) {
                    layer.setScale(this.tileSize / 16);
                    // Depth: grass at bottom (-10), others up to (-5)
                    layer.setDepth(-10 + index);
                    
                    // Store reference to buildings layer for tinting
                    if (layerName === 'buildings') {
                        this.buildingsLayer = layer;
                    }
                }
            });
        }

        // Initialize map grid with tilemap data and radii for stage calculation
        const mapData = this.cache.tilemap.get('city-map').data;
        this.mapGrid.loadFromTilemap(mapData, this.RADII);
        
        // Generate NPCs in valid open spots
        this.mapGrid.generateNPCs(this.TOTAL_EXPANSIONS, this.RADII);

        // Create graphics object for rendering (Fog and Buildings)
        this.graphics = this.add.graphics();
        this.graphics.setDepth(0); // Fog covers all map layers (-10 to -5) but is below Player (100)

        // Create player (starting in the middle)
        const startX = Math.floor(this.gridSize / 2);
        const startY = Math.floor(this.gridSize / 2);
        this.player = new Player(this, this.mapGrid, startX, startY);

        // Register player directional animations
        const directions = ['east', 'north', 'south', 'west'] as const;
        directions.forEach(dir => {
            this.anims.create({
                key: `idle-${dir}`,
                frames: [
                    { key: 'player', frame: `idle_${dir}_000` },
                    { key: 'player', frame: `idle_${dir}_001` },
                    { key: 'player', frame: `idle_${dir}_002` },
                    { key: 'player', frame: `idle_${dir}_003` },
                ],
                frameRate: 3,
                repeat: -1
            });
            this.anims.create({
                key: `walk-${dir}`,
                frames: [
                    { key: 'player', frame: `walk_${dir}_000` },
                    { key: 'player', frame: `walk_${dir}_001` },
                    { key: 'player', frame: `walk_${dir}_002` },
                    { key: 'player', frame: `walk_${dir}_003` },
                    { key: 'player', frame: `walk_${dir}_004` },
                    { key: 'player', frame: `walk_${dir}_005` },
                ],
                frameRate: 8,
                repeat: -1
            });
        });

        this.player.sprite.play('idle-south');

        // Initial map reveal (starting at 10, 10 for the 20x20 map)
        this.mapGrid.discoveryRadius = this.RADII[0];
        this.mapGrid.updateDiscoveryFromCenter(startX, startY);

        // Setup camera
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);



        // Create UI elements
        this.interactionText = this.add.text(10, 10, '', {
            fontFamily: 'Kenney Pixel',
            fontSize: '18px',
            color: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });
        this.interactionText.setScrollFactor(0);
        this.interactionText.setDepth(1000);

        this.scoreText = this.add.text(10, 50, 'Score: 0', {
            fontFamily: 'Kenney Pixel',
            fontSize: '18px',
            color: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1000);

        // Draw the initial map
        this.drawMap();

        // Initialize and draw badges
        this.drawBadges();

        // Register interaction key for NPC (in addition to buildings)
        // Note: player.isInteracting already handles Space

        // Click-to-move handler
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Convert click world position to grid coordinates
            const gridX = Math.floor(pointer.worldX / this.tileSize);
            const gridY = Math.floor(pointer.worldY / this.tileSize);

            // Ignore clicks on current player position
            const playerPos = this.player.getPosition();
            if (gridX === playerPos.x && gridY === playerPos.y) return;

            // Ignore clicks on blocked/undiscovered tiles
            if (!this.mapGrid.isTileDiscovered(gridX, gridY)) return;
            if (!this.mapGrid.isWalkable(gridX, gridY)) return;

            // Find path and set it
            const path = this.findPath(playerPos.x, playerPos.y, gridX, gridY);
            if (path.length > 0) {
                this.player.setPath(path);
            }
        });
    }

    update() {
        // Update player
        this.player.update(this.mapGrid);

        // Check for interaction with nearby buildings or NPCs
        const playerPos = this.player.getPosition();
        const nearbyBuilding = this.mapGrid.getBuildingAt(playerPos.x, playerPos.y);
        const nearbyNPC = this.mapGrid.npcs.find(npc => npc.x === playerPos.x && npc.y === playerPos.y);

        if (nearbyBuilding) {
            this.interactionText.setText(`Pressione ESPAÇO para conquistar: ${nearbyBuilding.category}`);

            if (this.player.isInteracting() && !nearbyBuilding.conquered) {
                this.startQuiz(nearbyBuilding);
            }
        } else if (nearbyNPC) {
            this.interactionText.setText(`Pressione ESPAÇO para falar com: ${nearbyNPC.name}`);

            if (this.player.isInteracting()) {
                this.sound.play('npcTalk', { volume: 0.4 });
                this.showNPCHint(nearbyNPC);
            }
        } else {
            this.interactionText.setText('Mova e interaja com os prédios');
        }

        // Update NPC Balloons and animations
        this.mapGrid.npcs.forEach(npc => {
            const npcObj = this.npcObjects.get(npc.name);
            if (!npcObj) return;

            const dist = Phaser.Math.Distance.Between(playerPos.x, playerPos.y, npc.x, npc.y);

            // Show balloon and play talk anim if close, otherwise idle
            // Also ensure the NPC is discovered first
            const isDiscovered = this.mapGrid.isTileDiscovered(npc.x, npc.y);
            if (dist <= 3 && isDiscovered) {
                if (!npcObj.balloon.visible) {
                    npcObj.showBalloon();
                    npcObj.showTalk();
                    // Floating effect for balloon
                    this.tweens.add({
                        targets: npcObj.balloon,
                        y: npc.y * this.tileSize - 20,
                        duration: 600,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            } else {
                npcObj.hideBalloon();
                npcObj.showIdle();
                this.tweens.killTweensOf(npcObj.balloon);
                npcObj.balloon.y = npc.y * this.tileSize - 10;
            }
        });

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

        // Update building tints
        this.mapGrid.grid.forEach(building => {
            if (!this.mapGrid.isTileDiscovered(building.x, building.y)) return;

            // Apply tint to building tile instead of drawing a rectangle
            if (this.buildingsLayer) {
                const tile = this.buildingsLayer.getTileAt(building.x, building.y);
                if (tile) {
                    if (building.conquered) {
                        tile.tint = 0x888888; // Gray out conquered buildings
                        
                        // Add a white outline for conquered buildings
                        this.graphics.lineStyle(2, 0xffffff, 1);
                        this.graphics.strokeRect(
                            building.x * this.tileSize + 2,
                            building.y * this.tileSize + 2,
                            this.tileSize - 4,
                            this.tileSize - 4
                        );
                    } else {
                        tile.tint = 0xffffff; // Normal color for active buildings
                    }
                }
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

        // Update/Create NPC Objects
        this.mapGrid.npcs.forEach(npc => {
            const isDiscovered = this.mapGrid.isTileDiscovered(npc.x, npc.y);

            let npcObj = this.npcObjects.get(npc.name);

            if (!npcObj) {
                // Create new NPC object
                npcObj = new NPCObject(this, npc.type, npc.name, npc.x, npc.y, this.tileSize);
                this.npcObjects.set(npc.name, npcObj);
            }

            // Sync visibility with discovery
            npcObj.setVisible(isDiscovered);
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
        // Use the building's persistent challenge type
        if (building.challengeType === 'anagram') {
            // Launch anagram scene
            this.scene.launch('AnagramScene', {
                building: building,
                mapScene: this
            });
        } else if (building.challengeType === 'twoTruthsOneLie') {
            // Launch Two Truths and a Lie scene
            this.scene.launch('TwoTruthsOneLieScene', {
                building: building,
                mapScene: this
            });
        } else if (building.challengeType === 'wordSearch') {
            // Launch Word Search scene
            this.scene.launch('WordSearchScene', {
                building: building,
                mapScene: this
            });
        } else if (building.challengeType === 'memoryGame') {
            // Launch Memory Game scene
            this.scene.launch('MemoryGameScene', {
                building: building,
                mapScene: this
            });
        } else {
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
        }
        
        // Pause this scene
        this.scene.pause();
    }

    public onQuizComplete(success: boolean | null, building: Building) {
        if (success === true) {
            this.mapGrid.conquerBuilding(building);
            this.sound.play('conquered', { volume: 0.6 });

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
                    fontFamily: 'Kenney Pixel',
                    fontSize: '24px',
                    color: '#00ff00',
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
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
                    fontFamily: 'Kenney Pixel',
                    fontSize: '24px',
                    color: '#ff0000',
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
                }
            );
            msg.setOrigin(0.5);
            msg.setScrollFactor(0);

            this.time.delayedCall(1500, () => msg.destroy());

            // Track this as the most recently failed building globally and per-stage
            this.mapGrid.lastFailedBuilding = building;
            this.mapGrid.lastFailedBuildingByStage[building.stage] = building;
            console.log(`[HINT] Wrong answer recorded: ${building.category} at stage ${building.stage} (${building.x}, ${building.y})`);
        }
        // If success is null, do nothing just resume

        // Resume this scene
        this.scene.resume();
    }

    private showNPCHint(npc: NPC) {
        // Find the best building to give a hint for
        let buildingWithError: Building | null = null;

        // Find buildings in this NPC's stage that have wrong attempts
        const npcStage = npc.stage;
        console.log(`[NPC HINT] NPC: ${npc.name} (stage ${npcStage})`);

        // Find all buildings and their stages
        console.log(`[NPC HINT] All buildings with stages:`);
        this.mapGrid.grid.forEach(b => {
            console.log(`  - ${b.category}: stage=${b.stage}, wrongAttempts=${b.wrongAttempts}, conquered=${b.conquered}`);
        });

        // Find buildings in this NPC's stage
        const stageBuildings = this.mapGrid.grid.filter(b => b.stage === npcStage);
        console.log(`[NPC HINT] Buildings in stage ${npcStage}: ${stageBuildings.length}`);

        // Find a building with wrong attempts in this stage
        buildingWithError = stageBuildings.find(b => b.wrongAttempts > 0 && !b.conquered) || null;

        // If no building found in this stage, find any building with errors
        if (!buildingWithError) {
            buildingWithError = this.mapGrid.grid.find(b => b.wrongAttempts > 0 && !b.conquered) || null;
        }

        let message = '';
        console.log(`[NPC HINT] Final buildingWithError: ${buildingWithError ? buildingWithError.category : 'null'}`);
        if (buildingWithError) {
            if (buildingWithError.challengeType === 'anagram') {
                const anagram = getAnagramForCategory(buildingWithError.category);
                const hint = anagram.hints[buildingWithError.lastHintIndex % anagram.hints.length];
                buildingWithError.lastHintIndex++;
                message = `${npc.name}: Percebi que você teve dificuldade em ${buildingWithError.category}.\n\nDica: ${hint}`;
            } else if (buildingWithError.challengeType === 'twoTruthsOneLie') {
                const painter = PAINTER_FACTS[buildingWithError.painterIndex];
                const hint = painter.hints[buildingWithError.lastHintIndex % painter.hints.length];
                buildingWithError.lastHintIndex++;
                message = `${npc.name}: Percebi que você teve dificuldade em ${buildingWithError.category}.\n\nDica: ${hint}`;
            } else if (buildingWithError.challengeType === 'wordSearch') {
                const unfoundWords = buildingWithError.wordPositions.filter(
                    wp => !buildingWithError.foundWords.includes(wp.word)
                );
                if (unfoundWords.length > 0) {
                    const wp = unfoundWords[buildingWithError.lastHintIndex % unfoundWords.length];
                    buildingWithError.lastHintIndex++;
                    const direction = (wp.dx !== 0) ? 'horizontal' : 'vertical';
                    message = `${npc.name}: Percebi que você teve dificuldade em ${buildingWithError.category}.\n\nDica: A palavra ${wp.word} está na ${direction}.`;
                } else {
                    message = `${npc.name}: Você está indo muito bem nesta área!\nContinue explorando as redondezas.`;
                }
            } else if (buildingWithError.challengeType === 'memoryGame') {
                const gameData = memoryGameData[buildingWithError.category];
                const hint = gameData.hints[buildingWithError.lastHintIndex % gameData.hints.length];
                buildingWithError.lastHintIndex++;
                message = `${npc.name}: Percebi que você teve dificuldade em ${buildingWithError.category}.\n\nDica: ${hint}`;
            } else {
                const categoryQuestions = quizQuestions.filter(q => q.category === buildingWithError.category);
                const question = categoryQuestions[buildingWithError.questionIndex];

                // Get the current hint from the 5-hint sequence and increment
                const hint = question.hints[buildingWithError.lastHintIndex % 5];
                buildingWithError.lastHintIndex++;

                message = `${npc.name}: Percebi que você teve dificuldade em ${buildingWithError.category}.\n\nDica: ${hint}`;
            }
        } else {
            message = `${npc.name}: Você está indo muito bem nesta área!\nContinue explorando as redondezas.`;
        }

        // Show hint dialog
        const hintBox = this.add.container(
            this.cameras.main.midPoint.x,
            this.cameras.main.midPoint.y - 120
        ).setScrollFactor(0).setDepth(2000);

        const text = this.add.text(0, 0, message, {
            fontFamily: 'Kenney Pixel',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 15, y: 10 },
            wordWrap: { width: 350 },
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);

        hintBox.add(text);

        // Simple animation
        hintBox.setAlpha(0);
        this.tweens.add({
            targets: hintBox,
            alpha: 1,
            y: this.cameras.main.midPoint.y - 150,
            duration: 300,
            ease: 'Power2'
        });

        // Auto destroy
        this.time.delayedCall(5000, () => {
            if (this.scene.isActive()) {
                this.tweens.add({
                    targets: hintBox,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => hintBox.destroy()
                });
            } else {
                hintBox.destroy();
            }
        });
    }

    private findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
        const { width, height } = this.mapGrid;
        const visited: boolean[][] = Array(width).fill(null).map(() => Array(height).fill(false));
        const cameFrom: ({ x: number; y: number } | null)[][] = Array(width).fill(null).map(() => Array(height).fill(null));

        const queue: { x: number; y: number }[] = [{ x: startX, y: startY }];
        visited[startX][startY] = true;

        const dirs = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
        ];

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (current.x === endX && current.y === endY) {
                // Reconstruct path (exclude start)
                const path: { x: number; y: number }[] = [];
                let node: { x: number; y: number } | null = { x: endX, y: endY };
                while (node && (node.x !== startX || node.y !== startY)) {
                    path.unshift({ x: node.x, y: node.y });
                    node = cameFrom[node.x][node.y];
                }
                return path;
            }

            for (const { dx, dy } of dirs) {
                const nx = current.x + dx;
                const ny = current.y + dy;

                if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                if (visited[nx][ny]) continue;
                if (!this.mapGrid.isTileDiscovered(nx, ny)) continue;
                if (!this.mapGrid.isWalkable(nx, ny)) continue;

                visited[nx][ny] = true;
                cameFrom[nx][ny] = { x: current.x, y: current.y };
                queue.push({ x: nx, y: ny });
            }
        }

        return [];
    }
}
