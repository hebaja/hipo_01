export interface Fact {
    text: string;
    isTrue: boolean;
}

export interface PainterData {
    name: string;
    facts: Fact[];
}

export const PAINTER_FACTS: PainterData[] = [
    {
        name: "Picasso",
        facts: [
            { text: "Picasso teve um período chamado 'Período Azul' devido à morte de um amigo.", isTrue: true },
            { text: "Picasso co-fundou o movimento Cubista com Georges Braque.", isTrue: true },
            { text: "Picasso pintou apenas em estilo realista durante toda a sua carreira.", isTrue: false }
        ]
    },
    {
        name: "Monet",
        facts: [
            { text: "Monet pintou a série 'Nenúfares' por cerca de 30 anos.", isTrue: true },
            { text: "Monet plantou os nenúfares em seu jardim em Giverny antes de pintá-los.", isTrue: true },
            { text: "Monet era conhecido por pintar apenas interiores escuros e sombrios.", isTrue: false }
        ]
    },
    {
        name: "Frida Kahlo",
        facts: [
            { text: "Frida Kahlo sofreu um grave acidente de ônibus aos 18 anos que a deixou com dores crônicas.", isTrue: true },
            { text: "Frida Kahlo pintou muitos autorretratos enquanto estava acamada se recuperando.", isTrue: true },
            { text: "Frida Kahlo era uma piloto de avião profissional antes de se tornar artista.", isTrue: false }
        ]
    }
];
