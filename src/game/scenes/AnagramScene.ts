import { Scene, GameObjects } from 'phaser';
import { Building } from '../data/buildings';
import { MapScene } from './MapScene';
import { getAnagramForCategory, Anagram } from '../data/anagrams';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';
import cursorHandPng from '../../assets/ui/PNG/cursorHand_beige.png';

interface LetterSlot {
    letter: string;
    isLocked: boolean;
    isCorrect: boolean;
}

export class AnagramScene extends Scene {
    private building!: Building;
    private mapScene!: MapScene;
    private anagram!: Anagram;
    
    private letterTiles: GameObjects.Container[] = [];
    private guessArea: GameObjects.Rectangle[] = [];
    private slotData: LetterSlot[] = [];
    private lockedPositions: Set<number> = new Set();
    private submitButton!: GameObjects.Container;
    private resetButton!: GameObjects.Container;
    private closeButton!: GameObjects.Image;
    
    private isDragging: boolean = false;
    private draggedTile: GameObjects.Container | null = null;
    private originalPositions: Map<GameObjects.Container, { x: number, y: number }> = new Map();
    private startClickPos: { x: number, y: number } = { x: 0, y: 0 };

    constructor() {
        super('AnagramScene');
    }

    init(data: any) {
        this.building = data.building;
        this.mapScene = data.mapScene;
        this.anagram = getAnagramForCategory(this.building.category);
    }

    create() {
        // Clear any existing tiles from previous sessions
        this.letterTiles = [];
        this.guessArea = [];
        this.slotData = [];
        this.lockedPositions.clear();
        this.originalPositions.clear();

        // Dark overlay (matching QuizScene style)
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setScrollFactor(0);

        // Panel background (matching QuizScene style) - Increased height to fit generic hint
        const panelWidth = 500;
        const panelHeight = 400;
        const panelX = this.cameras.main.width / 2;
        const panelY = this.cameras.main.height / 2;

        const panel = this.add.nineslice(
            panelX, 
            panelY, 
            'panel_brown', 
            0, 
            panelWidth, 
            panelHeight,
            32, 32, 32, 32
        );
        panel.setScrollFactor(0);

        // Category label (matching QuizScene style)
        const categoryText = this.add.text(panelX, panelY - panelHeight/2 + 30, `[${this.building.category}]`, {
            fontSize: '16px',
            color: '#ffff00'
        });
        categoryText.setOrigin(0.5);
        categoryText.setScrollFactor(0);

        // Title
        const titleText = this.add.text(panelX, panelY - panelHeight/2 + 60, 'Anagrama', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);

        // Instructions
        const instructionText = this.add.text(panelX, panelY - panelHeight/2 + 90, 'Arraste as letras para formar a palavra', {
            fontSize: '14px',
            color: '#aaaaaa'
        });
        instructionText.setOrigin(0.5);
        instructionText.setScrollFactor(0);

        // Generic Hint (displayed immediately) - positioned under instructions
        const genericHintText = this.add.text(panelX, panelY - panelHeight/2 + 120, `Dica: ${this.anagram.genericHint}`, {
            fontSize: '14px',
            color: '#aaaaaa',
            align: 'center',
            wordWrap: { width: panelWidth - 40 }
        });
        genericHintText.setOrigin(0.5);
        genericHintText.setScrollFactor(0);

        // Create guess area (drop zone) - TOP AREA for locked letters
        // Adjust Y position to fit under the generic hint
        this.createGuessArea(panelX, panelY - 30);

        // Create letter tiles from scrambled name - BOTTOM AREA for draggable letters
        this.createLetterTiles(panelX, panelY + 30);

        // Create buttons
        this.createButtons(panelX, panelY, panelWidth, panelHeight);

        // Setup input events
        this.setupInputEvents();

        // Restore locked positions from previous session
        if (this.building.lockedPositions.length > 0) {
            this.restoreLockedPositions();
        }
    }

    private createGuessArea(panelX: number, panelY: number): void {
        const guessY = panelY - 20;
        const slotWidth = 40;
        const startX = panelX - (this.anagram.name.length * slotWidth) / 2 + slotWidth / 2;

        // Initialize slot data
        for (let i = 0; i < this.anagram.name.length; i++) {
            this.slotData.push({
                letter: '',
                isLocked: false,
                isCorrect: false
            });
        }

        for (let i = 0; i < this.anagram.name.length; i++) {
            const slot = this.add.rectangle(startX + i * slotWidth, guessY, 35, 35, 0xffffff, 0.3)
                .setStrokeStyle(2, 0xffffff)
                .setDepth(50);
            
            slot.setData('slotIndex', i);
            this.guessArea.push(slot);
        }
    }

    private createLetterTiles(startX: number, startY: number): void {
        const tileWidth = 35;
        const poolX = startX - (this.anagram.scrambled.length * tileWidth) / 2 + tileWidth / 2;

        // Shuffle the letters for display
        const shuffledLetters = this.anagram.scrambled.split('');

        for (let i = 0; i < shuffledLetters.length; i++) {
            const letter = shuffledLetters[i];
            // Use beige light panel for the letter tile (position relative to container is 0,0)
            const tileBg = this.add.nineslice(0, 0, 'panel_beigeLight', 0, 35, 35, 10, 10, 10, 10);
            
            const tileText = this.add.text(0, 0, letter, {
                fontFamily: 'Arial Black',
                fontSize: '18px',
                color: '#5c4033', // Dark brown to contrast with beige
                align: 'center'
            }).setOrigin(0.5);

            const tile = this.add.container(poolX + i * tileWidth, startY, [tileBg, tileText]);
            tile.setSize(35, 35);
            tile.setDepth(100)
                .setInteractive({ cursor: 'pointer' });

            this.letterTiles.push(tile as any);
            this.originalPositions.set(tile as any, { x: tile.x, y: tile.y });
            
            tile.setData('tileBg', tileBg);
            tile.setData('tileText', tileText);
        }
    }

    private createButtons(panelX: number, panelY: number, panelWidth: number, panelHeight: number): void {
        const buttonY = panelY + panelHeight/2 - 40;
        
        const buttonWidth = 120;
        const buttonHeight = 40;

        // Submit button
        const submitBg = this.add.nineslice(0, 0, 'buttonLong_beige', 0, buttonWidth, buttonHeight, 15, 15, 15, 15);
        const submitText = this.add.text(0, 0, 'CHECAR', {
            fontSize: '16px',
            color: '#5c4033',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.submitButton = this.add.container(panelX - 70, buttonY, [submitBg, submitText]);
        this.submitButton.setSize(buttonWidth, buttonHeight);
        this.submitButton.setDepth(100).setInteractive({ cursor: 'pointer' });

        this.submitButton.on('pointerdown', () => this.checkAnswer());
        this.submitButton.on('pointerover', () => submitBg.setTexture('buttonLong_beige_pressed'));
        this.submitButton.on('pointerout', () => submitBg.setTexture('buttonLong_beige'));

        // Reset button
        const resetBg = this.add.nineslice(0, 0, 'buttonLong_beige', 0, buttonWidth, buttonHeight, 15, 15, 15, 15);
        const resetText = this.add.text(0, 0, 'LIMPAR', {
            fontSize: '16px',
            color: '#5c4033',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.resetButton = this.add.container(panelX + 70, buttonY, [resetBg, resetText]);
        this.resetButton.setSize(buttonWidth, buttonHeight);
        this.resetButton.setDepth(100).setInteractive({ cursor: 'pointer' });

        this.resetButton.on('pointerdown', () => this.resetGuess());
        this.resetButton.on('pointerover', () => resetBg.setTexture('buttonLong_beige_pressed'));
        this.resetButton.on('pointerout', () => resetBg.setTexture('buttonLong_beige'));

        // Close button (Icon image)
        this.closeButton = this.add.image(panelX + panelWidth / 2 - 24, panelY - panelHeight / 2 + 24, 'iconCross_brown')
            .setInteractive({ cursor: 'pointer' })
            .setOrigin(0.5)
            .setDepth(100)
            .setScrollFactor(0);

        this.closeButton.on('pointerdown', () => this.closeScene());
        this.closeButton.on('pointerover', () => {
             this.input.setDefaultCursor(`url(${cursorHandPng}), pointer`);
             this.closeButton.setTint(0xffbbbb);
        });
        this.closeButton.on('pointerout', () => {
             this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);
             this.closeButton.clearTint();
        });

        // Add help button (?) in the top-left corner
        const helpButton = this.add.container(panelX - panelWidth / 2 + 24, panelY - panelHeight / 2 + 24);
        const helpBg = this.add.image(0, 0, 'buttonSquare_beige').setScale(0.8);
        const helpText = this.add.text(0, 0, '?', {
            fontSize: '20px',
            color: '#5c4033',
            fontStyle: 'bold'
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
            const tooltip = this.add.text(panelX, panelY + 130, 'DICA: Se tiver dúvidas, procure o NPC Mentor\nda região no mapa para receber uma pista!', {
                fontSize: '14px',
                color: '#ffff00',
                backgroundColor: '#000000aa',
                padding: { x: 10, y: 5 },
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
            
            this.time.delayedCall(3000, () => tooltip.destroy());
        });

        // ESC key to close
        this.input.keyboard?.on('keydown-ESC', () => {
            this.closeScene();
        });
    }

    private closeScene(): void {
        this.scene.stop();
        if (this.building.wrongAttempts > 0) {
            this.mapScene.onQuizComplete(false, this.building);
        } else {
            this.mapScene.onQuizComplete(null, this.building);
        }
    }

    private setupInputEvents(): void {
        // Setup drag events for each letter tile
        this.letterTiles.forEach(tile => {
            tile.on('pointerdown', () => {
                // Don't allow dragging locked tiles
                const slotIndex = tile.getData('slotIndex');
                if (slotIndex !== undefined && slotIndex >= 0 && this.lockedPositions.has(slotIndex)) {
                    return;
                }

                this.isDragging = false; // Don't start dragging yet
                this.draggedTile = tile;
                this.children.bringToTop(tile);
                this.startClickPos = { x: tile.x, y: tile.y };
            });

            tile.on('pointermove', () => {
                if (this.draggedTile === tile) {
                    const pointer = this.input.activePointer;
                    const distMoved = Phaser.Math.Distance.Between(this.startClickPos.x, this.startClickPos.y, pointer.x, pointer.y);

                    // Only start dragging if we've moved enough
                    if (!this.isDragging && distMoved > 10) {
                        this.isDragging = true;
                    }

                    if (this.isDragging) {
                        tile.x = pointer.x;
                        tile.y = pointer.y;
                        
                        // Update shadow position
                        const shadow = tile.getData('shadow');
                        if (shadow) {
                            shadow.x = pointer.x + 2;
                            shadow.y = pointer.y + 2;
                        }
                    }
                }
            });

            tile.on('pointerup', () => {
                if (this.draggedTile === tile) {
                    if (!this.isDragging) {
                        this.handleTileClick(tile);
                    } else {
                        this.checkDropZone(tile);
                    }
                    this.isDragging = false;
                    this.draggedTile = null;
                }
            });

            tile.on('pointerupoutside', () => {
                if (this.draggedTile === tile) {
                    if (!this.isDragging) {
                        this.handleTileClick(tile);
                    } else {
                        this.checkDropZone(tile);
                    }
                    this.isDragging = false;
                    this.draggedTile = null;
                }
            });
        });
    }

    private handleTileClick(tile: GameObjects.Container): void {
        const currentSlotIndex = tile.getData('slotIndex');
        
        if (currentSlotIndex !== undefined && currentSlotIndex >= 0) {
            // Already in a slot, return to pool
            this.returnTileToPool(tile);
        } else {
            // Find first empty slot
            const emptySlotIndex = this.findFirstEmptySlot();
            if (emptySlotIndex >= 0) {
                this.autoPlaceInSlot(tile, emptySlotIndex);
            }
        }
    }

    private findFirstEmptySlot(): number {
        for (let i = 0; i < this.guessArea.length; i++) {
            if (this.lockedPositions.has(i)) continue;
            
            // Check if any tile is in this slot
            let occupied = false;
            for (const tile of this.letterTiles) {
                if (tile.getData('slotIndex') === i) {
                    occupied = true;
                    break;
                }
            }
            if (!occupied) return i;
        }
        return -1;
    }

    private autoPlaceInSlot(tile: GameObjects.Container, slotIndex: number): void {
        const slot = this.guessArea[slotIndex];
        
        // Store original position if not already stored
        if (!this.originalPositions.has(tile)) {
            this.originalPositions.set(tile, { x: tile.x, y: tile.y });
        }
        
        tile.setData('slotIndex', slotIndex);
        
        this.tweens.add({
            targets: tile,
            x: slot.x,
            y: slot.y,
            duration: 250,
            ease: 'Back.easeOut'
        });
    }

    private returnTileToPool(tile: GameObjects.Container): void {
        const originalPos = this.originalPositions.get(tile);
        if (originalPos) {
            tile.setData('slotIndex', -1);
            
            this.tweens.add({
                targets: tile,
                x: originalPos.x,
                y: originalPos.y,
                duration: 250,
                ease: 'Power2'
            });
        }
    }

    private checkDropZone(tile: GameObjects.Container): void {
        let droppedInSlot = false;

        for (let i = 0; i < this.guessArea.length; i++) {
            const slot = this.guessArea[i];
            
            // Don't allow dropping on locked slots
            if (this.lockedPositions.has(i)) {
                continue;
            }

            const distance = Phaser.Math.Distance.Between(tile.x, tile.y, slot.x, slot.y);
            
            if (distance < 30) {
                // Check if another tile is already in this slot
                let slotOccupied = false;
                for (const otherTile of this.letterTiles) {
                    if (otherTile !== tile && otherTile.getData('slotIndex') === i) {
                        slotOccupied = true;
                        break;
                    }
                }

                if (!slotOccupied) {
                    // Snap to slot
                    tile.x = slot.x;
                    tile.y = slot.y;
                    
                    // Update shadow position
                    const shadow = tile.getData('shadow');
                    if (shadow) {
                        shadow.x = tile.x + 2;
                        shadow.y = tile.y + 2;
                    }
                    
                    // Update tile's slot index
                    tile.setData('slotIndex', i);
                    droppedInSlot = true;
                    
                    // Store original position if not already stored
                    if (!this.originalPositions.has(tile)) {
                        this.originalPositions.set(tile, { x: tile.x, y: tile.y });
                    }
                    
                    break;
                }
            }
        }

        // If not dropped in a valid slot, return to original position
        if (!droppedInSlot) {
            const originalPos = this.originalPositions.get(tile);
            if (originalPos) {
                this.tweens.add({
                    targets: tile,
                    x: originalPos.x,
                    y: originalPos.y,
                    duration: 200,
                    ease: 'Power2'
                });
                
                // Update shadow position
                const shadow = tile.getData('shadow');
                if (shadow) {
                    this.tweens.add({
                        targets: shadow,
                        x: originalPos.x + 2,
                        y: originalPos.y + 2,
                        duration: 200,
                        ease: 'Power2'
                    });
                }
                
                // Reset slot index to indicate not in any slot
                tile.setData('slotIndex', -1);
            }
        }
    }

    private checkAnswer(): void {
        // Check if all slots are filled
        let allFilled = true;
        let guessArray: string[] = [];
        
        for (let i = 0; i < this.guessArea.length; i++) {
            // Find which tile is in this slot
            let tileInSlot: GameObjects.Container | null = null;
            for (const tile of this.letterTiles) {
                if (tile.getData('slotIndex') === i) {
                    tileInSlot = tile;
                    break;
                }
            }
            
            if (tileInSlot) {
                const tileText = tileInSlot.getData('tileText') as GameObjects.Text;
                guessArray.push(tileText.text);
            } else {
                allFilled = false;
                break;
            }
        }

        if (!allFilled) {
            // Not all slots filled, show message
            this.showFeedback('Preencha todas as casas primeiro!', '#ffaa00');
            return;
        }

        const guess = guessArray.join('');

        if (guess === this.anagram.name) {
            // Complete correct answer!
            this.showSuccess();
        } else {
            // Partial check - find correct positions
            const correctPositions: number[] = [];
            
            for (let i = 0; i < guess.length; i++) {
                if (guess[i] === this.anagram.name[i]) {
                    correctPositions.push(i);
                }
            }

            if (correctPositions.length > 0) {
                // Lock correct positions
                correctPositions.forEach(pos => {
                    this.lockedPositions.add(pos);
                });

                // Persist locked positions to building
                this.building.lockedPositions = [...this.lockedPositions];

                // Update visual appearance of locked tiles
                this.updateLockedTiles();

                // Return incorrect tiles to pool
                this.returnIncorrectTiles(correctPositions);

                // Track wrong attempt for NPC hints
                this.building.wrongAttempts++;
                
                // Show hint (art style hint from anagram data)
                this.showHint();
            } else {
                // No correct positions, shake all tiles
                this.shakeTiles();

                // Track wrong attempt for NPC hints
                this.building.wrongAttempts++;

                // Show hint (art style hint from anagram data)
                this.showHint();
            }
        }
    }

    private updateLockedTiles(): void {
        this.letterTiles.forEach(tile => {
            const slotIndex = tile.getData('slotIndex');
            if (slotIndex !== undefined && slotIndex >= 0 && this.lockedPositions.has(slotIndex)) {
                // Update visual for locked tile
                const tileBg = tile.getData('tileBg') as GameObjects.NineSlice;
                tileBg.setTint(0x77bbff); // Light blue tint for correct
                tile.setAlpha(1);
                
                // Disable interaction for locked tiles
                tile.disableInteractive();
            }
        });
    }

    private returnIncorrectTiles(correctPositions: number[]): void {
        this.letterTiles.forEach(tile => {
            const slotIndex = tile.getData('slotIndex');
            if (slotIndex !== undefined && slotIndex >= 0) {
                // If this tile is in a position that is NOT correct, return it to pool
                if (!correctPositions.includes(slotIndex)) {
                    const originalPos = this.originalPositions.get(tile);
                    if (originalPos) {
                        // Animate back to pool
                        this.tweens.add({
                            targets: tile,
                            x: originalPos.x,
                            y: originalPos.y,
                            duration: 300,
                            ease: 'Power2'
                        });
                        

                        
                        // Reset slot index
                        tile.setData('slotIndex', -1);
                    }
                }
            }
        });
    }

    private showHint(): void {
        // Show specific hint when player makes a mistake
        const hintText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            `Dica: ${this.anagram.specificHint}`,
            {
                fontSize: '14px',
                color: '#ffff00',
                align: 'center',
                wordWrap: { width: 460 }
            }
        );
        hintText.setOrigin(0.5);
        hintText.setScrollFactor(0);

        // Fade out and remove after delay
        this.tweens.add({
            targets: hintText,
            alpha: 0,
            duration: 2000,
            delay: 1500,
            onComplete: () => {
                hintText.destroy();
            }
        });
    }

    private showFeedback(message: string, color: string): void {
        const feedback = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            message,
            {
                fontSize: '16px',
                color: color
            }
        )
            .setOrigin(0.5)
            .setScrollFactor(0);

        // Fade out and remove after delay
        this.tweens.add({
            targets: feedback,
            alpha: 0,
            y: feedback.y - 20,
            duration: 1000,
            delay: 500,
            onComplete: () => {
                feedback.destroy();
            }
        });
    }

    private shakeTiles(): void {
        this.letterTiles.forEach(tile => {
            // Don't shake locked tiles
            const slotIndex = tile.getData('slotIndex');
            if (slotIndex === undefined || slotIndex < 0 || !this.lockedPositions.has(slotIndex)) {
                this.tweens.add({
                    targets: tile,
                    x: tile.x + 8,
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
            }
        });
    }

    private showSuccess(): void {
        // Color all tiles green
        this.letterTiles.forEach(tile => {
            const tileBg = tile.getData('tileBg') as GameObjects.NineSlice;
            tileBg.setTint(0x77ff77);
        });

        // Show success message (matching QuizScene style)
        const resultText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            '✓ Correto!',
            {
                fontSize: '20px',
                color: '#00ff00'
            }
        );
        resultText.setOrigin(0.5);
        resultText.setScrollFactor(0);

        // Reset wrong attempts on correct answer
        this.building.wrongAttempts = 0;
        this.building.lockedPositions = [];

        // Disable buttons
        this.submitButton.disableInteractive();
        this.resetButton.disableInteractive();
        this.closeButton.disableInteractive();

        // Delay before closing on correct answer (matching QuizScene timing)
        this.time.delayedCall(1000, () => {
            this.scene.stop();
            this.mapScene.onQuizComplete(true, this.building);
        });
    }

    private resetGuess(): void {
        // Reset locked positions
        this.lockedPositions.clear();

        // Return all tiles to original positions and reset colors
        this.letterTiles.forEach(tile => {
            const originalPos = this.originalPositions.get(tile);
            if (originalPos) {
                this.tweens.add({
                    targets: tile,
                    x: originalPos.x,
                    y: originalPos.y,
                    duration: 300,
                    ease: 'Power2'
                });

                // Reset visual
                const tileBg = tile.getData('tileBg') as GameObjects.NineSlice;
                tileBg.clearTint();
                
                // Re-enable interaction
                tile.setInteractive({ cursor: 'pointer' });

                // Reset slot index
                tile.setData('slotIndex', -1);
            }
        });
    }

    private restoreLockedPositions(): void {
        // Rebuild locked positions from building data
        this.building.lockedPositions.forEach(index => {
            this.lockedPositions.add(index);
        });

        // For each locked position, find a matching tile in the pool and snap it to the slot
        for (const index of this.building.lockedPositions) {
            const requiredLetter = this.anagram.name[index];

            // Find an available tile with the matching letter (not yet assigned to a slot)
            const tile = this.letterTiles.find(t => {
                const tileText = t.getData('tileText') as GameObjects.Text;
                return tileText.text === requiredLetter &&
                       (t.getData('slotIndex') === undefined || t.getData('slotIndex') < 0);
            });

            if (tile) {
                const slot = this.guessArea[index];

                // Snap tile to slot position
                tile.x = slot.x;
                tile.y = slot.y;

                // Update shadow position
                const shadow = tile.getData('shadow');
                if (shadow) {
                    shadow.x = slot.x + 2;
                    shadow.y = slot.y + 2;
                }

                // Update slot data
                tile.setData('slotIndex', index);
                this.slotData[index].isLocked = true;
            }
        }

        // Apply locked visual styling
        this.updateLockedTiles();
    }

    update() {
        // Handle continuous dragging
        if (this.isDragging && this.draggedTile) {
            const pointer = this.input.activePointer;
            this.draggedTile.x = pointer.x;
            this.draggedTile.y = pointer.y;
        }
    }
}
