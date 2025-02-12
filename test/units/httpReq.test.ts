import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpRequest } from "@/cores/HttpRequest";
import { wrapPromise } from "@/utils/promise";

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

  it("should return html string in wrapped promise", async () => {
    const mockHtml = { res: "<html>", err: null };

    global.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockHtml), { status: 200 })),
    );
    const { res, err } = await wrapPromise(
      httpRequest.html("https://mockurl.com"),
    );
    expect(err).toBeNull();
    expect(res).toBeDefined();
    expect(res).toEqual(mockHtml);
  });

  it("should return valid error type when fetching html in wrapped promise", async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error()));

    const { res, err } = await wrapPromise(
      httpRequest.html("https://mockurl.com"),
    );

    expect(res).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeDefined();
    expect(err?.message).toSatisfy((err) => typeof err === "string");
  });
});
