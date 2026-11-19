import { env } from '@/lib/env';

let API_BASE: string | undefined;

function getApiBase(): string {
  if (!API_BASE) {
    API_BASE = env.NEXT_PUBLIC_API_URL || '';
  }
  return API_BASE;
}

async function request<T>(
  input: string,
  init?: RequestInit,
  token?: string
): Promise<T> {
  const apiBase = getApiBase();
  const url = apiBase ? `${apiBase}${input}` : input;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: <T>(path: string, init?: RequestInit, token?: string) =>
    request<T>(path, init, token),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token),
};

export const contentApi = {
  getVocab: () => api.get<any[]>('/content/vocab'),
  getQuests: () => api.get<any[]>('/content/quests'),
  getQuestTasks: (id: string) => api.get<any[]>(`/content/quests/${id}/tasks`),
  getDialogue: (world: string) => api.get<any>(`/content/dialogues/${world}`),
  getConfig: () => api.get<any[]>('/content/config'),
};

export const userApi = {
  getMe: (token: string) => api.get<any>('/auth/me', {}, token),
  getProgress: (token: string) => api.get<UserProgress>('/user/progress', {}, token),
  addXP: (userId: string, xp: number, reason?: string, token?: string) =>
    api.post<any>('/user/progress/xp', { userId, xp, reason }, token),
  completeQuestTask: (userId: string, questId: string, taskKey: string, token?: string) =>
    api.post<any>('/user/progress/quest', { userId, questId, taskKey }, token),
};

export const chatApi = {
  sendMessage: (
    body: { npcKey: string; language: 'ar' | 'en'; messages: any[]; gameLocation?: any },
    token?: string
  ) => api.post<any>('/chat', body, token),
};

export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  completedQuests: any[];
}
