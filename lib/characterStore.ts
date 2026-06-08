import Dexie, { type Table } from 'dexie';

import { CURRENT_CHARACTER_SCHEMA_VERSION } from '@/domain/character.migrations';
import { normalizeCharacter } from '@/domain/character.normalize';
import type { Character } from '@/domain/character.types';

const ACTIVE_META_KEY = 'activeCharacterId';
const LEGACY_ACTIVE_CHARACTER_ID = 'active';
const LEGACY_APP_STORAGE_KEY = 'ttrpg-character';
const LEGACY_SHEET_STORAGE_KEY = 'characterSheet:v1';
const SAVE_SCHEMA_VERSION = CURRENT_CHARACTER_SCHEMA_VERSION;

type StoredCharacter = {
  id: string;
  character: Character;
  name: string;
  origin?: string;
  race?: string;
  schemaVersion: number;
  updatedAt: string;
};

type StoredMeta = {
  key: string;
  value?: string;
};

type StoredCharacterDeletion = {
  id: string;
  deletedAt: string;
};

export type CharacterSummary = {
  id: string;
  name: string;
  origin?: string;
  race?: string;
  schemaVersion: number;
  updatedAt: string;
};

class CharacterDatabase extends Dexie {
  characters!: Table<StoredCharacter, string>;
  characterDeletions!: Table<StoredCharacterDeletion, string>;
  meta!: Table<StoredMeta, string>;

  constructor() {
    super('infernal-sheet');
    this.version(1).stores({
      characters: '&id, updatedAt',
    });
    this.version(2).stores({
      characters: '&id, updatedAt, name, race, origin',
      meta: '&key',
    });
    this.version(3).stores({
      characters: '&id, updatedAt, name, race, origin',
      characterDeletions: '&id, deletedAt',
      meta: '&key',
    });
  }
}

const db = new CharacterDatabase();

function createCharacterId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `character-${Math.random().toString(36).slice(2, 10)}`;
}

function characterName(character: Character) {
  return character.name?.trim() || 'Unnamed Character';
}

function toStoredCharacter(character: Character): StoredCharacter {
  const normalizedBase = normalizeCharacter(character);
  const id = !normalizedBase.id || normalizedBase.id === 'temp-1' ? createCharacterId() : normalizedBase.id;
  const normalized = { ...normalizedBase, id, schemaVersion: SAVE_SCHEMA_VERSION };

  return {
    id,
    character: normalized,
    name: characterName(normalized),
    origin: normalized.origin || undefined,
    race: normalized.race || undefined,
    schemaVersion: SAVE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };
}

function toSummary(record: StoredCharacter): CharacterSummary {
  return {
    id: record.id,
    name: record.name,
    origin: record.origin,
    race: record.race,
    schemaVersion: record.schemaVersion,
    updatedAt: record.updatedAt,
  };
}

function readLegacyCharacter(): Character | null {
  if (typeof window === 'undefined') return null;

  for (const key of [LEGACY_APP_STORAGE_KEY, LEGACY_SHEET_STORAGE_KEY]) {
    const saved = localStorage.getItem(key);
    if (!saved) continue;

    try {
      return normalizeCharacter(JSON.parse(saved));
    } catch {
      localStorage.removeItem(key);
    }
  }

  return null;
}

export async function loadActiveCharacter(): Promise<Character | null> {
  const activeId = (await db.meta.get(ACTIVE_META_KEY))?.value;
  const stored = activeId ? await db.characters.get(activeId) : await db.characters.get(LEGACY_ACTIVE_CHARACTER_ID);
  if (stored?.character) return normalizeCharacter(stored.character);

  const legacy = readLegacyCharacter();
  if (legacy) {
    await saveActiveCharacter(legacy);
    clearLegacyCharacterSaves();
  }

  return legacy;
}

export async function loadCharacter(id: string): Promise<Character | null> {
  const stored = await db.characters.get(id);
  return stored?.character ? normalizeCharacter(stored.character) : null;
}

export async function listCharacterSummaries(): Promise<CharacterSummary[]> {
  const records = await db.characters.orderBy('updatedAt').reverse().toArray();
  return records.map(toSummary);
}

export async function listCharacters(): Promise<Character[]> {
  const records = await db.characters.orderBy('updatedAt').reverse().toArray();
  return records.map((record) => normalizeCharacter(record.character));
}

export async function saveActiveCharacter(character: Character): Promise<Character> {
  const stored = toStoredCharacter(character);
  await db.transaction('rw', db.characters, db.characterDeletions, db.meta, async () => {
    await db.characters.put(stored);
    await db.characterDeletions.delete(stored.id);
    await db.meta.put({ key: ACTIVE_META_KEY, value: stored.id });
  });
  return stored.character;
}

export async function saveCharacter(character: Character): Promise<Character> {
  const stored = toStoredCharacter(character);
  await db.transaction('rw', db.characters, db.characterDeletions, async () => {
    await db.characters.put(stored);
    await db.characterDeletions.delete(stored.id);
  });
  return stored.character;
}

export async function setActiveCharacter(id: string): Promise<Character | null> {
  const character = await loadCharacter(id);
  if (!character) return null;
  await db.meta.put({ key: ACTIVE_META_KEY, value: id });
  return character;
}

export async function clearActiveCharacter(): Promise<void> {
  const activeId = (await db.meta.get(ACTIVE_META_KEY))?.value;
  if (activeId) {
    await db.characters.delete(activeId);
  }
  await db.meta.delete(ACTIVE_META_KEY);
  clearLegacyCharacterSaves();
}

export async function clearAllCharacterStorage(): Promise<void> {
  await db.transaction('rw', db.characters, db.characterDeletions, db.meta, async () => {
    await db.characters.clear();
    await db.characterDeletions.clear();
    await db.meta.clear();
  });
  clearLegacyCharacterSaves();
}

export async function deselectActiveCharacter(): Promise<void> {
  await db.meta.delete(ACTIVE_META_KEY);
}

export async function deleteCharacter(id: string, recordDeletion = true): Promise<void> {
  await db.transaction('rw', db.characters, db.characterDeletions, db.meta, async () => {
    await db.characters.delete(id);
    if (recordDeletion) {
      await db.characterDeletions.put({ id, deletedAt: new Date().toISOString() });
    }
    const activeId = (await db.meta.get(ACTIVE_META_KEY))?.value;
    if (activeId === id) {
      await db.meta.delete(ACTIVE_META_KEY);
    }
  });
  clearLegacyCharacterSaves();
}

export async function listCharacterDeletions(): Promise<StoredCharacterDeletion[]> {
  return db.characterDeletions.toArray();
}

export async function clearCharacterDeletion(id: string): Promise<void> {
  await db.characterDeletions.delete(id);
}

export async function duplicateCharacter(id: string): Promise<Character | null> {
  const character = await loadCharacter(id);
  if (!character) return null;

  const copy = {
    ...character,
    id: createCharacterId(),
    name: `${characterName(character)} Copy`,
  };
  await saveActiveCharacter(copy);
  return copy;
}

export async function renameCharacter(id: string, name: string): Promise<Character | null> {
  const record = await db.characters.get(id);
  if (!record) return null;

  const character = { ...record.character, name };
  await db.characters.put({
    ...record,
    character,
    name: characterName(character),
    updatedAt: new Date().toISOString(),
  });
  return character;
}

export function clearLegacyCharacterSaves() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_APP_STORAGE_KEY);
  localStorage.removeItem(LEGACY_SHEET_STORAGE_KEY);
}
