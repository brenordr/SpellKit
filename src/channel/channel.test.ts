import { describe, expect, it, mock } from "bun:test";
import { channel } from "./channel";

describe("channel", () => {
  it("notifies all subscribers when a value is published", () => {
    const testChannel = channel<number>();
    const mockFn = mock(() => {});

    testChannel.subscribe(mockFn);
    testChannel.publish(42);

    expect(mockFn).toHaveBeenCalled();
  });

  it("does not notify subscribers of values published before subscription", () => {
    const testChannel = channel<number>();
    let value = 0;

    const mockFn = mock((v) => {
      value = v;
    });

    testChannel.publish(42);
    testChannel.subscribe(mockFn);

    expect(mockFn).not.toHaveBeenCalled();
    expect(value).toBe(0);
  });
});
