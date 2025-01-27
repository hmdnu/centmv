import { FetchError } from "ofetch";

export class ErrorFetcher extends FetchError {
  constructor(message: string) {
    super(message);
  }
}
