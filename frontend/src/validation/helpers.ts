import type { z } from 'zod';

export function getFieldError<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  field: keyof T,
  value: unknown,
): string {
  const fieldSchema = schema.shape[field] as unknown as z.ZodTypeAny;
  const result = fieldSchema.safeParse(value);
  return result.success ? '' : result.error.issues[0]?.message ?? '';
}
