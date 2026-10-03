export interface Exercise {
  id: string;
  title: string;
  description: string;
  text: string;
  category: string;
}

/** Editable, local exercise library. No server or database. */
export const exercises: Exercise[] = [
  { id: 'letters', title: 'Lettres courantes', category: 'Premiers pas', description: 'Prenez votre temps, cherchez la position des touches.', text: 'a e i o u s t n r l le la les une porte' },
  { id: 'azerty', title: 'La rangée AZERTY', category: 'Premiers pas', description: 'De gauche à droite, puis en sens inverse.', text: 'azertyuiop poiuytreza az az er er ty ty ui ui op op' },
  { id: 'accents', title: 'Accents français', category: 'Accents', description: 'Ces accents ont leur propre touche.', text: 'é è à ç ù été élève déjà ça où' },
  { id: 'punctuation', title: 'Ponctuation', category: 'Symboles', description: 'Repérez les signes et leurs combinaisons.', text: `" ' ( ) - _ , ; : ! ? . / Bonjour, ça va ? Oui !` },
  { id: 'numbers', title: 'Chiffres', category: 'Symboles', description: 'Maintenez Maj (Shift) pour les chiffres.', text: '1 2 3 4 5 6 7 8 9 0 2026 1234567890' },
  { id: 'shift', title: 'Majuscules et Maj', category: 'Combinaisons', description: 'Maj (Shift) et la touche indiquée ensemble.', text: 'A Z E R T Y Bonjour ! ? . / % + £ µ § °' },
  { id: 'altgr', title: 'Les signes avec AltGr', category: 'Combinaisons', description: 'Maintenez AltGr. Pour ~ et `, relâchez puis appuyez sur Espace.', text: '@ # { [ | \\ ] } € ~ ` ^ ¤' },
  { id: 'dead', title: 'Circonflexe et tréma', category: 'Accents', description: 'Appuyez sur l’accent, relâchez, puis tapez la lettre.', text: 'â ê î ô û ä ë ï ö ü Î Ê Â Ö forêt île Noël' },
  { id: 'pangram', title: 'Toutes les lettres', category: 'Textes', description: 'Une phrase pour explorer le clavier.', text: 'Portez ce vieux whisky au juge blond qui fume.' },
  { id: 'mixed', title: 'Un peu de tout', category: 'Textes', description: 'Lettres, accents et signes. L’exercice se répète sans fin.', text: 'Bonjour ! Ça coûte 12 €. Où est l’île ? Noël : @ # { [ | \\ ] } â ê î ô û ä ë ï ö ü.' },
];
