'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renderConditionText } from '@/domain/character.conditions';
import { clamp, makeId } from '@/domain/character.helpers';
import type { ConditionEntry, ConditionName } from '@/domain/character.types';

export const BloodPointsPanel: React.FC<{
  bloodPoints: number;
  onChange: (n: number) => void;
  readOnly?: boolean;
}> = ({ bloodPoints, onChange, readOnly }) => (
  <Card className="sheet-card py-0">
    <CardContent className="p-4 text-white">
      <div className="mb-3">
        <div className="text-sm font-medium text-white">Blood Points</div>
        <div className="text-xs text-white/55">Track Demonkin blood points.</div>
      </div>
      <div className="grid max-w-xs grid-cols-2 items-end gap-2">
        <div className="grid gap-1">
          <Label>Count</Label>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            value={bloodPoints}
            onChange={(e) => onChange(clamp(parseInt(e.target.value || '0', 10), 0, 99))}
            disabled={readOnly}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="secondary"
            onClick={() => onChange(clamp(bloodPoints - 1, 0, 99))}
            disabled={readOnly}
          >
            -
          </Button>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="secondary"
            onClick={() => onChange(clamp(bloodPoints + 1, 0, 99))}
            disabled={readOnly}
          >
            +
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const InjuriesPanel: React.FC<{
  injuries: number;
  onChange: (n: number) => void;
  readOnly?: boolean;
}> = ({ injuries, onChange, readOnly }) => (
  <Card className="sheet-card py-0">
    <CardContent className="p-4 text-white">
      <div className="mb-3">
        <div className="text-sm font-medium text-white">Injuries</div>
        <div className="text-xs text-white/55">Track current injury pressure.</div>
      </div>
      <div className="grid max-w-xs grid-cols-2 items-end gap-2">
        <div className="grid gap-1">
          <Label>Count</Label>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            value={injuries}
            onChange={(e) => onChange(clamp(parseInt(e.target.value || '0', 99), 0, 99))}
            disabled={readOnly}
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="secondary"
            onClick={() => onChange(clamp(injuries - 1, 0, 99))}
            disabled={readOnly}
          >
            -
          </Button>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            variant="secondary"
            onClick={() => onChange(clamp(injuries + 1, 0, 99))}
            disabled={readOnly}
          >
            +
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ConditionsPanel: React.FC<{
  entries: ConditionEntry[];
  onChange: (next: ConditionEntry[]) => void;
  readOnly?: boolean;
}> = ({ entries, onChange, readOnly }) => {
  const isX = (name: ConditionName) =>
    name === 'Bleeding' ||
    name === 'Bound' ||
    name === 'Burning' ||
    name === 'Crippled' ||
    name === 'Disoriented' ||
    name === 'Frightened' ||
    name === 'Impaled' ||
    name === 'Madness' ||
    name === 'Paralysis' ||
    name === 'Poisoned' ||
    name === 'Poisoned (Deadly)' ||
    name === 'Transformed';

  const clampX = (x: number) => Math.max(0, Math.min(99, x | 0));
  const add = () => onChange([...(entries || []), { id: makeId('cond'), name: 'Bleeding', severity: 1 }]);
  const remove = (id: string) => onChange((entries || []).filter((e) => e.id !== id));

  const ALL: ConditionName[] = [
    'Addiction Tremors',
    'Bleeding',
    'Bonded Destiny',
    'Bound',
    'Burning',
    'Crippled',
    'Corroded',
    'Disoriented',
    'Enthralled',
    'Frightened',
    'Impaled',
    'Madness',
    'Paralysis',
    'Poisoned',
    'Poisoned (Deadly)',
    'Transformed',
    'Unconscious',
    'Critical',
  ];

  return (
    <Card className="sheet-card py-0">
      <CardContent className="p-4 text-white">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <div>
            <div className="text-sm font-medium">Conditions</div>
            <div className="text-xs text-white/55">{entries.length} active</div>
          </div>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            onClick={add}
            disabled={readOnly}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Condition
          </Button>
        </div>

        <div className="space-y-4">
          {(entries || []).map((e, i) => (
            <div key={e.id} className="sheet-panel space-y-2 p-3">
              <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-7">
                <select
                  className="md:col-span-4 rounded-md border bg-background px-3 py-2 text-sm text-white"
                  value={e.name}
                  onChange={(ev) => {
                    const name = ev.target.value as ConditionName;
                    const next = [...(entries || [])];
                    next[i] = {
                      ...e,
                      name,
                      severity: isX(name) ? (e.severity ?? 1) : undefined,
                    };
                    onChange(next);
                  }}
                  disabled={readOnly}
                >
                  {ALL.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>

                {isX(e.name) && (
                  <div className="md:col-span-2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => {
                        const next = [...(entries || [])];
                        const cur = next[i];
                        const newX = clampX((cur.severity ?? 0) - 1);
                        next[i] = { ...cur, severity: newX };
                        onChange(next);
                      }}
                      disabled={readOnly || (e.severity ?? 0) <= 0}
                      title="Decrease"
                      aria-label="Decrease"
                    >
                      -
                    </Button>

                    <div className="min-w-[2.25rem] rounded-md border border-amber-200/10 bg-black/45 px-2 py-1 text-center text-sm text-white">
                      {e.severity ?? 0}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 w-7"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => {
                        const next = [...(entries || [])];
                        const cur = next[i];
                        const newX = clampX((cur.severity ?? 0) + 1);
                        next[i] = { ...cur, severity: newX };
                        onChange(next);
                      }}
                      disabled={readOnly}
                      title="Increase"
                      aria-label="Increase"
                    >
                      +
                    </Button>
                  </div>
                )}

                <div className="md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    className="md:col-span-1 flex justify-end"
                    onMouseDown={(ev) => ev.preventDefault()}
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(e.id)}
                    disabled={readOnly}
                    aria-label="Remove condition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200/10 bg-black/40 p-3 text-xs leading-relaxed whitespace-pre-line">
                {renderConditionText(e.name as ConditionName, e.severity)}
              </div>
            </div>
          ))}

          {(entries || []).length === 0 && (
            <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/65">
              No active conditions.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
