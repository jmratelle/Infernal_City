export interface GeneralUnlockDef {
  name: string;
  desc: string;

  // requirements
  requiresSkillId?: string;
  requiresMinLevel?: number;

  requiresSkillLevels?: Record<string, number>;
  requiresAnySkillIds?: string[];
  requiresAnySkillLevel?: number;

  requiresAll?: string[];
  requiresAny?: string[];

  requiresAllAbilities?: string[];

  // exclusivity
  excludes?: string[];

  // grouping
  group?: string;
  oneOf?: string;

  // repeatability
  stackable?: boolean;
  stackMax?: number;

  // parameterized selections
  selectionType?: "skill" | "industry" | "corp" | "option";
  selectionOptions?: string[];

  // metadata
  category?: string;
  subcategory?: string;
  tags?: string[];

  auto?: boolean;
}

export const GENERAL_UNLOCK_DEFS: GeneralUnlockDef[] = [
  // ======================================================
  // GENERAL ABILITIES
  // ======================================================

  {
    name: 'Expertise',
    desc: `
You’ve dedicated your efforts into mastering a skill. Your careful practice means that you’re able to catch mistakes before they happen.

Choose a skill, you gain X specific re-rolls for the skill that you acquired expertise for, with X being equal to your skill level, at the start of every mission. These re-rolls do not stack between missions. You can select the Expertise ability multiple times for different skills.
    `,
    stackable: true,
    selectionType: 'skill',
  },

  {
    name: 'Base Competency',
    desc: `
You can make things work through sheer effort alone, even in tough situations with things that may not come naturally to you.

Die Level modifiers cannot force you to roll below Die Level one.
    `,
  },

  {
    name: 'Learn from Mistakes',
    desc: `
Failure is a harsh teacher, but you have learned much under her tutelage.

Each time you fail a Specialized Skill DC for a specific action, such as a Thievery DC for a specific door in a mission or performing a Medical DC to stabilize a teammate, the next time you attempt that same DC, you may add one Die Level to your DC. This effect does not stack. This effect ends once you succeed on that DC.
    `,
  },

  {
    name: 'Mentorship',
    desc: `
You have the natural talent of teaching and passing on your life lessons to others.

When an ally within three Units performs a Specialized Skill DC with a lower Skill level than your own, you may have them add one Die Level to that Specialized Skill DC.
    `,
  },

  // ======================================================
  // GENERAL COMBAT ABILITIES
  // ======================================================

  {
    name: 'Zone of Control',
    desc: `
You may make a zero AP Martial Arts or melee weapon attack against any target that leaves your melee attack range.
    `,
  },

  {
    name: 'Overwatch',
    desc: `
You may use this ability anytime a valid target would make a movement action. You may make a two AP attack against a valid target at any point of their interrupted movement, such as when they are no longer behind cover, with an equipped ranged weapon. After you make your attack, the target resumes their turn movement and turn.
    `,
  },

  {
    name: 'Ambush Predator',
    desc: `
Reduce the AP cost of attacks made with Overwatch ability by one.
    `,
    requiresAll: ['Overwatch'],
  },

  {
    name: 'Tactical Reload',
    desc: `
Reduce the AP cost of reloading by one to a minimum of one.
    `,
  },

  {
    name: 'Thrill of Combat',
    desc: `
Every attack made against you will grant you an additional AP on your following turn.
    `,
  },

  {
    name: 'Extended Accuracy',
    desc: `
Increase the maximum ideal range of ranged combat weapons by one Unit.
    `,
  },

  {
    name: 'Wall Hugger',
    desc: `
As long as you are adjacent to cover, you cannot be flanked unless attacked from directly behind.
    `,
  },

  {
    name: 'Reversal',
    desc: `
When an enemy makes a melee attack against you, if that attack misses, you may move that enemy one Unit away from you. This can trigger the Zone of Control ability.
    `,
  },

  {
    name: 'Pack Tactics',
    desc: `
Each time a friendly character attacks the same target that turn as another character with the Pack Tactics ability, you may increase the Die Level of the attack DC by one. This effect stacks with other Pack Tactics abilities.
    `,
    stackable: true,
  },

  {
    name: 'Hunter’s Zen',
    desc: `
You can spend 2 AP to steady yourself for the next round of combat. This is a Focus ability. If you move from your current position, this ability ends. For as long as you maintain focus on this ability, you gain advantage on each attack DC you make.
    `,
  },

  {
    name: 'One Shot One Kill',
    desc: `
If a target dies as a result of your attack, you gain two AP. This ability can only trigger once per round of combat.
    `,
  },

  {
    name: 'Matching Movements',
    desc: `
At the end of your turn, recover 1 AP to your action pool.
    `,
  },

  {
    name: 'Parry',
    desc: `
You may spend one AP any time you would be attacked by a melee attack to use your Martial Arts or Melee Weapons skill rather than your Reflex skill to make an attack against them. If you roll higher than the melee attack made against you, you avoid the attack, and your roll is treated as an attack against them. If you fail, it operates the same as having failed a Reflex DC. Armor penalties are still applied to both attacks.
    `,
  },

  {
    name: 'Ranged Parry',
    desc: `
You may use the parry ability on ranged attacks made against you. If the attacker is outside of your melee range, you do not get to inflict an injury or apply any other effect of your attack other than avoiding being hit.
    `,
    requiresAll: ['Parry'],
    requiresAnySkillIds: ['martialArts', 'meleeWeapons'],
    requiresMinLevel: 4,
  },

  {
    name: 'Precision',
    desc: `
Choose a combat skill at level four or higher. You now make critical attacks with attacks using that skill if the difference between the attacks is four or higher.
    `,
    selectionType: 'skill',
    requiresAnySkillLevel: 4,
  },

  {
    name: 'Qi Aura',
    desc: `
Increase the range of all melee attacks by one Unit.
    `,
    requiresAnySkillIds: ['martialArts', 'meleeWeapons'],
    requiresMinLevel: 5,
  },

  {
    name: 'Disarming Strike',
    desc: `
When you make a melee attack against a target that results in a hit, you may spend one additional AP to attempt to disarm your opponent. Make a contested Martial Arts DC against the target. If you succeed, that target’s equipped weapon falls to the ground on an adjacent space to that target. The target must spend one AP to re-equip that weapon.
    `,
    requiresAnySkillIds: ['martialArts', 'meleeWeapons'],
    requiresMinLevel: 4,
  },

  {
    name: 'Trickshot',
    desc: `
You may make a ranged attack against an enemy in cover by firing off of another surface within range in an attempt to make a flanking attack against the target.
    `,
    requiresAnySkillLevel: 4,
  },

  // ======================================================
  // AUTOMATICS ABILITIES
  // ======================================================

  {
    name: 'Penetrating Barrage',
    desc: `
If you attack the same target with multiple attacks with an automatic weapon during the same round, you may increase the ArP of the attack by one for each consecutive attack after the first.
    `,
    requiresSkillId: 'automatics',
    requiresMinLevel: 4,
  },

  {
    name: 'Spray and Pray',
    desc: `
For two AP you may make up to two attacks, spending one ammunition per attack, with an automatic weapon, but at a one Die Level penalty for each attack. These attacks can be against the same or multiple targets.
    `,
    requiresSkillId: 'automatics',
    requiresMinLevel: 4,
  },

  {
    name: 'Suppressing Fire',
    desc: `
Requires a ranged weapon. At the cost of two ammunition and one AP, you can select a target and force them to be suppressed. They get minus one Die Level to any action they perform while remaining in that spot. This is a focus ability.
    `,
  },

  {
    name: 'Infinite Ammo',
    desc: `
You may reload an automatic weapon for zero AP. Once you use this ability you cannot use it again until one round of combat has passed.
    `,
    requiresSkillId: 'automatics',
    requiresMinLevel: 5,
  },

  {
    name: 'Barrel Melter',
    desc: `
If you would make more than one attack with an automatic weapon during your turn, all attacks other than your first attack gain the Burn damage type.
    `,
    requiresSkillId: 'automatics',
    requiresMinLevel: 4,
  },
    // ======================================================
  // DRONE OPERATION ABILITIES
  // ======================================================

  {
    name: 'Split Mind',
    desc: `
You may control one additional drone. Each makes separate rolls and has separate AP.
    `,
    requiresSkillId: 'droneOperation',
    requiresMinLevel: 3,
  },

  {
    name: 'Kamikaze Directive',
    desc: `
If one of your drones would be destroyed, it may immediately move up to two Units and attempt a suicidal attack with its body. This attack uses the drone operation skill, deals Crush and Electric Damage, and has ArP one.
    `,
    requiresSkillId: 'droneOperation',
    requiresMinLevel: 4,
  },

  {
    name: 'Evasive Control',
    desc: `
Drones gain an additional Die Level on their Reflex DCs while you control them.
    `,
    requiresSkillId: 'droneOperation',
    requiresMinLevel: 4,
  },

  {
    name: 'Swarm Tactics',
    desc: `
You may control one additional drone beyond the amount granted by Split Mind. Each makes separate rolls and has separate AP.
    `,
    requiresAll: ['Split Mind'],
    requiresSkillId: 'droneOperation',
    requiresMinLevel: 5,
  },

  {
    name: 'Master of Efficiency',
    desc: `
Drones you control get an additional AP during their turns.
    `,
    requiresSkillId: 'droneOperation',
    requiresMinLevel: 5,
  },

  // ======================================================
  // MARKSMAN ABILITIES
  // ======================================================

  {
    name: 'Camping',
    desc: `
If you didn’t move last round of combat, you may reload an equipped Marksman weapon once for zero AP.
    `,
    requiresSkillId: 'marksman',
    requiresMinLevel: 3,
  },

  {
    name: 'Kill Shot',
    desc: `
You may spend two AP to raise the Die Level of your next Marksman attack this turn by one Die Level.
    `,
  },

  {
    name: 'Head Shot',
    desc: `
If you land a critical hit against a mortal humanoid enemy with a marksman weapon, and that attack would inflict an injury, the target dies instead.
    `,
    requiresSkillId: 'marksman',
    requiresMinLevel: 5,
  },

  {
    name: 'No Scope',
    desc: `
You may decrease the lower ideal range of equipped marksman weapons to two units.
    `,
    requiresSkillId: 'marksman',
    requiresMinLevel: 3,
  },

  // ======================================================
  // MARTIAL ARTS ABILITIES
  // ======================================================

  {
    name: 'Circular Breathing',
    desc: `
Reduce the AP cost of your Martial Arts attacks by one.
    `,
    requiresSkillId: 'martialArts',
    requiresMinLevel: 4,
  },

  {
    name: 'Choke Out',
    desc: `
Upon hitting a mortal humanoid target with a Martial Art attack you may spend one AP to make a contested Bodybuilding check with the target. If you succeed the target gains the unconscious condition.
    `,
    requiresSkillId: 'martialArts',
    requiresMinLevel: 3,
  },

  {
    name: 'Acupressure',
    desc: `
Anytime you hit with an attack using the Martial Arts skill, that target gains the Disorientated (2) condition.
    `,
    requiresSkillId: 'martialArts',
    requiresMinLevel: 5,
  },

  {
    name: 'Piercing Ki',
    desc: `
Your Martial Arts attacks gain ArP one. This ability may be chosen multiple times.
    `,
    requiresSkillId: 'martialArts',
    requiresMinLevel: 5,
    stackable: true,
  },

  // ======================================================
  // MELEE WEAPON ABILITIES
  // ======================================================

  {
    name: 'Tameshigiri',
    desc: `
Each time you inflict an injury with a melee weapon that has the Slash damage type, the target gains the Bleeding (2) condition.
    `,
    requiresSkillId: 'meleeWeapons',
    requiresMinLevel: 3,
  },

  {
    name: 'Crusher',
    desc: `
Equipped melee weapons that have the Crush damage gain ArP one.
    `,
    requiresSkillId: 'meleeWeapons',
    requiresMinLevel: 3,
  },

  {
    name: 'Fencer',
    desc: `
Equipped melee weapons that have the Pierce damage type can hit targets up to two units away.
    `,
    requiresSkillId: 'meleeWeapons',
    requiresMinLevel: 3,
  },

  {
    name: 'Phalanx',
    desc: `
The first time a target enters the range of your equipped melee weapon you may make a zero AP attack against them. If your attack would hit, that target must cease all movement available to it for the AP spent.
    `,
    requiresSkillId: 'meleeWeapons',
    requiresMinLevel: 4,
  },

  {
    name: 'Decapitation',
    desc: `
If you land a Critical hit against a mortal humanoid enemy with a melee weapon, and that attack would inflict an injury, the target dies instead.
    `,
    requiresSkillId: 'meleeWeapons',
    requiresMinLevel: 5,
  },

  // ======================================================
  // PISTOL ABILITIES
  // ======================================================

  {
    name: 'Two Hands are Better Than One',
    desc: `
You can dual-wield pistols. You may equip an additional pistol, and when making an attack with one pistol, you may attack with the other equipped pistol for one AP less than what the weapon’s normal attack requires.
    `,
    requiresSkillId: 'pistols',
    requiresMinLevel: 3,
  },

  {
    name: 'Quickdraw',
    desc: `
You may swap one pistol in your inventory with one of your equipped pistols for zero AP.
    `,
    requiresSkillId: 'pistols',
    requiresMinLevel: 3,
  },

  {
    name: 'Faster Than Lightning',
    desc: `
Once per combat round, you may make a zero AP attack with one of your equipped pistols.
    `,
    requiresSkillId: 'pistols',
    requiresMinLevel: 4,
  },

  {
    name: 'Russian Roulette',
    desc: `
Whenever you make an attack with a pistol you may choose to roll a D6. On a six your attack automatically scores a critical hit, on a one you automatically miss.
    `,
    requiresSkillId: 'pistols',
    requiresMinLevel: 5,
  },

  // ======================================================
  // PROPELLANT ABILITIES
  // ======================================================

  {
    name: 'Bringer of Pain',
    desc: `
If your equipped propellant weapon inflicts a condition, increase the X value of that condition by one.
    `,
    requiresSkillId: 'propellants',
    requiresMinLevel: 4,
  },

  {
    name: 'Double Barrel',
    desc: `
Increase the ammo of your equipped propellant weapon by one.
    `,
    requiresSkillId: 'propellants',
    requiresMinLevel: 4,
  },

  {
    name: 'Pressurized',
    desc: `
Increase the max Ideal range of your equipped propellant weapons by one.
    `,
    requiresSkillId: 'propellants',
    requiresMinLevel: 3,
  },

  {
    name: 'Tormentor',
    desc: `
If your equipped propellant weapon inflicts a condition, increase the X value of that condition by one.
    `,
    requiresAll: ['Bringer of Pain'],
    requiresSkillId: 'propellants',
    requiresMinLevel: 5,
  },

  // ======================================================
  // SHOTGUN ABILITIES
  // ======================================================

  {
    name: 'Point Blank',
    desc: `
Increase the Die Level of your attack DC by one when attacking a target with a shotgun within two Units.
    `,
    requiresSkillId: 'shotguns',
    requiresMinLevel: 3,
  },

  {
    name: 'Propelling Force',
    desc: `
If you hit a target with a shotgun weapon, you may move them two Units away from your character. If the target was moving, its movement for that AP ends.
    `,
    requiresSkillId: 'shotguns',
    requiresMinLevel: 4,
  },

  {
    name: 'Birdshot',
    desc: `
Increase the max Ideal range of equipped shotguns by two Units.
    `,
    requiresSkillId: 'shotguns',
    requiresMinLevel: 4,
    excludes: ['Slugs'],
    oneOf: 'shotgunAmmo',
  },

  {
    name: 'Slugs',
    desc: `
All attacks with Shotguns gain ArP one.
    `,
    requiresSkillId: 'shotguns',
    requiresMinLevel: 4,
    excludes: ['Birdshot'],
    oneOf: 'shotgunAmmo',
  },

  // ======================================================
  // SHURIKEN ABILITIES
  // ======================================================

  {
    name: 'Aim for the Gaps',
    desc: `
Attacks with Shurikens gain ArP two.
    `,
    requiresSkillId: 'shuriken',
    requiresMinLevel: 5,
  },

  {
    name: 'Dual Throwing',
    desc: `
You can throw shurikens from both hands, whenever you make an attack using the Shuriken skill, you may make another attack for one AP.
    `,
    requiresSkillId: 'shuriken',
    requiresMinLevel: 3,
  },

  {
    name: 'Skewered',
    desc: `
Shuriken weapon attacks that result in a hit give the Impaled (1) condition.
    `,
    requiresSkillId: 'shuriken',
    requiresMinLevel: 4,
  },

  {
    name: 'Bleed Them Dry',
    desc: `
If one of your attacks using the Shuriken skill would cause an injury against a target they also gain the Bleeding (2) Condition.
    `,
    requiresSkillId: 'shuriken',
    requiresMinLevel: 4,
  },

  //
// MAGIC + SIN ABILITIES
//

{
  name: "Spiritually Attuned",
  desc: "You gain one innate Armor Value against the Curse Damage Type.",
},

{
  name: "Invisible Ink",
  desc: "Your circles are nearly invisible to anyone passing by, and anyone trying to find your circles will require an Observation DC to spot them.",
  requiresSkillLevels: { arcane: 3 },
},

{
  name: "Arcane Protection",
  desc: "You may use the Arcane skill rather than the listed one when you are forced to make a Contested DC by another’s spell.",
  requiresSkillLevels: { arcane: 3 },
},

{
  name: "Overlapping Patterns",
  desc: "You may have two magic circles occupy the same space, allowing targets to have to deal with both circles upon activation.",
  requiresSkillLevels: { arcane: 5 },
},

{
  name: "Master of Magics",
  desc: "Targets making contested Arcane DCs caused by your circles or Arcane spells roll with disadvantage.",
  requiresSkillLevels: { arcane: 4 },
},

{
  name: "The Sight",
  desc: "You can always spot the aura of all enchanted or magically affected items within one Unit of you.",
  requiresSkillLevels: { arcane: 2 },
},

{
  name: "Summoning Circle",
  desc: "For two AP make an Arcane DC. If you succeed, create a magic circle on a flat and relatively unobstructed surface within one Unit. You can have as many circles as your Arcane skill level plus one. You may spend one AP to summon a non-living object weighing less than 240 kilos from a previously prepared location.",
},

{
  name: "Alarming Circle",
  desc: "For two AP make an Arcane DC. Create a magic circle that activates when something passes near it. The circle can create a loud noise, a five-word message, or a flash of colored light.",
},

{
  name: "Sealing Circle",
  desc: "For two AP make an Arcane DC. Create a magic circle on a door, chest, container, or portal. Anyone attempting to open it must make a contested Arcane DC or fail to open it.",
},

{
  name: "The Way is Shut",
  desc: "Your Sealing Circle now adds an armor level against all damage types to the protected object or portal.",
  requiresAll: ["Sealing Circle"],
},

{
  name: "Blasting Circle",
  desc: "For two AP make an Arcane DC. Create a magic circle that explodes when activated. Make an Arcane attack against all targets within AOE one. This attack deals Crush damage and has ArP 3.",
},

{
  name: "Teleportation Circle",
  desc: "For two AP make an Arcane DC. Create a teleportation circle. For four AP, you may send yourself or an ally to another prepared Teleportation Circle.",
  requiresSkillLevels: { arcane: 4 },
},

{
  name: "Illusion Circle",
  desc: "For two AP make an Arcane DC. Create a magic circle capable of projecting an illusion occupying the circle’s Unit.",
},

{
  name: "Transfiguration Circle",
  desc: "For two AP make an Arcane DC. Targets activating the circle must make a contested Arcane DC or gain the Transformed (X) condition.",
  requiresSkillLevels: { arcane: 3 },
},

{
  name: "Binding Circle",
  desc: "For two AP make an Arcane DC. Activate the circle to trap targets inside with the Bound (X) condition.",
},

{
  name: "Binding Ritual",
  desc: "You can attempt to seal a Demon trapped within a Binding Circle into an object.",
  requiresAll: ["Binding Circle"],
  requiresSkillLevels: { arcane: 5 },
},

{
  name: "Arcane Academia",
  desc: "You and the GM can create an NPC or group of NPCs who can assist you with Arcane knowledge and tasks.",
},

{
  name: "Scent of the Master",
  desc: "After identifying a spell or enchantment, you can create a tracking charm that points toward the creator for fifteen minutes.",
},

{
  name: "Tracker Enchantment",
  desc: "You can enchant an object and always know its general direction while maintaining focus.",
},

{
  name: "Barrier Enchantment",
  desc: "For two AP create an invisible barrier that counts as cover and has Armor Value 3.",
},

{
  name: "Fortress",
  desc: "You may attack through your own barrier enchantments without granting armor to your target.",
  requiresAll: ["Barrier Enchantment"],
},

{
  name: "Enchant Weapon",
  desc: "For one AP make an Arcane DC. If successful, your weapon’s next attack gains an additional chosen damage type.",
},

{
  name: "Airwalker Enchantment",
  desc: "For two AP create an invisible bridge or staircase extending up to five Units.",
},

{
  name: "Sunlight Enchantment",
  desc: "For one AP create a bright magical light. You may focus it into a blinding beam.",
},

{
  name: "Prophetic Dreams",
  desc: "Each night you dream of three helpful things likely encountered the following day.",
},

{
  name: "Stone Enchantment",
  desc: "For two AP increase the armor level of yourself or an ally against Crush, Slash, and Pierce damage by two.",
},

//
// ENVY
//

{
  name: "Envy Protection",
  desc: "You may use the Envy skill rather than the listed one when forced to make a Contested DC by another’s spell.",
  requiresSkillLevels: { envy: 4 },
},

{
  name: "Spite",
  desc: "Whenever a target would roll at a higher Die Level on a contested Envy DC, decrease their Die Level by one.",
  requiresSkillLevels: { envy: 4 },
},

{
  name: "Frustration",
  desc: "Any time you fail an Envy DC, gain advantage on your next Envy DC.",
  requiresSkillLevels: { envy: 3 },
},

{
  name: "Evil Eye",
  desc: "For two AP fix your gaze upon a target. While focused, the target suffers a negative Die Level penalty on all DCs.",
},

{
  name: "Jinx",
  desc: "Spend one AP to contest a target’s DC with your Envy skill. If you win, they automatically fail the DC.",
},

{
  name: "Bonded Destiny",
  desc: "For four AP link two targets together with the Bonded Destiny condition.",
},

{
  name: "Possession",
  desc: "For four AP possess an adjacent target and control their actions while focused.",
  requiresSkillLevels: { envy: 5 },
},

{
  name: "Violent Exorcism",
  desc: "Any time Possession ends, the possessed target gains the Disorientated (4) condition.",
  requiresAll: ["Possession"],
},

//
// GLUTTONY
//

{
  name: "Gluttony Protection",
  desc: "You may use the Gluttony skill rather than the listed one when forced to make a contested DC by another’s spell.",
  requiresSkillLevels: { gluttony: 3 },
},

{
  name: "Feast",
  desc: "Whenever you recover an injury or gain AP from a Gluttony spell, recover or gain one additional amount.",
  requiresSkillLevels: { gluttony: 3 },
},

{
  name: "Energy Drain",
  desc: "For two AP make a Gluttony attack within three Units. On injury, either heal one injury or steal one AP from the target.",
},

{
  name: "Devouring Beam",
  desc: "Enhance your Energy Drain spell with additional effects.",
  requiresAll: ["Energy Drain"],
  stackable: true,
  stackMax: 3,
  selectionType: "option",
  selectionOptions: [
    "Gain ArP 1",
    "Increase range to 10 Units",
    "Chain to additional targets",
  ],
},

{
  name: "Devouring Aura",
  desc: "Once per combat round, targets within three Units contest your Gluttony DC or lose AP which you gain.",
  requiresSkillLevels: { gluttony: 5 },
},

//
// GREED
//

{
  name: "Greed Protection",
  desc: "You may use the Greed skill rather than the listed one when forced to make a contested DC by another’s spell.",
  requiresSkillLevels: { greed: 3 },
},

{
  name: "Offering of Gold",
  desc: "Spend 100 Goldbacks worth of gold to increase the Die Level of a Greed DC by one.",
  requiresSkillLevels: { greed: 4 },
},

{
  name: "Master of Avarice",
  desc: "Targets making contested Greed DCs caused by your Greed spells roll with disadvantage.",
  requiresSkillLevels: { greed: 5 },
},

{
  name: "Possessive Power",
  desc: "All Greed spells except Magnetism and Soften Metal increase the size of their effects by one Unit.",
  requiresSkillLevels: { greed: 5 },
},

{
  name: "Soften Metal",
  desc: "For one AP soften metal into a liquid-like state while retaining its form.",
},

{
  name: "Phosphorus Cloud",
  desc: "For two AP create a 3x3x3 smoke cloud. Attacks through the smoke suffer a two Die Level penalty.",
},

{
  name: "Midas’ Touch",
  desc: "For four AP turn part of a target into gold, inflicting two injuries.",
},

{
  name: "Magnetism",
  desc: "For two AP magnetize metal objects and manipulate their movement.",
},

{
  name: "Every Man for Himself",
  desc: "For four AP force targets within a 3x3 area to contest your Greed DC or gain Madness (X).",
},

{
  name: "Anarchy",
  desc: "Targets failing Every Man for Himself gain an additional Madness (2).",
  requiresAll: ["Every Man for Himself"],
  requiresSkillLevels: { greed: 5 },
},
//
// LUST
//

{
  name: "Lust Protection",
  desc: "You may use the Lust skill rather than the listed one when you are forced to make a Contested DC by another’s spell.",
  requiresSkillLevels: { lust: 3 },
},

{
  name: "Master of Lechery",
  desc: "Targets making contested Lust DCs caused by your Lust spells roll with disadvantage.",
  requiresSkillLevels: { lust: 4 },
},

{
  name: "Hallucination",
  desc: "For one AP, force a target within 10 Units to make a contested Lust Spell Effect DC. If they fail, you create an illusion in their mind lasting three rounds or ten minutes.",
},

{
  name: "Mass Hallucination",
  desc: "Your Hallucination spell may now target up to five targets at once.",
  requiresAll: ["Hallucination"],
  requiresSkillLevels: { lust: 5 },
},

{
  name: "Enthral",
  desc: "Force a humanoid target within five Units to make a contested Lust Spell Effect DC or gain the Enthralled condition.",
},

{
  name: "Adoring Fans",
  desc: "You may maintain two Enthralled targets at once without breaking focus.",
  requiresAll: ["Enthral"],
  requiresSkillLevels: { lust: 5 },
},

//
// PRIDE
//

{
  name: "Pride Protection",
  desc: "You may use the Pride skill rather than the listed one when you are forced to make a Contested DC by another’s spell.",
  requiresSkillLevels: { pride: 3 },
},

{
  name: "Ego",
  desc: "Any time you fail a Pride DC you gain advantage on your next Pride DC.",
  requiresSkillLevels: { pride: 4 },
},

{
  name: "Better than You",
  desc: "If you fail a re-roll on a Pride spell, you may attempt one additional re-roll despite temptation limitations.",
  requiresSkillLevels: { pride: 5 },
},

{
  name: "Failure is Not an Option",
  desc: "Reduce the AP cost of all Pride spells by one AP, but failed Pride DCs always trigger temptation consequences.",
  requiresSkillLevels: { pride: 4 },
},

{
  name: "Self Improvement",
  desc: "For one AP, make a Pride DC to increase the Die Level of another DC by one.",
},

{
  name: "Irresistible Challenger",
  desc: "Force a hostile target within 10 Units to focus entirely on engaging you in combat until the end of their next turn.",
},

{
  name: "Invincibility",
  desc: "For two AP, enter a focused defensive state. Successful Pride DCs negate incoming injuries.",
  requiresSkillLevels: { pride: 4 },
},

//
// SLOTH
//

{
  name: "Sloth Protection",
  desc: "You may use the Sloth skill rather than the listed one when you are forced to make a Contested DC by another’s spell.",
  requiresSkillLevels: { sloth: 4 },
},

{
  name: "Time Lord",
  desc: "Whenever you successfully perform a Sloth DC for one of your spells, gain one AP.",
  requiresSkillLevels: { sloth: 5 },
},

{
  name: "Pull of the Void",
  desc: "Add four to cumulative DCs caused by your Sloth spells.",
  requiresSkillLevels: { sloth: 4 },
},

{
  name: "Slow",
  desc: "For two AP, trap a target within time dilation. The target must spend twice as many AP to perform actions while affected.",
},

{
  name: "Time Void",
  desc: "For two AP create a wall of stopped time that blocks attacks and traps creatures with the Bound (X) condition.",
},

{
  name: "Rewind",
  desc: "For four AP return to the location occupied at the beginning of your last turn and undo injuries, conditions, and spent ammo from that turn.",
  requiresSkillLevels: { sloth: 4 },
},

{
  name: "Master of Time and Space",
  desc: "When using Rewind, you may return to any visible location within 10 Units instead of your previous location.",
  requiresAll: ["Rewind"],
  requiresSkillLevels: { sloth: 5 },
},

//
// WRATH
//

{
  name: "Wrath Protection",
  desc: "You may use the Wrath skill rather than the listed one when you are forced to make a Contested DC by another’s spell.",
  requiresSkillLevels: { wrath: 3 },
},

{
  name: "Hellfire",
  desc: "Targets hit by your Wrath spells gain the Burning (1) condition.",
  requiresSkillLevels: { wrath: 3 },
},

{
  name: "Inferno",
  desc: "Targets hit by your Wrath spells gain an additional Burning (1) condition.",
  requiresAll: ["Hellfire"],
  requiresSkillLevels: { wrath: 5 },
},

{
  name: "Industrial Heat",
  desc: "Burning targets within five Units suffer reduced effectiveness from Burn armor against Burning condition DCs.",
  requiresSkillLevels: { wrath: 5 },
},

{
  name: "Fireball",
  desc: "For two AP unleash a fiery blast at a target within 10 Units. The attack deals Burn damage, has AOE one, and ArP one.",
},

{
  name: "Firenado",
  desc: "For four AP create a moving tornado of fire that attacks targets occupying its space.",
},

{
  name: "Feed the Flames",
  desc: "For two AP spread fire across adjacent spaces up to five Units away, inflicting Burning (1).",
},

{
  name: "Combust",
  desc: "For two AP force a target within 10 Units to make a contested Wrath DC or gain Burning (X).",
  requiresSkillLevels: { wrath: 4 },
},

//
// DEMONOLOGY
//

{
  name: "Hungering Hound Summon",
  desc: "For four AP summon a ravenous demonic hound into an adjacent space. The summon is maintained through focus.",
},

{
  name: "Pack Master",
  desc: "You may summon an additional Hungering Hound without disrupting focus.",
  requiresSkillLevels: { demonology: 4 },
},

{
  name: "Primal Fury",
  desc: "Increase your Hungering Hounds' Reflex, Martial Arts, Bodybuilding, and Demonology skills by one.",
  requiresAll: ["Hungering Hound Summon"],
  requiresSkillLevels: { demonology: 4 },
},

{
  name: "Hunting Hounds",
  desc: "All your summoned Hungering Hounds gain the Zone of Control ability.",
  requiresAll: ["Hungering Hound Summon"],
  requiresSkillLevels: { demonology: 3 },
},

{
  name: "Alpha’s Call",
  desc: "You may summon an additional Hungering Hound without disrupting focus.",
  requiresAll: ["Pack Master"],
  requiresSkillLevels: { demonology: 5 },
},

{
  name: "Demonic Protection",
  desc: "You may use the Demonology skill rather than the listed one when you are forced to make a Contested DC by another’s spell.",
  requiresSkillLevels: { demonology: 3 },
},

{
  name: "Soulless Eyes",
  desc: "You can identify the approximate power and Demonology skill level of a Demon by observing its eyes.",
},

{
  name: "Summoner’s Pact",
  desc: "If you know a Demon or Damned creature’s true name, you may call out to them across any distance.",
},

{
  name: "Infernal Chorus",
  desc: "Your Demonology spells affect all Demons and Damned within earshot.",
  requiresSkillLevels: { demonology: 5 },
},

{
  name: "Inquisitor’s Authority",
  desc: "For one AP force a Demon or Damned target to only speak the truth for one hour.",
},

{
  name: "Infernal Command",
  desc: "For two AP force a Demon or Damned target to immediately perform an action costing two AP or less.",
},

{
  name: "Feral Control",
  desc: "For two AP attempt to enthrall a feral creature through infernal speech.",
  requiresSkillLevels: { demonology: 3 },
},

{
  name: "Infernal Contact",
  desc: "You and the GM may create a Demon NPC contact willing to aid you in exchange for favors or contracts.",
},

{
  name: "Exorcism",
  desc: "For four AP force a Demon within five Units to make a contested Demonology DC or gain Frightened (6).",
},
//
// GENERAL / SKILL ABILITIES
//

{
  name: "Explosive Leaping",
  desc: "Double your free jumping distance.",
  requiresSkillLevels: { parkour: 4 },
},

{
  name: "Emergency Resuscitation",
  desc: "You may attempt to revive one dead target by making a Medical DC within one round of their death.",
  requiresSkillLevels: { medical: 3 },
},

{
  name: "Industry Contact",
  desc: "Choose a Hellcorp or industry. You and the GM create an NPC contact able to provide information, aid, or services.",
  requiresSkillLevels: { negotiation: 3 },
  stackable: true,
  selectionType: "industry",
},

{
  name: "Underworld Contact",
  desc: "You and the GM create an NPC or group specializing in violence, smuggling, or intimidation who can provide criminal services.",
},

{
  name: "The Don’s Favor",
  desc: "You may request a major favor from a powerful crime lord, though you will owe an equally important favor in return.",
  requiresAll: ["Underworld Contact"],
  requiresSkillLevels: { negotiation: 4 },
},

{
  name: "Good First Impression",
  desc: "If you succeed on your first Persuasion DC against an NPC, gain one Die Level on future Persuasion DCs involving them.",
  requiresSkillLevels: { negotiation: 3 },
},

{
  name: "Wall Run",
  desc: "You can freely move one Unit across a flat vertical surface during movement.",
  requiresSkillLevels: { parkour: 4 },
},

{
  name: "Defensive Stance",
  desc: "Spend two AP to gain advantage on Reflex DCs until the start of your next turn.",
  requiresSkillLevels: { reflex: 3 },
},

{
  name: "Tell",
  desc: "After successfully determining an NPC’s honesty with Bluff, gain one Die Level on future Bluff DCs involving them.",
  requiresSkillLevels: { bluff: 3 },
},

{
  name: "Play it Off",
  desc: "If you fail a Bluff DC, you may immediately attempt another Bluff DC to downplay the lie.",
  requiresSkillLevels: { bluff: 3 },
},

{
  name: "Polygraph Cheater",
  desc: "You may use Bluff to lie even against truth serums, mind reading, polygraphs, or mind control.",
  requiresSkillLevels: { bluff: 5 },
},

{
  name: "Mimicry",
  desc: "You can accurately mimic voices and speech patterns you have heard before.",
  requiresSkillLevels: { bluff: 4 },
},

{
  name: "Strong Legs",
  desc: "Reduce injuries received from falling by half rounded down.",
  requiresSkillLevels: { bodybuilding: 3 },
},

{
  name: "Good Arm",
  desc: "Increase the max and ideal range of shurikens and grenades by one Unit.",
  requiresSkillLevels: { bodybuilding: 3 },
},

{
  name: "Brick House",
  desc: "Ignore Die Level penalties to Reflex DCs caused by equipment.",
  requiresSkillLevels: { bodybuilding: 4 },
},

{
  name: "Juggernaut",
  desc: "Move through enemy characters by winning contested Bodybuilding DCs and inflict Disorientated (2).",
  requiresSkillLevels: { bodybuilding: 5 },
},

{
  name: "Drug Lord",
  desc: "You may make twice as many drugs during the Infernal Living phase.",
  requiresSkillLevels: { chemistry: 3 },
},

{
  name: "Potency",
  desc: "You may make twice as many poisons during the Infernal Living phase.",
  requiresSkillLevels: { chemistry: 3 },
},

{
  name: "Reactive Materials",
  desc: "Poisons and drugs you create may become airborne gas weapons filling a 3x3 area.",
  requiresSkillLevels: { chemistry: 4 },
},

{
  name: "Toxicologist",
  desc: "Make an additional Chemistry DC when crafting poisons to add enhanced poison effects.",
  requiresSkillLevels: { chemistry: 5 },
},

{
  name: "Grease Monkey",
  desc: "You may repair vehicles at reduced cost while having access to a garage.",
  requiresSkillLevels: { engineering: 3 },
},

{
  name: "Saboture",
  desc: "Craft grenades and consumable explosives for half their sell value.",
  requiresSkillLevels: { engineering: 3 },
},

{
  name: "Armor Smith",
  desc: "Craft armor for half its sell value.",
  requiresSkillLevels: { engineering: 4 },
},

{
  name: "Weapon Smith",
  desc: "Craft weapons for half their sell value.",
  requiresSkillLevels: { engineering: 5 },
},

{
  name: "Masterpiece",
  desc: "Craft one unique S-rank item approved by the GM. Only one may ever exist.",
  requiresSkillLevels: { engineering: 5 },
},

{
  name: "Sober",
  desc: "Gain advantage on the first two Addiction Fortitude DCs during a mission.",
  requiresSkillLevels: { fortitude: 3 },
},

{
  name: "Steadfast",
  desc: "While Frightened, you only spend two AP to move away from the source.",
  requiresSkillLevels: { fortitude: 4 },
},

{
  name: "Unshakable",
  desc: "Disorientated only causes you to lose two AP instead of three.",
  requiresSkillLevels: { fortitude: 4 },
},

{
  name: "Unflinching",
  desc: "When hit while focusing, roll a Fortitude DC to maintain focus.",
  requiresSkillLevels: { fortitude: 5 },
},

{
  name: "User Error",
  desc: "The first failed Hacking DC against a secured device does not trigger its countermeasures.",
  requiresSkillLevels: { hacking: 3 },
},

{
  name: "Malfunction",
  desc: "Failed hacks may cause beneficial malfunctions on a roll of four plus on a D6.",
  requiresSkillLevels: { hacking: 4 },
},

{
  name: "Duel Programs",
  desc: "Hack two sources at once for the same AP cost.",
  requiresSkillLevels: { hacking: 4 },
},

{
  name: "Virus",
  desc: "Successful hacks may spread to similar devices on the same network.",
  requiresSkillLevels: { hacking: 5 },
},

{
  name: "Must Have Been the Wind",
  desc: "If you fail a Hide DC, retry it immediately at one lower Die Level.",
  requiresSkillLevels: { hide: 3 },
},

{
  name: "One of the Crowd",
  desc: "Gain one Die Level when hiding among crowds or foot traffic.",
  requiresSkillLevels: { hide: 3 },
},

{
  name: "Assassin Strike",
  desc: "Gain one Die Level when attacking a target while hidden from them.",
  requiresSkillLevels: { hide: 4 },
},

{
  name: "Phantom",
  desc: "Successful Hide DCs also conceal you from infrared vision and scent detection.",
  requiresSkillLevels: { hide: 5 },
},

{
  name: "Self Care",
  desc: "Heal your own injuries and crippled conditions between missions if you have access to a clinic.",
  requiresSkillLevels: { medical: 4 },
},

{
  name: "Anti-Venom",
  desc: "Use Medical DCs to reduce the X value of Poisoned conditions.",
  requiresSkillLevels: { medical: 3 },
},

{
  name: "Valkyrie",
  desc: "Attempt a four AP Medical DC to reduce an ally’s injury state down to three.",
  requiresSkillLevels: { medical: 5 },
},

{
  name: "Phycologist",
  desc: "Use Medical DCs to reduce the X value of Frightened and Disorientated conditions.",
  requiresSkillLevels: { medical: 4 },
},

{
  name: "One of the Pack",
  desc: "Gain one Die Level on Persuasion DCs against members of your own race.",
  requiresSkillLevels: { negotiation: 3 },
},

{
  name: "Instigator",
  desc: "Gain one Die Level on Persuasion DCs encouraging violence or conflict.",
  requiresSkillLevels: { negotiation: 4 },
},

{
  name: "Negotiator",
  desc: "Retry failed Negotiation DCs immediately at one lower Die Level.",
  requiresSkillLevels: { negotiation: 4 },
},

{
  name: "Money Talks",
  desc: "You always know the minimum amount required to bribe an NPC.",
  requiresSkillLevels: { negotiation: 5 },
},

{
  name: "Focused Senses",
  desc: "You can isolate conversations within ten Units despite loud environments.",
  requiresSkillLevels: { observation: 3 },
},

{
  name: "Camera Shy",
  desc: "You always notice visible cameras and sense hidden cameras nearby.",
  requiresSkillLevels: { observation: 3 },
},

{
  name: "Blindsight",
  desc: "You perceive the world through all senses, even in darkness or obscured vision.",
  requiresSkillLevels: { observation: 5 },
},

{
  name: "Paranoia",
  desc: "You always know when you are being watched.",
  requiresSkillLevels: { observation: 5 },
},
{
  name: "Rolling Fall",
  desc: "You don’t take any injury for falls of five Units or less.",
  requiresSkillLevels: { parkour: 3 },
},

{
  name: "Stamina Reserve",
  desc: "At the start of each mission you gain two bonus AP that may be used any time during that mission.",
  requiresSkillLevels: { parkour: 3 },
},

{
  name: "Sure Footed",
  desc: "Your movement cannot be slowed by terrain hazards.",
  requiresSkillLevels: { parkour: 4 },
},

{
  name: "Sprinter",
  desc: "You may move one additional Unit per AP spent on movement.",
  requiresSkillLevels: { parkour: 5 },
},

{
  name: "Push it to the Limit",
  desc: "Increase the maximum speed of your vehicle by five Units.",
  requiresSkillLevels: { pilot: 3 },
},

{
  name: "Life in Reverse",
  desc: "You can travel backwards in vehicles with the same speed and control as forward movement.",
  requiresSkillLevels: { pilot: 4 },
},

{
  name: "Ace",
  desc: "Gain one Die Level when using Piloting to attack other vehicles.",
  requiresSkillLevels: { pilot: 5 },
},

{
  name: "Smooth Ride",
  desc: "Passengers in your vehicle do not suffer Die Level penalties for shooting from moving vehicles.",
  requiresSkillLevels: { pilot: 4 },
},

{
  name: "Duck for Cover",
  desc: "For one AP, immediately move two Units when targeted by an AOE attack or ability.",
  requiresSkillLevels: { reflex: 4 },
},

{
  name: "Nimble Feet",
  desc: "If you evade an attack with a Reflex DC, immediately move one Unit.",
  requiresSkillLevels: { reflex: 3 },
},

{
  name: "Battlefield Dancer",
  desc: "Additional movement granted by abilities does not trigger Zone of Control or Overwatch.",
  requiresSkillLevels: { reflex: 4 },
},

{
  name: "Always Ready",
  desc: "In Enemy Initiative encounters, you may act as though it were Mixed Initiative.",
  requiresSkillLevels: { reflex: 5 },
},

{
  name: "Tough Skinned",
  desc: "Gain one innate Armor Value against Slash, Pierce, and Crush damage.",
  requiresSkillLevels: { survivability: 4 },
},

{
  name: "Naturally Resilient",
  desc: "Gain one innate Armor Value against Electric, Burn, and Freeze damage.",
  requiresSkillLevels: { survivability: 4 },
},

{
  name: "Natural Immunity",
  desc: "Roll at one higher Die Level for Survivability DCs against Poisoned conditions.",
  requiresSkillLevels: { survivability: 3 },
},

{
  name: "Immortal",
  desc: "Once per mission, immediately re-roll the first failed Critical Condition DC.",
  requiresSkillLevels: { survivability: 5 },
},

{
  name: "Locksmith",
  desc: "After successfully opening a lock, automatically succeed on other locks using the same key.",
  requiresSkillLevels: { thievery: 3 },
},

{
  name: "Slight of Hand",
  desc: "Steal two items instead of one with successful Thievery DCs.",
  requiresSkillLevels: { thievery: 4 },
},

{
  name: "Confiscation",
  desc: "Attempt to steal weapons from non-hostile targets with a negative Die Level penalty.",
  requiresSkillLevels: { thievery: 5 },
},

{
  name: "Jewelry Thief",
  desc: "Attempt to steal equipped accessories from targets.",
  requiresSkillLevels: { thievery: 4 },
}
];