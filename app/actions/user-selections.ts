import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

export async function saveUserSelections(email: string, selectedIds: string[]) {
  if (!email) return;
  const ref = doc(collection(db, 'userSelections'), email);
  await setDoc(ref, {
    email,
    selectedBirthdayIds: selectedIds,
    updatedAt: new Date(),
  }, { merge: true });
}

export async function getUserSelections(email: string): Promise<string[]> {
  if (!email) return [];
  const ref = doc(collection(db, 'userSelections'), email);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().selectedBirthdayIds || [];
  }
  return [];
}
