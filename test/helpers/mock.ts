import { Env } from "@/env";
import { wrapPromise } from "@/utils/promise";
import { Kusonime } from "@/webClient/anime/kusonime/Kusonime";
import { OtakuDesu } from "@/webClient/anime/otakudesu/OtakuDesu";
import { vi, expect } from "vitest";

type TargetClass = OtakuDesu | Kusonime;

export class TestHelper {
  private env: Env;
  private classes = new Map<string, TargetClass>();
  private targetClass: string;

  constructor(params: { env: Env; targetClass: string }) {
    this.env = params.env;
    this.targetClass = params.targetClass.toLowerCase();
    this.mapClass();
  }

  private mapClass() {
    const classes = {
      otakudesu: new OtakuDesu(this.env),
      kusonime: new Kusonime(this.env),
    };
    for (const [key, value] of Object.entries(classes)) {
      this.classes.set(key, value);
    }
  }

  /**
   * wrapper to mock function and the return with all the types of the accepted argument
   */
  private wrapMockImplementation(method: keyof TargetClass, mockData: any) {
    const targetInstance = this.classes.get(this.targetClass);
    console.log(targetInstance);
    if (!targetInstance) {
      throw new Error("Invalid target class");
    }
    vi.spyOn(targetInstance, method).mockImplementation(async () => {
      return mockData;
    });
  }
  /**
   * wrapper to mock error when function is rejected
   * and check if the returned error of the wrapped promise matched the expected type
   */
  async wrapMockRejection(
    method: keyof TargetClass,
    promise: Promise<unknown>,
  ) {
    const targetInstance = this.classes.get(this.targetClass);
    if (!targetInstance) {
      throw new Error("Invalid target class");
    }
    vi.spyOn(targetInstance, method).mockRejectedValue(new Error());
    const { res, err } = await wrapPromise(promise);
    expect(res).toBeNull();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeDefined();
  }

  /**
   * mock resolved function and their types
   */
  async wrapSuccessExpectation<T>(
    methodName: keyof TargetClass,
    methodPromise: Promise<T>,
    mockData: T,
  ) {
    this.wrapMockImplementation(methodName, mockData);
    const { res, err } = await wrapPromise(methodPromise);
    expect(err).toBeNull();
    expect(res).toEqual(mockData);
    expect(res).toBeDefined();
  }
}
