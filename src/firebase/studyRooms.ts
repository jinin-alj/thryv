import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type RoomStatus = "lobby" | "running" | "paused" | "ended";
export type RoomPhase = "FOCUS" | "BREAK" | "LONG_BREAK";

export type RoomDoc = {
  hostUid: string;
  code: string;
  createdAt: Timestamp | null;

  status: RoomStatus;
  phase: RoomPhase;
  phaseEndsAt: Timestamp | null;

  focusSec: number;
  breakSec: number;
  longBreakSec: number;
  cyclesBeforeLongBreak: number;

  focusBlocksDone: number;
};

export type MemberDoc = {
  uid: string;
  displayName: string;
  joinedAt: Timestamp | null;
  lastSeenAt: Timestamp | null;
  ready: boolean;
};

function makeCode(len = 4) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids O/0/I/1 confusion
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function createRoom(params: {
  hostUid: string;
  hostName: string;
  focusSec: number;
  breakSec: number;
  longBreakSec: number;
  cyclesBeforeLongBreak: number;
}) {
  const code = makeCode(4);

  const roomRef = await addDoc(collection(db, "rooms"), {
    hostUid: params.hostUid,
    code,
    createdAt: serverTimestamp(),

    status: "lobby",
    phase: "FOCUS",
    phaseEndsAt: null,

    focusSec: params.focusSec,
    breakSec: params.breakSec,
    longBreakSec: params.longBreakSec,
    cyclesBeforeLongBreak: params.cyclesBeforeLongBreak,

    focusBlocksDone: 0,
  } satisfies Omit<RoomDoc, "createdAt" | "phaseEndsAt"> & {
    createdAt: any;
    phaseEndsAt: any;
  });

  // Add host as member
  await setDoc(doc(db, "rooms", roomRef.id, "members", params.hostUid), {
    uid: params.hostUid,
    displayName: params.hostName,
    joinedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
    ready: true,
  });

  return { roomId: roomRef.id, code };
}

export async function joinRoomByCode(params: {
  code: string;
  uid: string;
  displayName: string;
}) {
  const q = query(
    collection(db, "rooms"),
    where("code", "==", params.code.toUpperCase().trim()),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Room not found. Check the code.");

  const roomDoc = snap.docs[0];
  const roomId = roomDoc.id;

  await setDoc(
    doc(db, "rooms", roomId, "members", params.uid),
    {
      uid: params.uid,
      displayName: params.displayName,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      ready: false,
    },
    { merge: true }
  );

  return { roomId };
}

export function listenRoom(
  roomId: string,
  cb: (room: RoomDoc | null) => void
) {
  return onSnapshot(doc(db, "rooms", roomId), (snap) => {
    if (!snap.exists()) return cb(null);
    cb(snap.data() as RoomDoc);
  });
}

export function listenMembers(
  roomId: string,
  cb: (members: MemberDoc[]) => void
) {
  return onSnapshot(collection(db, "rooms", roomId, "members"), (snap) => {
    const members = snap.docs.map((d) => d.data() as MemberDoc);
    cb(members);
  });
}

export async function setReady(params: {
  roomId: string;
  uid: string;
  ready: boolean;
}) {
  await updateDoc(doc(db, "rooms", params.roomId, "members", params.uid), {
    ready: params.ready,
    lastSeenAt: serverTimestamp(),
  });
}

export async function heartbeat(params: { roomId: string; uid: string }) {
  await updateDoc(doc(db, "rooms", params.roomId, "members", params.uid), {
    lastSeenAt: serverTimestamp(),
  });
}

export async function startSession(params: { roomId: string }) {
  // Start a FOCUS phase now. Clients compute remaining using phaseEndsAt.
  // Firestore doesn't support "serverTimestamp + X" directly, so we use client time.
  // For MVP, this is OK; later you can use Cloud Functions for perfect server time.
  const now = Date.now();
  const roomRef = doc(db, "rooms", params.roomId);

  // We need room config to compute endsAt; simplest is: client reads room then starts.
  // This helper assumes caller already has the room config. We do start in screen with room values.
  // Keep this function for future extension.
  await updateDoc(roomRef, {
    status: "running",
    phase: "FOCUS",
    focusBlocksDone: 0,
    // placeholder; screen will immediately overwrite with real phaseEndsAt
    phaseEndsAt: Timestamp.fromMillis(now + 25 * 60 * 1000),
  });
}

export async function setPhase(params: {
  roomId: string;
  status: RoomStatus;
  phase: RoomPhase;
  phaseEndsAtMs: number;
  focusBlocksDone?: number;
}) {
  const payload: any = {
    status: params.status,
    phase: params.phase,
    phaseEndsAt: Timestamp.fromMillis(params.phaseEndsAtMs),
  };
  if (typeof params.focusBlocksDone === "number") {
    payload.focusBlocksDone = params.focusBlocksDone;
  }

  await updateDoc(doc(db, "rooms", params.roomId), payload);
}

export async function pauseRoom(params: { roomId: string }) {
  await updateDoc(doc(db, "rooms", params.roomId), {
    status: "paused",
    phaseEndsAt: null,
  });
}