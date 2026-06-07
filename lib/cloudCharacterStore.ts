import type { User } from '@supabase/supabase-js';

import type { Character } from '@/domain/character.types';
import { normalizeCharacter } from '@/domain/character.normalize';
import {
  listCharacterSummaries,
  loadCharacter,
  saveCharacter,
} from '@/lib/characterStore';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type CloudCharacterRow = {
  character_id: string;
  character: Character;
  updated_at: string;
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

export async function sendMagicLink(email: string) {
  const client = requireSupabase();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window === 'undefined' ? undefined : window.location.origin,
    },
  });
  if (error) throw error;
}

export function getMagicLinkErrorMessage(error: unknown) {
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

  if (details.includes('email') || details.includes('smtp') || details.includes('send')) {
    return 'Supabase could not send the email right now. Wait a few minutes, then try again.';
  }

  return 'Could not send the sign-in link. Please wait a moment and try again.';
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

  const { error } = await supabase
    .from('characters')
    .delete()
    .eq('user_id', user.id)
    .eq('character_id', characterId);
  if (error) throw error;
}

export async function syncCloudCharacters() {
  const user = await currentUser();
  if (!user || !supabase) return { downloaded: 0, uploaded: 0 };

  const { data, error } = await supabase
    .from('characters')
    .select('character_id, character, updated_at')
    .eq('user_id', user.id);
  if (error) throw error;

  const cloudRows = (data ?? []) as CloudCharacterRow[];
  const cloudById = new Map(cloudRows.map((row) => [row.character_id, row]));
  const localSummaries = await listCharacterSummaries();
  const localById = new Map(localSummaries.map((summary) => [summary.id, summary]));
  let downloaded = 0;
  let uploaded = 0;

  for (const row of cloudRows) {
    const local = localById.get(row.character_id);
    if (!local || new Date(row.updated_at).getTime() > new Date(local.updatedAt).getTime()) {
      await saveCharacter(normalizeCharacter(row.character));
      downloaded += 1;
    }
  }

  for (const summary of localSummaries) {
    const cloud = cloudById.get(summary.id);
    if (!cloud || new Date(summary.updatedAt).getTime() > new Date(cloud.updated_at).getTime()) {
      const character = await loadCharacter(summary.id);
      if (character) {
        await saveCloudCharacter(character);
        uploaded += 1;
      }
    }
  }

  return { downloaded, uploaded };
}

export { isSupabaseConfigured };
