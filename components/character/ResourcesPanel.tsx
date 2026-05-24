'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clamp, formatDate, makeId } from '@/domain/character.helpers';
import type { AbilityEntry, AttributeDef, DebtEntry, PaymentEvent, RecurringCostEntry, RecurringFrequency, ResourceDef, SkillGroup } from '@/domain/character.types';

const SKILL_REROLL_MIN = 0;
const SKILL_REROLL_MAX = 5;

export const ResourcesPanel: React.FC<{
  resourceDefs: ResourceDef[];
  resourceValues: Record<string, number>;
  onChangeResources: (next: Record<string, number>) => void;
  abilities: AbilityEntry[];
  skillDefs: AttributeDef[];
  skillRerolls: Record<string, number>;
  onChangeSkillRerolls: (next: Record<string, number>) => void;
  debt: DebtEntry[];
  onChangeDebt: (next: DebtEntry[]) => void;
  recurring: RecurringCostEntry[];
  onChangeRecurring: (next: RecurringCostEntry[]) => void;
  readOnly?: boolean;
}> = ({
  resourceDefs,
  resourceValues,
  onChangeResources,
  abilities,
  skillDefs,
  skillRerolls,
  onChangeSkillRerolls,
  debt,
  onChangeDebt,
  recurring,
  onChangeRecurring,
  readOnly,
}) => {
  const expertiseAbilities = (abilities ?? []).filter(
    (ability) => ability.kind === 'general' && ability.name === 'Expertise' && ability.linkedSkillId
  );
  const expertiseSkillIds = Array.from(new Set(expertiseAbilities.map((ability) => ability.linkedSkillId!)));
  const expertiseDefs = expertiseSkillIds
    .map((id) => skillDefs.find((def) => def.id === id))
    .filter((def): def is AttributeDef => Boolean(def));
  const addDebt = () =>
    onChangeDebt([...(debt || []), { id: makeId('debt'), creditor: '', amount: 0 }]);
  /*const removeDebt = (id: string) =>
    onChangeDebt((debt || []).filter((d) => d.id !== id));*/ //Commented this out as it in unused currently. Leaving in case I want it again

  const addRecurring = () =>
    onChangeRecurring([
      ...(recurring || []),
      { id: makeId('rc'), name: '', amount: 0, frequency: 'Monthly' },
    ]);
  /*const removeRecurring = (id: string) =>
    onChangeRecurring((recurring || []).filter((r) => r.id !== id));*/ //Commented this out as it in unused currently. Leaving in case I want it again

  return (
    <div className="grid gap-4">
      {/* Global resources */}
      <Card className="sheet-card py-0">
        <CardContent className="p-4 text-white">
          <div className="sheet-kicker mb-3">Resources</div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 justify-center">
            {resourceDefs.map((def) => {
              const min = def.min ?? 0;
              const max = def.max ?? 9;
              const val = resourceValues[def.id] ?? min;
              return (
                <div key={def.id} className="sheet-panel grid items-center gap-2 p-3">
                <Label htmlFor={`res-${def.id}`}>{def.label}</Label>
                <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              id={`res-${def.id}`}
              value={val}
              min={min}
              max={max}
              step={1}
              readOnly   // ← prevent typing
              className="w-15"
              disabled={readOnly}
              aria-label={`${def.label} value`}
            />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const min = def.min ?? 0;
                      const max = def.max ?? 9;
                      const cur = resourceValues[def.id] ?? min;
                      onChangeResources({ ...resourceValues, [def.id]: clamp(cur - 1, min, max) });
                    }}
                    disabled={readOnly}
                    aria-label={`${def.label} decrement`}
                  >
                    −
                  </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const min = def.min ?? 0;
                const max = def.max ?? 9;
                const cur = resourceValues[def.id] ?? min;
                onChangeResources({ ...resourceValues, [def.id]: clamp(cur + 1, min, max) });
              }}
              disabled={readOnly}
              aria-label={`${def.label} increment`}
            >
              +
            </Button>
          </div>
        </div>
              );
            })}
          </div>

      {/* Per-skill rerolls */}
          {expertiseDefs.length > 0 && (
            <>
              <div className="mt-4">
                <div className="text-sm font-medium text-white">Specific Rerolls</div>
                <div className="mt-1 text-xs leading-relaxed text-white/70">
                  These only appear for skills selected by the Expertise ability. Set them manually at the start of each
                  mission to match the chosen skill&apos;s current level.
                </div>
              </div>
              {(['combat', 'magic', 'specialized'] as SkillGroup[]).map((grp) => {
                const skills = expertiseDefs.filter((def) => def.group === grp);
                if (skills.length === 0) return null;
            const title = grp === 'combat' ? 'Combat' : grp === 'magic' ? 'Magic' : 'Specialized';
            return (
              <div key={grp} className="mb-3">
                <div className="mb-1 text-xs font-medium text-white">{title}</div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 text-white">
                  {skills.map((def) => {
                    const cur = clamp(
                      skillRerolls[def.id] ?? 0,
                      SKILL_REROLL_MIN,
                      SKILL_REROLL_MAX
                    );
                    return (
                      <div key={def.id} className="grid items-start gap-1.5">
                        <Label htmlFor={`reroll-${def.id}`} className="text-xs">
                          {def.label} Specific Rerolls
                        </Label>
                        <div className="flex items-center gap-2">

                          <Input
                            id={`reroll-${def.id}`}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-15"
                            value={cur}
                            min={SKILL_REROLL_MIN}
                            max={SKILL_REROLL_MAX}
                            readOnly  // ← prevent typing
                            disabled={readOnly}
                            aria-label={`${def.label} rerolls value`}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const cur = clamp(skillRerolls[def.id] ?? 0, SKILL_REROLL_MIN, SKILL_REROLL_MAX);
                              onChangeSkillRerolls({ ...skillRerolls, [def.id]: clamp(cur - 1, SKILL_REROLL_MIN, SKILL_REROLL_MAX) });
                            }}
                            disabled={readOnly}
                            aria-label={`${def.label} rerolls decrement`}
                          >
                            −
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              const cur = clamp(skillRerolls[def.id] ?? 0, SKILL_REROLL_MIN, SKILL_REROLL_MAX);
                              onChangeSkillRerolls({ ...skillRerolls, [def.id]: clamp(cur + 1, SKILL_REROLL_MIN, SKILL_REROLL_MAX) });
                            }}
                            disabled={readOnly}
                            aria-label={`${def.label} rerolls increment`}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Debt & Recurring Costs */}
      <Card className="sheet-card py-0">
        <CardContent className="p-4 space-y-4 text-white">
          <div>
            <div className="sheet-kicker mb-3">Debt</div>
            <div className="space-y-2">
              {(debt || []).map((d, i) => (
                <div key={d.id} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <Input
                    className="sm:col-span-5"
                    placeholder="Creditor"
                    value={d.creditor}
                    onChange={(e) => {
                      const next = [...(debt || [])];
                      next[i] = { ...d, creditor: e.target.value };
                      onChangeDebt(next);
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    className="sm:col-span-3"
                    placeholder="Amount (GB)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(d.amount ?? 0)}
                    onChange={(e) => {
                      const next = [...(debt || [])];
                      next[i] = {
                        ...d,
                        amount: clamp(parseInt(e.target.value || '0', 10), 0, 999999),
                      };
                      onChangeDebt(next);
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    className="sm:col-span-3"
                    placeholder="Notes/Terms"
                    value={d.notes ?? ''}
                    onChange={(e) => {
                      const next = [...(debt || [])];
                      next[i] = { ...d, notes: e.target.value };
                      onChangeDebt(next);
                    }}
                    disabled={readOnly}
                  />
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="ghost"
                      size="icon"
                      onClick={() => onChangeDebt((debt || []).filter((x) => x.id !== d.id))}
                      disabled={readOnly}
                      aria-label="Remove debt"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onMouseDown={(e) => e.preventDefault()} size="sm" onClick={addDebt} disabled={readOnly}>
                <Plus className="mr-1 h-4 w-4" /> Add Debt
              </Button>
            </div>
          </div>

          <div>
            <div className="sheet-kicker mb-3">Recurring Costs & Diet</div>
            <div className="space-y-2">
              {(recurring || []).map((r, i) => (
                <div key={r.id} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <Input
                    className="sm:col-span-4"
                    placeholder="Name"
                    value={r.name}
                    onChange={(e) => {
                      const next = [...(recurring || [])];
                      next[i] = { ...r, name: e.target.value };
                      onChangeRecurring(next);
                    }}
                    disabled={readOnly}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Amount (GB)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={String(r.amount ?? 0)}
                    onChange={(e) => {
                      const next = [...(recurring || [])];
                      next[i] = {
                        ...r,
                        amount: clamp(parseInt(e.target.value || '0', 10), 0, 999999),
                      };
                      onChangeRecurring(next);
                    }}
                    disabled={readOnly}
                  />
                  <select
                    className="sm:col-span-3 rounded-md border bg-background px-3 py-2 text-sm"
                    value={r.frequency}
                    onChange={(e) => {
                      const next = [...(recurring || [])];
                      next[i] = { ...r, frequency: e.target.value as RecurringFrequency };
                      onChangeRecurring(next);
                    }}
                    disabled={readOnly}
                  >
                    <option value="Per-mission">Per mission</option>
                    <option value="Every other mission">Every other mission</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  <div className="md:col-span-5">
</div>

                  {/* Log Payment + last paid display */}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        const next = [...(recurring || [])];
                        const ev: PaymentEvent = {
                          paidAtISO: new Date().toISOString(),
                          amount: r.amount ?? 0,
                          note: r.notes ?? '',
                        };
                        next[i] = {
                          ...r,
                          lastPaidISO: ev.paidAtISO,
                          history: [ ...(r.history ?? []), ev ],
                        };
                        onChangeRecurring(next);
                      }}
                      disabled={readOnly}
                    >
                      Log Payment
                    </Button>
                    <span className="text-xs text-white/80">
                      {r.lastPaidISO ? `Last paid: ${formatDate(r.lastPaidISO)}` : 'Not paid yet'}
                    </span>
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <Button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      variant="ghost"
                      size="icon"
                      onClick={() => onChangeRecurring((recurring || []).filter((x) => x.id !== r.id))}
                      disabled={readOnly}
                      aria-label="Remove recurring"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onMouseDown={(e) => e.preventDefault()} size="sm" onClick={addRecurring} disabled={readOnly}>
                <Plus className="mr-1 h-4 w-4" /> Add Recurring
              </Button>
              {/* Payment History (per recurring item) */}
              {(recurring || []).some((r) => (r.history?.length ?? 0) > 0) && (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-medium text-white">Payment History</div>
                  <ol className="space-y-2">
                    {(recurring || []).map((r) => (
                      (r.history?.length ?? 0) > 0 && (
                        <li key={r.id} className="sheet-panel p-3">
                          <div className="text-sm font-medium">{r.name || 'Untitled Cost'}</div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/80">
                            {(r.history ?? []).map((ev, idx) => (
                              <span key={`${r.id}-${idx}`} className="rounded-full bg-black/40 px-2 py-0.5">
                                {formatDate(ev.paidAtISO)} — {ev.amount} GB
                              </span>
                            ))}
                          </div>
                        </li>
                      )
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

