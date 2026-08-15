import { ValueTransformer } from 'typeorm';

// Postgres `decimal`/`numeric` columns come back from pg as strings to avoid
// float precision loss. Coerce to a real JS number on read so API responses
// and DTO validation (`@IsNumber()`) see a number, not a string.
export const decimalTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string) => (value === null || value === undefined ? value : parseFloat(value)),
};
