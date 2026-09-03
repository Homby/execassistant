import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAssistantPreferences, listCalendarConnections } from "@/lib/assistant.functions";

export function useAssistantPreferences() {
  const fn = useServerFn(getAssistantPreferences);
  return useQuery({
    queryKey: ["assistant-preferences"],
    queryFn: () => fn(),
    staleTime: 60_000,
  });
}

export function useCalendarConnections() {
  const fn = useServerFn(listCalendarConnections);
  return useQuery({
    queryKey: ["calendar-connections"],
    queryFn: () => fn(),
    staleTime: 30_000,
  });
}
