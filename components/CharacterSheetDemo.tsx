'use client';

import React, { useMemo, useState } from 'react';
import {
  Backpack,
  BookOpenText,
  Castle,
  CheckCircle2,
  CircleAlert,
  Check,
  Dice5,
  Edit3,
  Flame,
  HeartPulse,
  Home,
  ListChecks,
  Save,
  Sparkles,
  Swords,
  X,
  UserRound,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BloodPointsPanel, ConditionsPanel, InjuriesPanel } from "@/components/character/ConditionPanels";
import { HousingPanel } from "@/components/character/HousingPanel";
import { ItemsTable } from "@/components/character/ItemsTable";
import { EquippedGear } from "@/components/character/EquippedGear";
import { ArmorSlotsBox, ArmorTotalsBox } from "@/components/character/ArmorPanels";
import { VehiclesPanel } from "@/components/character/VehiclesPanel";
import { ResourcesPanel } from "@/components/character/ResourcesPanel";
import { LevelUpPanel, NotesPanel } from "@/components/character/NotesAndLevelPanels";
import { AbilitiesPanel } from "@/components/character/AbilitiesPanel";
import { CharacterSheetActions } from "@/components/character/CharacterSheetActions";
import { GoldbacksPanel, GroupedSkillsGrid } from "@/components/character/StatsSections";
import { HomeSummary } from "@/components/character/HomeSummary";
import DiceRoller from "@/components/DiceRoller";
import { useCharacterExport } from "@/hooks/useCharacterExport";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import { DEFAULT_CHARACTER, DEFAULT_REGISTRY, emptyAV } from "@/domain/character.defaults";
import { normalizeCharacter } from "@/domain/character.normalize";
import {
  set,
  sumArmorValues,
} from "@/domain/character.helpers";
import type {
  ArmorSlots,
  Character,
  CharacterSheetProps,
  RaceName,
} from "@/domain/character.types";

const saveStatusLabel = {
  error: 'Save failed',
  idle: 'Ready',
  saved: 'Saved',
  saving: 'Saving...',
} as const;

const navigationItems = [
  { value: 'home', label: 'Home', shortLabel: 'Home', icon: Home },
  { value: 'stats', label: 'Stats', shortLabel: 'Stat', icon: Swords },
  { value: 'abilities', label: 'Abilities', shortLabel: 'Abil', icon: Sparkles },
  { value: 'items', label: 'Items', shortLabel: 'Item', icon: Backpack },
  { value: 'housing', label: 'Housing', shortLabel: 'House', icon: Castle },
  { value: 'conditions', label: 'Conditions', shortLabel: 'Cond', icon: HeartPulse },
  { value: 'notes', label: 'Notes', shortLabel: 'Note', icon: BookOpenText },
  { value: 'levelup', label: 'Level Up', shortLabel: 'Lvl', icon: ListChecks },
  { value: 'dice', label: 'Dice', shortLabel: 'Dice', icon: Dice5 },
] as const;

function HeaderSaveStatus({ status }: { status: CharacterSheetProps['saveStatus'] }) {
  const current = status ?? 'idle';
  const Icon = current === 'error' ? CircleAlert : current === 'saved' ? CheckCircle2 : Save;

  return (
    <div className="sheet-chip">
      <Icon className="h-3.5 w-3.5" />
      {saveStatusLabel[current]}
    </div>
  );
}

/**
 * Infernal City – Character Sheet (Applied Features)
 * - Stats: Identity + Skills + Resources (Generic Rerolls, Specific Rerolls, Goldbacks, Debt list, Recurring Costs list)
 * - Items: Armor slots with per-damage AVs, Accessories (max 4), Weapons as cards (max 2), Inventory, Stash, Vehicles
 * - Housing: Rent Cost, Apartment Tier dropdown, Upgrades list (repeatable)
 * - Conditions: Injuries counter + Condition rows (dropdown, optional Severity (X), Notes)
 * - Notes: Notes, People Met, Secrets
 * - Level Up: Current Mission checklist + Mission History
 */
// ---------- Main Component ----------
export default function CharacterSheetDemo(props: Partial<CharacterSheetProps>) {
  const [tabValue, setTabValue] = useState("home");
  const [draftChar, setDraftChar] = useState<Character>(() => normalizeCharacter(props.initialCharacter ?? DEFAULT_CHARACTER));
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');

  const char = useMemo(
    () => normalizeCharacter(props.value ?? draftChar),
    [props.value, draftChar]
  );
  const onChange = props.onChange ?? setDraftChar;

const { commitMission, toggleCurrentMission } = useMissionProgress({ character: char, onChange });

const registry = useMemo(() => props.registry ?? DEFAULT_REGISTRY, [props.registry]);
const readOnly = props.readOnly ?? false;
const handleDeleteCharacter = async () => {
  setIsDeletingCharacter(true);

  if (props.onDeleteCharacter) {
    await props.onDeleteCharacter();
    return;
  }

  onChange(DEFAULT_CHARACTER);
  setIsDeletingCharacter(false);
  setConfirmDelete(false);
};

const handleArmorChange = React.useCallback(
  (next: ArmorSlots) => {
    onChange(set(char, "armor", next));
  },
  [char, onChange]
);

// track edit state for skills
const [editSkills, setEditSkills] = useState(false);
const [confirmDelete, setConfirmDelete] = useState(false);
const [isDeletingCharacter, setIsDeletingCharacter] = useState(false);

  const {
    exportCharacter,
    fileStatus,
  } = useCharacterExport(char);

// --- Inventory capacity logic ---
const baseMaxItems = 5;
const hasBackpack = (char.accessories ?? []).includes("Backpack");
const hasBelt = (char.accessories ?? []).includes("Utility Belt");
const maxInventory =
  baseMaxItems + (hasBackpack ? 5 : 0) + (hasBelt ? 3 : 0);

// Count total quantity instead of rows
const currentInventoryCount = (char.items ?? []).reduce(
  (sum, item) => sum + Number(item.qty || 0),
  0
);
const equippedArmorTotals = sumArmorValues(char.armor);
const characterTitle = char.name?.trim() || 'Unnamed Character';
const characterSubtitle = [char.race, char.origin].filter(Boolean).join(' / ') || 'Race and origin not set';
const startEditingName = () => {
  setDraftName(char.name ?? '');
  setIsEditingName(true);
};
const cancelEditingName = () => {
  setDraftName('');
  setIsEditingName(false);
};
const saveName = () => {
  onChange(set(char, 'name', draftName.trim()));
  setIsEditingName(false);
};

  return (
    <div className="mx-auto grid w-full max-w-7xl min-w-0 gap-4 overflow-x-hidden p-3 sm:p-4 lg:gap-5 lg:p-6">
      <Card className="min-w-0 overflow-hidden border-amber-200/10 bg-zinc-950/82 py-0 text-white shadow-2xl shadow-black/40 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="border-b border-amber-200/10 bg-gradient-to-r from-red-950/70 via-zinc-950/60 to-black/40 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-1 rounded-md border border-amber-200/15 bg-red-950/70 p-2.5 shadow-inner shadow-black/40">
                  <UserRound className="h-6 w-6 text-amber-100" />
                </div>
                <div className="min-w-0">
                  <div className="sheet-kicker">Infernal City RPG v5.2</div>
                  {isEditingName ? (
                    <div className="mt-1 flex max-w-xl flex-wrap items-center gap-2">
                      <Input
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') saveName();
                          if (event.key === 'Escape') cancelEditingName();
                        }}
                        className="h-10 min-w-0 flex-1 border-amber-200/20 bg-black/35 text-xl font-semibold text-stone-50"
                        aria-label="Character name"
                        autoFocus
                        disabled={readOnly}
                      />
                      <Button
                        type="button"
                        size="icon"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={saveName}
                        disabled={readOnly}
                        aria-label="Save character name"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={cancelEditingName}
                        aria-label="Cancel name edit"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      <h1 className="truncate text-2xl font-semibold tracking-normal text-stone-50 sm:text-3xl">
                        {characterTitle}
                      </h1>
                      {!readOnly && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-stone-300 hover:text-stone-50"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={startEditingName}
                          aria-label="Edit character name"
                          title="Edit character name"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="mt-1 text-sm text-stone-300">{characterSubtitle}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <HeaderSaveStatus status={props.saveStatus} />
                <div className="sheet-chip">
                  <Flame className="h-3.5 w-3.5 text-amber-200" />
                  Sheet Active
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tabValue} onValueChange={setTabValue} className="!grid w-full min-w-0 gap-3 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-4" activationMode="manual" orientation="vertical">
        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <TabsList
            className="
              !grid h-auto w-full min-w-0 grid-cols-9 justify-stretch gap-0.5 whitespace-nowrap rounded-lg
              border border-amber-200/10 bg-zinc-950/76 p-1.5 shadow-xl shadow-black/25 backdrop-blur-md
              [&>button]:shrink-0
              lg:!flex lg:flex-col lg:items-stretch lg:overflow-visible lg:whitespace-normal
            "
          >
            {navigationItems.map(({ value, label, shortLabel, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                aria-label={label}
                className="h-9 min-w-0 px-0 text-[10px] sm:text-xs lg:w-full lg:justify-start lg:px-3 lg:text-sm"
              >
                <Icon className="hidden h-4 w-4 sm:block" />
                <span className="lg:hidden">{shortLabel}</span>
                <span className="hidden lg:inline">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabValue === "stats" && (
            <div className="mt-2 flex justify-end lg:hidden">
              <Button
                type="button"
                variant={editSkills ? "secondary" : "default"}
                size="sm"
                className="border-amber-200/40 bg-gradient-to-b from-red-700/95 via-red-950 to-black text-amber-50 shadow-md shadow-red-950/45 hover:from-red-600/95 hover:via-red-900 hover:to-black"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditSkills(!editSkills)}
              >
                {editSkills ? "Lock Skills" : "Edit Skills"}
              </Button>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-3 hidden items-center justify-between gap-3 lg:flex">
            <div>
              <div className="text-lg font-semibold text-stone-50">
                {navigationItems.find((item) => item.value === tabValue)?.label}
              </div>
            </div>
            {tabValue === "stats" && (
              <Button
                type="button"
                variant={editSkills ? "secondary" : "default"}
                size="sm"
                className="border-amber-200/40 bg-gradient-to-b from-red-700/95 via-red-950 to-black text-amber-50 shadow-md shadow-red-950/45 hover:from-red-600/95 hover:via-red-900 hover:to-black"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setEditSkills(!editSkills)}
              >
                {editSkills ? "Lock Skills" : "Edit Skills"}
              </Button>
            )}
          </div>

        <TabsContent value="home" className="grid gap-4">
          <HomeSummary
            character={char}
            skillDefs={registry.attributes}
            inventoryCount={currentInventoryCount}
            maxInventory={maxInventory}
          />
        </TabsContent>

        {/* Stats */}
        <TabsContent value="stats" className="grid gap-4">
          <GroupedSkillsGrid
            defs={registry.attributes}
            values={char.attributes}
            onChange={(v) => onChange(set(char, 'attributes', v))}
            readOnly={readOnly || !editSkills}
          />

          <ResourcesPanel
            resourceDefs={registry.resources}
            resourceValues={char.resources}
            onChangeResources={(v) => onChange(set(char, 'resources', v))}
            abilities={char.abilities ?? []}
            skillDefs={registry.attributes}
            skillRerolls={char.skillRerolls ?? {}}
            onChangeSkillRerolls={(next) => onChange(set(char, 'skillRerolls', next))}
            debt={char.debt ?? []}
            onChangeDebt={(next) => onChange(set(char, 'debt', next))}
            recurring={char.recurringCosts ?? []}
            onChangeRecurring={(next) => onChange(set(char, 'recurringCosts', next))}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Abilities */}
        <TabsContent value="abilities" className="grid gap-4">
          <AbilitiesPanel
            abilities={char.abilities ?? []}
            abilityUnlocksAvailable={char.abilityUnlocksAvailable ?? 0}
            onChangeAbilityUnlocks={(next) => onChange(set(char, 'abilityUnlocksAvailable', next))}
            skillDefs={registry.attributes}
            raceName={char.race as RaceName | undefined}
            attrValues={char.attributes ?? {}}
            onChange={(nextAbilities, nextAbilityUnlocks) =>
              onChange({
                ...char,
                abilities: nextAbilities,
                abilityUnlocksAvailable: nextAbilityUnlocks ?? (char.abilityUnlocksAvailable ?? 0),
              })
            }
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Items */}
        <TabsContent value="items" className="grid gap-4 text-white">
          <GoldbacksPanel
            value={char}
            onChange={onChange}
            readOnly={readOnly}
          />
          
          <ArmorSlotsBox
            armor={char.armor}
            onChange={handleArmorChange}
            readOnly={readOnly}
          />

          <ArmorTotalsBox
             equipped={equippedArmorTotals}
             modifiers={char.totalArmor ?? emptyAV()}
             onChangeModifiers={(next) => onChange(set(char, 'totalArmor', next))}
             readOnly={readOnly}
          />


          <EquippedGear
            accessories={char.accessories ?? []}
            onChangeAccessories={(next) => onChange(set(char, 'accessories', next))}
            weapons={char.weapons ?? []}
            onChangeWeapons={(next) => onChange(set(char, 'weapons', next))}
            readOnly={readOnly}
          />

          <VehiclesPanel
            vehicles={char.vehicles}
            onChange={(next) => onChange(set(char, 'vehicles', next))}
            readOnly={readOnly}
          />

          <ItemsTable
            title={`Inventory (${currentInventoryCount}/${maxInventory})`}
            rows={char.items}
            onChange={(rows) => onChange(set(char, 'items', rows))}
            readOnly={readOnly}
            maxItems={maxInventory}
            currentTotal={currentInventoryCount}
          />

          <ItemsTable
            title="Stash"
            rows={char.stash ?? []}
            onChange={(rows) => onChange(set(char, 'stash', rows))}
            readOnly={readOnly}
          />
        </TabsContent>

        <HousingPanel
          char={char}
          onChange={onChange}
          readOnly={readOnly}
        />

        {/* Conditions */}
        <TabsContent value="conditions" className="grid gap-4">
          {char.race === 'Demonkin' && (
            <BloodPointsPanel
              bloodPoints={char.bloodPoints ?? 0}
              onChange={(n) => onChange(set(char, 'bloodPoints', n))}
              readOnly={readOnly}
            />
          )}
          <InjuriesPanel
            injuries={char.injuries ?? 0}
            onChange={(n) => onChange(set(char, 'injuries', n))}
            readOnly={readOnly}
          />
          <ConditionsPanel
            entries={char.conditions ?? []}
            onChange={(next) => onChange(set(char, 'conditions', next))}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <NotesPanel
            notes={char.notes ?? ''}
            peopleMet={char.peopleMet ?? ''}
            secrets={char.secrets ?? ''}
            onChange={(patch) => onChange({ ...char, ...patch })}
            readOnly={readOnly}
          />
        </TabsContent>

        {/* Level Up */}
        <TabsContent value="levelup" className="grid gap-4">
          <LevelUpPanel
            defs={registry.attributes}
            values={char.attributes}
            ticked={char.currentMissionSkills ?? {}}
            onToggle={toggleCurrentMission}
            onCommit={commitMission}
            history={char.missionHistory ?? []}
            spent={char.tallySpent ?? {}}
            abilityUnlocksAvailable={char.abilityUnlocksAvailable ?? 0}
            readOnly={readOnly}
          />
        </TabsContent>

        <TabsContent value="dice" className="grid gap-4">
          <DiceRoller />
        </TabsContent>
        </div>
      </Tabs>

      <CharacterSheetActions
        confirmDelete={confirmDelete}
        fileStatus={fileStatus}
        isDeleting={isDeletingCharacter}
        onCancelDelete={() => setConfirmDelete(false)}
        onChangeCharacter={props.onChangeCharacter}
        onConfirmDelete={handleDeleteCharacter}
        onDeleteClick={() => setConfirmDelete(true)}
        onExport={exportCharacter}
        saveStatus={props.saveStatus ?? 'idle'}
      />
    </div>
  );
}
