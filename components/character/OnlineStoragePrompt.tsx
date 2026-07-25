'use client';

import { useState } from 'react';
import { Cloud, HardDrive, ShieldCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type OnlineStoragePromptProps = {
  isSending?: boolean;
  isVerifying?: boolean;
  message?: string | null;
  onClose: () => void;
  onContinueDeviceOnly: () => void;
  onUseOnlineStorage: (email: string) => boolean | Promise<boolean>;
  onVerifyCode: (email: string, code: string) => boolean | Promise<boolean>;
};

export function OnlineStoragePrompt({
  isSending = false,
  isVerifying = false,
  message = null,
  onClose,
  onContinueDeviceOnly,
  onUseOnlineStorage,
  onVerifyCode,
}: OnlineStoragePromptProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSentTo, setCodeSentTo] = useState<string | null>(null);
  const isBusy = isSending || isVerifying;

  const sendCode = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;

    const sent = await onUseOnlineStorage(normalizedEmail);
    if (sent) {
      setCodeSentTo(normalizedEmail);
      setCode('');
    }
  };

  const verifyCode = async () => {
    if (!codeSentTo || !code.trim()) return;

    const verified = await onVerifyCode(codeSentTo, code.trim());
    if (verified) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4">
      <Card
        className="w-full max-w-xl border-white/10 bg-black text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="online-storage-title"
      >
        <CardContent className="grid gap-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-red-300/20 bg-red-950/60 p-2">
                <Cloud className="h-5 w-5" />
              </div>
              <div>
                <div id="online-storage-title" className="text-lg font-semibold">
                  Protect your characters with online storage?
                </div>
                <div className="mt-1 text-sm text-white/70">
                  Online storage prevents your characters from being lost if you change devices,
                  clear this site&apos;s data, or lose access to this browser.
                </div>
              </div>
            </div>
            <Button type="button" size="icon" variant="ghost" aria-label="Close online storage prompt" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="h-4 w-4" />
                Online storage
              </div>
              <div className="mt-2 text-sm text-white/65">
                Keeps your characters outside this browser and available after you sign in.
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 font-medium">
                <HardDrive className="h-4 w-4" />
                This device only
              </div>
              <div className="mt-2 text-sm text-white/65">
                No sign-in required, but clearing site data or losing this device can erase your
                characters.
              </div>
            </div>
          </div>

          <div className="text-sm text-white/70">
            Enter your email and we&apos;ll send a secure sign-in code. Online storage is optional,
            and you can enable it later.
          </div>

          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="border-white/15 bg-black/30 text-white"
            disabled={isBusy || Boolean(codeSentTo)}
            aria-label="Email address for online storage"
          />

          {codeSentTo && (
            <div className="grid gap-3">
              <div className="rounded-md border border-amber-200/15 bg-amber-950/25 p-3 text-xs text-white/70">
                Check {codeSentTo} for the one-time code, then enter it here. This keeps the
                sign-in connected to this app window.
              </div>
              <Input
                inputMode="numeric"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                className="border-white/15 bg-black/30 text-white"
                disabled={isBusy}
                aria-label="Online storage sign-in code"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void verifyCode();
                }}
              />
            </div>
          )}

          {message && (
            <div className="rounded-md border border-amber-200/15 bg-amber-950/25 p-3 text-xs text-white/75">
              {message}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onContinueDeviceOnly} disabled={isBusy}>
              Continue on This Device
            </Button>
            {codeSentTo ? (
              <>
                <Button type="button" variant="ghost" disabled={isBusy} onClick={() => setCodeSentTo(null)}>
                  Change Email
                </Button>
                <Button type="button" disabled={isBusy || !code.trim()} onClick={verifyCode}>
                  <ShieldCheck className="h-4 w-4" />
                  {isVerifying ? 'Verifying...' : 'Verify Code'}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                disabled={isBusy || !email.trim()}
                onClick={sendCode}
              >
                <Cloud className="h-4 w-4" />
                {isSending ? 'Sending Code...' : 'Send Sign-in Code'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
