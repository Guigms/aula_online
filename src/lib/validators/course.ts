import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(5000),
  category: z.string().trim().min(2).max(60),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  durationMinutes: z.number().int().positive().max(100000),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  objectives: z.string().max(3000).optional(),
  targetAudience: z.string().max(2000).optional(),
  prerequisites: z.string().max(2000).optional(),
  thumbnailUrl: z.string().url().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
