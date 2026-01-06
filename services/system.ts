
import { FileSystemItem, SystemSettings } from '../types';

// --- IndexedDB File System ---
const DB_NAME = 'WebOS_FS_DB';
const DB_VERSION = 1;
const STORE_FILES = 'files';

// Helper to open DB
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const store = db.createObjectStore(STORE_FILES, { keyPath: 'id' });
        store.createIndex('parentId', 'parentId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Kept for compatibility if needed, but internally we use getDB and close it.
export const initDB = getDB;

export const saveFile = async (file: FileSystemItem): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readwrite');
    const store = tx.objectStore(STORE_FILES);
    // Normalize parentId to 'root' if null/undefined to match listFiles logic
    const itemToSave = { ...file, parentId: file.parentId || 'root' };
    
    store.put(itemToSave);
    
    tx.oncomplete = () => {
        db.close();
        resolve();
    };
    tx.onerror = () => {
        db.close();
        reject(tx.error);
    };
  });
};

export const getFile = async (id: string): Promise<FileSystemItem | undefined> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);
    const request = store.get(id);
    
    let result: FileSystemItem | undefined;
    request.onsuccess = () => {
        result = request.result;
    };

    tx.oncomplete = () => {
        db.close();
        resolve(result);
    };
    tx.onerror = () => {
        db.close();
        reject(tx.error);
    };
  });
};

export const deleteFile = async (id: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readwrite');
    const store = tx.objectStore(STORE_FILES);
    store.delete(id);
    
    tx.oncomplete = () => {
        db.close();
        resolve();
    };
    tx.onerror = () => {
        db.close();
        reject(tx.error);
    };
  });
};

export const listFiles = async (parentId: string | null): Promise<FileSystemItem[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const store = tx.objectStore(STORE_FILES);
    const index = store.index('parentId');
    const request = index.getAll(parentId || 'root'); 
    
    let results: FileSystemItem[] = [];
    request.onsuccess = () => {
        results = request.result;
    };

    tx.oncomplete = () => {
        db.close();
        resolve(results);
    };
    tx.onerror = () => {
        db.close();
        reject(tx.error);
    };
  });
};

export const resetDB = async (): Promise<void> => {
  // Deprecated in favor of triggerSystemReset, but kept for direct calls if needed.
  // This version attempts best effort inline deletion.
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_FILES, 'readwrite');
        const store = tx.objectStore(STORE_FILES);
        store.clear().onsuccess = () => resolve();
        tx.onerror = () => reject();
    });
    db.close();
  } catch (e) {
      console.warn("Could not clear store", e);
  }
  
  return new Promise((resolve) => {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
  });
};

// --- Reset Logic ---
const RESET_FLAG = 'webos_reset_pending';

export const triggerSystemReset = () => {
  localStorage.setItem(RESET_FLAG, 'true');
  window.location.reload();
};

export const checkAndPerformReset = async (): Promise<void> => {
  if (localStorage.getItem(RESET_FLAG) === 'true') {
    console.log("System Reset: Performing full wipe...");
    
    // 1. Clear LocalStorage (removes the flag too, ensuring no loops)
    localStorage.clear();

    // 2. Delete IndexedDB
    return new Promise((resolve) => {
       const request = indexedDB.deleteDatabase(DB_NAME);
       
       // Handle success
       request.onsuccess = () => {
           console.log("System Reset: Database deleted successfully.");
           resolve();
       };
       
       // Handle error
       request.onerror = () => {
           console.warn("System Reset: Failed to delete database.");
           resolve();
       };
       
       // Handle blocked (e.g., other tabs open). 
       // We resolve anyway to allow the app to boot fresh, even if DB persists slightly.
       // The localStorage clear usually forces a fresh state for settings at least.
       request.onblocked = () => {
           console.warn("System Reset: Database deletion blocked.");
           resolve();
       };
       
       // Fallback timeout
       setTimeout(() => resolve(), 1000);
    });
  }
  return Promise.resolve();
};

// --- LocalStorage Settings ---
const SETTINGS_KEY = 'webos_settings';
export const DEFAULT_SETTINGS: SystemSettings = {
  darkMode: false,
  wallpaper: null,
  themeColor: '#6750a4',
  userName: 'User',
  clockFormat: '24h',
  fontSize: 'medium',
  animations: true,
};

export const loadSettings = (): SystemSettings => {
  const s = localStorage.getItem(SETTINGS_KEY);
  return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: SystemSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applyTheme(settings);
  window.dispatchEvent(new Event('webos-settings-changed'));
};

// --- Theme Logic ---
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const applyTheme = (settings: SystemSettings) => {
  const root = document.documentElement;
  
  // Dark Mode
  if (settings.darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Font Size
  const sizeMap = { small: '14px', medium: '16px', large: '18px' };
  root.style.fontSize = sizeMap[settings.fontSize] || '16px';

  // Colors
  const rgb = hexToRgb(settings.themeColor);
  if (rgb) {
    const { r, g, b } = rgb;
    
    const setVar = (name: string, r: number, g: number, b: number) => {
      root.style.setProperty(name, `${r} ${g} ${b}`);
    };

    setVar('--color-primary', r, g, b);
    
    if (settings.darkMode) {
        setVar('--color-on-primary', 0, 0, 0);
        setVar('--color-background', 20, 20, 20);
        setVar('--color-surface', 30, 30, 30);
        setVar('--color-surface-variant', 50, 50, 50);
        setVar('--color-on-surface', 240, 240, 240);
        setVar('--color-secondary', r * 0.8, g * 0.8, b * 0.8);
    } else {
        setVar('--color-on-primary', 255, 255, 255);
        setVar('--color-background', 255, 251, 254);
        setVar('--color-surface', 255, 251, 254);
        setVar('--color-surface-variant', 231, 224, 236);
        setVar('--color-on-surface', 28, 27, 31);
        setVar('--color-secondary', r * 0.9, g * 0.9, b * 0.9);
    }
  }
};

// --- Utilities ---
export const generateId = () => Math.random().toString(36).substr(2, 9);
export const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
