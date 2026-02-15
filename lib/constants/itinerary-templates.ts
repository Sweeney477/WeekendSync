export const ITINERARY_TEMPLATES: Record<
  string,
  { name: string; blocks: string[] }
> = {
  "game-day-focus": {
    name: "Game day focus",
    blocks: ["Fri: Travel / check-in", "Sat: Game day", "Sun: Brunch & leave"],
  },
  "explore-and-game": {
    name: "Explore and game",
    blocks: ["Fri: Arrive, dinner", "Sat: Explore city", "Sun: Game and travel"],
  },
  "chill-and-game": {
    name: "Chill and game",
    blocks: ["Fri: Arrive, casual dinner", "Sat: Game", "Sun: Sleep in, leave"],
  },
};
