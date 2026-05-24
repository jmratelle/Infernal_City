'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VEHICLE_STATS } from '@/data/items';
import { clamp, makeId } from '@/domain/character.helpers';
import type { VehicleEntry } from '@/domain/character.types';

export const VehiclesPanel: React.FC<{
  vehicles: VehicleEntry[];
  onChange: (next: VehicleEntry[]) => void;
  readOnly?: boolean;
}> = ({ vehicles, onChange, readOnly }) => {
  const addVehicle = () =>
    onChange([
      ...vehicles,
      {
        id: makeId("veh"),
        name: "",
        survivability: 0,
        capacity: 0,
        topSpeed: "",
        flying: false,
        size: "",
        notes: "",
      },
    ]);

  const removeVehicle = (id: string) =>
    onChange(vehicles.filter((v) => v.id !== id));

  const patchVehicle = (id: string, p: Partial<VehicleEntry>) =>
    onChange(vehicles.map((v) => (v.id === id ? { ...v, ...p } : v)));

  const allVehicles = React.useMemo(
    () => Object.keys(VEHICLE_STATS) as string[],
    []
  );

  return (
    <Card className="sheet-card py-0">
      <CardContent className="p-4 text-white">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white">Vehicles</div>
            <div className="text-xs text-white/55">{vehicles.length} registered</div>
          </div>
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            size="sm"
            onClick={addVehicle}
            disabled={readOnly}
          >
            <Plus className="mr-1 h-4 w-4" /> Add
          </Button>
        </div>

        <div className="sheet-panel mb-4 p-3 text-xs leading-relaxed text-white/90">
          5.2 vehicle rules: vehicles only take the Critical, Crippled, Burning, Impaled, and Bound conditions.
          Without a garage, storing a vehicle safely between missions costs 500 Goldbacks. Repairs cost 200
          Goldbacks per injury and 2000 Goldbacks per Crippled condition.
        </div>

        <div className="grid grid-cols-1 gap-4">
          {vehicles.map((v) => {
            const base = (VEHICLE_STATS as Record<
              string,
              { type?: string; size?: string; speed?: string; capacity?: number; survivability?: number; notes?: string }
            >)[v.name];

            const vehicleType = base
              ? base.type
              : v.name
              ? v.flying
                ? "Flying"
                : "Ground"
              : "Custom";

            return (
              <div key={v.id} className="sheet-panel p-3">
                <div className="grid gap-2 md:grid-cols-2">
                  {/* Vehicle Model Dropdown */}
                  <div className="grid gap-1">
                    <Label>Vehicle</Label>
                    <select
                      className="rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
                      value={
                        allVehicles.includes(v.name)
                          ? v.name
                          : v.name
                          ? "Other"
                          : ""
                      }
                      onChange={(e) => {
                        const model = e.target.value;
                        if (model === "Other") {
                          patchVehicle(v.id, {
                            name: "",
                            survivability: 0,
                            capacity: 0,
                            topSpeed: "",
                            flying: false,
                            size: "",
                            notes: "",
                          });
                        } else if (VEHICLE_STATS[model]) {
                          const info = VEHICLE_STATS[model] as {
                            type?: string;
                            size?: string;
                            speed?: string;
                            capacity?: number;
                            survivability?: number;
                            notes?: string;
                          };
                          patchVehicle(v.id, {
                            name: model,
                            survivability: info.survivability ?? 0,
                            capacity: info.capacity ?? 0,
                            size: info.size ?? "",
                            topSpeed: info.speed ?? "",
                            flying: info.type === "Flying",
                            notes: info.notes ?? "",
                          });
                        } else {
                          patchVehicle(v.id, { name: model });
                        }
                      }}
                      disabled={readOnly}
                    >
                      <option value="">Select...</option>
                      {allVehicles.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>

                    {/* "Other" custom input */}
                    {(!allVehicles.includes(v.name) && v.name !== "") || v.name === "" ? (
                      <Input
                        className="mt-2"
                        placeholder="Enter custom vehicle name"
                        value={v.name}
                        onChange={(e) =>
                          patchVehicle(v.id, { name: e.target.value })
                        }
                        disabled={readOnly}
                      />
                    ) : null}
                  </div>

                  {/* Passenger Capacity */}
                  <div className="grid gap-1">
                    <Label>Survivability</Label>
                    <Input
                      inputMode="numeric"
                      value={v.survivability ?? 0}
                      onChange={(e) =>
                        patchVehicle(v.id, {
                          survivability: clamp(parseInt(e.target.value || "0", 10), 0, 99),
                        })
                      }
                      disabled={readOnly}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label>Passenger Capacity</Label>
                    <Input
                      inputMode="numeric"
                      value={v.capacity}
                      onChange={(e) =>
                        patchVehicle(v.id, {
                          capacity: clamp(
                            parseInt(e.target.value || "0", 10),
                            0,
                            999
                          ),
                        })
                      }
                      disabled={readOnly}
                    />
                  </div>

                  {/* Top Speed */}
                  <div className="grid gap-1">
                    <Label>Top Speed</Label>
                    <Input
                      value={v.topSpeed}
                      onChange={(e) => patchVehicle(v.id, { topSpeed: e.target.value })}
                      placeholder="e.g., 20 Units/turn"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Type (auto-filled, read-only) */}
                  <div className="grid gap-1">
                    <Label>Type</Label>
                    <Input
                      readOnly
                      value={vehicleType}
                      className="bg-black/40 text-white border-white/10"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Size */}
                  <div className="grid gap-1">
                    <Label>Size</Label>
                    <Input
                      value={v.size}
                      onChange={(e) => patchVehicle(v.id, { size: e.target.value })}
                      placeholder="e.g., 3x4"
                      disabled={readOnly}
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2 grid gap-1">
                    <Label>Notes</Label>
                    <Textarea
                      value={v.notes ?? ""}
                      onChange={(e) => patchVehicle(v.id, { notes: e.target.value })}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVehicle(v.id)}
                    disabled={readOnly}
                    aria-label="Remove vehicle"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            );
          })}

          {vehicles.length === 0 && (
            <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-white/65">
              No vehicles added. Add a vehicle when the crew gets something worth parking.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};




