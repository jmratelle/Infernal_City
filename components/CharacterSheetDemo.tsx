'use client';

import React, { useMemo, useState, useId, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Infernal City – Character Sheet (Applied Features)
 * - Stats: Identity + Skills + Resources (Generic Rerolls, Skill Rerolls, Goldbacks, Debt list, Recurring Costs list)
 * - Items: Armor slots with per-damage AVs, Accessories (max 4), Weapons as cards (max 2), Inventory, Stash, Vehicles
 * - Housing: Rent Cost, Apartment Tier dropdown, Upgrades list (repeatable)
 * - Conditions: Injuries counter + Condition rows (dropdown, optional Severity (X), Notes)
 * - Notes: Notes, People Met, Secrets
 * - Level Up: Current Mission checklist + Mission History
 */

// ---------- Types ----------
export type SkillGroup = 'combat' | 'magic' | 'specialized';
export type AbilityKind = 'skill' | 'general' | 'race';

export type AbilityEntry = {
  id: string;
  kind: AbilityKind;
  name: string;
  linkedSkillId?: string; // optional; only used for 'skill' unlocks
  notes?: string;
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
export type RaceAbilityDef = { name: string; desc: string };
export type RaceName =
  | 'Abomination'
  | 'Altered'
  | 'Ascended'
  | 'Demonkin'
  | 'Draconum'
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
  head: { name: string};
  body: { name: string};
  lining: { name: string};
};

export type VehicleEntry = {
  id: string;
  name: string;
  capacity: number;
  topSpeed: string;
  flying: boolean;
  notes?: string;
};

export type Character = {
  id: string;
  name: string;
  race?: string;
  origin?: string;
  money?: number;
  abilities?: AbilityEntry[];
  tallySpent?: Record<string, number>;      // tallies consumed by level-ups
  attributes: Record<string, number>;
  resources: Record<string, number>;
  items: Array<Record<string, string | number>>;
  stash?: Array<Record<string, string | number>>;

  armor: ArmorSlots;
  totalArmor?: ArmorAV;            // user-entered totals (no auto calc)
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
};

// ---------- Constants ----------
const SKILL_REROLL_THRESHOLD = 3;
const SKILL_REROLL_MIN = 0;
const SKILL_REROLL_MAX = 5;
const STORAGE_KEY = 'characterSheet:v1';

// ---------- Condition reference ----------
const CONDITION_TEXT: Record<ConditionName, (x?: number) => string> = {
  'Addiction Tremors': () =>
    'Reduce the Die Level of all DCs by one until you take another hit of the addictive substance or one day has passed.',

  'Bleeding': (x = 1) =>
    `While under this condition, the target receives one injury at the end of their turn. A Cumulative Medical Skill DC can be made to reduce this condition by ${x}. When ${x} is equal to or less than zero, remove this condition.`,

  'Bonded Destiny': () =>
    'Both targets under the effect of this condition will share any received injuries and conditions they receive in the future. At the end of each of their turns, any of the targets may attempt a Contested Envy DC with the caster to end this condition.',

  'Bound': () =>
    'While under the effect of this condition, the target remains magically or physically trapped within the source that gave the target this condition. At the beginning of each of its turns the target may make a cumulative DC, with the skill being determined by the ability or source that inflicted the condition, to attempt to escape. If they fail, they remain trapped and cannot move or perform any actions.',

  'Burning': (x = 1) =>
    `At the beginning of the target's turn they must make a burn Armor DC. If they fail or cannot make a burn Armor DC, they take one injury. The target or another PC or NPC may spend two AP to reduce this condition’s X value by one by batting out the flames. This condition’s X value is reduced by one at the end of the target’s turn. If ${x} is equal to zero, remove this condition.`,

  'Crippled': (x = 1) =>
    `While under this condition, the target receives a negative ${x} modifier to all DCs made by that target. If the target’s Crippled condition is four or greater, they gain the Unconscious condition at the start of each turn until they remove this condition. This condition can only be removed at a clinic or hospital.`,

  'Corroded': (x = 1) =>
    `While under this condition, reduce all the target’s Armor Values by ${x}. The (X) value can be reduced by a cumulative Engineering DC. This condition is removed between missions.`,

  'Disoriented': (x = 1) =>
    `At the beginning of each of their turns, the target must make a cumulative Fortitude DC with ${x} as the target number. If they fail, they lose three AP from their AP pool for that turn. At the end of each turn, the ${x} value decreases by one. When ${x} is equal to or less than zero, remove this condition.`,

  'Enthralled': () =>
    'The target becomes enamored with the source of their enthrallment. Their actions are controlled by the GM and they will generally listen to their enthraller, potentially turning on former comrades, but not doing anything that would cause immediate self-harm. If the target would receive an injury they must make an immediate DC (skill determined by the source). On success, remove this condition. If the source attacks or injures the target, or is destroyed, this condition immediately ends.',

  'Frightened': (x = 1) =>
    `At the beginning of each of their turns, the target must make a cumulative Fortitude check with ${x} as the target number. On a fail, they must spend all AP to move as far away as possible from the source.`,

  'Impaled': (x = 1) =>
    `The target has been impaled by a physical object. Movement is reduced by ${x} Units per AP spent. A target may spend 1 AP to remove the object and reduce this condition's X by the X caused by the object. When ${x} is equal to or less than zero, remove this condition.`,

  'Madness': (x = 1) =>
    `At the beginning of each of their turns, the target must make a cumulative Fortitude DC equal to ${x}. On a fail, they must spend their initial AP to move and attack the nearest PC or NPC (friend or foe) once. If no weapon, use the strongest Martial Arts attack available.`,

  'Paralysis': (x = 1) =>
    `Movement allowed from spending AP is reduced by ${x} Units per AP. The Reflex Skill is reduced by ${x} Die Levels. Another character may make a Cumulative Medical Skill DC to reduce this condition by ${x}. When ${x} is equal to or less than zero, remove this condition.`,

  'Poisoned': (x = 1) =>
    `At the beginning of each of their turns, the target must make a Cumulative Survivability DC with ${x} as the target number. On a fail, they receive one injury. At the end of each turn, ${x} decreases by one. If ${x} is equal to zero, remove this condition.`,

  'Poisoned (Deadly)': (x = 1) =>
    `At the beginning of each of their turns, the target must make a Cumulative Survivability DC with ${x} as the target number. On a fail, they receive two injuries. At the end of each turn, ${x} decreases by one. If ${x} is equal to zero, remove this condition.`,

  'Transformed': (x = 1) =>
    `While under this condition, the target is transformed into a small animal (e.g., mouse, hedgehog, chicken). At the end of each turn, reduce ${x} by one; when ${x} is zero, remove this condition. All equipment disappears until the transformation ends. Lose all skills/abilities; use: Reflex 3, all other skills 1. Injuries transfer to the actual form. If the target dies while transformed, they die and immediately regain original form.`,

  'Unconscious': () =>
    'The target cannot spend any AP. Remove this condition at the end of the target’s subsequent turn. All attacks against unconscious targets automatically hit, and the Reflex save result is considered a one for crit purposes.',

  'Critical': () =>
    'A PC must make a Critical Condition DC at the end of their turn; an NPC must make it at the beginning of their turn after all other beginning-of-turn effects. Another adjacent character can remove this condition with a Medical DC.',
};


const RACE_OPTIONS: RaceName[] = [
  'Abomination',
  'Altered',
  'Ascended',
  'Demonkin',
  'Draconum',
  'Fireborne',
  'Liches',
  'Maggot Lords',
  'Outsiders',
  'Rat Kings',
  'Succubus/Incubus',
];

export const RACE_ABILITIES: Record<RaceName, RaceAbilityDef[]> = {
  Abomination: [
    {
      name: 'Emerging Mutation',
      desc: `You may select another mutation ability from the Abomination’s starting abilities. This ability may be selected more than once to choose an additional mutation. Each new mutation adds to your Mutant Madness.\nRequirement: Abomination race.`,
    },
    {
      name: 'Anger Management',
      desc: `Reduce the X received each turn as part of your Mutant Madness ability by one.\nRequirement: Abomination race.`,
    },
    {
      name: 'Genetic Assimilation',
      desc: `If you can touch the blood of another target, including one who has died, you may take one of their abilities and add it to your own. This ability can be used for up to one day, then the ability is removed. Only one ability can be chosen at a time. If another ability is chosen, the prior ability is removed.\nRequirement: Abomination race.`,
    },
    {
      name: 'Advanced Mutations',
      desc: `You may enhance your prior mutations. This ability may be selected multiple times, but you cannot choose the same enhancement twice, unless otherwise noted.\nRequirement: Abomination race.`,
    },
    { name: 'Enhanced Additional Arms', desc: `You have two additional arms, and once per round can perform one of the following actions without spending any AP:\n• A Martial Arts or weapon attack\n• A reload action\n• Use a consumable\nRequirement: Abomination race.` },
    { name: 'Enhanced Additional Legs', desc: `You may move an additional Unit per AP spent on movement.\nRequirement: Abomination race.` },
    { name: 'Enhanced Compound Eyes', desc: `You gain advantage on contested DCs using your Observation skill.\nRequirement: Abomination race.` },
    { name: 'Enhanced Chromatophores', desc: `Your ability to change the color of your skin now includes bioluminescence. You can make any part of your body or skin pattern glow in different colors; you can also make your eyes glow to imitate a Demon or Demonkin’s appearance.\nRequirement: Abomination race.` },
    { name: 'Enhanced Flesh Rending Claws', desc: `Increase the ArP of your Martial Arts attacks by one. This ability may be selected more than once.\nRequirement: Abomination race.` },
    { name: 'Enhanced Toxic Skin', desc: `Increase the X value of the Poisoned condition your Toxic Skin inflicts by two. This ability may be selected more than once.\nRequirement: Abomination race.` },
    { name: 'Enhanced Regeneration', desc: `You remove the Critical condition automatically after your first Critical Condition DC.\nRequirement: Abomination race.` },
    { name: 'Enhanced Heat Vision', desc: `You can see the heat signatures of the footprints or handprints of warm-blooded beings for up to two minutes after they were made.\nRequirement: Abomination race.` },
    { name: 'Enhanced Quills', desc: `Your Quills explode out with explosive force. The Quills ability now works on any targets up to three Units away.\nRequirement: Abomination race.` },
    { name: 'Enhanced Exoskeleton', desc: `You gain an additional innate Armor Value against all damage types except Curse.\nRequirement: Abomination race.` },
  ],

  Altered: [
    {
      name: 'Perfect Conduit',
      desc: `Increase your innate Electric Armor Value to six.\nRequirement: Requires Electrokinesis ability; Altered race.`,
    },
    {
      name: 'Arcing Lightning',
      desc: `You may add the Electric damage type to all attacks made with ranged weapons.\nRequirement: Requires Electrokinesis ability; Altered race.`,
    },
    {
      name: 'Speed of Thought',
      desc: `You may spend one AP’s worth of actions for free before an enemy group would take their first turn each combat round.\nRequirement: Requires Perfect Reflexes ability; Altered race.`,
    },
    {
      name: 'I am Speed',
      desc: `Regardless of initiative you may choose to take the first turn during a new battle round.\nRequirement: Requires Perfect Reflexes ability; Altered race.`,
    },
    {
      name: 'Impulsive Command',
      desc: `For one AP, you may attempt to force an adjacent target to perform a simple action that fits within ~1 AP (≈3 seconds). The target must make a Fortitude DC. On a fail, they must perform that action. Once affected, a target can’t be affected again for one day.\nRequirement: Requires ESP ability; Altered race.`,
    },
    {
      name: 'Predictive Combat',
      desc: `For one AP, select a target. You gain advantage on one attack OR on one Reflex DC against an attack from that target until the beginning of your next turn. May be triggered at any time, even during another’s turn. This is a focus ability.\nRequirement: Requires ESP ability; Altered race.`,
    },
    {
      name: 'Ascendant',
      desc: `You may have two focus abilities active without losing focus.\nRequirement: Altered race.`,
    },
    {
      name: 'Adaptive Immune System',
      desc: `Once you have suffered an injury from a damage type, you gain one innate Armor Value against that damage type until the following day. This stacks.\nRequirement: Altered race.`,
    },
  ],

  Ascended: [
    { name: 'Falcon Speed', desc: `You may now move two additional Units per AP spent to move while flying.\nRequirement: Ascended race.` },
    { name: 'Aerial Dive', desc: `You may move twice as many Units per AP if flying and traveling downward.\nRequirement: Ascended race.` },
    { name: 'Death From Above', desc: `Add one ArP to an attack for each Unit you descended that turn (max 5) prior to making the attack.\nRequirement: Ascended race.` },
    { name: 'Aerial Maneuvering', desc: `All attacks against you receive a one Die Level penalty for every five Units you moved during your prior turn.\nRequirement: Ascended race.` },
    { name: 'Wing Blast', desc: `For one AP, attempt to blow an adjacent target back one space. Make a contested Bodybuilding DC; on a win, move the target one space away.\nRequirement: Ascended race.` },
  ],

  Demonkin: [
    { name: 'Crimson Call', desc: `For two AP, sense the heartbeat of all living creatures within five Units (even if hidden) and read basic emotions (fear, anger, excitement).\nRequirement: Demonkin race.` },
    { name: 'Blood Bullet', desc: `For one blood point and two AP, fire three blood bullets at up to three targets within 10 Units. Make a Shurikens or Pistols attack for each. All considered ideal range, piercing damage, ArP 1.\nRequirement: Demonkin race.` },
    { name: 'Blood Blade', desc: `For one blood point and 2 AP, form a scythe of blood that attacks all adjacent targets using Slashing Melee skill. Slash damage, ArP 2.\nRequirement: Demonkin race.` },
    { name: 'Crimson Cloud', desc: `For two blood points and two AP, create an obscuring red cloud (5×5 Units) centered on you. Attacks through/within the cloud suffer −2 Die Levels unless the attacker can sense through the mist.\nRequirement: Demonkin race.` },
    { name: 'Bloodthirsty', desc: `Increase your blood point pool to seven.\nRequirement: Demonkin race.` },
    { name: 'Blood Lord', desc: `Increase your blood point pool to ten.\nRequirement: Requires Bloodthirsty; Demonkin race.` },
    { name: 'Red Iron', desc: `Add +1 ArP to all attacks that use blood points. May be taken multiple times.\nRequirement: Demonkin race.` },
    { name: 'Demonic Blood', desc: `Add the Curse damage type to all attacks that use blood points.\nRequirement: Demonkin race.` },
    { name: 'Blood Tendril', desc: `For one blood point and one AP, extend a tendril to pull a target within three Units into an adjacent space. If unwilling, make a contested Bodybuilding DC; on a win, pull the target.\nRequirement: Demonkin race.` },
    { name: 'Extra Tendrils', desc: `May be selected up to four times. Increase the number of tendrils (and therefore targets) of Blood Tendril by one.\nRequirement: Requires Blood Tendril; Demonkin race.` },
  ],

  Draconum: [
    { name: 'Enhanced Hoard', desc: `Your Dragon Hoard can grant 4 innate Armor Value if you have ≥ 50,000 Goldbacks, and 5 if ≥ 100,000.\nRequirement: Draconum race.` },
    { name: 'Golden Aura', desc: `You may increase the Die Level of a DC by reducing all innate Armor Values granted by your dragon hoard by one.\nRequirement: Draconum race.` },
    { name: 'Miserly Intuition', desc: `Reduce monthly costs of food and housing by 25% (rounded down).\nRequirement: Draconum race.` },
    { name: 'Dragon Breath', desc: `Once per day (2 AP), exhale molten metal in a straight line five Units long. The attack’s Die Level and ArP equal your hoard’s innate Armor Value bonus. Burning damage.\nRequirement: Draconum race.` },
  ],

  Fireborne: [
    { name: 'Heat Training', desc: `Gain +2 innate Armor Value versus the Burn damage type.\nRequirement: Fireborne race.` },
    { name: 'Overheat', desc: `Expend all innate Burn Armor Values to attack all adjacent targets, inflicting Burning (X) where X equals AV expended. AV restores between missions.\nRequirement: Fireborne race.` },
    { name: 'Heat Transfer', desc: `Add the Burn damage type to attacks with ranged weapons.\nRequirement: Fireborne race.` },
    { name: 'Smokescreen', desc: `While under the Burning condition, all attacks against you suffer a −1 Die Level penalty.\nRequirement: Fireborne race.` },
  ],

  Liches: [
    { name: 'Being of Decay', desc: `You are immune to the Poisoned and Poisoned (Deadly) conditions.\nRequirement: Lich race.` },
    { name: 'Rigor Mortis', desc: `Anytime you would receive a condition other than Crippled or Critical, you may instead choose to take one injury.\nRequirement: Lich race.` },
    { name: 'Defibrillator', desc: `If hit by Electric damage (even if no damage is dealt), gain +1 bonus AP for your next turn. Stacks.\nRequirement: Lich race.` },
    { name: 'Unfazed by Pain', desc: `Ignore negative Die Level modifiers from your first Crippled condition.\nRequirement: Lich race.` },
  ],

  'Maggot Lords': [
    { name: 'Rot Eaters', desc: `You can eat anything without ill effects and cannot be poisoned by anything you devour.\nRequirement: Maggot Lord race.` },
    { name: 'Maggot Retaliation', desc: `When attacked from an adjacent space, the maggots inside you make a free retaliatory attack: Die Level 2, Slash damage, ArP 1. May be taken up to three times; each time increases ArP by 1 and Die Level by 1.\nRequirement: Maggot Lord race.` },
    { name: 'Immovable Object', desc: `You are immune to abilities that force you to move.\nRequirement: Maggot Lord race.` },
    { name: 'Corrosive Bile', desc: `Three times per day, make a Bodybuilding attack (range 5 Units). On a hit it applies Corroded (5). Deals no damage.\nRequirement: Maggot Lord race.` },
  ],

  Outsiders: [
    { name: 'Human Perseverance', desc: `Once per mission, you may make two rolls for a DC and add the results together.\nRequirement: Outsider race.` },
    { name: 'Adaptability', desc: `Improve a skill of your choice by one level.\nRequirement: Outsider race.` },
    { name: 'Absolute Mastery', desc: `Choose one skill that is at level five and reset it to level one. You now have advantage on all DCs using this skill.\nRequirement: Must have a level five skill; Outsider race.` },
  ],

  'Rat Kings': [
    { name: 'Overlooked and Hunted', desc: `Once per combat round, you may reroll an Evade (Reflex) DC.\nRequirement: Rat King race.` },
    { name: 'Commander of the Swarm', desc: `Focus ability (2 AP): gather a controllable swarm (flies/roaches/etc.) in an adjacent space.\nPestilent Swarm (NPC): AP 3, Reflex 4, Martial Arts 2; Flying; Move 4 Units per AP; Armor (all): 0; Overwhelm: shares a space and imposes −1 Die Level on that target’s DCs; Fragile: destroyed upon receiving an injury.\nRequirement: Rat King race.` },
    { name: 'Soul Bond', desc: `Possess and share the senses of a willing pest (mouse/spider/snake/insect). Focus—remains until you move or the host is injured/killed.\nRequirement: Rat King race.` },
    { name: 'Secret Broker', desc: `Access a secret vermin spy network (Gutter Keepers) to trade secrets for information. Beware: members may sell secrets to outsiders.\nRequirement: Rat King race.` },
    { name: 'Compressed Ribs', desc: `Squeeze through impossibly small spaces—if your head can fit, you can pass through.\nRequirement: Rat King race.` },
  ],

  'Succubus/Incubus': [
    { name: 'Transcendent Attraction', desc: `Your Ethereal Beauty and Lamprey’s Kiss abilities now work on Demons.\nRequirement: Succubus/Incubus race.` },
    { name: 'Paralyzing Gaze', desc: `For 2 AP, force a target to make a contested Lust skill DC. On a fail, they cannot use AP on movement on their next turn.\nRequirement: Succubus/Incubus race.` },
    { name: 'Draining Touch', desc: `You may apply the effects of Lamprey’s Kiss to any physical touch, including Martial Arts attacks.\nRequirement: Succubus/Incubus race.` },
    { name: 'Addictive Saliva', desc: `Your saliva becomes addictive. Targets of Lamprey’s Kiss contact your saliva. You may spend 1 AP to coat a Shuriken or Melee weapon with your saliva for an attack this turn. Targets make an Addiction (Fortitude) DC:\n• 4+: No effect (successful DC)\n• 1–3: Craves—gain Addiction Tremors condition\nRequirement: Succubus/Incubus race.` },
  ],
};

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
  return d.toISOString().slice(0, 10); // stable YYYY-MM-DD
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
}> = ({ value, onChange, readOnly }) => {
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
          <select
            id={`${idBase}-race`}
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={(value.race as RaceName) ?? ''}
            onChange={(e) =>
              onChange(set(value, 'race', (e.target.value || undefined) as RaceName | undefined))
            }
            disabled={readOnly}
          >
            <option value="" disabled>Select race…</option>
            {RACE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
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
  skillDefs: AttributeDef[];
  skillValues: Record<string, number>;
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
  skillDefs,
  skillValues,
  skillRerolls,
  onChangeSkillRerolls,
  debt,
  onChangeDebt,
  recurring,
  onChangeRecurring,
  readOnly,
}) => {
  const groups = groupBy(skillDefs);
    // Auto-initialize per-skill rerolls to match skill level when a box first appears
  useEffect(() => {
    const next: Record<string, number> = {};
    let changed = false;

    for (const def of skillDefs) {
      const level = skillValues[def.id] ?? (def.min ?? 1);
      const eligible = level >= SKILL_REROLL_THRESHOLD;
      const current = skillRerolls[def.id];
      if (eligible && (current === undefined || current === null)) {
        next[def.id] = clamp(level, SKILL_REROLL_MIN, SKILL_REROLL_MAX);
        changed = true;
      }
    }

    if (changed) {
      onChangeSkillRerolls({ ...skillRerolls, ...next });
    }
  }, [skillDefs, skillValues, skillRerolls, onChangeSkillRerolls]);

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
                    <div className="mb-2 flex items-center justify-between">
            <div className="mt-4 text-sm font-medium text-white">Skill Rerolls</div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const next: Record<string, number> = { ...skillRerolls };
                (['combat','magic','specialized'] as SkillGroup[]).forEach((grp) => {
                  groups[grp].forEach((def) => {
                    const level = skillValues[def.id] ?? (def.min ?? 1);
                    if (level >= SKILL_REROLL_THRESHOLD) {
                      next[def.id] = clamp(level, SKILL_REROLL_MIN, SKILL_REROLL_MAX);
                    }
                  });
                });
                onChangeSkillRerolls(next);
              }}
              disabled={readOnly}
              className="bg-black text-white hover:bg-black/80"
            >
              Reset to Skill Level
            </Button>
          </div>
          {(['combat', 'magic', 'specialized'] as SkillGroup[]).map((grp) => {
            const skills = groups[grp].filter(
              (def) => (skillValues[def.id] ?? (def.min ?? 1)) >= SKILL_REROLL_THRESHOLD
            );
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
                          {def.label} Rerolls
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
  fields: ItemFieldDef[];
  rows: Array<Record<string, string | number>>;
  onChange: (next: Array<Record<string, string | number>>) => void;
  readOnly?: boolean;
}> = ({ title, fields, rows, onChange, readOnly }) => {
  const idBase = useId();
  const addRow = () =>
    onChange([
      ...rows,
      Object.fromEntries(fields.map((f) => [f.id, f.type === 'number' ? 0 : ''])),
    ]);
  const removeRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground text-white">{title}</div>
          <Button type="button" size="sm" onClick={addRow} onMouseDown={(e) => e.preventDefault()} disabled={readOnly}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs text-muted-foreground text-white">
                {fields.map((f) => (
                  <th key={f.id} className="px-2 font-medium">
                    {f.label}
                  </th>
                ))}
                <th className="w-12 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={`${idBase}-row-${i}`} className="rounded-xl">
                  {fields.map((f) => (
                    <td key={f.id} className="px-2 py-2">
                      <Input
                        aria-label={`${f.label} row ${i + 1}`}
                        value={String(row[f.id] ?? (f.type === 'number' ? 0 : ''))}
                        inputMode={f.type === 'number' ? 'numeric' : undefined}
                        pattern={f.type === 'number' ? '[0-9]*' : undefined}
                        onChange={(e) => {
                          const v =
                            f.type === 'number' ? Number(e.target.value || 0) : e.target.value;
                          const next = rows.slice();
                          next[i] = { ...next[i], [f.id]: v };
                          onChange(next);
                        }}
                        disabled={readOnly}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right">
                    <Button
                      onMouseDown={(e) => e.preventDefault()}
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove row ${i + 1}`}
                      onClick={() => removeRow(i)}
                      disabled={readOnly}
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-2 py-4 text-sm text-muted-foreground text-white" colSpan={fields.length + 1}>
                    No items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                <Input
                  value={txt}
                  onChange={(e) => {
                    const next = accessories.slice();
                    next[i] = e.target.value;
                    onChangeAccessories(next);
                  }}
                  placeholder={`Accessory ${i + 1}`}
                  disabled={readOnly}
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
                    <Label>Name</Label>
                    <Input
                      value={w.name}
                      onChange={(e) => patchWeapon(w.id, { name: e.target.value })}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>Skill</Label>
                    <Input
                      value={w.skill}
                      onChange={(e) => patchWeapon(w.id, { skill: e.target.value })}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label>Action/Effects</Label>
                    <Textarea
                      value={w.action}
                      onChange={(e) => patchWeapon(w.id, { action: e.target.value })}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label>Ideal Range</Label>
                      <Input
                        value={w.idealRange}
                        onChange={(e) => patchWeapon(w.id, { idealRange: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Max Range</Label>
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
                      <Label>Max Ammo</Label>
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
                      <Label>Damage Type(s)</Label>
                      <Input
                        value={w.damageTypes}
                        onChange={(e) => patchWeapon(w.id, { damageTypes: e.target.value })}
                        placeholder="Pierce, Burn"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>ArP</Label>
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

const ArmorSlotsBox: React.FC<{
  armor: ArmorSlots;
  onChange: (next: ArmorSlots) => void;
  readOnly?: boolean;
}> = ({ armor, onChange, readOnly }) => {
  const Slot: React.FC<{ k: keyof ArmorSlots; label: string }> = ({ k, label }) => {
    const slot = armor[k];
    return (
      <div className="space-y-2">
        <div className="grid gap-1.5">
          <Label>{label}</Label>
          <Input
            value={slot.name}
            onChange={(e) => onChange({ ...armor, [k]: { ...slot, name: e.target.value } })}
            placeholder={`${label} item name`}
            disabled={readOnly}
          />
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-whtie">
        <div className="mb-2 text-sm font-medium text-muted-foreground text-white">Armor Slots</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-white">
          <Slot k="head" label="Head" />
          <Slot k="body" label="Body" />
          <Slot k="lining" label="Lining" />
        </div>
      </CardContent>
    </Card>
  );
};

// Replace the existing ArmorTotalsBox with this version
const ArmorTotalsBox: React.FC<{
  av: ArmorAV;
  onChange: (next: ArmorAV) => void;
  readOnly?: boolean;
}> = ({ av, onChange, readOnly }) => {
  const MIN = 0;
  const MAX = 9;

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-2 text-sm font-medium text-muted-foreground text-white">
          Armor Values (Total)
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DAMAGE_TYPES.map((dt) => {
            const val = clamp(av[dt] ?? 0, MIN, MAX);
            return (
              <div key={dt} className="grid gap-1">
                <Label className="text-xs">{dt}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={val}
                    readOnly
                    className="w-15"
                    disabled={readOnly}
                    aria-label={`${dt} value`}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onChange({ ...av, [dt]: clamp(val - 1, MIN, MAX) })}
                    disabled={readOnly}
                    aria-label={`${dt} decrement`}
                  >
                    −
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onChange({ ...av, [dt]: clamp(val + 1, MIN, MAX) })}
                    disabled={readOnly}
                    aria-label={`${dt} increment`}
                  >
                    +
                  </Button>
                </div>
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
  const add = () =>
    onChange([
      ...vehicles,
      { id: makeId('veh'), name: '', capacity: 0, topSpeed: '', flying: false, notes: '' },
    ]);
  const patch = (id: string, p: Partial<VehicleEntry>) =>
    onChange(vehicles.map((v) => (v.id === id ? { ...v, ...p } : v)));
  const remove = (id: string) => onChange(vehicles.filter((v) => v.id !== id));

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium text-muted-foreground text-white">Vehicles</div>
          <Button type="button" onMouseDown={(e) => e.preventDefault()} size="sm" onClick={add} disabled={readOnly}>
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>

        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} className="rounded-xl border p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="grid gap-1">
                  <Label>Name</Label>
                  <Input
                    value={v.name}
                    onChange={(e) => patch(v.id, { name: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Passenger Capacity</Label>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={v.capacity}
                    onChange={(e) =>
                      patch(v.id, { capacity: clamp(parseInt(e.target.value || '0', 10), 0, 999) })
                    }
                    disabled={readOnly}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Top Speed</Label>
                  <Input
                    value={v.topSpeed}
                    onChange={(e) => patch(v.id, { topSpeed: e.target.value })}
                    placeholder="e.g., 20 Units"
                    disabled={readOnly}
                  />
                </div>
                <div className="grid gap-1">
                  <Label>Type</Label>
                  <select
                    className="rounded-md border bg-background px-3 py-2 text-sm"
                    value={v.flying ? 'flying' : 'land'}
                    onChange={(e) => patch(v.id, { flying: e.target.value === 'flying' })}
                    disabled={readOnly}
                  >
                    <option value="land">Landlocked</option>
                    <option value="flying">Flying</option>
                  </select>
                </div>
                <div className="md:col-span-2 grid gap-1">
                  <Label>Notes</Label>
                  <Textarea
                    value={v.notes ?? ''}
                    onChange={(e) => patch(v.id, { notes: e.target.value })}
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <Button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(v.id)}
                  disabled={readOnly}
                  aria-label="Remove vehicle"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && (
            <div className="text-sm text-muted-foreground text-white">No vehicles listed.</div>
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
    name === 'Corroded' ||
    name === 'Disoriented' ||
    name === 'Frightened' ||
    name === 'Impaled' ||
    name === 'Madness' ||
    name === 'Paralysis' ||
    name === 'Poisoned' ||
    name === 'Poisoned (Deadly)' ||
    name === 'Transformed';

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
            <div key={e.id} className="space-y-2 rounded-md bg-black/20 p-3">
              {/* First row: select + X + remove */}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-7 items-center">
                <select
                  className="md:col-span-4 rounded-md border bg-background px-3 py-2 text-sm text-white"
                  value={e.name}
                  onChange={(ev) => {
                    const name = ev.target.value as ConditionName;
                    const next = [...(entries || [])];
                    next[i] = { ...e, name, severity: isX(name) ? (e.severity ?? 1) : undefined };
                    onChange(next);
                  }}
                  disabled={readOnly}
                >
                  {ALL.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>

                {isX(e.name) && (
                  <Input
                    className="md:col-span-2"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="X"
                    value={String(e.severity ?? 1)}
                    onChange={(ev) => {
                      const next = [...(entries || [])];
                      next[i] = { ...e, severity: clamp(parseInt(ev.target.value || '0', 10), 0, 99) };
                      onChange(next);
                    }}
                    disabled={readOnly}
                  />
                )}

              </div>

              {/* Second row: rules description */}
              <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
                {renderConditionText(e.name as ConditionName, e.severity)}
              </div>
              <div className="md:col-span-1 flex justify-end">
                  <Button
                    type="button"
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
          ))}
          

          {(entries || []).length === 0 && (
            <div className="text-sm text-muted-foreground text-white">No conditions.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AbilitiesPanel: React.FC<{
  abilities: AbilityEntry[];
  skillDefs: AttributeDef[];
  raceName?: RaceName;
  onChange: (next: AbilityEntry[]) => void;
  readOnly?: boolean;
}> = ({ abilities, skillDefs, raceName, onChange, readOnly }) => {
  const [showKindPicker, setShowKindPicker] = React.useState(false);
  const [pickingRace, setPickingRace] = React.useState(false);
  const [draftRaceAbility, setDraftRaceAbility] = React.useState<string>('');

  const add = (entry: AbilityEntry) => onChange([...(abilities ?? []), entry]);
  const remove = (id: string) => onChange((abilities ?? []).filter(a => a.id !== id));
  const patch = (id: string, p: Partial<AbilityEntry>) =>
    onChange((abilities ?? []).map(a => (a.id === id ? { ...a, ...p } : a)));

  const skillUnlocks = (abilities ?? []).filter(a => a.kind === 'skill');
  const generalUnlocks = (abilities ?? []).filter(a => a.kind === 'general');
  const raceUnlocks = (abilities ?? []).filter(a => a.kind === 'race');

  const raceDefs: RaceAbilityDef[] = raceName ? (RACE_ABILITIES[raceName] ?? []) : [];
  const raceNames = raceDefs.map(d => d.name);
  const hasRaceAbility = (name: string) => raceUnlocks.some(a => a.name === name);

  const startAddRaceAbility = () => {
    if (!raceName || raceDefs.length === 0) return;
    const firstAvailable = raceNames.find(n => !hasRaceAbility(n)) ?? raceNames[0] ?? '';
    setDraftRaceAbility(firstAvailable);
    setPickingRace(true);
  };
  const confirmAddRaceAbility = () => {
    if (!draftRaceAbility) return setPickingRace(false);
    if (hasRaceAbility(draftRaceAbility)) { setPickingRace(false); setShowKindPicker(false); return; }
    add({ id: makeId('ab'), kind: 'race', name: draftRaceAbility });
    setPickingRace(false);
    setShowKindPicker(false);
  };
  const cancelPickers = () => { setPickingRace(false); setShowKindPicker(false); };

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Abilities</div>
          {!showKindPicker ? (
            <Button
              type="button"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowKindPicker(true)}
              disabled={readOnly}
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
                onClick={() => add({ id: makeId('ab'), kind: 'general', name: '', notes: '' })}
                disabled={readOnly}
              >
                General Unlock
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add({ id: makeId('ab'), kind: 'skill', name: '', linkedSkillId: skillDefs[0]?.id, notes: '' })}
                disabled={readOnly || skillDefs.length === 0}
              >
                Skill Unlock
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={startAddRaceAbility}
                disabled={readOnly || !raceName || raceDefs.length === 0}
                title={!raceName ? 'Select a race first' : (raceDefs.length === 0 ? 'No abilities for this race' : '')}
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

        {/* Inline picker when adding a Race ability */}
        {pickingRace && (
          <div className="mb-3 grid gap-2 md:grid-cols-3 items-end rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="grid gap-1 md:col-span-2">
              <Label>Select Race Ability {raceName ? `for ${raceName}` : ''}</Label>
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={draftRaceAbility}
                onChange={(e) => setDraftRaceAbility(e.target.value)}
              >
                {raceDefs.map((d) => (
                  <option key={d.name} value={d.name} disabled={hasRaceAbility(d.name)}>
                    {hasRaceAbility(d.name) ? `${d.name} (already added)` : d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 md:justify-end">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onMouseDown={(e) => e.preventDefault()}
                onClick={confirmAddRaceAbility}
                disabled={!draftRaceAbility}
              >
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setPickingRace(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* RACE ACQUIRED (top, list-driven, shows description) */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase text-white/80">Race Acquired</div>

          {!raceName && (
            <div className="text-sm text-white/70">Select a race to use race abilities.</div>
          )}

          {raceName && raceUnlocks.length === 0 && (
            <div className="text-sm text-white/70">No race abilities added yet.</div>
          )}

          {raceName && raceUnlocks.length > 0 && (
            <div className="grid gap-2">
              {raceUnlocks.map((a) => {
                const def = raceDefs.find(d => d.name === a.name);
                const options = raceDefs.map(d => d.name);
                const notInList = a.name && !options.includes(a.name);
                const displayOptions = notInList ? [a.name, ...options] : options;

                return (
                  <div key={a.id} className="rounded-xl border border-white/10 p-3">
                    <div className="grid gap-2 md:grid-cols-3 items-end">
                      <div className="grid gap-1 md:col-span-2">
                        <Label>Ability</Label>
                        <select
                          className="rounded-md border bg-background px-3 py-2 text-sm"
                          value={a.name}
                          onChange={(e) => patch(a.id, { name: e.target.value })}
                          disabled={readOnly || displayOptions.length === 0}
                        >
                          {displayOptions.map((n, idx) => (
                            <option key={`${a.id}-${idx}-${n}`} value={n} disabled={notInList && idx === 0}>
                              {notInList && idx === 0 ? `${n} (not in ${raceName})` : n}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => remove(a.id)}
                          disabled={readOnly}
                          aria-label="Remove race ability"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Auto rules text */}
                    <div className="mt-2 rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
                      {def ? def.desc : `No description found for "${a.name}" in ${raceName}.`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SKILL UNLOCKS (unchanged) */}
        {/* ...keep your existing Skill Unlock + General Unlock sections here... */}
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
  readOnly?: boolean;
}> = ({ defs, values, ticked, onToggle, onCommit, history, spent = {}, readOnly }) => {
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
                tabIndex={-1}
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
const DEFAULT_REGISTRY: RulesRegistry = {
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
    { id: 'engineer', label: 'Engineer', group: 'specialized', min: 1, max: 5 },
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

const DEFAULT_CHARACTER: Character = {
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
    head: { name: ''},
    body: { name: ''},
    lining: { name: ''},
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
  const [char, setChar] = useState<Character>(() => {
  if (props.value) return props.value;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as Character : DEFAULT_CHARACTER;
    } catch {}
  }
  return DEFAULT_CHARACTER;
});


// Tracks previous attribute levels so we can detect increases for tally consumption
const prevAttrsRef = React.useRef<Record<string, number>>(char.attributes);

// When any attribute goes up, consume all effective tallies for that skill
useEffect(() => {
  const prev = prevAttrsRef.current || {};
  const next = char.attributes || {};

  const spent = { ...(char.tallySpent ?? {}) };
  const eff = effectiveTallies(char.missionHistory ?? [], spent);

  let changed = false;
  for (const id of Object.keys(next)) {
    const before = prev[id] ?? 0;
    const after = next[id] ?? 0;
    if (after > before) {
      const e = eff[id] ?? 0;
      if (e > 0) {
        spent[id] = (spent[id] || 0) + e;
        changed = true;
      }
    }
  }

  if (changed) {
    onChange({ ...char, tallySpent: spent });
  }

  prevAttrsRef.current = next;
}, [char.attributes, char.missionHistory, char.tallySpent]);

const registry = useMemo(() => props.registry ?? DEFAULT_REGISTRY, [props.registry]);
const onChange = props.onChange ?? setChar;
const readOnly = props.readOnly ?? false;

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
      const a = document.createElement('a');
      a.href = url;
      a.download = 'character.json';
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

  /*const handleResetSave = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    onChange(DEFAULT_CHARACTER);
  };*/ //Commented this out as it in unused currently. Leaving in case I want it again
  return (
    <div className="mx-auto grid max-w-6xl gap-4 p-4">

      <IdentitySection value={char} onChange={onChange} readOnly={readOnly} />

      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
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
            skillDefs={registry.attributes}
            skillValues={char.attributes}
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
            skillDefs={registry.attributes}
            raceName={char.race as RaceName | undefined}
            onChange={(next) => onChange({ ...char, abilities: next })}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Items */}
        <TabsContent value="items" className="grid gap-4 text-white">
          <ArmorSlotsBox
             armor={char.armor}
             onChange={(next) => onChange(set(char, 'armor', next))}
             readOnly={readOnly}
           />
          <ArmorTotalsBox
             av={char.totalArmor ?? emptyAV()}
             onChange={(next) => onChange(set(char, 'totalArmor', next))}
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
            title="Inventory"
            fields={registry.itemFields}
            rows={char.items}
            onChange={(rows) => onChange(set(char, 'items', rows))}
            readOnly={readOnly}
          />
          <ItemsTable
            title="Stash"
            fields={registry.itemFields}
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
                    onChange(set(char, 'housing', { ...(char.housing ?? {}), apartmentTier: val }));
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
            readOnly={readOnly}
          />
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