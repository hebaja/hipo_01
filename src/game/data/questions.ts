export interface Question {
    category: string;
    question: string;
    options: string[];
    answer: number;
}

export const quizQuestions: Question[] = [
    // Sculpture
    {
        category: 'Sculpture',
        question: 'De que material é feito o David de Michelangelo?',
        options: ['Mármore', 'Argila', 'Bronze', 'Madeira'],
        answer: 0
    },
    {
        category: 'Sculpture',
        question: 'Quem esculpiu "O Pensador"?',
        options: ['Michelangelo', 'Rodin', 'Bernini', 'Donatello'],
        answer: 1
    },
    // Painting
    {
        category: 'Painting',
        question: 'Quem pintou a Mona Lisa?',
        options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
        answer: 1
    },
    {
        category: 'Painting',
        question: 'Qual artista é conhecido por "Noite Estrelada"?',
        options: ['Picasso', 'Van Gogh', 'Monet', 'Dali'],
        answer: 1
    },
    // Photography
    {
        category: 'Photography',
        question: 'Quem é considerado o inventor da fotografia?',
        options: ['Niepce', 'Eiffel', 'Bell', 'Edison'],
        answer: 0
    },
    {
        category: 'Photography',
        question: 'O que significa DSLR?',
        options: ['Digital Single Lens Reflex', 'Digital Sound Light Record', 'Direct Single Lens React', 'Digital Simple Lens Reflex'],
        answer: 0
    },
    // Music
    {
        category: 'Music',
        question: 'Quantas teclas tem um piano padrão?',
        options: ['66', '77', '88', '99'],
        answer: 2
    },
    {
        category: 'Music',
        question: 'Quem compôs a "Sonata ao Luar"?',
        options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
        answer: 2
    },
    // Dance
    {
        category: 'Dance',
        question: 'De que país é o balé?',
        options: ['Itália', 'França', 'Rússia', 'Espanha'],
        answer: 1
    },
    {
        category: 'Dance',
        question: 'Qual estilo de dança teve origem em Cuba?',
        options: ['Tango', 'Salsa', 'Valsa', 'Foxtrot'],
        answer: 1
    },
    // Theater
    {
        category: 'Theater',
        question: 'Quem escreveu Romeu e Julieta?',
        options: ['Dickens', 'Shakespeare', 'Hemingway', 'Austen'],
        answer: 1
    },
    {
        category: 'Theater',
        question: 'Qual é o nome do famoso distrito teatral de Nova York?',
        options: ['Broadway', 'Hollywood', 'West End', 'Off-Broadway'],
        answer: 0
    }
];

export const categories = [
    { name: 'Sculpture', color: 0x8B4513 },
    { name: 'Painting', color: 0xFF6347 },
    { name: 'Photography', color: 0x4169E1 },
    { name: 'Music', color: 0x9370DB },
    { name: 'Dance', color: 0xFF69B4 },
    { name: 'Theater', color: 0xFFD700 }
];