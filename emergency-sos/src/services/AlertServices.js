import { db } from '../config/firebase';
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
} from 'firebase/firestore';

const ALERTS_COLLECTION = 'alerts';

export async function createAlert({ user, coords, type = 'general', note = '', verification = {} }) {
  if (!user) throw new Error('User required');
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    throw new Error('Valid coordinates required');
  }

  const payload = {
    userId: user.uid,
    userEmail: user.email || null,
    role: 'citizen',
    type,
    note,
    status: 'open',
    location: {
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy ?? null,
      lowAccuracy: coords.lowAccuracy ?? false,
    },
    trustScore: 0,
    verification: {
      ...verification,
    },
    // Use client timestamp for immediate local listing; server can still validate if needed
    createdAt: Timestamp.now(),
    claimedAt: null,
    resolvedAt: null,
  };

  const ref = await addDoc(collection(db, ALERTS_COLLECTION), payload);
  return ref.id;
}

export function streamOpenAlerts(callback, { max = 50 } = {}, onError) {
  const q = query(
    collection(db, ALERTS_COLLECTION),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      if (typeof onError === 'function') onError(err);
      // Also log for debugging
      // eslint-disable-next-line no-console
      console.error('streamOpenAlerts error', err);
    }
  );
}

// Stream alerts claimed by a specific responder (most recent claims first)
export function streamResponderClaims(responderUid, callback, { max = 50 } = {}, onError) {
  if (!responderUid) throw new Error('responderUid required');
  // Keep this query simple to avoid composite index requirements; filter status client-side if needed
  const q = query(
    collection(db, ALERTS_COLLECTION),
    where('claimedBy.uid', '==', responderUid),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items.filter((a) => a.status === 'claimed'));
    },
    (err) => {
      if (typeof onError === 'function') onError(err);
      // eslint-disable-next-line no-console
      console.error('streamResponderClaims error', err);
    }
  );
}

// Stream alerts created by a specific user (most recent first)
export function streamUserAlerts(userId, callback, { max = 25 } = {}, onError) {
  if (!userId) throw new Error('userId required');
  const q = query(
    collection(db, ALERTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      if (typeof onError === 'function') onError(err);
      // eslint-disable-next-line no-console
      console.error('streamUserAlerts error', err);
    }
  );
}

// Claim an open alert for a responder
export async function claimAlert({ alertId, responder }) {
  if (!alertId) throw new Error('alertId required');
  if (!responder || !responder.uid) throw new Error('responder required');
  const ref = doc(db, ALERTS_COLLECTION, alertId);
  await updateDoc(ref, {
    status: 'claimed',
    claimedAt: Timestamp.now(),
    claimedBy: {
      uid: responder.uid,
      name: responder.displayName || null,
      email: responder.email || null,
      role: responder.role || null,
    },
  });
}

// Resolve a claimed alert
export async function resolveAlert({ alertId, resolver, notes = '' }) {
  if (!alertId) throw new Error('alertId required');
  if (!resolver || !resolver.uid) throw new Error('resolver required');
  const ref = doc(db, ALERTS_COLLECTION, alertId);
  await updateDoc(ref, {
    status: 'resolved',
    resolvedAt: Timestamp.now(),
    resolvedBy: {
      uid: resolver.uid,
      name: resolver.displayName || null,
      email: resolver.email || null,
      role: resolver.role || null,
    },
    resolutionNotes: notes || null,
  });
}

// Messages (subcollection: alerts/{alertId}/messages)
export function streamAlertMessages(alertId, callback, { max = 200 } = {}, onError) {
  if (!alertId) throw new Error('alertId required');
  const q = query(
    collection(db, ALERTS_COLLECTION, alertId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      if (typeof onError === 'function') onError(err);
      // eslint-disable-next-line no-console
      console.error('streamAlertMessages error', err);
    }
  );
}

export async function sendAlertMessage({ alertId, sender, text, isVoiceMessage = false }) {
  if (!alertId) throw new Error('alertId required');
  if (!sender || !sender.uid) throw new Error('sender required');
  if (!text || !text.trim()) throw new Error('text required');
  const payload = {
    text: text.trim(),
    isVoiceMessage,
    createdAt: Timestamp.now(),
    sender: {
      uid: sender.uid,
      name: sender.displayName || null,
      email: sender.email || null,
      role: sender.role || null,
    },
  };
  await addDoc(collection(db, ALERTS_COLLECTION, alertId, 'messages'), payload);
}

