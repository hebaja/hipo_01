export interface Question {
    category: string;
    question: string;
    options: string[];
    answer: number;
}

export const quizQuestions: Question[] = [
    // Sculpture
    {
        category: 'Escultura',
        question: 'De que material é feito o David de Michelangelo?',
        options: ['Mármore', 'Argila', 'Bronze', 'Madeira'],
        answer: 0
    },
    {
        category: 'Escultura',
        question: 'Quem esculpiu "O Pensador"?',
        options: ['Michelangelo', 'Rodin', 'Bernini', 'Donatello'],
        answer: 1
    },
    // Painting
    {
        category: 'Pintura',
        question: 'Quem pintou a Mona Lisa?',
        options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
        answer: 1
    },
    {
        category: 'Pintura',
        question: 'Qual artista é conhecido por "Noite Estrelada"?',
        options: ['Picasso', 'Van Gogh', 'Monet', 'Dali'],
        answer: 1
    },
    // Photography
    {
        category: 'Fotografia',
        question: 'Quem é considerado o inventor da fotografia?',
        options: ['Niepce', 'Eiffel', 'Bell', 'Edison'],
        answer: 0
    },
    {
        category: 'Fotografia',
        question: 'O que significa DSLR?',
        options: ['Digital Single Lens Reflex', 'Digital Sound Light Record', 'Direct Single Lens React', 'Digital Simple Lens Reflex'],
        answer: 0
    },
    // Music
    {
        category: 'Música',
        question: 'Quantas teclas tem um piano padrão?',
        options: ['66', '77', '88', '99'],
        answer: 2
    },
    {
        category: 'Música',
        question: 'Quem compôs a "Sonata ao Luar"?',
        options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
        answer: 2
    },
    // Dance
    {
        category: 'Dança',
        question: 'De que país é o balé?',
        options: ['Itália', 'França', 'Rússia', 'Espanha'],
        answer: 1
    },
    {
        category: 'Dança',
        question: 'Qual estilo de dança teve origem em Cuba?',
        options: ['Tango', 'Salsa', 'Valsa', 'Foxtrot'],
        answer: 1
    },
    // Theater
    {
        category: 'Teatro',
        question: 'Quem escreveu Romeu e Julieta?',
        options: ['Dickens', 'Shakespeare', 'Hemingway', 'Austen'],
        answer: 1
    },
    {
        category: 'Teatro',
        question: 'Qual é o nome do famoso distrito teatral de Nova York?',
        options: ['Broadway', 'Hollywood', 'West End', 'Off-Broadway'],
        answer: 0
    }
];

export const categories = [
    { name: 'Escultura', color: 0x8B4513 },
    { name: 'Pintura', color: 0xFF6347 },
    { name: 'Fotografia', color: 0x4169E1 },
    { name: 'Música', color: 0x9370DB },
    { name: 'Dança', color: 0xFF69B4 },
    { name: 'Teatro', color: 0xFFD700 }
];