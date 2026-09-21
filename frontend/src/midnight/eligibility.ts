export const MIN_SECRET_VALUE = 0n;
export const MAX_SECRET_VALUE = 65535n;
export const ELIGIBILITY_THRESHOLD = 18n;

export function validateSecretValue(secretValue: bigint): void {
  if (secretValue < MIN_SECRET_VALUE || secretValue > MAX_SECRET_VALUE) {
    throw new Error("Secret value must be between 0 and 65535.");
  }
}

export function meetsEligibilityThreshold(secretValue: bigint): boolean {
  validateSecretValue(secretValue);
  return secretValue >= ELIGIBILITY_THRESHOLD;
}