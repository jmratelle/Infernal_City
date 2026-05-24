'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DAMAGE_TYPES } from '@/domain/character.constants';
import { sumArmorValues } from '@/domain/character.helpers';
import type { AttributeDef, Character } from '@/domain/character.types';

type HomeSummaryProps = {
  character: Character;
  skillDefs: AttributeDef[];
  inventoryCount: number;
  maxInventory: number;
};

type WidgetId =
  | 'vitals'
  | 'rerolls'
  | 'homeDiet'
  | 'armorValues'
  | 'carried'
  | 'skills'
  | 'abilities'
  | 'costsDebt'
  | 'conditions';
type CarriedType = 'inventory' | 'accessories' | 'weapons' | 'vehicles';

type CarriedPreferences = {
  showNames: boolean;
  visibleTypes: CarriedType[];
};

const WIDGETS: Array<{ id: WidgetId; label: string }> = [
  { id: 'vitals', label: 'Vitals' },
  { id: 'rerolls', label: 'Rerolls' },
  { id: 'homeDiet', label: 'Home & Diet' },
  { id: 'armorValues', label: 'Armor Values' },
  { id: 'carried', label: 'Carried' },
  { id: 'skills', label: 'Skills' },
  { id: 'abilities', label: 'Abilities' },
  { id: 'costsDebt', label: 'Costs & Debt' },
  { id: 'conditions', label: 'Conditions' },
];

const DEFAULT_VISIBLE_WIDGETS: WidgetId[] = WIDGETS.map((widget) => widget.id);
const STORAGE_PREFIX = 'infernal-sheet:home-widgets:';
const CARRIED_STORAGE_PREFIX = 'infernal-sheet:home-carried:';
const CARRIED_TYPES: Array<{ id: CarriedType; label: string }> = [
  { id: 'inventory', label: 'Inventory' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'weapons', label: 'Weapons' },
  { id: 'vehicles', label: 'Vehicles' },
];
const DEFAULT_CARRIED_PREFERENCES: CarriedPreferences = {
  showNames: true,
  visibleTypes: CARRIED_TYPES.map((type) => type.id),
};

function SummaryBlock({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Card className="sheet-card py-0">
      <CardContent className="p-2.5 sm:p-3">
        <div className="sheet-kicker mb-2">{title}</div>
        {children}
      </CardContent>
    </Card>
  );
}

function EmptyLine({ text = 'None' }: { text?: string }) {
  return <div className="text-sm text-white/55">{text}</div>;
}

export function HomeSummary({ character, skillDefs, inventoryCount, maxInventory }: HomeSummaryProps) {
  const storageKey = `${STORAGE_PREFIX}${character.id || 'default'}`;
  const carriedStorageKey = `${CARRIED_STORAGE_PREFIX}${character.id || 'default'}`;
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(DEFAULT_VISIBLE_WIDGETS);
  const [carriedPreferences, setCarriedPreferences] = useState<CarriedPreferences>(DEFAULT_CARRIED_PREFERENCES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setVisibleWidgets(DEFAULT_VISIBLE_WIDGETS);
        return;
      }

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;

      const valid = parsed.filter((id): id is WidgetId =>
        WIDGETS.some((widget) => widget.id === id)
      );
      setVisibleWidgets(valid.length ? valid : DEFAULT_VISIBLE_WIDGETS);
    } catch {
      setVisibleWidgets(DEFAULT_VISIBLE_WIDGETS);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(carriedStorageKey);
      if (!saved) {
        setCarriedPreferences(DEFAULT_CARRIED_PREFERENCES);
        return;
      }

      const parsed = JSON.parse(saved) as Partial<CarriedPreferences>;
      const visibleTypes = Array.isArray(parsed.visibleTypes)
        ? parsed.visibleTypes.filter((id): id is CarriedType =>
            CARRIED_TYPES.some((type) => type.id === id)
          )
        : DEFAULT_CARRIED_PREFERENCES.visibleTypes;

      setCarriedPreferences({
        showNames: parsed.showNames ?? DEFAULT_CARRIED_PREFERENCES.showNames,
        visibleTypes: visibleTypes.length ? visibleTypes : DEFAULT_CARRIED_PREFERENCES.visibleTypes,
      });
    } catch {
      setCarriedPreferences(DEFAULT_CARRIED_PREFERENCES);
    }
  }, [carriedStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(visibleWidgets));
    } catch {
      // Ignore blocked storage; the choices still work for the current session.
    }
  }, [storageKey, visibleWidgets]);

  useEffect(() => {
    try {
      localStorage.setItem(carriedStorageKey, JSON.stringify(carriedPreferences));
    } catch {
      // Ignore blocked storage; the choices still work for the current session.
    }
  }, [carriedStorageKey, carriedPreferences]);

  const visibleWidgetSet = useMemo(() => new Set(visibleWidgets), [visibleWidgets]);
  const showWidget = (id: WidgetId) => visibleWidgetSet.has(id);
  const toggleWidget = (id: WidgetId) => {
    setVisibleWidgets((current) =>
      current.includes(id)
        ? current.filter((widgetId) => widgetId !== id)
        : [...current, id]
    );
  };
  const showCarriedType = (id: CarriedType) => carriedPreferences.visibleTypes.includes(id);
  const toggleCarriedType = (id: CarriedType) => {
    setCarriedPreferences((current) => ({
      ...current,
      visibleTypes: current.visibleTypes.includes(id)
        ? current.visibleTypes.filter((typeId) => typeId !== id)
        : [...current.visibleTypes, id],
    }));
  };
  const setShowCarriedNames = (showNames: boolean) => {
    setCarriedPreferences((current) => ({ ...current, showNames }));
  };

  const notableSkills = skillDefs
    .map((skill) => ({ ...skill, level: character.attributes?.[skill.id] ?? 1 }))
    .filter((skill) => skill.level !== 1)
    .sort((a, b) => b.level - a.level || a.label.localeCompare(b.label));

  const abilityNames = (character.abilities ?? []).map((ability) =>
    ability.count && ability.count > 1 ? `${ability.name} x${ability.count}` : ability.name
  );

  const genericRerolls = character.resources?.rerolls ?? 0;
  const specificRerolls = Object.entries(character.skillRerolls ?? {})
    .filter(([, count]) => count > 0)
    .map(([skillId, count]) => `${skillDefs.find((skill) => skill.id === skillId)?.label ?? skillId}: ${count}`);

  const dietCosts = (character.recurringCosts ?? []).filter((cost) =>
    /diet|food|meal|blood|feed/i.test([cost.name, cost.notes].filter(Boolean).join(' '))
  );

  const totalDebt = (character.debt ?? []).reduce((sum, debt) => sum + (debt.amount ?? 0), 0);
  const recurringTotal = (character.recurringCosts ?? []).reduce((sum, cost) => sum + (cost.amount ?? 0), 0);
  const equippedArmor = sumArmorValues(character.armor);
  const positiveArmorValues = DAMAGE_TYPES.map((damageType) => ({
    damageType,
    value: (equippedArmor[damageType] ?? 0) + (character.totalArmor?.[damageType] ?? 0),
  })).filter((entry) => entry.value > 0);
  const housingName = character.housing?.apartmentTier || 'No hideout selected';
  const housingUpgrades = character.housing?.upgrades ?? [];
  const carriedItems = (character.items ?? [])
    .map((item) => {
      const name = String(item.name ?? '').trim();
      const qty = Number(item.qty ?? 1);
      if (!name) return '';
      return qty > 1 ? `${name} x${qty}` : name;
    })
    .filter(Boolean);
  const carriedAccessories = (character.accessories ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  const carriedWeapons = (character.weapons ?? [])
    .map((weapon) => weapon.name?.trim())
    .filter(Boolean);
  const carriedVehicles = (character.vehicles ?? [])
    .map((vehicle) => vehicle.name?.trim())
    .filter(Boolean);
  const renderCarriedGroup = (label: string, items: string[], emptyText: string) => (
    <div>
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">{label}</div>
      <div className="flex flex-wrap gap-1">
        {items.length ? (
          items.map((item, index) => (
            <span key={`${label}-${item}-${index}`} className="rounded bg-black/30 px-2 py-1 text-xs">
              {item}
            </span>
          ))
        ) : (
          <EmptyLine text={emptyText} />
        )}
      </div>
    </div>
  );

  return (
    <div className="grid gap-3 text-white">
      <div className="sheet-panel flex flex-wrap items-center justify-between gap-2 p-3">
        <div>
          <div className="text-sm font-semibold">Home Layout</div>
          <div className="text-xs text-white/60">
            {visibleWidgets.length} of {WIDGETS.length} sections visible
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setIsCustomizing((value) => !value)}
          >
            {isCustomizing ? 'Done' : 'Customize'}
          </Button>
          {isCustomizing && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setVisibleWidgets(DEFAULT_VISIBLE_WIDGETS)}
            >
              Show All
            </Button>
          )}
        </div>
      </div>

      {isCustomizing && (
        <div className="sheet-panel grid gap-3 p-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {WIDGETS.map((widget) => (
              <label
                key={widget.id}
                className="flex min-h-9 items-center gap-2 rounded-md border border-amber-200/10 bg-black/25 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={showWidget(widget.id)}
                  onChange={() => toggleWidget(widget.id)}
                />
                <span>{widget.label}</span>
              </label>
            ))}
          </div>

          {showWidget('carried') && (
            <div className="rounded-md border border-amber-200/10 bg-black/25 p-3">
              <div className="sheet-kicker mb-2">Carried Details</div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <label className="flex min-h-9 items-center gap-2 rounded-md border border-amber-200/10 bg-black/25 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={carriedPreferences.showNames}
                    onChange={(event) => setShowCarriedNames(event.target.checked)}
                  />
                  <span>Show names</span>
                </label>
                {CARRIED_TYPES.map((type) => (
                  <label
                    key={type.id}
                    className="flex min-h-9 items-center gap-2 rounded-md border border-amber-200/10 bg-black/25 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={showCarriedType(type.id)}
                      onChange={() => toggleCarriedType(type.id)}
                      disabled={!carriedPreferences.showNames}
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-3 xl:grid-cols-4">
      {showWidget('vitals') && (
        <SummaryBlock title="Vitals">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-white/55">Race</div>
            <div className="font-medium">{character.race || 'Unset'}</div>
          </div>
          <div>
            <div className="text-white/55">Origin</div>
            <div className="font-medium">{character.origin || 'Unset'}</div>
          </div>
          <div>
            <div className="text-white/55">Goldbacks</div>
            <div className="font-medium">{character.money ?? 0}</div>
          </div>
          <div>
            <div className="text-white/55">Injuries</div>
            <div className="font-medium">{character.injuries ?? 0}</div>
          </div>
          {character.race === 'Demonkin' && (
            <div>
              <div className="text-white/55">Blood Points</div>
              <div className="font-medium">{character.bloodPoints ?? 0}</div>
            </div>
          )}
        </div>
      </SummaryBlock>
      )}

      {showWidget('rerolls') && (
        <SummaryBlock title="Rerolls">
        <div className="text-sm">
          <div className="font-medium">Generic: {genericRerolls}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {specificRerolls.length ? (
              specificRerolls.map((reroll) => (
                <span key={reroll} className="rounded bg-black/30 px-2 py-1 text-xs">
                  {reroll}
                </span>
              ))
            ) : (
              <EmptyLine text="No specific rerolls" />
            )}
          </div>
        </div>
      </SummaryBlock>
      )}

      {showWidget('homeDiet') && (
        <SummaryBlock title="Home & Diet">
        <div className="space-y-2 text-sm">
          <div>
            <div className="font-medium">{housingName}</div>
            <div className="text-white/60">{character.housing?.rentCost ?? 0} GB rent</div>
          </div>
          <div className="flex flex-wrap gap-1">
            {housingUpgrades.length ? (
              housingUpgrades.map((upgrade, index) => (
                <span key={`${upgrade}-${index}`} className="rounded bg-black/30 px-2 py-1 text-xs">
                  {upgrade}
                </span>
              ))
            ) : (
              <EmptyLine text="No upgrades" />
            )}
          </div>
          <div className="border-t border-white/10 pt-2">
            {dietCosts.length ? (
              dietCosts.map((cost) => (
                <div key={cost.id} className="text-xs text-white/75">
                  {cost.name || 'Diet'}: {cost.amount ?? 0} GB, {cost.frequency}
                </div>
              ))
            ) : (
              <EmptyLine text="No diet cost tracked" />
            )}
          </div>
        </div>
      </SummaryBlock>
      )}

      {showWidget('armorValues') && (
        <SummaryBlock title="Armor Values">
          <div className="flex flex-wrap gap-2">
            {positiveArmorValues.length ? (
              positiveArmorValues.map(({ damageType, value }) => (
                <span key={damageType} className="rounded bg-black/30 px-2 py-1 text-xs">
                  {damageType} {value}
                </span>
              ))
            ) : (
              <EmptyLine text="No armor values above 0" />
            )}
          </div>
        </SummaryBlock>
      )}

      {showWidget('carried') && (
        <SummaryBlock title="Carried">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-white/55">Inventory</div>
              <div className="font-medium">
                {inventoryCount}/{maxInventory}
              </div>
            </div>
            <div>
              <div className="text-white/55">Weapons</div>
              <div className="font-medium">{character.weapons?.length ?? 0}/2</div>
            </div>
            <div>
              <div className="text-white/55">Accessories</div>
              <div className="font-medium">{character.accessories?.filter(Boolean).length ?? 0}/4</div>
            </div>
            <div>
              <div className="text-white/55">Vehicles</div>
              <div className="font-medium">{character.vehicles?.length ?? 0}</div>
            </div>
          </div>
          {carriedPreferences.showNames && (
            <>
              {showCarriedType('inventory') && renderCarriedGroup('Inventory', carriedItems, 'No inventory items')}
              {showCarriedType('accessories') && renderCarriedGroup('Accessories', carriedAccessories, 'No accessories')}
              {showCarriedType('weapons') && renderCarriedGroup('Weapons', carriedWeapons, 'No weapons')}
              {showCarriedType('vehicles') && renderCarriedGroup('Vehicles', carriedVehicles, 'No vehicles')}
            </>
          )}
        </div>
      </SummaryBlock>
      )}

      {showWidget('skills') && (
        <SummaryBlock title="Skills Above 1">
        <div className="flex flex-wrap gap-1">
          {notableSkills.length ? (
            notableSkills.map((skill) => (
              <span key={skill.id} className="rounded bg-black/30 px-2 py-1 text-xs">
                {skill.label} {skill.level}
              </span>
            ))
          ) : (
            <EmptyLine />
          )}
        </div>
      </SummaryBlock>
      )}

      {showWidget('abilities') && (
        <SummaryBlock title="Abilities">
        <div className="flex flex-wrap gap-1">
          {abilityNames.length ? (
            abilityNames.map((name, index) => (
              <span key={`${name}-${index}`} className="rounded bg-black/30 px-2 py-1 text-xs">
                {name}
              </span>
            ))
          ) : (
            <EmptyLine />
          )}
        </div>
      </SummaryBlock>
      )}

      {showWidget('costsDebt') && (
        <SummaryBlock title="Costs & Debt">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-white/55">Recurring</div>
            <div className="font-medium">{recurringTotal} GB</div>
          </div>
          <div>
            <div className="text-white/55">Debt</div>
            <div className="font-medium">{totalDebt} GB</div>
          </div>
        </div>
      </SummaryBlock>
      )}

      {showWidget('conditions') && (
        <SummaryBlock title="Conditions">
        <div className="flex flex-wrap gap-1">
          {(character.conditions ?? []).length ? (
            (character.conditions ?? []).map((condition) => (
              <span key={condition.id} className="rounded bg-black/30 px-2 py-1 text-xs">
                {condition.name}
                {condition.severity ? ` ${condition.severity}` : ''}
              </span>
            ))
          ) : (
            <EmptyLine />
          )}
        </div>
      </SummaryBlock>
      )}
      </div>
    </div>
  );
}
