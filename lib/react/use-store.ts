import { useEffect, useRef, useSyncExternalStore } from "react";
import { AsyncStore, Store } from "../core/create/create";
import { Publishable } from "../core/types";
import { isPromiseLike } from "../core/utils";

type StoreType<T> = Store<T> | AsyncStore<T>;

export function useStore<T>(
  state: Omit<AsyncStore<T>, keyof Publishable<T>>
): [T, boolean];
export function useStore<T>(state: Omit<Store<T>, keyof Publishable<T>>): T;

export function useStore<T>(
  state: Omit<StoreType<T>, keyof Publishable<T>>
): T | [T, boolean] {
  let isHydrated = useRef(false).current;
  const storeState = useSyncExternalStore(
    state.subscribe,
    state.unwrap,
    state.unwrap
  );

  useEffect(() => {
    if (isPromiseLike(state)) {
      state.then(() => {
        isHydrated = true;
      });
    } else {
      isHydrated = true;
    }
  }, [state]);

  return isHydrated ? [storeState, true] : storeState;
}
