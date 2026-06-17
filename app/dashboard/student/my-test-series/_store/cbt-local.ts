export interface CbtQuestionResponse {
  questionId: string;
  selectedOptionIds: string[];
  numericAnswer: string | null;
  timeSpentSeconds: number;
  status: "ANSWERED" | "NOT_ANSWERED" | "MARKED_FOR_REVIEW" | "ANSWERED_AND_MARKED" | "NOT_VISITED";
}

export interface CbtAttemptState {
  attemptId: string;
  responses: Record<string, CbtQuestionResponse>;
  currentQuestionId?: string;
}

const DB_NAME = "crackncet-cbt-db";
const STORE_NAME = "cbt-attempt-state";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported on this platform"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "attemptId" });
      }
    };
  });
}

/**
 * Save CBT attempt state to IndexedDB.
 */
export async function saveCbtLocalState(state: CbtAttemptState): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(state);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to save local CBT state in IndexedDB", err);
  }
}

/**
 * Retrieve CBT attempt state from IndexedDB.
 */
export async function getCbtLocalState(attemptId: string): Promise<CbtAttemptState | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(attemptId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to retrieve local CBT state from IndexedDB", err);
    return null;
  }
}

/**
 * Delete CBT attempt state from IndexedDB.
 */
export async function deleteCbtLocalState(attemptId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(attemptId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to delete local CBT state in IndexedDB", err);
  }
}
