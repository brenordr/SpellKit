import { describe, expect, it } from "bun:test";
import { actions } from "."; // Replace with actual import
import { store } from "../store";

describe("actions", () => {
  it("should allow actions that modify the store", () => {
    const counter = actions(store(0), (unwrap) => ({
      increment: () => unwrap() + 1,
      decrement: () => unwrap() - 1,
    }));

    counter.increment();
    expect(counter.unwrap()).toBe(1);

    counter.decrement();
    expect(counter.unwrap()).toBe(0);
  });

  it("should allow actions with arguments", () => {
    const storeWithActions = actions(store(0), (unwrap) => ({
      add: (amount: number) => unwrap() + amount,
    }));

    storeWithActions.add(5);
    expect(storeWithActions.unwrap()).toBe(5);

    storeWithActions.add(3);
    expect(storeWithActions.unwrap()).toBe(8);
  });

  it("should not affect the original store object", () => {
    const counter = store(0);

    const storeWithActions = actions(counter, (unwrap) => ({
      increment: () => unwrap() + 1,
    }));

    storeWithActions.increment();
    expect(storeWithActions.unwrap()).toBe(1);
    expect(storeWithActions).not.toBe(counter);
  });

  it("should support multiple actions", () => {
    const storeWithActions = actions(store(0), (unwrap) => ({
      increment: () => unwrap() + 1,
      multiply: (factor: number) => unwrap() * factor,
    }));

    storeWithActions.increment();
    expect(storeWithActions.unwrap()).toBe(1);

    storeWithActions.multiply(5);
    expect(storeWithActions.unwrap()).toBe(5);
  });
});
