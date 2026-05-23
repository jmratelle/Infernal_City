'use client';

import React, { useEffect, useState } from 'react';

import CharacterSheetDemo, {
  DEFAULT_CHARACTER,
  DEFAULT_REGISTRY,
  type Character,
} from '../components/CharacterSheetDemo';

import CharacterCreationWizard from '../components/CharacterCreationWizard';

const STORAGE_KEY = 'ttrpg-character';

export default function Page() {
  const [createdCharacter, setCreatedCharacter] =
    useState<Character | null>(null);

  // Load saved character on startup
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setCreatedCharacter(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved character', err);
      }
    }
  }, []);

  // Auto-save whenever character changes
  useEffect(() => {
    if (createdCharacter) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(createdCharacter)
      );
    }
  }, [createdCharacter]);

  return (
    <main className="min-h-screen text-foreground p-4">
      {!createdCharacter ? (
        <CharacterCreationWizard
          registry={DEFAULT_REGISTRY}
          value={DEFAULT_CHARACTER}
          onComplete={setCreatedCharacter}
        />
      ) : (
        <CharacterSheetDemo
          registry={DEFAULT_REGISTRY}
          value={createdCharacter}
          onChange={setCreatedCharacter}
        />
      )}
    </main>
  );
}