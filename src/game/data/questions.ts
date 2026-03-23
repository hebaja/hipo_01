export interface Question {
    category: string;
    question: string;
    options: string[];
    answer: number;
    hints: string[];
}

export const quizQuestions: Question[] = [
    // Sculpture
    {
        category: 'Escultura',
        question: 'De que material é feito o David de Michelangelo?',
        options: ['Mármore', 'Argila', 'Bronze', 'Madeira'],
        answer: 0,
        hints: [
            'É um material extraído de pedreiras, muito usado na Renascença.',
            'É uma rocha metamórfica vinda principalmente de Carrara, na Itália.',
            'Muitas estátuas clássicas famosas usam esse material branco.',
            'Não é um metal, é um tipo de pedra que pode ser polida até brilhar.',
            'Michelangelo disse que apenas "libertava a figura" que já estava presa nesse bloco.'
        ]
    },
    {
        category: 'Escultura',
        question: 'Quem esculpiu "O Pensador"?',
        options: ['Michelangelo', 'Rodin', 'Bernini', 'Donatello'],
        answer: 1,
        hints: [
            'O artista é um francês famoso por suas esculturas em bronze e mármore.',
            'Seu nome começa com R e termina com N.',
            'Ele foi contemporâneo do impressionismo nas artes.',
            'A obra original faz parte de um conjunto chamado "As Portas do Inferno".',
            'Auguste é o primeiro nome deste mestre da escultura moderna.'
        ]
    },
    // Painting
    {
        category: 'Pintura',
        question: 'Quem pintou a Mona Lisa?',
        options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
        answer: 1,
        hints: [
            'Ele foi um gênio universal: pintor, inventor, cientista e anatomista.',
            'O autor da obra usou a técnica do "sfumato" para suavizar as sombras.',
            'Ele também pintou "A Última Ceia".',
            'Nasceu na pequena aldeia de Vinci, perto de Florença.',
            'Leonardo é o primeiro nome deste mestre da Renascença.'
        ]
    },
    {
        category: 'Pintura',
        question: 'Qual artista é conhecido por "Noite Estrelada"?',
        options: ['Picasso', 'Van Gogh', 'Monet', 'Dali'],
        answer: 1,
        hints: [
            'Um dos maiores representantes do pós-impressionismo holandês.',
            'Ele usava pinceladas vibrantes e carregadas de tinta.',
            'Vincent é o primeiro nome deste artista que vendeu apenas um quadro em vida.',
            'A obra foi pintada enquanto ele estava em um asilo em Saint-Rémy.',
            'Gogh é o sobrenome que completa sua identidade artística.'
        ]
    },
    // Photography
    {
        category: 'Fotografia',
        question: 'Quem é considerado o inventor da fotografia?',
        options: ['Niepce', 'Eiffel', 'Bell', 'Edison'],
        answer: 0,
        hints: [
            'Trata-se de um inventor francês do século XIX.',
            'Joseph Nicéphore é o seu nome completo.',
            'Ele criou a primeira fotografia permanente do mundo em 1826.',
            'A técnica que ele desenvolveu chama-se heliografia.',
            'O sobrenome começa com N e rima com "péce".'
        ]
    },
    {
        category: 'Fotografia',
        question: 'O que significa DSLR?',
        options: ['Digital Single Lens Reflex', 'Digital Sound Light Record', 'Direct Single Lens React', 'Digital Simple Lens Reflex'],
        answer: 0,
        hints: [
            'Refere-se ao sistema de espelhos que permite ver exatamente o que a lente vê.',
            'O "D" vem de Digital, indicando que usa um sensor eletrônico.',
            'O "S" e "L" significam "Single Lens" (Lente Única).',
            'O "R" significa "Reflex", por causa do reflexo no espelho interno.',
            'É a categoria de câmeras profissionais que dominou o mercado antes das Mirrorless.'
        ]
    },
    // Music
    {
        category: 'Música',
        question: 'Quantas teclas tem um piano padrão?',
        options: ['66', '77', '88', '99'],
        answer: 2,
        hints: [
            'Imagine um número que é o dobro de 44.',
            'São 52 teclas brancas e 36 teclas pretas.',
            'O número total é o mesmo de constelações reconhecidas no céu.',
            'Pense em dois números idênticos que parecem dois infinitos de pé.',
            'Oito dezenas e oito unidades.'
        ]
    },
    {
        category: 'Música',
        question: 'Quem compôs a "Sonata ao Luar"?',
        options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'],
        answer: 2,
        hints: [
            'Ele foi um compositor alemão fundamental na transição do Classicismo para o Romantismo.',
            'Ludwig van é como ele costuma ser chamado.',
            'Ele continuou compondo obras primas mesmo após ficar completamente surdo.',
            'Também é o autor da "Nona Sinfonia" e da "Quinta Sinfonia".',
            'O sobrenome começa com a letra B.'
        ]
    },
    // Dance
    {
        category: 'Dança',
        question: 'De que país é o balé?',
        options: ['Itália', 'França', 'Rússia', 'Espanha'],
        answer: 1,
        hints: [
            'Embora tenha nascido na Itália, foi neste país que se codificou e floresceu na corte.',
            'A língua oficial deste país é o idioma usado para todos os termos do balé (plié, jeté).',
            'Luís XIV, o Rei Sol, foi um grande entusiasta da dança neste país.',
            'Paris é a capital deste país.',
            'É um país europeu famoso por sua culinária e pela Torre Eiffel.'
        ]
    },
    {
        category: 'Dança',
        question: 'Qual estilo de dança teve origem em Cuba?',
        options: ['Tango', 'Salsa', 'Valsa', 'Foxtrot'],
        answer: 1,
        hints: [
            'É um ritmo picante e vibrante, como o molho que leva o mesmo nome.',
            'Tem fortes influências de ritmos caribenhos e africanos.',
            'É dançada em pares com movimentos rápidos de pés e quadris.',
            'O nome remete a uma mistura de ingredientes e temperos.',
            'Começa com S e rima com "calça".'
        ]
    },
    // Theater
    {
        category: 'Teatro',
        question: 'Quem escreveu Romeu e Julieta?',
        options: ['Dickens', 'Shakespeare', 'Hemingway', 'Austen'],
        answer: 1,
        hints: [
            'Ele é o mais famoso dramaturgo de todos os tempos, conhecido como o Bardo.',
            'William é o seu primeiro nome.',
            'Ele escreveu frases famosas como "Ser ou não ser, eis a questão".',
            'Nasceu em Stratford-upon-Avon, na Inglaterra.',
            'O sobrenome começa com S e é associado ao teatro elisabetano.'
        ]
    },
    {
        category: 'Teatro',
        question: 'Qual é o nome do famoso distrito teatral de Nova York?',
        options: ['Broadway', 'Hollywood', 'West End', 'Off-Broadway'],
        answer: 0,
        hints: [
            'O nome significa literalmente "Caminho Largo".',
            'É uma avenida que atravessa a ilha de Manhattan.',
            'É mundialmente famosa por seus grandes musicais.',
            'Fica na região da Times Square.',
            'O nome começa com a letra B.'
        ]
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