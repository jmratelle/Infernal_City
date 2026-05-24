'use client';

import React, { useMemo, useRef, useState, type ChangeEventHandler } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileUp,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Character } from '@/domain/character.types';
import { readCharacterFile } from '@/lib/characterFiles';
import type { CharacterSummary } from '@/lib/characterStore';
import type { SaveStatus } from '@/hooks/useActiveCharacter';

type SortMode = 'updated-desc' | 'updated-asc' | 'name' | 'race' | 'origin';

type CharacterLibraryProps = {
  characters: CharacterSummary[];
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onImport: (character: Character) => void | Promise<void>;
  onClearAppData?: () => void | Promise<void>;
  onLoad: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, name: string) => void;
  saveStatus: SaveStatus;
};

const statusLabels: Record<SaveStatus, string> = {
  error: 'Save failed',
  idle: 'Ready',
  saved: 'Saved',
  saving: 'Saving...',
};

function SaveStatusLabel({ status }: { status: SaveStatus }) {
  const Icon = status === 'error' ? AlertCircle : status === 'saved' ? CheckCircle2 : Save;

  return (
    <div className="sheet-chip">
      <Icon className="h-3.5 w-3.5" />
      {statusLabels[status]}
    </div>
  );
}

function sortCharacters(characters: CharacterSummary[], sortMode: SortMode) {
  return [...characters].sort((a, b) => {
    if (sortMode === 'updated-asc') {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }

    if (sortMode === 'name') return a.name.localeCompare(b.name);
    if (sortMode === 'race') return (a.race || '').localeCompare(b.race || '');
    if (sortMode === 'origin') return (a.origin || '').localeCompare(b.origin || '');

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export function CharacterLibrary({
  characters,
  onDelete,
  onDuplicate,
  onExport,
  onImport,
  onClearAppData,
  onLoad,
  onNew,
  onRename,
  saveStatus,
}: CharacterLibraryProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('updated-desc');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClearData, setConfirmClearData] = useState(false);

  const visibleCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? characters.filter((character) =>
          [character.name, character.race, character.origin]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedQuery)),
        )
      : characters;

    return sortCharacters(filtered, sortMode);
  }, [characters, query, sortMode]);

  const importCharacter: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imported = await readCharacterFile(file);
    if (imported) {
      await onImport(imported);
      setImportStatus('Character imported.');
    } else {
      setImportStatus('Import failed. Choose a valid character JSON file.');
    }
    event.target.value = '';
  };

  const startRename = (character: CharacterSummary) => {
    setDeleteId(null);
    setRenameId(character.id);
    setRenameValue(character.name);
  };

  const finishRename = () => {
    if (!renameId) return;

    const nextName = renameValue.trim();
    if (nextName) onRename(renameId, nextName);
    setRenameId(null);
    setRenameValue('');
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-4 p-4">
      <Card className="sheet-card py-0">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="sheet-kicker">Infernal City RPG v5.2</div>
              <div className="text-xl font-semibold">Character Library</div>
              <div className="mt-1 text-sm text-white/70">
                {characters.length === 0 ? 'Start a new character or import a saved file.' : `${characters.length} saved character${characters.length === 1 ? '' : 's'}.`}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SaveStatusLabel status={saveStatus} />
              <input
                id="character-import-file"
                ref={fileRef}
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={importCharacter}
              />
              <Button type="button" variant="secondary" asChild>
                <label htmlFor="character-import-file">
                <FileUp className="h-4 w-4" /> Import
                </label>
              </Button>
              <Button type="button" onClick={onNew} asChild>
                <a href="?create=1">
                <Plus className="h-4 w-4" /> New Character
                </a>
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_220px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/45" />
              <Input
                className="border-white/15 bg-black/30 pl-9 text-white placeholder:text-white/45"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search characters"
              />
            </label>
            <select
              className="h-9 rounded-md border border-white/15 bg-black/30 px-3 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
            >
              <option value="updated-desc">Newest saved</option>
              <option value="updated-asc">Oldest saved</option>
              <option value="name">Name</option>
              <option value="race">Race</option>
              <option value="origin">Origin</option>
            </select>
          </div>
          {importStatus && <div className="text-sm text-white/70">{importStatus}</div>}
          {onClearAppData && process.env.NODE_ENV !== 'production' && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              {confirmClearData ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      await onClearAppData();
                      setConfirmClearData(false);
                    }}
                  >
                    Clear App Data
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmClearData(false)}>
                    Cancel
                  </Button>
                  <span className="text-xs text-white/60">Clears this app&apos;s character database, legacy saves, cache, and service worker.</span>
                </>
              ) : (
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmClearData(true)}>
                  Storage Tools
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {characters.length === 0 ? (
        <Card className="sheet-card py-0">
          <CardContent className="p-6 text-sm text-white/75">
            No saved characters yet. Use New Character to open the creation wizard.
          </CardContent>
        </Card>
      ) : visibleCharacters.length === 0 ? (
        <Card className="sheet-card py-0">
          <CardContent className="p-6 text-sm text-white/75">No characters match that search.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {visibleCharacters.map((character) => {
            const isRenaming = renameId === character.id;
            const isDeleting = deleteId === character.id;

            return (
              <Card key={character.id} className="sheet-card py-0">
                <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 text-left">
                    {isRenaming ? (
                      <Input
                        autoFocus
                        className="border-white/15 bg-black/30 text-white"
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') finishRename();
                          if (event.key === 'Escape') setRenameId(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="max-w-full truncate text-left text-lg font-semibold"
                        onClick={() => {
                          if (!isDeleting) onLoad(character.id);
                        }}
                      >
                        {character.name}
                      </button>
                    )}
                    <div className="mt-1 text-sm text-white/70">
                      {[character.race, character.origin].filter(Boolean).join(' / ') || 'No race or origin selected'}
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      Saved {new Date(character.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  {isDeleting ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          onDelete(character.id);
                          setDeleteId(null);
                        }}
                      >
                        Delete Character
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setDeleteId(null)}>
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  ) : isRenaming ? (
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="secondary" onClick={finishRename}>
                        Save
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setRenameId(null)}>
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button type="button" size="sm" variant="secondary" onClick={() => onLoad(character.id)}>
                        Load
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Rename character"
                        onClick={() => startRename(character)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Duplicate character"
                        onClick={() => onDuplicate(character.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Export character"
                        onClick={() => onExport(character.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label="Delete character"
                        onClick={() => {
                          setRenameId(null);
                          setDeleteId(character.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
