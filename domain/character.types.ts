export type SkillGroup = 'combat' | 'magic' | 'specialized';
export type AbilityKind = 'skill' | 'general' | 'race';

export type AbilityEntry = {
  id: string;
  kind: AbilityKind;
  name: string;
  linkedSkillId?: string; // optional; only used for 'skill' unlocks
  notes?: string;
  count?: number; // stacks for stackable abilities (defaults to 1)
  hidden?: boolean;
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

export type RaceAbilityDef = {
  name: string;
  desc: string;
  group?: string; // e.g., "mutation" (Abomination)
  oneOf?: string; // e.g., "altered-core" (Altered)
  auto?: boolean; // default/starting
  requiresAll?: string[]; // must have ALL of these ability names
  requiresAny?: string[]; // must have AT LEAST ONE of these names
  requiresAnySkillLevel?: number; // must have ANY skill at >= this level
  requiresSkillLevels?: Record<string, number>; // specific skillId -> min level
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
  | 'Burn'
  | 'Corrosive'
  | 'Crush'
  | 'Slash'
  | 'Electric'
  | 'Freeze'
  | 'Pierce'
  | 'Curse';

export type ArmorAV = Record<DamageType, number>;
export type ArmorSlots = {
  head: { name: string; av: ArmorAV };
  body: { name: string; av: ArmorAV };
  lining: { name: string; av: ArmorAV };
};
export type ArmorCategory = 'body' | 'lining' | 'head';

export type VehicleEntry = {
  id: string;
  name: string; // allows custom names too
  survivability?: number;
  capacity: number;
  topSpeed: string;
  flying: boolean;
  notes?: string;
  size: string;
};

export type Character = {
  id: string;
  schemaVersion?: number;
  name: string;
  portraitUrl?: string;
  race?: string;
  origin?: string;
  money?: number;
  abilities?: AbilityEntry[];
  tallySpent?: Record<string, number>; // tallies consumed by level-ups
  abilityUnlocksAvailable?: number;
  attributes: Record<string, number>;
  resources: Record<string, number>;
  items: Array<Record<string, string | number>>;
  stash?: Array<Record<string, string | number>>;

  armor: ArmorSlots;
  totalArmor?: ArmorAV; // manual modifiers layered on top of equipped armor
  accessories?: string[];
  weapons?: WeaponEntry[];

  vehicles: VehicleEntry[];

  injuries?: number; // 0-10
  bloodPoints?: number;
  conditions?: ConditionEntry[];

  notes?: string;
  peopleMet?: string;
  secrets?: string;

  skillRerolls?: Record<string, number>;
  currentMissionSkills?: Record<string, boolean>;
  missionHistory?: MissionLogEntry[];

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

  debt?: DebtEntry[];
  recurringCosts?: RecurringCostEntry[];
};

export type CharacterSheetProps = {
  registry: RulesRegistry;
  value: Character;
  onChange: (updated: Character) => void;
  onChangeCharacter?: () => void;
  onDeleteCharacter?: () => void | Promise<void>;
  readOnly?: boolean;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';

  initialCharacter?: Character;
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
  group?: string; // e.g., "mutation" (Abomination)
  oneOf?: string; // e.g., "altered-core" (Altered)
  auto?: boolean; // default/starting
  requiresAll?: string[]; // must have ALL of these ability names
  requiresAny?: string[]; // must have AT LEAST ONE of these names
  requiresAnySkillLevel?: number; // must have ANY skill at >= this level
  requiresSkillLevels?: Record<string, number>; // specific skillId -> min level
  stackable?: boolean;
  stackMax?: number;
}
