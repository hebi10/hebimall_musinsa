'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EventService } from '@/shared/services/eventService';
import type { Event } from '@/shared/types/event';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  detail: (eventId: string) => [...eventKeys.all, 'detail', eventId] as const,
  participation: (eventId: string, userId: string) => [...eventKeys.all, 'participation', eventId, userId] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => EventService.getEvents(),
    staleTime: 60 * 1000,
  });
}

export function useEventDetail(eventId: string | null) {
  return useQuery({
    queryKey: eventKeys.detail(eventId || ''),
    queryFn: () => EventService.getEventById(eventId!),
    enabled: !!eventId,
    staleTime: 60 * 1000,
  });
}

export function useEventParticipation(eventId: string | null, userId: string | null) {
  return useQuery({
    queryKey: eventKeys.participation(eventId || '', userId || ''),
    queryFn: () => EventService.checkEventParticipation(eventId!, userId!),
    enabled: !!eventId && !!userId,
    staleTime: 60 * 1000,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) =>
      EventService.createEvent(eventData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: Partial<Event> }) =>
      EventService.updateEvent(eventId, eventData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => EventService.deleteEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useToggleEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => EventService.toggleEventStatus(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  });
}

export function useParticipateInEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userName }: { userId: string; userName: string }) =>
      EventService.participateInEvent(eventId, userId, userName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.participation(eventId, variables.userId) });
    },
  });
}

export function useUploadEventImage() {
  return useMutation({
    mutationFn: ({ file, path }: { file: File; path: string }) => EventService.uploadImage(file, path),
  });
}
