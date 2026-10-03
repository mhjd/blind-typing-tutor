"use client";

import { useEffect, useState } from "react";
import { Game } from "@/components/Game";
import { getAllLayouts } from "@/config/layouts";
import { translations } from "@/translations";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Header } from "@/components/layout/Header";
import { MobileMessage } from "@/components/layout/MobileMessage";
import {
  POPULAR_LAYOUT_IDS,
  LEARNING_LANGUAGE_OPTIONS,
  INTERFACE_LANGUAGE_OPTIONS,
} from "@/config/constants";

interface AppContentProps {
  params: {
    interfaceLang: string;
    studyLang: string;
    learningMode: string;
  };
}

export function AppContent({ params }: AppContentProps) {
  const settings = useAppSettings(params);
  const t = translations[settings.interfaceLanguage];

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setMounted(true), 0); return () => clearTimeout(timer); }, []);

  // Layout filtering and sorting
  const allLayouts = getAllLayouts();
  const availableLayouts = allLayouts
    .filter(
      (layout) =>
        POPULAR_LAYOUT_IDS.includes(layout.id) ||
        layout.id === settings.layoutId
    )
    .sort((a, b) => {
      const aIndex = POPULAR_LAYOUT_IDS.indexOf(a.id);
      const bIndex = POPULAR_LAYOUT_IDS.indexOf(b.id);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });

  // Mobile detection
  const isMobile = useIsMobile();

  if (!mounted) return <main className="p-8">Chargement du clavier…</main>;

  if (isMobile) {
    return (
      <MobileMessage
        title={t.title}
        desktopRequired={t.mobileDesktopRequired}
        description={t.mobileDescription}
        footer={t.mobileFooter}
        darkMode={settings.darkMode}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${settings.darkMode ? "dark:bg-gray-900" : "bg-gray-50"
        }`}
      suppressHydrationWarning
    >
      <Header
        title={t.title}
        lightMode={t.lightMode}
        darkMode={t.darkMode}
        isDarkMode={settings.darkMode}
        setDarkMode={settings.setDarkMode}
      />

      <main className="grow pt-20">
        <Game
          settingsContent={<label className="flex flex-wrap gap-3 items-center justify-center">
            {t.interfaceLanguage}
            <select data-testid="interface-language-selector" value={settings.interfaceLanguage} onChange={event => settings.setInterfaceLanguage(event.target.value as typeof settings.interfaceLanguage)} className="p-3 border-2 rounded-lg bg-white dark:bg-gray-800">
              {INTERFACE_LANGUAGE_OPTIONS.map(language => <option key={language.code} value={language.code}>{language.flag} {language.name}</option>)}
            </select>
          </label>}
          helpMode={settings.helpMode}
          setHelpMode={settings.setHelpMode}
          mode={settings.mode}
          setMode={settings.setMode}
          layoutId={settings.layoutId}
          setLayoutId={settings.setLayoutId}
          learningLanguage={settings.learningLanguage}
          setLearningLanguage={settings.setLearningLanguage}
          learningContentType={settings.learningContentType}
          setLearningContentType={settings.setLearningContentType}
          language={settings.learningLanguage}
          showKeyboard={settings.showKeyboard}
          showHands={settings.showHands}
          showColors={settings.showColors}
          correctionMode={settings.correctionMode}
          soundEnabled={settings.soundEnabled}
          onToggleKeyboard={() => settings.setShowKeyboard((v) => !v)}
          onToggleHands={() => settings.setShowHands((v) => !v)}
          onToggleColors={() => settings.setShowColors((v) => !v)}
          onToggleCorrection={() => settings.setCorrectionMode((v) => !v)}
          onToggleSound={() => settings.setSoundEnabled((v) => !v)}
          translations={t}
          availableLayouts={availableLayouts}
          learningLanguageOptions={LEARNING_LANGUAGE_OPTIONS}
        />
      </main>
    </div>
  );
}
