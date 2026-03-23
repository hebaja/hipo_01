import { Scene } from 'phaser';
import panelBrownPng from '../../assets/ui/PNG/panel_brown.png';
import buttonLongBeigePng from '../../assets/ui/PNG/buttonLong_beige.png';
import buttonLongBeigePressedPng from '../../assets/ui/PNG/buttonLong_beige_pressed.png';
import iconCrossBrownPng from '../../assets/ui/PNG/iconCross_brown.png';
import cursorGauntletPng from '../../assets/ui/PNG/cursorGauntlet_bronze.png';
import cursorHandPng from '../../assets/ui/PNG/cursorHand_beige.png';

export class LoreScene extends Scene {
    constructor() {
        super('LoreScene');
    }

    preload() {
        this.load.image('panel_brown', panelBrownPng);
        this.load.image('buttonLong_beige', buttonLongBeigePng);
        this.load.image('buttonLong_beige_pressed', buttonLongBeigePressedPng);
        this.load.image('iconCross_brown', iconCrossBrownPng);
        this.load.audio('click', 'assets/audio/click.mp3');
    }

    create() {
        this.input.setDefaultCursor(`url(${cursorGauntletPng}), default`);

        const panelWidth = 600;
        const panelHeight = 450;
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

        const closeButton = this.add.image(panelX + panelWidth / 2 - 24, panelY - panelHeight / 2 + 24, 'iconCross_brown')
            .setInteractive({ cursor: `url(${cursorHandPng}), pointer` })
            .setOrigin(0.5);
        closeButton.setScrollFactor(0);

        closeButton.on('pointerdown', () => {
            this.startMapScene();
        });

        closeButton.on('pointerover', () => {
            closeButton.setTint(0xffbbbb);
        });

        closeButton.on('pointerout', () => {
            closeButton.clearTint();
        });

        const titleText = this.add.text(panelX, panelY - panelHeight / 2 + 40, 'BEM-VINDO, EXPLORADOR!\n', {
            fontSize: '24px',
            color: '#ffd700',
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        titleText.setOrigin(0.5);
        titleText.setScrollFactor(0);

        const loreText = `Em um mundo onde arte e história se entrelaçam,
você é um aventureiro em busca de conhecimento.

Sua missão: explorar cidades misteriosas,
cada uma representando uma época da história da arte.

Para conquistar os edifícios, você deverá resolver
desafios culturais: quizzes, anagramas, caça-palavras,
memória e muito mais.

A cada edifício conquistado, você acumula pontos
e descobre conhecimentos sobre grandes artistas.

Boa sorte, explorador! Que sua jornada seja
repleta de descobertas artísticas!`;

        const textLines = this.add.text(panelX, panelY - 20, loreText, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 4,
            wordWrap: { width: panelWidth - 60, useAdvancedWrap: true }
        });
        textLines.setOrigin(0.5);
        textLines.setScrollFactor(0);

        const continueButton = this.add.nineslice(
            panelX,
            panelY + panelHeight / 2 - 50,
            'buttonLong_beige',
            0,
            180,
            45,
            15, 15, 15, 15
        );
        continueButton.setScrollFactor(0);
        continueButton.setInteractive({ cursor: `url(${cursorHandPng}), pointer` });

        const continueText = this.add.text(panelX, panelY + panelHeight / 2 - 50, 'COMEÇAR', {
            fontSize: '18px',
            color: '#5c4033',
            fontStyle: 'bold'
        });
        continueText.setOrigin(0.5);
        continueText.setScrollFactor(0);

        continueButton.on('pointerover', () => {
            continueButton.setTexture('buttonLong_beige_pressed');
        });

        continueButton.on('pointerout', () => {
            continueButton.setTexture('buttonLong_beige');
        });

        continueButton.on('pointerdown', () => {
            this.startMapScene();
        });

        this.input.keyboard!.on('keydown-ENTER', () => {
            this.startMapScene();
        });

        this.input.keyboard!.on('keydown-ESC', () => {
            this.startMapScene();
        });
    }

    private startMapScene() {
        if (this.sound.get('click')) {
            this.sound.play('click', { volume: 0.3 });
        }
        this.scale.startFullscreen();
        this.scene.start('MapScene');
    }
}
