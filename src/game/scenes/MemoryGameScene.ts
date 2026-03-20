import { Scene, GameObjects } from 'phaser';
import { Building } from '../data/buildings';
import { MapScene } from './MapScene';
import { getMemoryGameForCategory, MemoryGamePair } from '../data/memoryGame';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';
import cursorHandPng from '../../assets/ui/PNG/cursorHand_beige.png';

interface CardData {
    id: string;
    pairId: string;
    type: 'image' | 'word';
    word?: string;
}

export class MemoryGameScene extends Scene {
    private building!: Building;
    private mapScene!: MapScene;
    private cards: GameObjects.Container[] = [];
    private flippedCards: GameObjects.Container[] = [];
    private matchedPairs: number = 0;
    private totalPairs: number = 6;
    private isLocked: boolean = false;
    private closeButton!: GameObjects.Image;

    // Grid settings - adjusted to fit panel better
    private readonly cardWidth: number = 100;
    private readonly cardHeight: number = 100;
    private readonly gap: number = 10;
    private readonly cols: number = 4;
    private readonly rows: number = 3;

    // Panel settings
    private readonly panelWidth: number = 500;
    private readonly panelHeight: number = 450;

    constructor() {
        super('MemoryGameScene');
    }

    init(data: any) {
        this.building = data.building;
        this.mapScene = data.mapScene;
    }

    preload() {
        // Load cursor assets
        this.load.image('cursorGauntlet', cursorGauntletPng);
        this.load.image('cursorHand', cursorHandPng);
    }

    create() {
        // Set custom default cursor
        this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);

        // Generate card back texture programmatically
        const cardBackGraphics = this.make.graphics();
        cardBackGraphics.fillStyle(0x4a3728, 1);
        cardBackGraphics.fillRect(0, 0, 100, 100);
        cardBackGraphics.lineStyle(3, 0xffffff, 1);
        cardBackGraphics.strokeRect(0, 0, 100, 100);
        cardBackGraphics.generateTexture('cardBack', 100, 100);
        cardBackGraphics.destroy();

        // Clear any existing cards from previous sessions
        this.cards = [];
        this.flippedCards = [];
        this.isLocked = false;

        // Dark overlay
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);

        // Panel background (using NineSlice)
        const panelX = this.cameras.main.width / 2;
        const panelY = this.cameras.main.height / 2;
        const panel = this.add.nineslice(
            panelX,
            panelY,
            'panel_brown',
            0,
            this.panelWidth,
            this.panelHeight,
            32, 32, 32, 32
        );
        panel.setScrollFactor(0);

        // Category label
        const categoryText = this.add.text(panelX, panelY - this.panelHeight/2 + 30, `[${this.building.category}]`, {
            fontSize: '16px',
            color: '#ffff00',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        categoryText.setOrigin(0.5);
        categoryText.setScrollFactor(0);

        // Title
        const titleText = this.add.text(panelX, panelY - this.panelHeight/2 + 50, 'Jogo da Memória', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);

        // Get memory game data for this category
        const memoryGameData = getMemoryGameForCategory(this.building.category);

        // Use full pair count and restore matched count from building
        this.totalPairs = memoryGameData.pairs.length;
        this.matchedPairs = this.building.matchedPairIds.length;

        // Create card data: each pair has an image and a word card (include ALL pairs)
        const cardData: CardData[] = [];
        memoryGameData.pairs.forEach((pair: MemoryGamePair) => {
            cardData.push({
                id: pair.imageKey,
                pairId: pair.imageKey,
                type: 'image'
            });
            cardData.push({
                id: pair.imageKey + '_word',
                pairId: pair.imageKey,
                type: 'word',
                word: pair.word
            });
        });

        // Shuffle cards
        this.shuffle(cardData);

        // Calculate grid start position to center it exactly in the scene
        const gridWidth = (this.cardWidth * this.cols) + (this.gap * (this.cols - 1));
        const gridHeight = (this.cardHeight * this.rows) + (this.gap * (this.rows - 1));
        
        // Center the grid exactly in the scene
        const startX = panelX - gridWidth / 2;
        const startY = panelY - gridHeight / 2;

        // Load images for this category
        memoryGameData.pairs.forEach((pair: MemoryGamePair) => {
            this.load.image(pair.imageKey, `assets/${this.building.category}/${pair.imageKey}.png`);
        });
        this.startLoading();

        // Create cards
        let index = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (index >= cardData.length) break;
                
                const cardInfo = cardData[index];
                const x = startX + col * (this.cardWidth + this.gap) + this.cardWidth / 2;
                const y = startY + row * (this.cardHeight + this.gap) + this.cardHeight / 2;

                this.createCard(x, y, cardInfo);
                index++;
            }
        }

        // Mark already-matched pairs as pre-flipped
        this.cards.forEach(card => {
            const pairId = card.getData('pairId');
            if (this.building.matchedPairIds.includes(pairId)) {
                card.setData('isMatched', true);

                // Hide back, show front
                const backSprite = card.getData('backSprite');
                backSprite.visible = false;
                backSprite.setTint(0x00ff00);

                const cardType = card.getData('cardType');
                if (cardType === 'image') {
                    const frontSprite = card.getData('frontSprite');
                    if (frontSprite) {
                        frontSprite.visible = true;
                        const cardId = card.getData('cardId');
                        frontSprite.setTexture(cardId);
                        frontSprite.setDisplaySize(this.cardWidth, this.cardHeight);
                    }
                } else {
                    const frontText = card.getData('frontText');
                    if (frontText) frontText.visible = true;
                }

                // Disable interaction
                card.disableInteractive();
            }
        });

        // Close button (Icon image instead of text)
        this.closeButton = this.add.image(panelX + this.panelWidth / 2 - 24, panelY - this.panelHeight / 2 + 24, 'iconCross_brown')
            .setInteractive({ cursor: `url(${cursorHandPng}), pointer` })
            .setOrigin(0.5);
        this.closeButton.setScrollFactor(0);

        this.closeButton.on('pointerdown', () => {
            this.closeScene();
        });

        this.closeButton.on('pointerover', () => {
             this.closeButton.setTint(0xffbbbb);
        });

        this.closeButton.on('pointerout', () => {
             this.closeButton.clearTint();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            this.closeScene();
        });

        // Add help button (?) in the top-left corner
        const helpButton = this.add.container(panelX - this.panelWidth / 2 + 24, panelY - this.panelHeight / 2 + 24);
        const helpBg = this.add.image(0, 0, 'buttonSquare_beige').setScale(0.8);
        const helpText = this.add.text(0, 0, '?', {
            fontSize: '20px',
            color: '#5c4033',
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);
        helpButton.add([helpBg, helpText]);
        helpButton.setScrollFactor(0);
        helpButton.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);
        helpButton.on('pointerover', () => {
            this.input.setDefaultCursor(`url(${cursorHandPng}), pointer`);
            helpBg.setTexture('buttonSquare_beige_pressed');
        });
        helpButton.on('pointerout', () => {
            this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);
            helpBg.setTexture('buttonSquare_beige');
        });
        helpButton.on('pointerdown', () => {
            const tooltip = this.add.text(panelX, panelY + this.panelHeight / 2 - 40, 'DICA: Se tiver dúvidas, procure o NPC Mentor\nda região no mapa para receber uma pista!', {
                fontSize: '14px',
                color: '#ffff00',
                backgroundColor: '#000000aa',
                padding: { x: 10, y: 5 },
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
            
            this.time.delayedCall(3000, () => tooltip.destroy());
        });
    }

    private closeScene(): void {
        this.scene.stop();
        if (this.matchedPairs < this.totalPairs) {
            this.building.wrongAttempts++;
            this.mapScene.onQuizComplete(false, this.building);
        } else {
            this.mapScene.onQuizComplete(null, this.building);
        }
    }

    private startLoading() {
        // Start loading assets
        this.load.start();
        
        // Wait for load to complete before creating cards
        this.load.once('complete', () => {
            // Cards are already created, but we need to update their textures
            this.updateCardTextures();
        });
    }

    private updateCardTextures() {
        // Update card front sprites with loaded textures
        this.cards.forEach(card => {
            const cardType = card.getData('cardType');
            const cardId = card.getData('cardId');
            const frontSprite = card.getData('frontSprite');
            
            if (cardType === 'image' && frontSprite) {
                frontSprite.setTexture(cardId);
                // Ensure the image fits within the card size
                frontSprite.setDisplaySize(this.cardWidth, this.cardHeight);
            }
        });
    }

    private createCard(x: number, y: number, cardInfo: CardData) {
        const container = this.add.container(x, y);
        
        // Back sprite (visible initially)
        const backSprite = this.add.sprite(0, 0, 'cardBack');
        backSprite.setDisplaySize(this.cardWidth, this.cardHeight);
        
        // Front content (hidden initially)
        let frontContent: GameObjects.GameObject;
        
        if (cardInfo.type === 'image') {
            // Image card - use a placeholder texture that will be updated later
            const frontSprite = this.add.sprite(0, 0, 'cardBack');
            frontSprite.setDisplaySize(this.cardWidth, this.cardHeight);
            frontSprite.visible = false;
            frontContent = frontSprite;
            container.setData('frontSprite', frontSprite);
        } else {
            // Word card - use text
            const textStyle = {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#000000',
                align: 'center',
                wordWrap: { width: this.cardWidth - 10 }
            };
            const text = this.add.text(0, 0, cardInfo.word || '', textStyle);
            text.setOrigin(0.5);
            text.visible = false;
            frontContent = text;
            container.setData('frontText', text);
        }

        container.add([backSprite, frontContent]);
        
        // Store data in container
        container.setData('cardId', cardInfo.id);
        container.setData('pairId', cardInfo.pairId);
        container.setData('cardType', cardInfo.type);
        container.setData('isFlipped', false);
        container.setData('isMatched', false);
        container.setData('backSprite', backSprite);

        // Make container interactive
        container.setSize(this.cardWidth, this.cardHeight);
        container.setInteractive();
        
        container.on('pointerdown', () => {
            this.flipCard(container);
        });

        this.cards.push(container);
    }

    private flipCard(card: GameObjects.Container) {
        if (this.isLocked) return;
        
        const isFlipped = card.getData('isFlipped');
        const isMatched = card.getData('isMatched');
        
        if (isFlipped || isMatched) return;
        if (this.flippedCards.length >= 2) return;

        // Flip animation
        const cardType = card.getData('cardType');
        const backSprite = card.getData('backSprite');
        
        // Simple flip: toggle visibility
        backSprite.visible = false;
        
        if (cardType === 'image') {
            const frontSprite = card.getData('frontSprite');
            if (frontSprite) {
                frontSprite.visible = true;
                // Load the actual image texture
                const cardId = card.getData('cardId');
                frontSprite.setTexture(cardId);
                // Ensure the image fits within the card size
                frontSprite.setDisplaySize(this.cardWidth, this.cardHeight);
            }
        } else {
            const frontText = card.getData('frontText');
            if (frontText) {
                frontText.visible = true;
            }
        }
        
        card.setData('isFlipped', true);
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.checkMatch();
        }
    }

    private checkMatch() {
        this.isLocked = true;
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];
        
        const pairId1 = card1.getData('pairId');
        const pairId2 = card2.getData('pairId');
        const type1 = card1.getData('cardType');
        const type2 = card2.getData('cardType');

        // Match if same pairId and different types (image vs word)
        if (pairId1 === pairId2 && type1 !== type2) {
            // Match found
            card1.setData('isMatched', true);
            card2.setData('isMatched', true);
            
            // Visual feedback: tint green
            const back1 = card1.getData('backSprite');
            const back2 = card2.getData('backSprite');
            if (back1) back1.setTint(0x00ff00);
            if (back2) back2.setTint(0x00ff00);
            
            this.matchedPairs++;
            this.building.matchedPairIds.push(pairId1);
            this.flippedCards = [];
            this.isLocked = false;

            if (this.matchedPairs === this.totalPairs) {
                this.showWin();
            }
        } else {
            // No match - flip back after delay
            this.time.delayedCall(1000, () => {
                const back1 = card1.getData('backSprite');
                const back2 = card2.getData('backSprite');
                
                back1.visible = true;
                back2.visible = true;
                
                if (type1 === 'image') {
                    const front1 = card1.getData('frontSprite');
                    if (front1) front1.visible = false;
                } else {
                    const front1 = card1.getData('frontText');
                    if (front1) front1.visible = false;
                }
                
                if (type2 === 'image') {
                    const front2 = card2.getData('frontSprite');
                    if (front2) front2.visible = false;
                } else {
                    const front2 = card2.getData('frontText');
                    if (front2) front2.visible = false;
                }
                
                card1.setData('isFlipped', false);
                card2.setData('isFlipped', false);
                
                this.flippedCards = [];
                this.isLocked = false;
            });
        }
    }

    private showWin() {
        // Disable inputs
        this.input.removeAllListeners();

        const panelX = this.cameras.main.width / 2;
        const panelY = this.cameras.main.height / 2;

        const winText = this.add.text(
            panelX,
            panelY + this.panelHeight / 2 + 20,
            'Parabéns! Você encontrou todos os pares!',
            {
                fontSize: '18px',
                color: '#00ff00',
                fontStyle: 'bold',
                align: 'center',
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
            }
        );
        winText.setOrigin(0.5);
        winText.setScrollFactor(0);

        // Reset wrong attempts on correct answer
        this.building.wrongAttempts = 0;

        // Delay before closing on correct answer
        this.time.delayedCall(1500, () => {
            this.scene.stop();
            this.mapScene.onQuizComplete(true, this.building);
        });
    }

    private shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
