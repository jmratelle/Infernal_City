'use client';

import React, { useId } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { effectiveTallies, formatDate, groupBy } from '@/domain/character.helpers';
import type { AttributeDef, Character, MissionLogEntry } from '@/domain/character.types';

export const NotesPanel: React.FC<{
  notes: string;
  peopleMet: string;
  secrets: string;
  onChange: (patch: Partial<Pick<Character, 'notes' | 'peopleMet' | 'secrets'>>) => void;
  readOnly?: boolean;
}> = ({ notes, peopleMet, secrets, onChange, readOnly }) => {
  const idBase = useId();
  return (
    <div className="grid gap-4">
      <Card className="sheet-card py-0">
        <CardContent className="grid gap-2 p-4 text-white">
          <div>
            <Label htmlFor={`${idBase}-notes`}>Notes</Label>
            <div className="text-xs text-white/55">General notes, goals, clues, and reminders.</div>
          </div>
          <Textarea
            id={`${idBase}-notes`}
            className="min-h-[120px]"
            value={notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="General notes, goals, etc."
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      <Card className="sheet-card py-0">
        <CardContent className="grid gap-2 p-4 text-white">
          <div>
            <Label htmlFor={`${idBase}-people`}>People Met</Label>
            <div className="text-xs text-white/55">Contacts, allies, enemies, and debts owed.</div>
          </div>
          <Textarea
            id={`${idBase}-people`}
            className="min-h-[120px]"
            value={peopleMet}
            onChange={(e) => onChange({ peopleMet: e.target.value })}
            placeholder="Contacts, allies, rivals..."
            disabled={readOnly}
          />
        </CardContent>
      </Card>

      <Card className="sheet-card py-0">
        <CardContent className="grid gap-2 p-4 text-white">
          <div>
            <Label htmlFor={`${idBase}-secrets`}>Secrets</Label>
            <div className="text-xs text-white/55">Hidden agendas, discoveries, and dangerous truths.</div>
          </div>
          <Textarea
            id={`${idBase}-secrets`}
            className="min-h-[120px]"
            value={secrets}
            onChange={(e) => onChange({ secrets: e.target.value })}
            placeholder="Discoveries, hidden agendas..."
            disabled={readOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export const LevelUpPanel: React.FC<{
  defs: AttributeDef[];
  values: Record<string, number>;
  ticked: Record<string, boolean>;
  onToggle: (skillId: string, val: boolean) => void;
  onCommit: () => void;
  history: MissionLogEntry[];
  spent?: Record<string, number>;
  abilityUnlocksAvailable?: number;
  readOnly?: boolean;
}> = ({ defs, values, ticked, onToggle, onCommit, history, spent = {}, abilityUnlocksAvailable = 0, readOnly }) => {
  const totals = effectiveTallies(history || [], spent);
  const groups = groupBy(defs);

  const Section = ({ title, items }: { title: string; items: AttributeDef[] }) => (
    <Card className="sheet-card py-0">
      <CardContent className="p-4 text-white">
        <div className="sheet-kicker mb-3">{title}</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 text-white">
          {items.map((def) => (
            <label
              key={def.id}
              className="flex items-center gap-2 text-sm"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => e.preventDefault()}
            >
              <input
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => e.stopPropagation()}
                type="checkbox"
                className="h-4 w-4 accent-foreground"
                checked={!!ticked[def.id]}
                onChange={(e) => onToggle(def.id, e.target.checked)}
                disabled={readOnly}
                aria-label={`${def.label} current mission`}
              />
              <span>
                {def.label} - Current Mission
                {(totals[def.id] ?? 0) > 0 ? ` (x${totals[def.id]})` : ''}
                {((ticked[def.id] || (totals[def.id] ?? 0) > 0) && (values[def.id] ?? def.min ?? 0))
                  ? ` [Lvl ${values[def.id]}]`
                  : ''}
              </span>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4">
      <Card className="sheet-card py-0">
        <CardContent className="flex items-center justify-between gap-3 p-4 text-white">
          <div>
            <div className="text-sm font-medium text-white">Ability Unlock Markers</div>
            <div className="text-xs text-white/70">
              In 5.2, each successful skill improvement grants one new ability. These no longer come automatically from reaching level 4 or 5.
            </div>
          </div>
          <div className="rounded-full bg-black/40 px-3 py-1 text-sm font-semibold">
            {abilityUnlocksAvailable}
          </div>
        </CardContent>
      </Card>

      <Section title="Combat" items={groups.combat} />
      <Section title="Magic" items={groups.magic} />
      <Section title="Specialized" items={groups.specialized} />

      <div className="flex justify-end gap-2">
        <Button type="button" onMouseDown={(e) => e.preventDefault()} variant="secondary" onClick={onCommit} disabled={readOnly}>
          Commit Mission
        </Button>
      </div>

      <Card className="sheet-card py-0">
        <CardContent className="p-4 text-white">
          <div className="mb-3">
            <div className="text-sm font-medium text-white">Mission History</div>
            <div className="text-xs text-white/55">Committed missions appear here for future advancement.</div>
          </div>
          {history.length === 0 ? (
            <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/65">
              No missions committed yet.
            </div>
          ) : (
            <ol className="space-y-2">
              {history.map((m, idx) => (
                <li key={m.missionId} className="sheet-panel p-3">
                  <div className="text-sm font-medium">
                    Mission {idx + 1} - {formatDate(m.dateISO)}
                  </div>
                  <div className="mt-1 text-xs text-white/65">
                    {m.successes.length} skill(s) marked
                  </div>
                  {m.successes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.successes.map((sid) => (
                        <span key={sid} className="rounded-full bg-black px-2 py-0.5 text-xs">
                          {defs.find((d) => d.id === sid)?.label ?? sid}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
