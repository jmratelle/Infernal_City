"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DICE_OPTIONS = [4, 6, 8, 10, 12];

function rollCryptoDie(sides: number) {
  const max = 2 ** 32;
  const limit = max - (max % sides);
  const array = new Uint32Array(1);

  let value: number;

  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);

  return (value % sides) + 1;
}

export default function DiceRoller() {
  const [selectedDie, setSelectedDie] = React.useState(6);
  const [result, setResult] = React.useState<number | null>(null);
  const [history, setHistory] = React.useState<
    Array<{ die: number; result: number }>
  >([]);

  const rollDie = () => {
    const roll = rollCryptoDie(selectedDie);

    setResult(roll);
    setHistory((prev) =>
      [{ die: selectedDie, result: roll }, ...prev].slice(0, 10)
    );
  };

  return (
    <Card className="shadow-sm bg-red-900">
      <CardContent className="p-4 text-white">
        <div className="mb-4">
          <div className="text-sm font-medium">Dice Roller</div>
          <div className="text-xs text-white/70">
            Choose a die, then roll it.
          </div>
        </div>

        <div className="mb-4 grid gap-2">
          <div className="text-xs font-medium uppercase text-white/70">
            Select Die
          </div>

          <div className="flex flex-wrap gap-2">
            {DICE_OPTIONS.map((sides) => (
              <Button
                key={sides}
                type="button"
                variant={selectedDie === sides ? "secondary" : "default"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSelectedDie(sides)}
              >
                D{sides}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={rollDie}
          >
            Roll D{selectedDie}
          </Button>

          <div className="rounded-xl bg-black/40 px-4 py-2 text-center">
            <div className="text-xs text-white/60">Result</div>
            <div className="text-3xl font-bold">{result ?? "—"}</div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-black/30 p-3">
            <div className="mb-2 text-xs font-medium uppercase text-white/70">
              Recent Rolls
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              {history.map((entry, index) => (
                <span
                  key={`${entry.die}-${entry.result}-${index}`}
                  className="rounded-full bg-black/40 px-3 py-1"
                >
                  D{entry.die}: {entry.result}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}