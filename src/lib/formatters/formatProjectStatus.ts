import { PROJECT_STATUS, type ProjectStatusKey } from '@/lib/constants';
import type { ProjectStatus } from '@/types/project';

/**
 * Returns label, color, code and description for a project status code.
 */
export function formatProjectStatus(status: number): ProjectStatus {
  const key = status as ProjectStatusKey;
  const found = PROJECT_STATUS[key];

  if (found) {
    return {
      code:        key,
      label:       found.label,
      color:       found.color,
      description: found.description,
    };
  }

  return {
    code:        0,
    label:       'Unknown',
    color:       'gray',
    description: 'Unknown status',
  };
}