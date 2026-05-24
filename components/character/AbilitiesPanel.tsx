'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { InlinePicker } from '@/components/character/InlinePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { GeneralUnlockDef } from '@/data/abilities';
import { GENERAL_UNLOCK_DEFS } from '@/data/abilities';
import { makeId } from '@/domain/character.helpers';
import { RACE_ABILITIES } from '@/domain/character.races';
import type { AbilityEntry, AttributeDef, RaceAbilityDef, RaceName } from '@/domain/character.types';

export const AbilitiesPanel: React.FC<{
  abilities: AbilityEntry[];
  abilityUnlocksAvailable: number;
  onChangeAbilityUnlocks: (next: number) => void;
  skillDefs: AttributeDef[];
  raceName?: RaceName;
  attrValues?: Record<string, number>;
  onChange: (next: AbilityEntry[], nextAbilityUnlocks?: number) => void;
  readOnly?: boolean;
}> = ({ abilities, abilityUnlocksAvailable, onChangeAbilityUnlocks, skillDefs, raceName, attrValues, onChange, readOnly }) => {

  const [showKindPicker, setShowKindPicker] = React.useState(false);
  const [pickingRace, setPickingRace] = React.useState(false);
  const [draftRaceAbility, setDraftRaceAbility] = React.useState<string>('');
  const [addAbilitySearch, setAddAbilitySearch] = React.useState('');
  
  // Inline “add” pickers
  const [, setAddingSkill] = React.useState(false);
  const [, setAddingSkillChoice] = React.useState<string | undefined>(undefined);

  const [addingGeneral, setAddingGeneral] = React.useState(false);
  const [addingGeneralChoice, setAddingGeneralChoice] = useState<string | undefined>(undefined);
  const [addingGeneralLinkedSkillId, setAddingGeneralLinkedSkillId] = useState<string | undefined>(undefined);
  

  const raceDefs: RaceAbilityDef[] = raceName ? (RACE_ABILITIES[raceName] ?? []) : [];
  const byName = new Map(raceDefs.map(d => [d.name, d]));
  const isDefaultEntry = (x: AbilityEntry) => !!byName.get(x.name)?.auto;
  const EMERGING_MAX = 7;

  //For hide and show button on abilities
  const [open, setOpen] = React.useState<Record<string, boolean>>({});
  const toggle = (id: string) =>
    setOpen(o => ({ ...o, [id]: !(o[id] ?? true) }));
  const isOpen = (id: string) => open[id] ?? true; // default open

  // Auto-populate defaults whenever the selected race changes
  const prevRaceRef = React.useRef<RaceName | undefined>(undefined);
  // Minimal add helper — adjust to your data shape if needed
  const addAbilityRow = (
    kind: 'general',
    name: string,
    extra?: Partial<AbilityEntry>
  ) => {
    const nextAbilities = [
      ...(abilities ?? []),
      {
        id: makeId('ab'),
        kind,
        name,
        ...extra,
      },
    ];
    const nextUnlocks = Math.max(0, abilityUnlocksAvailable - 1);
    onChange(nextAbilities, nextUnlocks);
  };

  React.useEffect(() => {
    if (!raceName) {
      prevRaceRef.current = raceName;
      return;
    }


    const defs = RACE_ABILITIES[raceName] ?? [];
    const autoNow = new Set(defs.filter(d => d.auto).map(d => d.name));

    const prevRace = prevRaceRef.current;
    const prevAuto = new Set<string>(
      prevRace ? (RACE_ABILITIES[prevRace] ?? []).filter(d => d.auto).map(d => d.name) : []
    );

    let next = abilities ?? [];
    let changed = false;

    // If the race actually changed, remove prior race's auto abilities that aren't also auto in the new race
    if (prevRace && prevRace !== raceName && prevAuto.size > 0) {
      const toRemoveIds = next
        .filter(a => a.kind === 'race' && prevAuto.has(a.name) && !autoNow.has(a.name))
        .map(a => a.id);
      if (toRemoveIds.length) {
        next = next.filter(a => !toRemoveIds.includes(a.id));
        changed = true;
      }
    }

    // Add any missing auto abilities for the new race
    autoNow.forEach(name => {
      if (!next.some(a => a.kind === 'race' && a.name === name)) {
        next = [...next, { id: makeId('ab'), kind: 'race', name }];
        changed = true;
      }
    });

    if (changed) onChange(next);
    prevRaceRef.current = raceName;
    // Intentionally ONLY depend on raceName to avoid re-adding if user removes one manually without changing race.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceName]);

  // If legacy chars have multiple Emerging rows, merge them into one with summed count
    React.useEffect(() => {
    if (raceName !== 'Abomination') return;

    const ems = (abilities ?? []).filter(
      a => a.kind === 'race' && a.name === 'Emerging Mutation'
    );
    if (ems.length <= 1) return;

    const total = Math.min(
    ems.reduce((s, a) => s + (a.count ?? 1), 0),
    EMERGING_MAX
    );

    const keep = ems.find(isDefaultEntry) ?? ems[0]; // pick the auto def row if present

    const next = (abilities ?? []).filter(
      a => !(a.kind === 'race' && a.name === 'Emerging Mutation')
    );
    next.push({ ...keep, count: total }); // keep same id; add count
    onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceName, abilities]);

  const add = (entry: AbilityEntry) => onChange([...(abilities ?? []), entry]);
  const remove = (id: string, refundMarker = false) => {
    const removed = (abilities ?? []).find((a) => a.id === id);
    const nextAbilities = (abilities ?? []).filter(a => a.id !== id);
    const nextUnlocks =
      refundMarker && removed && !(removed.kind === 'race' && isDefaultEntry(removed))
        ? abilityUnlocksAvailable + 1
        : undefined;
    onChange(nextAbilities, nextUnlocks);
  };
  const patch  = (id: string, p: Partial<AbilityEntry>) =>
    onChange((abilities ?? []).map(a => (a.id === id ? { ...a, ...p } : a)));

  const raceUnlocks    = (abilities ?? []).filter(a => a.kind === 'race');

  // Sum-aware counter (uses count if present, else 1)
  const countAbility = (name: string) =>
    (abilities ?? []).reduce(
      (sum, a) => sum + (a.kind === 'race' && a.name === name ? (a.count ?? 1) : 0),
      0
    );

  const emergingCount = Math.min(
  raceName === 'Abomination' ? countAbility('Emerging Mutation') : 0,
  EMERGING_MAX
  );
  // The single consolidated Emerging Mutation row (if present)
  const emRow = (abilities ?? []).find(
  x => x.kind === 'race' && x.name === 'Emerging Mutation'
  );
  // How many stacks it currently has (0 if not present)
  const emCount = emRow ? (emRow.count ?? 1) : 0;
  const hasRaceAbility = (name: string) => raceUnlocks.some(a => a.name === name);

  // Check skill prerequisites
  const meetsSkillReqs = (def?: RaceAbilityDef) => {
    if (!def) return true;
    const vals = attrValues ?? {};
    if (def.requiresAnySkillLevel != null) {
      const ok = Object.values(vals).some(lvl => (lvl ?? 0) >= def.requiresAnySkillLevel!);
      if (!ok) return false;
    }
    if (def.requiresSkillLevels) {
      for (const [id, min] of Object.entries(def.requiresSkillLevels)) {
        if ((vals[id] ?? 0) < min) return false;
      }
    }
    return true;
  };

  // Index skill levels for gating
const skillLevel = (id?: string) => (id ? (attrValues?.[id] ?? 0) : 0);

// Lookups for already-chosen names

const canAddExpertiseForSkill = (skillId?: string, currentId?: string) => {
  if (!skillId) return false;
  return !(abilities ?? []).some(
    (a) => a.kind === 'general' && a.name === 'Expertise' && a.linkedSkillId === skillId && a.id !== currentId
  );
};

const canAddGeneralDef = (
  def?: GeneralUnlockDef,
  linkedSkillId?: string,
  currentId?: string
) => {
  if (!def) return true;

  if (!meetsGeneralUnlockPrereqs(def)) {
    return false;
  }

  // Expertise special handling
  if (def.name === 'Expertise') {
    return canAddExpertiseForSkill(linkedSkillId, currentId);
  }

  // Stackables are allowed
  if (def.stackable) {
    return true;
  }

  // Otherwise no duplicates
  return !(abilities ?? []).some(
    a =>
      a.kind === 'general' &&
      a.name === def.name &&
      a.id !== currentId
  );
};

const meetsGeneralUnlockPrereqs = (def?: GeneralUnlockDef) => {
  if (!def) return true;

  const owned = (abilities ?? [])
    .filter(a => a.kind === 'general')
    .map(a => a.name);

  // -------------------------
  // Skill requirements
  // -------------------------

  if (def.requiresSkillId && def.requiresMinLevel != null) {
    if (skillLevel(def.requiresSkillId) < def.requiresMinLevel) {
      return false;
    }
  }

  if (def.requiresAnySkillIds?.length && def.requiresMinLevel != null) {
    const ok = def.requiresAnySkillIds.some(
      id => skillLevel(id) >= def.requiresMinLevel!
    );

    if (!ok) return false;
  }

  // Any skill at X
  if (def.requiresAnySkillLevel != null) {
    const ok = skillDefs.some(
      s => skillLevel(s.id) >= def.requiresAnySkillLevel!
    );

    if (!ok) return false;
  }

  // Specific skill map
  if (def.requiresSkillLevels) {
    for (const [skillId, lvl] of Object.entries(def.requiresSkillLevels)) {
      if (skillLevel(skillId) < lvl) {
        return false;
      }
    }
  }

  // -------------------------
  // Ability requirements
  // -------------------------

  if (def.requiresAll?.length) {
    const ok = def.requiresAll.every(name => owned.includes(name));
    if (!ok) return false;
  }

  if (def.requiresAny?.length) {
    const ok = def.requiresAny.some(name => owned.includes(name));
    if (!ok) return false;
  }

  if (def.requiresAllAbilities?.length) {
    const ok = def.requiresAllAbilities.every(name =>
      owned.includes(name)
    );

    if (!ok) return false;
  }

  // -------------------------
  // Exclusions
  // -------------------------

  if (def.excludes?.length) {
    const blocked = def.excludes.some(name => owned.includes(name));

    if (blocked) return false;
  }

  // -------------------------
  // One-of groups
  // -------------------------

  if (def.oneOf) {
    const hasSameGroup = (abilities ?? []).some(a =>
      a.kind === 'general' &&
      GENERAL_UNLOCK_DEFS.find(d => d.name === a.name)?.oneOf === def.oneOf
    );

    if (hasSameGroup) return false;
  }

  // -------------------------
  // Stack limits
  // -------------------------

  if (def.stackMax != null) {
    const have = (abilities ?? [])
      .filter(a => a.kind === 'general' && a.name === def.name)
      .reduce((s, a) => s + (a.count ?? 1), 0);

    if (have >= def.stackMax) {
      return false;
    }
  }

  return true;
};

// Build options for a specific General row, letting the current row's selection remain selectable
const generalDisplayOptionsFor = (currentId: string, currentName?: string) => {
  const opts = GENERAL_UNLOCK_DEFS
    .filter(def => {
      if (def.name === 'Expertise') return skillDefs.some((skill) => canAddExpertiseForSkill(skill.id, currentId));
      return canAddGeneralDef(def, undefined, currentId);
    })
    .map(def => def.name);

  // Keep current selection visible so <select> doesn’t snap back
  if (currentName && !opts.includes(currentName)) {
    opts.unshift(currentName);
  }

  return opts;
};

  const meetsPrereqs = (def?: RaceAbilityDef) => {
  if (!def) return false;
  if (def.requiresAll && def.requiresAll.some(n => !hasRaceAbility(n))) return false;
  if (def.requiresAny && !def.requiresAny.some(n => hasRaceAbility(n))) return false;
  if (!meetsSkillReqs(def)) return false;
  return true;
};

  // ---- Rule checks ----
  const abomMutationCount = React.useMemo(() => {
  if (raceName !== 'Abomination') return 0;
  const abomDefs = RACE_ABILITIES['Abomination'] ?? [];
  const isMutation = new Set(abomDefs.filter(d => d.group === 'mutation').map(d => d.name));
  return (abilities ?? []).filter(a => a.kind === 'race' && isMutation.has(a.name)).length;
}, [abilities, raceName]);

  const renderDesc = (def?: RaceAbilityDef) => {
    if (!def) return '';
    let txt = def.desc ?? '';
    // generic token replacement—safe for all abilities
    txt = txt.replace(/\{\{ABOM_MUT_COUNT\}\}/g, String(abomMutationCount));
    txt = txt.replace(/\{\{MUTANT_MADNESS_X\}\}/g, String(abomMutationCount + 1));
    return txt;
  };
  const mutationMax = raceName === 'Abomination' ? 3 + Math.min(emergingCount, EMERGING_MAX) : 0;

  const alteredCoreCount =
    raceName === 'Altered'
      ? raceUnlocks.filter(a => byName.get(a.name)?.oneOf === 'altered-core').length
      : 0;

  const alteredOK = raceName !== 'Altered'     || alteredCoreCount === 1;
/*const addOne = (name: string) => {
  onChange([...(abilities ?? []), { id: makeId('ab'), kind: 'race', name }]);
};


/*const removeOne = (name: string) => {
  const next = [...(abilities ?? [])];
  // Prefer removing a non-auto copy; keep the original auto instance
  for (let i = next.length - 1; i >= 0; i--) {
    const a = next[i];
    if (a.kind === 'race' && a.name === name && !a.auto) {
      next.splice(i, 1);
      onChange(next);
      return;
    }
  }
  // If only the auto remains, do nothing (keeps baseline)
};*/

  // Can we add a given race ability without breaking rules?
const canAddName = (name: string) => {
  if (!raceName) return false;
  const def = byName.get(name);
  if (!def) return false;

  // Special-case: Emerging Mutation is stackable but we manage it via count, not extra rows
  if (name === 'Emerging Mutation' && (abilities ?? []).some(a => a.kind === 'race' && a.name === name)) {
    return false;
  }

  // For other non-stackables, prevent dupes
  if (!def.stackable && (abilities ?? []).some(a => a.kind === 'race' && a.name === name)) {
    return false;
  }

  // Abomination mutation cap (uses new cap)
  if (raceName === 'Abomination' && def.group === 'mutation' && abomMutationCount >= mutationMax) {
    return false;
  }

  // Altered core cap (as you had)
  if (raceName === 'Altered' && def.oneOf === 'altered-core' && alteredCoreCount >= 1) {
    return false;
  }

  if (!meetsPrereqs(def)) return false;
  return true;
};


  const startAddRaceAbility = () => {
    if (!raceName || raceDefs.length === 0 || abilityUnlocksAvailable <= 0) return;
    const first = raceDefs.find(d => canAddName(d.name))?.name ?? '';
    if (!first) return; // nothing addable under current constraints
    setDraftRaceAbility(first);
    setAddingGeneral(false);
    setAddAbilitySearch('');
    setPickingRace(true);
  };

  const confirmAddRaceAbility = () => {
    if (!draftRaceAbility) { setPickingRace(false); return; }
    if (!canAddName(draftRaceAbility)) { setPickingRace(false); setShowKindPicker(false); return; }
    const nextAbilities: AbilityEntry[] = [
      ...(abilities ?? []),
      { id: makeId('ab'), kind: 'race', name: draftRaceAbility } as AbilityEntry,
    ];
    onChange(nextAbilities, Math.max(0, abilityUnlocksAvailable - 1));
    setPickingRace(false);
    setShowKindPicker(false);
    setAddAbilitySearch('');
  };

  const cancelPickers = () => {
    setPickingRace(false);
    setShowKindPicker(false);
    setAddAbilitySearch('');
    setAddingGeneral(false);
    setAddingGeneralChoice(undefined);
    setAddingGeneralLinkedSkillId(undefined);
    setAddingSkill(false);
    setAddingSkillChoice(undefined);
  };

  // Is there anything addable right now?
  const anyAddable = !!raceName && raceDefs.some(d => canAddName(d.name));
  const addAbilitySearchTerm = addAbilitySearch.trim().toLowerCase();
  const matchesAddSearch = (name: string, desc = '') => {
    if (!addAbilitySearchTerm) return true;
    return [name, desc].join(' ').toLowerCase().includes(addAbilitySearchTerm);
  };
  const visibleRaceUnlocks = raceUnlocks;
  const generalUnlocks = (abilities ?? []).filter(a => a.kind === 'general');
  const visibleGeneralUnlocks = generalUnlocks;
  const addableRaceOptions = raceDefs
    .filter(d => canAddName(d.name))
    .filter(d => matchesAddSearch(d.name, d.desc))
    .map(d => d.name);
  const addableGeneralOptions = generalDisplayOptionsFor("new-general", addingGeneralChoice || undefined)
    .filter((name) => {
      const def = GENERAL_UNLOCK_DEFS.find(d => d.name === name);
      return matchesAddSearch(name, def?.desc);
    });
  React.useEffect(() => {
    if (pickingRace && draftRaceAbility && !addableRaceOptions.includes(draftRaceAbility)) {
      setDraftRaceAbility(addableRaceOptions[0] ?? '');
    }
  }, [addableRaceOptions, draftRaceAbility, pickingRace]);

  React.useEffect(() => {
    if (addingGeneral && addingGeneralChoice && !addableGeneralOptions.includes(addingGeneralChoice)) {
      setAddingGeneralChoice(addableGeneralOptions[0] ?? undefined);
    }
  }, [addableGeneralOptions, addingGeneral, addingGeneralChoice]);

  // Small helper UI
  const StatusPill: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
    <span className={`rounded-full px-2 py-0.5 text-[10px] ${ok ? 'bg-emerald-600/30 text-emerald-200' : 'bg-amber-600/30 text-amber-100'}`}>
      {text}
    </span>
  );

  return (
    <Card className="sheet-card py-0">
      <CardContent className="p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Abilities</div>
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[11px]">
              Skill Points: {abilityUnlocksAvailable}
            </span>
            {raceName === 'Abomination' && (
              <StatusPill
                ok={abomMutationCount >= 1 && abomMutationCount <= mutationMax}
                text={`Mutations ${abomMutationCount}/${mutationMax}`}
              />
            )}
            {raceName === 'Altered' && (
              <StatusPill ok={alteredOK} text={`Core Power ${alteredCoreCount}/1`} />
            )}
          

          
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChangeAbilityUnlocks(Math.max(0, abilityUnlocksAvailable - 1))}
              disabled={readOnly || abilityUnlocksAvailable <= 0}
            >
              −
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChangeAbilityUnlocks(abilityUnlocksAvailable + 1)}
              disabled={readOnly}
            >
              +
            </Button>
          </div>

          {!showKindPicker ? (
            <Button
              type="button"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowKindPicker(true)}
              disabled={readOnly || abilityUnlocksAvailable <= 0}
              title={abilityUnlocksAvailable <= 0 ? 'Gain an ability unlock marker by improving a skill first' : ''}
            >
              + Add Ability
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const isOpen = addingGeneral;
                  if (isOpen) {
                    // closing
                    setAddingGeneral(false);
                    setAddingGeneralChoice(undefined);
                    setAddingGeneralLinkedSkillId(undefined);
                    setAddAbilitySearch('');
                  } else {
                    // opening: preselect first eligible option
                    const opts = generalDisplayOptionsFor("new-general");
                    setAddingGeneral(true);
                    setPickingRace(false);
                    setAddAbilitySearch('');
                    setAddingGeneralChoice(opts[0] ?? undefined);
                    setAddingGeneralLinkedSkillId(
                      skillDefs.find((skill) => canAddExpertiseForSkill(skill.id))?.id
                    );
                  }
                }}
                disabled={readOnly || abilityUnlocksAvailable <= 0}
              >
                Add General
              </Button>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={startAddRaceAbility}
                disabled={readOnly || abilityUnlocksAvailable <= 0 || !raceName || !anyAddable}
                title={
                  !raceName
                    ? 'Select a race first'
                    : abilityUnlocksAvailable <= 0
                    ? 'Gain an ability unlock marker by improving a skill first'
                    : (!anyAddable ? 'No addable abilities under current constraints' : '')
                }
              >
                Race Acquired
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onMouseDown={(e) => e.preventDefault()}
                onClick={cancelPickers}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {raceName === 'Abomination' && (
          <div className="sheet-panel mb-3 flex items-center gap-2 p-2">
            <span className="text-xs font-medium">Emerging Mutation stacks</span>

            <div className="flex items-center gap-1">
              {/* − button: decrement count, or remove row if going to 0 */}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!emRow) return;
                  const cur = emRow.count ?? 1;
                  if (cur > 1) {
                    patch(emRow.id, { count: cur - 1 });
                  } else {
                    remove(emRow.id);
                  }
                }}
                disabled={readOnly || emCount === 0}
                aria-label="Decrease Emerging Mutation"
              >
                −
              </Button>

              <Input
                readOnly
                className="h-7 w-12 text-center"
                value={emCount}
                aria-label="Emerging Mutation count"
              />

              {/* + button: increment count up to EMERGING_MAX, or create the row at 1 if missing */}
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (emRow) {
                    const cur = emRow.count ?? 1;
                    patch(emRow.id, { count: Math.min(EMERGING_MAX, cur + 1) });
                  } else {
                    add({ id: makeId('ab'), kind: 'race', name: 'Emerging Mutation', count: 1 });
                  }
                }}
                disabled={readOnly || emCount >= EMERGING_MAX}
                aria-label={`Increase Emerging Mutation (max ${EMERGING_MAX})`}
                title={`Increase Emerging Mutation (max ${EMERGING_MAX})`}
              >
                +
              </Button>
            </div>

            <span className="ml-2 text-[11px] text-white/70">
              Max mutations: {mutationMax}
            </span>
          </div>
        )}

       {/* RACE ability picker */}
{pickingRace && (
  <div className="sheet-panel space-y-3 p-3">
    <Input
      value={addAbilitySearch}
      onChange={(event) => setAddAbilitySearch(event.target.value)}
      placeholder="Search race abilities to add"
      className="border-white/15 bg-black/30 text-white placeholder:text-white/45"
    />
    <InlinePicker
      label="Select Race Ability"
      labelSuffix={raceName ? `for ${raceName}` : undefined}
      value={draftRaceAbility ?? ""}
      onChange={(v) => setDraftRaceAbility(v ?? "")}
      options={addableRaceOptions}
      optionKeyPrefix="race"
      selectTitle="Select a race ability to add"
      onConfirm={confirmAddRaceAbility}
      onCancel={() => setPickingRace(false)}
      confirmDisabled={abilityUnlocksAvailable <= 0 || !draftRaceAbility || !canAddName(draftRaceAbility)}
    />
  </div>
)}

{/* GENERAL ability picker */}
{addingGeneral && (
  <div className="sheet-panel space-y-3 p-3">
    <Input
      value={addAbilitySearch}
      onChange={(event) => setAddAbilitySearch(event.target.value)}
      placeholder="Search general abilities to add"
      className="border-white/15 bg-black/30 text-white placeholder:text-white/45"
    />
    <InlinePicker
      label="Select General Ability"
      value={addingGeneralChoice ?? ""}
      onChange={(v) => {
        setAddingGeneralChoice(v);
        if (v === 'Expertise' && !addingGeneralLinkedSkillId) {
          setAddingGeneralLinkedSkillId(
            skillDefs.find((skill) => canAddExpertiseForSkill(skill.id))?.id
          );
        }
      }}
      options={addableGeneralOptions}
      optionKeyPrefix="general"
      selectTitle="Select a general ability to add"
      onConfirm={() => {
        if (!addingGeneralChoice) return;
        if (addingGeneralChoice === 'Expertise') {
          if (!addingGeneralLinkedSkillId || !canAddExpertiseForSkill(addingGeneralLinkedSkillId)) return;
          addAbilityRow("general", addingGeneralChoice, { linkedSkillId: addingGeneralLinkedSkillId });
        } else {
          addAbilityRow("general", addingGeneralChoice);
        }
        setAddingGeneral(false);
        setAddingGeneralChoice(undefined);
        setAddingGeneralLinkedSkillId(undefined);
      }}
      onCancel={() => {
        setAddingGeneral(false);
        setAddingGeneralChoice(undefined);
        setAddingGeneralLinkedSkillId(undefined);
      }}
      confirmDisabled={
        abilityUnlocksAvailable <= 0 ||
        !addingGeneralChoice ||
        (addingGeneralChoice === 'Expertise' &&
          (!addingGeneralLinkedSkillId || !canAddExpertiseForSkill(addingGeneralLinkedSkillId)))
      }
    />

    {addingGeneralChoice === 'Expertise' && (
      <div className="grid gap-1">
        <Label className="text-sm">Expertise Skill</Label>
        <select
          className="h-10 w-full rounded-md border border-white/20 bg-background px-3 text-sm"
          value={addingGeneralLinkedSkillId ?? ''}
          onChange={(e) => setAddingGeneralLinkedSkillId(e.target.value || undefined)}
          disabled={readOnly}
        >
          <option value="">Select skill...</option>
          {skillDefs
            .filter((def) => canAddExpertiseForSkill(def.id))
            .map((def) => (
              <option key={def.id} value={def.id}>
                {def.label}
              </option>
            ))}
        </select>
      </div>
    )}
  </div>
)}
        

        {/* RACE ACQUIRED */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-white/80">Race Acquired</div>

          {!raceName && <div className="mt-2 mb-4 text-sm text-white/70">Select a race to use race abilities.</div>}
          {raceName && raceUnlocks.length === 0 && <div className="mt-2 mb-4 text-sm text-white/70">No race abilities added yet.</div>}
          {raceName && raceUnlocks.length > 0 && visibleRaceUnlocks.length === 0 && (
            <div className="mt-2 mb-4 text-sm text-white/70">No race abilities match that search.</div>
          )}

          {raceName && visibleRaceUnlocks.length > 0 && (
            <div className="grid gap-2">
              {visibleRaceUnlocks.map((a) => {
                const def = byName.get(a.name);
                const isAutoDefault = !!def?.auto;

                return (
                    <div key={a.id} className="sheet-panel p-3">
                    {/* header row: static label + (Default pill) + Remove + Show/Hide */}
                    <div className="grid gap-1">
                      <div className="flex items-center justify-between gap-2">
                        {/* LEFT: static name (no dropdown) */}
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-white">{a.name}</div>

                          {/* Default pill (locked) */}
                          {isAutoDefault && (
                            <span className="rounded-full bg-white/10 px-1.5 py-[2px] text-[10px] leading-none">
                              Default
                            </span>
                          )}
                        </div>

                        {/* RIGHT: actions */}
                        <div className="flex items-center gap-2">
                          {/* Remove only if not default */}
                          {!isAutoDefault && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => remove(a.id, true)} // or safeRemove(a.id) if you prefer
                              disabled={readOnly}
                              aria-label="Remove race ability"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => toggle(a.id)}
                            title={isOpen(a.id) ? 'Hide' : 'Show'}
                          >
                            {isOpen(a.id) ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* rules text */}
                    {isOpen(a.id) && (
                      <div className="mt-2 rounded-lg border border-amber-200/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
                        {def ? renderDesc(def) : `No description found for "${a.name}"${raceName ? ` in ${raceName}` : ''}.`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* GENERAL UNLOCKS */}
<div className="space-y-2">
  <div className="text-xs font-semibold uppercase text-white/80">General Unlocks</div>

  {/* Empty state (parity with Race) */}
  {generalUnlocks.length === 0 && (
    <div className="mt-2 mb-4 text-sm text-white/70">No general abilities added yet.</div>
  )}
  {generalUnlocks.length > 0 && visibleGeneralUnlocks.length === 0 && (
    <div className="mt-2 mb-4 text-sm text-white/70">No general abilities match that search.</div>
  )}

  {visibleGeneralUnlocks.length > 0 && (
    <div className="grid gap-2">
      {visibleGeneralUnlocks
        .map((a) => {
          const linkedSkillLabel = a.linkedSkillId ? skillDefs.find((skill) => skill.id === a.linkedSkillId)?.label : undefined;

          return (
            <div key={a.id} className="sheet-panel p-3">
              {/* compact header row: select + trash + show/hide */}
              {/* header row: static label + remove + show/hide */}
              <div className="grid gap-1">
                <div className="flex items-center justify-between gap-2">
                  {/* LEFT: static name (no dropdown) */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span>{a.name}</span>
                    {a.name === 'Expertise' && linkedSkillLabel && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-normal">
                        {linkedSkillLabel}
                      </span>
                    )}
                  </div>

                  {/* RIGHT: actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => remove(a.id, true)}
                      disabled={readOnly}
                      aria-label="Remove general ability"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(a.id)}
                      title={isOpen(a.id) ? 'Hide' : 'Show'}
                    >
                      {isOpen(a.id) ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* rules text */}
              {isOpen(a.id) && (
                <div className="mt-2 rounded-lg border border-amber-200/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
                  {a.name === 'Expertise' && (
                    <div className="mb-3 grid gap-1 whitespace-normal">
                      <Label className="text-xs text-white/80">Chosen Skill</Label>
                      <select
                        className="h-9 rounded-md border border-white/20 bg-background px-2 text-sm"
                        value={a.linkedSkillId ?? ''}
                        onChange={(e) => patch(a.id, { linkedSkillId: e.target.value || undefined })}
                        disabled={readOnly}
                      >
                        <option value="">Select skill...</option>
                        {skillDefs
                          .filter((skill) => canAddExpertiseForSkill(skill.id, a.id))
                          .map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  {GENERAL_UNLOCK_DEFS.find(d => d.name === a.name)?.desc ?? `No description found for "${a.name}".`}
                </div>
              )}
            </div>
          );
        })}
    </div>
  )}
</div>

      </CardContent>
    </Card>
  );
};

