/**
 * Return a promise that will only resolve when the predicate function resolves to `true`
 * for async predicate or returns `true` for sync version. The predicate function will
 * be repeatedly called until it resolves to `true` which causes the asynchronous
 * execution to proceed. By default, the predicate function is called every 500ms.
 *
 * Please note that this function will reject when the predicate
 * function throws an error/rejects at most 3 times.
 */
export async function executeUntil(predicate: () => Promise<boolean> | boolean, delayMs = 500) {
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
        const maxFailureCount = 3;
        let isChecking = false;

        const interval = setInterval(async () => {
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

              reject(error);
            }
          }
        }, delayMs);
      });
    });
}
