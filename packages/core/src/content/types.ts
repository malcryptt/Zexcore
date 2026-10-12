import type { FieldDefinition, ContentTypeSchema } from '../db/schema/content_types.js';

export type { FieldDefinition, ContentTypeSchema };

export interface ValidationResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}
