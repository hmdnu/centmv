import { FetchError } from "node_modules/ofetch/dist/node.cjs";

type TPromise<T> = {
  res: T | null;
  err: Error | null;
};

export async function wrapPromise<T>(
  promise: Promise<T>,
): Promise<TPromise<T>> {
  try {
    const data = await promise;
    return { res: data, err: null };
  } catch (error) {
    if (error instanceof FetchError) {
      return { res: null, err: error };
    }
    if (error instanceof Error) {
      return { res: null, err: error };
    }
    return { res: null, err: new Error("<unknown error>") };
  }
}
