import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";

export type DictionaryTerm = {
  id?: string;
  term: string;
  definition: string;
  analogy?: string;
  category?: string;
  moduleId?: string;
  lessonId?: string;
  savedAt?: number;
};

export async function saveToDictionary(
  uid: string,
  data: DictionaryTerm & { id?: string }
) {
  const termId = data.id || data.term.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const ref = doc(db, "users", uid, "dictionary", termId);

  // Check if this term is already saved (don't double-count)
  const existing = await getDoc(ref);
  const isNew = !existing.exists();

  await setDoc(
    ref,
    {
      term: data.term,
      definition: data.definition,
      analogy: data.analogy ?? null,
      category: data.category ?? null,
      moduleId: data.moduleId ?? null,
      lessonId: data.lessonId ?? null,
      savedAt: data.savedAt || Date.now(),
    },
    { merge: true }
  );

  // Only update profile stats if this is a new term
  if (isNew) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      termsLearned: increment(1),
      // Keep last 4 recent terms
      recentTerms: arrayUnion(data.term),
    });

    // Trim recentTerms to 4 — fetch + rewrite
    const userSnap = await getDoc(userRef);
    const existing = userSnap.data()?.recentTerms ?? [];
    if (existing.length > 4) {
      await updateDoc(userRef, {
        recentTerms: existing.slice(-4),
      });
    }
  }
}

export async function removeFromDictionary(uid: string, termId: string) {
  const ref = doc(db, "users", uid, "dictionary", termId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    // Decrement termsLearned
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
const currentCount = userSnap.data()?.termsLearned ?? 0;
await updateDoc(userRef, {
  termsLearned: Math.max(0, currentCount - 1),
});
  }
}

export async function isInDictionary(uid: string, termId: string) {
  const ref = doc(db, "users", uid, "dictionary", termId);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function listDictionary(uid: string): Promise<DictionaryTerm[]> {
  const q = query(
    collection(db, "users", uid, "dictionary"),
    orderBy("savedAt", "desc")
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<DictionaryTerm, "id">),
  }));
}