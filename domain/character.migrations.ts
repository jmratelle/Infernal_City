import type { Character } from './character.types';

export const CURRENT_CHARACTER_SCHEMA_VERSION = 1;

type LegacyCharacter = Partial<Character> & { bloodBullets?: number };

export function migrateCharacterSave(base: Partial<Character> | Character): Partial<Character> {
  const schemaVersion = base.schemaVersion ?? 0;
  const legacy = base as LegacyCharacter;
  const migrated: Partial<Character> = {
    ...base,
    bloodPoints: base.bloodPoints ?? legacy.bloodBullets ?? 0,
  };

  if (schemaVersion >= CURRENT_CHARACTER_SCHEMA_VERSION) {
    return migrated;
  }

  return {
    ...migrated,
    schemaVersion: CURRENT_CHARACTER_SCHEMA_VERSION,
  };
}
