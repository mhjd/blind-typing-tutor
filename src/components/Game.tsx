"use client";

import { useMemo } from "react";
import { type Language } from "../utils/Generator";
import type { KeyboardLayoutId } from "../types/keyboard";
import { getLayout } from "../config/layouts";
import { Keyboard } from "./Keyboard";
import { Stats } from "./Stats";
import { useTypingEngine } from "../hooks/useTypingEngine";
import { TypingDisplay } from "./game/TypingDisplay";
import { GameControls } from "./game/GameControls";
import { BottomControls } from "./game/BottomControls";
import { CustomSetup } from "./game/CustomSetup";
import type { LanguageCode } from "../types/keyboard";
import type { TranslationKeys } from "../translations";

import { exercises } from '../config/exercises';
import type { KeyboardHelpMode } from '../utils/inputPlan';

interface GameProps {
  settingsContent: React.ReactNode;
  helpMode: KeyboardHelpMode;
  setHelpMode: (mode: KeyboardHelpMode) => void;
  mode: "practice" | "beginner" | "custom";
  setMode: (mode: "practice" | "beginner" | "custom") => void;
  layoutId: KeyboardLayoutId;
  setLayoutId: (layoutId: KeyboardLayoutId) => void;
  learningLanguage: LanguageCode;
  setLearningLanguage: (lang: LanguageCode) => void;
  learningContentType: "words" | "phrases" | "custom";
  setLearningContentType: (type: "words" | "phrases" | "custom") => void;
  language: Language;
  showKeyboard: boolean;
  showHands: boolean;
  showColors: boolean;
  correctionMode: boolean;
  soundEnabled: boolean;
  onToggleKeyboard: () => void;
  onToggleHands: () => void;
  onToggleColors: () => void;
  onToggleCorrection: () => void;
  onToggleSound: () => void;
  translations: TranslationKeys;
  availableLayouts: Array<{ id: KeyboardLayoutId; name: string; flag: string }>;
  learningLanguageOptions: Array<{
    code: LanguageCode;
    name: string;
    flag: string;
  }>;
}

export const Game: React.FC<GameProps> = ({
  mode, settingsContent,
  helpMode, setHelpMode,
  setMode,
  layoutId,
  setLayoutId,
  learningLanguage,
  setLearningLanguage,
  learningContentType,
  setLearningContentType,
  language,
  showKeyboard,
  showHands,
  showColors,
  correctionMode,
  soundEnabled,
  onToggleKeyboard,
  onToggleHands,
  onToggleColors,
  onToggleCorrection,
  onToggleSound,
  translations: gameTranslations,
  availableLayouts,
  learningLanguageOptions,
}) => {
  const {
    text,
    input, cursorPosition,
    inputRef,
    wpm,
    accuracy,
    errors,
    lastPressedKey,
    visibleTarget, inputValue, handleKeyDown, handleCompositionStart, handleCompositionEnd, setIsCustomSetup,
    openCustomSetup, exerciseId, selectExercise, customText,
    setCustomText,
    isCustomSetup,
    handleInput,
    handleCustomSubmit,
  } = useTypingEngine({ mode, language, correctionMode, layoutId, helpMode });

  const currentLayout = useMemo(() => getLayout(layoutId), [layoutId]);
  const shouldShowHints = currentLayout.language !== learningLanguage;

  if (isCustomSetup) {
    return (
      <CustomSetup
        customText={customText}
        setCustomText={setCustomText}
        handleCustomSubmit={handleCustomSubmit}
        onCancel={() => setIsCustomSetup(false)}
        translations={gameTranslations}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center bg-transparent p-4 ${!showKeyboard ? "pb-24" : ""
        }`}
    >

      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-lg text-gray-900 dark:text-white">
        <label className="flex items-center gap-3">
          Exercice
          <select data-testid="exercise-selector" value={mode === 'custom' ? exerciseId : ''} onChange={event => { selectExercise(event.target.value); setMode('custom'); }} className="p-3 rounded-lg border-2 bg-white dark:bg-gray-800">
            {mode !== 'custom' && <option value="">Choisir un exercice</option>}
            {exercises.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.title}</option>)}
            {exerciseId === 'free' && <option value="free">Mon texte</option>}
          </select>
        </label>
        <label className="flex items-center gap-3">
          Aide clavier
          <select data-testid="keyboard-help-selector" value={helpMode} onChange={event => setHelpMode(event.target.value as KeyboardHelpMode)} className="p-3 rounded-lg border-2 bg-white dark:bg-gray-800">
            <option value="guided">Guidé</option>
            <option value="confirm">Confirmation</option>
            <option value="mistakes-only">Erreurs seulement</option>
            <option value="hidden">Sans aide</option>
          </select>
        </label>
        <p className="w-full text-center text-base" data-testid="help-description">
          {helpMode === 'guided' ? 'La touche à utiliser est indiquée. Prenez votre temps.' : helpMode === 'confirm' ? 'Cherchez la touche : elle est révélée après votre tentative.' : helpMode === 'mistakes-only' ? 'La bonne touche est révélée seulement après une erreur.' : 'Cherchez les touches sans indication de la réponse.'}
        </p>
      </div>

      {mode === 'custom' && <p className="max-w-4xl mb-4 text-center text-gray-700 dark:text-gray-300" data-testid="exercise-description">{exercises.find(exercise => exercise.id === exerciseId)?.description}</p>}

      <TypingDisplay
        text={text}
        input={input}
        cursorPosition={cursorPosition}
        inputValue={inputValue}
        handleKeyDown={handleKeyDown}
        handleCompositionStart={handleCompositionStart}
        handleCompositionEnd={handleCompositionEnd}
        handleInput={handleInput}
        inputRef={inputRef}
      />


      {showKeyboard && (
        <>
          <Keyboard
            target={visibleTarget}
            layoutId={layoutId}
            showHands={showHands}
            showColors={showColors}
            showEnglishHints={shouldShowHints}
            lastPressedKey={lastPressedKey}
          />

        </>
      )}
      <div className="w-full max-w-4xl flex flex-wrap items-start justify-center gap-4 mt-6 text-gray-900 dark:text-white">
        <button data-testid="change-exercise" className="px-4 py-3 rounded-lg border-2" onClick={() => { openCustomSetup(); setMode('custom'); }}>Saisir mon texte</button>
        <details data-testid="settings-panel" className="border-2 rounded-lg p-3 grow max-w-2xl">
          <summary className="cursor-pointer text-lg">Réglages</summary>
          <div className="flex flex-col gap-6 mt-5">
            {settingsContent}
            <GameControls
              mode={mode}
              setMode={setMode}
              learningContentType={learningContentType}
              setLearningContentType={setLearningContentType}
              learningLanguage={learningLanguage}
              setLearningLanguage={setLearningLanguage}
              learningLanguageOptions={learningLanguageOptions}
              translations={gameTranslations}
            />

            <BottomControls
              showKeyboard={showKeyboard}
              onToggleKeyboard={onToggleKeyboard}
              showHands={showHands}
              onToggleHands={onToggleHands}
              showColors={showColors}
              onToggleColors={onToggleColors}
              correctionMode={correctionMode}
              onToggleCorrection={onToggleCorrection}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              layoutId={layoutId}
              setLayoutId={setLayoutId}
              availableLayouts={availableLayouts}
              translations={gameTranslations}
            />

          </div>
        </details>
        <details data-testid="statistics-panel" className="border-2 rounded-lg p-3">
          <summary className="cursor-pointer text-lg">Statistiques</summary>
          <div className="mt-4">
            <Stats
              wpm={wpm}
              accuracy={accuracy}
              errors={errors}
              translations={gameTranslations}
            />

          </div>
        </details>
      </div>
    </div>
  );
};
