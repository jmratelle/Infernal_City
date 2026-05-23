'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import clsx from 'clsx';

import type {
  Character,
  RulesRegistry,
  AbilityEntry,
  RaceName,
  VehicleEntry
} from './CharacterSheetDemo';

import {
  RACE_OPTIONS,
  RACE_ABILITIES,
} from './CharacterSheetDemo';

import {
  GENERAL_UNLOCK_DEFS,
} from '@/data/abilities';

type CharacterCreationWizardProps = {
  registry: RulesRegistry;
  value: Character;
  onComplete: (character: Character) => void;
  onCancel?: () => void;
};

type CreationStep =
  | 'race'
  | 'skills'
  | 'abilities'
  | 'origin'
  | 'origin_bonus'
  | 'review';

type OriginRewardChoice =
  | {
      type: 'skill_boost';
      amount: number;
      choose: number;
      skillCategory?: string;
    }
  | {
      type: 'free_ability';
      choose: number;
      ignoreQualifications?: boolean;
      category?: string;
    }
  | {
      type: 'item';
      itemName: string;
    }
  | {
      type: 'custom';
      description: string;
    };

type OriginVehicle = {
  name: string;

  buyValue?: number;

  unsellable?: boolean;

  survivability?: number;
  capacity?: number;

  speed?: string;

  movementType?: string;

  size?: string;

  armor?: {
    burn: number;
    corrosive: number;
    crush: number;
    slash: number;
    electric: number;
    freeze: number;
    pierce: number;
    curse: number;
  };

  abilities?: string[];
};

type OriginHousing = {
  name: string;

  upgrades?: string[];
};

type OriginDef = {
  id: string;

  name: string;

  description: string;

  startingCash: number;

  housing: OriginHousing;

  startingAbilities?: string[];

  startingItems?: string[];

  vehicles?: OriginVehicle[];

  choices?: OriginRewardChoice[];

  notes?: string[];
};

const ORIGIN_DEFS: OriginDef[] = [
  {
    id: 'damned',
    name: 'Damned',

    description:
      'You are indebted to a demon after bargaining away your soul for power, wealth, or another terrible boon.',

    startingCash: 1200,

    housing: {
      name: 'Dead End Apartment',
    },

    startingItems: [
      'Pact Ring',
    ],

    choices: [
      {
        type: 'skill_boost',
        amount: 2,
        choose: 1,
      },

      {
        type: 'item',
        itemName:
          'Vial of Temporary Resurrection',
      },

      {
        type: 'free_ability',
        choose: 1,
        ignoreQualifications: true,
      },

      {
        type: 'custom',
        description:
          'Custom ability or roleplaying element approved by GM',
      },
    ],

    notes: [
      'Character owes 100,000 GoldBacks to a demon.',
      'Defaulting on the contract causes the demon to claim the character’s soul.',
      'If the demon dies by the character’s hand or command, the contract defaults automatically.',
    ],
  },

  {
    id: 'hell-taxi-driver',
    name: 'Hell Taxi Driver',

    description:
      'You restored or inherited one of Babylon’s armored flying taxis.',

    startingCash: 800,

    housing: {
      name: 'Dead End Apartment',
      upgrades: ['Garage (Small)'],
    },

    vehicles: [
      {
        name: 'Refurbished Babylon Taxi',

        buyValue: 12000,

        unsellable: true,

        survivability: 3,
        capacity: 5,

        speed:
          '20 Units per turn',

        movementType: 'Flying',

        size: '3 x 4 Units',

        armor: {
          burn: 1,
          corrosive: 0,
          crush: 2,
          slash: 2,
          electric: 1,
          freeze: 1,
          pierce: 2,
          curse: 0,
        },

        abilities: [],
      },
    ],
  },

  {
    id: 'crusader',
    name: 'Crusader',

    description:
      'You or your family were involved in the Third Crusade and learned the horrors of war.',

    startingCash: 1200,

    housing: {
      name: 'Dead End Apartment',
    },

    choices: [
      {
        type: 'skill_boost',
        amount: 1,
        choose: 1,
        skillCategory: 'combat',
      },
    ],
  },

  {
    id: 'gatekeeper',
    name: 'Gatekeeper',

    description:
      'You belong to an ancient arcane order dedicated to limiting Hell’s influence.',

    startingCash: 1200,

    housing: {
      name: 'Dead End Apartment',
    },

    choices: [
      {
        type: 'free_ability',
        choose: 1,
        category: 'arcane',
      },
    ],
  },

  {
    id: 'commando',
    name: 'Commando',

    description:
      'You are a specialist trained for destruction and covert operations.',

    startingCash: 1200,

    housing: {
      name: 'Incognito Dwelling',
      upgrades: ['Workstation'],
    },
  },

  {
    id: 'ex-hellcorp',
    name: 'Ex-Hellcorp',

    description:
      'You once held a position within one of Babylon’s massive Hellcorps.',

    startingCash: 5000,

    housing: {
      name: 'Luxury Apartment',
    },
  },

  {
    id: 'wall-hopper',
    name: 'Wall Hopper',

    description:
      'You illegally entered Babylon through the Quarantine Zone.',

    startingCash: 1200,

    housing: {
      name: 'Dead End Apartment',
    },

    choices: [
      {
        type: 'skill_boost',
        amount: 1,
        choose: 1,
        skillCategory: 'specialized',
      },
    ],
  },

  {
    id: 'lab-rat',
    name: 'Lab Rat',

    description:
      'You inherited, escaped from, or discovered a hidden laboratory.',

    startingCash: 1200,

    housing: {
      name: 'Incognito Dwelling',
      upgrades: ['Chemistry Lab'],
    },
  },

  {
    id: 'cultist',
    name: 'Cultist',

    description:
      'Your history is tied to one of Babylon’s demonic cults.',

    startingCash: 1200,

    housing: {
      name: 'Dead End Apartment',
    },

    choices: [
      {
        type: 'free_ability',
        choose: 1,
        category: 'curse',
      },
    ],
  },

  {
    id: 'hired-gun',
    name: 'Hired Gun',

    description:
      'You already spent time working as a mercenary in Babylon.',

    startingCash: 1200,

    housing: {
      name: 'Dead End Apartment',
    },

    startingAbilities: [
      'Underworld Contact',
    ],

    notes: [
      'Choose one weapon under 1000 GoldBacks for free during character creation.',
    ],
  },

  {
    id: 'wastelander',
    name: 'Wastelander',

    description:
      'You survived the deadly wastelands beyond Babylon.',

    startingCash: 1200,

    housing: {
      name: 'Wasteland Hovel',
      upgrades: [
        'Garage/Bedroom Hybrid Room',
      ],
    },

    vehicles: [
      {
        name: 'Scrapbike',

        buyValue: 6000,

        unsellable: true,

        survivability: 3,
        capacity: 2,

        speed:
          '20 Units per turn',

        movementType: 'Land',

        size: '1 x 2 Units',

        armor: {
          burn: 0,
          corrosive: 0,
          crush: 0,
          slash: 0,
          electric: 0,
          freeze: 0,
          pierce: 0,
          curse: 0,
        },

        abilities: [],
      },
    ],
  },
];

const STEPS: CreationStep[] = [
  'race',
  'skills',
  'abilities',
  'origin',
  'origin_bonus',
  'review',
];

function makeId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
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
      id: makeId('race'),
      kind: 'race' as const,
      name: a.name,
      notes: a.desc,
      count: 1,
    }));

  return {
    ...character,
    race,
    abilities: [
      ...removeRaceAbilities(character.abilities),
      ...autoAbilities,
    ],
  };
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

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>([]);
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

  const availableGeneralAbilities = useMemo(() => {
    return GENERAL_UNLOCK_DEFS.filter((a) => {
      return !selectedAbilities.includes(a.name);
    });
  }, [selectedAbilities]);

  function next() {
    setStepIndex((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setStepIndex((s) => Math.max(0, s - 1));
  }

  function handleRaceSelect(race: RaceName) {
    const updated = applyRace(character, race);
    setCharacter(updated);
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
    const nextAttributes = {
      ...character.attributes,
    };

    selectedSkills.forEach((skillId) => {
      nextAttributes[skillId] = 2;
    });

    setCharacter({
      ...character,
      attributes: nextAttributes,
    });

    next();
  }

  function toggleAbility(name: string) {
    setSelectedAbilities((prev) => {
      if (prev.includes(name)) {
        return prev.filter((a) => a !== name);
      }

      if (prev.length >= 2) {
        return prev;
      }

      return [...prev, name];
    });
  }

  function confirmAbilities() {
    const nextAbilities = [
      ...(character.abilities ?? []),
      ...selectedAbilities.map((a) =>
        createAbility(a, 'general')
      ),
    ];

    setCharacter({
      ...character,
      abilities: nextAbilities,
    });

    next();
  }

    function confirmOrigin() {
    if (!selectedOrigin) return;

    const updated = applyOrigin(
        character,
        selectedOrigin
    );

    setCharacter(updated);

    const hasChoices =
        selectedOrigin.choices &&
        selectedOrigin.choices.length > 0;

    if (hasChoices) {
        next();
        return;
    }

    setStepIndex(
        STEPS.indexOf('review')
    );
    }
    function confirmOriginBonus() {
  if (!selectedOrigin) return;

  let updated: Character = {
    ...character,
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

  setStepIndex(
    STEPS.indexOf('review')
  );
}

  function finishCreation() {
    onComplete(character);
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
                  'rounded-full px-3 py-1 text-sm capitalize',
                  idx === stepIndex
                    ? 'bg-red-700'
                    : 'bg-zinc-800'
                )}
              >
                {s}
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

      {/* STEP: RACE */}
      {step === 'race' && (
        <Card className="bg-red-900">
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
                        ? 'border-white bg-black/40'
                        : 'border-white/10 bg-black/20 hover:border-white/40'
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
                onClick={next}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP: SKILLS */}
      {step === 'skills' && (
        <Card className="bg-red-900">
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

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {registry.attributes.map((attr) => {
                const selected =
                  selectedSkills.includes(attr.id);

                return (
                  <button
                    key={attr.id}
                    type="button"
                    onClick={() =>
                      toggleSkill(attr.id)
                    }
                    className={clsx(
                      'rounded-lg border p-4 text-left transition',
                      selected
                        ? 'border-white bg-black/40'
                        : 'border-white/10 bg-black/20 hover:border-white/40'
                    )}
                  >
                    <div className="font-medium">
                      {attr.label}
                    </div>

                    <div className="mt-1 text-xs text-white/60 capitalize">
                      {attr.group}
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
        <Card className="bg-red-900">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Choose 2 Abilities
              </h2>

              <div className="mt-2 text-sm">
                Selected: {selectedAbilities.length} / 2
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {availableGeneralAbilities.map((ability) => {
                const selected =
                  selectedAbilities.includes(
                    ability.name
                  );

                return (
                  <button
                    key={ability.name}
                    type="button"
                    onClick={() =>
                      toggleAbility(ability.name)
                    }
                    className={clsx(
                      'rounded-lg border p-4 text-left transition',
                      selected
                        ? 'border-white bg-black/40'
                        : 'border-white/10 bg-black/20 hover:border-white/40'
                    )}
                  >
                    <div className="font-bold">
                      {ability.name}
                    </div>

                    <div className="mt-2 text-sm text-white/70">
                      {ability.desc}
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
                disabled={selectedAbilities.length !== 2}
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
        <Card className="bg-red-900">
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
                        ? 'border-white bg-black/40'
                        : 'border-white/10 bg-black/20 hover:border-white/40'
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
  <Card className="bg-red-900">
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
                              ? 'border-white bg-black/40'
                              : 'border-white/10 bg-black/20'
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

                  <div className="grid gap-3 md:grid-cols-2">
                    {GENERAL_UNLOCK_DEFS.map(
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
                                ? 'border-white bg-black/40'
                                : 'border-white/10 bg-black/20'
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
                    ? 'border-white bg-black/40'
                    : 'border-white/10 bg-black/20'
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
        <Card className="bg-red-900">
          <CardContent className="space-y-6 p-6">
            <div>
              <h2 className="text-2xl font-bold">
                Review Character
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
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
                {registry.attributes.map((attr) => (
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