export interface VocabItem {
  key: string;
  de: string;
  en?: string;
  ar?: string;
  article?: 'der' | 'die' | 'das';
  gender?: 'maskulin' | 'feminin' | 'neutrum';
  example_de?: string;
  example_ar?: string;
  world?: string;
}

export interface Quest {
  id: string;
  world: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  reward_xp: number;
}

export interface QuestTask {
  id: string;
  quest_id: string;
  key: string;
  de: string;
  ar?: string;
  gender?: 'maskulin' | 'feminin' | 'neutrum';
}

export interface Dialogue {
  id: string;
  world: string;
  title: string;
  speaker: string;
  avatar?: string;
  reward_xp: number;
  steps?: DialogueStep[];
}

export interface DialogueStep {
  id: string;
  dialogue_id: string;
  step_index: number;
  npc: string;
  npc_ar: string;
  grammar_badge?: string;
  grammar_text?: string;
  grammar_sub?: string;
  choices: Array<{ de: string; ar: string; xp?: number }>;
}

export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  completedQuests: Array<{ questId: string; tasks: string[] }>;
}

export interface AppConfig {
  key: string;
  value: any;
}

export interface ApiError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}
