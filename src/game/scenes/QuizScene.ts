import { Scene } from 'phaser';
import { Question } from '../data/questions';
import { Building } from '../data/buildings';
import { MapScene } from './MapScene';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';
import cursorHandPng from '../../assets/ui/PNG/cursorHand_beige.png';

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
        // Set custom default cursor
        this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);

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

        // Quiz panel background (using NineSlice instead of Rectangle)
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

        // Question text
        const questionText = this.add.text(panelX, panelY - 80, this.question.question, {
            fontFamily: 'Kenney Pixel',
            fontSize: '20px',
            color: '#ffffff',
            wordWrap: { width: panelWidth - 40 },
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        questionText.setOrigin(0.5);
        questionText.setScrollFactor(0);

        // Category label
        const categoryText = this.add.text(panelX, panelY - 120, `[${this.building.category}]`, {
            fontFamily: 'Kenney Pixel',
            fontSize: '16px',
            color: '#ffff00',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        categoryText.setOrigin(0.5);
        categoryText.setScrollFactor(0);

        // Create option buttons with adaptive difficulty
        const buttonHeight = 50;
        const buttonWidth = panelWidth - 40;
        const startY = panelY - 20;
        const spacing = 10;

        // Determine how many options to show based on wrong attempts
        // Start with 4 options, reduce by 1 for each wrong attempt (min 2)
        const optionsToShow = Math.max(2, 4 - this.building.wrongAttempts);
        
        // Always include the correct answer, randomly select other options
        const correctIndex = this.question.answer;
        const selectedIndices = new Set<number>();
        selectedIndices.add(correctIndex);
        
        // Add random incorrect options until we have the desired count
        const incorrectIndices = [];
        for (let i = 0; i < this.question.options.length; i++) {
            if (i !== correctIndex) {
                incorrectIndices.push(i);
            }
        }
        
        // Shuffle incorrect indices and take what we need
        for (let i = incorrectIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [incorrectIndices[i], incorrectIndices[j]] = [incorrectIndices[j], incorrectIndices[i]];
        }
        
        for (let i = 0; i < optionsToShow - 1; i++) {
            if (i < incorrectIndices.length) {
                selectedIndices.add(incorrectIndices[i]);
            }
        }
        
        // Sort selected indices to maintain order
        const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
        
        // Create buttons for selected options
        sortedIndices.forEach((originalIndex, displayIndex) => {
            const option = this.question.options[originalIndex];
            const buttonY = startY + displayIndex * (buttonHeight + spacing);
            
            // Use nineslice image for button
            const button = this.add.nineslice(
                panelX, 
                buttonY, 
                'buttonLong_beige', 
                0, 
                buttonWidth, 
                buttonHeight,
                15, 15, 15, 15
            );
            button.setScrollFactor(0);
            button.setInteractive({ cursor: `url(${cursorHandPng}), pointer` });
            
            const buttonText = this.add.text(panelX, buttonY, option, {
                fontFamily: 'Kenney Pixel',
                fontSize: '18px',
                color: '#5c4033',
                fontStyle: 'bold'
            });
            buttonText.setOrigin(0.5);
            buttonText.setScrollFactor(0);
            
            // Store button reference with original index for answer checking
            this.optionButtons.push({ button, buttonText, index: originalIndex });

            // Handle click
            button.on('pointerdown', () => {
                this.sound.play('click', { volume: 0.3 });
                this.selectAnswer(originalIndex);
            });
            
            // Hover effect (change texture to pressed version)
            button.on('pointerover', () => {
                this.input.setDefaultCursor(`url(${cursorHandPng}), pointer`);
                button.setTexture('buttonLong_beige_pressed');
            });
            
            button.on('pointerout', () => {
                this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);
                button.setTexture('buttonLong_beige');
            });
        });

        // Add help button (?) in the top-left corner
        const helpButton = this.add.container(panelX - panelWidth / 2 + 24, panelY - panelHeight / 2 + 24);
        const helpBg = this.add.image(0, 0, 'buttonSquare_beige').setScale(0.8);
        const helpText = this.add.text(0, 0, '?', {
            fontFamily: 'Kenney Pixel',
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
            const tooltip = this.add.text(panelX, panelY + panelHeight / 2 - 30, 'DICA: Se tiver dúvidas, procure o NPC Mentor\nda região no mapa para receber uma pista!', {
                fontFamily: 'Kenney Pixel',
                fontSize: '14px',
                color: '#ffff00',
                backgroundColor: '#000000aa',
                padding: { x: 10, y: 5 },
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
            
            this.time.delayedCall(3000, () => tooltip.destroy());
        });


        // Close button (Icon image instead of text)
        // Adjust position relative to the panel corners
        const closeButton = this.add.image(panelX + panelWidth / 2 - 24, panelY - panelHeight / 2 + 24, 'iconCross_brown')
            .setInteractive({ cursor: `url(${cursorHandPng}), pointer` })
            .setOrigin(0.5);
        closeButton.setScrollFactor(0);

        closeButton.on('pointerdown', () => {
            this.closeScene();
        });

        // Add visual cue on hover
        closeButton.on('pointerover', () => {
             closeButton.setTint(0xffbbbb); // Light red tint
        });

        closeButton.on('pointerout', () => {
             closeButton.clearTint();
        });

        // ESC key to close
        this.input.keyboard?.on('keydown-ESC', () => {
            this.closeScene();
        });
    }

    private closeScene(): void {
        this.scene.stop();
        this.mapScene.onQuizComplete(null, this.building);
    }

    private selectAnswer(selectedIndex: number) {
        const isCorrect = selectedIndex === this.question.answer;
        
        // Disable all buttons immediately
        this.optionButtons.forEach(({ button }) => {
            button.disableInteractive();
        });

        if (isCorrect) {
            // Show success feedback for correct answers
            const correctButtonData = this.optionButtons.find(btn => btn.index === selectedIndex);
            if (correctButtonData) {
                correctButtonData.button.setTint(0x77ff77); // Green tint
                this.sound.play('correct', { volume: 0.5 });
            }
            
            const resultText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 130,
                '✓ Correto!',
                {
                    fontFamily: 'Kenney Pixel',
                    fontSize: '24px',
                    color: '#00ff00',
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
                }
            );
            resultText.setOrigin(0.5);
            resultText.setScrollFactor(0);

            // Reset wrong attempts on correct answer
            this.building.wrongAttempts = 0;

            // Delay before closing on correct answer
            this.time.delayedCall(1000, () => {
                this.scene.stop();
                this.mapScene.onQuizComplete(true, this.building);
            });
        } else {
            // Wrong answer: Increment wrong attempts counter
            this.building.wrongAttempts++;
            console.log(`[QUIZ] Wrong answer! ${this.building.category} wrongAttempts now: ${this.building.wrongAttempts}`);
            
            // Highlight the selected wrong option in red
            const selectedButtonData = this.optionButtons.find(btn => btn.index === selectedIndex);
            if (selectedButtonData) {
                selectedButtonData.button.setTint(0xff7777); // Red tint
                this.sound.play('wrong', { volume: 0.5 });
            }
            
            // Wait briefly before closing (500ms for visual feedback)
            this.time.delayedCall(500, () => {
                this.scene.stop();
                this.mapScene.onQuizComplete(false, this.building);
            });
        }
    }
}