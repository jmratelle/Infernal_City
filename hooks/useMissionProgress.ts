'use client';

import { useEffect, useRef } from 'react';

import { effectiveTallies } from '@/domain/character.helpers';
import type { Character, MissionLogEntry } from '@/domain/character.types';

type UseMissionProgressOptions = {
  character: Character;
  onChange: (character: Character) => void;
};

export function useMissionProgress({ character, onChange }: UseMissionProgressOptions) {
  const prevAttrsRef = useRef<Record<string, number>>(character.attributes);
  const prevCharacterIdRef = useRef<string | undefined>(character.id);

  useEffect(() => {
    if (prevCharacterIdRef.current !== character.id) {
      prevCharacterIdRef.current = character.id;
      prevAttrsRef.current = character.attributes;
      return;
    }

    const prev = prevAttrsRef.current || {};
    const next = character.attributes || {};

    const spent = { ...(character.tallySpent ?? {}) };
    const eff = effectiveTallies(character.missionHistory ?? [], spent);
    let unlockedAbilities = character.abilityUnlocksAvailable ?? 0;

    let changed = false;
    for (const id of Object.keys(next)) {
      const before = prev[id] ?? 0;
      const after = next[id] ?? 0;
      if (after > before) {
        unlockedAbilities += after - before;
        const e = eff[id] ?? 0;
        if (e > 0) {
          spent[id] = (spent[id] || 0) + e;
          changed = true;
        }
      }
    }

    if (changed) {
      onChange({ ...character, tallySpent: spent, abilityUnlocksAvailable: unlockedAbilities });
    } else if (unlockedAbilities !== (character.abilityUnlocksAvailable ?? 0)) {
      onChange({ ...character, abilityUnlocksAvailable: unlockedAbilities });
    }

    prevAttrsRef.current = next;
  }, [character, onChange]);

  const toggleCurrentMission = (skillId: string, value: boolean) => {
    const next = { ...(character.currentMissionSkills ?? {}), [skillId]: value };
    onChange({ ...character, currentMissionSkills: next });
  };

  const commitMission = () => {
    const successes = Object.entries(character.currentMissionSkills ?? {})
      .filter(([, value]) => !!value)
      .map(([key]) => key);

    const seq = (character.missionHistory?.length ?? 0) + 1;
    const now = new Date();

    const entry: MissionLogEntry = {
      missionId: `Mission ${seq} (${now.toLocaleDateString()})`,
      dateISO: now.toISOString(),
      successes,
    };

    const history = [...(character.missionHistory ?? []), entry];
    onChange({ ...character, missionHistory: history, currentMissionSkills: {} });
  };

  return {
    commitMission,
    toggleCurrentMission,
  };
}
