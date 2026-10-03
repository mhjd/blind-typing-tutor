import { exercises } from '../config/exercises';

// Exact former library texts: recognize their saved snapshots without treating
// arbitrary pasted text as an exercise or filtering its characters.
const formerExercises = [
  { id: 'letters', replacement: 'paragraph', text: 'a e i o u s t n r l le la les une porte' },
  { id: 'azerty', replacement: 'paragraph', text: 'azertyuiop poiuytreza az az er er ty ty ui ui op op' },
  { id: 'accents', replacement: 'accents', text: 'é è à ç ù été élève déjà ça où' },
  { id: 'punctuation', replacement: 'special', text: `" ' ( ) - _ , ; : ! ? . / Bonjour, ça va ? Oui !` },
  { id: 'numbers', replacement: 'paragraph', text: '1 2 3 4 5 6 7 8 9 0 2026 1234567890' },
  { id: 'shift', replacement: 'special', text: 'A Z E R T Y Bonjour ! ? . / % + £ µ § °' },
  { id: 'altgr', replacement: 'special', text: '@ # { [ | \\ ] } € ~ ` ^ ¤' },
  { id: 'dead', replacement: 'accents', text: 'â ê î ô û ä ë ï ö ü Î Ê Â Ö forêt île Noël' },
  { id: 'pangram', replacement: 'paragraph', text: 'Portez ce vieux whisky au juge blond qui fume.' },
  { id: 'mixed', replacement: 'paragraph', text: 'Bonjour ! Ça coûte 12 €. Où est l’île ? Noël : @ # { [ | \\ ] } â ê î ô û ä ë ï ö ü.' },
];

export function resolveExerciseSelection(savedId: string | null, savedText: string) {
  const snapshot = formerExercises.find(exercise => exercise.text.normalize('NFC') === savedText.trim().normalize('NFC'));
  const current = exercises.find(exercise => exercise.id === savedId);
  const former = formerExercises.find(exercise => exercise.id === savedId);
  const replacement = exercises.find(exercise => exercise.id === (former ?? snapshot)?.replacement);
  const selected = current ?? replacement;
  const customText = snapshot ? '' : savedText;
  const id = selected?.id ?? (customText.trim() && (!savedId || savedId === 'free') ? 'free' : exercises[0].id);
  const text = id === 'free' ? customText : (selected ?? exercises[0]).text;
  return { id, text, customText, migratedSnapshot: Boolean(snapshot) };
}
