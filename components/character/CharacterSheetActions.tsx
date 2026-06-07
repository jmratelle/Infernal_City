'use client';

import { AlertCircle, CheckCircle2, FolderOpen, RefreshCw, Save, Unplug } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FileBackupStatus, SaveStatus } from '@/hooks/useActiveCharacter';

type CharacterSheetActionsProps = {
  confirmDelete: boolean;
  fileStatus: string | null;
  fileBackupMessage?: string | null;
  fileBackupStatus?: FileBackupStatus;
  isDeleting: boolean;
  onCancelDelete: () => void;
  onChooseFileBackupDirectory?: () => void | Promise<void>;
  onChangeCharacter?: () => void;
  onConfirmDelete: () => void;
  onDeleteClick: () => void;
  onDisconnectFileBackupDirectory?: () => void | Promise<void>;
  onExport: () => void;
  onWriteFileBackupsNow?: () => void | Promise<void>;
  saveStatus: SaveStatus;
};

const saveStatusLabel: Record<SaveStatus, string> = {
  error: 'Save failed',
  idle: 'Ready',
  saved: 'Saved',
  saving: 'Saving...',
};

const fileBackupLabel: Record<FileBackupStatus, string> = {
  error: 'File backup failed',
  'not-configured': 'File backup off',
  'permission-needed': 'File permission needed',
  ready: 'File backup ready',
  saved: 'File backup saved',
  saving: 'Writing backup...',
  unsupported: 'File backup unsupported',
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
  fileBackupMessage,
  fileBackupStatus = 'unsupported',
  isDeleting,
  onCancelDelete,
  onChooseFileBackupDirectory,
  onChangeCharacter,
  onConfirmDelete,
  onDeleteClick,
  onDisconnectFileBackupDirectory,
  onExport,
  onWriteFileBackupsNow,
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
        {fileBackupStatus !== 'unsupported' && (
          <div className="col-span-3 flex flex-col gap-2 border-t border-white/10 pt-3 sm:w-full sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="sheet-chip w-fit">
                <Save className="h-3.5 w-3.5" />
                {fileBackupLabel[fileBackupStatus]}
              </div>
              {fileBackupMessage && <div className="mt-1 text-xs text-white/60">{fileBackupMessage}</div>}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-w-0 px-2 text-xs sm:text-sm"
                disabled={fileBackupStatus === 'saving'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={onChooseFileBackupDirectory}
              >
                <FolderOpen className="h-4 w-4" />
                Folder
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-w-0 px-2 text-xs sm:text-sm"
                disabled={fileBackupStatus === 'saving' || fileBackupStatus === 'not-configured'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={onWriteFileBackupsNow}
              >
                <RefreshCw className="h-4 w-4" />
                Now
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Disconnect file backup folder"
                disabled={fileBackupStatus === 'saving' || fileBackupStatus === 'not-configured'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={onDisconnectFileBackupDirectory}
              >
                <Unplug className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
