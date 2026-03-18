export interface MemoryGamePair {
    imageKey: string;
    word: string;
}

export interface MemoryGameCategoryData {
    pairs: MemoryGamePair[];
}

export const memoryGameData: { [category: string]: MemoryGameCategoryData } = {
    'Pintura': {
        pairs: [
            { imageKey: 'dali', word: 'Dalí' },
            { imageKey: 'davinci', word: 'Da Vinci' },
            { imageKey: 'frida', word: 'Frida' },
            { imageKey: 'monet', word: 'Monet' },
            { imageKey: 'picasso', word: 'Picasso' },
            { imageKey: 'vangogh', word: 'Van Gogh' }
        ]
    },
    'Escultura': {
        pairs: [
            { imageKey: 'davi', word: 'Davi' },
            { imageKey: 'discobolo', word: 'Discóbolo' },
            { imageKey: 'moai', word: 'Moái' },
            { imageKey: 'o_beijo', word: 'O Beijo' },
            { imageKey: 'o_pensador', word: 'O Pensador' },
            { imageKey: 'venus', word: 'Vênus' }
        ]
    },
    'Música': {
        pairs: [
            { imageKey: 'bateria', word: 'Bateria' },
            { imageKey: 'flauta', word: 'Flauta' },
            { imageKey: 'piano', word: 'Piano' },
            { imageKey: 'trompete', word: 'Trompete' },
            { imageKey: 'violao', word: 'Violão' },
            { imageKey: 'violino', word: 'Violino' }
        ]
    },
    'Dança': {
        pairs: [
            { imageKey: 'bale', word: 'Ballet' },
            { imageKey: 'contemporanea', word: 'Contemporânea' },
            { imageKey: 'flamenco', word: 'Flamenco' },
            { imageKey: 'hip-hip', word: 'Hip Hop' },
            { imageKey: 'salsa', word: 'Salsa' },
            { imageKey: 'sapateado', word: 'Sapateado' }
        ]
    },
    'Fotografia': {
        pairs: [
            { imageKey: 'armazenamento', word: 'Armazenamento' },
            { imageKey: 'camera_de_filme', word: 'Câmera de Filme' },
            { imageKey: 'camera_dslr', word: 'Câmera DSLR' },
            { imageKey: 'camera_instantanea', word: 'Câmera Instantânea' },
            { imageKey: 'flash_externo', word: 'Flash Externo' },
            { imageKey: 'tripe', word: 'Tripé' }
        ]
    },
    'Teatro': {
        pairs: [
            { imageKey: 'assento', word: 'Assento' },
            { imageKey: 'bilhetes', word: 'Bilhetes' },
            { imageKey: 'candelabro', word: 'Candelabro' },
            { imageKey: 'cortinas', word: 'Cortinas' },
            { imageKey: 'holofote', word: 'Holofote' },
            { imageKey: 'mascaras', word: 'Máscaras' }
        ]
    }
};

export function getMemoryGameForCategory(category: string): MemoryGameCategoryData {
    return memoryGameData[category] || memoryGameData['Pintura']; // Default fallback
}
