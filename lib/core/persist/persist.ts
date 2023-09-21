import { Store } from "../create/create";

interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface PersistOptions<T> {
  /**
   * The key to use when persisting the state.
   */
  key: string;

  /**
   * The storage to use when persisting the state.
   */
  storage: Storage;

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
  store: Store<T>,
  options: PersistOptions<T>
): Store<T> {
  return store;
}
