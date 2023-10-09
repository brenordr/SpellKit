import { useEffect, useRef, useSyncExternalStore } from "react";
import { Publishable } from "../core/@types";
import { Store } from "../core/store";
import { isPromiseLike } from "../core/utils";

type StoreType<T> = Store<T> | Store<T>;

export function useStore<T>(
  state: Omit<Store<T>, keyof Publishable<T>>
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
