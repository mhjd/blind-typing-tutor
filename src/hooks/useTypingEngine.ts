import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type React from 'react';
import { Generator, type Language } from '../utils/Generator';
import { soundManager } from '../utils/SoundManager';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { exercises } from '../config/exercises';
import { getLayout } from '../config/layouts';
import type { KeyboardLayoutId } from '../types/keyboard';
import { characterInputPlan, physicalKeyId, type CharacterInputPlan, type KeyboardHelpMode } from '../utils/inputPlan';

interface TypingEngineProps {
  mode: 'practice' | 'beginner' | 'custom';
  language: Language;
  correctionMode: boolean;
  layoutId: KeyboardLayoutId;
  helpMode: KeyboardHelpMode;
}

export function useTypingEngine({ mode, language, correctionMode, layoutId, helpMode }: TypingEngineProps) {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [compositionValue, setCompositionValue] = useState<string | null>(null);
  const composing = useRef(false);
  const compositionCommit = useRef<{ value: string; data: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState(0);
  const [totalTyped, setTotalTyped] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ text: string; input: string; position: number } | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<CharacterInputPlan>([]);
  const [physicalStep, setPhysicalStep] = useState(0);
  const [customText, setCustomText] = useState('');
  const [isCustomSetup, setIsCustomSetup] = useState(false);
  const pendingSetup = useRef(false);
  const [exerciseId, setExerciseId] = useState('');
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generator = useMemo(() => new Generator(language), [language]);
  const layout = useMemo(() => getLayout(layoutId), [layoutId]);
  const activeTarget = characterInputPlan(text[input.length] ?? null, layout);

  const clearFeedback = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedbackTarget([]);
    setConfirmation(null);
    setPhysicalStep(0);
  }, []);
  const generateText = useCallback(() => {
    if (mode !== 'custom') {
      generator.update();
      setText((mode === 'beginner' ? generator.getOne() : generator.getWords()).normalize('NFC'));
    }
    setInput('');
    clearFeedback();
  }, [mode, generator, clearFeedback]);

  /* eslint-disable react-hooks/set-state-in-effect -- initialize a new exercise */
  useEffect(() => {
    const saved = getStorageItem('customText') || '';
    const savedId = getStorageItem('exerciseId');
    const exercise = exercises.find(exercise => exercise.id === savedId);
    const selectedId = exercise?.id ?? (saved.trim() && !savedId ? 'free' : savedId === 'free' && saved.trim() ? 'free' : exercises[0].id);
    const initialText = selectedId === 'free' ? saved : (exercise ?? exercises[0]).text;
    setExerciseId(selectedId);
    setCustomText(saved);
    setIsCustomSetup(mode === 'custom' && pendingSetup.current);
    pendingSetup.current = false;
    if (mode === 'custom') setText(initialText.normalize('NFC'));
    generateText();
    setErrors(0);
    setTotalTyped(0);
    setStartTime(null);
    setWpm(0);
  }, [mode, language, generateText]);
  useEffect(() => { clearFeedback(); }, [layoutId, helpMode, clearFeedback]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isCustomSetup) inputRef.current?.focus();
  }, [isCustomSetup, mode, layoutId, helpMode]);
  useEffect(() => () => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    if (pressedTimer.current) clearTimeout(pressedTimer.current);
  }, []);
  useEffect(() => {
    if (!startTime) return;
    const timer = setInterval(() => setWpm(totalTyped / 5 / ((Date.now() - startTime) / 60000)), 1000);
    return () => clearInterval(timer);
  }, [startTime, totalTyped]);

  const reveal = (plan: CharacterInputPlan, persistent: boolean) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setConfirmation(null);
    setFeedbackTarget(helpMode === 'hidden' ? [] : plan);
    if (!persistent) feedbackTimer.current = setTimeout(() => { setFeedbackTarget([]); setConfirmation(null); }, 350);
  };

  const processValue = (raw: string) => {
    const value = raw.normalize('NFC');
    if (value === input) return; // compositionend and input may both deliver the result
    if (value.length < input.length) {
      setInput(value);
      clearFeedback();
      return;
    }
    // Process pasted text too, one final Unicode character at a time.
    let accepted = input;
    let attempts = 0;
    let mistakes = 0;
    for (const char of Array.from(value.slice(input.length))) {
      const expected = Array.from(text.slice(accepted.length))[0];
      const plan = characterInputPlan(expected, layout);
      const correct = char === expected || (char === ' ' && ['\u00a0', '\u202f'].includes(expected));
      attempts++;
      setPhysicalStep(0);
      if (!correct) {
        mistakes++;
        soundManager.playError();
        reveal(plan, correctionMode);
        if (correctionMode) break;
      } else {
        soundManager.playClick();
        if (helpMode === 'confirm') {
          reveal(plan, false);
          setConfirmation({ text, input: accepted + expected, position: accepted.length });
        }
        else clearFeedback();
      }
      accepted += correct ? expected : char;
      if (accepted.length === text.length) {
        accepted = '';
        if (mode !== 'custom') {
          generator.update();
          setText((mode === 'beginner' ? generator.getOne() : generator.getWords()).normalize('NFC'));
        }
        break;
      }
    }
    // Only invoked by input/composition/key event handlers, never during render.
    // eslint-disable-next-line react-hooks/purity
    if (attempts && !startTime) setStartTime(Date.now());
    setTotalTyped(count => count + attempts);
    setErrors(count => count + mistakes);
    setInput(accepted);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const native = event.nativeEvent as InputEvent;
    if (composing.current || native.isComposing) {
      setCompositionValue(event.target.value);
      return;
    }
    // Firefox emits a final input after compositionend, including when the
    // output was rejected or completed the loop. Compare the delivered output,
    // not accepted input, to avoid counting that same attempt twice.
    const commit = compositionCommit.current;
    compositionCommit.current = null;
    if (commit && (event.target.value.normalize('NFC') === commit.value || native.data?.normalize('NFC') === commit.data)) return;
    // Use browser-delivered insertion data, independent of the hidden field's
    // caret position. Fall back to full value for deletion and paste events.
    processValue(native.data && native.inputType.startsWith('insert') ? input + native.data : event.target.value);
  };
  const handleCompositionStart = () => {
    compositionCommit.current = null;
    composing.current = true;
    setCompositionValue(input);
  };
  const handleCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>) => {
    composing.current = false;
    setCompositionValue(null);
    compositionCommit.current = { value: event.currentTarget.value.normalize('NFC'), data: event.data.normalize('NFC') };
    processValue(event.data ? input + event.data : event.currentTarget.value);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    compositionCommit.current = null;
    if (!composing.current) event.currentTarget.setSelectionRange(input.length, input.length);
    const id = physicalKeyId(event.code) ?? characterInputPlan(event.key, layout)[0]?.keyId ?? null;
    if (id) {
      setLastPressedKey(id);
      if (pressedTimer.current) clearTimeout(pressedTimer.current);
      pressedTimer.current = setTimeout(() => setLastPressedKey(null), 350);
    }
    // Modifier presses never advance the text or count as attempts.
    if (['Shift', 'Alt', 'AltGraph', 'Control', 'Meta', 'CapsLock'].includes(event.key)) return;
    if (event.key === 'Backspace') { clearFeedback(); return; }
    if (event.key === 'Dead') {
      const step = activeTarget[physicalStep];
      const altgr = event.getModifierState('AltGraph') || (event.ctrlKey && event.altKey);
      const matches = step?.deadKey && step.keyId === id &&
        step.modifiers.includes('shift') === event.shiftKey && step.modifiers.includes('altgr') === altgr;
      if (matches) setPhysicalStep(index => index + 1);
      else {
        setPhysicalStep(0);
        if (helpMode !== 'guided') reveal(activeTarget, correctionMode);
      }
      return; // no final output yet: no error/stat increment
    }
    if ((event.key === 'Enter' && text[input.length] === '\n') || (event.key === 'Tab' && text[input.length] === '\t')) {
      event.preventDefault();
      processValue(input + text[input.length]);
    }
  };
  const openCustomSetup = () => {
    pendingSetup.current = mode !== 'custom';
    setIsCustomSetup(true);
  };
  const startText = (value: string, id: string) => {
    const normalized = value.replace(/\r\n?/g, '\n').normalize('NFC');
    pendingSetup.current = false;
    setText(normalized);
    setExerciseId(id);
    setStorageItem('exerciseId', id);
    setIsCustomSetup(false);
    setInput('');
    setErrors(0);
    setTotalTyped(0);
    setStartTime(null);
    setWpm(0);
    clearFeedback();
    inputRef.current?.focus();
  };
  const selectExercise = (id: string) => {
    const exercise = exercises.find(exercise => exercise.id === id);
    if (exercise) startText(exercise.text, id);
  };
  const handleCustomSubmit = () => {
    if (!customText.trim()) return;
    setStorageItem('customText', customText.replace(/\r\n?/g, '\n').normalize('NFC'));
    startText(customText, 'free');
  };

  return {
    text: confirmation?.text ?? text, input: confirmation?.input ?? input, cursorPosition: confirmation?.position ?? input.length, inputValue: compositionValue ?? input, inputRef, errors, wpm,
    accuracy: totalTyped ? Math.max(0, (totalTyped - errors) / totalTyped * 100) : 100,
    activeTarget, lastPressedKey, feedbackTarget,
    visibleTarget: helpMode === 'guided' ? activeTarget.slice(physicalStep, physicalStep + 1) : helpMode === 'hidden' ? [] : feedbackTarget,
    openCustomSetup, exerciseId, selectExercise, customText, setCustomText, isCustomSetup, setIsCustomSetup,
    handleInput, handleKeyDown, handleCompositionStart, handleCompositionEnd, handleCustomSubmit,
  };
}
