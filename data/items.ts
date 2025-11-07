// /data/items.ts
// Structured data for all game equipment categories

// -----------------------------
// ACCESSORIES
// -----------------------------
export const ACCESSORY_OPTIONS = [
  "Backpack",
  "Utility Belt",
  "Basic Amulet of Protection",
  "Brass Knuckles",
  "Pact Ring",
  "Safe Retreat",
  "Ring of Skill",
  "Rebreather",
  "Oracle Bobble",
  "Disruptor Earrings",
  "Parachute",
  "Exterior Pacemaker",
  "X-Ray Goggles",
  "Grapple Harness",
  "Launch Shoes",
  "Insulated Boots",
  "Seven League Boots",
  "Arcane Tattoo of Protections",
  "Arcane Tattoo of Cursed Infusion",
  "Head Lamp",
  "Enchanted Ring of Armor",
  "Enchanted Ring of Superior Armor",
  "Tiger Mask",
  "Ash Coat",
  "Mask of Oblivion",
  "Mark of the Hunted",
  "Guardian Centipede",
  "Ring of the Infernal Gaze",
];

export type ItemOptions = {
  Accessories: string[];
  Armor: Record<string, string[]>;
  Consumables: string[];
  Weapons: Record<string, string[]>;
};
export const ITEM_OPTIONS = {
  Accessories: [
    "Backpack",
    "Utility Belt",
    "Basic Amulet of Protection",
    "Brass Knuckles",
    "Pact Ring",
    "Safe Retreat",
    "Ring of Skill",
    "Rebreather",
    "Oracle Bobble",
    "Disruptor Earrings",
    "Parachute",
    "Exterior Pacemaker",
    "X-Ray Goggles",
    "Grapple Harness",
    "Launch Shoes",
    "Insulated Boots",
    "Seven League Boots",
    "Arcane Tattoo of Protection",
    "Arcane Tattoo of Cursed Infusion",
    "Head Lamp",
    "Enchanted Ring of Armor",
    "Enchanted Ring of Superior Armor",
    "Tiger Mask",
    "Ash Coat",
    "Mask of Oblivion",
    "Mark of the Hunted",
    "Guardian Centipede",
    "Ring of the Infernal Gaze",
  ],

  Armor: {
    "Body Armor": [
      "Flak Suit",
      "Flak Vest",
      "Bomb Suit",
      "Mag Field Generator",
      "Battle Plate",
      "Hazard Suit",
    ],
    "Armor Lining": [
      "Thermal Lining",
      "Insulated Lining",
      "Combat Mesh",
      "Blessed Vestments",
      "Nanomesh",
    ],
    "Head Pieces": [
      "Gas Mask",
      "Enchanted Circlet",
      "Darkvision Goggles",
      "Heat Eye 3",
    ],
  },

  Consumables: [
    "Pepper Box Grenade",
    "Smoke Grenade",
    "Napalm Flask",
    "Fusion Grenade",
    "Biofoam",
    "First Aid Kit",
    "Cheap Lockpicks",
    "High Quality Lockpicks",
    "Blood Pack",
    "Extinguisher",
    "Algae Injection",
    "Clarity Inhalant",
    "Bliss",
    "Pain Killers",
    "Poison Vial",
    "Paralysis Poison",
  ],

  Weapons: {
    Automatics: [
      "Trinity Burst Gun",
      "Executioner",
      "Flak Cannon",
      "Tesla’s Revenge",
      "Vulcan",
    ],
    "Crushing Melee": [
      "Crowbar",
      "Stun Baton",
      "Bone Crusher",
      "Gravity Mace",
    ],
    "Drone Operation": [
      "Spy Drone",
      "Defender Drone",
      "Hunter Drone",
      "Assassin Drone",
    ],
    Marksman: [
      "Crossbow",
      "Hercules",
      "Predator Coil Gun",
      "Matthew’s Scoped Rifle",
      "Evicirator",
      "Aimbot Elite",
      "Syracuse",
    ],
    "Piercing Melee": ["Spear", "Trident", "Hydraulic Piercer"],
    Pistols: ["Quad", "Safe Cracker", "Red Eye", "-196°C", "Stinger"],
    Propellants: [
      "Boom Tube",
      "Hook Shot",
      "Buzz Net",
      "RPG",
      "Flamethrower",
      "Quarantine Snake",
      "Particle Accelerator",
    ],
    Shotguns: ["Pump Action Shotgun", "Sawed-Off Shotgun", "Slag Belcher"],
    Shurikens: [
      "Throwing Daggers",
      "Viper Darts",
      "Razor Discs",
      "Plutonium Core Darts",
      "Heart Seekers",
      "Runic Daggers",
    ],
    "Slashing Melee": [
      "Machete",
      "Cane Sword",
      "Plasma Cutter",
      "Zephyr Blade",
    ],
  },
};


// -----------------------------
// ARMOR
// -----------------------------
export const ARMOR_OPTIONS = {
  body: [
    "Flak Suit",
    "Flak Vest",
    "Bomb Suit",
    "Mag Field Generator",
    "Battle Plate",
    "Hazard Suit",
  ],
  lining: [
    "Thermal Lining",
    "Insulated Lining",
    "Combat Mesh",
    "Blessed Vestiments",
    "Nanomesh",
  ],
  head: ["Gas Mask", "Enchanted Circlet", "Darkvision", "Heat Eye 3"],
};

// -----------------------------
// VEHICLES
// -----------------------------
export const VEHICLE_OPTIONS = [
  "Icarus",
  "Babylon Taxi",
  "Chopper Bike",
  "SUV",
  "Armored SUV",
  "Armored Limo",
];

export const VEHICLE_DATA = {
  Ground: ["SUV", "Armored SUV", "Armored Limo"],
  Flying: ["Icarus", "Babylon Taxi", "Chopper Bike"],
} as const;

// -----------------------------
// WEAPONS
// -----------------------------
export const WEAPON_OPTIONS = {
  Automatics: [
    "Trinity Burst Gun",
    "Executioner",
    "Flak Cannon",
    "Tesla’s Revenge",
    "Vulcan",
  ],
  Pistols: ["Quad", "Safe Cracker", "Red Eye", "-196 C", "Stinger"],
  Melee: {
    Crushing: ["Crow Bar", "Stun Batton", "Bone Crusher", "Gravity Mace"],
    Piercing: ["Spear", "Trident", "Hydraulic Piercer"],
    Slashing: ["Matchette", "Cane Sword", "Plasma Cutter", "Zephyr Blade"],
  },
  Marksman: [
    "Crossbow",
    "Hercules",
    "Predator Coil Gun",
    "Matthew’s Scoped Rifle",
    "Evicirator",
    "Aimbot Elite",
    "Syracuse",
  ],
  Propellants: [
    "Boom Tube",
    "Hook Shot",
    "Buzz Net",
    "RPG",
    "Flamethrower",
    "Quarantine Snake",
    "Particle Accelerator",
  ],
  Shotguns: ["Pump Action Shotgun", "Sawed Off Shotgun", "Slag Belcher"],
  Shurikens: [
    "Throwing Daggers",
    "Viper Darts",
    "Razor Discs",
    "Plutonium Core Darts",
    "Heart Seekers",
    "Runic Daggers",
  ],
  Drones: ["Spy Drone", "Defender Drone", "Hunter Drone", "Assassin Drone"],
};

// Optional structured stats lookup for auto-population
export const WEAPON_STATS: Record<
  string,
  {
    type: string;
    idealRange: string;
    maxRange: string;
    ammo: string;
    damage: string;
    arp: number;
    action: string;
  }
> = {
  // ---------- Automatics ----------
  "Trinity Burst Gun": {
    type: "Automatics",
    idealRange: "2–8 Units",
    maxRange: "12 Units",
    ammo: "4",
    damage: "Pierce",
    arp: 1,
    action: "[Attack 2 AP]",
  },
  "Executioner": {
    type: "Automatics",
    idealRange: "2–8 Units",
    maxRange: "12 Units",
    ammo: "5",
    damage: "Pierce",
    arp: 2,
    action: "[Attack 2 AP]",
  },
  "Flak Cannon": {
    type: "Automatics",
    idealRange: "3–8 Units",
    maxRange: "15 Units",
    ammo: "3",
    damage: "Pierce",
    arp: 2,
    action:
      "[Attack 2 AP] [Heavy 3: Requires Bodybuilding 3] [AOE 1: Hits all adjacent spaces to the target]",
  },
  "Tesla’s Revenge": {
    type: "Automatics",
    idealRange: "3–5 Units",
    maxRange: "10 Units",
    ammo: "5",
    damage: "Electric",
    arp: 2,
    action:
      "[Attack 2 AP] [Arcing shots: Hits an adjacent target if the first target is hit, continuing until a miss or no targets remain]",
  },
  "Vulcan": {
    type: "Automatics",
    idealRange: "2–8 Units",
    maxRange: "12 Units",
    ammo: "4",
    damage: "Pierce",
    arp: 3,
    action:
      "[Attack 2 AP] [Each attack makes one additional attack] [Requires Bodybuilding 4+ to equip]",
  },

  // ---------- Crushing Melee ----------
  "Crow Bar": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Crush",
    arp: 2,
    action: "[Attack 2 AP] [Silent]",
  },
  "Stun Batton": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Crush, Electric",
    arp: 1,
    action: "[Attack 2 AP]",
  },
  "Bone Crusher": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Crush",
    arp: 3,
    action: "[Attack 2 AP] [Silent]",
  },
  "Gravity Mace": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Crush",
    arp: 4,
    action:
      "[Attack 2 AP] [Pull a target within 3 Units into melee range before attack]",
  },

  // ---------- Drone Operation ----------
  "Spy Drone": {
    type: "Drone Operation",
    idealRange: "N/A",
    maxRange: "N/A",
    ammo: "0",
    damage: "None",
    arp: 0,
    action:
      "[Unarmed drone. Infrared vision; remote feed; flying. Destroyed upon receiving any injury.]",
  },
  "Defender Drone": {
    type: "Drone Operation",
    idealRange: "Varies (Trinity Burst Gun)",
    maxRange: "Varies (Trinity Burst Gun)",
    ammo: "4",
    damage: "Pierce",
    arp: 1,
    action: "[Equipped with Trinity Burst Gun. Flying. Destroyed upon any injury.]",
  },
  "Hunter Drone": {
    type: "Drone Operation",
    idealRange: "Varies (Predator Coil Gun)",
    maxRange: "Varies (Predator Coil Gun)",
    ammo: "1",
    damage: "Pierce",
    arp: 3,
    action: "[Equipped with Predator Coil Gun. Flying. Destroyed upon any injury.]",
  },
  "Assassin Drone": {
    type: "Drone Operation",
    idealRange: "Varies (Viper Darts)",
    maxRange: "Varies (Viper Darts)",
    ammo: "4",
    damage: "Pierce",
    arp: 1,
    action:
      "[Equipped with Viper Darts. Active camouflage. Flying. Destroyed upon any injury.]",
  },

  // ---------- Marksman ----------
  "Crossbow": {
    type: "Marksman",
    idealRange: "4–8 Units",
    maxRange: "10 Units",
    ammo: "1",
    damage: "Pierce",
    arp: 1,
    action:
      "[Attack 2 AP] [Silent] [Inflicts Impaled (1)] [Can be coated with poisons]",
  },
  "Hercules": {
    type: "Marksman",
    idealRange: "5+ Units",
    maxRange: "20 Units",
    ammo: "4",
    damage: "Pierce",
    arp: 5,
    action:
      "[Attack 2 AP] [Requires Bodybuilding 4+ to equip]",
  },
  "Predator Coil Gun": {
    type: "Marksman",
    idealRange: "5+ Units",
    maxRange: "20 Units",
    ammo: "1",
    damage: "Pierce",
    arp: 3,
    action: "[Attack 2 AP] [Silent]",
  },
  "Matthew’s Scoped Rifle": {
    type: "Marksman",
    idealRange: "5+ Units",
    maxRange: "20 Units",
    ammo: "3",
    damage: "Pierce",
    arp: 2,
    action: "[Attack 2 AP]",
  },
  "Evicirator": {
    type: "Marksman",
    idealRange: "5+ Units",
    maxRange: "20 Units",
    ammo: "6",
    damage: "Pierce",
    arp: 3,
    action: "[Attack 2 AP]",
  },
  "Aimbot Elite": {
    type: "Marksman",
    idealRange: "5+ Units",
    maxRange: "20 Units",
    ammo: "1",
    damage: "Pierce",
    arp: 3,
    action:
      "[Attack 2 AP] [Crits one lower than normal (4 instead of 5)]",
  },
  "Syracuse": {
    type: "Marksman",
    idealRange: "5+ Units",
    maxRange: "20 Units",
    ammo: "0",
    damage: "Burn",
    arp: 4,
    action:
      "[Attack 2 AP] [Cooling Cycle: Can only attack once per turn]",
  },

  // ---------- Piercing Melee ----------
  "Spear": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Pierce",
    arp: 1,
    action: "[Attack 2 AP] [Silent]",
  },
  "Trident": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Pierce",
    arp: 2,
    action: "[Attack 2 AP] [Silent]",
  },
  "Hydraulic Piercer": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Pierce, Crush",
    arp: 4,
    action: "[Attack 2 AP] [Silent]",
  },

  // ---------- Pistols ----------
  "Quad": {
    type: "Pistols",
    idealRange: "2–5 Units",
    maxRange: "10 Units",
    ammo: "4",
    damage: "Pierce",
    arp: 1,
    action: "[Attack 2 AP]",
  },
  "Safe Cracker": {
    type: "Pistols",
    idealRange: "2–5 Units",
    maxRange: "10 Units",
    ammo: "1",
    damage: "Pierce",
    arp: 4,
    action: "[Attack 2 AP]",
  },
  "Red Eye": {
    type: "Pistols",
    idealRange: "2–5 Units",
    maxRange: "10 Units",
    ammo: "0",
    damage: "Burn",
    arp: 2,
    action:
      "[Attack 2 AP] [Cooling Cycle: You may only attack once per turn]",
  },
  "-196 C": {
    type: "Pistols",
    idealRange: "2–5 Units",
    maxRange: "10 Units",
    ammo: "4",
    damage: "Freeze",
    arp: 2,
    action: "[Attack 2 AP]",
  },
  "Stinger": {
    type: "Pistols",
    idealRange: "2–5 Units",
    maxRange: "8 Units",
    ammo: "2",
    damage: "Electric",
    arp: 2,
    action: "[Attack 2 AP]",
  },

  // ---------- Propellants ----------
  "Boom Tube": {
    type: "Propellants",
    idealRange: "3–8 Units",
    maxRange: "12 Units",
    ammo: "1",
    damage: "Variable (Grenades)",
    arp: 0,
    action:
      "[Attack 2 AP] [Uses grenades as ammunition; Propellant DC required to hit]",
  },
  "Hook Shot": {
    type: "Propellants",
    idealRange: "3–10 Units",
    maxRange: "12 Units",
    ammo: "1",
    damage: "Pierce",
    arp: 3,
    action:
      "[Attack 2 AP] [Anchor 1 AP: creates secure line up to 230kg capacity]",
  },
  "Buzz Net": {
    type: "Propellants",
    idealRange: "2–4 Units",
    maxRange: "6 Units",
    ammo: "1",
    damage: "Electric",
    arp: 2,
    action:
      "[Attack 2 AP] [Bound (4) if target ≤ 1 Unit in size]",
  },
  "RPG": {
    type: "Propellants",
    idealRange: "3–10 Units",
    maxRange: "15 Units",
    ammo: "1",
    damage: "Crush",
    arp: 2,
    action:
      "[Attack 2 AP] [AOE 1: Hits all adjacent spaces to target]",
  },
  "Flamethrower": {
    type: "Propellants",
    idealRange: "1–4 Units",
    maxRange: "6 Units",
    ammo: "2",
    damage: "Burn",
    arp: 0,
    action:
      "[Attack 2 AP] [Hit provides Burning (2) condition]",
  },
  "Quarantine Snake": {
    type: "Propellants",
    idealRange: "3–5 Units",
    maxRange: "6 Units",
    ammo: "2",
    damage: "Corrosive",
    arp: 0,
    action:
      "[Attack 2 AP] [Hit applies Corroded (1)]",
  },
  "Particle Accelerator": {
    type: "Propellants",
    idealRange: "3–8 Units",
    maxRange: "12 Units",
    ammo: "2",
    damage: "Pierce",
    arp: 4,
    action:
      "[Attack 2 AP] [Hits targets in a line behind the main target (3 Units)]",
  },

  // ---------- Shotguns ----------
  "Pump Action Shotgun": {
    type: "Shotguns",
    idealRange: "1–4 Units",
    maxRange: "8 Units",
    ammo: "4",
    damage: "Pierce",
    arp: 1,
    action: "[Attack 2 AP]",
  },
  "Sawed off Shotgun": {
    type: "Shotguns",
    idealRange: "1–4 Units",
    maxRange: "6 Units",
    ammo: "2",
    damage: "Pierce",
    arp: 1,
    action:
      "[Attack 2 AP] [Gain +1 Die Level within 2 Units, −1 beyond 3 Units]",
  },
  "Slag Belcher": {
    type: "Shotguns",
    idealRange: "1–4 Units",
    maxRange: "8 Units",
    ammo: "4",
    damage: "Pierce, Burn",
    arp: 2,
    action: "[Attack 2 AP]",
  },

  // ---------- Shurikens ----------
  "Throwing Daggers": {
    type: "Shurikens",
    idealRange: "1–4 Units",
    maxRange: "5 Units",
    ammo: "4",
    damage: "Pierce",
    arp: 0,
    action: "[Attack 2 AP] [Silent]",
  },
  "Viper Darts": {
    type: "Shurikens",
    idealRange: "1–4 Units",
    maxRange: "5 Units",
    ammo: "4",
    damage: "Pierce",
    arp: 1,
    action:
      "[Attack 2 AP] [Injector: If coated with Poison, +2 to poison (X)]",
  },
  "Razor Discs": {
    type: "Shurikens",
    idealRange: "1–4 Units",
    maxRange: "5 Units",
    ammo: "4",
    damage: "Slash",
    arp: 1,
    action: "[Attack 2 AP] [Silent]",
  },
  "Plutonium Core Darts": {
    type: "Shurikens",
    idealRange: "1–4 Units",
    maxRange: "5 Units",
    ammo: "4",
    damage: "Pierce, Corrosive",
    arp: 2,
    action: "[Attack 2 AP] [Silent]",
  },
  "Heart Seekers": {
    type: "Shurikens",
    idealRange: "1–10 Units",
    maxRange: "10 Units",
    ammo: "2",
    damage: "Pierce",
    arp: 3,
    action:
      "[Attack 2 AP] [Silent] [Crits one lower than normal]",
  },
  "Runic Daggers": {
    type: "Shurikens",
    idealRange: "1–4 Units",
    maxRange: "4 Units",
    ammo: "0",
    damage: "Slash, Curse, Pierce",
    arp: 2,
    action:
      "[Attack 2 AP] [Silent] [Possessed: Make Sloth DC on miss; may act independently]",
  },

  // ---------- Slashing Melee ----------
  "Matchette": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Slash",
    arp: 1,
    action: "[Attack 2 AP] [Silent]",
  },
  "Cane Sword": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Slash",
    arp: 2,
    action:
      "[Attack 2 AP] [Concealed: Appears as walking cane] [Silent]",
  },
  "Plasma Cutter": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Burn",
    arp: 2,
    action: "[Attack 2 AP] [Silent]",
  },
  "Zephyr Blade": {
    type: "Melee Weapons",
    idealRange: "Adjacent",
    maxRange: "Adjacent",
    ammo: "0",
    damage: "Curse, Slash",
    arp: 5,
    action:
      "[Attack 2 AP] [Silent] [Possessed: Make Pride DC on miss; may act independently]",
  },
};


export const VEHICLE_STATS: Record<
  string,
  { type: string; capacity: number; size: string; speed: string }
> = {
  SUV: { type: "Ground", capacity: 4, size: "2x3", speed: "10 Units" },
  "Armored SUV": { type: "Ground", capacity: 6, size: "3x4", speed: "8 Units" },
  "Armored Limo": { type: "Ground", capacity: 5, size: "3x6", speed: "8 Units" },
  Icarus: { type: "Flying", capacity: 2, size: "2x3", speed: "14 Units" },
  "Babylon Taxi": { type: "Ground", capacity: 3, size: "2x3", speed: "10 Units" },
  "Chopper Bike": { type: "Ground", capacity: 1, size: "1x2", speed: "12 Units" },
};

// -----------------------------
// COMBINED EXPORT
// -----------------------------
export const ALL_ITEM_OPTIONS = {
  Accessories: ACCESSORY_OPTIONS,
  Armor: ARMOR_OPTIONS,
  Weapons: WEAPON_OPTIONS,
  Vehicles: VEHICLE_OPTIONS,
};

// -----------------------------
// TYPES
// -----------------------------
export type WeaponCategory = keyof typeof WEAPON_OPTIONS;
export type ArmorCategory = keyof typeof ARMOR_OPTIONS;
