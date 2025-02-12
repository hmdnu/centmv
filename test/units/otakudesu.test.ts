import { Env, TEnv } from "@/env";
import { wrapPromise } from "@/utils/promise";
import * as _interface from "@/webClient/anime/otakudesu/interface";
import { OtakuDesu } from "@/webClient/anime/otakudesu/OtakuDesu";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { TestHelper } from "test/helpers/mock";

const env: TEnv = {
  BASE_URL: "base",
  OTAKU_DESU: "otakudesu",
  KUSONIME: "kusonime",
};
const otakuDesu = new OtakuDesu(new Env(env));
const testHelper = new TestHelper({
  env: new Env(env),
  targetClass: "otakudesu",
});

describe("OtakuDesu_getLatest", () => {
  it("should return latest anime", async () => {
    const mockLatest: _interface.TGetLatest[] = [
      { name: "name", detail: "detail", episode: 0 },
    ];
    await testHelper.wrapSuccessExpectation<_interface.TGetLatest[]>(
      "getLatest",
      otakuDesu.getLatest(),
      mockLatest,
    );
  });

  it("should return error not null when fail", async () => {
    await testHelper.wrapMockRejection("getLatest", otakuDesu.getLatest());
  });
});

// describe("OtakuDesu_find", () => {
//   it("should return found anime", async () => {
//     const mockData: _interface.TFind[] = [
//       { status: "status", name: "name", detail: "detail" },
//     ];
//     await testHelper.wrapSuccessExpectation<_interface.TFind[]>(
//       "find",
//       otakuDesu.find("animeTitle"),
//       mockData,
//     );
//   });

//   it("should return error not null when fail", async () => {
//     await testHelper.wrapMockRejection("find", otakuDesu.find("animeTitle"));
//   });
// });

// describe("OtakuDesu_getByGenre", () => {
//   it("should return anime by genre", async () => {
//     const mockData: _interface.TGetByGenre[] = [
//       { name: "name", detail: "detail", episode: 0, status: "status" },
//     ];
//     testHelper.wrapSuccessExpectation(
//       "getByGenre",
//       otakuDesu.getByGenre("genre", 0),
//       mockData,
//     );
//   });
// });
