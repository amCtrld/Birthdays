import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function getAllUserSelections() {
  const snapshot = await getDocs(collection(db, 'userSelections'));
  return snapshot.docs.map(doc => doc.data());
}
