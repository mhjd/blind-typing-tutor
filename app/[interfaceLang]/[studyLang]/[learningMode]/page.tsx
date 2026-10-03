import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import type { ContentType } from "@/utils/url";
import {
  INTERFACE_LANGUAGE_OPTIONS,
  LEARNING_LANGUAGE_OPTIONS,
} from "@/config/constants";
import { generatePageMetadata } from "@/utils/metadata";

const CONTENT_TYPES: ContentType[] = ["words", "phrases", "custom"];

interface PageProps {
  params: Promise<{
    interfaceLang: string;
    studyLang: string;
    learningMode: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { interfaceLang, studyLang, learningMode } = await params;
  return generatePageMetadata({
    interfaceLang,
    studyLang,
    learningMode,
    robots: {
      index: true,
      follow: true,
    },
  });
}

export default async function LearningModePage({ params }: PageProps) {
  const { interfaceLang, studyLang, learningMode } = await params;

  // Validate interfaceLang
  const validInterfaceLang = INTERFACE_LANGUAGE_OPTIONS.find(
    (opt) => opt.code === interfaceLang
  );
  if (!validInterfaceLang) {
    notFound();
  }

  // Validate studyLang
  const validStudyLang = LEARNING_LANGUAGE_OPTIONS.find(
    (opt) => opt.code === studyLang
  );
  if (!validStudyLang) {
    notFound();
  }

  // Validate learningMode
  if (!CONTENT_TYPES.includes(learningMode as ContentType)) {
    redirect(`/${interfaceLang}/${studyLang}/phrases`);
  }

  return null;
}
