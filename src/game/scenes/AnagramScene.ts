import { Scene, GameObjects } from 'phaser';
import { Building } from '../data/buildings';
import { MapScene } from './MapScene';
import { getAnagramForCategory, Anagram } from '../data/anagrams';

interface LetterSlot {
    letter: string;
    isLocked: boolean;
    isCorrect: boolean;
}

export class AnagramScene extends Scene {
    private building!: Building;
    private mapScene!: MapScene;
    private anagram!: Anagram;
    
    private letterTiles: GameObjects.Text[] = [];
    private guessArea: GameObjects.Rectangle[] = [];
    private slotData: LetterSlot[] = [];
    private lockedPositions: Set<number> = new Set();
    private submitButton!: GameObjects.Text;
    private resetButton!: GameObjects.Text;
    private closeButton!: GameObjects.Text;
    
    private isDragging: boolean = false;
    private draggedTile: GameObjects.Text | null = null;
    private originalPositions: Map<GameObjects.Text, { x: number, y: number }> = new Map();

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

        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x333333, 1);
        panel.setScrollFactor(0);
        panel.setStrokeStyle(2, 0xffffff);

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
            const tile = this.add.text(poolX + i * tileWidth, startY, letter, {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#555555',
                padding: { x: 8, y: 4 },
                align: 'center'
            })
                .setOrigin(0.5)
                .setDepth(100)
                .setInteractive({ cursor: 'pointer' });

            this.letterTiles.push(tile);
            this.originalPositions.set(tile, { x: tile.x, y: tile.y });

            // Add subtle shadow
            const shadow = this.add.text(tile.x + 2, tile.y + 2, letter, {
                fontFamily: 'Arial Black',
                fontSize: '20px',
                color: '#000000'
            })
                .setOrigin(0.5)
                .setAlpha(0.3)
                .setDepth(99);
            
            tile.setData('shadow', shadow);
        }
    }

    private createButtons(panelX: number, panelY: number, panelWidth: number, panelHeight: number): void {
        const buttonY = panelY + panelHeight/2 - 40;
        
        // Submit button
        this.submitButton = this.add.text(panelX - 60, buttonY, 'CHECAR', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 12, y: 6 }
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive({ cursor: 'pointer' });

        this.submitButton.on('pointerdown', () => {
            this.checkAnswer();
        });

        this.submitButton.on('pointerover', () => {
            this.submitButton.setBackgroundColor('#2ecc71');
        });

        this.submitButton.on('pointerout', () => {
            this.submitButton.setBackgroundColor('#27ae60');
        });

        // Reset button
        this.resetButton = this.add.text(panelX + 60, buttonY, 'LIMPAR', {
            fontSize: '16px',
            color: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 12, y: 6 }
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setInteractive({ cursor: 'pointer' });

        this.resetButton.on('pointerdown', () => {
            this.resetGuess();
        });

        this.resetButton.on('pointerover', () => {
            this.resetButton.setBackgroundColor('#c0392b');
        });

        this.resetButton.on('pointerout', () => {
            this.resetButton.setBackgroundColor('#e74c3c');
        });

        // Close button (X) - matching QuizScene style (top-right of panel)
        this.closeButton = this.add.text(panelX + panelWidth / 2 - 20, panelY - panelHeight / 2 + 20, 'X', {
            fontSize: '24px',
            color: '#ff0000',
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0);

        this.closeButton.on('pointerdown', () => {
            this.scene.stop();
            this.mapScene.onQuizComplete(null, this.building);
        });

        this.closeButton.on('pointerover', () => {
            this.closeButton.setColor('#ff8888');
        });

        this.closeButton.on('pointerout', () => {
            this.closeButton.setColor('#ff0000');
        });
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

                this.isDragging = true;
                this.draggedTile = tile;
                this.children.bringToTop(tile);
                
                // Bring shadow to top as well
                const shadow = tile.getData('shadow');
                if (shadow) {
                    this.children.bringToTop(shadow);
                }
            });

            tile.on('pointermove', () => {
                if (this.isDragging && this.draggedTile === tile) {
                    const pointer = this.input.activePointer;
                    tile.x = pointer.x;
                    tile.y = pointer.y;
                    
                    // Update shadow position
                    const shadow = tile.getData('shadow');
                    if (shadow) {
                        shadow.x = pointer.x + 2;
                        shadow.y = pointer.y + 2;
                    }
                }
            });

            tile.on('pointerup', () => {
                if (this.draggedTile === tile) {
                    this.isDragging = false;
                    this.draggedTile = null;
                    
                    // Check if dropped on guess area slot
                    this.checkDropZone(tile);
                }
            });

            tile.on('pointerupoutside', () => {
                if (this.draggedTile === tile) {
                    this.isDragging = false;
                    this.draggedTile = null;
                    
                    // Check if dropped on guess area slot
                    this.checkDropZone(tile);
                }
            });
        });
    }

    private checkDropZone(tile: GameObjects.Text): void {
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
            let tileInSlot: GameObjects.Text | null = null;
            for (const tile of this.letterTiles) {
                if (tile.getData('slotIndex') === i) {
                    tileInSlot = tile;
                    break;
                }
            }
            
            if (tileInSlot) {
                guessArray.push(tileInSlot.text);
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

                // Update visual appearance of locked tiles
                this.updateLockedTiles();

                // Return incorrect tiles to pool
                this.returnIncorrectTiles(correctPositions);
                
                // Show hint (art style hint from anagram data)
                this.showHint();
            } else {
                // No correct positions, shake all tiles
                this.shakeTiles();
                
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
                tile.setBackgroundColor('#3498DB'); // Blue color for correct
                tile.setAlpha(1);
                
                // Disable interaction for locked tiles
                tile.disableInteractive();
                
                // Add a visual indicator (small border or checkmark)
                const shadow = tile.getData('shadow');
                if (shadow) {
                    shadow.setAlpha(0.5); // Make shadow more visible for locked tiles
                }
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
                        
                        // Update shadow position
                        const shadow = tile.getData('shadow');
                        if (shadow) {
                            this.tweens.add({
                                targets: shadow,
                                x: originalPos.x + 2,
                                y: originalPos.y + 2,
                                duration: 300,
                                ease: 'Power2'
                            });
                        }
                        
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
            tile.setBackgroundColor('#27ae60');
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

        // Reset wrong attempts on correct answer (if we were tracking them)
        // this.building.wrongAttempts = 0;

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

                // Reset color to original
                tile.setBackgroundColor('#555555');
                
                // Re-enable interaction
                tile.setInteractive({ cursor: 'pointer' });

                // Reset slot index
                tile.setData('slotIndex', -1);

                // Update shadow
                const shadow = tile.getData('shadow');
                if (shadow) {
                    this.tweens.add({
                        targets: shadow,
                        x: originalPos.x + 2,
                        y: originalPos.y + 2,
                        duration: 300,
                        ease: 'Power2'
                    });
                    shadow.setAlpha(0.3);
                }
            }
        });
    }

    update() {
        // Handle continuous dragging
        if (this.isDragging && this.draggedTile) {
            const pointer = this.input.activePointer;
            this.draggedTile.x = pointer.x;
            this.draggedTile.y = pointer.y;
            
            // Update shadow position
            const shadow = this.draggedTile.getData('shadow');
            if (shadow) {
                shadow.x = pointer.x + 2;
                shadow.y = pointer.y + 2;
            }
        }
    }
}
