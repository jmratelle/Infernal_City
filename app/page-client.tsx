'use client';

import { useEffect, useState } from 'react';

import { CharacterLibrary } from '@/components/character/CharacterLibrary';
import { CharacterSwitchDialog } from '@/components/character/CharacterSwitchDialog';
import CharacterSheetDemo from '../components/CharacterSheetDemo';
import { DEFAULT_CHARACTER, DEFAULT_REGISTRY } from '@/domain/character.defaults';
import { useActiveCharacter } from '@/hooks/useActiveCharacter';

import CharacterCreationWizard from '../components/CharacterCreationWizard';

type PageClientProps = {
  initialIsCreating?: boolean;
};

export default function PageClient({ initialIsCreating = false }: PageClientProps) {
  const {
    character,
    characters,
    clearAppData,
    createCharacter,
    deleteActiveCharacter,
    deleteSavedCharacter,
    duplicateSavedCharacter,
    exportSavedCharacter,
    isLoading,
    loadCharacter,
    renameSavedCharacter,
    saveStatus,
    setCharacter,
    showCharacterLibrary,
  } = useActiveCharacter();
  const [isCreating, setIsCreating] = useState(initialIsCreating);
  const [isSwitchingCharacter, setIsSwitchingCharacter] = useState(false);

  useEffect(() => {
    if (window.location.search.includes('create=1')) {
      setIsSwitchingCharacter(false);
      setIsCreating(true);
    }
  }, []);

  return (
    <main className="min-h-screen text-foreground p-4">
      {isLoading ? (
        <div className="mx-auto max-w-6xl rounded-md border border-white/10 bg-black/40 p-4 text-sm text-white">
          Loading character...
        </div>
      ) : isCreating ? (
        <CharacterCreationWizard
          registry={DEFAULT_REGISTRY}
          value={DEFAULT_CHARACTER}
          onComplete={(next) => {
            createCharacter(next);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      ) : !character ? (
        <CharacterLibrary
          characters={characters}
          onDelete={deleteSavedCharacter}
          onDuplicate={duplicateSavedCharacter}
          onExport={exportSavedCharacter}
          onImport={async (next) => {
            await createCharacter(next);
            setIsCreating(false);
          }}
          onClearAppData={clearAppData}
          onLoad={loadCharacter}
          onNew={() => setIsCreating(true)}
          onRename={renameSavedCharacter}
          saveStatus={saveStatus}
        />
      ) : (
        <>
          {isSwitchingCharacter && (
            <CharacterSwitchDialog
              onCancel={() => setIsSwitchingCharacter(false)}
              onChooseSaved={async () => {
                setIsSwitchingCharacter(false);
                await showCharacterLibrary();
              }}
              onImport={async (next) => {
                await createCharacter(next);
                setIsCreating(false);
                setIsSwitchingCharacter(false);
              }}
              onNew={() => {
                setIsSwitchingCharacter(false);
                setIsCreating(true);
              }}
            />
          )}

          <CharacterSheetDemo
            registry={DEFAULT_REGISTRY}
            value={character}
            onChange={setCharacter}
            onChangeCharacter={() => setIsSwitchingCharacter(true)}
            onDeleteCharacter={deleteActiveCharacter}
            saveStatus={saveStatus}
          />
        </>
      )}
    </main>
  );
}
