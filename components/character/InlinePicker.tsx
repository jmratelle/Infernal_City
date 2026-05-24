'use client';

import React from 'react';
import clsx from 'clsx';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type InlinePickerProps = {
  /** Main label. You can pass text or JSX. */
  label: React.ReactNode;
  /** Optional suffix (e.g., "for Dwarf") shown inline with the label. */
  labelSuffix?: string;

  /** Current selected value (string). Use "" for none. */
  value: string;
  /** onChange handler. Pass undefined when empty. */
  onChange: (next: string) => void;

  /** Options to render in the <select>. */
  options: string[];
  /** Optional key prefix to keep React keys distinct across pickers. */
  optionKeyPrefix?: string;

  /** Click handlers. */
  onConfirm: () => void;
  onCancel: () => void;

  /** Disable confirm button (e.g., when no selection). */
  confirmDisabled?: boolean;

  /** Optional title for the select. */
  selectTitle?: string;

  /** Custom classes for the outer container. */
  className?: string;

  /** If true, the picker will scroll into view when mounted/toggled. */
  autoScrollIntoView?: boolean;
};

export function InlinePicker({
  label,
  labelSuffix,
  value,
  onChange,
  options,
  optionKeyPrefix = 'opt',
  onConfirm,
  onCancel,
  confirmDisabled,
  selectTitle,
  className,
  autoScrollIntoView = true,
}: InlinePickerProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (autoScrollIntoView && ref.current) {
      ref.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [autoScrollIntoView]);

  return (
    <div
      ref={ref}
      className={clsx(
        'mb-3 grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end',
        'rounded-lg border border-white/10 bg-black/30 p-3',
        className
      )}
    >
      <div className="grid gap-1 md:col-span-2">
        <Label className="text-sm">
          {label} {labelSuffix ? <span className="opacity-80">{labelSuffix}</span> : null}
        </Label>

        <select
          className={clsx(
            'h-10 w-full text-sm px-3 rounded-md',
            'border border-white/20 bg-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
          )}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          title={selectTitle}
        >
          {options.map((n, idx) => (
            <option key={`${optionKeyPrefix}-${idx}-${n}`} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:justify-end">
        <Button
          type="button"
          size="sm"
          className="w-full md:w-auto min-h-[44px]"
          variant="secondary"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onConfirm}
          disabled={!!confirmDisabled}
        >
          Add
        </Button>

        <Button
          type="button"
          size="sm"
          className="w-full md:w-auto min-h-[44px]"
          variant="ghost"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
