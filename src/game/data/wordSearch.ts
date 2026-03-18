export interface WordSearchData {
    words: string[];
}

export const wordSearchData: { [category: string]: WordSearchData } = {
    'Escultura': {
        words: ['DAVID', 'RODIN', 'PENSADOR']
    },
    'Pintura': {
        words: ['MONALISA', 'PICASSO', 'MONET']
    },
    'Fotografia': {
        words: ['DAGUERRE', 'LENTE', 'CAMERA']
    },
    'Música': {
        words: ['MOZART', 'PIANO', 'BEETHOVEN']
    },
    'Dança': {
        words: ['BALLET', 'SALSA', 'TANGO']
    },
    'Teatro': {
        words: ['BROADWAY', 'DRAMA', 'ATOR']
    }
};

export function getWordSearchForCategory(category: string): WordSearchData {
    return wordSearchData[category] || wordSearchData['Escultura']; // Default fallback
}
