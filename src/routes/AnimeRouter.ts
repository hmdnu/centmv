import { Env, TEnv } from "@/env";
import { AnimeService } from "@/services/AnimeService";
import { Hono } from "hono";

export class AnimeRouter {
  private app = new Hono<{ Bindings: TEnv }>();
  private anime: AnimeService;

  constructor(env: Env) {
    this.anime = new AnimeService(env);
    this.routes();
  }

  private routes() {
    this.app.get("/latest", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return await this.anime.getLatest(c);
    });

    this.app.get("/find", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return this.anime.find(c);
    });

    this.app.get("/genres", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"));
      return this.anime.getGenres(c);
    });

    this.app.get("/genre/:genre", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return this.anime.getByGenre(c);
    });

    this.app.get("/detail/:anime", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"));
      return this.anime.getDetail(c);
    });

    this.app.get("/complete", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return this.anime.getComplete(c);
    });

    this.app.get("/download/:type/:anime", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"));
      return this.anime.getDownload(c);
    });

    this.app.get("/list", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"));
      return this.anime.getAnimeList(c);
    });
  }

  getInstance() {
    return this.app;
  }
}
