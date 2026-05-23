'use client';

import React, { useMemo, useState, useId, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import clsx from "clsx";
import { SelectableField } from "@/components/ui/SelectableField";
import DiceRoller from "@/components/DiceRoller";
import type { GeneralUnlockDef } from "@/data/abilities";
import { GENERAL_UNLOCK_DEFS } from "@/data/abilities";
import { ACCESSORY_OPTIONS, ACCESSORY_RULES, ARMOR_OPTIONS, ARMOR_STATS, WEAPON_OPTIONS, WEAPON_STATS, VEHICLE_STATS, ITEM_OPTIONS } from "@/data/items";


/**
 * Infernal City – Character Sheet (Applied Features)
 * - Stats: Identity + Skills + Resources (Generic Rerolls, Specific Rerolls, Goldbacks, Debt list, Recurring Costs list)
 * - Items: Armor slots with per-damage AVs, Accessories (max 4), Weapons as cards (max 2), Inventory, Stash, Vehicles
 * - Housing: Rent Cost, Apartment Tier dropdown, Upgrades list (repeatable)
 * - Conditions: Injuries counter + Condition rows (dropdown, optional Severity (X), Notes)
 * - Notes: Notes, People Met, Secrets
 * - Level Up: Current Mission checklist + Mission History
 */
type InlinePickerProps = {
  /** Main label. You can pass text or JSX. */
  label: React.ReactNode;
  /** Optional suffix (e.g., “for Dwarf”) shown inline with the label. */
  labelSuffix?: string;

  /** Current selected value (string). Use "" for none. */
  value: string;
  /** onChange handler. Pass undefined when empty. */
  onChange: (next: string) => void;

  /** Options to render in the <select>. */
  options: string[];
  /** Optional key prefix to keep React keys distinct across pickers. */
  optionKeyPrefix?: string;

  /** Click handlers. */
  onConfirm: () => void;
  onCancel: () => void;

  /** Disable confirm button (e.g., when no selection). */
  confirmDisabled?: boolean;

  /** Optional title for the select. */
  selectTitle?: string;

  /** Custom classes for the outer container. */
  className?: string;

  /** If true, the picker will scroll into view when mounted/toggled. */
  autoScrollIntoView?: boolean;
};


export function InlinePicker({
  label,
  labelSuffix,
  value,
  onChange,
  options,
  optionKeyPrefix = "opt",
  onConfirm,
  onCancel,
  confirmDisabled,
  selectTitle,
  className,
  autoScrollIntoView = true,
}: InlinePickerProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (autoScrollIntoView && ref.current) {
      ref.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [autoScrollIntoView]);

  return (
    <div
      ref={ref}
      className={clsx(
        "mb-3 grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end",
        "rounded-lg border border-white/10 bg-black/30 p-3",
        className
      )}
    >
      <div className="grid gap-1 md:col-span-2">
        <Label className="text-sm">
          {label} {labelSuffix ? <span className="opacity-80">{labelSuffix}</span> : null}
        </Label>

        <select
          className={clsx(
            "h-10 w-full text-sm px-3 rounded-md",
            "border border-white/20 bg-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          )}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          title={selectTitle}
        >
          {options.map((n, idx) => (
            <option key={`${optionKeyPrefix}-${idx}-${n}`} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:justify-end">
        <Button
          type="button"
          size="sm"
          className="w-full md:w-auto min-h-[44px]"
          variant="secondary"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onConfirm}
          disabled={!!confirmDisabled}
        >
          Add
        </Button>

        <Button
          type="button"
          size="sm"
          className="w-full md:w-auto min-h-[44px]"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
// ---------- Types ----------
export type SkillGroup = 'combat' | 'magic' | 'specialized';
export type AbilityKind = 'skill' | 'general' | 'race';

export type AbilityEntry = {
  id: string;
  kind: AbilityKind;
  name: string;
  linkedSkillId?: string; // optional; only used for 'skill' unlocks
  notes?: string;
  count?: number; // stacks for stackable abilities (defaults to 1)
  hidden?: boolean
};


export type AttributeDef = {
  id: string;
  label: string;
  group: SkillGroup;
  min?: number;
  max?: number;
  step?: number;
};

export type ResourceDef = { id: string; label: string; min?: number; max?: number };
export type ItemFieldDef = { id: string; label: string; type: 'text' | 'number' };

export type RulesRegistry = {
  attributes: AttributeDef[];
  resources: ResourceDef[];
  itemFields: ItemFieldDef[];
};

export type MissionLogEntry = {
  missionId: string;
  dateISO: string;
  successes: string[];
  notes?: string;
};

export type DebtEntry = { id: string; creditor: string; amount: number; notes?: string };
export type RecurringFrequency = 'Per-mission' | 'Every other mission' | 'Monthly' | 'Quarterly' | 'Yearly';
export type PaymentEvent = { paidAtISO: string; amount: number; note?: string };
export type RecurringCostEntry = {
  id: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  lastPaidISO?: string;
  history?: PaymentEvent[];
  notes?: string;
};

// Races
export type RaceAbilityDef = {
  name: string;
  desc: string;
  group?: string;        // e.g., "mutation" (Abomination)
  oneOf?: string;        // e.g., "altered-core" (Altered)
  auto?: boolean;        // default/starting
  requiresAll?: string[];     // must have ALL of these ability names
  requiresAny?: string[];     // must have AT LEAST ONE of these names
  requiresAnySkillLevel?: number;                 // must have ANY skill at >= this level
  requiresSkillLevels?: Record<string, number>;   // specific skillId -> min level
  stackable?: boolean; 
};
export type RaceName =
  | 'Abomination'
  | 'Altered'
  | 'Ascended'
  | 'Demonkin'
  | 'Draconem'
  | 'Fireborne'
  | 'Liches'
  | 'Maggot Lords'
  | 'Outsiders'
  | 'Rat Kings'
  | 'Succubus/Incubus';

export type ConditionName =
  | 'Addiction Tremors'
  | 'Bleeding'
  | 'Bonded Destiny'
  | 'Bound'
  | 'Burning'
  | 'Crippled'
  | 'Corroded'
  | 'Disoriented'
  | 'Enthralled'
  | 'Frightened'
  | 'Impaled'
  | 'Madness'
  | 'Paralysis'
  | 'Poisoned'
  | 'Poisoned (Deadly)'
  | 'Transformed'
  | 'Unconscious'
  | 'Critical';

export type ConditionEntry = {
  id: string;
  name: ConditionName;
  severity?: number;
  notes?: string;
};

export type WeaponEntry = {
  id: string;
  name: string;
  skill: string;
  action: string;
  idealRange: string;
  maxRange: string;
  currentAmmo: number;
  maxAmmo: number;
  damageTypes: string;
  arp: number;
};

export type DamageType =
  | 'Burn' | 'Corrosive' | 'Crush' | 'Slash'
  | 'Electric' | 'Freeze' | 'Pierce' | 'Curse';

export type ArmorAV = Record<DamageType, number>;
export type ArmorSlots = {
  head: { name: string; av: ArmorAV };
  body: { name: string; av: ArmorAV };
  lining: { name: string; av: ArmorAV };
};
export type ArmorCategory = "body" | "lining" | "head";

export type VehicleEntry = {
  id: string;
  name: string; // ← allows custom names too
  survivability?: number;
  capacity: number;
  topSpeed: string;
  flying: boolean;
  notes?: string;
  size: string
};

export type Character = {
  id: string;
  name: string;
  race?: string;
  origin?: string;
  money?: number;
  abilities?: AbilityEntry[];
  tallySpent?: Record<string, number>;      // tallies consumed by level-ups
  abilityUnlocksAvailable?: number;
  attributes: Record<string, number>;
  resources: Record<string, number>;
  items: Array<Record<string, string | number>>;
  stash?: Array<Record<string, string | number>>;

  armor: ArmorSlots;
  totalArmor?: ArmorAV;            // manual modifiers layered on top of equipped armor
  accessories?: string[];
  weapons?: WeaponEntry[];

  vehicles: VehicleEntry[];

  // Conditions
  injuries?: number; // 0-10
  conditions?: ConditionEntry[];

  // Notes
  notes?: string;
  peopleMet?: string;
  secrets?: string;

  // Level-up
  skillRerolls?: Record<string, number>;
  currentMissionSkills?: Record<string, boolean>;
  missionHistory?: MissionLogEntry[];

  // Housing (existing)
  housing: {
    rentCost?: number;
    apartmentTier?:
      | 'Wasteland Hovel'
      | 'Dead End Apartment'
      | 'Incognito Dwelling'
      | 'Incognito Compound'
      | 'Luxury Apartment'
      | 'Penthouse';
    upgrades?: string[];
  };

  // Debt/Recurring (existing)
  debt?: DebtEntry[];
  recurringCosts?: RecurringCostEntry[];
};

export type CharacterSheetProps = {
  registry: RulesRegistry;
  value: Character;
  onChange: (updated: Character) => void;
  readOnly?: boolean;

  initialCharacter?: Character;
};

// ---------- Constants ----------
const SKILL_REROLL_MIN = 0;
const SKILL_REROLL_MAX = 5;
const STORAGE_KEY = 'characterSheet:v1';

// ---------- Condition reference ----------
const CONDITION_TEXT: Record<ConditionName, (x?: number) => string> = {
  'Addiction Tremors': () =>
    'Reduce the Die Level of all DCs by one until you take another hit of the addictive substance that gave you this condition or one day has passed.',

  'Bleeding': (x = 1) =>
    `While under this condition, the target receives one injury at the end of their turn. A Cumulative Medical Skill DC can be made to reduce this condition by ${x}. When ${x} is equal to or less than zero, remove this condition.`,

  'Bonded Destiny': () =>
    'Both targets under the effect of this condition share any future injuries and conditions they receive. At the end of each of their turns, any affected target may attempt a Contested Envy DC with the caster to end this condition.',

  'Bound': () =>
    'While under this condition, the target remains magically or physically trapped within the source that gave them this condition. At the beginning of each of their turns, the target may make a cumulative DC, with the skill determined by the ability or source that inflicted the condition, to attempt to escape. If they fail, they remain trapped and cannot move or perform any actions.',

  'Burning': (x = 1) =>
    `While under this condition, at the beginning of the target's turn they must make a Burn Armor DC. If they fail or cannot make a Burn Armor DC, they take one injury. The target or another PC or NPC may spend two AP to reduce this condition’s X value by one by batting out the flames. This condition’s X value is also reduced by one at the end of the target’s turn. If ${x} is equal to zero, remove this condition.`,

  'Crippled': (x = 1) =>
    `While under this condition, the target receives a negative ${x} Die Level modifier to all DCs they make. If the target’s Crippled condition is four or greater, they gain the Unconscious condition at the start of each turn until they remove this condition. This condition can only be removed at a clinic or hospital.`,

  'Corroded': (x = 1) =>
    `While under this condition, all attacks against this target gain ArP equal to ${x}. This condition can be removed by an Engineering DC. This condition is also removed between missions.`,

  'Disoriented': (x = 1) =>
    `While under this condition, the target must make a cumulative Fortitude DC, with ${x} as the target number, at the beginning of each of their turns. If they fail, they lose three AP from their AP pool for that turn. At the end of each turn, the ${x} value decreases by one. When ${x} is equal to or less than zero, remove this condition.`,

  'Enthralled': () =>
    'While under this condition, the target becomes enamored with the source of their enthrallment. Their actions are controlled by the GM, but they generally listen to what their enthraller wants, including potentially turning on former comrades. They will not do anything that would cause immediate self-harm, such as jumping off a building or poisoning themselves. If the target would receive an injury, they must make an immediate DC, with the skill determined by the source of the enthrallment. On success, remove this condition. If the source attacks or injures the target, is killed, loses focus, or is destroyed, this condition immediately ends.',

  'Frightened': (x = 1) =>
    `While under this condition, the target must make a cumulative Fortitude check, with ${x} as the target number, at the beginning of each of their turns. If they fail, they must spend all their AP to move as far away as possible from the source that gave them this condition.`,

  'Impaled': (x = 1) =>
    `The target has been impaled by a physical object. While under this condition, the target's movement is reduced by ${x} Units per AP spent. A target may spend 1 AP to remove the object and reduce this condition's X by the X caused by the object. When ${x} is equal to or less than zero, remove this condition.`,

  'Madness': (x = 1) =>
    `While under this condition, the target must make a cumulative Fortitude DC equal to ${x} at the beginning of each of their turns. If they fail, they must spend their initial AP to move and attack the nearest PC or NPC, friend or foe, once as part of their turn. If they do not have a weapon equipped, they must use their strongest Martial Arts attack available.`,

  'Paralysis': (x = 1) =>
    `While under this condition, movement allowed from spending AP is reduced by ${x} Units per AP spent. The Reflex Skill is also reduced by ${x} Die Levels. Another character may make a Cumulative Medical Skill DC to reduce this condition by ${x}. When ${x} is equal to or less than zero, remove this condition.`,

  'Poisoned': (x = 1) =>
    `While under this condition, the target must make a Cumulative Survivability DC, with ${x} as the target number, at the beginning of each of their turns. If they fail, they receive one injury. If ${x} is equal to zero, remove this condition.`,

  'Poisoned (Deadly)': (x = 1) =>
    `While under this condition, the target must make a Cumulative Survivability DC, with ${x} as the target number, at the beginning of each of their turns. If they fail, they receive two injuries. If ${x} is equal to zero, remove this condition.`,

  'Transformed': (x = 1) =>
    `While under this condition, the target remains transformed into a small animal, such as a mouse, hedgehog, or chicken. At the end of each of the target’s turns, reduce the X value by one. When ${x} is equal to zero, remove this condition. All of their equipment disappears until the transformation ends. They lose all skills, equipment, and abilities for the duration of the transformation and instead use Reflex 4; all other skills are level one. If they receive an injury while in animal form, that injury transfers to their actual form. If they die while transformed, they die for real and immediately regain their original form.`,

  'Unconscious': () =>
    'While under this condition, the target cannot spend any AP. Remove this condition at the end of the target’s subsequent turn. All attacks against unconscious targets automatically hit, and the result of the Reflex save is considered a one for purposes of critical hits.',

  'Critical': () =>
    'While under this condition, the target must make a Critical condition DC at the end of their subsequent turns. If a target receives an injury while under this condition, they must make an immediate Critical condition DC. This condition can be removed with a Medical DC from another adjacent character.',
};


export const RACE_OPTIONS: RaceName[] = [
  'Abomination',
  'Altered',
  'Ascended',
  'Demonkin',
  'Draconem',
  'Fireborne',
  'Liches',
  'Maggot Lords',
  'Outsiders',
  'Rat Kings',
  'Succubus/Incubus',
];

export const RACE_ABILITIES: Record<RaceName, RaceAbilityDef[]> = {
  Abomination: [
    { name: 'Mutant Madness', desc: `While in combat, at the end of each turn gain Madness (X) where X = 1 + your number of mutations. (Madness {{MUTANT_MADNESS_X}}/turn)`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },
    { name: 'Emerging Mutation', desc: `You may select another mutation ability from the Abomination’s starting abilities. This ability may be selected more than once to choose an additional mutation. Each new mutation adds to your Mutant Madness.\nRequirement: Abomination race.`, stackable: true },

    { name: 'MUTATION: Additional Arms',        desc: 'MUTATION: You may have one additional weapon equipped at a time.', group: 'mutation' },
    { name: 'MUTATION: Additional Legs',        desc: 'MUTATION: You may move an additional Unit when spending AP on Movement.', group: 'mutation' },
    { name: 'MUTATION: Compound Eyes',          desc: 'MUTATION: You can see 360° around you at all times. You gain one Die Level on Observation DCs.', group: 'mutation' },
    { name: 'MUTATION: Chromatophores',         desc: 'MUTATION: You can change the color of your skin at will, allowing you to blend into the background of your environment to help with Hide DCs, or flash colorful patterns across your skin to intimidate enemies, or send visual messages. You gain one Die Level on Hide DCs.', group: 'mutation' },
    { name: 'MUTATION: Flesh-Rending Claws',    desc: 'MUTATION: Martial arts attacks gain the slash damage-type and ArP one.', group: 'mutation' },
    { name: 'MUTATION: Toxic Skin',             desc: 'MUTATION: Anyone who hits you with a melee attack, regardless of armor saves, gains the Poisoned (4) condition.', group: 'mutation' },
    { name: 'MUTATION: Regeneration',           desc: 'MUTATION: If you gain the Critical condition, you automatically recover from the condition after your second Critical Condition DC.', group: 'mutation' },
    { name: 'MUTATION: Heat Vision',            desc: 'MUTATION: You can sense infrared heat, allowing you to see warm-blooded creatures and heat signatures in the dark and obscuring conditions such as smoke. This allows you to ignore any negative modifiers from such conditions. ', group: 'mutation' },
    { name: 'MUTATION: Quills',                 desc: 'MUTATION: Anytime an attack is made against you from an adjacent space, if that attack misses or is blocked by an Armor Save, you create an automatic ArP one piercing hit against them that deals one injury.', group: 'mutation' },
    { name: 'MUTATION: Exoskeleton',            desc: 'MUTATION: You gain one innate Armor Value against all damage types except Curse.', group: 'mutation' },

    { name: 'Anger Management', desc: `Reduce the X received each turn as part of your Mutant Madness ability by one.\nRequirement: Abomination race.` },

    { name: 'Genetic Assimilation', desc: `If you can touch the blood of another target, including one who has died, you may take one of their abilities and add it to your own. This ability can be used for up to one day, then the ability is removed. Only one ability can be chosen at a time. If another ability is chosen, the prior ability is removed.\nRequirement: Abomination race.` },

    { name: 'Advanced Mutations', desc: `You may enhance your prior mutations. This ability may be selected multiple times, but you cannot choose the same enhancement twice, unless otherwise noted.\nRequirement: Abomination race.` },

    // Enhanced → require the base mutation + Advanced Mutations
    { name: 'Enhanced Additional Arms', desc: `You have two additional arms, and once per round can perform one of the following actions without spending any AP:\n• A Martial Arts or weapon attack\n• A reload action\n• Use a consumable\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Additional Arms'], stackable: true },
    { name: 'Enhanced Additional Legs', desc: `You may move an additional Unit per AP spent on movement.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Additional Legs'], stackable: true },
    { name: 'Enhanced Compound Eyes',   desc: `You gain advantage on contested DCs using your Observation skill.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Compound Eyes'], stackable: true },
    { name: 'Enhanced Chromatophores',  desc: `Your ability to change the color of your skin now includes bioluminescence. You can make any part of your body or skin pattern glow in different colors; you can also make your eyes glow to imitate a Demon or Demonkin’s appearance.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Chromatophores'], stackable: true },
    { name: 'Enhanced Flesh Rending Claws', desc: `Increase the ArP of your Martial Arts attacks by one. This ability may be selected more than once.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Flesh-Rending Claws'], stackable: true },
    { name: 'Enhanced Toxic Skin',      desc: `Increase the X value of the Poisoned condition your Toxic Skin inflicts by two. This ability may be selected more than once.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Toxic Skin'], stackable: true },
    { name: 'Enhanced Regeneration',    desc: `You remove the Critical condition automatically after your first Critical Condition DC.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Regeneration'], stackable: true },
    { name: 'Enhanced Heat Vision',     desc: `You can see the heat signatures of the footprints or handprints of warm-blooded beings for up to two minutes after they were made.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Heat Vision'], stackable: true },
    { name: 'Enhanced Quills',          desc: `Your Quills explode out with explosive force. The Quills ability now works on any targets up to three Units away.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Quills'], stackable: true },
    { name: 'Enhanced Exoskeleton',     desc: `You gain an additional innate Armor Value against all damage types except Curse.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Exoskeleton'], stackable: true },
  ],

  Altered: [
    { name: 'Unique Physiology', desc: `All medical costs are doubled.`, auto: true },
    { name: 'Electrokinesis',   desc: 'When using martial arts or an attack with a conductive melee weapon, you may add the electric damage type. You may short circuit any electronics you can touch, causing them to malfunction. You also gain three innate Armor Value vs the Electric damage-type. This armor value cannot be reduced by ArP or any means that would reduce Armor Values.', oneOf: 'altered-core' },
    { name: 'Perfect Reflexes', desc: 'You gain one Die Level whenever you make a reflex DC.', oneOf: 'altered-core' },
    { name: 'ESP',              desc: 'You gain the ability to read the thoughts of other mortals as long as you are within one Unit of them. Surface level thoughts and the target’s current preoccupations are immediately apparent to you. Gathering knowledge on a specific topic not at the forefront of the target’s thoughts may require you to spend some time near them in order to bring the knowledge you seek to the forefront of their thoughts through conversation or suggestion.', oneOf: 'altered-core' },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Perfect Conduit',   desc: `Increase your innate Electric Armor Value to six.\nRequirement: Requires Electrokinesis ability; Altered race.`, requiresAll: ['Electrokinesis'] },
    { name: 'Arcing Lightning',  desc: `You may add the Electric damage type to all attacks made with ranged weapons.\nRequirement: Requires Electrokinesis ability; Altered race.`, requiresAll: ['Electrokinesis'] },
    { name: 'Speed of Thought',  desc: `You may spend one AP’s worth of actions for free before an enemy group would take their first turn each combat round.\nRequirement: Requires Perfect Reflexes ability; Altered race.`, requiresAll: ['Perfect Reflexes'] },
    { name: 'I am Speed',        desc: `Regardless of initiative you may choose to take the first turn during a new battle round.\nRequirement: Requires Perfect Reflexes ability; Altered race.`, requiresAll: ['Perfect Reflexes'] },
    { name: 'Impulsive Command', desc: `For one AP, you may attempt to force an adjacent target to perform a simple action that fits within ~1 AP (≈3 seconds). The target must make a Fortitude DC. On a fail, they must perform that action. Once affected, a target can’t be affected again for one day.\nRequirement: Requires ESP ability; Altered race.`, requiresAll: ['ESP'] },
    { name: 'Predictive Combat', desc: `For one AP, select a target. You gain advantage on one attack OR on one Reflex DC against an attack from that target until the beginning of your next turn. May be triggered at any time, even during another’s turn. This is a focus ability.\nRequirement: Requires ESP ability; Altered race.`, requiresAll: ['ESP'] },

    { name: 'Ascendant', desc: `You may have two focus abilities active without losing focus.\nRequirement: Altered race.` },
    { name: 'Adaptive Immune System', desc: `Once you have suffered an injury from a damage type, you gain one innate Armor Value against that damage type until the following day. This stacks.\nRequirement: Altered race.` },
  ],

  Ascended: [
    { name: 'Winged Flight', desc: `You can fly; may move vertically as part of movement. While flying, unaffected by terrain hazards and falling as long as you can spend AP on movement.`, auto: true },
    { name: 'Weak Survivability', desc: `Your Survivability skill starts at Level 1.`, auto: true },
    { name: 'Falcon Speed', desc: `You may now move two additional Units per AP spent to move while flying.\nRequirement: Ascended race.` },
    { name: 'Aerial Dive', desc: `You may move twice as many Units per AP if flying and traveling downward.\nRequirement: Ascended race.` },
    { name: 'Death From Above', desc: `Add one ArP to an attack for each Unit you descended that turn (max 5) prior to making the attack.\nRequirement: Ascended race.` },
    { name: 'Aerial Maneuvering', desc: `All attacks against you receive a one Die Level penalty for every five Units you moved during your prior turn.\nRequirement: Ascended race.` },
    { name: 'Wing Blast', desc: `For one AP, attempt to blow an adjacent target back one space. Make a contested Bodybuilding DC; on a win, move the target one space away.\nRequirement: Ascended race.` },
  ],

  Demonkin: [
    { name: 'The Thirst', desc: `You must drink/receive blood as part of your diet. Start with 5 blood points. Lose 1 per day; at 0, you gain an injury (cannot be healed except by fresh blood). May spend blood points to use demonic abilities.`, auto: true },
    { name: 'Shapeshift', desc: `(1 blood point, 2 AP) Take on the form of any mortal (or a human-like Demon) for 1 hour. Focus ability.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Crimson Call', desc: `For two AP, sense the heartbeat of all living creatures within five Units (even if hidden) and read basic emotions (fear, anger, excitement).\nRequirement: Demonkin race.` },
    { name: 'Blood Bullet', desc: `For one blood point and two AP, fire three blood bullets at up to three targets within 10 Units. Make a Shurikens or Pistols attack for each. All considered ideal range, piercing damage, ArP 1.\nRequirement: Demonkin race.` },
    { name: 'Blood Blade',  desc: `For one blood point and 2 AP, form a scythe of blood that attacks all adjacent targets using Slashing Melee skill. Slash damage, ArP 2.\nRequirement: Demonkin race.` },
    { name: 'Crimson Cloud', desc: `For two blood points and two AP, create an obscuring red cloud (5×5 Units) centered on you. Attacks through/within the cloud suffer −2 Die Levels unless the attacker can sense through the mist.\nRequirement: Demonkin race.` },

    { name: 'Bloodthirsty', desc: `Increase your blood point pool to seven.\nRequirement: Demonkin race.` },
    { name: 'Blood Lord',   desc: `Increase your blood point pool to ten.\nRequirement: Requires Bloodthirsty; Demonkin race.`, requiresAll: ['Bloodthirsty'] },

    { name: 'Red Iron',     desc: `Add +1 ArP to all attacks that use blood points. May be taken multiple times.\nRequirement: Demonkin race.` },
    { name: 'Demonic Blood', desc: `Add the Curse damage type to all attacks that use blood points.\nRequirement: Demonkin race.` },

    { name: 'Blood Tendril',   desc: `For one blood point and one AP, extend a tendril to pull a target within three Units into an adjacent space. If unwilling, make a contested Bodybuilding DC; on a win, pull the target.\nRequirement: Demonkin race.` },
    { name: 'Extra Tendrils',  desc: `May be selected up to four times. Increase the number of tendrils (and therefore targets) of Blood Tendril by one.\nRequirement: Requires Blood Tendril; Demonkin race.`, requiresAll: ['Blood Tendril'] },
  ],

  Draconem: [
    { name: 'Dragon Hoard', desc: `+1 innate AV vs all damage at ≥500 Goldbacks; +2 at ≥5,000; +3 at ≥15,000. Must sleep on hoard within last 24h to gain bonus. Goldbacks must be set aside and are not spendable without reducing bonus.`, auto: true },
    { name: 'Gold Addiction', desc: `You can sense the presence of gold. When you gain gold/Goldbacks, make one Addiction DC (Fortitude): 4+ no effect; 1–3: gain Addiction Tremors.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Enhanced Hoard', desc: `Your Dragon Hoard can grant 4 innate Armor Value if you have ≥ 50,000 Goldbacks, and 5 if ≥ 100,000.\nRequirement: Draconem race.`, requiresAll: ['Dragon Hoard'] },
    { name: 'Golden Aura',   desc: `You may increase the Die Level of a DC by reducing all innate Armor Values granted by your dragon hoard by one.\nRequirement: Draconem race.`, requiresAll: ['Dragon Hoard'] },
    { name: 'Miserly Intuition', desc: `Reduce monthly costs of food and housing by 25% (rounded down).\nRequirement: Draconem race.` },
    { name: 'Dragon Breath', desc: `Once per day (2 AP), exhale molten metal in a straight line five Units long. The attack’s Die Level and ArP equal your hoard’s innate Armor Value bonus. Burning damage.\nRequirement: Draconem race.`, requiresAll: ['Dragon Hoard'] },
  ],

  Fireborne: [
    { name: 'Fireproof', desc: `+4 innate Burn Armor Value.`, auto: true },
    { name: 'Burning Strikes', desc: `Your Martial Arts and Melee attacks gain Burn. On hit (regardless of saves), you may inflict Burning (X) up to your innate Burn AV. If you do, you also gain Burning with the same X.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Heat Training', desc: `Gain +2 innate Armor Value versus the Burn damage type.\nRequirement: Fireborne race.` },
    { name: 'Overheat',      desc: `Expend all innate Burn Armor Values to attack all adjacent targets, inflicting Burning (X) where X equals AV expended. AV restores between missions.\nRequirement: Fireborne race.`, requiresAll: ['Fireproof'] },
    { name: 'Heat Transfer', desc: `Add the Burn damage type to attacks with ranged weapons.\nRequirement: Fireborne race.` },
    { name: 'Smokescreen',   desc: `While under the Burning condition, all attacks against you suffer a −1 Die Level penalty.\nRequirement: Fireborne race.` },
  ],

  Liches: [
    { name: 'Hollow', desc: `You do not need to breathe or consume food; cannot gain diet bonuses; no food budgeting required.`, auto: true },
    { name: 'Fleshy Prison', desc: `+1 Die Level to all Survivability DCs, including Critical Condition DCs.`, auto: true },
    { name: 'High Survivability', desc: `Your Survivability skill starts at Level 3.`, auto: true },

    { name: 'Being of Decay',    desc: `You are immune to the Poisoned and Poisoned (Deadly) conditions.\nRequirement: Lich race.` },
    { name: 'Rigor Mortis',      desc: `Anytime you would receive a condition other than Crippled or Critical, you may instead choose to take one injury.\nRequirement: Lich race.` },
    { name: 'Defibrillator',     desc: `If hit by Electric damage (even if no damage is dealt), gain +1 bonus AP for your next turn. Stacks.\nRequirement: Lich race.` },
    { name: 'Unfazed by Pain',   desc: `Ignore negative Die Level modifiers from your first Crippled condition.\nRequirement: Lich race.` },
  ],

  'Maggot Lords': [
    { name: 'Mouths to Feed',    desc: `Your food costs are doubled.`, auto: true },
    { name: 'Cannibal Carnage',  desc: `(4 AP) Devour a dead/incapacitated target: recover up to 3 injuries; observers must make Gluttony DC or gain Frightened (4). 1/day.`, auto: true },
    { name: 'Giant’s Strength',  desc: `+1 Die Level to all Bodybuilding DCs.`, auto: true },
    { name: 'Large Form',        desc: `Takes 2 capacity in vehicles; when forced to move, move half Units (rounded down).`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Rot Eaters',         desc: `You can eat anything without ill effects and cannot be poisoned by anything you devour.\nRequirement: Maggot Lord race.` },
    { name: 'Maggot Retaliation', desc: `When attacked from an adjacent space, the maggots inside you make a free retaliatory attack: Die Level 2, Slash damage, ArP 1. May be taken up to three times; each time increases ArP by 1 and Die Level by 1.\nRequirement: Maggot Lord race.` },
    { name: 'Immovable Object',   desc: `You are immune to abilities that force you to move.\nRequirement: Maggot Lord race.` },
    { name: 'Corrosive Bile',     desc: `Three times per day, make a Bodybuilding attack (range 5 Units). On a hit it applies Corroded (5). Deals no damage.\nRequirement: Maggot Lord race.` },
  ],

  Outsiders: [
    { name: 'Pure Soul', desc: `At the beginning of every mission you gain three generic re-rolls usable any time during that mission. They do not stack between missions.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },
    { name: 'Human Perseverance', desc: `Once per mission, you may make two rolls for a DC and add the results together.\nRequirement: Outsider race.` },
    { name: 'Adaptability', desc: `Improve a skill of your choice by one level.\nRequirement: Outsider race.` },
    { name: 'Absolute Mastery', desc: `Choose one skill that is at level five and reset it to level one. You now have advantage on all DCs using this skill.\nRequirement: Must have a level five skill; Outsider race.`, requiresAnySkillLevel: 5 },
  ],

  'Rat Kings': [
    { name: 'Kinship of the Reviled', desc: `Speak with/understand pests (rodents, insects, spiders, snakes). They’re friendly and can do simple tasks for food.`, auto: true },
    { name: 'Prey Instincts', desc: `+1 Die Level to Observation DCs.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Overlooked and Hunted', desc: `Once per combat round, you may reroll an Evade (Reflex) DC.\nRequirement: Rat King race.` },
    { name: 'Commander of the Swarm', desc: `Focus ability (2 AP): gather a controllable swarm (flies/roaches/etc.) in an adjacent space.\nPestilent Swarm (NPC): AP 3, Reflex 4, Martial Arts 2; Flying; Move 4 Units per AP; Armor (all): 0; Overwhelm: shares a space and imposes −1 Die Level on that target’s DCs; Fragile: destroyed upon receiving an injury.\nRequirement: Rat King race.` },
    { name: 'Soul Bond', desc: `Possess and share the senses of a willing pest (mouse/spider/snake/insect). Focus—remains until you move or the host is injured/killed.\nRequirement: Rat King race.` },
    { name: 'Secret Broker', desc: `Access a secret vermin spy network (Gutter Keepers) to trade secrets for information. Beware: members may sell secrets to outsiders.\nRequirement: Rat King race.` },
    { name: 'Compressed Ribs', desc: `Squeeze through impossibly small spaces—if your head can fit, you can pass through.\nRequirement: Rat King race.` },
  ],

  'Succubus/Incubus': [
    { name: 'Ethereal Beauty', desc: `+1 Die Level to Negotiation DCs vs humanoid mortals.`, auto: true },
    { name: 'Lamprey’s Kiss', desc: `(2 AP) Kiss a humanoid mortal. Recover 1 injury OR steal 2 AP. Auto vs willing/incapacitated; vs unwilling make contested Martial Arts DC. Once per turn.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Transcendent Attraction', desc: `Your Ethereal Beauty and Lamprey’s Kiss abilities now work on Demons.\nRequirement: Succubus/Incubus race.`, requiresAll: ['Ethereal Beauty', 'Lamprey’s Kiss'] },
    { name: 'Paralyzing Gaze', desc: `For 2 AP, force a target to make a contested Lust skill DC. On a fail, they cannot use AP on movement on their next turn.\nRequirement: Succubus/Incubus race.` },
    { name: 'Draining Touch',  desc: `You may apply the effects of Lamprey’s Kiss to any physical touch, including Martial Arts attacks.\nRequirement: Succubus/Incubus race.`, requiresAll: ['Lamprey’s Kiss'] },
    { name: 'Addictive Saliva', desc: `Your saliva becomes addictive. Targets of Lamprey’s Kiss contact your saliva. You may spend 1 AP to coat a Shuriken or Melee weapon with your saliva for an attack this turn. Targets make an Addiction (Fortitude) DC:\n• 4+: No effect (successful DC)\n• 1–3: Craves—gain Addiction Tremors condition\nRequirement: Succubus/Incubus race.`, requiresAll: ['Lamprey’s Kiss'] },
  ],
};

export interface SkillUnlockChoice {
name: string;
desc: string;
requiresSkillId?: string;
requiresMinLevel?: number;
oneOf?: string;
stackMax?: number;
}


export interface SkillUnlockDef {
skill: string;
level: number;
choices: SkillUnlockChoice[];
requiresSkillId?: string;
requiresMinLevel?: number;
group?: string;        // e.g., "mutation" (Abomination)
oneOf?: string;        // e.g., "altered-core" (Altered)
auto?: boolean;        // default/starting
requiresAll?: string[];     // must have ALL of these ability names
requiresAny?: string[];     // must have AT LEAST ONE of these names
requiresAnySkillLevel?: number;                 // must have ANY skill at >= this level
requiresSkillLevels?: Record<string, number>;   // specific skillId -> min level
stackable?: boolean; 
stackMax?: number; 
}

// Skill ID bundles for gating
const COMBAT_SKILLS = [
  'automatics','droneOperation','martialArts','marksman','meleeWeapons',
  'pistols','propellants','shotguns','shurikens',
];

const RANGED_SKILLS = [
  'automatics','marksman','pistols','propellants','shotguns','shurikens',
];


const HIDEOUT_UPGRADES = [
  'Bedroom',
  'Occult Library',
  'Chemistry Lab',
  'Workstation',
  'Garage (Small)',
  'Garage (Large)',
  'Menagerie',
  'Clinic',
  'Gym',
  'Simulator',
  'Shooting Range',
  'Personal Dojo',
  'Ritual Chamber',
  'CCTV and Server Room',
  'Game Room',
  'Practice Vault',
] as const;

const HIDEOUT_TIER_DETAILS = {
  'Wasteland Hovel': {
    rentCost: 0,
    rooms: '1 bedroom',
    threat: 'High',
    summary: 'Makeshift wasteland shelter with the roughest event table in the game.',
    events: 'Abaddon, raiders, ferals, and food theft are all on the table in 5.2.',
  },
  'Dead End Apartment': {
    rentCost: 1000,
    rooms: '1 bedroom + 1 empty room',
    threat: 'Medium',
    summary: 'Cheap two-room apartment on the bad side of town.',
    events: 'Protection rackets, burglary, and drive-by shootings.',
  },
  'Incognito Dwelling': {
    rentCost: 2000,
    rooms: '1 bedroom + 1 empty room',
    threat: 'Low',
    summary: 'Hidden dwelling with better secrecy than a Dead End Apartment.',
    events: 'Mostly peaceful, but it can still roll into Dead End Apartment events.',
  },
  'Incognito Compound': {
    rentCost: 3000,
    rooms: '1 bedroom + 2 empty rooms',
    threat: 'Low',
    summary: 'Three-room secret compound tailored for privacy.',
    events: 'Mostly peaceful, but it can still roll into Dead End Apartment events.',
  },
  'Luxury Apartment': {
    rentCost: 5000,
    rooms: '1 bedroom + 3 empty rooms',
    threat: 'Low',
    summary: 'Respectable spire apartment with room to expand.',
    events: 'Security bribes and burglary are the main 5.2 risks here.',
  },
  Penthouse: {
    rentCost: 10000,
    rooms: '1 bedroom + 5 empty rooms',
    threat: 'Low',
    summary: 'Top-tier residence with the safest event table in the ruleset.',
    events: 'The 5.2 event table is pure peace on a D6.',
  },
} as const;

const HIDEOUT_UPGRADE_DETAILS: Record<(typeof HIDEOUT_UPGRADES)[number], { price: number; summary: string }> = {
  Bedroom: {
    price: 2000,
    summary: 'Required sleeping space. Each occupant needs a bedroom unless they are sharing a bed.',
  },
  'Occult Library': {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for Arcane or Demonology.',
  },
  'Chemistry Lab': {
    price: 3500,
    summary: 'Required 5.2 workspace for crafting drugs, medicines, and poisons.',
  },
  Workstation: {
    price: 3500,
    summary: 'Required 5.2 workspace for crafting equipment and consumables.',
  },
  'Garage (Small)': {
    price: 3500,
    summary: 'Stores 1 vehicle. Without a garage, vehicles cost 500 Goldbacks to store safely between missions.',
  },
  'Garage (Large)': {
    price: 10000,
    summary: 'Stores up to 3 vehicles and covers ongoing maintenance space.',
  },
  Menagerie: {
    price: 3500,
    summary: 'Required for pets. Supports up to 3 small animals.',
  },
  Clinic: {
    price: 3500,
    summary: 'Provides the treatment space needed for injury recovery during Infernal Living.',
  },
  Gym: {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for Bodybuilding or Parkour.',
  },
  Simulator: {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for Drone Operation or Pilot.',
  },
  'Shooting Range': {
    price: 6500,
    summary: 'Adds one future success tally each Infernal Living phase for Automatics, Marksman, Pistols, Propellants, or Shotguns.',
  },
  'Personal Dojo': {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for Martial Arts, Melee Weapons, or Shurikens.',
  },
  'Ritual Chamber': {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for the seven curse skills.',
  },
  'CCTV and Server Room': {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for Hacking or Observation.',
  },
  'Game Room': {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for Bluff or Negotiation.',
  },
  'Practice Vault': {
    price: 3500,
    summary: 'Adds one future success tally each Infernal Living phase for Hide or Thievery.',
  },
};

const DAMAGE_TYPES: DamageType[] = [
  'Burn','Corrosive','Crush','Slash','Electric','Freeze','Pierce','Curse'
];

// ---------- Helpers ----------
function clamp(n: number, min = 0, max = 9999) {
  return Math.max(min, Math.min(max, n));
}
function set<K extends keyof Character>(draft: Character, key: K, val: Character[K]): Character {
  return { ...draft, [key]: val } as Character;
}
function sumArmorValues(slots: ArmorSlots): ArmorAV {
  const total = emptyAV();
  for (const slot of Object.values(slots)) {
    for (const damageType of DAMAGE_TYPES) {
      total[damageType] += slot.av?.[damageType] ?? 0;
    }
  }
  return total;
}
function groupBy<T extends { group: SkillGroup }>(arr: T[]): Record<SkillGroup, T[]> {
  return arr.reduce(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    { combat: [], magic: [], specialized: [] } as Record<SkillGroup, T[]>
  );
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10); // consistent "YYYY-MM-DD" format
}


function renderConditionText(name: ConditionName, severity?: number) {
  const fn = CONDITION_TEXT[name];
  if (!fn) {
    // Defensive: show a visible fallback if a key ever mismatches
    return `No rules text found for "${name}".`;
  }
  // For (X) conditions, many entries use `x` in the copy; default to 1 if omitted
  return fn(severity ?? 1);
}


function makeId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function tallyFromHistory(history: MissionLogEntry[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const entry of history || []) {
    for (const skillId of entry.successes) {
      totals[skillId] = (totals[skillId] || 0) + 1;
    }
  }
  return totals;
}

function effectiveTallies(history: MissionLogEntry[], spent: Record<string, number> = {}): Record<string, number> {
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

// ---------- Subcomponents ----------
const IdentitySection: React.FC<{
  value: Character;
  onChange: (c: Character) => void;
  readOnly?: boolean;
  raceLocked?: boolean;
  onToggleRaceLock?: () => void;
}> = ({ value, onChange, readOnly, raceLocked = false, onToggleRaceLock }) => {
  const idBase = useId();
  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="grid gap-4 p-4 md:grid-cols-4 text-white">
        <div className="grid gap-2">
          <Label htmlFor={`${idBase}-name`}>Name/Alias</Label>
          <Input
            id={`${idBase}-name`}
            value={value.name}
            onChange={(e) => onChange(set(value, 'name', e.target.value))}
            placeholder="Character name"
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idBase}-race`}>Race</Label>
          <div className="flex items-center gap-2">
            <select
              id={`${idBase}-race`}
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={(value.race as RaceName) ?? ''}
              onChange={(e) =>
                onChange(set(value, 'race', (e.target.value || undefined) as RaceName | undefined))
              }
              disabled={readOnly || raceLocked}
              title={raceLocked ? "Race is locked" : "Select race"}
            >
              <option value="" disabled>Select race…</option>
              {RACE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <Button
            type="button"
            size="sm"
            className="bg-black text-white hover:bg-black/80"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onToggleRaceLock}
            title={raceLocked ? "Click to allow editing your race" : "Click to lock your race"}
          >
            {raceLocked ? "Edit Race" : "Lock Race"}
          </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idBase}-origin`}>Origin</Label>
          <Input
            id={`${idBase}-origin`}
            value={value.origin ?? ''}
            onChange={(e) => onChange(set(value, 'origin', e.target.value))}
            placeholder="Character's origin"
            disabled={readOnly}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idBase}-goldbacks`}>Goldbacks</Label>
          <Input
            id={`${idBase}-goldbacks`}
            inputMode="numeric"
            pattern="[0-9]*"
            value={value.money ?? 0}
            onChange={(e) =>
              onChange(
                set(value, 'money', clamp(parseInt(e.target.value || '0', 10), 0, 999999))
              )
            }
            placeholder="0"
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const GroupedSkillsGrid: React.FC<{
  defs: AttributeDef[];
  values: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
  readOnly?: boolean;
}> = ({ defs, values, onChange, readOnly }) => {
  const groups = groupBy(defs);
  const [open, setOpen] = useState<Record<SkillGroup, boolean>>({
    combat: true,
    magic: true,
    specialized: true,
  });
  const toggle = (g: SkillGroup) =>
    setOpen((o) => ({ ...o, [g]: !o[g] }));

  const Section = ({ grp, title, items }: { grp: SkillGroup; title: string; items: AttributeDef[] }) => (
  <Card className="shadow-sm bg-red-900">
    <CardContent className="p-4 text-white">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-white">{title}</div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggle(grp)}
        >
          {open[grp] ? 'Hide' : 'Show'}
        </Button>
      </div>

      {open[grp] && (
        <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          {[...items].sort((a, b) => {
              const A = a.label.toLowerCase();
              const B = b.label.toLowerCase();
              return A < B ? -1 : A > B ? 1 : 0;
            }).map((def) => {
            const min = def.min ?? 1;
            const max = def.max ?? 5;
            const step = def.step ?? 1;
            const val = values[def.id] ?? min;

            return (
              <div key={def.id} className="grid items-start gap-1.5">
                <Label htmlFor={`attr-${def.id}`}>{def.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id={`attr-${def.id}`}
                    value={val}
                    min={min}
                    max={max}
                    step={step}
                    // Prevent typing; rely on the − / + buttons
                    readOnly
                    className="w-15"
                    disabled={readOnly}
                    aria-describedby={`attr-${def.id}-help`}
                   />
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        onChange({ ...values, [def.id]: clamp(val - step, min, max) })
                      }
                      disabled={readOnly}
                    >
                      −
                    </Button>
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        onChange({ ...values, [def.id]: clamp(val + step, min, max) })
                      }
                      disabled={readOnly}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);



  return (
  <div className="grid gap-4 text-white">
    <Section grp="combat" title="Combat" items={groups.combat} />
    <Section grp="magic" title="Magic" items={groups.magic} />
    <Section grp="specialized" title="Specialized" items={groups.specialized} />
  </div>
);
};


const ResourcesPanel: React.FC<{
  resourceDefs: ResourceDef[];
  resourceValues: Record<string, number>;
  onChangeResources: (next: Record<string, number>) => void;
  abilities: AbilityEntry[];
  skillDefs: AttributeDef[];
  skillRerolls: Record<string, number>;
  onChangeSkillRerolls: (next: Record<string, number>) => void;
  debt: DebtEntry[];
  onChangeDebt: (next: DebtEntry[]) => void;
  recurring: RecurringCostEntry[];
  onChangeRecurring: (next: RecurringCostEntry[]) => void;
  readOnly?: boolean;
}> = ({
  resourceDefs,
  resourceValues,
  onChangeResources,
  abilities,
  skillDefs,
  skillRerolls,
  onChangeSkillRerolls,
  debt,
  onChangeDebt,
  recurring,
  onChangeRecurring,
  readOnly,
}) => {
  const expertiseAbilities = (abilities ?? []).filter(
    (ability) => ability.kind === 'general' && ability.name === 'Expertise' && ability.linkedSkillId
  );
  const expertiseSkillIds = Array.from(new Set(expertiseAbilities.map((ability) => ability.linkedSkillId!)));
  const expertiseDefs = expertiseSkillIds
    .map((id) => skillDefs.find((def) => def.id === id))
    .filter((def): def is AttributeDef => Boolean(def));
  const addDebt = () =>
    onChangeDebt([...(debt || []), { id: makeId('debt'), creditor: '', amount: 0 }]);
  /*const removeDebt = (id: string) =>
    onChangeDebt((debt || []).filter((d) => d.id !== id));*/ //Commented this out as it in unused currently. Leaving in case I want it again

  const addRecurring = () =>
    onChangeRecurring([
      ...(recurring || []),
      { id: makeId('rc'), name: '', amount: 0, frequency: 'Monthly' },
    ]);
  /*const removeRecurring = (id: string) =>
    onChangeRecurring((recurring || []).filter((r) => r.id !== id));*/ //Commented this out as it in unused currently. Leaving in case I want it again

  return (
    <div className="grid gap-4">
      {/* Global resources */}
      <Card className="shadow-sm bg-red-900">
        <CardContent className="p-4 text-white">
          <div className="mb-2 text-sm font-medium text-muted-foreground text-white">Resources</div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 justify-center">
            {resourceDefs.map((def) => {
              const min = def.min ?? 0;
              const max = def.max ?? 9;
              const val = resourceValues[def.id] ?? min;
              return (
                <div key={def.id} className="grid items-center gap-1.5">
                <Label htmlFor={`res-${def.id}`}>{def.label}</Label>
                <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              id={`res-${def.id}`}
              value={val}
              min={min}
              max={max}
              step={1}
              readOnly   // ← prevent typing
              className="w-15"
              disabled={readOnly}
              aria-label={`${def.label} value`}
            />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const min = def.min ?? 0;
                      const max = def.max ?? 9;
                      const cur = resourceValues[def.id] ?? min;
                      onChangeResources({ ...resourceValues, [def.id]: clamp(cur - 1, min, max) });
                    }}
                    disabled={readOnly}
                    aria-label={`${def.label} decrement`}
                  >
                    −
                  </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const min = def.min ?? 0;
                const max = def.max ?? 9;
                const cur = resourceValues[def.id] ?? min;
                onChangeResources({ ...resourceValues, [def.id]: clamp(cur + 1, min, max) });
              }}
              disabled={readOnly}
              aria-label={`${def.label} increment`}
            >
              +
            </Button>
          </div>
        </div>
              );
            })}
          </div>

      {/* Per-skill rerolls */}
          {expertiseDefs.length > 0 && (
            <>
              <div className="mt-4">
                <div className="text-sm font-medium text-white">Specific Rerolls</div>
                <div className="mt-1 text-xs leading-relaxed text-white/70">
                  These only appear for skills selected by the Expertise ability. Set them manually at the start of each
                  mission to match the chosen skill&apos;s current level.
                </div>
              </div>
              {(['combat', 'magic', 'specialized'] as SkillGroup[]).map((grp) => {
                const skills = expertiseDefs.filter((def) => def.group === grp);
                if (skills.length === 0) return null;
            const title = grp === 'combat' ? 'Combat' : grp === 'magic' ? 'Magic' : 'Specialized';
            return (
              <div key={grp} className="mb-3">
                <div className="mb-1 text-xs font-medium text-white">{title}</div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 text-white">
                  {skills.map((def) => {
                    const cur = clamp(
                      skillRerolls[def.id] ?? 0,
                      SKILL_REROLL_MIN,
                      SKILL_REROLL_MAX
                    );
                    return (
                      <div key={def.id} className="grid items-start gap-1.5">
                        <Label htmlFor={`reroll-${def.id}`} className="text-xs">
                          {def.label} Specific Rerolls
                        </Label>
                        <div className="flex items-center gap-2">

                          <Input
                            id={`reroll-${def.id}`}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-15"
                            value={cur}
                            min={SKILL_REROLL_MIN}
                            max={SKILL_REROLL_MAX}
                            readOnly  // ← prevent typing
                            disabled={readOnly}
                            aria-label={`${def.label} rerolls value`}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const cur = clamp(skillRerolls[def.id] ?? 0, SKILL_REROLL_MIN, SKILL_REROLL_MAX);
                              onChangeSkillRerolls({ ...skillRerolls, [def.id]: clamp(cur - 1, SKILL_REROLL_MIN, SKILL_REROLL_MAX) });
                            }}
                            disabled={readOnly}
                            aria-label={`${def.label} rerolls decrement`}
                          >
                            −
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const cur = clamp(skillRerolls[def.id] ?? 0, SKILL_REROLL_MIN, SKILL_REROLL_MAX);
                              onChangeSkillRerolls({ ...skillRerolls, [def.id]: clamp(cur + 1, SKILL_REROLL_MIN, SKILL_REROLL_MAX) });
                            }}
                            disabled={readOnly}
                            aria-label={`${def.label} rerolls increment`}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Debt & Recurring Costs */}
      <Card className="shadow-sm bg-red-900">
        <CardContent className="p-4 space-y-4 text-white">
          <div>
            <div className="mb-2 text-sm font-medium text-muted-foreground text-white">Debt</div>
            <div className="space-y-2">
              {(debt || []).map((d, i) => (
                <div key={d.id} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <Input
                    className="sm:col-span-5"
                    placeholder="Creditor"
                    value={d.creditor}
                    onChange={(e) => {
                      const next = [...(debt || [])];
                      next[i] = { ...d, creditor: e.target.value };
                      onChangeDebt(next);
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    className="sm:col-span-3"
                    placeholder="Amount (GB)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(d.amount ?? 0)}
                    onChange={(e) => {
                      const next = [...(debt || [])];
                      next[i] = {
                        ...d,
                        amount: clamp(parseInt(e.target.value || '0', 10), 0, 999999),
                      };
                      onChangeDebt(next);
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    className="sm:col-span-3"
                    placeholder="Notes/Terms"
                    value={d.notes ?? ''}
                    onChange={(e) => {
                      const next = [...(debt || [])];
                      next[i] = { ...d, notes: e.target.value };
                      onChangeDebt(next);
                    }}
                    disabled={readOnly}
                  />
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="ghost"
                      size="icon"
                      onClick={() => onChangeDebt((debt || []).filter((x) => x.id !== d.id))}
                      disabled={readOnly}
                      aria-label="Remove debt"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onMouseDown={(e) => e.preventDefault()} size="sm" onClick={addDebt} disabled={readOnly}>
                <Plus className="mr-1 h-4 w-4" /> Add Debt
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium text-muted-foreground text-white">Recurring Costs & Diet</div>
            <div className="space-y-2">
              {(recurring || []).map((r, i) => (
                <div key={r.id} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <Input
                    className="sm:col-span-4"
                    placeholder="Name"
                    value={r.name}
                    onChange={(e) => {
                      const next = [...(recurring || [])];
                      next[i] = { ...r, name: e.target.value };
                      onChangeRecurring(next);
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Amount (GB)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(r.amount ?? 0)}
                    onChange={(e) => {
                      const next = [...(recurring || [])];
                      next[i] = {
                        ...r,
                        amount: clamp(parseInt(e.target.value || '0', 10), 0, 999999),
                      };
                      onChangeRecurring(next);
                    }}
                    disabled={readOnly}
                  />
                  <select
                    className="sm:col-span-3 rounded-md border bg-background px-3 py-2 text-sm"
                    value={r.frequency}
                    onChange={(e) => {
                      const next = [...(recurring || [])];
                      next[i] = { ...r, frequency: e.target.value as RecurringFrequency };
                      onChangeRecurring(next);
                    }}
                    disabled={readOnly}
                  >
                    <option value="Per-mission">Per mission</option>
                    <option value="Every other mission">Every other mission</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  <div className="md:col-span-5">
</div>

                  {/* Log Payment + last paid display */}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const next = [...(recurring || [])];
                        const ev: PaymentEvent = {
                          paidAtISO: new Date().toISOString(),
                          amount: r.amount ?? 0,
                          note: r.notes ?? '',
                        };
                        next[i] = {
                          ...r,
                          lastPaidISO: ev.paidAtISO,
                          history: [ ...(r.history ?? []), ev ],
                        };
                        onChangeRecurring(next);
                      }}
                      disabled={readOnly}
                    >
                      Log Payment
                    </Button>
                    <span className="text-xs text-white/80">
                      {r.lastPaidISO ? `Last paid: ${formatDate(r.lastPaidISO)}` : 'Not paid yet'}
                    </span>
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="ghost"
                      size="icon"
                      onClick={() => onChangeRecurring((recurring || []).filter((x) => x.id !== r.id))}
                      disabled={readOnly}
                      aria-label="Remove recurring"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onMouseDown={(e) => e.preventDefault()} size="sm" onClick={addRecurring} disabled={readOnly}>
                <Plus className="mr-1 h-4 w-4" /> Add Recurring
              </Button>
              {/* Payment History (per recurring item) */}
              {(recurring || []).some((r) => (r.history?.length ?? 0) > 0) && (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-medium text-white">Payment History</div>
                  <ol className="space-y-2">
                    {(recurring || []).map((r) => (
                      (r.history?.length ?? 0) > 0 && (
                        <li key={r.id} className="rounded-xl bg-black/20 p-3">
                          <div className="text-sm font-medium">{r.name || 'Untitled Cost'}</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/80">
                            {(r.history ?? []).map((ev, idx) => (
                              <span key={`${r.id}-${idx}`} className="rounded-full bg-black/40 px-2 py-0.5">
                                {formatDate(ev.paidAtISO)} — {ev.amount} GB
                              </span>
                            ))}
                          </div>
                        </li>
                      )
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ItemsTable: React.FC<{
  title: string;
  rows: Array<Record<string, string | number>>;
  onChange: (next: Array<Record<string, string | number>>) => void;
  readOnly?: boolean;
  maxItems?: number;
  currentTotal?: number;
}> = ({ title, rows, onChange, readOnly, maxItems = Infinity, currentTotal = 0 }) => {
  const idBase = useId();

  // Adds a new blank item row
  const addRow = () =>
    onChange([
      ...rows,
      { name: "", type: "", qty: 1, category: "", subcategory: "" },
    ]);

  // Removes an item row by index
  const removeRow = (i: number) =>
    onChange(rows.filter((_, idx) => idx !== i));

  // Helper to patch a specific row
  const patchRow = (i: number, updates: Record<string, string | number>) => {
    const next = [...rows];
    next[i] = { ...next[i], ...updates };
    onChange(next);
  };

  // Numeric clamping utility
  const clamp = (n: number, min = 0, max = 9999) =>
    Math.max(min, Math.min(max, n));

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">{title}</div>
          <Button
            type="button"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={addRow}
            disabled={
              readOnly ||
              (currentTotal ?? 0) >= (maxItems ?? Infinity)
            }
            title={
              (currentTotal ?? 0) >= (maxItems ?? Infinity)
                ? "Inventory is full"
                : undefined
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>

        {/* Table Body */}
        <div className="space-y-2">
          {rows.map((row, i) => {
            const type = String(row.type ?? "");
            const sub = String(row.subcategory ?? "");
            const name = String(row.name ?? "");

            const typeOptions = Object.keys(ITEM_OPTIONS) as (keyof typeof ITEM_OPTIONS)[];
            const subOptions =
              type === "Weapons" || type === "Armor"
                ? (Object.keys(
                    ITEM_OPTIONS[type as "Weapons" | "Armor"]
                  ) as string[])
                : [];
            const itemOptions =
              type === "Weapons" || type === "Armor"
                ? sub && ITEM_OPTIONS[type as "Weapons" | "Armor"][sub as keyof (typeof ITEM_OPTIONS)["Weapons" | "Armor"]]
                : type
                ? ITEM_OPTIONS[type as keyof typeof ITEM_OPTIONS]
                : [];

            return (
              <div
                key={`${idBase}-row-${i}`}
                className="inventory-row flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2 md:p-3"
              >
                {/* Type Dropdown */}
                <select
                  className="w-32 rounded-md border border-white/20 bg-background px-2 py-1 text-sm text-white"
                  value={
                    typeOptions.includes(type as keyof typeof ITEM_OPTIONS)
                      ? type
                      : "" // default to Select
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      patchRow(i, { type: "Other", subcategory: "", name: "" });
                    } else {
                      patchRow(i, {
                        type: val as keyof typeof ITEM_OPTIONS | "Other",
                        subcategory: "",
                        name: "",
                      });
                    }
                  }}
                  disabled={readOnly}
                >
                  <option value="">Type</option>
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>

                {/* Subcategory (for Weapons / Armor) */}
                {subOptions.length > 0 && (
                  <select
                    className="w-32 rounded-md border border-white/20 bg-background px-2 py-1 text-sm text-white"
                    value={
                      subOptions.includes(sub)
                        ? sub
                        : "" // default to Select
                    }

                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        patchRow(i, { subcategory: "Other", name: "" });
                      } else {
                        patchRow(i, { subcategory: val, name: "" });
                      }
                    }}
                    disabled={readOnly}
                  >
                    <option value="">Subtype</option>
                    {subOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                )}

                {/* Item Dropdown */}
                {type && (
                  <>
                    {((type === "Weapons" || type === "Armor") && sub) ||
                    (type !== "Weapons" && type !== "Armor") ? (
                      itemOptions && Array.isArray(itemOptions) && (
                        <select
                          className="w-40 rounded-md border border-white/20 bg-background px-2 py-1 text-sm text-white"
                          value={
                            itemOptions.includes(name)
                              ? name
                              : "" // default to Select
                          }

                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__OTHER__") {
                              patchRow(i, { name: "" });
                            } else {
                              patchRow(i, { name: val });
                            }
                          }}
                          disabled={readOnly}
                        >
                          <option value="">Item</option>
                          {itemOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                          <option value="__OTHER__">Other</option>
                        </select>
                      )
                    ) : null}
                  </>
                )}

                {/* Custom input (Other item) */}
                {name === "" && (
                  <Input
                    className="w-40 h-8 text-sm px-2"
                    placeholder="Custom item"
                    value={name}
                    onChange={(e) => patchRow(i, { name: e.target.value })}
                    disabled={readOnly}
                  />
                )}

                {/* Qty field */}
                <div className="flex items-center gap-1">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-14 h-8 text-center text-sm"
                    readOnly
                    value={row.qty ?? 1}
                    disabled={readOnly}
                  />
                  <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-9 w-9 text-base"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    patchRow(i, {
                      qty: clamp(Number(row.qty ?? 1) - 1, 0, 99),
                    })
                  }
                  disabled={readOnly}
                >
                  −
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-9 w-9 text-base"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if ((currentTotal ?? 0) < (maxItems ?? Infinity)) {
                      patchRow(i, {
                        qty: clamp(Number(row.qty ?? 1) + 1, 0, 99),
                      });
                    }
                  }}
                  disabled={readOnly || (currentTotal ?? 0) >= (maxItems ?? Infinity)}
                  title={
                    (currentTotal ?? 0) >= (maxItems ?? Infinity)
                      ? "Inventory is full"
                      : undefined
                  }
                >
                  +
                </Button>

                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => removeRow(i)}
                  disabled={readOnly}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {rows.length === 0 && (
            <div className="text-sm text-white/70">No items yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


const EquippedGear: React.FC<{
  accessories: string[];
  onChangeAccessories: (next: string[]) => void;
  weapons: WeaponEntry[];
  onChangeWeapons: (next: WeaponEntry[]) => void;
  readOnly?: boolean;
}> = ({ accessories, onChangeAccessories, weapons, onChangeWeapons, readOnly }) => {
  const addAccessory = () => accessories.length < 4 && onChangeAccessories([...accessories, '']);
  const removeAccessory = (i: number) =>
    onChangeAccessories(accessories.filter((_, idx) => idx !== i));
  const accessoryNotes = Array.from(
    new Set(accessories.map((name) => name.trim()).filter(Boolean))
  )
    .map((name) => ({ name, text: ACCESSORY_RULES[name] }))
    .filter((entry): entry is { name: string; text: string } => Boolean(entry.text));
  const normalizeWeaponCategory = (category: string) => {
    if (category === 'Melee') return 'Melee Weapons';
    if (category === 'Drones') return 'Drone Operation';
    return category;
  };
  const weaponCategories = Object.keys(WEAPON_OPTIONS);

  const addWeapon = () =>
    weapons.length < 2 &&
    onChangeWeapons([
      ...weapons,
      {
        id: makeId('wpn'),
        name: '',
        skill: '',
        action: '',
        idealRange: '',
        maxRange: '',
        currentAmmo: 0,
        maxAmmo: 0,
        damageTypes: '',
        arp: 0,
      },
    ]);
  const removeWeapon = (id: string) =>
    onChangeWeapons(weapons.filter((w) => w.id !== id));
  const reloadWeapon = (id: string) =>
    onChangeWeapons(
      weapons.map((w) =>
        w.id === id ? { ...w, currentAmmo: clamp(w.maxAmmo, 0, 9999) } : w
      )
    );
  const patchWeapon = (id: string, p: Partial<WeaponEntry>) =>
    onChangeWeapons(weapons.map((w) => (w.id === id ? { ...w, ...p } : w)));

  return (
    <div className="grid gap-4">
      {/* Accessories */}
      <Card className="shadow-sm bg-red-900">
        <CardContent className="p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground text-white">
              Accessories <span className="ml-2 text-xs text-white">{accessories.length} / 4</span>
            </div>
            <Button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              size="sm"
              onClick={addAccessory}
              disabled={readOnly || accessories.length >= 4}
            >
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {accessories.map((txt, i) => (
              <div key={i} className="flex items-center gap-2">
                <SelectableField
                  label={`Accessory ${i + 1}`}
                  value={txt}
                  options={ACCESSORY_OPTIONS}
                  onChange={(val) => {
                    const next = accessories.slice();
                    next[i] = val;
                    onChangeAccessories(next);
                  }}
                  readOnly={readOnly}
                />

                <Button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAccessory(i)}
                  disabled={readOnly}
                  aria-label="Remove accessory"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {accessories.length === 0 && (
              <div className="text-sm text-muted-foreground text-white">No accessories equipped.</div>
            )}
          </div>

          {accessoryNotes.length > 0 && (
            <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-relaxed">
              <div className="mb-2 font-medium text-white">5.2 accessory notes</div>
              <div className="space-y-2 text-white/90">
                {accessoryNotes.map(({ name, text }) => (
                  <div key={name}>
                    <span className="font-semibold">{name}:</span> {text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weapons as cards */}
      <Card className="shadow-sm bg-red-900">
        <CardContent className="p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground text-white">
              Weapons <span className="ml-2 text-xs text-white">{weapons.length} / 2</span>
            </div>
            <Button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              size="sm"
              onClick={addWeapon}
              disabled={readOnly || weapons.length >= 2}
            >
              <Plus className="mr-1 h-4 w-4" /> Add
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {weapons.map((w) => (
              <div key={w.id} className="rounded-xl border p-3">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    {/* Weapon Type (Skill) Dropdown */}
                    <SelectableField
                      label="Weapon Type"
                      value={normalizeWeaponCategory(w.skill)}
                      options={weaponCategories}
                      onChange={(val) => {
                        // Reset weapon name if category changes
                        patchWeapon(w.id, { skill: val, name: "" });
                      }}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="grid gap-1">
                    {/* Weapon Name Dropdown (depends on type) */}
                    {normalizeWeaponCategory(w.skill) && WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS] && (
                      <SelectableField
                        label="Weapon"
                        value={w.name}
                        options={
                          Array.isArray(WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS])
                            ? (WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS] as string[])
                            : Object.values(
                                WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS]
                              ).flat()
                        }
                        onChange={(val) => {
                        const base = WEAPON_STATS[val];
                        if (base) {
                          // Auto-populate all weapon stats, including ammo capacity
                          const parsedAmmo =
                            typeof base.ammo === "string"
                              ? parseInt(base.ammo.replace(/\D/g, ""), 10) || 0
                              : Number(base.ammo) || 0;

                          patchWeapon(w.id, {
                            name: val,
                            skill: normalizeWeaponCategory(base.type ?? w.skill),
                            action: base.action ?? w.action,
                            idealRange: base.idealRange ?? w.idealRange,
                            maxRange: base.maxRange ?? w.maxRange,
                            damageTypes: base.damage ?? w.damageTypes,
                            arp: base.arp ?? w.arp,
                            maxAmmo: parsedAmmo, // auto-set max ammo from WEAPON_STATS
                            currentAmmo: parsedAmmo, // optional: start full
                          });
                        } else {
                          // No stats available — treat as custom weapon
                          patchWeapon(w.id, { name: val });
                        }
                      }}


                        readOnly={readOnly}
                      />
                    )}
                  </div>
                  <div className="grid gap-1">
                    <Label>Action/Effects{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                    <Textarea
                      value={w.action}
                      onChange={(e) => patchWeapon(w.id, { action: e.target.value })}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label>Ideal Range{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                      <Input
                        value={w.idealRange}
                        onChange={(e) => patchWeapon(w.id, { idealRange: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Max Range{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                      <Input
                        value={w.maxRange}
                        onChange={(e) => patchWeapon(w.id, { maxRange: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label>Current Ammo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={w.currentAmmo}
                          readOnly                               // disallows typing
                          className="w-12"                       // makes the box size. change number if too big or small :D
                          disabled={readOnly}
                          aria-label="Current ammo"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            patchWeapon(w.id, {
                              currentAmmo: clamp((w.currentAmmo ?? 0) - 1, 0, w.maxAmmo),
                            })
                          }
                          disabled={readOnly}
                          aria-label="Decrement current ammo"
                        >
                          −
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            patchWeapon(w.id, {
                              currentAmmo: clamp((w.currentAmmo ?? 0) + 1, 0, w.maxAmmo),
                            })
                          }
                          disabled={readOnly}
                          aria-label="Increment current ammo"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <Label>Max Ammo{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={w.maxAmmo}
                        onChange={(e) =>
                          patchWeapon(w.id, {
                            maxAmmo: clamp(parseInt(e.target.value || '0', 10), 0, 9999),
                          })
                        }
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label>Damage Type(s){" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                      <Input
                        value={w.damageTypes}
                        onChange={(e) => patchWeapon(w.id, { damageTypes: e.target.value })}
                        placeholder="Pierce, Burn"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>ArP{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={w.arp}
                        onChange={(e) =>
                          patchWeapon(w.id, { arp: clamp(parseInt(e.target.value || '0', 10), 0, 99) })
                        }
                        disabled={readOnly}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="secondary"
                      size="sm"
                      onClick={() => reloadWeapon(w.id)}
                      disabled={readOnly}
                    >
                      Reload
                    </Button>
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWeapon(w.id)}
                      disabled={readOnly}
                      aria-label="Remove weapon"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {weapons.length === 0 && (
              <div className="text-sm text-muted-foreground text-white">No weapons added.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ArmorSlot: React.FC<{
  k: keyof ArmorSlots;
  label: string;
  slot: { name: string; av: ArmorAV };
  onChange: (slotKey: keyof ArmorSlots, nextSlot: { name: string; av: ArmorAV }) => void;
  readOnly?: boolean;
}> = React.memo(({ k, label, slot, onChange, readOnly }) => {
  const options =
    k === "head"
      ? ARMOR_OPTIONS.head
      : k === "body"
      ? ARMOR_OPTIONS.body
      : ARMOR_OPTIONS.lining;

  const [selected, setSelected] = React.useState(
  options.includes(slot.name) ? slot.name : "Clothes"
  );
  const [localOther, setLocalOther] = React.useState(
    options.includes(slot.name) ? "" : slot.name
  );

  React.useEffect(() => {
    if (options.includes(slot.name)) {
      setSelected(slot.name);
      setLocalOther("");
    } else if (slot.name) {
      setSelected("Other");
      setLocalOther(slot.name);
    } else {
      setSelected("Clothes");
      setLocalOther("");
    }
  }, [slot.name, options]);

  const autoStats = ARMOR_STATS[slot.name];
  const emptyArmorNotes: Record<keyof ArmorSlots, string> = {
    head: "Nothing on the noggin but confidence and poor risk assessment.",
    body: "Bold choice. Soft target.",
    lining: "Linings are for losers",
  };

  const clothingArmorNotes: Record<keyof ArmorSlots, string> = {
  head: "Hair styled, face exposed, skull regrettably unarmored.",
  body: "Street legal. Combat questionable.",
  lining: "Comfortable enough to wear under armor, useless at stopping a blade.",
  };

  const armorNote =
    slot.name === "Empty"
      ? emptyArmorNotes[k]
      : slot.name === "Clothes"
      ? clothingArmorNotes[k]
      : autoStats?.notes ??
        "Custom armor piece. Use the modifier panel below for any manual or situational armor bonuses this sheet cannot infer.";
  return (
    <div className="space-y-2">
      <div className="grid gap-1.5">
        <Label>{label} Armor</Label>
        <select
          className="rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
          value={selected}
          onChange={(e) => {
            const val = e.target.value;
            setSelected(val);
            if (val !== "Other") {
              const stats = ARMOR_STATS[val];
              onChange(k, {
                name: val,
                av: stats?.av ?? slot.av,
              });
            }
          }}
          disabled={readOnly}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        {selected === "Other" && (
          <Input
            className="mt-2"
            placeholder={`Enter custom ${label.toLowerCase()} armor`}
            value={localOther}
            onChange={(e) => setLocalOther(e.target.value)}
            onBlur={() => onChange(k, { name: localOther, av: slot.av })}
            disabled={readOnly}
          />
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-black/30 p-2 text-xs leading-relaxed">
        {slot.name && (
          <div className="mb-1 text-white/80">
            {DAMAGE_TYPES.filter((damageType) => (slot.av?.[damageType] ?? 0) > 0)
              .map((damageType) => `${damageType} ${slot.av[damageType]}`)
              .join(' • ')}
          </div>
        )}
        {armorNote}
      </div>
    </div>
  );
});

ArmorSlot.displayName = "ArmorSlot";

const ArmorSlotsBox: React.FC<{
  armor: ArmorSlots;
  onChange: (next: ArmorSlots) => void;
  readOnly?: boolean;
}> = ({ armor, onChange, readOnly }) => {
  const handleSlotChange = React.useCallback(
    (slotKey: keyof ArmorSlots, nextSlot: { name: string; av: ArmorAV }) => {
      const nextArmor = { ...armor, [slotKey]: nextSlot };
      onChange(nextArmor);
    },
    [armor, onChange]
  );

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-2 text-sm font-medium text-muted-foreground text-white">
          Armor Slots
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-white">
          <ArmorSlot
            k="head"
            label="Head"
            slot={armor.head}
            onChange={handleSlotChange}
            readOnly={readOnly}
          />
          <ArmorSlot
            k="body"
            label="Body"
            slot={armor.body}
            onChange={handleSlotChange}
            readOnly={readOnly}
          />
          <ArmorSlot
            k="lining"
            label="Lining"
            slot={armor.lining}
            onChange={handleSlotChange}
            readOnly={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
};




const ArmorTotalsBox: React.FC<{
  equipped: ArmorAV;
  modifiers: ArmorAV;
  onChangeModifiers: (next: ArmorAV) => void;
  readOnly?: boolean;
}> = ({ equipped, modifiers, onChangeModifiers, readOnly }) => {
  const MIN = 0;
  const MAX = 9;
  const [showDetails, setShowDetails] = React.useState(true);

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white">Armor Values</div>
            <div className="mt-1 text-xs leading-relaxed text-white/70">
              Equipped armor is calculated automatically from your selected body, lining, and head pieces.
              Use modifiers for temporary bonuses, innate armor, accessories, or special effects the sheet cannot infer.
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DAMAGE_TYPES.map((dt) => {
            const equippedValue = clamp(equipped[dt] ?? 0, MIN, MAX);
            const modifierValue = clamp(modifiers[dt] ?? 0, MIN, MAX);
            const totalValue = clamp(equippedValue + modifierValue, MIN, 99);

            return (
              <div key={dt} className="grid gap-1 rounded-lg border border-white/10 bg-black/20 p-2">
                <Label className="text-xs">{dt}</Label>

                {showDetails && (
                  <div className="text-[11px] text-white/60">
                    Equipped {equippedValue} • Modifier {modifierValue}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    value={totalValue}
                    readOnly
                    className="w-15"
                    disabled={readOnly}
                    aria-label={`${dt} total armor value`}
                  />

                </div>

                {showDetails && (
                  <div className="flex items-center gap-2">
                    <Input
                      inputMode="numeric"
                      value={modifierValue}
                      readOnly
                      className="w-15"
                      disabled={readOnly}
                      aria-label={`${dt} modifier value`}
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        onChangeModifiers({
                          ...modifiers,
                          [dt]: clamp(modifierValue - 1, MIN, MAX),
                        })
                      }
                      disabled={readOnly}
                      aria-label={`${dt} modifier decrement`}
                    >
                      −
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        onChangeModifiers({
                          ...modifiers,
                          [dt]: clamp(modifierValue + 1, MIN, MAX),
                        })
                      }
                      disabled={readOnly}
                      aria-label={`${dt} modifier increment`}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};




const VehiclesPanel: React.FC<{
  vehicles: VehicleEntry[];
  onChange: (next: VehicleEntry[]) => void;
  readOnly?: boolean;
}> = ({ vehicles, onChange, readOnly }) => {
  const addVehicle = () =>
    onChange([
      ...vehicles,
      {
        id: makeId("veh"),
        name: "",
        survivability: 0,
        capacity: 0,
        topSpeed: "",
        flying: false,
        size: "",
        notes: "",
      },
    ]);

  const removeVehicle = (id: string) =>
    onChange(vehicles.filter((v) => v.id !== id));

  const patchVehicle = (id: string, p: Partial<VehicleEntry>) =>
    onChange(vehicles.map((v) => (v.id === id ? { ...v, ...p } : v)));

  const allVehicles = React.useMemo(
    () => Object.keys(VEHICLE_STATS) as string[],
    []
  );

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground text-white">
            Vehicles <span className="ml-2 text-xs text-white">{vehicles.length}</span>
          </div>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            onClick={addVehicle}
            disabled={readOnly}
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>

        <div className="mb-4 rounded-lg border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/90">
          5.2 vehicle rules: vehicles only take the Critical, Crippled, Burning, Impaled, and Bound conditions.
          Without a garage, storing a vehicle safely between missions costs 500 Goldbacks. Repairs cost 200
          Goldbacks per injury and 2000 Goldbacks per Crippled condition.
        </div>

        <div className="grid grid-cols-1 gap-4">
          {vehicles.map((v) => {
            const base = (VEHICLE_STATS as Record<
              string,
              { type?: string; size?: string; speed?: string; capacity?: number; survivability?: number; notes?: string }
            >)[v.name];

            const vehicleType = base
              ? base.type
              : v.name
              ? v.flying
                ? "Flying"
                : "Ground"
              : "Custom";

            return (
              <div key={v.id} className="rounded-xl border p-3">
                <div className="grid gap-2 md:grid-cols-2">
                  {/* Vehicle Model Dropdown */}
                  <div className="grid gap-1">
                    <Label>Vehicle</Label>
                    <select
                      className="rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
                      value={
                        allVehicles.includes(v.name)
                          ? v.name
                          : v.name
                          ? "Other"
                          : ""
                      }
                      onChange={(e) => {
                        const model = e.target.value;
                        if (model === "Other") {
                          patchVehicle(v.id, {
                            name: "",
                            survivability: 0,
                            capacity: 0,
                            topSpeed: "",
                            flying: false,
                            size: "",
                            notes: "",
                          });
                        } else if (VEHICLE_STATS[model]) {
                          const info = VEHICLE_STATS[model] as {
                            type?: string;
                            size?: string;
                            speed?: string;
                            capacity?: number;
                            survivability?: number;
                            notes?: string;
                          };
                          patchVehicle(v.id, {
                            name: model,
                            survivability: info.survivability ?? 0,
                            capacity: info.capacity ?? 0,
                            size: info.size ?? "",
                            topSpeed: info.speed ?? "",
                            flying: info.type === "Flying",
                            notes: info.notes ?? "",
                          });
                        } else {
                          patchVehicle(v.id, { name: model });
                        }
                      }}
                      disabled={readOnly}
                    >
                      <option value="">Select...</option>
                      {allVehicles.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>

                    {/* "Other" custom input */}
                    {(!allVehicles.includes(v.name) && v.name !== "") || v.name === "" ? (
                      <Input
                        className="mt-2"
                        placeholder="Enter custom vehicle name"
                        value={v.name}
                        onChange={(e) =>
                          patchVehicle(v.id, { name: e.target.value })
                        }
                        disabled={readOnly}
                      />
                    ) : null}
                  </div>

                  {/* Passenger Capacity */}
                  <div className="grid gap-1">
                    <Label>Survivability</Label>
                    <Input
                      inputMode="numeric"
                      value={v.survivability ?? 0}
                      onChange={(e) =>
                        patchVehicle(v.id, {
                          survivability: clamp(parseInt(e.target.value || "0", 10), 0, 99),
                        })
                      }
                      disabled={readOnly}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>Passenger Capacity</Label>
                    <Input
                      inputMode="numeric"
                      value={v.capacity}
                      onChange={(e) =>
                        patchVehicle(v.id, {
                          capacity: clamp(
                            parseInt(e.target.value || "0", 10),
                            0,
                            999
                          ),
                        })
                      }
                      disabled={readOnly}
                    />
                  </div>

                  {/* Top Speed */}
                  <div className="grid gap-1">
                    <Label>Top Speed</Label>
                    <Input
                      value={v.topSpeed}
                      onChange={(e) => patchVehicle(v.id, { topSpeed: e.target.value })}
                      placeholder="e.g., 20 Units/turn"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Type (auto-filled, read-only) */}
                  <div className="grid gap-1">
                    <Label>Type</Label>
                    <Input
                      readOnly
                      value={vehicleType}
                      className="bg-black/40 text-white border-white/10"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Size */}
                  <div className="grid gap-1">
                    <Label>Size</Label>
                    <Input
                      value={v.size}
                      onChange={(e) => patchVehicle(v.id, { size: e.target.value })}
                      placeholder="e.g., 3x4"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2 grid gap-1">
                    <Label>Notes</Label>
                    <Textarea
                      value={v.notes ?? ""}
                      onChange={(e) => patchVehicle(v.id, { notes: e.target.value })}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVehicle(v.id)}
                    disabled={readOnly}
                    aria-label="Remove vehicle"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            );
          })}

          {vehicles.length === 0 && (
            <div className="text-sm text-muted-foreground text-white">
              No vehicles added.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};




const InjuriesPanel: React.FC<{
  injuries: number;
  onChange: (n: number) => void;
  readOnly?: boolean;
}> = ({ injuries, onChange, readOnly }) => (
  <Card className="shadow-sm bg-red-900">
    <CardContent className="p-4 text-white">
      <div className="mb-2 text-sm font-medium text-muted-foreground text-white">Injuries</div>
      <div className="grid max-w-xs grid-cols-2 items-end gap-2">
        <div className="grid gap-1">
          <Label>Count</Label>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            value={injuries}
            onChange={(e) => onChange(clamp(parseInt(e.target.value || '0', 99), 0, 99))}
            disabled={readOnly}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="secondary"
            onClick={() => onChange(clamp(injuries - 1, 0, 99))}
            disabled={readOnly}
          >
            −
          </Button>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="secondary"
            onClick={() => onChange(clamp(injuries + 1, 0, 99))}
            disabled={readOnly}
          >
            +
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ConditionsPanel: React.FC<{
  entries: ConditionEntry[];
  onChange: (next: ConditionEntry[]) => void;
  readOnly?: boolean;
}> = ({ entries, onChange, readOnly }) => {
  const isX = (name: ConditionName) =>
    name === 'Bleeding' ||
    name === 'Bound' ||
    name === 'Burning' ||
    name === 'Crippled' ||
    name === 'Disoriented' ||
    name === 'Frightened' ||
    name === 'Impaled' ||
    name === 'Madness' ||
    name === 'Paralysis' ||
    name === 'Poisoned' ||
    name === 'Poisoned (Deadly)' ||
    name === 'Transformed';

  const clampX = (x: number) => Math.max(0, Math.min(99, x | 0));

  const add = () =>
    onChange([...(entries || []), { id: makeId('cond'), name: 'Bleeding', severity: 1 }]);

  const remove = (id: string) => onChange((entries || []).filter((e) => e.id !== id));

  const ALL: ConditionName[] = [
    'Addiction Tremors','Bleeding','Bonded Destiny','Bound','Burning','Crippled',
    'Corroded','Disoriented','Enthralled','Frightened','Impaled','Madness',
    'Paralysis','Poisoned','Poisoned (Deadly)','Transformed','Unconscious','Critical'
  ];

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-2 flex items-center justify-between text-white">
          <div className="text-sm font-medium">Conditions</div>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            onClick={add}
            disabled={readOnly}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Condition
          </Button>
        </div>

        <div className="space-y-4">
          {(entries || []).map((e, i) => (
            <div key={e.id} className="space-y-1 rounded-md bg-black/20 p-1">
              {/* First row: select + X stepper (if applicable) */}
              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-7">
                <select
                  className="md:col-span-4 rounded-md border bg-background px-3 py-2 text-sm text-white"
                  value={e.name}
                  onChange={(ev) => {
                    const name = ev.target.value as ConditionName;
                    const next = [...(entries || [])];
                    next[i] = {
                      ...e,
                      name,
                      // if this condition has an X value, ensure severity is defined (default to 1)
                      severity: isX(name) ? (e.severity ?? 1) : undefined,
                    };
                    onChange(next);
                  }}
                  disabled={readOnly}
                >
                  {ALL.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                {/* X-based conditions: +/- stepper instead of typing */}
                {isX(e.name) && (
                  <div className="md:col-span-2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => {
                        const next = [...(entries || [])];
                        const cur = next[i];
                        const newX = clampX((cur.severity ?? 0) - 1);
                        next[i] = { ...cur, severity: newX };
                        onChange(next);
                      }}
                      disabled={readOnly || (e.severity ?? 0) <= 0}
                      title="Decrease"
                      aria-label="Decrease"
                    >
                      –
                    </Button>

                    <div className="min-w-[2.25rem] rounded-md bg-white px-2 py-1 text-center text-sm text-black">
                      {e.severity ?? 0}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => {
                        const next = [...(entries || [])];
                        const cur = next[i];
                        const newX = clampX((cur.severity ?? 0) + 1);
                        next[i] = { ...cur, severity: newX };
                        onChange(next);
                      }}
                      disabled={readOnly}
                      title="Increase"
                      aria-label="Increase"
                    >
                      +
                    </Button>
                  </div>
                  
                )}
                {/* Remove button */}
              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  className="md:col-span-1 flex justify-end"
                  onMouseDown={(ev) => ev.preventDefault()}
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(e.id)}
                  disabled={readOnly}
                  aria-label="Remove condition"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              </div>

              {/* Second row: rules description */}
              <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
                {renderConditionText(e.name as ConditionName, e.severity)}
              </div>

            </div>
          ))}

          {(entries || []).length === 0 && (
            <div className="text-sm text-white">No conditions.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


const AbilitiesPanel: React.FC<{
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
  
  // Inline “add” pickers
  const [addingSkill, setAddingSkill] = React.useState(false);
  const [addingSkillChoice, setAddingSkillChoice] = React.useState<string | undefined>(undefined);

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
  };

  const cancelPickers = () => {
    setPickingRace(false);
    setShowKindPicker(false);
    setAddingGeneral(false);
    setAddingGeneralChoice(undefined);
    setAddingGeneralLinkedSkillId(undefined);
    setAddingSkill(false);
    setAddingSkillChoice(undefined);
  };

  // for the row <select>: disable options that would BREAK rules when chosen
 const optionDisabled = (currentName: string, candidate: string) => {
  const currentDef = byName.get(currentName);
  const candDef    = byName.get(candidate);

  // Lock defaults
  if (currentDef?.auto && candidate !== currentName) return true;

  // Special-case: don't allow selecting Emerging Mutation into another row
  if (candidate === 'Emerging Mutation' && candidate !== currentName &&
      (abilities ?? []).some(a => a.kind === 'race' && a.name === 'Emerging Mutation')) {
    return true;
  }

  // No dupes for non-stackables
  if (!candDef?.stackable &&
      candidate !== currentName &&
      (abilities ?? []).some(a => a.kind === 'race' && a.name === candidate)) {
    return true;
  }

  // Abomination mutation cap
  if (raceName === 'Abomination' && candDef?.group === 'mutation') {
    const currentIsMutation = currentDef?.group === 'mutation';
    if (!currentIsMutation && abomMutationCount >= mutationMax) return true;
  }

  // Altered core cap
  if (raceName === 'Altered' && candDef?.oneOf === 'altered-core') {
    const currentIsCore = currentDef?.oneOf === 'altered-core';
    if (!currentIsCore && alteredCoreCount >= 1) return true;
  }

  if (!meetsPrereqs(candDef)) return true;
  return false;
};

  // Is there anything addable right now?
  const anyAddable = !!raceName && raceDefs.some(d => canAddName(d.name));

  // Small helper UI
  const StatusPill: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
    <span className={`rounded-full px-2 py-0.5 text-[10px] ${ok ? 'bg-emerald-600/30 text-emerald-200' : 'bg-amber-600/30 text-amber-100'}`}>
      {text}
    </span>
  );

  const pickedRaceNames = React.useMemo(
  () => new Set((abilities ?? []).filter(x => x.kind === 'race').map(x => x.name)),
  [abilities]
    );
  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Abilities</div>
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[11px]">
              Unlock Markers: {abilityUnlocksAvailable}
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
                  } else {
                    // opening: preselect first eligible option
                    const opts = generalDisplayOptionsFor("new-general");
                    setAddingGeneral(true);
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
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
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
  <InlinePicker
    label="Select Race Ability"
    labelSuffix={raceName ? `for ${raceName}` : undefined}
    value={draftRaceAbility ?? ""}
    onChange={(v) => setDraftRaceAbility(v ?? "")}
    options={raceDefs.filter(d => canAddName(d.name)).map(d => d.name)}
    optionKeyPrefix="race"
    selectTitle="Select a race ability to add"
    onConfirm={confirmAddRaceAbility}
    onCancel={() => setPickingRace(false)}
    confirmDisabled={abilityUnlocksAvailable <= 0 || !draftRaceAbility || !canAddName(draftRaceAbility)}
  />
)}

{/* GENERAL ability picker */}
{addingGeneral && (
  <div className="space-y-3 rounded-lg border border-white/10 bg-black/30 p-3">
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
      options={generalDisplayOptionsFor("new-general", addingGeneralChoice || undefined)}
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

          {raceName && raceUnlocks.length > 0 && (
            <div className="grid gap-2">
              {raceUnlocks.map((a) => {
                const def = byName.get(a.name);
                const isAutoDefault = !!def?.auto;

                return (
                  <div key={a.id} className="rounded-xl border border-white/10 p-3">
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
                      <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
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
  {(abilities ?? []).filter(a => a.kind === 'general').length === 0 && (
    <div className="mt-2 mb-4 text-sm text-white/70">No general abilities added yet.</div>
  )}

  {(abilities ?? []).filter(a => a.kind === 'general').length > 0 && (
    <div className="grid gap-2">
      {(abilities ?? [])
        .filter(a => a.kind === 'general')
        .map((a) => {
          const linkedSkillLabel = a.linkedSkillId ? skillDefs.find((skill) => skill.id === a.linkedSkillId)?.label : undefined;

          return (
            <div key={a.id} className="rounded-xl border border-white/10 p-3">
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
                <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
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

const NotesPanel: React.FC<{
  notes: string;
  peopleMet: string;
  secrets: string;
  onChange: (patch: Partial<Pick<Character, 'notes' | 'peopleMet' | 'secrets'>>) => void;
  readOnly?: boolean;
}> = ({ notes, peopleMet, secrets, onChange, readOnly }) => {
  const idBase = useId();
  return (
    <div className="grid gap-4">
      <Card className="shadow-sm bg-red-900">
        <CardContent className="grid gap-2 p-4 text-white">
          <Label htmlFor={`${idBase}-notes`}>Notes</Label>
          <Textarea
            id={`${idBase}-notes`}
            className="min-h-[120px]"
            value={notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="General notes, goals, etc."
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-red-900">
        <CardContent className="grid gap-2 p-4 text-white">
          <Label htmlFor={`${idBase}-people`}>People Met</Label>
          <Textarea
            id={`${idBase}-people`}
            className="min-h-[120px]"
            value={peopleMet}
            onChange={(e) => onChange({ peopleMet: e.target.value })}
            placeholder="Contacts, allies, rivals…"
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-red-900">
        <CardContent className="grid gap-2 p-4 text-white">
          <Label htmlFor={`${idBase}-secrets`}>Secrets</Label>
          <Textarea
            id={`${idBase}-secrets`}
            className="min-h-[120px]"
            value={secrets}
            onChange={(e) => onChange({ secrets: e.target.value })}
            placeholder="Discoveries, hidden agendas…"
            disabled={readOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const LevelUpPanel: React.FC<{
  defs: AttributeDef[];
  values: Record<string, number>;
  ticked: Record<string, boolean>;
  onToggle: (skillId: string, val: boolean) => void;
  onCommit: () => void;
  history: MissionLogEntry[];
  spent?: Record<string, number>;
  abilityUnlocksAvailable?: number;
  readOnly?: boolean;
}> = ({ defs, values, ticked, onToggle, onCommit, history, spent = {}, abilityUnlocksAvailable = 0, readOnly }) => {
  const totals = effectiveTallies(history || [], spent);

  const groups = groupBy(defs);
  const Section = ({ title, items }: { title: string; items: AttributeDef[] }) => (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-2 text-sm font-medium text-muted-foreground text-white">{title}</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 text-white">
          {items.map((def) => (
              <label
                key={def.id}
                className="flex items-center gap-2 text-sm"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => e.preventDefault()}
              >
              <input
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
                type="checkbox"
                className="h-4 w-4 accent-foreground"
                checked={!!ticked[def.id]}
                onChange={(e) => onToggle(def.id, e.target.checked)}
                disabled={readOnly}
                aria-label={`${def.label} current mission`}
              />
              <span>
                {def.label} — Current Mission
                {(totals[def.id] ?? 0) > 0 ? ` (x${totals[def.id]})` : ''}

                {((ticked[def.id] || (totals[def.id] ?? 0) > 0) && (values[def.id] ?? def.min ?? 0))
                  ? ` [Lvl ${values[def.id]}]`
                  : ''}
              </span>

            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4">
      <Card className="shadow-sm bg-red-900">
        <CardContent className="flex items-center justify-between gap-3 p-4 text-white">
          <div>
            <div className="text-sm font-medium text-white">Ability Unlock Markers</div>
            <div className="text-xs text-white/70">
              In 5.2, each successful skill improvement grants one new ability. These no longer come automatically from reaching level 4 or 5.
            </div>
          </div>
          <div className="rounded-full bg-black/40 px-3 py-1 text-sm font-semibold">
            {abilityUnlocksAvailable}
          </div>
        </CardContent>
      </Card>

      <Section title="Combat" items={groups.combat} />
      <Section title="Magic" items={groups.magic} />
      <Section title="Specialized" items={groups.specialized} />

      <div className="flex justify-end gap-2">
        <Button type="button" onMouseDown={(e) => e.preventDefault()} variant="secondary" onClick={onCommit} disabled={readOnly}>
          Commit Mission
        </Button>
      </div>

      <Card className="shadow-sm bg-red-900">
        <CardContent className="p-4 text-white">
          <div className="mb-2 text-sm font-medium text-muted-foreground text-white">Mission History</div>
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground text-white">No missions committed yet.</div>
          ) : (
            <ol className="space-y-2">
              {history.map((m, idx) => (
                <li key={m.missionId} className="rounded-xl bg-muted/30 p-3">
                  <div className="text-sm font-medium">
                    Mission {idx + 1} — {formatDate(m.dateISO)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground text-white">
                    {m.successes.length} skill(s) marked
                  </div>
                  {m.successes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.successes.map((sid) => (
                        <span key={sid} className="rounded-full bg-black px-2 py-0.5 text-xs">
                          {defs.find((d) => d.id === sid)?.label ?? sid}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Registry & Defaults ----------
export const DEFAULT_REGISTRY: RulesRegistry = {
  attributes: [
    // Combat
    { id: 'automatics', label: 'Automatics', group: 'combat', min: 1, max: 5 },
    { id: 'droneOperation', label: 'Drone Operation', group: 'combat', min: 1, max: 5 },
    { id: 'martialArts', label: 'Martial Arts', group: 'combat', min: 1, max: 5 },
    { id: 'marksman', label: 'Marksman', group: 'combat', min: 1, max: 5 },
    { id: 'meleeWeapons', label: 'Melee Weapons', group: 'combat', min: 1, max: 5 },
    { id: 'pistols', label: 'Pistols', group: 'combat', min: 1, max: 5 },
    { id: 'propellants', label: 'Propellants', group: 'combat', min: 1, max: 5 },
    { id: 'shotguns', label: 'Shotguns', group: 'combat', min: 1, max: 5 },
    { id: 'shurikens', label: 'Shurikens', group: 'combat', min: 1, max: 5 },

    // Magic
    { id: 'arcane', label: 'Arcane', group: 'magic', min: 1, max: 5 },
    { id: 'demonology', label: 'Demonology', group: 'magic', min: 1, max: 5 },
    { id: 'envy', label: 'Envy', group: 'magic', min: 1, max: 5 },
    { id: 'gluttony', label: 'Gluttony', group: 'magic', min: 1, max: 5 },
    { id: 'greed', label: 'Greed', group: 'magic', min: 1, max: 5 },
    { id: 'lust', label: 'Lust', group: 'magic', min: 1, max: 5 },
    { id: 'pride', label: 'Pride', group: 'magic', min: 1, max: 5 },
    { id: 'sloth', label: 'Sloth', group: 'magic', min: 1, max: 5 },
    { id: 'wrath', label: 'Wrath', group: 'magic', min: 1, max: 5 },

    // Specialized
    { id: 'bluff', label: 'Bluff', group: 'specialized', min: 1, max: 5 },
    { id: 'bodybuilding', label: 'Bodybuilding', group: 'specialized', min: 1, max: 5 },
    { id: 'chemistry', label: 'Chemistry', group: 'specialized', min: 1, max: 5 },
    { id: 'engineering', label: 'Engineering', group: 'specialized', min: 1, max: 5 },
    { id: 'fortitude', label: 'Fortitude', group: 'specialized', min: 1, max: 5 },
    { id: 'hacking', label: 'Hacking', group: 'specialized', min: 1, max: 5 },
    { id: 'hide', label: 'Hide', group: 'specialized', min: 1, max: 5 },
    { id: 'medical', label: 'Medical', group: 'specialized', min: 1, max: 5 },
    { id: 'negotiation', label: 'Negotiation', group: 'specialized', min: 1, max: 5 },
    { id: 'observation', label: 'Observation', group: 'specialized', min: 1, max: 5 },
    { id: 'parkour', label: 'Parkour', group: 'specialized', min: 1, max: 5 },
    { id: 'pilot', label: 'Pilot', group: 'specialized', min: 1, max: 5 },
    { id: 'reflex', label: 'Reflex', group: 'specialized', min: 1, max: 5 },
    { id: 'survivability', label: 'Survivability', group: 'specialized', min: 1, max: 5 },
    { id: 'thievery', label: 'Thievery', group: 'specialized', min: 1, max: 5 },

  ],
  resources: [
    { id: 'rerolls', label: 'Generic Rerolls', min: 0, max: 9 },
  ],
  itemFields: [
    { id: 'name', label: 'Name', type: 'text' },
    { id: 'qty', label: 'Qty', type: 'number' },
    { id: 'type', label: 'Type', type: 'text' },
  ],
};

const DEFAULT_ATTRIBUTES: Record<string, number> = Object.fromEntries(
  DEFAULT_REGISTRY.attributes.map((a) => [a.id, a.min ?? 1])
);

const emptyAV = (): ArmorAV =>
  Object.fromEntries(DAMAGE_TYPES.map((d) => [d, 0])) as ArmorAV;

export const DEFAULT_CHARACTER: Character = {
  id: 'temp-1',
  name: '',
  race: '',
  origin: '',
  money: 0,
  abilities: [],
  attributes: DEFAULT_ATTRIBUTES,
  resources: { rerolls: 0 },
  items: [],
  stash: [],
  armor: {
    head: { name: "Clothes", av: ARMOR_STATS["Clothes"].av },
    body: { name: "Clothes", av: ARMOR_STATS["Clothes"].av },
    lining: { name: "Clothes", av: ARMOR_STATS["Clothes"].av },
  },
  totalArmor: emptyAV(),
  accessories: [],
  weapons: [],
  vehicles: [],
  housing: { rentCost: 0, apartmentTier: undefined, upgrades: [] },
  skillRerolls: {},
  currentMissionSkills: {},
  missionHistory: [],
  tallySpent: {},                   // 
  abilityUnlocksAvailable: 0,
  injuries: 0,
  conditions: [],
  debt: [],
  recurringCosts: [],
  notes: '',
  peopleMet: '',
  secrets: '',
};


// ---------- Main Component ----------
export default function CharacterSheetDemo(props: Partial<CharacterSheetProps>) {
  const [tabValue, setTabValue] = useState("stats");
  const [raceLocked, setRaceLocked] = React.useState(false);
  const [char, setChar] = useState<Character>(() => {
  const ensureAV = (slot?: { name: string; av?: ArmorAV }): { name: string; av: ArmorAV } => {
    const name = slot?.name || "Empty";

    return {
      name,
      av: slot?.av ?? ARMOR_STATS[name]?.av ?? emptyAV(),
    };
  };

  let base: Character;

    if (props.value) {
    base = props.value;
  } else if (props.initialCharacter) {
    base = props.initialCharacter;
  } else if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      base = raw ? (JSON.parse(raw) as Character) : DEFAULT_CHARACTER;
    } catch {
      base = DEFAULT_CHARACTER;
    }
  } else base = DEFAULT_CHARACTER;

  // Ensure armor fields always have AV objects
  return {
    ...base,
    armor: {
      head: ensureAV(base.armor?.head),
      body: ensureAV(base.armor?.body),
      lining: ensureAV(base.armor?.lining),
    },
  };
});


// Tracks previous attribute levels so we can detect increases for tally consumption
const prevAttrsRef = React.useRef<Record<string, number>>(char.attributes);
const onChange = props.onChange ?? setChar;
useEffect(() => {
  if (props.value) {
    setChar(props.value);
  }
}, [props.value]);
// When any attribute goes up, consume all effective tallies for that skill
useEffect(() => {
  const prev = prevAttrsRef.current || {};
  const next = char.attributes || {};

  const spent = { ...(char.tallySpent ?? {}) };
  const eff = effectiveTallies(char.missionHistory ?? [], spent);
  let unlockedAbilities = char.abilityUnlocksAvailable ?? 0;

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
    onChange({ ...char, tallySpent: spent, abilityUnlocksAvailable: unlockedAbilities });
  } else if (unlockedAbilities !== (char.abilityUnlocksAvailable ?? 0)) {
    onChange({ ...char, abilityUnlocksAvailable: unlockedAbilities });
  }

  prevAttrsRef.current = next;
}, [char.attributes, char.missionHistory, char.tallySpent, char.abilityUnlocksAvailable]);

// Autosave on any change
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(char));
  } catch {
    // storage full or blocked; ignore
  }
}, [char]);


const registry = useMemo(() => props.registry ?? DEFAULT_REGISTRY, [props.registry]);
const readOnly = props.readOnly ?? false;

const handleArmorChange = React.useCallback(
  (next: ArmorSlots) => {
    onChange(set(char, "armor", next));
  },
  [char, onChange]
);

// track edit state for skills
const [editSkills, setEditSkills] = useState(false);
const [confirmReset, setConfirmReset] = useState(false);

const toggleCurrentMission = (skillId: string, v: boolean) => {
  const next = { ...(char.currentMissionSkills ?? {}), [skillId]: v };
  onChange(set(char, 'currentMissionSkills', next));
};

const commitMission = () => {
  const successes = Object.entries(char.currentMissionSkills ?? {})
    .filter(([, v]) => !!v)
    .map(([k]) => k);

  const seq = (char.missionHistory?.length ?? 0) + 1;
  const now = new Date();

  const entry: MissionLogEntry = {
    missionId: `Mission ${seq} (${now.toLocaleDateString()})`,
    dateISO: now.toISOString(),
    successes,
  };

  const history = [...(char.missionHistory ?? []), entry];
  onChange({ ...char, missionHistory: history, currentMissionSkills: {} });
  };
  // Save/Load helpers
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportCharacter = () => {
  try {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // build filename
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const safeName = (char?.name || "Character").replace(/\s+/g, "_");
    const fileName = `${safeName}_${today}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
};

  const handleImportClick = () => {
    fileRef.current?.click();
  };

  const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const data = JSON.parse(text) as Character;
      // update state and persist
      onChange(data);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {}
    } catch {
      // ignore malformed files
    } finally {
      // reset input so selecting the same file again will trigger onChange
      e.target.value = '';
    }
  };

// --- Inventory capacity logic ---
const baseMaxItems = 5;
const hasBackpack = (char.accessories ?? []).includes("Backpack");
const hasBelt = (char.accessories ?? []).includes("Utility Belt");
const maxInventory =
  baseMaxItems + (hasBackpack ? 5 : 0) + (hasBelt ? 3 : 0);

// Count total quantity instead of rows
const currentInventoryCount = (char.items ?? []).reduce(
  (sum, item) => sum + Number(item.qty || 0),
  0
);
const selectedHideout = char.housing?.apartmentTier
  ? HIDEOUT_TIER_DETAILS[char.housing.apartmentTier]
  : undefined;
const selectedUpgradeDetails = (char.housing?.upgrades ?? [])
  .map((upgrade) => (upgrade ? { name: upgrade, data: HIDEOUT_UPGRADE_DETAILS[upgrade as (typeof HIDEOUT_UPGRADES)[number]] } : undefined))
  .filter((entry): entry is { name: string; data: { price: number; summary: string } } => Boolean(entry?.data));
const equippedArmorTotals = sumArmorValues(char.armor);

  /*const handleResetSave = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    onChange(DEFAULT_CHARACTER);
  };*/ //Commented this out as it in unused currently. Leaving in case I want it again
  return (
    <div className="mx-auto grid max-w-6xl gap-4 p-4">
      <Card className="border-white/10 bg-black/40 text-white">
        <CardContent className="flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold">Infernal City RPG v5.2</div>
          </div>
        </CardContent>
      </Card>

      <IdentitySection value={char} onChange={onChange} readOnly={readOnly} raceLocked={raceLocked} onToggleRaceLock={() => setRaceLocked((v) => !v)}/>

      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full" activationMode="manual" orientation="horizontal">
        {/* Row with tabs + right-side button */}
        <div className="mb-3 flex items-center justify-between">
          <TabsList
            className="
              flex gap-2 overflow-x-auto whitespace-nowrap
              [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              [&>button]:shrink-0
              sticky top-0 z-10 bg-background/95
              backdrop-blur supports-[backdrop-filter]:bg-background/60
              px-1 py-1 rounded-md
            "
          >
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="abilities">Abilities</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="housing">Housing</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="levelup">Level Up</TabsTrigger>
            <TabsTrigger value="dice">Dice</TabsTrigger>
          </TabsList>

          {/* Button only shows when Stats tab is selected */}
          {tabValue === "stats" && (
            <Button
              type="button"
              variant={editSkills ? "secondary" : "default"}
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditSkills(!editSkills)}
            >
              {editSkills ? "Lock Skills" : "Edit Skills"}
            </Button>
          )}
        </div>

        {/* Stats */}
        <TabsContent value="stats" className="grid gap-4">
          <GroupedSkillsGrid
            defs={registry.attributes}
            values={char.attributes}
            onChange={(v) => onChange(set(char, 'attributes', v))}
            readOnly={readOnly || !editSkills}
          />

          <ResourcesPanel
            resourceDefs={registry.resources}
            resourceValues={char.resources}
            onChangeResources={(v) => onChange(set(char, 'resources', v))}
            abilities={char.abilities ?? []}
            skillDefs={registry.attributes}
            skillRerolls={char.skillRerolls ?? {}}
            onChangeSkillRerolls={(next) => onChange(set(char, 'skillRerolls', next))}
            debt={char.debt ?? []}
            onChangeDebt={(next) => onChange(set(char, 'debt', next))}
            recurring={char.recurringCosts ?? []}
            onChangeRecurring={(next) => onChange(set(char, 'recurringCosts', next))}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Abilities */}
        <TabsContent value="abilities" className="grid gap-4">
          <AbilitiesPanel
            abilities={char.abilities ?? []}
            abilityUnlocksAvailable={char.abilityUnlocksAvailable ?? 0}
            onChangeAbilityUnlocks={(next) => onChange(set(char, 'abilityUnlocksAvailable', next))}
            skillDefs={registry.attributes}
            raceName={char.race as RaceName | undefined}
            attrValues={char.attributes ?? {}}
            onChange={(nextAbilities, nextAbilityUnlocks) =>
              onChange({
                ...char,
                abilities: nextAbilities,
                abilityUnlocksAvailable: nextAbilityUnlocks ?? (char.abilityUnlocksAvailable ?? 0),
              })
            }
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Items */}
        <TabsContent value="items" className="grid gap-4 text-white">
          
          <ArmorSlotsBox
            armor={char.armor}
            onChange={handleArmorChange}
            readOnly={readOnly}
          />

          <ArmorTotalsBox
             equipped={equippedArmorTotals}
             modifiers={char.totalArmor ?? emptyAV()}
             onChangeModifiers={(next) => onChange(set(char, 'totalArmor', next))}
             readOnly={readOnly}
          />


          <EquippedGear
            accessories={char.accessories ?? []}
            onChangeAccessories={(next) => onChange(set(char, 'accessories', next))}
            weapons={char.weapons ?? []}
            onChangeWeapons={(next) => onChange(set(char, 'weapons', next))}
            readOnly={readOnly}
          />

          <VehiclesPanel
            vehicles={char.vehicles}
            onChange={(next) => onChange(set(char, 'vehicles', next))}
            readOnly={readOnly}
          />

          <ItemsTable
            title={`Inventory (${currentInventoryCount}/${maxInventory})`}
            rows={char.items}
            onChange={(rows) => onChange(set(char, 'items', rows))}
            readOnly={readOnly}
            maxItems={maxInventory}
            currentTotal={currentInventoryCount}
          />

          <ItemsTable
            title="Stash"
            rows={char.stash ?? []}
            onChange={(rows) => onChange(set(char, 'stash', rows))}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Housing */}
        <TabsContent value="housing" className="grid gap-4">
          <Card className="shadow-sm bg-red-900">
            <CardContent className="grid gap-4 p-4 md:grid-cols-3 text-white">
              <div className="grid gap-1.5">
                <Label>Rent Cost (Goldbacks)</Label>
                <Input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(char.housing?.rentCost ?? 0)}
                  onChange={(e) =>
                    onChange(
                      set(char, 'housing', {
                        ...(char.housing ?? {}),
                        rentCost: clamp(parseInt(e.target.value || '0', 10), 0, 999999),
                      })
                    )
                  }
                  disabled={readOnly}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Apartment Tier</Label>
                <select
                  className="rounded-md border bg-background px-3 py-2 text-sm"
                  value={char.housing?.apartmentTier ?? ''}
                  onChange={(e) => {
                    const val = (e.target.value || undefined) as Character['housing']['apartmentTier'];
                    onChange(
                      set(char, 'housing', {
                        ...(char.housing ?? {}),
                        apartmentTier: val,
                        rentCost: val ? HIDEOUT_TIER_DETAILS[val].rentCost : char.housing?.rentCost ?? 0,
                      })
                    );
                  }}
                  disabled={readOnly}
                >
                  <option value="">— Select —</option>
                  <option>Wasteland Hovel</option>
                  <option>Dead End Apartment</option>
                  <option>Incognito Dwelling</option>
                  <option>Incognito Compound</option>
                  <option>Luxury Apartment</option>
                  <option>Penthouse</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {selectedHideout && (
            <Card className="shadow-sm bg-red-900">
              <CardContent className="grid gap-4 p-4 text-white md:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">5.2 base rent</div>
                  <div className="mt-1 text-lg font-semibold">
                    {selectedHideout.rentCost === 0 ? 'Zero' : `${selectedHideout.rentCost.toLocaleString()} Goldbacks`}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Starting rooms</div>
                  <div className="mt-1 text-sm leading-relaxed">{selectedHideout.rooms}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Threat level</div>
                  <div className="mt-1 text-sm leading-relaxed">{selectedHideout.threat}</div>
                </div>
                <div className="md:col-span-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm leading-relaxed">
                  <div className="font-medium text-white">Tier summary</div>
                  <div className="mt-1 text-white/85">{selectedHideout.summary}</div>
                  <div className="mt-2 text-white/70">{selectedHideout.events}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm bg-red-900">
            <CardContent className="grid gap-4 p-4 text-white">
              <div className="grid gap-1.5">
                <Label>Upgrades</Label>
                <div className="space-y-2">
                  {(char.housing?.upgrades ?? []).map((u, i) => (
                    <div key={`${u}-${i}`} className="flex items-center gap-2">
                      <select
                        className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                        value={u}
                        onChange={(e) => {
                          const next = [...(char.housing?.upgrades ?? [])];
                          next[i] = e.target.value;
                          onChange(set(char, 'housing', { ...(char.housing ?? {}), upgrades: next }));
                        }}
                        disabled={readOnly}
                      >
                        {HIDEOUT_UPGRADES.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>

                      <Button
                        onMouseDown={(e) => e.preventDefault()}
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          onChange(
                            set(
                              char,
                              'housing',
                              { ...(char.housing ?? {}), upgrades: (char.housing?.upgrades ?? []).filter((_, idx) => idx !== i) }
                            )
                          );
                        }}
                        disabled={readOnly}
                        aria-label="Remove upgrade"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="button"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const next = [...(char.housing?.upgrades ?? []), HIDEOUT_UPGRADES[0] as string];
                      onChange(set(char, 'housing', { ...(char.housing ?? {}), upgrades: next }));
                    }}
                    disabled={readOnly}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Upgrade
                  </Button>
                </div>
              </div>

              {selectedUpgradeDetails.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm leading-relaxed">
                  <div className="mb-2 font-medium text-white">Selected upgrade effects</div>
                  <div className="space-y-2 text-white/85">
                    {selectedUpgradeDetails.map(({ name, data }, index) => (
                      <div key={`${name}-${index}`}>
                        <span className="font-semibold">{name}</span> ({data.price.toLocaleString()} Goldbacks): {data.summary}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </TabsContent>

        {/* Conditions */}
        <TabsContent value="conditions" className="grid gap-4">
          <InjuriesPanel
            injuries={char.injuries ?? 0}
            onChange={(n) => onChange(set(char, 'injuries', n))}
            readOnly={readOnly}
          />
          <ConditionsPanel
            entries={char.conditions ?? []}
            onChange={(next) => onChange(set(char, 'conditions', next))}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <NotesPanel
            notes={char.notes ?? ''}
            peopleMet={char.peopleMet ?? ''}
            secrets={char.secrets ?? ''}
            onChange={(patch) => onChange({ ...char, ...patch })}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Level Up */}
        <TabsContent value="levelup" className="grid gap-4">
          <LevelUpPanel
            defs={registry.attributes}
            values={char.attributes}
            ticked={char.currentMissionSkills ?? {}}
            onToggle={toggleCurrentMission}
            onCommit={commitMission}
            history={char.missionHistory ?? []}
            spent={char.tallySpent ?? {}}
            abilityUnlocksAvailable={char.abilityUnlocksAvailable ?? 0}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="dice" className="grid gap-4">
          <DiceRoller />
        </TabsContent>
      </Tabs>

      {/* Save/Load controls */}
      <Card className="mt-4 bg-red-900 border border-white-900">
        <CardContent className="flex flex-wrap items-center gap-2 p-4 bg-red-900">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />

          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleExportCharacter}
          >
            Export Character
          </Button>

          <Button
            type="button"
            variant="secondary"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleImportClick}
          >
            Import Character
          </Button>

          {!confirmReset ? (
          <Button
            type="button"
            variant="destructive"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setConfirmReset(true)}
          >
            Reset Save
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                try { localStorage.removeItem(STORAGE_KEY); } catch {}
                onChange(DEFAULT_CHARACTER);
                setConfirmReset(false);
              }}
            >
              Confirm Reset
            </Button>
            <Button
              type="button"
              variant="secondary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </Button>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
}
