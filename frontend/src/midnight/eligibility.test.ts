import { describe, expect, it } from "vitest";

import {
  ELIGIBILITY_THRESHOLD,
  MAX_SECRET_VALUE,
  MIN_SECRET_VALUE,
  meetsEligibilityThreshold,
  validateSecretValue,
} from "../midnight/eligibility";

describe("Private Eligibility Gate", () => {
  it("accepts the minimum supported private value", () => {
    expect(() => validateSecretValue(MIN_SECRET_VALUE)).not.toThrow();
  });

  it("accepts the maximum supported private value", () => {
    expect(() => validateSecretValue(MAX_SECRET_VALUE)).not.toThrow();
  });

  it("rejects a private value below the supported range", () => {
    expect(() => validateSecretValue(-1n)).toThrow(
      "Secret value must be between 0 and 65535.",
    );
  });

  it("rejects a private value above the supported range", () => {
    expect(() => validateSecretValue(65536n)).toThrow(
      "Secret value must be between 0 and 65535.",
    );
  });

  it("returns false when the private value is below the eligibility threshold", () => {
    expect(meetsEligibilityThreshold(ELIGIBILITY_THRESHOLD - 1n)).toBe(false);
  });

  it("returns true when the private value equals the eligibility threshold", () => {
    expect(meetsEligibilityThreshold(ELIGIBILITY_THRESHOLD)).toBe(true);
  });

  it("returns true when the private value is above the eligibility threshold", () => {
    expect(meetsEligibilityThreshold(25n)).toBe(true);
  });
});