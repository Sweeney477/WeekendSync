import type { EventsProvider } from "@/lib/events/types";
import { ticketmasterProvider } from "./ticketmaster";

const registry = new Map<string, EventsProvider>([
  [ticketmasterProvider.providerKey, ticketmasterProvider],
]);

export function getEventsProvider(providerKey: string): EventsProvider | null {
  return registry.get(providerKey) ?? null;
}

export function getDefaultEventsProvider(): EventsProvider {
  const p = registry.get("ticketmaster");
  if (!p) throw new Error("No default events provider configured");
  return p;
}

export { ticketmasterProvider } from "./ticketmaster";
