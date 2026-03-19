import { Scene, GameObjects, Input } from 'phaser';
import { Building } from '../data/buildings';
import { MapScene } from './MapScene';
import { getWordSearchForCategory } from '../data/wordSearch';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';
import cursorHandPng from '../../assets/ui/PNG/cursorHand_beige.png';

interface Cell {
    x: number;
    y: number;
    letter: string;
    text: GameObjects.Text;
    selected: boolean;
    found: boolean;
}

export class WordSearchScene extends Scene {
    private building!: Building;
    private mapScene!: MapScene;
    private grid: Cell[][] = [];
    private gridSize: number = 9;
    private cellSize: number = 30; // Reduced to fit better in panel
    private words: string[] = [];
    private foundWords: string[] = [];
    private isSelecting: boolean = false;
    private selectedCells: Cell[] = [];
    private offsetX: number = 0;
    private offsetY: number = 0;
    private gridGraphics: GameObjects.Graphics;
    private selectedGraphics: GameObjects.Graphics;
    private foundGraphics: GameObjects.Graphics;
    private wordListText: GameObjects.Text[] = [];
    private closeButton!: GameObjects.Image;

    constructor() {
        super('WordSearchScene');
    }

    init(data: any) {
        this.building = data.building;
        this.mapScene = data.mapScene;
        const wordSearchData = getWordSearchForCategory(this.building.category);
        this.words = wordSearchData.words;
    }

    preload() {
        // No external assets needed
    }

    create() {
        // Set custom default cursor
        this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);

        // Clear any existing graphics/text from previous sessions
        this.selectedCells = [];
        this.foundWords = [];
        this.wordListText = [];

        const isFirstVisit = this.building.wordPositions.length === 0;

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

        // Panel configuration
        const panelWidth = 550;
        const panelHeight = 420; // Slightly taller to fit word list
        const panelX = this.cameras.main.width / 2;
        const panelY = this.cameras.main.height / 2;

        // Panel background (using NineSlice)
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

        // Category label
        const categoryText = this.add.text(panelX, panelY - panelHeight/2 + 30, `[${this.building.category}]`, {
            fontSize: '16px',
            color: '#ffff00'
        });
        categoryText.setOrigin(0.5);
        categoryText.setScrollFactor(0);

        // Title
        const titleText = this.add.text(panelX, panelY - panelHeight/2 + 60, 'Caça-Palavras', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);

        // Instructions
        const instructionText = this.add.text(panelX, panelY - panelHeight/2 + 90, 'Encontre as palavras da lista', {
            fontSize: '14px',
            color: '#aaaaaa'
        });
        instructionText.setOrigin(0.5);
        instructionText.setScrollFactor(0);

        // Calculate offset to center the grid within the panel
        // Grid size: 9x9, Cell size: 30px => 270x270px
        const gridWidth = this.gridSize * this.cellSize;
        const gridHeight = this.gridSize * this.cellSize;
        
        // Calculate space used by header elements
        // Header: category (30px from top), title (60px from top), instructions (90px from top)
        // Total header height: ~120px from top of panel
        const headerHeight = 120;
        
        // Calculate available space below header
        const availableSpace = panelHeight - headerHeight;
        
        // Position grid centered in the remaining space
        const gridCenterY = panelY - panelHeight/2 + headerHeight + availableSpace/2;
        
        this.offsetX = panelX - gridWidth / 2;
        this.offsetY = gridCenterY - gridHeight / 2;

        // Initialize graphics layers
        this.gridGraphics = this.add.graphics();
        this.selectedGraphics = this.add.graphics();
        this.foundGraphics = this.add.graphics();

        // Generate the grid
        this.generateGrid();

        // Render the grid
        this.renderGrid();

        // Display word list (to the right of the grid)
        this.displayWordList(panelX, panelWidth);

        // Persist grid on first visit, restore found words on return
        if (isFirstVisit) {
            this.persistGrid();
        } else {
            this.restoreFoundWords();
        }

        // Close button (Icon image instead of text)
        this.closeButton = this.add.image(panelX + panelWidth / 2 - 24, panelY - panelHeight / 2 + 24, 'iconCross_brown')
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

        // ESC key to close
        this.input.keyboard?.on('keydown-ESC', () => {
            this.closeScene();
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
            const tooltip = this.add.text(panelX, panelY + panelHeight / 2 - 40, 'DICA: Se tiver dúvidas, procure o NPC Mentor\nda região no mapa para receber uma pista!', {
                fontSize: '14px',
                color: '#ffff00',
                backgroundColor: '#000000aa',
                padding: { x: 10, y: 5 },
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
            
            this.time.delayedCall(3000, () => tooltip.destroy());
        });

        // Setup input
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);
        this.input.on('pointerupoutside', this.onPointerUp, this);
    }

    private closeScene(): void {
        this.scene.stop();
        const unfoundCount = this.words.length - this.building.foundWords.length;
        if (unfoundCount > 0) {
            this.building.wrongAttempts++;
            this.mapScene.onQuizComplete(false, this.building);
        } else {
            this.mapScene.onQuizComplete(null, this.building);
        }
    }

    private generateGrid(): void {
        // Create empty grid
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = {
                    x: x,
                    y: y,
                    letter: '',
                    text: null as any,
                    selected: false,
                    found: false
                };
            }
        }

        if (this.building.gridLetters.length > 0) {
            // Restore from stored data
            this.building.wordPositions.forEach(wp => {
                for (let i = 0; i < wp.word.length; i++) {
                    const x = wp.startX + i * wp.dx;
                    const y = wp.startY + i * wp.dy;
                    this.grid[y][x].letter = wp.word[i];
                }
            });
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x].letter === '') {
                        this.grid[y][x].letter = this.building.gridLetters[y][x];
                    }
                }
            }
        } else {
            // Generate new grid
            for (const word of this.words) {
                const pos = this.placeWord(word);
                if (pos) {
                    this.building.wordPositions.push({ word, ...pos });
                }
            }

            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x].letter === '') {
                        this.grid[y][x].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
                    }
                }
            }
        }
    }

    private placeWord(word: string): { startX: number, startY: number, dx: number, dy: number } | null {
        const directions = [
            { dx: 1, dy: 0 },   // right
            { dx: 0, dy: 1 },   // down
            { dx: -1, dy: 0 },  // left
            { dx: 0, dy: -1 }   // up
        ];

        // Shuffle directions
        directions.sort(() => Math.random() - 0.5);

        for (const dir of directions) {
            // Try random starting positions
            for (let attempt = 0; attempt < 50; attempt++) {
                const startX = Math.floor(Math.random() * this.gridSize);
                const startY = Math.floor(Math.random() * this.gridSize);

                if (this.canPlaceWord(word, startX, startY, dir)) {
                    this.placeWordAt(word, startX, startY, dir);
                    return { startX, startY, dx: dir.dx, dy: dir.dy };
                }
            }
        }

        return null;
    }

    private canPlaceWord(word: string, startX: number, startY: number, dir: { dx: number; dy: number }): boolean {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * dir.dx;
            const y = startY + i * dir.dy;

            if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
                return false;
            }

            if (this.grid[y][x].letter !== '' && this.grid[y][x].letter !== word[i]) {
                return false;
            }
        }
        return true;
    }

    private placeWordAt(word: string, startX: number, startY: number, dir: { dx: number; dy: number }): void {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * dir.dx;
            const y = startY + i * dir.dy;
            this.grid[y][x].letter = word[i];
        }
    }

    private renderGrid() {
        // Draw grid background
        this.gridGraphics.clear();
        this.gridGraphics.fillStyle(0xffffff, 1);
        this.gridGraphics.fillRect(
            this.offsetX - 5,
            this.offsetY - 5,
            this.gridSize * this.cellSize + 10,
            this.gridSize * this.cellSize + 10
        );

        this.gridGraphics.lineStyle(2, 0x000000, 0.2);
        for (let i = 0; i <= this.gridSize; i++) {
            // Vertical lines
            this.gridGraphics.beginPath();
            this.gridGraphics.moveTo(this.offsetX + i * this.cellSize, this.offsetY);
            this.gridGraphics.lineTo(this.offsetX + i * this.cellSize, this.offsetY + this.gridSize * this.cellSize);
            this.gridGraphics.strokePath();

            // Horizontal lines
            this.gridGraphics.beginPath();
            this.gridGraphics.moveTo(this.offsetX, this.offsetY + i * this.cellSize);
            this.gridGraphics.lineTo(this.offsetX + this.gridSize * this.cellSize, this.offsetY + i * this.cellSize);
            this.gridGraphics.strokePath();
        }

        // Render letters
        const style = {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#000000',
            fontStyle: 'bold'
        };

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = this.grid[y][x];
                const textX = this.offsetX + x * this.cellSize + this.cellSize / 2;
                const textY = this.offsetY + y * this.cellSize + this.cellSize / 2;

                cell.text = this.add.text(textX, textY, cell.letter, style);
                cell.text.setOrigin(0.5);
                cell.text.setInteractive();
            }
        }
    }

    private displayWordList(panelX: number, panelWidth: number) {
        const textStyle = {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        };

        // Word list positioned to the right of the grid
        const listX = panelX + panelWidth / 2 - 60;
        // Position word list starting at the same Y as the grid top
        let yOffset = this.offsetY;

        const title = this.add.text(listX, yOffset, 'Palavras:', textStyle);
        title.setOrigin(0.5);
        this.wordListText.push(title);

        yOffset += 25;
        for (const word of this.words) {
            const text = this.add.text(listX, yOffset, word, textStyle);
            text.setOrigin(0.5);
            this.wordListText.push(text);
            yOffset += 25;
        }
    }

    private onPointerDown(pointer: Input.Pointer) {
        const gridX = Math.floor((pointer.x - this.offsetX) / this.cellSize);
        const gridY = Math.floor((pointer.y - this.offsetY) / this.cellSize);

        if (gridX >= 0 && gridX < this.gridSize && gridY >= 0 && gridY < this.gridSize) {
            this.isSelecting = true;
            this.selectedCells = [this.grid[gridY][gridX]];
            this.highlightSelectedCells();
        }
    }

    private onPointerMove(pointer: Input.Pointer) {
        if (!this.isSelecting) return;

        const gridX = Math.floor((pointer.x - this.offsetX) / this.cellSize);
        const gridY = Math.floor((pointer.y - this.offsetY) / this.cellSize);

        if (gridX >= 0 && gridX < this.gridSize && gridY >= 0 && gridY < this.gridSize) {
            const lastCell = this.selectedCells[this.selectedCells.length - 1];

            // Only add if adjacent and not already selected
            if (this.isAdjacent(lastCell, gridX, gridY) && !this.isCellSelected(gridX, gridY)) {
                this.selectedCells.push(this.grid[gridY][gridX]);
                this.highlightSelectedCells();
            }
        }
    }

    private onPointerUp() {
        if (!this.isSelecting) return;

        this.isSelecting = false;

        // Check if selected word matches any word
        const selectedWord = this.selectedCells.map(c => c.letter).join('');
        const reversedWord = selectedWord.split('').reverse().join('');

        if (this.words.includes(selectedWord) || this.words.includes(reversedWord)) {
            const word = this.words.includes(selectedWord) ? selectedWord : reversedWord;
            this.markWordAsFound(word);
        }

        // Clear selection
        this.selectedCells.forEach(cell => {
            if (!cell.found) {
                cell.selected = false;
            }
        });
        this.selectedCells = [];
        this.highlightSelectedCells();
    }

    private isAdjacent(cell: Cell, x: number, y: number): boolean {
        const dx = Math.abs(cell.x - x);
        const dy = Math.abs(cell.y - y);
        return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
    }

    private isCellSelected(x: number, y: number): boolean {
        return this.selectedCells.some(cell => cell.x === x && cell.y === y);
    }

    private highlightSelectedCells() {
        this.selectedGraphics.clear();

        // Highlight selected cells in yellow
        this.selectedGraphics.fillStyle(0xffff00, 0.5);
        for (const cell of this.selectedCells) {
            if (!cell.found) {
                this.selectedGraphics.fillRect(
                    this.offsetX + cell.x * this.cellSize + 2,
                    this.offsetY + cell.y * this.cellSize + 2,
                    this.cellSize - 4,
                    this.cellSize - 4
                );
            }
        }

        // Highlight found words in green
        this.foundGraphics.clear();
        this.foundGraphics.fillStyle(0x00ff00, 0.5);
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].found) {
                    this.foundGraphics.fillRect(
                        this.offsetX + x * this.cellSize + 2,
                        this.offsetY + y * this.cellSize + 2,
                        this.cellSize - 4,
                        this.cellSize - 4
                    );
                }
            }
        }
    }

    private markWordAsFound(word: string) {
        // Find the word in the grid and mark its cells
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].letter === word[0]) {
                    this.tryMarkWord(word, x, y);
                }
            }
        }

        // Update word list UI
        // wordListText[0] is the title "Palavras:", so we need to offset by 1
        const wordIndex = this.words.indexOf(word);
        if (wordIndex !== -1 && this.wordListText[wordIndex + 1]) {
            this.wordListText[wordIndex + 1].setColor('#00ff00');
            this.wordListText[wordIndex + 1].setStyle({ fontStyle: 'italic' });
        }

        this.foundWords.push(word);
        this.building.foundWords.push(word);
        this.highlightSelectedCells();

        // Check win condition
        if (this.foundWords.length === this.words.length) {
            this.showWinMessage();
        }
    }

    private tryMarkWord(word: string, startX: number, startY: number): boolean {
        const directions = [
            { dx: 1, dy: 0 },   // right
            { dx: 0, dy: 1 },   // down
            { dx: -1, dy: 0 },  // left
            { dx: 0, dy: -1 }   // up
        ];

        for (const dir of directions) {
            let found = true;
            const positions: { x: number, y: number }[] = [];

            for (let i = 0; i < word.length; i++) {
                const x = startX + i * dir.dx;
                const y = startY + i * dir.dy;

                if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize || this.grid[y][x].letter !== word[i]) {
                    found = false;
                    break;
                }

                positions.push({ x, y });
            }

            if (found) {
                // Mark the cells as found
                for (const pos of positions) {
                    this.grid[pos.y][pos.x].found = true;
                }
                return true;
            }
        }

        return false;
    }

    private showWinMessage() {
        // Disable inputs
        this.input.removeAllListeners();

        const winText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 150,
            'Parabéns! Você encontrou todas as palavras!',
            {
                fontSize: '20px',
                color: '#00ff00',
                fontStyle: 'bold'
            }
        );
        winText.setOrigin(0.5);
        winText.setScrollFactor(0);

        // Reset wrong attempts on correct answer
        this.building.wrongAttempts = 0;

        // Delay before closing on correct answer
        this.time.delayedCall(1000, () => {
            this.scene.stop();
            this.mapScene.onQuizComplete(true, this.building);
        });
    }

    private persistGrid(): void {
        // Store full grid letters (including filler) for restoration
        this.building.gridLetters = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.building.gridLetters[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.building.gridLetters[y][x] = this.grid[y][x].letter;
            }
        }
    }

    private restoreFoundWords(): void {
        for (const word of this.building.foundWords) {
            if (this.foundWords.includes(word)) continue;

            // Mark grid cells as found
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x].letter === word[0]) {
                        this.tryMarkWord(word, x, y);
                    }
                }
            }

            // Update word list UI
            const wordIndex = this.words.indexOf(word);
            if (wordIndex !== -1 && this.wordListText[wordIndex + 1]) {
                this.wordListText[wordIndex + 1].setColor('#00ff00');
                this.wordListText[wordIndex + 1].setStyle({ fontStyle: 'italic' });
            }

            this.foundWords.push(word);
        }

        // Redraw found cell highlights
        this.highlightSelectedCells();
    }
}
