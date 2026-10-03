import type { Metadata } from 'next';
import { translations } from '../translations';
import { validateInterfaceLanguage } from '../config/constants';

interface MetadataOptions {
  interfaceLang: string;
  studyLang?: string;
  learningMode?: string;
  robots?: { index: boolean; follow: boolean };
}
export function generatePageMetadata(options: MetadataOptions): Metadata {
  const language = validateInterfaceLanguage(options.interfaceLang);
  return { title: translations[language].title, robots: { index: false, follow: false } };
}
