'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { SelectableField } from '@/components/ui/SelectableField';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ACCESSORY_OPTIONS, ACCESSORY_RULES, WEAPON_OPTIONS, WEAPON_STATS } from '@/data/items';
import { clamp, makeId } from '@/domain/character.helpers';
import type { WeaponEntry } from '@/domain/character.types';

export const EquippedGear: React.FC<{
  accessories: string[];
  onChangeAccessories: (next: string[]) => void;
  weapons: WeaponEntry[];
  onChangeWeapons: (next: WeaponEntry[]) => void;
  readOnly?: boolean;
}> = ({ accessories, onChangeAccessories, weapons, onChangeWeapons, readOnly }) => {
  const addAccessory = () => accessories.length < 4 && onChangeAccessories([...accessories, '']);
  const removeAccessory = (i: number) =>
    onChangeAccessories(accessories.filter((_, idx) => idx !== i));
  const accessoryNotes = Array.from(
    new Set(accessories.map((name) => name.trim()).filter(Boolean))
  )
    .map((name) => ({ name, text: ACCESSORY_RULES[name] }))
    .filter((entry): entry is { name: string; text: string } => Boolean(entry.text));
  const normalizeWeaponCategory = (category: string) => {
    if (category === 'Melee') return 'Melee Weapons';
    if (category === 'Drones') return 'Drone Operation';
    return category;
  };
  const weaponCategories = Object.keys(WEAPON_OPTIONS);

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
      <Card className="sheet-card py-0">
        <CardContent className="p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">
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
                <SelectableField
                  label={`Accessory ${i + 1}`}
                  value={txt}
                  options={ACCESSORY_OPTIONS}
                  onChange={(val) => {
                    const next = accessories.slice();
                    next[i] = val;
                    onChangeAccessories(next);
                  }}
                  readOnly={readOnly}
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
              <div className="text-sm text-white/65">No accessories equipped.</div>
            )}
          </div>

          {accessoryNotes.length > 0 && (
            <div className="sheet-panel mt-3 p-3 text-xs leading-relaxed">
              <div className="mb-2 font-medium text-white">5.2 accessory notes</div>
              <div className="space-y-2 text-white/90">
                {accessoryNotes.map(({ name, text }) => (
                  <div key={name}>
                    <span className="font-semibold">{name}:</span> {text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weapons as cards */}
      <Card className="sheet-card py-0">
        <CardContent className="p-4 text-white">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">
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
              <div key={w.id} className="sheet-panel p-3">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    {/* Weapon Type (Skill) Dropdown */}
                    <SelectableField
                      label="Weapon Type"
                      value={normalizeWeaponCategory(w.skill)}
                      options={weaponCategories}
                      onChange={(val) => {
                        // Reset weapon name if category changes
                        patchWeapon(w.id, { skill: val, name: "" });
                      }}
                      readOnly={readOnly}
                    />
                  </div>
                  <div className="grid gap-1">
                    {/* Weapon Name Dropdown (depends on type) */}
                    {normalizeWeaponCategory(w.skill) && WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS] && (
                      <SelectableField
                        label="Weapon"
                        value={w.name}
                        options={
                          Array.isArray(WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS])
                            ? (WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS] as string[])
                            : Object.values(
                                WEAPON_OPTIONS[normalizeWeaponCategory(w.skill) as keyof typeof WEAPON_OPTIONS]
                              ).flat()
                        }
                        onChange={(val) => {
                        const base = WEAPON_STATS[val];
                        if (base) {
                          // Auto-populate all weapon stats, including ammo capacity
                          const parsedAmmo =
                            typeof base.ammo === "string"
                              ? parseInt(base.ammo.replace(/\D/g, ""), 10) || 0
                              : Number(base.ammo) || 0;

                          patchWeapon(w.id, {
                            name: val,
                            skill: normalizeWeaponCategory(base.type ?? w.skill),
                            action: base.action ?? w.action,
                            idealRange: base.idealRange ?? w.idealRange,
                            maxRange: base.maxRange ?? w.maxRange,
                            damageTypes: base.damage ?? w.damageTypes,
                            arp: base.arp ?? w.arp,
                            maxAmmo: parsedAmmo, // auto-set max ammo from WEAPON_STATS
                            currentAmmo: parsedAmmo, // optional: start full
                          });
                        } else {
                          // No stats available — treat as custom weapon
                          patchWeapon(w.id, { name: val });
                        }
                      }}


                        readOnly={readOnly}
                      />
                    )}
                  </div>
                  <div className="grid gap-1">
                    <Label>Action/Effects{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                    <Textarea
                      value={w.action}
                      onChange={(e) => patchWeapon(w.id, { action: e.target.value })}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label>Ideal Range{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                      <Input
                        value={w.idealRange}
                        onChange={(e) => patchWeapon(w.id, { idealRange: e.target.value })}
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Max Range{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
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
                      <Label>Max Ammo{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
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
                      <Label>Damage Type(s){" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
                      <Input
                        value={w.damageTypes}
                        onChange={(e) => patchWeapon(w.id, { damageTypes: e.target.value })}
                        placeholder="Pierce, Burn"
                        disabled={readOnly}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>ArP{" "}
                      {WEAPON_STATS[w.name] && (
                        <span className="text-xs text-white/50">(auto-filled)</span>
                      )}</Label>
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
              <div className="text-sm text-white/65">No weapons added.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

