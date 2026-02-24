export interface Ingredient {
    name: string;
    amount: string;
}

export interface Cocktail {
    id: string;
    name: string;
    tags: string[];
    difficulty: 'Facile' | 'Moyen' | 'Difficile';
    duration: string;
    alcohol: boolean;
    description: string;
    ingredients: Ingredient[];
    steps: string[];
    color: string; // Hex for accent
    image: string;
}

export const MOCK_COCKTAILS: Cocktail[] = [
    {
        id: '1',
        name: 'Mojito Royal',
        tags: ['Frais', 'Menthe', 'Citron'],
        difficulty: 'Facile',
        duration: '5 min',
        alcohol: true,
        description: "Le roi des cocktails d'été, revisité avec une touche de champagne pour plus de finesse.",
        color: '#a3e635', // Lime
        ingredients: [
            { name: 'Rhum Blanc', amount: '4cl' },
            { name: 'Menthe Fraîche', amount: '8 feuilles' },
            { name: 'Citron Vert', amount: '1/2' },
            { name: 'Sirop de Sucre', amount: '2cl' },
            { name: 'Champagne', amount: 'Top' }
        ],
        steps: [
            "Placer les feuilles de menthe et le citron vert coupé en dés dans le verre.",
            "Piler délicatement pour libérer les arômes sans broyer la menthe.",
            "Ajouter le rhum et le sirop de sucre.",
            "Remplir le verre de glace pilée.",
            "Topper avec le champagne et remuer doucement."
        ],
        image: '/images/mojito-royal.jpg'
    },
    {
        id: '2',
        name: 'Virgin Colada',
        tags: ['Fruité', 'Coco', 'Ananas'],
        difficulty: 'Facile',
        duration: '3 min',
        alcohol: false,
        description: "Toute l'exotisme de la Piña Colada, sans l'alcool. Un délice onctueux.",
        color: '#fef08a', // Yellow
        ingredients: [
            { name: 'Jus d\'Ananas', amount: '12cl' },
            { name: 'Lait de Coco', amount: '4cl' },
            { name: 'Sirop de Vanille', amount: '1cl' },
            { name: 'Glaçons', amount: 'Plein' }
        ],
        steps: [
            "Mettre tous les ingrédients dans un shaker.",
            "Secouer vigoureusement pendant 15 secondes.",
            "Verser dans un grand verre rempli de glaçons.",
            "Décorer avec un morceau d'ananas."
        ],
        image: '/images/virgin-colada.jpg'
    },
    {
        id: '3',
        name: 'Old Fashioned',
        tags: ['Amer', 'Whisky', 'Classique'],
        difficulty: 'Moyen',
        duration: '8 min',
        alcohol: true,
        description: "Le cocktail original. Puissant, complexe et intemporel.",
        color: '#fb923c', // Orange
        ingredients: [
            { name: 'Bourbon ou Rye Whisky', amount: '6cl' },
            { name: 'Cube de Sucre', amount: '1' },
            { name: 'Angostura Bitters', amount: '2 traits' },
            { name: 'Eau Gazeuse', amount: '1 trait' }
        ],
        steps: [
            "Placer le sucre dans le verre et l'imbiber d'Angostura et d'eau.",
            "Écraser le sucre pour former une pâte.",
            "Ajouter un gros glaçon et une partie du whisky, remuer.",
            "Répéter l'opération jusqu'à épuisement du whisky.",
            "Exprimer un zeste d'orange au-dessus du verre."
        ],
        image: '/images/old-fashioned.jpg'
    },
    { id: '4', name: 'Cosmopolitan', tags: ['Acidulé', 'Vodka', 'Soirée'], difficulty: 'Moyen', duration: '5 min', alcohol: true, description: "Le cocktail iconique de New York. Rose, élégant et parfaitement équilibré.", color: '#f472b6', ingredients: [], steps: [], image: '/images/cosmopolitan.jpg' },
    { id: '5', name: 'Bora Bora', tags: ['Fruité', 'Exotique'], difficulty: 'Facile', duration: '4 min', alcohol: false, description: "Un voyage instantané dans les îles sans quitter votre salon.", color: '#f87171', ingredients: [], steps: [], image: '/images/bora-bora.jpg' },
    { id: '6', name: 'Espresso Martini', tags: ['Café', 'Énergisant'], difficulty: 'Difficile', duration: '10 min', alcohol: true, description: "Le coup de boost parfait pour commencer (ou finir) la soirée.", color: '#78350f', ingredients: [], steps: [], image: '/images/espresso-martini.jpg' },
    { id: '7', name: 'Spritz', tags: ['Amer', 'Frais', 'Pétillant'], difficulty: 'Facile', duration: '2 min', alcohol: true, description: "L'apéritif italien par excellence.", color: '#fb923c', ingredients: [], steps: [], image: '/images/spritz.jpg' },
    { id: '8', name: 'Limonade Maison', tags: ['Citron', 'Bio', 'Frais'], difficulty: 'Facile', duration: '10 min', alcohol: false, description: "Rien ne vaut une limonade fraîche faite avec amour.", color: '#facc15', ingredients: [], steps: [], image: '/images/limonade-maison.jpg' },
];
