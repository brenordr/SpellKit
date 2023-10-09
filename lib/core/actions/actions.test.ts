import { describe, expect, it } from "bun:test";
import { actions } from "."; // Replace with actual import
import { store } from "../store";

describe("actions", () => {
  it("should allow actions that modify the store", () => {
    const counter = actions(store(0), {
      increment: () => (value) => value + 1,
      decrement: () => (value) => value - 1,
    });

    // // @ts-nocheck
    // const counter = actions(store(0), (get) => ({
    //   increment: () => get().value++,
    //   decrement: () => get().value--,
    // }));

    counter.increment();
    expect(counter.unwrap()).toBe(1);

    counter.decrement();
    expect(counter.unwrap()).toBe(0);
  });

  it("should allow actions with arguments", () => {
    const storeWithActions = actions(store(0), {
      add: (amount: number) => (value) => value + amount,
    });

    storeWithActions.add(5);
    expect(storeWithActions.unwrap()).toBe(5);

    storeWithActions.add(3);
    expect(storeWithActions.unwrap()).toBe(8);
  });

  it("should not affect the original store object", () => {
    const storeWithActions = actions(store(0), {
      increment: () => (value) => value + 1,
    });

    storeWithActions.increment();
    expect(storeWithActions.unwrap()).toBe(1);
    expect(storeWithActions).not.toBe(store);
  });

  it("should support multiple actions", () => {
    const storeWithActions = actions(store(0), {
      increment: () => (value) => value + 1,
      multiply: (factor: number) => (value) => value * factor,
    });

    storeWithActions.increment();
    expect(storeWithActions.unwrap()).toBe(1);

    storeWithActions.multiply(5);
    expect(storeWithActions.unwrap()).toBe(5);
  });
});
