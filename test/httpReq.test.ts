import { describe, it, expect, vi, expectTypeOf, beforeEach } from "vitest";
import { HttpRequest } from "@/cores/HttpRequest";
import { wrapPromise } from "@/utils/promise";
import { ofetch } from "node_modules/ofetch/dist/node.cjs";

describe("HttpRequest_html", () => {
  let httpRequest: HttpRequest;

  beforeEach(() => {
    httpRequest = new HttpRequest();
  });

  it("should return html string", async () => {
    const mockHtml = "<html>Mock Html</html>";
    global.fetch = vi.fn(() => Promise.resolve(new Response(mockHtml)));
    const html = await httpRequest.html("https://mockurl.com");
    expect(html).toBe(mockHtml);
  });

  it("should return valid type (string | null)", async () => {
    const html = await httpRequest.html("https://mockurl.com");
    expect(html).toSatisfy(
      (res) => typeof res === "string" || typeof res === null,
    );
  });
});
