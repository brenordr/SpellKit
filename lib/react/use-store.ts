import { useSyncExternalStore } from "react";
import { Subscribable, Unwrappable } from "../core/types";

type StoreType<T> = Subscribable<T> & Unwrappable<T>;

export function useStore<T>(store: StoreType<T>): T {
  const state = useSyncExternalStore(
    store.subscribe,
    store.unwrap,
    store.unwrap
  );
  return state;
}
