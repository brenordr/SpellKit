import { useSyncExternalStore } from "react";
import { Subscribable, Unwrappable } from "../core/types";

type StoreType<T> = Subscribable<T> & Unwrappable<T>;
type HydratableStoreType<T> = StoreType<T> & {
  isHydrated: () => boolean;
};

export function useStore<T>(state: HydratableStoreType<T>): [T, boolean];
export function useStore<T>(state: StoreType<T>): [T];
export function useStore<T>(
  state: StoreType<T> & Partial<HydratableStoreType<T>>
): [T] | [T, boolean] {
  const storeState = useSyncExternalStore(
    state.subscribe,
    state.unwrap,
    state.unwrap
  );

  if ("isHydrated" in state && typeof state.isHydrated === "function") {
    const isHydrated = state.isHydrated();
    return [storeState, isHydrated];
  }

  return [storeState];
}
