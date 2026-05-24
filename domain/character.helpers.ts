import { DAMAGE_TYPES } from './character.constants';
import { emptyAV } from './character.defaults';
import type { ArmorAV, ArmorSlots, Character, MissionLogEntry, SkillGroup } from './character.types';

export function clamp(n: number, min = 0, max = 9999) {
  return Math.max(min, Math.min(max, n));
}

export function set<K extends keyof Character>(draft: Character, key: K, val: Character[K]): Character {
  return { ...draft, [key]: val } as Character;
}

export function sumArmorValues(slots: ArmorSlots): ArmorAV {
  const total = emptyAV();
  for (const slot of Object.values(slots)) {
    for (const damageType of DAMAGE_TYPES) {
      total[damageType] += slot.av?.[damageType] ?? 0;
    }
  }
  return total;
}

export function groupBy<T extends { group: SkillGroup }>(arr: T[]): Record<SkillGroup, T[]> {
  return arr.reduce(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    { combat: [], magic: [], specialized: [] } as Record<SkillGroup, T[]>
  );
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export function makeId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function tallyFromHistory(history: MissionLogEntry[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const entry of history || []) {
    for (const skillId of entry.successes) {
      totals[skillId] = (totals[skillId] || 0) + 1;
    }
  }
  return totals;
}

export function effectiveTallies(
  history: MissionLogEntry[],
  spent: Record<string, number> = {}
): Record<string, number> {
  const totals = tallyFromHistory(history);
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(totals)) {
    out[k] = Math.max(0, v - (spent[k] || 0));
  }
  for (const k of Object.keys(spent)) {
    if (!(k in out)) out[k] = 0;
  }
  return out;
}
