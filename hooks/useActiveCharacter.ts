'use client';

import { useEffect, useRef, useState } from 'react';

import {
  clearActiveCharacter,
  clearAllCharacterStorage,
  deleteCharacter,
  deselectActiveCharacter,
  duplicateCharacter,
  listCharacterSummaries,
  loadActiveCharacter,
  loadCharacter as loadStoredCharacter,
  renameCharacter,
  saveActiveCharacter,
  setActiveCharacter,
  type CharacterSummary,
} from '@/lib/characterStore';
import type { Character } from '@/domain/character.types';
import { downloadCharacterFile } from '@/lib/characterFiles';
import { normalizeCharacter } from '@/domain/character.normalize';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const CHARACTER_CHANNEL = 'infernal-sheet:characters';
const SAVE_DEBOUNCE_MS = 500;
const LOAD_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, fallback: T, label: string): Promise<T> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      console.warn(`${label} timed out`);
      resolve(fallback);
    }, LOAD_TIMEOUT_MS);

    promise
      .then(resolve)
      .catch((err) => {
        console.error(label, err);
        resolve(fallback);
      })
      .finally(() => window.clearTimeout(timeout));
  });
}

function broadcastCharacterChange() {
  if (typeof BroadcastChannel === 'undefined') return;

  const channel = new BroadcastChannel(CHARACTER_CHANNEL);
  channel.postMessage({ type: 'characters-changed' });
  channel.close();
}

export function useActiveCharacter() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const skipNextSaveRef = useRef(false);

  const refreshSummaries = async () => {
    const summaries = await withTimeout(
      listCharacterSummaries(),
      [],
      'Failed to refresh character summaries',
    );
    setCharacters(summaries);
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(false);

    withTimeout(
      Promise.all([loadActiveCharacter(), listCharacterSummaries()]),
      [null, []] as [Character | null, CharacterSummary[]],
      'Failed to load character data',
    )
      .then(([loaded, summaries]) => {
        if (!cancelled) {
          skipNextSaveRef.current = Boolean(loaded);
          setCharacter(loaded);
          setCharacters(summaries);
          setSaveStatus(loaded ? 'saved' : 'idle');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    let cancelled = false;
    const channel = new BroadcastChannel(CHARACTER_CHANNEL);
    channel.onmessage = async () => {
      try {
        const [loaded, summaries] = await withTimeout(
          Promise.all([loadActiveCharacter(), listCharacterSummaries()]),
          [null, []] as [Character | null, CharacterSummary[]],
          'Failed to sync characters',
        );
        if (!cancelled) {
          skipNextSaveRef.current = Boolean(loaded);
          setCharacter(loaded);
          setCharacters(summaries);
          setSaveStatus(loaded ? 'saved' : 'idle');
        }
      } catch (err) {
        console.error('Failed to sync characters', err);
      }
    };

    return () => {
      cancelled = true;
      channel.close();
    };
  }, []);

  useEffect(() => {
    if (isLoading || !character) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    setSaveStatus('saving');
    const timeout = window.setTimeout(() => {
      saveActiveCharacter(character)
        .then((saved) => {
        if (saved.id !== character.id) setCharacter(saved);
        return refreshSummaries().then(() => {
          setSaveStatus('saved');
          broadcastCharacterChange();
        });
        })
        .catch((err) => {
          console.error('Failed to save character', err);
          setSaveStatus('error');
        });
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [character, isLoading]);

  const deleteActiveCharacter = async () => {
    if (character?.id) {
      await deleteCharacter(character.id);
    } else {
      await clearActiveCharacter();
    }
    setCharacter(null);
    setSaveStatus('idle');
    await refreshSummaries();
    broadcastCharacterChange();
  };

  const clearAppData = async () => {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    await clearAllCharacterStorage();
    setCharacter(null);
    setCharacters([]);
    setSaveStatus('idle');
    broadcastCharacterChange();
  };

  const showCharacterLibrary = async () => {
    await deselectActiveCharacter();
    setCharacter(null);
    setSaveStatus('idle');
    await refreshSummaries();
    broadcastCharacterChange();
  };

  const createCharacter = async (next: Character) => {
    setSaveStatus('saving');
    try {
      const saved = await saveActiveCharacter(next);
      skipNextSaveRef.current = true;
      setCharacter(saved);
      await refreshSummaries();
      setSaveStatus('saved');
      broadcastCharacterChange();
    } catch (err) {
      console.error('Failed to create character', err);
      setCharacter(normalizeCharacter(next));
      setSaveStatus('error');
    }
  };

  const loadCharacter = async (id: string) => {
    const loaded = await setActiveCharacter(id);
    if (loaded) {
      skipNextSaveRef.current = true;
      setCharacter(loaded);
      setSaveStatus('saved');
      broadcastCharacterChange();
    }
  };

  const deleteSavedCharacter = async (id: string) => {
    await deleteCharacter(id);
    if (character?.id === id) {
      setCharacter(null);
      setSaveStatus('idle');
    }
    await refreshSummaries();
    broadcastCharacterChange();
  };

  const duplicateSavedCharacter = async (id: string) => {
    const copy = await duplicateCharacter(id);
    if (copy) {
      skipNextSaveRef.current = true;
      setCharacter(copy);
      setSaveStatus('saved');
    }
    await refreshSummaries();
    broadcastCharacterChange();
  };

  const renameSavedCharacter = async (id: string, name: string) => {
    const renamed = await renameCharacter(id, name);
    if (renamed && character?.id === id) {
      skipNextSaveRef.current = true;
      setCharacter(renamed);
      setSaveStatus('saved');
    }
    await refreshSummaries();
    broadcastCharacterChange();
  };

  const exportSavedCharacter = async (id: string) => {
    const saved = await loadStoredCharacter(id);
    if (saved) downloadCharacterFile(saved);
  };

  return {
    character,
    characters,
    createCharacter,
    deleteSavedCharacter,
    duplicateSavedCharacter,
    exportSavedCharacter,
    isLoading,
    loadCharacter,
    renameSavedCharacter,
    deleteActiveCharacter,
    clearAppData,
    saveStatus,
    setCharacter,
    showCharacterLibrary,
  };
}
