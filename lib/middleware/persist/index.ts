import { Store, StoreLike, create } from "../../core/store";

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;

  // allow store to have an obtional subscribe method so that when store change we notify the storage listener
  subscribe?: (key: string, callback: (state: string) => void) => void;
}

interface PersistOptions<T> {
  /**
   * The key to use when persisting the state.
   */
  key?: string;

  /**
   * The storage to use when persisting the state.
   */
  storage?: Storage;

  /**
   * A function that transforms the state before persisting.
   */
  serialize?: (state: T) => string;

  /**
   * A function that transforms the persisted state before returning.
   */
  deserialize?: (state: string) => T;
}

export function persist<T>(
  store: StoreLike<T>,
  options: PersistOptions<T> = {}
): Store<T> {
  const {
    key = "store",
    storage = LocalStorage(),
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  const asyncStore = create<T>(async () => {
    const value = storage.getItem(key);
    if (value !== null) {
      return deserialize(value);
    }

    return store.unwrap();
  });

  if (storage.subscribe) {
    storage.subscribe(key, (state) => {
      store.publish(deserialize(state));
      asyncStore.publish(deserialize(state));
    });
  }

  return {
    ...asyncStore,
    publish: (newValue: T) => {
      const serializedValue = serialize(newValue);
      storage.setItem(key, serializedValue);
      store.publish(newValue);
    },
    subscribe: (fn) => {
      const unsubscribe = store.subscribe(fn);
      return unsubscribe;
    },
  };
}

export const MemoryStorage = (): Storage => {
  const store: Record<string, string> = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value;
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
};

export const LocalStorage = (): Storage => {
  if (typeof window === "undefined") {
    return MemoryStorage();
  }

  return {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
    subscribe: (key, callback) => {
      addEventListener("storage", (event: StorageEvent) => {
        if (event.key === key) {
          if (event.newValue !== null) {
            return callback(event.newValue);
          }
        }
      });
    },
  };
};

interface SessionStorageOptions {}

export const SessionStorage = (options: SessionStorageOptions): Storage => {
  return {
    getItem: (key) => window.sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
    removeItem: (key) => sessionStorage.removeItem(key),
  };
};

interface CookieStorageOptions {
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
}

export const CookieStorage = (options: CookieStorageOptions): Storage => {
  return {
    getItem: (key) => {
      const value = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`));

      return value ? value.split("=")[1] : null;
    },
    setItem: (key, value) => {
      const cookie = `${key}=${value}; ${
        options.expires ? `expires=${options.expires.toUTCString()}; ` : ""
      }${options.path ? `path=${options.path}; ` : ""}${
        options.domain ? `domain=${options.domain}; ` : ""
      }${options.secure ? `secure; ` : ""}`;

      document.cookie = cookie;
    },
    removeItem: (key) => {
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${
        options.path ? `; path=${options.path}` : ""
      }${options.domain ? `; domain=${options.domain}` : ""}${
        options.secure ? "; secure" : ""
      }`;
    },
  };
};

export const URLQueryStorage = (): Storage => {
  const params = new URLSearchParams(window.location.search);

  return {
    getItem: (key) => params.get(key),
    setItem: (key, value) => {
      params.set(key, value);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    },
    removeItem: (key) => {
      params.delete(key);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    },
  };
};
