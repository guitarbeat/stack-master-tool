import { z } from "zod";

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name must be 50 characters or less")
  .regex(/^[a-zA-Z0-9\s\-']+$/, "Only letters, numbers, spaces, hyphens, and apostrophes");

export const roomCodeSchema = z
  .string()
  .length(6, "Room code must be 6 characters")
  .regex(/^[A-Za-z0-9]+$/, "Only letters and numbers");

export const titleSchema = z
  .string()
  .min(3, "Title must be at least 3 characters")
  .max(100, "Title must be 100 characters or less");
