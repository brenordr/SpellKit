import { useEffect, useRef, useSyncExternalStore } from "react";
import { Subscribable, Unwrappable } from "../core/types";

type StoreType<T> = Subscribable<T> & Unwrappable<T>;
type StoreWithHydration<T> = StoreType<T> & {
  hydrate: () => void;
  isHydrated: () => boolean;
};

export function useStore<T>(state: StoreWithHydration<T>): [T, boolean];
export function useStore<T>(state: StoreType<T>): T;
export function useStore<T>(
  state: StoreType<T> | StoreWithHydration<T>
): T | [T, boolean] {
  let isHydrated = useRef(false).current;
  const storeState = useSyncExternalStore(
    state.subscribe,
    state.unwrap,
    state.unwrap
  );

  useEffect(() => {
    if ("hydrate" in state && "isHydrated" in state) {
      state.hydrate();
      isHydrated = state.isHydrated();
    }
  }, [state]);

  return "isHydrated" in state ? [storeState, isHydrated] : storeState;
}
