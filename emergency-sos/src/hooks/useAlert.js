import { useCallback, useEffect, useMemo, useState } from 'react';
import { createAlert, streamOpenAlerts, streamUserAlerts, claimAlert, resolveAlert, streamResponderClaims, streamAlertMessages, sendAlertMessage } from '../services/AlertServices';
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
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    const unsubscribe = streamOpenAlerts((items) => {
      setAlerts(items);
      setLoading(false);
    }, { max }, (err) => {
      setError(err);
      setLoading(false);
    });
    return unsubscribe;
  }, [max]);

  return { alerts, loading, error };
}

export function useMyAlertsStream({ max = 25 } = {}) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return undefined;
    }
    const unsubscribe = streamUserAlerts(user.uid, (items) => {
      setAlerts(items);
      setLoading(false);
    }, { max }, (err) => {
      setError(err);
      setLoading(false);
    });
    return unsubscribe;
  }, [user, max]);

  return { alerts, loading, error };
}

export function useMyClaimsStream({ max = 50 } = {}) {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    if (!user) {
      setClaims([]);
      setLoading(false);
      return undefined;
    }
    const unsubscribe = streamResponderClaims(user.uid, (items) => {
      setClaims(items);
      setLoading(false);
    }, { max }, (err) => {
      setError(err);
      setLoading(false);
    });
    return unsubscribe;
  }, [user, max]);

  return { claims, loading, error };
}

export function useClaimAlert() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const claim = useCallback(async (alertId) => {
    setLoading(true);
    setError(null);
    try {
      await claimAlert({ alertId, responder: { uid: user?.uid, displayName: user?.displayName, email: user?.email, role: userRole } });
    } catch (e) {
      setError(e);
      // Surface error so UI can show feedback
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user, userRole]);

  return useMemo(() => ({ claim, loading, error }), [claim, loading, error]);
}

export function useResolveAlert() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolve = useCallback(async (alertId, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      await resolveAlert({ alertId, resolver: { uid: user?.uid, displayName: user?.displayName, email: user?.email, role: userRole }, notes });
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user, userRole]);

  return useMemo(() => ({ resolve, loading, error }), [resolve, loading, error]);
}

export function useAlertMessages(alertId, { max = 200 } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!alertId) return undefined;
    setError(null);
    const unsub = streamAlertMessages(alertId, (items) => {
      setMessages(items);
      setLoading(false);
    }, { max }, (err) => {
      setError(err);
      setLoading(false);
    });
    return unsub;
  }, [alertId, max]);

  return { messages, loading, error };
}

export function useSendAlertMessage(alertId) {
  const { user, userRole } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(async (text) => {
    setSending(true);
    setError(null);
    try {
      await sendAlertMessage({ alertId, sender: { uid: user?.uid, displayName: user?.displayName, email: user?.email, role: userRole }, text });
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setSending(false);
    }
  }, [alertId, user, userRole]);

  return useMemo(() => ({ send, sending, error }), [send, sending, error]);
}

