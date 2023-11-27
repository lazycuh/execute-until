# execute-until [![](https://circleci.com/gh/babybeet/execute-until.svg?style=svg&logo=appveyor)](https://app.circleci.com/pipelines/github/babybeet/execute-until?branch=main)

A function that returns a promise that will only resolve when the predicate function resolves to `true` for async predicate or returns `true` for sync version. This is useful for cases when you need to perform some long running operation before proceeding.

The predicate function will be repeatedly called until it resolves to `true` which causes the asynchronous execution to proceed. By default, the predicate function is called every 500ms.

Please note that this function will reject when the predicate function throws an error/rejects at most 3 times.

## Table of contents

<!-- toc -->

- [Installation](#installation)
- [Example usage](#example-usage)

<!-- tocstop -->

## Installation

- `npm`

  ```
  npm i -S @babybeet/execute-until
  ```

- `pnpm`

  ```
  pnpm i -S @babybeet/execute-until
  ```

- `yarn`

  ```
  yarn add @babybeet/execute-until
  ```

## Example usage

```ts
import { executeUntil } from '@babybeet/execute-until';

...

await executeUntil(async () => {
  const batchOfDatabaseRows = await fetchNextBatchOfDatabaseRows();

  if (batchOfDatabaseRows.length === 0) {
    /**
     * This will cause `executeUntil()` to terminate.
     */
    return true;
  }

  doSomethingWithBatch(batchOfDatabaseRows);

  /**
   * This will cause `executeUntil()` to run the predicate again.
   */
  return false;
});

doSomethingElseAfterProcessingAllDatabaseRows();

...
```
