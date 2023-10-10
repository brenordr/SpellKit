import { Publishable, Subscribable, Unwrappable } from "..";
import { Store } from "../store";

export type Action<T> = (...args: any[]) => any;

export type ActionsCreator<T, A extends { [key: string]: Action<T> }> = (
  unwrap: Unwrappable<T>["unwrap"],
  publish: Publishable<T>["publish"],
  subscribe: Subscribable<T>["subscribe"]
) => A;

export type Actions<T, A extends { [key: string]: Action<T> }> = {
  [K in keyof A]: (...args: Parameters<A[K]>) => any;
};

export function actions<T, A extends { [key: string]: Action<T> }>(
  store: Store<T>,
  creator: ActionsCreator<T, A>
): Actions<T, A> {
  const actionHandlers = creator(store.unwrap, store.publish, store.subscribe);
  const actionHandlersWithPublish: Partial<Actions<T, A>> = {};

  for (const key in actionHandlers) {
    if (Object.prototype.hasOwnProperty.call(actionHandlers, key)) {
      const action = actionHandlers[key];
      actionHandlersWithPublish[key] = (...args: any[]) => {
        action(...args);
      };
    }
  }

  return actionHandlersWithPublish as Actions<T, A>;
}
