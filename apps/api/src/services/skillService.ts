import type { SupabaseClient } from '@supabase/supabase-js';
import { SKILLS, SKILL_RARITY_WEIGHT, getSkillsForType } from '@monster-stride/shared';

export async function grantRandomSkill(
  remnonId: string,
  primaryType: string,
  secondaryType: string | null,
  discoveredFrom: 'hatch' | 'evolution' | 'mission' | 'challenge',
  supabase: SupabaseClient
): Promise<{ skillId: string; skillName: string } | null> {
  // Check current skill count — max 5
  const { data: existingSkills, error: fetchErr } = await supabase
    .from('remnon_skills')
    .select('skill_id')
    .eq('remnon_id', remnonId);

  if (fetchErr) return null;
  if ((existingSkills?.length ?? 0) >= 5) return null;

  const ownedIds = new Set((existingSkills ?? []).map((s: { skill_id: string }) => s.skill_id));

  // Get eligible skills for this remnon's types, excluding already owned
  const eligible = getSkillsForType(primaryType, secondaryType).filter(s => !ownedIds.has(s.id));
  if (eligible.length === 0) return null;

  // Weighted random pick by rarity
  const totalWeight = eligible.reduce((sum, s) => sum + SKILL_RARITY_WEIGHT[s.rarity], 0);
  let rand = Math.random() * totalWeight;
  let picked = eligible[0];
  for (const skill of eligible) {
    rand -= SKILL_RARITY_WEIGHT[skill.rarity];
    if (rand <= 0) { picked = skill; break; }
  }

  const { error: insertErr } = await supabase.from('remnon_skills').insert({
    remnon_id: remnonId,
    skill_id: picked.id,
    charges: picked.maxCharges, // start with full charges
    max_charges: picked.maxCharges,
    discovered_from: discoveredFrom,
  });

  if (insertErr) return null;
  return { skillId: picked.id, skillName: picked.name };
}

export async function replenishCharges(
  remnonId: string,
  distanceKm: number,
  supabase: SupabaseClient
): Promise<void> {
  const { data: skills } = await supabase
    .from('remnon_skills')
    .select('id, skill_id, charges, max_charges')
    .eq('remnon_id', remnonId);

  if (!skills || skills.length === 0) return;

  await Promise.all(
    skills.map(async (row: { id: string; skill_id: string; charges: number; max_charges: number }) => {
      const def = SKILLS.find(s => s.id === row.skill_id);
      if (!def) return;
      const gained = Math.floor(distanceKm / def.kmPerCharge);
      if (gained === 0) return;
      const newCharges = Math.min(row.max_charges, row.charges + gained);
      if (newCharges === row.charges) return;
      await supabase.from('remnon_skills').update({ charges: newCharges }).eq('id', row.id);
    })
  );
}

export async function getSkillsForRemnon(remnonId: string, supabase: SupabaseClient) {
  const { data } = await supabase
    .from('remnon_skills')
    .select('*')
    .eq('remnon_id', remnonId)
    .order('created_at', { ascending: true });
  return data ?? [];
}
