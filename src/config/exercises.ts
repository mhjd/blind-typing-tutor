export interface Exercise {
  id: string;
  title: string;
  description: string;
  text: string;
  category: string;
}

/** Editable, local exercise library. No server or database. */
export const exercises: Exercise[] = [
  {
    id: 'accents',
    title: 'Accents, tréma et cédille',
    category: 'Accents',
    description: 'Travaillez é, è, à, ù, ç, les circonflexes et le ë de Noël. Pour un circonflexe ou un tréma, tapez l’accent, relâchez, puis la lettre.',
    text: `é è à ù ç â ê î ô û ë
é é è è à à ù ù ç ç
â â ê ê î î ô ô û û ë ë
été élève déjà où ça français
pâte forêt île hôpital sûr Noël
Noël déjà Noël où ça Noël
La forêt est près de l'île. Où est le gâteau de Noël ?`,
  },
  {
    id: 'special',
    title: 'Caractères courants et adresses e-mail',
    category: 'Symboles',
    description: 'Insistez sur @ : maintenez AltGr et appuyez sur la touche à. Entraînez-vous ensuite avec des adresses fictives.',
    text: `@ @ @ @ @ @
. , ' " ( ) - _ ! ? : / + =
@ . @ , @ ' @ " @ ( ) @ - @ _
@ ! @ ? @ : @ / @ + @ =
paul@exemple.fr
lea@exemple.fr
paul.martin@exemple.fr
marie.dupont@exemple.fr
jean_pierre@exemple.fr
contact@exemple.fr
@ @ @ @`,
  },
  {
    id: 'paragraph',
    title: 'Un long texte varié',
    category: 'Texte',
    description: 'Un texte naturel avec toutes les lettres, des accents, de la ponctuation et des adresses e-mail. Prenez votre temps.',
    text: `Bonjour ! Ce matin, Paul ouvre la fenêtre et regarde le jardin. Le ciel est bleu, la lumière est douce et les oiseaux chantent près de la forêt. Il prépare du café, coupe une part de gâteau et s'assoit à côté de la table (celle qui se trouve devant la porte). Où a-t-il posé ses lunettes ? Elles sont déjà dans sa poche.

Pour Noël, la famille souhaite passer quelques jours sur une île. Chacun propose une idée : une promenade au bord de l'eau, une visite au château ou un repas après le marché. Le petit garçon préfère regarder les bateaux. Sa cousine rêve d'un grand jeu de piste, avec une boîte cachée sous un arbre et des indices faciles à lire. Paul est sûr que ce séjour fera plaisir à tout le monde.

Avant de partir, il note la date du voyage : le 12/10/2026. Il écrit ensuite à son amie, dont l'adresse est claire.martin@exemple.fr. Puis il vérifie une seconde adresse, contact@exemple.fr, et ajoute un message : Bonjour, pouvez-vous confirmer notre réservation ? Merci ! Il relit chaque mot, corrige un accent oublié et prend le temps de retrouver la touche @.

Pour pratiquer toutes les lettres du clavier, il recopie cette phrase : Portez ce vieux whisky au juge blond qui fume. Il sourit, ferme son cahier et rejoint sa famille. L'important est de trouver les bonnes touches, à son rythme, puis de recommencer tranquillement.

Dans son carnet, Paul écrit "liste_voyage" en haut de la page. Il fait un petit calcul : 2 + 3 = 5. Les documents sont dans le dossier famille/voyage, avec les billets et l'adresse jean_pierre@exemple.fr. Il ajoute celle de lea@exemple.fr (sa voisine), puis relit les deux adresses. Pour chaque @, il cherche calmement la touche à et maintient AltGr. Tout est prêt pour le départ !`,
  },
];
