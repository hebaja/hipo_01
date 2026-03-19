export interface MemoryGamePair {
    imageKey: string;
    word: string;
}

export interface MemoryGameCategoryData {
    pairs: MemoryGamePair[];
    hints: string[];
}

const memoryGameHints: string[] = [
    'Tente memorizar primeiro as cartas das bordas, pois elas são mais fáceis de localizar visualmente.',
    'Assim que souber a posição de um par, tente formá-lo imediatamente.',
    'Diga em voz alta o nome da figura e sua posição ao virá-la. Associar a imagem a um som ajuda o cérebro a fixar a informação.',
    'Comece virando cartas em uma ordem lógica, como da esquerda para a direita ou de cima para baixo. Isso ajuda a evitar repetições desnecessárias.',
    'Disponha as cartas em um padrão de grade (linhas e colunas). Isso facilita localizar onde uma carta específica foi vista anteriormente, em vez de tratá-las como um monte desordenado.'
];

export const memoryGameData: { [category: string]: MemoryGameCategoryData } = {
    'Pintura': {
        pairs: [
            { imageKey: 'dali', word: 'Dalí' },
            { imageKey: 'davinci', word: 'Da Vinci' },
            { imageKey: 'frida', word: 'Frida' },
            { imageKey: 'monet', word: 'Monet' },
            { imageKey: 'picasso', word: 'Picasso' },
            { imageKey: 'vangogh', word: 'Van Gogh' }
        ],
        hints: memoryGameHints
    },
    'Escultura': {
        pairs: [
            { imageKey: 'davi', word: 'Davi' },
            { imageKey: 'discobolo', word: 'Discóbolo' },
            { imageKey: 'moai', word: 'Moái' },
            { imageKey: 'o_beijo', word: 'O Beijo' },
            { imageKey: 'o_pensador', word: 'O Pensador' },
            { imageKey: 'venus', word: 'Vênus' }
        ],
        hints: memoryGameHints
    },
    'Música': {
        pairs: [
            { imageKey: 'bateria', word: 'Bateria' },
            { imageKey: 'flauta', word: 'Flauta' },
            { imageKey: 'piano', word: 'Piano' },
            { imageKey: 'trompete', word: 'Trompete' },
            { imageKey: 'violao', word: 'Violão' },
            { imageKey: 'violino', word: 'Violino' }
        ],
        hints: memoryGameHints
    },
    'Dança': {
        pairs: [
            { imageKey: 'bale', word: 'Ballet' },
            { imageKey: 'contemporanea', word: 'Contemporânea' },
            { imageKey: 'flamenco', word: 'Flamenco' },
            { imageKey: 'hip-hip', word: 'Hip Hop' },
            { imageKey: 'salsa', word: 'Salsa' },
            { imageKey: 'sapateado', word: 'Sapateado' }
        ],
        hints: memoryGameHints
    },
    'Fotografia': {
        pairs: [
            { imageKey: 'armazenamento', word: 'Armazenamento' },
            { imageKey: 'camera_de_filme', word: 'Câmera de Filme' },
            { imageKey: 'camera_dslr', word: 'Câmera DSLR' },
            { imageKey: 'camera_instantanea', word: 'Câmera Instantânea' },
            { imageKey: 'flash_externo', word: 'Flash Externo' },
            { imageKey: 'tripe', word: 'Tripé' }
        ],
        hints: memoryGameHints
    },
    'Teatro': {
        pairs: [
            { imageKey: 'assento', word: 'Assento' },
            { imageKey: 'bilhetes', word: 'Bilhetes' },
            { imageKey: 'candelabro', word: 'Candelabro' },
            { imageKey: 'cortinas', word: 'Cortinas' },
            { imageKey: 'holofote', word: 'Holofote' },
            { imageKey: 'mascaras', word: 'Máscaras' }
        ],
        hints: memoryGameHints
    }
};

export function getMemoryGameForCategory(category: string): MemoryGameCategoryData {
    return memoryGameData[category] || memoryGameData['Pintura']; // Default fallback
}
