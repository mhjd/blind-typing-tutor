import { notFound } from 'next/navigation';
import { INTERFACE_LANGUAGE_OPTIONS, LEARNING_LANGUAGE_OPTIONS } from '@/config/constants';
import { LearningApp } from './LearningApp';

export default async function StudyLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ interfaceLang: string; studyLang: string }>;
}) {
  const { interfaceLang, studyLang } = await params;
  if (!INTERFACE_LANGUAGE_OPTIONS.some(language => language.code === interfaceLang) ||
      !LEARNING_LANGUAGE_OPTIONS.some(language => language.code === studyLang)) notFound();
  return <>{children}<LearningApp interfaceLang={interfaceLang} studyLang={studyLang} /></>;
}
