'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import clsx from 'clsx';

import { makeId } from '@/domain/character.helpers';
import { meetsGeneralAbilityPrereqs } from '@/domain/character.abilityPrereqs';
import { ORIGIN_DEFS, type OriginDef } from '@/domain/character.origins';
import type {
  Character,
  RulesRegistry,
  AbilityEntry,
  AttributeDef,
  RaceName,
  SkillGroup,
  VehicleEntry
} from '@/domain/character.types';

import {
  applyRaceStartingSurvivability,
  RACE_OPTIONS,
  RACE_ABILITIES,
} from '@/domain/character.races';

import {
  GENERAL_UNLOCK_DEFS,
  type GeneralUnlockDef,
} from '@/data/abilities';

type CharacterCreationWizardProps = {
  registry: RulesRegistry;
  value: Character;
  onComplete: (character: Character) => void;
  onCancel?: () => void;
};

type CreationStep =
  | 'name'
  | 'race'
  | 'race_choices'
  | 'skills'
  | 'abilities'
  | 'origin'
  | 'origin_bonus'
  | 'review';

const STEPS: CreationStep[] = [
  'race',
  'race_choices',
  'skills',
  'abilities',
  'origin',
  'origin_bonus',
  'name',
  'review',
];

const STEP_LABELS: Record<CreationStep, string> = {
  name: 'Name',
  race: 'Race',
  race_choices: 'Race Abilities',
  skills: 'Skills',
  abilities: 'Abilities',
  origin: 'Origin',
  origin_bonus: 'Origin Bonus',
  review: 'Review',
};

type AbilityCreationGroup = SkillGroup | 'general' | 'race';

const SKILL_GROUP_LABELS: Record<SkillGroup, string> = {
  combat: 'Combat',
  magic: 'Magic',
  specialized: 'Specialized',
};

const ABILITY_GROUP_LABELS: Record<AbilityCreationGroup, string> = {
  general: 'General',
  combat: 'Combat',
  magic: 'Magic',
  specialized: 'Specialized',
  race: 'Race',
};

function CollapsibleChoiceSection({
  title,
  count,
  selectedCount,
  open,
  onToggle,
  children,
}: {
  title: string;
  count: number;
  selectedCount: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-amber-200/10 bg-black/15 p-3 sm:p-4">
      <div className={clsx('flex items-center justify-between gap-3', open && 'mb-3')}>
        <div>
          <div className="text-lg font-bold">{title}</div>
          <div className="text-xs text-white/60">
            {count} available{selectedCount > 0 ? ` · ${selectedCount} selected` : ''}
          </div>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={onToggle}>
          {open ? 'Hide' : 'Show'}
        </Button>
      </div>
      {open && children}
    </section>
  );
}

function createAbility(
  name: string,
  kind: AbilityEntry['kind'] = 'general'
): AbilityEntry {
  return {
    id: makeId('ability'),
    kind,
    name,
    count: 1,
  };
}

function createRaceAbility(name: string): AbilityEntry {
  const def = Object.values(RACE_ABILITIES).flat().find((ability) => ability.name === name);

  return {
    id: makeId('race'),
    kind: 'race',
    name,
    notes: def?.desc,
    count: 1,
  };
}

function removeRaceAbilities(
  abilities: AbilityEntry[] = []
): AbilityEntry[] {
  return abilities.filter((a) => a.kind !== 'race');
}

function applyRace(
  character: Character,
  race: RaceName
): Character {
  const raceDefs = RACE_ABILITIES[race] ?? [];

  const autoAbilities = raceDefs
    .filter((a) => a.auto)
    .map((a) => ({
      ...createRaceAbility(a.name),
      notes: a.desc,
    }));

  return applyRaceStartingSurvivability({
    ...character,
    race,
    abilities: [
      ...removeRaceAbilities(character.abilities),
      ...autoAbilities,
    ],
  }, race);
}

function applyOrigin(
  character: Character,
  origin: OriginDef
): Character {

    const nextAttributes = {
        ...character.attributes,
    };
  const originAbilities =
    origin.startingAbilities?.map((name) =>
      createAbility(name, 'general')
    ) ?? [];

  return {
  ...character,

  origin: origin.name,

  money: origin.startingCash,

  housing: {
    apartmentTier:
      origin.housing.name as Character['housing']['apartmentTier'],

    upgrades:
      origin.housing.upgrades ?? [],
  },

  items: [
    ...(character.items ?? []),

    ...(origin.startingItems ?? []).map(
      (itemName) => ({
        name: itemName,
      })
    ),
  ],

  vehicles: [
  ...(character.vehicles ?? []),

  ...(origin.vehicles ?? []).map(
    (vehicle): VehicleEntry => ({
      id: makeId('vehicle'),

      name: vehicle.name,

      survivability:
        vehicle.survivability ?? 0,

      capacity:
        vehicle.capacity ?? 0,

      topSpeed:
        vehicle.speed ?? '',

      flying:
        vehicle.movementType ===
        'Flying',

      size:
        vehicle.size ?? '',
    })
  ),
],

  attributes: nextAttributes,

  abilities: [
  ...(character.abilities ?? []),

  ...originAbilities,
],
};
}

function abilityMatchesOriginCategory(ability: GeneralUnlockDef, category?: string) {
  if (!category) return true;

  return (
    ability.category === category ||
    ability.subcategory === category ||
    ability.tags?.includes(category) ||
    ability.requiresSkillId === category ||
    ability.requiresAnySkillIds?.includes(category) ||
    Boolean(ability.requiresSkillLevels?.[category])
  );
}

type RaceChoiceGroup = {
  id: string;
  label: string;
  min: number;
  max: number;
  options: Array<{ name: string; desc: string }>;
};

function getRaceChoiceGroups(race?: RaceName): RaceChoiceGroup[] {
  if (!race) return [];

  const defs = RACE_ABILITIES[race] ?? [];
  const groups: RaceChoiceGroup[] = [];
  const mutationOptions = defs
    .filter((ability) => ability.group === 'mutation')
    .map((ability) => ({ name: ability.name, desc: ability.desc }));

  if (race === 'Abomination' && mutationOptions.length) {
    groups.push({
      id: 'mutation',
      label: 'Choose 0-3 Starting Mutations',
      min: 0,
      max: 3,
      options: mutationOptions,
    });
  }

  const oneOfIds = [...new Set(defs.map((ability) => ability.oneOf).filter(Boolean))] as string[];
  oneOfIds.forEach((oneOfId) => {
    const options = defs
      .filter((ability) => ability.oneOf === oneOfId)
      .map((ability) => ({ name: ability.name, desc: ability.desc }));

    if (options.length) {
      groups.push({
        id: oneOfId,
        label: oneOfId === 'altered-core' ? 'Choose Your Core Power' : 'Choose One',
        min: 1,
        max: 1,
        options,
      });
    }
  });

  return groups;
}

export default function CharacterCreationWizard({
  registry,
  value,
  onComplete,
  onCancel,
}: CharacterCreationWizardProps) {
  const [stepIndex, setStepIndex] = useState(0);

  const [character, setCharacter] = useState<Character>(() => ({
    ...value,
    abilities: value.abilities ?? [],
    attributes:
      value.attributes ??
      Object.fromEntries(
        registry.attributes.map((a) => [a.id, 1])
      ),
  }));
  const preSkillsCharacterRef = useRef<Character | null>(null);
  const preAbilityCharacterRef = useRef<Character | null>(null);
  const preOriginCharacterRef = useRef<Character | null>(null);
  const originAppliedCharacterRef = useRef<Character | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
  const [selectedRaceAbilities, setSelectedRaceAbilities] = useState<string[]>([]);
  const [selectedRaceChoices, setSelectedRaceChoices] = useState<Record<string, string[]>>({});
  const [abilitySearch, setAbilitySearch] = useState('');
  const [originAbilitySearch, setOriginAbilitySearch] = useState('');
  const [openSkillGroups, setOpenSkillGroups] = useState<Record<SkillGroup, boolean>>({
    combat: true,
    magic: false,
    specialized: false,
  });
  const [openAbilityGroups, setOpenAbilityGroups] = useState<Record<AbilityCreationGroup, boolean>>({
    general: true,
    combat: false,
    magic: false,
    specialized: false,
    race: false,
  });
  const [
  selectedOrigin,
  setSelectedOrigin,
] = useState<OriginDef | null>(null);
  const [
    selectedOriginSkill,
    setSelectedOriginSkill,
    ] = useState<string | null>(null);

    const [
    selectedOriginAbility,
    setSelectedOriginAbility,
    ] = useState<string | null>(null);

    const [
    selectedOriginReward,
    setSelectedOriginReward,
    ] = useState<number | null>(null);

  const step = STEPS[stepIndex];
  const raceChoiceGroups = useMemo(() => getRaceChoiceGroups(character.race as RaceName | undefined), [character.race]);
  const hasRaceChoices = raceChoiceGroups.length > 0;
  const raceChoicesComplete = raceChoiceGroups.every((group) =>
    (selectedRaceChoices[group.id] ?? []).length >= group.min &&
    (selectedRaceChoices[group.id] ?? []).length <= group.max
  );

  const availableGeneralAbilities = useMemo(() => {
    const selectedAbilityEntries: AbilityEntry[] = selectedAbilities.map((name) => ({
      id: `selected-${name}`,
      kind: 'general',
      name,
    }));
    const currentAbilities = [...(character.abilities ?? []), ...selectedAbilityEntries];

    return GENERAL_UNLOCK_DEFS.filter((a) => {
      return (
        !selectedAbilities.includes(a.name) &&
        meetsGeneralAbilityPrereqs(a, {
          abilities: currentAbilities,
          attrValues: character.attributes,
          skillDefs: registry.attributes,
        })
      );
    });
  }, [character.abilities, character.attributes, registry.attributes, selectedAbilities]);

  const availableOriginBonusAbilities = useMemo(() => {
    const freeAbilityChoice = selectedOrigin?.choices?.find((choice) => choice.type === 'free_ability');

    return GENERAL_UNLOCK_DEFS.filter((ability) => {
      if (!abilityMatchesOriginCategory(ability, freeAbilityChoice?.category)) return false;
      if (freeAbilityChoice?.ignoreQualifications) return true;

      return meetsGeneralAbilityPrereqs(ability, {
        abilities: character.abilities ?? [],
        attrValues: character.attributes,
        skillDefs: registry.attributes,
      });
    });
  }, [character.abilities, character.attributes, registry.attributes, selectedOrigin]);

  const abilitySearchTerm = abilitySearch.trim().toLowerCase();
  const visibleGeneralAbilities = abilitySearchTerm
    ? availableGeneralAbilities.filter((ability) =>
        [ability.name, ability.desc].join(' ').toLowerCase().includes(abilitySearchTerm)
      )
    : availableGeneralAbilities;
  const creationAbilityTotal = selectedAbilities.length + selectedRaceAbilities.length;
  const visibleRaceAbilities = (RACE_ABILITIES[character.race as RaceName] ?? []).filter((ability) => {
    if (ability.auto || ability.group === 'mutation' || ability.oneOf) return false;
    if ((character.abilities ?? []).some((owned) => owned.kind === 'race' && owned.name === ability.name)) return false;

    const ownedRaceNames = new Set([
      ...(character.abilities ?? []).filter((owned) => owned.kind === 'race').map((owned) => owned.name),
      ...selectedRaceAbilities,
    ]);
    if (ability.requiresAll?.some((name) => !ownedRaceNames.has(name))) return false;
    if (ability.requiresAny && !ability.requiresAny.some((name) => ownedRaceNames.has(name))) return false;

    const attrValues = character.attributes ?? {};
    if (ability.requiresAnySkillLevel != null && !Object.values(attrValues).some((level) => (level ?? 0) >= ability.requiresAnySkillLevel!)) {
      return false;
    }
    if (ability.requiresSkillLevels) {
      for (const [skillId, level] of Object.entries(ability.requiresSkillLevels)) {
        if ((attrValues[skillId] ?? 0) < level) return false;
      }
    }

    return !abilitySearchTerm || [ability.name, ability.desc].join(' ').toLowerCase().includes(abilitySearchTerm);
  });

  const originAbilitySearchTerm = originAbilitySearch.trim().toLowerCase();
  const visibleOriginBonusAbilities = originAbilitySearchTerm
    ? availableOriginBonusAbilities.filter((ability) =>
        [ability.name, ability.desc].join(' ').toLowerCase().includes(originAbilitySearchTerm)
      )
    : availableOriginBonusAbilities;

  const skillsByGroup = useMemo(() => {
    return registry.attributes.reduce(
      (groups, skill) => {
        groups[skill.group].push(skill);
        return groups;
      },
      { combat: [], magic: [], specialized: [] } as Record<SkillGroup, AttributeDef[]>
    );
  }, [registry.attributes]);

  const generalAbilitiesByGroup = useMemo(() => {
    const skillGroups = new Map(registry.attributes.map((skill) => [skill.id, skill.group]));

    return visibleGeneralAbilities.reduce(
      (groups, ability) => {
        const searchableText = [ability.name, ability.desc].join(' ').toLowerCase();
        const requiredSkillIds = [
          ability.requiresSkillId,
          ...Object.keys(ability.requiresSkillLevels ?? {}),
          ...(ability.requiresAnySkillIds ?? []),
        ].filter((id): id is string => Boolean(id));
        const requiredGroups = new Set(
          requiredSkillIds
            .map((id) => skillGroups.get(id))
            .filter((group): group is SkillGroup => Boolean(group))
        );
        const mentionedGroups = new Set(
          registry.attributes
            .filter((skill) => searchableText.includes(skill.label.toLowerCase()))
            .map((skill) => skill.group)
        );
        let group: Exclude<AbilityCreationGroup, 'race'> = 'general';

        if (requiredGroups.size === 1) {
          group = [...requiredGroups][0];
        } else if (mentionedGroups.size === 1) {
          group = [...mentionedGroups][0];
        } else if (/\b(magic|spell|curse|enchant|demon|summon|arcane)\b/.test(searchableText)) {
          group = 'magic';
        } else if (/\b(combat|attack|weapon|reload|ammunition|armor|ranged|melee)\b/.test(searchableText)) {
          group = 'combat';
        } else if (/\bspecialized skill\b/.test(searchableText)) {
          group = 'specialized';
        }

        groups[group].push(ability);
        return groups;
      },
      { general: [], combat: [], magic: [], specialized: [] } as Record<
        Exclude<AbilityCreationGroup, 'race'>,
        GeneralUnlockDef[]
      >
    );
  }, [registry.attributes, visibleGeneralAbilities]);

  const notableSkills = registry.attributes.filter((attr) => (character.attributes[attr.id] ?? 1) !== 1);

  function next() {
    setStepIndex((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    if (step === 'skills' && !hasRaceChoices) {
      setStepIndex(STEPS.indexOf('race'));
      return;
    }

    setStepIndex((s) => Math.max(0, s - 1));
  }

  function handleRaceSelect(race: RaceName) {
    const updated = applyRace(
      {
        ...character,
        abilities: character.abilities ?? [],
        attributes:
          character.attributes ??
          Object.fromEntries(
            registry.attributes.map((a) => [a.id, 1])
          ),
      },
      race
    );
    preSkillsCharacterRef.current = null;
    preAbilityCharacterRef.current = null;
    preOriginCharacterRef.current = null;
    originAppliedCharacterRef.current = null;
    setSelectedRaceChoices({});
    setCharacter(updated);
  }

  function confirmRace() {
    if (hasRaceChoices) {
      setStepIndex(STEPS.indexOf('race_choices'));
      return;
    }

    setStepIndex(STEPS.indexOf('skills'));
  }

  function toggleRaceChoice(group: RaceChoiceGroup, name: string) {
    setSelectedRaceChoices((current) => {
      const selected = current[group.id] ?? [];
      const nextSelected = selected.includes(name)
        ? selected.filter((item) => item !== name)
        : group.max === 1
          ? [name]
          : selected.length >= group.max
            ? selected
            : [...selected, name];

      return {
        ...current,
        [group.id]: nextSelected,
      };
    });
  }

  function confirmRaceChoices() {
    const choiceNames = raceChoiceGroups.flatMap((group) => selectedRaceChoices[group.id] ?? []);
    const raceChoiceIds = new Set(raceChoiceGroups.flatMap((group) => group.options.map((option) => option.name)));
    const nextAbilities = [
      ...(character.abilities ?? []).filter((ability) => !(ability.kind === 'race' && raceChoiceIds.has(ability.name))),
      ...choiceNames.map(createRaceAbility),
    ];

    setCharacter({
      ...character,
      abilities: nextAbilities,
    });
    setStepIndex(STEPS.indexOf('skills'));
  }

  function toggleSkill(skillId: string) {
    setSelectedSkills((prev) => {
      if (prev.includes(skillId)) {
        return prev.filter((s) => s !== skillId);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, skillId];
    });
  }

  function confirmSkills() {
    const skillBase = preSkillsCharacterRef.current ?? character;
    preAbilityCharacterRef.current = null;
    preOriginCharacterRef.current = null;
    originAppliedCharacterRef.current = null;

    const nextAttributes = {
      ...skillBase.attributes,
    };

    selectedSkills.forEach((skillId) => {
      nextAttributes[skillId] = 2;
    });

    setCharacter({
      ...skillBase,
      attributes: nextAttributes,
    });
    preSkillsCharacterRef.current = skillBase;

    next();
  }

  function toggleAbility(name: string) {
    setSelectedAbilities((prev) => {
      if (prev.includes(name)) {
        return prev.filter((a) => a !== name);
      }

      if (creationAbilityTotal >= 2) {
        return prev;
      }

      return [...prev, name];
    });
  }

  function toggleRaceAbility(name: string) {
    setSelectedRaceAbilities((prev) => {
      if (prev.includes(name)) {
        return prev.filter((a) => a !== name);
      }

      if (creationAbilityTotal >= 2) {
        return prev;
      }

      return [...prev, name];
    });
  }

  function confirmAbilities() {
    const abilityBase =
      preAbilityCharacterRef.current ??
      preOriginCharacterRef.current ??
      character;
    const nextAbilities = [
      ...(abilityBase.abilities ?? []),
      ...selectedAbilities.map((a) =>
        createAbility(a, 'general')
      ),
      ...selectedRaceAbilities.map(createRaceAbility),
    ];

    const updated = {
      ...abilityBase,
      abilities: nextAbilities,
    };

    preAbilityCharacterRef.current = abilityBase;
    preOriginCharacterRef.current = null;
    originAppliedCharacterRef.current = null;
    setCharacter(updated);

    next();
  }

    function confirmOrigin() {
    if (!selectedOrigin) return;

    const originBase = preOriginCharacterRef.current ?? character;
    const updated = applyOrigin(
        originBase,
        selectedOrigin
    );

    preOriginCharacterRef.current = originBase;
    originAppliedCharacterRef.current = updated;
    setCharacter(updated);

    const hasChoices =
        selectedOrigin.choices &&
        selectedOrigin.choices.length > 0;

    if (hasChoices) {
        next();
        return;
    }

    setStepIndex(
        STEPS.indexOf('name')
    );
    }
    function confirmOriginBonus() {
  if (!selectedOrigin) return;

  const originBase =
    originAppliedCharacterRef.current ??
    applyOrigin(preOriginCharacterRef.current ?? character, selectedOrigin);
  let updated: Character = {
    ...originBase,
  };

  const nextAttributes = {
    ...updated.attributes,
  };

  const nextAbilities = [
    ...(updated.abilities ?? []),
  ];
  const nextItems = [
  ...(updated.items ?? []),
];
const nextNotes = updated.notes ?? '';

  selectedOrigin.choices?.forEach(
    (choice, index) => {
      if (
        choice.type === 'skill_boost' &&
        selectedOriginSkill
      ) {
        nextAttributes[
          selectedOriginSkill
        ] = Math.min(
          5,
          (nextAttributes[
            selectedOriginSkill
          ] ?? 1) + choice.amount
        );
      }

      if (
        choice.type ===
          'free_ability' &&
        selectedOriginAbility
      ) {
        nextAbilities.push(
          createAbility(
            selectedOriginAbility,
            'general'
          )
        );
      }

      if (
        selectedOriginReward ===
        index
      ) {
        if (
        choice.type === 'item'
        ) {
        nextItems.push({
            name: choice.itemName,
        });
        }

        if (
            choice.type ===
            'custom'
            ) {
            updated.notes = [
                nextNotes,
                choice.description,
            ]
                .filter(Boolean)
                .join('\n');
            }
      }
    }
  );

  updated = {
    ...updated,
    attributes: nextAttributes,
    abilities: nextAbilities,
    items: nextItems,
  };

  setCharacter(updated);
  originAppliedCharacterRef.current = originBase;

  setStepIndex(
    STEPS.indexOf('name')
  );
}

  function finishCreation() {
    onComplete({
      ...character,
      name: character.name.trim(),
    });
  }

  return (
    <div className="mx-auto max-w-6xl p-4 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Character Creation
          </h1>

          <div className="mt-2 flex gap-2">
            {STEPS.map((s, idx) => (
              <div
                key={s}
                className={clsx(
                  'rounded-full px-3 py-1 text-sm',
                  idx === stepIndex
                    ? 'bg-red-700'
                    : 'bg-zinc-800'
                )}
              >
                {STEP_LABELS[s]}
              </div>
            ))}
          </div>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* STEP: NAME */}
      {step === 'name' && (
        <Card className="sheet-card py-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Name Your Character
              </h2>

              <p className="mt-2 text-sm text-white/70">
                You can change this later from the sheet header.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="creation-name">Name / Alias</Label>
              <Input
                id="creation-name"
                value={character.name}
                onChange={(event) =>
                  setCharacter({
                    ...character,
                    name: event.target.value,
                  })
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && character.name.trim()) next();
                }}
                placeholder="Character name"
                className="border-white/15 bg-black/30 text-white placeholder:text-white/45"
                autoFocus
              />
            </div>

              <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={back}
              >
                Back
              </Button>
              
              <Button
                type="button"
                disabled={!character.name.trim()}
                onClick={next}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP: RACE */}
      {step === 'race' && (
        <Card className="sheet-card py-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Choose Your Race
              </h2>

              <p className="mt-2 text-sm text-white/70">
                Select a race to gain automatic racial
                abilities.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {RACE_OPTIONS.map((race) => {
                const selected = character.race === race;

                return (
                  <button
                    key={race}
                    type="button"
                    onClick={() =>
                      handleRaceSelect(race)
                    }
                    className={clsx(
                      'rounded-lg border p-4 text-left transition',
                      selected
                        ? 'border-amber-200/60 bg-amber-500/10'
                        : 'border-amber-200/10 bg-black/20 hover:border-amber-200/40'
                    )}
                  >
                    <div className="text-lg font-bold">
                      {race}
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-white/70">
                      {RACE_ABILITIES[race]
                        .filter((a) => a.auto)
                        .map((a) => (
                          <div key={a.name}>
                            • {a.name}
                          </div>
                        ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!character.race}
                onClick={confirmRace}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP: RACE CHOICES */}
      {step === 'race_choices' && (
        <Card className="sheet-card py-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Race Abilities
              </h2>

              <p className="mt-2 text-sm text-white/70">
                Choose the starting race abilities required for {character.race}.
              </p>
            </div>

            <div className="space-y-6">
              {raceChoiceGroups.map((group) => {
                const selected = selectedRaceChoices[group.id] ?? [];

                return (
                  <div key={group.id} className="space-y-3">
                    <div>
                      <div className="text-lg font-bold">{group.label}</div>
                      <div className="text-sm text-white/70">
                        Selected: {selected.length} / {group.max}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {group.options.map((option) => {
                        const isSelected = selected.includes(option.name);

                        return (
                          <button
                            key={option.name}
                            type="button"
                            onClick={() => toggleRaceChoice(group, option.name)}
                            className={clsx(
                              'rounded-lg border p-4 text-left transition',
                              isSelected
                                ? 'border-amber-200/60 bg-amber-500/10'
                                : 'border-amber-200/10 bg-black/20 hover:border-amber-200/40'
                            )}
                          >
                            <div className="font-bold">{option.name}</div>
                            <div className="mt-2 text-sm text-white/70">{option.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={back}
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={!raceChoicesComplete}
                onClick={confirmRaceChoices}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP: SKILLS */}
      {step === 'skills' && (
        <Card className="sheet-card py-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Choose 3 Skills
              </h2>

              <p className="mt-2 text-sm text-white/70">
                Select exactly 3 skills to increase to
                level 2.
              </p>

              <div className="mt-2 text-sm">
                Selected: {selectedSkills.length} / 3
              </div>
            </div>

            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skillId) => {
                  const skill = registry.attributes.find((attr) => attr.id === skillId);
                  return (
                    <button
                      key={skillId}
                      type="button"
                      onClick={() => toggleSkill(skillId)}
                      className="rounded-full border border-amber-200/40 bg-amber-500/10 px-3 py-1 text-sm"
                      title="Remove selection"
                    >
                      {skill?.label ?? skillId} ×
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid gap-3">
              {(['combat', 'magic', 'specialized'] as SkillGroup[]).map((group) => {
                const items = skillsByGroup[group];
                const selectedCount = items.filter((attr) => selectedSkills.includes(attr.id)).length;

                return (
                  <CollapsibleChoiceSection
                    key={group}
                    title={SKILL_GROUP_LABELS[group]}
                    count={items.length}
                    selectedCount={selectedCount}
                    open={openSkillGroups[group]}
                    onToggle={() =>
                      setOpenSkillGroups((current) => ({ ...current, [group]: !current[group] }))
                    }
                  >
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {items.map((attr) => {
                        const selected = selectedSkills.includes(attr.id);

                        return (
                          <button
                            key={attr.id}
                            type="button"
                            onClick={() => toggleSkill(attr.id)}
                            className={clsx(
                              'rounded-lg border p-3 text-left transition',
                              selected
                                ? 'border-amber-200/60 bg-amber-500/10'
                                : 'border-amber-200/10 bg-black/20 hover:border-amber-200/40'
                            )}
                          >
                            <div className="font-medium">{attr.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleChoiceSection>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={back}
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={selectedSkills.length !== 3}
                onClick={confirmSkills}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP: ABILITIES */}
      {step === 'abilities' && (
        <Card className="sheet-card py-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Choose 2 Abilities
              </h2>

              <div className="mt-2 text-sm">
                Selected: {creationAbilityTotal} / 2
              </div>
            </div>

            <Input
              value={abilitySearch}
              onChange={(event) => setAbilitySearch(event.target.value)}
              placeholder="Search abilities"
              className="border-white/15 bg-black/30 text-white placeholder:text-white/45"
            />

            {creationAbilityTotal > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAbilities.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleAbility(name)}
                    className="rounded-full border border-amber-200/40 bg-amber-500/10 px-3 py-1 text-sm"
                    title="Remove selection"
                  >
                    {name} ×
                  </button>
                ))}
                {selectedRaceAbilities.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleRaceAbility(name)}
                    className="rounded-full border border-amber-200/40 bg-amber-500/10 px-3 py-1 text-sm"
                    title="Remove selection"
                  >
                    {name} ×
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-3">
              {(['general', 'combat', 'magic', 'specialized'] as const).map((group) => {
                const items = generalAbilitiesByGroup[group];
                if (items.length === 0) return null;

                const selectedCount = items.filter((ability) => selectedAbilities.includes(ability.name)).length;
                const isOpen = openAbilityGroups[group] || Boolean(abilitySearchTerm);

                return (
                  <CollapsibleChoiceSection
                    key={group}
                    title={`${ABILITY_GROUP_LABELS[group]} Abilities`}
                    count={items.length}
                    selectedCount={selectedCount}
                    open={isOpen}
                    onToggle={() =>
                      setOpenAbilityGroups((current) => ({ ...current, [group]: !current[group] }))
                    }
                  >
                    <div className="grid gap-3 md:grid-cols-2">
                      {items.map((ability) => {
                        const selected = selectedAbilities.includes(ability.name);

                        return (
                          <button
                            key={ability.name}
                            type="button"
                            onClick={() => toggleAbility(ability.name)}
                            className={clsx(
                              'rounded-lg border p-3 text-left transition',
                              selected
                                ? 'border-amber-200/60 bg-amber-500/10'
                                : 'border-amber-200/10 bg-black/20 hover:border-amber-200/40'
                            )}
                          >
                            <div className="font-bold">{ability.name}</div>
                            <div className="mt-2 text-sm text-white/70">{ability.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </CollapsibleChoiceSection>
                );
              })}

              {character.race && (
                <CollapsibleChoiceSection
                  title={`${character.race} Abilities`}
                  count={visibleRaceAbilities.length}
                  selectedCount={selectedRaceAbilities.length}
                  open={openAbilityGroups.race || Boolean(abilitySearchTerm)}
                  onToggle={() =>
                    setOpenAbilityGroups((current) => ({ ...current, race: !current.race }))
                  }
                >
                  <div className="mb-3 text-sm text-white/70">
                    Race abilities can count toward your 2 starting ability choices.
                  </div>
                  {visibleRaceAbilities.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {visibleRaceAbilities.map((ability) => {
                        const selected = selectedRaceAbilities.includes(ability.name);

                        return (
                          <button
                            key={ability.name}
                            type="button"
                            onClick={() => toggleRaceAbility(ability.name)}
                            className={clsx(
                              'rounded-lg border p-3 text-left transition',
                              selected
                                ? 'border-amber-200/60 bg-amber-500/10'
                                : 'border-amber-200/10 bg-black/20 hover:border-amber-200/40'
                            )}
                          >
                            <div className="font-bold">{ability.name}</div>
                            <div className="mt-2 text-sm text-white/70">{ability.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-white/70">
                      No race abilities currently available for this race and skill build.
                    </div>
                  )}
                </CollapsibleChoiceSection>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={back}
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={creationAbilityTotal !== 2}
                onClick={confirmAbilities}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP: ORIGIN */}
      {step === 'origin' && (
        <Card className="sheet-card py-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Choose Your Origin
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ORIGIN_DEFS.map((origin) => {
                const selected =
                  selectedOrigin?.id === origin.id;

                return (
                  <button
                    key={origin.id}
                    type="button"
                    onClick={() =>
                      setSelectedOrigin(origin)
                    }
                    className={clsx(
                      'rounded-lg border p-4 text-left transition',
                      selected
                        ? 'border-amber-200/60 bg-amber-500/10'
                        : 'border-amber-200/10 bg-black/20 hover:border-amber-200/40'
                    )}
                  >
                    <div className="text-lg font-bold">
                      {origin.name}
                    </div>

                    <div className="mt-2 text-sm text-white/70">
                      {origin.description}
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-white/70">
                    <div>
                        Starting Cash: {origin.startingCash} GB
                    </div>

                    <div>
                        Housing: {origin.housing.name}
                    </div>

                    {origin.housing.upgrades?.length ? (
                        <div>
                        Upgrades:{' '}
                        {origin.housing.upgrades.join(', ')}
                        </div>
                    ) : null}

                    {origin.startingAbilities?.length ? (
                        <div>
                        Abilities:{' '}
                        {origin.startingAbilities.join(', ')}
                        </div>
                    ) : null}

                    {origin.startingItems?.length ? (
                        <div>
                        Items:{' '}
                        {origin.startingItems.join(', ')}
                        </div>
                    ) : null}

                    {origin.vehicles?.length ? (
                        <div>
                        Vehicle:{' '}
                        {origin.vehicles
                            .map((v) => v.name)
                            .join(', ')}
                        </div>
                    ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={back}
              >
                Back
              </Button>

              <Button
                type="button"
                disabled={!selectedOrigin}
                onClick={confirmOrigin}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
{/* STEP: ORIGIN BONUS */}
{step === 'origin_bonus' && selectedOrigin && (
  <Card className="sheet-card py-0">
    <CardContent className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">
          Origin Bonus
        </h2>

        <div className="mt-2 text-sm text-white/70">
          {selectedOrigin.name}
        </div>
      </div>

      <div className="space-y-6">
        {selectedOrigin.choices?.map(
          (choice, index) => {
            if (
              choice.type === 'skill_boost'
            ) {
              const validSkills =
                registry.attributes.filter(
                  (attr) => {
                    if (
                      !choice.skillCategory
                    ) {
                      return true;
                    }

                    return (
                      attr.group ===
                      choice.skillCategory
                    );
                  }
                );

              return (
                <div
                  key={index}
                  className="space-y-3"
                >
                  <div className="font-bold">
                    Choose a Skill
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {validSkills.map((attr) => {
                      const selected =
                        selectedOriginSkill ===
                        attr.id;

                      return (
                        <button
                          key={attr.id}
                          type="button"
                          onClick={() =>
                            setSelectedOriginSkill(
                              attr.id
                            )
                          }
                          className={clsx(
                            'rounded-lg border p-3 text-left',
                            selected
                              ? 'border-amber-200/60 bg-amber-500/10'
                              : 'border-amber-200/10 bg-black/20'
                          )}
                        >
                          <div>
                            {attr.label}
                          </div>

                          <div className="text-xs text-white/60">
                            {attr.group}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (
              choice.type ===
              'free_ability'
            ) {
              return (
                <div
                  key={index}
                  className="space-y-3"
                >
                  <div className="font-bold">
                    Choose an Ability
                  </div>

                  <Input
                    value={originAbilitySearch}
                    onChange={(event) => setOriginAbilitySearch(event.target.value)}
                    placeholder="Search abilities"
                    className="border-white/15 bg-black/30 text-white placeholder:text-white/45"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    {visibleOriginBonusAbilities.map(
                      (ability) => {
                        const selected =
                          selectedOriginAbility ===
                          ability.name;

                        return (
                          <button
                            key={ability.name}
                            type="button"
                            onClick={() =>
                              setSelectedOriginAbility(
                                ability.name
                              )
                            }
                            className={clsx(
                              'rounded-lg border p-3 text-left',
                              selected
                                ? 'border-amber-200/60 bg-amber-500/10'
                                : 'border-amber-200/10 bg-black/20'
                            )}
                          >
                            <div className="font-bold">
                              {ability.name}
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setSelectedOriginReward(
                    index
                  )
                }
                className={clsx(
                  'w-full rounded-lg border p-4 text-left',
                  selectedOriginReward ===
                    index
                    ? 'border-amber-200/60 bg-amber-500/10'
                    : 'border-amber-200/10 bg-black/20'
                )}
              >
                {choice.type === 'item' && (
                  <div>
                    Item:{' '}
                    {choice.itemName}
                  </div>
                )}

                {choice.type ===
                  'custom' && (
                  <div>
                    {
                      choice.description
                    }
                  </div>
                )}
              </button>
            );
          }
        )}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={back}
        >
          Back
        </Button>

        <Button
        type="button"
        onClick={confirmOriginBonus}
        >
        Continue
        </Button>
      </div>
    </CardContent>
  </Card>
)}
      {/* STEP: REVIEW */}
      {step === 'review' && (
        <Card className="sheet-card py-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Review Character
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <Label>Name / Alias</Label>

                <div className="mt-1 text-lg">
                  {character.name}
                </div>
              </div>

              <div>
                <Label>Race</Label>

                <div className="mt-1 text-lg">
                  {character.race}
                </div>
              </div>

              <div>
                <Label>Origin</Label>

                <div className="mt-1 text-lg">
                  {character.origin}
                </div>
              </div>
            </div>

            <div>
              <Label>Abilities</Label>

              <div className="mt-3 grid gap-2">
                {(character.abilities ?? []).map(
                  (ability) => (
                    <div
                      key={ability.id}
                      className="rounded border border-white/10 bg-black/20 p-3"
                    >
                      {ability.name}
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <Label>Skills</Label>

              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {notableSkills.length === 0 && (
                  <div className="rounded border border-white/10 bg-black/20 p-3 text-sm text-white/70">
                    No skills above level 1.
                  </div>
                )}
                {notableSkills.map((attr) => (
                  <div
                    key={attr.id}
                    className="rounded border border-white/10 bg-black/20 p-3"
                  >
                    <div className="font-medium">
                      {attr.label}
                    </div>

                    <div className="text-sm text-white/70">
                      Level:{' '}
                      {character.attributes[attr.id]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={back}
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={finishCreation}
              >
                Finish Character
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
