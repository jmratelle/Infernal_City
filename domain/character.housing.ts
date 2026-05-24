export const HIDEOUT_UPGRADES = [
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

export type HideoutUpgrade = (typeof HIDEOUT_UPGRADES)[number];

export const HIDEOUT_TIER_DETAILS = {
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

export const HIDEOUT_UPGRADE_DETAILS: Record<HideoutUpgrade, { price: number; summary: string }> = {
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
