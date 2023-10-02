import { useEffect, useRef, useSyncExternalStore } from "react";
import { AsyncStore, SyncStore } from "../core/create/create";

type StoreType<T> = SyncStore<T> | AsyncStore<T>;

export function useStore<T>(state: AsyncStore<T>): [T, boolean];
export function useStore<T>(state: SyncStore<T>): T;

export function useStore<T>(state: StoreType<T>): T | [T, boolean] {
  let isHydrated = useRef(false).current;
  const storeState = useSyncExternalStore(
    state.subscribe,
    state.unwrap,
    state.unwrap
  );

  useEffect(() => {
    if (state.type === "async") {
      state.then(() => {
        isHydrated = true;
      });
    } else {
      isHydrated = true;
    }
  }, [state]);

  return isHydrated ? [storeState, true] : storeState;
}
