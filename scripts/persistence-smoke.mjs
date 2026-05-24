import { readFile } from 'node:fs/promises';

const checks = [
  {
    file: 'domain/character.migrations.ts',
    patterns: ['CURRENT_CHARACTER_SCHEMA_VERSION', 'migrateCharacterSave'],
  },
  {
    file: 'domain/character.normalize.ts',
    patterns: ['migrateCharacterSave', 'CURRENT_CHARACTER_SCHEMA_VERSION'],
  },
  {
    file: 'lib/characterStore.ts',
    patterns: ['clearAllCharacterStorage', 'clearLegacyCharacterSaves', 'deleteCharacter'],
  },
  {
    file: 'hooks/useActiveCharacter.ts',
    patterns: ['deleteActiveCharacter', 'clearAppData', 'showCharacterLibrary'],
  },
  {
    file: 'docs/storage.md',
    patterns: ['Legacy Migration', 'Schema Versions', 'Delete vs Switch'],
  },
];

for (const check of checks) {
  const source = await readFile(check.file, 'utf8');
  for (const pattern of check.patterns) {
    if (!source.includes(pattern)) {
      throw new Error(`${check.file} is missing ${pattern}`);
    }
  }
}

console.log('Persistence smoke checks passed.');
