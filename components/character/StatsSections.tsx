'use client';

import React, { useEffect, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clamp, groupBy, set } from '@/domain/character.helpers';
import type { AttributeDef, Character, SkillGroup } from '@/domain/character.types';

export const GoldbacksPanel: React.FC<{
  value: Character;
  onChange: (c: Character) => void;
  readOnly?: boolean;
}> = ({ value, onChange, readOnly }) => {
  const idBase = useId();

  return (
    <Card className="sheet-card py-0">
      <CardContent className="grid gap-4 p-4 text-white md:max-w-xs">
        <div className="grid gap-2">
          <Label htmlFor={`${idBase}-goldbacks`}>Goldbacks</Label>
          <Input
            id={`${idBase}-goldbacks`}
            inputMode="numeric"
            pattern="[0-9]*"
            value={value.money ?? 0}
            onChange={(e) =>
              onChange(set(value, 'money', clamp(parseInt(e.target.value || '0', 10), 0, 999999)))
            }
            placeholder="0"
            disabled={readOnly}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export const GroupedSkillsGrid: React.FC<{
  defs: AttributeDef[];
  values: Record<string, number>;
  onChange: (next: Record<string, number>) => void;
  readOnly?: boolean;
}> = ({ defs, values, onChange, readOnly }) => {
  const groups = groupBy(defs);
  const [open, setOpen] = useState<Record<SkillGroup, boolean>>({
    combat: true,
    magic: true,
    specialized: true,
  });
  useEffect(() => {
    if (window.matchMedia('(max-width: 640px)').matches) {
      setOpen({
        combat: true,
        magic: false,
        specialized: false,
      });
    }
  }, []);
  const toggle = (g: SkillGroup) => setOpen((o) => ({ ...o, [g]: !o[g] }));

  const Section = ({ grp, title, items }: { grp: SkillGroup; title: string; items: AttributeDef[] }) => (
    <Card className="sheet-card py-0">
      <CardContent className="p-3 text-white sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="sheet-kicker">{grp}</div>
            <div className="text-base font-semibold text-white">{title}</div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggle(grp)}
          >
            {open[grp] ? 'Hide' : 'Show'}
          </Button>
        </div>

        {open[grp] && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
            {[...items]
              .sort((a, b) => {
                const A = a.label.toLowerCase();
                const B = b.label.toLowerCase();
                return A < B ? -1 : A > B ? 1 : 0;
              })
              .map((def) => {
                const min = def.min ?? 1;
                const max = def.max ?? 5;
                const step = def.step ?? 1;
                const val = values[def.id] ?? min;

                return (
                  <div key={def.id} className="sheet-panel grid items-start gap-2 p-2 sm:p-3">
                    <Label htmlFor={`attr-${def.id}`} className="text-xs leading-tight sm:text-sm">{def.label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        id={`attr-${def.id}`}
                        value={val}
                        min={min}
                        max={max}
                        step={step}
                        readOnly
                        className="h-9 w-12"
                        disabled={readOnly}
                        aria-describedby={`attr-${def.id}-help`}
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          variant="secondary"
                          size="sm"
                          className="h-9 w-8 px-0"
                          onClick={() => onChange({ ...values, [def.id]: clamp(val - step, min, max) })}
                          disabled={readOnly}
                        >
                          -
                        </Button>
                        <Button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          variant="secondary"
                          size="sm"
                          className="h-9 w-8 px-0"
                          onClick={() => onChange({ ...values, [def.id]: clamp(val + step, min, max) })}
                          disabled={readOnly}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 text-white">
      <Section grp="combat" title="Combat" items={groups.combat} />
      <Section grp="magic" title="Magic" items={groups.magic} />
      <Section grp="specialized" title="Specialized" items={groups.specialized} />
    </div>
  );
};
