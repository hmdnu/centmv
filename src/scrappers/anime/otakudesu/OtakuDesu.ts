import { Env } from "@/env";
import { wrapPromise } from "@/utils/promise";
import { CheerioAPI, load as cheerioLoad } from "cheerio";
import * as _interface from "@/scrappers/interface";
import { IAnime } from "@/scrappers/interface";
import { UrlParserOtakudesu } from "@/utils/urlParser/UrlParserOtakudesu";
import { SCRAPPING_CLASSES_OTAKUDESU as CLASS } from "@/constants";
import { BaseAnimeSrapper } from "@/structs/BaseAnimeScrapper";
import { AnyNode } from "node_modules/domhandler/lib/esm/node";

export class OtakuDesu extends BaseAnimeSrapper implements IAnime {
  private loadHtml = cheerioLoad;
  private urlParser: UrlParserOtakudesu;

  constructor(env: Env) {
    super(env.get().OTAKU_DESU);
    this.urlParser = new UrlParserOtakudesu(
      env.get().OTAKU_DESU,
      env.get().BASE_URL,
    );
  }

  async getLatest(page: number = 1) {
    const { res, err } = await wrapPromise(
      this.html(`/ongoing-anime/page/${page}`),
    );
    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const anime: _interface.TGetLatest[] = [];
    $(CLASS.CONTAINER).map((i, e) => {
      anime.push({
        name: $(e).find(CLASS.NAME).text().trim(),
        episode: parseInt(
          $(e).find(CLASS.EPISODE).text().replace("Episode", "").trim(),
        ),
        img: $(e).find(CLASS.IMAGE).attr("src") || "<none>",
        detail: this.urlParser.parseDetailUrl(
          $(e).find("a").attr("href") || "<none>",
        ),
      });
    });

    return anime;
  }

  async find(animeTitle: string) {
    const { res, err } = await wrapPromise(
      this.html(`/?s=${animeTitle}&post_type=anime`),
    );

    if (err) {
      console.log(err);
      throw err;
    }

    const $ = this.loadHtml(String(res));
    const anime: _interface.TFind[] = [];

    $(CLASS.SEARCHED_ANIME).map((i, e) => {
      anime.push({
        name: $(e).text(),
        img: "",
        detail: this.urlParser.parseDetailUrl($(e).attr("href") || "<none>"),
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
      this.html(`/genres/${genre}/page/${page}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const anime: _interface.TGetByGenre[] = [];

    $(CLASS.ANIME_BY_GENRE)
      .nextAll()
      .find(".col-anime")
      .map((i, e) => {
        const episode = $(e).find(".col-anime-eps").text();
        anime.push({
          name: $(e).find(".col-anime-title a").text(),
          episode: parseInt(episode) || 0,
          img: $(e).find(".col-anime-cover img").attr("src") || "<none>",
          detail: this.urlParser.parseDetailUrl(
            $(e).find("a").attr("href") || "<none>",
          ),
          status:
            episode.toLowerCase() === "unknown eps" ? "ongoing" : "complete",
        });
      });

    return anime;
  }

  async getGenres() {
    const { res, err } = await wrapPromise(this.html("/genre-list"));
    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const genres: _interface.TGenreList[] = [];

    $(CLASS.GENRES).map((i, e) => {
      const href =
        $(e).attr("href")?.replace("genres", "anime/genre") || "<none>";
      genres.push({
        name: $(e).text(),
        href: this.urlParser.parseGenreUrl(href),
      });
    });

    return genres;
  }

  async getComplete(page: number) {
    const { res, err } = await wrapPromise(
      this.html(`/complete-anime/page/${page}`),
    );

    if (err) {
      console.error(err);
      throw err;
    }
    const anime: _interface.TComplete[] = [];
    const $ = this.loadHtml(String(res));

    $(CLASS.CONTAINER).map((i, e) => {
      anime.push({
        name: $(e).find(CLASS.NAME).text().trim(),
        episode: parseInt(
          $(e).find(CLASS.EPISODE).text().replace("Episode", "").trim(),
        ),
        img: $(e).find(CLASS.IMAGE).attr("src") || "<none>",
        detail: this.urlParser.parseDetailUrl(
          $(e).find("a").attr("href") || "<none>",
        ),
      });
    });

    return anime;
  }

  async getDetail(name: string) {
    const { res, err } = await wrapPromise(this.html(`/anime/${name}`));
    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const synopsis: string[] = [];
    const downloadLinks = this.extractDownlodLinks(res || "<none>");
    const detail = this.extractDetail(res || "<none>");
    const genres: _interface.TGenre[] = [];

    const anime: _interface.TDetail = {
      ...detail,
      img: $(".fotoanime img").attr("src") || "<none>",
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

  async getAnimeList() {
    const sortedList: _interface.TAnimeList[] = [];

    const { res, err } = await wrapPromise(this.html("/anime-list"));
    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const prefix: string[] = [];

    $(".barispenz a").map((i, e) => {
      prefix.push($(e).text().trim());
    });
    for (const p of prefix) {
      sortedList.push({ prefix: p, anime: [] });
    }
    const animeList: { name: string; detail: string }[] = [];
    $(".jdlbar ul li").map((i, e) => {
      animeList.push({
        name: $(e).find("a").text().trim(),
        detail: this.urlParser.parseDetailUrl(
          $(e).find("a").attr("href") || "<none>",
        ),
      });
    });

    for (const anime of animeList) {
      const firstLetter = anime.name[0].toUpperCase();
      const index = prefix.indexOf(firstLetter);
      if (index !== -1) {
        sortedList[index].anime.push(anime);
      }
    }
    return sortedList;
  }

  private extractDownlodLinks(html: string) {
    const downloadLinks: _interface.TDownload = {
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

        if (downloadLinks.batch) {
          downloadLinks.batch.episode = episode;
          downloadLinks.batch.download = download;
        }
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
    const anime: _interface.TBasicDetail = {
      name: "",
      type: "",
      status: "",
      releaseDate: "",
      studio: "",
    };

    const $ = this.loadHtml(html);
    $(CLASS.DETAIL).map((i, e) => {
      anime.name = this.splitColonStringDetail($, e, 0);
      anime.type = this.splitColonStringDetail($, e, 4);
      anime.status = this.splitColonStringDetail($, e, 5);
      anime.releaseDate = this.splitColonStringDetail($, e, 8);
      anime.studio = this.splitColonStringDetail($, e, 9);
    });

    return anime;
  }

  private splitColonStringDetail($: CheerioAPI, e: AnyNode, index: number) {
    return $(e).find(`p:nth(${index})`).text().split(":")[1].trim();
  }

  async getDownload(type: string, anime: string) {
    const { res, err } = await wrapPromise(this.html(`/${type}/${anime}`));

    if (err) {
      console.error(err);
      throw err;
    }
    const $ = this.loadHtml(String(res));
    const download = this.extractDownloadProviderUrl(String(res), type);
    const stream = $(CLASS.IFRAME_CONTAINER).attr("src") || "<none>";

    return { download, stream };
  }

  private extractDownloadProviderUrl(html: string, type: string) {
    const downloads: _interface.TDownloadUrl[] = [];
    const $ = this.loadHtml(String(html));
    const downloadTypeClass = this.getDownloadTypeClass(type);

    $(downloadTypeClass).map((i, e) => {
      const providers: _interface.TDownloadProvider[] = [];
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
