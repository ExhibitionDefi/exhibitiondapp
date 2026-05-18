import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from './useAuth';

export interface ProjectMetadata {
  projectId:   string;
  website?:    string;
  twitter?:    string;
  whitepaper?: string;
  overview?:   string;
  updatedAt?:  string;
}

interface MetadataResponse {
  success: boolean;
  data:    ProjectMetadata;
}

interface UpdateMetadataPayload {
  website?:    string;
  twitter?:    string;
  whitepaper?: string;
  overview?:   string;
}

export function useProjectMetadata(projectId: string) {
  const { ensureAuth }                      = useAuth();
  const [metadata, setMetadata]             = useState<ProjectMetadata | null>(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [isUpdating, setIsUpdating]         = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  // ── Fetch metadata (public) ───────────────────────
  const fetchMetadata = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ success: boolean; data: ProjectMetadata }>(
        `/api/projects/${projectId}/metadata`
      );
      setMetadata(response.data);
    } catch (err: unknown) {
      // 404 is fine — project just has no metadata yet
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('not found')) {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // ── Update metadata (owner only) ──────────────────
  const updateMetadata = useCallback(async (payload: UpdateMetadataPayload): Promise<boolean> => {
    setIsUpdating(true);
    setError(null);

    try {
      // ensure authenticated before attempting update
      const ok = await ensureAuth();
      if (!ok) {
        setError('Authentication required');
        return false;
      }

      const { data } = await apiClient.post<MetadataResponse>(
        `/api/projects/${projectId}/metadata`,
        payload
      );

      setMetadata(data);
      return true;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update metadata';
      setError(msg);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [projectId, ensureAuth]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return {
    metadata,
    isLoading,
    isUpdating,
    error,
    fetchMetadata,
    updateMetadata,
  };
}