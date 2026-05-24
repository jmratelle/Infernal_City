'use client';

import React, { useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ITEM_OPTIONS } from '@/data/items';

export const ItemsTable: React.FC<{
  title: string;
  rows: Array<Record<string, string | number>>;
  onChange: (next: Array<Record<string, string | number>>) => void;
  readOnly?: boolean;
  maxItems?: number;
  currentTotal?: number;
}> = ({ title, rows, onChange, readOnly, maxItems = Infinity, currentTotal = 0 }) => {
  const idBase = useId();

  // Adds a new blank item row
  const addRow = () =>
    onChange([
      ...rows,
      { name: "", type: "", qty: 1, category: "", subcategory: "" },
    ]);

  // Removes an item row by index
  const removeRow = (i: number) =>
    onChange(rows.filter((_, idx) => idx !== i));

  // Helper to patch a specific row
  const patchRow = (i: number, updates: Record<string, string | number>) => {
    const next = [...rows];
    next[i] = { ...next[i], ...updates };
    onChange(next);
  };

  // Numeric clamping utility
  const clamp = (n: number, min = 0, max = 9999) =>
    Math.max(min, Math.min(max, n));

  return (
    <Card className="sheet-card py-0">
      <CardContent className="p-4 text-white">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-white/55">
              {rows.length === 0 ? 'Nothing recorded yet.' : `${rows.length} row${rows.length === 1 ? '' : 's'}`}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={addRow}
            disabled={
              readOnly ||
              (currentTotal ?? 0) >= (maxItems ?? Infinity)
            }
            title={
              (currentTotal ?? 0) >= (maxItems ?? Infinity)
                ? "Inventory is full"
                : undefined
            }
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>

        {/* Table Body */}
        <div className="space-y-2">
          {rows.map((row, i) => {
            const type = String(row.type ?? "");
            const sub = String(row.subcategory ?? "");
            const name = String(row.name ?? "");

            const typeOptions = Object.keys(ITEM_OPTIONS) as (keyof typeof ITEM_OPTIONS)[];
            const subOptions =
              type === "Weapons" || type === "Armor"
                ? (Object.keys(
                    ITEM_OPTIONS[type as "Weapons" | "Armor"]
                  ) as string[])
                : [];
            const itemOptions =
              type === "Weapons" || type === "Armor"
                ? sub && ITEM_OPTIONS[type as "Weapons" | "Armor"][sub as keyof (typeof ITEM_OPTIONS)["Weapons" | "Armor"]]
                : type
                ? ITEM_OPTIONS[type as keyof typeof ITEM_OPTIONS]
                : [];

            return (
            <div
                key={`${idBase}-row-${i}`}
                className="inventory-row sheet-panel flex flex-wrap items-center gap-2 p-2 md:p-3"
              >
                {/* Type Dropdown */}
                <select
                  className="w-32 rounded-md border border-white/20 bg-background px-2 py-1 text-sm text-white"
                  value={
                    typeOptions.includes(type as keyof typeof ITEM_OPTIONS)
                      ? type
                      : "" // default to Select
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      patchRow(i, { type: "Other", subcategory: "", name: "" });
                    } else {
                      patchRow(i, {
                        type: val as keyof typeof ITEM_OPTIONS | "Other",
                        subcategory: "",
                        name: "",
                      });
                    }
                  }}
                  disabled={readOnly}
                >
                  <option value="">Type</option>
                  {typeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>

                {/* Subcategory (for Weapons / Armor) */}
                {subOptions.length > 0 && (
                  <select
                    className="w-32 rounded-md border border-white/20 bg-background px-2 py-1 text-sm text-white"
                    value={
                      subOptions.includes(sub)
                        ? sub
                        : "" // default to Select
                    }

                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        patchRow(i, { subcategory: "Other", name: "" });
                      } else {
                        patchRow(i, { subcategory: val, name: "" });
                      }
                    }}
                    disabled={readOnly}
                  >
                    <option value="">Subtype</option>
                    {subOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                )}

                {/* Item Dropdown */}
                {type && (
                  <>
                    {((type === "Weapons" || type === "Armor") && sub) ||
                    (type !== "Weapons" && type !== "Armor") ? (
                      itemOptions && Array.isArray(itemOptions) && (
                        <select
                          className="w-40 rounded-md border border-white/20 bg-background px-2 py-1 text-sm text-white"
                          value={
                            itemOptions.includes(name)
                              ? name
                              : "" // default to Select
                          }

                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "__OTHER__") {
                              patchRow(i, { name: "" });
                            } else {
                              patchRow(i, { name: val });
                            }
                          }}
                          disabled={readOnly}
                        >
                          <option value="">Item</option>
                          {itemOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                          <option value="__OTHER__">Other</option>
                        </select>
                      )
                    ) : null}
                  </>
                )}

                {/* Custom input (Other item) */}
                {name === "" && (
                  <Input
                    className="w-40 h-8 text-sm px-2"
                    placeholder="Custom item"
                    value={name}
                    onChange={(e) => patchRow(i, { name: e.target.value })}
                    disabled={readOnly}
                  />
                )}

                {/* Qty field */}
                <div className="flex items-center gap-1">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-14 h-8 text-center text-sm"
                    readOnly
                    value={row.qty ?? 1}
                    disabled={readOnly}
                  />
                  <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-9 w-9 text-base"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    patchRow(i, {
                      qty: clamp(Number(row.qty ?? 1) - 1, 0, 99),
                    })
                  }
                  disabled={readOnly}
                >
                  −
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-9 w-9 text-base"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if ((currentTotal ?? 0) < (maxItems ?? Infinity)) {
                      patchRow(i, {
                        qty: clamp(Number(row.qty ?? 1) + 1, 0, 99),
                      });
                    }
                  }}
                  disabled={readOnly || (currentTotal ?? 0) >= (maxItems ?? Infinity)}
                  title={
                    (currentTotal ?? 0) >= (maxItems ?? Infinity)
                      ? "Inventory is full"
                      : undefined
                  }
                >
                  +
                </Button>

                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => removeRow(i)}
                  disabled={readOnly}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}

          {rows.length === 0 && (
            <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/65">
              No items yet. Add equipment, loot, supplies, or custom entries here.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};


