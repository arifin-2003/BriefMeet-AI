import { supabase } from '../lib/supabase';
import { requestBriefing } from './researchClient';

export function generateBriefing(params, onProgress) {
  return requestBriefing(supabase, params, onProgress);
}
