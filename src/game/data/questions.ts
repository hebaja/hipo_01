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
        question: 'What material is Michelangelo\'s David made of?',
        options: ['Marble', 'Clay', 'Bronze', 'Wood'],
        answer: 0
    },
    {
        category: 'Sculpture',
        question: 'Who sculpted "The Thinker"?',
        options: ['Michelangelo', 'Rodin', 'Bernini', 'Donatello'],
        answer: 1
    },
    // Painting
    {
        category: 'Painting',
        question: 'Who painted the Mona Lisa?',
        options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
        answer: 1
    },
    {
        category: 'Painting',
        question: 'Which artist is known for "Starry Night"?',
        options: ['Picasso', 'Van Gogh', 'Monet', 'Dali'],
        answer: 1
    },
    // Photography
    {
        category: 'Photography',
        question: 'Who is considered the inventor of photography?',
        options: ['Niepce', 'Eiffel', 'Bell', 'Edison'],
        answer: 0
    },
    {
        category: 'Photography',
        question: 'What does DSLR stand for?',
        options: ['Digital Single Lens Reflex', 'Digital Sound Light Record', 'Direct Single Lens React', 'Digital Simple Lens Reflex'],
        answer: 0
    },
    // Music
    {
        category: 'Music',
        question: 'How many keys does a standard piano have?',
        options: ['66', '77', '88', '99'],
        answer: 2
    },
    {
        category: 'Music',
        question: 'Who composed "Moonlight Sonata"?',
        options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
        answer: 2
    },
    // Dance
    {
        category: 'Dance',
        question: 'What country is ballet from?',
        options: ['Italy', 'France', 'Russia', 'Spain'],
        answer: 1
    },
    {
        category: 'Dance',
        question: 'Which dance style originated in Cuba?',
        options: ['Tango', 'Salsa', 'Waltz', 'Foxtrot'],
        answer: 1
    },
    // Theater
    {
        category: 'Theater',
        question: 'Who wrote Romeo and Juliet?',
        options: ['Dickens', 'Shakespeare', 'Hemingway', 'Austen'],
        answer: 1
    },
    {
        category: 'Theater',
        question: 'What is the name of the famous theater district in New York?',
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