/**
 * Return a promise that will only resolve when the predicate function resolves to `true`.
 * The predicate function will be repeatedly called until it resolves to `true` which
 * causes the asynchronous execution to proceed. By default, the predicate function
 * is called every 500ms.
 *
 * Please note that this function will reject when the predicate
 * function throws an error at most 3 times.
 */
export async function executeUntil(predicate: () => Promise<boolean>, delayMs = 500) {
  let failureCount = 0;

  return predicate()
    .catch(() => {
      failureCount++;
      return false;
    })
    .then(result => {
      if (result) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        let isChecking = false;
        const maxFailureCount = 3;

        const interval = setInterval(async () => {
          if (isChecking) {
            return;
          }

          try {
            isChecking = true;

            if (await predicate()) {
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
