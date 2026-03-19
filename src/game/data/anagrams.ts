export interface Anagram {
    name: string;
    scrambled: string;
    genericHint: string;
    specificHint: string;
    hints: string[];
}

export const anagramData: { [category: string]: Anagram } = {
    'Escultura': {
        name: 'DAVID',
        scrambled: 'VADID',
        genericHint: 'Pense em uma famosa escultura de mármore',
        specificHint: 'A famosa escultura de Michelangelo',
        hints: [
            'Pense em uma famosa escultura de mármore',
            'A famosa escultura de Michelangelo'
        ]
    },
    'Pintura': {
        name: 'MONALISA',
        scrambled: 'SALAIMON',
        genericHint: 'Pense em uma pintura mundialmente famosa',
        specificHint: 'A obra-prima de Leonardo da Vinci',
        hints: [
            'Pense em uma pintura mundialmente famosa',
            'A obra-prima de Leonardo da Vinci'
        ]
    },
    'Fotografia': {
        name: 'DAGUERRE',
        scrambled: 'GERUDEAR',
        genericHint: 'Pense no inventor da fotografia',
        specificHint: 'Inventor do daguerreótipo',
        hints: [
            'Pense no inventor da fotografia',
            'Inventor do daguerreótipo'
        ]
    },
    'Música': {
        name: 'MOZART',
        scrambled: 'ZATROM',
        genericHint: 'Pense em um famoso compositor clássico',
        specificHint: 'Compositor clássico da Áustria',
        hints: [
            'Pense em um famoso compositor clássico',
            'Compositor clássico da Áustria'
        ]
    },
    'Dança': {
        name: 'BALLET',
        scrambled: 'TEBLAL',
        genericHint: 'Pense em uma forma de dança clássica',
        specificHint: 'Forma de dança clássica',
        hints: [
            'Pense em uma forma de dança clássica',
            'Forma de dança clássica'
        ]
    },
    'Teatro': {
        name: 'SHAKESPEARE',
        scrambled: 'KASPEEHARES',
        genericHint: 'Pense em um famoso dramaturgo inglês',
        specificHint: 'Dramaturgo e poeta inglês',
        hints: [
            'Pense em um famoso dramaturgo inglês',
            'Dramaturgo e poeta inglês'
        ]
    }
};

export function getAnagramForCategory(category: string): Anagram {
    return anagramData[category] || anagramData['Escultura']; // Default fallback
}
