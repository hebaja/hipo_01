import { Scene, GameObjects } from 'phaser';
import { Building } from '../data/buildings';
import { MapScene } from './MapScene';
import { PAINTER_FACTS, PainterData, Fact } from '../data/twoTruthsOneLie';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';
import cursorHandPng from '../../assets/ui/PNG/cursorHand_beige.png';

export class TwoTruthsOneLieScene extends Scene {
    private building!: Building;
    private mapScene!: MapScene;
    private currentPainter!: PainterData;
    private currentFacts!: Fact[];
    private factButtons: GameObjects.Text[] = [];
    private clueText!: GameObjects.Text;
    private resultText!: GameObjects.Text;
    private closeButton!: GameObjects.Image;

    constructor() {
        super('TwoTruthsOneLieScene');
    }

    init(data: any) {
        this.building = data.building;
        this.mapScene = data.mapScene;
    }

    create() {
        // Set custom default cursor
        this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);

        // Clear any existing buttons from previous sessions
        this.factButtons = [];

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
        const panelWidth = 500;
        const panelHeight = 400; // Increased height for 3 buttons
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
            color: '#ffff00',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        categoryText.setOrigin(0.5);
        categoryText.setScrollFactor(0);

        // Title
        const titleText = this.add.text(panelX, panelY - panelHeight/2 + 60, 'Duas Verdades e uma Mentira', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);

        // Initialize game state
        this.startGame(panelX, panelY, panelWidth);

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

        this.input.keyboard?.on('keydown-ESC', () => {
            this.closeScene();
        });

        // Add help button (?) in the top-left corner
        const helpButton = this.add.container(panelX - panelWidth / 2 + 24, panelY - panelHeight / 2 + 24);
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
            const tooltip = this.add.text(panelX, panelY + 130, 'DICA: Se tiver dúvidas, procure o NPC Mentor\nda região no mapa para receber uma pista!', {
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
        this.mapScene.onQuizComplete(null, this.building);
    }

    private startGame(panelX: number, panelY: number, panelWidth: number) {
        // Select painter: reuse stored index if already assigned, otherwise pick random
        let painterIndex: number;
        if (this.building.painterIndex >= 0) {
            painterIndex = this.building.painterIndex;
        } else {
            painterIndex = Math.floor(Math.random() * PAINTER_FACTS.length);
            this.building.painterIndex = painterIndex;
        }
        this.currentPainter = PAINTER_FACTS[painterIndex];

        // Shuffle facts
        this.currentFacts = [...this.currentPainter.facts].sort(() => Math.random() - 0.5);

        // Create Fact Buttons
        const buttonHeight = 50;
        const buttonWidth = panelWidth - 40;
        const startY = panelY - 20;
        const spacing = 10;

        for (let i = 0; i < 3; i++) {
            const buttonY = startY + i * (buttonHeight + spacing);

            // Use nineslice image for button (similar to QuizScene)
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

            const buttonText = this.add.text(panelX, buttonY, this.currentFacts[i].text, {
                fontSize: '16px',
                color: '#5c4033',
                fontStyle: 'bold',
                wordWrap: { width: buttonWidth - 20, useAdvancedWrap: true },
                align: 'center',
            });
            buttonText.setOrigin(0.5);
            buttonText.setScrollFactor(0);

            this.factButtons.push(buttonText);

            // Handle click
            button.on('pointerdown', () => {
                this.checkAnswer(i);
            });

            // Hover effect
            button.on('pointerover', () => {
                button.setTexture('buttonLong_beige_pressed');
            });

            button.on('pointerout', () => {
                button.setTexture('buttonLong_beige');
            });
        }

        // Clue Text (initially hidden)
        this.clueText = this.add.text(panelX, panelY + 130, "", {
            fontSize: '14px',
            color: '#ffff00',
            align: 'center',
            wordWrap: { width: panelWidth - 40 },
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        this.clueText.setOrigin(0.5);
        this.clueText.setScrollFactor(0);
        this.clueText.setVisible(false);

        // Result Text (initially hidden)
        this.resultText = this.add.text(panelX, panelY + 170, "", {
            fontSize: '24px',
            color: '#00ff00',
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        this.resultText.setOrigin(0.5);
        this.resultText.setScrollFactor(0);
        this.resultText.setVisible(false);
    }

    private checkAnswer(index: number) {
        const fact = this.currentFacts[index];

        // Disable all buttons immediately
        this.factButtons.forEach(btn => btn.disableInteractive());

        if (!fact.isTrue) {
            // Correct - Found the Lie
            // Highlight the correct lie button
            this.factButtons[index].setStyle({ backgroundColor: '#27ae60', color: '#ffffff' });
            
            this.resultText.setText("Parabéns! Você encontrou a mentira!");
            this.resultText.setVisible(true);

            // Reset wrong attempts on correct answer
            this.building.wrongAttempts = 0;

            // Delay before closing on correct answer
            this.time.delayedCall(1000, () => {
                this.scene.stop();
                this.mapScene.onQuizComplete(true, this.building);
            });
        } else {
            // Wrong - Clicked on a Truth
            this.factButtons[index].setStyle({ backgroundColor: '#e74c3c', color: '#ffffff' });

            // Show clue based on painter
            let clue = "";
            if (this.currentPainter.name === "Picasso") {
                clue = "Dica: Picasso passou por vários períodos artísticos, incluindo o Cubismo.";
            } else if (this.currentPainter.name === "Monet") {
                clue = "Dica: Monet é famoso por suas pinturas ao ar livre capturando a luz.";
            } else if (this.currentPainter.name === "Frida Kahlo") {
                clue = "Dica: Frida Kahlo ficou confinada à cama por meses após um acidente, onde começou a pintar.";
            }

            this.clueText.setText(clue);
            this.clueText.setVisible(true);

            // Increment wrong attempts
            this.building.wrongAttempts++;

            // Wait briefly before closing (500ms for visual feedback)
            this.time.delayedCall(1000, () => {
                this.scene.stop();
                this.mapScene.onQuizComplete(false, this.building);
            });
        }
    }
}
