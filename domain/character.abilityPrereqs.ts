import { GENERAL_UNLOCK_DEFS, type GeneralUnlockDef } from '@/data/abilities';

import type { AbilityEntry, AttributeDef } from './character.types';

type GeneralPrereqContext = {
  abilities?: AbilityEntry[];
  attrValues?: Record<string, number>;
  skillDefs?: AttributeDef[];
};

function skillAliases(skillId: string) {
  return skillId === 'shuriken' ? ['shuriken', 'shurikens'] : [skillId];
}

export function meetsGeneralAbilityPrereqs(
  def: GeneralUnlockDef | undefined,
  { abilities = [], attrValues = {}, skillDefs = [] }: GeneralPrereqContext,
) {
  if (!def) return true;

  const skillLevel = (id?: string) => {
    if (!id) return 0;
    return Math.max(...skillAliases(id).map((key) => attrValues[key] ?? 0));
  };

  const owned = abilities
    .filter((ability) => ability.kind === 'general')
    .map((ability) => ability.name);

  if (def.requiresSkillId && def.requiresMinLevel != null) {
    if (skillLevel(def.requiresSkillId) < def.requiresMinLevel) return false;
  }

  if (def.requiresAnySkillIds?.length && def.requiresMinLevel != null) {
    const ok = def.requiresAnySkillIds.some((id) => skillLevel(id) >= def.requiresMinLevel!);
    if (!ok) return false;
  }

  if (def.requiresAnySkillLevel != null) {
    const ok = skillDefs.some((skill) => skillLevel(skill.id) >= def.requiresAnySkillLevel!);
    if (!ok) return false;
  }

  if (def.requiresSkillLevels) {
    for (const [skillId, level] of Object.entries(def.requiresSkillLevels)) {
      if (skillLevel(skillId) < level) return false;
    }
  }

  if (def.requiresAll?.length) {
    const ok = def.requiresAll.every((name) => owned.includes(name));
    if (!ok) return false;
  }

  if (def.requiresAny?.length) {
    const ok = def.requiresAny.some((name) => owned.includes(name));
    if (!ok) return false;
  }

  if (def.requiresAllAbilities?.length) {
    const ok = def.requiresAllAbilities.every((name) => owned.includes(name));
    if (!ok) return false;
  }

  if (def.excludes?.length) {
    const blocked = def.excludes.some((name) => owned.includes(name));
    if (blocked) return false;
  }

  if (def.oneOf) {
    const hasSameGroup = abilities.some(
      (ability) =>
        ability.kind === 'general' &&
        GENERAL_UNLOCK_DEFS.find((candidate) => candidate.name === ability.name)?.oneOf === def.oneOf,
    );

    if (hasSameGroup) return false;
  }

  if (def.stackMax != null) {
    const have = abilities
      .filter((ability) => ability.kind === 'general' && ability.name === def.name)
      .reduce((sum, ability) => sum + (ability.count ?? 1), 0);

    if (have >= def.stackMax) return false;
  }

  return true;
}
