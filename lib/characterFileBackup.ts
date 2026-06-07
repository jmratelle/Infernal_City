import Dexie, { type Table } from 'dexie';

import { normalizeCharacter } from '@/domain/character.normalize';
import type { Character } from '@/domain/character.types';

const BACKUP_SETTINGS_KEY = 'character-backup-directory';
const BACKUP_EXTENSION = '.infernal-character.json';

type FileBackupSetting = {
  key: string;
  directoryHandle?: FileSystemDirectoryHandle;
};

type FileSystemPermissionMode = 'read' | 'readwrite';

type PermissionedFileSystemHandle = FileSystemHandle & {
  queryPermission?: (descriptor?: { mode?: FileSystemPermissionMode }) => Promise<PermissionState>;
  requestPermission?: (descriptor?: { mode?: FileSystemPermissionMode }) => Promise<PermissionState>;
};

class CharacterFileBackupDatabase extends Dexie {
  settings!: Table<FileBackupSetting, string>;

  constructor() {
    super('infernal-sheet-file-backup');
    this.version(1).stores({
      settings: '&key',
    });
  }
}

const backupDb = new CharacterFileBackupDatabase();

function isDesktopPointer() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function supportsCharacterFileBackup() {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    isDesktopPointer() &&
    'showDirectoryPicker' in window
  );
}

function safeFilePart(value: string) {
  return value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function shortCharacterId(character: Character) {
  const id = character.id?.trim();
  return id ? safeFilePart(id).slice(0, 8) : 'new';
}

export function characterBackupFileName(character: Character) {
  const name = safeFilePart(character.name || 'Unnamed Character') || 'Unnamed-Character';
  return `${name}.${shortCharacterId(character)}${BACKUP_EXTENSION}`;
}

async function getStoredDirectoryHandle() {
  return (await backupDb.settings.get(BACKUP_SETTINGS_KEY))?.directoryHandle ?? null;
}

async function setStoredDirectoryHandle(directoryHandle: FileSystemDirectoryHandle) {
  await backupDb.settings.put({ key: BACKUP_SETTINGS_KEY, directoryHandle });
}

async function ensureReadWritePermission(directoryHandle: FileSystemDirectoryHandle) {
  const handle = directoryHandle as PermissionedFileSystemHandle;
  const descriptor = { mode: 'readwrite' as const };

  if ((await handle.queryPermission?.(descriptor)) === 'granted') return true;
  return (await handle.requestPermission?.(descriptor)) === 'granted';
}

export async function chooseCharacterBackupDirectory() {
  if (!supportsCharacterFileBackup()) return null;

  const directoryHandle = await window.showDirectoryPicker({
    id: 'infernal-sheet-character-backups',
    mode: 'readwrite',
  });
  await setStoredDirectoryHandle(directoryHandle);
  return directoryHandle;
}

export async function disconnectCharacterBackupDirectory() {
  await backupDb.settings.delete(BACKUP_SETTINGS_KEY);
}

export async function hasCharacterBackupDirectory() {
  return Boolean(await getStoredDirectoryHandle());
}

export async function writeCharacterBackup(character: Character) {
  if (!supportsCharacterFileBackup()) return { ok: false, reason: 'unsupported' as const };

  const directoryHandle = await getStoredDirectoryHandle();
  if (!directoryHandle) return { ok: false, reason: 'not-configured' as const };
  if (!(await ensureReadWritePermission(directoryHandle))) return { ok: false, reason: 'permission-denied' as const };

  const normalized = normalizeCharacter(character);
  const fileHandle = await directoryHandle.getFileHandle(characterBackupFileName(normalized), {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(normalized, null, 2));
  await writable.close();

  return { ok: true as const, fileName: characterBackupFileName(normalized) };
}

export async function writeCharacterBackups(characters: Character[]) {
  const results = await Promise.all(characters.map((character) => writeCharacterBackup(character)));
  return results.filter((result) => result.ok).length;
}
