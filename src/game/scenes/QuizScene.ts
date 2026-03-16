import { Scene } from 'phaser';
import { Question } from '../data/questions';
import { Building } from '../data/buildings';
import { MapScene } from './MapScene';

export class QuizScene extends Scene {
    private question!: Question;
    private building!: Building;
    private mapScene!: MapScene;
    private optionButtons: any[] = [];

    constructor() {
        super('QuizScene');
    }

    init(data: any) {
        this.question = data.question;
        this.building = data.building;
        this.mapScene = data.mapScene;
    }

    create() {
        // Clear any existing buttons from previous sessions
        this.optionButtons = [];

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

        // Quiz panel background
        const panelWidth = 500;
        const panelHeight = 300;
        const panelX = this.cameras.main.width / 2;
        const panelY = this.cameras.main.height / 2;

        const panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x333333, 1);
        panel.setScrollFactor(0);
        panel.setStrokeStyle(2, 0xffffff);

        // Question text
        const questionText = this.add.text(panelX, panelY - 80, this.question.question, {
            fontSize: '20px',
            color: '#ffffff',
            wordWrap: { width: panelWidth - 40 },
            align: 'center'
        });
        questionText.setOrigin(0.5);
        questionText.setScrollFactor(0);

        // Category label
        const categoryText = this.add.text(panelX, panelY - 120, `[${this.building.category}]`, {
            fontSize: '16px',
            color: '#ffff00'
        });
        categoryText.setOrigin(0.5);
        categoryText.setScrollFactor(0);

        // Create option buttons
        const buttonHeight = 50;
        const buttonWidth = panelWidth - 40;
        const startY = panelY - 20;
        const spacing = 10;

        this.question.options.forEach((option, index) => {
            const buttonY = startY + index * (buttonHeight + spacing);
            
            const button = this.add.rectangle(panelX, buttonY, buttonWidth, buttonHeight, 0x555555, 1);
            button.setScrollFactor(0);
            button.setStrokeStyle(1, 0x888888);
            button.setInteractive();
            
            const buttonText = this.add.text(panelX, buttonY, option, {
                fontSize: '16px',
                color: '#ffffff'
            });
            buttonText.setOrigin(0.5);
            buttonText.setScrollFactor(0);
            
            // Store button reference
            this.optionButtons.push({ button, buttonText, index });

            // Handle click
            button.on('pointerdown', () => {
                this.selectAnswer(index);
            });
            
            // Hover effect
            button.on('pointerover', () => {
                button.setFillStyle(0x777777, 1);
            });
            
            button.on('pointerout', () => {
                button.setFillStyle(0x555555, 1);
            });
        });

        // Instructions text
        const instructionText = this.add.text(panelX, panelY + 130, 'Click an option to answer', {
            fontSize: '14px',
            color: '#aaaaaa'
        });
        instructionText.setOrigin(0.5);
        instructionText.setScrollFactor(0);
    }

    private selectAnswer(selectedIndex: number) {
        const isCorrect = selectedIndex === this.question.answer;
        
        // Highlight correct/wrong answers
        this.optionButtons.forEach(({ button, index }) => {
            button.disableInteractive();
            
            if (index === this.question.answer) {
                button.setFillStyle(0x00aa00, 1); // Green for correct
            } else if (index === selectedIndex && !isCorrect) {
                button.setFillStyle(0xaa0000, 1); // Red for wrong selection
            } else {
                button.setFillStyle(0x333333, 1); // Dim others
            }
        });

        // Show result feedback
        const resultText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 130,
            isCorrect ? '✓ Correct!' : '✗ Wrong!',
            {
                fontSize: '20px',
                color: isCorrect ? '#00ff00' : '#ff0000'
            }
        );
        resultText.setOrigin(0.5);
        resultText.setScrollFactor(0);

        // Close quiz after delay
        this.time.delayedCall(1000, () => {
            this.scene.stop();
            this.mapScene.onQuizComplete(isCorrect, this.building);
        });
    }
}