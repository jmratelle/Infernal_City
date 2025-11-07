"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SelectableField({
  label,
  value,
  options,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  readOnly?: boolean;
}) {
  // Tracks whether we're showing a freeform input
  const [isCustom, setIsCustom] = useState(false);

  // Sync local state if value isn't in the list
  useEffect(() => {
    setIsCustom(value !== "" && !options.includes(value));
  }, [value, options]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;

    if (val === "__other__") {
      // Keep "Other" selected but show the input field
      setIsCustom(true);
      return; // don't call onChange("") yet
    }

    setIsCustom(false);
    onChange(val);
  };

  return (
    <div className="grid gap-1.5">
      <Label className="text-sm font-medium text-white">{label}</Label>

      {isCustom ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter custom value"
          onBlur={() => {
            if (value.trim() === "") setIsCustom(false);
          }}
          disabled={readOnly}
        />
      ) : (
        <select
          className="rounded-md border border-white/20 bg-background px-3 py-2 text-sm text-white"
          value={options.includes(value) ? value : ""}
          onChange={handleSelectChange}
          disabled={readOnly}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__other__">Other</option>
        </select>
      )}
    </div>
  );
}
