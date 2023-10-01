import { useEffect, useRef, useSyncExternalStore } from "react";
import { Subscribable, Unwrappable } from "../core/types";

type StoreType<T> = Subscribable<T> & Unwrappable<T> & PromiseLike<T>;

export function useStore<T>(state: StoreType<T>): [T, boolean];
export function useStore<T>(state: StoreType<T>): T;
export function useStore<T>(state: StoreType<T>): T | [T, boolean] {
  let isHydrated = useRef(false).current;
  const storeState = useSyncExternalStore(
    state.subscribe,
    state.unwrap,
    state.unwrap
  );

  useEffect(() => {
    state.then(() => {
      isHydrated = true;
    });
  }, [state]);

  return isHydrated ? [storeState, true] : storeState;
}
