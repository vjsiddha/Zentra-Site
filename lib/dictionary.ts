// lib/dictionary.ts
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
  // Use provided id or generate from term
  const termId = data.id || data.term.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const ref = doc(db, "users", uid, "dictionary", termId);
  
  await setDoc(ref, {
    term: data.term,
    definition: data.definition,
    analogy: data.analogy,
    category: data.category,
    moduleId: data.moduleId,
    lessonId: data.lessonId,
    savedAt: data.savedAt || Date.now(),
  }, { merge: true });
}

export async function removeFromDictionary(uid: string, termId: string) {
  const ref = doc(db, "users", uid, "dictionary", termId);
  await deleteDoc(ref);
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
    ...d.data() as Omit<DictionaryTerm, "id"> 
  }));
}