import type { Character } from './character.types';

export function isCharacter(value: unknown): value is Character {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<Character>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    !!candidate.attributes &&
    typeof candidate.attributes === 'object' &&
    !!candidate.resources &&
    typeof candidate.resources === 'object' &&
    Array.isArray(candidate.items) &&
    !!candidate.armor &&
    typeof candidate.armor === 'object' &&
    Array.isArray(candidate.vehicles) &&
    !!candidate.housing &&
    typeof candidate.housing === 'object'
  );
}
