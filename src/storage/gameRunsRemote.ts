import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { GameRun } from "./local";

export async function saveGameRun(uid: string, run: GameRun) {
  const ref = collection(db, "users", uid, "gameRuns");
  await addDoc(ref, {
    ...run,
    createdAt: serverTimestamp(),
  });
}