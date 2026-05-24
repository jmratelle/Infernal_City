import type { ConditionName } from './character.types';

export const CONDITION_TEXT: Record<ConditionName, (x?: number) => string> = {
  'Addiction Tremors': () =>
    'Reduce the Die Level of all DCs by one until you take another hit of the addictive substance that gave you this condition or one day has passed.',

  Bleeding: (x = 1) =>
    `While under this condition, the target receives one injury at the end of their turn. A Cumulative Medical Skill DC can be made to reduce this condition by ${x}. When ${x} is equal to or less than zero, remove this condition.`,

  'Bonded Destiny': () =>
    'Both targets under the effect of this condition share any future injuries and conditions they receive. At the end of each of their turns, any affected target may attempt a Contested Envy DC with the caster to end this condition.',

  Bound: () =>
    'While under this condition, the target remains magically or physically trapped within the source that gave them this condition. At the beginning of each of their turns, the target may make a cumulative DC, with the skill determined by the ability or source that inflicted the condition, to attempt to escape. If they fail, they remain trapped and cannot move or perform any actions.',

  Burning: (x = 1) =>
    `While under this condition, at the beginning of the target's turn they must make a Burn Armor DC. If they fail or cannot make a Burn Armor DC, they take one injury. The target or another PC or NPC may spend two AP to reduce this condition’s X value by one by batting out the flames. This condition’s X value is also reduced by one at the end of the target’s turn. If ${x} is equal to zero, remove this condition.`,

  Crippled: (x = 1) =>
    `While under this condition, the target receives a negative ${x} Die Level modifier to all DCs they make. If the target’s Crippled condition is four or greater, they gain the Unconscious condition at the start of each turn until they remove this condition. This condition can only be removed at a clinic or hospital.`,

  Corroded: (x = 1) =>
    `While under this condition, all attacks against this target gain ArP equal to ${x}. This condition can be removed by an Engineering DC. This condition is also removed between missions.`,

  Disoriented: (x = 1) =>
    `While under this condition, the target must make a cumulative Fortitude DC, with ${x} as the target number, at the beginning of each of their turns. If they fail, they lose three AP from their AP pool for that turn. At the end of each turn, the ${x} value decreases by one. When ${x} is equal to or less than zero, remove this condition.`,

  Enthralled: () =>
    'While under this condition, the target becomes enamored with the source of their enthrallment. Their actions are controlled by the GM, but they generally listen to what their enthraller wants, including potentially turning on former comrades. They will not do anything that would cause immediate self-harm, such as jumping off a building or poisoning themselves. If the target would receive an injury, they must make an immediate DC, with the skill determined by the source of the enthrallment. On success, remove this condition. If the source attacks or injures the target, is killed, loses focus, or is destroyed, this condition immediately ends.',

  Frightened: (x = 1) =>
    `While under this condition, the target must make a cumulative Fortitude check, with ${x} as the target number, at the beginning of each of their turns. If they fail, they must spend all their AP to move as far away as possible from the source that gave them this condition.`,

  Impaled: (x = 1) =>
    `The target has been impaled by a physical object. While under this condition, the target's movement is reduced by ${x} Units per AP spent. A target may spend 1 AP to remove the object and reduce this condition's X by the X caused by the object. When ${x} is equal to or less than zero, remove this condition.`,

  Madness: (x = 1) =>
    `While under this condition, the target must make a cumulative Fortitude DC equal to ${x} at the beginning of each of their turns. If they fail, they must spend their initial AP to move and attack the nearest PC or NPC, friend or foe, once as part of their turn. If they do not have a weapon equipped, they must use their strongest Martial Arts attack available.`,

  Paralysis: (x = 1) =>
    `While under this condition, movement allowed from spending AP is reduced by ${x} Units per AP spent. The Reflex Skill is also reduced by ${x} Die Levels. Another character may make a Cumulative Medical Skill DC to reduce this condition by ${x}. When ${x} is equal to or less than zero, remove this condition.`,

  Poisoned: (x = 1) =>
    `While under this condition, the target must make a Cumulative Survivability DC, with ${x} as the target number, at the beginning of each of their turns. If they fail, they receive one injury. If ${x} is equal to zero, remove this condition.`,

  'Poisoned (Deadly)': (x = 1) =>
    `While under this condition, the target must make a Cumulative Survivability DC, with ${x} as the target number, at the beginning of each of their turns. If they fail, they receive two injuries. If ${x} is equal to zero, remove this condition.`,

  Transformed: (x = 1) =>
    `While under this condition, the target remains transformed into a small animal, such as a mouse, hedgehog, or chicken. At the end of each of the target’s turns, reduce the X value by one. When ${x} is equal to zero, remove this condition. All of their equipment disappears until the transformation ends. They lose all skills, equipment, and abilities for the duration of the transformation and instead use Reflex 4; all other skills are level one. If they receive an injury while in animal form, that injury transfers to their actual form. If they die while transformed, they die for real and immediately regain their original form.`,

  Unconscious: () =>
    'While under this condition, the target cannot spend any AP. Remove this condition at the end of the target’s subsequent turn. All attacks against unconscious targets automatically hit, and the result of the Reflex save is considered a one for purposes of critical hits.',

  Critical: () =>
    'While under this condition, the target must make a Critical condition DC at the end of their subsequent turns. If a target receives an injury while under this condition, they must make an immediate Critical condition DC. This condition can be removed with a Medical DC from another adjacent character.',
};

export function renderConditionText(name: ConditionName, severity?: number) {
  const fn = CONDITION_TEXT[name];
  if (!fn) {
    return `No rules text found for "${name}".`;
  }
  return fn(severity ?? 1);
}
