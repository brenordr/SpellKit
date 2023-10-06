import { describe, expect, it } from "bun:test";
import { actions } from "."; // Replace with actual import
import { create } from "../create";

describe("actions", () => {
  it("should allow actions that modify the store", () => {
    const store = create(0, {
      increment: () => {
        store.publish(store.unwrap() + 1);
      },
      decrement: () => {
        store.publish(store.unwrap() - 1);
      },
    });

    // const storeWithActions = actions(store, {
    //   increment: () => (value) => value + 1,
    //   decrement: () => (value) => value - 1,
    // });

    store.increment();
    expect(store.unwrap()).toBe(1);

    store.decrement();
    expect(store.unwrap()).toBe(0);
  });

  it("should allow actions with arguments", () => {
    const store = create(0);
    const storeWithActions = actions(store, {
      add: (amount: number) => (value) => value + amount,
    });

    storeWithActions.add(5);
    expect(store.unwrap()).toBe(5);

    storeWithActions.add(3);
    expect(store.unwrap()).toBe(8);
  });

  it("should not affect the original store object", () => {
    const store = create(0);
    const storeWithActions = actions(store, {
      increment: () => (value) => value + 1,
    });

    storeWithActions.increment();
    expect(store.unwrap()).toBe(1);
    expect(storeWithActions).not.toBe(store);
  });

  it("should support multiple actions", () => {
    const store = create(0);
    const storeWithActions = actions(store, {
      increment: () => (value) => value + 1,
      multiply: (factor: number) => (value) => value * factor,
    });

    storeWithActions.increment();
    expect(store.unwrap()).toBe(1);

    storeWithActions.multiply(5);
    expect(store.unwrap()).toBe(5);
  });
});
