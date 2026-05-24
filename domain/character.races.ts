import type { Character, RaceAbilityDef, RaceName } from './character.types';

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

export const RACE_STARTING_SURVIVABILITY: Record<RaceName, number> = {
  Abomination: 2,
  Altered: 2,
  Ascended: 1,
  Demonkin: 2,
  Draconem: 2,
  Fireborne: 2,
  Liches: 3,
  'Maggot Lords': 2,
  Outsiders: 2,
  'Rat Kings': 2,
  'Succubus/Incubus': 2,
};

export function applyRaceStartingSurvivability(
  character: Character,
  race: RaceName | undefined
): Character {
  if (!race) return character;

  return {
    ...character,
    attributes: {
      ...character.attributes,
      survivability: RACE_STARTING_SURVIVABILITY[race],
    },
  };
}

export const RACE_ABILITIES: Record<RaceName, RaceAbilityDef[]> = {
  Abomination: [
    { name: 'Mutant Madness', desc: `While in combat, at the end of each turn gain Madness (X) where X = 1 + your number of mutations. (Madness {{MUTANT_MADNESS_X}}/turn)`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },
    { name: 'Emerging Mutation', desc: `You may select another mutation ability from the Abomination’s starting abilities. This ability may be selected more than once to choose an additional mutation. Each new mutation adds to your Mutant Madness.\nRequirement: Abomination race.`, stackable: true },

    { name: 'MUTATION: Additional Arms', desc: 'MUTATION: You may have one additional weapon equipped at a time.', group: 'mutation' },
    { name: 'MUTATION: Additional Legs', desc: 'MUTATION: You may move an additional Unit when spending AP on Movement.', group: 'mutation' },
    { name: 'MUTATION: Compound Eyes', desc: 'MUTATION: You can see 360° around you at all times. You gain one Die Level on Observation DCs.', group: 'mutation' },
    { name: 'MUTATION: Chromatophores', desc: 'MUTATION: You can change the color of your skin at will, allowing you to blend into the background of your environment to help with Hide DCs, or flash colorful patterns across your skin to intimidate enemies, or send visual messages. You gain one Die Level on Hide DCs.', group: 'mutation' },
    { name: 'MUTATION: Flesh-Rending Claws', desc: 'MUTATION: Martial arts attacks gain the slash damage-type and ArP one.', group: 'mutation' },
    { name: 'MUTATION: Toxic Skin', desc: 'MUTATION: Anyone who hits you with a melee attack, regardless of armor saves, gains the Poisoned (4) condition.', group: 'mutation' },
    { name: 'MUTATION: Regeneration', desc: 'MUTATION: If you gain the Critical condition, you automatically recover from the condition after your second Critical Condition DC.', group: 'mutation' },
    { name: 'MUTATION: Heat Vision', desc: 'MUTATION: You can sense infrared heat, allowing you to see warm-blooded creatures and heat signatures in the dark and obscuring conditions such as smoke. This allows you to ignore any negative modifiers from such conditions. ', group: 'mutation' },
    { name: 'MUTATION: Quills', desc: 'MUTATION: Anytime an attack is made against you from an adjacent space, if that attack misses or is blocked by an Armor Save, you create an automatic ArP one piercing hit against them that deals one injury.', group: 'mutation' },
    { name: 'MUTATION: Exoskeleton', desc: 'MUTATION: You gain one innate Armor Value against all damage types except Curse.', group: 'mutation' },

    { name: 'Anger Management', desc: `Reduce the X received each turn as part of your Mutant Madness ability by one.\nRequirement: Abomination race.` },
    { name: 'Genetic Assimilation', desc: `If you can touch the blood of another target, including one who has died, you may take one of their abilities and add it to your own. This ability can be used for up to one day, then the ability is removed. Only one ability can be chosen at a time. If another ability is chosen, the prior ability is removed.\nRequirement: Abomination race.` },
    { name: 'Advanced Mutations', desc: `You may enhance your prior mutations. This ability may be selected multiple times, but you cannot choose the same enhancement twice, unless otherwise noted.\nRequirement: Abomination race.` },

    { name: 'Enhanced Additional Arms', desc: `You have two additional arms, and once per round can perform one of the following actions without spending any AP:\n• A Martial Arts or weapon attack\n• A reload action\n• Use a consumable\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Additional Arms'], stackable: true },
    { name: 'Enhanced Additional Legs', desc: `You may move an additional Unit per AP spent on movement.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Additional Legs'], stackable: true },
    { name: 'Enhanced Compound Eyes', desc: `You gain advantage on contested DCs using your Observation skill.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Compound Eyes'], stackable: true },
    { name: 'Enhanced Chromatophores', desc: `Your ability to change the color of your skin now includes bioluminescence. You can make any part of your body or skin pattern glow in different colors; you can also make your eyes glow to imitate a Demon or Demonkin’s appearance.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Chromatophores'], stackable: true },
    { name: 'Enhanced Flesh Rending Claws', desc: `Increase the ArP of your Martial Arts attacks by one. This ability may be selected more than once.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Flesh-Rending Claws'], stackable: true },
    { name: 'Enhanced Toxic Skin', desc: `Increase the X value of the Poisoned condition your Toxic Skin inflicts by two. This ability may be selected more than once.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Toxic Skin'], stackable: true },
    { name: 'Enhanced Regeneration', desc: `You remove the Critical condition automatically after your first Critical Condition DC.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Regeneration'], stackable: true },
    { name: 'Enhanced Heat Vision', desc: `You can see the heat signatures of the footprints or handprints of warm-blooded beings for up to two minutes after they were made.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Heat Vision'], stackable: true },
    { name: 'Enhanced Quills', desc: `Your Quills explode out with explosive force. The Quills ability now works on any targets up to three Units away.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Quills'], stackable: true },
    { name: 'Enhanced Exoskeleton', desc: `You gain an additional innate Armor Value against all damage types except Curse.\nRequirement: Abomination race.`, requiresAll: ['Advanced Mutations', 'MUTATION: Exoskeleton'], stackable: true },
  ],

  Altered: [
    { name: 'Unique Physiology', desc: `All medical costs are doubled.`, auto: true },
    { name: 'Electrokinesis', desc: 'When using martial arts or an attack with a conductive melee weapon, you may add the electric damage type. You may short circuit any electronics you can touch, causing them to malfunction. You also gain three innate Armor Value vs the Electric damage-type. This armor value cannot be reduced by ArP or any means that would reduce Armor Values.', oneOf: 'altered-core' },
    { name: 'Perfect Reflexes', desc: 'You gain one Die Level whenever you make a reflex DC.', oneOf: 'altered-core' },
    { name: 'ESP', desc: 'You gain the ability to read the thoughts of other mortals as long as you are within one Unit of them. Surface level thoughts and the target’s current preoccupations are immediately apparent to you. Gathering knowledge on a specific topic not at the forefront of the target’s thoughts may require you to spend some time near them in order to bring the knowledge you seek to the forefront of their thoughts through conversation or suggestion.', oneOf: 'altered-core' },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Perfect Conduit', desc: `Increase your innate Electric Armor Value to six.\nRequirement: Requires Electrokinesis ability; Altered race.`, requiresAll: ['Electrokinesis'] },
    { name: 'Arcing Lightning', desc: `You may add the Electric damage type to all attacks made with ranged weapons.\nRequirement: Requires Electrokinesis ability; Altered race.`, requiresAll: ['Electrokinesis'] },
    { name: 'Speed of Thought', desc: `You may spend one AP’s worth of actions for free before an enemy group would take their first turn each combat round.\nRequirement: Requires Perfect Reflexes ability; Altered race.`, requiresAll: ['Perfect Reflexes'] },
    { name: 'I am Speed', desc: `Regardless of initiative you may choose to take the first turn during a new battle round.\nRequirement: Requires Perfect Reflexes ability; Altered race.`, requiresAll: ['Perfect Reflexes'] },
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
    { name: 'Blood Blade', desc: `For one blood point and 2 AP, form a scythe of blood that attacks all adjacent targets using Slashing Melee skill. Slash damage, ArP 2.\nRequirement: Demonkin race.` },
    { name: 'Crimson Cloud', desc: `For two blood points and two AP, create an obscuring red cloud (5×5 Units) centered on you. Attacks through/within the cloud suffer −2 Die Levels unless the attacker can sense through the mist.\nRequirement: Demonkin race.` },

    { name: 'Bloodthirsty', desc: `Increase your blood point pool to seven.\nRequirement: Demonkin race.` },
    { name: 'Blood Lord', desc: `Increase your blood point pool to ten.\nRequirement: Requires Bloodthirsty; Demonkin race.`, requiresAll: ['Bloodthirsty'] },

    { name: 'Red Iron', desc: `Add +1 ArP to all attacks that use blood points. May be taken multiple times.\nRequirement: Demonkin race.` },
    { name: 'Demonic Blood', desc: `Add the Curse damage type to all attacks that use blood points.\nRequirement: Demonkin race.` },

    { name: 'Blood Tendril', desc: `For one blood point and one AP, extend a tendril to pull a target within three Units into an adjacent space. If unwilling, make a contested Bodybuilding DC; on a win, pull the target.\nRequirement: Demonkin race.` },
    { name: 'Extra Tendrils', desc: `May be selected up to four times. Increase the number of tendrils (and therefore targets) of Blood Tendril by one.\nRequirement: Requires Blood Tendril; Demonkin race.`, requiresAll: ['Blood Tendril'] },
  ],

  Draconem: [
    { name: 'Dragon Hoard', desc: `+1 innate AV vs all damage at ≥500 Goldbacks; +2 at ≥5,000; +3 at ≥15,000. Must sleep on hoard within last 24h to gain bonus. Goldbacks must be set aside and are not spendable without reducing bonus.`, auto: true },
    { name: 'Gold Addiction', desc: `You can sense the presence of gold. When you gain gold/Goldbacks, make one Addiction DC (Fortitude): 4+ no effect; 1–3: gain Addiction Tremors.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Enhanced Hoard', desc: `Your Dragon Hoard can grant 4 innate Armor Value if you have ≥ 50,000 Goldbacks, and 5 if ≥ 100,000.\nRequirement: Draconem race.`, requiresAll: ['Dragon Hoard'] },
    { name: 'Golden Aura', desc: `You may increase the Die Level of a DC by reducing all innate Armor Values granted by your dragon hoard by one.\nRequirement: Draconem race.`, requiresAll: ['Dragon Hoard'] },
    { name: 'Miserly Intuition', desc: `Reduce monthly costs of food and housing by 25% (rounded down).\nRequirement: Draconem race.` },
    { name: 'Dragon Breath', desc: `Once per day (2 AP), exhale molten metal in a straight line five Units long. The attack’s Die Level and ArP equal your hoard’s innate Armor Value bonus. Burning damage.\nRequirement: Draconem race.`, requiresAll: ['Dragon Hoard'] },
  ],

  Fireborne: [
    { name: 'Fireproof', desc: `+4 innate Burn Armor Value.`, auto: true },
    { name: 'Burning Strikes', desc: `Your Martial Arts and Melee attacks gain Burn. On hit (regardless of saves), you may inflict Burning (X) up to your innate Burn AV. If you do, you also gain Burning with the same X.`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Heat Training', desc: `Gain +2 innate Armor Value versus the Burn damage type.\nRequirement: Fireborne race.` },
    { name: 'Overheat', desc: `Expend all innate Burn Armor Values to attack all adjacent targets, inflicting Burning (X) where X equals AV expended. AV restores between missions.\nRequirement: Fireborne race.`, requiresAll: ['Fireproof'] },
    { name: 'Heat Transfer', desc: `Add the Burn damage type to attacks with ranged weapons.\nRequirement: Fireborne race.` },
    { name: 'Smokescreen', desc: `While under the Burning condition, all attacks against you suffer a −1 Die Level penalty.\nRequirement: Fireborne race.` },
  ],

  Liches: [
    { name: 'Hollow', desc: `You do not need to breathe or consume food; cannot gain diet bonuses; no food budgeting required.`, auto: true },
    { name: 'Fleshy Prison', desc: `+1 Die Level to all Survivability DCs, including Critical Condition DCs.`, auto: true },
    { name: 'High Survivability', desc: `Your Survivability skill starts at Level 3.`, auto: true },

    { name: 'Being of Decay', desc: `You are immune to the Poisoned and Poisoned (Deadly) conditions.\nRequirement: Lich race.` },
    { name: 'Rigor Mortis', desc: `Anytime you would receive a condition other than Crippled or Critical, you may instead choose to take one injury.\nRequirement: Lich race.` },
    { name: 'Defibrillator', desc: `If hit by Electric damage (even if no damage is dealt), gain +1 bonus AP for your next turn. Stacks.\nRequirement: Lich race.` },
    { name: 'Unfazed by Pain', desc: `Ignore negative Die Level modifiers from your first Crippled condition.\nRequirement: Lich race.` },
  ],

  'Maggot Lords': [
    { name: 'Mouths to Feed', desc: `Your food costs are doubled.`, auto: true },
    { name: 'Cannibal Carnage', desc: `(4 AP) Devour a dead/incapacitated target: recover up to 3 injuries; observers must make Gluttony DC or gain Frightened (4). 1/day.`, auto: true },
    { name: 'Giant’s Strength', desc: `+1 Die Level to all Bodybuilding DCs.`, auto: true },
    { name: 'Large Form', desc: `Takes 2 capacity in vehicles; when forced to move, move half Units (rounded down).`, auto: true },
    { name: 'Moderate Survivability', desc: `Your Survivability skill starts at Level 2.`, auto: true },

    { name: 'Rot Eaters', desc: `You can eat anything without ill effects and cannot be poisoned by anything you devour.\nRequirement: Maggot Lord race.` },
    { name: 'Maggot Retaliation', desc: `When attacked from an adjacent space, the maggots inside you make a free retaliatory attack: Die Level 2, Slash damage, ArP 1. May be taken up to three times; each time increases ArP by 1 and Die Level by 1.\nRequirement: Maggot Lord race.` },
    { name: 'Immovable Object', desc: `You are immune to abilities that force you to move.\nRequirement: Maggot Lord race.` },
    { name: 'Corrosive Bile', desc: `Three times per day, make a Bodybuilding attack (range 5 Units). On a hit it applies Corroded (5). Deals no damage.\nRequirement: Maggot Lord race.` },
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
    { name: 'Draining Touch', desc: `You may apply the effects of Lamprey’s Kiss to any physical touch, including Martial Arts attacks.\nRequirement: Succubus/Incubus race.`, requiresAll: ['Lamprey’s Kiss'] },
    { name: 'Addictive Saliva', desc: `Your saliva becomes addictive. Targets of Lamprey’s Kiss contact your saliva. You may spend 1 AP to coat a Shuriken or Melee weapon with your saliva for an attack this turn. Targets make an Addiction (Fortitude) DC:\n• 4+: No effect (successful DC)\n• 1–3: Craves—gain Addiction Tremors condition\nRequirement: Succubus/Incubus race.`, requiresAll: ['Lamprey’s Kiss'] },
  ],
};
