import { Store } from "../store";

type Action<T, Args extends any[]> = (...args: Args) => T;
type ActionsCreator<T, A extends { [key: string]: Action<T, any[]> }> = (
  unwrap: () => T
) => A;
type StoreWithActions<T, A> = Store<T> & A;

export function actions<T, A extends { [key: string]: Action<T, any[]> }>(
  store: Store<T>,
  actionsCreator: ActionsCreator<T, A>
): StoreWithActions<T, A> {
  const unwrap = () => store.unwrap();

  const actionHandlers = actionsCreator(unwrap);

  const actionHandlersWithPublish = Object.fromEntries(
    Object.entries(actionHandlers).map(([key, action]) => [
      key,
      (...args: any[]) => {
        const newValue = action(...args);
        store.publish(newValue);
      },
    ])
  );

  return { ...store, ...actionHandlersWithPublish } as StoreWithActions<T, A>;
}
