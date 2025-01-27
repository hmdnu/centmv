import { ErrorFetcher } from "./Error";

type TPromise<T> = {
  res: T | null;
  err: ErrorFetcher | Error | string | null;
};

export async function wrapPromise<T>(
  promise: Promise<T>,
): Promise<TPromise<T>> {
  try {
    const data = await promise;

    return { res: data, err: null };
  } catch (error) {
    if (error instanceof ErrorFetcher) {
      return { res: null, err: error };
    }
    if (error instanceof Error) {
      return { res: null, err: error };
    }
    return { res: null, err: "<Unknown Error>" };
  }
}
