import { apiClient, apiFetch } from './api-client';
import type { MessageThread, Message, MessagePage } from '../types/models';


export interface SendMessageInput {
  body: string;
}

export interface ListMessagesParams {
  cursor?: string;
  limit?: number;
}

export type SendMessageResult = Message;


export interface ListThreadsInput {
  filter?: 'all' | 'unread' | 'closing_soon';
  cursor?: string | null;
  limit?: number;
}

export interface ListThreadsResult {
  threads: MessageThread[];
  nextCursor: string | null;
}

export const messagingService = {
  async getThread(appointmentId: string): Promise<MessageThread> {
    return apiClient.get<MessageThread>(
      `/appointments/${encodeURIComponent(appointmentId)}/message-thread`,
    );
  },

  async listMessages(
    appointmentId: string,
    params: ListMessagesParams = {},
  ): Promise<MessagePage> {
    const search = new URLSearchParams();
    if (params.cursor) search.set('cursor', params.cursor);
    if (params.limit !== undefined) search.set('limit', String(params.limit));
    const qs = search.toString();
    return apiClient.get<MessagePage>(
      `/appointments/${encodeURIComponent(appointmentId)}/messages${qs ? `?${qs}` : ''}`,
    );
  },

  async sendMessage(
    appointmentId: string,
    input: SendMessageInput,
  ): Promise<Message> {
    return apiClient.post<Message>(
      `/appointments/${encodeURIComponent(appointmentId)}/messages`,
      { body: input.body },
    );
  },
};

export function listThreads(
  input: ListThreadsInput,
  accessToken: string,
  signal?: AbortSignal,
): Promise<ListThreadsResult> {
  const params = new URLSearchParams();
  if (input.filter && input.filter !== 'all') params.set('filter', input.filter);
  if (input.cursor) params.set('cursor', input.cursor);
  if (input.limit) params.set('limit', String(input.limit));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<ListThreadsResult>(`/doctor/messages/threads${qs}`, { accessToken, signal });
}

export function markThreadRead(threadId: string, accessToken: string): Promise<void> {
  return apiFetch<void>(`/message-threads/${threadId}/read`, { method: 'POST', accessToken });
}

export function totalUnread(threads: MessageThread[]): number {
  return threads.reduce((sum, t) => sum + t.unreadCount, 0);
}