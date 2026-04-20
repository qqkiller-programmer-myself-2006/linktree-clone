import { db } from "./firebase";
import { doc, getDoc, setDoc, increment, collection, getDocs } from "firebase/firestore";

export async function trackClick(linkId: string) {
  try {
    const ref = doc(db, "clicks", linkId);
    await setDoc(ref, { count: increment(1), updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Analytics error:", e);
  }
}

export async function getClickCounts(): Promise<Record<string, number>> {
  try {
    const snap = await getDocs(collection(db, "clicks"));
    const result: Record<string, number> = {};
    snap.forEach(d => { result[d.id] = d.data().count || 0; });
    return result;
  } catch {
    return {};
  }
}

export async function getCount(linkId: string): Promise<number> {
  try {
    const snap = await getDoc(doc(db, "clicks", linkId));
    return snap.exists() ? snap.data().count || 0 : 0;
  } catch {
    return 0;
  }
}
