import { describe, expect, it } from "bun:test";
import { actions } from "."; // Replace with actual import
import { store } from "../store";

describe("actions", () => {
  it("should allow actions that modify the store", () => {
    const counter = store(0);

    const counterActions = actions(counter, (unwrap) => ({
      increment: () => unwrap() + 1,
      decrement: () => unwrap() - 1,
    }));

    counterActions.increment();
    expect(counter.unwrap()).toBe(1);

    counterActions.decrement();
    expect(counter.unwrap()).toBe(0);
  });

  it("should allow actions with arguments", async () => {
    const counter = store(0);

    const counterActions = actions(counter, (unwrap) => ({
      add: (amount: number) => unwrap() + amount,
    }));

    counterActions.add(5);
    expect(counter.unwrap()).toBe(5);

    counterActions.add(3);
    expect(counter.unwrap()).toBe(8);
  });

  it("should not affect the original store object", () => {
    const counter = store(0);

    const counterActions = actions(counter, (unwrap) => ({
      increment: () => unwrap() + 1,
    }));

    counterActions.increment();
    expect(counter.unwrap()).toBe(1);
    expect(counterActions).not.toBe(counter);
  });

  it("should support multiple actions", () => {
    const counter = store(0);

    const counterActions = actions(counter, (unwrap) => ({
      increment: () => unwrap() + 1,
      multiply: (factor: number) => unwrap() * factor,
    }));

    counterActions.increment();
    expect(counter.unwrap()).toBe(1);

    counterActions.multiply(5);
    expect(counter.unwrap()).toBe(5);
  });

  it("toggle a boolean using a custom action", async () => {
    const lightSwitch = store(false);

    const lightSwitchActions = actions(lightSwitch, (unwrap) => ({
      toggle: () => !unwrap(),
    }));

    lightSwitchActions.toggle();
    expect(await lightSwitch).toBe(true);

    lightSwitchActions.toggle();
    expect(await lightSwitch).toBe(false);
  });
});
