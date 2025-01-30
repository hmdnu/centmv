import { HttpRequest } from "@/cores/HttpRequest";
import { Env } from "@/env";
import { wrapPromise } from "@/utils/promise";
import { load as cheerioLoad } from "cheerio";
import {
  TBasicDetail,
  TComplete,
  TDetail,
  TDownload,
  TDownloadProvider,
  TDownloadUrl,
  TFind,
  TGenre,
  TGenreList,
  TGetByGenre,
  TGetLatest,
} from "./interface";
import { IAnime } from "@/webClient/interface";
import { UrlParser } from "@/utils/UrlParser";
import { SCRAPPING_CLASSES_OTAKUDESU as CLASS } from "@/constants";

export class OtakuDesu
  implements
    IAnime<TGetLatest, TGetByGenre, TComplete, TFind, TGenreList, TDetail>
{
  private httpRequest: HttpRequest;
  private loadHtml = cheerioLoad;
  private urlParser: UrlParser;

  constructor(env: Env) {
    this.httpRequest = new HttpRequest(env.get().OTAKU_DESU);
    this.urlParser = new UrlParser(env.get().OTAKU_DESU, env.get().BASE_URL);
  }

  async getLatest(page: number = 1) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/ongoing-anime/page/${page}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }

    const $ = this.loadHtml(String(res));
    const anime: TGetLatest[] = [];

    $(CLASS.CONTAINER).map((i, e) => {
      anime.push({
        name: $(e).find(CLASS.NAME).text().trim(),
        episode: parseInt(
          $(e).find(CLASS.EPISODE).text().replace("Episode", "").trim(),
        ),
        detail: this.urlParser.parseDetailUrl(
          $(e).find("a").attr("href") || "",
        ),
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

    const $ = this.loadHtml(String(res));
    const anime: TFind[] = [];

    $(CLASS.SEARCHED_ANIME).map((i, e) => {
      anime.push({
        name: $(e).text(),
        detail: this.urlParser.parseDetailUrl($(e).attr("href") || ""),
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
    const $ = this.loadHtml(String(res));
    const anime: TGetByGenre[] = [];

    $(CLASS.ANIME_BY_GENRE)
      .nextAll()
      .find(".col-anime")
      .map((i, e) => {
        const episode = $(e).find(".col-anime-eps").text();
        anime.push({
          name: $(e).find(".col-anime-title a").text(),
          episode: parseInt(episode) || 0,
          detail: this.urlParser.parseDetailUrl(
            $(e).find("a").attr("href") || "",
          ),
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
    const $ = this.loadHtml(String(res));
    const genres: TGenreList[] = [];

    $(CLASS.GENRES).map((i, e) => {
      const href = $(e).attr("href")?.replace("genres", "anime/genre") || "";
      genres.push({
        name: $(e).text(),
        href: this.urlParser.parseGenreUrl(href),
      });
    });

    return genres;
  }

  async getComplete(page: number) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/complete-anime/page/${page}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }
    const anime: TComplete[] = [];
    const $ = this.loadHtml(String(res));

    $(CLASS.CONTAINER).map((i, e) => {
      anime.push({
        name: $(e).find(CLASS.NAME).text().trim(),
        episode: parseInt(
          $(e).find(CLASS.EPISODE).text().replace("Episode", "").trim(),
        ),
        detail: this.urlParser.parseDetailUrl(
          $(e).find("a").attr("href") || "",
        ),
      });
    });

    return anime;
  }

  async getDetail(name: string) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/anime/${name}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }

    const $ = this.loadHtml(String(res));
    const synopsis: string[] = [];
    const downloadLinks: TDownload = this.extractDownlodLinks(res || "");
    const detail = this.extractDetail(res || "");
    const genres: TGenre[] = [];

    const anime: TDetail = {
      ...detail,
      genre: genres,
      synopsis,
      download: downloadLinks,
    };

    // scrape synopsis
    $(CLASS.SYNOPSIS).map((i, e) => {
      const text = $(e).text();
      synopsis.push(text === "" ? "none" : text);
    });

    // scrape genres
    $(CLASS.DETAIL)
      .last()
      .find("a")
      .map((i, e) => {
        genres.push({
          name: $(e).text(),
          detail: this.urlParser.parseGenreUrl($(e).attr("href") || ""),
        });
      });

    return anime;
  }

  private extractDownlodLinks(html: string) {
    const downloadLinks: TDownload = {
      batch: {
        episode: "",
        download: "",
      },
      episode: [],
    };

    const $ = this.loadHtml(html);

    // batch episode
    if ($(CLASS.DOWNLOAD_LINK_BATCH).contents().length === 0) {
      (downloadLinks.batch as unknown as string) = "Batch is not available yet";
    } else {
      $(CLASS.DOWNLOAD_LINK_BATCH).map((i, e) => {
        const episode = $(e).text();
        const download = this.urlParser.parseDownloadUrl(
          $(e).attr("href") || "",
        );
        downloadLinks.batch.episode = episode;
        downloadLinks.batch.download = download;
      });
    }

    // single episode
    $(CLASS.DOWNLOAD_LINK_EPISODE).map((i, e) => {
      downloadLinks.episode.push({
        episode: $(e).text(),
        download: this.urlParser.parseDownloadUrl($(e).attr("href") || ""),
      });
    });
    return downloadLinks;
  }

  private extractDetail(html: string) {
    // in order to get the detail dont change the order of the property
    const anime: TBasicDetail = {
      name: "",
      nameJapanese: "",
      score: 0,
      producer: "",
      type: "",
      status: "",
      totalEpisode: "",
      duration: "",
      releaseDate: "",
      studio: "",
    };

    const $ = this.loadHtml(html);
    // scrape detail from the web by order of the element because they dont provide class of each detail tag
    $(CLASS.DETAIL).map((i, e) => {
      const key = Object.keys(anime)[i] as keyof TBasicDetail;
      if (!key) {
        return;
      }
      const text = $(e)
        .contents()
        .filter((_, e) => e.type === "text")
        .text()
        .replace(/^:\s*/, "");

      anime[key] = text as never;
    });

    return anime;
  }

  async getDownloadBatch(anime: string) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/batch/${anime}`),
    );
  }

  async getDownload(type: string, anime: string) {
    const { res, err } = await wrapPromise(
      this.httpRequest.html(`/${type}/${anime}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const download = this.extractDownloadProviderUrl(String(res), type);
    const streamUrl = $(CLASS.IFRAME_CONTAINER).attr("src") || "";
    return {
      download,
      stream: streamUrl,
    };
  }

  private extractDownloadProviderUrl(html: string, type: string) {
    const downloads: TDownloadUrl[] = [];
    const $ = this.loadHtml(String(html));
    const downloadTypeClass = this.getDownloadTypeClass(type);

    $(downloadTypeClass).map((i, e) => {
      const providers: TDownloadProvider[] = [];

      $(e)
        .find(CLASS.DOWNLOADS.ANCHOR)
        .map((i, e) => {
          providers.push({ name: $(e).text(), url: $(e).attr("href") || "" });
        }),
        downloads.push({
          resolution: $(e).find(CLASS.DOWNLOADS.RESO).text(),
          size: $(e).find(CLASS.DOWNLOADS.SIZE).text(),
          providers,
        });
    });
    return downloads;
  }

  private getDownloadTypeClass(type: string) {
    if (type === "episode") {
      return CLASS.DOWNLOADS.EPISODE;
    } else if (type === "batch") {
      return CLASS.DOWNLOADS.BATCH;
    }
    return "<unknown type>";
  }
}
