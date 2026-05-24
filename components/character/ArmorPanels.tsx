'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ARMOR_OPTIONS, ARMOR_STATS } from '@/data/items';
import { DAMAGE_TYPES } from '@/domain/character.constants';
import { clamp } from '@/domain/character.helpers';
import type { ArmorAV, ArmorSlots } from '@/domain/character.types';

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

      <div className="sheet-panel p-2 text-xs leading-relaxed">
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

export const ArmorSlotsBox: React.FC<{
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
    <Card className="sheet-card py-0">
      <CardContent className="p-4 text-white">
        <div className="sheet-kicker mb-3">Armor Slots</div>
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




export const ArmorTotalsBox: React.FC<{
  equipped: ArmorAV;
  modifiers: ArmorAV;
  onChangeModifiers: (next: ArmorAV) => void;
  readOnly?: boolean;
}> = ({ equipped, modifiers, onChangeModifiers, readOnly }) => {
  const MIN = 0;
  const MAX = 9;
  const [showDetails, setShowDetails] = React.useState(true);

  return (
    <Card className="sheet-card py-0">
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
              <div key={dt} className="sheet-panel grid gap-1 p-3">
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




