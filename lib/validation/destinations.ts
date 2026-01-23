import { z } from "zod";

export const addDestinationSchema = z.object({
  cityName: z.string().trim().min(1).max(120),
  countryCode: z.string().trim().min(2).max(2).nullable().optional(),
  lat: z.number().finite().nullable().optional(),
  lng: z.number().finite().nullable().optional(),
  rationaleTags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
});

export type AddDestinationInput = z.infer<typeof addDestinationSchema>;

