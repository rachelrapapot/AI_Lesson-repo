import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Guards against accidental navigation when there are unsaved changes.
 * Handles browser back/forward via popstate and tab close via beforeunload.
 * Returns a `guardedNavigate` function that shows a confirmation dialog
 * instead of navigating immediately when dirty.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const navigate = useNavigate();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setPendingPath('__back__');
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty]);

  const guardedNavigate = useCallback(
    (path: string) => {
      if (isDirty) {
        setPendingPath(path);
      } else {
        navigate(path);
      }
    },
    [isDirty, navigate]
  );

  const confirmNavigation = useCallback(() => {
    const path = pendingPath;
    setPendingPath(null);
    if (path === '__back__') {
      window.history.go(-2);
    } else if (path) {
      navigate(path);
    }
  }, [pendingPath, navigate]);

  const cancelNavigation = useCallback(() => {
    setPendingPath(null);
  }, []);

  return {
    isBlocked: pendingPath !== null,
    guardedNavigate,
    confirmNavigation,
    cancelNavigation,
  };
}
