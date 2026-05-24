'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { clamp, set } from '@/domain/character.helpers';
import {
  HIDEOUT_TIER_DETAILS,
  HIDEOUT_UPGRADE_DETAILS,
  HIDEOUT_UPGRADES,
  type HideoutUpgrade,
} from '@/domain/character.housing';
import type { Character } from '@/domain/character.types';

type HousingPanelProps = {
  char: Character;
  onChange: (updated: Character) => void;
  readOnly?: boolean;
};

export function HousingPanel({ char, onChange, readOnly }: HousingPanelProps) {
  const selectedHideout = char.housing?.apartmentTier
    ? HIDEOUT_TIER_DETAILS[char.housing.apartmentTier]
    : undefined;
  const selectedUpgradeDetails = (char.housing?.upgrades ?? [])
    .map((upgrade) => (upgrade ? { name: upgrade, data: HIDEOUT_UPGRADE_DETAILS[upgrade as HideoutUpgrade] } : undefined))
    .filter((entry): entry is { name: string; data: { price: number; summary: string } } => Boolean(entry?.data));

  return (
    <TabsContent value="housing" className="grid gap-4">
      <Card className="sheet-card py-0">
        <CardContent className="grid gap-4 p-4 md:grid-cols-3 text-white">
          <div className="grid gap-1.5">
            <Label>Rent Cost (Goldbacks)</Label>
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              value={String(char.housing?.rentCost ?? 0)}
              onChange={(e) =>
                onChange(
                  set(char, 'housing', {
                    ...(char.housing ?? {}),
                    rentCost: clamp(parseInt(e.target.value || '0', 10), 0, 999999),
                  })
                )
              }
              disabled={readOnly}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Apartment Tier</Label>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={char.housing?.apartmentTier ?? ''}
              onChange={(e) => {
                const val = (e.target.value || undefined) as Character['housing']['apartmentTier'];
                onChange(
                  set(char, 'housing', {
                    ...(char.housing ?? {}),
                    apartmentTier: val,
                    rentCost: val ? HIDEOUT_TIER_DETAILS[val].rentCost : char.housing?.rentCost ?? 0,
                  })
                );
              }}
              disabled={readOnly}
            >
              <option value="">- Select -</option>
              <option>Wasteland Hovel</option>
              <option>Dead End Apartment</option>
              <option>Incognito Dwelling</option>
              <option>Incognito Compound</option>
              <option>Luxury Apartment</option>
              <option>Penthouse</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {selectedHideout && (
        <Card className="sheet-card py-0">
          <CardContent className="grid gap-4 p-4 text-white md:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">5.2 base rent</div>
              <div className="mt-1 text-lg font-semibold">
                {selectedHideout.rentCost === 0 ? 'Zero' : `${selectedHideout.rentCost.toLocaleString()} Goldbacks`}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Starting rooms</div>
              <div className="mt-1 text-sm leading-relaxed">{selectedHideout.rooms}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">Threat level</div>
              <div className="mt-1 text-sm leading-relaxed">{selectedHideout.threat}</div>
            </div>
            <div className="sheet-panel rounded-lg p-3 text-sm leading-relaxed md:col-span-3">
              <div className="font-medium text-white">Tier summary</div>
              <div className="mt-1 text-white/85">{selectedHideout.summary}</div>
              <div className="mt-2 text-white/70">{selectedHideout.events}</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="sheet-card py-0">
        <CardContent className="grid gap-4 p-4 text-white">
          <div className="grid gap-1.5">
            <Label>Upgrades</Label>
            <div className="space-y-2">
              {(char.housing?.upgrades ?? []).map((u, i) => (
                <div key={`${u}-${i}`} className="flex items-center gap-2">
                  <select
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                    value={u}
                    onChange={(e) => {
                      const next = [...(char.housing?.upgrades ?? [])];
                      next[i] = e.target.value;
                      onChange(set(char, 'housing', { ...(char.housing ?? {}), upgrades: next }));
                    }}
                    disabled={readOnly}
                  >
                    {HIDEOUT_UPGRADES.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <Button
                    onMouseDown={(e) => e.preventDefault()}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onChange(
                        set(char, 'housing', {
                          ...(char.housing ?? {}),
                          upgrades: (char.housing?.upgrades ?? []).filter((_, idx) => idx !== i),
                        })
                      );
                    }}
                    disabled={readOnly}
                    aria-label="Remove upgrade"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const next = [...(char.housing?.upgrades ?? []), HIDEOUT_UPGRADES[0] as string];
                  onChange(set(char, 'housing', { ...(char.housing ?? {}), upgrades: next }));
                }}
                disabled={readOnly}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Upgrade
              </Button>
            </div>
          </div>

          {selectedUpgradeDetails.length > 0 && (
            <div className="sheet-panel p-3 text-sm leading-relaxed">
              <div className="mb-2 font-medium text-white">Selected upgrade effects</div>
              <div className="space-y-2 text-white/85">
                {selectedUpgradeDetails.map(({ name, data }, index) => (
                  <div key={`${name}-${index}`}>
                    <span className="font-semibold">{name}</span> ({data.price.toLocaleString()} Goldbacks): {data.summary}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
