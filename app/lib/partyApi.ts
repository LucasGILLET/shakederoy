import { apiFetch, apiFetchList } from '@/app/lib/api';

export interface PartySession {
  id: string;
  code: string;
  host_id: string;
  name: string | null;
  mode: 'voting' | 'host_picks' | 'random';
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartyParticipant {
  id: string;
  session_id: string;
  user_id: string | null;
  guest_name: string | null;
  prefers_alcoholic: boolean | null;
  max_intensity: number | null;
  created_at: string;
  updated_at: string;
}

export interface PartyParticipantStyle {
  id: string;
  participant_id: string;
  style_id: string;
  created_at: string;
  updated_at: string;
}

export interface PartyCocktailSelection {
  id: string;
  session_id: string;
  cocktail_id: string;
  vote_count: number;
  is_selected: number;
  created_at: string;
  updated_at: string;
}

export interface CocktailStyle {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoredCocktail {
  cocktail_id: string;
  name: string;
  description: string | null;
  is_alcoholic: boolean;
  intensity: number | null;
  difficulty: string | null;
  prep_time: number | null;
  score: number;
}

export interface AggregatedIngredient {
  ingredient_id: string;
  name: string;
  category: string;
  is_alcoholic: boolean;
  cocktail_count: number;
  cocktails: string[];
  quantities: {
    cocktail: string;
    quantity: string | null;
    unit: string | null;
  }[];
}

export interface BarmanView {
  cocktails: {
    id: string;
    name: string;
    description: string | null;
    difficulty: string | null;
    prep_time: number | null;
    ingredients: {
      name: string;
      quantity: string | null;
      unit: string | null;
      notes: string | null;
    }[];
    steps: {
      step_number: number;
      instruction: string;
    }[];
  }[];
  shopping_list: {
    ingredient_id: string;
    name: string;
    category: string;
    is_alcoholic: boolean;
    cocktail_count: number;
    cocktails: string[];
  }[];
}

export function createPartySession(payload: { code: string; name?: string }) {
  return apiFetch<PartySession>('/parties/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getPartySessionById(sessionId: string) {
  return apiFetch<PartySession>(`/parties/${sessionId}`);
}

export function getPartySessionByCode(code: string) {
  return apiFetch<PartySession>(`/parties/code/${encodeURIComponent(code)}`);
}

export function listPartyParticipants(sessionId: string) {
  return apiFetchList<PartyParticipant>(`/parties/${sessionId}/participants`);
}

export function joinPartySession(
  sessionId: string,
  payload: {
    userId?: string;
    guestName?: string;
    prefersAlcoholic?: boolean;
    maxIntensity?: number;
  }
) {
  return apiFetch<PartyParticipant>(`/parties/${sessionId}/participants`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updatePartyParticipant(
  participantId: string,
  payload: {
    guestName?: string;
    prefersAlcoholic?: boolean;
    maxIntensity?: number;
  }
) {
  return apiFetch<PartyParticipant>(`/parties/participants/${participantId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function listParticipantStyles(participantId: string) {
  return apiFetchList<PartyParticipantStyle>(
    `/parties/participants/${participantId}/styles`
  );
}

export function addParticipantStyle(participantId: string, styleId: string) {
  return apiFetch<PartyParticipantStyle>(
    `/parties/participants/${participantId}/styles`,
    {
      method: 'POST',
      body: JSON.stringify({ styleId }),
    }
  );
}

export function removeParticipantStyle(participantStyleId: string) {
  return apiFetch<PartyParticipantStyle>(
    `/parties/participant-styles/${participantStyleId}`,
    {
      method: 'DELETE',
    }
  );
}

export function listPartySelections(sessionId: string) {
  return apiFetchList<PartyCocktailSelection>(`/parties/${sessionId}/selections`);
}

export function listCocktailStyles() {
  return apiFetchList<CocktailStyle>('/cocktails/styles');
}

export function generatePartyRecommendations(sessionId: string, limit = 5) {
  return apiFetch<ScoredCocktail[]>(
    `/parties/${sessionId}/generate?limit=${limit}`,
    {
      method: 'POST',
    }
  );
}

export function getPartyIngredients(sessionId: string) {
  return apiFetchList<AggregatedIngredient>(`/parties/${sessionId}/ingredients`);
}

export function getPartyBarmanView(sessionId: string) {
  return apiFetch<BarmanView>(`/parties/${sessionId}/barman`);
}
