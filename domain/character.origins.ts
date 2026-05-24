export type OriginRewardChoice =
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

export type OriginVehicle = {
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

export type OriginHousing = {
  name: string;

  upgrades?: string[];
};

export type OriginDef = {
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

export const ORIGIN_DEFS: OriginDef[] = [
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

