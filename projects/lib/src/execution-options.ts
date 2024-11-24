export type ExecutionOptions = {
  /**
   * How long in milliseconds to wait between execution.
   */
  delayMs?: number;

  /**
   * The maximum milliseconds after which `TimeoutError` is thrown.
   */
  timeoutMs?: number;
};
