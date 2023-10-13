import { Publishable, Subscribable, Unwrappable } from "..";
import { Store } from "../store";

export type Action = {
  [key: string | number | symbol]: (...args: any[]) => any;
};

export type ActionsCreator<T, A extends Action> = (
  unwrap: Unwrappable<T>["unwrap"],
  publish: Publishable<T>["publish"],
  subscribe: Subscribable<T>["subscribe"]
) => A;

export interface Actions<A extends { [key: string]: (...args: any[]) => any }>
  extends Record<string, (...args: any[]) => ReturnType<A[keyof A]>> {}

export function actions<T, A extends Action>(
  store: Store<T>,
  creator: ActionsCreator<T, A>
): Actions<A> {
  const actionHandlers = creator(store.unwrap, store.publish, store.subscribe);
  return actionHandlers as Actions<A>;
}
