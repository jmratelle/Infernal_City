import { normalizeCharacter } from '@/domain/character.normalize';
import type { Character } from '@/domain/character.types';

function exportedFileName(character: Character) {
  const today = new Date().toISOString().slice(0, 10);
  const safeName = (character.name || 'Character').replace(/\s+/g, '_');
  return `${safeName}_${today}.json`;
}

export function downloadCharacterFile(character: Character) {
  const blob = new Blob([JSON.stringify(normalizeCharacter(character), null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = exportedFileName(character);
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function readCharacterFile(file: File): Promise<Character | null> {
  try {
    const parsed = JSON.parse(await file.text());
    return parsed && typeof parsed === 'object'
      ? normalizeCharacter(parsed as Partial<Character>)
      : null;
  } catch {
    return null;
  }
}
