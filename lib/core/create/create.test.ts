import { describe, expect, it, mock } from "bun:test";
import { create } from "./create";

describe("create", () => {
  it("can get and unwrap the initial value", () => {
    const testStore = create(42);
    expect(testStore.unwrap()).toBe(42);
  });

  it("notifies subscribers when a value is published", () => {
    const testStore = create<number>(42);
    let value = 0;

    const mockFn = mock((v) => {
      value = v;
    });

    testStore.subscribe(mockFn);
    testStore.publish(100);

    expect(mockFn).toHaveBeenCalled();
    expect(value).toBe(100);
  });

  it("toggle a boolean using a custom action", () => {
    // Example usage
    const lightSwitch = {
      ...create(false),
      toggle: () => {
        lightSwitch.publish(!lightSwitch.unwrap());
      },
    };

    lightSwitch.toggle();
    expect(lightSwitch.unwrap()).toBe(true);

    lightSwitch.toggle();
    expect(lightSwitch.unwrap()).toBe(false);
  });

  it("should block updates when store is closed", () => {
    const testStore = create<number>(42);
    let value = 0;

    const mockFn = mock((v) => {
      value = v;
    });

    testStore.subscribe(mockFn);
    testStore.close();
    testStore.publish(100);

    // When a store is subscribed it will always notify the subscriber of the current value
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(value).toBe(42);
  });
});
