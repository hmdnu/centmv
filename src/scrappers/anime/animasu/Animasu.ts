import { HttpRequest } from "@/cores/HttpRequest";
import { IAnime } from "@/scrappers/interface";
import { Env } from "@/env";
import { load as cheerioLoad } from "cheerio";
import { wrapPromise } from "@/utils/promise";
import * as _interface from "@/scrappers/interface";
import { BaseAnimeSrapper } from "@/structs/BaseAnimeScrapper";
import { SCRAPPING_CLASSES_ANIMASU } from "@/constants";

export class Animasu
  extends BaseAnimeSrapper
  implements IAnime<any, any, any, any, any, any, any>
{
  private loadHtml = cheerioLoad;
  // private urlParser: UrlParser;
  private classes = SCRAPPING_CLASSES_ANIMASU;
  private env: Env;

  constructor(env: Env) {
    super(env.get().ANIMASU);
    this.env = env;
    // this.urlParser = new UrlParser(env.get().OTAKU_DESU, env.get().BASE_URL);
  }
  async getLatest(page: number) {
    const { res, err } = await wrapPromise(
      this.html(`/anime-sedang-tayang-terbaru/?halaman=${page}`),
    );
    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const anime: _interface.TGetLatest[] = [];

    $(this.classes.CARD).map((i, e) => {
      anime.push({
        name: $(e).find(this.classes.NAME).text().trim(),
        detail: this.parseDetail($(e).find("a").attr("href") || ""),
        episode: parseInt(
          $(e).find(this.classes.EPISODE).text().split(" ")[1].trim(),
        ),
        img: "",
      });
    });

    return anime;
  }

  private parseDetail(url: string) {
    const path = url.split(this.env.get().ANIMASU)[1].slice(0, -1);
    return this.env.get().BASE_URL + path + "?provider=animasu";
  }

  getByGenre(genre: string, page: number): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  getComplete(page: number): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  find(anime: string): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  getGenres(): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  getDetail(name: string) {
    const anime: _interface.TDetail = {
      genre: [],
      synopsis: [],
      download: {
        batch: null,
        episode: [],
      },
      name: "",
      // nameJapanese: "",
      // score: 0,
      // producer: "",
      type: "",
      status: "",
      // totalEpisode: "",
      // duration: "",
      releaseDate: "",
      studio: "",
    };

    return Promise.resolve(anime);
  }
  getDownload(type: string, anime: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
