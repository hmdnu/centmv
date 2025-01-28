import { wrapPromise } from "@/utils/promise";
import { ofetch } from "ofetch";

export class HttpRequest {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "";
  }

  async html(url: string) {
    const { res, err } = await wrapPromise(this.fetcher(url));
    if (err) {
      throw err;
    }
    return res;
  }

  private async fetcher(url: string) {
    const { res, err } = await wrapPromise<string>(
      ofetch(url, {
        method: "GET",
        baseURL: this.baseUrl,
      }),
    );
    if (err) {
      throw err;
    }
    return res;
  }
}
