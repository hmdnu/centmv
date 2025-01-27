import { ofetch } from "ofetch";

export class HttpRequest {
  private responseClient: string = "";
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "";
  }

  async html(url: string) {
    try {
      await this.fetcher(url);
      return this.responseClient;
    } catch (error) {
      throw error;
    }
  }

  private async fetcher(url: string) {
    try {
      this.responseClient = await ofetch(url, {
        method: "GET",
        baseURL: this.baseUrl,
      });
    } catch (error) {
      throw error;
    }
  }
}
