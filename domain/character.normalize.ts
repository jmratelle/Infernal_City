import { ARMOR_STATS } from '@/data/items';

import { DEFAULT_CHARACTER, emptyAV } from './character.defaults';
import { CURRENT_CHARACTER_SCHEMA_VERSION, migrateCharacterSave } from './character.migrations';
import type { ArmorAV, Character } from './character.types';

export function normalizeCharacter(base: Partial<Character> | Character): Character {
  const migrated = migrateCharacterSave(base);
  const ensureAV = (slot?: { name: string; av?: ArmorAV }): { name: string; av: ArmorAV } => {
    const name = slot?.name || 'Empty';
    return {
      name,
      av: slot?.av ?? ARMOR_STATS[name]?.av ?? emptyAV(),
    };
  };

  return {
    ...DEFAULT_CHARACTER,
    ...migrated,
    id: migrated.id ?? DEFAULT_CHARACTER.id,
    schemaVersion: CURRENT_CHARACTER_SCHEMA_VERSION,
    attributes: {
      ...DEFAULT_CHARACTER.attributes,
      ...(migrated.attributes ?? {}),
    },
    resources: {
      ...DEFAULT_CHARACTER.resources,
      ...(migrated.resources ?? {}),
    },
    items: Array.isArray(migrated.items) ? migrated.items : [],
    stash: Array.isArray(migrated.stash) ? migrated.stash : [],
    armor: {
      head: ensureAV(migrated.armor?.head),
      body: ensureAV(migrated.armor?.body),
      lining: ensureAV(migrated.armor?.lining),
    },
    totalArmor: migrated.totalArmor ?? emptyAV(),
    accessories: Array.isArray(migrated.accessories) ? migrated.accessories : [],
    weapons: Array.isArray(migrated.weapons) ? migrated.weapons : [],
    vehicles: Array.isArray(migrated.vehicles) ? migrated.vehicles : [],
    bloodPoints: migrated.bloodPoints ?? 0,
    conditions: Array.isArray(migrated.conditions) ? migrated.conditions : [],
    missionHistory: Array.isArray(migrated.missionHistory) ? migrated.missionHistory : [],
    housing: {
      ...DEFAULT_CHARACTER.housing,
      ...(migrated.housing ?? {}),
    },
    debt: Array.isArray(migrated.debt) ? migrated.debt : [],
    recurringCosts: Array.isArray(migrated.recurringCosts) ? migrated.recurringCosts : [],
  };
}
