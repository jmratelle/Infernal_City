'use client';

import { useRef, useState, type ChangeEventHandler } from 'react';
import { FileUp, Library, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Character } from '@/domain/character.types';
import { readCharacterFile } from '@/lib/characterFiles';

type CharacterSwitchDialogProps = {
  onCancel: () => void;
  onChooseSaved: () => void | Promise<void>;
  onImport: (character: Character) => void | Promise<void>;
  onNew: () => void;
};

export function CharacterSwitchDialog({
  onCancel,
  onChooseSaved,
  onImport,
  onNew,
}: CharacterSwitchDialogProps) {
  const importRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const importCharacter: ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imported = await readCharacterFile(file);
    if (imported) {
      await onImport(imported);
      setImportStatus(null);
    } else {
      setImportStatus('Import failed. Choose a valid character JSON file.');
    }
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <Card className="w-full max-w-lg border-white/10 bg-black text-white">
        <CardContent className="grid gap-4 p-4">
          <input
            id="character-switch-import-file"
            ref={importRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={importCharacter}
          />

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">Change Character</div>
              <div className="text-sm text-white/70">
                Choose another saved character, create a new one, or import a character file.
              </div>
            </div>
            <Button type="button" size="icon" variant="ghost" aria-label="Cancel character change" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-2">
            <Button type="button" variant="secondary" onClick={onChooseSaved}>
              <Library className="h-4 w-4" /> Choose Saved Character
            </Button>
            <Button type="button" onClick={onNew} asChild>
              <a href="?create=1">
              <Plus className="h-4 w-4" /> New Character
              </a>
            </Button>
            <Button type="button" variant="secondary" asChild>
              <label htmlFor="character-switch-import-file">
              <FileUp className="h-4 w-4" /> Import Character
              </label>
            </Button>
            {importStatus && <div className="text-sm text-white/70">{importStatus}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
