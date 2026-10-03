import { test, expect, type Page } from '@playwright/test';
import { characterInputPlan, highlightedKeys, physicalKeyId } from '../src/utils/inputPlan';
import { frFrLayout } from '../src/config/layouts/fr-fr';
import { createExerciseRound } from '../src/utils/exerciseRound';
import { resolveExerciseSelection } from '../src/utils/exerciseSelection';
import { exercises } from '../src/config/exercises';
import { getLayout } from '../src/config/layouts';

const simple: Record<string, string> = { é: '2', è: '7', à: '0', ç: '9', ù: 'quote', ' ': 'space' };
const shifted: Record<string, string> = { '?': 'm', '.': 'comma', '/': 'period', A: 'q' };
const altgr: Record<string, string> = { '@': '0', '#': '3', '{': '4', '[': '5', '|': '6', '\\': '8', ']': 'underscore', '}': 'equal', '€': 'e', '^': '9', '¤': 'rightSquareBracket' };
for (const [char, id] of Object.entries(simple)) test(`plan direct ${JSON.stringify(char)}`, () => {
  expect(characterInputPlan(char, frFrLayout)).toEqual([{ keyId: id, modifiers: [] }]);
});
for (const [char, id] of Object.entries({ ...shifted, ...Object.fromEntries(Array.from('1234567890', char => [char, char])) })) test(`plan Shift ${char}`, () => {
  const plan = characterInputPlan(char, frFrLayout);
  expect(plan).toEqual([{ keyId: id, modifiers: ['shift'] }]);
  expect(highlightedKeys(plan, frFrLayout)).toContain(Number(char) > 0 && Number(char) < 7 || char === 'A' ? 'shift-r' : 'shift-l');
});
for (const [char, id] of Object.entries(altgr)) test(`plan AltGr ${char}`, () => {
  const plan = characterInputPlan(char, frFrLayout);
  expect(plan).toEqual([{ keyId: id, modifiers: ['altgr'] }]);
  expect(highlightedKeys(plan, frFrLayout)).toEqual([id, 'altgr']);
});
for (const char of 'âêîôûäëïöüÂÊÎÔÛÄËÏÖÜ') test(`plan composé NFC/NFD ${char}`, () => {
  const plan = characterInputPlan(char, frFrLayout);
  expect(plan).toHaveLength(2);
  expect(plan[0]).toEqual({ keyId: 'leftSquareBracket', modifiers: char.normalize('NFD')[1] === '\u0308' ? ['shift'] : [], deadKey: true });
  expect(plan[1]).toEqual(characterInputPlan(char.normalize('NFD')[0], frFrLayout)[0]);
  expect(characterInputPlan(char.normalize('NFD'), frFrLayout)).toEqual(plan);
});
for (const char of ['~', '`', '¨']) test(`accent littéral ${char} puis Espace`, () => {
  const plan = characterInputPlan(char, frFrLayout);
  expect(plan[0].deadKey).toBe(true);
  expect(plan[1]).toEqual({ keyId: 'space', modifiers: [] });
});
test('positions physiques et autres dispositions', () => {
  expect(physicalKeyId('BracketLeft')).toBe('leftSquareBracket');
  expect(physicalKeyId('KeyQ')).toBe('q');
  expect(characterInputPlan('A', getLayout('en-us'))[0]).toEqual({ keyId: 'a', modifiers: ['shift'] });
  expect(characterInputPlan('ü', getLayout('de-de'))).toHaveLength(1);
});

async function setup(page: Page, text = 'ç a', help = 'guided', correction = true) {
  await page.addInitScript(({ text, help, correction }) => {
    if (localStorage.getItem('typingTestInitialized')) return;
    localStorage.setItem('typingTestInitialized', 'true');
    localStorage.setItem('customText', text);
    localStorage.setItem('keyboardHelpMode', help);
    localStorage.setItem('correctionMode', String(correction));
  }, { text, help, correction });
  await page.goto('/fr/fr/custom');
  await expect(page.getByTestId('keyboard-help-selector')).toHaveValue(help);
  await page.getByTestId('typing-input').evaluate((el: HTMLInputElement) => el.focus());
}
const targets = (page: Page) => page.locator('[data-testid="virtual-keyboard"] [data-target="true"]');
const key = (page: Page, id: string) => page.locator(`[id="${id}"]`);
const input = (page: Page) => page.getByTestId('typing-input');
const errors = (page: Page) => page.getByTestId('errors-stat').locator('span.text-3xl').first();

for (const help of ['guided', 'confirm', 'mistakes-only', 'hidden']) test(`aide ${help} avant/réussite/erreur/correction`, async ({ page }) => {
  await setup(page, 'ç a', help);
  if (help === 'guided') await expect(key(page, '9')).toHaveAttribute('data-target', 'true');
  else await expect(targets(page)).toHaveCount(0);
  await page.keyboard.press('x');
  await expect(input(page)).toHaveValue('');
  await expect(errors(page)).toHaveText('1');
  await expect(key(page, 'x')).toHaveAttribute('data-pressed', 'true');
  if (help === 'hidden') await expect(targets(page)).toHaveCount(0);
  else {
    await expect(key(page, '9')).toHaveAttribute('data-target', 'true');
    await page.waitForTimeout(450);
    await expect(key(page, '9')).toHaveAttribute('data-target', 'true');
  }
  await page.keyboard.insertText('ç');
  await expect(input(page)).toHaveValue('ç');
  await expect(errors(page)).toHaveText('1');
  if (help === 'confirm') {
    await expect(key(page, '9')).toHaveAttribute('data-target', 'true');
    await page.waitForTimeout(450);
    await expect(targets(page)).toHaveCount(0);
  } else if (help !== 'guided') await expect(targets(page)).toHaveCount(0);
});

for (const help of ['guided', 'confirm', 'mistakes-only', 'hidden']) test(`réussite sans erreur ${help}`, async ({ page }) => {
  await setup(page, 'ç a', help);
  await page.keyboard.insertText('ç');
  if (help === 'confirm') await expect(key(page, '9')).toHaveAttribute('data-target', 'true');
  if (help === 'mistakes-only' || help === 'hidden') await expect(targets(page)).toHaveCount(0);
  await expect(errors(page)).toHaveText('0');
});

for (const help of ['guided', 'confirm']) test(`touche morte, composition et reprise ${help}`, async ({ page }) => {
  await setup(page, 'î a', help);
  if (help === 'guided') await expect(key(page, 'leftSquareBracket')).toHaveAttribute('data-target', 'true');
  else await expect(targets(page)).toHaveCount(0);
  // Browser automation cannot select an OS AZERTY layout. Dispatch the native
  // Dead/code contract, then composition events and actual final text input.
  await input(page).dispatchEvent('keydown', { key: 'Dead', code: 'BracketLeft' });
  await expect(errors(page)).toHaveText('0');
  await expect(input(page)).toHaveValue('');
  if (help === 'guided') await expect(key(page, 'i')).toHaveAttribute('data-target', 'true');
  await input(page).dispatchEvent('compositionstart', { data: '' });
  await input(page).evaluate((el: HTMLInputElement) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    setter.call(el, 'î');
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'î', isComposing: true }));
    el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'î' }));
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: 'î' }));
  });
  await expect(input(page)).toHaveValue('î');
  await expect(errors(page)).toHaveText('0');
  if (help === 'confirm') {
    await expect(key(page, 'leftSquareBracket')).toHaveAttribute('data-target', 'true');
    await expect(key(page, 'i')).toHaveAttribute('data-target', 'true');
  }
});

test('erreur intermédiaire ne corrompt pas une touche morte', async ({ page }) => {
  await setup(page, 'î a', 'mistakes-only');
  await input(page).dispatchEvent('keydown', { key: 'Dead', code: 'Digit2' });
  await expect(errors(page)).toHaveText('0');
  await page.keyboard.insertText('ô');
  await expect(errors(page)).toHaveText('1');
  await expect(input(page)).toHaveValue('');
  await input(page).dispatchEvent('keydown', { key: 'Dead', code: 'BracketLeft' });
  await page.keyboard.insertText('î');
  await expect(input(page)).toHaveValue('î');
  await expect(errors(page)).toHaveText('1');
});

for (const help of ['guided', 'confirm']) test(`AltGr et modificateurs ${help}`, async ({ page }) => {
  await setup(page, '@ a', help);
  if (help === 'guided') {
    await expect(key(page, '0')).toHaveAttribute('data-target', 'true');
    await expect(key(page, 'altgr')).toHaveAttribute('data-target', 'true');
  } else await expect(targets(page)).toHaveCount(0);
  await input(page).dispatchEvent('keydown', { key: 'AltGraph', code: 'AltRight' });
  await input(page).dispatchEvent('keydown', { key: 'Shift', code: 'ShiftLeft' });
  await expect(errors(page)).toHaveText('0');
  await expect(input(page)).toHaveValue('');
  await page.keyboard.insertText('@');
  await expect(input(page)).toHaveValue('@');
  await expect(errors(page)).toHaveText('0');
});

test('sorties françaises, normalisation, répétition et réglages conservés', async ({ page }) => {
  const text = 'é è à ç ù 1234567890 ? . / @ # { [ | \\ ] } € â ê î ô û ä ë ï ö ü A Z';
  await setup(page, text.normalize('NFD'));
  await expect(page.getByTestId('text-display')).toHaveText(text);
  let prefix = '';
  for (const char of text) {
    await page.keyboard.insertText(char);
    prefix += char;
    await expect(input(page)).toHaveValue(prefix === text ? '' : prefix);
  }
  await expect(input(page)).toHaveValue('');
  await expect(errors(page)).toHaveText('0');
  await page.getByTestId('keyboard-help-selector').selectOption('confirm');
  await page.reload();
  await expect(page.getByTestId('keyboard-help-selector')).toHaveValue('confirm');
  await expect(page.getByTestId('keyboard-layout-selector')).toHaveValue('fr-fr');
});

test('premier lancement français et bibliothèque avec texte libre', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/fr\/fr\/custom$/);
  await expect(page.getByTestId('interface-language-selector')).toHaveValue('fr');
  await expect(page.getByTestId('keyboard-layout-selector')).toHaveValue('fr-fr');
  await expect(page.getByTestId('keyboard-help-selector')).toHaveValue('guided');
  await expect(page.getByTestId('exercise-selector')).toHaveValue('accents');
  await expect(page.getByTestId('exercise-selector').locator('option')).toHaveCount(3);
  await expect(page.getByTestId('settings-panel')).not.toHaveAttribute('open', '');
  await page.getByTestId('exercise-selector').selectOption('paragraph');
  await expect(page.getByTestId('text-display')).not.toHaveText('');
  await expect(page.getByTestId('text-display')).toHaveAttribute('data-exercise-length', /^\d{5,}$/);
  await page.getByTestId('change-exercise').click();
  await page.getByTestId('custom-text-input').fill('Mon texte <script> reste du texte.');
  await page.getByTestId('custom-start-button').click();
  await expect(page.getByTestId('text-display')).toHaveText('Mon texte <script> reste du texte.');
  await page.screenshot({ path: 'test-results/french-interface.png', fullPage: true });
});

test('aucun trafic tiers, aucun envoi du texte, headers et console', async ({ page }) => {
  const external: string[] = [];
  const writes: string[] = [];
  const consoleErrors: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://localhost:3000') external.push(request.url());
    if (!['GET', 'HEAD'].includes(request.method()) || request.postData()) writes.push(request.url());
  });
  page.on('pageerror', error => consoleErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await setup(page, 'ç @ î a');
  await page.keyboard.insertText('x');
  await page.keyboard.insertText('ç');
  for (const help of ['confirm', 'mistakes-only', 'hidden', 'guided']) await page.getByTestId('keyboard-help-selector').selectOption(help);
  await page.getByTestId('settings-panel').locator('summary').click();
  await page.getByTestId('sound-toggle-button').click();
  await page.getByTestId('text-display').click();
  await page.keyboard.insertText(' @ î a');
  await page.getByTestId('change-exercise').click();
  await page.getByTestId('custom-text-input').fill('Texte confidentiel');
  await page.getByTestId('custom-start-button').click();
  await page.waitForTimeout(500);
  expect(external).toEqual([]);
  expect(writes).toEqual([]);
  expect(consoleErrors).toEqual([]);
  const response = await page.request.get('/fr/fr/words');
  expect(response.headers()['x-content-type-options']).toBe('nosniff');
  expect(response.headers()['x-frame-options']).toBe('DENY');
  expect(response.headers()['referrer-policy']).toBe('no-referrer');
});

test('NFD saisi, tabulation, retour à la ligne et espaces français', async ({ page }) => {
  await setup(page, 'î\tA\n\u00a0\u202fZ');
  await page.keyboard.insertText('i\u0302');
  await expect(input(page)).toHaveValue('î');
  await page.keyboard.press('Tab');
  await expect(input(page)).toHaveValue('î\t');
  await page.keyboard.type('A');
  await page.keyboard.press('Enter');
  await page.keyboard.type('  Z');
  await expect(input(page)).toHaveValue('');
  await expect(errors(page)).toHaveText('0');
});

for (const help of ['confirm', 'mistakes-only', 'hidden']) test(`sans correction : erreur puis répétition ${help}`, async ({ page }) => {
  await setup(page, 'ç a', help, false);
  await page.keyboard.type('x');
  await expect(input(page)).toHaveValue('x');
  await expect(errors(page)).toHaveText('1');
  if (help === 'hidden') await expect(targets(page)).toHaveCount(0);
  else await expect(key(page, '9')).toHaveAttribute('data-target', 'true');
  await page.waitForTimeout(450);
  await expect(targets(page)).toHaveCount(0);
  await page.keyboard.type(' a');
  await expect(input(page)).toHaveValue('');
  await expect(errors(page)).toHaveText('1');
});

test('confirmation temporisée et frappe rapide sans perte', async ({ page }) => {
  await setup(page, 'abc abc', 'confirm');
  await page.keyboard.type('a');
  await expect(page.locator('[data-current="true"]')).toHaveText('a');
  await page.waitForTimeout(450);
  await expect(page.locator('[data-current="true"]')).toHaveText('b');
  await page.keyboard.type('bc abc', { delay: 0 });
  await expect(input(page)).toHaveValue('');
  await expect(errors(page)).toHaveText('0');
});

test('scénario complet et entraînement sans réseau après chargement', async ({ page, context }) => {
  await setup(page, 'ç î @ ');
  await expect(key(page, '9')).toHaveAttribute('data-target', 'true');
  await page.keyboard.insertText('ç ');
  await page.getByTestId('keyboard-help-selector').selectOption('confirm');
  await expect(targets(page)).toHaveCount(0);
  await input(page).dispatchEvent('keydown', { key: 'Dead', code: 'BracketLeft' });
  await expect(targets(page)).toHaveCount(0);
  await page.keyboard.insertText('î');
  await expect(key(page, 'i')).toHaveAttribute('data-target', 'true');
  await page.waitForTimeout(450);
  await page.keyboard.type('x');
  await expect(key(page, 'space')).toHaveAttribute('data-target', 'true');
  await expect(errors(page)).toHaveText('1');
  await page.keyboard.type(' ');
  await page.getByTestId('keyboard-help-selector').selectOption('mistakes-only');
  await expect(targets(page)).toHaveCount(0);
  await page.keyboard.type('x');
  await expect(key(page, 'altgr')).toHaveAttribute('data-target', 'true');
  await expect(key(page, '0')).toHaveAttribute('data-target', 'true');
  await input(page).dispatchEvent('keydown', { key: 'AltGraph', code: 'AltRight' });
  await page.keyboard.insertText('@');
  await expect(targets(page)).toHaveCount(0);
  await page.keyboard.type(' ');
  await expect(input(page)).toHaveValue('');
  await expect(errors(page)).toHaveText('2');
  await context.setOffline(true);
  await page.getByTestId('keyboard-help-selector').selectOption('hidden');
  await page.keyboard.insertText('ç î @ ');
  await expect(input(page)).toHaveValue('');
  await expect(targets(page)).toHaveCount(0);
  await context.setOffline(false);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('keyboardHelpMode'))).toBe('hidden');
  await page.reload();
  await expect(page.getByTestId('keyboard-help-selector')).toHaveValue('hidden');
  await expect(page.getByTestId('text-display')).toHaveText('ç î @ ');
});


test('bibliothèque métier : trois exercices avec caractères accessibles', () => {
  expect(exercises.map(exercise => exercise.id)).toEqual(['accents', 'special', 'paragraph']);
  for (const exercise of exercises) {
    expect(exercise.text).not.toMatch(/[äïöü€%;œ]/u);
    for (const char of exercise.text) expect(characterInputPlan(char, frFrLayout).length, `Plan pour ${JSON.stringify(char)} dans ${exercise.id}`).toBeGreaterThan(0);
  }
  for (const char of 'éèàùçâêîôûë') expect(exercises[0].text).toContain(char);
  for (const char of `@.,'"()-_!?:/+=`) expect(exercises[1].text).toContain(char);
  expect(exercises[1].text.match(/@/g)!.length).toBeGreaterThanOrEqual(10);
  expect(exercises[2].text.length).toBeGreaterThan(1000);
  for (const char of 'abcdefghijklmnopqrstuvwxyz') expect(exercises[2].text.toLowerCase()).toContain(char);
  expect(exercises[2].text.match(/@/g)!.length).toBeGreaterThanOrEqual(3);
});

test('choix direct, persistance et texte libre sans perdre l’exercice', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('exercise-selector').selectOption('special');
  await expect(page.getByTestId('text-display')).toHaveAttribute('data-exercise-length', /^\d{5,}$/);
  await expect(page.getByTestId('text-display')).toContainText('@');
  await page.reload();
  await expect(page.getByTestId('exercise-selector')).toHaveValue('special');
  await page.getByTestId('change-exercise').click();
  await page.getByTestId('custom-text-input').fill('Un brouillon');
  await page.getByRole('button', { name: 'Annuler', exact: true }).click();
  await expect(page.getByTestId('exercise-selector')).toHaveValue('special');
  await page.getByTestId('exercise-selector').selectOption('paragraph');
  await expect(page.getByTestId('text-display')).toHaveAttribute('data-exercise-length', /^\d{5,}$/);
});


for (const savedId of [null, 'free', 'altgr']) test(`migration de l’ancien exercice AltGr ${savedId}`, async ({ page }) => {
  await page.addInitScript(savedId => {
    localStorage.setItem('customText', '@ # { [ | \\ ] } € ~ ` ^ ¤');
    if (savedId) localStorage.setItem('exerciseId', savedId);
  }, savedId);
  await page.goto('/');
  await expect(page.getByTestId('exercise-selector')).toHaveValue('special');
  await expect(page.getByTestId('text-display')).toHaveAttribute('data-exercise-length', /^\d{5,}$/);
  await expect(page.getByTestId('text-display')).not.toContainText('€');
  expect(await page.evaluate(() => localStorage.getItem('customText'))).toBeNull();
  await page.getByTestId('change-exercise').click();
  await expect(page.getByTestId('custom-text-input')).toHaveValue('');
});

test('migration ciblée : vrai texte libre conservé et choix récent prioritaire', () => {
  const text = 'Mon propre texte : @ # € et Noël.';
  expect(resolveExerciseSelection(null, text)).toMatchObject({ id: 'free', text, customText: text, migratedSnapshot: false });
  expect(resolveExerciseSelection('free', text)).toMatchObject({ id: 'free', text, customText: text, migratedSnapshot: false });
  expect(resolveExerciseSelection('accents', '@ # { [ | \\ ] } € ~ ` ^ ¤')).toMatchObject({ id: 'accents', text: exercises[0].text });
  expect(resolveExerciseSelection('dead', '')).toMatchObject({ id: 'accents', text: exercises[0].text });
});


function seededRandom(seed: number) {
  let value = seed;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}
for (const exercise of exercises) test(`grands tours variés et début différent : ${exercise.id}`, () => {
  const first = createExerciseRound(exercise.id, null, seededRandom(5));
  const second = createExerciseRound(exercise.id, first.start, seededRandom(5));
  const fresh = createExerciseRound(exercise.id, second.start, seededRandom(19));
  expect(first.text.length).toBeGreaterThan(10000);
  expect(second.start).not.toBe(first.start); // even if the random draw repeats
  expect(fresh.start).not.toBe(second.start);
  expect(fresh.text).not.toBe(first.text);
  expect(first.text.slice(0, 500)).not.toBe(second.text.slice(0, 500));
  for (const round of [first, second, fresh]) {
    for (const forbidden of "äïöü€%;œ#{}[]|\\~^`¤") {
      expect(round.text).not.toContain(forbidden);
    }
    for (const char of new Set(round.text)) expect(characterInputPlan(char, frFrLayout).length).toBeGreaterThan(0);
  }
  if (exercise.id === 'special') expect(first.text.match(/@/g)!.length).toBeGreaterThan(500);
  if (exercise.id === 'paragraph') for (const char of 'abcdefghijklmnopqrstuvwxyz') expect(first.text.toLowerCase()).toContain(char);
});

test('nouveau départ à chaque ouverture et affichage borné', async ({ page }) => {
  await page.goto('/');
  const display = page.getByTestId('text-display');
  const start = (await display.textContent())!.trim().split(/\s+/)[0];
  expect(await display.locator('span').count()).toBeLessThan(850);
  await page.reload();
  await expect(page.getByTestId('exercise-selector')).toHaveValue('accents');
  const next = (await display.textContent())!.trim().split(/\s+/)[0];
  expect(next).not.toBe(start);
});

test('fin d’un grand tour : renouvellement sans interruption ni remise à zéro', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.getByTestId('keyboard-help-selector').selectOption('hidden');
  const display = page.getByTestId('text-display');
  const initialStart = (await display.textContent())!.trim().split(/\s+/)[0];
  const length = Number(await display.getAttribute('data-exercise-length'));
  let typed = 0;
  while (typed < length) {
    const chunk = await display.evaluate(el => {
      const spans = Array.from(el.querySelectorAll('span'));
      const current = spans.findIndex(span => span.dataset.current === 'true');
      const ahead = spans.slice(current).map(span => span.textContent).join('');
      return ahead.startsWith('\n') ? '\n' : ahead.split('\n')[0].slice(0, 600);
    });
    expect(chunk.length).toBeGreaterThan(0);
    // Chromium strips newlines from insertText on single-line inputs.
    // Exercise the real Enter path at line breaks and await rendered progress.
    if (chunk === '\n') await page.keyboard.press('Enter');
    else await page.keyboard.insertText(chunk);
    typed += chunk.length;
    await expect(display).toHaveAttribute('data-cursor-position', String(typed === length ? 0 : typed));
    await expect(errors(page)).toHaveText('0');
  }
  await expect(input(page)).toHaveValue('');
  const nextStart = (await display.textContent())!.trim().split(/\s+/)[0];
  expect(nextStart).not.toBe(initialStart);
  await expect(display).toHaveAttribute('data-exercise-length', /^\d{5,}$/);
  await page.keyboard.insertText((await display.locator('[data-current="true"]').textContent())!);
  await expect(input(page)).not.toHaveValue('');
  await expect(errors(page)).toHaveText('0');
});
