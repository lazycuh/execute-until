export class TimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Operation did not complete within timeout limit of ${timeoutMs}ms`);
  }
}
