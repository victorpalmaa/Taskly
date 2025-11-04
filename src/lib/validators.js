import { z } from 'zod'

export const CATEGORIES = ["trabalho", "pessoal"]
export const PRIORITIES = ["baixa", "media", "alta"]

export const TaskFormSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  category: z.enum(CATEGORIES),
  priority: z.union([z.enum(PRIORITIES), z.literal('')]).optional(),
})

export const TaskSchema = TaskFormSchema.extend({
  id: z.string(),
  completed: z.boolean(),
  created_date: z.string(),
  updated_date: z.string(),
})

// JSDoc typedefs for editor hints (non-enforced at runtime)
/**
 * @typedef {z.infer<typeof TaskFormSchema>} TaskFormData
 */
/**
 * @typedef {z.infer<typeof TaskSchema>} Task
 */