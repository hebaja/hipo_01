import { Scene, GameObjects, Math } from 'phaser';

interface Painter {
    name: string;
    scrambled: string;
    artStyle: string;
    colors: string[];
}

const PAINTERS: Painter[] = [
    {
        name: "PICASSO",
        scrambled: "SCPICAO",
        artStyle: "Cubismo - Múltiplas perspectivas em uma pintura",
        colors: ["#2C3E50", "#E74C3C", "#F39C12", "#3498DB", "#2C3E50"]
    },
    {
        name: "FRIDA",
        scrambled: "IRDFA",
        artStyle: "Surrealismo - Sonhador, autorretratos simbólicos",
        colors: ["#215E9A", "#C62828", "#F9A825", "#6D4C41", "#43A047"]
    },
    {
        name: "MONET",
        scrambled: "MOTNE",
        artStyle: "Impressionismo - Luz, cor e atmosfera",
        colors: ["#5F9E6E", "#3E86A0", "#FFC72C", "#B081C6", "#FF3B30"]
    }
];

interface LetterSlot {
    letter: string;
    isLocked: boolean;
    isCorrect: boolean;
}

export class Game extends Scene
{
    private selectedPainter!: Painter;
    private letterTiles: GameObjects.Text[] = [];
    private guessArea: GameObjects.Rectangle[] = [];
    private slotData: LetterSlot[] = [];
    private lockedPositions: Set<number> = new Set();
    private submitButton!: GameObjects.Text;
    private resetButton!: GameObjects.Text;
    private isDragging: boolean = false;
    private draggedTile: GameObjects.Text | null = null;
    private originalPositions: Map<GameObjects.Text, { x: number, y: number }> = new Map();

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('logo', 'logo.png');
    }

    create ()
    {
        // Select random painter
        this.selectedPainter = PAINTERS[Math.Between(0, PAINTERS.length - 1)];
        this.lockedPositions.clear();

        // Setup themed background
        const bgColor = this.selectedPainter.colors[0];
        this.cameras.main.setBackgroundColor(bgColor);

        // Add background image with tint
        this.add.image(512, 384, 'background').setAlpha(0.3);

        // Title
        this.add.text(512, 40, 'JOGO DE ANAGRAMA', {
            fontFamily: 'Arial Black',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(100);

        this.add.text(512, 80, 'PINTORES FAMOSOS', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(100);

        // Instructions
        this.add.text(512, 115, 'Arraste as letras para formar o nome do pintor', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffcc'
        }).setOrigin(0.5).setDepth(100);

        // Create guess area (drop zone) - TOP AREA for locked letters
        this.createGuessArea();

        // Create letter tiles from scrambled name - BOTTOM AREA for draggable letters
        this.createLetterTiles();

        // Create buttons
        this.createButtons();

        // Setup input events
        this.setupInputEvents();
    }

    private createGuessArea(): void
    {
        const guessY = 280;
        const slotWidth = 60;
        const startX = 512 - (this.selectedPainter.name.length * slotWidth) / 2 + slotWidth / 2;

        // Initialize slot data
        for (let i = 0; i < this.selectedPainter.name.length; i++)
        {
            this.slotData.push({
                letter: '',
                isLocked: false,
                isCorrect: false
            });
        }

        for (let i = 0; i < this.selectedPainter.name.length; i++)
        {
            const slot = this.add.rectangle(startX + i * slotWidth, guessY, 55, 55, 0xffffff, 0.3)
                .setStrokeStyle(3, 0xffffff)
                .setDepth(50);
            
            slot.setData('slotIndex', i);
            this.guessArea.push(slot);
        }

        // Label for guess area
        this.add.text(512, guessY - 45, 'LETRAS CORRETAS BLOQUEADAS', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#aaaaff'
        }).setOrigin(0.5).setDepth(100);
    }

    private createLetterTiles(): void
    {
        // Letter pool area
        const poolY = 450;
        const tileWidth = 55;
        const startX = 512 - (this.selectedPainter.name.length * tileWidth) / 2 + tileWidth / 2;

        // Shuffle the letters for display
        const shuffledLetters = this.selectedPainter.scrambled.split('');

        for (let i = 0; i < shuffledLetters.length; i++)
        {
            const letter = shuffledLetters[i];
            const tile = this.add.text(startX + i * tileWidth, poolY, letter, {
                fontFamily: 'Arial Black',
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: this.selectedPainter.colors[Math.Between(1, 4)],
                padding: { x: 10, y: 6 },
                align: 'center'
            })
                .setOrigin(0.5)
                .setDepth(100)
                .setInteractive({ cursor: 'pointer' });

            this.letterTiles.push(tile);
            this.originalPositions.set(tile, { x: tile.x, y: tile.y });

            // Add subtle shadow
            const shadow = this.add.text(tile.x + 3, tile.y + 3, letter, {
                fontFamily: 'Arial Black',
                fontSize: '28px',
                color: '#000000'
            })
                .setOrigin(0.5)
                .setAlpha(0.3)
                .setDepth(99);
            
            tile.setData('shadow', shadow);
        }

        // Label for letter pool
        this.add.text(512, poolY - 35, 'RESERVATÓRIO DE LETRAS', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(100);
    }

    private createButtons(): void
    {
        // Submit button
        this.submitButton = this.add.text(420, 550, 'ENVIAR', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#27ae60',
            padding: { x: 18, y: 8 }
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
        this.resetButton = this.add.text(604, 550, 'LIMPAR', {
            fontFamily: 'Arial Black',
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#e74c3c',
            padding: { x: 18, y: 8 }
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
    }

    private setupInputEvents(): void
    {
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
                if (this.isDragging && this.draggedTile === tile)
                {
                    const pointer = this.input.activePointer;
                    tile.x = pointer.x;
                    tile.y = pointer.y;
                    
                    // Update shadow position
                    const shadow = tile.getData('shadow');
                    if (shadow) {
                        shadow.x = pointer.x + 3;
                        shadow.y = pointer.y + 3;
                    }
                }
            });

            tile.on('pointerup', () => {
                if (this.draggedTile === tile)
                {
                    this.isDragging = false;
                    this.draggedTile = null;
                    
                    // Check if dropped on guess area slot
                    this.checkDropZone(tile);
                }
            });

            tile.on('pointerupoutside', () => {
                if (this.draggedTile === tile)
                {
                    this.isDragging = false;
                    this.draggedTile = null;
                    
                    // Check if dropped on guess area slot
                    this.checkDropZone(tile);
                }
            });
        });
    }

    private checkDropZone(tile: GameObjects.Text): void
    {
        let droppedInSlot = false;

        for (let i = 0; i < this.guessArea.length; i++)
        {
            const slot = this.guessArea[i];
            
            // Don't allow dropping on locked slots
            if (this.lockedPositions.has(i)) {
                continue;
            }

            const distance = Phaser.Math.Distance.Between(tile.x, tile.y, slot.x, slot.y);
            
            if (distance < 40)
            {
                // Check if another tile is already in this slot
                let slotOccupied = false;
                for (const otherTile of this.letterTiles) {
                    if (otherTile !== tile && otherTile.getData('slotIndex') === i) {
                        slotOccupied = true;
                        break;
                    }
                }

                if (!slotOccupied)
                {
                    // Snap to slot
                    tile.x = slot.x;
                    tile.y = slot.y;
                    
                    // Update shadow position
                    const shadow = tile.getData('shadow');
                    if (shadow) {
                        shadow.x = tile.x + 3;
                        shadow.y = tile.y + 3;
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
        if (!droppedInSlot)
        {
            const originalPos = this.originalPositions.get(tile);
            if (originalPos)
            {
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
                        x: originalPos.x + 3,
                        y: originalPos.y + 3,
                        duration: 200,
                        ease: 'Power2'
                    });
                }
                
                // Reset slot index to indicate not in any slot
                tile.setData('slotIndex', -1);
            }
        }
    }

    private checkAnswer(): void
    {
        // Check if all slots are filled
        let allFilled = true;
        let guessArray: string[] = [];
        
        for (let i = 0; i < this.guessArea.length; i++)
        {
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

        if (!allFilled)
        {
            // Not all slots filled, show message
            this.showFeedback('Preencha todas as casas primeiro!', '#ffaa00');
            return;
        }

        const guess = guessArray.join('');

        if (guess === this.selectedPainter.name)
        {
            // Complete correct answer!
            this.showSuccess();
        }
        else
        {
            // Partial check - find correct positions
            const correctPositions: number[] = [];
            
            for (let i = 0; i < guess.length; i++)
            {
                if (guess[i] === this.selectedPainter.name[i])
                {
                    correctPositions.push(i);
                }
            }

            if (correctPositions.length > 0)
            {
                // Lock correct positions
                correctPositions.forEach(pos => {
                    this.lockedPositions.add(pos);
                });

                // Update visual appearance of locked tiles
                this.updateLockedTiles();

                // Return incorrect tiles to pool
                this.returnIncorrectTiles(correctPositions);
            }
            else
            {
                // No correct positions, shake all tiles
                this.shakeTiles();
            }
        }
    }

    private updateLockedTiles(): void
    {
        this.letterTiles.forEach(tile => {
            const slotIndex = tile.getData('slotIndex');
            if (slotIndex !== undefined && slotIndex >= 0 && this.lockedPositions.has(slotIndex))
            {
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

    private returnIncorrectTiles(correctPositions: number[]): void
    {
        this.letterTiles.forEach(tile => {
            const slotIndex = tile.getData('slotIndex');
            if (slotIndex !== undefined && slotIndex >= 0)
            {
                // If this tile is in a position that is NOT correct, return it to pool
                if (!correctPositions.includes(slotIndex))
                {
                    const originalPos = this.originalPositions.get(tile);
                    if (originalPos)
                    {
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
                                x: originalPos.x + 3,
                                y: originalPos.y + 3,
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

    private showFeedback(message: string, color: string): void
    {
        const feedback = this.add.text(512, 500, message, {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: color
        })
            .setOrigin(0.5)
            .setDepth(200);

        // Fade out and remove after delay
        this.tweens.add({
            targets: feedback,
            alpha: 0,
            y: 480,
            duration: 1000,
            delay: 500,
            onComplete: () => {
                feedback.destroy();
            }
        });
    }

    private shakeTiles(): void
    {
        this.letterTiles.forEach(tile => {
            // Don't shake locked tiles
            const slotIndex = tile.getData('slotIndex');
            if (slotIndex === undefined || slotIndex < 0 || !this.lockedPositions.has(slotIndex))
            {
                this.tweens.add({
                    targets: tile,
                    x: tile.x + 10,
                    duration: 50,
                    yoyo: true,
                    repeat: 3
                });
            }
        });
    }

    private showSuccess(): void
    {
        // Color all tiles green
        this.letterTiles.forEach(tile => {
            tile.setBackgroundColor('#27ae60');
        });

        // Show success message
        const successText = this.add.text(512, 180, 'CORRETO!', {
            fontFamily: 'Arial Black',
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        })
            .setOrigin(0.5)
            .setDepth(200);

        this.tweens.add({
            targets: successText,
            scale: 1.2,
            duration: 200,
            yoyo: true,
            repeat: 2
        });

        // Show painter name
        this.add.text(512, 220, this.selectedPainter.name, {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#ffff00'
        })
            .setOrigin(0.5)
            .setDepth(200);

        // Show art style
        this.add.text(512, 250, this.selectedPainter.artStyle, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(200);

        // Disable buttons
        this.submitButton.disableInteractive();
        this.resetButton.disableInteractive();

        // Add play again button after delay
        this.time.delayedCall(1000, () => {
            const againButton = this.add.text(512, 550, 'JOGAR NOVAMENTE', {
                fontFamily: 'Arial Black',
                fontSize: '22px',
                color: '#ffffff',
                backgroundColor: '#9b59b6',
                padding: { x: 18, y: 8 }
            })
                .setOrigin(0.5)
                .setDepth(200)
                .setInteractive({ cursor: 'pointer' });

            againButton.on('pointerdown', () => {
                this.scene.restart();
            });

            againButton.on('pointerover', () => {
                againButton.setBackgroundColor('#8e44ad');
            });

            againButton.on('pointerout', () => {
                againButton.setBackgroundColor('#9b59b6');
            });
        });
    }

    private resetGuess(): void
    {
        // Reset locked positions
        this.lockedPositions.clear();

        // Return all tiles to original positions and reset colors
        this.letterTiles.forEach(tile => {
            const originalPos = this.originalPositions.get(tile);
            if (originalPos)
            {
                this.tweens.add({
                    targets: tile,
                    x: originalPos.x,
                    y: originalPos.y,
                    duration: 300,
                    ease: 'Power2'
                });

                // Reset color to original
                tile.setBackgroundColor(this.selectedPainter.colors[Math.Between(1, 4)]);
                
                // Re-enable interaction
                tile.setInteractive({ cursor: 'pointer' });

                // Reset slot index
                tile.setData('slotIndex', -1);

                // Update shadow
                const shadow = tile.getData('shadow');
                if (shadow) {
                    this.tweens.add({
                        targets: shadow,
                        x: originalPos.x + 3,
                        y: originalPos.y + 3,
                        duration: 300,
                        ease: 'Power2'
                    });
                    shadow.setAlpha(0.3);
                }
            }
        });
    }

    update()
    {
        // Handle continuous dragging
        if (this.isDragging && this.draggedTile)
        {
            const pointer = this.input.activePointer;
            this.draggedTile.x = pointer.x;
            this.draggedTile.y = pointer.y;
            
            // Update shadow position
            const shadow = this.draggedTile.getData('shadow');
            if (shadow) {
                shadow.x = pointer.x + 3;
                shadow.y = pointer.y + 3;
            }
        }
    }
}
