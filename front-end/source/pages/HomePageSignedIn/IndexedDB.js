const DB_NAME = "LostAndFoundDB";
const DB_VERSION = 1;
const STORE_NAME = "reports";

// Initialize DB
export function initDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    }
  };

  request.onerror = () => console.error("IndexedDB error:", request.error);
}

// Add a report
export function addReport(report) {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.add(report);
  };
}


// Get all reports
export function getAllReports(callback) {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onsuccess = () => {
    const db = request.result;
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const getAll = store.getAll();
    getAll.onsuccess = () => callback(getAll.result);
  };
}

export async function addReport(report) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["reports"], "readwrite");
    const store = transaction.objectStore("reports");
    const request = store.add(report);

    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });
}