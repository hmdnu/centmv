import { HttpRequest } from "@/cores/HttpRequest";

export abstract class BaseAnimeSrapper {
  private httpRequest: HttpRequest;

  constructor(baseUrl: string) {
    this.httpRequest = new HttpRequest(baseUrl);
  }

  protected async html(url: string) {
    return this.httpRequest.html(url);
  }
}
