import { db } from '../config/firebase';
import {
  addDoc,
  collection,
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
    createdAt: serverTimestamp(),
    claimedAt: null,
    resolvedAt: null,
  };

  const ref = await addDoc(collection(db, ALERTS_COLLECTION), payload);
  return ref.id;
}

export function streamOpenAlerts(callback, { max = 50 } = {}) {
  const q = query(
    collection(db, ALERTS_COLLECTION),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(max),
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

