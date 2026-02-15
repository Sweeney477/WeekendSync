import { z } from "zod";
import { WEEKEND_TYPES } from "@/lib/events/types";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected yyyy-mm-dd");
const maxWindowDays = 90;

export const weekendTypeSchema = z.enum(WEEKEND_TYPES);
export type WeekendTypeInput = z.infer<typeof weekendTypeSchema>;

export const citySelectionSchema = z.object({
  city: z.string().trim().min(1).max(120),
  stateCode: z.string().trim().max(20).optional(),
  countryCode: z.string().trim().length(2).optional(),
});

export type CitySelectionInput = z.infer<typeof citySelectionSchema>;

export const sportsPreferencesSchema = z
  .object({
    sport: z.string().trim().min(1).max(40).default("baseball"),
    teamQuery: z.string().trim().max(120).optional(),
    dateWindowStart: dateOnly,
    dateWindowEnd: dateOnly,
    timeOfDay: z.enum(["any", "day", "night"]).optional(),
    budgetBand: z.enum(["any", "low", "mid", "high"]).optional(),
    familyFriendly: z.boolean().optional(),
  })
  .refine(
    (d) => {
      const start = new Date(d.dateWindowStart);
      const end = new Date(d.dateWindowEnd);
      if (end < start) return false;
      const days = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
      return days <= maxWindowDays;
    },
    { message: `Date window must be at most ${maxWindowDays} days and end >= start` }
  );

export type SportsPreferencesInput = z.infer<typeof sportsPreferencesSchema>;

/** Application-level preferences_json shape (stored on trip) */
export const preferencesJsonSchema = z.object({
  weekendType: weekendTypeSchema,
  sports: sportsPreferencesSchema.optional(),
});

export type PreferencesJson = z.infer<typeof preferencesJsonSchema>;
