'use client';

import { useState } from 'react';

import type { Character } from '@/domain/character.types';
import { downloadCharacterFile } from '@/lib/characterFiles';

export function useCharacterExport(character: Character) {
  const [fileStatus, setFileStatus] = useState<string | null>(null);

  const exportCharacter = () => {
    try {
      downloadCharacterFile(character);
      setFileStatus('Character exported.');
    } catch {
      setFileStatus('Export failed.');
    }
  };

  return {
    exportCharacter,
    fileStatus,
  };
}
