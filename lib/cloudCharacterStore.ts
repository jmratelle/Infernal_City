import type { User } from '@supabase/supabase-js';

import type { Character } from '@/domain/character.types';
import { normalizeCharacter } from '@/domain/character.normalize';
import {
  clearCharacterDeletion,
  deleteCharacter,
  listCharacterDeletions,
  listCharacterSummaries,
  loadCharacter,
  saveCharacter,
} from '@/lib/characterStore';
import { initialAuthRedirectError, isSupabaseConfigured, supabase } from '@/lib/supabase';

type CloudCharacterRow = {
  character_id: string;
  character: Character;
  updated_at: string;
};

type CloudCharacterDeletionRow = {
  character_id: string;
  deleted_at: string;
};

function requireSupabase() {
  if (!supabase) throw new Error('Online storage is not configured.');
  return supabase;
}

async function currentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user ?? null;
}

export async function completeCloudAuthRedirect() {
  if (!supabase || typeof window === 'undefined') return { user: null, message: null };

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);
  const errorDescription =
    initialAuthRedirectError ??
    hashParams.get('error_description') ??
    queryParams.get('error_description');

  if (errorDescription) {
    window.history.replaceState({}, document.title, window.location.pathname);
    return {
      user: null,
      message: errorDescription,
    };
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;

  if (data.session && window.location.hash) {
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
  }

  return {
    user: data.session?.user ?? null,
    message: data.session ? 'Online storage connected on this browser.' : null,
  };
}

export async function sendStorageOtp(email: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window === 'undefined' ? undefined : window.location.origin,
    },
  });
  if (error) throw error;
}

export async function verifyStorageOtp(email: string, token: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data.user ?? data.session?.user ?? null;
}

export function getOtpErrorMessage(error: unknown) {
  const authError = error as { code?: string; message?: string; status?: number };
  const details = `${authError.code ?? ''} ${authError.message ?? ''}`.toLowerCase();

  if (details.includes('over_email_send_rate_limit')) {
    return 'Supabase has reached its email sending limit. The built-in email service may require waiting up to an hour; configure custom SMTP for reliable production sign-ins.';
  }

  if (details.includes('over_request_rate_limit')) {
    return 'Too many sign-in requests came from this connection. Wait a few minutes, then try again.';
  }

  if (authError.status === 429 || details.includes('rate limit')) {
    return 'Sign-in requests are temporarily rate limited. Wait a few minutes, then try again.';
  }

  if (details.includes('redirect') || details.includes('not allowed')) {
    return 'This site address is not authorized for sign-in links. The app owner needs to add it to the Supabase redirect URLs.';
  }

  if (details.includes('otp') || details.includes('token') || details.includes('expired') || authError.status === 403) {
    return 'That sign-in code is invalid or expired. Request a new code and try again.';
  }

  if (details.includes('email') || details.includes('smtp') || details.includes('send')) {
    return 'Supabase could not send the email right now. Wait a few minutes, then try again.';
  }

  return 'Could not complete online storage sign-in. Please wait a moment and try again.';
}

export async function signOutCloudStorage() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getCloudUser() {
  return currentUser();
}

export function onCloudAuthChange(callback: (user: User | null) => void) {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}

export async function saveCloudCharacter(character: Character) {
  const user = await currentUser();
  if (!user || !supabase) return;

  const normalized = normalizeCharacter(character);
  const { data: deletion, error: deletionError } = await supabase
    .from('character_deletions')
    .select('character_id')
    .eq('user_id', user.id)
    .eq('character_id', normalized.id)
    .maybeSingle();
  if (deletionError) throw deletionError;
  if (deletion) return;

  const { error } = await supabase.from('characters').upsert({
    user_id: user.id,
    character_id: normalized.id,
    character: normalized,
    name: normalized.name?.trim() || 'Unnamed Character',
    race: normalized.race || null,
    origin: normalized.origin || null,
    schema_version: normalized.schemaVersion ?? 1,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function deleteCloudCharacter(characterId: string) {
  const user = await currentUser();
  if (!user || !supabase) return;

  const { error: deletionError } = await supabase.from('character_deletions').upsert({
    user_id: user.id,
    character_id: characterId,
    deleted_at: new Date().toISOString(),
  });
  if (deletionError) throw deletionError;

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('user_id', user.id)
    .eq('character_id', characterId);
  if (error) throw error;
}

export async function syncCloudCharacters() {
  const user = await currentUser();
  if (!user || !supabase) return { deleted: 0, downloaded: 0, uploaded: 0 };

  const localDeletions = await listCharacterDeletions();
  for (const deletion of localDeletions) {
    const { error: deletionError } = await supabase.from('character_deletions').upsert({
      user_id: user.id,
      character_id: deletion.id,
      deleted_at: deletion.deletedAt,
    });
    if (deletionError) throw deletionError;

    const { error: characterError } = await supabase
      .from('characters')
      .delete()
      .eq('user_id', user.id)
      .eq('character_id', deletion.id);
    if (characterError) throw characterError;
    await clearCharacterDeletion(deletion.id);
  }

  const [{ data, error }, { data: deletionData, error: deletionsError }] = await Promise.all([
    supabase
      .from('characters')
      .select('character_id, character, updated_at')
      .eq('user_id', user.id),
    supabase
      .from('character_deletions')
      .select('character_id, deleted_at')
      .eq('user_id', user.id),
  ]);
  if (error) throw error;
  if (deletionsError) throw deletionsError;

  const cloudRows = (data ?? []) as CloudCharacterRow[];
  const cloudDeletions = (deletionData ?? []) as CloudCharacterDeletionRow[];
  const deletedIds = new Set(cloudDeletions.map((row) => row.character_id));
  const cloudById = new Map(cloudRows.map((row) => [row.character_id, row]));
  const localSummaries = await listCharacterSummaries();
  const localById = new Map(localSummaries.map((summary) => [summary.id, summary]));
  let deleted = localDeletions.length;
  let downloaded = 0;
  let uploaded = 0;

  if (deletedIds.size > 0) {
    const { error: staleCharactersError } = await supabase
      .from('characters')
      .delete()
      .eq('user_id', user.id)
      .in('character_id', [...deletedIds]);
    if (staleCharactersError) throw staleCharactersError;
  }

  for (const deletion of cloudDeletions) {
    if (!localById.has(deletion.character_id)) continue;
    await deleteCharacter(deletion.character_id, false);
    localById.delete(deletion.character_id);
    deleted += 1;
  }

  for (const row of cloudRows) {
    if (deletedIds.has(row.character_id)) continue;
    const local = localById.get(row.character_id);
    if (!local || new Date(row.updated_at).getTime() > new Date(local.updatedAt).getTime()) {
      await saveCharacter(normalizeCharacter(row.character));
      downloaded += 1;
    }
  }

  for (const summary of localSummaries) {
    if (deletedIds.has(summary.id)) continue;
    const cloud = cloudById.get(summary.id);
    if (!cloud || new Date(summary.updatedAt).getTime() > new Date(cloud.updated_at).getTime()) {
      const character = await loadCharacter(summary.id);
      if (character) {
        await saveCloudCharacter(character);
        uploaded += 1;
      }
    }
  }

  return { deleted, downloaded, uploaded };
}

export { isSupabaseConfigured };
