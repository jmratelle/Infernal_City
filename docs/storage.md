# Character Storage

The app stores saved characters in IndexedDB through `lib/characterStore.ts`.

## Current Stores

- `characters`: saved character records, searchable by id, name, race, origin, and update time.
- `meta`: app-level metadata, currently the active character id.

## Legacy Migration

Older builds used localStorage keys:

- `ttrpg-character`
- `characterSheet:v1`

`loadActiveCharacter()` reads these keys only when IndexedDB has no active character. If legacy data is found, it is normalized, saved into IndexedDB, and the legacy keys are removed.

## Schema Versions

Characters carry `schemaVersion`. The current version is exported from `domain/character.migrations.ts` as `CURRENT_CHARACTER_SCHEMA_VERSION`.

All loaded/imported saves should pass through:

1. `migrateCharacterSave()`
2. `normalizeCharacter()`

This keeps old files readable while giving future schema changes one clear migration point.

## Delete vs Switch

- `deleteActiveCharacter()` removes the current character from storage.
- `showCharacterLibrary()` only clears the active selection so another saved character can be chosen.

Keep these flows separate. A user changing characters should not delete data.

## Storage Tools

In development, the library screen exposes `Storage Tools`. It clears this app's IndexedDB character records, legacy localStorage saves, Cache Storage entries, and service worker registration. This is intended for fixing local stale-data issues without clearing the whole browser cache.
