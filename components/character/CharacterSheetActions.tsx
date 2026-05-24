'use client';

import { AlertCircle, CheckCircle2, Save } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SaveStatus } from '@/hooks/useActiveCharacter';

type CharacterSheetActionsProps = {
  confirmDelete: boolean;
  fileStatus: string | null;
  isDeleting: boolean;
  onCancelDelete: () => void;
  onChangeCharacter?: () => void;
  onConfirmDelete: () => void;
  onDeleteClick: () => void;
  onExport: () => void;
  saveStatus: SaveStatus;
};

const saveStatusLabel: Record<SaveStatus, string> = {
  error: 'Save failed',
  idle: 'Ready',
  saved: 'Saved',
  saving: 'Saving...',
};

function SaveStatusBadge({ status }: { status: SaveStatus }) {
  const Icon = status === 'error' ? AlertCircle : status === 'saved' ? CheckCircle2 : Save;

  return (
    <div className="sheet-chip col-span-3 w-fit sm:mr-auto">
      <Icon className="h-3.5 w-3.5" />
      {saveStatusLabel[status]}
    </div>
  );
}

export function CharacterSheetActions({
  confirmDelete,
  fileStatus,
  isDeleting,
  onCancelDelete,
  onChangeCharacter,
  onConfirmDelete,
  onDeleteClick,
  onExport,
  saveStatus,
}: CharacterSheetActionsProps) {
  return (
    <Card className="sheet-card mt-4 py-0">
      <CardContent className="grid grid-cols-3 items-center gap-2 p-3 sm:flex sm:flex-wrap sm:p-4">
        <SaveStatusBadge status={saveStatus} />

        <Button
          type="button"
          className="w-full min-w-0 px-1 text-xs sm:w-auto sm:px-4 sm:text-sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onExport}
        >
          <span className="sm:hidden">Export</span>
          <span className="hidden sm:inline">Export Character</span>
        </Button>

        {onChangeCharacter && (
          <Button
            type="button"
            variant="secondary"
            className="w-full min-w-0 px-1 text-xs sm:w-auto sm:px-4 sm:text-sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onChangeCharacter}
          >
            <span className="sm:hidden">Change</span>
            <span className="hidden sm:inline">Change Character</span>
          </Button>
        )}

        {confirmDelete ? (
          <>
            <Button
              type="button"
              variant="destructive"
              className="w-full min-w-0 px-1 text-xs sm:w-auto sm:px-4 sm:text-sm"
              disabled={isDeleting}
              onMouseDown={(event) => event.preventDefault()}
              onClick={onConfirmDelete}
            >
              {isDeleting ? 'Deleting...' : (
                <>
                  <span className="sm:hidden">Confirm</span>
                  <span className="hidden sm:inline">Confirm Delete Character</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full min-w-0 px-1 text-xs sm:w-auto sm:px-4 sm:text-sm"
              disabled={isDeleting}
              onMouseDown={(event) => event.preventDefault()}
              onClick={onCancelDelete}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="destructive"
            className="w-full min-w-0 px-1 text-xs sm:w-auto sm:px-4 sm:text-sm"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onDeleteClick}
          >
            <span className="sm:hidden">Delete</span>
            <span className="hidden sm:inline">Delete Character</span>
          </Button>
        )}

        {fileStatus && <div className="col-span-3 text-sm text-white/75 sm:w-full">{fileStatus}</div>}
      </CardContent>
    </Card>
  );
}
