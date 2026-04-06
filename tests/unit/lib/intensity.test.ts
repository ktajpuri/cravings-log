import { describe, it, expect } from "vitest";
import { getIntensityColor, getIntensityLabel } from "@/lib/intensity";

describe("getIntensityColor", () => {
  it("returns green for 1–2", () => {
    expect(getIntensityColor(1)).toBe("#22c55e");
    expect(getIntensityColor(2)).toBe("#22c55e");
  });

  it("returns lime for 3–4", () => {
    expect(getIntensityColor(3)).toBe("#84cc16");
    expect(getIntensityColor(4)).toBe("#84cc16");
  });

  it("returns yellow for 5–6", () => {
    expect(getIntensityColor(5)).toBe("#eab308");
    expect(getIntensityColor(6)).toBe("#eab308");
  });

  it("returns orange for 7–8", () => {
    expect(getIntensityColor(7)).toBe("#f97316");
    expect(getIntensityColor(8)).toBe("#f97316");
  });

  it("returns red for 9–10", () => {
    expect(getIntensityColor(9)).toBe("#ef4444");
    expect(getIntensityColor(10)).toBe("#ef4444");
  });
});

describe("getIntensityLabel", () => {
  it("labels 1–2 as Very mild", () => {
    expect(getIntensityLabel(1)).toBe("Very mild");
    expect(getIntensityLabel(2)).toBe("Very mild");
  });

  it("labels 3–4 as Mild", () => {
    expect(getIntensityLabel(3)).toBe("Mild");
    expect(getIntensityLabel(4)).toBe("Mild");
  });

  it("labels 5–6 as Moderate", () => {
    expect(getIntensityLabel(5)).toBe("Moderate");
    expect(getIntensityLabel(6)).toBe("Moderate");
  });

  it("labels 7–8 as Strong", () => {
    expect(getIntensityLabel(7)).toBe("Strong");
    expect(getIntensityLabel(8)).toBe("Strong");
  });

  it("labels 9–10 as Intense", () => {
    expect(getIntensityLabel(9)).toBe("Intense");
    expect(getIntensityLabel(10)).toBe("Intense");
  });
});
