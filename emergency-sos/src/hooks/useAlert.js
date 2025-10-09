import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAlert, streamOpenAlerts } from '../services/AlertServices';
import { useAuth } from './useAuth';

export function useCreateAlert() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async ({ coords, type = 'general', note = '' }) => {
    setLoading(true);
    setError(null);
    try {
      const id = await createAlert({ user, coords, type, note });
      return id;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return useMemo(() => ({ create, loading, error }), [create, loading, error]);
}

export function useAlertsStream({ max = 50 } = {}) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = streamOpenAlerts((items) => {
      setAlerts(items);
      setLoading(false);
    }, { max });
    return unsubscribe;
  }, [max]);

  return { alerts, loading };
}

