import { ExecutionOptions } from './execution-options';
import { TimeoutError } from './timeout-error';

/**
 * Return a promise that will only resolve when the predicate function resolves to `true`
 * for async predicate or returns `true` for sync version. The predicate function will
 * be repeatedly called until it resolves to `true` which causes the asynchronous
 * execution to proceed. By default, the predicate function is called every 500ms and will throw `TimeoutError` if
 * `predicate` does not resolve to `true` within 30,000ms (30s).
 *
 * Please note that this function will reject when the predicate
 * function throws an error/rejects at most 3 times.
 */
export async function executeUntil(
  predicate: () => Promise<boolean> | boolean,
  executionOptions: ExecutionOptions = {}
) {
  executionOptions.delayMs ??= 500;
  executionOptions.timeoutMs ??= 30_000;

  /*
   * Make async and sync predicates compatible.
   */
  const executePredicate = async () => {
    return await predicate();
  };

  let failureCount = 0;

  return executePredicate()
    .catch(() => {
      failureCount++;

      return false;
    })
    .then(result => {
      if (result) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();
        const maxFailureCount = 3;
        let isChecking = false;

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const interval = setInterval(async () => {
          if (Date.now() - startTime >= executionOptions.timeoutMs!) {
            clearInterval(interval);
            reject(new TimeoutError(executionOptions.timeoutMs!));
          }

          if (isChecking) {
            return;
          }

          try {
            isChecking = true;

            if (await executePredicate()) {
              resolve();
              clearInterval(interval);
            }

            isChecking = false;
            failureCount = 0;
          } catch (error) {
            isChecking = false;
            failureCount++;

            if (failureCount === maxFailureCount) {
              clearInterval(interval);

              reject(error instanceof Error ? error : new Error(String(error)));
            }
          }
        }, executionOptions.delayMs);
      });
    });
}
