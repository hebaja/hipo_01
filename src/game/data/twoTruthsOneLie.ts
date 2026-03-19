export interface Fact {
    text: string;
    isTrue: boolean;
}

export interface PainterData {
    name: string;
    facts: Fact[];
    hints: string[];
}

export const PAINTER_FACTS: PainterData[] = [
    {
        name: "Picasso",
        facts: [
            { text: "Picasso teve um período chamado 'Período Azul' devido à morte de um amigo.", isTrue: true },
            { text: "Picasso co-fundou o movimento Cubista com Georges Braque.", isTrue: true },
            { text: "Picasso pintou apenas em estilo realista durante toda a sua carreira.", isTrue: false }
        ],
        hints: [
            "Pense nas muitas fases artísticas deste pintor espanhol",
            "Ele revolucionou a arte com formas geométricas",
            "Trabalhou com Georges Braque em um movimento artístico",
            "Teve períodos famosos como Azul, Rosa e o Cubismo",
            "Era conhecido por mudar radicalmente de estilo ao longo da vida"
        ]
    },
    {
        name: "Monet",
        facts: [
            { text: "Monet pintou a série 'Nenúfares' por cerca de 30 anos.", isTrue: true },
            { text: "Monet plantou os nenúfares em seu jardim em Giverny antes de pintá-los.", isTrue: true },
            { text: "Monet era conhecido por pintar apenas interiores escuros e sombrios.", isTrue: false }
        ],
        hints: [
            "Pense em um pintor francês ligado à luz natural",
            "Pintou muitas vezes ao ar livre, capturando a luz do momento",
            "Seu jardim em Giverny inspirou dezenas de pinturas",
            "Criou séries famosas de nenúfares e catedrais",
            "Era o oposto de interiores sombrios — amava paisagens luminosas"
        ]
    },
    {
        name: "Frida Kahlo",
        facts: [
            { text: "Frida Kahlo sofreu um grave acidente de ônibus aos 18 anos que a deixou com dores crônicas.", isTrue: true },
            { text: "Frida Kahlo pintou muitos autorretratos enquanto estava acamada se recuperando.", isTrue: true },
            { text: "Frida Kahlo era uma piloto de avião profissional antes de se tornar artista.", isTrue: false }
        ],
        hints: [
            "Pense em uma artista mexicana que transformou dor em arte",
            "Sofreu um grave acidente jovem que a acompanhou a vida toda",
            "Começou a pintar autorretratos enquanto estava acamada",
            "Usou sua imagem e simbolismo mexicano em suas obras",
            "Sua vida foi dedicada inteiramente à pintura, não à aviação"
        ]
    }
];
