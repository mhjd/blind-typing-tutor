import type { KeyboardLayout } from '../types/keyboard';

export type KeyboardHelpMode = 'guided' | 'confirm' | 'mistakes-only' | 'hidden';
export interface PhysicalKeystroke {
  keyId: string;
  modifiers: Array<'shift' | 'altgr'>;
  deadKey?: boolean;
}
export type CharacterInputPlan = PhysicalKeystroke[];

const codes: Record<string, string> = {
  Backquote: 'backtick', Minus: 'underscore', Equal: 'equal',
  BracketLeft: 'leftSquareBracket', BracketRight: 'rightSquareBracket',
  Backslash: 'backSlash', Semicolon: 'cologn', Quote: 'quote',
  Comma: 'comma', Period: 'period', Slash: 'slash', IntlBackslash: 'intlBackslash',
  Space: 'space', ShiftLeft: 'shift-l', ShiftRight: 'shift-r', AltRight: 'altgr',
  Backspace: 'backspace', Enter: 'enter', Tab: 'tab',
};
export function physicalKeyId(code: string): string | null {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit[0-9]$/.test(code)) return code.slice(5);
  return codes[code] ?? null;
}

function directPlan(character: string, layout: KeyboardLayout): CharacterInputPlan {
  if (character === '\t') return [{ keyId: 'tab', modifiers: [] }];
  if (['\u00a0', '\u202f'].includes(character)) return [{ keyId: 'space', modifiers: [] }];
  if (character === '\n') return [{ keyId: 'enter', modifiers: [] }];
  for (const layer of ['primary', 'shifted', 'altGr'] as const) {
    const key = layout.keys.find(key => key[layer] === character);
    if (key) return [{ keyId: key.id, modifiers: layer === 'shifted' ? ['shift'] : layer === 'altGr' ? ['altgr'] : [] }];
  }
  return [];
}

/** Character output and physical input are intentionally separate. Dead-key
 * composition is taught for standard French AZERTY; other layouts keep their
 * explicit primary/Shift/AltGr mappings. The browser owns text composition. */
export function characterInputPlan(character: string | null, layout: KeyboardLayout): CharacterInputPlan {
  if (!character) return [];
  const normalized = character.normalize('NFC');
  if (layout.id === 'fr-fr') {
    const parts = Array.from(normalized.normalize('NFD'));
    const accents: Record<string, string> = { '\u0302': '^', '\u0308': '¨' };
    if (parts.length === 2 && accents[parts[1]]) {
      return [
        { keyId: 'leftSquareBracket', modifiers: parts[1] === '\u0308' ? ['shift'] : [], deadKey: true },
        ...directPlan(parts[0], layout),
      ];
    }
    // Literal dead accents require Space. AltGr+9 gives a direct circumflex.
    if (normalized === '^') return [{ keyId: '9', modifiers: ['altgr'] }];
    if (['¨', '~', '`'].includes(normalized)) {
      return [...directPlan(normalized, layout).map(step => ({ ...step, deadKey: true })), { keyId: 'space', modifiers: [] }];
    }
  }
  return directPlan(normalized, layout);
}

export function highlightedKeys(plan: CharacterInputPlan, layout: KeyboardLayout): string[] {
  return [...new Set(plan.flatMap(step => {
    const key = layout.keys.find(key => key.id === step.keyId);
    const left = key?.group ? key.group <= 4 : layout.leftHandKeys.includes(key?.primary ?? '');
    return [step.keyId, ...step.modifiers.map(modifier => modifier === 'altgr' ? 'altgr' : left ? 'shift-r' : 'shift-l')];
  }))];
}
