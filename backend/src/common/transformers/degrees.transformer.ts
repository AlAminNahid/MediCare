import { ValueTransformer } from 'typeorm';

export interface Degree {
  degree: string;
  institution: string;
}

// Column used to store a plain comma-separated string (old `simple-array`
// degrees, e.g. "MBBS,MD"). Parse as JSON first (current format); if that
// fails, fall back to treating the raw value as that legacy comma list so
// existing doctors don't hit a crash reading their profile after this change.
export const degreesTransformer: ValueTransformer = {
  to: (value?: Degree[]) => (value ? JSON.stringify(value) : value),
  from: (value?: string): Degree[] | undefined => {
    if (value === null || value === undefined) return value as undefined;
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON — fall through to legacy comma-list parsing
    }
    return value
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((degree) => ({ degree, institution: '' }));
  },
};
