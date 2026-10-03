'use client';

import { usePathname } from 'next/navigation';
import { AppContent } from './[learningMode]/AppContent';

/** Keep the game mounted while the mode segment changes. A route transition
 * must not discard an exercise selected in the meantime. */
export function LearningApp({ interfaceLang, studyLang }: { interfaceLang: string; studyLang: string }) {
  const pathname = usePathname();
  const learningMode = pathname.split('/')[3] || 'words';
  return <AppContent params={{ interfaceLang, studyLang, learningMode }} />;
}
