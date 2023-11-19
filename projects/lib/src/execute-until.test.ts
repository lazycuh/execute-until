import { executeUntil } from './execute-until';

describe('executeUntil()', () => {
  const predicate = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('Should resolve when predicate resolves', async () => {
    predicate.mockResolvedValue(true);

    jest.advanceTimersByTimeAsync(1000);

    await executeUntil(predicate);

    expect(predicate).toHaveBeenCalledTimes(1);
  });

  it('Should execute until predicate resolves to true', async () => {
    predicate
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(false)
      .mockResolvedValueOnce(true);

    jest.advanceTimersByTimeAsync(20_000);

    await executeUntil(predicate);

    expect(predicate).toHaveBeenCalledTimes(4);
  });

  it('Should rejects if the predicate throws an error at most 3 times', async () => {
    predicate
      .mockRejectedValueOnce(new Error('Expected 1'))
      .mockRejectedValueOnce(new Error('Expected 2'))
      .mockRejectedValueOnce(new Error('Expected 3'))
      .mockRejectedValueOnce(new Error('Expected 4'));

    jest.advanceTimersByTimeAsync(20_000);

    await expect(executeUntil(predicate)).rejects.toThrow(new Error('Expected 3'));

    expect(predicate).toHaveBeenCalledTimes(3);
  });

  it('Should not reject if the predicate throws an error less than 3 times then returns true', async () => {
    predicate
      .mockRejectedValueOnce(new Error('Expected 1'))
      .mockRejectedValueOnce(new Error('Expected 2'))
      .mockResolvedValueOnce(true);

    jest.advanceTimersByTimeAsync(20_000);

    await executeUntil(predicate);

    expect(predicate).toHaveBeenCalledTimes(3);
  });
});
