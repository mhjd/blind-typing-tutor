import { exercises, focusedCharacters } from '../config/exercises';
import { accentWords, accentSentences, firstNames, lastNames, mailboxes, people, places, objects, observations, paragraphOpenings, paragraphClosings } from '../config/exerciseContent';

type RandomSource = () => number;
function pick<T>(values: readonly T[], random: RandomSource): T {
  return values[Math.floor(random() * values.length)];
}
function shuffle<T>(values: readonly T[], random: RandomSource): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
function email(random: RandomSource): string {
  const user = random() < 0.25 ? pick(mailboxes, random) : `${pick(firstNames, random)}${pick(['.', '_', '-'], random)}${pick(lastNames, random)}`;
  return `${user}@exemple.fr`;
}
function paragraph(opening: string, random: RandomSource): string {
  const introduction = opening.replace('{person}', pick(people, random)).replace('{place}', pick(places, random)).replace('{object}', pick(objects, random)).replace(/\bde le /g, 'du ');
  const day = 1 + Math.floor(random() * 28);
  const month = 1 + Math.floor(random() * 12);
  const hour = 9 + Math.floor(random() * 9);
  const address = email(random);
  const notes = [
    `Pour demander une information, le message partira à ${address}. La réponse permettra de préparer la suite (sans se presser).`,
    `Le rendez-vous est noté pour le ${day}/${month}/2026 à ${hour}:30. Une confirmation est demandée à ${address} : tout est-il prêt ?`,
    `Le carnet porte le titre "notes_${pick(firstNames, random)}". Pour partager les nouvelles, il suffit d'écrire à ${address}.`,
    `La liste compte ${day} objets dans une boîte et 3 dans une autre : ${day} + 3 = ${day + 3}. Pour vérifier, un ami répond à ${address}.`,
    `Une courte lettre commence par "Bonjour !" et se termine par "Merci". Elle sera adressée à ${address}, avec quelques nouvelles de Noël.`,
  ];
  return `${introduction} ${pick(observations, random)} ${pick(notes, random)} ${pick(paragraphClosings, random)}`;
}

/** A sizeable fresh round, built from editable banks and combinations. The
 * previous first word is excluded, including across browser reloads. Nothing
 * here reads user text or makes a request. Only a viewport is rendered. */
export function createExerciseRound(id: string, previousStart: string | null = null, random: RandomSource = Math.random) {
  const exercise = exercises.find(exercise => exercise.id === id) ?? exercises[0];
  const units = exercise.text.split(/\n+/).filter(Boolean);
  if (exercise.id === 'accents') {
    for (let index = 0; index < 160; index++) {
      units.push(Array.from({ length: 12 }, () => pick(accentWords, random)).join(' '));
      units.push(pick(accentSentences, random));
    }
  } else if (exercise.id === 'focused') {
    for (let index = 0; index < 500; index++) {
      units.push(shuffle([...focusedCharacters, '@', '@', '@'], random).join(' '));
    }
  } else if (exercise.id === 'special') {
    const signs = ['.', ',', "'", '"', '(', ')', '-', '_', '!', '?', ':', '/', '+', '='];
    for (let index = 0; index < 180; index++) {
      const addresses = Array.from({ length: 3 }, () => email(random));
      units.push(addresses.join(' '));
      units.push(`${pick(signs, random)} @ ${pick(signs, random)} ${email(random)} ${pick(signs, random)} @ ${pick(signs, random)}`);
    }
  } else {
    for (let index = 0; index < 3; index++) {
      units.push(...paragraphOpenings.map(opening => paragraph(opening, random)));
    }
  }
  const shuffled = shuffle(units, random);
  const firstWord = (unit: string) => unit.trim().split(/\s+/)[0];
  if (firstWord(shuffled[0]) === previousStart) {
    const different = shuffled.findIndex(unit => firstWord(unit) !== previousStart);
    if (different > 0) [shuffled[0], shuffled[different]] = [shuffled[different], shuffled[0]];
  }
  return { text: shuffled.join(exercise.id === 'paragraph' ? '\n\n' : '\n').normalize('NFC'), start: firstWord(shuffled[0]) };
}
