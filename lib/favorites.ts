import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

export async function addFavorite(uid: string, lessonId: string) {
  const ref = doc(db, "users", uid, "favorites", lessonId);
  await setDoc(ref, { lessonId, addedAt: serverTimestamp() }, { merge: true });
}

export async function removeFavorite(uid: string, lessonId: string) {
  const ref = doc(db, "users", uid, "favorites", lessonId);
  await deleteDoc(ref);
}

export function listenToFavorites(
  uid: string,
  cb: (lessonIds: string[]) => void
) {
  const favsRef = collection(db, "users", uid, "favorites");
  const q = query(favsRef, orderBy("addedAt", "desc"));

  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => d.id)); // doc id = lessonId
  });
}