import { Store } from "../store";

export type Action<T> = (...args: any[]) => T;
export type ActionsCreator<T, A extends { [key: string]: Action<T> }> = (
  unwrap: () => T
) => A;
export type Actions<T, A extends { [key: string]: Action<T> }> = {
  [K in keyof A]: (...args: Parameters<A[K]>) => void;
};

export function actions<T, A extends { [key: string]: Action<T> }>(
  store: Store<T>,
  creator: ActionsCreator<T, A>
): Actions<T, A> {
  const unwrap = () => store.unwrap();

  const actionHandlers = creator(unwrap);

  const actionHandlersWithPublish: Partial<Actions<T, A>> = {};

  for (const key in actionHandlers) {
    if (Object.prototype.hasOwnProperty.call(actionHandlers, key)) {
      const action = actionHandlers[key];
      actionHandlersWithPublish[key] = (...args: any[]) => {
        const newValue = action(...args);
        store.publish(newValue);
      };
    }
  }

  return actionHandlersWithPublish as Actions<T, A>;
}
