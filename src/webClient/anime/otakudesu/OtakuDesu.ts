import { HttpRequest } from "@/cores/HttpRequest";
import { Env } from "@/env";
import { wrapPromise } from "@/utils/promise";
import * as cheerio from "cheerio";
import { TFind, TGenreList, TGetByGenre, TGetLatest } from "./interface";
import { IAnime } from "@/webClient/interface";

const classes = {
  CONTAINER: ".detpost",
  NAME: ".thumbz .jdlflm",
  EPISODE: ".epz",
  SEARCHED_ANIME: ".chivsrc h2 a",
  GENRES: ".genres li a",
  ANIME_BY_GENRE: ".venser .page div",
};

export class OtakuDesu
  implements IAnime<TGetLatest, TGetByGenre, any, TFind, TGenreList, any>
{
  private httpRequest: HttpRequest;
  private baseUrl: string;
  private otakuDesuUrl: string;

  constructor(env: Env) {
    this.baseUrl = env.get().BASE_URL;
    this.otakuDesuUrl = env.get().OTAKU_DESU;
    this.httpRequest = new HttpRequest(this.otakuDesuUrl);
  }

  async getLatest(page: number = 1) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/ongoing-anime/page/${page}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }

    const $ = cheerio.load(String(res));
    const anime: TGetLatest[] = [];

    $(classes.CONTAINER).map((i, e) => {
      anime.push({
        name: $(e).find(classes.NAME).text().trim(),
        episode: parseInt(
          $(e).find(classes.EPISODE).text().replace("Episode", "").trim(),
        ),
        href: this.parseUrl($(e).find("a").attr("href")),
      });
    });

    return anime;
  }

  async find(animeTitle: string) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/?s=${animeTitle}&post_type=anime`),
    );

    if (err) {
      console.log(err);
      throw err;
    }

    const $ = cheerio.load(res);
    const anime: TFind[] = [];

    $(classes.SEARCHED_ANIME).map((i, e) => {
      anime.push({
        name: $(e).text(),
        href: this.parseUrl($(e).attr("href")),
        status: $(e)
          .parent()
          .parent()
          .find("div:nth(1)")
          .text()
          .split(":")[1]
          .toLowerCase()
          .trim(),
      });
    });
    return anime;
  }
  async getByGenre(genre: string, page: number) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/genres/${genre}/page/${page}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }
    const $ = cheerio.load(res);
    const anime: TGetByGenre[] = [];

    $(classes.ANIME_BY_GENRE)
      .nextAll()
      .find(".col-anime")
      .map((i, e) => {
        const episode = $(e).find(".col-anime-eps").text();
        anime.push({
          name: $(e).find(".col-anime-title a").text(),
          episode: parseInt(episode) || 0,
          href: this.parseUrl($(e).find("a").attr("href")),
          status:
            episode.toLowerCase() === "unknown eps" ? "ongoing" : "complete",
        });
      });

    return anime;
  }

  async getGenres() {
    const { res, err } = await wrapPromise(
      this.httpRequest.html("/genre-list"),
    );

    if (err) {
      console.error(err);
      throw err;
    }
    const $ = cheerio.load(res);
    const genres: TGenreList[] = [];

    $(classes.GENRES).map((i, e) => {
      const href = $(e).attr("href")?.replace("genres", "anime/genre");
      genres.push({
        name: $(e).text(),
        href: this.parseUrl(href),
      });
    });

    return genres;
  }

  async getComplete() {}

  async getDetail(name: string) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/anime/${name}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }
  }

  private parseUrl(url: string | undefined): string {
    if (!url) {
      return "<none>";
    }
    if (!url.includes(this.otakuDesuUrl)) {
      return this.baseUrl + url.slice(0, -1);
    }
    const parsed = url.split(this.otakuDesuUrl)[1].slice(0, -1);
    return this.baseUrl + parsed;
  }
}
